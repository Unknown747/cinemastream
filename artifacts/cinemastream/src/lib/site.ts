export const SITE_URL = "https://cinemastream.app";
export const SITE_NAME = "CinemaStream";

export function absoluteUrl(path: string = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
