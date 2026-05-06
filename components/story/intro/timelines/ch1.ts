import type { ImageSourcePropType } from "react-native";

import type { IntroTimeline } from "./types";

const SHOT_IMAGES = {
  phone: require("@/assets/story/chapter1_motion_comic/ch1_intro_phone.png") as ImageSourcePropType,
  open: require("@/assets/story/chapter1_motion_comic/ch1_intro_open.png") as ImageSourcePropType,
  ellis: require("@/assets/story/chapter1_motion_comic/ch1_intro_ellis.png") as ImageSourcePropType,
  rudySpirit: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_spirit.png") as ImageSourcePropType,
  rudyReaction: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_reaction.png") as ImageSourcePropType,
  black: require("@/assets/story/chapter1_motion_comic/ch1_intro_black_cctv.png") as ImageSourcePropType,
  rudyDetective: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_detective.png") as ImageSourcePropType,
};

export const ch1Timeline: IntroTimeline = {
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
          "Detective. I need... I can't...",
          "if you're reading this, the words are already...",
        ],
      },
      accessibilityLabel: "A phone message loses its words in the dark.",
    },
    {
      id: "open",
      durationMs: 7000,
      source: SHOT_IMAGES.open,
      motion: "drift-left",
      cue: "open",
      overlay: "open",
      accessibilityLabel: "A London cafe sign restores with golden language light.",
    },
    {
      id: "ellis",
      durationMs: 8200,
      source: SHOT_IMAGES.ellis,
      motion: "push",
      cue: "gasp",
      overlay: "find",
      accessibilityLabel: "A cafe employee shows Dr Ellis leaving one clue behind.",
    },
    {
      id: "rudy",
      durationMs: 7200,
      source: SHOT_IMAGES.rudySpirit,
      motion: "drift-right",
      cue: "chime",
      accessibilityLabel: "A golden fox spirit wakes above the phone.",
    },
    {
      id: "rudy-react",
      durationMs: 4500,
      source: SHOT_IMAGES.rudyReaction,
      motion: "drift-left",
      cue: "sense",
      overlay: "rudy-react",
      accessibilityLabel: "Rudy senses a cold threat off-frame.",
    },
    {
      id: "black",
      durationMs: 7800,
      source: SHOT_IMAGES.black,
      motion: "pull",
      cue: "steps",
      overlay: "black",
      accessibilityLabel: "Mr Black walks away through a CCTV museum corridor.",
    },
    {
      id: "naming",
      durationMs: 7000,
      source: SHOT_IMAGES.rudySpirit,
      motion: "push",
      cue: "chime",
      overlay: "naming",
      accessibilityLabel: "Rudy's name restores his detective form.",
    },
  ],
  finalDialogue: {
    speaker: "Rudy",
    text: "Something woke me. I think it was the word that came back.",
  },
  villainMessage: "Thank you for the word, Detective.\nI'll take very good care of all the others.\n- B",
  portraitImage: SHOT_IMAGES.rudyDetective,
  spiritImage: SHOT_IMAGES.rudySpirit,
  copy: {
    title: "London Cipher",
    subtitle: {
      korean: "단어가 무너지는 첫 밤.",
      english: "The first night the words begin to fall.",
      spanish: "La primera noche en que las palabras empiezan a caer.",
    },
    startLabel: "Start London Cipher",
  },
};
