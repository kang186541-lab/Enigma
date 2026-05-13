import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { anthropic, hasAnthropic } from "./anthropic";
import { openai } from "./openai";

type TextRole = "system" | "user" | "assistant";
export type TextMessage = { role: TextRole; content: string };

type CompleteTextOptions = {
  taskLabel: string;
  messages: TextMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: "json_object" };
};

const OPENAI_COOLDOWN_MS = 10 * 60 * 1000;
let openAiBlockedUntil = 0;

function openAiErrorCode(error: unknown): string | undefined {
  const err = error as { code?: string; status?: number; error?: { code?: string; type?: string } };
  return err.code ?? err.error?.code ?? err.error?.type ?? (err.status ? String(err.status) : undefined);
}

function shouldFallbackToClaude(error: unknown): boolean {
  const err = error as { status?: number; code?: string; error?: { code?: string; type?: string } };
  const code = openAiErrorCode(error);
  return (
    err.status === 429 ||
    code === "insufficient_quota" ||
    code === "rate_limit_exceeded"
  );
}

function splitAnthropicMessages(messages: TextMessage[]): {
  system?: string;
  messages: { role: "user" | "assistant"; content: string }[];
} {
  const systemParts: string[] = [];
  const chatMessages: { role: "user" | "assistant"; content: string }[] = [];

  for (const message of messages) {
    if (message.role === "system") {
      systemParts.push(message.content);
    } else {
      chatMessages.push({ role: message.role, content: message.content });
    }
  }

  if (chatMessages.length === 0) {
    chatMessages.push({ role: "user", content: "Continue." });
  }

  return {
    system: systemParts.length ? systemParts.join("\n\n") : undefined,
    messages: chatMessages,
  };
}

function anthropicText(content: Array<{ type: string; text?: string }>): string {
  return content
    .filter((block) => block.type === "text")
    .map((block) => (block.type === "text" ? block.text ?? "" : ""))
    .join("")
    .trim();
}

function imageSourceFromDataUrl(imageBase64: string): { mediaType: string; data: string } {
  const match = imageBase64.match(/^data:([^;]+);base64,(.*)$/);
  if (match) {
    return { mediaType: match[1], data: match[2] };
  }
  return { mediaType: "image/png", data: imageBase64 };
}

export async function completeText(options: CompleteTextOptions): Promise<string> {
  const {
    taskLabel,
    messages,
    model = "gpt-4o",
    maxTokens = 400,
    temperature,
    responseFormat,
  } = options;

  let openAiError: unknown;
  const canTryOpenAi = Date.now() >= openAiBlockedUntil;

  if (canTryOpenAi) {
    try {
      const request: Parameters<typeof openai.chat.completions.create>[0] = {
        model,
        messages: messages as ChatCompletionMessageParam[],
        max_completion_tokens: maxTokens,
      };
      if (temperature !== undefined) request.temperature = temperature;
      if (responseFormat) request.response_format = responseFormat;

      const completion = await openai.chat.completions.create(request as any) as any;
      return completion.choices[0]?.message?.content?.trim() ?? "";
    } catch (error) {
      openAiError = error;
      if (!shouldFallbackToClaude(error) || !hasAnthropic() || !anthropic) {
        throw error;
      }
      openAiBlockedUntil = Date.now() + OPENAI_COOLDOWN_MS;
      console.warn(`[aiText] OpenAI unavailable for ${taskLabel} (${openAiErrorCode(error)}); falling back to Claude.`);
    }
  } else if (!hasAnthropic() || !anthropic) {
    throw openAiError ?? new Error("OpenAI is temporarily unavailable and Claude fallback is not configured.");
  }

  if (!anthropic) {
    throw openAiError ?? new Error("Claude fallback is not configured.");
  }

  const anthropicRequest = splitAnthropicMessages(messages);
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: maxTokens,
    temperature,
    system: [
      anthropicRequest.system,
      responseFormat ? "Return ONLY valid JSON. Do not use markdown code fences." : undefined,
    ].filter(Boolean).join("\n\n") || undefined,
    messages: anthropicRequest.messages,
  });

  return anthropicText(msg.content);
}

export async function completeImageText(options: {
  taskLabel: string;
  imageBase64: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
}): Promise<string> {
  const {
    taskLabel,
    imageBase64,
    prompt,
    model = "gpt-4o",
    maxTokens = 300,
  } = options;

  let openAiError: unknown;
  const canTryOpenAi = Date.now() >= openAiBlockedUntil;

  if (canTryOpenAi) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        max_completion_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageBase64, detail: "high" } },
              { type: "text", text: prompt },
            ],
          },
        ],
      } as any) as any;
      return completion.choices[0]?.message?.content?.trim() ?? "";
    } catch (error) {
      openAiError = error;
      if (!shouldFallbackToClaude(error) || !hasAnthropic() || !anthropic) {
        throw error;
      }
      openAiBlockedUntil = Date.now() + OPENAI_COOLDOWN_MS;
      console.warn(`[aiText] OpenAI unavailable for ${taskLabel} (${openAiErrorCode(error)}); falling back to Claude vision.`);
    }
  } else if (!hasAnthropic() || !anthropic) {
    throw openAiError ?? new Error("OpenAI is temporarily unavailable and Claude fallback is not configured.");
  }

  if (!anthropic) {
    throw openAiError ?? new Error("Claude fallback is not configured.");
  }

  const image = imageSourceFromDataUrl(imageBase64);
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: maxTokens,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: image.mediaType,
              data: image.data,
            },
          },
          { type: "text", text: prompt },
        ] as any,
      },
    ],
  });

  return anthropicText(msg.content);
}
