import type { Request, Response, NextFunction, RequestHandler } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { logger } from "./logger";

const COOKIE_NAME = "cs_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || null;
const COOKIE_SECRET =
  process.env.COOKIE_SECRET?.trim() ||
  process.env.SESSION_SECRET?.trim() ||
  null;

let warnedOpenAdmin = false;
let warnedNoSecret = false;

function effectiveSecret(): string {
  if (COOKIE_SECRET) return COOKIE_SECRET;
  if (ADMIN_PASSWORD) {
    if (!warnedNoSecret) {
      warnedNoSecret = true;
      logger.warn(
        "COOKIE_SECRET not set; deriving session signing key from ADMIN_PASSWORD. Set COOKIE_SECRET in production.",
      );
    }
    return `derived:${ADMIN_PASSWORD}`;
  }
  return "insecure-dev-secret";
}

function sign(value: string): string {
  return createHmac("sha256", effectiveSecret()).update(value).digest("base64url");
}

export function issueSessionCookie(): { value: string; maxAgeMs: number } {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `admin.${expires}`;
  const sig = sign(payload);
  return { value: `${payload}.${sig}`, maxAgeMs: SESSION_TTL_MS };
}

export function setSessionCookie(res: Response): void {
  const { value, maxAgeMs } = issueSessionCookie();
  res.cookie(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeMs,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function isValidSession(req: Request): boolean {
  const cookie = (req as Request & { cookies?: Record<string, string> }).cookies?.[
    COOKIE_NAME
  ];
  if (!cookie) return false;
  const parts = cookie.split(".");
  if (parts.length !== 3) return false;
  const [scope, expiresStr, sig] = parts;
  if (scope !== "admin") return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = sign(`${scope}.${expiresStr}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyPassword(candidate: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function adminPasswordConfigured(): boolean {
  return ADMIN_PASSWORD !== null;
}

/**
 * Middleware that protects mutating admin endpoints.
 * - If ADMIN_PASSWORD is unset, requests pass through (development) but a warning is logged once.
 * - Otherwise a valid signed session cookie is required; 401 otherwise.
 */
export const requireAdmin: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!adminPasswordConfigured()) {
    if (!warnedOpenAdmin) {
      warnedOpenAdmin = true;
      logger.warn(
        "ADMIN_PASSWORD not configured — admin endpoints are unprotected. Set ADMIN_PASSWORD to enable auth.",
      );
    }
    return next();
  }
  if (isValidSession(req)) return next();
  _res.status(401).json({ error: "Unauthorized" });
};
