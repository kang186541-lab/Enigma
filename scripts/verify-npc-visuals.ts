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

  const assetPath = path.join(root, "assets", "npcs", "roles", `${id}_role.png`);
  if (!fs.existsSync(assetPath)) {
    fail(`missing role portrait asset for NPC "${id}": ${assetPath}`);
  }

  const size = fs.statSync(assetPath).size;
  if (size < 100_000) {
    fail(`role portrait asset for NPC "${id}" is suspiciously small: ${size} bytes`);
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

console.log(`[verify-npc-visuals] PASS: ${npcIds.length} NPC role portraits are registered, present, and wired.`);
