import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { C, F } from "@/constants/theme";

type Tri = {
  en: string;
  ko: string;
  es: string;
};

type BossSpellHint = {
  h1: Tri;
  h2: Tri;
  h3: Tri;
};

export interface BossSpellQuestion {
  spellChunks: string[];
  separators: string[];
  wordPool: string[];
  instruction: Tri;
  hints: BossSpellHint;
  storyReason?: Tri;
  storyConsequence?: Tri;
  doorImage?: ImageSourcePropType;
}

interface BossSpellPuzzleProps {
  puzzle: { pType: "boss-spell"; questions: [BossSpellQuestion] };
  lang: string;
  onSolved: () => void;
  onResetHints?: () => void;
}

type CueKey = "chime" | "thud" | "doorCrack" | "burst";
type SlotState = "empty" | "filled" | "wrong";

const CUE_ASSETS = {
  chime: require("@/assets/sounds/cue_chime.wav"),
  thud: require("@/assets/sounds/cue_thud.wav"),
  doorCrack: require("@/assets/sounds/cue_door_crack.wav"),
  burst: require("@/assets/sounds/cue_burst.wav"),
} as const;

function tri(value: Tri, lang: string): string {
  if (lang === "korean") return value.ko;
  if (lang === "spanish") return value.es;
  return value.en;
}

function buildSpell(chunks: string[], separators: string[]): string {
  return chunks
    .map((chunk, index) => {
      const separator = separators[index] ?? "";
      const needsSpace = index < chunks.length - 1 && !/\s$/.test(separator) ? " " : "";
      return `${chunk}${separator}${needsSpace}`;
    })
    .join("")
    .trim();
}

export default function BossSpellPuzzle({ puzzle, lang, onSolved, onResetHints }: BossSpellPuzzleProps) {
  const question = puzzle.questions[0];
  const [filled, setFilled] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrongWord, setWrongWord] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [engraved, setEngraved] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const soundRefs = useRef<Audio.Sound[]>([]);
  const completionStartedRef = useRef(false);
  const completionTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wrongWordTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onResetHintsRef = useRef(onResetHints);
  const doorGlow = useRef(new Animated.Value(0)).current;
  const wrongShake = useRef(new Animated.Value(0)).current;
  const completionGlow = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  const spellText = useMemo(() => buildSpell(question.spellChunks, question.separators), [question]);
  const nextChunk = question.spellChunks[filled.length];
  const usedWords = useMemo(() => new Set(filled), [filled]);
  const isComplete = filled.length === question.spellChunks.length;

  const unloadSounds = useCallback(() => {
    soundRefs.current.forEach((sound) => sound.unloadAsync().catch(() => {}));
    soundRefs.current = [];
  }, []);

  const clearCompletionTimers = useCallback(() => {
    completionTimers.current.forEach((timer) => clearTimeout(timer));
    completionTimers.current = [];
  }, []);

  const clearWrongWordTimer = useCallback(() => {
    if (!wrongWordTimer.current) return;
    clearTimeout(wrongWordTimer.current);
    wrongWordTimer.current = null;
  }, []);

  useEffect(() => {
    onResetHintsRef.current = onResetHints;
  }, [onResetHints]);

  const reset = useCallback(() => {
    setFilled([]);
    setWrongWord(null);
    setMistakes(0);
    setCompleting(false);
    setEngraved(false);
    setFlashVisible(false);
    completionStartedRef.current = false;
    clearCompletionTimers();
    clearWrongWordTimer();
    onResetHintsRef.current?.();
    Haptics.selectionAsync().catch(() => {});
  }, [clearCompletionTimers, clearWrongWordTimer]);

  const playCue = useCallback(async (cue: CueKey, volume = 0.26) => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        CUE_ASSETS[cue],
        { shouldPlay: true, volume: Platform.OS === "web" ? volume * 0.7 : volume },
      );
      soundRefs.current.push(sound);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || !status.didJustFinish) return;
        sound.setOnPlaybackStatusUpdate(null);
        sound.unloadAsync().catch(() => {});
        soundRefs.current = soundRefs.current.filter((item) => item !== sound);
      });
    } catch (error) {
      console.warn("[BossSpellPuzzle] cue failed:", error);
    }
  }, []);

  useEffect(() => {
    onResetHintsRef.current?.();
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(doorGlow, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(doorGlow, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    );
    glowLoop.start();

    return () => {
      glowLoop.stop();
      doorGlow.stopAnimation();
      completionGlow.stopAnimation();
      flashOpacity.stopAnimation();
      clearCompletionTimers();
      clearWrongWordTimer();
      unloadSounds();
    };
  }, [clearCompletionTimers, clearWrongWordTimer, completionGlow, doorGlow, flashOpacity, unloadSounds]);

  const triggerWrong = useCallback((word: string, newMistakes: number) => {
    setWrongWord(word);
    setMistakes(newMistakes);
    playCue("thud", 0.22);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: -1, duration: 70, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();

    clearWrongWordTimer();
    wrongWordTimer.current = setTimeout(() => {
      setWrongWord(null);
      wrongWordTimer.current = null;
    }, 720);
  }, [clearWrongWordTimer, playCue, wrongShake]);

  const autoPlaceForMistakes = useCallback((newMistakes: number) => {
    if (newMistakes < 5 || completing) return;
    setFilled((current) => {
      if (current.length >= question.spellChunks.length) return current;
      const next = question.spellChunks[current.length];
      return [...current, next];
    });
    playCue("chime", 0.2);
  }, [completing, playCue, question.spellChunks]);

  const handleWordPress = useCallback((word: string) => {
    if (completing) return;

    // Validate inside the functional setter so rapid taps re-read fresh state.
    // Prior version compared against `nextChunk`/`usedWords` derived from a stale
    // render snapshot, which let two synchronous taps both pass and append the
    // same word twice — corrupting the answer sequence while still triggering
    // completion via filled.length.
    // Use a ref-style holder to defeat TS narrowing of `outcome` to its initial
    // literal type — the value is mutated by the synchronous setFilled callback
    // below, but TS otherwise treats it as the initial union member only.
    const outcomeBox: { value: "correct" | "wrong" | "ignored" } = { value: "ignored" };
    setFilled((current) => {
      if (current.length >= question.spellChunks.length) return current;
      if (current.includes(word)) return current;
      const expected = question.spellChunks[current.length];
      if (word === expected) {
        outcomeBox.value = "correct";
        return [...current, word];
      }
      outcomeBox.value = "wrong";
      return current;
    });

    if (outcomeBox.value === "correct") {
      playCue("chime", 0.24);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return;
    }

    if (outcomeBox.value === "wrong") {
      // Atomic mistake counter — defensive against rapid-tap double-count.
      setMistakes((currentMistakes) => {
        const newMistakes = currentMistakes + 1;
        triggerWrong(word, newMistakes);
        autoPlaceForMistakes(newMistakes);
        return newMistakes;
      });
    }
    // outcome === "ignored" → tap is duplicate or out-of-bounds; stay silent.
  }, [autoPlaceForMistakes, completing, playCue, question.spellChunks, triggerWrong]);

  useEffect(() => {
    if (!isComplete || completionStartedRef.current) return;
    // Defense-in-depth: handleWordPress already enforces correct-order placement
    // inside its functional setter, but verify every slot matches the expected
    // spell before celebrating. Any mismatch is a logic bug — log and refuse to
    // complete so we never grant XP/advance for a corrupted sequence.
    const expected = question.spellChunks;
    const matches = filled.length === expected.length && filled.every((chunk, i) => chunk === expected[i]);
    if (!matches) {
      console.warn("[BossSpellPuzzle] completion blocked: filled sequence does not match spell", { filled, expected });
      return;
    }
    completionStartedRef.current = true;
    setCompleting(true);

    const schedule = (fn: () => void, delay: number) => {
      const timer = setTimeout(fn, delay);
      completionTimers.current.push(timer);
    };

    schedule(() => setEngraved(true), 520);
    schedule(() => playCue("doorCrack", 0.34), 850);
    Animated.timing(completionGlow, {
      toValue: 1,
      duration: 2600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    schedule(() => {
      setFlashVisible(true);
      playCue("burst", 0.26);
      flashOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 0.86, duration: 220, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0, duration: 520, useNativeDriver: true }),
      ]).start();
    }, 3300);

    schedule(onSolved, 4450);
  }, [completionGlow, filled, flashOpacity, isComplete, onSolved, playCue, question.spellChunks]);

  const hintText = useMemo(() => {
    if (mistakes >= 5) return tri(question.hints.h3, lang);
    if (mistakes >= 2) return tri(question.hints.h2, lang);
    if (mistakes >= 1) return tri(question.hints.h1, lang);
    return lang === "korean"
      ? "문이 네 목소리를 기다리고 있어요."
      : lang === "spanish"
        ? "La puerta espera tu voz."
        : "The door is waiting for your voice.";
  }, [lang, mistakes, question.hints]);

  const header = lang === "korean"
    ? "보스 주문"
    : lang === "spanish"
      ? "Hechizo final"
      : "Boss Spell";

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>{header}</Text>
          <Text style={styles.instruction}>{tri(question.instruction, lang)}</Text>
        </View>
        <Pressable style={styles.resetBtn} onPress={reset} disabled={completing}>
          <Ionicons name="refresh" size={15} color={C.gold} />
          <Text style={styles.resetText}>{lang === "korean" ? "초기화" : lang === "spanish" ? "Reiniciar" : "Reset"}</Text>
        </Pressable>
      </View>

      <DoorVisual
        doorImage={question.doorImage}
        glow={doorGlow}
        completionGlow={completionGlow}
        engraved={engraved}
        spellText={spellText}
      />

      <Animated.View
        style={[
          styles.slotsWrap,
          {
            transform: [{
              translateX: wrongShake.interpolate({ inputRange: [-1, 0, 1], outputRange: [-7, 0, 7] }),
            }],
          },
        ]}
      >
        {question.spellChunks.map((chunk, index) => {
          const value = filled[index] ?? "";
          const state: SlotState = value ? "filled" : wrongWord && index === filled.length ? "wrong" : "empty";
          return (
            <ChunkSlot
              key={`${chunk}-${index}`}
              value={value}
              separator={question.separators[index] ?? ""}
              index={index}
              state={state}
            />
          );
        })}
      </Animated.View>

      <View style={styles.bottomPanel}>
        <View style={styles.rudyHint}>
          <View style={styles.rudyOrb}>
            <Text style={styles.rudyEmoji}>🦊</Text>
          </View>
          <View style={styles.hintBubble}>
            <Text style={styles.hintSpeaker}>Rudy</Text>
            <Text style={styles.hintText}>{hintText}</Text>
          </View>
        </View>

        <View style={styles.wordPool}>
          {question.wordPool.map((word) => (
            <WordCard
              key={word}
              word={word}
              used={usedWords.has(word)}
              wrong={wrongWord === word}
              disabled={completing}
              onPress={() => handleWordPress(word)}
            />
          ))}
        </View>
      </View>

      {flashVisible && <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flashOpacity }]} />}
    </View>
  );
}

function DoorVisual({
  doorImage,
  glow,
  completionGlow,
  engraved,
  spellText,
}: {
  doorImage?: ImageSourcePropType;
  glow: Animated.Value;
  completionGlow: Animated.Value;
  engraved: boolean;
  spellText: string;
}) {
  const pulseColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(201,162,39,0.18)", "rgba(255,209,102,0.55)"],
  });
  const crackScale = completionGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });
  const doorOpenOpacity = completionGlow.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0.05, 0.45, 0.96],
  });
  const completionOverlayOpacity = completionGlow.interpolate({
    inputRange: [0, 0.18, 1],
    outputRange: [0, 0.35, 1],
  });

  return (
    <View style={styles.doorStage}>
      {doorImage ? (
        <Image source={doorImage} style={styles.doorImage} resizeMode="cover" />
      ) : (
        <View style={styles.drawnDoor}>
          <View style={styles.doorTop} />
          <View style={styles.doorPanels}>
            <View style={styles.doorPanel} />
            <View style={styles.doorPanel} />
          </View>
        </View>
      )}
      <Animated.View pointerEvents="none" style={[styles.doorCompletionOverlay, { opacity: completionOverlayOpacity }]}>
        <Animated.View style={[styles.doorLight, { opacity: doorOpenOpacity }]} />
        <Animated.View
          style={[
            styles.crack,
            styles.crackA,
            { backgroundColor: pulseColor, transform: [{ rotate: "-12deg" }, { scaleY: crackScale }] },
          ]}
        />
        <Animated.View
          style={[
            styles.crack,
            styles.crackB,
            { backgroundColor: pulseColor, transform: [{ rotate: "17deg" }, { scaleY: crackScale }] },
          ]}
        />
      </Animated.View>
      <View style={styles.slotHaloRow}>
        {[0, 1, 2, 3].map((i) => <Animated.View key={i} style={[styles.slotHalo, { borderColor: pulseColor }]} />)}
      </View>
      {engraved && (
        <Animated.View style={[styles.engravedPlate, { opacity: doorOpenOpacity }]}>
          <Text style={styles.engravedText}>{spellText}</Text>
        </Animated.View>
      )}
    </View>
  );
}

function ChunkSlot({ value, separator, index, state }: {
  value: string;
  separator: string;
  index: number;
  state: SlotState;
}) {
  return (
    <View style={styles.slotGroup}>
      <View style={[styles.slot, state === "filled" && styles.slotFilled, state === "wrong" && styles.slotWrong]}>
        <Text style={[styles.slotText, !value && styles.slotTextEmpty]}>
          {value || `${index + 1}`}
        </Text>
      </View>
      {!!separator && <Text style={styles.separator}>{separator}</Text>}
    </View>
  );
}

function WordCard({ word, used, wrong, disabled, onPress }: {
  word: string;
  used: boolean;
  wrong: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!wrong) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.08, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 130, useNativeDriver: true }),
    ]).start();
  }, [scale, wrong]);

  if (used) {
    return <View style={[styles.wordCard, styles.wordCardUsed]} />;
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.wordCard, wrong && styles.wordCardWrong, disabled && styles.wordCardDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.wordText}>{word}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(10,6,4,0.64)",
    overflow: "hidden",
    padding: 14,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  kicker: {
    color: C.gold,
    fontFamily: F.header,
    fontSize: 15,
    letterSpacing: 0,
  },
  instruction: {
    color: C.parchment,
    fontFamily: F.bodySemi,
    fontSize: 15,
    lineHeight: 19,
    marginTop: 4,
    maxWidth: 230,
  },
  resetBtn: {
    minHeight: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  resetText: {
    color: C.gold,
    fontFamily: F.bodySemi,
    fontSize: 13,
  },
  doorStage: {
    height: 260,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.32)",
    backgroundColor: "#120907",
    alignItems: "center",
    justifyContent: "center",
  },
  doorImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  doorCompletionOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  drawnDoor: {
    width: "62%",
    height: "88%",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(201,162,39,0.55)",
    backgroundColor: "#2b170f",
    overflow: "hidden",
    shadowColor: C.gold,
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  doorTop: {
    height: 32,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(201,162,39,0.35)",
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  doorPanels: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  doorPanel: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.28)",
    backgroundColor: "rgba(0,0,0,0.14)",
  },
  crack: {
    position: "absolute",
    width: 3,
    borderRadius: 999,
    shadowColor: "#FFD166",
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  crackA: {
    height: 142,
    left: "46%",
    top: 42,
    transform: [{ rotate: "-12deg" }],
  },
  crackB: {
    height: 112,
    left: "56%",
    top: 100,
    transform: [{ rotate: "17deg" }],
  },
  doorLight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,245,198,0.5)",
  },
  slotHaloRow: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  slotHalo: {
    width: 52,
    height: 8,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  engravedPlate: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.68)",
    backgroundColor: "rgba(10,6,4,0.64)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  engravedText: {
    color: "#FFE7A3",
    fontFamily: F.header,
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 0,
  },
  slotsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  slotGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  slot: {
    minWidth: 94,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.48)",
    backgroundColor: "rgba(0,0,0,0.22)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  slotFilled: {
    borderColor: "#FFD166",
    backgroundColor: "rgba(201,162,39,0.82)",
    shadowColor: "#FFD166",
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },
  slotWrong: {
    borderColor: "#d55",
    backgroundColor: "rgba(200,70,70,0.16)",
  },
  slotText: {
    color: C.bg1,
    fontFamily: F.bodyBold,
    fontSize: 17,
  },
  slotTextEmpty: {
    color: "rgba(201,162,39,0.38)",
  },
  separator: {
    color: C.gold,
    fontFamily: F.header,
    fontSize: 24,
    marginHorizontal: 2,
  },
  bottomPanel: {
    gap: 12,
  },
  rudyHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rudyOrb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.7)",
    backgroundColor: "rgba(255,209,102,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  rudyEmoji: {
    fontSize: 28,
  },
  hintBubble: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.28)",
    backgroundColor: "rgba(0,0,0,0.24)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hintSpeaker: {
    color: C.gold,
    fontFamily: F.header,
    fontSize: 12,
    marginBottom: 2,
  },
  hintText: {
    color: C.parchment,
    fontFamily: F.bodySemi,
    fontSize: 14,
    lineHeight: 18,
  },
  wordPool: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  wordCard: {
    minWidth: 96,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(44,24,16,0.84)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  wordCardWrong: {
    borderColor: "#d55",
    backgroundColor: "rgba(200,70,70,0.2)",
  },
  wordCardUsed: {
    opacity: 0,
  },
  wordCardDisabled: {
    opacity: 0.68,
  },
  wordText: {
    color: C.parchment,
    fontFamily: F.bodyBold,
    fontSize: 16,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff3bf",
  },
});
