export interface NPC {
  id: string;
  name: string;
  emoji: string;
  color: string;
  scenario: string;
  scenarioKo: string;
  scenarioEs: string;
  personality: string;
  scenarioDesc: string;
  voice: {
    english: { voice: string; lang: string };
    korean:  { voice: string; lang: string };
    spanish: { voice: string; lang: string };
  };
  ssmlStyle: { style: string; degree: string };
}

export const NPC_EMOTIONS: Record<string, string> = {
  happy:     "😊",
  neutral:   "😐",
  confused:  "🤔",
  annoyed:   "😠",
  impressed: "😲",
};

export const NPC_REL_LEVELS = {
  stranger: { min: 0,  max: 30,  label: "Stranger",  labelKo: "낯선사람", labelEs: "Extraño",  color: "#9CA3AF", heart: "🩶", inputHint: "Choose your response" },
  familiar: { min: 30, max: 60,  label: "Familiar",  labelKo: "아는사이",  labelEs: "Conocido",  color: "#60A5FA", heart: "💙", inputHint: "Choose or type freely" },
  friendly: { min: 60, max: 80,  label: "Friendly",  labelKo: "친근함",   labelEs: "Amigable",  color: "#34D399", heart: "💚", inputHint: "Free conversation" },
  close:    { min: 80, max: 101, label: "Close",     labelKo: "친한친구", labelEs: "Cercano",   color: "#F59E0B", heart: "💝", inputHint: "Special bond unlocked" },
} as const;

export type RelationshipTier = keyof typeof NPC_REL_LEVELS;

export function getRelTier(score: number): RelationshipTier {
  if (score >= 80) return "close";
  if (score >= 60) return "friendly";
  if (score >= 30) return "familiar";
  return "stranger";
}

export function getRelLabel(tier: RelationshipTier, lang: string): string {
  const level = NPC_REL_LEVELS[tier];
  if (lang === "korean") return level.labelKo;
  if (lang === "spanish") return level.labelEs;
  return level.label;
}

// ── Unlock system: which chapter completion unlocks each NPC ──────────────────
// null = unlocked from start, "ch1" = unlocked after Ch1 completion, etc.
export const NPC_UNLOCK_CHAPTER: Record<string, string | null> = {
  // Story NPCs — some locked behind story progress
  eleanor:   null,     // Free from start
  sujin:     null,     // Free from start
  penny:     null,     // Free from start (Tier 1 cafe)
  tom:       null,     // Free from start (Tier 1 taxi)
  hassan:    null,     // Free from start (Tier 1 airport)
  miguel:    "ch1",    // Ch1 completion
  minho:     "ch1",
  isabel:    "ch2",    // Ch2 completion
  carlos:    "ch2",
  youngsook: "ch3",    // Ch3 completion
  amira:     "ch3",
  // Real-world NPCs — all unlocked from the start
  ryan:      null,
  nari:      null,
  derek:     null,
  mei:       null,
  juno:      null,
  gloria:    null,
  stan:      null,
  hana:      null,
  vincent:   null,
  claire:    null,
  officer_kwon: null,
  luca:      null,
};

export const CHAPTER_ID_MAP: Record<string, string> = {
  ch1: "london", ch2: "madrid", ch3: "seoul", ch4: "cairo", ch5: "babel",
};

export const NPCS: NPC[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // STORY NPCs — Characters from story mode, placed in real-world scenarios
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Tier 1: Survival ────────────────────────────────────────────────────
  {
    id: "penny",
    name: "Penny",
    emoji: "☕",
    color: "#7B5EA7",
    scenario: "Cafe",
    scenarioKo: "카페",
    scenarioEs: "Cafetería",
    personality: "Warm and gentle barista. Speaks softly, remembers your usual order, makes you feel at home.",
    scenarioDesc: "You're at a cozy cafe. Order drinks, ask about the menu, chat with the barista.",
    voice: {
      english: { voice: "en-GB-LibbyNeural",   lang: "en-GB" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "friendly", degree: "1.2" },
  },
  {
    id: "miguel",
    name: "Don Miguel",
    emoji: "🍽️",
    color: "#B85C28",
    scenario: "Restaurant",
    scenarioKo: "레스토랑",
    scenarioEs: "Restaurante",
    personality: "Warm, wise restaurant owner. Full of proverbs and food recommendations.",
    scenarioDesc: "You're at a restaurant. Order food, ask about ingredients, handle the bill and tipping.",
    voice: {
      english: { voice: "en-US-ChristopherNeural", lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",      lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" },
    },
    ssmlStyle: { style: "friendly", degree: "1.2" },
  },
  {
    id: "tom",
    name: "Tom",
    emoji: "🚕",
    color: "#5A7A5A",
    scenario: "Taxi / Uber",
    scenarioKo: "택시",
    scenarioEs: "Taxi",
    personality: "Chatty and opinionated taxi driver. Talks nonstop but needs clear directions.",
    scenarioDesc: "You just got in a taxi. Give your destination, handle route changes, make small talk.",
    voice: {
      english: { voice: "en-US-TonyNeural",    lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",   lang: "es-MX" },
    },
    ssmlStyle: { style: "cheerful", degree: "1.3" },
  },
  {
    id: "hassan",
    name: "Hassan",
    emoji: "✈️",
    color: "#B8A020",
    scenario: "Airport",
    scenarioKo: "공항",
    scenarioEs: "Aeropuerto",
    personality: "Chatty, jovial, and helpful. Knows every airport trick. Makes stressful situations fun.",
    scenarioDesc: "You're at the airport. Check in, handle luggage, find gates, deal with delays.",
    voice: {
      english: { voice: "en-US-BrandonNeural", lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-ES-AlvaroNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "friendly", degree: "1.0" },
  },
  {
    id: "eleanor",
    name: "Lady Eleanor",
    emoji: "🏨",
    color: "#8B7355",
    scenario: "Hotel",
    scenarioKo: "호텔",
    scenarioEs: "Hotel",
    personality: "Elegant and precise hotel concierge. Expects proper manners. Impeccable service.",
    scenarioDesc: "You're checking into a hotel. Handle reservations, request amenities, report problems.",
    voice: {
      english: { voice: "en-GB-SoniaNeural",   lang: "en-GB" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "friendly", degree: "1" },
  },
  {
    id: "sujin",
    name: "Sujin",
    emoji: "🏥",
    color: "#3A6B9C",
    scenario: "Hospital / Clinic",
    scenarioKo: "병원",
    scenarioEs: "Hospital",
    personality: "Precise and caring doctor. Asks detailed questions. Explains clearly and patiently.",
    scenarioDesc: "You're at a clinic. Describe symptoms, understand diagnoses, ask about medication.",
    voice: {
      english: { voice: "en-US-MichelleNeural", lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",    lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",   lang: "es-ES" },
    },
    ssmlStyle: { style: "friendly", degree: "1.3" },
  },
  {
    id: "minho",
    name: "Minho",
    emoji: "📱",
    color: "#C46480",
    scenario: "Phone / SIM Setup",
    scenarioKo: "휴대폰 개통",
    scenarioEs: "Tienda de Móviles",
    personality: "Tech-savvy MZ generation. Speaks fast, uses tech jargon casually. Helpful but impatient.",
    scenarioDesc: "You need a SIM card or phone plan. Compare options, verify ID, set up your device.",
    voice: {
      english: { voice: "en-US-JasonNeural",   lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",   lang: "es-MX" },
    },
    ssmlStyle: { style: "cheerful", degree: "1.5" },
  },

  // ── Tier 2: Functioning ─────────────────────────────────────────────────
  {
    id: "youngsook",
    name: "Grandma Youngsook",
    emoji: "🛒",
    color: "#3A8A7A",
    scenario: "Grocery / Market",
    scenarioKo: "마트 / 시장",
    scenarioEs: "Supermercado",
    personality: "Warm, nurturing grandmother. Knows every ingredient. Gives unsolicited life advice.",
    scenarioDesc: "You're grocery shopping. Find items, read labels, ask for recommendations, handle checkout.",
    voice: {
      english: { voice: "en-US-SaraNeural",    lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "friendly", degree: "1.0" },
  },
  {
    id: "isabel",
    name: "Isabel",
    emoji: "🛍️",
    color: "#C17A3A",
    scenario: "Shopping",
    scenarioKo: "쇼핑",
    scenarioEs: "Tienda de Ropa",
    personality: "Bold and fashionable shop assistant. Honest opinions, passionate recommendations.",
    scenarioDesc: "You're at a clothing store. Ask about sizes, try things on, negotiate prices.",
    voice: {
      english: { voice: "en-US-JennyNeural",   lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "cheerful", degree: "1.3" },
  },
  {
    id: "carlos",
    name: "Carlos",
    emoji: "🍺",
    color: "#8B5E3C",
    scenario: "Bar / Social",
    scenarioKo: "바 / 술집",
    scenarioEs: "Bar",
    personality: "Quiet but warm. Opens up over drinks. Teaches you the art of casual conversation.",
    scenarioDesc: "You're at a bar with a friend. Order drinks, make small talk, share stories.",
    voice: {
      english: { voice: "en-US-GuyNeural",     lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",   lang: "es-MX" },
    },
    ssmlStyle: { style: "friendly", degree: "1.2" },
  },
  {
    id: "amira",
    name: "Dr. Amira",
    emoji: "🏦",
    color: "#5A8B5A",
    scenario: "Bank",
    scenarioKo: "은행",
    scenarioEs: "Banco",
    personality: "Strict, precise bank officer. Follows procedures exactly. No room for ambiguity.",
    scenarioDesc: "You're at a bank. Open an account, exchange currency, resolve card issues.",
    voice: {
      english: { voice: "en-US-AriaNeural",    lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "friendly", degree: "1.2" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REAL-WORLD NPCs — New characters for practical situations
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Tier 1: Survival ────────────────────────────────────────────────────
  {
    id: "ryan",
    name: "Ryan",
    emoji: "🍔",
    color: "#D4543A",
    scenario: "Fast Food / Kiosk",
    scenarioKo: "패스트푸드",
    scenarioEs: "Comida Rápida",
    personality: "Fast-moving, no-nonsense cashier. Speaks quickly. Won't repeat twice.",
    scenarioDesc: "You're at a fast food counter. Order combos, customize items, handle rapid-fire questions.",
    voice: {
      english: { voice: "en-US-GuyNeural",     lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",   lang: "es-MX" },
    },
    ssmlStyle: { style: "customerservice", degree: "1" },
  },
  {
    id: "nari",
    name: "Nari",
    emoji: "🚇",
    color: "#6B7DB3",
    scenario: "Subway / Bus",
    scenarioKo: "지하철 / 버스",
    scenarioEs: "Metro / Autobús",
    personality: "Busy commuter, slightly impatient but kind enough to help if you ask politely.",
    scenarioDesc: "You're on public transit. Ask for directions, buy tickets, find the right platform.",
    voice: {
      english: { voice: "en-US-JennyNeural",   lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "friendly", degree: "1" },
  },
  {
    id: "derek",
    name: "Derek",
    emoji: "🔧",
    color: "#7A6B5A",
    scenario: "Accommodation Problems",
    scenarioKo: "숙소 문제 신고",
    scenarioEs: "Problemas de Alojamiento",
    personality: "Lazy building manager. Sighs a lot. Will help eventually if you're persistent enough.",
    scenarioDesc: "Something's broken in your room. Report issues, request repairs, negotiate solutions.",
    voice: {
      english: { voice: "en-US-DavisNeural",   lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",   lang: "es-MX" },
    },
    ssmlStyle: { style: "unfriendly", degree: "1" },
  },
  {
    id: "mei",
    name: "Mei",
    emoji: "💊",
    color: "#4A9A8A",
    scenario: "Pharmacy",
    scenarioKo: "약국",
    scenarioEs: "Farmacia",
    personality: "Gentle, thorough pharmacist. Asks detailed questions about symptoms and allergies.",
    scenarioDesc: "You need medicine. Describe symptoms, ask about dosage, explain allergies.",
    voice: {
      english: { voice: "en-US-MichelleNeural", lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",    lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",   lang: "es-ES" },
    },
    ssmlStyle: { style: "friendly", degree: "1.2" },
  },

  // ── Tier 2: Functioning ─────────────────────────────────────────────────
  {
    id: "juno",
    name: "Juno",
    emoji: "🛵",
    color: "#E87040",
    scenario: "Delivery / Phone Order",
    scenarioKo: "배달 / 전화주문",
    scenarioEs: "Delivery / Pedido",
    personality: "Rushed delivery driver. Speaks fast, needs clear address and instructions NOW.",
    scenarioDesc: "Your delivery is here or you're ordering by phone. Give address, handle mixups, tip.",
    voice: {
      english: { voice: "en-US-TonyNeural",    lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",   lang: "es-MX" },
    },
    ssmlStyle: { style: "excited", degree: "1.3" },
  },
  {
    id: "gloria",
    name: "Gloria",
    emoji: "🔄",
    color: "#9B6B8A",
    scenario: "Returns / Exchange",
    scenarioKo: "반품 / 교환",
    scenarioEs: "Devoluciones",
    personality: "By-the-book retail employee. Polite but firm about policy. Needs receipts.",
    scenarioDesc: "You need to return or exchange something. Explain the problem, handle store policy.",
    voice: {
      english: { voice: "en-US-SaraNeural",    lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "customerservice", degree: "1.5" },
  },
  {
    id: "stan",
    name: "Stan",
    emoji: "📦",
    color: "#6B8B6B",
    scenario: "Post Office",
    scenarioKo: "우체국",
    scenarioEs: "Correos",
    personality: "Slow, methodical postal worker. Asks about weight, dimensions, insurance. Takes his time.",
    scenarioDesc: "You're sending a package or picking one up. Fill forms, choose shipping, handle customs.",
    voice: {
      english: { voice: "en-US-BrandonNeural", lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-ES-AlvaroNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "narration-professional", degree: "1" },
  },
  {
    id: "hana",
    name: "Hana",
    emoji: "💬",
    color: "#D4A06A",
    scenario: "Small Talk / Social",
    scenarioKo: "스몰토크",
    scenarioEs: "Charla Social",
    personality: "Outgoing and curious. Asks lots of questions. Loves getting to know new people.",
    scenarioDesc: "You're at a party or meetup. Introduce yourself, answer personal questions, make plans.",
    voice: {
      english: { voice: "en-US-AriaNeural",    lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "cheerful", degree: "1.5" },
  },
  {
    id: "vincent",
    name: "Vincent",
    emoji: "🏠",
    color: "#5A6B8A",
    scenario: "Apartment Hunting",
    scenarioKo: "집 구하기",
    scenarioEs: "Buscar Piso",
    personality: "Smooth-talking real estate agent. Oversells everything. You need to ask the right questions.",
    scenarioDesc: "You're looking for an apartment. Ask about rent, deposits, contracts, neighborhood.",
    voice: {
      english: { voice: "en-US-ChristopherNeural", lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",      lang: "ko-KR" },
      spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" },
    },
    ssmlStyle: { style: "friendly", degree: "1.3" },
  },

  // ── Tier 3: Thriving ────────────────────────────────────────────────────
  {
    id: "claire",
    name: "Claire",
    emoji: "💼",
    color: "#3D5A7A",
    scenario: "Job Interview",
    scenarioKo: "면접",
    scenarioEs: "Entrevista de Trabajo",
    personality: "Sharp, no-nonsense interviewer. Tests your confidence and communication under pressure.",
    scenarioDesc: "You're in a job interview. Introduce yourself, answer tough questions, ask about the role.",
    voice: {
      english: { voice: "en-US-AriaNeural",    lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "narration-professional", degree: "1.2" },
  },
  {
    id: "officer_kwon",
    name: "Officer Kwon",
    emoji: "🏛️",
    color: "#3D3D5C",
    scenario: "Government Office / Visa",
    scenarioKo: "관공서 / 비자",
    scenarioEs: "Oficina de Gobierno",
    personality: "Stoic, by-the-book civil servant. Zero small talk. Needs exact documents.",
    scenarioDesc: "You're at immigration or city hall. Submit documents, answer official questions, fix paperwork.",
    voice: {
      english: { voice: "en-US-DavisNeural",   lang: "en-US" },
      korean:  { voice: "ko-KR-HyunsuNeural",  lang: "ko-KR" },
      spanish: { voice: "es-ES-AlvaroNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "serious", degree: "1.5" },
  },
  {
    id: "luca",
    name: "Luca",
    emoji: "💇",
    color: "#B07A9A",
    scenario: "Hair Salon",
    scenarioKo: "미용실",
    scenarioEs: "Peluquería",
    personality: "Chatty, enthusiastic hairstylist. Never stops talking. Loves giving unsolicited advice.",
    scenarioDesc: "You're getting a haircut. Describe what you want, handle suggestions, make small talk.",
    voice: {
      english: { voice: "en-US-GuyNeural",     lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",   lang: "es-MX" },
    },
    ssmlStyle: { style: "cheerful", degree: "1.5" },
  },
];

export const NPC_MAP: Record<string, NPC> = Object.fromEntries(NPCS.map(n => [n.id, n]));

export function getNPC(id: string): NPC | undefined {
  return NPC_MAP[id];
}
