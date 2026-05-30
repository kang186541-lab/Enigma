// Terms of Service — LinguaAI
//
// Korean 전자상거래법 청약철회 (7-day refund) compliant, with AI-content
// disclaimers, acceptable-use, termination, limitation of liability, and
// Korean choice-of-law / Seoul jurisdiction clauses.
//
// TODO (legal review):
//   - confirm refund window for digital subscriptions actually launches at 7
//     days under 전자상거래법 §17 (Korean law treats digital goods specially
//     once the user has begun consuming them, but until the paid tier ships
//     the safer disclosure is "you may withdraw within 7 days")
//   - revisit "no class action" wording — Korea has not adopted a clean
//     class-action statute, but a Korean court will not enforce a US-style
//     class-action waiver against a consumer
//   - if EU/EEA users sign up, confirm the 14-day right of withdrawal under
//     EU Consumer Rights Directive 2011/83 also applies (already noted)
//
// Contact: privacy@linguaai.example  ← REPLACE before launch.

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";

type LangKey = "ko" | "en" | "es" | "id";

const T: Record<string, Record<LangKey, string>> = {
  title:        { ko: "이용약관",                                 en: "Terms of Service",                       es: "Términos de Servicio",                  id: "Ketentuan Layanan" },
  back:         { ko: "뒤로",                                     en: "Back",                                   es: "Volver",                                id: "Kembali" },
  effective:    { ko: "시행일: 2026년 5월 24일",                  en: "Effective: May 24, 2026",                es: "Vigente desde: 24 de mayo de 2026",     id: "Berlaku: 24 Mei 2026" },
  langKo:       { ko: "한국어",                                   en: "Korean",                                 es: "Coreano",                               id: "Korea" },
  langEn:       { ko: "English",                                  en: "English",                                es: "Inglés",                                id: "Inggris" },
  langEs:       { ko: "Español",                                  en: "Spanish",                                es: "Español",                               id: "Spanyol" },

  intro_h:      { ko: "1. 약관의 적용",                            en: "1. Scope and Acceptance",                es: "1. Ámbito y Aceptación",                id: "1. Lingkup dan Penerimaan" },
  intro_b: {
    ko: "본 이용약관(이하 \"약관\")은 LinguaAI(이하 \"회사\")가 제공하는 모바일·웹 학습 서비스(이하 \"서비스\")의 이용과 관련하여 회사와 회원 간의 권리·의무 및 책임사항을 규정합니다. 회원이 회원가입 절차를 완료하거나 서비스를 이용하기 시작한 경우 본 약관에 동의한 것으로 간주됩니다. 본 약관에 동의하지 않을 경우 서비스를 이용할 수 없습니다.",
    en: "These Terms of Service (\"Terms\") govern your use of the LinguaAI mobile and web learning service (the \"Service\") and form an agreement between you and LinguaAI (\"we\", \"us\"). By creating an account or using the Service, you accept these Terms. If you do not accept, please do not use the Service.",
    es: "Estos Términos de Servicio (\"Términos\") regulan el uso del servicio de aprendizaje móvil y web LinguaAI (el \"Servicio\") y constituyen un contrato entre tú y LinguaAI (\"nosotros\"). Al crear una cuenta o usar el Servicio aceptas estos Términos. Si no los aceptas, no uses el Servicio.",
    id: "Ketentuan Layanan ini (\"Ketentuan\") mengatur penggunaanmu atas layanan pembelajaran seluler dan web LinguaAI (\"Layanan\") serta merupakan perjanjian antara kamu dan LinguaAI (\"kami\"). Dengan membuat akun atau menggunakan Layanan, kamu menerima Ketentuan ini. Jika kamu tidak menerimanya, mohon jangan gunakan Layanan.",
  },

  account_h:    { ko: "2. 계정 및 인증",                          en: "2. Account and Sign-In",                 es: "2. Cuenta y Acceso",                    id: "2. Akun dan Masuk" },
  account_b: {
    ko: "회원은 Google OAuth 또는 이메일 매직 링크 방식으로 본인의 이메일로 가입할 수 있습니다. 회원은 본인 정보가 정확하고 최신임을 유지해야 하며, 계정 자격증명(매직 링크, OAuth 세션 등)의 비밀유지에 대해 책임을 부담합니다. 타인 계정의 도용·부정 사용 발견 시 즉시 회사에 알려주세요.",
    en: "You may create an account using Google OAuth or an email magic-link. You agree to provide accurate information and to keep it current, and you are responsible for safeguarding your sign-in credentials (magic-link or OAuth session). Tell us immediately if you suspect any unauthorized use of your account.",
    es: "Puedes crear una cuenta usando Google OAuth o un enlace mágico por correo. Te comprometes a aportar información veraz, mantenerla actualizada y a custodiar tus credenciales de acceso (enlace mágico o sesión OAuth). Avísanos de inmediato si sospechas un uso no autorizado de tu cuenta.",
    id: "Kamu dapat membuat akun menggunakan Google OAuth atau tautan ajaib lewat email. Kamu setuju untuk memberikan informasi yang akurat, menjaganya tetap terbarui, dan bertanggung jawab atas kerahasiaan kredensial masukmu (tautan ajaib atau sesi OAuth). Beri tahu kami segera jika kamu mencurigai adanya penggunaan akunmu tanpa izin.",
  },

  age_h:        { ko: "3. 이용 자격 및 미성년자",                 en: "3. Eligibility and Minors",              es: "3. Requisitos y Menores",               id: "3. Kelayakan dan Anak di Bawah Umur" },
  age_b: {
    ko: "만 14세 미만은 가입할 수 없습니다. EU/EEA 거주자의 경우 만 16세 미만은 부모/법정대리인의 동의가 필요합니다. 회사가 부정한 정보로 가입했음을 인지한 경우 즉시 계정을 해지할 수 있습니다.",
    en: "Children under 14 may not create an account. In the EU/EEA, users under 16 require parental or guardian consent. We may terminate accounts that we determine were created with false information.",
    es: "Los menores de 14 años no pueden crear cuenta. En el EEE, los menores de 16 necesitan el consentimiento parental o del tutor. Podremos cancelar cuentas creadas con información falsa.",
    id: "Anak di bawah 14 tahun tidak boleh membuat akun. Di UE/EEA, pengguna di bawah 16 tahun memerlukan persetujuan orang tua atau wali. Kami dapat menutup akun yang menurut kami dibuat dengan informasi palsu.",
  },

  service_h:    { ko: "4. 서비스의 내용",                         en: "4. The Service",                         es: "4. El Servicio",                        id: "4. Layanan" },
  service_b: {
    ko: "본 서비스는 인공지능을 활용한 외국어 학습 도구를 제공합니다. 주요 기능에는 매일의 학습 코스, 플래시카드, 발음 채점, AI 튜터 채팅, 작문 연습, 도전 과제·연속 학습일·리더보드 기능 등이 포함됩니다. 회사는 서비스 품질을 개선하기 위해 기능을 추가·변경·중단할 수 있으며, 변경이 회원에게 불리한 경우 시행 전 30일 이상 사전 고지합니다.",
    en: "The Service provides AI-assisted foreign-language learning tools, including daily lessons, flashcards, pronunciation scoring, an AI tutor chat, writing practice, achievements, streaks, and a leaderboard. We may add, change, or discontinue features to improve quality; if a change is materially adverse to users, we will give at least 30 days' notice before it takes effect.",
    es: "El Servicio proporciona herramientas de aprendizaje de idiomas asistidas por IA: lecciones diarias, tarjetas, evaluación de pronunciación, chat con tutor IA, práctica de escritura, logros, rachas y tablas de clasificación. Podemos añadir, modificar o suspender funciones para mejorar la calidad; si un cambio es sustancialmente desfavorable, lo avisaremos con al menos 30 días de antelación.",
    id: "Layanan ini menyediakan alat pembelajaran bahasa asing berbantuan AI, termasuk pelajaran harian, kartu hafalan, penilaian pengucapan, obrolan tutor AI, latihan menulis, pencapaian, streak, dan papan peringkat. Kami dapat menambah, mengubah, atau menghentikan fitur untuk meningkatkan kualitas; jika suatu perubahan secara material merugikan pengguna, kami akan memberi tahu setidaknya 30 hari sebelum berlaku.",
  },

  ai_h:         { ko: "5. AI 생성 콘텐츠에 관한 고지",            en: "5. AI-Generated Content Disclaimer",     es: "5. Aviso sobre el Contenido Generado por IA", id: "5. Penafian Konten Buatan AI" },
  ai_b: {
    ko: "본 서비스의 튜터 응답, 첨삭, 발음 평가, 회화 예문, 번역 등은 OpenAI GPT-4o-mini, Microsoft Azure Speech, Google Text-to-Speech 등 제3자 인공지능 모델을 통해 자동 생성됩니다. 인공지능 출력은 (i) 항상 정확하다고 보증할 수 없으며 (ii) 학습·참고용 정보일 뿐 의료, 법률, 재정 등 전문적 자문이 아닙니다. 회원은 AI 출력의 사실 여부를 스스로 확인할 책임이 있으며, 회사는 AI 출력의 부정확성으로 인한 손해에 대해 본 약관 \"제11조 책임의 제한\"의 범위 내에서 책임을 부담합니다.",
    en: "Tutor replies, corrections, pronunciation scores, conversation examples, translations, and similar features rely on third-party AI models (OpenAI GPT-4o-mini, Microsoft Azure Speech, Google Text-to-Speech). AI output (i) is not guaranteed to be accurate and (ii) is provided for learning and informational purposes only — it is not medical, legal, financial, or other professional advice. You are responsible for independently verifying the AI's output. We are responsible for AI inaccuracies only to the extent set out in Section 11 below.",
    es: "Las respuestas del tutor, correcciones, evaluaciones de pronunciación, ejemplos de conversación, traducciones y funciones similares dependen de modelos de IA de terceros (OpenAI GPT-4o-mini, Microsoft Azure Speech, Google Text-to-Speech). La salida de la IA (i) no se garantiza precisa y (ii) tiene fines educativos e informativos — no es asesoramiento médico, legal, financiero ni profesional. Eres responsable de verificar de forma independiente la salida. Nuestra responsabilidad por errores de la IA se rige por la Sección 11.",
    id: "Balasan tutor, koreksi, skor pengucapan, contoh percakapan, terjemahan, dan fitur serupa mengandalkan model AI pihak ketiga (OpenAI GPT-4o-mini, Microsoft Azure Speech, Google Text-to-Speech). Keluaran AI (i) tidak dijamin akurat dan (ii) disediakan hanya untuk tujuan pembelajaran dan informasi — bukan nasihat medis, hukum, finansial, atau profesional lainnya. Kamu bertanggung jawab memverifikasi sendiri keluaran AI. Tanggung jawab kami atas ketidakakuratan AI hanya sebatas yang diatur dalam Pasal 11 di bawah.",
  },

  use_h:        { ko: "6. 이용자의 의무 및 허용 범위",            en: "6. Acceptable Use",                       es: "6. Uso Aceptable",                      id: "6. Penggunaan yang Diperbolehkan" },
  use_b: {
    ko: "회원은 다음 행위를 해서는 안 됩니다.\n  - 타인의 명예를 훼손하거나 차별·혐오를 조장하는 표현을 생성하거나 게시하는 행위\n  - 미성년자 대상 유해 콘텐츠를 생성·유포하거나, 미성년자를 대상으로 한 그루밍·성적 표현을 시도하는 행위\n  - 폭력, 자해, 불법 행위를 조장하거나, 위협·괴롭힘·스토킹 목적으로 서비스를 이용하는 행위\n  - 자동화된 수단(봇·스크래퍼·크롤러)으로 서비스 데이터를 수집·복제·재배포하는 행위\n  - 서비스의 API 또는 인프라에 비정상적 부하를 야기하거나 보안을 무력화하려는 행위\n  - 회사 또는 제3자의 저작권·상표권·영업비밀을 침해하는 행위\n  - 서비스를 통해 개인정보를 위법하게 수집하거나 스팸을 전송하는 행위\n  - 본 서비스의 AI 출력을 그대로 가공·재학습 데이터로 사용하여 제3자에게 제공하는 등 OpenAI / Microsoft / Google의 사용약관을 위반하는 행위\n\n위 행위 적발 시 회사는 사전 통지 없이 서비스 이용을 제한·해지할 수 있습니다.",
    en: "You agree not to:\n  - generate, post, or share content that defames others or promotes discrimination or hate;\n  - create or distribute material that could harm minors, or attempt grooming or sexual content involving minors;\n  - encourage violence, self-harm, or other illegal acts, or use the Service to threaten, harass, or stalk anyone;\n  - scrape, crawl, or use automated means to extract, replicate, or redistribute Service data;\n  - place abnormal load on, or attempt to defeat the security of, our APIs or infrastructure;\n  - infringe the copyright, trademark, or trade-secret rights of us or anyone else;\n  - use the Service to collect personal data unlawfully or to send unsolicited messages;\n  - use AI output from the Service in a way that breaches OpenAI / Microsoft / Google policies — e.g., re-selling the output as a competing model, using it for training other models, or removing safety filters.\n\nWe may suspend or terminate accounts that breach these rules without prior notice.",
    es: "Te comprometes a no:\n  - generar, publicar o compartir contenido que difame a otros o promueva discriminación u odio;\n  - crear o distribuir material que pueda dañar a menores, ni intentar grooming o contenido sexual con menores;\n  - fomentar la violencia, la autolesión u otros actos ilegales, ni usar el Servicio para amenazar, acosar o acechar;\n  - usar medios automatizados (bots, scrapers, crawlers) para extraer, replicar o redistribuir datos del Servicio;\n  - sobrecargar o intentar vulnerar la seguridad de nuestras APIs o infraestructura;\n  - infringir derechos de autor, marcas o secretos comerciales nuestros o de terceros;\n  - recopilar datos personales de forma ilícita ni enviar mensajes no solicitados;\n  - usar la salida de la IA del Servicio infringiendo las políticas de OpenAI / Microsoft / Google — por ejemplo, revenderla como modelo competidor, usarla para entrenar otros modelos o eliminar filtros de seguridad.\n\nPodemos suspender o cancelar cuentas que infrinjan estas reglas sin previo aviso.",
    id: "Kamu setuju untuk tidak:\n  - membuat, memposting, atau membagikan konten yang mencemarkan nama baik orang lain atau mempromosikan diskriminasi atau kebencian;\n  - membuat atau menyebarkan materi yang dapat membahayakan anak, atau mencoba grooming atau konten seksual yang melibatkan anak;\n  - mendorong kekerasan, melukai diri sendiri, atau tindakan ilegal lainnya, atau menggunakan Layanan untuk mengancam, melecehkan, atau menguntit siapa pun;\n  - melakukan scraping, crawling, atau menggunakan cara otomatis untuk mengambil, menggandakan, atau menyebarkan ulang data Layanan;\n  - membebani secara tidak wajar, atau berupaya menembus keamanan, API atau infrastruktur kami;\n  - melanggar hak cipta, merek dagang, atau rahasia dagang milik kami atau pihak lain;\n  - menggunakan Layanan untuk mengumpulkan data pribadi secara melanggar hukum atau mengirim pesan yang tidak diminta;\n  - menggunakan keluaran AI dari Layanan dengan cara yang melanggar kebijakan OpenAI / Microsoft / Google — mis. menjual ulang keluaran sebagai model pesaing, memakainya untuk melatih model lain, atau menghapus filter keamanan.\n\nKami dapat menangguhkan atau menutup akun yang melanggar aturan ini tanpa pemberitahuan sebelumnya.",
  },

  ip_h:         { ko: "7. 지식재산권",                            en: "7. Intellectual Property",               es: "7. Propiedad Intelectual",              id: "7. Kekayaan Intelektual" },
  ip_b: {
    ko: "서비스에 포함된 학습 콘텐츠, 디자인, 코드, 일러스트, 상표 등은 회사 또는 정당한 권리자에게 귀속되며, 회원에게는 약관에 따라 비독점적·양도불가능·취소가능한 사용권만이 부여됩니다. 회원이 작성한 작문·녹음 등 회원 콘텐츠의 권리는 회원에게 귀속되며, 회사는 서비스 제공 목적으로 한정된 이용권만을 보유합니다. 회원은 자신이 작성한 콘텐츠가 제3자의 권리를 침해하지 않음을 보증합니다.",
    en: "All Service content, design, code, illustrations, and trademarks belong to us or our licensors. We grant you a non-exclusive, non-transferable, revocable licence to use the Service under these Terms. You keep all rights to content you create in the Service (your writing, recordings, etc.); we receive only the limited licence needed to deliver the Service to you. You warrant that your content does not infringe any third-party rights.",
    es: "Todo el contenido, diseño, código, ilustraciones y marcas del Servicio pertenecen a nosotros o a nuestros licenciantes. Te otorgamos una licencia no exclusiva, intransferible y revocable para usar el Servicio según estos Términos. Conservas los derechos sobre el contenido que crees en el Servicio (tu redacción, grabaciones, etc.); nosotros recibimos solo la licencia limitada necesaria para prestarte el Servicio. Garantizas que tu contenido no infringe derechos de terceros.",
    id: "Seluruh konten, desain, kode, ilustrasi, dan merek dagang Layanan adalah milik kami atau pemberi lisensi kami. Kami memberimu lisensi non-eksklusif, tidak dapat dipindahtangankan, dan dapat dicabut untuk menggunakan Layanan sesuai Ketentuan ini. Kamu tetap memiliki semua hak atas konten yang kamu buat di Layanan (tulisan, rekaman, dll.); kami hanya menerima lisensi terbatas yang diperlukan untuk menyediakan Layanan kepadamu. Kamu menjamin bahwa kontenmu tidak melanggar hak pihak ketiga mana pun.",
  },

  paid_h:       { ko: "8. 유료 서비스 및 청약철회 (전자상거래법)",  en: "8. Paid Plans and Right to Withdraw",  es: "8. Planes de Pago y Derecho de Desistimiento", id: "8. Paket Berbayar dan Hak Pembatalan" },
  paid_b: {
    ko: "현재 서비스는 무료로 제공되고 있으며, 향후 유료 요금제가 출시될 수 있습니다. 유료 요금제가 도입되는 경우 다음이 적용됩니다.\n\n(a) 청약철회 — 한국 「전자상거래법」 제17조에 따라, 회원은 결제일로부터 7일 이내(콘텐츠를 사용하기 시작한 부분이 있는 경우 그 부분을 제외한 미사용 분에 한해) 청약을 철회할 수 있습니다. 디지털 콘텐츠 특성상 회원이 결제 직후 즉시 사용 가능 상태에 진입한 경우에도, 회사는 사전 고지 및 \"청약철회가 제한될 수 있다\"는 동의를 받지 않은 한 청약철회를 받아들입니다.\n(b) EU/EEA 거주자는 EU 소비자권리지침 2011/83/EU에 따라 14일의 철회권을 가집니다. 단, 회원이 서비스 즉시 이용 개시에 명시적으로 동의한 경우 디지털 콘텐츠 부분에 한해 철회권이 제한될 수 있습니다.\n(c) 자동결제(구독)는 다음 결제 주기 직전까지 언제든지 해지할 수 있으며, 이미 결제된 미사용 기간에 대한 환불 정책은 결제 화면에 명시됩니다.\n(d) 환불은 결제 수단과 동일한 방법으로 영업일 기준 3~7일 내에 처리됩니다.",
    en: "The Service is currently free. We plan to introduce paid plans in the future. When paid plans launch:\n\n(a) Korean right of withdrawal — Under Article 17 of the Korean Act on Electronic Commerce, you may withdraw your purchase within 7 days of payment, except for the portion of digital content already consumed. We will accept withdrawal requests within this window unless we obtained your prior explicit consent to begin immediate consumption and clearly disclosed the loss of withdrawal rights.\n(b) EU/EEA right of withdrawal — Under the EU Consumer Rights Directive 2011/83, you have 14 days to withdraw. If you explicitly agree to immediate consumption of digital content, that right may be lost for the consumed portion.\n(c) Subscriptions may be cancelled at any time before the next billing date. Any partial-period refund policy will be displayed at the checkout.\n(d) Refunds will be issued through the original payment method within 3–7 business days.",
    es: "El Servicio es actualmente gratuito. Planeamos introducir planes de pago. Cuando se lancen:\n\n(a) Derecho de desistimiento coreano — Conforme al art. 17 de la Ley Coreana de Comercio Electrónico, puedes desistir de tu compra en los 7 días posteriores al pago, salvo por la parte del contenido digital ya consumida. Aceptaremos las solicitudes en ese plazo, salvo que hayas dado consentimiento expreso al consumo inmediato y se te haya informado claramente de la pérdida del derecho.\n(b) Derecho de desistimiento del EEE — Bajo la Directiva 2011/83/UE, tienes 14 días para desistir. Si aceptas expresamente el consumo inmediato del contenido digital, podrás perder ese derecho sobre la parte consumida.\n(c) Las suscripciones pueden cancelarse en cualquier momento antes de la siguiente fecha de facturación. La política de reembolso parcial aparecerá en la pasarela.\n(d) Los reembolsos se procesarán por el medio de pago original en 3–7 días hábiles.",
    id: "Layanan saat ini gratis. Kami berencana memperkenalkan paket berbayar di masa mendatang. Saat paket berbayar diluncurkan:\n\n(a) Hak pembatalan Korea — Berdasarkan Pasal 17 UU Perdagangan Elektronik Korea, kamu dapat membatalkan pembelianmu dalam 7 hari setelah pembayaran, kecuali untuk bagian konten digital yang sudah digunakan. Kami akan menerima permintaan pembatalan dalam tenggat ini kecuali kami telah memperoleh persetujuan tegasmu untuk mulai menggunakan konten secara langsung dan dengan jelas memberitahukan hilangnya hak pembatalan.\n(b) Hak pembatalan UE/EEA — Berdasarkan Petunjuk Hak Konsumen UE 2011/83, kamu memiliki 14 hari untuk membatalkan. Jika kamu secara tegas menyetujui penggunaan langsung konten digital, hak itu dapat hilang untuk bagian yang sudah digunakan.\n(c) Langganan dapat dibatalkan kapan saja sebelum tanggal penagihan berikutnya. Kebijakan pengembalian dana sebagian (jika ada) akan ditampilkan saat pembayaran.\n(d) Pengembalian dana akan diproses melalui metode pembayaran asli dalam 3–7 hari kerja.",
  },

  thirdparty_h: { ko: "9. 제3자 서비스",                          en: "9. Third-Party Services",                es: "9. Servicios de Terceros",              id: "9. Layanan Pihak Ketiga" },
  thirdparty_b: {
    ko: "서비스는 Supabase, OpenAI, Azure, Google Cloud, Vercel, Railway, Expo 등 제3자 인프라 위에서 운영됩니다. 회원이 본 서비스를 이용함으로써 해당 제3자 서비스 약관도 부수적으로 적용될 수 있습니다. 제3자 서비스의 장애·정책 변경으로 인한 일시적 기능 제한은 회사가 합리적으로 통제할 수 없으며, 회사는 그에 따른 책임을 본 약관에 명시된 범위 내에서만 부담합니다.",
    en: "The Service runs on third-party infrastructure including Supabase, OpenAI, Azure, Google Cloud, Vercel, Railway, and Expo. Your use of the Service may also be subject to their terms. Temporary limitations caused by outages or policy changes at those providers are outside our reasonable control; our liability for them is limited to the scope set out in these Terms.",
    es: "El Servicio se ejecuta sobre infraestructura de terceros como Supabase, OpenAI, Azure, Google Cloud, Vercel, Railway y Expo. Tu uso también puede quedar sujeto a sus términos. Las limitaciones temporales por incidencias o cambios de política de esos proveedores quedan fuera de nuestro control razonable; nuestra responsabilidad por ellas se limita a lo previsto en estos Términos.",
    id: "Layanan berjalan di atas infrastruktur pihak ketiga termasuk Supabase, OpenAI, Azure, Google Cloud, Vercel, Railway, dan Expo. Penggunaanmu atas Layanan juga dapat tunduk pada ketentuan mereka. Pembatasan sementara akibat gangguan atau perubahan kebijakan pada penyedia tersebut berada di luar kendali wajar kami; tanggung jawab kami atas hal itu terbatas pada lingkup yang diatur dalam Ketentuan ini.",
  },

  termination_h:{ ko: "10. 이용계약의 해지 및 정지",              en: "10. Termination and Suspension",         es: "10. Resolución y Suspensión",           id: "10. Pengakhiran dan Penangguhan" },
  termination_b: {
    ko: "(a) 회원의 해지 — 회원은 언제든 \"내 데이터\" 페이지의 \"계정 삭제\" 기능을 통해 이용계약을 해지할 수 있으며, 해지 즉시 모든 학습 진도·계정 정보가 영구 삭제됩니다(백업본 30일 이내 폐기).\n(b) 회사의 정지 — 회원이 본 약관, 특히 제6조(이용자의 의무)를 위반한 경우 회사는 사전 통지 후(긴급한 경우 사전 통지 없이) 서비스 이용을 일시 정지하거나 영구 해지할 수 있습니다. 해지의 효력은 해지 통지가 회원의 가입 이메일로 발송된 시점에 발생합니다.\n(c) 해지 후 의무 — 해지 사유가 회원의 위반인 경우 이미 결제된 금액은 한국법 또는 EU 법령상 환불이 강제되는 경우를 제외하고 환불되지 않습니다. 본 약관 중 책임의 제한, 분쟁 해결, 지식재산권에 관한 조항은 해지 후에도 효력을 유지합니다.",
    en: "(a) Termination by you — You may terminate this Agreement at any time by using the in-app \"Delete account\" function under \"My Data\". On deletion, your learning progress and account data are permanently removed (backups purged within 30 days).\n(b) Suspension or termination by us — If you breach these Terms, particularly Section 6 (Acceptable Use), we may suspend or terminate your account after notice (or, in urgent cases, without prior notice). Termination is effective when we send notice to your registered email.\n(c) Effect of termination — Where termination is caused by your breach, paid amounts are non-refundable except where Korean or EU law mandates a refund. Sections on Limitation of Liability, Dispute Resolution, and Intellectual Property survive termination.",
    es: "(a) Resolución por tu parte — Puedes resolver este contrato en cualquier momento usando la función \"Eliminar cuenta\" del apartado \"Mis datos\". Al eliminar, tus datos de progreso y cuenta se borran permanentemente (las copias de seguridad se purgan en 30 días).\n(b) Suspensión o resolución por nuestra parte — Si incumples estos Términos, especialmente la Sección 6 (Uso Aceptable), podremos suspender o cancelar tu cuenta tras avisarte (o, en casos urgentes, sin aviso previo). La resolución surte efecto cuando enviamos el aviso a tu correo registrado.\n(c) Efectos — Si la resolución se debe a tu incumplimiento, los importes pagados no se reembolsan salvo que la ley coreana o de la UE lo exija. Las disposiciones sobre Limitación de Responsabilidad, Resolución de Disputas y Propiedad Intelectual sobreviven a la resolución.",
    id: "(a) Pengakhiran olehmu — Kamu dapat mengakhiri Perjanjian ini kapan saja menggunakan fungsi \"Hapus akun\" di bagian \"Data Saya\". Saat dihapus, progres belajar dan data akunmu dihapus permanen (cadangan dibersihkan dalam 30 hari).\n(b) Penangguhan atau pengakhiran oleh kami — Jika kamu melanggar Ketentuan ini, terutama Pasal 6 (Penggunaan yang Diperbolehkan), kami dapat menangguhkan atau menutup akunmu setelah pemberitahuan (atau, dalam kasus mendesak, tanpa pemberitahuan sebelumnya). Pengakhiran berlaku saat kami mengirim pemberitahuan ke email terdaftarmu.\n(c) Akibat pengakhiran — Jika pengakhiran disebabkan oleh pelanggaranmu, jumlah yang sudah dibayarkan tidak dapat dikembalikan kecuali hukum Korea atau UE mewajibkan pengembalian. Pasal tentang Pembatasan Tanggung Jawab, Penyelesaian Sengketa, dan Kekayaan Intelektual tetap berlaku setelah pengakhiran.",
  },

  liability_h:  { ko: "11. 책임의 제한 및 면책",                  en: "11. Limitation of Liability",            es: "11. Limitación de Responsabilidad",     id: "11. Pembatasan Tanggung Jawab" },
  liability_b: {
    ko: "법령이 강행적으로 책임을 인정하는 경우(회사의 고의 또는 중과실, 「제조물책임법」, 한국 소비자 권리 또는 EU 소비자 보호 법령상 면제할 수 없는 권리)를 제외하고 다음이 적용됩니다.\n  - 서비스는 \"있는 그대로\" 제공되며, 회사는 특정 목적 적합성, 상품성, 비침해성 등에 관한 일체의 묵시적 보증을 부인합니다.\n  - 회사는 간접손해, 특별손해, 결과적 손해, 일실이익, 데이터 손실에 대하여 책임을 부담하지 않습니다.\n  - 회사의 전체 책임 한도는, 본 서비스가 무료로 제공되는 동안은 한화 5만 원(KRW 50,000)이며, 유료 결제를 한 회원에 대해서는 직전 12개월간 회원이 회사에 지불한 금액을 한도로 합니다.\n\n위 제한은 한국 「약관의 규제에 관한 법률」 제7조 및 EU 소비자 법령상 면제할 수 없는 회사의 책임을 제한하지 않습니다.",
    en: "Except for liability that cannot be limited by law (our wilful misconduct or gross negligence, the Korean Product Liability Act, consumer rights that cannot be waived under Korean or EU law):\n  - the Service is provided \"as is\" and we disclaim all implied warranties of fitness for a particular purpose, merchantability, and non-infringement;\n  - we are not liable for indirect, special, consequential, or punitive damages, lost profits, or data loss;\n  - our total liability is capped at KRW 50,000 while the Service is free, and for paying users, at the amount you paid to us in the preceding 12 months.\n\nThese limits do not restrict any liability we cannot limit under Article 7 of the Korean Act on the Regulation of Standardized Contracts or under non-waivable EU consumer law.",
    es: "Salvo la responsabilidad que la ley no permita limitar (dolo o culpa grave nuestra, Ley Coreana de Responsabilidad del Producto y derechos de consumidor irrenunciables bajo la ley coreana o de la UE):\n  - el Servicio se ofrece \"tal cual\" y rechazamos toda garantía implícita de idoneidad para un fin concreto, comerciabilidad y no infracción;\n  - no responderemos por daños indirectos, especiales, consecuenciales o punitivos, lucro cesante ni pérdida de datos;\n  - nuestra responsabilidad total se limita a 50 000 KRW mientras el Servicio sea gratuito y, para usuarios de pago, al importe abonado en los últimos 12 meses.\n\nEstos límites no restringen las responsabilidades que no podamos limitar bajo el art. 7 de la Ley Coreana de Contratos Estandarizados ni bajo el derecho de consumo no renunciable del EEE.",
    id: "Kecuali tanggung jawab yang tidak dapat dibatasi oleh hukum (kesengajaan atau kelalaian berat kami, UU Tanggung Jawab Produk Korea, hak konsumen yang tidak dapat dikesampingkan berdasarkan hukum Korea atau UE):\n  - Layanan disediakan \"apa adanya\" dan kami menyangkal semua jaminan tersirat atas kesesuaian untuk tujuan tertentu, kelayakan jual, dan tidak melanggar hak;\n  - kami tidak bertanggung jawab atas kerugian tidak langsung, khusus, konsekuensial, atau punitif, kehilangan keuntungan, atau kehilangan data;\n  - total tanggung jawab kami dibatasi hingga KRW 50.000 selama Layanan gratis, dan untuk pengguna berbayar, sebesar jumlah yang kamu bayarkan kepada kami dalam 12 bulan terakhir.\n\nBatasan ini tidak membatasi tanggung jawab apa pun yang tidak dapat kami batasi berdasarkan Pasal 7 UU Pengaturan Kontrak Baku Korea atau berdasarkan hukum konsumen UE yang tidak dapat dikesampingkan.",
  },

  indem_h:      { ko: "12. 면책 보장",                            en: "12. Indemnity",                          es: "12. Indemnidad",                        id: "12. Ganti Rugi" },
  indem_b: {
    ko: "회원은 회원의 본 약관 위반, 회원이 게시한 콘텐츠, 회원의 위법 행위로부터 발생하는 청구·손해·비용에 대하여 회사를 보호할 의무를 부담합니다. 단, 본 조항은 한국 또는 EU 소비자 법령에 따라 소비자에게 인정될 수 없는 의무를 부과하지 않습니다.",
    en: "You will defend and indemnify us from claims, damages, and costs arising from your breach of these Terms, your content, or your unlawful conduct — to the extent this obligation may lawfully be imposed on a consumer under Korean and EU consumer-protection law.",
    es: "Defenderás e indemnizarás a LinguaAI frente a reclamaciones, daños y costes derivados de tu incumplimiento de estos Términos, tu contenido o tu conducta ilícita — en la medida en que esta obligación pueda imponerse legalmente a un consumidor bajo la legislación coreana y de la UE.",
    id: "Kamu akan membela dan memberi ganti rugi kepada LinguaAI atas klaim, kerugian, dan biaya yang timbul dari pelanggaranmu atas Ketentuan ini, kontenmu, atau tindakanmu yang melanggar hukum — sejauh kewajiban ini dapat dibebankan secara sah kepada konsumen berdasarkan hukum perlindungan konsumen Korea dan UE.",
  },

  modify_h:     { ko: "13. 약관의 변경",                          en: "13. Changes to these Terms",             es: "13. Cambios en estos Términos",         id: "13. Perubahan Ketentuan Ini" },
  modify_b: {
    ko: "회사는 법령 변경, 서비스 개선, 보안상 필요 등에 따라 약관을 변경할 수 있으며, 변경 시 시행일 7일 전(중대 변경 또는 회원에 불리한 변경의 경우 30일 전)까지 앱 내 공지 및 가입 이메일을 통해 안내합니다. 회원이 변경된 약관에 동의하지 않을 경우 시행 전 계정을 해지할 수 있으며, 시행일 후에도 서비스를 계속 이용하는 경우 변경에 동의한 것으로 간주됩니다.",
    en: "We may amend these Terms because of legal changes, product improvements, or security needs. We will give notice in-app and by email at least 7 days before the change takes effect (30 days for material or adverse changes). If you do not accept the new Terms, you may close your account before the change takes effect; continued use after the effective date is acceptance.",
    es: "Podremos modificar estos Términos por cambios legales, mejoras del producto o por motivos de seguridad. Avisaremos en la app y por correo al menos 7 días antes (30 días para cambios sustanciales o desfavorables). Si no aceptas los nuevos Términos, puedes cerrar tu cuenta antes de la fecha efectiva; el uso continuado tras esa fecha implica aceptación.",
    id: "Kami dapat mengubah Ketentuan ini karena perubahan hukum, peningkatan produk, atau kebutuhan keamanan. Kami akan memberi tahu di dalam aplikasi dan lewat email setidaknya 7 hari sebelum perubahan berlaku (30 hari untuk perubahan material atau yang merugikan). Jika kamu tidak menerima Ketentuan baru, kamu dapat menutup akunmu sebelum tanggal berlaku; melanjutkan penggunaan setelah tanggal tersebut berarti menerima.",
  },

  law_h:        { ko: "14. 준거법 및 분쟁 해결",                  en: "14. Governing Law and Disputes",         es: "14. Ley Aplicable y Disputas",          id: "14. Hukum yang Mengatur dan Sengketa" },
  law_b: {
    ko: "본 약관 및 회사와 회원 간의 관계는 대한민국 법률에 따라 규율되며, 본 약관 또는 서비스와 관련하여 발생한 분쟁은 회원의 주소지를 관할하는 법원 또는 서울중앙지방법원을 전속 관할 법원으로 합니다. EU/EEA 거주자에 대해서는 회원의 일상 거소지의 강행 소비자 보호 규정이 우선 적용되며, 회원은 거주지 법원에서 소송을 제기할 수 있습니다. 한국법상 「전자상거래법」, 「소비자기본법」 등에 따른 분쟁 조정 신청 권리는 영향을 받지 않습니다.",
    en: "These Terms and the relationship between you and us are governed by the laws of the Republic of Korea. Disputes arising out of these Terms or the Service will be exclusively heard by the court having jurisdiction over your address or, in its absence, by the Seoul Central District Court. For users in the EU/EEA, mandatory consumer-protection rules of your country of habitual residence apply on top of Korean law, and you may bring proceedings in the courts of your residence. Nothing here limits your right to file a dispute with Korean consumer-protection bodies under the Act on Electronic Commerce or the Framework Act on Consumers.",
    es: "Estos Términos y la relación entre tú y nosotros se rigen por la ley de la República de Corea. Las disputas serán conocidas exclusivamente por el tribunal del domicilio del usuario o, en su defecto, por el Tribunal del Distrito Central de Seúl. Para los usuarios del EEE, se aplican adicionalmente las normas imperativas de protección al consumidor de tu país de residencia habitual y podrás demandar ante tus tribunales locales. Nada de lo anterior limita tu derecho a presentar disputas ante los organismos coreanos de protección al consumidor.",
    id: "Ketentuan ini dan hubungan antara kamu dan kami diatur oleh hukum Republik Korea. Sengketa yang timbul dari Ketentuan ini atau Layanan akan diadili secara eksklusif oleh pengadilan yang berwenang atas alamatmu atau, jika tidak ada, oleh Pengadilan Distrik Pusat Seoul. Untuk pengguna di UE/EEA, aturan perlindungan konsumen yang bersifat wajib di negara tempat tinggalmu berlaku sebagai tambahan atas hukum Korea, dan kamu dapat mengajukan gugatan di pengadilan tempat tinggalmu. Tidak ada hal di sini yang membatasi hakmu untuk mengajukan sengketa ke badan perlindungan konsumen Korea.",
  },

  misc_h:       { ko: "15. 기타",                                 en: "15. Miscellaneous",                      es: "15. Disposiciones Generales",           id: "15. Ketentuan Lain-Lain" },
  misc_b: {
    ko: "본 약관의 일부 조항이 무효 또는 집행 불가능하다고 판단되더라도 나머지 조항은 그대로 효력을 유지합니다. 약관과 개인정보처리방침이 충돌하는 경우, 개인정보 처리에 관한 사항은 개인정보처리방침이 우선합니다. 회사가 본 약관상 권리를 즉시 행사하지 않더라도 권리 포기로 간주되지 않습니다.",
    en: "If any provision is held invalid or unenforceable, the remaining provisions stay in effect. If these Terms and the Privacy Policy conflict on data-processing matters, the Privacy Policy prevails. Our failure to enforce a right immediately is not a waiver.",
    es: "Si alguna disposición se declara inválida o inejecutable, las demás permanecen vigentes. Si estos Términos y la Política de Privacidad se contradicen en materia de tratamiento de datos, prevalece la Política de Privacidad. Que no hagamos valer un derecho de inmediato no implica renuncia.",
    id: "Jika ada ketentuan yang dinyatakan tidak sah atau tidak dapat dilaksanakan, ketentuan lainnya tetap berlaku. Jika Ketentuan ini dan Kebijakan Privasi bertentangan dalam hal pemrosesan data, Kebijakan Privasi yang berlaku. Kegagalan kami menegakkan suatu hak dengan segera bukan berarti pelepasan hak.",
  },

  contact_h:    { ko: "16. 문의",                                 en: "16. Contact",                            es: "16. Contacto",                          id: "16. Kontak" },
  contact_b: {
    ko: "본 약관에 관한 문의는 privacy@linguaai.example 로 보내 주세요. (출시 전 실제 운영 이메일로 교체될 예정입니다.)",
    en: "Questions about these Terms? Email privacy@linguaai.example. (Placeholder — to be replaced with our live address before launch.)",
    es: "¿Dudas sobre estos Términos? Escribe a privacy@linguaai.example. (Dirección provisional, a sustituir antes del lanzamiento.)",
    id: "Ada pertanyaan tentang Ketentuan ini? Email ke privacy@linguaai.example. (Alamat sementara — akan diganti dengan alamat resmi kami sebelum peluncuran.)",
  },
};

function t(obj: Record<LangKey, string>, lang: LangKey): string {
  return obj[lang] ?? obj.en;
}

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nativeLanguage: nativeLang } = useLanguage();
  const defaultLc: LangKey =
    nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : nativeLang === "indonesian" ? "id" : "en";
  const [lc, setLc] = useState<LangKey>(defaultLc);

  const sections: [keyof typeof T, keyof typeof T][] = [
    ["intro_h",        "intro_b"],
    ["account_h",      "account_b"],
    ["age_h",          "age_b"],
    ["service_h",      "service_b"],
    ["ai_h",           "ai_b"],
    ["use_h",          "use_b"],
    ["ip_h",           "ip_b"],
    ["paid_h",         "paid_b"],
    ["thirdparty_h",   "thirdparty_b"],
    ["termination_h",  "termination_b"],
    ["liability_h",    "liability_b"],
    ["indem_h",        "indem_b"],
    ["modify_h",       "modify_b"],
    ["law_h",          "law_b"],
    ["misc_h",         "misc_b"],
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
