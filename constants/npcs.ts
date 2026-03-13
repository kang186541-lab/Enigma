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

export const NPCS: NPC[] = [
  {
    id: "emma",
    name: "Emma",
    emoji: "☕",
    color: "#C17A3A",
    scenario: "Cafe Barista",
    scenarioKo: "카페 바리스타",
    scenarioEs: "Barista de Cafetería",
    personality: "Energetic and sassy — she moves fast, knows exactly what she wants, and won't let a slow customer hold up the line.",
    scenarioDesc: "You're at a cozy café. Emma takes orders, makes recommendations, and chats with regulars.",
    voice: {
      english: { voice: "en-US-JennyNeural",   lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "cheerful", degree: "2" },
  },
  {
    id: "james",
    name: "James",
    emoji: "✈️",
    color: "#3A6B9C",
    scenario: "Airport Staff",
    scenarioKo: "공항 직원",
    scenarioEs: "Personal de Aeropuerto",
    personality: "Strict and impatient — he follows rules to the letter and has zero patience for confusion or delay.",
    scenarioDesc: "You're at the airport check-in desk. James handles boarding passes, baggage, and gate information.",
    voice: {
      english: { voice: "en-GB-RyanNeural",    lang: "en-GB" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",   lang: "es-MX" },
    },
    ssmlStyle: { style: "customerservice", degree: "1" },
  },
  {
    id: "officer_park",
    name: "Officer Park",
    emoji: "🚔",
    color: "#3D3D5C",
    scenario: "Police Detective",
    scenarioKo: "경찰 형사",
    scenarioEs: "Detective de Policía",
    personality: "Serious and intimidating — every word is deliberate, every pause is a test.",
    scenarioDesc: "You've been called in for questioning. Officer Park asks about a recent incident.",
    voice: {
      english: { voice: "en-US-DavisNeural",   lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",   lang: "es-MX" },
    },
    ssmlStyle: { style: "unfriendly", degree: "1.5" },
  },
  {
    id: "bar_alex",
    name: "Alex",
    emoji: "🍺",
    color: "#8B5E3C",
    scenario: "Friend at Bar",
    scenarioKo: "바 친구",
    scenarioEs: "Amigo en el Bar",
    personality: "Funny and casual — he treats everyone like an old friend and finds humor in everything.",
    scenarioDesc: "You're at a local bar. Alex is an outgoing regular who loves chatting and ordering rounds.",
    voice: {
      english: { voice: "en-US-GuyNeural",     lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",   lang: "es-MX" },
    },
    ssmlStyle: { style: "friendly", degree: "2" },
  },
  {
    id: "sofia",
    name: "Sofia",
    emoji: "🏨",
    color: "#7B5EA7",
    scenario: "Hotel Receptionist",
    scenarioKo: "호텔 리셉셔니스트",
    scenarioEs: "Recepcionista de Hotel",
    personality: "Elegant and polite — impeccably professional, with a warm smile that never wavers.",
    scenarioDesc: "You're checking into a luxury hotel. Sofia handles your reservation and local tips.",
    voice: {
      english: { voice: "en-US-AriaNeural",    lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "customerservice", degree: "1.5" },
  },
  {
    id: "mia",
    name: "Mia",
    emoji: "🛍️",
    color: "#C46480",
    scenario: "Shop Assistant",
    scenarioKo: "매장 직원",
    scenarioEs: "Asistente de Tienda",
    personality: "Bubbly and curious — she loves helping customers find the perfect thing and always has a follow-up question.",
    scenarioDesc: "You're browsing a clothing store. Mia is eager to help you find the right size and style.",
    voice: {
      english: { voice: "en-US-MichelleNeural", lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",    lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",   lang: "es-ES" },
    },
    ssmlStyle: { style: "cheerful", degree: "2" },
  },
  {
    id: "dr_kim",
    name: "Dr. Kim",
    emoji: "🏥",
    color: "#3A8A7A",
    scenario: "Doctor",
    scenarioKo: "의사",
    scenarioEs: "Médico",
    personality: "Calm and serious — methodical, reassuring, and focused on getting the facts right.",
    scenarioDesc: "You're at the doctor's office. Dr. Kim asks about your symptoms and medical history.",
    voice: {
      english: { voice: "en-US-BrandonNeural", lang: "en-US" },
      korean:  { voice: "ko-KR-HyunsuNeural",  lang: "ko-KR" },
      spanish: { voice: "es-ES-AlvaroNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "narration-professional", degree: "1" },
  },
  {
    id: "lisa",
    name: "Lisa",
    emoji: "📞",
    color: "#5A8B5A",
    scenario: "Customer Service",
    scenarioKo: "고객 서비스",
    scenarioEs: "Atención al Cliente",
    personality: "Passive aggressive and overly polite — her smile hides mild contempt, and her politeness is weaponized.",
    scenarioDesc: "You're calling customer service. Lisa is technically helpful but clearly would rather be anywhere else.",
    voice: {
      english: { voice: "en-US-SaraNeural",    lang: "en-US" },
      korean:  { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" },
      spanish: { voice: "es-ES-ElviraNeural",  lang: "es-ES" },
    },
    ssmlStyle: { style: "customerservice", degree: "2" },
  },
  {
    id: "marco",
    name: "Marco",
    emoji: "🍽️",
    color: "#B85C28",
    scenario: "Restaurant Host",
    scenarioKo: "레스토랑 호스트",
    scenarioEs: "Anfitrión del Restaurante",
    personality: "Warm and friendly — he makes every guest feel like the most important person in the room.",
    scenarioDesc: "You're arriving at a restaurant. Marco greets you, seats you, and makes recommendations.",
    voice: {
      english: { voice: "en-US-ChristopherNeural", lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",      lang: "ko-KR" },
      spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" },
    },
    ssmlStyle: { style: "friendly", degree: "2" },
  },
  {
    id: "tom",
    name: "Tom",
    emoji: "🚕",
    color: "#B8A020",
    scenario: "Taxi Driver",
    scenarioKo: "택시 기사",
    scenarioEs: "Taxista",
    personality: "Chatty and impatient — he'll talk your ear off but has no patience for passengers who don't know where they're going.",
    scenarioDesc: "You've just gotten in a taxi. Tom needs your destination and has opinions about everything.",
    voice: {
      english: { voice: "en-US-TonyNeural",    lang: "en-US" },
      korean:  { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" },
      spanish: { voice: "es-MX-JorgeNeural",   lang: "es-MX" },
    },
    ssmlStyle: { style: "excited", degree: "1.5" },
  },
];

export const NPC_MAP: Record<string, NPC> = Object.fromEntries(NPCS.map(n => [n.id, n]));

export function getNPC(id: string): NPC | undefined {
  return NPC_MAP[id];
}
