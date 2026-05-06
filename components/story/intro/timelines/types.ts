import type { ImageSourcePropType } from "react-native";

export type ChapterId = "london" | "madrid" | "seoul" | "cairo" | "babel";
export type NativeLanguage = "korean" | "english" | "spanish";
export type MotionPreset = "push" | "pull" | "drift-left" | "drift-right";
export type CueKey =
  | "ring"
  | "open"
  | "gasp"
  | "chime"
  | "sense"
  | "steps"
  | "wind"
  | "drum"
  | "guitar";

export type OverlayKind =
  | "phone"
  | "open"
  | "find"
  | "rudy-react"
  | "black"
  | "naming"
  | "color-restore"
  | "carlos-call"
  | "festival-threat"
  | "korean-word"
  | "word";

export type StoryIntroShot = {
  id: string;
  durationMs: number;
  source: ImageSourcePropType;
  motion: MotionPreset;
  cue: CueKey;
  overlay?: OverlayKind;
  overlayCopy?: {
    phoneLines?: string[];
    word?: string;
  };
  accessibilityLabel: string;
};

export interface IntroTimeline {
  shots: StoryIntroShot[];
  finalDialogue: {
    speaker: string;
    text: string;
  };
  villainMessage?: string;
  portraitImage: ImageSourcePropType;
  spiritImage?: ImageSourcePropType;
  copy?: {
    title: string;
    subtitle: Record<NativeLanguage, string>;
    startLabel?: string;
  };
}
