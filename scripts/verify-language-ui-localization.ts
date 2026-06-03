import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

const storyTab = read("app/(tabs)/story.tsx");
const lessonContent = read("lib/lessonContent.ts");
const phonemeCoaching = read("components/rudy/PhonemeCoaching.tsx");
const step2KeyPoint = read("components/rudy/Step2KeyPoint.tsx");
const bossSpell = read("components/story/puzzles/BossSpellPuzzle/index.tsx");
const npcMission = read("app/npc-mission.tsx");

function count(source: string, pattern: RegExp): number {
  return [...source.matchAll(pattern)].length;
}

for (const field of ["titleId", "descId", "missionId", "arcId"]) {
  assert.equal(count(storyTab, new RegExp(`\\b${field}:`, "g")), 5, `Story chapter cards must define 5 ${field} values`);
}

for (const snippet of [
  'if (lang === "indonesian") return ch.titleId;',
  'if (lang === "indonesian") return ch.descId;',
  'if (lang === "indonesian") return ch.missionId;',
  'if (lang === "indonesian") return ch.arcId;',
  'lang === "spanish" ? "Repetir"',
  'lang === "indonesian" ? "Putar lagi"',
  'lang === "spanish" ? "Entrada"',
  'lang === "indonesian" ? "Masuk"',
  'lang === "spanish" ? "Salida"',
  'lang === "indonesian" ? "Keluar"',
]) {
  assert.ok(storyTab.includes(snippet), `Story tab localization must keep: ${snippet}`);
}

assert.ok(!storyTab.includes('lang === "spanish" ? "Replay"'), "Spanish Story replay label must not fall back to English");

for (const snippet of [
  "id: {",
  'nativeLang === "indonesian" ? "id"',
  "Kerja bagus hari ini",
  "Rudy mendukungmu",
  'COMPLETION_MESSAGES[lc as "ko" | "en" | "es" | "id"]',
]) {
  assert.ok(lessonContent.includes(snippet), `Rudy feedback/completion localization must keep: ${snippet}`);
}

for (const snippet of [
  "nl === \"indonesian\" ? id",
  "Umpan balik pengucapan",
  "Lihat tips",
  "Skor fonem",
  "Tips pengucapan",
  "Dengarkan pelan",
]) {
  assert.ok(phonemeCoaching.includes(snippet), `Phoneme coaching localization must keep: ${snippet}`);
}

for (const snippet of [
  "Hampir benar",
  "Contoh nyata",
  "Kesalahan umum",
]) {
  assert.ok(step2KeyPoint.includes(snippet), `Step2 localization must keep: ${snippet}`);
}

for (const snippet of [
  "Mantra bos",
  "Atur ulang",
  'lang === "indonesian"',
]) {
  assert.ok(bossSpell.includes(snippet), `Boss spell localization must keep: ${snippet}`);
}

for (const snippet of [
  "function npcReplyFallback",
  "Koneksi NPC sedang bermasalah sebentar",
  "La conexión con el NPC",
  "지금 NPC 연결",
  "npcReplyFallback(native)",
]) {
  assert.ok(npcMission.includes(snippet), `NPC fallback localization must keep: ${snippet}`);
}

assert.ok(!npcMission.includes('text: "..."'), "NPC non-start fallback must not display silent ellipsis text");

console.log("language UI localization verification passed");
