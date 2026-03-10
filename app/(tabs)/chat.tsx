import React, { useState, useRef } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const AI_RESPONSES: string[] = [
  "That's great! Let me help you practice. Can you try using that word in a sentence?",
  "Excellent effort! In Korean, we say '잘했어요' (Jal haesseoyo) which means 'Well done!'",
  "Let's try a different phrase. How would you say 'Where is the restaurant?' in Korean?",
  "Perfect! You're really improving. Let's move to the next topic.",
  "Very good! Remember, Korean sentence structure is Subject-Object-Verb. Try again!",
  "Interesting! Would you like me to explain more about this grammar point?",
  "You're making great progress! Want to practice some common daily phrases?",
];

// iOS tab bar = 49pt (items) + safe-area bottom. Android = ~56pt.
// We push the whole screen up by this amount so the tab bar never covers content.
const TAB_BAR_HEIGHT = 49;

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  // On web the tab bar has an explicit height of 84. On native we offset by
  // TAB_BAR_HEIGHT + bottom safe-area so content lives above the absolute tab bar.
  const tabBarOffset =
    Platform.OS === "web" ? 84 : TAB_BAR_HEIGHT + insets.bottom;

  const [messages, setMessages] = useState<Message[]>([
    { id: "0", text: t("ai_greeting"), isUser: false },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const sendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString() + "u",
      text: trimmed,
      isUser: true,
    };
    setInputText("");
    setMessages((prev) => [userMsg, ...prev]);
    setIsTyping(true);

    setTimeout(() => {
      const aiText =
        AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      const aiMsg: Message = {
        id: Date.now().toString() + "a",
        text: aiText,
        isUser: false,
      };
      setMessages((prev) => [aiMsg, ...prev]);
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      inputRef.current?.focus();
    }, 1200 + Math.random() * 800);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.msgRow,
        item.isUser ? styles.msgRowUser : styles.msgRowAI,
      ]}
    >
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <LinearGradient
            colors={["#FF6B9D", "#FF8FB3"]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.aiAvatarEmoji}>✨</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          item.isUser ? styles.bubbleUser : styles.bubbleAI,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            item.isUser ? styles.bubbleTextUser : styles.bubbleTextAI,
          ]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    // paddingBottom lifts ALL content above the absolute-positioned tab bar.
    <View style={[styles.screen, { paddingTop: topPad, paddingBottom: tabBarOffset }]}>
      <LinearGradient
        colors={["#FFF0F6", "#FFF8FB"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Compact header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiAvatar}>
            <LinearGradient
              colors={["#FF6B9D", "#FF8FB3"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.aiAvatarEmoji}>✨</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>LinguaAI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>
        <Pressable style={styles.headerBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color="#A08090" />
        </Pressable>
      </View>

      {/* KAV lifts content above keyboard when it opens */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
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
                <View style={styles.aiAvatar}>
                  <LinearGradient
                    colors={["#FF6B9D", "#FF8FB3"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.aiAvatarEmoji}>✨</Text>
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

        {/* Input — always visible above the tab bar */}
        <View style={styles.inputBar}>
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
                pressed &&
                  !!inputText.trim() && {
                    opacity: 0.82,
                    transform: [{ scale: 0.94 }],
                  },
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <LinearGradient
                colors={
                  inputText.trim()
                    ? ["#FF6B9D", "#FF4081"]
                    : ["#E8D5DC", "#E8D5DC"]
                }
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
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0D6E4",
    backgroundColor: "rgba(255,248,251,0.97)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    lineHeight: 19,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
  },
  onlineText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#4CAF50",
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F5E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── Messages ── */
  listContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 2,
  },
  msgRowUser: {
    justifyContent: "flex-end",
  },
  msgRowAI: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  aiAvatarEmoji: {
    fontSize: 14,
  },
  bubble: {
    maxWidth: "76%",
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
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextUser: {
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
  },
  bubbleTextAI: {
    fontFamily: "Inter_400Regular",
    color: "#1A1A2E",
  },
  typingBubble: {
    paddingVertical: 14,
  },
  typingDots: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
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
    paddingBottom: 10,
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
  sendBtnDisabled: {
    opacity: 0.55,
  },
  sendBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
