import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNetwork } from "@/lib/networkManager";
import { useLanguage } from "@/context/LanguageContext";
import { C, F } from "@/constants/theme";

export function OfflineBanner() {
  const { isOnline } = useNetwork();
  const { nativeLanguage } = useLanguage();
  const nativeLang = nativeLanguage ?? "english";
  const [visible, setVisible] = useState(!isOnline);
  const slideY = useRef(new Animated.Value(isOnline ? -60 : 0)).current;

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      Animated.spring(slideY, {
        toValue: 0,
        tension: 120,
        friction: 10,
        useNativeDriver: false,
      }).start();
    } else if (visible) {
      Animated.timing(slideY, {
        toValue: -60,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setVisible(false));
    }
  }, [isOnline]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.banner, { transform: [{ translateY: slideY }] }]}
    >
      <Ionicons name="cloud-offline" size={16} color={C.parchment} />
      <Text style={styles.text}>
        {nativeLang === "korean" ? "오프라인 모드" : nativeLang === "spanish" ? "Modo sin conexión" : "Offline Mode"}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    paddingTop: 48,
    backgroundColor: C.error,
  },
  text: {
    fontSize: 14,
    fontFamily: F.bodySemi,
    color: C.parchment,
    letterSpacing: 0.5,
  },
});
