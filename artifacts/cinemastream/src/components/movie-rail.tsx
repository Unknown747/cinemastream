import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./movie-card";
import type { Movie } from "@/data/movies";
import { Button } from "@/components/ui/button";

type MovieRailProps = {
  title: string;
  subtitle?: string;
  movies: Movie[];
  href?: string;
};

export function MovieRail({ title, subtitle, movies }: MovieRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (movies.length === 0) return null;

  return (
    <section className="py-8 sm:py-10" data-testid={`rail-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="hidden md:flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("left")}
              className="h-9 w-9 rounded-full border border-border"
              data-testid={`button-rail-prev-${title}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("right")}
              className="h-9 w-9 rounded-full border border-border"
              data-testid={`button-rail-next-${title}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {movies.map((movie, i) => (
            <div
              key={movie.id}
              className="flex-none w-[44vw] sm:w-[28vw] md:w-[22vw] lg:w-[16vw] xl:w-[14vw] snap-start"
            >
              <MovieCard movie={movie} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
