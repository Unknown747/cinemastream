import { ExternalLink, Languages, Info } from "lucide-react";

type YouTubeAttributionProps = {
  videoId: string;
  channelName: string;
  channelId: string;
  hasOverride?: boolean;
};

/**
 * Attribution + transparency block shown on each drama detail page.
 * Helps avoid auto-aggregator (AGC) penalties by clearly labelling the
 * content source and translation method.
 */
export function YouTubeAttribution({
  videoId,
  channelName,
  channelId,
  hasOverride,
}: YouTubeAttributionProps) {
  return (
    <div
      className="mt-6 rounded-xl border border-border/60 bg-card/30 p-5 text-sm"
      role="note"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Info className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-2 text-foreground/80 leading-relaxed">
          <p>
            Video di-embed langsung dari YouTube — kami tidak menyimpan, mengunggah
            ulang, atau memodifikasi video. Hak cipta sepenuhnya milik kreator
            asal.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer external"
              className="inline-flex items-center gap-1 text-primary hover:underline"
              data-testid="link-youtube-source"
            >
              <ExternalLink className="h-3 w-3" />
              Sumber asli di YouTube
            </a>
            <a
              href={`https://www.youtube.com/channel/${channelId}`}
              target="_blank"
              rel="noopener noreferrer external"
              className="inline-flex items-center gap-1 text-foreground/70 hover:text-foreground"
              data-testid="link-youtube-channel-source"
            >
              <ExternalLink className="h-3 w-3" />
              Channel kreator: {channelName}
            </a>
          </div>
          {hasOverride && (
            <p className="inline-flex items-start gap-2 rounded-md bg-primary/10 px-2 py-1 text-xs text-foreground/85">
              <Languages className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              <span>
                Judul ditampilkan dalam Bahasa Indonesia hasil terjemahan AI
                dari judul Mandarin asli. Jika kurang akurat, judul asli tetap
                tersedia di tautan YouTube di atas.
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
