import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";
import { MovieCard } from "@/components/movie-card";
import { allGenres, getMoviesByGenre, genreSlug } from "@/data/movies";
import NotFound from "@/pages/not-found";

export default function GenrePage() {
  const [, params] = useRoute("/genre/:slug");
  const slug = params?.slug ?? "";
  const movies = getMoviesByGenre(slug);
  const genreName = allGenres.find((g) => genreSlug(g) === slug);

  if (!genreName) return <NotFound />;

  return (
    <>
      <Seo
        title={`${genreName} Films`}
        description={`Discover ${movies.length} curated ${genreName.toLowerCase()} films on CinemaStream. Stream the best of ${genreName.toLowerCase()} cinema, all embedded and ready to play.`}
        pathname={`/genre/${slug}`}
      />

      <section className="pt-32 sm:pt-40 pb-12">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
          <Link href="/browse" data-testid="link-back-browse-genre">
            <Button variant="ghost" size="sm" className="rounded-full mb-6 gap-2 -ml-3">
              <ArrowLeft className="h-4 w-4" />
              All Films
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-mono uppercase tracking-widest text-primary mb-3">
              Genre
            </p>
            <h1 className="font-serif text-5xl sm:text-7xl tracking-tight">
              {genreName}.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl">
              {movies.length} curated {movies.length === 1 ? "film" : "films"} in this genre.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
