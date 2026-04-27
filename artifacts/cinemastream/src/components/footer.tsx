import { Link } from "wouter";
import { Film } from "lucide-react";
import { allGenres, genreSlug } from "@/data/movies";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30 mt-20">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5" data-testid="link-footer-logo">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Film className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <span className="font-serif text-xl tracking-tight">
                Cinema<span className="text-primary">Stream</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
              A cinematic streaming destination for film lovers. Curated, embedded,
              and playable in your browser — all in one beautifully designed home.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-4 text-sm tracking-wide uppercase">Explore</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-footer-home">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-foreground transition-colors" data-testid="link-footer-browse">
                  Browse Films
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors" data-testid="link-footer-about">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-4 text-sm tracking-wide uppercase">Genres</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {allGenres.slice(0, 6).map((g) => (
                <li key={g}>
                  <Link
                    href={`/genre/${genreSlug(g)}`}
                    className="hover:text-foreground transition-colors"
                    data-testid={`link-footer-genre-${genreSlug(g)}`}
                  >
                    {g}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CinemaStream. All trailers and clips embedded from YouTube.</p>
          <p className="font-mono tracking-wide">Built for the love of cinema</p>
        </div>
      </div>
    </footer>
  );
}
