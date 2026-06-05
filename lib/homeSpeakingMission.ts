import type { NativeLanguage } from "@/context/LanguageContext";
import {
  getGoalContextTip,
  getProgressiveMissionPhrase,
  type DailySpeakingLanguage,
} from "@/lib/dailySpeakingMissions";
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

function getGoalLabel(goal: LearningGoal | null, lang: NativeLanguage): string | null {
  if (!goal) return null;
  const labels: Record<LearningGoal, Record<NativeLanguage, string>> = {
    travel: { korean: "여행", english: "travel", spanish: "viajes", indonesian: "perjalanan" },
    work: { korean: "일", english: "work", spanish: "trabajo", indonesian: "pekerjaan" },
    study: { korean: "학교", english: "school", spanish: "estudios", indonesian: "sekolah" },
    hobby: { korean: "좋아하는 콘텐츠", english: "things you love", spanish: "lo que te gusta", indonesian: "hal yang kamu suka" },
    relationship: { korean: "친구와 관계", english: "friends and relationships", spanish: "amistades y relaciones", indonesian: "teman dan hubungan" },
    exam: { korean: "시험", english: "exams", spanish: "exámenes", indonesian: "ujian" },
    unknown: { korean: "일상", english: "daily life", spanish: "vida diaria", indonesian: "kehidupan sehari-hari" },
  };
  return labels[goal]?.[lang] ?? null;
}

export function getHomeGoalPrompt(lang: NativeLanguage): string {
  if (lang === "korean") return "오늘 실제로 쓸 상황";
  if (lang === "spanish") return "Lo que usarás hoy";
  if (lang === "indonesian") return "Yang akan kamu pakai hari ini";
  return "What you'll actually use";
}

export function getHomeLearningGoalOptions(lang: NativeLanguage): { key: LearningGoal; label: string }[] {
  return [
    { key: "travel", label: lang === "korean" ? "여행" : lang === "spanish" ? "Viaje" : lang === "indonesian" ? "Jalan-jalan" : "Travel" },
    { key: "hobby", label: lang === "korean" ? "취미" : lang === "spanish" ? "Gustos" : lang === "indonesian" ? "Hobi" : "Interests" },
    { key: "relationship", label: lang === "korean" ? "친구" : lang === "spanish" ? "Amigos" : lang === "indonesian" ? "Teman" : "Friends" },
    { key: "work", label: lang === "korean" ? "일" : lang === "spanish" ? "Trabajo" : lang === "indonesian" ? "Kerja" : "Work" },
    { key: "study", label: lang === "korean" ? "학교" : lang === "spanish" ? "Estudio" : lang === "indonesian" ? "Sekolah" : "School" },
    { key: "exam", label: lang === "korean" ? "시험" : lang === "spanish" ? "Examen" : lang === "indonesian" ? "Ujian" : "Exam" },
  ];
}

export function getTodaySpeakingMission(
  nativeLang: NativeLanguage,
  learningLang: NativeLanguage,
  goal: LearningGoal | null,
  spokenCount: number,
  dayOffset: number = 0,
): HomeSpeakingMission {
  // Beginner-ordered (survival first) + day-progressing: a returning learner
  // meets new phrases each day instead of re-opening with the same greeting.
  const missionPhrase = getProgressiveMissionPhrase(learningLang as DailySpeakingLanguage, goal, spokenCount, dayOffset);
  const phrase = missionPhrase?.phrase ?? (learningLang === "korean" ? "안녕하세요" : learningLang === "spanish" ? "Hola" : learningLang === "arabic" ? "أهلاً" : "Hello");
  // nativeLang CAN be indonesian; meanings only carry 3 langs, so cast + fall
  // back through English to the phrase itself.
  const meaning = missionPhrase?.meanings[nativeLang as DailySpeakingLanguage] ?? missionPhrase?.meanings.english ?? phrase;
  const dailyGoalMet = spokenCount >= SPEAKING_DAILY_GOAL;
  const targetName: Record<NativeLanguage, Record<NativeLanguage, string>> = {
    korean: { korean: "한국어", english: "영어", spanish: "스페인어", indonesian: "인도네시아어" },
    english: { korean: "Korean", english: "English", spanish: "Spanish", indonesian: "Indonesian" },
    spanish: { korean: "coreano", english: "inglés", spanish: "español", indonesian: "indonesio" },
    indonesian: { korean: "bahasa Korea", english: "bahasa Inggris", spanish: "bahasa Spanyol", indonesian: "bahasa Indonesia" },
  };
  const goalLabel = getGoalLabel(goal, nativeLang);
  const localizedContextTip = getGoalContextTip(
    missionPhrase?.practiceContext ?? goal ?? "unknown",
    nativeLang as DailySpeakingLanguage,
  );

  if (dailyGoalMet) {
    return {
      targetLanguage: learningLang,
      goal,
      dailyGoalMet,
      phrase: `${SPEAKING_DAILY_GOAL} / ${SPEAKING_DAILY_GOAL}`,
      meaning: nativeLang === "korean" ? "오늘 말하기 목표 완료" : nativeLang === "spanish" ? "Meta oral de hoy completa" : nativeLang === "indonesian" ? "Target bicara hari ini selesai" : "Today's speaking goal complete",
      eyebrow: nativeLang === "korean" ? "오늘 목표 완료" : nativeLang === "spanish" ? "Meta de hoy completa" : nativeLang === "indonesian" ? "Target harian selesai" : "Daily goal complete",
      title: nativeLang === "korean" ? "좋아요. 더 말하고 싶으면 계속해요" : nativeLang === "spanish" ? "Bien. Puedes seguir hablando" : nativeLang === "indonesian" ? "Bagus. Lanjut kalau mau bicara lagi" : "Nice. Keep speaking if you want",
      context: nativeLang === "korean"
        ? `${targetName[nativeLang][learningLang]} ${SPEAKING_DAILY_GOAL}문장을 이미 입 밖으로 냈어요. 이제 자유 말하기로 더 다듬을 수 있어요.`
        : nativeLang === "spanish"
        ? `Ya dijiste ${SPEAKING_DAILY_GOAL} frases en ${targetName[nativeLang][learningLang]}. Puedes seguir con práctica libre.`
        : nativeLang === "indonesian"
        ? `Kamu sudah mengucapkan ${SPEAKING_DAILY_GOAL} kalimat ${targetName[nativeLang][learningLang]} dengan lantang. Lanjutkan dengan latihan bebas kalau mau.`
        : `You already said ${SPEAKING_DAILY_GOAL} ${targetName[nativeLang][learningLang]} sentences out loud. You can keep shaping them in free practice.`,
      rudyTip: nativeLang === "korean"
        ? "Rudy: 오늘은 충분히 입 밖으로 꺼냈어요. 더 하고 싶다면 가볍게 이어가요."
        : nativeLang === "spanish"
        ? "Rudy: Ya hablaste lo suficiente para crear hábito. Si quieres, seguimos suave."
        : nativeLang === "indonesian"
        ? "Rudy: Hari ini kamu sudah cukup bicara untuk membangun kebiasaan. Kalau mau, lanjut santai saja."
        : "Rudy: You spoke enough to build the habit today. If you want, keep it light.",
      button: nativeLang === "korean" ? "계속 말하기" : nativeLang === "spanish" ? "Seguir hablando" : nativeLang === "indonesian" ? "Lanjut bicara" : "Keep speaking",
    };
  }

  return {
    targetLanguage: learningLang,
    goal,
    dailyGoalMet,
    phrase,
    meaning,
    eyebrow: nativeLang === "korean" ? "오늘의 실제 한 문장" : nativeLang === "spanish" ? "Una frase real hoy" : nativeLang === "indonesian" ? "Satu kalimat nyata hari ini" : "Today's real sentence",
    title: nativeLang === "korean" ? "Rudy와 입 밖으로 말해봐요" : nativeLang === "spanish" ? "Dilo en voz alta con Rudy" : nativeLang === "indonesian" ? "Ucapkan dengan lantang bersama Rudy" : "Say it out loud with Rudy",
    context: goalLabel
      ? nativeLang === "korean"
        ? `${targetName[nativeLang][learningLang]}로 ${goalLabel} 이야기를 할 준비를 해요. 틀려도 괜찮아요.`
        : nativeLang === "spanish"
        ? `Rudy preparará frases de ${goalLabel} en ${targetName[nativeLang][learningLang]}. No pasa nada si sale imperfecto.`
        : nativeLang === "indonesian"
        ? `Rudy akan menyiapkan kalimat ${goalLabel} dalam ${targetName[nativeLang][learningLang]}. Tidak apa-apa kalau belum sempurna.`
        : `Rudy will shape your ${targetName[nativeLang][learningLang]} practice around ${goalLabel}. It does not need to be perfect.`
      : nativeLang === "korean"
        ? `${targetName[nativeLang][learningLang]} 인사부터 시작해요. 틀려도 괜찮아요.`
        : nativeLang === "spanish"
        ? `Empieza con un saludo en ${targetName[nativeLang][learningLang]}. No pasa nada si sale imperfecto.`
        : nativeLang === "indonesian"
        ? `Mulai dengan sapaan ${targetName[nativeLang][learningLang]}. Tidak apa-apa kalau belum sempurna.`
        : `Start with a ${targetName[nativeLang][learningLang]} greeting. It does not need to be perfect.`,
    rudyTip: nativeLang === "korean"
      ? "Rudy: 완벽하게 만들지 말고 먼저 소리 내요. 말한 뒤에 같이 다듬으면 돼요."
      : nativeLang === "spanish"
      ? "Rudy: No la prepares perfecta. Dila primero y la pulimos después."
      : nativeLang === "indonesian"
      ? `Rudy: ${localizedContextTip ?? missionPhrase?.tip ?? "Ucapkan dulu. Kita perbaiki setelah keluar dari mulutmu."}`
      : `Rudy: ${localizedContextTip ?? missionPhrase?.tip ?? "Say it first. We can shape it after it is out loud."}`,
    button: nativeLang === "korean" ? "말하기 시작" : nativeLang === "spanish" ? "Empezar a hablar" : nativeLang === "indonesian" ? "Mulai bicara" : "Start speaking",
  };
}
