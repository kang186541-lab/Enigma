import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import * as fs from "fs";
import * as path from "path";

// --- Sentry (server) ----------------------------------------------------
// Optional: only initializes if SENTRY_DSN is set. Dynamic require keeps
// @sentry/node a soft dependency so the server still boots when the package
// is absent (e.g. minimal CI image).
type SentryNode = {
  init: (opts: Record<string, unknown>) => void;
  Handlers: {
    requestHandler: () => express.RequestHandler;
    errorHandler: () => express.ErrorRequestHandler;
  };
  captureException: (err: unknown) => void;
};
let SentryNS: SentryNode | null = null;
if (process.env.SENTRY_DSN) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SentryNS = require("@sentry/node") as SentryNode;
    SentryNS.init({
      dsn: process.env.SENTRY_DSN,
      sampleRate: 1.0,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV || "development",
    });
  } catch (e) {
    SentryNS = null;
    console.warn("[monitoring] @sentry/node init skipped:", e);
  }
}

const app = express();
const log = console.log;

if (SentryNS) {
  app.use(SentryNS.Handlers.requestHandler());
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origins = new Set<string>();
    const isDev = process.env.NODE_ENV !== "production";

    const normalizeOrigin = (value: string): string | null => {
      try {
        return new URL(value).origin;
      } catch {
        return null;
      }
    };

    const addOrigin = (value: string) => {
      const origin = normalizeOrigin(value.trim());
      if (origin) origins.add(origin);
    };

    if (process.env.REPLIT_DEV_DOMAIN) {
      addOrigin(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }

    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        addOrigin(`https://${d.trim()}`);
      });
    }

    if (process.env.CORS_ALLOWED_ORIGINS) {
      process.env.CORS_ALLOWED_ORIGINS.split(",").forEach((allowedOrigin) => {
        addOrigin(allowedOrigin);
      });
    }

    const rawOrigin = req.header("origin");
    const origin = rawOrigin ? normalizeOrigin(rawOrigin) : null;
    res.header("Vary", "Origin");

    // Allow localhost origins for Expo web development only.
    const isLocalhost =
      isDev &&
      (origin?.startsWith("http://localhost:") ||
        origin?.startsWith("http://127.0.0.1:"));

    // Allow requests with no origin (mobile apps, Expo Go, curl)
    const noOrigin = !rawOrigin;
    const allowed = noOrigin || (origin ? origins.has(origin) : false) || isLocalhost;

    if (allowed) {
      if (origin) {
        res.header("Access-Control-Allow-Origin", origin);
      } else {
        res.header("Access-Control-Allow-Origin", "*");
      }
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header(
        "Access-Control-Allow-Headers",
        req.header("Access-Control-Request-Headers") || "Content-Type, Authorization",
      );
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      if (!allowed && !isDev) {
        console.warn(`[cors] blocked origin: ${rawOrigin || "(invalid)"}`);
        return res.status(403).send("CORS origin not allowed");
      }

      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      limit: "10mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();

  log("Serving static Expo files with dynamic manifest routing");

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  log("Expo routing: Checking expo-platform header on / and /manifest");
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    const isProd = process.env.NODE_ENV === "production";
    const publicMessage =
      isProd && status >= 500 ? "Internal Server Error" : message;

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message: publicMessage });
  });
}

(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);

  configureExpoAndLanding(app);

  const server = await registerRoutes(app);

  // Sentry's error handler must come AFTER routes and BEFORE the app's own
  // error handler so it captures the exception before we format the response.
  if (SentryNS) {
    app.use(SentryNS.Handlers.errorHandler());
  }

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`express server serving on port ${port}`);
    },
  );
})();
