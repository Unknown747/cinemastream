import { filmHrefForVideo, filmHrefForMovie } from "@/lib/slug";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Bookmark, History, Trash2, Play } from "lucide-react";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import {
  getWatchlist,
  getHistory,
  removeFromWatchlist,
  removeHistory,
  clearHistory,
  subscribeWatchlist,
  subscribeHistory,
  formatTime,
  type WatchlistEntry,
  type HistoryEntry,
} from "@/lib/storage";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [tab, setTab] = useState<"watchlist" | "history">("watchlist");

  useEffect(() => {
    const sync = () => {
      setWatchlist(getWatchlist());
      setHistory(getHistory());
    };
    sync();
    const off1 = subscribeWatchlist(sync);
    const off2 = subscribeHistory(sync);
    return () => {
      off1();
      off2();
    };
  }, []);

  const inProgress = history.filter(
    (h) => h.durationSec > 0 && h.positionSec > 5 && h.durationSec - h.positionSec > 30,
  );

  return (
    <>
      <Seo
        title="Daftar Tonton & Riwayat — CinemaStream"
        description="Daftar Tonton dan riwayat film yang kamu tonton di CinemaStream. Lanjutkan film yang belum selesai."
        path="/watchlist"
        noindex
      />

      <div className="mx-auto max-w-[1100px] px-3 sm:px-5 pt-6 pb-12">
        <h1 className="font-serif text-3xl sm:text-4xl tracking-tight">
          Daftar Saya
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Film yang kamu simpan dan riwayat tontonan tersimpan di perangkat ini.
        </p>

        <div className="mt-5 inline-flex rounded-md border border-border/70 bg-secondary/40 p-0.5">
          <button
            type="button"
            onClick={() => setTab("watchlist")}
            className={`inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-sm font-medium transition ${
              tab === "watchlist"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/85 hover:text-foreground"
            }`}
            data-testid="tab-watchlist"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Daftar Tonton ({watchlist.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-sm font-medium transition ${
              tab === "history"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/85 hover:text-foreground"
            }`}
            data-testid="tab-history"
          >
            <History className="h-3.5 w-3.5" />
            Riwayat ({history.length})
          </button>
        </div>

        {tab === "watchlist" ? (
          <section className="mt-6">
            {watchlist.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-10 text-center">
                <Bookmark className="mx-auto h-8 w-8 text-foreground/40" />
                <p className="mt-3 text-foreground/80">
                  Daftar Tonton kamu masih kosong.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Klik ikon bookmark di poster film untuk menyimpannya ke sini.
                </p>
                <Link
                  href="/drama"
                  className="mt-5 inline-block text-sm text-primary hover:underline"
                  data-testid="link-empty-watchlist-browse"
                >
                  Jelajahi film →
                </Link>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {watchlist.map((w) => (
                  <li
                    key={w.videoId}
                    className="group flex gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5 hover:border-primary/40 transition"
                    data-testid={`row-watchlist-${w.videoId}`}
                  >
                    <Link
                      href={filmHrefForVideo(w.title, w.videoId)}
                      className="relative aspect-video w-32 shrink-0 overflow-hidden rounded bg-black"
                    >
                      <img
                        src={w.thumbnailUrl}
                        alt={w.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    <div className="min-w-0 flex-1 py-0.5">
                      <Link
                        href={filmHrefForVideo(w.title, w.videoId)}
                        className="block text-sm font-semibold leading-snug line-clamp-2 hover:text-primary"
                      >
                        {w.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {w.channelName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                        Disimpan{" "}
                        {new Date(w.addedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromWatchlist(w.videoId)}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                        data-testid={`button-remove-watchlist-${w.videoId}`}
                      >
                        <Trash2 className="h-3 w-3" /> Hapus
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section className="mt-6">
            {history.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-10 text-center">
                <History className="mx-auto h-8 w-8 text-foreground/40" />
                <p className="mt-3 text-foreground/80">
                  Riwayat masih kosong.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mulai nonton film dan riwayat akan tampil di sini.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{inProgress.length} film belum selesai · {history.length} total</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Bersihkan seluruh riwayat?")) clearHistory();
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive"
                    data-testid="button-clear-history"
                  >
                    Bersihkan riwayat
                  </button>
                </div>
                <ul className="space-y-2">
                  {history.map((h) => {
                    const pct =
                      h.durationSec > 0
                        ? Math.min(100, Math.round((h.positionSec / h.durationSec) * 100))
                        : 0;
                    return (
                      <li
                        key={h.videoId}
                        className="group flex gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5 hover:border-primary/40 transition"
                        data-testid={`row-history-${h.videoId}`}
                      >
                        <Link
                          href={filmHrefForVideo(h.title, h.videoId)}
                          className="relative aspect-video w-36 shrink-0 overflow-hidden rounded bg-black"
                        >
                          <img
                            src={h.thumbnailUrl}
                            alt={h.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {pct > 0 && (
                            <span className="absolute inset-x-0 bottom-0 h-1 bg-black/50">
                              <span
                                className="block h-full bg-primary"
                                style={{ width: `${pct}%` }}
                              />
                            </span>
                          )}
                          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition">
                            <Play className="h-7 w-7 text-white fill-current" />
                          </span>
                        </Link>
                        <div className="min-w-0 flex-1 py-0.5">
                          <Link
                            href={filmHrefForVideo(h.title, h.videoId)}
                            className="block text-sm font-semibold leading-snug line-clamp-2 hover:text-primary"
                          >
                            {h.title}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            {h.channelName}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                            {h.durationSec > 0
                              ? `${formatTime(h.positionSec)} / ${formatTime(h.durationSec)} · ${pct}%`
                              : "Belum ada durasi"}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeHistory(h.videoId)}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                            data-testid={`button-remove-history-${h.videoId}`}
                          >
                            <Trash2 className="h-3 w-3" /> Hapus
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>
        )}

        <p className="mt-8 text-xs text-muted-foreground">
          Daftar dan riwayat ini disimpan di perangkat kamu (browser ini saja),
          tidak terkirim ke server. Hapus riwayat browser akan menghapus daftar ini juga.
        </p>

        <div className="mt-8">
          <Link href="/drama">
            <Button variant="secondary" data-testid="link-back-drama-from-watchlist">
              Jelajahi semua film
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
