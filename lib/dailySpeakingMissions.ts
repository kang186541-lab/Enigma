import type { LearningGoal } from "@/lib/learnerProfile";

export type DailySpeakingLanguage = "korean" | "english" | "spanish" | "indonesian";

export type DailySpeakingPhrase = {
  phrase: string;
  ipa: string;
  // Indonesian (BETA) target content does not always carry every native-language
  // meaning, so this is Partial. Accessors fall back through the available keys.
  meanings: Partial<Record<DailySpeakingLanguage, string>>;
  level: "A1";
  speechLang: "ko-KR" | "en-US" | "es-ES" | "id-ID";
  tip: string;
  practiceContext?: LearningGoal;
  contextTip?: string;
};

type RawDailyPhrase = {
  word: string;
  ipa: string;
  meaning: string;
  meaningEs: string;
  speechLang: DailySpeakingPhrase["speechLang"];
  tip: string;
  // Indonesian (BETA) target phrases carry both the explicit English and the
  // Indonesian self-meaning, because an Indonesian TARGET word needs ko/en/es
  // glosses (meaning=ko, meaningEs=es) plus its own Indonesian text for an
  // Indonesian-native learner. These are unused by the 3 core languages.
  meaningEn?: string;
  meaningId?: string;
};

// These data maps are Partial so Indonesian (BETA) can ship a starter set
// without forcing a full per-goal corpus. Accessors fall back to the language's
// own DEFAULT pack (never to English) when a specific goal pack is missing.
const DAILY_SPEAKING_PACKS: Partial<Record<DailySpeakingLanguage, Partial<Record<LearningGoal | "default", RawDailyPhrase[]>>>> = {
  korean: {
    default: [
      { word: "안녕하세요", ipa: "/an.njʌŋ.ha.se.jo/", meaning: "Hello", meaningEs: "Hola", speechLang: "ko-KR", tip: "A real first greeting. Keep each syllable even and gentle." },
      { word: "감사합니다", ipa: "/kam.sa.ham.ni.da/", meaning: "Thank you", meaningEs: "Gracias", speechLang: "ko-KR", tip: "Say all five syllables evenly: gam-sa-ham-ni-da." },
      { word: "이해 못 했어요.", ipa: "/i.hɛ mot hɛ.sʌ.jo/", meaning: "I did not understand.", meaningEs: "No entendí.", speechLang: "ko-KR", tip: "A useful repair sentence. Keep 못 short and clear." },
      { word: "다시 말해 주세요.", ipa: "/ta.ɕi ma.ɾɛ dʑu.se.jo/", meaning: "Please say it again.", meaningEs: "Dilo otra vez, por favor.", speechLang: "ko-KR", tip: "Link 말해 주세요 as one polite request." },
    ],
    travel: [
      { word: "화장실 어디예요?", ipa: "/hwa.dʑaŋ.ɕil ʌ.di.je.jo/", meaning: "Where is the bathroom?", meaningEs: "¿Dónde está el baño?", speechLang: "ko-KR", tip: "Say it as one helpful question. Let the pitch rise at the end." },
      { word: "얼마예요?", ipa: "/ʌl.ma.je.jo/", meaning: "How much is it?", meaningEs: "¿Cuánto cuesta?", speechLang: "ko-KR", tip: "Raise pitch at the end to signal a question." },
      { word: "도와주세요.", ipa: "/to.wa.dʑu.se.jo/", meaning: "Please help me.", meaningEs: "Ayúdame, por favor.", speechLang: "ko-KR", tip: "The 와 smoothly follows 도. Link them together." },
      { word: "물 주세요.", ipa: "/mul dʑu.se.jo/", meaning: "Water, please.", meaningEs: "Agua, por favor.", speechLang: "ko-KR", tip: "A real survival request. Keep 주세요 polite and smooth." },
    ],
    work: [
      { word: "다시 말해 주세요.", ipa: "/ta.ɕi ma.ɾɛ dʑu.se.jo/", meaning: "Please say it again.", meaningEs: "Repítelo, por favor.", speechLang: "ko-KR", tip: "A useful meeting repair phrase. Say it calmly." },
      { word: "이해 못 했어요.", ipa: "/i.hɛ mot hɛ.sʌ.jo/", meaning: "I did not understand.", meaningEs: "No entendí.", speechLang: "ko-KR", tip: "It is okay to ask for help. Keep 못 short." },
      { word: "감사합니다", ipa: "/kam.sa.ham.ni.da/", meaning: "Thank you", meaningEs: "Gracias", speechLang: "ko-KR", tip: "End politely and clearly." },
      { word: "도와주세요.", ipa: "/to.wa.dʑu.se.jo/", meaning: "Please help me.", meaningEs: "Ayúdame, por favor.", speechLang: "ko-KR", tip: "A real workplace survival phrase. Keep it calm and polite." },
    ],
    study: [
      { word: "이해 못 했어요.", ipa: "/i.hɛ mot hɛ.sʌ.jo/", meaning: "I did not understand.", meaningEs: "No entendí.", speechLang: "ko-KR", tip: "A classroom survival sentence. Say it without fear." },
      { word: "다시 말해 주세요.", ipa: "/ta.ɕi ma.ɾɛ dʑu.se.jo/", meaning: "Please say it again.", meaningEs: "Repítelo, por favor.", speechLang: "ko-KR", tip: "Link 말해 주세요 naturally." },
      { word: "감사합니다", ipa: "/kam.sa.ham.ni.da/", meaning: "Thank you", meaningEs: "Gracias", speechLang: "ko-KR", tip: "Say all syllables evenly." },
      { word: "도와주세요.", ipa: "/to.wa.dʑu.se.jo/", meaning: "Please help me.", meaningEs: "Ayúdame, por favor.", speechLang: "ko-KR", tip: "Ask for help before you freeze." },
    ],
    hobby: [
      { word: "음악 좋아해요.", ipa: "/ɯ.mak tɕo.a.hɛ.jo/", meaning: "I like music.", meaningEs: "Me gusta la música.", speechLang: "ko-KR", tip: "Link 좋아해요 naturally: jo-a-hae-yo." },
      { word: "좋아요.", ipa: "/tɕo.a.jo/", meaning: "I like it.", meaningEs: "Me gusta.", speechLang: "ko-KR", tip: "A tiny sentence you can use everywhere." },
      { word: "다시 말해 주세요.", ipa: "/ta.ɕi ma.ɾɛ dʑu.se.jo/", meaning: "Please say it again.", meaningEs: "Dilo otra vez, por favor.", speechLang: "ko-KR", tip: "Use this when lyrics or dialogue are too fast." },
      { word: "이해 못 했어요.", ipa: "/i.hɛ mot hɛ.sʌ.jo/", meaning: "I did not understand.", meaningEs: "No entendí.", speechLang: "ko-KR", tip: "Repair the conversation without switching languages." },
    ],
    relationship: [
      { word: "반갑습니다.", ipa: "/pan.gap.sɯm.ni.da/", meaning: "Nice to meet you.", meaningEs: "Mucho gusto.", speechLang: "ko-KR", tip: "A warm first-meeting sentence. Let 습니다 finish softly." },
      { word: "감사합니다", ipa: "/kam.sa.ham.ni.da/", meaning: "Thank you", meaningEs: "Gracias", speechLang: "ko-KR", tip: "A relationship-saving sentence. Say it often." },
      { word: "죄송합니다", ipa: "/tɕø.soŋ.ham.ni.da/", meaning: "I am sorry.", meaningEs: "Lo siento.", speechLang: "ko-KR", tip: "Keep the 죄 vowel rounded and gentle." },
      { word: "다시 말해 주세요.", ipa: "/ta.ɕi ma.ɾɛ dʑu.se.jo/", meaning: "Please say it again.", meaningEs: "Dilo otra vez, por favor.", speechLang: "ko-KR", tip: "Asking again keeps the conversation alive." },
    ],
    exam: [
      { word: "시험이 언제예요?", ipa: "/si.hʌ.mi ʌn.dʑe.je.jo/", meaning: "When is the exam?", meaningEs: "¿Cuándo es el examen?", speechLang: "ko-KR", tip: "A practical test-day question. Let the pitch rise at the end." },
      { word: "질문 있어요.", ipa: "/tɕil.mun i.sʌ.jo/", meaning: "I have a question.", meaningEs: "Tengo una pregunta.", speechLang: "ko-KR", tip: "A real classroom sentence. Say it before you freeze." },
      { word: "다시 설명해 주세요.", ipa: "/ta.ɕi sʌl.mjʌŋ.hɛ dʑu.se.jo/", meaning: "Please explain again.", meaningEs: "Explícalo otra vez, por favor.", speechLang: "ko-KR", tip: "Link 설명해 주세요 as one polite request." },
      { word: "준비됐어요.", ipa: "/tɕun.bi.dwɛ.sʌ.jo/", meaning: "I am ready.", meaningEs: "Estoy listo.", speechLang: "ko-KR", tip: "Short and useful before a speaking task." },
    ],
  },
  english: {
    default: [
      { word: "Hello", ipa: "/həˈloʊ/", meaning: "안녕하세요", meaningEs: "Hola", speechLang: "en-US", tip: "Stress the second syllable: heh-LO." },
      { word: "Thank you.", ipa: "/θæŋk juː/", meaning: "감사합니다.", meaningEs: "Gracias.", speechLang: "en-US", tip: "Keep the TH soft and the final you clear." },
      { word: "I don't understand.", ipa: "/aɪ doʊnt ˌʌn.dərˈstænd/", meaning: "이해 못 했어요.", meaningEs: "No entiendo.", speechLang: "en-US", tip: "A real repair sentence. Do not rush understand." },
      { word: "Can you say that again?", ipa: "/kæn juː seɪ ðæt əˈɡen/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "¿Puedes repetirlo?", speechLang: "en-US", tip: "Link can-you softly, then slow down on again." },
    ],
    travel: [
      { word: "Where is the bathroom?", ipa: "/wɛr ɪz ðə ˈbæθ.ruːm/", meaning: "화장실이 어디예요?", meaningEs: "¿Dónde está el baño?", speechLang: "en-US", tip: "Keep it practical. Link 'where is' smoothly." },
      { word: "How much is it?", ipa: "/haʊ mʌtʃ ɪz ɪt/", meaning: "얼마예요?", meaningEs: "¿Cuánto cuesta?", speechLang: "en-US", tip: "One quick shopping question. Keep much short." },
      { word: "Please help me.", ipa: "/pliːz hɛlp miː/", meaning: "도와주세요.", meaningEs: "Ayúdame, por favor.", speechLang: "en-US", tip: "Slow and clear is best in an emergency." },
      { word: "I need water.", ipa: "/aɪ niːd ˈwɔː.tər/", meaning: "물이 필요해요.", meaningEs: "Necesito agua.", speechLang: "en-US", tip: "A survival sentence. Make need strong and clear." },
    ],
    work: [
      { word: "Can you say that again?", ipa: "/kæn juː seɪ ðæt əˈɡen/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "¿Puedes repetirlo?", speechLang: "en-US", tip: "Useful in meetings. Say it calmly." },
      { word: "I don't understand.", ipa: "/aɪ doʊnt ˌʌn.dərˈstænd/", meaning: "이해 못 했어요.", meaningEs: "No entiendo.", speechLang: "en-US", tip: "A safe repair phrase. It keeps the conversation moving." },
      { word: "Thank you.", ipa: "/θæŋk juː/", meaning: "감사합니다.", meaningEs: "Gracias.", speechLang: "en-US", tip: "Short, real, and useful every day." },
      { word: "Please help me.", ipa: "/pliːz hɛlp miː/", meaning: "도와주세요.", meaningEs: "Ayúdame, por favor.", speechLang: "en-US", tip: "Slow and clear works best when you need support." },
    ],
    study: [
      { word: "I don't understand.", ipa: "/aɪ doʊnt ˌʌn.dərˈstænd/", meaning: "이해 못 했어요.", meaningEs: "No entiendo.", speechLang: "en-US", tip: "Say it before panic. It is a learning sentence." },
      { word: "Can you say that again?", ipa: "/kæn juː seɪ ðæt əˈɡen/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "¿Puedes repetirlo?", speechLang: "en-US", tip: "A classroom survival phrase." },
      { word: "Thank you.", ipa: "/θæŋk juː/", meaning: "감사합니다.", meaningEs: "Gracias.", speechLang: "en-US", tip: "End the exchange politely." },
      { word: "Please help me.", ipa: "/pliːz hɛlp miː/", meaning: "도와주세요.", meaningEs: "Ayúdame, por favor.", speechLang: "en-US", tip: "Ask for help before you freeze." },
    ],
    hobby: [
      { word: "I like music.", ipa: "/aɪ laɪk ˈmjuː.zɪk/", meaning: "저는 음악을 좋아해요.", meaningEs: "Me gusta la música.", speechLang: "en-US", tip: "Short and useful. Make 'like' clear but relaxed." },
      { word: "I like it.", ipa: "/aɪ laɪk ɪt/", meaning: "마음에 들어요.", meaningEs: "Me gusta.", speechLang: "en-US", tip: "A tiny opinion sentence you can use anywhere." },
      { word: "Can you say that again?", ipa: "/kæn juː seɪ ðæt əˈɡen/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "¿Puedes repetirlo?", speechLang: "en-US", tip: "Use it with songs, shows, and fast speech." },
      { word: "I don't understand.", ipa: "/aɪ doʊnt ˌʌn.dərˈstænd/", meaning: "이해 못 했어요.", meaningEs: "No entiendo.", speechLang: "en-US", tip: "A useful sentence when subtitles disappear." },
    ],
    relationship: [
      { word: "Nice to meet you.", ipa: "/naɪs tə miːt juː/", meaning: "반갑습니다.", meaningEs: "Mucho gusto.", speechLang: "en-US", tip: "Say it warmly as one phrase: nice-tuh-meet-you." },
      { word: "Thank you.", ipa: "/θæŋk juː/", meaning: "감사합니다.", meaningEs: "Gracias.", speechLang: "en-US", tip: "Gratitude keeps a conversation warm." },
      { word: "I'm sorry.", ipa: "/aɪm ˈsɑː.ri/", meaning: "미안해요.", meaningEs: "Lo siento.", speechLang: "en-US", tip: "Keep sorry soft and sincere." },
      { word: "Can you say that again?", ipa: "/kæn juː seɪ ðæt əˈɡen/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "¿Puedes repetirlo?", speechLang: "en-US", tip: "Asking again is part of real conversation." },
    ],
    exam: [
      { word: "When is the exam?", ipa: "/wen ɪz ði ɪgˈzæm/", meaning: "시험이 언제예요?", meaningEs: "¿Cuándo es el examen?", speechLang: "en-US", tip: "A real scheduling question. Stress exam at the end." },
      { word: "I have a question.", ipa: "/aɪ hæv ə ˈkwes.tʃən/", meaning: "질문 있어요.", meaningEs: "Tengo una pregunta.", speechLang: "en-US", tip: "Say it calmly before you get stuck." },
      { word: "Please explain again.", ipa: "/pliːz ɪkˈspleɪn əˈgen/", meaning: "다시 설명해 주세요.", meaningEs: "Explícalo otra vez, por favor.", speechLang: "en-US", tip: "Keep please soft, then slow down on explain." },
      { word: "I'm ready.", ipa: "/aɪm ˈred.i/", meaning: "준비됐어요.", meaningEs: "Estoy listo.", speechLang: "en-US", tip: "A short confidence sentence before a test." },
    ],
  },
  spanish: {
    default: [
      { word: "Hola", ipa: "/ˈo.la/", meaning: "안녕하세요", meaningEs: "Hello", speechLang: "es-ES", tip: "The 'h' is silent in Spanish." },
      { word: "Gracias.", ipa: "/ˈɡɾa.sjas/", meaning: "감사합니다.", meaningEs: "Thank you.", speechLang: "es-ES", tip: "Tap the r lightly, then keep the vowels clean." },
      { word: "No entiendo.", ipa: "/no enˈtjen.do/", meaning: "이해 못 했어요.", meaningEs: "I don't understand.", speechLang: "es-ES", tip: "A real repair sentence. Stress TIE in entiendo." },
      { word: "¿Puedes repetirlo?", ipa: "/ˈpwe.des re.peˈtir.lo/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "Can you say that again?", speechLang: "es-ES", tip: "A useful sentence when speech is too fast." },
    ],
    travel: [
      { word: "¿Dónde está el baño?", ipa: "/ˈdon.de esˈta el ˈba.ɲo/", meaning: "화장실이 어디예요?", meaningEs: "Where is the bathroom?", speechLang: "es-ES", tip: "A real travel sentence. Keep the vowels clean and short." },
      { word: "¿Cuánto cuesta?", ipa: "/ˈkwan.to ˈkwes.ta/", meaning: "얼마예요?", meaningEs: "How much is it?", speechLang: "es-ES", tip: "A shopping survival question. Keep cuesta crisp." },
      { word: "Ayúdame, por favor.", ipa: "/aˈʝu.ða.me poɾ faˈβoɾ/", meaning: "도와주세요.", meaningEs: "Please help me.", speechLang: "es-ES", tip: "Say it slowly and clearly. It is a real emergency phrase." },
      { word: "Necesito agua.", ipa: "/ne.θeˈsi.to ˈa.ɣwa/", meaning: "물이 필요해요.", meaningEs: "I need water.", speechLang: "es-ES", tip: "Keep agua in two smooth syllables: a-gua." },
    ],
    work: [
      { word: "¿Puedes repetirlo?", ipa: "/ˈpwe.des re.peˈtir.lo/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "Can you say that again?", speechLang: "es-ES", tip: "Useful in meetings. Stress TIR in repetirlo." },
      { word: "No entiendo.", ipa: "/no enˈtjen.do/", meaning: "이해 못 했어요.", meaningEs: "I don't understand.", speechLang: "es-ES", tip: "A safe repair phrase. Say it before you freeze." },
      { word: "Gracias.", ipa: "/ˈɡɾa.sjas/", meaning: "감사합니다.", meaningEs: "Thank you.", speechLang: "es-ES", tip: "Short, real, and useful every day." },
      { word: "Ayúdame, por favor.", ipa: "/aˈʝu.ða.me poɾ faˈβoɾ/", meaning: "도와주세요.", meaningEs: "Please help me.", speechLang: "es-ES", tip: "A real support request. Say it slowly and clearly." },
    ],
    study: [
      { word: "No entiendo.", ipa: "/no enˈtjen.do/", meaning: "이해 못 했어요.", meaningEs: "I don't understand.", speechLang: "es-ES", tip: "This sentence keeps learning moving." },
      { word: "¿Puedes repetirlo?", ipa: "/ˈpwe.des re.peˈtir.lo/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "Can you say that again?", speechLang: "es-ES", tip: "A classroom survival phrase." },
      { word: "Gracias.", ipa: "/ˈɡɾa.sjas/", meaning: "감사합니다.", meaningEs: "Thank you.", speechLang: "es-ES", tip: "End the exchange politely." },
      { word: "Ayúdame, por favor.", ipa: "/aˈʝu.ða.me poɾ faˈβoɾ/", meaning: "도와주세요.", meaningEs: "Please help me.", speechLang: "es-ES", tip: "Ask for help before you freeze." },
    ],
    hobby: [
      { word: "Me gusta la música.", ipa: "/me ˈɡus.ta la ˈmu.si.ka/", meaning: "저는 음악을 좋아해요.", meaningEs: "I like music.", speechLang: "es-ES", tip: "Stress MÚ-si-ca. Keep 'me gusta' connected." },
      { word: "Me gusta.", ipa: "/me ˈɡus.ta/", meaning: "마음에 들어요.", meaningEs: "I like it.", speechLang: "es-ES", tip: "A tiny opinion sentence you can use everywhere." },
      { word: "¿Puedes repetirlo?", ipa: "/ˈpwe.des re.peˈtir.lo/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "Can you say that again?", speechLang: "es-ES", tip: "Use it with songs, shows, and fast speech." },
      { word: "No entiendo.", ipa: "/no enˈtjen.do/", meaning: "이해 못 했어요.", meaningEs: "I don't understand.", speechLang: "es-ES", tip: "A useful sentence when subtitles disappear." },
    ],
    relationship: [
      { word: "Mucho gusto.", ipa: "/ˈmu.tʃo ˈɡus.to/", meaning: "반갑습니다.", meaningEs: "Nice to meet you.", speechLang: "es-ES", tip: "Two clean words. Say it like a friendly greeting." },
      { word: "Gracias.", ipa: "/ˈɡɾa.sjas/", meaning: "감사합니다.", meaningEs: "Thank you.", speechLang: "es-ES", tip: "Gratitude keeps a conversation warm." },
      { word: "Lo siento.", ipa: "/lo ˈsjen.to/", meaning: "미안해요.", meaningEs: "I'm sorry.", speechLang: "es-ES", tip: "Keep siento soft and sincere." },
      { word: "¿Puedes repetirlo?", ipa: "/ˈpwe.des re.peˈtir.lo/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "Can you say that again?", speechLang: "es-ES", tip: "Asking again is part of real conversation." },
    ],
    exam: [
      { word: "¿Cuándo es el examen?", ipa: "/ˈkwan.do es el ekˈsa.men/", meaning: "시험이 언제예요?", meaningEs: "When is the exam?", speechLang: "es-ES", tip: "A real scheduling question. Keep examen clean and even." },
      { word: "Tengo una pregunta.", ipa: "/ˈteŋ.go ˈu.na pɾeˈɣun.ta/", meaning: "질문 있어요.", meaningEs: "I have a question.", speechLang: "es-ES", tip: "Stress GUN in pregunta." },
      { word: "Explícalo otra vez, por favor.", ipa: "/eksˈpli.ka.lo ˈo.tɾa βes poɾ faˈβoɾ/", meaning: "다시 설명해 주세요.", meaningEs: "Please explain again.", speechLang: "es-ES", tip: "Long but useful. Break it into two breaths if needed." },
      { word: "Estoy listo.", ipa: "/esˈtoj ˈlis.to/", meaning: "준비됐어요.", meaningEs: "I am ready.", speechLang: "es-ES", tip: "A short confidence sentence before a test." },
    ],
  },
  // ── Indonesian (BETA) starter packs ──────────────────────────────────────
  // A solid A1 starter set so the Home CTA and the first Speak mission work in
  // Indonesian. Goals without a specific pack fall back to `default` (Indonesian),
  // never to English. The full per-goal corpus is a separate follow-on.
  // For Indonesian TARGET phrases: word = Indonesian (spoken), meaning = Korean,
  // meaningEn = English, meaningEs = Spanish, meaningId = Indonesian self.
  indonesian: {
    default: [
      { word: "Halo", ipa: "/ˈha.lo/", meaning: "안녕하세요", meaningEn: "Hello", meaningEs: "Hola", meaningId: "Halo", speechLang: "id-ID", tip: "A friendly all-purpose greeting. Two even syllables: HA-lo." },
      { word: "Terima kasih.", ipa: "/təˈri.ma ˈka.sih/", meaning: "감사합니다.", meaningEn: "Thank you.", meaningEs: "Gracias.", meaningId: "Terima kasih.", speechLang: "id-ID", tip: "Say all four syllables evenly: te-ri-ma-ka-sih." },
      { word: "Saya tidak mengerti.", ipa: "/ˈsa.ja ˈti.daʔ məˈŋər.ti/", meaning: "이해 못 했어요.", meaningEn: "I don't understand.", meaningEs: "No entiendo.", meaningId: "Saya tidak mengerti.", speechLang: "id-ID", tip: "A real repair sentence. Keep tidak short and clear." },
      { word: "Tolong ulangi.", ipa: "/ˈto.loŋ uˈla.ŋi/", meaning: "다시 말해 주세요.", meaningEn: "Please repeat that.", meaningEs: "Repítelo, por favor.", meaningId: "Tolong ulangi.", speechLang: "id-ID", tip: "Tolong = please. Use it to ask for a repeat." },
      { word: "Selamat pagi.", ipa: "/səˈla.mat ˈpa.gi/", meaning: "좋은 아침이에요.", meaningEn: "Good morning.", meaningEs: "Buenos días.", meaningId: "Selamat pagi.", speechLang: "id-ID", tip: "A real morning greeting. Pagi = morning." },
      { word: "Sampai jumpa.", ipa: "/ˈsam.pai ˈdʒum.pa/", meaning: "또 만나요.", meaningEn: "See you later.", meaningEs: "Hasta luego.", meaningId: "Sampai jumpa.", speechLang: "id-ID", tip: "A warm goodbye: 'see you again'." },
      { word: "Maaf.", ipa: "/ˈma.ʔaf/", meaning: "미안해요.", meaningEn: "Sorry.", meaningEs: "Lo siento.", meaningId: "Maaf.", speechLang: "id-ID", tip: "Keep the glottal stop between the two a's: ma-'af." },
      { word: "Tolong bicara pelan-pelan.", ipa: "/ˈto.loŋ biˈtʃa.ra ˈpə.lan ˈpə.lan/", meaning: "천천히 말해 주세요.", meaningEn: "Please speak slowly.", meaningEs: "Habla despacio, por favor.", meaningId: "Tolong bicara pelan-pelan.", speechLang: "id-ID", tip: "pelan-pelan = slowly. A real survival request." },
    ],
    travel: [
      { word: "Di mana toilet?", ipa: "/di ˈma.na ˈtoi.let/", meaning: "화장실이 어디예요?", meaningEn: "Where is the bathroom?", meaningEs: "¿Dónde está el baño?", meaningId: "Di mana toilet?", speechLang: "id-ID", tip: "Di mana = where. A real travel question." },
      { word: "Berapa harganya?", ipa: "/bəˈra.pa harˈga.ɲa/", meaning: "얼마예요?", meaningEn: "How much is it?", meaningEs: "¿Cuánto cuesta?", meaningId: "Berapa harganya?", speechLang: "id-ID", tip: "A shopping survival question. Stress GA in harganya." },
      { word: "Tolong bantu saya.", ipa: "/ˈto.loŋ ˈban.tu ˈsa.ja/", meaning: "도와주세요.", meaningEn: "Please help me.", meaningEs: "Ayúdame, por favor.", meaningId: "Tolong bantu saya.", speechLang: "id-ID", tip: "bantu = help. Say it slowly and clearly." },
      { word: "Saya mau air.", ipa: "/ˈsa.ja ˈmau ˈa.ir/", meaning: "물 주세요.", meaningEn: "I want water.", meaningEs: "Quiero agua.", meaningId: "Saya mau air.", speechLang: "id-ID", tip: "mau = want. air = water. A real request." },
      { word: "Berhenti di sini.", ipa: "/bərˈhən.ti di ˈsi.ni/", meaning: "여기 세워 주세요.", meaningEn: "Stop here.", meaningEs: "Pare aquí.", meaningId: "Berhenti di sini.", speechLang: "id-ID", tip: "Taxi survival. di sini = here." },
      { word: "Saya tersesat.", ipa: "/ˈsa.ja tərˈsə.sat/", meaning: "길을 잃었어요.", meaningEn: "I am lost.", meaningEs: "Estoy perdido.", meaningId: "Saya tersesat.", speechLang: "id-ID", tip: "Say it calmly when you need help finding the way." },
      { word: "Berapa lama?", ipa: "/bəˈra.pa ˈla.ma/", meaning: "얼마나 걸려요?", meaningEn: "How long does it take?", meaningEs: "¿Cuánto tiempo?", meaningId: "Berapa lama?", speechLang: "id-ID", tip: "lama = long (time). Useful for trips and waits." },
      { word: "Tolong panggil taksi.", ipa: "/ˈto.loŋ ˈpaŋ.gil ˈtak.si/", meaning: "택시 불러 주세요.", meaningEn: "Please call a taxi.", meaningEs: "Llame un taxi, por favor.", meaningId: "Tolong panggil taksi.", speechLang: "id-ID", tip: "panggil = call. A practical street request." },
    ],
    relationship: [
      { word: "Siapa nama kamu?", ipa: "/siˈa.pa ˈna.ma ˈka.mu/", meaning: "이름이 뭐예요?", meaningEn: "What is your name?", meaningEs: "¿Cómo te llamas?", meaningId: "Siapa nama kamu?", speechLang: "id-ID", tip: "A real first-meeting question. nama = name." },
      { word: "Nama saya Alex.", ipa: "/ˈna.ma ˈsa.ja ˈa.leks/", meaning: "제 이름은 알렉스예요.", meaningEn: "My name is Alex.", meaningEs: "Me llamo Alex.", meaningId: "Nama saya Alex.", speechLang: "id-ID", tip: "Swap Alex for your name when you practice." },
      { word: "Senang bertemu kamu.", ipa: "/səˈnaŋ bərˈtə.mu ˈka.mu/", meaning: "만나서 반가워요.", meaningEn: "Nice to meet you.", meaningEs: "Mucho gusto.", meaningId: "Senang bertemu kamu.", speechLang: "id-ID", tip: "A warm first-meeting line. senang = happy." },
      { word: "Apa kabar?", ipa: "/ˈa.pa ˈka.bar/", meaning: "잘 지내요?", meaningEn: "How are you?", meaningEs: "¿Cómo estás?", meaningId: "Apa kabar?", speechLang: "id-ID", tip: "A friendly check-in. Literally 'what news?'." },
      { word: "Sampai nanti.", ipa: "/ˈsam.pai ˈnan.ti/", meaning: "나중에 봐요.", meaningEn: "See you soon.", meaningEs: "Hasta pronto.", meaningId: "Sampai nanti.", speechLang: "id-ID", tip: "nanti = later. A casual goodbye." },
      { word: "Terima kasih banyak.", ipa: "/təˈri.ma ˈka.sih ˈba.ɲaʔ/", meaning: "정말 고마워요.", meaningEn: "Thank you very much.", meaningEs: "Muchas gracias.", meaningId: "Terima kasih banyak.", speechLang: "id-ID", tip: "banyak = much. Warm gratitude." },
      { word: "Maaf, saya terlambat.", ipa: "/ˈma.ʔaf ˈsa.ja tərˈlam.bat/", meaning: "늦어서 미안해요.", meaningEn: "Sorry, I am late.", meaningEs: "Perdón por llegar tarde.", meaningId: "Maaf, saya terlambat.", speechLang: "id-ID", tip: "terlambat = late. A gentle, honest apology." },
      { word: "Sampai jumpa lagi.", ipa: "/ˈsam.pai ˈdʒum.pa ˈla.gi/", meaning: "또 만나요.", meaningEn: "See you again.", meaningEs: "Hasta la próxima.", meaningId: "Sampai jumpa lagi.", speechLang: "id-ID", tip: "lagi = again. A warm parting line." },
    ],
    work: [
      { word: "Tolong ulangi.", ipa: "/ˈto.loŋ uˈla.ŋi/", meaning: "다시 말해 주세요.", meaningEn: "Please repeat that.", meaningEs: "Repítelo, por favor.", meaningId: "Tolong ulangi.", speechLang: "id-ID", tip: "A useful meeting repair phrase. Say it calmly." },
      { word: "Saya tidak mengerti.", ipa: "/ˈsa.ja ˈti.daʔ məˈŋər.ti/", meaning: "이해 못 했어요.", meaningEn: "I don't understand.", meaningEs: "No entiendo.", meaningId: "Saya tidak mengerti.", speechLang: "id-ID", tip: "It is okay to ask for help. Keep tidak short." },
      { word: "Saya punya pertanyaan.", ipa: "/ˈsa.ja ˈpu.ɲa pər.taˈɲa.an/", meaning: "질문 있어요.", meaningEn: "I have a question.", meaningEs: "Tengo una pregunta.", meaningId: "Saya punya pertanyaan.", speechLang: "id-ID", tip: "Say it before you get stuck. punya = have." },
      { word: "Tolong tunggu sebentar.", ipa: "/ˈto.loŋ ˈtuŋ.gu səbənˈtar/", meaning: "잠시만 기다려 주세요.", meaningEn: "Please wait a moment.", meaningEs: "Espere un momento, por favor.", meaningId: "Tolong tunggu sebentar.", speechLang: "id-ID", tip: "sebentar = a moment. A polite pause at work." },
      { word: "Terima kasih.", ipa: "/təˈri.ma ˈka.sih/", meaning: "감사합니다.", meaningEn: "Thank you.", meaningEs: "Gracias.", meaningId: "Terima kasih.", speechLang: "id-ID", tip: "End politely and clearly." },
      { word: "Tolong bantu saya.", ipa: "/ˈto.loŋ ˈban.tu ˈsa.ja/", meaning: "도와주세요.", meaningEn: "Please help me.", meaningEs: "Ayúdame, por favor.", meaningId: "Tolong bantu saya.", speechLang: "id-ID", tip: "A real workplace request. Keep it calm and polite." },
      { word: "Saya akan kirim email.", ipa: "/ˈsa.ja ˈa.kan ˈki.rim ˈi.mel/", meaning: "이메일 보낼게요.", meaningEn: "I will send an email.", meaningEs: "Enviaré un correo.", meaningId: "Saya akan kirim email.", speechLang: "id-ID", tip: "akan = will. A real work promise." },
      { word: "Tolong periksa ini.", ipa: "/ˈto.loŋ pəˈrik.sa ˈi.ni/", meaning: "확인해 주세요.", meaningEn: "Please check this.", meaningEs: "Revísalo, por favor.", meaningId: "Tolong periksa ini.", speechLang: "id-ID", tip: "periksa = check. Useful for documents." },
    ],
  },
};

// `meaning` = Korean, `meaningEn` = English, `meaningEs` = Spanish; the spoken
// word IS the Indonesian self-meaning.
function id(word: string, ipa: string, meaning: string, meaningEn: string, meaningEs: string, tip: string): RawDailyPhrase {
  return { word, ipa, meaning, meaningEn, meaningEs, meaningId: word, speechLang: "id-ID", tip };
}

function ko(word: string, ipa: string, meaning: string, meaningEs: string, tip: string): RawDailyPhrase {
  return { word, ipa, meaning, meaningEs, speechLang: "ko-KR", tip };
}

function en(word: string, ipa: string, meaning: string, meaningEs: string, tip: string): RawDailyPhrase {
  return { word, ipa, meaning, meaningEs, speechLang: "en-US", tip };
}

function es(word: string, ipa: string, meaning: string, meaningEs: string, tip: string): RawDailyPhrase {
  return { word, ipa, meaning, meaningEs, speechLang: "es-ES", tip };
}

const DAILY_SPEAKING_STARTERS: Partial<Record<DailySpeakingLanguage, RawDailyPhrase[]>> = {
  korean: [
    ko("네.", "/ne/", "Yes.", "Sí.", "A tiny real answer. Keep it short and clear."),
    ko("아니요.", "/a.ni.jo/", "No.", "No.", "A safe answer. Keep the final 요 soft."),
    ko("괜찮아요.", "/kwɛn.tɕʰa.na.jo/", "It is okay.", "Está bien.", "A gentle sentence you can use often."),
    ko("천천히 말해 주세요.", "/tɕʰʌn.tɕʰʌn.hi ma.ɾɛ dʑu.se.jo/", "Please speak slowly.", "Habla despacio, por favor.", "A survival sentence. Slow down the middle."),
    ko("저는 초보자예요.", "/tɕʌ.nɯn tɕʰo.bo.dʑa.je.jo/", "I am a beginner.", "Soy principiante.", "Say it without apology. It helps people help you."),
    ko("영어 할 줄 아세요?", "/jʌŋ.ʌ hal dʑul a.se.jo/", "Do you speak English?", "¿Hablas inglés?", "Useful when you need a bridge language."),
    ko("안녕히 가세요.", "/an.njʌŋ.hi ka.se.jo/", "Goodbye.", "Adiós.", "A real goodbye. Let it feel warm, not final."),
    ko("죄송합니다.", "/tɕwe.soŋ.ham.ni.da/", "I am sorry.", "Lo siento.", "A repair sentence. Say it gently and keep going."),
    ko("화장실이 어디예요?", "/hwa.dʑaŋ.ɕi.ɾi ʌ.di.je.jo/", "Where is the bathroom?", "¿Dónde está el baño?", "A real travel sentence. Let the pitch rise at the end."),
    ko("얼마예요?", "/ʌl.ma.je.jo/", "How much is it?", "¿Cuánto cuesta?", "A tiny money question you can use every day."),
    ko("도와주세요.", "/to.wa.dʑu.se.jo/", "Please help me.", "Ayúdame, por favor.", "An emergency sentence. Slow and clear is enough."),
    ko("이름이 뭐예요?", "/i.ɾɯ.mi mwʌ.je.jo/", "What is your name?", "¿Cómo te llamas?", "A real first conversation question."),
    ko("제 이름은 알렉스예요.", "/tɕe i.ɾɯ.mɯn al.lek.sɯ.je.jo/", "My name is Alex.", "Me llamo Alex.", "Swap Alex for your name when you practice."),
    ko("여기 있어요.", "/jʌ.gi i.sʌ.jo/", "Here it is.", "Aquí está.", "Useful when showing a ticket, phone, or bag."),
    ko("몰라요.", "/mol.la.jo/", "I do not know.", "No sé.", "Short, honest, and useful."),
    ko("좋아요.", "/tɕo.a.jo/", "I like it.", "Me gusta.", "A small opinion sentence you can use everywhere."),
    ko("잠깐만요.", "/tɕam.kkan.man.jo/", "One moment, please.", "Un momento, por favor.", "A natural pause sentence. Hold the double ㄲ briefly."),
    ko("지금 가요.", "/tɕi.gɯm ga.jo/", "I am going now.", "Voy ahora.", "A real movement sentence. Keep it simple."),
    ko("문제없어요.", "/mun.dʑe ʌp.sʌ.jo/", "No problem.", "No hay problema.", "Say it as reassurance, not as a test."),
    ko("다시 해 볼게요.", "/ta.ɕi hɛ bol.ge.jo/", "I will try again.", "Lo intentaré otra vez.", "The app's core sentence: try, then fix."),
  ],
  english: [
    en("Yes.", "/jes/", "네.", "Sí.", "A tiny real answer. Keep it clean."),
    en("No.", "/noʊ/", "아니요.", "No.", "A tiny real answer. Let the vowel finish."),
    en("It's okay.", "/ɪts oʊˈkeɪ/", "괜찮아요.", "Está bien.", "A gentle sentence you can use often."),
    en("Please speak slowly.", "/pliːz spiːk ˈsloʊ.li/", "천천히 말해 주세요.", "Habla despacio, por favor.", "A survival sentence. Stress slowly."),
    en("I'm a beginner.", "/aɪm ə bɪˈgɪn.ər/", "저는 초보자예요.", "Soy principiante.", "Say it clearly before you freeze."),
    en("Do you speak Korean?", "/duː juː spiːk kəˈriː.ən/", "한국어 할 줄 아세요?", "¿Hablas coreano?", "A useful bridge question."),
    en("Goodbye.", "/ˌgʊdˈbaɪ/", "안녕히 가세요.", "Adiós.", "A real goodbye. Keep it friendly and clear."),
    en("I'm sorry.", "/aɪm ˈsɑː.ri/", "죄송합니다.", "Lo siento.", "A repair sentence. Say it softly, then continue."),
    en("Where is the bathroom?", "/wer ɪz ðə ˈbæθ.ruːm/", "화장실이 어디예요?", "¿Dónde está el baño?", "A real travel sentence. Link where-is smoothly."),
    en("How much is it?", "/haʊ mʌtʃ ɪz ɪt/", "얼마예요?", "¿Cuánto cuesta?", "A tiny money question you can use everywhere."),
    en("Please help me.", "/pliːz help miː/", "도와주세요.", "Ayúdame, por favor.", "An emergency sentence. Slow and clear is enough."),
    en("What's your name?", "/wʌts jɔːr neɪm/", "이름이 뭐예요?", "¿Cómo te llamas?", "A real first conversation question."),
    en("My name is Alex.", "/maɪ neɪm ɪz ˈæl.eks/", "제 이름은 알렉스예요.", "Me llamo Alex.", "Swap Alex for your name when you practice."),
    en("Here it is.", "/hɪr ɪt ɪz/", "여기 있어요.", "Aquí está.", "Useful when showing something."),
    en("I don't know.", "/aɪ doʊnt noʊ/", "몰라요.", "No sé.", "Short, honest, and useful."),
    en("I like it.", "/aɪ laɪk ɪt/", "좋아요.", "Me gusta.", "A small opinion sentence you can use everywhere."),
    en("One moment, please.", "/wʌn ˈmoʊ.mənt pliːz/", "잠깐만요.", "Un momento, por favor.", "A natural pause sentence."),
    en("I'm going now.", "/aɪm ˈgoʊ.ɪŋ naʊ/", "지금 가요.", "Voy ahora.", "A real movement sentence."),
    en("No problem.", "/noʊ ˈprɑː.bləm/", "문제없어요.", "No hay problema.", "Use it as reassurance."),
    en("I'll try again.", "/aɪl traɪ əˈgen/", "다시 해 볼게요.", "Lo intentaré otra vez.", "The app's core sentence: try, then fix."),
  ],
  spanish: [
    es("Sí.", "/si/", "네.", "Yes.", "A tiny real answer. Keep the vowel clean."),
    es("No.", "/no/", "아니요.", "No.", "A tiny real answer. Short and calm."),
    es("Está bien.", "/esˈta βjen/", "괜찮아요.", "It is okay.", "A gentle sentence you can use often."),
    es("Habla despacio, por favor.", "/ˈa.βla desˈpa.sjo poɾ faˈβoɾ/", "천천히 말해 주세요.", "Please speak slowly.", "A survival sentence. Keep despacio smooth."),
    es("Soy principiante.", "/soj pɾin.siˈpjan.te/", "저는 초보자예요.", "I am a beginner.", "Say it clearly before you freeze."),
    es("¿Hablas coreano?", "/ˈa.βlas koˈɾe.a.no/", "한국어 할 줄 아세요?", "Do you speak Korean?", "A useful bridge question."),
    es("Adiós.", "/aˈðjos/", "안녕히 가세요.", "Goodbye.", "A real goodbye. Keep the final s light."),
    es("Lo siento.", "/lo ˈsjen.to/", "죄송합니다.", "I am sorry.", "A repair sentence. Say it gently and continue."),
    es("¿Dónde está el baño?", "/ˈdon.de esˈta el ˈba.ɲo/", "화장실이 어디예요?", "Where is the bathroom?", "A real travel sentence. Keep the vowels clean and short."),
    es("¿Cuánto cuesta?", "/ˈkwan.to ˈkwes.ta/", "얼마예요?", "How much is it?", "A shopping survival question. Keep cuesta crisp."),
    es("Ayúdame, por favor.", "/aˈʝu.ða.me poɾ faˈβoɾ/", "도와주세요.", "Please help me.", "An emergency sentence. Slow and clear is enough."),
    es("¿Cómo te llamas?", "/ˈko.mo te ˈʝa.mas/", "이름이 뭐예요?", "What is your name?", "A real first conversation question."),
    es("Me llamo Alex.", "/me ˈʝa.mo ˈa.leks/", "제 이름은 알렉스예요.", "My name is Alex.", "Swap Alex for your name when you practice."),
    es("Aquí está.", "/aˈki esˈta/", "여기 있어요.", "Here it is.", "Useful when showing something."),
    es("No sé.", "/no se/", "몰라요.", "I do not know.", "Short, honest, and useful."),
    es("Me gusta.", "/me ˈɡus.ta/", "좋아요.", "I like it.", "A small opinion sentence you can use everywhere."),
    es("Un momento, por favor.", "/un moˈmen.to poɾ faˈβoɾ/", "잠깐만요.", "One moment, please.", "A natural pause sentence."),
    es("Voy ahora.", "/boj aˈo.ɾa/", "지금 가요.", "I am going now.", "A real movement sentence."),
    es("No hay problema.", "/no aj pɾoˈβle.ma/", "문제없어요.", "No problem.", "Use it as reassurance."),
    es("Lo intento otra vez.", "/lo inˈten.to ˈo.tɾa βes/", "다시 해 볼게요.", "I will try again.", "The app's core sentence: try, then fix."),
  ],
  indonesian: [
    id("Ya.", "/ja/", "네.", "Yes.", "Sí.", "A tiny real answer. Keep it short and clear."),
    id("Tidak.", "/ˈti.daʔ/", "아니요.", "No.", "No.", "A safe answer. Keep the final glottal stop crisp."),
    id("Tidak apa-apa.", "/ˈti.daʔ ˈa.pa ˈa.pa/", "괜찮아요.", "It's okay.", "Está bien.", "A gentle 'it's okay' you can use often."),
    id("Tolong bicara pelan-pelan.", "/ˈto.loŋ biˈtʃa.ra ˈpə.lan ˈpə.lan/", "천천히 말해 주세요.", "Please speak slowly.", "Habla despacio, por favor.", "A survival sentence. pelan-pelan = slowly."),
    id("Saya pemula.", "/ˈsa.ja pəˈmu.la/", "저는 초보자예요.", "I am a beginner.", "Soy principiante.", "Say it without apology. It helps people help you."),
    id("Apakah kamu bisa bahasa Inggris?", "/aˈpa.kah ˈka.mu ˈbi.sa baˈha.sa ˈiŋ.gris/", "영어 할 줄 아세요?", "Do you speak English?", "¿Hablas inglés?", "Useful when you need a bridge language."),
    id("Sampai jumpa.", "/ˈsam.pai ˈdʒum.pa/", "안녕히 가세요.", "Goodbye.", "Adiós.", "A warm goodbye: 'see you again'."),
    id("Maaf.", "/ˈma.ʔaf/", "죄송합니다.", "Sorry.", "Lo siento.", "A repair word. Keep the glottal stop: ma-'af."),
    id("Di mana toilet?", "/di ˈma.na ˈtoi.let/", "화장실이 어디예요?", "Where is the bathroom?", "¿Dónde está el baño?", "A real travel question. Di mana = where."),
    id("Berapa harganya?", "/bəˈra.pa harˈga.ɲa/", "얼마예요?", "How much is it?", "¿Cuánto cuesta?", "A tiny money question you can use every day."),
    id("Tolong bantu saya.", "/ˈto.loŋ ˈban.tu ˈsa.ja/", "도와주세요.", "Please help me.", "Ayúdame, por favor.", "An emergency sentence. Slow and clear is enough."),
    id("Siapa nama kamu?", "/siˈa.pa ˈna.ma ˈka.mu/", "이름이 뭐예요?", "What is your name?", "¿Cómo te llamas?", "A real first conversation question."),
  ],
};

const DAILY_GOAL_BOOSTERS: Partial<Record<DailySpeakingLanguage, Partial<Record<LearningGoal, RawDailyPhrase[]>>>> = {
  korean: {
    travel: [
      ko("역 어디예요?", "/jʌk ʌ.di.je.jo/", "Where is the station?", "¿Dónde está la estación?", "A real street question. Let the pitch rise."),
      ko("표 한 장 주세요.", "/pʰjo han dʑaŋ dʑu.se.jo/", "One ticket, please.", "Un boleto, por favor.", "Useful at a counter. Keep 한 장 connected."),
      ko("여기 세워 주세요.", "/jʌ.gi se.wʌ dʑu.se.jo/", "Please stop here.", "Pare aquí, por favor.", "Taxi survival. Say 여기 clearly."),
      ko("사진 찍어 주세요.", "/sa.dʑin tɕi.gʌ dʑu.se.jo/", "Please take a photo.", "Tome una foto, por favor.", "A real tourist request."),
      ko("예약했어요.", "/je.jak.hɛ.sʌ.jo/", "I have a reservation.", "Tengo una reserva.", "Hotel and restaurant sentence."),
      ko("길을 잃었어요.", "/ki.ɾɯl i.ɾʌ.sʌ.jo/", "I am lost.", "Estoy perdido.", "Say it calmly if you need help."),
    ],
    work: [
      ko("회의 시작해요.", "/hwe.i ɕi.dʑak.hɛ.jo/", "The meeting is starting.", "La reunión empieza.", "A practical workplace update."),
      ko("이메일 보낼게요.", "/i.me.il po.nel.ge.jo/", "I will send an email.", "Enviaré un correo.", "A real work promise."),
      ko("확인해 주세요.", "/hwa.gin.hɛ dʑu.se.jo/", "Please check it.", "Revísalo, por favor.", "Useful for documents and messages."),
      ko("질문 있어요.", "/tɕil.mun i.sʌ.jo/", "I have a question.", "Tengo una pregunta.", "Say it before you get stuck."),
      ko("잠시만 기다려 주세요.", "/tɕam.ɕi.man ki.da.ɾjʌ dʑu.se.jo/", "Please wait a moment.", "Espere un momento, por favor.", "A polite pause at work."),
      ko("오늘 가능해요.", "/o.nɯl ka.nɯŋ.hɛ.jo/", "I can do it today.", "Puedo hacerlo hoy.", "A simple availability sentence."),
    ],
    study: [
      ko("숙제 했어요.", "/suk.tɕe hɛ.sʌ.jo/", "I did the homework.", "Hice la tarea.", "A classroom sentence you will actually say."),
      ko("천천히 읽어 주세요.", "/tɕʰʌn.tɕʰʌn.hi il.gʌ dʑu.se.jo/", "Please read slowly.", "Lee despacio, por favor.", "Useful during lessons."),
      ko("이 단어 무슨 뜻이에요?", "/i ta.nʌ mu.sɯn tɯ.ɕi.e.jo/", "What does this word mean?", "¿Qué significa esta palabra?", "A real learner question."),
      ko("다시 설명해 주세요.", "/ta.ɕi sʌl.mjʌŋ.hɛ dʑu.se.jo/", "Please explain again.", "Explícalo otra vez, por favor.", "Ask for another explanation."),
      ko("준비됐어요.", "/tɕun.bi.dwɛ.sʌ.jo/", "I am ready.", "Estoy listo.", "Short and useful before speaking."),
      ko("연습하고 싶어요.", "/jʌn.sɯp.ha.go ɕi.pʰʌ.jo/", "I want to practice.", "Quiero practicar.", "A direct learning sentence."),
    ],
    hobby: [
      ko("이 노래 좋아해요.", "/i no.ɾɛ tɕo.a.hɛ.jo/", "I like this song.", "Me gusta esta canción.", "A real fan sentence."),
      ko("이 영화 봤어요.", "/i jʌŋ.hwa bwa.sʌ.jo/", "I watched this movie.", "Vi esta película.", "Useful for shows and films."),
      ko("같이 해요.", "/ka.tɕʰi hɛ.jo/", "Let's do it together.", "Hagámoslo juntos.", "Invite someone naturally."),
      ko("재미있어요.", "/tɕɛ.mi.i.sʌ.jo/", "It is fun.", "Es divertido.", "A tiny reaction sentence."),
      ko("추천해 주세요.", "/tɕʰu.tɕʰʌn.hɛ dʑu.se.jo/", "Please recommend something.", "Recomiéndame algo, por favor.", "Ask for a song, show, or place."),
      ko("어디서 볼 수 있어요?", "/ʌ.di.sʌ pol su i.sʌ.jo/", "Where can I watch it?", "¿Dónde puedo verlo?", "A real content question."),
    ],
    relationship: [
      ko("잘 지냈어요?", "/tɕal tɕi.nɛ.sʌ.jo/", "Have you been well?", "¿Has estado bien?", "A warm check-in sentence."),
      ko("같이 가요.", "/ka.tɕʰi ga.jo/", "Let's go together.", "Vamos juntos.", "A simple invitation."),
      ko("보고 싶었어요.", "/po.go ɕi.pʰʌ.sʌ.jo/", "I missed you.", "Te extrañé.", "Say it softly and honestly."),
      ko("연락해 주세요.", "/jʌl.lak.hɛ dʑu.se.jo/", "Please contact me.", "Contáctame, por favor.", "Useful for keeping a connection."),
      ko("정말 고마워요.", "/tɕʌŋ.mal ko.ma.wʌ.jo/", "Thank you so much.", "Muchas gracias.", "Warm gratitude."),
      ko("오늘 즐거웠어요.", "/o.nɯl tɕɯl.gʌ.wʌ.sʌ.jo/", "I had fun today.", "Me divertí hoy.", "A real end-of-day sentence."),
    ],
    exam: [
      ko("답을 모르겠어요.", "/ta.bɯl mo.rɯ.ge.sʌ.jo/", "I do not know the answer.", "No sé la respuesta.", "An honest test sentence. Say it clearly, then repair."),
      ko("시간이 더 필요해요.", "/ɕi.ga.ni tʌ pi.rjo.hɛ.jo/", "I need more time.", "Necesito más tiempo.", "A real request when you are under pressure."),
      ko("연습하고 싶어요.", "/jʌn.sɯp.ha.go ɕi.pʌ.jo/", "I want to practice.", "Quiero practicar.", "The app's philosophy in one sentence."),
      ko("어디에 써야 해요?", "/ʌ.di.e s͈ʌ.ja hɛ.jo/", "Where should I write it?", "¿Dónde debo escribirlo?", "Useful before worksheets, forms, and exams."),
      ko("이 단어 무슨 뜻이에요?", "/i ta.nʌ mu.sɯn t͈ɯ.ɕi.e.jo/", "What does this word mean?", "¿Qué significa esta palabra?", "Ask about meaning in the target language."),
      ko("시험 끝났어요.", "/si.hʌm k͈ɯt.na.sʌ.jo/", "The exam is over.", "El examen terminó.", "A real after-test sentence. Let the last word relax."),
    ],
  },
  english: {
    travel: [
      en("Where is the station?", "/wer ɪz ðə ˈsteɪ.ʃən/", "역이 어디예요?", "¿Dónde está la estación?", "A real street question."),
      en("One ticket, please.", "/wʌn ˈtɪ.kɪt pliːz/", "표 한 장 주세요.", "Un boleto, por favor.", "Useful at a counter."),
      en("Please stop here.", "/pliːz stɑːp hɪr/", "여기 세워 주세요.", "Pare aquí, por favor.", "Taxi survival."),
      en("Can you take a photo?", "/kæn juː teɪk ə ˈfoʊ.toʊ/", "사진 찍어 줄 수 있나요?", "¿Puedes tomar una foto?", "A real tourist request."),
      en("I have a reservation.", "/aɪ hæv ə ˌrez.ərˈveɪ.ʃən/", "예약했어요.", "Tengo una reserva.", "Hotel and restaurant sentence."),
      en("I'm lost.", "/aɪm lɔːst/", "길을 잃었어요.", "Estoy perdido.", "Short and useful when you need help."),
    ],
    work: [
      en("The meeting is starting.", "/ðə ˈmiː.tɪŋ ɪz ˈstɑːr.tɪŋ/", "회의가 시작해요.", "La reunión empieza.", "A practical workplace update."),
      en("I'll send an email.", "/aɪl send ən ˈiː.meɪl/", "이메일 보낼게요.", "Enviaré un correo.", "A real work promise."),
      en("Please check it.", "/pliːz tʃek ɪt/", "확인해 주세요.", "Revísalo, por favor.", "Useful for documents and messages."),
      en("I have a question.", "/aɪ hæv ə ˈkwes.tʃən/", "질문 있어요.", "Tengo una pregunta.", "Say it before you get stuck."),
      en("Please wait a moment.", "/pliːz weɪt ə ˈmoʊ.mənt/", "잠시만 기다려 주세요.", "Espere un momento, por favor.", "A polite pause at work."),
      en("I can do it today.", "/aɪ kæn duː ɪt təˈdeɪ/", "오늘 가능해요.", "Puedo hacerlo hoy.", "A simple availability sentence."),
    ],
    study: [
      en("I did the homework.", "/aɪ dɪd ðə ˈhoʊm.wɝːk/", "숙제 했어요.", "Hice la tarea.", "A classroom sentence you will actually say."),
      en("Please read slowly.", "/pliːz riːd ˈsloʊ.li/", "천천히 읽어 주세요.", "Lee despacio, por favor.", "Useful during lessons."),
      en("What does this word mean?", "/wʌt dʌz ðɪs wɝːd miːn/", "이 단어 무슨 뜻이에요?", "¿Qué significa esta palabra?", "A real learner question."),
      en("Please explain again.", "/pliːz ɪkˈspleɪn əˈgen/", "다시 설명해 주세요.", "Explícalo otra vez, por favor.", "Ask for another explanation."),
      en("I'm ready.", "/aɪm ˈred.i/", "준비됐어요.", "Estoy listo.", "Short and useful before speaking."),
      en("I want to practice.", "/aɪ wɑːnt tə ˈpræk.tɪs/", "연습하고 싶어요.", "Quiero practicar.", "A direct learning sentence."),
    ],
    hobby: [
      en("I like this song.", "/aɪ laɪk ðɪs sɔːŋ/", "이 노래 좋아해요.", "Me gusta esta canción.", "A real fan sentence."),
      en("I watched this movie.", "/aɪ wɑːtʃt ðɪs ˈmuː.vi/", "이 영화 봤어요.", "Vi esta película.", "Useful for shows and films."),
      en("Let's do it together.", "/lets duː ɪt təˈgeð.ər/", "같이 해요.", "Hagámoslo juntos.", "Invite someone naturally."),
      en("It's fun.", "/ɪts fʌn/", "재미있어요.", "Es divertido.", "A tiny reaction sentence."),
      en("Can you recommend something?", "/kæn juː ˌrek.əˈmend ˈsʌm.θɪŋ/", "추천해 주세요.", "¿Puedes recomendarme algo?", "Ask for a song, show, or place."),
      en("Where can I watch it?", "/wer kæn aɪ wɑːtʃ ɪt/", "어디서 볼 수 있어요?", "¿Dónde puedo verlo?", "A real content question."),
    ],
    relationship: [
      en("How have you been?", "/haʊ hæv juː bɪn/", "잘 지냈어요?", "¿Cómo has estado?", "A warm check-in sentence."),
      en("Let's go together.", "/lets goʊ təˈgeð.ər/", "같이 가요.", "Vamos juntos.", "A simple invitation."),
      en("I missed you.", "/aɪ mɪst juː/", "보고 싶었어요.", "Te extrañé.", "Say it softly and honestly."),
      en("Please contact me.", "/pliːz ˈkɑːn.tækt miː/", "연락해 주세요.", "Contáctame, por favor.", "Useful for keeping a connection."),
      en("Thank you so much.", "/θæŋk juː soʊ mʌtʃ/", "정말 고마워요.", "Muchas gracias.", "Warm gratitude."),
      en("I had fun today.", "/aɪ hæd fʌn təˈdeɪ/", "오늘 즐거웠어요.", "Me divertí hoy.", "A real end-of-day sentence."),
    ],
    exam: [
      en("I don't know the answer.", "/aɪ doʊnt noʊ ði ˈæn.sɚ/", "답을 모르겠어요.", "No sé la respuesta.", "A real test sentence. Say it clearly, then ask for help."),
      en("I need more time.", "/aɪ niːd mɔːr taɪm/", "시간이 더 필요해요.", "Necesito más tiempo.", "A practical request under pressure."),
      en("I want to practice.", "/aɪ wɑːnt tə ˈpræk.tɪs/", "연습하고 싶어요.", "Quiero practicar.", "The app's philosophy in one sentence."),
      en("Where should I write it?", "/wer ʃʊd aɪ raɪt ɪt/", "어디에 써야 해요?", "¿Dónde debo escribirlo?", "Useful before worksheets, forms, and exams."),
      en("What does this word mean?", "/wʌt dʌz ðɪs wɝːd miːn/", "이 단어 무슨 뜻이에요?", "¿Qué significa esta palabra?", "Ask for meaning instead of guessing silently."),
      en("The exam is over.", "/ði ɪgˈzæm ɪz ˈoʊ.vɚ/", "시험 끝났어요.", "El examen terminó.", "A real after-test sentence. Keep over relaxed."),
    ],
  },
  spanish: {
    travel: [
      es("¿Dónde está la estación?", "/ˈdon.de esˈta la es.taˈsjon/", "역이 어디예요?", "Where is the station?", "A real street question."),
      es("Un boleto, por favor.", "/un boˈle.to poɾ faˈβoɾ/", "표 한 장 주세요.", "One ticket, please.", "Useful at a counter."),
      es("Pare aquí, por favor.", "/ˈpa.ɾe aˈki poɾ faˈβoɾ/", "여기 세워 주세요.", "Please stop here.", "Taxi survival."),
      es("¿Puedes tomar una foto?", "/ˈpwe.des toˈmaɾ ˈu.na ˈfo.to/", "사진 찍어 줄 수 있나요?", "Can you take a photo?", "A real tourist request."),
      es("Tengo una reserva.", "/ˈteŋ.go ˈu.na reˈseɾ.βa/", "예약했어요.", "I have a reservation.", "Hotel and restaurant sentence."),
      es("Estoy perdido.", "/esˈtoj peɾˈði.ðo/", "길을 잃었어요.", "I am lost.", "Short and useful when you need help."),
    ],
    work: [
      es("La reunión empieza.", "/la re.uˈnjon emˈpje.sa/", "회의가 시작해요.", "The meeting is starting.", "A practical workplace update."),
      es("Enviaré un correo.", "/em.bjaˈɾe un koˈre.o/", "이메일 보낼게요.", "I will send an email.", "A real work promise."),
      es("Revísalo, por favor.", "/reˈβi.sa.lo poɾ faˈβoɾ/", "확인해 주세요.", "Please check it.", "Useful for documents and messages."),
      es("Tengo una pregunta.", "/ˈteŋ.go ˈu.na pɾeˈɣun.ta/", "질문 있어요.", "I have a question.", "Say it before you get stuck."),
      es("Espere un momento, por favor.", "/esˈpe.ɾe un moˈmen.to poɾ faˈβoɾ/", "잠시만 기다려 주세요.", "Please wait a moment.", "A polite pause at work."),
      es("Puedo hacerlo hoy.", "/ˈpwe.ðo aˈseɾ.lo oj/", "오늘 가능해요.", "I can do it today.", "A simple availability sentence."),
    ],
    study: [
      es("Hice la tarea.", "/ˈi.se la taˈɾe.a/", "숙제 했어요.", "I did the homework.", "A classroom sentence you will actually say."),
      es("Lee despacio, por favor.", "/le.e desˈpa.sjo poɾ faˈβoɾ/", "천천히 읽어 주세요.", "Please read slowly.", "Useful during lessons."),
      es("¿Qué significa esta palabra?", "/ke siɣ.niˈfi.ka ˈes.ta paˈla.βɾa/", "이 단어 무슨 뜻이에요?", "What does this word mean?", "A real learner question."),
      es("Explícalo otra vez, por favor.", "/eksˈpli.ka.lo ˈo.tɾa βes poɾ faˈβoɾ/", "다시 설명해 주세요.", "Please explain again.", "Ask for another explanation."),
      es("Estoy listo.", "/esˈtoj ˈlis.to/", "준비됐어요.", "I am ready.", "Short and useful before speaking."),
      es("Quiero practicar.", "/ˈkje.ɾo pɾak.tiˈkaɾ/", "연습하고 싶어요.", "I want to practice.", "A direct learning sentence."),
    ],
    hobby: [
      es("Me gusta esta canción.", "/me ˈɡus.ta ˈes.ta kanˈsjon/", "이 노래 좋아해요.", "I like this song.", "A real fan sentence."),
      es("Vi esta película.", "/bi ˈes.ta peˈli.ku.la/", "이 영화 봤어요.", "I watched this movie.", "Useful for shows and films."),
      es("Hagámoslo juntos.", "/aˈɣa.mos.lo ˈxun.tos/", "같이 해요.", "Let's do it together.", "Invite someone naturally."),
      es("Es divertido.", "/es di.βeɾˈti.ðo/", "재미있어요.", "It is fun.", "A tiny reaction sentence."),
      es("Recomiéndame algo.", "/re.koˈmjen.da.me ˈal.ɣo/", "추천해 주세요.", "Recommend something.", "Ask for a song, show, or place."),
      es("¿Dónde puedo verlo?", "/ˈdon.de ˈpwe.ðo ˈβeɾ.lo/", "어디서 볼 수 있어요?", "Where can I watch it?", "A real content question."),
    ],
    relationship: [
      es("¿Cómo has estado?", "/ˈko.mo as esˈta.ðo/", "잘 지냈어요?", "How have you been?", "A warm check-in sentence."),
      es("Vamos juntos.", "/ˈba.mos ˈxun.tos/", "같이 가요.", "Let's go together.", "A simple invitation."),
      es("Te extrañé.", "/te eks.tɾaˈɲe/", "보고 싶었어요.", "I missed you.", "Say it softly and honestly."),
      es("Contáctame, por favor.", "/konˈtak.ta.me poɾ faˈβoɾ/", "연락해 주세요.", "Please contact me.", "Useful for keeping a connection."),
      es("Muchas gracias.", "/ˈmu.tʃas ˈɡɾa.sjas/", "정말 고마워요.", "Thank you so much.", "Warm gratitude."),
      es("Me divertí hoy.", "/me di.βeɾˈti oj/", "오늘 즐거웠어요.", "I had fun today.", "A real end-of-day sentence."),
    ],
    exam: [
      es("No sé la respuesta.", "/no se la resˈpwes.ta/", "답을 모르겠어요.", "I do not know the answer.", "A real test sentence. Say it clearly, then repair."),
      es("Necesito más tiempo.", "/ne.seˈsi.to mas ˈtjem.po/", "시간이 더 필요해요.", "I need more time.", "A practical request under pressure."),
      es("Quiero practicar.", "/ˈkje.ɾo pɾak.tiˈkaɾ/", "연습하고 싶어요.", "I want to practice.", "The app's philosophy in one sentence."),
      es("¿Dónde debo escribirlo?", "/ˈdon.de ˈde.βo es.kɾiˈβiɾ.lo/", "어디에 써야 해요?", "Where should I write it?", "Useful before worksheets, forms, and exams."),
      es("¿Qué significa esta palabra?", "/ke siɣ.niˈfi.ka ˈes.ta paˈla.βɾa/", "이 단어 무슨 뜻이에요?", "What does this word mean?", "Ask about meaning in the target language."),
      es("El examen terminó.", "/el ekˈsa.men teɾ.miˈno/", "시험 끝났어요.", "The exam is over.", "A real after-test sentence. Let terminó finish cleanly."),
    ],
  },
};

export type SurvivalPhraseFamily =
  | "greeting"
  | "goodbye"
  | "thanks"
  | "sorry"
  | "dont_understand"
  | "repeat"
  | "slow_speech"
  | "bridge_language"
  | "where"
  | "how_much"
  | "yes"
  | "no"
  | "help"
  | "name";

export const SURVIVAL_PHRASE_FAMILIES: Partial<Record<DailySpeakingLanguage, Record<SurvivalPhraseFamily, string[]>>> = {
  korean: {
    greeting: ["안녕하세요"],
    goodbye: ["안녕히 가세요."],
    thanks: ["감사합니다"],
    sorry: ["죄송합니다."],
    dont_understand: ["이해 못 했어요."],
    repeat: ["다시 말해 주세요."],
    slow_speech: ["천천히 말해 주세요."],
    bridge_language: ["영어 할 줄 아세요?"],
    where: ["화장실이 어디예요?"],
    how_much: ["얼마예요?"],
    yes: ["네."],
    no: ["아니요."],
    help: ["도와주세요."],
    name: ["제 이름은 알렉스예요."],
  },
  english: {
    greeting: ["Hello"],
    goodbye: ["Goodbye."],
    thanks: ["Thank you."],
    sorry: ["I'm sorry."],
    dont_understand: ["I don't understand."],
    repeat: ["Can you say that again?"],
    slow_speech: ["Please speak slowly."],
    bridge_language: ["Do you speak Korean?"],
    where: ["Where is the bathroom?"],
    how_much: ["How much is it?"],
    yes: ["Yes."],
    no: ["No."],
    help: ["Please help me."],
    name: ["My name is Alex."],
  },
  spanish: {
    greeting: ["Hola"],
    goodbye: ["Adiós."],
    thanks: ["Gracias."],
    sorry: ["Lo siento."],
    dont_understand: ["No entiendo."],
    repeat: ["¿Puedes repetirlo?"],
    slow_speech: ["Habla despacio, por favor."],
    bridge_language: ["¿Hablas coreano?"],
    where: ["¿Dónde está el baño?"],
    how_much: ["¿Cuánto cuesta?"],
    yes: ["Sí."],
    no: ["No."],
    help: ["Ayúdame, por favor."],
    name: ["Me llamo Alex."],
  },
};

const DAILY_SPEAKING_GOALS: LearningGoal[] = ["travel", "work", "study", "hobby", "relationship", "exam", "unknown"];

const GOAL_CONTEXT_TIPS: Record<LearningGoal, string> = {
  travel: "Travel context: use it with staff, drivers, shopkeepers, or strangers who can help.",
  work: "Work context: use it in a meeting, chat, email follow-up, or quick desk conversation.",
  study: "Study context: use it with a teacher, classmate, tutor, or study group.",
  hobby: "Hobby context: use it while talking about shows, music, games, food, or things you like.",
  relationship: "Relationship context: use it with a friend, date, host family, or someone you want to know better.",
  exam: "Exam context: use it before, during, or after a test when you need to ask, repair, or respond.",
  unknown: "First-day context: use it whenever a real conversation starts, stops, or gets stuck.",
};

export type SurvivalPhraseCoverage = {
  family: SurvivalPhraseFamily;
  phrases: string[];
  loopHits: LearningGoal[];
  contextTips: string[];
  exposures: number;
};

function toDailyPhrase(
  targetLanguage: DailySpeakingLanguage,
  raw: RawDailyPhrase,
  practiceContext?: LearningGoal
): DailySpeakingPhrase {
  // `meanings` maps each native language to how the target phrase reads in it.
  // For the 3 core languages the raw phrase carries ko/en/es (the meaning of
  // `meaning`/`meaningEs` flips per target — see toDailyPhrase branches). When
  // the target IS Indonesian, the spoken `word` is Indonesian and ko/en/es come
  // from meaning/meaningEn/meaningEs. `meanings` is Partial, so missing keys
  // simply fall back at the call site.
  const meanings: Partial<Record<DailySpeakingLanguage, string>> = targetLanguage === "korean"
    ? { korean: raw.word, english: raw.meaning, spanish: raw.meaningEs, indonesian: raw.meaningId }
    : targetLanguage === "english"
    ? { korean: raw.meaning, english: raw.word, spanish: raw.meaningEs, indonesian: raw.meaningId }
    : targetLanguage === "spanish"
    ? { korean: raw.meaning, english: raw.meaningEs, spanish: raw.word, indonesian: raw.meaningId }
    : { korean: raw.meaning, english: raw.meaningEn, spanish: raw.meaningEs, indonesian: raw.word };

  return {
    phrase: raw.word,
    ipa: raw.ipa,
    level: "A1",
    speechLang: raw.speechLang,
    tip: raw.tip,
    meanings,
    practiceContext,
    contextTip: practiceContext ? GOAL_CONTEXT_TIPS[practiceContext] : undefined,
  };
}

export function getDailySpeakingPhrasePack(lang: DailySpeakingLanguage, goal: LearningGoal | null): DailySpeakingPhrase[] {
  // Maps are Partial (Indonesian BETA ships a starter set). When a goal-specific
  // pack is missing, fall back to THIS language's own default pack — never to
  // English, so an Indonesian learner never gets English target phrases.
  const langPacks = DAILY_SPEAKING_PACKS[lang];
  const pack = langPacks?.[goal ?? "default"] ?? langPacks?.default ?? [];
  return pack.map((phrase) => toDailyPhrase(lang, phrase, goal ?? undefined));
}

export function getDailySpeakingSentenceLoop(lang: DailySpeakingLanguage, goal: LearningGoal | null): DailySpeakingPhrase[] {
  const practiceContext = goal ?? "unknown";
  const goalSentences = goal ? getDailySpeakingPhrasePack(lang, goal) : [];
  const goalBoosters = goal ? (DAILY_GOAL_BOOSTERS[lang]?.[goal] ?? []) : [];
  const survivalSentences = (DAILY_SPEAKING_PACKS[lang]?.default ?? []).map((phrase) => toDailyPhrase(lang, phrase, practiceContext));
  const starterSentences = (DAILY_SPEAKING_STARTERS[lang] ?? []).map((phrase) => toDailyPhrase(lang, phrase, practiceContext));
  const boosterSentences = goalBoosters.map((phrase) => toDailyPhrase(lang, phrase, practiceContext));
  const seen = new Set<string>();
  const loop: DailySpeakingPhrase[] = [];
  for (const phrase of [...goalSentences, ...boosterSentences, ...survivalSentences, ...starterSentences]) {
    if (seen.has(phrase.phrase)) continue;
    seen.add(phrase.phrase);
    loop.push(phrase);
  }
  return loop;
}

export function getDailySpeakingSurvivalCoverage(lang: DailySpeakingLanguage): SurvivalPhraseCoverage[] {
  // SURVIVAL_PHRASE_FAMILIES is Partial; languages without an authored family
  // map (e.g. Indonesian BETA) simply report no survival coverage.
  const families = SURVIVAL_PHRASE_FAMILIES[lang];
  if (!families) return [];
  return Object.entries(families).map(([family, phrases]) => {
    const phraseSet = new Set(phrases);
    const loopHits: LearningGoal[] = [];
    const contextTips: string[] = [];
    for (const goal of DAILY_SPEAKING_GOALS) {
      const match = getDailySpeakingSentenceLoop(lang, goal).find((phrase) => phraseSet.has(phrase.phrase));
      if (!match) continue;
      loopHits.push(goal);
      if (match.contextTip) contextTips.push(match.contextTip);
    }
    return {
      family: family as SurvivalPhraseFamily,
      phrases,
      loopHits,
      contextTips,
      exposures: loopHits.length,
    };
  });
}

export function getDailySpeakingMissionPhrase(
  lang: DailySpeakingLanguage,
  goal: LearningGoal | null,
  spokenCount: number
): DailySpeakingPhrase | null {
  const loop = getDailySpeakingSentenceLoop(lang, goal);
  if (loop.length === 0) return null;
  return loop[Math.max(0, spokenCount) % loop.length];
}
