import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getDailySpeakingSurvivalCoverage,
  getDailySpeakingMissionPhrase,
  getDailySpeakingSentenceLoop,
  getGoalContextTip,
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

// All four languages now run through the content-count loops. Indonesian
// (id-ID) is lock-covered for what these loops actually check: the day 1-6
// survival-phrase families, per-goal daily-speaking content, and survival
// coverage. (The days 7-30 course UNITS are enrichment and are NOT asserted by
// these loops, so Indonesian is promoted to first-class on day1-6 + daily
// speaking; unit 2-5 course content remains a non-blocking follow-on.)
const languages: LearningLangKey[] = ["korean", "english", "spanish", "indonesian"];
const goals: LearningGoal[] = ["travel", "work", "study", "hobby", "relationship", "exam", "unknown"];
const onboardingSource = readFileSync("app/onboarding.tsx", "utf8");
const speakSource = readFileSync("app/(tabs)/speak.tsx", "utf8");
const homeSource = readFileSync("app/(tabs)/index.tsx", "utf8");
const guideModalSource = readFileSync("components/RudyGuideModal.tsx", "utf8");
const cardsSource = readFileSync("app/(tabs)/cards.tsx", "utf8");
const achievementsSource = readFileSync("app/achievements.tsx", "utf8");
const basicCourseSource = readFileSync("app/basic-course.tsx", "utf8");
const dailyLessonSource = readFileSync("app/daily-lesson.tsx", "utf8");
const languageContextSource = readFileSync("context/LanguageContext.tsx", "utf8");
const progressSyncSource = readFileSync("lib/progressSync.ts", "utf8");
const progressStorageSource = readFileSync("lib/progressStorage.ts", "utf8");
const speakingProgressSource = readFileSync("lib/speakingProgress.ts", "utf8");
const srsManagerSource = readFileSync("lib/srsManager.ts", "utf8");
const dailyCourseDataSource = readFileSync("lib/dailyCourseData.ts", "utf8");
const learnerProfileSource = readFileSync("lib/learnerProfile.ts", "utf8");
const leagueManagerSource = readFileSync("lib/leagueManager.ts", "utf8");
const rudyLessonSource = readFileSync("app/rudy-lesson.tsx", "utf8");
const rudyStep1Source = readFileSync("components/rudy/Step1ListenRepeat.tsx", "utf8");
const rudyStep2Source = readFileSync("components/rudy/Step2KeyPoint.tsx", "utf8");
const rudyStep3Source = readFileSync("components/rudy/Step3MissionTalk.tsx", "utf8");
const rudyStep4Source = readFileSync("components/rudy/Step4QuickReview.tsx", "utf8");
const apiFetchWithAuthSource = readFileSync("lib/apiFetchWithAuth.ts", "utf8");
const routesSource = readFileSync("server/routes.ts", "utf8");

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
  // Indonesian is now first-class: it's in the `languages` array above, so the
  // day 1-6 survival-phrase loop DOES assert these families against the
  // Indonesian course content. Keep them in sync with the day1-6 Indonesian
  // lessons (data/dailyCourse/day1_6_improved.ts).
  indonesian: {
    greeting: ["halo"],
    goodbye: ["selamat tinggal", "sampai jumpa", "hati-hati"],
    thanks: ["terima kasih"],
    sorry: ["maaf"],
    dont_understand: ["tidak mengerti", "saya tidak mengerti"],
    repeat: ["ulangi", "tolong ulangi"],
    slow_speech: ["pelan-pelan", "bicara lebih pelan"],
    bridge_language: ["apakah kamu bisa bahasa inggris"],
    where: ["di mana toilet"],
    how_much: ["berapa harganya"],
    yes: ["ya"],
    no: ["tidak"],
    help: ["tolong"],
    name: ["nama saya"],
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

assert.equal(RUDY_GUIDE_CARDS.length, 13, "Rudy's Language Guide must stay exactly 13 cards: 7 philosophy + 5 app-usage/curriculum + 1 closer (daily drip)");
const guideTitlesKo = RUDY_GUIDE_CARDS.map((card) => card.title.korean);
assert.deepEqual(
  guideTitlesKo.slice(0, 7),
  ["언어는 공부가 아니야","불편해져야 배울 수 있어","하루 10분이면 충분해","틀려도 일단 말해!","네가 쓸 말부터 배워","좋아하는 걸로 배워봐","습관을 만들어봐"],
  "Rudy's Language Guide should keep the locked philosophy cards first"
);
assert.deepEqual(
  guideTitlesKo.slice(7, 12),
  ["처음이라면 기초 과정부터","루디의 훈련소가 핵심이야","훈련소 후 스토리 모드 도전","NPC와 실전 연습해봐","AI 튜터와 자유롭게 대화"],
  "Rudy's Language Guide should keep the 5 app-usage/curriculum cards (기초→훈련소→스토리→NPC→AI튜터) in order after the philosophy block"
);
assert.equal(guideTitlesKo[guideTitlesKo.length - 1], "자, 이제 시작하자!", "Rudy's guide closer should stay last");

assert.ok(
  !onboardingSource.includes("markGuideComplete") &&
  !onboardingSource.includes("RUDY_GUIDE_CARDS") &&
  onboardingSource.includes("resetGuideForDrip"),
  "Onboarding should not dump the guide cards; it should reset the drip so the philosophy appears one card per day on home"
);
assert.ok(
  onboardingSource.includes("setupCtaLabel"),
  "Onboarding should keep a single setup CTA before the first spoken sentence"
);
assert.ok(
  onboardingSource.includes('router.replace("/(tabs)"'),
  "Onboarding should land the learner on Home after setup (Home's primary CTA carries the first-utterance handoff)"
);
assert.ok(
  onboardingSource.includes('router.replace("/basic-course")'),
  "Onboarding should keep the foreign-script beginner protection branch routing into Basics first"
);
assert.ok(
  onboardingSource.includes("getDailySpeakingMissionPhrase") &&
  onboardingSource.includes("firstSpeakingPreview") &&
  onboardingSource.includes("firstSpeakingPreview.phrase") &&
  onboardingSource.includes("firstSpeakingPreview?.meanings[uiLang]"),
  "Onboarding should preview the actual goal-personalized first sentence before routing into Speak"
);
const onboardingSetupNextIndex = onboardingSource.indexOf("const handleSetupNext = () =>");
const onboardingSetupStartIndex = onboardingSource.indexOf("handleStartSpeaking()", onboardingSetupNextIndex);
const onboardingStartSpeakingIndex = onboardingSource.indexOf("const handleStartSpeaking = async () =>");
const onboardingSetNativeIndex = onboardingSource.indexOf("await setNativeLanguage(nativeSel);", onboardingStartSpeakingIndex);
const onboardingSetGoalIndex = onboardingSource.indexOf("await setPrimaryLearningGoal(goalSel)", onboardingStartSpeakingIndex);
const onboardingResetDripIndex = onboardingSource.indexOf("resetGuideForDrip()", onboardingStartSpeakingIndex);
assert.ok(
  !onboardingSource.includes("setStep(3)") &&
  onboardingSource.includes("if (!learnSel) return;") &&
  onboardingSource.includes("goalWaiting") &&
  onboardingSource.includes('accessibilityState={{ selected: sel }}') &&
  onboardingSetupStartIndex > onboardingSetupNextIndex &&
  onboardingSetNativeIndex > onboardingStartSpeakingIndex &&
  onboardingSetGoalIndex > onboardingSetNativeIndex &&
  onboardingResetDripIndex > onboardingSetGoalIndex,
  "Onboarding should go straight from setup to the first spoken sentence and start the daily guide drip (no all-at-once guide dump)"
);
assert.ok(
  !onboardingSource.includes("the first sentence you just chose") &&
  !onboardingSource.includes("방금 고른 첫 문장") &&
  !onboardingSource.includes("primera frase que acabas de elegir"),
  "Onboarding copy should say Rudy prepared the first sentence, not that the learner manually chose it"
);
assert.ok(
  guideModalSource.includes("GUIDE_LAST_SHOWN_KEY") &&
  guideModalSource.includes("lastShown === todayKey()") &&
  guideModalSource.includes("export async function resetGuideForDrip") &&
  guideModalSource.includes("export async function migrateGuideIfStale") &&
  guideModalSource.includes("advanceGuideIndex(cardIndex)") &&
  guideModalSource.includes("function parseGuideIndex") &&
  guideModalSource.includes("Number.isInteger(cardIndex)") &&
  guideModalSource.includes("withGuideLock") &&
  !guideModalSource.includes('setItem(GUIDE_KEY, "8")'),
  "RudyGuideModal: throttle + reset + migration, advance by shown cardIndex, corrupt-index hardening, all guide-key writes serialized via withGuideLock, and migrateGuideIfStale must NOT rewind the index (no setItem(GUIDE_KEY, \"8\") rewrite that replayed already-seen cards)"
);
assert.ok(
  homeSource.includes("guide-drip-on-open") &&
  homeSource.includes("migrateGuideIfStale") &&
  homeSource.includes("getNextGuideIndex") &&
  homeSource.includes("setGuideIndex") &&
  homeSource.includes("cardIndex={guideIndex}") &&
  homeSource.includes("useFocusEffect(maybeShowGuideDrip)") &&
  homeSource.includes('next === "active"') &&
  homeSource.includes("cancelActive"),
  "Home must show the Rudy guide drip on app open / focus / foreground (one card/day, not gated behind speaking; NOT mount-only): migrate -> next index -> pass cardIndex, wired via useFocusEffect + AppState active (with cancelActive cleanup so the foreground path can't setState after unmount) so the daily card still appears after a midnight rollover or a background->foreground return"
);
assert.ok(
  speakSource.includes("missionIndex?: string | string[]") &&
  speakSource.includes("const routeMissionIndex = normalizeMissionIndex(missionIndexParam);") &&
  speakSource.includes("const firstMissionRouteIndexRef = useRef<number | null>(routeMissionIndex);") &&
  speakSource.includes("const firstMissionIndex = firstMissionRouteIndexRef.current ?? spokenCountForMission;") &&
  speakSource.includes("getDailySpeakingMissionPhrase(lang, selectedGoalRef.current, firstMissionIndex, nativeLang)") &&
  speakSource.includes("if (isFirstSpeakingMission) firstMissionRouteIndexRef.current = null;"),
  "First onboarding sentence should be frozen into the Speak handoff until the first guided attempt is counted"
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
  speakSource.includes("if (data.success !== true) {\n        processScoreData(data);\n        offerContinueWithoutScore(attemptGeneration);") &&
  speakSource.includes("if (data.success !== true) {\n            processScoreData(data);\n            offerContinueWithoutScore(attemptGeneration);") &&
  !speakSource.includes("if (data.success !== true) {\n        await acceptUnscoredGuidedAttempt(attemptGeneration);") &&
  !speakSource.includes("if (data.success !== true) {\n            await acceptUnscoredGuidedAttempt(attemptGeneration);"),
  "Recordable audio with an unrecognized provider result should ask before counting an unscored guided attempt"
);
assert.ok(
  speakSource.includes("typeof MediaRecorderCtor !== \"function\"") &&
  speakSource.includes("MediaRecorder creation failed") &&
  speakSource.includes("MediaRecorder start failed"),
  "Web recording should guard browsers that expose getUserMedia without a usable MediaRecorder"
);
const recordStartRefIndex = speakSource.indexOf("const recordStartPendingRef = useRef(false);");
const recordStartGuardIndex = speakSource.indexOf("if (recordStartPendingRef.current) return;");
const recordStartSetIndex = speakSource.indexOf("recordStartPendingRef.current = true;", recordStartGuardIndex);
const webGetUserMediaIndex = speakSource.indexOf("navigator.mediaDevices.getUserMedia({ audio: true }).then");
const webRecorderStartIndex = speakSource.indexOf("recorder.start(100)", webGetUserMediaIndex);
const webStartClearIndex = speakSource.indexOf("recordStartPendingRef.current = false;", webRecorderStartIndex);
const webCatchIndex = speakSource.indexOf("microphone access failed", webGetUserMediaIndex);
const webCatchClearIndex = speakSource.indexOf("recordStartPendingRef.current = false;", webCatchIndex);
assert.ok(
  recordStartRefIndex >= 0 &&
  recordStartGuardIndex > recordStartRefIndex &&
  recordStartSetIndex > recordStartGuardIndex &&
  webGetUserMediaIndex > recordStartSetIndex &&
  webRecorderStartIndex > webGetUserMediaIndex &&
  webStartClearIndex > webRecorderStartIndex &&
  webCatchClearIndex > webCatchIndex,
  "Mic start should be reentrancy guarded while permission and MediaRecorder startup are pending"
);
assert.ok(
  speakSource.includes("offerContinueWithoutScore(attemptGeneration)") &&
  speakSource.includes("continue-without-score-button") &&
  !speakSource.includes("if (hasRecordableAudio) {\n        await acceptUnscoredGuidedAttempt(attemptGeneration);") &&
  !speakSource.includes("if (hasRecordableAudio) {\n            await acceptUnscoredGuidedAttempt(attemptGeneration);"),
  "Network or server scoring failures should ask before counting an unscored speaking attempt"
);
assert.ok(
  speakSource.includes("if (!counted) {") &&
  speakSource.includes("setSpokenAttemptAccepted(true);"),
  "Unscored acceptance should only show as accepted after the guided sentence is actually counted"
);
const unscoredAcceptGuardIndex = speakSource.indexOf("if (unscoredAcceptingRef.current === attemptGeneration) return false;");
const unscoredAcceptSetIndex = speakSource.indexOf("unscoredAcceptingRef.current = attemptGeneration;");
const unscoredRecordIndex = speakSource.indexOf('const counted = await recordSpokenAttempt(0, attemptGeneration, "unscored");');
const unscoredCountedGuardIndex = speakSource.indexOf("if (!counted) {", unscoredRecordIndex);
const unscoredSetAcceptedIndex = speakSource.indexOf("setSpokenAttemptAccepted(true);", unscoredRecordIndex);
assert.ok(
  speakSource.includes("const unscoredAcceptingRef = useRef<number | null>(null)") &&
  unscoredAcceptGuardIndex >= 0 &&
  unscoredAcceptSetIndex > unscoredAcceptGuardIndex &&
  unscoredRecordIndex > unscoredAcceptSetIndex &&
  unscoredCountedGuardIndex > unscoredRecordIndex &&
  unscoredSetAcceptedIndex > unscoredCountedGuardIndex,
  "Count-without-score should be reentrancy guarded and must not mark accepted when progress was not counted"
);
assert.ok(
  homeSource.includes("getSpeakingCountForLanguage(day, effectiveLearningLang)") &&
  speakSource.includes("getSpeakingCountForLanguage(day, lang)") &&
  speakSource.includes("getSpeakingCountForLanguage(day, activeLang)"),
  "Home and guided Speak should use target-language speaking counts, not global daily count"
);
assert.ok(
  homeSource.includes("const [lastSessionDate, setLastSessionDate]") &&
  homeSource.includes('AsyncStorage.getItem("@lingua_last_session_date").then(setLastSessionDate)') &&
  homeSource.includes("const activeStreak = getActiveStreak(stats.streak, lastSessionDate)") &&
  homeSource.includes('"Spoken today"') &&
  homeSource.includes("loadCardPractice(effectiveLearningLang)") &&
  homeSource.includes("setCardReviewToday(practice?.daily?.[today]?.count ?? 0)") &&
  homeSource.includes("const displayedCardReviewToday = Math.min(cardReviewToday, HOME_CARD_DAILY_GOAL)") &&
  homeSource.includes("quickMetaPill") &&
  !homeSource.includes('value: `${stats.wordsLearned}`'),
  "Home should display date-accurate active streaks, live spoken-sentence metrics, and today's card-review progress instead of dead Words"
);
assert.ok(
  !speakSource.includes("setSpokenAttemptAccepted(true);\n      const counted = await recordSpokenAttempt") &&
  !speakSource.includes("setSpokenAttemptAccepted(true);\n          const counted = await recordSpokenAttempt"),
  "Scored attempts should unlock Next only after spoken progress is actually counted"
);
const spokenSentenceRecordIndex = speakSource.indexOf("const { day, counted } = await recordSpokenSentence");
const spokenCountGuardIndex = speakSource.indexOf("if (!counted) return false;", spokenSentenceRecordIndex);
const openPracticeAwardIndex = speakSource.indexOf("if (!isGuidedSentenceMission)", spokenSentenceRecordIndex);
assert.ok(
  spokenSentenceRecordIndex >= 0 &&
  spokenCountGuardIndex > spokenSentenceRecordIndex &&
  openPracticeAwardIndex > spokenCountGuardIndex &&
  speakSource.includes("return true;"),
  "Open Speak pronunciation practice should only award XP after the spoken attempt was counted"
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
const basicCourseRouteIndex = homeSource.indexOf('router.push((courseCompleted ? "/basic-course?review=1&section=full" : "/basic-course") as any)');
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
  languageContextSource.includes("export type StatsUpdate") &&
  languageContextSource.includes("awardXp: (amount: number) => Promise<void>") &&
  languageContextSource.includes("const statsUpdateLockRef = useRef<Promise<void>>(Promise.resolve())") &&
  languageContextSource.includes("const awardXp = async (amount: number)") &&
  languageContextSource.includes("const effectiveLearning = getEffectiveLearningLanguage") &&
  languageContextSource.includes("const native = isNativeLanguage(storedNative) ? storedNative : nativeLanguage") &&
  languageContextSource.includes("if (remoteLearning !== remote.learning_lang)") &&
  homeSource.includes("getEffectiveLearningLanguage(nativeLang, learningLanguage)") &&
  cardsSource.includes("getEffectiveLearningLanguage(native, learningLanguage)") &&
  basicCourseSource.includes("getEffectiveLearningLanguage(native, learningLanguage)") &&
  dailyLessonSource.includes("getEffectiveLearningLanguage(nativeLang, learningLanguage)") &&
  dailyLessonSource.includes("completed: progress.completedDays.includes(day.id),") &&
  !dailyLessonSource.includes("completed: progress.completedDays.includes(day.id) || progress.todayCompleted") &&
  rudyLessonSource.includes("getEffectiveLearningLanguage(nativeLang, learningLanguage)"),
  "Shared language selection should prevent native-language courses across Home, Cards, Basic Course, Daily Lesson, and Rudy Lesson; Daily Lesson completion must be day-specific"
);
assert.ok(
  progressSyncSource.includes("expectedUserId?: string | null") &&
  progressSyncSource.includes("let pendingUserId: string | null = null") &&
  progressSyncSource.includes("user.id !== expectedUserId") &&
  progressSyncSource.includes("pendingPatch = { ...toSend, ...pendingPatch }") &&
  progressSyncSource.includes('const COUNTER_KEYS = ["xp", "level", "words_learned"] as const') &&
  !progressSyncSource.includes('"streak_days", "words_learned"') &&
  languageContextSource.includes("const resolvedStreak =") &&
  languageContextSource.includes("localLastSessionDate > remoteLastDate") &&
  languageContextSource.includes("remoteLastDate > localLastSessionDate") &&
  languageContextSource.includes("streak_days: merged.streak") &&
  !languageContextSource.includes("streak_days: Math.max(local.streak, remote.streak_days)"),
  "Progress sync should preserve failed flushes, scope pending pushes to the queued user, and allow streak resets without stale-device resurrection"
);
assert.ok(
  progressStorageSource.includes('"@lingua_learning_events_v1"') &&
  progressStorageSource.includes('"@lingua_speak_mission_handoffs_v1"') &&
  progressStorageSource.includes('"rudy_guide_index"') &&
  progressStorageSource.includes('"@chat_history_"'),
  "Account switch cleanup should include local learning events, review handoffs, Rudy guide state, and tutor chat histories"
);
assert.ok(
  speakingProgressSource.includes("let _spokenProgressLock") &&
  speakingProgressSource.includes("_spokenProgressLock = next.catch(() => null)"),
  "Daily spoken progress should serialize writes so rapid voice completions cannot drop counts"
);
assert.ok(
  learnerProfileSource.includes("export function mergeLearnerProfiles") &&
  learnerProfileSource.includes("mergeSpeakingProgress") &&
  learnerProfileSource.includes("queueProgressPush({ learner_profile: merged })"),
  "Learner profile hydrate should merge local speaking/tutor progress instead of blindly overwriting it"
);
assert.ok(
  learnerProfileSource.includes("export interface BasicCourseState") &&
  learnerProfileSource.includes("export interface PronunciationPracticeState") &&
  learnerProfileSource.includes("export interface CardPracticeState") &&
  learnerProfileSource.includes("function mergeBasicCourseState") &&
  learnerProfileSource.includes("function mergePronunciationPractice") &&
  learnerProfileSource.includes("function mergeCardPractice") &&
  learnerProfileSource.includes("export async function loadBasicCourseState") &&
  learnerProfileSource.includes("export async function saveBasicCourseProgress") &&
  learnerProfileSource.includes("export async function markBasicCourseCompleted") &&
  learnerProfileSource.includes("export async function markBasicCourseReview") &&
  learnerProfileSource.includes("export async function loadPronunciationPractice") &&
  learnerProfileSource.includes("export async function updatePronunciationPractice") &&
  learnerProfileSource.includes("export async function loadCardPractice") &&
  learnerProfileSource.includes("export async function recordCardPracticeReview") &&
  !learnerProfileSource.includes("export async function resetCardPracticeDay") &&
  learnerProfileSource.includes("let _cardPracticeLock") &&
  learnerProfileSource.includes("const reviewKey = normalizedWord ? `${deckType}:${normalizedWord}` : \"\";") &&
  learnerProfileSource.includes("basicCourse: mergeBasicCourseState") &&
  learnerProfileSource.includes("pronunciationPractice: mergePronunciationPractice") &&
  learnerProfileSource.includes("cardPractice: mergeCardPractice"),
  "Learner profile should be the canonical synced store for Basic Course, pronunciation practice, and Cards daily review memory"
);
assert.ok(
  progressSyncSource.includes("const PROGRESS_MERGE_SELECT") &&
  progressSyncSource.includes('"story_progress"') &&
  progressSyncSource.includes('"npc_relationships"') &&
  progressSyncSource.includes('"expression_book"') &&
  progressSyncSource.includes('"known_words"') &&
  progressSyncSource.includes(".select(PROGRESS_MERGE_SELECT)") &&
  progressSyncSource.includes('k === "learner_profile"') &&
  progressSyncSource.includes('await import("@/lib/learnerProfile")') &&
  progressSyncSource.includes("mergeLearnerProfiles(v as any, remoteProfile as any)") &&
  progressSyncSource.includes('k === "daily_course_progress"') &&
  progressSyncSource.includes('await import("@/lib/dailyCourseData")') &&
  progressSyncSource.includes("mergeDailyCourseProgress(v as any, remoteDailyCourse as any)") &&
  progressSyncSource.includes('k === "srs_data"') &&
  progressSyncSource.includes('await import("@/lib/srsManager")') &&
  progressSyncSource.includes("mergeSrsData(v as any, remoteSrs as any)") &&
  progressSyncSource.includes('k === "story_progress"') &&
  progressSyncSource.includes("mergeStoryProgressBlob(v, remote)") &&
  progressSyncSource.includes('k === "npc_relationships"') &&
  progressSyncSource.includes("mergeNumericRecordBlob(v, remote)") &&
  progressSyncSource.includes('k === "expression_book"') &&
  progressSyncSource.includes("mergeExpressionBookBlob(v, remote)") &&
  progressSyncSource.includes('k === "story_io_ratio"') &&
  progressSyncSource.includes("mergeStoryIoRatioBlob(v, remote)") &&
  progressSyncSource.includes('k === "story_clues"') &&
  progressSyncSource.includes("mergeStoryCluesBlob(v, remote)") &&
  progressSyncSource.includes('k === "known_words"') &&
  progressSyncSource.includes("mergeStringArrayBlob(v, remote)") &&
  progressSyncSource.includes("if (!queueUserId)") &&
  progressSyncSource.includes("if (!toSendUserId) return true;") &&
  languageContextSource.includes('const localSrs = await readJson("@lingua_srs_data")') &&
  languageContextSource.includes("queueProgressPush({ srs_data: localSrs })") &&
  languageContextSource.includes('const localCourse = await readJson("@daily_course_progress")') &&
  languageContextSource.includes("queueProgressPush({ daily_course_progress: localCourse })") &&
  languageContextSource.includes('const localProfile = await readJson("@lingua_learner_profile")') &&
  languageContextSource.includes("queueProgressPush({ learner_profile: localProfile })") &&
  languageContextSource.includes("const mergedExpressionBook = mergeExpressionBookBlob") &&
  languageContextSource.includes("const mergedClues = mergeStoryCluesBlob") &&
  languageContextSource.includes("const mergedKnownWords = mergeStringArrayBlob"),
  "Progress sync should merge every progress blob with the server row before pushing, block anonymous queued server writes, and backfill missing blobs from local state"
);
assert.ok(
  srsManagerSource.includes("export function mergeSrsData") &&
  srsManagerSource.includes("queueProgressPush({ srs_data: merged })") &&
  dailyCourseDataSource.includes("export function mergeDailyCourseProgress") &&
  dailyCourseDataSource.includes("queueProgressPush({ daily_course_progress: merged })"),
  "SRS and daily course hydrates should merge local progress instead of overwriting it"
);
assert.ok(
  leagueManagerSource.includes("let _weeklyXpLock") &&
  leagueManagerSource.includes("_weeklyXpLock = _weeklyXpLock.then(run, run)") &&
  leagueManagerSource.includes("const localXP = savedWeek === String(currentWeek)") &&
  leagueManagerSource.includes("String(Math.max(localXP, payload.xp ?? 0))"),
  "Weekly XP should serialize burst rewards and hydrate without overwriting newer local current-week XP"
);
assert.ok(
  !achievementsSource.includes("ach.xpReward") &&
  !achievementsSource.includes("xpReward"),
  "Achievements screen should not promise XP rewards unless the reward is actually granted"
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
const basicSkipStart = basicCourseSource.indexOf("const handleSkip = async () =>");
const basicSkipEnd = basicCourseSource.indexOf("const loadProgress = async () =>", basicSkipStart);
const basicSkipBlock = basicSkipStart >= 0 && basicSkipEnd > basicSkipStart ? basicCourseSource.slice(basicSkipStart, basicSkipEnd) : "";
assert.ok(
  basicSkipBlock &&
  !basicSkipBlock.includes("DONE_KEY") &&
  basicCourseSource.includes("const alreadyDone = await AsyncStorage.getItem(DONE_KEY(lang));") &&
  basicCourseSource.includes("const { wasAlreadyCompleted } = await markBasicCourseCompleted(lang);") &&
  basicCourseSource.includes('if (alreadyDone !== "true" && !wasAlreadyCompleted && !isReviewMode) await awardXp(100);') &&
  basicCourseSource.includes("await awardXp(5);"),
  "Basic Course Go Home should not mark the course complete, and completion/greeting rewards should use delta XP without duplicate profile-backed completion awards"
);
assert.ok(
  basicCourseSource.includes('EN_PHONETIC: Record<string, string>') &&
  basicCourseSource.includes('A:"ay"') &&
  basicCourseSource.includes("function getBasicCourseTtsText") &&
  basicCourseSource.includes("return text.length === 1 ? getPhoneticName(text, courseLang) : text;") &&
  basicCourseSource.includes('url.searchParams.set("text", getBasicCourseTtsText(text, courseLang));'),
  "Basic Course letter TTS should send phonetic names such as A -> ay to Azure"
);
assert.ok(
  homeSource.includes('/basic-course?review=1&section=full') &&
  homeSource.includes("refreshBasicCourseCompleted") &&
  homeSource.includes("markBasicCourseCompleted") &&
  homeSource.includes("loadedProfile.basicCourse?.[effectiveLearningLang]?.completed === true") &&
  basicCourseSource.includes('type ReviewSection = BasicCourseReviewSection;') &&
  basicCourseSource.includes('const initialReviewSection = isReviewMode ? parseReviewSection(section) : null;') &&
  basicCourseSource.includes('const [showReviewMenu, setShowReviewMenu] = useState(isReviewMode && !initialReviewSection);') &&
  basicCourseSource.includes('reviewSection === "full" && step < 2') &&
  basicCourseSource.includes('setStep(s => s + 1);'),
  "Basic Course review entry should open full review by default, refresh profile-backed completion on Home focus, and protect full review step progression"
);
assert.ok(
  basicCourseSource.includes("const stepReady = step === 0") &&
  basicCourseSource.includes("if (!isReviewMode && step < 3 && !stepReady)") &&
  !basicCourseSource.includes('topSkipTxt:'),
  "Basic Course normal path should not let Skip advance to completion without tracing, flipping, or speaking"
);
assert.ok(
  basicCourseSource.includes("import { recordAudio } from \"@/lib/audio\";") &&
  basicCourseSource.includes("loadBasicCourseState") &&
  basicCourseSource.includes("saveBasicCourseProgress") &&
  basicCourseSource.includes("markBasicCourseCompleted") &&
  basicCourseSource.includes("markBasicCourseReview") &&
  basicCourseSource.includes("recordSpokenSentence") &&
  basicCourseSource.includes("const BASIC_COURSE_RECORDING_MS = 8000;") &&
  basicCourseSource.includes("recordAudio(BASIC_COURSE_RECORDING_MS)") &&
  basicCourseSource.includes("if (!isValidSpokenAudio(base64))") &&
  basicCourseSource.includes("isAcceptedPronunciationResult(data)") &&
  basicCourseSource.includes("const courseCompletingRef") &&
  basicCourseSource.includes("if (courseCompletingRef.current) return;") &&
  !basicCourseSource.includes("Native does not run this lightweight web recorder") &&
  !basicCourseSource.includes("await markGreetAttemptComplete(null);\n      return;\n    }\n\n    if (!navigator?.mediaDevices?.getUserMedia)"),
  "Basic Course greeting practice should require accepted captured audio, update speaking progress, and avoid duplicate completion"
);
assert.ok(
  basicCourseSource.includes("const markReviewCompleted = async") &&
  basicCourseSource.includes("markReviewCompleted(reviewSection)") &&
  !basicCourseSource.includes("if (!isReviewMode || !initialReviewSection) return;"),
  "Basic Course review timestamps should be written when review is completed, not merely opened"
);
assert.ok(
  cardsSource.includes("loadCardPractice") &&
  cardsSource.includes("recordCardPracticeReview") &&
  cardsSource.includes("saveCardPracticeSnapshot") &&
  cardsSource.includes("localDateString()") &&
  !cardsSource.includes("new Date().toISOString().slice(0, 10)") &&
  cardsSource.includes("profileDay?.count") &&
  cardsSource.includes("cardPractice?.lastSeenWords") &&
  cardsSource.includes("const validDeckWords = new Set") &&
  cardsSource.includes("card practice backfill failed") &&
  cardsSource.includes("card practice legacy mirror failed") &&
  cardsSource.includes("const reviewed = await recordReview") &&
  cardsSource.includes("srsReviewAccepted") &&
  cardsSource.includes("setSrsDueCount(await getDueCount())") &&
  cardsSource.includes("extraPracticeModeRef") &&
  cardsSource.includes("setSrsQueueEmpty(true)") &&
  cardsSource.includes("const result = await recordCardPracticeReview") &&
  cardsSource.includes("currentWords, deckType") &&
  cardsSource.includes("if (knew && countedToday && !isExtraPractice && newCount <= DAILY_GOAL)") &&
  !cardsSource.includes("AsyncStorage.removeItem(getTodayKey())") &&
  !cardsSource.includes("resetCardPracticeDay(lang"),
  "Cards daily review count, last-seen memory, SRS persistence, and daily XP should use local-date learner_profile state with legacy backfill and no reset-based re-awards"
);
assert.ok(
  speakSource.includes("loadPronunciationPractice") &&
  speakSource.includes("updatePronunciationPractice") &&
  speakSource.includes("profilePractice?.weakWords") &&
  speakSource.includes("profilePractice?.lastSeen") &&
  speakSource.includes("profilePractice?.count") &&
  speakSource.includes("pronunciation practice backfill failed") &&
  speakSource.includes("AsyncStorage.multiSet") &&
  speakSource.includes("const prev = Array.from(new Set([...(profilePractice?.lastSeen ?? []), ...legacyPrev]));") &&
  speakSource.includes("const list = Array.from(new Set([...weakWords, ...legacyList]));") &&
  speakSource.includes("updatePronunciationPractice(activeLang, { weakWords: list })") &&
  speakSource.includes("updatePronunciationPractice(activeLang, { weakWords: updated })") &&
  speakSource.includes("updatePronunciationPractice(activeLang, { count: newCount, lastWord: phrase.word })") &&
  speakSource.includes("updatePronunciationPractice(activeLang, { lastSeen: updated })"),
  "Speak pronunciation count, weak words, last word, and recent-seen memory should sync through learner_profile with legacy-key backfill"
);
for (const [name, source] of [
  ["Speak", speakSource],
  ["Cards", cardsSource],
  ["BasicCourse", basicCourseSource],
  ["RudyLesson", rudyLessonSource],
] as const) {
  assert.ok(!source.includes("updateStats({ xp:"), `${name} should not use stale absolute XP writes`);
}
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
  rudyLessonSource.includes("setSpeakingGoalNudge(true);") &&
  !rudyLessonSource.includes("setCurrentStep(2);\n        return;") &&
  !rudyLessonSource.includes("onSentenceSpoken(correct)") &&
  !rudyLessonSource.includes("missionSentCount") &&
  !rudyLessonSource.includes("sentenceCount + missionSentCount"),
  "Rudy Training Camp should use a real spoken-attempt counter but should not trap lesson completion behind the 19-sentence daily goal"
);
assert.ok(
  rudyStep2Source.includes("onComplete(spokenAttemptsRef.current)") &&
  rudyStep3Source.includes("spokenSentencesRef.current") &&
  rudyStep3Source.includes("onComplete(spokenSentencesRef.current") &&
  rudyStep4Source.includes("onComplete(allScores, spokenAttemptsRef.current)"),
  "Rudy steps should report actual spoken attempts, not correct answers or GPT text counters"
);
assert.ok(
  rudyStep1Source.includes("acceptedSpokenAttempt") &&
  rudyStep1Source.includes("if (!acceptedSpokenAttempt) return;") &&
  rudyStep1Source.includes("{acceptedSpokenAttempt && (") &&
  rudyStep1Source.includes("const advancingRef") &&
  rudyStep2Source.includes("speakAccepted") &&
  rudyStep2Source.includes('if (quizPhase === "speak" && !speakAccepted) return;') &&
  rudyStep2Source.includes('{speakPhase === "done" && speakAccepted && (') &&
  rudyStep2Source.includes("const advancingRef"),
  "Rudy Step1/Step2 should count and advance only accepted spoken attempts, with rapid-tap guards"
);
assert.ok(
  rudyStep1Source.includes("const RUDY_RECORDING_MS = 8000;") &&
  rudyStep2Source.includes("const RUDY_RECORDING_MS = 8000;") &&
  rudyStep3Source.includes("const RUDY_RECORDING_MS = 8000;") &&
  rudyStep4Source.includes("const RUDY_RECORDING_MS = 8000;") &&
  !rudyStep1Source.includes("}, 4000);") &&
  !rudyStep2Source.includes("}, 4000);") &&
  !rudyStep3Source.includes("}, 7000);") &&
  !rudyStep4Source.includes("}, 7000);"),
  "Rudy spoken practice should give learners the same 8-second recording window as the main Speak flow"
);
const rudyStep2SpeakNavStart = rudyStep2Source.indexOf("{/* Next / skip */}");
const rudyStep2SpeakNavEnd = rudyStep2Source.indexOf("</View>", rudyStep2SpeakNavStart);
const rudyStep2SpeakNav = rudyStep2SpeakNavStart >= 0 && rudyStep2SpeakNavEnd > rudyStep2SpeakNavStart
  ? rudyStep2Source.slice(rudyStep2SpeakNavStart, rudyStep2SpeakNavEnd)
  : "";
assert.ok(
  rudyStep2SpeakNav &&
  !rudyStep2SpeakNav.includes('speakPhase === "idle"') &&
  rudyStep2SpeakNav.includes('speakPhase === "done"'),
  "Rudy Step2 should not show an idle skip path that advances before a spoken attempt"
);
assert.ok(
  !rudyStep4Source.includes("skipQuestion()") &&
  !rudyStep4Source.includes("setPronScore(70)") &&
  !rudyStep4Source.includes("...prev, 70") &&
  rudyStep4Source.includes("without inventing a passing pronunciation score") &&
  rudyStep4Source.includes('setQPhase("ready");'),
  "Rudy Step4 should not auto-complete or fake a passing score when no spoken attempt was captured"
);
const step4NoSpeechIndex = rudyStep4Source.indexOf("if (!hasRecognizedSpeech(data))");
const step4MarkSpokenIndex = rudyStep4Source.indexOf("markSpokenAttempt();");
const step4ScoreIndex = rudyStep4Source.indexOf("const score: number", step4NoSpeechIndex);
assert.ok(
  step4NoSpeechIndex >= 0 &&
  step4MarkSpokenIndex > step4NoSpeechIndex &&
  step4ScoreIndex > step4MarkSpokenIndex,
  "Rudy Step4 should count a spoken attempt only after speech recognition succeeds"
);
assert.ok(
  rudyLessonSource.includes("const stepCompletingRef = useRef(false);") &&
  rudyLessonSource.includes("stepCompletingRef.current = false;") &&
  rudyLessonSource.includes("if (stepCompletingRef.current) return;") &&
  rudyLessonSource.includes("stepCompletingRef.current = true;") &&
  rudyStep3Source.includes("const completeFiredRef = useRef(false);") &&
  rudyStep3Source.includes("const completeMissionTalkOnce = () =>") &&
  rudyStep3Source.includes("onPress={completeMissionTalkOnce}") &&
  rudyStep4Source.includes("const completeTimerRef = useRef") &&
  rudyStep4Source.includes("const completeFiredRef = useRef(false);") &&
  rudyStep4Source.includes("function finishReviewOnce()") &&
  rudyStep4Source.includes("if (completeFiredRef.current) return;"),
  "Rudy step completion should be reentrancy guarded so rapid taps cannot double-count spoken progress"
);
assert.ok(
  !rudyStep2Source.includes("NotificationFeedbackType.Error") &&
  !rudyStep2Source.includes("#f44336") &&
  !rudyStep4Source.includes("#e55757") &&
  rudyStep2Source.includes("Almost. Rudy would say it this way"),
  "Rudy correction UI should stay coach-like, not punishment-like"
);
for (const [name, source] of [
  ["Step1", rudyStep1Source],
  ["Step2", rudyStep2Source],
  ["Step3", rudyStep3Source],
  ["Step4", rudyStep4Source],
] as const) {
  assert.ok(
    source.includes("getWebRecordingMimeType") &&
    source.includes('isTypeSupported?.("audio/mp4")') &&
    source.includes('isTypeSupported?.("video/mp4")') &&
    source.includes("MediaRecorder creation failed") &&
    source.includes("MediaRecorder start failed"),
    `${name} should use Safari-safe MediaRecorder MIME fallback and catch startup failures`
  );
}
assert.ok(
  rudyStep1Source.includes("mediaRecRef.current.stream?.getTracks?.()") &&
  rudyStep2Source.includes("mediaRecRef.current.stream?.getTracks?.()") &&
  rudyStep4Source.includes("mediaRecRef.current.stream?.getTracks?.()") &&
  rudyStep3Source.includes("rec.stream?.getTracks?.()"),
  "Rudy web recording cleanup should stop microphone streams when leaving steps"
);
assert.ok(
  rudyStep1Source.includes("controller.abort(), 25000") &&
  rudyStep2Source.includes("controller.abort(), 25000") &&
  rudyStep4Source.includes("abortCtrl.abort(), 25000") &&
  rudyStep4Source.includes("}, 25000);"),
  "Rudy pronunciation assessment timeouts should not fire before the server/Azure window"
);
assert.ok(
  apiFetchWithAuthSource.includes("supabase.auth.getSession()") &&
    apiFetchWithAuthSource.includes('next.set("Authorization", `Bearer ${token}`)') &&
    apiFetchWithAuthSource.includes("export async function getAuthHeaderRecord") &&
    speakSource.includes("apiFetchWithAuth(apiUrl") &&
    speakSource.includes("apiFetchWithAuth(urlStr") &&
    basicCourseSource.includes("apiFetchWithAuth(apiUrl") &&
    basicCourseSource.includes("apiFetchWithAuth(url.toString())") &&
    basicCourseSource.includes("headers: await getAuthHeaderRecord()") &&
    cardsSource.includes("apiFetchWithAuth(url.toString())") &&
    cardsSource.includes("headers: await getAuthHeaderRecord()") &&
    rudyStep1Source.includes("apiFetchWithAuth(apiUrl") &&
    rudyStep2Source.includes("apiFetchWithAuth(apiUrl") &&
    rudyStep3Source.includes("apiFetchWithAuth(url") &&
  rudyStep4Source.includes("apiFetchWithAuth(url"),
  "Signed-in learners should send Supabase bearer tokens to voice, Basic Course, and Rudy API calls so server rate limits use user buckets"
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
      assert.ok(phrase.speechLang === "ko-KR" || phrase.speechLang === "en-US" || phrase.speechLang === "es-ES" || phrase.speechLang === "id-ID");
      assert.equal(phrase.practiceContext, goal, `${lang}/${goal}/${phrase.phrase} missing goal practice context`);
      assert.ok(phrase.contextTip, `${lang}/${goal}/${phrase.phrase} missing context tip`);
    }
  }
}

for (const lang of languages) {
  const unknownLoop = getDailySpeakingSentenceLoop(lang, "unknown");
  const phrases = new Set(unknownLoop.map((phrase) => phrase.phrase));
  for (const [family, familyPhrases] of Object.entries(SURVIVAL_PHRASE_FAMILIES[lang] ?? {})) {
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
assert.equal(
  getGoalContextTip("travel", "indonesian"),
  "Konteks perjalanan: pakai dengan petugas, sopir, penjual, atau orang asing yang bisa membantu."
);
assert.ok(getGoalContextTip("travel", "korean")?.startsWith("여행 상황:"), "travel context tip should localize to Korean");

const activeHomeMission = getTodaySpeakingMission("english", "korean", "travel", SPEAKING_DAILY_GOAL - 1);
assert.equal(activeHomeMission.dailyGoalMet, false);
assert.notEqual(activeHomeMission.phrase, `${SPEAKING_DAILY_GOAL} / ${SPEAKING_DAILY_GOAL}`);
assert.equal(activeHomeMission.button, "Start speaking");
assert.ok(activeHomeMission.rudyTip.startsWith("Rudy: "), "active home mission should include a Rudy guidance line");
const indonesianTravelHomeMission = getTodaySpeakingMission("indonesian", "english", "travel", 0);
assert.ok(
  indonesianTravelHomeMission.rudyTip.includes("Konteks perjalanan:"),
  "Indonesian-native travel home mission should show localized context"
);
assert.ok(
  !indonesianTravelHomeMission.rudyTip.includes("Travel context:"),
  "Indonesian-native travel home mission must not leak English context"
);
assert.ok(
  speakSource.includes("getGoalContextTip(phrase.practiceContext, nativeLang)"),
  "Speak daily phrases should resolve context tips in the learner's native language before render"
);
assert.ok(
  routesSource.includes('const { buffer: wavBuffer, contentType: sttContentType } = await convertTo16kMonoWav(rawBuffer, mimeType);') &&
  routesSource.includes('"Content-Type": sttContentType') &&
  routesSource.indexOf('m.includes("webm")') < routesSource.indexOf('m.includes("ogg") || m.includes("opus")'),
  "Indonesian pronunciation fallback should send raw webm/opus audio with the real Azure content type"
);

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
