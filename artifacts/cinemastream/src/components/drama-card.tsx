import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";

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
};

function formatRelative(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "Hari ini";
  if (diff < 2 * day) return "Kemarin";
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
  index = 0,
  size = "md",
  showChannel = true,
}: DramaCardProps) {
  const titleClass =
    size === "lg"
      ? "text-base sm:text-lg leading-tight"
      : size === "sm"
        ? "text-xs leading-snug"
        : "text-sm leading-snug";
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative"
    >
      <Link
        href={`/drama/${video.videoId}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        data-testid={`link-drama-card-${video.videoId}`}
      >
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-border/60 group-hover:ring-primary/50 transition-all">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-95 group-hover:opacity-100 transition-opacity" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
            {video.hasOverride ? (
              <span className="rounded-md bg-primary/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-lg">
                Sub Indo
              </span>
            ) : (
              <span />
            )}
            <span className="inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur px-1.5 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-white/10">
              <Clock className="h-2.5 w-2.5" />
              {formatRelative(video.publishedAt)}
            </span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/95 shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground translate-x-0.5" />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3
              className={`font-semibold text-white ${titleClass} line-clamp-2 drop-shadow`}
            >
              {video.title}
            </h3>
            {showChannel && (
              <p className="mt-1 text-[11px] text-white/70 truncate">
                {video.channelName}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
