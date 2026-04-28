/**
 * Clean a YouTube video description so visitor-facing pages don't show channel
 * boilerplate (creator declarations, EDSA notices, channel-wide legal blocks,
 * social link dumps, hashtag walls). The output is the meaningful first part
 * of the description, suitable for SEO and reading.
 *
 * The original (uncleaned) description is preserved separately so admins can
 * still see and override it.
 */

const BOILERPLATE_HEADINGS = [
  /^【\s*(Pernyataan|Pemberitahuan|Disclaimer|创作者声明|声明|Penolakan)[^】]*】/i,
  /^\[\s*(Pernyataan|Disclaimer|Notice)[^\]]*\]/i,
  /^(disclaimer|copyright notice|copyright disclaimer)[:：]/i,
];

const BOILERPLATE_LINE_PATTERNS = [
  /\bEDSA\b.*YouTube/i,
  /YouTube.*\bEDSA\b/i,
  /Penayangan dilarang keras bagi mereka yang berusia di bawah/i,
  /^\s*\d+\.\s*(Sifat Konten|Perlindungan Anak|Hak Cipta|Kepatuhan|Pernyataan)/i,
  /^#[\w\d_]+(\s+#[\w\d_]+){2,}\s*$/, // hashtag wall (3+ hashtags only)
  /^https?:\/\/\S+\s*$/i, // bare URL line
  /^(subscribe|please subscribe|like.*share.*subscribe|follow us)/i,
];

const SUBSCRIBE_BLOCK = /\b(please\s+)?(subscribe|like\s+and\s+subscribe|don't forget to subscribe|follow my channel)[^.]*\.?/gi;

function stripChannelPrefix(text: string, channelName?: string | null): string {
  if (!channelName) return text;
  const escaped = channelName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Remove leading "ChannelName — " or "ChannelName: " or "ChannelName |"
  const re = new RegExp(`^\\s*${escaped}\\s*[—\\-:|·]\\s*`, "i");
  return text.replace(re, "");
}

export function cleanVideoDescription(
  raw: string | null | undefined,
  channelName?: string | null,
): string {
  if (!raw) return "";
  let text = raw.replace(/\r\n/g, "\n").trim();

  text = stripChannelPrefix(text, channelName);

  // Drop everything from the first boilerplate heading onward.
  const lines = text.split("\n");
  const kept: string[] = [];
  let stopped = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (BOILERPLATE_HEADINGS.some((re) => re.test(trimmed))) {
      stopped = true;
      break;
    }
    if (BOILERPLATE_LINE_PATTERNS.some((re) => re.test(trimmed))) {
      // Skip the line but keep scanning
      continue;
    }
    kept.push(line);
  }

  let cleaned = kept.join("\n").trim();
  cleaned = cleaned.replace(SUBSCRIBE_BLOCK, "").trim();
  // Collapse 3+ consecutive blank lines to 2.
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  // Strip trailing hashtag wall.
  cleaned = cleaned.replace(/(\n\s*#[\w\d_]+(\s+#[\w\d_]+)*\s*)+$/g, "").trim();

  // If after cleaning we have very little content left and the original was
  // mostly boilerplate, return "" so the UI can show its friendly fallback.
  if (cleaned.length < 20 && stopped) return "";

  return cleaned;
}

/**
 * Returns just the first paragraph (or first ~300 chars) for previews/cards.
 */
export function descriptionPreview(text: string, max = 280): string {
  if (!text) return "";
  const firstPara = text.split(/\n{2,}/)[0]?.trim() ?? "";
  if (firstPara.length <= max) return firstPara;
  return firstPara.slice(0, max - 1).trimEnd() + "…";
}
