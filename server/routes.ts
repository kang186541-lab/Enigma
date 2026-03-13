import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { openai } from "./openai";

/**
 * Map browser-reported MIME types to what Azure STT actually accepts.
 *   audio/mp4 / video/mp4  → audio/x-m4a  (iOS Safari MediaRecorder output)
 *   audio/wav              → audio/wav     (WAV with RIFF header, no codec annotation)
 *   anything else          → pass through  (webm/opus, ogg/opus, etc.)
 */
function normalizeAudioMime(mime: string): string {
  if (mime === "audio/mp4" || mime === "video/mp4") return "audio/x-m4a";
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
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { tutorId, messages, mode } = req.body as {
        tutorId: string;
        messages: { role: "user" | "assistant"; content: string }[];
        mode?: string;
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
      const systemPrompt = modePrompt
        ? `${TTS_INSTRUCTION}\n\n${baseTutorPrompt}\n\n[PERSONALITY MODE OVERRIDE — apply this interaction style]\n${modePrompt}`
        : `${TTS_INSTRUCTION}\n\n${baseTutorPrompt}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5.1",
        max_completion_tokens: 200,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      });

      const reply = completion.choices[0]?.message?.content ?? "...";
      res.json({ reply });
    } catch (err) {
      console.error("OpenAI error:", err);
      res.status(500).json({ error: "Failed to get AI response" });
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
        model: "gpt-5.1",
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
  const TUTOR_VOICES: Record<string, string> = {
    sarah:  "XB0fDUnXU5powFXDhCwa", // Charlotte — British female (genuine UK accent)
    jake:   "TxGEqnHWrfWFTfGW9XjX", // Josh      — American male
    jane:   "EXAVITQu4vr4xnSDxMaL", // Bella     — Spanish female
    alex:   "ErXwobaYiN019PkySvjV",  // Antoni    — Latin male
    jisu:   "21m00Tcm4TlvDq8ikWAM", // Rachel    — Korean female
    minjun: "TxGEqnHWrfWFTfGW9XjX", // Josh      — Korean male
  };

  // Azure voice fallback map — used when ElevenLabs quota is exhausted.
  // Male tutors (Jake, Alex, 민준) use Azure male neural voices.
  const TUTOR_AZURE_FALLBACK: Record<string, { voice: string; lang: string }> = {
    sarah:  { voice: "en-GB-SoniaNeural",  lang: "en-GB" }, // female ✓
    jake:   { voice: "en-US-GuyNeural",    lang: "en-US" }, // male  ✓
    jane:   { voice: "es-ES-ElviraNeural", lang: "es-ES" }, // female ✓
    alex:   { voice: "es-MX-JorgeNeural",  lang: "es-MX" }, // male  ✓
    jisu:   { voice: "ko-KR-SunHiNeural",  lang: "ko-KR" }, // female ✓
    minjun: { voice: "ko-KR-InJoonNeural", lang: "ko-KR" }, // male  ✓
  };

  app.get("/api/tts", async (req: Request, res: Response) => {
    try {
      // mode is intentionally NOT read here — voice identity is locked to tutorId.
      // See TUTOR_VOICES above. Mode belongs only in /api/chat (system prompt).
      const { text, tutorId, speed } = req.query as {
        text?: string;
        tutorId?: string;
        speed?: string;
      };

      if (!text || !tutorId) {
        return res.status(400).json({ error: "text and tutorId required" });
      }

      const voiceId = TUTOR_VOICES[tutorId] ?? "21m00Tcm4TlvDq8ikWAM";
      const stability = 0.5;
      const similarity_boost = 0.75;
      const speaking_rate = Math.min(1.5, Math.max(0.7, parseFloat(speed ?? "1.1")));

      const xiRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        {
          method: "POST",
          headers: {
            "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text: text.slice(0, 5000),
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability, similarity_boost, speaking_rate },
          }),
        }
      );

      if (xiRes.ok) {
        res.set("Content-Type", "audio/mpeg");
        res.set("Cache-Control", "public, max-age=300");
        const buf = Buffer.from(await xiRes.arrayBuffer());
        return res.send(buf);
      }

      // ElevenLabs failed (quota exceeded, auth error, etc.) — fall back to Azure Neural TTS
      const errBody = await xiRes.text();
      console.warn(`ElevenLabs unavailable (${xiRes.status}), falling back to Azure TTS:`, errBody);

      const azureFallback = TUTOR_AZURE_FALLBACK[tutorId];
      if (!azureFallback) {
        return res.status(502).json({ error: "TTS unavailable" });
      }

      const azureKey = process.env.AZURE_SPEECH_KEY;
      const azureRegion = process.env.AZURE_SPEECH_REGION;
      if (!azureKey || !azureRegion) {
        return res.status(502).json({ error: "TTS unavailable — no fallback credentials" });
      }

      const safeText = text.slice(0, 5000)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Convert client speed multiplier (0.8-1.4) to Azure prosody rate string.
      // e.g. 0.8 → "-20%", 1.0 → "+0%", 1.2 → "+20%", 1.4 → "+40%"
      const speedPct = Math.round((speaking_rate - 1) * 100);
      const speedRate = (speedPct >= 0 ? "+" : "") + speedPct + "%";
      console.log(`TTS called with speed: ${speaking_rate} → Azure prosody rate: ${speedRate}`);

      // Pass tutorId and speedRate — mode excluded so voice stays consistent across modes.
      const ssml = buildSsml(azureFallback.voice, azureFallback.lang, safeText, tutorId, undefined, speedRate);

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
        }
      );

      if (!azureRes.ok) {
        const azureErr = await azureRes.text();
        console.error("Azure TTS fallback error:", azureRes.status, azureErr);
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
  };

  // SSML express-as style per voice — applied automatically based on voice name.
  // tutorId override takes precedence when the caller supplies it.
  const VOICE_SSML_STYLES: Record<string, { style: string; degree: string }> = {
    "en-GB-SoniaNeural":  { style: "customerservice", degree: "1.5" }, // Sarah
    "en-US-GuyNeural":    { style: "friendly",         degree: "2"   }, // Jake (male fallback)
    "en-US-JennyNeural":  { style: "friendly",         degree: "2"   }, // Jake legacy
    "es-ES-ElviraNeural": { style: "cheerful",          degree: "1.5" }, // Jane
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

    return [
      `<speak version="1.0"`,
      ` xmlns="http://www.w3.org/2001/10/synthesis"`,
      ` xmlns:mstts="http://www.w3.org/2001/mstts"`,
      ` xml:lang="${lang}">`,
      `<voice name="${voiceName}">`,
      `<mstts:express-as style="${ssmlStyle.style}" styledegree="${ssmlStyle.degree}">`,
      `<prosody rate="${rate}" pitch="${pitch}">${safeText}</prosody>`,
      `</mstts:express-as>`,
      `</voice>`,
      `</speak>`,
    ].join("");
  }

  app.get("/api/pronunciation-tts", async (req: Request, res: Response) => {
    try {
      const { text, lang, tutorId, mode } = req.query as { text?: string; lang?: string; tutorId?: string; mode?: string };
      if (!text || !lang) {
        return res.status(400).json({ error: "text and lang required" });
      }

      const key = process.env.AZURE_SPEECH_KEY;
      const region = process.env.AZURE_SPEECH_REGION;
      if (!key || !region) {
        return res.status(500).json({ error: "Azure credentials not configured" });
      }

      const voiceName = AZURE_TTS_VOICES[lang] ?? "en-US-JennyNeural";
      const safeText = text.slice(0, 500)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const ssml = buildSsml(voiceName, lang, safeText, tutorId, mode);

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
      const key = process.env.AZURE_SPEECH_KEY;
      const region = process.env.AZURE_SPEECH_REGION;
      if (!key || !region) {
        return res.status(500).json({ error: "Azure credentials not configured" });
      }

      const audioBuffer = Buffer.from(audio, "base64");
      const contentType = normalizeAudioMime(mimeType ?? "audio/wav");

      const azureUrl =
        `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation` +
        `/cognitiveservices/v1?language=${encodeURIComponent(language)}&format=simple`;

      const azureRes = await fetch(azureUrl, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": contentType,
        },
        body: audioBuffer,
      });

      if (!azureRes.ok) {
        const errText = await azureRes.text();
        console.error("Azure STT error:", azureRes.status, errText);
        return res.status(502).json({ error: "STT failed" });
      }

      const data = (await azureRes.json()) as { RecognitionStatus: string; DisplayText?: string };
      res.json({ text: data.DisplayText ?? "", status: data.RecognitionStatus });
    } catch (err) {
      console.error("STT error:", err);
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

      const key = process.env.AZURE_SPEECH_KEY;
      const region = process.env.AZURE_SPEECH_REGION;
      if (!key || !region) {
        return res.status(500).json({ error: "Azure credentials not configured" });
      }

      const { detectAudioFormat } = await import("./replit_integrations/audio/client");
      const { spawn } = await import("child_process");
      const { writeFile, unlink, readFile } = await import("fs/promises");
      const { randomUUID } = await import("crypto");
      const { tmpdir } = await import("os");
      const { join } = await import("path");

      const rawBuffer = Buffer.from(audio, "base64");
      const detectedFormat = detectAudioFormat(rawBuffer);
      console.log(`[assess] raw=${rawBuffer.length}B  fmt=${detectedFormat}  mime=${mimeType}  lang=${lang}  word="${word}"`);

      // Convert to speech-optimised 16kHz WAV with normalisation + silence trim
      const inputPath = join(tmpdir(), `pa-in-${randomUUID()}`);
      const outputPath = join(tmpdir(), `pa-out-${randomUUID()}.wav`);
      let wavBuffer: Buffer;
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
        console.log(`[assess] ffmpeg ok → ${wavBuffer.length}B`);
      } catch (convErr) {
        console.error("[assess] ffmpeg failed:", convErr);
        // Fall back — send raw buffer and hope Azure can handle it
        wavBuffer = rawBuffer;
      } finally {
        await unlink(inputPath).catch(() => {});
        await unlink(outputPath).catch(() => {});
      }

      const assessmentConfig = Buffer.from(
        JSON.stringify({
          ReferenceText: word,
          GradingSystem: "HundredMark",
          Dimension: "Comprehensive",
          EnableProsodyAssessment: false,
        })
      ).toString("base64");

      // Use "interactive" mode — designed for short words/phrases, lower silence threshold
      const azureRes = await fetch(
        `https://${region}.stt.speech.microsoft.com/speech/recognition/interactive/cognitiveservices/v1?language=${lang}&format=detailed`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
            "Pronunciation-Assessment": assessmentConfig,
          },
          body: wavBuffer,
        }
      );

      if (!azureRes.ok) {
        const errText = await azureRes.text();
        console.error("[assess] Azure HTTP error:", azureRes.status, errText);
        return res.status(500).json({ error: "Azure assessment failed" });
      }

      // Azure returns scores FLAT on NBest[0] (not in a nested PronunciationAssessment sub-object)
      const data = (await azureRes.json()) as {
        RecognitionStatus: string;
        DisplayText?: string;
        NBest?: Array<{
          AccuracyScore?: number;
          FluencyScore?: number;
          CompletenessScore?: number;
          PronScore?: number;
          Words?: Array<{
            Word: string;
            AccuracyScore?: number;
            ErrorType?: string;
          }>;
        }>;
      };

      const nb0 = data.NBest?.[0];
      const hasPronScore = nb0 != null && nb0.PronScore != null;
      console.log(`[assess] Azure status=${data.RecognitionStatus}  display="${data.DisplayText}"  hasPronScore=${hasPronScore}  PronScore=${nb0?.PronScore}`);

      if (data.RecognitionStatus !== "Success" || !hasPronScore) {
        return res.json({
          score: 0,
          accuracyScore: 0,
          fluencyScore: 0,
          completenessScore: 0,
          recognizedText: data.DisplayText ?? "",
          feedback: `음성 인식 실패 (${data.RecognitionStatus}). 더 크고 명확하게 말해 주세요.`,
          words: [],
        });
      }

      const pronScore = Math.round(nb0!.PronScore!);
      const accuracyScore = Math.round(nb0!.AccuracyScore ?? 0);
      const fluencyScore = Math.round(nb0!.FluencyScore ?? 0);
      const completenessScore = Math.round(nb0!.CompletenessScore ?? 0);

      let feedback: string;
      if (pronScore >= 90) {
        feedback = "완벽한 발음이에요! 정말 훌륭합니다! 🎉";
      } else if (pronScore >= 75) {
        feedback = `좋아요! 정확도 ${accuracyScore}점. 조금만 더 연습하면 완벽해질 거예요!`;
      } else if (pronScore >= 50) {
        feedback = `연습이 필요해요. 각 음절을 천천히 또렷하게 발음해 보세요. (정확도: ${accuracyScore}점)`;
      } else {
        feedback = `다시 도전해 봐요! 먼저 듣기 버튼으로 원어민 발음을 들어보세요.`;
      }

      res.json({
        score: pronScore,
        accuracyScore,
        fluencyScore,
        completenessScore,
        recognizedText: data.DisplayText ?? "",
        feedback,
        words: (nb0!.Words ?? []).map((w) => ({
          word: w.Word,
          score: Math.round(w.AccuracyScore ?? 0),
          errorType: w.ErrorType ?? "None",
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
        max_tokens: 120,
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
  };

  const NPC_SSML_STYLES: Record<string, { style: string; degree: string }> = {
    emma:         { style: "cheerful",                degree: "2"   },
    james:        { style: "customerservice",          degree: "1"   },
    officer_park: { style: "unfriendly",              degree: "1.5" },
    bar_alex:     { style: "friendly",                degree: "2"   },
    sofia:        { style: "customerservice",          degree: "1.5" },
    mia:          { style: "cheerful",                degree: "2"   },
    dr_kim:       { style: "narration-professional",  degree: "1"   },
    lisa:         { style: "customerservice",          degree: "2"   },
    marco:        { style: "friendly",                degree: "2"   },
    tom:          { style: "excited",                 degree: "1.5" },
  };

  app.get("/api/npc-tts", async (req: Request, res: Response) => {
    try {
      const { text, npcId, npcLang, speed } = req.query as {
        text?: string; npcId?: string; npcLang?: string; speed?: string;
      };
      if (!text || !npcId || !npcLang) {
        return res.status(400).json({ error: "text, npcId, npcLang required" });
      }
      const key    = process.env.AZURE_SPEECH_KEY;
      const region = process.env.AZURE_SPEECH_REGION;
      if (!key || !region) return res.status(500).json({ error: "Azure credentials not configured" });

      const npcVoices = NPC_AZURE_VOICES[npcId];
      if (!npcVoices) return res.status(400).json({ error: "Unknown npcId" });
      const voiceInfo = npcVoices[npcLang] ?? npcVoices["english"];

      const speaking_rate = Math.min(1.5, Math.max(0.7, parseFloat(speed ?? "1.0")));
      const speedPct = Math.round((speaking_rate - 1) * 100);
      const speedRate = (speedPct >= 0 ? "+" : "") + speedPct + "%";

      const safeText = text.slice(0, 3000)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const npcStyle = NPC_SSML_STYLES[npcId] ?? { style: "friendly", degree: "1.5" };

      const ssml = [
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"`,
        ` xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${voiceInfo.lang}">`,
        `<voice name="${voiceInfo.voice}">`,
        `<mstts:express-as style="${npcStyle.style}" styledegree="${npcStyle.degree}">`,
        `<prosody rate="${speedRate}">${safeText}</prosody>`,
        `</mstts:express-as></voice></speak>`,
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
    emma:         { name: "Emma",        personality: "Energetic and sassy barista — fast-paced, quick-witted, never lets a slow customer hold up the line.", scenarioDesc: "You're at a cozy café. Take orders, make recommendations, chat with regulars." },
    james:        { name: "James",       personality: "Strict and impatient airport staff — follows rules to the letter, zero patience for confusion or delays.", scenarioDesc: "You're at the airport check-in desk handling boarding, baggage, and gate queries." },
    officer_park: { name: "Officer Park",personality: "Serious and intimidating detective — deliberate words, every pause is a test.", scenarioDesc: "The user has been called in for questioning about a recent neighborhood incident." },
    bar_alex:     { name: "Alex",        personality: "Funny and casual bar friend — treats everyone like an old buddy, finds humor in everything.", scenarioDesc: "You're at a local bar chatting, ordering rounds, sharing stories." },
    sofia:        { name: "Sofia",       personality: "Elegant and polite hotel receptionist — impeccably professional with a warm smile that never wavers.", scenarioDesc: "You're handling hotel check-in: reservations, room preferences, local tips." },
    mia:          { name: "Mia",         personality: "Bubbly and curious shop assistant — loves helping customers find exactly what they need.", scenarioDesc: "You're in a clothing store helping the customer find the right size, style, and deal." },
    dr_kim:       { name: "Dr. Kim",     personality: "Calm and serious doctor — methodical, reassuring, focused on getting facts right.", scenarioDesc: "You're at a clinic asking about symptoms and medical history." },
    lisa:         { name: "Lisa",        personality: "Passive aggressive and overly polite customer service rep — technically helpful but would rather be anywhere else.", scenarioDesc: "You're handling a customer service call: complaints, returns, and company policies." },
    marco:        { name: "Marco",       personality: "Warm and friendly restaurant host — makes every guest feel like the most important person.", scenarioDesc: "You're greeting guests, seating them, and making personalized recommendations." },
    tom:          { name: "Tom",         personality: "Chatty and impatient taxi driver — talks non-stop but has zero patience for passengers who don't know where they're going.", scenarioDesc: "The user just got in your taxi. You need their destination and opinions about everything." },
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
      const { npcId, language, relationshipScore, messages, isStart } = req.body as {
        npcId: string;
        language: string;
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
        ``,
        `RESPOND WITH ONLY VALID JSON — no markdown, no code blocks, nothing else:`,
        `{"reply":"...","scoreChange":3,"emotion":"happy","choices":["...","...","..."]}`,
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
        model: "gpt-5.1",
        max_completion_tokens: 300,
        messages: msgs,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const jsonStr = extractJsonFromText(raw);

      let parsed: { reply?: string; scoreChange?: number; emotion?: string; choices?: string[] };
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        parsed = { reply: raw.trim(), scoreChange: 0, emotion: "neutral", choices: [] };
      }

      res.json({
        reply:       parsed.reply       ?? "...",
        scoreChange: typeof parsed.scoreChange === "number" ? Math.max(-10, Math.min(10, parsed.scoreChange)) : 0,
        emotion:     parsed.emotion     ?? "neutral",
        choices:     Array.isArray(parsed.choices) ? parsed.choices.slice(0, 3) : [],
      });
    } catch (err) {
      console.error("NPC chat error:", err);
      res.status(500).json({ error: "NPC chat failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
