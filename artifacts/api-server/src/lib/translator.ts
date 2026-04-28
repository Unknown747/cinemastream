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

const REVIEW_SYSTEM_PROMPT = `Anda adalah penulis review drama profesional untuk situs streaming Indonesia (gaya editorial pop seperti IDN Times / Popbela). Tugas: menulis review panjang berdasarkan judul (dan sinopsis singkat bila diberikan).

Aturan penulisan:
- Total 400–600 kata Bahasa Indonesia yang mengalir, hangat, conversational tapi informatif.
- Struktur Markdown WAJIB pakai heading berikut, persis urutan ini:

## Sekilas tentang drama ini
(2–3 kalimat membuka — siapa kira-kira target penonton, apa daya tariknya)

## Premis cerita
(1 paragraf 80–120 kata. PETUNJUK dari judul saja — jangan mengarang nama tokoh, lokasi, jumlah episode spesifik. Boleh menyebut "tokoh utama wanita", "sang CEO", dll.)

## Yang bikin penasaran
(3 bullet point — tiap bullet 1–2 kalimat. Soroti elemen menarik: konflik, twist, chemistry, gaya visual. Mulai bullet dengan "- ")

## Cocok ditonton kalau kamu suka
(1 paragraf 60–80 kata, sebut 2–3 jenis cerita atau drama lain yang serupa secara umum, mis. "drama balas dendam manis", "kisah cinta lama bersemi", tanpa menyebut judul drama lain spesifik)

## Kesimpulan
(1 paragraf penutup 60–80 kata yang membangun rasa penasaran agar penonton mau klik play)

Larangan:
- Jangan menyebut platform YouTube, channel, link, atau "subscribe".
- Jangan pakai emoji, hashtag, atau tanda kutip pembungkus.
- Jangan mengulang judul lebih dari 2 kali di seluruh tulisan.
- Jangan menjanjikan "ending bahagia", "sad ending", atau spoiler — selalu netral.
- Jangan tambahkan tabel atau gambar.
- Jangan menulis "Disclaimer", "Catatan", atau bagian meta lain di luar 5 heading di atas.

Output HANYA teks Markdown — tanpa code fence, tanpa kata pembuka.`;

export async function generateIndonesianReview(
  title: string,
  channelName?: string | null,
  synopsis?: string | null,
): Promise<string | null> {
  if (!client) return null;
  const trimmed = title.trim();
  if (!trimmed) return null;
  const synopsisHint = synopsis?.trim()
    ? `\n\nSinopsis singkat (sebagai PETUNJUK saja, jangan dikutip langsung):\n${synopsis.trim()}`
    : "";
  const channelHint = channelName ? `\nKreator: ${channelName}` : "";
  const userPrompt = `Judul drama: "${trimmed}"${channelHint}${synopsisHint}\n\nTulis review panjang dalam Bahasa Indonesia mengikuti format Markdown yang sudah ditentukan.`;
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: REVIEW_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const cleaned = raw
      .replace(/^```(?:markdown|md)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    if (cleaned.length < 200) {
      logger.warn(
        {
          finishReason: completion.choices[0]?.finish_reason,
          length: cleaned.length,
        },
        "review too short",
      );
      return null;
    }
    return cleaned;
  } catch (err) {
    logger.warn(
      { err, title: trimmed.slice(0, 60) },
      "auto-review failed",
    );
    return null;
  }
}

export const REVIEW_MODEL = MODEL;

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
