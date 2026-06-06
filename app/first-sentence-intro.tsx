import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { EmojiText } from "@/components/EmojiText";
import { BidiTargetText } from "@/components/BidiTargetText";
import { useLanguage, type NativeLanguage } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { apiFetchWithAuth } from "@/lib/apiFetchWithAuth";
import {
  getDailySpeakingMissionPhrase,
  type DailySpeakingLanguage,
  type DailySpeakingPhrase,
} from "@/lib/dailySpeakingMissions";
import type { LearningGoal } from "@/lib/learnerProfile";

// ── TTS (mirrors the Speak screen's pronunciation playback path) ──────────────
// Single shared lib endpoint /api/pronunciation-tts. We keep a tiny local
// player here (the micro screen is short-lived) instead of importing the Speak
// module, but use the EXACT same URL + apiFetchWithAuth bearer path.
let _ttsWebAudio: HTMLAudioElement | null = null;
let _ttsNativeSound: Audio.Sound | null = null;
const _ttsWebObjectUrlCache = new Map<string, Promise<string>>();

function tryGetApiBase(): string | null {
  try {
    return getApiUrl();
  } catch (error) {
    if (__DEV__) console.warn("[FirstSentence] api url skipped:", error);
    return null;
  }
}

function buildTtsUrl(text: string, lang: string, apiBase: string): string {
  const url = new URL("/api/pronunciation-tts", apiBase);
  url.searchParams.set("text", text);
  url.searchParams.set("lang", lang);
  return url.toString();
}

async function getWebTtsObjectUrl(urlStr: string): Promise<string> {
  let cached = _ttsWebObjectUrlCache.get(urlStr);
  if (!cached) {
    cached = apiFetchWithAuth(urlStr)
      .then((res) => {
        if (!res.ok) throw new Error(`TTS ${res.status}`);
        return res.blob();
      })
      .then((blob) => URL.createObjectURL(blob));
    _ttsWebObjectUrlCache.set(urlStr, cached);
  }
  return cached;
}

function primeTTS(text: string, lang: string, apiBase: string) {
  if (Platform.OS !== "web") return;
  void getWebTtsObjectUrl(buildTtsUrl(text, lang, apiBase)).catch((error) => {
    if (__DEV__) console.warn("[FirstSentence] TTS preload skipped:", error);
  });
}

async function playTTS(text: string, lang: string, apiBase: string) {
  try {
    const urlStr = buildTtsUrl(text, lang, apiBase);

    if (Platform.OS === "web") {
      if (_ttsWebAudio) {
        _ttsWebAudio.pause();
        _ttsWebAudio.src = "";
        _ttsWebAudio = null;
      }
      const objectUrl = await getWebTtsObjectUrl(urlStr);
      const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
      audio.preload = "auto";
      _ttsWebAudio = audio;
      audio.onended = () => { _ttsWebAudio = null; };
      audio.onerror = () => { _ttsWebAudio = null; };
      audio.currentTime = 0;
      await audio.play();
    } else {
      if (_ttsNativeSound) {
        await _ttsNativeSound.stopAsync().catch(() => {});
        await _ttsNativeSound.unloadAsync().catch(() => {});
        _ttsNativeSound = null;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri: urlStr }, { shouldPlay: true, volume: 1.0 });
      _ttsNativeSound = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) { _ttsNativeSound = null; }
      });
    }
  } catch (e) {
    console.warn("[FirstSentence] TTS play failed:", e);
  }
}

// ── Romanization (Step 2 only, tap-to-reveal) ─────────────────────────────────
// The linguists' rule: romanization appears ONLY on Step 2, ONLY on tap, and is
// derived locally — never shown on Step 1 and never passed onward. We map common
// IPA symbols to a readable latin approximation. Unmapped symbols fall back to
// the raw IPA syllable so we never invent a wrong reading.
const IPA_MAP: Array<[string, string]> = [
  // multi-char clusters first (longest match wins)
  ["t͡ɕ", "j"], ["d͡ʑ", "j"], ["t͡ʃ", "ch"], ["d͡ʒ", "j"],
  ["dʑ", "j"], ["tɕʰ", "ch"], ["tɕ", "j"], ["tʃ", "ch"], ["dʒ", "j"],
  ["ɲ", "ny"], ["ŋ", "ng"], ["ʃ", "sh"], ["ʒ", "zh"], ["ɕ", "sh"], ["ʑ", "j"],
  ["θ", "th"], ["ð", "th"], ["ɾ", "r"], ["ʁ", "r"], ["ɻ", "r"],
  ["ʌ", "eo"], ["ɛ", "e"], ["ɔ", "o"], ["ø", "oe"], ["œ", "oe"],
  ["ɯ", "eu"], ["ɨ", "eu"], ["ə", "eo"], ["ɐ", "a"], ["ɑ", "a"], ["æ", "a"],
  ["ʊ", "u"], ["ɪ", "i"], ["y", "yu"], ["ɸ", "f"], ["β", "b"], ["ɣ", "g"],
  ["ʝ", "y"], ["ʔ", ""], ["ʰ", ""], ["ˈ", ""], ["ˌ", ""], ["ː", ""],
  ["w", "w"], ["j", "y"],
];

function ipaToRoman(ipaSyllable: string): string {
  let out = ipaSyllable.trim();
  if (!out) return "";
  for (const [from, to] of IPA_MAP) {
    out = out.split(from).join(to);
  }
  // Drop any IPA combining marks that slipped through.
  out = out.replace(/[̀-ͯʰ-˿]/g, "");
  return out || ipaSyllable.trim();
}

// Split the IPA (without surrounding slashes) into syllables on the dot, then
// match the target phrase into the same number of grapheme chunks. For Korean
// each Hangul block is one char. If counts mismatch, fall back to splitting the
// phrase by whitespace (words), then by character, so chunks always render.
type Chunk = { text: string; roman: string };

function splitGraphemes(phrase: string): string[] {
  return Array.from(phrase);
}

function buildChunks(phrase: string, ipa: string): Chunk[] {
  const cleanedIpa = ipa.replace(/^\/+|\/+$/g, "").trim();
  const ipaSyllables = cleanedIpa
    .split(/[.\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Visible (non-space) graphemes — for matching syllable counts.
  const visibleGraphemes = splitGraphemes(phrase).filter((g) => g.trim().length > 0);

  // Korean / single-character-block scripts: one syllable == one block char.
  if (ipaSyllables.length > 0 && ipaSyllables.length === visibleGraphemes.length) {
    return visibleGraphemes.map((g, i) => ({ text: g, roman: ipaToRoman(ipaSyllables[i] ?? "") }));
  }

  // Word-based fallback (latin-script phrases): split phrase into words, pair
  // each word with its slice of IPA syllables.
  const words = phrase.split(/\s+/).map((w) => w.trim()).filter(Boolean);
  if (words.length > 1 && ipaSyllables.length >= words.length) {
    const per = Math.floor(ipaSyllables.length / words.length);
    const chunks: Chunk[] = [];
    let cursor = 0;
    for (let i = 0; i < words.length; i += 1) {
      const take = i === words.length - 1 ? ipaSyllables.length - cursor : per;
      const slice = ipaSyllables.slice(cursor, cursor + take);
      cursor += take;
      chunks.push({ text: words[i], roman: slice.map(ipaToRoman).join("") });
    }
    return chunks;
  }

  // Words without reliable IPA pairing: still chunk by word, romanize the whole.
  if (words.length > 1) {
    const wholeRoman = ipaSyllables.map(ipaToRoman).join("");
    return words.map((w, i) => ({ text: w, roman: i === 0 ? wholeRoman : "" }));
  }

  // Last resort: chunk per visible character.
  if (visibleGraphemes.length > 0) {
    return visibleGraphemes.map((g, i) => ({ text: g, roman: ipaToRoman(ipaSyllables[i] ?? "") }));
  }

  return [{ text: phrase, roman: ipaSyllables.map(ipaToRoman).join("") }];
}

// ── Trilingual + Indonesian UI strings ────────────────────────────────────────
type UIStrings = {
  eyebrow: string;
  stepLabel: (n: number) => string;
  step1Title: string;
  step1Rudy: string;
  meaningLabel: string;
  tipLabel: string;
  listen: string;
  listenAgain: string;
  next: string;
  step2Title: string;
  step2Rudy: string;
  showRoman: string;
  hideRoman: string;
  playAll: string;
  step3Title: string;
  step3Rudy: string;
  step3Body: string;
  sayItCta: string;
  alreadyKnow: string;
  back: string;
  loadingFallback: string;
  basicCourseNudge: string;
};

const UI: Record<NativeLanguage, UIStrings> = {
  korean: {
    eyebrow: "오늘의 첫 문장",
    stepLabel: (n) => `단계 ${n}`,
    step1Title: "먼저 뜻을 이해해요",
    step1Rudy: "이제 입 밖으로 낼 문장이에요.",
    meaningLabel: "뜻",
    tipLabel: "Rudy 팁",
    listen: "🔊 들어보기",
    listenAgain: "🔊 다시 듣기",
    next: "다음",
    step2Title: "소리를 조각으로 들어봐요",
    step2Rudy: "한 조각씩 천천히 따라 들어요.",
    showRoman: "▸ 발음 보기",
    hideRoman: "▾ 발음 숨기기",
    playAll: "🔊 전체 듣기",
    step3Title: "이제 말해볼 차례예요",
    step3Rudy: "틀려도 괜찮아요. Rudy는 점수보다 시도를 먼저 기록해요.",
    step3Body: "방금 들은 문장을 입 밖으로 말해보세요. 채점은 다음 화면에서 Rudy가 해줘요.",
    sayItCta: "🎤 말하러 가기",
    alreadyKnow: "이미 읽을 수 있어요 — 바로 말하기",
    back: "뒤로",
    loadingFallback: "첫 문장을 불러오는 중…",
    basicCourseNudge: "전체 알파벳도 배우고 싶어요? (10분)",
  },
  english: {
    eyebrow: "Today's first sentence",
    stepLabel: (n) => `Step ${n}`,
    step1Title: "First, understand it",
    step1Rudy: "This is the sentence you'll say out loud.",
    meaningLabel: "Meaning",
    tipLabel: "Rudy's tip",
    listen: "🔊 Listen",
    listenAgain: "🔊 Listen again",
    next: "Next",
    step2Title: "Hear the pieces",
    step2Rudy: "Take it one small piece at a time.",
    showRoman: "▸ Show pronunciation",
    hideRoman: "▾ Hide pronunciation",
    playAll: "🔊 Play all",
    step3Title: "Now it's your turn to speak",
    step3Rudy: "Mistakes are fine. Rudy counts the attempt before the score.",
    step3Body: "Say the sentence you just heard out loud. Rudy scores it on the next screen.",
    sayItCta: "🎤 Go speak it",
    alreadyKnow: "I can already read this — just speak",
    back: "Back",
    loadingFallback: "Loading your first sentence…",
    basicCourseNudge: "Want to learn the full alphabet too? (10 min)",
  },
  spanish: {
    eyebrow: "Tu primera frase",
    stepLabel: (n) => `Paso ${n}`,
    step1Title: "Primero, entiéndela",
    step1Rudy: "Esta es la frase que dirás en voz alta.",
    meaningLabel: "Significado",
    tipLabel: "Consejo de Rudy",
    listen: "🔊 Escuchar",
    listenAgain: "🔊 Escuchar otra vez",
    next: "Siguiente",
    step2Title: "Escucha las partes",
    step2Rudy: "Ve parte por parte, sin prisa.",
    showRoman: "▸ Ver pronunciación",
    hideRoman: "▾ Ocultar pronunciación",
    playAll: "🔊 Reproducir todo",
    step3Title: "Ahora te toca hablar",
    step3Rudy: "Los errores están bien. Rudy cuenta el intento antes que la nota.",
    step3Body: "Di en voz alta la frase que acabas de escuchar. Rudy la evalúa en la siguiente pantalla.",
    sayItCta: "🎤 Ir a hablar",
    alreadyKnow: "Ya sé leer esto — hablar directamente",
    back: "Atrás",
    loadingFallback: "Cargando tu primera frase…",
    basicCourseNudge: "¿Quieres aprender todo el alfabeto también? (10 min)",
  },
  indonesian: {
    eyebrow: "Kalimat pertamamu",
    stepLabel: (n) => `Langkah ${n}`,
    step1Title: "Pahami dulu artinya",
    step1Rudy: "Ini kalimat yang akan kamu ucapkan dengan lantang.",
    meaningLabel: "Arti",
    tipLabel: "Tips Rudy",
    listen: "🔊 Dengarkan",
    listenAgain: "🔊 Dengar lagi",
    next: "Lanjut",
    step2Title: "Dengar bagian-bagiannya",
    step2Rudy: "Pelan-pelan, satu bagian dulu.",
    showRoman: "▸ Lihat cara baca",
    hideRoman: "▾ Sembunyikan cara baca",
    playAll: "🔊 Putar semua",
    step3Title: "Sekarang giliranmu bicara",
    step3Rudy: "Salah itu wajar. Rudy menghitung usaha dulu, baru nilainya.",
    step3Body: "Ucapkan kalimat yang baru kamu dengar dengan lantang. Rudy menilainya di layar berikutnya.",
    sayItCta: "🎤 Ayo ucapkan",
    alreadyKnow: "Saya sudah bisa membacanya — langsung bicara",
    back: "Kembali",
    loadingFallback: "Memuat kalimat pertamamu…",
    basicCourseNudge: "Mau belajar seluruh alfabet juga? (10 mnt)",
  },
};

function normalizeNative(value: string | undefined): NativeLanguage {
  if (value === "korean" || value === "english" || value === "spanish" || value === "indonesian") return value;
  return "english";
}

function normalizeLearn(value: string | undefined): DailySpeakingLanguage | null {
  if (
    value === "korean" || value === "english" || value === "spanish" ||
    value === "indonesian" || value === "arabic"
  ) return value;
  return null;
}

function normalizeGoal(value: string | undefined): LearningGoal | null {
  if (
    value === "travel" || value === "work" || value === "study" ||
    value === "hobby" || value === "relationship" || value === "exam" || value === "unknown"
  ) return value;
  return null;
}

function asParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function FirstSentenceIntroScreen() {
  const insets = useSafeAreaInsets();
  const { nativeLanguage } = useLanguage();

  const params = useLocalSearchParams<{
    learn?: string | string[];
    goal?: string | string[];
    native?: string | string[];
  }>();

  // Prefer the param the screen receives; fall back to the live profile native.
  const nativeCode = normalizeNative(asParam(params.native) ?? nativeLanguage ?? undefined);
  const learnCode = normalizeLearn(asParam(params.learn));
  const goalCode = normalizeGoal(asParam(params.goal));
  const ui = UI[nativeCode];

  const phrase: DailySpeakingPhrase | null = useMemo(
    () => (learnCode ? getDailySpeakingMissionPhrase(learnCode, goalCode, 0) : null),
    [learnCode, goalCode]
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [playedOnce, setPlayedOnce] = useState(false);
  const [playedChunks, setPlayedChunks] = useState<Set<number>>(new Set());
  const [revealedChunks, setRevealedChunks] = useState<Set<number>>(new Set());
  const [basicNudgeDismissed, setBasicNudgeDismissed] = useState(false);

  // The full-alphabet course (/basic-course) has data for these five learning
  // targets (incl. the Egyptian-Arabic alphabet). normalizeLearn already
  // restricts learnCode to them, so a non-null learnCode is sufficient — but we
  // keep the explicit set so the nudge never points an unfamiliar-script
  // beginner at an empty course.
  const learnHasBasicCourse =
    learnCode === "korean" || learnCode === "english" ||
    learnCode === "spanish" || learnCode === "indonesian" ||
    learnCode === "arabic";

  const chunks = useMemo(
    () => (phrase ? buildChunks(phrase.phrase, phrase.ipa) : []),
    [phrase]
  );
  const allChunksPlayed = chunks.length > 0 && playedChunks.size >= chunks.length;

  const meaning = phrase
    ? (phrase.meanings[nativeCode] ?? phrase.meanings.english ?? phrase.phrase)
    : "";

  const apiBase = tryGetApiBase();
  const phraseText = phrase?.phrase;
  const phraseSpeechLang = phrase?.speechLang;

  React.useEffect(() => {
    if (!phraseText || !phraseSpeechLang || !apiBase) return;
    primeTTS(phraseText, phraseSpeechLang, apiBase);
  }, [phraseText, phraseSpeechLang, apiBase]);

  const handleListen = useCallback(() => {
    if (!phrase) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (apiBase) void playTTS(phrase.phrase, phrase.speechLang, apiBase);
    setPlayedOnce(true);
  }, [phrase, apiBase]);

  const handlePlayChunk = useCallback(
    (index: number) => {
      if (!phrase) return;
      const chunk = chunks[index];
      if (!chunk) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (apiBase) void playTTS(chunk.text, phrase.speechLang, apiBase);
      setPlayedChunks((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    },
    [phrase, chunks, apiBase]
  );

  const handlePlayAll = useCallback(() => {
    if (!phrase) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (apiBase) void playTTS(phrase.phrase, phrase.speechLang, apiBase);
    setPlayedChunks(new Set(chunks.map((_, i) => i)));
  }, [phrase, chunks, apiBase]);

  const toggleReveal = useCallback((index: number) => {
    Haptics.selectionAsync().catch(() => {});
    setRevealedChunks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  // The hand-off into the existing Speak first-mission. Param shape matches the
  // Home CTA / onboarding finishToCourse exactly, plus the frozen missionIndex 0.
  const goToSpeak = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.replace({
      pathname: "/(tabs)/speak",
      params: {
        mission: "first-sentence",
        goal: goalCode ?? "",
        targetLang: learnCode ?? "",
        missionIndex: "0",
      },
    } as any);
  }, [goalCode, learnCode]);

  // Optional detour for unfamiliar-script beginners who want the FULL alphabet
  // course. Subtle, dismissible — the primary path stays "say your first
  // sentence", so this is a quiet underline link, not a CTA.
  const goToBasicCourse = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/basic-course" as any);
  }, []);

  const dismissBasicNudge = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    setBasicNudgeDismissed(true);
  }, []);

  const advance = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  }, []);

  const back = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Math.max((Platform.OS === "web" ? 34 : insets.bottom) + 16, 34);

  // Phrase missing for this language/goal — the onboarding fallback already
  // routes such cohorts to /basic-course, so this is a defensive guard only.
  if (!phrase) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[C.bg1, C.bg2, C.bg1]} style={StyleSheet.absoluteFill} />
        <View style={[styles.fallback, { paddingTop: topPad, paddingBottom: bottomPad }]}>
          <Text style={styles.fallbackText}>{ui.loadingFallback}</Text>
          <Pressable style={styles.cta} onPress={goToSpeak}>
            <EmojiText style={styles.ctaText}>{ui.sayItCta}</EmojiText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[C.bg1, C.bg2, C.bg1]} style={StyleSheet.absoluteFill} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPad, paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Eyebrow + progress dots */}
        <EmojiText style={styles.eyebrow}>🦊 {ui.eyebrow}</EmojiText>
        <View style={styles.progressRow}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={styles.progressItem}>
              <View style={[styles.dot, step === n && styles.dotActive, step > n && styles.dotDone]} />
              <Text style={[styles.stepLabel, step === n && styles.stepLabelActive]}>
                {ui.stepLabel(n)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── STEP 1 — UNDERSTAND ── */}
        {step === 1 && (
          <>
            <View style={styles.rudyLine}>
              <Text style={styles.rudyLineText}>{ui.step1Rudy}</Text>
            </View>

            <View style={styles.heroCard}>
              <LinearGradient
                colors={["rgba(201,162,39,0.16)", "rgba(126,184,201,0.08)"]}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.cardKicker}>{ui.step1Title}</Text>
              <BidiTargetText targetLang={phrase.speechLang} rtlAlign="center" style={styles.phraseBig} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.6}>
                {phrase.phrase}
              </BidiTargetText>

              <View style={styles.meaningBlock}>
                <Text style={styles.fieldLabel}>{ui.meaningLabel}</Text>
                <Text style={styles.meaningText}>{meaning}</Text>
              </View>

              {phrase.tip ? (
                <View style={styles.tipBlock}>
                  <Text style={styles.fieldLabel}>{ui.tipLabel}</Text>
                  <Text style={styles.tipText}>{phrase.tip}</Text>
                </View>
              ) : null}

              <Pressable
                style={({ pressed }) => [styles.listenBtn, pressed && styles.pressed]}
                onPress={handleListen}
                accessibilityRole="button"
                accessibilityLabel={ui.listen}
              >
                <EmojiText style={styles.listenBtnText}>
                  {playedOnce ? ui.listenAgain : ui.listen}
                </EmojiText>
              </Pressable>
            </View>

            <View style={styles.bottom}>
              <Pressable
                style={({ pressed }) => [styles.cta, !playedOnce && styles.ctaDim, pressed && playedOnce && styles.pressed]}
                onPress={advance}
                disabled={!playedOnce}
                accessibilityRole="button"
                accessibilityState={{ disabled: !playedOnce }}
              >
                <Text style={styles.ctaText}>{ui.next}</Text>
                <Ionicons name="arrow-forward" size={20} color={C.bg1} />
              </Pressable>
              <Pressable style={styles.selfExempt} onPress={goToSpeak} accessibilityRole="button">
                <Text style={styles.selfExemptText}>{ui.alreadyKnow}</Text>
              </Pressable>

              {/* Optional full-alphabet detour — dismissible, subtle underline link. */}
              {learnHasBasicCourse && !basicNudgeDismissed ? (
                <View style={styles.basicNudgeRow}>
                  <Pressable
                    style={styles.basicNudgeLink}
                    onPress={goToBasicCourse}
                    accessibilityRole="link"
                    accessibilityLabel={ui.basicCourseNudge}
                  >
                    <Text style={styles.basicNudgeText}>{ui.basicCourseNudge}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.basicNudgeDismiss}
                    onPress={dismissBasicNudge}
                    accessibilityRole="button"
                    accessibilityLabel="✕"
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={14} color={C.goldDark} />
                  </Pressable>
                </View>
              ) : null}
            </View>
          </>
        )}

        {/* ── STEP 2 — HEAR THE PIECES ── */}
        {step === 2 && (
          <>
            <View style={styles.rudyLine}>
              <Text style={styles.rudyLineText}>{ui.step2Rudy}</Text>
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.cardKicker}>{ui.step2Title}</Text>

              <View style={styles.chunkList}>
                {chunks.map((chunk, i) => {
                  const revealed = revealedChunks.has(i);
                  const played = playedChunks.has(i);
                  return (
                    <View key={`${chunk.text}-${i}`} style={[styles.chunkRow, played && styles.chunkRowPlayed]}>
                      <BidiTargetText targetLang={phrase.speechLang} rtlAlign="center" style={styles.chunkText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                        {chunk.text}
                      </BidiTargetText>
                      <View style={styles.chunkActions}>
                        <Pressable
                          style={({ pressed }) => [styles.chunkPlay, pressed && styles.pressed]}
                          onPress={() => handlePlayChunk(i)}
                          accessibilityRole="button"
                          accessibilityLabel={`${ui.listen}: ${chunk.text}`}
                        >
                          <EmojiText style={styles.chunkPlayText}>🔊</EmojiText>
                        </Pressable>
                        <Pressable
                          style={styles.revealBtn}
                          onPress={() => toggleReveal(i)}
                          accessibilityRole="button"
                          accessibilityState={{ expanded: revealed }}
                        >
                          <Text style={styles.revealBtnText}>
                            {revealed ? ui.hideRoman : ui.showRoman}
                          </Text>
                        </Pressable>
                      </View>
                      {revealed ? (
                        <Text style={styles.romanText}>{chunk.roman || "—"}</Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>

              <Pressable
                style={({ pressed }) => [styles.listenBtn, pressed && styles.pressed]}
                onPress={handlePlayAll}
                accessibilityRole="button"
                accessibilityLabel={ui.playAll}
              >
                <EmojiText style={styles.listenBtnText}>{ui.playAll}</EmojiText>
              </Pressable>
            </View>

            <View style={styles.bottom}>
              <View style={styles.navRow}>
                <Pressable style={styles.backBtn} onPress={back} accessibilityRole="button">
                  <Ionicons name="chevron-back" size={18} color={C.gold} />
                  <Text style={styles.backText}>{ui.back}</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.cta, styles.ctaFlex, !allChunksPlayed && styles.ctaDim, pressed && allChunksPlayed && styles.pressed]}
                  onPress={advance}
                  disabled={!allChunksPlayed}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !allChunksPlayed }}
                >
                  <Text style={styles.ctaText}>{ui.next}</Text>
                  <Ionicons name="arrow-forward" size={20} color={C.bg1} />
                </Pressable>
              </View>
            </View>
          </>
        )}

        {/* ── STEP 3 — SAY IT (hand-off) ── */}
        {step === 3 && (
          <>
            <View style={styles.rudyLine}>
              <Text style={styles.rudyLineText}>{ui.step3Rudy}</Text>
            </View>

            <View style={styles.heroCard}>
              <LinearGradient
                colors={["rgba(201,162,39,0.18)", "rgba(126,184,201,0.10)"]}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.cardKicker}>{ui.step3Title}</Text>
              <BidiTargetText targetLang={phrase.speechLang} rtlAlign="center" style={styles.phraseBig} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.6}>
                {phrase.phrase}
              </BidiTargetText>
              <Text style={styles.step3Body}>{ui.step3Body}</Text>
            </View>

            <View style={styles.bottom}>
              <View style={styles.navRow}>
                <Pressable style={styles.backBtn} onPress={back} accessibilityRole="button">
                  <Ionicons name="chevron-back" size={18} color={C.gold} />
                  <Text style={styles.backText}>{ui.back}</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.cta, styles.ctaFlex, pressed && styles.pressed]}
                  onPress={goToSpeak}
                  accessibilityRole="button"
                  accessibilityLabel={ui.sayItCta}
                >
                  <EmojiText style={styles.ctaText}>{ui.sayItCta}</EmojiText>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 24 },
  fallback: { flex: 1, justifyContent: "center", paddingHorizontal: 24, gap: 18 },
  fallbackText: { fontSize: 16, fontFamily: F.body, color: C.goldDim, textAlign: "center", lineHeight: 24 },

  eyebrow: {
    fontSize: 13, fontFamily: F.label, color: C.gold,
    letterSpacing: 1, textTransform: "uppercase", textAlign: "center", marginBottom: 16,
  },
  progressRow: { flexDirection: "row", justifyContent: "center", gap: 18, marginBottom: 18 },
  progressItem: { alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.goldDark },
  dotActive: { width: 28, backgroundColor: C.gold },
  dotDone: { backgroundColor: C.gold, opacity: 0.55 },
  stepLabel: { fontSize: 10, fontFamily: F.label, color: C.goldDim, letterSpacing: 0.5 },
  stepLabelActive: { color: C.gold },

  rudyLine: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14,
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(201,162,39,0.28)",
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  rudyLineText: { flex: 1, fontSize: 13, fontFamily: F.bodySemi, color: C.parchment, lineHeight: 19, fontStyle: "italic" },

  heroCard: {
    borderRadius: 20, padding: 20, gap: 16, overflow: "hidden",
    borderWidth: 1.5, borderColor: "rgba(201,162,39,0.40)",
    backgroundColor: C.bg2,
  },
  cardKicker: {
    fontSize: 11, fontFamily: F.label, color: C.gold,
    letterSpacing: 0.8, textTransform: "uppercase",
  },
  phraseBig: {
    fontSize: 32, fontFamily: F.header, color: C.parchment,
    textAlign: "center", lineHeight: 42, paddingVertical: 4,
  },
  meaningBlock: { gap: 4 },
  tipBlock: {
    gap: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(201,162,39,0.22)",
  },
  fieldLabel: {
    fontSize: 10, fontFamily: F.label, color: C.gold,
    letterSpacing: 0.7, textTransform: "uppercase",
  },
  meaningText: { fontSize: 18, fontFamily: F.bodySemi, color: C.parchment, lineHeight: 24 },
  tipText: { fontSize: 13, fontFamily: F.body, color: C.goldDim, lineHeight: 19, fontStyle: "italic" },

  listenBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.gold,
    backgroundColor: "rgba(201,162,39,0.14)",
  },
  listenBtnText: { fontSize: 16, fontFamily: F.header, color: C.gold, letterSpacing: 0.5 },

  chunkList: { gap: 12 },
  chunkRow: {
    padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.bg3,
    gap: 10,
  },
  chunkRowPlayed: { borderColor: C.gold },
  chunkText: { fontSize: 26, fontFamily: F.header, color: C.parchment, textAlign: "center" },
  chunkActions: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  chunkPlay: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.gold, backgroundColor: "rgba(201,162,39,0.12)",
  },
  chunkPlayText: { fontSize: 18 },
  revealBtn: {
    paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(201,162,39,0.32)", backgroundColor: "rgba(201,162,39,0.06)",
  },
  revealBtnText: { fontSize: 13, fontFamily: F.bodySemi, color: C.gold },
  romanText: {
    fontSize: 18, fontFamily: F.bodySemi, color: C.parchmentDeep,
    textAlign: "center", letterSpacing: 1, marginTop: 2,
  },

  step3Body: { fontSize: 14, fontFamily: F.body, color: C.goldDim, lineHeight: 21, textAlign: "center" },

  bottom: { paddingTop: 22, gap: 14 },
  navRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cta: {
    backgroundColor: C.gold, borderRadius: 18,
    paddingVertical: 18, alignItems: "center",
    flexDirection: "row", justifyContent: "center", gap: 8,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  ctaFlex: { flex: 1 },
  ctaDim: { backgroundColor: C.goldDark, shadowOpacity: 0 },
  ctaText: { fontSize: 17, fontFamily: F.header, color: C.bg1, letterSpacing: 1 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },

  backBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 14, paddingHorizontal: 6,
  },
  backText: { fontSize: 15, fontFamily: F.bodySemi, color: C.gold },

  selfExempt: { alignItems: "center", paddingVertical: 8 },
  selfExemptText: {
    fontSize: 13, fontFamily: F.bodySemi, color: C.goldDim,
    textDecorationLine: "underline", textAlign: "center",
  },

  basicNudgeRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingTop: 2,
  },
  basicNudgeLink: { paddingVertical: 6, paddingHorizontal: 2 },
  basicNudgeText: {
    fontSize: 12, fontFamily: F.body, color: C.goldDim,
    textDecorationLine: "underline", textAlign: "center", opacity: 0.85,
  },
  basicNudgeDismiss: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
});
