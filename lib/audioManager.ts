/**
 * Audio Manager for Story Mode sound effects and BGM.
 * Uses expo-av for playback. All sounds are optional — missing files are silently skipped.
 */
import { Audio, AVPlaybackSource } from "expo-av";

// ─── Sound Effect Registry ──────────────────────────────────────────────────

type SfxSlot =
  | "correct"
  | "wrong"
  | "bossAppear"
  | "chapterClear"
  | "clueFound"
  | "choiceMade"
  | "dialogueTap"
  | "gaugeWarning";

type BgmSlot = "ch1" | "ch2" | "ch3" | "ch4" | "ch5" | "boss" | "result";

// Placeholder: replace these with actual require() calls when assets are ready.
// Using null means the sound slot is empty and will be silently skipped.
const SFX_SOURCES: Record<SfxSlot, AVPlaybackSource | null> = {
  correct: null,
  wrong: null,
  bossAppear: null,
  chapterClear: null,
  clueFound: null,
  choiceMade: null,
  dialogueTap: null,
  gaugeWarning: null,
};

// ─── State ──────────────────────────────────────────────────────────────────

const sfxCache: Partial<Record<SfxSlot, Audio.Sound>> = {};
let currentBgm: Audio.Sound | null = null;
let currentBgmSlot: BgmSlot | null = null;

let sfxVolume = 1.0;
let bgmVolume = 0.5;
let audioEnabled = true;

// ─── Public API ─────────────────────────────────────────────────────────────

/** Play a sound effect (fire-and-forget, never throws) */
export async function playSfx(slot: SfxSlot): Promise<void> {
  if (!audioEnabled) return;
  const source = SFX_SOURCES[slot];
  if (!source) return; // placeholder — no asset loaded yet

  try {
    // Reuse cached sound if available
    let sound = sfxCache[slot];
    if (sound) {
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(sfxVolume);
      await sound.playAsync();
      return;
    }

    // Load and cache
    const { sound: newSound } = await Audio.Sound.createAsync(source, {
      volume: sfxVolume,
      shouldPlay: true,
    });
    sfxCache[slot] = newSound;
  } catch {
    // Silently skip — missing sound should never break gameplay
  }
}

/** Stop the current BGM */
export async function stopBgm(): Promise<void> {
  if (currentBgm) {
    try {
      await currentBgm.stopAsync();
      await currentBgm.unloadAsync();
    } catch {
      // ignore
    }
    currentBgm = null;
    currentBgmSlot = null;
  }
}

/** Set BGM volume (0.0 - 1.0) */
export function setBgmVolume(vol: number): void {
  bgmVolume = Math.max(0, Math.min(1, vol));
  if (currentBgm) {
    currentBgm.setVolumeAsync(bgmVolume).catch((e) => console.warn('[Audio] BGM volume set failed:', e));
  }
}

/** Toggle all audio on/off */
export function setAudioEnabled(enabled: boolean): void {
  audioEnabled = enabled;
  if (!enabled) {
    stopBgm();
  }
}

/** Get current audio settings */
export function getAudioSettings() {
  return { sfxVolume, bgmVolume, audioEnabled };
}
