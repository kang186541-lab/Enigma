import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Animated,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Level } from "@/context/LanguageContext";

const lingoImg = require("@/assets/lingo.png");

const CONFETTI = ["🎉", "🎊", "⭐", "🦊", "✨", "💫", "🎈", "🌟"];

function ConfettiPiece({ emoji, delay, startX }: { emoji: string; delay: number; startX: number }) {
  const yAnim   = useRef(new Animated.Value(-20)).current;
  const opAnim  = useRef(new Animated.Value(0)).current;
  const rotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opAnim,  { toValue: 1,   duration: 150, useNativeDriver: true }),
        Animated.timing(yAnim,   { toValue: 440, duration: 2000, useNativeDriver: true }),
        Animated.timing(rotAnim, { toValue: 6,   duration: 2000, useNativeDriver: true }),
      ]),
      Animated.timing(opAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const rotate = rotAnim.interpolate({ inputRange: [0, 6], outputRange: ["0deg", "720deg"] });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        top: 0,
        left: startX,
        fontSize: 20,
        opacity: opAnim,
        transform: [{ translateY: yAnim }, { rotate }],
      }}
    >
      {emoji}
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
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const loopRef    = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      bounceAnim.setValue(0);
      Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 5, useNativeDriver: true }).start();

      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -22, duration: 340, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0,   duration: 340, useNativeDriver: true }),
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
    }
    return () => loopRef.current?.stop();
  }, [visible]);

  const title   = lang === "korean" ? "레벨 업! 🎉"       : lang === "spanish" ? "¡Nivel arriba! 🎉" : "Level Up! 🎉";
  const sub     = lang === "korean" ? `${level.name} 달성!` : lang === "spanish" ? `¡Nivel ${level.name} alcanzado!` : `You reached ${level.name}!`;
  const btnText = lang === "korean" ? "계속하기 →"          : lang === "spanish" ? "¡Continuar! →"     : "Keep going! →";
  const lingoLine = lang === "korean"
    ? "축하해요! 계속 열심히 하면 더 잘할 수 있어요! 🦊"
    : lang === "spanish"
    ? "¡Felicidades! ¡Sigue así y llegarás lejos! 🦊"
    : "Congrats! Keep learning and you'll go far! 🦊";

  const confetti = Array.from({ length: 16 }, (_, i) => ({
    emoji:   CONFETTI[i % CONFETTI.length],
    delay:   i * 90,
    startX:  20 + (i % 8) * 36,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={["#FF6B9D", "#FF4081", "#E8316E"]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Confetti rain */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {confetti.map((c, i) => <ConfettiPiece key={i} {...c} />)}
            </View>

            {/* Lingo bouncing */}
            <View style={styles.lingoCircle}>
              <Animated.Image
                source={lingoImg}
                style={[styles.lingo, { transform: [{ translateY: bounceAnim }] }]}
              />
            </View>

            <Text style={styles.title}>{title}</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>{level.emoji}</Text>
              <Text style={styles.badgeName}>{level.name}</Text>
            </View>

            <Text style={styles.sub}>{sub}</Text>

            {/* Lingo speech */}
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
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  card: { width: "100%", borderRadius: 28, overflow: "hidden" },
  gradient: { padding: 28, alignItems: "center", gap: 10, overflow: "hidden" },
  lingoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  lingo: { width: 130, height: 130, resizeMode: "contain" },
  title: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
  },
  badgeEmoji: { fontSize: 28 },
  badgeName:  { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  sub:        { fontSize: 14, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.9)", textAlign: "center" },
  lingoSpeech: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "100%",
  },
  lingoSpeechText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#FFFFFF", textAlign: "center", lineHeight: 20 },
  btn: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 16,
  },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FF6B9D" },
});
