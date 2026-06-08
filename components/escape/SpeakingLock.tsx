/**
 * SpeakingLock — the one net-new interactive lock for the escape room.
 *
 * Glue over recordAudio + /api/pronunciation-assess, using the proven acceptance
 * contract from app/basic-course.tsx:504-510 / 1028-1056:
 *   recordAudio(ms) → isValidSpokenAudio(base64) → POST /api/pronunciation-assess
 *   → isAcceptedPronunciationResult(data) → unlock.
 *
 * Speak-first rules:
 *   - Attempt-over-accuracy: an accepted result unlocks. If `minScore` is set and
 *     the score is below it, we ask to retry — but auto-pass after 3 attempts so a
 *     beginner is never hard-stuck.
 *   - Accept-unscored: if the provider is unreachable (503 / non-OK / no score),
 *     a *valid* recording still unlocks (matches the brand's "continue without
 *     score" rule). onUnlocked(null) signals an unscored pass.
 *   - Tiered hint reveal: h1 → h2 → reveal-phrase after 1 / 2 / 3 attempts
 *     (parity with BossSpell's 5-mistake auto-reveal).
 */

import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import { recordAudio } from "@/lib/audio";
import { getApiUrl } from "@/lib/query-client";
import { apiFetchWithAuth } from "@/lib/apiFetchWithAuth";
import { C, F } from "@/constants/theme";
import { EmojiText } from "@/components/EmojiText";
import type { HintTri, Tri } from "@/lib/escapeRooms";

const MIN_SPOKEN_AUDIO_BASE64_LEN = 2000; // mirror basic-course.tsx:42
const RECORDING_MS = 8000; // mirror basic-course/speak recording window

function isValidSpokenAudio(base64: string): boolean {
  return base64.length >= MIN_SPOKEN_AUDIO_BASE64_LEN;
}

function isAcceptedPronunciationResult(data: Record<string, any> | null): data is { score: number } {
  return data?.success === true && typeof data.score === "number";
}

function tri(t: Tri, lang: string): string {
  if (lang === "korean") return t.ko;
  if (lang === "spanish") return t.es;
  if (lang === "indonesian") return t.id ?? t.en;
  if (lang === "arabic") return t.ar ?? t.en;
  return t.en;
}

function resolveHint(h: HintTri, ui: string, learn: string): string {
  const s: Tri = h.byLearning?.[learn] ?? h;
  if (ui === "korean") return s.ko ?? s.en;
  if (ui === "spanish") return s.es ?? s.en;
  if (ui === "indonesian") return s.id ?? s.en;
  if (ui === "arabic") return s.ar ?? s.en;
  return s.en;
}

type Phase = "idle" | "recording" | "processing" | "unlocked" | "retry";

export interface SpeakingLockProps {
  lang: string;
  learningLang: string;
  instruction: Tri;
  phrase: Tri;
  /** Azure assess lang code, e.g. ko-KR / es-ES / en-US / id-ID / ar-EG. */
  speechLang: string;
  nativeLang?: string;
  hints: { h1: HintTri; h2: HintTri; h3?: HintTri };
  minScore?: number;
  /** Called once on accept. `null` = accepted-unscored (provider unavailable). */
  onUnlocked: (score: number | null) => void;
}

export default function SpeakingLock(props: SpeakingLockProps) {
  const { lang, learningLang } = props;
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const target = tri(props.phrase, learningLang);

  const onRecord = useCallback(async () => {
    if (phase === "recording" || phase === "processing" || phase === "unlocked") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setPhase("recording");
    setScore(null);
    try {
      const { base64, mimeType } = await recordAudio(RECORDING_MS);
      if (!isValidSpokenAudio(base64)) {
        // Too short to be a real attempt — don't count it, just ask to retry.
        setAttempts((a) => a + 1);
        setPhase("retry");
        return;
      }
      setPhase("processing");
      const url = new URL("/api/pronunciation-assess", getApiUrl()).toString();
      const res = await apiFetchWithAuth(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: target, lang: props.speechLang, audio: base64, mimeType, nativeLang: props.nativeLang ?? props.lang }),
      });
      const data = res.ok ? ((await res.json()) as Record<string, any>) : null;
      const next = attempts + 1;
      setAttempts(next);

      if (isAcceptedPronunciationResult(data)) {
        if (props.minScore != null && data.score < props.minScore && next < 3) {
          setScore(data.score);
          setPhase("retry"); // below threshold → retry, but auto-pass after 3
          return;
        }
        setScore(data.score);
        setPhase("unlocked");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        props.onUnlocked(data.score);
        return;
      }

      // Provider unreachable / unscored. After a valid recording, accept
      // (attempt-over-accuracy) — but only after the 1st real attempt so it
      // isn't a silent skip on the very first tap.
      if (next >= 1) {
        setPhase("unlocked");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        props.onUnlocked(null);
        return;
      }
      setPhase("retry");
    } catch {
      setAttempts((a) => a + 1);
      setPhase("retry");
    }
  }, [phase, attempts, target, props]);

  // Tiered hint: idle prompt → h1 → h2 → reveal the phrase after 3 attempts.
  const hint =
    attempts >= 3
      ? target
      : attempts >= 2
        ? resolveHint(props.hints.h2, lang, learningLang)
        : attempts >= 1
          ? resolveHint(props.hints.h1, lang, learningLang)
          : lang === "korean"
            ? "자물쇠가 네 목소리를 기다려요."
            : lang === "spanish"
              ? "La cerradura espera tu voz."
              : lang === "indonesian"
                ? "Gembok menunggu suaramu."
                : "The lock awaits your voice.";

  const busy = phase === "recording" || phase === "processing" || phase === "unlocked";

  return (
    <View style={s.box}>
      <Text style={s.kicker}>{lang === "korean" ? "음성 자물쇠" : lang === "spanish" ? "Cerradura de Voz" : lang === "indonesian" ? "Gembok Suara" : "Voice Lock"}</Text>
      <Text style={s.instruction}>{tri(props.instruction, lang)}</Text>
      <Text style={s.phrase}>{target}</Text>

      <Pressable
        style={[s.mic, phase === "recording" && s.micActive, phase === "unlocked" && s.micDone]}
        onPress={onRecord}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={lang === "korean" ? "말하기" : lang === "spanish" ? "Hablar" : lang === "indonesian" ? "Bicara" : "Speak"}
      >
        {phase === "processing" ? (
          <ActivityIndicator color={C.bg1} />
        ) : (
          <EmojiText style={s.micText}>
            {phase === "recording"
              ? lang === "korean"
                ? "듣는 중…"
                : lang === "spanish"
                  ? "Escuchando…"
                  : lang === "indonesian"
                    ? "Mendengarkan…"
                    : "Listening…"
              : phase === "unlocked"
                ? lang === "korean"
                  ? "열림 ✓"
                  : lang === "spanish"
                    ? "Desbloqueado ✓"
                    : lang === "indonesian"
                      ? "Terbuka ✓"
                      : "Unlocked ✓"
                : lang === "korean"
                  ? "🎙 말하기"
                  : lang === "spanish"
                    ? "🎙 Hablar"
                    : lang === "indonesian"
                      ? "🎙 Bicara"
                      : "🎙 Speak"}
          </EmojiText>
        )}
      </Pressable>

      {phase === "retry" && (
        <Text style={s.retry}>
          {lang === "korean" ? "다시 말해볼까요?" : lang === "spanish" ? "Inténtalo de nuevo" : lang === "indonesian" ? "Coba lagi" : "Try again"}
        </Text>
      )}
      {phase === "unlocked" && score != null && <Text style={s.scoreText}>{`★ ${Math.round(score)}`}</Text>}

      <View style={s.hintRow}>
        <Text style={s.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(10,6,4,0.64)",
    padding: 16,
    gap: 10,
    alignItems: "center",
  },
  kicker: {
    color: C.gold,
    fontFamily: F.header,
    fontSize: 15,
    alignSelf: "flex-start",
  },
  instruction: {
    color: C.parchment,
    fontFamily: F.bodySemi,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
  phrase: {
    color: "#FFE7A3",
    fontFamily: F.header,
    fontSize: 22,
    textAlign: "center",
    marginVertical: 4,
  },
  mic: {
    minWidth: 180,
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  micActive: {
    backgroundColor: "#FFD166",
  },
  micDone: {
    backgroundColor: C.success,
  },
  micText: {
    color: C.bg1,
    fontFamily: F.bodyBold,
    fontSize: 17,
  },
  retry: {
    color: "#e88",
    fontFamily: F.bodySemi,
    fontSize: 14,
  },
  scoreText: {
    color: C.gold,
    fontFamily: F.bodyBold,
    fontSize: 16,
  },
  hintRow: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.28)",
    backgroundColor: "rgba(0,0,0,0.24)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hint: {
    color: C.parchment,
    fontFamily: F.bodySemi,
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
  },
});
