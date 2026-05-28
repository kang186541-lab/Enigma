// Data Rights — actionable page for export / delete.
//
// Calls API endpoints provided by another agent. Per the task brief these
// are assumed to exist:
//   GET   /api/me/export   → returns the user's full data as JSON
//   POST  /api/me/delete   → permanently deletes the account
//
// Both endpoints expect a Supabase access-token bearer header, which we
// pull from supabase.auth.getSession() at call time.
//
// TODO (legal review):
//   - confirm 10-day response window matches PIPA Art. 35 expectations
//   - on Korean App Store / Play Store launch, this page must be discoverable
//     within two taps from the home screen (Settings → My Data is fine)
//   - the in-app delete flow is the user-facing implementation of the GDPR
//     Art. 17 "right to erasure" and PIPA Art. 36 "destruction" right
//
// Contact placeholder: privacy@linguaai.example  ← REPLACE before launch.

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/query-client";

type LangKey = "ko" | "en" | "es";

// ───────────────────────────────────────────────────────────────────────────
// Localized copy
// ───────────────────────────────────────────────────────────────────────────
const T: Record<string, Record<LangKey, string>> = {
  title:           { ko: "내 데이터",                                   en: "My Data",                                       es: "Mis datos" },
  back:            { ko: "뒤로",                                         en: "Back",                                          es: "Volver" },
  langKo:          { ko: "한국어",                                       en: "Korean",                                        es: "Coreano" },
  langEn:          { ko: "English",                                      en: "English",                                       es: "Inglés" },
  langEs:          { ko: "Español",                                      en: "Spanish",                                       es: "Español" },

  signInRequired_h:{ ko: "로그인이 필요합니다",                           en: "Sign-in required",                              es: "Debes iniciar sesión" },
  signInRequired_b:{
    ko: "데이터 권리를 행사하려면 먼저 로그인해 주세요. 설정 페이지에서 Google 또는 매직 링크로 로그인할 수 있어요.",
    en: "To exercise your data rights, please sign in first. You can sign in with Google or a magic-link from the Settings page.",
    es: "Para ejercer tus derechos sobre los datos, inicia sesión primero. Puedes hacerlo con Google o un enlace mágico desde Ajustes.",
  },
  goToSettings:    { ko: "설정으로 이동",                                en: "Go to settings",                                es: "Ir a Ajustes" },

  intro_h:         { ko: "데이터 권리 안내",                             en: "Your data rights",                              es: "Tus derechos sobre los datos" },
  intro_b:         {
    ko: "한국 「개인정보 보호법」, EU GDPR에 따라 본인의 개인정보를 열람·이동·삭제할 수 있습니다. 아래 버튼으로 즉시 행사할 수 있어요.",
    en: "Under the Korean Personal Information Protection Act and the EU GDPR you can access, port, and erase your personal data. Use the buttons below to do it right now.",
    es: "Conforme a la Ley Coreana de Protección de Información Personal y al RGPD de la UE, puedes acceder, portar y eliminar tus datos personales. Usa los botones de abajo para hacerlo ahora.",
  },

  account_h:       { ko: "계정",                                         en: "Account",                                       es: "Cuenta" },
  signedInAs:      { ko: "로그인 계정",                                  en: "Signed in as",                                  es: "Sesión iniciada como" },
  lastSync:        { ko: "마지막 서버 동기화",                           en: "Last server sync",                              es: "Última sincronización" },
  syncNever:       { ko: "아직 동기화된 적 없음",                        en: "Never synced",                                  es: "Nunca sincronizado" },
  syncPending:     { ko: "동기화 대기 중...",                            en: "Sync pending...",                               es: "Sincronización pendiente..." },
  syncSyncing:     { ko: "동기화 중...",                                  en: "Syncing...",                                    es: "Sincronizando..." },
  syncError:       { ko: "동기화 오류",                                  en: "Sync error",                                    es: "Error de sincronización" },

  export_h:        { ko: "내 데이터 내려받기",                           en: "Download my data",                              es: "Descargar mis datos" },
  export_b: {
    ko: "이메일, 학습 진도(XP, 레벨, 연속 학습일, 학습 단어), 도전 과제, 알림 설정 등 회사 서버에 저장된 본인의 모든 정보를 JSON 파일로 받습니다. (Azure Speech와 OpenAI는 데이터를 보관하지 않아 음성·대화 내용은 포함되지 않습니다.)",
    en: "You'll receive a JSON file containing your email, learning progress (XP, level, streak, words learned), achievements, notification settings, and all other data we hold on our servers. (We do not store voice or conversation content — Azure Speech and OpenAI discard it after processing.)",
    es: "Recibirás un archivo JSON con tu correo, progreso de aprendizaje (XP, nivel, racha, palabras aprendidas), logros, ajustes de notificaciones y todos los demás datos que conservamos en nuestros servidores. (No guardamos voz ni conversaciones — Azure Speech y OpenAI los descartan tras el procesamiento.)",
  },
  exportBtn:       { ko: "JSON 파일 받기",                              en: "Download JSON",                                 es: "Descargar JSON" },
  exporting:       { ko: "준비 중...",                                  en: "Preparing...",                                  es: "Preparando..." },
  exportSuccess:   { ko: "내려받기 완료",                                en: "Download started",                              es: "Descarga iniciada" },
  exportSuccessNative: {
    ko: "데이터 사본이 콘솔에 출력되었으며, 곧 공유 시트로 보내드립니다.",
    en: "A copy was logged to the console; we'll open a share sheet shortly.",
    es: "Se imprimió una copia en la consola; abriremos la hoja de compartir.",
  },
  exportError:     { ko: "내려받기 실패. 잠시 후 다시 시도해 주세요.",     en: "Download failed. Please try again in a moment.",  es: "Falló la descarga. Inténtalo de nuevo en unos minutos." },

  delete_h:        { ko: "계정 영구 삭제",                              en: "Delete my account",                             es: "Eliminar mi cuenta" },
  delete_b: {
    ko: "계정과 모든 학습 진도, 알림 토큰, 도전 과제가 영구 삭제됩니다. 백업본은 최대 30일 이내 폐기됩니다. 이 작업은 되돌릴 수 없습니다.",
    en: "Your account and all learning progress, push tokens, and achievements will be permanently deleted. Backups will be purged within 30 days. This cannot be undone.",
    es: "Tu cuenta y todo el progreso, tokens push y logros se eliminarán de forma permanente. Las copias de seguridad se purgarán en 30 días. Esta acción es irreversible.",
  },
  deleteBtn:       { ko: "계정 삭제",                                    en: "Delete account",                                es: "Eliminar cuenta" },

  // Step-1 modal
  deleteStep1_h:   { ko: "정말로 삭제하시겠어요?",                       en: "Are you sure?",                                 es: "¿Seguro que quieres eliminarla?" },
  deleteStep1_b: {
    ko: "삭제하면 모든 학습 데이터(XP, 레벨, 연속 학습일, 도전 과제, 단어장, 스토리 진행 등)가 사라집니다. 30일 이내에 백업본도 폐기되어 복구할 수 없습니다.\n\n계속하시려면 \"계속\"을 눌러주세요.",
    en: "If you continue, all learning data (XP, level, streak, achievements, vocabulary, story progress, etc.) will be lost. Backups are purged within 30 days; no recovery is possible after that.\n\nPress \"Continue\" to go to the final confirmation.",
    es: "Si continúas, todos los datos de aprendizaje (XP, nivel, racha, logros, vocabulario, progreso de historia, etc.) se perderán. Las copias se purgan en 30 días; no habrá recuperación posible.\n\nPresiona \"Continuar\" para la confirmación final.",
  },
  cancel:          { ko: "취소",                                         en: "Cancel",                                        es: "Cancelar" },
  continueBtn:     { ko: "계속",                                         en: "Continue",                                      es: "Continuar" },

  // Step-2 modal (type-to-confirm)
  deleteStep2_h:   { ko: "최종 확인",                                    en: "Final confirmation",                            es: "Confirmación final" },
  deleteStep2_b:   {
    ko: "삭제를 진행하려면 아래 칸에 본인의 이메일 주소를 그대로 입력한 뒤 \"영구 삭제\" 버튼을 누르세요.",
    en: "To proceed, type your email address exactly into the box below and then press \"Delete permanently\".",
    es: "Para continuar, escribe tu dirección de correo exactamente en el cuadro y presiona \"Eliminar permanentemente\".",
  },
  emailPlaceholder:{ ko: "이메일 주소 입력",                             en: "Type your email",                               es: "Escribe tu correo" },
  deleteConfirm:   { ko: "영구 삭제",                                    en: "Delete permanently",                            es: "Eliminar permanentemente" },
  deletingNow:     { ko: "삭제 중...",                                   en: "Deleting...",                                   es: "Eliminando..." },
  emailMismatch:   { ko: "이메일이 일치하지 않아요.",                    en: "That doesn't match your email.",                es: "El correo no coincide." },
  deleteError:     { ko: "삭제 요청에 실패했어요. 잠시 후 다시 시도해 주세요.", en: "Delete request failed. Please try again shortly.", es: "Falló la solicitud de eliminación. Inténtalo más tarde." },
  deletedDone_h:   { ko: "계정이 삭제되었습니다",                        en: "Your account has been deleted",                 es: "Tu cuenta ha sido eliminada" },
  deletedDone_b:   {
    ko: "그동안 LinguaAI를 이용해 주셔서 감사합니다. 잠시 후 시작 화면으로 이동합니다.",
    en: "Thank you for using LinguaAI. We'll return you to the start screen in a moment.",
    es: "Gracias por usar LinguaAI. Te llevaremos a la pantalla inicial en unos segundos.",
  },

  questions_h:     { ko: "추가 문의",                                    en: "Other questions",                               es: "Otras consultas" },
  questions_b: {
    ko: "정정 요청, 처리 정지 요청, 제3자 제공 내역 열람 등 다른 권리 행사가 필요하신 경우 privacy@linguaai.example 로 연락 주세요. 한국법 기준 10일, GDPR 기준 1개월 이내에 회신드립니다.",
    en: "For other requests — rectification, restriction of processing, or details of transfers to third parties — write to privacy@linguaai.example. We respond within 10 days under Korean law and within one month under GDPR.",
    es: "Para otras solicitudes — rectificación, limitación del tratamiento o detalles sobre las transferencias a terceros — escribe a privacy@linguaai.example. Responderemos en 10 días bajo la ley coreana y en un mes bajo el RGPD.",
  },
  privacyLink:     { ko: "개인정보처리방침 보기",                        en: "View Privacy Policy",                           es: "Ver Política de Privacidad" },
  termsLink:       { ko: "이용약관 보기",                                en: "View Terms of Service",                         es: "Ver Términos de Servicio" },
};

function t(obj: Record<LangKey, string>, lang: LangKey): string {
  return obj[lang] ?? obj.en;
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────
function formatTimestamp(iso: string | null, lc: LangKey): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const localeMap: Record<LangKey, string> = {
      ko: "ko-KR",
      en: "en-US",
      es: "es-ES",
    };
    return d.toLocaleString(localeMap[lc], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// On web: trigger a browser download by hitting the export endpoint directly
// — the server streams a JSON file with a proper filename.
// On native: writes the payload to a downloads cache file and invokes the
// system share sheet via expo-sharing so the user can save / send the file
// without it ever passing through console / logs (privacy: the export
// contains email + progress and must never land in a log buffer).
async function downloadExport(): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error("not-signed-in");

  if (Platform.OS === "web") {
    const res = await apiRequest("GET", "/api/me/export");
    const blob = await res.blob();
     
    const w: any = globalThis as any;
    const url = w.URL?.createObjectURL?.(blob);
    if (!url || !w.document) throw new Error("download-unsupported");
    const a = w.document.createElement("a");
    a.href = url;
    a.download = `linguaai-data-${new Date().toISOString().slice(0, 10)}.json`;
    w.document.body.appendChild(a);
    a.click();
    a.remove();
    w.URL.revokeObjectURL?.(url);
    return;
  }

  // Native — fetch the JSON, then write it to a cache file and open the
  // share sheet. We never log the payload (it contains PII).
  const res = await fetch(
    `${(await import("@/lib/query-client")).getApiUrl()}/api/me/export`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${text}`);
  }
  const payload = await res.text();
  try {
    // Use the new expo-file-system Paths/File API (SDK 54+). We write the
    // export payload to the app's cache directory and surface it through
    // the share sheet so the user can save / send the file without it
    // ever passing through console (PII protection).
    const fsModule = (await import("expo-file-system")) as unknown as {
      Paths?: { cache?: { uri: string } };
      File?: new (uri: string) => { write: (data: string) => Promise<void> | void };
    };
    const Sharing = (await import("expo-sharing")) as unknown as {
      isAvailableAsync: () => Promise<boolean>;
      shareAsync: (uri: string, opts?: { mimeType?: string; dialogTitle?: string }) => Promise<void>;
    };
    const filename = `linguaai-data-${new Date().toISOString().slice(0, 10)}.json`;
    const cacheUri = fsModule.Paths?.cache?.uri ?? "";
    const fileUri = cacheUri.endsWith("/") ? `${cacheUri}${filename}` : `${cacheUri}/${filename}`;
    if (fsModule.File) {
      const file = new fsModule.File(fileUri);
      await file.write(payload);
    }
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, { mimeType: "application/json", dialogTitle: "Save your LinguaAI data" });
    }
    // If sharing isn't available the file is still in cacheDirectory; the
    // UI confirms success — better than leaking through console.
  } catch (e) {
    // Don't fall back to logging — PII must not enter the log buffer.
    throw new Error(`save-failed: ${(e as Error)?.message ?? e}`);
  }
}

async function callDelete(): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error("not-signed-in");
  const baseUrl = (await import("@/lib/query-client")).getApiUrl();
  const res = await fetch(`${baseUrl}/api/me/delete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ confirm: true }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${text}`);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────────────────────
export default function DataRightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nativeLanguage: nativeLang, syncStatus } = useLanguage();
  const { user, signOut } = useAuth();

  const defaultLc: LangKey =
    nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";
  const [lc, setLc] = useState<LangKey>(defaultLc);

  const [exportBusy, setExportBusy] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportErr, setExportErr] = useState<string | null>(null);

  // Two-step delete flow
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0 closed, 1 warn, 2 confirm, 3 done
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const userEmail = user?.email ?? "";

  const emailMatches = useMemo(
    () => userEmail.length > 0 && confirmEmail.trim().toLowerCase() === userEmail.trim().toLowerCase(),
    [confirmEmail, userEmail],
  );

  // Auto-dismiss the export success banner after a few seconds.
  useEffect(() => {
    if (!exportMsg) return;
    const id = setTimeout(() => setExportMsg(null), 4000);
    return () => clearTimeout(id);
  }, [exportMsg]);

  const handleExport = async () => {
    setExportBusy(true);
    setExportErr(null);
    setExportMsg(null);
    try {
      await downloadExport();
      setExportMsg(t(Platform.OS === "web" ? T.exportSuccess : T.exportSuccessNative, lc));
    } catch (e) {
      console.warn("[data-rights] export failed:", e);
      setExportErr(t(T.exportError, lc));
    } finally {
      setExportBusy(false);
    }
  };

  const openDelete = () => {
    setDeleteErr(null);
    setConfirmEmail("");
    setStep(1);
  };

  const closeDelete = () => {
    if (deleteBusy) return;
    setStep(0);
    setConfirmEmail("");
    setDeleteErr(null);
  };

  const handleDeleteConfirm = async () => {
    if (!emailMatches) {
      setDeleteErr(t(T.emailMismatch, lc));
      return;
    }
    setDeleteBusy(true);
    setDeleteErr(null);
    try {
      await callDelete();
      // Server has wiped the row; clear local state and route home.
      // signOut() handles supabase.auth.signOut + local clear. Wrap so the
      // FLUSH_FAILED case doesn't block the delete UI.
      try {
        await signOut();
      } catch {
        /* ignore — account row is already gone */
      }
      setStep(3);
      setTimeout(() => {
        router.replace("/" as never);
      }, 1500);
    } catch (e) {
      console.warn("[data-rights] delete failed:", e);
      setDeleteErr(t(T.deleteError, lc));
    } finally {
      setDeleteBusy(false);
    }
  };

  const lastSyncLabel = (() => {
    switch (syncStatus.status) {
      case "syncing":
        return t(T.syncSyncing, lc);
      case "pending":
        return t(T.syncPending, lc);
      case "error":
        return `${t(T.syncError, lc)}${syncStatus.lastError ? ": " + syncStatus.lastError : ""}`;
      default:
        return syncStatus.lastSyncedAt
          ? formatTimestamp(syncStatus.lastSyncedAt, lc)
          : t(T.syncNever, lc);
    }
  })();

  // ── If signed-out, show a friendlier prompt
  if (!user) {
    return (
      <LinearGradient colors={[C.bg1, C.bg2]} style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={C.gold} />
            <Text style={styles.backText}>{t(T.back, lc)}</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {t(T.title, lc)}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <LangSwitcher lc={lc} setLc={setLc} />

        <View style={styles.contentCentered}>
          <Ionicons name="lock-closed-outline" size={48} color={C.goldDim} style={{ marginBottom: 12 }} />
          <Text style={styles.h}>{t(T.signInRequired_h, lc)}</Text>
          <Text style={[styles.p, { textAlign: "center", marginTop: 6 }]}>{t(T.signInRequired_b, lc)}</Text>
          <Pressable
            onPress={() => router.push("/settings" as never)}
            style={[styles.primaryBtn, { marginTop: 18 }]}
          >
            <Ionicons name="settings-outline" size={18} color={C.bg1} />
            <Text style={styles.primaryBtnText}>{t(T.goToSettings, lc)}</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[C.bg1, C.bg2]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.gold} />
          <Text style={styles.backText}>{t(T.back, lc)}</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {t(T.title, lc)}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <LangSwitcher lc={lc} setLc={setLc} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Intro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(T.intro_h, lc)}</Text>
          <Text style={styles.p}>{t(T.intro_b, lc)}</Text>
        </View>

        {/* Account / last sync */}
        <Text style={styles.sectionTitleSmall}>{t(T.account_h, lc)}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{t(T.signedInAs, lc)}</Text>
            <Text style={styles.value} numberOfLines={1}>
              {userEmail || user.id}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t(T.lastSync, lc)}</Text>
            <Text style={styles.value} numberOfLines={1}>
              {lastSyncLabel}
            </Text>
          </View>
        </View>

        {/* Export */}
        <Text style={styles.sectionTitleSmall}>{t(T.export_h, lc)}</Text>
        <View style={styles.card}>
          <Text style={styles.p}>{t(T.export_b, lc)}</Text>
          <Pressable
            onPress={handleExport}
            disabled={exportBusy}
            style={[styles.primaryBtn, { opacity: exportBusy ? 0.6 : 1, marginTop: 6 }]}
          >
            {exportBusy ? (
              <ActivityIndicator color={C.bg1} />
            ) : (
              <Ionicons name="cloud-download-outline" size={18} color={C.bg1} />
            )}
            <Text style={styles.primaryBtnText}>
              {exportBusy ? t(T.exporting, lc) : t(T.exportBtn, lc)}
            </Text>
          </Pressable>
          {exportMsg ? <Text style={styles.successText}>{exportMsg}</Text> : null}
          {exportErr ? <Text style={styles.errorText}>{exportErr}</Text> : null}
        </View>

        {/* Delete */}
        <Text style={[styles.sectionTitleSmall, { color: "#F2697D" }]}>{t(T.delete_h, lc)}</Text>
        <View style={[styles.card, styles.cardDanger]}>
          <Text style={styles.p}>{t(T.delete_b, lc)}</Text>
          <Pressable
            onPress={openDelete}
            disabled={deleteBusy}
            style={[styles.dangerBtn, { opacity: deleteBusy ? 0.6 : 1, marginTop: 6 }]}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.dangerBtnText}>{t(T.deleteBtn, lc)}</Text>
          </Pressable>
        </View>

        {/* Other rights */}
        <Text style={styles.sectionTitleSmall}>{t(T.questions_h, lc)}</Text>
        <View style={styles.card}>
          <Text style={styles.p}>{t(T.questions_b, lc)}</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <Pressable
              onPress={() => router.push("/legal/privacy" as never)}
              style={styles.ghostBtn}
            >
              <Ionicons name="shield-checkmark-outline" size={16} color={C.gold} />
              <Text style={styles.ghostBtnText}>{t(T.privacyLink, lc)}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/legal/terms" as never)}
              style={styles.ghostBtn}
            >
              <Ionicons name="document-text-outline" size={16} color={C.gold} />
              <Text style={styles.ghostBtnText}>{t(T.termsLink, lc)}</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ─────── Step 1 modal: warn ─────── */}
      <Modal visible={step === 1} transparent animationType="fade" onRequestClose={closeDelete}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t(T.deleteStep1_h, lc)}</Text>
            <Text style={styles.modalBody}>{t(T.deleteStep1_b, lc)}</Text>
            <View style={styles.modalActions}>
              <Pressable onPress={closeDelete} style={styles.ghostBtn}>
                <Text style={styles.ghostBtnText}>{t(T.cancel, lc)}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setStep(2);
                  setDeleteErr(null);
                }}
                style={styles.dangerBtn}
              >
                <Text style={styles.dangerBtnText}>{t(T.continueBtn, lc)}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─────── Step 2 modal: confirm by typing email ─────── */}
      <Modal visible={step === 2} transparent animationType="fade" onRequestClose={closeDelete}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t(T.deleteStep2_h, lc)}</Text>
            <Text style={styles.modalBody}>{t(T.deleteStep2_b, lc)}</Text>
            <Text style={[styles.value, { marginTop: 6, fontStyle: "italic" }]}>{userEmail}</Text>
            <TextInput
              value={confirmEmail}
              onChangeText={(v) => {
                setConfirmEmail(v);
                if (deleteErr) setDeleteErr(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder={t(T.emailPlaceholder, lc)}
              placeholderTextColor={C.goldDim}
              editable={!deleteBusy}
              style={styles.input}
            />
            {deleteErr ? <Text style={styles.errorText}>{deleteErr}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable
                onPress={closeDelete}
                disabled={deleteBusy}
                style={[styles.ghostBtn, { opacity: deleteBusy ? 0.5 : 1 }]}
              >
                <Text style={styles.ghostBtnText}>{t(T.cancel, lc)}</Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteConfirm}
                disabled={deleteBusy || !emailMatches}
                style={[
                  styles.dangerBtn,
                  { opacity: deleteBusy || !emailMatches ? 0.4 : 1 },
                ]}
              >
                {deleteBusy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Ionicons name="warning-outline" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.dangerBtnText}>
                  {deleteBusy ? t(T.deletingNow, lc) : t(T.deleteConfirm, lc)}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─────── Step 3 modal: done ─────── */}
      <Modal visible={step === 3} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={36}
              color={C.gold}
              style={{ alignSelf: "center", marginBottom: 8 }}
            />
            <Text style={[styles.modalTitle, { textAlign: "center" }]}>{t(T.deletedDone_h, lc)}</Text>
            <Text style={[styles.modalBody, { textAlign: "center" }]}>{t(T.deletedDone_b, lc)}</Text>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Local subcomponents
// ───────────────────────────────────────────────────────────────────────────
function LangSwitcher({ lc, setLc }: { lc: LangKey; setLc: (l: LangKey) => void }) {
  return (
    <View style={styles.langBar}>
      {(["ko", "en", "es"] as const).map((k) => {
        const labelKey = k === "ko" ? "langKo" : k === "en" ? "langEn" : "langEs";
        return (
          <Pressable
            key={k}
            onPress={() => setLc(k)}
            style={[styles.langPill, k === lc && styles.langPillActive]}
          >
            <Text style={[styles.langPillText, k === lc && styles.langPillTextActive]}>
              {t(T[labelKey], lc)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Styles
// ───────────────────────────────────────────────────────────────────────────
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
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  backText: {
    fontFamily: F.body,
    fontSize: 15,
    color: C.gold,
  },
  title: {
    fontFamily: F.header,
    fontSize: 18,
    color: C.gold,
    letterSpacing: 1,
    flex: 1,
    textAlign: "center",
  },
  langBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: C.bg2,
    borderWidth: 1,
    borderColor: C.border,
  },
  langPillActive: {
    backgroundColor: C.gold,
    borderColor: C.gold,
  },
  langPillText: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.goldDim,
  },
  langPillTextActive: {
    color: C.bg1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  contentCentered: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontFamily: F.header,
    fontSize: 16,
    color: C.gold,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionTitleSmall: {
    fontFamily: F.header,
    fontSize: 13,
    color: C.goldDim,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 18,
  },
  card: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 12,
  },
  cardDanger: {
    borderColor: "#F2697D55",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.goldDim,
  },
  value: {
    fontFamily: F.bodySemi,
    fontSize: 14,
    color: C.parchment,
    flexShrink: 1,
    textAlign: "right",
  },
  h: {
    fontFamily: F.header,
    fontSize: 18,
    color: C.gold,
    letterSpacing: 0.5,
  },
  p: {
    fontFamily: F.body,
    fontSize: 14.5,
    lineHeight: 22,
    color: C.parchment,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.gold,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.goldDim,
    alignSelf: "stretch",
  },
  primaryBtnText: {
    fontFamily: F.header,
    fontSize: 15,
    fontWeight: "600",
    color: C.bg1,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#B8364D",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7A1F2F",
  },
  dangerBtnText: {
    fontFamily: F.header,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.bg2,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  ghostBtnText: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.gold,
  },
  successText: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.gold,
    fontStyle: "italic",
  },
  errorText: {
    fontFamily: F.body,
    fontSize: 13,
    color: "#F2697D",
    fontStyle: "italic",
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: C.bg2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 10,
  },
  modalTitle: {
    fontFamily: F.header,
    fontSize: 17,
    color: C.gold,
    letterSpacing: 0.5,
  },
  modalBody: {
    fontFamily: F.body,
    fontSize: 14.5,
    lineHeight: 22,
    color: C.parchment,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  input: {
    fontFamily: F.body,
    fontSize: 15,
    color: C.parchment,
    backgroundColor: C.bg3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.goldDim,
    marginTop: 6,
  },
});
