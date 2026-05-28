import type { NativeLanguage } from "@/context/LanguageContext";

/**
 * Single source of truth for the per-language flag emoji used across the app.
 * Shapes that diverge from this (per-tutor flags, combined flags like 🇬🇧🇺🇸,
 * or chapter maps that add 🇪🇬/🌍) intentionally keep their own local maps.
 */
export const LANG_FLAGS: Record<NativeLanguage, string> = {
  korean: "🇰🇷",
  english: "🇬🇧",
  spanish: "🇪🇸",
};

/** Flag emoji for a native language. */
export function flagFor(lang: NativeLanguage): string {
  return LANG_FLAGS[lang];
}
