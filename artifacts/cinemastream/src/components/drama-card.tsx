import { Link } from "wouter";

type DramaCardVideo = {
  videoId: string;
  title: string;
  originalTitle?: string;
  channelName: string;
  thumbnailUrl: string;
  publishedAt: string;
  hasOverride?: boolean;
};

type DramaCardProps = {
  video: DramaCardVideo;
  index?: number;
  size?: "sm" | "md" | "lg";
  showChannel?: boolean;
  type?: string;
};

function formatRelative(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) {
    const m = Math.max(1, Math.floor(diff / minute));
    return `${m} menit lalu`;
  }
  if (diff < day) return `${Math.floor(diff / hour)} jam lalu`;
  if (diff < 2 * day) return "1 hari lalu";
  if (diff < 7 * day) return `${Math.floor(diff / day)} hari lalu`;
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))} minggu lalu`;
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))} bulan lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
  });
}

export function DramaCard({
  video,
  index: _index = 0,
  size = "md",
  showChannel: _showChannel = true,
  type = "Drama",
}: DramaCardProps) {
  const year = new Date(video.publishedAt).getFullYear();
  const titleClass =
    size === "lg"
      ? "text-base leading-snug"
      : size === "sm"
        ? "text-xs leading-snug"
        : "text-sm leading-snug";
  return (
    <article className="group">
      <Link
        href={`/drama/${video.videoId}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        data-testid={`link-drama-card-${video.videoId}`}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-secondary">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          {video.hasOverride && (
            <span className="absolute left-2 top-2 rounded bg-primary/95 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow">
              Sub Indo
            </span>
          )}
        </div>
        <div className="pt-2">
          <h3
            className={`font-semibold text-foreground ${titleClass} line-clamp-2`}
          >
            {video.title}
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground leading-tight">
            <span className="text-primary font-medium">{year}</span>
            <span className="mx-1.5 opacity-60">·</span>
            <span>{type}</span>
            <span className="mx-1.5 opacity-60">·</span>
            <span>{formatRelative(video.publishedAt)}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
