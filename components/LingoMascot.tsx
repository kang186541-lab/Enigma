import React, { useEffect, useRef } from "react";
import { View, Text, Image, Animated, StyleSheet, ViewStyle, Platform } from "react-native";

const lingoImg = require("@/assets/lingo.png");

interface LingoMascotProps {
  size?: number;
  mood?: "happy" | "sad" | "excited" | "normal";
  showBubble?: boolean;
  bubbleText?: string;
  bubblePosition?: "left" | "right";
  style?: ViewStyle;
  showCircle?: boolean;
}

export function LingoMascot({
  size = 80,
  mood = "happy",
  showBubble,
  bubbleText,
  bubblePosition = "left",
  style,
  showCircle = false,
}: LingoMascotProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (mood === "excited") {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -14, duration: 280, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0,   duration: 280, useNativeDriver: true }),
        ])
      );
    } else if (mood === "sad") {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, { toValue: 1,  duration: 400, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: -1, duration: 400, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 0,  duration: 400, useNativeDriver: true }),
        ])
      );
    } else {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -4, duration: 1000, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0,  duration: 1000, useNativeDriver: true }),
        ])
      );
    }
    loop.start();
    return () => loop?.stop();
  }, [mood]);

  const rotate = rotateAnim.interpolate({ inputRange: [-1, 1], outputRange: ["-8deg", "8deg"] });
  const moodBadge = mood === "sad" ? "😢" : mood === "excited" ? "🎉" : null;
  const circleSize = size * 1.25;

  const bubble = showBubble && bubbleText ? (
    <View style={bubblePosition === "left" ? styles.bubbleLeft : styles.bubbleRight}>
      <Text style={styles.bubbleText}>{bubbleText}</Text>
      <View style={bubblePosition === "left" ? styles.tailRight : styles.tailLeft} />
    </View>
  ) : null;

  const imgNode = (
    <Animated.Image
      source={lingoImg}
      style={[
        styles.img,
        { width: size, height: size },
        { transform: [{ translateY: bounceAnim }, { rotate }] },
      ]}
    />
  );

  return (
    <View style={[styles.row, style]}>
      {bubblePosition === "left" && bubble}
      <View style={styles.imgWrap}>
        {showCircle ? (
          <View
            style={[
              styles.circle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
              },
            ]}
          >
            {imgNode}
          </View>
        ) : (
          imgNode
        )}
        {moodBadge && <Text style={styles.moodBadge}>{moodBadge}</Text>}
      </View>
      {bubblePosition === "right" && bubble}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end" },
  imgWrap: { position: "relative", alignItems: "center", justifyContent: "center" },
  img: {
    resizeMode: "contain",
    backgroundColor: "transparent",
    ...(Platform.OS === "web" ? { mixBlendMode: "multiply" } as any : {}),
  },
  circle: {
    backgroundColor: "#FFE8D6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  moodBadge: { position: "absolute", top: -4, right: -4, fontSize: 16 },

  bubbleLeft: {
    maxWidth: 190,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 10,
    marginRight: 8,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
    alignSelf: "center",
  },
  bubbleRight: {
    maxWidth: 190,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 10,
    marginLeft: 8,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
    alignSelf: "center",
  },
  tailRight: {
    position: "absolute",
    right: -7,
    bottom: 10,
    width: 0, height: 0,
    borderLeftWidth: 8, borderTopWidth: 6, borderBottomWidth: 6,
    borderLeftColor: "#FFFFFF",
    borderTopColor: "transparent", borderBottomColor: "transparent",
  },
  tailLeft: {
    position: "absolute",
    left: -7,
    bottom: 10,
    width: 0, height: 0,
    borderRightWidth: 8, borderTopWidth: 6, borderBottomWidth: 6,
    borderRightColor: "#FFFFFF",
    borderTopColor: "transparent", borderBottomColor: "transparent",
  },
  bubbleText: { fontSize: 12, color: "#3A2030", lineHeight: 18 },
});
