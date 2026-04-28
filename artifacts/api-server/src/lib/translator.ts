import OpenAI from "openai";
import { logger } from "./logger";

const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const MODEL = process.env.AI_MODEL || "gpt-5-mini";

const client = baseURL && apiKey ? new OpenAI({ baseURL, apiKey }) : null;

const SYSTEM_PROMPT = `Anda adalah penerjemah profesional yang menerjemahkan judul drama Mandarin ke Bahasa Indonesia yang natural, menarik, dan cocok untuk situs streaming.

Aturan:
- Berikan HANYA hasil terjemahan dalam Bahasa Indonesia, tanpa penjelasan apa pun.
- Jangan tambahkan tanda kutip atau emoji.
- Pertahankan nuansa dramatis/romantis dari judul asli.
- Jika ada angka episode atau seri, pertahankan formatnya.
- Jangan mentransliterasi nama karakter; gunakan nama Mandarin asli (Pinyin) bila perlu.
- Maksimal 100 karakter.`;

export const isTranslatorAvailable = (): boolean => client !== null;

const CHINESE_RE = /[\u3400-\u9FFF\uF900-\uFAFF]/;

export function containsChinese(text: string | null | undefined): boolean {
  if (!text) return false;
  return CHINESE_RE.test(text);
}

export async function translateChineseToIndonesian(
  text: string,
): Promise<string | null> {
  if (!client) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: trimmed },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^["'「『]+|["'」』]+$/g, "").trim();
    return cleaned || null;
  } catch (err) {
    logger.warn({ err, text: trimmed.slice(0, 60) }, "auto-translate failed");
    return null;
  }
}

const SYNOPSIS_SYSTEM_PROMPT = `Anda adalah penulis sinopsis profesional untuk situs streaming drama Indonesia. Tugas Anda: menulis sinopsis singkat berdasarkan judul drama yang diberikan.

Aturan ketat:
- Tulis 2–3 kalimat saja, total 50–90 kata.
- Bahasa Indonesia yang natural, mengalir, dan menarik (gaya editorial pop).
- Berdasarkan PETUNJUK dari judul saja — jangan mengarang detail spesifik (nama tokoh, lokasi, jumlah episode) yang tidak ada di judul.
- Jangan menyebut platform YouTube, channel, atau link.
- Jangan menggunakan tanda kutip, emoji, atau hashtag.
- Awali dengan kalimat pembuka yang langsung memikat (jangan "Sinopsis:", "Drama ini bercerita tentang…", dll).
- Jangan mengulang judul secara verbatim di awal kalimat.
- Akhiri dengan kalimat yang membangun rasa penasaran agar penonton mau menonton.
- Output HANYA paragraf sinopsis itu sendiri, tanpa label/heading.`;

export async function generateIndonesianSynopsis(
  title: string,
  channelName?: string | null,
): Promise<string | null> {
  if (!client) return null;
  const trimmed = title.trim();
  if (!trimmed) return null;
  const userPrompt = channelName
    ? `Judul drama: "${trimmed}"\nKreator: ${channelName}\n\nTulis sinopsis singkat dalam Bahasa Indonesia.`
    : `Judul drama: "${trimmed}"\n\nTulis sinopsis singkat dalam Bahasa Indonesia.`;
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYNOPSIS_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const cleaned = raw
      .replace(/^["'「『]+|["'」』]+$/g, "")
      .replace(/^Sinopsis\s*[:：]\s*/i, "")
      .trim();
    return cleaned || null;
  } catch (err) {
    logger.warn(
      { err, title: trimmed.slice(0, 60) },
      "auto-synopsis failed",
    );
    return null;
  }
}
