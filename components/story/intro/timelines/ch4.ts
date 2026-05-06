import type { ImageSourcePropType } from "react-native";

import type { IntroTimeline } from "./types";

const SHOT_IMAGES = {
  phone: require("@/assets/story/chapter4_motion_comic/ch4_intro_phone.png") as ImageSourcePropType,
  hieroglyphRestore: require("@/assets/story/chapter4_motion_comic/ch4_intro_hieroglyph_restore.png") as ImageSourcePropType,
  amiraRecords: require("@/assets/story/chapter4_motion_comic/ch4_intro_amira_records.png") as ImageSourcePropType,
  rudyArchive: require("@/assets/story/chapter4_motion_comic/ch4_intro_rudy_archive.png") as ImageSourcePropType,
  rudyHandShadow: require("@/assets/story/chapter4_motion_comic/ch4_intro_rudy_hand_shadow.png") as ImageSourcePropType,
  blackPartial: require("@/assets/story/chapter4_motion_comic/ch4_intro_black_partial.png") as ImageSourcePropType,
  babelHook: require("@/assets/story/chapter4_motion_comic/ch4_intro_babel_hook.png") as ImageSourcePropType,
  rudyDetective: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_detective.png") as ImageSourcePropType,
};

export const ch4Timeline: IntroTimeline = {
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
          "The record is losing ink.",
          "the words are becoming sand.",
        ],
      },
      accessibilityLabel: "A Cairo hospital record loses its words from a phone screen.",
    },
    {
      id: "hieroglyph-restore",
      durationMs: 7000,
      source: SHOT_IMAGES.hieroglyphRestore,
      motion: "drift-left",
      cue: "open",
      overlay: "word",
      overlayCopy: {
        word: "RECORD",
      },
      accessibilityLabel: "One abstract inscription mark restores on a Cairo chamber wall.",
    },
    {
      id: "amira-records",
      durationMs: 8200,
      source: SHOT_IMAGES.amiraRecords,
      motion: "push",
      cue: "gasp",
      overlay: "word",
      overlayCopy: {
        word: "WROTE",
      },
      accessibilityLabel: "Professor Amira watches a hospital record crumble into golden sand.",
    },
    {
      id: "rudy-archive",
      durationMs: 7200,
      source: SHOT_IMAGES.rudyArchive,
      motion: "drift-right",
      cue: "chime",
      accessibilityLabel: "Rudy hovers before a sealed Egyptian inscription archive.",
    },
    {
      id: "rudy-hand-shadow",
      durationMs: 4500,
      source: SHOT_IMAGES.rudyHandShadow,
      motion: "drift-left",
      cue: "sense",
      overlay: "festival-threat",
      accessibilityLabel: "Rudy senses a hand holding a golden stone fragment in shadow.",
    },
    {
      id: "black-partial",
      durationMs: 7800,
      source: SHOT_IMAGES.blackPartial,
      motion: "pull",
      cue: "wind",
      overlay: "black",
      accessibilityLabel: "Mr Black is partially revealed through a hand, mouth, and stone reflection.",
    },
    {
      id: "babel-hook",
      durationMs: 7000,
      source: SHOT_IMAGES.babelHook,
      motion: "push",
      cue: "drum",
      overlay: "word",
      overlayCopy: {
        word: "BABEL",
      },
      accessibilityLabel: "Ellis's journal and an old papyrus point toward Babel.",
    },
  ],
  finalDialogue: {
    speaker: "Rudy",
    text: "Cairo is not losing words. It is losing proof that anyone ever spoke them.",
  },
  villainMessage:
    "I'm not erasing your grandmother's lullaby.\nI'm making sure her great-grandchild understands every word of it.\n- B",
  portraitImage: SHOT_IMAGES.rudyDetective,
  spiritImage: SHOT_IMAGES.rudyArchive,
  copy: {
    title: "Cairo Record",
    subtitle: {
      korean: "기록이 모래처럼 사라지는 도시.",
      english: "The city where records turn to sand.",
      spanish: "La ciudad donde los registros se vuelven arena.",
    },
    startLabel: "Start Cairo Record",
  },
};
