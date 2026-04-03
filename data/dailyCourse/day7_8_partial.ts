/**
 * Day 7-8 Partial (A1 Unit 2: Numbers & Time)
 * STEP 1: Pimsleur Anticipation + Graduated Interval Recall
 * STEP 2: Lexical Chunking + "왜" explanations
 * STEP 3: Task-Based Learning missions
 * STEP 4: SM-2 Spaced Repetition
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

export const LESSON_CONTENT_D7_8: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 7: Numbers 1-20 & Counting ───────────────
  day_7: {
    english: {
      step1Sentences: [
        { text: "One coffee, please.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "커피 한 잔 주세요.", en: "One coffee, please.", es: "Un café, por favor." } },
        { text: "Two tickets, please.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." } },
        { text: "How many people?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "몇 분이세요?", en: "How many people?", es: "¿Cuántas personas?" } },
        { text: "Three, please.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "세 명이요.", en: "Three, please.", es: "Tres, por favor." } },
        { text: "I have five books.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "책이 다섯 권 있어요.", en: "I have five books.", es: "Tengo cinco libros." } },
        { text: "Thank you!", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "감사합니다!", en: "Thank you!", es: "¡Gracias!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "영어에서 숫자를 세는 건 정말 간단해요! 숫자를 먼저 말하고 그 다음에 물건 이름을 붙이면 돼요. 'One coffee', 'Two tickets', 'Five books' — 순서가 항상 '숫자 + 명사'예요. 갯수를 물을 때는 'How many ___?'라고 해요. 한국어처럼 '잔', '장', '권' 같은 단위(counter)가 따로 없어서 훨씬 쉬워요! 그냥 숫자 + 물건이면 끝!", en: "Counting in English is simple! Put the number before the noun: 'One coffee', 'Two tickets', 'Five books'. To ask about quantity, say 'How many ___?' Unlike Korean (which uses counters like 잔, 장, 권) or Spanish (which changes word endings), English just needs number + noun. Easy!", es: "Contar en inglés es simple. Pon el número antes del sustantivo: 'One coffee', 'Two tickets', 'Five books'. Para preguntar cantidades: 'How many ___?' A diferencia del español (que cambia terminaciones) o el coreano (que usa contadores), el inglés solo necesita número + sustantivo." },
          examples: { ko: "One coffee, please. (커피 한 잔 주세요.)\nTwo tickets, please. (표 두 장 주세요.)\nHow many people? — Three, please. (몇 분이세요? — 세 명이요.)\nI have five books. (책이 다섯 권 있어요.)", en: "One coffee, please. (Ordering one item.)\nTwo tickets, please. (Asking for a quantity.)\nHow many people? — Three, please. (Asking and answering about quantity.)\nI have five books. (Saying what you have.)", es: "One coffee, please. (Un café, por favor.)\nTwo tickets, please. (Dos entradas, por favor.)\nHow many people? — Three, please. (¿Cuántas personas? — Tres, por favor.)\nI have five books. (Tengo cinco libros.)" },
          mistakes: { ko: "❌ Coffee one, please.\n✅ One coffee, please. (숫자가 먼저 와요! '커피 한 잔'이 아니라 'One coffee'!)\n❌ How much people?\n✅ How many people? (셀 수 있는 건 'How many', 가격은 'How much'!)", en: "❌ Coffee one, please.\n✅ One coffee, please. (Number comes FIRST in English!)\n❌ How much people?\n✅ How many people? (Use 'How many' for countable things, 'How much' for prices!)", es: "❌ Coffee one, please.\n✅ One coffee, please. (El número va PRIMERO en inglés.)\n❌ How much people?\n✅ How many people? ('How many' para cosas contables, 'How much' para precios.)" },
          rudyTip: { ko: "'___, please'만 기억하면 뭐든 주문할 수 있어! 'One coffee, please', 'Two tickets, please' — 숫자 + 물건 + please가 마법 공식이야~", en: "Remember the magic formula: number + thing + 'please'! 'One coffee, please', 'Two tickets, please' — you can order anything with this pattern!", es: "Recuerda la fórmula mágica: número + cosa + 'please'. 'One coffee, please', 'Two tickets, please' — con este patrón puedes pedir cualquier cosa." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ coffee, please.", answer: "One", options: ["One", "A one", "First"], fullSentence: "One coffee, please.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "One coffee, please.", es: "Un café, por favor." } },
          { type: "select", promptWithBlank: "How ___ people?", answer: "many", options: ["many", "much", "any"], fullSentence: "How many people?", fullSentenceMeaning: { ko: "몇 분이세요?", en: "How many people?", es: "¿Cuántas personas?" } },
          { type: "select", promptWithBlank: "I ___ five books.", answer: "have", options: ["have", "has", "am"], fullSentence: "I have five books.", fullSentenceMeaning: { ko: "책이 다섯 권 있어요.", en: "I have five books.", es: "Tengo cinco libros." } },
          { type: "input", promptWithBlank: "___ tickets, please.", answer: "Two", fullSentence: "Two tickets, please.", fullSentenceMeaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." } },
          { type: "listening", audioText: "Two tickets, please.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Two tickets, please.", "One coffee, please.", "Three, please.", "I have five books."], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Un café, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "커피 한 잔 주세요.", en: "One coffee, please.", es: "Un café, por favor." } },
        { text: "Dos entradas, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." } },
        { text: "¿Cuántas personas?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "몇 분이세요?", en: "How many people?", es: "¿Cuántas personas?" } },
        { text: "Tres, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "세 명이요.", en: "Three, please.", es: "Tres, por favor." } },
        { text: "Tengo cinco libros.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "책이 다섯 권 있어요.", en: "I have five books.", es: "Tengo cinco libros." } },
        { text: "¡Gracias!", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "감사합니다!", en: "Thank you!", es: "¡Gracias!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "스페인어 숫자는 영어처럼 '숫자 + 명사' 순서예요! 'Un café' (커피 한 잔), 'Dos entradas' (입장권 두 장), 'Cinco libros' (책 다섯 권). 갯수를 물어볼 때는 '¿Cuántas personas?' (몇 분이세요?)라고 해요. 여기서 중요한 건 'Cuántas'가 여성 명사에, 'Cuántos'가 남성 명사에 쓰인다는 거예요. personas(사람들)가 여성이라 'Cuántas'를 쓰는 거죠!", en: "Spanish numbers work like English — number + noun: 'Un café' (one coffee), 'Dos entradas' (two tickets), 'Cinco libros' (five books). To ask quantity: '¿Cuántas personas?' Notice 'Cuántas' is feminine (matching 'personas') — for masculine nouns you'd say 'Cuántos'. The question word changes to match the noun's gender!", es: "Los números en español van antes del sustantivo: 'Un café', 'Dos entradas', 'Cinco libros'. Para preguntar cantidad: '¿Cuántas personas?' Nota que 'Cuántas' es femenino (como 'personas') — para sustantivos masculinos usarías 'Cuántos'. ¡La palabra de pregunta cambia según el género!" },
          examples: { ko: "Un café, por favor. (커피 한 잔 주세요.)\nDos entradas, por favor. (입장권 두 장 주세요.)\n¿Cuántas personas? — Tres, por favor. (몇 분이세요? — 세 명이요.)\nTengo cinco libros. (책이 다섯 권 있어요.)", en: "Un café, por favor. (One coffee, please.)\nDos entradas, por favor. (Two tickets, please.)\n¿Cuántas personas? — Tres, por favor. (How many people? — Three, please.)\nTengo cinco libros. (I have five books.)", es: "Un café, por favor. (Pedir un artículo.)\nDos entradas, por favor. (Pedir cantidad.)\n¿Cuántas personas? — Tres, por favor. (Preguntar y responder cantidad.)\nTengo cinco libros. (Decir lo que tienes.)" },
          mistakes: { ko: "❌ Dos entrada, por favor.\n✅ Dos entradas, por favor. (2개 이상이면 명사에 -s를 붙여야 해요!)\n❌ ¿Cuántos personas?\n✅ ¿Cuántas personas? ('personas'는 여성이라 'Cuántas'!)", en: "❌ Dos entrada, por favor.\n✅ Dos entradas, por favor. (With 2+, add -s to make it plural!)\n❌ ¿Cuántos personas?\n✅ ¿Cuántas personas? ('personas' is feminine — use 'Cuántas'!)", es: "❌ Dos entrada, por favor.\n✅ Dos entradas, por favor. (Con 2+, agrega -s al plural.)\n❌ ¿Cuántos personas?\n✅ ¿Cuántas personas? ('personas' es femenino — usa 'Cuántas'.)" },
          rudyTip: { ko: "스페인어 1-10만 외우면 거의 다 돼! uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez — 이것만 알면 주문 가능~", en: "Just memorize 1-10 in Spanish and you're set! uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez — with these you can order anything!", es: "Solo memoriza 1-10 y listo. uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez — con estos puedes pedir lo que sea." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ café, por favor.", answer: "Un", options: ["Un", "Uno", "Una"], fullSentence: "Un café, por favor.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "One coffee, please.", es: "Un café, por favor." } },
          { type: "select", promptWithBlank: "¿___ personas?", answer: "Cuántas", options: ["Cuántas", "Cuántos", "Cuánto"], fullSentence: "¿Cuántas personas?", fullSentenceMeaning: { ko: "몇 분이세요?", en: "How many people?", es: "¿Cuántas personas?" } },
          { type: "select", promptWithBlank: "Dos ___, por favor.", answer: "entradas", options: ["entradas", "entrada", "entramos"], fullSentence: "Dos entradas, por favor.", fullSentenceMeaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." } },
          { type: "input", promptWithBlank: "Tengo ___ libros.", answer: "cinco", fullSentence: "Tengo cinco libros.", fullSentenceMeaning: { ko: "책이 다섯 권 있어요.", en: "I have five books.", es: "Tengo cinco libros." } },
          { type: "listening", audioText: "Dos entradas, por favor.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Dos entradas, por favor.", "Un café, por favor.", "Tres, por favor.", "Tengo cinco libros."], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "커피 한 잔 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "커피 한 잔 주세요.", en: "One coffee, please.", es: "Un café, por favor." } },
        { text: "표 두 장 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." } },
        { text: "몇 분이세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "몇 분이세요?", en: "How many people?", es: "¿Cuántas personas?" } },
        { text: "세 명이요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "세 명이요.", en: "Three, please.", es: "Tres, por favor." } },
        { text: "책이 다섯 권 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "책이 다섯 권 있어요.", en: "I have five books.", es: "Tengo cinco libros." } },
        { text: "감사합니다!", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "감사합니다!", en: "Thank you!", es: "¡Gracias!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "한국어에는 숫자가 두 가지 체계가 있어요! 물건을 셀 때는 순수 한국어 숫자(하나, 둘, 셋, 넷, 다섯...)를 쓰고, 전화번호나 가격에는 한자어 숫자(일, 이, 삼, 사, 오...)를 써요. 그리고 물건마다 '단위(counter)'가 달라요 — 잔(컵), 장(종이/표), 명(사람), 권(책), 개(일반). 영어에서는 그냥 'Two tickets'인데 한국어는 '표 두 장'이에요. 물건 + 숫자 + 단위 순서!", en: "Korean has TWO number systems! Native Korean numbers (하나 hana, 둘 dul, 셋 set...) are used with counters for counting things. Sino-Korean numbers (일 il, 이 i, 삼 sam...) are for prices, phone numbers, and dates. Plus, each thing has its own counter: 잔 (cups), 장 (flat things/tickets), 명 (people), 권 (books), 개 (general). The order is: thing + number + counter — '표 두 장' (ticket two flat-counter)!", es: "El coreano tiene DOS sistemas de números. Números nativos coreanos (하나, 둘, 셋...) se usan con contadores para contar cosas. Números sino-coreanos (일, 이, 삼...) son para precios, teléfonos y fechas. Cada cosa tiene su propio contador: 잔 (tazas), 장 (cosas planas/boletos), 명 (personas), 권 (libros), 개 (general). El orden es: cosa + número + contador — '표 두 장' (boleto dos contador-plano)." },
          examples: { ko: "커피 한 잔 주세요. (커피 + 한(1) + 잔(컵 단위) + 주세요)\n표 두 장 주세요. (표 + 두(2) + 장(종이/표 단위) + 주세요)\n세 명이요. (세(3) + 명(사람 단위))\n책이 다섯 권 있어요. (책 + 다섯(5) + 권(책 단위))", en: "커피 한 잔 주세요. (coffee + one(한) + cup-counter(잔) + please)\n표 두 장 주세요. (ticket + two(둘→두) + flat-counter(장) + please)\n세 명이요. (three(셋→세) + person-counter(명))\n책이 다섯 권 있어요. (book + five(다섯) + book-counter(권) + have)", es: "커피 한 잔 주세요. (café + uno(한) + contador-taza(잔) + por favor)\n표 두 장 주세요. (boleto + dos(둘→두) + contador-plano(장) + por favor)\n세 명이요. (tres(셋→세) + contador-persona(명))\n책이 다섯 권 있어요. (libro + cinco(다섯) + contador-libro(권) + tengo)" },
          mistakes: { ko: "❌ 커피 하나 잔 주세요.\n✅ 커피 한 잔 주세요. ('하나'가 단위 앞에서 '한'으로 줄어요!)\n❌ 두 표 장 주세요.\n✅ 표 두 장 주세요. (물건이 먼저, 그 다음 숫자+단위!)", en: "❌ 커피 하나 잔 주세요.\n✅ 커피 한 잔 주세요. ('하나' shortens to '한' before a counter!)\n❌ 두 표 장 주세요.\n✅ 표 두 장 주세요. (Thing first, then number + counter!)", es: "❌ 커피 하나 잔 주세요.\n✅ 커피 한 잔 주세요. ('하나' se acorta a '한' antes del contador.)\n❌ 두 표 장 주세요.\n✅ 표 두 장 주세요. (La cosa primero, luego número + contador.)" },
          rudyTip: { ko: "한국어 숫자가 두 개라 헷갈리지? 쉽게 기억해! 물건 셀 때는 '하나, 둘, 셋'(한국어), 돈 셀 때는 '일, 이, 삼'(한자어)! 자주 쓰다 보면 자연스러워져~", en: "Two number systems sound scary, but here's the trick: counting things = native Korean (하나, 둘, 셋), counting money = Sino-Korean (일, 이, 삼). With practice, it becomes second nature!", es: "Dos sistemas de números suena difícil, pero aquí va el truco: contar cosas = coreano nativo (하나, 둘, 셋), contar dinero = sino-coreano (일, 이, 삼). Con práctica se vuelve natural." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "커피 ___ 잔 주세요.", answer: "한", options: ["한", "하나", "일"], fullSentence: "커피 한 잔 주세요.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "One coffee, please.", es: "Un café, por favor." } },
          { type: "select", promptWithBlank: "표 두 ___ 주세요.", answer: "장", options: ["장", "잔", "명"], fullSentence: "표 두 장 주세요.", fullSentenceMeaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." } },
          { type: "select", promptWithBlank: "책이 다섯 ___ 있어요.", answer: "권", options: ["권", "장", "개"], fullSentence: "책이 다섯 권 있어요.", fullSentenceMeaning: { ko: "책이 다섯 권 있어요.", en: "I have five books.", es: "Tengo cinco libros." } },
          { type: "input", promptWithBlank: "___ 명이요.", answer: "세", fullSentence: "세 명이요.", fullSentenceMeaning: { ko: "세 명이요.", en: "Three, please.", es: "Tres, por favor." } },
          { type: "listening", audioText: "표 두 장 주세요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["표 두 장 주세요.", "커피 한 잔 주세요.", "세 명이요.", "책이 다섯 권 있어요."], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 8: Numbers 20-100 & Prices ───────────────
  day_8: {
    english: {
      step1Sentences: [
        { text: "How much is this?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
        { text: "It's fifteen dollars.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "15달러예요.", en: "It's fifteen dollars.", es: "Son quince dólares." } },
        { text: "That's too expensive!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Es muy caro!" } },
        { text: "Twenty, thirty, forty, fifty...", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "이십, 삼십, 사십, 오십...", en: "Twenty, thirty, forty, fifty...", es: "Veinte, treinta, cuarenta, cincuenta..." } },
        { text: "Can I pay by card?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" }, recallRound: true },
        { text: "Here's your change.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "거스름돈 여기 있습니다.", en: "Here's your change.", es: "Aquí está su cambio." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "가격을 물을 때는 'How much is this?'라고 해요. 대답은 'It's ___ dollars'예요. 비싸면 'That's too expensive!'라고 하면 돼요. 카드로 내고 싶으면 'Can I pay by card?'라고 물어보세요. 영어 10단위 숫자는 패턴이 있어요: twenty(20), thirty(30), forty(40), fifty(50), sixty(60) — 끝이 다 -ty로 끝나죠! 참고로 'How much'는 가격(셀 수 없는 양), 'How many'는 갯수(셀 수 있는 것)에 써요!", en: "To ask prices, say 'How much is this?' Answer with 'It's ___ dollars.' Too pricey? 'That's too expensive!' Want to use a card? 'Can I pay by card?' English tens follow a pattern: twenty(20), thirty(30), forty(40), fifty(50) — they all end in -ty! Remember: 'How much' is for prices/uncountable things, 'How many' is for countable things.", es: "Para preguntar precios: 'How much is this?' Respuesta: 'It's ___ dollars.' ¿Muy caro? 'That's too expensive!' ¿Quieres pagar con tarjeta? 'Can I pay by card?' Las decenas siguen un patrón: twenty, thirty, forty, fifty — todas terminan en -ty. Recuerda: 'How much' para precios, 'How many' para cosas contables." },
          examples: { ko: "How much is this? — It's fifteen dollars. (이거 얼마예요? — 15달러예요.)\nThat's too expensive! (너무 비싸요!)\nCan I pay by card? (카드로 결제할 수 있어요?)\nHere's your change. (거스름돈 여기 있습니다.)", en: "How much is this? — It's fifteen dollars. (Asking and answering about price.)\nThat's too expensive! (Reacting to a high price.)\nCan I pay by card? (Asking about payment method.)\nHere's your change. (Receiving change.)", es: "How much is this? — It's fifteen dollars. (¿Cuánto cuesta? — Son quince dólares.)\nThat's too expensive! (¡Es muy caro!)\nCan I pay by card? (¿Puedo pagar con tarjeta?)\nHere's your change. (Aquí está su cambio.)" },
          mistakes: { ko: "❌ How much is it costs?\n✅ How much is this? ('is'와 'costs'를 같이 쓰면 안 돼요!)\n❌ Can I pay with card?\n✅ Can I pay by card? ('with'이 아니라 'by' card!)", en: "❌ How much it costs?\n✅ How much is this? (Don't forget to flip the word order for questions!)\n❌ It's fifteen dollar.\n✅ It's fifteen dollars. (More than one = add -s!)", es: "❌ How much it costs?\n✅ How much is this? (No olvides invertir el orden para preguntas.)\n❌ It's fifteen dollar.\n✅ It's fifteen dollars. (Más de uno = agrega -s.)" },
          rudyTip: { ko: "'How much is this?'하고 'Can I pay by card?' — 이 두 문장만 알면 어디서든 쇼핑할 수 있어! 세계 어디를 가든 카드가 통하니까~", en: "'How much is this?' and 'Can I pay by card?' — just these two phrases and you can shop anywhere in the world! Cards work everywhere these days!", es: "'How much is this?' y 'Can I pay by card?' — solo estas dos frases y puedes comprar en cualquier parte del mundo." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "How ___ is this?", answer: "much", options: ["much", "many", "more"], fullSentence: "How much is this?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "select", promptWithBlank: "It's fifteen ___.", answer: "dollars", options: ["dollars", "dollar", "money"], fullSentence: "It's fifteen dollars.", fullSentenceMeaning: { ko: "15달러예요.", en: "It's fifteen dollars.", es: "Son quince dólares." } },
          { type: "select", promptWithBlank: "Can I pay ___ card?", answer: "by", options: ["by", "with", "in"], fullSentence: "Can I pay by card?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
          { type: "input", promptWithBlank: "That's too ___!", answer: "expensive", fullSentence: "That's too expensive!", fullSentenceMeaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Es muy caro!" } },
          { type: "listening", audioText: "How much is this?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["How much is this?", "Can I pay by card?", "That's too expensive!", "Here's your change."], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "¿Cuánto cuesta esto?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
        { text: "Son quince euros.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "15유로예요.", en: "It's fifteen euros.", es: "Son quince euros." } },
        { text: "¡Es muy caro!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Es muy caro!" } },
        { text: "Veinte, treinta, cuarenta, cincuenta...", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "이십, 삼십, 사십, 오십...", en: "Twenty, thirty, forty, fifty...", es: "Veinte, treinta, cuarenta, cincuenta..." } },
        { text: "¿Puedo pagar con tarjeta?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" }, recallRound: true },
        { text: "Aquí está su cambio.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "거스름돈 여기 있습니다.", en: "Here's your change.", es: "Aquí está su cambio." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "스페인어로 가격을 물을 때는 '¿Cuánto cuesta esto?'(이거 얼마예요?)라고 해요. 대답은 'Son ___ euros'(___유로예요)예요. 비싸면 '¡Es muy caro!'(너무 비싸요!). 카드 결제는 '¿Puedo pagar con tarjeta?'(카드로 결제할 수 있어요?). 스페인어 10단위: veinte(20), treinta(30), cuarenta(40), cincuenta(50). 영어 'by card'와 달리 스페인어는 'con tarjeta'(카드'와 함께')라고 해요!", en: "To ask prices in Spanish: '¿Cuánto cuesta esto?' (How much is this?). Answer: 'Son ___ euros.' Too expensive? '¡Es muy caro!' Card payment? '¿Puedo pagar con tarjeta?' Spanish tens: veinte(20), treinta(30), cuarenta(40), cincuenta(50). Note: English uses 'pay BY card' but Spanish uses 'pagar CON tarjeta' (pay WITH card)!", es: "Para preguntar precios: '¿Cuánto cuesta esto?' Respuesta: 'Son ___ euros.' ¿Muy caro? '¡Es muy caro!' ¿Tarjeta? '¿Puedo pagar con tarjeta?' Decenas: veinte(20), treinta(30), cuarenta(40), cincuenta(50). Nota: en inglés es 'pay BY card' pero en español es 'pagar CON tarjeta'." },
          examples: { ko: "¿Cuánto cuesta esto? — Son quince euros. (이거 얼마예요? — 15유로예요.)\n¡Es muy caro! (너무 비싸요!)\n¿Puedo pagar con tarjeta? (카드로 결제할 수 있어요?)\nAquí está su cambio. (거스름돈 여기 있습니다.)", en: "¿Cuánto cuesta esto? — Son quince euros. (How much? — Fifteen euros.)\n¡Es muy caro! (That's too expensive!)\n¿Puedo pagar con tarjeta? (Can I pay by card?)\nAquí está su cambio. (Here's your change.)", es: "¿Cuánto cuesta esto? — Son quince euros. (Preguntar y responder precio.)\n¡Es muy caro! (Reaccionar al precio alto.)\n¿Puedo pagar con tarjeta? (Preguntar por método de pago.)\nAquí está su cambio. (Recibir cambio.)" },
          mistakes: { ko: "❌ ¿Cuánto es cuesta?\n✅ ¿Cuánto cuesta esto? ('cuesta'에 'es'를 같이 쓰면 안 돼요!)\n❌ Son quince euro.\n✅ Son quince euros. (복수라 -s를 붙여요!)", en: "❌ ¿Cuánto es esto?\n✅ ¿Cuánto cuesta esto? (Use 'cuesta' — 'es' alone doesn't mean 'cost'!)\n❌ Es quince euros.\n✅ Son quince euros. (Multiple euros = 'Son', not 'Es'!)", es: "❌ ¿Cuánto es esto?\n✅ ¿Cuánto cuesta esto? (Usa 'cuesta' — 'es' solo no significa 'costar'.)\n❌ Es quince euros.\n✅ Son quince euros. (Múltiples euros = 'Son', no 'Es'.)" },
          rudyTip: { ko: "'¿Cuánto cuesta?'랑 '¿Puedo pagar con tarjeta?' — 이 두 마디면 스페인 어디서든 쇼핑 가능! 거스름돈이 필요하면 'cambio'만 기억해~", en: "'¿Cuánto cuesta?' and '¿Puedo pagar con tarjeta?' — these two phrases let you shop anywhere in Spain! If you need change, just remember 'cambio'!", es: "'¿Cuánto cuesta?' y '¿Puedo pagar con tarjeta?' — con estas dos frases puedes comprar en cualquier parte. Si necesitas cambio, recuerda 'cambio'." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Cuánto ___ esto?", answer: "cuesta", options: ["cuesta", "es", "tiene"], fullSentence: "¿Cuánto cuesta esto?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "select", promptWithBlank: "___ quince euros.", answer: "Son", options: ["Son", "Es", "Están"], fullSentence: "Son quince euros.", fullSentenceMeaning: { ko: "15유로예요.", en: "It's fifteen euros.", es: "Son quince euros." } },
          { type: "select", promptWithBlank: "¿Puedo pagar ___ tarjeta?", answer: "con", options: ["con", "por", "de"], fullSentence: "¿Puedo pagar con tarjeta?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
          { type: "input", promptWithBlank: "¡Es muy ___!", answer: "caro", fullSentence: "¡Es muy caro!", fullSentenceMeaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Es muy caro!" } },
          { type: "listening", audioText: "¿Cuánto cuesta esto?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Cuánto cuesta esto?", "¿Puedo pagar con tarjeta?", "¡Es muy caro!", "Aquí está su cambio."], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "이거 얼마예요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
        { text: "만 오천 원이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "만 오천 원이에요.", en: "It's fifteen thousand won.", es: "Son quince mil wones." } },
        { text: "너무 비싸요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Es muy caro!" } },
        { text: "이십, 삼십, 사십, 오십...", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "이십, 삼십, 사십, 오십...", en: "Twenty, thirty, forty, fifty...", es: "Veinte, treinta, cuarenta, cincuenta..." } },
        { text: "카드로 결제할 수 있어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" }, recallRound: true },
        { text: "거스름돈 여기 있습니다.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "거스름돈 여기 있습니다.", en: "Here's your change.", es: "Aquí está su cambio." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "가격을 물을 때는 '이거 얼마예요?'라고 해요. 가격은 한자어 숫자로 말해요! 만(10,000) + 오천(5,000) = 만 오천 원. 이게 Day 7에서 배운 것과 다른 점이에요 — 물건 셀 때는 '하나, 둘, 셋'(순수 한국어), 가격 말할 때는 '일, 이, 삼, 만, 천'(한자어)! 비싸면 '너무 비싸요!', 카드로 내려면 '카드로 결제할 수 있어요?'라고 해요. '~로'는 '~으로/~를 사용해서'라는 뜻이에요.", en: "To ask prices in Korean: '이거 얼마예요?' (How much is this?). Prices use Sino-Korean numbers! 만(10,000) + 오천(5,000) = 만 오천 원 (15,000 won). This is different from Day 7 — counting things uses native Korean (하나, 둘, 셋), but prices use Sino-Korean (일, 이, 삼, 만, 천)! Too expensive? '너무 비싸요!' Card payment? '카드로 결제할 수 있어요?' The particle '~로' means 'by/with (a method)'.", es: "Para preguntar precios en coreano: '이거 얼마예요?' Los precios usan números sino-coreanos. 만(10,000) + 오천(5,000) = 만 오천 원 (15,000 won). Esto es diferente al Día 7 — contar cosas usa coreano nativo (하나, 둘, 셋), pero precios usan sino-coreano (일, 이, 삼, 만, 천). ¿Muy caro? '너무 비싸요!' ¿Tarjeta? '카드로 결제할 수 있어요?' La partícula '~로' significa 'por/con (un método)'." },
          examples: { ko: "이거 얼마예요? (가격 묻기)\n만 오천 원이에요. (만=10,000 + 오천=5,000 → 15,000원)\n너무 비싸요! (가격 반응)\n카드로 결제할 수 있어요? (결제 방법 묻기)\n거스름돈 여기 있습니다. (거스름돈 받기)", en: "이거 얼마예요? (Asking the price)\n만 오천 원이에요. (만=10,000 + 오천=5,000 → 15,000 won)\n너무 비싸요! (Reacting to the price)\n카드로 결제할 수 있어요? (Asking about payment)\n거스름돈 여기 있습니다. (Receiving change)", es: "이거 얼마예요? (Preguntar el precio)\n만 오천 원이에요. (만=10,000 + 오천=5,000 → 15,000 won)\n너무 비싸요! (Reaccionar al precio)\n카드로 결제할 수 있어요? (Preguntar por pago)\n거스름돈 여기 있습니다. (Recibir cambio)" },
          mistakes: { ko: "❌ 이거 얼마이에요?\n✅ 이거 얼마예요? ('얼마' 뒤에는 '예요'! '이에요'가 아니에요)\n❌ 카드에 결제할 수 있어요?\n✅ 카드로 결제할 수 있어요? (방법을 나타낼 때 '~에'가 아니라 '~로'!)", en: "❌ 이거 얼마이에요?\n✅ 이거 얼마예요? (After 얼마, use 예요 not 이에요!)\n❌ 카드에 결제할 수 있어요?\n✅ 카드로 결제할 수 있어요? (For methods, use ~로 not ~에!)", es: "❌ 이거 얼마이에요?\n✅ 이거 얼마예요? (Después de 얼마, usa 예요 no 이에요.)\n❌ 카드에 결제할 수 있어요?\n✅ 카드로 결제할 수 있어요? (Para métodos, usa ~로 no ~에.)" },
          rudyTip: { ko: "한국 돈은 단위가 크니까 숫자도 커! '만'(10,000)이 기본 단위야. 커피 한 잔이 사천오백 원(4,500원)쯤 하니까, '만 원'이면 약 $7-8 정도라고 생각하면 돼~", en: "Korean won has big numbers! '만' (10,000) is the basic large unit. A coffee costs about 사천오백 원 (4,500 won), so 만 원 (10,000) is roughly $7-8. Don't let the big numbers scare you!", es: "El won coreano tiene números grandes. '만' (10,000) es la unidad grande básica. Un café cuesta unos 사천오백 원 (4,500 won), así que 만 원 (10,000) es unos $7-8. No te asustes por los números grandes." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "이거 ___?", answer: "얼마예요", options: ["얼마예요", "뭐예요", "어디예요"], fullSentence: "이거 얼마예요?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "select", promptWithBlank: "카드___ 결제할 수 있어요?", answer: "로", options: ["로", "에", "를"], fullSentence: "카드로 결제할 수 있어요?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
          { type: "select", promptWithBlank: "너무 ___!", answer: "비싸요", options: ["비싸요", "싸요", "좋아요"], fullSentence: "너무 비싸요!", fullSentenceMeaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Es muy caro!" } },
          { type: "input", promptWithBlank: "만 오천 ___이에요.", answer: "원", fullSentence: "만 오천 원이에요.", fullSentenceMeaning: { ko: "만 오천 원이에요.", en: "It's fifteen thousand won.", es: "Son quince mil wones." } },
          { type: "listening", audioText: "이거 얼마예요?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["이거 얼마예요?", "카드로 결제할 수 있어요?", "너무 비싸요!", "거스름돈 여기 있습니다."], correct: 0, audioOnly: true },
        ],
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: MISSION TALK
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_CONTENT_D7_8: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  // ─────────────── Day 7: Buying Museum Tickets ───────────────
  day_7: {
    english: {
      situation: {
        ko: "루디와 함께 런던 박물관에 도착했습니다! 입장권을 사야 해요. 몇 명인지 말하고, 표를 주문해 보세요!",
        en: "You've arrived at the London museum with Rudy! You need to buy admission tickets. Tell them how many people and order the tickets!",
        es: "Has llegado al museo de Londres con Rudy. Necesitas comprar las entradas. Di cuántas personas son y pide los boletos.",
      },
      gptPrompt: "You are Rudy the fox detective arriving at a London museum with your partner. Have a simple A1-level conversation in {targetLang} about buying tickets.\n\nPre-Task: Today's 3 target expressions are: 1) '___ tickets, please' (ordering with numbers) 2) 'How many people?' (asking about quantity) 3) 'Thank you!' (recall from Unit 1).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Arrive at the ticket counter — the clerk asks 'How many people?' — prompt user to answer with a number 2) Order the tickets using 'Two tickets, please' or similar 3) Clerk mentions a special exhibit — user orders extra items ('One guidebook, please') 4) Practice counting — how many rooms in the museum? 5) End with 'Thank you!' at the entrance.\n\nSuccess scoring: 3 targets hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review number + noun + please pattern and How many.\n\nNever say the user is wrong — rephrase and guide naturally.",
      speechLang: "en-GB",
      suggestedAnswers: ["One coffee, please.", "Two tickets, please.", "How many people?", "Three, please.", "Thank you!"],
    },
    spanish: {
      situation: {
        ko: "루디와 함께 런던 박물관에 도착했습니다! 입장권을 사야 해요. 몇 명인지 말하고, 표를 주문해 보세요!",
        en: "You've arrived at the London museum with Rudy! Buy admission tickets, say how many people.",
        es: "Has llegado al museo de Londres con Rudy. Necesitas comprar las entradas. Di cuántas personas son y pide los boletos.",
      },
      gptPrompt: "You are Rudy the fox detective arriving at a London museum with your partner. Have a simple A1-level conversation in {targetLang} about buying tickets.\n\nPre-Task: Today's 3 target expressions are: 1) 'Dos entradas, por favor' (ordering with numbers) 2) '¿Cuántas personas?' (asking about quantity) 3) '¡Gracias!' (recall from Unit 1).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Arrive at the ticket counter — clerk asks '¿Cuántas personas?' — prompt user to answer with a number 2) Order tickets using 'Dos entradas, por favor' or similar 3) Clerk mentions a special exhibit — user orders extra items ('Una guía, por favor') 4) Practice counting — how many rooms? 5) End with '¡Gracias!' at the entrance.\n\nSuccess scoring: 3 targets hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review número + sustantivo + por favor pattern and ¿Cuántas/Cuántos?\n\nNever say the user is wrong — rephrase and guide naturally.",
      speechLang: "es-ES",
      suggestedAnswers: ["Un café, por favor.", "Dos entradas, por favor.", "¿Cuántas personas?", "Tres, por favor.", "¡Gracias!"],
    },
    korean: {
      situation: {
        ko: "루디와 함께 런던 박물관에 도착했습니다! 입장권을 사야 해요. 몇 명인지 말하고, 표를 주문해 보세요!",
        en: "You've arrived at the London museum with Rudy! Buy admission tickets.",
        es: "Has llegado al museo de Londres con Rudy. Compra las entradas.",
      },
      gptPrompt: "You are Rudy the fox detective arriving at a London museum with your partner. Have a simple A1-level conversation in {targetLang} about buying tickets.\n\nPre-Task: Today's 3 target expressions are: 1) '표 두 장 주세요' (ordering with number + counter) 2) '몇 분이세요?' (asking about quantity) 3) '감사합니다!' (recall from Unit 1).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Arrive at the ticket counter — clerk asks '몇 분이세요?' — prompt user to answer with a number + counter (세 명이요) 2) Order tickets using '표 두 장 주세요' or similar 3) Clerk mentions a special exhibit — user orders extra items ('커피 한 잔 주세요') 4) Practice counting — how many rooms? Use counters! 5) End with '감사합니다!' at the entrance.\n\nSuccess scoring: 3 targets hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review thing + number + counter + 주세요 pattern and counters (잔, 장, 명).\n\nNever say the user is wrong — rephrase and guide naturally.",
      speechLang: "ko-KR",
      suggestedAnswers: ["커피 한 잔 주세요.", "표 두 장 주세요.", "세 명이요.", "책이 다섯 권 있어요.", "감사합니다!"],
    },
  },

  // ─────────────── Day 8: Museum Gift Shop ───────────────
  day_8: {
    english: {
      situation: {
        ko: "박물관 관람을 마치고 기념품 가게에 들렀습니다! 기념품을 사고 싶어요. 가격을 물어보고 쇼핑을 해 보세요!",
        en: "After exploring the museum, you've stopped at the gift shop! You want to buy some souvenirs. Ask about prices and do some shopping!",
        es: "Después de explorar el museo, has parado en la tienda de regalos. Quieres comprar recuerdos. Pregunta precios y haz compras.",
      },
      gptPrompt: "You are Rudy the fox detective at the museum gift shop with your partner. Have a simple A1-level conversation in {targetLang} about buying souvenirs.\n\nPre-Task: Today's 3 target expressions are: 1) 'How much is this?' (asking prices) 2) 'That's too expensive!' (reacting to prices) 3) 'Can I pay by card?' (payment method).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Browse the gift shop — see interesting souvenirs — prompt user to ask 'How much is this?' 2) Clerk says the price — user reacts ('That's too expensive!' or 'OK!') 3) Find something affordable — ask about another item's price 4) Decide to buy — ask 'Can I pay by card?' 5) Complete the purchase and receive change — 'Here's your change' — user says 'Thank you!'\n\nSuccess scoring: 3 targets hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review How much / price responses / payment phrases.\n\nNever say the user is wrong — rephrase and guide naturally.",
      speechLang: "en-GB",
      suggestedAnswers: ["How much is this?", "It's fifteen dollars.", "That's too expensive!", "Can I pay by card?", "Thank you!"],
    },
    spanish: {
      situation: {
        ko: "박물관 관람을 마치고 기념품 가게에 들렀습니다! 기념품을 사고 싶어요. 가격을 물어보고 쇼핑을 해 보세요!",
        en: "After exploring the museum, you've stopped at the gift shop! Ask about prices and buy souvenirs.",
        es: "Después de explorar el museo, has parado en la tienda de regalos. Pregunta precios y compra recuerdos.",
      },
      gptPrompt: "You are Rudy the fox detective at the museum gift shop with your partner. Have a simple A1-level conversation in {targetLang} about buying souvenirs.\n\nPre-Task: Today's 3 target expressions are: 1) '¿Cuánto cuesta esto?' (asking prices) 2) '¡Es muy caro!' (reacting to prices) 3) '¿Puedo pagar con tarjeta?' (payment method).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Browse the gift shop — prompt user to ask '¿Cuánto cuesta esto?' 2) Clerk says the price — user reacts ('¡Es muy caro!' or '¡Perfecto!') 3) Find something affordable — ask about another price 4) Decide to buy — '¿Puedo pagar con tarjeta?' 5) Complete purchase — clerk says 'Aquí está su cambio' — user says '¡Gracias!'\n\nSuccess scoring: 3 targets hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review ¿Cuánto cuesta? / price responses / payment phrases.\n\nNever say the user is wrong — rephrase and guide naturally.",
      speechLang: "es-ES",
      suggestedAnswers: ["¿Cuánto cuesta esto?", "Son quince euros.", "¡Es muy caro!", "¿Puedo pagar con tarjeta?", "¡Gracias!"],
    },
    korean: {
      situation: {
        ko: "박물관 관람을 마치고 기념품 가게에 들렀습니다! 기념품을 사고 싶어요. 가격을 물어보고 쇼핑을 해 보세요!",
        en: "After exploring the museum, you've stopped at the gift shop! Ask about prices and buy souvenirs.",
        es: "Después de explorar el museo, has parado en la tienda de regalos. Pregunta precios y compra recuerdos.",
      },
      gptPrompt: "You are Rudy the fox detective at the museum gift shop with your partner. Have a simple A1-level conversation in {targetLang} about buying souvenirs.\n\nPre-Task: Today's 3 target expressions are: 1) '이거 얼마예요?' (asking prices) 2) '너무 비싸요!' (reacting to prices) 3) '카드로 결제할 수 있어요?' (payment method).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Browse the gift shop — prompt user to ask '이거 얼마예요?' 2) Clerk says the price using Sino-Korean numbers — user reacts ('너무 비싸요!' or '좋아요!') 3) Find something affordable — ask about another price 4) Decide to buy — '카드로 결제할 수 있어요?' 5) Complete purchase — clerk says '거스름돈 여기 있습니다' — user says '감사합니다!'\n\nSuccess scoring: 3 targets hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review 얼마예요 / Sino-Korean numbers for prices / ~로 for method.\n\nNever say the user is wrong — rephrase and guide naturally.",
      speechLang: "ko-KR",
      suggestedAnswers: ["이거 얼마예요?", "만 오천 원이에요.", "너무 비싸요!", "카드로 결제할 수 있어요?", "감사합니다!"],
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: REVIEW (SM-2 spaced repetition with yesterday review)
// ═══════════════════════════════════════════════════════════════════════════════

export const REVIEW_CONTENT_D7_8: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  // ─────────────── Day 7: Review (first 2 = Day 6 Unit 1 review) ───────────────
  day_7: {
    english: [
      // Day 6 review (Unit 1 recall)
      { type: "speak", sentence: "Hello, my name is Rudy.", speechLang: "en-GB", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "I'm ___ London.", answer: "from", options: ["from", "in", "at"], fullSentence: "I'm from London.", fullSentenceMeaning: { ko: "런던에서 왔어요.", en: "I'm from London.", es: "Soy de Londres." }, isYesterdayReview: true },
      // Day 7 content
      { type: "speak", sentence: "Two tickets, please.", speechLang: "en-GB", meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." } },
      { type: "fill_blank", promptWithBlank: "How ___ people?", answer: "many", options: ["many", "much", "some"], fullSentence: "How many people?", fullSentenceMeaning: { ko: "몇 분이세요?", en: "How many people?", es: "¿Cuántas personas?" } },
      { type: "speak", sentence: "I have five books.", speechLang: "en-GB", meaning: { ko: "책이 다섯 권 있어요.", en: "I have five books.", es: "Tengo cinco libros." } },
    ],
    spanish: [
      // Day 6 review (Unit 1 recall)
      { type: "speak", sentence: "Hola, me llamo Rudy.", speechLang: "es-ES", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Soy ___ Londres.", answer: "de", options: ["de", "en", "a"], fullSentence: "Soy de Londres.", fullSentenceMeaning: { ko: "런던에서 왔어요.", en: "I'm from London.", es: "Soy de Londres." }, isYesterdayReview: true },
      // Day 7 content
      { type: "speak", sentence: "Dos entradas, por favor.", speechLang: "es-ES", meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." } },
      { type: "fill_blank", promptWithBlank: "¿___ personas?", answer: "Cuántas", options: ["Cuántas", "Cuántos", "Cuánto"], fullSentence: "¿Cuántas personas?", fullSentenceMeaning: { ko: "몇 분이세요?", en: "How many people?", es: "¿Cuántas personas?" } },
      { type: "speak", sentence: "Tengo cinco libros.", speechLang: "es-ES", meaning: { ko: "책이 다섯 권 있어요.", en: "I have five books.", es: "Tengo cinco libros." } },
    ],
    korean: [
      // Day 6 review (Unit 1 recall)
      { type: "speak", sentence: "안녕하세요, 제 이름은 루디예요.", speechLang: "ko-KR", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "런던___서 왔어요.", answer: "에", options: ["에", "을", "는"], fullSentence: "런던에서 왔어요.", fullSentenceMeaning: { ko: "런던에서 왔어요.", en: "I'm from London.", es: "Soy de Londres." }, isYesterdayReview: true },
      // Day 7 content
      { type: "speak", sentence: "표 두 장 주세요.", speechLang: "ko-KR", meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." } },
      { type: "fill_blank", promptWithBlank: "커피 ___ 잔 주세요.", answer: "한", options: ["한", "하나", "일"], fullSentence: "커피 한 잔 주세요.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "One coffee, please.", es: "Un café, por favor." } },
      { type: "speak", sentence: "책이 다섯 권 있어요.", speechLang: "ko-KR", meaning: { ko: "책이 다섯 권 있어요.", en: "I have five books.", es: "Tengo cinco libros." } },
    ],
  },

  // ─────────────── Day 8: Review (first 2 = Day 7 review) ───────────────
  day_8: {
    english: [
      // Day 7 review
      { type: "speak", sentence: "Two tickets, please.", speechLang: "en-GB", meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "How ___ people?", answer: "many", options: ["many", "much", "more"], fullSentence: "How many people?", fullSentenceMeaning: { ko: "몇 분이세요?", en: "How many people?", es: "¿Cuántas personas?" }, isYesterdayReview: true },
      // Day 8 content
      { type: "speak", sentence: "How much is this?", speechLang: "en-GB", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
      { type: "fill_blank", promptWithBlank: "Can I pay ___ card?", answer: "by", options: ["by", "with", "in"], fullSentence: "Can I pay by card?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
      { type: "speak", sentence: "That's too expensive!", speechLang: "en-GB", meaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Es muy caro!" } },
    ],
    spanish: [
      // Day 7 review
      { type: "speak", sentence: "Dos entradas, por favor.", speechLang: "es-ES", meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿___ personas?", answer: "Cuántas", options: ["Cuántas", "Cuántos", "Cuándo"], fullSentence: "¿Cuántas personas?", fullSentenceMeaning: { ko: "몇 분이세요?", en: "How many people?", es: "¿Cuántas personas?" }, isYesterdayReview: true },
      // Day 8 content
      { type: "speak", sentence: "¿Cuánto cuesta esto?", speechLang: "es-ES", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
      { type: "fill_blank", promptWithBlank: "¿Puedo pagar ___ tarjeta?", answer: "con", options: ["con", "por", "de"], fullSentence: "¿Puedo pagar con tarjeta?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
      { type: "speak", sentence: "¡Es muy caro!", speechLang: "es-ES", meaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Es muy caro!" } },
    ],
    korean: [
      // Day 7 review
      { type: "speak", sentence: "표 두 장 주세요.", speechLang: "ko-KR", meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "커피 ___ 잔 주세요.", answer: "한", options: ["한", "하나", "일"], fullSentence: "커피 한 잔 주세요.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "One coffee, please.", es: "Un café, por favor." }, isYesterdayReview: true },
      // Day 8 content
      { type: "speak", sentence: "이거 얼마예요?", speechLang: "ko-KR", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
      { type: "fill_blank", promptWithBlank: "카드___ 결제할 수 있어요?", answer: "로", options: ["로", "에", "를"], fullSentence: "카드로 결제할 수 있어요?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
      { type: "speak", sentence: "너무 비싸요!", speechLang: "ko-KR", meaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Es muy caro!" } },
    ],
  },
};
