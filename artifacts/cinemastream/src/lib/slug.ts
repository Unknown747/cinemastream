const YOUTUBE_ID_LENGTH = 11;
const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function slugify(input: string): string {
  return (input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildFilmSlug(title: string, videoId: string): string {
  const base = slugify(title);
  if (!base) return videoId;
  return `${base}-${videoId}`;
}

export function extractVideoIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  if (slug.length < YOUTUBE_ID_LENGTH) return null;
  const candidate = slug.slice(-YOUTUBE_ID_LENGTH);
  return YOUTUBE_ID_RE.test(candidate) ? candidate : null;
}

export function filmHrefForMovie(movieId: string): string {
  return `/film/${movieId}`;
}

export function filmHrefForVideo(title: string, videoId: string): string {
  return `/film/${buildFilmSlug(title, videoId)}`;
}
