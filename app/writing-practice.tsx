import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { C, F } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { addPhrases } from "@/lib/srsManager";

const T = {
  title:       { ko: "쓰기 연습", en: "Writing Practice", es: "Practica de Escritura" },
  translate:   { ko: "번역하기", en: "Translate", es: "Traducir" },
  complete:    { ko: "문장 완성", en: "Complete the Sentence", es: "Completa la Oracion" },
  freeWrite:   { ko: "자유 작문", en: "Free Writing", es: "Escritura Libre" },
  placeholder: { ko: "여기에 답을 입력하세요...", en: "Type your answer here...", es: "Escribe tu respuesta aqui..." },
  check:       { ko: "확인", en: "Check", es: "Verificar" },
  next:        { ko: "다음", en: "Next", es: "Siguiente" },
  correct:     { ko: "정답!", en: "Correct!", es: "Correcto!" },
  tryAgain:    { ko: "다시 시도!", en: "Try again!", es: "Intenta de nuevo!" },
  feedback:    { ko: "피드백", en: "Feedback", es: "Comentarios" },
  loading:     { ko: "평가 중...", en: "Evaluating...", es: "Evaluando..." },
  back:        { ko: "뒤로", en: "Back", es: "Volver" },
  score:       { ko: "점수", en: "Score", es: "Puntuacion" },
  prompt:      { ko: "주제에 맞게 자유롭게 쓰세요", en: "Write freely about the topic", es: "Escribe libremente sobre el tema" },
  evalError:   { ko: "평가할 수 없어요. 다시 시도해주세요.", en: "Could not evaluate. Try again.", es: "No se pudo evaluar. Intenta de nuevo." },
  offline:     { ko: "오프라인 — 평가를 할 수 없어요", en: "Offline — evaluation unavailable", es: "Sin conexion — evaluacion no disponible" },
} as const;

function t(obj: Record<string, string>, lang: string) { return obj[lang] || obj.en; }

interface Exercise {
  type: "translate" | "complete" | "free";
  prompt: { ko: string; en: string; es: string };
  answer?: string; // for translate/complete
  hint?: { ko: string; en: string; es: string };
}

const EXERCISES: Exercise[] = [
  // Translation exercises
  { type: "translate", prompt: { ko: "안녕하세요, 만나서 반갑습니다.", en: "Hello, nice to meet you.", es: "Hola, encantado de conocerte." } },
  { type: "translate", prompt: { ko: "오늘 날씨가 좋아요.", en: "The weather is nice today.", es: "El clima esta bonito hoy." } },
  { type: "translate", prompt: { ko: "커피 한 잔 주세요.", en: "One coffee, please.", es: "Un cafe, por favor." } },
  { type: "translate", prompt: { ko: "이것은 얼마입니까?", en: "How much is this?", es: "Cuanto cuesta esto?" } },
  { type: "translate", prompt: { ko: "화장실이 어디에 있어요?", en: "Where is the restroom?", es: "Donde esta el bano?" } },
  // Completion exercises
  { type: "complete", prompt: { ko: "저는 학생___.", en: "I ___ a student.", es: "Yo ___ estudiante." }, answer: "입니다", hint: { ko: "정중한 어미", en: "formal ending", es: "terminacion formal" } },
  { type: "complete", prompt: { ko: "밥을 ___.", en: "I ___ rice.", es: "Yo ___ arroz." }, answer: "먹어요", hint: { ko: "먹다 (정중형)", en: "to eat (polite)", es: "comer (cortes)" } },
  { type: "complete", prompt: { ko: "한국에 ___ 싶어요.", en: "I want to ___ to Korea.", es: "Quiero ___ a Corea." }, answer: "가고", hint: { ko: "가다 + 싶다", en: "to go + want", es: "ir + querer" } },
  // Free writing
  { type: "free", prompt: { ko: "자기 소개를 해보세요", en: "Introduce yourself", es: "Presentate" } },
  { type: "free", prompt: { ko: "오늘 하루를 설명하세요", en: "Describe your day today", es: "Describe tu dia de hoy" } },
  { type: "free", prompt: { ko: "좋아하는 음식에 대해 쓰세요", en: "Write about your favorite food", es: "Escribe sobre tu comida favorita" } },
];

export default function WritingPractice() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nativeLanguage: nativeLang, learningLanguage, updateStats, stats } = useLanguage();
  const lc = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";

  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"writing" | "checking" | "result">("writing");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [completed, setCompleted] = useState(0);

  const exercise = EXERCISES[exerciseIdx % EXERCISES.length];

  const handleCheck = async () => {
    if (!input.trim()) return;
    setPhase("checking");

    if (exercise.type === "complete" && exercise.answer) {
      // Simple check for completion exercises
      const normalized = input.trim().toLowerCase().replace(/[.!?]/g, "");
      const answer = exercise.answer.toLowerCase();
      const correct = normalized.includes(answer);
      setIsCorrect(correct);
      setScore(correct ? 100 : 30);
      setFeedback(correct
        ? t(T.correct, lc)
        : `${t(T.tryAgain, lc)} → ${exercise.answer}`
      );
      setPhase("result");
      Haptics.impactAsync(correct ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy);
      if (correct) {
        setTotalScore((s) => s + 10);
        updateStats({ xp: stats.xp + 5 });
      }
      setCompleted((c) => c + 1);
      return;
    }

    // ── AI evaluation via dedicated /api/writing-eval endpoint ──────────────
    // Bug history: the old code called getApiUrl("/api/chat") (wrong — that
    // function takes no path), so it fetched the root URL, got HTML back,
    // and always fell through to the "offline" error message. Also /api/chat
    // requires tutorId which this screen doesn't have. The dedicated
    // /api/writing-eval endpoint returns {score, feedback, corrections}.
    try {
      const url = new URL("/api/writing-eval", getApiUrl()).toString();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseType: exercise.type,
          promptText: t(exercise.prompt, lc),
          userAnswer: input,
          learningLang: learningLanguage ?? "english",
          nativeLang: lc,
        }),
      });

      if (res.ok) {
        const data = await res.json() as { score?: number; feedback?: string; corrections?: string };
        const s = typeof data.score === "number" ? data.score : 50;
        const fb = data.feedback ?? "";
        const cor = data.corrections ?? "";
        setScore(s);
        setFeedback(cor ? `${fb}\n→ ${cor}` : fb);
        setIsCorrect(s >= 70);
      } else {
        setScore(50);
        setFeedback(t(T.evalError, lc));
        setIsCorrect(false);
      }
    } catch (e) {
      console.warn("[Writing] evaluation failed:", e);
      setScore(50);
      setFeedback(t(T.offline, lc));
      setIsCorrect(false);
    }

    setPhase("result");
    setCompleted((c) => c + 1);
    setTotalScore((s) => s + 5);
    updateStats({ xp: stats.xp + 5 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add wrong answers to SRS
    if (!isCorrect && exercise.type === "translate") {
      const targetLang = learningLanguage === "korean" ? "ko" : learningLanguage === "spanish" ? "es" : "en";
      addPhrases([{
        phrase: exercise.prompt[targetLang as "ko" | "en" | "es"],
        meaning: t(exercise.prompt, lc),
        source: "writing",
      }]).catch((e) => console.warn('[Writing] addPhrases failed:', e));
    }
  };

  const handleNext = () => {
    setExerciseIdx((i) => i + 1);
    setInput("");
    setPhase("writing");
    setFeedback("");
    setIsCorrect(false);
    setScore(0);
  };

  const typeLabels = {
    translate: T.translate,
    complete: T.complete,
    free: T.freeWrite,
  };

  return (
    <LinearGradient colors={[C.bg1, C.bg2]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.gold} />
        </Pressable>
        <Text style={styles.title}>{t(T.title, lc)}</Text>
        <Text style={styles.counter}>{completed}/10</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Exercise Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>
            <Text style={{ fontFamily: "System" }}>{exercise.type === "translate" ? "📝" : exercise.type === "complete" ? "✏️" : "📖"}</Text>{" "}
            {t(typeLabels[exercise.type], lc)}
          </Text>
        </View>

        {/* Prompt */}
        <View style={styles.promptCard}>
          <Text style={styles.promptText}>{t(exercise.prompt, lc)}</Text>
          {exercise.type === "free" && (
            <Text style={styles.promptHint}>{t(T.prompt, lc)}</Text>
          )}
          {exercise.hint && (
            <Text style={styles.promptHint}><Text style={{ fontFamily: "System" }}>💡</Text> {t(exercise.hint, lc)}</Text>
          )}
        </View>

        {/* Input */}
        <TextInput
          style={[styles.input, phase !== "writing" && styles.inputDisabled]}
          placeholder={t(T.placeholder, lc)}
          placeholderTextColor={C.goldDark}
          value={input}
          onChangeText={setInput}
          multiline
          editable={phase === "writing"}
          textAlignVertical="top"
        />

        {/* Action Button */}
        {phase === "writing" && (
          <Pressable
            style={[styles.checkBtn, !input.trim() && styles.checkBtnDisabled]}
            onPress={handleCheck}
            disabled={!input.trim()}
          >
            <Text style={styles.checkBtnText}>{t(T.check, lc)}</Text>
          </Pressable>
        )}

        {phase === "checking" && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={C.gold} />
            <Text style={styles.loadingText}>{t(T.loading, lc)}</Text>
          </View>
        )}

        {/* Result */}
        {phase === "result" && (
          <View style={styles.resultCard}>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreEmoji, isCorrect ? {} : { opacity: 0.6 }]}>
                {isCorrect ? "🎉" : "📝"}
              </Text>
              <Text style={[styles.scoreText, { color: isCorrect ? C.success : C.gold }]}>
                {t(T.score, lc)}: {score}/100
              </Text>
            </View>
            <Text style={styles.feedbackText}>{feedback}</Text>
            <Pressable style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>{t(T.next, lc)}</Text>
              <Ionicons name="arrow-forward" size={18} color={C.bg1} />
            </Pressable>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, padding: 4 },
  title: { fontFamily: F.header, fontSize: 20, color: C.gold, letterSpacing: 1 },
  counter: { fontFamily: F.bodySemi, fontSize: 15, color: C.goldDim, width: 40, textAlign: "right" },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
  },
  typeText: { fontFamily: F.bodySemi, fontSize: 13, color: C.goldDim },
  promptCard: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.gold,
    padding: 18,
    marginBottom: 16,
  },
  promptText: { fontFamily: F.bodyBold, fontSize: 18, color: C.parchment, lineHeight: 26 },
  promptHint: { fontFamily: F.body, fontSize: 13, color: C.goldDim, marginTop: 8, fontStyle: "italic" },
  input: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    fontFamily: F.body,
    fontSize: 16,
    color: C.parchment,
    minHeight: 120,
    marginBottom: 16,
  },
  inputDisabled: { opacity: 0.6 },
  checkBtn: {
    backgroundColor: C.gold,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  checkBtnDisabled: { opacity: 0.4 },
  checkBtnText: { fontFamily: F.header, fontSize: 16, color: C.bg1, letterSpacing: 0.5 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: { fontFamily: F.body, fontSize: 15, color: C.goldDim },
  resultCard: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    gap: 12,
  },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  scoreEmoji: { fontSize: 28 },
  scoreText: { fontFamily: F.header, fontSize: 20 },
  feedbackText: { fontFamily: F.body, fontSize: 14, color: C.parchment, lineHeight: 20 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.gold,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  nextBtnText: { fontFamily: F.header, fontSize: 15, color: C.bg1 },
});
