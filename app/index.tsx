import { Redirect } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { C } from "@/constants/theme";

const DONE_KEY = (lang: string) => `basicCourseCompleted_${lang}`;

export default function Index() {
  const { hasOnboarded, nativeLanguage, learningLanguage } = useLanguage();
  const [checked,     setChecked]     = useState(false);
  const [coursesDone, setCoursesDone] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hasOnboarded || !learningLanguage) { setChecked(true); return; }
    AsyncStorage.getItem(DONE_KEY(learningLanguage)).then((v) => {
      setCoursesDone(v === "true");
      setChecked(true);
    });
  }, [hasOnboarded, learningLanguage]);

  if (!checked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg1 }}>
        <ActivityIndicator color={C.gold} />
      </View>
    );
  }

  if (!hasOnboarded || nativeLanguage === null) {
    return <Redirect href="/onboarding" />;
  }

  if (coursesDone === false) {
    return <Redirect href="/basic-course" />;
  }

  return <Redirect href="/(tabs)" />;
}
