// PaywallCard — Enigma-styled "Upgrade to Pro" card.
//
// Renders one of three states:
//   1. Loading status (skeleton — minimal so it doesn't shift layout).
//   2. Free tier → "Upgrade to Pro" CTA listing the benefits.
//   3. Pro tier → "Pro 멤버" badge + "구독 관리" link to the billing portal.
//
// On press of the upgrade CTA we POST to /api/billing/checkout and open the
// returned Stripe URL. If the server reports Stripe is not configured, we
// surface a polite trilingual notice instead of a generic error.
//
// Linked from the settings page (per the spec — never autopresented).

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  useSubscriptionStatus,
  startCheckout,
  openBillingPortal,
  type CheckoutResult,
} from "@/lib/billing";

type LangKey = "ko" | "en" | "es";

const T = {
  // Header
  proBadge:       { ko: "Pro 멤버",                 en: "Pro member",                 es: "Miembro Pro" },
  upgradeTitle:   { ko: "Pro로 업그레이드",          en: "Upgrade to Pro",             es: "Mejora a Pro" },
  upgradeTagline: { ko: "더 깊이, 더 오래, 더 똑똑하게.",
                    en: "Go deeper, longer, smarter.",
                    es: "Más profundo, más tiempo, más inteligente." },

  // Pricing
  priceLine:      { ko: "월 5,900원 (또는 $4.99)",
                    en: "$4.99 / month",
                    es: "$4.99 / mes" },

  // Benefits — kept tight so the card stays one viewport tall.
  benefit1:       { ko: "무제한 발음 평가 (무료: 일 30회)",
                    en: "Unlimited pronunciation assessments (free: 30/day)",
                    es: "Evaluaciones de pronunciación ilimitadas (gratis: 30/día)" },
  benefit2:       { ko: "모든 점수에 GPT 코칭 (무료: 약한 부분만)",
                    en: "GPT coaching on every score (free: weak band only)",
                    es: "Coaching GPT en cada puntuación (gratis: solo banda débil)" },
  benefit3:       { ko: "기록을 더 오래 보관",
                    en: "Deeper data retention",
                    es: "Historial conservado más tiempo" },
  benefit4:       { ko: "프로필에 Pro 배지",
                    en: "Pro badge on your profile",
                    es: "Insignia Pro en tu perfil" },

  // CTAs
  cta:            { ko: "Pro로 업그레이드",          en: "Upgrade to Pro",             es: "Mejora a Pro" },
  ctaBusy:        { ko: "결제 페이지 여는 중…",       en: "Opening checkout…",          es: "Abriendo el pago…" },
  manage:         { ko: "구독 관리",                en: "Manage subscription",        es: "Administrar suscripción" },

  // Status messages
  notConfigured:  { ko: "결제 시스템 준비 중",       en: "Billing coming soon",        es: "Sistema de pago en preparación" },
  signInFirst:    { ko: "먼저 로그인하세요",         en: "Sign in first",              es: "Inicia sesión primero" },
  openFailed:     { ko: "결제 페이지를 열 수 없어요", en: "Couldn't open checkout",    es: "No se pudo abrir el pago" },
  genericError:   { ko: "오류가 발생했어요",         en: "Something went wrong",       es: "Algo salió mal" },
} as const;

function t(obj: Record<string, string>, lang: LangKey): string {
  return obj[lang] || obj.en;
}

// Try to come back to the app after the user finishes (or cancels) checkout.
// On web this is the current origin; on native there isn't a true return-URL
// since Stripe Checkout opens in an external browser, but we still pass
// something reasonable that Stripe can display as the "Return to LinguaAI" link.
function inferReturnUrl(): string {
  if (Platform.OS === "web" && typeof globalThis.location?.origin === "string") {
    return `${globalThis.location.origin}/settings`;
  }
  // Native fallback — points at a marketing page Stripe shows as "Return to
  // LinguaAI". Replace with a real universal-link / app-link URL once you
  // have one set up.
  return "https://linguaai.app/billing-return";
}

async function openExternal(url: string): Promise<boolean> {
  try {
    if (Platform.OS === "web") {
      // window.open returns the new Window or null; treat null as "blocked".
      const opened =
        typeof globalThis.open === "function" && globalThis.open(url, "_blank");
      if (opened) return true;
      // Pop-up blocked → fall through to Linking (full-page navigation).
    }
    await Linking.openURL(url);
    return true;
  } catch (err) {
    console.warn("[PaywallCard] openExternal failed", err);
    return false;
  }
}

export interface PaywallCardProps {
  /** Optional override; defaults to a sensible return URL per platform. */
  returnUrl?: string;
}

export default function PaywallCard({ returnUrl }: PaywallCardProps): React.JSX.Element | null {
  const { nativeLanguage } = useLanguage();
  const lc: LangKey =
    nativeLanguage === "korean" ? "ko" : nativeLanguage === "spanish" ? "es" : "en";
  const { user } = useAuth();
  const { tier, loading, refresh } = useSubscriptionStatus();

  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCheckoutResult = useCallback(
    async (result: CheckoutResult) => {
      switch (result.kind) {
        case "redirect": {
          const ok = await openExternal(result.url);
          if (!ok) setStatusMessage(t(T.openFailed, lc));
          // Refresh subscription status after a short delay so the UI updates
          // when the user comes back (best-effort — webhook is the source of truth).
          setTimeout(() => void refresh(), 4000);
          return;
        }
        case "not_configured":
          setStatusMessage(t(T.notConfigured, lc));
          return;
        case "unauthorized":
          setStatusMessage(t(T.signInFirst, lc));
          return;
        case "error":
          setStatusMessage(t(T.genericError, lc));
          return;
      }
    },
    [lc, refresh],
  );

  const onUpgrade = useCallback(async () => {
    if (busy) return;
    if (!user) {
      setStatusMessage(t(T.signInFirst, lc));
      return;
    }
    setBusy(true);
    setStatusMessage(null);
    try {
      const result = await startCheckout(returnUrl ?? inferReturnUrl());
      await handleCheckoutResult(result);
    } finally {
      setBusy(false);
    }
  }, [busy, user, lc, returnUrl, handleCheckoutResult]);

  const onManage = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setStatusMessage(null);
    try {
      const result = await openBillingPortal(returnUrl ?? inferReturnUrl());
      await handleCheckoutResult(result);
    } finally {
      setBusy(false);
    }
  }, [busy, returnUrl, handleCheckoutResult]);

  if (loading) {
    // Tiny skeleton so layout doesn't pop; full card is ~200px tall.
    return (
      <View style={[styles.card, styles.skeleton]}>
        <ActivityIndicator color={C.gold} />
      </View>
    );
  }

  if (tier === "pro") {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Ionicons name="diamond" size={20} color={C.gold} />
          <Text style={styles.proBadgeText}>{t(T.proBadge, lc)}</Text>
        </View>
        <Pressable
          onPress={onManage}
          disabled={busy}
          style={[styles.manageBtn, { opacity: busy ? 0.5 : 1 }]}
        >
          <Ionicons name="settings-outline" size={16} color={C.gold} />
          <Text style={styles.manageBtnText}>{t(T.manage, lc)}</Text>
        </Pressable>
        {statusMessage ? (
          <Text style={styles.statusText}>{statusMessage}</Text>
        ) : null}
      </View>
    );
  }

  // Free tier — show the upgrade pitch.
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="diamond-outline" size={20} color={C.gold} />
        <Text style={styles.title}>{t(T.upgradeTitle, lc)}</Text>
      </View>
      <Text style={styles.tagline}>{t(T.upgradeTagline, lc)}</Text>
      <Text style={styles.price}>{t(T.priceLine, lc)}</Text>

      <View style={styles.benefitList}>
        {([T.benefit1, T.benefit2, T.benefit3, T.benefit4] as const).map((b, i) => (
          <View key={i} style={styles.benefitRow}>
            <Ionicons name="checkmark" size={14} color={C.gold} />
            <Text style={styles.benefitText}>{t(b, lc)}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onUpgrade}
        disabled={busy}
        style={[styles.cta, { opacity: busy ? 0.6 : 1 }]}
      >
        {busy ? (
          <ActivityIndicator color={C.bg1} size="small" />
        ) : (
          <Ionicons name="sparkles" size={16} color={C.bg1} />
        )}
        <Text style={styles.ctaText}>
          {busy ? t(T.ctaBusy, lc) : t(T.cta, lc)}
        </Text>
      </Pressable>

      {statusMessage ? (
        <Text style={styles.statusText}>{statusMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 10,
  },
  skeleton: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: F.header,
    fontSize: 17,
    color: C.gold,
    letterSpacing: 0.5,
  },
  proBadgeText: {
    fontFamily: F.header,
    fontSize: 16,
    color: C.gold,
    letterSpacing: 0.5,
  },
  tagline: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.parchment,
    fontStyle: "italic",
  },
  price: {
    fontFamily: F.bodyBold,
    fontSize: 16,
    color: C.parchmentDark,
    marginTop: 2,
  },
  benefitList: {
    gap: 6,
    marginTop: 6,
    marginBottom: 4,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  benefitText: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.parchment,
    flex: 1,
    lineHeight: 18,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.gold,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.goldDim,
    marginTop: 4,
  },
  ctaText: {
    fontFamily: F.header,
    fontSize: 15,
    fontWeight: "600",
    color: C.bg1,
    letterSpacing: 0.5,
  },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg2,
  },
  manageBtnText: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.gold,
  },
  statusText: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.goldDim,
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
});
