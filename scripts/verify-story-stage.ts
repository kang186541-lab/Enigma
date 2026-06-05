import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as ts from "typescript";

const storySceneSource = readFileSync("app/story-scene.tsx", "utf8");
const bossSpellPuzzleSource = readFileSync("components/story/puzzles/BossSpellPuzzle/index.tsx", "utf8");
const storySceneAst = ts.createSourceFile(
  "app/story-scene.tsx",
  storySceneSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);

function assertIncludes(needle: string, message: string): void {
  assert.ok(storySceneSource.includes(needle), message);
}

function countIncludes(needle: string): number {
  return storySceneSource.split(needle).length - 1;
}

function assertAssetExists(assetPath: string): void {
  assert.ok(existsSync(assetPath), `${assetPath} must exist`);
}

function readPngSize(assetPath: string): { width: number; height: number } {
  const buffer = readFileSync(assetPath);
  assert.equal(buffer.toString("ascii", 1, 4), "PNG", `${assetPath} must be a PNG`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readJpegSize(assetPath: string): { width: number; height: number } {
  const buffer = readFileSync(assetPath);
  assert.ok(buffer[0] === 0xff && buffer[1] === 0xd8, `${assetPath} must be a JPEG`);

  let offset = 2;
  while (offset + 9 < buffer.length) {
    while (offset < buffer.length && buffer[offset] !== 0xff) offset += 1;
    const marker = buffer[offset + 1];
    offset += 2;

    if (marker === 0xd9 || marker === 0xda) break;
    const length = buffer.readUInt16BE(offset);
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }

    offset += length;
  }

  assert.fail(`${assetPath} must expose JPEG dimensions`);
}

function readImageSize(assetPath: string): { width: number; height: number } {
  return assetPath.toLowerCase().endsWith(".jpg") || assetPath.toLowerCase().endsWith(".jpeg")
    ? readJpegSize(assetPath)
    : readPngSize(assetPath);
}

function collectRequiredAssets(prefix: string): string[] {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`require\\("@/${escapedPrefix}([^"]+\\.png)"\\)`, "g");
  return [...storySceneSource.matchAll(pattern)].map((match) => join(prefix, match[1]).replace(/\\/g, "/"));
}

function propertyNameText(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

function getProperty(objectNode: ts.ObjectLiteralExpression, name: string): ts.PropertyAssignment | null {
  for (const property of objectNode.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const propertyName = propertyNameText(property.name);
    if (propertyName === name) return property;
  }
  return null;
}

function getArrayProperty(objectNode: ts.ObjectLiteralExpression, name: string): ts.ArrayLiteralExpression | null {
  const property = getProperty(objectNode, name);
  return property && ts.isArrayLiteralExpression(property.initializer) ? property.initializer : null;
}

function getStringProperty(objectNode: ts.ObjectLiteralExpression, name: string): string | null {
  const property = getProperty(objectNode, name);
  return property && ts.isStringLiteralLike(property.initializer) ? property.initializer.text : null;
}

function getBooleanProperty(objectNode: ts.ObjectLiteralExpression, name: string): boolean {
  const property = getProperty(objectNode, name);
  return property?.initializer.kind === ts.SyntaxKind.TrueKeyword;
}

function hasProperty(objectNode: ts.ObjectLiteralExpression, name: string): boolean {
  return Boolean(getProperty(objectNode, name));
}

function findTopLevelObjectVariable(name: string): ts.ObjectLiteralExpression {
  for (const statement of storySceneAst.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== name) continue;
      assert.ok(
        declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer),
        `${name} must stay an object literal so story visual coverage can be verified`,
      );
      return declaration.initializer;
    }
  }

  assert.fail(`${name} object literal not found`);
}

function collectObjectKeys(objectNode: ts.ObjectLiteralExpression): Set<string> {
  const keys = new Set<string>();
  for (const property of objectNode.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = propertyNameText(property.name);
    if (name) keys.add(name);
  }
  return keys;
}

function collectBackdropIds(): Set<string> {
  const ids = new Set<string>();
  function visit(node: ts.Node): void {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === "StoryBackdropId" && ts.isUnionTypeNode(node.type)) {
      for (const typeNode of node.type.types) {
        if (ts.isLiteralTypeNode(typeNode) && ts.isStringLiteral(typeNode.literal)) {
          ids.add(typeNode.literal.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(storySceneAst);
  return ids;
}

function collectActiveStories(storiesObject: ts.ObjectLiteralExpression): Map<string, ts.ObjectLiteralExpression> {
  const stories = new Map<string, ts.ObjectLiteralExpression>();

  for (const property of storiesObject.properties) {
    if (!ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer)) continue;
    const storyId = propertyNameText(property.name);
    if (storyId) stories.set(storyId, property.initializer);
  }

  for (const statement of storySceneAst.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isBinaryExpression(statement.expression)) continue;
    const assignment = statement.expression;
    if (assignment.operatorToken.kind !== ts.SyntaxKind.EqualsToken) continue;
    if (!ts.isPropertyAccessExpression(assignment.left)) continue;
    if (!ts.isIdentifier(assignment.left.expression) || assignment.left.expression.text !== "STORIES") continue;
    if (!ts.isIdentifier(assignment.right)) continue;

    const storyId = assignment.left.name.text;
    stories.set(storyId, findTopLevelObjectVariable(assignment.right.text));
  }

  return stories;
}

const dialogueBackgrounds = collectRequiredAssets("assets/story/dialogue_backgrounds/");
const dialogueSprites = collectRequiredAssets("assets/story/dialogue_sprites/");
const bossQuizPlates = [
  "assets/story/chapter1_motion_comic/ch1_boss_door_quiz_plate.jpg",
  "assets/story/chapter2_motion_comic/ch2_boss_stage_quiz_plate.jpg",
  "assets/story/chapter3_motion_comic/ch3_boss_palace_quiz_plate.jpg",
  "assets/story/chapter4_motion_comic/ch4_boss_archive_quiz_plate.jpg",
  "assets/story/chapter5_motion_comic/ch5_boss_core_quiz_plate.jpg",
];
const storiesObject = findTopLevelObjectVariable("STORIES");
const activeStories = collectActiveStories(storiesObject);
const validBackdrops = collectBackdropIds();
const expressionFallbacks = collectObjectKeys(findTopLevelObjectVariable("characterExpressionFallbacks"));

assert.equal(dialogueBackgrounds.length, 9, "Story stage should keep the 9 authored dialogue backgrounds wired");
assert.ok(dialogueSprites.length >= 16, "Story stage should keep authored dialogue sprites wired");

for (const assetPath of [...dialogueBackgrounds, ...dialogueSprites]) {
  assertAssetExists(assetPath);
}

for (const assetPath of bossQuizPlates) {
  assertAssetExists(assetPath);
  const { width, height } = readImageSize(assetPath);
  assert.ok(
    width > height && width / height >= 1.6,
    `${assetPath} must stay a landscape quiz plate so web boss-spell art fills the card without cropping`,
  );
  assert.ok(readFileSync(assetPath).byteLength < 350 * 1024, `${assetPath} should stay compressed for web delivery`);
}

let storyCount = 0;
let dialogueSceneCount = 0;

for (const [storyId, storyObject] of activeStories) {
  const characters = getArrayProperty(storyObject, "characters");
  const sequence = getArrayProperty(storyObject, "sequence");
  assert.ok(characters, `${storyId} must define characters`);
  assert.ok(sequence, `${storyId} must define sequence`);
  storyCount += 1;

  const characterVisuals = new Map<string, { isLingo: boolean; hasPortrait: boolean; hasVariants: boolean }>();
  for (const element of characters.elements) {
    if (!ts.isObjectLiteralExpression(element)) continue;
    const characterId = getStringProperty(element, "id");
    assert.ok(characterId, `${storyId} character entries must keep literal ids`);
    const isLingo = getBooleanProperty(element, "isLingo");
    const hasPortrait = hasProperty(element, "portrait");
    const hasVariants = hasProperty(element, "portraitVariants");
    assert.ok(
      isLingo || hasPortrait,
      `${storyId}.${characterId} must have portrait art so dialogue never falls back to emoji-only`,
    );
    characterVisuals.set(characterId, { isLingo, hasPortrait, hasVariants });
  }

  for (const element of sequence.elements) {
    if (!ts.isObjectLiteralExpression(element)) continue;
    if (getStringProperty(element, "kind") !== "scene") continue;
    const charId = getStringProperty(element, "charId");
    assert.ok(charId, `${storyId} scene entries must keep literal charId values`);
    const character = characterVisuals.get(charId);
    assert.ok(character, `${storyId} scene references unknown character '${charId}'`);
    const isNarration = getBooleanProperty(element, "isNarration");
    if (!isNarration) {
      dialogueSceneCount += 1;
      assert.ok(
        character.isLingo || character.hasPortrait,
        `${storyId}.${charId} dialogue scene must resolve to character art, not emoji-only`,
      );
    }

    const backdrop = getStringProperty(element, "backdrop");
    if (backdrop) {
      assert.ok(validBackdrops.has(backdrop), `${storyId} scene uses unknown backdrop '${backdrop}'`);
    }

    const expression = getStringProperty(element, "expression");
    if (expression) {
      assert.ok(
        character.hasVariants || expressionFallbacks.has(charId),
        `${storyId}.${charId} expression '${expression}' must resolve through portraitVariants or characterExpressionFallbacks`,
      );
    }
  }
}

assert.equal(storyCount, 5, "Story mode should keep the 5 authored adventure chapters wired");
assert.ok(dialogueSceneCount >= 70, "Story mode should keep visual coverage across authored dialogue scenes");
assert.ok(validBackdrops.size >= 9, "Story backdrop id union should cover all authored dialogue backgrounds");

assertIncludes("function getAdventureBackdropById(backdrop: StoryBackdropId): ImageSourcePropType", "Backdrop lookup must stay centralized");
assertIncludes("function getSceneBackdropId(storyId: string, item: SeqItem): StoryBackdropId | null", "Scene backdrop routing must stay explicit");
assertIncludes("function getSceneCharacterImageSource(story: Story, item: SeqItem): ImageSourcePropType | null", "Character prefetch routing must stay explicit");
assertIncludes("function findSupportingDialogueScene(", "Dialogue scenes should keep visual-novel supporting actor blocking");
assertIncludes("seenCharacterIds", "Supporting actor blocking must avoid revealing not-yet-seen future characters");
assertIncludes("!typingDone && typewriterRef.current && !typewriterRef.current.isDone()", "Story advance must trust parent typingDone state after skip so visible Next buttons can actually advance on web");
assertIncludes("webFadeOutFallbackMs", "Story fade transition must have a web fallback so advance callbacks cannot hang");
assertIncludes("setTimeout(runSceneChange, webFadeOutFallbackMs)", "Story fade transition must force scene changes on web if animation callbacks stall");
assertIncludes("prefetchSceneItem(seq[seqIdx + 2]);", "Story stage should prefetch current plus next two scene images");

assertIncludes("styles.sceneBackdropImage,", "Dialogue backdrop image layer must stay rendered");
assertIncludes("style={styles.sceneBackdropShade}", "Dialogue backdrop shade layer must stay rendered");
assertIncludes("style={styles.sceneBackdropGlow}", "Dialogue backdrop glow layer must stay rendered");
assertIncludes("style={styles.sceneForegroundDepth}", "Dialogue foreground depth layer must stay rendered");
assertIncludes("style={[styles.sceneStageGround, { borderTopColor: story.accentColor }]}", "Dialogue stage ground must stay tied to chapter accent color");
assertIncludes("styles.characterBacklight,", "Character backlight must stay applied");
assertIncludes("styles.characterGroundShadow,", "Character ground shadow must stay applied");
assertIncludes("styles.supportCharacterArea,", "Dialogue scenes should render a background/support actor layer");
assertIncludes("supportingCharacter && hasSupportCharacterArt", "Supporting actors should only render when real character art is available");
assertIncludes("style={styles.stagePortraitFade}", "Character bottom occlusion fade must stay rendered");
assertIncludes("styles.stageCharacterShadow", "Character art should keep stage shadowing");
assertIncludes("speakerPulseAnim", "Dialogue scenes should keep active-speaker motion");
assertIncludes("lastDialogueStageKeyRef", "Same-speaker dialogue should avoid replaying full entrance animation");
assertIncludes(
  "Dialogue art contract: backgrounds and character sprites are text-free art",
  "Dialogue visual assets must stay documented as text-free art plates",
);
assertIncludes(
  "function getSceneText(it: SeqScene)",
  "Dialogue/narration copy must keep a centralized localized text resolver",
);
assertIncludes(
  'out.includes("{IDIOM}")',
  "Idiom placeholder dialogue must be detected before rendering",
);
assertIncludes(
  'out.replace(/\\{IDIOM\\}/g, expr)',
  "Idiom placeholder dialogue must be substituted at runtime instead of leaking {IDIOM}",
);
assertIncludes(
  'learningLang === "arabic" ? "ar"',
  "Idiom substitution must keep Arabic learning-language support",
);
assert.ok(
  countIncludes("text={getSceneText(item)}") >= 2,
  "Narration and dialogue scenes must render copy through localized Typewriter text, not baked image text",
);
assertIncludes('if (lang === "korean")', "Story scene text resolver must keep Korean localization");
assertIncludes('if (lang === "spanish")', "Story scene text resolver must keep Spanish localization");
assertIncludes('if (lang === "indonesian")', "Story scene text resolver must keep Indonesian localization");

assertIncludes("sceneForegroundDepth: {", "Foreground depth style must stay defined");
assertIncludes('top: "42%"', "Foreground depth should begin below the upper focal area");
assertIncludes("sceneStageGround: {", "Stage ground style must stay defined");
assertIncludes("bottom: 126", "Stage ground should sit above the dialogue box");
assertIncludes('backgroundColor: "rgba(8,8,10,0.28)"', "Stage ground should remain subtle");
assertIncludes('transform: [{ skewY: "-2deg" }]', "Stage ground should keep slight visual-novel perspective");

assert.ok(
  bossSpellPuzzleSource.includes('<Image source={doorImage} style={styles.doorImageBackdrop} resizeMode="contain" />') &&
    bossSpellPuzzleSource.includes('<Image source={doorImage} style={styles.doorImageFocus} resizeMode="contain" />'),
  "Boss-spell door art must use contain on visible image layers so portrait boss plates are not cropped inside quiz cards",
);
assert.ok(
  bossSpellPuzzleSource.includes('height: Platform.OS === "web" ? 380 : 340'),
  "Boss-spell stage must keep a portrait-aware height for the authored 941x1672 boss plates",
);
assert.doesNotMatch(
  bossSpellPuzzleSource,
  /style=\{styles\.doorImageBackdrop\}\s+resizeMode="cover"/,
  "Boss-spell backdrop must not use cover because it visibly crops the door art",
);
assert.ok(
  storySceneSource.includes('const ch1BossDoorImg = Platform.OS === "web" ? ch1BossDoorQuizPlateImg : ch1BossDoorPortraitImg') &&
    storySceneSource.includes('const ch2BossStageImg = Platform.OS === "web" ? ch2BossStageQuizPlateImg : ch2BossStagePortraitImg') &&
    storySceneSource.includes('const ch3BossPalaceImg = Platform.OS === "web" ? ch3BossPalaceQuizPlateImg : ch3BossPalacePortraitImg') &&
    storySceneSource.includes('const ch4BossArchiveImg = Platform.OS === "web" ? ch4BossArchiveQuizPlateImg : ch4BossArchivePortraitImg') &&
    storySceneSource.includes('const ch5BossCoreImg = Platform.OS === "web" ? ch5BossCoreQuizPlateImg : ch5BossCorePortraitImg'),
  "Story scenes must use landscape boss quiz plates on web while preserving portrait boss art for native",
);

const codeScope = ["components/story/MotionComicPrologue.tsx", "lib/storyAssetManifest.ts"];
for (const removedPath of codeScope) {
  assert.ok(!existsSync(removedPath), `${removedPath} should stay removed`);
}

assert.ok(
  !/MotionComicPrologue|storyAssetManifest|chapter1StoryAssetManifest|shot0[1-6]_|six-stones/.test(
    storySceneSource,
  ),
  "Active story scene must not reconnect the legacy preview motion-comic path",
);

console.log("story stage verification passed");
