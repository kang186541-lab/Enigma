import { Redirect } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { View, ActivityIndicator } from "react-native";
import { C } from "@/constants/theme";

export default function Index() {
  const { hasOnboarded, isHydrated, nativeLanguage } = useLanguage();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg1 }}>
        <ActivityIndicator color={C.gold} />
      </View>
    );
  }

  if (!hasOnboarded || nativeLanguage === null) {
    return <Redirect href="/onboarding" />;
  }

  // Do not gate the first Home visit behind alphabet/basic-course study.
  // The core loop starts with one spoken sentence; Basic Course remains
  // available from Home for users who want the foundation first.
  return <Redirect href="/(tabs)" />;
}
