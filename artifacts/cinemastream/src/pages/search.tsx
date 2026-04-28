import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Search as SearchIcon, X } from "lucide-react";
import {
  useListAllVideos,
  getListAllVideosQueryKey,
} from "@workspace/api-client-react";
import { Seo } from "@/components/seo";
import { DramaCard } from "@/components/drama-card";
import { MovieCard } from "@/components/movie-card";
import { movies as STATIC_MOVIES, type Movie } from "@/data/movies";
import { isTrailer } from "@/lib/video-meta";

type Tab = "all" | "film" | "drama";

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function matchesQuery(text: string, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const haystack = normalize(text);
  return tokens.every((t) => haystack.includes(t));
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

export default function SearchPage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const initialQuery = useMemo(() => {
    try {
      return new URLSearchParams(search).get("q") ?? "";
    } catch {
      return "";
    }
  }, [search]);
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const videos = useListAllVideos({
    query: { queryKey: getListAllVideosQueryKey(), staleTime: 60_000 },
  });

  const tokens = useMemo(
    () =>
      normalize(query)
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2),
    [query],
  );

  const filmResults = useMemo(() => {
    if (tokens.length === 0) return [] as Movie[];
    const list = STATIC_MOVIES.filter((m) => {
      const text = `${m.title} ${m.director} ${m.genres.join(" ")}`;
      return matchesQuery(text, tokens);
    });
    return list
      .map((m) => ({ m, s: scoreMatch(m.title, tokens) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.m);
  }, [tokens]);

  const dramaResults = useMemo(() => {
    const all = videos.data ?? [];
    if (tokens.length === 0) return [] as typeof all;
    const filtered = all.filter((v) => {
      const text = `${v.title} ${v.originalTitle ?? ""} ${v.channelName}`;
      return matchesQuery(text, tokens);
    });
    return filtered
      .map((v) => ({
        v,
        s:
          scoreMatch(v.title, tokens) +
          scoreMatch(v.originalTitle ?? "", tokens) * 0.5 +
          (isTrailer(v) ? -5 : 0),
      }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.v);
  }, [videos.data, tokens]);

  const totalCount = filmResults.length + dramaResults.length;
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const showFilms = tab === "all" || tab === "film";
  const showDramas = tab === "all" || tab === "drama";

  const seoTitle = query
    ? `Hasil pencarian: ${query}`
    : "Cari film & drama";
  const seoDescription = query
    ? `Hasil pencarian untuk "${query}" di CinemaStream — film dan drama mini Mandarin sub Indo.`
    : "Cari film dan drama mini sub Indo di CinemaStream berdasarkan judul, channel, atau sutradara.";

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}
        noindex
      />

      <section className="mx-auto max-w-[1100px] px-3 sm:px-5 pt-10 pb-20">
        <h1 className="font-serif text-3xl sm:text-4xl tracking-tight">
          Pencarian
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Cari film dan drama berdasarkan judul, channel, atau sutradara.
        </p>

        <form
          onSubmit={onSubmit}
          role="search"
          aria-label="Pencarian site-wide"
          className="mt-5"
        >
          <label className="relative flex items-center">
            <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik judul, contoh: inception, drama mandarin..."
              className="h-12 w-full rounded-lg bg-secondary/60 pl-10 pr-10 text-base text-foreground placeholder:text-muted-foreground/80 outline-none focus:bg-secondary focus:ring-1 focus:ring-primary/60 transition"
              data-testid="input-search-page"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  navigate("/search");
                }}
                className="absolute right-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                aria-label="Bersihkan pencarian"
                data-testid="button-search-clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
        </form>

        {tokens.length === 0 ? (
          <div className="mt-12 rounded-xl border border-border/60 bg-card/40 p-8 text-center text-sm text-foreground/70">
            Mulailah mengetik di kotak pencarian di atas untuk melihat hasil.
            Pencarian mencakup koleksi film panjang dan semua drama mini di
            CinemaStream.
          </div>
        ) : (
          <>
            <div
              className="mt-6 flex flex-wrap items-center gap-2"
              role="tablist"
              aria-label="Filter hasil pencarian"
            >
              {([
                { id: "all" as Tab, label: `Semua (${totalCount})` },
                { id: "film" as Tab, label: `Film (${filmResults.length})` },
                {
                  id: "drama" as Tab,
                  label: `Drama (${dramaResults.length})`,
                },
              ]).map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    className={`inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition ${
                      active
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border/70 bg-card/50 text-foreground/85 hover:border-primary/50"
                    }`}
                    data-testid={`tab-search-${t.id}`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {videos.isLoading && dramaResults.length === 0 && (
              <div className="mt-10 flex items-center gap-2 text-sm text-foreground/70">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat data drama...
              </div>
            )}

            {totalCount === 0 && !videos.isLoading && (
              <div className="mt-10 rounded-xl border border-border/60 bg-card/40 p-8 text-center text-sm text-foreground/75">
                Tidak ada hasil untuk{" "}
                <span className="font-semibold text-foreground">"{query}"</span>
                . Coba kata kunci lain atau periksa ejaan.
              </div>
            )}

            {showFilms && filmResults.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
                aria-labelledby="search-films-heading"
              >
                <h2
                  id="search-films-heading"
                  className="mb-4 font-serif text-xl text-foreground"
                >
                  Film ({filmResults.length})
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filmResults.map((m, i) => (
                    <MovieCard key={m.id} movie={m} index={i} />
                  ))}
                </div>
              </motion.section>
            )}

            {showDramas && dramaResults.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="mt-10"
                aria-labelledby="search-dramas-heading"
              >
                <h2
                  id="search-dramas-heading"
                  className="mb-4 font-serif text-xl text-foreground"
                >
                  Drama ({dramaResults.length})
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {dramaResults.map((v, i) => (
                    <DramaCard key={v.videoId} video={v} index={i} />
                  ))}
                </div>
              </motion.section>
            )}
          </>
        )}
      </section>
    </>
  );
}
