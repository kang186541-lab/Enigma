import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { EmojiText } from "@/components/EmojiText";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { getWeeklyXP, generateLeaderboard, getTierInfo, type LeagueEntry } from "@/lib/leagueManager";

const T = {
  title:    { ko: "주간 리더보드", en: "Weekly Leaderboard", es: "Tabla Semanal" },
  you:      { ko: "나", en: "You", es: "Tu" },
  weeklyXP: { ko: "주간 XP", en: "Weekly XP", es: "XP Semanal" },
  league:   { ko: "리그", en: "League", es: "Liga" },
  back:     { ko: "뒤로", en: "Back", es: "Volver" },
  noXP:     { ko: "아직 XP가 없어요! 레슨을 완료하면 리더보드에 올라갈 수 있어요 🏆", en: "No XP yet! Complete a lesson to climb the leaderboard 🏆", es: "¡Sin XP aún! Completa una lección para subir en la tabla 🏆" },
} as const;

function t(obj: Record<string, string>, lang: string) { return obj[lang] || obj.en; }

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nativeLanguage: nativeLang } = useLanguage();
  const lc = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";

  const [entries, setEntries] = useState<LeagueEntry[]>([]);
  const [weeklyXP, setWeeklyXP] = useState(0);

  useEffect(() => {
    (async () => {
      const xp = await getWeeklyXP();
      setWeeklyXP(xp);
      const board = generateLeaderboard(xp, t(T.you, lc));
      setEntries(board);
    })();
  }, []);

  const userEntry = entries.find((e) => e.isUser);
  const userTier = userEntry ? getTierInfo(userEntry.tier) : getTierInfo("bronze");

  return (
    <LinearGradient colors={[C.bg1, C.bg2]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.gold} />
        </Pressable>
        <Text style={styles.title}>{t(T.title, lc)}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* League Badge */}
      <View style={styles.leagueBanner}>
        <Text style={styles.leagueEmoji}>{userTier.emoji}</Text>
        <View>
          <Text style={styles.leagueName}>{t(userTier.name, lc)} {t(T.league, lc)}</Text>
          <Text style={styles.leagueXP}>{weeklyXP} {t(T.weeklyXP, lc)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {weeklyXP === 0 && (
          <View style={styles.noXpBanner}>
            <Text style={styles.noXpText}>{t(T.noXP, lc)}</Text>
          </View>
        )}
        {entries.map((entry, i) => {
          const rank = i + 1;
          const isTop3 = rank <= 3;
          const rankEmojis = ["🥇", "🥈", "🥉"];

          return (
            <View
              key={`${entry.name}-${i}`}
              style={[
                styles.row,
                entry.isUser && styles.rowUser,
              ]}
            >
              <EmojiText style={styles.rank}>{isTop3 ? rankEmojis[rank - 1] : `${rank}`}</EmojiText>
              <View style={styles.nameCol}>
                <Text style={[styles.name, entry.isUser && styles.nameUser]}>
                  {entry.name}
                  {entry.isUser ? ` (${t(T.you, lc)})` : ""}
                </Text>
              </View>
              <Text style={[styles.xp, entry.isUser && styles.xpUser]}>
                {entry.xp} XP
              </Text>
            </View>
          );
        })}
        <View style={{ height: 60 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, padding: 4 },
  title: { fontFamily: F.header, fontSize: 20, color: C.gold, letterSpacing: 1 },
  leagueBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    margin: 16,
    padding: 18,
    backgroundColor: C.bg3,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.gold,
  },
  leagueEmoji: { fontSize: 40 },
  leagueName: { fontFamily: F.header, fontSize: 18, color: C.gold },
  leagueXP: { fontFamily: F.body, fontSize: 14, color: C.goldDim, marginTop: 2 },
  list: { paddingHorizontal: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderRadius: 10,
    marginBottom: 4,
  },
  rowUser: {
    backgroundColor: "rgba(201,162,39,0.12)",
    borderWidth: 1,
    borderColor: C.gold,
  },
  rank: {
    fontFamily: F.header,
    fontSize: 16,
    color: C.goldDim,
    width: 36,
    textAlign: "center",
  },
  nameCol: { flex: 1, marginLeft: 8 },
  name: { fontFamily: F.body, fontSize: 15, color: C.parchment },
  nameUser: { fontFamily: F.bodySemi, color: C.gold },
  xp: { fontFamily: F.bodySemi, fontSize: 14, color: C.goldDim },
  xpUser: { color: C.gold },
  noXpBanner: {
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  noXpText: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.parchment,
    textAlign: "center",
    lineHeight: 18,
  },
});
