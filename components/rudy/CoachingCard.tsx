// Coaching card — wraps Azure's numeric score with a short GPT-4o-mini
// generated comment in the learner's native language. Sits BELOW the score
// circle on the Speak tab.
//
// The card paints a skeleton state while the /api/pronunciation-coach round
// trip is in flight (typically 600-1500ms), then fades the actual text in.
// Failing silently is fine — if the network drops or the endpoint errors,
// we just hide the card. The user still sees the score + deterministic
// feedback from /api/pronunciation-assess.

import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

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

const L = (nl: NativeLang) => ({
  thinking: nl === "korean" ? "루디가 한 마디 준비 중..." : nl === "spanish" ? "Rudy está pensando..." : "Rudy is thinking...",
  failed: nl === "korean" ? "코칭 코멘트를 불러올 수 없어요." : nl === "spanish" ? "No se pudo cargar el comentario." : "Couldn't load coaching note.",
  retry: nl === "korean" ? "다시 시도" : nl === "spanish" ? "Reintentar" : "Retry",
  header: nl === "korean" ? "루디의 한 마디" : nl === "spanish" ? "Comentario de Rudy" : "Rudy's note",
});

// Color of the left border bar by score band — visual link to the score
// circle's color so the card "belongs" to the score above it.
function bandColor(score: number): string {
  if (score >= 90) return "#10B981";  // green
  if (score >= 75) return "#34A853";  // light green
  if (score >= 50) return "#F59E0B";  // amber
  return "#EF4444";                   // red
}

export function CoachingCard(props: Props) {
  const { word, lang, nativeLang, score, accuracyScore, fluencyScore, completenessScore, recognizedText, weakPhonemes, attemptId } = props;
  const [comment, setComment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Endpoint missing (404) — happens during rollouts when the web build has
  // shipped but the server hasn't redeployed yet. Hide the card silently so
  // the rest of the screen stays clean.
  const [hidden, setHidden] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const skeletonAnim = useRef(new Animated.Value(0.6)).current;
  const labels = L(nativeLang);

  // Skeleton shimmer
  useEffect(() => {
    if (!loading) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(skeletonAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [loading, skeletonAnim]);

  const fetchCoach = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    setHidden(false);
    setComment(null);
    fadeAnim.setValue(0);
    try {
      const url = new URL("/api/pronunciation-coach", getApiUrl()).toString();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word, lang, nativeLang, score,
          accuracyScore, fluencyScore, completenessScore,
          recognizedText, weakPhonemes,
        } as CoachRequest),
      });
      if (res.status === 404) {
        // Server hasn't shipped the endpoint yet (rollout window). Hide.
        setHidden(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { ko?: string; en?: string; es?: string };
      const text = nativeLang === "korean" ? data.ko : nativeLang === "spanish" ? data.es : data.en;
      if (!text) throw new Error("Empty coach payload");
      setComment(text);
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    } catch (e) {
      console.warn('[CoachingCard] fetch failed:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [word, lang, nativeLang, score, accuracyScore, fluencyScore, completenessScore, recognizedText, weakPhonemes, fadeAnim]);

  useEffect(() => {
    fetchCoach();
  }, [attemptId, fetchCoach]);

  if (hidden) return null;

  const borderColor = bandColor(score);

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>🦊</Text></View>
        <Text style={styles.headerText} numberOfLines={1}>{labels.header}</Text>
      </View>

      {loading ? (
        <View style={styles.skeleton}>
          <Animated.View style={[styles.skeletonLine, { opacity: skeletonAnim, width: "92%" }]} />
          <Animated.View style={[styles.skeletonLine, { opacity: skeletonAnim, width: "70%", marginTop: 8 }]} />
          <Text style={styles.thinking}>{labels.thinking}</Text>
        </View>
      ) : error ? (
        <Pressable onPress={fetchCoach} style={({ pressed }) => [styles.errorRow, { opacity: pressed ? 0.6 : 1 }]} accessibilityRole="button">
          <Text style={styles.errorText}>{labels.failed}</Text>
          <View style={styles.retryBtn}>
            <Ionicons name="refresh" size={14} color={C.bg1} />
            <Text style={styles.retryBtnText}>{labels.retry}</Text>
          </View>
        </Pressable>
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.comment} accessibilityRole="text">{comment}</Text>
        </Animated.View>
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
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14 },
  headerText: {
    fontFamily: F.bodySemi,
    fontSize: 12.5,
    color: C.goldDim,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flex: 1,
  },
  comment: {
    fontFamily: F.body,
    fontSize: 14.5,
    color: C.parchment,
    lineHeight: 21,
  },
  skeleton: {
    paddingVertical: 2,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: C.bg3,
    borderRadius: 6,
  },
  thinking: {
    marginTop: 10,
    fontFamily: F.body,
    fontSize: 12,
    color: C.goldDim,
    fontStyle: "italic",
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
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.gold,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryBtnText: {
    fontFamily: F.bodySemi,
    fontSize: 12,
    color: C.bg1,
  },
});
