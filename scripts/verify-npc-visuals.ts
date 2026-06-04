import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message: string): never {
  console.error(`[verify-npc-visuals] ${message}`);
  process.exit(1);
}

const npcsSource = read("constants/npcs.ts");
const visualsSource = read("constants/npcVisuals.ts");
const listSource = read("app/npc-list.tsx");
const missionSource = read("app/npc-mission.tsx");
const avatarSource = read("components/NpcAvatar.tsx");

const npcIds = Array.from(npcsSource.matchAll(/^\s*id:\s*"([^"]+)"/gm), match => match[1]);

if (npcIds.length !== 23) {
  fail(`expected 23 NPC ids in constants/npcs.ts, found ${npcIds.length}`);
}

for (const id of npcIds) {
  const entryPattern = new RegExp(`\\b${id}:\\s*\\{[^}]*rolePortrait:\\s*require\\("../assets/npcs/roles/${id}_role\\.png"\\)`, "s");
  if (!entryPattern.test(visualsSource)) {
    fail(`missing role portrait registry entry for NPC "${id}"`);
  }

  const colorPattern = new RegExp(`\\b${id}:\\s*\\{[^}]*sceneColors:\\s*\\[\\s*"#[0-9a-fA-F]{6}"\\s*,\\s*"#[0-9a-fA-F]{6}"\\s*,\\s*"#[0-9a-fA-F]{6}"\\s*\\]`, "s");
  if (!colorPattern.test(visualsSource)) {
    fail(`missing scenario color staging for NPC "${id}"`);
  }

  const assetPath = path.join(root, "assets", "npcs", "roles", `${id}_role.png`);
  if (!fs.existsSync(assetPath)) {
    fail(`missing role portrait asset for NPC "${id}": ${assetPath}`);
  }

  const size = fs.statSync(assetPath).size;
  if (size < 100_000) {
    fail(`role portrait asset for NPC "${id}" is suspiciously small: ${size} bytes`);
  }
}

const scenePlateRequirements: Array<[string, string]> = [
  ["penny", "penny_cafe_scene.png"],
  ["miguel", "miguel_restaurant_scene.png"],
  ["tom", "tom_taxi_scene.png"],
  ["hassan", "hassan_airport_scene.png"],
  ["eleanor", "eleanor_hotel_scene.png"],
  ["sujin", "sujin_clinic_scene.png"],
  ["minho", "minho_phone_shop_scene.png"],
  ["youngsook", "youngsook_market_scene.png"],
  ["isabel", "isabel_shopping_scene.png"],
  ["carlos", "carlos_bar_scene.png"],
  ["amira", "amira_bank_scene.png"],
  ["ryan", "ryan_fast_food_scene.png"],
  ["nari", "nari_transit_scene.png"],
  ["derek", "derek_guesthouse_scene.png"],
  ["mei", "mei_pharmacy_scene.png"],
  ["juno", "juno_delivery_scene.png"],
  ["gloria", "gloria_returns_scene.png"],
  ["stan", "stan_post_office_scene.png"],
  ["hana", "hana_social_scene.png"],
  ["vincent", "vincent_apartment_scene.png"],
  ["claire", "claire_interview_scene.png"],
  ["officer_kwon", "officer_kwon_visa_scene.png"],
  ["luca", "luca_hair_salon_scene.png"],
];

for (const [id, filename] of scenePlateRequirements) {
  const scenePath = path.join(root, "assets", "npcs", "scenes", filename);
  const requireString = `sceneImage: require("../assets/npcs/scenes/${filename}")`;
  if (!visualsSource.includes(requireString)) {
    fail(`${id} should use a full scenario scene plate, not only a small avatar portrait`);
  }
  if (!fs.existsSync(scenePath)) {
    fail(`missing ${id} scenario scene plate: ${scenePath}`);
  }
  if (fs.statSync(scenePath).size < 500_000) {
    fail(`${id} scenario scene plate is suspiciously small`);
  }
}

if (!avatarSource.includes("getNPCVisual") || !avatarSource.includes("rolePortrait")) {
  fail("NpcAvatar must render through constants/npcVisuals.ts");
}

if (!listSource.includes("<NpcAvatar")) {
  fail("app/npc-list.tsx must render NPC cards with NpcAvatar");
}

const missionAvatarCount = (missionSource.match(/<NpcAvatar/g) ?? []).length;
if (missionAvatarCount < 4) {
  fail(`app/npc-mission.tsx should use NpcAvatar in chat/header/typing/popup, found ${missionAvatarCount}`);
}

if (/npcAvatarEmoji>\{npc/.test(missionSource) || /emojiText>\{unlocked \? npc\.emoji/.test(listSource)) {
  fail("NPC screens still render identity avatars directly from emoji fallback");
}

for (const anchor of ["sceneStage", "sceneImageStage", "scenePlateImage", "sceneCharacter", "Animated.Image"]) {
  if (!missionSource.includes(anchor)) {
    fail(`app/npc-mission.tsx is missing scenario stage anchor: ${anchor}`);
  }
}

if (missionSource.includes("ImageBackground")) {
  fail("NPC scene stage should not use ImageBackground; RN Web can crop scene plates at their intrinsic size");
}

if (!missionSource.includes("aspectRatio: 16 / 9")) {
  fail("NPC scene plates must preserve their 16:9 composition instead of using a short fixed-height crop");
}

if (/sceneImageStage:\s*\{[\s\S]*height:\s*Platform\.OS\s*===\s*"web"\s*\?\s*154/.test(missionSource)) {
  fail("NPC scene stage still uses the old short 154px web height that crops character faces");
}

console.log(`[verify-npc-visuals] PASS: ${npcIds.length} NPC role portraits and ${scenePlateRequirements.length} scene plates are registered, present, and wired.`);
