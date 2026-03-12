import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTutor, Tutor } from "@/constants/tutors";
import { useLanguage } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { recordAudio } from "@/lib/audio";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

type PersonalityMode = "친절" | "독설" | "개그";

const MODES: { key: PersonalityMode; emoji: string; label: string; color: string }[] = [
  { key: "친절", emoji: "😊", label: "친절 모드", color: "#10B981" },
  { key: "독설", emoji: "😈", label: "독설 모드", color: "#EF4444" },
  { key: "개그", emoji: "🤣", label: "개그 모드", color: "#F59E0B" },
];

const MODE_TOASTS: Partial<Record<PersonalityMode, string>> = {
  "독설": "⚠️ 멘탈 단단히 잡으세요! 😈",
  "개그": "🤣 웃음 참으면 지는 거예요!",
};

const SPEED_OPTIONS: { label: string; value: number }[] = [
  { label: "🐢 0.8x", value: 0.8 },
  { label: "1.0x",    value: 1.0 },
  { label: "1.2x",    value: 1.2 },
  { label: "🐇 1.4x", value: 1.4 },
];

const LANG_NAMES: Record<string, string> = {
  english: "English",
  spanish: "Spanish",
  korean: "Korean",
};

// ── ElevenLabs TTS helpers ───────────────────────────────────────────────────
// Strategy:
//  - Web: fetch /api/tts → MP3 blob → HTML5 Audio element (no gesture restriction
//    because we are playing a fetched blob, not SpeechSynthesis)
//  - Native (Expo Go): expo-speech as fallback (ElevenLabs audio via fetch not
//    reliable in Expo Go; proper native build would use expo-av)

let _webAudioEl: HTMLAudioElement | null = null;

/** Strip common markdown formatting so tutor messages render as plain text. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/gs, "$1") // **bold**
    .replace(/\*(.+?)\*/gs, "$1")      // *italic*
    .replace(/__(.+?)__/gs, "$1")      // __underline__
    .replace(/_(.+?)_/gs, "$1");       // _italic_
}

/**
 * Prepare text for TTS — remove anything that sounds unnatural when read aloud:
 * emojis, Korean internet slang ligatures (ㅋㅋ, ㅎㅎ), bullet chars, markdown.
 */
function stripForTTS(text: string): string {
  return text
    // Emoji — extended pictographic covers virtually all emoji/symbols
    .replace(/\p{Extended_Pictographic}/gu, "")
    // Variation selectors, zero-width joiners, skin-tone modifiers
    .replace(/[\u{FE00}-\u{FE0F}\u{1F3FB}-\u{1F3FF}\u200D]/gu, "")
    // Korean informal ligatures that sound odd when TTS pronounces them letter-by-letter
    .replace(/ㅋ+/g, "")
    .replace(/ㅎ+/g, "")
    // Strip markdown (bold/italic/underline markers)
    .replace(/\*\*(.+?)\*\*/gs, "$1")
    .replace(/\*(.+?)\*/gs, "$1")
    .replace(/__(.+?)__/gs, "$1")
    .replace(/_(.+?)_/gs, "$1")
    // Collapse leftover whitespace
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stopSpeech() {
  if (Platform.OS !== "web") {
    try { Speech.stop(); } catch {}
  } else {
    if (_webAudioEl) {
      _webAudioEl.pause();
      _webAudioEl.src = "";
      _webAudioEl = null;
    }
  }
}

async function elevenLabsPlay(
  text: string,
  tutorId: string,
  apiBase: string,
  speed: number,
  onStart?: () => void,
  onEnd?: () => void,
  onPlaybackStart?: (durationSecs: number) => void,
  // NOTE: mode is intentionally NOT sent to /api/tts.
  // Voice identity is locked to tutorId. Sending mode would create separate
  // cache entries per mode, allowing ElevenLabs vs Azure fallback to differ
  // between modes — making the voice sound like it's changing. Mode only
  // belongs in /api/chat (system prompt). Azure SSML uses per-tutor defaults.
) {
  try {
    const url = new URL("/api/tts", apiBase);
    url.searchParams.set("text", text.slice(0, 5000));
    url.searchParams.set("tutorId", tutorId);
    url.searchParams.set("speed", speed.toString());
    // mode deliberately excluded — see comment above

    onStart?.();
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TTS ${res.status}`);

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    // Stop previous playback
    if (_webAudioEl) {
      _webAudioEl.pause();
      _webAudioEl.src = "";
    }
    const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
    _webAudioEl = audio;

    // Fire once the audio actually begins playing — duration is now reliable
    audio.onplay = () => {
      const dur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null;
      if (dur !== null) onPlaybackStart?.(dur);
    };
    audio.onended = () => {
      URL.revokeObjectURL(objectUrl);
      _webAudioEl = null;
      onEnd?.();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      _webAudioEl = null;
      onEnd?.();
    };
    await audio.play();
  } catch {
    onEnd?.();
  }
}

async function fetchTranslation(
  text: string,
  targetLanguage: string,
  apiBase: string
): Promise<string> {
  const url = new URL("/api/translate", apiBase).toString();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLanguage }),
  });
  const data = await res.json();
  if (!res.ok || !data.translation) throw new Error("Translation failed");
  return data.translation;
}

export default function ChatRoomScreen() {
  const { tutorId } = useLocalSearchParams<{ tutorId: string }>();
  const insets = useSafeAreaInsets();
  const { t, nativeLanguage } = useLanguage();

  const tutor = getTutor(tutorId ?? "") as Tutor | undefined;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  // Voice settings — speed (persisted)
  const [rate, setRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);

  // Load persisted speed and mode on mount
  useEffect(() => {
    AsyncStorage.getItem("speed_pref").then((val) => {
      if (val !== null) {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) setRate(parsed);
      }
    });
    AsyncStorage.getItem("mode_pref").then((val) => {
      if (val === "친절" || val === "독설" || val === "개그") {
        setMode(val as PersonalityMode);
      }
    });
  }, []);

  const handleSpeedChange = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRate(val);
    AsyncStorage.setItem("speed_pref", val.toString());
  };

  // Subtitle state
  const [subtitleWordIdx, setSubtitleWordIdx] = useState(-1);
  const subtitleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Personality mode
  const [mode, setMode] = useState<PersonalityMode>("친절");
  const [toastMsg, setToastMsg] = useState("");
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const micPulse = useRef(new Animated.Value(1)).current;
  const micPulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Auto-translation tracking (ref so we never double-fetch)
  const translatedIdsRef = useRef<Set<string>>(new Set());

  const inputRef = useRef<TextInput>(null);
  const conversationHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const userNativeLang = nativeLanguage ?? "english";
  const userLangName = LANG_NAMES[userNativeLang] ?? "English";
  const tutorLangName = tutor ? (LANG_NAMES[tutor.language.toLowerCase()] ?? tutor.language) : "English";
  const canTranslate = tutorLangName.toLowerCase() !== userLangName.toLowerCase();

  // Stop any speech when screen unmounts
  useEffect(() => {
    return () => { stopSpeech(); };
  }, []);

  useEffect(() => {
    if (!tutor) return;
    const timer = setTimeout(() => {
      const id = "greeting";
      setMessages([{ id, text: tutor.greeting, isUser: false }]);
      conversationHistoryRef.current = [{ role: "assistant", content: tutor.greeting }];
      // Always attempt to speak — on web the browser may silently block autoplay
      // before any user interaction, but it will succeed once the user taps/types.
      speakMsg(tutor.greeting, id, false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Subtitle helpers ──────────────────────────────────────────────────────
  const clearSubtitle = useCallback(() => {
    if (subtitleTimerRef.current) {
      clearInterval(subtitleTimerRef.current);
      subtitleTimerRef.current = null;
    }
    setSubtitleWordIdx(-1);
  }, []);

  /**
   * Audio-synced word highlight: driven by the actual MP3 duration reported by
   * the HTMLAudioElement once playback begins. Each word gets an equal share of
   * the total play time so highlights track the real audio instead of a guess.
   */
  const startAudioSyncedSubtitle = useCallback((text: string, audioDurationSecs: number) => {
    clearSubtitle();
    const words = text.trim().split(/\s+/);
    if (!words.length) return;

    const msPerWord = (audioDurationSecs * 1000) / words.length;
    let idx = 0;
    setSubtitleWordIdx(0); // highlight the first word immediately on audio.onplay

    subtitleTimerRef.current = setInterval(() => {
      idx++;
      if (idx >= words.length) {
        if (subtitleTimerRef.current) clearInterval(subtitleTimerRef.current);
        subtitleTimerRef.current = null;
        setSubtitleWordIdx(-1);
      } else {
        setSubtitleWordIdx(idx);
      }
    }, msPerWord);
  }, [clearSubtitle]);

  /** Native (Expo Speech) subtitle — still uses estimated wpm because expo-speech
   *  gives no duration information. */
  const startNativeSubtitle = useCallback((text: string, speechRate: number) => {
    clearSubtitle();
    const words = text.trim().split(/\s+/);
    setSubtitleWordIdx(0);
    const msPerWord = Math.max(180, 60000 / (150 * speechRate));
    let idx = 0;
    subtitleTimerRef.current = setInterval(() => {
      idx++;
      if (idx >= words.length) {
        if (subtitleTimerRef.current) clearInterval(subtitleTimerRef.current);
        subtitleTimerRef.current = null;
        setSubtitleWordIdx(-1);
      } else {
        setSubtitleWordIdx(idx);
      }
    }, msPerWord);
  }, [clearSubtitle]);

  // Central speak helper — always attempts to play; browser silently blocks
  // autoplay before any user interaction, then permits it after the first tap/send.
  const speakMsg = useCallback((text: string, msgId: string, _muted: boolean) => {
    if (_muted) return;
    if (!tutor) return;

    stopSpeech();
    clearSubtitle();
    setSpeakingId(msgId);

    // Clean version for TTS — no emojis, ㅋㅋ, ㅎㅎ, or markdown.
    // The original `text` (with emojis) stays visible in the chat bubble.
    const ttsText = stripForTTS(text);

    const onEnd = () => {
      clearSubtitle();
      setSpeakingId(null);
      setLoadingAudioId(null);
    };

    if (Platform.OS === "web") {
      // ElevenLabs via fetch — no gesture lock on blob playback.
      // Word highlights start inside onPlaybackStart (audio.onplay) using the
      // real audio duration, so they stay perfectly in sync.
      elevenLabsPlay(
        ttsText,
        tutor.id,
        getApiUrl(),
        rate,
        () => setLoadingAudioId(msgId),
        onEnd,
        (durationSecs) => startAudioSyncedSubtitle(ttsText, durationSecs),
        // mode NOT passed — voice identity is locked to tutorId only
      );
    } else {
      // Native: expo-speech fallback (works in Expo Go without native build)
      startNativeSubtitle(ttsText, rate);
      try { Speech.stop(); } catch {}
      Speech.speak(ttsText, {
        language: tutor.speechLang,
        rate,
        onDone: onEnd,
        onError: onEnd,
      });
    }
  }, [tutor, rate, clearSubtitle, startAudioSyncedSubtitle, startNativeSubtitle]);

  // ── Auto-translation effect ───────────────────────────────────────────────
  useEffect(() => {
    if (!canTranslate) return;
    messages.forEach((msg) => {
      if (!msg.isUser && !translatedIdsRef.current.has(msg.id)) {
        translatedIdsRef.current.add(msg.id);
        setTranslatingIds((prev) => new Set(prev).add(msg.id));
        fetchTranslation(msg.text, userLangName, getApiUrl())
          .then((result) => setTranslations((prev) => ({ ...prev, [msg.id]: result })))
          .catch(() => {})
          .finally(() => setTranslatingIds((prev) => {
            const n = new Set(prev); n.delete(msg.id); return n;
          }));
      }
    });
  }, [messages, canTranslate]);

  const handleReplay = useCallback(
    (msg: Message) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      speakMsg(msg.text, msg.id, muted);
    },
    [muted, speakMsg]
  );


  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
    toastTimer.current = setTimeout(() => setToastMsg(""), 2500);
  };

  const handleModeChange = (newMode: PersonalityMode) => {
    if (newMode === mode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode(newMode);
    AsyncStorage.setItem("mode_pref", newMode);
    const toast = MODE_TOASTS[newMode];
    if (toast) showToast(toast);
  };

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!muted) stopSpeech();
    setMuted((m) => !m);
  };

  const handleVoiceInput = async () => {
    if (isRecording || isTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRecording(true);

    // Pulse animation while recording
    micPulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, { toValue: 1.25, duration: 500, useNativeDriver: true }),
        Animated.timing(micPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    micPulseLoop.current.start();

    try {
      const { base64, mimeType } = await recordAudio(4000);

      const apiUrl = new URL("/api/stt", getApiUrl()).toString();
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: base64,
          mimeType,
          language: tutor?.speechLang ?? "en-US",
        }),
      });

      const data = await res.json();
      const transcribed = (data.text ?? "").trim();
      if (transcribed) {
        setInputText(transcribed);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Focus input so user can review/edit before sending
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      micPulseLoop.current?.stop();
      Animated.timing(micPulse, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      setIsRecording(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !tutor || isTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString() + "u",
      text: trimmed,
      isUser: true,
    };
    setInputText("");
    setMessages((prev) => [userMsg, ...prev]);
    conversationHistoryRef.current = [
      ...conversationHistoryRef.current,
      { role: "user", content: trimmed },
    ];
    setIsTyping(true);

    try {
      const apiUrl = new URL("/api/chat", getApiUrl()).toString();
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: tutor.id,
          messages: conversationHistoryRef.current,
          mode,
        }),
      });

      const data = await res.json();
      const responseText: string = res.ok
        ? (data.reply ?? "...")
        : (tutor.responses[Math.floor(Math.random() * tutor.responses.length)]);

      const aiId = Date.now().toString() + "a";
      const aiMsg: Message = { id: aiId, text: responseText, isUser: false };
      conversationHistoryRef.current = [
        ...conversationHistoryRef.current,
        { role: "assistant", content: responseText },
      ];
      setMessages((prev) => [aiMsg, ...prev]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speakMsg(responseText, aiId, muted);
      inputRef.current?.focus();
    } catch {
      const fallback = tutor.responses[Math.floor(Math.random() * tutor.responses.length)];
      const aiId = Date.now().toString() + "a";
      setMessages((prev) => [{ id: aiId, text: fallback, isUser: false }, ...prev]);
      speakMsg(fallback, aiId, muted);
    } finally {
      setIsTyping(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const translationText = translations[item.id];
    const isTranslating = translatingIds.has(item.id);
    const isSpeakingThis = speakingId === item.id && subtitleWordIdx >= 0;

    // Render AI bubble text with per-word highlight when speaking.
    // During speech: use TTS-clean text (no emojis) so word indices match exactly.
    // At rest: show full display text including emojis in the bubble.
    const renderBubbleText = () => {
      const displayText = item.isUser ? item.text : stripMarkdown(item.text);
      if (!item.isUser && isSpeakingThis) {
        const speakText = stripForTTS(displayText);
        let wordCount = 0;
        return (
          <Text style={[styles.bubbleText, styles.bubbleTextAI]}>
            {speakText.split(/(\s+)/).map((token, i) => {
              if (/^\s+$/.test(token)) return <Text key={i}>{token}</Text>;
              const myIdx = wordCount++;
              return (
                <Text
                  key={i}
                  style={myIdx === subtitleWordIdx ? styles.subtitleHighlight : undefined}
                >
                  {token}
                </Text>
              );
            })}
          </Text>
        );
      }
      return (
        <Text style={[styles.bubbleText, item.isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
          {displayText}
        </Text>
      );
    };

    return (
      <View style={[styles.msgRow, item.isUser ? styles.msgRowUser : styles.msgRowAI]}>
        {!item.isUser && (
          <View style={styles.tutorAvatar}>
            <Text style={styles.tutorAvatarEmoji}>{tutor?.emoji ?? "👩"}</Text>
          </View>
        )}

        <View style={styles.bubbleColumn}>
          <View style={[styles.bubble, item.isUser ? styles.bubbleUser : styles.bubbleAI]}>
            {renderBubbleText()}

            {!item.isUser && (
              <View style={styles.bubbleActions}>
                <Pressable
                  onPress={() => handleReplay(item)}
                  style={({ pressed }) => [styles.bubbleActionBtn, pressed && { opacity: 0.65 }]}
                  hitSlop={6}
                >
                  <Ionicons
                    name={speakingId === item.id ? "volume-high" : "volume-medium-outline"}
                    size={14}
                    color={speakingId === item.id ? "#FF6B9D" : "#C4B5BF"}
                  />
                </Pressable>
              </View>
            )}
          </View>

          {/* Auto-translation — always shown for AI messages when languages differ */}
          {!item.isUser && canTranslate && (
            <View style={styles.translationBox}>
              {isTranslating && !translationText ? (
                <View style={styles.translationLoading}>
                  <ActivityIndicator size="small" color="#FF6B9D" />
                  <Text style={styles.translationLoadingText}>Translating…</Text>
                </View>
              ) : translationText ? (
                <View style={styles.autoTranslationRow}>
                  <Text style={styles.autoTranslationGlobe}>🌐</Text>
                  <Text style={styles.autoTranslationText}>{translationText}</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!tutor) {
    return (
      <View style={[styles.screen, { paddingTop: topPad, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontFamily: "Inter_400Regular", color: "#A08090" }}>Tutor not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <LinearGradient colors={["#FFF0F6", "#FFF8FB"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#1A1A2E" />
        </Pressable>

        <View style={styles.tutorAvatarHeader}>
          <Text style={styles.tutorAvatarHeaderEmoji}>{tutor.emoji}</Text>
        </View>

        <View style={styles.headerCenter}>
          <View style={styles.headerNameRow}>
            <Text style={styles.headerName}>{tutor.name}</Text>
            <Text style={styles.headerFlag}>{tutor.flag}</Text>
          </View>
          <Text style={styles.headerRegion}>{tutor.region}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.muteBtn, pressed && { opacity: 0.75 }]}
          onPress={toggleMute}
        >
          <Ionicons
            name={muted ? "volume-mute" : "volume-medium"}
            size={20}
            color={muted ? "#A08090" : "#FF6B9D"}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.muteBtn, pressed && { opacity: 0.75 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSettings(true); }}
        >
          <Ionicons name="settings-outline" size={19} color="#A08090" />
        </Pressable>
      </View>

      {/* Style badge */}
      <View style={styles.styleBadgeRow}>
        <View style={[styles.styleBadge, { backgroundColor: tutor.style === "formal" ? "#EEF2FF" : "#FFF7ED" }]}>
          <Ionicons
            name={tutor.style === "formal" ? "school-outline" : "happy-outline"}
            size={12}
            color={tutor.style === "formal" ? "#6366F1" : "#EA580C"}
          />
          <Text style={[styles.styleBadgeText, { color: tutor.style === "formal" ? "#6366F1" : "#EA580C" }]}>
            {tutor.personality}
          </Text>
        </View>

        {canTranslate && (
          <View style={styles.translateHint}>
            <Text style={styles.translateHintText}>🌐 Auto-translation on</Text>
          </View>
        )}
      </View>

      {/* Speed control bar */}
      <View style={styles.speedRow}>
        {SPEED_OPTIONS.map((opt) => {
          const active = rate === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={({ pressed }) => [
                styles.speedBtn,
                active && styles.speedBtnActive,
                pressed && { opacity: 0.75 },
              ]}
              onPress={() => handleSpeedChange(opt.value)}
            >
              <Text style={[styles.speedBtnText, active && styles.speedBtnTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Toast notification */}
      {!!toastMsg && (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { opacity: toastAnim, transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}
        >
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      )}


      {/* Voice Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSettings(false)}>
          <Pressable style={styles.settingsPanel} onPress={() => {}}>
            <View style={styles.settingsHandle} />

            <View style={styles.settingsHeaderRow}>
              <Text style={styles.settingsTitle}>설정</Text>
              <Pressable onPress={() => setShowSettings(false)} hitSlop={10}>
                <Ionicons name="close" size={20} color="#A08090" />
              </Pressable>
            </View>

            {/* 튜터 성격 */}
            <Text style={styles.settingLabel}>튜터 성격</Text>
            <View style={styles.segmentRow}>
              {MODES.map((m) => {
                const active = mode === m.key;
                return (
                  <Pressable
                    key={m.key}
                    style={({ pressed }) => [
                      styles.segmentBtn,
                      active && styles.segmentBtnActive,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => handleModeChange(m.key)}
                  >
                    <Text style={styles.modeBtnEmoji}>{m.emoji}</Text>
                    <Text style={[styles.segmentBtnText, active && styles.segmentBtnTextActive]}>
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Neural voice info */}
            <View style={styles.noVoicesBox}>
              <Ionicons name="sparkles" size={14} color="#FF6B9D" style={{ marginBottom: 4 }} />
              <Text style={styles.noVoicesText}>
                Each tutor uses a unique AI neural voice — Sarah speaks in a British accent, Jake in American English, and so on.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          inverted
          extraData={{ translations, translatingIds, speakingId, subtitleWordIdx }}
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isTyping ? (
              <View style={[styles.msgRow, styles.msgRowAI]}>
                <View style={styles.tutorAvatar}>
                  <Text style={styles.tutorAvatarEmoji}>{tutor.emoji}</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
                  <View style={styles.typingDots}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                  </View>
                </View>
              </View>
            ) : null
          }
        />

        <View style={[styles.inputBar, { paddingBottom: Math.max(bottomPad + 4, 16) }]}>
          <View style={styles.inputRow}>
            {/* Mic button — records voice, transcribes via Azure STT */}
            <Animated.View style={{ transform: [{ scale: micPulse }] }}>
              <Pressable
                onPress={handleVoiceInput}
                disabled={isRecording || isTyping}
                style={({ pressed }) => [
                  styles.micInputBtn,
                  isRecording && styles.micInputBtnActive,
                  pressed && !isRecording && { opacity: 0.75 },
                ]}
              >
                <Ionicons
                  name={isRecording ? "radio-button-on" : "mic"}
                  size={18}
                  color={isRecording ? "#FFFFFF" : "#FF6B9D"}
                />
              </Pressable>
            </Animated.View>

            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isRecording ? "Listening…" : t("type_message")}
              placeholderTextColor={isRecording ? "#FF6B9D" : "#C4B5BF"}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
              editable={!isRecording}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
                pressed && !!inputText.trim() && { opacity: 0.82, transform: [{ scale: 0.94 }] },
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isRecording}
            >
              <LinearGradient
                colors={inputText.trim() ? ["#FF6B9D", "#FF4081"] : ["#E8D5DC", "#E8D5DC"]}
                style={styles.sendBtnGradient}
              >
                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0D6E4",
    backgroundColor: "rgba(255,248,251,0.97)",
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  tutorAvatarHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF0F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFB3CE",
  },
  tutorAvatarHeaderEmoji: { fontSize: 22 },
  headerCenter: { flex: 1 },
  headerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerName: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1A1A2E" },
  headerFlag: { fontSize: 16 },
  headerRegion: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#A08090", marginTop: 1 },
  muteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  styleBadgeRow: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: "rgba(255,248,251,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#F9ECF3",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  styleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  styleBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium", lineHeight: 15, flexShrink: 1 },
  translateHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  translateHintText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
  },

  // Settings modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  settingsPanel: {
    backgroundColor: "#FFF8FB",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: "80%",
  },
  settingsHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0C8D8",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  settingsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  settingLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#A08090",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F5E8F0",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  segmentBtnActive: {
    backgroundColor: "#FFF0F6",
    borderColor: "#FF6B9D",
  },
  segmentBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
  },
  segmentBtnTextActive: {
    color: "#FF6B9D",
    fontFamily: "Inter_600SemiBold",
  },
  voiceList: {
    maxHeight: 200,
    marginBottom: 8,
  },
  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  voiceRowActive: {
    backgroundColor: "#FFF0F6",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D4B5C8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: "#FF6B9D",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B9D",
  },
  voiceInfo: { flex: 1 },
  voiceName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#3D2C35",
  },
  voiceNameActive: {
    color: "#FF6B9D",
    fontFamily: "Inter_600SemiBold",
  },
  voiceLang: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
    marginTop: 1,
  },
  noVoicesBox: {
    paddingVertical: 16,
    alignItems: "center",
  },
  noVoicesText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
    textAlign: "center",
  },

  listContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 2,
  },
  msgRowUser: { justifyContent: "flex-end" },
  msgRowAI: { justifyContent: "flex-start" },

  tutorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF0F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFB3CE",
    flexShrink: 0,
    alignSelf: "flex-end",
  },
  tutorAvatarEmoji: { fontSize: 16 },

  bubbleColumn: {
    maxWidth: "75%",
    gap: 6,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: "#FF6B9D",
    borderBottomRightRadius: 5,
  },
  bubbleAI: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 5,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextUser: { fontFamily: "Inter_400Regular", color: "#FFFFFF" },
  bubbleTextAI: { fontFamily: "Inter_400Regular", color: "#1A1A2E" },

  bubbleActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 5,
  },
  bubbleActionBtn: {
    padding: 2,
  },
  bubbleActionBtnActive: {},

  // Subtitle word highlight
  subtitleHighlight: {
    color: "#FF6B9D",
    fontFamily: "Inter_700Bold",
  },

  // Auto-translation
  translationBox: {
    backgroundColor: "#F8F0F5",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  translationLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  translationLoadingText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
  },
  autoTranslationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
  },
  autoTranslationGlobe: {
    fontSize: 12,
    marginTop: 1,
  },
  autoTranslationText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#8A7080",
    lineHeight: 18,
    flex: 1,
  },

  typingBubble: { paddingVertical: 14 },
  typingDots: { flexDirection: "row", gap: 5, alignItems: "center" },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#C4B5BF",
  },

  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: "rgba(255,248,251,0.98)",
    borderTopWidth: 1,
    borderTopColor: "#F0D6E4",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: "#F0D6E4",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#1A1A2E",
    paddingVertical: 8,
    maxHeight: 100,
  },
  micInputBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "#FF6B9D50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    backgroundColor: "#FFF0F6",
  },
  micInputBtnActive: {
    backgroundColor: "#FF6B9D",
    borderColor: "#FF6B9D",
  },
  sendBtn: { borderRadius: 20, overflow: "hidden", marginBottom: 2 },
  sendBtnDisabled: { opacity: 0.55 },
  sendBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  modeRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#F0D6E4",
    backgroundColor: "#FFFFFF",
  },
  modeBtnEmoji: { fontSize: 13 },
  modeBtnLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#A08090",
  },
  modeBtnLabelActive: {
    color: "#FFFFFF",
  },

  speedRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  speedBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#F0D6E4",
    backgroundColor: "#FFFFFF",
  },
  speedBtnActive: {
    backgroundColor: "#FF6B9D",
    borderColor: "#FF6B9D",
  },
  speedBtnText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#A08090",
  },
  speedBtnTextActive: {
    color: "#FFFFFF",
  },

  toast: {
    position: "absolute",
    top: 130,
    alignSelf: "center",
    backgroundColor: "#1A1A2E",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  toastText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
