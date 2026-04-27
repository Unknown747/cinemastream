import { Link } from "wouter";
import { Tv2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";

export default function NotFound() {
  return (
    <>
      <Seo
        title="Halaman tidak ditemukan"
        description="Halaman yang kamu cari tidak ada. Kembali ke beranda atau jelajahi daftar drama."
        path="/404"
        noindex
      />
      <section className="min-h-[80vh] flex items-center justify-center px-4 pt-20">
        <div className="text-center max-w-lg">
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
            Episode atau halaman yang kamu cari mungkin sudah dihapus atau
            tidak pernah ada. Yuk kembali dan pilih drama lain.
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
                Lihat Daftar Drama
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
