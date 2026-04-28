import { Link } from "wouter";
import { Sailboat, Rss, ArrowUp } from "lucide-react";

type LinkItem = { href: string; label: string; testId: string };

const exploreLinks: LinkItem[] = [
  { href: "/", label: "Beranda", testId: "link-footer-home" },
  { href: "/drama", label: "Semua Drama", testId: "link-footer-drama" },
  { href: "/blog", label: "Artikel", testId: "link-footer-blog" },
  { href: "/watchlist", label: "Daftar Saya", testId: "link-footer-watchlist" },
];

const aboutLinks: LinkItem[] = [
  { href: "/about", label: "Tentang", testId: "link-footer-about" },
  { href: "/contact", label: "Kontak", testId: "link-footer-contact" },
];

const legalLinks: LinkItem[] = [
  { href: "/privacy", label: "Kebijakan Privasi", testId: "link-footer-privacy" },
  { href: "/terms", label: "Syarat & Ketentuan", testId: "link-footer-terms" },
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
      <div className="mx-auto max-w-[1100px] px-3 sm:px-5 py-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
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
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Streaming drama China &amp; mini series Mandarin dengan judul
              Bahasa Indonesia, update otomatis dari channel YouTube resmi.
            </p>
            <a
              href="/api/feed.xml"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-foreground/70 hover:text-primary transition-colors"
              data-testid="link-footer-rss"
              aria-label="RSS feed CinemaStream"
            >
              <Rss className="h-3.5 w-3.5" /> RSS Feed
            </a>
          </div>

          <FooterColumn title="Jelajahi" links={exploreLinks} />
          <FooterColumn title="Perusahaan" links={aboutLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-8 border-t border-border/60 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[11px] text-muted-foreground/85 leading-relaxed max-w-xl">
            © {year} CinemaStream. Situs ini tidak menyimpan file apa pun di
            servernya. Semua konten disediakan oleh YouTube. Hak cipta tetap
            milik kreator masing-masing.
          </p>
          <button
            type="button"
            onClick={scrollTop}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs font-medium text-foreground/85 hover:border-primary/50 hover:text-foreground transition"
            data-testid="button-footer-scroll-top"
            aria-label="Kembali ke atas halaman"
          >
            <ArrowUp className="h-3.5 w-3.5" /> Kembali ke atas
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: LinkItem[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60 mb-3">
        {title}
      </h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-foreground/85 hover:text-primary transition-colors"
              data-testid={l.testId}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
