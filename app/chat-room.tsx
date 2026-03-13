import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
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
import { getTutor, TUTOR_IMAGES, Tutor } from "@/constants/tutors";
import { useLanguage } from "@/context/LanguageContext";
import { XPToast } from "@/components/XPToast";
import { getApiUrl } from "@/lib/query-client";
import { recordAudio } from "@/lib/audio";
import { C, F } from "@/constants/theme";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

type PersonalityMode = "친절" | "독설";

const MODES: { key: PersonalityMode; emoji: string; label: string; color: string }[] = [
  { key: "친절", emoji: "😊", label: "친절 모드", color: "#10B981" },
  { key: "독설", emoji: "😈", label: "독설+개그", color: "#EF4444" },
];

const MODE_TOASTS: Partial<Record<PersonalityMode, string>> = {
  "독설": "😈 독설+개그 ON! 멘탈 단단히 잡으세요 haha",
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
    console.log("TTS called with speed:", speed);

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

/**
 * Web Speech Recognition wrapper.
 * Uses the browser's built-in API (SpeechRecognition / webkitSpeechRecognition)
 * which works natively on iOS Safari 14.1+, Chrome, and Edge.
 * Returns the transcript on success, "" on no-speech, rejects on error.
 */
function webSpeechRecognize(lang: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      reject(new Error("NOT_SUPPORTED"));
      return;
    }
    const rec = new SR() as any;
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    let settled = false;
    const settle = (fn: () => void) => {
      if (!settled) { settled = true; fn(); }
    };

    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join(" ")
        .trim();
      settle(() => resolve(transcript));
    };
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "permission-denied") {
        settle(() => reject(new Error("PERMISSION_DENIED")));
      } else if (e.error === "no-speech") {
        settle(() => resolve(""));
      } else {
        settle(() => reject(new Error(e.error ?? "STT_ERROR")));
      }
    };
    rec.onend = () => settle(() => resolve(""));
    try {
      rec.start();
    } catch (err) {
      settle(() => reject(err));
    }
  });
}

export default function ChatRoomScreen() {
  const { tutorId } = useLocalSearchParams<{ tutorId: string }>();
  const insets = useSafeAreaInsets();
  const { t, nativeLanguage, stats, updateStats } = useLanguage();
  const [xpGain, setXpGain] = useState(0);
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

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
  const [hiddenTranslationIds, setHiddenTranslationIds] = useState<Set<string>>(new Set());
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
      if (val === "친절" || val === "독설") {
        setMode(val as PersonalityMode);
      }
    });
  }, []);

  const handleSpeedChange = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Speed changed to:", val);
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
          .catch(() => setTranslations((prev) => ({ ...prev, [msg.id]: "번역 실패" })))
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
    if (isRecording) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRecording(true);

    micPulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, { toValue: 1.3, duration: 500, useNativeDriver: true }),
        Animated.timing(micPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    micPulseLoop.current.start();

    try {
      let transcribed = "";

      if (Platform.OS === "web") {
        // Web: use the browser's built-in Speech Recognition API.
        // Works on iOS Safari 14.1+, Chrome, Edge — no audio wrangling needed.
        transcribed = await webSpeechRecognize(tutor?.speechLang ?? "en-US");
      } else {
        // Native (Expo Go): record 5 s of audio → send to Azure STT backend.
        const { base64, mimeType } = await recordAudio(5000);
        const apiUrl = new URL("/api/stt", getApiUrl()).toString();
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio: base64, mimeType, language: tutor?.speechLang ?? "en-US" }),
        });
        const data = await res.json();
        transcribed = (data.text ?? "").trim();
      }

      if (transcribed) {
        setInputText(transcribed);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        showToast("🎤 말이 감지되지 않았습니다 — 다시 시도하세요");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (err: any) {
      const msg = (err?.message ?? "") as string;
      if (msg === "PERMISSION_DENIED") {
        showToast("🚫 마이크 권한을 허용해 주세요");
      } else if (msg === "NOT_SUPPORTED") {
        showToast("🎤 이 브라우저에서는 음성 입력이 지원되지 않습니다");
      } else {
        showToast("🎤 녹음 중 오류가 발생했습니다 — 다시 시도하세요");
      }
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
    setXpGain(5);
    updateStats({ xp: statsRef.current.xp + 5 });

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
        {!item.isUser && tutor && (
          <View style={styles.tutorAvatar}>
            <Image source={TUTOR_IMAGES[tutor.id]} style={styles.tutorAvatarImg} />
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
                    color={speakingId === item.id ? C.gold : C.goldDark}
                  />
                </Pressable>
              </View>
            )}
          </View>

          {/* Translation bubble — separate from main bubble, tap to toggle */}
          {!item.isUser && canTranslate && (
            isTranslating && !translationText ? (
              <View style={styles.translBubble}>
                <Text style={styles.translGlobe}>🌐</Text>
                <ActivityIndicator size="small" color="#C4A8BE" style={{ marginLeft: 2 }} />
              </View>
            ) : translationText ? (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setHiddenTranslationIds((prev) => {
                    const n = new Set(prev);
                    if (n.has(item.id)) n.delete(item.id);
                    else n.add(item.id);
                    return n;
                  });
                }}
                style={({ pressed }) => [styles.translBubble, pressed && { opacity: 0.75 }]}
              >
                <Text style={styles.translGlobe}>🌐</Text>
                {!hiddenTranslationIds.has(item.id) && (
                  <Text style={styles.translText}>{translationText}</Text>
                )}
                {hiddenTranslationIds.has(item.id) && (
                  <Text style={styles.translHiddenHint}>번역 보기</Text>
                )}
              </Pressable>
            ) : null
          )}
        </View>
      </View>
    );
  };

  if (!tutor) {
    return (
      <View style={[styles.screen, { paddingTop: topPad, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontFamily: F.body, color: C.goldDim }}>Tutor not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <XPToast amount={xpGain} onDone={() => setXpGain(0)} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={C.gold} />
        </Pressable>

        <View style={styles.tutorAvatarHeader}>
          <Image source={TUTOR_IMAGES[tutor.id]} style={styles.tutorAvatarHeaderImg} />
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
            color={muted ? C.goldDark : C.gold}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.muteBtn, pressed && { opacity: 0.75 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSettings(true); }}
        >
          <Ionicons name="settings-outline" size={19} color={C.goldDim} />
        </Pressable>
      </View>

      {/* Style badge */}
      <View style={styles.styleBadgeRow}>
        <View style={styles.styleBadge}>
          <Ionicons
            name={tutor.style === "formal" ? "school-outline" : "happy-outline"}
            size={12}
            color={C.gold}
          />
          <Text style={styles.styleBadgeText}>
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
                <Ionicons name="close" size={20} color={C.goldDim} />
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
              <Ionicons name="sparkles" size={14} color={C.gold} style={{ marginBottom: 4 }} />
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
          extraData={{ translations, translatingIds, hiddenTranslationIds, speakingId, subtitleWordIdx }}
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isTyping ? (
              <View style={[styles.msgRow, styles.msgRowAI]}>
                <View style={styles.tutorAvatar}>
                  <Image source={TUTOR_IMAGES[tutor.id]} style={styles.tutorAvatarImg} />
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
                  color={isRecording ? C.bg1 : C.gold}
                />
              </Pressable>
            </Animated.View>

            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isRecording ? "Listening…" : t("type_message")}
              placeholderTextColor={isRecording ? C.gold : C.goldDark}
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
                colors={inputText.trim() ? [C.gold, C.goldDark] : [C.bg2, C.bg2]}
                style={styles.sendBtnGradient}
              >
                <Ionicons name="arrow-up" size={20} color={inputText.trim() ? C.bg1 : C.goldDark} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg1 },
  flex: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg1,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bg2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  tutorAvatarHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bg2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.gold,
    overflow: "hidden",
  },
  tutorAvatarHeaderImg: { width: 40, height: 40, borderRadius: 20 },
  headerCenter: { flex: 1 },
  headerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerName: { fontSize: 16, fontFamily: F.header, color: C.parchment },
  headerFlag: { fontSize: 16 },
  headerRegion: { fontSize: 11, fontFamily: F.body, color: C.goldDim, marginTop: 1, fontStyle: "italic" },
  muteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bg2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },

  styleBadgeRow: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: C.bg2,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
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
    backgroundColor: "rgba(201,162,39,0.1)",
    borderWidth: 1,
    borderColor: C.border,
  },
  styleBadgeText: { fontSize: 11, fontFamily: F.body, lineHeight: 15, flexShrink: 1, color: C.goldDim },
  translateHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  translateHintText: {
    fontSize: 11,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  settingsPanel: {
    backgroundColor: C.bg2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: "80%",
    borderTopWidth: 1,
    borderColor: C.border,
  },
  settingsHandle: {
    width: 40,
    height: 4,
    backgroundColor: C.goldDark,
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
    fontSize: 16,
    fontFamily: F.header,
    color: C.gold,
    letterSpacing: 0.5,
  },
  settingLabel: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.goldDim,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
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
    backgroundColor: C.bg1,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  segmentBtnActive: {
    backgroundColor: "rgba(201,162,39,0.12)",
    borderColor: C.gold,
  },
  segmentBtnText: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.goldDark,
  },
  segmentBtnTextActive: {
    color: C.gold,
    fontFamily: F.bodySemi,
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
    backgroundColor: "rgba(201,162,39,0.1)",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.goldDark,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: C.gold,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.gold,
  },
  voiceInfo: { flex: 1 },
  voiceName: {
    fontSize: 14,
    fontFamily: F.bodySemi,
    color: C.parchment,
  },
  voiceNameActive: {
    color: C.gold,
    fontFamily: F.bodyBold,
  },
  voiceLang: {
    fontSize: 11,
    fontFamily: F.body,
    color: C.goldDim,
    marginTop: 1,
    fontStyle: "italic",
  },
  noVoicesBox: {
    paddingVertical: 16,
    alignItems: "center",
  },
  noVoicesText: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    textAlign: "center",
    fontStyle: "italic",
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
    backgroundColor: C.bg2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.gold,
    flexShrink: 0,
    alignSelf: "flex-end",
    overflow: "hidden",
  },
  tutorAvatarImg: { width: 32, height: 32, borderRadius: 16 },

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
    backgroundColor: C.gold,
    borderBottomRightRadius: 5,
  },
  bubbleAI: {
    backgroundColor: C.parchment,
    borderBottomLeftRadius: 5,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextUser: { fontFamily: F.body, color: C.bg1 },
  bubbleTextAI: { fontFamily: F.body, color: C.textParchment },

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

  subtitleHighlight: {
    color: C.gold,
    fontFamily: F.bodyBold,
  },

  translBubble: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "rgba(201,162,39,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: "flex-start",
  },
  translGlobe: {
    fontSize: 13,
    marginTop: 1,
    opacity: 0.7,
  },
  translText: {
    flex: 1,
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    lineHeight: 18,
    fontStyle: "italic",
  },
  translHiddenHint: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDark,
    fontStyle: "italic",
  },
  autoTranslationText: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    lineHeight: 18,
    flex: 1,
  },

  typingBubble: { paddingVertical: 14 },
  typingDots: { flexDirection: "row", gap: 5, alignItems: "center" },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.goldDark,
  },

  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: C.bg1,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: C.bg2,
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: F.body,
    color: C.parchment,
    paddingVertical: 8,
    maxHeight: 100,
  },
  micInputBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    backgroundColor: C.bg1,
  },
  micInputBtnActive: {
    backgroundColor: C.gold,
    borderColor: C.gold,
  },
  sendBtn: { borderRadius: 20, overflow: "hidden", marginBottom: 2 },
  sendBtnDisabled: { opacity: 0.55 },
  sendBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.gold,
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
    borderColor: C.border,
    backgroundColor: C.bg2,
  },
  modeBtnEmoji: { fontSize: 13 },
  modeBtnLabel: {
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: C.goldDark,
  },
  modeBtnLabelActive: {
    color: C.bg1,
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
    borderColor: C.border,
    backgroundColor: C.bg2,
  },
  speedBtnActive: {
    backgroundColor: C.gold,
    borderColor: C.gold,
  },
  speedBtnText: {
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: C.goldDark,
  },
  speedBtnTextActive: {
    color: C.bg1,
  },

  toast: {
    position: "absolute",
    top: 130,
    alignSelf: "center",
    backgroundColor: C.bg2,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 999,
    borderWidth: 1,
    borderColor: C.gold,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  toastText: {
    fontSize: 14,
    fontFamily: F.bodySemi,
    color: C.gold,
    textAlign: "center",
  },
});
