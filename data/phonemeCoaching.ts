// ── Phoneme Coaching Database ─────────────────────────────────────────────
// Keyed by target language → phoneme → native language → coaching tip.
// Tips are shown in the learner's native language.

type LangTips = Record<string, string>; // nativeLang code → tip
type PhonemeMap = Record<string, LangTips>; // phoneme → LangTips

// ── English phonemes (for learners of English) ───────────────────────────

const ENGLISH_PHONEMES: PhonemeMap = {
  // ── Consonants ─────────────────────────────────
  r: {
    ko: "혀를 말아서 입천장에 안 닿게 하세요. 한국어 'ㄹ'과 달라요!",
    es: "No toque el paladar con la lengua. Diferente a la 'r' española.",
  },
  l: {
    ko: "혀끝을 윗니 뒤에 살짝 대세요. 'ㄹ'보다 혀가 더 앞에 위치해요.",
    es: "Toque detrás de los dientes superiores con la punta de la lengua.",
  },
  θ: { // "th" in "think"
    ko: "혀를 윗니와 아랫니 사이에 살짝 내밀어서 바람을 불어요.",
    es: "Coloque la lengua entre los dientes y sople aire suavemente.",
  },
  ð: { // "th" in "this"
    ko: "혀를 이 사이에 넣고 성대를 울리면서 바람을 내세요. 'think'의 th보다 울림이 있어요.",
    es: "Como la 'z' en España (za, ce, ci, zo, zu), pero con vibración.",
  },
  v: {
    ko: "윗니로 아랫입술을 살짝 물고 소리 내세요. 'ㅂ'이 아니에요!",
    es: "Muerda el labio inferior con los dientes superiores y vibre.",
  },
  f: {
    ko: "윗니로 아랫입술을 살짝 물고 바람만 내세요. 'ㅍ'과 달라요!",
    es: "Similar a la 'f' española, labio inferior contra dientes superiores.",
  },
  z: {
    ko: "'ㅈ'처럼 하되 혀를 더 앞으로! 'ㅅ'에 울림을 더한 소리예요.",
    es: "Como una 's' pero con vibración de las cuerdas vocales.",
  },
  w: {
    ko: "입술을 둥글게 모았다가 빠르게 벌리세요. 'ㅂ'이 아니라 입술 모양이에요!",
    es: "Redondee los labios como para decir 'u' y abra rápido.",
  },
  ʃ: { // "sh" in "she"
    ko: "'쉬' 소리인데 입술을 둥글게 모아서 내세요. 'ㅅ'보다 부드러워요.",
    es: "Como 'sh' en inglés. Redondee los labios y sople.",
  },
  ʒ: { // "s" in "measure"
    ko: "'쉬' 소리에 울림을 더한 거예요. 입술 둥글게 + 성대 울림!",
    es: "Como 'sh' pero con vibración. Piense en 'y' argentina.",
  },
  dʒ: { // "j" in "job"
    ko: "'ㅈ'과 비슷하지만 혀가 더 뒤로 말려요. 입술도 살짝 둥글게!",
    es: "Como la 'y' en 'yo' (rioplatense) o 'j' en inglés.",
  },
  tʃ: { // "ch" in "church"
    ko: "'ㅊ'과 비슷해요! 혀끝을 입천장에 대고 터뜨리세요.",
    es: "Como 'ch' en español 'chico'. Muy similar.",
  },
  ŋ: { // "ng" in "sing"
    ko: "'ㅇ' 받침과 같아요! 코로 소리를 내세요.",
    es: "Como la 'n' antes de 'g' en 'tango'. Nasal, desde la garganta.",
  },
  h: {
    ko: "'ㅎ'과 비슷해요. 가볍게 숨을 내쉬면서 소리 내세요.",
    es: "Como la 'j' suave española. Solo un soplo de aire.",
  },
  p: {
    ko: "영어 p는 바람이 세게 나와요! 'ㅍ'에 가깝지만 입술을 더 세게 터뜨려요.",
    es: "Con más aspiración que la 'p' española. Suelte aire al abrir los labios.",
  },
  b: {
    ko: "'ㅂ'보다 입술을 더 강하게 다물었다 터뜨리세요. 성대가 울려요.",
    es: "Siempre explosiva, no suave como la 'b' española entre vocales.",
  },
  t: {
    ko: "혀끝을 윗니 뒤 잇몸에 대세요. 한국어 'ㅌ'보다 바람이 더 나와요.",
    es: "Toque los alvéolos (no los dientes). Más aspiración que la 't' española.",
  },
  d: {
    ko: "혀끝을 윗니 뒤 잇몸에 대고 성대를 울리세요. 받침 'd'도 꼭 발음해요!",
    es: "Siempre con la lengua en los alvéolos, no entre los dientes.",
  },

  // ── Vowels ─────────────────────────────────────
  æ: { // "a" in "cat"
    ko: "입을 크게 벌리고 'ㅐ'보다 더 넓게! 턱을 아래로 내리세요.",
    es: "Abra más la boca que para la 'a' normal. Mandíbula bien abierta.",
  },
  ɑ: { // "o" in "hot" (American)
    ko: "입을 크게 벌리고 'ㅏ'보다 목 안쪽에서 소리 내세요.",
    es: "Boca muy abierta, como si dijera 'a' desde la garganta.",
  },
  ɪ: { // "i" in "bit"
    ko: "'ㅣ'보다 입을 더 벌리고 짧게! '이'와 '에' 사이 소리예요.",
    es: "Más corta y abierta que la 'i' española. Entre 'i' y 'e'.",
  },
  iː: { // "ee" in "see"
    ko: "'ㅣ'와 비슷하지만 더 길게, 입을 더 옆으로 벌리세요.",
    es: "Como la 'i' española pero más larga y tensa.",
  },
  ʊ: { // "oo" in "book"
    ko: "'ㅜ'보다 짧고 입을 덜 둥글게! 힘을 빼고 가볍게.",
    es: "Más corta que la 'u' española. Labios menos redondeados.",
  },
  uː: { // "oo" in "food"
    ko: "'ㅜ'와 비슷하지만 더 길게, 입술을 더 둥글게 모아요.",
    es: "Como la 'u' española pero más larga. Redondee bien los labios.",
  },
  ɛ: { // "e" in "bed"
    ko: "'ㅔ'와 비슷해요. 입을 적당히 벌리세요.",
    es: "Como la 'e' española. Bastante similar.",
  },
  ə: { // schwa - "a" in "about"
    ko: "가장 중요한 영어 모음! 힘 빼고 '어'를 아주 짧고 약하게.",
    es: "Vocal muy relajada y corta. Como una 'a' débil y sin esfuerzo.",
  },
  ɜː: { // "ir" in "bird"
    ko: "'ㅓ'를 길게 하면서 혀를 살짝 말아요. 한국어에 없는 소리!",
    es: "Vocal larga y tensa. Tire la lengua ligeramente hacia atrás.",
  },
  ʌ: { // "u" in "cup"
    ko: "'ㅓ'와 비슷하지만 더 짧고 입을 더 벌리세요.",
    es: "Como una 'a' corta y relajada. Boca medio abierta.",
  },
  oʊ: { // "o" in "go"
    ko: "'ㅗ'에서 시작해서 'ㅜ'로 미끄러지세요. 입술이 점점 둥글어져요.",
    es: "Empiece con 'o' y deslice hacia 'u'. No es una 'o' pura.",
  },
  eɪ: { // "a" in "take"
    ko: "'ㅔ'에서 시작해서 'ㅣ'로 미끄러지세요. 이중모음이에요!",
    es: "Empiece con 'e' y deslice hacia 'i'. Es un diptongo.",
  },
  aɪ: { // "i" in "time"
    ko: "'ㅏ'에서 'ㅣ'로 미끄러지세요. '아이'를 빠르게 한 음절로!",
    es: "Como 'ai' en 'baile'. Empiece abierto y cierre.",
  },
  aʊ: { // "ou" in "house"
    ko: "'ㅏ'에서 'ㅜ'로 미끄러지세요. '아우'를 빠르게 한 음절로!",
    es: "Como 'au' en 'causa'. Empiece abierto, cierre redondeando labios.",
  },
  ɔɪ: { // "oy" in "boy"
    ko: "'ㅗ'에서 'ㅣ'로 미끄러지세요. '오이'를 한 음절로!",
    es: "Como 'oi' en 'hoy'. Empiece con labios redondos, termine con 'i'.",
  },
};

// ── Spanish phonemes (for learners of Spanish) ──────────────────────────

const SPANISH_PHONEMES: PhonemeMap = {
  rr: {
    ko: "혀끝을 윗니 뒤에 대고 떨어줘요. 'ㄹㄹ' 빠르게 반복하는 느낌!",
    en: "Place tongue tip behind upper teeth and let it vibrate rapidly. Try saying 'butter' fast.",
  },
  r: {
    ko: "혀끝으로 윗니 뒤를 한 번만 탁! 치세요. 한국어 'ㄹ'과 비슷해요.",
    en: "Quick single tap of tongue behind upper teeth. Like the 't' in American 'butter'.",
  },
  x: { // "j" in "joven"
    ko: "목 안쪽에서 'ㅎ'보다 더 거칠게 내세요. 가래 뱉는 느낌!",
    en: "Like a strong 'h' from back of throat. Similar to German 'ch' in 'Bach'.",
  },
  ɲ: { // ñ
    ko: "'ㄴ'이랑 'ㅣ'를 합친 소리. '냐'의 'ㄴ' 느낌이에요.",
    en: "Like 'ny' in 'canyon'. Flatten tongue against roof of mouth.",
  },
  ʎ: { // ll
    ko: "지역마다 달라요! 중남미는 '자/야', 스페인은 '야'에 가까워요.",
    en: "Varies by region: 'ya' in Spain, 'ja/sha' in Argentina. Most common: 'ya'.",
  },
  β: { // b/v between vowels
    ko: "스페인어에서 b와 v는 같은 소리! 모음 사이에서는 입술을 살짝만 닫아요.",
    en: "B and V are the same sound in Spanish! Between vowels, barely close your lips.",
  },
  ð_es: { // d between vowels
    ko: "모음 사이의 d는 영어 'th'처럼 부드럽게! 'nada' → '나다'가 아니라 '나ð아'",
    en: "Between vowels, soften 'd' to a 'th' sound. 'nada' sounds like 'na-tha'.",
  },
  ɣ: { // g between vowels
    ko: "모음 사이의 g는 약하게! 목에서 바람만 살짝 내세요.",
    en: "Between vowels, soften 'g'. Almost like gargling very gently.",
  },
  θ_es: { // c/z in Spain
    ko: "스페인: 혀를 이 사이에 넣고 바람 (θ). 중남미: 그냥 'ㅅ'!",
    en: "Spain: tongue between teeth (like English 'th'). Latin America: just 's'.",
  },
  silent_h: {
    ko: "스페인어 h는 항상 묵음! 'hola' = '올라'이지 '홀라'가 아니에요.",
    en: "H is always silent! 'hola' = 'ola'. Never pronounce it.",
  },
  silent_u: { // gue/gui
    ko: "gue/gui에서 u는 소리 안 나요! guerra = '게라', guitarra = '기타라'",
    en: "U is silent in gue/gui. 'guerra' = 'geh-rra', 'guitarra' = 'gee-tah-rra'.",
  },
  vowels_es: {
    ko: "스페인어 모음은 항상 짧고 깨끗! 영어처럼 늘리지 마세요. 한국어 모음과 비슷해요.",
    en: "Spanish vowels are pure and short. Never glide like English vowels (no 'ay', just 'e').",
  },
  // diphthongs / stress
  stress_es: {
    ko: "강세 위치가 중요해요! 강세 있는 음절을 더 세고 길게 발음하세요.",
    en: "Stress placement matters! Emphasize the stressed syllable clearly.",
  },
  j_es: { // "y" / "ll" sound
    ko: "'ㅈ'이 아니라 '이'를 빠르게 내는 느낌. 영어 'yes'의 y와 비슷해요.",
    en: "Like 'y' in 'yes'. Don't make it too strong like English 'j'.",
  },
};

// ── Korean phonemes (for learners of Korean) ─────────────────────────────

const KOREAN_PHONEMES: PhonemeMap = {
  // ── 3-way stops ─────────────────────────────
  ㄱ: {
    en: "Soft 'g/k'. Less air than English 'k', but not tense. Between 'g' and 'k'.",
    es: "Como una 'g' suave. Menos aire que la 'k' inglesa.",
  },
  ㅋ: {
    en: "Aspirated 'k' with a strong puff of air. Like English 'k' in 'key'.",
    es: "Como 'k' con mucho aire. Ponga la mano delante y sienta el aire.",
  },
  ㄲ: {
    en: "Tense 'kk'. Tighten your throat, NO air puff. Like 'sk' in 'sky' without the 's'.",
    es: "Tensa la garganta, sin aire. Como 'k' después de 's' en 'sky'.",
  },
  ㄷ: {
    en: "Soft 'd/t'. Less air than English 't'. Between 'd' and 't'.",
    es: "Como una 'd' suave. Menos explosiva que la 't' inglesa.",
  },
  ㅌ: {
    en: "Aspirated 't' with strong air. Like English 't' in 'top'.",
    es: "Como 't' con mucho aire. Sienta la explosión de aire.",
  },
  ㄸ: {
    en: "Tense 'tt'. Tighten your throat, NO air. Like 'st' in 'stop' without the 's'.",
    es: "Tensa la garganta. Como 't' después de 's' en 'stop'.",
  },
  ㅂ: {
    en: "Soft 'b/p'. Less air than English 'p'. Between 'b' and 'p'.",
    es: "Como una 'b' suave. Menos aire que la 'p' inglesa.",
  },
  ㅍ: {
    en: "Aspirated 'p' with strong air. Like English 'p' in 'pen'.",
    es: "Como 'p' con mucho aire. Suelte una bocanada de aire.",
  },
  ㅃ: {
    en: "Tense 'pp'. Tighten your throat, NO air. Like 'sp' in 'spy' without the 's'.",
    es: "Tensa la garganta. Como 'p' después de 's' en 'spy'.",
  },
  // ── 3-way affricates ─────────────────────────
  ㅈ: {
    en: "Soft 'j'. Like 'j' in 'judge' but softer and less air.",
    es: "Como 'ch' suave. Menos aire que la 'ch' española.",
  },
  ㅊ: {
    en: "Aspirated 'ch' with air. Like English 'ch' in 'church'.",
    es: "Como 'ch' con mucho aire. Igual que 'ch' en 'chico' pero con más fuerza.",
  },
  ㅉ: {
    en: "Tense 'jj'. Tighten your throat, NO air. Very tense 'j' sound.",
    es: "Tensa la garganta. 'Ch' muy tensa sin aire.",
  },
  // ── Vowels ─────────────────────────────────
  ㅓ: {
    en: "Open your mouth like 'uh' but rounder. NOT like English 'o'. Think 'aw' but shorter.",
    es: "Abra la boca como para 'o' pero más abierta. Entre 'o' y 'a'.",
  },
  ㅗ: {
    en: "Pure 'o' sound. Round your lips. Don't glide like English 'oh'.",
    es: "Como la 'o' española. Redondee los labios. Muy similar.",
  },
  ㅡ: {
    en: "No English equivalent! Spread lips wide like 'ee' but tongue is LOW and back. Say 'uh' with spread lips.",
    es: "No existe en español. Labios extendidos como 'i' pero lengua baja y atrás.",
  },
  ㅢ: {
    en: "Start with ㅡ and glide to 'ee'. Two sounds combined: 'eu' + 'i'.",
    es: "Empiece con ㅡ y deslice hacia 'i'. Dos sonidos juntos.",
  },
  ㅐ: {
    en: "Like 'e' in 'bed'. Modern Korean: same as ㅔ for most speakers.",
    es: "Como la 'e' española. Muy similar.",
  },
  ㅔ: {
    en: "Like 'e' in 'bed'. Almost identical to ㅐ in modern Korean.",
    es: "Como la 'e' española.",
  },
  // ── Special consonants ─────────────────────
  ㄹ: {
    en: "Between English 'r' and 'l'! At start/between vowels: tap like 't' in 'butter'. At end: like 'l'.",
    es: "Como la 'r' simple española (pero/caro). Al final de sílaba: como 'l'.",
  },
  // ── Final consonants (받침) ────────────────
  받침: {
    en: "Final consonants are UNRELEASED. Don't add a vowel sound after! 'bap' not 'ba-puh'.",
    es: "Las consonantes finales NO se sueltan. No añada vocal después.",
  },
  // ── Double vowels ──────────────────────────
  ㅘ: {
    en: "Combine 'w' + 'a'. Start with rounded lips, open quickly.",
    es: "Como 'ua' en 'cuando'. Empiece con labios redondos.",
  },
  ㅝ: {
    en: "Combine 'w' + 'uh'. Round lips for 'w', then open to ㅓ.",
    es: "Como 'uo' pero el segundo sonido es ㅓ (entre 'o' y 'a').",
  },
  // ── IPA symbols Azure returns for Korean ───
  ɾ: { // flap ㄹ between vowels
    en: "Quick tongue tap behind upper teeth. Like 't' in American 'butter'. Very fast and light.",
    es: "Toque rápido de lengua. Igual que la 'r' simple española en 'pero'.",
  },
  ŋ: { // final ㅇ nasal
    en: "Nasal 'ng' like in English 'sing'. Don't release with a 'g' sound at the end.",
    es: "Nasal como 'ng' en inglés 'sing'. No suelte con sonido 'g' al final.",
  },
  tɕ: { // ㅈ as IPA
    en: "Like 'j' in 'judge' but lighter. Tongue touches the roof of mouth briefly.",
    es: "Como 'ch' suave. La lengua toca el paladar brevemente.",
  },
  tɕʰ: { // ㅊ as IPA
    en: "Like 'ch' in 'church' with a strong puff of air. Aspirated.",
    es: "Como 'ch' en 'chico' pero con mucho aire. Aspirada.",
  },
  dʑ: { // voiced ㅈ
    en: "Voiced version of 'j'. Like English 'j' in 'judge'. Vocal cords vibrate.",
    es: "Versión sonora de 'j'. Como la 'y' en 'yo' (Argentina).",
  },
  ɕ: { // ㅅ before i/y
    en: "Like 'sh' but with tongue closer to teeth. Korean ㅅ before 'i' sounds.",
    es: "Como 'sh' pero con la lengua más cerca de los dientes.",
  },
  s͈: { // tense ㅆ
    en: "Tense 'ss'. Tighten your throat and hold the 's' longer. No air puff.",
    es: "Tensa la garganta y alarga la 's'. Sin aire extra.",
  },
  p͈: { // tense ㅃ
    en: "Tense 'pp'. Tighten throat, NO air puff. Like 'sp' in 'spy' without the 's'.",
    es: "Tensa la garganta. Como 'p' después de 's' en 'spy'.",
  },
  t͈: { // tense ㄸ
    en: "Tense 'tt'. Tighten throat, NO air puff. Like 'st' in 'stop' without the 's'.",
    es: "Tensa la garganta. Como 't' después de 's' en 'stop'.",
  },
  k͈: { // tense ㄲ
    en: "Tense 'kk'. Tighten throat, NO air puff. Like 'sk' in 'sky' without the 's'.",
    es: "Tensa la garganta. Como 'k' después de 's' en 'sky'.",
  },
  kʰ: { // ㅋ as IPA
    en: "Aspirated 'k'. Strong puff of air. Like English 'k' in 'key'.",
    es: "Como 'k' con mucho aire. Ponga la mano delante y sienta el aire.",
  },
  tʰ: { // ㅌ as IPA
    en: "Aspirated 't'. Strong puff of air. Like English 't' in 'top'.",
    es: "Como 't' con mucho aire. Sienta la explosión.",
  },
  pʰ: { // ㅍ as IPA
    en: "Aspirated 'p'. Strong puff of air. Like English 'p' in 'pen'.",
    es: "Como 'p' con mucho aire. Suelte una bocanada de aire.",
  },
  j: { // glide in ㅑ, ㅕ, ㅠ etc.
    en: "Glide sound like 'y' in 'yes'. Tongue is high and front. Quick transition.",
    es: "Sonido deslizante como 'y' en 'yo'. Lengua alta y adelante. Transición rápida.",
  },
  w: { // glide in ㅘ, ㅚ etc.
    en: "Glide sound like 'w' in 'water'. Round your lips quickly before the vowel.",
    es: "Sonido deslizante como 'w' en 'water'. Redondee los labios rápido.",
  },
};

// ── Master lookup ────────────────────────────────────────────────────────

const DB: Record<string, PhonemeMap> = {
  english: ENGLISH_PHONEMES,
  spanish: SPANISH_PHONEMES,
  korean: KOREAN_PHONEMES,
};

/**
 * Get a coaching tip for a specific phoneme.
 * @param targetLang - The language being learned (english/spanish/korean)
 * @param phoneme - The IPA phoneme string from Azure
 * @param nativeLang - The learner's native language (korean/spanish/english)
 * @returns Coaching tip string, or null if no tip found
 */
export function getCoachingTip(
  targetLang: string,
  phoneme: string,
  nativeLang: string,
): string | null {
  const tl = targetLang.toLowerCase();
  const nl = nativeLang.toLowerCase();
  const nlCode = nl === "korean" ? "ko" : nl === "spanish" ? "es" : "en";
  const map = DB[tl];
  if (!map) return null;

  // Direct match
  const entry = map[phoneme];
  if (entry?.[nlCode]) return entry[nlCode];

  // Try lowercase
  const entryLower = map[phoneme.toLowerCase()];
  if (entryLower?.[nlCode]) return entryLower[nlCode];

  // Fuzzy: try stripping length marks, etc.
  const stripped = phoneme.replace(/ː/g, "");
  if (stripped !== phoneme) {
    const e2 = map[stripped];
    if (e2?.[nlCode]) return e2[nlCode];
  }

  return null;
}

/**
 * Get the error type label in the user's native language.
 */
export function getErrorLabel(
  errorType: string,
  nativeLang: string,
): string {
  const nl = nativeLang.toLowerCase();
  switch (errorType.toLowerCase()) {
    case "mispronunciation":
      return nl === "korean" ? "발음 오류" : nl === "spanish" ? "Error de pronunciación" : "Mispronunciation";
    case "omission":
      return nl === "korean" ? "생략됨" : nl === "spanish" ? "Omitido" : "Omitted";
    case "insertion":
      return nl === "korean" ? "추가 발음" : nl === "spanish" ? "Inserción" : "Inserted extra sound";
    default:
      return "";
  }
}
