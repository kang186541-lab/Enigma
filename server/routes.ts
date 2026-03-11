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

  minjun: `당신은 민준, 부산 사투리를 가르치는 한국어 튜터입니다. 성격은 장난스럽고, 살짝 놀리지만 따뜻하고 재미있는 — 절대 상처를 주지 않는 유머입니다. 목표는 언어 학습을 즐겁고 웃기게 만드는 것입니다. 학생이 실수하면: (1) 부산 사투리로 가볍게 놀려주세요, (2) 교정된 문장을 알려주세요, (3) 왜 틀렸는지 간단히 설명하세요, (4) 다시 해보도록 응원해 주세요. 부산 사투리(카이, 아이가, 예예, 뭐꼬 등)를 자연스럽게 사용하세요. 학생이 잘 쓰면 부산식으로 따뜻하게 칭찬하세요. 답변은 3–4문장으로 유지하세요. 필요할 때만 영어를 추가하세요.`,
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { tutorId, messages } = req.body as {
        tutorId: string;
        messages: { role: "user" | "assistant"; content: string }[];
      };

      if (!tutorId || !Array.isArray(messages)) {
        return res.status(400).json({ error: "tutorId and messages are required" });
      }

      const systemPrompt = TUTOR_SYSTEM_PROMPTS[tutorId];
      if (!systemPrompt) {
        return res.status(400).json({ error: "Unknown tutor" });
      }

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

  // ── ElevenLabs Neural TTS ──────────────────────────────────────────────────
  // Each tutor maps to a specific ElevenLabs voice ID.
  const TUTOR_XI_VOICES: Record<string, string> = {
    sarah:  "XB0fDUnXU5powFXDhCwa", // Charlotte — British female (genuine UK accent)
    jake:   "TxGEqnHWrfWFTfGW9XjX", // Josh      — American male
    jane:   "EXAVITQu4vr4xnSDxMaL", // Bella     — Spanish female
    alex:   "ErXwobaYiN019PkySvjV",  // Antoni    — Latin male
    jisu:   "21m00Tcm4TlvDq8ikWAM", // Rachel    — Korean female
    minjun: "TxGEqnHWrfWFTfGW9XjX", // Josh      — Korean male
  };

  app.get("/api/tts", async (req: Request, res: Response) => {
    try {
      const { text, tutorId, speed } = req.query as {
        text?: string;
        tutorId?: string;
        speed?: string;
      };

      if (!text || !tutorId) {
        return res.status(400).json({ error: "text and tutorId required" });
      }

      const voiceId = TUTOR_XI_VOICES[tutorId] ?? "21m00Tcm4TlvDq8ikWAM";
      const stability = 0.5;
      const similarity_boost = 0.75;
      const speaking_rate = Math.min(1.5, Math.max(0.7, parseFloat(speed ?? "1.0")));

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

      if (!xiRes.ok) {
        const errBody = await xiRes.text();
        console.error("ElevenLabs error:", xiRes.status, errBody);
        return res.status(502).json({ error: "ElevenLabs TTS failed" });
      }

      res.set("Content-Type", "audio/mpeg");
      res.set("Cache-Control", "public, max-age=300");
      // Stream the MP3 bytes directly to the client
      const buf = Buffer.from(await xiRes.arrayBuffer());
      res.send(buf);
    } catch (err) {
      console.error("TTS error:", err);
      res.status(500).json({ error: "TTS generation failed" });
    }
  });

  // ── Pronunciation TTS (Azure Neural TTS) ─────────────────────────────────
  // Uses Azure Cognitive Services neural voices for accurate per-language accent.
  const AZURE_TTS_VOICES: Record<string, string> = {
    "ko-KR": "ko-KR-SunHiNeural",
    "en-US": "en-US-JennyNeural",
    "en-GB": "en-GB-SoniaNeural",
    "es-ES": "es-ES-ElviraNeural",
    "es-MX": "es-MX-DaliaNeural",
  };

  app.get("/api/pronunciation-tts", async (req: Request, res: Response) => {
    try {
      const { text, lang } = req.query as { text?: string; lang?: string };
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

      const ssml =
        `<speak version='1.0' xml:lang='${lang}'>` +
        `<voice xml:lang='${lang}' name='${voiceName}'>` +
        `<prosody rate='slow'>${safeText}</prosody>` +
        `</voice></speak>`;

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
  // GPT to give a 0-100 score and short Korean feedback.
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

  const httpServer = createServer(app);
  return httpServer;
}
