import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Animated,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Level } from "@/context/LanguageContext";
import { C, F } from "@/constants/theme";

const rudyBadgeImg = require("@/assets/rudy_badge.png");
const { width: SCREEN_W } = Dimensions.get("window");

const EMOJI_CONFETTI = ["🔍", "📜", "🕯️", "🦊", "✦", "⭐", "👑", "🗝️", "🔮", "📖"];
const COLOR_CONFETTI = [C.gold, C.parchment, C.goldDark, "#FFD700", "#ede0aa", "#f4e8c1"];

function EmojiPiece({ emoji, delay, startX }: { emoji: string; delay: number; startX: number }) {
  const yAnim  = useRef(new Animated.Value(-30)).current;
  const opAnim = useRef(new Animated.Value(0)).current;
  const rAnim  = useRef(new Animated.Value(0)).current;
  const xAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opAnim, { toValue: 1,   duration: 120,  useNativeDriver: true }),
        Animated.timing(yAnim,  { toValue: 480, duration: 2200, useNativeDriver: true }),
        Animated.timing(rAnim,  { toValue: 8,   duration: 2200, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(xAnim, { toValue: (Math.random() > 0.5 ? 1 : -1) * 30, duration: 600, useNativeDriver: true }),
          Animated.timing(xAnim, { toValue: 0,  duration: 600, useNativeDriver: true }),
          Animated.timing(xAnim, { toValue: (Math.random() > 0.5 ? 1 : -1) * 20, duration: 600, useNativeDriver: true }),
        ]),
      ]),
      Animated.timing(opAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const rotate = rAnim.interpolate({ inputRange: [0, 8], outputRange: ["0deg", "960deg"] });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        top: 0,
        left: startX,
        fontSize: 18,
        opacity: opAnim,
        transform: [{ translateY: yAnim }, { translateX: xAnim }, { rotate }],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

function RectPiece({ color, delay, startX, w, h }: { color: string; delay: number; startX: number; w: number; h: number }) {
  const yAnim  = useRef(new Animated.Value(-10)).current;
  const opAnim = useRef(new Animated.Value(0)).current;
  const rAnim  = useRef(new Animated.Value(0)).current;
  const xAnim  = useRef(new Animated.Value(0)).current;
  const drift  = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 40);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opAnim, { toValue: 0.9,  duration: 80,   useNativeDriver: true }),
        Animated.timing(yAnim,  { toValue: 500,  duration: 2500, useNativeDriver: true }),
        Animated.timing(rAnim,  { toValue: 12,   duration: 2500, useNativeDriver: true }),
        Animated.timing(xAnim,  { toValue: drift, duration: 2500, useNativeDriver: true }),
      ]),
      Animated.timing(opAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const rotate = rAnim.interpolate({ inputRange: [0, 12], outputRange: ["0deg", "1440deg"] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: startX,
        width: w,
        height: h,
        borderRadius: 2,
        backgroundColor: color,
        opacity: opAnim,
        transform: [{ translateY: yAnim }, { translateX: xAnim }, { rotate }],
      }}
    />
  );
}

function CrownBounce({ anim }: { anim: Animated.Value }) {
  const rotate = anim.interpolate({ inputRange: [-1, 1], outputRange: ["-12deg", "12deg"] });
  return (
    <Animated.Text style={{ fontSize: 48, transform: [{ translateY: anim }, { rotate }] }}>
      👑
    </Animated.Text>
  );
}

interface LevelUpModalProps {
  visible: boolean;
  level: Level;
  lang: string;
  onClose: () => void;
}

export function LevelUpModal({ visible, level, lang, onClose }: LevelUpModalProps) {
  const bounceAnim   = useRef(new Animated.Value(0)).current;
  const crownAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim    = useRef(new Animated.Value(0)).current;
  const loopRef      = useRef<Animated.CompositeAnimation | null>(null);
  const crownLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      bounceAnim.setValue(0);
      crownAnim.setValue(0);

      Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 5, useNativeDriver: true }).start();

      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -22, duration: 340, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0,   duration: 340, useNativeDriver: true }),
        ])
      );
      loopRef.current.start();

      crownLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(crownAnim, { toValue:  1, duration: 500, useNativeDriver: true }),
          Animated.timing(crownAnim, { toValue: -1, duration: 500, useNativeDriver: true }),
        ])
      );
      crownLoopRef.current.start();
    } else {
      loopRef.current?.stop();
      crownLoopRef.current?.stop();
    }
    return () => {
      loopRef.current?.stop();
      crownLoopRef.current?.stop();
    };
  }, [visible]);

  const title   = lang === "korean" ? "레벨 업! 🎉" : lang === "spanish" ? "¡Nivel arriba! 🎉" : "Level Up! 🎉";
  const sub     = lang === "korean" ? `${level.name} 달성!` : lang === "spanish" ? `¡Nivel ${level.name} alcanzado!` : `You reached ${level.name}!`;
  const btnText = lang === "korean" ? "계속하기 →" : lang === "spanish" ? "¡Continuar! →" : "Keep going! →";
  const lingoLine = lang === "korean"
    ? "축하해요! 계속 열심히 하면 더 잘할 수 있어요! 🦊"
    : lang === "spanish"
    ? "¡Felicidades! ¡Sigue así y llegarás lejos! 🦊"
    : "Congrats! Keep learning and you'll go far! 🦊";

  const emojiPieces = Array.from({ length: 40 }, (_, i) => ({
    emoji:  EMOJI_CONFETTI[i % EMOJI_CONFETTI.length],
    delay:  i * 55,
    startX: 5 + (i % 10) * ((SCREEN_W - 56) / 10),
  }));

  const rectPieces = Array.from({ length: 30 }, (_, i) => ({
    color:  COLOR_CONFETTI[i % COLOR_CONFETTI.length],
    delay:  i * 60 + 30,
    startX: 8 + (i % 10) * ((SCREEN_W - 56) / 10),
    w: 6 + (i % 3) * 4,
    h: 10 + (i % 4) * 4,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={[C.bg1, C.bg2, C.bg3]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {emojiPieces.map((c, i) => <EmojiPiece key={`e${i}`} {...c} />)}
              {rectPieces.map((c, i)  => <RectPiece  key={`r${i}`} {...c} />)}
            </View>

            <CrownBounce anim={crownAnim} />

            <View style={styles.lingoWrap}>
              <Animated.Image
                source={rudyBadgeImg}
                style={[styles.lingo, { transform: [{ translateY: bounceAnim }] }]}
              />
            </View>

            <Text style={styles.title}>{title}</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>{level.emoji}</Text>
              <Text style={styles.badgeName}>{level.name}</Text>
            </View>

            <Text style={styles.sub}>{sub}</Text>

            <View style={styles.lingoSpeech}>
              <Text style={styles.lingoSpeechText}>{lingoLine}</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.btn, pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] }]}
              onPress={onClose}
            >
              <Text style={styles.btnText}>{btnText}</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: { width: "100%", borderRadius: 28, overflow: "hidden", borderWidth: 2, borderColor: C.gold },
  gradient: { padding: 24, alignItems: "center", gap: 8, overflow: "hidden" },
  lingoWrap: { width: 130, height: 130, alignItems: "center", justifyContent: "center" },
  lingo: { width: 120, height: 120, borderRadius: 60, overflow: "hidden" },
  title: {
    fontSize: 28,
    fontFamily: F.title,
    color: C.gold,
    textShadowColor: "rgba(201,162,39,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(201,162,39,0.15)",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.gold,
  },
  badgeEmoji: { fontSize: 28 },
  badgeName:  { fontSize: 20, fontFamily: F.header, color: C.gold },
  sub:        { fontSize: 15, fontFamily: F.bodySemi, color: C.parchment, textAlign: "center" },
  lingoSpeech: {
    backgroundColor: "rgba(201,162,39,0.12)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "100%",
  },
  lingoSpeechText: { fontSize: 14, fontFamily: F.body, color: C.parchment, textAlign: "center", lineHeight: 22, fontStyle: "italic" },
  btn: {
    marginTop: 6,
    backgroundColor: C.gold,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: { fontSize: 16, fontFamily: F.header, color: C.bg1, letterSpacing: 1 },
});
