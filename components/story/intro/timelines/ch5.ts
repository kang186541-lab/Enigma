import type { ImageSourcePropType } from "react-native";

import type { IntroTimeline } from "./types";

const SHOT_IMAGES = {
  coordinates: require("@/assets/story/chapter5_motion_comic/ch5_intro_coordinates.png") as ImageSourcePropType,
  towerApproach: require("@/assets/story/chapter5_motion_comic/ch5_intro_tower_approach.png") as ImageSourcePropType,
  gates: require("@/assets/story/chapter5_motion_comic/ch5_intro_gates.png") as ImageSourcePropType,
  rudyAllies: require("@/assets/story/chapter5_motion_comic/ch5_intro_rudy_allies.png") as ImageSourcePropType,
  blackSilhouette: require("@/assets/story/chapter5_motion_comic/ch5_intro_black_silhouette.png") as ImageSourcePropType,
  blackFace: require("@/assets/story/chapter5_motion_comic/ch5_intro_black_face.png") as ImageSourcePropType,
  lullabyJournal: require("@/assets/story/chapter5_motion_comic/ch5_intro_lullaby_journal.png") as ImageSourcePropType,
  rudyDetective: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_detective.png") as ImageSourcePropType,
  rudySpirit: require("@/assets/story/chapter5_motion_comic/ch5_intro_rudy_allies.png") as ImageSourcePropType,
};

export const ch5Timeline: IntroTimeline = {
  shots: [
    {
      id: "coordinates",
      durationMs: 7200,
      source: SHOT_IMAGES.coordinates,
      motion: "push",
      cue: "ring",
      overlay: "word",
      overlayCopy: {
        word: "BABEL",
      },
      accessibilityLabel: "Four city stones project the final Babel coordinates.",
    },
    {
      id: "tower-approach",
      durationMs: 7000,
      source: SHOT_IMAGES.towerApproach,
      motion: "drift-left",
      cue: "wind",
      accessibilityLabel: "The party approaches the modern Babel Tower in the desert.",
    },
    {
      id: "language-gates",
      durationMs: 7600,
      source: SHOT_IMAGES.gates,
      motion: "pull",
      cue: "open",
      overlay: "word",
      overlayCopy: {
        word: "GATES",
      },
      accessibilityLabel: "Five language gates stack upward inside Babel Tower.",
    },
    {
      id: "rudy-allies",
      durationMs: 7200,
      source: SHOT_IMAGES.rudyAllies,
      motion: "drift-right",
      cue: "chime",
      accessibilityLabel: "Spirit Rudy and the allies gather before the final gate.",
    },
    {
      id: "black-silhouette",
      durationMs: 7800,
      source: SHOT_IMAGES.blackSilhouette,
      motion: "pull",
      cue: "steps",
      overlay: "black",
      accessibilityLabel: "Mr Black appears as a full silhouette above the Babel gates.",
    },
    {
      id: "black-face",
      durationMs: 8200,
      source: SHOT_IMAGES.blackFace,
      motion: "push",
      cue: "sense",
      accessibilityLabel: "Mr Black's tired face is finally revealed in the Babel chamber.",
    },
    {
      id: "lullaby-journal",
      durationMs: 7600,
      source: SHOT_IMAGES.lullabyJournal,
      motion: "drift-left",
      cue: "drum",
      overlay: "word",
      overlayCopy: {
        word: "REMEMBER",
      },
      accessibilityLabel: "Ellis's journal and the seven stones carry the Welsh lullaby back into the room.",
    },
  ],
  finalDialogue: {
    speaker: "Rudy",
    text: "This is where every word we restored has been leading us.",
  },
  villainMessage:
    "Tell me, Detective.\nWhen you couldn't speak the language,\ndid anyone look at you like you mattered?\n- B",
  portraitImage: SHOT_IMAGES.rudyDetective,
  spiritImage: SHOT_IMAGES.rudySpirit,
  copy: {
    title: "Babel Tower",
    subtitle: {
      korean: "모든 언어가 마지막 문 앞에 모입니다.",
      english: "Every restored word gathers at the final door.",
      spanish: "Cada palabra restaurada llega a la última puerta.",
    },
    startLabel: "Start Babel Tower",
  },
};
