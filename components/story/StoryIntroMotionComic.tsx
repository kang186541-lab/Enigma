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
import { Asset } from "expo-asset";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { C, F } from "@/constants/theme";
import Typewriter, { TypewriterHandle } from "@/components/story/Typewriter";
import { getIntroTimeline } from "@/components/story/intro/timelines";
import type {
  ChapterId,
  CueKey,
  IntroTimeline,
  MotionPreset,
  NativeLanguage,
  StoryIntroShot,
} from "@/components/story/intro/timelines/types";

type FinishReason = "completed" | "skipped";

export interface StoryIntroMotionComicProps {
  chapterId: ChapterId;
  nativeLang: NativeLanguage;
  muted?: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

const CUE_ASSETS = {
  ring: require("@/assets/sounds/cue_ring.wav"),
  open: require("@/assets/sounds/cue_open.wav"),
  gasp: require("@/assets/sounds/cue_gasp.wav"),
  chime: require("@/assets/sounds/cue_chime.wav"),
  sense: require("@/assets/sounds/cue_sense.wav"),
  steps: require("@/assets/sounds/cue_steps.wav"),
  wind: require("@/assets/sounds/cue_wind.wav"),
  drum: require("@/assets/sounds/cue_drum.wav"),
  guitar: require("@/assets/sounds/cue_guitar.wav"),
} as Record<CueKey, number>;

function prefetchImageSource(source: ImageSourcePropType | undefined) {
  if (!source) return;

  try {
    if (typeof source === "object" && !Array.isArray(source) && typeof source.uri === "string") {
      Image.prefetch(source.uri).catch(() => {});
      return;
    }
    Asset.fromModule(source as number).downloadAsync().catch(() => {});
  } catch {
    // Prefetch is a performance hint only; never block story playback.
  }
}

export default function StoryIntroMotionComic({
  chapterId,
  nativeLang,
  muted = false,
  onComplete,
  onSkip,
}: StoryIntroMotionComicProps) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<"ready" | "playing" | "dialogue">("ready");
  const [shotIndex, setShotIndex] = useState(0);
  const [dialogueDone, setDialogueDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);
  const dialogueRef = useRef<TypewriterHandle | null>(null);
  const soundRefs = useRef<Audio.Sound[]>([]);
  const skipOpacity = useRef(new Animated.Value(0)).current;

  const timeline = useMemo(() => getIntroTimeline(chapterId), [chapterId]);
  const shots = useMemo(() => timeline?.shots ?? [], [timeline]);
  const currentShot = shots[shotIndex] ?? shots[0];
  const copy = getLocalizedCopy(nativeLang, timeline);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const unloadSounds = useCallback(() => {
    soundRefs.current.forEach((sound) => {
      sound.unloadAsync().catch(() => {});
    });
    soundRefs.current = [];
  }, []);

  const finish = useCallback((reason: FinishReason) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimer();
    unloadSounds();
    if (reason === "skipped") onSkip?.();
    onComplete();
  }, [clearTimer, onComplete, onSkip, unloadSounds]);

  const playCue = useCallback(async (cue: CueKey) => {
    if (muted) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        CUE_ASSETS[cue],
        { shouldPlay: true, volume: Platform.OS === "web" ? 0.18 : 0.28 },
      );
      soundRefs.current.push(sound);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || !status.didJustFinish) return;
        sound.setOnPlaybackStatusUpdate(null);
        sound.unloadAsync().catch(() => {});
        soundRefs.current = soundRefs.current.filter((item) => item !== sound);
      });
    } catch (e) {
      console.warn("[StoryIntro] cue failed:", e);
    }
  }, [muted]);

  const start = useCallback(() => {
    if (!timeline) {
      finish("completed");
      return;
    }
    finishedRef.current = false;
    setDialogueDone(false);
    setShotIndex(0);
    setPhase("playing");
    Haptics.selectionAsync().catch(() => {});
  }, [finish, timeline]);

  const skip = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    finish("skipped");
  }, [finish]);

  const continueFromDialogue = useCallback(() => {
    if (dialogueRef.current && !dialogueRef.current.isDone()) {
      dialogueRef.current.skip();
      Haptics.selectionAsync().catch(() => {});
      return;
    }
    Haptics.selectionAsync().catch(() => {});
    finish("completed");
  }, [finish]);

  useEffect(() => {
    if (!timeline) finish("completed");
  }, [finish, timeline]);

  useEffect(() => {
    prefetchImageSource(shots[0]?.source);
    prefetchImageSource(shots[1]?.source);
    prefetchImageSource(timeline?.portraitImage);
    prefetchImageSource(timeline?.spiritImage);
  }, [shots, timeline]);

  useEffect(() => {
    prefetchImageSource(shots[shotIndex + 1]?.source);
    prefetchImageSource(shots[shotIndex + 2]?.source);
  }, [shotIndex, shots]);

  useEffect(() => {
    finishedRef.current = false;
    setDialogueDone(false);
    setShotIndex(0);
    setPhase("ready");
    clearTimer();
    unloadSounds();
  }, [chapterId, clearTimer, unloadSounds]);

  useEffect(() => {
    if (phase !== "playing" || !timeline || !currentShot) return;
    playCue(currentShot.cue);
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (shotIndex >= shots.length - 1) {
        setPhase("dialogue");
        setDialogueDone(false);
        playCue("chime");
        return;
      }
      setShotIndex((index) => Math.min(index + 1, shots.length - 1));
    }, currentShot.durationMs);

    return clearTimer;
  }, [clearTimer, currentShot, phase, playCue, shotIndex, shots.length, timeline]);

  useEffect(() => {
    return () => {
      clearTimer();
      unloadSounds();
    };
  }, [clearTimer, unloadSounds]);

  useEffect(() => {
    if (phase === "ready") {
      skipOpacity.stopAnimation();
      skipOpacity.setValue(0);
      return;
    }

    skipOpacity.setValue(0);
    Animated.timing(skipOpacity, {
      toValue: 1,
      duration: 480,
      delay: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [phase, skipOpacity]);

  if (!timeline || !currentShot) return null;

  return (
    <View style={styles.root}>
      <View style={styles.stage}>
        {phase === "ready" && currentShot && (
          <View pointerEvents="none" style={styles.readyBackdrop}>
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="cover"
              source={currentShot.source}
              style={styles.readyBackdropImage}
            />
            <LinearGradient
              colors={["rgba(2,3,6,0.2)", "rgba(2,3,6,0.18)", "rgba(2,3,6,0.76)"]}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}

        {phase === "playing" && (
          <ShotFrame key={currentShot.id} shot={currentShot}>
            {renderOverlay(currentShot, timeline)}
          </ShotFrame>
        )}

        {phase === "dialogue" && currentShot && (
          <View pointerEvents="none" style={styles.dialogueBackdrop}>
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="cover"
              source={currentShot.source}
              style={styles.readyBackdropImage}
            />
            <LinearGradient
              colors={["rgba(5,7,11,0.42)", "rgba(5,7,11,0.62)", "rgba(5,7,11,0.92)"]}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}

        {phase === "dialogue" && (
          <Pressable
            accessibilityRole="button"
            onPress={continueFromDialogue}
            style={styles.dialogueLayer}
          >
            <View style={styles.portrait}>
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="cover"
                source={timeline.portraitImage}
                style={styles.portraitImage}
              />
            </View>
            <View style={[styles.dialogueBox, { paddingBottom: Math.max(18, insets.bottom + 10) }]}>
              <Text style={styles.speaker}>{timeline.finalDialogue.speaker}</Text>
              <Typewriter
                ref={dialogueRef}
                text={timeline.finalDialogue.text}
                speedMs={28}
                textStyle={styles.dialogueText}
                onComplete={() => setDialogueDone(true)}
              />
              <Text style={[styles.dialogueHint, !dialogueDone && styles.dialogueHintDim]}>
                {dialogueDone ? copy.continueLabel : copy.skipTypingLabel}
              </Text>
            </View>
          </Pressable>
        )}

        {phase === "ready" && (
          <View style={styles.startOverlay}>
            <Text style={styles.startTitle}>{copy.title}</Text>
            <Text style={styles.startSubtitle}>{copy.startSubtitle}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={start}
              style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
            >
              <Text style={styles.startButtonText}>{copy.startLabel}</Text>
            </Pressable>
          </View>
        )}
      </View>

      {phase !== "ready" && (
        <Animated.View style={[styles.skipButtonWrap, { opacity: skipOpacity, top: insets.top + 14 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.skipLabel}
            onPress={skip}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>{copy.skipLabel}</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

function ShotFrame({
  shot,
  children,
}: {
  shot: StoryIntroShot;
  children?: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const preset = getMotionPreset(shot.motion);
    opacity.setValue(0);
    scale.setValue(preset.fromScale);
    translateX.setValue(preset.fromX);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: preset.toScale,
        duration: shot.durationMs + 450,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: preset.toX,
        duration: shot.durationMs + 450,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, shot.durationMs, shot.motion, translateX]);

  return (
    <Animated.View style={[styles.shot, { opacity }]}>
      <Animated.Image
        accessibilityIgnoresInvertColors
        accessibilityLabel={shot.accessibilityLabel}
        resizeMode="cover"
        source={shot.source}
        style={[
          styles.shotImage,
          {
            transform: [
              { scale },
              { translateX },
            ],
          },
        ]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(2,3,6,0.16)", "rgba(2,3,6,0)", "rgba(2,3,6,0.42)"]}
        locations={[0, 0.48, 1]}
        style={styles.vignette}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,226,144,0.13)", "rgba(255,226,144,0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={styles.artGlow}
      />
      <View pointerEvents="none" style={styles.panelBorder} />
      <View pointerEvents="none" style={styles.grain} />
      {children}
    </Animated.View>
  );
}

function renderOverlay(shot: StoryIntroShot, timeline: IntroTimeline) {
  const kind = shot.overlay;
  if (!kind) return null;
  if (kind === "phone") return <PhoneOverlay lines={shot.overlayCopy?.phoneLines} />;
  if (kind === "open") return <WordOverlay word="OPEN" variant="open" />;
  if (kind === "find") return <WordOverlay word="FIND" variant="find" />;
  if (kind === "color-restore") return <WordOverlay word="RED" variant="open" />;
  if (kind === "carlos-call") return <WordOverlay word={shot.overlayCopy?.word ?? "HELP"} variant="find" />;
  if (kind === "korean-word") return <WordOverlay word={shot.overlayCopy?.word ?? "출구"} variant="open" />;
  if (kind === "word") return <WordOverlay word={shot.overlayCopy?.word ?? "RECORD"} variant="open" />;
  if (kind === "rudy-react") return <ColdSenseOverlay />;
  if (kind === "festival-threat") return <ColdSenseOverlay />;
  if (kind === "black") return <BlackMessageOverlay message={timeline.villainMessage ?? ""} />;
  if (kind === "naming") {
    return (
      <NamingOverlay
        detectiveImage={timeline.portraitImage}
        spiritImage={timeline.spiritImage ?? timeline.portraitImage}
      />
    );
  }
  return null;
}

function PhoneOverlay({ lines }: { lines?: string[] }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const fall = useRef(new Animated.Value(0)).current;
  const firstLine = lines?.[0] ?? "Detective. I need... I can't...";
  const secondLine = lines?.[1] ?? "if you're reading this, the words are already...";
  const fallingWord = secondLine.includes("color") ? "color" : "words";
  const [secondPrefix, secondSuffix = ""] = secondLine.includes(fallingWord)
    ? secondLine.split(fallingWord)
    : [`${secondLine} `, ""];

  useEffect(() => {
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 920,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    Animated.sequence([
      Animated.delay(2600),
      Animated.timing(fall, {
        toValue: 1,
        duration: 1600,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fall, opacity]);

  return (
    <Animated.View style={[styles.phoneCopy, { opacity }]}>
      <Text style={styles.phoneCopyText}>{firstLine}</Text>
      <Text style={styles.phoneCopyText}>
        {secondPrefix}
        <Animated.Text
          style={[
            styles.phoneCopyText,
            {
              opacity: fall.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              transform: [
                { translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [0, 34] }) },
                { rotate: fall.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "6deg"] }) },
              ],
            },
          ]}
        >
          {fallingWord}
        </Animated.Text>
        {secondSuffix}
      </Text>
    </Animated.View>
  );
}

function WordOverlay({ word, variant }: { word: string; variant: "open" | "find" }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.74)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(variant === "open" ? 1500 : 2800),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [opacity, scale, variant]);

  return (
    <Animated.Text
      style={[
        styles.word,
        variant === "open" ? styles.openWord : styles.findWord,
        { opacity, transform: [{ scale }] },
      ]}
    >
      {word}
    </Animated.Text>
  );
}

function ColdSenseOverlay() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(820),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 920,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.18,
        duration: 1680,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity]);

  return (
    <Animated.View pointerEvents="none" style={[styles.coldSense, { opacity }]} />
  );
}

function BlackMessageOverlay({ message }: { message: string }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(900),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity]);

  return (
    <>
      <View pointerEvents="none" style={styles.scanlines} />
      <Animated.View style={[styles.blackMessage, { opacity }]}>
        <Typewriter
          text={message}
          speedMs={26}
          startDelayMs={180}
          textStyle={styles.blackMessageText}
        />
      </Animated.View>
    </>
  );
}

function NamingOverlay({
  detectiveImage,
  spiritImage,
}: {
  detectiveImage: ImageSourcePropType;
  spiritImage: ImageSourcePropType;
}) {
  const spiritOpacity = useRef(new Animated.Value(0.86)).current;
  const spiritScale = useRef(new Animated.Value(1.08)).current;
  const detectiveOpacity = useRef(new Animated.Value(0)).current;
  const detectiveScale = useRef(new Animated.Value(0.72)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslate = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(spiritOpacity, {
        toValue: 0.14,
        duration: 7000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(spiritScale, {
        toValue: 1.22,
        duration: 7000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(1100),
        Animated.parallel([
          Animated.timing(nameOpacity, {
            toValue: 1,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(nameTranslate, {
            toValue: 0,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(1600),
        Animated.parallel([
          Animated.timing(detectiveOpacity, {
            toValue: 1,
            duration: 3100,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(detectiveScale, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [detectiveOpacity, detectiveScale, nameOpacity, nameTranslate, spiritOpacity, spiritScale]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={spiritImage}
        style={[
          styles.namingSpirit,
          {
            opacity: spiritOpacity,
            transform: [{ scale: spiritScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.detectiveWrap,
          {
            opacity: detectiveOpacity,
            transform: [{ scale: detectiveScale }],
          },
        ]}
      >
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="cover"
          source={detectiveImage}
          style={styles.detectiveImage}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.nameCard,
          {
            opacity: nameOpacity,
            transform: [{ translateY: nameTranslate }],
          },
        ]}
      >
        <Text style={styles.nameMicro}>Name Restored</Text>
        <Text style={styles.nameValue}>RUDY</Text>
      </Animated.View>
    </View>
  );
}

function getMotionPreset(motion: MotionPreset) {
  if (motion === "pull") return { fromScale: 1.14, toScale: 1.04, fromX: 0, toX: 0 };
  if (motion === "drift-left") return { fromScale: 1.1, toScale: 1.16, fromX: 8, toX: -16 };
  if (motion === "drift-right") return { fromScale: 1.1, toScale: 1.16, fromX: -12, toX: 12 };
  return { fromScale: 1.03, toScale: 1.15, fromX: 0, toX: 0 };
}

function getLocalizedCopy(lang: NativeLanguage, timeline: IntroTimeline | null) {
  const title = timeline?.copy?.title ?? "London Cipher";
  const startLabel = timeline?.copy?.startLabel ?? `Start ${title}`;
  const subtitle = timeline?.copy?.subtitle[lang] ?? timeline?.copy?.subtitle.english;

  if (lang === "korean") {
    return {
      title,
      startLabel,
      startSubtitle: subtitle ?? "단어가 무너지는 첫 밤.",
      skipLabel: "Skip",
      continueLabel: "계속",
      skipTypingLabel: "탭해서 빠르게 보기",
    };
  }
  if (lang === "spanish") {
    return {
      title,
      startLabel,
      startSubtitle: subtitle ?? "La primera noche en que las palabras empiezan a caer.",
      skipLabel: "Skip",
      continueLabel: "Continuar",
      skipTypingLabel: "Toca para revelar",
    };
  }
  return {
    title,
    startLabel,
    startSubtitle: subtitle ?? "The first night the words begin to fall.",
    skipLabel: "Skip",
    continueLabel: "Continue",
    skipTypingLabel: "Tap to reveal",
  };
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#030407",
    flex: 1,
  },
  stage: {
    backgroundColor: "#020306",
    flex: 1,
    overflow: "hidden",
  },
  readyBackdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.92,
  },
  dialogueBackdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.72,
  },
  readyBackdropImage: {
    height: "100%",
    left: "-5%",
    position: "absolute",
    top: 0,
    width: "110%",
  },
  shot: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020306",
  },
  shotImage: {
    height: "100%",
    left: "-4%",
    position: "absolute",
    top: 0,
    width: "108%",
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8,
  },
  artGlow: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9,
  },
  panelBorder: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "rgba(255,226,144,0.18)",
    borderWidth: 1,
    margin: 10,
    zIndex: 9,
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.018)",
    zIndex: 9,
  },
  phoneCopy: {
    backgroundColor: "rgba(5,7,11,0.24)",
    borderRadius: 22,
    left: "19%",
    minHeight: 116,
    padding: 16,
    position: "absolute",
    right: "16%",
    top: "31%",
    zIndex: 12,
  },
  phoneCopyText: {
    color: "rgba(230,244,255,0.92)",
    fontFamily: F.bodySemi,
    fontSize: 12,
    lineHeight: 18,
    textShadowColor: "rgba(143,183,217,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  word: {
    color: "#ffe9a4",
    fontFamily: F.title,
    fontWeight: "900",
    letterSpacing: 5,
    position: "absolute",
    textShadowColor: "rgba(255,209,102,0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
    zIndex: 12,
  },
  openWord: {
    fontSize: 44,
    left: "49%",
    top: "36%",
  },
  findWord: {
    fontSize: 24,
    left: "45%",
    top: "70%",
    transform: [{ rotate: "-2deg" }],
  },
  coldSense: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(82,134,213,0.12)",
    zIndex: 10,
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.02)",
    zIndex: 10,
  },
  blackMessage: {
    borderTopColor: "rgba(255,209,102,0.28)",
    borderTopWidth: 1,
    bottom: "6.5%",
    left: "8%",
    minHeight: 112,
    paddingHorizontal: 15,
    paddingTop: 14,
    position: "absolute",
    right: "8%",
    zIndex: 12,
  },
  blackMessageText: {
    color: "rgba(255,233,164,0.96)",
    fontFamily: F.bodySemi,
    fontSize: 13,
    lineHeight: 19,
    textShadowColor: "rgba(255,209,102,0.54)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  namingSpirit: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
  },
  detectiveWrap: {
    alignItems: "center",
    borderRadius: 999,
    height: 372,
    justifyContent: "center",
    left: "50%",
    marginLeft: -144,
    marginTop: -186,
    overflow: "hidden",
    position: "absolute",
    shadowColor: C.gold,
    shadowOpacity: 0.3,
    shadowRadius: 46,
    top: "42%",
    width: 288,
  },
  detectiveImage: {
    height: 520,
    width: 404,
  },
  nameCard: {
    alignSelf: "center",
    backgroundColor: "rgba(5,7,11,0.62)",
    borderColor: "rgba(255,209,102,0.34)",
    borderRadius: 12,
    borderWidth: 1,
    bottom: "18%",
    padding: 14,
    position: "absolute",
    width: 250,
    zIndex: 14,
  },
  nameMicro: {
    color: "rgba(248,241,229,0.58)",
    fontFamily: F.label,
    fontSize: 9,
    letterSpacing: 1.4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  nameValue: {
    color: "#ffe9a4",
    fontFamily: F.title,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 5,
    textAlign: "center",
    textShadowColor: "rgba(255,209,102,0.76)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  dialogueLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,7,11,0.74)",
    justifyContent: "flex-end",
    zIndex: 22,
  },
  portrait: {
    alignSelf: "center",
    borderRadius: 999,
    borderColor: "rgba(255,226,144,0.32)",
    borderWidth: 1,
    height: 248,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: C.gold,
    shadowOpacity: 0.34,
    shadowRadius: 46,
    width: 248,
  },
  portraitImage: {
    height: 344,
    marginLeft: -48,
    marginTop: -38,
    width: 344,
  },
  dialogueBox: {
    backgroundColor: "rgba(5,7,11,0.96)",
    borderColor: "rgba(255,209,102,0.38)",
    borderRadius: 12,
    borderWidth: 1,
    margin: 14,
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  speaker: {
    color: C.gold,
    fontFamily: F.label,
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  dialogueText: {
    color: "#fff8e8",
    fontFamily: F.bodySemi,
    fontSize: 17,
    lineHeight: 25,
    minHeight: 58,
  },
  dialogueHint: {
    color: C.gold,
    fontFamily: F.label,
    fontSize: 11,
    marginTop: 10,
    textAlign: "right",
    textTransform: "uppercase",
  },
  dialogueHintDim: {
    opacity: 0.48,
  },
  startOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(5,7,11,0.44)",
    justifyContent: "center",
    padding: 30,
    zIndex: 40,
  },
  startTitle: {
    color: "#fff8e8",
    fontFamily: F.title,
    fontSize: 48,
    lineHeight: 50,
    marginBottom: 14,
    textAlign: "center",
    textShadowColor: "rgba(255,209,102,0.25)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 32,
  },
  startSubtitle: {
    color: "rgba(248,241,229,0.68)",
    fontFamily: F.body,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 284,
    textAlign: "center",
  },
  startButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,209,102,0.15)",
    borderColor: "rgba(255,209,102,0.52)",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 210,
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.82,
  },
  startButtonText: {
    color: "#fff4d1",
    fontFamily: F.header,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  skipButtonWrap: {
    position: "absolute",
    right: 16,
    zIndex: 36,
  },
  skipButton: {
    alignItems: "center",
    backgroundColor: "rgba(5,7,11,0.32)",
    borderColor: "rgba(255,209,102,0.28)",
    borderRadius: 999,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  skipText: {
    color: "rgba(248,241,229,0.62)",
    fontFamily: F.label,
    fontSize: 10,
  },
});
