/**
 * Audio Manager for Story Mode sound effects and BGM.
 * Uses expo-av for playback. All sounds are optional — missing files are silently skipped.
 */
import { Audio, AVPlaybackSource } from "expo-av";
import { Platform } from "react-native";

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

const BGM_SOURCES: Record<BgmSlot, AVPlaybackSource | null> = {
  ch1: null,
  ch2: null,
  ch3: null,
  ch4: null,
  ch5: null,
  boss: null,
  result: null,
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

/** Start BGM for a chapter or scene type. Crossfades if already playing. */
export async function playBgm(slot: BgmSlot): Promise<void> {
  if (!audioEnabled) return;
  if (currentBgmSlot === slot && currentBgm) return; // already playing this track

  const source = BGM_SOURCES[slot];
  if (!source) return; // placeholder — no asset yet

  try {
    // Stop current BGM
    await stopBgm();

    const { sound } = await Audio.Sound.createAsync(source, {
      volume: bgmVolume,
      isLooping: true,
      shouldPlay: true,
    });
    currentBgm = sound;
    currentBgmSlot = slot;
  } catch {
    // Silently skip
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

/** Set SFX volume (0.0 - 1.0) */
export function setSfxVolume(vol: number): void {
  sfxVolume = Math.max(0, Math.min(1, vol));
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

/** Cleanup all cached sounds (call on app unmount) */
export async function unloadAll(): Promise<void> {
  await stopBgm();
  for (const sound of Object.values(sfxCache)) {
    try { await sound?.unloadAsync(); } catch (e) { console.warn('[Audio] sfx unload failed:', e); }
  }
  Object.keys(sfxCache).forEach(k => delete sfxCache[k as SfxSlot]);
}

/** Map chapter ID to BGM slot */
export function chapterToBgm(chapterId: string): BgmSlot {
  switch (chapterId) {
    case "ch1": return "ch1";
    case "ch2": return "ch2";
    case "ch3": return "ch3";
    case "ch4": return "ch4";
    case "ch5": return "ch5";
    default: return "ch1";
  }
}

// ─── Audio Mode Setup ───────────────────────────────────────────────────────

/** Initialize audio mode for playback (call once at app startup) */
export async function initAudioMode(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch {
    // ignore
  }
}
