/**
 * Day 1-2 v2 Partial (A1 Unit 1: Greetings & Self-Introduction)
 * UPGRADED: Pimsleur Anticipation, Chunking, TBL missions, SM-2 review
 */
import type { Tri } from "../../lib/dailyCourseData";
import type {
  DayLessonData,
  MissionTalkLangData,
  ReviewQuestion,
  LearningLangKey,
  GrammarExplanation,
} from "../../lib/lessonContent";

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 + STEP 2 (LESSON_CONTENT)
// ═══════════════════════════════════════════════════════════════════════════════

export const LESSON_CONTENT_V2_D1_2: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 1: Meeting & Greeting + Survival Basics ───────────────
  day_1: {
    english: {
      step1Sentences: [
        { text: "Hello, my name is Rudy.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, recallRound: false },
        { text: "Nice to meet you.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." }, recallRound: false },
        { text: "Where are you from?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" }, recallRound: false },
        { text: "Thank you.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." }, recallRound: false },
        { text: "Sorry, I don't understand.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, recallRound: false },
        { text: "Hello, my name is Rudy. Nice to meet you!", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다!", en: "Hello, my name is Rudy. Nice to meet you!", es: "Hola, me llamo Rudy. ¡Mucho gusto!" }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "영어로 자기소개할 때 'My name is ___'이라고 해요. 좀 더 가볍게는 'I'm ___'이라고도 해요. 차이를 알려줄게요: 'My name is'는 처음 만나는 격식 있는 자리에서 쓰고, 'I'm'은 친구끼리나 편한 상황에서 써요. 둘 다 '나는 ___이에요'라는 뜻이지만 느낌이 달라요! 못 알아들었을 때는 'Sorry, I don't understand'라고 하면 되고, 위급할 때는 'Help!'만 기억하세요!",
            en: "When introducing yourself, say 'My name is ___' or the shorter 'I'm ___'. Here's the difference: 'My name is' feels more formal — perfect for a first meeting at an office or event. 'I'm' is casual and relaxed — great for parties or coffee shops. Both mean the same thing, just different vibes! If something goes over your head, say 'Sorry, I don't understand'.",
            es: "Para presentarte en inglés, di 'My name is ___' o simplemente 'I'm ___'. La diferencia: 'My name is' es más formal — perfecto para una primera reunión. 'I'm' es casual y relajado — ideal para fiestas. Ambos significan lo mismo, solo cambia el tono. Si no entiendes algo, di 'Sorry, I don't understand'.",
          },
          examples: {
            ko: "My name is Rudy. (제 이름은 루디예요. — 격식체)\nI'm Rudy. (저는 루디예요. — 캐주얼)\nSorry, I don't understand. (죄송해요, 이해를 못 했어요.)",
            en: "My name is Rudy. (Formal — good for interviews, meetings.)\nI'm Rudy. (Casual — good for parties, everyday chat.)\nSorry, I don't understand. (Use this anytime you're lost!)",
            es: "My name is Rudy. (Formal — para entrevistas, reuniones.)\nI'm Rudy. (Casual — para fiestas, charlas.)\nSorry, I don't understand. (Úsalo cuando no entiendas.)",
          },
          mistakes: {
            ko: "❌ My name is am Rudy.\n✅ My name is Rudy. (is랑 am 둘 다 쓰면 안 돼요!)\n❌ I no understand.\n✅ I don't understand. (영어는 'don't'로 부정해요, 'no'만 쓰면 안 돼요!)",
            en: "❌ My name is am Rudy.\n✅ My name is Rudy. (Don't double up 'is' and 'am'!)\n❌ I no understand.\n✅ I don't understand. (Use 'don't' — not just 'no'.)",
            es: "❌ My name is am Rudy.\n✅ My name is Rudy. (No uses 'is' y 'am' juntos.)\n❌ I no understand.\n✅ I don't understand. (Usa 'don't', no solo 'no'.)",
          },
          rudyTip: {
            ko: "처음 만나는 사람한테 'Hello, my name is ___'만 기억해도 절반은 성공이야! 나머지는 웃으면서 해결되거든 ^^",
            en: "Just remember 'Hello, my name is ___' and you're halfway there! A smile does the rest of the talking.",
            es: "Solo recuerda 'Hello, my name is ___' y ya tienes la mitad hecha. Una sonrisa hace el resto.",
          },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "My name ___ Rudy.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "Nice to ___ you.", answer: "meet", options: ["meet", "see", "know"], fullSentence: "Nice to meet you.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
          { type: "select", promptWithBlank: "Sorry, I don't ___.", answer: "understand", options: ["understand", "know", "speak"], fullSentence: "Sorry, I don't understand.", fullSentenceMeaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
          { type: "input", promptWithBlank: "___ you.", answer: "Thank", fullSentence: "Thank you.", fullSentenceMeaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." } },
          { type: "listening", audioText: "Hello, my name is Rudy.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Hello, my name is Rudy.", "Nice to meet you.", "Where are you from?", "Thank you."], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Hola, me llamo Rudy.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, recallRound: false },
        { text: "Mucho gusto.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." }, recallRound: false },
        { text: "¿De dónde eres?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" }, recallRound: false },
        { text: "Gracias.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." }, recallRound: false },
        { text: "Lo siento, no entiendo.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, recallRound: false },
        { text: "Hola, me llamo Rudy. ¡Mucho gusto!", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다!", en: "Hello, my name is Rudy. Nice to meet you!", es: "Hola, me llamo Rudy. ¡Mucho gusto!" }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "스페인어로 자기소개할 때 'Me llamo ___'라고 해요. 'llamo'는 '부르다'에서 온 말이라, 직역하면 '나를 ___라고 불러요'가 돼요. 비슷한 표현으로 'Soy ___'(나는 ___이에요)도 있는데, 'Me llamo'가 이름을 말할 때 더 자연스러워요. 처음 만나면 'Mucho gusto'(반갑습니다), 못 알아들으면 'No entiendo'라고 하세요!",
            en: "To introduce yourself in Spanish, say 'Me llamo ___' which literally means 'I call myself ___'. You might also hear 'Soy ___' (I am ___), but 'Me llamo' is more natural for giving your name. When meeting someone, say 'Mucho gusto' (pleased to meet you). If you're lost in conversation, 'No entiendo' is your lifeline.",
            es: "Para presentarte, di 'Me llamo ___', que literalmente significa 'me llamo a mí mismo ___'. También puedes decir 'Soy ___' (Soy ___), pero 'Me llamo' es más natural para dar tu nombre. Al conocer a alguien, di 'Mucho gusto'. Si no entiendes algo, 'No entiendo' te salva.",
          },
          examples: {
            ko: "Me llamo Rudy. (제 이름은 루디예요. — 가장 자연스러운 표현)\nSoy Rudy. (저는 루디예요. — 짧고 간단한 표현)\nNo entiendo. (이해를 못 했어요.)",
            en: "Me llamo Rudy. (My name is Rudy — most natural for names.)\nSoy Rudy. (I'm Rudy — shorter, but less common for introductions.)\nMucho gusto. (Nice to meet you — say it right after introducing yourself!)",
            es: "Me llamo Rudy. (La forma más natural de presentarte.)\nSoy Rudy. (Más corto, pero menos común para nombres.)\nMucho gusto. (Dilo justo después de presentarte.)",
          },
          mistakes: {
            ko: "❌ Mi llamo Rudy.\n✅ Me llamo Rudy. ('Mi'는 '나의'라는 뜻이에요. 여기서는 'Me'를 써야 해요!)\n❌ Mucho gusto a ti.\n✅ Mucho gusto. (그냥 이 두 단어면 충분해요!)",
            en: "❌ Mi llamo Rudy.\n✅ Me llamo Rudy. ('Mi' means 'my' — you need 'Me' here!)\n❌ No entendo.\n✅ No entiendo. (Watch that 'ie' — it's entIEndo, not entEndo.)",
            es: "❌ Mi llamo Rudy.\n✅ Me llamo Rudy. ('Mi' es posesivo — aquí necesitas 'Me'.)\n❌ No entendo.\n✅ No entiendo. (Cuidado con la 'ie' — es entIEndo.)",
          },
          rudyTip: {
            ko: "'Me llamo'만 외워두면 스페인어권 어디서든 자기소개 가능! 발음은 '메 야모'에 가까워요~",
            en: "Fun fact: 'Me llamo' literally means 'I call myself.' Nail this phrase and you can introduce yourself anywhere in the Spanish-speaking world!",
            es: "Dato curioso: 'Me llamo' es reflexivo. Domina esta frase y podrás presentarte en cualquier lugar hispanohablante.",
          },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Me ___ Rudy.", answer: "llamo", options: ["llamo", "llamas", "llaman"], fullSentence: "Me llamo Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "Mucho ___.", answer: "gusto", options: ["gusto", "bueno", "bien"], fullSentence: "Mucho gusto.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
          { type: "select", promptWithBlank: "Lo siento, no ___.", answer: "entiendo", options: ["entiendo", "hablo", "sé"], fullSentence: "Lo siento, no entiendo.", fullSentenceMeaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
          { type: "input", promptWithBlank: "___.", answer: "Gracias", fullSentence: "Gracias.", fullSentenceMeaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." } },
          { type: "listening", audioText: "Hola, me llamo Rudy.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Hola, me llamo Rudy.", "Mucho gusto.", "¿De dónde eres?", "Gracias."], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "안녕하세요, 제 이름은 루디예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, recallRound: false },
        { text: "만나서 반갑습니다.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." }, recallRound: false },
        { text: "어디에서 오셨어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" }, recallRound: false },
        { text: "감사합니다.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." }, recallRound: false },
        { text: "죄송해요, 이해를 못 했어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, recallRound: false },
        { text: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다!", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다!", en: "Hello, my name is Rudy. Nice to meet you!", es: "Hola, me llamo Rudy. ¡Mucho gusto!" }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "'제 이름은 ___예요'는 격식 있는 자기소개 표현이에요. 편하게는 '저는 ___예요'라고도 해요. 차이를 알려줄게요: '제 이름은'은 공식적인 자리에서, '저는'은 편한 자리에서 써요. 이름 끝에 받침이 있으면 '이에요', 없으면 '예요'를 써요. 예를 들어 '루디'는 받침이 없으니까 '루디예요', '민준'은 받침이 있으니까 '민준이에요'!",
            en: "To introduce yourself in Korean, say '제 이름은 ___예요' (My name is ___). There's also '저는 ___예요' (I'm ___) which is more casual. The tricky part: if the name ends in a consonant, use '이에요' instead of '예요'. For example, '루디' ends in a vowel so it's '루디예요', but '민준' ends in a consonant so it's '민준이에요'!",
            es: "Para presentarte en coreano, di '제 이름은 ___예요' (Mi nombre es ___). También puedes decir '저는 ___예요' (Soy ___), que es más casual. La parte difícil: si el nombre termina en consonante, usa '이에요' en vez de '예요'. Por ejemplo, '루디' termina en vocal = '루디예요', '민준' termina en consonante = '민준이에요'.",
          },
          examples: {
            ko: "제 이름은 루디예요. (격식 있는 자기소개)\n저는 루디예요. (편한 자기소개)\n만나서 반갑습니다. (처음 만났을 때 인사)",
            en: "제 이름은 루디예요. (My name is Rudy — formal.)\n저는 루디예요. (I'm Rudy — casual.)\n만나서 반갑습니다. (Nice to meet you.)",
            es: "제 이름은 루디예요. (Me llamo Rudy — formal.)\n저는 루디예요. (Soy Rudy — casual.)\n만나서 반갑습니다. (Mucho gusto.)",
          },
          mistakes: {
            ko: "❌ 제 이름은 루디이에요.\n✅ 제 이름은 루디예요. (루디는 받침이 없으니까 '예요'!)\n❌ 이해 못 했어요.\n✅ 이해를 못 했어요. ('를'을 빼먹지 마세요!)",
            en: "❌ 제 이름은 루디이에요.\n✅ 제 이름은 루디예요. (루디 ends in a vowel, so use 예요 not 이에요!)\n❌ 제 이름은 민준예요.\n✅ 제 이름은 민준이에요. (민준 ends in a consonant, so use 이에요!)",
            es: "❌ 제 이름은 루디이에요.\n✅ 제 이름은 루디예요. (루디 termina en vocal, usa 예요 no 이에요.)\n❌ 제 이름은 민준예요.\n✅ 제 이름은 민준이에요. (민준 termina en consonante, usa 이에요.)",
          },
          rudyTip: {
            ko: "이름 뒤에 '예요' 붙이면 끝! 받침 있으면 '이에요'인데, 처음엔 헷갈려도 괜찮아~ 자주 쓰다 보면 입에 붙어!",
            en: "Just add 예요 after your name and you're done! If your name ends in a consonant, switch to 이에요. Don't stress — Koreans will totally appreciate the effort!",
            es: "Solo agrega 예요 después de tu nombre. Si termina en consonante, cambia a 이에요. No te estreses, los coreanos aprecian el esfuerzo.",
          },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "제 이름___ 루디예요.", answer: "은", options: ["은", "이", "가"], fullSentence: "제 이름은 루디예요.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "만나서 ___습니다.", answer: "반갑", options: ["반갑", "고맙", "감사"], fullSentence: "만나서 반갑습니다.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
          { type: "select", promptWithBlank: "이해를 ___ 했어요.", answer: "못", options: ["못", "안", "잘"], fullSentence: "이해를 못 했어요.", fullSentenceMeaning: { ko: "이해를 못 했어요.", en: "I don't understand.", es: "No entiendo." } },
          { type: "input", promptWithBlank: "___합니다.", answer: "감사", fullSentence: "감사합니다.", fullSentenceMeaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." } },
          { type: "listening", audioText: "안녕하세요, 제 이름은 루디예요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["안녕하세요, 제 이름은 루디예요.", "만나서 반갑습니다.", "어디에서 오셨어요?", "감사합니다."], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 2: Where You're From + Yes/No + Repeat ────────────────
  day_2: {
    english: {
      step1Sentences: [
        { text: "I'm from Korea.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." }, recallRound: false },
        { text: "I live in Seoul.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." }, recallRound: false },
        { text: "What's your city like?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "도시가 어때요?", en: "What's your city like?", es: "¿Cómo es tu ciudad?" }, recallRound: false },
        { text: "Yes, I understand.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "네, 이해했어요.", en: "Yes, I understand.", es: "Sí, entiendo." }, recallRound: false },
        { text: "Can you say that again, please?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetir eso?" }, recallRound: false },
        { text: "Can you speak more slowly?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "천천히 말해 주세요.", en: "Can you speak more slowly?", es: "¿Puede hablar más despacio?" }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "어디에서 왔는지 말할 때 'I'm from ___'이라고 해요. 사는 곳은 'I live in ___'. 이 두 개가 비슷해 보이지만 뜻이 달라요! 'I'm from Korea'는 '한국 출신이에요'이고, 'I live in Seoul'은 '지금 서울에 살아요'예요. 못 알아들었으면 'Can you say that again?', 너무 빠르면 'Can you speak more slowly?'라고 하면 돼요!",
            en: "Say 'I'm from ___' to tell people where you're from originally, and 'I live in ___' for where you currently live. These look similar but mean different things! 'I'm from Korea' = that's your home country. 'I live in Seoul' = that's where you are now. Two lifesavers: 'Can you say that again?' and 'Can you speak more slowly?' — you'll use these in every real conversation.",
            es: "Di 'I'm from ___' para decir tu origen y 'I live in ___' para donde vives ahora. Parecen similares pero son diferentes. 'I'm from Korea' = tu país de origen. 'I live in Seoul' = donde estás ahora. Dos frases salvavidas: 'Can you say that again?' y 'Can you speak more slowly?' Las usarás en cada conversación real.",
          },
          examples: {
            ko: "I'm from Korea. (저는 한국 출신이에요. — 고향)\nI live in Seoul. (서울에 살고 있어요. — 현재 사는 곳)\nCan you say that again, please? (다시 한번 말해 주세요.)",
            en: "I'm from Korea. (That's where I was born or grew up.)\nI live in Seoul. (That's where I am now.)\nCan you speak more slowly? (Perfect for when someone talks too fast!)",
            es: "I'm from Korea. (Soy de Corea — mi origen.)\nI live in Seoul. (Vivo en Seúl — donde estoy ahora.)\nCan you say that again, please? (¿Puede repetir eso?)",
          },
          mistakes: {
            ko: "❌ I'm from in Korea.\n✅ I'm from Korea. (from 다음에 in 넣으면 안 돼요!)\n❌ I'm from Seoul. (= 서울 출신이에요)\n✅ I live in Seoul. (= 서울에 살고 있어요) — 뜻이 달라요!",
            en: "❌ I'm from in Korea.\n✅ I'm from Korea. (Don't add 'in' after 'from'!)\n❌ Where you from? (casual but grammatically incomplete)\n✅ Where are you from? (Don't forget 'are'!)",
            es: "❌ I'm from in Korea.\n✅ I'm from Korea. (No agregues 'in' después de 'from'.)\n❌ Where you from?\n✅ Where are you from? (No olvides el 'are'.)",
          },
          rudyTip: {
            ko: "'I'm from ___'은 고향, 'I live in ___'은 지금 사는 곳! 이 두 개 구분만 잘하면 대화가 확 자연스러워져~",
            en: "Quick trick: 'from' = where you're originally from. 'Live in' = where you are now. Two tiny phrases, but they unlock so many conversations!",
            es: "Truco rápido: 'from' = tu origen. 'Live in' = donde vives ahora. Dos frases pequeñas que abren muchas conversaciones.",
          },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "I'm ___ Korea.", answer: "from", options: ["from", "in", "at"], fullSentence: "I'm from Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "I ___ in Seoul.", answer: "live", options: ["live", "from", "go"], fullSentence: "I live in Seoul.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
          { type: "select", promptWithBlank: "Can you say that ___, please?", answer: "again", options: ["again", "more", "once"], fullSentence: "Can you say that again, please?", fullSentenceMeaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetir eso?" } },
          { type: "input", promptWithBlank: "I'm ___ Korea.", answer: "from", fullSentence: "I'm from Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "listening", audioText: "Can you speak more slowly?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Can you speak more slowly?", "Can you say that again, please?", "I'm from Korea.", "Yes, I understand."], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Soy de Corea.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." }, recallRound: false },
        { text: "Vivo en Seúl.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." }, recallRound: false },
        { text: "¿Cómo es tu ciudad?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "도시가 어때요?", en: "What's your city like?", es: "¿Cómo es tu ciudad?" }, recallRound: false },
        { text: "Sí, entiendo.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "네, 이해했어요.", en: "Yes, I understand.", es: "Sí, entiendo." }, recallRound: false },
        { text: "¿Puede repetir eso?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetir eso?" }, recallRound: false },
        { text: "¿Puede hablar más despacio?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "천천히 말해 주세요.", en: "Can you speak more slowly?", es: "¿Puede hablar más despacio?" }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "스페인어로 출신을 말할 때 'Soy de ___'라고 해요. 'Soy'는 '나는 ~이다', 'de'는 '~에서'라는 뜻이에요. 사는 곳은 'Vivo en ___'. 이 두 표현이 비슷해 보이지만 달라요! 'Soy de'는 출신(고향), 'Vivo en'은 현재 사는 곳! 못 알아들었으면 '¿Puede repetir eso?', 너무 빠르면 '¿Puede hablar más despacio?'라고 하세요!",
            en: "To say where you're from in Spanish, use 'Soy de ___' (I'm from ___). For where you live now, it's 'Vivo en ___'. These two look similar but they're different! 'Soy de' = origin, 'Vivo en' = current location. Two absolute lifesavers: '¿Puede repetir eso?' (Can you repeat that?) and '¿Puede hablar más despacio?' (Can you speak more slowly?).",
            es: "Para decir de dónde eres, usa 'Soy de ___'. Para dónde vives ahora, 'Vivo en ___'. Son parecidas pero diferentes: 'Soy de' = origen, 'Vivo en' = lugar actual. Dos frases salvavidas: '¿Puede repetir eso?' y '¿Puede hablar más despacio?' Las vas a necesitar en toda conversación real.",
          },
          examples: {
            ko: "Soy de Corea. (저는 한국 출신이에요. — 고향)\nVivo en Seúl. (서울에 살고 있어요. — 현재 위치)\n¿Puede hablar más despacio? (더 천천히 말해 주세요.)",
            en: "Soy de Corea. (I'm from Korea — my origin.)\nVivo en Seúl. (I live in Seoul — where I am now.)\n¿Puede repetir eso? (Can you say that again?)",
            es: "Soy de Corea. (Digo mi origen.)\nVivo en Seúl. (Digo dónde vivo ahora.)\n¿Puede hablar más despacio? (Pido que hablen más lento.)",
          },
          mistakes: {
            ko: "❌ Soy en Corea.\n✅ Soy de Corea. (출신은 'de'예요, 'en'이 아니에요!)\n❌ Vivo de Seúl.\n✅ Vivo en Seúl. (사는 곳은 'en'이에요!)",
            en: "❌ Soy en Corea.\n✅ Soy de Corea. (Origin uses 'de', not 'en'!)\n❌ Vivo de Seúl.\n✅ Vivo en Seúl. (Living somewhere uses 'en'!)",
            es: "❌ Soy en Corea.\n✅ Soy de Corea. (El origen lleva 'de', no 'en'.)\n❌ Vivo de Seúl.\n✅ Vivo en Seúl. (Donde vives lleva 'en'.)",
          },
          rudyTip: {
            ko: "'Soy de'는 고향, 'Vivo en'은 지금 사는 곳! 영어의 from/live in이랑 같은 느낌이야~ 쉽지?",
            en: "'Soy de' = where you're from. 'Vivo en' = where you live. Same idea as English 'from' vs 'live in' — easy swap!",
            es: "'Soy de' = tu origen. 'Vivo en' = donde vives. Es la misma lógica que en inglés, solo cambian las palabras.",
          },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Soy ___ Corea.", answer: "de", options: ["de", "en", "a"], fullSentence: "Soy de Corea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "___ en Seúl.", answer: "Vivo", options: ["Vivo", "Soy", "Estoy"], fullSentence: "Vivo en Seúl.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
          { type: "select", promptWithBlank: "¿Puede ___ eso?", answer: "repetir", options: ["repetir", "decir", "hablar"], fullSentence: "¿Puede repetir eso?", fullSentenceMeaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again?", es: "¿Puede repetir eso?" } },
          { type: "input", promptWithBlank: "Soy ___ Corea.", answer: "de", fullSentence: "Soy de Corea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "listening", audioText: "¿Puede hablar más despacio?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Puede hablar más despacio?", "¿Puede repetir eso?", "Soy de Corea.", "Sí, entiendo."], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "한국에서 왔어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." }, recallRound: false },
        { text: "서울에 살고 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." }, recallRound: false },
        { text: "도시가 어때요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "도시가 어때요?", en: "What's your city like?", es: "¿Cómo es tu ciudad?" }, recallRound: false },
        { text: "네, 이해했어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "네, 이해했어요.", en: "Yes, I understand.", es: "Sí, entiendo." }, recallRound: false },
        { text: "다시 한번 말해 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetir eso?" }, recallRound: false },
        { text: "천천히 말해 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "천천히 말해 주세요.", en: "Can you speak more slowly?", es: "¿Puede hablar más despacio?" }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "어디에서 왔는지 말할 때 '저는 ___에서 왔어요'라고 해요. '에서'가 출발점을 나타내요. 사는 곳은 '___에 살고 있어요'로, '에'가 위치를 나타내요. 이 두 개가 비슷해 보이지만 달라요! '에서'는 '~로부터'(출신), '에'는 '~에서'(현재 위치)! 못 알아들었으면 '다시 한번 말해 주세요', 빠르면 '천천히 말해 주세요'라고 하면 돼요!",
            en: "To say where you're from in Korean, use '___에서 왔어요'. The key particle is 에서 (from a place — origin). For where you live, say '___에 살고 있어요' with 에 (at a place — current location). These particles look similar but mean different things! 에서 = from, 에 = at/in. Two must-know phrases: '다시 한번 말해 주세요' (Say that again) and '천천히 말해 주세요' (Speak more slowly).",
            es: "Para decir de dónde eres en coreano, usa '___에서 왔어요'. La partícula clave es 에서 (desde un lugar — origen). Para donde vives: '___에 살고 있어요' con 에 (en un lugar — ubicación actual). Estas partículas se parecen pero son diferentes: 에서 = desde, 에 = en. Dos frases indispensables: '다시 한번 말해 주세요' y '천천히 말해 주세요'.",
          },
          examples: {
            ko: "한국에서 왔어요. (한국 출신이에요 — '에서' = 출발점)\n서울에 살고 있어요. (서울에서 살아요 — '에' = 위치)\n다시 한번 말해 주세요. (못 알아들었을 때)",
            en: "한국에서 왔어요. (I'm from Korea — 에서 marks the origin.)\n서울에 살고 있어요. (I live in Seoul — 에 marks the location.)\n천천히 말해 주세요. (Please speak more slowly.)",
            es: "한국에서 왔어요. (Soy de Corea — 에서 marca el origen.)\n서울에 살고 있어요. (Vivo en Seúl — 에 marca la ubicación.)\n다시 한번 말해 주세요. (¿Puede repetir eso?)",
          },
          mistakes: {
            ko: "❌ 한국에 왔어요.\n✅ 한국에서 왔어요. (출신은 '에서'! '에'가 아니에요!)\n❌ 서울에서 살고 있어요. (틀린 건 아니지만)\n✅ 서울에 살고 있어요. (사는 곳은 보통 '에'를 써요)",
            en: "❌ 한국에 왔어요.\n✅ 한국에서 왔어요. (Use 에서 for 'from', not just 에!)\n❌ 서울에서 살아요.\n✅ 서울에 살고 있어요. (Use 에 for 'living at', not 에서.)",
            es: "❌ 한국에 왔어요.\n✅ 한국에서 왔어요. (Usa 에서 para 'desde', no solo 에.)\n❌ 서울에서 살아요.\n✅ 서울에 살고 있어요. (Usa 에 para 'vivir en', no 에서.)",
          },
          rudyTip: {
            ko: "'에서'는 출발점, '에'는 위치! 이 두 개만 구분하면 한국어 장소 표현 마스터야~",
            en: "Here's the trick: 에서 = from somewhere, 에 = at/in somewhere. Master these two tiny particles and you'll sound way more natural!",
            es: "El truco: 에서 = desde algún lugar, 에 = en algún lugar. Domina estas dos partículas y sonarás mucho más natural.",
          },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "한국___ 왔어요.", answer: "에서", options: ["에서", "에", "을"], fullSentence: "한국에서 왔어요.", fullSentenceMeaning: { ko: "한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "서울에 ___ 있어요.", answer: "살고", options: ["살고", "있고", "가고"], fullSentence: "서울에 살고 있어요.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
          { type: "select", promptWithBlank: "다시 한번 ___ 주세요.", answer: "말해", options: ["말해", "해", "가"], fullSentence: "다시 한번 말해 주세요.", fullSentenceMeaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetir eso?" } },
          { type: "input", promptWithBlank: "한국___ 왔어요.", answer: "에서", fullSentence: "한국에서 왔어요.", fullSentenceMeaning: { ko: "한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "listening", audioText: "천천히 말해 주세요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["천천히 말해 주세요.", "다시 한번 말해 주세요.", "한국에서 왔어요.", "네, 이해했어요."], correct: 0, audioOnly: true },
        ],
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: MISSION TALK (TBL + Pimsleur Anticipation)
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_CONTENT_V2_D1_2: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  // ─────────────── Day 1: Meeting a new contact at the museum entrance ───────
  day_1: {
    english: {
      situation: {
        ko: "루디 탐정이 런던 박물관 입구에서 새 연락책을 만납니다. 인사하고 자기소개를 해보세요!",
        en: "Detective Rudy meets a new contact at the London museum entrance. Greet and introduce yourself!",
        es: "El detective Rudy conoce a un nuevo contacto en la entrada del museo de Londres. ¡Saluda y preséntate!",
      },
      gptPrompt: `You are Rudy, a Victorian fox detective, meeting your new investigation partner at the entrance of the British Museum in London. Speak in simple A1-level English (British).

## Pre-Task Briefing
Before the conversation begins, tell the user:
"🎯 Today's mission: Meet your new partner at the museum! Try to use these 3 expressions:
1. Hello, my name is ___.
2. Nice to meet you.
3. Thank you.
Use all 3 to earn ⭐⭐⭐!"

## Anticipation Rule
After asking a question, WAIT 3 seconds before giving any hint. Let the user try first.

## Silence Handling
- If the user is silent for 5 seconds: gently suggest "You could say: Hello, my name is ___."
- If silent for 10 seconds: speak the suggestion aloud via TTS so they can repeat.
- If silent for 15 seconds: give the full answer and encourage them to try saying it.

## Conversation Flow
1. Greet the user warmly and introduce yourself as Rudy.
2. Ask the user's name.
3. Ask where they're from.
4. At some point, say something slightly unclear so they can practice "Sorry, I don't understand."
5. If they use that phrase, praise them naturally.
6. End by saying "Thank you! Nice to meet you!" to reinforce those expressions.

## Mission Success
- 3 target expressions used = ⭐⭐⭐ "Brilliant work, partner!"
- 2 target expressions used = ⭐⭐ "Good job! Almost got them all!"
- 1 target expression used = ⭐ "Nice start! Let's practise more tomorrow."

## Language Focus
After the conversation, briefly review: "Today we practised: greetings, self-introduction, and saying thank you. Well done!"

## Important
- Never say the user is "wrong." If they make a mistake, model the correct form naturally: "Ah, you mean: My name is ___. Great!"
- Keep ALL sentences very short (A1 level).
- Maximum 5-6 exchanges.`,
      speechLang: "en-GB",
      suggestedAnswers: [
        "Hello, my name is ___.",
        "Nice to meet you.",
        "Where are you from?",
        "Sorry, I don't understand.",
        "Thank you.",
      ],
    },
    spanish: {
      situation: {
        ko: "루디 탐정이 런던 박물관 입구에서 새 연락책을 만납니다. 인사하고 자기소개를 해보세요!",
        en: "Detective Rudy meets a new contact at the London museum entrance. Greet and introduce yourself!",
        es: "El detective Rudy conoce a un nuevo contacto en la entrada del museo. ¡Saluda y preséntate!",
      },
      gptPrompt: `You are Rudy, a Victorian fox detective, meeting your new investigation partner at the entrance of the British Museum in London. Speak in simple A1-level Spanish.

## Pre-Task Briefing
Before the conversation begins, tell the user:
"🎯 Misión de hoy: ¡Conoce a tu nuevo compañero en el museo! Intenta usar estas 3 expresiones:
1. Hola, me llamo ___.
2. Mucho gusto.
3. Gracias.
¡Usa las 3 para ganar ⭐⭐⭐!"

## Anticipation Rule
After asking a question, WAIT 3 seconds before giving any hint. Let the user try first.

## Silence Handling
- If the user is silent for 5 seconds: gently suggest "Podrías decir: Hola, me llamo ___."
- If silent for 10 seconds: speak the suggestion aloud via TTS so they can repeat.
- If silent for 15 seconds: give the full answer and encourage them to try saying it.

## Conversation Flow
1. Greet the user warmly and introduce yourself as Rudy.
2. Ask the user's name.
3. Ask where they're from.
4. At some point, say something slightly unclear so they can practice "Lo siento, no entiendo."
5. If they use that phrase, praise them naturally.
6. End by saying "¡Gracias! ¡Mucho gusto!" to reinforce those expressions.

## Mission Success
- 3 target expressions used = ⭐⭐⭐ "¡Trabajo brillante, compañero!"
- 2 target expressions used = ⭐⭐ "¡Buen trabajo! ¡Casi las tienes todas!"
- 1 target expression used = ⭐ "¡Buen comienzo! Practiquemos más mañana."

## Language Focus
After the conversation, briefly review: "Hoy practicamos: saludos, presentaciones y dar las gracias. ¡Bien hecho!"

## Important
- Never say the user is "wrong." If they make a mistake, model the correct form naturally: "Ah, quieres decir: Me llamo ___. ¡Muy bien!"
- Keep ALL sentences very short (A1 level).
- Maximum 5-6 exchanges.`,
      speechLang: "es-ES",
      suggestedAnswers: [
        "Hola, me llamo ___.",
        "Mucho gusto.",
        "¿De dónde eres?",
        "Lo siento, no entiendo.",
        "Gracias.",
      ],
    },
    korean: {
      situation: {
        ko: "루디 탐정이 런던 박물관 입구에서 새 연락책을 만납니다. 인사하고 자기소개를 해보세요!",
        en: "Detective Rudy meets a new contact at the London museum entrance. Greet and introduce yourself!",
        es: "El detective Rudy conoce a un nuevo contacto en la entrada del museo. ¡Saluda y preséntate!",
      },
      gptPrompt: `You are Rudy, a Victorian fox detective, meeting your new investigation partner at the entrance of the British Museum in London. Speak in simple A1-level Korean (존댓말 only).

## Pre-Task Briefing
Before the conversation begins, tell the user:
"🎯 오늘의 미션: 박물관에서 새 파트너를 만나세요! 이 3가지 표현을 사용해 보세요:
1. 안녕하세요, 제 이름은 ___예요.
2. 만나서 반갑습니다.
3. 감사합니다.
3가지 모두 사용하면 ⭐⭐⭐!"

## Anticipation Rule
After asking a question, WAIT 3 seconds before giving any hint. Let the user try first.

## Silence Handling
- If the user is silent for 5 seconds: gently suggest "이렇게 말해 보세요: 안녕하세요, 제 이름은 ___예요."
- If silent for 10 seconds: speak the suggestion aloud via TTS so they can repeat.
- If silent for 15 seconds: give the full answer and encourage them to try saying it.

## Conversation Flow
1. Greet the user warmly and introduce yourself as 루디.
2. Ask the user's name.
3. Ask where they're from.
4. At some point, say something slightly unclear so they can practice "죄송해요, 이해를 못 했어요."
5. If they use that phrase, praise them naturally.
6. End by saying "감사합니다! 만나서 반갑습니다!" to reinforce those expressions.

## Mission Success
- 3 target expressions used = ⭐⭐⭐ "훌륭해요, 파트너!"
- 2 target expressions used = ⭐⭐ "잘 했어요! 거의 다 했어요!"
- 1 target expression used = ⭐ "좋은 시작이에요! 내일 더 연습해요."

## Language Focus
After the conversation, briefly review: "오늘 연습한 것: 인사, 자기소개, 감사 표현. 잘 했어요!"

## Important
- Never say the user is "wrong." If they make a mistake, model the correct form naturally: "아, 이렇게 말하면 돼요: 제 이름은 ___예요. 잘 했어요!"
- Keep ALL sentences very short (A1 level).
- Always use 존댓말.
- Maximum 5-6 exchanges.`,
      speechLang: "ko-KR",
      suggestedAnswers: [
        "안녕하세요, 제 이름은 ___예요.",
        "만나서 반갑습니다.",
        "어디에서 오셨어요?",
        "죄송해요, 이해를 못 했어요.",
        "감사합니다.",
      ],
    },
  },

  // ─────────────── Day 2: Investigating backgrounds — asking where they're from
  day_2: {
    english: {
      situation: {
        ko: "루디 탐정이 박물관에서 목격자의 출신을 조사하고 있습니다. 어디에서 왔는지, 어디에 사는지 물어보세요!",
        en: "Detective Rudy is investigating a witness's background at the museum. Ask where they're from and where they live!",
        es: "El detective Rudy investiga el origen de un testigo en el museo. ¡Pregunta de dónde es y dónde vive!",
      },
      gptPrompt: `You are Rudy, a Victorian fox detective, questioning a friendly witness at the British Museum in London about their background. Speak in simple A1-level English (British).

## Pre-Task Briefing
Before the conversation begins, tell the user:
"🎯 Today's mission: Investigate the witness! Try to use these 3 expressions:
1. I'm from ___.
2. I live in ___.
3. Can you say that again, please?
Use all 3 to earn ⭐⭐⭐!"

## Anticipation Rule
After asking a question, WAIT 3 seconds before giving any hint. Let the user try first.

## Silence Handling
- If the user is silent for 5 seconds: gently suggest "You could say: I'm from ___."
- If silent for 10 seconds: speak the suggestion aloud via TTS so they can repeat.
- If silent for 15 seconds: give the full answer and encourage them to try saying it.

## Conversation Flow
1. Greet the user as your witness and ask where they're from.
2. Ask what their city is like.
3. Share that you're from London and ask if they live here too.
4. At one point, speak slightly fast so they can practice "Can you say that again, please?" or "Can you speak more slowly?"
5. If they use those phrases, slow down and repeat warmly.
6. End with "Yes, I understand. Thank you!" to reinforce those expressions.

## Mission Success
- 3 target expressions used = ⭐⭐⭐ "Brilliant detective work, partner!"
- 2 target expressions used = ⭐⭐ "Good investigation! Almost there!"
- 1 target expression used = ⭐ "Nice start! Tomorrow we'll dig deeper."

## Language Focus
After the conversation, briefly review: "Today we practised: talking about where you're from and where you live, and asking people to repeat or slow down. Excellent!"

## Important
- Never say the user is "wrong." Model the correct form naturally: "Ah, you mean: I'm from ___. Exactly right!"
- Keep ALL sentences very short (A1 level).
- Maximum 5-6 exchanges.`,
      speechLang: "en-GB",
      suggestedAnswers: [
        "I'm from Korea.",
        "I live in Seoul.",
        "Yes, I understand.",
        "Can you say that again, please?",
        "Can you speak more slowly?",
      ],
    },
    spanish: {
      situation: {
        ko: "루디 탐정이 박물관에서 목격자의 출신을 조사하고 있습니다. 어디에서 왔는지, 어디에 사는지 물어보세요!",
        en: "Detective Rudy is investigating a witness's background at the museum. Ask where they're from and where they live!",
        es: "El detective Rudy investiga el origen de un testigo en el museo. ¡Pregunta de dónde es y dónde vive!",
      },
      gptPrompt: `You are Rudy, a Victorian fox detective, questioning a friendly witness at the British Museum in London about their background. Speak in simple A1-level Spanish.

## Pre-Task Briefing
Before the conversation begins, tell the user:
"🎯 Misión de hoy: ¡Investiga al testigo! Intenta usar estas 3 expresiones:
1. Soy de ___.
2. Vivo en ___.
3. ¿Puede repetir eso?
¡Usa las 3 para ganar ⭐⭐⭐!"

## Anticipation Rule
After asking a question, WAIT 3 seconds before giving any hint. Let the user try first.

## Silence Handling
- If the user is silent for 5 seconds: gently suggest "Podrías decir: Soy de ___."
- If silent for 10 seconds: speak the suggestion aloud via TTS so they can repeat.
- If silent for 15 seconds: give the full answer and encourage them to try saying it.

## Conversation Flow
1. Greet the user as your witness and ask where they're from.
2. Ask what their city is like.
3. Share that you're from London and ask if they live here too.
4. At one point, speak slightly fast so they can practice "¿Puede repetir eso?" or "¿Puede hablar más despacio?"
5. If they use those phrases, slow down and repeat warmly.
6. End with "Sí, entiendo. ¡Gracias!" to reinforce those expressions.

## Mission Success
- 3 target expressions used = ⭐⭐⭐ "¡Trabajo de detective brillante, compañero!"
- 2 target expressions used = ⭐⭐ "¡Buena investigación! ¡Casi lo tienes!"
- 1 target expression used = ⭐ "¡Buen comienzo! Mañana investigaremos más."

## Language Focus
After the conversation, briefly review: "Hoy practicamos: hablar de dónde eres y dónde vives, y pedir que repitan o hablen más lento. ¡Excelente!"

## Important
- Never say the user is "wrong." Model the correct form naturally: "Ah, quieres decir: Soy de ___. ¡Exacto!"
- Keep ALL sentences very short (A1 level).
- Maximum 5-6 exchanges.`,
      speechLang: "es-ES",
      suggestedAnswers: [
        "Soy de Corea.",
        "Vivo en Seúl.",
        "Sí, entiendo.",
        "¿Puede repetir eso?",
        "¿Puede hablar más despacio?",
      ],
    },
    korean: {
      situation: {
        ko: "루디 탐정이 박물관에서 목격자의 출신을 조사하고 있습니다. 어디에서 왔는지, 어디에 사는지 물어보세요!",
        en: "Detective Rudy is investigating a witness's background at the museum. Ask where they're from and where they live!",
        es: "El detective Rudy investiga el origen de un testigo en el museo. ¡Pregunta de dónde es y dónde vive!",
      },
      gptPrompt: `You are Rudy, a Victorian fox detective, questioning a friendly witness at the British Museum in London about their background. Speak in simple A1-level Korean (존댓말 only).

## Pre-Task Briefing
Before the conversation begins, tell the user:
"🎯 오늘의 미션: 목격자를 조사하세요! 이 3가지 표현을 사용해 보세요:
1. ___에서 왔어요.
2. ___에 살고 있어요.
3. 다시 한번 말해 주세요.
3가지 모두 사용하면 ⭐⭐⭐!"

## Anticipation Rule
After asking a question, WAIT 3 seconds before giving any hint. Let the user try first.

## Silence Handling
- If the user is silent for 5 seconds: gently suggest "이렇게 말해 보세요: 한국에서 왔어요."
- If silent for 10 seconds: speak the suggestion aloud via TTS so they can repeat.
- If silent for 15 seconds: give the full answer and encourage them to try saying it.

## Conversation Flow
1. Greet the user as your witness and ask where they're from.
2. Ask what their city is like.
3. Share that you're from London and ask if they live here too.
4. At one point, speak slightly fast so they can practice "다시 한번 말해 주세요" or "천천히 말해 주세요."
5. If they use those phrases, slow down and repeat warmly.
6. End with "네, 이해했어요. 감사합니다!" to reinforce those expressions.

## Mission Success
- 3 target expressions used = ⭐⭐⭐ "훌륭한 수사 실력이에요, 파트너!"
- 2 target expressions used = ⭐⭐ "좋은 조사였어요! 거의 다 했어요!"
- 1 target expression used = ⭐ "좋은 시작이에요! 내일 더 깊이 파 봐요."

## Language Focus
After the conversation, briefly review: "오늘 연습한 것: 출신과 사는 곳 이야기하기, 다시 말해달라고 요청하기. 잘 했어요!"

## Important
- Never say the user is "wrong." Model the correct form naturally: "아, 이렇게 말하면 돼요: 한국에서 왔어요. 맞아요!"
- Keep ALL sentences very short (A1 level).
- Always use 존댓말.
- Maximum 5-6 exchanges.`,
      speechLang: "ko-KR",
      suggestedAnswers: [
        "한국에서 왔어요.",
        "서울에 살고 있어요.",
        "네, 이해했어요.",
        "다시 한번 말해 주세요.",
        "천천히 말해 주세요.",
      ],
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: QUICK REVIEW (SM-2 spaced repetition)
// ═══════════════════════════════════════════════════════════════════════════════

export const REVIEW_CONTENT_V2_D1_2: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  // ─────────────── Day 1 Review (no yesterday review) ────────────────────────
  day_1: {
    english: [
      { type: "speak", sentence: "Hello, my name is Rudy.", speechLang: "en-GB", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: false },
      { type: "fill_blank", promptWithBlank: "Nice to ___ you.", answer: "meet", options: ["meet", "see", "know"], fullSentence: "Nice to meet you.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." }, isYesterdayReview: false },
      { type: "speak", sentence: "Sorry, I don't understand.", speechLang: "en-GB", meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: false },
      { type: "fill_blank", promptWithBlank: "Where are you ___?", answer: "from", options: ["from", "to", "at"], fullSentence: "Where are you from?", fullSentenceMeaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" }, isYesterdayReview: false },
      { type: "speak", sentence: "Thank you. Nice to meet you.", speechLang: "en-GB", meaning: { ko: "감사합니다. 만나서 반갑습니다.", en: "Thank you. Nice to meet you.", es: "Gracias. Mucho gusto." }, isYesterdayReview: false },
    ],
    spanish: [
      { type: "speak", sentence: "Hola, me llamo Rudy.", speechLang: "es-ES", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: false },
      { type: "fill_blank", promptWithBlank: "Mucho ___.", answer: "gusto", options: ["gusto", "bueno", "bien"], fullSentence: "Mucho gusto.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." }, isYesterdayReview: false },
      { type: "speak", sentence: "Lo siento, no entiendo.", speechLang: "es-ES", meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: false },
      { type: "fill_blank", promptWithBlank: "¿De ___ eres?", answer: "dónde", options: ["dónde", "qué", "cuándo"], fullSentence: "¿De dónde eres?", fullSentenceMeaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" }, isYesterdayReview: false },
      { type: "speak", sentence: "Gracias. Mucho gusto.", speechLang: "es-ES", meaning: { ko: "감사합니다. 만나서 반갑습니다.", en: "Thank you. Nice to meet you.", es: "Gracias. Mucho gusto." }, isYesterdayReview: false },
    ],
    korean: [
      { type: "speak", sentence: "안녕하세요, 제 이름은 루디예요.", speechLang: "ko-KR", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: false },
      { type: "fill_blank", promptWithBlank: "만나서 ___습니다.", answer: "반갑", options: ["반갑", "고맙", "감사"], fullSentence: "만나서 반갑습니다.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." }, isYesterdayReview: false },
      { type: "speak", sentence: "죄송해요, 이해를 못 했어요.", speechLang: "ko-KR", meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: false },
      { type: "fill_blank", promptWithBlank: "어디에서 ___어요?", answer: "오셨", options: ["오셨", "갔", "있"], fullSentence: "어디에서 오셨어요?", fullSentenceMeaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" }, isYesterdayReview: false },
      { type: "speak", sentence: "감사합니다. 만나서 반갑습니다.", speechLang: "ko-KR", meaning: { ko: "감사합니다. 만나서 반갑습니다.", en: "Thank you. Nice to meet you.", es: "Gracias. Mucho gusto." }, isYesterdayReview: false },
    ],
  },

  // ─────────────── Day 2 Review (first 2 are yesterday review from Day 1) ────
  day_2: {
    english: [
      { type: "speak", sentence: "Hello, my name is Rudy.", speechLang: "en-GB", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Sorry, I don't ___.", answer: "understand", options: ["understand", "know", "speak"], fullSentence: "Sorry, I don't understand.", fullSentenceMeaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "I'm from Korea. I live in Seoul.", speechLang: "en-GB", meaning: { ko: "저는 한국에서 왔어요. 서울에 살고 있어요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." }, isYesterdayReview: false },
      { type: "fill_blank", promptWithBlank: "Can you say that ___, please?", answer: "again", options: ["again", "more", "once"], fullSentence: "Can you say that again, please?", fullSentenceMeaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetir eso?" }, isYesterdayReview: false },
      { type: "speak", sentence: "Can you speak more slowly?", speechLang: "en-GB", meaning: { ko: "천천히 말해 주세요.", en: "Can you speak more slowly?", es: "¿Puede hablar más despacio?" }, isYesterdayReview: false },
    ],
    spanish: [
      { type: "speak", sentence: "Hola, me llamo Rudy.", speechLang: "es-ES", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Lo siento, no ___.", answer: "entiendo", options: ["entiendo", "hablo", "sé"], fullSentence: "Lo siento, no entiendo.", fullSentenceMeaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "Soy de Corea. Vivo en Seúl.", speechLang: "es-ES", meaning: { ko: "저는 한국에서 왔어요. 서울에 살고 있어요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." }, isYesterdayReview: false },
      { type: "fill_blank", promptWithBlank: "¿Puede ___ eso?", answer: "repetir", options: ["repetir", "decir", "hablar"], fullSentence: "¿Puede repetir eso?", fullSentenceMeaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again?", es: "¿Puede repetir eso?" }, isYesterdayReview: false },
      { type: "speak", sentence: "¿Puede hablar más despacio?", speechLang: "es-ES", meaning: { ko: "천천히 말해 주세요.", en: "Can you speak more slowly?", es: "¿Puede hablar más despacio?" }, isYesterdayReview: false },
    ],
    korean: [
      { type: "speak", sentence: "안녕하세요, 제 이름은 루디예요.", speechLang: "ko-KR", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "이해를 ___ 했어요.", answer: "못", options: ["못", "안", "잘"], fullSentence: "이해를 못 했어요.", fullSentenceMeaning: { ko: "이해를 못 했어요.", en: "I don't understand.", es: "No entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "한국에서 왔어요. 서울에 살고 있어요.", speechLang: "ko-KR", meaning: { ko: "한국에서 왔어요. 서울에 살고 있어요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." }, isYesterdayReview: false },
      { type: "fill_blank", promptWithBlank: "다시 한번 ___ 주세요.", answer: "말해", options: ["말해", "해", "가"], fullSentence: "다시 한번 말해 주세요.", fullSentenceMeaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetir eso?" }, isYesterdayReview: false },
      { type: "speak", sentence: "천천히 말해 주세요.", speechLang: "ko-KR", meaning: { ko: "천천히 말해 주세요.", en: "Can you speak more slowly?", es: "¿Puede hablar más despacio?" }, isYesterdayReview: false },
    ],
  },
};
