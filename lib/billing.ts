// Client-side billing helpers.
//
// Two responsibilities:
//   1. `useSubscriptionStatus()` — React hook that calls /api/billing/status
//      with the current Supabase JWT and returns { tier, loading }.
//   2. `startCheckout()` / `openBillingPortal()` — imperative helpers used by
//      the PaywallCard CTA. They handle the "Stripe not configured" placeholder
//      response gracefully and bubble up a friendly error code the caller can
//      surface in the user's native language.
//
// Why no React Query? We already have it elsewhere, but the subscription
// status is a tiny endpoint and the result is fine being component-local;
// adding it to the query cache would mean defining a key, an invalidator
// after upgrade, etc. — overkill for v1.

import { useEffect, useState, useCallback } from "react";
import { fetch } from "expo/fetch";
import { getApiUrl } from "@/lib/query-client";
import { supabase } from "@/lib/supabase";

export type SubscriptionTier = "free" | "pro";

export interface SubscriptionStatusResponse {
  tier: SubscriptionTier;
  current_period_end?: string | null;
  stripe_configured: boolean;
}

export interface UseSubscriptionStatusResult {
  tier: SubscriptionTier;
  loading: boolean;
  /** True when the server reports Stripe is wired up. */
  stripeConfigured: boolean;
  /** When the current Pro period ends (ISO string). null on free or unknown. */
  currentPeriodEnd: string | null;
  /** Imperative refresh — call after the user returns from Stripe Checkout. */
  refresh: () => Promise<void>;
}

export type CheckoutResult =
  | { kind: "redirect"; url: string }
  | { kind: "not_configured" }
  | { kind: "unauthorized" }
  | { kind: "error"; message: string };

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetches /api/billing/status and exposes a small reactive surface.
 *
 * Behaviour:
 *   - While loading: tier defaults to "free" so paywalled UI doesn't briefly
 *     show as unlocked.
 *   - On 401 (signed out or token expired): tier stays "free".
 *   - On network error: tier stays "free" and the loading flag clears so the
 *     UI can move past the spinner.
 */
export function useSubscriptionStatus(): UseSubscriptionStatusResult {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [loading, setLoading] = useState(true);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await authHeader();
      if (!headers.Authorization) {
        setTier("free");
        setStripeConfigured(false);
        setCurrentPeriodEnd(null);
        return;
      }

      const url = new URL("/api/billing/status", getApiUrl()).toString();
      const res = await fetch(url, { method: "GET", headers });
      if (!res.ok) {
        setTier("free");
        setStripeConfigured(false);
        setCurrentPeriodEnd(null);
        return;
      }

      const json = (await res.json()) as Partial<SubscriptionStatusResponse>;
      setTier(json.tier === "pro" ? "pro" : "free");
      setStripeConfigured(Boolean(json.stripe_configured));
      setCurrentPeriodEnd(
        typeof json.current_period_end === "string" ? json.current_period_end : null,
      );
    } catch (err) {
      console.warn("[billing] status fetch failed", err);
      setTier("free");
      setStripeConfigured(false);
      setCurrentPeriodEnd(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Re-load when the auth session changes — signing in/out should flip tier.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [load]);

  return { tier, loading, stripeConfigured, currentPeriodEnd, refresh: load };
}

/**
 * Imperatively kick off a checkout flow. The caller is responsible for
 * opening the returned URL (so callers can choose Linking.openURL,
 * WebBrowser.openBrowserAsync, or window.location depending on platform).
 *
 * Returns a tagged union so the UI can react differently to "stripe not
 * configured yet" (show a polite trilingual notice) vs an actual error.
 */
export async function startCheckout(returnUrl: string): Promise<CheckoutResult> {
  try {
    const headers = await authHeader();
    if (!headers.Authorization) return { kind: "unauthorized" };

    const url = new URL("/api/billing/checkout", getApiUrl()).toString();
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ return_url: returnUrl }),
    });

    if (res.status === 401) return { kind: "unauthorized" };

    const json = (await res.json().catch(() => ({}))) as {
      url?: string | null;
      error?: string;
    };

    if (json.url) return { kind: "redirect", url: json.url };
    if (json.error === "Stripe not configured") return { kind: "not_configured" };
    return { kind: "error", message: json.error ?? `HTTP ${res.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "error", message };
  }
}

/**
 * Kick off a billing-portal session for existing subscribers. Same return
 * shape as startCheckout. "Stripe not configured" is reported as
 * `not_configured` so the UI can render the same polite placeholder.
 */
export async function openBillingPortal(returnUrl: string): Promise<CheckoutResult> {
  try {
    const headers = await authHeader();
    if (!headers.Authorization) return { kind: "unauthorized" };

    const url = new URL("/api/billing/portal", getApiUrl()).toString();
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ return_url: returnUrl }),
    });

    if (res.status === 401) return { kind: "unauthorized" };

    const json = (await res.json().catch(() => ({}))) as {
      url?: string | null;
      error?: string;
    };
    if (json.url) return { kind: "redirect", url: json.url };
    if (json.error === "Stripe not configured") return { kind: "not_configured" };
    return { kind: "error", message: json.error ?? `HTTP ${res.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "error", message };
  }
}
