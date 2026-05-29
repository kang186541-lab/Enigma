// One-question motivation survey — fires once after the user's FIRST
// XP-earning session (any source: lesson, speak, cards, story…). The trigger
// state lives in context/LanguageContext.tsx; this component just renders the
// sheet when `showMotivationSurvey` is true and writes the chosen answer to
// `learner_profile.goals` via lib/learnerProfile.ts:updateGoals.
//
// Show conditions (all enforced by LanguageContext):
//   - the user just gained positive XP delta
//   - AsyncStorage flag `@lingua_motivation_survey_seen_v1` is unset
//   - `learner_profile.goals` is empty (onboarding's step 3 didn't fill it)
//
// Either picking an option OR tapping Skip marks the flag so this never
// re-triggers. Skip writes nothing.
//
// Style intentionally mirrors FirstTimeSignInModal so both feel like part of
// the same family — Cinzel header, parchment body, gold accents, dark backdrop.

import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { C, F } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { updateGoals, type MotivationKey } from "@/lib/learnerProfile";

type LangKey = "korean" | "english" | "spanish" | "indonesian";

interface OptionCopy {
  key: MotivationKey;
  korean: string;
  english: string;
  spanish: string;
  indonesian: string;
}

const OPTIONS: readonly OptionCopy[] = [
  { key: "drama",      korean: "K-pop / K-drama / 콘텐츠",
                       english: "K-pop / K-drama / content",
                       spanish: "K-pop / K-drama / contenido",
                       indonesian: "K-pop / K-drama / konten" },
  { key: "travel",     korean: "여행",
                       english: "Travel",
                       spanish: "Viajes",
                       indonesian: "Jalan-jalan" },
  { key: "friendship", korean: "친구 / 연애 / 가족",
                       english: "Friends / dating / family",
                       spanish: "Amigos / pareja / familia",
                       indonesian: "Teman / pasangan / keluarga" },
  { key: "work_study", korean: "일 / 학교",
                       english: "Work / school",
                       spanish: "Trabajo / estudios",
                       indonesian: "Kerja / sekolah" },
  { key: "curious",    korean: "그냥 관심 있어요",
                       english: "Just curious",
                       spanish: "Solo curiosidad",
                       indonesian: "Sekadar penasaran" },
  { key: "other",      korean: "기타",
                       english: "Other",
                       spanish: "Otro",
                       indonesian: "Lainnya" },
] as const;

// Question template — the {lang} slot is filled with the learner's target
// language in the same script as the surrounding sentence.
const QUESTION_TEMPLATE: Record<LangKey, string> = {
  korean:  "왜 {lang}를 배우고 있나요?",
  english: "Why are you learning {lang}?",
  spanish: "¿Por qué estás aprendiendo {lang}?",
  indonesian: "Kenapa kamu belajar {lang}?",
};

const LANGUAGE_LABEL: Record<LangKey, Record<LangKey, string>> = {
  korean:  { korean: "한국어",  english: "영어",    spanish: "스페인어", indonesian: "인도네시아어" },
  english: { korean: "Korean",  english: "English", spanish: "Spanish", indonesian: "Indonesian" },
  spanish: { korean: "coreano", english: "inglés",  spanish: "español", indonesian: "indonesio" },
  indonesian: { korean: "bahasa Korea", english: "bahasa Inggris", spanish: "bahasa Spanyol", indonesian: "bahasa Indonesia" },
};

const SKIP_LABEL: Record<LangKey, string> = {
  korean:  "건너뛰기",
  english: "Skip",
  spanish: "Omitir",
  indonesian: "Lewati",
};

const HEADER_LABEL: Record<LangKey, string> = {
  korean:  "한 가지만 여쭤볼게요",
  english: "One quick question",
  spanish: "Una pregunta rápida",
  indonesian: "Satu pertanyaan singkat",
};

function fillTemplate(template: string, slot: string): string {
  return template.replace("{lang}", slot);
}

export function MotivationSurvey() {
  const {
    nativeLanguage,
    learningLanguage,
    showMotivationSurvey,
    dismissMotivationSurvey,
  } = useLanguage();
  const [busyKey, setBusyKey] = useState<MotivationKey | null>(null);

  const native: LangKey = (nativeLanguage ?? "english") as LangKey;
  const learning: LangKey = (learningLanguage ?? "english") as LangKey;

  // The question — Korean particles aside, this is just a slot fill. The
  // learning-language slot is rendered in the native-language's script so the
  // sentence reads naturally for the user, not in the target script.
  const questionText = useMemo(() => {
    const slot = LANGUAGE_LABEL[native][learning];
    return fillTemplate(QUESTION_TEMPLATE[native], slot);
  }, [native, learning]);

  const handlePick = useCallback(async (key: MotivationKey) => {
    if (busyKey) return;
    setBusyKey(key);
    try {
      // updateGoals fires Analytics.track('motivation_chosen', …) internally
      // when called with a single-element MotivationKey array.
      await updateGoals([key], { learningLang: learningLanguage });
    } catch (err) {
      // Persist failures are non-fatal — the modal still closes so we don't
      // pester the user. The seen-flag is written by dismiss() so it never
      // re-triggers either way.
      if (process.env.NODE_ENV !== "production") {
        console.warn("[MotivationSurvey] save failed:", err);
      }
    } finally {
      setBusyKey(null);
      dismissMotivationSurvey();
    }
  }, [busyKey, learningLanguage, dismissMotivationSurvey]);

  const handleSkip = useCallback(() => {
    if (busyKey) return;
    dismissMotivationSurvey();
  }, [busyKey, dismissMotivationSurvey]);

  if (!showMotivationSurvey) return null;

  return (
    <Modal
      visible={showMotivationSurvey}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Skip corner — obvious, top-right, gold-dim text so it's clearly
              an out without being shouty. No dark patterns. */}
          <Pressable
            onPress={handleSkip}
            disabled={!!busyKey}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={SKIP_LABEL[native]}
            style={({ pressed }) => [
              styles.skipCorner,
              pressed && !busyKey && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.skipCornerText}>{SKIP_LABEL[native]}</Text>
          </Pressable>

          <Text style={styles.eyebrow}>{HEADER_LABEL[native]}</Text>
          <Text style={styles.question}>{questionText}</Text>

          <View style={styles.options}>
            {OPTIONS.map((option) => {
              const label = option[native];
              const active = busyKey === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => { void handlePick(option.key); }}
                  disabled={!!busyKey}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  style={({ pressed }) => [
                    styles.option,
                    active && styles.optionActive,
                    pressed && !busyKey && styles.optionPressed,
                  ]}
                >
                  <View style={styles.radio}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text style={styles.optionLabel} numberOfLines={2}>{label}</Text>
                  {active ? <ActivityIndicator size="small" color={C.gold} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: C.bg2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.goldDim,
    paddingTop: 36,
    paddingBottom: 22,
    paddingHorizontal: 22,
    gap: 10,
  },
  skipCorner: {
    position: "absolute",
    top: 10,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  skipCornerText: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.goldDim,
    textDecorationLine: "underline",
  },
  eyebrow: {
    fontFamily: F.label,
    fontSize: 12,
    color: C.goldDim,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  question: {
    fontFamily: F.header,
    fontSize: 19,
    color: C.gold,
    lineHeight: 27,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg3,
  },
  optionPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },
  optionActive: {
    borderColor: C.gold,
    backgroundColor: C.goldFaint,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: C.goldDim,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.gold,
  },
  optionLabel: {
    flex: 1,
    fontFamily: F.body,
    fontSize: 15,
    color: C.parchment,
    lineHeight: 21,
  },
});
