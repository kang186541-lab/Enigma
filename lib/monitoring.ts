// Sentry monitoring — graceful degrade wrapper.
//
// Design notes:
//   - DSN is read from EXPO_PUBLIC_SENTRY_DSN. If empty/missing, every export
//     becomes a no-op. Sentry MUST NOT throw when unconfigured — that would
//     defeat the point of having opt-in observability.
//   - We lazy-require @sentry/react-native inside initMonitoring so that an
//     environment without the package installed (e.g. a CI build that skipped
//     `npm i`) still boots. The require is wrapped in try/catch.
//   - PII scrubbing: emails are reduced to `<first-char>***@<domain>` before
//     ever leaving the process. Raw tokens/passwords are filtered from any
//     event payload via beforeSend.
//
// Public surface:
//   initMonitoring()             — call once at app start. Idempotent.
//   captureError(err, ctx?)      — report a caught error with optional context.
//   setUserContext({id, email?}) — attach the current user. Pass null to clear.

type SentryLike = {
  init: (options: Record<string, unknown>) => void;
  captureException: (err: unknown, hint?: Record<string, unknown>) => void;
  setUser: (user: Record<string, unknown> | null) => void;
};

let sentry: SentryLike | null = null;
let initialized = false;

const SENSITIVE_KEY_RE = /password|token|secret|api[-_]?key|authorization|cookie|bearer/i;

/**
 * Reduce an email to `<first-char>***@<domain>` so we keep enough signal to
 * spot single-user issues without storing the actual address.
 */
function redactEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const first = email[0] ?? "";
  const domain = email.slice(at + 1);
  return `${first}***@${domain}`;
}

/**
 * Walk an event payload and blank out any string value whose key looks
 * sensitive. Best-effort — Sentry's own data scrubber runs on the server too.
 */
function scrubPayload(value: unknown, depth = 0): unknown {
  if (depth > 6 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => scrubPayload(v, depth + 1));
  if (typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY_RE.test(k)) {
      out[k] = "[Filtered]";
    } else if (k === "email" && typeof v === "string") {
      out[k] = redactEmail(v);
    } else {
      out[k] = scrubPayload(v, depth + 1);
    }
  }
  return out;
}

export function initMonitoring(): void {
  if (initialized) return;
  initialized = true;

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    // Unconfigured — stay silent. captureError/setUserContext become no-ops.
    return;
  }

  try {
    // Dynamic require keeps the import optional. If the package isn't
    // installed, we degrade to no-op instead of crashing the bundle.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@sentry/react-native") as SentryLike;
    sentry = mod;
    sentry.init({
      dsn,
      sampleRate: 1.0,
      tracesSampleRate: 0.1,
      enableAutoSessionTracking: true,
      sendDefaultPii: false,
      beforeSend: (event: Record<string, unknown>) => {
        return scrubPayload(event) as Record<string, unknown>;
      },
    });
  } catch (e) {
    // Package missing or init failed — degrade silently.
    sentry = null;
    if (process.env.NODE_ENV !== "production") {
      console.warn("[monitoring] Sentry init skipped:", e);
    }
  }
}

export function captureError(
  err: unknown,
  ctx?: Record<string, unknown>,
): void {
  if (!sentry) return;
  try {
    const scrubbedCtx = ctx ? (scrubPayload(ctx) as Record<string, unknown>) : undefined;
    sentry.captureException(err, scrubbedCtx ? { extra: scrubbedCtx } : undefined);
  } catch {
    // Never let monitoring blow up the caller.
  }
}

export function setUserContext(
  user: { id: string; email?: string } | null,
): void {
  if (!sentry) return;
  try {
    if (user == null) {
      sentry.setUser(null);
      return;
    }
    sentry.setUser({
      id: user.id,
      ...(user.email ? { email: redactEmail(user.email) } : {}),
    });
  } catch {
    // Swallow — monitoring failures must not surface to the app.
  }
}
