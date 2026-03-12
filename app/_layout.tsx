import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
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

SplashScreen.preventAutoHideAsync();

const lingoImg = require("@/assets/lingo.png");

function LingoLoadingScreen() {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -18, duration: 380, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0,   duration: 380, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[loadingStyles.root, { opacity: fadeAnim }]}>
      <Animated.Image
        source={lingoImg}
        style={[loadingStyles.lingo, { transform: [{ translateY: bounceAnim }] }]}
      />
      <Text style={loadingStyles.title}>LingoFox</Text>
      <Text style={loadingStyles.sub}>🦊 Loading your language journey...</Text>
      <View style={loadingStyles.dots}>
        {[0, 1, 2].map((i) => <View key={i} style={loadingStyles.dot} />)}
      </View>
    </Animated.View>
  );
}

const loadingStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFF0F6",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  lingo: { width: 220, height: 220, resizeMode: "contain" },
  title: { fontSize: 30, fontWeight: "800", color: "#FF6B9D", letterSpacing: -0.5 },
  sub:   { fontSize: 14, color: "#C080A0", fontWeight: "500" },
  dots:  { flexDirection: "row", gap: 8, marginTop: 4 },
  dot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF6B9D" },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"      options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)"     options={{ headerShown: false }} />
      <Stack.Screen name="chat-room"  options={{ headerShown: false, presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
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
