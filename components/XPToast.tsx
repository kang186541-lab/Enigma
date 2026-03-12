import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, View } from "react-native";

interface Props {
  amount: number;
  onDone: () => void;
}

export function XPToast({ amount, onDone }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!amount) return;
    opacity.setValue(1);
    translateY.setValue(0);
    scale.setValue(0.5);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 7 }),
      ]),
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -55, duration: 500, useNativeDriver: true }),
      ]),
    ]).start(() => onDone());
  }, [amount]);

  if (!amount) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { opacity, transform: [{ translateY }, { scale }] }]}
    >
      <View style={styles.badge}>
        <Text style={styles.text}>+{amount} XP ⚡</Text>
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
  badge: {
    backgroundColor: "#FF6B9D",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 32,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
  },
  text: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
