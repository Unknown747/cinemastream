import { filmHrefForVideo, filmHrefForMovie } from "@/lib/slug";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";
import type { Movie } from "@/data/movies";
import { youtubeThumb } from "@/data/movies";

type MovieCardProps = {
  movie: Movie;
  index?: number;
  variant?: "poster" | "wide";
};

export function MovieCard({ movie, index = 0, variant = "poster" }: MovieCardProps) {
  const isPoster = variant === "poster";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.04, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={filmHrefForMovie(movie.id)}
        className="group block"
        data-testid={`link-movie-${movie.id}`}
      >
        <div
          className={`relative overflow-hidden rounded-xl bg-card border border-card-border ${
            isPoster ? "aspect-[2/3]" : "aspect-video"
          } transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:-translate-y-1`}
        >
          <img
            src={youtubeThumb(movie.youtubeId, "hq")}
            alt={`${movie.title} poster`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              isPoster ? "scale-[1.6]" : "scale-100"
            }`}
            style={isPoster ? { objectPosition: "center" } : undefined}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-primary/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform duration-500 group-hover:scale-100 scale-75">
              <Play className="h-6 w-6 fill-current ml-0.5" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-serif text-lg leading-tight text-white text-balance line-clamp-2">
              {movie.title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
              <span>{movie.year}</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <Clock className="h-3 w-3" />
              <span>{movie.runtime}m</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="rounded-sm border border-white/30 px-1 py-px text-[10px] font-medium tracking-wide">
                {movie.rating}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
