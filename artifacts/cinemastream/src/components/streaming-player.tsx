import { useEffect, useRef, useState } from "react";
import { Play, Monitor, Maximize2, Volume2 } from "lucide-react";

interface Props {
  videoId: string;
  title: string;
  channelName?: string | null;
  thumbnailUrl?: string | null;
  publishedDate?: string;
}

type CaptionTrack = {
  languageCode: string;
  languageName?: string;
  displayName?: string;
  is_translateable?: boolean;
  isTranslateable?: boolean;
  kind?: string;
  vss_id?: string;
};

type YTPlayer = {
  loadModule: (mod: string) => void;
  unloadModule: (mod: string) => void;
  setOption: (mod: string, opt: string, value: unknown) => void;
  getOption: (mod: string, opt: string) => unknown;
  getOptions: (mod?: string) => string[];
  destroy: () => void;
  addEventListener: (ev: string, fn: (e: unknown) => void) => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        cfg: Record<string, unknown>,
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise<void>((resolve) => {
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevReady?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

function tryEnableIndonesianCaptions(player: YTPlayer) {
  try {
    player.loadModule("captions");
  } catch {
    /* noop */
  }

  const apply = () => {
    try {
      player.loadModule("captions");
      const tracksRaw = player.getOption("captions", "tracklist");
      const tracks: CaptionTrack[] = Array.isArray(tracksRaw)
        ? (tracksRaw as CaptionTrack[])
        : [];

      // 1) If a real Indonesian track exists, just use it.
      const idTrack = tracks.find(
        (t) => t.languageCode?.toLowerCase() === "id",
      );
      if (idTrack) {
        player.setOption("captions", "track", { languageCode: "id" });
        player.setOption("captions", "reload", true);
        return;
      }

      // 2) Otherwise pick a source track and ask YouTube to auto-translate it
      //    to Indonesian. Prefer Chinese (zh*) since most channels we follow
      //    are Mandarin; fall back to whatever track is available.
      const source =
        tracks.find((t) => t.languageCode?.toLowerCase().startsWith("zh")) ||
        tracks.find((t) => t.languageCode?.toLowerCase().startsWith("en")) ||
        tracks[0];

      if (source) {
        player.setOption("captions", "track", {
          languageCode: source.languageCode,
          translationLanguage: {
            languageCode: "id",
            languageName: "Indonesian",
          },
        });
        player.setOption("captions", "reload", true);
      }
    } catch {
      /* captions module may not be ready yet */
    }
  };

  // Try a few times because the captions module needs the video to start
  // playing before tracklist is populated.
  const timers = [400, 1200, 2500, 5000];
  timers.forEach((t) => setTimeout(apply, t));
}

export function StreamingPlayer({
  videoId,
  title,
  channelName,
  thumbnailUrl,
  publishedDate,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  const poster =
    thumbnailUrl ||
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  // Mount the YouTube IFrame Player once user clicks play.
  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    let player: YTPlayer | null = null;

    loadYouTubeAPI().then(() => {
      if (cancelled || !containerRef.current || !window.YT?.Player) return;
      const target = document.createElement("div");
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(target);

      player = new window.YT.Player(target, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          fs: 1,
          cc_load_policy: 1,
          cc_lang_pref: "id",
          hl: "id",
        },
        events: {
          onReady: (e: unknown) => {
            const p = (e as { target: YTPlayer }).target;
            playerRef.current = p;
            tryEnableIndonesianCaptions(p);
          },
          onStateChange: (e: unknown) => {
            const ev = e as { data: number; target: YTPlayer };
            if (ev.data === window.YT?.PlayerState.PLAYING) {
              tryEnableIndonesianCaptions(ev.target);
            }
          },
        },
      });

      // Style the iframe to fill its parent.
      const obs = new MutationObserver(() => {
        const iframe = target.tagName === "IFRAME"
          ? (target as unknown as HTMLIFrameElement)
          : containerRef.current?.querySelector("iframe");
        if (iframe instanceof HTMLIFrameElement) {
          iframe.style.position = "absolute";
          iframe.style.inset = "0";
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.border = "0";
        }
      });
      obs.observe(containerRef.current, { childList: true, subtree: true });
    });

    return () => {
      cancelled = true;
      try {
        player?.destroy();
        playerRef.current?.destroy();
      } catch {
        /* noop */
      }
      playerRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [playing, videoId]);

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
          <div ref={containerRef} className="absolute inset-0 h-full w-full" />
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
          <span>Sub Indonesia (otomatis)</span>
          <span className="text-white/30">·</span>
          <span>CinemaStream Player</span>
        </div>
      </div>
    </div>
  );
}
