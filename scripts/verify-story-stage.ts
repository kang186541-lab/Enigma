import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as ts from "typescript";

const storySceneSource = readFileSync("app/story-scene.tsx", "utf8");
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

function assertAssetExists(assetPath: string): void {
  assert.ok(existsSync(assetPath), `${assetPath} must exist`);
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
const storiesObject = findTopLevelObjectVariable("STORIES");
const activeStories = collectActiveStories(storiesObject);
const validBackdrops = collectBackdropIds();
const expressionFallbacks = collectObjectKeys(findTopLevelObjectVariable("characterExpressionFallbacks"));

assert.equal(dialogueBackgrounds.length, 9, "Story stage should keep the 9 authored dialogue backgrounds wired");
assert.ok(dialogueSprites.length >= 16, "Story stage should keep authored dialogue sprites wired");

for (const assetPath of [...dialogueBackgrounds, ...dialogueSprites]) {
  assertAssetExists(assetPath);
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
assertIncludes("prefetchSceneItem(seq[seqIdx + 2]);", "Story stage should prefetch current plus next two scene images");

assertIncludes("styles.sceneBackdropImage,", "Dialogue backdrop image layer must stay rendered");
assertIncludes("style={styles.sceneBackdropShade}", "Dialogue backdrop shade layer must stay rendered");
assertIncludes("style={styles.sceneBackdropGlow}", "Dialogue backdrop glow layer must stay rendered");
assertIncludes("style={styles.sceneForegroundDepth}", "Dialogue foreground depth layer must stay rendered");
assertIncludes("style={[styles.sceneStageGround, { borderTopColor: story.accentColor }]}", "Dialogue stage ground must stay tied to chapter accent color");
assertIncludes("styles.characterBacklight,", "Character backlight must stay applied");
assertIncludes("styles.characterGroundShadow,", "Character ground shadow must stay applied");
assertIncludes("style={styles.stagePortraitFade}", "Character bottom occlusion fade must stay rendered");
assertIncludes("styles.stageCharacterShadow", "Character art should keep stage shadowing");
assertIncludes("speakerPulseAnim", "Dialogue scenes should keep active-speaker motion");
assertIncludes("lastDialogueStageKeyRef", "Same-speaker dialogue should avoid replaying full entrance animation");

assertIncludes("sceneForegroundDepth: {", "Foreground depth style must stay defined");
assertIncludes('top: "42%"', "Foreground depth should begin below the upper focal area");
assertIncludes("sceneStageGround: {", "Stage ground style must stay defined");
assertIncludes("bottom: 126", "Stage ground should sit above the dialogue box");
assertIncludes('backgroundColor: "rgba(8,8,10,0.28)"', "Stage ground should remain subtle");
assertIncludes('transform: [{ skewY: "-2deg" }]', "Stage ground should keep slight visual-novel perspective");

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
