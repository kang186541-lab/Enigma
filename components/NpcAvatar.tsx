import React from "react";
import {
  Image,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmojiText } from "@/components/EmojiText";
import { getNPCVisual } from "@/constants/npcVisuals";
import { C } from "@/constants/theme";

interface NpcAvatarProps {
  npc?: {
    id: string;
    name: string;
    emoji: string;
    color: string;
  } | null;
  size?: number;
  radius?: number;
  locked?: boolean;
  emotion?: string | null;
  showEmotion?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export function NpcAvatar({
  npc,
  size = 54,
  radius,
  locked = false,
  emotion,
  showEmotion = false,
  containerStyle,
  imageStyle,
}: NpcAvatarProps) {
  const visual = getNPCVisual(npc?.id);
  const borderRadius = radius ?? Math.max(14, Math.round(size * 0.3));
  const color = npc?.color ?? "#888888";

  return (
    <View style={[styles.root, { width: size, height: size }, containerStyle]}>
      <View
        style={[
          styles.frame,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: `${color}33`,
            borderColor: `${color}88`,
          },
        ]}
      >
        {visual ? (
          <Image
            source={visual.rolePortrait}
            style={[styles.image, locked && styles.lockedImage, imageStyle]}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <EmojiText style={[styles.emoji, { fontSize: Math.round(size * 0.48) }]}>
            {npc?.emoji ?? "?"}
          </EmojiText>
        )}
        {locked ? (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={Math.round(size * 0.34)} color={C.gold} />
          </View>
        ) : null}
      </View>
      {showEmotion && !locked && emotion ? (
        <EmojiText style={[styles.emotionBadge, { fontSize: Math.max(12, Math.round(size * 0.24)) }]}>
          {emotion}
        </EmojiText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
    position: "relative",
  },
  frame: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "118%",
    height: "118%",
  },
  lockedImage: {
    opacity: 0.35,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18,7,3,0.45)",
  },
  emoji: {
    lineHeight: 34,
  },
  emotionBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: C.bg1,
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 1,
    overflow: "hidden",
  },
});
