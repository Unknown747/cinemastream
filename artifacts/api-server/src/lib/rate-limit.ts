import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";

function build(opts: {
  windowMs: number;
  max: number;
  scope: string;
}): RateLimitRequestHandler {
  return rateLimit({
    windowMs: opts.windowMs,
    limit: opts.max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      error: `Rate limit exceeded for ${opts.scope}. Coba lagi sebentar lagi.`,
    },
  });
}

export const aiLimiter: RateLimitRequestHandler = build({
  windowMs: 60_000,
  max: 10,
  scope: "AI endpoints",
});

export const videosLimiter: RateLimitRequestHandler = build({
  windowMs: 60_000,
  max: 60,
  scope: "videos",
});

export const adminLoginLimiter: RateLimitRequestHandler = build({
  windowMs: 5 * 60_000,
  max: 10,
  scope: "admin login",
});
