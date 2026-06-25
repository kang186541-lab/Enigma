/**
 * Escape Room — v1 MVP route ("The Sealed Archive").
 *
 * A NON-LINEAR lock board (3 locks solvable in ANY order). Each solved lock
 * reveals one clue word. Once all 3 clues are gathered the EXIT gate unlocks: a
 * reused BossSpellPuzzle seeded with the 3 clue words, itself gated behind a
 * final SpeakingLock requiring the player to SPEAK the assembled exit sentence.
 *
 * Count-up timer only (cosmetic). NO countdown, NO lose state. On escape we award
 * rewards exactly once (wonRef guard + idempotent WIN reducer action) and show a
 * minimal inline "Escaped!" win card.
 */

import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { EmojiText } from "@/components/EmojiText";

import { useLanguage } from "@/context/LanguageContext";
import { getEscapeRoom, type EscapeRoom, type LockData, type Tri } from "@/lib/escapeRooms";
import { awardEscapeRewards } from "@/lib/escapeRewards";
import BossSpellPuzzle, { type BossSpellQuestion } from "@/components/story/puzzles/BossSpellPuzzle";
import SpeakingLock from "@/components/escape/SpeakingLock";
import SentenceLock from "@/components/escape/SentenceLock";
import WritingLock from "@/components/escape/WritingLock";
import { C, F } from "@/constants/theme";

/* ── helpers ──────────────────────────────────────────────────────────────── */

function tri(t: Tri, lang: string): string {
  if (lang === "korean") return t.ko;
  if (lang === "spanish") return t.es;
  if (lang === "indonesian") return t.id ?? t.en;
  if (lang === "arabic") return t.ar ?? t.en;
  return t.en;
}

/** Azure assess lang code for /api/pronunciation-assess. */
function speechLangFor(learningLang: string): string {
  switch (learningLang) {
    case "korean":
      return "ko-KR";
    case "spanish":
      return "es-ES";
    case "indonesian":
      return "id-ID";
    case "arabic":
      return "ar-EG";
    default:
      return "en-US";
  }
}

// Per-learning-language exit boss-spell (assembles to the natural escape
// sentence "Use the key, free every word" in each language). EN is the
// data-file default; ko/es/id/ar are swapped in so a non-English learner
// assembles + speaks their OWN language at the exit. (Was Arabic-only — every
// other learner assembled the English spell, breaking the contract — and the
// Arabic spell used the old broken "Open the key / افتح المفتاح" wording.)
const ESCAPE_BOSS_BY_LANG: Record<string, Pick<BossSpellQuestion, "spellChunks" | "separators" | "wordPool">> = {
  korean: {
    spellChunks: ["열쇠로", "모든", "단어를", "풀어요"],
    separators: ["", "", "", ""],
    wordPool: ["열쇠로", "모든", "단어를", "풀어요", "닫아요", "자물쇠", "가둬요"],
  },
  spanish: {
    spellChunks: ["Usa", "la", "llave", "libera", "cada", "palabra"],
    separators: ["", "", ",", "", "", ""],
    wordPool: ["Usa", "la", "llave", "libera", "cada", "palabra", "cierra", "candado", "atrapa"],
  },
  indonesian: {
    spellChunks: ["Gunakan", "kuncinya", "bebaskan", "setiap", "kata"],
    separators: ["", ",", "", "", ""],
    wordPool: ["Gunakan", "kuncinya", "bebaskan", "setiap", "kata", "tutup", "segel", "jebak"],
  },
  arabic: {
    spellChunks: ["اِسْتَخْدِم", "المِفْتاح", "حَرِّر", "كُلّ", "كَلِمة"],
    separators: ["", "،", "", "", ""],
    wordPool: ["اِسْتَخْدِم", "المِفْتاح", "حَرِّر", "كُلّ", "كَلِمة", "أَغْلِق", "القُفْل", "اِحْبِس"],
  },
};

function bossSpellForLearning(question: BossSpellQuestion, learningLang: string): BossSpellQuestion {
  const ov = ESCAPE_BOSS_BY_LANG[learningLang];
  return ov ? { ...question, ...ov } : question;
}

function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ── reducer (non-linear board) ───────────────────────────────────────────── */

type Phase = "locks" | "exit" | "won";

interface Board {
  phase: Phase;
  solved: Record<string, boolean>; // lockId -> solved
  clues: string[]; // collected clue words, in solve order (display)
  activeLockId: string | null; // which lock modal is open (null = board view)
}

type Action =
  | { t: "OPEN"; id: string }
  | { t: "CLOSE" }
  | { t: "SOLVE"; id: string; clue: string; lockIds: string[] }
  | { t: "WIN" };

function reducer(st: Board, a: Action): Board {
  switch (a.t) {
    case "OPEN":
      return { ...st, activeLockId: a.id };
    case "CLOSE":
      return { ...st, activeLockId: null };
    case "SOLVE": {
      if (st.solved[a.id]) return { ...st, activeLockId: null }; // idempotent
      const solved = { ...st.solved, [a.id]: true };
      const clues = [...st.clues, a.clue];
      const allDone = a.lockIds.every((id) => solved[id]);
      return { ...st, solved, clues, activeLockId: null, phase: allDone ? "exit" : "locks" };
    }
    case "WIN":
      return { ...st, phase: "won", activeLockId: null };
    default:
      return st;
  }
}

/* ── screen ───────────────────────────────────────────────────────────────── */

// Per-route error isolation: a render-phase throw in this screen is contained
// here (go-back fallback) instead of unwinding to the root whole-app reload.
export { RouteErrorBoundary as ErrorBoundary } from "@/components/RouteErrorBoundary";

export default function EscapeRoomScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { nativeLanguage, learningLanguage, awardXp } = useLanguage();
  const lang = nativeLanguage ?? "english";
  const learningLang = learningLanguage ?? "english";

  const room = getEscapeRoom(typeof params.id === "string" ? params.id : "sealed-archive");

  if (!room) {
    return <NotFound lang={lang} insets={insets} />;
  }

  return (
    <RoomView
      room={room}
      lang={lang}
      learningLang={learningLang}
      awardXp={awardXp}
      topPad={insets.top + 8}
      bottomPad={insets.bottom + 16}
    />
  );
}

function RoomView({
  room,
  lang,
  learningLang,
  awardXp,
  topPad,
  bottomPad,
}: {
  room: EscapeRoom;
  lang: string;
  learningLang: string;
  awardXp: (n: number) => Promise<void>;
  topPad: number;
  bottomPad: number;
}) {
  const lockIds = useMemo(() => room.locks.map((l) => l.id), [room]);
  const speechLang = useMemo(() => speechLangFor(learningLang), [learningLang]);

  const [board, dispatch] = useReducer(reducer, {
    phase: "locks",
    solved: {},
    clues: [],
    activeLockId: null,
  });

  // Exit gate is two beats: assemble the spell (BossSpell) → then speak it.
  const [spelled, setSpelled] = useState(false);

  // Count-up timer (cosmetic; never fails the run).
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  useEffect(() => {
    if (board.phase === "won") return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [board.phase]);

  // Fire rewards exactly once on escape.
  const wonRef = useRef(false);
  const finalTimeRef = useRef(0);

  function escapeNow(score: number | null) {
    if (wonRef.current) return;
    wonRef.current = true;
    finalTimeRef.current = elapsed;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    dispatch({ t: "WIN" });
    void awardEscapeRewards(room, learningLang, awardXp, score);
  }

  const solvedCount = useMemo(() => Object.values(board.solved).filter(Boolean).length, [board.solved]);
  const activeLock = board.activeLockId ? room.locks.find((l) => l.id === board.activeLockId) ?? null : null;

  function onLockSolved(lock: LockData) {
    dispatch({ t: "SOLVE", id: lock.id, clue: tri(lock.clue.word, learningLang), lockIds });
  }

  /* ----- WIN ----- */
  if (board.phase === "won") {
    return (
      <WinCard
        room={room}
        lang={lang}
        learningLang={learningLang}
        elapsed={finalTimeRef.current}
        topPad={topPad}
        bottomPad={bottomPad}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel={lang === "korean" ? "뒤로" : lang === "spanish" ? "Volver" : lang === "indonesian" ? "Kembali" : "Back"}
        >
          <Ionicons name="chevron-back" size={22} color={C.gold} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {tri(room.title, lang)}
        </Text>
        <View style={styles.timerPill}>
          <Ionicons name="time-outline" size={13} color={C.gold} />
          <Text style={styles.timerText}>{mmss(elapsed)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad + 24 }} showsVerticalScrollIndicator={false}>
        {/* Intro / progress */}
        <Text style={styles.intro}>{tri(room.intro, lang)}</Text>
        <View style={styles.cluesRow}>
          {room.locks.map((l, i) => {
            const got = !!board.solved[l.id];
            return (
              <View key={l.id} style={[styles.cluePill, got && styles.cluePillGot]}>
                <Text style={[styles.cluePillText, got && styles.cluePillTextGot]}>
                  {got ? tri(l.clue.word, learningLang) : `? ${i + 1}`}
                </Text>
              </View>
            );
          })}
        </View>

        {board.phase === "locks" && (
          <>
            <Text style={styles.sectionLabel}>
              {lang === "korean"
                ? `자물쇠 ${solvedCount}/${room.locks.length}`
                : lang === "spanish"
                  ? `Cerraduras ${solvedCount}/${room.locks.length}`
                  : lang === "indonesian"
                    ? `Gembok ${solvedCount}/${room.locks.length}`
                    : `Locks ${solvedCount}/${room.locks.length}`}
            </Text>
            <View style={styles.lockGrid}>
              {room.locks.map((l) => {
                const got = !!board.solved[l.id];
                return (
                  <Pressable
                    key={l.id}
                    style={({ pressed }) => [styles.lockTile, got && styles.lockTileSolved, pressed && !got && { opacity: 0.8 }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                      if (!got) dispatch({ t: "OPEN", id: l.id });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={tri(l.title, lang)}
                  >
                    <Ionicons
                      name={got ? "lock-open" : l.kind === "speaking" ? "mic" : l.kind === "writing" ? "create" : "albums"}
                      size={26}
                      color={got ? C.success : C.gold}
                    />
                    <Text style={styles.lockTileTitle}>{tri(l.title, lang)}</Text>
                    <EmojiText style={styles.lockTileStatus}>
                      {got
                        ? lang === "korean"
                          ? "해제됨 ✓"
                          : lang === "spanish"
                            ? "Resuelto ✓"
                            : lang === "indonesian"
                              ? "Terpecahkan ✓"
                              : "Solved ✓"
                        : lang === "korean"
                          ? "잠김 🔒"
                          : lang === "spanish"
                            ? "Bloqueado 🔒"
                            : lang === "indonesian"
                              ? "Terkunci 🔒"
                              : "Locked 🔒"}
                    </EmojiText>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* EXIT phase: assemble the spell, then speak it. */}
        {board.phase === "exit" && (
          <View style={styles.exitWrap}>
            <Text style={styles.sectionLabel}>
              {lang === "korean" ? "출구" : lang === "spanish" ? "Salida" : lang === "indonesian" ? "Pintu Keluar" : "The Exit"}
            </Text>
            {!spelled ? (
              <BossSpellPuzzle
                key="exit-spell"
                puzzle={{ pType: "boss-spell", questions: [bossSpellForLearning(room.exit.bossSpell, learningLang)] }}
                lang={lang}
                learningLang={learningLang}
                onSolved={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
                  setSpelled(true);
                }}
                onResetHints={() => {}}
              />
            ) : (
              <SpeakingLock
                lang={lang}
                learningLang={learningLang}
                instruction={room.exit.instruction}
                phrase={room.exit.spokenPhrase}
                speechLang={speechLang}
                nativeLang={lang}
                hints={room.exit.bossSpell.hints}
                onUnlocked={(score) => escapeNow(score)}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Lock modal */}
      <Modal
        visible={activeLock != null}
        animationType="slide"
        transparent
        onRequestClose={() => dispatch({ t: "CLOSE" })}
      >
        <View style={styles.modalScrim}>
          <View style={[styles.modalSheet, { paddingBottom: bottomPad }]}>
            <View style={styles.modalHandleRow}>
              <Pressable style={styles.modalClose} onPress={() => dispatch({ t: "CLOSE" })} accessibilityRole="button" accessibilityLabel={lang === "korean" ? "닫기" : lang === "spanish" ? "Cerrar" : lang === "indonesian" ? "Tutup" : "Close"}>
                <Ionicons name="close" size={22} color={C.gold} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
              {activeLock && <LockBody lock={activeLock} lang={lang} learningLang={learningLang} speechLang={speechLang} onSolved={() => onLockSolved(activeLock)} />}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ── one lock's interactive body ──────────────────────────────────────────── */

function LockBody({
  lock,
  lang,
  learningLang,
  speechLang,
  onSolved,
}: {
  lock: LockData;
  lang: string;
  learningLang: string;
  speechLang: string;
  onSolved: () => void;
}) {
  if (lock.kind === "speaking") {
    return (
      <SpeakingLock
        lang={lang}
        learningLang={learningLang}
        instruction={lock.instruction}
        phrase={lock.phrase}
        speechLang={speechLang}
        nativeLang={lang}
        hints={lock.hints}
        minScore={lock.minScore}
        onUnlocked={() => onSolved()}
      />
    );
  }

  if (lock.kind === "writing") {
    return <WritingLock lang={lang} learningLang={learningLang} question={lock.question} onUnlocked={onSolved} />;
  }

  // sentence-builder. SentenceBuilder needs an exact per-learning-language order,
  // which the shipped data only guarantees for EN/ES/ID. For KO/AR, degrade this
  // lock to a WRITING lock keyed on the clue word (type "key" / the target form).
  if (learningLang === "korean" || learningLang === "arabic") {
    return (
      <WritingLock
        lang={lang}
        learningLang={learningLang}
        question={{
          word: lock.clue.word,
          hint: lock.hints.h1,
          acceptableAnswers: { [learningLang]: [tri(lock.clue.word, learningLang)] },
        }}
        onUnlocked={onSolved}
      />
    );
  }

  return <SentenceLock lang={lang} learningLang={learningLang} question={lock.question} onUnlocked={onSolved} />;
}

/* ── win card ─────────────────────────────────────────────────────────────── */

function WinCard({
  room,
  lang,
  learningLang,
  elapsed,
  topPad,
  bottomPad,
}: {
  room: EscapeRoom;
  lang: string;
  learningLang: string;
  elapsed: number;
  topPad: number;
  bottomPad: number;
}) {
  const escapedTitle = lang === "korean" ? "탈출 성공!" : lang === "spanish" ? "¡Escapaste!" : lang === "indonesian" ? "Berhasil Keluar!" : "Escaped!";
  const timeLabel = lang === "korean" ? "기록" : lang === "spanish" ? "Tiempo" : lang === "indonesian" ? "Waktu" : "Time";
  const mastered = lang === "korean" ? "익힌 단어" : lang === "spanish" ? "Palabras dominadas" : lang === "indonesian" ? "Kata dikuasai" : "Words mastered";
  const backLabel = lang === "korean" ? "스토리로 돌아가기" : lang === "spanish" ? "Volver a Historia" : lang === "indonesian" ? "Kembali ke Cerita" : "Back to Story";

  return (
    <View style={[styles.container, styles.winContainer, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.winCard}>
        <EmojiText style={styles.winEmoji}>🗝️</EmojiText>
        <Text style={styles.winTitle}>{escapedTitle}</Text>
        <Text style={styles.winRoom}>{tri(room.title, lang)}</Text>

        <View style={styles.winStatRow}>
          <Text style={styles.winStatLabel}>{timeLabel}</Text>
          <Text style={styles.winStatValue}>{mmss(elapsed)}</Text>
        </View>

        <View style={styles.winDivider} />

        <Text style={styles.winStatLabel}>{mastered}</Text>
        <View style={styles.winClues}>
          {room.locks.map((l) => (
            <View key={l.id} style={styles.winCluePill}>
              <Text style={styles.winCluePillText}>{tri(l.clue.word, learningLang)}</Text>
            </View>
          ))}
        </View>

        <EmojiText style={styles.winXp}>{`⚡ +${room.xpOnEscape} XP`}</EmojiText>

        <Pressable
          style={({ pressed }) => [styles.winBtn, pressed && { opacity: 0.85 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            router.replace("/(tabs)/story");
          }}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
        >
          <Text style={styles.winBtnText}>{backLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NotFound({ lang, insets }: { lang: string; insets: { top: number } }) {
  return (
    <View style={[styles.container, styles.winContainer, { paddingTop: insets.top + 40 }]}>
      <Text style={styles.intro}>
        {lang === "korean" ? "방을 찾을 수 없어요." : lang === "spanish" ? "Sala no encontrada." : lang === "indonesian" ? "Ruangan tidak ditemukan." : "Room not found."}
      </Text>
      <Pressable style={styles.winBtn} onPress={() => router.back()}>
        <Text style={styles.winBtnText}>{lang === "korean" ? "뒤로" : lang === "spanish" ? "Volver" : lang === "indonesian" ? "Kembali" : "Back"}</Text>
      </Pressable>
    </View>
  );
}

/* ── styles ───────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg2,
  },
  headerTitle: { flex: 1, color: C.gold, fontFamily: F.header, fontSize: 18 },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg2,
  },
  timerText: { color: C.gold, fontFamily: F.bodySemi, fontSize: 13, minWidth: 34 },
  intro: {
    color: C.parchment,
    fontFamily: F.body,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
    marginTop: 16,
    marginBottom: 12,
  },
  cluesRow: { flexDirection: "row", gap: 8, marginBottom: 18, flexWrap: "wrap" },
  cluePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(0,0,0,0.24)",
  },
  cluePillGot: { borderColor: C.success, backgroundColor: "rgba(90,170,90,0.16)" },
  cluePillText: { color: C.goldDim, fontFamily: F.bodyBold, fontSize: 14 },
  cluePillTextGot: { color: "#FFE7A3" },
  sectionLabel: {
    color: C.gold,
    fontFamily: F.header,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  lockGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  lockTile: {
    width: "48%",
    minHeight: 116,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg2,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  lockTileSolved: { borderColor: C.success, backgroundColor: "rgba(90,170,90,0.1)" },
  lockTileTitle: { color: C.parchment, fontFamily: F.bodySemi, fontSize: 14, textAlign: "center" },
  lockTileStatus: { color: C.goldDim, fontFamily: F.body, fontSize: 12 },
  exitWrap: { marginTop: 4, gap: 12 },
  modalScrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: {
    maxHeight: "92%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  modalHandleRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  winContainer: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  winCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.5)",
    backgroundColor: "rgba(10,6,4,0.82)",
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  winEmoji: { fontSize: 48 },
  winTitle: { color: "#FFE7A3", fontFamily: F.title, fontSize: 28, letterSpacing: 1 },
  winRoom: { color: C.parchment, fontFamily: F.header, fontSize: 16, marginBottom: 6 },
  winStatRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  winStatLabel: { color: C.goldDim, fontFamily: F.label, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  winStatValue: { color: C.gold, fontFamily: F.bodyBold, fontSize: 18 },
  winDivider: { height: 1, alignSelf: "stretch", backgroundColor: C.border, marginVertical: 8 },
  winClues: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 4 },
  winCluePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.5)",
    backgroundColor: "rgba(201,162,39,0.14)",
  },
  winCluePillText: { color: "#FFE7A3", fontFamily: F.bodyBold, fontSize: 14 },
  winXp: { color: C.gold, fontFamily: F.bodyBold, fontSize: 16, marginTop: 10 },
  winBtn: {
    marginTop: 14,
    minHeight: 50,
    alignSelf: "stretch",
    borderRadius: 25,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  winBtnText: { color: C.bg1, fontFamily: F.bodyBold, fontSize: 16 },
});
