/**
 * Typewriter — game-style dialogue rendering
 *
 * Reveals `text` one character at a time at `speedMs` interval (default 25ms).
 * Exposes an imperative API via ref:
 *   - `skip()` instantly reveals the full text and marks done
 *   - `isDone()` returns whether typing has completed
 *
 * The parent should call `skip()` on the first user "next" tap and only
 * actually advance to the next scene on the second tap (or directly when
 * already done). This matches the convention used by Pokémon / Final Fantasy /
 * modern visual novels.
 *
 * `onComplete` fires once when the text fully reveals (either organically or
 * via skip()). Use this to trigger a blinking ▼ indicator in the parent.
 *
 * Reset behavior: whenever `text` changes, the animation restarts from empty.
 * This means simply switching scenes drives a fresh typing pass with no
 * lifecycle gymnastics.
 */

import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import { Text, TextStyle, StyleProp } from "react-native";

export interface TypewriterHandle {
  /** Instantly reveal the full text and mark animation complete. */
  skip: () => void;
  /** Whether the animation has fully completed (or was empty). */
  isDone: () => boolean;
}

interface Props {
  text: string;
  /** ms per character. Default 25ms (≈40 chars/sec) — game-feel pacing. */
  speedMs?: number;
  /** Called once when typing completes (organically or via skip). */
  onComplete?: () => void;
  textStyle?: StyleProp<TextStyle>;
  /** Optional override for empty-string handling (default: instantly done). */
  startDelayMs?: number;
}

const Typewriter = forwardRef<TypewriterHandle, Props>(function Typewriter(
  { text, speedMs = 25, onComplete, textStyle, startDelayMs = 0 },
  ref,
) {
  const [displayed, setDisplayed] = useState("");
  // Use a ref for `done` so the imperative `isDone()` always reads the latest
  // value (state reads inside useImperativeHandle close over stale snapshots).
  const doneRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeFiredRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const fireComplete = () => {
    if (completeFiredRef.current) return;
    completeFiredRef.current = true;
    onCompleteRef.current?.();
  };

  useImperativeHandle(
    ref,
    () => ({
      skip: () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setDisplayed(text);
        doneRef.current = true;
        fireComplete();
      },
      isDone: () => doneRef.current,
    }),
    [text],
  );

  useEffect(() => {
    // Reset for new text
    setDisplayed("");
    doneRef.current = false;
    completeFiredRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!text) {
      doneRef.current = true;
      fireComplete();
      return;
    }

    // Use a single Array.from so emoji / surrogate pairs are not split
    // mid-codepoint. JS string slicing on raw indices can break a 👋 in half.
    const chars = Array.from(text);
    let i = 0;

    const tick = () => {
      i += 1;
      if (i >= chars.length) {
        setDisplayed(text);
        doneRef.current = true;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        fireComplete();
      } else {
        setDisplayed(chars.slice(0, i).join(""));
      }
    };

    const startTimer = setTimeout(() => {
      intervalRef.current = setInterval(tick, speedMs);
    }, startDelayMs);

    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speedMs, startDelayMs]);

  return <Text style={textStyle}>{displayed}</Text>;
});

export default Typewriter;
