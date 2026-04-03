import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getCoachingTip, getErrorLabel } from "@/data/phonemeCoaching";
import { registerGlobalSound, registerGlobalWebAudio } from "@/lib/ttsManager";

// ── Types ────────────────────────────────────────────────────────────────────

type WordScore = {
  word: string;
  score: number;
  errorType: string;
  phonemes?: { phoneme: string; score: number }[];
};

interface Props {
  wordScores: WordScore[];
  nativeLang: string;       // "korean" | "spanish" | "english"
  targetLang: string;       // "korean" | "spanish" | "english"
  speechLang: string;       // "ko-KR" | "es-ES" | "en-US" etc.
  onRetry?: () => void;     // retry recording callback
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const apiBase = getApiUrl();

async function playWordTTS(word: string, lang: string) {
  try {
    const url = new URL("/api/pronunciation-tts", apiBase);
    url.searchParams.set("text", word);
    url.searchParams.set("lang", lang);
    url.searchParams.set("rate", "-20%"); // slow for coaching

    if (Platform.OS === "web") {
      const res = await fetch(url.toString());
      if (!res.ok) return;
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
      registerGlobalWebAudio(audio);
      await audio.play();
    } else {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url.toString() },
        { shouldPlay: true },
      );
      registerGlobalSound(sound);
    }
  } catch { /* ignore */ }
}

// ── Component ────────────────────────────────────────────────────────────────

export function PhonemeCoaching({ wordScores, nativeLang, targetLang, speechLang, onRetry }: Props) {
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  if (wordScores.length === 0) return null;

  const weakWords = wordScores.filter((w) => w.score < 70);

  const retryLabel = nativeLang === "korean"
    ? "다시 해볼까? 🔄"
    : nativeLang === "spanish"
      ? "¿Intentar de nuevo? 🔄"
      : "Try again? 🔄";

  const listenSlowLabel = nativeLang === "korean"
    ? "느리게 듣기"
    : nativeLang === "spanish"
      ? "Escuchar lento"
      : "Listen slow";

  return (
    <View style={s.container}>
      {/* Word-level breakdown */}
      {wordScores.map((w, i) => {
        const isWeak = w.score < 70;
        const isExpanded = expandedWord === `${w.word}-${i}`;
        const lowestPhoneme = w.phonemes?.length
          ? w.phonemes.reduce((a, b) => (a.score < b.score ? a : b))
          : null;

        return (
          <View key={i}>
            <Pressable
              style={[s.wordRow, isWeak && s.wordRowWeak]}
              onPress={() => {
                if (isWeak) {
                  setExpandedWord(isExpanded ? null : `${w.word}-${i}`);
                }
                playWordTTS(w.word, speechLang);
              }}
            >
              <Text style={s.wordIcon}>{w.score >= 70 ? "✅" : "⚠️"}</Text>
              <Text style={[s.wordText, isWeak && s.wordTextWeak]}>{w.word}</Text>
              <Text style={[s.wordScore, isWeak && s.wordScoreWeak]}>{w.score}%</Text>
              {isWeak && (
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#e5a940"
                />
              )}
            </Pressable>

            {/* Phoneme breakdown for weak words */}
            {isExpanded && isWeak && (
              <View style={s.phonemePanel}>
                {/* Error type */}
                {w.errorType && w.errorType !== "None" && (
                  <View style={s.errorBadge}>
                    <Text style={s.errorBadgeText}>
                      {getErrorLabel(w.errorType, nativeLang)}
                    </Text>
                  </View>
                )}

                {/* Phoneme bars */}
                {w.phonemes && w.phonemes.length > 0 && (
                  <View style={s.phonemeList}>
                    {w.phonemes.map((p, pi) => {
                      const isLowest = lowestPhoneme?.phoneme === p.phoneme && p.score < 70;
                      return (
                        <View key={pi} style={s.phonemeRow}>
                          <Text style={[s.phonemeLabel, isLowest && s.phonemeLabelWeak]}>
                            /{p.phoneme}/
                          </Text>
                          <View style={s.phonemeBarBg}>
                            <View
                              style={[
                                s.phonemeBarFill,
                                { width: `${Math.max(p.score, 5)}%` },
                                p.score >= 70 ? s.phonemeBarGood : s.phonemeBarBad,
                              ]}
                            />
                          </View>
                          <Text style={[s.phonemeScore, isLowest && s.phonemeScoreWeak]}>
                            {p.score}%
                          </Text>
                          {isLowest && <Text style={s.lowestTag}>←</Text>}
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Coaching tip for lowest phoneme */}
                {lowestPhoneme && lowestPhoneme.score < 70 && (() => {
                  const tip = getCoachingTip(targetLang, lowestPhoneme.phoneme, nativeLang);
                  if (!tip) return null;
                  return (
                    <View style={s.coachingBox}>
                      <View style={s.coachingHeader}>
                        <Text style={s.coachingIcon}>🗣️</Text>
                        <Text style={s.coachingPhoneme}>/{lowestPhoneme.phoneme}/</Text>
                      </View>
                      <Text style={s.coachingText}>{tip}</Text>
                    </View>
                  );
                })()}

                {/* Slow TTS button */}
                <Pressable
                  style={({ pressed }) => [s.slowTtsBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => playWordTTS(w.word, speechLang)}
                >
                  <Ionicons name="volume-low" size={16} color={C.gold} />
                  <Text style={s.slowTtsText}>{listenSlowLabel}</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}

      {/* Retry button for weak words */}
      {weakWords.length > 0 && onRetry && (
        <Pressable
          style={({ pressed }) => [s.retryBtn, pressed && { opacity: 0.8 }]}
          onPress={onRetry}
        >
          <Text style={s.retryText}>{retryLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { width: "100%", gap: 4, marginTop: 4 },

  // Word row
  wordRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
    backgroundColor: "rgba(201,162,39,0.06)",
  },
  wordRowWeak: {
    backgroundColor: "rgba(229,169,64,0.1)",
    borderWidth: 1, borderColor: "rgba(229,169,64,0.2)",
  },
  wordIcon: { fontSize: 14, width: 22 },
  wordText: { fontSize: 14, fontFamily: F.bodySemi, color: C.parchment, flex: 1 },
  wordTextWeak: { color: "#e5a940" },
  wordScore: { fontSize: 13, fontFamily: F.label, color: C.goldDim, minWidth: 36, textAlign: "right" },
  wordScoreWeak: { color: "#e5a940", fontFamily: F.bodySemi },

  // Phoneme panel (expanded)
  phonemePanel: {
    marginLeft: 30, marginTop: 2, marginBottom: 6,
    backgroundColor: "rgba(201,162,39,0.05)",
    borderRadius: 10, padding: 12, gap: 10,
    borderWidth: 1, borderColor: "rgba(201,162,39,0.12)",
  },

  // Error badge
  errorBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(200,70,70,0.15)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  errorBadgeText: { fontSize: 11, fontFamily: F.bodySemi, color: "#e88" },

  // Phoneme bars
  phonemeList: { gap: 6 },
  phonemeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  phonemeLabel: {
    fontSize: 13, fontFamily: F.bodySemi, color: C.parchment,
    width: 40, textAlign: "center",
  },
  phonemeLabelWeak: { color: "#e5a940" },
  phonemeBarBg: {
    flex: 1, height: 8, borderRadius: 4,
    backgroundColor: "rgba(201,162,39,0.12)",
    overflow: "hidden",
  },
  phonemeBarFill: { height: 8, borderRadius: 4 },
  phonemeBarGood: { backgroundColor: "rgba(90,170,130,0.8)" },
  phonemeBarBad: { backgroundColor: "rgba(229,169,64,0.8)" },
  phonemeScore: { fontSize: 11, fontFamily: F.label, color: C.goldDim, width: 32, textAlign: "right" },
  phonemeScoreWeak: { color: "#e5a940", fontFamily: F.bodySemi },
  lowestTag: { fontSize: 11, color: "#e5a940" },

  // Coaching box
  coachingBox: {
    backgroundColor: "rgba(201,162,39,0.1)",
    borderRadius: 10, padding: 10, gap: 6,
    borderWidth: 1, borderColor: "rgba(201,162,39,0.2)",
  },
  coachingHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  coachingIcon: { fontSize: 18 },
  coachingPhoneme: { fontSize: 14, fontFamily: F.header, color: C.gold },
  coachingText: { fontSize: 13, fontFamily: F.body, color: C.parchment, lineHeight: 20 },

  // Slow TTS button
  slowTtsBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: C.border,
    backgroundColor: "rgba(201,162,39,0.06)",
  },
  slowTtsText: { fontSize: 12, fontFamily: F.bodySemi, color: C.gold },

  // Retry button
  retryBtn: {
    marginTop: 6, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: "rgba(229,169,64,0.4)",
    backgroundColor: "rgba(229,169,64,0.08)",
    alignItems: "center",
  },
  retryText: { fontSize: 13, fontFamily: F.bodySemi, color: "#e5a940" },
});
