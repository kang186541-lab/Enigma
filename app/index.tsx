import { Redirect } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { hasOnboarded, nativeLanguage } = useLanguage();

  if (nativeLanguage === null && !hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  if (hasOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF0F6" }}>
      <ActivityIndicator color="#FF6B9D" />
    </View>
  );
}
