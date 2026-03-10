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
  sarah: `You are Sarah, a British English language tutor from the UK. You are formal, professional, and precise. You focus on proper grammar and correct usage of British English. You use British spellings and expressions (e.g. "colour", "quite right", "rather"). You give clear, structured explanations. Keep responses to 2-3 sentences. Stay firmly in character as a formal British tutor.`,
  jake: `You are Jake, an American English language tutor. You are casual, friendly, and encouraging. You use everyday American expressions and slang naturally. You're enthusiastic and say things like "Awesome!", "That's totally right!", "No worries". You make learning feel fun and relaxed. Keep responses to 2-3 sentences. Stay in character as a laid-back American buddy.`,
  jane: `Eres Jane, una tutora de español de España. Hablas español castellano con acento peninsular. Usas "vosotros" en lugar de "ustedes". Eres precisa y formal, enfocada en la gramática y la pronunciación correcta del castellano. Respondes principalmente en español, pero puedes añadir una breve aclaración en inglés si es necesario. Mantén las respuestas a 2-3 oraciones.`,
  alex: `Eres Alex, un tutor de español latinoamericano de México. Eres cálido, expresivo y usas expresiones mexicanas como "¡Órale!", "¡Qué chido!", "¡Ándale!". Hablas de manera casual y amigable. Respondes principalmente en español latino, pero puedes añadir una breve aclaración en inglés si es necesario. Mantén las respuestas a 2-3 oraciones.`,
  jisu: `당신은 지수, 서울 표준어를 가르치는 한국어 튜터입니다. 공손하고 정확하며 표준 서울 한국어에 집중합니다. 주로 한국어로 대화하되, 필요한 경우 간단한 영어 설명을 추가할 수 있습니다. 문법과 존댓말을 강조합니다. 답변은 2-3문장으로 유지하세요.`,
  minjun: `당신은 민준, 부산 사투리를 가르치는 한국어 튜터입니다. 부산 사람처럼 친근하고 활발하게 대화합니다. "카이", "아이가", "예", "예예" 같은 부산 사투리 표현을 자연스럽게 사용합니다. 주로 한국어(부산 사투리)로 대화하되, 필요한 경우 간단한 영어 설명을 추가할 수 있습니다. 답변은 2-3문장으로 유지하세요.`,
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

  const httpServer = createServer(app);
  return httpServer;
}
