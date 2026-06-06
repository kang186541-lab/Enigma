# Story-mode language-contract overhaul — review handoff (for Codex)

**Date:** 2026-06-07
**Branch/commits (all live on https://web-dist2.vercel.app):**
- `3a30a39` — fix(story): localize Ch2/Ch4/Ch5 quiz answers to the learner's language
- `5cbe830` — feat(story+escape): localize boss spells, wire speakAfter, fix escape-room language contract + guards
- `5c601fc` — fix(story): smooth Ch5 Babel difficulty cliff (chapterMeta metadata only)

**Verification at each commit:** `tsc --noEmit` 0 · `verify:speaking-core` (LOCKED guardrail) green · `jest` 63/63 · `verify:quality` real-exit 0 (now includes the two new guards) · Vercel deploy `READY`.

> Please review for: translation correctness, boss-spell assembly correctness, the speakAfter control flow, any remaining "English unlocks a non-English lesson" path, and whether the deliberately-deferred items are the right calls.

---

## 0. Architecture facts these changes rely on (verify first)

1. **Story mode teaches the user's chosen `learningLanguage`** (korean/english/spanish/indonesian/arabic), not a per-chapter fixed language. `learningLang = learningLanguage ?? "english"` at `app/story-scene.tsx:7271` (from `useLanguage()`). UI strings use the separate native `lang`.
2. **Quiz answers/options render via `tri(answer, learningLang)`** — `tri()` at `app/story-scene.tsx:464-470`; consumed e.g. DialogueChoicePuzzle `app/story-scene.tsx:5867-5869`, FillBlank `:5730-5732`, WordMatch `:5694`, SentenceBuilder `:5996`. ⇒ Filling the `es/id/ko/ar` slots of an answer `Tri` localizes it for those learners; the `en` slot is untouched, so **English learners are unaffected**.
   - NOTE: an early agent claimed the ko/es/id slots are "never read" and Madrid is English-only — that is **WRONG** (it tested with the default `learningLang="english"`). Confirmed Model A above.
3. **Boss spell** (`components/story/puzzles/BossSpellPuzzle/index.tsx`): `spellChunks`/`separators`/`wordPool` are plain `string[]` rendered raw; a tapped card matches the expected chunk by **exact string equality** (`index.tsx:244`); the h3 answer-reveal + door engraving derive from `spellText = buildSpell(spellChunks, separators)` (`index.tsx:116, 313-322, 489`). ⇒ Overriding the three arrays localizes the assemble puzzle **and** auto-localizes the reveal; chunk localization must be done in code (no `Tri` for chunks).
4. **`chapterMeta` fields** (`cefrLevel`, `targetLangRatio`, `knownExpressions`, `languageNote`) are **read by zero runtime code** and not referenced by the locked `verify-speaking-core.ts` — pure authoring metadata.

---

## 1. Quiz-answer localization — `3a30a39` (`app/story-scene.tsx`)

27 dialogue-choice `answer`/`wrong` `Tri` maps in **Ch2 Madrid, Ch4 Cairo, Ch5 Babel** were English duplicated into the `ko/es/id/ar` slots; filled with native translations:
- `ko` polite 존댓말; `es`; `id`; `ar` **Egyptian colloquial with harakat** (e.g. `أَنَا مَبْسُوط.`).
- `en` left unchanged.
- **Ch3 Seoul intentionally kept Korean in every slot** — it is the Korean-immersion chapter, its polite/casual register lesson is Korean-specific, and `verify-speaking-core` locks its Korean speaking target.

**Generation:** an agent workflow generated each chapter's translations, then a strict native-reviewer agent corrected them (e.g. Egyptian participle parallelism فاكِر/ناسِي, feminine agreement for Mira-directed lines, dropped unwarranted conjunctions in the Babel boss).
**Review ask:** native-speaker spot-check of the AR (Egyptian + harakat) and KO register; confirm no answer still reads as English for a non-English learner.

## 2. Boss-spell localization — `5cbe830`

- **New `lib/storyBossSpellLocalized.ts`**: per-language `{spellChunks, separators, wordPool}` for `madrid`/`cairo`/`babel` (Seoul intentionally absent), each assembly-verified by an agent against `buildSpell`. `localizeStoryBoss()` is wired at the boss render in `app/story-scene.tsx` (`puzzle={localizeStoryBoss(item, story.id, learningLang)}`).
- **Escape room** (`app/escape-room.tsx`): `ESCAPE_BOSS_BY_LANG` replaces the Arabic-only `bossSpellForLearning` so ko/es/id/ar all get localized exit chunks (was: every non-Arabic learner assembled the English spell).
**Invariant (enforced by `verify:story-curriculum`):** `separators.length === spellChunks.length`, all chunks distinct (engine dedupes by string → a duplicate is unsolvable), `wordPool ⊇ spellChunks`.
**Review ask:** confirm each language's chunks join (with its separators) into a grammatical target sentence (the guard checks structure, not linguistic correctness).

## 3. speakAfter — `5cbe830`

The `speakAfter: true` flag existed on ~45 quizzes but was **never read** (dead data). Now:
- **New `components/story/StorySpeakAfterCard.tsx`** — Rudy TTS reads the line → record once (`recordAudio` + `/api/pronunciation-assess`) → pronunciation score; **accept-unscored on provider outage**; a "later" skip so it **never blocks** progress.
- `getSpeakAfterSentence()` (module helper, `app/story-scene.tsx` near `tri()`) derives the target-language sentence per puzzle type; returns `null` safely for types it can't handle.
- Fired from `handlePuzzleSolved` for the **first** speakAfter language-quiz per chapter **plus every boss** (throttle via `speakAfterShownRef`); `deferAdvance` gates the existing `advance()` so XP still fires once and the card's `onDone`/`onRequestClose` calls `advance()`.
**Review ask:** the defer/advance flow (no double-advance, no double-XP, no trap); `getSpeakAfterSentence` null-safety; the per-type sentence choice.

## 4. Escape-room language contract — `5cbe830`

- **English no longer unlocks a KO/AR lesson:** `acceptableAnswers` is now a per-language map (`lib/escapeRoomPuzzleTypes.ts` widened the type; `components/escape/WritingLock.tsx` resolves `acceptableAnswers[learningLang]`; `lib/escapeRooms.ts` lockC data; `app/escape-room.tsx` KO/AR sentence-lock **degrade** now passes only `{ [learningLang]: [target] }`).
- **"Open the key" (broken English) → "Use the key, free every word"** per language (exit `spokenPhrase`, default boss chunks, h1/h2). `h3` auto-derives from `spellText`.
- Story tab labels the entry **"(Beta)"** (`app/(tabs)/story.tsx`).
**Review ask:** any remaining path where a KO/AR learner passes via English. NOTE: the SpeakingLock **accept-unscored outage fallback** (`components/escape/SpeakingLock.tsx:119-127`) is **intentional** brand behavior (continue-without-score) — left as-is by design.

## 5. Difficulty rebalance — `5c601fc` (`app/story-scene.tsx`, Babel `chapterMeta` only)

Codex flagged Ch5 jumping to B1 (`targetLangRatio: 72`) right after Cairo's A2/48 (a +24 cliff).
- `targetLangRatio 72 → 56` (keeps the ~+8/chapter ramp; curve is now 30/38/42/48/56)
- `cefrLevel "B1" → "A2"` (enum at `:354` allows A1/A2/B1/B2/C1/C2)
- `knownExpressions += "Thank you" / "She wrote" / "the lullaby"` (documents reuse)
- `languageNote` documents the held-at-A2 intent
**Safe because** these fields are unread by runtime (§0.4). **No** boss chunk, narrative, `targetExpressions`, or guardrail change.

## 6. Regression guards — `5cbe830` (added to the `verify:quality` chain)

- `scripts/verify-story-curriculum.ts` — boss-override assembly invariants; `localizeStoryBoss`/`getSpeakAfterSentence`/`StorySpeakAfterCard` wiring locks; English-duplication regression checks on the localized answers.
- `scripts/verify-escape-room-language.ts` — lockC acceptableAnswers is a per-language map with no English in KO/AR; exit phrase isn't "Open the key"; `ESCAPE_BOSS_BY_LANG` per-language present; degrade is target-only.

---

## Deliberately NOT changed — please weigh in

1. **`"the words"` in the Babel boss `targetExpressions`** (`app/story-scene.tsx` ~5462-5463). A difficulty-agent proposed moving it to `previouslyLearned` for reuse accounting; an adversarial pass **rejected** it because `targetExpressions` is live input to `addToExpressionBook` / `markExpressionsMastered` (tprsStage 4) / `addSrsPhrases` at `:7754-7771` (and `StoryQuizModal.tsx:2322-2325`) — removing it silently drops the phrase from the expression book, mastery set, and Leitner SRS. Treated as a **product decision**, not a silent edit. Current default: kept.
2. **Ch5 Babel boss 2-clause compound** ("You translated the words. You couldn't translate why she said them.") — kept. Rewriting reopens 5-language assembly QA; the metadata/scaffolding already smooth the curve. Deferred.
3. **Escape SpeakingLock accept-unscored outage fallback** — intentional; closing the residual spoken-English-on-outage path is a product call.

## Known minor
- `components/story/StorySpeakAfterCard.tsx:76` — unused `attempts` state (1 lint warning; consistent with 46 pre-existing warnings, non-blocking). 1-line cleanup, rides next deploy.

## Files touched
- `app/story-scene.tsx` (answers, boss wiring, speakAfter wiring, Babel metadata)
- `app/escape-room.tsx`, `lib/escapeRooms.ts`, `lib/escapeRoomPuzzleTypes.ts`, `components/escape/WritingLock.tsx`, `app/(tabs)/story.tsx`
- NEW: `components/story/StorySpeakAfterCard.tsx`, `lib/storyBossSpellLocalized.ts`, `scripts/verify-story-curriculum.ts`, `scripts/verify-escape-room-language.ts`
- `package.json` (script registrations + `verify:quality` chain)
