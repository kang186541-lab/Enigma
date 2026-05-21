// Lightweight runtime translator with AsyncStorage cache.
//
// Use case: the Phrase database in speak.tsx has `meaning` written in Korean
// and `tip` written in English. A Spanish or English-native user looking at
// the speak tab used to see Korean meanings and an English tip — broken
// trilingual UX. Properly i18n-ing 400+ phrases at the data layer would be
// a separate translation pass; this hook fills the gap at render time by
// calling /api/translate exactly once per (text, targetLang) and persisting
// the result.

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/lib/query-client";

type Lang = "korean" | "english" | "spanish";

const CACHE_PREFIX = "@rt_translate_v1:";

// Naive script sniff. Good enough to decide whether translation is needed —
// false positives translate when not strictly necessary, which the cache
// makes cheap on the second hit.
function detectLang(text: string): Lang | null {
  if (!text || typeof text !== "string") return null;
  if (/[가-힯ᄀ-ᇿ㄰-㆏]/.test(text)) return "korean";
  if (/[áéíóúñüÁÉÍÓÚÑÜ¿¡]/.test(text)) return "spanish";
  // Latin-only could be English or Spanish without diacritics — assume English
  // (callers can pass `assumed` to override).
  if (/^[\x00-\x7F\s]+$/.test(text)) return "english";
  return null;
}

function cacheKey(text: string, target: Lang): string {
  // Slice to bound key length; text is the cache key body.
  return `${CACHE_PREFIX}${target}:${text.slice(0, 200)}`;
}

// In-memory L1 cache so re-renders inside the same session skip the
// AsyncStorage round trip.
const memCache = new Map<string, string>();

/**
 * Returns the text translated into `target` if it's not already in that
 * language. Returns `text` immediately and updates when the translation
 * lands. Failures return the original silently.
 */
export function useLocalized(text: string, target: Lang, sourceHint?: Lang): string {
  const [value, setValue] = useState<string>(text);
  useEffect(() => {
    let cancelled = false;
    if (!text) { setValue(text); return; }
    const sniffed = detectLang(text);
    const source = sniffed ?? sourceHint ?? null;
    // Already in the right language → no-op.
    if (!source || source === target) { setValue(text); return; }

    const key = cacheKey(text, target);
    const mem = memCache.get(key);
    if (mem) { setValue(mem); return; }

    setValue(text); // show source while we fetch

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (cancelled) return;
        if (stored) {
          memCache.set(key, stored);
          setValue(stored);
          return;
        }
        const res = await fetch(new URL("/api/translate", getApiUrl()).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLanguage: target }),
        });
        if (!res.ok) return;
        const json = await res.json() as { translation?: string };
        if (cancelled) return;
        const translated = (json.translation ?? "").trim();
        if (!translated) return;
        memCache.set(key, translated);
        AsyncStorage.setItem(key, translated).catch(() => {});
        setValue(translated);
      } catch (e) {
        console.warn('[runtimeTranslate] fetch failed:', e);
      }
    })();

    return () => { cancelled = true; };
  }, [text, target, sourceHint]);
  return value;
}
