import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { TranslateTextBody, TranslateTextResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { aiLimiter } from "../lib/rate-limit";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.use("/translate", aiLimiter);

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

router.post("/translate", requireAdmin, async (req, res): Promise<void> => {
  if (!client) {
    res
      .status(503)
      .json({ error: "AI translation tidak tersedia (AI integration belum di-setup)." });
    return;
  }
  const parsed = TranslateTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: parsed.data.text },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const translation = raw.replace(/^["'「『]+|["'」』]+$/g, "").trim();
    if (!translation) {
      logger.warn(
        { finishReason: completion.choices[0]?.finish_reason, usage: completion.usage },
        "translate empty response",
      );
      res.status(502).json({ error: "Terjemahan kosong dari AI." });
      return;
    }
    res.json(TranslateTextResponse.parse({ translation }));
  } catch (err) {
    logger.error({ err }, "translate failed");
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Translate gagal" });
  }
});

export default router;
