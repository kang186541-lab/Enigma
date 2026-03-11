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
  ScrollView,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { getTutor, Tutor } from "@/constants/tutors";
import { useLanguage, NativeLanguage } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const LANG_NAMES: Record<string, string> = {
  english: "English",
  spanish: "Spanish",
  korean: "Korean",
};

interface VoiceOption {
  id: string;
  name: string;
  lang: string;
}

const TUTOR_GENDER: Record<string, "female" | "male"> = {
  sarah: "female",
  jake: "male",
  jane: "female",
  alex: "male",
  jisu: "female",
  minjun: "male",
};

function guessGender(name: string): "female" | "male" | "neutral" {
  const lc = name.toLowerCase();
  const femaleHints = [
    "female", "woman", "samantha", "karen", "moira", "tessa", "fiona",
    "victoria", "alice", "anna", "nora", "sara", "yuna", "luciana",
    "mei", "ting", "yu-shu", "sinji", "lara", "laura", "joana", "helena",
    "amelie", "aurelie", "virginie", "alva", "felicia", "sinji", "sin-ji",
    "seoyeon", "mia", "kate", "kathy",
  ];
  const maleHints = [
    "male", "man", "daniel", "fred", "tom", "oliver", "rishi",
    "jorge", "juan", "carlos", "diego", "jae-woo", "yuna-male",
  ];
  if (femaleHints.some((h) => lc.includes(h))) return "female";
  if (maleHints.some((h) => lc.includes(h))) return "male";
  return "neutral";
}

function pickBestVoice(
  voices: VoiceOption[],
  lang: string,
  preferredGender: "female" | "male" | undefined
): string | null {
  const langBase = lang.split("-")[0];
  const byExactLang = voices.filter((v) => v.lang === lang);
  const byBaseLang = voices.filter((v) => v.lang.startsWith(langBase));
  const pool = byExactLang.length > 0 ? byExactLang : byBaseLang;
  if (pool.length === 0) return null;
  if (preferredGender) {
    const genderMatch = pool.find((v) => guessGender(v.name) === preferredGender);
    if (genderMatch) return genderMatch.id;
  }
  return pool[0].id;
}

function stopSpeech() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } else {
    try { Speech.stop(); } catch {}
  }
}

interface SpeakSettings {
  rate: number;
  pitch: number;
  voiceId: string | null;
}

const DEFAULT_SETTINGS: SpeakSettings = { rate: 0.85, pitch: 1.0, voiceId: null };

function webSpeak(
  text: string,
  lang: string,
  settings: SpeakSettings = DEFAULT_SETTINGS,
  onWord?: (idx: number) => void,
  onEnd?: () => void
) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  if (onWord) {
    (utterance as any).onboundary = (e: any) => {
      if (e.name === "word") {
        const before = text.slice(0, e.charIndex);
        const idx = before.trim() === "" ? 0 : before.trim().split(/\s+/).length;
        onWord(idx);
      }
    };
  }
  if (onEnd) utterance.onend = onEnd;
  const doSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    let chosen: SpeechSynthesisVoice | undefined;
    if (settings.voiceId) {
      chosen = voices.find((v) => v.voiceURI === settings.voiceId);
    }
    if (!chosen) {
      chosen =
        voices.find((v) => v.lang === lang) ??
        voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
    }
    if (chosen) utterance.voice = chosen;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };
  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
  }
}

function speak(
  text: string,
  lang: string,
  muted: boolean,
  voiceUnlocked = true,
  settings: SpeakSettings = DEFAULT_SETTINGS,
  onEnd?: () => void
) {
  if (muted) return;
  if (Platform.OS === "web") {
    if (!voiceUnlocked) return;
    webSpeak(text, lang, settings, undefined, onEnd);
  } else {
    try { Speech.stop(); } catch {}
    try {
      Speech.speak(text, {
        language: lang,
        rate: settings.rate,
        pitch: settings.pitch,
        ...(settings.voiceId ? { voice: settings.voiceId } : {}),
        onDone: onEnd,
        onError: onEnd,
      });
    } catch {
      try { Speech.speak(text, { rate: settings.rate, pitch: settings.pitch, onDone: onEnd }); } catch {}
    }
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
  const [voiceUnlocked, setVoiceUnlocked] = useState(Platform.OS !== "web");

  // Voice settings
  const [rate, setRate] = useState(0.85);
  const [pitch, setPitch] = useState(1.0);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Subtitle state
  const [subtitleWordIdx, setSubtitleWordIdx] = useState(-1);
  const subtitleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-translation tracking (ref so we never double-fetch)
  const translatedIdsRef = useRef<Set<string>>(new Set());

  const inputRef = useRef<TextInput>(null);
  const conversationHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const userNativeLang = nativeLanguage ?? "english";
  const userLangName = LANG_NAMES[userNativeLang] ?? "English";
  const tutorLangName = tutor ? (LANG_NAMES[tutor.language.toLowerCase()] ?? tutor.language) : "English";
  const canTranslate = tutorLangName.toLowerCase() !== userLangName.toLowerCase();

  // Load available voices and pick the best default for this tutor
  useEffect(() => {
    if (!tutor) return;
    const preferred = TUTOR_GENDER[tutor.id];

    if (Platform.OS === "web") {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const load = () => {
        const raw = window.speechSynthesis.getVoices();
        const langBase = tutor.speechLang.split("-")[0];
        const filtered: VoiceOption[] = raw
          .filter((v) => v.lang.startsWith(langBase))
          .map((v) => ({ id: v.voiceURI, name: v.name, lang: v.lang }));
        setAvailableVoices(filtered);
        const best = pickBestVoice(filtered, tutor.speechLang, preferred);
        setSelectedVoiceId(best);
      };
      if (window.speechSynthesis.getVoices().length > 0) {
        load();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          load();
        };
      }
    } else {
      Speech.getAvailableVoicesAsync()
        .then((raw) => {
          const langBase = tutor.speechLang.split("-")[0];
          const filtered: VoiceOption[] = raw
            .filter((v) => v.language?.startsWith(langBase))
            .map((v) => ({ id: v.identifier, name: v.name ?? v.identifier, lang: v.language }));
          setAvailableVoices(filtered);
          const best = pickBestVoice(filtered, tutor.speechLang, preferred);
          setSelectedVoiceId(best);
        })
        .catch(() => {});
    }
  }, [tutor?.id]);

  useEffect(() => {
    if (!tutor) return;
    const timer = setTimeout(() => {
      const id = "greeting";
      setMessages([{ id, text: tutor.greeting, isUser: false }]);
      conversationHistoryRef.current = [{ role: "assistant", content: tutor.greeting }];
      if (Platform.OS !== "web") {
        speakMsg(tutor.greeting, id, false, true);
      }
      // Web: voice unlocked after first gesture — handled by handleUnlockVoice
    }, 400);
    return () => clearTimeout(timer);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const settings: SpeakSettings = { rate, pitch, voiceId: selectedVoiceId };

  // ── Subtitle helpers ──────────────────────────────────────────────────────
  const clearSubtitle = useCallback(() => {
    if (subtitleTimerRef.current) {
      clearInterval(subtitleTimerRef.current);
      subtitleTimerRef.current = null;
    }
    setSubtitleWordIdx(-1);
  }, []);

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

  // Central speak helper — handles subtitles + speakingId for all call sites
  const speakMsg = useCallback((text: string, msgId: string, _muted: boolean, _voiceUnlocked: boolean) => {
    if (_muted) return;
    if (Platform.OS === "web" && !_voiceUnlocked) return;
    if (!tutor) return;

    clearSubtitle();
    setSpeakingId(msgId);
    setSubtitleWordIdx(0);

    const onEnd = () => {
      clearSubtitle();
      setSpeakingId(null);
    };

    if (Platform.OS === "web") {
      webSpeak(text, tutor.speechLang, settings,
        (idx) => setSubtitleWordIdx(idx),
        onEnd
      );
    } else {
      startNativeSubtitle(text, settings.rate);
      speak(text, tutor.speechLang, false, true, settings, onEnd);
    }
  }, [tutor, settings, clearSubtitle, startNativeSubtitle]);

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

  const handleUnlockVoice = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVoiceUnlocked(true);
    const lastAI = messages.find((m) => !m.isUser);
    if (lastAI && !muted) {
      setTimeout(() => speakMsg(lastAI.text, lastAI.id, false, true), 100);
    }
  }, [messages, muted, speakMsg]);

  const handleReplay = useCallback(
    (msg: Message) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      speakMsg(msg.text, msg.id, muted, voiceUnlocked || Platform.OS !== "web");
    },
    [muted, voiceUnlocked, speakMsg]
  );


  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!muted) stopSpeech();
    setMuted((m) => !m);
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
      speakMsg(responseText, aiId, muted, voiceUnlocked || Platform.OS !== "web");
      inputRef.current?.focus();
    } catch {
      const fallback = tutor.responses[Math.floor(Math.random() * tutor.responses.length)];
      const aiId = Date.now().toString() + "a";
      setMessages((prev) => [{ id: aiId, text: fallback, isUser: false }, ...prev]);
      speakMsg(fallback, aiId, muted, voiceUnlocked || Platform.OS !== "web");
    } finally {
      setIsTyping(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const translationText = translations[item.id];
    const isTranslating = translatingIds.has(item.id);
    const isSpeakingThis = speakingId === item.id && subtitleWordIdx >= 0;

    // Render AI bubble text with per-word highlight when speaking
    const renderBubbleText = () => {
      if (!item.isUser && isSpeakingThis) {
        let wordCount = 0;
        return (
          <Text style={[styles.bubbleText, styles.bubbleTextAI]}>
            {item.text.split(/(\s+)/).map((token, i) => {
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
          {item.text}
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

      {/* iOS Safari voice unlock banner — web only, disappears once tapped */}
      {Platform.OS === "web" && !voiceUnlocked && !muted && (
        <Pressable
          style={({ pressed }) => [styles.voiceUnlockBanner, pressed && { opacity: 0.8 }]}
          onPress={handleUnlockVoice}
        >
          <Ionicons name="volume-medium" size={14} color="#FF6B9D" />
          <Text style={styles.voiceUnlockText}>Tap to enable tutor voice</Text>
        </Pressable>
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
              <Text style={styles.settingsTitle}>Voice Settings</Text>
              <Pressable onPress={() => setShowSettings(false)} hitSlop={10}>
                <Ionicons name="close" size={20} color="#A08090" />
              </Pressable>
            </View>

            {/* Speed */}
            <Text style={styles.settingLabel}>Speed</Text>
            <View style={styles.segmentRow}>
              {([
                { label: "🐢 Slow", value: 0.6 },
                { label: "Normal", value: 0.85 },
                { label: "🐇 Fast", value: 1.2 },
              ] as { label: string; value: number }[]).map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.segmentBtn, rate === opt.value && styles.segmentBtnActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRate(opt.value); }}
                >
                  <Text style={[styles.segmentBtnText, rate === opt.value && styles.segmentBtnTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Pitch */}
            <Text style={styles.settingLabel}>Pitch</Text>
            <View style={styles.segmentRow}>
              {([
                { label: "Low", value: 0.7 },
                { label: "Normal", value: 1.0 },
                { label: "High", value: 1.4 },
              ] as { label: string; value: number }[]).map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.segmentBtn, pitch === opt.value && styles.segmentBtnActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPitch(opt.value); }}
                >
                  <Text style={[styles.segmentBtnText, pitch === opt.value && styles.segmentBtnTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Voice selection */}
            {availableVoices.length > 0 && (
              <>
                <Text style={styles.settingLabel}>Voice</Text>
                <ScrollView style={styles.voiceList} showsVerticalScrollIndicator={false}>
                  {availableVoices.map((v) => (
                    <Pressable
                      key={v.id}
                      style={[styles.voiceRow, selectedVoiceId === v.id && styles.voiceRowActive]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedVoiceId(v.id); }}
                    >
                      <View style={[styles.radioCircle, selectedVoiceId === v.id && styles.radioCircleActive]}>
                        {selectedVoiceId === v.id && <View style={styles.radioDot} />}
                      </View>
                      <View style={styles.voiceInfo}>
                        <Text style={[styles.voiceName, selectedVoiceId === v.id && styles.voiceNameActive]} numberOfLines={1}>
                          {v.name}
                        </Text>
                        <Text style={styles.voiceLang}>{v.lang}</Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            {availableVoices.length === 0 && (
              <View style={styles.noVoicesBox}>
                <Text style={styles.noVoicesText}>No voices found for this language on your device.</Text>
              </View>
            )}
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
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t("type_message")}
              placeholderTextColor="#C4B5BF"
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
                pressed && !!inputText.trim() && { opacity: 0.82, transform: [{ scale: 0.94 }] },
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
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
  voiceUnlockBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#FFF0F6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFB3D1",
  },
  voiceUnlockText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#FF6B9D",
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
  sendBtn: { borderRadius: 20, overflow: "hidden", marginBottom: 2 },
  sendBtnDisabled: { opacity: 0.55 },
  sendBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
