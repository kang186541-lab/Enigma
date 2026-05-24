import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { apiRequest } from "@/lib/query-client";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LangKey = "ko" | "en" | "es";
type TriString = { ko: string; en: string; es: string };

function t(obj: TriString, lang: LangKey): string {
  return obj[lang] || obj.en;
}

const T = {
  title:        { ko: "도움말",          en: "Help",                 es: "Ayuda" },
  back:         { ko: "뒤로",            en: "Back",                 es: "Volver" },
  faqSection:   { ko: "자주 묻는 질문",   en: "Frequently Asked Questions", es: "Preguntas frecuentes" },
  contactSection:{ ko: "문의하기",        en: "Contact Us",           es: "Contáctanos" },
  // Contact form
  nameLabel:    { ko: "이름",            en: "Name",                 es: "Nombre" },
  namePlaceholder:{ ko: "홍길동",         en: "Your name",            es: "Tu nombre" },
  emailLabel:   { ko: "이메일",          en: "Email",                es: "Correo" },
  emailPlaceholder:{ ko: "you@example.com", en: "you@example.com",   es: "tu@ejemplo.com" },
  messageLabel: { ko: "메시지",          en: "Message",              es: "Mensaje" },
  messagePlaceholder:{ ko: "어떻게 도와드릴까요?", en: "How can we help?", es: "¿Cómo podemos ayudarte?" },
  submit:       { ko: "보내기",          en: "Send",                 es: "Enviar" },
  sending:      { ko: "보내는 중…",      en: "Sending…",             es: "Enviando…" },
  successMsg:   { ko: "메시지를 받았어요. 곧 답장 드릴게요.", en: "We got your message. We'll reply soon.", es: "Recibimos tu mensaje. Te responderemos pronto." },
  errMissingName:{ ko: "이름을 입력해 주세요.", en: "Please enter your name.", es: "Por favor, ingresa tu nombre." },
  errMissingEmail:{ ko: "이메일을 입력해 주세요.", en: "Please enter your email.", es: "Por favor, ingresa tu correo." },
  errBadEmail:  { ko: "올바른 이메일 형식이 아니에요.", en: "That doesn't look like a valid email.", es: "El correo no parece válido." },
  errMissingMessage:{ ko: "메시지를 입력해 주세요.", en: "Please write a message.", es: "Por favor, escribe un mensaje." },
  errSendFailed:{ ko: "전송에 실패했어요. 다시 시도해 주세요.", en: "Sending failed. Please try again.", es: "No se pudo enviar. Inténtalo de nuevo." },
} as const;

interface FaqItem {
  q: TriString;
  a: TriString;
}

const FAQS: FaqItem[] = [
  {
    q: {
      ko: "발음 점수는 어떻게 계산되나요?",
      en: "How does pronunciation scoring work?",
      es: "¿Cómo funciona la puntuación de pronunciación?",
    },
    a: {
      ko: "Azure Speech Service가 음소 단위로 정확도, 유창성, 완성도를 측정하고, GPT-4o-mini가 그 점수를 학습 맥락에 맞게 풀어서 피드백 문장으로 만들어 줍니다. 마이크가 활성화된 상태에서만 동작해요.",
      en: "Azure Speech Service evaluates accuracy, fluency, and completeness phoneme-by-phoneme, and GPT-4o-mini turns the raw scores into a sentence of feedback tailored to what you were trying to say. It only runs while the mic is active.",
      es: "Azure Speech Service evalúa la precisión, fluidez e integridad fonema por fonema, y GPT-4o-mini convierte los puntajes en una frase de comentario adaptada a lo que intentabas decir. Solo funciona con el micrófono activado.",
    },
  },
  {
    q: {
      ko: "내 학습 데이터가 기기 간에 저장되나요?",
      en: "Is my data saved across devices?",
      es: "¿Mis datos se guardan entre dispositivos?",
    },
    a: {
      ko: "로그인하시면 XP, 스트릭, 학습 기록이 안전하게 서버에 동기화돼서 다른 기기에서도 이어서 사용할 수 있어요. 로그아웃 상태로 사용하면 데이터는 해당 기기에만 저장됩니다.",
      en: "If you sign in, your XP, streak, and lesson history sync to our server so you can pick up where you left off on another device. Without sign-in, your data only lives on this device.",
      es: "Si inicias sesión, tu XP, racha e historial de lecciones se sincronizan con nuestro servidor para continuar en otro dispositivo. Sin iniciar sesión, los datos solo quedan en este dispositivo.",
    },
  },
  {
    q: {
      ko: "로그인/로그아웃은 어떻게 하나요?",
      en: "How do I sign in / out?",
      es: "¿Cómo inicio o cierro sesión?",
    },
    a: {
      ko: "설정 > 계정에서 Google 계정으로 로그인하거나 이메일로 매직 링크를 받을 수 있어요. 같은 화면에서 '로그아웃' 버튼을 누르면 세션이 종료됩니다.",
      en: "Open Settings > Account. From there you can sign in with Google or request an email magic link. The same panel has a 'Sign out' button when you're signed in.",
      es: "Ve a Ajustes > Cuenta. Allí puedes iniciar sesión con Google o pedir un enlace mágico por correo. Desde el mismo panel puedes cerrar sesión cuando estés conectado.",
    },
  },
  {
    q: {
      ko: "진행 상황이 사라졌어요.",
      en: "I lost my progress.",
      es: "Perdí mi progreso.",
    },
    a: {
      ko: "가장 흔한 원인은 로그아웃 상태로 다른 기기에서 접속한 경우예요. 설정 > 계정에서 원래 사용하던 계정으로 로그인하면 다시 나타납니다. 그래도 보이지 않으면 /legal/data-rights 페이지에서 데이터 복구를 요청해 주세요.",
      en: "The most common cause is signing in on a different device while the original one was signed out. Open Settings > Account and sign in with the same account you used before. If progress still doesn't appear, request a data recovery from /legal/data-rights.",
      es: "La causa más común es haber usado otro dispositivo sin iniciar sesión en el original. Ve a Ajustes > Cuenta y entra con la misma cuenta de antes. Si el progreso no aparece, solicita la recuperación de datos en /legal/data-rights.",
    },
  },
  {
    q: {
      ko: "마이크가 작동하지 않아요.",
      en: "The mic isn't working.",
      es: "El micrófono no funciona.",
    },
    a: {
      ko: "브라우저나 시스템에서 마이크 권한을 차단했을 가능성이 높아요. 브라우저 주소창 옆 자물쇠 아이콘에서 권한을 확인하세요. iOS Safari에서는 페이지를 새로고침한 뒤 첫 탭에서 권한을 허용해야 하며, 백그라운드 탭에서는 동작하지 않을 수 있어요.",
      en: "Most often the browser or OS has blocked mic access. Check the lock icon in the address bar to grant the permission. On Safari iOS, refresh the page and grant access on the first interaction — Safari blocks the mic in background tabs.",
      es: "Casi siempre el navegador o el sistema bloqueó el micrófono. Revisa el icono del candado en la barra de direcciones para dar permiso. En Safari iOS, recarga la página y otorga acceso en el primer toque — Safari bloquea el micrófono en pestañas en segundo plano.",
    },
  },
  {
    q: {
      ko: "스트릭이 왜 0이에요?",
      en: "Why is my streak at 0?",
      es: "¿Por qué mi racha está en 0?",
    },
    a: {
      ko: "최근에 고친 버그예요. 이제 스트릭은 그 날 XP를 1점이라도 얻은 활동(레슨, 발음, 작문 등)을 완료해야 +1이 됩니다. 앱을 열기만 해서는 올라가지 않아요. 짧은 레슨 하나만 마치면 다시 시작됩니다.",
      en: "We recently fixed this. Streaks now only count after you finish at least one XP-earning activity that day (a lesson, pronunciation drill, writing exercise, etc.) — just opening the app no longer counts. Complete one short lesson and it'll start again.",
      es: "Lo arreglamos recientemente. La racha ahora solo cuenta cuando completas al menos una actividad que dé XP ese día (una lección, ejercicio de pronunciación o escritura). Abrir la app ya no cuenta. Termina una lección corta y volverá a empezar.",
    },
  },
  {
    q: {
      ko: "영어와 스페인어 외 다른 언어도 배울 수 있나요?",
      en: "Can I learn languages other than English/Spanish?",
      es: "¿Puedo aprender otros idiomas además de inglés y español?",
    },
    a: {
      ko: "아직은 영어와 스페인어만 지원해요. 다른 언어는 발음 모델과 콘텐츠를 준비하는 데 시간이 걸리기 때문에 단계적으로 추가할 예정입니다.",
      en: "Not yet — English and Spanish are the only learning languages supported today. Other languages require pronunciation models and content packs that we're building out gradually.",
      es: "Todavía no. Por ahora solo se admiten inglés y español como idiomas de estudio. Otros idiomas requieren modelos de pronunciación y contenido que estamos preparando poco a poco.",
    },
  },
  {
    q: {
      ko: "이 앱은 무료인가요?",
      en: "Is this free?",
      es: "¿Es gratis?",
    },
    a: {
      ko: "네, 현재 모든 기능이 무료예요. 추후 더 깊은 콘텐츠와 코칭 기능이 포함된 유료 플랜을 추가할 예정이지만, 지금의 무료 기능은 그대로 유지됩니다.",
      en: "Yes — everything is free right now. We'll add a paid tier later with deeper content and coaching features, but what's free today will stay free.",
      es: "Sí, todo es gratis por ahora. Más adelante añadiremos un plan de pago con contenido más profundo y funciones de coaching, pero lo que hoy es gratis seguirá siéndolo.",
    },
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nativeLanguage } = useLanguage();
  const lc: LangKey =
    nativeLanguage === "korean" ? "ko" : nativeLanguage === "spanish" ? "es" : "en";

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toggleFaq = (idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex((cur) => (cur === idx ? null : idx));
  };

  const validate = (): string | null => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName) return t(T.errMissingName, lc);
    if (!trimmedEmail) return t(T.errMissingEmail, lc);
    if (!EMAIL_RE.test(trimmedEmail)) return t(T.errBadEmail, lc);
    if (!trimmedMessage) return t(T.errMissingMessage, lc);
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/support-message", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        nativeLanguage,
      });
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (e) {
      console.warn("[support] submit failed:", e);
      setFormError(t(T.errSendFailed, lc));
    } finally {
      setSubmitting(false);
    }
  };

  const submitDisabled = useMemo(
    () => submitting || !name.trim() || !email.trim() || !message.trim(),
    [submitting, name, email, message],
  );

  return (
    <LinearGradient colors={[C.bg1, C.bg2]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.gold} />
          <Text style={styles.backText}>{t(T.back, lc)}</Text>
        </Pressable>
        <Text style={styles.title}>{t(T.title, lc)}</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── FAQ ── */}
          <Text style={styles.sectionTitle}>{t(T.faqSection, lc)}</Text>
          <View style={styles.card}>
            {FAQS.map((item, idx) => {
              const isOpen = openIndex === idx;
              const isLast = idx === FAQS.length - 1;
              return (
                <View
                  key={idx}
                  style={[
                    styles.faqItem,
                    !isLast && styles.faqItemDivider,
                  ]}
                >
                  <Pressable
                    onPress={() => toggleFaq(idx)}
                    style={styles.faqQuestionRow}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                  >
                    <Text style={styles.faqQuestion}>{t(item.q, lc)}</Text>
                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={C.gold}
                    />
                  </Pressable>
                  {isOpen ? (
                    <Text style={styles.faqAnswer}>{t(item.a, lc)}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>

          {/* ── Contact ── */}
          <Text style={styles.sectionTitle}>{t(T.contactSection, lc)}</Text>
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>{t(T.nameLabel, lc)}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t(T.namePlaceholder, lc)}
                placeholderTextColor={C.goldDim}
                style={styles.input}
                editable={!submitting}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t(T.emailLabel, lc)}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t(T.emailPlaceholder, lc)}
                placeholderTextColor={C.goldDim}
                style={styles.input}
                editable={!submitting}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t(T.messageLabel, lc)}</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder={t(T.messagePlaceholder, lc)}
                placeholderTextColor={C.goldDim}
                style={[styles.input, styles.textarea]}
                editable={!submitting}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={submitDisabled}
              style={[
                styles.submitBtn,
                { opacity: submitDisabled ? 0.5 : 1 },
              ]}
              accessibilityRole="button"
            >
              <Ionicons name="paper-plane-outline" size={18} color={C.bg1} />
              <Text style={styles.submitBtnText}>
                {submitting ? t(T.sending, lc) : t(T.submit, lc)}
              </Text>
            </Pressable>

            {formError ? (
              <Text style={[styles.helperText, { color: C.error }]}>
                {formError}
              </Text>
            ) : null}
            {sent ? (
              <View style={styles.successRow}>
                <Ionicons name="checkmark-circle" size={18} color={C.success} />
                <Text style={[styles.helperText, { color: C.success }]}>
                  {t(T.successMsg, lc)}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 20,
    color: C.gold,
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: F.header,
    fontSize: 14,
    color: C.goldDim,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 14,
  },
  // FAQ
  faqItem: {
    paddingVertical: 4,
  },
  faqItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 12,
    marginBottom: 4,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 6,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: F.bodySemi,
    fontSize: 16,
    color: C.parchment,
    lineHeight: 22,
  },
  faqAnswer: {
    fontFamily: F.body,
    fontSize: 15,
    color: C.parchmentDeep,
    lineHeight: 22,
    marginTop: 8,
  },
  // Form
  field: {
    gap: 6,
  },
  label: {
    fontFamily: F.label,
    fontSize: 13,
    color: C.goldDim,
    letterSpacing: 0.6,
    textTransform: "uppercase",
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
  textarea: {
    minHeight: 110,
    paddingTop: 10,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.gold,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.goldDim,
    marginTop: 4,
  },
  submitBtnText: {
    fontFamily: F.header,
    fontSize: 15,
    fontWeight: "600",
    color: C.bg1,
    letterSpacing: 0.5,
  },
  helperText: {
    fontFamily: F.body,
    fontSize: 14,
    lineHeight: 20,
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
