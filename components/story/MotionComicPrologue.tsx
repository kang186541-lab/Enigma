import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { C, F } from "@/constants/theme";
import type {
  ChapterStoryAssetManifest,
  MotionComicShot,
  StoryImageAsset,
} from "@/lib/storyAssetManifest";

type PlaybackState = "idle" | "playing" | "complete" | "skipped";
type FinishReason = "completed" | "skipped";

type FinishEvent = {
  reason: FinishReason;
  finalShotId?: string;
};

export interface MotionComicPrologueProps {
  manifest: ChapterStoryAssetManifest;
  style?: StyleProp<ViewStyle>;
  showCaptions?: boolean;
  canSkip?: boolean;
  startLabel?: string;
  skipLabel?: string;
  replayLabel?: string;
  onStart?: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
  onFinish?: (event: FinishEvent) => void;
}

const DEFAULT_FADE_MS = 260;
const REDUCED_MOTION_FADE_MS = 80;

export default function MotionComicPrologue({
  manifest,
  style,
  showCaptions = false,
  canSkip = false,
  startLabel = "Start",
  skipLabel = "Skip",
  replayLabel = "Replay",
  onStart,
  onSkip,
  onComplete,
  onFinish,
}: MotionComicPrologueProps) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const fadeOpacity = useRef(new Animated.Value(1)).current;
  const completeFiredRef = useRef(false);

  const shots = useMemo(
    () => [...manifest.prologue.shots].sort((a, b) => a.order - b.order),
    [manifest.prologue.shots],
  );
  const currentShot = shots[currentIndex] ?? null;
  const currentAsset = currentShot
    ? manifest.imageAssets[currentShot.imageAssetId]
    : undefined;
  const currentShotId = currentShot?.id;
  const lastShotId = shots[shots.length - 1]?.id;
  const hasEnded =
    playbackState === "complete" || playbackState === "skipped";
  const progress =
    hasEnded
      ? 1
      : playbackState === "idle" || shots.length === 0
        ? 0
        : (currentIndex + 1) / shots.length;
  const progressLabel =
    playbackState === "idle" || shots.length === 0
      ? `0 / ${shots.length}`
      : `${Math.min(currentIndex + 1, shots.length)} / ${shots.length}`;

  const fireFinish = useCallback((reason: FinishReason) => {
    if (completeFiredRef.current) return;
    completeFiredRef.current = true;
    if (reason === "completed") onComplete?.();
    onFinish?.({
      reason,
      finalShotId: reason === "completed" ? currentShotId ?? lastShotId : lastShotId,
    });
  }, [currentShotId, lastShotId, onComplete, onFinish]);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (playbackState !== "playing") return;

    fadeOpacity.setValue(0);
    Animated.timing(fadeOpacity, {
      toValue: 1,
      duration: reduceMotion ? REDUCED_MOTION_FADE_MS : DEFAULT_FADE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [currentIndex, fadeOpacity, playbackState, reduceMotion]);

  useEffect(() => {
    if (playbackState !== "playing" || !currentShot) return;

    const timeout = setTimeout(() => {
      if (currentIndex >= shots.length - 1) {
        setPlaybackState("complete");
        fireFinish("completed");
        return;
      }

      setCurrentIndex((index) => Math.min(index + 1, shots.length - 1));
    }, currentShot.durationMs);

    return () => clearTimeout(timeout);
  }, [currentIndex, currentShot, fireFinish, playbackState, shots.length]);

  const start = () => {
    completeFiredRef.current = false;
    setCurrentIndex(0);
    setPlaybackState("playing");
    onStart?.();
  };

  const skip = () => {
    if (!canSkip) return;
    setPlaybackState("skipped");
    setCurrentIndex(Math.max(shots.length - 1, 0));
    onSkip?.();
    fireFinish("skipped");
  };

  const skipDisabled = shots.length === 0 || hasEnded || !canSkip;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.stage}>
        <Animated.View style={[styles.imageFrame, { opacity: fadeOpacity }]}>
          <ShotImage asset={currentAsset} shot={currentShot} />
        </Animated.View>

        {playbackState === "idle" && (
          <View style={styles.scrim}>
            <Text style={styles.title}>{manifest.title}</Text>
            <Text style={styles.kicker}>Motion Comic Prologue</Text>
          </View>
        )}

        {hasEnded && (
          <View style={styles.scrim}>
            <Text style={styles.title}>{manifest.title}</Text>
            <Text style={styles.kicker}>
              {playbackState === "skipped"
                ? "Prologue Skipped"
                : "Prologue Complete"}
            </Text>
          </View>
        )}
      </View>

      {showCaptions ? (
        currentShot?.optionalAccessibilityCaption ? (
          <Text style={styles.caption}>
            {currentShot.optionalAccessibilityCaption}
          </Text>
        ) : (
          <View style={styles.captionSpacer} />
        )
      ) : null}

      <View style={styles.progressTrack} accessibilityRole="progressbar">
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.progressLabel}>
          {progressLabel}
        </Text>
        <Text style={styles.statusLabel}>{playbackState}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          disabled={shots.length === 0}
          onPress={start}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
            shots.length === 0 && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {hasEnded ? replayLabel : startLabel}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={skipDisabled}
          onPress={skip}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
            skipDisabled && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.secondaryButtonText}>{skipLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ShotImage({
  asset,
  shot,
}: {
  asset?: StoryImageAsset;
  shot: MotionComicShot | null;
}) {
  if (!asset?.source) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Image pending</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel={shot?.optionalAccessibilityCaption ?? asset.usage}
      resizeMode="cover"
      source={asset.source}
      style={styles.image}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.bg1,
    borderColor: C.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  stage: {
    aspectRatio: 9 / 16,
    backgroundColor: C.bg2,
    width: "100%",
  },
  imageFrame: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: C.bg2,
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  placeholderText: {
    color: C.textDark,
    fontFamily: F.label,
    fontSize: 14,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "#1a0a05aa",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: C.parchment,
    fontFamily: F.title,
    fontSize: 28,
    textAlign: "center",
  },
  kicker: {
    color: C.gold,
    fontFamily: F.label,
    fontSize: 13,
    letterSpacing: 0,
    marginTop: 8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  caption: {
    color: C.parchment,
    fontFamily: F.bodySemi,
    fontSize: 17,
    lineHeight: 22,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingTop: 14,
    textAlign: "center",
  },
  captionSpacer: {
    minHeight: 54,
  },
  progressTrack: {
    backgroundColor: C.goldFaint,
    height: 5,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: C.gold,
    height: "100%",
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  progressLabel: {
    color: C.gold,
    fontFamily: F.label,
    fontSize: 12,
  },
  statusLabel: {
    color: C.textMuted,
    fontFamily: F.label,
    fontSize: 12,
    textTransform: "uppercase",
  },
  controls: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: C.gold,
    borderRadius: 6,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: C.borderSolid,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: C.textParchment,
    fontFamily: F.header,
    fontSize: 16,
  },
  secondaryButtonText: {
    color: C.gold,
    fontFamily: F.header,
    fontSize: 16,
  },
});
