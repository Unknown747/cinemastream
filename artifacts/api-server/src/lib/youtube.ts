interface ChannelInfo {
  channelId: string;
  handle: string;
  name: string;
  thumbnailUrl: string | null;
}

export interface RssVideo {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  channelName: string;
  channelId: string;
}

const YT_BASE = "https://www.youtube.com";
const RSS_URL = (channelId: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function normalizeHandle(input: string): string {
  let h = input.trim();
  // Allow full URL
  if (h.startsWith("http")) {
    try {
      const u = new URL(h);
      const seg = u.pathname.split("/").filter(Boolean)[0] ?? "";
      if (seg.startsWith("@")) h = seg;
      else if (seg === "channel") {
        // /channel/UC...
        const id = u.pathname.split("/")[2] ?? "";
        h = id.startsWith("UC") ? id : seg;
      } else {
        h = `@${seg.replace(/^@/, "")}`;
      }
    } catch {
      // ignore
    }
  }
  if (!h.startsWith("@") && !h.startsWith("UC")) h = `@${h}`;
  return h;
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function pickXmlField(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  return m ? m[1].trim() : "";
}

function pickXmlAttr(block: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}="([^"]+)"`, "i");
  const m = block.match(re);
  return m ? m[1] : "";
}

/**
 * Resolve a YouTube handle (e.g. "@miniseries_magic") or a channel ID
 * (UCxxxx) to full channel info by scraping the channel page.
 */
export async function resolveChannel(input: string): Promise<ChannelInfo> {
  const handle = normalizeHandle(input);
  const url = handle.startsWith("UC")
    ? `${YT_BASE}/channel/${handle}`
    : `${YT_BASE}/${handle}`;

  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
  });
  if (!res.ok) {
    throw new Error(`Channel lookup failed: HTTP ${res.status}`);
  }
  const html = await res.text();

  const channelId =
    html.match(/"externalId":"(UC[^"]+)"/)?.[1] ??
    html.match(/"channelId":"(UC[^"]+)"/)?.[1];
  if (!channelId) {
    throw new Error("Could not find channel ID for that handle/URL");
  }

  const name =
    unescapeHtml(html.match(/"title":"([^"]+)","navigationEndpoint"/)?.[1] ?? "") ||
    unescapeHtml(html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? "") ||
    handle;

  const thumbnailUrl =
    html.match(/"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/)?.[1]?.replace(/\\u0026/g, "&") ??
    html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ??
    null;

  const resolvedHandle = handle.startsWith("UC")
    ? unescapeHtml(html.match(/"canonicalChannelUrl":"https?:\/\/www\.youtube\.com\/(@[^"]+)"/)?.[1] ?? handle)
    : handle;

  return { channelId, handle: resolvedHandle, name, thumbnailUrl };
}

/**
 * Fetch the latest videos for a channel via the public RSS feed.
 * No API key required. Returns the most recent ~15 videos.
 */
export async function fetchChannelVideos(channelId: string): Promise<RssVideo[]> {
  const res = await fetch(RSS_URL(channelId), {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) {
    throw new Error(`RSS fetch failed: HTTP ${res.status}`);
  }
  const xml = await res.text();

  const channelName = unescapeHtml(
    xml.match(/<author>[\s\S]*?<name>([^<]+)<\/name>/)?.[1] ?? "",
  );

  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const out: RssVideo[] = [];
  for (const entry of entries) {
    const videoId = pickXmlField(entry, "yt:videoId");
    if (!videoId) continue;
    const title = unescapeHtml(pickXmlField(entry, "title"));
    const publishedAt = pickXmlField(entry, "published");
    const description = unescapeHtml(
      pickXmlField(entry, "media:description") ||
        pickXmlField(entry, "summary"),
    );
    const thumbnailUrl =
      pickXmlAttr(entry, "media:thumbnail", "url") ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    out.push({
      videoId,
      title,
      description,
      publishedAt,
      thumbnailUrl,
      channelId,
      channelName,
    });
  }
  return out;
}

interface CacheEntry {
  expiresAt: number;
  data: RssVideo[];
}
const VIDEO_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchChannelVideosCached(
  channelId: string,
): Promise<RssVideo[]> {
  const now = Date.now();
  const hit = VIDEO_CACHE.get(channelId);
  if (hit && hit.expiresAt > now) return hit.data;
  try {
    const data = await fetchChannelVideos(channelId);
    VIDEO_CACHE.set(channelId, { data, expiresAt: now + CACHE_TTL_MS });
    return data;
  } catch (err) {
    if (hit) return hit.data;
    throw err;
  }
}

export function invalidateVideoCache(channelId?: string): void {
  if (channelId) VIDEO_CACHE.delete(channelId);
  else VIDEO_CACHE.clear();
}
