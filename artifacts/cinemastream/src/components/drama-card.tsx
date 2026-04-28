import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "wouter";
import { Bookmark, BookmarkCheck, Play } from "lucide-react";
import {
  isInWatchlist,
  toggleWatchlist,
  subscribeWatchlist,
  getResumePosition,
  subscribeHistory,
  getHistory,
} from "@/lib/storage";
import { detectTags } from "@/lib/video-meta";

type DramaCardVideo = {
  videoId: string;
  title: string;
  originalTitle?: string;
  channelId: string;
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
  type = "Film",
}: DramaCardProps) {
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sync = () => {
      setSaved(isInWatchlist(video.videoId));
      const pos = getResumePosition(video.videoId);
      const hist = getHistory().find((h) => h.videoId === video.videoId);
      const dur = hist?.durationSec ?? 0;
      setProgress(dur > 0 && pos > 0 ? Math.min(1, pos / dur) : 0);
    };
    sync();
    const off1 = subscribeWatchlist(sync);
    const off2 = subscribeHistory(sync);
    return () => {
      off1();
      off2();
    };
  }, [video.videoId]);

  const tags = detectTags(video);

  const onToggleSave = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist({
      videoId: video.videoId,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      channelId: video.channelId,
      channelName: video.channelName,
    });
  };

  const year = new Date(video.publishedAt).getFullYear();
  const titleClass =
    size === "lg"
      ? "text-base leading-snug"
      : size === "sm"
        ? "text-xs leading-snug"
        : "text-sm leading-snug";
  return (
    <article className="group relative">
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
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />

          {/* Top-left badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {video.hasOverride && (
              <span className="rounded bg-primary/95 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow">
                Sub Indo
              </span>
            )}
            {tags.isTrailer && (
              <span className="rounded bg-amber-500/95 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black shadow">
                Trailer
              </span>
            )}
            {tags.partNumber !== null && !tags.isTrailer && (
              <span className="rounded bg-blue-500/95 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
                Part {tags.partNumber}
              </span>
            )}
          </div>

          {/* Resume progress bar */}
          {progress > 0.02 && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                <Play className="h-2.5 w-2.5 fill-current" />
                Lanjut
              </span>
            </>
          )}

          {/* Bookmark button */}
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={saved ? "Hapus dari Daftar Tonton" : "Simpan ke Daftar Tonton"}
            aria-pressed={saved}
            className={`absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition ${
              saved
                ? "bg-primary text-primary-foreground"
                : "bg-black/55 text-white opacity-0 group-hover:opacity-100 focus:opacity-100"
            }`}
            data-testid={`button-bookmark-${video.videoId}`}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
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
