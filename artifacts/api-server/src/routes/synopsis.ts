import { Router, type IRouter } from "express";
import OpenAI from "openai";
import {
  GenerateSynopsisBody as SynopsisInput,
  GenerateSynopsisResponse as SynopsisResult,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { aiLimiter } from "../lib/rate-limit";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.use("/synopsis", aiLimiter);

const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const MODEL = process.env.AI_MODEL || "gpt-5-mini";

const client = baseURL && apiKey ? new OpenAI({ baseURL, apiKey }) : null;

const SYSTEM_PROMPT = `Anda adalah penulis sinopsis profesional untuk situs streaming drama Indonesia. Tugas Anda: menulis sinopsis singkat berdasarkan judul drama yang diberikan.

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

router.post("/synopsis", requireAdmin, async (req, res): Promise<void> => {
  if (!client) {
    res.status(503).json({
      error: "AI synopsis tidak tersedia (AI integration belum di-setup).",
    });
    return;
  }
  const parsed = SynopsisInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const { title, channelName } = parsed.data;
    const userPrompt = channelName
      ? `Judul drama: "${title}"\nKreator: ${channelName}\n\nTulis sinopsis singkat dalam Bahasa Indonesia.`
      : `Judul drama: "${title}"\n\nTulis sinopsis singkat dalam Bahasa Indonesia.`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    // Strip surrounding quotes if model added any
    const synopsis = raw
      .replace(/^["'「『]+|["'」』]+$/g, "")
      .replace(/^Sinopsis\s*[:：]\s*/i, "")
      .trim();
    if (!synopsis) {
      logger.warn(
        {
          finishReason: completion.choices[0]?.finish_reason,
          usage: completion.usage,
        },
        "synopsis empty response",
      );
      res
        .status(502)
        .json({ error: "AI tidak mengembalikan sinopsis. Coba lagi." });
      return;
    }
    res.json(SynopsisResult.parse({ synopsis }));
  } catch (err) {
    logger.error({ err }, "synopsis failed");
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
