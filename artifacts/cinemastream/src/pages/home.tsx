import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Play,
  ChevronRight,
  Sparkles,
  Tv2,
  Languages,
  RefreshCw,
  Heart,
} from "lucide-react";
import {
  useListAllVideos,
  useListChannels,
  getListAllVideosQueryKey,
  getListChannelsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";

const FEATURES = [
  {
    icon: Languages,
    title: "Judul Bahasa Indonesia",
    text: "Setiap judul Mandarin diterjemahkan otomatis ke Indonesia, jadi kamu langsung paham tanpa nebak.",
  },
  {
    icon: RefreshCw,
    title: "Update otomatis",
    text: "Tiap channel YouTube upload episode baru, daftar drama langsung ikut update — tanpa kamu refresh manual.",
  },
  {
    icon: Tv2,
    title: "Pemutar bersih",
    text: "Video diputar via embed YouTube. Tanpa iklan tambahan, tanpa pop-up, tanpa akun.",
  },
  {
    icon: Heart,
    title: "Khusus drama China",
    text: "Hanya drama Mandarin pilihan dan mini series — tidak digabung dengan konten lain.",
  },
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

  const list = videos.data ?? [];
  const spotlight = list[0];
  const trending = useMemo(() => list.slice(0, 8), [list]);
  const channelCount = channels.data?.length ?? 0;
  const videoCount = list.length;

  const itemListJsonLd = useMemo(() => {
    if (trending.length === 0) return null;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Drama China Terbaru",
      itemListElement: trending.map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${origin}/drama/${v.videoId}`,
        name: v.title,
      })),
    };
  }, [trending]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: "/",
      },
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
          "drama pendek",
          "drama china terbaru",
        ]}
        jsonLd={itemListJsonLd ? [breadcrumbJsonLd, itemListJsonLd] : breadcrumbJsonLd}
      />

      {/* Hero */}
      <section className="relative min-h-[88vh] sm:min-h-[92vh] flex items-end overflow-hidden grain">
        <div className="absolute inset-0">
          {spotlight ? (
            <motion.img
              key={spotlight.videoId}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              src={spotlight.thumbnailUrl}
              alt={`Cuplikan ${spotlight.title}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-12 pb-20 sm:pb-28 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{spotlight ? "Episode Baru" : "Drama China Sub Indo"}</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-balance leading-[1.05] tracking-tight">
              {spotlight ? spotlight.title : "Nonton Drama China dengan Judul Indonesia"}
            </h1>

            {spotlight ? (
              <>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-foreground/80">
                  <span className="font-medium">{spotlight.channelName}</span>
                  <span className="h-1 w-1 rounded-full bg-foreground/40" />
                  <span>
                    {new Date(spotlight.publishedAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {spotlight.hasOverride && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-foreground/40" />
                      <span className="rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        Sub Indo
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-6 text-lg sm:text-xl text-foreground/85 leading-relaxed text-balance max-w-xl line-clamp-3">
                  {spotlight.description ||
                    "Episode terbaru dari channel pilihan, update otomatis tiap kreator upload."}
                </p>
              </>
            ) : (
              <p className="mt-6 text-lg sm:text-xl text-foreground/85 leading-relaxed text-balance max-w-xl">
                Mini drama dan short drama Mandarin, dengan judul yang otomatis
                dialihbahasakan ke Bahasa Indonesia. Update tiap kreator upload
                episode baru.
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {spotlight ? (
                <Link
                  href={`/drama/${spotlight.videoId}`}
                  data-testid="link-hero-watch"
                >
                  <Button
                    size="lg"
                    className="rounded-full px-7 h-12 text-base font-semibold gap-2 shadow-2xl"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    Tonton Sekarang
                  </Button>
                </Link>
              ) : (
                <Link href="/drama" data-testid="link-hero-browse">
                  <Button
                    size="lg"
                    className="rounded-full px-7 h-12 text-base font-semibold gap-2 shadow-2xl"
                  >
                    <Tv2 className="h-5 w-5" />
                    Lihat Drama
                  </Button>
                </Link>
              )}
              <Link href="/drama" data-testid="link-hero-all">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-7 h-12 text-base font-semibold gap-2 backdrop-blur-md bg-white/10 hover:bg-white/15 border border-white/15 text-foreground"
                >
                  Semua Episode
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {(channelCount > 0 || videoCount > 0) && (
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-foreground/70">
                {channelCount > 0 && (
                  <div>
                    <span className="font-serif text-2xl text-foreground">
                      {channelCount}
                    </span>{" "}
                    channel terkurasi
                  </div>
                )}
                {videoCount > 0 && (
                  <div>
                    <span className="font-serif text-2xl text-foreground">
                      {videoCount}
                    </span>{" "}
                    episode siap tonton
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Latest episodes */}
      {trending.length > 0 && (
        <section className="py-16 sm:py-20" aria-labelledby="latest-heading">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary">
                  <Tv2 className="h-3 w-3" /> Update Otomatis
                </div>
                <h2
                  id="latest-heading"
                  className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight"
                >
                  Episode Terbaru
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Drama China dan mini series segar dari channel pilihan.
                </p>
              </div>
              <Link
                href="/drama"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
                data-testid="link-home-all-drama"
              >
                Lihat semua <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {trending.map((v, i) => (
                <motion.article
                  key={v.videoId}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(i * 0.04, 0.3),
                  }}
                >
                  <Link
                    href={`/drama/${v.videoId}`}
                    className="group block overflow-hidden rounded-lg border border-border/60 bg-card/40 transition-colors hover:border-primary/40"
                    data-testid={`link-home-drama-${v.videoId}`}
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
                          Sub Indo
                        </span>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                        {v.title}
                      </h3>
                      <p className="mt-1 truncate text-xs text-foreground/60">
                        {v.channelName}
                      </p>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state when no channels yet */}
      {!videos.isLoading && trending.length === 0 && (
        <section className="py-20" aria-labelledby="empty-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-12 text-center">
            <h2
              id="empty-heading"
              className="font-serif text-3xl sm:text-4xl tracking-tight"
            >
              Belum ada drama
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tambahkan channel YouTube drama China di halaman Admin, lalu
              episode-episodenya akan tampil otomatis di sini dengan judul
              Bahasa Indonesia.
            </p>
            <Link href="/admin" className="mt-6 inline-block">
              <Button size="lg" className="rounded-full px-7">
                Buka Halaman Admin
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Why CinemaStream */}
      <section className="py-16 sm:py-20" aria-labelledby="why-heading">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2
              id="why-heading"
              className="font-serif text-3xl sm:text-4xl tracking-tight"
            >
              Kenapa CinemaStream?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Cara paling sederhana untuk mengikuti drama China favoritmu —
              tanpa ribet bahasa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-2xl border border-card-border bg-card p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl tracking-tight mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/10 p-10 sm:p-16 text-center"
          >
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <h2 className="font-serif text-3xl sm:text-5xl tracking-tight text-balance">
                Drama China, dengan judul yang langsung kamu mengerti.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
                Tidak perlu nebak arti karakter Mandarin. Pilih episode, klik
                play, nikmati ceritanya.
              </p>
              <Link href="/drama" data-testid="link-cta-browse">
                <Button
                  size="lg"
                  className="mt-8 rounded-full px-8 h-12 text-base font-semibold"
                >
                  Mulai Nonton
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
