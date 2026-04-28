import { useMemo } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Clock, User } from "lucide-react";
import {
  useGetArticle,
  useListChannels,
  getGetArticleQueryKey,
  getListChannelsQueryKey,
} from "@workspace/api-client-react";
import { Seo } from "@/components/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdSlot } from "@/components/ad-slot";
import { absoluteUrl } from "@/lib/site";
import {
  renderMarkdown,
  readingTimeMinutes,
  plainTextSnippet,
} from "@/lib/markdown";

export default function BlogDetailPage() {
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  const slug = params?.slug ?? "";

  const { data: article, isLoading } = useGetArticle(slug, {
    query: { queryKey: getGetArticleQueryKey(slug), enabled: !!slug },
  });
  const channels = useListChannels({
    query: { queryKey: getListChannelsQueryKey(), staleTime: 60_000 },
  });

  const html = useMemo(
    () => (article ? renderMarkdown(article.content) : ""),
    [article],
  );
  const readingTime = useMemo(
    () => (article ? readingTimeMinutes(article.content) : 0),
    [article],
  );
  const linkedChannel = useMemo(
    () =>
      article?.channelId
        ? channels.data?.find((c) => c.channelId === article.channelId)
        : undefined,
    [article, channels.data],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <>
        <Seo
          title="Artikel tidak ditemukan"
          description="Artikel yang kamu cari tidak tersedia."
          path={`/blog/${slug}`}
          noindex
        />
        <div className="mx-auto max-w-3xl px-6 pt-32 text-center">
          <p className="text-foreground/70">Artikel tidak ditemukan.</p>
          <Link
            href="/blog"
            className="mt-4 inline-block text-primary hover:underline"
          >
            ← Kembali ke daftar artikel
          </Link>
        </div>
      </>
    );
  }

  const publishedISO = article.publishedAt
    ? new Date(article.publishedAt).toISOString()
    : new Date(article.createdAt).toISOString();
  const updatedISO = new Date(article.updatedAt).toISOString();
  const publishedHuman = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const seoDescription = plainTextSnippet(article.excerpt, 200);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: seoDescription,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: publishedISO,
    dateModified: updatedISO,
    author: { "@type": "Person", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "CinemaStream",
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `/blog/${article.slug}` },
    inLanguage: "id-ID",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Artikel", item: absoluteUrl("/blog") },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: absoluteUrl(`/blog/${article.slug}`),
      },
    ],
  };

  return (
    <>
      <Seo
        title={article.title}
        description={seoDescription}
        path={`/blog/${article.slug}`}
        ogType="article"
        ogImage={article.coverImage ?? undefined}
        imageAlt={article.title}
        publishedTime={publishedISO}
        jsonLd={[breadcrumbJsonLd, articleJsonLd]}
      />

      <article className="pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Beranda", href: "/" },
              { label: "Artikel", href: "/blog" },
              { label: article.title },
            ]}
            className="mb-4"
          />
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
            data-testid="link-back-blog"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke artikel
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
              {article.title}
            </h1>
            <p className="mt-4 text-lg text-foreground/75 leading-relaxed">
              {article.excerpt}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground/60">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {article.author}
              </span>
              {publishedHuman && <span>{publishedHuman}</span>}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} menit baca
              </span>
            </div>
          </motion.header>

          {article.coverImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-8 overflow-hidden rounded-2xl bg-black aspect-[16/9]"
            >
              <img
                src={article.coverImage}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}

          <div
            className="prose prose-invert prose-lg mt-10 max-w-none prose-headings:font-serif prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {linkedChannel && (
            <div className="mt-12 rounded-2xl border border-border/60 bg-card/30 p-6">
              <p className="text-xs uppercase tracking-widest text-foreground/50">
                Drama terkait
              </p>
              <h2 className="mt-2 font-serif text-xl">
                Tonton drama dari{" "}
                <Link
                  href={`/channel/${linkedChannel.channelId}`}
                  className="text-primary hover:underline"
                  data-testid="link-related-channel"
                >
                  {linkedChannel.name}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-foreground/70">
                Lihat semua drama yang dibahas di artikel ini langsung di
                halaman channel-nya.
              </p>
            </div>
          )}

          <AdSlot
            slot={import.meta.env.VITE_ADSENSE_SLOT_IN_ARTICLE}
            format="fluid"
            layout="in-article"
          />
        </div>
      </article>
    </>
  );
}
