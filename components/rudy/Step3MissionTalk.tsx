import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Animated, Platform, ActivityIndicator, KeyboardAvoidingView,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { type MissionTalkLangData } from "@/lib/lessonContent";
import type { Tri } from "@/lib/dailyCourseData";

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "loading" | "idle" | "recording" | "processing" | "done";

interface ChatMsg {
  role: "rudy" | "user";
  text: string;
  isVoice?: boolean;
}

interface Props {
  data: MissionTalkLangData;
  nativeLang: string;
  lc: "ko" | "en" | "es";
  learningLang: string;
  onComplete: (sentenceCount: number, usedVoiceOnly: boolean, grammarNotes: string[]) => void;
}

// ── STT language mapping ──────────────────────────────────────────────────────

const STT_LANG: Record<string, string> = {
  english: "en-US", spanish: "es-ES", korean: "ko-KR",
};

// ── Helper ────────────────────────────────────────────────────────────────────

function getMeaning(t: Tri, lc: "ko" | "en" | "es"): string {
  return t[lc] ?? t.en;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Step3MissionTalk({ data, nativeLang, lc, learningLang, onComplete }: Props) {
  const [messages, setMessages]       = useState<ChatMsg[]>([]);
  const [phase, setPhase]             = useState<Phase>("loading");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [inputText, setInputText]     = useState("");
  const [totalSentences, setTotalSentences] = useState(0);
  const [grammarNotes, setGrammarNotes]    = useState<string[]>([]);
  const [usedKeyboard, setUsedKeyboard]    = useState(false);
  const [showDoneBanner, setShowDoneBanner] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);

  const nativeRecRef   = useRef<Audio.Recording | null>(null);
  const autoStopRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecRef    = useRef<any>(null);
  const soundRef       = useRef<Audio.Sound | null>(null);
  const scrollRef      = useRef<ScrollView>(null);
  const pulseAnim      = useRef(new Animated.Value(1)).current;
  const pulseLoop      = useRef<Animated.CompositeAnimation | null>(null);

  const apiBase  = getApiUrl();
  const sttLang  = STT_LANG[learningLang] ?? "en-US";
  const ttsLang  = data.speechLang;

  // Build GPT history from chatMsg array
  const buildHistory = (msgs: ChatMsg[]) =>
    msgs.map((m) => ({
      role: m.role === "rudy" ? "assistant" as const : "user" as const,
      content: m.text,
    }));

  // On mount — get Rudy's opening line
  useEffect(() => {
    (async () => {
      const rudyText = await fetchRudyLine([]);
      if (rudyText) {
        const opening: ChatMsg = { role: "rudy", text: rudyText };
        setMessages([opening]);
        await playTTS(rudyText);
      }
      setPhase("idle");
    })();
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
    };
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // ── GPT call ─────────────────────────────────────────────────────────────────

  async function fetchRudyLine(history: { role: "user" | "assistant"; content: string }[]): Promise<string> {
    try {
      const url = new URL("/api/mission-chat", apiBase).toString();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: data.gptPrompt,
          targetLang: learningLang,
          messages: history,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as {
        reply: string; sentenceCount: number;
        grammarNote: string; shouldEnd: boolean;
      };

      // Update tracking
      if (json.sentenceCount > 0) setTotalSentences(json.sentenceCount);
      if (json.grammarNote) setGrammarNotes((prev) => [...prev, json.grammarNote]);
      if (json.shouldEnd) {
        // Trigger completion after displaying message
        setTimeout(() => triggerDone(), 2500);
      }

      return json.reply;
    } catch {
      return nativeLang === "korean"
        ? "잠깐 연결에 문제가 생겼어. 다시 해볼까?"
        : "There was a connection issue. Let's try again!";
    }
  }

  // ── TTS ───────────────────────────────────────────────────────────────────────

  async function playTTS(text: string) {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

      const url = new URL("/api/pronunciation-tts", apiBase);
      url.searchParams.set("text", text);
      url.searchParams.set("lang", ttsLang);

      if (Platform.OS === "web") {
        const res = await fetch(url.toString());
        if (!res.ok) return;
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
        audio.play().catch(() => {});
      } else {
        const { sound } = await Audio.Sound.createAsync({ uri: url.toString() }, { shouldPlay: true });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((st) => {
          if (st.isLoaded && st.didJustFinish) soundRef.current = null;
        });
      }
    } catch {}
  }

  // ── Pulse anim ───────────────────────────────────────────────────────────────

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

  // ── Recording (native) ────────────────────────────────────────────────────────

  async function startRecording() {
    if (phase !== "idle") return;
    setShowKeyboard(false);
    setActiveSuggestion(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPhase("recording");
    startPulse();

    if (Platform.OS !== "web") {
      const { granted } = await Audio.requestPermissionsAsync().catch(() => ({ granted: false }));
      if (!granted) { stopPulse(); setPhase("idle"); return; }
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        nativeRecRef.current = rec;
        autoStopRef.current = setTimeout(() => stopNativeRecording(), 6000);
      } catch { stopPulse(); setPhase("idle"); }
    } else {
      if (!navigator?.mediaDevices?.getUserMedia) { stopPulse(); setPhase("idle"); return; }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      if (!stream) { stopPulse(); setPhase("idle"); return; }
      audioChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const rec = new (window as any).MediaRecorder(stream, { mimeType: mime });
      mediaRecRef.current = rec;
      rec.ondataavailable = (e: any) => { if (e.data?.size > 0) audioChunksRef.current.push(e.data); };
      rec.onstop = () => handleWebStop(mime, stream);
      rec.start();
      autoStopRef.current = setTimeout(() => { if (rec.state === "recording") rec.stop(); }, 6000);
    }
  }

  async function stopNativeRecording() {
    const rec = nativeRecRef.current;
    if (!rec) return;
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
    stopPulse();
    setPhase("processing");
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      nativeRecRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      if (!uri) throw new Error("no uri");
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" as any });
      await submitSTT(base64, "audio/m4a", true);
    } catch { setPhase("idle"); }
  }

  async function handleWebStop(mime: string, stream: MediaStream) {
    stopPulse();
    stream.getTracks().forEach((t: any) => t.stop());
    setPhase("processing");
    try {
      const blob = new Blob(audioChunksRef.current, { type: mime });
      const base64: string = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onloadend = () => res((r.result as string).split(",")[1] ?? "");
        r.onerror = rej;
        r.readAsDataURL(blob);
      });
      await submitSTT(base64, mime, true);
    } catch { setPhase("idle"); }
  }

  // ── STT ───────────────────────────────────────────────────────────────────────

  async function submitSTT(base64: string, mimeType: string, isVoice: boolean) {
    try {
      const url = new URL("/api/stt", apiBase).toString();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64, mimeType, language: sttLang }),
      });
      const data = res.ok ? await res.json() : {};
      const text: string = (data.text ?? "").trim();
      if (!text) { setPhase("idle"); return; }
      await sendUserMessage(text, isVoice);
    } catch { setPhase("idle"); }
  }

  // ── Send message (voice or keyboard) ─────────────────────────────────────────

  async function sendUserMessage(text: string, isVoice: boolean) {
    if (!isVoice) setUsedKeyboard(true);
    const userMsg: ChatMsg = { role: "user", text, isVoice };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInputText("");

    // Get Rudy's reply
    const history = buildHistory(newMsgs);
    const rudyText = await fetchRudyLine(history);
    const rudyMsg: ChatMsg = { role: "rudy", text: rudyText };
    setMessages((prev) => [...prev, rudyMsg]);
    await playTTS(rudyText);
    setPhase((cur) => cur === "done" ? "done" : "idle");
  }

  async function sendKeyboardMessage() {
    const text = inputText.trim();
    if (!text || phase !== "idle") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase("processing");
    await sendUserMessage(text, false);
    setPhase((cur) => cur === "done" ? "done" : "idle");
  }

  async function sendSuggestion(suggestion: string) {
    if (phase !== "idle") return;
    setActiveSuggestion(suggestion);
    await startRecording();
  }

  function handleMicPress() {
    if (phase === "recording") {
      if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
      if (Platform.OS !== "web") stopNativeRecording();
      else if (mediaRecRef.current?.state === "recording") mediaRecRef.current.stop();
    } else if (phase === "idle") {
      startRecording();
    }
  }

  function triggerDone() {
    setShowDoneBanner(true);
    setPhase("done");
    setTimeout(() => {
      onComplete(totalSentences, !usedKeyboard, grammarNotes);
    }, 2200);
  }

  // ── Labels ────────────────────────────────────────────────────────────────────

  const micLabel = phase === "recording"
    ? (nativeLang === "korean" ? "탭하여 중지 ■" : nativeLang === "spanish" ? "Toca para parar ■" : "Tap to stop ■")
    : (nativeLang === "korean" ? "말하기 🎤" : nativeLang === "spanish" ? "Hablar 🎤" : "Speak 🎤");
  const keyboardLabel = nativeLang === "korean" ? "⌨️ 키보드로 입력"
    : nativeLang === "spanish" ? "⌨️ Escribir" : "⌨️ Type";
  const voiceBonus = nativeLang === "korean" ? "🎤 XP 1.5배!"
    : nativeLang === "spanish" ? "🎤 ¡XP ×1.5!" : "🎤 XP ×1.5!";
  const suggLabel = nativeLang === "korean" ? "💡 추천 답변:"
    : nativeLang === "spanish" ? "💡 Sugerencias:" : "💡 Suggested:";
  const sendLabel = nativeLang === "korean" ? "전송" : nativeLang === "spanish" ? "Enviar" : "Send";
  const doneMsg = nativeLang === "korean" ? "🎉 대화 미션 완료!"
    : nativeLang === "spanish" ? "🎉 ¡Misión de conversación completada!"
    : "🎉 Conversation mission complete!";
  const situation = getMeaning(data.situation, lc);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.kvContainer}
      keyboardVerticalOffset={80}
    >
      {/* Mission situation */}
      <View style={s.situationCard}>
        <Text style={s.situationText}>{situation}</Text>
      </View>

      {/* Chat messages */}
      <ScrollView
        ref={scrollRef}
        style={s.chatScroll}
        contentContainerStyle={s.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, i) => (
          <View key={i} style={[s.bubble, msg.role === "rudy" ? s.rudyBubble : s.userBubble]}>
            {msg.role === "rudy" && <Text style={s.rudyLabel}>🦊 Rudy</Text>}
            <Text style={[s.bubbleText, msg.role === "user" && s.userBubbleText]}>
              {msg.text}
            </Text>
            {msg.role === "user" && msg.isVoice && (
              <Text style={s.voiceBadge}>{voiceBonus}</Text>
            )}
          </View>
        ))}

        {(phase === "processing" || phase === "loading") && (
          <View style={[s.bubble, s.rudyBubble]}>
            <Text style={s.rudyLabel}>🦊 Rudy</Text>
            <ActivityIndicator size="small" color={C.gold} style={{ marginTop: 4 }} />
          </View>
        )}
      </ScrollView>

      {/* Done banner */}
      {showDoneBanner && (
        <View style={s.doneBanner}>
          <Text style={s.doneBannerText}>{doneMsg}</Text>
        </View>
      )}

      {/* Suggested answers */}
      {phase === "idle" && messages.length > 0 && (
        <View style={s.suggestionsWrap}>
          <Text style={s.suggestLabel}>{suggLabel}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.suggestRow}>
            {data.suggestedAnswers.map((ans, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [s.suggestBtn, pressed && { opacity: 0.75 }]}
                onPress={() => startRecording()}
              >
                <Text style={s.suggestBtnText}>{ans}</Text>
                <Ionicons name="mic" size={11} color={C.gold} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input area */}
      {phase !== "done" && (
        <View style={s.inputArea}>
          {showKeyboard ? (
            <View style={s.keyboardRow}>
              <TextInput
                style={Platform.OS === "web" ? [s.textInput, { outlineStyle: "none" } as any] : s.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder={nativeLang === "korean" ? "답변을 입력하세요..." : nativeLang === "spanish" ? "Escribe tu respuesta..." : "Type your answer..."}
                placeholderTextColor={C.goldDim}
                multiline
                autoFocus
                returnKeyType="send"
                onSubmitEditing={sendKeyboardMessage}
              />
              <Pressable
                style={({ pressed }) => [s.sendBtn, pressed && { opacity: 0.85 }]}
                onPress={sendKeyboardMessage}
                disabled={phase === "processing"}
              >
                <Text style={s.sendBtnText}>{sendLabel}</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={s.controlRow}>
            {/* Mic button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }], flex: 1 }}>
              <Pressable
                style={({ pressed }) => [
                  s.micBtn,
                  phase === "recording" && s.micBtnActive,
                  (phase === "processing" || phase === "loading") && { opacity: 0.5 },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleMicPress}
                disabled={phase === "processing" || phase === "loading"}
              >
                {phase === "processing"
                  ? <ActivityIndicator color={C.bg1} size="small" />
                  : <Ionicons name={phase === "recording" ? "stop" : "mic"} size={20} color={C.bg1} />
                }
                <Text style={s.micBtnText}>{micLabel}</Text>
              </Pressable>
            </Animated.View>

            {/* Keyboard toggle */}
            <Pressable
              style={({ pressed }) => [s.keyboardToggle, showKeyboard && s.keyboardToggleActive, pressed && { opacity: 0.8 }]}
              onPress={() => setShowKeyboard(!showKeyboard)}
            >
              <Ionicons name="keypad-outline" size={16} color={showKeyboard ? C.bg1 : C.goldDim} />
            </Pressable>
          </View>

          {/* Voice bonus hint */}
          {!showKeyboard && (
            <Text style={s.voiceHint}>
              {nativeLang === "korean" ? "음성으로 답하면 XP 1.5배!" : nativeLang === "spanish" ? "¡Voz = XP ×1.5!" : "Voice answers earn XP ×1.5!"}
            </Text>
          )}
        </View>
      )}

      {/* Sentence counter */}
      <View style={s.counterRow}>
        <Ionicons name="chatbubble-outline" size={13} color={C.goldDim} />
        <Text style={s.counterText}>
          {totalSentences} {nativeLang === "korean" ? "문장 말함" : nativeLang === "spanish" ? "oraciones" : "sentences"}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  kvContainer: { gap: 12 },

  situationCard: {
    backgroundColor: "rgba(201,162,39,0.1)", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "rgba(201,162,39,0.3)",
  },
  situationText: { fontSize: 13, fontFamily: F.body, color: C.parchment, lineHeight: 20, textAlign: "center" },

  chatScroll:   { maxHeight: 320 },
  chatContent:  { gap: 10, paddingBottom: 8 },

  bubble:       { maxWidth: "85%", borderRadius: 16, padding: 12, gap: 4 },
  rudyBubble:   { backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border, alignSelf: "flex-start" },
  userBubble:   { backgroundColor: "rgba(201,162,39,0.15)", borderWidth: 1, borderColor: "rgba(201,162,39,0.3)", alignSelf: "flex-end" },
  rudyLabel:    { fontSize: 10, fontFamily: F.label, color: C.goldDim, marginBottom: 2 },
  bubbleText:   { fontSize: 15, fontFamily: F.body, color: C.parchment, lineHeight: 22 },
  userBubbleText: { color: C.gold },
  voiceBadge:   { fontSize: 10, fontFamily: F.label, color: C.goldDim, textAlign: "right", marginTop: 2 },

  doneBanner: {
    backgroundColor: C.gold, borderRadius: 14, padding: 14, alignItems: "center",
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  doneBannerText: { fontSize: 16, fontFamily: F.header, color: C.bg1, letterSpacing: 0.5 },

  suggestionsWrap: { gap: 6 },
  suggestLabel:    { fontSize: 11, fontFamily: F.label, color: C.goldDim, paddingLeft: 2 },
  suggestRow:      { gap: 8, paddingVertical: 2 },
  suggestBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.bg2,
  },
  suggestBtnText: { fontSize: 12, fontFamily: F.body, color: C.parchment },

  inputArea:    { gap: 8 },
  keyboardRow:  { flexDirection: "row", gap: 8 },
  textInput: {
    flex: 1, backgroundColor: C.bg2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontFamily: F.body, fontSize: 14, color: C.parchment, borderWidth: 1, borderColor: C.border,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: C.gold, borderRadius: 12, paddingHorizontal: 14, justifyContent: "center",
  },
  sendBtnText: { fontSize: 13, fontFamily: F.header, color: C.bg1 },

  controlRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  micBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.gold, paddingVertical: 14, borderRadius: 14,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  micBtnActive: { backgroundColor: "#e55", shadowColor: "#e55" },
  micBtnText:   { fontSize: 15, fontFamily: F.header, color: C.bg1 },

  keyboardToggle: {
    width: 44, height: 44, borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.bg2, alignItems: "center", justifyContent: "center",
  },
  keyboardToggleActive: { backgroundColor: C.gold, borderColor: C.gold },

  voiceHint:  { fontSize: 11, fontFamily: F.label, color: C.goldDim, textAlign: "center" },

  counterRow: { flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center" },
  counterText: { fontSize: 12, fontFamily: F.label, color: C.goldDim },
});
