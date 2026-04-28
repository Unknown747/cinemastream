import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Clock, Calendar, User, Film as FilmIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Seo } from "@/components/seo";
import { MovieCard } from "@/components/movie-card";
import { ShareBar } from "@/components/share-bar";
import {
  getMovieById,
  getRelated,
  youtubeBackdrop,
  genreSlug,
} from "@/data/movies";
import { filmHrefForMovie } from "@/lib/slug";
import {
  buildLongDescription,
  buildTranscript,
  buildVideoSeoDescription,
  buildVideoSeoTitle,
  wordCount,
} from "@/lib/seo-text";
import NotFound from "@/pages/not-found";

export default function MovieDetailPage() {
  const [, filmParams] = useRoute<{ slug: string }>("/film/:slug");
  const [, legacyParams] = useRoute<{ id: string }>("/movie/:id");
  const id = filmParams?.slug ?? legacyParams?.id;
  const movie = id ? getMovieById(id) : undefined;

  if (!movie) return <NotFound />;

  const related = getRelated(movie, 6);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const movieJsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.synopsis,
    image: youtubeBackdrop(movie.youtubeId),
    datePublished: `${movie.year}`,
    director: {
      "@type": "Person",
      name: movie.director,
    },
    genre: movie.genres,
    duration: `PT${movie.runtime}M`,
    contentRating: movie.rating,
    url,
  };

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${movie.title} — Official Trailer`,
    description: movie.synopsis,
    thumbnailUrl: youtubeBackdrop(movie.youtubeId),
    uploadDate: `${movie.year}-01-01`,
    embedUrl: `https://www.youtube.com/embed/${movie.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${movie.youtubeId}`,
  };

  return (
    <>
      <Seo
        title={buildVideoSeoTitle({
          title: `${movie.title} (${movie.year})`,
          isMovie: true,
        })}
        description={buildVideoSeoDescription({
          title: movie.title,
          channelName: movie.director,
          description: movie.synopsis,
          publishedDate: `${movie.year}`,
        })}
        ogImage={youtubeBackdrop(movie.youtubeId)}
        ogType="video.movie"
        path={filmHrefForMovie(movie.id)}
        jsonLd={[movieJsonLd, videoJsonLd]}
        videoUrl={`https://www.youtube.com/embed/${movie.youtubeId}`}
        videoSecureUrl={`https://www.youtube.com/embed/${movie.youtubeId}`}
        videoType="text/html"
        videoWidth={1280}
        videoHeight={720}
      />

      <article>
        {/* Backdrop hero */}
        <section className="relative pt-20">
          <div className="relative h-[55vh] sm:h-[70vh] overflow-hidden">
            <motion.img
              key={movie.id}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              src={youtubeBackdrop(movie.youtubeId)}
              alt={`${movie.title} backdrop`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
              <Link href="/browse" data-testid="link-back-browse">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full backdrop-blur-md bg-black/30 hover:bg-black/40 border border-white/15 text-white gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
          </div>

          {/* Player + Details */}
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 -mt-32 sm:-mt-48 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
              {/* Player */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="order-2 lg:order-1"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-card-border bg-black shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${movie.youtubeId}?rel=0&modestbranding=1`}
                    title={`${movie.title} player`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="mt-3 text-xs text-muted-foreground font-mono">
                  Embedded from YouTube · No videos are stored on our servers.
                </div>
              </motion.div>

              {/* Meta panel */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="order-1 lg:order-2"
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres.map((g) => (
                    <Link
                      key={g}
                      href={`/genre/${genreSlug(g)}`}
                      data-testid={`link-detail-genre-${genreSlug(g)}`}
                    >
                      <Badge
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 cursor-pointer"
                      >
                        {g}
                      </Badge>
                    </Link>
                  ))}
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight text-balance leading-[1.05]">
                  {movie.title}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/80">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{movie.year}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{movie.runtime} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FilmIcon className="h-4 w-4 text-primary" />
                    <span className="rounded border border-foreground/30 px-1.5 py-0.5 text-xs font-medium">
                      {movie.rating}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>
                    Directed by <span className="text-foreground font-medium">{movie.director}</span>
                  </span>
                </div>

                <p className="mt-6 text-base sm:text-lg text-foreground/85 leading-relaxed">
                  {movie.synopsis}
                </p>

                <Button
                  size="lg"
                  className="mt-8 w-full rounded-full h-12 gap-2 font-semibold shadow-xl"
                  onClick={() => {
                    const iframe = document.querySelector("iframe");
                    iframe?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  data-testid="button-play-now"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Play Now
                </Button>

                <ShareBar
                  url={url || filmHrefForMovie(movie.id)}
                  title={movie.title}
                  text={`Nonton ${movie.title} (${movie.year}) di CinemaStream`}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Long-form SEO content */}
        <section className="mt-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-12">
            {wordCount(movie.synopsis) < 200 && (
              <article className="rounded-xl border border-border/60 bg-card/40 p-5 text-sm leading-relaxed text-foreground/85">
                <h2 className="mb-3 font-serif text-lg text-foreground">
                  Sinopsis lengkap
                </h2>
                {buildLongDescription({
                  title: movie.title,
                  channelName: movie.director,
                  description: movie.synopsis,
                  publishedDate: `${movie.year}`,
                  isMovie: true,
                })
                  .split("\n\n")
                  .map((para, idx) => (
                    <p key={idx} className="mb-3 last:mb-0">
                      {para}
                    </p>
                  ))}
              </article>
            )}

            <details className="mt-6 rounded-xl border border-border/60 bg-card/30 p-5 text-sm leading-relaxed text-foreground/80">
              <summary className="cursor-pointer select-none font-serif text-base text-foreground">
                Transkrip & ringkasan video
              </summary>
              <div className="mt-3 space-y-3">
                {buildTranscript({
                  title: movie.title,
                  channelName: movie.director,
                  description: movie.synopsis,
                  publishedDate: `${movie.year}`,
                  isMovie: true,
                })
                  .split("\n\n")
                  .map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
              </div>
            </details>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 pb-20">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
              <h2 className="font-serif text-2xl sm:text-3xl tracking-tight mb-2">
                More like this
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Films that share a tone, a mood, or a maker.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {related.map((m, i) => (
                  <MovieCard key={m.id} movie={m} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
