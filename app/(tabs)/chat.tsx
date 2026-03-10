import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AI_RESPONSES: string[] = [
  "That's great! Let me help you practice. Can you try using that word in a sentence?",
  "Excellent effort! In Korean, we say '잘했어요' (Jal haesseoyo) which means 'Well done!'",
  "Let's try a different phrase. How would you say 'Where is the restaurant?' in Korean?",
  "Perfect pronunciation! You're really improving. Let's move to the next topic.",
  "Very good! Remember, Korean sentence structure is Subject-Object-Verb. Try again!",
  "Interesting! Would you like me to explain more about this grammar point?",
  "You're making great progress! Want to practice some common phrases used in everyday life?",
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      text: t("ai_greeting"),
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString() + "u",
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    const msgText = inputText.trim();
    setInputText("");
    setMessages((prev) => [userMsg, ...prev]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      const aiMsg: Message = {
        id: Date.now().toString() + "a",
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [aiMsg, ...prev]);
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1200 + Math.random() * 800);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.isUser ? styles.msgRowUser : styles.msgRowAI]}>
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <LinearGradient colors={["#FF6B9D", "#FF8FB3"]} style={StyleSheet.absoluteFill} />
          <Text style={styles.aiAvatarText}>✨</Text>
        </View>
      )}
      <View style={[styles.bubble, item.isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, item.isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#FFF0F6", "#FFF8FB"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiHeaderAvatar}>
            <LinearGradient colors={["#FF6B9D", "#FF8FB3"]} style={StyleSheet.absoluteFill} />
            <Text style={styles.aiAvatarText}>✨</Text>
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
          <Ionicons name="ellipsis-horizontal" size={20} color="#A08090" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isTyping ? (
              <View style={[styles.msgRow, styles.msgRowAI]}>
                <View style={styles.aiAvatar}>
                  <LinearGradient colors={["#FF6B9D", "#FF8FB3"]} style={StyleSheet.absoluteFill} />
                  <Text style={styles.aiAvatarText}>✨</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
                  <View style={styles.typingDots}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                  </View>
                </View>
              </View>
            ) : null
          }
        />

        <View style={[styles.inputContainer, { paddingBottom: Math.max(bottomPad + 8, 16) }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t("type_message")}
              placeholderTextColor="#C4B5BF"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
                pressed && inputText.trim() && { opacity: 0.85, transform: [{ scale: 0.95 }] },
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0D6E4",
    backgroundColor: "rgba(255,248,251,0.95)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aiHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#4CAF50",
  },
  onlineText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#4CAF50",
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  msgRowUser: {
    justifyContent: "flex-end",
  },
  msgRowAI: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  aiAvatarText: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: "#FF6B9D",
    borderBottomRightRadius: 6,
  },
  bubbleAI: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
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
    paddingHorizontal: 16,
  },
  typingDots: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C4B5BF",
  },
  dot1: {},
  dot2: {},
  dot3: {},
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "rgba(255,248,251,0.95)",
    borderTopWidth: 1,
    borderTopColor: "#F0D6E4",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: "#F0D6E4",
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
    borderRadius: 22,
    overflow: "hidden",
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
});
