import {
  Cinzel_400Regular,
  Cinzel_700Bold,
  Cinzel_900Black,
  useFonts as useCinzel,
} from "@expo-google-fonts/cinzel";
import {
  CrimsonText_400Regular,
  CrimsonText_600SemiBold,
  CrimsonText_700Bold,
  useFonts as useCrimson,
} from "@expo-google-fonts/crimson-text";
import { QueryClientProvider } from "@tanstack/react-query";
import { Asset } from "expo-asset";
import { useFonts as useIconFonts } from "expo-font";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { FirstTimeSignInModal } from "@/components/FirstTimeSignInModal";
import { MotivationSurvey } from "@/components/MotivationSurvey";
import { queryClient } from "@/lib/query-client";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { C } from "@/constants/theme";
import { initMonitoring } from "@/lib/monitoring";
import { Analytics } from "@/lib/analytics";

initMonitoring();
Analytics.init();
Analytics.track("app_open");

SplashScreen.preventAutoHideAsync();

const rudySplashImg = require("@/assets/rudy_splash.png");
const { width: SCREEN_W } = Dimensions.get("window");
const IMG_SIZE = Math.min(SCREEN_W - 40, 360);

// Splash subtitle copy. The splash renders BEFORE LanguageProvider mounts, so
// we read @lingua_language straight from AsyncStorage (best-effort, defaults to
// English) — same approach as ErrorFallback.tsx. The title "Enigma Language
// Adventure" is the brand name and stays untranslated.
const SPLASH_SUB: Record<"korean" | "english" | "spanish" | "indonesian", string> = {
  korean:     "단서 하나씩, 언어의 비밀을 풀어가요...",
  english:    "Unravelling languages, one clue at a time...",
  spanish:    "Descifrando idiomas, una pista a la vez...",
  indonesian: "Mengungkap bahasa, satu petunjuk demi satu...",
};

function LoadingScreen() {
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;
  const floatAnim   = useRef(new Animated.Value(0)).current;

  const [lang, setLang] = useState<"korean" | "english" | "spanish" | "indonesian">("english");
  useEffect(() => {
    AsyncStorage.getItem("@lingua_language").then((v) => {
      if (v === "korean" || v === "spanish" || v === "english" || v === "indonesian") setLang(v);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,  duration: 1800, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnim, { toValue: 0.6, duration: 80,  useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1,   duration: 120, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 0.8, duration: 60,  useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[ls.root, { opacity: fadeAnim }]}>
      <Animated.Image
        source={rudySplashImg}
        style={[ls.illustration, { transform: [{ translateY: floatAnim }] }]}
        resizeMode="contain"
      />
      <Text style={ls.title}>Enigma Language Adventure</Text>
      <Text style={ls.sub}>{SPLASH_SUB[lang]}</Text>
      <View style={ls.dots}>
        {[0, 1, 2].map((i) => (
          <Animated.View key={i} style={[ls.dot, { opacity: flickerAnim }]} />
        ))}
      </View>
    </Animated.View>
  );
}

const ls = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  illustration: {
    width: IMG_SIZE,
    height: IMG_SIZE,
    borderRadius: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: "Cinzel_900Black",
    color: C.gold,
    letterSpacing: 1,
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    fontFamily: "CrimsonText_400Regular",
    color: C.goldDim,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  dots: { flexDirection: "row", gap: 8, marginTop: 4 },
  dot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: C.gold },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"        options={{ headerShown: false }} />
      <Stack.Screen name="onboarding"   options={{ headerShown: false }} />
      <Stack.Screen name="first-sentence-intro" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="(tabs)"       options={{ headerShown: false }} />
      <Stack.Screen name="chat-room"    options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="npc-list"     options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="npc-mission"  options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="basic-course" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="rudy-course"       options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="rudy-lesson"       options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="expression-book"   options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="daily-lesson"      options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="story-scene"       options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="escape-room"        options={{ headerShown: false }} />
      <Stack.Screen name="settings"          options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="stats-dashboard"   options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="writing-practice"  options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="achievements"      options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="leaderboard"       options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="teacher-dashboard" options={{ headerShown: false }} />
    </Stack>
  );
}

const PRELOAD_IMAGES = [
  require("@/assets/rudy_badge.png"),
  require("@/assets/rudy_splash.png"),
  require("@/assets/rudy_story.png"),
  require("@/assets/story/characters/rudy/rudy_dialogue_stage_v2.png"),
  require("@/assets/story/characters/rudy/rudy_worried_stage_v2.png"),
  require("@/assets/story/characters/rudy/rudy_celebratory_stage_v2.png"),
];

export default function RootLayout() {
  const [cinzelLoaded,  cinzelError]  = useCinzel({ Cinzel_400Regular, Cinzel_700Bold, Cinzel_900Black });
  const [crimsonLoaded, crimsonError] = useCrimson({ CrimsonText_400Regular, CrimsonText_600SemiBold, CrimsonText_700Bold });
  const [iconsLoaded,   iconsError]   = useIconFonts({ ...Ionicons.font, ...Feather.font });

  const fontsLoaded = cinzelLoaded  && crimsonLoaded && iconsLoaded;
  const fontError   = cinzelError   || crimsonError  || iconsError;

  useEffect(() => {
    Asset.loadAsync(PRELOAD_IMAGES).catch((e) => console.warn('[Layout] preload images failed:', e));
  }, []);

  useEffect(() => {
    if (iconsError) {
      console.warn("[Layout] icon font load failed; web icons may render as squares:", iconsError);
    }
  }, [iconsError]);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <ThemeProvider>
              <AuthProvider>
                <LanguageProvider>
                  <OfflineBanner />
                  <RootLayoutNav />
                  <FirstTimeSignInModal />
                  <MotivationSurvey />
                </LanguageProvider>
              </AuthProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
