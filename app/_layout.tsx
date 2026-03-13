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
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { View, Text, Image, Animated, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { LanguageProvider } from "@/context/LanguageContext";
import { C } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

const lingoImg = require("@/assets/lingo.png");

function LingoLoadingScreen() {
  const bounceAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -16, duration: 420, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0,   duration: 420, useNativeDriver: true }),
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
      <View style={ls.lantern}>
        <Animated.Text style={[ls.lanternEmoji, { opacity: flickerAnim }]}>🔍</Animated.Text>
      </View>
      <Animated.Image
        source={lingoImg}
        style={[ls.lingo, { transform: [{ translateY: bounceAnim }] }]}
      />
      <Text style={ls.title}>LingoFox</Text>
      <Text style={ls.sub}>Unravelling languages, one clue at a time...</Text>
      <View style={ls.dots}>
        {[0, 1, 2].map((i) => <Animated.View key={i} style={[ls.dot, { opacity: flickerAnim }]} />)}
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
    gap: 10,
  },
  lantern: { marginBottom: 4 },
  lanternEmoji: { fontSize: 36 },
  lingo: { width: 200, height: 200, resizeMode: "contain" },
  title: {
    fontSize: 30,
    fontFamily: "Cinzel_900Black",
    color: C.gold,
    letterSpacing: 2,
  },
  sub: {
    fontSize: 14,
    fontFamily: "CrimsonText_400Regular",
    color: C.goldDim,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  dots: { flexDirection: "row", gap: 8, marginTop: 8 },
  dot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: C.gold },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"        options={{ headerShown: false }} />
      <Stack.Screen name="onboarding"   options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)"       options={{ headerShown: false }} />
      <Stack.Screen name="chat-room"    options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="npc-list"     options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="npc-mission"  options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="basic-course" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [cinzelLoaded,  cinzelError]  = useCinzel({ Cinzel_400Regular, Cinzel_700Bold, Cinzel_900Black });
  const [crimsonLoaded, crimsonError] = useCrimson({ CrimsonText_400Regular, CrimsonText_600SemiBold, CrimsonText_700Bold });

  const fontsLoaded = cinzelLoaded  && crimsonLoaded;
  const fontError   = cinzelError   || crimsonError;

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return <LingoLoadingScreen />;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <LanguageProvider>
              <RootLayoutNav />
            </LanguageProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
