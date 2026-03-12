import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLanguage, getDefaultLearning, NativeLanguage } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { XPToast } from "@/components/XPToast";
import { C, F } from "@/constants/theme";

const TAB_BAR_HEIGHT = 49;
const SESSION_SIZE = 8;
const WEAK_THRESHOLD = 75;

type LangTab = "korean" | "english" | "spanish";

interface Phrase {
  word: string;
  ipa: string;
  meaning: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  speechLang: string;
  tip: string;
}

const PHRASE_SETS: Record<LangTab, Phrase[]> = {
  english: [
    { word: "Hello", ipa: "/həˈloʊ/", meaning: "안녕하세요", level: "A1", speechLang: "en-US", tip: "Stress the second syllable: heh-LO." },
    { word: "Thank you", ipa: "/ˈθæŋk juː/", meaning: "감사합니다", level: "A1", speechLang: "en-US", tip: "The 'th' needs tongue between teeth." },
    { word: "Sorry", ipa: "/ˈsɒr.i/", meaning: "죄송합니다", level: "A1", speechLang: "en-US", tip: "First syllable is stressed: SOR-ee." },
    { word: "Yes", ipa: "/jɛs/", meaning: "네", level: "A1", speechLang: "en-US", tip: "Short and clear. Ends with a light 's' sound." },
    { word: "No", ipa: "/noʊ/", meaning: "아니요", level: "A1", speechLang: "en-US", tip: "The vowel glides from 'oh' to 'w'." },
    { word: "Please", ipa: "/pliːz/", meaning: "부탁드려요", level: "A1", speechLang: "en-US", tip: "Long 'ee' sound in the middle." },
    { word: "Water", ipa: "/ˈwɔː.tər/", meaning: "물", level: "A1", speechLang: "en-US", tip: "In American English: WAW-ter (flapped 't')." },
    { word: "Coffee", ipa: "/ˈkɒf.i/", meaning: "커피", level: "A1", speechLang: "en-US", tip: "Two syllables: KOF-ee." },
    { word: "Friend", ipa: "/frɛnd/", meaning: "친구", level: "A1", speechLang: "en-US", tip: "The 'd' at the end can be soft or silent." },
    { word: "Happy", ipa: "/ˈhæp.i/", meaning: "행복한", level: "A1", speechLang: "en-US", tip: "Stress on first syllable: HAP-ee." },
    { word: "Good", ipa: "/ɡʊd/", meaning: "좋은", level: "A1", speechLang: "en-US", tip: "Short 'oo' sound, not like 'food'." },
    { word: "Bad", ipa: "/bæd/", meaning: "나쁜", level: "A1", speechLang: "en-US", tip: "The 'a' is an open front vowel like 'cat'." },
    { word: "Home", ipa: "/hoʊm/", meaning: "집", level: "A1", speechLang: "en-US", tip: "The vowel glides from 'oh' to 'w'." },
    { word: "Food", ipa: "/fuːd/", meaning: "음식", level: "A1", speechLang: "en-US", tip: "Long 'oo' sound — like 'mood'." },
    { word: "Help", ipa: "/hɛlp/", meaning: "도움", level: "A1", speechLang: "en-US", tip: "Say all four sounds: H-EL-P." },
    { word: "Good morning", ipa: "/ɡʊd ˈmɔːr.nɪŋ/", meaning: "좋은 아침이에요", level: "A1", speechLang: "en-US", tip: "Link the words together smoothly." },
    { word: "How are you?", ipa: "/haʊ ɑːr juː/", meaning: "어떻게 지내세요?", level: "A1", speechLang: "en-US", tip: "Often spoken quickly: 'How-ar-yuh?'" },
    { word: "Beautiful", ipa: "/ˈbjuː.tɪ.fəl/", meaning: "아름다운", level: "A2", speechLang: "en-US", tip: "Three syllables: BYOO-tih-ful." },
    { word: "Comfortable", ipa: "/ˈkʌm.fər.tə.bəl/", meaning: "편안한", level: "A2", speechLang: "en-US", tip: "Often said as 3 syllables: KUMF-ter-bul." },
    { word: "Thoroughly", ipa: "/ˈθʌr.ə.li/", meaning: "완전히", level: "B1", speechLang: "en-US", tip: "The 'th' needs tongue between teeth, not a 'd' or 't'." },
    { word: "Squirrel", ipa: "/ˈskwɪr.əl/", meaning: "다람쥐", level: "A2", speechLang: "en-US", tip: "The 'r' colors the vowel before it." },
    { word: "Rural", ipa: "/ˈrʊr.əl/", meaning: "시골의", level: "B1", speechLang: "en-US", tip: "Two 'r' sounds in a row. Relax the tongue for both." },
    { word: "Entrepreneur", ipa: "/ˌɒn.trə.prəˈnɜːr/", meaning: "기업가", level: "C1", speechLang: "en-US", tip: "French origin. The stress is on the final syllable." },
  ],
  spanish: [
    { word: "Hola", ipa: "/ˈo.la/", meaning: "안녕하세요", level: "A1", speechLang: "es-ES", tip: "The 'h' is silent in Spanish." },
    { word: "Gracias", ipa: "/ˈɡɾa.sjas/", meaning: "감사합니다", level: "A1", speechLang: "es-ES", tip: "The 'r' is a single tap (ɾ), not a rolled 'rr'." },
    { word: "Perdón", ipa: "/peɾˈðon/", meaning: "죄송합니다", level: "A1", speechLang: "es-ES", tip: "The 'd' between vowels becomes a soft 'ð' sound." },
    { word: "Sí", ipa: "/si/", meaning: "네", level: "A1", speechLang: "es-ES", tip: "Short and crisp. Accent mark just shows it's 'yes', not 'if'." },
    { word: "No", ipa: "/no/", meaning: "아니요", level: "A1", speechLang: "es-ES", tip: "Pure 'o' vowel — no glide like in English." },
    { word: "Por favor", ipa: "/poɾ faˈβoɾ/", meaning: "부탁드려요", level: "A1", speechLang: "es-ES", tip: "The 'v' sounds like a soft 'b' (β)." },
    { word: "Agua", ipa: "/ˈa.ɣwa/", meaning: "물", level: "A1", speechLang: "es-ES", tip: "The 'g' between vowels softens to 'ɣ'." },
    { word: "Café", ipa: "/kaˈfe/", meaning: "커피", level: "A1", speechLang: "es-ES", tip: "Stress on the second syllable: ka-FEH." },
    { word: "Amigo", ipa: "/aˈmi.ɣo/", meaning: "친구", level: "A1", speechLang: "es-ES", tip: "Intervocalic 'g' softens to 'ɣ'." },
    { word: "Feliz", ipa: "/feˈliθ/", meaning: "행복한", level: "A1", speechLang: "es-ES", tip: "In Spain Spanish, 'z' = 'θ' (like English 'th')." },
    { word: "Bueno", ipa: "/ˈbwe.no/", meaning: "좋은", level: "A1", speechLang: "es-ES", tip: "The 'ue' glides together: BWEH-no." },
    { word: "Malo", ipa: "/ˈma.lo/", meaning: "나쁜", level: "A1", speechLang: "es-ES", tip: "Two clean syllables: MA-lo." },
    { word: "Casa", ipa: "/ˈka.sa/", meaning: "집", level: "A1", speechLang: "es-ES", tip: "All vowels are pure and short in Spanish." },
    { word: "Comida", ipa: "/koˈmi.ða/", meaning: "음식", level: "A1", speechLang: "es-ES", tip: "The 'd' between vowels softens to 'ð'." },
    { word: "Ayuda", ipa: "/aˈju.ða/", meaning: "도움", level: "A1", speechLang: "es-ES", tip: "Three syllables: a-YU-da." },
    { word: "Buenos días", ipa: "/ˈbwe.nos ˈdi.as/", meaning: "좋은 아침이에요", level: "A1", speechLang: "es-ES", tip: "Link the words smoothly as one phrase." },
    { word: "¿Cómo estás?", ipa: "/ˈko.mo esˈtas/", meaning: "어떻게 지내세요?", level: "A1", speechLang: "es-ES", tip: "Stress on 'tás' — the accent tells you!" },
    { word: "Murciélago", ipa: "/muɾˈθje.la.ɣo/", meaning: "박쥐", level: "B1", speechLang: "es-ES", tip: "Contains all 5 vowels! The θ is a 'th' sound in Spain Spanish." },
    { word: "Desarrollar", ipa: "/de.za.ro.ˈʎaɾ/", meaning: "개발하다", level: "B1", speechLang: "es-ES", tip: "The 'll' sounds like 'y' in many dialects." },
    { word: "Ferrocarril", ipa: "/fe.ro.kaˈril/", meaning: "철도", level: "B2", speechLang: "es-ES", tip: "Two rolling 'rr' sounds. Practice the trill separately first." },
    { word: "Extraordinario", ipa: "/eks.tɾa.oɾ.ðiˈna.ɾjo/", meaning: "특별한", level: "B2", speechLang: "es-ES", tip: "7 syllables! Break it down slowly before building to full speed." },
  ],
  korean: [
    { word: "안녕하세요", ipa: "/an.njʌŋ.ha.se.jo/", meaning: "Hello (formal)", level: "A1", speechLang: "ko-KR", tip: "Rise slightly in pitch on the last syllable." },
    { word: "감사합니다", ipa: "/kam.sa.ham.ni.da/", meaning: "Thank you (formal)", level: "A1", speechLang: "ko-KR", tip: "Keep each syllable even. No stress accent like English." },
    { word: "죄송합니다", ipa: "/tɕø.soŋ.ham.ni.da/", meaning: "I'm sorry (formal)", level: "A1", speechLang: "ko-KR", tip: "The 죄 vowel is like a rounded 'e'. Lips forward." },
    { word: "네", ipa: "/ne/", meaning: "Yes", level: "A1", speechLang: "ko-KR", tip: "Short and clear. Sounds like 'neh'." },
    { word: "아니요", ipa: "/a.ni.jo/", meaning: "No", level: "A1", speechLang: "ko-KR", tip: "Three syllables: a-ni-yo. Falling tone at the end." },
    { word: "물", ipa: "/mul/", meaning: "Water", level: "A1", speechLang: "ko-KR", tip: "The ㅡ vowel (ɯ) is pronounced in the back of the mouth." },
    { word: "커피", ipa: "/kʰʌ.pʰi/", meaning: "Coffee", level: "A1", speechLang: "ko-KR", tip: "Both consonants are aspirated: kh and ph." },
    { word: "친구", ipa: "/tɕʰin.gu/", meaning: "Friend", level: "A1", speechLang: "ko-KR", tip: "The ㅈ (tɕ) is palatalized — like 'ch'." },
    { word: "행복해요", ipa: "/hɛŋ.bo.kʰɛ.jo/", meaning: "I'm happy", level: "A1", speechLang: "ko-KR", tip: "The ㄱ before ㅎ becomes aspirated: -kh-." },
    { word: "좋아요", ipa: "/tɕo.a.jo/", meaning: "Good / I like it", level: "A1", speechLang: "ko-KR", tip: "The 좋 + 아 merge: 조아요. The ㅎ is silent between vowels." },
    { word: "집", ipa: "/tɕip/", meaning: "Home / House", level: "A1", speechLang: "ko-KR", tip: "The final consonant ㅂ is unreleased at the end." },
    { word: "음식", ipa: "/ɯm.sik/", meaning: "Food", level: "A1", speechLang: "ko-KR", tip: "The ㅡ vowel is key: lips unrounded, back of mouth." },
    { word: "도와주세요", ipa: "/to.wa.dʑu.se.jo/", meaning: "Please help me", level: "A2", speechLang: "ko-KR", tip: "The 와 smoothly follows 도 — link them together." },
    { word: "사랑해요", ipa: "/sa.ɾaŋ.hɛ.jo/", meaning: "I love you", level: "A2", speechLang: "ko-KR", tip: "The ɾ is a flap — similar to the 'd' in 'ladder'." },
    { word: "맛있어요", ipa: "/ma.si.sʌ.jo/", meaning: "It's delicious", level: "A2", speechLang: "ko-KR", tip: "The ㅅ before a vowel becomes an 's' sound." },
    { word: "어디에 있어요?", ipa: "/ʌ.di.e i.sʌ.jo/", meaning: "Where is it?", level: "A2", speechLang: "ko-KR", tip: "The ʌ vowel is in the back of the mouth, not the front." },
    { word: "반갑습니다", ipa: "/pan.gap.sɯm.ni.da/", meaning: "Nice to meet you", level: "A1", speechLang: "ko-KR", tip: "The 반 is lower in pitch, 갑 rises slightly." },
    { word: "얼마예요?", ipa: "/ʌl.ma.je.jo/", meaning: "How much is it?", level: "A2", speechLang: "ko-KR", tip: "Raise pitch at the end to signal a question." },
    { word: "잘 부탁드립니다", ipa: "/tɕal pu.tʰak.tɯ.rim.ni.da/", meaning: "Please look after me", level: "B1", speechLang: "ko-KR", tip: "Common phrase when meeting someone new. Say it warmly." },
  ],
};

const LANG_TABS: { key: LangTab; label: string; flag: string; color: string }[] = [
  { key: "korean", label: "Korean", flag: "🇰🇷", color: C.gold },
  { key: "english", label: "English", flag: "🇬🇧", color: "#6B9DFF" },
  { key: "spanish", label: "Spanish", flag: "🇪🇸", color: "#FF9D6B" },
];

function getScoreInfo(score: number): { label: string; color: string; emoji: string } {
  if (score >= 90) return { label: "Excellent!", color: "#10B981", emoji: "🎉" };
  if (score >= 75) return { label: "Good Job!", color: "#F59E0B", emoji: "😊" };
  return { label: "Keep Practicing", color: "#EF4444", emoji: "💪" };
}

let _pronunciationAudio: HTMLAudioElement | null = null;

async function playPronunciationTTS(text: string, lang: string, apiBase: string) {
  try {
    if (Platform.OS === "web" && _pronunciationAudio) {
      _pronunciationAudio.pause();
      _pronunciationAudio.src = "";
      _pronunciationAudio = null;
    }
    const url = new URL("/api/pronunciation-tts", apiBase);
    url.searchParams.set("text", text);
    url.searchParams.set("lang", lang);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TTS ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    if (Platform.OS === "web") {
      const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
      _pronunciationAudio = audio;
      audio.onended = () => { URL.revokeObjectURL(objectUrl); _pronunciationAudio = null; };
      audio.onerror = () => { URL.revokeObjectURL(objectUrl); _pronunciationAudio = null; };
      await audio.play();
    } else {
      const { sound } = await Audio.Sound.createAsync({ uri: objectUrl }, { shouldPlay: true });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          URL.revokeObjectURL(objectUrl);
        }
      });
    }
  } catch (err) {
    console.warn("Pronunciation TTS error:", err);
  }
}

function buildSession(lang: LangTab, weakWords: string[], lastSeenWords: string[]): Phrase[] {
  const all = PHRASE_SETS[lang];
  const weakSet = new Set(weakWords);
  const lastSet = new Set(lastSeenWords);
  const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
  const lastFirst = (arr: Phrase[]) => {
    const notSeen = arr.filter((p) => !lastSet.has(p.word));
    const seen = arr.filter((p) => lastSet.has(p.word));
    return [...shuffle(notSeen), ...shuffle(seen)];
  };
  const a1 = all.filter((p) => p.level === "A1" && !weakSet.has(p.word));
  const a2 = all.filter((p) => p.level === "A2" && !weakSet.has(p.word));
  const harder = all.filter((p) => !["A1", "A2"].includes(p.level) && !weakSet.has(p.word));
  const weak = all.filter((p) => weakSet.has(p.word));
  const pool = [...shuffle(weak).slice(0, 3), ...lastFirst(a1), ...lastFirst(a2), ...lastFirst(harder)];
  const seenSet = new Set<string>();
  const unique: Phrase[] = [];
  for (const p of pool) {
    if (!seenSet.has(p.word)) { seenSet.add(p.word); unique.push(p); }
    if (unique.length >= SESSION_SIZE) break;
  }
  return unique;
}

type RecordState = "idle" | "listening" | "processing" | "done";

export default function SpeakScreen() {
  const insets = useSafeAreaInsets();
  const { t, nativeLanguage, learningLanguage, stats, updateStats } = useLanguage();
  const [xpGain, setXpGain] = useState(0);
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const nativeLang = (nativeLanguage ?? "english") as NativeLanguage;
  const visibleTabs = learningLanguage && learningLanguage !== nativeLang
    ? LANG_TABS.filter((tab) => tab.key === learningLanguage)
    : LANG_TABS.filter((tab) => tab.key !== nativeLang);

  const [activeLang, setActiveLang] = useState<LangTab>(() => {
    const ll = learningLanguage as LangTab | null;
    if (ll && ll !== nativeLang) return ll;
    return (visibleTabs[0]?.key ?? "english") as LangTab;
  });

  const [sessionWords, setSessionWords] = useState<Phrase[]>([]);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [weakWords, setWeakWords] = useState<string[]>([]);

  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [gptFeedback, setGptFeedback] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [sttError, setSttError] = useState("");
  const [hasListened, setHasListened] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const recordStateRef = useRef<RecordState>("idle");

  const weakKey = `speak_weak_words_${activeLang}`;
  const lastSeenKey = `speak_last_seen_${activeLang}`;

  const resetPracticeState = useCallback(() => {
    setRecordState("idle");
    recordStateRef.current = "idle";
    setScore(null);
    setGptFeedback("");
    setRecognizedText("");
    setSttError("");
    setHasListened(false);
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    scoreAnim.setValue(0);
  }, [pulseAnim, scoreAnim]);

  const loadSession = useCallback(async (lang: LangTab) => {
    try {
      const [weakRaw, lastRaw] = await Promise.all([
        AsyncStorage.getItem(`speak_weak_words_${lang}`),
        AsyncStorage.getItem(`speak_last_seen_${lang}`),
      ]);
      const weak: string[] = weakRaw ? JSON.parse(weakRaw) : [];
      const last: string[] = lastRaw ? JSON.parse(lastRaw) : [];
      setWeakWords(weak);
      const session = buildSession(lang, weak, last);
      setSessionWords(session);
      setSessionIdx(0);
      setSessionComplete(false);
      resetPracticeState();
    } catch {}
  }, [resetPracticeState]);

  useFocusEffect(useCallback(() => {
    loadSession(activeLang);
  }, [activeLang]));

  useEffect(() => {
    if (learningLanguage && learningLanguage !== nativeLang) {
      setActiveLang(learningLanguage as LangTab);
    }
  }, [learningLanguage]);

  const phrase = sessionWords[sessionIdx];
  const tabInfo = LANG_TABS.find((tab) => tab.key === activeLang)!;

  const switchLang = (lang: LangTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveLang(lang);
    loadSession(lang);
  };

  const saveWeakWord = async (word: string) => {
    try {
      const raw = await AsyncStorage.getItem(weakKey);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(word)) {
        list.push(word);
        await AsyncStorage.setItem(weakKey, JSON.stringify(list));
        setWeakWords(list);
      }
    } catch {}
  };

  const removeWeakWord = async (word: string) => {
    try {
      const raw = await AsyncStorage.getItem(weakKey);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const updated = list.filter((w) => w !== word);
      await AsyncStorage.setItem(weakKey, JSON.stringify(updated));
      setWeakWords(updated);
    } catch {}
  };

  const handleListen = () => {
    if (!phrase) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasListened(true);
    playPronunciationTTS(phrase.word, phrase.speechLang, getApiUrl());
  };

  const startPulse = () => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.14, duration: 550, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const handleRecord = () => {
    if (!phrase || recordState === "listening" || recordState === "processing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (Platform.OS !== "web") {
      setSttError("발음 평가는 현재 웹 브라우저에서만 지원됩니다.");
      setRecordState("done");
      recordStateRef.current = "done";
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSttError("이 브라우저는 음성 인식을 지원하지 않습니다.\nChrome을 사용해 주세요.");
      setRecordState("done");
      recordStateRef.current = "done";
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = phrase.speechLang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setRecordState("listening");
    recordStateRef.current = "listening";
    setScore(null);
    setGptFeedback("");
    setRecognizedText("");
    setSttError("");
    startPulse();

    let resultReceived = false;

    recognition.onresult = async (event: any) => {
      resultReceived = true;
      stopPulse();
      setRecordState("processing");
      recordStateRef.current = "processing";
      const transcript: string = event.results[0][0].transcript;
      setRecognizedText(transcript);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      try {
        const apiUrl = new URL("/api/gpt-score", getApiUrl()).toString();
        const apiRes = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: phrase.word, recognized: transcript }),
        });
        if (!apiRes.ok) throw new Error(`HTTP ${apiRes.status}`);
        const data = await apiRes.json();
        const scoreVal = data.score ?? 0;
        setScore(scoreVal);
        setGptFeedback(data.feedback ?? "");
        Animated.timing(scoreAnim, { toValue: scoreVal / 100, duration: 900, useNativeDriver: false }).start();
        if (scoreVal < WEAK_THRESHOLD) { await saveWeakWord(phrase.word); }
        else { await removeWeakWord(phrase.word); }
        const xpEarned = scoreVal >= 90 ? 30 : 15;
        setXpGain(xpEarned);
        updateStats({ xp: statsRef.current.xp + xpEarned });
      } catch {
        setSttError("채점 중 오류가 발생했습니다. 다시 시도해 주세요.");
      } finally {
        setRecordState("done");
        recordStateRef.current = "done";
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    };

    recognition.onerror = (event: any) => {
      resultReceived = true;
      stopPulse();
      const errMap: Record<string, string> = {
        "not-allowed": "마이크 권한을 허용해주세요.\n(브라우저 설정 → 마이크 허용)",
        "no-speech": "음성이 감지되지 않았습니다. 다시 시도해 주세요.",
        "network": "네트워크 오류가 발생했습니다.",
        "aborted": "녹음이 취소되었습니다.",
        "audio-capture": "마이크를 찾을 수 없습니다.",
        "service-not-allowed": "마이크 권한을 허용해주세요.",
      };
      setSttError(errMap[event.error] ?? `오류: ${event.error}`);
      setRecordState("done");
      recordStateRef.current = "done";
    };

    recognition.onend = () => {
      stopPulse();
      if (!resultReceived && recordStateRef.current === "listening") {
        setSttError("음성이 감지되지 않았습니다. 다시 시도해 주세요.");
        setRecordState("done");
        recordStateRef.current = "done";
      }
    };

    recognition.start();
  };

  const goNextWord = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextIdx = sessionIdx + 1;
    if (nextIdx >= sessionWords.length) {
      const words = sessionWords.map((p) => p.word);
      await AsyncStorage.setItem(lastSeenKey, JSON.stringify(words)).catch(() => {});
      setSessionComplete(true);
    } else {
      setSessionIdx(nextIdx);
      resetPracticeState();
    }
  };

  const goPrevWord = () => {
    if (sessionIdx === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSessionIdx((i) => i - 1);
    resetPracticeState();
  };

  const isRecording = recordState === "listening";
  const isProcessing = recordState === "processing";
  const isBusy = isRecording || isProcessing;
  const scoreInfo = score !== null ? getScoreInfo(score) : null;
  const progressPct = sessionWords.length > 0 ? (sessionIdx / sessionWords.length) * 100 : 0;

  // ── Session Complete ────────────────────────────────────────────────────────
  if (sessionComplete) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <XPToast amount={xpGain} onDone={() => setXpGain(0)} />
        <View style={[styles.completeWrap, { paddingBottom: TAB_BAR_HEIGHT + bottomPad }]}>
          <Text style={styles.completeTrophy}>🏆</Text>
          <Text style={styles.completeTitle}>Pronunciation Practice{"\n"}Complete!</Text>
          <Text style={styles.completeSub}>You practiced {sessionWords.length} words this session.</Text>
          {weakWords.length > 0 && (
            <View style={styles.weakBox}>
              <View style={styles.weakBoxHeader}>
                <Ionicons name="warning-outline" size={14} color="#EF4444" />
                <Text style={styles.weakBoxTitle}>Weak Words for Review</Text>
              </View>
              {weakWords.slice(0, 5).map((w) => (
                <Text key={w} style={styles.weakWord}>• {w}</Text>
              ))}
            </View>
          )}
          <Pressable
            style={({ pressed }) => [styles.newSessionBtn, pressed && { opacity: 0.85 }]}
            onPress={() => loadSession(activeLang)}
          >
            <LinearGradient colors={[C.gold, C.goldDark]} style={StyleSheet.absoluteFill} />
            <Ionicons name="refresh" size={18} color={C.bg1} />
            <Text style={styles.newSessionBtnText}>New Session</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!phrase) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={C.gold} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Main Screen (fixed layout, no scroll) ──────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <XPToast amount={xpGain} onDone={() => setXpGain(0)} />

      <View style={[styles.screen, { paddingBottom: TAB_BAR_HEIGHT + bottomPad }]}>

        {/* ── SECTION 1: HEADER (15%) ─────────────────────────────────────── */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{t("speak_title")}</Text>
              <Text style={styles.subtitle}>Tap the mic and say the word</Text>
            </View>

            {visibleTabs.length > 1 && (
              <View style={styles.langTabsCompact}>
                {visibleTabs.map((tab) => {
                  const active = activeLang === tab.key;
                  return (
                    <Pressable
                      key={tab.key}
                      style={({ pressed }) => [
                        styles.langTabCompact,
                        active && { backgroundColor: tab.color },
                        pressed && { opacity: 0.8 },
                      ]}
                      onPress={() => switchLang(tab.key)}
                    >
                      <Text style={styles.langTabFlag}>{tab.flag}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Progress bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: tabInfo.color }]} />
            </View>
            <Text style={[styles.progressLabel, { color: tabInfo.color }]}>
              {sessionIdx + 1} / {sessionWords.length}
            </Text>
          </View>
        </View>

        {/* ── SECTION 2: WORD CARD (38%) ──────────────────────────────────── */}
        <View style={styles.cardSection}>
          <View style={styles.card}>
            <LinearGradient
              colors={[tabInfo.color + "28", "transparent"]}
              style={styles.cardTopAccent}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />
            <View style={styles.cardTopRow}>
              <View style={[styles.levelBadge, { backgroundColor: tabInfo.color + "20", borderColor: tabInfo.color + "50" }]}>
                <Text style={[styles.levelText, { color: tabInfo.color }]}>{phrase.level}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.listenBtn, pressed && { opacity: 0.75 }]}
                onPress={handleListen}
                testID="listen-button"
              >
                <LinearGradient colors={[tabInfo.color, tabInfo.color + "CC"]} style={StyleSheet.absoluteFill} />
                <Ionicons name="volume-high" size={14} color="#fff" />
                <Text style={styles.listenBtnText}>{t("listen")}</Text>
              </Pressable>
            </View>

            <Text style={styles.wordText}>{phrase.word}</Text>

            <View style={styles.ipaRow}>
              <Text style={styles.ipaTag}>IPA</Text>
              <Text style={styles.ipaText}>{phrase.ipa}</Text>
            </View>

            <View style={styles.cardDivider} />
            <Text style={styles.meaningText}>{phrase.meaning}</Text>
          </View>
        </View>

        {/* ── SECTION 3: TIP (12%) ────────────────────────────────────────── */}
        <View style={styles.tipSection}>
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={14} color="#F59E0B" />
            <Text style={styles.tipText} numberOfLines={2}>{phrase.tip}</Text>
          </View>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {sessionWords.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < sessionIdx && styles.dotDone,
                  i === sessionIdx && [styles.dotActive, { backgroundColor: tabInfo.color }],
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── SECTION 4: RECORDING / RESULT (25%) ────────────────────────── */}
        <View style={styles.recordSection}>
          {recordState === "done" ? (
            /* Result view */
            <ScrollView
              contentContainerStyle={styles.resultScroll}
              showsVerticalScrollIndicator={false}
            >
              {score !== null && scoreInfo ? (
                <View style={styles.resultRow}>
                  {/* Score circle */}
                  <View style={[styles.scoreCircle, { borderColor: scoreInfo.color }]}>
                    <Text style={[styles.scoreNumber, { color: scoreInfo.color }]}>{score}</Text>
                    <Text style={styles.scoreDenom}>/100</Text>
                  </View>

                  <View style={styles.resultRight}>
                    <Text style={[styles.scoreLabel, { color: scoreInfo.color }]}>
                      {scoreInfo.emoji} {scoreInfo.label}
                    </Text>

                    {/* Score bar */}
                    <View style={styles.scoreBarTrack}>
                      <Animated.View
                        style={[styles.scoreBarFill, {
                          width: scoreAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                          backgroundColor: scoreInfo.color,
                        }]}
                      />
                    </View>

                    {recognizedText ? (
                      <Text style={styles.heardText}>"{recognizedText}"</Text>
                    ) : null}

                    {gptFeedback ? (
                      <Text style={styles.feedbackText} numberOfLines={3}>{gptFeedback}</Text>
                    ) : null}
                  </View>
                </View>
              ) : (
                <View style={styles.errorRow}>
                  <Ionicons name="warning-outline" size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{sttError || "음성 인식 실패. 다시 시도해 주세요."}</Text>
                </View>
              )}

              {/* Retry inline */}
              <Pressable
                style={({ pressed }) => [styles.retryChip, pressed && { opacity: 0.75 }]}
                onPress={resetPracticeState}
                testID="retry-button"
              >
                <Ionicons name="refresh" size={13} color={tabInfo.color} />
                <Text style={[styles.retryChipText, { color: tabInfo.color }]}>다시 시도</Text>
              </Pressable>
            </ScrollView>
          ) : (
            /* Mic view */
            <View style={styles.micWrap}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable
                  style={({ pressed }) => [styles.micBtn, pressed && { opacity: 0.88 }]}
                  onPress={handleRecord}
                  disabled={isBusy}
                  testID="mic-button"
                >
                  <LinearGradient
                    colors={isRecording ? ["#FF4081", "#E91E63"] : [tabInfo.color, tabInfo.color + "CC"]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
                  />
                  {isProcessing
                    ? <ActivityIndicator size="large" color="#fff" />
                    : <Ionicons name={isRecording ? "radio-button-on" : "mic"} size={40} color="#fff" />
                  }
                </Pressable>
              </Animated.View>

              <Text style={styles.micHint}>
                {isRecording ? "듣고 있어요…" : isProcessing ? "분석 중…" : hasListened ? "탭하여 발음하기" : "먼저 듣기를 눌러보세요"}
              </Text>
            </View>
          )}
        </View>

        {/* ── SECTION 5: NAVIGATION (10%) ─────────────────────────────────── */}
        <View style={styles.navSection}>
          <Pressable
            style={({ pressed }) => [styles.navBtn, styles.prevBtn, sessionIdx === 0 && styles.navBtnDisabled, pressed && { opacity: 0.75 }]}
            onPress={goPrevWord}
            disabled={sessionIdx === 0}
            testID="prev-button"
          >
            <Ionicons name="arrow-back" size={16} color={sessionIdx === 0 ? C.goldDark : C.gold} />
            <Text style={[styles.navBtnText, { color: sessionIdx === 0 ? C.goldDark : C.gold }]}>Prev</Text>
          </Pressable>

          <View style={styles.navProgress}>
            <Text style={styles.navProgressText}>{sessionIdx + 1} / {sessionWords.length}</Text>
          </View>

          {recordState === "done" ? (
            <Pressable
              style={({ pressed }) => [styles.navBtn, styles.nextBtnActive, { backgroundColor: tabInfo.color }, pressed && { opacity: 0.85 }]}
              onPress={goNextWord}
              testID="next-word-button"
            >
              <Text style={styles.nextBtnText}>
                {sessionIdx + 1 >= sessionWords.length ? "완료" : "다음"}
              </Text>
              <Ionicons name={sessionIdx + 1 >= sessionWords.length ? "checkmark" : "arrow-forward"} size={16} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.navBtn, styles.nextBtnInactive, pressed && { opacity: 0.75 }]}
              onPress={goNextWord}
              testID="next-button"
            >
              <Text style={[styles.navBtnText, { color: C.goldDim }]}>다음</Text>
              <Ionicons name="arrow-forward" size={16} color={C.goldDim} />
            </Pressable>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg1,
  },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },

  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 8 : 0,
  },

  // ── Header (flex 2) ──────────────────────────────────────────────────────
  headerSection: {
    flex: 2,
    justifyContent: "center",
    gap: 8,
    paddingTop: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerText: { flex: 1, gap: 1 },
  title: { fontSize: 20, fontFamily: F.header, color: C.gold, letterSpacing: 1 },
  subtitle: { fontSize: 12, fontFamily: F.body, color: C.goldDim, fontStyle: "italic" },
  langTabsCompact: { flexDirection: "row", gap: 6, marginLeft: 8 },
  langTabCompact: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
  },
  langTabFlag: { fontSize: 18 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressTrack: {
    flex: 1, height: 5, backgroundColor: "rgba(201,162,39,0.12)",
    borderRadius: 3, overflow: "hidden", borderWidth: 0.5, borderColor: C.border,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressLabel: { fontSize: 11, fontFamily: F.bodySemi, minWidth: 30, textAlign: "right" },

  // ── Word Card (flex 5) ───────────────────────────────────────────────────
  cardSection: {
    flex: 5,
    justifyContent: "center",
  },
  card: {
    backgroundColor: C.parchment,
    borderRadius: 24,
    overflow: "hidden",
    padding: 18,
    gap: 8,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.2)",
  },
  cardTopAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 16, borderWidth: 1,
  },
  levelText: { fontSize: 11, fontFamily: F.label, letterSpacing: 1 },
  listenBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, overflow: "hidden",
  },
  listenBtnText: { fontSize: 12, fontFamily: F.bodySemi, color: "#fff" },
  wordText: {
    fontSize: 38,
    fontFamily: F.title,
    color: C.textParchment,
    textAlign: "center",
    lineHeight: 46,
    letterSpacing: 1,
  },
  ipaRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  ipaTag: {
    fontSize: 10, fontFamily: F.label, color: C.goldDark,
    letterSpacing: 1, backgroundColor: "rgba(201,162,39,0.12)",
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  ipaText: { fontSize: 16, fontFamily: F.body, color: C.goldDark, fontStyle: "italic" },
  cardDivider: { height: 1, backgroundColor: "rgba(44,24,16,0.1)", marginVertical: 2 },
  meaningText: { fontSize: 16, fontFamily: F.bodySemi, color: C.textParchment, textAlign: "center" },

  // ── Tip + dots (flex 1.5) ────────────────────────────────────────────────
  tipSection: {
    flex: 1.5,
    justifyContent: "center",
    gap: 8,
  },
  tipBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    backgroundColor: "rgba(201,162,39,0.07)",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: "rgba(201,162,39,0.18)",
  },
  tipText: {
    flex: 1, fontSize: 12, fontFamily: F.body,
    color: C.textParchment, lineHeight: 17, fontStyle: "italic",
  },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.goldDark, opacity: 0.3 },
  dotDone: { opacity: 0.8 },
  dotActive: { width: 16, borderRadius: 4, opacity: 1 },

  // ── Recording / Result (flex 3) ──────────────────────────────────────────
  recordSection: {
    flex: 3,
    justifyContent: "center",
  },
  micWrap: { alignItems: "center", gap: 10 },
  micBtn: {
    width: 84, height: 84, borderRadius: 42,
    overflow: "hidden", justifyContent: "center", alignItems: "center",
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 7,
  },
  micHint: {
    fontSize: 13, fontFamily: F.body, color: C.goldDim,
    textAlign: "center", fontStyle: "italic",
  },

  resultScroll: { gap: 10, paddingBottom: 4 },
  resultRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  scoreCircle: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 4, justifyContent: "center", alignItems: "center",
    backgroundColor: C.bg2, flexShrink: 0,
  },
  scoreNumber: { fontSize: 26, fontFamily: F.title, lineHeight: 30 },
  scoreDenom: { fontSize: 10, fontFamily: F.body, color: C.goldDim },
  resultRight: { flex: 1, gap: 6 },
  scoreLabel: { fontSize: 14, fontFamily: F.bodySemi },
  scoreBarTrack: {
    height: 6, backgroundColor: "rgba(201,162,39,0.1)",
    borderRadius: 3, overflow: "hidden", borderWidth: 0.5, borderColor: C.border,
  },
  scoreBarFill: { height: "100%", borderRadius: 3 },
  heardText: { fontSize: 12, fontFamily: F.body, color: C.parchment, fontStyle: "italic" },
  feedbackText: { fontSize: 12, fontFamily: F.body, color: C.goldDim, lineHeight: 17 },
  retryChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "center", paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg2,
  },
  retryChipText: { fontSize: 12, fontFamily: F.bodySemi },
  errorRow: {
    flexDirection: "row", gap: 6, alignItems: "flex-start",
    backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(239,68,68,0.2)",
  },
  errorText: { flex: 1, fontSize: 12, fontFamily: F.body, color: "#EF4444", lineHeight: 18 },

  // ── Navigation (flex 1.5) ────────────────────────────────────────────────
  navSection: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 4,
  },
  navBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderRadius: 14,
  },
  prevBtn: {
    backgroundColor: C.bg2, borderWidth: 1.5, borderColor: C.border,
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 14, fontFamily: F.bodySemi },
  navProgress: { alignItems: "center", minWidth: 44 },
  navProgressText: { fontSize: 13, fontFamily: F.bodySemi, color: C.goldDim },
  nextBtnActive: { overflow: "hidden" },
  nextBtnInactive: { backgroundColor: C.bg2, borderWidth: 1.5, borderColor: C.border },
  nextBtnText: { fontSize: 14, fontFamily: F.bodySemi, color: "#fff" },

  // ── Completion screen ────────────────────────────────────────────────────
  completeWrap: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 28, gap: 18,
  },
  completeTrophy: { fontSize: 64, textAlign: "center" },
  completeTitle: {
    fontSize: 24, fontFamily: F.header, color: C.gold,
    textAlign: "center", letterSpacing: 1, lineHeight: 34,
  },
  completeSub: { fontSize: 14, fontFamily: F.body, color: C.goldDim, textAlign: "center", fontStyle: "italic" },
  weakBox: {
    backgroundColor: C.bg2, borderRadius: 14, padding: 14,
    width: "100%", borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", gap: 6,
  },
  weakBoxHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  weakBoxTitle: { fontSize: 12, fontFamily: F.bodySemi, color: "#EF4444" },
  weakWord: { fontSize: 14, fontFamily: F.body, color: C.parchment, paddingLeft: 4 },
  newSessionBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 14, paddingHorizontal: 36,
    borderRadius: 18, overflow: "hidden",
  },
  newSessionBtnText: { fontSize: 15, fontFamily: F.header, color: C.bg1, letterSpacing: 1 },
});
