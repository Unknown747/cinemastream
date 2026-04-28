import type { Plugin, Connect } from "vite";

const LEGACY_RE = /^\/(movie|drama)\/([^/?#]+)(?:[?#].*)?$/;
const IMAGE_RE = /\.(?:png|jpe?g|gif|webp|svg|ico|avif)(?:\?.*)?$/i;
const FONT_RE = /\.(?:woff2?|ttf|otf|eot)(?:\?.*)?$/i;
const STATIC_ASSET_RE = /\/assets\//;

function redirectMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url ?? "";
    const match = url.match(LEGACY_RE);
    if (!match) {
      next();
      return;
    }
    const id = decodeURIComponent(match[2]);
    const target = `/film/${id}`;
    res.statusCode = 301;
    res.setHeader("Location", target);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.end(`Redirecting to ${target}`);
  };
}

function cacheHeaderMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url ?? "";
    const isImage = IMAGE_RE.test(url);
    const isFont = FONT_RE.test(url);
    const isHashedAsset = STATIC_ASSET_RE.test(url);

    if (isHashedAsset) {
      res.setHeader(
        "Cache-Control",
        "public, max-age=31536000, immutable",
      );
    } else if (isImage || isFont) {
      res.setHeader(
        "Cache-Control",
        "public, max-age=86400, stale-while-revalidate=604800",
      );
    }
    next();
  };
}

export function legacyRedirects(): Plugin {
  return {
    name: "cinemastream-legacy-redirects",
    configureServer(server) {
      server.middlewares.use(redirectMiddleware());
      server.middlewares.use(cacheHeaderMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirectMiddleware());
      server.middlewares.use(cacheHeaderMiddleware());
    },
  };
}
