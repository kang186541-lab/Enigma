import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, Animated, Platform, ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { type LessonSentence, getRandomFeedback } from "@/lib/lessonContent";
import type { Tri } from "@/lib/dailyCourseData";

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "idle" | "playing" | "recording" | "assessing" | "result";

interface Props {
  sentences: LessonSentence[];
  nativeLang: string;
  lc: "ko" | "en" | "es";
  onComplete: (spokeSentences: number) => void;
}

// 3 sentences × 2 rounds (slow + normal) = 6 total
const TOTAL_ROUNDS = 2;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStars(score: number): number {
  if (score >= 90) return 5;
  if (score >= 80) return 4;
  if (score >= 70) return 3;
  if (score >= 60) return 2;
  return 1;
}

function getMeaning(meaning: Tri, lc: "ko" | "en" | "es"): string {
  return meaning[lc] ?? meaning.en;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Step1ListenRepeat({ sentences, nativeLang, lc, onComplete }: Props) {
  const [sentIdx, setSentIdx] = useState(0);
  const [round, setRound] = useState(0);      // 0 = slow, 1 = normal
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [totalSpoken, setTotalSpoken] = useState(0);
  const [playingMode, setPlayingMode] = useState<"slow" | "normal" | null>(null);

  const nativeRecRef  = useRef<Audio.Recording | null>(null);
  const soundRef      = useRef<Audio.Sound | null>(null);
  const autoStopRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioChunks   = useRef<Blob[]>([]);
  const mediaRecRef   = useRef<any>(null);
  const pulseAnim     = useRef(new Animated.Value(1)).current;
  const pulseLoop     = useRef<Animated.CompositeAnimation | null>(null);

  const apiBase = getApiUrl();
  const sentence = sentences[sentIdx];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  function startPulse() {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 400, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  }

  function stopPulse() {
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
  }

  // ── TTS ──────────────────────────────────────────────────────────────────────

  async function playTTS(mode: "slow" | "normal") {
    if (phase === "playing" || phase === "recording" || phase === "assessing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayingMode(mode);
    setPhase("playing");

    try {
      // Stop any existing sound
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

      const url = new URL("/api/pronunciation-tts", apiBase);
      url.searchParams.set("text", sentence.text);
      url.searchParams.set("lang", sentence.speechLang);
      if (mode === "slow") url.searchParams.set("mode", "slow");

      if (Platform.OS === "web") {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
        audio.onended = () => { setPhase("idle"); setPlayingMode(null); };
        audio.onerror = () => { setPhase("idle"); setPlayingMode(null); };
        await audio.play();
      } else {
        const { sound } = await Audio.Sound.createAsync({ uri: url.toString() }, { shouldPlay: true });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            soundRef.current = null;
            setPhase("idle");
            setPlayingMode(null);
          }
        });
      }
    } catch {
      setPhase("idle");
      setPlayingMode(null);
    }
  }

  // ── Recording ────────────────────────────────────────────────────────────────

  async function startRecording() {
    if (phase !== "idle" && phase !== "result") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setScore(null);
    setFeedback("");
    setPhase("recording");
    startPulse();

    if (Platform.OS !== "web") {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) { stopPulse(); setPhase("idle"); return; }
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        nativeRecRef.current = rec;
        autoStopRef.current = setTimeout(() => stopNativeRecording(), 4000);
      } catch {
        stopPulse();
        setPhase("idle");
      }
    } else {
      if (!navigator?.mediaDevices?.getUserMedia) { stopPulse(); setPhase("idle"); return; }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      if (!stream) { stopPulse(); setPhase("idle"); return; }
      audioChunks.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new (window as any).MediaRecorder(stream, { mimeType });
      mediaRecRef.current = recorder;
      recorder.ondataavailable = (e: any) => { if (e.data?.size > 0) audioChunks.current.push(e.data); };
      recorder.onstop = () => handleWebRecordingStop(mimeType, stream);
      recorder.start();
      autoStopRef.current = setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 4000);
    }
  }

  async function stopNativeRecording() {
    const rec = nativeRecRef.current;
    if (!rec) return;
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
    stopPulse();
    setPhase("assessing");
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      nativeRecRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      if (!uri) throw new Error("no URI");
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" as any });
      await submitAssessment(base64, "audio/m4a");
    } catch {
      setPhase("idle");
    }
  }

  async function handleWebRecordingStop(mimeType: string, stream: MediaStream) {
    stopPulse();
    stream.getTracks().forEach((t: any) => t.stop());
    setPhase("assessing");
    try {
      const blob = new Blob(audioChunks.current, { type: mimeType });
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      await submitAssessment(base64, mimeType);
    } catch {
      setPhase("idle");
    }
  }

  async function submitAssessment(base64: string, mimeType: string) {
    try {
      const apiUrl = new URL("/api/pronunciation-assess", apiBase).toString();
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: sentence.text, lang: sentence.speechLang, audio: base64, mimeType }),
      });
      const data = res.ok ? await res.json() : { score: 50 };
      const s: number = data.pronunciationScore ?? data.score ?? 50;
      setScore(s);
      setFeedback(s >= 90 ? getRandomFeedback("excellent", nativeLang)
        : s >= 70 ? getRandomFeedback("good", nativeLang)
        : getRandomFeedback("needsWork", nativeLang));
      setPhase("result");
      Haptics.notificationAsync(s >= 70 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
    } catch {
      setScore(60);
      setFeedback(getRandomFeedback("needsWork", nativeLang));
      setPhase("result");
    }
  }

  function handleMicPress() {
    if (phase === "recording") {
      // Stop early
      if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
      if (Platform.OS !== "web") stopNativeRecording();
      else mediaRecRef.current?.stop();
    } else {
      startRecording();
    }
  }

  // ── Advance to next sentence / round ────────────────────────────────────────

  function advance() {
    const newSpoken = totalSpoken + 1;
    setTotalSpoken(newSpoken);

    if (round < TOTAL_ROUNDS - 1) {
      // Move to next round of same sentence
      setRound(round + 1);
      setPhase("idle");
      setScore(null);
      setFeedback("");
    } else if (sentIdx < sentences.length - 1) {
      // Next sentence
      setSentIdx(sentIdx + 1);
      setRound(0);
      setPhase("idle");
      setScore(null);
      setFeedback("");
    } else {
      // All done
      onComplete(newSpoken);
    }
  }

  // ── Labels ────────────────────────────────────────────────────────────────────

  const slowLabel   = nativeLang === "korean" ? "느리게 듣기" : nativeLang === "spanish" ? "Escuchar despacio" : "Listen slow";
  const normalLabel = nativeLang === "korean" ? "자연 속도 듣기" : nativeLang === "spanish" ? "Velocidad normal" : "Normal speed";
  const micLabel    = phase === "recording"
    ? (nativeLang === "korean" ? "탭하여 중지 ■" : nativeLang === "spanish" ? "Toca para parar ■" : "Tap to stop ■")
    : (nativeLang === "korean" ? "따라 말하기 🎤" : nativeLang === "spanish" ? "Repetir 🎤" : "Repeat 🎤");
  const nextLabel   = nativeLang === "korean" ? "다음 →" : nativeLang === "spanish" ? "Siguiente →" : "Next →";
  const retryLabel  = nativeLang === "korean" ? "한번 더 🔄" : nativeLang === "spanish" ? "Otro intento 🔄" : "Try again 🔄";
  const roundLabel  = round === 0
    ? (nativeLang === "korean" ? "느린 속도로 따라하기" : nativeLang === "spanish" ? "Repite despacio" : "Repeat at slow speed")
    : (nativeLang === "korean" ? "자연 속도로 따라하기" : nativeLang === "spanish" ? "Repite a velocidad normal" : "Repeat at normal speed");

  const totalUtterances = sentences.length * TOTAL_ROUNDS;
  const doneUtterances  = sentIdx * TOTAL_ROUNDS + round + (phase === "result" && (score ?? 0) >= 70 ? 1 : 0);

  const stars = score !== null ? getStars(score) : 0;

  return (
    <View style={s.container}>
      {/* Rudy tip */}
      <View style={s.rudyRow}>
        <Text style={s.rudyEmoji}>🦊</Text>
        <View style={s.rudySpeech}>
          <Text style={s.rudySpeechText}>{roundLabel}</Text>
        </View>
      </View>

      {/* Sentence card */}
      <View style={s.sentenceCard}>
        <Text style={s.sentenceCounter}>{sentIdx + 1}/{sentences.length}</Text>
        <Text style={s.sentenceText}>{sentence.text}</Text>
        <Text style={s.sentenceMeaning}>{getMeaning(sentence.meaning, lc)}</Text>
      </View>

      {/* Listen buttons */}
      <View style={s.ttsRow}>
        <Pressable
          style={({ pressed }) => [s.ttsBtn, s.ttsBtnSlow, playingMode === "slow" && s.ttsBtnActive, pressed && { opacity: 0.8 }]}
          onPress={() => playTTS("slow")}
          disabled={phase === "recording" || phase === "assessing"}
        >
          {playingMode === "slow" && phase === "playing"
            ? <ActivityIndicator size="small" color={C.bg1} />
            : <Ionicons name="volume-medium" size={16} color={phase === "recording" ? C.goldDim : C.bg1} />
          }
          <Text style={[s.ttsBtnText, { color: C.bg1 }]}>{slowLabel}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [s.ttsBtn, playingMode === "normal" && s.ttsBtnActive, pressed && { opacity: 0.8 }]}
          onPress={() => playTTS("normal")}
          disabled={phase === "recording" || phase === "assessing"}
        >
          {playingMode === "normal" && phase === "playing"
            ? <ActivityIndicator size="small" color={C.gold} />
            : <Ionicons name="volume-high" size={16} color={phase === "recording" ? C.goldDim : C.gold} />
          }
          <Text style={[s.ttsBtnText, { color: C.gold }]}>{normalLabel}</Text>
        </Pressable>
      </View>

      {/* Mic button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Pressable
          style={({ pressed }) => [
            s.micBtn,
            phase === "recording" && s.micBtnActive,
            phase === "assessing" && { opacity: 0.6 },
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleMicPress}
          disabled={phase === "playing" || phase === "assessing"}
        >
          {phase === "assessing"
            ? <ActivityIndicator color={C.bg1} />
            : <Ionicons name={phase === "recording" ? "stop" : "mic"} size={22} color={C.bg1} />
          }
          <Text style={s.micBtnText}>{micLabel}</Text>
        </Pressable>
      </Animated.View>

      {/* Score result */}
      {phase === "result" && score !== null && (
        <View style={s.resultBox}>
          <View style={s.starsRow}>
            {Array.from({ length: 5 }, (_, i) => (
              <Text key={i} style={[s.star, i < stars ? s.starFilled : s.starEmpty]}>★</Text>
            ))}
            <Text style={s.scoreNum}>{score}%</Text>
          </View>
          <Text style={s.feedbackText}>{feedback}</Text>

          <View style={s.resultBtns}>
            {score < 70 && (
              <Pressable
                style={({ pressed }) => [s.retryBtn, pressed && { opacity: 0.8 }]}
                onPress={() => { setPhase("idle"); setScore(null); setFeedback(""); }}
              >
                <Text style={s.retryBtnText}>{retryLabel}</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [s.nextBtn, pressed && { opacity: 0.85 }]}
              onPress={advance}
            >
              <Text style={s.nextBtnText}>{nextLabel}</Text>
              <Ionicons name="arrow-forward" size={13} color={C.bg1} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Progress */}
      <View style={s.progressRow}>
        <Text style={s.progressText}>
          {doneUtterances}/{totalUtterances}{" "}
          {nativeLang === "korean" ? "발화 완료" : nativeLang === "spanish" ? "frases completadas" : "utterances done"}
        </Text>
        <View style={s.progressDots}>
          {Array.from({ length: totalUtterances }, (_, i) => (
            <View key={i} style={[s.dot, i < doneUtterances && s.dotFilled]} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { gap: 16 },

  rudyRow:    { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  rudyEmoji:  { fontSize: 32 },
  rudySpeech: {
    flex: 1, backgroundColor: C.bg2, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: C.border,
  },
  rudySpeechText: { fontSize: 13, fontFamily: F.body, color: C.parchment, lineHeight: 19 },

  sentenceCard: {
    backgroundColor: C.bg2, borderRadius: 18, padding: 22,
    borderWidth: 1.5, borderColor: C.border, gap: 10,
    alignItems: "center",
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  sentenceCounter: { fontSize: 11, fontFamily: F.label, color: C.goldDim },
  sentenceText: {
    fontSize: 22, fontFamily: F.title, color: C.gold,
    textAlign: "center", letterSpacing: 0.5, lineHeight: 32,
  },
  sentenceMeaning: { fontSize: 13, fontFamily: F.body, color: C.goldDim, fontStyle: "italic", textAlign: "center" },

  ttsRow: { flexDirection: "row", gap: 10 },
  ttsBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg2,
  },
  ttsBtnSlow: { backgroundColor: "rgba(201,162,39,0.85)" },
  ttsBtnActive: { borderColor: C.gold },
  ttsBtnText: { fontSize: 12, fontFamily: F.bodySemi },

  micBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.gold, paddingVertical: 15, borderRadius: 16, alignSelf: "center",
    paddingHorizontal: 40,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  micBtnActive: { backgroundColor: "#e55", shadowColor: "#e55" },
  micBtnText: { fontSize: 15, fontFamily: F.header, color: C.bg1, letterSpacing: 0.5 },

  resultBox: {
    backgroundColor: C.bg2, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: C.border, gap: 10,
    alignItems: "center",
  },
  starsRow:  { flexDirection: "row", alignItems: "center", gap: 4 },
  star:      { fontSize: 22 },
  starFilled: { color: C.gold },
  starEmpty:  { color: "rgba(201,162,39,0.2)" },
  scoreNum:  { fontSize: 14, fontFamily: F.header, color: C.parchment, marginLeft: 8 },
  feedbackText: { fontSize: 14, fontFamily: F.body, color: C.parchment, textAlign: "center", fontStyle: "italic" },
  resultBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  retryBtn: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
  },
  retryBtnText: { fontSize: 13, fontFamily: F.bodySemi, color: C.goldDim },
  nextBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.gold, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10,
  },
  nextBtnText: { fontSize: 13, fontFamily: F.header, color: C.bg1 },

  progressRow: { alignItems: "center", gap: 6 },
  progressText: { fontSize: 12, fontFamily: F.label, color: C.goldDim },
  progressDots: { flexDirection: "row", gap: 5 },
  dot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(201,162,39,0.2)", borderWidth: 0.5, borderColor: C.border },
  dotFilled:    { backgroundColor: C.gold },
});
