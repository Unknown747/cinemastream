import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Info, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";
import { MovieRail } from "@/components/movie-rail";
import {
  movies,
  featuredMovies,
  allGenres,
  genreSlug,
  getMoviesByGenre,
  youtubeBackdrop,
} from "@/data/movies";

export default function HomePage() {
  const spotlight = featuredMovies[0];
  const trending = movies.slice(0, 10);
  const newReleases = [...movies]
    .sort((a, b) => b.year - a.year)
    .slice(0, 10);

  if (!spotlight) return null;

  return (
    <>
      <Seo
        title="CinemaStream — Watch Curated Films, Beautifully"
        description="Discover and watch a curated collection of acclaimed films. Cinematic experiences, embedded and ready to play, from the world's most celebrated directors."
        pathname="/"
      />

      {/* Hero */}
      <section className="relative min-h-[88vh] sm:min-h-[92vh] flex items-end overflow-hidden grain">
        <div className="absolute inset-0">
          <motion.img
            key={spotlight.id}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            src={youtubeBackdrop(spotlight.youtubeId)}
            alt={`${spotlight.title} backdrop`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-12 pb-20 sm:pb-28 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Featured Spotlight</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-balance leading-[1.05] tracking-tight">
              {spotlight.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-foreground/80">
              <span className="font-medium">{spotlight.year}</span>
              <span className="h-1 w-1 rounded-full bg-foreground/40" />
              <span>{spotlight.runtime} min</span>
              <span className="h-1 w-1 rounded-full bg-foreground/40" />
              <span className="rounded border border-foreground/30 px-1.5 py-0.5 text-xs font-medium">
                {spotlight.rating}
              </span>
              <span className="h-1 w-1 rounded-full bg-foreground/40" />
              <span className="text-muted-foreground">Dir. {spotlight.director}</span>
            </div>

            <p className="mt-6 text-lg sm:text-xl text-foreground/85 leading-relaxed text-balance max-w-xl">
              {spotlight.synopsis}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/movie/${spotlight.id}`} data-testid="link-hero-watch">
                <Button size="lg" className="rounded-full px-7 h-12 text-base font-semibold gap-2 shadow-2xl">
                  <Play className="h-5 w-5 fill-current" />
                  Watch Now
                </Button>
              </Link>
              <Link href={`/movie/${spotlight.id}`} data-testid="link-hero-details">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-7 h-12 text-base font-semibold gap-2 backdrop-blur-md bg-white/10 hover:bg-white/15 border border-white/15 text-foreground"
                >
                  <Info className="h-5 w-5" />
                  Details
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured carousel */}
      {featuredMovies.length > 1 && (
        <MovieRail
          title="In the Spotlight"
          subtitle="Hand-picked highlights from our cinematic library"
          movies={featuredMovies}
        />
      )}

      <MovieRail title="Trending Now" subtitle="What everyone's watching" movies={trending} />

      <MovieRail title="New Releases" subtitle="The latest additions" movies={newReleases} />

      {/* Genre browser */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">Browse by Genre</h2>
              <p className="mt-2 text-muted-foreground">Find your next favorite by mood, not metric.</p>
            </div>
            <Link
              href="/browse"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              data-testid="link-view-all-browse"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allGenres.map((genre, i) => {
              const sample = getMoviesByGenre(genreSlug(genre))[0];
              if (!sample) return null;
              return (
                <motion.div
                  key={genre}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                >
                  <Link
                    href={`/genre/${genreSlug(genre)}`}
                    className="relative group block aspect-[3/2] overflow-hidden rounded-xl border border-card-border"
                    data-testid={`link-genre-${genreSlug(genre)}`}
                  >
                    <img
                      src={youtubeBackdrop(sample.youtubeId)}
                      alt={`${genre} films`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/15 transition-colors duration-500" />
                    <div className="absolute inset-0 p-5 flex items-end">
                      <div>
                        <h3 className="font-serif text-2xl text-white tracking-tight">{genre}</h3>
                        <p className="text-xs text-white/70 mt-1">
                          {getMoviesByGenre(genreSlug(genre)).length} films
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/10 p-10 sm:p-16 text-center"
          >
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <h2 className="font-serif text-3xl sm:text-5xl tracking-tight text-balance">
                Cinema, the way it was meant to be discovered.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
                Curated collections. Beautiful interfaces. No clutter, no noise. Just films and the
                people who love them.
              </p>
              <Link href="/browse" data-testid="link-cta-browse">
                <Button size="lg" className="mt-8 rounded-full px-8 h-12 text-base font-semibold">
                  Start Browsing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
