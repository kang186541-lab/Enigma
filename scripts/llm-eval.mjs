// LLM quality eval harness — compare cheap providers (DeepSeek / Qwen) against
// the premium baseline (OpenAI gpt-4o / Anthropic Claude) on the app's ACTUAL
// tutor/learning tasks, across KO/EN/ES/ID. Outputs a side-by-side markdown.
//
// All providers are called through their OpenAI-COMPATIBLE /chat/completions
// endpoint, so one code path covers DeepSeek, Qwen (DashScope intl), and OpenAI.
// Anthropic uses its own messages API (separate adapter below).
//
// RUN (only the providers whose keys are set will run):
//   DEEPSEEK_API_KEY=sk-...  \
//   QWEN_API_KEY=sk-...       \   (Alibaba DashScope intl key)
//   OPENAI_API_KEY=sk-...     \   (baseline; currently exhausted)
//   ANTHROPIC_API_KEY=sk-...  \   (baseline; currently exhausted)
//   node scripts/llm-eval.mjs
//
// Output: scripts/llm-eval-output.md  (+ progress to console)

import { writeFileSync } from "node:fs";

// ── Providers (OpenAI-compatible chat/completions unless noted) ───────────────
// DeepSeek runs on its own direct API; Qwen + the premium baselines (GPT-4o,
// Claude) all run through OpenRouter (one OpenAI-compatible gateway) so a single
// OPENROUTER_API_KEY covers them — and sidesteps the exhausted direct OpenAI/
// Anthropic quotas. All endpoints are OpenAI-compatible /chat/completions.
const PROVIDERS = [
  {
    id: "deepseek-v3",
    label: "DeepSeek-V3",
    kind: "openai",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    keyEnv: "DEEPSEEK_API_KEY",
  },
  {
    id: "qwen-2.5-72b",
    label: "Qwen2.5-72B (OpenRouter)",
    kind: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "qwen/qwen-2.5-72b-instruct",
    keyEnv: "OPENROUTER_API_KEY",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o — premium baseline (OpenRouter)",
    kind: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4o",
    keyEnv: "OPENROUTER_API_KEY",
  },
  {
    id: "claude",
    label: "Claude Sonnet 4.5 — premium baseline (OpenRouter)",
    kind: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "anthropic/claude-sonnet-4.5",
    keyEnv: "OPENROUTER_API_KEY",
  },
];

// ── Eval cases — mirror the app's REAL tutor/learning tasks ───────────────────
// Each case is one or more {system,user} turns that reproduce what
// server/routes.ts sends for that feature. The "focus" note says what to judge.
const CASES = [
  {
    id: "chat-correction-ko-en",
    title: "Free tutor chat + correction — Korean native learning ENGLISH (core market)",
    focus: "Is the English reply natural+level-appropriate? Is the Korean correction explanation natural, warm, and pedagogically correct?",
    json: false,
    system:
      "You are Sarah, a warm, encouraging English tutor for a KOREAN beginner (A2). " +
      "Reply in 1-2 short, simple English sentences and keep the conversation going with a question. " +
      "If the learner's message has a grammar mistake, AFTER your reply add a new line: " +
      "`[교정] <틀린 부분> → <고친 부분>` and one short KOREAN sentence explaining WHY (natural, friendly Korean).",
    user: "Yesterday I go to school and meet my friend. We are play soccer.",
  },
  {
    id: "coach-ko-en",
    title: "Pronunciation coach note — Korean native, English word (light gpt-4o-mini task)",
    focus: "Is the Korean coaching tone warm + natural (Rudy persona)? One short sentence, concrete.",
    json: false,
    system:
      "You are Rudy, a friendly fox pronunciation coach. The learner is a Korean speaker practicing English. " +
      "Give ONE short, warm coaching sentence in KOREAN about how to fix the weak sound. Be specific and encouraging.",
    user: 'The learner said the word "world" and scored 58/100. Weak sounds: the "r" and the final "ld" cluster.',
  },
  {
    id: "chat-ko-target",
    title: "Korean PRODUCTION — English native learning KOREAN (hardest: honorifics/particles)",
    focus: "Is the produced Korean grammatically correct + natural for a beginner? Honorifics/particles right? Romanization helpful? English explanation clear?",
    json: false,
    system:
      "You are Jisu, a friendly Korean tutor for an ENGLISH-speaking beginner (A1). " +
      "Reply in ONE short, natural Korean sentence (polite 해요체), then on the next line give the romanization, " +
      "then on the next line a short English gloss. Keep it beginner-simple. End by gently inviting them to repeat.",
    user: "How do I say 'I would like a coffee, please' in Korean?",
  },
  {
    id: "npc-ko-id",
    title: "NPC roleplay — Korean native learning INDONESIAN (BETA, low-resource)",
    focus: "Is the Indonesian natural + correct for a café scenario? Stays in character, beginner-appropriate.",
    json: false,
    system:
      "You are a friendly café barista in Jakarta in a language-learning roleplay. " +
      "The learner is a beginner practicing INDONESIAN. Stay in character, reply in ONE short, natural Indonesian sentence, " +
      "and keep it simple enough for an A1 learner. Do not break character or use English.",
    user: "Halo, saya mau pesan kopi.",
  },
  {
    id: "diagnosis-json",
    title: "Structured JSON output — learner diagnosis (instruction-following reliability)",
    focus: "Does it return STRICT valid JSON with exactly the requested keys? No prose, no code fences.",
    json: true,
    system:
      "You assess a language learner from their self-introduction and return ONLY a JSON object, no prose, no markdown. " +
      'Shape: {"level":"A1|A2|B1|B2","goals":["travel"|"work"|"study"|"hobby"|"relationship"|"exam"],"note":"<one short KOREAN sentence>"}.',
    user:
      "Learner says (Korean): \"안녕하세요, 저는 회사 다니는데 출장을 자주 가서 영어로 호텔 체크인이랑 미팅 잡는 걸 연습하고 싶어요. 간단한 문장은 말할 수 있어요.\"",
  },
];

const TIMEOUT_MS = 30000;

async function callOpenAICompatible(provider, key, sys, user, json) {
  const body = {
    model: provider.model,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    max_tokens: 400,
    temperature: 0.4,
  };
  if (json) body.response_format = { type: "json_object" };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) return { error: `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}` };
    const data = await res.json();
    return { text: data.choices?.[0]?.message?.content?.trim() ?? "(empty)" };
  } catch (e) {
    return { error: String(e?.message ?? e) };
  } finally {
    clearTimeout(t);
  }
}

async function callAnthropic(provider, key, sys, user, json) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(provider.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 400,
        temperature: 0.4,
        system: json ? `${sys}\n\nReturn ONLY valid JSON, no markdown fences.` : sys,
        messages: [{ role: "user", content: user }],
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) return { error: `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}` };
    const data = await res.json();
    const text = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    return { text: text || "(empty)" };
  } catch (e) {
    return { error: String(e?.message ?? e) };
  } finally {
    clearTimeout(t);
  }
}

async function run() {
  const active = PROVIDERS.filter((p) => process.env[p.keyEnv]?.trim());
  if (active.length === 0) {
    console.error("No provider keys set. Set at least DEEPSEEK_API_KEY (and optionally QWEN_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY).");
    process.exit(1);
  }
  console.log(`Active providers: ${active.map((p) => p.label).join(", ")}`);

  const out = [`# LLM tutor-quality comparison\n`, `Providers: ${active.map((p) => `${p.label} (\`${p.model}\`)`).join(", ")}\n`];

  for (const c of CASES) {
    console.log(`\n=== ${c.title} ===`);
    out.push(`\n---\n\n## ${c.title}\n\n**What to judge:** ${c.focus}\n\n**Learner input:** ${c.user}\n`);
    for (const p of active) {
      const key = process.env[p.keyEnv].trim();
      const started = Date.now();
      const r = p.kind === "anthropic"
        ? await callAnthropic(p, key, c.system, c.user, c.json)
        : await callOpenAICompatible(p, key, c.system, c.user, c.json);
      const ms = Date.now() - started;
      const body = r.error ? `⚠️ ERROR: ${r.error}` : r.text;
      console.log(`  [${p.label}] ${ms}ms ${r.error ? "(error)" : "ok"}`);
      out.push(`\n### ${p.label} — ${ms}ms\n\n\`\`\`\n${body}\n\`\`\`\n`);
    }
  }

  const outPath = "scripts/llm-eval-output.md";
  writeFileSync(outPath, out.join("\n"), "utf8");
  console.log(`\nWrote ${outPath}`);
}

run();
