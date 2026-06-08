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
import { Audio } from "expo-av";
import { C, F } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { registerGlobalSound, registerGlobalWebAudio } from "@/lib/ttsManager";
import { getReadable } from "@/components/rudy/PhonemeCoaching";

const rudyBadge = require("@/assets/rudy_badge.png");

type NativeLang = "korean" | "english" | "spanish" | "indonesian";

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
  /** Learning/target language ("english" | "korean" | "spanish" |
   *  "indonesian" | "arabic"). Used purely for display — to convert raw Azure
   *  IPA tokens into a learner-readable label via getReadable(). NOT sent in
   *  the coach request payload. */
  targetLang: string;
}

// Convert a raw Azure IPA token into a learner-readable label for the given
// target language (e.g. Arabic /sˤ/ → "ص (ṣ)", English /θ/ → "th"). Falls back
// to the bare /symbol/ when the language map has no entry (PRON-02 / L6).
function readablePhoneme(targetLang: string, phoneme: string): string {
  const readable = getReadable(targetLang, phoneme);
  return readable ? readable.display : `/${phoneme}/`;
}

// All copy lives here so each locale string is auditable in one place.
const L = (nl: NativeLang) => ({
  header: nl === "korean" ? "코치 한마디" : nl === "spanish" ? "Consejo del coach" : nl === "indonesian" ? "Tips pelatih" : "Coach tip",
  failed: nl === "korean" ? "루디의 한 마디를 불러오지 못했어요." : nl === "spanish" ? "No se pudo cargar el comentario de Rudy." : nl === "indonesian" ? "Catatan Rudy belum bisa dimuat." : "Couldn't load Rudy's note.",
  retry: nl === "korean" ? "다시 받기" : nl === "spanish" ? "Reintentar" : nl === "indonesian" ? "Coba lagi" : "Try again",
  hearWord: nl === "korean" ? "원어민 발음 듣기" : nl === "spanish" ? "Escuchar palabra" : nl === "indonesian" ? "Dengar kata" : "Hear it",
  weakLabel: nl === "korean" ? "약한 소리" : nl === "spanish" ? "Sonidos débiles" : nl === "indonesian" ? "Bunyi lemah" : "Weak sounds",
});

// Slow target-word TTS so the learner can re-listen as part of the coaching
// loop. Uses the same /api/pronunciation-tts endpoint as the main listen
// button, just with rate=-30% for a clearer model.
async function playWordSlow(word: string, lang: string) {
  try {
    const url = new URL("/api/pronunciation-tts", getApiUrl());
    url.searchParams.set("text", word);
    url.searchParams.set("lang", lang);
    url.searchParams.set("rate", "-30%");
    if (Platform.OS === "web") {
      const res = await fetch(url.toString());
      if (!res.ok) return;
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
      registerGlobalWebAudio(audio);
      audio.onended = () => URL.revokeObjectURL(objUrl);
      await audio.play();
    } else {
      const { sound } = await Audio.Sound.createAsync({ uri: url.toString() }, { shouldPlay: true });
      registerGlobalSound(sound);
    }
  } catch (e) { console.warn('[CoachingCard] playWordSlow failed:', e); }
}

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
function fallbackText(word: string, score: number, nl: NativeLang, weak: string[], targetLang: string): string {
  const band = score >= 90 ? "great" : score >= 75 ? "good" : score >= 50 ? "fair" : "weak";
  // Convert raw IPA tokens to learner-readable labels before embedding in
  // native prose (PRON-03) — otherwise e.g. Korean reads "(특히 ʕ, sˤ 소리.)".
  const readableWeak = weak.map((p) => readablePhoneme(targetLang, p)).join(", ");
  const wKo = weak.length > 0 ? ` (특히 ${readableWeak} 소리.)` : "";
  const wEn = weak.length > 0 ? ` Watch out for: ${readableWeak}.` : "";
  const wEs = weak.length > 0 ? ` Atento a: ${readableWeak}.` : "";
  const wId = weak.length > 0 ? ` Perhatikan: ${readableWeak}.` : "";
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
  if (nl === "indonesian") {
    if (band === "great") return `"${word}" terdengar natural! 🎉`;
    if (band === "good") return `"${word}" sudah hampir tepat — dengarkan sekali lagi dan coba ulangi.${wId}`;
    if (band === "fair") return `Untuk "${word}", perlambat tiap suku kata.${wId}`;
    return `Mulai dengan mendengarkan "${word}" lewat tombol speaker. 🦊`;
  }
  if (band === "great") return `Your "${word}" sounded natural! 🎉`;
  if (band === "good") return `"${word}" was close — listen once more and give it another shot.${wEn}`;
  if (band === "fair") return `For "${word}", slow down each syllable.${wEn}`;
  return `Start by listening to "${word}" with the speaker button. 🦊`;
}

export function CoachingCard(props: Props) {
  const { word, lang, nativeLang, score, accuracyScore, fluencyScore, completenessScore, recognizedText, weakPhonemes, attemptId, targetLang } = props;
  // Two layers of text: the deterministic placeholder painted immediately,
  // and the GPT version that cross-fades in when it arrives.
  const placeholder = React.useMemo(
    () => fallbackText(word, score, nativeLang, weakPhonemes ?? [], targetLang),
    [word, score, nativeLang, weakPhonemes, targetLang],
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
      const data = await res.json() as { ko?: string; en?: string; es?: string; id?: string };
      if (signal.aborted) return;
      const nl = requestRef.current.nativeLang;
      const text = nl === "korean" ? data.ko : nl === "spanish" ? data.es : nl === "indonesian" ? data.id : data.en;
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
        <>
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

          {/* Action row — gives the user something to DO with the coaching
              instead of a dead-end read. "Hear it" replays the target word
              at -30% rate, and weak-phoneme pills surface the trouble
              sounds so the user knows what to focus on. */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => { void playWordSlow(word, lang); }}
              style={({ pressed }) => [styles.hearChip, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel={labels.hearWord}
            >
              <Ionicons name="volume-medium-outline" size={14} color={C.gold} />
              <Text style={styles.hearChipText} numberOfLines={1}>{labels.hearWord}</Text>
            </Pressable>

            {weakPhonemes && weakPhonemes.length > 0 ? (
              <View style={styles.pillRow} accessibilityLabel={labels.weakLabel}>
                {weakPhonemes.slice(0, 3).map((p, i) => (
                  <View key={`${p}-${i}`} style={styles.phonemePill}>
                    <Text style={styles.phonemePillText} numberOfLines={1}>{readablePhoneme(targetLang, p)}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </>
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
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  hearChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hearChipText: {
    fontFamily: F.bodySemi,
    fontSize: 12,
    color: C.gold,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
    justifyContent: "flex-end",
  },
  phonemePill: {
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.error,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  phonemePillText: {
    fontFamily: F.bodySemi,
    fontSize: 12,
    color: C.error,
  },
});
