const WATCHLIST_KEY = "cinemastream:watchlist:v1";
const HISTORY_KEY = "cinemastream:history:v1";
const RESUME_PREFIX = "cinemastream:resume:";
const EVENT_WATCHLIST = "cinemastream:watchlist-changed";
const EVENT_HISTORY = "cinemastream:history-changed";
const EVENT_RESUME = "cinemastream:resume-changed";

export type WatchlistEntry = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelId: string;
  channelName: string;
  addedAt: string;
};

export type HistoryEntry = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelId: string;
  channelName: string;
  watchedAt: string;
  positionSec: number;
  durationSec: number;
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

function notify(event: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(event));
}

// ----- Watchlist -----

export function getWatchlist(): WatchlistEntry[] {
  return safeRead<WatchlistEntry[]>(WATCHLIST_KEY, []);
}

export function isInWatchlist(videoId: string): boolean {
  return getWatchlist().some((e) => e.videoId === videoId);
}

export function addToWatchlist(entry: Omit<WatchlistEntry, "addedAt">): void {
  const list = getWatchlist().filter((e) => e.videoId !== entry.videoId);
  list.unshift({ ...entry, addedAt: new Date().toISOString() });
  safeWrite(WATCHLIST_KEY, list.slice(0, 200));
  notify(EVENT_WATCHLIST);
}

export function removeFromWatchlist(videoId: string): void {
  const list = getWatchlist().filter((e) => e.videoId !== videoId);
  safeWrite(WATCHLIST_KEY, list);
  notify(EVENT_WATCHLIST);
}

export function toggleWatchlist(
  entry: Omit<WatchlistEntry, "addedAt">,
): boolean {
  if (isInWatchlist(entry.videoId)) {
    removeFromWatchlist(entry.videoId);
    return false;
  }
  addToWatchlist(entry);
  return true;
}

// ----- History / Continue Watching -----

export function getHistory(): HistoryEntry[] {
  return safeRead<HistoryEntry[]>(HISTORY_KEY, []);
}

export function recordHistory(entry: Omit<HistoryEntry, "watchedAt">): void {
  const list = getHistory().filter((e) => e.videoId !== entry.videoId);
  list.unshift({ ...entry, watchedAt: new Date().toISOString() });
  safeWrite(HISTORY_KEY, list.slice(0, 50));
  notify(EVENT_HISTORY);
}

export function removeHistory(videoId: string): void {
  const list = getHistory().filter((e) => e.videoId !== videoId);
  safeWrite(HISTORY_KEY, list);
  notify(EVENT_HISTORY);
}

export function clearHistory(): void {
  safeWrite(HISTORY_KEY, []);
  notify(EVENT_HISTORY);
}

export function getResumePosition(videoId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(RESUME_PREFIX + videoId);
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n > 5 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveResumePosition(videoId: string, sec: number): void {
  if (typeof window === "undefined") return;
  try {
    if (sec > 5) {
      window.localStorage.setItem(RESUME_PREFIX + videoId, String(Math.floor(sec)));
    }
    notify(EVENT_RESUME);
  } catch {
    /* noop */
  }
}

export function clearResumePosition(videoId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RESUME_PREFIX + videoId);
    notify(EVENT_RESUME);
  } catch {
    /* noop */
  }
}

// ----- Subscription helpers (React) -----

export function subscribeWatchlist(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT_WATCHLIST, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT_WATCHLIST, cb);
    window.removeEventListener("storage", cb);
  };
}

export function subscribeHistory(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT_HISTORY, cb);
  window.addEventListener(EVENT_RESUME, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT_HISTORY, cb);
    window.removeEventListener(EVENT_RESUME, cb);
    window.removeEventListener("storage", cb);
  };
}

export function formatTime(sec: number): string {
  const total = Math.max(0, Math.floor(sec));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
