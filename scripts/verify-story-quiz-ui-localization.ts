import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const storyQuizSource = readFileSync("components/story/StoryQuizModal.tsx", "utf8");
const chapterResultSource = readFileSync("components/story/ChapterResultScreen.tsx", "utf8");

const languages = ["ko", "es", "en", "id"] as const;
const requiredQuizKeys = [
  "passMark",
  "tryMark",
  "hideHint",
  "showHint",
  "correct",
  "correctHint",
  "answerPrefix",
  "notQuite",
  "send",
  "beachScene",
  "marketScene",
  "nightScene",
  "scene",
  "stop",
  "speak",
  "complete",
  "next",
  "nextStage",
  "nextRound",
  "seeResults",
  "speakLouder",
  "retry",
  "rescueStage",
  "rescueSuccess",
  "tryAgain",
  "micUnsupported",
  "micPermission",
  "micStartFailed",
  "evaluationError",
  "evaluating",
  "tapMic",
  "excellent",
  "keepTrying",
  "stonePrompt",
  "stoneChecking",
  "stoneResponds",
];

for (const key of requiredQuizKeys) {
  const line = storyQuizSource.split(/\r?\n/).find((item) => item.includes(`${key}:`));
  assert.ok(line, `StoryQuizModal QT must include ${key}`);
  for (const lang of languages) {
    assert.ok(line.includes(`${lang}:`), `${key} must include ${lang} copy`);
  }
}

const bannedStoryQuizPatterns = [
  {
    pattern: /<Text style=\{styles\.resultMarkText\}>\{passed \? "PASS" : "TRY"\}<\/Text>/,
    label: "result PASS/TRY marks",
  },
  {
    pattern: /<Text style=\{styles\.sendBtnText\}>Send<\/Text>/,
    label: "roleplay Send button",
  },
  {
    pattern: /recordState === "recording" \? "Stop" : "Speak"/,
    label: "recording Stop/Speak button",
  },
  {
    pattern: /beach_scene:\s*"Beach",\s*market_scene:\s*"Market",\s*night_scene:\s*"Night"/,
    label: "writing scene labels",
  },
];

for (const { pattern, label } of bannedStoryQuizPatterns) {
  assert.doesNotMatch(storyQuizSource, pattern, `${label} must use localized QT copy`);
}

assert.ok(
  storyQuizSource.includes('qt(recordState === "recording" ? "stop" : "speak", nl)'),
  "pronunciation-style mic buttons must use localized stop/speak labels",
);
assert.ok(
  storyQuizSource.includes('qt("send", quiz.nativeLang)'),
  "roleplay send button must use localized copy",
);
assert.ok(
  storyQuizSource.includes('qt("rescueStage", nl)') &&
    storyQuizSource.includes('qt("rescueSuccess", nl)') &&
    storyQuizSource.includes('qt("tryAgain", nl)'),
  "NPC rescue result copy must stay localized",
);

assert.doesNotMatch(
  chapterResultSource,
  /<Text style=\{styles\.badgePillText\}>BADGE<\/Text>/,
  "Chapter result badge pill must not be hard-coded English",
);
assert.ok(
  chapterResultSource.includes('const badgeLabel = lang === "ko"'),
  "Chapter result badge pill must derive a localized badge label",
);

console.log("story quiz UI localization verification passed");
