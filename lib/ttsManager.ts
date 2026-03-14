/**
 * Global TTS manager — one sound plays at a time across all step components.
 * Use registerGlobalSound / registerGlobalWebAudio after creating audio.
 * Call stopAllTTS() before any navigation or step transition.
 */
import { Platform } from "react-native";
import { Audio } from "expo-av";

let _sound: Audio.Sound | null = null;
let _webAudio: HTMLAudioElement | null = null;

export function registerGlobalSound(sound: Audio.Sound) {
  _sound = sound;
}

export function registerGlobalWebAudio(audio: HTMLAudioElement) {
  _webAudio = audio;
}

export async function stopAllTTS() {
  if (Platform.OS === "web") {
    if (_webAudio) {
      try { _webAudio.pause(); _webAudio.src = ""; } catch {}
      _webAudio = null;
    }
  } else {
    if (_sound) {
      const s = _sound;
      _sound = null;
      try { await s.stopAsync(); } catch {}
      try { await s.unloadAsync(); } catch {}
    }
  }
}

export function stopAllTTSSync() {
  if (Platform.OS === "web") {
    if (_webAudio) {
      try { _webAudio.pause(); _webAudio.src = ""; } catch {}
      _webAudio = null;
    }
  } else {
    if (_sound) {
      const s = _sound;
      _sound = null;
      s.stopAsync().catch(() => {});
      s.unloadAsync().catch(() => {});
    }
  }
}
