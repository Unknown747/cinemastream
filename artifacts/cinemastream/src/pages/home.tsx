import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ChevronRight,
  Play,
  RefreshCw,
  Newspaper,
  Tv2,
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

type TabKey = "semua" | "drama" | "movie";

const TABS: { key: TabKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "drama", label: "Drama" },
  { key: "movie", label: "Movie" },
];

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
  const [tab, setTab] = useState<TabKey>("semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    if (tab === "movie") {
      return list.filter((v) => /movie|film|the movie/i.test(v.title));
    }
    if (tab === "drama") {
      return list.filter((v) => !/movie|film|the movie/i.test(v.title));
    }
    return list;
  }, [list, tab]);

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

  // "Lagi Rame" — popular channels (mock user counts derived from episode count)
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
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Drama China Terbaru",
      itemListElement: visible.slice(0, 12).map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${origin}/drama/${v.videoId}`,
        name: v.title,
      })),
    };
  }, [visible]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: "/" },
    ],
  };

  return (
    <>
      <Seo
        title="CinemaStream — Nonton Drama China Sub Indo, Update Otomatis"
        description="Nonton drama China, mini drama, dan short drama Mandarin terbaru dengan judul Bahasa Indonesia. Update otomatis tiap channel YouTube upload episode baru."
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
        {/* Welcome banner — brick/red tile */}
        <section
          className="mt-3 sm:mt-4 rounded-md px-4 py-4 text-sm leading-relaxed"
          style={{ background: "rgba(125, 56, 56, 0.55)" }}
          aria-label="Pesan sambutan"
        >
          <p className="text-foreground/95">
            Selamat datang di <strong>CinemaStream</strong> tempat nonton drama
            China dan mini series Mandarin sub Indonesia update terbaru. Judul
            otomatis diterjemahkan ke Bahasa Indonesia oleh AI penerjemah, dan
            episode baru muncul sendiri tiap kreator upload. Yuk pantau juga
            artikel kami di{" "}
            <Link
              href="/blog"
              className="font-semibold underline underline-offset-2"
              data-testid="link-welcome-blog"
            >
              [Blog CinemaStream]
            </Link>
            .
          </p>
        </section>

        {/* Episode Terbaru with tabs */}
        <section
          className="mt-6 sm:mt-8"
          aria-labelledby="terbaru-heading"
        >
          <h2
            id="terbaru-heading"
            className="text-center text-lg sm:text-xl font-semibold tracking-tight"
          >
            Episode Terbaru
          </h2>
          <div className="mt-3 flex items-center justify-center">
            <div
              className="inline-flex rounded-md border border-border/70 bg-secondary/40 p-0.5"
              role="tablist"
              aria-label="Filter episode"
            >
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setTab(t.key);
                      setPage(1);
                    }}
                    role="tab"
                    aria-selected={active}
                    className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded transition ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/85 hover:text-foreground"
                    }`}
                    data-testid={`tab-${t.key}`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

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
                    type={
                      /movie|film|the movie/i.test(v.title)
                        ? "Movie"
                        : "ONA"
                    }
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
              Belum ada episode pada kategori ini.
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

        {/* Community / Discord-style banner — link to admin/contact */}
        <section className="mt-6" aria-label="Bergabung dengan komunitas">
          <p className="text-base font-semibold">Ikuti CinemaStream</p>
          <Link
            href="/contact"
            className="mt-2 flex h-20 sm:h-24 items-center justify-center rounded-md text-white font-bold tracking-widest text-2xl sm:text-3xl"
            style={{
              background:
                "linear-gradient(135deg, #5865F2 0%, #7289da 50%, #4f5bda 100%)",
            }}
            data-testid="link-community-banner"
          >
            <Tv2 className="mr-2 h-7 w-7" /> KOMUNITAS
          </Link>
        </section>

        {/* Lagi Rame — popular channels list */}
        {popularChannels.length > 0 && (
          <section
            className="mt-8"
            aria-labelledby="rame-heading"
          >
            <h2 id="rame-heading" className="text-base font-semibold mb-3">
              Lagi Rame
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
                        Drama Mandarin · {c.count} episode tersedia
                      </span>
                      <span className="block text-xs text-muted-foreground/80">
                        {Math.max(20, c.count * 17)} User Online
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
              href={`/drama/${pinned.videoId}`}
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
                <DramaCard key={v.videoId} video={v} index={i} type="Movie" />
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
              Tambahkan channel YouTube drama China di halaman Admin
              {channelCount > 0 ? "" : " — belum ada channel terdaftar"}, lalu
              episode-episodenya akan tampil otomatis di sini dengan judul
              Bahasa Indonesia.
            </p>
            <Link
              href="/admin"
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
              data-testid="link-empty-admin"
            >
              Buka Admin
            </Link>
          </section>
        )}

        <div className="mt-10">
          <AdSlot slot={import.meta.env.VITE_ADSENSE_SLOT_IN_ARTICLE} format="auto" />
        </div>
      </div>
    </>
  );
}
