import { Link } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Newspaper, Clock } from "lucide-react";
import {
  useListArticles,
  getListArticlesQueryKey,
} from "@workspace/api-client-react";
import { Seo } from "@/components/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdSlot } from "@/components/ad-slot";

export default function BlogPage() {
  const { data, isLoading } = useListArticles(undefined, {
    query: { queryKey: getListArticlesQueryKey(), staleTime: 60_000 },
  });

  const articles = data ?? [];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Artikel CinemaStream",
    numberOfItems: articles.length,
    itemListElement: articles.slice(0, 30).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `/blog/${a.slug}`,
      name: a.title,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: "/" },
      { "@type": "ListItem", position: 2, name: "Artikel", item: "/blog" },
    ],
  };

  return (
    <>
      <Seo
        title="Artikel & Berita Drama China"
        description="Ulasan, rekomendasi, dan berita seputar drama China dan mini series Mandarin. Ditulis oleh tim editorial CinemaStream."
        path="/blog"
        keywords={[
          "artikel drama china",
          "berita drama mandarin",
          "ulasan drama",
          "rekomendasi drama china",
        ]}
        jsonLd={[breadcrumbJsonLd, itemListJsonLd]}
      />

      <section className="pt-28 pb-10 border-b border-border/40">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: "Beranda", href: "/" }, { label: "Artikel" }]}
            className="mb-3"
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            <Newspaper className="h-3.5 w-3.5" />
            Editorial
          </div>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight">
            Artikel & Berita Drama
          </h1>
          <p className="mt-3 text-foreground/70 leading-relaxed max-w-2xl">
            Ulasan, panduan tonton, dan berita seputar drama China pilihan tim
            CinemaStream.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-card/30 p-10 text-center">
              <p className="text-foreground/70">
                Belum ada artikel. Tim editorial sedang menyiapkan ulasan
                pertama!
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((a, i) => (
                <motion.article
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <Link
                    href={`/blog/${a.slug}`}
                    className="group block overflow-hidden rounded-xl border border-border/60 bg-card/30 transition hover:border-primary/40"
                    data-testid={`link-article-${a.slug}`}
                  >
                    {a.coverImage ? (
                      <div className="relative aspect-[16/9] overflow-hidden bg-black">
                        <img
                          src={a.coverImage}
                          alt={a.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-card" />
                    )}
                    <div className="p-5">
                      <h2 className="font-serif text-xl leading-snug text-foreground group-hover:text-primary transition-colors">
                        {a.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm text-foreground/70 leading-relaxed">
                        {a.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-xs text-foreground/50">
                        <span>{a.author}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {a.publishedAt
                            ? new Date(a.publishedAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : "Draf"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}

          <AdSlot
            slot={import.meta.env.VITE_ADSENSE_SLOT_BLOG_BOTTOM}
            format="auto"
            className="mt-10"
          />
        </div>
      </section>
    </>
  );
}
