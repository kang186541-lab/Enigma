import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { openai } from "./openai";
import { anthropic, hasAnthropic } from "./anthropic";

/**
 * Map browser-reported MIME types to what Azure STT actually accepts.
 *   audio/mp4 / video/mp4  → audio/x-m4a  (iOS Safari MediaRecorder output)
 *   audio/wav              → audio/wav     (WAV with RIFF header, no codec annotation)
 *   anything else          → pass through  (webm/opus, ogg/opus, etc.)
 */
function normalizeAudioMime(mime: string): string {
  if (mime === "audio/mp4" || mime === "video/mp4" || mime === "audio/m4a") return "audio/x-m4a";
  if (mime.startsWith("audio/wav")) return "audio/wav";
  return mime;
}

interface TutorInfo {
  id: string;
  name: string;
  region: string;
  personality: string;
  style: "formal" | "casual";
  language: string;
}

const TUTOR_SYSTEM_PROMPTS: Record<string, string> = {
  sarah: `You are Sarah, a British English language tutor. Your personality is playful, sarcastic, and lightly teasing — think warm wit rather than cruelty. Your goal is to make learning fun and memorable. When the student makes a grammar or vocabulary mistake: (1) playfully point out the mistake with a light, funny roast — never mean, always charming, (2) give the corrected sentence, (3) explain briefly why it was wrong, (4) encourage them to try again with a cheeky nudge. Example: if they write "I goed to the store" you might say: '"Goed?" Darling, did you just invent a new tense? How creative. 😄 The correct form is "I went to the store" — "go" is irregular, so its past tense is "went", not "goed". Have another go, I believe in you. Mostly.' Use British spellings (colour, realise, etc.) and dry British humour. When the student writes correctly, give a warm but slightly smug compliment. Keep responses to 3–4 sentences. Always stay in character.`,

  jake: `You are Jake, an American English tutor. Your personality is playful, sarcastic, and lightly teasing — funny and warm, never mean. Your goal is to make learning entertaining. When the student makes a grammar or vocabulary mistake: (1) joke about the mistake in a fun, relatable way, (2) give the corrected sentence, (3) briefly explain why it was wrong, (4) encourage them to try again with energy. Example: if they write "I goed to the store" you might say: '"Goed?" Bro, did you just speedrun inventing a new verb? 😂 The right sentence is "I went to the store" — "go" is irregular, past tense is "went". You've got this, try again!' Use casual American English and light humor. When the student writes correctly, hype them up warmly. Keep responses to 3–4 sentences. Stay in character.`,

  jane: `Eres Jane, tutora de español de España. Tu personalidad es juguetona, sarcástica y un poco burlona — con humor cálido, nunca cruel. Tu objetivo es que aprender sea divertido. Cuando el estudiante comete un error gramatical o de vocabulario: (1) bromea sobre el error de forma simpática y ligera, (2) da la frase corregida, (3) explica brevemente por qué estaba mal, (4) anímale a intentarlo de nuevo con energía. Usa castellano peninsular con "vosotros". Cuando escribe bien, dale un cumplido cálido pero con un toque irónico. Mantén las respuestas en 3–4 frases. Responde principalmente en español. Mantén el personaje siempre.`,

  alex: `Eres Alex, tutor de español latinoamericano de México. Tu personalidad es juguetona, sarcástica y un poco burlona — con humor cálido y expresivo, nunca hiriente. Tu objetivo es hacer que aprender sea entretenido. Cuando el estudiante comete un error: (1) bromea sobre el error de forma simpática, (2) da la frase corregida, (3) explica brevemente por qué estaba mal, (4) anímale a intentarlo de nuevo con energía positiva. Usa expresiones mexicanas naturales (¡Órale!, ¡Ándale!, etc.). Cuando escribe bien, celébralo con calidez y humor. Mantén las respuestas en 3–4 frases. Responde principalmente en español latino. Mantén el personaje.`,

  jisu: `당신은 지수, 서울 표준어를 가르치는 한국어 튜터입니다. 성격은 장난스럽고, 약간 비꼬는 듯하지만 따뜻하고 재미있는 — 절대 상처를 주지 않는 유머입니다. 목표는 언어 학습을 즐겁게 만드는 것입니다. 학생이 문법이나 어휘 실수를 하면: (1) 실수를 가볍고 재미있게 놀려주세요, (2) 교정된 문장을 알려주세요, (3) 왜 틀렸는지 간단히 설명하세요, (4) 다시 시도하도록 격려해 주세요. 학생이 잘 쓰면 따뜻하지만 약간 장난스러운 칭찬을 해주세요. 답변은 3–4문장으로 유지하세요. 주로 한국어로 대화하고, 필요할 때만 영어를 추가하세요. 항상 캐릭터를 유지하세요.`,

  minjun: `You are 민준, a cool MZ generation Korean tutor. Use these MZ Korean expressions naturally: '갑분싸' '레전드' '킹받다' '현타' 'TMI' '극혐' '존맛' '핵노잼'. Use sentence endings like '~인 듯?' '진짜임?' '대박이잖아' '아닌가요?'. Mix Korean and English naturally: 'seriously 대박' '완전 crazy하지 않음?'. Use lots of emojis 😎🔥💯. Be casual and trendy like talking to a friend. When correcting mistakes say things like: '앗 그건 좀 아닌 듯 ㅋㅋ 이렇게 해봐요'. Teach Korean slang and internet culture alongside language lessons. Keep responses to 3–4 sentences.`,

  // ── Story character tutors ────────────────────────────────────────────────
  eleanor: `You are Lady Eleanor, curator of the British Museum in London. You are brilliant, sharp-witted, and speak formal British English with dry humour. You are Rudy the Fox's mentor. Your personality is playful yet precise — think warm wit with an academic edge. When the student makes a mistake: (1) point it out with elegant, lightly teasing British humour, (2) give the corrected sentence, (3) explain briefly why it was wrong, (4) encourage them with a sharp but kind nudge. Use British spellings (colour, realise). When the student writes correctly, give a refined compliment. Reference museum exhibits or history when it fits naturally. Keep responses to 3–4 sentences. Always stay in character as Lady Eleanor.`,

  tom_tutor: `You are Tom, a museum guard in London. Your personality is casual, streetwise, and banter-loving — you're the opposite of Eleanor. Your goal is to teach everyday conversational English with slang, idioms, and humor. When the student makes a mistake: (1) joke about it like a mate would, (2) give the corrected sentence, (3) briefly explain in simple terms, (4) encourage them to keep going. Use casual expressions, contractions, and everyday vocab. Occasionally reference your guard duties or museum gossip. Keep responses to 3–4 sentences. Stay in character.`,

  isabel: `Eres Isabel, una guía apasionada de las calles de Madrid. Tu personalidad es atrevida, dramática y llena de fuego — hablas el castellano con pasión y energía. Cuando el estudiante comete un error: (1) reacciona con dramatismo cariñoso, (2) da la frase corregida, (3) explica brevemente, (4) anímale con tu energía característica. Usa castellano peninsular con "vosotros". Haz referencias a la cultura española (flamenco, tapas, plazas). Cuando escribe bien, celébralo con entusiasmo. Mantén las respuestas en 3–4 frases. Mantén el personaje siempre.`,

  miguel: `Eres Don Miguel, un sabio vendedor del mercado con el corazón lleno de refranes y sabiduría popular. Tu personalidad es cálida, paciente y llena de dichos populares. Cuando el estudiante comete un error: (1) usa un refrán o comparación con la cocina para señalarlo, (2) da la frase corregida, (3) explica con sencillez, (4) anímale con calidez paternal. Usa español latinoamericano natural. Haz referencia a comida, recetas y la vida del mercado. Cuando escribe bien, celébralo como un buen plato. Mantén las respuestas en 3–4 frases. Mantén el personaje.`,

  sujin: `당신은 수진, 대학교 언어학과 연구원입니다. 성격은 학구적이고 꼼꼼하며, 어원과 언어 구조에 매료되어 있습니다. 루디의 서울 챕터 동료입니다. 학생이 실수하면: (1) 언어학적 관점에서 왜 틀렸는지 흥미롭게 설명하세요, (2) 교정된 문장을 알려주세요, (3) 어원이나 문법 구조를 짧게 설명하세요, (4) 따뜻하게 격려해 주세요. 서울 표준어를 사용하고, 때때로 재미있는 언어학 TMI를 공유하세요. 학생이 잘하면 학술적이면서도 진심 어린 칭찬을 해주세요. 답변은 3–4문장. 항상 캐릭터를 유지하세요.`,

  minho_tutor: `당신은 민호, 홍대의 인기 스트리머입니다. MZ 세대 에너지로 한국어를 가르칩니다. 이런 표현을 자연스럽게 사용하세요: '갑분싸' '레전드' '킹받다' '현타' 'TMI' '존맛'. '~인 듯?' '진짜임?' '대박이잖아' 같은 문장 끝을 쓰세요. 한국어와 영어를 자연스럽게 섞으세요: 'seriously 대박' '완전 crazy하지 않음?'. 이모지를 많이 사용하세요 😎🔥💯. 실수를 고칠 때: '앗 그건 좀 아닌 듯 ㅋㅋ'. K-pop, 밈, 홍대 문화를 참고하세요. 답변은 3–4문장. 캐릭터를 유지하세요.`,
};

const PERSONALITY_MODE_PROMPTS: Record<string, string> = {
  "친절": "You are a warm, encouraging and patient language tutor. Always be kind and supportive. Never mock or tease. Gently correct mistakes with empathy. Celebrate every small improvement and make the student feel confident.",
  "독설": "You are a savage comedian language tutor — brutal roasting AND genuine comedy combined. Mock mistakes hilariously like a stand-up comedian doing a roast. Use sarcastic jokes, puns, and absurd analogies about wrong answers. React with high energy like 'WHAT WAS THAT?! haha' or 'Oh wow... that was genuinely impressive... impressively WRONG haha!'. Make the student laugh while teaching. Still always teach the correct answer after every roast — wrap it in comedy. Example: 'Oh wow... that was genuinely impressive... impressively WRONG haha! But hey, let me show you the right way!'",
};

// Per-tutor 독설+개그 mode prompts — savage comedy roast style with each tutor's
// own language-specific laugh expressions so responses feel authentic.
const TUTOR_DOKSEOL_PROMPTS: Record<string, string> = {
  sarah: `You are in SAVAGE COMEDY MODE — roast comedian meets British tutor. Mock mistakes hilariously with sharp British wit AND absurd humour. React with high energy like "WHAT WAS THAT?! haha" or "Oh my — that was impressively WRONG, haha!" Use puns, sarcasm, and silly analogies. Always respond in English, always teach the correct answer wrapped in comedy. Example reactions: "Oh dear haha, was that supposed to be English? Let me show you how it's actually done!" / "I'm sorry but HA! That was genuinely dreadful — here's the right way!" Keep responses to 3–4 sentences. Stay in character.`,
  jake: `You are in SAVAGE COMEDY MODE — stand-up comedian meets American buddy tutor. Mock mistakes hilariously with high-energy American humor AND savage roasting. React like "WHAT WAS THAT?! haha" or "Bro... that was impressively wrong haha!" Use puns and absurd jokes. Always respond in English, always teach the correct answer wrapped in comedy. Example reactions: "LMAO no way did you just say that — okay okay, the real answer is..." / "Dude that was ROUGH haha! But here's how you nail it:" Keep responses to 3–4 sentences. Stay in character.`,
  jane: `Estás en MODO COMEDIA SALVAJE — comediante de roast meets tutora española. Burla los errores con humor español afilado Y absurdo. Reacciona con alta energía: "¡PERO QUÉ FUE ESO?! jajaja" o "¡Eso fue impresionantemente MAL, jajaja!" Usa chistes, sarcasmo y analogías tontas. Siempre responde en español, siempre enseña la respuesta correcta envuelta en humor. Mantén las respuestas en 3–4 frases. Mantén el personaje.`,
  alex: `Estás en MODO COMEDIA SALVAJE — comediante de roast meets profe mexicano. Burla los errores con humor mexicano afilado Y absurdo. Reacciona con alta energía: "¡ÓRALE QUÉ FUE ESO?! jajaja" o "¡Ay wey, eso estuvo impresionantemente MAL, jajaja!" Usa chistes, sarcasmo y analogías locas. Siempre responde en español latino, siempre enseña la respuesta correcta envuelta en humor. Mantén las respuestas en 3–4 frases. Mantén el personaje.`,
  jisu: `당신은 독설+개그 모드입니다 — 스탠드업 코미디언 meets 한국어 선생님. 실수를 신랄하고 웃기게 놀려주세요. 고에너지로 반응하세요: "이게 뭐야?! 하하" 또는 "와... 이건 진짜 인상적일 만큼 틀렸는데, 하하!" 말장난, 사르캐즘, 웃긴 비유를 사용하세요. 항상 한국어로 대답하고 항상 정답을 코미디로 포장해서 가르쳐주세요. 예시: "하하 진짜요?! 와... 대단한 실수네요. 그럼 정답은 이렇게요!" 답변은 3–4문장으로 유지하세요.`,
  minjun: `당신은 독설+개그 모드입니다 — MZ 세대 스탠드업 코미디언 meets 한국어 튜터. 실수를 MZ 유머로 신랄하고 웃기게 놀려주세요. 고에너지로 반응하세요: "이게 뭐야?! ㅋㅋㅋ" 또는 "와 이건 진짜 인상적으로 틀렸는데 ㅋㅋㅋ!" MZ 슬랭, Konglish, 말장난을 섞어 쓰세요. 항상 한국어로 대답하고 항상 정답을 코미디로 포장해서 가르쳐주세요. 답변은 3–4문장으로 유지하세요.`,
  // Story character tutor dokseol modes
  eleanor: `You are in SAVAGE COMEDY MODE as Lady Eleanor — sharp British aristocratic wit meets roast comedy. Mock mistakes with museum-themed analogies: "That sentence belongs in the restoration wing, darling — it needs WORK haha!" Use dry British sarcasm and academic humour. Always teach the correct answer wrapped in comedy. Keep responses to 3–4 sentences.`,
  tom_tutor: `You are in SAVAGE COMEDY MODE as Tom the museum guard — working-class British banter meets stand-up comedy. Mock mistakes like a pub mate: "Mate, even the museum mummies would cringe at that one haha!" Use casual humour and everyday analogies. Always teach the correct answer wrapped in comedy. Keep responses to 3–4 sentences.`,
  isabel: `Estás en MODO COMEDIA SALVAJE como Isabel — pasión española meets comediante de roast. Burla los errores con drama y fuego: "¡PERO QUÉ FUE ESO?! ¡Hasta el flamenco lloró con esa frase, jajaja!" Usa humor español apasionado. Siempre enseña la respuesta correcta envuelta en humor. 3–4 frases.`,
  miguel: `Estás en MODO COMEDIA SALVAJE como Don Miguel — sabiduría del mercado meets comediante. Burla los errores con refranes retorcidos: "¡Como dice el refrán: 'El que no sabe, inventa'... y tú inventaste bastante, jajaja!" Usa humor cálido y popular. Siempre enseña la respuesta correcta envuelta en humor. 3–4 frases.`,
  sujin: `당신은 독설+개그 모드의 수진입니다 — 언어학자 meets 스탠드업 코미디언. 실수를 언어학적으로 놀려주세요: "이건 언어학적으로 새로운 발견이네요... 틀린 방향으로! 하하" 학문적 유머와 어원 비유를 쓰세요. 항상 정답을 코미디로 포장해서 가르쳐주세요. 3–4문장.`,
  minho_tutor: `당신은 독설+개그 모드의 민호입니다 — MZ 스트리머 meets 로스트 코미디언. "이게 뭐야?! ㅋㅋㅋ 구독자들이 보면 완전 밈 만들겠는데!" MZ 슬랭과 스트리밍 문화로 놀려주세요. 항상 정답을 코미디로 포장. 3–4문장.`,
};

// Map tutor id → full name of the language they teach (used in diagnostic prompts).
function tutorLanguageFullName(tutorId: string): string {
  const id = (tutorId ?? "").toLowerCase();
  if (["sarah", "jake", "eleanor", "tom_tutor"].includes(id)) return "English";
  if (["jane", "alex", "isabel", "miguel"].includes(id)) return "Spanish";
  if (["jisu", "minjun", "sujin", "minho_tutor"].includes(id)) return "Korean";
  return "the target language";
}

// Canonical error-key enum — mirrors the client's learnerProfile types so
// counts aggregate predictably across sessions no matter what GPT echoes back.
const CANONICAL_ERROR_KEYS: ReadonlySet<string> = new Set([
  "past_tense_irregular", "past_tense_regular", "present_tense", "future_tense",
  "perfect_tense", "progressive_tense",
  "subject_verb_agreement", "verb_conjugation", "modal_verb", "auxiliary_verb",
  "article_a_the", "article_missing", "plural_form", "countable_uncountable",
  "preposition_choice", "preposition_missing", "word_order", "negation",
  "pronoun_choice", "possessive", "comparative_superlative",
  "relative_clause", "conditional", "passive_voice", "reported_speech",
  "vocabulary_choice", "collocation", "false_friend", "register_formality",
  "spelling", "capitalization", "punctuation",
  "particle_korean", "honorific_korean", "ser_vs_estar", "gender_agreement_spanish",
  "other",
]);

function normalizeErrorKey(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const k = raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 64);
  if (!k) return undefined;
  if (CANONICAL_ERROR_KEYS.has(k)) return k;
  // Best-effort mapping for minor variants (past_tense_irregular vs irregular_past_tense)
  const alias: Record<string, string> = {
    irregular_past_tense: "past_tense_irregular",
    regular_past_tense: "past_tense_regular",
    past_tense: "past_tense_regular",
    verb_tense: "verb_conjugation",
    agreement: "subject_verb_agreement",
    article: "article_a_the",
    articles: "article_a_the",
    preposition: "preposition_choice",
    prepositions: "preposition_choice",
    word_choice: "vocabulary_choice",
    vocab: "vocabulary_choice",
    formality: "register_formality",
    particle: "particle_korean",
    honorific: "honorific_korean",
    ser_estar: "ser_vs_estar",
    gender: "gender_agreement_spanish",
  };
  if (alias[k]) return alias[k];
  return "other";
}

const CANONICAL_CEFR_LEVELS: ReadonlySet<string> = new Set([
  "A1-low", "A1-mid", "A1-high",
  "A2-low", "A2-mid", "A2-high",
  "B1-low", "B1-mid", "B1-high",
  "B2-low", "B2-mid", "B2-high",
  "C1", "C2",
]);

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const {
        tutorId, messages, mode, lessonTopic, nativeLang, isOpening,
        learnerSummary, needsDiagnosis,
        lessonPhase, turnsInPhase,
        tutorMemorySummary, requestSessionSummary,
      } = req.body as {
        tutorId: string;
        messages: { role: "user" | "assistant"; content: string }[];
        mode?: string;
        lessonTopic?: string;
        nativeLang?: "ko" | "en" | "es";
        isOpening?: boolean;
        // Phase 1: Learner Model
        learnerSummary?: string;
        needsDiagnosis?: boolean;
        // Phase 3: Lesson Arc
        lessonPhase?: "connect" | "model" | "guided" | "free" | "reflect" | "done";
        turnsInPhase?: number;
        // Phase 4: Persistent Tutor
        tutorMemorySummary?: string;   // "relationship tier + past sessions with THIS tutor"
        requestSessionSummary?: boolean; // set on the reflect→done turn; AI appends [SESSION_SUMMARY]
      };

      if (!tutorId || !Array.isArray(messages)) {
        return res.status(400).json({ error: "tutorId and messages are required" });
      }

      const baseTutorPrompt = TUTOR_SYSTEM_PROMPTS[tutorId];
      if (!baseTutorPrompt) {
        return res.status(400).json({ error: "Unknown tutor" });
      }

      // Prepended to every prompt — keeps responses natural for TTS playback.
      const TTS_INSTRUCTION =
        "IMPORTANT: Your responses are spoken aloud via text-to-speech. " +
        "Never use emojis, bullet points, numbered lists, or markdown symbols like ** or __. " +
        "Never write 'ㅋㅋㅋ' or 'ㅎㅎㅎ' — use spoken laughter instead (e.g. '하하', '웃기다', 'haha', 'oh wow'). " +
        "Express all emotion through words, not symbols. Keep responses short and conversational.";

      const modePrompt = mode === "독설"
        ? (TUTOR_DOKSEOL_PROMPTS[tutorId] ?? PERSONALITY_MODE_PROMPTS["독설"])
        : (mode && PERSONALITY_MODE_PROMPTS[mode]);

      // ── Daily lesson opening + structured correction protocol ──────────────
      const NATIVE_LANG_NAME: Record<string, string> = {
        ko: "Korean", en: "English", es: "Spanish",
      };
      const nativeLangName = NATIVE_LANG_NAME[nativeLang ?? "en"] ?? "English";

      // ── Phase 1: Learner Model injection ──────────────────────────────────
      const learnerBlock = (learnerSummary && learnerSummary.trim())
        ? `\n\n[LEARNER PROFILE — calibrate difficulty, examples, and correction focus]
${learnerSummary.trim()}
Use this profile to:
- Adjust sentence length/complexity to the stated CEFR level (aim for i+1 — slightly above).
- Pull example topics from the learner's interests & occupation when natural.
- Weave the recurring mistakes into the conversation so they get another chance — do not lecture about them unless the learner repeats one in this turn.
- If the profile is thin, ask one gentle question that fills it (e.g. interests, occupation).`
        : "";

      // ── Phase 4: Tutor-specific memory (relationship tier + past sessions) ──
      const memoryBlock = (tutorMemorySummary && tutorMemorySummary.trim())
        ? `\n\n[RELATIONSHIP MEMORY — your history with THIS learner as THIS tutor]
${tutorMemorySummary.trim()}
Weave memory naturally — never dump it. If relevant, start with "Last time..." or "You mentioned...". If nothing fits, don't force a reference.`
        : "";

      // ── Phase 4: Request end-of-lesson summary emission on the reflect→done turn ──
      const summaryRequestBlock = (requestSessionSummary === true)
        ? `\n\n[SESSION SUMMARY REQUEST — emit on this turn only]
After your reflect-phase reply AND after any [CORRECTION]/[PHASE_ADVANCE] blocks, append on a NEW LINE exactly:
  [SESSION_SUMMARY]{"highlight":"<one specific positive observation about what the learner did today, 1 sentence in ${nativeLangName}>","focusNextTime":"<one concrete thing to work on next session, 1 sentence in ${nativeLangName}>"}[/SESSION_SUMMARY]
Both fields MUST be written in ${nativeLangName}, even if the rest of your reply is in the target language. Keep each under 120 characters. This block is silent metadata — never read by TTS.`
        : "";

      const diagnosticBlock = (needsDiagnosis === true)
        ? (isOpening === true
          ? `\n\n[FIRST-TIME DIAGNOSTIC DIALOGUE — use only on this opening turn]
The learner has never met you before. Instead of a normal lesson opening, conduct a warm 4-move intake conversation over the next few turns. Each of your replies asks EXACTLY ONE of these, woven naturally in character:
  1. WHY they are learning (travel / work / study / hobby / other)
  2. A GREETING OR SHORT SENTENCE in ${tutorLanguageFullName(tutorId)} to gauge current level
  3. A TOPIC/SITUATION they want to master most
  4. An INTEREST or HOBBY (used later for personalized examples)
This turn is #1 of the intake — greet briefly in character and ask ONLY the "why are you learning" question. Do NOT propose today's lesson topic yet. Do NOT append a [CORRECTION] block on this turn. Do NOT emit [DIAGNOSIS] on turn #1.`
          : `\n\n[DIAGNOSTIC DIALOGUE — CONTINUATION]
You are in the middle of a first-time intake conversation. Continue asking ONE question per turn from this 4-move list (skip any you already covered from the conversation history above):
  1. WHY they are learning
  2. A SHORT SENTENCE in ${tutorLanguageFullName(tutorId)} to gauge level
  3. A TOPIC/SITUATION they want to master
  4. An INTEREST or HOBBY
On the LAST intake turn (when you have enough info for all 4), reply with a warm transition sentence AND append on a new line:
  [DIAGNOSIS]{"level":"one of: A1-low, A1-mid, A1-high, A2-low, A2-mid, A2-high, B1-low, B1-mid, B1-high, B2-low, B2-mid, B2-high, C1, C2","goals":["subset of: travel, work, study, hobby, relationship, exam"],"interests":["…up to 3 short strings…"],"occupation":"…or empty…","country":"…or empty…","motivationText":"…short quote in ${nativeLangName}…"}[/DIAGNOSIS]
Do NOT append a [CORRECTION] block during intake.
Do NOT emit [DIAGNOSIS] until you actually have all 4 answers.`)
        : "";

      const openingBlock = (isOpening === true && lessonTopic && needsDiagnosis !== true)
        ? `\n\n[TODAY'S LESSON OPENING]
This is the FIRST message of the session. The student has not typed anything yet.
Today's lesson topic is: "${lessonTopic}".
Greet the student warmly in character (1–2 sentences), then propose practicing this exact topic with one concrete invitation (e.g. "try introducing yourself", "tell me where you're from", etc.).
Keep the whole opening to 2–3 short sentences. Do NOT append any [CORRECTION] block on this turn.`
        : "";

      // ── Phase 3: Lesson Arc — current-phase instruction + advance protocol ──
      const phaseInstruction = (() => {
        if (!lessonPhase || needsDiagnosis === true) return "";
        const topic = lessonTopic ? `"${lessonTopic}"` : "today's topic";
        const turnsNote = typeof turnsInPhase === "number" ? `You are on turn ${turnsInPhase} of this phase.` : "";
        const body = (() => {
          switch (lessonPhase) {
            case "connect":
              return `You are in the CONNECT phase. Warmly acknowledge the learner and briefly connect to their interests. Introduce today's topic (${topic}) in 1 short sentence. Ask ONE hook question. Keep the whole turn to 2-3 sentences.`;
            case "model":
              return `You are in the MODEL phase. Demonstrate 1-2 target expressions for ${topic}. Say the expression in character, note when to use it, invite the learner to try. 3-4 sentences.`;
            case "guided":
              return `You are in the GUIDED PRACTICE phase. Give a small scaffolded task — fill-in-the-blank, partial sentence, or prompt with hint. Evaluate next turn, give concrete feedback, ask for another attempt. Keep scaffolding high.`;
            case "free":
              return `You are in the FREE PRODUCTION phase. Set up a realistic scenario around ${topic} and let the learner speak freely. Respond naturally in character, weave in target expressions only if natural. Do NOT prompt or scaffold unless they stall.`;
            case "reflect":
              return `You are in the REFLECT phase — the last pedagogical turn. In ONE short reply: (1) give ONE specific positive observation about what they did today, (2) ask ONE metacognition question ("what felt easy/hard?", "which expression will you remember?"). Be warm.`;
            case "done":
              return `The lesson is done. Say a warm goodbye in character (1 sentence) and look forward to next session. Do NOT start a new teaching cycle.`;
          }
        })();
        return `\n\n[LESSON ARC — PHASE INSTRUCTION]\n${body}\n${turnsNote}\nIf you believe this phase is complete and the learner is ready to move on, append on a new line exactly: [PHASE_ADVANCE]{"reason":"<one short sentence>"}[/PHASE_ADVANCE]\nDo NOT advance during CONNECT or MODEL turn 1. Do NOT advance more than once per reply.`;
      })();

      const correctionBlock = (isOpening !== true && needsDiagnosis !== true)
        ? `\n\n[CORRECTION PROTOCOL — WORLD-CLASS TUTOR STRATEGY]
After your natural conversational reply, evaluate the USER's last message for grammar or vocabulary mistakes.

If a meaningful mistake exists, append on a NEW LINE exactly:
  [CORRECTION]{"original":"<user's exact wrong sentence>","corrected":"<fully corrected version>","explanation":"<written in ${nativeLangName}, length depends on strategy>","errorKey":"<canonical key>","strategy":"<one of: recast, elicit, mini_lesson>","priority":"<one of: high, pattern, low>"}[/CORRECTION]
If the message is perfect, do NOT include the block at all.

[HOW TO CHOOSE STRATEGY — pedagogical reasoning]
Use the [LEARNER PROFILE] block above (if present) to see how many times this learner has already made this errorKey. Then apply:

1. "recast" — FIRST occurrence of this error AND the meaning is clear.
   • In your conversational reply, naturally echo back the CORRECTED form (e.g. user says "I goed" → you reply "Oh, you *went* there? Cool, tell me more.")
   • "explanation" field: ONE SHORT sentence (15 words max) in ${nativeLangName}, gentle, framed as a reminder not a lecture. Can end with "." or "!".
   • priority: "low" — the UI can hide this bubble to avoid discouraging beginners.

2. "elicit" — 2nd or 3rd occurrence of this error (getting repetitive but not fossilized).
   • In your conversational reply, ask a leading question pointing to the error ("Hmm, one small thing — what's the past tense of 'go'?")
   • "explanation" field: MUST end with a "?" and be phrased as a leading question in ${nativeLangName} that prompts the learner to self-correct. Do NOT reveal the corrected form in this field. 1–2 sentences max.
   • priority: "pattern" — always show; this pattern is sticking.

3. "mini_lesson" — 4th+ occurrence of SAME error OR the error destroys meaning (e.g. wrong word that changes sentence meaning).
   • In your conversational reply, briefly address it in-character.
   • "explanation" field: 2–4 sentences in ${nativeLangName} with the rule + 1 extra mini-example so the learner truly internalizes it.
   • priority: "high" — always show prominently.

When in doubt: lower-count errors get softer strategies; higher-count errors get more explicit teaching.

[ERRORKEY — canonical snake_case values, choose the closest]
past_tense_irregular, past_tense_regular, present_tense, future_tense, perfect_tense, progressive_tense,
subject_verb_agreement, verb_conjugation, modal_verb, auxiliary_verb,
article_a_the, article_missing, plural_form, countable_uncountable,
preposition_choice, preposition_missing, word_order, negation,
pronoun_choice, possessive, comparative_superlative,
relative_clause, conditional, passive_voice, reported_speech,
vocabulary_choice, collocation, false_friend, register_formality,
spelling, capitalization, punctuation,
particle_korean, honorific_korean, ser_vs_estar, gender_agreement_spanish,
other

[ABSOLUTE RULES]
- ONE correction per turn, the single most pedagogically valuable one.
- Block is silent metadata — never read by TTS. Your conversational reply stays focused on today's topic${lessonTopic ? `: "${lessonTopic}"` : ""}.
- "explanation" MUST be written in ${nativeLangName}.
- Even in 독설 mode, the [CORRECTION] block stays neutral and educational.
- The block is JSON — escape any double quotes inside the strings.

[METADATA EMIT ORDER — when multiple blocks apply in the same reply]
Emit blocks in this EXACT order, each on its own new line AFTER your conversational reply:
  1. [PHASE_ADVANCE]...[/PHASE_ADVANCE]    (if the phase is ready to end)
  2. [CORRECTION]...[/CORRECTION]          (if the user made a mistake)
  3. [SESSION_SUMMARY]...[/SESSION_SUMMARY] (only when requested in the SESSION SUMMARY REQUEST block)
Never emit any block inside your conversational reply. Never emit a block that was not requested or not applicable to this turn.`
        : "";

      const systemPrompt = (modePrompt
        ? `${TTS_INSTRUCTION}\n\n${baseTutorPrompt}\n\n[PERSONALITY MODE OVERRIDE — apply this interaction style]\n${modePrompt}`
        : `${TTS_INSTRUCTION}\n\n${baseTutorPrompt}`) + learnerBlock + memoryBlock + diagnosticBlock + openingBlock + phaseInstruction + summaryRequestBlock + correctionBlock;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        max_completion_tokens: 350,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? "...";

      // ── Parse [CORRECTION]{...}[/CORRECTION] block (if present + not opening) ──
      type CorrectionStrategy = "recast" | "elicit" | "mini_lesson";
      type CorrectionPriority = "high" | "pattern" | "low";
      const VALID_STRATEGIES: ReadonlySet<CorrectionStrategy> = new Set(["recast", "elicit", "mini_lesson"]);
      const VALID_PRIORITIES: ReadonlySet<CorrectionPriority> = new Set(["high", "pattern", "low"]);

      let correction: {
        original: string;
        corrected: string;
        explanation: string;
        errorKey?: string;
        strategy?: CorrectionStrategy;
        priority?: CorrectionPriority;
      } | null = null;
      if (isOpening !== true) {
        const match = raw.match(/\[CORRECTION\]([\s\S]*?)\[\/CORRECTION\]/);
        if (match) {
          try {
            const obj = JSON.parse(match[1]);
            if (
              obj &&
              typeof obj.original === "string" && obj.original.trim() &&
              typeof obj.corrected === "string" && obj.corrected.trim() &&
              typeof obj.explanation === "string" && obj.explanation.trim()
            ) {
              let strategy = typeof obj.strategy === "string" && VALID_STRATEGIES.has(obj.strategy as CorrectionStrategy)
                ? (obj.strategy as CorrectionStrategy)
                : undefined;
              let priority = typeof obj.priority === "string" && VALID_PRIORITIES.has(obj.priority as CorrectionPriority)
                ? (obj.priority as CorrectionPriority)
                : undefined;
              const normalizedKey = normalizeErrorKey(obj.errorKey);

              // ── Server-side enforcement of count→strategy pedagogy ────────
              // If the learner summary exposes "<key> (Nx)" for this errorKey,
              // promote the strategy to match the count. Prevents GPT from
              // underreacting to fossilized errors.
              if (normalizedKey && typeof learnerSummary === "string" && learnerSummary) {
                const countMatch = new RegExp(
                  `\\b${normalizedKey}\\s*\\((\\d+)x\\)`,
                  "i",
                ).exec(learnerSummary);
                if (countMatch) {
                  const n = parseInt(countMatch[1], 10);
                  if (!Number.isNaN(n)) {
                    // Note: the current correction INCREMENTS the count on the
                    // client, so server sees pre-increment count. A "3x" here
                    // means this is the 4th occurrence → mini_lesson.
                    if (n >= 3 && strategy !== "mini_lesson") {
                      console.log(`[/api/chat] override strategy → mini_lesson (key=${normalizedKey}, prev count=${n})`);
                      strategy = "mini_lesson";
                      priority = "high";
                    } else if (n >= 1 && n < 3 && strategy === "recast") {
                      console.log(`[/api/chat] override strategy → elicit (key=${normalizedKey}, prev count=${n})`);
                      strategy = "elicit";
                      priority = priority ?? "pattern";
                    }
                  }
                }
              }

              // Client-side safety: if elicit explanation doesn't end with "?",
              // downgrade to mini_lesson so the hint UI doesn't show a non-question.
              if (strategy === "elicit" && typeof obj.explanation === "string" && !obj.explanation.trim().endsWith("?")) {
                strategy = "mini_lesson";
              }

              correction = {
                original: obj.original,
                corrected: obj.corrected,
                explanation: obj.explanation,
                errorKey: normalizedKey,
                strategy,
                priority,
              };
            }
          } catch (e) {
            console.warn("[/api/chat] Failed to parse [CORRECTION] block:", e);
          }
        }
      }

      // ── Parse [DIAGNOSIS]{...}[/DIAGNOSIS] block (first-session intake) ──
      let diagnosis: {
        level?: string;
        goals?: string[];
        interests?: string[];
        occupation?: string;
        country?: string;
        motivationText?: string;
      } | null = null;
      const dmatch = raw.match(/\[DIAGNOSIS\]([\s\S]*?)\[\/DIAGNOSIS\]/);
      if (dmatch) {
        try {
          const obj = JSON.parse(dmatch[1]);
          if (obj && typeof obj === "object") {
            const CANONICAL_GOALS: ReadonlySet<string> = new Set([
              "travel", "work", "study", "hobby", "relationship", "exam",
            ]);
            const level = typeof obj.level === "string" && CANONICAL_CEFR_LEVELS.has(obj.level)
              ? obj.level : undefined;
            const goals = Array.isArray(obj.goals)
              ? obj.goals.filter((g: unknown): g is string => typeof g === "string" && CANONICAL_GOALS.has(g)).slice(0, 6)
              : undefined;
            const interests = Array.isArray(obj.interests)
              ? obj.interests
                  .filter((g: unknown): g is string => typeof g === "string" && !!g.trim())
                  .map((s: string) => s.trim().slice(0, 40))
                  .slice(0, 5)
              : undefined;
            diagnosis = {
              level,
              goals,
              interests,
              occupation: typeof obj.occupation === "string" && obj.occupation.trim() ? obj.occupation.trim().slice(0, 80) : undefined,
              country: typeof obj.country === "string" && obj.country.trim() ? obj.country.trim().slice(0, 60) : undefined,
              motivationText: typeof obj.motivationText === "string" && obj.motivationText.trim() ? obj.motivationText.trim().slice(0, 200) : undefined,
            };
          }
        } catch (e) {
          console.warn("[/api/chat] Failed to parse [DIAGNOSIS] block:", e);
        }
      }

      // ── Phase 3: [PHASE_ADVANCE] detection ─────────────────────────────────
      let phaseAdvance: { reason?: string } | null = null;
      const pmatch = raw.match(/\[PHASE_ADVANCE\]([\s\S]*?)\[\/PHASE_ADVANCE\]/);
      if (pmatch) {
        try {
          const obj = JSON.parse(pmatch[1]);
          phaseAdvance = {
            reason: typeof obj?.reason === "string" ? obj.reason.slice(0, 200) : undefined,
          };
        } catch {
          phaseAdvance = { reason: undefined };
        }
      }

      // ── Phase 4: [SESSION_SUMMARY] detection ───────────────────────────────
      let sessionSummary: { highlight?: string; focusNextTime?: string } | null = null;
      const smatch = raw.match(/\[SESSION_SUMMARY\]([\s\S]*?)\[\/SESSION_SUMMARY\]/);
      if (smatch) {
        try {
          const obj = JSON.parse(smatch[1]);
          if (obj && typeof obj === "object") {
            sessionSummary = {
              highlight: typeof obj.highlight === "string" && obj.highlight.trim()
                ? obj.highlight.trim().slice(0, 160)
                : undefined,
              focusNextTime: typeof obj.focusNextTime === "string" && obj.focusNextTime.trim()
                ? obj.focusNextTime.trim().slice(0, 160)
                : undefined,
            };
          }
        } catch (e) {
          console.warn("[/api/chat] Failed to parse [SESSION_SUMMARY] block:", e);
        }
      }

      // Always strip metadata blocks from the spoken reply.
      const reply = raw
        .replace(/\s*\[CORRECTION\][\s\S]*?\[\/CORRECTION\]/g, "")
        .replace(/\s*\[DIAGNOSIS\][\s\S]*?\[\/DIAGNOSIS\]/g, "")
        .replace(/\s*\[PHASE_ADVANCE\][\s\S]*?\[\/PHASE_ADVANCE\]/g, "")
        .replace(/\s*\[SESSION_SUMMARY\][\s\S]*?\[\/SESSION_SUMMARY\]/g, "")
        .replace(/\s*\[CORRECTION\][\s\S]*$/g, "")
        .replace(/\s*\[DIAGNOSIS\][\s\S]*$/g, "")
        .replace(/\s*\[PHASE_ADVANCE\][\s\S]*$/g, "")
        .replace(/\s*\[SESSION_SUMMARY\][\s\S]*$/g, "")
        .trim() || "...";
      res.json({ reply, correction, diagnosis, phaseAdvance, sessionSummary });
    } catch (err) {
      console.error("OpenAI error:", err);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // ── Writing practice evaluator ───────────────────────────────────────────
  // Primary: Claude Sonnet 4.5 — chosen because GPT-4o has a documented bias
  // where it flags valid non-Roman-script answers (Korean especially) as
  // "unintelligible" and gives score 0 while simultaneously echoing the same
  // text back as the "correct" answer. Claude does not exhibit this bias and
  // produces more consistent multilingual judgments without needing guards.
  //
  // Fallback: GPT-4o when ANTHROPIC_API_KEY is not set in the environment.
  app.post("/api/writing-eval", async (req: Request, res: Response) => {
    try {
      const { exerciseType, promptText, userAnswer, learningLang, nativeLang } = req.body as {
        exerciseType: "translate" | "complete" | "free";
        promptText: string;
        userAnswer: string;
        learningLang: "ko" | "en" | "es" | "korean" | "english" | "spanish";
        nativeLang?: "ko" | "en" | "es";
      };

      if (!promptText || !userAnswer) {
        return res.status(400).json({ error: "promptText and userAnswer are required" });
      }

      const nativeName = ({ ko: "Korean", en: "English", es: "Spanish" } as const)[(nativeLang ?? "ko") as "ko" | "en" | "es"] ?? "English";
      const learnName = (() => {
        const ll = String(learningLang ?? "").toLowerCase();
        if (ll.startsWith("ko")) return "Korean";
        if (ll.startsWith("es") || ll.startsWith("sp")) return "Spanish";
        return "English";
      })();

      const systemPrompt = (() => {
        const base = `You are a patient ${learnName} language tutor evaluating a student whose native language is ${nativeName}.

The student's answer IS their attempt at writing in ${learnName}. Evaluate it charitably:
- Natural colloquial forms are fine (e.g. Korean omitted particles, Spanish missing accents).
- Minor issues (punctuation, accents, spacing) deduct 5–15 points, not more.
- Score 0 is ONLY for empty strings, wrong-script entirely, or total gibberish.
- If meaning is conveyed correctly with minor tweaks needed, score 80+.

Respond with ONLY a JSON object (no markdown, no code fences, no prose):
{"score": <0-100 integer>, "feedback": "<in ${nativeName}>", "corrections": "<best ${learnName} version; empty string if already good>"}

Length guides:
- Translation exercise: feedback 1–2 sentences.
- Fill-in-the-blank: feedback 1 sentence.
- Free writing: feedback 2–3 sentences on grammar/vocab/naturalness.`;
        return base;
      })();

      const userMsg = `Exercise type: ${exerciseType}
Prompt: ${promptText}
Student's ${learnName} answer: ${userAnswer}`;

      // ── Try Claude first ──────────────────────────────────────────────────
      let parsed: { score?: number; feedback?: string; corrections?: string } | null = null;
      let source = "none";

      if (hasAnthropic() && anthropic) {
        try {
          const msg = await anthropic.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 500,
            system: systemPrompt,
            messages: [{ role: "user", content: userMsg }],
          });
          // Claude content is an array of blocks; concatenate text blocks.
          const text = msg.content
            .filter((b) => b.type === "text")
            .map((b) => (b.type === "text" ? b.text : ""))
            .join("")
            .trim();
          // Strip possible markdown code fences just in case.
          const jsonStr = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
          parsed = JSON.parse(jsonStr);
          source = "claude-sonnet-4-5";
        } catch (e) {
          console.warn("[/api/writing-eval] Claude call failed, falling back to GPT-4o:", e);
          parsed = null;
        }
      }

      // ── Fall back to GPT-4o ───────────────────────────────────────────────
      if (!parsed) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            max_completion_tokens: 500,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMsg },
            ],
          });
          const raw = completion.choices[0]?.message?.content ?? "{}";
          parsed = JSON.parse(raw);
          source = source === "claude-sonnet-4-5" ? "claude-failed-gpt-fallback" : "gpt-4o";
        } catch (e) {
          console.error("[/api/writing-eval] Both Claude and GPT failed:", e);
          return res.status(500).json({ error: "Failed to evaluate writing" });
        }
      }

      let score = typeof parsed.score === "number" && parsed.score >= 0 && parsed.score <= 100
        ? Math.round(parsed.score)
        : 50;
      const feedback = typeof parsed.feedback === "string" ? parsed.feedback.slice(0, 500) : "";
      const corrections = typeof parsed.corrections === "string" ? parsed.corrections.slice(0, 500) : "";

      // ── Safety net: apply self-contradiction guards ONLY when the source
      // is GPT (not Claude). GPT-4o has a documented bias where it scores
      // valid non-Roman-script answers as 0 while echoing the same text as
      // the "correction". Claude doesn't exhibit this, so skipping guards
      // for Claude keeps its accurate low scores intact.
      if (source.startsWith("gpt") || source === "claude-failed-gpt-fallback") {
        const normalize = (s: string) =>
          s.trim().normalize("NFC").replace(/[?!.,¿¡\s~]/g, "").toLowerCase();
        const answerNorm = normalize(userAnswer);
        const corrNorm = normalize(corrections);
        const similarity = (a: string, b: string): number => {
          if (!a && !b) return 1;
          if (!a || !b) return 0;
          const longer = a.length >= b.length ? a : b;
          const shorter = a.length >= b.length ? b : a;
          let matches = 0;
          for (const ch of shorter) if (longer.includes(ch)) matches++;
          return matches / longer.length;
        };
        const sim = similarity(answerNorm, corrNorm);
        const isSelfContradictory =
          score < 70 && (
            corrNorm === "" ||
            corrNorm === answerNorm ||
            corrNorm.includes(answerNorm) ||
            answerNorm.includes(corrNorm) ||
            sim >= 0.80
          );
        const looksFalseUnintelligible =
          score < 30 &&
          userAnswer.trim().length >= 2 &&
          corrections.trim().length > 0;

        if (isSelfContradictory) {
          console.warn(`[/api/writing-eval] GPT self-contradictory: score ${score} → 85 (sim=${sim.toFixed(2)})`);
          score = 85;
        } else if (looksFalseUnintelligible) {
          console.warn(`[/api/writing-eval] GPT false-unintelligible: score ${score} → 60`);
          score = 60;
        }
      }

      console.log(`[/api/writing-eval] ${source} · ${nativeName}→${learnName} · score=${score}`);
      res.json({ score, feedback, corrections });
    } catch (err) {
      console.error("[/api/writing-eval] error:", err);
      res.status(500).json({ error: "Failed to evaluate writing" });
    }
  });

  app.post("/api/translate", async (req: Request, res: Response) => {
    try {
      const { text, targetLanguage } = req.body as {
        text: string;
        targetLanguage: string;
      };

      if (!text || !targetLanguage) {
        return res.status(400).json({ error: "text and targetLanguage are required" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        max_completion_tokens: 300,
        messages: [
          {
            role: "system",
            content: `You are a translation assistant. Translate the user's text into ${targetLanguage}. Return ONLY the translated text with no explanation, no quotes, no prefixes.`,
          },
          { role: "user", content: text },
        ],
      });

      const translation = completion.choices[0]?.message?.content?.trim() ?? "";
      res.json({ translation });
    } catch (err) {
      console.error("Translation error:", err);
      res.status(500).json({ error: "Failed to translate" });
    }
  });

  // ── Locked voice map — NEVER changes based on mode, language, or personality ──
  // Voice identity is determined by tutorId ONLY. Adding or reading `mode` here
  // is forbidden — it must remain irrelevant to voice selection.
  // Azure Neural TTS is the sole TTS provider for all tutors.
  const TUTOR_AZURE_VOICES: Record<string, { voice: string; lang: string }> = {
    sarah:  { voice: "en-GB-SoniaNeural",  lang: "en-GB" }, // female ✓
    jake:   { voice: "en-US-GuyNeural",    lang: "en-US" }, // male  ✓
    jane:   { voice: "es-ES-ElviraNeural", lang: "es-ES" }, // female ✓
    alex:   { voice: "es-MX-JorgeNeural",  lang: "es-MX" }, // male  ✓
    jisu:   { voice: "ko-KR-SunHiNeural",  lang: "ko-KR" }, // female ✓
    minjun: { voice: "ko-KR-InJoonNeural", lang: "ko-KR" }, // male  ✓
    // Story character tutors
    eleanor:     { voice: "en-GB-SoniaNeural",  lang: "en-GB" }, // Lady Eleanor
    tom_tutor:   { voice: "en-US-TonyNeural",   lang: "en-US" }, // Tom
    isabel:      { voice: "es-ES-ElviraNeural", lang: "es-ES" }, // Isabel
    miguel:      { voice: "es-MX-JorgeNeural",  lang: "es-MX" }, // Don Miguel
    sujin:       { voice: "ko-KR-SunHiNeural",  lang: "ko-KR" }, // Sujin
    minho_tutor: { voice: "ko-KR-InJoonNeural", lang: "ko-KR" }, // Minho
  };

  // ── Google Cloud TTS for Korean voices ──────────────────────────────────
  const GOOGLE_KO_VOICES: Record<string, string> = {
    // Tutors
    jisu:      "ko-KR-Neural2-A",  // 따뜻한 여성
    minjun:    "ko-KR-Neural2-C",  // 젊은 남성
    sujin:     "ko-KR-Neural2-B",  // 수진 — 차분한 여성 (tutor alias)
    minho_tutor: "ko-KR-Neural2-C", // 민호 — 젊은 남성 (tutor alias)
    // NPCs with specific voices
    youngsook: "ko-KR-Neural2-A",  // 할머니 영숙 — 따뜻한 여성
    sujin:     "ko-KR-Neural2-B",  // 수진 — 차분한 여성
    minho:     "ko-KR-Neural2-C",  // 민호 — 젊은 남성
  };
  // Fallback: Azure Korean voice name → Google voice
  const AZURE_KO_TO_GOOGLE: Record<string, string> = {
    "ko-KR-SunHiNeural":  "ko-KR-Neural2-A",
    "ko-KR-InJoonNeural": "ko-KR-Neural2-C",
    "ko-KR-HyunsuNeural": "ko-KR-Neural2-C",
  };

  async function googleTTS(text: string, voiceName: string, speakingRate: number = 1.0): Promise<Buffer> {
    const apiKey = process.env.GOOGLE_TTS_API_KEY?.trim();
    if (!apiKey) throw new Error("GOOGLE_TTS_API_KEY not configured");

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: "ko-KR", name: voiceName },
          audioConfig: { audioEncoding: "MP3", speakingRate },
        }),
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Google TTS error:", res.status, errText);
      throw new Error(`Google TTS failed: ${res.status}`);
    }

    const data = (await res.json()) as { audioContent: string };
    return Buffer.from(data.audioContent, "base64");
  }

  app.get("/api/tts", async (req: Request, res: Response) => {
    try {
      // mode is intentionally NOT read here — voice identity is locked to tutorId.
      // See TUTOR_AZURE_VOICES above. Mode belongs only in /api/chat (system prompt).
      const { text, tutorId, speed } = req.query as {
        text?: string;
        tutorId?: string;
        speed?: string;
      };

      if (!text || !tutorId) {
        return res.status(400).json({ error: "text and tutorId required" });
      }

      const azureVoice = TUTOR_AZURE_VOICES[tutorId];
      if (!azureVoice) {
        return res.status(400).json({ error: "Unknown tutorId" });
      }

      const azureKey = process.env.AZURE_SPEECH_KEY?.trim();
      const azureRegion = process.env.AZURE_SPEECH_REGION?.trim();
      if (!azureKey || !azureRegion) {
        return res.status(502).json({ error: "TTS unavailable — no Azure credentials" });
      }

      const speaking_rate = Math.min(1.5, Math.max(0.7, parseFloat(speed ?? "1.1")));

      // ── Korean tutors → Google Cloud TTS ──
      const googleVoice = GOOGLE_KO_VOICES[tutorId];
      if (azureVoice.lang === "ko-KR" && googleVoice) {
        console.log(`TTS [Google] tutor=${tutorId} voice=${googleVoice} speed=${speaking_rate}`);
        const buf = await googleTTS(text.slice(0, 5000), googleVoice, speaking_rate);
        res.set("Content-Type", "audio/mpeg");
        res.set("Cache-Control", "public, max-age=300");
        return res.send(buf);
      }

      // ── English/Spanish tutors → Azure ──
      const safeText = text.slice(0, 5000)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const speedPct = Math.round((speaking_rate - 1) * 100);
      const speedRate = (speedPct >= 0 ? "+" : "") + speedPct + "%";
      console.log(`TTS [Azure] tutor=${tutorId} voice=${azureVoice.voice} speed=${speedRate}`);

      const ssml = buildSsml(azureVoice.voice, azureVoice.lang, safeText, tutorId, undefined, speedRate);

      const ttsController = new AbortController();
      setTimeout(() => ttsController.abort(), 15000);
      const azureRes = await fetch(
        `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": azureKey,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          },
          body: ssml,
          signal: ttsController.signal,
        }
      );

      if (!azureRes.ok) {
        const azureErr = await azureRes.text();
        console.error("Azure TTS error:", azureRes.status, azureErr);
        return res.status(502).json({ error: "TTS failed", azureStatus: azureRes.status, azureError: azureErr, region: azureRegion });
      }

      res.set("Content-Type", "audio/mpeg");
      res.set("Cache-Control", "public, max-age=300");
      const buf = Buffer.from(await azureRes.arrayBuffer());
      return res.send(buf);
    } catch (err) {
      console.error("TTS error:", err);
      res.status(500).json({ error: "TTS generation failed" });
    }
  });

  // ── Pronunciation TTS (Azure Neural TTS with SSML emotional expression) ───
  const AZURE_TTS_VOICES: Record<string, string> = {
    "ko-KR": "ko-KR-SunHiNeural",
    "en-US": "en-US-JennyNeural",
    "en-GB": "en-GB-SoniaNeural",
    "es-ES": "es-ES-ElviraNeural",
    "es-MX": "es-MX-DaliaNeural",
  };

  // SSML express-as style per voice — applied automatically based on voice name.
  // tutorId override takes precedence when the caller supplies it.
  const VOICE_SSML_STYLES: Record<string, { style: string; degree: string }> = {
    "en-GB-SoniaNeural":  { style: "customerservice", degree: "1.5" }, // Sarah
    "en-US-GuyNeural":    { style: "friendly",         degree: "2"   }, // Jake (male fallback)
    "en-US-JennyNeural":  { style: "friendly",         degree: "2"   }, // Jake legacy
    "es-ES-ElviraNeural": { style: "neutral",            degree: "1"   }, // Jane
    "es-MX-JorgeNeural":  { style: "excited",           degree: "1.5" }, // Alex (male fallback)
    "es-MX-DaliaNeural":  { style: "excited",           degree: "1.5" }, // Alex legacy
    "ko-KR-SunHiNeural":  { style: "friendly",          degree: "1.5" }, // 지수
    "ko-KR-InJoonNeural": { style: "excited",           degree: "2"   }, // 민준 (male fallback)
  };

  // Per-tutor override for voices shared across tutors (e.g. both Korean tutors
  // use the same neural voice but 민준 wants "excited").
  const TUTOR_SSML_OVERRIDES: Record<string, { style: string; degree: string }> = {
    sarah:  { style: "customerservice", degree: "1.5" },
    jake:   { style: "friendly",         degree: "2"   },
    jane:   { style: "cheerful",          degree: "1.5" },
    alex:   { style: "excited",           degree: "1.5" },
    jisu:   { style: "friendly",          degree: "1.5" },
    minjun: { style: "excited",           degree: "2"   },
  };

  // Mode overrides apply on top of tutor/voice defaults.
  // Each mode sets its own express-as style, styledegree, prosody rate and pitch.
  const MODE_SSML_STYLES: Record<string, { style: string; degree: string; rate: string; pitch: string }> = {
    "독설": { style: "excited",  degree: "2",   rate: "+15%", pitch: "+15%" },
    "친절": { style: "friendly", degree: "1.5", rate: "+5%",  pitch: "0%"   },
    "slow": { style: "friendly", degree: "1.5", rate: "-30%", pitch: "0%"   },
  };

  // speedRate: explicit prosody rate string (e.g. "+20%") derived from the client's
  // speed multiplier. Takes highest priority so button taps always reflect in audio.
  function buildSsml(voiceName: string, lang: string, safeText: string, tutorId?: string, mode?: string, speedRate?: string): string {
    const modeStyle = mode ? MODE_SSML_STYLES[mode] : undefined;

    // Mode takes highest priority, then tutorId override, then voice default.
    const ssmlStyle = modeStyle ?? (
      (tutorId && TUTOR_SSML_OVERRIDES[tutorId])
        ? TUTOR_SSML_OVERRIDES[tutorId]
        : (VOICE_SSML_STYLES[voiceName] ?? { style: "friendly", degree: "1.5" })
    );

    // speedRate (from client multiplier) > modeStyle rate > neutral default "+0%"
    const rate  = speedRate ?? modeStyle?.rate ?? "+0%";
    const pitch = modeStyle?.pitch ?? "0%";

    // For single-letter pronunciation, wrap with say-as="characters" so Azure
    // speaks the letter name (e.g. "A" → "ay") instead of interpreting it as a word.
    const textContent = mode === "letter"
      ? `<say-as interpret-as="characters">${safeText}</say-as>`
      : safeText;

    return [
      `<speak version="1.0"`,
      ` xmlns="http://www.w3.org/2001/10/synthesis"`,
      ` xmlns:mstts="http://www.w3.org/2001/mstts"`,
      ` xml:lang="${lang}">`,
      `<voice name="${voiceName}">`,
      `<mstts:express-as style="${ssmlStyle.style}" styledegree="${ssmlStyle.degree}">`,
      `<prosody rate="${rate}" pitch="${pitch}">${textContent}</prosody>`,
      `</mstts:express-as>`,
      `</voice>`,
      `</speak>`,
    ].join("");
  }

  app.get("/api/pronunciation-tts", async (req: Request, res: Response) => {
    try {
      const { text, lang, tutorId, mode, voice } = req.query as { text?: string; lang?: string; tutorId?: string; mode?: string; voice?: string };
      if (!text || !lang) {
        return res.status(400).json({ error: "text and lang required" });
      }

      const key = process.env.AZURE_SPEECH_KEY?.trim();
      const region = process.env.AZURE_SPEECH_REGION?.trim();
      if (!key || !region) {
        return res.status(500).json({ error: "Azure credentials not configured" });
      }

      const voiceName = voice ?? AZURE_TTS_VOICES[lang] ?? "en-US-JennyNeural";

      // ── Korean pronunciation → Google Cloud TTS ──
      if (lang?.startsWith("ko")) {
        const gVoice = (tutorId && GOOGLE_KO_VOICES[tutorId]) || AZURE_KO_TO_GOOGLE[voiceName] || "ko-KR-Neural2-A";
        const gRate = mode === "slow" ? 0.7 : 0.95;
        console.log(`Pronunciation TTS [Google] voice=${gVoice} speed=${gRate}`);
        const buf = await googleTTS(text.slice(0, 500), gVoice, gRate);
        res.set("Content-Type", "audio/mpeg");
        res.set("Cache-Control", "public, max-age=600");
        return res.send(buf);
      }

      // ── English/Spanish pronunciation → Azure ──
      const safeText = text.slice(0, 500)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const prosodyRate = mode === "slow" ? "-30%" : "-5%";
      const textContent = mode === "letter"
        ? `<say-as interpret-as="characters">${safeText}</say-as>`
        : safeText;
      const ssml = [
        `<speak version="1.0"`,
        ` xmlns="http://www.w3.org/2001/10/synthesis"`,
        ` xml:lang="${lang}">`,
        `<voice name="${voiceName}">`,
        `<prosody rate="${prosodyRate}">${textContent}</prosody>`,
        `</voice>`,
        `</speak>`,
      ].join("");

      const ttsController = new AbortController();
      setTimeout(() => ttsController.abort(), 15000);
      const azureRes = await fetch(
        `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          },
          body: ssml,
          signal: ttsController.signal,
        }
      );

      if (!azureRes.ok) {
        const errText = await azureRes.text();
        console.error("Azure TTS error:", azureRes.status, errText);
        return res.status(502).json({ error: "Azure TTS failed" });
      }

      const buf = Buffer.from(await azureRes.arrayBuffer());
      res.set("Content-Type", "audio/mpeg");
      res.set("Cache-Control", "public, max-age=600");
      res.send(buf);
    } catch (err) {
      console.error("Pronunciation TTS error:", err);
      res.status(500).json({ error: "TTS failed" });
    }
  });

  // ── Azure Speech-to-Text (plain transcription, no assessment) ────────────
  // Used by the chat screen mic button to transcribe user speech to text.
  app.post("/api/stt", async (req: Request, res: Response) => {
    try {
      const { audio, mimeType, language } = req.body as {
        audio?: string;
        mimeType?: string;
        language?: string;
      };
      if (!audio || !language) {
        return res.status(400).json({ error: "audio and language required" });
      }
      const key = process.env.AZURE_SPEECH_KEY?.trim();
      const region = process.env.AZURE_SPEECH_REGION?.trim();
      if (!key || !region) {
        return res.status(500).json({ error: "Azure credentials not configured" });
      }

      const rawBuffer = Buffer.from(audio, "base64");
      console.log(`[stt] raw=${rawBuffer.length}B  mime=${mimeType}  lang=${language}`);

      // Convert any audio format → 16kHz mono WAV PCM (same as pronunciation-assess)
      const { spawn } = await import("child_process");
      const { writeFile, unlink, readFile } = await import("fs/promises");
      const { randomUUID } = await import("crypto");
      const { tmpdir } = await import("os");
      const { join } = await import("path");

      const inputPath  = join(tmpdir(), `stt-in-${randomUUID()}`);
      const outputPath = join(tmpdir(), `stt-out-${randomUUID()}.wav`);
      let wavBuffer: Buffer;
      try {
        await writeFile(inputPath, rawBuffer);
        await new Promise<void>((resolve, reject) => {
          const ff = spawn("ffmpeg", [
            "-i", inputPath,
            "-vn", "-ar", "16000", "-ac", "1", "-acodec", "pcm_s16le", "-y",
            outputPath,
          ]);
          const errs: string[] = [];
          ff.stderr.on("data", (d: Buffer) => errs.push(d.toString()));
          ff.on("close", (code: number) => code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}: ${errs.slice(-2).join(" ")}`)));
          ff.on("error", reject);
        });
        wavBuffer = await readFile(outputPath);
        console.log(`[stt] ffmpeg ok → ${wavBuffer.length}B WAV`);
      } catch (convErr) {
        console.error("[stt] ffmpeg failed, using raw buffer:", convErr);
        wavBuffer = rawBuffer;
      } finally {
        await unlink(inputPath).catch(() => {});
        await unlink(outputPath).catch(() => {});
      }

      const azureUrl =
        `https://${region}.stt.speech.microsoft.com/speech/recognition/interactive` +
        `/cognitiveservices/v1?language=${encodeURIComponent(language)}&format=detailed`;

      const sttController = new AbortController();
      setTimeout(() => sttController.abort(), 15000);
      const azureRes = await fetch(azureUrl, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        },
        body: wavBuffer,
        signal: sttController.signal,
      });

      if (!azureRes.ok) {
        const errText = await azureRes.text();
        console.error("[stt] Azure error:", azureRes.status, errText);
        return res.status(502).json({ error: "STT failed" });
      }

      const data = (await azureRes.json()) as { RecognitionStatus: string; DisplayText?: string; NBest?: { Display?: string; Lexical?: string }[] };
      const text = data.DisplayText ?? data.NBest?.[0]?.Display ?? "";
      console.log(`[stt] Azure status=${data.RecognitionStatus}  text="${text}"`);
      res.json({ text, status: data.RecognitionStatus });
    } catch (err) {
      console.error("[stt] error:", err);
      res.status(500).json({ error: "STT failed" });
    }
  });

  // ── GPT Pronunciation Scoring ─────────────────────────────────────────────
  // Receives the target word and what the speech recogniser heard, then asks
  // Azure Pronunciation Assessment — sends real audio to Azure's phoneme-level scorer.
  // Accepts { word, lang, audio (base64), mimeType } and returns detailed pronunciation scores.
  app.post("/api/pronunciation-assess", async (req: Request, res: Response) => {
    try {
      const { word, lang, audio, mimeType } = req.body as {
        word?: string;
        lang?: string;
        audio?: string;
        mimeType?: string;
      };
      if (!word || !lang || !audio) {
        return res.status(400).json({ error: "word, lang, and audio are required" });
      }

      const key = process.env.AZURE_SPEECH_KEY?.trim();
      const region = process.env.AZURE_SPEECH_REGION?.trim();
      if (!key || !region) {
        return res.status(500).json({ error: "Azure credentials not configured" });
      }

      const { detectAudioFormat } = await import("./replit_integrations/audio/client");
      const { spawn } = await import("child_process");
      const { writeFile, unlink, readFile } = await import("fs/promises");
      const { randomUUID } = await import("crypto");
      const { tmpdir } = await import("os");
      const { join } = await import("path");

      // Azure Pronunciation Assessment only supports en-US for English (not en-GB, en-AU etc.)
      const sttLang = lang.startsWith("en-") ? "en-US"
                    : lang.startsWith("es-") ? "es-ES"
                    : lang.startsWith("ko-") ? "ko-KR"
                    : lang;

      const rawBuffer = Buffer.from(audio, "base64");
      const detectedFormat = detectAudioFormat(rawBuffer);
      console.log(`[assess] raw=${rawBuffer.length}B  fmt=${detectedFormat}  mime=${mimeType}  lang=${lang}→${sttLang}  word="${word}"`);

      // Determine Azure content type from client-reported mime type.
      // iOS clients now send WAV (LINEARPCM 16kHz); Android sends MPEG-4/AAC.
      // Azure Speech REST supports both natively without ffmpeg.
      function getAzureContentType(mime: string | undefined): string {
        if (!mime) return "audio/wav; codecs=audio/pcm; samplerate=16000";
        if (mime.includes("wav") || mime.includes("pcm")) return "audio/wav; codecs=audio/pcm; samplerate=16000";
        if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) return "audio/mp4";
        if (mime.includes("ogg") || mime.includes("opus")) return "audio/ogg; codecs=opus";
        if (mime.includes("webm")) return "audio/webm; codecs=opus";
        return "audio/wav; codecs=audio/pcm; samplerate=16000";
      }

      // Try ffmpeg conversion (best quality) — fall back gracefully if unavailable.
      const inputPath = join(tmpdir(), `pa-in-${randomUUID()}`);
      const outputPath = join(tmpdir(), `pa-out-${randomUUID()}.wav`);
      let wavBuffer: Buffer;
      let azureContentType = getAzureContentType(mimeType);
      try {
        await writeFile(inputPath, rawBuffer);
        const ffmpegArgs = [
          "-i", inputPath,
          "-vn",
          "-af", "highpass=f=80,loudnorm=I=-16:LRA=11:TP=-1.5,silenceremove=start_periods=1:start_silence=0.1:start_threshold=-40dB",
          "-ar", "16000",
          "-ac", "1",
          "-acodec", "pcm_s16le",
          "-y",
          outputPath,
        ];
        const stderrLines: string[] = [];
        await new Promise<void>((resolve, reject) => {
          const ff = spawn("ffmpeg", ffmpegArgs);
          ff.stderr.on("data", (d: Buffer) => stderrLines.push(d.toString()));
          ff.on("close", (code: number) => {
            if (code === 0) resolve();
            else reject(new Error(`ffmpeg exit ${code}: ${stderrLines.slice(-3).join(" ")}`));
          });
          ff.on("error", reject);
        });
        wavBuffer = await readFile(outputPath);
        azureContentType = "audio/wav; codecs=audio/pcm; samplerate=16000";
        console.log(`[assess] ffmpeg ok → ${wavBuffer.length}B`);
      } catch (convErr) {
        console.error("[assess] ffmpeg unavailable, sending raw audio:", (convErr as Error).message);
        // Send raw buffer with the correct Content-Type for the format Azure received
        wavBuffer = rawBuffer;
        // azureContentType already set from mimeType above
      } finally {
        await unlink(inputPath).catch(() => {});
        await unlink(outputPath).catch(() => {});
      }

      console.log(`[assess] sending to Azure  contentType=${azureContentType}  bytes=${wavBuffer.length}`);

      const assessmentConfig = Buffer.from(
        JSON.stringify({
          ReferenceText: word,
          GradingSystem: "HundredMark",
          Dimension: "Comprehensive",
          EnableProsodyAssessment: true,
        })
      ).toString("base64");

      // Use "interactive" mode — designed for short words/phrases, lower silence threshold
      const assessController = new AbortController();
      setTimeout(() => assessController.abort(), 15000);
      const azureRes = await fetch(
        `https://${region}.stt.speech.microsoft.com/speech/recognition/interactive/cognitiveservices/v1?language=${sttLang}&format=detailed`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": azureContentType,
            "Pronunciation-Assessment": assessmentConfig,
          },
          body: wavBuffer,
          signal: assessController.signal,
        }
      );

      if (!azureRes.ok) {
        const errText = await azureRes.text();
        console.error("[assess] Azure HTTP error:", azureRes.status, errText);
        return res.status(500).json({ error: "Azure assessment failed" });
      }

      // Azure may return scores nested under PronunciationAssessment OR flat on NBest[0]
      const data = await azureRes.json();
      console.log(`[assess] Azure full response:`, JSON.stringify(data).slice(0, 2000));

      const nb0 = (data as any).NBest?.[0];
      // Support both nested (PronunciationAssessment.PronScore) and flat (PronScore) formats
      const pa = nb0?.PronunciationAssessment;
      const pronScoreRaw = pa?.PronScore ?? nb0?.PronScore;
      const hasPronScore = pronScoreRaw != null;
      console.log(`[assess] Azure status=${data.RecognitionStatus}  display="${data.DisplayText}"  hasPronScore=${hasPronScore}  PronScore=${pronScoreRaw}  nested=${pa != null}`);

      // Localized feedback helper based on sttLang
      const isKo = sttLang.startsWith("ko");
      const isEs = sttLang.startsWith("es");
      function localFeedback(ko: string, en: string, es: string) {
        return isKo ? ko : isEs ? es : en;
      }

      if (data.RecognitionStatus !== "Success" || !hasPronScore) {
        return res.json({
          score: 0,
          accuracyScore: 0,
          fluencyScore: 0,
          completenessScore: 0,
          recognizedText: data.DisplayText ?? "",
          feedback: localFeedback(
            `음성 인식 실패 (${data.RecognitionStatus}). 더 크고 명확하게 말해 주세요.`,
            `Speech recognition failed (${data.RecognitionStatus}). Please speak louder and more clearly.`,
            `Reconocimiento de voz fallido (${data.RecognitionStatus}). Habla más fuerte y claro.`
          ),
          words: [],
        });
      }

      const pronScore = Math.round(pronScoreRaw);
      const accuracyScore = Math.round(pa?.AccuracyScore ?? nb0?.AccuracyScore ?? 0);
      const fluencyScore = Math.round(pa?.FluencyScore ?? nb0?.FluencyScore ?? 0);
      const completenessScore = Math.round(pa?.CompletenessScore ?? nb0?.CompletenessScore ?? 0);

      let feedback: string;
      if (pronScore >= 90) {
        feedback = localFeedback(
          "완벽한 발음이에요! 정말 훌륭합니다!",
          "Perfect pronunciation! Excellent!",
          "Pronunciación perfecta. Excelente!"
        );
      } else if (pronScore >= 75) {
        feedback = localFeedback(
          `좋아요! 정확도 ${accuracyScore}점. 조금만 더 연습하면 완벽해질 거예요!`,
          `Good! Accuracy ${accuracyScore}. A little more practice and you'll nail it!`,
          `Bien! Precisión ${accuracyScore}. Un poco más de práctica y lo dominarás!`
        );
      } else if (pronScore >= 50) {
        feedback = localFeedback(
          `연습이 필요해요. 각 음절을 천천히 또렷하게 발음해 보세요. (정확도: ${accuracyScore}점)`,
          `Needs practice. Try pronouncing each syllable slowly and clearly. (Accuracy: ${accuracyScore})`,
          `Necesita práctica. Pronuncia cada sílaba lenta y claramente. (Precisión: ${accuracyScore})`
        );
      } else {
        feedback = localFeedback(
          `다시 도전해 봐요! 먼저 듣기 버튼으로 원어민 발음을 들어보세요.`,
          `Try again! Listen to the native pronunciation first using the speaker button.`,
          `Inténtalo de nuevo! Escucha la pronunciación nativa primero con el botón de altavoz.`
        );
      }

      const prosodyScore = Math.round(pa?.ProsodyScore ?? nb0?.ProsodyScore ?? 0);

      res.json({
        score: pronScore,
        accuracyScore,
        fluencyScore,
        completenessScore,
        prosodyScore,
        recognizedText: data.DisplayText ?? "",
        feedback,
        words: (nb0!.Words ?? []).map((w: any) => ({
          word: w.Word,
          score: Math.round(w.PronunciationAssessment?.AccuracyScore ?? w.AccuracyScore ?? 0),
          errorType: w.PronunciationAssessment?.ErrorType ?? w.ErrorType ?? "None",
          phonemes: (w.Phonemes ?? []).map((p: any) => ({
            phoneme: p.Phoneme,
            score: Math.round(p.PronunciationAssessment?.AccuracyScore ?? p.AccuracyScore ?? 0),
          })),
        })),
      });
    } catch (err) {
      console.error("Pronunciation assessment error:", err);
      res.status(500).json({ error: "Assessment failed" });
    }
  });

  // GPT to give a 0-100 score and short Korean feedback (legacy, kept as fallback).
  app.post("/api/gpt-score", async (req: Request, res: Response) => {
    try {
      const { word, recognized } = req.body as { word?: string; recognized?: string };
      if (!word || recognized === undefined) {
        return res.status(400).json({ error: "word and recognized are required" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              'You are a language pronunciation coach. ' +
              'The user will give you a target word and what a speech recogniser heard. ' +
              'Reply ONLY with a JSON object with two keys: ' +
              '"score" (integer 0-100 reflecting pronunciation accuracy) ' +
              'and "feedback" (one short encouraging sentence in Korean with a specific tip). ' +
              'Do not copy the example; evaluate the actual input.',
          },
          {
            role: "user",
            content:
              `Target word: "${word}"\n` +
              `Speech recogniser heard: "${recognized}"\n` +
              'Give your score and Korean feedback.',
          },
        ],
        temperature: 0.7,
        max_completion_tokens: 120,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw) as { score?: number; feedback?: string };

      res.json({
        score: Math.round(Math.max(0, Math.min(100, parsed.score ?? 0))),
        feedback: parsed.feedback ?? "",
      });
    } catch (err) {
      console.error("GPT score error:", err);
      res.status(500).json({ error: "Scoring failed" });
    }
  });

  // ── NPC Mission: NPC-specific Azure TTS ─────────────────────────────────
  const NPC_AZURE_VOICES: Record<string, Record<string, { voice: string; lang: string }>> = {
    emma:         { english: { voice: "en-US-JennyNeural",        lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    james:        { english: { voice: "en-GB-RyanNeural",         lang: "en-GB" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
    officer_park: { english: { voice: "en-US-DavisNeural",        lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
    bar_alex:     { english: { voice: "en-US-GuyNeural",          lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
    sofia:        { english: { voice: "en-US-AriaNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    mia:          { english: { voice: "en-US-MichelleNeural",     lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    dr_kim:       { english: { voice: "en-US-BrandonNeural",      lang: "en-US" }, korean: { voice: "ko-KR-HyunsuNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" } },
    lisa:         { english: { voice: "en-US-SaraNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    marco:        { english: { voice: "en-US-ChristopherNeural",  lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" } },
    tom:          { english: { voice: "en-US-TonyNeural",         lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
    // Story-mode NPCs
    amira:        { english: { voice: "en-US-AriaNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    carlos:       { english: { voice: "en-US-GuyNeural",          lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
    ellis:        { english: { voice: "en-GB-SoniaNeural",        lang: "en-GB" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    hassan:       { english: { voice: "en-US-BrandonNeural",      lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" } },
    isabel:       { english: { voice: "en-US-JennyNeural",        lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    miguel:       { english: { voice: "en-US-ChristopherNeural",  lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
    minho:        { english: { voice: "en-US-JasonNeural",        lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
    mr_black:     { english: { voice: "en-US-DavisNeural",        lang: "en-US" }, korean: { voice: "ko-KR-HyunsuNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" } },
    penny:        { english: { voice: "en-GB-LibbyNeural",        lang: "en-GB" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    sujin:        { english: { voice: "en-US-MichelleNeural",     lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    youngsook:    { english: { voice: "en-US-SaraNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    lingo:        { english: { voice: "en-US-TonyNeural",         lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
    // Real-world NPCs
    ryan:         { english: { voice: "en-US-GuyNeural",          lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
    nari:         { english: { voice: "en-US-JennyNeural",        lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    derek:        { english: { voice: "en-US-DavisNeural",        lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
    mei:          { english: { voice: "en-US-MichelleNeural",     lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    juno:         { english: { voice: "en-US-TonyNeural",         lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
    gloria:       { english: { voice: "en-US-SaraNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    stan:         { english: { voice: "en-US-BrandonNeural",      lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" } },
    hana:         { english: { voice: "en-US-AriaNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    vincent:      { english: { voice: "en-US-ChristopherNeural",  lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" } },
    claire:       { english: { voice: "en-US-AriaNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" } },
    officer_kwon: { english: { voice: "en-US-DavisNeural",        lang: "en-US" }, korean: { voice: "ko-KR-HyunsuNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" } },
    luca:         { english: { voice: "en-US-GuyNeural",          lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" } },
  };

  // NPC SSML express-as styles — applied only for English voices.
  // Korean and Spanish Azure voices do not support all express-as styles;
  // for non-English voices the endpoint uses prosody adjustments instead.
  const NPC_SSML_STYLES: Record<string, { style: string; degree: string }> = {
    tom:          { style: "cheerful",  degree: "1.3" },
    emma:         { style: "friendly",  degree: "1.2" },
    james:        { style: "friendly",  degree: "1.0" },
    sofia:        { style: "cheerful",  degree: "1.5" },
    dr_kim:       { style: "serious",   degree: "1.0" },
    marco:        { style: "friendly",  degree: "1.2" },
    officer_park: { style: "serious",   degree: "1.0" },
    bar_alex:     { style: "friendly",  degree: "1.2" },
    mia:          { style: "friendly",  degree: "1.3" },
    lisa:         { style: "cheerful",  degree: "1.2" },
    // Story-mode NPCs
    amira:        { style: "friendly",  degree: "1.2" },
    carlos:       { style: "cheerful",  degree: "1.3" },
    ellis:        { style: "sad",       degree: "1.5" },
    hassan:       { style: "friendly",  degree: "1.0" },
    isabel:       { style: "cheerful",  degree: "1.3" },
    miguel:       { style: "friendly",  degree: "1.2" },
    minho:        { style: "cheerful",  degree: "1.5" },
    mr_black:     { style: "serious",   degree: "1.5" },
    penny:        { style: "sad",       degree: "1.2" },
    sujin:        { style: "friendly",  degree: "1.3" },
    youngsook:    { style: "friendly",  degree: "1.0" },
    lingo:        { style: "cheerful",  degree: "1.3" },
    // Real-world NPCs
    ryan:         { style: "customerservice", degree: "1.0" },
    nari:         { style: "friendly",  degree: "1.0" },
    derek:        { style: "unfriendly", degree: "1.0" },
    mei:          { style: "friendly",  degree: "1.2" },
    juno:         { style: "excited",   degree: "1.3" },
    gloria:       { style: "customerservice", degree: "1.5" },
    stan:         { style: "narration-professional", degree: "1.0" },
    hana:         { style: "cheerful",  degree: "1.5" },
    vincent:      { style: "friendly",  degree: "1.3" },
    claire:       { style: "narration-professional", degree: "1.2" },
    officer_kwon: { style: "serious",   degree: "1.5" },
    luca:         { style: "cheerful",  degree: "1.5" },
  };

  app.get("/api/npc-tts", async (req: Request, res: Response) => {
    try {
      const { text, npcId, npcLang, speed } = req.query as {
        text?: string; npcId?: string; npcLang?: string; speed?: string;
      };
      if (!text || !npcId || !npcLang) {
        return res.status(400).json({ error: "text, npcId, npcLang required" });
      }
      const key    = process.env.AZURE_SPEECH_KEY?.trim();
      const region = process.env.AZURE_SPEECH_REGION?.trim();
      if (!key || !region) return res.status(500).json({ error: "Azure credentials not configured" });

      const npcVoices = NPC_AZURE_VOICES[npcId];
      if (!npcVoices) return res.status(400).json({ error: "Unknown npcId" });
      const voiceInfo = npcVoices[npcLang] ?? npcVoices["english"];

      const speaking_rate = Math.min(1.5, Math.max(0.7, parseFloat(speed ?? "1.0")));

      // ── Korean NPC → Google Cloud TTS ──
      if (voiceInfo.lang === "ko-KR") {
        const gVoice = GOOGLE_KO_VOICES[npcId] || AZURE_KO_TO_GOOGLE[voiceInfo.voice] || "ko-KR-Neural2-A";
        console.log(`NPC TTS [Google] npc=${npcId} voice=${gVoice} speed=${speaking_rate}`);
        const buf = await googleTTS(text.slice(0, 3000), gVoice, speaking_rate);
        res.set("Content-Type", "audio/mpeg");
        res.set("Cache-Control", "public, max-age=300");
        return res.send(buf);
      }

      // ── English/Spanish NPC → Azure ──
      const speedPct = Math.round((speaking_rate - 1) * 100);
      const speedRate = (speedPct >= 0 ? "+" : "") + speedPct + "%";

      const safeText = text.slice(0, 3000)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const npcStyle = NPC_SSML_STYLES[npcId] ?? { style: "friendly", degree: "1.2" };

      // express-as styles only work reliably with English Azure voices.
      // For Korean/Spanish voices, use prosody adjustments only.
      const isEnglish = voiceInfo.lang.startsWith("en-");

      const ssml = isEnglish
        ? [
            `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"`,
            ` xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${voiceInfo.lang}">`,
            `<voice name="${voiceInfo.voice}">`,
            `<mstts:express-as style="${npcStyle.style}" styledegree="${npcStyle.degree}">`,
            `<prosody rate="${speedRate}">${safeText}</prosody>`,
            `</mstts:express-as></voice></speak>`,
          ].join("")
        : [
            `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"`,
            ` xml:lang="${voiceInfo.lang}">`,
            `<voice name="${voiceInfo.voice}">`,
            `<prosody rate="${speedRate}">${safeText}</prosody>`,
            `</voice></speak>`,
          ].join("");

      const azureRes = await fetch(
        `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          },
          body: ssml,
        }
      );
      if (!azureRes.ok) {
        const errText = await azureRes.text();
        console.error("NPC TTS error:", azureRes.status, errText);
        return res.status(502).json({ error: "NPC TTS failed" });
      }
      res.set("Content-Type", "audio/mpeg");
      res.set("Cache-Control", "public, max-age=300");
      const buf = Buffer.from(await azureRes.arrayBuffer());
      return res.send(buf);
    } catch (err) {
      console.error("NPC TTS error:", err);
      res.status(500).json({ error: "NPC TTS failed" });
    }
  });

  // ── NPC Mission Chat ──────────────────────────────────────────────────────
  const NPC_SCENARIOS: Record<string, { name: string; personality: string; scenarioDesc: string }> = {
    // ── Story NPCs ────────────────────────────────────────────────────────
    penny:        { name: "Penny",            personality: "Warm and gentle barista. Speaks softly, remembers your usual order, makes you feel at home.", scenarioDesc: "You're at a cozy cafe. Order drinks, ask about the menu, chat with the barista." },
    miguel:       { name: "Don Miguel",       personality: "Warm, wise restaurant owner. Full of proverbs and food recommendations.", scenarioDesc: "You're at a restaurant. Order food, ask about ingredients, handle the bill and tipping." },
    tom:          { name: "Tom",              personality: "Chatty and opinionated taxi driver. Talks nonstop but needs clear directions.", scenarioDesc: "You just got in a taxi. Give your destination, handle route changes, make small talk." },
    hassan:       { name: "Hassan",           personality: "Chatty, jovial, and helpful airport staff. Knows every airport trick. Makes stressful situations fun.", scenarioDesc: "You're at the airport. Check in, handle luggage, find gates, deal with delays." },
    eleanor:      { name: "Lady Eleanor",     personality: "Elegant and precise hotel concierge. Expects proper manners. Impeccable service.", scenarioDesc: "You're checking into a hotel. Handle reservations, request amenities, report problems." },
    sujin:        { name: "Sujin",            personality: "Precise and caring doctor. Asks detailed questions. Explains clearly and patiently.", scenarioDesc: "You're at a clinic. Describe symptoms, understand diagnoses, ask about medication." },
    minho:        { name: "Minho",            personality: "Tech-savvy MZ generation phone shop staff. Speaks fast, uses tech jargon casually. Helpful but impatient.", scenarioDesc: "You need a SIM card or phone plan. Compare options, verify ID, set up your device." },
    youngsook:    { name: "Grandma Youngsook",personality: "Warm, nurturing grandmother. Knows every ingredient. Gives unsolicited life advice.", scenarioDesc: "You're grocery shopping. Find items, read labels, ask for recommendations, handle checkout." },
    isabel:       { name: "Isabel",           personality: "Bold and fashionable shop assistant. Honest opinions, passionate recommendations.", scenarioDesc: "You're at a clothing store. Ask about sizes, try things on, negotiate prices." },
    carlos:       { name: "Carlos",           personality: "Quiet but warm bar regular. Opens up over drinks. Teaches you the art of casual conversation.", scenarioDesc: "You're at a bar with a friend. Order drinks, make small talk, share stories." },
    amira:        { name: "Dr. Amira",        personality: "Strict, precise bank officer. Follows procedures exactly. No room for ambiguity.", scenarioDesc: "You're at a bank. Open an account, exchange currency, resolve card issues." },
    // ── Real-world NPCs ───────────────────────────────────────────────────
    ryan:         { name: "Ryan",             personality: "Fast-moving, no-nonsense fast food cashier. Speaks quickly. Won't repeat twice.", scenarioDesc: "You're at a fast food counter. Order combos, customize items, handle rapid-fire questions." },
    nari:         { name: "Nari",             personality: "Busy commuter, slightly impatient but kind enough to help if you ask politely.", scenarioDesc: "You're on public transit. Ask for directions, buy tickets, find the right platform." },
    derek:        { name: "Derek",            personality: "Lazy building manager. Sighs a lot. Will help eventually if you're persistent enough.", scenarioDesc: "Something's broken in your room. Report issues, request repairs, negotiate solutions." },
    mei:          { name: "Mei",              personality: "Gentle, thorough pharmacist. Asks detailed questions about symptoms and allergies.", scenarioDesc: "You need medicine. Describe symptoms, ask about dosage, explain allergies." },
    juno:         { name: "Juno",             personality: "Rushed delivery driver. Speaks fast, needs clear address and instructions NOW.", scenarioDesc: "Your delivery is here or you're ordering by phone. Give address, handle mixups, tip." },
    gloria:       { name: "Gloria",           personality: "By-the-book retail employee. Polite but firm about policy. Needs receipts.", scenarioDesc: "You need to return or exchange something. Explain the problem, handle store policy." },
    stan:         { name: "Stan",             personality: "Slow, methodical postal worker. Asks about weight, dimensions, insurance. Takes his time.", scenarioDesc: "You're sending a package or picking one up. Fill forms, choose shipping, handle customs." },
    hana:         { name: "Hana",             personality: "Outgoing and curious. Asks lots of questions. Loves getting to know new people.", scenarioDesc: "You're at a party or meetup. Introduce yourself, answer personal questions, make plans." },
    vincent:      { name: "Vincent",          personality: "Smooth-talking real estate agent. Oversells everything. You need to ask the right questions.", scenarioDesc: "You're looking for an apartment. Ask about rent, deposits, contracts, neighborhood." },
    claire:       { name: "Claire",           personality: "Sharp, no-nonsense interviewer. Tests your confidence and communication under pressure.", scenarioDesc: "You're in a job interview. Introduce yourself, answer tough questions, ask about the role." },
    officer_kwon: { name: "Officer Kwon",     personality: "Stoic, by-the-book civil servant. Zero small talk. Needs exact documents.", scenarioDesc: "You're at immigration or city hall. Submit documents, answer official questions, fix paperwork." },
    luca:         { name: "Luca",             personality: "Chatty, enthusiastic hairstylist. Never stops talking. Loves giving unsolicited advice.", scenarioDesc: "You're getting a haircut. Describe what you want, handle suggestions, make small talk." },
  };

  const REL_TIER_INSTRUCTIONS: Record<string, string> = {
    stranger: "You are meeting this person for the first time. Be cold, formal, and brief. Minimal warmth.",
    familiar: "You have seen this person a few times. Be neutral and helpful. Slightly warmer than a stranger.",
    friendly: "You know this person well. Be genuinely warm, engage more personally, maybe mention past visits.",
    close:    "This is someone you consider a regular / close acquaintance. Be enthusiastic, personal, and reference shared history.",
  };

  function getRelTierFromScore(score: number): string {
    if (score >= 80) return "close";
    if (score >= 60) return "friendly";
    if (score >= 30) return "familiar";
    return "stranger";
  }

  function extractJsonFromText(text: string): string {
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) return codeBlock[1].trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return jsonMatch[0];
    return text.trim();
  }

  const LANG_DISPLAY: Record<string, string> = {
    english: "English", spanish: "Spanish", korean: "Korean",
  };

  app.post("/api/npc-chat", async (req: Request, res: Response) => {
    try {
      const { npcId, language, nativeLanguage, relationshipScore, messages, isStart } = req.body as {
        npcId: string;
        language: string;
        nativeLanguage?: string;
        relationshipScore: number;
        messages: { role: "user" | "assistant"; content: string }[];
        isStart?: boolean;
      };

      if (!npcId || !language) {
        return res.status(400).json({ error: "npcId and language required" });
      }

      const npcInfo = NPC_SCENARIOS[npcId];
      if (!npcInfo) return res.status(400).json({ error: "Unknown NPC" });

      const tier = getRelTierFromScore(relationshipScore ?? 0);
      const tierInstruction = REL_TIER_INSTRUCTIONS[tier] ?? REL_TIER_INSTRUCTIONS.stranger;
      const langDisplay = LANG_DISPLAY[language] ?? "English";
      const nativeLangDisplay = LANG_DISPLAY[nativeLanguage ?? "english"] ?? "English";
      const includeTranslation = nativeLangDisplay !== langDisplay;

      const systemPrompt = [
        `You are ${npcInfo.name}, a character in a language learning roleplay app.`,
        `SCENARIO: ${npcInfo.scenarioDesc}`,
        `YOUR PERSONALITY: ${npcInfo.personality}`,
        ``,
        `LANGUAGE: You MUST respond ONLY in ${langDisplay}. Never switch languages.`,
        `RELATIONSHIP LEVEL: ${tier} (${Math.round(relationshipScore ?? 0)}/100)`,
        `RELATIONSHIP BEHAVIOR: ${tierInstruction}`,
        ``,
        `RULES:`,
        `1. Stay completely in character as ${npcInfo.name} in this real-world scenario.`,
        `2. If the user makes a grammar mistake, naturally use the correct form in your reply — DO NOT explain or point out the mistake.`,
        `3. No detailed grammar correction — only natural conversation.`,
        `4. Keep your reply to 1–2 natural sentences, in character.`,
        `5. Evaluate the user's message:`,
        `   • scoreChange +5 = perfect, natural sentence`,
        `   • scoreChange +3 = polite, conversational (minor errors OK)`,
        `   • scoreChange -2 = grammar mistake present`,
        `   • scoreChange -5 = rude or makes no sense`,
        `   • scoreChange 0 = for the opening greeting (isStart)`,
        `6. Choose one emotion: happy, neutral, confused, annoyed, impressed`,
        `7. Provide exactly 3 choices the USER could naturally say next (in ${langDisplay}, relevant to this conversation).`,
        includeTranslation
          ? `   Each choice must include: "text" (${langDisplay}) and "translation" (${nativeLangDisplay}).`
          : `   Each choice is a plain string in ${langDisplay}.`,
        includeTranslation
          ? `8. Include "replyTranslation": a natural ${nativeLangDisplay} translation of your own reply (the "reply" field).`
          : "",
        ``,
        `RESPOND WITH ONLY VALID JSON — no markdown, no code blocks, nothing else:`,
        includeTranslation
          ? `{"reply":"...","replyTranslation":"...","scoreChange":3,"emotion":"happy","choices":[{"text":"...","translation":"..."},{"text":"...","translation":"..."},{"text":"...","translation":"..."}]}`
          : `{"reply":"...","scoreChange":3,"emotion":"happy","choices":["...","...","..."]}`,
      ].join("\n");

      const msgs: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
      ];

      if (isStart) {
        msgs.push({
          role: "user",
          content: `[The user has just arrived. Generate your opening greeting appropriate for a "${tier}" relationship level. scoreChange must be 0. Provide 3 natural opening responses the user could say.]`,
        });
      } else {
        msgs.push(...messages);
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        max_completion_tokens: 300,
        messages: msgs,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const jsonStr = extractJsonFromText(raw);

      type RawChoice = string | { text?: string; translation?: string };
      let parsed: { reply?: string; replyTranslation?: string; scoreChange?: number; emotion?: string; choices?: RawChoice[] };
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        parsed = { reply: raw.trim(), scoreChange: 0, emotion: "neutral", choices: [] };
      }

      const rawChoices: RawChoice[] = Array.isArray(parsed.choices) ? parsed.choices.slice(0, 3) : [];
      const choices = rawChoices.map((c): { text: string; translation: string } => {
        if (typeof c === "string") return { text: c, translation: "" };
        return { text: c.text ?? "", translation: c.translation ?? "" };
      });

      res.json({
        reply:            parsed.reply            ?? "...",
        replyTranslation: (parsed.replyTranslation ?? "").trim() || undefined,
        scoreChange:      typeof parsed.scoreChange === "number" ? Math.max(-10, Math.min(10, parsed.scoreChange)) : 0,
        emotion:          parsed.emotion          ?? "neutral",
        choices,
      });
    } catch (err) {
      console.error("NPC chat error:", err);
      res.status(500).json({ error: "NPC chat failed" });
    }
  });

  // ── Mission Talk Chat (STEP 3) ────────────────────────────────────────────
  app.post("/api/mission-chat", async (req: Request, res: Response) => {
    try {
      const { systemPrompt, targetLang, messages } = req.body as {
        systemPrompt: string;
        targetLang: string;
        messages: { role: "user" | "assistant"; content: string }[];
      };

      if (!systemPrompt || !targetLang || !Array.isArray(messages)) {
        return res.status(400).json({ error: "systemPrompt, targetLang, and messages are required" });
      }

      const LANG_FULL: Record<string, string> = {
        english: "English", spanish: "Spanish", korean: "Korean",
        "en-US": "English", "es-ES": "Spanish", "ko-KR": "Korean",
      };
      const langName = LANG_FULL[targetLang] ?? "English";

      const commonRules = [
        ``,
        `Common rules for all Mission Talk:`,
        `- Speak ONLY in ${langName}`,
        `- Keep sentences short and simple (A1/A2 level)`,
        `- If the player makes grammar mistakes, gently model the correct version in your next line (never say "wrong" or "incorrect")`,
        `- Encourage full sentences, not single words`,
        `- After 5-6 exchanges total, naturally wrap up the conversation`,
        `- IMPORTANT: After EVERY response, you MUST append on a new line exactly this format:`,
        `  [EVAL]{"sentenceCount":N,"grammarNote":"...","shouldEnd":false}[/EVAL]`,
        `  Where N = number of complete sentences the USER has said so far (0 on first message).`,
        `  Set shouldEnd:true after the 5th-6th exchange to close the conversation.`,
        `  grammarNote = brief note on any grammar correction (empty string if none).`,
      ].join("\n");

      const fullSystemPrompt = systemPrompt.replace("{targetLang}", langName) + commonRules;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        max_completion_tokens: 400,
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? "";

      // Parse [EVAL]{...}[/EVAL] block
      const evalMatch = raw.match(/\[EVAL\]([\s\S]*?)\[\/EVAL\]/);
      let sentenceCount = 0;
      let grammarNote = "";
      let shouldEnd = false;
      if (evalMatch) {
        try {
          const evalData = JSON.parse(evalMatch[1]);
          sentenceCount = typeof evalData.sentenceCount === "number" ? evalData.sentenceCount : 0;
          grammarNote = evalData.grammarNote ?? "";
          shouldEnd = evalData.shouldEnd === true;
        } catch {}
      }

      // Strip the [EVAL] block from reply shown to user
      const reply = raw.replace(/\s*\[EVAL\][\s\S]*?\[\/EVAL\]/g, "").trim();

      res.json({ reply, sentenceCount, grammarNote, shouldEnd });
    } catch (err) {
      console.error("Mission chat error:", err);
      res.status(500).json({ error: "Mission chat failed" });
    }
  });

  app.post("/api/word-lookup", async (req: Request, res: Response) => {
    try {
      const { word, targetLanguage, nativeLanguage, sentence } = req.body as {
        word: string;
        targetLanguage: string;
        nativeLanguage: string;
        sentence?: string;
      };
      if (!word || !targetLanguage || !nativeLanguage) {
        return res.status(400).json({ error: "Missing params" });
      }

      const langLabel: Record<string, string> = {
        english: "English", korean: "Korean", spanish: "Spanish",
      };
      const tl = langLabel[targetLanguage] ?? targetLanguage;
      const nl = langLabel[nativeLanguage] ?? nativeLanguage;

      const hasSentence = !!(sentence && sentence.trim());

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_completion_tokens: hasSentence ? 280 : 180,
        messages: [
          {
            role: "system",
            content: [
              `You are a bilingual dictionary. The user speaks ${nl} natively and is learning ${tl}.`,
              `Given a ${tl} word, return ONLY valid JSON (no markdown fences) with these fields:`,
              `"meaning": translation/definition in ${nl} — MUST be non-empty, 1-3 meanings separated by " / "`,
              `"partOfSpeech": one of noun/verb/adjective/adverb/pronoun/conjunction/particle/interjection`,
              `"example": one short natural ${tl} example sentence`,
              hasSentence ? `"sentenceTranslation": translate the full sentence provided by the user into ${nl} — natural, fluent translation` : "",
              `Rules: meaning MUST be in ${nl}. Never return empty strings. Always translate, even for particles or grammar words.`,
            ].filter(Boolean).join(" "),
          },
          { role: "user", content: hasSentence ? `Word: ${word}\nSentence: ${sentence}` : word },
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const jsonStr = extractJsonFromText(raw);
      let parsed: { meaning?: string; partOfSpeech?: string; example?: string; sentenceTranslation?: string };
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        parsed = {};
      }

      const meaning             = (parsed.meaning             ?? "").trim();
      const partOfSpeech        = (parsed.partOfSpeech        ?? "").trim();
      const example             = (parsed.example             ?? "").trim();
      const sentenceTranslation = (parsed.sentenceTranslation ?? "").trim();

      if (!meaning) {
        const retry = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_completion_tokens: 80,
          messages: [
            { role: "system", content: `Translate this ${tl} word/phrase to ${nl}. Return ONLY the translation, nothing else.` },
            { role: "user", content: word },
          ],
        });
        const fallbackMeaning = (retry.choices[0]?.message?.content ?? "").trim();
        return res.json({ word, meaning: fallbackMeaning || word, partOfSpeech, example, sentenceTranslation });
      }

      res.json({ word, meaning, partOfSpeech, example, sentenceTranslation });
    } catch (err) {
      console.error("Word lookup error:", err);
      res.status(500).json({ error: "Word lookup failed" });
    }
  });

  app.post("/api/handwriting-recognize", async (req: Request, res: Response) => {
    try {
      const { imageBase64, lang } = req.body as { imageBase64: string; lang: string };
      if (!imageBase64) return res.status(400).json({ error: "Missing imageBase64" });

      const langLabel: Record<string, string> = {
        english: "English", korean: "Korean", spanish: "Spanish",
      };
      const langName = langLabel[lang] ?? "English";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        max_completion_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageBase64, detail: "high" },
              },
              {
                type: "text",
                text: `This image contains handwritten text in ${langName}. Please read and transcribe the handwritten text exactly as written. Return ONLY the transcribed text with no extra explanation. If the handwriting is unclear or partial, do your best to interpret it.`,
              },
            ],
          },
        ],
      });

      const recognized = (completion.choices[0]?.message?.content ?? "").trim();
      res.json({ recognized });
    } catch (err) {
      console.error("Handwriting recognize error:", err);
      res.status(500).json({ error: "Recognition failed" });
    }
  });

  // ── Quiz Evaluate (GPT-4o) ──────────────────────────────────────────────────
  app.post("/api/quiz-evaluate", async (req: Request, res: Response) => {
    try {
      const { systemPrompt, userMessage } = req.body as {
        systemPrompt: string;
        userMessage: string;
      };
      if (!systemPrompt || !userMessage) {
        return res.status(400).json({ error: "systemPrompt and userMessage required" });
      }
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.4,
        max_completion_tokens: 400,
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      res.json({ reply: raw });
    } catch (err) {
      console.error("Quiz evaluate error:", err);
      res.status(500).json({ error: "Evaluation failed" });
    }
  });

  // ── Quiz Roleplay Chat (GPT-4o, custom system prompt) ───────────────────────
  app.post("/api/quiz-roleplay", async (req: Request, res: Response) => {
    try {
      const { npcSystemPrompt, userMessage, history } = req.body as {
        npcSystemPrompt: string;
        userMessage: string;
        history?: { role: "user" | "assistant"; content: string }[];
      };
      if (!npcSystemPrompt || !userMessage) {
        return res.status(400).json({ error: "npcSystemPrompt and userMessage required" });
      }
      const msgs: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: npcSystemPrompt },
        ...(history ?? []).map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: userMessage },
      ];
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: msgs,
        temperature: 0.7,
        max_completion_tokens: 600,
      });
      const raw = completion.choices[0]?.message?.content ?? "...";
      let parsedReply = raw;
      let extra: Record<string, unknown> = {};
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const json = JSON.parse(jsonMatch[0]);
          parsedReply = json.npcResponse ?? json.reply ?? raw;
          extra = json;
        }
      } catch { /* not JSON, use raw */ }
      res.json({ reply: parsedReply, ...extra });
    } catch (err) {
      console.error("Quiz roleplay error:", err);
      res.status(500).json({ error: "Roleplay failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
