import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, Pressable, Animated, Platform, ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { ReviewQuestion } from "@/lib/lessonContent";
import type { Tri } from "@/lib/dailyCourseData";
import { registerGlobalSound, registerGlobalWebAudio, stopAllTTSSync } from "@/lib/ttsManager";

// ── Types ─────────────────────────────────────────────────────────────────────

type QPhase = "ready" | "recording" | "assessing" | "revealed" | "done";

interface Props {
  questions: ReviewQuestion[];
  nativeLang: string;
  lc: "ko" | "en" | "es";
  learningLang: string;
  onComplete: (pronScores: number[]) => void;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function getMeaning(t?: Tri, lc?: "ko" | "en" | "es"): string {
  if (!t || !lc) return "";
  return t[lc] ?? t.en;
}

// ── Timer hook ────────────────────────────────────────────────────────────────

function useCountdown(seconds: number, running: boolean, onEnd: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndRef  = useRef(onEnd);
  onEndRef.current = onEnd; // always fresh

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    setRemaining(seconds);
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          onEndRef.current();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  return remaining;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Step4QuickReview({ questions, nativeLang, lc, learningLang, onComplete }: Props) {
  const [qIndex, setQIndex]           = useState(0);
  const [qPhase, setQPhase]           = useState<QPhase>("ready");
  const [selectedOption, setSelected] = useState<string | null>(null);
  const [pronScore, setPronScore]     = useState<number | null>(null);
  const [allScores, setAllScores]     = useState<number[]>([]);
  const [stars, setStars]             = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [canSkipScoring, setCanSkipScoring] = useState(false);
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nativeRecRef   = useRef<Audio.Recording | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecRef    = useRef<any>(null);
  const autoStopRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundRef       = useRef<Audio.Sound | null>(null);
  const pulseAnim      = useRef(new Animated.Value(1)).current;
  const pulseLoop      = useRef<Animated.CompositeAnimation | null>(null);
  const progressAnim   = useRef(new Animated.Value(1)).current;

  const apiBase = getApiUrl();
  const q       = questions[qIndex];
  const total   = questions.length;

  const STT_LANG: Record<string, string> = {
    english: "en-US", spanish: "es-ES", korean: "ko-KR",
  };
  const sttLang = STT_LANG[learningLang] ?? "en-US";

  // Cleanup audio and recording on unmount
  useEffect(() => {
    return () => {
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      if (nativeRecRef.current) {
        nativeRecRef.current.stopAndUnloadAsync().catch(() => {});
        nativeRecRef.current = null;
      }
      stopAllTTSSync();
    };
  }, []);

  // ── Timer ──────────────────────────────────────────────────────────────────

  const handleTimerEnd = useCallback(() => {
    if (qPhase === "ready" || qPhase === "recording") {
      setTimerRunning(false);
      if (qPhase === "recording") stopRecordAndAssess(q);
      else skipQuestion();
    }
  }, [qPhase, q]);

  const remaining = useCountdown(15, timerRunning, handleTimerEnd);

  // Animate progress bar
  useEffect(() => {
    if (timerRunning) {
      progressAnim.setValue(1);
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 15000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(0);
    }
  }, [timerRunning, qIndex]);

  // Start timer when question is ready and it's a speak question
  useEffect(() => {
    if (qPhase === "ready") {
      setTimerRunning(true);
    }
  }, [qIndex, qPhase]);

  // ── Pulse ──────────────────────────────────────────────────────────────────

  function startPulse() {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  }
  function stopPulse() {
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
  }

  // ── TTS (play the correct sentence) ───────────────────────────────────────

  async function playTTS(text: string, speechLang: string) {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const url = new URL("/api/pronunciation-tts", apiBase);
      url.searchParams.set("text", text);
      url.searchParams.set("lang", speechLang);

      if (Platform.OS === "web") {
        const res = await fetch(url.toString());
        if (!res.ok) return;
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
        registerGlobalWebAudio(audio);
        audio.play().catch(() => {});
      } else {
        const { sound } = await Audio.Sound.createAsync({ uri: url.toString() }, { shouldPlay: true });
        soundRef.current = sound;
        registerGlobalSound(sound);
        sound.setOnPlaybackStatusUpdate((st) => {
          if (st.isLoaded && st.didJustFinish) soundRef.current = null;
        });
      }
    } catch {}
  }

  // ── Recording ─────────────────────────────────────────────────────────────

  async function startRecording() {
    if (qPhase !== "ready") return;
    setTimerRunning(false);
    setQPhase("recording");
    startPulse();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (Platform.OS !== "web") {
      const { granted } = await Audio.requestPermissionsAsync().catch(() => ({ granted: false }));
      if (!granted) { stopPulse(); setQPhase("ready"); return; }
      try {
        // Stop any playing TTS before switching to record mode
        if (soundRef.current) {
          await soundRef.current.stopAsync().catch(() => {});
          await soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: 1,
          interruptionModeAndroid: 1,
        });
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        nativeRecRef.current = rec;
        autoStopRef.current = setTimeout(() => stopRecordAndAssess(q), 7000);
      } catch { stopPulse(); setQPhase("ready"); }
    } else {
      if (!navigator?.mediaDevices?.getUserMedia) { stopPulse(); setQPhase("ready"); return; }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      if (!stream) { stopPulse(); setQPhase("ready"); return; }
      audioChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/webm";
      const rec = new (window as any).MediaRecorder(stream, { mimeType: mime });
      mediaRecRef.current = rec;
      rec.ondataavailable = (e: any) => { if (e.data?.size > 0) audioChunksRef.current.push(e.data); };
      rec.onstop = () => handleWebStop(mime, stream, q);
      rec.start();
      autoStopRef.current = setTimeout(() => { if (rec.state === "recording") rec.stop(); }, 7000);
    }
  }

  function fallbackReveal() {
    if (skipTimerRef.current) { clearTimeout(skipTimerRef.current); skipTimerRef.current = null; }
    setCanSkipScoring(false);
    setPronScore(70);
    setAllScores((prev) => [...prev, 70]);
    setStars(2);
    setQPhase("revealed");
  }

  async function stopRecordAndAssess(currentQ: ReviewQuestion) {
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
    stopPulse();
    setQPhase("assessing");

    if (Platform.OS !== "web") {
      const rec = nativeRecRef.current;
      if (!rec) { fallbackReveal(); return; }
      try {
        await rec.stopAndUnloadAsync();
        const uri = rec.getURI();
        nativeRecRef.current = null;
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
        if (!uri) throw new Error("no uri");
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" as any });
        await assessPronunciation(base64, "audio/m4a", currentQ);
      } catch {
        fallbackReveal();
      }
    }
    // web handled by onstop
  }

  async function handleWebStop(mime: string, stream: MediaStream, currentQ: ReviewQuestion) {
    stopPulse();
    stream.getTracks().forEach((t: any) => t.stop());
    setQPhase("assessing");
    try {
      const blob = new Blob(audioChunksRef.current, { type: mime });
      const base64: string = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onloadend = () => res((r.result as string).split(",")[1] ?? "");
        r.onerror = rej;
        r.readAsDataURL(blob);
      });
      await assessPronunciation(base64, mime, currentQ);
    } catch { fallbackReveal(); }
  }

  async function assessPronunciation(base64: string, mimeType: string, currentQ: ReviewQuestion) {
    const word = (currentQ.type === "speak" ? currentQ.sentence : currentQ.fullSentence) ?? "";
    const lang = (currentQ.type === "speak" ? currentQ.speechLang : (currentQ.speechLang ?? sttLang)) ?? sttLang;

    // Show skip button after 5 seconds
    setCanSkipScoring(false);
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    skipTimerRef.current = setTimeout(() => setCanSkipScoring(true), 5000);

    try {
      const url = new URL("/api/pronunciation-assess", apiBase).toString();
      const abortCtrl = new AbortController();
      const timeoutId = setTimeout(() => abortCtrl.abort(), 10000);
      let data: Record<string, any> = {};
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word, lang, audio: base64, mimeType }),
          signal: abortCtrl.signal,
        });
        clearTimeout(timeoutId);
        data = res.ok ? await res.json() : {};
      } catch {
        clearTimeout(timeoutId);
      }
      const score: number = data.pronunciationScore ?? data.score ?? 70;
      setPronScore(score);
      setAllScores((prev) => [...prev, score]);
      setStars(score >= 90 ? 3 : score >= 75 ? 2 : 1);
    } catch {
      setPronScore(70);
      setAllScores((prev) => [...prev, 70]);
      setStars(2);
    }
    if (skipTimerRef.current) { clearTimeout(skipTimerRef.current); skipTimerRef.current = null; }
    setCanSkipScoring(false);
    setQPhase("revealed");
    // Play TTS after revealing so the spinner doesn't hang waiting for audio load
    playTTS(word, lang).catch(() => {});
  }

  function skipScoring() {
    if (skipTimerRef.current) { clearTimeout(skipTimerRef.current); skipTimerRef.current = null; }
    setCanSkipScoring(false);
    setPronScore(70);
    setAllScores((prev) => [...prev, 70]);
    setStars(2);
    setQPhase("revealed");
  }

  // ── Fill blank: select ─────────────────────────────────────────────────────

  function handleSelect(option: string) {
    if (qPhase !== "ready") return;
    setTimerRunning(false);
    setSelected(option);
    const correct = option === q.answer;
    setPronScore(correct ? 100 : 50);
    setAllScores((prev) => [...prev, correct ? 100 : 50]);
    setStars(correct ? 3 : 1);
    setQPhase("revealed");
    Haptics.impactAsync(correct ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);

    // Auto-play the full sentence TTS on reveal
    if (q.fullSentence && q.speechLang) {
      setTimeout(() => playTTS(q.fullSentence!, q.speechLang ?? sttLang), 300);
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  function skipQuestion() {
    setQPhase("revealed");
    setPronScore(0);
    setAllScores((prev) => [...prev, 0]);
    setStars(0);
  }

  function nextQuestion() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (qIndex + 1 >= total) {
      setShowComplete(true);
      setTimeout(() => onComplete(allScores), 1500);
      return;
    }
    setQIndex((i) => i + 1);
    setPronScore(null);
    setSelected(null);
    setStars(0);
    setQPhase("ready");
    setTimerRunning(false);
  }

  function handleMicPress() {
    if (qPhase === "recording") {
      if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
      stopRecordAndAssess(q);
    } else if (qPhase === "ready") {
      startRecording();
    }
  }

  // ── Labels ────────────────────────────────────────────────────────────────

  const L = {
    speak: nativeLang === "korean" ? "말하기" : nativeLang === "spanish" ? "Hablar" : "Speak",
    stop: nativeLang === "korean" ? "중지" : nativeLang === "spanish" ? "Parar" : "Stop",
    next: nativeLang === "korean" ? "다음 →" : nativeLang === "spanish" ? "Siguiente →" : "Next →",
    yesterday: nativeLang === "korean" ? "어제 복습" : nativeLang === "spanish" ? "Revisión" : "Yesterday",
    assessing: nativeLang === "korean" ? "채점 중..." : nativeLang === "spanish" ? "Evaluando..." : "Checking...",
    complete: nativeLang === "korean" ? "🏆 복습 완료!" : nativeLang === "spanish" ? "🏆 ¡Repaso completado!" : "🏆 Review complete!",
    sentence: nativeLang === "korean" ? "이렇게 말해보세요:" : nativeLang === "spanish" ? "Di esto:" : "Say this sentence:",
    blank: nativeLang === "korean" ? "빈칸을 채우세요:" : nativeLang === "spanish" ? "Rellena el espacio:" : "Fill in the blank:",
  };

  if (showComplete) {
    const avg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    return (
      <View style={s.completeCard}>
        <Text style={s.completeTitle}>{L.complete}</Text>
        <Text style={s.completeScore}>
          {nativeLang === "korean" ? `평균 발음 점수: ${avg}점` : nativeLang === "spanish" ? `Pronunciación: ${avg}` : `Avg. Score: ${avg}`}
        </Text>
        <Text style={s.completeStars}>{"⭐".repeat(Math.round(avg / 33) + 1).slice(0, 3)}</Text>
      </View>
    );
  }

  const isSpeakQ    = q.type === "speak";
  const sentence    = isSpeakQ ? (q.sentence ?? "") : (q.fullSentence ?? "");
  const speechLang  = q.speechLang ?? sttLang;
  const meaning     = getMeaning(isSpeakQ ? q.meaning : q.fullSentenceMeaning, lc);

  return (
    <View style={s.container}>
      {/* Progress bar */}
      <View style={s.progressBar}>
        <Animated.View
          style={[s.progressFill, {
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
          }]}
        />
      </View>

      {/* Header */}
      <View style={s.header}>
        <View style={s.questionCounter}>
          <Text style={s.questionCounterText}>{qIndex + 1} / {total}</Text>
        </View>
        <Text style={s.timerText}>{remaining}s</Text>
        {q.isYesterdayReview && (
          <View style={s.yesterdayBadge}>
            <Text style={s.yesterdayText}>{L.yesterday}</Text>
          </View>
        )}
      </View>

      {/* Question card */}
      <View style={s.card}>
        <Text style={s.cardLabel}>{isSpeakQ ? L.sentence : L.blank}</Text>

        {isSpeakQ ? (
          /* SPEAK question */
          <View style={s.speakWrap}>
            <Text style={s.sentenceText}>{sentence}</Text>
            {meaning ? <Text style={s.meaningText}>{meaning}</Text> : null}
          </View>
        ) : (
          /* FILL_BLANK question */
          <View style={s.fillWrap}>
            <Text style={s.promptText}>{q.promptWithBlank ?? ""}</Text>
            <View style={s.optionsRow}>
              {(q.options ?? []).map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrect  = qPhase === "revealed" && opt === q.answer;
                const isWrong    = qPhase === "revealed" && isSelected && opt !== q.answer;
                return (
                  <Pressable
                    key={i}
                    style={({ pressed }) => [
                      s.optBtn,
                      isCorrect && s.optCorrect,
                      isWrong   && s.optWrong,
                      !isCorrect && !isWrong && isSelected && s.optSelected,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => handleSelect(opt)}
                    disabled={qPhase !== "ready"}
                  >
                    <Text style={[s.optBtnText, (isCorrect || (isSelected && !isWrong)) && { color: C.bg1 }]}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {qPhase === "revealed" && q.fullSentence && (
              <View style={s.fullSentenceBox}>
                <Text style={s.fullSentenceText}>{q.fullSentence}</Text>
                {q.fullSentenceMeaning && (
                  <Text style={s.fullSentenceMeaning}>{getMeaning(q.fullSentenceMeaning, lc)}</Text>
                )}
                <Pressable
                  style={({ pressed }) => [s.ttsBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => playTTS(q.fullSentence!, q.speechLang ?? sttLang)}
                >
                  <Ionicons name="volume-medium" size={14} color={C.gold} />
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Result */}
      {qPhase === "revealed" && pronScore !== null && isSpeakQ && (
        <View style={s.resultCard}>
          <Text style={s.resultStars}>{"⭐".repeat(stars).padEnd(3, "☆")}</Text>
          <Text style={s.resultScore}>{pronScore}점</Text>
          <View style={s.resultSentence}>
            <Text style={s.resultSentenceText}>{sentence}</Text>
            <Pressable onPress={() => playTTS(sentence, speechLang)}>
              <Ionicons name="volume-medium" size={14} color={C.gold} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Actions */}
      {isSpeakQ && qPhase !== "revealed" ? (
        <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: "center" }}>
          <Pressable
            style={({ pressed }) => [
              s.micBtn,
              qPhase === "recording" && s.micBtnActive,
              qPhase === "assessing" && { opacity: 0.5 },
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleMicPress}
            disabled={qPhase === "assessing"}
          >
            {qPhase === "assessing"
              ? <ActivityIndicator color={C.bg1} size="small" />
              : <Ionicons name={qPhase === "recording" ? "stop" : "mic"} size={20} color={C.bg1} />
            }
            <Text style={s.micBtnText}>
              {qPhase === "assessing" ? L.assessing : qPhase === "recording" ? L.stop : L.speak}
            </Text>
          </Pressable>
          {qPhase === "assessing" && canSkipScoring && (
            <Pressable style={s.skipScoringBtn} onPress={skipScoring}>
              <Text style={s.skipScoringText}>
                {nativeLang === "korean" ? "건너뛰기 →" : nativeLang === "spanish" ? "Saltar →" : "Skip →"}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      ) : null}

      {qPhase === "revealed" && (
        <Pressable
          style={({ pressed }) => [s.nextBtn, pressed && { opacity: 0.85 }]}
          onPress={nextQuestion}
        >
          <Text style={s.nextBtnText}>{L.next}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { gap: 14 },

  progressBar:  { height: 4, backgroundColor: C.bg2, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, backgroundColor: C.gold, borderRadius: 2 },

  header:       { flexDirection: "row", alignItems: "center", gap: 10 },
  questionCounter: { backgroundColor: C.bg2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  questionCounterText: { fontSize: 12, fontFamily: F.label, color: C.goldDim },
  timerText:    { fontSize: 14, fontFamily: F.header, color: C.gold, marginLeft: "auto" },
  yesterdayBadge: { backgroundColor: "rgba(201,162,39,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  yesterdayText: { fontSize: 10, fontFamily: F.label, color: C.goldDim },

  card: {
    backgroundColor: C.bg2, borderRadius: 16, padding: 18, gap: 12,
    borderWidth: 1, borderColor: C.border,
  },
  cardLabel: { fontSize: 11, fontFamily: F.label, color: C.goldDim, letterSpacing: 0.5 },

  speakWrap: { alignItems: "center", gap: 8 },
  sentenceText: { fontSize: 22, fontFamily: F.header, color: C.parchment, textAlign: "center", lineHeight: 30 },
  meaningText:  { fontSize: 13, fontFamily: F.body, color: C.goldDim, textAlign: "center" },

  fillWrap: { gap: 12 },
  promptText: { fontSize: 18, fontFamily: F.header, color: C.parchment, lineHeight: 26 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optBtn: {
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.bg1,
  },
  optSelected: { backgroundColor: C.gold, borderColor: C.gold },
  optCorrect:  { backgroundColor: "#4caf50", borderColor: "#4caf50" },
  optWrong:    { backgroundColor: "#e55757", borderColor: "#e55757" },
  optBtnText:  { fontSize: 14, fontFamily: F.bodySemi, color: C.parchment },

  fullSentenceBox: {
    backgroundColor: "rgba(201,162,39,0.1)", borderRadius: 10, padding: 10, gap: 4,
    borderWidth: 1, borderColor: "rgba(201,162,39,0.3)",
  },
  fullSentenceText: { fontSize: 14, fontFamily: F.bodySemi, color: C.parchment },
  fullSentenceMeaning: { fontSize: 12, fontFamily: F.body, color: C.goldDim },
  ttsBtn: { alignSelf: "flex-end", marginTop: 2 },

  resultCard: {
    backgroundColor: C.bg2, borderRadius: 14, padding: 14, gap: 6, alignItems: "center",
    borderWidth: 1, borderColor: C.border,
  },
  resultStars:        { fontSize: 22, letterSpacing: 4 },
  resultScore:        { fontSize: 28, fontFamily: F.title, color: C.gold },
  resultSentence:     { flexDirection: "row", alignItems: "center", gap: 8 },
  resultSentenceText: { fontSize: 14, fontFamily: F.body, color: C.parchment },

  micBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: C.gold, paddingVertical: 16, borderRadius: 14,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  micBtnActive: { backgroundColor: "#e55", shadowColor: "#e55" },
  micBtnText:   { fontSize: 16, fontFamily: F.header, color: C.bg1 },

  skipScoringBtn: {
    marginTop: 12, paddingVertical: 8, paddingHorizontal: 20,
    borderRadius: 20, borderWidth: 1, borderColor: C.border,
  },
  skipScoringText: { fontSize: 13, fontFamily: F.label, color: C.goldDim },

  nextBtn: {
    backgroundColor: C.gold, borderRadius: 14, paddingVertical: 14, alignItems: "center",
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  nextBtnText: { fontSize: 15, fontFamily: F.header, color: C.bg1 },

  completeCard: {
    backgroundColor: C.bg2, borderRadius: 20, padding: 24, alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: C.border,
  },
  completeTitle: { fontSize: 20, fontFamily: F.title, color: C.gold },
  completeScore: { fontSize: 14, fontFamily: F.body, color: C.parchment },
  completeStars: { fontSize: 28, letterSpacing: 4 },
});
