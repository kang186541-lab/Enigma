import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getEffectiveLearningLanguage,
  useLanguage,
  type NativeLanguage,
} from "@/context/LanguageContext";
import {
  getAllDays,
  getTri,
  langToCode,
  loadProgress,
  UNITS,
  type DailyCourseProgress,
  type DayData,
} from "@/lib/dailyCourseData";
import { LESSON_CONTENT, type LearningLangKey, type LessonSentence } from "@/lib/lessonContent";
import {
  getSpeakingCountForLanguage,
  loadTodaySpeakingProgress,
  SPEAKING_DAILY_GOAL,
} from "@/lib/speakingProgress";
import { C, F } from "@/constants/theme";

type BridgeState = {
  day: DayData;
  sentence: LessonSentence;
  speakingCount: number;
  completed: boolean;
};

const FALLBACK_SENTENCE: Record<LearningLangKey, LessonSentence> = {
  english: {
    text: "Hello, my name is Rudy.",
    speechLang: "en-GB",
    meaning: {
      ko: "안녕하세요. 제 이름은 Rudy예요.",
      en: "Hello, my name is Rudy.",
      es: "Hola, me llamo Rudy.",
    },
  },
  spanish: {
    text: "Hola, me llamo Rudy.",
    speechLang: "es-ES",
    meaning: {
      ko: "안녕하세요. 제 이름은 Rudy예요.",
      en: "Hello, my name is Rudy.",
      es: "Hola, me llamo Rudy.",
    },
  },
  korean: {
    text: "안녕하세요. 저는 Rudy예요.",
    speechLang: "ko-KR",
    meaning: {
      ko: "안녕하세요. 저는 Rudy예요.",
      en: "Hello, I am Rudy.",
      es: "Hola, soy Rudy.",
    },
  },
};

const LANGUAGE_LABEL: Record<NativeLanguage, Record<NativeLanguage, string>> = {
  korean: {
    korean: "한국어",
    english: "영어",
    spanish: "스페인어",
    indonesian: "인도네시아어",
  },
  english: {
    korean: "Korean",
    english: "English",
    spanish: "Spanish",
    indonesian: "Indonesian",
  },
  spanish: {
    korean: "coreano",
    english: "inglés",
    spanish: "español",
    indonesian: "indonesio",
  },
  indonesian: {
    korean: "Korea",
    english: "Inggris",
    spanish: "Spanyol",
    indonesian: "Indonesia",
  },
};

function findActiveDay(progress: DailyCourseProgress, learnLang: LearningLangKey): DayData {
  const allDays = getAllDays();
  const indexed = UNITS[progress.currentUnitIndex]?.days[progress.currentDayIndex];
  const candidates = [
    indexed,
    ...allDays.filter((day) => !progress.completedDays.includes(day.id)),
    ...allDays,
  ].filter(Boolean) as DayData[];

  return (
    candidates.find((day) => LESSON_CONTENT[day.id]?.[learnLang]?.step1Sentences?.length) ??
    allDays[0]
  );
}

function getFirstSentence(day: DayData, learnLang: LearningLangKey): LessonSentence {
  return LESSON_CONTENT[day.id]?.[learnLang]?.step1Sentences?.[0] ?? FALLBACK_SENTENCE[learnLang];
}

function copy(nativeLang: NativeLanguage, learnLang: NativeLanguage) {
  const target = LANGUAGE_LABEL[nativeLang][learnLang];
  if (nativeLang === "korean") {
    return {
      eyebrow: "오늘의 말하기",
      title: `Rudy와 ${target} 한 문장`,
      subtitle: "단어를 넘기기 전에, 오늘 쓸 문장을 먼저 입 밖으로 꺼내요.",
      topic: "훈련 주제",
      phraseLabel: "오늘 먼저 말할 문장",
      progress: "오늘 말한 문장",
      completed: "오늘 훈련 완료",
      start: "Rudy와 말하기 시작",
      course: "훈련 지도 보기",
      back: "뒤로",
    };
  }
  if (nativeLang === "spanish") {
    return {
      eyebrow: "Hablar hoy",
      title: `Una frase en ${target} con Rudy`,
      subtitle: "Antes de memorizar palabras, di una frase que puedas usar hoy.",
      topic: "Tema de entrenamiento",
      phraseLabel: "Primera frase de hoy",
      progress: "Frases habladas hoy",
      completed: "Entrenamiento de hoy completado",
      start: "Hablar con Rudy",
      course: "Ver mapa",
      back: "Volver",
    };
  }
  if (nativeLang === "indonesian") {
    return {
      eyebrow: "Bicara hari ini",
      title: `Satu kalimat ${target} bersama Rudy`,
      subtitle: "Sebelum kartu kata, ucapkan satu kalimat berguna dengan lantang.",
      topic: "Topik latihan",
      phraseLabel: "Kalimat pertama hari ini",
      progress: "Diucapkan hari ini",
      completed: "Latihan hari ini selesai",
      start: "Mulai bicara dengan Rudy",
      course: "Lihat peta kursus",
      back: "Kembali",
    };
  }
  return {
    eyebrow: "Today's speaking",
    title: `One ${target} sentence with Rudy`,
    subtitle: "Before word cards, say one useful sentence out loud.",
    topic: "Training topic",
    phraseLabel: "First sentence today",
    progress: "Spoken today",
    completed: "Today's training complete",
    start: "Start speaking with Rudy",
    course: "View course map",
    back: "Back",
  };
}

export default function DailyLessonBridge() {
  const insets = useSafeAreaInsets();
  const { nativeLanguage, learningLanguage } = useLanguage();
  const nativeLang = nativeLanguage ?? "english";
  const learnLang = getEffectiveLearningLanguage(nativeLang, learningLanguage) as LearningLangKey;
  const lc = langToCode(nativeLang);
  const [state, setState] = useState<BridgeState | null>(null);
  const [loading, setLoading] = useState(true);
  const text = useMemo(() => copy(nativeLang, learnLang), [nativeLang, learnLang]);

  useEffect(() => {
    let alive = true;
    async function loadBridge() {
      setLoading(true);
      const [progress, speakingDay] = await Promise.all([
        loadProgress(),
        loadTodaySpeakingProgress(),
      ]);
      if (!alive) return;
      const day = findActiveDay(progress, learnLang);
      setState({
        day,
        sentence: getFirstSentence(day, learnLang),
        speakingCount: getSpeakingCountForLanguage(speakingDay, learnLang),
        completed: progress.completedDays.includes(day.id),
      });
      setLoading(false);
    }
    loadBridge().catch((err) => {
      console.warn("[daily-lesson] bridge load failed:", err);
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [learnLang]);

  const topPad = Platform.OS === "web" ? 28 : insets.top;
  const progressRatio = Math.min(1, (state?.speakingCount ?? 0) / SPEAKING_DAILY_GOAL);

  function startRudyLesson() {
    if (!state?.day) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/rudy-lesson?dayId=${state.day.id}` as any);
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <ActivityIndicator color={C.gold} />
      </View>
    );
  }

  if (!state) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={C.gold} />
          <Text style={styles.backText}>{text.back}</Text>
        </Pressable>
      </View>
    );
  }

  const topic = getTri(state.day.topic, lc);
  const meaning = getTri(state.sentence.meaning, lc);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 38 : insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.72 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            accessibilityLabel={text.back}
          >
            <Ionicons name="chevron-back" size={22} color={C.gold} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>{text.eyebrow}</Text>
            <Text style={styles.title}>{text.title}</Text>
          </View>
        </View>

        <LinearGradient
          colors={["rgba(201,162,39,0.18)", "rgba(30,22,15,0.92)"]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroTop}>
            <View style={styles.rudyMark}>
              <Ionicons name="mic" size={22} color={C.bg1} />
            </View>
            {state.completed && (
              <View style={styles.donePill}>
                <Ionicons name="checkmark-circle" size={13} color={C.gold} />
                <Text style={styles.donePillText}>{text.completed}</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroSubtitle}>{text.subtitle}</Text>

          <View style={styles.topicCard}>
            <Text style={styles.label}>{text.topic}</Text>
            <Text style={styles.topic}>{topic}</Text>
          </View>

          <View style={styles.phraseCard}>
            <Text style={styles.label}>{text.phraseLabel}</Text>
            <Text style={styles.phrase}>{state.sentence.text}</Text>
            <Text style={styles.meaning}>{meaning}</Text>
          </View>

          <View style={styles.progressBlock}>
            <View style={styles.progressTop}>
              <Text style={styles.progressText}>{text.progress}</Text>
              <Text style={styles.progressCount}>
                {Math.min(state.speakingCount, SPEAKING_DAILY_GOAL)}/{SPEAKING_DAILY_GOAL}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.86, transform: [{ scale: 0.985 }] }]}
            onPress={startRudyLesson}
          >
            <Text style={styles.primaryBtnText}>{text.start}</Text>
            <Ionicons name="arrow-forward" size={18} color={C.bg1} />
          </Pressable>
        </LinearGradient>

        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.75 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/rudy-course" as any);
          }}
        >
          <Ionicons name="map-outline" size={17} color={C.goldDim} />
          <Text style={styles.secondaryBtnText}>{text.course}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.bg2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 20,
  },
  backText: {
    fontSize: 14,
    fontFamily: F.bodySemi,
    color: C.gold,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.goldDim,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 3,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: F.title,
    color: C.parchment,
  },
  hero: {
    borderRadius: 22,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rudyMark: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.gold,
    justifyContent: "center",
    alignItems: "center",
  },
  donePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(201,162,39,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.28)",
  },
  donePillText: {
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: C.gold,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: F.body,
    color: C.parchment,
  },
  topicCard: {
    gap: 6,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(10,8,6,0.22)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.14)",
  },
  label: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.goldDim,
    textTransform: "uppercase",
  },
  topic: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: F.header,
    color: C.parchment,
  },
  phraseCard: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: C.parchment,
  },
  phrase: {
    fontSize: 25,
    lineHeight: 32,
    fontFamily: F.title,
    color: C.textParchment,
  },
  meaning: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: F.body,
    color: C.goldDark,
  },
  progressBlock: {
    gap: 7,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  progressText: {
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: C.goldDim,
  },
  progressCount: {
    fontSize: 12,
    fontFamily: F.label,
    color: C.gold,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(201,162,39,0.14)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: C.gold,
  },
  primaryBtn: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: C.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: F.header,
    color: C.bg1,
  },
  secondaryBtn: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: F.bodySemi,
    color: C.goldDim,
  },
});
