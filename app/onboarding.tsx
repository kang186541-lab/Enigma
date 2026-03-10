import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useLanguage, NativeLanguage } from "@/context/LanguageContext";

const { width } = Dimensions.get("window");

const LANGUAGES: { id: NativeLanguage; flag: string; nameMap: Record<NativeLanguage, string> }[] = [
  {
    id: "korean",
    flag: "🇰🇷",
    nameMap: { korean: "한국어", english: "Korean", spanish: "Coreano" },
  },
  {
    id: "english",
    flag: "🇺🇸",
    nameMap: { korean: "영어", english: "English", spanish: "Inglés" },
  },
  {
    id: "spanish",
    flag: "🇪🇸",
    nameMap: { korean: "스페인어", english: "Spanish", spanish: "Español" },
  },
];

const UI_TEXT: Record<NativeLanguage, { title: string; subtitle: string; cta: string }> = {
  korean: {
    title: "언어를 선택하세요",
    subtitle: "맞춤 학습 경험을 위해 모국어를 선택하세요",
    cta: "계속하기",
  },
  english: {
    title: "Select Your Language",
    subtitle: "Choose your native language to personalize your learning",
    cta: "Continue",
  },
  spanish: {
    title: "Selecciona tu idioma",
    subtitle: "Elige tu idioma nativo para personalizar tu aprendizaje",
    cta: "Continuar",
  },
};

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setNativeLanguage } = useLanguage();
  const [selected, setSelected] = useState<NativeLanguage | null>(null);
  const [loading, setLoading] = useState(false);

  const uiLang = selected ?? "english";
  const ui = UI_TEXT[uiLang];

  const handleSelect = (lang: NativeLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(lang);
  };

  const handleContinue = async () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await setNativeLanguage(selected);
    router.replace("/(tabs)");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#FF6B9D", "#FF8FB3", "#FFB3CE"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>✨</Text>
          <Text style={styles.logoText}>LinguaAI</Text>
        </View>

        <Text style={styles.title}>{ui.title}</Text>
        <Text style={styles.subtitle}>{ui.subtitle}</Text>
      </View>

      <View style={styles.cardsContainer}>
        {LANGUAGES.map((lang) => {
          const isSelected = selected === lang.id;
          return (
            <Pressable
              key={lang.id}
              style={({ pressed }) => [
                styles.langCard,
                isSelected && styles.langCardSelected,
                pressed && styles.langCardPressed,
              ]}
              onPress={() => handleSelect(lang.id)}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={[styles.langName, isSelected && styles.langNameSelected]}>
                {lang.nameMap[uiLang]}
              </Text>
              {isSelected && <View style={styles.checkDot} />}
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom + 16, 34) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            !selected && styles.ctaButtonDisabled,
            pressed && selected && styles.ctaButtonPressed,
          ]}
          onPress={handleContinue}
          disabled={!selected || loading}
        >
          <Text style={styles.ctaText}>{ui.cta}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  logoEmoji: {
    fontSize: 32,
  },
  logoText: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 24,
  },
  cardsContainer: {
    paddingHorizontal: 24,
    gap: 14,
  },
  langCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  langCardSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  langCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  flag: {
    fontSize: 36,
  },
  langName: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  langNameSelected: {
    color: "#FF6B9D",
  },
  checkDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF6B9D",
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.5)",
    shadowOpacity: 0,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  ctaText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FF6B9D",
    letterSpacing: 0.2,
  },
});
