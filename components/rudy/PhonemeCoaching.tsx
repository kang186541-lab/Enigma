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

async function playWordTTS(word: string, lang: string) {
  try {
    const apiBase = getApiUrl();
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
  } catch (e) { console.warn('[PhonemeCoaching] word TTS failed:', e); }
}

function L(nl: string, ko: string, es: string, en: string): string {
  return nl === "korean" ? ko : nl === "spanish" ? es : en;
}

// ── IPA → Readable mapping ───────────────────────────────────────────────────

type ReadableEntry = { display: string; example: string };
type ReadableMap = Record<string, ReadableEntry>;

const IPA_READABLE_BY_LANG: Record<string, ReadableMap> = {
  english: {
    θ: { display: "th", example: "think" },
    ð: { display: "th", example: "this" },
    ʃ: { display: "sh", example: "ship" },
    ʒ: { display: "zh", example: "measure" },
    tʃ: { display: "ch", example: "church" },
    dʒ: { display: "j", example: "judge" },
    ŋ: { display: "ng", example: "sing" },
    æ: { display: "a", example: "cat" },
    ɑ: { display: "ah", example: "father" },
    ɔ: { display: "aw", example: "law" },
    ə: { display: "uh", example: "about" },
    ɛ: { display: "eh", example: "bed" },
    ɪ: { display: "ih", example: "sit" },
    ʊ: { display: "oo", example: "book" },
    ʌ: { display: "uh", example: "cup" },
    r: { display: "r", example: "red" },
    l: { display: "l", example: "let" },
    v: { display: "v", example: "very" },
    f: { display: "f", example: "fun" },
    z: { display: "z", example: "zoo" },
    w: { display: "w", example: "way" },
    j: { display: "y", example: "yes" },
    h: { display: "h", example: "hat" },
    p: { display: "p", example: "pen" },
    b: { display: "b", example: "bed" },
    t: { display: "t", example: "top" },
    d: { display: "d", example: "dog" },
    k: { display: "k", example: "key" },
    g: { display: "g", example: "go" },
    n: { display: "n", example: "no" },
    m: { display: "m", example: "man" },
    s: { display: "s", example: "sun" },
    iː: { display: "ee", example: "see" },
    uː: { display: "oo", example: "food" },
    ɜː: { display: "er", example: "bird" },
    oʊ: { display: "oh", example: "go" },
    eɪ: { display: "ay", example: "take" },
    aɪ: { display: "ai", example: "time" },
    aʊ: { display: "ow", example: "house" },
    ɔɪ: { display: "oy", example: "boy" },
  },
  spanish: {
    rr: { display: "rr", example: "perro" },
    r: { display: "r", example: "pero" },
    ɾ: { display: "r", example: "pero" },
    β: { display: "b/v", example: "saber" },
    ð_es: { display: "d suave", example: "nada" },
    ð: { display: "d suave", example: "nada" },
    ɣ: { display: "g suave", example: "lago" },
    θ_es: { display: "z/c", example: "gracias" },
    θ: { display: "z/c", example: "gracias" },
    ɲ: { display: "ñ", example: "año" },
    ʎ: { display: "ll/y", example: "calle" },
    x: { display: "j", example: "jota" },
    tʃ: { display: "ch", example: "chico" },
    j: { display: "y", example: "yo" },
    w: { display: "w", example: "bueno" },
    ŋ: { display: "n(g)", example: "tango" },
    p: { display: "p", example: "pan" },
    b: { display: "b", example: "bien" },
    t: { display: "t", example: "tu" },
    d: { display: "d", example: "de" },
    k: { display: "k/c", example: "casa" },
    g: { display: "g", example: "gato" },
    n: { display: "n", example: "no" },
    m: { display: "m", example: "mas" },
    s: { display: "s", example: "sol" },
    f: { display: "f", example: "feo" },
    l: { display: "l", example: "luna" },
    a: { display: "a", example: "casa" },
    e: { display: "e", example: "mesa" },
    i: { display: "i", example: "si" },
    o: { display: "o", example: "sol" },
    u: { display: "u", example: "tu" },
  },
  korean: {
    // IPA symbols Azure returns for Korean
    tɕ: { display: "ㅈ", example: "자" },
    tɕʰ: { display: "ㅊ", example: "차" },
    dʑ: { display: "ㅈ", example: "가지" },
    ɕ: { display: "ㅅ(i)", example: "시" },
    "s͈": { display: "ㅆ", example: "싸" },
    "p͈": { display: "ㅃ", example: "빠" },
    "t͈": { display: "ㄸ", example: "따" },
    "k͈": { display: "ㄲ", example: "까" },
    kʰ: { display: "ㅋ", example: "카" },
    tʰ: { display: "ㅌ", example: "타" },
    pʰ: { display: "ㅍ", example: "파" },
    ɾ: { display: "ㄹ", example: "라" },
    ŋ: { display: "ㅇ받침", example: "강" },
    j: { display: "y(ㅑ)", example: "야" },
    w: { display: "w(ㅘ)", example: "와" },
    // Common consonants
    p: { display: "ㅂ", example: "바" },
    b: { display: "ㅂ", example: "바" },
    t: { display: "ㄷ", example: "다" },
    d: { display: "ㄷ", example: "다" },
    k: { display: "ㄱ", example: "가" },
    g: { display: "ㄱ", example: "가" },
    n: { display: "ㄴ", example: "나" },
    m: { display: "ㅁ", example: "마" },
    s: { display: "ㅅ", example: "사" },
    h: { display: "ㅎ", example: "하" },
    l: { display: "ㄹ", example: "을" },
    r: { display: "ㄹ", example: "라" },
    // Hangul jamo (if Azure returns them directly)
    ㄱ: { display: "ㄱ", example: "가" },
    ㅋ: { display: "ㅋ", example: "카" },
    ㄲ: { display: "ㄲ", example: "까" },
    ㄷ: { display: "ㄷ", example: "다" },
    ㅌ: { display: "ㅌ", example: "타" },
    ㄸ: { display: "ㄸ", example: "따" },
    ㅂ: { display: "ㅂ", example: "바" },
    ㅍ: { display: "ㅍ", example: "파" },
    ㅃ: { display: "ㅃ", example: "빠" },
    ㅈ: { display: "ㅈ", example: "자" },
    ㅊ: { display: "ㅊ", example: "차" },
    ㅉ: { display: "ㅉ", example: "짜" },
    ㅅ: { display: "ㅅ", example: "사" },
    ㅆ: { display: "ㅆ", example: "싸" },
    ㅎ: { display: "ㅎ", example: "하" },
    ㄴ: { display: "ㄴ", example: "나" },
    ㅁ: { display: "ㅁ", example: "마" },
    ㄹ: { display: "ㄹ", example: "라" },
    ㅇ: { display: "ㅇ", example: "아" },
    // Vowels
    ㅓ: { display: "ㅓ", example: "어" },
    ㅗ: { display: "ㅗ", example: "오" },
    ㅡ: { display: "ㅡ", example: "으" },
    ㅢ: { display: "ㅢ", example: "의" },
    ㅐ: { display: "ㅐ", example: "개" },
    ㅔ: { display: "ㅔ", example: "게" },
    ㅘ: { display: "ㅘ", example: "와" },
    ㅝ: { display: "ㅝ", example: "워" },
    a: { display: "ㅏ", example: "아" },
    e: { display: "ㅔ", example: "에" },
    i: { display: "ㅣ", example: "이" },
    o: { display: "ㅗ", example: "오" },
    u: { display: "ㅜ", example: "우" },
  },
};

function getReadable(targetLang: string, phoneme: string): ReadableEntry | undefined {
  const langMap = IPA_READABLE_BY_LANG[targetLang.toLowerCase()];
  if (!langMap) return undefined;
  return langMap[phoneme] ?? langMap[phoneme.toLowerCase()];
}

// ── Component ────────────────────────────────────────────────────────────────

export function PhonemeCoaching({ wordScores, nativeLang, targetLang, speechLang, onRetry }: Props) {
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  if (wordScores.length === 0) return null;

  const weakWords = wordScores.filter((w) => w.score < 70);
  const hasWeak = weakWords.length > 0;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.headerRow}>
        <Ionicons name="analytics-outline" size={16} color={C.gold} />
        <Text style={s.headerText}>
          {L(nativeLang, "발음 피드백", "Retroalimentación", "Pronunciation Feedback")}
        </Text>
      </View>

      {/* Word-level breakdown */}
      {wordScores.map((w, i) => {
        const isWeak = w.score < 70;
        const isExpanded = expandedWord === `${w.word}-${i}`;
        // Get up to 3 weakest phonemes (below 70) sorted by score ascending
        const weakPhonemes = (w.phonemes ?? [])
          .filter(p => p.score < 70 && p.phoneme && p.phoneme.trim() !== "")
          .sort((a, b) => a.score - b.score)
          .slice(0, 3);
        const lowestPhoneme = weakPhonemes.length > 0 ? weakPhonemes[0] : null;

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
              {isWeak ? (
                <View style={s.expandHint}>
                  <Text style={s.expandHintText}>
                    {isExpanded
                      ? L(nativeLang, "접기", "Cerrar", "Close")
                      : L(nativeLang, "코칭 보기", "Ver consejo", "View tips")}
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={12}
                    color="#e5a940"
                  />
                </View>
              ) : (
                <Ionicons name="volume-medium-outline" size={14} color={C.goldDim} />
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
                  <View style={s.phonemeSection}>
                    <Text style={s.phonemeSectionTitle}>
                      {L(nativeLang, "음소별 점수", "Puntuación por fonema", "Phoneme Scores")}
                    </Text>
                    <View style={s.phonemeList}>
                      {w.phonemes.filter(p => p.phoneme && p.phoneme.trim() !== "").map((p, pi) => {
                        const isLowest = lowestPhoneme?.phoneme === p.phoneme && p.score < 70;
                        return (
                          <View key={pi} style={[s.phonemeRow, isLowest && s.phonemeRowHighlight]}>
                            <Text style={[s.phonemeLabel, isLowest && s.phonemeLabelWeak]}>
                              {getReadable(targetLang, p.phoneme)
                                ? getReadable(targetLang, p.phoneme)!.display
                                : `/${p.phoneme}/`}
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
                            {isLowest && (
                              <Text style={s.lowestTag}>
                                {L(nativeLang, "집중!", "¡Foco!", "Focus!")}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Coaching tips for up to 3 weakest phonemes */}
                {weakPhonemes.length > 0 && weakPhonemes.map((wp, wpi) => {
                  const tip = getCoachingTip(targetLang, wp.phoneme, nativeLang);
                  if (!tip) return null;
                  const readable = getReadable(targetLang, wp.phoneme);
                  return (
                    <View key={wpi} style={s.coachingBox}>
                      <View style={s.coachingHeader}>
                        <Text style={s.coachingIcon}>{wpi === 0 ? "💡" : "📌"}</Text>
                        <Text style={s.coachingTitle}>
                          {L(nativeLang, "발음 코칭", "Consejo", "Coaching Tip")}
                        </Text>
                        <Text style={s.coachingPhoneme}>
                          {readable ? `"${readable.display}" (${readable.example})` : `/${wp.phoneme}/`}
                        </Text>
                        <Text style={[s.phonemeScore, s.phonemeScoreWeak]}>{wp.score}%</Text>
                      </View>
                      <Text style={s.coachingText}>{tip}</Text>
                    </View>
                  );
                })}

                {/* Slow TTS button */}
                <Pressable
                  style={({ pressed }) => [s.slowTtsBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => playWordTTS(w.word, speechLang)}
                >
                  <Ionicons name="volume-low" size={16} color={C.gold} />
                  <Text style={s.slowTtsText}>
                    {L(nativeLang, "느리게 듣기", "Escuchar lento", "Listen slow")}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}

      {/* Retry button for weak words */}
      {hasWeak && onRetry && (
        <Pressable
          style={({ pressed }) => [s.retryBtn, pressed && { opacity: 0.8 }]}
          onPress={onRetry}
        >
          <Ionicons name="refresh" size={14} color="#e5a940" />
          <Text style={s.retryText}>
            {L(nativeLang, "다시 도전하기", "Intentar de nuevo", "Try again")}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { width: "100%", gap: 4, marginTop: 8 },

  // Header
  headerRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginBottom: 2, paddingBottom: 4,
    borderBottomWidth: 1, borderBottomColor: "rgba(201,162,39,0.12)",
  },
  headerText: { fontSize: 13, fontFamily: F.header, color: C.gold },

  // Word row
  wordRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8,
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

  // Expand hint (replaces bare chevron)
  expandHint: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(229,169,64,0.12)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  expandHintText: { fontSize: 11, fontFamily: F.bodySemi, color: "#e5a940" },

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

  // Phoneme section
  phonemeSection: { gap: 6 },
  phonemeSectionTitle: { fontSize: 11, fontFamily: F.label, color: C.goldDim, letterSpacing: 0.3 },

  // Phoneme bars
  phonemeList: { gap: 6 },
  phonemeRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 2 },
  phonemeRowHighlight: {
    backgroundColor: "rgba(229,169,64,0.08)",
    borderRadius: 6, paddingHorizontal: 4,
    marginHorizontal: -4,
  },
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
  lowestTag: {
    fontSize: 10, fontFamily: F.bodySemi, color: "#e5a940",
    backgroundColor: "rgba(229,169,64,0.15)",
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
    overflow: "hidden",
  },

  // Coaching box
  coachingBox: {
    backgroundColor: "rgba(201,162,39,0.1)",
    borderRadius: 10, padding: 12, gap: 6,
    borderWidth: 1, borderColor: "rgba(201,162,39,0.2)",
  },
  coachingHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  coachingIcon: { fontSize: 16 },
  coachingTitle: { fontSize: 12, fontFamily: F.header, color: C.gold },
  coachingPhoneme: { fontSize: 13, fontFamily: F.bodySemi, color: C.goldDim },
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
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  retryText: { fontSize: 13, fontFamily: F.bodySemi, color: "#e5a940" },
});
