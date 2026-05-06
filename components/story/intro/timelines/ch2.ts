import type { ImageSourcePropType } from "react-native";

import type { IntroTimeline } from "./types";

const SHOT_IMAGES = {
  phone: require("@/assets/story/chapter2_motion_comic/ch2_intro_phone.png") as ImageSourcePropType,
  colorRestore: require("@/assets/story/chapter2_motion_comic/ch2_intro_color_restore.png") as ImageSourcePropType,
  carlosCall: require("@/assets/story/chapter2_motion_comic/ch2_intro_carlos_call.png") as ImageSourcePropType,
  rudyFestival: require("@/assets/story/chapter2_motion_comic/ch2_intro_rudy_festival.png") as ImageSourcePropType,
  rudyReact: require("@/assets/story/chapter2_motion_comic/ch2_intro_rudy_react.png") as ImageSourcePropType,
  blackBroadcast: require("@/assets/story/chapter2_motion_comic/ch2_intro_black_broadcast.png") as ImageSourcePropType,
  colorRecall: require("@/assets/story/chapter2_motion_comic/ch2_intro_color_recall.png") as ImageSourcePropType,
  rudyDetective: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_detective.png") as ImageSourcePropType,
};

export const ch2Timeline: IntroTimeline = {
  shots: [
    {
      id: "phone",
      durationMs: 7200,
      source: SHOT_IMAGES.phone,
      motion: "push",
      cue: "ring",
      overlay: "phone",
      overlayCopy: {
        phoneLines: [
          "The plaza is losing color.",
          "The color is gone.",
        ],
      },
      accessibilityLabel: "Madrid plaza colors drain from a phone screen.",
    },
    {
      id: "color-restore",
      durationMs: 7000,
      source: SHOT_IMAGES.colorRestore,
      motion: "drift-left",
      cue: "open",
      overlay: "color-restore",
      accessibilityLabel: "A red festival flag returns to a colorless plaza.",
    },
    {
      id: "carlos-call",
      durationMs: 8200,
      source: SHOT_IMAGES.carlosCall,
      motion: "push",
      cue: "gasp",
      overlay: "carlos-call",
      overlayCopy: {
        word: "HELP",
      },
      accessibilityLabel: "Isabel's phone replays Carlos's last call.",
    },
    {
      id: "rudy-festival",
      durationMs: 7200,
      source: SHOT_IMAGES.rudyFestival,
      motion: "drift-right",
      cue: "guitar",
      accessibilityLabel: "Rudy hovers over a colorless Madrid festival stage.",
    },
    {
      id: "rudy-react",
      durationMs: 4500,
      source: SHOT_IMAGES.rudyReact,
      motion: "drift-left",
      cue: "sense",
      overlay: "festival-threat",
      accessibilityLabel: "Rudy senses a familiar threat from the plaza speakers.",
    },
    {
      id: "black-broadcast",
      durationMs: 7800,
      source: SHOT_IMAGES.blackBroadcast,
      motion: "pull",
      cue: "wind",
      overlay: "black",
      accessibilityLabel: "Mr Black's voice echoes over Madrid plaza speakers.",
    },
    {
      id: "color-recall",
      durationMs: 7000,
      source: SHOT_IMAGES.colorRecall,
      motion: "push",
      cue: "chime",
      accessibilityLabel: "Rudy remembers the first returning color.",
    },
  ],
  finalDialogue: {
    speaker: "Rudy",
    text: "I knew that voice. He was here, but only in sound.",
  },
  villainMessage: "What you call accent, I call distance.\nBridges don't ask the river to stay narrow.\n- B",
  portraitImage: SHOT_IMAGES.rudyDetective,
  spiritImage: SHOT_IMAGES.rudyFestival,
  copy: {
    title: "Madrid Festival",
    subtitle: {
      korean: "색이 사라지는 축제.",
      english: "The festival where color disappears.",
      spanish: "El festival donde desaparece el color.",
    },
    startLabel: "Start Madrid Festival",
  },
};
