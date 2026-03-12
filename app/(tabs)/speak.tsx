import React, { useState, useRef, useEffect } from "react";
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
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLanguage, getDefaultLearning, NativeLanguage } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { XPToast } from "@/components/XPToast";

const TAB_BAR_HEIGHT = 49;

type LangTab = "korean" | "english" | "spanish";

interface Phrase {
  word: string;
  ipa: string;
  meaning: string;
  level: string;
  speechLang: string;
  tip: string;
}

const PHRASE_SETS: Record<LangTab, Phrase[]> = {
  korean: [
    { word: "안녕하세요", ipa: "/an.njʌŋ.ha.se.jo/", meaning: "Hello / Good day", level: "A1", speechLang: "ko-KR", tip: "Rise slightly in pitch on the last syllable." },
    { word: "감사합니다", ipa: "/kam.sa.ham.ni.da/", meaning: "Thank you very much (formal)", level: "A1", speechLang: "ko-KR", tip: "Keep each syllable even. No stress accent like English." },
    { word: "사랑해요", ipa: "/sa.ɾaŋ.hɛ.jo/", meaning: "I love you", level: "A2", speechLang: "ko-KR", tip: "The ɾ is a flap — similar to the 'd' in 'ladder'." },
    { word: "어디에 있어요?", ipa: "/ʌ.di.e i.sʌ.jo/", meaning: "Where is it?", level: "A2", speechLang: "ko-KR", tip: "The ʌ vowel is in the back of the mouth, not the front." },
    { word: "맛있어요", ipa: "/ma.si.sʌ.jo/", meaning: "It's delicious", level: "A2", speechLang: "ko-KR", tip: "The ㅅ before a vowel becomes an 's' sound." },
    { word: "잘 부탁드립니다", ipa: "/tɕal pu.tʰak.tɯ.rim.ni.da/", meaning: "Please look after me", level: "B1", speechLang: "ko-KR", tip: "Common phrase when meeting someone new. Say it warmly." },
    { word: "반갑습니다", ipa: "/pan.gap.sɯm.ni.da/", meaning: "Nice to meet you (formal)", level: "A1", speechLang: "ko-KR", tip: "The 반 is lower in pitch, 갑 rises slightly." },
    { word: "얼마예요?", ipa: "/ʌl.ma.je.jo/", meaning: "How much is it?", level: "A2", speechLang: "ko-KR", tip: "Raise pitch at the end to signal a question." },
  ],
  english: [
    { word: "thoroughly", ipa: "/ˈθʌr.ə.li/", meaning: "Completely, in every detail", level: "B1", speechLang: "en-US", tip: "The 'th' needs tongue between teeth, not a 'd' or 't' sound." },
    { word: "squirrel", ipa: "/ˈskwɪr.əl/", meaning: "A small tree-climbing rodent", level: "A2", speechLang: "en-US", tip: "Famously tricky. The 'r' colors the vowel before it." },
    { word: "rural", ipa: "/ˈrʊr.əl/", meaning: "Relating to the countryside", level: "B1", speechLang: "en-US", tip: "Two 'r' sounds in a row. Relax the tongue for both." },
    { word: "pronunciation", ipa: "/prəˌnʌn.siˈeɪ.ʃən/", meaning: "The way a word is spoken", level: "B1", speechLang: "en-US", tip: "Note: it's pronunCIation, not pronounciation." },
    { word: "comfortable", ipa: "/ˈkʌm.fər.tə.bəl/", meaning: "Giving physical ease", level: "A2", speechLang: "en-US", tip: "Often pronounced as 3 syllables: KUMF-ter-bul." },
    { word: "entrepreneur", ipa: "/ˌɒn.trə.prəˈnɜːr/", meaning: "Someone who starts a business", level: "C1", speechLang: "en-US", tip: "French origin. The stress is on the final syllable." },
    { word: "particularly", ipa: "/pəˈtɪk.jʊ.lər.li/", meaning: "Especially, more than usual", level: "B2", speechLang: "en-US", tip: "Try to hit all 5 syllables clearly at normal speed." },
    { word: "worcestershire", ipa: "/ˈwʊs.tər.ʃər/", meaning: "A type of sauce (place name)", level: "C1", speechLang: "en-US", tip: "Only 3 syllables: WUS-tər-shər. Silent letters galore!" },
  ],
  spanish: [
    { word: "gracias", ipa: "/ˈɡɾa.sjas/", meaning: "Thank you", level: "A1", speechLang: "es-ES", tip: "The 'r' is a single tap (ɾ), not a rolled 'rr'." },
    { word: "murciélago", ipa: "/muɾ.ˈθje.la.ɣo/", meaning: "Bat (the animal)", level: "B1", speechLang: "es-ES", tip: "Contains all 5 vowels! The θ is a 'th' sound in Spain Spanish." },
    { word: "desarrollar", ipa: "/de.za.ro.ˈʎaɾ/", meaning: "To develop", level: "B1", speechLang: "es-ES", tip: "The 'll' is a palatal lateral — like the 'y' in 'yes' in many dialects." },
    { word: "extraordinario", ipa: "/eks.tɾa.oɾ.ðiˈna.ɾjo/", meaning: "Extraordinary", level: "B2", speechLang: "es-ES", tip: "7 syllables! Break it down slowly before building to full speed." },
    { word: "ferrocarril", ipa: "/fe.ro.kaˈril/", meaning: "Railway / railroad", level: "B2", speechLang: "es-ES", tip: "Two rolling 'rr' sounds. Practice the trill separately first." },
    { word: "subjuntivo", ipa: "/sub.xunˈti.βo/", meaning: "Subjunctive (grammar mood)", level: "B2", speechLang: "es-ES", tip: "The 'j' in Spanish is like a raspy 'h' from the throat." },
    { word: "churrigueresco", ipa: "/tʃu.ri.ɣeˈɾes.ko/", meaning: "Extravagantly ornamented style", level: "C1", speechLang: "es-ES", tip: "Tongue-twister level! The 'rr' is the tricky part." },
    { word: "otorrinolaringólogo", ipa: "/o.to.ri.no.la.ɾiŋˈɡo.lo.ɣo/", meaning: "Ear/nose/throat doctor", level: "C2", speechLang: "es-ES", tip: "10 syllables — the Spanish word for ENT. Take it one chunk at a time." },
  ],
};

const LANG_TABS: { key: LangTab; label: string; flag: string; color: string }[] = [
  { key: "korean", label: "Korean", flag: "🇰🇷", color: "#FF6B9D" },
  { key: "english", label: "English", flag: "🇬🇧", color: "#6B9DFF" },
  { key: "spanish", label: "Spanish", flag: "🇪🇸", color: "#FF9D6B" },
];

function getScoreLabel(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "완벽해요! 🎉", color: "#10B981" };
  if (score >= 70) return { text: "잘 했어요! 😊", color: "#3B82F6" };
  if (score >= 50) return { text: "조금 더 연습해봐요 💪", color: "#F59E0B" };
  return { text: "다시 해봐요! 🔄", color: "#EF4444" };
}

// Singleton audio element so previous playback stops on new tap
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

type RecordState = "idle" | "listening" | "processing" | "done";

export default function SpeakScreen() {
  const insets = useSafeAreaInsets();
  const { t, nativeLanguage, learningLanguage, stats, updateStats } = useLanguage();
  const [xpGain, setXpGain] = useState(0);
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : TAB_BAR_HEIGHT + insets.bottom;

  const nativeLang = (nativeLanguage ?? "english") as NativeLanguage;
  const visibleTabs = LANG_TABS.filter((tab) => tab.key !== nativeLang);

  const [activeLang, setActiveLang] = useState<LangTab>(() => {
    const ll = learningLanguage as LangTab | null;
    if (ll && ll !== nativeLang) return ll;
    return (visibleTabs[0]?.key ?? "english") as LangTab;
  });
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [gptFeedback, setGptFeedback] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [sttError, setSttError] = useState("");
  const [hasListened, setHasListened] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const recordStateRef = useRef<RecordState>("idle");

  useEffect(() => {
    if (learningLanguage && learningLanguage !== nativeLang) {
      setActiveLang(learningLanguage as LangTab);
      setPhraseIdx(0);
    }
  }, [learningLanguage]);

  const phrases = PHRASE_SETS[activeLang];
  const phrase = phrases[phraseIdx];
  const tabInfo = LANG_TABS.find((tab) => tab.key === activeLang)!;

  const switchLang = (lang: LangTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveLang(lang);
    setPhraseIdx(0);
    resetState();
  };

  const resetState = () => {
    setRecordState("idle");
    recordStateRef.current = "idle";
    setScore(null);
    setGptFeedback("");
    setRecognizedText("");
    setSttError("");
    setHasListened(false);
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  const handleListen = () => {
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
    if (recordState === "listening" || recordState === "processing") return;
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
      setSttError("이 브라우저는 음성 인식을 지원하지 않습니다.\nSafari 또는 Chrome을 사용해 주세요.");
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

  const navigate = (dir: "prev" | "next") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhraseIdx((i) => {
      if (dir === "next") return (i + 1) % phrases.length;
      return (i - 1 + phrases.length) % phrases.length;
    });
    resetState();
  };

  const isRecording = recordState === "listening";
  const isProcessing = recordState === "processing";
  const isBusy = isRecording || isProcessing;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#FFF0F6", "#FFF8FB"]} style={StyleSheet.absoluteFill} />
      <XPToast amount={xpGain} onDone={() => setXpGain(0)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 20 }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("speak_title")}</Text>
          <Text style={styles.subtitle}>{t("speak_subtitle")}</Text>
        </View>

        {/* Language tabs */}
        <View style={styles.langTabs}>
          {visibleTabs.map((tab) => {
            const active = activeLang === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={({ pressed }) => [
                  styles.langTab,
                  active && { backgroundColor: tab.color },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => switchLang(tab.key)}
              >
                <Text style={styles.langTabFlag}>{tab.flag}</Text>
                <Text style={[styles.langTabLabel, active && styles.langTabLabelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Phrase card */}
        <View style={styles.phraseCard}>
          <View style={styles.phraseCardInner}>
            <View style={styles.phraseTopRow}>
              <View style={[styles.levelBadge, { backgroundColor: tabInfo.color + "18" }]}>
                <Text style={[styles.levelText, { color: tabInfo.color }]}>{phrase.level}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.listenBtn,
                  { borderColor: tabInfo.color + "50" },
                  pressed && { opacity: 0.75 },
                ]}
                onPress={handleListen}
                testID="listen-button"
              >
                <Ionicons name="volume-high" size={16} color={tabInfo.color} />
                <Text style={[styles.listenBtnText, { color: tabInfo.color }]}>{t("listen")}</Text>
              </Pressable>
            </View>

            <Text style={styles.phraseWord}>{phrase.word}</Text>

            <View style={styles.ipaRow}>
              <Text style={styles.ipaLabel}>IPA</Text>
              <Text style={styles.ipaText}>{phrase.ipa}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.phraseMeaning}>{phrase.meaning}</Text>

            <View style={styles.tipBox}>
              <Ionicons name="bulb-outline" size={13} color="#F59E0B" />
              <Text style={styles.tipText}>{phrase.tip}</Text>
            </View>
          </View>
        </View>

        {/* Progress dots */}
        <View style={styles.progressRow}>
          <Text style={styles.progressCount}>
            {phraseIdx + 1} / {phrases.length}
          </Text>
          <View style={styles.progressDots}>
            {phrases.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === phraseIdx && [styles.dotActive, { backgroundColor: tabInfo.color }],
                ]}
              />
            ))}
          </View>
        </View>

        {/* Mic / Result section */}
        <View style={styles.micSection}>
          {recordState === "done" ? (
            /* ── Results ─────────────────────────────────────────────────── */
            <View style={styles.resultWrap}>
              {score !== null ? (
                <>
                  {/* Score circle */}
                  {(() => {
                    const { text, color } = getScoreLabel(score);
                    return (
                      <View style={styles.scoreBlock}>
                        <View style={[styles.scoreCircle, { borderColor: color }]}>
                          <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
                        </View>
                        <Text style={[styles.scoreLabel, { color }]}>{text}</Text>
                      </View>
                    );
                  })()}

                  {/* GPT feedback */}
                  {gptFeedback ? (
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackText}>{gptFeedback}</Text>
                    </View>
                  ) : null}

                  {/* What was heard */}
                  {recognizedText ? (
                    <View style={styles.heardBox}>
                      <Text style={styles.heardLabel}>인식된 발음</Text>
                      <Text style={styles.heardText}>"{recognizedText}"</Text>
                    </View>
                  ) : null}
                </>
              ) : (
                /* Error */
                <View style={styles.errorBox}>
                  <Ionicons name="warning-outline" size={18} color="#EF4444" />
                  <Text style={styles.errorText}>
                    {sttError || "음성 인식에 실패했습니다. 다시 시도해 주세요."}
                  </Text>
                </View>
              )}

              {/* Action buttons */}
              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.retryBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setRecordState("idle");
                    recordStateRef.current = "idle";
                    setScore(null);
                    setGptFeedback("");
                    setRecognizedText("");
                    setSttError("");
                    pulseLoop.current?.stop();
                    Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
                  }}
                  testID="retry-button"
                >
                  <Ionicons name="refresh" size={16} color={tabInfo.color} />
                  <Text style={[styles.actionBtnText, { color: tabInfo.color }]}>다시 시도</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.nextWordBtn,
                    { backgroundColor: tabInfo.color },
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => navigate("next")}
                  testID="next-word-button"
                >
                  <Text style={styles.nextWordBtnText}>다음 단어</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          ) : (
            /* ── Mic button ───────────────────────────────────────────────── */
            <View style={styles.micWrap}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable
                  style={({ pressed }) => [styles.micBtn, pressed && { opacity: 0.88 }]}
                  onPress={handleRecord}
                  disabled={isBusy}
                  testID="mic-button"
                >
                  <LinearGradient
                    colors={
                      isRecording
                        ? ["#FF4081", "#E91E63"]
                        : [tabInfo.color, tabInfo.color + "CC"]
                    }
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                  />
                  {isProcessing ? (
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  ) : (
                    <Ionicons
                      name={isRecording ? "radio-button-on" : "mic"}
                      size={46}
                      color="#FFFFFF"
                    />
                  )}
                </Pressable>
              </Animated.View>

              {isRecording ? (
                <View style={styles.recordingBadge}>
                  <View style={styles.redDot} />
                  <Text style={styles.recordingBadgeText}>녹음 중...</Text>
                </View>
              ) : isProcessing ? (
                <View style={styles.scoringDots}>
                  <View style={[styles.scoringDot, { opacity: 1 }]} />
                  <View style={[styles.scoringDot, { opacity: 0.6 }]} />
                  <View style={[styles.scoringDot, { opacity: 0.3 }]} />
                </View>
              ) : (
                <Text style={styles.micHint}>
                  {hasListened
                    ? "마이크를 탭해서 따라 말해보세요"
                    : "🔊 먼저 듣고, 따라 말해보세요"}
                </Text>
              )}

              {!hasListened && recordState === "idle" && (
                <View style={styles.listenHintRow}>
                  <Ionicons name="arrow-up-outline" size={13} color="#C4B5BF" />
                  <Text style={styles.listenHintText}>위의 듣기 버튼을 먼저 눌러보세요</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Prev / Next navigation */}
        {recordState !== "done" && (
          <View style={styles.navRow}>
            <Pressable
              style={({ pressed }) => [styles.navBtn, styles.prevBtn, pressed && { opacity: 0.8 }]}
              onPress={() => navigate("prev")}
              testID="prev-button"
            >
              <Ionicons name="arrow-back" size={18} color="#FF6B9D" />
              <Text style={styles.prevBtnText}>Prev</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.navBtn,
                styles.nextBtn,
                { backgroundColor: tabInfo.color },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => navigate("next")}
              testID="next-button"
            >
              <Text style={styles.nextBtnText}>{t("next")}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    gap: 18,
  },
  header: { gap: 3 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#1A1A2E" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#A08090" },

  langTabs: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F5E8F0",
    borderRadius: 16,
    padding: 4,
  },
  langTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: "transparent",
  },
  langTabFlag: { fontSize: 15 },
  langTabLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#A08090",
  },
  langTabLabelActive: { color: "#FFFFFF" },

  phraseCard: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  phraseCardInner: {
    padding: 24,
    gap: 10,
  },
  phraseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  listenBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  listenBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  phraseWord: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 48,
  },
  ipaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ipaLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#C4B5BF",
    letterSpacing: 1,
    backgroundColor: "#F5E8F0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  ipaText: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0D6E4",
    marginVertical: 2,
  },
  phraseMeaning: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#1A1A2E",
    textAlign: "center",
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#92400E",
    lineHeight: 18,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  progressCount: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#C4B5BF",
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#F0D6E4",
  },
  dotActive: {
    width: 18,
    borderRadius: 4,
  },

  micSection: {
    alignItems: "center",
    paddingVertical: 8,
    minHeight: 220,
    justifyContent: "center",
  },
  micWrap: {
    alignItems: "center",
    gap: 14,
  },
  micBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  micHint: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
    textAlign: "center",
  },
  recordingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF0F0",
    borderColor: "#FF4444",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF2020",
  },
  scoringDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    height: 28,
  },
  scoringDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B9D",
  },
  recordingBadgeText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#CC2020",
    letterSpacing: 0.3,
  },
  listenHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listenHintText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#C4B5BF",
  },

  resultWrap: {
    alignSelf: "stretch",
    gap: 14,
    alignItems: "center",
  },
  scoreBlock: {
    alignItems: "center",
    gap: 10,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreNumber: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    lineHeight: 40,
  },
  scoreLabel: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  feedbackBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  feedbackText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#1A1A2E",
    textAlign: "center",
    lineHeight: 22,
  },
  heardBox: {
    alignItems: "center",
    gap: 2,
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "stretch",
  },
  heardLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#6B9DFF",
    letterSpacing: 0.5,
  },
  heardText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A2E",
    textAlign: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: "stretch",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#EF4444",
    lineHeight: 20,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    alignSelf: "stretch",
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 18,
  },
  retryBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FF6B9D50",
  },
  actionBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  nextWordBtn: {
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextWordBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },

  navRow: {
    flexDirection: "row",
    gap: 12,
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 15,
    borderRadius: 20,
  },
  prevBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FF6B9D",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  prevBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FF6B9D",
  },
  nextBtn: {
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
