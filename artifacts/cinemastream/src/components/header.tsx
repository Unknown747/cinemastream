import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Sailboat, Bookmark, Film, Tv } from "lucide-react";
import {
  useListAllVideos,
  getListAllVideosQueryKey,
} from "@workspace/api-client-react";
import {
  getWatchlist,
  subscribeWatchlist,
} from "@/lib/storage";
import { movies as STATIC_MOVIES } from "@/data/movies";
import { filmHrefForMovie, filmHrefForVideo } from "@/lib/slug";
import { isTrailer } from "@/lib/video-meta";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/drama", label: "Drama" },
  { href: "/search", label: "Cari" },
  { href: "/watchlist", label: "Daftar Saya" },
  { href: "/blog", label: "Artikel" },
  { href: "/about", label: "Tentang" },
];

type Suggestion = {
  key: string;
  href: string;
  title: string;
  subtitle: string;
  thumbnailUrl?: string;
  type: "film" | "drama";
};

const MAX_SUGGESTIONS = 8;

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function scoreMatch(title: string, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const t = normalize(title);
  let score = 0;
  for (const tok of tokens) {
    if (t === tok) score += 100;
    else if (t.startsWith(tok)) score += 30;
    else if (t.includes(` ${tok}`)) score += 10;
    else if (t.includes(tok)) score += 3;
  }
  return score;
}

function matchesAll(text: string, tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  const haystack = normalize(text);
  return tokens.every((t) => haystack.includes(t));
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [location, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setOpen(false);
    setShowSuggestions(false);
  }, [location]);

  useEffect(() => {
    const sync = () => setSavedCount(getWatchlist().length);
    sync();
    return subscribeWatchlist(sync);
  }, []);

  const videos = useListAllVideos({
    query: {
      queryKey: getListAllVideosQueryKey(),
      staleTime: 60_000,
      enabled: query.trim().length >= 2,
    },
  });

  const tokens = useMemo(
    () =>
      normalize(query)
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2),
    [query],
  );

  const suggestions = useMemo<Suggestion[]>(() => {
    if (tokens.length === 0) return [];

    const filmHits = STATIC_MOVIES.filter((m) =>
      matchesAll(`${m.title} ${m.director} ${m.genres.join(" ")}`, tokens),
    )
      .map((m) => ({
        suggestion: {
          key: `film-${m.id}`,
          href: filmHrefForMovie(m.id),
          title: m.title,
          subtitle: `${m.year} · ${m.director}`,
          type: "film" as const,
        },
        score: scoreMatch(m.title, tokens) + 5,
      }));

    const dramaList = videos.data ?? [];
    const dramaHits = dramaList
      .filter((v) =>
        matchesAll(
          `${v.title} ${v.originalTitle ?? ""} ${v.channelName}`,
          tokens,
        ),
      )
      .map((v) => ({
        suggestion: {
          key: `drama-${v.videoId}`,
          href: filmHrefForVideo(v.title, v.videoId),
          title: v.title,
          subtitle: v.channelName,
          thumbnailUrl: v.thumbnailUrl,
          type: "drama" as const,
        },
        score:
          scoreMatch(v.title, tokens) +
          scoreMatch(v.originalTitle ?? "", tokens) * 0.5 +
          (isTrailer(v) ? -5 : 0),
      }));

    return [...filmHits, ...dramaHits]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SUGGESTIONS)
      .map((x) => x.suggestion);
  }, [tokens, videos.data]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    if (!showSuggestions) return;
    const handleClick = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSuggestions]);

  const goToSearch = () => {
    const q = query.trim();
    setShowSuggestions(false);
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      activeIndex >= 0 &&
      activeIndex < suggestions.length &&
      showSuggestions
    ) {
      const target = suggestions[activeIndex];
      setShowSuggestions(false);
      navigate(target.href);
      return;
    }
    goToSearch();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        i <= 0 ? suggestions.length - 1 : i - 1,
      );
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown =
    showSuggestions &&
    tokens.length > 0 &&
    (suggestions.length > 0 || videos.isLoading);

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
            ref={formRef}
            onSubmit={onSubmit}
            className="relative flex-1 min-w-0"
            role="search"
            aria-label="Cari film atau drama"
          >
            <label className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={onKeyDown}
                placeholder="Cari film atau drama..."
                className="w-full h-10 rounded-md bg-secondary/70 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none ring-0 focus:bg-secondary focus:ring-1 focus:ring-primary/60 transition"
                data-testid="input-header-search"
                aria-label="Cari film atau drama"
                aria-autocomplete="list"
                aria-expanded={showDropdown}
                aria-controls="header-search-suggestions"
                aria-activedescendant={
                  activeIndex >= 0
                    ? `header-suggestion-${activeIndex}`
                    : undefined
                }
                role="combobox"
                autoComplete="off"
              />
            </label>

            {showDropdown && (
              <div
                id="header-search-suggestions"
                role="listbox"
                className="absolute left-0 right-0 top-full mt-1 max-h-[70vh] overflow-y-auto rounded-md border border-border/70 bg-popover shadow-lg"
                data-testid="dropdown-search-suggestions"
              >
                {videos.isLoading && suggestions.length === 0 && (
                  <div className="px-3 py-3 text-xs text-muted-foreground">
                    Memuat saran...
                  </div>
                )}

                {suggestions.length === 0 && !videos.isLoading && (
                  <div className="px-3 py-3 text-xs text-muted-foreground">
                    Tidak ada saran. Tekan Enter untuk pencarian penuh.
                  </div>
                )}

                {suggestions.map((s, i) => {
                  const active = i === activeIndex;
                  return (
                    <button
                      key={s.key}
                      id={`header-suggestion-${i}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(s.href);
                      }}
                      className={`flex w-full items-center gap-3 border-b border-border/40 px-3 py-2 text-left text-sm transition last:border-b-0 ${
                        active
                          ? "bg-secondary/80 text-foreground"
                          : "hover:bg-secondary/60 text-foreground/90"
                      }`}
                      data-testid={`suggestion-${s.key}`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-secondary/60">
                        {s.thumbnailUrl ? (
                          <img
                            src={s.thumbnailUrl}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : s.type === "film" ? (
                          <Film className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Tv className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {s.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {s.subtitle}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          s.type === "film"
                            ? "bg-primary/15 text-primary"
                            : "bg-accent/30 text-accent-foreground"
                        }`}
                      >
                        {s.type === "film" ? "Film" : "Drama"}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={goToSearch}
                  className="flex w-full items-center justify-center gap-2 border-t border-border/60 bg-secondary/30 px-3 py-2 text-xs font-medium text-primary hover:bg-secondary/60"
                  data-testid="button-search-see-all"
                >
                  <Search className="h-3.5 w-3.5" />
                  Lihat semua hasil untuk "{query.trim()}"
                </button>
              </div>
            )}
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
