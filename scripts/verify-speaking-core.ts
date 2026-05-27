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
  SPEAKING_DAILY_GOAL,
} from "../lib/speakingProgress";
import { getTodaySpeakingMission } from "../lib/homeSpeakingMission";
import type { LearningGoal, SpeakingProgress } from "../lib/learnerProfile";
import { RUDY_GUIDE_CARDS } from "../lib/rudyGuideCards";

const languages: DailySpeakingLanguage[] = ["korean", "english", "spanish"];
const goals: LearningGoal[] = ["travel", "work", "study", "hobby", "relationship", "exam", "unknown"];
const onboardingSource = readFileSync("app/onboarding.tsx", "utf8");
const speakSource = readFileSync("app/(tabs)/speak.tsx", "utf8");

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
  onboardingSource.includes('mission: "first-sentence"') && onboardingSource.includes("goal: goalSel"),
  "Onboarding should route the learner into a personalized first speaking sentence"
);
assert.ok(
  speakSource.includes("nextMissionPreview") && speakSource.includes("getNextMissionPreviewTitle"),
  "First speaking completion should preview the next real sentence instead of feeling like a dead-end completion screen"
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

const completedHomeMission = getTodaySpeakingMission("english", "korean", "travel", SPEAKING_DAILY_GOAL);
assert.equal(completedHomeMission.dailyGoalMet, true);
assert.equal(completedHomeMission.phrase, `${SPEAKING_DAILY_GOAL} / ${SPEAKING_DAILY_GOAL}`);
assert.equal(completedHomeMission.button, "Keep speaking");
assert.ok(completedHomeMission.context.includes("free practice"));

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
