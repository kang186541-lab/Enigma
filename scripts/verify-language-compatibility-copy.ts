import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

const support = read("app/support.tsx");
const privacy = read("app/legal/privacy.tsx");
const terms = read("app/legal/terms.tsx");
const speakMissionHandoff = read("lib/speakMissionHandoff.ts");
const learningEvents = read("lib/learningEvents.ts");
const dailySentenceTest = read("__tests__/dailySentence.test.ts");
const languageCompatibilityTest = read("__tests__/languageCompatibility.test.ts");

const combinedSupportLegal = `${support}\n${privacy}\n${terms}`;

const staleNarrowLanguageClaims = [
  "Can I learn languages other than English/Spanish",
  "English and Spanish are the only",
  "hanya bahasa Inggris dan Spanyol",
  "inglés y español como idiomas",
  "영어와 스페인어만",
];

for (const phrase of staleNarrowLanguageClaims) {
  assert.equal(
    combinedSupportLegal.includes(phrase),
    false,
    `Support/legal copy still contains stale narrow language claim: ${phrase}`,
  );
}

for (const phrase of [
  "Korean, English, Spanish, and Indonesian",
  "한국어, 영어, 스페인어, 인도네시아어",
  "coreano, inglés, español e indonesio",
  "Korea, Inggris, Spanyol, dan Indonesia",
]) {
  assert.ok(support.includes(phrase), `Support page must advertise current four-language support: ${phrase}`);
}

for (const phrase of [
  "GPT-4o-mini",
  "zero-data-retention",
  "OpenAI lo descarta",
  "OpenAI menghapus",
  "OpenAI, L.L.C.",
]) {
  assert.equal(
    combinedSupportLegal.includes(phrase),
    false,
    `Support/legal copy still contains stale provider-specific claim: ${phrase}`,
  );
}

for (const provider of ["DeepSeek", "OpenAI", "Anthropic", "Google Gemini"]) {
  assert.ok(privacy.includes(provider), `Privacy policy should name current AI provider family: ${provider}`);
  assert.ok(terms.includes(provider), `Terms should name current AI provider family: ${provider}`);
}

assert.ok(
  speakMissionHandoff.includes('"indonesian"') &&
    speakMissionHandoff.includes("speechLang: cleanText(input.speechLang") &&
    speakMissionHandoff.includes("targetLanguage: normalizeTargetLanguage(input.targetLanguage)"),
  "Speak mission handoff must preserve Indonesian target language and caller-provided speech locale",
);

for (const field of ["nativeLanguage", "targetLanguage"]) {
  const fieldIndex = learningEvents.indexOf(`${field}: [`);
  assert.notEqual(fieldIndex, -1, `Learning events schema must define ${field}`);
  const fieldSlice = learningEvents.slice(fieldIndex, fieldIndex + 220);
  assert.ok(fieldSlice.includes('"indonesian"'), `Learning events ${field} must allow Indonesian`);
}

assert.ok(
  dailySentenceTest.includes('"indonesian"') && dailySentenceTest.includes("all 4 languages"),
  "Daily sentence tests should cover all four supported languages",
);

assert.ok(
  languageCompatibilityTest.includes("saveSpeakMissionHandoff") &&
    languageCompatibilityTest.includes("first_speaking_cta_pressed") &&
    languageCompatibilityTest.includes("indonesian"),
  "Language compatibility tests should lock Indonesian handoff and funnel props",
);

console.log("language compatibility copy verification passed");
