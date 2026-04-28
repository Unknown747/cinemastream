import { useMemo } from "react";
import { Link } from "wouter";
import { Tv2, Search } from "lucide-react";
import {
  useListAllVideos,
  getListAllVideosQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";
import { isTrailer } from "@/lib/video-meta";

export default function NotFound() {
  const { data } = useListAllVideos({
    query: { queryKey: getListAllVideosQueryKey(), staleTime: 60_000 },
  });

  const suggestions = useMemo(() => {
    const list = (data ?? []).filter((v) => !isTrailer(v));
    return list.slice(0, 6);
  }, [data]);

  return (
    <>
      <Seo
        title="Halaman tidak ditemukan"
        description="Halaman yang kamu cari tidak ada. Kembali ke beranda atau jelajahi daftar drama."
        path="/404"
        noindex
      />
      <section className="min-h-[80vh] flex items-center justify-center px-4 pt-20 pb-16">
        <div className="text-center max-w-3xl w-full">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8">
            <Tv2 className="h-10 w-10" strokeWidth={1.75} />
          </div>
          <p className="text-sm font-mono uppercase tracking-widest text-primary mb-3">
            404
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tight mb-5">
            Halaman tidak ditemukan
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            Halaman yang kamu cari mungkin sudah dihapus atau
            tidak pernah ada. Yuk kembali dan pilih film lain.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/" data-testid="link-404-home">
              <Button size="lg" className="rounded-full px-7">
                Kembali ke Beranda
              </Button>
            </Link>
            <Link href="/drama" data-testid="link-404-browse">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full px-7"
              >
                <Search className="mr-1.5 h-4 w-4" />
                Cari film
              </Button>
            </Link>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-12 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50 mb-4 text-center">
                Film populer untuk dijelajahi
              </p>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {suggestions.map((v) => (
                  <li key={v.videoId}>
                    <Link
                      href={`/drama/${v.videoId}`}
                      className="group block rounded-md border border-border/60 bg-card/40 overflow-hidden hover:border-primary/40 transition"
                      data-testid={`link-404-suggestion-${v.videoId}`}
                    >
                      <div className="relative aspect-video bg-black">
                        <img
                          src={v.thumbnailUrl}
                          alt={v.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-semibold leading-snug line-clamp-2">
                          {v.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                          {v.channelName}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
