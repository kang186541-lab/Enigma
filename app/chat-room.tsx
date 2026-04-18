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
import { Audio, AVPlaybackStatus } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTutor, TUTOR_IMAGES, Tutor } from "@/constants/tutors";
import { useLanguage } from "@/context/LanguageContext";
import { XPToast } from "@/components/XPToast";
import { getApiUrl } from "@/lib/query-client";
import { recordAudio } from "@/lib/audio";
import { C, F } from "@/constants/theme";
import { startSession, endSession } from "@/lib/sessionTracker";
import { UNITS, loadProgress } from "@/lib/dailyCourseData";
import {
  loadLearnerProfile, saveLearnerProfile, markDiagnosed,
  recordErrorPattern, buildLearnerSummary, bumpSession,
  seedDiagnosedIfExistingUser, isValidCefrLevel,
  bumpTutorSession, recordSessionSummary, buildTutorMemorySummary,
  type LearnerProfile, type CefrLevel, type LearningGoal,
  type TutorRelationshipTier,
} from "@/lib/learnerProfile";
import {
  LESSON_PHASE_ORDER, nextPhase, phaseLabel, shouldAutoAdvance,
  type LessonPhase,
} from "@/lib/lessonArc";

type CorrectionStrategy = "recast" | "elicit" | "mini_lesson";
type CorrectionPriority = "high" | "pattern" | "low";

interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  errorKey?: string;
  strategy?: CorrectionStrategy;
  priority?: CorrectionPriority;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  correction?: Correction;     // attached to user message that contained the mistake
  isLessonOpening?: boolean;   // first AI bubble flag (for optional Day badge)
  lessonDayNumber?: number;    // shown only when isLessonOpening
  lessonTopicLabel?: string;   // topic in user's native language for the badge
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

// ── Azure TTS helpers ────────────────────────────────────────────────────────
// Strategy:
//  - Web: fetch /api/tts → MP3 blob → HTML5 Audio element (no gesture restriction
//    because we are playing a fetched blob, not SpeechSynthesis)
//  - Native: fetch /api/tts → play via expo-av Audio.Sound

let _webAudioEl: HTMLAudioElement | null = null;
let _nativeSound: Audio.Sound | null = null;

/**
 * Native TTS via Azure (expo-av) — gives gender-correct voices:
 * Sarah → en-GB-SoniaNeural (female), Jake → en-US-GuyNeural (male), etc.
 * Fails silently if the server is unreachable.
 */
// Monotonic token — used to invalidate in-flight native play requests whenever
// stopSpeech() or a newer play call supersedes them. Without this, a createAsync
// that lands AFTER cleanup would re-install a stale _nativeSound that keeps
// playing across screen navigations or fast re-entry.
let _nativePlayToken = 0;

async function azureNativePlay(
  text: string,
  tutorId: string,
  apiBase: string,
  speed: number,
  onStart?: () => void,
  onEnd?: () => void,
) {
  const myToken = ++_nativePlayToken;

  // Stop any currently playing native sound
  if (_nativeSound) {
    const prev = _nativeSound;
    _nativeSound = null;
    try { await prev.stopAsync(); } catch (e) { console.warn('[ChatRoom] Failed to stop previous sound:', e); }
    try { await prev.unloadAsync(); } catch (e) { console.warn('[ChatRoom] Failed to unload previous sound:', e); }
  }

  // If another play/stop raced in while we were stopping, bail out.
  if (myToken !== _nativePlayToken) { onEnd?.(); return; }

  const url = new URL("/api/tts", apiBase);
  url.searchParams.set("text", text.slice(0, 5000));
  url.searchParams.set("tutorId", tutorId);
  url.searchParams.set("speed", speed.toString());

  try {
    onStart?.();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
    if (myToken !== _nativePlayToken) { onEnd?.(); return; }
    const { sound } = await Audio.Sound.createAsync(
      { uri: url.toString() },
      { shouldPlay: true },
    );
    // If we were superseded while loading, immediately unload and bail.
    if (myToken !== _nativePlayToken) {
      sound.unloadAsync().catch((e) => console.warn('[ChatRoom] superseded unload failed:', e));
      onEnd?.();
      return;
    }
    _nativeSound = sound;
    sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch((e) => console.warn('[ChatRoom] sound unload failed:', e));
        if (_nativeSound === sound) _nativeSound = null;
        onEnd?.();
      }
    });
  } catch (e) {
    console.warn('[ChatRoom] TTS playback failed (server unreachable):', e);
    if (myToken === _nativePlayToken) _nativeSound = null;
    onEnd?.();
  }
}

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
    // Bump the native play token so any in-flight createAsync bails on resume.
    _nativePlayToken++;
    if (_nativeSound) {
      const s = _nativeSound;
      _nativeSound = null;
      s.stopAsync().catch((e) => console.warn('[ChatRoom] stop failed:', e)).finally(() => s.unloadAsync().catch((e) => console.warn('[ChatRoom] unload failed:', e)));
    }
  } else {
    if (_webAudioEl) {
      const prev = _webAudioEl;
      // Detach callbacks so a late onended from the killed audio doesn't fire
      // onEnd (which would clobber state for a newly-playing audio element).
      prev.onended = null;
      prev.onerror = null;
      prev.onloadedmetadata = null;
      try { prev.pause(); } catch (e) { console.warn('[ChatRoom] pause failed:', e); }
      try { prev.src = ""; prev.load?.(); } catch (e) { console.warn('[ChatRoom] src clear failed:', e); }
      _webAudioEl = null;
    }
  }
}

function azureWebPlay(
  text: string,
  tutorId: string,
  apiBase: string,
  speed: number,
  onStart?: () => void,
  onEnd?: () => void,
  onPlaybackStart?: (durationSecs: number) => void,
  // NOTE: mode is intentionally NOT sent to /api/tts.
  // Voice identity is locked to tutorId. Mode only belongs in /api/chat
  // (system prompt). Azure SSML uses per-tutor defaults.
) {
  try {
    const url = new URL("/api/tts", apiBase);
    url.searchParams.set("text", text.slice(0, 5000));
    url.searchParams.set("tutorId", tutorId);
    url.searchParams.set("speed", speed.toString());
    console.log("TTS called with speed:", speed);

    // Stop previous playback — and detach its callbacks so a late onended/
    // onerror from the killed audio can't fire onEnd for the NEW message
    // (which would clear speakingId/subtitle for a bubble that's still speaking).
    if (_webAudioEl) {
      const prev = _webAudioEl;
      prev.onended = null;
      prev.onerror = null;
      prev.onloadedmetadata = null;
      try { prev.pause(); } catch (e) { console.warn('[ChatRoom] pause prev failed:', e); }
      try { prev.src = ""; prev.load?.(); } catch (e) { console.warn('[ChatRoom] src clear failed:', e); }
      _webAudioEl = null;
    }

    // iOS Safari: create Audio element + call play() synchronously inside the
    // user-gesture handler. Using a direct URL (not fetched blob) keeps the
    // gesture chain intact, so autoplay restrictions don't block playback.
    const audio = new (window as any).Audio() as HTMLAudioElement;
    audio.preload = "auto";
    audio.src = url.toString();
    _webAudioEl = audio;

    onStart?.();

    audio.onloadedmetadata = () => {
      const dur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null;
      if (dur !== null) onPlaybackStart?.(dur);
    };
    audio.onended = () => {
      _webAudioEl = null;
      onEnd?.();
    };
    audio.onerror = () => {
      console.warn('[ChatRoom] Azure web TTS audio error');
      _webAudioEl = null;
      onEnd?.();
    };

    // Must be called synchronously inside the user-gesture handler for iOS.
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((e) => {
        console.warn('[ChatRoom] Azure web TTS playback failed:', e);
        _webAudioEl = null;
        onEnd?.();
      });
    }
  } catch (e) {
    console.warn('[ChatRoom] Azure web TTS setup failed:', e);
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
  const { t, nativeLanguage, learningLanguage, stats, updateStats } = useLanguage();
  const [xpGain, setXpGain] = useState(0);
  const statsRef = useRef(stats);
  const sessionXpRef = useRef(0);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // Session tracking: start on mount, end on unmount
  useEffect(() => {
    startSession('chat');
    bumpSession().catch((e) => console.warn('[ChatRoom] bumpSession failed:', e));
    return () => { endSession(sessionXpRef.current); };
  }, []);

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
  // Phase 2: tracks which user messages have their correction sub-bubble
  // expanded (for recast/elicit strategies that start collapsed).
  const [expandedCorrectionIds, setExpandedCorrectionIds] = useState<Set<string>>(new Set());
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

  // ── Daily lesson topic — picked once on mount, reused across sends ──────────
  const lessonTopicRef = useRef<string | null>(null);
  const lessonTopicNativeRef = useRef<string | null>(null);
  const lessonDayNumberRef = useRef<number | null>(null);

  // ── Phase 1: Learner model — loaded once, refreshed after diagnosis ─────────
  const learnerProfileRef = useRef<LearnerProfile | null>(null);
  // True during the first-ever session so the AI runs diagnostic intake instead
  // of jumping straight to the lesson topic. Flips to false after [DIAGNOSIS].
  const needsDiagnosisRef = useRef<boolean>(false);

  // ── Phase 4: Persistent tutor memory ───────────────────────────────────────
  const tutorMemorySummaryRef = useRef<string>("");
  const [tutorTier, setTutorTier] = useState<TutorRelationshipTier>("stranger");
  // Session summary captured from the AI on the reflect→done turn.
  // Attached to the lesson report and persisted on modal close.
  const sessionSummaryRef = useRef<{ highlight?: string; focusNextTime?: string } | null>(null);

  // ── Phase 3: Lesson Arc ────────────────────────────────────────────────────
  // Skipped entirely during diagnosis (phase = null until diagnosed+opened).
  const [lessonPhase, setLessonPhase] = useState<LessonPhase | null>(null);
  // Count of AI turns that have landed while we were in the *current* phase.
  // Used both for auto-advance heuristic and to tell the server.
  const turnsInPhaseRef = useRef<number>(0);
  // Set once when the user sees the [done] goodbye so we can show the report.
  const [showLessonReport, setShowLessonReport] = useState(false);
  // Lesson-end metrics — accumulated during the session.
  const lessonMetricsRef = useRef<{
    startedAt: number;
    correctionCount: number;
    userTurnCount: number;
    corrections: { errorKey?: string; original: string; corrected: string }[];
  }>({ startedAt: Date.now(), correctionCount: 0, userTurnCount: 0, corrections: [] });

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
    let cancelled = false;

    const id = "greeting";

    // ── STEP 1: Show static greeting IMMEDIATELY (proven, never fails) ──────
    const timer = setTimeout(() => {
      if (cancelled) return;
      setMessages([{ id, text: tutor.greeting, isUser: false, isLessonOpening: true }]);
      conversationHistoryRef.current = [{ role: "assistant", content: tutor.greeting }];
      speakMsg(tutor.greeting, id, false);
    }, 400);

    // ── STEP 2: In parallel, fetch today's lesson + API-driven greeting,
    //           then UPGRADE the greeting if server responds in time. ─────────
    (async () => {
      const learnLangRaw = (learningLanguage ?? tutor.language ?? "english").toLowerCase();
      const learnKey: "ko" | "en" | "es" =
        learnLangRaw === "korean" ? "ko" :
        learnLangRaw === "spanish" ? "es" : "en";
      const nativeKey: "ko" | "en" | "es" =
        userNativeLang === "korean" ? "ko" :
        userNativeLang === "spanish" ? "es" : "en";

      // ── Load learner profile (for summary injection + diagnosis trigger) ──
      let profile: LearnerProfile | null = null;
      let needsDiagnosis = false;
      let learnerSummary = "";
      try {
        // Back-compat: if the user already has XP/stats, skip intake.
        await seedDiagnosedIfExistingUser();
        profile = await loadLearnerProfile();
        learnerProfileRef.current = profile;
        needsDiagnosis = !profile.diagnosed;
        needsDiagnosisRef.current = needsDiagnosis;
        learnerSummary = buildLearnerSummary(profile, learnLangRaw);
      } catch (e) {
        console.warn('[ChatRoom] loadLearnerProfile failed:', e);
      }

      // ── Phase 4: bump per-tutor session count + build memory summary ──
      try {
        const mem = await bumpTutorSession(tutor.id);
        if (!cancelled) setTutorTier(mem.tier);
        // Reload profile after bump so memory summary reflects new count.
        const refreshed = await loadLearnerProfile();
        learnerProfileRef.current = refreshed;
        tutorMemorySummaryRef.current = buildTutorMemorySummary(refreshed, tutor.id, nativeKey);
      } catch (e) {
        console.warn('[ChatRoom] bumpTutorSession failed:', e);
      }

      // ── Phase 3: start the lesson arc as soon as we know it's NOT diagnosis.
      // Doing this BEFORE the API fetch means the stepper shows + sendMessage
      // sends lessonPhase even if the API-driven opening fails.
      if (!needsDiagnosis && !cancelled) {
        setLessonPhase("connect");
        turnsInPhaseRef.current = 0;  // greeting itself does NOT count as a learner turn
        lessonMetricsRef.current = {
          startedAt: Date.now(),
          correctionCount: 0,
          userTurnCount: 0,
          corrections: [],
        };
        // Phase 4: reset per-lesson refs so stale data from a previous in-memory
        // session (component kept mounted across navigations) can't leak.
        sessionSummaryRef.current = null;
      }

      let lessonTopicLearn: string | null = null;
      let lessonTopicNative: string | null = null;
      let dayNumber: number | null = null;
      try {
        const progress = await loadProgress();
        const unit = UNITS[progress.currentUnitIndex] ?? UNITS[0];
        const day = unit?.days[progress.currentDayIndex] ?? unit?.days[0] ?? UNITS[0]?.days[0];
        if (day?.topic) {
          lessonTopicLearn = day.topic[learnKey] ?? day.topic.en ?? null;
          lessonTopicNative = day.topic[nativeKey] ?? day.topic.en ?? lessonTopicLearn;
          dayNumber = day.dayNumber ?? null;
        }
      } catch (e) {
        console.warn('[ChatRoom] loadProgress for lesson topic failed:', e);
      }

      lessonTopicRef.current = lessonTopicLearn;
      lessonTopicNativeRef.current = lessonTopicNative;
      lessonDayNumberRef.current = dayNumber;

      // Fetch server-generated lesson-proposing greeting
      try {
        const apiUrl = new URL("/api/chat", getApiUrl()).toString();
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tutorId: tutor.id,
            messages: [],
            mode,
            lessonTopic: lessonTopicLearn ?? undefined,
            nativeLang: nativeKey,
            isOpening: true,
            // Phase 1
            learnerSummary: learnerSummary || undefined,
            needsDiagnosis: needsDiagnosis || undefined,
            // Phase 4
            tutorMemorySummary: tutorMemorySummaryRef.current || undefined,
          }),
        });
        if (cancelled) return;
        if (!res.ok) return;
        const data = await res.json();
        const reply: string = (typeof data?.reply === "string" && data.reply.trim()) ? data.reply : "";
        if (!reply || cancelled) return;
        // Upgrade the existing static greeting with the API-generated one.
        setMessages([{
          id, text: reply, isUser: false,
          isLessonOpening: !needsDiagnosis,   // diagnosis opening is not a "lesson start"
          lessonDayNumber: needsDiagnosis ? undefined : (dayNumber ?? undefined),
          lessonTopicLabel: needsDiagnosis ? undefined : (lessonTopicNative ?? undefined),
        }]);
        conversationHistoryRef.current = [{ role: "assistant", content: reply }];
        // Phase 3 lessonPhase already set above (before fetch) so the arc
        // works even on API failure/fallback paths. Nothing else to do here.
        if (cancelled) return;
        speakMsg(reply, id, false);
      } catch (e) {
        console.warn('[ChatRoom] API-driven opening failed, keeping static greeting:', e);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      // Belt-and-suspenders: explicitly stop any in-flight TTS the moment the
      // screen leaves, even if the other unmount cleanup runs later.
      stopSpeech();
    };
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

  /** Native subtitle — uses estimated wpm because expo-av on native does not
   *  expose reliable playback-position callbacks for word-sync. */
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
      // Azure via fetch — no gesture lock on blob playback.
      // Word highlights start inside onPlaybackStart (audio.onplay) using the
      // real audio duration, so they stay perfectly in sync.
      azureWebPlay(
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
      // Native: Azure TTS via expo-av — proper female/male voices per tutor
      startNativeSubtitle(ttsText, rate);
      azureNativePlay(
        ttsText,
        tutor.id,
        getApiUrl(),
        rate,
        () => setLoadingAudioId(msgId),
        onEnd,
      );
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
    if (isRecording || speakingId) return;
    // Stop any active TTS before recording to avoid iOS audio session conflicts
    stopSpeech();
    clearSubtitle();
    setSpeakingId(null);
    setLoadingAudioId(null);
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
    sessionXpRef.current += 5;
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
      const nativeKey: "ko" | "en" | "es" =
        userNativeLang === "korean" ? "ko" :
        userNativeLang === "spanish" ? "es" : "en";
      const learnLangRaw = (learningLanguage ?? tutor.language ?? "english").toLowerCase();
      // Always load the freshest profile so burst-sends use up-to-date error
      // patterns / level / interests rather than a stale ref from last turn.
      let freshProfile: LearnerProfile | null = learnerProfileRef.current;
      try {
        freshProfile = await loadLearnerProfile();
        learnerProfileRef.current = freshProfile;
        // Keep diagnosis ref in sync with the stored profile in case another
        // surface flipped it (e.g., settings screen in a future phase).
        needsDiagnosisRef.current = !freshProfile.diagnosed;
      } catch (e) {
        console.warn('[ChatRoom] loadLearnerProfile (sendMessage) failed:', e);
      }
      const learnerSummary = freshProfile
        ? buildLearnerSummary(freshProfile, learnLangRaw)
        : "";
      const apiUrl = new URL("/api/chat", getApiUrl()).toString();
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: tutor.id,
          messages: conversationHistoryRef.current,
          mode,
          lessonTopic: lessonTopicRef.current ?? undefined,
          nativeLang: nativeKey,
          isOpening: false,
          // Phase 1
          learnerSummary: learnerSummary || undefined,
          needsDiagnosis: needsDiagnosisRef.current || undefined,
          // Phase 3 — after "done" stop injecting the goodbye instruction so
          // the user can keep chatting freely with the tutor.
          lessonPhase: lessonPhase && lessonPhase !== "done" ? lessonPhase : undefined,
          turnsInPhase: typeof turnsInPhaseRef.current === "number" && turnsInPhaseRef.current > 0
            ? turnsInPhaseRef.current
            : undefined,
          // Phase 4 — relationship memory + (on the reflect turn) ask the AI
          // to emit a [SESSION_SUMMARY] metadata block we can persist.
          tutorMemorySummary: tutorMemorySummaryRef.current || undefined,
          requestSessionSummary: (lessonPhase === "reflect") || undefined,
        }),
      });

      const data = await res.json();
      const responseText: string = res.ok
        ? (data.reply ?? "...")
        : (tutor.responses[Math.floor(Math.random() * tutor.responses.length)]);

      // ── Attach correction (if any) to the user message that contained the mistake ──
      const correction = (res.ok && data?.correction && typeof data.correction === "object")
        ? data.correction as Correction & { errorKey?: string }
        : null;
      if (correction && correction.original && correction.corrected && correction.explanation) {
        setMessages((prev) =>
          prev.map((m) => m.id === userMsg.id ? { ...m, correction } : m)
        );
        // Phase 1b: persist the error pattern so future turns can reference it.
        if (correction.errorKey) {
          recordErrorPattern({
            learningLang: learnLangRaw,
            key: correction.errorKey,
            original: correction.original,
            corrected: correction.corrected,
          }).then(() => loadLearnerProfile()).then((p) => {
            learnerProfileRef.current = p;
          }).catch((e) => console.warn('[ChatRoom] recordErrorPattern failed:', e));
        }
      }

      // ── Phase 4: capture [SESSION_SUMMARY] from the reflect-turn reply ──
      if (res.ok && data?.sessionSummary && typeof data.sessionSummary === "object") {
        sessionSummaryRef.current = {
          highlight: typeof data.sessionSummary.highlight === "string" ? data.sessionSummary.highlight : undefined,
          focusNextTime: typeof data.sessionSummary.focusNextTime === "string" ? data.sessionSummary.focusNextTime : undefined,
        };
      }

      // ── Handle [DIAGNOSIS] metadata from first-session intake ──
      if (res.ok && data?.diagnosis && typeof data.diagnosis === "object") {
        // Flip the ref SYNCHRONOUSLY so any follow-up send within this session
        // doesn't re-trigger the intake prompt before the async persist lands.
        needsDiagnosisRef.current = false;
        const d = data.diagnosis;
        const levelUpdate: Record<string, CefrLevel> = {};
        if (isValidCefrLevel(d.level)) {
          levelUpdate[learnLangRaw] = d.level;
        }
        const validGoals: LearningGoal[] | undefined = Array.isArray(d.goals)
          ? d.goals.filter((g: unknown): g is LearningGoal =>
              typeof g === "string" &&
              ["travel", "work", "study", "hobby", "relationship", "exam", "unknown"].includes(g))
          : undefined;
        markDiagnosed({
          level: levelUpdate,
          goals: validGoals,
          interests: Array.isArray(d.interests) ? d.interests.filter((g: unknown): g is string => typeof g === "string") : undefined,
          occupation: typeof d.occupation === "string" ? d.occupation : undefined,
          country: typeof d.country === "string" ? d.country : undefined,
          motivationText: typeof d.motivationText === "string" ? d.motivationText : undefined,
        }).then(() => loadLearnerProfile()).then((p) => {
          learnerProfileRef.current = p;
        }).catch((e) => console.warn('[ChatRoom] markDiagnosed failed:', e));
      }

      const aiId = Date.now().toString() + "a";
      const aiMsg: Message = { id: aiId, text: responseText, isUser: false };
      conversationHistoryRef.current = [
        ...conversationHistoryRef.current,
        { role: "assistant", content: responseText },
      ];
      setMessages((prev) => [aiMsg, ...prev]);

      // ── Phase 3: advance lesson-arc bookkeeping ─────────────────────────
      lessonMetricsRef.current.userTurnCount += 1;
      // Only count elicit + mini_lesson in the "corrections" stat shown to the
      // user — recast is designed to be invisible/gentle, so including it
      // contradicts the pedagogy and would inflate the perceived mistake count.
      if (correction && correction.strategy !== "recast") {
        lessonMetricsRef.current.correctionCount += 1;
        lessonMetricsRef.current.corrections.push({
          errorKey: correction.errorKey,
          original: correction.original,
          corrected: correction.corrected,
        });
      }
      if (lessonPhase && lessonPhase !== "done") {
        turnsInPhaseRef.current = (turnsInPhaseRef.current ?? 0) + 1;
        const serverWantsAdvance = !!(data?.phaseAdvance && typeof data.phaseAdvance === "object");
        const autoAdvance = shouldAutoAdvance(lessonPhase, turnsInPhaseRef.current);
        if (serverWantsAdvance || autoAdvance) {
          const np = nextPhase(lessonPhase);
          setLessonPhase(np);
          turnsInPhaseRef.current = 0;
          if (np === "done") {
            // Persist the session summary IMMEDIATELY so it survives any exit
            // path (force-quit, swipe-back, app kill) — not just modal Back.
            if (tutor) {
              const todayIso = new Date().toISOString().slice(0, 10);
              recordSessionSummary(tutor.id, {
                date: todayIso,
                topic: lessonTopicRef.current,
                highlight: sessionSummaryRef.current?.highlight ?? null,
                focusNextTime: sessionSummaryRef.current?.focusNextTime ?? null,
                minutesSpent: Math.max(1, Math.round((Date.now() - lessonMetricsRef.current.startedAt) / 60000)),
                correctionsMade: lessonMetricsRef.current.correctionCount,
              }).catch((e) => console.warn('[ChatRoom] recordSessionSummary (auto) failed:', e));
            }
            // Wait for TTS of the farewell to finish before showing the report.
            const estimatedMs = Math.min(10000, Math.max(2500, responseText.length * 80));
            setTimeout(() => setShowLessonReport(true), estimatedMs);
          }
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speakMsg(responseText, aiId, muted);
      inputRef.current?.focus();
    } catch (e) {
      console.warn('[ChatRoom] Chat API request failed:', e);
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

    // ── Trilingual labels for lesson badge + correction sub-bubble ────────────
    const TODAY_LABEL = userNativeLang === "korean" ? "오늘의 레슨"
                       : userNativeLang === "spanish" ? "Lección de hoy"
                       : "Today's Lesson";
    const DAY_LABEL = (n: number) => userNativeLang === "korean" ? `Day ${n}`
                                    : userNativeLang === "spanish" ? `Día ${n}`
                                    : `Day ${n}`;
    const FIX_LABEL = userNativeLang === "korean" ? "교정"
                     : userNativeLang === "spanish" ? "Corrección"
                     : "Correction";
    const EXPLAIN_LABEL = userNativeLang === "korean" ? "설명"
                         : userNativeLang === "spanish" ? "Explicación"
                         : "Why";
    // Phase 2: strategy-specific labels
    const RECAST_LABEL = userNativeLang === "korean" ? "자연스러운 교정"
                         : userNativeLang === "spanish" ? "Corrección natural"
                         : "Gentle reminder";
    const ELICIT_LABEL = userNativeLang === "korean" ? "스스로 고쳐보기"
                         : userNativeLang === "spanish" ? "Intenta corregirlo"
                         : "Try it yourself";
    const MINI_LESSON_LABEL = userNativeLang === "korean" ? "자세한 설명"
                         : userNativeLang === "spanish" ? "Explicación detallada"
                         : "Mini-lesson";

    return (
      <View style={[styles.msgRow, item.isUser ? styles.msgRowUser : styles.msgRowAI]}>
        {!item.isUser && tutor && (
          <View style={styles.tutorAvatar}>
            <Image source={TUTOR_IMAGES[tutor.id]} style={styles.tutorAvatarImg} />
          </View>
        )}

        <View style={styles.bubbleColumn}>
          {/* Lesson opening badge — first AI bubble only */}
          {!item.isUser && item.isLessonOpening && item.lessonDayNumber && item.lessonTopicLabel && (
            <View style={styles.lessonBadge}>
              <Ionicons name="bookmark" size={11} color={C.gold} />
              <Text style={styles.lessonBadgeText}>
                {TODAY_LABEL} · {DAY_LABEL(item.lessonDayNumber)} · {item.lessonTopicLabel}
              </Text>
            </View>
          )}

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

          {/* Correction sub-bubble — rendering strategy depends on correction.strategy */}
          {item.isUser && item.correction && (() => {
            const c = item.correction!;
            const strat: CorrectionStrategy = c.strategy ?? "mini_lesson";  // default = explicit

            // RECAST: soft collapsible. Collapsed state shows ONLY a gentle
            // reminder label — preserving recast pedagogy (the AI's reply already
            // modelled the correct form). Expanding reveals corrected + why.
            if (strat === "recast") {
              const expanded = expandedCorrectionIds.has(item.id);
              return (
                <Pressable
                  style={({ pressed }) => [styles.correctionRecast, pressed && { opacity: 0.85 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedCorrectionIds((prev) => {
                      const n = new Set(prev);
                      if (n.has(item.id)) n.delete(item.id);
                      else n.add(item.id);
                      return n;
                    });
                  }}
                >
                  <View style={styles.correctionRecastHeader}>
                    <Text style={styles.correctionRecastIcon}>💬</Text>
                    <Text style={styles.correctionRecastLabel}>{RECAST_LABEL}</Text>
                    <View style={{ flex: 1 }} />
                    <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={14} color={C.goldDim} />
                  </View>
                  {expanded && (
                    <>
                      <Text style={styles.correctionRecastFixedExpanded}>✅ {c.corrected}</Text>
                      <Text style={styles.correctionRecastExplain}>{c.explanation}</Text>
                    </>
                  )}
                </Pressable>
              );
            }

            // ELICIT: prominent hint chip; learner taps to reveal the corrected
            // form, can toggle it hidden again to retry mentally.
            if (strat === "elicit") {
              const revealed = expandedCorrectionIds.has(item.id);
              const REVEAL_SHOW = userNativeLang === "korean" ? "정답 보기" : userNativeLang === "spanish" ? "Ver respuesta" : "Reveal answer";
              const REVEAL_HIDE = userNativeLang === "korean" ? "정답 숨기기" : userNativeLang === "spanish" ? "Ocultar respuesta" : "Hide answer";
              return (
                <View style={styles.correctionElicit}>
                  <View style={styles.correctionHeader}>
                    <Text style={styles.correctionHeaderIcon}>🤔</Text>
                    <Text style={[styles.correctionHeaderText, { color: "#E5A940" }]}>{ELICIT_LABEL}</Text>
                  </View>
                  <Text style={styles.correctionElicitHint}>{c.explanation}</Text>
                  {revealed && (
                    <Text style={styles.correctionElicitReveal}>✅ {c.corrected}</Text>
                  )}
                  <Pressable
                    style={({ pressed }) => [styles.correctionRevealBtn, pressed && { opacity: 0.8 }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExpandedCorrectionIds((prev) => {
                        const n = new Set(prev);
                        if (n.has(item.id)) n.delete(item.id);
                        else n.add(item.id);
                        return n;
                      });
                    }}
                  >
                    <Ionicons name={revealed ? "eye-off-outline" : "eye-outline"} size={12} color={C.goldDim} />
                    <Text style={styles.correctionRevealText}>
                      {revealed ? REVEAL_HIDE : REVEAL_SHOW}
                    </Text>
                  </Pressable>
                </View>
              );
            }

            // MINI_LESSON: full expanded card — the original 3-line layout with emphasized header.
            return (
              <View style={styles.correctionMiniLesson}>
                <View style={styles.correctionHeader}>
                  <Text style={styles.correctionHeaderIcon}>📚</Text>
                  <Text style={[styles.correctionHeaderText, { color: "#C47A7A" }]}>{MINI_LESSON_LABEL}</Text>
                </View>
                <View style={styles.correctionRow}>
                  <Text style={styles.correctionMark}>❌</Text>
                  <Text style={styles.correctionOriginal}>{c.original}</Text>
                </View>
                <View style={styles.correctionRow}>
                  <Text style={styles.correctionMark}>✅</Text>
                  <Text style={styles.correctionFixed}>{c.corrected}</Text>
                </View>
                <View style={styles.correctionExplainRow}>
                  <Text style={styles.correctionMark}>💡</Text>
                  <Text style={styles.correctionExplain}>
                    <Text style={styles.correctionExplainLabel}>{EXPLAIN_LABEL}: </Text>
                    {c.explanation}
                  </Text>
                </View>
              </View>
            );
          })()}

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
        <Text style={{ fontFamily: F.body, color: C.goldDim }}>
          {userNativeLang === "korean" ? "튜터를 찾을 수 없어요" : userNativeLang === "spanish" ? "Tutor no encontrado" : "Tutor not found"}
        </Text>
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
            {/* Phase 4: relationship tier badge — only once beyond stranger */}
            {tutorTier !== "stranger" && (
              <View style={styles.tierBadge}>
                <Text style={styles.tierBadgeText}>
                  {tutorTier === "intimate"
                    ? (userNativeLang === "korean" ? "💛 절친" : userNativeLang === "spanish" ? "💛 Íntimo" : "💛 Close friend")
                    : tutorTier === "close"
                    ? (userNativeLang === "korean" ? "🤝 친해짐" : userNativeLang === "spanish" ? "🤝 Cercanos" : "🤝 Close")
                    : (userNativeLang === "korean" ? "👋 아는 사이" : userNativeLang === "spanish" ? "👋 Conocidos" : "👋 Familiar")}
                </Text>
              </View>
            )}
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

      {/* Phase 3: Lesson Arc stepper — hidden during diagnosis */}
      {lessonPhase && !needsDiagnosisRef.current && (
        <View style={styles.phaseStepperRow}>
          {LESSON_PHASE_ORDER.map((p, i) => {
            const currentIdx = LESSON_PHASE_ORDER.indexOf(lessonPhase);
            const doneState =
              lessonPhase === "done" ? "done" :
              i < currentIdx ? "done" :
              i === currentIdx ? "current" :
              "upcoming";
            return (
              <View key={p} style={styles.phaseStep}>
                <View
                  style={[
                    styles.phaseDot,
                    doneState === "done" && styles.phaseDotDone,
                    doneState === "current" && styles.phaseDotCurrent,
                  ]}
                />
                <Text
                  style={[
                    styles.phaseStepText,
                    doneState === "current" && { color: C.gold, fontFamily: F.bodySemi },
                  ]}
                >
                  {phaseLabel(p, userNativeLang)}
                </Text>
                {i < LESSON_PHASE_ORDER.length - 1 && (
                  <View
                    style={[
                      styles.phaseConnector,
                      doneState === "done" && styles.phaseConnectorDone,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      )}

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


      {/* Phase 3: Lesson completion report modal */}
      <Modal
        visible={showLessonReport}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLessonReport(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.lessonReportCard}>
            <Text style={styles.lessonReportEmoji}>🎓</Text>
            <Text style={styles.lessonReportTitle}>
              {userNativeLang === "korean"
                ? "오늘의 수업 완료!"
                : userNativeLang === "spanish"
                ? "¡Lección completada!"
                : "Lesson complete!"}
            </Text>
            {lessonTopicNativeRef.current && (
              <Text style={styles.lessonReportTopic}>
                {userNativeLang === "korean" ? "주제: " : userNativeLang === "spanish" ? "Tema: " : "Topic: "}
                {lessonTopicNativeRef.current}
              </Text>
            )}
            <View style={styles.lessonReportStatsRow}>
              <View style={styles.lessonReportStat}>
                <Text style={styles.lessonReportStatNum}>{lessonMetricsRef.current.userTurnCount}</Text>
                <Text style={styles.lessonReportStatLabel}>
                  {userNativeLang === "korean" ? "주고받은 대화"
                    : userNativeLang === "spanish" ? "Intercambios"
                    : "Exchanges"}
                </Text>
              </View>
              <View style={styles.lessonReportStat}>
                <Text style={styles.lessonReportStatNum}>{lessonMetricsRef.current.correctionCount}</Text>
                <Text style={styles.lessonReportStatLabel}>
                  {userNativeLang === "korean" ? "교정 받음"
                    : userNativeLang === "spanish" ? "Correcciones"
                    : "Corrections"}
                </Text>
              </View>
              <View style={styles.lessonReportStat}>
                <Text style={styles.lessonReportStatNum}>
                  {Math.max(1, Math.round((Date.now() - lessonMetricsRef.current.startedAt) / 60000))}
                </Text>
                <Text style={styles.lessonReportStatLabel}>
                  {userNativeLang === "korean" ? "분" : userNativeLang === "spanish" ? "min" : "min"}
                </Text>
              </View>
            </View>
            {/* Phase 4: AI-generated strength highlight */}
            {sessionSummaryRef.current?.highlight && (
              <View style={[styles.lessonReportSection, { backgroundColor: "rgba(122,196,136,0.1)", borderColor: "rgba(122,196,136,0.3)" }]}>
                <Text style={styles.lessonReportSectionTitle}>
                  {userNativeLang === "korean" ? "✨ 오늘의 잘한 점"
                    : userNativeLang === "spanish" ? "✨ Lo que hiciste bien"
                    : "✨ What you did well"}
                </Text>
                <Text style={styles.lessonReportItem}>{sessionSummaryRef.current.highlight}</Text>
              </View>
            )}

            {/* Phase 4: AI-generated focus-next-time advice (from reflect turn) */}
            {sessionSummaryRef.current?.focusNextTime && (
              <View style={styles.lessonReportSection}>
                <Text style={styles.lessonReportSectionTitle}>
                  {userNativeLang === "korean" ? "🎯 다음에 주목할 점"
                    : userNativeLang === "spanish" ? "🎯 A trabajar la próxima vez"
                    : "🎯 Focus for next time"}
                </Text>
                <Text style={styles.lessonReportItem}>{sessionSummaryRef.current.focusNextTime}</Text>
              </View>
            )}

            {/* Fallback: show top-3 corrections when the AI didn't provide a summary */}
            {!sessionSummaryRef.current?.focusNextTime && lessonMetricsRef.current.corrections.length > 0 && (
              <View style={styles.lessonReportSection}>
                <Text style={styles.lessonReportSectionTitle}>
                  {userNativeLang === "korean" ? "🎯 다음에 주목할 점"
                    : userNativeLang === "spanish" ? "🎯 A trabajar la próxima vez"
                    : "🎯 Focus for next time"}
                </Text>
                {lessonMetricsRef.current.corrections.slice(0, 3).map((c, i) => (
                  <Text key={i} style={styles.lessonReportItem}>
                    • {c.original} → <Text style={{ color: "#7AC488" }}>{c.corrected}</Text>
                  </Text>
                ))}
              </View>
            )}
            <Pressable
              style={({ pressed }) => [styles.lessonReportBtn, pressed && { opacity: 0.85 }]}
              onPress={() => {
                // Summary already persisted when phase transitioned to "done".
                stopSpeech();
                setShowLessonReport(false);
                router.back();
              }}
            >
              <LinearGradient colors={[C.gold, C.goldDark]} style={StyleSheet.absoluteFill} />
              <Text style={styles.lessonReportBtnText}>
                {userNativeLang === "korean" ? "돌아가기"
                  : userNativeLang === "spanish" ? "Volver"
                  : "Back home"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
                disabled={isRecording || isTyping || !!speakingId}
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

  // ── Lesson opening badge (above first AI bubble) ──────────────────────────
  lessonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(201,162,39,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.3)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  lessonBadgeText: {
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: C.gold,
    letterSpacing: 0.3,
  },

  // ── Correction sub-bubble (below user message that had a mistake) ─────────
  correctionBubble: {
    alignSelf: "flex-end",
    maxWidth: "92%",
    marginTop: 4,
    backgroundColor: "rgba(196,122,122,0.08)",
    borderWidth: 1,
    borderColor: "rgba(196,122,122,0.25)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  correctionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingBottom: 4,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(196,122,122,0.18)",
  },
  correctionHeaderIcon: { fontSize: 12 },
  correctionHeaderText: {
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: "#C47A7A",
    letterSpacing: 0.4,
  },
  correctionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  correctionExplainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 2,
  },
  correctionMark: { fontSize: 12, marginTop: 1 },
  correctionOriginal: {
    flex: 1,
    fontSize: 13,
    fontFamily: F.body,
    color: "#C47A7A",
    textDecorationLine: "line-through",
    lineHeight: 18,
  },
  correctionFixed: {
    flex: 1,
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: "#7AC488",
    lineHeight: 18,
  },
  correctionExplain: {
    flex: 1,
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    lineHeight: 17,
    fontStyle: "italic",
  },
  correctionExplainLabel: {
    fontFamily: F.bodySemi,
    color: C.gold,
    fontStyle: "normal",
  },

  // ── Phase 2: Strategy-specific correction UIs ─────────────────────────────
  // RECAST: soft, collapsible, minimal visual weight (1st-time error).
  correctionRecast: {
    alignSelf: "flex-end",
    maxWidth: "92%",
    marginTop: 3,
    backgroundColor: "rgba(201,162,39,0.06)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  correctionRecastHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  correctionRecastIcon: { fontSize: 11, opacity: 0.8 },
  correctionRecastLabel: {
    fontSize: 10,
    fontFamily: F.bodySemi,
    color: C.goldDim,
    letterSpacing: 0.3,
  },
  correctionRecastFixed: {
    flex: 1,
    fontSize: 12,
    fontFamily: F.body,
    color: "#7AC488",
    marginLeft: 2,
  },
  // Shown ONLY when the recast chip is expanded (keeps collapsed state hint-like).
  correctionRecastFixedExpanded: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: "#7AC488",
    lineHeight: 18,
  },
  correctionRecastExplain: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
    lineHeight: 16,
  },

  // ELICIT: amber/warning accent; learner must reveal answer.
  correctionElicit: {
    alignSelf: "flex-end",
    maxWidth: "92%",
    marginTop: 4,
    backgroundColor: "rgba(229,169,64,0.1)",
    borderWidth: 1,
    borderColor: "rgba(229,169,64,0.35)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  correctionElicitHint: {
    fontSize: 13,
    fontFamily: F.body,
    color: "#E5A940",
    lineHeight: 18,
  },
  correctionElicitReveal: {
    fontSize: 14,
    fontFamily: F.bodySemi,
    color: "#7AC488",
    lineHeight: 20,
  },
  correctionRevealBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(201,162,39,0.12)",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 2,
  },
  correctionRevealText: {
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: C.goldDim,
  },

  // MINI_LESSON: prominent card, extra lesson-like framing (4+ occurrences).
  correctionMiniLesson: {
    alignSelf: "flex-end",
    maxWidth: "92%",
    marginTop: 4,
    backgroundColor: "rgba(196,122,122,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(196,122,122,0.35)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 5,
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

  // ── Phase 4: Tutor relationship tier badge (in header) ────────────────────
  tierBadge: {
    backgroundColor: "rgba(201,162,39,0.15)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.35)",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tierBadgeText: {
    fontSize: 10,
    fontFamily: F.bodySemi,
    color: C.gold,
    letterSpacing: 0.3,
  },

  // ── Phase 3: Lesson Arc stepper ───────────────────────────────────────────
  phaseStepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  phaseStep: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.goldDark,
    marginRight: 5,
  },
  phaseDotDone: { backgroundColor: C.gold },
  phaseDotCurrent: {
    backgroundColor: C.gold,
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: C.gold,
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  phaseStepText: {
    fontSize: 10,
    fontFamily: F.body,
    color: C.goldDim,
    letterSpacing: 0.3,
  },
  phaseConnector: {
    flex: 1,
    height: 1,
    backgroundColor: C.goldDark,
    marginHorizontal: 5,
    opacity: 0.5,
  },
  phaseConnectorDone: { backgroundColor: C.gold, opacity: 1 },

  // ── Phase 3: Lesson report modal ─────────────────────────────────────────
  lessonReportCard: {
    width: "88%",
    maxWidth: 420,
    backgroundColor: C.bg2,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 22,
    alignItems: "center",
  },
  lessonReportEmoji: { fontSize: 44, marginBottom: 6 },
  lessonReportTitle: {
    fontSize: 20,
    fontFamily: F.header,
    color: C.gold,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  lessonReportTopic: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
    marginTop: 4,
    textAlign: "center",
  },
  lessonReportStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 18,
    gap: 8,
  },
  lessonReportStat: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(201,162,39,0.1)",
    borderWidth: 1,
    borderColor: C.border,
  },
  lessonReportStatNum: {
    fontSize: 22,
    fontFamily: F.bodyBold,
    color: C.gold,
  },
  lessonReportStatLabel: {
    fontSize: 10,
    fontFamily: F.body,
    color: C.goldDim,
    marginTop: 2,
    textAlign: "center",
  },
  lessonReportSection: {
    width: "100%",
    marginBottom: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "rgba(196,122,122,0.08)",
    borderWidth: 1,
    borderColor: "rgba(196,122,122,0.25)",
    gap: 4,
  },
  lessonReportSectionTitle: {
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: C.parchment,
    marginBottom: 4,
  },
  lessonReportItem: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    lineHeight: 18,
  },
  lessonReportBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
  },
  lessonReportBtnText: {
    fontSize: 14,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 1,
  },
});
