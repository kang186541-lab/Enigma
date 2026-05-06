/**
 * Legacy `/story` route — kept for deep-link compatibility only.
 *
 * The official Story Mode entry point is the tab screen at `app/(tabs)/story.tsx`,
 * which uses progress key `lingo_story_progress` (the same key the chapter player
 * `app/story-scene.tsx` reads/writes). Earlier this file rendered an independent
 * Story list that read a *different* key (`@lingua_story_progress`), so any chapter
 * the player completed never showed up here — confusing UX.
 *
 * Rather than delete this file (which would break any cached `/story` deep links),
 * we redirect to the canonical tab screen. Safe to remove entirely once we confirm
 * no external links target `/story`.
 */
import { Redirect } from "expo-router";

export default function StoryRedirect() {
  return <Redirect href="/(tabs)/story" />;
}
