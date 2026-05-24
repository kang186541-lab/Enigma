// Express middleware that VERIFIES the Supabase JWT signature (not just
// decodes the payload) and attaches the verified `userId` to `req`.
//
// History: the rate-limit layer used to decode the `sub` claim straight out
// of the JWT payload without verification, which let an attacker forge an
// arbitrary `sub` to grab a fresh rate-limit bucket per request. This module
// fixes that — limiters now key off `req.userId` set by `optionalAuth` (or
// fall back to IP if verification failed / was absent).
//
// Verification cost: ~30ms Supabase round trip per request, mitigated by a
// short in-memory cache keyed on the full JWT string. JWTs are immutable
// for their lifetime so the cache is safe.

import type { Request, Response, NextFunction } from "express";
import { verifySupabaseJwt } from "./supabaseAdmin";

// req extension
declare module "express-serve-static-core" {
  interface Request {
    // Set ONLY when the bearer JWT verified successfully via Supabase.
    userId?: string;
    userEmail?: string | null;
  }
}

interface CacheEntry {
  userId: string;
  email: string | null;
  at: number;
}
const VERIFY_CACHE = new Map<string, CacheEntry>();
const VERIFY_CACHE_TTL = 60_000; // 1 min — matches the limiter window
const VERIFY_CACHE_MAX = 2_000;

function pruneCache(): void {
  if (VERIFY_CACHE.size <= VERIFY_CACHE_MAX) return;
  // Drop the 20% oldest.
  const entries = [...VERIFY_CACHE.entries()].sort((a, b) => a[1].at - b[1].at);
  const drop = Math.ceil(VERIFY_CACHE_MAX * 0.2);
  for (let i = 0; i < drop && i < entries.length; i++) {
    VERIFY_CACHE.delete(entries[i][0]);
  }
}

function extractBearer(req: Request): string | null {
  const auth = req.header("authorization") ?? req.header("Authorization");
  if (!auth || typeof auth !== "string") return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  return m[1].trim();
}

async function verifyAndCache(token: string): Promise<CacheEntry | null> {
  const cached = VERIFY_CACHE.get(token);
  if (cached && Date.now() - cached.at < VERIFY_CACHE_TTL) {
    return cached;
  }
  const user = await verifySupabaseJwt(`Bearer ${token}`);
  if (!user) return null;
  const entry: CacheEntry = {
    userId: user.id,
    email: user.email ?? null,
    at: Date.now(),
  };
  VERIFY_CACHE.set(token, entry);
  pruneCache();
  return entry;
}

/**
 * Sets `req.userId` if a valid Supabase JWT is present.
 * Does NOT 401 on missing or invalid tokens — downstream code can treat
 * unauthenticated as anonymous (e.g. rate limit by IP).
 *
 * Use as global middleware OR just in front of endpoints whose limiter
 * needs to distinguish user vs. IP buckets.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractBearer(req);
    if (token) {
      const v = await verifyAndCache(token);
      if (v) {
        req.userId = v.userId;
        req.userEmail = v.email;
      }
    }
  } catch (e) {
    // Verification errors must not break the request — fall through as
    // anonymous. Sentry will catch crashes elsewhere.
    console.warn("[authMiddleware] optionalAuth verify error:", (e as Error)?.message ?? e);
  }
  next();
}

/**
 * 401s the request unless a valid Supabase JWT is present.
 * After this middleware passes, `req.userId` is guaranteed to be a string.
 *
 * Use BEFORE any rate-limit middleware on sensitive routes (e.g. /api/me/*)
 * so a forged JWT can't even reach the limiter.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractBearer(req);
  if (!token) {
    res.status(401).json({ error: "unauthorized", message: "Missing Authorization bearer token." });
    return;
  }
  try {
    const v = await verifyAndCache(token);
    if (!v) {
      res.status(401).json({ error: "unauthorized", message: "Invalid or expired session." });
      return;
    }
    req.userId = v.userId;
    req.userEmail = v.email;
    next();
  } catch (e) {
    console.warn("[authMiddleware] requireAuth error:", (e as Error)?.message ?? e);
    res.status(401).json({ error: "unauthorized", message: "Could not verify session." });
  }
}
