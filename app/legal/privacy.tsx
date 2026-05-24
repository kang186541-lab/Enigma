// Privacy Policy — Korean PIPA (개인정보보호법) and GDPR Art. 13/14 compliant.
//
// This file is the user-facing privacy disclosure for LinguaAI. The text is
// trilingual (ko / en / es) with a small picker at the top — by default the
// page renders in the user's selected native language.
//
// TODO (legal review): Before shipping to App Store / Play Store, have a
// Korean privacy counsel and an EU-licensed counsel review the wording.
// In particular:
//   - the 14-day refund window aligns with 전자상거래법 청약철회 (terms.tsx);
//     confirm whether the free-tier launch needs the same notice
//   - the controller / DPO designation when LinguaAI scales past PIPA's
//     thresholds for mandatory DPO appointment
//   - the cross-border transfer language (US for OpenAI / Azure / Vercel /
//     Railway, EU/US for Supabase depending on the chosen region)
//   - whether the AI-output disclaimer suffices for Korean 정보통신망법 §44-7
//
// Contact email: privacy@linguaai.example  ← REPLACE before launch.

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";

type LangKey = "ko" | "en" | "es";

// ───────────────────────────────────────────────────────────────────────────
// Localized strings. Keys are flat so the renderer below stays simple.
// ───────────────────────────────────────────────────────────────────────────
const T: Record<string, Record<LangKey, string>> = {
  title:        { ko: "개인정보처리방침",                       en: "Privacy Policy",                       es: "Política de Privacidad" },
  back:         { ko: "뒤로",                                   en: "Back",                                 es: "Volver" },
  effective:    { ko: "시행일: 2026년 5월 24일",                en: "Effective: May 24, 2026",              es: "Vigente desde: 24 de mayo de 2026" },
  langKo:       { ko: "한국어",                                 en: "Korean",                               es: "Coreano" },
  langEn:       { ko: "English",                                en: "English",                              es: "Inglés" },
  langEs:       { ko: "Español",                                en: "Spanish",                              es: "Español" },

  intro_h:      { ko: "1. 머리말",                              en: "1. Introduction",                      es: "1. Introducción" },
  intro_b: {
    ko: "LinguaAI(이하 \"서비스\")는 한국어 사용자가 영어·스페인어를(또는 그 반대로) 학습할 수 있도록 돕는 학습용 모바일·웹 애플리케이션입니다. 본 방침은 「개인정보 보호법」, EU 일반개인정보보호법(GDPR) 및 관련 법령에 따라 회사가 어떤 정보를 수집하고, 어떻게 사용하며, 어떻게 보관·파기하는지 설명합니다. 본 방침을 정독한 뒤 서비스를 이용해 주세요.",
    en: "LinguaAI (the \"Service\") is a learning application that helps Korean speakers study English and Spanish (and vice versa). This Privacy Policy explains, in accordance with the Korean Personal Information Protection Act (PIPA), the EU General Data Protection Regulation (GDPR), and other applicable laws, what data we collect, how we use it, and how we store and delete it. Please read it carefully before using the Service.",
    es: "LinguaAI (el \"Servicio\") es una aplicación de aprendizaje que ayuda a hispanohablantes y coreanos a estudiar inglés y español. Esta Política explica, conforme a la Ley Coreana de Protección de Información Personal (PIPA), al Reglamento General de Protección de Datos de la UE (RGPD) y a otras normas aplicables, qué datos recopilamos, cómo los usamos y cómo los conservamos y eliminamos.",
  },

  controller_h: { ko: "2. 개인정보 처리자(컨트롤러)",           en: "2. Data Controller",                   es: "2. Responsable del Tratamiento" },
  controller_b: {
    ko: "본 서비스의 개인정보 처리자는 LinguaAI 운영팀입니다. 개인정보 관련 문의 및 권리 행사는 privacy@linguaai.example 로 연락해 주세요. 회원이 한국에 거주하는 경우 「개인정보 보호법」상 개인정보 보호책임자가, EU/EEA에 거주하는 경우 동일 연락처가 GDPR 제27조의 대리인을 통해 대응합니다.",
    en: "The data controller for the Service is the LinguaAI operations team. For any privacy-related inquiry or to exercise your rights, contact privacy@linguaai.example. Korean residents may reach our Personal Information Protection Officer at that address. Users in the EU/EEA can reach the same address for matters under GDPR Article 27.",
    es: "El responsable del tratamiento es el equipo operativo de LinguaAI. Para consultas relacionadas con la privacidad o el ejercicio de tus derechos, escribe a privacy@linguaai.example. Los residentes en Corea pueden contactar a nuestro Responsable de Protección de Información Personal en esa dirección. Los usuarios del EEE pueden usar la misma dirección para asuntos bajo el Art. 27 del RGPD.",
  },

  collect_h:    { ko: "3. 수집하는 개인정보 항목",              en: "3. What We Collect",                   es: "3. Qué Datos Recopilamos" },
  collect_b: {
    ko: "회사는 서비스 제공에 필요한 최소한의 정보만을 수집합니다.\n\n(a) 계정 정보 — 이메일 주소(Google OAuth 또는 매직 링크 로그인을 통해), Supabase Authentication이 발급하는 사용자 ID, 그리고 Google 로그인을 사용하실 경우 Google이 제공하는 프로필 정보(이름, 프로필 사진 URL).\n(b) 학습 진도 — 경험치(XP), 레벨, 연속 학습일(streak), 학습한 단어 수, 마지막 학습일, 모국어·학습언어 설정. 이 데이터는 Supabase의 linguaai_user_progress 테이블에 저장됩니다.\n(c) 음성 데이터 — 발음 연습 시 사용자가 녹음한 음성은 Microsoft Azure Speech 서비스로 전송되어 발음 정확도를 평가합니다. 회사는 이 음성을 별도로 저장하지 않으며, Azure도 마이크로소프트의 \"No-Retention\" 정책에 따라 즉시 폐기합니다.\n(d) 대화/작문 텍스트 — 튜터 채팅, 작문 연습 등에서 사용자가 입력한 텍스트는 OpenAI GPT-4o-mini로 전송되어 AI 응답을 생성하는 데 사용됩니다. OpenAI의 \"zero data retention\" 정책에 따라 API 요청은 30일 이내 폐기되며 모델 학습에 사용되지 않습니다.\n(e) 기기 및 로그 정보 — 앱 충돌 로그, 운영체제 종류, 앱 버전. 보안·품질 개선 목적으로만 사용합니다.\n(f) 알림 토큰 — 매일 학습 알림을 켠 경우 Expo Push 토큰을 저장합니다.\n\n회사는 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다.",
    en: "We collect only the minimum information needed to operate the Service.\n\n(a) Account information — your email address (via Google OAuth or magic-link), the Supabase user ID assigned at sign-up, and, if you use Google sign-in, the profile information Google returns (display name, avatar URL).\n(b) Learning progress — XP, level, daily streak, number of words learned, last session date, native and target language settings. These are stored in our Supabase table linguaai_user_progress.\n(c) Voice recordings — When you record yourself for pronunciation practice, the audio is sent to Microsoft Azure Speech for scoring. We do not retain the recording on our servers, and Azure follows a \"no-retention\" policy and discards the audio after scoring.\n(d) Conversation / writing text — Text you type into the AI tutor or writing practice is sent to OpenAI's GPT-4o-mini to produce a response. Under OpenAI's API zero-data-retention policy, requests are discarded within 30 days and are not used to train models.\n(e) Device and log data — crash logs, OS type, app version. Used only for security and product quality.\n(f) Push token — if you turn on the daily reminder, we store an Expo push token tied to your device.\n\nWe do not knowingly collect data from children under 14 (Korea) or 16 (EEA).",
    es: "Recopilamos solo la información mínima necesaria para operar el Servicio.\n\n(a) Información de cuenta — tu dirección de correo electrónico (vía Google OAuth o enlace mágico), el ID de usuario asignado por Supabase y, si usas Google, la información de perfil devuelta por Google (nombre, URL del avatar).\n(b) Progreso de aprendizaje — XP, nivel, racha diaria, número de palabras aprendidas, fecha de la última sesión, idioma nativo y de estudio. Se guarda en nuestra tabla linguaai_user_progress de Supabase.\n(c) Grabaciones de voz — Cuando te grabas para practicar pronunciación, el audio se envía a Microsoft Azure Speech para evaluarlo. No conservamos la grabación; Azure sigue una política de \"no retención\" y descarta el audio tras la evaluación.\n(d) Texto de conversación / escritura — El texto que escribes al tutor IA o en la práctica de escritura se envía a GPT-4o-mini de OpenAI para generar respuesta. Bajo la política de \"zero-data-retention\" de la API de OpenAI, las solicitudes se descartan en un plazo de 30 días y no se usan para entrenar modelos.\n(e) Datos del dispositivo y registro — registros de fallos, tipo de SO, versión de la app. Se usan solo para seguridad y calidad.\n(f) Token de notificación — si activas el recordatorio diario, guardamos un token push de Expo asociado a tu dispositivo.\n\nNo recopilamos a sabiendas datos de menores de 14 años (Corea) ni de menores de 16 años (EEE).",
  },

  purposes_h:   { ko: "4. 처리 목적",                           en: "4. Purposes of Processing",            es: "4. Finalidades del Tratamiento" },
  purposes_b: {
    ko: "수집한 정보는 다음 목적으로만 처리됩니다.\n  - 회원 식별 및 로그인 유지\n  - 학습 진도(XP/레벨/연속 학습일)를 기기 간 동기화\n  - 발음 채점 및 AI 튜터 응답 생성\n  - 알림 발송(사용자가 활성화한 경우)\n  - 부정 사용 방지, 보안 사고 대응, 법적 의무 준수\n  - 통계적으로 익명화된 형태의 서비스 개선 분석\n\n회사는 위 목적 외의 다른 목적으로 정보를 이용하지 않으며, 별도의 동의 없이 마케팅·광고에 이용하지 않습니다.",
    en: "We use the information only for:\n  - identifying you and keeping you signed in;\n  - syncing your learning progress (XP / level / streak) across devices;\n  - scoring pronunciation and generating tutor responses;\n  - sending push notifications you have enabled;\n  - preventing abuse, responding to security incidents, and meeting legal duties;\n  - aggregate, anonymized analytics to improve the Service.\n\nWe do not use your personal information for any other purpose, and we do not use it for marketing or advertising without your separate, explicit consent.",
    es: "Usamos la información únicamente para:\n  - identificarte y mantener tu sesión;\n  - sincronizar tu progreso (XP / nivel / racha) entre dispositivos;\n  - evaluar la pronunciación y generar respuestas del tutor IA;\n  - enviar notificaciones push si las activas;\n  - prevenir abusos, responder a incidentes de seguridad y cumplir obligaciones legales;\n  - análisis agregado y anónimo para mejorar el Servicio.\n\nNo usamos tu información personal para ningún otro fin, ni para marketing o publicidad sin tu consentimiento separado y explícito.",
  },

  basis_h:      { ko: "5. 처리의 법적 근거 (GDPR 제6조)",       en: "5. Legal Basis (GDPR Art. 6)",         es: "5. Base Jurídica (Art. 6 RGPD)" },
  basis_b: {
    ko: "EU/EEA 거주자에 대한 처리의 법적 근거는 다음과 같습니다.\n  - 계정 및 학습 진도 처리: 계약 이행(GDPR 6(1)(b)) — 서비스 이용계약의 핵심 기능 제공.\n  - 음성 채점 및 AI 응답: 계약 이행(GDPR 6(1)(b)).\n  - 알림 발송: 동의(GDPR 6(1)(a)) — 설정에서 언제든 철회 가능.\n  - 보안 로그 및 부정 사용 방지: 정당한 이익(GDPR 6(1)(f)).\n  - 법적 의무 이행이 필요한 경우: 법적 의무(GDPR 6(1)(c)).",
    en: "For users in the EU/EEA, the legal bases for processing are:\n  - account and learning-progress data: performance of a contract (GDPR 6(1)(b)) — required to deliver the Service you signed up for;\n  - pronunciation scoring and AI responses: performance of a contract (GDPR 6(1)(b));\n  - push notifications: your consent (GDPR 6(1)(a)) — withdrawable at any time in settings;\n  - security logs and abuse prevention: legitimate interests (GDPR 6(1)(f));\n  - any processing required by law: legal obligation (GDPR 6(1)(c)).",
    es: "Para usuarios en el EEE, las bases jurídicas para el tratamiento son:\n  - cuenta y progreso de aprendizaje: ejecución de un contrato (Art. 6(1)(b) del RGPD);\n  - evaluación de pronunciación y respuestas de IA: ejecución de contrato (Art. 6(1)(b));\n  - notificaciones push: tu consentimiento (Art. 6(1)(a)), retirable en cualquier momento;\n  - registros de seguridad y prevención de abuso: interés legítimo (Art. 6(1)(f));\n  - cualquier tratamiento exigido por ley: obligación legal (Art. 6(1)(c)).",
  },

  subproc_h:    { ko: "6. 처리 위탁 및 제3자 제공(수탁자)",     en: "6. Subprocessors",                     es: "6. Subprocesadores" },
  subproc_b: {
    ko: "서비스 제공을 위해 다음 수탁자에게 일부 처리를 위탁합니다. 각 수탁자는 본인 정보를 자기 목적으로 사용할 수 없으며, 서비스 종료 또는 위탁계약 해지 시 보관 중인 데이터는 즉시 파기됩니다.\n\n  • Supabase Inc. (미국) — 인증 및 PostgreSQL 데이터베이스 호스팅. 회원 이메일, 사용자 ID, 학습 진도가 저장됩니다.\n  • OpenAI, L.L.C. (미국) — GPT-4o-mini를 통한 AI 튜터 응답 생성. 사용자가 입력한 텍스트가 전송되며 30일 이내 폐기되고 모델 학습에 사용되지 않습니다.\n  • Microsoft Azure Cognitive Services (미국·EU 리전) — 발음 채점. 녹음된 음성이 전송되며 채점 후 즉시 폐기됩니다.\n  • Google Cloud Text-to-Speech (미국) — TTS 음성 합성을 위해 학습 콘텐츠 텍스트가 전송됩니다.\n  • Vercel Inc. (미국) — 웹 호스팅 및 CDN.\n  • Railway Corp. (미국) — API 서버 호스팅.\n  • Expo / EAS (미국) — 푸시 알림 토큰 관리, 앱 빌드 배포.\n\n이상의 위탁은 「개인정보 보호법」 제26조에 따른 처리 위탁이며, EU/EEA 거주자의 데이터는 GDPR 제46조에 따라 표준계약조항(SCCs) 또는 충분성 결정을 기반으로 국외 이전됩니다.",
    en: "We use the following subprocessors. Each is contractually bound to use your data only on our instructions and to delete it when the engagement ends.\n\n  • Supabase Inc. (USA) — authentication and PostgreSQL hosting. Stores your email, user ID, and learning progress.\n  • OpenAI, L.L.C. (USA) — generates AI tutor responses via GPT-4o-mini. Text you type is sent, discarded within 30 days, and not used to train models.\n  • Microsoft Azure Cognitive Services (USA / EU regions) — pronunciation scoring. Voice audio is sent, scored, and immediately discarded.\n  • Google Cloud Text-to-Speech (USA) — converts lesson text to spoken audio.\n  • Vercel Inc. (USA) — web hosting and CDN.\n  • Railway Corp. (USA) — API server hosting.\n  • Expo / EAS (USA) — push-token management and app build distribution.\n\nThese arrangements are processing entrustments under PIPA Article 26. For EU/EEA users, transfers outside the EEA rely on Standard Contractual Clauses (GDPR Art. 46) or applicable adequacy decisions.",
    es: "Utilizamos los siguientes subprocesadores. Cada uno está obligado contractualmente a usar tus datos solo bajo nuestras instrucciones y a eliminarlos al terminar la relación.\n\n  • Supabase Inc. (EE. UU.) — autenticación y base de datos PostgreSQL. Guarda tu correo, ID de usuario y progreso.\n  • OpenAI, L.L.C. (EE. UU.) — genera respuestas del tutor IA mediante GPT-4o-mini. El texto que escribes se envía, se descarta en un plazo de 30 días y no se usa para entrenar modelos.\n  • Microsoft Azure Cognitive Services (EE. UU. / regiones de la UE) — evaluación de pronunciación. La voz se envía, se evalúa y se descarta de inmediato.\n  • Google Cloud Text-to-Speech (EE. UU.) — convierte texto de la lección a audio.\n  • Vercel Inc. (EE. UU.) — alojamiento web y CDN.\n  • Railway Corp. (EE. UU.) — alojamiento del servidor de la API.\n  • Expo / EAS (EE. UU.) — gestión de tokens push y distribución de builds.\n\nEstos acuerdos constituyen encargos del tratamiento conforme al art. 26 de PIPA. Para usuarios del EEE, las transferencias fuera del EEE se basan en Cláusulas Contractuales Tipo (art. 46 del RGPD) o decisiones de adecuación.",
  },

  retention_h:  { ko: "7. 보유 및 이용 기간",                   en: "7. Retention Period",                  es: "7. Plazo de Conservación" },
  retention_b: {
    ko: "  - 계정 정보 및 학습 진도: 회원 탈퇴 시까지 보유합니다. 탈퇴 즉시 영구 삭제하며, 백업본은 최대 30일 이내 폐기됩니다.\n  - 음성 녹음: 회사 서버에 저장하지 않으며, Azure 측에서도 채점 즉시 폐기됩니다.\n  - 대화 텍스트: 회사 서버에 저장하지 않으며, OpenAI 측에서 30일 이내 폐기됩니다.\n  - 크래시 로그: 최대 90일.\n  - 보안 사고 또는 법령상 보존 의무가 있는 경우 해당 기간 동안 별도 분리·저장됩니다(예: 통신비밀보호법, 전자상거래법 등).",
    en: "  - Account info and learning progress: kept while your account is active; permanently deleted on account closure, with backups purged within 30 days.\n  - Voice recordings: never stored on our servers; Azure discards them as soon as scoring is complete.\n  - Conversation text: never stored on our servers; OpenAI discards it within 30 days.\n  - Crash logs: up to 90 days.\n  - Where Korean or EU law requires longer retention (e.g. for a security investigation, the Korean Act on Electronic Commerce, or the Communications Privacy Act), the affected data is segregated and retained for the required period.",
    es: "  - Información de la cuenta y progreso: se conserva mientras la cuenta esté activa; se elimina permanentemente al cerrar la cuenta y las copias de seguridad se purgan en 30 días.\n  - Grabaciones de voz: nunca se almacenan en nuestros servidores; Azure las descarta tras la evaluación.\n  - Texto de conversación: nunca se almacena en nuestros servidores; OpenAI lo descarta en un plazo de 30 días.\n  - Registros de fallos: hasta 90 días.\n  - Cuando la ley coreana o de la UE exija una conservación más larga (por ej., una investigación de seguridad, la Ley de Comercio Electrónico o la Ley de Privacidad de las Comunicaciones), los datos afectados se segregan y conservan por el plazo requerido.",
  },

  rights_h:     { ko: "8. 정보주체의 권리",                     en: "8. Your Rights",                       es: "8. Tus Derechos" },
  rights_b: {
    ko: "「개인정보 보호법」 제35조 이하 및 GDPR 제15조~제22조에 따라 다음 권리를 가집니다.\n  - 열람권 — 처리 중인 본인 정보의 사본을 요청할 수 있습니다.\n  - 정정·삭제권 — 부정확한 정보의 정정을 요구하거나 \"탈퇴\" 버튼을 통해 영구 삭제(잊혀질 권리)를 요구할 수 있습니다.\n  - 이동권(GDPR) — 제공한 정보를 구조화·기계판독 가능 형식으로 내려받을 수 있습니다(앱 내 \"내 데이터 내려받기\").\n  - 처리 정지 및 동의 철회 — 마케팅·알림 등 동의에 기반한 처리는 언제든 철회할 수 있습니다.\n  - 자동화 의사결정에 대한 권리(GDPR 제22조) — 본 서비스의 채점은 보조 도구이며 사용자에게 법적 효력을 미치는 단독 자동화 의사결정은 수행하지 않습니다.\n\n권리 행사 방법: 앱 → 설정 → \"내 데이터 / Privacy & Terms\" 메뉴를 이용하거나 privacy@linguaai.example 로 요청해 주세요. 회사는 정당한 요청에 대해 한국법상 10일, GDPR상 1개월 이내(연장 시 2개월 추가) 회신합니다.",
    en: "Under PIPA Articles 35 et seq. and GDPR Articles 15–22, you have the right to:\n  - Access — receive a copy of the personal data we hold about you;\n  - Rectification and erasure — correct inaccurate data, or permanently delete your account (\"right to be forgotten\") via the in-app Delete button;\n  - Portability (GDPR) — download data you provided in a structured, machine-readable format (in-app \"Download my data\");\n  - Restrict processing and withdraw consent — for consent-based processing such as marketing or notifications, at any time;\n  - Object to automated decision-making (GDPR Art. 22) — our scoring is an aid, not a binding automated decision; we do not make decisions that produce legal effects from automation alone.\n\nTo exercise these rights, use Settings → \"My Data / Privacy & Terms\" inside the app, or write to privacy@linguaai.example. We respond within 10 days under Korean law and within one month under GDPR (extendable by up to two further months for complex requests).",
    es: "Conforme a los Arts. 35 y ss. de PIPA y a los Arts. 15–22 del RGPD, tienes derecho a:\n  - Acceso — recibir una copia de los datos personales que tenemos sobre ti;\n  - Rectificación y supresión — corregir datos inexactos o eliminar tu cuenta permanentemente (\"derecho al olvido\") mediante el botón \"Eliminar\" de la app;\n  - Portabilidad (RGPD) — descargar los datos que aportaste en formato estructurado y legible por máquina (\"Descargar mis datos\");\n  - Limitar el tratamiento y retirar el consentimiento — para tratamientos basados en consentimiento (marketing, notificaciones), en cualquier momento;\n  - Oponerte a decisiones automatizadas (Art. 22 RGPD) — nuestra puntuación es una ayuda, no una decisión vinculante; no tomamos decisiones con efectos jurídicos basadas solo en automatización.\n\nPara ejercer estos derechos, ve a Ajustes → \"Mis datos / Privacidad y Términos\" en la app o escribe a privacy@linguaai.example. Respondemos en un plazo de 10 días bajo la ley coreana y de un mes bajo el RGPD (prorrogable hasta dos meses adicionales en casos complejos).",
  },

  security_h:   { ko: "9. 안전성 확보 조치",                    en: "9. Security Measures",                 es: "9. Medidas de Seguridad" },
  security_b: {
    ko: "회사는 「개인정보의 안전성 확보조치 기준」(개인정보보호위원회 고시)에 따라 다음과 같은 조치를 시행합니다.\n  - 접속 및 전송 구간 암호화(TLS 1.2 이상)\n  - 데이터베이스 RLS(Row-Level Security) 정책으로 사용자 본인 데이터만 접근 가능\n  - 접근 권한 최소화 원칙 및 분기별 권한 점검\n  - 운영 인력에 대한 비밀유지 의무 부과\n  - 정기적 백업 및 무결성 검증\n  - 침해 사고 발생 시 한국법상 5일, GDPR상 72시간 이내 통지 절차",
    en: "We follow the Korean PIPC \"Standards for Security Measures\" and implement at least the following:\n  - TLS 1.2+ for all in-transit traffic;\n  - Postgres Row-Level Security policies so each user can only read their own row;\n  - principle of least privilege and quarterly access reviews;\n  - confidentiality obligations for staff;\n  - regular backups with integrity verification;\n  - breach-notification process meeting Korean law (within 5 days) and GDPR (within 72 hours).",
    es: "Aplicamos los \"Estándares de Seguridad\" de la PIPC coreana y, como mínimo, las siguientes medidas:\n  - TLS 1.2+ en todo el tráfico en tránsito;\n  - políticas Row-Level Security en Postgres para que cada usuario solo lea su propia fila;\n  - principio de mínimo privilegio y revisiones de acceso trimestrales;\n  - obligaciones de confidencialidad para el personal;\n  - copias de seguridad periódicas con verificación de integridad;\n  - proceso de notificación de incidentes conforme a la ley coreana (5 días) y al RGPD (72 horas).",
  },

  cookies_h:    { ko: "10. 쿠키 및 로컬 저장소",                en: "10. Cookies and Local Storage",        es: "10. Cookies y Almacenamiento Local" },
  cookies_b: {
    ko: "웹 버전에서는 로그인 세션 유지 및 학습 진도 동기화 목적으로 필수 쿠키와 localStorage를 사용합니다. 분석·광고 목적의 제3자 쿠키는 사용하지 않습니다. 네이티브 앱에서는 AsyncStorage에 세션 토큰과 학습 데이터를 저장합니다.",
    en: "On web we use strictly-necessary cookies and localStorage to keep you signed in and to sync progress. We do not use third-party advertising or analytics cookies. On native apps, the equivalent data is stored in AsyncStorage on your device.",
    es: "En la web usamos cookies estrictamente necesarias y localStorage para mantener tu sesión y sincronizar el progreso. No usamos cookies de publicidad ni analítica de terceros. En las apps nativas, los datos equivalentes se guardan en AsyncStorage del dispositivo.",
  },

  intltransfer_h: { ko: "11. 국외 이전",                          en: "11. International Transfers",        es: "11. Transferencias Internacionales" },
  intltransfer_b: {
    ko: "위 \"6. 처리 위탁\"에 명시된 수탁자들의 처리 인프라가 한국 외 지역(주로 미국)에 위치하므로, 본 서비스 이용 시 회원의 정보가 국외로 이전됩니다. 이전되는 항목, 이전 국가, 이전 일시(서비스 이용 시점), 이전 방법(HTTPS), 이전 받는 자의 정보 및 보호조치는 본 방침에 명시되어 있으며, 「개인정보 보호법」 제28조의8 및 GDPR 제46조에 따른 보호조치를 적용합니다.",
    en: "Several subprocessors listed above operate primarily in the United States, which means your data is transferred outside Korea / outside the EEA when you use the Service. The categories, recipient countries, transfer time (when you use the Service), method (HTTPS), recipient identities, and safeguards are disclosed in this Policy. Transfers comply with PIPA Article 28-8 and rely on Standard Contractual Clauses or adequacy decisions for GDPR purposes.",
    es: "Varios subprocesadores citados operan principalmente en EE. UU., por lo que tus datos se transfieren fuera de Corea / del EEE al usar el Servicio. Las categorías, países de destino, momento de la transferencia (al usar el Servicio), método (HTTPS), identidades de los receptores y salvaguardas se divulgan en esta Política. Las transferencias cumplen con el art. 28-8 de PIPA y, a efectos del RGPD, se basan en Cláusulas Contractuales Tipo o decisiones de adecuación.",
  },

  children_h:   { ko: "12. 만 14세 미만 아동",                   en: "12. Children Under 14",                es: "12. Menores de 14 Años" },
  children_b: {
    ko: "본 서비스는 만 14세 미만의 가입을 허용하지 않습니다. 만일 만 14세 미만의 정보가 수집된 사실을 인지한 경우 즉시 해당 계정을 삭제합니다. EU/EEA 지역의 만 16세 미만 회원은 부모/법정대리인의 동의가 있어야 합니다.",
    en: "The Service is not directed to children under 14. If we learn we have collected data from a child under 14, we will delete the account immediately. For users in the EEA, users under 16 must have parental or guardian consent.",
    es: "El Servicio no está dirigido a menores de 14 años. Si descubrimos que hemos recopilado datos de un menor de 14, eliminaremos la cuenta de inmediato. En el EEE, los menores de 16 deben contar con consentimiento parental o del tutor.",
  },

  complaint_h:  { ko: "13. 권리 침해 구제 방법",                en: "13. Complaints",                       es: "13. Reclamaciones" },
  complaint_b: {
    ko: "회사의 처리에 이의가 있을 경우 다음 기관에 분쟁 조정·신고를 신청할 수 있습니다.\n  • 개인정보분쟁조정위원회: 1833-6972, www.kopico.go.kr\n  • 개인정보 침해신고센터: 118, privacy.kisa.or.kr\n  • 대검찰청 사이버범죄수사단: 1301, www.spo.go.kr\n  • 경찰청 사이버수사국: 182, ecrm.cyber.go.kr\n\nEU/EEA 거주자는 본인의 거주지국 감독기관(예: CNIL, BfDI 등)에 신고할 권리가 있습니다.",
    en: "If you believe we have violated your rights, you may file a complaint with:\n  • Korean Personal Information Dispute Mediation Committee: +82-1833-6972, www.kopico.go.kr\n  • Korea Internet & Security Agency Privacy Complaint Center: 118, privacy.kisa.or.kr\n  • Korean Prosecutors' Office Cybercrime Unit: 1301, www.spo.go.kr\n  • Korean Police Cyber Bureau: 182, ecrm.cyber.go.kr\n\nUsers in the EU/EEA also have the right to lodge a complaint with their local supervisory authority (e.g., CNIL in France, BfDI in Germany).",
    es: "Si crees que hemos vulnerado tus derechos, puedes presentar una reclamación ante:\n  • Comité Coreano de Mediación de Disputas de Información Personal: +82-1833-6972, www.kopico.go.kr\n  • Centro de Reclamaciones de KISA: 118, privacy.kisa.or.kr\n  • Unidad de Cibercrimen del Ministerio Fiscal coreano: 1301, www.spo.go.kr\n  • División Cibernética de la Policía Nacional coreana: 182, ecrm.cyber.go.kr\n\nLos usuarios del EEE tienen derecho a reclamar ante su autoridad local de protección de datos (p. ej., la AEPD en España, la CNIL en Francia).",
  },

  changes_h:    { ko: "14. 방침의 변경",                        en: "14. Changes to this Policy",          es: "14. Cambios en esta Política" },
  changes_b: {
    ko: "본 방침이 변경될 경우 시행 7일 전(중대 변경 시 30일 전)까지 앱 내 공지 및 가입 이메일을 통해 안내합니다. 변경 후에도 계속 서비스를 이용하는 경우 변경 내용에 동의하는 것으로 간주됩니다.",
    en: "If we materially change this Policy, we will notify you in-app and by email at least 7 days before the change takes effect (30 days for significant changes). Continued use after that date constitutes acceptance.",
    es: "Si modificamos sustancialmente esta Política, te avisaremos en la app y por correo al menos 7 días antes (30 días para cambios significativos). Seguir usando el Servicio tras esa fecha implica aceptación.",
  },

  contact_h:    { ko: "15. 문의",                                en: "15. Contact",                          es: "15. Contacto" },
  contact_b: {
    ko: "개인정보 관련 모든 문의는 privacy@linguaai.example 로 보내 주세요. (※ 본 주소는 출시 전 실제 운영 이메일로 교체될 예정입니다.)",
    en: "All privacy-related inquiries should be directed to privacy@linguaai.example. (This address is a placeholder and will be replaced with our live operations address before launch.)",
    es: "Todas las consultas relacionadas con la privacidad deben dirigirse a privacy@linguaai.example. (Es una dirección provisional que se sustituirá por la oficial antes del lanzamiento.)",
  },
};

function t(obj: Record<LangKey, string>, lang: LangKey): string {
  return obj[lang] ?? obj.en;
}

// ───────────────────────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────────────────────
export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nativeLanguage: nativeLang } = useLanguage();
  const defaultLc: LangKey =
    nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";
  const [lc, setLc] = useState<LangKey>(defaultLc);

  const sections: Array<[keyof typeof T, keyof typeof T]> = [
    ["intro_h",        "intro_b"],
    ["controller_h",   "controller_b"],
    ["collect_h",      "collect_b"],
    ["purposes_h",     "purposes_b"],
    ["basis_h",        "basis_b"],
    ["subproc_h",      "subproc_b"],
    ["retention_h",    "retention_b"],
    ["rights_h",       "rights_b"],
    ["security_h",     "security_b"],
    ["cookies_h",      "cookies_b"],
    ["intltransfer_h", "intltransfer_b"],
    ["children_h",     "children_b"],
    ["complaint_h",    "complaint_b"],
    ["changes_h",      "changes_b"],
    ["contact_h",      "contact_b"],
  ];

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

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.effective}>{t(T.effective, lc)}</Text>

        {sections.map(([hKey, bKey]) => (
          <View key={String(hKey)} style={styles.section}>
            <Text style={styles.h}>{t(T[hKey], lc)}</Text>
            <Text style={styles.p}>{t(T[bKey], lc)}</Text>
          </View>
        ))}

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
  effective: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.goldDim,
    fontStyle: "italic",
    marginBottom: 16,
    textAlign: "center",
  },
  section: {
    marginBottom: 18,
  },
  h: {
    fontFamily: F.header,
    fontSize: 16,
    color: C.gold,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  p: {
    fontFamily: F.body,
    fontSize: 14.5,
    lineHeight: 22,
    color: C.parchment,
  },
});
