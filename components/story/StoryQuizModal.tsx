import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Modal, Pressable, ScrollView,
  TextInput, ActivityIndicator, Animated, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import { C, F } from "@/constants/theme";
import type { LoadedQuiz, LangCode, StoneEffect, VoicePowerContent, DebateBattleContent, NpcRescueContent } from "@/constants/storyTypes";
import { fillGptPrompt, addToExpressionBook, trackQuizIO, markExpressionsMastered } from "@/lib/storyUtils";
import { getApiUrl, apiRequest } from "@/lib/query-client";
import { checkAnswer as checkSpelling } from "@/lib/answerUtils";

// ─── Quiz UI i18n ────────────────────────────────────────────────────────────

type QL = "ko" | "es" | "en";
const QT: Record<string, Record<QL, string>> = {
  checkAnswers:   { ko: "정답 확인 ✓",         es: "Comprobar ✓",             en: "Check Answers ✓" },
  arrangeWords:   { ko: "단어를 올바른 순서로 배열하세요:", es: "Ordena las palabras en la oración correcta:", en: "Arrange the words into the correct sentence:" },
  tapWords:       { ko: "아래 단어를 탭하여 문장을 만드세요", es: "Toca las palabras abajo para formar la oración", en: "Tap words below to build the sentence" },
  check:          { ko: "확인 ✓",              es: "Comprobar ✓",             en: "Check ✓" },
  playing:        { ko: "재생 중...",           es: "Reproduciendo...",        en: "Playing..." },
  playRecording:  { ko: "녹음 재생",           es: "Reproducir grabación",    en: "Play Recording" },
  typeAnswer:     { ko: "답을 입력하세요...",    es: "Escribe tu respuesta...", en: "Type your answer..." },
  submit:         { ko: "제출 ✓",              es: "Enviar ✓",               en: "Submit ✓" },
  submitted:      { ko: "제출 완료! 연습을 계속하세요.", es: "¡Enviado! Sigue practicando.", en: "Submitted! Keep practising." },
  requiredWords:  { ko: "필수 단어:",           es: "Palabras requeridas:",    en: "Required words:" },
  readAloud:      { ko: "다음 문장을 소리 내어 읽으세요:", es: "Lee la siguiente oración en voz alta:", en: "Read the following sentence aloud:" },
  noSentences:    { ko: "문장을 찾을 수 없습니다.", es: "No se encontraron oraciones.", en: "No sentences found." },
  submitReview:   { ko: "검토 제출 ✓",         es: "Enviar para revisión ✓",  en: "Submit for Review ✓" },
  yourAnswer:     { ko: "답변...",              es: "Tu respuesta...",         en: "Your answer..." },
  translateTo:    { ko: "번역하세요:",          es: "Traduce a:",              en: "Translate to:" },
  submitArgument: { ko: "주장 제출",            es: "Enviar argumento",        en: "Submit Argument" },
  typeArgument:   { ko: "반론을 입력하세요…",    es: "Escribe tu contraargumento…", en: "Type your counter-argument…" },
  listening:      { ko: "듣는 중…",             es: "Escuchando…",             en: "Listening…" },
  blank:          { ko: "빈칸",                 es: "Espacio",                 en: "Blank" },
};
function qt(key: string, lang: LangCode): string {
  const entry = QT[key];
  if (!entry) return key;
  return entry[lang as QL] ?? entry.en;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  quiz: LoadedQuiz | null;
  visible: boolean;
  onComplete: (xpEarned: number) => void;
  onDismiss: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalise(s: string) {
  return s.toLowerCase().trim().replace(/[.,!?]/g, "");
}

/** Resolve `right` or `wrongOptions` that may be a string or a LocalizedText object */
function resolveLocalized(
  val: string | Record<string, string> | Record<string, string[]> | string[] | undefined,
  lang: LangCode,
  fallback: string = ""
): string {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val[0] ?? fallback;
  const obj = val as Record<string, unknown>;
  if (typeof obj[lang] === "string") return obj[lang] as string;
  if (typeof obj["en"] === "string") return obj["en"] as string;
  return fallback;
}

function resolveLocalizedArray(
  val: string[] | Record<string, string[]> | undefined,
  lang: LangCode
): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const obj = val as Record<string, string[]>;
  return obj[lang] ?? obj["en"] ?? [];
}

/** Play TTS via Azure (through backend) */
async function playTTS(
  script: string,
  voice: string,
  apiBase: string,
  onPlay?: (v: boolean) => void,
  lang?: string,
) {
  const url = new URL("/api/pronunciation-tts", apiBase);
  url.searchParams.set("text", script);
  // Derive lang from voice name if not explicitly given (e.g. "ko-KR-SunHiNeural" → "ko-KR")
  const ttsLang = lang || (voice ? voice.split("-").slice(0, 2).join("-") : "en-US");
  url.searchParams.set("lang", ttsLang);
  if (voice) url.searchParams.set("voice", voice);
  onPlay?.(true);
  try {
    if (Platform.OS === "web") {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
      audio.volume = 1.0;
      audio.onended = () => { URL.revokeObjectURL(objectUrl); onPlay?.(false); };
      audio.onerror = () => { URL.revokeObjectURL(objectUrl); onPlay?.(false); };
      await audio.play();
    } else {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: url.toString() },
        { shouldPlay: true, volume: 1.0 }
      );
      sound.setOnPlaybackStatusUpdate((st) => {
        if ("didJustFinish" in st && st.didJustFinish) {
          onPlay?.(false);
          sound.unloadAsync().catch((e) => console.warn('[StoryQuiz] TTS audio unload failed:', e));
        }
      });
    }
  } catch (e) {
    console.warn('[Audio] TTS playback failed:', e);
    onPlay?.(false);
  }
}

/** Call GPT with a prompt and user message */
async function callGPT(systemPrompt: string, userMessage: string): Promise<string> {
  try {
    const res = await apiRequest("POST", "/api/quiz-evaluate", { systemPrompt, userMessage });
    const data = await res.json() as { reply?: string };
    return data?.reply ?? "";
  } catch (e) {
    console.warn('[API] quiz evaluation request failed:', e);
    return "";
  }
}

// ─── Result Screen ─────────────────────────────────────────────────────────────

function ResultView({
  xp, correct, total, badge, nativeLang, onContinue,
}: {
  xp: number; correct: number; total: number; badge?: string; nativeLang: LangCode; onContinue: () => void;
}) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const pct = total > 0 ? Math.round((correct / total) * 100) : 100;
  const passed = pct >= 60;

  return (
    <Animated.View style={[styles.resultContainer, { transform: [{ scale }], opacity }]}>
      <Text style={styles.resultEmoji}>{passed ? "🎉" : "💪"}</Text>
      <Text style={styles.resultTitle}>
        {passed
          ? (nativeLang === "ko" ? "잘했어요!" : nativeLang === "es" ? "¡Buen trabajo!" : "Great job!")
          : (nativeLang === "ko" ? "계속 도전해요!" : nativeLang === "es" ? "¡Sigue intentando!" : "Keep trying!")}
      </Text>
      <Text style={styles.resultScore}>{pct}%</Text>
      <Text style={styles.resultSub}>
        {correct}/{total} {nativeLang === "ko" ? "정답" : nativeLang === "es" ? "correctas" : "correct"}
      </Text>
      <View style={styles.xpBubble}>
        <Text style={styles.xpText}>+{xp} XP</Text>
      </View>
      {badge && (
        <View style={styles.badgeBubble}>
          <Text style={styles.badgeText}>🏅 {badge}</Text>
        </View>
      )}
      <Pressable style={styles.continueBtn} onPress={onContinue}>
        <Text style={styles.continueBtnText}>
          {nativeLang === "ko" ? "계속하기 →" : nativeLang === "es" ? "Continuar →" : "Continue →"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Matching Quiz ─────────────────────────────────────────────────────────────

interface MatchPair {
  left: string;
  right: string;
  choices: string[];
}

function buildMatchPairs(content: Record<string, unknown>, targetLang: LangCode): MatchPair[] {
  const pairs = (content.pairs as unknown[]) ?? [];
  return pairs.map((p) => {
    const pair = p as Record<string, unknown>;
    const left = String(pair.left ?? "");
    const right = resolveLocalized(pair.right as string | Record<string, string>, targetLang);
    const wrongs = resolveLocalizedArray(
      pair.wrongOptions as string[] | Record<string, string[]>,
      targetLang
    );
    const choices = shuffle([right, ...wrongs.slice(0, 3)]);
    return { left, right, choices };
  });
}

function MatchingQuizView({
  content, targetLang, nativeLang,
  onDone,
}: {
  content: Record<string, unknown>;
  targetLang: LangCode;
  nativeLang: LangCode;
  onDone: (correct: number, total: number) => void;
}) {
  const pairs = buildMatchPairs(content, targetLang);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correct, setCorrect] = useState(0);

  const pair = pairs[idx];

  function handleSelect(choice: string) {
    if (feedback) return;
    setSelected(choice);
    const isCorrect = normalise(choice) === normalise(pair.right);
    setFeedback(isCorrect ? "correct" : "wrong");
    Haptics.impactAsync(isCorrect ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    if (isCorrect) setCorrect(c => c + 1);
    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      if (idx + 1 >= pairs.length) {
        onDone(isCorrect ? correct + 1 : correct, pairs.length);
      } else {
        setIdx(i => i + 1);
      }
    }, 900);
  }

  return (
    <View style={styles.quizBody}>
      <Text style={styles.progressLabel}>{idx + 1} / {pairs.length}</Text>
      <View style={styles.matchLeft}>
        <Text style={styles.matchLeftText}>{pair.left}</Text>
      </View>
      <Text style={styles.matchArrow}>↓</Text>
      <View style={styles.choicesGrid}>
        {pair.choices.map((ch) => {
          const isSelected = selected === ch;
          const isCorrectChoice = normalise(ch) === normalise(pair.right);
          let bg = C.bg2;
          if (isSelected && feedback === "correct") bg = "#2e7d32";
          else if (isSelected && feedback === "wrong") bg = "#c62828";
          else if (feedback === "wrong" && isCorrectChoice) bg = "#2e7d32";
          return (
            <Pressable
              key={ch}
              style={[styles.choiceBtn, { backgroundColor: bg }]}
              onPress={() => handleSelect(ch)}
            >
              <Text style={[styles.choiceBtnText, isSelected && { color: "#fff" }]}>{ch}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Fill Blank Quiz ───────────────────────────────────────────────────────────

interface BlankQ {
  id: number;
  answer: string;
  options: string[];
  hint: Record<string, string>;
}

function FillBlankQuizView({
  content, nativeLang,
  onDone,
}: {
  content: Record<string, unknown>;
  nativeLang: LangCode;
  onDone: (correct: number, total: number) => void;
}) {
  const nl = nativeLang;
  const passage = String(content.passage ?? "");
  const blanks: BlankQ[] = (content.blanks as BlankQ[]) ?? [];
  const [answers, setAnswers] = useState<Record<number, string | null>>({});
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);

  function selectAnswer(id: number, choice: string) {
    if (done) return;
    setAnswers(a => ({ ...a, [id]: choice }));
  }

  function checkAnswers() {
    setChecking(true);
    const correct = blanks.filter(b => normalise(answers[b.id] ?? "") === normalise(b.answer)).length;
    setDone(true);
    setTimeout(() => onDone(correct, blanks.length), 1500);
  }

  const allFilled = blanks.length > 0 && blanks.every(b => answers[b.id] != null);

  function renderPassage() {
    const parts = passage.split(/_+\(\d+\)_+/);
    return (
      <Text style={styles.passageText}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <Text>{part}</Text>
            {i < blanks.length && (
              <Text style={[
                styles.blankSlot,
                answers[blanks[i].id] != null && { backgroundColor: C.gold + "33" },
                done && normalise(answers[blanks[i].id] ?? "") === normalise(blanks[i].answer) && { backgroundColor: "#2e7d3233" },
                done && normalise(answers[blanks[i].id] ?? "") !== normalise(blanks[i].answer) && answers[blanks[i].id] != null && { backgroundColor: "#c6282833" },
              ]}>
                {answers[blanks[i].id] ?? "___"}
              </Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    );
  }

  const [activeBlank, setActiveBlank] = useState<number>(0);
  const blank = blanks[activeBlank];

  return (
    <ScrollView style={styles.quizBodyScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.passageBox}>{renderPassage()}</View>

      {blank && (
        <View style={styles.blankSection}>
          <Text style={styles.blankNum}>{qt("blank", nl)} {blank.id}</Text>
          {blank.hint && (
            <Text style={styles.hintText}>💡 {blank.hint[nativeLang] ?? blank.hint.en ?? ""}</Text>
          )}
          <View style={styles.choicesGrid}>
            {blank.options.map((opt) => {
              const chosen = answers[blank.id] === opt;
              let bg = C.bg2;
              if (done && chosen && normalise(opt) === normalise(blank.answer)) bg = "#2e7d32";
              else if (done && chosen && normalise(opt) !== normalise(blank.answer)) bg = "#c62828";
              else if (done && normalise(opt) === normalise(blank.answer)) bg = "#2e7d32";
              else if (chosen) bg = C.gold;
              return (
                <Pressable key={opt} style={[styles.choiceBtn, { backgroundColor: bg }]}
                  onPress={() => {
                    selectAnswer(blank.id, opt);
                    if (activeBlank < blanks.length - 1) setActiveBlank(i => i + 1);
                  }}>
                  <Text style={[styles.choiceBtnText, (chosen || (done && normalise(opt) === normalise(blank.answer))) && { color: "#fff" }]}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.blankNav}>
            {blanks.map((b, i) => (
              <Pressable key={b.id} onPress={() => setActiveBlank(i)}
                style={[styles.blankDot, i === activeBlank && styles.blankDotActive,
                  answers[b.id] != null && styles.blankDotFilled]}>
                <Text style={styles.blankDotNum}>{b.id}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {allFilled && !done && (
        <Pressable style={styles.submitBtn} onPress={checkAnswers}>
          <Text style={styles.submitBtnText}>{qt("checkAnswers", nl)}</Text>
        </Pressable>
      )}
      {checking && <ActivityIndicator style={{ marginTop: 16 }} color={C.gold} />}
    </ScrollView>
  );
}

// ─── Word Rearrange Quiz ───────────────────────────────────────────────────────

interface RearrangeQ {
  scrambled: string[];
  answer: string;
  hint: Record<string, string>;
}

function WordRearrangeView({
  content, nativeLang, onDone,
}: {
  content: Record<string, unknown>;
  nativeLang: LangCode;
  onDone: (correct: number, total: number) => void;
}) {
  const questions: RearrangeQ[] = (content.questions as RearrangeQ[]) ?? [];
  const [qIdx, setQIdx] = useState(0);
  const [bank, setBank] = useState(() => shuffle(questions[0]?.scrambled ?? []));
  const [built, setBuilt] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "penalized" | null>(null);
  const [correct, setCorrect] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintUsedThisQ, setHintUsedThisQ] = useState(false);

  const q = questions[qIdx];

  useEffect(() => {
    setBank(shuffle(q?.scrambled ?? []));
    setBuilt([]);
    setFeedback(null);
    setShowHint(false);
    setHintUsedThisQ(false);
  }, [qIdx]);

  function tapWord(word: string, from: "bank" | "built", idx: number) {
    if (feedback) return;
    if (from === "bank") {
      setBuilt(b => [...b, word]);
      setBank(bk => { const a = [...bk]; a.splice(idx, 1); return a; });
    } else {
      setBank(bk => [...bk, word]);
      setBuilt(bt => { const a = [...bt]; a.splice(idx, 1); return a; });
    }
  }

  function checkAnswer() {
    const userAnswer = built.join(" ");
    const isCorrect = normalise(userAnswer) === normalise(q.answer);
    const penalized = isCorrect && hintUsedThisQ;
    setFeedback(penalized ? "penalized" : isCorrect ? "correct" : "wrong");
    Haptics.impactAsync(isCorrect ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    if (isCorrect && !hintUsedThisQ) setCorrect(c => c + 1);
    setTimeout(() => {
      if (qIdx + 1 >= questions.length) {
        onDone(isCorrect && !hintUsedThisQ ? correct + 1 : correct, questions.length);
      } else {
        setQIdx(i => i + 1);
      }
    }, 1000);
  }

  return (
    <View style={styles.quizBody}>
      <Text style={styles.progressLabel}>{qIdx + 1} / {questions.length}</Text>
      <Text style={styles.instructionText}>{qt("arrangeWords", nativeLang)}</Text>

      {/* Built sentence */}
      <View style={styles.builtBox}>
        {built.length === 0
          ? <Text style={styles.builtPlaceholder}>{qt("tapWords", nativeLang)}</Text>
          : <View style={styles.wordRow}>
              {built.map((w, i) => (
                <Pressable key={`${w}-${i}`} style={styles.wordChipBuilt} onPress={() => tapWord(w, "built", i)}>
                  <Text style={styles.wordChipText}>{w}</Text>
                </Pressable>
              ))}
            </View>
        }
      </View>

      {/* Word bank */}
      <View style={styles.wordBank}>
        {bank.map((w, i) => (
          <Pressable key={`${w}-${i}`} style={styles.wordChip} onPress={() => tapWord(w, "bank", i)}>
            <Text style={styles.wordChipText}>{w}</Text>
          </Pressable>
        ))}
      </View>

      {/* Hint */}
      <Pressable onPress={() => { setShowHint(h => !h); setHintUsedThisQ(true); }} style={styles.hintToggle}>
        <Text style={styles.hintToggleText}>
          💡 {showHint ? "Hide hint" : "Show hint"}{hintUsedThisQ ? " ⚠️ -XP" : ""}
        </Text>
      </Pressable>
      {showHint && q.hint && (
        <Text style={styles.hintText}>{q.hint[nativeLang] ?? q.hint.en}</Text>
      )}

      {/* Feedback */}
      {feedback && (
        <View style={[styles.feedbackBanner, {
          backgroundColor: feedback === "correct" ? "#2e7d32" : feedback === "penalized" ? "#f57c00" : "#c62828",
        }]}>
          <Text style={styles.feedbackText}>
            {feedback === "correct" ? "✓ Correct!" : feedback === "penalized" ? "✓ Correct — hint used, no XP 💡" : `✗ Answer: ${q.answer}`}
          </Text>
        </View>
      )}

      {built.length > 0 && !feedback && (
        <Pressable style={styles.submitBtn} onPress={checkAnswer}>
          <Text style={styles.submitBtnText}>{qt("check", nativeLang)}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Listening Quiz ────────────────────────────────────────────────────────────

interface ListenQ {
  question: Record<string, string> | string;
  answer: string;
  acceptableAnswers?: string[];
}

function ListeningQuizView({
  content, targetLang, nativeLang, onDone,
}: {
  content: Record<string, unknown>;
  targetLang: LangCode;
  nativeLang: LangCode;
  onDone: (correct: number, total: number) => void;
}) {
  const apiBase = getApiUrl();
  const ttsScript = String(content.ttsScript ?? "");
  const ttsVoice = String(content.ttsVoice ?? "en-GB-SoniaNeural");
  const questions: ListenQ[] = (content.questions as ListenQ[]) ?? [];
  const [playing, setPlaying] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correct, setCorrect] = useState(0);

  async function play() {
    await playTTS(ttsScript, ttsVoice, apiBase, setPlaying);
  }

  function checkAnswer() {
    const q = questions[qIdx];
    const acceptable = q.acceptableAnswers ?? [];
    const langMap: Record<string, string> = { en: "english", es: "spanish", ko: "korean" };
    const learningLang = langMap[targetLang] ?? "english";
    const result = checkSpelling(input, q.answer, { acceptableAnswers: acceptable, learningLang });
    const isCorrect = result.correct;
    setFeedback(isCorrect ? "correct" : "wrong");
    Haptics.impactAsync(isCorrect ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    const newCorrect = isCorrect ? correct + 1 : correct;
    if (isCorrect) setCorrect(newCorrect);
    setTimeout(() => {
      setFeedback(null);
      setInput("");
      if (qIdx + 1 >= questions.length) {
        onDone(newCorrect, questions.length);
      } else {
        setQIdx(i => i + 1);
      }
    }, 1000);
  }

  const q = questions[qIdx];
  const qText = q
    ? (typeof q.question === "string" ? q.question : (q.question[nativeLang] ?? q.question.en ?? ""))
    : "";

  return (
    <View style={styles.quizBody}>
      <Pressable style={[styles.ttsBtn, playing && styles.ttsBtnActive]} onPress={play}>
        <Ionicons name={playing ? "volume-high" : "play-circle"} size={32} color={playing ? "#fff" : C.gold} />
        <Text style={[styles.ttsBtnText, playing && { color: "#fff" }]}>
          {playing ? qt("playing", nativeLang) : qt("playRecording", nativeLang)}
        </Text>
      </Pressable>

      <Text style={styles.instructionText}>{qText}</Text>

      <TextInput
        style={styles.textInput}
        value={input}
        onChangeText={setInput}
        placeholder={qt("typeAnswer", nativeLang)}
        placeholderTextColor={C.textMuted}
        returnKeyType="done"
        onSubmitEditing={checkAnswer}
      />

      {feedback && (
        <View style={[styles.feedbackBanner, { backgroundColor: feedback === "correct" ? "#2e7d32" : "#c62828" }]}>
          <Text style={styles.feedbackText}>
            {feedback === "correct" ? "✓ Correct!" : `✗ Answer: ${q.answer}`}
          </Text>
        </View>
      )}

      {!feedback && input.length > 0 && (
        <Pressable style={styles.submitBtn} onPress={checkAnswer}>
          <Text style={styles.submitBtnText}>{qt("submit", nativeLang)}</Text>
        </Pressable>
      )}

      <Text style={styles.progressLabel}>{qIdx + 1} / {questions.length}</Text>
    </View>
  );
}

// ─── Riddle Quiz ───────────────────────────────────────────────────────────────

interface RiddleQ {
  text: string;
  answer: string;
  acceptableAnswers?: string[];
}

function RiddleQuizView({
  content, gptPrompt, targetLang, nativeLang, onDone,
}: {
  content: Record<string, unknown>;
  gptPrompt?: string;
  targetLang: LangCode;
  nativeLang: LangCode;
  onDone: (correct: number, total: number) => void;
}) {
  const riddles: RiddleQ[] = (content.riddles as RiddleQ[]) ?? [];
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [correct, setCorrect] = useState(0);

  const riddle = riddles[idx];

  async function checkAnswer() {
    if (!riddle || !input.trim()) return;
    const acceptable = riddle.acceptableAnswers ?? [riddle.answer];
    const isCorrect = acceptable.some(a => normalise(a) === normalise(input));

    if (isCorrect) {
      setFeedback("✓ Correct!");
      setCorrect(c => c + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(advance, 1200);
      return;
    }

    if (gptPrompt) {
      setLoading(true);
      const prompt = fillGptPrompt(gptPrompt, {
        targetLang, nativeLang,
      });
      const res = await callGPT(prompt, input);
      setLoading(false);
      try {
        const json = JSON.parse(res.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
        if (json.correct) {
          setFeedback("✓ Correct!");
          setCorrect(c => c + 1);
          setTimeout(advance, 1200);
        } else {
          setFeedback(json.feedback ?? "✗ Not quite. Try again!");
        }
        return;
      } catch (e) { console.warn('[API] riddle answer parse failed:', e); /* fall through */ }
    }

    setFeedback(`✗ Not quite. Answer: ${riddle.answer}`);
    setTimeout(advance, 2000);
  }

  function advance() {
    setFeedback(null);
    setInput("");
    if (idx + 1 >= riddles.length) {
      onDone(correct, riddles.length);
    } else {
      setIdx(i => i + 1);
    }
  }

  if (!riddle) return null;

  return (
    <View style={styles.quizBody}>
      <Text style={styles.progressLabel}>{idx + 1} / {riddles.length}</Text>
      <View style={styles.riddleBox}>
        <Text style={styles.riddleEmoji}>🔍</Text>
        <Text style={styles.riddleText}>{riddle.text}</Text>
      </View>
      <TextInput
        style={styles.textInput}
        value={input}
        onChangeText={setInput}
        placeholder={qt("yourAnswer", nativeLang)}
        placeholderTextColor={C.textMuted}
        returnKeyType="done"
        onSubmitEditing={checkAnswer}
      />
      {loading && <ActivityIndicator color={C.gold} style={{ marginTop: 12 }} />}
      {feedback && (
        <View style={[styles.feedbackBanner, {
          backgroundColor: feedback.startsWith("✓") ? "#2e7d32" : "#8B4513",
        }]}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}
      {!loading && !feedback && input.length > 0 && (
        <Pressable style={styles.submitBtn} onPress={checkAnswer}>
          <Text style={styles.submitBtnText}>{qt("submit", nativeLang)}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Roleplay Quiz (GPT-4o Chat) ───────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "npc";
  text: string;
}

function RoleplayQuizView({
  quiz, onDone,
}: {
  quiz: LoadedQuiz;
  onDone: (correct: number, total: number) => void;
}) {
  const content = quiz.content as Record<string, unknown>;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [ordersComplete, setOrdersComplete] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const systemPrompt = fillGptPrompt(quiz.gptPrompt ?? "", {
    targetLang: quiz.targetLang,
    nativeLang: quiz.nativeLang,
  });

  const keyPhrases: string[] = (content.keyPhrases as string[]) ?? [];
  const vocab: string[] = (content.foodVocab as string[]) ?? [];

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const history = messages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      const rawRes = await apiRequest("POST", "/api/quiz-roleplay", {
        npcSystemPrompt: systemPrompt,
        userMessage: userMsg,
        history,
      });
      const res = await rawRes.json() as {
        reply?: string; score?: number; ordersCompleted?: number;
        secretRevealed?: boolean; clueRevealed?: boolean;
      };
      const npcText = res?.reply ?? "...";
      setMessages(m => [...m, { role: "npc", text: npcText }]);
      if (res?.score != null) setScore(res.score);
      if (res?.ordersCompleted != null) setOrdersComplete(res.ordersCompleted);
      if (res?.secretRevealed || res?.clueRevealed) {
        setTimeout(() => onDone(1, 1), 1500);
      }
    } catch (e) {
      console.warn('[API] NPC chat request failed:', e);
      setMessages(m => [...m, { role: "npc", text: "..." }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <View style={[styles.quizBody, { paddingBottom: 0 }]}>
      {/* Vocab hints */}
      {(vocab.length > 0 || keyPhrases.length > 0) && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vocabRow}>
          {vocab.map(v => <View key={v} style={styles.vocabChip}><Text style={styles.vocabChipText}>{v}</Text></View>)}
          {keyPhrases.map(p => <View key={p} style={[styles.vocabChip, { backgroundColor: C.gold + "22" }]}><Text style={styles.vocabChipText}>{p}</Text></View>)}
        </ScrollView>
      )}

      {/* Progress */}
      {ordersComplete > 0 && (
        <Text style={styles.progressLabel}>
          {quiz.nativeLang === "ko" ? `주문: ${ordersComplete}/3 ✓` : quiz.nativeLang === "es" ? `Pedidos: ${ordersComplete}/3 ✓` : `Orders: ${ordersComplete}/3 ✓`}
        </Text>
      )}

      {/* Chat */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <Text style={styles.chatPlaceholder}>
            {quiz.nativeLang === "ko" ? "대화를 시작하세요..." : quiz.nativeLang === "es" ? "Inicia la conversación..." : "Start the conversation..."}
          </Text>
        )}
        {messages.map((m, i) => (
          <View key={i} style={[styles.chatBubble, m.role === "user" ? styles.chatUser : styles.chatNpc]}>
            <Text style={[styles.chatBubbleText, m.role === "npc" && { color: C.parchment }]}>{m.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.chatNpc}>
            <ActivityIndicator size="small" color={C.gold} />
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.chatInputRow}>
        <TextInput
          style={styles.chatInput}
          value={input}
          onChangeText={setInput}
          placeholder="Type in target language..."
          placeholderTextColor={C.textMuted}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          multiline
        />
        <Pressable style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Writing Quiz (GPT-4o Evaluation) ─────────────────────────────────────────

interface WritePrompt {
  image: string;
  description: string;
  requiredVocab: string[];
  minSentences: number;
}

function WritingQuizView({
  quiz, onDone,
}: {
  quiz: LoadedQuiz;
  onDone: (correct: number, total: number) => void;
}) {
  const content = quiz.content as Record<string, unknown>;
  const prompts: WritePrompt[] = (content.prompts as WritePrompt[]) ?? [];
  const [pIdx, setPIdx] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const prompt = prompts[pIdx];

  async function submit() {
    if (!input.trim() || loading) return;
    setLoading(true);
    const sysPrompt = fillGptPrompt(quiz.gptPrompt ?? "", {
      targetLang: quiz.targetLang,
      nativeLang: quiz.nativeLang,
      requiredVocab: prompt.requiredVocab.join(", "),
      minSentences: String(prompt.minSentences),
    });
    const res = await callGPT(sysPrompt, input);
    setLoading(false);
    try {
      const json = JSON.parse(res.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
      setScore(json.score ?? 0);
      setFeedback(json.feedback ?? "Evaluated!");
      if ((json.score ?? 0) >= 60) setCorrect(c => c + 1);
    } catch (e) {
      console.warn('[API] writing evaluation parse failed:', e);
      setFeedback(qt("submitted", quiz.nativeLang));
    }
  }

  function advance() {
    setInput("");
    setFeedback(null);
    setScore(null);
    if (pIdx + 1 >= prompts.length) {
      onDone(correct, prompts.length);
    } else {
      setPIdx(i => i + 1);
    }
  }

  if (!prompt) return null;

  const imageEmoji: Record<string, string> = {
    beach_scene: "🏖️", market_scene: "🛒", night_scene: "🌙",
  };

  return (
    <ScrollView style={styles.quizBodyScroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.progressLabel}>{pIdx + 1} / {prompts.length}</Text>
      <View style={styles.writePromptBox}>
        <Text style={styles.writeEmoji}>{imageEmoji[prompt.image] ?? "🖼️"}</Text>
        <Text style={styles.writeDesc}>{prompt.description}</Text>
        <Text style={styles.writeVocabLabel}>{qt("requiredWords", quiz.nativeLang)}</Text>
        <View style={styles.writeVocabRow}>
          {prompt.requiredVocab.map(v => (
            <View key={v} style={styles.vocabChip}><Text style={styles.vocabChipText}>{v}</Text></View>
          ))}
        </View>
        <Text style={styles.writeMeta}>Min. {prompt.minSentences} sentences</Text>
      </View>

      <TextInput
        style={styles.writeInput}
        value={input}
        onChangeText={setInput}
        multiline
        numberOfLines={5}
        placeholder={`Describe in ${quiz.targetLang === "ko" ? "Korean" : quiz.targetLang === "es" ? "Spanish" : "English"}...`}
        placeholderTextColor={C.textMuted}
        textAlignVertical="top"
      />

      {loading && <ActivityIndicator color={C.gold} style={{ marginVertical: 12 }} />}

      {feedback && (
        <View style={styles.writeFeedbackBox}>
          {score != null && (
            <Text style={styles.writeScore}>{score}/100</Text>
          )}
          <Text style={styles.writeFeedback}>{feedback}</Text>
          <Pressable style={styles.submitBtn} onPress={advance}>
            <Text style={styles.submitBtnText}>
              {quiz.nativeLang === "ko" ? "다음 →" : quiz.nativeLang === "es" ? "Siguiente →" : "Next →"}
            </Text>
          </Pressable>
        </View>
      )}

      {!loading && !feedback && input.trim().length > 10 && (
        <Pressable style={styles.submitBtn} onPress={submit}>
          <Text style={styles.submitBtnText}>{qt("submitReview", quiz.nativeLang)}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

// ─── Timed / Mixed Boss Quiz ───────────────────────────────────────────────────

interface TimedRound {
  type: string;
  question?: string;
  answer?: string;
  options?: string[];
  ttsScript?: string;
  ttsVoice?: string;
  acceptableAnswers?: string[];
  source?: Record<string, string>;
  prompt?: string;
  text?: string;
}

function TimedBossView({
  quiz, onDone,
}: {
  quiz: LoadedQuiz;
  onDone: (correct: number, total: number) => void;
}) {
  const content = quiz.content as Record<string, unknown>;
  const rounds: TimedRound[] = (content.rounds as TimedRound[]) ?? [];
  const timeLimit = quiz.timeLimit ?? 60;
  const apiBase = getApiUrl();
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correct, setCorrect] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (expired) return;
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { clearInterval(t); setExpired(true); onDone(correct, rounds.length); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [expired]);

  const r = rounds[round];
  if (!r || expired) return null;

  const urgentColor = timeLeft <= 10 ? "#c62828" : timeLeft <= 20 ? "#f57c00" : C.gold;

  function advance(wasCorrect: boolean) {
    const newC = wasCorrect ? correct + 1 : correct;
    setCorrect(newC);
    setFeedback(null);
    setInput("");
    setSelected(null);
    if (round + 1 >= rounds.length) {
      onDone(newC, rounds.length);
    } else {
      setRound(i => i + 1);
    }
  }

  function checkInput(answer: string, acceptable?: string[]) {
    const pool = acceptable ?? [answer];
    return pool.some(a => normalise(a) === normalise(input));
  }

  function submitText() {
    if (!input.trim()) return;
    const isC = checkInput(r.answer ?? "", r.acceptableAnswers);
    setFeedback(isC ? "correct" : "wrong");
    Haptics.impactAsync(isC ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => advance(isC), 900);
  }

  function selectOption(opt: string) {
    if (feedback) return;
    setSelected(opt);
    const isC = opt === r.answer;
    setFeedback(isC ? "correct" : "wrong");
    Haptics.impactAsync(isC ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => advance(isC), 900);
  }

  function renderRound() {
    if (r.type === "fill_blank" && r.options) {
      return (
        <>
          <Text style={styles.bossQuestion}>{r.question}</Text>
          <View style={styles.choicesGrid}>
            {r.options.map(opt => {
              let bg = C.bg2;
              if (selected === opt && feedback === "correct") bg = "#2e7d32";
              else if (selected === opt && feedback === "wrong") bg = "#c62828";
              else if (feedback === "wrong" && opt === r.answer) bg = "#2e7d32";
              return (
                <Pressable key={opt} style={[styles.choiceBtn, { backgroundColor: bg }]} onPress={() => selectOption(opt)}>
                  <Text style={[styles.choiceBtnText, selected === opt && { color: "#fff" }]}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      );
    }

    if (r.type === "listening") {
      return (
        <>
          <Pressable style={[styles.ttsBtn, playing && styles.ttsBtnActive]}
            onPress={() => playTTS(r.ttsScript ?? "", r.ttsVoice ?? "en-GB-SoniaNeural", apiBase, setPlaying)}>
            <Ionicons name={playing ? "volume-high" : "play-circle"} size={28} color={playing ? "#fff" : C.gold} />
            <Text style={[styles.ttsBtnText, playing && { color: "#fff" }]}>
              {playing ? qt("playing", quiz.nativeLang) : "Play"}
            </Text>
          </Pressable>
          <Text style={styles.bossQuestion}>{r.question}</Text>
          <TextInput style={styles.textInput} value={input} onChangeText={setInput}
            placeholder="Answer..." placeholderTextColor={C.textMuted}
            returnKeyType="done" onSubmitEditing={submitText} />
          {!feedback && input.length > 0 && (
            <Pressable style={styles.submitBtn} onPress={submitText}>
              <Text style={styles.submitBtnText}>{qt("submit", quiz.nativeLang)}</Text>
            </Pressable>
          )}
        </>
      );
    }

    if (r.type === "translation") {
      const src = r.source?.[quiz.nativeLang] ?? r.source?.en ?? "";
      return (
        <>
          <Text style={styles.instructionText}>
            {quiz.nativeLang === "ko"
              ? `${quiz.targetLang === "ko" ? "한국어" : quiz.targetLang === "es" ? "스페인어" : "영어"}로 번역하세요:`
              : quiz.nativeLang === "es"
              ? `Traduce al ${quiz.targetLang === "ko" ? "coreano" : quiz.targetLang === "es" ? "español" : "inglés"}:`
              : `Translate to ${quiz.targetLang === "ko" ? "Korean" : quiz.targetLang === "es" ? "Spanish" : "English"}:`}
          </Text>
          <View style={styles.riddleBox}>
            <Text style={styles.riddleText}>{src}</Text>
          </View>
          <TextInput style={styles.textInput} value={input} onChangeText={setInput}
            placeholder="Translation..." placeholderTextColor={C.textMuted}
            returnKeyType="done" onSubmitEditing={submitText} />
          {!feedback && input.length > 0 && (
            <Pressable style={styles.submitBtn} onPress={submitText}>
              <Text style={styles.submitBtnText}>{qt("submit", quiz.nativeLang)}</Text>
            </Pressable>
          )}
        </>
      );
    }

    if (r.type === "riddle") {
      return (
        <>
          <View style={styles.riddleBox}>
            <Text style={styles.riddleEmoji}>🔍</Text>
            <Text style={styles.riddleText}>{r.text}</Text>
          </View>
          <TextInput style={styles.textInput} value={input} onChangeText={setInput}
            placeholder="Answer..." placeholderTextColor={C.textMuted}
            returnKeyType="done" onSubmitEditing={submitText} />
          {!feedback && input.length > 0 && (
            <Pressable style={styles.submitBtn} onPress={submitText}>
              <Text style={styles.submitBtnText}>{qt("submit", quiz.nativeLang)}</Text>
            </Pressable>
          )}
        </>
      );
    }

    if (r.type === "roleplay") {
      return (
        <>
          <View style={styles.riddleBox}>
            <Text style={styles.instructionText}>{r.prompt}</Text>
          </View>
          <TextInput style={[styles.writeInput, { height: 100 }]} value={input} onChangeText={setInput}
            multiline placeholder="Write your response..." placeholderTextColor={C.textMuted}
            textAlignVertical="top" />
          {input.length > 20 && (
            <Pressable style={styles.submitBtn} onPress={() => advance(true)}>
              <Text style={styles.submitBtnText}>{qt("submit", quiz.nativeLang)}</Text>
            </Pressable>
          )}
        </>
      );
    }

    return <Text style={styles.instructionText}>
      {quiz.nativeLang === "ko" ? `알 수 없는 라운드 유형: ${r.type}` : quiz.nativeLang === "es" ? `Tipo de ronda desconocido: ${r.type}` : `Unknown round type: ${r.type}`}
    </Text>;
  }

  return (
    <View style={styles.quizBody}>
      {/* Timer */}
      <View style={[styles.timerRow, { borderColor: urgentColor }]}>
        <Ionicons name="timer" size={20} color={urgentColor} />
        <Text style={[styles.timerText, { color: urgentColor }]}>{timeLeft}s</Text>
        <Text style={styles.progressLabel}>
          {" "}{quiz.nativeLang === "ko" ? `라운드 ${round + 1}/${rounds.length}` : quiz.nativeLang === "es" ? `Ronda ${round + 1}/${rounds.length}` : `Round ${round + 1}/${rounds.length}`}
        </Text>
      </View>

      {/* Round type badge */}
      <View style={styles.roundBadge}>
        <Text style={styles.roundBadgeText}>{r.type.toUpperCase()}</Text>
      </View>

      {renderRound()}

      {feedback && (
        <View style={[styles.feedbackBanner, { backgroundColor: feedback === "correct" ? "#2e7d32" : "#c62828" }]}>
          <Text style={styles.feedbackText}>
            {feedback === "correct" ? "✓ Correct!" : `✗ Answer: ${r.answer ?? "..."}`}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Pronunciation Quiz ───────────────────────────────────────────────────────

function PronunciationQuizView({
  quiz,
  onDone,
}: {
  quiz: LoadedQuiz;
  onDone: (correct: number, total: number) => void;
}) {
  const tl = quiz.targetLang as "en" | "es" | "ko";
  const nl = quiz.nativeLang;
  // loadQuiz already resolves content to targetLang, so quiz.content is { sentences: [...] }
  const resolved = quiz.content as { sentences?: { text: string; minScore: number }[] } | undefined;
  const sentences = resolved?.sentences ?? [];

  const speechLang = tl === "ko" ? "ko-KR" : tl === "es" ? "es-ES" : "en-US";
  const rudyMsg = nl === "ko" ? "루디가 듣고 있어요… 🦊" : nl === "es" ? "Rudy está escuchando… 🦊" : "Rudy is listening… 🦊";

  const [sIdx, setSIdx] = useState(0);
  const [recordState, setRecordState] = useState<"idle" | "recording" | "processing" | "done">("idle");
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [correctCount, setCorrectCount] = useState(0);

  const nativeRecordingRef = useRef<Audio.Recording | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);

  const sentence = sentences[sIdx];
  const isLast = sIdx >= sentences.length - 1;
  const passed = score !== null && score >= (sentence?.minScore ?? 60);

  function advance() {
    const wasCorrect = score !== null && score >= (sentence?.minScore ?? 60);
    const newCorrect = correctCount + (wasCorrect ? 1 : 0);
    if (isLast) {
      onDone(newCorrect, sentences.length);
    } else {
      setCorrectCount(newCorrect);
      setSIdx((i) => i + 1);
      setScore(null);
      setError("");
      setRecordState("idle");
    }
  }

  async function stopNativeRecording() {
    const rec = nativeRecordingRef.current;
    if (!rec) return;
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
    setRecordState("processing");
    try {
      await rec.stopAndUnloadAsync();
      // 300ms delay — ensure file is fully flushed to disk before reading
      await new Promise(resolve => setTimeout(resolve, 300));
      const uri = rec.getURI();
      nativeRecordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      if (!uri) throw new Error("No URI");
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" as any });
      // Empty audio guard — show 0% instead of sending to Azure
      if (!base64 || base64.length < 2000) {
        setScore(0);
        setRecordState("done");
        return;
      }
      const nativeMime = Platform.OS === "ios" ? "audio/wav" : "audio/mp4";
      const apiUrl = new URL("/api/pronunciation-assess", getApiUrl()).toString();
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: sentence?.text ?? "", lang: speechLang, audio: base64, mimeType: nativeMime }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const s = typeof data.accuracyScore === "number" ? data.accuracyScore : typeof data.score === "number" ? data.score : 0;
      setScore(Math.round(s));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn('[API] pronunciation assessment failed:', e);
      setError(nl === "ko" ? "채점 중 오류가 발생했습니다." : nl === "es" ? "Error al evaluar." : "Evaluation error.");
    } finally {
      setRecordState("done");
    }
  }

  function handleRecord() {
    if (recordState === "processing") return;

    if (recordState === "recording") {
      if (Platform.OS !== "web" && nativeRecordingRef.current) {
        stopNativeRecording();
      } else if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    setScore(null);
    setError("");

    if (Platform.OS !== "web") {
      (async () => {
        try {
          const { granted } = await Audio.requestPermissionsAsync();
          if (!granted) {
            setError(nl === "ko" ? "마이크 권한을 허용해주세요." : nl === "es" ? "Permite el micrófono." : "Microphone permission required.");
            return;
          }
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const recording = new Audio.Recording();
          // iOS: record as 16kHz WAV (LINEARPCM) — Azure accepts directly, no ffmpeg needed
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
          await recording.prepareToRecordAsync(recOptions);
          await recording.startAsync();
          nativeRecordingRef.current = recording;
          setRecordState("recording");
          autoStopRef.current = setTimeout(() => { stopNativeRecording(); }, 8000);
        } catch (e) {
          console.warn('[Speech] microphone start failed:', e);
          setError(nl === "ko" ? "마이크를 시작할 수 없습니다." : nl === "es" ? "No se puede iniciar el micrófono." : "Cannot start microphone.");
        }
      })();
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setError(nl === "ko" ? "이 브라우저는 마이크를 지원하지 않습니다." : "Microphone not supported.");
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      audioChunksRef.current = [];
      const mimeType = (window as any).MediaRecorder?.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new (window as any).MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e: any) => { if (e.data?.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t: any) => t.stop());
        setRecordState("processing");
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const base64: string = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(",")[1] ?? "");
          reader.readAsDataURL(blob);
        });
        // Empty audio guard — show 0% instead of sending to Azure
        if (!base64 || base64.length < 2000) {
          setScore(0);
          setRecordState("done");
          return;
        }
        try {
          const apiUrl = new URL("/api/pronunciation-assess", getApiUrl()).toString();
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: sentence?.text ?? "", lang: speechLang, audio: base64, mimeType: recorder.mimeType || "audio/webm" }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const s = typeof data.accuracyScore === "number" ? data.accuracyScore : typeof data.score === "number" ? data.score : 0;
          setScore(Math.round(s));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
          console.warn('[API] pronunciation assessment failed:', e);
          setError(nl === "ko" ? "채점 중 오류가 발생했습니다." : "Evaluation error.");
        } finally {
          setRecordState("done");
        }
      };
      recorder.start();
      setRecordState("recording");
      autoStopRef.current = setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 8000);
    }).catch((e) => {
      console.warn('[Speech] microphone permission denied:', e);
      setError(nl === "ko" ? "마이크 권한을 허용해주세요." : "Microphone permission required.");
    });
  }

  if (!sentence) return <Text style={styles.instructionText}>{qt("noSentences", nl)}</Text>;

  const scoreColor = score === null ? C.gold : score >= 80 ? "#4caf50" : score >= 60 ? "#ff9800" : "#f44336";

  return (
    <View style={styles.pronContainer}>
      {/* Progress */}
      <Text style={styles.pronProgress}>{sIdx + 1} / {sentences.length}</Text>

      {/* Sentence card */}
      <View style={styles.pronCard}>
        <Text style={styles.pronSentenceLabel}>
          {nl === "ko" ? "다음 문장을 소리 내어 읽으세요:" : nl === "es" ? "Lee la siguiente frase en voz alta:" : "Read the following sentence aloud:"}
        </Text>
        <Text style={styles.pronSentenceText}>{sentence.text}</Text>
      </View>

      {/* Mic button */}
      <Pressable
        style={[
          styles.pronMicBtn,
          recordState === "recording" && styles.pronMicBtnActive,
          recordState === "processing" && { opacity: 0.6 },
        ]}
        onPress={handleRecord}
        disabled={recordState === "processing" || recordState === "done"}
      >
        {recordState === "processing" ? (
          <ActivityIndicator size="large" color={C.bg1} />
        ) : (
          <Ionicons
            name={recordState === "recording" ? "stop-circle" : "mic"}
            size={40}
            color={C.bg1}
          />
        )}
      </Pressable>

      {/* Status text */}
      <Text style={styles.pronStatusText}>
        {recordState === "recording"
          ? rudyMsg
          : recordState === "processing"
          ? (nl === "ko" ? "채점 중…" : nl === "es" ? "Evaluando…" : "Evaluating…")
          : recordState === "idle"
          ? (nl === "ko" ? "마이크 버튼을 눌러 말하세요" : nl === "es" ? "Presiona el micrófono" : "Tap mic to speak")
          : ""}
      </Text>

      {/* Score result */}
      {score !== null && (
        <View style={[styles.pronScoreBox, { borderColor: scoreColor }]}>
          <Text style={[styles.pronScoreNum, { color: scoreColor }]}>{score}</Text>
          <Text style={styles.pronScoreLabel}>/ 100</Text>
          {passed ? (
            <Text style={[styles.pronFeedbackLabel, { color: "#4caf50" }]}>
              {nl === "ko" ? "🎉 훌륭해요!" : nl === "es" ? "🎉 ¡Excelente!" : "🎉 Excellent!"}
            </Text>
          ) : (
            <Text style={[styles.pronFeedbackLabel, { color: "#f44336" }]}>
              {nl === "ko" ? "다시 도전해볼게요 🦊" : nl === "es" ? "¡Inténtalo de nuevo! 🦊" : "Keep trying! 🦊"}
            </Text>
          )}
        </View>
      )}

      {/* Error */}
      {!!error && <Text style={styles.pronErrorText}>{error}</Text>}

      {/* Actions */}
      {recordState === "done" && (
        <View style={styles.pronActionRow}>
          {!passed && (
            <Pressable style={styles.pronRetryBtn} onPress={() => { setScore(null); setError(""); setRecordState("idle"); }}>
              <Text style={styles.pronRetryText}>{nl === "ko" ? "다시 녹음" : nl === "es" ? "Reintentar" : "Retry"}</Text>
            </Pressable>
          )}
          <Pressable style={[styles.pronNextBtn, !passed && { backgroundColor: C.bg3 }]} onPress={advance}>
            <Text style={[styles.pronNextText, !passed && { color: C.textMuted }]}>
              {isLast
                ? (nl === "ko" ? "완료" : nl === "es" ? "Completar" : "Complete")
                : (nl === "ko" ? "다음 →" : nl === "es" ? "Siguiente →" : "Next →")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Voice Power Quiz ──────────────────────────────────────────────────────────

const STONE_COLORS: Record<StoneEffect, string> = {
  dim: "#555555",
  glow: "#60A5FA",
  bright: "#F59E0B",
  blinding: "#E879F9",
};
const STONE_LABELS: Record<StoneEffect, { ko: string; en: string; es: string }> = {
  dim: { ko: "희미함", en: "Dim", es: "Tenue" },
  glow: { ko: "빛남", en: "Glow", es: "Brillo" },
  bright: { ko: "밝음", en: "Bright", es: "Brillante" },
  blinding: { ko: "눈부심", en: "Blinding", es: "Cegador" },
};

function scoreToStoneEffect(score: number): StoneEffect {
  if (score >= 86) return "blinding";
  if (score >= 61) return "bright";
  if (score >= 41) return "glow";
  return "dim";
}

function VoicePowerQuizView({
  quiz,
  onDone,
}: {
  quiz: LoadedQuiz;
  onDone: (correct: number, total: number) => void;
}) {
  const tl = quiz.targetLang as "en" | "es" | "ko";
  const nl = quiz.nativeLang;
  // loadQuiz already resolves content to targetLang, so quiz.content is { sentences: [...] }
  const contentRaw = quiz.content as any;
  const sentences: VoicePowerContent[] = contentRaw?.sentences ?? [];

  const speechLang = tl === "ko" ? "ko-KR" : tl === "es" ? "es-ES" : "en-US";
  const rudyMsg = nl === "ko" ? "수호석이 반응하고 있어… 🦊" : nl === "es" ? "La piedra reacciona… 🦊" : "The stone reacts… 🦊";

  const [sIdx, setSIdx] = useState(0);
  const [recordState, setRecordState] = useState<"idle" | "recording" | "processing" | "done">("idle");
  const [score, setScore] = useState<number | null>(null);
  const [stoneEffect, setStoneEffect] = useState<StoneEffect>("dim");
  const [error, setError] = useState("");
  const [correctCount, setCorrectCount] = useState(0);

  const nativeRecordingRef = useRef<Audio.Recording | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const sentence = sentences[sIdx];
  const isLast = sIdx >= sentences.length - 1;
  const minScore = sentence?.minScore ?? 60;
  const passed = score !== null && score >= minScore;

  useEffect(() => {
    if (stoneEffect === "blinding" || stoneEffect === "bright") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [stoneEffect]);

  function advance() {
    const wasCorrect = score !== null && score >= minScore;
    const newCorrect = correctCount + (wasCorrect ? 1 : 0);
    if (isLast) {
      onDone(newCorrect, sentences.length);
    } else {
      setCorrectCount(newCorrect);
      setSIdx((i) => i + 1);
      setScore(null);
      setStoneEffect("dim");
      setError("");
      setRecordState("idle");
    }
  }

  async function stopNativeRecording() {
    const rec = nativeRecordingRef.current;
    if (!rec) return;
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
    setRecordState("processing");
    try {
      await rec.stopAndUnloadAsync();
      await new Promise(resolve => setTimeout(resolve, 300));
      const uri = rec.getURI();
      nativeRecordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      if (!uri) throw new Error("No URI");
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" as any });
      if (!base64 || base64.length < 2000) {
        setScore(0);
        setStoneEffect("dim");
        setRecordState("done");
        return;
      }
      const nativeMime = Platform.OS === "ios" ? "audio/wav" : "audio/mp4";
      const apiUrl = new URL("/api/pronunciation-assess", getApiUrl()).toString();
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: sentence?.sentence ?? "", lang: speechLang, audio: base64, mimeType: nativeMime }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const s = typeof data.accuracyScore === "number" ? data.accuracyScore : typeof data.score === "number" ? data.score : 0;
      const rounded = Math.round(s);
      setScore(rounded);
      setStoneEffect(scoreToStoneEffect(rounded));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn('[API] pronunciation assessment failed:', e);
      setError(nl === "ko" ? "채점 중 오류가 발생했습니다." : nl === "es" ? "Error al evaluar." : "Evaluation error.");
    } finally {
      setRecordState("done");
    }
  }

  function handleRecord() {
    if (recordState === "processing") return;

    if (recordState === "recording") {
      if (Platform.OS !== "web" && nativeRecordingRef.current) {
        stopNativeRecording();
      } else if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    setScore(null);
    setStoneEffect("dim");
    setError("");

    if (Platform.OS !== "web") {
      (async () => {
        try {
          const { granted } = await Audio.requestPermissionsAsync();
          if (!granted) {
            setError(nl === "ko" ? "마이크 권한을 허용해주세요." : "Microphone permission required.");
            return;
          }
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const recording = new Audio.Recording();
          const recOptions: Audio.RecordingOptions = Platform.OS === "ios" ? {
            android: Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
            ios: {
              extension: ".wav", outputFormat: Audio.IOSOutputFormat.LINEARPCM,
              audioQuality: Audio.IOSAudioQuality.HIGH, sampleRate: 16000,
              numberOfChannels: 1, bitRate: 256000,
              linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false,
            },
            web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
          } : Audio.RecordingOptionsPresets.HIGH_QUALITY;
          await recording.prepareToRecordAsync(recOptions);
          await recording.startAsync();
          nativeRecordingRef.current = recording;
          setRecordState("recording");
          autoStopRef.current = setTimeout(() => { stopNativeRecording(); }, 8000);
        } catch (e) {
          console.warn('[Speech] microphone start failed:', e);
          setError(nl === "ko" ? "마이크를 시작할 수 없습니다." : "Cannot start microphone.");
        }
      })();
      return;
    }

    // Web recording
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError(nl === "ko" ? "이 브라우저는 마이크를 지원하지 않습니다." : "Microphone not supported.");
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      audioChunksRef.current = [];
      const mimeType = (window as any).MediaRecorder?.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new (window as any).MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e: any) => { if (e.data?.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t: any) => t.stop());
        setRecordState("processing");
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const base64: string = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(",")[1] ?? "");
          reader.readAsDataURL(blob);
        });
        if (!base64 || base64.length < 2000) { setScore(0); setStoneEffect("dim"); setRecordState("done"); return; }
        try {
          const apiUrl = new URL("/api/pronunciation-assess", getApiUrl()).toString();
          const res = await fetch(apiUrl, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: sentence?.sentence ?? "", lang: speechLang, audio: base64, mimeType: recorder.mimeType || "audio/webm" }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const s = typeof data.accuracyScore === "number" ? data.accuracyScore : typeof data.score === "number" ? data.score : 0;
          const rounded = Math.round(s);
          setScore(rounded);
          setStoneEffect(scoreToStoneEffect(rounded));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
          console.warn('[API] pronunciation assessment failed:', e);
          setError(nl === "ko" ? "채점 중 오류가 발생했습니다." : "Evaluation error.");
        } finally { setRecordState("done"); }
      };
      recorder.start();
      setRecordState("recording");
      autoStopRef.current = setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 8000);
    }).catch((e) => {
      console.warn('[Speech] microphone permission denied:', e);
      setError(nl === "ko" ? "마이크 권한을 허용해주세요." : "Microphone permission required.");
    });
  }

  if (!sentence) return <Text style={styles.instructionText}>{qt("noSentences", nl)}</Text>;

  const stoneColor = STONE_COLORS[stoneEffect];
  const stoneLabel = STONE_LABELS[stoneEffect][nl] ?? STONE_LABELS[stoneEffect]["en"];
  const stoneCount = sentence.stoneCount ?? 1;

  return (
    <View style={styles.pronContainer}>
      <Text style={styles.pronProgress}>{sIdx + 1} / {sentences.length}</Text>

      {/* Stone visual */}
      <View style={vpStyles.stoneRow}>
        {Array.from({ length: stoneCount }).map((_, i) => (
          <Animated.View
            key={i}
            style={[vpStyles.stone, { backgroundColor: stoneColor, transform: [{ scale: pulseAnim }] }]}
          >
            <Text style={vpStyles.stoneIcon}>
              {stoneEffect === "blinding" ? "💎" : stoneEffect === "bright" ? "✨" : stoneEffect === "glow" ? "🔵" : "⚫"}
            </Text>
          </Animated.View>
        ))}
      </View>
      <Text style={[vpStyles.stoneLabel, { color: stoneColor }]}>{stoneLabel}</Text>

      {/* Sentence card */}
      <View style={styles.pronCard}>
        <Text style={styles.pronSentenceLabel}>
          {nl === "ko" ? "수호석에 힘을 불어넣으세요:" : nl === "es" ? "Da poder a la piedra:" : "Empower the Guardian Stone:"}
        </Text>
        <Text style={styles.pronSentenceText}>{sentence.sentence}</Text>
        {sentence.translation && (
          <Text style={vpStyles.translationText}>{sentence.translation}</Text>
        )}
      </View>

      {/* Mic button */}
      <Pressable
        style={[
          styles.pronMicBtn,
          recordState === "recording" && styles.pronMicBtnActive,
          recordState === "processing" && { opacity: 0.6 },
        ]}
        onPress={handleRecord}
        disabled={recordState === "processing" || recordState === "done"}
      >
        {recordState === "processing" ? (
          <ActivityIndicator size="large" color={C.bg1} />
        ) : (
          <Ionicons name={recordState === "recording" ? "stop-circle" : "mic"} size={40} color={C.bg1} />
        )}
      </Pressable>

      <Text style={styles.pronStatusText}>
        {recordState === "recording" ? rudyMsg
          : recordState === "processing" ? (nl === "ko" ? "수호석 반응 확인 중…" : "Checking stone response…")
          : recordState === "idle" ? (nl === "ko" ? "마이크를 눌러 말하세요" : "Tap mic to speak")
          : ""}
      </Text>

      {/* Score + stone effect */}
      {score !== null && (
        <View style={[styles.pronScoreBox, { borderColor: stoneColor }]}>
          <Text style={[styles.pronScoreNum, { color: stoneColor }]}>{score}</Text>
          <Text style={styles.pronScoreLabel}>/ 100</Text>
          <Text style={[styles.pronFeedbackLabel, { color: stoneColor }]}>
            {passed
              ? (nl === "ko" ? "수호석이 반응합니다!" : nl === "es" ? "La piedra reacciona!" : "The stone responds!")
              : (nl === "ko" ? "더 강하게 말해보세요 🦊" : nl === "es" ? "Habla más fuerte 🦊" : "Speak louder! 🦊")}
          </Text>
        </View>
      )}

      {!!error && <Text style={styles.pronErrorText}>{error}</Text>}

      {recordState === "done" && (
        <View style={styles.pronActionRow}>
          {!passed && (
            <Pressable style={styles.pronRetryBtn} onPress={() => { setScore(null); setStoneEffect("dim"); setError(""); setRecordState("idle"); }}>
              <Text style={styles.pronRetryText}>{nl === "ko" ? "다시 녹음" : nl === "es" ? "Reintentar" : "Retry"}</Text>
            </Pressable>
          )}
          <Pressable style={[styles.pronNextBtn, !passed && { backgroundColor: C.bg3 }]} onPress={advance}>
            <Text style={[styles.pronNextText, !passed && { color: C.textMuted }]}>
              {isLast ? (nl === "ko" ? "완료" : "Complete") : (nl === "ko" ? "다음 →" : "Next →")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Debate Battle Quiz ────────────────────────────────────────────────────────

function DebateBattleQuizView({
  quiz,
  onDone,
}: {
  quiz: LoadedQuiz;
  onDone: (correct: number, total: number) => void;
}) {
  const nl = quiz.nativeLang;
  const tl = quiz.targetLang;
  // loadQuiz already resolves content to targetLang
  const debate: DebateBattleContent = (quiz.content as any) ?? { opponent: "NPC", rounds: 3, minExpressions: 1, roundData: [] };

  const [roundIdx, setRoundIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; won: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [wonRounds, setWonRounds] = useState(0);

  const round = debate.roundData?.[roundIdx];
  const totalRounds = debate.rounds ?? debate.roundData?.length ?? 3;
  const isLast = roundIdx >= totalRounds - 1;

  async function submitArgument() {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const gptPrompt = `You are judging a language debate. The student argues against "${debate.opponent}".
Topic: "${round?.topic?.[tl] ?? round?.topic?.["en"] ?? "general"}"
NPC argument: "${round?.npcArgument?.[tl] ?? round?.npcArgument?.["en"] ?? ""}"
Required expressions: ${JSON.stringify(round?.requiredExpressions ?? [])}
Min expressions needed: ${debate.minExpressions}
Student's argument: "${input}"

Score 0-100. Check if student used required expressions naturally. Respond ONLY with JSON: {"score": number, "feedback": "brief feedback", "expressionsUsed": string[]}`;

      const data = await apiRequest("POST", "/api/quiz-evaluate", {
        systemPrompt: gptPrompt,
        userMessage: input,
      }) as any;
      const resultText = typeof data === "string" ? data : data?.result ?? data?.text ?? "{}";
      let parsed: { score?: number; feedback?: string } = {};
      try { parsed = JSON.parse(resultText); } catch (e) { console.warn('[API] debate result parse failed:', e); parsed = { score: 50, feedback: resultText?.slice?.(0, 200) ?? "" }; }
      const won = (parsed.score ?? 0) >= 60;
      setFeedback({ text: parsed.feedback ?? (won ? "Good argument!" : "Try harder."), won });
      if (won) setWonRounds((w) => w + 1);
    } catch (e) {
      console.warn('[API] debate evaluation failed:', e);
      setFeedback({ text: nl === "ko" ? "평가 중 오류 발생" : "Evaluation error", won: false });
    } finally {
      setLoading(false);
    }
  }

  function nextRound() {
    if (isLast) {
      onDone(wonRounds + (feedback?.won ? 1 : 0), totalRounds);
    } else {
      setRoundIdx((i) => i + 1);
      setInput("");
      setFeedback(null);
    }
  }

  return (
    <View style={styles.quizBody}>
      {/* Round indicator */}
      <View style={styles.roundBadge}>
        <Text style={styles.roundBadgeText}>
          ROUND {roundIdx + 1} / {totalRounds}
        </Text>
      </View>

      {/* NPC argument */}
      {round && (
        <View style={dbStyles.npcArgBox}>
          <Text style={dbStyles.npcName}>{debate.opponent}</Text>
          <Text style={dbStyles.npcArgText}>{round.npcArgument?.[tl] ?? round.npcArgument?.["en"] ?? ""}</Text>
        </View>
      )}

      {/* Required expressions */}
      {round?.requiredExpressions && round.requiredExpressions.length > 0 && (
        <View style={dbStyles.exprRow}>
          <Text style={dbStyles.exprLabel}>{nl === "ko" ? "사용해야 할 표현:" : "Use these expressions:"}</Text>
          <View style={styles.wordBank}>
            {round.requiredExpressions.map((e, i) => (
              <View key={i} style={styles.wordChip}><Text style={styles.wordChipText}>{e}</Text></View>
            ))}
          </View>
        </View>
      )}

      {/* Input */}
      {!feedback && (
        <>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder={nl === "ko" ? "반론을 입력하세요…" : "Type your counter-argument…"}
            placeholderTextColor={C.textMuted}
            multiline
          />
          <Pressable
            style={[styles.submitBtn, (!input.trim() || loading) && { opacity: 0.5 }]}
            onPress={submitArgument}
            disabled={!input.trim() || loading}
          >
            {loading ? <ActivityIndicator color={C.bg1} /> : (
              <Text style={styles.submitBtnText}>{nl === "ko" ? "반론 제출" : "Submit Argument"}</Text>
            )}
          </Pressable>
        </>
      )}

      {/* Feedback */}
      {feedback && (
        <>
          <View style={[styles.feedbackBanner, { backgroundColor: feedback.won ? "#2e7d32" : "#c62828" }]}>
            <Text style={styles.feedbackText}>
              {feedback.won ? (nl === "ko" ? "이 라운드 승리!" : "You won this round!") : (nl === "ko" ? "이 라운드 패배" : "You lost this round")}
            </Text>
          </View>
          <Text style={dbStyles.feedbackDetail}>{feedback.text}</Text>
          <Pressable style={styles.submitBtn} onPress={nextRound}>
            <Text style={styles.submitBtnText}>
              {isLast ? (nl === "ko" ? "결과 보기" : "See Results") : (nl === "ko" ? "다음 라운드 →" : "Next Round →")}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

// ─── NPC Rescue Quiz ───────────────────────────────────────────────────────────

function NpcRescueQuizView({
  quiz,
  onDone,
}: {
  quiz: LoadedQuiz;
  onDone: (correct: number, total: number) => void;
}) {
  const tl = quiz.targetLang as "en" | "es" | "ko";
  const nl = quiz.nativeLang;
  // loadQuiz already resolves content to targetLang
  const rescue: NpcRescueContent = (quiz.content as any) ?? { npcToRescue: "NPC", stages: [], progressiveIntro: true };

  const speechLang = tl === "ko" ? "ko-KR" : tl === "es" ? "es-ES" : "en-US";

  const [stageIdx, setStageIdx] = useState(0);
  const [recordState, setRecordState] = useState<"idle" | "recording" | "processing" | "done">("idle");
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [passedCount, setPassedCount] = useState(0);

  const nativeRecordingRef = useRef<Audio.Recording | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);

  const stage = rescue.stages?.[stageIdx];
  const totalStages = rescue.stages?.length ?? 0;
  const isLast = stageIdx >= totalStages - 1;
  const minScore = stage?.minScore ?? 60;
  const passed = score !== null && score >= minScore;

  function advance() {
    const wasCorrect = score !== null && score >= minScore;
    const newPassed = passedCount + (wasCorrect ? 1 : 0);
    if (isLast) {
      onDone(newPassed, totalStages);
    } else {
      setPassedCount(newPassed);
      setStageIdx((i) => i + 1);
      setScore(null);
      setError("");
      setRecordState("idle");
    }
  }

  async function stopNativeRecording() {
    const rec = nativeRecordingRef.current;
    if (!rec) return;
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
    setRecordState("processing");
    try {
      await rec.stopAndUnloadAsync();
      await new Promise(resolve => setTimeout(resolve, 300));
      const uri = rec.getURI();
      nativeRecordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      if (!uri) throw new Error("No URI");
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" as any });
      if (!base64 || base64.length < 2000) { setScore(0); setRecordState("done"); return; }
      const nativeMime = Platform.OS === "ios" ? "audio/wav" : "audio/mp4";
      const apiUrl = new URL("/api/pronunciation-assess", getApiUrl()).toString();
      const res = await fetch(apiUrl, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: stage?.targetPhrase ?? "", lang: speechLang, audio: base64, mimeType: nativeMime }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const s = typeof data.accuracyScore === "number" ? data.accuracyScore : typeof data.score === "number" ? data.score : 0;
      setScore(Math.round(s));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn('[API] pronunciation assessment failed:', e);
      setError(nl === "ko" ? "채점 오류" : "Evaluation error.");
    } finally {
      setRecordState("done");
    }
  }

  function handleRecord() {
    if (recordState === "processing") return;

    if (recordState === "recording") {
      if (Platform.OS !== "web" && nativeRecordingRef.current) {
        stopNativeRecording();
      } else if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    setScore(null);
    setError("");

    if (Platform.OS !== "web") {
      (async () => {
        try {
          const { granted } = await Audio.requestPermissionsAsync();
          if (!granted) { setError(nl === "ko" ? "마이크 권한 필요" : "Microphone permission required."); return; }
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const recording = new Audio.Recording();
          const recOptions: Audio.RecordingOptions = Platform.OS === "ios" ? {
            android: Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
            ios: {
              extension: ".wav", outputFormat: Audio.IOSOutputFormat.LINEARPCM,
              audioQuality: Audio.IOSAudioQuality.HIGH, sampleRate: 16000,
              numberOfChannels: 1, bitRate: 256000,
              linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false,
            },
            web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
          } : Audio.RecordingOptionsPresets.HIGH_QUALITY;
          await recording.prepareToRecordAsync(recOptions);
          await recording.startAsync();
          nativeRecordingRef.current = recording;
          setRecordState("recording");
          autoStopRef.current = setTimeout(() => { stopNativeRecording(); }, 8000);
        } catch (e) {
          console.warn('[Speech] microphone start failed:', e);
          setError(nl === "ko" ? "마이크 시작 실패" : "Cannot start microphone.");
        }
      })();
      return;
    }

    // Web recording
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError("Microphone not supported.");
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      audioChunksRef.current = [];
      const mimeType = (window as any).MediaRecorder?.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new (window as any).MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e: any) => { if (e.data?.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t: any) => t.stop());
        setRecordState("processing");
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const base64: string = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(",")[1] ?? "");
          reader.readAsDataURL(blob);
        });
        if (!base64 || base64.length < 2000) { setScore(0); setRecordState("done"); return; }
        try {
          const apiUrl = new URL("/api/pronunciation-assess", getApiUrl()).toString();
          const res = await fetch(apiUrl, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: stage?.targetPhrase ?? "", lang: speechLang, audio: base64, mimeType: recorder.mimeType || "audio/webm" }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const s = typeof data.accuracyScore === "number" ? data.accuracyScore : typeof data.score === "number" ? data.score : 0;
          setScore(Math.round(s));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
          console.warn('[API] pronunciation assessment failed:', e);
          setError(nl === "ko" ? "채점 오류" : "Evaluation error.");
        } finally { setRecordState("done"); }
      };
      recorder.start();
      setRecordState("recording");
      autoStopRef.current = setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 8000);
    }).catch((e) => { console.warn('[Speech] microphone permission denied:', e); setError(nl === "ko" ? "마이크 권한 필요" : "Microphone permission required."); });
  }

  if (!stage) return <Text style={styles.instructionText}>No rescue stages found.</Text>;

  const progressPct = ((stageIdx + (passed ? 1 : 0)) / totalStages) * 100;

  return (
    <View style={styles.pronContainer}>
      {/* Progress bar */}
      <View style={nrStyles.progressBarBg}>
        <View style={[nrStyles.progressBarFill, { width: `${progressPct}%` as any }]} />
      </View>
      <Text style={styles.pronProgress}>
        {nl === "ko" ? `구출 단계 ${stageIdx + 1} / ${totalStages}` : `Rescue Stage ${stageIdx + 1} / ${totalStages}`}
      </Text>

      {/* NPC rescue banner */}
      <View style={nrStyles.rescueBanner}>
        <Text style={nrStyles.rescueEmoji}>🆘</Text>
        <Text style={nrStyles.rescueText}>
          {nl === "ko" ? `${rescue.npcToRescue}을(를) 구출하세요!` : `Rescue ${rescue.npcToRescue}!`}
        </Text>
      </View>

      {/* Stage instruction */}
      <View style={styles.pronCard}>
        <Text style={styles.pronSentenceLabel}>{stage.instruction?.[nl] ?? stage.instruction?.["en"] ?? ""}</Text>
        <Text style={styles.pronSentenceText}>{stage.targetPhrase}</Text>
        {stage.hint && (
          <Text style={vpStyles.translationText}>{stage.hint?.[nl] ?? stage.hint?.["en"] ?? ""}</Text>
        )}
      </View>

      {/* Mic */}
      <Pressable
        style={[styles.pronMicBtn, recordState === "recording" && styles.pronMicBtnActive, recordState === "processing" && { opacity: 0.6 }]}
        onPress={handleRecord}
        disabled={recordState === "processing" || recordState === "done"}
      >
        {recordState === "processing" ? <ActivityIndicator size="large" color={C.bg1} /> : (
          <Ionicons name={recordState === "recording" ? "stop-circle" : "mic"} size={40} color={C.bg1} />
        )}
      </Pressable>

      <Text style={styles.pronStatusText}>
        {recordState === "recording" ? (nl === "ko" ? "듣고 있어요…" : "Listening…")
          : recordState === "processing" ? (nl === "ko" ? "평가 중…" : "Evaluating…")
          : recordState === "idle" ? (nl === "ko" ? "마이크를 눌러 말하세요" : "Tap mic to speak")
          : ""}
      </Text>

      {score !== null && (
        <View style={[styles.pronScoreBox, { borderColor: passed ? "#4caf50" : "#f44336" }]}>
          <Text style={[styles.pronScoreNum, { color: passed ? "#4caf50" : "#f44336" }]}>{score}</Text>
          <Text style={styles.pronScoreLabel}>/ 100</Text>
          <Text style={[styles.pronFeedbackLabel, { color: passed ? "#4caf50" : "#f44336" }]}>
            {passed ? (nl === "ko" ? "구출 성공!" : "Rescue success!") : (nl === "ko" ? "다시 시도하세요" : "Try again")}
          </Text>
        </View>
      )}

      {!!error && <Text style={styles.pronErrorText}>{error}</Text>}

      {recordState === "done" && (
        <View style={styles.pronActionRow}>
          {!passed && (
            <Pressable style={styles.pronRetryBtn} onPress={() => { setScore(null); setError(""); setRecordState("idle"); }}>
              <Text style={styles.pronRetryText}>{nl === "ko" ? "다시 녹음" : "Retry"}</Text>
            </Pressable>
          )}
          <Pressable style={[styles.pronNextBtn, !passed && { backgroundColor: C.bg3 }]} onPress={advance}>
            <Text style={[styles.pronNextText, !passed && { color: C.textMuted }]}>
              {isLast ? (nl === "ko" ? "완료" : "Complete") : (nl === "ko" ? "다음 단계 →" : "Next Stage →")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

export default function StoryQuizModal({ quiz, visible, onComplete, onDismiss }: Props) {
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [resultData, setResultData] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (visible) { setPhase("quiz"); setResultData({ correct: 0, total: 0 }); }
  }, [visible, quiz?.id]);

  function handleDone(correct: number, total: number) {
    setResultData({ correct, total });
    setPhase("result");

    // Track expression book + I/O ratio
    if (quiz) {
      const quizAny = quiz as any;
      const chapter = quizAny.chapter ?? "";
      const tprsStage = quizAny.tprsStage;
      const targetExprs: string[] = quizAny.targetExpressions ?? [];
      if (targetExprs.length > 0) {
        addToExpressionBook(targetExprs, chapter, tprsStage).catch((e) => console.warn('[StoryQuiz] expression book storage failed:', e));
        if (tprsStage === 4) markExpressionsMastered(targetExprs).catch((e) => console.warn('[StoryQuiz] mark expressions mastered failed:', e));
      }
      trackQuizIO(chapter, quiz.type).catch((e) => console.warn('[StoryQuiz] quiz I/O tracking failed:', e));
    }
  }

  if (!quiz) return null;

  const typeLabel: Record<string, string> = {
    word_rearrange: "🔤 Rearrange",
    matching: "🔗 Matching",
    fill_blank: "✏️ Fill Blank",
    listening: "👂 Listening",
    riddle: "🔍 Riddle",
    roleplay: "💬 Roleplay",
    writing: "📝 Writing",
    timed: "⏱ Boss Quiz",
    mixed: "🏆 Final Trial",
    translation: "🌐 Translate",
    pronunciation: "🎤 Pronunciation",
    voice_power: "💎 Voice Power",
    debate_battle: "⚔️ Debate",
    npc_rescue: "🆘 Rescue",
  };

  function renderQuiz() {
    const content = quiz!.content as Record<string, unknown>;

    switch (quiz!.type) {
      case "word_rearrange":
        return <WordRearrangeView content={content} nativeLang={quiz!.nativeLang} onDone={handleDone} />;
      case "matching":
        return <MatchingQuizView content={content} targetLang={quiz!.targetLang} nativeLang={quiz!.nativeLang} onDone={handleDone} />;
      case "fill_blank":
        return <FillBlankQuizView content={content} nativeLang={quiz!.nativeLang} onDone={handleDone} />;
      case "listening":
        return <ListeningQuizView content={content} targetLang={quiz!.targetLang} nativeLang={quiz!.nativeLang} onDone={handleDone} />;
      case "riddle":
        return <RiddleQuizView content={content} gptPrompt={quiz!.gptPrompt} targetLang={quiz!.targetLang} nativeLang={quiz!.nativeLang} onDone={handleDone} />;
      case "roleplay":
        return <RoleplayQuizView quiz={quiz!} onDone={handleDone} />;
      case "writing":
        return <WritingQuizView quiz={quiz!} onDone={handleDone} />;
      case "timed":
      case "mixed":
        return <TimedBossView quiz={quiz!} onDone={handleDone} />;
      case "pronunciation":
        return <PronunciationQuizView quiz={quiz!} onDone={handleDone} />;
      case "voice_power":
        return <VoicePowerQuizView quiz={quiz!} onDone={handleDone} />;
      case "debate_battle":
        return <DebateBattleQuizView quiz={quiz!} onDone={handleDone} />;
      case "npc_rescue":
        return <NpcRescueQuizView quiz={quiz!} onDone={handleDone} />;
      default:
        return <Text style={styles.instructionText}>
          {quiz!.nativeLang === "ko" ? `아직 지원하지 않는 퀴즈 유형: ${quiz!.type}` : quiz!.nativeLang === "es" ? `Tipo de quiz aún no admitido: ${quiz!.type}` : `Quiz type not yet supported: ${quiz!.type}`}
        </Text>;
    }
  }

  const xpFinal = phase === "result"
    ? Math.round((quiz.rewards.xp ?? 0) * (resultData.total > 0 ? resultData.correct / resultData.total : 1))
    : 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onDismiss}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeBtn} onPress={onDismiss}>
            <Ionicons name="close" size={22} color={C.textMuted} />
          </Pressable>
          <View style={styles.headerMid}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{typeLabel[quiz.type] ?? quiz.type}</Text>
            </View>
            {quiz.isBoss && (
              <View style={styles.bossBadge}>
                <Text style={styles.bossBadgeText}>⚔️ BOSS</Text>
              </View>
            )}
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{quiz.rewards.xp} XP</Text>
          </View>
        </View>

        {/* Story context */}
        <View style={styles.contextBox}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.contextText}>{quiz.storyContext}</Text>
        </View>

        {/* Quiz body / result */}
        <View style={styles.body}>
          {phase === "quiz"
            ? renderQuiz()
            : <ResultView
                xp={xpFinal}
                correct={resultData.correct}
                total={resultData.total}
                badge={quiz.rewards.badge}
                nativeLang={quiz.nativeLang}
                onContinue={() => onComplete(xpFinal)}
              />
          }
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 16 : 8, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.bg2,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg3, justifyContent: "center", alignItems: "center",
  },
  headerMid: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10 },
  typeBadge: {
    backgroundColor: C.gold + "22", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  typeBadgeText: { fontSize: 12, fontFamily: F.bodySemi, color: C.gold },
  bossBadge: {
    backgroundColor: "#c62828", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  bossBadgeText: { fontSize: 11, fontFamily: F.bodySemi, color: "#fff" },
  xpBadge: {
    backgroundColor: C.gold, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  xpBadgeText: { fontSize: 13, fontFamily: F.label, color: C.bg1 },
  contextBox: {
    paddingHorizontal: 18, paddingVertical: 14, backgroundColor: C.bg3,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  quizTitle: { fontSize: 17, fontFamily: F.label, color: C.parchment, marginBottom: 4 },
  contextText: { fontSize: 13, fontFamily: F.body, color: C.textMuted, lineHeight: 18 },
  body: { flex: 1 },
  quizBody: {
    flex: 1, paddingHorizontal: 18, paddingTop: 20, paddingBottom: 20, gap: 14,
  },
  quizBodyScroll: { flex: 1, paddingHorizontal: 18 },
  progressLabel: {
    fontSize: 12, fontFamily: F.body, color: C.textMuted, textAlign: "center",
  },
  instructionText: {
    fontSize: 14, fontFamily: F.body, color: C.textMuted, textAlign: "center", marginBottom: 8,
  },

  // Matching
  matchLeft: {
    backgroundColor: C.bg2, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border, alignItems: "center",
  },
  matchLeftText: { fontSize: 18, fontFamily: F.label, color: C.parchment },
  matchArrow: { fontSize: 20, color: C.gold, textAlign: "center" },
  choicesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  choiceBtn: {
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, minWidth: 120, alignItems: "center",
  },
  choiceBtnText: { fontSize: 14, fontFamily: F.bodySemi, color: C.parchment },

  // Fill blank
  passageBox: {
    backgroundColor: C.bg3, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 16, marginTop: 14,
  },
  passageText: { fontSize: 15, fontFamily: F.body, color: C.parchment, lineHeight: 24 },
  blankSlot: {
    fontFamily: F.label, color: C.gold, backgroundColor: C.gold + "22",
    borderRadius: 4, paddingHorizontal: 4,
  },
  blankSection: { gap: 10 },
  blankNum: { fontSize: 14, fontFamily: F.label, color: C.gold },
  blankNav: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  blankDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg2,
    borderWidth: 1, borderColor: C.border, justifyContent: "center", alignItems: "center",
  },
  blankDotActive: { borderColor: C.gold },
  blankDotFilled: { backgroundColor: C.gold + "33" },
  blankDotNum: { fontSize: 12, fontFamily: F.bodySemi, color: C.parchment },
  hintToggle: { alignSelf: "flex-start" },
  hintToggleText: { fontSize: 13, color: C.gold, fontFamily: F.body },
  hintText: {
    fontSize: 13, fontFamily: F.body, color: C.textMuted, fontStyle: "italic",
    backgroundColor: C.bg3, borderRadius: 10, padding: 10,
  },

  // Word rearrange
  builtBox: {
    minHeight: 60, backgroundColor: C.bg3, borderRadius: 14, padding: 12,
    borderWidth: 1.5, borderColor: C.gold + "44", justifyContent: "center",
  },
  builtPlaceholder: { fontSize: 13, color: C.textMuted, textAlign: "center", fontStyle: "italic" },
  wordRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  wordBank: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  wordChip: {
    backgroundColor: C.bg2, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: C.border,
  },
  wordChipBuilt: {
    backgroundColor: C.gold + "22", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: C.gold,
  },
  wordChipText: { fontSize: 14, fontFamily: F.bodySemi, color: C.parchment },

  // Listening
  ttsBtn: {
    flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "center",
    backgroundColor: C.bg3, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14,
    borderWidth: 1.5, borderColor: C.gold,
  },
  ttsBtnActive: { backgroundColor: C.gold },
  ttsBtnText: { fontSize: 15, fontFamily: F.bodySemi, color: C.gold },
  textInput: {
    backgroundColor: C.bg3, borderRadius: 12, padding: 14,
    fontSize: 15, fontFamily: F.body, color: C.parchment,
    borderWidth: 1, borderColor: C.border,
  },

  // Riddle
  riddleBox: {
    backgroundColor: C.bg3, borderRadius: 16, padding: 20,
    alignItems: "center", gap: 10, borderWidth: 1, borderColor: C.border,
  },
  riddleEmoji: { fontSize: 32 },
  riddleText: { fontSize: 16, fontFamily: F.body, color: C.parchment, lineHeight: 24, textAlign: "center" },

  // Roleplay
  vocabRow: { maxHeight: 44, marginBottom: 8 },
  vocabChip: {
    backgroundColor: C.bg3, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    marginRight: 6, borderWidth: 1, borderColor: C.border,
  },
  vocabChipText: { fontSize: 12, fontFamily: F.body, color: C.textMuted },
  chatScroll: { flex: 1, maxHeight: 250 },
  chatPlaceholder: { fontSize: 13, color: C.textMuted, textAlign: "center", marginTop: 16, fontStyle: "italic" },
  chatBubble: {
    maxWidth: "80%", padding: 12, borderRadius: 14, marginVertical: 4,
  },
  chatUser: {
    alignSelf: "flex-end", backgroundColor: C.gold, borderBottomRightRadius: 4,
  },
  chatNpc: {
    alignSelf: "flex-start", backgroundColor: C.bg2,
    borderBottomLeftRadius: 4, padding: 12, borderRadius: 14,
  },
  chatBubbleText: { fontSize: 14, fontFamily: F.body, color: C.bg1 },
  chatInputRow: {
    flexDirection: "row", gap: 8, alignItems: "flex-end",
    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, paddingHorizontal: 18, paddingBottom: 16,
  },
  chatInput: {
    flex: 1, backgroundColor: C.bg3, borderRadius: 12, padding: 12,
    fontSize: 14, fontFamily: F.body, color: C.parchment,
    borderWidth: 1, borderColor: C.border, maxHeight: 80,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: C.gold,
    justifyContent: "center", alignItems: "center",
  },

  // Writing
  writePromptBox: {
    backgroundColor: C.bg3, borderRadius: 16, padding: 18,
    alignItems: "center", gap: 8, marginTop: 14, marginBottom: 12,
    borderWidth: 1, borderColor: C.border,
  },
  writeEmoji: { fontSize: 40 },
  writeDesc: { fontSize: 15, fontFamily: F.body, color: C.parchment, textAlign: "center" },
  writeVocabLabel: { fontSize: 12, fontFamily: F.body, color: C.textMuted },
  writeVocabRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  writeMeta: { fontSize: 12, fontFamily: F.body, color: C.textMuted, fontStyle: "italic" },
  writeInput: {
    backgroundColor: C.bg3, borderRadius: 12, padding: 14,
    fontSize: 15, fontFamily: F.body, color: C.parchment,
    borderWidth: 1, borderColor: C.border, minHeight: 120,
    marginBottom: 12,
  },
  writeFeedbackBox: {
    backgroundColor: C.bg3, borderRadius: 14, padding: 16, gap: 10,
    borderWidth: 1, borderColor: C.border,
  },
  writeScore: { fontSize: 28, fontFamily: F.label, color: C.gold, textAlign: "center" },
  writeFeedback: { fontSize: 14, fontFamily: F.body, color: C.parchment, lineHeight: 20, textAlign: "center" },

  // Timed boss
  timerRow: {
    flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center",
    borderWidth: 2, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8,
  },
  timerText: { fontSize: 22, fontFamily: F.label },
  roundBadge: {
    alignSelf: "center", backgroundColor: C.bg2, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  roundBadgeText: { fontSize: 11, fontFamily: F.label, color: C.gold, letterSpacing: 1 },
  bossQuestion: { fontSize: 16, fontFamily: F.body, color: C.parchment, textAlign: "center", lineHeight: 24 },

  // Feedback
  feedbackBanner: {
    borderRadius: 12, padding: 12, alignItems: "center",
  },
  feedbackText: { fontSize: 14, fontFamily: F.bodySemi, color: "#fff" },
  submitBtn: {
    backgroundColor: C.gold, borderRadius: 14, paddingVertical: 14, alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: { fontSize: 15, fontFamily: F.label, color: C.bg1 },

  // Result
  resultContainer: {
    flex: 1, justifyContent: "center", alignItems: "center", gap: 14, padding: 24,
  },
  resultEmoji: { fontSize: 64 },
  resultTitle: { fontSize: 24, fontFamily: F.label, color: C.parchment },
  resultScore: { fontSize: 56, fontFamily: F.label, color: C.gold },
  resultSub: { fontSize: 16, fontFamily: F.body, color: C.textMuted },
  xpBubble: {
    backgroundColor: C.gold, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10,
  },
  xpText: { fontSize: 20, fontFamily: F.label, color: C.bg1 },
  badgeBubble: {
    backgroundColor: C.bg3, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 8,
    borderWidth: 1, borderColor: C.gold,
  },
  badgeText: { fontSize: 15, fontFamily: F.bodySemi, color: C.gold },
  continueBtn: {
    backgroundColor: C.bg2, borderRadius: 16, paddingHorizontal: 32, paddingVertical: 14,
    marginTop: 8,
  },
  continueBtnText: { fontSize: 16, fontFamily: F.label, color: C.parchment },

  // Pronunciation quiz
  pronContainer: { flex: 1, alignItems: "center", gap: 16, paddingVertical: 8 },
  pronProgress: { fontSize: 13, fontFamily: F.body, color: C.textMuted },
  pronCard: {
    width: "100%", backgroundColor: C.bg2, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: C.border, gap: 8,
  },
  pronSentenceLabel: { fontSize: 13, fontFamily: F.body, color: C.textMuted },
  pronSentenceText: { fontSize: 18, fontFamily: F.bodySemi, color: C.parchment, textAlign: "center" },
  pronMicBtn: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: C.gold,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.gold, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  pronMicBtnActive: {
    backgroundColor: "#c62828",
    shadowColor: "#c62828", shadowOpacity: 0.5, shadowRadius: 16,
  },
  pronStatusText: { fontSize: 14, fontFamily: F.body, color: C.textMuted },
  pronScoreBox: {
    alignItems: "center", borderWidth: 2, borderRadius: 16,
    paddingHorizontal: 24, paddingVertical: 12, gap: 2,
  },
  pronScoreNum: { fontSize: 48, fontFamily: F.label },
  pronScoreLabel: { fontSize: 13, fontFamily: F.body, color: C.textMuted },
  pronFeedbackLabel: { fontSize: 15, fontFamily: F.bodySemi, marginTop: 4 },
  pronErrorText: { fontSize: 13, fontFamily: F.body, color: "#f44336", textAlign: "center" },
  pronActionRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  pronRetryBtn: {
    flex: 1, backgroundColor: C.bg3, borderRadius: 14, paddingVertical: 12,
    alignItems: "center", borderWidth: 1, borderColor: C.border,
  },
  pronRetryText: { fontSize: 14, fontFamily: F.bodySemi, color: C.parchment },
  pronNextBtn: {
    flex: 1, backgroundColor: C.gold, borderRadius: 14, paddingVertical: 12,
    alignItems: "center",
  },
  pronNextText: { fontSize: 14, fontFamily: F.label, color: C.bg1 },
});

// ─── Voice Power Styles ──────────────────────────────────────────────────────

const vpStyles = StyleSheet.create({
  stoneRow: {
    flexDirection: "row", gap: 12, justifyContent: "center", marginVertical: 8,
  },
  stone: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: "center", alignItems: "center",
    shadowOpacity: 0.6, shadowRadius: 12, elevation: 8,
  },
  stoneIcon: { fontSize: 22 },
  stoneLabel: {
    fontSize: 14, fontFamily: F.label, textAlign: "center",
  },
  translationText: {
    fontSize: 13, fontFamily: F.body, color: C.textMuted,
    textAlign: "center", fontStyle: "italic", marginTop: 4,
  },
});

// ─── Debate Battle Styles ────────────────────────────────────────────────────

const dbStyles = StyleSheet.create({
  npcArgBox: {
    backgroundColor: C.bg2, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border, gap: 6,
  },
  npcName: {
    fontSize: 12, fontFamily: F.label, color: C.gold, textTransform: "uppercase", letterSpacing: 1,
  },
  npcArgText: {
    fontSize: 15, fontFamily: F.body, color: C.parchment, lineHeight: 22,
  },
  exprRow: { gap: 6 },
  exprLabel: { fontSize: 12, fontFamily: F.body, color: C.textMuted },
  feedbackDetail: {
    fontSize: 14, fontFamily: F.body, color: C.parchment, textAlign: "center", lineHeight: 20,
  },
});

// ─── NPC Rescue Styles ───────────────────────────────────────────────────────

const nrStyles = StyleSheet.create({
  progressBarBg: {
    width: "100%", height: 6, backgroundColor: C.bg3, borderRadius: 3, overflow: "hidden",
  },
  progressBarFill: {
    height: "100%", backgroundColor: "#4caf50", borderRadius: 3,
  },
  rescueBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#c62828" + "22", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  rescueEmoji: { fontSize: 24 },
  rescueText: {
    fontSize: 15, fontFamily: F.label, color: "#c62828",
  },
});
