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

export function filmPathForVideo(title: string, videoId: string): string {
  return `/film/${buildFilmSlug(title, videoId)}`;
}
