/**
 * verify:story-curriculum — locks the story-mode language contract.
 *
 * Prevents regressions of the Ch2/Ch4/Ch5 localization work:
 *  1. Per-language boss-spell overrides keep their assembly invariants
 *     (separators length, all-distinct chunks, wordPool superset) so a future
 *     edit can't silently make a boss unsolvable.
 *  2. The story render stays wired to localizeStoryBoss + the speakAfter card.
 *  3. Quiz answers don't revert to English duplicated into the ko/es/ar slots
 *     (the original bug where a Spanish/Korean learner saw English answers).
 *
 * Ch3 Seoul is intentionally NOT checked for localization — it is the
 * Korean-immersion chapter (Korean in every slot by design), so it has no boss
 * override here and its answers stay Korean.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { STORY_BOSS_SPELL_LOCALIZED } from "../lib/storyBossSpellLocalized";

const LANGS = ["korean", "spanish", "indonesian", "arabic"] as const;

// 1. Boss-spell override invariants (assembly safety) for the localized chapters.
for (const ch of ["madrid", "cairo", "babel"]) {
  const chap = STORY_BOSS_SPELL_LOCALIZED[ch];
  assert(chap, `boss override missing for chapter "${ch}"`);
  for (const lang of LANGS) {
    const ov = chap[lang];
    assert(ov, `boss override missing: ${ch}.${lang}`);
    assert.equal(
      ov.separators.length,
      ov.spellChunks.length,
      `${ch}.${lang}: separators length must equal spellChunks length`,
    );
    assert.equal(
      new Set(ov.spellChunks).size,
      ov.spellChunks.length,
      `${ch}.${lang}: spellChunks must be all-distinct (a duplicate makes the boss unsolvable)`,
    );
    assert.equal(
      new Set(ov.wordPool).size,
      ov.wordPool.length,
      `${ch}.${lang}: wordPool must be all-distinct`,
    );
    for (const c of ov.spellChunks) {
      assert(ov.wordPool.includes(c), `${ch}.${lang}: wordPool must contain chunk "${c}"`);
    }
  }
}

// 2. story render wiring must stay in place.
const story = readFileSync("app/story-scene.tsx", "utf8");
assert(
  story.includes("localizeStoryBoss(item, story.id, learningLang)"),
  "boss render must call localizeStoryBoss (per-language boss localization)",
);
assert(story.includes("getSpeakAfterSentence("), "speakAfter must be wired (getSpeakAfterSentence)");
assert(story.includes("StorySpeakAfterCard"), "StorySpeakAfterCard must be rendered after a language quiz");

// 3. Regression guard: localized quiz answers must not revert to English in the
//    non-English slots (the original "English answer for every learner" bug).
const REVERTS = [
  'ko: "I am happy."',
  'es: "I am happy."',
  'ko: "I remember."',
  'ar: "I remember."',
  'ko: "We are together."',
  'es: "We are together."',
];
for (const smell of REVERTS) {
  assert(!story.includes(smell), `English-duplication regression in a story quiz answer: ${smell}`);
}
const REQUIRED = ['ko: "저는 행복해요."', 'es: "Estoy feliz."', 'ko: "저는 기억해요."', 'es: "Estamos juntos."'];
for (const r of REQUIRED) {
  assert(story.includes(r), `expected localized quiz answer is missing: ${r}`);
}

// Completeness scan: no dialogue/fill-blank `answer` may duplicate ASCII-English
// into the Korean slot (the "English-stuck" bug) across ANY active chapter.
// Seoul answers carry Korean in the `en` slot too (en === ko but not ASCII), so
// they are correctly NOT flagged; a genuine English answer cloned into ko is.
const ANSWER_RE = /answer:\s*\{\s*en:\s*"((?:[^"\\]|\\.)*)",\s*ko:\s*"((?:[^"\\]|\\.)*)"/g;
for (let mm = ANSWER_RE.exec(story); mm; mm = ANSWER_RE.exec(story)) {
  const en = mm[1];
  const ko = mm[2];
  assert(
    !(en === ko && /[A-Za-z]/.test(en)),
    `English-stuck dialogue answer (ko slot duplicates the English en): "${en}"`,
  );
}

console.log("story curriculum verification passed");
