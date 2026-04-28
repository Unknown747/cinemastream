import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Tv2, RefreshCw, AlertCircle, Search } from "lucide-react";
import {
  useListAllVideos,
  useListChannels,
  getListAllVideosQueryKey,
  getListChannelsQueryKey,
} from "@workspace/api-client-react";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { DramaCard } from "@/components/drama-card";
import { isTrailer } from "@/lib/video-meta";
import { absoluteUrl } from "@/lib/site";

type SortKey = "newest" | "oldest" | "title-asc";

export default function DramaPage() {
  const channels = useListChannels({
    query: { queryKey: getListChannelsQueryKey(), staleTime: 60_000 },
  });
  const videos = useListAllVideos({
    query: {
      queryKey: getListAllVideosQueryKey(),
      staleTime: 60_000,
      refetchInterval: 5 * 60_000,
    },
  });
  const search = useSearch();
  const initialQuery = useMemo(() => {
    try {
      return new URLSearchParams(search).get("q") ?? "";
    } catch {
      return "";
    }
  }, [search]);
  const [query, setQuery] = useState(initialQuery);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [hideTrailers, setHideTrailers] = useState(true);
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const filtered = useMemo(() => {
    let list = videos.data ?? [];
    if (hideTrailers) list = list.filter((v) => !isTrailer(v));
    if (activeChannel) list = list.filter((v) => v.channelId === activeChannel);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.originalTitle.toLowerCase().includes(q) ||
          v.channelName.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sort === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    } else if (sort === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      );
    } else if (sort === "title-asc") {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "id"));
    }
    return sorted;
  }, [videos.data, query, activeChannel, hideTrailers, sort]);

  const trailerCount = useMemo(
    () => (videos.data ?? []).filter((v) => isTrailer(v)).length,
    [videos.data],
  );

  const channelStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of videos.data ?? []) {
      counts.set(v.channelId, (counts.get(v.channelId) ?? 0) + 1);
    }
    return counts;
  }, [videos.data]);

  const itemListJsonLd = useMemo(() => {
    if (filtered.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Daftar Drama China",
      numberOfItems: filtered.length,
      itemListElement: filtered.slice(0, 30).map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/drama/${v.videoId}`),
        name: v.title,
      })),
    };
  }, [filtered]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Drama", item: absoluteUrl("/drama") },
    ],
  };

  return (
    <>
      <Seo
        title={
          query
            ? `Cari "${query}" — Drama China Sub Indo | CinemaStream`
            : "Daftar Film Drama China Sub Indo — Update Otomatis | CinemaStream"
        }
        description={
          query
            ? `Hasil pencarian "${query}" di CinemaStream. Drama China dan mini series dengan judul Bahasa Indonesia.`
            : "Koleksi film drama China, mini drama, dan short drama Mandarin lengkap. Judul Bahasa Indonesia, update otomatis tiap channel YouTube upload tontonan baru."
        }
        path="/drama"
        noindex={Boolean(query)}
        keywords={[
          "drama china",
          "drama mandarin",
          "drama china sub indo",
          "mini drama",
          "short drama",
          "drama pendek",
          "nonton drama china",
          "drama china terbaru",
        ]}
        jsonLd={
          itemListJsonLd ? [breadcrumbJsonLd, itemListJsonLd] : breadcrumbJsonLd
        }
      />

      {/* Hero header */}
      <section className="relative pt-28 pb-10 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(212,138,68,0.12),_transparent_60%)]" />
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Tv2 className="h-3.5 w-3.5" />
              Update Otomatis
            </div>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight text-balance">
              Semua Drama
            </h1>
            <p className="mt-3 max-w-2xl text-foreground/70 text-base sm:text-lg">
              Koleksi lengkap dari semua channel pilihan, dengan judul Bahasa
              Indonesia. Saring berdasarkan channel atau cari judul tertentu.
            </p>

            {(videos.data?.length ?? 0) > 0 && (
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-foreground/60">
                <span>
                  <strong className="text-foreground">{videos.data?.length}</strong>{" "}
                  film
                </span>
                <span>
                  <strong className="text-foreground">{channels.data?.length ?? 0}</strong>{" "}
                  channel
                </span>
                <span>
                  <strong className="text-foreground">
                    {videos.data?.filter((v) => v.hasOverride).length ?? 0}
                  </strong>{" "}
                  judul Bahasa Indonesia
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar — channels */}
            <aside className="lg:w-64 lg:shrink-0">
              <div className="sticky top-24 space-y-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/50 mb-3">
                    Cari
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cari judul..."
                      className="h-10 w-full rounded-md border border-border/60 bg-card/60 pl-9 pr-3 text-sm placeholder:text-foreground/40 focus:border-primary focus:outline-none"
                      data-testid="input-search-drama"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/50 mb-3">
                    Urutkan
                  </p>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="h-10 w-full rounded-md border border-border/60 bg-card/60 px-3 text-sm focus:border-primary focus:outline-none"
                    data-testid="select-sort-drama"
                  >
                    <option value="newest">Terbaru dulu</option>
                    <option value="oldest">Terlama dulu</option>
                    <option value="title-asc">Judul A → Z</option>
                  </select>
                </div>

                <div>
                  <label
                    className="flex items-start gap-2 cursor-pointer select-none rounded-md border border-border/60 bg-card/60 px-3 py-2 hover:border-primary/40 transition"
                  >
                    <input
                      type="checkbox"
                      checked={hideTrailers}
                      onChange={(e) => setHideTrailers(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border/60 accent-primary"
                      data-testid="checkbox-hide-trailers"
                    />
                    <span className="text-xs leading-snug">
                      <span className="block font-medium text-foreground">
                        Sembunyikan trailer
                      </span>
                      <span className="block text-foreground/50">
                        {trailerCount > 0
                          ? `${trailerCount} trailer/cuplikan tersembunyi`
                          : "Trailer & cuplikan disembunyikan"}
                      </span>
                    </span>
                  </label>
                </div>

                {(channels.data?.length ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
                        Channel
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => videos.refetch()}
                        disabled={videos.isFetching}
                        aria-label="Refresh"
                        className="h-7 w-7"
                        data-testid="button-refresh-drama"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${videos.isFetching ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                      <button
                        onClick={() => setActiveChannel(null)}
                        className={`text-left text-sm rounded-md px-3 py-2 transition ${
                          activeChannel === null
                            ? "bg-primary/15 text-primary font-medium"
                            : "text-foreground/70 hover:text-foreground hover:bg-card/60"
                        }`}
                        data-testid="button-channel-all"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span>Semua channel</span>
                          <span className="text-xs text-foreground/50">
                            {videos.data?.length ?? 0}
                          </span>
                        </span>
                      </button>
                      {channels.data?.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setActiveChannel(c.channelId)}
                          className={`text-left text-sm rounded-md px-3 py-2 transition ${
                            activeChannel === c.channelId
                              ? "bg-primary/15 text-primary font-medium"
                              : "text-foreground/70 hover:text-foreground hover:bg-card/60"
                          }`}
                          data-testid={`button-channel-${c.id}`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate">{c.name}</span>
                            <span className="text-xs text-foreground/50">
                              {channelStats.get(c.channelId) ?? 0}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1 min-w-0">
              {(channels.data?.length ?? 0) === 0 && !channels.isLoading && (
                <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-10 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-foreground/40" />
                  <p className="mt-3 text-foreground/80">
                    Belum ada channel terdaftar.
                  </p>
                  <Link
                    href="/admin"
                    className="mt-3 inline-block text-sm text-primary hover:underline"
                  >
                    Tambah channel di halaman Admin →
                  </Link>
                </div>
              )}

              {videos.isLoading && (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {videos.isError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center">
                  <p className="text-destructive">
                    Gagal memuat video. Coba refresh.
                  </p>
                </div>
              )}

              {filtered.length > 0 && (
                <>
                  <div className="mb-4 flex items-center justify-between text-sm text-foreground/60">
                    <span>
                      Menampilkan <strong className="text-foreground">{filtered.length}</strong>{" "}
                      film
                    </span>
                    {activeChannel && (
                      <button
                        onClick={() => setActiveChannel(null)}
                        className="text-primary hover:underline"
                      >
                        Hapus filter
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((v, i) => (
                      <DramaCard key={v.videoId} video={v} index={i} />
                    ))}
                  </div>
                </>
              )}

              {!videos.isLoading &&
                filtered.length === 0 &&
                (channels.data?.length ?? 0) > 0 && (
                  <div className="py-20 text-center text-foreground/60">
                    Tidak ada video yang cocok.
                  </div>
                )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
