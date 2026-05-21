// Coaching card — wraps Azure's numeric score with a short GPT-4o-mini
// generated comment in the learner's native language. Sits BELOW the score
// circle on the Speak tab (above PhonemeCoaching — it's the most empathetic
// feedback surface and shouldn't be buried).
//
// Design notes (Enigma palette):
//   - Hairline gold border, score-band-tinted shadow glow, parchment text
//     on bg2 — same vocabulary as the rest of the app.
//   - Rudy badge image (not the 🦊 emoji which renders inconsistently).
//   - Header in Cinzel matching PhonemeCoaching's "PHONEME COACHING" treatment.
//
// Behaviour:
//   - On a fresh attemptId, optimistically render the deterministic fallback
//     copy and fade in the GPT version when it arrives. Eliminates the
//     "Rudy is thinking" dead time UX agent flagged.
//   - 404 silently hides (server hasn't redeployed yet).
//   - All fetches — initial AND retry — go through a SINGLE AbortController
//     in a ref, so retry-while-attempt-in-flight can't race (QA Bug N2).

import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet, Pressable, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const rudyBadge = require("@/assets/rudy_badge.png");

type NativeLang = "korean" | "english" | "spanish";

interface CoachRequest {
  word: string;
  lang: string;                  // BCP-47 (en-US, etc.)
  nativeLang: NativeLang;
  score: number;
  accuracyScore?: number | null;
  fluencyScore?: number | null;
  completenessScore?: number | null;
  recognizedText?: string;
  weakPhonemes?: string[];
}

interface Props extends CoachRequest {
  /** When this number changes, the card resets and re-fetches. Use it to
   *  invalidate after a new recording attempt. */
  attemptId: number;
}

// All copy lives here so each locale string is auditable in one place.
const L = (nl: NativeLang) => ({
  header: nl === "korean" ? "코치 한마디" : nl === "spanish" ? "Consejo del coach" : "Coach tip",
  failed: nl === "korean" ? "루디의 한 마디를 불러오지 못했어요." : nl === "spanish" ? "No se pudo cargar el comentario de Rudy." : "Couldn't load Rudy's note.",
  retry: nl === "korean" ? "다시 받기" : nl === "spanish" ? "Reintentar" : "Try again",
});

// Score band → shadow tint. Matches the unified 75/50 thresholds used by the
// rest of speak.tsx and PhonemeCoaching. Uses Enigma palette tokens, not
// Tailwind hex.
function bandShadow(score: number): string {
  if (score >= 75) return C.success;
  if (score >= 50) return C.gold;
  return C.error;
}

// Deterministic placeholder so the user sees something useful immediately,
// not a spinner. The GPT comment fades over this when it arrives.
function fallbackText(word: string, score: number, nl: NativeLang, weak: string[]): string {
  const band = score >= 90 ? "great" : score >= 75 ? "good" : score >= 50 ? "fair" : "weak";
  const wKo = weak.length > 0 ? ` (특히 ${weak.join(", ")} 소리.)` : "";
  const wEn = weak.length > 0 ? ` Watch out for: ${weak.join(", ")}.` : "";
  const wEs = weak.length > 0 ? ` Atento a: ${weak.join(", ")}.` : "";
  if (nl === "korean") {
    if (band === "great") return `"${word}" 정말 자연스러웠어요! 🎉`;
    if (band === "good") return `"${word}" 거의 다 왔어요. 한 번만 더 따라 해볼까요?${wKo}`;
    if (band === "fair") return `"${word}"의 음절을 천천히 끊어서 발음해 보세요.${wKo}`;
    return `먼저 듣기 버튼으로 "${word}"의 원어민 발음을 들어봐요. 🦊`;
  }
  if (nl === "spanish") {
    if (band === "great") return `¡Tu "${word}" sonó natural! 🎉`;
    if (band === "good") return `"${word}" estuvo cerca — escucha una vez más e inténtalo.${wEs}`;
    if (band === "fair") return `Para "${word}", pronuncia cada sílaba más despacio.${wEs}`;
    return `Empieza escuchando "${word}" con el botón de altavoz. 🦊`;
  }
  if (band === "great") return `Your "${word}" sounded natural! 🎉`;
  if (band === "good") return `"${word}" was close — listen once more and give it another shot.${wEn}`;
  if (band === "fair") return `For "${word}", slow down each syllable.${wEn}`;
  return `Start by listening to "${word}" with the speaker button. 🦊`;
}

export function CoachingCard(props: Props) {
  const { word, lang, nativeLang, score, accuracyScore, fluencyScore, completenessScore, recognizedText, weakPhonemes, attemptId } = props;
  // Two layers of text: the deterministic placeholder painted immediately,
  // and the GPT version that cross-fades in when it arrives.
  const placeholder = React.useMemo(
    () => fallbackText(word, score, nativeLang, weakPhonemes ?? []),
    [word, score, nativeLang, weakPhonemes],
  );
  const [gptComment, setGptComment] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [hidden, setHidden] = useState(false);
  const placeholderFade = useRef(new Animated.Value(1)).current;
  const gptFade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;
  const labels = L(nativeLang);

  // Latest props in a ref so the fetch closure stays referentially stable.
  const requestRef = useRef<CoachRequest>({
    word, lang, nativeLang, score,
    accuracyScore, fluencyScore, completenessScore,
    recognizedText, weakPhonemes,
  });
  useEffect(() => {
    requestRef.current = {
      word, lang, nativeLang, score,
      accuracyScore, fluencyScore, completenessScore,
      recognizedText, weakPhonemes,
    };
  }, [word, lang, nativeLang, score, accuracyScore, fluencyScore, completenessScore, recognizedText, weakPhonemes]);

  // Single AbortController for the active attempt. Used by BOTH the initial
  // effect-driven fetch and any retry tap — so a retry can't race the next
  // attempt (QA Bug N2). Replaced on each attemptId bump and on retry tap.
  const controllerRef = useRef<AbortController | null>(null);

  const fetchCoach = React.useCallback(async () => {
    controllerRef.current?.abort();
    const ctrl = new AbortController();
    controllerRef.current = ctrl;
    const { signal } = ctrl;
    setError(false);
    setHidden(false);
    try {
      const url = new URL("/api/pronunciation-coach", getApiUrl()).toString();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestRef.current),
        signal,
      });
      if (signal.aborted) return;
      if (res.status === 404) {
        // Server hasn't shipped the endpoint yet (rollout window). Hide.
        setHidden(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { ko?: string; en?: string; es?: string };
      if (signal.aborted) return;
      const nl = requestRef.current.nativeLang;
      const text = nl === "korean" ? data.ko : nl === "spanish" ? data.es : data.en;
      if (!text || text.trim() === "") return; // keep placeholder; nothing to upgrade
      setGptComment(text);
      // Cross-fade: placeholder out, GPT in, with a tiny upward slide.
      Animated.parallel([
        Animated.timing(placeholderFade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(gptFade, { toValue: 1, duration: 350, useNativeDriver: true, delay: 80 }),
        Animated.timing(translateY, { toValue: 0, duration: 350, useNativeDriver: true, delay: 80 }),
      ]).start();
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError" || signal.aborted) return;
      console.warn('[CoachingCard] fetch failed:', e);
      setError(true);
    }
  }, [placeholderFade, gptFade, translateY]);

  // Reset + fetch on every attemptId change.
  useEffect(() => {
    setGptComment(null);
    setError(false);
    setHidden(false);
    placeholderFade.setValue(1);
    gptFade.setValue(0);
    translateY.setValue(6);
    fetchCoach();
    return () => controllerRef.current?.abort();
  }, [attemptId, fetchCoach, placeholderFade, gptFade, translateY]);

  if (hidden) return null;

  const shadow = bandShadow(score);

  return (
    <View style={[styles.card, { shadowColor: shadow }]}>
      <View style={styles.header}>
        <Image source={rudyBadge} style={styles.avatar} resizeMode="cover" />
        <Text style={styles.headerText} numberOfLines={1}>{labels.header}</Text>
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{labels.failed}</Text>
          <Pressable
            onPress={() => { void fetchCoach(); }}
            style={({ pressed }) => [styles.retryChip, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel={labels.retry}
          >
            <Ionicons name="refresh" size={13} color={C.gold} />
            <Text style={styles.retryChipText}>{labels.retry}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.commentWrap}>
          {/* Placeholder text — visible immediately, fades out when GPT
              version arrives so the user always reads something. */}
          <Animated.Text style={[styles.comment, styles.commentLayer, { opacity: placeholderFade }]} accessibilityRole="text">
            {placeholder}
          </Animated.Text>
          {/* GPT text — fades in over the placeholder. */}
          {gptComment ? (
            <Animated.Text
              style={[styles.comment, styles.commentLayer, { opacity: gptFade, transform: [{ translateY }] }]}
              accessibilityRole="text"
            >
              {gptComment}
            </Animated.Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: C.bg2,
    borderRadius: 14,
    // Enigma hairline — matches PhonemeCoaching / streakCard / NPC cards.
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    // Shadow is tinted to the score band — visual link to the score circle
    // without resorting to a Material-style left bar.
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.32, shadowRadius: 10 },
      android: { elevation: 3 },
      web: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.32, shadowRadius: 10 },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.bg3,
  },
  headerText: {
    fontFamily: F.header,
    fontSize: 13,
    color: C.gold,
    letterSpacing: 0.5,
    flex: 1,
  },
  commentWrap: {
    // Layered animated text — both children absolute-stack so the cross-fade
    // doesn't shift the card height.
    minHeight: 42,
    position: "relative",
  },
  commentLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  comment: {
    fontFamily: F.body,
    fontSize: 14.5,
    color: C.parchment,
    lineHeight: 22,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontFamily: F.body,
    fontSize: 13,
    color: C.goldDim,
    fontStyle: "italic",
  },
  // Hairline outlined retry chip — matches the canonical speak.tsx retryChip
  // so the user sees the same shape they already know.
  retryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  retryChipText: {
    fontFamily: F.bodySemi,
    fontSize: 12,
    color: C.gold,
  },
});
