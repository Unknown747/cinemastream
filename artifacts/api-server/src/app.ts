import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust the Replit reverse proxy so req.ip / rate-limit work correctly.
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false, // API returns JSON only; CSP belongs to the frontend
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const corsOriginRaw = process.env.CORS_ORIGIN?.trim();
const corsOrigin = corsOriginRaw
  ? corsOriginRaw === "*"
    ? true
    : corsOriginRaw.split(",").map((s) => s.trim()).filter(Boolean)
  : false; // same-origin only by default
app.use(cors({ origin: corsOrigin, credentials: true }));

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api", router);

export default app;
