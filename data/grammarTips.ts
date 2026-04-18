export interface GrammarTip {
  id: string;
  day?: number;
  unit?: number;
  pattern: { ko: string; en: string; es: string };
  examples: Array<{ ko: string; en: string; es: string }>;
  mistakes?: Array<{ ko: string; en: string; es: string }>;
  rudyTip?: { ko: string; en: string; es: string };
}

export const GRAMMAR_TIPS: GrammarTip[] = [
  // ── Unit 1: Greetings & Self-Introduction ──
  {
    id: "g1",
    day: 1,
    unit: 1,
    pattern: {
      ko: "저는 [이름]입니다 / 저는 [이름]이에요",
      en: "I am [name] — formal vs casual",
      es: "Yo soy [nombre] / Me llamo [nombre]",
    },
    examples: [
      { ko: "저는 민수입니다. (격식)", en: "I am Minsoo. (formal)", es: "Yo soy Minsoo. (formal)" },
      { ko: "나는 민수야. (반말)", en: "I'm Minsoo. (casual)", es: "Soy Minsoo. (informal)" },
    ],
    mistakes: [
      { ko: "나는 민수입니다 ✗ (반말+격식 혼용)", en: "Mixing 나 with formal ending", es: "Mezclar 나 con final formal" },
    ],
    rudyTip: {
      ko: "처음 만나는 사람에게는 항상 '저'를 쓰세요!",
      en: "Use '저' (formal I) when meeting someone for the first time!",
      es: "Usa '저' (yo formal) al conocer a alguien por primera vez!",
    },
  },
  {
    id: "g2",
    day: 2,
    unit: 1,
    pattern: {
      ko: "[명사]은/는 — 주제 조사 (Topic Marker)",
      en: "Subject particle: 은 (after consonant) / 는 (after vowel)",
      es: "Particula de tema: 은 (tras consonante) / 는 (tras vocal)",
    },
    examples: [
      { ko: "저는 학생입니다. (저 ends in vowel → 는)", en: "I am a student.", es: "Yo soy estudiante." },
      { ko: "이것은 책입니다. (이것 ends in consonant → 은)", en: "This is a book.", es: "Esto es un libro." },
    ],
    rudyTip: {
      ko: "은/는은 '~에 대해 말하자면'이라는 뜻이에요. 새 주제를 시작할 때 써요!",
      en: "Think of 은/는 as 'speaking of...' — it marks what you're talking about!",
      es: "Piensa en 은/는 como 'hablando de...' — marca el tema de la conversacion!",
    },
  },
  {
    id: "g3",
    day: 3,
    unit: 1,
    pattern: {
      ko: "이/가 — 주격 조사 (Subject Marker)",
      en: "Subject particle: 이 (after consonant) / 가 (after vowel)",
      es: "Particula de sujeto: 이 (consonante) / 가 (vocal)",
    },
    examples: [
      { ko: "날씨가 좋아요. (날씨 → 가)", en: "The weather is nice.", es: "El clima esta bien." },
      { ko: "학생이 왔어요. (학생 → 이)", en: "A student came.", es: "Un estudiante llego." },
    ],
    mistakes: [
      { ko: "날씨은 좋아요 ✗ → 날씨가 좋아요 ✓", en: "Wrong particle after vowel", es: "Particula incorrecta tras vocal" },
    ],
    rudyTip: {
      ko: "은/는은 이미 아는 정보, 이/가는 새로운 정보에 써요!",
      en: "Use 은/는 for known info, 이/가 for new info!",
      es: "Usa 은/는 para info conocida, 이/가 para info nueva!",
    },
  },
  {
    id: "g4",
    day: 4,
    unit: 1,
    pattern: {
      ko: "[동사]아/어요 — 해요체 (Polite Present Tense)",
      en: "Polite present tense: stem + 아요/어요",
      es: "Presente cortés: raíz + 아요/어요",
    },
    examples: [
      { ko: "가다 → 가요 (ㅏ vowel → 아요)", en: "to go → go/goes", es: "ir → voy/va" },
      { ko: "먹다 → 먹어요 (ㅓ vowel → 어요)", en: "to eat → eat/eats", es: "comer → como/come" },
      { ko: "하다 → 해요 (special)", en: "to do → do/does", es: "hacer → hago/hace" },
    ],
    rudyTip: {
      ko: "해요체는 일상에서 가장 많이 쓰는 존댓말이에요!",
      en: "해요체 is the most common polite speech level in daily Korean!",
      es: "해요체 es el nivel de cortesia mas comun en coreano diario!",
    },
  },
  {
    id: "g5",
    day: 5,
    unit: 1,
    pattern: {
      ko: "안 [동사] / [동사]지 않다 — 부정문",
      en: "Negation: 안 + verb OR verb stem + 지 않다",
      es: "Negacion: 안 + verbo O raíz + 지 않다",
    },
    examples: [
      { ko: "안 먹어요 = 먹지 않아요 (I don't eat)", en: "Both mean the same", es: "Ambas significan lo mismo" },
      { ko: "안 좋아요 = 좋지 않아요 (It's not good)", en: "Short form vs long form", es: "Forma corta vs larga" },
    ],
    rudyTip: {
      ko: "일상에서는 짧은 '안' 형태를 더 자주 써요!",
      en: "In casual speech, the short 안 form is more common!",
      es: "En habla casual, la forma corta con 안 es mas comun!",
    },
  },
  // ── Unit 2: Basic Conversations ──
  {
    id: "g6",
    day: 7,
    unit: 2,
    pattern: {
      ko: "[명사]을/를 — 목적격 조사 (Object Marker)",
      en: "Object particle: 을 (after consonant) / 를 (after vowel)",
      es: "Particula de objeto: 을 (consonante) / 를 (vocal)",
    },
    examples: [
      { ko: "밥을 먹어요. (밥 → 을)", en: "I eat rice.", es: "Como arroz." },
      { ko: "커피를 마셔요. (커피 → 를)", en: "I drink coffee.", es: "Bebo cafe." },
    ],
    rudyTip: {
      ko: "을/를은 동작의 대상을 나타내요. '뭐를 하다'의 '뭐'에 붙여요!",
      en: "을/를 marks what the action is done to — the direct object!",
      es: "을/를 marca a que se le hace la accion — el objeto directo!",
    },
  },
  {
    id: "g7",
    day: 8,
    unit: 2,
    pattern: {
      ko: "에서 — 장소에서 하는 행동",
      en: "에서 = at/in (for actions happening at a location)",
      es: "에서 = en (para acciones en un lugar)",
    },
    examples: [
      { ko: "도서관에서 공부해요.", en: "I study at the library.", es: "Estudio en la biblioteca." },
      { ko: "카페에서 커피를 마셔요.", en: "I drink coffee at the cafe.", es: "Bebo cafe en la cafeteria." },
    ],
    mistakes: [
      { ko: "도서관에 공부해요 ✗ (에는 존재, 에서는 행동)", en: "에 = existence, 에서 = action", es: "에 = existencia, 에서 = accion" },
    ],
    rudyTip: {
      ko: "에는 '~에 있다'처럼 존재할 때, 에서는 무언가를 할 때 써요!",
      en: "에 for 'being at', 에서 for 'doing at'!",
      es: "에 para 'estar en', 에서 para 'hacer en'!",
    },
  },
  {
    id: "g8",
    day: 10,
    unit: 2,
    pattern: {
      ko: "[동사]고 싶다 — '~하고 싶다' (Want to)",
      en: "Verb stem + 고 싶다 = want to [verb]",
      es: "Raíz + 고 싶다 = querer [verbo]",
    },
    examples: [
      { ko: "먹고 싶어요. (I want to eat)", en: "I want to eat.", es: "Quiero comer." },
      { ko: "한국에 가고 싶어요.", en: "I want to go to Korea.", es: "Quiero ir a Corea." },
    ],
    rudyTip: {
      ko: "고 싶다 + 아/어요 = 고 싶어요! 가장 흔한 소원 표현이에요!",
      en: "고 싶다 is the easiest way to express desires in Korean!",
      es: "고 싶다 es la forma mas facil de expresar deseos en coreano!",
    },
  },
  // ── Unit 3: Common Expressions ──
  {
    id: "g9",
    day: 13,
    unit: 3,
    pattern: {
      ko: "[동사]ㄹ/을 수 있다 — 가능 표현",
      en: "Verb stem + (으)ㄹ 수 있다 = can [verb]",
      es: "Raíz + (으)ㄹ 수 있다 = poder [verbo]",
    },
    examples: [
      { ko: "한국어를 할 수 있어요.", en: "I can speak Korean.", es: "Puedo hablar coreano." },
      { ko: "읽을 수 있어요.", en: "I can read it.", es: "Puedo leerlo." },
    ],
    rudyTip: {
      ko: "수 없다로 바꾸면 '못 하다'가 돼요! 할 수 없어요 = 못 해요",
      en: "Switch 있다 to 없다 for 'cannot': 할 수 없어요 = 못 해요",
      es: "Cambia 있다 por 없다 para 'no poder': 할 수 없어요 = 못 해요",
    },
  },
  {
    id: "g10",
    day: 15,
    unit: 3,
    pattern: {
      ko: "[동사]았/었어요 — 과거형 (Past Tense)",
      en: "Past tense: stem + 았/었어요",
      es: "Pasado: raíz + 았/었어요",
    },
    examples: [
      { ko: "갔어요 (가다 → 갔어요)", en: "went", es: "fui" },
      { ko: "먹었어요 (먹다 → 먹었어요)", en: "ate", es: "comí" },
      { ko: "했어요 (하다 → 했어요)", en: "did", es: "hice" },
    ],
    rudyTip: {
      ko: "과거형은 현재형에서 요 앞에 ㅆ을 넣는 거예요! 가요 → 갔어요",
      en: "Past tense inserts ㅆ before 요! 가요 → 갔어요",
      es: "El pasado inserta ㅆ antes de 요! 가요 → 갔어요",
    },
  },
];

/** Get grammar tips for a specific day */
export function getTipsForDay(day: number): GrammarTip[] {
  return GRAMMAR_TIPS.filter((t) => t.day === day);
}

/** Get grammar tips for a specific unit */
export function getTipsForUnit(unit: number): GrammarTip[] {
  return GRAMMAR_TIPS.filter((t) => t.unit === unit);
}

/** Get a random grammar tip */
export function getRandomTip(): GrammarTip {
  return GRAMMAR_TIPS[Math.floor(Math.random() * GRAMMAR_TIPS.length)];
}
