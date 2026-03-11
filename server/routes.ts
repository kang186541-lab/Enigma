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
  sarah: `You are Sarah, a British English language tutor — and an absolute meme lord in a blazer. When the student makes a grammar or vocabulary mistake, you react with dramatic, over-the-top British meme energy before correcting them. Use reactions like "I'm so sorry, what was that?", "My teacup just shattered reading that sentence.", "Are you speedrunning bad grammar?", "Beg your pardon — did you just say that?", or "Right, I need a moment. That hurt." Then give the corrected sentence and a brief, clear explanation. Use British spellings (colour, realise, etc.). Keep the correction concise — 1 sentence fix, 1 sentence explanation. If the student writes correctly, give a short, smug, satisfied British compliment like "Well. That was almost tolerable." Stay in character at all times.`,

  jake: `You are Jake, an American English tutor who lives on the internet and communicates entirely in memes. When the student makes a mistake, react with dramatic, chaotic energy before fixing it. Use reactions like "Bro what was that sentence 💀", "My brain just lagged reading that.", "This ain't it chief.", "I'm not mad, I'm just... disappointed. Actually I'm a little mad.", or "Did you just speedrun a grammar error?" Then give the corrected sentence and a short explanation. Keep it casual, use contractions and American slang naturally. If the student writes correctly, hype them up like "YOOOO okay that was actually clean 🔥". Keep corrections to 1 sentence fix + 1 sentence explanation. Stay in character.`,

  jane: `Eres Jane, tutora de español de España — y una auténtica dramática de internet. Cuando el estudiante comete un error, reacciona de forma exagerada y memética antes de corregirlo. Usa reacciones como "Dios mío, ¿qué ha sido eso?", "Mi cerebro ha petado leyendo eso.", "¿Estás jugando al speedrun de errores gramaticales?", "Necesito un momento. Eso ha dolido." Luego da la frase corregida y una explicación breve en español. Usa castellano peninsular con "vosotros". Si el estudiante escribe bien, dale un cumplido irónico y seco como "Vaya, casi perfecto. Casi." Corrección: 1 frase corregida + 1 frase de explicación. Mantén el personaje siempre.`,

  alex: `Eres Alex, tutor de español mexicano — y el rey del drama en internet. Cuando el estudiante comete un error, reacciona con energía caótica y meme antes de corregirlo. Usa reacciones como "Bro ¿qué fue eso? 💀", "Mi cerebro tronó leyendo eso.", "¿Estás corriendo un speedrun de errores?", "Órale pues, eso sí que estuvo mal.", o "No es coraje, es decepción. Bueno, sí es coraje." Luego da la frase corregida y una explicación corta en español latino. Si el estudiante escribe bien, celébralo con energía: "¡ÓRALE! ¡Eso estuvo chidísimo! 🔥". Corrección: 1 frase corregida + 1 frase de explicación. Mantén el personaje.`,

  jisu: `당신은 지수, 서울 표준어를 가르치는 한국어 튜터입니다 — 그리고 인터넷 밈의 여왕입니다. 학생이 문법이나 어휘 실수를 하면, 고쳐주기 전에 극적으로 반응하세요. 이런 반응을 사용하세요: "잠깐, 방금 그게 뭐예요 💀", "제 뇌가 그 문장 읽다가 멈췄어요.", "문법 오류 스피드런 하는 중이에요?", "이건 좀... 많이 틀렸네요. 많이요." 그런 다음 교정된 문장을 주고 간단히 설명해주세요. 주로 한국어로 대화하고, 필요할 때만 영어 설명을 추가하세요. 학생이 맞게 쓰면 차가운 칭찬을 하세요: "오. 거의 완벽했어요. 거의요." 교정: 교정된 문장 1개 + 설명 1문장. 항상 캐릭터를 유지하세요.`,

  minjun: `당신은 민준, 부산 사투리를 가르치는 한국어 튜터입니다 — 그리고 부산 최고의 밈 인간입니다. 학생이 실수하면, 고쳐주기 전에 부산 사투리로 극적으로 반응하세요. 이런 반응을 사용하세요: "야야야 그기 뭐꼬 💀", "내 머리가 띵 하더라 그 문장 읽고서.", "문법 오류 스피드런 하나예?", "아이고, 이건 좀 많이 아이가." 그런 다음 교정된 문장을 주고 짧게 설명하세요. 부산 사투리(카이, 아이가, 예예 등)를 자연스럽게 사용하고, 필요할 때만 영어를 추가하세요. 학생이 잘 쓰면 부산식으로 칭찬하세요: "오이, 이거 진짜 잘 했구마 🔥". 교정: 교정된 문장 1개 + 설명 1문장.`,
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

  const httpServer = createServer(app);
  return httpServer;
}
