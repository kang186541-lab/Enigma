import type { ImageSourcePropType } from "react-native";
// Re-export the canonical, widened NativeLanguage (4 langs incl. indonesian)
// so the `subtitle` triples can carry Indonesian UI copy. Previously this was
// a stale local 3-lang alias.
import type { NativeLanguage } from "@/context/LanguageContext";

export type ChapterId = "london" | "madrid" | "seoul" | "cairo" | "babel";
export type { NativeLanguage };
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

export type LocalizedText = string | Partial<Record<NativeLanguage, string>>;
export type LocalizedTextList = string[] | Partial<Record<NativeLanguage, string[]>>;

export type StoryIntroShot = {
  id: string;
  durationMs: number;
  source: ImageSourcePropType;
  motion: MotionPreset;
  cue: CueKey;
  overlay?: OverlayKind;
  overlayCopy?: {
    phoneLines?: LocalizedTextList;
    word?: LocalizedText;
  };
  accessibilityLabel: LocalizedText;
};

export interface IntroTimeline {
  shots: StoryIntroShot[];
  finalDialogue: {
    speaker: LocalizedText;
    text: LocalizedText;
  };
  villainMessage?: LocalizedText;
  portraitImage: ImageSourcePropType;
  spiritImage?: ImageSourcePropType;
  copy?: {
    title: LocalizedText;
    subtitle: Record<NativeLanguage, string>;
    startLabel?: LocalizedText;
  };
}
