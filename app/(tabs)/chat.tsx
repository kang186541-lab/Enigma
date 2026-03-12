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
import { C, F } from "@/constants/theme";

const TAB_BAR_HEIGHT = 49;

const LANG_COLORS: Record<TutorLanguage, string> = {
  english: "#7eb8c9",
  spanish: "#c97b27",
  korean:  "#9b8bb4",
};

function TutorCard({ tutor, onPress }: { tutor: Tutor; onPress: () => void }) {
  const langColor = LANG_COLORS[tutor.language];
  return (
    <View style={styles.tutorCard}>
      <View style={[styles.avatarWrap, { borderColor: langColor }]}>
        <Image
          source={TUTOR_IMAGES[tutor.id]}
          style={styles.avatarImg}
          resizeMode="cover"
        />
        <View style={styles.flagBadge}>
          <Text style={styles.flagText}>{tutor.flag}</Text>
        </View>
      </View>

      <View style={styles.tutorInfo}>
        <View style={styles.tutorNameRow}>
          <Text style={styles.tutorName}>{tutor.name}</Text>
          <View style={[styles.stylePill, { borderColor: langColor + "66" }]}>
            <Text style={[styles.stylePillText, { color: langColor }]}>
              {tutor.style === "formal" ? "Formal" : "Casual"}
            </Text>
          </View>
        </View>
        <Text style={styles.tutorRegion}>{tutor.region}</Text>
        <Text style={styles.tutorPersonality}>{tutor.personality}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.startBtn,
            { borderColor: langColor },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
          onPress={onPress}
        >
          <Text style={[styles.startBtnText, { color: langColor }]}>
            {tutor.language === "korean" ? "채팅 시작" : tutor.language === "spanish" ? "Iniciar" : "Start Chat"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function TutorSelectScreen() {
  const insets = useSafeAreaInsets();
  const { t, setLearningLanguage, learningLanguage } = useLanguage();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : TAB_BAR_HEIGHT + insets.bottom;

  const handleSelect = (tutor: Tutor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLearningLanguage(tutor.language as any);
    router.push({ pathname: "/chat-room", params: { tutorId: tutor.id } });
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("chat_pick_tutor")}</Text>
        <Text style={styles.headerSub}>{t("chat_pick_sub")}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
      >
        {TUTOR_GROUPS.filter((g) => !learningLanguage || g.language === learningLanguage).map((group) => {
          const groupTutors = TUTORS.filter((t) => t.language === group.language);
          const langColor   = LANG_COLORS[group.language];
          return (
            <View key={group.language} style={styles.group}>
              <View style={styles.groupHeader}>
                <View style={[styles.groupDot, { backgroundColor: langColor }]} />
                <View style={styles.groupLine} />
                <Text style={[styles.groupLabel, { color: langColor }]}>
                  ✦ {group.label}
                </Text>
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
  container: { flex: 1, backgroundColor: C.bg1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 28,
  },
  group: { gap: 14 },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  groupLine: { flex: 0, width: 20, height: 1, backgroundColor: C.border },
  groupLabel: {
    fontSize: 14,
    fontFamily: F.header,
    letterSpacing: 1.5,
    flex: 1,
  },
  groupFlag: { fontSize: 20 },
  groupCards: { gap: 12 },

  tutorCard: {
    backgroundColor: C.bg2,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 18,
    borderWidth: 2,
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  avatarImg: { width: 68, height: 68, borderRadius: 18 },
  flagBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: C.bg1,
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: C.border,
  },
  flagText: { fontSize: 13 },

  tutorInfo: { flex: 1, gap: 4 },
  tutorNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tutorName: { fontSize: 17, fontFamily: F.header, color: C.parchment },
  stylePill: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  stylePillText: { fontSize: 11, fontFamily: F.bodySemi },
  tutorRegion: { fontSize: 12, fontFamily: F.body, color: C.goldDim, fontStyle: "italic" },
  tutorPersonality: {
    fontSize: 13, fontFamily: F.body, color: C.parchmentDark, lineHeight: 18, marginTop: 2, marginBottom: 6,
  },
  startBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  startBtnText: { fontSize: 13, fontFamily: F.bodySemi },
});
