import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const storyQuizSource = readFileSync("components/story/StoryQuizModal.tsx", "utf8");
const chapterResultSource = readFileSync("components/story/ChapterResultScreen.tsx", "utf8");

const languages = ["ko", "es", "en", "id"] as const;
const requiredQuizKeys = [
  "passMark",
  "tryMark",
  "play",
  "typeAnswer",
  "typeTarget",
  "translationPlaceholder",
  "writeResponse",
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
  "wonRound",
  "lostRound",
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
  "typeArgument",
  "useExpressions",
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
    pattern: /\{playing \? qt\("playing", quiz\.nativeLang\) : "Play"\}/,
    label: "listening TTS Play button",
  },
  {
    pattern: /placeholder="Answer\.\.\."/,
    label: "listening answer placeholder",
  },
  {
    pattern: /placeholder="Translation\.\.\."/,
    label: "translation placeholder",
  },
  {
    pattern: /placeholder="Type in target language\.\.\."/,
    label: "roleplay target-language placeholder",
  },
  {
    pattern: /Describe in \$\{quiz\.targetLang/,
    label: "writing describe placeholder",
  },
  {
    pattern: /placeholder="Write your response\.\.\."/,
    label: "roleplay response placeholder",
  },
  {
    pattern: /Min\. \{prompt\.minSentences\} sentences/,
    label: "writing minimum sentence label",
  },
  {
    pattern: /ROUND \{roundIdx \+ 1\} \/ \{totalRounds\}/,
    label: "debate round counter",
  },
  {
    pattern: /nl === "ko" \? "반론 제출" : "Submit Argument"/,
    label: "debate submit button",
  },
  {
    pattern: /feedback\.won \? \(nl === "ko" \? "이 라운드 승리!" : "You won this round!"\)|isLast \? \(nl === "ko" \? "결과 보기" : "See Results"\)|nl === "ko" \? "다음 라운드" : "Next Round"/,
    label: "debate feedback/actions",
  },
  {
    pattern: /Quiz type not yet supported: \$\{quiz!\.type\}/,
    label: "unsupported quiz type fallback",
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
assert.ok(
    storyQuizSource.includes("translateInstruction(quiz.targetLang, quiz.nativeLang)") &&
    storyQuizSource.includes("describeInstruction(quiz.targetLang, quiz.nativeLang)") &&
    storyQuizSource.includes("minSentencesLabel(prompt.minSentences, quiz.nativeLang)") &&
    storyQuizSource.includes("roundCounterLabel(round + 1, rounds.length, quiz.nativeLang)") &&
    storyQuizSource.includes("roundCounterLabel(roundIdx + 1, totalRounds, nl)") &&
    storyQuizSource.includes("unsupportedQuizTypeLabel(quiz!.type, quiz!.nativeLang)") &&
    storyQuizSource.includes('id: "indonesian"') &&
    storyQuizSource.includes('placeholder={qt("typeArgument", nl)}') &&
    storyQuizSource.includes('qt("submitArgument", nl)') &&
    storyQuizSource.includes('qt("useExpressions", nl)'),
  "story quiz prompts, writing labels, debate labels, target-language maps, and fallback messages must stay localized",
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
