import { Router, type IRouter } from "express";
import {
  setSessionCookie,
  clearSessionCookie,
  isValidSession,
  verifyPassword,
  adminPasswordConfigured,
} from "../lib/admin-auth";
import { adminLoginLimiter } from "../lib/rate-limit";

const router: IRouter = Router();

router.get("/admin/me", (req, res) => {
  if (!adminPasswordConfigured()) {
    return res.json({ authenticated: true, configured: false });
  }
  return res.json({
    authenticated: isValidSession(req),
    configured: true,
  });
});

router.post("/admin/login", adminLoginLimiter, (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!adminPasswordConfigured()) {
    return res.status(503).json({
      error:
        "Admin password belum di-set di server. Tambahkan ADMIN_PASSWORD lalu restart.",
    });
  }
  if (!password || !verifyPassword(password)) {
    return res.status(401).json({ error: "Password salah" });
  }
  setSessionCookie(res);
  return res.json({ authenticated: true });
});

router.post("/admin/logout", (_req, res) => {
  clearSessionCookie(res);
  return res.json({ ok: true });
});

export default router;
