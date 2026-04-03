# Bug Report v2 — QA Codebase Scan
**Date:** 2026-03-22
**Scanned by:** qa-debugger
**Scope:** Full codebase — app/, components/rudy/, server/routes.ts, lib/audio.ts, lib/ttsManager.ts

---

## Summary

| Severity | Found | Fixed |
|----------|-------|-------|
| Critical | 1     | 1     |
| High     | 1     | 0     |
| Medium   | 3     | 0     |
| Low      | 2     | 0     |
| **Total**| **7** | **1** |

---

## CRITICAL

### BUG-001: TTS/Recording Overlap — Mic Button Not Disabled During TTS Playback [FIXED]
- **File:** `app/chat-room.tsx` line 952 (original), line 546
- **Description:** The mic button was `disabled={isRecording || isTyping}` but did NOT check `speakingId`. Users could tap the mic while TTS audio was actively playing. On iOS, this triggers an audio session conflict because:
  1. `azureNativePlay()` sets `allowsRecordingIOS: false` (line 100) for playback
  2. `recordAudio()` in `lib/audio.ts` immediately sets `allowsRecordingIOS: true` (line 177) for recording
  3. This interrupts the playing sound and can cause expo-av to crash or produce silent recordings
- **Impact:** iOS audio corruption, silent recordings, potential app crash
- **Fix Applied:**
  - Line 952: Changed `disabled` to `isRecording || isTyping || !!speakingId`
  - Line 546: Added early return if `speakingId` is set, plus explicit `stopSpeech()` / `clearSubtitle()` / `setSpeakingId(null)` before starting recording

---

## HIGH

### BUG-002: `gpt-4o-mini-transcribe` Referenced in Replit Integration Audio Files
- **Files:**
  - `server/replit_integrations/audio/client.ts` lines 237, 253 (comments)
  - `server/replit_integrations/audio/routes.ts` line 62 (comment)
- **Description:** Comments reference `gpt-4o-mini-transcribe` as a model name. This model does not exist in the OpenAI API. The actual code uses `whisper-1` (lines 246, 262 of client.ts) which is correct, but misleading comments could lead future developers to change the model parameter to a non-existent one.
- **Impact:** Developer confusion; potential breakage if comments are taken as implementation guidance
- **Recommendation:** Update comments to reference `whisper-1` (the actual model used) instead of `gpt-4o-mini-transcribe`

---

## MEDIUM

### BUG-003: `gpt-4o-audio-preview` Model Used in Replit Audio Integration
- **File:** `server/replit_integrations/audio/routes.ts` line 98, `server/replit_integrations/audio/client.ts` lines 120, 156, 192, 214
- **Description:** Uses `gpt-4o-audio-preview` which is a preview model. This could be deprecated or removed without notice.
- **Impact:** Audio features in replit integrations could break when preview is removed
- **Recommendation:** Monitor OpenAI model deprecation notices; plan migration to stable audio model when available

### BUG-004: basic-course.tsx — "Next" Button Visibility Unclear on Step 0 (Tracing)
- **File:** `app/basic-course.tsx` line 783-788
- **Description:** The `canNext` logic for step 0 requires `traced` to be true (tracing threshold of 20 touch moves). However, there is no visual indication to the user that they need to trace the character before the Next button becomes active. The button appears disabled with no tooltip or instruction beyond the `lingoTips` banner.
- **Impact:** Users may be confused about why they can't advance past the alphabet tracing step
- **Recommendation:** Add a subtle label like "Trace the character above to continue" near the Next button when `traced` is false

### BUG-005: No Explicit `stopSpeech()` Before Native Recording in `handleVoiceInput`
- **File:** `app/chat-room.tsx` (handleVoiceInput function, native path)
- **Description:** On the native path (line 567), `recordAudio(5000)` is called. Inside `lib/audio.ts:recordNative()`, `Audio.setAudioModeAsync({ allowsRecordingIOS: true })` is called, which silently stops any playing audio. While this doesn't crash, the TTS playback status callbacks (`onEnd`) may not fire correctly, leaving `speakingId` and `subtitleWordIdx` in a stale state.
- **Impact:** UI may show stale "speaking" indicators after recording finishes
- **Status:** Partially addressed by BUG-001 fix (added explicit `stopSpeech()` before recording), but the native path in `handleVoiceInput` should ensure all TTS state is cleaned up

---

## LOW

### BUG-006: `max_tokens` Used Instead of `max_completion_tokens` in Some Routes
- **File:** `server/routes.ts` lines 699, 1153, 1183
- **Description:** Some OpenAI API calls use `max_tokens` while others use `max_completion_tokens`. The `max_tokens` parameter is the legacy name. While currently still supported, OpenAI may deprecate it in favor of `max_completion_tokens`.
- **Impact:** None currently; potential future deprecation warning
- **Recommendation:** Standardize to `max_completion_tokens` across all routes for consistency

### BUG-007: `gpt-image-1` Model in Replit Image Integration
- **File:** `server/replit_integrations/image/routes.ts` line 14, `server/replit_integrations/image/client.ts` lines 18, 44
- **Description:** Uses `gpt-image-1` model. This is a valid model but is part of replit integration boilerplate. Verify it aligns with the project's OpenAI plan/quota.
- **Impact:** Low — model is valid but may have different pricing/quota implications
- **Recommendation:** No action needed if image generation is intended

---

## Verified OK (No Bugs Found)

### OpenAI Model Names (Main Routes)
All main `server/routes.ts` endpoints use valid models:
- `gpt-4o` for chat, translate, NPC chat, mission chat, handwriting, quiz evaluate, quiz roleplay
- `gpt-4o-mini` for gpt-score, word-lookup

### TTS Implementation (`azureNativePlay`)
- Correctly uses `Audio.Sound.createAsync` with `{ shouldPlay: true }`
- Properly cleans up previous sound before creating new one (lines 86-91)
- `setOnPlaybackStatusUpdate` correctly fires `onEnd` on `didJustFinish`
- Fallback to `expo-speech` on server error is correct

### `stopSpeech()` Function
- Properly handles both web (HTMLAudioElement) and native (expo-av Sound + expo-speech) cleanup
- Nulls out `_nativeSound` before async operations to prevent race conditions

### Audio Session Management
- `lib/audio.ts:recordNative()` correctly toggles `allowsRecordingIOS` before and after recording
- `azureNativePlay()` correctly sets `allowsRecordingIOS: false` for playback
- Rudy components (`Step1-4`) all follow correct pattern of setting `allowsRecordingIOS` before recording and resetting after

### `lib/ttsManager.ts`
- Clean implementation, properly manages global TTS state
- Both async and sync stop variants are provided

### Translation Handling
- ko/en/es translations present in all NPC openings, basic-course data
- Auto-translation in chat-room correctly uses `canTranslate` guard

---

## Files Reviewed
- `app/chat-room.tsx` (full)
- `app/basic-course.tsx` (full)
- `app/daily-lesson.tsx` (partial)
- `app/npc-mission.tsx` (partial)
- `server/routes.ts` (full)
- `lib/audio.ts` (full)
- `lib/ttsManager.ts` (full)
- `components/rudy/Step1ListenRepeat.tsx` (partial)
- `server/replit_integrations/audio/client.ts` (grep scan)
- `server/replit_integrations/audio/routes.ts` (grep scan)
- `server/replit_integrations/image/routes.ts` (grep scan)
- `server/replit_integrations/image/client.ts` (grep scan)
