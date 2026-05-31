import type { Express, Request, RequestHandler, Response } from "express";
import { createServer, type Server } from "node:http";
import { openai } from "./openai";
import { anthropic, hasAnthropic } from "./anthropic";
import { completeImageText, completeText } from "./aiText";
import {
  getServiceRoleClient,
  hasServiceRole,
  verifySupabaseJwt,
} from "./supabaseAdmin";
import { gptLimiter, ttsLimiter, sttLimiter, keyFromReq } from "./rateLimits";
import { optionalAuth, requireAuth } from "./authMiddleware";
import rateLimit from "express-rate-limit";
import { moderateText, safeReplyFor, shouldSkipModeration } from "./moderation";
import {
  applySubscriptionEvent,
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  isStripeConfigured,
  verifyWebhookSignature,
} from "./billing";

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

/**
 * Voice endpoints (/api/stt, /api/pronunciation-assessment) handle learner audio.
 * In production, the recognized text is PII — it's literally what the user said
 * out loud. Production hosts (Railway/Vercel) retain logs for ~30 days, so any
 * raw transcript or full provider payload would be quietly archived per request.
 *
 * `isVerboseVoiceLogging()` is true only outside production. Use it to gate any
 * log line that includes recognized text, DisplayText, or a sliced provider
 * response. Production paths should log only request shape (byte size, mime,
 * status) plus opaque score bands — never the spoken content itself.
 */
function isVerboseVoiceLogging(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Length-only summary of a transcript for production logs (no content). */
function redactTranscript(text: string | undefined | null): string {
  if (!text) return "(empty)";
  return `(${text.length} chars)`;
}

/**
 * Centralised error log for upstream provider (Azure / Google) failures.
 * In dev mode the raw response body is preserved (debugging). In production
 * we only emit `(N chars)` so partial recognition fragments, audio metadata,
 * or anything else the provider may include in error bodies cannot be
 * silently archived in Railway/Vercel logs (~30-day retention).
 *
 * Call this from every `if (!res.ok)` branch instead of `console.error(scope, status, body)`.
 */
function logProviderError(scope: string, status: number, body: string | undefined | null): void {
  if (isVerboseVoiceLogging()) {
    console.error(scope, status, body ?? "(empty)");
  } else {
    const length = body?.length ?? 0;
    console.error(scope, status, `(${length} chars)`);
  }
}

function sendVoiceServiceUnavailable(res: Response, scope: string): Response {
  console.error(`${scope} unavailable: missing provider configuration`);
  return res.status(503).json({ error: "Voice service unavailable" });
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

  dewi: `You are Dewi, a warm Indonesian tutor from Jakarta. Your personality is friendly, clear, and gently playful. Teach natural Bahasa Indonesia for real situations: travel, food, directions, daily chat, and polite requests. When the student makes a grammar, word-choice, or pronunciation-related mistake: (1) acknowledge it kindly, (2) give the corrected Indonesian sentence, (3) briefly explain why it sounds more natural, (4) invite them to try again. Use natural Indonesian, not English, for the main reply. You may include a short native-language explanation only when requested by the lesson protocol. Keep responses to 3-4 short spoken sentences. Stay in character as Dewi.`,

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
  dewi: `You are in SAVAGE COMEDY MODE as Dewi, a Jakarta Indonesian tutor. Roast mistakes with playful Indonesian banter, never cruelty. React with spoken laughter such as "haha, tunggu dulu" or "wah, hampir sekali". Always respond in Indonesian, give the corrected sentence, and wrap the teaching in friendly comedy. Keep responses to 3-4 short spoken sentences. Stay in character as Dewi.`,
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
  if (["dewi"].includes(id)) return "Indonesian";
  return "the target language";
}

function shouldReturnChatFallback(err: unknown): boolean {
  const status = typeof (err as { status?: unknown })?.status === "number"
    ? (err as { status: number }).status
    : undefined;
  const text = [
    (err as { message?: unknown })?.message,
    (err as { error?: { message?: unknown } })?.error?.message,
  ].filter((value): value is string => typeof value === "string").join(" ").toLowerCase();
  return (
    status === 400 ||
    status === 429 ||
    text.includes("insufficient_quota") ||
    text.includes("credit balance") ||
    text.includes("too many requests")
  );
}

function summarizeAiProviderFailure(err: unknown): string {
  const status = typeof (err as { status?: unknown })?.status === "number"
    ? `status=${(err as { status: number }).status}`
    : "status=unknown";
  const name = typeof (err as { name?: unknown })?.name === "string"
    ? (err as { name: string }).name
    : "Error";
  return `${name} ${status}`;
}

function offlineChatReplyFor(tutorId: string | undefined, nativeLang: string | undefined): string {
  const id = (tutorId ?? "").toLowerCase();
  if (id === "dewi") {
    return "Maaf, koneksi AI sedang bermasalah. Kita tetap bisa latihan: coba ucapkan satu kalimat pendek dalam bahasa Indonesia.";
  }
  const lang = tutorLanguageFullName(id);
  if (lang === "Spanish") {
    return "Perdón, la conexión de IA está fallando. Sigamos con una frase corta: escribe o di una oración sencilla en español.";
  }
  if (lang === "Korean") {
    return "죄송해요, 지금 AI 연결이 불안정해요. 그래도 짧은 한국어 문장 하나로 계속 연습해 볼까요?";
  }
  if (nativeLang === "id") {
    return "Maaf, koneksi AI sedang bermasalah. Coba lagi sebentar lagi, atau latih satu kalimat pendek dulu.";
  }
  return "Sorry, the AI connection is having trouble. We can still practice: try one short sentence and then tap again.";
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
  // Run optional Supabase JWT verification on every /api/* request so the
  // rate-limit middlewares can key on a VERIFIED user.id (req.userId) rather
  // than a forgeable JWT payload. Missing / invalid tokens fall through as
  // anonymous — they just land in the IP-tier bucket.
  app.use("/api", optionalAuth);

  app.post("/api/chat", gptLimiter, async (req: Request, res: Response) => {
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
        nativeLang?: "ko" | "en" | "es" | "id";
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

      // ── Content moderation on latest user message ────────────────────────
      // Run before any GPT call so flagged content costs us $0. Skip very short
      // Korean utterances (greetings / noise) to save quota — `shouldSkipModeration`
      // enforces the <20 chars + Hangul rule.
      const latestUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (latestUserMsg && typeof latestUserMsg.content === "string" && !shouldSkipModeration(latestUserMsg.content)) {
        const mod = await moderateText(latestUserMsg.content);
        if (mod.flagged) {
          console.log(`[/api/chat] moderation flagged category=${mod.category ?? "unknown"}`);
          return res.json({
            reply: safeReplyFor(nativeLang),
            correction: null,
            diagnosis: null,
            phaseAdvance: null,
            sessionSummary: null,
            moderated: true,
          });
        }
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
        ko: "Korean", en: "English", es: "Spanish", id: "Indonesian",
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

      const raw = await completeText({
        taskLabel: "/api/chat",
        model: "gpt-4o",
        maxTokens: 350,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }) || "...";

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
      if (shouldReturnChatFallback(err)) {
        const body = (req.body && typeof req.body === "object" ? req.body : {}) as {
          tutorId?: string;
          nativeLang?: string;
        };
        console.warn("[/api/chat] AI providers unavailable; returning offline fallback:", summarizeAiProviderFailure(err));
        return res.json({
          reply: offlineChatReplyFor(body.tutorId, body.nativeLang),
          correction: null,
          diagnosis: null,
          phaseAdvance: null,
          sessionSummary: null,
          aiUnavailable: true,
        });
      }
      console.error("[/api/chat] unexpected error:", err);
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
        learningLang: "ko" | "en" | "es" | "id" | "korean" | "english" | "spanish" | "indonesian";
        nativeLang?: "ko" | "en" | "es" | "id";
      };

      if (!promptText || !userAnswer) {
        return res.status(400).json({ error: "promptText and userAnswer are required" });
      }

      const nativeName = ({ ko: "Korean", en: "English", es: "Spanish", id: "Indonesian" } as const)[(nativeLang ?? "ko") as "ko" | "en" | "es" | "id"] ?? "English";
      const learnName = (() => {
        const ll = String(learningLang ?? "").toLowerCase();
        if (ll.startsWith("ko")) return "Korean";
        if (ll.startsWith("es") || ll.startsWith("sp")) return "Spanish";
        if (ll.startsWith("id") || ll.startsWith("indo")) return "Indonesian";
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
          const raw = await completeText({
            taskLabel: "/api/writing-eval",
            model: "gpt-4o",
            maxTokens: 500,
            responseFormat: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMsg },
            ],
          }) || "{}";
          parsed = JSON.parse(raw);
          source = source === "claude-sonnet-4-5" ? "claude-failed-gpt-fallback" : "gpt-4o";
        } catch (e) {
          console.error("[/api/writing-eval] Both Claude and GPT failed:", e);
          return res.status(500).json({ error: "Failed to evaluate writing" });
        }
      }

      const evalResult = parsed ?? {};
      let score = typeof evalResult.score === "number" && evalResult.score >= 0 && evalResult.score <= 100
        ? Math.round(evalResult.score)
        : 50;
      const feedback = typeof evalResult.feedback === "string" ? evalResult.feedback.slice(0, 500) : "";
      const corrections = typeof evalResult.corrections === "string" ? evalResult.corrections.slice(0, 500) : "";

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

  app.post("/api/translate", gptLimiter, async (req: Request, res: Response) => {
    try {
      const { text, targetLanguage } = req.body as {
        text: string;
        targetLanguage: string;
      };

      if (!text || !targetLanguage) {
        return res.status(400).json({ error: "text and targetLanguage are required" });
      }

      const translation = await completeText({
        taskLabel: "/api/translate",
        model: "gpt-4o",
        maxTokens: 300,
        messages: [
          {
            role: "system",
            content: `You are a translation assistant. Translate the user's text into ${targetLanguage}. Return ONLY the translated text with no explanation, no quotes, no prefixes.`,
          },
          { role: "user", content: text },
        ],
      });
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
    dewi:   { voice: "id-ID-GadisNeural",  lang: "id-ID" }, // female ✓ (Indonesian)
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
    sujin:     "ko-KR-Neural2-B",  // 수진 — 차분한 여성
    minho_tutor: "ko-KR-Neural2-C", // 민호 — 젊은 남성 (tutor alias)
    // NPCs with specific voices
    youngsook: "ko-KR-Neural2-A",  // 할머니 영숙 — 따뜻한 여성
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
      logProviderError("Google TTS error:", res.status, errText);
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
        return sendVoiceServiceUnavailable(res, "Tutor TTS");
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
        logProviderError("Azure TTS error:", azureRes.status, azureErr);
        return res.status(502).json({ error: "TTS failed" });
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
    "id-ID": "id-ID-GadisNeural",
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

  app.get("/api/pronunciation-tts", ttsLimiter, async (req: Request, res: Response) => {
    try {
      const { text, lang, tutorId, mode, voice, rate } = req.query as {
        text?: string;
        lang?: string;
        tutorId?: string;
        mode?: string;
        voice?: string;
        rate?: string;
      };
      if (!text || !lang) {
        return res.status(400).json({ error: "text and lang required" });
      }

      const key = process.env.AZURE_SPEECH_KEY?.trim();
      const region = process.env.AZURE_SPEECH_REGION?.trim();
      if (!key || !region) {
        return sendVoiceServiceUnavailable(res, "Pronunciation TTS");
      }

      const voiceName = voice ?? AZURE_TTS_VOICES[lang] ?? "en-US-JennyNeural";

      // ── Korean pronunciation → Google Cloud TTS ──
      if (lang?.startsWith("ko")) {
        const gVoice = (tutorId && GOOGLE_KO_VOICES[tutorId]) || AZURE_KO_TO_GOOGLE[voiceName] || "ko-KR-Neural2-A";
        const gRate = mode === "slow" || rate === "-20%" ? 0.7 : 0.95;
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

      const explicitRate = typeof rate === "string" && /^[-+]?\d+%$/.test(rate) ? rate : undefined;
      const prosodyRate = explicitRate ?? (mode === "slow" ? "-30%" : "-5%");
      const leadingBreak = lang.toLowerCase().startsWith("id") ? `<break time="180ms"/>` : "";
      const textContent = mode === "letter"
        ? `<say-as interpret-as="characters">${safeText}</say-as>`
        : safeText;
      const ssml = [
        `<speak version="1.0"`,
        ` xmlns="http://www.w3.org/2001/10/synthesis"`,
        ` xml:lang="${lang}">`,
        `<voice name="${voiceName}">`,
        `${leadingBreak}<prosody rate="${prosodyRate}">${textContent}</prosody>`,
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
        logProviderError("Azure pronunciation TTS error:", azureRes.status, errText);
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
  app.post("/api/stt", sttLimiter, async (req: Request, res: Response) => {
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
        return sendVoiceServiceUnavailable(res, "STT");
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
        body: wavBuffer as unknown as BodyInit,
        signal: sttController.signal,
      });

      if (!azureRes.ok) {
        const errText = await azureRes.text();
        logProviderError("[stt] Azure error:", azureRes.status, errText);
        return res.status(502).json({ error: "STT failed" });
      }

      const data = (await azureRes.json()) as { RecognitionStatus: string; DisplayText?: string; NBest?: { Display?: string; Lexical?: string }[] };
      const text = data.DisplayText ?? data.NBest?.[0]?.Display ?? "";
      // PII guard: never log raw learner transcripts in production.
      if (isVerboseVoiceLogging()) {
        console.log(`[stt] Azure status=${data.RecognitionStatus}  text="${text}"`);
      } else {
        console.log(`[stt] Azure status=${data.RecognitionStatus}  text=${redactTranscript(text)}`);
      }
      res.json({ text, status: data.RecognitionStatus });
    } catch (err) {
      console.error("[stt] error:", err);
      res.status(500).json({ error: "STT failed" });
    }
  });

  // ── Indonesian STT-based pronunciation fallback helpers ───────────────────
  // Azure Pronunciation Assessment has no id-ID model, so for Indonesian we
  // transcribe with plain Azure STT and approximate a pronunciation score from
  // how well the recognised text matches the target phrase.

  // Lowercase, strip punctuation, fold the few common Indonesian-adjacent
  // diacritics, and collapse whitespace. Keeps latin letters + digits + spaces.
  function normalizeIdText(s: string): string {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")         // strip combining diacritics
      .replace(/\bdimana\b/g, "di mana")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")       // drop punctuation
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenizeId(s: string): string[] {
    const n = normalizeIdText(s);
    return n.length ? n.split(" ") : [];
  }

  // Standard Levenshtein edit distance between two strings.
  function levenshtein(a: string, b: string): number {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    let prev = new Array(b.length + 1);
    let curr = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) prev[j] = j;
    for (let i = 1; i <= a.length; i++) {
      curr[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      }
      [prev, curr] = [curr, prev];
    }
    return prev[b.length];
  }

  // 1.0 = identical, 0.0 = completely different (normalized edit-distance ratio).
  function levenshteinRatio(a: string, b: string): number {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(a, b) / maxLen;
  }

  function clamp01to100(n: number): number {
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function indonesianTokenSimilarity(target: string, said: string): number {
    if (target === said) return 1;
    if (!target || !said) return 0;

    const editRatio = levenshteinRatio(target, said);
    const minLen = Math.min(target.length, said.length);
    const maxLen = Math.max(target.length, said.length);

    // Azure STT often trims Indonesian suffixes or final vowels on short
    // survival phrases, e.g. "ulangi" -> "ulang". Treat close stems as
    // mostly correct while still failing unrelated words.
    const stemLike = minLen >= 4 && maxLen - minLen <= 2 && (target.startsWith(said) || said.startsWith(target));
    if (stemLike) return Math.max(editRatio, 0.86);

    return editRatio;
  }

  function bestIndonesianTokenScore(target: string, saidTokens: string[]): number {
    let best = 0;
    for (const said of saidTokens) {
      best = Math.max(best, indonesianTokenSimilarity(target, said));
    }
    return best;
  }

  // Azure Speech REST content-type for a client-reported mime — used when we
  // send the RAW (un-converted) buffer because ffmpeg was unavailable. Sending
  // raw webm/m4a mislabeled as "WAV PCM" makes Azure fail to decode the audio
  // ("no voice detected"). The ko/en/es path already labels correctly; the id
  // path hardcoded WAV, which is why Indonesian assessment broke without ffmpeg.
  function azureContentTypeForMime(mime: string | undefined): string {
    const m = (mime ?? "").toLowerCase();
    if (!m) return "audio/wav; codecs=audio/pcm; samplerate=16000";
    if (m.includes("wav") || m.includes("pcm")) return "audio/wav; codecs=audio/pcm; samplerate=16000";
    if (m.includes("mp4") || m.includes("m4a") || m.includes("aac")) return "audio/mp4";
    if (m.includes("webm")) return "audio/webm; codecs=opus";
    if (m.includes("ogg") || m.includes("opus")) return "audio/ogg; codecs=opus";
    return "audio/wav; codecs=audio/pcm; samplerate=16000";
  }

  // Convert any audio buffer → 16kHz mono WAV PCM (same recipe the Azure
  // pronunciation path and /api/stt use). Falls back to the raw buffer if
  // ffmpeg is unavailable.
  async function convertTo16kMonoWav(rawBuffer: Buffer, mimeType?: string): Promise<{ buffer: Buffer; contentType: string }> {
    const { spawn } = await import("child_process");
    const { writeFile, unlink, readFile } = await import("fs/promises");
    const { randomUUID } = await import("crypto");
    const { tmpdir } = await import("os");
    const { join } = await import("path");

    const inputPath = join(tmpdir(), `pa-id-in-${randomUUID()}`);
    const outputPath = join(tmpdir(), `pa-id-out-${randomUUID()}.wav`);
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
      const wav = await readFile(outputPath);
      console.log(`[assess-id] ffmpeg ok → ${wav.length}B WAV`);
      return { buffer: wav, contentType: "audio/wav; codecs=audio/pcm; samplerate=16000" };
    } catch (convErr) {
      console.error("[assess-id] ffmpeg unavailable, sending raw audio with its real content-type:", (convErr as Error).message);
      return { buffer: rawBuffer, contentType: azureContentTypeForMime(mimeType) };
    } finally {
      await unlink(inputPath).catch(() => {});
      await unlink(outputPath).catch(() => {});
    }
  }

  // Build the standard pronunciation-assess success/failure payload for id-ID
  // using plain Azure STT. Returns the SAME shape the ko/en/es path returns so
  // the client needs no changes.
  async function assessViaStt(args: {
    res: Response;
    key: string;
    region: string;
    word: string;
    audio: string;
    mimeType?: string;
  }): Promise<Response> {
    const { res, key, region, word, audio, mimeType } = args;
    const sttLang = "id-ID";

    const rawBuffer = Buffer.from(audio, "base64");
    console.log(`[assess-id] raw=${rawBuffer.length}B  mime=${mimeType}  lang=${sttLang}  word="${word}"`);
    const { buffer: wavBuffer, contentType: sttContentType } = await convertTo16kMonoWav(rawBuffer, mimeType);

    // Indonesian-aware "no voice detected" failure payload.
    const noVoicePayload = (status: string, recognizedText: string) => ({
      success: false as const,
      score: 0,
      accuracyScore: 0,
      fluencyScore: 0,
      completenessScore: 0,
      recognizedText,
      feedback: `Suara tidak terdeteksi (${status}). Coba bicara lebih keras dan jelas.`,
      words: [] as Array<{ word: string; score: number; errorType: string }>,
    });

    let data: {
      RecognitionStatus?: string;
      DisplayText?: string;
      NBest?: { Lexical?: string; Display?: string; Confidence?: number }[];
    };
    try {
      const sttController = new AbortController();
      setTimeout(() => sttController.abort(), 15000);
      const azureRes = await fetch(
        `https://${region}.stt.speech.microsoft.com/speech/recognition/interactive` +
          `/cognitiveservices/v1?language=${encodeURIComponent(sttLang)}&format=detailed`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": sttContentType,
          },
          body: wavBuffer as unknown as BodyInit,
          signal: sttController.signal,
        }
      );
      if (!azureRes.ok) {
        const errText = await azureRes.text();
        logProviderError("[assess-id] Azure STT HTTP error:", azureRes.status, errText);
        return res.status(500).json({ error: "Azure assessment failed" });
      }
      data = await azureRes.json();
    } catch (err) {
      console.error("[assess-id] Azure STT request failed:", err);
      return res.status(500).json({ error: "Azure assessment failed" });
    }

    const status = data.RecognitionStatus ?? "Unknown";
    const nb0 = data.NBest?.[0];
    const displayText = data.DisplayText ?? nb0?.Display ?? "";
    const lexical = nb0?.Lexical ?? displayText;
    if (isVerboseVoiceLogging()) {
      console.log(`[assess-id] Azure status=${status}  display="${displayText}"  lexical="${lexical}"`);
    } else {
      console.log(`[assess-id] Azure status=${status}  display=${redactTranscript(displayText)}`);
    }

    if (status !== "Success" || !displayText.trim()) {
      return res.json(noVoicePayload(status, displayText));
    }

    // ── Token + edit-distance scoring ──────────────────────────────────────
    const targetTokens = tokenizeId(word);
    const saidTokens = tokenizeId(lexical || displayText);
    const tokenScores = targetTokens.map((t) => bestIndonesianTokenScore(t, saidTokens));
    const matched = tokenScores.filter((s) => s >= 0.78).length;
    const similarity = tokenScores.length > 0
      ? tokenScores.reduce((acc, s) => acc + s, 0) / tokenScores.length
      : 0;

    const targetJoined = targetTokens.join(" ");
    const saidJoined = saidTokens.join(" ");
    const levRatio = levenshteinRatio(targetJoined, saidJoined);
    const simRefined = 0.6 * similarity + 0.4 * levRatio;

    const confidence = typeof nb0?.Confidence === "number" ? nb0!.Confidence! : 0.8;

    let score = clamp01to100(100 * (0.7 * simRefined + 0.3 * confidence));
    const fluencyScore = clamp01to100(confidence * 100);
    const completenessScore = targetTokens.length > 0
      ? clamp01to100((matched / targetTokens.length) * 100)
      : 0;

    // Per-target-token word breakdown.
    const words = targetTokens.map((t, index) => {
      const tokenScore = tokenScores[index] ?? 0;
      const present = tokenScore >= 0.78;
      return { word: t, score: clamp01to100(tokenScore * 100), errorType: present ? "None" : "Omission" };
    });

    // Templated Indonesian feedback by band (used directly, or when GPT is skipped/fails).
    function templatedFeedbackId(s: number): string {
      if (s >= 90) return "Pengucapan sempurna! Kerja bagus!";
      if (s >= 75) return `Bagus! Sedikit latihan lagi dan kamu akan menguasainya. (akurasi: ${s})`;
      if (s >= 50) return `Perlu latihan. Ucapkan setiap suku kata perlahan dan jelas. (akurasi: ${s})`;
      return "Coba lagi! Dengarkan dulu pengucapan asli dengan tombol suara.";
    }

    let accuracyScore = score;
    let feedback = templatedFeedbackId(score);

    // ── Optional GPT intelligibility judgment for borderline results ─────────
    // Skip when clearly pass (>0.85) or clearly fail (<0.4) to keep latency sane.
    if (simRefined >= 0.4 && simRefined <= 0.85) {
      try {
        const raw = await completeText({
          taskLabel: "/api/pronunciation-assess#id",
          model: "gpt-4o-mini",
          temperature: 0.3,
          maxTokens: 120,
          responseFormat: { type: "json_object" },
          messages: [
            {
              role: "user",
              content:
                `Target Indonesian phrase: "${word}". ` +
                `Learner said (STT): "${displayText}". ` +
                `Rate intelligibility 0-100 (did they produce the target words?). ` +
                `Reply ONLY JSON {"score":N,"note":"<short Indonesian tip>"}.`,
            },
          ],
        });
        const parsed = JSON.parse(raw) as { score?: unknown; note?: unknown };
        const gptScore = typeof parsed.score === "number" ? clamp01to100(parsed.score) : null;
        const note = typeof parsed.note === "string" ? parsed.note.trim() : "";
        if (gptScore !== null) {
          score = clamp01to100(0.5 * score + 0.5 * gptScore);
          accuracyScore = score;
          feedback = note || templatedFeedbackId(score);
        }
      } catch (e) {
        console.warn("[assess-id] GPT judgment failed, using formula score:", (e as Error)?.message ?? e);
        // feedback / score already hold the formula-based values.
      }
    }

    return res.json({
      success: true,
      score,
      accuracyScore,
      fluencyScore,
      completenessScore,
      recognizedText: displayText,
      feedback,
      words,
    });
  }

  // ── GPT Pronunciation Scoring ─────────────────────────────────────────────
  // Receives the target word and what the speech recogniser heard, then asks
  // Azure Pronunciation Assessment — sends real audio to Azure's phoneme-level scorer.
  // Accepts { word, lang, audio (base64), mimeType } and returns detailed pronunciation scores.
  app.post("/api/pronunciation-assess", gptLimiter, async (req: Request, res: Response) => {
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
        return sendVoiceServiceUnavailable(res, "Pronunciation assessment");
      }

      // ── Indonesian (id-ID) fallback ─────────────────────────────────────────
      // Azure Pronunciation Assessment does NOT support id-ID. We approximate a
      // score from a plain Azure STT transcription (id-ID IS supported by STT):
      // normalize + token-match the recognised text against the target phrase,
      // optionally refining a borderline result with a GPT intelligibility check.
      // Returns the EXACT same response shape the ko/en/es path returns.
      if (lang === "id-ID" || lang.toLowerCase().startsWith("id")) {
        return await assessViaStt({ res, key, region, word, audio, mimeType });
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
        const m = (mime ?? "").toLowerCase();
        if (!m) return "audio/wav; codecs=audio/pcm; samplerate=16000";
        if (m.includes("wav") || m.includes("pcm")) return "audio/wav; codecs=audio/pcm; samplerate=16000";
        if (m.includes("mp4") || m.includes("m4a") || m.includes("aac")) return "audio/mp4";
        if (m.includes("webm")) return "audio/webm; codecs=opus";
        if (m.includes("ogg") || m.includes("opus")) return "audio/ogg; codecs=opus";
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
          body: wavBuffer as unknown as BodyInit,
          signal: assessController.signal,
        }
      );

      if (!azureRes.ok) {
        const errText = await azureRes.text();
        logProviderError("[assess] Azure HTTP error:", azureRes.status, errText);
        return res.status(500).json({ error: "Azure assessment failed" });
      }

      // Azure may return scores nested under PronunciationAssessment OR flat on NBest[0]
      const data = await azureRes.json();
      // PII guard: full Azure response includes DisplayText and per-word phoneme
      // confidence — strict dev-only. Production logs see only status + score band.
      if (isVerboseVoiceLogging()) {
        console.log(`[assess] Azure full response:`, JSON.stringify(data).slice(0, 2000));
      }

      const nb0 = (data as any).NBest?.[0];
      // Support both nested (PronunciationAssessment.PronScore) and flat (PronScore) formats
      const pa = nb0?.PronunciationAssessment;
      const pronScoreRaw = pa?.PronScore ?? nb0?.PronScore;
      const hasPronScore = pronScoreRaw != null;
      // PII guard: DisplayText is the raw learner transcript. Production logs only
      // a content-free summary (length + score band).
      if (isVerboseVoiceLogging()) {
        console.log(`[assess] Azure status=${data.RecognitionStatus}  display="${data.DisplayText}"  hasPronScore=${hasPronScore}  PronScore=${pronScoreRaw}  nested=${pa != null}`);
      } else {
        console.log(`[assess] Azure status=${data.RecognitionStatus}  display=${redactTranscript(data.DisplayText)}  hasPronScore=${hasPronScore}  PronScore=${pronScoreRaw}`);
      }

      // Localized feedback helper based on sttLang
      const isKo = sttLang.startsWith("ko");
      const isEs = sttLang.startsWith("es");
      function localFeedback(ko: string, en: string, es: string) {
        return isKo ? ko : isEs ? es : en;
      }

      if (data.RecognitionStatus !== "Success" || !hasPronScore) {
        return res.json({
          success: false,
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
        success: true,
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

  // ─── Pronunciation coaching (GPT-4o-mini layered on Azure score) ────────────
  //
  // Azure tells you NUMBERS (75 / 60 / 90). Korean learners need to be told
  // WHY in their own language and HOW to fix it — that's what this endpoint
  // generates: 1-2 warm, specific sentences in ko / en / es, returned as a
  // single JSON so we cache once per (word, score-band) and serve all three
  // native-language readers from the same hit.
  //
  // Called by the client AFTER /api/pronunciation-assess returns, so the
  // score circle paints immediately and the coaching card fades in over it.
  //
  // Cache: in-process LRU keyed by `${word}|${lang}|${band}|${weakKey}` so a
  // tester repeating "family" with the same weak phoneme gets a snappy reply.
  type CoachComment = { ko: string; en: string; es: string; id: string };
  type CacheEntry = { value: CoachComment; at: number };
  const COACH_CACHE = new Map<string, CacheEntry>();
  // In-flight requests by cache key — coalesces concurrent identical lookups
  // so we don't fire the same GPT call multiple times before the first one
  // populates the cache (QA Bug N1).
  const COACH_IN_FLIGHT = new Map<string, Promise<CoachComment>>();
  const COACH_CACHE_MAX = 200;
  const COACH_CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

  function coachBand(score: number): string {
    if (score >= 90) return "great";
    if (score >= 75) return "good";
    if (score >= 50) return "fair";
    return "weak";
  }

  function fallbackCoach(word: string, score: number, weakPhonemes: string[]): CoachComment {
    const band = coachBand(score);
    const wKo = weakPhonemes.length > 0 ? ` (특히 ${weakPhonemes.join(", ")} 소리에 주의해 보세요.)` : "";
    const wEn = weakPhonemes.length > 0 ? ` Watch out for: ${weakPhonemes.join(", ")}.` : "";
    const wEs = weakPhonemes.length > 0 ? ` Presta atención a: ${weakPhonemes.join(", ")}.` : "";
    const wId = weakPhonemes.length > 0 ? ` Perhatikan bunyi: ${weakPhonemes.join(", ")}.` : "";
    if (band === "great") {
      return {
        ko: `"${word}" 정말 자연스러웠어요! 이대로 계속 가봐요. 🎉`,
        en: `Your "${word}" sounded natural — keep it up! 🎉`,
        es: `¡Tu "${word}" sonó natural — así se hace! 🎉`,
        id: `"${word}" terdengar natural. Pertahankan, ya! 🎉`,
      };
    }
    if (band === "good") {
      return {
        ko: `"${word}" 거의 다 왔어요. 한 번만 더 듣고 따라 해볼까요?${wKo}`,
        en: `"${word}" was close — listen once more and give it another shot.${wEn}`,
        es: `"${word}" estuvo cerca — escucha una vez más e inténtalo.${wEs}`,
        id: `"${word}" sudah hampir tepat. Dengarkan sekali lagi, lalu coba ulangi.${wId}`,
      };
    }
    if (band === "fair") {
      return {
        ko: `"${word}"의 음절을 천천히 끊어서 발음해 보세요. 듣기 버튼이 도움이 될 거예요.${wKo}`,
        en: `For "${word}", slow down each syllable. The listen button helps.${wEn}`,
        // FIX (es): "reduce cada sílaba" was a mistranslation (reducir = shrink),
        // not "slow down". Use "pronuncia cada sílaba más despacio".
        es: `Para "${word}", pronuncia cada sílaba más despacio. El botón de altavoz ayuda.${wEs}`,
        id: `Untuk "${word}", perlambat tiap suku kata. Tombol dengar bisa membantu.${wId}`,
      };
    }
    return {
      // FIX (ko): "우리는 천천히 가요" was a calque — replaced with natural 함께 가봐요.
      ko: `먼저 듣기 버튼으로 "${word}"의 원어민 발음을 들어봐요. 천천히 함께 가봐요. 🦊`,
      en: `Start by listening to "${word}" with the speaker button. We'll take it slow. 🦊`,
      es: `Empieza escuchando "${word}" con el botón de altavoz. Vamos despacio. 🦊`,
      id: `Mulai dengan mendengarkan "${word}" lewat tombol speaker. Kita pelan-pelan dulu. 🦊`,
    };
  }

  function pruneCoachCache() {
    if (COACH_CACHE.size <= COACH_CACHE_MAX) return;
    // Drop the oldest 20% to amortize eviction cost.
    const entries = [...COACH_CACHE.entries()].sort((a, b) => a[1].at - b[1].at);
    const drop = Math.ceil(COACH_CACHE_MAX * 0.2);
    for (let i = 0; i < drop && i < entries.length; i++) {
      COACH_CACHE.delete(entries[i][0]);
    }
  }

  app.post("/api/pronunciation-coach", gptLimiter, async (req: Request, res: Response) => {
    try {
      const {
        word,
        lang,                  // BCP-47 (en-US / es-ES / ko-KR / id-ID)
        nativeLang,            // ko / en / es / id (ISO-like)
        score,
        accuracyScore,
        fluencyScore,
        completenessScore,
        recognizedText,
        weakPhonemes,          // string[] (IPA chars) — optional
      } = req.body as {
        word?: string;
        lang?: string;
        nativeLang?: string;
        score?: number;
        accuracyScore?: number;
        fluencyScore?: number;
        completenessScore?: number;
        recognizedText?: string;
        weakPhonemes?: string[];
      };

      if (!word || typeof score !== "number" || !lang) {
        return res.status(400).json({ error: "word, lang, and numeric score are required" });
      }

      const trimmedWord = word.slice(0, 60);
      // Normalize weak phonemes so ["t","r"] and ["r","t"] hit the same cache
      // entry (QA Bug 4). Sort + lowercase keeps the key canonical.
      const weak = Array.isArray(weakPhonemes)
        ? [...new Set(weakPhonemes.map((p) => String(p).toLowerCase()))].slice(0, 6).sort()
        : [];
      const band = coachBand(score);
      const cacheKey = `${trimmedWord.toLowerCase()}|${lang}|${band}|${weak.join(",")}`;

      // Cache hit — instant return.
      const cached = COACH_CACHE.get(cacheKey);
      if (cached && Date.now() - cached.at < COACH_CACHE_TTL) {
        return res.json({ ...cached.value, cached: true });
      }

      // Coalesce concurrent identical requests so a burst of 5 simultaneous
      // calls for the same (word, band) only fires one GPT request.
      const inFlight = COACH_IN_FLIGHT.get(cacheKey);
      if (inFlight) {
        try {
          const value = await inFlight;
          return res.json({ ...value, cached: true });
        } catch {
          // Fall through and let this caller do its own GPT call.
        }
      }

      // Build the prompt. We ask for all UI languages so the same cache entry
      // serves Korean/English/Spanish/Indonesian readers — the cost is higher
      // output tokens but the hit rate is much higher.
      const langLabel = lang.startsWith("ko") ? "Korean" : lang.startsWith("es") ? "Spanish" : lang.startsWith("id") ? "Indonesian" : "English";
      const nativeLabel = nativeLang === "korean" ? "Korean" : nativeLang === "spanish" ? "Spanish" : nativeLang === "indonesian" || nativeLang === "id" ? "Indonesian" : "English";
      const recognizedNote = recognizedText && recognizedText.trim() && recognizedText.trim().toLowerCase() !== trimmedWord.toLowerCase()
        ? `Speech recogniser heard: "${recognizedText.slice(0, 80)}"`
        : "Recogniser heard the word correctly";
      const weakNote = weak.length > 0 ? `Weak phonemes: ${weak.join(", ")}` : "No specific phoneme issues flagged";

      // Anchored register examples — GPT-4o-mini consistently regresses to
      // 합니다체 (Korean) and "usted" (Spanish) when only abstract labels
      // are given. One-shot exemplars pin the voice reliably.
      const systemPrompt = [
        'You are Rudy, a friendly fox-tutor who gives pronunciation coaching to language learners.',
        'You receive an Azure assessment score and must respond with one SHORT (1-2 sentences) warm, specific coaching comment in EACH of Korean, English, Spanish, and Indonesian.',
        'Always:',
        '- Reference the target word by quoting it (e.g. "family", "안녕하세요").',
        '- Be concrete about WHAT to fix when score is below 90 (mention a specific phoneme, syllable, or rhythm).',
        '- Encouraging tone. Never shame the learner.',
        '- Korean register example: "정말 좋아요! \'family\'의 \'a\' 소리를 조금만 더 길게 빼볼까요?" — ALWAYS 해요체 (~요/~봐요/~볼까요). NEVER 합니다체 (~합니다/~십시오) and NEVER 반말.',
        '- Spanish register example: "¡Muy bien! Intenta alargar la \'ll\' en \'llamar\'." — ALWAYS tú-form. NEVER usted. Use suaves imperatives.',
        '- English: friendly, lower-case start mid-sentence is fine. Encouraging not corrective.',
        '- Indonesian: friendly Bahasa Indonesia, casual and clear.',
        '- 1-2 sentences max per language. No emoji unless score >= 90.',
        '- Return ONLY a JSON object with keys "ko", "en", "es", "id". No prose around it.',
      ].join(' ');

      const userPrompt = [
        `Target word: "${trimmedWord}"`,
        `Target language: ${langLabel} (${lang})`,
        `Learner's native language: ${nativeLabel}`,
        `Overall pronunciation score: ${Math.round(score)} / 100 (band: ${band})`,
        typeof accuracyScore === "number" ? `Accuracy: ${Math.round(accuracyScore)}` : null,
        typeof fluencyScore === "number" ? `Fluency: ${Math.round(fluencyScore)}` : null,
        typeof completenessScore === "number" ? `Completeness: ${Math.round(completenessScore)}` : null,
        recognizedNote,
        weakNote,
      ].filter(Boolean).join('\n');

      const work = (async (): Promise<CoachComment> => {
        let payload: CoachComment | null = null;
        try {
          const raw = await completeText({
            taskLabel: "/api/pronunciation-coach",
            model: "gpt-4o-mini",
            temperature: 0.55,
            maxTokens: 240,
            responseFormat: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          });
          const parsed = JSON.parse(raw);
          const ko = typeof parsed.ko === "string" ? parsed.ko.trim() : "";
          const en = typeof parsed.en === "string" ? parsed.en.trim() : "";
          const es = typeof parsed.es === "string" ? parsed.es.trim() : "";
          const id = typeof parsed.id === "string" ? parsed.id.trim() : "";
          // Per-locale partial fallback (QA Bug N6): if GPT misses one locale,
          // keep what it gave and patch the missing one from fallbackCoach
          // rather than throwing away two good locales.
          if (ko || en || es || id) {
            const fb = fallbackCoach(trimmedWord, score, weak);
            payload = {
              ko: ko || fb.ko,
              en: en || fb.en,
              es: es || fb.es,
              id: id || fb.id,
            };
          }
        } catch (e) {
          console.warn("[pronunciation-coach] GPT call failed, using fallback:", (e as Error)?.message ?? e);
        }
        if (!payload) payload = fallbackCoach(trimmedWord, score, weak);
        COACH_CACHE.set(cacheKey, { value: payload, at: Date.now() });
        pruneCoachCache();
        return payload;
      })();
      COACH_IN_FLIGHT.set(cacheKey, work);
      try {
        const value = await work;
        return res.json({ ...value, cached: false });
      } finally {
        COACH_IN_FLIGHT.delete(cacheKey);
      }
    } catch (err) {
      console.error("Coach endpoint error:", err);
      return res.status(500).json({ error: "Coaching failed" });
    }
  });

  // GPT to give a 0-100 score and short Korean feedback (legacy, kept as fallback).
  app.post("/api/gpt-score", gptLimiter, async (req: Request, res: Response) => {
    try {
      const { word, recognized } = req.body as { word?: string; recognized?: string };
      if (!word || recognized === undefined) {
        return res.status(400).json({ error: "word and recognized are required" });
      }

      const raw = await completeText({
        taskLabel: "/api/gpt-score",
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 120,
        responseFormat: { type: "json_object" },
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
      }) || "{}";
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
    emma:         { english: { voice: "en-US-JennyNeural",        lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    james:        { english: { voice: "en-GB-RyanNeural",         lang: "en-GB" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    officer_park: { english: { voice: "en-US-DavisNeural",        lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    bar_alex:     { english: { voice: "en-US-GuyNeural",          lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    sofia:        { english: { voice: "en-US-AriaNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    mia:          { english: { voice: "en-US-MichelleNeural",     lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    dr_kim:       { english: { voice: "en-US-BrandonNeural",      lang: "en-US" }, korean: { voice: "ko-KR-HyunsuNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    lisa:         { english: { voice: "en-US-SaraNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    marco:        { english: { voice: "en-US-ChristopherNeural",  lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    tom:          { english: { voice: "en-US-TonyNeural",         lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    // Story-mode NPCs
    amira:        { english: { voice: "en-US-AriaNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    carlos:       { english: { voice: "en-US-GuyNeural",          lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    ellis:        { english: { voice: "en-GB-SoniaNeural",        lang: "en-GB" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    hassan:       { english: { voice: "en-US-BrandonNeural",      lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    isabel:       { english: { voice: "en-US-JennyNeural",        lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    miguel:       { english: { voice: "en-US-ChristopherNeural",  lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    minho:        { english: { voice: "en-US-JasonNeural",        lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    mr_black:     { english: { voice: "en-US-DavisNeural",        lang: "en-US" }, korean: { voice: "ko-KR-HyunsuNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    penny:        { english: { voice: "en-GB-LibbyNeural",        lang: "en-GB" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    sujin:        { english: { voice: "en-US-MichelleNeural",     lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    youngsook:    { english: { voice: "en-US-SaraNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    lingo:        { english: { voice: "en-US-TonyNeural",         lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    // Real-world NPCs
    ryan:         { english: { voice: "en-US-GuyNeural",          lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    nari:         { english: { voice: "en-US-JennyNeural",        lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    derek:        { english: { voice: "en-US-DavisNeural",        lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    mei:          { english: { voice: "en-US-MichelleNeural",     lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    juno:         { english: { voice: "en-US-TonyNeural",         lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    gloria:       { english: { voice: "en-US-SaraNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    stan:         { english: { voice: "en-US-BrandonNeural",      lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    hana:         { english: { voice: "en-US-AriaNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    vincent:      { english: { voice: "en-US-ChristopherNeural",  lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    claire:       { english: { voice: "en-US-AriaNeural",         lang: "en-US" }, korean: { voice: "ko-KR-SunHiNeural",   lang: "ko-KR" }, spanish: { voice: "es-ES-ElviraNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-GadisNeural", lang: "id-ID" } },
    officer_kwon: { english: { voice: "en-US-DavisNeural",        lang: "en-US" }, korean: { voice: "ko-KR-HyunsuNeural",  lang: "ko-KR" }, spanish: { voice: "es-ES-AlvaroNeural",      lang: "es-ES" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
    luca:         { english: { voice: "en-US-GuyNeural",          lang: "en-US" }, korean: { voice: "ko-KR-InJoonNeural",  lang: "ko-KR" }, spanish: { voice: "es-MX-JorgeNeural",       lang: "es-MX" }, indonesian: { voice: "id-ID-ArdiNeural",  lang: "id-ID" } },
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
      if (!key || !region) return sendVoiceServiceUnavailable(res, "NPC TTS");

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
        logProviderError("NPC TTS error:", azureRes.status, errText);
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
    english: "English", spanish: "Spanish", korean: "Korean", indonesian: "Indonesian",
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

      const raw = await completeText({
        taskLabel: "/api/npc-chat",
        model: "gpt-4o",
        maxTokens: 300,
        messages: msgs,
      }) || "{}";
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
  app.post("/api/mission-chat", gptLimiter, async (req: Request, res: Response) => {
    try {
      const { systemPrompt, targetLang, messages, nativeLang } = req.body as {
        systemPrompt: string;
        targetLang: string;
        messages: { role: "user" | "assistant"; content: string }[];
        nativeLang?: "ko" | "en" | "es" | "id";
      };

      if (!systemPrompt || !targetLang || !Array.isArray(messages)) {
        return res.status(400).json({ error: "systemPrompt, targetLang, and messages are required" });
      }

      const LANG_FULL: Record<string, string> = {
        english: "English", spanish: "Spanish", korean: "Korean", indonesian: "Indonesian",
        "en-US": "English", "es-ES": "Spanish", "ko-KR": "Korean",
      };
      const langName = LANG_FULL[targetLang] ?? "English";

      // ── Content moderation on latest user message ────────────────────────
      // Short Korean messages bypass moderation (greetings / noise). Other
      // languages and longer inputs are always checked. Fail-open: a
      // moderation outage returns flagged=false so learning continues.
      const latestUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (latestUserMsg && typeof latestUserMsg.content === "string" && !shouldSkipModeration(latestUserMsg.content)) {
        const mod = await moderateText(latestUserMsg.content);
        if (mod.flagged) {
          console.log(`[/api/mission-chat] moderation flagged category=${mod.category ?? "unknown"}`);
          return res.json({
            reply: safeReplyFor(nativeLang),
            sentenceCount: 0,
            grammarNote: "",
            shouldEnd: false,
            moderated: true,
          });
        }
      }

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

      const raw = await completeText({
        taskLabel: "/api/mission-chat",
        model: "gpt-4o",
        maxTokens: 400,
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
      });

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

  app.post("/api/word-lookup", gptLimiter, async (req: Request, res: Response) => {
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
        english: "English", korean: "Korean", spanish: "Spanish", indonesian: "Indonesian",
      };
      const tl = langLabel[targetLanguage] ?? targetLanguage;
      const nl = langLabel[nativeLanguage] ?? nativeLanguage;

      const hasSentence = !!(sentence && sentence.trim());

      const raw = await completeText({
        taskLabel: "/api/word-lookup",
        model: "gpt-4o-mini",
        maxTokens: hasSentence ? 280 : 180,
        responseFormat: { type: "json_object" },
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
        const fallbackMeaning = await completeText({
          taskLabel: "/api/word-lookup/retry",
          model: "gpt-4o-mini",
          maxTokens: 80,
          messages: [
            { role: "system", content: `Translate this ${tl} word/phrase to ${nl}. Return ONLY the translation, nothing else.` },
            { role: "user", content: word },
          ],
        });
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
        english: "English", korean: "Korean", spanish: "Spanish", indonesian: "Indonesian",
      };
      const langName = langLabel[lang] ?? "English";

      const recognized = await completeImageText({
        taskLabel: "/api/handwriting-recognize",
        model: "gpt-4o",
        maxTokens: 200,
        imageBase64,
        prompt: `This image contains handwritten text in ${langName}. Please read and transcribe the handwritten text exactly as written. Return ONLY the transcribed text with no extra explanation. If the handwriting is unclear or partial, do your best to interpret it.`,
      });
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
      const raw = await completeText({
        taskLabel: "/api/quiz-evaluate",
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.4,
        maxTokens: 400,
      });
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
      const raw = await completeText({
        taskLabel: "/api/quiz-roleplay",
        model: "gpt-4o",
        messages: msgs,
        temperature: 0.7,
        maxTokens: 600,
      });
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

  // ── Billing (Stripe Subscriptions, "Pro" tier) ──────────────────────────────
  // All endpoints except the webhook require a valid Supabase JWT in the
  // Authorization header (Bearer <access_token>). The webhook uses Stripe's
  // own signature for authentication.
  //
  // When STRIPE_SECRET_KEY is unset (default until you wire up Stripe), the
  // checkout/portal endpoints return { url: null, error: "Stripe not configured" }
  // and the client renders that as "결제 시스템 준비 중" / "Billing coming soon".

  app.post("/api/billing/checkout", async (req: Request, res: Response) => {
    try {
      const user = await verifySupabaseJwt(req.header("authorization"));
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const { return_url } = (req.body ?? {}) as { return_url?: string };
      if (!return_url || typeof return_url !== "string") {
        return res.status(400).json({ error: "return_url is required" });
      }

      const result = await createCheckoutSession({
        user_id: user.id,
        return_url,
        customer_email: user.email,
      });

      // We still return 200 with `url: null` when Stripe isn't configured so
      // the client can show a polite trilingual placeholder rather than a
      // generic "request failed" toast.
      return res.json(result);
    } catch (err) {
      console.error("[billing] /checkout error", err);
      return res.status(500).json({ url: null, error: "Checkout failed" });
    }
  });

  app.post("/api/billing/portal", async (req: Request, res: Response) => {
    try {
      const user = await verifySupabaseJwt(req.header("authorization"));
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const { return_url } = (req.body ?? {}) as { return_url?: string };
      if (!return_url || typeof return_url !== "string") {
        return res.status(400).json({ error: "return_url is required" });
      }

      const result = await createPortalSession({
        user_id: user.id,
        return_url,
      });
      return res.json(result);
    } catch (err) {
      console.error("[billing] /portal error", err);
      return res.status(500).json({ url: null, error: "Portal failed" });
    }
  });

  app.get("/api/billing/status", async (req: Request, res: Response) => {
    try {
      const user = await verifySupabaseJwt(req.header("authorization"));
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const status = await getSubscriptionStatus(user.id);
      return res.json({
        ...status,
        stripe_configured: isStripeConfigured(),
      });
    } catch (err) {
      console.error("[billing] /status error", err);
      return res.status(500).json({ tier: "free", error: "Status check failed" });
    }
  });

  // Stripe webhook. Authenticated by signature, NOT by Supabase JWT.
  //
  // Important: Stripe requires the raw request body for signature
  // verification. server/index.ts already preserves req.rawBody via the
  // express.json verify hook, so this endpoint can use it directly without
  // a per-route middleware switch.
  app.post("/api/billing/webhook", async (req: Request, res: Response) => {
    try {
      const signature = req.header("stripe-signature");
      const rawBody = (req.rawBody as Buffer | string | undefined) ?? "";
      const result = verifyWebhookSignature(rawBody, signature);

      if (!result.ok || !result.event) {
        // 400 on bad signature is the Stripe-recommended response — it tells
        // Stripe to retry with a refreshed payload (which doesn't help us
        // here, but keeps the dashboard's delivery log clean and accurate).
        console.warn("[billing] webhook signature rejected:", result.error);
        return res.status(400).json({ error: result.error ?? "Invalid signature" });
      }

      const event = result.event;
      // We handle subscription lifecycle events. Everything else is acked
      // with 200 so Stripe stops retrying.
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const applied = await applySubscriptionEvent(event);
          if (!applied.handled) {
            console.warn(
              `[billing] webhook ${event.type} not applied:`,
              applied.reason ?? "(no reason)",
            );
          }
          break;
        }
        default:
          // No-op — log so the dashboard correlates 200s with received types.
          console.log(`[billing] webhook ignored event type: ${event.type}`);
      }

      return res.json({ received: true });
    } catch (err) {
      console.error("[billing] webhook handler error", err);
      // Return 200 anyway — Stripe will retry on 5xx, and a thrown handler is
      // almost always our bug rather than a transient issue worth re-delivering.
      // For now we return 500 so the dashboard makes the bug loud.
      return res.status(500).json({ error: "Webhook handler error" });
    }
  });

  // ── GDPR / PIPA data-rights endpoints ──────────────────────────────────────
  //
  // /api/me/export   — Right to data portability (GDPR Art. 20, PIPA Art. 35)
  // /api/me/delete   — Right to erasure / withdrawal of consent
  //                    (GDPR Art. 17, PIPA Art. 36 & 37)
  //
  // Both endpoints require a valid Supabase JWT in `Authorization: Bearer …`.
  // Failure of JWT verification ALWAYS produces 401 with no side effects —
  // delete in particular must never touch storage without a verified caller.
  //
  // Rate limiting reuses server/rateLimits.ts's `keyFromReq` (so the user-
  // bucket label is consistent with the rest of the API) but builds its own
  // express-rate-limit instances because the brief mandates 1/min and 1/hr
  // caps that don't match any tier already exported. See each handler's
  // docstring for caps.
  //
  // Service-role usage: deletion of the auth user requires
  // SUPABASE_SERVICE_ROLE_KEY. When absent, the endpoint returns 202 Accepted
  // (no state change; admin will finish manually). Never expose this key to
  // clients — set it only on Railway.
  const meExportLimiter: RequestHandler = rateLimit({
    windowMs: 60_000,
    limit: 1,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: keyFromReq,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        error: "rate_limited",
        message: "Export is limited to once per minute. Please try again shortly.",
      });
    },
  });
  const meDeleteLimiter: RequestHandler = rateLimit({
    windowMs: 60 * 60_000,
    limit: 1,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: keyFromReq,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        error: "rate_limited",
        message: "Delete is limited to once per hour. Please try again later.",
      });
    },
  });

  /**
   * @openapi
   * /api/me/export:
   *   get:
   *     summary: Export the authenticated user's account data (GDPR Art. 20).
   *     description: |
   *       Returns a JSON snapshot of the caller's `auth.users` record and
   *       `linguaai_user_progress` row. The response sets
   *       `Content-Disposition: attachment` so browsers trigger a download
   *       dialog instead of rendering JSON inline.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User data export.
   *         headers:
   *           Content-Disposition:
   *             schema:
   *               type: string
   *             description: 'attachment; filename="linguaai-export-<date>.json"'
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 exported_at:
   *                   type: string
   *                   format: date-time
   *                 user:
   *                   type: object
   *                   properties:
   *                     id: { type: string, format: uuid }
   *                     email: { type: string, nullable: true }
   *                     created_at: { type: string, format: date-time, nullable: true }
   *                     provider: { type: string, nullable: true }
   *                 progress:
   *                   type: object
   *                   nullable: true
   *                   description: Row from `public.linguaai_user_progress`, or null if none exists.
   *       401:
   *         description: Missing or invalid Supabase JWT.
   *       429:
   *         description: Rate limit exceeded (1 request / minute / user).
   *       500:
   *         description: Server misconfiguration or unexpected DB error.
   */
  app.get(
    "/api/me/export",
    // Auth FIRST — so a forged JWT can't even reach the limiter and burn
    // Supabase getUser() validation calls under a fresh forged sub.
    requireAuth,
    meExportLimiter,
    async (req: Request, res: Response) => {
      try {
        // requireAuth guarantees req.userId is a string. Pull the full
        // auth.users record (created_at, provider, etc.) via the service-
        // role admin client so the export includes the metadata GDPR Art.
        // 15 demands.
        const adminForUser = getServiceRoleClient();
        let created_at: string | null = null;
        let provider: string | null = null;
        if (adminForUser) {
          const { data: u } = await adminForUser.auth.admin.getUserById(req.userId as string);
          created_at = u?.user?.created_at ?? null;
          const appMeta = u?.user?.app_metadata as { provider?: string } | undefined;
          provider = appMeta?.provider ?? null;
        }
        const user = {
          id: req.userId as string,
          email: req.userEmail ?? null,
          created_at,
          provider,
        };

        // Reading `linguaai_user_progress` cross-user from server code requires
        // bypassing RLS, which means the service role. If the key is missing
        // we still return the auth.users summary — progress will be null and
        // the response carries an explanatory note.
        const admin = getServiceRoleClient();
        let progress: unknown = null;
        let progressNote: string | undefined;

        if (admin) {
          const { data, error } = await admin
            .from("linguaai_user_progress")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          if (error) {
            console.error("[GDPR export] progress fetch error:", error.message);
            return res.status(500).json({ error: "Failed to load progress" });
          }
          progress = data ?? null;
        } else {
          progressNote =
            "Progress data unavailable: SUPABASE_SERVICE_ROLE_KEY is not configured on the server.";
        }

        const isoDate = new Date().toISOString();
        const fileDate = isoDate.slice(0, 10); // YYYY-MM-DD
        const payload: Record<string, unknown> = {
          exported_at: isoDate,
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            provider: user.provider,
          },
          progress,
        };
        if (progressNote) payload.note = progressNote;

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="linguaai-export-${fileDate}.json"`,
        );
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        // Pretty-print to make manual inspection nicer; payload size is tiny.
        return res.status(200).send(JSON.stringify(payload, null, 2));
      } catch (err) {
        console.error("[GDPR export] unexpected error:", err);
        return res.status(500).json({ error: "Export failed" });
      }
    },
  );

  /**
   * @openapi
   * /api/me/delete:
   *   post:
   *     summary: Delete the authenticated user's account (GDPR Art. 17).
   *     description: |
   *       Idempotent. Removes the caller's row from
   *       `public.linguaai_user_progress` and, when
   *       `SUPABASE_SERVICE_ROLE_KEY` is configured, also deletes the
   *       corresponding `auth.users` record via the admin API.
   *
   *       If the service-role key is not configured, no state change happens
   *       and `202 Accepted` is returned so an operator can finish deletion
   *       manually.
   *
   *       Auditing: each invocation logs
   *       `[GDPR delete] <ISO timestamp> uid=<uuid> auth_removed=<bool>` to
   *       stdout — uid only, no PII beyond the identifier.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *     responses:
   *       200:
   *         description: User fully deleted (progress row + auth user).
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 ok: { type: boolean }
   *                 auth_user_deleted: { type: boolean }
   *       202:
   *         description: |
   *           Deletion deferred (no service-role key configured); an admin
   *           will complete the request manually. No data was deleted yet.
   *       401:
   *         description: Missing or invalid Supabase JWT — no state changed.
   *       429:
   *         description: Rate limit exceeded (1 request / hour / user).
   *       500:
   *         description: Unexpected error during deletion.
   */
  app.post(
    "/api/me/delete",
    // Auth FIRST — so a forged JWT can't reach the limiter and the limiter
    // keys on the verified id (not a payload claim an attacker controls).
    requireAuth,
    meDeleteLimiter,
    async (req: Request, res: Response) => {
      try {
        // requireAuth guarantees req.userId — no further verification needed.
        const user = { id: req.userId as string };

        const admin = getServiceRoleClient();
        if (!admin) {
          // No privileged client → we cannot reliably bypass RLS to delete the
          // progress row and cannot call auth.admin.* at all. Surface 202 so
          // the client can show "queued for admin" UX. Nothing was mutated.
          console.log(
            `[GDPR delete] ${new Date().toISOString()} uid=${user.id} auth_removed=false reason=no_service_role`,
          );
          return res.status(202).json({
            ok: true,
            auth_user_deleted: false,
            note:
              "SUPABASE_SERVICE_ROLE_KEY is not configured. Admin will process this deletion manually.",
          });
        }

        // Step 1: delete the learner's progress row. .eq() ensures we only
        // touch this user's row even with the service-role client. .delete()
        // is naturally idempotent — deleting a non-existent row is a no-op
        // (no error, no rows affected).
        const { error: progressErr } = await admin
          .from("linguaai_user_progress")
          .delete()
          .eq("user_id", user.id);
        if (progressErr) {
          console.error("[GDPR delete] progress delete error:", progressErr.message);
          return res.status(500).json({ error: "Failed to delete progress" });
        }

        // Step 2: delete the auth user. Supabase returns an error if the user
        // no longer exists — we treat "user not found" as success because the
        // overall operation is idempotent. The Supabase JS SDK surfaces this
        // via `error.status === 404` (or a message containing "not found").
        let authRemoved = false;
        const { error: authErr } = await admin.auth.admin.deleteUser(user.id);
        if (authErr) {
          const status = (authErr as { status?: number }).status;
          const msg = authErr.message?.toLowerCase() ?? "";
          const isNotFound = status === 404 || msg.includes("not found");
          if (!isNotFound) {
            console.error("[GDPR delete] auth.admin.deleteUser error:", authErr.message);
            // Progress row is already gone; report partial failure so the
            // client can retry only this step. Still 500 because the user
            // did not get the full deletion they requested.
            return res.status(500).json({
              ok: false,
              auth_user_deleted: false,
              error: "Failed to delete auth user",
            });
          }
          // 404 → already gone, treat as success but record for the audit log.
          authRemoved = false;
        } else {
          authRemoved = true;
        }

        // Audit log — id only, no PII.
        console.log(
          `[GDPR delete] ${new Date().toISOString()} uid=${user.id} auth_removed=${authRemoved}`,
        );

        return res.status(200).json({
          ok: true,
          auth_user_deleted: authRemoved,
        });
      } catch (err) {
        console.error("[GDPR delete] unexpected error:", err);
        return res.status(500).json({ error: "Delete failed" });
      }
    },
  );

  // hasServiceRole is exported from supabaseAdmin for future health/status
  // endpoints; reference it once to keep the unused-import linter quiet
  // without changing module exports.
  void hasServiceRole;

  const httpServer = createServer(app);
  return httpServer;
}
