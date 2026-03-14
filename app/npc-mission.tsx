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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "@/context/LanguageContext";
import { getNPC, NPC, NPC_EMOTIONS, NPC_REL_LEVELS, getRelTier, getRelLabel, RelationshipTier } from "@/constants/npcs";
import { getApiUrl } from "@/lib/query-client";
import { recordAudio } from "@/lib/audio";
import { C, F } from "@/constants/theme";

const REL_KEY = "npcRelationships";
const EMO_KEY  = "npcEmotions";

const NPC_OPENING: Record<string, Record<string, string>> = {
  emma:         { english: "Welcome! ☕ What can I get for you today?", korean: "어서오세요! ☕ 오늘 무엇을 드릴까요?", spanish: "¡Bienvenido! ☕ ¿Qué le pongo hoy?" },
  james:        { english: "Good day! ✈️ How can I assist you with your travel?", korean: "안녕하세요! ✈️ 오늘 여행 도움이 필요하신가요?", spanish: "¡Buen día! ✈️ ¿En qué le puedo ayudar con su viaje?" },
  officer_park: { english: "Halt. I need to ask you a few questions.", korean: "멈춰요. 몇 가지 질문이 있습니다.", spanish: "Alto. Necesito hacerle unas preguntas." },
  bar_alex:     { english: "Hey! 🍺 What'll it be tonight?", korean: "어이! 🍺 오늘 밤 뭐 마실 거예요?", spanish: "¡Oye! 🍺 ¿Qué va a ser esta noche?" },
  sofia:        { english: "Good evening! 🏨 Welcome. Do you have a reservation?", korean: "안녕하세요! 🏨 오신 것을 환영합니다. 예약하셨나요?", spanish: "¡Buenas noches! 🏨 Bienvenido. ¿Tiene reserva?" },
  mia:          { english: "Hi there! 🛍️ Looking for something special today?", korean: "안녕하세요! 🛍️ 오늘 특별한 것을 찾고 계신가요?", spanish: "¡Hola! 🛍️ ¿Busca algo especial hoy?" },
  dr_kim:       { english: "Good morning. Please have a seat. What brings you in today?", korean: "좋은 아침입니다. 앉으세요. 오늘 어떻게 오셨나요?", spanish: "Buenos días. Por favor, siéntese. ¿Qué le trae por aquí?" },
  lisa:         { english: "Thank you for calling! 📞 How may I assist you today?", korean: "전화해 주셔서 감사합니다! 📞 오늘 어떻게 도와드릴까요?", spanish: "¡Gracias por llamar! 📞 ¿En qué puedo ayudarle hoy?" },
  marco:        { english: "Buongiorno! 🍽️ Welcome! Are you dining alone today?", korean: "어서오세요! 🍽️ 오늘 혼자 오셨나요?", spanish: "¡Buongiorno! 🍽️ ¡Bienvenido! ¿Cena solo hoy?" },
  tom:          { english: "Hey! 🚕 Where are we headed today?", korean: "안녕하세요! 🚕 오늘 어디로 가세요?", spanish: "¡Hola! 🚕 ¿Adónde vamos hoy?" },
};

interface NpcMessage {
  id: string;
  text: string;
  isUser: boolean;
}

let _webAudioEl: HTMLAudioElement | null = null;

function stopAudio() {
  if (Platform.OS !== "web") {
    try { Speech.stop(); } catch {}
  } else {
    if (_webAudioEl) { _webAudioEl.pause(); _webAudioEl.src = ""; _webAudioEl = null; }
  }
}

function stripEmojis(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\u{FE00}-\u{FE0F}\u{1F3FB}-\u{1F3FF}\u200D]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default function NpcMissionScreen() {
  const { npcId } = useLocalSearchParams<{ npcId: string }>();
  const insets = useSafeAreaInsets();
  const { learningLanguage, nativeLanguage, stats, updateStats } = useLanguage();

  const npc = getNPC(npcId ?? "") as NPC | undefined;
  const language = (learningLanguage ?? "english") as string;
  const native   = (nativeLanguage ?? "english") as string;

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [messages, setMessages]     = useState<NpcMessage[]>([]);
  const [relationship, setRelationship] = useState(0);
  const [emotion, setEmotion]       = useState("neutral");
  const [choices, setChoices]       = useState<{ text: string; translation: string }[]>([]);
  const [choiceTranslVisible, setChoiceTranslVisible] = useState<boolean[]>([]);
  const [isTyping, setIsTyping]     = useState(false);
  const [inputText, setInputText]   = useState("");
  const [muted, setMuted]           = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const [pendingChoice, setPendingChoice] = useState<string | null>(null);
  const [showPopup, setShowPopup]   = useState(false);
  const [popupPlaying, setPopupPlaying] = useState(false);

  const [scoreAnim] = useState(new Animated.Value(0));
  const [scoreDisplay, setScoreDisplay] = useState<{ amount: number; positive: boolean } | null>(null);
  const scoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [wordPopup, setWordPopup] = useState<{ word: string; meaning: string; partOfSpeech: string; example: string } | null>(null);
  const [wordLoading, setWordLoading] = useState(false);
  const [wordExPlaying, setWordExPlaying] = useState(false);
  const [wordPronPlaying, setWordPronPlaying] = useState(false);
  const wordCache = useRef<Record<string, { meaning: string; partOfSpeech: string; example: string }>>({});

  const conversationRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const inputRef = useRef<TextInput>(null);
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  const tier: RelationshipTier = getRelTier(relationship);
  const level = NPC_REL_LEVELS[tier];

  useEffect(() => { return () => { stopAudio(); }; }, []);

  useEffect(() => {
    if (!npc) return;
    const openingText = NPC_OPENING[npc.id]?.[language] ?? NPC_OPENING[npc.id]?.english ?? "Hello!";
    const openingId   = "opening-" + npc.id;

    AsyncStorage.multiGet([REL_KEY, EMO_KEY]).then(([[, relRaw], [, emoRaw]]) => {
      const rels = relRaw ? JSON.parse(relRaw) : {};
      const emos = emoRaw ? JSON.parse(emoRaw) : {};
      const savedScore = typeof rels[npc.id] === "number" ? rels[npc.id] : 0;
      const savedEmo   = emos[npc.id] ?? "neutral";
      setRelationship(savedScore);
      setEmotion(savedEmo);
      setMessages([{ id: openingId, text: openingText, isUser: false }]);
      setTimeout(() => playNpcTts(openingText, openingId), 400);
      fetchNpcReply([], true, savedScore);
    }).catch(() => {
      setMessages([{ id: openingId, text: openingText, isUser: false }]);
      setTimeout(() => playNpcTts(openingText, openingId), 400);
      fetchNpcReply([], true, 0);
    });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const saveRelationship = useCallback(async (npcIdKey: string, score: number, emo: string) => {
    try {
      const [relRaw, emoRaw] = await Promise.all([
        AsyncStorage.getItem(REL_KEY),
        AsyncStorage.getItem(EMO_KEY),
      ]);
      const rels = relRaw ? JSON.parse(relRaw) : {};
      const emos = emoRaw ? JSON.parse(emoRaw) : {};
      rels[npcIdKey] = score;
      emos[npcIdKey] = emo;
      await Promise.all([
        AsyncStorage.setItem(REL_KEY, JSON.stringify(rels)),
        AsyncStorage.setItem(EMO_KEY, JSON.stringify(emos)),
      ]);
    } catch {}
  }, []);

  const showScoreChange = useCallback((amount: number) => {
    if (amount === 0) return;
    if (scoreTimer.current) clearTimeout(scoreTimer.current);
    setScoreDisplay({ amount, positive: amount > 0 });
    scoreAnim.setValue(0);
    Animated.sequence([
      Animated.timing(scoreAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(scoreAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    scoreTimer.current = setTimeout(() => setScoreDisplay(null), 1800);
  }, [scoreAnim]);

  const playNpcTts = useCallback((text: string, msgId: string) => {
    if (muted || !npc) return;
    stopAudio();
    setSpeakingId(msgId);
    const ttsText = stripEmojis(text).slice(0, 3000);

    if (Platform.OS === "web") {
      const url = new URL("/api/npc-tts", getApiUrl());
      url.searchParams.set("text", ttsText);
      url.searchParams.set("npcId", npc.id);
      url.searchParams.set("npcLang", language);
      url.searchParams.set("speed", "1.0");

      fetch(url.toString())
        .then(r => { if (!r.ok) throw new Error(`TTS ${r.status}`); return r.blob(); })
        .then(blob => {
          const objUrl = URL.createObjectURL(blob);
          if (_webAudioEl) { _webAudioEl.pause(); _webAudioEl.src = ""; }
          const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
          _webAudioEl = audio;
          audio.onended = () => { URL.revokeObjectURL(objUrl); _webAudioEl = null; setSpeakingId(null); };
          audio.onerror = () => { URL.revokeObjectURL(objUrl); _webAudioEl = null; setSpeakingId(null); };
          audio.play().catch(() => setSpeakingId(null));
        })
        .catch(() => setSpeakingId(null));
    } else {
      const voiceInfo = npc.voice[language as keyof typeof npc.voice] ?? npc.voice.english;
      Speech.speak(ttsText, {
        language: voiceInfo.lang,
        rate: 1.0,
        onDone: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      });
    }
  }, [muted, npc, language]);

  const fetchNpcReply = useCallback(async (
    history: { role: "user" | "assistant"; content: string }[],
    isStart: boolean,
    relScore: number,
  ) => {
    if (!npc) return;
    if (!isStart) setIsTyping(true);
    try {
      const res = await fetch(new URL("/api/npc-chat", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npcId: npc.id,
          language,
          nativeLanguage: native,
          relationshipScore: relScore,
          messages: history,
          isStart,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "NPC chat failed");

      const { reply, scoreChange, emotion: newEmotion, choices: newChoices } = data as {
        reply: string;
        scoreChange: number;
        emotion: string;
        choices: { text: string; translation: string }[];
      };

      const safeChoices = Array.isArray(newChoices) ? newChoices.slice(0, 3) : [];

      if (isStart) {
        setChoices(safeChoices);
        setChoiceTranslVisible(Array(safeChoices.length).fill(false));
        setEmotion(newEmotion ?? "neutral");
        return;
      }

      const msgId = Date.now().toString() + "npc";
      const npcMsg: NpcMessage = { id: msgId, text: reply, isUser: false };

      setMessages(prev => [npcMsg, ...prev]);
      conversationRef.current = [...history, { role: "assistant", content: reply }];
      setChoices(safeChoices);
      setChoiceTranslVisible(Array(safeChoices.length).fill(false));

      if (scoreChange !== 0) {
        const newScore = Math.min(100, Math.max(0, relScore + scoreChange));
        setRelationship(newScore);
        setEmotion(newEmotion ?? "neutral");
        saveRelationship(npc.id, newScore, newEmotion ?? "neutral");
        showScoreChange(scoreChange);
        updateStats({ xp: statsRef.current.xp + Math.max(0, scoreChange) });
      } else {
        setEmotion(newEmotion ?? "neutral");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playNpcTts(reply, msgId);
    } catch {
      if (!isStart) {
        const fallbackId = Date.now().toString() + "err";
        setMessages(prev => [{ id: fallbackId, text: "...", isUser: false }, ...prev]);
      }
    } finally {
      if (!isStart) setIsTyping(false);
    }
  }, [npc, language, playNpcTts, saveRelationship, showScoreChange, updateStats]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !npc || isTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: NpcMessage = { id: Date.now().toString() + "u", text: trimmed, isUser: true };
    const newHistory = [...conversationRef.current, { role: "user" as const, content: trimmed }];
    conversationRef.current = newHistory;

    setMessages(prev => [userMsg, ...prev]);
    setInputText("");
    setChoices([]);
    setChoiceTranslVisible([]);

    await fetchNpcReply(newHistory, false, relationship);
  }, [npc, isTyping, relationship, fetchNpcReply]);

  const handleChoiceTap = useCallback((choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPendingChoice(choice);
    setShowPopup(true);
    if (!muted && npc) {
      setPopupPlaying(true);
      const ttsText = stripEmojis(choice).slice(0, 500);
      if (Platform.OS === "web") {
        const url = new URL("/api/npc-tts", getApiUrl());
        url.searchParams.set("text", ttsText);
        url.searchParams.set("npcId", npc.id);
        url.searchParams.set("npcLang", language);
        url.searchParams.set("speed", "1.0");
        fetch(url.toString())
          .then(r => r.blob())
          .then(blob => {
            const objUrl = URL.createObjectURL(blob);
            const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
            audio.onended = () => { URL.revokeObjectURL(objUrl); setPopupPlaying(false); };
            audio.onerror = () => { URL.revokeObjectURL(objUrl); setPopupPlaying(false); };
            audio.play().catch(() => setPopupPlaying(false));
          })
          .catch(() => setPopupPlaying(false));
      } else {
        const voiceInfo = npc.voice[language as keyof typeof npc.voice] ?? npc.voice.english;
        Speech.speak(ttsText, {
          language: voiceInfo.lang,
          rate: 1.0,
          onDone: () => setPopupPlaying(false),
          onError: () => setPopupPlaying(false),
        });
      }
    }
  }, [muted, npc, language]);

  const handlePopupReplay = useCallback(() => {
    if (!pendingChoice || !npc) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPopupPlaying(true);
    const ttsText = stripEmojis(pendingChoice).slice(0, 500);
    if (Platform.OS === "web") {
      const url = new URL("/api/npc-tts", getApiUrl());
      url.searchParams.set("text", ttsText);
      url.searchParams.set("npcId", npc.id);
      url.searchParams.set("npcLang", language);
      url.searchParams.set("speed", "1.0");
      fetch(url.toString())
        .then(r => r.blob())
        .then(blob => {
          const objUrl = URL.createObjectURL(blob);
          const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
          audio.onended = () => { URL.revokeObjectURL(objUrl); setPopupPlaying(false); };
          audio.onerror = () => { URL.revokeObjectURL(objUrl); setPopupPlaying(false); };
          audio.play().catch(() => setPopupPlaying(false));
        })
        .catch(() => setPopupPlaying(false));
    } else {
      const voiceInfo = npc.voice[language as keyof typeof npc.voice] ?? npc.voice.english;
      Speech.speak(ttsText, {
        language: voiceInfo.lang,
        rate: 1.0,
        onDone: () => setPopupPlaying(false),
        onError: () => setPopupPlaying(false),
      });
    }
  }, [pendingChoice, npc, language]);

  const handlePopupSend = useCallback(() => {
    if (!pendingChoice) return;
    setShowPopup(false);
    stopAudio();
    setPopupPlaying(false);
    const text = pendingChoice;
    setPendingChoice(null);
    sendMessage(text);
  }, [pendingChoice, sendMessage]);

  const handlePopupCancel = useCallback(() => {
    setShowPopup(false);
    stopAudio();
    setPopupPlaying(false);
    setPendingChoice(null);
  }, []);

  const lookupWord = useCallback(async (rawToken: string) => {
    const clean = rawToken.replace(/[^\p{L}\p{N}'-]/gu, "").trim();
    if (!clean || clean.length < 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const cacheKey = `${clean.toLowerCase()}:${language}:${native}`;
    if (wordCache.current[cacheKey]) {
      setWordPopup({ word: clean, ...wordCache.current[cacheKey] });
      return;
    }
    setWordLoading(true);
    setWordPopup(null);
    try {
      const res = await fetch(new URL("/api/word-lookup", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: clean, targetLanguage: language, nativeLanguage: native }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "lookup failed");
      const entry = {
        meaning:      (data.meaning      ?? "").trim() || clean,
        partOfSpeech: (data.partOfSpeech ?? "").trim(),
        example:      (data.example      ?? "").trim(),
      };
      wordCache.current[cacheKey] = entry;
      setWordPopup({ word: clean, ...entry });
    } catch {
      setWordPopup({ word: clean, meaning: clean, partOfSpeech: "", example: "" });
    } finally {
      setWordLoading(false);
    }
  }, [language, native]);

  const playWordPronunciation = useCallback((word: string) => {
    if (!npc || !word) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWordPronPlaying(true);
    if (Platform.OS === "web") {
      const url = new URL("/api/npc-tts", getApiUrl());
      url.searchParams.set("text", word);
      url.searchParams.set("npcId", npc.id);
      url.searchParams.set("npcLang", language);
      url.searchParams.set("speed", "0.8");
      fetch(url.toString())
        .then(r => r.blob())
        .then(blob => {
          const objUrl = URL.createObjectURL(blob);
          const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
          audio.onended = () => { URL.revokeObjectURL(objUrl); setWordPronPlaying(false); };
          audio.onerror = () => { URL.revokeObjectURL(objUrl); setWordPronPlaying(false); };
          audio.play().catch(() => setWordPronPlaying(false));
        })
        .catch(() => setWordPronPlaying(false));
    } else {
      const voiceInfo = npc.voice[language as keyof typeof npc.voice] ?? npc.voice.english;
      Speech.speak(word, {
        language: voiceInfo.lang,
        rate: 0.8,
        onDone: () => setWordPronPlaying(false),
        onError: () => setWordPronPlaying(false),
      });
    }
  }, [npc, language]);

  const playWordExample = useCallback((example: string) => {
    if (!npc || !example) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWordExPlaying(true);
    const ttsText = stripEmojis(example).slice(0, 400);
    if (Platform.OS === "web") {
      const url = new URL("/api/npc-tts", getApiUrl());
      url.searchParams.set("text", ttsText);
      url.searchParams.set("npcId", npc.id);
      url.searchParams.set("npcLang", language);
      url.searchParams.set("speed", "0.9");
      fetch(url.toString())
        .then(r => r.blob())
        .then(blob => {
          const objUrl = URL.createObjectURL(blob);
          const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
          audio.onended = () => { URL.revokeObjectURL(objUrl); setWordExPlaying(false); };
          audio.onerror = () => { URL.revokeObjectURL(objUrl); setWordExPlaying(false); };
          audio.play().catch(() => setWordExPlaying(false));
        })
        .catch(() => setWordExPlaying(false));
    } else {
      const voiceInfo = npc.voice[language as keyof typeof npc.voice] ?? npc.voice.english;
      Speech.speak(ttsText, {
        language: voiceInfo.lang,
        rate: 0.9,
        onDone: () => setWordExPlaying(false),
        onError: () => setWordExPlaying(false),
      });
    }
  }, [npc, language]);

  const renderClickableWords = useCallback((text: string, isNpcMsg: boolean) => {
    if (!isNpcMsg) {
      return (
        <Text style={[styles.bubbleText, styles.bubbleTextUser]}>{text}</Text>
      );
    }
    const tokens = text.split(/(\s+)/);
    return (
      <Text style={[styles.bubbleText, styles.bubbleTextNpc]}>
        {tokens.map((token, i) => {
          if (/^\s+$/.test(token) || token === "") {
            return <Text key={i}>{token}</Text>;
          }
          const wordPart = token.replace(/^[^\p{L}\p{N}'-]+|[^\p{L}\p{N}'-]+$/gu, "");
          if (!wordPart) {
            return <Text key={i} style={styles.bubbleTextNpc}>{token}</Text>;
          }
          const prefix = token.slice(0, token.indexOf(wordPart));
          const suffix = token.slice(token.indexOf(wordPart) + wordPart.length);
          return (
            <Text key={i}>
              {prefix ? <Text>{prefix}</Text> : null}
              <Text
                style={styles.clickableWord}
                onPress={() => lookupWord(wordPart)}
              >{wordPart}</Text>
              {suffix ? <Text>{suffix}</Text> : null}
            </Text>
          );
        })}
      </Text>
    );
  }, [lookupWord]);

  const handleVoiceInput = async () => {
    if (isRecording || isTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRecording(true);
    try {
      const { base64, mimeType } = await recordAudio(4000);
      const voiceInfo = npc?.voice[language as keyof NonNullable<typeof npc>["voice"]] ?? { lang: "en-US" };
      const res = await fetch(new URL("/api/stt", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64, mimeType, language: voiceInfo.lang }),
      });
      const data = await res.json();
      const transcribed = (data.text ?? "").trim();
      if (transcribed) {
        setInputText(transcribed);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsRecording(false);
    }
  };

  const emojiIcon = NPC_EMOTIONS[emotion] ?? "😐";

  const renderItem = ({ item }: { item: NpcMessage }) => (
    <View style={[styles.msgRow, item.isUser ? styles.msgRowUser : styles.msgRowNpc]}>
      {!item.isUser && npc && (
        <View style={[styles.npcAvatar, { backgroundColor: npc.color + "33", borderColor: npc.color + "88" }]}>
          <Text style={styles.npcAvatarEmoji}>{npc.emoji}</Text>
        </View>
      )}
      <View style={styles.bubbleCol}>
        <View style={[styles.bubble, item.isUser ? styles.bubbleUser : styles.bubbleNpc]}>
          {renderClickableWords(item.text, !item.isUser)}
          {!item.isUser && (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); playNpcTts(item.text, item.id); }}
              style={({ pressed }) => [styles.replayBtn, pressed && { opacity: 0.65 }]}
              hitSlop={6}
            >
              <Ionicons
                name={speakingId === item.id ? "volume-high" : "volume-medium-outline"}
                size={14}
                color={speakingId === item.id ? C.gold : C.goldDark}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );

  const showFreeInput = tier === "friendly" || tier === "close";
  const showFamiliar  = tier === "familiar";
  const showStranger  = tier === "stranger";

  const familiarChoices = choices.slice(0, 2);

  const sendLabel    = native === "korean" ? "보내기" : native === "spanish" ? "Enviar" : "Send";
  const reselectLabel = native === "korean" ? "다시선택" : native === "spanish" ? "Cancelar" : "Reselect";
  const tutorHint    = native === "korean"
    ? "더 자세한 문법 피드백은 튜터와 대화해보세요! 💬"
    : native === "spanish"
    ? "Para comentarios gramaticales detallados, habla con un tutor. 💬"
    : "For detailed grammar feedback, chat with a tutor! 💬";

  const scenario = language === "korean" ? npc?.scenarioKo : language === "spanish" ? npc?.scenarioEs : npc?.scenario;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => { stopAudio(); router.back(); }}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.65 }]}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={C.gold} />
        </Pressable>

        <View style={[styles.headerAvatar, { backgroundColor: (npc?.color ?? "#888") + "33", borderColor: (npc?.color ?? "#888") + "88" }]}>
          <Text style={styles.headerAvatarEmoji}>{npc?.emoji ?? "?"}</Text>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.headerNameRow}>
            <Text style={styles.headerName}>{npc?.name ?? "?"}</Text>
            <Text style={styles.emotionIcon}>{emojiIcon}</Text>
            <View style={styles.headerMuteBtn}>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (!muted) stopAudio(); setMuted(m => !m); }} hitSlop={6}>
                <Ionicons name={muted ? "volume-mute" : "volume-medium-outline"} size={16} color={muted ? C.goldDark : C.goldDim} />
              </Pressable>
            </View>
          </View>
          <Text style={styles.headerScenario}>{scenario ?? ""}</Text>
          <View style={styles.relRow}>
            <View style={styles.relTrack}>
              <View style={[styles.relFill, { width: `${Math.min(100, relationship)}%` as any, backgroundColor: level.color }]} />
            </View>
            <Text style={[styles.relLabel, { color: level.color }]}>
              {level.heart} {getRelLabel(tier, native)} {Math.round(relationship)}/100
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {/* ── CHAT ── */}
        <FlatList
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderItem}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={isTyping ? (
            <View style={[styles.msgRow, styles.msgRowNpc]}>
              <View style={[styles.npcAvatar, { backgroundColor: (npc?.color ?? "#888") + "33", borderColor: (npc?.color ?? "#888") + "88" }]}>
                <Text style={styles.npcAvatarEmoji}>{npc?.emoji ?? "?"}</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleNpc, styles.typingBubble]}>
                <View style={styles.typingDots}>
                  {[0, 1, 2].map(i => <View key={i} style={styles.dot} />)}
                </View>
              </View>
            </View>
          ) : null}
        />

        {/* ── TUTOR HINT ── */}
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>{tutorHint}</Text>
        </View>

        {/* ── INPUT AREA ── */}
        <View style={[styles.inputArea, { paddingBottom: bottomPad + 8 }]}>
          {/* Stranger: 3 choice buttons */}
          {showStranger && choices.length > 0 && (
            <View style={styles.choicesWrap}>
              {choices.map((choice, i) => (
                <View key={i} style={styles.choiceBtnWrap}>
                  <Pressable
                    style={({ pressed }) => [styles.choiceBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
                    onPress={() => handleChoiceTap(choice.text)}
                    disabled={isTyping}
                  >
                    <Text style={styles.choiceBtnText}>{choice.text}</Text>
                    <Ionicons name="volume-medium-outline" size={12} color={C.goldDark} style={{ marginLeft: 6 }} />
                  </Pressable>
                  {choice.translation ? (
                    <Pressable
                      style={styles.translToggleBtn}
                      onPress={() => setChoiceTranslVisible(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
                    >
                      <Text style={styles.translToggleText}>
                        {choiceTranslVisible[i]
                          ? (native === "korean" ? "번역 숨기기" : native === "spanish" ? "Ocultar" : "Hide translation")
                          : (native === "korean" ? "번역 보기" : native === "spanish" ? "Ver traducción" : "Show translation")}
                      </Text>
                    </Pressable>
                  ) : null}
                  {choiceTranslVisible[i] && choice.translation ? (
                    <Text style={styles.translText}>{choice.translation}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {/* Familiar: 2 choices + text input */}
          {showFamiliar && (
            <>
              {choices.length > 0 && (
                <View style={styles.familiarChoicesRow}>
                  {familiarChoices.map((choice, i) => (
                    <View key={i} style={styles.familiarChoiceBtnWrap}>
                      <Pressable
                        style={({ pressed }) => [styles.familiarChoiceBtn, pressed && { opacity: 0.8 }]}
                        onPress={() => handleChoiceTap(choice.text)}
                        disabled={isTyping}
                      >
                        <Text style={styles.familiarChoiceBtnText} numberOfLines={3}>{choice.text}</Text>
                      </Pressable>
                      {choice.translation ? (
                        <Pressable
                          style={styles.translToggleBtn}
                          onPress={() => setChoiceTranslVisible(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
                        >
                          <Text style={styles.translToggleText}>
                            {choiceTranslVisible[i]
                              ? (native === "korean" ? "번역 숨기기" : native === "spanish" ? "Ocultar" : "Hide translation")
                              : (native === "korean" ? "번역 보기" : native === "spanish" ? "Ver traducción" : "Show translation")}
                          </Text>
                        </Pressable>
                      ) : null}
                      {choiceTranslVisible[i] && choice.translation ? (
                        <Text style={styles.translText}>{choice.translation}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.inputRow}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={native === "korean" ? "직접 입력..." : native === "spanish" ? "Escribe tu mensaje..." : "Type freely..."}
                  placeholderTextColor={C.goldDark}
                  multiline
                  maxLength={300}
                  onSubmitEditing={() => sendMessage(inputText)}
                  blurOnSubmit={false}
                  editable={!isTyping}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.sendBtn,
                    (!inputText.trim() || isTyping) && styles.sendBtnDisabled,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => sendMessage(inputText)}
                  disabled={!inputText.trim() || isTyping}
                >
                  <Ionicons name="arrow-forward" size={16} color={C.bg1} />
                </Pressable>
              </View>
            </>
          )}

          {/* Friendly/Close: free text + mic */}
          {showFreeInput && (
            <View style={styles.inputRow}>
              <Pressable
                style={({ pressed }) => [styles.micBtn, isRecording && styles.micBtnActive, pressed && { opacity: 0.8 }]}
                onPress={handleVoiceInput}
                disabled={isTyping}
              >
                <Ionicons name={isRecording ? "radio" : "mic-outline"} size={18} color={isRecording ? C.bg1 : C.goldDim} />
              </Pressable>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder={
                  tier === "close"
                    ? (native === "korean" ? "친한 친구처럼 대화해요..." : native === "spanish" ? "Habla libremente..." : "Talk freely — you're close!")
                    : (native === "korean" ? "자유롭게 대화하세요..." : native === "spanish" ? "Escribe tu mensaje..." : "Free conversation...")
                }
                placeholderTextColor={C.goldDark}
                multiline
                maxLength={300}
                onSubmitEditing={() => sendMessage(inputText)}
                blurOnSubmit={false}
                editable={!isTyping}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.sendBtn,
                  (!inputText.trim() || isTyping) && styles.sendBtnDisabled,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isTyping}
              >
                <Ionicons name="arrow-forward" size={16} color={C.bg1} />
              </Pressable>
            </View>
          )}

          {/* Loading state — no choices yet */}
          {showStranger && choices.length === 0 && !isTyping && (
            <View style={styles.loadingChoices}>
              <ActivityIndicator size="small" color={C.goldDim} />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* ── SCORE CHANGE TOAST ── */}
      {scoreDisplay && (
        <Animated.View
          style={[
            styles.scoreToast,
            {
              opacity: scoreAnim,
              transform: [{ translateY: scoreAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            },
          ]}
        >
          <Text style={[styles.scoreToastText, { color: scoreDisplay.positive ? "#4ADE80" : "#F87171" }]}>
            {scoreDisplay.positive ? `+${scoreDisplay.amount}` : `${scoreDisplay.amount}`}
            {" "}
            {scoreDisplay.positive ? (scoreDisplay.amount >= 5 ? "💝" : "💙") : "💔"}
          </Text>
        </Animated.View>
      )}

      {/* ── BEGINNER POPUP (choice preview) ── */}
      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={handlePopupCancel}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <View style={[styles.popupAvatar, { backgroundColor: (npc?.color ?? "#888") + "33" }]}>
              <Text style={styles.popupAvatarEmoji}>{npc?.emoji ?? "?"}</Text>
            </View>
            <Text style={styles.popupLabel}>
              {native === "korean" ? "선택한 문장" : native === "spanish" ? "Tu respuesta" : "Your response"}
            </Text>
            <Text style={styles.popupText}>{pendingChoice}</Text>

            <Pressable
              style={({ pressed }) => [styles.popupReplayBtn, pressed && { opacity: 0.75 }]}
              onPress={handlePopupReplay}
            >
              <Ionicons name={popupPlaying ? "volume-high" : "volume-medium-outline"} size={18} color={C.gold} />
              <Text style={styles.popupReplayLabel}>
                {native === "korean" ? "다시 듣기" : native === "spanish" ? "Reproducir" : "Replay"}
              </Text>
            </Pressable>

            <View style={styles.popupBtnRow}>
              <Pressable
                style={({ pressed }) => [styles.popupCancelBtn, pressed && { opacity: 0.8 }]}
                onPress={handlePopupCancel}
              >
                <Text style={styles.popupCancelLabel}>❌ {reselectLabel}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.popupSendBtn, pressed && { opacity: 0.8 }]}
                onPress={handlePopupSend}
              >
                <Text style={styles.popupSendLabel}>✅ {sendLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── WORD LOOKUP POPUP ── */}
      <Modal
        visible={!!wordPopup || wordLoading}
        transparent
        animationType="slide"
        onRequestClose={() => { setWordPopup(null); setWordLoading(false); setWordExPlaying(false); setWordPronPlaying(false); }}
      >
        <Pressable
          style={styles.wordOverlay}
          onPress={() => { setWordPopup(null); setWordLoading(false); setWordExPlaying(false); setWordPronPlaying(false); }}
        >
          <Pressable style={styles.wordCard} onPress={() => {}}>
            <View style={styles.wordDragHandle} />

            {wordLoading && !wordPopup ? (
              <View style={styles.wordLoadingRow}>
                <ActivityIndicator color={C.gold} size="small" />
                <Text style={styles.wordLoadingText}>
                  {native === "korean" ? "검색 중…" : native === "spanish" ? "Buscando…" : "Looking up…"}
                </Text>
              </View>
            ) : wordPopup ? (
              <>
                {/* ── Word + pronunciation ── */}
                <View style={styles.wordHeaderRow}>
                  <View style={styles.wordTitleGroup}>
                    <Text style={styles.wordTitle}>{wordPopup.word}</Text>
                    {!!wordPopup.partOfSpeech && (
                      <View style={styles.wordPosBadge}>
                        <Text style={styles.wordPosText}>{wordPopup.partOfSpeech}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.wordHeaderActions}>
                    <Pressable
                      style={({ pressed }) => [styles.wordPronBtn, pressed && { opacity: 0.7 }]}
                      onPress={() => playWordPronunciation(wordPopup.word)}
                      hitSlop={6}
                    >
                      <Ionicons
                        name={wordPronPlaying ? "volume-high" : "volume-medium-outline"}
                        size={20}
                        color={wordPronPlaying ? C.gold : C.goldDark}
                      />
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.wordCloseBtn, pressed && { opacity: 0.65 }]}
                      onPress={() => { setWordPopup(null); setWordExPlaying(false); setWordPronPlaying(false); }}
                      hitSlop={8}
                    >
                      <Ionicons name="close" size={18} color={C.goldDark} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.wordDivider} />

                {/* ── Meaning ── */}
                <View style={styles.wordMeaningRow}>
                  <Text style={styles.wordSectionLabel}>
                    {native === "korean" ? "의미" : native === "spanish" ? "Significado" : "Meaning"}
                  </Text>
                  <Text style={styles.wordMeaning}>{wordPopup.meaning}</Text>
                </View>

                {/* ── Example ── */}
                {!!wordPopup.example && (
                  <View style={styles.wordExampleRow}>
                    <Text style={styles.wordSectionLabel}>
                      {native === "korean" ? "예문" : native === "spanish" ? "Ejemplo" : "Example"}
                    </Text>
                    <Text style={styles.wordExample}>{wordPopup.example}</Text>
                    <Pressable
                      style={({ pressed }) => [styles.wordPlayBtn, pressed && { opacity: 0.75 }]}
                      onPress={() => playWordExample(wordPopup.example)}
                    >
                      <Ionicons
                        name={wordExPlaying ? "volume-high" : "volume-medium-outline"}
                        size={15}
                        color={wordExPlaying ? C.gold : C.goldDark}
                      />
                      <Text style={styles.wordPlayLabel}>
                        {native === "korean" ? "예문 듣기" : native === "spanish" ? "Escuchar" : "Listen"}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg1 },
  flex: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg1,
  },
  backBtn: { padding: 4 },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerAvatarEmoji: { fontSize: 22 },
  headerInfo: { flex: 1, gap: 2 },
  headerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerName: { fontSize: 16, fontFamily: F.header, color: C.parchment },
  emotionIcon: { fontSize: 15 },
  headerMuteBtn: { marginLeft: "auto" },
  headerScenario: { fontSize: 11, fontFamily: F.body, color: C.goldDim, fontStyle: "italic" },
  relRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  relTrack: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: "rgba(201,162,39,0.15)", overflow: "hidden",
  },
  relFill: { height: 4, borderRadius: 2 },
  relLabel: { fontSize: 10, fontFamily: F.bodySemi, flexShrink: 0 },

  listContent: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowUser: { justifyContent: "flex-end" },
  msgRowNpc:  { justifyContent: "flex-start" },

  npcAvatar: {
    width: 32, height: 32, borderRadius: 10, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end",
  },
  npcAvatarEmoji: { fontSize: 16 },

  bubbleCol: { maxWidth: "75%", gap: 4 },
  bubble: { borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9 },
  bubbleUser: { backgroundColor: C.gold, borderBottomRightRadius: 5 },
  bubbleNpc: {
    backgroundColor: C.parchment, borderBottomLeftRadius: 5,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { fontFamily: F.body, color: C.bg1 },
  bubbleTextNpc: { fontFamily: F.body, color: "#2c1810" },
  replayBtn: { marginTop: 4, alignSelf: "flex-end", padding: 2 },

  typingBubble: { paddingVertical: 14 },
  typingDots: { flexDirection: "row", gap: 5, alignItems: "center" },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.goldDark },

  hintBar: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: "rgba(201,162,39,0.05)",
  },
  hintText: { fontSize: 11, fontFamily: F.body, color: C.goldDark, fontStyle: "italic", textAlign: "center" },

  inputArea: {
    backgroundColor: C.bg1,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
  },

  choicesWrap: { gap: 7 },
  choiceBtnWrap: { gap: 0 },
  choiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.bg2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  choiceBtnText: { flex: 1, fontSize: 14, fontFamily: F.body, color: C.parchment, lineHeight: 19 },

  familiarChoicesRow: { flexDirection: "row", gap: 8 },
  familiarChoiceBtnWrap: { flex: 1, gap: 0 },
  familiarChoiceBtn: {
    width: "100%",
    backgroundColor: C.bg2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  familiarChoiceBtnText: { fontSize: 12, fontFamily: F.body, color: C.parchment, textAlign: "center", lineHeight: 17 },

  translToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  translToggleText: {
    fontSize: 11,
    fontFamily: F.body,
    color: C.gold,
    textDecorationLine: "underline",
    opacity: 0.85,
  },
  translText: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    fontSize: 12,
    fontFamily: F.body,
    color: C.parchment,
    opacity: 0.6,
    lineHeight: 17,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: C.bg2,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  micBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.bg1, marginBottom: 2,
  },
  micBtnActive: { backgroundColor: C.gold, borderColor: C.gold },
  input: {
    flex: 1, fontSize: 14, fontFamily: F.body, color: C.parchment,
    paddingVertical: 8, maxHeight: 90,
  },
  sendBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.gold, alignItems: "center", justifyContent: "center", marginBottom: 2,
  },
  sendBtnDisabled: { opacity: 0.45 },

  loadingChoices: { alignItems: "center", paddingVertical: 16 },

  scoreToast: {
    position: "absolute",
    top: 90,
    alignSelf: "center",
    backgroundColor: C.bg2,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: C.border,
    zIndex: 999,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  scoreToastText: { fontSize: 18, fontFamily: F.bodySemi, textAlign: "center" },

  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  popupCard: {
    backgroundColor: C.bg2,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  popupAvatar: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  popupAvatarEmoji: { fontSize: 26 },
  popupLabel: { fontSize: 12, fontFamily: F.label, color: C.goldDim, letterSpacing: 1, textTransform: "uppercase" },
  popupText: {
    fontSize: 17, fontFamily: F.body, color: C.parchment, textAlign: "center",
    lineHeight: 25, paddingHorizontal: 8,
  },
  popupReplayBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 16, borderWidth: 1.5, borderColor: C.gold,
    backgroundColor: "rgba(201,162,39,0.1)",
  },
  popupReplayLabel: { fontSize: 13, fontFamily: F.bodySemi, color: C.gold },
  popupBtnRow: { flexDirection: "row", gap: 10, width: "100%" },
  popupCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    backgroundColor: C.bg1, borderWidth: 1, borderColor: C.border,
    alignItems: "center",
  },
  popupCancelLabel: { fontSize: 13, fontFamily: F.bodySemi, color: C.goldDark },
  popupSendBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    backgroundColor: C.gold, alignItems: "center",
  },
  popupSendLabel: { fontSize: 13, fontFamily: F.bodySemi, color: C.bg1 },

  clickableWord: {
    color: "#2c1810",
    textDecorationLine: "underline",
    textDecorationColor: "rgba(44,24,16,0.4)",
    textDecorationStyle: "dotted",
  },

  wordOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  wordCard: {
    backgroundColor: C.bg2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 36,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: C.border,
    gap: 14,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 14,
  },
  wordDragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "rgba(201,162,39,0.35)",
    alignSelf: "center",
    marginBottom: 6,
  },
  wordHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  wordTitleGroup: { flex: 1, gap: 6 },
  wordTitle: {
    fontSize: 26, fontFamily: F.header, color: C.gold, letterSpacing: 0.5,
  },
  wordPosBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(201,162,39,0.12)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  wordPosText: {
    fontSize: 11, fontFamily: F.label, color: C.goldDim, letterSpacing: 0.8,
  },
  wordHeaderActions: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2,
  },
  wordPronBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(201,162,39,0.1)",
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  wordCloseBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.bg1, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.border,
  },
  wordDivider: {
    height: 1, backgroundColor: C.border,
  },
  wordSectionLabel: {
    fontSize: 10, fontFamily: F.label, color: C.goldDim,
    letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
  },
  wordMeaningRow: { gap: 4 },
  wordMeaning: {
    fontSize: 17, fontFamily: F.bodySemi, color: C.parchment, lineHeight: 24,
  },
  wordExampleRow: { gap: 4 },
  wordExample: {
    fontSize: 15, fontFamily: F.body, color: "rgba(244,232,193,0.75)",
    lineHeight: 22,
  },
  wordPlayBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
    backgroundColor: "rgba(201,162,39,0.08)",
    marginTop: 4,
  },
  wordPlayLabel: { fontSize: 12, fontFamily: F.bodySemi, color: C.goldDark },
  wordLoadingRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 20, justifyContent: "center",
  },
  wordLoadingText: { fontSize: 14, fontFamily: F.body, color: C.goldDim },
});
