import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, Animated, Platform, ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { type Step2Data, type FillBlankQuiz } from "@/lib/lessonContent";
import type { Tri } from "@/lib/dailyCourseData";
import { registerGlobalSound, registerGlobalWebAudio, stopAllTTSSync } from "@/lib/ttsManager";

// ── Types ─────────────────────────────────────────────────────────────────────

type ScreenPhase = "explanation" | "quiz";
type QuizPhase = "question" | "checking" | "correct" | "wrong" | "speak";
type SpeakPhase = "idle" | "recording" | "assessing" | "done";

interface Props {
  data: Step2Data;
  nativeLang: string;
  lc: "ko" | "en" | "es";
  learningLang: string;
  onComplete: (correctCount: number) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMeaning(meaning: Tri, lc: "ko" | "en" | "es"): string {
  return meaning[lc] ?? meaning.en;
}

function getExplanation(explanation: Tri, lc: "ko" | "en" | "es"): string {
  return explanation[lc] ?? explanation.en;
}

const SPEECH_LANG_MAP: Record<string, string> = {
  english: "en-US",
  spanish: "es-ES",
  korean:  "ko-KR",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function Step2KeyPoint({ data, nativeLang, lc, learningLang, onComplete }: Props) {
  const [screenPhase, setScreenPhase] = useState<ScreenPhase>("explanation");
  const [quizIdx,     setQuizIdx]     = useState(0);
  const [quizPhase,   setQuizPhase]   = useState<QuizPhase>("question");
  const [selected,    setSelected]    = useState<string | null>(null);
  const [inputVal,    setInputVal]    = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [speakPhase,  setSpeakPhase]  = useState<SpeakPhase>("idle");
  const [speakScore,  setSpeakScore]  = useState<number | null>(null);
  const [wrongFeedback, setWrongFeedback] = useState("");
  const [inputError,  setInputError]  = useState(false);

  const nativeRecRef = useRef<Audio.Recording | null>(null);
  const soundRef     = useRef<Audio.Sound | null>(null);
  const autoStopRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioChunks  = useRef<Blob[]>([]);
  const mediaRecRef  = useRef<any>(null);
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const pulseLoop    = useRef<Animated.CompositeAnimation | null>(null);
  const shakeAnim    = useRef(new Animated.Value(0)).current;

  const apiBase    = getApiUrl();
  const quiz: FillBlankQuiz = data.quizzes[quizIdx];
  const speechLang = SPEECH_LANG_MAP[learningLang] ?? "en-US";

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      stopAllTTSSync();
    };
  }, []);

  function startPulse() {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 400, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  }

  function stopPulse() {
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
  }

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 50, useNativeDriver: true }),
    ]).start();
  }

  // ── Submit answer ─────────────────────────────────────────────────────────────

  function submitAnswer(choice: string) {
    if (quizPhase !== "question") return;
    setSelected(choice);
    setQuizPhase("checking");

    const correct = choice.trim().toLowerCase() === quiz.answer.trim().toLowerCase();
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrectCount(c => c + 1);
      setTimeout(() => setQuizPhase("correct"), 200);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      const wrongMsg = nativeLang === "korean"
        ? `정답은 "${quiz.answer}"이에요.`
        : nativeLang === "spanish"
        ? `La respuesta correcta es "${quiz.answer}".`
        : `The correct answer is "${quiz.answer}".`;
      setWrongFeedback(wrongMsg);
      setTimeout(() => setQuizPhase("wrong"), 200);
    }
  }

  // ── Speak-after TTS ───────────────────────────────────────────────────────────

  async function playSpeakTTS() {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const url = new URL("/api/pronunciation-tts", apiBase);
      url.searchParams.set("text", quiz.fullSentence);
      url.searchParams.set("lang", speechLang);
      if (Platform.OS === "web") {
        const res = await fetch(url.toString());
        if (res.ok) {
          const blob = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
          registerGlobalWebAudio(audio);
          audio.play().catch(() => {});
        }
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

  // ── Speak-after recording ─────────────────────────────────────────────────────

  async function startSpeakRecording() {
    if (speakPhase === "recording" || speakPhase === "assessing") return;
    setSpeakScore(null);
    setSpeakPhase("recording");
    startPulse();

    if (Platform.OS !== "web") {
      const { granted } = await Audio.requestPermissionsAsync().catch(() => ({ granted: false }));
      if (!granted) { stopPulse(); setSpeakPhase("idle"); return; }
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        nativeRecRef.current = rec;
        autoStopRef.current = setTimeout(() => stopSpeakNativeRecording(), 4000);
      } catch { stopPulse(); setSpeakPhase("idle"); }
    } else {
      if (!navigator?.mediaDevices?.getUserMedia) { stopPulse(); setSpeakPhase("idle"); return; }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      if (!stream) { stopPulse(); setSpeakPhase("idle"); return; }
      audioChunks.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new (window as any).MediaRecorder(stream, { mimeType });
      mediaRecRef.current = recorder;
      recorder.ondataavailable = (e: any) => { if (e.data?.size > 0) audioChunks.current.push(e.data); };
      recorder.onstop = () => handleSpeakWebStop(mimeType, stream);
      recorder.start();
      autoStopRef.current = setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 4000);
    }
  }

  async function stopSpeakNativeRecording() {
    const rec = nativeRecRef.current;
    if (!rec) return;
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
    stopPulse();
    setSpeakPhase("assessing");
    try {
      await rec.stopAndUnloadAsync();
      // 300ms delay — ensure file is fully flushed to disk before reading
      await new Promise(resolve => setTimeout(resolve, 300));
      const uri = rec.getURI();
      nativeRecRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      if (!uri) throw new Error("no uri");
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" as any });
      await submitSpeakAssessment(base64, "audio/m4a");
    } catch { setSpeakPhase("done"); }
  }

  async function handleSpeakWebStop(mimeType: string, stream: MediaStream) {
    stopPulse();
    stream.getTracks().forEach((t: any) => t.stop());
    setSpeakPhase("assessing");
    try {
      const blob = new Blob(audioChunks.current, { type: mimeType });
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      await submitSpeakAssessment(base64, mimeType);
    } catch { setSpeakPhase("done"); }
  }

  function isValidAudio(b64: string) { return !!b64 && b64.length >= 2000; }
  function hasRecognizedSpeech(data: Record<string, any>) {
    const t = data.recognizedText ?? data.text ?? data.displayText ?? "";
    return typeof t === "string" && t.trim().length > 0;
  }

  async function submitSpeakAssessment(base64: string, mimeType: string) {
    // Empty audio guard
    if (!isValidAudio(base64)) {
      console.warn('[STEP2] Audio too short — user probably said nothing');
      setSpeakScore(0);
      setSpeakPhase("done");
      return;
    }
    try {
      const apiUrl = new URL("/api/pronunciation-assess", apiBase).toString();
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: quiz.fullSentence, lang: speechLang, audio: base64, mimeType }),
      });
      const data = res.ok ? await res.json() : {};
      // No speech recognized → 0 score
      if (!hasRecognizedSpeech(data)) {
        console.warn('[STEP2] Azure returned no recognized speech');
        setSpeakScore(0);
        setSpeakPhase("done");
        return;
      }
      setSpeakScore(data.pronunciationScore ?? data.score ?? 0);
    } catch { setSpeakScore(0); }
    finally { setSpeakPhase("done"); }
  }

  function handleSpeakMicPress() {
    if (speakPhase === "recording") {
      if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
      if (Platform.OS !== "web") stopSpeakNativeRecording();
      else mediaRecRef.current?.stop();
    } else {
      startSpeakRecording();
    }
  }

  // ── Advance quiz ──────────────────────────────────────────────────────────────

  function proceedToSpeak() { setQuizPhase("speak"); setSpeakPhase("idle"); setSpeakScore(null); }

  function advanceQuiz() {
    if (quizIdx < data.quizzes.length - 1) {
      setQuizIdx(quizIdx + 1);
      setQuizPhase("question");
      setSelected(null);
      setInputVal("");
      setWrongFeedback("");
      setInputError(false);
      setSpeakPhase("idle");
      setSpeakScore(null);
    } else {
      onComplete(correctCount);
    }
  }

  // ── Retry wrong answer ────────────────────────────────────────────────────────

  function retryQuiz() {
    setQuizPhase("question");
    setSelected(null);
    setInputVal("");
    setWrongFeedback("");
    setInputError(false);
  }

  // ── Labels ────────────────────────────────────────────────────────────────────

  const okLabel       = nativeLang === "korean" ? "이해했어요 →" : nativeLang === "spanish" ? "Entendido →" : "Got it →";
  const speakLabel    = speakPhase === "recording"
    ? (nativeLang === "korean" ? "탭하여 중지 ■" : nativeLang === "spanish" ? "Toca para parar ■" : "Tap to stop ■")
    : (nativeLang === "korean" ? "따라 말해봐요 🎤" : nativeLang === "spanish" ? "Repite 🎤" : "Repeat it 🎤");
  const skipLabel     = nativeLang === "korean" ? "넘어가기 →" : nativeLang === "spanish" ? "Omitir →" : "Skip →";
  const nextLabel     = nativeLang === "korean" ? "다음 →" : nativeLang === "spanish" ? "Siguiente →" : "Next →";
  const doneLabel     = nativeLang === "korean" ? "완료! →" : nativeLang === "spanish" ? "¡Listo! →" : "Done! →";
  const retryLabel    = nativeLang === "korean" ? "다시 시도 🔄" : nativeLang === "spanish" ? "Reintentar 🔄" : "Retry 🔄";
  const checkLabel    = nativeLang === "korean" ? "확인" : nativeLang === "spanish" ? "Comprobar" : "Check";
  const listenLabel   = nativeLang === "korean" ? "듣기" : nativeLang === "spanish" ? "Escuchar" : "Listen";
  const isLast = quizIdx === data.quizzes.length - 1;

  // ── Render ────────────────────────────────────────────────────────────────────

  if (screenPhase === "explanation") {
    return (
      <View style={s.container}>
        <View style={s.rudyRow}>
          <Text style={s.rudyEmoji}>🦊</Text>
          <View style={s.rudySpeech}>
            <Text style={s.rudySpeechText}>
              {nativeLang === "korean" ? "핵심 문법을 알려줄게요!" : nativeLang === "spanish" ? "¡Te enseño la gramática clave!" : "Let me teach you the key grammar point!"}
            </Text>
          </View>
        </View>

        <View style={s.explainCard}>
          <Ionicons name="bulb" size={22} color={C.gold} style={{ marginBottom: 4 }} />
          <Text style={s.explainText}>{getExplanation(data.explanation, lc)}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [s.okBtn, pressed && { opacity: 0.85 }]}
          onPress={() => setScreenPhase("quiz")}
        >
          <Text style={s.okBtnText}>{okLabel}</Text>
          <Ionicons name="arrow-forward" size={14} color={C.bg1} />
        </Pressable>
      </View>
    );
  }

  // ── Quiz screen ───────────────────────────────────────────────────────────────

  const promptParts = quiz.promptWithBlank.split("___");

  return (
    <View style={s.container}>
      {/* Quiz header */}
      <View style={s.quizHeader}>
        <Text style={s.quizCounter}>{quizIdx + 1}/{data.quizzes.length}</Text>
        <View style={s.quizPips}>
          {data.quizzes.map((_, i) => (
            <View key={i} style={[s.pip, i < quizIdx && s.pipDone, i === quizIdx && s.pipCurrent]} />
          ))}
        </View>
      </View>

      {/* Prompt with blank */}
      <Animated.View style={[s.promptCard, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={s.promptInstruct}>
          {nativeLang === "korean" ? "빈칸을 채워보세요" : nativeLang === "spanish" ? "Completa el espacio" : "Fill in the blank"}
        </Text>
        <View style={s.promptRow}>
          <Text style={s.promptText}>{promptParts[0]}</Text>
          <View style={[
            s.blankBox,
            quizPhase === "correct" && s.blankCorrect,
            (quizPhase === "wrong" || inputError) && s.blankWrong,
          ]}>
            {quiz.type === "input" && quizPhase === "question" ? (
              <TextInput
                style={s.blankInput}
                value={inputVal}
                onChangeText={(t) => { setInputVal(t); setInputError(false); }}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="???"
                placeholderTextColor={C.goldDim}
                returnKeyType="done"
                onSubmitEditing={() => { if (inputVal.trim()) submitAnswer(inputVal.trim()); }}
              />
            ) : (
              <Text style={[
                s.blankText,
                quizPhase === "correct" && s.blankTextCorrect,
                quizPhase === "wrong"   && s.blankTextWrong,
              ]}>
                {selected ?? quiz.answer}
              </Text>
            )}
          </View>
          {promptParts[1] ? <Text style={s.promptText}>{promptParts[1]}</Text> : null}
        </View>

        {/* Wrong feedback */}
        {quizPhase === "wrong" && (
          <Text style={s.wrongMsg}>{wrongFeedback}</Text>
        )}

        {/* Correct hint */}
        {quizPhase === "correct" && (
          <View style={s.correctRow}>
            <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
            <Text style={s.correctText}>
              {nativeLang === "korean" ? "정답!" : nativeLang === "spanish" ? "¡Correcto!" : "Correct!"}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Options (select type) */}
      {quiz.type === "select" && quizPhase === "question" && (
        <View style={s.optionsGrid}>
          {(quiz.options ?? []).map((opt) => (
            <Pressable
              key={opt}
              style={({ pressed }) => [s.optionBtn, pressed && s.optionBtnPressed]}
              onPress={() => submitAnswer(opt)}
            >
              <Text style={s.optionBtnText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Input submit button */}
      {quiz.type === "input" && quizPhase === "question" && (
        <Pressable
          style={({ pressed }) => [s.checkBtn, pressed && { opacity: 0.85 }]}
          onPress={() => {
            if (!inputVal.trim()) { setInputError(true); return; }
            submitAnswer(inputVal.trim());
          }}
        >
          <Text style={s.checkBtnText}>{checkLabel}</Text>
        </Pressable>
      )}

      {/* Wrong → retry + reveal */}
      {quizPhase === "wrong" && (
        <View style={s.resultBtns}>
          <Pressable style={({ pressed }) => [s.retryBtn, pressed && { opacity: 0.8 }]} onPress={retryQuiz}>
            <Text style={s.retryBtnText}>{retryLabel}</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [s.nextBtn, pressed && { opacity: 0.85 }]} onPress={proceedToSpeak}>
            <Text style={s.nextBtnText}>{nextLabel}</Text>
            <Ionicons name="arrow-forward" size={13} color={C.bg1} />
          </Pressable>
        </View>
      )}

      {/* Correct → proceed to speak */}
      {quizPhase === "correct" && (
        <Pressable style={({ pressed }) => [s.okBtn, pressed && { opacity: 0.85 }]} onPress={proceedToSpeak}>
          <Text style={s.okBtnText}>
            {nativeLang === "korean" ? "따라 말해봐요! →" : nativeLang === "spanish" ? "¡Repítelo! →" : "Now repeat it! →"}
          </Text>
          <Ionicons name="arrow-forward" size={14} color={C.bg1} />
        </Pressable>
      )}

      {/* Speak-after phase */}
      {quizPhase === "speak" && (
        <View style={s.speakBox}>
          {/* Full sentence display */}
          <View style={s.fullSentenceCard}>
            <Text style={s.fullSentenceText}>{quiz.fullSentence}</Text>
            <Text style={s.fullSentenceMeaning}>{getMeaning(quiz.fullSentenceMeaning, lc)}</Text>
          </View>

          {/* Listen + mic row */}
          <View style={s.speakControls}>
            <Pressable style={({ pressed }) => [s.listenBtn, pressed && { opacity: 0.8 }]} onPress={playSpeakTTS}>
              <Ionicons name="volume-high" size={16} color={C.gold} />
              <Text style={s.listenBtnText}>{listenLabel}</Text>
            </Pressable>

            <Animated.View style={{ transform: [{ scale: pulseAnim }], flex: 1 }}>
              <Pressable
                style={({ pressed }) => [
                  s.speakMicBtn,
                  speakPhase === "recording" && s.speakMicActive,
                  (speakPhase === "assessing" || speakPhase === "done") && { opacity: speakPhase === "assessing" ? 0.6 : 1 },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleSpeakMicPress}
                disabled={speakPhase === "assessing"}
              >
                {speakPhase === "assessing"
                  ? <ActivityIndicator size="small" color={C.bg1} />
                  : <Ionicons name={speakPhase === "recording" ? "stop" : "mic"} size={16} color={C.bg1} />
                }
                <Text style={s.speakMicText}>{speakLabel}</Text>
              </Pressable>
            </Animated.View>
          </View>

          {/* Speak score */}
          {speakPhase === "done" && speakScore !== null && (
            <View style={s.speakScoreRow}>
              <Ionicons name="star" size={14} color={C.gold} />
              <Text style={s.speakScoreText}>{speakScore}%</Text>
            </View>
          )}

          {/* Next / skip */}
          <View style={s.speakNav}>
            {speakPhase === "idle" && (
              <Pressable style={({ pressed }) => [s.skipBtn, pressed && { opacity: 0.8 }]} onPress={advanceQuiz}>
                <Text style={s.skipBtnText}>{skipLabel}</Text>
              </Pressable>
            )}
            {speakPhase === "done" && (
              <Pressable style={({ pressed }) => [s.nextBtn, pressed && { opacity: 0.85 }]} onPress={advanceQuiz}>
                <Text style={s.nextBtnText}>{isLast ? doneLabel : nextLabel}</Text>
                <Ionicons name="arrow-forward" size={13} color={C.bg1} />
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { gap: 16 },

  rudyRow:    { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  rudyEmoji:  { fontSize: 32 },
  rudySpeech: { flex: 1, backgroundColor: C.bg2, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.border },
  rudySpeechText: { fontSize: 13, fontFamily: F.body, color: C.parchment, lineHeight: 19 },

  explainCard: {
    backgroundColor: C.bg2, borderRadius: 18, padding: 22,
    borderWidth: 1.5, borderColor: C.gold, gap: 10, alignItems: "center",
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  explainText: { fontSize: 15, fontFamily: F.body, color: C.parchment, lineHeight: 24, textAlign: "center" },

  okBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.gold, paddingVertical: 14, borderRadius: 14,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  okBtnText: { fontSize: 15, fontFamily: F.header, color: C.bg1 },

  quizHeader:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  quizCounter:  { fontSize: 12, fontFamily: F.label, color: C.goldDim },
  quizPips:     { flexDirection: "row", gap: 6 },
  pip:          { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(201,162,39,0.2)", borderWidth: 0.5, borderColor: C.border },
  pipDone:      { backgroundColor: C.goldDim },
  pipCurrent:   { backgroundColor: C.gold, width: 20 },

  promptCard: {
    backgroundColor: C.bg2, borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: C.border, gap: 12,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  promptInstruct: { fontSize: 12, fontFamily: F.label, color: C.goldDim, textAlign: "center" },
  promptRow:      { flexDirection: "row", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: 4 },
  promptText:     { fontSize: 18, fontFamily: F.header, color: C.parchment },
  blankBox: {
    borderBottomWidth: 2, borderBottomColor: C.gold, minWidth: 60,
    paddingHorizontal: 8, paddingVertical: 2, alignItems: "center",
  },
  blankCorrect: { borderBottomColor: "#4caf50" },
  blankWrong:   { borderBottomColor: "#f44336" },
  blankInput: {
    fontSize: 18, fontFamily: F.header, color: C.gold,
    minWidth: 60, textAlign: "center",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } as any : {}),
  },
  blankText:        { fontSize: 18, fontFamily: F.header, color: C.gold },
  blankTextCorrect: { color: "#4caf50" },
  blankTextWrong:   { color: "#f44336" },
  wrongMsg:    { fontSize: 13, fontFamily: F.body, color: "#f44336", textAlign: "center" },
  correctRow:  { flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center" },
  correctText: { fontSize: 13, fontFamily: F.bodySemi, color: "#4caf50" },

  optionsGrid:   { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  optionBtn:     { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg2 },
  optionBtnPressed: { backgroundColor: C.bg3, borderColor: C.gold },
  optionBtnText: { fontSize: 15, fontFamily: F.bodySemi, color: C.parchment },

  checkBtn: {
    backgroundColor: C.gold, paddingVertical: 13, borderRadius: 12, alignItems: "center",
  },
  checkBtnText: { fontSize: 14, fontFamily: F.header, color: C.bg1 },

  resultBtns:   { flexDirection: "row", gap: 10 },
  retryBtn:     { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: C.border, alignItems: "center" },
  retryBtnText: { fontSize: 13, fontFamily: F.bodySemi, color: C.goldDim },
  nextBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    backgroundColor: C.gold, paddingVertical: 12, borderRadius: 12,
  },
  nextBtnText:  { fontSize: 13, fontFamily: F.header, color: C.bg1 },

  speakBox:          { gap: 12 },
  fullSentenceCard:  { backgroundColor: C.bg2, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, alignItems: "center", gap: 6 },
  fullSentenceText:  { fontSize: 18, fontFamily: F.title, color: C.gold, textAlign: "center", letterSpacing: 0.3 },
  fullSentenceMeaning: { fontSize: 12, fontFamily: F.body, color: C.goldDim, fontStyle: "italic", textAlign: "center" },

  speakControls: { flexDirection: "row", gap: 10 },
  listenBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg2,
  },
  listenBtnText: { fontSize: 12, fontFamily: F.bodySemi, color: C.gold },
  speakMicBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: C.gold, paddingVertical: 12, borderRadius: 12,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  speakMicActive: { backgroundColor: "#e55", shadowColor: "#e55" },
  speakMicText: { fontSize: 13, fontFamily: F.header, color: C.bg1 },

  speakScoreRow: { flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center" },
  speakScoreText: { fontSize: 13, fontFamily: F.bodySemi, color: C.gold },

  speakNav: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  skipBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  skipBtnText: { fontSize: 12, fontFamily: F.body, color: C.goldDim },
});
