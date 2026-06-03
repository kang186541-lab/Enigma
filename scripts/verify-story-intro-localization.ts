import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const languages = ["english", "korean", "spanish", "indonesian"] as const;
const timelineFiles = ["ch1", "ch2", "ch3", "ch4", "ch5"].map(
  (chapter) => `components/story/intro/timelines/${chapter}.ts`,
);
const localizedOverlayKinds = [
  "phone",
  "open",
  "find",
  "black",
  "naming",
  "word",
  "korean-word",
  "color-restore",
  "carlos-call",
] as const;
const decorativeBakedTextAssets = new Set([
  "assets/story/chapter1_motion_comic/ch1_intro_black_cctv.png",
  "assets/story/chapter1_motion_comic/ch1_intro_open.png",
  "assets/story/chapter1_motion_comic/ch1_intro_phone.png",
  "assets/story/chapter2_motion_comic/ch2_intro_phone.png",
  "assets/story/chapter3_motion_comic/ch3_intro_cairo_record.png",
  "assets/story/chapter3_motion_comic/ch3_intro_phone.png",
  "assets/story/chapter4_motion_comic/ch4_intro_amira_records.png",
  "assets/story/chapter4_motion_comic/ch4_intro_babel_hook.png",
  "assets/story/chapter4_motion_comic/ch4_intro_phone.png",
  "assets/story/chapter5_motion_comic/ch5_intro_coordinates.png",
  "assets/story/chapter5_motion_comic/ch5_intro_gates.png",
  "assets/story/chapter5_motion_comic/ch5_intro_lullaby_journal.png",
  "assets/story/dialogue_backgrounds/babel_language_gates.png",
  "assets/story/dialogue_backgrounds/babel_tower_core.png",
  "assets/story/dialogue_backgrounds/cairo_hospital_record.png",
  "assets/story/dialogue_sprites/ch1_black_cctv_sprite.png",
]);

function findBalancedBlock(source: string, fieldName: string, startAt = 0): { block: string; end: number } | null {
  const fieldIndex = source.indexOf(fieldName, startAt);
  if (fieldIndex < 0) return null;
  const openIndex = source.indexOf("{", fieldIndex);
  if (openIndex < 0) return null;

  let depth = 0;
  let inString: '"' | "'" | "`" | null = null;
  let escaped = false;

  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return { block: source.slice(openIndex, index + 1), end: index + 1 };
      }
    }
  }

  return null;
}

function findAllBalancedBlocks(source: string, fieldName: string): string[] {
  const blocks: string[] = [];
  let cursor = 0;

  while (cursor < source.length) {
    const match = findBalancedBlock(source, fieldName, cursor);
    if (!match) break;
    blocks.push(match.block);
    cursor = match.end;
  }

  return blocks;
}

function assertLocalizedBlock(block: string, label: string): void {
  for (const lang of languages) {
    assert.match(
      block,
      new RegExp(`${lang}:\\s*(?:"[^"]+"|\\[[\\s\\S]*?\\])`),
      `${label} must include non-empty ${lang} copy`,
    );
  }
}

function assertNoJapaneseScope(source: string, label: string): void {
  assert.ok(!/japanese|Japan|ja-JP|ja:|Nihongo/i.test(source), `${label} must not add Japanese scope`);
}

function countPattern(source: string, pattern: RegExp): number {
  return [...source.matchAll(pattern)].length;
}

function walkFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      files.push(...walkFiles(path));
    } else {
      files.push(path);
    }
  }
  return files;
}

let totalAccessibilityLabels = 0;
let totalPhoneOverlays = 0;
let totalBlackOverlays = 0;

for (const file of timelineFiles) {
  const source = readFileSync(file, "utf8");
  assertNoJapaneseScope(source, file);

  const accessibilityBlocks = findAllBalancedBlocks(source, "accessibilityLabel:");
  totalAccessibilityLabels += accessibilityBlocks.length;
  assert.equal(accessibilityBlocks.length, 7, `${file} should keep 7 localized intro shot labels`);
  accessibilityBlocks.forEach((block, index) => {
    assertLocalizedBlock(block, `${file} accessibilityLabel #${index + 1}`);
  });

  const finalDialogue = findBalancedBlock(source, "finalDialogue:");
  assert.ok(finalDialogue, `${file} must define finalDialogue`);
  assertLocalizedBlock(finalDialogue.block, `${file} finalDialogue`);

  const villainMessage = findBalancedBlock(source, "villainMessage:");
  assert.ok(villainMessage, `${file} must define villainMessage`);
  assertLocalizedBlock(villainMessage.block, `${file} villainMessage`);

  const copy = findBalancedBlock(source, "copy:");
  assert.ok(copy, `${file} must define intro copy`);
  assertLocalizedBlock(copy.block, `${file} copy`);

  const phoneLines = findAllBalancedBlocks(source, "phoneLines:");
  const phoneOverlayCount = countPattern(source, /overlay:\s*"phone"/g);
  totalPhoneOverlays += phoneOverlayCount;
  assert.equal(
    phoneLines.length,
    phoneOverlayCount,
    `${file} phone-screen narrative copy must be supplied as localized overlay text, not baked into PNGs`,
  );
  phoneLines.forEach((block, index) => {
    assertLocalizedBlock(block, `${file} phoneLines #${index + 1}`);
  });

  totalBlackOverlays += countPattern(source, /overlay:\s*"black"/g);
  assert.doesNotMatch(
    source,
    /overlayCopy:\s*\{[\s\S]*?\bword:\s*["'`]/,
    `${file} intro word overlays must use localized objects, not one-language strings`,
  );

  const wordBlocks = findAllBalancedBlocks(source, "word:");
  wordBlocks.forEach((block, index) => {
    assertLocalizedBlock(block, `${file} word overlay #${index + 1}`);
  });
}

assert.equal(totalAccessibilityLabels, 35, "All 35 intro shot accessibility labels should be localized");
assert.equal(totalPhoneOverlays, 4, "Story intros should keep the 4 phone-message shots localized through PhoneOverlay");
assert.equal(totalBlackOverlays, 5, "Story intros should keep villain messages localized through BlackMessageOverlay");

const typeSource = readFileSync("components/story/intro/timelines/types.ts", "utf8");
assert.ok(typeSource.includes("accessibilityLabel: LocalizedText"), "Intro shot accessibility labels must stay localized");

const rendererSource = readFileSync("components/story/StoryIntroMotionComic.tsx", "utf8");
assertNoJapaneseScope(rendererSource, "StoryIntroMotionComic");
assert.ok(
  rendererSource.includes("accessibilityLabel={localizeText(shot.accessibilityLabel, nativeLang)}"),
  "StoryIntroMotionComic must resolve localized shot accessibility labels at render time",
);
assert.ok(
  rendererSource.includes("renderOverlay(currentShot, timeline, nativeLang)") &&
    rendererSource.includes("function renderOverlay(shot: StoryIntroShot, timeline: IntroTimeline, lang: NativeLanguage)"),
  "Intro overlays must receive nativeLang so visible copy stays localized",
);
for (const kind of localizedOverlayKinds) {
  assert.ok(rendererSource.includes(`kind === "${kind}"`), `StoryIntroMotionComic must keep ${kind} as a localized render-layer overlay`);
}
assert.ok(
  rendererSource.includes("localizeTextList(shot.overlayCopy?.phoneLines, lang") &&
    rendererSource.includes("<PhoneOverlay") &&
    rendererSource.includes("<BlackMessageOverlay message={localizeText(timeline.villainMessage, lang)}") &&
    rendererSource.includes("<NamingOverlay"),
  "Phone, villain, and naming copy must stay render-layered instead of being baked into story images",
);
assert.ok(
  rendererSource.includes("function getWordOverlayFitStyle") &&
    rendererSource.includes("Array.from(word).length") &&
    rendererSource.includes('left: "8%"') &&
    rendererSource.includes('right: "8%"') &&
    rendererSource.includes('textAlign: "center"'),
  "Localized intro word overlays should keep mobile-safe fit styling",
);

const riskyImageNamePattern = /(phone|record|journal|sign|gate|gates|cctv|note|coordinates|open|find|word|language|babel)/i;
const riskyStoryImages = walkFiles("assets/story").filter((path) => (
  /\.(png|jpe?g)$/i.test(path) && riskyImageNamePattern.test(path)
));

for (const assetPath of riskyStoryImages) {
  assert.ok(
    decorativeBakedTextAssets.has(assetPath),
    `${assetPath} looks like it may contain readable text; add localized render-layer copy or explicitly classify it as decorative`,
  );
}

console.log("story intro localization verification passed");
