import { useState } from "react";
import { Play, Monitor, Maximize2, Volume2 } from "lucide-react";

interface Props {
  videoId: string;
  title: string;
  channelName?: string | null;
  thumbnailUrl?: string | null;
  publishedDate?: string;
}

export function StreamingPlayer({
  videoId,
  title,
  channelName,
  thumbnailUrl,
  publishedDate,
}: Props) {
  const [playing, setPlaying] = useState(false);

  const poster =
    thumbnailUrl ||
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&playsinline=1&iv_load_policy=3&color=white&cc_load_policy=0&fs=1`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
      <div className="relative aspect-video w-full bg-black">
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full focus:outline-none"
            aria-label={`Putar ${title}`}
            data-testid="button-play-video"
          >
            <img
              src={poster}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              loading="eager"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = "1";
                  img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                }
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/85" />

            <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                <Monitor className="h-3.5 w-3.5 text-primary" />
                <span>CinemaStream</span>
                <span className="hidden text-white/40 sm:inline">·</span>
                <span className="hidden text-white/60 sm:inline">
                  Now Playing
                </span>
              </div>
              <div className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/70 sm:flex">
                <span className="rounded bg-white/10 px-1.5 py-0.5">HD</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5">SUB</span>
                <span className="rounded bg-primary/90 px-1.5 py-0.5 text-black">
                  ID
                </span>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/95 text-black shadow-2xl shadow-primary/40 transition-all duration-300 group-hover:scale-110 sm:h-24 sm:w-24">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                  <Play className="relative h-8 w-8 fill-black sm:h-10 sm:w-10" />
                </span>
                <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/85 backdrop-blur-sm">
                  Klik untuk menonton
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 sm:px-6 sm:pb-5">
              <h2 className="line-clamp-2 font-serif text-lg leading-tight text-white sm:text-2xl">
                {title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70">
                {channelName && (
                  <span className="font-medium text-white/85">
                    {channelName}
                  </span>
                )}
                {publishedDate && (
                  <>
                    <span className="text-white/30">·</span>
                    <span>{publishedDate}</span>
                  </>
                )}
                <span className="text-white/30">·</span>
                <span className="inline-flex items-center gap-1">
                  <Volume2 className="h-3 w-3" /> Audio Mandarin
                </span>
                <span className="text-white/30">·</span>
                <span className="inline-flex items-center gap-1">
                  <Maximize2 className="h-3 w-3" /> Layar Penuh
                </span>
              </div>
            </div>
          </button>
        ) : (
          <iframe
            key={videoId}
            src={embedSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 bg-gradient-to-r from-black via-zinc-950 to-black px-4 py-2.5 text-[11px] uppercase tracking-wider text-white/55 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Streaming Aktif
          </span>
          <span className="hidden text-white/30 sm:inline">·</span>
          <span className="hidden sm:inline">Kualitas Otomatis</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Sub Indonesia</span>
          <span className="text-white/30">·</span>
          <span>CinemaStream Player</span>
        </div>
      </div>
    </div>
  );
}
