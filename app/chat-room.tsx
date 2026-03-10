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

function stopSpeech() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } else {
    try { Speech.stop(); } catch {}
  }
}

function webSpeak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  const doSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const match =
      voices.find((v) => v.lang === lang) ??
      voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
    if (match) utterance.voice = match;
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

async function speak(text: string, lang: string, muted: boolean, voiceUnlocked = true) {
  if (muted) return;
  if (Platform.OS === "web") {
    if (!voiceUnlocked) return; // iOS Safari blocks auto-speech without user gesture
    webSpeak(text, lang);
  } else {
    // Always stop first, then wait, then speak — avoids isSpeakingAsync flakiness
    try { Speech.stop(); } catch {}
    await new Promise((r) => setTimeout(r, 120));
    try {
      Speech.speak(text, { language: lang, rate: 0.9 });
    } catch (e) {
      console.error("[Speech] speak() failed:", e);
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
  const [shownTranslations, setShownTranslations] = useState<Set<string>>(new Set());
  // Web/iOS Safari requires a user gesture before speechSynthesis will play
  const [voiceUnlocked, setVoiceUnlocked] = useState(Platform.OS !== "web");
  const inputRef = useRef<TextInput>(null);
  const conversationHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const userNativeLang = nativeLanguage ?? "english";
  const userLangName = LANG_NAMES[userNativeLang] ?? "English";
  const tutorLangName = tutor ? (LANG_NAMES[tutor.language.toLowerCase()] ?? tutor.language) : "English";
  const canTranslate = tutorLangName.toLowerCase() !== userLangName.toLowerCase();

  useEffect(() => {
    if (!tutor) return;
    const timer = setTimeout(() => {
      const id = "greeting";
      setMessages([{ id, text: tutor.greeting, isUser: false }]);
      conversationHistoryRef.current = [{ role: "assistant", content: tutor.greeting }];
      // voiceUnlocked is false on web initially, so greeting won't auto-play
      // until the user taps the unlock banner (handleUnlockVoice speaks it after)
      speak(tutor.greeting, tutor.speechLang, false, Platform.OS !== "web");
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleUnlockVoice = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVoiceUnlocked(true);
    // Speak the last tutor message — this tap IS the required user gesture
    const lastAI = messages.find((m) => !m.isUser);
    if (lastAI && tutor && !muted) {
      setTimeout(() => webSpeak(lastAI.text, tutor.speechLang), 100);
    }
  }, [messages, tutor, muted]);

  const handleReplay = useCallback(
    (msg: Message) => {
      if (!tutor) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSpeakingId(msg.id);
      if (Platform.OS === "web") {
        webSpeak(msg.text, tutor.speechLang);
      } else {
        speak(msg.text, tutor.speechLang, muted, true);
      }
      setTimeout(() => setSpeakingId(null), 4000);
    },
    [tutor, muted]
  );

  const handleTranslate = useCallback(
    async (msg: Message) => {
      if (!canTranslate) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (shownTranslations.has(msg.id)) {
        setShownTranslations((prev) => {
          const next = new Set(prev);
          next.delete(msg.id);
          return next;
        });
        return;
      }

      setShownTranslations((prev) => new Set(prev).add(msg.id));

      if (translations[msg.id]) return;

      setTranslatingIds((prev) => new Set(prev).add(msg.id));
      try {
        const result = await fetchTranslation(msg.text, userLangName, getApiUrl());
        setTranslations((prev) => ({ ...prev, [msg.id]: result }));
      } catch {
        setTranslations((prev) => ({ ...prev, [msg.id]: "Translation unavailable." }));
      } finally {
        setTranslatingIds((prev) => {
          const next = new Set(prev);
          next.delete(msg.id);
          return next;
        });
      }
    },
    [canTranslate, shownTranslations, translations, userLangName]
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
      speak(responseText, tutor.speechLang, muted, voiceUnlocked);
      setSpeakingId(aiId);
      setTimeout(() => setSpeakingId(null), 5000);
      inputRef.current?.focus();
    } catch {
      const fallback = tutor.responses[Math.floor(Math.random() * tutor.responses.length)];
      const aiId = Date.now().toString() + "a";
      setMessages((prev) => [{ id: aiId, text: fallback, isUser: false }, ...prev]);
      speak(fallback, tutor.speechLang, muted, voiceUnlocked);
    } finally {
      setIsTyping(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const showingTranslation = shownTranslations.has(item.id);
    const translationText = translations[item.id];
    const isTranslating = translatingIds.has(item.id);

    return (
      <View style={[styles.msgRow, item.isUser ? styles.msgRowUser : styles.msgRowAI]}>
        {!item.isUser && (
          <View style={styles.tutorAvatar}>
            <Text style={styles.tutorAvatarEmoji}>{tutor?.emoji ?? "👩"}</Text>
          </View>
        )}

        <View style={styles.bubbleColumn}>
          <View style={[styles.bubble, item.isUser ? styles.bubbleUser : styles.bubbleAI]}>
            <Text style={[styles.bubbleText, item.isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
              {item.text}
            </Text>

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

                {canTranslate && (
                  <Pressable
                    onPress={() => handleTranslate(item)}
                    style={({ pressed }) => [
                      styles.bubbleActionBtn,
                      showingTranslation && styles.bubbleActionBtnActive,
                      pressed && { opacity: 0.65 },
                    ]}
                    hitSlop={6}
                  >
                    <Ionicons
                      name="language-outline"
                      size={14}
                      color={showingTranslation ? "#FF6B9D" : "#C4B5BF"}
                    />
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {!item.isUser && showingTranslation && (
            <View style={styles.translationBox}>
              {isTranslating ? (
                <View style={styles.translationLoading}>
                  <ActivityIndicator size="small" color="#FF6B9D" />
                  <Text style={styles.translationLoadingText}>Translating...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.translationHeader}>
                    <Ionicons name="language" size={11} color="#FF6B9D" />
                    <Text style={styles.translationHeaderText}>{userNativeLang.charAt(0).toUpperCase() + userNativeLang.slice(1)}</Text>
                  </View>
                  <Text style={styles.translationText}>{translationText}</Text>
                </>
              )}
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
            <Ionicons name="language-outline" size={11} color="#A08090" />
            <Text style={styles.translateHintText}>Tap 🌐 under any message to translate</Text>
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

      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          inverted
          extraData={{ translations, shownTranslations, translatingIds, speakingId }}
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

  translationBox: {
    backgroundColor: "#FFF0F6",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFB3CE",
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 4,
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
  translationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  translationHeaderText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#FF6B9D",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  translationText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#5A4A54",
    lineHeight: 20,
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
