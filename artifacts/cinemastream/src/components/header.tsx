import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Tv2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/drama", label: "Drama" },
  { href: "/blog", label: "Artikel" },
  { href: "/about", label: "Tentang" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [location, navigate] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60"
          : "bg-gradient-to-b from-background/80 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            data-testid="link-home-logo"
            aria-label="CinemaStream — Beranda"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Tv2 className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <span className="font-serif text-xl tracking-tight">
              Cinema<span className="text-primary">Stream</span>
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Navigasi utama"
          >
            {links.map((l) => {
              const active = location === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors hover-elevate ${
                    active ? "text-primary" : "text-foreground/80 hover:text-foreground"
                  }`}
                  data-testid={`link-nav-${l.label.toLowerCase()}`}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/drama")}
              className="rounded-full"
              data-testid="button-search-icon"
              aria-label="Cari drama"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setOpen((o) => !o)}
              aria-label="Buka menu"
              aria-expanded={open}
              data-testid="button-mobile-menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <nav
            className="mx-auto max-w-[1600px] px-4 py-3 flex flex-col gap-1"
            aria-label="Navigasi mobile"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-3 rounded-md text-base font-medium hover-elevate"
                data-testid={`link-mobile-${l.label.toLowerCase()}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
