import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  Animated,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { NativeLanguage } from "@/context/LanguageContext";
import { EmojiText } from "@/components/EmojiText";
import { C, F } from "@/constants/theme";
import { RUDY_GUIDE_CARDS } from "@/lib/rudyGuideCards";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(SCREEN_W - 48, 360);

const GUIDE_KEY = "rudy_guide_index";
const GUIDE_LAST_SHOWN_KEY = "rudy_guide_last_shown"; // ISO date yyyy-mm-dd

const GUIDE_CARDS = RUDY_GUIDE_CARDS;

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns the next guide card index to show.
 * Returns null if either:
 *  - all cards already seen, OR
 *  - a card was already shown today (once-per-day throttle)
 *
 * This prevents the modal from blocking the home screen on every
 * tab focus — the user only sees it once per calendar day.
 */
export async function getNextGuideIndex(): Promise<number | null> {
  const lastShown = await AsyncStorage.getItem(GUIDE_LAST_SHOWN_KEY);
  if (lastShown === todayKey()) return null; // already shown today
  const raw = await AsyncStorage.getItem(GUIDE_KEY);
  const idx = raw ? parseInt(raw, 10) : 0;
  if (idx >= GUIDE_CARDS.length) return null;
  return idx;
}

export async function advanceGuideIndex(): Promise<void> {
  const raw = await AsyncStorage.getItem(GUIDE_KEY);
  const idx = raw ? parseInt(raw, 10) : 0;
  await AsyncStorage.setItem(GUIDE_KEY, String(idx + 1));
  // Mark today so we don't show another card until tomorrow
  await AsyncStorage.setItem(GUIDE_LAST_SHOWN_KEY, todayKey());
}

export async function markGuideComplete(): Promise<void> {
  await AsyncStorage.setItem(GUIDE_KEY, String(GUIDE_CARDS.length));
  await AsyncStorage.setItem(GUIDE_LAST_SHOWN_KEY, todayKey());
}

export async function resetGuideForDrip(): Promise<void> {
  await AsyncStorage.removeItem(GUIDE_KEY);
  await AsyncStorage.removeItem(GUIDE_LAST_SHOWN_KEY);
}

/**
 * Milestone fast-forward (drip-safe).
 *
 * A fast learner who reaches a milestone (e.g. opens the Training Camp for the
 * first time on day 2) would otherwise wait until the natural 1-per-day drip
 * reaches the relevant card — card 8 ("훈련소가 핵심") only surfaces on day 9.
 * This nudges the drip *pointer* forward to `targetIndex` so the very next time
 * Home runs its existing drip check (`getNextGuideIndex`), the milestone card is
 * the one shown — without minting a second modal render path.
 *
 * Guardrails (keeps the locked invariants intact):
 *  - Never rewinds: no-op if the learner has already reached/passed targetIndex
 *    (so seen cards are never replayed and we only move forward).
 *  - Philosophy-first: only advances once the learner has already seen the
 *    locked philosophy block (indices 0-6, i.e. current index >= 7), so no
 *    unseen philosophy card is ever skipped.
 *  - Throttle-safe: does NOT touch GUIDE_LAST_SHOWN_KEY, so the once-per-day
 *    drip gate still applies — the milestone card replaces the day's card, it
 *    does not stack an extra modal on top of today's drip.
 *
 * Returns the index that will now be surfaced next, or null if it was a no-op.
 */
export async function showGuideCardByMilestone(targetIndex: number): Promise<number | null> {
  if (targetIndex < 0 || targetIndex >= GUIDE_CARDS.length) return null;
  const raw = await AsyncStorage.getItem(GUIDE_KEY);
  const idx = raw ? parseInt(raw, 10) : 0;
  // Philosophy-first + forward-only: only fast-forward learners who have cleared
  // the locked philosophy block and are still behind the milestone card.
  const PHILOSOPHY_BLOCK_END = 7; // indices 0-6 are the locked philosophy cards
  if (idx < PHILOSOPHY_BLOCK_END) return null;
  if (idx >= targetIndex) return null;
  await AsyncStorage.setItem(GUIDE_KEY, String(targetIndex));
  return targetIndex;
}

// One-time migration: users who saw the old all-at-once onboarding dump were
// stamped at the old max (8) via markGuideComplete and would never see the
// drip. Resume them at the first NEW card (index 8) instead of replaying 1-7.
export async function migrateGuideIfStale(): Promise<void> {
  const MIGRATION_KEY = "rudy_guide_drip_v2";
  if (await AsyncStorage.getItem(MIGRATION_KEY)) return;
  const raw = await AsyncStorage.getItem(GUIDE_KEY);
  const idx = raw ? parseInt(raw, 10) : 0;
  if (idx >= 8 && idx < GUIDE_CARDS.length) {
    await AsyncStorage.setItem(GUIDE_KEY, "8");
  }
  await AsyncStorage.setItem(MIGRATION_KEY, "1");
}

export function RudyGuideModal({
  visible,
  lang,
  onClose,
}: {
  visible: boolean;
  lang: NativeLanguage;
  onClose: () => void;
}) {
  const [cardIdx, setCardIdx] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      getNextGuideIndex().then((idx) => {
        if (idx !== null) setCardIdx(idx);
      });
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const card = GUIDE_CARDS[cardIdx] ?? GUIDE_CARDS[0];
  const title = card.title[lang] ?? card.title.english;
  const body = card.body[lang] ?? card.body.english;

  const dismiss = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await advanceGuideIndex();
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      onClose();
    });
  };

  const btnText =
    lang === "korean" ? "알겠어!" : lang === "spanish" ? "¡Entendido!" : "Got it!";

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View style={[ms.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[ms.card, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={[C.bg2, C.bg1]} style={ms.gradient}>
            {/* Emoji */}
            <View style={ms.emojiWrap}>
              <EmojiText style={ms.emoji}>{card.emoji}</EmojiText>
            </View>

            {/* Title */}
            <Text style={ms.title}>{title}</Text>

            {/* Divider */}
            <View style={ms.divider} />

            {/* Body */}
            <Text style={ms.body}>{body}</Text>

            {/* CTA */}
            <Pressable
              style={({ pressed }) => [ms.cta, pressed && ms.ctaPress]}
              onPress={dismiss}
            >
              <Text style={ms.ctaText}>{btnText}</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const ms = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: CARD_W,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: C.gold,
  },
  gradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  emojiWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(201,162,39,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emoji: { fontSize: 32 },
  title: {
    fontSize: 20,
    fontFamily: F.header,
    color: C.gold,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: C.goldDark,
    borderRadius: 1,
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    fontFamily: F.body,
    color: C.parchment,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  cta: {
    backgroundColor: C.gold,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  ctaPress: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  ctaText: {
    fontSize: 16,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 0.5,
  },
});
