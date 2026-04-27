import { useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Tv2 } from "lucide-react";
import {
  useListAllVideos,
  getListAllVideosQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

type DramaRailProps = {
  title?: string;
  subtitle?: string;
  limit?: number;
};

export function DramaRail({
  title = "Drama Series",
  subtitle = "Episode terbaru, update otomatis",
  limit = 12,
}: DramaRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videos = useListAllVideos({
    query: {
      queryKey: getListAllVideosQueryKey(),
      staleTime: 60_000,
      refetchInterval: 5 * 60_000,
    },
  });

  const list = (videos.data ?? []).slice(0, limit);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (videos.isLoading || list.length === 0) return null;

  return (
    <section className="py-8 sm:py-10" data-testid="rail-drama">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary">
              <Tv2 className="h-3 w-3" /> Update Otomatis
            </div>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-foreground tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/drama"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              data-testid="link-rail-drama-all"
            >
              Lihat semua <ChevronRight className="h-4 w-4" />
            </Link>
            <div className="hidden md:flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scroll("left")}
                className="h-9 w-9 rounded-full border border-border"
                data-testid="button-rail-drama-prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scroll("right")}
                className="h-9 w-9 rounded-full border border-border"
                data-testid="button-rail-drama-next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {list.map((v, i) => (
            <motion.div
              key={v.videoId}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
              className="flex-none w-[60vw] sm:w-[38vw] md:w-[28vw] lg:w-[22vw] xl:w-[18vw] snap-start"
            >
              <Link
                href={`/drama/${v.videoId}`}
                className="group block overflow-hidden rounded-lg border border-border/60 bg-card/40 transition-colors hover:border-primary/40"
                data-testid={`link-rail-drama-${v.videoId}`}
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {v.hasOverride && (
                    <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                      ID
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                    {v.title}
                  </h3>
                  <p className="mt-1 truncate text-xs text-foreground/60">
                    {v.channelName}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
