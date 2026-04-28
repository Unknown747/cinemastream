import { useEffect, useRef, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";

type DramaReviewProps = {
  videoId: string;
  title: string;
  channelName?: string | null;
  synopsis?: string | null;
};

type ReviewResponse = {
  videoId: string;
  review: string;
  generatedAt: string | null;
  model: string;
};

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; data: ReviewResponse }
  | { kind: "error"; message: string };

const SECTION_ID = "review-lengkap";

/**
 * Renders a long-form, AI-generated Indonesian review for a video.
 * - Lazy loaded via IntersectionObserver — no API call until user scrolls near it
 * - Caches across page navigations via sessionStorage (server already caches forever)
 * - Splits the review at the third heading and embeds an in-article ad mid-content
 */
export function DramaReview({
  videoId,
  title,
  channelName,
  synopsis,
}: DramaReviewProps) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const cacheKey = `cs:review:${videoId}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = window.sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as ReviewResponse;
        setState({ kind: "ready", data: parsed });
        startedRef.current = true;
        return;
      } catch {
        /* ignore */
      }
    }

    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            obs.disconnect();
            void load();
            break;
          }
        }
      },
      { rootMargin: "400px" },
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  async function load(force = false) {
    setState({ kind: "loading" });
    try {
      const params = new URLSearchParams({ title });
      if (channelName) params.set("channelName", channelName);
      if (synopsis) params.set("synopsis", synopsis);
      const url = `/api/videos/${encodeURIComponent(videoId)}/review?${params.toString()}`;
      const res = await fetch(url, {
        headers: force ? { "Cache-Control": "no-cache" } : {},
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error ?? `Gagal memuat review (${res.status})`,
        );
      }
      const data = (await res.json()) as ReviewResponse;
      try {
        window.sessionStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {
        /* quota — ignore */
      }
      setState({ kind: "ready", data });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Gagal memuat review",
      });
    }
  }

  return (
    <section
      ref={containerRef}
      id={SECTION_ID}
      className="mt-8 scroll-mt-24"
      aria-labelledby={`${SECTION_ID}-heading`}
      data-testid="drama-review-section"
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2
          id={`${SECTION_ID}-heading`}
          className="font-serif text-xl text-foreground"
        >
          Review lengkap
        </h2>
      </div>

      {state.kind === "idle" || state.kind === "loading" ? (
        <ReviewSkeleton />
      ) : state.kind === "error" ? (
        <ReviewError message={state.message} onRetry={() => load(true)} />
      ) : (
        <ReviewBody markdown={state.data.review} />
      )}
    </section>
  );
}

function ReviewSkeleton() {
  return (
    <div
      className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-5"
      aria-label="Memuat review"
    >
      <div className="h-5 w-1/3 animate-pulse rounded bg-foreground/10" />
      <div className="h-3 w-full animate-pulse rounded bg-foreground/10" />
      <div className="h-3 w-11/12 animate-pulse rounded bg-foreground/10" />
      <div className="h-3 w-10/12 animate-pulse rounded bg-foreground/10" />
      <div className="h-5 w-1/4 animate-pulse rounded bg-foreground/10" />
      <div className="h-3 w-full animate-pulse rounded bg-foreground/10" />
      <div className="h-3 w-9/12 animate-pulse rounded bg-foreground/10" />
    </div>
  );
}

function ReviewError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/30 p-5 text-sm text-foreground/70">
      <p className="mb-2">Review belum bisa ditampilkan: {message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-card/50 px-3 py-1.5 text-xs hover:border-primary/40 hover:text-foreground"
        data-testid="button-review-retry"
      >
        <RefreshCw className="h-3 w-3" /> Coba lagi
      </button>
    </div>
  );
}

/**
 * Lightweight Markdown renderer for the constrained format the AI returns:
 * `## headings`, paragraphs, and `- ` bullet lists. We split the rendered
 * blocks at index 4 (between section 2 and 3) and inject an in-article ad.
 */
function ReviewBody({ markdown }: { markdown: string }) {
  const blocks = parseMarkdownBlocks(markdown);
  const splitIdx = Math.min(
    Math.max(2, Math.floor(blocks.length / 2)),
    blocks.length - 1,
  );

  return (
    <article className="rounded-xl border border-border/60 bg-card/30 p-5 text-foreground/90">
      <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-lg prose-p:leading-relaxed prose-p:text-foreground/85 prose-li:text-foreground/85 prose-strong:text-foreground">
        {blocks.slice(0, splitIdx).map((b, i) => (
          <RenderBlock key={`a-${i}`} block={b} />
        ))}
      </div>

      <AdSlot
        slot={import.meta.env.VITE_ADSENSE_SLOT_IN_ARTICLE}
        format="fluid"
        layout="in-article"
        className="my-6"
      />

      <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-lg prose-p:leading-relaxed prose-p:text-foreground/85 prose-li:text-foreground/85 prose-strong:text-foreground">
        {blocks.slice(splitIdx).map((b, i) => (
          <RenderBlock key={`b-${i}`} block={b} />
        ))}
      </div>

      <p className="mt-6 border-t border-border/40 pt-3 text-[11px] text-foreground/40">
        Review ini ditulis otomatis oleh AI berdasarkan judul drama. Detail cerita yang
        spesifik mungkin berbeda dengan isi video.
      </p>
    </article>
  );
}

type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function parseMarkdownBlocks(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    // Collect paragraph lines until blank/heading/bullet.
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("- ")
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: buf.join(" ").trim() });
  }
  return blocks;
}

function RenderBlock({ block }: { block: Block }) {
  if (block.type === "h2") {
    return <h2>{renderInline(block.text)}</h2>;
  }
  if (block.type === "ul") {
    return (
      <ul>
        {block.items.map((it, i) => (
          <li key={i}>{renderInline(it)}</li>
        ))}
      </ul>
    );
  }
  return <p>{renderInline(block.text)}</p>;
}

/**
 * Render minimal inline Markdown: **bold** and *italic*. Plain text otherwise.
 */
function renderInline(text: string) {
  const parts: Array<string | { kind: "b" | "i"; text: string }> = [];
  const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
    if (m[2]) parts.push({ kind: "b", text: m[2] });
    else if (m[4]) parts.push({ kind: "i", text: m[4] });
    lastIdx = re.lastIndex;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts.map((p, i) =>
    typeof p === "string" ? (
      <span key={i}>{p}</span>
    ) : p.kind === "b" ? (
      <strong key={i}>{p.text}</strong>
    ) : (
      <em key={i}>{p.text}</em>
    ),
  );
}
