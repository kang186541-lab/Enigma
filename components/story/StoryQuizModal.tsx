import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Modal, Pressable, ScrollView,
  TextInput, ActivityIndicator, Animated, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { C, F } from "@/constants/theme";
import type { LoadedQuiz, LangCode } from "@/constants/storyTypes";
import { fillGptPrompt } from "@/lib/storyUtils";
import { getApiUrl, apiRequest } from "@/lib/query-client";

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
  onPlay?: (v: boolean) => void
) {
  const url = new URL("/api/tts", apiBase);
  url.searchParams.set("text", script);
  url.searchParams.set("voice", voice);
  onPlay?.(true);
  try {
    if (Platform.OS === "web") {
      const audio = new (window as { Audio: new (src: string) => HTMLAudioElement }).Audio(url.toString());
      audio.volume = 1.0;
      audio.onended = () => onPlay?.(false);
      await audio.play();
    } else {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url.toString() },
        { shouldPlay: true, volume: 1.0 }
      );
      sound.setOnPlaybackStatusUpdate((st) => {
        if ("didJustFinish" in st && st.didJustFinish) {
          onPlay?.(false);
          sound.unloadAsync();
        }
      });
    }
  } catch {
    onPlay?.(false);
  }
}

/** Call GPT with a prompt and user message */
async function callGPT(systemPrompt: string, userMessage: string): Promise<string> {
  try {
    const res = await apiRequest("POST", "/api/quiz-evaluate", { systemPrompt, userMessage });
    const data = await res.json() as { reply?: string };
    return data?.reply ?? "";
  } catch {
    return "";
  }
}

// ─── Result Screen ─────────────────────────────────────────────────────────────

function ResultView({
  xp, correct, total, badge, onContinue,
}: {
  xp: number; correct: number; total: number; badge?: string; onContinue: () => void;
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
        {passed ? "Great job!" : "Keep trying!"}
      </Text>
      <Text style={styles.resultScore}>{pct}%</Text>
      <Text style={styles.resultSub}>
        {correct}/{total} correct
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
        <Text style={styles.continueBtnText}>Continue →</Text>
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
    const isCorrect = choice === pair.right;
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
          const isCorrectChoice = ch === pair.right;
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
    const correct = blanks.filter(b => answers[b.id] === b.answer).length;
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
                done && answers[blanks[i].id] === blanks[i].answer && { backgroundColor: "#2e7d3233" },
                done && answers[blanks[i].id] !== blanks[i].answer && answers[blanks[i].id] != null && { backgroundColor: "#c6282833" },
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
          <Text style={styles.blankNum}>Blank {blank.id}</Text>
          {blank.hint && (
            <Text style={styles.hintText}>💡 {blank.hint[nativeLang] ?? blank.hint.en ?? ""}</Text>
          )}
          <View style={styles.choicesGrid}>
            {blank.options.map((opt) => {
              const chosen = answers[blank.id] === opt;
              let bg = C.bg2;
              if (done && chosen && opt === blank.answer) bg = "#2e7d32";
              else if (done && chosen && opt !== blank.answer) bg = "#c62828";
              else if (done && opt === blank.answer) bg = "#2e7d32";
              else if (chosen) bg = C.gold;
              return (
                <Pressable key={opt} style={[styles.choiceBtn, { backgroundColor: bg }]}
                  onPress={() => {
                    selectAnswer(blank.id, opt);
                    if (activeBlank < blanks.length - 1) setActiveBlank(i => i + 1);
                  }}>
                  <Text style={[styles.choiceBtnText, (chosen || (done && opt === blank.answer)) && { color: "#fff" }]}>{opt}</Text>
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
          <Text style={styles.submitBtnText}>Check Answers ✓</Text>
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
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correct, setCorrect] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const q = questions[qIdx];

  useEffect(() => {
    setBank(shuffle(q?.scrambled ?? []));
    setBuilt([]);
    setFeedback(null);
    setShowHint(false);
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
    setFeedback(isCorrect ? "correct" : "wrong");
    Haptics.impactAsync(isCorrect ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    if (isCorrect) setCorrect(c => c + 1);
    setTimeout(() => {
      if (qIdx + 1 >= questions.length) {
        onDone(isCorrect ? correct + 1 : correct, questions.length);
      } else {
        setQIdx(i => i + 1);
      }
    }, 1000);
  }

  return (
    <View style={styles.quizBody}>
      <Text style={styles.progressLabel}>{qIdx + 1} / {questions.length}</Text>
      <Text style={styles.instructionText}>Arrange the words into the correct sentence:</Text>

      {/* Built sentence */}
      <View style={styles.builtBox}>
        {built.length === 0
          ? <Text style={styles.builtPlaceholder}>Tap words below to build the sentence</Text>
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
      <Pressable onPress={() => setShowHint(h => !h)} style={styles.hintToggle}>
        <Text style={styles.hintToggleText}>💡 {showHint ? "Hide hint" : "Show hint"}</Text>
      </Pressable>
      {showHint && q.hint && (
        <Text style={styles.hintText}>{q.hint[nativeLang] ?? q.hint.en}</Text>
      )}

      {/* Feedback */}
      {feedback && (
        <View style={[styles.feedbackBanner, { backgroundColor: feedback === "correct" ? "#2e7d32" : "#c62828" }]}>
          <Text style={styles.feedbackText}>{feedback === "correct" ? "✓ Correct!" : `✗ Answer: ${q.answer}`}</Text>
        </View>
      )}

      {built.length > 0 && !feedback && (
        <Pressable style={styles.submitBtn} onPress={checkAnswer}>
          <Text style={styles.submitBtnText}>Check ✓</Text>
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
    const acceptable = q.acceptableAnswers ?? [q.answer];
    const isCorrect = acceptable.some(a => normalise(a) === normalise(input));
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
          {playing ? "Playing..." : "Play Recording"}
        </Text>
      </Pressable>

      <Text style={styles.instructionText}>{qText}</Text>

      <TextInput
        style={styles.textInput}
        value={input}
        onChangeText={setInput}
        placeholder="Type your answer..."
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
          <Text style={styles.submitBtnText}>Submit ✓</Text>
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
      } catch { /* fall through */ }
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
        placeholder="Your answer..."
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
          <Text style={styles.submitBtnText}>Submit ✓</Text>
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
    } catch {
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
        <Text style={styles.progressLabel}>Orders: {ordersComplete}/3 ✓</Text>
      )}

      {/* Chat */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <Text style={styles.chatPlaceholder}>Start the conversation...</Text>
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
    } catch {
      setFeedback("Submitted! Keep practising.");
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
        <Text style={styles.writeVocabLabel}>Required words:</Text>
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
            <Text style={styles.submitBtnText}>Next →</Text>
          </Pressable>
        </View>
      )}

      {!loading && !feedback && input.trim().length > 10 && (
        <Pressable style={styles.submitBtn} onPress={submit}>
          <Text style={styles.submitBtnText}>Submit for Review ✓</Text>
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
              {playing ? "Playing..." : "Play"}
            </Text>
          </Pressable>
          <Text style={styles.bossQuestion}>{r.question}</Text>
          <TextInput style={styles.textInput} value={input} onChangeText={setInput}
            placeholder="Answer..." placeholderTextColor={C.textMuted}
            returnKeyType="done" onSubmitEditing={submitText} />
          {!feedback && input.length > 0 && (
            <Pressable style={styles.submitBtn} onPress={submitText}>
              <Text style={styles.submitBtnText}>Submit ✓</Text>
            </Pressable>
          )}
        </>
      );
    }

    if (r.type === "translation") {
      const src = r.source?.[quiz.nativeLang] ?? r.source?.en ?? "";
      return (
        <>
          <Text style={styles.instructionText}>Translate to {quiz.targetLang === "ko" ? "Korean" : quiz.targetLang === "es" ? "Spanish" : "English"}:</Text>
          <View style={styles.riddleBox}>
            <Text style={styles.riddleText}>{src}</Text>
          </View>
          <TextInput style={styles.textInput} value={input} onChangeText={setInput}
            placeholder="Translation..." placeholderTextColor={C.textMuted}
            returnKeyType="done" onSubmitEditing={submitText} />
          {!feedback && input.length > 0 && (
            <Pressable style={styles.submitBtn} onPress={submitText}>
              <Text style={styles.submitBtnText}>Submit ✓</Text>
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
              <Text style={styles.submitBtnText}>Submit ✓</Text>
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
              <Text style={styles.submitBtnText}>Submit ✓</Text>
            </Pressable>
          )}
        </>
      );
    }

    return <Text style={styles.instructionText}>Unknown round type: {r.type}</Text>;
  }

  return (
    <View style={styles.quizBody}>
      {/* Timer */}
      <View style={[styles.timerRow, { borderColor: urgentColor }]}>
        <Ionicons name="timer" size={20} color={urgentColor} />
        <Text style={[styles.timerText, { color: urgentColor }]}>{timeLeft}s</Text>
        <Text style={styles.progressLabel}> Round {round + 1}/{rounds.length}</Text>
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
      default:
        return <Text style={styles.instructionText}>Quiz type not yet supported: {quiz!.type}</Text>;
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
});
