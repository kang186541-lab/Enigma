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

type NLang = "korean" | "english" | "spanish";

// ── Trilingual metadata for each tutor (keyed by tutor.id) ───────────────────
const TUTOR_I18N: Record<string, {
  region: Record<NLang, string>;
  personality: Record<NLang, string>;
}> = {
  eleanor: {
    region: { korean: "영국 영어", english: "British English", spanish: "Inglés Británico" },
    personality: {
      korean: "박물관 큐레이터. 격식 있고 예리하며 정확함. 런던 챕터의 루디 멘토.",
      english: "Museum curator. Formal, sharp-witted, and precise. Rudy's mentor from the London chapter.",
      spanish: "Curadora del museo. Formal, perspicaz y precisa. Mentora de Rudy del capítulo de Londres.",
    },
  },
  tom_tutor: {
    region: { korean: "캐주얼 영어", english: "Casual English", spanish: "Inglés Casual" },
    personality: {
      korean: "박물관 경비원. 캐주얼하고 거리 감각이 있으며 장난치기 좋아함. 런던 챕터의 친구.",
      english: "Museum guard. Casual, streetwise, loves banter. Your buddy from the London chapter.",
      spanish: "Guardia del museo. Casual, astuto y bromista. Tu amigo del capítulo de Londres.",
    },
  },
  isabel: {
    region: { korean: "스페인 스페인어", english: "Spain Spanish", spanish: "Español de España" },
    personality: {
      korean: "대담하고 열정적. 드라마틱한 표현으로 생생한 카스테야노를 가르침. 마드리드 챕터.",
      english: "Bold and passionate. Teaches vivid Castellano with dramatic flair. From the Madrid chapter.",
      spanish: "Audaz y apasionada. Enseña un castellano vivo con dramatismo. Del capítulo de Madrid.",
    },
  },
  miguel: {
    region: { korean: "라틴 아메리카 스페인어", english: "Latin American Spanish", spanish: "Español Latinoamericano" },
    personality: {
      korean: "따뜻하고 지혜로우며 속담이 풍부. 음식과 인생의 지혜로 가르침. 마드리드 챕터.",
      english: "Warm, wise, full of proverbs. Teaches through food and life wisdom. From the Madrid chapter.",
      spanish: "Cálido, sabio, lleno de refranes. Enseña con comida y sabiduría. Del capítulo de Madrid.",
    },
  },
  sujin: {
    region: { korean: "서울 한국어", english: "Seoul Korean", spanish: "Coreano de Seúl" },
    personality: {
      korean: "대학 언어학자. 격식 있고 학구적이며 어원학에 열정적. 서울 챕터.",
      english: "University linguist. Formal, academic, fascinated by etymology. From the Seoul chapter.",
      spanish: "Lingüista universitaria. Formal, académica, apasionada por la etimología. Del capítulo de Seúl.",
    },
  },
  minho_tutor: {
    region: { korean: "MZ 한국어", english: "MZ Korean", spanish: "Coreano MZ" },
    personality: {
      korean: "홍대 스트리머. MZ 세대 은어와 인터넷 문화. 캐주얼하고 트렌디. 서울 챕터.",
      english: "Hongdae streamer. MZ generation slang and internet culture. Casual and trendy. From the Seoul chapter.",
      spanish: "Streamer de Hongdae. Argot MZ y cultura de internet. Casual y moderno. Del capítulo de Seúl.",
    },
  },
};

const GROUP_LABELS: Record<TutorLanguage, Record<NLang, string>> = {
  english: { korean: "영어", english: "English", spanish: "Inglés" },
  spanish: { korean: "스페인어", english: "Spanish", spanish: "Español" },
  korean:  { korean: "한국어", english: "Korean", spanish: "Coreano" },
};

const STYLE_LABELS: Record<"formal" | "casual", Record<NLang, string>> = {
  formal: { korean: "격식", english: "Formal", spanish: "Formal" },
  casual: { korean: "캐주얼", english: "Casual", spanish: "Casual" },
};

const START_LABELS: Record<NLang, string> = {
  korean: "채팅 시작",
  english: "Start Chat",
  spanish: "Iniciar",
};

function TutorCard({ tutor, onPress, nativeLang }: { tutor: Tutor; onPress: () => void; nativeLang: NLang }) {
  const langColor = LANG_COLORS[tutor.language];
  const i18n = TUTOR_I18N[tutor.id];
  const regionText = i18n?.region[nativeLang] ?? tutor.region;
  const personalityText = i18n?.personality[nativeLang] ?? tutor.personality;
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
              {STYLE_LABELS[tutor.style][nativeLang]}
            </Text>
          </View>
        </View>
        <Text style={styles.tutorRegion}>{regionText}</Text>
        <Text style={styles.tutorPersonality}>{personalityText}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.startBtn,
            { borderColor: langColor },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
          onPress={onPress}
        >
          <Text style={[styles.startBtnText, { color: langColor }]}>
            {START_LABELS[nativeLang]}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function TutorSelectScreen() {
  const insets = useSafeAreaInsets();
  const { t, setLearningLanguage, learningLanguage, nativeLanguage } = useLanguage();
  const nativeLang = (nativeLanguage ?? "english") as NLang;
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
                  ✦ {GROUP_LABELS[group.language][nativeLang]}
                </Text>
                <Text style={styles.groupFlag}>{group.flag}</Text>
              </View>
              <View style={styles.groupCards}>
                {groupTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} onPress={() => handleSelect(tutor)} nativeLang={nativeLang} />
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
