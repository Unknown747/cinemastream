import { useRoute } from "wouter";
import { getMovieById } from "@/data/movies";
import MovieDetailPage from "./movie-detail";
import DramaDetailPage from "./drama-detail";

export default function FilmDetailPage() {
  const [, params] = useRoute<{ slug: string }>("/film/:slug");
  const slug = params?.slug ?? "";
  const isMovie = Boolean(getMovieById(slug));
  return isMovie ? <MovieDetailPage /> : <DramaDetailPage />;
}
