import type { Plugin, Connect } from "vite";

const LEGACY_RE = /^\/(movie|drama)\/([^/?#]+)(?:[?#].*)?$/;

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

export function legacyRedirects(): Plugin {
  return {
    name: "cinemastream-legacy-redirects",
    configureServer(server) {
      server.middlewares.use(redirectMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirectMiddleware());
    },
  };
}
