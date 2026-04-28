import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Sailboat, Bookmark } from "lucide-react";
import {
  getWatchlist,
  subscribeWatchlist,
} from "@/lib/storage";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/drama", label: "Drama" },
  { href: "/search", label: "Cari" },
  { href: "/watchlist", label: "Daftar Saya" },
  { href: "/blog", label: "Artikel" },
  { href: "/admin", label: "Admin" },
  { href: "/about", label: "Tentang" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [location, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    const sync = () => setSavedCount(getWatchlist().length);
    sync();
    return subscribeWatchlist(sync);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto max-w-[1100px] px-3 sm:px-5">
        <div className="flex h-14 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 shrink-0"
            data-testid="link-home-logo"
            aria-label="CinemaStream — Beranda"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md text-primary">
              <Sailboat className="h-6 w-6" strokeWidth={2.2} />
            </span>
            <span className="hidden sm:inline font-semibold text-base tracking-tight">
              Cinema<span className="text-primary">Stream</span>
            </span>
          </Link>

          <form
            onSubmit={onSubmit}
            className="flex-1 min-w-0"
            role="search"
            aria-label="Cari film atau drama"
          >
            <label className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari film atau drama..."
                className="w-full h-10 rounded-md bg-secondary/70 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none ring-0 focus:bg-secondary focus:ring-1 focus:ring-primary/60 transition"
                data-testid="input-header-search"
                aria-label="Cari film atau drama"
              />
            </label>
          </form>

          <Link
            href="/watchlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-secondary/70 transition"
            aria-label={`Daftar Saya (${savedCount})`}
            data-testid="link-header-watchlist"
          >
            <Bookmark className="h-5 w-5" />
            {savedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {savedCount > 99 ? "99+" : savedCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-secondary/70 transition"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            data-testid="button-header-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background">
          <nav
            className="mx-auto max-w-[1100px] px-3 sm:px-5 py-2 flex flex-col"
            aria-label="Navigasi utama"
          >
            {links.map((l) => {
              const active = location === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-3 rounded-md text-sm font-medium transition ${
                    active
                      ? "text-primary bg-secondary/60"
                      : "text-foreground/85 hover:bg-secondary/40"
                  }`}
                  data-testid={`link-nav-${l.label.toLowerCase()}`}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
