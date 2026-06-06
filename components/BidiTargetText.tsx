import React from "react";
import { Text, type TextProps, type TextStyle, type StyleProp } from "react-native";

/**
 * ── Bidi / RTL helpers for learning-target text ──────────────────────────────
 *
 * The app chrome (Korean/English/Spanish/Indonesian UI) is ALWAYS left-to-right.
 * Only the learning *target* text can be right-to-left — today that means Arabic
 * (Egyptian colloquial, ar-EG). This module is the single place that decides
 * "is this target RTL?" so the check is not scattered across screens.
 *
 * IMPORTANT (additive contract): for any LTR target, `BidiTargetText` renders
 * EXACTLY like a plain <Text> — same children, no injected characters, no style
 * changes. Only when the target is RTL do we add writingDirection/textAlign and
 * wrap embedded LTR runs (romanization, Latin words, digits) in Unicode isolates
 * so they don't visually scramble inside the RTL line.
 */

// Unicode bidi isolates — keep an LTR run (romanization, names, numbers) as one
// visual chunk inside an RTL paragraph without leaking direction either way.
export const LRI = "⁦"; // LEFT-TO-RIGHT ISOLATE
export const PDI = "⁩"; // POP DIRECTIONAL ISOLATE
export const FSI = "⁨"; // FIRST STRONG ISOLATE (auto-detects the run's direction)

/**
 * True when the given language identifier denotes a right-to-left script.
 * Accepts either a human language name ("arabic") or a BCP-47 / Azure locale
 * ("ar-EG", "ar"). Case-insensitive. Everything else (ko/en/es/id, ko-KR, …)
 * returns false, so LTR behavior is completely unchanged.
 */
export function isRtlLang(lang: string | null | undefined): boolean {
  if (!lang) return false;
  const v = lang.toLowerCase();
  // Language names used across the union types (TutorLanguage / LearningLangKey …)
  if (v === "arabic") return true;
  // Locale / short codes: "ar", "ar-eg", "ar-sa", … (future RTL targets can be
  // added here, e.g. "he"/"hebrew", "fa"/"persian", "ur"/"urdu").
  if (v === "ar" || v.startsWith("ar-")) return true;
  return false;
}

// Matches a run of characters that should stay LTR even inside an RTL line:
// ASCII/Latin letters, digits, and the punctuation/symbols that typically ride
// along with romanization, names and numbers (so "ana 3ayez" or "Rudy 2026"
// reads as a single left-to-right token). Arabic-script and other strong-RTL
// characters are intentionally excluded.
const LTR_RUN = /[A-Za-z0-9][A-Za-z0-9 .,:;!?'"’“”()\[\]{}\-_/\\@#$%&*+=<>~`|]*/g;

/**
 * Wrap each embedded LTR run in LRI…PDI isolates. Used only for RTL targets.
 * Pure string transform; if there is no Latin/numeric content it returns the
 * input unchanged.
 */
export function isolateLtrRuns(text: string): string {
  if (!text) return text;
  return text.replace(LTR_RUN, (run) => {
    // Don't isolate a run that is only whitespace/punctuation with no actual
    // letter or digit — that would just add invisible characters for nothing.
    if (!/[A-Za-z0-9]/.test(run)) return run;
    return `${LRI}${run}${PDI}`;
  });
}

// Matches a run of Arabic-script text (letters + harakat + intra-run spaces and
// Arabic punctuation). The opposite case of isolateLtrRuns: used to isolate an
// embedded RTL (Arabic) run that sits INSIDE an LTR paragraph — e.g. the course
// tip / common-mistakes / example copy that mixes a Korean/English explanation
// with Arabic target snippets and parentheses. Without isolation the Arabic run
// and the neutral punctuation around it (parens, periods) visually scramble.
const RTL_RUN =
  /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿][؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿ً-ْ ،؛؟]*/g;

/**
 * Wrap each embedded Arabic-script run in FSI…PDI isolates so it renders as a
 * self-contained RTL chunk inside an LTR paragraph (the native-language UI text
 * that embeds Arabic target snippets). Pure string transform; returns the input
 * unchanged when there is no Arabic-script content, so it is a NO-OP for
 * ko/en/es/id-only text and cannot affect non-Arabic learners.
 */
export function isolateRtlRuns(text: string): string {
  if (!text) return text;
  return text.replace(RTL_RUN, (run) => `${FSI}${run.trimEnd()}${PDI}${run.endsWith(" ") ? " " : ""}`);
}

interface BidiTargetTextProps extends TextProps {
  /**
   * The learning-target language for this text — a union name ("arabic",
   * "english", …) or a locale ("ar-EG", "en-US", …). Drives RTL vs LTR.
   * Named `targetLang` (not `lang`) to avoid clashing with the web-only
   * accessibility `lang` attribute that React Native's TextProps already
   * declares as `string | undefined`.
   */
  targetLang: string | null | undefined;
  /**
   * Text alignment for the RTL case. Defaults to "right" (natural for RTL).
   * Pass "center" for centered hero sentences (lesson cards). For LTR targets
   * this prop is ignored entirely so existing layouts are untouched.
   */
  rtlAlign?: TextStyle["textAlign"];
  children?: React.ReactNode;
}

/**
 * Renders learning-target text with correct direction.
 *
 * - LTR target  → identical to `<Text style={style} {...rest}>{children}</Text>`.
 * - RTL target  → adds `writingDirection:'rtl'` + `textAlign`, and (when
 *   `children` is a plain string) isolates embedded LTR runs so romanization,
 *   names and numbers stay readable. Non-string children (already-segmented
 *   token arrays, e.g. the chat karaoke highlight) are passed through with the
 *   direction style applied but NOT re-isolated — the caller owns segmentation.
 */
export function BidiTargetText({
  targetLang,
  rtlAlign = "right",
  style,
  children,
  ...rest
}: BidiTargetTextProps) {
  const rtl = isRtlLang(targetLang);

  if (!rtl) {
    // Byte-for-byte the same as a plain <Text> for every existing language.
    return (
      <Text style={style} {...rest}>
        {children}
      </Text>
    );
  }

  const rtlStyle: StyleProp<TextStyle> = { writingDirection: "rtl", textAlign: rtlAlign };
  const content =
    typeof children === "string" ? isolateLtrRuns(children) : children;

  return (
    <Text style={[style, rtlStyle]} {...rest}>
      {content}
    </Text>
  );
}

export default BidiTargetText;
