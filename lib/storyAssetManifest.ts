import type { ImageSourcePropType } from "react-native";

const rudyStoryPortrait = require("@/assets/rudy_story.png") as ImageSourcePropType;
const chapter1Phone = require("@/assets/story/chapter1_motion_comic/shot01_phone.png") as ImageSourcePropType;
const chapter1Museum = require("@/assets/story/chapter1_motion_comic/shot02_museum.png") as ImageSourcePropType;
const chapter1Ellis = require("@/assets/story/chapter1_motion_comic/shot03_ellis.png") as ImageSourcePropType;
const chapter1CctvBlack = require("@/assets/story/chapter1_motion_comic/shot04_cctv_black.png") as ImageSourcePropType;
const chapter1MadridCard = require("@/assets/story/chapter1_motion_comic/shot05_madrid_card.png") as ImageSourcePropType;
const chapter1StonesWarningPreview = require("@/assets/story/chapter1_motion_comic/shot06_six_stones.png") as ImageSourcePropType;
const mrBlackPortrait = require("@/assets/story/chapter1_motion_comic/mr_black_portrait.png") as ImageSourcePropType;

export type StoryAssetStatus =
  | "runtime-current"
  | "prototype-reference"
  | "production-needed"
  | "story-decision-needed";

export type StoryAssetRole =
  | "prologue-shot"
  | "dialogue-background"
  | "character-portrait"
  | "future-character-portrait";

export type MotionComicSfx =
  | "phone"
  | "wind"
  | "silence"
  | "footsteps"
  | "card"
  | "gasp"
  | "sting";

export type MotionComicMotion =
  | "slowPush"
  | "panLeft"
  | "panRight"
  | "shake"
  | "flash";

export type Chapter1CharacterId =
  | "rudy"
  | "tom"
  | "ellis"
  | "eleanor"
  | "mr_black";

export type StoryImageAsset = {
  id: string;
  role: StoryAssetRole;
  source?: ImageSourcePropType;
  assetPath?: string;
  status: StoryAssetStatus;
  width?: number;
  height?: number;
  usage: string;
  notes: string;
};

export type MotionComicShot = {
  id: string;
  order: number;
  imageAssetId: string;
  beat: string;
  durationMs: number;
  sfx: MotionComicSfx;
  motion: MotionComicMotion[];
  showDialogueBox: false;
  optionalAccessibilityCaption: string;
  productionLock: "safe-now" | "revise-before-final-art";
};

export type DialogueModeBeat = {
  id: string;
  backgroundAssetId: string;
  speakerId: Chapter1CharacterId;
  portraitAssetId?: string;
  intent: string;
  productionLock: "safe-now" | "needs-dialogue-polish";
};

export type ChapterStoryAssetManifest = {
  chapterId: "london";
  title: string;
  runtimeSource: "app/story-scene.tsx";
  prototypeReferences: string[];
  currentAssetNotice: string;
  imageAssets: Record<string, StoryImageAsset>;
  prologue: {
    mode: "silent-motion-comic";
    showBottomDialogueBox: false;
    skipPolicy: "skippable-after-first-viewing";
    replayPolicy: "replay-from-chapter-list";
    shots: MotionComicShot[];
  };
  dialogueMode: {
    layout: "character-bust-over-bottom-dialogue";
    defaultBackgroundAssetId: string;
    beats: DialogueModeBeat[];
  };
  characterProduction: Record<Chapter1CharacterId, {
    priority: "now" | "next" | "later";
    requiredAssets: string[];
    sourceOfTruth: string;
    notes: string;
  }>;
  nextIntegrationPoints: string[];
};

export const chapter1StoryAssetManifest: ChapterStoryAssetManifest = {
  chapterId: "london",
  title: "The London Cipher",
  runtimeSource: "app/story-scene.tsx",
  prototypeReferences: [
    "prototypes/chapter1-prologue-dialogue-sample.html",
    "prototypes/chapter1-motion-comic-sample.html",
    "data/evaluation/story_mode_direction_notes_2026-04-29.md",
    "data/evaluation/character_bible.md",
  ],
  currentAssetNotice:
    "Chapter 1 images under assets/story/chapter1_motion_comic are preview assets, not final production art. Keep them usable as static Expo assets while final art is locked. Shot 06 comes from an older six-stone preview pass and must be revised before final art to match the seven-stone canon.",
  imageAssets: {
    "rudy-story-portrait": {
      id: "rudy-story-portrait",
      role: "character-portrait",
      source: rudyStoryPortrait,
      assetPath: "assets/rudy_story.png",
      status: "runtime-current",
      usage: "Current Rudy portrait used by app/story-scene.tsx for isLingo characters.",
      notes:
        "Use as the bridge asset for dialogue mode until a transparent Rudy expression pack exists.",
    },
    "ch1-shot01-phone": {
      id: "ch1-shot01-phone",
      role: "prologue-shot",
      source: chapter1Phone,
      assetPath: "assets/story/chapter1_motion_comic/shot01_phone.png",
      status: "prototype-reference",
      width: 941,
      height: 1672,
      usage: "Silent prologue shot: 3:47 AM phone alarm from Eleanor.",
      notes: "Preview vertical keyframe. Good enough for manifest wiring and layout tests.",
    },
    "ch1-shot02-museum": {
      id: "ch1-shot02-museum",
      role: "prologue-shot",
      source: chapter1Museum,
      assetPath: "assets/story/chapter1_motion_comic/shot02_museum.png",
      status: "prototype-reference",
      width: 941,
      height: 1672,
      usage: "Silent prologue shot and dialogue background: British Museum exterior at 4:30 AM.",
      notes: "Use for the transition back to investigation mode after the prologue.",
    },
    "ch1-shot03-ellis": {
      id: "ch1-shot03-ellis",
      role: "dialogue-background",
      source: chapter1Ellis,
      assetPath: "assets/story/chapter1_motion_comic/shot03_ellis.png",
      status: "prototype-reference",
      width: 941,
      height: 1672,
      usage: "Silent prologue shot and default dialogue background: Dr. Ellis and the missing stone.",
      notes: "Best first background for Rudy's post-prologue interpretation.",
    },
    "ch1-shot04-cctv-black": {
      id: "ch1-shot04-cctv-black",
      role: "prologue-shot",
      source: chapter1CctvBlack,
      assetPath: "assets/story/chapter1_motion_comic/shot04_cctv_black.png",
      status: "prototype-reference",
      width: 941,
      height: 1672,
      usage: "Silent prologue shot and pressure background: CCTV reveal of Mr. Black.",
      notes: "Keep Mr. Black mysterious in Ch1. Avoid overusing the portrait before story lock.",
    },
    "ch1-shot05-madrid-card": {
      id: "ch1-shot05-madrid-card",
      role: "prologue-shot",
      source: chapter1MadridCard,
      assetPath: "assets/story/chapter1_motion_comic/shot05_madrid_card.png",
      status: "prototype-reference",
      width: 941,
      height: 1672,
      usage: "Silent prologue shot and clue background: Ace of Spades with MADRID.",
      notes: "The safest lock candidate because it directly sets the Chapter 2 destination.",
    },
    "ch1-shot06-six-stones": {
      id: "ch1-shot06-six-stones",
      role: "prologue-shot",
      source: chapter1StonesWarningPreview,
      assetPath: "assets/story/chapter1_motion_comic/shot06_six_stones.png",
      status: "prototype-reference",
      width: 941,
      height: 1672,
      usage: "Silent prologue shot and stakes background: seven Guardian Stones warning placeholder.",
      notes:
        "Preview-only legacy asset. Keep the file path and manifest id stable for layout tests, but do not use this art as final: shot 06 must be revised before production to follow the seven-stone ledger and avoid locking obsolete six-stone copy into final artwork.",
    },
    "mr-black-prototype-portrait": {
      id: "mr-black-prototype-portrait",
      role: "character-portrait",
      source: mrBlackPortrait,
      assetPath: "assets/story/chapter1_motion_comic/mr_black_portrait.png",
      status: "prototype-reference",
      width: 1024,
      height: 1536,
      usage: "Prototype Mr. Black bust for dialogue-mode pressure tests.",
      notes:
        "Reference only. Final Ch1 may use text/CCTV presence instead of a full portrait to preserve mystery.",
    },
    "tom-final-portrait": {
      id: "tom-final-portrait",
      role: "future-character-portrait",
      status: "production-needed",
      usage: "London guard dialogue after the prologue and first quiz setup.",
      notes: "Needed before replacing Tom's emoji avatar in production dialogue mode.",
    },
    "ellis-final-portrait": {
      id: "ellis-final-portrait",
      role: "future-character-portrait",
      status: "story-decision-needed",
      usage: "Dr. Ellis can stay mostly visual in Ch1 unless dialogue revisions give her more lines.",
      notes: "Do not commission final variants until her speaking role is locked.",
    },
    "eleanor-final-portrait": {
      id: "eleanor-final-portrait",
      role: "future-character-portrait",
      status: "production-needed",
      usage: "Mentor/curator call, chapter briefing, and future message presence.",
      notes: "High value because Eleanor anchors the case and connects later Mr. Black history.",
    },
  },
  prologue: {
    mode: "silent-motion-comic",
    showBottomDialogueBox: false,
    skipPolicy: "skippable-after-first-viewing",
    replayPolicy: "replay-from-chapter-list",
    shots: [
      {
        id: "ch1-prologue-phone",
        order: 1,
        imageAssetId: "ch1-shot01-phone",
        beat: "3:47 AM phone alarm. Eleanor has called repeatedly.",
        durationMs: 2200,
        sfx: "phone",
        motion: ["shake", "slowPush"],
        showDialogueBox: false,
        optionalAccessibilityCaption: "3:47 AM. Eleanor has called three times.",
        productionLock: "safe-now",
      },
      {
        id: "ch1-prologue-museum",
        order: 2,
        imageAssetId: "ch1-shot02-museum",
        beat: "British Museum exterior at 4:30 AM with police tape, fog, and emergency lights.",
        durationMs: 2500,
        sfx: "wind",
        motion: ["panRight", "slowPush"],
        showDialogueBox: false,
        optionalAccessibilityCaption: "4:30 AM. The museum is already a crime scene.",
        productionLock: "safe-now",
      },
      {
        id: "ch1-prologue-ellis",
        order: 3,
        imageAssetId: "ch1-shot03-ellis",
        beat: "Dr. Ellis is alive but wordless. The Guardian Stone display is empty.",
        durationMs: 2800,
        sfx: "silence",
        motion: ["shake", "slowPush"],
        showDialogueBox: false,
        optionalAccessibilityCaption: "Dr. Ellis is alive, but her words are gone.",
        productionLock: "safe-now",
      },
      {
        id: "ch1-prologue-cctv",
        order: 4,
        imageAssetId: "ch1-shot04-cctv-black",
        beat: "CCTV shows the black-coated thief walking calmly and looking into the camera.",
        durationMs: 2700,
        sfx: "footsteps",
        motion: ["panLeft", "slowPush"],
        showDialogueBox: false,
        optionalAccessibilityCaption: "The thief looks into the camera. He wants to be seen.",
        productionLock: "safe-now",
      },
      {
        id: "ch1-prologue-madrid-card",
        order: 5,
        imageAssetId: "ch1-shot05-madrid-card",
        beat: "Ace of Spades clue with MADRID written in red.",
        durationMs: 2300,
        sfx: "card",
        motion: ["shake", "flash"],
        showDialogueBox: false,
        optionalAccessibilityCaption: "One clue remains: MADRID.",
        productionLock: "safe-now",
      },
      {
        id: "ch1-prologue-six-stones",
        order: 6,
        imageAssetId: "ch1-shot06-six-stones",
        beat: "Seven Guardian Stones warning expands the stakes from one theft to every language.",
        durationMs: 3000,
        sfx: "gasp",
        motion: ["shake", "slowPush"],
        showDialogueBox: false,
        optionalAccessibilityCaption: "Seven stones. Seven locks. One larger threat.",
        productionLock: "revise-before-final-art",
      },
    ],
  },
  dialogueMode: {
    layout: "character-bust-over-bottom-dialogue",
    defaultBackgroundAssetId: "ch1-shot03-ellis",
    beats: [
      {
        id: "ch1-dialogue-rudy-ellis",
        backgroundAssetId: "ch1-shot03-ellis",
        speakerId: "rudy",
        portraitAssetId: "rudy-story-portrait",
        intent: "Rudy interprets what the player just saw and avoids repeating the full prologue.",
        productionLock: "safe-now",
      },
      {
        id: "ch1-dialogue-rudy-cctv",
        backgroundAssetId: "ch1-shot04-cctv-black",
        speakerId: "rudy",
        portraitAssetId: "rudy-story-portrait",
        intent: "Rudy points out that the thief is inviting pursuit, not hiding.",
        productionLock: "needs-dialogue-polish",
      },
      {
        id: "ch1-dialogue-rudy-madrid",
        backgroundAssetId: "ch1-shot05-madrid-card",
        speakerId: "rudy",
        portraitAssetId: "rudy-story-portrait",
        intent: "Rudy frames Madrid as both clue and taunt before the learner resumes investigation.",
        productionLock: "safe-now",
      },
      {
        id: "ch1-dialogue-black-pressure",
        backgroundAssetId: "ch1-shot04-cctv-black",
        speakerId: "mr_black",
        portraitAssetId: "mr-black-prototype-portrait",
        intent: "Optional pressure insert. Use only if Ch1 story review approves visible Mr. Black.",
        productionLock: "needs-dialogue-polish",
      },
    ],
  },
  characterProduction: {
    rudy: {
      priority: "now",
      requiredAssets: [
        "friendly",
        "thinking",
        "surprised",
        "serious-deduction",
        "encouraging",
        "puzzle-solved",
      ],
      sourceOfTruth: "data/evaluation/story_mode_direction_notes_2026-04-29.md",
      notes:
        "Current runtime already uses rudy_story.png. Final dialogue mode needs expression variants, but integration can begin with the existing portrait.",
    },
    mr_black: {
      priority: "next",
      requiredAssets: [
        "polite-mask",
        "cold-certainty",
        "amused-contempt",
        "final-boss-calm",
        "notebook-closeup",
      ],
      sourceOfTruth: "data/evaluation/character_bible.md",
      notes:
        "Keep Ch1 visual presence restrained. The final portrait pack should follow the calm former-interpreter direction, not a generic villain look.",
    },
    tom: {
      priority: "now",
      requiredAssets: ["friendly-guard", "worried-witness", "comic-relief", "serious-recall"],
      sourceOfTruth: "data/evaluation/character_bible.md",
      notes:
        "Tom is the first NPC most likely to benefit from a real bust because the current runtime falls back to emoji avatars.",
    },
    ellis: {
      priority: "later",
      requiredAssets: ["silent-shock", "recovering-warning"],
      sourceOfTruth: "data/evaluation/story_mode_direction_notes_2026-04-29.md",
      notes:
        "The prologue can carry Ellis visually. Final portrait production depends on how much direct dialogue remains.",
    },
    eleanor: {
      priority: "next",
      requiredAssets: ["urgent-call", "controlled-curator", "mentor-approval"],
      sourceOfTruth: "data/evaluation/character_bible.md",
      notes:
        "Useful for the phone-call framing and later mentor continuity, but not needed to test the prologue engine.",
    },
  },
  nextIntegrationPoints: [
    "Import chapter1StoryAssetManifest into a new MotionComicPrologue component when app/story-scene.tsx is ready to be changed.",
    "Use prologue.shots for image source, duration, sfx key, motion preset, and progress state.",
    "Use dialogueMode.beats as the bridge from prologue into the existing story sequence without duplicating exposition.",
    "Replace emoji fallback for Chapter 1 NPCs only after final portrait assets are generated and approved.",
    "Keep generation server-side or in scripts; do not call image generation APIs from the mobile client.",
  ],
};

export const storyAssetManifest = {
  london: chapter1StoryAssetManifest,
} as const;

export type StoryAssetChapterId = keyof typeof storyAssetManifest;

export function getStoryAssetManifest(chapterId: StoryAssetChapterId) {
  return storyAssetManifest[chapterId];
}
