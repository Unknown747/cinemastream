import { Link } from "wouter";
import { Tv2, Languages } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t border-border/60 bg-card/30 mt-20"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
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
              Agregator drama China dan mini series Mandarin dari channel
              YouTube pilihan. Judul otomatis dialihbahasakan ke Indonesia.
              Semua video di-embed dari YouTube — kami tidak menyimpan video
              apa pun.
            </p>
            <p className="mt-4 inline-flex items-start gap-2 rounded-md bg-card/60 border border-border/60 px-3 py-2 text-xs text-foreground/70 max-w-md">
              <Languages className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                Judul Indonesia dihasilkan AI penerjemah. Judul asli kreator
                tersedia di setiap halaman drama.
              </span>
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
                  href="/blog"
                  className="hover:text-foreground transition-colors"
                  data-testid="link-footer-blog"
                >
                  Artikel
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
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                  data-testid="link-footer-contact"
                >
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-4 text-sm tracking-wide uppercase">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                  data-testid="link-footer-privacy"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                  data-testid="link-footer-terms"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="/dmca"
                  className="hover:text-foreground transition-colors"
                  data-testid="link-footer-dmca"
                >
                  DMCA
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
              <li>Streaming via YouTube embed</li>
              <li>Tanpa akun, tanpa pop-up</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {year} CinemaStream. Semua video di-embed dari YouTube. Hak cipta
            tetap milik kreator masing-masing.
          </p>
          <p className="font-mono tracking-wide">Dibuat untuk pencinta drama</p>
        </div>
      </div>
    </footer>
  );
}
