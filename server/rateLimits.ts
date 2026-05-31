/**
 * Per-endpoint rate-limit middlewares for LinguaAI server.
 *
 * Tiers
 * -----
 *  - GPT-routed endpoints (mission-chat, chat, word-lookup, translate,
 *    pronunciation-coach, pronunciation-assess, gpt-score):
 *       Authenticated user (Supabase JWT)  → 60 req/min, 600 req/hour
 *       Anonymous (IP key)                → 20 req/min, 100 req/hour
 *  - TTS (pronunciation-tts):
 *       User → 120 req/min, IP → 40 req/min
 *  - STT (/api/stt):
 *       User → 30 req/min, IP → 10 req/min
 *  - Static / health: no limit
 *
 * Key extractor
 * -------------
 * Uses `req.userId` set by `optionalAuth` middleware (server/authMiddleware.ts)
 * which VERIFIES the Supabase JWT signature via supabase.auth.getUser().
 * No JWT signature → no user bucket → IP bucket. An attacker forging a JWT
 * with an arbitrary `sub` claim is rejected at verification and lands in the
 * IP-tier bucket (the lower cap), so forgery makes things worse for the
 * attacker, not better.
 *
 * Storage
 * -------
 * Memory store via `express-rate-limit`'s default. Single-process only.
 * TODO(redis): swap to `rate-limit-redis` for multi-instance deployments
 * (Railway autoscaling, blue/green) so a malicious client can't escape the
 * cap by hopping pods. Until then, run a single replica.
 *
 * Headers
 * -------
 * `RateLimit-Remaining`, `RateLimit-Limit`, `RateLimit-Reset` are exposed via
 * the IETF "draft-7" standardHeaders mode so clients can self-throttle.
 *
 * Composition
 * -----------
 * Each endpoint gets BOTH the per-minute and per-hour limiter chained, so the
 * hour bucket catches a slow drip that doesn't trip the per-minute bucket.
 *
 * Tests (inline notes — not executed)
 * -----------------------------------
 *  - keyFromReq with valid `Bearer <header>.<base64payload>.<sig>` returns
 *    `u:<sub>` and never throws on malformed signatures.
 *  - keyFromReq with `Bearer garbage`, with no Authorization, or with a JWT
 *    payload that fails JSON.parse all fall back to `ip:<req.ip>`.
 *  - 21 anonymous GPT requests in <60s from the same IP get one 429 on the
 *    21st with header RateLimit-Remaining=0.
 *  - 61 authenticated GPT requests (same JWT sub) in <60s get one 429.
 *  - User and IP buckets are independent: a JWT-bearing client and an
 *    anonymous client from the same IP both have their own counters.
 *  - Static routes (no middleware attached) are NEVER counted.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import rateLimit, { ipKeyGenerator, type Options } from "express-rate-limit";

/**
 * Bucket key for a request. Always returns a non-empty string.
 *
 *   user-bucket  → `u:<verified-id>`   (only when `req.userId` was set by
 *                                       optionalAuth — i.e. JWT signature
 *                                       verified against Supabase)
 *   ip-bucket    → `ip:<address>`
 *
 * Exported for testing; not called outside this file in production.
 */
export function keyFromReq(req: Request): string {
  if (typeof req.userId === "string" && req.userId.length > 0) {
    return `u:${req.userId}`;
  }
  // Express exposes a normalised string in `req.ip` (respects `trust proxy`).
  // `ipKeyGenerator` collapses IPv6 subnets so clients cannot rotate within a
  // /64 and sidestep anonymous limits.
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return `ip:${ipKeyGenerator(ip)}`;
}

/** True iff the request carries a verified user identity. */
function isAuthed(req: Request): boolean {
  return typeof req.userId === "string" && req.userId.length > 0;
}

// ── Shared 429 handler ───────────────────────────────────────────────────
function tooManyHandler(_req: Request, res: Response, _next: NextFunction): void {
  // `RateLimit-Reset` (in seconds) is already on the response from
  // express-rate-limit's standardHeaders mode. We only need to emit a JSON
  // body. Keep it short and language-neutral; the client UX layer can localise.
  res.status(429).json({
    error: "rate_limited",
    message: "Too many requests. Please slow down and try again shortly.",
  });
}

// ── Limiter factory ──────────────────────────────────────────────────────
// One factory keeps the option shape consistent across tiers (and trivially
// auditable). All limiters use:
//   - `standardHeaders: "draft-7"` → RateLimit-* headers per the IETF draft.
//   - `legacyHeaders: false`       → no X-RateLimit-* dupes.
//   - `keyGenerator: keyFromReq`   → JWT sub or IP, see above.
//   - `skipSuccessfulRequests: false` (the default) → all responses counted.
//
// `windowMs` and `max` come from the caller.
function makeLimiter(opts: { windowMs: number; max: number }): RequestHandler {
  const config: Partial<Options> = {
    windowMs: opts.windowMs,
    limit: opts.max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: keyFromReq,
    handler: tooManyHandler,
  };
  return rateLimit(config);
}

/**
 * Build a tier middleware: pick the right limiter based on whether the
 * request is authenticated, then chain per-minute AND per-hour caps so a
 * slow drip can't outrun the hour bucket.
 *
 * Implementation detail: `express-rate-limit` runs `keyGenerator` once per
 * request, but it does NOT branch limits by request shape. We work around
 * that by building TWO limiter instances (user-cap and ip-cap) and
 * dispatching with `isAuthed` at request time.
 */
function tieredLimiter(opts: {
  userPerMin: number;
  userPerHour: number;
  ipPerMin: number;
  ipPerHour: number;
}): RequestHandler {
  const userMin = makeLimiter({ windowMs: 60_000, max: opts.userPerMin });
  const userHour = makeLimiter({ windowMs: 60 * 60_000, max: opts.userPerHour });
  const ipMin = makeLimiter({ windowMs: 60_000, max: opts.ipPerMin });
  const ipHour = makeLimiter({ windowMs: 60 * 60_000, max: opts.ipPerHour });

  return function tiered(req: Request, res: Response, next: NextFunction): void {
    const minLimiter = isAuthed(req) ? userMin : ipMin;
    const hourLimiter = isAuthed(req) ? userHour : ipHour;
    // Run the per-minute first (fail fast on bursts), then the per-hour.
    minLimiter(req, res, (err?: unknown) => {
      if (err) return next(err);
      if (res.headersSent) return; // 429 already emitted
      hourLimiter(req, res, next);
    });
  };
}

// ── Public middlewares ───────────────────────────────────────────────────
/**
 * GPT-routed endpoints: chat, mission-chat, word-lookup, translate,
 * pronunciation-coach, pronunciation-assess, gpt-score.
 *
 *   user → 60 req/min, 600 req/hour
 *   ip   → 20 req/min, 100 req/hour
 */
export const gptLimiter: RequestHandler = tieredLimiter({
  userPerMin: 60,
  userPerHour: 600,
  ipPerMin: 20,
  ipPerHour: 100,
});

/**
 * TTS endpoint (`/api/pronunciation-tts`). Higher cap — TTS is cheap per
 * call and gets hammered by autoplay and replay UX.
 *
 *   user → 120 req/min
 *   ip   → 40 req/min
 *
 * Hour cap is intentionally 6× the minute cap to leave headroom for a
 * pronunciation drill loop (one TTS per drill word, many drills per minute).
 */
export const ttsLimiter: RequestHandler = tieredLimiter({
  userPerMin: 120,
  userPerHour: 720,
  ipPerMin: 40,
  ipPerHour: 240,
});

/**
 * STT endpoint (`/api/stt`). Lower cap — STT carries audio payloads and is
 * a frequent abuse vector for free transcription.
 *
 *   user → 30 req/min
 *   ip   → 10 req/min
 */
export const sttLimiter: RequestHandler = tieredLimiter({
  userPerMin: 30,
  userPerHour: 180,
  ipPerMin: 10,
  ipPerHour: 60,
});
