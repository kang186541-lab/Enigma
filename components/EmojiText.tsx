import React from "react";
import { Text, TextStyle, StyleProp, Platform } from "react-native";

/**
 * Splits text so that emoji characters render with the system font
 * (instead of a custom font like Cinzel/CrimsonText that lacks emoji glyphs).
 * On native platforms this is handled automatically; on web it isn't.
 */

const EMOJI_RE =
  /(\p{Emoji_Presentation}|\p{Extended_Pictographic}[\u{FE0F}\u{200D}]?)/gu;

interface Props {
  style?: StyleProp<TextStyle>;
  children: string;
  numberOfLines?: number;
}

export function EmojiText({ style, children, numberOfLines }: Props) {
  if (Platform.OS !== "web") {
    return <Text style={style} numberOfLines={numberOfLines}>{children}</Text>;
  }

  const parts = children.split(EMOJI_RE).filter(Boolean);
  if (parts.length <= 1) {
    return <Text style={style} numberOfLines={numberOfLines}>{children}</Text>;
  }

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, i) =>
        EMOJI_RE.test(part) ? (
          <Text key={i} style={{ fontFamily: "System" }}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}
