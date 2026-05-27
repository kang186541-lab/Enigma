import React from "react";
import { Text, TextStyle, StyleProp, Platform } from "react-native";

/**
 * Splits text so that emoji characters render with the system font
 * (instead of a custom font like Cinzel/CrimsonText that lacks emoji glyphs).
 * On native platforms this is handled automatically; on web it isn't.
 */

const EMOJI_PATTERN =
  String.raw`\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\u{FE0F}|\u{FE0E})?(?:[\u{1F3FB}-\u{1F3FF}])?(?:\u{200D}\p{Extended_Pictographic}(?:\u{FE0F}|\u{FE0E})?(?:[\u{1F3FB}-\u{1F3FF}])?)*|\p{Emoji_Presentation}(?:\u{FE0F}|\u{FE0E})?(?:[\u{1F3FB}-\u{1F3FF}])?`;
const EMOJI_SPLIT_RE = new RegExp(`(${EMOJI_PATTERN})`, "gu");
const EMOJI_TEST_RE = new RegExp(`^(${EMOJI_PATTERN})$`, "u");
const WEB_EMOJI_FONT_FAMILY =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui, sans-serif';
const WEB_EMOJI_STYLE = { fontFamily: WEB_EMOJI_FONT_FAMILY };

interface Props {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  numberOfLines?: number;
}

function splitEmojiParts(value: string, keyPrefix: string): React.ReactNode[] {
  const parts = value.split(EMOJI_SPLIT_RE).filter(Boolean);
  if (parts.length <= 1) {
    if (EMOJI_TEST_RE.test(value)) {
      return [<Text key={`${keyPrefix}-emoji`} style={WEB_EMOJI_STYLE}>{value}</Text>];
    }
    return [value];
  }

  return parts.map((part, i) =>
    EMOJI_TEST_RE.test(part) ? (
      <Text key={`${keyPrefix}-${i}`} style={WEB_EMOJI_STYLE}>{part}</Text>
    ) : (
      part
    )
  );
}

export function EmojiText({ style, children, numberOfLines }: Props) {
  if (Platform.OS !== "web") {
    return <Text style={style} numberOfLines={numberOfLines}>{children}</Text>;
  }

  const parts = React.Children.toArray(children).flatMap((child, i) => {
    if (typeof child === "string" || typeof child === "number") {
      return splitEmojiParts(String(child), `emoji-${i}`);
    }
    return child;
  });

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts}
    </Text>
  );
}
