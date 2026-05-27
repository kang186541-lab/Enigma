import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getDailySpeakingSurvivalCoverage,
  getDailySpeakingMissionPhrase,
  getDailySpeakingSentenceLoop,
  SURVIVAL_PHRASE_FAMILIES,
  type DailySpeakingLanguage,
} from "../lib/dailySpeakingMissions";
import {
  applySpokenSentenceProgress,
  buildSpeakingPromptKey,
  getSpeakingCountForLanguage,
  SPEAKING_DAILY_GOAL,
} from "../lib/speakingProgress";
import { getTodaySpeakingMission } from "../lib/homeSpeakingMission";
import { LESSON_CONTENT, MISSION_CONTENT, REVIEW_CONTENT, type LearningLangKey } from "../lib/lessonContent";
import type { LearningGoal, SpeakingProgress } from "../lib/learnerProfile";
import { RUDY_GUIDE_CARDS } from "../lib/rudyGuideCards";

const languages: DailySpeakingLanguage[] = ["korean", "english", "spanish"];
const goals: LearningGoal[] = ["travel", "work", "study", "hobby", "relationship", "exam", "unknown"];
const onboardingSource = readFileSync("app/onboarding.tsx", "utf8");
const speakSource = readFileSync("app/(tabs)/speak.tsx", "utf8");
const homeSource = readFileSync("app/(tabs)/index.tsx", "utf8");
const cardsSource = readFileSync("app/(tabs)/cards.tsx", "utf8");
const basicCourseSource = readFileSync("app/basic-course.tsx", "utf8");
const dailyLessonSource = readFileSync("app/daily-lesson.tsx", "utf8");
const languageContextSource = readFileSync("context/LanguageContext.tsx", "utf8");
const rudyLessonSource = readFileSync("app/rudy-lesson.tsx", "utf8");
const rudyStep2Source = readFileSync("components/rudy/Step2KeyPoint.tsx", "utf8");
const rudyStep3Source = readFileSync("components/rudy/Step3MissionTalk.tsx", "utf8");
const rudyStep4Source = readFileSync("components/rudy/Step4QuickReview.tsx", "utf8");

const dayOneToSixSurvivalFamilies: Record<LearningLangKey, Record<string, string[]>> = {
  english: {
    greeting: ["hello"],
    goodbye: ["goodbye", "see you later", "take care"],
    thanks: ["thank you"],
    sorry: ["sorry"],
    dont_understand: ["don't understand", "do not understand"],
    repeat: ["say that again", "repeat"],
    slow_speech: ["slowly", "speak more slowly"],
    bridge_language: ["do you speak english"],
    where: ["where is the bathroom"],
    how_much: ["how much"],
    yes: ["yes"],
    no: ["no"],
    help: ["help"],
    name: ["my name"],
  },
  spanish: {
    greeting: ["hola"],
    goodbye: ["adiós", "hasta luego", "cuídate"],
    thanks: ["gracias"],
    sorry: ["lo siento"],
    dont_understand: ["no entiendo"],
    repeat: ["repetir", "repetirlo"],
    slow_speech: ["despacio"],
    bridge_language: ["hablas español"],
    where: ["dónde está el baño"],
    how_much: ["cuánto cuesta"],
    yes: ["sí"],
    no: ["no"],
    help: ["ayuda"],
    name: ["me llamo"],
  },
  korean: {
    greeting: ["안녕하세요"],
    goodbye: ["안녕히 가세요", "잘 가요", "다음에 봐요"],
    thanks: ["감사"],
    sorry: ["죄송"],
    dont_understand: ["이해를 못"],
    repeat: ["다시 한번 말"],
    slow_speech: ["천천히"],
    bridge_language: ["한국어 할 줄"],
    where: ["화장실"],
    how_much: ["얼마"],
    yes: ["네"],
    no: ["아니요"],
    help: ["도와주세요", "도움"],
    name: ["제 이름"],
  },
};

function normalizeContentText(value: string): string {
  return value
    .normalize("NFC")
    .toLocaleLowerCase()
    .replace(/[!?.,¡¿—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectDayOneToSixText(lang: LearningLangKey): string {
  const lines: string[] = [];
  for (let day = 1; day <= 6; day += 1) {
    const key = `day_${day}`;
    const lesson = LESSON_CONTENT[key]?.[lang];
    if (lesson) {
      for (const sentence of lesson.step1Sentences ?? []) lines.push(sentence.text);
      for (const quiz of lesson.step2?.quizzes ?? []) {
        if (quiz.promptWithBlank) lines.push(quiz.promptWithBlank);
        if (quiz.fullSentence) lines.push(quiz.fullSentence);
        if (quiz.audioText) lines.push(quiz.audioText);
      }
    }
    const mission = MISSION_CONTENT[key]?.[lang];
    if (mission) lines.push(...(mission.suggestedAnswers ?? []));
    for (const review of REVIEW_CONTENT[key]?.[lang] ?? []) {
      if (review.sentence) lines.push(review.sentence);
      if (review.promptWithBlank) lines.push(review.promptWithBlank);
      if (review.fullSentence) lines.push(review.fullSentence);
    }
  }
  return normalizeContentText(lines.join(" "));
}

assert.equal(RUDY_GUIDE_CARDS.length, 8, "Rudy's Language Guide should stay at the 8 philosophy cards from replit.md");
assert.deepEqual(
  RUDY_GUIDE_CARDS.map((card) => card.title.korean),
  [
    "언어는 공부가 아니야",
    "불편해져야 배울 수 있어",
    "하루 10분이면 충분해",
    "틀려도 일단 말해!",
    "네가 쓸 말부터 배워",
    "좋아하는 걸로 배워봐",
    "습관을 만들어봐",
    "자, 이제 시작하자!",
  ],
  "Rudy's Language Guide titles should match the locked philosophy order"
);

assert.ok(
  onboardingSource.includes("Rudy's 8-card language philosophy"),
  "Onboarding should show Rudy's 8-card philosophy before the first speaking mission"
);
assert.ok(
  onboardingSource.includes("RUDY_GUIDE_CARDS") && onboardingSource.includes("markGuideComplete"),
  "Onboarding should render all guide cards and mark them complete after first-launch onboarding"
);
assert.ok(
  onboardingSource.includes("style={({ pressed }) => [styles.guideCard, pressed && styles.guideCardPress]}") &&
  onboardingSource.includes("guideFinalHint") &&
  onboardingSource.includes("setupCtaLabel"),
  "Onboarding should keep Rudy's guide intact while reducing friction before the first spoken sentence"
);
assert.ok(
  onboardingSource.includes('mission: "first-sentence"') && onboardingSource.includes("goal: goalSel"),
  "Onboarding should route the learner into a personalized first speaking sentence"
);
assert.ok(
  speakSource.includes("nextMissionPreview") && speakSource.includes("getNextMissionPreviewTitle"),
  "First speaking completion should preview the next real sentence instead of feeling like a dead-end completion screen"
);
assert.ok(
  speakSource.includes('trackLearningEvent("first_speaking_next_sentence_started"') &&
  speakSource.includes("await loadSession(activeLang);") &&
  speakSource.includes("Today's speaking goal\\ncomplete!"),
  "First speaking should continue directly between daily sentences and reserve completion for the daily goal"
);
assert.ok(
  speakSource.includes("showFirstMissionGoalPrompt = isFirstSpeakingMission && !selectedGoal"),
  "First speaking completion should not ask for the same goal again after onboarding already captured it"
);
assert.ok(
  speakSource.includes("phrase && score !== null && showDeepPronunciationCoach") &&
  speakSource.includes("showDeepPronunciationCoach ? ("),
  "First speaking result should keep deep diagnostic coaching out of the first 10-minute path"
);
assert.ok(
  speakSource.includes('assessmentStatus === "unscored" ? 10') &&
  speakSource.includes("awardSpokenAttemptXp(scoreVal, assessmentStatus)"),
  "Accepted unscored speech should still award XP so the attempt-over-accuracy philosophy is real"
);
assert.ok(
  speakSource.includes("if (data.success !== true) {\n        await acceptUnscoredGuidedAttempt(attemptGeneration);") &&
  speakSource.includes("if (data.success !== true) {\n            await acceptUnscoredGuidedAttempt(attemptGeneration);"),
  "Recordable audio with an unrecognized provider result should still count as an unscored guided attempt"
);
assert.ok(
  speakSource.includes("typeof MediaRecorderCtor !== \"function\"") &&
  speakSource.includes("MediaRecorder creation failed") &&
  speakSource.includes("MediaRecorder start failed"),
  "Web recording should guard browsers that expose getUserMedia without a usable MediaRecorder"
);
assert.ok(
  speakSource.includes("offerContinueWithoutScore(attemptGeneration)") &&
  speakSource.includes("continue-without-score-button") &&
  !speakSource.includes("if (hasRecordableAudio) {\n        await acceptUnscoredGuidedAttempt(attemptGeneration);") &&
  !speakSource.includes("if (hasRecordableAudio) {\n            await acceptUnscoredGuidedAttempt(attemptGeneration);"),
  "Network or server scoring failures should ask before counting an unscored speaking attempt"
);
assert.ok(
  speakSource.includes("if (counted) setSpokenAttemptAccepted(true);"),
  "Unscored acceptance should only show as accepted after the guided sentence is actually counted"
);
assert.ok(
  homeSource.includes("getSpeakingCountForLanguage(day, effectiveLearningLang)") &&
  speakSource.includes("getSpeakingCountForLanguage(day, lang)") &&
  speakSource.includes("getSpeakingCountForLanguage(day, activeLang)"),
  "Home and guided Speak should use target-language speaking counts, not global daily count"
);
assert.ok(
  !speakSource.includes("setSpokenAttemptAccepted(true);\n      const counted = await recordSpokenAttempt") &&
  !speakSource.includes("setSpokenAttemptAccepted(true);\n          const counted = await recordSpokenAttempt"),
  "Scored attempts should unlock Next only after spoken progress is actually counted"
);
assert.ok(
  speakSource.includes("if (!isGuidedSentenceMission)") &&
  speakSource.includes("return true;") &&
  speakSource.includes("const { day, counted } = await recordSpokenSentence"),
  "Pronunciation clinic XP must not inflate the guided daily real-sentence count"
);
assert.ok(
  homeSource.includes("showSecondaryHomeSections") &&
  homeSource.includes("setShowMorePractice((v) => !v)") &&
  homeSource.includes("todaySpeakingMission.rudyTip") &&
  homeSource.includes("const shouldFocusSpeaking = !todaySpeakingMission.dailyGoalMet;") &&
  homeSource.includes("const showSecondaryHomeSections = !shouldFocusSpeaking || showMorePractice;") &&
  homeSource.includes("{shouldFocusSpeaking && ("),
  "Home should keep today's real spoken sentence primary and progressively disclose secondary practice"
);
assert.ok(
  homeSource.includes('pathname: "/(tabs)/speak"') &&
  homeSource.includes('mission: "first-sentence"') &&
  homeSource.includes('goal: todaySpeakingMission.goal ?? ""') &&
  homeSource.includes("targetLang: todaySpeakingMission.targetLanguage") &&
  homeSource.includes('router.push("/(tabs)/speak" as any);'),
  "Home primary CTA should route unfinished learners into the first-sentence speaking mission, and completed learners into open Speak practice"
);
const firstSpeakingCtaIndex = homeSource.indexOf("TODAY'S FIRST SPEAKING MISSION");
const morePracticeGateIndex = homeSource.indexOf("styles.morePracticeGate");
const secondarySectionsIndex = homeSource.indexOf("{showSecondaryHomeSections && (");
const rudyCourseRouteIndex = homeSource.indexOf('router.push("/rudy-course" as any)');
const basicCourseRouteIndex = homeSource.indexOf('router.push((courseCompleted ? "/basic-course?review=1" : "/basic-course") as any)');
const statsRowIndex = homeSource.indexOf("STATS ROW");
const streakCardIndex = homeSource.indexOf("STREAK CARD");
const npcRouteIndex = homeSource.indexOf('router.push("/npc-list" as any)');
const moreToolsGateIndex = homeSource.indexOf("setShowMoreTools((v) => !v)");
const moreToolsContentIndex = homeSource.indexOf("{showMoreTools && (");
const myProgressIndex = homeSource.indexOf('"MY PROGRESS"', moreToolsContentIndex);
const culturalNoteIndex = homeSource.indexOf("<CulturalNoteSection", moreToolsContentIndex);
const quickPracticeIndex = homeSource.indexOf('"QUICK PRACTICE"', moreToolsContentIndex);
const secondaryClosedSpacerIndex = homeSource.indexOf("{!showSecondaryHomeSections &&", moreToolsContentIndex);
assert.ok(
  firstSpeakingCtaIndex >= 0 &&
  morePracticeGateIndex > firstSpeakingCtaIndex &&
  secondarySectionsIndex > morePracticeGateIndex &&
  rudyCourseRouteIndex > secondarySectionsIndex &&
  basicCourseRouteIndex > secondarySectionsIndex &&
  rudyCourseRouteIndex < basicCourseRouteIndex &&
  statsRowIndex > secondarySectionsIndex &&
  streakCardIndex > secondarySectionsIndex &&
  homeSource.includes("const showProgressSummary = todaySpeakingMission.dailyGoalMet") &&
  homeSource.includes("const showDueReviewBanner = todaySpeakingMission.dailyGoalMet && srsDueCount > 0") &&
  homeSource.includes("{showProgressSummary && (") &&
  homeSource.includes("{showDueReviewBanner && (") &&
  homeSource.includes("Optional Basics") &&
  !homeSource.includes('📚  Basic Course'),
  "Home should show the first speaking CTA first, hide secondary practice behind the gate, place Rudy Training before optional Basic Course, and keep progress/review summaries quiet until today's speaking goal is met"
);
assert.ok(
  homeSource.includes("const [showMoreTools, setShowMoreTools] = React.useState(false)") &&
  npcRouteIndex > secondarySectionsIndex &&
  moreToolsGateIndex > npcRouteIndex &&
  moreToolsContentIndex > moreToolsGateIndex &&
  myProgressIndex > moreToolsContentIndex &&
  culturalNoteIndex > myProgressIndex &&
  quickPracticeIndex > culturalNoteIndex &&
  secondaryClosedSpacerIndex > quickPracticeIndex,
  "Home secondary tools should stay behind a second explicit gate after the core Rudy/NPC actions"
);
const quickItemsStart = homeSource.indexOf("const quickItems = [");
const quickItemsEnd = quickItemsStart >= 0 ? homeSource.indexOf("];", quickItemsStart) : -1;
const quickItemsBlock = quickItemsStart >= 0 && quickItemsEnd > quickItemsStart
  ? homeSource.slice(quickItemsStart, quickItemsEnd)
  : "";
const quickRouteCount = (quickItemsBlock.match(/route:/g) ?? []).length;
assert.ok(
  quickRouteCount > 0 &&
  quickRouteCount <= 5 &&
  !quickItemsBlock.includes("/basic-course") &&
  !quickItemsBlock.includes("/daily-lesson") &&
  !quickItemsBlock.includes("/stats-dashboard"),
  "Home quick practice should stay compact and avoid legacy, foundation, or status routes"
);
assert.ok(
  languageContextSource.includes("export function getEffectiveLearningLanguage") &&
  languageContextSource.includes("const effectiveLearning = getEffectiveLearningLanguage") &&
  languageContextSource.includes("const native = isNativeLanguage(storedNative) ? storedNative : nativeLanguage") &&
  languageContextSource.includes("if (remoteLearning !== remote.learning_lang)") &&
  homeSource.includes("getEffectiveLearningLanguage(nativeLang, learningLanguage)") &&
  cardsSource.includes("getEffectiveLearningLanguage(native, learningLanguage)") &&
  basicCourseSource.includes("getEffectiveLearningLanguage(native, learningLanguage)") &&
  dailyLessonSource.includes("getEffectiveLearningLanguage(nativeLang, learningLanguage)") &&
  rudyLessonSource.includes("getEffectiveLearningLanguage(nativeLang, learningLanguage)"),
  "Shared language selection should prevent native-language courses across Home, Cards, Basic Course, Daily Lesson, and Rudy Lesson"
);
assert.ok(
  !languageContextSource.includes("const native = nativeLanguage ?? (isNativeLanguage(storedNative)") &&
  !homeSource.includes('learningLanguage ?? "english"'),
  "Language fallback should use the effective target language, including sequential native/learning changes"
);
assert.ok(
  dailyLessonSource.includes("loadTodaySpeakingProgress") &&
  dailyLessonSource.includes("getSpeakingCountForLanguage") &&
  dailyLessonSource.includes("LESSON_CONTENT") &&
  dailyLessonSource.includes("router.push(`/rudy-lesson?dayId=${state.day.id}`") &&
  !dailyLessonSource.includes("updateStats(") &&
  !dailyLessonSource.includes("wordsLearned") &&
  !dailyLessonSource.includes("SESSION_SIZE") &&
  !dailyLessonSource.includes("XPToast"),
  "Daily Lesson route should be a speaking-first Rudy bridge, not a word-card XP loop"
);
assert.ok(
  !basicCourseSource.includes("unlock all features") &&
  !basicCourseSource.includes("desbloquear todas las funciones") &&
  !basicCourseSource.includes("모든 기능이 잠금 해제"),
  "Basic Course copy should not claim it gates or unlocks the app"
);
assert.ok(
  basicCourseSource.includes('type GreetPhase = "listen" | "speak" | "recording" | "processing" | "done"') &&
  basicCourseSource.includes("markGreetAttemptComplete") &&
  basicCourseSource.includes('setGreetPhase("done")') &&
  !basicCourseSource.includes("scoreVal >= 80") &&
  !basicCourseSource.includes('setGreetPhase("pass")') &&
  !basicCourseSource.includes('setGreetPhase("fail")') &&
  !basicCourseSource.includes('greetPhase === "fail"') &&
  !basicCourseSource.includes("scoreFail") &&
  !basicCourseSource.includes("scoreFailTxt") &&
  !basicCourseSource.includes("failBtns") &&
  !basicCourseSource.includes("rgba(231,76,60"),
  "Basic Course greetings should count spoken attempts without score gating or red fail UI"
);
assert.ok(
  rudyLessonSource.includes("SPEAKING_DAILY_GOAL") &&
  rudyLessonSource.includes("recordSpokenSentence") &&
  rudyLessonSource.includes("sentenceCountRef.current < SPEAKING_DAILY_GOAL") &&
  !rudyLessonSource.includes("onSentenceSpoken(correct)") &&
  !rudyLessonSource.includes("missionSentCount") &&
  !rudyLessonSource.includes("sentenceCount + missionSentCount"),
  "Rudy Training Camp should use a real spoken-attempt counter and gate completion on the shared daily speaking goal"
);
assert.ok(
  rudyStep2Source.includes("onComplete(spokenAttemptsRef.current)") &&
  rudyStep3Source.includes("spokenSentencesRef.current") &&
  rudyStep3Source.includes("onComplete(spokenSentencesRef.current") &&
  rudyStep4Source.includes("onComplete(allScores, spokenAttemptsRef.current)"),
  "Rudy steps should report actual spoken attempts, not correct answers or GPT text counters"
);
assert.ok(
  !rudyStep2Source.includes("NotificationFeedbackType.Error") &&
  !rudyStep2Source.includes("#f44336") &&
  !rudyStep4Source.includes("#e55757") &&
  rudyStep2Source.includes("Almost. Rudy would say it this way"),
  "Rudy correction UI should stay coach-like, not punishment-like"
);
assert.ok(
  speakSource.includes("contentContainerStyle={[styles.screenScrollContent") &&
  speakSource.includes("numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.62}") &&
  speakSource.includes("numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.68}"),
  "Speak should have a short-viewport fallback for long daily sentences and continuation CTAs"
);

for (const lang of languages) {
  const courseText = collectDayOneToSixText(lang);
  for (const [family, variants] of Object.entries(dayOneToSixSurvivalFamilies[lang])) {
    assert.ok(
      variants.some((variant) => courseText.includes(normalizeContentText(variant))),
      `Day 1-6 ${lang} curriculum is missing survival phrase family: ${family}`
    );
  }
}

for (const lang of languages) {
  for (const goal of goals) {
    const loop = getDailySpeakingSentenceLoop(lang, goal);
    assert.ok(loop.length >= SPEAKING_DAILY_GOAL, `${lang}/${goal} has fewer than ${SPEAKING_DAILY_GOAL} speakable sentences`);
    assert.equal(new Set(loop.map((phrase) => phrase.phrase)).size, loop.length, `${lang}/${goal} has duplicate phrases`);
    for (const phrase of loop) {
      assert.equal(phrase.level, "A1", `${lang}/${goal}/${phrase.phrase} should stay A1`);
      assert.ok(phrase.meanings.korean, `${lang}/${goal}/${phrase.phrase} missing Korean meaning`);
      assert.ok(phrase.meanings.english, `${lang}/${goal}/${phrase.phrase} missing English meaning`);
      assert.ok(phrase.meanings.spanish, `${lang}/${goal}/${phrase.phrase} missing Spanish meaning`);
      assert.ok(phrase.speechLang === "ko-KR" || phrase.speechLang === "en-US" || phrase.speechLang === "es-ES");
      assert.equal(phrase.practiceContext, goal, `${lang}/${goal}/${phrase.phrase} missing goal practice context`);
      assert.ok(phrase.contextTip, `${lang}/${goal}/${phrase.phrase} missing context tip`);
    }
  }
}

for (const lang of languages) {
  const unknownLoop = getDailySpeakingSentenceLoop(lang, "unknown");
  const phrases = new Set(unknownLoop.map((phrase) => phrase.phrase));
  for (const [family, familyPhrases] of Object.entries(SURVIVAL_PHRASE_FAMILIES[lang])) {
    assert.ok(
      familyPhrases.some((phrase) => phrases.has(phrase)),
      `${lang}/unknown is missing survival phrase family: ${family}`
    );
  }

  for (const coverage of getDailySpeakingSurvivalCoverage(lang)) {
    assert.ok(
      coverage.exposures >= 7 && coverage.exposures <= 10,
      `${lang}/${coverage.family} has ${coverage.exposures} exposures, expected 7-10`
    );
    assert.equal(
      new Set(coverage.contextTips).size,
      coverage.exposures,
      `${lang}/${coverage.family} should repeat across distinct context tips`
    );
  }
}

assert.equal(getDailySpeakingSentenceLoop("korean", "exam")[0]?.phrase, "시험이 언제예요?");
assert.equal(getDailySpeakingSentenceLoop("english", "exam")[0]?.phrase, "When is the exam?");
assert.equal(getDailySpeakingSentenceLoop("spanish", "exam")[0]?.phrase, "¿Cuándo es el examen?");

const englishExamLoop = getDailySpeakingSentenceLoop("english", "exam");
assert.equal(getDailySpeakingMissionPhrase("english", "exam", 0)?.phrase, englishExamLoop[0].phrase);
assert.equal(getDailySpeakingMissionPhrase("english", "exam", englishExamLoop.length)?.phrase, englishExamLoop[0].phrase);
assert.equal(getDailySpeakingMissionPhrase("english", "exam", englishExamLoop.length + 1)?.phrase, englishExamLoop[1].phrase);
assert.equal(getDailySpeakingMissionPhrase("english", null, 0)?.practiceContext, "unknown");
assert.ok(getDailySpeakingMissionPhrase("english", null, 0)?.contextTip?.includes("First-day context"));

const activeHomeMission = getTodaySpeakingMission("english", "korean", "travel", SPEAKING_DAILY_GOAL - 1);
assert.equal(activeHomeMission.dailyGoalMet, false);
assert.notEqual(activeHomeMission.phrase, `${SPEAKING_DAILY_GOAL} / ${SPEAKING_DAILY_GOAL}`);
assert.equal(activeHomeMission.button, "Start speaking");
assert.ok(activeHomeMission.rudyTip.startsWith("Rudy: "), "active home mission should include a Rudy guidance line");

const completedHomeMission = getTodaySpeakingMission("english", "korean", "travel", SPEAKING_DAILY_GOAL);
assert.equal(completedHomeMission.dailyGoalMet, true);
assert.equal(completedHomeMission.phrase, `${SPEAKING_DAILY_GOAL} / ${SPEAKING_DAILY_GOAL}`);
assert.equal(completedHomeMission.button, "Keep speaking");
assert.ok(completedHomeMission.context.includes("free practice"));
assert.ok(completedHomeMission.rudyTip.includes("habit"), "completed home mission should keep the habit frame");

assert.equal(getTodaySpeakingMission("spanish", "korean", "travel", SPEAKING_DAILY_GOAL).button, "Seguir hablando");
assert.equal(getTodaySpeakingMission("korean", "english", "travel", SPEAKING_DAILY_GOAL).button, "계속 말하기");

const keyA = buildSpeakingPromptKey({ targetLanguage: "english", phrase: "  When is the exam?  ", source: "first-0" });
const keyB = buildSpeakingPromptKey({ targetLanguage: "english", phrase: "When is the exam?", source: "first-0" });
const keyC = buildSpeakingPromptKey({ targetLanguage: "english", phrase: "I have a question.", source: "first-0" });
assert.equal(keyA, keyB, "prompt keys should normalize whitespace and case");
assert.notEqual(keyA, keyC, "different phrases need different prompt keys");
assert.ok(!keyA.includes("When"), "prompt keys should not store raw phrase text");

const date = "2026-05-27";
const nowIso = "2026-05-27T00:00:00.000Z";
const emptyProgress: SpeakingProgress = { dailyGoal: SPEAKING_DAILY_GOAL, history: {} };
const first = applySpokenSentenceProgress(emptyProgress, {
  date,
  targetLanguage: "english",
  promptKey: keyA,
  nowIso,
});
assert.equal(first.counted, true);
assert.equal(first.day.count, 1);
assert.equal(first.day.byLanguage.english, 1);
assert.equal(first.progress.history[date]?.count, 1);

const duplicate = applySpokenSentenceProgress(first.progress, {
  date,
  targetLanguage: "english",
  promptKey: keyA,
  nowIso,
});
assert.equal(duplicate.counted, false);
assert.equal(duplicate.day.count, 1);

const spanishKey = buildSpeakingPromptKey({ targetLanguage: "spanish", phrase: "¿Cuándo es el examen?", source: "first-1" });
const second = applySpokenSentenceProgress(duplicate.progress, {
  date,
  targetLanguage: "spanish",
  promptKey: spanishKey,
  nowIso,
});
assert.equal(second.counted, true);
assert.equal(second.day.count, 2);
assert.equal(second.day.byLanguage.english, 1);
assert.equal(second.day.byLanguage.spanish, 1);
assert.equal(getSpeakingCountForLanguage(second.day, "english"), 1);
assert.equal(getSpeakingCountForLanguage(second.day, "spanish"), 1);
assert.equal(getSpeakingCountForLanguage(second.day, "korean"), 0);

const oldHistory: SpeakingProgress = { dailyGoal: SPEAKING_DAILY_GOAL, history: {} };
for (let day = 1; day <= 50; day += 1) {
  const key = `2026-04-${String(day).padStart(2, "0")}`;
  oldHistory.history[key] = {
    date: key,
    count: 1,
    byLanguage: { english: 1 },
    promptKeys: { [`old-${day}`]: true },
    updatedAt: nowIso,
  };
}
const trimmed = applySpokenSentenceProgress(oldHistory, {
  date: "2026-05-27",
  targetLanguage: "korean",
  promptKey: "fresh-key",
  nowIso,
});
assert.ok(Object.keys(trimmed.progress.history).length <= 45, "speaking history should stay trimmed");

console.log("speaking core verification passed");
