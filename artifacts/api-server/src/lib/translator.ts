import OpenAI from "openai";
import { logger } from "./logger";

const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

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
      model: "gpt-5-mini",
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
