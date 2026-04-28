export type VideoLike = {
  title: string;
  originalTitle?: string;
  description?: string;
};

const TRAILER_RX =
  /\b(trailer|teaser|cuplikan|preview|sneak[\s-]?peek|behind[\s-]?the[\s-]?scene|bts|highlights?|recap|opening|ending|promo|coming\s+soon|官方预告|预告片|预告|片花|花絮)\b/i;

const PART_RX = /\b(part|bagian|episode|ep|chap|chapter)\s*([0-9]{1,3})\b/i;

const SUB_RX = /\b(sub\s*indo|sub\s*indonesia|subtitle\s*indonesia)\b/i;
const ENG_RX = /\b(sub\s*eng|english\s*sub|eng\s*sub)\b/i;
const MANDARIN_RX = /\b(mandarin|chinese|中文|国语)\b/i;

export type DetectedTags = {
  isTrailer: boolean;
  partNumber: number | null;
  partType: string | null;
  language: "id" | "en" | "zh" | null;
};

export function detectTags(v: VideoLike): DetectedTags {
  const haystack = `${v.title} ${v.originalTitle ?? ""}`;

  const isTrailer = TRAILER_RX.test(haystack);

  let partNumber: number | null = null;
  let partType: string | null = null;
  const m = haystack.match(PART_RX);
  if (m) {
    const n = parseInt(m[2], 10);
    if (Number.isFinite(n) && n > 0 && n < 200) {
      partNumber = n;
      partType = m[1].toLowerCase();
    }
  }

  let language: DetectedTags["language"] = null;
  if (SUB_RX.test(haystack)) language = "id";
  else if (ENG_RX.test(haystack)) language = "en";
  else if (MANDARIN_RX.test(haystack)) language = "zh";

  return { isTrailer, partNumber, partType, language };
}

export function isTrailer(v: VideoLike): boolean {
  return detectTags(v).isTrailer;
}
