import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { getTutor, speakText, Tutor } from "@/constants/tutors";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

function speak(text: string, lang: string, muted: boolean) {
  if (muted) return;
  if (Platform.OS === "web") {
    speakText(text, lang, false);
  } else {
    Speech.speak(text, { language: lang, rate: 0.88 });
  }
}

function stopSpeech() {
  if (Platform.OS === "web") {
    try { window.speechSynthesis?.cancel(); } catch {}
  } else {
    Speech.stop();
  }
}

export default function ChatRoomScreen() {
  const { tutorId } = useLocalSearchParams<{ tutorId: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const tutor = getTutor(tutorId ?? "") as Tutor | undefined;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Send greeting on mount
  useEffect(() => {
    if (!tutor) return;
    const timer = setTimeout(() => {
      const id = "greeting";
      const greeting = tutor.greeting;
      setMessages([{ id, text: greeting, isUser: false }]);
      speak(greeting, tutor.speechLang, false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleReplay = useCallback(
    (msg: Message) => {
      if (!tutor) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      stopSpeech();
      setSpeakingId(msg.id);
      speak(msg.text, tutor.speechLang, muted);
      setTimeout(() => setSpeakingId(null), 3000);
    },
    [tutor, muted]
  );

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!muted) stopSpeech();
    setMuted((m) => !m);
  };

  const sendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !tutor) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString() + "u",
      text: trimmed,
      isUser: true,
    };
    setInputText("");
    setMessages((prev) => [userMsg, ...prev]);
    setIsTyping(true);

    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const pool = tutor.responses;
      const responseText = pool[Math.floor(Math.random() * pool.length)];
      const aiId = Date.now().toString() + "a";
      const aiMsg: Message = { id: aiId, text: responseText, isUser: false };
      setMessages((prev) => [aiMsg, ...prev]);
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speak(responseText, tutor.speechLang, muted);
      setSpeakingId(aiId);
      setTimeout(() => setSpeakingId(null), 4000);
      inputRef.current?.focus();
    }, delay);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.isUser ? styles.msgRowUser : styles.msgRowAI]}>
      {!item.isUser && (
        <View style={styles.tutorAvatar}>
          <Text style={styles.tutorAvatarEmoji}>{tutor?.emoji ?? "👩"}</Text>
        </View>
      )}
      <View style={[styles.bubble, item.isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, item.isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
          {item.text}
        </Text>
        {!item.isUser && (
          <Pressable
            onPress={() => handleReplay(item)}
            style={({ pressed }) => [styles.replayBtn, pressed && { opacity: 0.7 }]}
            hitSlop={8}
          >
            <Ionicons
              name={speakingId === item.id ? "volume-high" : "volume-medium-outline"}
              size={15}
              color={speakingId === item.id ? "#FF6B9D" : "#C4B5BF"}
            />
          </Pressable>
        )}
      </View>
    </View>
  );

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
      </View>

      {/* KAV wraps messages + input */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          inverted
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

        {/* Input bar — outside tabs so bottomPad = safe area only */}
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

  /* ── Header ── */
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
  tutorAvatarHeaderEmoji: {
    fontSize: 22,
  },
  headerCenter: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  headerFlag: {
    fontSize: 16,
  },
  headerRegion: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
    marginTop: 1,
  },
  muteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── Style badge ── */
  styleBadgeRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,248,251,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#F9ECF3",
  },
  styleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  styleBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    lineHeight: 15,
    flexShrink: 1,
  },

  /* ── Messages ── */
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
  },
  tutorAvatarEmoji: { fontSize: 16 },
  bubble: {
    maxWidth: "75%",
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
  replayBtn: {
    alignSelf: "flex-end",
    marginTop: 4,
    padding: 2,
  },
  typingBubble: { paddingVertical: 14 },
  typingDots: { flexDirection: "row", gap: 5, alignItems: "center" },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#C4B5BF",
  },

  /* ── Input bar ── */
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
  sendBtn: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 2,
  },
  sendBtnDisabled: { opacity: 0.55 },
  sendBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
