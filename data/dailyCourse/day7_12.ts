/**
 * Day 7-12 Content (A1 Unit 2: Numbers & Time)
 *
 * Curriculum Design:
 * - STEP 1: Pimsleur Graduated Interval Recall + Anticipation
 * - STEP 2: Lexical Chunking (Michael Lewis) + Pattern Practice
 * - STEP 3: Task-Based Learning (Willis Framework)
 * - STEP 4: SM-2 Spaced Repetition + Active Recall
 *
 * Day 7:  Numbers 1-20 & Counting
 * Day 8:  Numbers 20-100 & Prices
 * Day 9:  Telling Time
 * Day 10: Daily Schedule & Routine
 * Day 11: Phone Numbers & Age
 * Day 12: Unit 2 Comprehensive Review
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
  LESSON_CONTENT_D7_8,
  MISSION_CONTENT_D7_8,
  REVIEW_CONTENT_D7_8,
} from "./day7_8_partial";

import {
  LESSON_CONTENT_D9_10,
  MISSION_CONTENT_D9_10,
  REVIEW_CONTENT_D9_10,
} from "./day9_10_partial";

import {
  LESSON_CONTENT_D11_12,
  MISSION_CONTENT_D11_12,
  REVIEW_CONTENT_D11_12,
} from "./day11_12_partial";

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 + STEP 2 (LESSON_CONTENT)
// ═══════════════════════════════════════════════════════════════════════════════

export const LESSON_CONTENT_DAY7_12: Record<
  string,
  Partial<Record<LearningLangKey, DayLessonData>>
> = {
  ...LESSON_CONTENT_D7_8,
  ...LESSON_CONTENT_D9_10,
  ...LESSON_CONTENT_D11_12,
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: MISSION TALK
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_CONTENT_DAY7_12: Record<
  string,
  Partial<Record<LearningLangKey, MissionTalkLangData>>
> = {
  ...MISSION_CONTENT_D7_8,
  ...MISSION_CONTENT_D9_10,
  ...MISSION_CONTENT_D11_12,
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: REVIEW
// ═══════════════════════════════════════════════════════════════════════════════

export const REVIEW_CONTENT_DAY7_12: Record<
  string,
  Partial<Record<LearningLangKey, ReviewQuestion[]>>
> = {
  ...REVIEW_CONTENT_D7_8,
  ...REVIEW_CONTENT_D9_10,
  ...REVIEW_CONTENT_D11_12,
};
