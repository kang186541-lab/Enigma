import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, Animated, Platform, ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { type LessonSentence, type Step1Config, getRandomFeedback } from "@/lib/lessonContent";
import type { Tri } from "@/lib/dailyCourseData";
import { registerGlobalSound, registerGlobalWebAudio, stopAllTTSSync } from "@/lib/ttsManager";
import { PhonemeCoaching } from "./PhonemeCoaching";

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "idle" | "playing" | "recording" | "assessing" | "result";
type WordScore = { word: string; score: number; errorType: string; phonemes?: { phoneme: string; score: number }[] };

interface Props {
  sentences: LessonSentence[];
  step1Config?: Step1Config;
  nativeLang: string;
  lc: "ko" | "en" | "es";
  onComplete: (spokeSentences: number) => void;
}

// Base rounds: 0 = slow, 1 = normal. Round 2 = audio-only recall (if enabled).
const BASE_ROUNDS = 2;

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

export function Step1ListenRepeat({ sentences, step1Config, nativeLang, lc, onComplete }: Props) {
  const [sentIdx, setSentIdx] = useState(0);
  const [round, setRound] = useState(0);      // 0 = slow, 1 = normal, 2 = audio-only recall
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [wordScores, setWordScores] = useState<WordScore[]>([]);
  const [totalSpoken, setTotalSpoken] = useState(0);
  const [playingMode, setPlayingMode] = useState<"slow" | "normal" | null>(null);
  const [textRevealed, setTextRevealed] = useState(false); // for round 3: reveal text after attempt

  // ── Round 3 (audio-only recall) configuration ───────────────────────────────
  const hasRound3 = step1Config?.hasAudioOnlyRound === true;

  // Determine which sentences get round 3 treatment
  const sentencesWithRound3 = React.useMemo(() => {
    if (!hasRound3) return new Set<number>();
    const recallIndices: number[] = [];
    sentences.forEach((s, i) => { if (s.recallRound) recallIndices.push(i); });
    if (recallIndices.length > 0) {
      // If audioOnlyCount is set, take only that many (from the end of the list)
      const count = step1Config?.audioOnlyCount ?? recallIndices.length;
      return new Set(recallIndices.slice(-count));
    }
    // Fallback: last N sentences if no recallRound flags
    const count = step1Config?.audioOnlyCount ?? 2;
    const startIdx = Math.max(0, sentences.length - count);
    const indices = new Set<number>();
    for (let i = startIdx; i < sentences.length; i++) indices.add(i);
    return indices;
  }, [sentences, hasRound3, step1Config]);

  // Total rounds for the current sentence
  const totalRoundsForSentence = (idx: number) =>
    hasRound3 && sentencesWithRound3.has(idx) ? 3 : BASE_ROUNDS;

  // Is the current round the audio-only recall round?
  const isAudioOnlyRound = round === 2 && hasRound3 && sentencesWithRound3.has(sentIdx);

  // Audio-only placeholder text
  const audioOnlyPlaceholder =
    nativeLang === "korean" ? "\uD83D\uDD0A \uB4E3\uACE0 \uB530\uB77C\uD558\uC138\uC694"
    : nativeLang === "spanish" ? "\uD83D\uDD0A Escucha y repite"
    : "\uD83D\uDD0A Listen and repeat";

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
      stopAllTTSSync();
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
      if (sentence.ttsVoice) url.searchParams.set("voice", sentence.ttsVoice);
      if (mode === "slow") url.searchParams.set("mode", "slow");

      if (Platform.OS === "web") {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
        registerGlobalWebAudio(audio);
        audio.onended = () => { setPhase("idle"); setPlayingMode(null); };
        audio.onerror = () => { setPhase("idle"); setPlayingMode(null); };
        await audio.play();
      } else {
        const { sound } = await Audio.Sound.createAsync({ uri: url.toString() }, { shouldPlay: true });
        soundRef.current = sound;
        registerGlobalSound(sound);
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
        // iOS: record as 16kHz WAV so Azure accepts it without ffmpeg conversion
        const recOptions: Audio.RecordingOptions = Platform.OS === "ios" ? {
          android: Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          ios: {
            extension: ".wav",
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 256000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
        } : Audio.RecordingOptionsPresets.HIGH_QUALITY;
        await rec.prepareToRecordAsync(recOptions);
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
      // 300ms delay — ensure file is fully flushed to disk before reading
      await new Promise(resolve => setTimeout(resolve, 300));
      const uri = rec.getURI();
      nativeRecRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, shouldDuckAndroid: false, playThroughEarpieceAndroid: false });
      if (!uri) throw new Error("no URI");
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const mimeType = Platform.OS === "ios" ? "audio/wav" : "audio/mp4";
      await submitAssessment(base64, mimeType);
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

  function isValidAudio(b64: string) { return !!b64 && b64.length >= 2000; }
  function hasRecognizedSpeech(data: Record<string, any>) {
    const t = data.recognizedText ?? data.text ?? data.displayText ?? "";
    return typeof t === "string" && t.trim().length > 0;
  }

  async function submitAssessment(base64: string, mimeType: string) {
    // Empty audio guard
    if (!isValidAudio(base64)) {
      console.warn('[STEP1] Audio too short — user probably said nothing');
      setScore(0);
      setFeedback(nativeLang === "korean" ? "음성이 감지되지 않았어요" : nativeLang === "spanish" ? "No se detectó voz" : "No speech detected");
      setPhase("result");
      return;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const apiUrl = new URL("/api/pronunciation-assess", apiBase).toString();
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: sentence.text, lang: sentence.speechLang, audio: base64, mimeType }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = res.ok ? await res.json() : {};
      // No speech recognized → 0 score
      if (!hasRecognizedSpeech(data)) {
        console.warn('[STEP1] Azure returned no recognized speech');
        setScore(0);
        setFeedback(nativeLang === "korean" ? "음성이 감지되지 않았어요" : nativeLang === "spanish" ? "No se detectó voz" : "No speech detected");
        return;
      }
      const s: number = data.pronunciationScore ?? data.score ?? 0;
      setScore(s);
      setWordScores(data.words ?? []);
      setFeedback(s >= 90 ? getRandomFeedback("excellent", nativeLang)
        : s >= 70 ? getRandomFeedback("good", nativeLang)
        : getRandomFeedback("needsWork", nativeLang));
      Haptics.notificationAsync(s >= 70 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
    } catch {
      setScore(0);
      setFeedback(nativeLang === "korean" ? "음성이 감지되지 않았어요" : nativeLang === "spanish" ? "No se detectó voz" : "No speech detected");
    } finally {
      setPhase("result");
      if (isAudioOnlyRound) setTextRevealed(true);
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

    const maxRounds = totalRoundsForSentence(sentIdx);
    if (round < maxRounds - 1) {
      setRound(round + 1);
      setPhase("idle");
      setScore(null);
      setFeedback("");
      setWordScores([]);
      setTextRevealed(false);
    } else if (sentIdx < sentences.length - 1) {
      setSentIdx(sentIdx + 1);
      setRound(0);
      setPhase("idle");
      setScore(null);
      setFeedback("");
      setWordScores([]);
      setTextRevealed(false);
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
    : isAudioOnlyRound
      ? (nativeLang === "korean" ? "기억해서 말하기 🧠" : nativeLang === "spanish" ? "Di de memoria 🧠" : "Say from memory 🧠")
    : round === 0
      ? (nativeLang === "korean" ? "따라 말하기 🎤" : nativeLang === "spanish" ? "Repetir 🎤" : "Repeat 🎤")
      : (nativeLang === "korean" ? "한번 더 말하기 🔄" : nativeLang === "spanish" ? "Repetir una vez más 🔄" : "Say it again 🔄");

  // Determine whether "next" advances to next round of same sentence, or to a new sentence
  const TOTAL_ROUNDS_FOR_SENT = totalRoundsForSentence(sentIdx);
  const isLastRound = round >= TOTAL_ROUNDS_FOR_SENT - 1;
  const isLastSentence = sentIdx >= sentences.length - 1;
  const nextLabel = isLastRound
    ? (isLastSentence
        ? (nativeLang === "korean" ? "완료 ✓" : nativeLang === "spanish" ? "Completar ✓" : "Finish ✓")
        : (nativeLang === "korean" ? "다음 문장 →" : nativeLang === "spanish" ? "Siguiente frase →" : "Next sentence →"))
    : (nativeLang === "korean" ? "다음 →" : nativeLang === "spanish" ? "Siguiente →" : "Next →");
  const retryLabel  = nativeLang === "korean" ? "한번 더 🔄" : nativeLang === "spanish" ? "Otro intento 🔄" : "Try again 🔄";
  const roundLabel  = round === 0
    ? (nativeLang === "korean" ? "느린 속도로 따라하기" : nativeLang === "spanish" ? "Repite despacio" : "Repeat at slow speed")
    : round === 1
    ? (nativeLang === "korean" ? "자연 속도로 따라하기" : nativeLang === "spanish" ? "Repite a velocidad normal" : "Repeat at normal speed")
    : (nativeLang === "korean" ? "기억해서 말하기" : nativeLang === "spanish" ? "Di de memoria" : "Say from memory");

  const totalUtterances = sentences.reduce((sum, _, i) => sum + totalRoundsForSentence(i), 0);
  const doneUtterances  = sentences.slice(0, sentIdx).reduce((sum, _, i) => sum + totalRoundsForSentence(i), 0)
    + round + (phase === "result" && (score ?? 0) >= 70 ? 1 : 0);

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
        <Text style={s.sentenceText}>
          {isAudioOnlyRound && !textRevealed ? audioOnlyPlaceholder : sentence.text}
        </Text>
        {!(isAudioOnlyRound && !textRevealed) && (
          <Text style={s.sentenceMeaning}>{getMeaning(sentence.meaning, lc)}</Text>
        )}
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

          {/* Word-by-word breakdown + phoneme coaching */}
          <PhonemeCoaching
            wordScores={wordScores}
            nativeLang={nativeLang}
            targetLang={sentence.speechLang.startsWith("ko") ? "korean" : sentence.speechLang.startsWith("es") ? "spanish" : "english"}
            speechLang={sentence.speechLang}
          />

          <View style={s.resultBtns}>
            {score < 70 && (
              <Pressable
                style={({ pressed }) => [s.retryBtn, pressed && { opacity: 0.8 }]}
                onPress={() => { setPhase("idle"); setScore(null); setFeedback(""); setWordScores([]); }}
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
          {nativeLang === "korean" ? "문장 완료" : nativeLang === "spanish" ? "frases completadas" : "sentences done"}
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
  progressText: { fontSize: 15, fontFamily: F.label, color: C.goldDim },
  progressDots: { flexDirection: "row", gap: 5 },
  dot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(201,162,39,0.2)", borderWidth: 0.5, borderColor: C.border },
  dotFilled:    { backgroundColor: C.gold },
});
