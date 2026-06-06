/**
 * StorySpeakAfterCard — the "listen → speak it once" step that runs AFTER a
 * story language-quiz solve when the puzzle is flagged `speakAfter: true`.
 *
 * Why it exists: ~45 story quizzes carried `speakAfter: true` in data, but the
 * flag was never read — answering a quiz never led to actually SPEAKING the
 * sentence, so story mode silently dropped the speak-first contract. This card
 * closes that gap: Rudy reads the target sentence, the learner records once, we
 * pronunciation-assess it, and show a gentle score.
 *
 * Speak-first / never-stuck rules (mirror Step1ListenRepeat + escape SpeakingLock):
 *   - recordAudio → isValidSpokenAudio → POST /api/pronunciation-assess → score.
 *   - Accept-unscored: if the provider is unreachable (non-OK / no score), a
 *     VALID recording still passes (brand "continue without score" rule).
 *   - Never a hard wall: a quiet "나중에" skip is always available, so a blocked
 *     mic or a bad day never blocks story progress.
 *
 * This is a self-contained card (its own audio lifecycle); it does NOT gate XP —
 * the quiz solve already awarded XP before this card is shown.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { recordAudio } from "@/lib/audio";
import { getApiUrl } from "@/lib/query-client";
import { apiFetchWithAuth } from "@/lib/apiFetchWithAuth";
import { registerGlobalSound, registerGlobalWebAudio, stopAllTTSSync } from "@/lib/ttsManager";
import { BidiTargetText } from "@/components/BidiTargetText";
import { EmojiText } from "@/components/EmojiText";
import { C, F } from "@/constants/theme";

const RECORDING_MS = 8000;
const MIN_SPOKEN_AUDIO_BASE64_LEN = 2000;

type Phase = "idle" | "playing" | "recording" | "assessing" | "done";

function isValidSpokenAudio(base64: string): boolean {
  return !!base64 && base64.length >= MIN_SPOKEN_AUDIO_BASE64_LEN;
}

function hasRecognizedSpeech(data: Record<string, any>): boolean {
  const t = data.recognizedText ?? data.text ?? data.displayText ?? "";
  return typeof t === "string" && t.trim().length > 0;
}

export interface StorySpeakAfterCardProps {
  /** Target-language sentence the learner should say (already learningLang-resolved). */
  phrase: string;
  /** Native-language meaning shown under the phrase (optional). */
  meaning?: string;
  /** Azure assess + TTS lang code: ko-KR / es-ES / id-ID / ar-EG / en-US. */
  speechLang: string;
  /** Native UI language name: korean / english / spanish / indonesian / arabic. */
  nativeLang: string;
  /** Optional explicit TTS voice. */
  ttsVoice?: string;
  /** Called when the learner finishes (recorded once) or skips — advance the story. */
  onDone: () => void;
}

export default function StorySpeakAfterCard({
  phrase,
  meaning,
  speechLang,
  nativeLang,
  ttsVoice,
  onDone,
}: StorySpeakAfterCardProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [unscored, setUnscored] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const apiBase = getApiUrl();

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      stopAllTTSSync();
    };
  }, []);

  const ko = nativeLang === "korean";
  const es = nativeLang === "spanish";
  const id = nativeLang === "indonesian";
  const ar = nativeLang === "arabic";

  const playTTS = useCallback(async () => {
    if (phase === "recording" || phase === "assessing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const prev = phase;
    setPhase("playing");
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const url = new URL("/api/pronunciation-tts", apiBase);
      url.searchParams.set("text", phrase);
      url.searchParams.set("lang", speechLang);
      if (ttsVoice) url.searchParams.set("voice", ttsVoice);

      if (typeof document !== "undefined") {
        const res = await apiFetchWithAuth(url.toString());
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
        registerGlobalWebAudio(audio);
        audio.onended = () => setPhase((p) => (p === "playing" ? prev === "done" ? "done" : "idle" : p));
        audio.onerror = () => setPhase((p) => (p === "playing" ? prev === "done" ? "done" : "idle" : p));
        await audio.play();
      } else {
        const { sound } = await Audio.Sound.createAsync({ uri: url.toString() }, { shouldPlay: true });
        soundRef.current = sound;
        registerGlobalSound(sound);
        sound.setOnPlaybackStatusUpdate((st) => {
          if (st.isLoaded && st.didJustFinish) {
            soundRef.current = null;
            setPhase((p) => (p === "playing" ? (prev === "done" ? "done" : "idle") : p));
          }
        });
      }
    } catch (e) {
      console.warn("[SpeakAfter] TTS playback failed:", e);
      setPhase((p) => (p === "playing" ? (prev === "done" ? "done" : "idle") : p));
    }
  }, [phase, apiBase, phrase, speechLang, ttsVoice]);

  const onRecord = useCallback(async () => {
    if (phase === "recording" || phase === "assessing" || phase === "playing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setPhase("recording");
    setScore(null);
    setUnscored(false);
    try {
      const { base64, mimeType } = await recordAudio(RECORDING_MS);
      if (!isValidSpokenAudio(base64)) {
        setAttempts((a) => a + 1);
        setPhase("idle"); // too short — let them try again, no penalty
        return;
      }
      setPhase("assessing");
      const url = new URL("/api/pronunciation-assess", apiBase).toString();
      const res = await apiFetchWithAuth(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: phrase, lang: speechLang, audio: base64, mimeType, nativeLang }),
      });
      const data = res.ok ? ((await res.json()) as Record<string, any>) : null;
      setAttempts((a) => a + 1);

      if (data && hasRecognizedSpeech(data)) {
        const s: number = data.pronunciationScore ?? data.score ?? 0;
        setScore(s);
        setUnscored(false);
        Haptics.notificationAsync(
          s >= 70 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
      } else {
        // Provider unreachable / no recognized speech → accept the recording
        // unscored (continue-without-score), since the audio itself was valid.
        setScore(null);
        setUnscored(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      setPhase("done");
    } catch (e) {
      console.warn("[SpeakAfter] recording/assess failed:", e);
      // A genuine recording error — still don't trap the learner: mark done unscored.
      setScore(null);
      setUnscored(true);
      setPhase("done");
    }
  }, [phase, apiBase, phrase, speechLang, nativeLang]);

  const stars = score != null ? Math.max(1, Math.min(5, Math.round(score / 20))) : 0;

  const promptLabel = ko
    ? "이번엔 직접 말해볼까요?"
    : es
      ? "¿Ahora lo dices tú?"
      : id
        ? "Sekarang coba ucapkan?"
        : ar
          ? "دلوقتي قولها بصوتك؟"
          : "Now say it yourself?";

  const listenLabel = ko ? "듣기" : es ? "Escuchar" : id ? "Dengar" : ar ? "اسمع" : "Listen";
  const micLabel =
    phase === "recording"
      ? ko ? "듣는 중…" : es ? "Escuchando…" : id ? "Mendengarkan…" : ar ? "بسمع…" : "Listening…"
      : ko ? "말하기" : es ? "Hablar" : id ? "Bicara" : ar ? "اتكلم" : "Speak";
  const continueLabel = ko ? "계속 →" : es ? "Continuar →" : id ? "Lanjut →" : ar ? "كمّل →" : "Continue →";
  const skipLabel = ko ? "나중에" : es ? "Más tarde" : id ? "Nanti" : ar ? "بعدين" : "Later";
  const tryAgainLabel = ko ? "한번 더" : es ? "Otra vez" : id ? "Coba lagi" : ar ? "تاني" : "Try again";
  const doneMsg = unscored
    ? ko ? "녹음 완료 ✓" : es ? "Grabado ✓" : id ? "Terekam ✓" : ar ? "اتسجّل ✓" : "Recorded ✓"
    : score != null && score >= 70
      ? ko ? "잘했어요!" : es ? "¡Bien hecho!" : id ? "Bagus!" : ar ? "برافو!" : "Nice!"
      : ko ? "좋아요, 계속 연습해요" : es ? "Bien, sigue practicando" : id ? "Bagus, terus berlatih" : ar ? "حلو، كمّل تمرين" : "Good — keep practicing";

  const busy = phase === "recording" || phase === "assessing" || phase === "playing";

  return (
    <View style={s.box}>
      <View style={s.rudyRow}>
        <EmojiText style={s.rudyEmoji}>🦊</EmojiText>
        <Text style={s.prompt}>{promptLabel}</Text>
      </View>

      <View style={s.phraseCard}>
        <BidiTargetText targetLang={speechLang} rtlAlign="center" style={s.phrase}>
          {phrase}
        </BidiTargetText>
        {meaning ? <Text style={s.meaning}>{meaning}</Text> : null}
      </View>

      <View style={s.controls}>
        <Pressable
          style={({ pressed }) => [s.listenBtn, pressed && { opacity: 0.8 }, busy && phase !== "playing" && { opacity: 0.5 }]}
          onPress={playTTS}
          disabled={phase === "recording" || phase === "assessing"}
        >
          {phase === "playing" ? (
            <ActivityIndicator size="small" color={C.gold} />
          ) : (
            <Ionicons name="volume-high" size={18} color={C.gold} />
          )}
          <Text style={s.listenText}>{listenLabel}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [s.mic, phase === "recording" && s.micActive, pressed && { opacity: 0.85 }]}
          onPress={onRecord}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={micLabel}
        >
          {phase === "assessing" ? (
            <ActivityIndicator color={C.bg1} />
          ) : (
            <>
              <Ionicons name={phase === "recording" ? "stop" : "mic"} size={20} color={C.bg1} />
              <Text style={s.micText}>{micLabel}</Text>
            </>
          )}
        </Pressable>
      </View>

      {phase === "done" && (
        <View style={s.result}>
          {score != null && (
            <View style={s.starsRow}>
              {Array.from({ length: 5 }, (_, i) => (
                <Text key={i} style={[s.star, i < stars ? s.starFilled : s.starEmpty]}>★</Text>
              ))}
              <Text style={s.scoreNum}>{Math.round(score)}%</Text>
            </View>
          )}
          <Text style={s.doneMsg}>{doneMsg}</Text>
          <View style={s.resultBtns}>
            <Pressable style={({ pressed }) => [s.retryBtn, pressed && { opacity: 0.8 }]} onPress={onRecord}>
              <Text style={s.retryText}>{tryAgainLabel}</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [s.continueBtn, pressed && { opacity: 0.85 }]} onPress={onDone}>
              <Text style={s.continueText}>{continueLabel}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {phase !== "done" && (
        <Pressable style={s.skip} onPress={onDone} disabled={phase === "recording" || phase === "assessing"}>
          <Text style={s.skipText}>{skipLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(10,6,4,0.5)",
    padding: 16,
    gap: 12,
    alignItems: "center",
  },
  rudyRow: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" },
  rudyEmoji: { fontSize: 26 },
  prompt: { color: C.parchment, fontFamily: F.bodySemi, fontSize: 14, flexShrink: 1 },
  phraseCard: {
    width: "100%",
    backgroundColor: C.bg2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    gap: 8,
    alignItems: "center",
  },
  phrase: { fontSize: 22, fontFamily: F.title, color: C.gold, textAlign: "center", lineHeight: 32 },
  meaning: { fontSize: 13, fontFamily: F.body, color: C.goldDim, fontStyle: "italic", textAlign: "center" },
  controls: { flexDirection: "row", gap: 12, alignItems: "center" },
  listenBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg2,
  },
  listenText: { fontSize: 13, fontFamily: F.bodySemi, color: C.gold },
  mic: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    minWidth: 150, minHeight: 52, borderRadius: 26, backgroundColor: C.gold, paddingHorizontal: 22,
  },
  micActive: { backgroundColor: "#e55" },
  micText: { color: C.bg1, fontFamily: F.bodyBold, fontSize: 16 },
  result: { width: "100%", alignItems: "center", gap: 8 },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  star: { fontSize: 20 },
  starFilled: { color: C.gold },
  starEmpty: { color: "rgba(201,162,39,0.2)" },
  scoreNum: { fontSize: 13, fontFamily: F.header, color: C.parchment, marginLeft: 6 },
  doneMsg: { fontSize: 14, fontFamily: F.bodySemi, color: C.parchment, textAlign: "center" },
  resultBtns: { flexDirection: "row", gap: 10, marginTop: 2 },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  retryText: { fontSize: 13, fontFamily: F.bodySemi, color: C.goldDim },
  continueBtn: { backgroundColor: C.gold, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  continueText: { fontSize: 13, fontFamily: F.header, color: C.bg1 },
  skip: { paddingVertical: 4 },
  skipText: { fontSize: 12, fontFamily: F.body, color: C.goldDim, textDecorationLine: "underline" },
});
