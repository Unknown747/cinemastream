import { useMemo } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import { useListAllVideos, getListAllVideosQueryKey } from "@workspace/api-client-react";
import { Seo } from "@/components/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { YouTubeAttribution } from "@/components/youtube-attribution";
import { VideoDescription } from "@/components/video-description";
import { StreamingPlayer } from "@/components/streaming-player";
import { AdSlot } from "@/components/ad-slot";

export default function DramaDetailPage() {
  const [, params] = useRoute<{ videoId: string }>("/drama/:videoId");
  const videoId = params?.videoId ?? "";
  const { data, isLoading } = useListAllVideos({
    query: { queryKey: getListAllVideosQueryKey(), staleTime: 60_000 },
  });

  const video = useMemo(
    () => data?.find((v) => v.videoId === videoId),
    [data, videoId],
  );

  const related = useMemo(
    () =>
      (data ?? [])
        .filter((v) => v.videoId !== videoId && v.channelId === video?.channelId)
        .slice(0, 6),
    [data, video, videoId],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-32 text-center">
        <p className="text-foreground/70">Video tidak ditemukan.</p>
        <Link href="/drama" className="mt-4 inline-block text-primary hover:underline">
          ← Kembali ke Drama
        </Link>
      </div>
    );
  }

  const publishedDate = new Date(video.publishedAt).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Seo
        title={`${video.title} — Nonton Drama China Sub Indo`}
        description={
          video.description?.slice(0, 200) ||
          `Tonton ${video.title} di CinemaStream. Drama China dengan judul Bahasa Indonesia, update otomatis dari channel ${video.channelName}.`
        }
        path={`/drama/${video.videoId}`}
        ogImage={video.thumbnailUrl}
        imageAlt={`Cuplikan ${video.title}`}
        ogType="video.other"
        publishedTime={video.publishedAt}
        keywords={[
          "drama china",
          "drama mandarin",
          "drama china sub indo",
          video.channelName,
          "nonton drama china",
        ]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: video.title,
            alternateName: video.originalTitle,
            description:
              video.description?.slice(0, 500) ||
              `Drama China dari channel ${video.channelName}, dengan judul Bahasa Indonesia.`,
            thumbnailUrl: [video.thumbnailUrl],
            uploadDate: video.publishedAt,
            embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
            contentUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
            inLanguage: "zh-CN",
            isFamilyFriendly: true,
            publisher: {
              "@type": "Organization",
              name: video.channelName,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Beranda", item: "/" },
              { "@type": "ListItem", position: 2, name: "Drama", item: "/drama" },
              {
                "@type": "ListItem",
                position: 3,
                name: video.title,
                item: `/drama/${video.videoId}`,
              },
            ],
          },
        ]}
      />

      <section className="pt-24 pb-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <Breadcrumbs
            items={[
              { label: "Beranda", href: "/" },
              { label: "Drama", href: "/drama" },
              { label: video.channelName, href: `/channel/${video.channelId}` },
              { label: video.title },
            ]}
            className="mb-4"
          />
          <Link
            href="/drama"
            className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
            data-testid="link-back-drama"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Drama
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]"
          >
            <div>
              <StreamingPlayer
                videoId={video.videoId}
                title={video.title}
                channelName={video.channelName}
                thumbnailUrl={video.thumbnailUrl}
                publishedDate={publishedDate}
              />

              <h1 className="mt-6 font-serif text-2xl sm:text-3xl leading-tight">
                {video.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/60">
                <Link
                  href={`/channel/${video.channelId}`}
                  className="text-primary hover:underline"
                  data-testid="link-channel-from-detail"
                >
                  {video.channelName}
                </Link>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {publishedDate}
                </span>
                {video.hasOverride && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Judul Bahasa Indonesia
                  </span>
                )}
              </div>

              <YouTubeAttribution
                videoId={video.videoId}
                channelName={video.channelName}
                channelId={video.channelId}
                hasOverride={video.hasOverride}
              />

              <AdSlot slot={import.meta.env.VITE_ADSENSE_SLOT_IN_ARTICLE} format="fluid" layout="in-article" />

              <h2 className="mt-8 font-serif text-xl">Tentang episode ini</h2>
              <VideoDescription
                description={video.description}
                channelName={video.channelName}
                hasOverride={video.hasOverride}
              />
            </div>

            <aside>
              <AdSlot slot={import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR} format="auto" className="mt-0 mb-6" />
              <h2 className="font-serif text-xl">Episode lain</h2>
              <div className="mt-4 flex flex-col gap-3">
                {related.length === 0 && (
                  <p className="text-sm text-foreground/60">Tidak ada episode lain.</p>
                )}
                {related.map((r) => (
                  <Link
                    key={r.videoId}
                    href={`/drama/${r.videoId}`}
                    className="group flex gap-3 overflow-hidden rounded-lg border border-border/60 bg-card/40 p-2 transition-colors hover:border-primary/40"
                    data-testid={`link-related-${r.videoId}`}
                  >
                    <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded bg-black">
                      <img
                        src={r.thumbnailUrl}
                        alt={r.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1 py-1">
                      <h3 className="line-clamp-2 text-xs font-medium leading-snug">
                        {r.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </motion.div>
        </div>
      </section>
    </>
  );
}
