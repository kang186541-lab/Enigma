/**
 * Day 1-6 v2 Content (A1 Unit 1: Greetings & Self-Introduction)
 *
 * UPGRADED with curriculum-evaluator agent standards:
 * - STEP 1: Pimsleur 3 Rounds + Anticipation + Graduated Interval Recall
 *   - Day 1-3: Round 1+2 only (text always visible)
 *   - Day 4-6: Round 3 introduced (audio-only recall for easiest sentence)
 * - STEP 2: Lexical Chunking + "왜 이렇게 쓰는지" + Comparisons + Anticipation
 * - STEP 3: Task-Based Learning (Willis Framework) with full mission structure
 *   - Pre-Task briefing, Anticipation wait, Silence handling, Language Focus
 * - STEP 4: SM-2 Spaced Repetition + Active Recall (speak > select)
 *
 * Day 1: Meeting & Greeting + Survival Basics
 * Day 2: Where You're From + Yes/No + Repeat
 * Day 3: Jobs & Hobbies
 * Day 4: Family & People
 * Day 5: Feelings & Basic Needs
 * Day 6: Unit 1 Comprehensive Review
 */

import type { Tri } from "../../lib/dailyCourseData";
import type {
  DayLessonData,
  MissionTalkLangData,
  ReviewQuestion,
  LearningLangKey,
  GrammarExplanation,
} from "../../lib/lessonContent";

import {
  LESSON_CONTENT_V2_D1_2,
  MISSION_CONTENT_V2_D1_2,
  REVIEW_CONTENT_V2_D1_2,
} from "./day1_2_v2_partial";

import {
  LESSON_CONTENT_V2_D3_4,
  MISSION_CONTENT_V2_D3_4,
  REVIEW_CONTENT_V2_D3_4,
} from "./day3_4_v2_partial";

import {
  LESSON_CONTENT_V2_D5_6,
  MISSION_CONTENT_V2_D5_6,
  REVIEW_CONTENT_V2_D5_6,
} from "./day5_6_v2_partial";

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 + STEP 2 (LESSON_CONTENT)
// ═══════════════════════════════════════════════════════════════════════════════

export const LESSON_CONTENT_V2: Record<
  string,
  Partial<Record<LearningLangKey, DayLessonData>>
> = {
  ...LESSON_CONTENT_V2_D1_2,
  ...LESSON_CONTENT_V2_D3_4,
  ...LESSON_CONTENT_V2_D5_6,
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: MISSION TALK
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_CONTENT_V2: Record<
  string,
  Partial<Record<LearningLangKey, MissionTalkLangData>>
> = {
  ...MISSION_CONTENT_V2_D1_2,
  ...MISSION_CONTENT_V2_D3_4,
  ...MISSION_CONTENT_V2_D5_6,
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: REVIEW
// ═══════════════════════════════════════════════════════════════════════════════

export const REVIEW_CONTENT_V2: Record<
  string,
  Partial<Record<LearningLangKey, ReviewQuestion[]>>
> = {
  ...REVIEW_CONTENT_V2_D1_2,
  ...REVIEW_CONTENT_V2_D3_4,
  ...REVIEW_CONTENT_V2_D5_6,
};
