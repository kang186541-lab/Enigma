/**
 * Lesson Arc — 5-Move structured lesson flow for tutor chat.
 *
 * Inspired by the Presentation-Practice-Production teaching model plus the
 * Connect→Reflect bookends used by effective tutors.
 *
 * The *arc* is client-authoritative: the client tells the server which phase
 * we're in, and the server's system prompt nudges the AI to behave
 * accordingly. The AI can hint at transitioning to the next move via a
 * [PHASE_ADVANCE] metadata block.
 *
 * Trilingual compliance:
 *   - Phase names/labels shown to the user are translated per native language.
 *   - AI responses stay in the tutor's target language.
 *   - Progress stepper respects `useLanguage().nativeLanguage`.
 */

export type LessonPhase = "connect" | "model" | "guided" | "free" | "reflect" | "done";

export const LESSON_PHASE_ORDER: LessonPhase[] = [
  "connect", "model", "guided", "free", "reflect",
];

export function nextPhase(current: LessonPhase): LessonPhase {
  const idx = LESSON_PHASE_ORDER.indexOf(current);
  if (idx < 0) return "connect";
  if (idx >= LESSON_PHASE_ORDER.length - 1) return "done";
  return LESSON_PHASE_ORDER[idx + 1];
}

/** Short label shown in the progress stepper. */
export function phaseLabel(phase: LessonPhase, nativeLang: string): string {
  const isKo = nativeLang === "korean";
  const isEs = nativeLang === "spanish";
  switch (phase) {
    case "connect": return isKo ? "연결" : isEs ? "Conectar" : "Connect";
    case "model":   return isKo ? "시범" : isEs ? "Modelo"   : "Model";
    case "guided":  return isKo ? "연습" : isEs ? "Guiado"   : "Guided";
    case "free":    return isKo ? "자유" : isEs ? "Libre"    : "Free";
    case "reflect": return isKo ? "정리" : isEs ? "Repaso"   : "Reflect";
    case "done":    return isKo ? "완료" : isEs ? "Hecho"    : "Done";
  }
}

/** Longer description used in tooltips / onboarding. */
export function phaseDescription(phase: LessonPhase, nativeLang: string): string {
  const isKo = nativeLang === "korean";
  const isEs = nativeLang === "spanish";
  switch (phase) {
    case "connect":
      return isKo ? "지난 학습 돌아보고 오늘 주제 소개"
        : isEs ? "Repaso rápido + presentar el tema de hoy"
        : "Warm up and introduce today's topic";
    case "model":
      return isKo ? "튜터가 목표 표현을 직접 시범"
        : isEs ? "El tutor modela las expresiones objetivo"
        : "Tutor demonstrates target expressions";
    case "guided":
      return isKo ? "안내를 받으며 부분 연습"
        : isEs ? "Práctica guiada paso a paso"
        : "Guided practice with scaffolding";
    case "free":
      return isKo ? "실제 상황에서 자유롭게 사용"
        : isEs ? "Uso libre en una situación real"
        : "Free production in a real context";
    case "reflect":
      return isKo ? "배운 것 정리 + 메타인지"
        : isEs ? "Resumen y metacognición"
        : "Summary and metacognition";
    case "done":
      return isKo ? "수업 완료" : isEs ? "Lección completa" : "Lesson complete";
  }
}

/** Server prompt fragment describing what the tutor should do THIS turn. */
export function phaseInstructionForPrompt(phase: LessonPhase, lessonTopic: string | null): string {
  const topic = lessonTopic ? `"${lessonTopic}"` : "today's topic";
  switch (phase) {
    case "connect":
      return `You are in the CONNECT phase. Warmly acknowledge the learner and briefly connect to prior knowledge or their interests. Introduce today's topic (${topic}) in 1 short sentence. Ask ONE hook question that gets them into the right mental space. Keep the whole turn to 2-3 sentences.`;
    case "model":
      return `You are in the MODEL phase. Demonstrate 1-2 target expressions for today's topic (${topic}). Say the expression in character, then briefly note when to use it. Invite the learner to try by showing them the pattern they should repeat. Keep it to 3-4 sentences.`;
    case "guided":
      return `You are in the GUIDED PRACTICE phase. Give the learner a small, scaffolded task — a fill-in-the-blank, a prompt with a hint, or a partial sentence to complete. Evaluate their response next turn, give one piece of concrete feedback, and ask for another attempt. Keep scaffolding high; they are still learning the pattern.`;
    case "free":
      return `You are in the FREE PRODUCTION phase. Set up a realistic scenario (${topic}) and let the learner speak freely. Your role: stay in character, respond naturally to what they say, and weave in the target expressions only if natural. This is the phase where you let them try without prompting — only intervene with corrections (via the [CORRECTION] protocol) when needed.`;
    case "reflect":
      return `You are in the REFLECT phase. The learner has just practiced ${topic}. Do TWO things in one short reply: (1) give ONE specific positive observation about what they did well, (2) ask ONE metacognition question like "what felt easy / hard today?" or "which expression do you want to remember?" Be warm. This is the last pedagogical turn before we wrap up.`;
    case "done":
      return `The lesson is done. Simply say a warm goodbye in character (1 sentence) and mention you look forward to the next session. Do NOT start a new teaching cycle.`;
  }
}

/**
 * Very rough heuristic for when to advance phase automatically on the client
 * without waiting for the AI. Used so the stepper doesn't stall if the AI
 * forgets to emit [PHASE_ADVANCE].
 *
 * Returns true if we should move to the next phase.
 */
export function shouldAutoAdvance(phase: LessonPhase, turnsInPhase: number): boolean {
  switch (phase) {
    case "connect": return turnsInPhase >= 2;
    case "model":   return turnsInPhase >= 2;
    case "guided":  return turnsInPhase >= 4;
    case "free":    return turnsInPhase >= 5;
    case "reflect": return turnsInPhase >= 2;
    default: return false;
  }
}
