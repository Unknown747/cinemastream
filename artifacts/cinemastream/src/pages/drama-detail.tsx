import { useMemo } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import { useListAllVideos, getListAllVideosQueryKey } from "@workspace/api-client-react";
import { Seo } from "@/components/seo";

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
        title={`${video.title} | CinemaStream Drama`}
        description={video.description.slice(0, 200)}
        path={`/drama/${video.videoId}`}
        ogImage={video.thumbnailUrl}
        ogType="video.other"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: video.title,
          description: video.description.slice(0, 500),
          thumbnailUrl: video.thumbnailUrl,
          uploadDate: video.publishedAt,
          embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
          contentUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
        }}
      />

      <section className="pt-24 pb-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
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
              <div className="overflow-hidden rounded-xl border border-border/60 bg-black aspect-video">
                <iframe
                  key={video.videoId}
                  src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1&autoplay=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>

              <h1 className="mt-6 font-serif text-2xl sm:text-3xl leading-tight">
                {video.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/60">
                <span>{video.channelName}</span>
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

              <div className="mt-6 whitespace-pre-wrap text-sm text-foreground/80">
                {video.description}
              </div>
            </div>

            <aside>
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
