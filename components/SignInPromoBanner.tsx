// Smart sign-in promo banner (option 3 in the auth-rollout plan).
//
// Appears at the top of the home screen only when:
//   - user is signed out
//   - language onboarding is done
//   - user has earned something worth saving (XP > 100 OR streak >= 3)
//   - the user hasn't dismissed it in the last 7 days
//
// Copy is loss-aversion framed ("don't lose your XP", not "create an account")
// and the tap target routes to /settings where the actual auth UI lives.

import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { C, F } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const DISMISS_KEY = "@lingua_signin_banner_dismissed_at";
// Shared with FirstTimeSignInModal — the banner must not show until the
// modal has been dismissed at least once, otherwise both render on the
// same page and the user reads the same prompt twice.
const MODAL_SEEN_KEY = "@lingua_signin_modal_seen_v1";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const XP_THRESHOLD = 100;
const STREAK_THRESHOLD = 3;

type Copy = { title: string; cta: string };
function pickCopy(
  lang: "korean" | "english" | "spanish" | "indonesian" | null,
  xp: number,
  streak: number,
): Copy {
  // Korean default — most of the tester base
  const useStreak = streak >= STREAK_THRESHOLD && xp < XP_THRESHOLD * 2;
  if (lang === "spanish") {
    return useStreak
      ? {
          title: `🦊 ¡${streak} días seguidos! No pierdas tu racha al cambiar de dispositivo →`,
          cta: "Guardar progreso",
        }
      : {
          title: `🦊 ¡${xp} XP acumulados! Guárdalos para no perderlos al cambiar de dispositivo →`,
          cta: "Guardar progreso",
        };
  }
  if (lang === "indonesian") {
    return useStreak
      ? {
          title: `🦊 ${streak} hari beruntun! Simpan agar tidak hilang saat ganti perangkat →`,
          cta: "Simpan progres",
        }
      : {
          title: `🦊 ${xp} XP terkumpul! Simpan agar tidak hilang saat ganti perangkat →`,
          cta: "Simpan progres",
        };
  }
  if (lang === "english") {
    return useStreak
      ? {
          title: `🦊 ${streak}-day streak! Save it so you don't lose it on a new device →`,
          cta: "Save progress",
        }
      : {
          title: `🦊 ${xp} XP earned! Save them so they don't vanish on a new device →`,
          cta: "Save progress",
        };
  }
  // Korean
  return useStreak
    ? {
        title: `🦊 ${streak}일 연속! 폰을 바꿔도 연속학습이 끊기지 않으려면 →`,
        cta: "진도 저장하기",
      }
    : {
        title: `🦊 ${xp} XP 모았어요! 폰을 바꿔도 진도를 잃지 않으려면 →`,
        cta: "진도 저장하기",
      };
}

export function SignInPromoBanner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasOnboarded, isHydrated, stats, nativeLanguage } = useLanguage();
  const [eligible, setEligible] = useState(false);

  // Re-check eligibility whenever upstream state shifts.
  useEffect(() => {
    if (!isHydrated || authLoading) return;
    if (user) { setEligible(false); return; }
    if (!hasOnboarded) { setEligible(false); return; }
    const earnedSomething = stats.xp >= XP_THRESHOLD || stats.streak >= STREAK_THRESHOLD;
    if (!earnedSomething) { setEligible(false); return; }

    let cancelled = false;
    (async () => {
      // Defer to FirstTimeSignInModal: if the one-shot modal hasn't been
      // dismissed yet, suppress the banner so the user only sees ONE
      // sign-in surface at a time.
      const modalSeen = await AsyncStorage.getItem(MODAL_SEEN_KEY);
      if (cancelled) return;
      if (modalSeen !== "1") { setEligible(false); return; }
      const v = await AsyncStorage.getItem(DISMISS_KEY);
      if (cancelled) return;
      const dismissedAt = v ? Number(v) : 0;
      const cooled = dismissedAt === 0 || Date.now() - dismissedAt > DISMISS_COOLDOWN_MS;
      setEligible(cooled);
    })();
    return () => { cancelled = true; };
  }, [user, authLoading, hasOnboarded, isHydrated, stats.xp, stats.streak]);

  const onDismiss = useCallback(async () => {
    setEligible(false);
    try { await AsyncStorage.setItem(DISMISS_KEY, String(Date.now())); }
    catch (e) { console.warn("[SignInPromoBanner] dismiss persist failed:", e); }
  }, []);

  const onTap = useCallback(() => {
    router.push("/settings");
  }, [router]);

  if (!eligible) return null;
  const copy = pickCopy(nativeLanguage, stats.xp, stats.streak);
  const closeLabel =
    nativeLanguage === "korean" ? "닫기"
    : nativeLanguage === "spanish" ? "descartar"
    : nativeLanguage === "indonesian" ? "tutup"
    : "dismiss";

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.cta}
        onPress={onTap}
        style={({ pressed }) => [styles.body, pressed && styles.bodyPressed]}
      >
        <Text style={styles.title} numberOfLines={2}>{copy.title}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
        onPress={onDismiss}
        hitSlop={8}
        style={({ pressed }) => [styles.close, pressed && { opacity: 0.5 }]}
      >
        <Ionicons name="close" size={16} color={C.bg1} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: C.gold,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bodyPressed: {
    opacity: 0.85,
  },
  title: {
    fontFamily: F.bodySemi,
    fontSize: 13.5,
    color: C.bg1,
    lineHeight: 18,
  },
  close: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
