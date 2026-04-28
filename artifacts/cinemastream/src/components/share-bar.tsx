import { useState } from "react";
import { Check, Copy, Facebook, MessageCircle, Send, Twitter } from "lucide-react";

type ShareBarProps = {
  url: string;
  title: string;
  text?: string;
};

const BTN_BASE =
  "inline-flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 text-sm font-medium text-foreground/85 transition hover:border-primary/60 hover:text-foreground";

export function ShareBar({ url, title, text }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const shareText = text ?? `Nonton ${title} di CinemaStream`;
  const enc = encodeURIComponent;
  const links = {
    whatsapp: `https://wa.me/?text=${enc(`${shareText} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${enc(url)}&text=${enc(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(shareText)}`,
  };

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* noop */
    }
  };

  return (
    <div
      className="mt-4 flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Bagikan video"
    >
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BTN_BASE} hover:bg-emerald-500/10 hover:border-emerald-500/60`}
        aria-label="Bagikan ke WhatsApp"
        data-testid="share-whatsapp"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
      <a
        href={links.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BTN_BASE} hover:bg-sky-500/10 hover:border-sky-500/60`}
        aria-label="Bagikan ke Telegram"
        data-testid="share-telegram"
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">Telegram</span>
      </a>
      <a
        href={links.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BTN_BASE} hover:bg-blue-500/10 hover:border-blue-500/60`}
        aria-label="Bagikan ke Facebook"
        data-testid="share-facebook"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </a>
      <a
        href={links.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BTN_BASE} hover:bg-foreground/10`}
        aria-label="Bagikan ke X (Twitter)"
        data-testid="share-twitter"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">X / Twitter</span>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className={`${BTN_BASE} hover:bg-primary/10`}
        aria-label="Salin tautan"
        data-testid="share-copy"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span className="hidden sm:inline">
          {copied ? "Tersalin" : "Salin tautan"}
        </span>
      </button>
    </div>
  );
}
