/**
 * verify:escape-room-language — locks the escape-room language contract.
 *
 * Prevents regressions of the escape-room fixes:
 *  1. The writing-lock acceptable answers stay a PER-LANGUAGE map and a
 *     Korean/Arabic learner can't escape by typing the English form.
 *  2. The exit phrase isn't the old broken English ("Open the key").
 *  3. The per-language exit boss-spell (ESCAPE_BOSS_BY_LANG) stays present and
 *     the KO/AR sentence-lock degrade only accepts the learner's target form.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { ESCAPE_ROOMS } from "../lib/escapeRooms";

const room = ESCAPE_ROOMS["sealed-archive"];
assert(room, "sealed-archive escape room missing");

// 1. Writing-lock acceptableAnswers must be a per-language map, and KO/AR must
//    not accept an English form (English used to unlock every learner's lock).
const writing = room.locks.find((l) => l.kind === "writing") as
  | { question?: { acceptableAnswers?: unknown } }
  | undefined;
const acc = writing?.question?.acceptableAnswers as
  | Record<string, string[]>
  | string[]
  | undefined;
assert(
  acc && !Array.isArray(acc),
  "lockC acceptableAnswers must be a per-language map (a flat array let English unlock every learner)",
);
const EN_WORDS = ["free", "liberate", "set free", "open", "key"];
for (const lang of ["korean", "arabic"]) {
  const list = (acc as Record<string, string[]>)[lang];
  // Must use the FULL-name key — runtime (WritingLock) indexes acceptableAnswers
  // by learningLang ("korean"/"arabic"...). A short code ("ko"/"ar") would make
  // this undefined and silently drop the variants, so require a non-empty array.
  assert(
    Array.isArray(list) && list.length > 0,
    `lockC acceptableAnswers must use the full-name key "${lang}" with target variants (not a short code like "${lang.slice(0, 2)}")`,
  );
  for (const w of list) {
    assert(
      !EN_WORDS.includes(String(w).toLowerCase()),
      `lockC ${lang} must not accept the English form "${w}"`,
    );
  }
}

// 2. Exit phrase must not be the old broken English.
assert(
  !room.exit.spokenPhrase.en.toLowerCase().includes("open the key"),
  'exit spokenPhrase.en must not be the broken "Open the key" wording',
);

// 3. escape-room.tsx: per-language exit boss + target-only KO/AR degrade.
const src = readFileSync("app/escape-room.tsx", "utf8");
assert(src.includes("ESCAPE_BOSS_BY_LANG"), "ESCAPE_BOSS_BY_LANG (per-language exit boss) is missing");
const BOSS_MARKERS: Record<string, string> = {
  korean: '"열쇠로"',
  spanish: '"Usa"',
  indonesian: '"Gunakan"',
  arabic: '"اِسْتَخْدِم"',
};
for (const [lang, marker] of Object.entries(BOSS_MARKERS)) {
  assert(src.includes(marker), `ESCAPE_BOSS_BY_LANG is missing the ${lang} boss chunks (${marker})`);
}
assert(
  !src.includes("lock.clue.word.en, lock.clue.word.ko"),
  "KO/AR sentence-lock degrade must not accept all-language forms (English would pass)",
);
assert(
  src.includes("acceptableAnswers: { [learningLang]:"),
  "KO/AR degrade must use a target-only acceptableAnswers map",
);

console.log("escape-room language verification passed");
