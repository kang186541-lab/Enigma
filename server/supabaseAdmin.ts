// Supabase server-side helpers for endpoints that need to:
//   1. Verify a learner's JWT (Authorization: Bearer <token>) and resolve a uid.
//   2. Optionally act with the service-role key (admin user deletion, etc.).
//
// Why this lives in server/ instead of lib/:
//   lib/supabase.ts is the React-Native client (uses AsyncStorage, anon key only).
//   Node-side code MUST NOT import that file — AsyncStorage will crash, and the
//   admin client must hold the service-role secret which we never ship to RN.
//
// Required env (set in Railway):
//   SUPABASE_URL                  — Supabase project URL
//   SUPABASE_ANON_KEY             — anon/publishable key, used only to verify JWTs
//   SUPABASE_SERVICE_ROLE_KEY     — service role key (KEEP SECRET; never expose
//                                   to clients; used for admin.deleteUser and
//                                   for cross-user reads from server code).
//
// If SUPABASE_URL is missing the module still loads (so the rest of the
// API surface keeps working) and helpers throw at call time with a clear
// message; this keeps boot-time failures localised to GDPR endpoints only.
//
// Note: SUPABASE_URL / SUPABASE_ANON_KEY may also be provided via the
// EXPO_PUBLIC_* equivalents (set for the mobile bundle). We fall back to
// those so a single Railway env entry works for both surfaces.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readEnv(name: string, ...fallbacks: string[]): string | undefined {
  const direct = process.env[name]?.trim();
  if (direct) return direct;
  for (const f of fallbacks) {
    const v = process.env[f]?.trim();
    if (v) return v;
  }
  return undefined;
}

const SUPABASE_URL = readEnv("SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_URL");
const SUPABASE_ANON_KEY = readEnv("SUPABASE_ANON_KEY", "EXPO_PUBLIC_SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = readEnv("SUPABASE_SERVICE_ROLE_KEY");

// Cached singletons — createClient() is cheap but spamming it on every request
// wastes sockets and skips connection reuse. Lazy so missing-env errors are
// raised by the consumer endpoint with proper HTTP status, not at boot.
let cachedAnon: SupabaseClient | null = null;
let cachedAdmin: SupabaseClient | null = null;

/**
 * Anon-key Supabase client used purely for JWT verification.
 * Calling `auth.getUser(token)` against this returns the user identified by
 * the token (or an error). RLS still applies to any data ops via this client.
 */
function getAnonClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase not configured: set SUPABASE_URL and SUPABASE_ANON_KEY (or the EXPO_PUBLIC_* equivalents).",
    );
  }
  if (!cachedAnon) {
    cachedAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedAnon;
}

/**
 * Service-role Supabase client. Bypasses RLS — use ONLY in trusted server
 * endpoints AFTER verifying the caller's JWT. Returns null when the key is not
 * configured so callers can degrade gracefully (e.g. respond 202 instead of
 * 500 on the delete endpoint).
 */
export function getServiceRoleClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!cachedAdmin) {
    cachedAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedAdmin;
}

export function hasServiceRole(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export interface VerifiedUser {
  id: string;
  email: string | null;
  created_at: string | null;
  /** Primary auth provider (e.g. "email", "google", "apple"). Best-effort. */
  provider: string | null;
}

/**
 * Pull the bearer token out of an Express request. Returns null when the
 * Authorization header is missing or malformed — callers should respond 401.
 */
function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!match) return null;
  const token = match[1]?.trim();
  return token && token.length > 0 ? token : null;
}

/**
 * Verify a Supabase JWT and return the authenticated user.
 *
 * Returns null when:
 *   - the Authorization header is missing or malformed
 *   - the token is invalid / expired
 *   - Supabase is not configured (env missing)
 *
 * Never throws on auth failure — callers translate `null` into 401.
 * Network / config errors are logged and surfaced as `null` too; deletion
 * paths MUST treat null as "do nothing, return 401".
 */
export async function verifySupabaseJwt(
  authHeader: string | undefined,
): Promise<VerifiedUser | null> {
  const token = extractBearerToken(authHeader);
  if (!token) return null;

  let client: SupabaseClient;
  try {
    client = getAnonClient();
  } catch (err) {
    console.error("[supabaseAdmin] verifySupabaseJwt: client init failed", err);
    return null;
  }

  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) return null;

    const u = data.user;
    // `app_metadata.provider` is set by Supabase for OAuth users; for plain
    // email/password sign-ups it's "email". Fall back gracefully.
    const provider =
      (u.app_metadata && (u.app_metadata as { provider?: string }).provider) ||
      (u.identities && u.identities[0]?.provider) ||
      null;

    return {
      id: u.id,
      email: u.email ?? null,
      created_at: u.created_at ?? null,
      provider: provider ?? null,
    };
  } catch (err) {
    console.error("[supabaseAdmin] verifySupabaseJwt: unexpected error", err);
    return null;
  }
}
