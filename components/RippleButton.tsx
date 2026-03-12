import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  View,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";

interface RippleButtonProps {
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  rippleColor?: string;
  disabled?: boolean;
}

export function RippleButton({
  onPress,
  style,
  children,
  rippleColor = "rgba(255,107,157,0.35)",
  disabled = false,
}: RippleButtonProps) {
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<View>(null);

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;

    const { locationX, locationY } = e.nativeEvent;
    setRipplePos({ x: locationX, y: locationY });

    scaleAnim.setValue(0);
    opacityAnim.setValue(1);

    Animated.parallel([
      Animated.timing(scaleAnim,   { toValue: 8,  duration: 480, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0,  duration: 480, useNativeDriver: true }),
    ]).start();

    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={style} disabled={disabled}>
      <View ref={containerRef} style={styles.inner} collapsable={false}>
        {/* Ripple circle */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ripple,
            {
              backgroundColor: rippleColor,
              left:    ripplePos.x - 20,
              top:     ripplePos.y - 20,
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    overflow: "hidden",
  },
  ripple: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    zIndex: 0,
  },
});
