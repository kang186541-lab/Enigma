import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const storySceneSource = readFileSync("app/story-scene.tsx", "utf8");

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

const dialogueBackgrounds = collectRequiredAssets("assets/story/dialogue_backgrounds/");
const dialogueSprites = collectRequiredAssets("assets/story/dialogue_sprites/");

assert.equal(dialogueBackgrounds.length, 9, "Story stage should keep the 9 authored dialogue backgrounds wired");
assert.ok(dialogueSprites.length >= 16, "Story stage should keep authored dialogue sprites wired");

for (const assetPath of [...dialogueBackgrounds, ...dialogueSprites]) {
  assertAssetExists(assetPath);
}

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
