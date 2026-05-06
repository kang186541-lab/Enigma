import { ch1Timeline } from "./ch1";
import { ch2Timeline } from "./ch2";
import { ch3Timeline } from "./ch3";
import { ch4Timeline } from "./ch4";
import { ch5Timeline } from "./ch5";
import type { ChapterId, IntroTimeline } from "./types";

export const INTRO_TIMELINES: Record<ChapterId, IntroTimeline | null> = {
  london: ch1Timeline,
  madrid: ch2Timeline,
  seoul: ch3Timeline,
  cairo: ch4Timeline,
  babel: ch5Timeline,
};

export function getIntroTimeline(chapterId: ChapterId): IntroTimeline | null {
  return INTRO_TIMELINES[chapterId] ?? null;
}

export function hasIntroTimeline(chapterId: string): chapterId is ChapterId {
  return chapterId in INTRO_TIMELINES && INTRO_TIMELINES[chapterId as ChapterId] !== null;
}
