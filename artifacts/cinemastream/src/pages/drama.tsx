import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Tv, RefreshCw, AlertCircle } from "lucide-react";
import {
  useListAllVideos,
  useListChannels,
  getListAllVideosQueryKey,
  getListChannelsQueryKey,
} from "@workspace/api-client-react";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";

function formatRelative(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "Hari ini";
  if (diff < 2 * day) return "Kemarin";
  if (diff < 7 * day) return `${Math.floor(diff / day)} hari lalu`;
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))} minggu lalu`;
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))} bulan lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const list = videos.data ?? [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.originalTitle.toLowerCase().includes(q) ||
        v.channelName.toLowerCase().includes(q),
    );
  }, [videos.data, query]);

  return (
    <>
      <Seo
        title="Drama Series — Update Otomatis Tiap Hari | CinemaStream"
        description="Koleksi drama China dan mini series terbaru, otomatis ter-update saat channel YouTube upload episode baru. Tonton gratis dengan judul Bahasa Indonesia."
        path="/drama"
        keywords={[
          "drama china",
          "drama mandarin",
          "mini series",
          "drama pendek",
          "nonton drama",
          "short drama",
        ]}
      />

      <section className="pt-28 pb-12">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
                <Tv className="h-3.5 w-3.5" />
                Update Otomatis
              </div>
              <h1 className="mt-3 font-serif text-4xl sm:text-5xl tracking-tight">
                Drama Series
              </h1>
              <p className="mt-2 max-w-2xl text-foreground/70">
                Episode terbaru dari channel pilihan, segar setiap kali kreator
                upload. Judul sudah dialih-bahasakan ke Indonesia bila tersedia.
              </p>
              {channels.data && channels.data.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-foreground/50">
                    Channel:
                  </span>
                  {channels.data.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-foreground/80"
                      data-testid={`badge-channel-${c.id}`}
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari judul..."
                className="h-10 w-full md:w-64 rounded-md border border-border/60 bg-card/60 px-4 text-sm placeholder:text-foreground/40 focus:border-primary focus:outline-none"
                data-testid="input-search-drama"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => videos.refetch()}
                disabled={videos.isFetching}
                aria-label="Refresh"
                data-testid="button-refresh-drama"
              >
                <RefreshCw
                  className={`h-4 w-4 ${videos.isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </motion.div>

          {(channels.data?.length ?? 0) === 0 && !channels.isLoading && (
            <div className="mt-10 rounded-lg border border-dashed border-border/60 bg-card/40 p-8 text-center">
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
            <div className="mt-16 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {videos.isError && (
            <div className="mt-10 rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center">
              <p className="text-destructive">
                Gagal memuat video. Coba refresh.
              </p>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((v, idx) => (
                <motion.div
                  key={v.videoId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(idx * 0.03, 0.4) }}
                >
                  <Link
                    href={`/drama/${v.videoId}`}
                    className="group block overflow-hidden rounded-lg border border-border/60 bg-card/40 transition-colors hover:border-primary/40"
                    data-testid={`link-drama-${v.videoId}`}
                  >
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img
                        src={v.thumbnailUrl}
                        alt={v.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {v.hasOverride && (
                        <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                          ID
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="line-clamp-2 text-sm font-semibold leading-snug">
                        {v.title}
                      </h2>
                      <div className="mt-2 flex items-center justify-between text-xs text-foreground/60">
                        <span className="truncate pr-2">{v.channelName}</span>
                        <span className="shrink-0">{formatRelative(v.publishedAt)}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!videos.isLoading && filtered.length === 0 && (channels.data?.length ?? 0) > 0 && (
            <div className="mt-16 text-center text-foreground/60">
              Tidak ada video yang cocok.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
