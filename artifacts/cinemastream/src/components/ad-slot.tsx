import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    __adsenseScriptLoaded?: boolean;
  }
}

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as
  | string
  | undefined;
const AUTO_ADS = import.meta.env.VITE_ADSENSE_AUTO_ADS === "true";

/**
 * Inject the AdSense loader script exactly once per page.
 * Auto Ads are enabled when VITE_ADSENSE_AUTO_ADS=true — Google then decides
 * placements automatically, on top of any manual <AdSlot /> units.
 */
function ensureAdsenseScript(): void {
  if (typeof window === "undefined") return;
  if (!ADSENSE_CLIENT) return;
  if (window.__adsenseScriptLoaded) return;
  window.__adsenseScriptLoaded = true;

  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(s);

  if (AUTO_ADS) {
    (window.adsbygoogle = window.adsbygoogle || []).push({
      google_ad_client: ADSENSE_CLIENT,
      enable_page_level_ads: true,
    });
  }
}

type AdSlotProps = {
  slot?: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  layout?: "in-article" | "in-feed";
  layoutKey?: string;
  responsive?: boolean;
  className?: string;
  label?: boolean;
};

/**
 * Renders a Google AdSense unit. No-op until VITE_ADSENSE_CLIENT is set,
 * keeping a placeholder space in dev so layout doesn't shift in production.
 */
export function AdSlot({
  slot,
  format = "auto",
  layout,
  layoutKey,
  responsive = true,
  className,
  label = true,
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return;
    ensureAdsenseScript();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore — script may not be loaded yet on first paint
    }
  }, [slot]);

  // Show nothing in production-like environment if not configured.
  if (!ADSENSE_CLIENT || !slot) {
    if (import.meta.env.DEV) {
      return (
        <div
          className={`my-8 rounded-lg border border-dashed border-border/40 bg-card/20 p-6 text-center text-xs text-foreground/40 ${className ?? ""}`}
          aria-hidden
        >
          [Slot iklan — set VITE_ADSENSE_CLIENT &amp; slot ID]
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`my-8 ${className ?? ""}`}>
      {label && (
        <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-foreground/40">
          Iklan
        </p>
      )}
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

/**
 * Sticky bottom anchor ad — the highest-RPM mobile format.
 * Mount once near the top of the React tree (App.tsx). Hidden on /admin.
 * Set VITE_ADSENSE_SLOT_STICKY_BOTTOM in env to activate.
 */
export function StickyBottomAd() {
  const slot = import.meta.env.VITE_ADSENSE_SLOT_STICKY_BOTTOM as
    | string
    | undefined;
  const insRef = useRef<HTMLModElement>(null);
  const [closed, setClosed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem("cs:sticky-ad-closed") === "1";
  });
  const [hideOnRoute, setHideOnRoute] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname;
    return path.startsWith("/admin") || path.startsWith("/dmca");
  });

  useEffect(() => {
    const onRoute = () => {
      const path = window.location.pathname;
      setHideOnRoute(path.startsWith("/admin") || path.startsWith("/dmca"));
    };
    window.addEventListener("popstate", onRoute);
    return () => window.removeEventListener("popstate", onRoute);
  }, []);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot || closed || hideOnRoute) return;
    ensureAdsenseScript();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore */
    }
  }, [slot, closed, hideOnRoute]);

  if (!ADSENSE_CLIENT || !slot || closed || hideOnRoute) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="complementary"
      aria-label="Iklan"
    >
      <div className="relative mx-auto max-w-[1100px] px-2 py-1">
        <button
          type="button"
          onClick={() => {
            window.sessionStorage.setItem("cs:sticky-ad-closed", "1");
            setClosed(true);
          }}
          className="absolute right-1 top-1 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-card/80 text-foreground/70 hover:text-foreground"
          aria-label="Tutup iklan"
          data-testid="button-close-sticky-ad"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <ins
          ref={insRef}
          className="adsbygoogle block"
          style={{ display: "block", minHeight: 50 }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
