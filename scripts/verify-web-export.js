const fs = require("fs");
const path = require("path");

const outDir = process.argv[2] || "dist";
const indexPath = path.join(outDir, "index.html");

function fail(message) {
  console.error(`web export verification failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

assert(fs.existsSync(indexPath), `missing ${indexPath}`);

const html = fs.readFileSync(indexPath, "utf8");
const entryMatch = html.match(/\/_expo\/static\/js\/web\/(entry-[a-f0-9]+\.js)/);
assert(entryMatch, "index.html does not reference a hashed Expo entry bundle");

const entryPath = path.join(outDir, "_expo", "static", "js", "web", entryMatch[1]);
assert(fs.existsSync(entryPath), `missing referenced bundle ${entryMatch[1]}`);

assert(!html.includes("/assets/node_modules/"), "index.html still references /assets/node_modules/");
assert(html.includes("/assets/vendor/"), "index.html does not reference rewritten /assets/vendor/ assets");
assert(html.includes("lingua-icon-fonts"), "icon font injection block is missing");
assert(html.includes('font-family:"Ionicons"'), "Ionicons @font-face is missing");
assert(html.includes('font-family:"Feather"'), "Feather @font-face is missing");
assert(html.includes("Noto+Color+Emoji"), "Noto Color Emoji stylesheet is missing");

const vendorRoot = path.join(outDir, "assets", "vendor", "@expo", "vector-icons", "build", "vendor", "react-native-vector-icons", "Fonts");
assert(fs.existsSync(vendorRoot), "vector icon vendor font directory is missing");
assert(fs.readdirSync(vendorRoot).some((name) => /^Ionicons\.[a-f0-9]+\.ttf$/i.test(name)), "Ionicons font file is missing from assets/vendor");
assert(fs.readdirSync(vendorRoot).some((name) => /^Feather\.[a-f0-9]+\.ttf$/i.test(name)), "Feather font file is missing from assets/vendor");

const bundle = fs.readFileSync(entryPath, "utf8");
assert(!bundle.includes("/assets/node_modules/"), "entry bundle still references /assets/node_modules/");
assert(bundle.includes("/assets/vendor/"), "entry bundle does not reference rewritten /assets/vendor/ assets");
assert(bundle.includes("onboarding_first_speaking_started"), "entry bundle is missing onboarding first-speaking event");
assert(bundle.includes("first-sentence"), "entry bundle is missing first-sentence mission routing");
assert(bundle.includes("Start speaking"), "entry bundle is missing English onboarding speaking CTA");
assert(bundle.includes("Empezar a hablar"), "entry bundle is missing Spanish onboarding speaking CTA");

const homeSource = fs.readFileSync(path.join("app", "(tabs)", "index.tsx"), "utf8");
assert(
  homeSource.includes("<EmojiText style={styles.levelEmoji}>{level.emoji}</EmojiText>") &&
    homeSource.includes("<EmojiText style={styles.npcEmoji}>☕</EmojiText>") &&
    homeSource.includes("<EmojiText style={styles.npcMissionBg}>🕵️</EmojiText>"),
  "Home should route high-visibility emoji through EmojiText for web rendering"
);

const storySceneSource = fs.readFileSync(path.join("app", "story-scene.tsx"), "utf8");
assert(
  storySceneSource.includes("<EmojiText style={styles.avatarEmoji}>{character.emoji}</EmojiText>") &&
    storySceneSource.includes("<EmojiText style={styles.speakerEmoji}>{character.emoji}</EmojiText>"),
  "Story scene fallback character emoji should use EmojiText on web"
);

console.log(`web export verification passed (${entryMatch[1]})`);
