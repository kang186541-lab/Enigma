// Teacher dashboard — internal pilot tool (Korean-primary UI by design;
// learner i18n rules don't apply to this screen).
//
// Teachers enter their class join code + teacher key, and we fetch a cohort
// summary from the Railway API: GET /api/teacher/cohort-summary?code=&key=.
// Same base-URL mechanism as every other screen (new URL(path, getApiUrl()),
// see app/writing-practice.tsx and lib/billing.ts).
//
// Visited on web at https://web-dist2.vercel.app/teacher-dashboard.

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { C, F } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORE_KEY = "@lingua_teacher_dash_v1";

interface StoredCreds {
  code: string;
  key: string;
}

// ─── API types ───────────────────────────────────────────────────────────────

interface CohortRetention {
  d1: number | null;
  d7: number | null;
  d30: number | null;
}

interface CohortInfo {
  name: string;
  joinCode: string;
  memberCount: number;
  retention: CohortRetention;
  generatedAt: string;
}

interface StudentRow {
  maskedEmail: string;
  joinedAt: string | null;
  xp: number;
  level: number;
  streakDays: number;
  learningLang: string | null;
  lastSessionAt: string | null;
  totalSpeakingAttempts: number;
  attempts7d: number;
  activeDays7d: number;
  lastActiveAt: string | null;
  atRisk: boolean;
}

interface CohortSummary {
  cohort: CohortInfo;
  students: StudentRow[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retention value → "83%" (accepts 0–1 fraction or 0–100 percent) or "—". */
function pct(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  const p = v <= 1 ? v * 100 : v;
  return `${Math.round(p)}%`;
}

/** ISO timestamp → Korean relative time ("3일 전"). */
function relTime(iso: string | null | undefined): string {
  if (!iso) return "기록 없음";
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "기록 없음";
  const diffMs = Date.now() - then;
  if (diffMs < 60_000) return "방금 전";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}개월 전`;
  return `${Math.floor(months / 12)}년 전`;
}

/** ISO timestamp → "2026-06-12 14:05" (deterministic, no Intl dependency). */
function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return String(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** learningLang → compact chip label ("english" → "EN"). */
function langChip(lang: string | null | undefined): string | null {
  if (!lang) return null;
  const map: Record<string, string> = {
    english: "EN",
    korean: "KO",
    spanish: "ES",
    indonesian: "ID",
    arabic: "AR",
  };
  return map[lang.toLowerCase()] ?? lang.slice(0, 2).toUpperCase();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TeacherDashboardScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 28 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [code, setCode] = useState("");
  const [teacherKey, setTeacherKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CohortSummary | null>(null);

  // Restore last-used code/key for convenience.
  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const saved = JSON.parse(raw) as Partial<StoredCreds>;
          if (typeof saved.code === "string") setCode(saved.code);
          if (typeof saved.key === "string") setTeacherKey(saved.key);
        } catch {
          // corrupt entry — ignore
        }
      })
      .catch(() => {});
  }, []);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/" as any);
  };

  const load = async () => {
    const codeTrim = code.trim();
    const keyTrim = teacherKey.trim();
    if (!codeTrim || !keyTrim || loading) return;

    setLoading(true);
    setError(null);
    try {
      const url = new URL(
        `/api/teacher/cohort-summary?code=${encodeURIComponent(codeTrim)}&key=${encodeURIComponent(keyTrim)}`,
        getApiUrl(),
      ).toString();
      const res = await fetch(url);

      if (res.status === 401) {
        setError("교사 키가 올바르지 않습니다");
        setData(null);
        return;
      }
      if (res.status === 404) {
        setError("수업 코드를 찾을 수 없습니다");
        setData(null);
        return;
      }
      if (!res.ok) {
        setError(`불러오기에 실패했어요 (HTTP ${res.status})`);
        setData(null);
        return;
      }

      const json = (await res.json()) as CohortSummary;
      if (!json || !json.cohort) {
        setError("서버 응답 형식이 올바르지 않습니다");
        setData(null);
        return;
      }
      setData(json);

      try {
        await AsyncStorage.setItem(
          STORE_KEY,
          JSON.stringify({ code: codeTrim, key: keyTrim } satisfies StoredCreds),
        );
      } catch (e) {
        console.warn("[TeacherDash] creds persist failed:", e);
      }
    } catch (e) {
      console.warn("[TeacherDash] load failed:", e);
      setError("네트워크 오류 — 연결을 확인하고 다시 시도해 주세요");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const canLoad = !!code.trim() && !!teacherKey.trim() && !loading;
  const cohort = data?.cohort ?? null;
  const students = data?.students ?? [];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.65 }]}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={C.gold} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>교사 대시보드</Text>
          <Text style={styles.headerSub}>Teacher Dashboard · internal pilot</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 40 }]}
      >
        {/* ── Credentials ── */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>수업 코드 <Text style={styles.inputLabelEn}>join code</Text></Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="예: ABC123"
            placeholderTextColor={C.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
            editable={!loading}
          />
          <Text style={[styles.inputLabel, { marginTop: 12 }]}>교사 키 <Text style={styles.inputLabelEn}>teacher key</Text></Text>
          <TextInput
            value={teacherKey}
            onChangeText={setTeacherKey}
            placeholder="교사용 액세스 키"
            placeholderTextColor={C.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            editable={!loading}
          />
          <Pressable
            onPress={load}
            disabled={!canLoad}
            style={({ pressed }) => [
              styles.loadBtn,
              !canLoad && { opacity: 0.45 },
              pressed && canLoad && { opacity: 0.85 },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={C.bg1} />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={17} color={C.bg1} />
                <Text style={styles.loadBtnText}>불러오기</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* ── Error ── */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#F2697D" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Loading ── */}
        {loading && !data ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={C.gold} />
            <Text style={styles.loadingText}>불러오는 중...</Text>
          </View>
        ) : null}

        {/* ── Cohort summary card ── */}
        {cohort ? (
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cohortName}>{cohort.name}</Text>
                <Text style={styles.cohortCode}>코드 {cohort.joinCode}</Text>
              </View>
              <View style={styles.memberPill}>
                <Ionicons name="people-outline" size={14} color={C.gold} />
                <Text style={styles.memberPillText}>{cohort.memberCount}명</Text>
              </View>
            </View>

            <View style={styles.retentionRow}>
              {([
                ["D1", cohort.retention?.d1],
                ["D7", cohort.retention?.d7],
                ["D30", cohort.retention?.d30],
              ] as const).map(([label, v]) => (
                <View key={label} style={styles.retentionItem}>
                  <Text style={styles.retentionNum}>{pct(v)}</Text>
                  <Text style={styles.retentionLabel}>{label} 리텐션</Text>
                </View>
              ))}
            </View>

            <Text style={styles.generatedAt}>생성시각 {fmtDateTime(cohort.generatedAt)}</Text>
          </View>
        ) : null}

        {/* ── Students ── */}
        {cohort ? (
          students.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="school-outline" size={40} color={C.textMuted} />
              <Text style={styles.emptyText}>
                아직 참여한 학생이 없어요 — 학생에게 수업 코드를 공유하세요
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>학생 {students.length}명</Text>
                <Text style={styles.listLegend}>위험 = 3일 이상 미접속</Text>
              </View>
              {students.map((s, i) => (
                <View key={`${s.maskedEmail}-${i}`} style={[styles.studentCard, s.atRisk && styles.studentCardAtRisk]}>
                  <View style={styles.studentTopRow}>
                    <Text style={styles.studentEmail} numberOfLines={1}>
                      {s.maskedEmail}
                    </Text>
                    {langChip(s.learningLang) ? (
                      <View style={styles.langChip}>
                        <Text style={styles.langChipText}>{langChip(s.learningLang)}</Text>
                      </View>
                    ) : null}
                    {s.atRisk ? (
                      <View style={styles.riskBadge}>
                        <Text style={styles.riskBadgeText}>위험</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.studentMeta}>
                    Lv.{s.level} · {s.xp} XP · 연속 {s.streakDays}일 · 7일 발화 {s.attempts7d}회 · 총 발화 {s.totalSpeakingAttempts}회
                  </Text>
                  <Text style={styles.studentMetaSub}>
                    최근 활동 {relTime(s.lastActiveAt)} · 주간 활동 {s.activeDays7d}일
                    {s.joinedAt ? ` · 가입 ${relTime(s.joinedAt)}` : ""}
                  </Text>
                </View>
              ))}
            </>
          )
        ) : null}

        {/* ── Pre-load hint ── */}
        {!cohort && !loading && !error ? (
          <View style={styles.emptyBox}>
            <Ionicons name="key-outline" size={40} color={C.textMuted} />
            <Text style={styles.emptyText}>
              수업 코드와 교사 키를 입력하고 불러오기를 누르세요
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { padding: 4 },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
    marginTop: 2,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },

  // Credentials
  inputCard: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  inputLabel: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.goldDim,
    marginBottom: 6,
  },
  inputLabelEn: {
    fontFamily: F.body,
    fontSize: 11,
    color: C.textMuted,
    fontStyle: "italic",
  },
  input: {
    fontFamily: F.body,
    fontSize: 15,
    color: C.parchment,
    backgroundColor: C.bg2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.goldDim,
  },
  loadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.gold,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  loadBtnText: {
    fontFamily: F.header,
    fontSize: 15,
    color: C.bg1,
    letterSpacing: 1,
  },

  // Error / loading
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F2697D14",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F2697D55",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    flex: 1,
    fontFamily: F.bodySemi,
    fontSize: 14,
    color: "#F2697D",
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.goldDim,
    fontStyle: "italic",
  },

  // Cohort summary
  summaryCard: {
    backgroundColor: C.bg2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.borderSolid,
    padding: 16,
    gap: 14,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cohortName: {
    fontFamily: F.header,
    fontSize: 19,
    color: C.gold,
    letterSpacing: 0.5,
  },
  cohortCode: {
    fontFamily: F.body,
    fontSize: 12,
    color: C.goldDim,
    marginTop: 2,
  },
  memberPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.goldFaint,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  memberPillText: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.gold,
  },
  retentionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
  },
  retentionItem: { alignItems: "center", gap: 2 },
  retentionNum: {
    fontFamily: F.label,
    fontSize: 22,
    color: C.parchment,
  },
  retentionLabel: {
    fontFamily: F.body,
    fontSize: 11,
    color: C.textMuted,
  },
  generatedAt: {
    fontFamily: F.body,
    fontSize: 11,
    color: C.textMuted,
    fontStyle: "italic",
    textAlign: "right",
  },

  // Students
  listHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 2,
  },
  listTitle: {
    fontFamily: F.header,
    fontSize: 14,
    color: C.goldDim,
    letterSpacing: 1,
  },
  listLegend: {
    fontFamily: F.body,
    fontSize: 11,
    color: C.textMuted,
    fontStyle: "italic",
  },
  studentCard: {
    backgroundColor: C.bg2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 3,
    borderLeftColor: C.border,
    padding: 12,
    gap: 5,
  },
  studentCardAtRisk: {
    borderLeftColor: "#F2697D",
  },
  studentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  studentEmail: {
    flex: 1,
    fontFamily: F.bodySemi,
    fontSize: 15,
    color: C.parchment,
  },
  langChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: C.goldFaint,
    borderWidth: 1,
    borderColor: C.border,
  },
  langChipText: {
    fontFamily: F.bodySemi,
    fontSize: 10,
    color: C.goldDim,
    letterSpacing: 0.5,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#F2697D22",
    borderWidth: 1,
    borderColor: "#F2697D",
  },
  riskBadgeText: {
    fontFamily: F.bodySemi,
    fontSize: 11,
    color: "#F2697D",
    letterSpacing: 0.5,
  },
  studentMeta: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.parchment,
    lineHeight: 19,
  },
  studentMetaSub: {
    fontFamily: F.body,
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 17,
  },

  // Empty / hint
  emptyBox: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyText: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
});
