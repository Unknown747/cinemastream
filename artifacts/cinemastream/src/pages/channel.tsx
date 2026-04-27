import { useMemo } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Tv2, ArrowLeft, Calendar, Radio } from "lucide-react";
import {
  useListAllVideos,
  useListChannels,
  getListAllVideosQueryKey,
  getListChannelsQueryKey,
} from "@workspace/api-client-react";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { DramaCard } from "@/components/drama-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdSlot } from "@/components/ad-slot";

export default function ChannelPage() {
  const [, params] = useRoute<{ channelId: string }>("/channel/:channelId");
  const channelId = params?.channelId ?? "";

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

  const channel = useMemo(
    () =>
      channels.data?.find(
        (c) => c.channelId === channelId || c.id === channelId,
      ),
    [channels.data, channelId],
  );

  const channelVideos = useMemo(
    () =>
      (videos.data ?? []).filter(
        (v) => v.channelId === channelId || v.channelId === channel?.channelId,
      ),
    [videos.data, channelId, channel],
  );

  const subIndoCount = channelVideos.filter((v) => v.hasOverride).length;
  const heroVideo = channelVideos[0];

  if (channels.isLoading || videos.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!channel) {
    return (
      <>
        <Seo
          title="Channel tidak ditemukan"
          description="Channel yang kamu cari tidak terdaftar."
          path={`/channel/${channelId}`}
          noindex
        />
        <div className="mx-auto max-w-3xl px-6 pt-32 text-center">
          <p className="text-foreground/70">Channel tidak ditemukan.</p>
          <Link
            href="/drama"
            className="mt-4 inline-block text-primary hover:underline"
          >
            ← Kembali ke daftar drama
          </Link>
        </div>
      </>
    );
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: "/" },
      { "@type": "ListItem", position: 2, name: "Drama", item: "/drama" },
      {
        "@type": "ListItem",
        position: 3,
        name: channel.name,
        item: `/channel/${channel.channelId}`,
      },
    ],
  };

  const itemListJsonLd =
    channelVideos.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Drama dari ${channel.name}`,
          numberOfItems: channelVideos.length,
          itemListElement: channelVideos.slice(0, 30).map((v, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url:
              typeof window !== "undefined"
                ? `${window.location.origin}/drama/${v.videoId}`
                : `/drama/${v.videoId}`,
            name: v.title,
          })),
        }
      : null;

  return (
    <>
      <Seo
        title={`${channel.name} — Drama China Sub Indo | CinemaStream`}
        description={`Daftar lengkap drama dan mini series dari channel ${channel.name}, dengan judul Bahasa Indonesia. ${channelVideos.length} episode tersedia, update otomatis tiap upload baru.`}
        path={`/channel/${channel.channelId}`}
        keywords={[
          channel.name,
          `drama ${channel.name}`,
          "drama china",
          "drama mandarin",
          "drama china sub indo",
          "nonton drama china",
        ]}
        ogImage={heroVideo?.thumbnailUrl}
        imageAlt={`Drama dari channel ${channel.name}`}
        jsonLd={
          itemListJsonLd ? [breadcrumbJsonLd, itemListJsonLd] : breadcrumbJsonLd
        }
      />

      {/* Cinematic banner */}
      <section className="relative pt-28 pb-12 overflow-hidden border-b border-border/40">
        {heroVideo && (
          <>
            <motion.img
              key={heroVideo.videoId}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.35 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              src={heroVideo.thumbnailUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </>
        )}
        {!heroVideo && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,138,68,0.12),_transparent_60%)]" />
        )}

        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
          <Breadcrumbs
            items={[
              { label: "Beranda", href: "/" },
              { label: "Drama", href: "/drama" },
              { label: channel.name },
            ]}
            className="mb-3"
          />
          <Link
            href="/drama"
            className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
            data-testid="link-back-drama"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar drama
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Radio className="h-3.5 w-3.5" />
              Channel Drama
            </div>

            <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight text-balance leading-[1.05]">
              {channel.name}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-foreground/75 max-w-2xl leading-relaxed">
              Semua drama dan mini series dari{" "}
              <span className="text-foreground font-medium">{channel.name}</span>
              . Judul otomatis diterjemahkan ke Bahasa Indonesia, daftar
              ter-update tiap kreator upload episode baru.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-foreground/70">
              <div className="inline-flex items-center gap-2">
                <Tv2 className="h-4 w-4 text-primary" />
                <span>
                  <strong className="text-foreground">{channelVideos.length}</strong>{" "}
                  episode
                </span>
              </div>
              {subIndoCount > 0 && (
                <div>
                  <strong className="text-foreground">{subIndoCount}</strong>{" "}
                  judul Bahasa Indonesia
                </div>
              )}
              {heroVideo && (
                <div className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Update terakhir{" "}
                  <span className="text-foreground">
                    {new Date(heroVideo.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {heroVideo && (
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={`/drama/${heroVideo.videoId}`}>
                  <Button
                    size="lg"
                    className="rounded-full px-7 h-12 text-base font-semibold gap-2 shadow-2xl shadow-primary/20"
                  >
                    Tonton Episode Terbaru
                  </Button>
                </Link>
                <a
                  href={`https://www.youtube.com/channel/${channel.channelId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-youtube-channel"
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full px-7 h-12 text-base font-semibold backdrop-blur-md bg-white/10 hover:bg-white/15 border border-white/15 text-foreground"
                  >
                    Buka di YouTube
                  </Button>
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Episodes grid */}
      <section className="py-12">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
          {channelVideos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-10 text-center">
              <p className="text-foreground/70">
                Belum ada episode dari channel ini. Coba refresh sebentar lagi.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-end justify-between">
                <h2 className="font-serif text-2xl sm:text-3xl tracking-tight">
                  Semua episode
                </h2>
                <span className="text-sm text-foreground/60">
                  {channelVideos.length} episode • diurutkan dari yang terbaru
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {channelVideos.map((v, i) => (
                  <DramaCard
                    key={v.videoId}
                    video={v}
                    index={i}
                    showChannel={false}
                  />
                ))}
              </div>

              <AdSlot
                slot={import.meta.env.VITE_ADSENSE_SLOT_CHANNEL_BOTTOM}
                format="auto"
                className="mt-10"
              />
            </>
          )}
        </div>
      </section>

      <section className="border-t border-border/40 bg-card/20 py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-sm text-foreground/70 leading-relaxed">
          <p>
            Halaman ini mengkurasi seluruh drama yang dirilis channel{" "}
            <strong className="text-foreground">{channel.name}</strong> di
            YouTube. Video di-embed langsung dari channel resminya — kami
            tidak menyimpan atau mengunggah ulang video apa pun. Hak cipta
            sepenuhnya milik kreator. Untuk dukung kreator, klik{" "}
            <a
              href={`https://www.youtube.com/channel/${channel.channelId}`}
              target="_blank"
              rel="noopener noreferrer external"
              className="text-primary hover:underline"
            >
              subscribe channel-nya di YouTube
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
