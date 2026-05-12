import { Platform } from "react-native";

export const C = {
  bg1:           "#1a0a05",
  bg2:           "#2c1810",
  bg3:           "#3d2418",
  tabBar:        "#0d0503",
  gold:          "#c9a227",
  goldDim:       "#a07d1a",
  goldDark:      "#8b6914",
  goldFaint:     "#c9a22722",
  parchment:     "#f4e8c1",
  parchmentDark: "#ede0aa",
  parchmentDeep: "#d4c48a",
  textDark:      "#c9a227",
  textParchment: "#2c1810",
  textMuted:     "#8b6914",
  border:        "#c9a22755",
  borderSolid:   "#c9a227",
  shadow:        "#c9a227",
  white:         "#FFFFFF",
  error:         "#c44",
  success:       "#5a9",
};

const webFontFallback =
  Platform.OS === "web"
    ? ', "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui, sans-serif'
    : "";

export const F = {
  title:     `Cinzel_900Black${webFontFallback}`,
  header:    `Cinzel_700Bold${webFontFallback}`,
  label:     `Cinzel_400Regular${webFontFallback}`,
  body:      `CrimsonText_400Regular${webFontFallback}`,
  bodySemi:  `CrimsonText_600SemiBold${webFontFallback}`,
  bodyBold:  `CrimsonText_700Bold${webFontFallback}`,
};
