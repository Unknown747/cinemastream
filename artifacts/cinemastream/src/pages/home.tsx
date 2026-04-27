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
  Flame,
  Star,
  Radio,
} from "lucide-react";
import {
  useListAllVideos,
  useListChannels,
  getListAllVideosQueryKey,
  getListChannelsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";
import { DramaCard } from "@/components/drama-card";
import { SectionHeading } from "@/components/section-heading";
import { AdSlot } from "@/components/ad-slot";

const FEATURES = [
  {
    icon: Languages,
    title: "Judul Bahasa Indonesia",
    text: "Setiap judul Mandarin diterjemahkan otomatis ke Indonesia oleh AI penerjemah, lalu disimpan agar episode berikutnya muncul instan.",
  },
  {
    icon: RefreshCw,
    title: "Selalu update sendiri",
    text: "Tiap channel YouTube upload episode baru, daftar drama langsung ikut update — kamu tidak perlu refresh manual.",
  },
  {
    icon: Tv2,
    title: "Pemutar bersih, bebas iklan",
    text: "Drama diputar via embed YouTube resmi. Tidak ada pop-up, tidak ada iklan tambahan, tidak perlu daftar akun apa pun.",
  },
  {
    icon: Heart,
    title: "Khusus drama China",
    text: "Hanya drama Mandarin pilihan dan mini series. Tidak digabung dengan konten lain yang mengganggu pengalaman menonton.",
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
  const editorPicks = useMemo(() => list.slice(1, 4), [list]);
  const top10 = useMemo(() => list.slice(0, 10), [list]);
  const latest = useMemo(() => list.slice(0, 12), [list]);
  const channelCount = channels.data?.length ?? 0;
  const videoCount = list.length;

  // Group latest video per channel for "Channel Pilihan"
  const channelHighlights = useMemo(() => {
    const map = new Map<
      string,
      { channelId: string; channelName: string; latest: (typeof list)[number]; count: number }
    >();
    for (const v of list) {
      const existing = map.get(v.channelId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(v.channelId, {
          channelId: v.channelId,
          channelName: v.channelName,
          latest: v,
          count: 1,
        });
      }
    }
    return Array.from(map.values()).slice(0, 6);
  }, [list]);

  const itemListJsonLd = useMemo(() => {
    if (latest.length === 0) return null;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Drama China Terbaru",
      itemListElement: latest.map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${origin}/drama/${v.videoId}`,
        name: v.title,
      })),
    };
  }, [latest]);

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
          "drama pendek",
          "drama china terbaru",
        ]}
        jsonLd={itemListJsonLd ? [breadcrumbJsonLd, itemListJsonLd] : breadcrumbJsonLd}
      />

      {/* Hero */}
      <section className="relative min-h-[88vh] sm:min-h-[94vh] flex items-end overflow-hidden grain">
        <div className="absolute inset-0">
          {spotlight ? (
            <motion.img
              key={spotlight.videoId}
              initial={{ scale: 1.12, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              src={spotlight.thumbnailUrl}
              alt={`Cuplikan ${spotlight.title}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.6),_transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-12 pb-20 sm:pb-28 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-primary mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span>{spotlight ? "Episode Pilihan Hari Ini" : "Drama China Sub Indo"}</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-balance leading-[1.02] tracking-tight">
              {spotlight ? spotlight.title : "Nonton Drama China dengan Judul Indonesia"}
            </h1>

            {spotlight ? (
              <>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-foreground/85">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Radio className="h-3.5 w-3.5 text-primary" />
                    {spotlight.channelName}
                  </span>
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
                      <span className="rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                        Sub Indo
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-6 text-lg sm:text-xl text-foreground/85 leading-relaxed text-balance max-w-xl line-clamp-3">
                  {spotlight.description ||
                    "Episode terbaru pilihan editor. Pencet play dan biarkan ceritanya mengalir."}
                </p>
              </>
            ) : (
              <p className="mt-6 text-lg sm:text-xl text-foreground/85 leading-relaxed text-balance max-w-xl">
                Mini drama dan short drama Mandarin pilihan, dengan judul yang
                otomatis dialihbahasakan ke Bahasa Indonesia. Update tiap
                kreator upload episode baru.
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
                    className="rounded-full px-7 h-12 text-base font-semibold gap-2 shadow-2xl shadow-primary/30"
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
              <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm text-foreground/70">
                {channelCount > 0 && (
                  <div>
                    <span className="font-serif text-3xl text-foreground">
                      {channelCount}
                    </span>
                    <span className="ml-2 align-middle">channel terkurasi</span>
                  </div>
                )}
                {videoCount > 0 && (
                  <div>
                    <span className="font-serif text-3xl text-foreground">
                      {videoCount}
                    </span>
                    <span className="ml-2 align-middle">episode siap tonton</span>
                  </div>
                )}
                <div>
                  <span className="font-serif text-3xl text-foreground">100%</span>
                  <span className="ml-2 align-middle">judul Bahasa Indonesia</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Floating spotlight side-card on desktop */}
        {spotlight && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute right-12 bottom-28 hidden xl:block w-72"
          >
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-3 shadow-2xl">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={spotlight.thumbnailUrl}
                  alt={spotlight.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="px-1 pt-3 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                  Sedang Trending
                </p>
                <p className="mt-1 text-sm font-medium text-white line-clamp-2">
                  {spotlight.title}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* Editor's Spotlight — magazine layout */}
      {editorPicks.length >= 3 && spotlight && (
        <section
          className="py-16 sm:py-20 border-t border-border/40"
          aria-labelledby="spotlight-heading"
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
            <SectionHeading
              eyebrow="Pilihan Editor"
              eyebrowIcon={Star}
              title="Episode pilihan minggu ini"
              description="Empat judul yang patut kamu masukkan daftar tonton akhir pekan ini — dipilih dari ratusan upload terbaru."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Big featured */}
              <Link
                href={`/drama/${spotlight.videoId}`}
                className="group lg:col-span-2 relative block overflow-hidden rounded-2xl ring-1 ring-border/60 hover:ring-primary/50 transition"
                data-testid="link-spotlight-featured"
              >
                <div className="aspect-video lg:aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={spotlight.thumbnailUrl}
                    alt={spotlight.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
                    <Star className="h-3 w-3 fill-current" />
                    Top Pick
                  </span>
                  <h3 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight max-w-2xl">
                    {spotlight.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">
                    {spotlight.channelName}
                  </p>
                </div>
              </Link>

              {/* Stacked picks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                {editorPicks.map((v, i) => (
                  <DramaCard key={v.videoId} video={v} index={i} size="md" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
        <AdSlot slot={import.meta.env.VITE_ADSENSE_SLOT_HOME_TOP} format="auto" />
      </div>

      {/* Top 10 — Netflix-style numbered ranking */}
      {top10.length >= 3 && (
        <section
          className="py-16 sm:py-20 border-t border-border/40"
          aria-labelledby="top10-heading"
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
            <SectionHeading
              eyebrow="Top Pekan Ini"
              eyebrowIcon={Flame}
              title="Drama terpopuler saat ini"
              description="Daftar 10 episode terbaru yang paling sering tampil di feed kreator pilihan. Update tiap jam."
              href="/drama"
              hrefLabel="Lihat semua drama"
            />

            <div className="relative -mx-4 sm:mx-0">
              <div className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide pb-3 px-4 sm:px-0 snap-x snap-mandatory">
                {top10.map((v, i) => (
                  <motion.div
                    key={v.videoId}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
                    className="snap-start shrink-0 w-[78vw] sm:w-[42vw] md:w-[28vw] lg:w-[20vw] xl:w-[16vw]"
                  >
                    <Link
                      href={`/drama/${v.videoId}`}
                      className="group relative flex items-end gap-1 focus:outline-none"
                      data-testid={`link-top10-${v.videoId}`}
                    >
                      <span
                        className="font-serif font-black text-transparent leading-[0.8] select-none -mr-3 sm:-mr-4"
                        style={{
                          fontSize: "clamp(7rem, 16vw, 12rem)",
                          WebkitTextStroke: "2px rgba(255,255,255,0.18)",
                        }}
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <div className="relative aspect-[2/3] w-[58%] overflow-hidden rounded-lg ring-1 ring-border/60 group-hover:ring-primary/60 transition">
                        <img
                          src={v.thumbnailUrl}
                          alt={v.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-2.5">
                          <p className="text-[11px] font-semibold text-white line-clamp-2 leading-tight">
                            {v.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Channel Showcase */}
      {channelHighlights.length >= 1 && (
        <section
          className="py-16 sm:py-20 border-t border-border/40"
          aria-labelledby="channels-heading"
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
            <SectionHeading
              eyebrow="Channel Pilihan"
              eyebrowIcon={Radio}
              title="Kreator yang kami ikuti"
              description="Channel yang konsisten menghasilkan drama berkualitas. Episode-episode mereka muncul otomatis di sini."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {channelHighlights.map((c, i) => (
                <motion.div
                  key={c.channelId}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <Link
                    href={`/channel/${c.channelId}`}
                    className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-3 transition hover:border-primary/40 hover:bg-card/70"
                    data-testid={`link-channel-${c.channelId}`}
                  >
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-black">
                      <img
                        src={c.latest.thumbnailUrl}
                        alt={c.channelName}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                        Channel
                      </p>
                      <h3 className="mt-0.5 font-medium text-sm text-foreground line-clamp-1">
                        {c.channelName}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {c.count} episode tersedia
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest grid */}
      {latest.length > 0 && (
        <section
          className="py-16 sm:py-20 border-t border-border/40"
          aria-labelledby="latest-heading"
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
            <SectionHeading
              eyebrow="Update Terbaru"
              eyebrowIcon={Sparkles}
              title="Episode baru, segar dari oven"
              description="Daftar lengkap episode terbaru dari semua channel. Refresh otomatis tiap 5 menit."
              href="/drama"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {latest.map((v, i) => (
                <DramaCard key={v.videoId} video={v} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state when no channels yet */}
      {!videos.isLoading && latest.length === 0 && (
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
      <section
        className="py-16 sm:py-20 border-t border-border/40"
        aria-labelledby="why-heading"
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary mb-3">
              Kenapa Kami
            </p>
            <h2
              id="why-heading"
              className="font-serif text-3xl sm:text-5xl tracking-tight text-balance"
            >
              Cara paling sederhana
              <br />
              mengikuti drama China.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Dibangun untuk pencinta drama yang muak dengan situs penuh iklan
              dan judul yang sulit dipahami.
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
                Tidak perlu menebak arti karakter Mandarin. Pilih episode, klik
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
