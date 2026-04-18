import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { C } from "@/constants/theme";
import { CLight } from "@/constants/lightTheme";

const THEME_KEY = "@lingua_theme";

type ThemeMode = "dark" | "light" | "system";
type Colors = typeof C;

interface ThemeContextType {
  isDark: boolean;
  mode: ThemeMode;
  colors: Colors;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  mode: "dark",
  colors: C,
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === "light" || val === "system") setModeState(val as ThemeMode);
    }).catch((e) => console.warn('[Theme] load failed:', e));
  }, []);

  const systemDark = Appearance.getColorScheme() !== "light";

  const isDark =
    mode === "dark" ? true :
    mode === "light" ? false :
    systemDark;

  const colors = isDark ? C : (CLight as unknown as Colors);

  const setMode = async (m: ThemeMode) => {
    setModeState(m);
    try {
      await AsyncStorage.setItem(THEME_KEY, m);
    } catch (e) {
      console.warn("[Theme] save failed:", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, mode, colors, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
