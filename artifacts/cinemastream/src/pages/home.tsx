import { filmHrefForVideo } from "@/lib/slug";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ChevronRight,
  Play,
  RefreshCw,
  Newspaper,
  Bookmark,
  History as HistoryIcon,
  Trash2,
  Flame,
} from "lucide-react";
import {
  useListAllVideos,
  useListArticles,
  useListChannels,
  getListAllVideosQueryKey,
  getListArticlesQueryKey,
  getListChannelsQueryKey,
} from "@workspace/api-client-react";
import { Seo } from "@/components/seo";
import { DramaCard } from "@/components/drama-card";
import { AdSlot } from "@/components/ad-slot";
import {
  getHistory,
  getWatchlist,
  removeHistory,
  subscribeHistory,
  subscribeWatchlist,
  formatTime,
  type HistoryEntry,
  type WatchlistEntry,
} from "@/lib/storage";
import { isTrailer } from "@/lib/video-meta";
import { absoluteUrl } from "@/lib/site";

export default function HomePage() {
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
  const articles = useListArticles(undefined, {
    query: { queryKey: getListArticlesQueryKey(), staleTime: 60_000 },
  });

  const list = videos.data ?? [];
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const PAGE_SIZE = 8;

  useEffect(() => {
    const sync = () => {
      setHistory(getHistory());
      setWatchlist(getWatchlist());
    };
    sync();
    const off1 = subscribeHistory(sync);
    const off2 = subscribeWatchlist(sync);
    return () => {
      off1();
      off2();
    };
  }, []);

  const filtered = useMemo(
    () => list.filter((v) => !isTrailer(v)),
    [list],
  );

  const continueWatching = useMemo(() => {
    const ids = new Set(list.map((v) => v.videoId));
    return history
      .filter(
        (h) =>
          ids.has(h.videoId) &&
          h.durationSec > 0 &&
          h.positionSec > 5 &&
          h.durationSec - h.positionSec > 30,
      )
      .slice(0, 8);
  }, [history, list]);

  type VideoItem = (typeof list)[number];
  const watchlistVisible = useMemo<VideoItem[]>(() => {
    const byId = new Map<string, VideoItem>(
      list.map((v) => [v.videoId, v]),
    );
    const result: VideoItem[] = [];
    for (const w of watchlist) {
      const found = byId.get(w.videoId);
      if (found) result.push(found);
      if (result.length >= 8) break;
    }
    return result;
  }, [watchlist, list]);

  const visible = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page],
  );

  const pinned = list[0];
  const movies = useMemo(
    () => list.filter((v) => /movie|film|the movie/i.test(v.title)).slice(0, 4),
    [list],
  );
  const fallbackMovies = useMemo(() => list.slice(0, 4), [list]);
  const movieRow = movies.length >= 1 ? movies : fallbackMovies;

  // "Terbanyak di Tonton" — channels sorted by upload count (proxy for popularity)
  const popularChannels = useMemo(() => {
    const map = new Map<
      string,
      {
        channelId: string;
        channelName: string;
        thumb: string;
        count: number;
      }
    >();
    for (const v of list) {
      const ex = map.get(v.channelId);
      if (ex) ex.count += 1;
      else
        map.set(v.channelId, {
          channelId: v.channelId,
          channelName: v.channelName,
          thumb: v.thumbnailUrl,
          count: 1,
        });
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [list]);

  const articlesList = articles.data ?? [];
  const channelCount = channels.data?.length ?? 0;

  const itemListJsonLd = useMemo(() => {
    if (visible.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Drama China Terbaru",
      itemListElement: visible.slice(0, 12).map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(filmHrefForVideo(v.title, v.videoId)),
        name: v.title,
      })),
    };
  }, [visible]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: absoluteUrl("/") },
    ],
  };

  return (
    <>
      <Seo
        title="CinemaStream — Nonton Film Drama China Sub Indo, Update Otomatis"
        description="Nonton film drama China, mini drama, dan short drama Mandarin lengkap dengan judul Bahasa Indonesia. Update otomatis tiap channel YouTube upload tontonan baru."
        path="/"
        keywords={[
          "drama china",
          "drama mandarin",
          "drama china sub indo",
          "nonton drama china",
          "mini drama",
          "short drama",
        ]}
        jsonLd={itemListJsonLd ? [breadcrumbJsonLd, itemListJsonLd] : breadcrumbJsonLd}
      />

      <div className="mx-auto max-w-[1100px] px-3 sm:px-5">
        {/* Lanjut Nonton — continue watching rail */}
        {continueWatching.length > 0 && (
          <section
            className="mt-6"
            aria-labelledby="lanjut-nonton-heading"
          >
            <div className="flex items-center justify-between mb-3">
              <h2
                id="lanjut-nonton-heading"
                className="inline-flex items-center gap-1.5 text-base font-semibold"
              >
                <HistoryIcon className="h-4 w-4 text-primary" />
                Lanjut Nonton
              </h2>
              <Link
                href="/watchlist"
                className="text-sm text-primary font-medium inline-flex items-center gap-0.5 hover:underline"
                data-testid="link-history-all"
              >
                Riwayat <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {continueWatching.map((h) => {
                const pct =
                  h.durationSec > 0
                    ? Math.min(
                        100,
                        Math.round((h.positionSec / h.durationSec) * 100),
                      )
                    : 0;
                return (
                  <li
                    key={h.videoId}
                    className="group relative rounded-md border border-border/60 bg-card/40 overflow-hidden hover:border-primary/40 transition"
                    data-testid={`card-continue-${h.videoId}`}
                  >
                    <Link
                      href={filmHrefForVideo(h.title, h.videoId)}
                      className="block"
                    >
                      <div className="relative aspect-video bg-black">
                        <img
                          src={h.thumbnailUrl}
                          alt={h.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute inset-x-0 bottom-0 h-1 bg-black/50">
                          <span
                            className="block h-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                        <span className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {formatTime(h.positionSec)}
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition">
                          <Play className="h-8 w-8 text-white fill-current" />
                        </span>
                      </div>
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-semibold leading-snug line-clamp-2">
                          {h.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                          {h.channelName} · {pct}%
                        </p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        removeHistory(h.videoId);
                      }}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white/85 opacity-0 group-hover:opacity-100 hover:bg-black/85 transition"
                      aria-label="Hapus dari riwayat"
                      data-testid={`button-remove-continue-${h.videoId}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Daftar Tonton — bookmarked rail */}
        {watchlistVisible.length > 0 && (
          <section className="mt-8" aria-labelledby="daftar-tonton-heading">
            <div className="flex items-center justify-between mb-3">
              <h2
                id="daftar-tonton-heading"
                className="inline-flex items-center gap-1.5 text-base font-semibold"
              >
                <Bookmark className="h-4 w-4 text-primary" />
                Daftar Tonton Saya
              </h2>
              <Link
                href="/watchlist"
                className="text-sm text-primary font-medium inline-flex items-center gap-0.5 hover:underline"
                data-testid="link-watchlist-all"
              >
                Lihat semua <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {watchlistVisible.map((v, i) => (
                <DramaCard
                  key={v.videoId}
                  video={v}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tontonan Terbaru */}
        <section
          className="mt-6 sm:mt-8"
          aria-labelledby="terbaru-heading"
        >
          <h2
            id="terbaru-heading"
            className="text-center text-lg sm:text-xl font-semibold tracking-tight"
          >
            Tontonan Terbaru
          </h2>

          {videos.isLoading && visible.length === 0 ? (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] rounded-md bg-secondary/60" />
                  <div className="mt-2 h-3.5 w-5/6 rounded bg-secondary/60" />
                  <div className="mt-1.5 h-3 w-2/3 rounded bg-secondary/40" />
                </div>
              ))}
            </div>
          ) : visible.length > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {visible.map((v, i) => (
                  <DramaCard
                    key={v.videoId}
                    video={v}
                    index={i}
                  />
                ))}
              </div>
              {visible.length < filtered.length && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-md bg-secondary/70 hover:bg-secondary px-8 py-2 text-sm font-medium text-foreground transition"
                    data-testid="button-next-page"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Belum ada tontonan.
            </p>
          )}
        </section>

        <div className="mt-8">
          <AdSlot slot={import.meta.env.VITE_ADSENSE_SLOT_HOME_TOP} format="auto" />
        </div>

        {/* Algorithm / Latest article CTA */}
        {articlesList[0] && (
          <Link
            href={`/blog/${articlesList[0].slug}`}
            className="mt-6 flex items-center gap-3 rounded-md border border-border/60 bg-card/60 p-3 hover:bg-card transition"
            data-testid="link-algorithm-article"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Play className="h-5 w-5 fill-current translate-x-0.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground line-clamp-1">
                {articlesList[0].title}
              </span>
              <span className="block text-xs text-muted-foreground line-clamp-1">
                {articlesList[0].excerpt || "Baca artikel terbaru CinemaStream"}
              </span>
            </span>
          </Link>
        )}

        {/* Terbanyak di Tonton — channels with most uploads */}
        {popularChannels.length > 0 && (
          <section
            className="mt-8"
            aria-labelledby="rame-heading"
          >
            <h2
              id="rame-heading"
              className="text-base font-semibold mb-3 inline-flex items-center gap-1.5"
            >
              <Flame className="h-4 w-4 text-primary" />
              Terbanyak di Tonton
            </h2>
            <ul className="divide-y divide-border/50 border-y border-border/50">
              {popularChannels.map((c) => (
                <li key={c.channelId}>
                  <Link
                    href={`/channel/${c.channelId}`}
                    className="flex items-center gap-3 py-3 hover:bg-secondary/30 -mx-2 px-2 rounded transition"
                    data-testid={`link-rame-${c.channelId}`}
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-secondary ring-1 ring-border/60">
                      <img
                        src={c.thumb}
                        alt={c.channelName}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-sm text-foreground line-clamp-1">
                        {c.channelName}
                      </span>
                      <span className="block text-xs text-muted-foreground line-clamp-1">
                        {c.count} film tersedia
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Update Tontonan — Sync */}
        <section className="mt-8" aria-label="Update tontonan">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Update Tontonan</h2>
            <button
              type="button"
              onClick={() => videos.refetch()}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              data-testid="button-sync"
            >
              Sync <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          {pinned ? (
            <Link
              href={filmHrefForVideo(pinned.title, pinned.videoId)}
              className="flex items-center justify-between gap-3 rounded-md px-4 py-3 text-sm font-medium hover:opacity-90 transition"
              style={{ background: "rgba(30, 50, 60, 0.85)" }}
              data-testid="link-pinned"
            >
              <span className="line-clamp-1 flex-1">{pinned.title}</span>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                {new Date(pinned.publishedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className="text-primary text-xs font-bold uppercase tracking-wider">
                Buka
              </span>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">
              Belum ada update tontonan.
            </p>
          )}
        </section>

        {/* Movie Terbaru */}
        {movieRow.length > 0 && (
          <section className="mt-8" aria-labelledby="movie-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="movie-heading" className="text-base font-semibold">
                Movie Terbaru
              </h2>
              <Link
                href="/drama"
                className="rounded bg-primary px-3 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 transition"
                data-testid="link-all-movies"
              >
                Semua Movie
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {movieRow.map((v, i) => (
                <DramaCard key={v.videoId} video={v} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Berita & Artikel */}
        {articlesList.length > 0 && (
          <section className="mt-10" aria-labelledby="news-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="news-heading" className="text-base font-semibold inline-flex items-center gap-1.5">
                <Newspaper className="h-4 w-4 text-primary" />
                Berita & Artikel
              </h2>
              <Link
                href="/blog"
                className="text-sm text-primary font-medium inline-flex items-center gap-0.5 hover:underline"
                data-testid="link-all-articles"
              >
                Semua <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="divide-y divide-border/50">
              {articlesList.slice(0, 4).map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/blog/${a.slug}`}
                    className="flex items-start gap-3 py-3 hover:bg-secondary/30 -mx-2 px-2 rounded transition"
                    data-testid={`link-article-${a.slug}`}
                  >
                    {a.coverImage ? (
                      <img
                        src={a.coverImage}
                        alt=""
                        className="h-16 w-24 shrink-0 rounded object-cover bg-secondary"
                      />
                    ) : (
                      <span className="h-16 w-24 shrink-0 rounded bg-secondary/60" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground line-clamp-2">
                        {a.title}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground line-clamp-2">
                        {a.excerpt}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Empty state when no channels yet */}
        {!videos.isLoading && list.length === 0 && (
          <section className="mt-12 mb-12 text-center" aria-label="Belum ada drama">
            <h2 className="text-xl font-semibold">Belum ada drama</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              {channelCount > 0
                ? "Channel sudah terdaftar — film akan muncul otomatis di sini setelah kreator upload."
                : "Belum ada channel terdaftar. Film akan tampil otomatis di sini setelah channel ditambahkan."}
            </p>
          </section>
        )}

        <div className="mt-10">
          <AdSlot slot={import.meta.env.VITE_ADSENSE_SLOT_IN_ARTICLE} format="auto" />
        </div>
      </div>
    </>
  );
}
