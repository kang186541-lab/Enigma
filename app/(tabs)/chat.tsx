import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useLanguage } from "@/context/LanguageContext";
import { TUTORS, TUTOR_GROUPS, TUTOR_IMAGES, Tutor, TutorLanguage } from "@/constants/tutors";

const TAB_BAR_HEIGHT = 49;

const LANG_GRADIENT: Record<TutorLanguage, [string, string]> = {
  english: ["#4A90D9", "#6BB3F0"],
  spanish: ["#E85D3A", "#F2896D"],
  korean: ["#FF6B9D", "#FF4081"],
};

const LANG_LIGHT: Record<TutorLanguage, string> = {
  english: "#EBF4FD",
  spanish: "#FDF0ED",
  korean: "#FFF0F6",
};

function TutorCard({ tutor, onPress }: { tutor: Tutor; onPress: () => void }) {
  const [g1, g2] = LANG_GRADIENT[tutor.language];
  return (
    <View style={styles.tutorCard}>
      <View style={[styles.avatarWrap, { backgroundColor: LANG_LIGHT[tutor.language] }]}>
        <Image
          source={TUTOR_IMAGES[tutor.id]}
          style={styles.avatarImg}
          resizeMode="cover"
        />
        <View style={[styles.flagBadge, {}]}>
          <Text style={styles.flagText}>{tutor.flag}</Text>
        </View>
      </View>

      <View style={styles.tutorInfo}>
        <View style={styles.tutorNameRow}>
          <Text style={styles.tutorName}>{tutor.name}</Text>
          <View style={[styles.stylePill, { backgroundColor: tutor.style === "formal" ? "#EEF2FF" : "#FFF7ED" }]}>
            <Text style={[styles.stylePillText, { color: tutor.style === "formal" ? "#6366F1" : "#EA580C" }]}>
              {tutor.style === "formal" ? "Formal" : "Casual"}
            </Text>
          </View>
        </View>
        <Text style={styles.tutorRegion}>{tutor.region}</Text>
        <Text style={styles.tutorPersonality}>{tutor.personality}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.startBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
          onPress={onPress}
        >
          <LinearGradient colors={[g1, g2]} style={styles.startBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.startBtnText}>Start Chat</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

export default function TutorSelectScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : TAB_BAR_HEIGHT + insets.bottom;

  const handleSelect = (tutor: Tutor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/chat-room", params: { tutorId: tutor.id } });
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#FFF0F6", "#FFF8FB"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Tutor</Text>
        <Text style={styles.headerSub}>Pick the accent and style you want to practice with</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
      >
        {TUTOR_GROUPS.map((group) => {
          const groupTutors = TUTORS.filter((t) => t.language === group.language);
          const [g1, g2] = LANG_GRADIENT[group.language];
          return (
            <View key={group.language} style={styles.group}>
              <View style={styles.groupHeader}>
                <LinearGradient colors={[g1, g2]} style={styles.groupDot} />
                <Text style={styles.groupLabel}>{group.label}</Text>
                <Text style={styles.groupFlag}>{group.flag}</Text>
              </View>
              <View style={styles.groupCards}>
                {groupTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} onPress={() => handleSelect(tutor)} />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 24,
  },
  group: {
    gap: 12,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  groupDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  groupLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    flex: 1,
  },
  groupFlag: {
    fontSize: 20,
  },
  groupCards: {
    gap: 12,
  },
  tutorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    gap: 16,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    position: "relative",
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 20,
  },
  flagBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  flagText: {
    fontSize: 14,
  },
  tutorInfo: {
    flex: 1,
    gap: 4,
  },
  tutorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tutorName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  stylePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stylePillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  tutorRegion: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
  },
  tutorPersonality: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#5A4A54",
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 6,
  },
  startBtn: {
    borderRadius: 14,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  startBtnGradient: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 14,
  },
  startBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
