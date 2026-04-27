import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";
import { MovieCard } from "@/components/movie-card";
import { movies, allGenres } from "@/data/movies";

export default function BrowsePage() {
  const [query, setQuery] = useState("");
  const [activeGenres, setActiveGenres] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      const matchesQuery =
        query.trim().length === 0 ||
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.director.toLowerCase().includes(query.toLowerCase()) ||
        m.synopsis.toLowerCase().includes(query.toLowerCase());
      const matchesGenre =
        activeGenres.length === 0 ||
        activeGenres.every((g) => m.genres.includes(g));
      return matchesQuery && matchesGenre;
    });
  }, [query, activeGenres]);

  const toggleGenre = (g: string) => {
    setActiveGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  };

  const clearAll = () => {
    setActiveGenres([]);
    setQuery("");
  };

  return (
    <>
      <Seo
        title="Browse Films"
        description="Browse and search the entire CinemaStream library. Filter by genre, search by title, director, or storyline. Find your next favorite film."
        pathname="/browse"
      />

      <section className="pt-32 sm:pt-36 pb-12">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-mono uppercase tracking-widest text-primary mb-3">
              The Library
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl tracking-tight text-balance max-w-2xl">
              Browse the full collection.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl">
              {movies.length} curated films across {allGenres.length} genres.
              Search by anything. Stack filters as you go.
            </p>
          </motion.div>

          <div className="mt-10 sticky top-16 sm:top-20 z-30 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 bg-background/80 backdrop-blur-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, director, or story…"
                className="h-14 pl-12 pr-12 text-base rounded-2xl bg-card border-border focus-visible:ring-primary/40"
                data-testid="input-search"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/70"
                  aria-label="Clear search"
                  data-testid="button-clear-search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Genre</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allGenres.map((g) => {
                  const active = activeGenres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      data-testid={`chip-genre-${g.toLowerCase()}`}
                    >
                      <Badge
                        variant={active ? "default" : "secondary"}
                        className={`cursor-pointer text-xs px-3 py-1.5 transition-all ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/70"
                        }`}
                      >
                        {g}
                      </Badge>
                    </button>
                  );
                })}
                {(activeGenres.length > 0 || query) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                    data-testid="button-clear-filters"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
          <p className="text-sm text-muted-foreground mb-6" data-testid="text-result-count">
            {filtered.length} {filtered.length === 1 ? "film" : "films"}
          </p>

          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div
                key="grid"
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
              >
                {filtered.map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} index={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 text-center"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-5">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-2xl mb-2">No films match.</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Try a different search or remove some filters to see more films.
                </p>
                <Button onClick={clearAll} className="mt-6 rounded-full" data-testid="button-reset-filters">
                  Reset filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
