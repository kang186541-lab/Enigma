import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { openai } from "./openai";

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

  // ── OpenAI Neural TTS via gpt-audio (chat completions — proxy-supported) ──
  // The Replit OpenAI proxy supports /chat/completions but NOT /audio/speech.
  // We use the gpt-audio model with audio modalities to generate speech, then
  // wrap the returned PCM16 bytes in a WAV container for playback.
  //
  // Voice mapping: each tutor gets a unique character voice.
  // fable = British inflection (Sarah), onyx = deep male (Jake),
  // nova  = warm female (Jane),         echo  = energetic male (Alex),
  // shimmer = gentle female (Jisu),     alloy = balanced male (Minjun)
  const TUTOR_TTS_VOICES: Record<string, string> = {
    sarah:  "fable",
    jake:   "onyx",
    jane:   "nova",
    alex:   "echo",
    jisu:   "shimmer",
    minjun: "alloy",
  };

  /** Wrap raw PCM16 LE mono bytes in a standard WAV container. */
  function buildWav(pcm16: Buffer, sampleRate = 24000): Buffer {
    const numCh = 1, bits = 16;
    const byteRate = sampleRate * numCh * (bits / 8);
    const blockAlign = numCh * (bits / 8);
    const hdr = Buffer.alloc(44);
    hdr.write("RIFF", 0, "ascii");
    hdr.writeUInt32LE(36 + pcm16.length, 4);
    hdr.write("WAVE", 8, "ascii");
    hdr.write("fmt ", 12, "ascii");
    hdr.writeUInt32LE(16, 16);          // PCM chunk size
    hdr.writeUInt16LE(1, 20);           // PCM format
    hdr.writeUInt16LE(numCh, 22);
    hdr.writeUInt32LE(sampleRate, 24);
    hdr.writeUInt32LE(byteRate, 28);
    hdr.writeUInt16LE(blockAlign, 32);
    hdr.writeUInt16LE(bits, 34);
    hdr.write("data", 36, "ascii");
    hdr.writeUInt32LE(pcm16.length, 40);
    return Buffer.concat([hdr, pcm16]);
  }

  app.get("/api/tts", async (req: Request, res: Response) => {
    try {
      const { text, tutorId } = req.query as { text: string; tutorId: string };

      if (!text || !tutorId) {
        return res.status(400).json({ error: "text and tutorId required" });
      }

      const voice = (TUTOR_TTS_VOICES[tutorId] ?? "alloy") as any;
      const inputText = text.slice(0, 4000);

      // gpt-audio uses chat/completions with audio modalities — supported by proxy
      const response = await (openai.chat.completions.create as any)({
        model: "gpt-audio",
        modalities: ["text", "audio"],
        audio: { voice, format: "pcm16" },
        messages: [
          {
            role: "system",
            content:
              "You are a text-to-speech engine. Read the user's message aloud verbatim — every word, exactly as written, in your natural voice. Do not add, change, or summarise anything.",
          },
          { role: "user", content: inputText },
        ],
      });

      const audioB64: string | undefined =
        response.choices?.[0]?.message?.audio?.data;

      if (!audioB64) {
        console.error("TTS: no audio data in response", JSON.stringify(response).slice(0, 300));
        return res.status(500).json({ error: "No audio data returned" });
      }

      const wav = buildWav(Buffer.from(audioB64, "base64"));
      res.set("Content-Type", "audio/wav");
      res.set("Cache-Control", "public, max-age=300");
      res.send(wav);
    } catch (err) {
      console.error("TTS error:", err);
      res.status(500).json({ error: "TTS generation failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
