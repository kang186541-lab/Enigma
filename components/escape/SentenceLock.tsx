/**
 * SentenceLock — a thin self-contained sentence-builder lock for the escape room.
 *
 * Presents word cards the learner taps into order, and calls `onUnlocked()` when
 * the placed order exactly matches `question.answerOrder`. Validation mirrors
 * SentenceBuilderPuzzle in story-scene exactly:
 *   JSON.stringify(placed) === JSON.stringify(q.answerOrder)
 * with words rendered as `tri(words[i], learningLang)`. Retry-until-correct.
 *
 * Standalone reimplementation (not an import of the in-file SentenceBuilderPuzzle)
 * so the escape feature stays decoupled from the locked story-scene.tsx.
 *
 * NOTE: SentenceBuilder validates an EXACT per-learning-language order, so the
 * caller (escape-room.tsx) only routes EN/ES/ID learners here; KO/AR get a
 * WritingLock instead (a single answerOrder can't be correct for KO word order).
 */

import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import { C, F } from "@/constants/theme";
import type { Tri } from "@/lib/escapeRooms";
import type { SentenceBuilderQ } from "@/lib/escapeRoomPuzzleTypes";

function tri(t: Tri, lang: string): string {
  if (lang === "korean") return t.ko;
  if (lang === "spanish") return t.es;
  if (lang === "indonesian") return t.id ?? t.en;
  if (lang === "arabic") return t.ar ?? t.en;
  return t.en;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface SentenceLockProps {
  lang: string;
  learningLang: string;
  question: SentenceBuilderQ;
  onUnlocked: () => void;
}

export default function SentenceLock({ lang, learningLang, question, onUnlocked }: SentenceLockProps) {
  const [placed, setPlaced] = useState<number[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [done, setDone] = useState(false);
  // Stable shuffle of word indices for the bank (computed once).
  const [shuf] = useState(() => shuffle(question.words.map((_, i) => i)));

  function tapWord(originalIdx: number) {
    if (confirmed) return;
    setPlaced((p) => (p.includes(originalIdx) ? p.filter((x) => x !== originalIdx) : [...p, originalIdx]));
  }

  function handleCheck() {
    const correct = JSON.stringify(placed) === JSON.stringify(question.answerOrder);
    setIsCorrect(correct);
    setConfirmed(true);
    Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
  }

  function handleNext() {
    if (isCorrect) {
      if (done) return;
      setDone(true);
      onUnlocked();
    } else {
      setPlaced([]);
      setConfirmed(false);
      setIsCorrect(false);
    }
  }

  return (
    <View style={st.box}>
      <Text style={st.kicker}>{lang === "korean" ? "단어 자물쇠" : lang === "spanish" ? "Cerradura de Palabras" : lang === "indonesian" ? "Gembok Kata" : "Word Lock"}</Text>
      <Text style={st.instruction}>{tri(question.instruction, lang)}</Text>

      <View style={st.answerRow}>
        {placed.length === 0 ? (
          <Text style={st.placeholder}>
            {lang === "korean" ? "단어를 탭하세요..." : lang === "spanish" ? "Toca las palabras..." : lang === "indonesian" ? "Ketuk kata di bawah..." : "Tap words below..."}
          </Text>
        ) : (
          placed.map((originalIdx, i) => (
            <Pressable key={i} style={st.answerChip} onPress={() => tapWord(originalIdx)}>
              <Text style={st.answerChipText}>{tri(question.words[originalIdx], learningLang)}</Text>
            </Pressable>
          ))
        )}
      </View>

      {confirmed && (
        <Text style={[st.feedback, { color: isCorrect ? C.success : "#e55" }]}>
          {isCorrect
            ? lang === "korean"
              ? "정답이에요!"
              : lang === "spanish"
                ? "¡Correcto!"
                : lang === "indonesian"
                  ? "Benar!"
                  : "Correct!"
            : lang === "korean"
              ? "다시 시도해요"
              : lang === "spanish"
                ? "Inténtalo de nuevo"
                : lang === "indonesian"
                  ? "Coba lagi"
                  : "Try again"}
        </Text>
      )}

      <View style={st.bank}>
        {shuf.map((originalIdx) => {
          const inPlaced = placed.includes(originalIdx);
          return (
            <Pressable key={originalIdx} style={[st.chip, inPlaced && st.chipUsed]} onPress={() => tapWord(originalIdx)}>
              <Text style={[st.chipText, inPlaced && st.chipTextUsed]}>{tri(question.words[originalIdx], learningLang)}</Text>
            </Pressable>
          );
        })}
      </View>

      {!confirmed ? (
        <Pressable style={[st.btn, { opacity: placed.length > 0 ? 1 : 0.5 }]} onPress={handleCheck} disabled={placed.length === 0}>
          <Text style={st.btnText}>{lang === "korean" ? "확인" : lang === "spanish" ? "Verificar" : lang === "indonesian" ? "Periksa" : "Check"}</Text>
        </Pressable>
      ) : (
        <Pressable style={st.btn} onPress={handleNext}>
          <Text style={st.btnText}>
            {isCorrect
              ? lang === "korean"
                ? "잠금 해제"
                : lang === "spanish"
                  ? "Desbloquear"
                  : lang === "indonesian"
                    ? "Buka"
                    : "Unlock"
              : lang === "korean"
                ? "다시 시도"
                : lang === "spanish"
                  ? "Reintentar"
                  : lang === "indonesian"
                    ? "Coba lagi"
                    : "Try Again"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  box: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(10,6,4,0.64)",
    padding: 16,
    gap: 12,
  },
  kicker: { color: C.gold, fontFamily: F.header, fontSize: 15 },
  instruction: { color: C.parchment, fontFamily: F.bodySemi, fontSize: 16, lineHeight: 21 },
  answerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minHeight: 44,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.28)",
    backgroundColor: "rgba(0,0,0,0.18)",
    padding: 10,
  },
  placeholder: { color: C.goldDim, fontFamily: F.body, fontSize: 14, fontStyle: "italic" },
  answerChip: {
    borderRadius: 8,
    backgroundColor: "rgba(201,162,39,0.82)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  answerChipText: { color: C.bg1, fontFamily: F.bodyBold, fontSize: 15 },
  feedback: { fontFamily: F.bodySemi, fontSize: 14 },
  bank: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(44,24,16,0.84)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipUsed: { opacity: 0.35 },
  chipText: { color: C.parchment, fontFamily: F.bodyBold, fontSize: 15 },
  chipTextUsed: { color: C.goldDim },
  btn: {
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  btnText: { color: C.bg1, fontFamily: F.bodyBold, fontSize: 16 },
});
