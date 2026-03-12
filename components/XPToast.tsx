import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, F } from "@/constants/theme";

interface Props {
  amount: number;
  onDone: () => void;
}

export function XPToast({ amount, onDone }: Props) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scale      = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!amount) return;
    opacity.setValue(0);
    translateY.setValue(30);
    scale.setValue(0.6);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.spring(scale,      { toValue: 1, tension: 200, friction: 7, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 160, friction: 8, useNativeDriver: true }),
      ]),
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 420, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -60, duration: 420, useNativeDriver: true }),
        Animated.timing(scale,      { toValue: 1.08, duration: 420, useNativeDriver: true }),
      ]),
    ]).start(() => onDone());
  }, [amount]);

  if (!amount) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { opacity, transform: [{ translateY }, { scale }] }]}
    >
      <View style={styles.outer}>
        <LinearGradient
          colors={[C.bg2, C.bg1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badge}
        >
          <Text style={styles.icon}>🔍</Text>
          <Text style={styles.text}>+{amount} XP</Text>
          <Text style={styles.star}>✦</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: "38%",
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    pointerEvents: "none" as any,
  },
  outer: {
    borderRadius: 34,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: C.gold,
  },
  icon: { fontSize: 20 },
  text: {
    fontSize: 26,
    fontFamily: F.header,
    color: C.gold,
    letterSpacing: 1,
  },
  star: {
    fontSize: 18,
    color: C.gold,
  },
});
