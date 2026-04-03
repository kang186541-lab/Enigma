# Story Improvements — Phase 1 Evaluation Fixes

**Date:** 2026-03-29
**Scope:** Ch1–Ch3 story mode, quizData.json, storyData.json, story-scene.tsx

---

## Changes Made

### TASK 1 — Added Pronunciation Quizzes to quizData.json

**File:** `data/quizData.json`

Three new quizzes of type `"pronunciation"` were inserted, each placed immediately after the last existing quiz for its chapter (before the next chapter begins):

| Quiz ID | Chapter | Insertion Point | XP |
|---|---|---|---|
| `ch1_quiz_speak_a` | ch1 | After `ch1_quiz_e` (boss riddle) | 50 |
| `ch2_quiz_speak_a` | ch2 | After `ch2_quiz_e` (boss timed) | 75 |
| `ch3_quiz_speak_a` | ch3 | After `ch3_quiz_e` (boss mixed) | 80 |

- **ch1_quiz_speak_a** — "Mr. Black's Message": Players read Mr. Black's two canonical phrases aloud (`targetScore: 70`). Reinforces Ch1 vocabulary: greetings, farewells, self-introduction.
- **ch2_quiz_speak_a** — "Don Miguel's Order": 3 market phrases (ordering bread, asking price, thanking). Ties directly to the market scene NPCinstrictions. `targetScore: 65`.
- **ch3_quiz_speak_a** — "At Incheon Airport": 3 survival phrases for the airport (asking about English, asking for repetition, finding the subway). Mirrors Rudy's dead-phone predicament. `targetScore: 60`.

All quizzes are trilingual (ko/en/es) and include per-question hints. JSON structure validated — no trailing commas, properly closed arrays/objects.

---

### TASK 2 — Linked Pronunciation Quizzes to Scene Arrays in storyData.json

**File:** `data/storyData.json`

| Scene | Added Quiz ID |
|---|---|
| `ch1_scene1` (Museum Discovery) | `ch1_quiz_speak_a` |
| `ch2_scene2` (Don Miguel's Market) | `ch2_quiz_speak_a` |
| `ch3_scene1` (Seoul Landing — Phone Dies) | `ch3_quiz_speak_a` |

Note: `ch2_scene2` already contained `ch2_quiz_pronunciation` — the new quiz was appended alongside it without removing the existing entry.

---

### TASK 3 — Eleanor Character Strengthened in storyData.json

**File:** `data/storyData.json` — `ch1_scene1`, Eleanor's first dialogue

**Before:** Generic curator alert ("Someone left a cipher on the Rosetta replica.")

**After:** Eleanor now reveals a personal stake — she trained Mr. Black twenty years ago. Her opening line now carries guilt and foreboding, establishing the mentor/student betrayal arc that pays off in Ch4/Ch5. Changed in all three languages (ko/en/es).

This change grounds Eleanor as a morally complex character with direct responsibility for the antagonist, not merely an exposition dispenser.

---

### TASK 4 — Retired "Apprentice" Address in story-scene.tsx

**File:** `app/story-scene.tsx`

Four instances of Rudy addressing the player as "Apprentice" / "견습생" / "Aprendiz" were replaced with "partner" / "파트너" / "compañero":

| Line | Context | Change |
|---|---|---|
| ~1277 | Seoul chapter opening scene narration | `Apprentice` → `partner`, `견습생` → `파트너`, `Aprendiz` → `compañero` |
| ~2620 | Cipher puzzle — wrong answer feedback (fox bubble) | same replacement |
| ~2706 | Cipher puzzle — correct answer feedback (fox bubble) | same replacement |
| ~2754 | Cipher puzzle — intro instruction (fox bubble) | same replacement |

No "Detective James" or "Lady Victoria" characters were found in the TSX — the london chapter already uses "Tom", "Dr. Ellis", and "Rudy" correctly. The `∆LX` symbol was already used consistently throughout the file (not `AerLX`). No audio/BGM code was touched.

---

## What Still Needs To Be Done

### High Priority

1. **Pronunciation quiz renderer**: The new `"type": "pronunciation"` quizzes require a UI component to render them and invoke the device microphone/Azure Speech API. If no `PronunciationQuizScreen` component exists, these quizzes will silently fail or need a type-guard fallback.

2. **`ch2_quiz_pronunciation` audit**: `ch2_scene2` already had a quiz with id `ch2_quiz_pronunciation` in the scene array, but no matching entry was found in `quizData.json` during the edit session. This orphaned ID should be investigated — either add the missing quiz definition or remove the reference.

3. **Eleanor arc continuation**: Eleanor's new backstory (trained Mr. Black) is only established in Ch1. Later chapters where she appears (Ch4/Ch5 callbacks in storyData.json) should be updated to reference this connection — especially her Ch4/Ch5 radio messages.

### Medium Priority

4. **TSX/JSON character consistency pass for Ch4+**: Ch4 introduces Amira/Hassan and Ch5 re-introduces Eleanor. A full audit of character name consistency between `storyData.json` NPCs and `story-scene.tsx` character arrays has not been done for chapters 4–5.

5. **Pronunciation quiz scoring calibration**: Target scores are set at 70/65/60 for Ch1/Ch2/Ch3 respectively. These should be play-tested — 60 may be too low for airport Korean phrases given the phonological difficulty for non-Korean learners.

6. **BGM auto-dim validation**: The task brief notes pronunciation quizzes should auto-dim music. This behavior needs to be confirmed in the audio manager — verify `"type": "pronunciation"` triggers the correct dim logic in the quiz renderer.

### Low Priority

7. **Cipher puzzle "apprentice" → "partner" in other files**: The `rudy` component directory may have additional instances of the "Apprentice" address in separate component files. A repo-wide search is recommended.

8. **Eleanor avatar update**: `eleanor.png` is referenced in the NPC definition. The new backstory may warrant an updated character portrait to reflect guilt/gravitas rather than neutral curator.

---

## Files Modified

| File | Changes |
|---|---|
| `data/quizData.json` | +3 pronunciation quiz objects (ch1, ch2, ch3) |
| `data/storyData.json` | +1 quiz ID each in ch1_scene1, ch2_scene2, ch3_scene1 arrays; Eleanor ch1 dialogue rewritten |
| `app/story-scene.tsx` | 4x "Apprentice" → "partner" replacements (trilingual) |
