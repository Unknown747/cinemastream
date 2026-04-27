import { Link } from "wouter";
import { Tv2 } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t border-border/60 bg-card/30 mt-20"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
              data-testid="link-footer-logo"
              aria-label="CinemaStream — Beranda"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Tv2 className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <span className="font-serif text-xl tracking-tight">
                Cinema<span className="text-primary">Stream</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
              Tempat nonton drama China dan mini series Mandarin terbaru.
              Judul otomatis dialihbahasakan ke Indonesia, update tiap kreator
              upload episode baru.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-4 text-sm tracking-wide uppercase">
              Jelajahi
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                  data-testid="link-footer-home"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/drama"
                  className="hover:text-foreground transition-colors"
                  data-testid="link-footer-drama"
                >
                  Daftar Drama
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                  data-testid="link-footer-about"
                >
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-4 text-sm tracking-wide uppercase">
              Info
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Update otomatis tiap 5 menit</li>
              <li>Judul Mandarin → Bahasa Indonesia</li>
              <li>Streaming via YouTube embed</li>
              <li>Tanpa akun, tanpa iklan</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {year} CinemaStream. Semua video di-embed dari YouTube. Hak cipta
            milik kreator masing-masing.
          </p>
          <p className="font-mono tracking-wide">Dibuat untuk pencinta drama</p>
        </div>
      </div>
    </footer>
  );
}
