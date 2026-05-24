import { Platform } from "react-native";

export const C = {
  bg1:           "#1a0a05",
  bg2:           "#2c1810",
  bg3:           "#3d2418",
  tabBar:        "#0d0503",
  gold:          "#c9a227",
  // Bumped from #a07d1a (4.0:1 on bg2 — sub-AA at 12px) to ~5.5:1 on bg2
  // so all the 11–13px goldDim labels (xpLabel, syncChip, quickDesc,
  // srsBannerSub, settings pillText, etc.) clear WCAG 2.1 AA in one shot.
  goldDim:       "#c19a26",
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
