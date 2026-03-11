import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLanguage } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";

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

interface PronScores {
  accuracy: number;
  fluency: number;
  completeness: number;
  overall: number;
}

interface FeedbackInfo { emoji: string; text: string; color: string }

function getFeedback(score: number): FeedbackInfo {
  if (score >= 90) return { emoji: "🌟", text: "Outstanding!", color: "#10B981" };
  if (score >= 75) return { emoji: "🎯", text: "Great job!", color: "#3B82F6" };
  if (score >= 55) return { emoji: "👍", text: "Good effort!", color: "#F59E0B" };
  if (score >= 30) return { emoji: "💪", text: "Keep practising", color: "#EF4444" };
  return { emoji: "🔁", text: "Try again", color: "#EF4444" };
}

function scoreColor(s: number) {
  if (s >= 80) return "#10B981";
  if (s >= 60) return "#3B82F6";
  if (s >= 40) return "#F59E0B";
  return "#EF4444";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Build a WAV (PCM 16-bit mono) ArrayBuffer from Int16 samples.
 * Azure Speech REST API reliably handles audio/wav.
 */
function buildWavBuffer(pcm16: Int16Array, sampleRate: number): ArrayBuffer {
  const numCh = 1, bps = 16;
  const dataBytes = pcm16.length * 2;
  const buf = new ArrayBuffer(44 + dataBytes);
  const v = new DataView(buf);
  const str = (s: string, o: number) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str("RIFF", 0);
  v.setUint32(4, 36 + dataBytes, true);
  str("WAVE", 8);
  str("fmt ", 12);
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, numCh, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * numCh * bps / 8, true);
  v.setUint16(32, numCh * bps / 8, true);
  v.setUint16(34, bps, true);
  str("data", 36);
  v.setUint32(40, dataBytes, true);
  for (let i = 0; i < pcm16.length; i++) v.setInt16(44 + i * 2, pcm16[i], true);
  return buf;
}

/**
 * Record audio via AudioContext → 16 kHz mono PCM → WAV base64.
 * Works on iOS Safari, Chrome, Firefox — avoids MediaRecorder's mp4/webm format issues.
 * Azure Speech REST API always accepts audio/wav.
 */
async function recordWebAudio(durationMs: number): Promise<string> {
  const stream = await (navigator.mediaDevices as any).getUserMedia({
    audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true },
    video: false,
  });
  // Request 16kHz but use ctx.sampleRate (iOS Safari may ignore the request)
  const ctx = new (window as any).AudioContext({ sampleRate: 16000 }) as AudioContext;
  const actualRate = ctx.sampleRate;
  const source = ctx.createMediaStreamSource(stream);
  const chunks: Float32Array[] = [];

  // ScriptProcessor is deprecated but works on all browsers including old iOS Safari
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = (e: AudioProcessingEvent) => {
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };
  source.connect(processor);
  processor.connect(ctx.destination);

  await new Promise<void>((resolve) => setTimeout(resolve, durationMs));

  source.disconnect();
  processor.disconnect();
  stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
  await ctx.close();

  // Flatten PCM chunks
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const flat = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) { flat.set(c, offset); offset += c.length; }

  // Float32 → Int16, use actual sample rate in WAV header
  const pcm16 = new Int16Array(flat.length);
  for (let i = 0; i < flat.length; i++) {
    pcm16[i] = Math.round(Math.max(-1, Math.min(1, flat[i])) * 32767);
  }

  // WAV → base64 (use actualRate so Azure gets the right format)
  const wavBuf = buildWavBuffer(pcm16, actualRate);
  const bytes = new Uint8Array(wavBuf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}


// Singleton audio element so we can stop previous playback
let _pronunciationAudio: HTMLAudioElement | null = null;

/**
 * Play pronunciation audio using Azure Neural TTS via the backend.
 * This guarantees the correct language voice (e.g. es-ES-ElviraNeural)
 * regardless of what voices the OS/browser has installed.
 */
async function playPronunciationTTS(
  text: string,
  lang: string,
  apiBase: string
) {
  try {
    // Stop any currently playing pronunciation
    if (Platform.OS === "web" && _pronunciationAudio) {
      _pronunciationAudio.pause();
      _pronunciationAudio.src = "";
      _pronunciationAudio = null;
    }

    const url = new URL("/api/pronunciation-tts", apiBase);
    url.searchParams.set("text", text);
    url.searchParams.set("lang", lang);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Azure TTS ${res.status}`);

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    if (Platform.OS === "web") {
      const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
      _pronunciationAudio = audio;
      audio.onended = () => {
        URL.revokeObjectURL(objectUrl);
        _pronunciationAudio = null;
      };
      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        _pronunciationAudio = null;
      };
      await audio.play();
    } else {
      // Native: play blob via expo-av Sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: objectUrl },
        { shouldPlay: true }
      );
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
  const { t } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : TAB_BAR_HEIGHT + insets.bottom;

  const [activeLang, setActiveLang] = useState<LangTab>("korean");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [scores, setScores] = useState<PronScores | null>(null);
  const [hasListened, setHasListened] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [sttError, setSttError] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

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
    setScores(null);
    setHasListened(false);
    setTranscribedText("");
    setSttError("");
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  const handleListen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasListened(true);
    // Use Azure Neural TTS — correct language voice guaranteed (e.g. es-ES-ElviraNeural)
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

  const handleRecord = async () => {
    if (recordState === "listening" || recordState === "processing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRecordState("listening");
    setScore(null);
    setTranscribedText("");
    setSttError("");
    startPulse();

    try {
      let audioBase64 = "";
      let mimeType = "audio/webm";

      if (Platform.OS === "web") {
        // ── Web: AudioContext → 16kHz PCM → WAV ────────────────────────────
        // MediaRecorder on iOS Safari produces video/mp4 which Azure STT
        // does NOT accept via REST API. AudioContext WAV works everywhere.
        audioBase64 = await recordWebAudio(4000);
        mimeType = "audio/wav";
      } else {
        // ── Native: expo-av ─────────────────────────────────────────────────
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) throw new Error("Microphone permission denied");

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        await new Promise((r) => setTimeout(r, 4000));
        await recording.stopAndUnloadAsync();

        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

        const uri = recording.getURI();
        if (!uri) throw new Error("No recording URI");

        mimeType = "audio/x-m4a";
        const res = await fetch(uri);
        const blob = await res.blob();
        audioBase64 = await blobToBase64(blob);
      }

      // ── Processing: send to Azure Pronunciation Assessment ────────────────
      stopPulse();
      setRecordState("processing");

      const apiUrl = new URL("/api/pronunciation-assessment", getApiUrl()).toString();
      const apiRes = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: audioBase64,
          mimeType,
          language: phrase.speechLang,
          referenceText: phrase.word,
        }),
      });

      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        throw new Error(errData.error ?? `HTTP ${apiRes.status}`);
      }

      const data = await apiRes.json();
      setTranscribedText(data.transcribedText ?? "");

      if (
        data.status !== "Success" ||
        data.pronScore === null ||
        data.pronScore === undefined
      ) {
        // Azure couldn't assess — show meaningful error
        const statusMsg: Record<string, string> = {
          InitialSilenceTimeout: "No speech detected — speak clearly after tapping the mic",
          BabbleTimeout: "Too much background noise — find a quieter spot",
          NoMatch: "Couldn't match your speech — try speaking more clearly",
        };
        setSttError(
          statusMsg[data.status] ??
          "Couldn't hear you — try again in a quieter place"
        );
      } else {
        setScores({
          accuracy: data.accuracyScore ?? 0,
          fluency: data.fluencyScore ?? 0,
          completeness: data.completenessScore ?? 0,
          overall: data.pronScore ?? 0,
        });
      }
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      if (msg.includes("permission") || msg.includes("Permission")) {
        setSttError("Microphone access denied — enable it in your browser/device settings");
      } else {
        setSttError("Something went wrong — please try again");
      }
    } finally {
      stopPulse();
      setRecordState("done");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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
          {LANG_TABS.map((tab) => {
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
            {/* Level + listen row */}
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

            {/* Word */}
            <Text style={styles.phraseWord}>{phrase.word}</Text>

            {/* IPA */}
            <View style={styles.ipaRow}>
              <Text style={styles.ipaLabel}>IPA</Text>
              <Text style={styles.ipaText}>{phrase.ipa}</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Meaning */}
            <Text style={styles.phraseMeaning}>{phrase.meaning}</Text>

            {/* Tip */}
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

        {/* Mic / Score section */}
        <View style={styles.micSection}>
          {recordState === "done" ? (
            <View style={styles.scoreWrap}>
              {scores ? (
                <>
                  {/* Overall score header */}
                  {(() => {
                    const feedback = getFeedback(scores.overall);
                    return (
                      <View style={styles.overallRow}>
                        <View style={[styles.overallCircle, { borderColor: feedback.color }]}>
                          <Text style={[styles.overallNumber, { color: feedback.color }]}>{scores.overall}</Text>
                          <Text style={styles.overallLabel}>overall</Text>
                        </View>
                        <View style={styles.overallMeta}>
                          <Text style={styles.overallEmoji}>{feedback.emoji}</Text>
                          <Text style={[styles.overallFeedback, { color: feedback.color }]}>{feedback.text}</Text>
                        </View>
                      </View>
                    );
                  })()}

                  {/* 4 score bars */}
                  <View style={styles.scoreBars}>
                    {[
                      { label: "Accuracy", value: scores.accuracy },
                      { label: "Fluency", value: scores.fluency },
                      { label: "Completeness", value: scores.completeness },
                    ].map(({ label, value }) => (
                      <View key={label} style={styles.scoreBarRow}>
                        <Text style={styles.scoreBarLabel}>{label}</Text>
                        <View style={styles.scoreBarTrack}>
                          <View
                            style={[
                              styles.scoreBarFill,
                              { width: `${value}%` as any, backgroundColor: scoreColor(value) },
                            ]}
                          />
                        </View>
                        <Text style={[styles.scoreBarValue, { color: scoreColor(value) }]}>{value}</Text>
                      </View>
                    ))}
                  </View>

                  {/* What Azure heard */}
                  {transcribedText ? (
                    <View style={styles.transcriptBox}>
                      <Text style={styles.transcriptLabel}>Azure heard:</Text>
                      <Text style={styles.transcriptText}>"{transcribedText}"</Text>
                    </View>
                  ) : null}
                </>
              ) : (
                /* No scores — show error */
                <View style={styles.errorBox}>
                  <Ionicons name="warning-outline" size={18} color="#EF4444" />
                  <Text style={styles.errorText}>
                    {sttError || "Couldn't assess pronunciation — please try again"}
                  </Text>
                </View>
              )}

              <Pressable
                style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.8 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  resetState();
                }}
                testID="retry-button"
              >
                <Ionicons name="refresh" size={16} color={tabInfo.color} />
                <Text style={[styles.retryBtnText, { color: tabInfo.color }]}>{t("try_again")}</Text>
              </Pressable>
            </View>
          ) : (
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
                  <Ionicons
                    name={isRecording ? "radio-button-on" : isProcessing ? "hourglass" : "mic"}
                    size={46}
                    color="#FFFFFF"
                  />
                </Pressable>
              </Animated.View>

              <Text style={styles.micHint}>
                {isRecording
                  ? "Listening for 4 seconds…"
                  : isProcessing
                  ? "Analysing with Azure…"
                  : hasListened
                  ? "Now tap to record yourself"
                  : "Tap 🔊 to listen first, then record"}
              </Text>

              {!hasListened && recordState === "idle" && (
                <View style={styles.listenHintRow}>
                  <Ionicons name="arrow-up-outline" size={13} color="#C4B5BF" />
                  <Text style={styles.listenHintText}>Tap Listen above to hear the pronunciation</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Prev / Next */}
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
            style={({ pressed }) => [styles.navBtn, styles.nextBtn, { backgroundColor: tabInfo.color }, pressed && { opacity: 0.85 }]}
            onPress={() => navigate("next")}
            testID="next-button"
          >
            <Text style={styles.nextBtnText}>{t("next")}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
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
    minHeight: 200,
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

  scoreWrap: {
    alignSelf: "stretch",
    gap: 12,
  },
  overallRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    justifyContent: "center",
  },
  overallCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  overallNumber: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  overallLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  overallMeta: {
    gap: 4,
    alignItems: "flex-start",
  },
  overallEmoji: { fontSize: 22 },
  overallFeedback: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  scoreBars: {
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scoreBarLabel: {
    width: 100,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#5A4A5A",
  },
  scoreBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#F0E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreBarValue: {
    width: 30,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },

  transcriptBox: {
    alignItems: "center",
    gap: 2,
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 2,
  },
  transcriptLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#6B9DFF",
    letterSpacing: 0.5,
  },
  transcriptText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A2E",
    textAlign: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#EF4444",
  },

  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#FF6B9D50",
    backgroundColor: "#FFFFFF",
    marginTop: 4,
  },
  retryBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
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
