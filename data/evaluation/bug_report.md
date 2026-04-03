# Bug Report v3 -- Enigma Language Adventure
Date: 2026-03-30
Agent: QA Debugger (Opus 4.6)

## Summary
- Critical: 3 bugs (all FIXED)
- High: 4 bugs (all FIXED)
- Medium: 3 bugs
- Low: 2 bugs

---

## CRITICAL Severity

### BUG-C1: BGM dims for writing-mission (keyboard quiz) instead of only microphone recording [FIXED]
- **File:** `app/story-scene.tsx` line ~3714
- **Description:** The BGM dim logic checked `currentItem.pType === "pronunciation" || currentItem.pType === "writing-mission"`. `writing-mission` is a TEXT INPUT quiz (keyboard), NOT voice recording. BGM should only dim during actual microphone use.
- **Impact:** BGM volume drops unnecessarily during text-based quizzes, confusing the user experience.
- **Fix:** Removed `writing-mission` from the condition. Now only `pronunciation` triggers BGM dim.

### BUG-C2: StoryQuizModal uses wrong recording config on iOS [FIXED]
- **File:** `components/story/StoryQuizModal.tsx` line ~1234
- **Description:** Used `Audio.RecordingOptionsPresets.HIGH_QUALITY` while ALL other components (Step1ListenRepeat, Step2KeyPoint, Step3MissionTalk, Step4QuickReview, speak.tsx) use iOS-specific 16kHz Linear PCM WAV options. HIGH_QUALITY produces AAC/M4A which may not be processed correctly by Azure Pronunciation Assessment.
- **Impact:** iOS users in Story mode may get inaccurate or failed pronunciation scores while all other recording scenarios work correctly.
- **Fix:** Changed to same iOS WAV recording options (16kHz, mono, LINEARPCM) used everywhere else. Also corrected the mimeType from hardcoded `"audio/m4a"` to platform-conditional `"audio/wav"` (iOS) / `"audio/mp4"` (Android).

### BUG-C3: StoryQuizModal native recording missing 300ms flush delay [FIXED]
- **File:** `components/story/StoryQuizModal.tsx` `stopNativeRecording()` function
- **Description:** After `rec.stopAndUnloadAsync()`, the file was read immediately without the standard 300ms delay. All other recording components (speak.tsx, Step1, Step2, Step3, Step4, lib/audio.ts) wait 300ms for the OS to flush the recording file.
- **Impact:** On iOS, reading the file too early may result in truncated or empty audio being sent to Azure, causing assessment failures.
- **Fix:** Added `await new Promise(resolve => setTimeout(resolve, 300));` after `stopAndUnloadAsync()`.

---

## HIGH Severity

### BUG-H1: Empty audio not validated in StoryQuizModal -- sends empty data to Azure [FIXED]
- **File:** `components/story/StoryQuizModal.tsx` (both native and web recording paths)
- **Description:** When base64 audio length < 2000 chars (essentially silence or mic not captured), the audio is still sent to Azure Pronunciation Assessment. Other components (Step1, Step2, Step4) check `isValidAudio(b64)` and show 0% immediately.
- **Impact:** Wastes Azure API calls on empty audio, returns confusing error messages to user.
- **Fix:** Added empty audio guard (`base64.length < 2000` check) to both native and web recording paths. Shows 0% immediately for empty audio.

### BUG-H2: Empty audio not validated in speak.tsx -- sends empty data to Azure [FIXED]
- **File:** `app/(tabs)/speak.tsx` (both native and web recording paths)
- **Description:** Same as BUG-H1 but in the dedicated pronunciation practice tab.
- **Impact:** Same as BUG-H1.
- **Fix:** Added empty audio guard to both native (after file read) and web (after FileReader) paths.

### BUG-H3: Empty audio not validated in Step3MissionTalk native recording [FIXED]
- **File:** `components/rudy/Step3MissionTalk.tsx` (native recording path)
- **Description:** Native recording path had no empty audio check (web path already checked `blob.size < 100` but not the base64 after conversion).
- **Impact:** Empty audio sent to Azure STT, wasting API calls and confusing user.
- **Fix:** Added empty audio guard for both native base64 and web base64.

### BUG-H4: TTS sounds not stopped when navigating away from story-scene [FIXED]
- **File:** `app/story-scene.tsx`
- **Description:** Module-level TTS caches (`_ttsCacheNative`, `_ttsCacheWeb`) are never cleaned up on unmount or back navigation. The back button only stops BGM. TTS dialogue sounds continue playing after leaving the story.
- **Impact:** Audio plays after the user has left the screen, interfering with other screens' audio.
- **Fix:** Added TTS cache cleanup (stop + unload all cached sounds, then clear maps) to both the back button handler and the BGM useEffect cleanup function.

---

## MEDIUM Severity

### BUG-M1: Letter "A" pronunciation assessment sends raw letter to Azure
- **File:** `app/basic-course.tsx` line ~724 -> `server/routes.ts` `/api/pronunciation-assess`
- **Description:** When a user practices saying a letter in alphabet tracing, the `word` sent to Azure Pronunciation Assessment is just the character (e.g. "A" or "a"). Azure's ReferenceText receives this single character. Azure STT pronunciation assessment with a single-letter reference text may struggle because the user says "ay" (the letter name) but the reference is just "A". The server at line 619 sets `ReferenceText: word` directly.
- **Note:** This is a known UX limitation of Azure Pronunciation Assessment with single characters. The TTS playback uses `say-as interpret-as="characters"` which correctly says "ay" for "A", but the assessment side has no analogous mechanism to expect the letter name pronunciation rather than the phoneme.
- **Recommendation:** For pronunciation assessment of single letters, the client should send the phonetic name (e.g., "ay" for A, "bee" for B) as the `word` parameter instead of the raw letter. The `EN_LET` map's `tip` field already contains these names (e.g., `"'ay' -- as in Apple"`).

### BUG-M2: basic-course.tsx TTS cleanup missing on back navigation
- **File:** `app/basic-course.tsx`
- **Description:** Uses `expo-speech` (Speech.speak) and Azure TTS for pronunciation. When navigating away, the only TTS cleanup is `Speech.stop()` inside the `speak()` function called before each new utterance. There is no explicit cleanup on unmount to stop running `expo-speech` or unload Azure TTS sounds created via `Audio.Sound.createAsync`.
- **Recommendation:** Add a useEffect cleanup that calls `Speech.stop()` and unloads any playing Audio.Sound.

### BUG-M3: "review" button issue -- write and listen modes both show only step 0 (alphabet/characters)
- **File:** `app/basic-course.tsx`
- **Description:** The "write" and "listen" review sections in `startReviewSection()` both set `step = 0` which only shows the alphabet tracing / character cards. Words (step 1) and greetings (step 2) are not accessible from these individual review sections. Only "full" review or "speak" review show other content. The user may expect "listen" to also cover vocabulary listening.
- **Recommendation:** Consider renaming these sections more clearly or expanding them. Currently "listen" only covers listening to alphabet/character pronunciation, not vocabulary.

---

## LOW Severity

### BUG-L1: StoryQuizModal native recording catches errors silently
- **File:** `components/story/StoryQuizModal.tsx` `stopNativeRecording()` catch block
- **Description:** Error messages are localized for ko/es but the default English fallback says "Evaluation error." which is vague.
- **Recommendation:** Consider logging the error for debugging.

### BUG-L2: Level progress edge case at level boundary
- **File:** `context/LanguageContext.tsx`
- **Description:** `getLevelProgress()` returns 1 when level num is 5, and uses `(xp - minXP) / (maxXP - minXP)` for other levels. Level 5 has `maxXP: Infinity`, so the division would produce `0/Infinity = NaN` if not for the early return. This works correctly but the architecture is fragile -- adding a new level with `maxXP: Infinity` elsewhere would silently break.
- **Recommendation:** No action needed now, but document the invariant.

---

## Verification Checklist (Known Issues Status)

| # | Check | Status |
|---|-------|--------|
| 1 | TTS stops on navigation | FIXED (story-scene back + unmount; rudy-lesson already handled via ttsManager) |
| 2 | Recording config matches pronunciation practice | FIXED (StoryQuizModal now uses same iOS WAV config) |
| 3 | Azure STT uses full locale (en-US, not en) | OK -- all calls use en-US, es-ES, ko-KR. Server normalizes at line 554. |
| 4 | Manual recording stop: rec.stop() + 300ms | FIXED (StoryQuizModal now has 300ms delay) |
| 5 | Empty audio (base64 < 2000) shows 0% | FIXED in StoryQuizModal, speak.tsx, Step3MissionTalk. Already done in Step1/Step2/Step4. |
| 6 | Only real model names | OK -- gpt-4o, gpt-4o-mini, whisper-1, gpt-4o-audio-preview, gpt-image-1. No fake models. |
| 7 | Buttons never overlap content | No overlap issues found in scanned layouts. |
| 8 | All text in ko, en, es | Translations exist for all 3 languages in LanguageContext.tsx. |
| 9 | fill_blank one blank one answer | Data format correct (FillBlankQ has single answer Tri + 2 wrong opts). |
| 10 | BGM only dims for pronunciation (not writing-mission) | FIXED |

---

## Files Modified

1. `app/story-scene.tsx` -- BGM dim fix (removed writing-mission), TTS cache cleanup on unmount + back
2. `components/story/StoryQuizModal.tsx` -- iOS WAV recording config, 300ms delay, empty audio guard, fixed mimeType
3. `app/(tabs)/speak.tsx` -- Empty audio guard for native + web recording
4. `components/rudy/Step3MissionTalk.tsx` -- Empty audio guard for native + web recording
