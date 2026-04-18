import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";

export type ToastType = "success" | "error" | "warning" | "info";

interface Props {
  message: string;
  type: ToastType;
  onDone: () => void;
}

const ICON_MAP: Record<ToastType, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  success: { name: "checkmark-circle", color: C.success },
  error:   { name: "alert-circle",     color: C.error },
  warning: { name: "warning",          color: C.gold },
  info:    { name: "information-circle", color: C.parchment },
};

const BORDER_MAP: Record<ToastType, string> = {
  success: C.success,
  error:   C.error,
  warning: C.gold,
  info:    C.parchment,
};

export function AppToast({ message, type, onDone }: Props) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scale      = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!message) return;
    opacity.setValue(0);
    translateY.setValue(30);
    scale.setValue(0.6);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.spring(scale,      { toValue: 1, tension: 200, friction: 7, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 160, friction: 8, useNativeDriver: true }),
      ]),
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 420, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -60, duration: 420, useNativeDriver: true }),
      ]),
    ]).start(() => onDone());
  }, [message]);

  if (!message) return null;

  const icon = ICON_MAP[type];
  const borderColor = BORDER_MAP[type];

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
          style={[styles.badge, { borderColor }]}
        >
          <Ionicons name={icon.name} size={20} color={icon.color} />
          <Text style={[styles.text, { color: icon.color }]} numberOfLines={2}>
            {message}
          </Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: "12%",
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
    pointerEvents: "none" as any,
  },
  outer: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    maxWidth: 400,
    width: "100%",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontFamily: F.body,
    lineHeight: 20,
  },
});
