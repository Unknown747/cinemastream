import { Link } from "wouter";
import { Sailboat, ArrowUp } from "lucide-react";

const navLinks = [
  { href: "/", label: "Beranda", testId: "link-footer-home" },
  { href: "/drama", label: "Drama", testId: "link-footer-drama" },
  { href: "/blog", label: "Artikel", testId: "link-footer-blog" },
  { href: "/about", label: "Tentang", testId: "link-footer-about" },
  { href: "/contact", label: "Kontak", testId: "link-footer-contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privasi", testId: "link-footer-privacy" },
  { href: "/terms", label: "Syarat", testId: "link-footer-terms" },
  { href: "/dmca", label: "DMCA", testId: "link-footer-dmca" },
];

function scrollTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-border/60 bg-background mt-12"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1100px] px-3 sm:px-5 py-6">
        {/* Brand row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5"
            data-testid="link-footer-logo"
            aria-label="CinemaStream — Beranda"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md text-primary">
              <Sailboat className="h-6 w-6" strokeWidth={2.2} />
            </span>
            <span className="font-semibold text-base tracking-tight">
              Cinema<span className="text-primary">Stream</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={scrollTop}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs font-medium text-foreground/85 hover:border-primary/50 hover:text-foreground transition"
            data-testid="button-footer-scroll-top"
            aria-label="Kembali ke atas halaman"
          >
            <ArrowUp className="h-3.5 w-3.5" /> Ke atas
          </button>
        </div>

        {/* Nav links — single horizontal row */}
        <nav
          className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
          aria-label="Navigasi footer"
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-foreground/80 hover:text-primary transition-colors"
              data-testid={l.testId}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Legal row */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {legalLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-primary transition-colors"
              data-testid={l.testId}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <p className="mt-4 text-[11px] text-muted-foreground/85 leading-relaxed">
          © {year} CinemaStream. Situs ini tidak menyimpan file apa pun;
          seluruh konten disediakan oleh YouTube dan hak cipta tetap milik
          kreator masing-masing.
        </p>
      </div>
    </footer>
  );
}
