import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { C, F } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { getWeeklySessions, getMonthlySessions, getStatsSummary } from "@/lib/sessionTracker";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = Math.min(SCREEN_W - 48, 380);
const BAR_W = Math.floor(CHART_W / 7) - 6;

const T = {
  title:    { ko: "학습 통계", en: "Learning Stats", es: "Estadisticas" },
  week:     { ko: "이번 주", en: "This Week", es: "Esta Semana" },
  month:    { ko: "이번 달", en: "This Month", es: "Este Mes" },
  total:    { ko: "총 세션", en: "Total Sessions", es: "Total Sesiones" },
  totalXP:  { ko: "총 XP", en: "Total XP", es: "XP Total" },
  time:     { ko: "총 학습 시간", en: "Total Study Time", es: "Tiempo Total" },
  streak:   { ko: "스트릭 달력", en: "Streak Calendar", es: "Calendario de Racha" },
  noData:   { ko: "아직 데이터가 없어요!", en: "No data yet!", es: "Sin datos aun!" },
  firstWeek:{ ko: "첫 레슨을 완료하면 여기에 학습 기록이 표시돼요 📚", en: "Complete your first lesson to see your progress here 📚", es: "Completa tu primera lección para ver tu progreso aquí 📚" },
  back:     { ko: "뒤로", en: "Back", es: "Volver" },
} as const;

const DAYS_KO = ["월", "화", "수", "목", "금", "토", "일"];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_ES = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function t(obj: Record<string, string>, lang: string) { return obj[lang] || obj.en; }
function formatMs(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function StatsDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nativeLanguage: nativeLang, stats } = useLanguage();
  const lc = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";
  const dayNames = lc === "ko" ? DAYS_KO : lc === "es" ? DAYS_ES : DAYS_EN;

  const [weekData, setWeekData] = useState<Array<{ date: string; totalXP: number }>>([]);
  const [monthData, setMonthData] = useState<Array<{ date: string; sessions: number }>>([]);
  const [summary, setSummary] = useState({ totalSessions: 0, totalXP: 0, totalTimeMs: 0, skillBreakdown: {} as Record<string, number> });

  useEffect(() => {
    (async () => {
      const w = await getWeeklySessions();
      const m = await getMonthlySessions();
      const s = await getStatsSummary();
      setWeekData(w);
      setMonthData(m);
      setSummary(s);
    })();
  }, []);

  const maxXP = Math.max(10, ...weekData.map((d) => d.totalXP));

  // Month calendar
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7; // Mon=0
  const activeDates = new Set(monthData.filter((d) => d.sessions > 0).map((d) => parseInt(d.date.slice(-2))));

  return (
    <LinearGradient colors={[C.bg1, C.bg2]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.gold} />
        </Pressable>
        <Text style={styles.title}>{t(T.title, lc)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {summary.totalSessions === 0 && (
          <View style={styles.firstWeekBanner}>
            <Text style={styles.firstWeekText}>{t(T.firstWeek, lc)}</Text>
          </View>
        )}
        {/* ── Summary Cards ── */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{summary.totalSessions}</Text>
            <Text style={styles.summaryLabel}>{t(T.total, lc)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{stats.xp}</Text>
            <Text style={styles.summaryLabel}>{t(T.totalXP, lc)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{formatMs(summary.totalTimeMs)}</Text>
            <Text style={styles.summaryLabel}>{t(T.time, lc)}</Text>
          </View>
        </View>

        {/* ── Weekly XP Chart ── */}
        <Text style={styles.sectionTitle}>{t(T.week, lc)}</Text>
        <View style={styles.chartCard}>
          <Svg width={CHART_W} height={160}>
            {weekData.map((d, i) => {
              const barH = maxXP > 0 ? (d.totalXP / maxXP) * 120 : 0;
              const x = i * (BAR_W + 6) + 3;
              const y = 130 - barH;
              return (
                <React.Fragment key={d.date}>
                  <Rect
                    x={x}
                    y={y}
                    width={BAR_W}
                    height={Math.max(barH, 2)}
                    rx={4}
                    fill={d.totalXP > 0 ? C.gold : C.goldFaint}
                  />
                  {d.totalXP > 0 && (
                    <SvgText
                      x={x + BAR_W / 2}
                      y={y - 6}
                      fontSize={10}
                      fill={C.goldDim}
                      textAnchor="middle"
                      fontFamily={F.bodySemi}
                    >
                      {d.totalXP}
                    </SvgText>
                  )}
                  <SvgText
                    x={x + BAR_W / 2}
                    y={150}
                    fontSize={10}
                    fill={C.goldDim}
                    textAnchor="middle"
                    fontFamily={F.body}
                  >
                    {dayNames[i]}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </View>

        {/* ── Streak Calendar ── */}
        <Text style={styles.sectionTitle}>{t(T.streak, lc)}</Text>
        <View style={styles.chartCard}>
          <View style={styles.calHeader}>
            {dayNames.map((d) => (
              <Text key={d} style={styles.calHeaderText}>{d}</Text>
            ))}
          </View>
          <View style={styles.calGrid}>
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.calCell} />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isActive = activeDates.has(day);
              const isToday = day === now.getDate();
              return (
                <View
                  key={day}
                  style={[
                    styles.calCell,
                    isActive && styles.calCellActive,
                    isToday && styles.calCellToday,
                  ]}
                >
                  <Text style={[styles.calDay, isActive && styles.calDayActive]}>
                    {isActive ? "✓" : day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

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
  content: { paddingHorizontal: 16, paddingTop: 16 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    alignItems: "center",
  },
  summaryNum: { fontFamily: F.header, fontSize: 22, color: C.gold },
  summaryLabel: { fontFamily: F.body, fontSize: 11, color: C.goldDim, marginTop: 2 },
  sectionTitle: {
    fontFamily: F.header,
    fontSize: 14,
    color: C.goldDim,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 10,
  },
  chartCard: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    alignItems: "center",
  },
  calHeader: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 6,
  },
  calHeaderText: {
    flex: 1,
    textAlign: "center",
    fontFamily: F.label,
    fontSize: 10,
    color: C.goldDim,
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  calCellActive: {
    backgroundColor: "rgba(201,162,39,0.2)",
  },
  calCellToday: {
    borderWidth: 1.5,
    borderColor: C.gold,
  },
  calDay: {
    fontFamily: F.body,
    fontSize: 12,
    color: C.goldDim,
  },
  calDayActive: {
    color: C.gold,
    fontFamily: F.bodySemi,
  },
  firstWeekBanner: {
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  firstWeekText: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.parchment,
    textAlign: "center",
    lineHeight: 18,
  },
});
