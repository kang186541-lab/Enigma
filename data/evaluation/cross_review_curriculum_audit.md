# Cross-Review Curriculum Audit

**Auditor:** Claude Opus 4.6 (Cross-Review Auditor)
**Date:** 2026-03-30
**Scope:** Daily Course Days 1-30, Story Mode Chapters 1-5, Step1ListenRepeat Round 3

---

## Part 1: Daily Course Content Quality

### Structural Verification (All 30 Days)

| Check | Result |
|-------|--------|
| All 3 language tracks present (en, es, ko) per day | PASS -- every day in all 5 unit files has `english`, `spanish`, and `korean` entries |
| Step 1 sentences per day | PASS -- Days 1-6 have 5-6 sentences; Days 7-30 have 5 sentences consistently |
| Step 2 quizzes per day | PASS -- each day has 5-6 quizzes with mix of `select`, `input`, and `listening` types |
| `step1Config` with `hasAudioOnlyRound` | PASS -- present in all days, all three tracks |
| `recallRound: true` flags on sentences | PASS -- present on 2 sentences per day for round 3 targeting |

### Bad Sentence Fixes (Priority Check)

| Day | Expected Fix | Actual Content | Status |
|-----|-------------|----------------|--------|
| Day 7 | "It's three thirty." (NOT "a compound number!") | `"It's three thirty."` (line 45, day7_12_unit2.ts) | **PASS -- FIXED** |
| Day 8 | "What are you doing this weekend?" (NOT "Saturday and Sunday are the weekend") | `"What are you doing this weekend?"` (line 122, day7_12_unit2.ts) | **PASS -- FIXED** |
| Day 26 | "She is very tall and has long hair." (NOT "She looks young but she is thirty") | `"She is very tall and has long hair."` (line 131, day25_30_unit5.ts) | **PASS -- FIXED** |

All three previously flagged bad sentences have been corrected.

### Step 1 Sentence Naturalness (Flag Issues Only)

- **Day 2 (all tracks):** "Yes. / No." -- presenting two answers separated by a slash as a single sentence is slightly unusual for listen-and-repeat. Learners may find the slash confusing when spoken aloud. Minor issue.
- **Day 7 (all tracks):** The first two sentences are very long number sequences ("One, two, three... ten." and "Eleven, twelve... twenty."). While pedagogically useful, these are not natural conversational sentences. Acceptable for a numbers-focused lesson but worth noting.
- **All other sentences across Days 1-30:** Natural, conversational, and representative of real-world usage. Survival phrases are well-integrated throughout.

### Step 2 Quiz Correctness (Flag Issues Only)

All quizzes verified across Days 1, 2, 3, 7, 8, 15, 21, 26, 27 (sampled). Findings:

- Quiz answers correctly match the Step 1 vocabulary for all sampled days.
- Quiz types include `select`, `input`, `fill_blank`, and `listening` -- good variety.
- No incorrect answers found in any sampled quiz.
- All `listening` quizzes have `audioOnly: true` and `correct` index matching the first option (index 0), which is consistent.

### Step 4 Review Items

The audit focused on `crossUnitReview` arrays, which serve as the Step 4 survival phrase review mechanism.

**ISSUE: Day 13-18 (Unit 3) has NO `crossUnitReview` arrays.**

| File | crossUnitReview present? |
|------|------------------------|
| day1_6_improved.ts | NO -- no crossUnitReview found |
| day7_12_unit2.ts | NO -- no crossUnitReview found |
| day13_18_unit3.ts | NO -- no crossUnitReview found |
| day19_24_unit4.ts | YES -- all days have crossUnitReview |
| day25_30_unit5.ts | YES -- all days have crossUnitReview |

Units 1-3 (Days 1-18) lack `crossUnitReview` arrays entirely. Only Units 4 and 5 (Days 19-30) include them.

### Cross-Unit Survival Phrase Review (Days 15, 21, 27)

| Day | Has crossUnitReview? | Content |
|-----|---------------------|---------|
| Day 15 | **NO** -- missing entirely | Unit 3 file has no crossUnitReview for any day |
| Day 21 | YES | "Sorry, I don't understand." (Day 1) + "Can you say that again slowly?" (Day 2) |
| Day 27 | YES | "I would like to order, please." (Day 11) + "Are you hungry?" (Day 11) |

**FINDING:** Day 15 is missing its survival phrase review items. This is a gap in the curriculum -- Day 15 should have crossUnitReview referencing earlier survival phrases (e.g., from Days 1-6).

### Cross-Unit Review Quality (Units 4-5)

The crossUnitReview content in Units 4-5 is well-designed:
- Day 19-20: References Day 1 survival phrases (greetings, "Sorry, I don't understand")
- Day 21-22: Same Day 1-2 references
- Day 23: Food/ordering references (Day 11)
- Day 24: Direction/subway references (Day 19)
- Day 25-26: Price references (Day 6)
- Day 27-28: Food/ordering references (Day 11)
- Day 29: Direction references (Day 19)
- Day 30: Greeting + bathroom/lost references (Day 1)

This provides good spiral review coverage.

---

## Part 2: Story Quiz / Curriculum Connection

### Chapter 1: London (Day 1-6 vocabulary expected)

**Quiz vocabulary used:**

| Puzzle | Type | Key Vocabulary |
|--------|------|---------------|
| Puzzle 1 | dialogue-choice | hello, my name is, nice to meet you, I'm from, I am a detective, goodbye, sorry, where is, help |
| Puzzle 2 | word-match | Hello, Goodbye, Where is...?, I am a... |
| Puzzle 3 | fill-blank | Hello, name, Goodbye |
| Writing | writing-mission | "Hello, my name is Rudy.", "Nice to meet you." |

**Alignment check:**
- "Hello, my name is" -- Day 1 (MATCH)
- "Nice to meet you" -- Day 1 (MATCH)
- "Where are you from" / "I'm from" -- Day 2 (MATCH)
- "I am a detective" / job vocabulary -- Day 3 (MATCH)
- "Sorry, I don't understand" -- Day 1 (MATCH)
- "Help" -- Day 1 (MATCH)
- "Goodbye" -- Day 4-5 range (MATCH)
- "Thank you" -- Day 1 (MATCH)

**RESULT: PASS** -- All Ch1 quiz vocabulary aligns with Day 1-6 curriculum. No out-of-scope vocabulary.

### Chapter 2: Madrid (Day 1-18 vocabulary expected)

**Quiz vocabulary used:**

| Puzzle | Type | Key Vocabulary |
|--------|------|---------------|
| Puzzle 1 | dialogue-choice | Good morning, I would like coffee please, How much is it?, Yes please, bread, ham, delicious, thank you |
| Puzzle 2 | word-match | How much is this?, delicious, goodbye |
| Writing | writing-mission | "Excuse me. I would like bread, please.", "How much is this?", "Thank you very much!" |
| Puzzle 3 | sentence-builder | Hello, I need help, Where is the bathroom, Help please help me |
| Puzzle 4 | investigation | That's fifteen dollars (price), Can I have water please? (restaurant) |

**Alignment check:**
- Greetings (Good morning, Hello) -- Day 1, Day 4 (MATCH)
- Food ordering ("I would like... please") -- Day 13-14 (MATCH)
- Price vocabulary ("How much is this?", "fifteen dollars") -- Day 7 numbers + Day 15 prices (MATCH)
- "delicious" -- Day 14 food vocab (MATCH)
- "Where is the bathroom?" -- Day 4-5 survival vocab (MATCH)
- "Help, please help me" -- Day 1 survival (MATCH)

**RESULT: PASS** -- Ch2 correctly uses market/food vocabulary from Days 13-18 combined with earlier basics.

### Chapter 3: Seoul (Day 1-30 vocabulary expected)

**Quiz vocabulary used:**

| Puzzle | Type | Key Vocabulary |
|--------|------|---------------|
| Puzzle 1 | word-match | exit, subway station, taxi, excuse me |
| Puzzle 2 | dialogue-choice | "Please go to Namsan", "How much is it?", "My name is Rudy", "I am looking for Sujin" |
| Writing | writing-mission | "Do you speak English?", "This is delicious. Thank you!", "Where is the subway?" |
| Puzzle 3 (sentence-builder, later) | "My friend is very kind" (Day 25-26 vocab) |

**Alignment check:**
- "exit, subway station, taxi" -- Day 19-20 transport vocabulary (MATCH)
- "Excuse me, please go to [place]" -- Day 19-21 directions (MATCH)
- "How much is it?" -- Day 15 prices (MATCH)
- "Do you speak English?" -- Day 3 (MATCH)
- "Where is the subway?" -- Day 19 (MATCH)
- "My friend is very kind" -- Day 25-26 (MATCH)

**RESULT: PASS** -- Ch3 correctly uses direction/transport vocabulary from Days 19-24 and integrates earlier material.

### Chapter 4: Cairo (Day 1-30 vocabulary + contextual extensions)

**Quiz vocabulary used:**

| Puzzle | Type | Key Vocabulary |
|--------|------|---------------|
| Puzzle 1 | word-match | map, key, water |
| Puzzle 2 | dialogue-choice | Investigation dialogue (contextual), "the stone that does not move", "Saqqara" |
| Writing | writing-mission | "Where is the market?", "How far is it from here?", "Thank you for your help." |
| Puzzle 3 | fill-blank | "near" (directions), "midnight" (time) |
| Puzzle 4 | investigation | Narrative/moral reasoning about Universal Code |

**Alignment check:**
- "map" -- contextual extension, not directly taught but inferable (Day 19-21 navigation context)
- "key" -- contextual extension, basic object vocabulary
- "water" -- Day 13-14 food/drinks, also survival vocab
- "Where is the market?" -- Day 19-21 direction patterns (MATCH)
- "How far is it?" -- Day 20-21 distance vocab (MATCH)
- "near" -- Day 20-21 direction vocabulary (MATCH)
- "midnight" -- Day 9 time vocabulary extension (ACCEPTABLE -- "three o'clock" and "half past seven" are from Day 9, "midnight" is a contextual extension)

**RESULT: PASS** -- Ch4 uses Day 1-30 vocabulary with reasonable contextual extensions. No wildly advanced vocabulary.

### Chapter 5: Babel (Day 1-30 vocabulary, all cumulative)

**Quiz vocabulary used:**

| Puzzle | Type | Key Vocabulary |
|--------|------|---------------|
| Puzzle 1 | dialogue-choice | Hello, goodbye, Buenos dias, Gracias, Lo siento, Adios |
| Puzzle 2 | word-match | Hello, Thank you, Are you okay? |
| Writing | writing-mission | "Thank you for believing in us", "Your brother would be proud", "Together, we can stop this" |
| Puzzle 3 | sentence-builder | "My friend is very kind" (Korean: je chinguneun maeu chinjeolhaeyo) |
| Puzzle 4 | investigation | Narrative reasoning -- choosing Mr. Black's voluntary surrender |

**Alignment check:**
- All basic greetings, farewells, thanks -- Days 1-6 (MATCH)
- Spanish phrases (Buenos dias, Gracias, Lo siento, Adios) -- Days 1-6 Spanish track (MATCH)
- "Are you okay?" -- contextual extension, but inferable from Day 4-5 well-being phrases (ACCEPTABLE)
- "My friend is very kind" -- Day 26 (MATCH -- exact sentence from curriculum)
- Writing mission uses emotional/contextual language but stays within learner-accessible structures (ACCEPTABLE)

**RESULT: PASS** -- Ch5 is a capstone chapter that correctly draws from all 30 days without introducing inaccessible vocabulary.

---

## Part 3: Step1ListenRepeat Round 3 Verification

**File:** `components/rudy/Step1ListenRepeat.tsx`

### Checklist

| Requirement | Status | Evidence |
|------------|--------|----------|
| Round 3 (audio-only recall) implemented | **PASS** | Line 27: `const BASE_ROUNDS = 2;` + lines 57-79: `hasRound3` logic, `sentencesWithRound3` set, `totalRoundsForSentence()` returns 3 when enabled |
| Text hidden during Round 3 | **PASS** | Line 406: `{isAudioOnlyRound && !textRevealed ? audioOnlyPlaceholder : sentence.text}` |
| Text revealed after user records | **PASS** | Line 316: `if (isAudioOnlyRound) setTextRevealed(true);` inside `submitAssessment`'s `finally` block |
| `TOTAL_ROUNDS` uses `totalRoundsForSentence()` | **PASS** | Line 371: `const TOTAL_ROUNDS_FOR_SENT = totalRoundsForSentence(sentIdx);` -- dynamic, not a fixed constant |
| Round 3 label shows correct text | **PASS** | Line 365: `nativeLang === "korean" ? "기억해서 말하기" : nativeLang === "spanish" ? "Di de memoria" : "Say from memory"` |
| Round label (Rudy tip) shows correct text | **PASS** | Line 384: `roundLabel` for `round === 2` shows "기억해서 말하기" / "Di de memoria" / "Say from memory" |
| Meaning hidden during audio-only round | **PASS** | Lines 408-409: meaning text only shown when `!(isAudioOnlyRound && !textRevealed)` |
| Sentence tracking with recallRound flag | **PASS** | Lines 60-75: sentences with `recallRound: true` are collected; fallback to last N sentences |
| audioOnlyCount configuration respected | **PASS** | Line 66-67: `step1Config?.audioOnlyCount` limits which sentences get round 3 |
| textRevealed resets on advance | **PASS** | Lines 343, 349: `setTextRevealed(false)` in both next-round and next-sentence branches |

### Implementation Quality Notes

The Round 3 implementation is clean and well-structured:
- The `isAudioOnlyRound` boolean is derived from three conditions: `round === 2 && hasRound3 && sentencesWithRound3.has(sentIdx)` (line 82)
- Audio-only placeholder text provides a visual cue with speaker emoji: "Listen and repeat" in all three languages (lines 86-88)
- The reveal flow is: user records -> assessment completes -> `finally` block sets `textRevealed(true)` -> text appears with meaning
- Progress tracking correctly accounts for variable rounds per sentence via `totalRoundsForSentence()` (lines 386-388)

**RESULT: PASS** -- Round 3 is properly implemented with no issues found.

---

## Summary of Findings

### Issues Found

| # | Severity | Location | Description |
|---|----------|----------|-------------|
| 1 | **MEDIUM** | day13_18_unit3.ts | **Missing crossUnitReview for all of Unit 3 (Days 13-18).** Days 15 specifically should have survival phrase review items per the curriculum spec. Unit 4-5 have them, Units 1-3 do not. |
| 2 | **LOW** | day1_6_improved.ts, day7_12_unit2.ts | **Missing crossUnitReview for Units 1-2 (Days 1-12).** While Days 1-6 may not need cross-unit review (they are the first unit), Days 7-12 would benefit from reviewing Unit 1 survival phrases. |
| 3 | **LOW** | Day 2, all tracks | "Yes. / No." as a single listen-and-repeat sentence is slightly unnatural for speech practice due to the slash separator. |
| 4 | **LOW** | Day 7, all tracks | First two sentences are long number sequences rather than conversational sentences. Acceptable for a numbers lesson but not natural speech. |

### What Is Working Well

- **Bad sentence fixes:** All three previously flagged issues (Day 7, 8, 26) are confirmed fixed.
- **3-language parity:** Every day has complete en/es/ko tracks with parallel content.
- **Quiz-to-lesson alignment:** Step 2 quizzes consistently test vocabulary introduced in Step 1.
- **Story-curriculum alignment:** All 5 chapters correctly use vocabulary from the expected day ranges. No chapter introduces vocabulary that a Day 30 graduate could not handle.
- **Round 3 implementation:** Audio-only recall is properly implemented with all required behaviors (text hiding, reveal after attempt, dynamic round counting, correct labels in all 3 UI languages).
- **Survival phrase integration:** Days 1-6 embed survival phrases directly into Step 1 sentences. Units 4-5 have robust crossUnitReview coverage.
- **Quiz variety:** Good mix of select, input, fill_blank, and listening quiz types across all days.

### Overall Score

| Category | Score |
|----------|-------|
| Daily Course Content Quality | **8.5/10** -- Excellent content with minor gaps in crossUnitReview for Units 1-3 |
| Story-Curriculum Vocabulary Alignment | **9.5/10** -- Near-perfect alignment across all 5 chapters |
| Step1ListenRepeat Round 3 | **10/10** -- Fully implemented, no issues |
| **Overall** | **9/10** |

### Recommendations

1. **Add crossUnitReview to day13_18_unit3.ts** -- At minimum, Day 15 needs survival phrase review items. Suggested content: review "Thank you" (Day 1), "Sorry, I don't understand" (Day 1), and "Can you say that again?" (Day 2).
2. **Consider adding crossUnitReview to day7_12_unit2.ts** -- Days 9-12 would benefit from reviewing Day 1-6 survival phrases to reinforce retention.
3. **Minor: Rephrase Day 2 "Yes. / No."** -- Consider splitting into two separate sentences or reformulating as "Yes, I understand." and "No, thank you." for more natural speech practice.
