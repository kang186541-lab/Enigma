// Onboarding (post-redesign): 7-step flow that delivers the brand promise
// — "Rudy와 5분, 첫 문장을 입 밖으로" — inside the first ten minutes.
//
// Steps:
//   1) Native language pick
//   2) Learning language pick
//   3) Goal pick (drama / travel / friendship / work_study)
//   4) Goal-branched first-sentence reveal (audible TTS via /api/pronunciation-tts)
//   5) First microphone utterance (8-second auto-stop, /api/pronunciation-assess)
//   6) Score + Rudy reaction (1-sentence comment via /api/pronunciation-coach,
//      with a deterministic warm fallback so the user always sees a kind line)
//   7) Sign-in invite (Google + magic link + "Maybe later")
//
// Constraints carried over from prior versions:
//   - All copy switches on nativeLanguage (ko / en / es).
//   - Step 5 must not block on permissions — mic-denied path shows a clear
//     message plus a "Skip for now" link.
//   - Step 6 must always show SOMETHING positive. score=0 or no voice still
//     surfaces Rudy's "한 번 더 해볼까요?" deterministic comment.
//   - TypeScript strict.
//
// Only this file may be edited — all helpers / endpoints already exist.

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { useLanguage, NativeLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { markGuideComplete } from "@/components/RudyGuideModal";
import { trackLearningEvent } from "@/lib/learningEvents";
import { setPrimaryLearningGoal, type LearningGoal } from "@/lib/learnerProfile";
import { getApiUrl } from "@/lib/query-client";
import { apiFetchWithAuth } from "@/lib/apiFetchWithAuth";
import { CoachingCard } from "@/components/rudy/CoachingCard";

const rudySplashImg = require("@/assets/rudy_splash.png");
const { width: SCREEN_W } = Dimensions.get("window");
const SPLASH_SIZE = Math.min(SCREEN_W - 48, 260);
const RECORD_MAX_SEC = 8;

// ── Types ───────────────────────────────────────────────────────────────────
// Steps run 1 → 7 in order; back/skip controls move you through this list.
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Onboarding-local goal keys. We map these onto the canonical LearningGoal
// enum at save time so existing prompt-shaping code keeps working.
type OnboardingGoal = "drama" | "travel" | "friendship" | "work_study";

const ONBOARDING_GOAL_TO_LEARNING_GOAL: Record<OnboardingGoal, LearningGoal> = {
  drama: "hobby",         // "Things you love" bucket already shaped for K-drama / shows.
  travel: "travel",
  friendship: "relationship",
  work_study: "work",     // We collapse work + study onto "work" — the closest LearningGoal.
};

type RecordState = "idle" | "listening" | "processing" | "done";

type PronunciationAssessResponse = {
  success?: boolean;
  score?: number;
  accuracyScore?: number;
  fluencyScore?: number;
  completenessScore?: number;
  feedback?: string;
  recognizedText?: string;
  words?: { word: string; score: number; errorType: string; phonemes?: { phoneme: string; score: number }[] }[];
};

// ── Goal-branched first sentence table ─────────────────────────────────────
// Each goal maps to a target-language sentence we actually want them to say
// in step 4, plus a per-native-language subtitle that explains why that
// sentence matters for that goal.
//
// Test inputs (mental walk-through):
//   learning="korean", goal="drama" → phrase "안녕하세요", subtitle.korean "K-드라마에서..."
//   learning="english", goal="travel" → phrase "How much is this?", subtitle.korean "여행 중..."
//   learning="spanish", goal="friendship" → phrase "Encantado de conocerte",
//     subtitle.spanish "Para alguien que acabas de conocer"

type SentenceRow = {
  phrase: string;       // target-language utterance — what the user says out loud
  speechLang: string;   // BCP-47 for Azure / TTS
  subtitle: Record<NativeLanguage, string>;
};

const FIRST_SENTENCE_TABLE: Record<NativeLanguage, Record<OnboardingGoal, SentenceRow>> = {
  // Learning language === "korean"
  korean: {
    drama: {
      phrase: "안녕하세요",
      speechLang: "ko-KR",
      subtitle: {
        korean: "K-드라마에서 가장 자주 듣는 첫 인사",
        english: "The greeting you hear in almost every K-drama scene",
        spanish: "El saludo que escuchas en casi cada escena de K-drama",
      },
    },
    travel: {
      phrase: "이거 얼마예요?",
      speechLang: "ko-KR",
      subtitle: {
        korean: "여행 중 가장 많이 쓰는 한 마디",
        english: "The phrase you'll reach for most while traveling",
        spanish: "La frase que más vas a usar mientras viajas",
      },
    },
    friendship: {
      phrase: "반가워요",
      speechLang: "ko-KR",
      subtitle: {
        korean: "처음 만난 친구에게",
        english: "For a friend you've just met",
        spanish: "Para un amigo que acabas de conocer",
      },
    },
    work_study: {
      phrase: "안녕하세요, 저는 김민준입니다",
      speechLang: "ko-KR",
      subtitle: {
        korean: "회사·학교에서 자기소개",
        english: "Introduce yourself at work or school",
        spanish: "Para presentarte en el trabajo o la escuela",
      },
    },
  },
  // Learning language === "english"
  english: {
    drama: {
      phrase: "Are you serious?",
      speechLang: "en-US",
      subtitle: {
        korean: "영어 드라마에서 가장 자주 나오는 반응",
        english: "The reaction line you'll hear in every English drama",
        spanish: "La reacción que oirás en cada drama en inglés",
      },
    },
    travel: {
      phrase: "How much is this?",
      speechLang: "en-US",
      subtitle: {
        korean: "여행 중 가장 많이 쓰는 한 마디",
        english: "The phrase you'll reach for most while traveling",
        spanish: "La frase que más usarás mientras viajas",
      },
    },
    friendship: {
      phrase: "Nice to meet you",
      speechLang: "en-US",
      subtitle: {
        korean: "처음 만난 친구에게",
        english: "For a friend you've just met",
        spanish: "Para alguien que acabas de conocer",
      },
    },
    work_study: {
      phrase: "Hi, I'm Min — nice to be here",
      speechLang: "en-US",
      subtitle: {
        korean: "회사·학교에서 자기소개",
        english: "Introduce yourself at work or school",
        spanish: "Para presentarte en el trabajo o la escuela",
      },
    },
  },
  // Learning language === "spanish"
  spanish: {
    drama: {
      phrase: "¿En serio?",
      speechLang: "es-ES",
      subtitle: {
        korean: "스페인어 드라마에서 가장 자주 나오는 반응",
        english: "The reaction line you'll hear in every Spanish drama",
        spanish: "La reacción que oirás en cada drama en español",
      },
    },
    travel: {
      phrase: "¿Cuánto cuesta esto?",
      speechLang: "es-ES",
      subtitle: {
        korean: "여행 중 가장 많이 쓰는 한 마디",
        english: "The phrase you'll reach for most while traveling",
        spanish: "La frase que más usarás mientras viajas",
      },
    },
    friendship: {
      phrase: "Encantado de conocerte",
      speechLang: "es-ES",
      subtitle: {
        korean: "처음 만난 친구에게",
        english: "For a friend you've just met",
        spanish: "Para alguien que acabas de conocer",
      },
    },
    work_study: {
      phrase: "Hola, soy Min — un gusto estar aquí",
      speechLang: "es-ES",
      subtitle: {
        korean: "회사·학교에서 자기소개",
        english: "Introduce yourself at work or school",
        spanish: "Para presentarte en el trabajo o la escuela",
      },
    },
  },
};

// Translate the same target sentence back into the native language so the
// learner sees what they're actually about to say in their first language.
const FIRST_SENTENCE_MEANING: Record<NativeLanguage, Record<OnboardingGoal, Record<NativeLanguage, string>>> = {
  korean: {
    drama: { korean: "안녕하세요", english: "Hello", spanish: "Hola" },
    travel: { korean: "이거 얼마예요?", english: "How much is this?", spanish: "¿Cuánto cuesta esto?" },
    friendship: { korean: "반가워요", english: "Nice to meet you", spanish: "Encantado/a" },
    work_study: { korean: "안녕하세요, 저는 김민준입니다", english: "Hi, I'm Min-jun", spanish: "Hola, soy Min-jun" },
  },
  english: {
    drama: { korean: "정말이에요?", english: "Are you serious?", spanish: "¿En serio?" },
    travel: { korean: "이거 얼마예요?", english: "How much is this?", spanish: "¿Cuánto cuesta esto?" },
    friendship: { korean: "만나서 반가워요", english: "Nice to meet you", spanish: "Mucho gusto" },
    work_study: { korean: "안녕하세요, 저는 민입니다", english: "Hi, I'm Min — nice to be here", spanish: "Hola, soy Min" },
  },
  spanish: {
    drama: { korean: "정말이에요?", english: "Are you serious?", spanish: "¿En serio?" },
    travel: { korean: "이거 얼마예요?", english: "How much is this?", spanish: "¿Cuánto cuesta esto?" },
    friendship: { korean: "만나서 반가워요", english: "Nice to meet you", spanish: "Encantado de conocerte" },
    work_study: { korean: "안녕하세요, 저는 민입니다", english: "Hi, I'm Min", spanish: "Hola, soy Min" },
  },
};

// ── Static copy table ──────────────────────────────────────────────────────
const ALL_LANGS: { id: NativeLanguage; badge: string; nameMap: Record<NativeLanguage, string> }[] = [
  { id: "korean",  badge: "KO", nameMap: { korean: "한국어",   english: "Korean",  spanish: "Coreano" } },
  { id: "english", badge: "EN", nameMap: { korean: "영어",     english: "English", spanish: "Inglés"  } },
  { id: "spanish", badge: "ES", nameMap: { korean: "스페인어", english: "Spanish", spanish: "Español" } },
];

const GOAL_OPTIONS: { key: OnboardingGoal; emoji: string; label: Record<NativeLanguage, string> }[] = [
  { key: "drama",       emoji: "🎬", label: { korean: "K-드라마/콘텐츠",     english: "K-dramas / content",       spanish: "K-dramas / contenido"           } },
  { key: "travel",      emoji: "✈️", label: { korean: "여행",                 english: "Travel",                   spanish: "Viajes"                          } },
  { key: "friendship",  emoji: "🤝", label: { korean: "친구·연애·가족",       english: "Friends / dating / family", spanish: "Amistad / pareja / familia"     } },
  { key: "work_study",  emoji: "💼", label: { korean: "일·공부",              english: "Work / school",            spanish: "Trabajo / estudios"             } },
];

const UI: Record<NativeLanguage, {
  step1Title: string; step1Sub: string;
  step2Title: string; step2Sub: string;
  step3Title: string; step3Sub: string;
  step4Title: string; step4Sub: string; step4PressToHear: string;
  step5Title: string; step5Sub: string; step5Tap: string; step5Listening: string; step5Processing: string; step5MicDenied: string; step5SkipNow: string;
  step6Title: string; step6FallbackHigh: string; step6FallbackMid: string; step6FallbackLow: string; step6TryAgain: string; step6Continue: string;
  step7Title: string; step7Body: string; step7Google: string; step7Email: string; step7EmailPh: string; step7EmailCta: string; step7EmailSent: string; step7Skip: string; step7Or: string; step7Err: string;
  back: string; next: string; finish: string;
}> = {
  korean: {
    step1Title: "모국어 선택",
    step1Sub: "더 나은 학습 경험을 위해 모국어를 알려주세요",
    step2Title: "어떤 언어를 배우고 싶으세요?",
    step2Sub: "학습할 언어를 선택하세요",
    step3Title: "어디에서 쓰고 싶어요?",
    step3Sub: "Rudy가 그 상황에 맞춰 첫 문장을 골라줄게요",
    step4Title: "Rudy가 준비한 첫 문장이에요",
    step4Sub: "한 번 듣고 마음의 준비를 해요. 다음 단계에서 입 밖으로 말해요.",
    step4PressToHear: "다시 듣기",
    step5Title: "이제 입 밖으로",
    step5Sub: "마이크를 누르고 들은 그대로 말해요. 8초 안에 한 번이면 충분해요.",
    step5Tap: "마이크 누르고 말하기",
    step5Listening: "루디가 듣고 있어요…",
    step5Processing: "루디가 채점하는 중…",
    step5MicDenied: "마이크 권한이 필요해요. 설정에서 허용한 뒤 다시 시도하거나, 이번엔 건너뛰어도 돼요.",
    step5SkipNow: "이번엔 건너뛸게요",
    step6Title: "잘 들었어요",
    step6FallbackHigh: "정말 자연스러웠어요. 그대로 가요!",
    step6FallbackMid: "거의 다 왔어요. 한 번만 더 입에 익히면 돼요.",
    step6FallbackLow: "괜찮아요, 한 번 더 해볼까요? 처음엔 누구나 그래요.",
    step6TryAgain: "다시 말해보기",
    step6Continue: "다음으로",
    step7Title: "여기까지 만든 진도, 한 번에 저장할까요?",
    step7Body: "한 번 로그인하면 폰을 바꿔도 그대로 이어집니다. 지금은 건너뛰어도 좋아요.",
    step7Google: "Google로 로그인",
    step7Email: "이메일",
    step7EmailPh: "you@example.com",
    step7EmailCta: "이메일로 로그인 링크 받기",
    step7EmailSent: "메일을 확인하고 링크를 누르세요.",
    step7Skip: "나중에 할게요",
    step7Or: "또는",
    step7Err: "오류",
    back: "뒤로",
    next: "다음",
    finish: "Rudy와 시작하기",
  },
  english: {
    step1Title: "Native language?",
    step1Sub: "Choose the language you speak at home",
    step2Title: "What do you want to learn?",
    step2Sub: "Pick the language you'd like to master",
    step3Title: "Where will you actually use it?",
    step3Sub: "Rudy will pick your first sentence around that situation.",
    step4Title: "Here's the first sentence Rudy picked",
    step4Sub: "Listen once and warm up. You'll say it out loud next.",
    step4PressToHear: "Hear it again",
    step5Title: "Now say it out loud",
    step5Sub: "Tap the mic and say it the way you just heard it. Eight seconds is plenty.",
    step5Tap: "Tap to speak",
    step5Listening: "Rudy is listening…",
    step5Processing: "Rudy is scoring…",
    step5MicDenied: "We need mic permission to hear you. Allow it in settings and try again, or skip for now.",
    step5SkipNow: "Skip for now",
    step6Title: "Rudy heard you",
    step6FallbackHigh: "That sounded natural — keep going!",
    step6FallbackMid: "You're close. One more pass and it will stick.",
    step6FallbackLow: "It's okay — let's give it one more try. Everyone starts here.",
    step6TryAgain: "Try once more",
    step6Continue: "Continue",
    step7Title: "Want to save the progress you just made?",
    step7Body: "One quick sign-in and your XP, streak, and Rudy memory follow you to any device. Totally fine to skip.",
    step7Google: "Sign in with Google",
    step7Email: "Email",
    step7EmailPh: "you@example.com",
    step7EmailCta: "Send me a magic link",
    step7EmailSent: "Check your email and tap the link.",
    step7Skip: "Maybe later",
    step7Or: "or",
    step7Err: "Error",
    back: "Back",
    next: "Next",
    finish: "Start with Rudy",
  },
  spanish: {
    step1Title: "¿Idioma nativo?",
    step1Sub: "Elige el idioma que hablas en casa",
    step2Title: "¿Qué idioma quieres aprender?",
    step2Sub: "Selecciona el idioma que quieres dominar",
    step3Title: "¿Dónde lo vas a usar de verdad?",
    step3Sub: "Rudy elegirá tu primera frase pensando en esa situación.",
    step4Title: "Esta es la primera frase que Rudy preparó",
    step4Sub: "Escúchala una vez y prepárate. La dirás en voz alta a continuación.",
    step4PressToHear: "Escuchar otra vez",
    step5Title: "Ahora dilo en voz alta",
    step5Sub: "Toca el micro y dilo igual que lo escuchaste. Ocho segundos bastan.",
    step5Tap: "Toca para hablar",
    step5Listening: "Rudy te está escuchando…",
    step5Processing: "Rudy te está evaluando…",
    step5MicDenied: "Rudy necesita permiso del micrófono. Actívalo en ajustes y vuelve a intentarlo, o sáltalo por ahora.",
    step5SkipNow: "Saltarlo por ahora",
    step6Title: "Rudy te escuchó",
    step6FallbackHigh: "¡Sonó muy natural — sigue así!",
    step6FallbackMid: "Casi lo tienes. Otra pasada y se queda.",
    step6FallbackLow: "Tranquilo — probemos una vez más. Todo el mundo empieza aquí.",
    step6TryAgain: "Intentar otra vez",
    step6Continue: "Continuar",
    step7Title: "¿Guardamos el progreso que acabas de hacer?",
    step7Body: "Un inicio de sesión rápido y tu XP, racha y memoria de Rudy te siguen a cualquier dispositivo. Puedes saltarlo.",
    step7Google: "Iniciar sesión con Google",
    step7Email: "Correo",
    step7EmailPh: "tu@ejemplo.com",
    step7EmailCta: "Enviarme un enlace mágico",
    step7EmailSent: "Revisa tu correo y toca el enlace.",
    step7Skip: "Quizás más tarde",
    step7Or: "o",
    step7Err: "Error",
    back: "Atrás",
    next: "Siguiente",
    finish: "Empezar con Rudy",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

// getApiUrl() throws when EXPO_PUBLIC_DOMAIN isn't set in release builds.
// Mirror the safe wrapper used by speak.tsx — never block onboarding on it.
function tryGetApiUrl(scope: string): string | null {
  try {
    return getApiUrl();
  } catch (error) {
    if (__DEV__) console.warn(`[Onboarding] ${scope} skipped:`, error);
    return null;
  }
}

// Score band → colour. Mirrors speak.tsx so the score circle reads the
// same here as on the speak tab the user will land on next.
function scoreColor(score: number): string {
  if (score >= 75) return C.success;
  if (score >= 50) return C.gold;
  return C.error;
}

// Deterministic warm fallback. Always returns SOMETHING positive so step 6
// never feels punitive even if /api/pronunciation-coach 404s or the user
// got a 0 / empty audio.
function deterministicReaction(score: number | null, nativeLang: NativeLanguage): string {
  const u = UI[nativeLang];
  if (score === null) return u.step6FallbackLow;
  if (score >= 75) return u.step6FallbackHigh;
  if (score >= 50) return u.step6FallbackMid;
  return u.step6FallbackLow;
}

// ── Rudy splash placeholder (kept inline — only file I'm allowed to touch) ─
function RudySplashPlaceholder({ size = SPLASH_SIZE }: { size?: number }) {
  const [loaded, setLoaded] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const onLoad = () => {
    setLoaded(true);
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };
  return (
    <View style={{ width: size, height: size, borderRadius: 14, overflow: "hidden" }}>
      {!loaded && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(201,162,39,0.12)", justifyContent: "center", alignItems: "center", borderRadius: 14 }]}>
          <Text style={{ fontSize: 60 }}>🦊</Text>
        </View>
      )}
      <Animated.Image source={rudySplashImg} style={{ width: size, height: size, borderRadius: 14, opacity }} resizeMode="contain" onLoad={onLoad} />
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setNativeLanguage, setLearningLanguage } = useLanguage();
  const { user, signInWithGoogle, signInWithEmail } = useAuth();

  // Step state.
  const [step, setStep] = useState<Step>(1);
  const [nativeSel, setNativeSel] = useState<NativeLanguage | null>(null);
  const [learnSel,  setLearnSel]  = useState<NativeLanguage | null>(null);
  const [goalSel,   setGoalSel]   = useState<OnboardingGoal | null>(null);

  // Step 5 / 6 — recording + score state.
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [countdown, setCountdown] = useState<number>(RECORD_MAX_SEC);
  const [score, setScore] = useState<number | null>(null);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [fluencyScore, setFluencyScore] = useState<number | null>(null);
  const [completenessScore, setCompletenessScore] = useState<number | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [micDenied, setMicDenied] = useState(false);
  const [attemptId, setAttemptId] = useState(0);

  // Step 7 — auth state for the sign-in pane.
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Submission lock for the final "finish" transition.
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  // Recording refs — same shape speak.tsx uses, just scoped to a single
  // attempt so we don't have to deal with mid-session state churn.
  const nativeRecordingRef = useRef<Audio.Recording | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Local TTS player — keeps the step-4 audio independent from the global
  // audio cache. Lifecycle is "load on enter, unload on leave".
  const ttsSoundRef = useRef<Audio.Sound | null>(null);
  const ttsWebRef = useRef<HTMLAudioElement | null>(null);

  // Derived UI language. Onboarding before native pick → default to English.
  const uiLang: NativeLanguage = nativeSel ?? "english";
  const ui = UI[uiLang];
  const learningOptions = ALL_LANGS.filter((l) => l.id !== nativeSel);

  // Convenience: the chosen sentence for steps 4–6.
  const sentenceRow: SentenceRow | null = (learnSel && goalSel) ? FIRST_SENTENCE_TABLE[learnSel][goalSel] : null;
  const sentenceMeaning: string = (learnSel && goalSel) ? FIRST_SENTENCE_MEANING[learnSel][goalSel][uiLang] : "";

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Math.max((Platform.OS === "web" ? 34 : insets.bottom) + 16, 34);

  // ── Cleanup: stop any in-flight recording / audio when the screen unmounts.
  useEffect(() => {
    return () => {
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      pulseLoop.current?.stop();
      const rec = nativeRecordingRef.current;
      if (rec) {
        rec.stopAndUnloadAsync().catch(() => null);
        nativeRecordingRef.current = null;
      }
      const sound = ttsSoundRef.current;
      if (sound) {
        sound.unloadAsync().catch(() => null);
        ttsSoundRef.current = null;
      }
      const webAudio = ttsWebRef.current;
      if (webAudio) {
        webAudio.pause();
        ttsWebRef.current = null;
      }
    };
  }, []);

  // ── Step 1–3 pick handlers ────────────────────────────────────────────────
  const handleNativePick = (lang: NativeLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    setNativeSel(lang);
    // Resetting downstream picks if the user backtracks and changes their mind.
    setLearnSel(null);
    setGoalSel(null);
  };
  const handleLearnPick = (lang: NativeLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    setLearnSel(lang);
  };
  const handleGoalPick = (goal: OnboardingGoal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    setGoalSel(goal);
    void trackLearningEvent("learning_goal_selected", {
      surface: "onboarding",
      nativeLanguage: nativeSel,
      targetLanguage: learnSel,
      goal,
    });
  };

  // ── Step 4 — speak the sentence aloud via /api/pronunciation-tts ─────────
  // Always re-fetches; the route caches server-side. We unload any previous
  // sound so rapid taps on "Hear it again" can't stack.
  const playSentenceTTS = useCallback(async () => {
    if (!sentenceRow) return;
    Haptics.selectionAsync().catch(() => null);
    const apiBase = tryGetApiUrl("step 4 TTS");
    if (!apiBase) return;
    const url = new URL("/api/pronunciation-tts", apiBase);
    url.searchParams.set("text", sentenceRow.phrase);
    url.searchParams.set("lang", sentenceRow.speechLang);
    const urlStr = url.toString();
    try {
      if (Platform.OS === "web") {
        if (ttsWebRef.current) {
          ttsWebRef.current.pause();
          ttsWebRef.current = null;
        }
        const res = await apiFetchWithAuth(urlStr);
        if (!res.ok) return;
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        const audio = new (window as unknown as { Audio: { new (src: string): HTMLAudioElement } }).Audio(objUrl);
        ttsWebRef.current = audio;
        audio.onended = () => { URL.revokeObjectURL(objUrl); };
        await audio.play();
      } else {
        // Make sure we're in playback mode in case the prior step left the
        // session in record mode.
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
        const prev = ttsSoundRef.current;
        if (prev) {
          await prev.unloadAsync().catch(() => null);
          ttsSoundRef.current = null;
        }
        const { sound } = await Audio.Sound.createAsync({ uri: urlStr }, { shouldPlay: true });
        ttsSoundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => null);
            if (ttsSoundRef.current === sound) ttsSoundRef.current = null;
          }
        });
      }
    } catch (err) {
      if (__DEV__) console.warn("[Onboarding] TTS playback failed:", err);
    }
  }, [sentenceRow]);

  // Auto-play once when we enter step 4 so Rudy "says" the sentence.
  useEffect(() => {
    if (step === 4 && sentenceRow) {
      // Tiny delay so the screen renders before the audio starts —
      // otherwise web Safari sometimes drops the play() promise.
      const t = setTimeout(() => { void playSentenceTTS(); }, 220);
      return () => clearTimeout(t);
    }
    return;
  }, [step, sentenceRow, playSentenceTTS]);

  // ── Step 5 — pulse + countdown helpers ────────────────────────────────────
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
  const startCountdown = () => {
    setCountdown(RECORD_MAX_SEC);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };
  const stopCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  // Send a base64 audio payload to /api/pronunciation-assess. Always advances
  // the user to step 6 — even on failure we paint Rudy's warm fallback.
  const sendForAssessment = useCallback(async (base64: string, mimeType: string) => {
    if (!sentenceRow) return;
    const apiBase = tryGetApiUrl("onboarding pronunciation assess");
    if (!apiBase) {
      // No API → show the warm fallback path. score stays null.
      setScore(null);
      setRecordState("done");
      setStep(6);
      return;
    }
    try {
      const apiUrl = new URL("/api/pronunciation-assess", apiBase).toString();
      const res = await apiFetchWithAuth(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: sentenceRow.phrase,
          lang: sentenceRow.speechLang,
          audio: base64,
          mimeType,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as PronunciationAssessResponse;
      if (data.success !== true) {
        // Recognition failed (no voice, etc). Show fallback, still progress.
        setScore(null);
        setAccuracyScore(null);
        setFluencyScore(null);
        setCompletenessScore(null);
        setRecognizedText("");
      } else {
        const sc = data.score ?? 0;
        setScore(sc);
        setAccuracyScore(data.accuracyScore ?? null);
        setFluencyScore(data.fluencyScore ?? null);
        setCompletenessScore(data.completenessScore ?? null);
        setRecognizedText(data.recognizedText ?? "");
        setAttemptId((n) => n + 1);
      }
    } catch (err) {
      if (__DEV__) console.warn("[Onboarding] assess failed:", err);
      setScore(null);
    } finally {
      setRecordState("done");
      setStep(6);
    }
  }, [sentenceRow]);

  // Native (iOS/Android) stop + post.
  const stopNativeRecording = useCallback(async () => {
    const rec = nativeRecordingRef.current;
    if (!rec) return;
    stopPulse();
    stopCountdown();
    setRecordState("processing");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    try {
      await rec.stopAndUnloadAsync();
      // Same 300ms flush-delay speak.tsx uses — without it the file
      // sometimes reads as zero bytes.
      await new Promise((r) => setTimeout(r, 300));
      const uri = rec.getURI();
      nativeRecordingRef.current = null;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      if (!uri) {
        setScore(null);
        setRecordState("done");
        setStep(6);
        return;
      }
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      // Empty audio guard — same threshold speak.tsx uses.
      if (!base64 || base64.length < 2000) {
        setScore(null);
        setRecordState("done");
        setStep(6);
        return;
      }
      const nativeMime = Platform.OS === "ios" ? "audio/wav" : "audio/mp4";
      await sendForAssessment(base64, nativeMime);
    } catch (err) {
      if (__DEV__) console.warn("[Onboarding] native stop failed:", err);
      setScore(null);
      setRecordState("done");
      setStep(6);
    }
  }, [sendForAssessment]);

  // Press handler for the big mic button on step 5. Mirrors speak.tsx.
  const handleRecord = () => {
    if (recordState === "processing") return;

    // Test input: user taps mic while listening → behaves as "stop early"
    if (recordState === "listening") {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }
      if (Platform.OS !== "web" && nativeRecordingRef.current) {
        void stopNativeRecording();
      } else if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => null);

    if (Platform.OS !== "web") {
      // Native path.
      (async () => {
        try {
          const { granted } = await Audio.requestPermissionsAsync();
          if (!granted) {
            setMicDenied(true);
            setRecordState("idle");
            return;
          }
          setMicDenied(false);
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const recording = new Audio.Recording();
          const recOptions: Audio.RecordingOptions = Platform.OS === "ios" ? {
            android: Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
            ios: {
              extension: ".wav",
              outputFormat: Audio.IOSOutputFormat.LINEARPCM,
              audioQuality: Audio.IOSAudioQuality.HIGH,
              sampleRate: 16000,
              numberOfChannels: 1,
              bitRate: 256000,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false,
            },
            web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
          } : Audio.RecordingOptionsPresets.HIGH_QUALITY;
          await recording.prepareToRecordAsync(recOptions);
          await recording.startAsync();
          nativeRecordingRef.current = recording;
          setRecordState("listening");
          setScore(null);
          setRecognizedText("");
          startPulse();
          startCountdown();
          autoStopTimerRef.current = setTimeout(() => { void stopNativeRecording(); }, RECORD_MAX_SEC * 1000);
        } catch (err) {
          if (__DEV__) console.warn("[Onboarding] mic start failed:", err);
          setMicDenied(true);
          setRecordState("idle");
        }
      })();
      return;
    }

    // Web path — getUserMedia + MediaRecorder.
    const nav: Navigator | undefined = typeof navigator !== "undefined" ? navigator : undefined;
    if (!nav?.mediaDevices?.getUserMedia) {
      setMicDenied(true);
      return;
    }
    type MR = { new (s: MediaStream, opts?: { mimeType?: string; bitsPerSecond?: number }): MediaRecorder; isTypeSupported?: (mime: string) => boolean };
    const W = window as unknown as { MediaRecorder?: MR };
    const MediaRecorderCtor = W.MediaRecorder;
    if (typeof MediaRecorderCtor !== "function") {
      setMicDenied(true);
      return;
    }

    nav.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setMicDenied(false);
      audioChunksRef.current = [];
      const isTypeSupported = MediaRecorderCtor.isTypeSupported?.bind(MediaRecorderCtor);
      const mimeType = isTypeSupported?.("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
                     : isTypeSupported?.("audio/webm") ? "audio/webm"
                     : "";
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorderCtor(stream, mimeType ? { mimeType } : undefined);
      } catch (e) {
        if (__DEV__) console.warn("[Onboarding] MediaRecorder construct failed:", e);
        stream.getTracks().forEach((t) => t.stop());
        setMicDenied(true);
        return;
      }
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        stopPulse();
        stopCountdown();
        setRecordState("processing");
        const usedMime = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: usedMime });
        const base64: string = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(",")[1] ?? "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }).catch(() => "");
        if (!base64 || base64.length < 2000) {
          setScore(null);
          setRecordState("done");
          setStep(6);
          return;
        }
        await sendForAssessment(base64, usedMime);
      };
      recorder.start();
      setRecordState("listening");
      setScore(null);
      setRecognizedText("");
      startPulse();
      startCountdown();
      autoStopTimerRef.current = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, RECORD_MAX_SEC * 1000);
    }).catch((err) => {
      if (__DEV__) console.warn("[Onboarding] getUserMedia failed:", err);
      setMicDenied(true);
    });
  };

  // The "Skip for now" link on step 5 — moves the user forward without
  // blocking when the mic is unavailable. score stays null so step 6
  // shows the warm fallback ("괜찮아요, 한 번 더 해볼까요?").
  const handleSkipRecord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    setScore(null);
    setRecordState("done");
    setStep(6);
  };

  // Step 6 → try again resets just the recording state and bounces back.
  const handleTryAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    setScore(null);
    setAccuracyScore(null);
    setFluencyScore(null);
    setCompletenessScore(null);
    setRecognizedText("");
    setRecordState("idle");
    setStep(5);
  };

  // ── Step 7 (sign-in) — wraps useAuth ──────────────────────────────────────
  // If the user becomes signed-in mid-flow we don't auto-skip the screen —
  // we still need to commit the goal/language picks. The CTA copy stays the
  // same; the finalize step is idempotent so a signed-in user just lands on
  // /speak with their selections saved.
  useEffect(() => {
    if (step === 7 && user) {
      // no-op — see comment above
    }
  }, [step, user]);

  const onGoogle = useCallback(async () => {
    setAuthBusy(true); setAuthError(null);
    const { error } = await signInWithGoogle();
    if (error) setAuthError(error);
    setAuthBusy(false);
  }, [signInWithGoogle]);

  const onMagicLink = useCallback(async () => {
    if (!emailInput.trim()) return;
    setAuthBusy(true); setAuthError(null); setEmailSent(false);
    const { error } = await signInWithEmail(emailInput);
    if (error) setAuthError(error);
    else setEmailSent(true);
    setAuthBusy(false);
  }, [emailInput, signInWithEmail]);

  // ── Final commit (called by step 7's CTA, either "finish" or "skip") ─────
  const finalizeAndEnterApp = useCallback(async () => {
    if (!nativeSel || !learnSel || !goalSel || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
      await setNativeLanguage(nativeSel);
      await setLearningLanguage(learnSel);
      // Map our 4 onboarding goals onto the canonical LearningGoal enum
      // so downstream prompt shaping continues to work without changes.
      const canonicalGoal: LearningGoal = ONBOARDING_GOAL_TO_LEARNING_GOAL[goalSel];
      await setPrimaryLearningGoal(canonicalGoal).catch((err: unknown) => {
        console.warn("[Onboarding] learner goal save failed:", err);
      });
      await markGuideComplete().catch((err: unknown) => {
        console.warn("[Onboarding] guide completion save failed:", err);
      });
      await trackLearningEvent("onboarding_first_speaking_started", {
        surface: "onboarding",
        nativeLanguage: nativeSel,
        targetLanguage: learnSel,
        goal: canonicalGoal,
        onboardingGoal: goalSel,
        firstUtteranceScore: score,
        firstUtteranceSpoken: score !== null,
      });
      // Hand off to the speak tab so the user keeps practicing the same
      // sentence rather than landing on a generic home screen.
      router.replace({
        pathname: "/(tabs)/speak",
        params: {
          mission: "first-sentence",
          targetLang: learnSel,
          goal: canonicalGoal,
          missionIndex: "0",
        },
      });
    } catch (err) {
      console.warn("[Onboarding] finalize failed:", err);
      submittingRef.current = false;
      setLoading(false);
    }
  }, [nativeSel, learnSel, goalSel, score, setNativeLanguage, setLearningLanguage]);

  // ── Navigation between steps ──────────────────────────────────────────────
  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    if (step === 1) return;
    setStep((s) => Math.max(1, (s - 1)) as Step);
  };
  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
    if (step === 1 && nativeSel) setStep(2);
    else if (step === 2 && learnSel) setStep(3);
    else if (step === 3 && goalSel) setStep(4);
    else if (step === 4) setStep(5);
    // Steps 5 and 6 advance via their own action handlers, not the generic
    // bottom CTA — so we just no-op here.
    else if (step === 7) void finalizeAndEnterApp();
  };

  // Whether the bottom CTA should be enabled for steps that use it.
  const canAdvance = (
    (step === 1 && !!nativeSel)
    || (step === 2 && !!learnSel)
    || (step === 3 && !!goalSel)
    || (step === 4)
    || (step === 7)
  );

  // ── Render helpers (kept as named components for readability) ─────────────
  const renderDots = () => (
    <View style={styles.dots} accessibilityLabel={`Step ${step} of 7`}>
      {([1, 2, 3, 4, 5, 6, 7] as const).map((n) => (
        <View key={n} style={[styles.dot, step === n && styles.dotActive]} />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{ui.step1Title}</Text>
        <Text style={styles.subtitle}>{ui.step1Sub}</Text>
      </View>
      <View style={styles.cards}>
        {ALL_LANGS.map((lang) => {
          const sel = nativeSel === lang.id;
          return (
            <Pressable
              key={lang.id}
              style={({ pressed }) => [styles.card, sel && styles.cardSel, pressed && styles.cardPress]}
              onPress={() => handleNativePick(lang.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: sel }}
              accessibilityLabel={lang.nameMap[uiLang]}
            >
              <View style={styles.langBadge}><Text style={styles.langBadgeText}>{lang.badge}</Text></View>
              <Text style={[styles.cardName, sel && styles.cardNameSel]}>{lang.nameMap[uiLang]}</Text>
              {sel && (
                <View style={styles.check}><Ionicons name="checkmark" size={16} color={C.bg1} /></View>
              )}
            </Pressable>
          );
        })}
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{ui.step2Title}</Text>
        <Text style={styles.subtitle}>{ui.step2Sub}</Text>
      </View>
      <View style={styles.cards}>
        {learningOptions.map((lang) => {
          const sel = learnSel === lang.id;
          return (
            <Pressable
              key={lang.id}
              style={({ pressed }) => [styles.card, sel && styles.cardSel, pressed && styles.cardPress]}
              onPress={() => handleLearnPick(lang.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: sel }}
              accessibilityLabel={lang.nameMap[uiLang]}
            >
              <View style={styles.langBadge}><Text style={styles.langBadgeText}>{lang.badge}</Text></View>
              <Text style={[styles.cardName, sel && styles.cardNameSel]}>{lang.nameMap[uiLang]}</Text>
              {sel && (
                <View style={styles.check}><Ionicons name="checkmark" size={16} color={C.bg1} /></View>
              )}
            </Pressable>
          );
        })}
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{ui.step3Title}</Text>
        <Text style={styles.subtitle}>{ui.step3Sub}</Text>
      </View>
      <View style={styles.goalGrid}>
        {GOAL_OPTIONS.map((opt) => {
          const sel = goalSel === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={({ pressed }) => [styles.goalCard, sel && styles.goalCardSel, pressed && styles.cardPress]}
              onPress={() => handleGoalPick(opt.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: sel }}
              accessibilityLabel={opt.label[uiLang]}
            >
              <Text style={styles.goalEmoji}>{opt.emoji}</Text>
              <Text style={[styles.goalLabel, sel && styles.goalLabelSel]} numberOfLines={2}>{opt.label[uiLang]}</Text>
              {sel && (
                <View style={styles.goalCheck}><Ionicons name="checkmark" size={14} color={C.bg1} /></View>
              )}
            </Pressable>
          );
        })}
      </View>
    </>
  );

  const renderStep4 = () => (
    <>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{ui.step4Title}</Text>
        <Text style={styles.subtitle}>{ui.step4Sub}</Text>
      </View>
      <View style={styles.sentenceCard}>
        <Pressable
          onPress={playSentenceTTS}
          style={({ pressed }) => [styles.speakerWrap, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={ui.step4PressToHear}
        >
          <Ionicons name="volume-high" size={26} color={C.gold} />
        </Pressable>
        <Text style={styles.sentencePhrase} numberOfLines={3}>{sentenceRow?.phrase ?? ""}</Text>
        {sentenceMeaning ? (
          <Text style={styles.sentenceMeaning} numberOfLines={2}>{sentenceMeaning}</Text>
        ) : null}
        {sentenceRow ? (
          <Text style={styles.sentenceSubtitle} numberOfLines={2}>
            {sentenceRow.subtitle[uiLang]}
          </Text>
        ) : null}
        <Pressable
          onPress={playSentenceTTS}
          style={({ pressed }) => [styles.hearAgainBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={14} color={C.gold} />
          <Text style={styles.hearAgainText}>{ui.step4PressToHear}</Text>
        </Pressable>
      </View>
    </>
  );

  const renderStep5 = () => {
    const recording = recordState === "listening";
    const processing = recordState === "processing";
    return (
      <>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{ui.step5Title}</Text>
          <Text style={styles.subtitle}>{ui.step5Sub}</Text>
        </View>
        <View style={styles.sentenceCard}>
          <Text style={styles.sentencePhrase} numberOfLines={3}>{sentenceRow?.phrase ?? ""}</Text>
          {sentenceMeaning ? (
            <Text style={styles.sentenceMeaning} numberOfLines={2}>{sentenceMeaning}</Text>
          ) : null}
        </View>
        <View style={styles.micWrap}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={handleRecord}
              disabled={processing}
              style={({ pressed }) => [styles.micBtn, recording && styles.micBtnActive, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel={ui.step5Tap}
            >
              {processing ? (
                <ActivityIndicator size="large" color={C.bg1} />
              ) : (
                <Ionicons name={recording ? "stop" : "mic"} size={42} color={C.bg1} />
              )}
            </Pressable>
          </Animated.View>
          <Text style={styles.micCaption}>
            {processing ? ui.step5Processing : recording ? `${ui.step5Listening}  ${countdown}s` : ui.step5Tap}
          </Text>
        </View>
        {micDenied ? (
          <View style={styles.warnBox}>
            <Ionicons name="alert-circle-outline" size={18} color={C.gold} />
            <Text style={styles.warnText}>{ui.step5MicDenied}</Text>
          </View>
        ) : null}
        <Pressable onPress={handleSkipRecord} style={({ pressed }) => [styles.skipLink, pressed && { opacity: 0.6 }]}>
          <Text style={styles.skipLinkText}>{ui.step5SkipNow}</Text>
        </Pressable>
      </>
    );
  };

  const renderStep6 = () => {
    const colorScore = score ?? 0;
    const col = scoreColor(colorScore);
    const reaction = deterministicReaction(score, uiLang);
    return (
      <>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{ui.step6Title}</Text>
          <Text style={styles.subtitle}>{sentenceRow?.phrase ?? ""}</Text>
        </View>
        <View style={styles.scoreRow}>
          <View style={[styles.scoreCircle, { borderColor: col }]} accessible accessibilityRole="text" accessibilityLabel={`${score ?? 0} / 100`}>
            <Text style={[styles.scoreNumber, { color: col }]}>{score ?? 0}</Text>
            <Text style={styles.scoreDenom}>/100</Text>
          </View>
          <View style={styles.scoreSide}>
            <Text style={[styles.scoreLabel, { color: col }]}>{reaction}</Text>
            {recognizedText ? (
              <Text style={styles.scoreHeard}>&quot;{recognizedText}&quot;</Text>
            ) : null}
          </View>
        </View>
        {/* Reuse CoachingCard so step 6 matches the speak-tab feedback the
            user will see for every subsequent attempt. score=null falls back
            to 0 which the card treats as the warm-fallback band. CoachingCard
            silently hides itself if /api/pronunciation-coach 404s. */}
        {sentenceRow ? (
          <CoachingCard
            word={sentenceRow.phrase}
            lang={sentenceRow.speechLang}
            nativeLang={uiLang}
            score={score ?? 0}
            accuracyScore={accuracyScore}
            fluencyScore={fluencyScore}
            completenessScore={completenessScore}
            recognizedText={recognizedText}
            attemptId={attemptId}
          />
        ) : null}
        <View style={[styles.bottom, { marginTop: 12 }]}>
          <View style={styles.row}>
            <Pressable
              onPress={handleTryAgain}
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.ctaPress]}
              accessibilityRole="button"
            >
              <Ionicons name="refresh" size={16} color={C.gold} />
              <Text style={styles.secondaryBtnText}>{ui.step6TryAgain}</Text>
            </Pressable>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null); setStep(7); }}
              style={({ pressed }) => [styles.cta, styles.ctaFlex, pressed && styles.ctaPress]}
              accessibilityRole="button"
            >
              <Text style={styles.ctaText}>{ui.step6Continue}</Text>
              <Ionicons name="arrow-forward" size={20} color={C.bg1} />
            </Pressable>
          </View>
        </View>
      </>
    );
  };

  const renderStep7 = () => (
    <>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{ui.step7Title}</Text>
        <Text style={styles.subtitle}>{ui.step7Body}</Text>
      </View>
      <View style={styles.authBox}>
        <Pressable
          onPress={onGoogle}
          disabled={authBusy}
          style={({ pressed }) => [styles.authBtn, styles.googleBtn, authBusy && styles.btnDim, pressed && !authBusy && styles.ctaPress]}
        >
          {authBusy ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="logo-google" size={18} color="#FFFFFF" />
              <Text style={styles.authBtnText}>{ui.step7Google}</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.divider}>— {ui.step7Or} —</Text>
        <Text style={styles.authLabel}>{ui.step7Email}</Text>
        <TextInput
          value={emailInput}
          onChangeText={setEmailInput}
          placeholder={ui.step7EmailPh}
          placeholderTextColor={C.goldDim}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.emailInput}
          editable={!authBusy}
        />
        <Pressable
          onPress={onMagicLink}
          disabled={authBusy || !emailInput.trim()}
          style={({ pressed }) => [styles.authBtn, styles.emailBtn, (authBusy || !emailInput.trim()) && styles.btnDim, pressed && !authBusy && emailInput.trim() && styles.ctaPress]}
        >
          <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
          <Text style={styles.authBtnText}>{ui.step7EmailCta}</Text>
        </Pressable>
        {emailSent ? <Text style={styles.authNote}>{ui.step7EmailSent}</Text> : null}
        {authError ? <Text style={[styles.authNote, { color: C.error }]}>{ui.step7Err}: {authError}</Text> : null}
      </View>
    </>
  );

  // ── Final layout ──────────────────────────────────────────────────────────
  // Splash hides on the recording-heavy steps (5 + 6) so the screen breathes
  // — same trick the original used to keep step 3 from feeling cramped.
  const showSplash = step === 1 || step === 2 || step === 3 || step === 4 || step === 7;
  const splashSize = step === 1 || step === 2 ? SPLASH_SIZE : Math.min(SPLASH_SIZE, 180);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[C.bg1, C.bg2, C.bg1]} style={StyleSheet.absoluteFill} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPad, paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBorder} />

        {showSplash ? (
          <View style={styles.splashWrap}>
            <RudySplashPlaceholder size={splashSize} />
          </View>
        ) : null}

        {renderDots()}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
        {step === 7 && renderStep7()}

        {/* Bottom bar — steps 5 + 6 supply their own action rows. */}
        {step !== 5 && step !== 6 && (
          <View style={styles.bottom}>
            {step > 1 ? (
              <View style={styles.row}>
                <Pressable
                  style={styles.backBtn}
                  onPress={goBack}
                  accessibilityRole="button"
                  accessibilityLabel={ui.back}
                >
                  <Ionicons name="chevron-back" size={18} color={C.gold} />
                  <Text style={styles.backText}>{ui.back}</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.cta, styles.ctaFlex, !canAdvance && styles.ctaDim, pressed && canAdvance && styles.ctaPress]}
                  onPress={goNext}
                  disabled={!canAdvance || loading}
                  accessibilityRole="button"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={C.bg1} />
                  ) : (
                    <>
                      <Text style={styles.ctaText}>{step === 7 ? ui.finish : ui.next}</Text>
                      <Ionicons name={step === 7 ? "sparkles" : "arrow-forward"} size={18} color={C.bg1} />
                    </>
                  )}
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.cta, !canAdvance && styles.ctaDim, pressed && canAdvance && styles.ctaPress]}
                onPress={goNext}
                disabled={!canAdvance}
                accessibilityRole="button"
              >
                <Text style={styles.ctaText}>{ui.next}</Text>
                <Ionicons name="arrow-forward" size={20} color={C.bg1} />
              </Pressable>
            )}

            {/* Step 7 has an extra "Maybe later" that still commits the
                language/goal/learning state but skips the sign-in. */}
            {step === 7 ? (
              <Pressable
                onPress={() => { void finalizeAndEnterApp(); }}
                disabled={loading}
                style={({ pressed }) => [styles.skipLink, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
              >
                <Text style={styles.skipLinkText}>{ui.step7Skip}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, width: "100%", maxWidth: "100%", overflow: "hidden" },
  topBorder: { height: 2, backgroundColor: C.gold, marginHorizontal: 24, marginTop: 8, borderRadius: 1 },
  splashWrap: { alignItems: "center", justifyContent: "center", marginTop: 4, marginBottom: 4 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginVertical: 14 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.goldDark },
  dotActive: { width: 20, backgroundColor: C.gold },
  textBlock: {
    width: "100%", maxWidth: 520, alignSelf: "center", alignItems: "center",
    paddingHorizontal: 24, marginBottom: 14,
  },
  title: {
    width: "100%", fontSize: 20, fontFamily: F.header, color: C.gold,
    textAlign: "center", marginBottom: 8, lineHeight: 28,
  },
  subtitle: {
    width: "100%", fontSize: 15, fontFamily: F.body, color: C.goldDim,
    textAlign: "center", lineHeight: 22, fontStyle: "italic",
  },
  cards: { width: "100%", maxWidth: 520, alignSelf: "center", paddingHorizontal: 24, gap: 14 },
  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.bg2,
    borderRadius: 18, padding: 18, gap: 16,
    borderWidth: 1.5, borderColor: C.border,
  },
  cardSel: { backgroundColor: C.parchment, borderColor: C.gold },
  cardPress: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  langBadge: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: "rgba(201,162,39,0.16)",
    borderWidth: 1, borderColor: "rgba(201,162,39,0.32)",
    justifyContent: "center", alignItems: "center",
  },
  langBadgeText: { fontSize: 14, fontFamily: F.header, color: C.gold, letterSpacing: 0.8 },
  cardName: { flex: 1, fontSize: 18, fontFamily: F.bodySemi, color: C.parchment },
  cardNameSel: { color: C.textParchment },
  check: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: C.gold,
    justifyContent: "center", alignItems: "center",
  },

  // Step 3 — goal grid (2x2).
  goalGrid: {
    width: "100%", maxWidth: 520, alignSelf: "center",
    paddingHorizontal: 24,
    flexDirection: "row", flexWrap: "wrap", gap: 12,
    justifyContent: "space-between",
  },
  goalCard: {
    width: "48%",
    backgroundColor: C.bg2,
    borderWidth: 1.5, borderColor: C.border, borderRadius: 16,
    paddingVertical: 18, paddingHorizontal: 14,
    alignItems: "center", gap: 8,
    minHeight: 116,
    justifyContent: "center",
  },
  goalCardSel: { borderColor: C.gold, backgroundColor: "rgba(201,162,39,0.12)" },
  goalEmoji: { fontSize: 32, lineHeight: 38 },
  goalLabel: {
    fontSize: 14, fontFamily: F.bodySemi, color: C.parchment, textAlign: "center", lineHeight: 19,
  },
  goalLabelSel: { color: C.gold },
  goalCheck: {
    position: "absolute", top: 8, right: 8,
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.gold,
    justifyContent: "center", alignItems: "center",
  },

  // Steps 4 + 5 — sentence card.
  sentenceCard: {
    marginHorizontal: 24, marginBottom: 18,
    paddingVertical: 22, paddingHorizontal: 20,
    borderRadius: 18, borderWidth: 1.5, borderColor: C.gold,
    backgroundColor: C.bg2, alignItems: "center", gap: 10,
  },
  speakerWrap: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: "rgba(201,162,39,0.15)",
    justifyContent: "center", alignItems: "center", marginBottom: 4,
  },
  sentencePhrase: {
    fontSize: 24, fontFamily: F.header, color: C.parchment,
    textAlign: "center", lineHeight: 32,
  },
  sentenceMeaning: {
    fontSize: 14, fontFamily: F.bodySemi, color: C.goldDim, textAlign: "center",
  },
  sentenceSubtitle: {
    marginTop: 6, fontSize: 13, fontFamily: F.body, color: C.gold,
    textAlign: "center", fontStyle: "italic", lineHeight: 18,
  },
  hearAgainBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    marginTop: 6, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg3,
  },
  hearAgainText: { fontSize: 12, fontFamily: F.bodySemi, color: C.gold },

  // Step 5 — mic.
  micWrap: { alignItems: "center", marginTop: 8, marginBottom: 18, gap: 12 },
  micBtn: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: C.gold, justifyContent: "center", alignItems: "center",
    shadowColor: C.gold, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  micBtnActive: { backgroundColor: C.success },
  micCaption: {
    fontSize: 14, fontFamily: F.bodySemi, color: C.gold,
    textAlign: "center", paddingHorizontal: 16,
  },
  warnBox: {
    marginHorizontal: 24, marginTop: 6, marginBottom: 12,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(201,162,39,0.32)",
    backgroundColor: "rgba(201,162,39,0.07)",
    flexDirection: "row", alignItems: "flex-start", gap: 10,
  },
  warnText: { flex: 1, fontSize: 13, fontFamily: F.body, color: C.parchment, lineHeight: 19 },
  skipLink: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 16, marginTop: 6 },
  skipLinkText: { fontSize: 14, fontFamily: F.bodySemi, color: C.goldDim, textDecorationLine: "underline" },

  // Step 6 — score.
  scoreRow: {
    flexDirection: "row", alignItems: "center", gap: 16,
    marginHorizontal: 24, marginBottom: 8,
    paddingVertical: 16, paddingHorizontal: 18,
    borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg2,
  },
  scoreCircle: {
    width: 88, height: 88, borderRadius: 44, borderWidth: 4,
    justifyContent: "center", alignItems: "center", backgroundColor: C.bg2,
  },
  scoreNumber: { fontSize: 28, fontFamily: F.title, lineHeight: 32 },
  scoreDenom: { fontSize: 10, fontFamily: F.body, color: C.goldDim },
  scoreSide: { flex: 1, gap: 6 },
  scoreLabel: { fontSize: 15, fontFamily: F.bodySemi, lineHeight: 21 },
  scoreHeard: { fontSize: 12, fontFamily: F.body, color: C.parchment, fontStyle: "italic" },

  // Step 7 — auth.
  authBox: { marginHorizontal: 24, marginBottom: 10, gap: 10 },
  authBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1,
  },
  googleBtn: { backgroundColor: "#4285F4", borderColor: "#3367D6" },
  emailBtn:  { backgroundColor: C.gold, borderColor: C.goldDim },
  authBtnText: { fontSize: 15, fontFamily: F.header, color: "#FFFFFF", letterSpacing: 0.5 },
  btnDim: { opacity: 0.45 },
  divider: { fontSize: 13, fontFamily: F.body, color: C.goldDim, textAlign: "center", fontStyle: "italic", marginVertical: 2 },
  authLabel: { fontSize: 13, fontFamily: F.bodySemi, color: C.goldDim, marginBottom: 2 },
  emailInput: {
    fontFamily: F.body, fontSize: 15, color: C.parchment,
    backgroundColor: C.bg3, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 10, borderWidth: 1, borderColor: C.goldDim,
  },
  authNote: { fontSize: 13, fontFamily: F.body, color: C.gold, textAlign: "center", fontStyle: "italic", marginTop: 4 },

  // Bottom bar.
  bottom: { paddingHorizontal: 24, paddingTop: 18, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 12, paddingHorizontal: 10,
  },
  backText: { fontSize: 15, fontFamily: F.bodySemi, color: C.gold },
  cta: {
    backgroundColor: C.gold, borderRadius: 18,
    paddingVertical: 16, alignItems: "center",
    flexDirection: "row", justifyContent: "center", gap: 8,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  ctaFlex:  { flex: 1 },
  ctaDim:   { backgroundColor: C.goldDark, shadowOpacity: 0 },
  ctaPress: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  ctaText:  { fontSize: 17, fontFamily: F.header, color: C.bg1, letterSpacing: 0.8 },
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 14, borderWidth: 1, borderColor: C.gold, backgroundColor: C.bg2,
  },
  secondaryBtnText: { fontSize: 14, fontFamily: F.bodySemi, color: C.gold },
});
