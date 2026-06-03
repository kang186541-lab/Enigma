import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const languages = ["english", "korean", "spanish", "indonesian"] as const;
const timelineFiles = ["ch1", "ch2", "ch3", "ch4", "ch5"].map(
  (chapter) => `components/story/intro/timelines/${chapter}.ts`,
);

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

let totalAccessibilityLabels = 0;

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
  phoneLines.forEach((block, index) => {
    assertLocalizedBlock(block, `${file} phoneLines #${index + 1}`);
  });

  const wordBlocks = findAllBalancedBlocks(source, "word:");
  wordBlocks.forEach((block, index) => {
    assertLocalizedBlock(block, `${file} word overlay #${index + 1}`);
  });
}

assert.equal(totalAccessibilityLabels, 35, "All 35 intro shot accessibility labels should be localized");

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
assert.ok(
  rendererSource.includes("function getWordOverlayFitStyle") &&
    rendererSource.includes("Array.from(word).length") &&
    rendererSource.includes('left: "8%"') &&
    rendererSource.includes('right: "8%"') &&
    rendererSource.includes('textAlign: "center"'),
  "Localized intro word overlays should keep mobile-safe fit styling",
);

console.log("story intro localization verification passed");
