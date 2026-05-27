import type { NativeLanguage } from "@/context/LanguageContext";
import { getDailySpeakingMissionPhrase } from "@/lib/dailySpeakingMissions";
import type { LearningGoal } from "@/lib/learnerProfile";
import { SPEAKING_DAILY_GOAL } from "@/lib/speakingProgress";

export type HomeSpeakingMission = {
  targetLanguage: NativeLanguage;
  goal: LearningGoal | null;
  dailyGoalMet: boolean;
  phrase: string;
  meaning: string;
  eyebrow: string;
  title: string;
  context: string;
  rudyTip: string;
  button: string;
};

export function getFallbackLearningLanguage(nativeLang: NativeLanguage): NativeLanguage {
  return nativeLang === "english" ? "korean" : "english";
}

function getGoalLabel(goal: LearningGoal | null, lang: NativeLanguage): string | null {
  if (!goal) return null;
  const labels: Record<LearningGoal, Record<NativeLanguage, string>> = {
    travel: { korean: "여행", english: "travel", spanish: "viajes" },
    work: { korean: "일", english: "work", spanish: "trabajo" },
    study: { korean: "학교", english: "school", spanish: "estudios" },
    hobby: { korean: "좋아하는 콘텐츠", english: "things you love", spanish: "lo que te gusta" },
    relationship: { korean: "친구와 관계", english: "friends and relationships", spanish: "amistades y relaciones" },
    exam: { korean: "시험", english: "exams", spanish: "exámenes" },
    unknown: { korean: "일상", english: "daily life", spanish: "vida diaria" },
  };
  return labels[goal]?.[lang] ?? null;
}

export function getHomeGoalPrompt(lang: NativeLanguage): string {
  if (lang === "korean") return "오늘 실제로 쓸 상황";
  if (lang === "spanish") return "Lo que usarás hoy";
  return "What you'll actually use";
}

export function getHomeLearningGoalOptions(lang: NativeLanguage): { key: LearningGoal; label: string }[] {
  return [
    { key: "travel", label: lang === "korean" ? "여행" : lang === "spanish" ? "Viaje" : "Travel" },
    { key: "hobby", label: lang === "korean" ? "취미" : lang === "spanish" ? "Gustos" : "Interests" },
    { key: "relationship", label: lang === "korean" ? "친구" : lang === "spanish" ? "Amigos" : "Friends" },
    { key: "work", label: lang === "korean" ? "일" : lang === "spanish" ? "Trabajo" : "Work" },
    { key: "study", label: lang === "korean" ? "학교" : lang === "spanish" ? "Estudio" : "School" },
    { key: "exam", label: lang === "korean" ? "시험" : lang === "spanish" ? "Examen" : "Exam" },
  ];
}

export function getTodaySpeakingMission(
  nativeLang: NativeLanguage,
  learningLang: NativeLanguage,
  goal: LearningGoal | null,
  spokenCount: number,
): HomeSpeakingMission {
  const missionPhrase = getDailySpeakingMissionPhrase(learningLang, goal, spokenCount);
  const phrase = missionPhrase?.phrase ?? (learningLang === "korean" ? "안녕하세요" : learningLang === "spanish" ? "Hola" : "Hello");
  const meaning = missionPhrase?.meanings[nativeLang] ?? phrase;
  const dailyGoalMet = spokenCount >= SPEAKING_DAILY_GOAL;
  const targetName: Record<NativeLanguage, Record<NativeLanguage, string>> = {
    korean: { korean: "한국어", english: "영어", spanish: "스페인어" },
    english: { korean: "Korean", english: "English", spanish: "Spanish" },
    spanish: { korean: "coreano", english: "inglés", spanish: "español" },
  };
  const goalLabel = getGoalLabel(goal, nativeLang);

  if (dailyGoalMet) {
    return {
      targetLanguage: learningLang,
      goal,
      dailyGoalMet,
      phrase: `${SPEAKING_DAILY_GOAL} / ${SPEAKING_DAILY_GOAL}`,
      meaning: nativeLang === "korean" ? "오늘 말하기 목표 완료" : nativeLang === "spanish" ? "Meta oral de hoy completa" : "Today's speaking goal complete",
      eyebrow: nativeLang === "korean" ? "오늘 목표 완료" : nativeLang === "spanish" ? "Meta de hoy completa" : "Daily goal complete",
      title: nativeLang === "korean" ? "좋아요. 더 말하고 싶으면 계속해요" : nativeLang === "spanish" ? "Bien. Puedes seguir hablando" : "Nice. Keep speaking if you want",
      context: nativeLang === "korean"
        ? `${targetName[nativeLang][learningLang]} ${SPEAKING_DAILY_GOAL}문장을 이미 입 밖으로 냈어요. 이제 자유 말하기로 더 다듬을 수 있어요.`
        : nativeLang === "spanish"
        ? `Ya dijiste ${SPEAKING_DAILY_GOAL} frases en ${targetName[nativeLang][learningLang]}. Puedes seguir con práctica libre.`
        : `You already said ${SPEAKING_DAILY_GOAL} ${targetName[nativeLang][learningLang]} sentences out loud. You can keep shaping them in free practice.`,
      rudyTip: nativeLang === "korean"
        ? "Rudy: 오늘은 충분히 입 밖으로 꺼냈어요. 더 하고 싶다면 가볍게 이어가요."
        : nativeLang === "spanish"
        ? "Rudy: Ya hablaste lo suficiente para crear hábito. Si quieres, seguimos suave."
        : "Rudy: You spoke enough to build the habit today. If you want, keep it light.",
      button: nativeLang === "korean" ? "계속 말하기" : nativeLang === "spanish" ? "Seguir hablando" : "Keep speaking",
    };
  }

  return {
    targetLanguage: learningLang,
    goal,
    dailyGoalMet,
    phrase,
    meaning,
    eyebrow: nativeLang === "korean" ? "오늘의 실제 한 문장" : nativeLang === "spanish" ? "Una frase real hoy" : "Today's real sentence",
    title: nativeLang === "korean" ? "Rudy와 입 밖으로 말해봐요" : nativeLang === "spanish" ? "Dilo en voz alta con Rudy" : "Say it out loud with Rudy",
    context: goalLabel
      ? nativeLang === "korean"
        ? `${targetName[nativeLang][learningLang]}로 ${goalLabel} 이야기를 할 준비를 해요. 틀려도 괜찮아요.`
        : nativeLang === "spanish"
        ? `Rudy preparará frases de ${goalLabel} en ${targetName[nativeLang][learningLang]}. No pasa nada si sale imperfecto.`
        : `Rudy will shape your ${targetName[nativeLang][learningLang]} practice around ${goalLabel}. It does not need to be perfect.`
      : nativeLang === "korean"
        ? `${targetName[nativeLang][learningLang]} 인사부터 시작해요. 틀려도 괜찮아요.`
        : nativeLang === "spanish"
        ? `Empieza con un saludo en ${targetName[nativeLang][learningLang]}. No pasa nada si sale imperfecto.`
        : `Start with a ${targetName[nativeLang][learningLang]} greeting. It does not need to be perfect.`,
    rudyTip: nativeLang === "korean"
      ? "Rudy: 완벽하게 만들지 말고 먼저 소리 내요. 말한 뒤에 같이 다듬으면 돼요."
      : nativeLang === "spanish"
      ? "Rudy: No la prepares perfecta. Dila primero y la pulimos después."
      : `Rudy: ${missionPhrase?.contextTip ?? missionPhrase?.tip ?? "Say it first. We can shape it after it is out loud."}`,
    button: nativeLang === "korean" ? "말하기 시작" : nativeLang === "spanish" ? "Empezar a hablar" : "Start speaking",
  };
}
