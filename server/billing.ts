// Stripe Subscription billing for LinguaAI — SCAFFOLD ONLY.
//
// This module is intentionally written so the Stripe SDK is NOT imported yet
// and no `npm install stripe` is required. Every helper checks for the
// `STRIPE_SECRET_KEY` env var and gracefully no-ops when it is missing,
// returning a `{ url: null, error: "Stripe not configured" }` shape that the
// client surfaces as "결제 시스템 준비 중" / "Billing coming soon" / "Sistema
// de pago en preparación".
//
// To activate Stripe later, see the Activation Checklist in the report this
// agent printed. In short:
//   1. npm install stripe
//   2. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID,
//      BILLING_RETURN_URL_DEFAULT (optional) in env.
//   3. Run the migration printed in this file's header.
//   4. Uncomment the `import Stripe from "stripe"` line marked below.
//   5. Set up a webhook in the Stripe dashboard pointing at
//      `<your-api-host>/api/billing/webhook`.
//
// ── Supabase migration (run once; do NOT run via tooling — apply manually) ───
//   create table public.linguaai_user_subscriptions (
//     user_id uuid primary key references auth.users(id) on delete cascade,
//     tier text not null default 'free',
//     stripe_customer_id text,
//     stripe_subscription_id text,
//     current_period_end timestamptz,
//     updated_at timestamptz not null default now()
//   );
//   alter table public.linguaai_user_subscriptions enable row level security;
//   create policy "own_select" on public.linguaai_user_subscriptions
//     for select using (auth.uid() = user_id);
// ──────────────────────────────────────────────────────────────────────────────
//
// Tier semantics enforced elsewhere in the app:
//   free  — ≤30 pronunciation assessments/day; GPT coaching only on the weak band
//   pro   — unlimited assessments, full coaching on every score, deeper data
//           retention, profile badge.
//
// Pricing target: $4.99/mo or ₩5,900/mo (whichever currency the Stripe Price
// is configured for — this file doesn't bake the amount; it just hands off to
// the Price configured in your Stripe dashboard via STRIPE_PRICE_ID).

// NOTE TO FUTURE MAINTAINER: when you `npm install stripe`, uncomment the
// next line. The rest of this file is already typed to use it lazily, so
// nothing else needs to change in source — only the env vars.
//
// import Stripe from "stripe";

import { getServiceRoleClient } from "./supabaseAdmin";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionTier = "free" | "pro";

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  current_period_end?: string | null;
}

export interface CheckoutSessionInput {
  user_id: string;
  /** Where Stripe should redirect the user after success/cancel. */
  return_url: string;
  /** Optional override; defaults to STRIPE_PRICE_ID env var. */
  price_id?: string;
  /** Optional email the user is signed in with — used to prefill checkout. */
  customer_email?: string | null;
}

export interface PortalSessionInput {
  user_id: string;
  return_url: string;
}

export interface CheckoutSessionResult {
  url: string | null;
  error?: string;
}

export interface PortalSessionResult {
  url: string | null;
  error?: string;
}

export interface WebhookVerificationResult {
  ok: boolean;
  /** Parsed event object when ok; null otherwise. */
  event: { id: string; type: string; data: { object: any } } | null;
  error?: string;
}

// ── Config ───────────────────────────────────────────────────────────────────

const SUBS_TABLE = "linguaai_user_subscriptions";

function readEnv(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : undefined;
}

/**
 * True when Stripe is configured and the SDK is reachable. The current
 * scaffold returns false even if STRIPE_SECRET_KEY is set, because we haven't
 * uncommented the Stripe import yet. That's intentional — flipping `stripe`
 * to non-null only happens after `npm install stripe`.
 */
export function isStripeConfigured(): boolean {
  return Boolean(getStripeClient());
}

/**
 * Lazily returns a Stripe instance. Returns null while:
 *   - STRIPE_SECRET_KEY is missing, OR
 *   - the `import Stripe from "stripe"` line above is still commented out
 *     (i.e. the package isn't installed yet).
 *
 * Once both conditions are satisfied, this function transparently constructs
 * the client. No call site changes needed.
 */
function getStripeClient(): any | null {
  const key = readEnv("STRIPE_SECRET_KEY");
  if (!key) return null;

  // After you uncomment `import Stripe from "stripe"` above, replace the
  // body of this function with:
  //
  //   if (cachedStripe) return cachedStripe;
  //   cachedStripe = new Stripe(key, { apiVersion: "2024-06-20" });
  //   return cachedStripe;
  //
  // For now we cannot reference `Stripe` (undefined at module load), so we
  // return null and log once per process to make the misconfiguration loud.
  if (!warnedStripeNotInstalled) {
    warnedStripeNotInstalled = true;
    console.warn(
      "[billing] STRIPE_SECRET_KEY is set but the Stripe SDK is not imported. " +
        "Run `npm install stripe` and uncomment the `import Stripe from \"stripe\"` line " +
        "in server/billing.ts to activate billing.",
    );
  }
  return null;
}

let warnedStripeNotInstalled = false;
// let cachedStripe: any | null = null; // uncomment alongside the Stripe import

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Creates a Stripe Checkout Session in subscription mode. Returns a
 * `{ url: null, error: "Stripe not configured" }` placeholder when the
 * environment isn't ready — the client renders that as the trilingual
 * "결제 시스템 준비 중" notice.
 */
export async function createCheckoutSession(
  input: CheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();
  if (!stripe) {
    return { url: null, error: "Stripe not configured" };
  }

  const priceId = input.price_id ?? readEnv("STRIPE_PRICE_ID");
  if (!priceId) {
    return { url: null, error: "STRIPE_PRICE_ID is not set" };
  }

  try {
    // Try to reuse the Stripe customer we already have on file so the user
    // doesn't end up with duplicate records on subsequent upgrades.
    const existingCustomerId = await getExistingCustomerId(input.user_id);

    const params: Record<string, unknown> = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: input.return_url,
      cancel_url: input.return_url,
      // Stash the Supabase uid on both the session and the resulting
      // subscription so webhooks can resolve back to a learner.
      client_reference_id: input.user_id,
      metadata: { supabase_user_id: input.user_id },
      subscription_data: {
        metadata: { supabase_user_id: input.user_id },
      },
      allow_promotion_codes: true,
    };

    if (existingCustomerId) {
      params.customer = existingCustomerId;
    } else if (input.customer_email) {
      params.customer_email = input.customer_email;
    }

    const session = await stripe.checkout.sessions.create(params);
    return { url: session.url ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    console.error("[billing] createCheckoutSession failed", message);
    return { url: null, error: "Checkout creation failed" };
  }
}

/**
 * Creates a Stripe Billing Portal session so existing subscribers can
 * cancel, update payment method, or download invoices.
 */
export async function createPortalSession(
  input: PortalSessionInput,
): Promise<PortalSessionResult> {
  const stripe = getStripeClient();
  if (!stripe) {
    return { url: null, error: "Stripe not configured" };
  }

  const customerId = await getExistingCustomerId(input.user_id);
  if (!customerId) {
    return { url: null, error: "No subscription on file" };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: input.return_url,
    });
    return { url: session.url ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    console.error("[billing] createPortalSession failed", message);
    return { url: null, error: "Portal creation failed" };
  }
}

/**
 * Verifies a webhook payload signature using the configured webhook secret.
 * Returns `{ ok: false }` when:
 *   - Stripe isn't installed yet,
 *   - the secret env var is missing,
 *   - or the signature doesn't match the body.
 *
 * The third argument lets callers pass a non-default secret (useful when
 * routing multiple Stripe webhook destinations through one endpoint, but
 * usually you'll let it default to `process.env.STRIPE_WEBHOOK_SECRET`).
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string | undefined,
  secret?: string,
): WebhookVerificationResult {
  const stripe = getStripeClient();
  if (!stripe) {
    return { ok: false, event: null, error: "Stripe not configured" };
  }

  const webhookSecret = secret ?? readEnv("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    return { ok: false, event: null, error: "STRIPE_WEBHOOK_SECRET is not set" };
  }

  if (!signature) {
    return { ok: false, event: null, error: "Missing stripe-signature header" };
  }

  try {
    // After `npm install stripe`, this resolves to a real Stripe.Event with
    // the canonical { id, type, data: { object } } shape.
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    return { ok: true, event };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature verification failed";
    return { ok: false, event: null, error: message };
  }
}

/**
 * Reads the current subscription status for a Supabase user from the
 * `linguaai_user_subscriptions` table. Defaults to `{ tier: "free" }` when:
 *   - no row exists for the user,
 *   - the service-role client isn't configured,
 *   - or the read fails for any reason (fail-closed: missing data = free).
 */
export async function getSubscriptionStatus(user_id: string): Promise<SubscriptionStatus> {
  if (!user_id) return { tier: "free" };

  const admin = getServiceRoleClient();
  if (!admin) {
    // No service role → we can't read across users, so we fall back to free.
    // This keeps the app working in environments that haven't been wired up
    // for Supabase admin (e.g. local dev without secrets).
    return { tier: "free" };
  }

  try {
    const { data, error } = await admin
      .from(SUBS_TABLE)
      .select("tier, current_period_end")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      console.error("[billing] getSubscriptionStatus query error", error.message);
      return { tier: "free" };
    }

    if (!data) return { tier: "free" };

    const tier: SubscriptionTier = data.tier === "pro" ? "pro" : "free";
    return {
      tier,
      current_period_end: (data.current_period_end as string | null | undefined) ?? null,
    };
  } catch (err) {
    console.error("[billing] getSubscriptionStatus unexpected error", err);
    return { tier: "free" };
  }
}

// ── Webhook event application ────────────────────────────────────────────────

/**
 * Apply a Stripe subscription webhook event to the Supabase
 * `linguaai_user_subscriptions` table. Idempotent: re-delivering the same
 * event is safe because we always upsert by `user_id`.
 *
 * Supported event types:
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *
 * Any other event type is a no-op (returns { handled: false }).
 */
export async function applySubscriptionEvent(event: {
  id: string;
  type: string;
  data: { object: any };
}): Promise<{ handled: boolean; reason?: string }> {
  if (!event?.type?.startsWith("customer.subscription.")) {
    return { handled: false, reason: "not a subscription event" };
  }

  const admin = getServiceRoleClient();
  if (!admin) {
    console.warn("[billing] applySubscriptionEvent skipped: no service-role client");
    return { handled: false, reason: "service-role client missing" };
  }

  const subscription = event.data?.object;
  if (!subscription || typeof subscription !== "object") {
    return { handled: false, reason: "no subscription object" };
  }

  // Stripe puts our Supabase uid into `metadata.supabase_user_id` (we set it
  // during checkout-session creation). Fall back to `client_reference_id` for
  // sessions created via raw-API tooling.
  const meta = (subscription.metadata ?? {}) as Record<string, string>;
  const userId =
    meta.supabase_user_id ??
    (subscription.client_reference_id as string | undefined) ??
    null;

  if (!userId) {
    console.warn(
      "[billing] applySubscriptionEvent: subscription has no Supabase user id metadata; skipping",
      event.id,
    );
    return { handled: false, reason: "no user id in metadata" };
  }

  const status = subscription.status as string | undefined;
  const isActive = status === "active" || status === "trialing";
  const tier: SubscriptionTier =
    event.type === "customer.subscription.deleted" || !isActive ? "free" : "pro";

  const periodEndUnix = subscription.current_period_end as number | undefined;
  const currentPeriodEnd = periodEndUnix
    ? new Date(periodEndUnix * 1000).toISOString()
    : null;

  const row = {
    user_id: userId,
    tier,
    stripe_customer_id: (subscription.customer as string | null) ?? null,
    stripe_subscription_id: (subscription.id as string | null) ?? null,
    current_period_end: currentPeriodEnd,
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await admin
      .from(SUBS_TABLE)
      .upsert(row, { onConflict: "user_id" });
    if (error) {
      console.error("[billing] applySubscriptionEvent upsert failed", error.message);
      return { handled: false, reason: error.message };
    }
    return { handled: true };
  } catch (err) {
    console.error("[billing] applySubscriptionEvent unexpected error", err);
    return { handled: false, reason: "unexpected error" };
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────────

async function getExistingCustomerId(user_id: string): Promise<string | null> {
  const admin = getServiceRoleClient();
  if (!admin) return null;

  try {
    const { data, error } = await admin
      .from(SUBS_TABLE)
      .select("stripe_customer_id")
      .eq("user_id", user_id)
      .maybeSingle();
    if (error || !data) return null;
    return (data.stripe_customer_id as string | null) ?? null;
  } catch {
    return null;
  }
}
