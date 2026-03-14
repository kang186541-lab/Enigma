import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Pressable, Modal, Animated, ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { C, F } from "@/constants/theme";
import { useLanguage, NativeLanguage } from "@/context/LanguageContext";

// ── Language metadata ──────────────────────────────────────────────────────────

const LANG_META: Record<NativeLanguage, { flag: string; ko: string; en: string; es: string }> = {
  korean:  { flag: "🇰🇷", ko: "한국어",    en: "Korean",  es: "Coreano" },
  english: { flag: "🇬🇧", ko: "영어",      en: "English", es: "Inglés"  },
  spanish: { flag: "🇪🇸", ko: "스페인어",  en: "Español", es: "Español" },
};

const ALL_LANGS: NativeLanguage[] = ["korean", "english", "spanish"];

function getLangName(lang: NativeLanguage, nativeLang: NativeLanguage): string {
  const m = LANG_META[lang];
  if (nativeLang === "korean")  return m.ko;
  if (nativeLang === "spanish") return m.es;
  return m.en;
}

function getLabel(key: string, nativeLang: NativeLanguage): string {
  const labels: Record<string, Record<NativeLanguage, string>> = {
    title:        { korean: "🌍 학습 설정 변경",              english: "🌍 Change Language Settings",    spanish: "🌍 Cambiar configuración de idioma" },
    nativeSec:    { korean: "모국어:",                        english: "Native language:",               spanish: "Idioma nativo:" },
    learnSec:     { korean: "학습 언어:",                     english: "Learning language:",             spanish: "Idioma de aprendizaje:" },
    warning:      { korean: "⚠️ 언어를 변경하면 퀴즈 내용이 새 언어로 바뀝니다. XP·레벨·진행률은 유지됩니다.", english: "⚠️ Changing languages will update quiz content to the new language. XP, levels, and progress are kept.", spanish: "⚠️ Cambiar idiomas actualizará el contenido del cuestionario. El XP, niveles y progreso se mantienen." },
    conflict:     { korean: "모국어와 학습 언어는 달라야 해요 🙅", english: "Native and learning languages must be different 🙅", spanish: "Los idiomas nativo y de aprendizaje deben ser diferentes 🙅" },
    cancel:       { korean: "취소",                           english: "Cancel",                        spanish: "Cancelar" },
    confirm:      { korean: "변경하기",                       english: "Change Language",               spanish: "Cambiar idioma" },
  };
  return labels[key]?.[nativeLang] ?? labels[key]?.english ?? key;
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LanguageChangeModal({ visible, onClose }: Props) {
  const { nativeLanguage, learningLanguage, setNativeLanguage, setLearningLanguage } = useLanguage();

  const [selNative,  setSelNative]  = useState<NativeLanguage>(nativeLanguage ?? "korean");
  const [selLearn,   setSelLearn]   = useState<NativeLanguage>(learningLanguage ?? "english");
  const [conflict,   setConflict]   = useState(false);
  const [saving,     setSaving]     = useState(false);

  const slideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  // Reset selection when modal opens
  useEffect(() => {
    if (visible) {
      setSelNative(nativeLanguage ?? "korean");
      setSelLearn(learningLanguage ?? "english");
      setConflict(false);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0,   duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1,   duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(500);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  function handleClose() {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 500, duration: 220, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 0,   duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  }

  function pickNative(lang: NativeLanguage) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelNative(lang);
    setConflict(lang === selLearn);
    // Auto-fix learning language if conflict
    if (lang === selLearn) {
      const fallback = ALL_LANGS.find((l) => l !== lang) ?? "english";
      setSelLearn(fallback);
      setConflict(false);
    }
  }

  function pickLearn(lang: NativeLanguage) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (lang === selNative) { setConflict(true); return; }
    setConflict(false);
    setSelLearn(lang);
  }

  async function handleConfirm() {
    if (selNative === selLearn) { setConflict(true); return; }
    setSaving(true);
    await setNativeLanguage(selNative);
    await setLearningLanguage(selLearn);
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleClose();
  }

  const nativeLang = nativeLanguage ?? "english";

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      {/* Backdrop */}
      <Animated.View style={[s.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle bar */}
        <View style={s.handle} />

        <Text style={s.title}>{getLabel("title", nativeLang)}</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          {/* Native language */}
          <Text style={s.sectionLabel}>{getLabel("nativeSec", nativeLang)}</Text>
          {ALL_LANGS.map((lang) => (
            <Pressable
              key={lang}
              style={({ pressed }) => [s.langCard, selNative === lang && s.langCardSelected, pressed && { opacity: 0.85 }]}
              onPress={() => pickNative(lang)}
            >
              <Text style={s.langFlag}>{LANG_META[lang].flag}</Text>
              <Text style={[s.langName, selNative === lang && s.langNameSelected]}>
                {getLangName(lang, nativeLang)}
              </Text>
              {selNative === lang && <Text style={s.checkmark}>✓</Text>}
            </Pressable>
          ))}

          {/* Learning language */}
          <Text style={[s.sectionLabel, { marginTop: 18 }]}>{getLabel("learnSec", nativeLang)}</Text>
          {ALL_LANGS.filter((l) => l !== selNative).map((lang) => (
            <Pressable
              key={lang}
              style={({ pressed }) => [s.langCard, selLearn === lang && s.langCardSelected, pressed && { opacity: 0.85 }]}
              onPress={() => pickLearn(lang)}
            >
              <Text style={s.langFlag}>{LANG_META[lang].flag}</Text>
              <Text style={[s.langName, selLearn === lang && s.langNameSelected]}>
                {getLangName(lang, nativeLang)}
              </Text>
              {selLearn === lang && <Text style={s.checkmark}>✓</Text>}
            </Pressable>
          ))}

          {/* Conflict warning */}
          {conflict && (
            <Text style={s.conflictText}>{getLabel("conflict", nativeLang)}</Text>
          )}

          {/* Info text */}
          <Text style={s.warning}>{getLabel("warning", nativeLang)}</Text>
        </ScrollView>

        {/* Buttons */}
        <View style={s.btnRow}>
          <Pressable style={({ pressed }) => [s.cancelBtn, pressed && { opacity: 0.75 }]} onPress={handleClose}>
            <Text style={s.cancelText}>{getLabel("cancel", nativeLang)}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.confirmBtn, (saving || conflict) && { opacity: 0.6 }, pressed && { opacity: 0.85 }]}
            onPress={handleConfirm}
            disabled={saving || conflict}
          >
            <Text style={s.confirmText}>{getLabel("confirm", nativeLang)}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  sheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: C.bg1,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1.5, borderColor: C.gold,
    paddingHorizontal: 24, paddingTop: 14, paddingBottom: 36,
    maxHeight: "85%",
  },
  handle: {
    width: 44, height: 4, borderRadius: 2,
    backgroundColor: C.goldDim, alignSelf: "center", marginBottom: 18,
  },
  title: {
    fontSize: 18, fontFamily: F.header, color: C.gold,
    textAlign: "center", marginBottom: 20, letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 13, fontFamily: F.label, color: C.goldDim,
    marginBottom: 8, letterSpacing: 0.3,
  },
  langCard: {
    flexDirection: "row", alignItems: "center",
    padding: 14, borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.bg2,
  },
  langCardSelected: {
    borderColor: C.gold, backgroundColor: "rgba(201,162,39,0.12)",
  },
  langFlag: { fontSize: 22, marginRight: 12 },
  langName: { flex: 1, fontSize: 15, fontFamily: F.body, color: C.parchment },
  langNameSelected: { color: C.gold, fontFamily: F.bodySemi },
  checkmark: { fontSize: 16, color: C.gold, fontFamily: F.header },
  conflictText: {
    fontSize: 13, fontFamily: F.label, color: "#e05252",
    textAlign: "center", marginTop: 4, marginBottom: 8,
  },
  warning: {
    fontSize: 12, fontFamily: F.body, color: C.textMuted,
    marginTop: 14, lineHeight: 18,
  },
  btnRow: {
    flexDirection: "row", gap: 12, marginTop: 18,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center",
    borderWidth: 1, borderColor: C.border,
  },
  cancelText: { fontSize: 14, fontFamily: F.header, color: C.goldDim },
  confirmBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: "center",
    backgroundColor: C.gold,
  },
  confirmText: { fontSize: 14, fontFamily: F.header, color: C.bg1 },
});
