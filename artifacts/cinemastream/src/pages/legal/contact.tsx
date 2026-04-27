import { Seo } from "@/components/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Mail, Tv2, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <Seo
        title="Kontak"
        description="Hubungi tim CinemaStream — untuk pertanyaan, saran, kerja sama, atau permintaan penghapusan konten."
        path="/contact"
      />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <Breadcrumbs
          items={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
          className="mb-6"
        />
        <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mt-3 mb-4">
          Kontak
        </h1>
        <p className="text-foreground/75 leading-relaxed mb-10">
          Punya pertanyaan, saran, atau ingin melaporkan masalah hak cipta?
          Pilih kategori di bawah ini dan kami akan membalas secepatnya.
        </p>

        <div className="grid gap-4 sm:grid-cols-1">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium text-lg">Pertanyaan umum</h2>
                <p className="mt-1 text-sm text-foreground/70">
                  Saran fitur, kerja sama, atau pertanyaan tentang situs.
                </p>
                <p className="mt-3 text-sm">
                  Email:{" "}
                  <a
                    href="mailto:hello@cinemastream.app"
                    className="text-primary hover:underline"
                  >
                    hello@cinemastream.app
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium text-lg">Hak cipta / DMCA</h2>
                <p className="mt-1 text-sm text-foreground/70">
                  Permintaan penghapusan video atau klaim hak cipta. Lihat
                  prosedur lengkapnya di{" "}
                  <a href="/dmca" className="text-primary hover:underline">
                    halaman DMCA
                  </a>
                  .
                </p>
                <p className="mt-3 text-sm">
                  Email:{" "}
                  <a
                    href="mailto:dmca@cinemastream.app"
                    className="text-primary hover:underline"
                  >
                    dmca@cinemastream.app
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Tv2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium text-lg">Channel kreator</h2>
                <p className="mt-1 text-sm text-foreground/70">
                  Kreator drama yang ingin channel-nya ditampilkan atau tidak
                  lagi ditampilkan di CinemaStream.
                </p>
                <p className="mt-3 text-sm">
                  Email:{" "}
                  <a
                    href="mailto:creators@cinemastream.app"
                    className="text-primary hover:underline"
                  >
                    creators@cinemastream.app
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-xs text-foreground/50">
          Estimasi waktu balas: 1–3 hari kerja. Untuk hal terkait video
          tertentu, mohon sertakan URL halaman CinemaStream-nya supaya kami
          bisa memproses lebih cepat.
        </p>
      </article>
    </>
  );
}
