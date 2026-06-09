import type { LearningGoal } from "@/lib/learnerProfile";
import { SPEAKING_DAILY_GOAL } from "@/lib/speakingProgress";

export type DailySpeakingLanguage = "korean" | "english" | "spanish" | "indonesian" | "arabic";

export type DailySpeakingPhrase = {
  phrase: string;
  ipa: string;
  // Indonesian (BETA) target content does not always carry every native-language
  // meaning, so this is Partial. Accessors fall back through the available keys.
  meanings: Partial<Record<DailySpeakingLanguage, string>>;
  level: "A1";
  speechLang: "ko-KR" | "en-US" | "es-ES" | "id-ID" | "ar-EG";
  tip: string;
  // Localized variants of `tip` in the reader's native language. `tip` (English)
  // is the fallback when a native-language variant is missing.
  tipKo?: string;
  tipEs?: string;
  tipId?: string;
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
  // Localized `tip` variants by native language; `tip` (English) is the fallback.
  tipKo?: string;
  tipEs?: string;
  tipId?: string;
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
      { word: "안녕하세요", ipa: "/an.njʌŋ.ha.se.jo/", meaning: "Hello", meaningEs: "Hola", speechLang: "ko-KR", tip: "A real first greeting. Keep each syllable even and gentle.", tipKo: "진짜 첫 인사예요. 한 음절씩 고르고 부드럽게 발음하세요.", tipEs: "Un primer saludo de verdad. Pronuncia cada sílaba de forma pareja y suave.", tipId: "Sapaan pertama yang nyata. Ucapkan tiap suku kata dengan rata dan lembut." },
      { word: "감사합니다", ipa: "/kam.sa.ham.ni.da/", meaning: "Thank you", meaningEs: "Gracias", speechLang: "ko-KR", tip: "Say all five syllables evenly: gam-sa-ham-ni-da.", tipKo: "다섯 음절을 고르게 발음하세요: gam-sa-ham-ni-da.", tipEs: "Pronuncia las cinco sílabas de forma pareja: gam-sa-ham-ni-da.", tipId: "Ucapkan kelima suku kata dengan rata: gam-sa-ham-ni-da." },
      { word: "이해 못 했어요.", ipa: "/i.hɛ mot hɛ.sʌ.jo/", meaning: "I did not understand.", meaningEs: "No entendí.", speechLang: "ko-KR", tip: "A useful repair sentence. Keep 못 short and clear.", tipKo: "유용한 대화 복구 문장이에요. 못은 짧고 분명하게 발음하세요.", tipEs: "Una frase útil para retomar la conversación. Mantén 못 corto y claro.", tipId: "Kalimat perbaikan yang berguna. Ucapkan 못 dengan singkat dan jelas." },
      { word: "다시 말해 주세요.", ipa: "/ta.ɕi ma.ɾɛ dʑu.se.jo/", meaning: "Please say it again.", meaningEs: "Dilo otra vez, por favor.", speechLang: "ko-KR", tip: "Link 말해 주세요 as one polite request.", tipKo: "말해 주세요를 하나의 정중한 부탁처럼 이어서 발음하세요.", tipEs: "Une 말해 주세요 como una sola petición cortés.", tipId: "Sambungkan 말해 주세요 sebagai satu permintaan yang sopan." },
    ],
    travel: [
      { word: "화장실 어디예요?", ipa: "/hwa.dʑaŋ.ɕil ʌ.di.je.jo/", meaning: "Where is the bathroom?", meaningEs: "¿Dónde está el baño?", speechLang: "ko-KR", tip: "Say it as one helpful question. Let the pitch rise at the end.", tipKo: "도움을 청하는 하나의 질문처럼 말하세요. 끝에서 음을 올리세요.", tipEs: "Dilo como una sola pregunta útil. Deja que el tono suba al final.", tipId: "Ucapkan sebagai satu pertanyaan yang membantu. Naikkan nada di akhir." },
      { word: "얼마예요?", ipa: "/ʌl.ma.je.jo/", meaning: "How much is it?", meaningEs: "¿Cuánto cuesta?", speechLang: "ko-KR", tip: "Raise pitch at the end to signal a question.", tipKo: "끝에서 음을 올려 질문임을 나타내세요.", tipEs: "Sube el tono al final para indicar que es una pregunta.", tipId: "Naikkan nada di akhir untuk menandakan pertanyaan." },
      { word: "도와주세요.", ipa: "/to.wa.dʑu.se.jo/", meaning: "Please help me.", meaningEs: "Ayúdame, por favor.", speechLang: "ko-KR", tip: "The 와 smoothly follows 도. Link them together.", tipKo: "와는 도 뒤에 부드럽게 이어져요. 둘을 연결해서 발음하세요.", tipEs: "La 와 sigue suavemente a la 도. Únelas al pronunciar.", tipId: "Bunyi 와 mengalir lembut setelah 도. Sambungkan keduanya." },
      { word: "물 주세요.", ipa: "/mul dʑu.se.jo/", meaning: "Water, please.", meaningEs: "Agua, por favor.", speechLang: "ko-KR", tip: "A real survival request. Keep 주세요 polite and smooth.", tipKo: "실전에서 쓰는 생존 부탁이에요. 주세요는 정중하고 부드럽게 발음하세요.", tipEs: "Una petición de supervivencia real. Mantén 주세요 cortés y fluido.", tipId: "Permintaan bertahan hidup yang nyata. Jaga 주세요 tetap sopan dan halus." },
    ],
    work: [
      { word: "다시 말해 주세요.", ipa: "/ta.ɕi ma.ɾɛ dʑu.se.jo/", meaning: "Please say it again.", meaningEs: "Repítelo, por favor.", speechLang: "ko-KR", tip: "A useful meeting repair phrase. Say it calmly.", tipKo: "회의에서 유용한 대화 복구 문장이에요. 차분하게 말하세요.", tipEs: "Una frase útil para retomar el hilo en una reunión. Dila con calma.", tipId: "Frasa perbaikan yang berguna saat rapat. Ucapkan dengan tenang." },
      { word: "이해 못 했어요.", ipa: "/i.hɛ mot hɛ.sʌ.jo/", meaning: "I did not understand.", meaningEs: "No entendí.", speechLang: "ko-KR", tip: "It is okay to ask for help. Keep 못 short.", tipKo: "도움을 청해도 괜찮아요. 못은 짧게 발음하세요.", tipEs: "Está bien pedir ayuda. Mantén 못 corto.", tipId: "Tidak apa-apa meminta bantuan. Ucapkan 못 dengan singkat." },
      { word: "감사합니다", ipa: "/kam.sa.ham.ni.da/", meaning: "Thank you", meaningEs: "Gracias", speechLang: "ko-KR", tip: "End politely and clearly.", tipKo: "정중하고 분명하게 끝맺으세요.", tipEs: "Termina con cortesía y claridad.", tipId: "Akhiri dengan sopan dan jelas." },
      { word: "도와주세요.", ipa: "/to.wa.dʑu.se.jo/", meaning: "Please help me.", meaningEs: "Ayúdame, por favor.", speechLang: "ko-KR", tip: "A real workplace survival phrase. Keep it calm and polite.", tipKo: "직장에서 실제로 쓰는 생존 문장이에요. 차분하고 정중하게 말하세요.", tipEs: "Una frase de supervivencia real en el trabajo. Mantenla calmada y cortés.", tipId: "Frasa bertahan hidup nyata di tempat kerja. Jaga tetap tenang dan sopan." },
    ],
    study: [
      { word: "이해 못 했어요.", ipa: "/i.hɛ mot hɛ.sʌ.jo/", meaning: "I did not understand.", meaningEs: "No entendí.", speechLang: "ko-KR", tip: "A classroom survival sentence. Say it without fear.", tipKo: "교실에서 쓰는 생존 문장이에요. 두려워하지 말고 말하세요.", tipEs: "Una frase de supervivencia en clase. Dila sin miedo.", tipId: "Kalimat bertahan hidup di kelas. Ucapkan tanpa rasa takut." },
      { word: "다시 말해 주세요.", ipa: "/ta.ɕi ma.ɾɛ dʑu.se.jo/", meaning: "Please say it again.", meaningEs: "Repítelo, por favor.", speechLang: "ko-KR", tip: "Link 말해 주세요 naturally.", tipKo: "말해 주세요를 자연스럽게 이어서 발음하세요.", tipEs: "Une 말해 주세요 de forma natural.", tipId: "Sambungkan 말해 주세요 secara alami." },
      { word: "감사합니다", ipa: "/kam.sa.ham.ni.da/", meaning: "Thank you", meaningEs: "Gracias", speechLang: "ko-KR", tip: "Say all syllables evenly.", tipKo: "모든 음절을 고르게 발음하세요.", tipEs: "Pronuncia todas las sílabas de forma pareja.", tipId: "Ucapkan semua suku kata dengan rata." },
      { word: "도와주세요.", ipa: "/to.wa.dʑu.se.jo/", meaning: "Please help me.", meaningEs: "Ayúdame, por favor.", speechLang: "ko-KR", tip: "Ask for help before you freeze.", tipKo: "얼어붙기 전에 도움을 청하세요.", tipEs: "Pide ayuda antes de bloquearte.", tipId: "Minta bantuan sebelum kamu membeku." },
    ],
    hobby: [
      { word: "음악 좋아해요.", ipa: "/ɯ.mak tɕo.a.hɛ.jo/", meaning: "I like music.", meaningEs: "Me gusta la música.", speechLang: "ko-KR", tip: "Link 좋아해요 naturally: jo-a-hae-yo.", tipKo: "좋아해요를 자연스럽게 이어서 발음하세요: jo-a-hae-yo.", tipEs: "Une 좋아해요 de forma natural: jo-a-hae-yo.", tipId: "Sambungkan 좋아해요 secara alami: jo-a-hae-yo." },
      { word: "좋아요.", ipa: "/tɕo.a.jo/", meaning: "I like it.", meaningEs: "Me gusta.", speechLang: "ko-KR", tip: "A tiny sentence you can use everywhere.", tipKo: "어디서나 쓸 수 있는 아주 짧은 문장이에요.", tipEs: "Una frase diminuta que puedes usar en cualquier lugar.", tipId: "Kalimat mungil yang bisa kamu pakai di mana saja." },
      { word: "다시 말해 주세요.", ipa: "/ta.ɕi ma.ɾɛ dʑu.se.jo/", meaning: "Please say it again.", meaningEs: "Dilo otra vez, por favor.", speechLang: "ko-KR", tip: "Use this when lyrics or dialogue are too fast.", tipKo: "가사나 대사가 너무 빠를 때 이걸 쓰세요.", tipEs: "Úsala cuando la letra o el diálogo van demasiado rápido.", tipId: "Pakai ini saat lirik atau dialog terlalu cepat." },
      { word: "이해 못 했어요.", ipa: "/i.hɛ mot hɛ.sʌ.jo/", meaning: "I did not understand.", meaningEs: "No entendí.", speechLang: "ko-KR", tip: "Repair the conversation without switching languages.", tipKo: "언어를 바꾸지 않고 대화를 다시 이어 가세요.", tipEs: "Retoma la conversación sin cambiar de idioma.", tipId: "Perbaiki percakapan tanpa berganti bahasa." },
    ],
    relationship: [
      { word: "반갑습니다.", ipa: "/pan.gap.sɯm.ni.da/", meaning: "Nice to meet you.", meaningEs: "Mucho gusto.", speechLang: "ko-KR", tip: "A warm first-meeting sentence. Let 습니다 finish softly.", tipKo: "따뜻한 첫 만남 문장이에요. 습니다를 부드럽게 끝맺으세요.", tipEs: "Una cálida frase de primer encuentro. Deja que 습니다 termine suavemente.", tipId: "Kalimat hangat untuk pertemuan pertama. Akhiri 습니다 dengan lembut." },
      { word: "감사합니다", ipa: "/kam.sa.ham.ni.da/", meaning: "Thank you", meaningEs: "Gracias", speechLang: "ko-KR", tip: "A relationship-saving sentence. Say it often.", tipKo: "관계를 지켜 주는 문장이에요. 자주 말하세요.", tipEs: "Una frase que salva relaciones. Dila a menudo.", tipId: "Kalimat penyelamat hubungan. Ucapkan sesering mungkin." },
      { word: "죄송합니다", ipa: "/tɕø.soŋ.ham.ni.da/", meaning: "I am sorry.", meaningEs: "Lo siento.", speechLang: "ko-KR", tip: "Keep the 죄 vowel rounded and gentle.", tipKo: "죄의 모음을 둥글고 부드럽게 발음하세요.", tipEs: "Mantén la vocal de 죄 redondeada y suave.", tipId: "Jaga vokal pada 죄 tetap bulat dan lembut." },
      { word: "다시 말해 주세요.", ipa: "/ta.ɕi ma.ɾɛ dʑu.se.jo/", meaning: "Please say it again.", meaningEs: "Dilo otra vez, por favor.", speechLang: "ko-KR", tip: "Asking again keeps the conversation alive.", tipKo: "다시 물어보면 대화가 계속 이어져요.", tipEs: "Volver a preguntar mantiene viva la conversación.", tipId: "Bertanya lagi membuat percakapan tetap hidup." },
    ],
    exam: [
      { word: "시험이 언제예요?", ipa: "/si.hʌ.mi ʌn.dʑe.je.jo/", meaning: "When is the exam?", meaningEs: "¿Cuándo es el examen?", speechLang: "ko-KR", tip: "A practical test-day question. Let the pitch rise at the end.", tipKo: "시험 날 유용한 질문이에요. 끝에서 음을 올리세요.", tipEs: "Una pregunta práctica para el día del examen. Deja que el tono suba al final.", tipId: "Pertanyaan praktis di hari ujian. Naikkan nada di akhir." },
      { word: "질문 있어요.", ipa: "/tɕil.mun i.sʌ.jo/", meaning: "I have a question.", meaningEs: "Tengo una pregunta.", speechLang: "ko-KR", tip: "A real classroom sentence. Say it before you freeze.", tipKo: "교실에서 실제로 쓰는 문장이에요. 얼어붙기 전에 말하세요.", tipEs: "Una frase de clase real. Dila antes de bloquearte.", tipId: "Kalimat kelas yang nyata. Ucapkan sebelum kamu membeku." },
      { word: "다시 설명해 주세요.", ipa: "/ta.ɕi sʌl.mjʌŋ.hɛ dʑu.se.jo/", meaning: "Please explain again.", meaningEs: "Explícalo otra vez, por favor.", speechLang: "ko-KR", tip: "Link 설명해 주세요 as one polite request.", tipKo: "설명해 주세요를 하나의 정중한 부탁처럼 이어서 발음하세요.", tipEs: "Une 설명해 주세요 como una sola petición cortés.", tipId: "Sambungkan 설명해 주세요 sebagai satu permintaan yang sopan." },
      { word: "준비됐어요.", ipa: "/tɕun.bi.dwɛ.sʌ.jo/", meaning: "I am ready.", meaningEs: "Estoy listo.", speechLang: "ko-KR", tip: "Short and useful before a speaking task.", tipKo: "말하기 과제 전에 짧고 유용한 문장이에요.", tipEs: "Corta y útil antes de una tarea de habla.", tipId: "Singkat dan berguna sebelum tugas berbicara." },
    ],
  },
  english: {
    default: [
      { word: "Hello", ipa: "/həˈloʊ/", meaning: "안녕하세요", meaningEs: "Hola", speechLang: "en-US", tip: "Stress the second syllable: heh-LO.", tipKo: "두 번째 음절에 강세를 두세요: heh-LO.", tipEs: "Acentúa la segunda sílaba: heh-LO.", tipId: "Tekankan suku kata kedua: heh-LO." },
      { word: "Thank you.", ipa: "/θæŋk juː/", meaning: "감사합니다.", meaningEs: "Gracias.", speechLang: "en-US", tip: "Keep the TH soft and the final you clear.", tipKo: "TH는 부드럽게, 마지막 you는 분명하게 발음하세요.", tipEs: "Mantén la TH suave y el 'you' final claro.", tipId: "Jaga bunyi TH tetap lembut dan 'you' di akhir tetap jelas." },
      { word: "I don't understand.", ipa: "/aɪ doʊnt ˌʌn.dərˈstænd/", meaning: "이해 못 했어요.", meaningEs: "No entiendo.", speechLang: "en-US", tip: "A real repair sentence. Do not rush understand.", tipKo: "실전에서 쓰는 대화 복구 문장이에요. understand를 서두르지 마세요.", tipEs: "Una frase real para retomar la conversación. No apresures 'understand'.", tipId: "Kalimat perbaikan yang nyata. Jangan terburu-buru pada 'understand'." },
      { word: "Can you say that again?", ipa: "/kæn juː seɪ ðæt əˈɡen/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "¿Puedes repetirlo?", speechLang: "en-US", tip: "Link can-you softly, then slow down on again.", tipKo: "can-you를 부드럽게 이은 뒤 again에서 천천히 발음하세요.", tipEs: "Une 'can-you' suavemente y luego baja la velocidad en 'again'.", tipId: "Sambungkan 'can-you' dengan lembut, lalu perlambat pada 'again'." },
    ],
    travel: [
      { word: "Where is the bathroom?", ipa: "/wɛr ɪz ðə ˈbæθ.ruːm/", meaning: "화장실이 어디예요?", meaningEs: "¿Dónde está el baño?", speechLang: "en-US", tip: "Keep it practical. Link 'where is' smoothly.", tipKo: "실용적으로 말하세요. 'where is'를 부드럽게 이으세요.", tipEs: "Mantenlo práctico. Une 'where is' suavemente.", tipId: "Buat tetap praktis. Sambungkan 'where is' dengan halus." },
      { word: "How much is it?", ipa: "/haʊ mʌtʃ ɪz ɪt/", meaning: "얼마예요?", meaningEs: "¿Cuánto cuesta?", speechLang: "en-US", tip: "One quick shopping question. Keep much short.", tipKo: "쇼핑할 때 쓰는 짧고 빠른 질문이에요. much를 짧게 발음하세요.", tipEs: "Una pregunta rápida de compras. Mantén 'much' corto.", tipId: "Satu pertanyaan belanja yang cepat. Ucapkan 'much' dengan singkat." },
      { word: "Please help me.", ipa: "/pliːz hɛlp miː/", meaning: "도와주세요.", meaningEs: "Ayúdame, por favor.", speechLang: "en-US", tip: "Slow and clear is best in an emergency.", tipKo: "비상시에는 천천히 또박또박 말하는 것이 가장 좋아요.", tipEs: "En una emergencia, lo mejor es hablar despacio y claro.", tipId: "Saat darurat, paling baik bicara pelan dan jelas." },
      { word: "I need water.", ipa: "/aɪ niːd ˈwɔː.tər/", meaning: "물이 필요해요.", meaningEs: "Necesito agua.", speechLang: "en-US", tip: "A survival sentence. Make need strong and clear.", tipKo: "생존 문장이에요. need를 강하고 분명하게 발음하세요.", tipEs: "Una frase de supervivencia. Haz 'need' fuerte y claro.", tipId: "Kalimat bertahan hidup. Ucapkan 'need' dengan kuat dan jelas." },
    ],
    work: [
      { word: "Can you say that again?", ipa: "/kæn juː seɪ ðæt əˈɡen/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "¿Puedes repetirlo?", speechLang: "en-US", tip: "Useful in meetings. Say it calmly.", tipKo: "회의에서 유용해요. 차분하게 말하세요.", tipEs: "Útil en reuniones. Dilo con calma.", tipId: "Berguna saat rapat. Ucapkan dengan tenang." },
      { word: "I don't understand.", ipa: "/aɪ doʊnt ˌʌn.dərˈstænd/", meaning: "이해 못 했어요.", meaningEs: "No entiendo.", speechLang: "en-US", tip: "A safe repair phrase. It keeps the conversation moving.", tipKo: "안전한 대화 복구 표현이에요. 대화를 계속 이어가게 해 줘요.", tipEs: "Una frase segura para retomar. Mantiene la conversación en marcha.", tipId: "Frasa perbaikan yang aman. Membuat percakapan terus berjalan." },
      { word: "Thank you.", ipa: "/θæŋk juː/", meaning: "감사합니다.", meaningEs: "Gracias.", speechLang: "en-US", tip: "Short, real, and useful every day.", tipKo: "짧고, 실용적이며, 매일 쓸 수 있어요.", tipEs: "Corto, real y útil cada día.", tipId: "Singkat, nyata, dan berguna setiap hari." },
      { word: "Please help me.", ipa: "/pliːz hɛlp miː/", meaning: "도와주세요.", meaningEs: "Ayúdame, por favor.", speechLang: "en-US", tip: "Slow and clear works best when you need support.", tipKo: "도움이 필요할 때는 천천히 또박또박 말하는 것이 가장 좋아요.", tipEs: "Hablar despacio y claro funciona mejor cuando necesitas ayuda.", tipId: "Bicara pelan dan jelas paling efektif saat kamu butuh bantuan." },
    ],
    study: [
      { word: "I don't understand.", ipa: "/aɪ doʊnt ˌʌn.dərˈstænd/", meaning: "이해 못 했어요.", meaningEs: "No entiendo.", speechLang: "en-US", tip: "Say it before panic. It is a learning sentence.", tipKo: "당황하기 전에 말하세요. 배움의 문장이에요.", tipEs: "Dilo antes de entrar en pánico. Es una frase de aprendizaje.", tipId: "Ucapkan sebelum panik. Ini kalimat untuk belajar." },
      { word: "Can you say that again?", ipa: "/kæn juː seɪ ðæt əˈɡen/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "¿Puedes repetirlo?", speechLang: "en-US", tip: "A classroom survival phrase.", tipKo: "교실에서 쓰는 생존 표현이에요.", tipEs: "Una frase de supervivencia para el aula.", tipId: "Frasa bertahan hidup di kelas." },
      { word: "Thank you.", ipa: "/θæŋk juː/", meaning: "감사합니다.", meaningEs: "Gracias.", speechLang: "en-US", tip: "End the exchange politely.", tipKo: "대화를 정중하게 끝맺으세요.", tipEs: "Termina el intercambio con cortesía.", tipId: "Akhiri percakapan dengan sopan." },
      { word: "Please help me.", ipa: "/pliːz hɛlp miː/", meaning: "도와주세요.", meaningEs: "Ayúdame, por favor.", speechLang: "en-US", tip: "Ask for help before you freeze.", tipKo: "얼어붙기 전에 도움을 청하세요.", tipEs: "Pide ayuda antes de bloquearte.", tipId: "Minta bantuan sebelum kamu membeku." },
    ],
    hobby: [
      { word: "I like music.", ipa: "/aɪ laɪk ˈmjuː.zɪk/", meaning: "저는 음악을 좋아해요.", meaningEs: "Me gusta la música.", speechLang: "en-US", tip: "Short and useful. Make 'like' clear but relaxed.", tipKo: "짧고 유용해요. 'like'를 분명하지만 편안하게 발음하세요.", tipEs: "Corta y útil. Haz 'like' claro pero relajado.", tipId: "Singkat dan berguna. Ucapkan 'like' dengan jelas tapi santai." },
      { word: "I like it.", ipa: "/aɪ laɪk ɪt/", meaning: "마음에 들어요.", meaningEs: "Me gusta.", speechLang: "en-US", tip: "A tiny opinion sentence you can use anywhere.", tipKo: "어디서나 쓸 수 있는 아주 짧은 의견 문장이에요.", tipEs: "Una frase de opinión diminuta que puedes usar en cualquier lugar.", tipId: "Kalimat pendapat mungil yang bisa kamu pakai di mana saja." },
      { word: "Can you say that again?", ipa: "/kæn juː seɪ ðæt əˈɡen/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "¿Puedes repetirlo?", speechLang: "en-US", tip: "Use it with songs, shows, and fast speech.", tipKo: "노래, 방송, 빠른 말에 쓰세요.", tipEs: "Úsala con canciones, programas y habla rápida.", tipId: "Pakai dengan lagu, acara, dan ucapan cepat." },
      { word: "I don't understand.", ipa: "/aɪ doʊnt ˌʌn.dərˈstænd/", meaning: "이해 못 했어요.", meaningEs: "No entiendo.", speechLang: "en-US", tip: "A useful sentence when subtitles disappear.", tipKo: "자막이 사라졌을 때 유용한 문장이에요.", tipEs: "Una frase útil cuando desaparecen los subtítulos.", tipId: "Kalimat berguna saat subtitle menghilang." },
    ],
    relationship: [
      { word: "Nice to meet you.", ipa: "/naɪs tə miːt juː/", meaning: "반갑습니다.", meaningEs: "Mucho gusto.", speechLang: "en-US", tip: "Say it warmly as one phrase: nice-tuh-meet-you.", tipKo: "하나의 문구처럼 따뜻하게 말하세요: nice-tuh-meet-you.", tipEs: "Dilo con calidez como una sola frase: nice-tuh-meet-you.", tipId: "Ucapkan dengan hangat sebagai satu frasa: nice-tuh-meet-you." },
      { word: "Thank you.", ipa: "/θæŋk juː/", meaning: "감사합니다.", meaningEs: "Gracias.", speechLang: "en-US", tip: "Gratitude keeps a conversation warm.", tipKo: "감사 표현은 대화를 따뜻하게 유지해 줘요.", tipEs: "La gratitud mantiene cálida la conversación.", tipId: "Rasa terima kasih membuat percakapan tetap hangat." },
      { word: "I'm sorry.", ipa: "/aɪm ˈsɑː.ri/", meaning: "미안해요.", meaningEs: "Lo siento.", speechLang: "en-US", tip: "Keep sorry soft and sincere.", tipKo: "sorry를 부드럽고 진심 어리게 발음하세요.", tipEs: "Mantén 'sorry' suave y sincero.", tipId: "Ucapkan 'sorry' dengan lembut dan tulus." },
      { word: "Can you say that again?", ipa: "/kæn juː seɪ ðæt əˈɡen/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "¿Puedes repetirlo?", speechLang: "en-US", tip: "Asking again is part of real conversation.", tipKo: "다시 물어보는 것도 실제 대화의 일부예요.", tipEs: "Volver a preguntar es parte de una conversación real.", tipId: "Bertanya lagi adalah bagian dari percakapan nyata." },
    ],
    exam: [
      { word: "When is the exam?", ipa: "/wen ɪz ði ɪgˈzæm/", meaning: "시험이 언제예요?", meaningEs: "¿Cuándo es el examen?", speechLang: "en-US", tip: "A real scheduling question. Stress exam at the end.", tipKo: "실제 일정을 묻는 질문이에요. 끝의 exam에 강세를 두세요.", tipEs: "Una pregunta real sobre horarios. Acentúa 'exam' al final.", tipId: "Pertanyaan jadwal yang nyata. Tekankan 'exam' di akhir." },
      { word: "I have a question.", ipa: "/aɪ hæv ə ˈkwes.tʃən/", meaning: "질문 있어요.", meaningEs: "Tengo una pregunta.", speechLang: "en-US", tip: "Say it calmly before you get stuck.", tipKo: "막히기 전에 차분하게 말하세요.", tipEs: "Dilo con calma antes de quedarte atascado.", tipId: "Ucapkan dengan tenang sebelum kamu tersendat." },
      { word: "Please explain again.", ipa: "/pliːz ɪkˈspleɪn əˈgen/", meaning: "다시 설명해 주세요.", meaningEs: "Explícalo otra vez, por favor.", speechLang: "en-US", tip: "Keep please soft, then slow down on explain.", tipKo: "please를 부드럽게, explain에서 천천히 발음하세요.", tipEs: "Mantén 'please' suave y luego baja la velocidad en 'explain'.", tipId: "Jaga 'please' tetap lembut, lalu perlambat pada 'explain'." },
      { word: "I'm ready.", ipa: "/aɪm ˈred.i/", meaning: "준비됐어요.", meaningEs: "Estoy listo.", speechLang: "en-US", tip: "A short confidence sentence before a test.", tipKo: "시험 전에 쓰는 짧은 자신감 문장이에요.", tipEs: "Una frase corta de confianza antes de un examen.", tipId: "Kalimat percaya diri yang singkat sebelum ujian." },
    ],
  },
  spanish: {
    default: [
      { word: "Hola", ipa: "/ˈo.la/", meaning: "안녕하세요", meaningEs: "Hello", speechLang: "es-ES", tip: "The 'h' is silent in Spanish.", tipKo: "스페인어에서 'h'는 소리 나지 않아요.", tipEs: "La 'h' es muda en español.", tipId: "Huruf 'h' tidak dibunyikan dalam bahasa Spanyol." },
      { word: "Gracias.", ipa: "/ˈɡɾa.sjas/", meaning: "감사합니다.", meaningEs: "Thank you.", speechLang: "es-ES", tip: "Tap the r lightly, then keep the vowels clean.", tipKo: "r을 가볍게 튕긴 뒤 모음을 깨끗하게 발음하세요.", tipEs: "Toca la r suavemente y mantén las vocales limpias.", tipId: "Sentuh huruf r dengan ringan, lalu jaga vokal tetap jernih." },
      { word: "No entiendo.", ipa: "/no enˈtjen.do/", meaning: "이해 못 했어요.", meaningEs: "I don't understand.", speechLang: "es-ES", tip: "A real repair sentence. Stress TIE in entiendo.", tipKo: "실전에서 쓰는 대화 복구 문장이에요. entiendo의 TIE에 강세를 두세요.", tipEs: "Una frase real para retomar la conversación. Acentúa TIE en 'entiendo'.", tipId: "Kalimat perbaikan yang nyata. Tekankan TIE pada 'entiendo'." },
      { word: "¿Puedes repetirlo?", ipa: "/ˈpwe.des re.peˈtir.lo/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "Can you say that again?", speechLang: "es-ES", tip: "A useful sentence when speech is too fast.", tipKo: "말이 너무 빠를 때 유용한 문장이에요.", tipEs: "Una frase útil cuando el habla va demasiado rápido.", tipId: "Kalimat berguna saat ucapan terlalu cepat." },
    ],
    travel: [
      { word: "¿Dónde está el baño?", ipa: "/ˈdon.de esˈta el ˈba.ɲo/", meaning: "화장실이 어디예요?", meaningEs: "Where is the bathroom?", speechLang: "es-ES", tip: "A real travel sentence. Keep the vowels clean and short.", tipKo: "실전 여행 문장이에요. 모음을 깨끗하고 짧게 발음하세요.", tipEs: "Una frase de viaje real. Mantén las vocales limpias y cortas.", tipId: "Kalimat perjalanan yang nyata. Jaga vokal tetap jernih dan pendek." },
      { word: "¿Cuánto cuesta?", ipa: "/ˈkwan.to ˈkwes.ta/", meaning: "얼마예요?", meaningEs: "How much is it?", speechLang: "es-ES", tip: "A shopping survival question. Keep cuesta crisp.", tipKo: "쇼핑할 때 쓰는 생존 질문이에요. cuesta를 또렷하게 발음하세요.", tipEs: "Una pregunta de supervivencia al comprar. Mantén 'cuesta' nítido.", tipId: "Pertanyaan bertahan hidup saat belanja. Ucapkan 'cuesta' dengan jelas." },
      { word: "Ayúdame, por favor.", ipa: "/aˈʝu.ða.me poɾ faˈβoɾ/", meaning: "도와주세요.", meaningEs: "Please help me.", speechLang: "es-ES", tip: "Say it slowly and clearly. It is a real emergency phrase.", tipKo: "천천히 또박또박 말하세요. 실제 비상 표현이에요.", tipEs: "Dilo despacio y claro. Es una frase real de emergencia.", tipId: "Ucapkan dengan pelan dan jelas. Ini frasa darurat yang nyata." },
      { word: "Necesito agua.", ipa: "/ne.θeˈsi.to ˈa.ɣwa/", meaning: "물이 필요해요.", meaningEs: "I need water.", speechLang: "es-ES", tip: "Keep agua in two smooth syllables: a-gua.", tipKo: "agua를 부드러운 두 음절로 발음하세요: a-gua.", tipEs: "Mantén 'agua' en dos sílabas suaves: a-gua.", tipId: "Ucapkan 'agua' dalam dua suku kata yang halus: a-gua." },
    ],
    work: [
      { word: "¿Puedes repetirlo?", ipa: "/ˈpwe.des re.peˈtir.lo/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "Can you say that again?", speechLang: "es-ES", tip: "Useful in meetings. Stress TIR in repetirlo.", tipKo: "회의에서 유용해요. repetirlo의 TIR에 강세를 두세요.", tipEs: "Útil en reuniones. Acentúa TIR en 'repetirlo'.", tipId: "Berguna saat rapat. Tekankan TIR pada 'repetirlo'." },
      { word: "No entiendo.", ipa: "/no enˈtjen.do/", meaning: "이해 못 했어요.", meaningEs: "I don't understand.", speechLang: "es-ES", tip: "A safe repair phrase. Say it before you freeze.", tipKo: "안전한 대화 복구 표현이에요. 얼어붙기 전에 말하세요.", tipEs: "Una frase segura para retomar. Dila antes de bloquearte.", tipId: "Frasa perbaikan yang aman. Ucapkan sebelum kamu membeku." },
      { word: "Gracias.", ipa: "/ˈɡɾa.sjas/", meaning: "감사합니다.", meaningEs: "Thank you.", speechLang: "es-ES", tip: "Short, real, and useful every day.", tipKo: "짧고, 실용적이며, 매일 쓸 수 있어요.", tipEs: "Corta, real y útil cada día.", tipId: "Singkat, nyata, dan berguna setiap hari." },
      { word: "Ayúdame, por favor.", ipa: "/aˈʝu.ða.me poɾ faˈβoɾ/", meaning: "도와주세요.", meaningEs: "Please help me.", speechLang: "es-ES", tip: "A real support request. Say it slowly and clearly.", tipKo: "실제 도움을 청하는 표현이에요. 천천히 또박또박 말하세요.", tipEs: "Una petición de apoyo real. Dila despacio y claro.", tipId: "Permintaan bantuan yang nyata. Ucapkan dengan pelan dan jelas." },
    ],
    study: [
      { word: "No entiendo.", ipa: "/no enˈtjen.do/", meaning: "이해 못 했어요.", meaningEs: "I don't understand.", speechLang: "es-ES", tip: "This sentence keeps learning moving.", tipKo: "이 문장은 배움을 계속 이어가게 해 줘요.", tipEs: "Esta frase mantiene el aprendizaje en marcha.", tipId: "Kalimat ini membuat proses belajar terus berjalan." },
      { word: "¿Puedes repetirlo?", ipa: "/ˈpwe.des re.peˈtir.lo/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "Can you say that again?", speechLang: "es-ES", tip: "A classroom survival phrase.", tipKo: "교실에서 쓰는 생존 표현이에요.", tipEs: "Una frase de supervivencia para el aula.", tipId: "Frasa bertahan hidup di kelas." },
      { word: "Gracias.", ipa: "/ˈɡɾa.sjas/", meaning: "감사합니다.", meaningEs: "Thank you.", speechLang: "es-ES", tip: "End the exchange politely.", tipKo: "대화를 정중하게 끝맺으세요.", tipEs: "Termina el intercambio con cortesía.", tipId: "Akhiri percakapan dengan sopan." },
      { word: "Ayúdame, por favor.", ipa: "/aˈʝu.ða.me poɾ faˈβoɾ/", meaning: "도와주세요.", meaningEs: "Please help me.", speechLang: "es-ES", tip: "Ask for help before you freeze.", tipKo: "얼어붙기 전에 도움을 청하세요.", tipEs: "Pide ayuda antes de bloquearte.", tipId: "Minta bantuan sebelum kamu membeku." },
    ],
    hobby: [
      { word: "Me gusta la música.", ipa: "/me ˈɡus.ta la ˈmu.si.ka/", meaning: "저는 음악을 좋아해요.", meaningEs: "I like music.", speechLang: "es-ES", tip: "Stress MÚ-si-ca. Keep 'me gusta' connected.", tipKo: "MÚ-si-ca에 강세를 두세요. 'me gusta'를 이어서 발음하세요.", tipEs: "Acentúa MÚ-si-ca. Mantén 'me gusta' conectado.", tipId: "Tekankan MÚ-si-ca. Sambungkan 'me gusta'." },
      { word: "Me gusta.", ipa: "/me ˈɡus.ta/", meaning: "마음에 들어요.", meaningEs: "I like it.", speechLang: "es-ES", tip: "A tiny opinion sentence you can use everywhere.", tipKo: "어디서나 쓸 수 있는 아주 짧은 의견 문장이에요.", tipEs: "Una frase de opinión diminuta que puedes usar en cualquier lugar.", tipId: "Kalimat pendapat mungil yang bisa kamu pakai di mana saja." },
      { word: "¿Puedes repetirlo?", ipa: "/ˈpwe.des re.peˈtir.lo/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "Can you say that again?", speechLang: "es-ES", tip: "Use it with songs, shows, and fast speech.", tipKo: "노래, 방송, 빠른 말에 쓰세요.", tipEs: "Úsala con canciones, programas y habla rápida.", tipId: "Pakai dengan lagu, acara, dan ucapan cepat." },
      { word: "No entiendo.", ipa: "/no enˈtjen.do/", meaning: "이해 못 했어요.", meaningEs: "I don't understand.", speechLang: "es-ES", tip: "A useful sentence when subtitles disappear.", tipKo: "자막이 사라졌을 때 유용한 문장이에요.", tipEs: "Una frase útil cuando desaparecen los subtítulos.", tipId: "Kalimat berguna saat subtitle menghilang." },
    ],
    relationship: [
      { word: "Mucho gusto.", ipa: "/ˈmu.tʃo ˈɡus.to/", meaning: "반갑습니다.", meaningEs: "Nice to meet you.", speechLang: "es-ES", tip: "Two clean words. Say it like a friendly greeting.", tipKo: "깔끔한 두 단어예요. 다정한 인사처럼 말하세요.", tipEs: "Dos palabras limpias. Dilo como un saludo amistoso.", tipId: "Dua kata yang jernih. Ucapkan seperti sapaan yang ramah." },
      { word: "Gracias.", ipa: "/ˈɡɾa.sjas/", meaning: "감사합니다.", meaningEs: "Thank you.", speechLang: "es-ES", tip: "Gratitude keeps a conversation warm.", tipKo: "감사 표현은 대화를 따뜻하게 유지해 줘요.", tipEs: "La gratitud mantiene cálida la conversación.", tipId: "Rasa terima kasih membuat percakapan tetap hangat." },
      { word: "Lo siento.", ipa: "/lo ˈsjen.to/", meaning: "미안해요.", meaningEs: "I'm sorry.", speechLang: "es-ES", tip: "Keep siento soft and sincere.", tipKo: "siento를 부드럽고 진심 어리게 발음하세요.", tipEs: "Mantén 'siento' suave y sincero.", tipId: "Ucapkan 'siento' dengan lembut dan tulus." },
      { word: "¿Puedes repetirlo?", ipa: "/ˈpwe.des re.peˈtir.lo/", meaning: "다시 말해 줄 수 있나요?", meaningEs: "Can you say that again?", speechLang: "es-ES", tip: "Asking again is part of real conversation.", tipKo: "다시 물어보는 것도 실제 대화의 일부예요.", tipEs: "Volver a preguntar es parte de una conversación real.", tipId: "Bertanya lagi adalah bagian dari percakapan nyata." },
    ],
    exam: [
      { word: "¿Cuándo es el examen?", ipa: "/ˈkwan.do es el ekˈsa.men/", meaning: "시험이 언제예요?", meaningEs: "When is the exam?", speechLang: "es-ES", tip: "A real scheduling question. Keep examen clean and even.", tipKo: "실제 일정을 묻는 질문이에요. examen을 깨끗하고 고르게 발음하세요.", tipEs: "Una pregunta real sobre horarios. Mantén 'examen' limpio y parejo.", tipId: "Pertanyaan jadwal yang nyata. Jaga 'examen' tetap jernih dan rata." },
      { word: "Tengo una pregunta.", ipa: "/ˈteŋ.go ˈu.na pɾeˈɣun.ta/", meaning: "질문 있어요.", meaningEs: "I have a question.", speechLang: "es-ES", tip: "Stress GUN in pregunta.", tipKo: "pregunta의 GUN에 강세를 두세요.", tipEs: "Acentúa GUN en 'pregunta'.", tipId: "Tekankan GUN pada 'pregunta'." },
      { word: "Explícalo otra vez, por favor.", ipa: "/eksˈpli.ka.lo ˈo.tɾa βes poɾ faˈβoɾ/", meaning: "다시 설명해 주세요.", meaningEs: "Please explain again.", speechLang: "es-ES", tip: "Long but useful. Break it into two breaths if needed.", tipKo: "길지만 유용해요. 필요하면 두 호흡으로 나눠 발음하세요.", tipEs: "Larga pero útil. Divídela en dos respiraciones si hace falta.", tipId: "Panjang tapi berguna. Pecah jadi dua tarikan napas jika perlu." },
      { word: "Estoy listo.", ipa: "/esˈtoj ˈlis.to/", meaning: "준비됐어요.", meaningEs: "I am ready.", speechLang: "es-ES", tip: "A short confidence sentence before a test.", tipKo: "시험 전에 쓰는 짧은 자신감 문장이에요.", tipEs: "Una frase corta de confianza antes de un examen.", tipId: "Kalimat percaya diri yang singkat sebelum ujian." },
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
      { word: "Halo", ipa: "/ˈha.lo/", meaning: "안녕하세요", meaningEn: "Hello", meaningEs: "Hola", meaningId: "Halo", speechLang: "id-ID", tip: "A friendly all-purpose greeting. Two even syllables: HA-lo.", tipKo: "어디서나 쓰는 다정한 인사예요. 고른 두 음절: HA-lo.", tipEs: "Un saludo amistoso para todo uso. Dos sílabas parejas: HA-lo.", tipId: "Sapaan ramah serbaguna. Dua suku kata yang rata: HA-lo." },
      { word: "Terima kasih.", ipa: "/təˈri.ma ˈka.sih/", meaning: "감사합니다.", meaningEn: "Thank you.", meaningEs: "Gracias.", meaningId: "Terima kasih.", speechLang: "id-ID", tip: "Say all four syllables evenly: te-ri-ma-ka-sih.", tipKo: "네 음절을 고르게 발음하세요: te-ri-ma-ka-sih.", tipEs: "Pronuncia las cuatro sílabas de forma pareja: te-ri-ma-ka-sih.", tipId: "Ucapkan keempat suku kata dengan rata: te-ri-ma-ka-sih." },
      { word: "Saya tidak mengerti.", ipa: "/ˈsa.ja ˈti.daʔ məˈŋər.ti/", meaning: "이해 못 했어요.", meaningEn: "I don't understand.", meaningEs: "No entiendo.", meaningId: "Saya tidak mengerti.", speechLang: "id-ID", tip: "A real repair sentence. Keep tidak short and clear.", tipKo: "실전에서 쓰는 대화 복구 문장이에요. tidak을 짧고 분명하게 발음하세요.", tipEs: "Una frase real para retomar la conversación. Mantén 'tidak' corto y claro.", tipId: "Kalimat perbaikan yang nyata. Ucapkan 'tidak' dengan singkat dan jelas." },
      { word: "Tolong ulangi.", ipa: "/ˈto.loŋ uˈla.ŋi/", meaning: "다시 말해 주세요.", meaningEn: "Please repeat that.", meaningEs: "Repítelo, por favor.", meaningId: "Tolong ulangi.", speechLang: "id-ID", tip: "Tolong = please. Use it to ask for a repeat.", tipKo: "Tolong = 부탁해요. 다시 말해 달라고 할 때 쓰세요.", tipEs: "Tolong = por favor. Úsala para pedir que repitan.", tipId: "Tolong dipakai untuk meminta pengulangan dengan sopan." },
      { word: "Selamat pagi.", ipa: "/səˈla.mat ˈpa.gi/", meaning: "좋은 아침이에요.", meaningEn: "Good morning.", meaningEs: "Buenos días.", meaningId: "Selamat pagi.", speechLang: "id-ID", tip: "A real morning greeting. Pagi = morning.", tipKo: "실제 아침 인사예요. Pagi = 아침.", tipEs: "Un saludo matutino real. Pagi = mañana.", tipId: "Sapaan pagi yang nyata. Pagi berarti waktu pagi." },
      { word: "Sampai jumpa.", ipa: "/ˈsam.pai ˈdʒum.pa/", meaning: "또 만나요.", meaningEn: "See you later.", meaningEs: "Hasta luego.", meaningId: "Sampai jumpa.", speechLang: "id-ID", tip: "A warm goodbye: 'see you again'.", tipKo: "따뜻한 작별 인사예요: '또 만나요'.", tipEs: "Una despedida cálida: 'hasta la vista'.", tipId: "Salam perpisahan yang hangat: 'sampai jumpa lagi'." },
      { word: "Maaf.", ipa: "/ˈma.ʔaf/", meaning: "미안해요.", meaningEn: "Sorry.", meaningEs: "Lo siento.", meaningId: "Maaf.", speechLang: "id-ID", tip: "Keep the glottal stop between the two a's: ma-'af.", tipKo: "두 a 사이의 성문 폐쇄음을 살려 발음하세요: ma-'af.", tipEs: "Mantén el golpe de glotis entre las dos a: ma-'af.", tipId: "Jaga hentian glotal di antara dua huruf a: ma-'af." },
      { word: "Tolong bicara pelan-pelan.", ipa: "/ˈto.loŋ biˈtʃa.ra ˈpə.lan ˈpə.lan/", meaning: "천천히 말해 주세요.", meaningEn: "Please speak slowly.", meaningEs: "Habla despacio, por favor.", meaningId: "Tolong bicara pelan-pelan.", speechLang: "id-ID", tip: "pelan-pelan = slowly. A real survival request.", tipKo: "pelan-pelan = 천천히. 실제 생존 부탁이에요.", tipEs: "pelan-pelan = despacio. Una petición de supervivencia real.", tipId: "pelan-pelan berarti perlahan. Permintaan bertahan hidup yang nyata." },
      { word: "Nama saya Alex.", ipa: "/ˈna.ma ˈsa.ja ˈa.leks/", meaning: "제 이름은 알렉스예요.", meaningEn: "My name is Alex.", meaningEs: "Me llamo Alex.", meaningId: "Nama saya Alex.", speechLang: "id-ID", tip: "nama = name. Swap Alex for your own name.", tipKo: "nama = 이름. Alex 대신 자신의 이름을 넣으세요.", tipEs: "nama = nombre. Cambia Alex por tu propio nombre.", tipId: "nama berarti nama. Ganti Alex dengan namamu sendiri." },
    ],
    travel: [
      { word: "Di mana toilet?", ipa: "/di ˈma.na ˈtoi.let/", meaning: "화장실이 어디예요?", meaningEn: "Where is the bathroom?", meaningEs: "¿Dónde está el baño?", meaningId: "Di mana toilet?", speechLang: "id-ID", tip: "Di mana = where. A real travel question.", tipKo: "Di mana = 어디. 실제 여행 질문이에요.", tipEs: "Di mana = dónde. Una pregunta de viaje real.", tipId: "Di mana berarti di tempat apa. Pertanyaan perjalanan yang nyata." },
      { word: "Berapa harganya?", ipa: "/bəˈra.pa harˈga.ɲa/", meaning: "얼마예요?", meaningEn: "How much is it?", meaningEs: "¿Cuánto cuesta?", meaningId: "Berapa harganya?", speechLang: "id-ID", tip: "A shopping survival question. Stress GA in harganya.", tipKo: "쇼핑할 때 쓰는 생존 질문이에요. harganya의 GA에 강세를 두세요.", tipEs: "Una pregunta de supervivencia al comprar. Acentúa GA en 'harganya'.", tipId: "Pertanyaan bertahan hidup saat belanja. Tekankan GA pada 'harganya'." },
      { word: "Tolong bantu saya.", ipa: "/ˈto.loŋ ˈban.tu ˈsa.ja/", meaning: "도와주세요.", meaningEn: "Please help me.", meaningEs: "Ayúdame, por favor.", meaningId: "Tolong bantu saya.", speechLang: "id-ID", tip: "bantu = help. Say it slowly and clearly.", tipKo: "bantu = 돕다. 천천히 또박또박 말하세요.", tipEs: "bantu = ayudar. Dilo despacio y claro.", tipId: "bantu berarti menolong. Ucapkan dengan pelan dan jelas." },
      { word: "Saya mau air.", ipa: "/ˈsa.ja ˈmau ˈa.ir/", meaning: "물 주세요.", meaningEn: "I want water.", meaningEs: "Quiero agua.", meaningId: "Saya mau air.", speechLang: "id-ID", tip: "mau = want. air = water. A real request.", tipKo: "mau = 원하다. air = 물. 실제 요청 표현이에요.", tipEs: "mau = querer. air = agua. Una petición real.", tipId: "mau berarti ingin, air berarti minuman. Permintaan yang nyata." },
      { word: "Berhenti di sini.", ipa: "/bərˈhən.ti di ˈsi.ni/", meaning: "여기 세워 주세요.", meaningEn: "Stop here.", meaningEs: "Pare aquí.", meaningId: "Berhenti di sini.", speechLang: "id-ID", tip: "Taxi survival. di sini = here.", tipKo: "택시에서 쓰는 생존 표현이에요. di sini = 여기.", tipEs: "Supervivencia en taxi. di sini = aquí.", tipId: "Bertahan hidup di taksi. di sini berarti di tempat ini." },
      { word: "Saya tersesat.", ipa: "/ˈsa.ja tərˈsə.sat/", meaning: "길을 잃었어요.", meaningEn: "I am lost.", meaningEs: "Estoy perdido.", meaningId: "Saya tersesat.", speechLang: "id-ID", tip: "Say it calmly when you need help finding the way.", tipKo: "길을 찾는 데 도움이 필요할 때 차분하게 말하세요.", tipEs: "Dilo con calma cuando necesites ayuda para encontrar el camino.", tipId: "Ucapkan dengan tenang saat butuh bantuan menemukan jalan." },
      { word: "Berapa lama?", ipa: "/bəˈra.pa ˈla.ma/", meaning: "얼마나 걸려요?", meaningEn: "How long does it take?", meaningEs: "¿Cuánto tiempo?", meaningId: "Berapa lama?", speechLang: "id-ID", tip: "lama = long (time). Useful for trips and waits.", tipKo: "lama = (시간이) 길다. 이동이나 기다림에 유용해요.", tipEs: "lama = mucho (tiempo). Útil para viajes y esperas.", tipId: "lama berarti lama (waktu). Berguna untuk perjalanan dan menunggu." },
      { word: "Tolong panggil taksi.", ipa: "/ˈto.loŋ ˈpaŋ.gil ˈtak.si/", meaning: "택시 불러 주세요.", meaningEn: "Please call a taxi.", meaningEs: "Llame un taxi, por favor.", meaningId: "Tolong panggil taksi.", speechLang: "id-ID", tip: "panggil = call. A practical street request.", tipKo: "panggil = 부르다. 길에서 실용적인 요청이에요.", tipEs: "panggil = llamar. Una petición práctica en la calle.", tipId: "panggil berarti memanggil. Permintaan praktis di jalan." },
    ],
    relationship: [
      { word: "Siapa nama kamu?", ipa: "/siˈa.pa ˈna.ma ˈka.mu/", meaning: "이름이 뭐예요?", meaningEn: "What is your name?", meaningEs: "¿Cómo te llamas?", meaningId: "Siapa nama kamu?", speechLang: "id-ID", tip: "A real first-meeting question. nama = name.", tipKo: "실제 첫 만남 질문이에요. nama = 이름.", tipEs: "Una pregunta real de primer encuentro. nama = nombre.", tipId: "Pertanyaan pertemuan pertama yang nyata. nama berarti nama." },
      { word: "Nama saya Alex.", ipa: "/ˈna.ma ˈsa.ja ˈa.leks/", meaning: "제 이름은 알렉스예요.", meaningEn: "My name is Alex.", meaningEs: "Me llamo Alex.", meaningId: "Nama saya Alex.", speechLang: "id-ID", tip: "Swap Alex for your name when you practice.", tipKo: "연습할 때 Alex 대신 자신의 이름을 넣으세요.", tipEs: "Cambia Alex por tu nombre cuando practiques.", tipId: "Ganti Alex dengan namamu saat berlatih." },
      { word: "Senang bertemu kamu.", ipa: "/səˈnaŋ bərˈtə.mu ˈka.mu/", meaning: "만나서 반가워요.", meaningEn: "Nice to meet you.", meaningEs: "Mucho gusto.", meaningId: "Senang bertemu kamu.", speechLang: "id-ID", tip: "A warm first-meeting line. senang = happy.", tipKo: "따뜻한 첫 만남 문장이에요. senang = 기쁘다.", tipEs: "Una cálida frase de primer encuentro. senang = feliz.", tipId: "Kalimat pertemuan pertama yang hangat. senang berarti gembira." },
      { word: "Apa kabar?", ipa: "/ˈa.pa ˈka.bar/", meaning: "잘 지내요?", meaningEn: "How are you?", meaningEs: "¿Cómo estás?", meaningId: "Apa kabar?", speechLang: "id-ID", tip: "A friendly check-in. Literally 'what news?'.", tipKo: "다정한 안부 표현이에요. 직역하면 '무슨 소식이에요?'.", tipEs: "Un saludo amistoso. Literalmente '¿qué noticias?'.", tipId: "Sapaan ramah. Secara harfiah 'apa beritanya?'." },
      { word: "Sampai nanti.", ipa: "/ˈsam.pai ˈnan.ti/", meaning: "나중에 봐요.", meaningEn: "See you soon.", meaningEs: "Hasta pronto.", meaningId: "Sampai nanti.", speechLang: "id-ID", tip: "nanti = later. A casual goodbye.", tipKo: "nanti = 나중에. 가벼운 작별 인사예요.", tipEs: "nanti = luego. Una despedida informal.", tipId: "nanti berarti nanti. Salam perpisahan santai." },
      { word: "Terima kasih banyak.", ipa: "/təˈri.ma ˈka.sih ˈba.ɲaʔ/", meaning: "정말 고마워요.", meaningEn: "Thank you very much.", meaningEs: "Muchas gracias.", meaningId: "Terima kasih banyak.", speechLang: "id-ID", tip: "banyak = much. Warm gratitude.", tipKo: "banyak = 많이. 따뜻한 감사 표현이에요.", tipEs: "banyak = mucho. Gratitud cálida.", tipId: "banyak berarti banyak. Ungkapan terima kasih yang hangat." },
      { word: "Maaf, saya terlambat.", ipa: "/ˈma.ʔaf ˈsa.ja tərˈlam.bat/", meaning: "늦어서 미안해요.", meaningEn: "Sorry, I am late.", meaningEs: "Perdón por llegar tarde.", meaningId: "Maaf, saya terlambat.", speechLang: "id-ID", tip: "terlambat = late. A gentle, honest apology.", tipKo: "terlambat = 늦은. 부드럽고 솔직한 사과예요.", tipEs: "terlambat = tarde. Una disculpa suave y sincera.", tipId: "terlambat berarti terlambat. Permintaan maaf yang lembut dan tulus." },
      { word: "Sampai jumpa lagi.", ipa: "/ˈsam.pai ˈdʒum.pa ˈla.gi/", meaning: "또 만나요.", meaningEn: "See you again.", meaningEs: "Hasta la próxima.", meaningId: "Sampai jumpa lagi.", speechLang: "id-ID", tip: "lagi = again. A warm parting line.", tipKo: "lagi = 다시. 따뜻한 작별 문장이에요.", tipEs: "lagi = otra vez. Una cálida frase de despedida.", tipId: "lagi berarti lagi. Kalimat perpisahan yang hangat." },
    ],
    work: [
      { word: "Tolong ulangi.", ipa: "/ˈto.loŋ uˈla.ŋi/", meaning: "다시 말해 주세요.", meaningEn: "Please repeat that.", meaningEs: "Repítelo, por favor.", meaningId: "Tolong ulangi.", speechLang: "id-ID", tip: "A useful meeting repair phrase. Say it calmly.", tipKo: "회의에서 유용한 대화 복구 표현이에요. 차분하게 말하세요.", tipEs: "Una frase útil para retomar el hilo en una reunión. Dila con calma.", tipId: "Frasa perbaikan yang berguna saat rapat. Ucapkan dengan tenang." },
      { word: "Saya tidak mengerti.", ipa: "/ˈsa.ja ˈti.daʔ məˈŋər.ti/", meaning: "이해 못 했어요.", meaningEn: "I don't understand.", meaningEs: "No entiendo.", meaningId: "Saya tidak mengerti.", speechLang: "id-ID", tip: "It is okay to ask for help. Keep tidak short.", tipKo: "도움을 청해도 괜찮아요. tidak을 짧게 발음하세요.", tipEs: "Está bien pedir ayuda. Mantén 'tidak' corto.", tipId: "Tidak apa-apa meminta bantuan. Ucapkan 'tidak' dengan singkat." },
      { word: "Saya punya pertanyaan.", ipa: "/ˈsa.ja ˈpu.ɲa pər.taˈɲa.an/", meaning: "질문 있어요.", meaningEn: "I have a question.", meaningEs: "Tengo una pregunta.", meaningId: "Saya punya pertanyaan.", speechLang: "id-ID", tip: "Say it before you get stuck. punya = have.", tipKo: "막히기 전에 말하세요. punya = 가지다.", tipEs: "Dilo antes de quedarte atascado. punya = tener.", tipId: "Ucapkan sebelum kamu tersendat. punya berarti memiliki." },
      { word: "Tolong tunggu sebentar.", ipa: "/ˈto.loŋ ˈtuŋ.gu səbənˈtar/", meaning: "잠시만 기다려 주세요.", meaningEn: "Please wait a moment.", meaningEs: "Espere un momento, por favor.", meaningId: "Tolong tunggu sebentar.", speechLang: "id-ID", tip: "sebentar = a moment. A polite pause at work.", tipKo: "sebentar = 잠시. 직장에서 정중하게 멈출 때 써요.", tipEs: "sebentar = un momento. Una pausa cortés en el trabajo.", tipId: "sebentar berarti sejenak. Jeda yang sopan di tempat kerja." },
      { word: "Terima kasih.", ipa: "/təˈri.ma ˈka.sih/", meaning: "감사합니다.", meaningEn: "Thank you.", meaningEs: "Gracias.", meaningId: "Terima kasih.", speechLang: "id-ID", tip: "End politely and clearly.", tipKo: "정중하고 분명하게 끝맺으세요.", tipEs: "Termina con cortesía y claridad.", tipId: "Akhiri dengan sopan dan jelas." },
      { word: "Tolong bantu saya.", ipa: "/ˈto.loŋ ˈban.tu ˈsa.ja/", meaning: "도와주세요.", meaningEn: "Please help me.", meaningEs: "Ayúdame, por favor.", meaningId: "Tolong bantu saya.", speechLang: "id-ID", tip: "A real workplace request. Keep it calm and polite.", tipKo: "직장에서 실제로 쓰는 요청이에요. 차분하고 정중하게 말하세요.", tipEs: "Una petición real en el trabajo. Mantenla calmada y cortés.", tipId: "Permintaan nyata di tempat kerja. Jaga tetap tenang dan sopan." },
      { word: "Saya akan kirim email.", ipa: "/ˈsa.ja ˈa.kan ˈki.rim ˈi.mel/", meaning: "이메일 보낼게요.", meaningEn: "I will send an email.", meaningEs: "Enviaré un correo.", meaningId: "Saya akan kirim email.", speechLang: "id-ID", tip: "akan = will. A real work promise.", tipKo: "akan = ~할 것이다. 실제 업무 약속이에요.", tipEs: "akan = (futuro). Una promesa de trabajo real.", tipId: "akan menandakan masa depan. Janji kerja yang nyata." },
      { word: "Tolong periksa ini.", ipa: "/ˈto.loŋ pəˈrik.sa ˈi.ni/", meaning: "확인해 주세요.", meaningEn: "Please check this.", meaningEs: "Revísalo, por favor.", meaningId: "Tolong periksa ini.", speechLang: "id-ID", tip: "periksa = check. Useful for documents.", tipKo: "periksa = 확인하다. 서류에 유용해요.", tipEs: "periksa = revisar. Útil para documentos.", tipId: "periksa berarti memeriksa. Berguna untuk dokumen." },
    ],
    study: [
      { word: "Saya tidak mengerti.", ipa: "/ˈsa.ja ˈti.daʔ məˈŋər.ti/", meaning: "이해 못 했어요.", meaningEn: "I don't understand.", meaningEs: "No entiendo.", meaningId: "Saya tidak mengerti.", speechLang: "id-ID", tip: "A classroom survival sentence. Say it without fear.", tipKo: "교실에서 쓰는 생존 문장이에요. 두려워하지 말고 말하세요.", tipEs: "Una frase de supervivencia en clase. Dila sin miedo.", tipId: "Kalimat bertahan hidup di kelas. Ucapkan tanpa rasa takut." },
      { word: "Tolong ulangi.", ipa: "/ˈto.loŋ uˈla.ŋi/", meaning: "다시 말해 주세요.", meaningEn: "Please repeat that.", meaningEs: "Repítelo, por favor.", meaningId: "Tolong ulangi.", speechLang: "id-ID", tip: "ulangi = repeat. Ask before you fall behind.", tipKo: "ulangi = 반복하다. 뒤처지기 전에 물어보세요.", tipEs: "ulangi = repetir. Pregunta antes de quedarte atrás.", tipId: "ulangi berarti mengulang. Tanyakan sebelum kamu tertinggal." },
      { word: "Apa arti kata ini?", ipa: "/ˈa.pa ˈar.ti ˈka.ta ˈi.ni/", meaning: "이 단어 무슨 뜻이에요?", meaningEn: "What does this word mean?", meaningEs: "¿Qué significa esta palabra?", meaningId: "Apa arti kata ini?", speechLang: "id-ID", tip: "arti = meaning. A real learner question.", tipKo: "arti = 뜻. 실제 학습자 질문이에요.", tipEs: "arti = significado. Una pregunta real de quien aprende.", tipId: "arti berarti makna. Pertanyaan pelajar yang nyata." },
      { word: "Tolong jelaskan lagi.", ipa: "/ˈto.loŋ dʒəˈlas.kan ˈla.gi/", meaning: "다시 설명해 주세요.", meaningEn: "Please explain again.", meaningEs: "Explícalo otra vez, por favor.", meaningId: "Tolong jelaskan lagi.", speechLang: "id-ID", tip: "jelaskan = explain. Ask for another explanation.", tipKo: "jelaskan = 설명하다. 다시 설명해 달라고 하세요.", tipEs: "jelaskan = explicar. Pide otra explicación.", tipId: "jelaskan berarti menjelaskan. Minta penjelasan lagi." },
      { word: "Saya mau belajar.", ipa: "/ˈsa.ja ˈmau bəˈla.dʒar/", meaning: "공부하고 싶어요.", meaningEn: "I want to study.", meaningEs: "Quiero estudiar.", meaningId: "Saya mau belajar.", speechLang: "id-ID", tip: "belajar = study. A direct learning sentence.", tipKo: "belajar = 공부하다. 직접적인 학습 문장이에요.", tipEs: "belajar = estudiar. Una frase de aprendizaje directa.", tipId: "belajar berarti belajar. Kalimat belajar yang langsung." },
      { word: "Terima kasih, Bu.", ipa: "/təˈri.ma ˈka.sih bu/", meaning: "감사합니다, 선생님.", meaningEn: "Thank you, ma'am.", meaningEs: "Gracias, señora.", meaningId: "Terima kasih, Bu.", speechLang: "id-ID", tip: "Bu = ma'am/teacher. End the lesson politely.", tipKo: "Bu = 부인/선생님. 수업을 정중하게 끝맺으세요.", tipEs: "Bu = señora/maestra. Termina la clase con cortesía.", tipId: "Bu adalah panggilan untuk wanita/guru. Akhiri pelajaran dengan sopan." },
      { word: "Tolong bicara pelan-pelan.", ipa: "/ˈto.loŋ biˈtʃa.ra ˈpə.lan ˈpə.lan/", meaning: "천천히 말해 주세요.", meaningEn: "Please speak slowly.", meaningEs: "Habla despacio, por favor.", meaningId: "Tolong bicara pelan-pelan.", speechLang: "id-ID", tip: "pelan-pelan = slowly. Useful during a lesson.", tipKo: "pelan-pelan = 천천히. 수업 중에 유용해요.", tipEs: "pelan-pelan = despacio. Útil durante una clase.", tipId: "pelan-pelan berarti perlahan. Berguna saat pelajaran." },
    ],
    hobby: [
      { word: "Saya suka musik.", ipa: "/ˈsa.ja ˈsu.ka ˈmu.sik/", meaning: "저는 음악을 좋아해요.", meaningEn: "I like music.", meaningEs: "Me gusta la música.", meaningId: "Saya suka musik.", speechLang: "id-ID", tip: "suka = like. A short, useful opinion.", tipKo: "suka = 좋아하다. 짧고 유용한 의견이에요.", tipEs: "suka = gustar. Una opinión corta y útil.", tipId: "suka berarti menyukai. Pendapat singkat yang berguna." },
      { word: "Saya suka ini.", ipa: "/ˈsa.ja ˈsu.ka ˈi.ni/", meaning: "마음에 들어요.", meaningEn: "I like it.", meaningEs: "Me gusta.", meaningId: "Saya suka ini.", speechLang: "id-ID", tip: "A tiny opinion sentence you can use anywhere.", tipKo: "어디서나 쓸 수 있는 아주 짧은 의견 문장이에요.", tipEs: "Una frase de opinión diminuta que puedes usar en cualquier lugar.", tipId: "Kalimat pendapat mungil yang bisa kamu pakai di mana saja." },
      { word: "Hobi saya membaca.", ipa: "/ˈho.bi ˈsa.ja məmˈba.tʃa/", meaning: "제 취미는 독서예요.", meaningEn: "My hobby is reading.", meaningEs: "Mi pasatiempo es leer.", meaningId: "Hobi saya membaca.", speechLang: "id-ID", tip: "membaca = reading. Swap in your own hobby.", tipKo: "membaca = 독서. 자신의 취미로 바꿔 보세요.", tipEs: "membaca = leer. Cámbialo por tu propio pasatiempo.", tipId: "membaca berarti membaca. Ganti dengan hobimu sendiri." },
      { word: "Ini menyenangkan.", ipa: "/ˈi.ni mə.ɲəˈnaŋ.kan/", meaning: "재미있어요.", meaningEn: "This is fun.", meaningEs: "Esto es divertido.", meaningId: "Ini menyenangkan.", speechLang: "id-ID", tip: "A tiny reaction sentence. senang = happy.", tipKo: "아주 짧은 반응 문장이에요. senang = 기쁘다.", tipEs: "Una frase de reacción diminuta. senang = feliz.", tipId: "Kalimat reaksi yang mungil. senang berarti gembira." },
      { word: "Mari kita lakukan bersama.", ipa: "/ˈma.ri ˈki.ta laˈku.kan bərˈsa.ma/", meaning: "같이 해요.", meaningEn: "Let's do it together.", meaningEs: "Hagámoslo juntos.", meaningId: "Mari kita lakukan bersama.", speechLang: "id-ID", tip: "bersama = together. Invite someone naturally.", tipKo: "bersama = 함께. 자연스럽게 누군가를 초대하세요.", tipEs: "bersama = juntos. Invita a alguien de forma natural.", tipId: "bersama berarti bersama-sama. Ajak seseorang secara alami." },
      { word: "Tolong rekomendasikan sesuatu.", ipa: "/ˈto.loŋ re.ko.men.daˈsi.kan səsuˈa.tu/", meaning: "추천해 주세요.", meaningEn: "Please recommend something.", meaningEs: "Recomiéndame algo, por favor.", meaningId: "Tolong rekomendasikan sesuatu.", speechLang: "id-ID", tip: "Ask for a song, show, or place.", tipKo: "노래, 방송, 장소를 추천해 달라고 하세요.", tipEs: "Pide una canción, un programa o un lugar.", tipId: "Minta rekomendasi lagu, acara, atau tempat." },
      { word: "Saya tidak mengerti.", ipa: "/ˈsa.ja ˈti.daʔ məˈŋər.ti/", meaning: "이해 못 했어요.", meaningEn: "I don't understand.", meaningEs: "No entiendo.", meaningId: "Saya tidak mengerti.", speechLang: "id-ID", tip: "Useful when lyrics or dialogue are too fast.", tipKo: "가사나 대사가 너무 빠를 때 유용해요.", tipEs: "Útil cuando la letra o el diálogo van demasiado rápido.", tipId: "Berguna saat lirik atau dialog terlalu cepat." },
    ],
    exam: [
      { word: "Kapan ujiannya?", ipa: "/ˈka.pan uˈdʒi.an.ɲa/", meaning: "시험이 언제예요?", meaningEn: "When is the exam?", meaningEs: "¿Cuándo es el examen?", meaningId: "Kapan ujiannya?", speechLang: "id-ID", tip: "kapan = when. ujian = exam. A real test-day question.", tipKo: "kapan = 언제. ujian = 시험. 실제 시험 날 질문이에요.", tipEs: "kapan = cuándo. ujian = examen. Una pregunta real del día del examen.", tipId: "kapan berarti waktu, ujian berarti tes. Pertanyaan nyata di hari ujian." },
      { word: "Saya punya pertanyaan.", ipa: "/ˈsa.ja ˈpu.ɲa pər.taˈɲa.an/", meaning: "질문 있어요.", meaningEn: "I have a question.", meaningEs: "Tengo una pregunta.", meaningId: "Saya punya pertanyaan.", speechLang: "id-ID", tip: "Say it before you freeze. punya = have.", tipKo: "얼어붙기 전에 말하세요. punya = 가지다.", tipEs: "Dilo antes de bloquearte. punya = tener.", tipId: "Ucapkan sebelum kamu membeku. punya berarti memiliki." },
      { word: "Tolong jelaskan lagi.", ipa: "/ˈto.loŋ dʒəˈlas.kan ˈla.gi/", meaning: "다시 설명해 주세요.", meaningEn: "Please explain again.", meaningEs: "Explícalo otra vez, por favor.", meaningId: "Tolong jelaskan lagi.", speechLang: "id-ID", tip: "jelaskan = explain. Ask for a clearer version.", tipKo: "jelaskan = 설명하다. 더 명확한 설명을 청하세요.", tipEs: "jelaskan = explicar. Pide una versión más clara.", tipId: "jelaskan berarti menjelaskan. Minta versi yang lebih jelas." },
      { word: "Saya butuh waktu lagi.", ipa: "/ˈsa.ja ˈbu.tuh ˈwak.tu ˈla.gi/", meaning: "시간이 더 필요해요.", meaningEn: "I need more time.", meaningEs: "Necesito más tiempo.", meaningId: "Saya butuh waktu lagi.", speechLang: "id-ID", tip: "butuh = need. A real request under pressure.", tipKo: "butuh = 필요하다. 압박 속에서 쓰는 실제 요청이에요.", tipEs: "butuh = necesitar. Una petición real bajo presión.", tipId: "butuh berarti memerlukan. Permintaan nyata saat tertekan." },
      { word: "Saya sudah siap.", ipa: "/ˈsa.ja ˈsu.dah ˈsi.ap/", meaning: "준비됐어요.", meaningEn: "I am ready.", meaningEs: "Estoy listo.", meaningId: "Saya sudah siap.", speechLang: "id-ID", tip: "siap = ready. A short confidence sentence.", tipKo: "siap = 준비된. 짧은 자신감 문장이에요.", tipEs: "siap = listo. Una frase corta de confianza.", tipId: "siap berarti siap. Kalimat percaya diri yang singkat." },
      { word: "Saya tidak tahu jawabannya.", ipa: "/ˈsa.ja ˈti.daʔ ˈta.hu dʒaˈwa.ban.ɲa/", meaning: "답을 모르겠어요.", meaningEn: "I don't know the answer.", meaningEs: "No sé la respuesta.", meaningId: "Saya tidak tahu jawabannya.", speechLang: "id-ID", tip: "jawaban = answer. An honest test sentence.", tipKo: "jawaban = 답. 솔직한 시험 문장이에요.", tipEs: "jawaban = respuesta. Una frase honesta de examen.", tipId: "jawaban berarti jawaban. Kalimat ujian yang jujur." },
      { word: "Tolong bicara pelan-pelan.", ipa: "/ˈto.loŋ biˈtʃa.ra ˈpə.lan ˈpə.lan/", meaning: "천천히 말해 주세요.", meaningEn: "Please speak slowly.", meaningEs: "Habla despacio, por favor.", meaningId: "Tolong bicara pelan-pelan.", speechLang: "id-ID", tip: "Useful when the instructions are read aloud fast.", tipKo: "지시 사항을 빠르게 읽어 줄 때 유용해요.", tipEs: "Útil cuando leen las instrucciones en voz alta y rápido.", tipId: "Berguna saat instruksi dibacakan dengan cepat." },
    ],
  },
  // ── Modern Standard Arabic (MSA, BETA) starter packs ─────────────────────────────────
  // Modern Standard Arabic (MSA / الفُصْحى) — the app teaches Standard Arabic,
  // which is written and understood across the Arab world. Shown with harakat
  // (short vowels) for beginners; `ipa` carries a Latin ROMANIZATION line that
  // matches the MSA script and the TTS audio (e.g. ق = q, ث = th, standard j for
  // ج), so what the learner reads equals what they hear.
  // For an Arabic TARGET phrase: word = MSA Arabic, meaning = Korean,
  // meaningEn = English, meaningEs = Spanish, meaningId = Indonesian gloss;
  // tip/tipKo/tipEs/tipId carry the usage note in each native language.
  // Address forms use the masculine (matching the "Alex" placeholder learner);
  // goals without a specific pack fall back to `default` (Arabic), never English.
  arabic: {
    default: [
      { word: "أَهْلًا", ipa: "ahlan", meaning: "안녕하세요", meaningEn: "Hi / Welcome", meaningEs: "Hola", meaningId: "Halo", speechLang: "ar-EG", tip: "ahlan = a warm everyday hello, understood across the Arab world. One word.", tipKo: "ahlan = 아랍 세계 어디서나 통하는 따뜻한 일상 인사예요. 한 단어.", tipEs: "ahlan = un saludo cálido de uso diario, entendido en todo el mundo árabe. Una sola palabra.", tipId: "ahlan = sapaan hangat sehari-hari yang dipahami di seluruh dunia Arab. Satu kata." },
      { word: "كَيْفَ حالُك؟", ipa: "kayfa ḥāluk?", meaning: "잘 지내요?", meaningEn: "How are you?", meaningEs: "¿Cómo estás?", meaningId: "Apa kabar?", speechLang: "ar-EG", tip: "kayfa ḥāluk = how are you (to a man) in MSA, understood everywhere (in Egyptian dialect you'll hear izzayyak).", tipKo: "kayfa ḥāluk = 표준 아랍어(MSA)로 '잘 지내요?'(남성에게), 어디서나 통해요 (이집트 구어에서는 izzayyak이라고 해요).", tipEs: "kayfa ḥāluk = ¿cómo estás? (a un hombre) en árabe estándar, entendido en todas partes (en el dialecto egipcio oirás izzayyak).", tipId: "kayfa ḥāluk = apa kabar (kepada laki-laki) dalam bahasa Arab baku, dipahami di mana saja (dalam dialek Mesir kamu akan dengar izzayyak)." },
      { word: "شُكْرًا", ipa: "shukran", meaning: "감사합니다", meaningEn: "Thank you", meaningEs: "Gracias", meaningId: "Terima kasih", speechLang: "ar-EG", tip: "shukran = thank you. Stress the first syllable: SHUK-ran.", tipKo: "shukran = 감사합니다. 첫 음절에 강세를 두세요: SHUK-ran.", tipEs: "shukran = gracias. Acentúa la primera sílaba: SHUK-ran.", tipId: "shukran = terima kasih. Tekankan suku kata pertama: SHUK-ran." },
      { word: "لا أَفْهَم", ipa: "lā afham", meaning: "이해 못 했어요.", meaningEn: "I don't understand.", meaningEs: "No entiendo.", meaningId: "Saya tidak mengerti.", speechLang: "ar-EG", tip: "lā afham = I don't understand in MSA. A clear repair phrase you can use anywhere.", tipKo: "lā afham = 표준 아랍어로 '이해 못 했어요'. 어디서나 쓸 수 있는 분명한 대화 복구 표현이에요.", tipEs: "lā afham = no entiendo en árabe estándar. Una frase clara para retomar la conversación en cualquier lugar.", tipId: "lā afham = saya tidak mengerti dalam bahasa Arab baku. Frasa perbaikan yang jelas dan bisa dipakai di mana saja." },
      { word: "مَرّة ثانِية، مِن فَضْلِك", ipa: "marra thāniya, min faḍlik", meaning: "다시 말해 주세요.", meaningEn: "Again, please.", meaningEs: "Otra vez, por favor.", meaningId: "Tolong ulangi.", speechLang: "ar-EG", tip: "marra thāniya = once more, in MSA. min faḍlik = please.", tipKo: "marra thāniya = 표준 아랍어로 '한 번 더'. min faḍlik = 부탁해요.", tipEs: "marra thāniya = una vez más, en árabe estándar. min faḍlik = por favor.", tipId: "marra thāniya = sekali lagi, dalam bahasa Arab baku. min faḍlik = tolong." },
      { word: "بِبُطْء، مِن فَضْلِك", ipa: "bi-buṭʼ, min faḍlik", meaning: "천천히 말해 주세요.", meaningEn: "Slowly, please.", meaningEs: "Despacio, por favor.", meaningId: "Tolong bicara pelan-pelan.", speechLang: "ar-EG", tip: "bi-buṭʼ = slowly, in MSA. min faḍlik softens the request.", tipKo: "bi-buṭʼ = 표준 아랍어로 '천천히'. min faḍlik이 요청을 부드럽게 해 줘요.", tipEs: "bi-buṭʼ = despacio, en árabe estándar. min faḍlik suaviza la petición.", tipId: "bi-buṭʼ = perlahan, dalam bahasa Arab baku. min faḍlik membuat permintaan lebih halus." },
      { word: "صَباح الخَيْر", ipa: "ṣabāḥ al-khayr", meaning: "좋은 아침이에요.", meaningEn: "Good morning.", meaningEs: "Buenos días.", meaningId: "Selamat pagi.", speechLang: "ar-EG", tip: "ṣabāḥ al-khayr = good morning. The kh is a throaty h sound.", tipKo: "ṣabāḥ al-khayr = 좋은 아침이에요. kh는 목에서 내는 h 소리예요.", tipEs: "ṣabāḥ al-khayr = buenos días. La kh es un sonido gutural parecido a una h.", tipId: "ṣabāḥ al-khayr = selamat pagi. Bunyi kh adalah suara h dari tenggorokan." },
      { word: "مَعَ السَّلامَة", ipa: "maʿa s-salāma", meaning: "안녕히 가세요.", meaningEn: "Goodbye.", meaningEs: "Adiós.", meaningId: "Sampai jumpa.", speechLang: "ar-EG", tip: "maʿa s-salāma = goodbye (literally 'with safety'). The ʿ is the deep ع.", tipKo: "maʿa s-salāma = 안녕히 가세요 (직역하면 '안전과 함께'). ʿ는 깊은 ع 소리예요.", tipEs: "maʿa s-salāma = adiós (literalmente 'con seguridad'). La ʿ es la profunda ع.", tipId: "maʿa s-salāma = selamat tinggal (harfiah 'dengan keselamatan'). Bunyi ʿ adalah ع yang dalam." },
      { word: "آسِف", ipa: "āsif", meaning: "미안해요.", meaningEn: "Sorry.", meaningEs: "Lo siento.", meaningId: "Maaf.", speechLang: "ar-EG", tip: "āsif = sorry (said by a man). Short and sincere.", tipKo: "āsif = 미안해요 (남성이 말할 때). 짧고 진심 어리게.", tipEs: "āsif = lo siento (dicho por un hombre). Corto y sincero.", tipId: "āsif = maaf (diucapkan oleh laki-laki). Singkat dan tulus." },
      { word: "اِسْمي أليكس", ipa: "ismī Alex", meaning: "제 이름은 알렉스예요.", meaningEn: "My name is Alex.", meaningEs: "Me llamo Alex.", meaningId: "Nama saya Alex.", speechLang: "ar-EG", tip: "ismī = my name. Swap Alex for your own name.", tipKo: "ismī = 제 이름. Alex 대신 자신의 이름을 넣으세요.", tipEs: "ismī = mi nombre. Cambia Alex por tu propio nombre.", tipId: "ismī = nama saya. Ganti Alex dengan namamu sendiri." },
    ],
    travel: [
      { word: "أَيْنَ الحَمّام؟", ipa: "ayna l-ḥammām?", meaning: "화장실이 어디예요?", meaningEn: "Where is the bathroom?", meaningEs: "¿Dónde está el baño?", meaningId: "Di mana toilet?", speechLang: "ar-EG", tip: "ayna = where in MSA, understood across the Arab world. A real travel question.", tipKo: "ayna = 표준 아랍어로 '어디', 아랍 세계 어디서나 통해요. 실제 여행 질문이에요.", tipEs: "ayna = dónde en árabe estándar, entendido en todo el mundo árabe. Una pregunta de viaje real.", tipId: "ayna = di mana dalam bahasa Arab baku, dipahami di seluruh dunia Arab. Pertanyaan perjalanan yang nyata." },
      { word: "بِكَمْ هٰذَا؟", ipa: "bikam hādhā?", meaning: "얼마예요?", meaningEn: "How much is this?", meaningEs: "¿Cuánto cuesta esto?", meaningId: "Berapa harganya?", speechLang: "ar-EG", tip: "bikam = how much, hādhā = this, both MSA. A daily shopping question.", tipKo: "bikam = 얼마, hādhā = 이것, 둘 다 표준 아랍어예요. 일상 쇼핑 질문이에요.", tipEs: "bikam = cuánto, hādhā = esto, ambos en árabe estándar. Una pregunta de compras diaria.", tipId: "bikam = berapa, hādhā = ini, keduanya bahasa Arab baku. Pertanyaan belanja sehari-hari." },
      { word: "ساعِدْني، مِن فَضْلِك", ipa: "sāʿidnī, min faḍlik", meaning: "도와주세요.", meaningEn: "Please help me.", meaningEs: "Ayúdame, por favor.", meaningId: "Tolong bantu saya.", speechLang: "ar-EG", tip: "sāʿidnī = help me. Slow and clear is enough in an emergency.", tipKo: "sāʿidnī = 저를 도와주세요. 비상시에는 천천히 또박또박 말하면 충분해요.", tipEs: "sāʿidnī = ayúdame. En una emergencia basta con hablar despacio y claro.", tipId: "sāʿidnī = tolong saya. Saat darurat, bicara pelan dan jelas sudah cukup." },
      { word: "أُريد ماء", ipa: "urīd māʼ", meaning: "물 주세요.", meaningEn: "I want water.", meaningEs: "Quiero agua.", meaningId: "Saya mau air.", speechLang: "ar-EG", tip: "urīd = I want, māʼ = water, both MSA (in Egyptian dialect you'll hear mayya).", tipKo: "urīd = 원하다, māʼ = 물, 둘 다 표준 아랍어예요 (이집트 구어에서는 mayya라고 해요).", tipEs: "urīd = quiero, māʼ = agua, ambos en árabe estándar (en el dialecto egipcio oirás mayya).", tipId: "urīd = saya mau, māʼ = air, keduanya bahasa Arab baku (dalam dialek Mesir kamu akan dengar mayya)." },
      { word: "قِفْ هُنا، مِن فَضْلِك", ipa: "qif hunā, min faḍlik", meaning: "여기 세워 주세요.", meaningEn: "Stop here, please.", meaningEs: "Pare aquí, por favor.", meaningId: "Berhenti di sini.", speechLang: "ar-EG", tip: "qif = stop, hunā = here, both MSA. Taxi survival.", tipKo: "qif = 멈춰, hunā = 여기, 둘 다 표준 아랍어예요. 택시에서 쓰는 생존 표현이에요.", tipEs: "qif = pare, hunā = aquí, ambos en árabe estándar. Supervivencia en taxi.", tipId: "qif = berhenti, hunā = di sini, keduanya bahasa Arab baku. Bertahan hidup di taksi." },
      { word: "أنا تائِه", ipa: "anā tāʼih", meaning: "길을 잃었어요.", meaningEn: "I am lost.", meaningEs: "Estoy perdido.", meaningId: "Saya tersesat.", speechLang: "ar-EG", tip: "anā tāʼih = I am lost, in MSA. Say it calmly when you need directions.", tipKo: "anā tāʼih = 표준 아랍어로 '길을 잃었어요'. 길 안내가 필요할 때 차분하게 말하세요.", tipEs: "anā tāʼih = estoy perdido, en árabe estándar. Dilo con calma cuando necesites indicaciones.", tipId: "anā tāʼih = saya tersesat, dalam bahasa Arab baku. Ucapkan dengan tenang saat butuh petunjuk arah." },
      { word: "أُريد سَيّارة أُجْرة", ipa: "urīd sayyārat ujra", meaning: "택시 불러 주세요.", meaningEn: "I want a taxi.", meaningEs: "Quiero un taxi.", meaningId: "Tolong panggil taksi.", speechLang: "ar-EG", tip: "sayyārat ujra = taxi (lit. 'hire car') in MSA. A practical street request.", tipKo: "sayyārat ujra = 표준 아랍어로 '택시'(직역하면 '대여 차'). 길에서 실용적인 요청이에요.", tipEs: "sayyārat ujra = taxi (lit. 'coche de alquiler') en árabe estándar. Una petición práctica en la calle.", tipId: "sayyārat ujra = taksi (harfiah 'mobil sewaan') dalam bahasa Arab baku. Permintaan praktis di jalan." },
    ],
    relationship: [
      { word: "مَا اسْمُك؟", ipa: "mā smuk?", meaning: "이름이 뭐예요?", meaningEn: "What is your name?", meaningEs: "¿Cómo te llamas?", meaningId: "Siapa nama kamu?", speechLang: "ar-EG", tip: "mā = what in MSA, understood everywhere. Asking a man his name.", tipKo: "mā = 표준 아랍어로 '무엇', 어디서나 통해요. 남성에게 이름을 묻는 표현이에요.", tipEs: "mā = qué en árabe estándar, entendido en todas partes. Preguntar el nombre a un hombre.", tipId: "mā = apa dalam bahasa Arab baku, dipahami di mana saja. Menanyakan nama seorang laki-laki." },
      { word: "اِسْمي أليكس", ipa: "ismī Alex", meaning: "제 이름은 알렉스예요.", meaningEn: "My name is Alex.", meaningEs: "Me llamo Alex.", meaningId: "Nama saya Alex.", speechLang: "ar-EG", tip: "Swap Alex for your name when you practice.", tipKo: "연습할 때 Alex 대신 자신의 이름을 넣으세요.", tipEs: "Cambia Alex por tu nombre cuando practiques.", tipId: "Ganti Alex dengan namamu saat berlatih." },
      { word: "فُرْصة سَعيدة", ipa: "furṣa saʿīda", meaning: "만나서 반가워요.", meaningEn: "Nice to meet you.", meaningEs: "Mucho gusto.", meaningId: "Senang bertemu kamu.", speechLang: "ar-EG", tip: "furṣa saʿīda = nice to meet you (literally 'happy chance').", tipKo: "furṣa saʿīda = 만나서 반가워요 (직역하면 '행복한 기회').", tipEs: "furṣa saʿīda = mucho gusto (literalmente 'feliz oportunidad').", tipId: "furṣa saʿīda = senang bertemu (harfiah 'kesempatan yang menyenangkan')." },
      { word: "كَيْفَ حالُك؟", ipa: "kayfa ḥāluk?", meaning: "잘 지내요?", meaningEn: "How are you?", meaningEs: "¿Cómo estás?", meaningId: "Apa kabar?", speechLang: "ar-EG", tip: "kayfa ḥāluk = how are you (to a man) in MSA. A warm everyday check-in.", tipKo: "kayfa ḥāluk = 표준 아랍어로 '잘 지내요?'(남성에게). 따뜻한 일상 안부 표현이에요.", tipEs: "kayfa ḥāluk = ¿cómo estás? (a un hombre) en árabe estándar. Un cálido saludo cotidiano.", tipId: "kayfa ḥāluk = apa kabar (kepada laki-laki) dalam bahasa Arab baku. Sapaan harian yang hangat." },
      { word: "أَراك لاحِقًا", ipa: "arāka lāḥiqan", meaning: "나중에 봐요.", meaningEn: "See you later.", meaningEs: "Hasta luego.", meaningId: "Sampai nanti.", speechLang: "ar-EG", tip: "arāka = I'll see you, lāḥiqan = later, both MSA. A friendly goodbye.", tipKo: "arāka = 또 볼게요, lāḥiqan = 나중에, 둘 다 표준 아랍어예요. 다정한 작별 인사예요.", tipEs: "arāka = te veré, lāḥiqan = luego, ambos en árabe estándar. Una despedida amistosa.", tipId: "arāka = sampai jumpa, lāḥiqan = nanti, keduanya bahasa Arab baku. Salam perpisahan yang ramah." },
      { word: "شُكْرًا جَزيلًا", ipa: "shukran jazīlan", meaning: "정말 고마워요.", meaningEn: "Thank you very much.", meaningEs: "Muchas gracias.", meaningId: "Terima kasih banyak.", speechLang: "ar-EG", tip: "jazīlan = a lot. Warm gratitude in MSA — note the standard j sound.", tipKo: "jazīlan = 많이. 표준 아랍어의 따뜻한 감사 표현이에요 — 표준 j 소리에 유의하세요.", tipEs: "jazīlan = mucho. Gratitud cálida en árabe estándar — fíjate en el sonido j estándar.", tipId: "jazīlan = banyak. Ungkapan terima kasih hangat dalam bahasa Arab baku — perhatikan bunyi j baku." },
      { word: "آسِف، لَقَدْ تَأَخَّرْت", ipa: "āsif, laqad taʼakhkhart", meaning: "늦어서 미안해요.", meaningEn: "Sorry, I am late.", meaningEs: "Perdón por llegar tarde.", meaningId: "Maaf, saya terlambat.", speechLang: "ar-EG", tip: "laqad taʼakhkhart = I was late, in MSA. A gentle, honest apology.", tipKo: "laqad taʼakhkhart = 표준 아랍어로 '늦었어요'. 부드럽고 솔직한 사과예요.", tipEs: "laqad taʼakhkhart = llegué tarde, en árabe estándar. Una disculpa suave y sincera.", tipId: "laqad taʼakhkhart = saya terlambat, dalam bahasa Arab baku. Permintaan maaf yang lembut dan tulus." },
    ],
    work: [
      { word: "مَرّة ثانِية، مِن فَضْلِك", ipa: "marra thāniya, min faḍlik", meaning: "다시 말해 주세요.", meaningEn: "Again, please.", meaningEs: "Otra vez, por favor.", meaningId: "Tolong ulangi.", speechLang: "ar-EG", tip: "A useful meeting repair phrase. Say it calmly.", tipKo: "회의에서 유용한 대화 복구 표현이에요. 차분하게 말하세요.", tipEs: "Una frase útil para retomar el hilo en una reunión. Dila con calma.", tipId: "Frasa perbaikan yang berguna saat rapat. Ucapkan dengan tenang." },
      { word: "لا أَفْهَم", ipa: "lā afham", meaning: "이해 못 했어요.", meaningEn: "I don't understand.", meaningEs: "No entiendo.", meaningId: "Saya tidak mengerti.", speechLang: "ar-EG", tip: "It is okay to ask. lā afham = I don't understand, in MSA.", tipKo: "물어봐도 괜찮아요. lā afham = 표준 아랍어로 '이해 못 했어요'.", tipEs: "Está bien preguntar. lā afham = no entiendo, en árabe estándar.", tipId: "Tidak apa-apa bertanya. lā afham = saya tidak mengerti, dalam bahasa Arab baku." },
      { word: "عِنْدي سُؤال", ipa: "ʿindī suʼāl", meaning: "질문 있어요.", meaningEn: "I have a question.", meaningEs: "Tengo una pregunta.", meaningId: "Saya punya pertanyaan.", speechLang: "ar-EG", tip: "ʿindī = I have, suʼāl = question, both MSA. Say it before you get stuck.", tipKo: "ʿindī = 가지다, suʼāl = 질문, 둘 다 표준 아랍어예요. 막히기 전에 말하세요.", tipEs: "ʿindī = tengo, suʼāl = pregunta, ambos en árabe estándar. Dilo antes de quedarte atascado.", tipId: "ʿindī = saya punya, suʼāl = pertanyaan, keduanya bahasa Arab baku. Ucapkan sebelum kamu tersendat." },
      { word: "اِنْتَظِرْ قَليلًا، مِن فَضْلِك", ipa: "intaẓir qalīlan, min faḍlik", meaning: "잠시만 기다려 주세요.", meaningEn: "Wait a moment, please.", meaningEs: "Espere un momento, por favor.", meaningId: "Tolong tunggu sebentar.", speechLang: "ar-EG", tip: "intaẓir qalīlan = wait a little, in MSA. A polite pause at work.", tipKo: "intaẓir qalīlan = 표준 아랍어로 '잠깐 기다려요'. 직장에서 정중하게 멈출 때 써요.", tipEs: "intaẓir qalīlan = espera un poco, en árabe estándar. Una pausa cortés en el trabajo.", tipId: "intaẓir qalīlan = tunggu sebentar, dalam bahasa Arab baku. Jeda yang sopan di tempat kerja." },
      { word: "شُكْرًا", ipa: "shukran", meaning: "감사합니다.", meaningEn: "Thank you.", meaningEs: "Gracias.", meaningId: "Terima kasih.", speechLang: "ar-EG", tip: "End politely and clearly.", tipKo: "정중하고 분명하게 끝맺으세요.", tipEs: "Termina con cortesía y claridad.", tipId: "Akhiri dengan sopan dan jelas." },
      { word: "سَأُرْسِل بَريدًا إِلِكْترونِيًّا", ipa: "saʼursil barīdan iliktrūniyyan", meaning: "이메일 보낼게요.", meaningEn: "I'll send an email.", meaningEs: "Enviaré un correo.", meaningId: "Saya akan kirim email.", speechLang: "ar-EG", tip: "sa- = will (MSA future). saʼursil barīdan = I'll send an email.", tipKo: "sa- = ~할 것이다 (표준 아랍어 미래형). saʼursil barīdan = 이메일을 보낼게요.", tipEs: "sa- = (futuro en árabe estándar). saʼursil barīdan = enviaré un correo.", tipId: "sa- = akan (bentuk masa depan Arab baku). saʼursil barīdan = saya akan kirim email." },
      { word: "اُنْظُرْ إِلى هٰذَا، مِن فَضْلِك", ipa: "unẓur ilā hādhā, min faḍlik", meaning: "확인해 주세요.", meaningEn: "Please check this.", meaningEs: "Revísalo, por favor.", meaningId: "Tolong periksa ini.", speechLang: "ar-EG", tip: "unẓur = look, hādhā = this, both MSA. Useful for documents.", tipKo: "unẓur = 보다, hādhā = 이것, 둘 다 표준 아랍어예요. 서류에 유용해요.", tipEs: "unẓur = mira, hādhā = esto, ambos en árabe estándar. Útil para documentos.", tipId: "unẓur = lihat, hādhā = ini, keduanya bahasa Arab baku. Berguna untuk dokumen." },
    ],
    study: [
      { word: "لا أَفْهَم", ipa: "lā afham", meaning: "이해 못 했어요.", meaningEn: "I don't understand.", meaningEs: "No entiendo.", meaningId: "Saya tidak mengerti.", speechLang: "ar-EG", tip: "A classroom survival phrase. Say it without fear.", tipKo: "교실에서 쓰는 생존 표현이에요. 두려워하지 말고 말하세요.", tipEs: "Una frase de supervivencia para el aula. Dila sin miedo.", tipId: "Frasa bertahan hidup di kelas. Ucapkan tanpa rasa takut." },
      { word: "مَرّة ثانِية، مِن فَضْلِك", ipa: "marra thāniya, min faḍlik", meaning: "다시 말해 주세요.", meaningEn: "Again, please.", meaningEs: "Otra vez, por favor.", meaningId: "Tolong ulangi.", speechLang: "ar-EG", tip: "marra thāniya = once more, in MSA. Ask before you fall behind.", tipKo: "marra thāniya = 표준 아랍어로 '한 번 더'. 뒤처지기 전에 물어보세요.", tipEs: "marra thāniya = una vez más, en árabe estándar. Pregunta antes de quedarte atrás.", tipId: "marra thāniya = sekali lagi, dalam bahasa Arab baku. Tanyakan sebelum kamu tertinggal." },
      { word: "مَا مَعْنى هٰذِهِ الكَلِمة؟", ipa: "mā maʿnā hādhihi l-kalima?", meaning: "이 단어 무슨 뜻이에요?", meaningEn: "What does this word mean?", meaningEs: "¿Qué significa esta palabra?", meaningId: "Apa arti kata ini?", speechLang: "ar-EG", tip: "kalima = word, hādhihi = this (feminine), both MSA. A real learner question.", tipKo: "kalima = 단어, hādhihi = 이것(여성형), 둘 다 표준 아랍어예요. 실제 학습자 질문이에요.", tipEs: "kalima = palabra, hādhihi = esta (femenino), ambos en árabe estándar. Una pregunta real de quien aprende.", tipId: "kalima = kata, hādhihi = ini (bentuk feminin), keduanya bahasa Arab baku. Pertanyaan pelajar yang nyata." },
      { word: "اِشْرَحْها مَرّة ثانِية، مِن فَضْلِك", ipa: "ishraḥhā marra thāniya, min faḍlik", meaning: "다시 설명해 주세요.", meaningEn: "Please explain it again.", meaningEs: "Explícalo otra vez, por favor.", meaningId: "Tolong jelaskan lagi.", speechLang: "ar-EG", tip: "ishraḥ = explain, in MSA. Ask for another explanation.", tipKo: "ishraḥ = 표준 아랍어로 '설명하다'. 다시 설명해 달라고 하세요.", tipEs: "ishraḥ = explicar, en árabe estándar. Pide otra explicación.", tipId: "ishraḥ = menjelaskan, dalam bahasa Arab baku. Minta penjelasan lagi." },
      { word: "أُريد أَنْ أَتَعَلَّم", ipa: "urīd an ataʿallam", meaning: "공부하고 싶어요.", meaningEn: "I want to learn.", meaningEs: "Quiero aprender.", meaningId: "Saya mau belajar.", speechLang: "ar-EG", tip: "urīd an ataʿallam = I want to learn, in MSA. A direct learning sentence.", tipKo: "urīd an ataʿallam = 표준 아랍어로 '배우고 싶어요'. 직접적인 학습 문장이에요.", tipEs: "urīd an ataʿallam = quiero aprender, en árabe estándar. Una frase de aprendizaje directa.", tipId: "urīd an ataʿallam = saya mau belajar, dalam bahasa Arab baku. Kalimat belajar yang langsung." },
      { word: "شُكْرًا يا أُسْتاذ", ipa: "shukran yā ustādh", meaning: "감사합니다, 선생님.", meaningEn: "Thank you, teacher.", meaningEs: "Gracias, profesor.", meaningId: "Terima kasih, Pak.", speechLang: "ar-EG", tip: "yā = O (address), ustādh = teacher/sir, both MSA. End the lesson politely.", tipKo: "yā = (부르는 말) ~여, ustādh = 선생님/선생, 둘 다 표준 아랍어예요. 수업을 정중하게 끝맺으세요.", tipEs: "yā = oh (vocativo), ustādh = profesor/señor, ambos en árabe estándar. Termina la clase con cortesía.", tipId: "yā = kata sapaan (wahai), ustādh = guru/pak, keduanya bahasa Arab baku. Akhiri pelajaran dengan sopan." },
    ],
    hobby: [
      { word: "أنا أُحِبّ المُوسيقى", ipa: "anā uḥibb al-mūsīqā", meaning: "저는 음악을 좋아해요.", meaningEn: "I like music.", meaningEs: "Me gusta la música.", meaningId: "Saya suka musik.", speechLang: "ar-EG", tip: "uḥibb = I love/like, in MSA. A short, useful opinion.", tipKo: "uḥibb = 표준 아랍어로 '좋아하다/사랑하다'. 짧고 유용한 의견이에요.", tipEs: "uḥibb = me gusta/amo, en árabe estándar. Una opinión corta y útil.", tipId: "uḥibb = saya suka/cinta, dalam bahasa Arab baku. Pendapat singkat yang berguna." },
      { word: "هٰذَا أَعْجَبَني", ipa: "hādhā aʿjabanī", meaning: "마음에 들어요.", meaningEn: "I like it.", meaningEs: "Me gusta.", meaningId: "Saya suka ini.", speechLang: "ar-EG", tip: "aʿjabanī = it pleased me, hādhā = this, both MSA. A tiny opinion you can use anywhere.", tipKo: "aʿjabanī = 마음에 들었어요, hādhā = 이것, 둘 다 표준 아랍어예요. 어디서나 쓸 수 있는 아주 짧은 의견이에요.", tipEs: "aʿjabanī = me agradó, hādhā = esto, ambos en árabe estándar. Una opinión diminuta que puedes usar en cualquier lugar.", tipId: "aʿjabanī = aku menyukainya, hādhā = ini, keduanya bahasa Arab baku. Pendapat mungil yang bisa dipakai di mana saja." },
      { word: "هِوايَتي القِراءة", ipa: "hiwāyatī l-qirāʼa", meaning: "제 취미는 독서예요.", meaningEn: "My hobby is reading.", meaningEs: "Mi pasatiempo es leer.", meaningId: "Hobi saya membaca.", speechLang: "ar-EG", tip: "hiwāya = hobby, qirāʼa = reading, both MSA. Swap in your own hobby.", tipKo: "hiwāya = 취미, qirāʼa = 독서, 둘 다 표준 아랍어예요. 자신의 취미로 바꿔 보세요.", tipEs: "hiwāya = pasatiempo, qirāʼa = lectura, ambos en árabe estándar. Cámbialo por tu propio pasatiempo.", tipId: "hiwāya = hobi, qirāʼa = membaca, keduanya bahasa Arab baku. Ganti dengan hobimu sendiri." },
      { word: "هٰذَا جَميل جِدًّا", ipa: "hādhā jamīl jiddan", meaning: "재미있어요.", meaningEn: "This is really nice.", meaningEs: "Esto es muy bueno.", meaningId: "Ini menyenangkan.", speechLang: "ar-EG", tip: "jamīl = nice, jiddan = very, both MSA. A tiny reaction.", tipKo: "jamīl = 멋진, jiddan = 매우, 둘 다 표준 아랍어예요. 아주 짧은 반응 표현이에요.", tipEs: "jamīl = bonito, jiddan = muy, ambos en árabe estándar. Una reacción diminuta.", tipId: "jamīl = bagus, jiddan = sangat, keduanya bahasa Arab baku. Reaksi mungil." },
      { word: "هَيّا نَفْعَلْها مَعًا", ipa: "hayyā nafʿalhā maʿan", meaning: "같이 해요.", meaningEn: "Let's do it together.", meaningEs: "Hagámoslo juntos.", meaningId: "Mari kita lakukan bersama.", speechLang: "ar-EG", tip: "hayyā = come on, maʿan = together, both MSA. Invite someone naturally.", tipKo: "hayyā = 자, maʿan = 함께, 둘 다 표준 아랍어예요. 자연스럽게 누군가를 초대하세요.", tipEs: "hayyā = vamos, maʿan = juntos, ambos en árabe estándar. Invita a alguien de forma natural.", tipId: "hayyā = ayo, maʿan = bersama, keduanya bahasa Arab baku. Ajak seseorang secara alami." },
      { word: "اِقْتَرِحْ لي شَيْئًا، مِن فَضْلِك", ipa: "iqtariḥ lī shayʼan, min faḍlik", meaning: "추천해 주세요.", meaningEn: "Recommend me something, please.", meaningEs: "Recomiéndame algo, por favor.", meaningId: "Tolong rekomendasikan sesuatu.", speechLang: "ar-EG", tip: "shayʼan = something, iqtariḥ = recommend, both MSA. Ask for a song, show, or place.", tipKo: "shayʼan = 무언가, iqtariḥ = 추천하다, 둘 다 표준 아랍어예요. 노래, 방송, 장소를 추천해 달라고 하세요.", tipEs: "shayʼan = algo, iqtariḥ = recomendar, ambos en árabe estándar. Pide una canción, un programa o un lugar.", tipId: "shayʼan = sesuatu, iqtariḥ = merekomendasikan, keduanya bahasa Arab baku. Minta rekomendasi lagu, acara, atau tempat." },
    ],
    exam: [
      { word: "مَتى الاِمْتِحان؟", ipa: "matā l-imtiḥān?", meaning: "시험이 언제예요?", meaningEn: "When is the exam?", meaningEs: "¿Cuándo es el examen?", meaningId: "Kapan ujiannya?", speechLang: "ar-EG", tip: "matā = when, imtiḥān = exam, both MSA. A real test-day question.", tipKo: "matā = 언제, imtiḥān = 시험, 둘 다 표준 아랍어예요. 실제 시험 날 질문이에요.", tipEs: "matā = cuándo, imtiḥān = examen, ambos en árabe estándar. Una pregunta real del día del examen.", tipId: "matā = kapan, imtiḥān = ujian, keduanya bahasa Arab baku. Pertanyaan nyata di hari ujian." },
      { word: "عِنْدي سُؤال", ipa: "ʿindī suʼāl", meaning: "질문 있어요.", meaningEn: "I have a question.", meaningEs: "Tengo una pregunta.", meaningId: "Saya punya pertanyaan.", speechLang: "ar-EG", tip: "ʿindī suʼāl = I have a question, in MSA. Say it before you freeze.", tipKo: "ʿindī suʼāl = 표준 아랍어로 '질문 있어요'. 얼어붙기 전에 말하세요.", tipEs: "ʿindī suʼāl = tengo una pregunta, en árabe estándar. Dilo antes de bloquearte.", tipId: "ʿindī suʼāl = saya punya pertanyaan, dalam bahasa Arab baku. Ucapkan sebelum kamu membeku." },
      { word: "اِشْرَحْها مَرّة ثانِية، مِن فَضْلِك", ipa: "ishraḥhā marra thāniya, min faḍlik", meaning: "다시 설명해 주세요.", meaningEn: "Please explain it again.", meaningEs: "Explícalo otra vez, por favor.", meaningId: "Tolong jelaskan lagi.", speechLang: "ar-EG", tip: "ishraḥ = explain, in MSA. Ask for a clearer version.", tipKo: "ishraḥ = 표준 아랍어로 '설명하다'. 더 명확한 설명을 청하세요.", tipEs: "ishraḥ = explicar, en árabe estándar. Pide una versión más clara.", tipId: "ishraḥ = menjelaskan, dalam bahasa Arab baku. Minta versi yang lebih jelas." },
      { word: "أُريد وَقْتًا إِضافِيًّا", ipa: "urīd waqtan iḍāfiyyan", meaning: "시간이 더 필요해요.", meaningEn: "I need more time.", meaningEs: "Necesito más tiempo.", meaningId: "Saya butuh waktu lagi.", speechLang: "ar-EG", tip: "waqt = time, iḍāfī = extra, both MSA. A real request under pressure.", tipKo: "waqt = 시간, iḍāfī = 추가의, 둘 다 표준 아랍어예요. 압박 속에서 쓰는 실제 요청이에요.", tipEs: "waqt = tiempo, iḍāfī = extra, ambos en árabe estándar. Una petición real bajo presión.", tipId: "waqt = waktu, iḍāfī = tambahan, keduanya bahasa Arab baku. Permintaan nyata saat tertekan." },
      { word: "أنا جاهِز", ipa: "anā jāhiz", meaning: "준비됐어요.", meaningEn: "I am ready.", meaningEs: "Estoy listo.", meaningId: "Saya sudah siap.", speechLang: "ar-EG", tip: "jāhiz = ready (a man), in MSA with a standard j. A confidence line.", tipKo: "jāhiz = 준비된(남성), 표준 j 소리의 표준 아랍어예요. 자신감 문장이에요.", tipEs: "jāhiz = listo (un hombre), en árabe estándar con j estándar. Una frase de confianza.", tipId: "jāhiz = siap (laki-laki), dalam bahasa Arab baku dengan bunyi j baku. Kalimat percaya diri." },
      { word: "لا أَعْرِف الإِجابة", ipa: "lā aʿrif al-ijāba", meaning: "답을 모르겠어요.", meaningEn: "I don't know the answer.", meaningEs: "No sé la respuesta.", meaningId: "Saya tidak tahu jawabannya.", speechLang: "ar-EG", tip: "lā aʿrif = I don't know, ijāba = answer, both MSA.", tipKo: "lā aʿrif = 모르겠어요, ijāba = 답, 둘 다 표준 아랍어예요.", tipEs: "lā aʿrif = no sé, ijāba = respuesta, ambos en árabe estándar.", tipId: "lā aʿrif = saya tidak tahu, ijāba = jawaban, keduanya bahasa Arab baku." },
    ],
  },
};

// `meaning` = Korean, `meaningEn` = English, `meaningEs` = Spanish; the spoken
// word IS the Indonesian self-meaning.
function id(word: string, ipa: string, meaning: string, meaningEn: string, meaningEs: string, tip: string, tipKo?: string, tipEs?: string, tipId?: string): RawDailyPhrase {
  return { word, ipa, meaning, meaningEn, meaningEs, meaningId: word, speechLang: "id-ID", tip, tipKo, tipEs, tipId };
}

function ko(word: string, ipa: string, meaning: string, meaningEs: string, tip: string, tipKo?: string, tipEs?: string, tipId?: string): RawDailyPhrase {
  return { word, ipa, meaning, meaningEs, speechLang: "ko-KR", tip, tipKo, tipEs, tipId };
}

function en(word: string, ipa: string, meaning: string, meaningEs: string, tip: string, tipKo?: string, tipEs?: string, tipId?: string): RawDailyPhrase {
  return { word, ipa, meaning, meaningEs, speechLang: "en-US", tip, tipKo, tipEs, tipId };
}

function es(word: string, ipa: string, meaning: string, meaningEs: string, tip: string, tipKo?: string, tipEs?: string, tipId?: string): RawDailyPhrase {
  return { word, ipa, meaning, meaningEs, speechLang: "es-ES", tip, tipKo, tipEs, tipId };
}

const DAILY_SPEAKING_STARTERS: Partial<Record<DailySpeakingLanguage, RawDailyPhrase[]>> = {
  korean: [
    ko("네.", "/ne/", "Yes.", "Sí.", "A tiny real answer. Keep it short and clear.", "아주 짧은 실제 대답이에요. 짧고 분명하게 발음하세요.", "Una respuesta diminuta y real. Mantenla corta y clara.", "Jawaban mungil yang nyata. Buat singkat dan jelas."),
    ko("아니요.", "/a.ni.jo/", "No.", "No.", "A safe answer. Keep the final 요 soft.", "안전한 대답이에요. 마지막 요를 부드럽게 발음하세요.", "Una respuesta segura. Mantén la 요 final suave.", "Jawaban yang aman. Jaga 요 di akhir tetap lembut."),
    ko("괜찮아요.", "/kwɛn.tɕʰa.na.jo/", "It is okay.", "Está bien.", "A gentle sentence you can use often.", "자주 쓸 수 있는 부드러운 문장이에요.", "Una frase suave que puedes usar a menudo.", "Kalimat lembut yang sering bisa kamu pakai."),
    ko("천천히 말해 주세요.", "/tɕʰʌn.tɕʰʌn.hi ma.ɾɛ dʑu.se.jo/", "Please speak slowly.", "Habla despacio, por favor.", "A survival sentence. Slow down the middle.", "생존 문장이에요. 가운데 부분을 천천히 발음하세요.", "Una frase de supervivencia. Baja la velocidad en el medio.", "Kalimat bertahan hidup. Perlambat bagian tengahnya."),
    ko("저는 초보자예요.", "/tɕʌ.nɯn tɕʰo.bo.dʑa.je.jo/", "I am a beginner.", "Soy principiante.", "Say it without apology. It helps people help you.", "사과하지 말고 말하세요. 사람들이 당신을 돕기 쉬워져요.", "Dilo sin disculparte. Ayuda a que los demás te ayuden.", "Ucapkan tanpa minta maaf. Itu memudahkan orang membantumu."),
    ko("영어 할 줄 아세요?", "/jʌŋ.ʌ hal dʑul a.se.jo/", "Do you speak English?", "¿Hablas inglés?", "Useful when you need a bridge language.", "다리 역할을 할 언어가 필요할 때 유용해요.", "Útil cuando necesitas un idioma puente.", "Berguna saat kamu butuh bahasa penghubung."),
    ko("안녕히 가세요.", "/an.njʌŋ.hi ka.se.jo/", "Goodbye.", "Adiós.", "A real goodbye. Let it feel warm, not final.", "진짜 작별 인사예요. 단호하지 않고 따뜻하게 들리도록 하세요.", "Una despedida real. Que suene cálida, no definitiva.", "Salam perpisahan yang nyata. Buat terdengar hangat, bukan final."),
    ko("죄송합니다.", "/tɕwe.soŋ.ham.ni.da/", "I am sorry.", "Lo siento.", "A repair sentence. Say it gently and keep going.", "대화 복구 문장이에요. 부드럽게 말하고 계속 이어 가세요.", "Una frase para retomar. Dila con suavidad y sigue adelante.", "Kalimat perbaikan. Ucapkan dengan lembut dan lanjutkan."),
    ko("화장실이 어디예요?", "/hwa.dʑaŋ.ɕi.ɾi ʌ.di.je.jo/", "Where is the bathroom?", "¿Dónde está el baño?", "A real travel sentence. Let the pitch rise at the end.", "실제 여행 문장이에요. 끝에서 음을 올리세요.", "Una frase de viaje real. Deja que el tono suba al final.", "Kalimat perjalanan yang nyata. Naikkan nada di akhir."),
    ko("얼마예요?", "/ʌl.ma.je.jo/", "How much is it?", "¿Cuánto cuesta?", "A tiny money question you can use every day.", "매일 쓸 수 있는 아주 짧은 돈 관련 질문이에요.", "Una pregunta diminuta sobre dinero que puedes usar a diario.", "Pertanyaan kecil soal uang yang bisa kamu pakai setiap hari."),
    ko("도와주세요.", "/to.wa.dʑu.se.jo/", "Please help me.", "Ayúdame, por favor.", "An emergency sentence. Slow and clear is enough.", "비상 문장이에요. 천천히 또박또박이면 충분해요.", "Una frase de emergencia. Despacio y claro es suficiente.", "Kalimat darurat. Pelan dan jelas sudah cukup."),
    ko("이름이 뭐예요?", "/i.ɾɯ.mi mwʌ.je.jo/", "What is your name?", "¿Cómo te llamas?", "A real first conversation question.", "실제 첫 대화 질문이에요.", "Una pregunta real para iniciar una conversación.", "Pertanyaan percakapan pertama yang nyata."),
    ko("제 이름은 알렉스예요.", "/tɕe i.ɾɯ.mɯn al.lek.sɯ.je.jo/", "My name is Alex.", "Me llamo Alex.", "Swap Alex for your name when you practice.", "연습할 때 Alex 대신 자신의 이름을 넣으세요.", "Cambia Alex por tu nombre cuando practiques.", "Ganti Alex dengan namamu saat berlatih."),
    ko("여기 있어요.", "/jʌ.gi i.sʌ.jo/", "Here it is.", "Aquí está.", "Useful when showing a ticket, phone, or bag.", "표, 휴대폰, 가방을 보여 줄 때 유용해요.", "Útil al mostrar un boleto, el teléfono o una bolsa.", "Berguna saat menunjukkan tiket, ponsel, atau tas."),
    ko("몰라요.", "/mol.la.jo/", "I do not know.", "No sé.", "Short, honest, and useful.", "짧고, 솔직하고, 유용해요.", "Corta, honesta y útil.", "Singkat, jujur, dan berguna."),
    ko("좋아요.", "/tɕo.a.jo/", "I like it.", "Me gusta.", "A small opinion sentence you can use everywhere.", "어디서나 쓸 수 있는 짧은 의견 문장이에요.", "Una pequeña frase de opinión que puedes usar en cualquier lugar.", "Kalimat pendapat singkat yang bisa kamu pakai di mana saja."),
    ko("잠깐만요.", "/tɕam.kkan.man.jo/", "One moment, please.", "Un momento, por favor.", "A natural pause sentence. Hold the double ㄲ briefly.", "자연스러운 멈춤 문장이에요. 쌍자음 ㄲ을 잠깐 머금으세요.", "Una frase natural de pausa. Sostén la doble ㄲ un instante.", "Kalimat jeda yang alami. Tahan konsonan ganda ㄲ sejenak."),
    ko("지금 가요.", "/tɕi.gɯm ga.jo/", "I am going now.", "Voy ahora.", "A real movement sentence. Keep it simple.", "실제 이동 문장이에요. 간단하게 유지하세요.", "Una frase real de movimiento. Mantenla simple.", "Kalimat gerak yang nyata. Buat tetap sederhana."),
    ko("문제없어요.", "/mun.dʑe ʌp.sʌ.jo/", "No problem.", "No hay problema.", "Say it as reassurance, not as a test.", "시험이 아니라 안심시키는 말로 하세요.", "Dilo como tranquilizador, no como una prueba.", "Ucapkan sebagai penenang, bukan sebagai ujian."),
    ko("다시 해 볼게요.", "/ta.ɕi hɛ bol.ge.jo/", "I will try again.", "Lo intentaré otra vez.", "The app's core sentence: try, then fix.", "앱의 핵심 문장이에요: 시도한 뒤 고치기.", "La frase central de la app: intenta y luego corrige.", "Kalimat inti aplikasi ini: coba, lalu perbaiki."),
  ],
  english: [
    en("Yes.", "/jes/", "네.", "Sí.", "A tiny real answer. Keep it clean.", "아주 짧은 실제 대답이에요. 깔끔하게 발음하세요.", "Una respuesta diminuta y real. Mantenla limpia.", "Jawaban mungil yang nyata. Buat tetap jernih."),
    en("No.", "/noʊ/", "아니요.", "No.", "A tiny real answer. Let the vowel finish.", "아주 짧은 실제 대답이에요. 모음을 끝까지 발음하세요.", "Una respuesta diminuta y real. Deja que la vocal termine.", "Jawaban mungil yang nyata. Biarkan vokalnya selesai."),
    en("It's okay.", "/ɪts oʊˈkeɪ/", "괜찮아요.", "Está bien.", "A gentle sentence you can use often.", "자주 쓸 수 있는 부드러운 문장이에요.", "Una frase suave que puedes usar a menudo.", "Kalimat lembut yang sering bisa kamu pakai."),
    en("Please speak slowly.", "/pliːz spiːk ˈsloʊ.li/", "천천히 말해 주세요.", "Habla despacio, por favor.", "A survival sentence. Stress slowly.", "생존 문장이에요. slowly에 강세를 두세요.", "Una frase de supervivencia. Acentúa 'slowly'.", "Kalimat bertahan hidup. Tekankan 'slowly'."),
    en("I'm a beginner.", "/aɪm ə bɪˈgɪn.ər/", "저는 초보자예요.", "Soy principiante.", "Say it clearly before you freeze.", "얼어붙기 전에 분명하게 말하세요.", "Dilo con claridad antes de bloquearte.", "Ucapkan dengan jelas sebelum kamu membeku."),
    en("Do you speak Korean?", "/duː juː spiːk kəˈriː.ən/", "한국어 할 줄 아세요?", "¿Hablas coreano?", "A useful bridge question.", "다리 역할을 하는 유용한 질문이에요.", "Una pregunta puente útil.", "Pertanyaan penghubung yang berguna."),
    en("Goodbye.", "/ˌgʊdˈbaɪ/", "안녕히 가세요.", "Adiós.", "A real goodbye. Keep it friendly and clear.", "진짜 작별 인사예요. 다정하고 분명하게 유지하세요.", "Una despedida real. Mantenla amistosa y clara.", "Salam perpisahan yang nyata. Buat tetap ramah dan jelas."),
    en("I'm sorry.", "/aɪm ˈsɑː.ri/", "죄송합니다.", "Lo siento.", "A repair sentence. Say it softly, then continue.", "대화 복구 문장이에요. 부드럽게 말한 뒤 계속하세요.", "Una frase para retomar. Dila con suavidad y luego continúa.", "Kalimat perbaikan. Ucapkan dengan lembut, lalu lanjutkan."),
    en("Where is the bathroom?", "/wer ɪz ðə ˈbæθ.ruːm/", "화장실이 어디예요?", "¿Dónde está el baño?", "A real travel sentence. Link where-is smoothly.", "실제 여행 문장이에요. where-is를 부드럽게 이으세요.", "Una frase de viaje real. Une 'where-is' suavemente.", "Kalimat perjalanan yang nyata. Sambungkan 'where-is' dengan halus."),
    en("How much is it?", "/haʊ mʌtʃ ɪz ɪt/", "얼마예요?", "¿Cuánto cuesta?", "A tiny money question you can use everywhere.", "어디서나 쓸 수 있는 아주 짧은 돈 관련 질문이에요.", "Una pregunta diminuta sobre dinero que puedes usar en cualquier lugar.", "Pertanyaan kecil soal uang yang bisa kamu pakai di mana saja."),
    en("Please help me.", "/pliːz help miː/", "도와주세요.", "Ayúdame, por favor.", "An emergency sentence. Slow and clear is enough.", "비상 문장이에요. 천천히 또박또박이면 충분해요.", "Una frase de emergencia. Despacio y claro es suficiente.", "Kalimat darurat. Pelan dan jelas sudah cukup."),
    en("What's your name?", "/wʌts jɔːr neɪm/", "이름이 뭐예요?", "¿Cómo te llamas?", "A real first conversation question.", "실제 첫 대화 질문이에요.", "Una pregunta real para iniciar una conversación.", "Pertanyaan percakapan pertama yang nyata."),
    en("My name is Alex.", "/maɪ neɪm ɪz ˈæl.eks/", "제 이름은 알렉스예요.", "Me llamo Alex.", "Swap Alex for your name when you practice.", "연습할 때 Alex 대신 자신의 이름을 넣으세요.", "Cambia Alex por tu nombre cuando practiques.", "Ganti Alex dengan namamu saat berlatih."),
    en("Here it is.", "/hɪr ɪt ɪz/", "여기 있어요.", "Aquí está.", "Useful when showing something.", "무언가를 보여 줄 때 유용해요.", "Útil al mostrar algo.", "Berguna saat menunjukkan sesuatu."),
    en("I don't know.", "/aɪ doʊnt noʊ/", "몰라요.", "No sé.", "Short, honest, and useful.", "짧고, 솔직하고, 유용해요.", "Corta, honesta y útil.", "Singkat, jujur, dan berguna."),
    en("I like it.", "/aɪ laɪk ɪt/", "좋아요.", "Me gusta.", "A small opinion sentence you can use everywhere.", "어디서나 쓸 수 있는 짧은 의견 문장이에요.", "Una pequeña frase de opinión que puedes usar en cualquier lugar.", "Kalimat pendapat singkat yang bisa kamu pakai di mana saja."),
    en("One moment, please.", "/wʌn ˈmoʊ.mənt pliːz/", "잠깐만요.", "Un momento, por favor.", "A natural pause sentence.", "자연스러운 멈춤 문장이에요.", "Una frase natural de pausa.", "Kalimat jeda yang alami."),
    en("I'm going now.", "/aɪm ˈgoʊ.ɪŋ naʊ/", "지금 가요.", "Voy ahora.", "A real movement sentence.", "실제 이동 문장이에요.", "Una frase real de movimiento.", "Kalimat gerak yang nyata."),
    en("No problem.", "/noʊ ˈprɑː.bləm/", "문제없어요.", "No hay problema.", "Use it as reassurance.", "안심시키는 말로 쓰세요.", "Úsala como tranquilizador.", "Pakai sebagai penenang."),
    en("I'll try again.", "/aɪl traɪ əˈgen/", "다시 해 볼게요.", "Lo intentaré otra vez.", "The app's core sentence: try, then fix.", "앱의 핵심 문장이에요: 시도한 뒤 고치기.", "La frase central de la app: intenta y luego corrige.", "Kalimat inti aplikasi ini: coba, lalu perbaiki."),
  ],
  spanish: [
    es("Sí.", "/si/", "네.", "Yes.", "A tiny real answer. Keep the vowel clean.", "아주 짧은 실제 대답이에요. 모음을 깨끗하게 발음하세요.", "Una respuesta diminuta y real. Mantén la vocal limpia.", "Jawaban mungil yang nyata. Jaga vokalnya tetap jernih."),
    es("No.", "/no/", "아니요.", "No.", "A tiny real answer. Short and calm.", "아주 짧은 실제 대답이에요. 짧고 차분하게.", "Una respuesta diminuta y real. Corta y tranquila.", "Jawaban mungil yang nyata. Singkat dan tenang."),
    es("Está bien.", "/esˈta βjen/", "괜찮아요.", "It is okay.", "A gentle sentence you can use often.", "자주 쓸 수 있는 부드러운 문장이에요.", "Una frase suave que puedes usar a menudo.", "Kalimat lembut yang sering bisa kamu pakai."),
    es("Habla despacio, por favor.", "/ˈa.βla desˈpa.sjo poɾ faˈβoɾ/", "천천히 말해 주세요.", "Please speak slowly.", "A survival sentence. Keep despacio smooth.", "생존 문장이에요. despacio를 부드럽게 발음하세요.", "Una frase de supervivencia. Mantén 'despacio' fluido.", "Kalimat bertahan hidup. Jaga 'despacio' tetap halus."),
    es("Soy principiante.", "/soj pɾin.siˈpjan.te/", "저는 초보자예요.", "I am a beginner.", "Say it clearly before you freeze.", "얼어붙기 전에 분명하게 말하세요.", "Dilo con claridad antes de bloquearte.", "Ucapkan dengan jelas sebelum kamu membeku."),
    es("¿Hablas coreano?", "/ˈa.βlas koˈɾe.a.no/", "한국어 할 줄 아세요?", "Do you speak Korean?", "A useful bridge question.", "다리 역할을 하는 유용한 질문이에요.", "Una pregunta puente útil.", "Pertanyaan penghubung yang berguna."),
    es("Adiós.", "/aˈðjos/", "안녕히 가세요.", "Goodbye.", "A real goodbye. Keep the final s light.", "진짜 작별 인사예요. 마지막 s를 가볍게 발음하세요.", "Una despedida real. Mantén la s final ligera.", "Salam perpisahan yang nyata. Jaga huruf s di akhir tetap ringan."),
    es("Lo siento.", "/lo ˈsjen.to/", "죄송합니다.", "I am sorry.", "A repair sentence. Say it gently and continue.", "대화 복구 문장이에요. 부드럽게 말하고 계속하세요.", "Una frase para retomar. Dila con suavidad y continúa.", "Kalimat perbaikan. Ucapkan dengan lembut dan lanjutkan."),
    es("¿Dónde está el baño?", "/ˈdon.de esˈta el ˈba.ɲo/", "화장실이 어디예요?", "Where is the bathroom?", "A real travel sentence. Keep the vowels clean and short.", "실제 여행 문장이에요. 모음을 깨끗하고 짧게 발음하세요.", "Una frase de viaje real. Mantén las vocales limpias y cortas.", "Kalimat perjalanan yang nyata. Jaga vokal tetap jernih dan pendek."),
    es("¿Cuánto cuesta?", "/ˈkwan.to ˈkwes.ta/", "얼마예요?", "How much is it?", "A shopping survival question. Keep cuesta crisp.", "쇼핑할 때 쓰는 생존 질문이에요. cuesta를 또렷하게 발음하세요.", "Una pregunta de supervivencia al comprar. Mantén 'cuesta' nítido.", "Pertanyaan bertahan hidup saat belanja. Ucapkan 'cuesta' dengan jelas."),
    es("Ayúdame, por favor.", "/aˈʝu.ða.me poɾ faˈβoɾ/", "도와주세요.", "Please help me.", "An emergency sentence. Slow and clear is enough.", "비상 문장이에요. 천천히 또박또박이면 충분해요.", "Una frase de emergencia. Despacio y claro es suficiente.", "Kalimat darurat. Pelan dan jelas sudah cukup."),
    es("¿Cómo te llamas?", "/ˈko.mo te ˈʝa.mas/", "이름이 뭐예요?", "What is your name?", "A real first conversation question.", "실제 첫 대화 질문이에요.", "Una pregunta real para iniciar una conversación.", "Pertanyaan percakapan pertama yang nyata."),
    es("Me llamo Alex.", "/me ˈʝa.mo ˈa.leks/", "제 이름은 알렉스예요.", "My name is Alex.", "Swap Alex for your name when you practice.", "연습할 때 Alex 대신 자신의 이름을 넣으세요.", "Cambia Alex por tu nombre cuando practiques.", "Ganti Alex dengan namamu saat berlatih."),
    es("Aquí está.", "/aˈki esˈta/", "여기 있어요.", "Here it is.", "Useful when showing something.", "무언가를 보여 줄 때 유용해요.", "Útil al mostrar algo.", "Berguna saat menunjukkan sesuatu."),
    es("No sé.", "/no se/", "몰라요.", "I do not know.", "Short, honest, and useful.", "짧고, 솔직하고, 유용해요.", "Corta, honesta y útil.", "Singkat, jujur, dan berguna."),
    es("Me gusta.", "/me ˈɡus.ta/", "좋아요.", "I like it.", "A small opinion sentence you can use everywhere.", "어디서나 쓸 수 있는 짧은 의견 문장이에요.", "Una pequeña frase de opinión que puedes usar en cualquier lugar.", "Kalimat pendapat singkat yang bisa kamu pakai di mana saja."),
    es("Un momento, por favor.", "/un moˈmen.to poɾ faˈβoɾ/", "잠깐만요.", "One moment, please.", "A natural pause sentence.", "자연스러운 멈춤 문장이에요.", "Una frase natural de pausa.", "Kalimat jeda yang alami."),
    es("Voy ahora.", "/boj aˈo.ɾa/", "지금 가요.", "I am going now.", "A real movement sentence.", "실제 이동 문장이에요.", "Una frase real de movimiento.", "Kalimat gerak yang nyata."),
    es("No hay problema.", "/no aj pɾoˈβle.ma/", "문제없어요.", "No problem.", "Use it as reassurance.", "안심시키는 말로 쓰세요.", "Úsala como tranquilizador.", "Pakai sebagai penenang."),
    es("Lo intento otra vez.", "/lo inˈten.to ˈo.tɾa βes/", "다시 해 볼게요.", "I will try again.", "The app's core sentence: try, then fix.", "앱의 핵심 문장이에요: 시도한 뒤 고치기.", "La frase central de la app: intenta y luego corrige.", "Kalimat inti aplikasi ini: coba, lalu perbaiki."),
  ],
  indonesian: [
    id("Ya.", "/ja/", "네.", "Yes.", "Sí.", "A tiny real answer. Keep it short and clear.", "아주 짧은 실제 대답이에요. 짧고 분명하게 발음하세요.", "Una respuesta diminuta y real. Mantenla corta y clara.", "Jawaban mungil yang nyata. Buat singkat dan jelas."),
    id("Tidak.", "/ˈti.daʔ/", "아니요.", "No.", "No.", "A safe answer. Keep the final glottal stop crisp.", "안전한 대답이에요. 마지막 성문 폐쇄음을 또렷하게 발음하세요.", "Una respuesta segura. Mantén el golpe de glotis final nítido.", "Jawaban yang aman. Jaga hentian glotal di akhir tetap jelas."),
    id("Tidak apa-apa.", "/ˈti.daʔ ˈa.pa ˈa.pa/", "괜찮아요.", "It's okay.", "Está bien.", "A gentle 'it's okay' you can use often.", "자주 쓸 수 있는 부드러운 '괜찮아요'예요.", "Un suave 'está bien' que puedes usar a menudo.", "Ucapan 'tidak apa-apa' yang lembut dan sering bisa dipakai."),
    id("Tolong bicara pelan-pelan.", "/ˈto.loŋ biˈtʃa.ra ˈpə.lan ˈpə.lan/", "천천히 말해 주세요.", "Please speak slowly.", "Habla despacio, por favor.", "A survival sentence. pelan-pelan = slowly.", "생존 문장이에요. pelan-pelan = 천천히.", "Una frase de supervivencia. pelan-pelan = despacio.", "Kalimat bertahan hidup. pelan-pelan berarti perlahan."),
    id("Saya pemula.", "/ˈsa.ja pəˈmu.la/", "저는 초보자예요.", "I am a beginner.", "Soy principiante.", "Say it without apology. It helps people help you.", "사과하지 말고 말하세요. 사람들이 당신을 돕기 쉬워져요.", "Dilo sin disculparte. Ayuda a que los demás te ayuden.", "Ucapkan tanpa minta maaf. Itu memudahkan orang membantumu."),
    id("Apakah kamu bisa bahasa Inggris?", "/aˈpa.kah ˈka.mu ˈbi.sa baˈha.sa ˈiŋ.gris/", "영어 할 줄 아세요?", "Do you speak English?", "¿Hablas inglés?", "Useful when you need a bridge language.", "다리 역할을 할 언어가 필요할 때 유용해요.", "Útil cuando necesitas un idioma puente.", "Berguna saat kamu butuh bahasa penghubung."),
    id("Sampai jumpa.", "/ˈsam.pai ˈdʒum.pa/", "안녕히 가세요.", "Goodbye.", "Adiós.", "A warm goodbye: 'see you again'.", "따뜻한 작별 인사예요: '또 만나요'.", "Una despedida cálida: 'hasta la vista'.", "Salam perpisahan yang hangat: 'sampai jumpa lagi'."),
    id("Maaf.", "/ˈma.ʔaf/", "죄송합니다.", "Sorry.", "Lo siento.", "A repair word. Keep the glottal stop: ma-'af.", "대화 복구용 단어예요. 성문 폐쇄음을 살리세요: ma-'af.", "Una palabra para retomar. Mantén el golpe de glotis: ma-'af.", "Kata perbaikan. Jaga hentian glotal: ma-'af."),
    id("Di mana toilet?", "/di ˈma.na ˈtoi.let/", "화장실이 어디예요?", "Where is the bathroom?", "¿Dónde está el baño?", "A real travel question. Di mana = where.", "실제 여행 질문이에요. Di mana = 어디.", "Una pregunta de viaje real. Di mana = dónde.", "Pertanyaan perjalanan yang nyata. Di mana berarti di tempat apa."),
    id("Berapa harganya?", "/bəˈra.pa harˈga.ɲa/", "얼마예요?", "How much is it?", "¿Cuánto cuesta?", "A tiny money question you can use every day.", "매일 쓸 수 있는 아주 짧은 돈 관련 질문이에요.", "Una pregunta diminuta sobre dinero que puedes usar a diario.", "Pertanyaan kecil soal uang yang bisa kamu pakai setiap hari."),
    id("Tolong bantu saya.", "/ˈto.loŋ ˈban.tu ˈsa.ja/", "도와주세요.", "Please help me.", "Ayúdame, por favor.", "An emergency sentence. Slow and clear is enough.", "비상 문장이에요. 천천히 또박또박이면 충분해요.", "Una frase de emergencia. Despacio y claro es suficiente.", "Kalimat darurat. Pelan dan jelas sudah cukup."),
    id("Siapa nama kamu?", "/siˈa.pa ˈna.ma ˈka.mu/", "이름이 뭐예요?", "What is your name?", "¿Cómo te llamas?", "A real first conversation question.", "실제 첫 대화 질문이에요.", "Una pregunta real para iniciar una conversación.", "Pertanyaan percakapan pertama yang nyata."),
  ],
  // Modern Standard Arabic (MSA, BETA) starter set — Standard Arabic (fuṣḥā).
  // Shown with harakat; `ipa` carries a Latin romanization (see the pack note
  // above). word = MSA Arabic, meaning = Korean, meaningEn = English,
  // meaningEs = Spanish, meaningId = Indonesian gloss; masculine address forms
  // match the "Alex" placeholder learner. These starters feed every goal loop,
  // so the bridge_language / where / how_much / yes / no / help survival
  // families below resolve to exactly 7 daily-speaking exposures (one per goal).
  arabic: [
    { word: "نَعَم", ipa: "naʿam", meaning: "네.", meaningEn: "Yes.", meaningEs: "Sí.", meaningId: "Ya.", speechLang: "ar-EG", tip: "naʿam = yes in MSA, understood across the Arab world (in Egyptian dialect you'll hear aah).", tipKo: "naʿam = 표준 아랍어로 '네', 아랍 세계 어디서나 통해요 (이집트 구어에서는 aah이라고 해요).", tipEs: "naʿam = sí en árabe estándar, entendido en todo el mundo árabe (en el dialecto egipcio oirás aah).", tipId: "naʿam = ya dalam bahasa Arab baku, dipahami di seluruh dunia Arab (dalam dialek Mesir kamu akan dengar aah)." },
    { word: "لا", ipa: "lā", meaning: "아니요.", meaningEn: "No.", meaningEs: "No.", meaningId: "Tidak.", speechLang: "ar-EG", tip: "lā = no in MSA. One clear, open syllable.", tipKo: "lā = 표준 아랍어로 '아니요'. 분명하고 열린 한 음절이에요.", tipEs: "lā = no en árabe estándar. Una sílaba clara y abierta.", tipId: "lā = tidak dalam bahasa Arab baku. Satu suku kata yang jelas dan terbuka." },
    { word: "حَسَنًا", ipa: "ḥasanan", meaning: "괜찮아요.", meaningEn: "Okay / All good.", meaningEs: "Está bien.", meaningId: "Oke / Baik.", speechLang: "ar-EG", tip: "ḥasanan = okay/fine in MSA — a tiny all-purpose 'all good' (in Egyptian dialect you'll hear tamaam).", tipKo: "ḥasanan = 표준 아랍어로 '좋아요/괜찮아요' — 어디서나 쓰는 짧은 '다 좋아요' (이집트 구어에서는 tamaam이라고 해요).", tipEs: "ḥasanan = vale/bien en árabe estándar — un breve 'todo bien' para todo uso (en el dialecto egipcio oirás tamaam).", tipId: "ḥasanan = oke/baik dalam bahasa Arab baku — ucapan 'semua beres' serbaguna yang singkat (dalam dialek Mesir kamu akan dengar tamaam)." },
    { word: "مِن فَضْلِك", ipa: "min faḍlik", meaning: "부탁합니다.", meaningEn: "Please.", meaningEs: "Por favor.", meaningId: "Tolong / Silakan.", speechLang: "ar-EG", tip: "min faḍlik = please (to a man) in MSA. Softens any request.", tipKo: "min faḍlik = 표준 아랍어로 '부탁해요'(남성에게). 어떤 요청이든 부드럽게 해 줘요.", tipEs: "min faḍlik = por favor (a un hombre) en árabe estándar. Suaviza cualquier petición.", tipId: "min faḍlik = tolong (kepada laki-laki) dalam bahasa Arab baku. Membuat permintaan apa pun lebih halus." },
    { word: "هَلْ تَتَكَلَّم الإنْجِليزِيّة؟", ipa: "hal tatakallam al-injilīziyya?", meaning: "영어 할 줄 아세요?", meaningEn: "Do you speak English?", meaningEs: "¿Hablas inglés?", meaningId: "Apakah kamu bisa bahasa Inggris?", speechLang: "ar-EG", tip: "hal tatakallam = do you speak (to a man) in MSA. Useful when you need a bridge language.", tipKo: "hal tatakallam = 표준 아랍어로 '~할 줄 아세요?'(남성에게). 다리 역할을 할 언어가 필요할 때 유용해요.", tipEs: "hal tatakallam = ¿hablas? (a un hombre) en árabe estándar. Útil cuando necesitas un idioma puente.", tipId: "hal tatakallam = apakah kamu bisa berbicara (kepada laki-laki) dalam bahasa Arab baku. Berguna saat butuh bahasa penghubung." },
    { word: "أنا مُبْتَدِئ", ipa: "anā mubtadiʼ", meaning: "저는 초보자예요.", meaningEn: "I am a beginner.", meaningEs: "Soy principiante.", meaningId: "Saya pemula.", speechLang: "ar-EG", tip: "anā mubtadiʼ = I'm a beginner. Say it without apology — it helps people help you.", tipKo: "anā mubtadiʼ = 저는 초보자예요. 사과하지 말고 말하세요 — 사람들이 당신을 돕기 쉬워져요.", tipEs: "anā mubtadiʼ = soy principiante. Dilo sin disculparte — ayuda a que los demás te ayuden.", tipId: "anā mubtadiʼ = saya pemula. Ucapkan tanpa minta maaf — itu memudahkan orang membantumu." },
    { word: "أَيْنَ الحَمّام؟", ipa: "ayna l-ḥammām?", meaning: "화장실이 어디예요?", meaningEn: "Where is the bathroom?", meaningEs: "¿Dónde está el baño?", meaningId: "Di mana toilet?", speechLang: "ar-EG", tip: "ayna = where in MSA, understood across the Arab world. A real travel question.", tipKo: "ayna = 표준 아랍어로 '어디', 아랍 세계 어디서나 통해요. 실제 여행 질문이에요.", tipEs: "ayna = dónde en árabe estándar, entendido en todo el mundo árabe. Una pregunta de viaje real.", tipId: "ayna = di mana dalam bahasa Arab baku, dipahami di seluruh dunia Arab. Pertanyaan perjalanan yang nyata." },
    { word: "بِكَمْ هٰذَا؟", ipa: "bikam hādhā?", meaning: "얼마예요?", meaningEn: "How much is this?", meaningEs: "¿Cuánto cuesta esto?", meaningId: "Berapa harganya?", speechLang: "ar-EG", tip: "bikam = how much, hādhā = this, both MSA. A daily shopping question.", tipKo: "bikam = 얼마, hādhā = 이것, 둘 다 표준 아랍어예요. 일상 쇼핑 질문이에요.", tipEs: "bikam = cuánto, hādhā = esto, ambos en árabe estándar. Una pregunta de compras diaria.", tipId: "bikam = berapa, hādhā = ini, keduanya bahasa Arab baku. Pertanyaan belanja sehari-hari." },
    { word: "ساعِدْني، مِن فَضْلِك", ipa: "sāʿidnī, min faḍlik", meaning: "도와주세요.", meaningEn: "Please help me.", meaningEs: "Ayúdame, por favor.", meaningId: "Tolong bantu saya.", speechLang: "ar-EG", tip: "sāʿidnī = help me. Slow and clear is enough in an emergency.", tipKo: "sāʿidnī = 저를 도와주세요. 비상시에는 천천히 또박또박 말하면 충분해요.", tipEs: "sāʿidnī = ayúdame. En una emergencia basta con hablar despacio y claro.", tipId: "sāʿidnī = tolong saya. Saat darurat, bicara pelan dan jelas sudah cukup." },
    { word: "مَا اسْمُك؟", ipa: "mā smuk?", meaning: "이름이 뭐예요?", meaningEn: "What is your name?", meaningEs: "¿Cómo te llamas?", meaningId: "Siapa nama kamu?", speechLang: "ar-EG", tip: "mā = what in MSA, understood everywhere. Asking a man his name.", tipKo: "mā = 표준 아랍어로 '무엇', 어디서나 통해요. 남성에게 이름을 묻는 표현이에요.", tipEs: "mā = qué en árabe estándar, entendido en todas partes. Preguntar el nombre a un hombre.", tipId: "mā = apa dalam bahasa Arab baku, dipahami di mana saja. Menanyakan nama seorang laki-laki." },
    { word: "أنا مِن كوريا", ipa: "anā min Korea", meaning: "저는 한국에서 왔어요.", meaningEn: "I'm from Korea.", meaningEs: "Soy de Corea.", meaningId: "Saya dari Korea.", speechLang: "ar-EG", tip: "anā min = I'm from. Swap Korea for your own country.", tipKo: "anā min = 저는 ~에서 왔어요. Korea 대신 자신의 나라를 넣으세요.", tipEs: "anā min = soy de. Cambia Corea por tu propio país.", tipId: "anā min = saya dari. Ganti Korea dengan negaramu sendiri." },
    { word: "أَيْنَ المَحَطّة؟", ipa: "ayna l-maḥaṭṭa?", meaning: "역이 어디예요?", meaningEn: "Where is the station?", meaningEs: "¿Dónde está la estación?", meaningId: "Di mana stasiun?", speechLang: "ar-EG", tip: "maḥaṭṭa = station. Pair ayna with any place you need.", tipKo: "maḥaṭṭa = 역. ayna를 필요한 어떤 장소와도 짝지어 쓰세요.", tipEs: "maḥaṭṭa = estación. Combina ayna con cualquier lugar que necesites.", tipId: "maḥaṭṭa = stasiun. Pasangkan ayna dengan tempat apa pun yang kamu butuhkan." },
    { word: "ماء، مِن فَضْلِك", ipa: "māʼ, min faḍlik", meaning: "물 주세요.", meaningEn: "Water, please.", meaningEs: "Agua, por favor.", meaningId: "Air, tolong.", speechLang: "ar-EG", tip: "māʼ = water in MSA (in Egyptian dialect you'll hear mayya). A real café/restaurant request.", tipKo: "māʼ = 표준 아랍어로 '물' (이집트 구어에서는 mayya라고 해요). 카페나 식당에서 쓰는 실제 요청이에요.", tipEs: "māʼ = agua en árabe estándar (en el dialecto egipcio oirás mayya). Una petición real de café/restaurante.", tipId: "māʼ = air dalam bahasa Arab baku (dalam dialek Mesir kamu akan dengar mayya). Permintaan nyata di kafe/restoran." },
  ],
};

const DAILY_GOAL_BOOSTERS: Partial<Record<DailySpeakingLanguage, Partial<Record<LearningGoal, RawDailyPhrase[]>>>> = {
  korean: {
    travel: [
      ko("역 어디예요?", "/jʌk ʌ.di.je.jo/", "Where is the station?", "¿Dónde está la estación?", "A real street question. Let the pitch rise.", "실제 길거리 질문이에요. 음을 올리세요.", "Una pregunta real de calle. Deja que el tono suba.", "Pertanyaan jalanan yang nyata. Naikkan nadanya."),
      ko("표 한 장 주세요.", "/pʰjo han dʑaŋ dʑu.se.jo/", "One ticket, please.", "Un boleto, por favor.", "Useful at a counter. Keep 한 장 connected.", "창구에서 유용해요. 한 장을 이어서 발음하세요.", "Útil en una ventanilla. Mantén 한 장 conectado.", "Berguna di loket. Sambungkan 한 장."),
      ko("여기 세워 주세요.", "/jʌ.gi se.wʌ dʑu.se.jo/", "Please stop here.", "Pare aquí, por favor.", "Taxi survival. Say 여기 clearly.", "택시에서 쓰는 생존 표현이에요. 여기를 분명하게 발음하세요.", "Supervivencia en taxi. Pronuncia 여기 con claridad.", "Bertahan hidup di taksi. Ucapkan 여기 dengan jelas."),
      ko("사진 찍어 주세요.", "/sa.dʑin tɕi.gʌ dʑu.se.jo/", "Please take a photo.", "Tome una foto, por favor.", "A real tourist request.", "실제 관광객 요청이에요.", "Una petición real de turista.", "Permintaan turis yang nyata."),
      ko("예약했어요.", "/je.jak.hɛ.sʌ.jo/", "I have a reservation.", "Tengo una reserva.", "Hotel and restaurant sentence.", "호텔과 식당에서 쓰는 문장이에요.", "Frase para hoteles y restaurantes.", "Kalimat untuk hotel dan restoran."),
      ko("길을 잃었어요.", "/ki.ɾɯl i.ɾʌ.sʌ.jo/", "I am lost.", "Estoy perdido.", "Say it calmly if you need help.", "도움이 필요하면 차분하게 말하세요.", "Dilo con calma si necesitas ayuda.", "Ucapkan dengan tenang jika kamu butuh bantuan."),
    ],
    work: [
      ko("회의 시작해요.", "/hwe.i ɕi.dʑak.hɛ.jo/", "The meeting is starting.", "La reunión empieza.", "A practical workplace update.", "직장에서 쓰는 실용적인 상황 알림이에요.", "Un aviso práctico de oficina.", "Pemberitahuan praktis di tempat kerja."),
      ko("이메일 보낼게요.", "/i.me.il po.nel.ge.jo/", "I will send an email.", "Enviaré un correo.", "A real work promise.", "실제 업무 약속이에요.", "Una promesa de trabajo real.", "Janji kerja yang nyata."),
      ko("확인해 주세요.", "/hwa.gin.hɛ dʑu.se.jo/", "Please check it.", "Revísalo, por favor.", "Useful for documents and messages.", "서류와 메시지에 유용해요.", "Útil para documentos y mensajes.", "Berguna untuk dokumen dan pesan."),
      ko("질문 있어요.", "/tɕil.mun i.sʌ.jo/", "I have a question.", "Tengo una pregunta.", "Say it before you get stuck.", "막히기 전에 말하세요.", "Dilo antes de quedarte atascado.", "Ucapkan sebelum kamu tersendat."),
      ko("잠시만 기다려 주세요.", "/tɕam.ɕi.man ki.da.ɾjʌ dʑu.se.jo/", "Please wait a moment.", "Espere un momento, por favor.", "A polite pause at work.", "직장에서 정중하게 멈출 때 써요.", "Una pausa cortés en el trabajo.", "Jeda yang sopan di tempat kerja."),
      ko("오늘 가능해요.", "/o.nɯl ka.nɯŋ.hɛ.jo/", "I can do it today.", "Puedo hacerlo hoy.", "A simple availability sentence.", "간단한 가능 여부 문장이에요.", "Una frase simple de disponibilidad.", "Kalimat ketersediaan yang sederhana."),
    ],
    study: [
      ko("숙제 했어요.", "/suk.tɕe hɛ.sʌ.jo/", "I did the homework.", "Hice la tarea.", "A classroom sentence you will actually say.", "교실에서 실제로 말하게 될 문장이에요.", "Una frase de clase que dirás de verdad.", "Kalimat kelas yang benar-benar akan kamu ucapkan."),
      ko("천천히 읽어 주세요.", "/tɕʰʌn.tɕʰʌn.hi il.gʌ dʑu.se.jo/", "Please read slowly.", "Lee despacio, por favor.", "Useful during lessons.", "수업 중에 유용해요.", "Útil durante las clases.", "Berguna saat pelajaran."),
      ko("이 단어 무슨 뜻이에요?", "/i ta.nʌ mu.sɯn tɯ.ɕi.e.jo/", "What does this word mean?", "¿Qué significa esta palabra?", "A real learner question.", "실제 학습자 질문이에요.", "Una pregunta real de quien aprende.", "Pertanyaan pelajar yang nyata."),
      ko("다시 설명해 주세요.", "/ta.ɕi sʌl.mjʌŋ.hɛ dʑu.se.jo/", "Please explain again.", "Explícalo otra vez, por favor.", "Ask for another explanation.", "다시 설명해 달라고 하세요.", "Pide otra explicación.", "Minta penjelasan lagi."),
      ko("준비됐어요.", "/tɕun.bi.dwɛ.sʌ.jo/", "I am ready.", "Estoy listo.", "Short and useful before speaking.", "말하기 전에 짧고 유용한 문장이에요.", "Corta y útil antes de hablar.", "Singkat dan berguna sebelum berbicara."),
      ko("연습하고 싶어요.", "/jʌn.sɯp.ha.go ɕi.pʰʌ.jo/", "I want to practice.", "Quiero practicar.", "A direct learning sentence.", "직접적인 학습 문장이에요.", "Una frase de aprendizaje directa.", "Kalimat belajar yang langsung."),
    ],
    hobby: [
      ko("이 노래 좋아해요.", "/i no.ɾɛ tɕo.a.hɛ.jo/", "I like this song.", "Me gusta esta canción.", "A real fan sentence.", "실제 팬 문장이에요.", "Una frase real de fan.", "Kalimat penggemar yang nyata."),
      ko("이 영화 봤어요.", "/i jʌŋ.hwa bwa.sʌ.jo/", "I watched this movie.", "Vi esta película.", "Useful for shows and films.", "방송과 영화에 유용해요.", "Útil para series y películas.", "Berguna untuk acara dan film."),
      ko("같이 해요.", "/ka.tɕʰi hɛ.jo/", "Let's do it together.", "Hagámoslo juntos.", "Invite someone naturally.", "자연스럽게 누군가를 초대하세요.", "Invita a alguien de forma natural.", "Ajak seseorang secara alami."),
      ko("재미있어요.", "/tɕɛ.mi.i.sʌ.jo/", "It is fun.", "Es divertido.", "A tiny reaction sentence.", "아주 짧은 반응 문장이에요.", "Una frase de reacción diminuta.", "Kalimat reaksi yang mungil."),
      ko("추천해 주세요.", "/tɕʰu.tɕʰʌn.hɛ dʑu.se.jo/", "Please recommend something.", "Recomiéndame algo, por favor.", "Ask for a song, show, or place.", "노래, 방송, 장소를 추천해 달라고 하세요.", "Pide una canción, un programa o un lugar.", "Minta rekomendasi lagu, acara, atau tempat."),
      ko("어디서 볼 수 있어요?", "/ʌ.di.sʌ pol su i.sʌ.jo/", "Where can I watch it?", "¿Dónde puedo verlo?", "A real content question.", "실제 콘텐츠 질문이에요.", "Una pregunta real sobre contenido.", "Pertanyaan konten yang nyata."),
    ],
    relationship: [
      ko("잘 지냈어요?", "/tɕal tɕi.nɛ.sʌ.jo/", "Have you been well?", "¿Has estado bien?", "A warm check-in sentence.", "따뜻한 안부 문장이에요.", "Una cálida frase para saber cómo está alguien.", "Kalimat sapaan hangat untuk menanyakan kabar."),
      ko("같이 가요.", "/ka.tɕʰi ga.jo/", "Let's go together.", "Vamos juntos.", "A simple invitation.", "간단한 초대 표현이에요.", "Una invitación simple.", "Ajakan yang sederhana."),
      ko("보고 싶었어요.", "/po.go ɕi.pʰʌ.sʌ.jo/", "I missed you.", "Te extrañé.", "Say it softly and honestly.", "부드럽고 솔직하게 말하세요.", "Dilo con suavidad y honestidad.", "Ucapkan dengan lembut dan jujur."),
      ko("연락해 주세요.", "/jʌl.lak.hɛ dʑu.se.jo/", "Please contact me.", "Contáctame, por favor.", "Useful for keeping a connection.", "관계를 이어 가는 데 유용해요.", "Útil para mantener el contacto.", "Berguna untuk menjaga hubungan."),
      ko("정말 고마워요.", "/tɕʌŋ.mal ko.ma.wʌ.jo/", "Thank you so much.", "Muchas gracias.", "Warm gratitude.", "따뜻한 감사 표현이에요.", "Gratitud cálida.", "Ungkapan terima kasih yang hangat."),
      ko("오늘 즐거웠어요.", "/o.nɯl tɕɯl.gʌ.wʌ.sʌ.jo/", "I had fun today.", "Me divertí hoy.", "A real end-of-day sentence.", "하루를 마무리하는 실제 문장이에요.", "Una frase real para terminar el día.", "Kalimat nyata untuk menutup hari."),
    ],
    exam: [
      ko("답을 모르겠어요.", "/ta.bɯl mo.rɯ.ge.sʌ.jo/", "I do not know the answer.", "No sé la respuesta.", "An honest test sentence. Say it clearly, then repair.", "솔직한 시험 문장이에요. 분명하게 말한 뒤 고치세요.", "Una frase honesta de examen. Dila claramente y luego corrige.", "Kalimat ujian yang jujur. Ucapkan dengan jelas, lalu perbaiki."),
      ko("시간이 더 필요해요.", "/ɕi.ga.ni tʌ pi.rjo.hɛ.jo/", "I need more time.", "Necesito más tiempo.", "A real request when you are under pressure.", "압박 속에서 쓰는 실제 요청이에요.", "Una petición real cuando estás bajo presión.", "Permintaan nyata saat kamu tertekan."),
      ko("연습하고 싶어요.", "/jʌn.sɯp.ha.go ɕi.pʌ.jo/", "I want to practice.", "Quiero practicar.", "The app's philosophy in one sentence.", "앱의 철학을 한 문장으로 담았어요.", "La filosofía de la app en una frase.", "Filosofi aplikasi ini dalam satu kalimat."),
      ko("어디에 써야 해요?", "/ʌ.di.e s͈ʌ.ja hɛ.jo/", "Where should I write it?", "¿Dónde debo escribirlo?", "Useful before worksheets, forms, and exams.", "학습지, 양식, 시험 전에 유용해요.", "Útil antes de hojas de ejercicios, formularios y exámenes.", "Berguna sebelum lembar kerja, formulir, dan ujian."),
      ko("이 단어 무슨 뜻이에요?", "/i ta.nʌ mu.sɯn t͈ɯ.ɕi.e.jo/", "What does this word mean?", "¿Qué significa esta palabra?", "Ask about meaning in the target language.", "목표 언어로 뜻을 물어보세요.", "Pregunta el significado en el idioma que aprendes.", "Tanyakan maknanya dalam bahasa yang kamu pelajari."),
      ko("시험 끝났어요.", "/si.hʌm k͈ɯt.na.sʌ.jo/", "The exam is over.", "El examen terminó.", "A real after-test sentence. Let the last word relax.", "시험이 끝난 뒤 쓰는 실제 문장이에요. 마지막 단어를 편안하게 발음하세요.", "Una frase real para después del examen. Deja relajar la última palabra.", "Kalimat nyata setelah ujian. Biarkan kata terakhir terasa santai."),
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
  indonesian: {
    travel: [
      id("Di mana stasiun?", "/di ˈma.na staˈsi.un/", "역이 어디예요?", "Where is the station?", "¿Dónde está la estación?", "stasiun = station. A real street question."),
      id("Satu tiket, tolong.", "/ˈsa.tu ˈti.ket ˈto.loŋ/", "표 한 장 주세요.", "One ticket, please.", "Un boleto, por favor.", "tiket = ticket. Useful at a counter."),
      id("Berhenti di sini, tolong.", "/bərˈhən.ti di ˈsi.ni ˈto.loŋ/", "여기 세워 주세요.", "Please stop here.", "Pare aquí, por favor.", "Taxi survival. di sini = here."),
      id("Tolong fotokan saya.", "/ˈto.loŋ foˈto.kan ˈsa.ja/", "사진 찍어 주세요.", "Please take a photo of me.", "Tómame una foto, por favor.", "foto = photo. A real tourist request."),
      id("Saya punya reservasi.", "/ˈsa.ja ˈpu.ɲa re.serˈva.si/", "예약했어요.", "I have a reservation.", "Tengo una reserva.", "reservasi = reservation. Hotel and restaurant sentence."),
      id("Saya tersesat.", "/ˈsa.ja tərˈsə.sat/", "길을 잃었어요.", "I am lost.", "Estoy perdido.", "Say it calmly when you need help finding the way."),
    ],
    work: [
      id("Rapat akan mulai.", "/ˈra.pat ˈa.kan muˈlai/", "회의 시작해요.", "The meeting is starting.", "La reunión empieza.", "rapat = meeting. A practical workplace update."),
      id("Saya akan kirim email.", "/ˈsa.ja ˈa.kan ˈki.rim ˈi.mel/", "이메일 보낼게요.", "I will send an email.", "Enviaré un correo.", "akan = will. A real work promise."),
      id("Tolong periksa ini.", "/ˈto.loŋ pəˈrik.sa ˈi.ni/", "확인해 주세요.", "Please check this.", "Revísalo, por favor.", "periksa = check. Useful for documents."),
      id("Saya punya pertanyaan.", "/ˈsa.ja ˈpu.ɲa pər.taˈɲa.an/", "질문 있어요.", "I have a question.", "Tengo una pregunta.", "Say it before you get stuck."),
      id("Tolong tunggu sebentar.", "/ˈto.loŋ ˈtuŋ.gu səbənˈtar/", "잠시만 기다려 주세요.", "Please wait a moment.", "Espere un momento, por favor.", "sebentar = a moment. A polite pause at work."),
      id("Saya bisa hari ini.", "/ˈsa.ja ˈbi.sa ˈha.ri ˈi.ni/", "오늘 가능해요.", "I can do it today.", "Puedo hacerlo hoy.", "bisa = can. A simple availability sentence."),
    ],
    study: [
      id("Saya sudah kerjakan PR.", "/ˈsa.ja ˈsu.dah kərˈdʒa.kan pe ˈer/", "숙제 했어요.", "I did the homework.", "Hice la tarea.", "PR = homework. A classroom sentence you will say."),
      id("Tolong baca pelan-pelan.", "/ˈto.loŋ ˈba.tʃa ˈpə.lan ˈpə.lan/", "천천히 읽어 주세요.", "Please read slowly.", "Lee despacio, por favor.", "baca = read. Useful during lessons."),
      id("Apa arti kata ini?", "/ˈa.pa ˈar.ti ˈka.ta ˈi.ni/", "이 단어 무슨 뜻이에요?", "What does this word mean?", "¿Qué significa esta palabra?", "arti = meaning. A real learner question."),
      id("Tolong jelaskan lagi.", "/ˈto.loŋ dʒəˈlas.kan ˈla.gi/", "다시 설명해 주세요.", "Please explain again.", "Explícalo otra vez, por favor.", "jelaskan = explain. Ask for another explanation."),
      id("Saya sudah siap.", "/ˈsa.ja ˈsu.dah ˈsi.ap/", "준비됐어요.", "I am ready.", "Estoy listo.", "siap = ready. Short and useful before speaking."),
      id("Saya mau berlatih.", "/ˈsa.ja ˈmau bərˈla.tih/", "연습하고 싶어요.", "I want to practice.", "Quiero practicar.", "berlatih = practice. A direct learning sentence."),
    ],
    hobby: [
      id("Saya suka lagu ini.", "/ˈsa.ja ˈsu.ka ˈla.gu ˈi.ni/", "이 노래 좋아해요.", "I like this song.", "Me gusta esta canción.", "lagu = song. A real fan sentence."),
      id("Saya sudah nonton film ini.", "/ˈsa.ja ˈsu.dah ˈnon.ton ˈfilm ˈi.ni/", "이 영화 봤어요.", "I watched this movie.", "Vi esta película.", "nonton = watch. Useful for shows and films."),
      id("Mari kita lakukan bersama.", "/ˈma.ri ˈki.ta laˈku.kan bərˈsa.ma/", "같이 해요.", "Let's do it together.", "Hagámoslo juntos.", "bersama = together. Invite someone naturally."),
      id("Ini menyenangkan.", "/ˈi.ni mə.ɲəˈnaŋ.kan/", "재미있어요.", "This is fun.", "Es divertido.", "A tiny reaction sentence."),
      id("Tolong rekomendasikan sesuatu.", "/ˈto.loŋ re.ko.men.daˈsi.kan səsuˈa.tu/", "추천해 주세요.", "Please recommend something.", "Recomiéndame algo, por favor.", "Ask for a song, show, or place."),
      id("Di mana saya bisa menontonnya?", "/di ˈma.na ˈsa.ja ˈbi.sa mə.nonˈton.ɲa/", "어디서 볼 수 있어요?", "Where can I watch it?", "¿Dónde puedo verlo?", "A real content question."),
    ],
    relationship: [
      id("Apa kabar?", "/ˈa.pa ˈka.bar/", "잘 지냈어요?", "How are you?", "¿Cómo estás?", "A warm check-in. Literally 'what news?'."),
      id("Mari pergi bersama.", "/ˈma.ri ˈpər.gi bərˈsa.ma/", "같이 가요.", "Let's go together.", "Vamos juntos.", "pergi = go. A simple invitation."),
      id("Aku kangen kamu.", "/ˈa.ku ˈka.ŋən ˈka.mu/", "보고 싶었어요.", "I missed you.", "Te extrañé.", "kangen = miss. Say it softly and honestly."),
      id("Tolong hubungi saya.", "/ˈto.loŋ huˈbu.ŋi ˈsa.ja/", "연락해 주세요.", "Please contact me.", "Contáctame, por favor.", "hubungi = contact. Keep a connection alive."),
      id("Terima kasih banyak.", "/təˈri.ma ˈka.sih ˈba.ɲaʔ/", "정말 고마워요.", "Thank you very much.", "Muchas gracias.", "banyak = much. Warm gratitude."),
      id("Saya senang hari ini.", "/ˈsa.ja səˈnaŋ ˈha.ri ˈi.ni/", "오늘 즐거웠어요.", "I had fun today.", "Me divertí hoy.", "senang = happy. A real end-of-day sentence."),
    ],
    exam: [
      id("Saya tidak tahu jawabannya.", "/ˈsa.ja ˈti.daʔ ˈta.hu dʒaˈwa.ban.ɲa/", "답을 모르겠어요.", "I don't know the answer.", "No sé la respuesta.", "jawaban = answer. An honest test sentence."),
      id("Saya butuh waktu lagi.", "/ˈsa.ja ˈbu.tuh ˈwak.tu ˈla.gi/", "시간이 더 필요해요.", "I need more time.", "Necesito más tiempo.", "butuh = need. A practical request under pressure."),
      id("Saya mau berlatih.", "/ˈsa.ja ˈmau bərˈla.tih/", "연습하고 싶어요.", "I want to practice.", "Quiero practicar.", "berlatih = practice. The app's philosophy in one sentence."),
      id("Di mana saya harus menulis?", "/di ˈma.na ˈsa.ja ˈha.rus məˈnu.lis/", "어디에 써야 해요?", "Where should I write it?", "¿Dónde debo escribirlo?", "menulis = write. Useful before forms and exams."),
      id("Apa arti kata ini?", "/ˈa.pa ˈar.ti ˈka.ta ˈi.ni/", "이 단어 무슨 뜻이에요?", "What does this word mean?", "¿Qué significa esta palabra?", "Ask about meaning instead of guessing silently."),
      id("Ujian sudah selesai.", "/uˈdʒi.an ˈsu.dah səˈlə.sai/", "시험 끝났어요.", "The exam is over.", "El examen terminó.", "selesai = finished. A real after-test sentence."),
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
  indonesian: {
    greeting: ["Halo"],
    goodbye: ["Sampai jumpa."],
    thanks: ["Terima kasih."],
    sorry: ["Maaf."],
    dont_understand: ["Saya tidak mengerti."],
    repeat: ["Tolong ulangi."],
    slow_speech: ["Tolong bicara pelan-pelan."],
    bridge_language: ["Apakah kamu bisa bahasa Inggris?"],
    where: ["Di mana toilet?"],
    how_much: ["Berapa harganya?"],
    yes: ["Ya."],
    no: ["Tidak."],
    help: ["Tolong bantu saya."],
    name: ["Nama saya Alex."],
  },
  // Modern Standard Arabic (MSA, BETA), mirroring the Indonesian survival map. Each phrase
  // is an exact `word` from the Arabic DEFAULT pack or DAILY_SPEAKING_STARTERS
  // pack above, so getDailySpeakingSurvivalCoverage reports exactly 7 exposures
  // per family (one per goal) with 7 distinct goal context tips — the 7-10 lock.
  arabic: {
    greeting: ["أَهْلًا"],
    goodbye: ["مَعَ السَّلامَة"],
    thanks: ["شُكْرًا"],
    sorry: ["آسِف"],
    dont_understand: ["لا أَفْهَم"],
    repeat: ["مَرّة ثانِية، مِن فَضْلِك"],
    slow_speech: ["بِبُطْء، مِن فَضْلِك"],
    bridge_language: ["هَلْ تَتَكَلَّم الإنْجِليزِيّة؟"],
    where: ["أَيْنَ الحَمّام؟"],
    how_much: ["بِكَمْ هٰذَا؟"],
    yes: ["نَعَم"],
    no: ["لا"],
    help: ["ساعِدْني، مِن فَضْلِك"],
    name: ["اِسْمي أليكس"],
  },
};

const DAILY_SPEAKING_GOALS: LearningGoal[] = ["travel", "work", "study", "hobby", "relationship", "exam", "unknown"];

// Inner map is Partial because the reader-native axis is only ever ko/en/es/id
// (Arabic is a LEARNING TARGET, never a native UI language). A new "arabic"
// member of DailySpeakingLanguage therefore needs no reader-side tip here; all
// reads go through getGoalContextTip(...) which already falls back to English.
const GOAL_CONTEXT_TIPS: Record<LearningGoal, Partial<Record<DailySpeakingLanguage, string>>> = {
  travel: {
    english: "Travel context: use it with staff, drivers, shopkeepers, or strangers who can help.",
    korean: "여행 상황: 직원, 기사님, 가게 주인, 또는 도와줄 수 있는 사람에게 써요.",
    spanish: "Contexto de viaje: úsala con personal, conductores, vendedores o desconocidos que puedan ayudar.",
    indonesian: "Konteks perjalanan: pakai dengan petugas, sopir, penjual, atau orang asing yang bisa membantu.",
  },
  work: {
    english: "Work context: use it in a meeting, chat, email follow-up, or quick desk conversation.",
    korean: "업무 상황: 회의, 채팅, 이메일 후속 연락, 또는 짧은 대화에서 써요.",
    spanish: "Contexto de trabajo: úsala en una reunión, un chat, un correo de seguimiento o una charla rápida.",
    indonesian: "Konteks kerja: pakai saat rapat, chat, tindak lanjut email, atau obrolan singkat di meja.",
  },
  study: {
    english: "Study context: use it with a teacher, classmate, tutor, or study group.",
    korean: "공부 상황: 선생님, 같은 반 친구, 튜터, 또는 스터디 그룹에서 써요.",
    spanish: "Contexto de estudio: úsala con un profesor, un compañero, un tutor o un grupo de estudio.",
    indonesian: "Konteks belajar: pakai dengan guru, teman sekelas, tutor, atau kelompok belajar.",
  },
  hobby: {
    english: "Hobby context: use it while talking about shows, music, games, food, or things you like.",
    korean: "취미 상황: 드라마, 음악, 게임, 음식, 또는 좋아하는 것에 대해 이야기할 때 써요.",
    spanish: "Contexto de pasatiempos: úsala al hablar de series, música, juegos, comida o cosas que te gustan.",
    indonesian: "Konteks hobi: pakai saat membahas acara, musik, game, makanan, atau hal yang kamu suka.",
  },
  relationship: {
    english: "Relationship context: use it with a friend, date, host family, or someone you want to know better.",
    korean: "인간관계 상황: 친구, 데이트 상대, 홈스테이 가족, 또는 더 알고 싶은 사람에게 써요.",
    spanish: "Contexto de relaciones: úsala con un amigo, una cita, una familia anfitriona o alguien que quieras conocer mejor.",
    indonesian: "Konteks hubungan: pakai dengan teman, kencan, keluarga angkat, atau orang yang ingin kamu kenal lebih dekat.",
  },
  exam: {
    english: "Exam context: use it before, during, or after a test when you need to ask, repair, or respond.",
    korean: "시험 상황: 시험 전, 중, 후에 묻거나 고치거나 답해야 할 때 써요.",
    spanish: "Contexto de examen: úsala antes, durante o después de una prueba cuando necesites preguntar, corregir o responder.",
    indonesian: "Konteks ujian: pakai sebelum, saat, atau sesudah tes ketika kamu perlu bertanya, memperbaiki, atau menjawab.",
  },
  unknown: {
    english: "First-day context: use it whenever a real conversation starts, stops, or gets stuck.",
    korean: "첫날 상황: 실제 대화가 시작되거나 멈추거나 막힐 때 언제든 써요.",
    spanish: "Contexto del primer día: úsala cuando una conversación real empiece, se detenga o se trabe.",
    indonesian: "Konteks hari pertama: pakai kapan pun percakapan nyata dimulai, berhenti, atau tersendat.",
  },
};

/**
 * Resolve a goal's context tip in the reader's native language. Falls back
 * through English so any future locale still gets a non-empty string.
 */
export function getGoalContextTip(
  goal: LearningGoal | null | undefined,
  nativeLang: DailySpeakingLanguage,
): string | undefined {
  if (!goal) return undefined;
  const tips = GOAL_CONTEXT_TIPS[goal];
  if (!tips) return undefined;
  return tips[nativeLang] ?? tips.english;
}

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
    tipKo: raw.tipKo,
    tipEs: raw.tipEs,
    tipId: raw.tipId,
    meanings,
    practiceContext,
    // English by default; consumers that know the reader's native language
    // re-resolve via getGoalContextTip(practiceContext, nativeLang).
    contextTip: practiceContext ? GOAL_CONTEXT_TIPS[practiceContext].english : undefined,
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

/**
 * Beginner-FIRST serving order for the home "first sentence" mission.
 *
 * `getDailySpeakingSentenceLoop` keeps goal phrases at index 0 (the verify-lock
 * asserts that, e.g. exam → "When is the exam?" at [0]). But a true day-0
 * beginner should meet SURVIVAL phrases (greetings, "I don't understand",
 * "Help") before goal-specific ones — that's what Day 1 of the course and Story
 * Ch.1 both honor. So for the *served* mission we reorder a copy:
 * survival/starter first, then goal/booster — same set, no duplicates, every
 * phrase still A1. The locked loop is untouched.
 */
export function getBeginnerOrderedSpeakingLoop(
  lang: DailySpeakingLanguage,
  goal: LearningGoal | null
): DailySpeakingPhrase[] {
  const practiceContext = goal ?? "unknown";
  const survival = (DAILY_SPEAKING_PACKS[lang]?.default ?? []).map((p) => toDailyPhrase(lang, p, practiceContext));
  const starters = (DAILY_SPEAKING_STARTERS[lang] ?? []).map((p) => toDailyPhrase(lang, p, practiceContext));
  const goalSentences = goal ? getDailySpeakingPhrasePack(lang, goal) : [];
  const goalBoosters = goal ? (DAILY_GOAL_BOOSTERS[lang]?.[goal] ?? []) : [];
  const boosters = goalBoosters.map((p) => toDailyPhrase(lang, p, practiceContext));
  const seen = new Set<string>();
  const out: DailySpeakingPhrase[] = [];
  // Survival + starter FIRST (the day-0 priority), then goal-personalized.
  for (const phrase of [...survival, ...starters, ...goalSentences, ...boosters]) {
    if (seen.has(phrase.phrase)) continue;
    seen.add(phrase.phrase);
    out.push(phrase);
  }
  return out;
}

/**
 * The phrase to serve for the home/first speaking mission, progressing
 * day-to-day instead of resetting to index 0 each calendar day.
 *
 * `dayOffset` = how many distinct days the learner has already spoken (derived
 * from speakingProgress.history keys). Combined with the in-session
 * `spokenCount`, the entry point advances each day so a returning learner meets
 * NEW survival phrases rather than re-opening with the same greeting forever.
 * Uses the beginner-ordered serving loop (survival first).
 */
export function getProgressiveMissionPhrase(
  lang: DailySpeakingLanguage,
  goal: LearningGoal | null,
  spokenCount: number,
  dayOffset: number
): DailySpeakingPhrase | null {
  const loop = getBeginnerOrderedSpeakingLoop(lang, goal);
  if (loop.length === 0) return null;
  const idx = Math.max(0, dayOffset) * SPEAKING_DAILY_GOAL + Math.max(0, spokenCount);
  return loop[idx % loop.length];
}
