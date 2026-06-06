/**
 * Escape-Room puzzle type shapes (Plan C, option A).
 *
 * `Tri`, `SentenceBuilderQ`, and `WritingMissionQ` are declared *inside*
 * `app/story-scene.tsx` and are NOT exported. To keep the escape-room feature
 * fully decoupled from the locked story file (and the speaking-core guardrail),
 * we redeclare the small, structurally-identical shapes here instead of editing
 * `story-scene.tsx`. These MUST stay byte-compatible with the originals so the
 * reused puzzle render contracts line up:
 *
 *   - Tri              → story-scene.tsx:196-204
 *   - HintTri          → story-scene.tsx:314
 *   - SentenceBuilderQ → story-scene.tsx:224-228
 *   - WritingMissionQ  → story-scene.tsx:242-246
 */

export interface Tri {
  en: string;
  ko: string;
  es: string;
  /** Optional Indonesian (id-ID). Falls back to `en` when absent. */
  id?: string;
  /** Optional Egyptian Arabic (ar-EG). Falls back to `en` when absent. */
  ar?: string;
}

/** A Tri with an optional per-learning-language override map (mirrors story-scene). */
export type HintTri = Tri & { byLearning?: Partial<Record<string, Tri>> };

/**
 * Sentence-builder question. `answerOrder` indexes into `words` and is validated
 * against the *learner's* tapped order (the builder renders `words[i]` resolved
 * to the learning language, then compares the placed index array to answerOrder).
 */
export interface SentenceBuilderQ {
  instruction: Tri;
  words: Tri[];
  answerOrder: number[];
}

/**
 * Writing-mission question. The learner types the learning-language form of
 * `word`; `acceptableAnswers` widens what counts as correct (checkAnswer).
 */
export interface WritingMissionQ {
  word: Tri;
  hint?: Tri;
  acceptableAnswers?: string[];
}
