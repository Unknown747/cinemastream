import { Link } from "wouter";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t border-border/60 bg-background mt-12"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1100px] px-3 sm:px-5">
        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-4 text-sm font-medium border-b border-border/60"
          aria-label="Navigasi footer"
        >
          <Link
            href="/privacy"
            className="text-foreground/85 hover:text-foreground"
            data-testid="link-footer-privacy"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-foreground/85 hover:text-foreground"
            data-testid="link-footer-terms"
          >
            Terms
          </Link>
          <Link
            href="/dmca"
            className="text-foreground/85 hover:text-foreground"
            data-testid="link-footer-dmca"
          >
            DMCA
          </Link>
          <Link
            href="/contact"
            className="text-foreground/85 hover:text-foreground"
            data-testid="link-footer-contact"
          >
            Kontak
          </Link>
          <Link
            href="/about"
            className="text-foreground/85 hover:text-foreground"
            data-testid="link-footer-about"
          >
            Tentang
          </Link>
        </nav>

        <div className="py-5 text-center">
          <p className="text-sm font-semibold text-foreground">
            CinemaStream — Streaming Drama China &amp; Mini Series Subtitle Indonesia.
          </p>
          <p className="mt-2 max-w-2xl mx-auto text-xs text-muted-foreground leading-relaxed">
            Disclaimer: situs ini{" "}
            <span className="text-primary font-medium">CinemaStream</span> tidak
            menyimpan file apa pun di servernya. Semua konten disediakan oleh
            pihak ketiga (YouTube) yang tidak berafiliasi. Hak cipta tetap milik
            kreator masing-masing. Judul Bahasa Indonesia dihasilkan oleh AI
            penerjemah.
          </p>
          <p className="mt-3 text-[11px] text-muted-foreground/80">
            © {year} CinemaStream. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
