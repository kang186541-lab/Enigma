/**
 * WritingLock — a thin self-contained writing lock for the escape room.
 *
 * Presents a type-the-word challenge and calls `onUnlocked()` when the typed
 * answer is correct. Reuses the shared `checkAnswer` validator (lib/answerUtils),
 * the same one WritingMissionPuzzle uses in story-scene, so accepted spellings /
 * variants behave identically. Retry-until-correct (no fail state).
 *
 * This is a standalone reimplementation (not an import of the in-file
 * WritingMissionPuzzle) so the escape feature stays decoupled from the locked
 * story-scene.tsx — it never edits that file's types.
 */

import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Haptics from "expo-haptics";

import { checkAnswer, type AnswerResult } from "@/lib/answerUtils";
import { C, F } from "@/constants/theme";
import type { Tri } from "@/lib/escapeRooms";
import type { WritingMissionQ } from "@/lib/escapeRoomPuzzleTypes";

function tri(t: Tri, lang: string): string {
  if (lang === "korean") return t.ko;
  if (lang === "spanish") return t.es;
  if (lang === "indonesian") return t.id ?? t.en;
  if (lang === "arabic") return t.ar ?? t.en;
  return t.en;
}

export interface WritingLockProps {
  lang: string;
  learningLang: string;
  question: WritingMissionQ;
  onUnlocked: () => void;
}

export default function WritingLock({ lang, learningLang, question, onUnlocked }: WritingLockProps) {
  const [answer, setAnswer] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [done, setDone] = useState(false);

  const targetWord = tri(question.word, learningLang);
  const displayWord = tri(question.word, lang);
  const hintText = question.hint ? tri(question.hint, lang) : null;
  const isCorrect = result?.correct ?? false;

  function handleConfirm() {
    if (!answer.trim()) return;
    const r = checkAnswer(answer, targetWord, { acceptableAnswers: question.acceptableAnswers, learningLang });
    setResult(r);
    setConfirmed(true);
    if (r.correct) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }

  function handleContinue() {
    if (isCorrect) {
      if (done) return;
      setDone(true);
      onUnlocked();
    } else {
      // Retry: clear and let them type again.
      setConfirmed(false);
      setResult(null);
      setAnswer("");
    }
  }

  function feedbackText(): string {
    if (!result) return "";
    if (!result.correct) {
      return lang === "korean" ? `정답: ${targetWord}` : lang === "spanish" ? `Respuesta: ${targetWord}` : lang === "indonesian" ? `Jawaban: ${targetWord}` : lang === "arabic" ? `الإجابة: ${targetWord}` : `Answer: ${targetWord}`;
    }
    return lang === "korean" ? "정답이에요!" : lang === "spanish" ? "¡Correcto!" : lang === "indonesian" ? "Benar!" : lang === "arabic" ? "صح!" : "Correct!";
  }

  return (
    <View style={st.box}>
      <Text style={st.kicker}>{lang === "korean" ? "룬 자물쇠" : lang === "spanish" ? "Cerradura Rúnica" : lang === "indonesian" ? "Gembok Rune" : "Rune Lock"}</Text>
      <Text style={st.prompt}>
        {lang === "korean"
          ? `'${displayWord}'을(를) 입력하세요`
          : lang === "spanish"
            ? `Escribe '${displayWord}'`
            : lang === "indonesian"
              ? `Tulis '${displayWord}'`
              : lang === "arabic"
                ? `اكتب '${displayWord}'`
                : `Type '${displayWord}'`}
      </Text>
      {hintText && <Text style={st.hint}>{hintText}</Text>}

      <TextInput
        style={[st.input, confirmed && (isCorrect ? st.inputCorrect : st.inputWrong)]}
        value={answer}
        onChangeText={setAnswer}
        placeholder={lang === "korean" ? "여기에 입력하세요..." : lang === "spanish" ? "Escribe aquí..." : lang === "indonesian" ? "Ketik di sini..." : lang === "arabic" ? "اكتب هنا..." : "Type here..."}
        placeholderTextColor={C.goldDim}
        editable={!confirmed}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {confirmed && (
        <View style={[st.result, { backgroundColor: isCorrect ? "rgba(90,170,90,0.15)" : "rgba(200,70,70,0.15)" }]}>
          <Text style={{ fontFamily: F.bodySemi, fontSize: 14, color: isCorrect ? C.success : "#e55" }}>{feedbackText()}</Text>
        </View>
      )}

      {!confirmed ? (
        <Pressable style={[st.btn, { opacity: answer.trim() ? 1 : 0.5 }]} onPress={handleConfirm} disabled={!answer.trim()}>
          <Text style={st.btnText}>{lang === "korean" ? "확인" : lang === "spanish" ? "Confirmar" : lang === "indonesian" ? "Periksa" : lang === "arabic" ? "شوف" : "Check"}</Text>
        </Pressable>
      ) : (
        <Pressable style={st.btn} onPress={handleContinue}>
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
  prompt: { color: C.parchment, fontFamily: F.bodySemi, fontSize: 16, lineHeight: 21 },
  hint: { color: C.goldDim, fontFamily: F.body, fontSize: 13, fontStyle: "italic" },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(0,0,0,0.24)",
    color: C.parchment,
    fontFamily: F.bodySemi,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputCorrect: { borderColor: C.success },
  inputWrong: { borderColor: "#d55" },
  result: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
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
