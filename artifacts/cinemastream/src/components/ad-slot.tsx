import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

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
      <Helmet>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </Helmet>
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
