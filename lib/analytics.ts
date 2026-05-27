// Provider-agnostic analytics façade.
//
// Design notes:
//   - Public API is intentionally tiny: init, track, identify, reset.
//   - When EXPO_PUBLIC_POSTHOG_KEY is missing, every method is a silent no-op.
//     Telemetry must never block, throw, or surface to the user.
//   - posthog-react-native is lazy-required. If the package isn't installed
//     (e.g. CI without it, or before the user opts in), we degrade to no-op.
//   - PII scrub: raw `email` is reduced to `<first-char>***@<domain>` before
//     leaving the process. Pattern mirrors lib/monitoring.ts so we're
//     consistent across observability surfaces.
//   - Network calls are fire-and-forget. A failing flush must not propagate.
//
// ── Event catalog ───────────────────────────────────────────────────────────
//   app_open                  — fires once per app boot (app/_layout.tsx).
//   first_utterance_attempt   — user taps record for the very first time.
//                               Callsite: app/(tabs)/speak.tsx → handleRecord.
//                               Props: { learning_lang }.
//   first_utterance_success   — first scored attempt comes back successful.
//                               Callsite: app/(tabs)/speak.tsx → processScoreData.
//                               Props: { learning_lang, score }.
//   motivation_chosen         — TODO, wired by survey agent in lib/learnerProfile.ts.
//                               Props (planned): { goal }.
//   day1_return               — user returns the calendar day after their
//                               previous session (UTC). Fires at most once
//                               per UTC day (LanguageContext mount effect).
//                               Props: { days_since_install_inferred? }.
//
// Public surface:
//   Analytics.init({user_id?, anon_id?})  — call once at app start. Idempotent.
//   Analytics.track(event, props?)        — emit a single event.
//   Analytics.identify(user_id, traits?)  — link the current device to a user.
//   Analytics.reset()                     — wipe local distinct_id (on sign-out).
//
// All four are safe to call without a configured provider.
//
// To activate PostHog later:
//   1. `npm install posthog-react-native`
//   2. Set EXPO_PUBLIC_POSTHOG_KEY=phc_xxx (and optionally EXPO_PUBLIC_POSTHOG_HOST).
//   3. Restart Metro. Analytics.init() in app/_layout.tsx will pick it up.

type PostHogLike = {
  capture: (event: string, props?: Record<string, unknown>) => void;
  identify: (distinctId: string, traits?: Record<string, unknown>) => void;
  reset: () => void;
};

type PostHogCtor = new (apiKey: string, options?: Record<string, unknown>) => PostHogLike;

const SENSITIVE_KEY_RE =
  /password|token|secret|api[-_]?key|authorization|cookie|bearer/i;

const DEFAULT_HOST = "https://us.i.posthog.com";

let client: PostHogLike | null = null;
let initialized = false;

/**
 * Reduce an email to `<first-char>***@<domain>` so we keep enough signal to
 * distinguish users without storing the raw address.
 */
function redactEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const first = email[0] ?? "";
  const domain = email.slice(at + 1);
  return `${first}***@${domain}`;
}

/**
 * Walk a props payload and blank out any string value whose key looks
 * sensitive, plus redact emails. Mirrors lib/monitoring.ts scrubPayload so
 * both Sentry and PostHog see the same scrubbed shape.
 */
function scrubProps(value: unknown, depth = 0): unknown {
  if (depth > 6 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => scrubProps(v, depth + 1));
  if (typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY_RE.test(k)) {
      out[k] = "[Filtered]";
    } else if (k === "email" && typeof v === "string") {
      out[k] = redactEmail(v);
    } else {
      out[k] = scrubProps(v, depth + 1);
    }
  }
  return out;
}

function safeScrub(
  props: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!props) return undefined;
  try {
    return scrubProps(props) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

export interface AnalyticsInitOptions {
  user_id?: string;
  anon_id?: string;
}

function init(options: AnalyticsInitOptions = {}): void {
  if (initialized) return;
  initialized = true;

  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    // Unconfigured — stay silent. All other methods become no-ops.
    return;
  }

  const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || DEFAULT_HOST;

  try {
    // Dynamic require keeps the dependency optional. If posthog-react-native
    // isn't installed we degrade to no-op rather than crashing the bundle.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("posthog-react-native") as
      | { PostHog?: PostHogCtor; default?: PostHogCtor }
      | PostHogCtor;
    const PostHog: PostHogCtor | undefined =
      typeof mod === "function"
        ? mod
        : (mod as { PostHog?: PostHogCtor; default?: PostHogCtor }).PostHog ??
          (mod as { default?: PostHogCtor }).default;

    if (!PostHog) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[analytics] posthog-react-native loaded but no PostHog export found");
      }
      return;
    }

    client = new PostHog(apiKey, {
      host,
      // Fire-and-forget posture: short flush interval, small batch, no retries.
      // A network outage must not stall the app — drop events on the floor.
      flushInterval: 10_000,
      flushAt: 20,
      captureAppLifecycleEvents: false,
      preloadFeatureFlags: false,
    });

    // Stitch the pre-auth anon_id if we have one, so events from before
    // sign-in are linked to the eventual user via Analytics.identify.
    if (options.anon_id && client && typeof (client as PostHogLike & { register?: (props: Record<string, unknown>) => void }).register === "function") {
      try {
        (client as PostHogLike & { register: (props: Record<string, unknown>) => void }).register({ anon_id: options.anon_id });
      } catch {
        // ignore — provider-specific extension
      }
    }
    if (options.user_id) {
      try {
        client.identify(options.user_id);
      } catch {
        // swallow
      }
    }
  } catch (e) {
    // Package missing or constructor threw — degrade silently.
    client = null;
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] PostHog init skipped:", e);
    }
  }
}

function track(event: string, props?: Record<string, unknown>): void {
  if (!client) return;
  if (!event || typeof event !== "string") return;
  // Fire-and-forget. PostHog's capture is sync (queue-only) — we still
  // defer with queueMicrotask so a hot callsite doesn't pay any cost.
  try {
    const scrubbed = safeScrub(props);
    queueMicrotask(() => {
      try {
        client?.capture(event, scrubbed);
      } catch {
        // Swallow — telemetry must never surface.
      }
    });
  } catch {
    // Swallow.
  }
}

function identify(userId: string, traits?: Record<string, unknown>): void {
  if (!client) return;
  if (!userId) return;
  try {
    const scrubbed = safeScrub(traits);
    queueMicrotask(() => {
      try {
        client?.identify(userId, scrubbed);
      } catch {
        // Swallow.
      }
    });
  } catch {
    // Swallow.
  }
}

function reset(): void {
  if (!client) return;
  try {
    client.reset();
  } catch {
    // Swallow.
  }
}

export const Analytics = {
  init,
  track,
  identify,
  reset,
};
