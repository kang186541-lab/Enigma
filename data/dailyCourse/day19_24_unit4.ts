/**
 * NEW Day 19-24 Content (Unit 4: Places & Directions)
 *
 * Day 19: Places in the City
 * Day 20: Basic Directions
 * Day 21: More Directions (Advanced)
 * Day 22: Transportation
 * Day 23: Asking for Help Getting Around
 * Day 24: Unit 4 Review
 *
 * Each day has:
 * - STEP 1: 5-6 sentences (Listen & Repeat)
 * - STEP 2: 4-5 quizzes (mix of select + input)
 * - STEP 3: Mission Talk GPT prompt + suggested answers
 * - STEP 4: 5 review questions (mix of speak + fill_blank, with yesterday review)
 *
 * Story connection: Chapter 3 (Seoul) requires navigation vocabulary.
 * Users who complete Day 19-24 can solve Seoul's navigation quizzes.
 */

import type { Tri } from "../../lib/dailyCourseData";
import type {
  DayLessonData,
  GrammarExplanation,
  MissionTalkLangData,
  ReviewQuestion,
  LearningLangKey,
} from "../../lib/lessonContent";

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 + STEP 2 (LESSON_CONTENT)
// ═══════════════════════════════════════════════════════════════════════════════

export const LESSON_CONTENT_UNIT4: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 19: Places in the City ────────────────────────────────
  day_19: {
    english: {
      step1Sentences: [
        { text: "Where is the subway station?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "지하철역이 어디에 있나요?", en: "Where is the subway station?", es: "¿Dónde está la estación de metro?" } },
        { text: "The cafe is near the museum.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "카페가 박물관 근처에 있어요.", en: "The cafe is near the museum.", es: "El café está cerca del museo." } },
        { text: "Is there a pharmacy nearby?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "근처에 약국이 있나요?", en: "Is there a pharmacy nearby?", es: "¿Hay una farmacia cerca?" } },
        { text: "How far is it?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "얼마나 멀어요?", en: "How far is it?", es: "¿A qué distancia está?" }, recallRound: true },
        { text: "It's about five minutes on foot.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "걸어서 5분 정도예요.", en: "It's about five minutes on foot.", es: "Está a unos cinco minutos a pie." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "장소 찾기: 'Where is ___?' / 존재 확인: 'Is there a ___ nearby?' / 거리: 'How far is it?' → 'It's about ___ minutes on foot'", en: "'Where is ___?' → location / 'Is there a ___ nearby?' → existence / 'How far is it?' → distance / 'It's about ___ minutes on foot' → answer", es: "'Where is ___?' → ubicación / 'Is there a ___ nearby?' → existencia cercana / 'How far is it?' → distancia / 'It's about ___ minutes on foot' → respuesta" },
          examples: { ko: "Where is the nearest hospital? (가장 가까운 병원이 어디예요?)\nIs there a convenience store nearby? (근처에 편의점 있나요?)\nIt's about fifteen minutes by bus. (버스로 15분 정도예요.)", en: "Where is the nearest hospital? (Asking for a specific place.)\nIs there a convenience store nearby? (Checking if one exists close by.)\nIt's about fifteen minutes by bus. (Giving distance in time.)", es: "Where is the nearest hospital? (¿Dónde está el hospital más cercano?)\nIs there a convenience store nearby? (¿Hay una tienda cerca?)\nIt's about fifteen minutes by bus. (Está a unos quince minutos en autobús.)" },
          mistakes: { ko: "❌ Where is at the subway station?\n✅ Where is the subway station? (is 다음에 at 붙이지 마세요!)\n\n❌ How far is it to foot?\n✅ How far is it on foot? (on foot이 올바른 표현이에요)", en: "❌ Where is at the subway station?\n✅ Where is the subway station? (No preposition needed after 'Where is'!)\n\n❌ It's about five minutes by foot.\n✅ It's about five minutes on foot. ('On foot', not 'by foot'!)", es: "❌ Where is at the subway station?\n✅ Where is the subway station? (No se necesita preposición después de 'Where is'.)\n\n❌ It's about five minutes by foot.\n✅ It's about five minutes on foot. ('On foot', no 'by foot'.)" },
          rudyTip: { ko: "낯선 도시에서 길 찾기의 핵심은 딱 세 문장이야! Where is, Is there, How far — 이 세 개만 알면 어디든 갈 수 있어!", en: "Three phrases to survive any city: Where is, Is there, How far. Master these and you'll never be stuck wondering where to go!", es: "Tres frases para sobrevivir en cualquier ciudad: Where is, Is there, How far. Con estas tres, nunca estarás perdido." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ is the subway station?", answer: "Where", options: ["Where", "What", "How"], fullSentence: "Where is the subway station?", fullSentenceMeaning: { ko: "지하철역이 어디에 있나요?", en: "Where is the subway station?", es: "¿Dónde está la estación de metro?" } },
          { type: "select", promptWithBlank: "Is there a pharmacy ___?", answer: "nearby", options: ["nearby", "far", "here"], fullSentence: "Is there a pharmacy nearby?", fullSentenceMeaning: { ko: "근처에 약국이 있나요?", en: "Is there a pharmacy nearby?", es: "¿Hay una farmacia cerca?" } },
          { type: "select", promptWithBlank: "The cafe is ___ the museum.", answer: "near", options: ["near", "in", "at"], fullSentence: "The cafe is near the museum.", fullSentenceMeaning: { ko: "카페가 박물관 근처에 있어요.", en: "The cafe is near the museum.", es: "El café está cerca del museo." } },
          { type: "input", promptWithBlank: "How ___ is it?", answer: "far", fullSentence: "How far is it?", fullSentenceMeaning: { ko: "얼마나 멀어요?", en: "How far is it?", es: "¿A qué distancia está?" } },
          { type: "input", promptWithBlank: "It's about five minutes on ___.", answer: "foot", fullSentence: "It's about five minutes on foot.", fullSentenceMeaning: { ko: "걸어서 5분 정도예요.", en: "It's about five minutes on foot.", es: "Está a unos cinco minutos a pie." } },
          { type: "listening", audioText: "It's about five minutes on foot.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["It's about five minutes on foot.", "How far is it?", "Where is the subway station?", "Is there a pharmacy nearby?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¿Dónde está la estación de metro?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "지하철역이 어디에 있나요?", en: "Where is the subway station?", es: "¿Dónde está la estación de metro?" } },
        { text: "El café está cerca del museo.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "카페가 박물관 근처에 있어요.", en: "The cafe is near the museum.", es: "El café está cerca del museo." } },
        { text: "¿Hay una farmacia cerca?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "근처에 약국이 있나요?", en: "Is there a pharmacy nearby?", es: "¿Hay una farmacia cerca?" } },
        { text: "¿A qué distancia está?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "얼마나 멀어요?", en: "How far is it?", es: "¿A qué distancia está?" }, recallRound: true },
        { text: "Está a unos cinco minutos a pie.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "걸어서 5분 정도예요.", en: "It's about five minutes on foot.", es: "Está a unos cinco minutos a pie." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "장소 찾기: '¿Dónde está ___?' / 존재 확인: '¿Hay un/una ___ cerca?' / 거리: '¿A qué distancia está?' → 'Está a ___ minutos a pie'", en: "'¿Dónde está ___?' → location / '¿Hay un/una ___ cerca?' → nearby existence / '¿A qué distancia está?' → distance / 'Está a ___ minutos a pie' → answer", es: "'¿Dónde está ___?' → ubicación / '¿Hay un/una ___ cerca?' → existencia cercana / '¿A qué distancia está?' → distancia / 'Está a ___ minutos a pie' → respuesta" },
          examples: { ko: "¿Dónde está el banco? (은행이 어디에 있나요?)\n¿Hay un supermercado cerca? (근처에 슈퍼마켓 있나요?)\nEstá a diez minutos a pie. (걸어서 10분이에요.)", en: "¿Dónde está el banco? (Where is the bank?)\n¿Hay un supermercado cerca? (Is there a supermarket nearby?)\nEstá a diez minutos a pie. (It's ten minutes on foot.)", es: "¿Dónde está el banco? (Preguntando por un lugar.)\n¿Hay un supermercado cerca? (Verificando si existe uno cerca.)\nEstá a diez minutos a pie. (Dando la distancia en tiempo.)" },
          mistakes: { ko: "❌ ¿Dónde es la farmacia?\n✅ ¿Dónde está la farmacia? (위치는 estar를 써요, ser가 아니에요!)\n\n❌ ¿Hay una farmacia cercana?\n✅ ¿Hay una farmacia cerca? (cerca는 부사로 그대로 써요)", en: "❌ ¿Dónde es la farmacia?\n✅ ¿Dónde está la farmacia? (Use 'estar' for location, not 'ser'!)\n\n❌ ¿Hay una farmacia cercana?\n✅ ¿Hay una farmacia cerca? (Use 'cerca' as adverb, not adjective)", es: "❌ ¿Dónde es la farmacia?\n✅ ¿Dónde está la farmacia? (Ubicación = estar, no ser.)\n\n❌ Está a cinco minutos en pie.\n✅ Está a cinco minutos a pie. ('A pie', no 'en pie'.)" },
          rudyTip: { ko: "스페인어에서 위치를 말할 때는 항상 estar! ser는 본질, estar는 위치라고 기억해둬. '¿Dónde está?' 이 한 마디면 어디서든 길을 찾을 수 있어!", en: "In Spanish, location always uses estar, not ser! Think: ser = what it IS, estar = where it IS. '¿Dónde está?' is your number one survival phrase for navigation!", es: "Recuerda: ubicación siempre con estar, no con ser. Ser = esencia, estar = ubicación. '¿Dónde está?' es tu frase de supervivencia para navegar cualquier ciudad." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿___ está la estación?", answer: "Dónde", options: ["Dónde", "Qué", "Cómo"], fullSentence: "¿Dónde está la estación?", fullSentenceMeaning: { ko: "역이 어디에 있나요?", en: "Where is the station?", es: "¿Dónde está la estación?" } },
          { type: "select", promptWithBlank: "¿Hay una farmacia ___?", answer: "cerca", options: ["cerca", "lejos", "aquí"], fullSentence: "¿Hay una farmacia cerca?", fullSentenceMeaning: { ko: "근처에 약국이 있나요?", en: "Is there a pharmacy nearby?", es: "¿Hay una farmacia cerca?" } },
          { type: "select", promptWithBlank: "El café está ___ del museo.", answer: "cerca", options: ["cerca", "dentro", "encima"], fullSentence: "El café está cerca del museo.", fullSentenceMeaning: { ko: "카페가 박물관 근처에 있어요.", en: "The cafe is near the museum.", es: "El café está cerca del museo." } },
          { type: "input", promptWithBlank: "¿A qué ___ está?", answer: "distancia", fullSentence: "¿A qué distancia está?", fullSentenceMeaning: { ko: "얼마나 멀어요?", en: "How far is it?", es: "¿A qué distancia está?" } },
          { type: "input", promptWithBlank: "Está a cinco minutos a ___.", answer: "pie", fullSentence: "Está a cinco minutos a pie.", fullSentenceMeaning: { ko: "걸어서 5분이에요.", en: "Five minutes on foot.", es: "Está a cinco minutos a pie." } },
          { type: "listening", audioText: "Está a unos cinco minutos a pie.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Está a unos cinco minutos a pie.", "¿A qué distancia está?", "¿Dónde está la estación de metro?", "¿Hay una farmacia cerca?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "지하철역이 어디에 있나요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "지하철역이 어디에 있나요?", en: "Where is the subway station?", es: "¿Dónde está la estación de metro?" } },
        { text: "카페가 박물관 근처에 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "카페가 박물관 근처에 있어요.", en: "The cafe is near the museum.", es: "El café está cerca del museo." } },
        { text: "근처에 약국이 있나요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "근처에 약국이 있나요?", en: "Is there a pharmacy nearby?", es: "¿Hay una farmacia cerca?" } },
        { text: "얼마나 멀어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "얼마나 멀어요?", en: "How far is it?", es: "¿A qué distancia está?" }, recallRound: true },
        { text: "걸어서 5분 정도예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "걸어서 5분 정도예요.", en: "It's about five minutes on foot.", es: "Está a unos cinco minutos a pie." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "장소 찾기: '___이/가 어디에 있나요?' / 존재 확인: '근처에 ___이/가 있나요?' / 거리: '얼마나 멀어요?' → '걸어서 ___분 정도예요'", en: "'___이/가 어디에 있나요?' → location / '근처에 ___이/가 있나요?' → nearby check / '얼마나 멀어요?' → distance / '걸어서 ___분 정도예요' → answer", es: "'___이/가 어디에 있나요?' → ubicación / '근처에 ___이/가 있나요?' → cercanía / '얼마나 멀어요?' → distancia / '걸어서 ___분 정도예요' → respuesta" },
          examples: { ko: "병원이 어디에 있나요? (병원 위치 물어보기)\n근처에 편의점이 있나요? (편의점 존재 확인)\n걸어서 15분 정도예요. (거리 대답하기)", en: "병원이 어디에 있나요? (Where is the hospital?)\n근처에 편의점이 있나요? (Is there a convenience store nearby?)\n걸어서 15분 정도예요. (It's about 15 minutes on foot.)", es: "병원이 어디에 있나요? (¿Dónde está el hospital?)\n근처에 편의점이 있나요? (¿Hay una tienda cerca?)\n걸어서 15분 정도예요. (Unos 15 minutos a pie.)" },
          mistakes: { ko: "❌ 지하철역이 어디 있나요?\n✅ 지하철역이 어디에 있나요? ('어디에'로 조사를 꼭 붙여요!)\n\n❌ 얼마 멀어요?\n✅ 얼마나 멀어요? ('얼마나'가 정도를 나타내는 올바른 표현이에요)", en: "❌ 지하철역이 어디 있나요?\n✅ 지하철역이 어디에 있나요? (Don't drop 에 — it marks the location!)\n\n❌ 얼마 멀어요?\n✅ 얼마나 멀어요? ('얼마나' is correct for 'how much/far')", es: "❌ 지하철역이 어디 있나요?\n✅ 지하철역이 어디에 있나요? (No olvides 에, marca la ubicación.)\n\n❌ 얼마 멀어요?\n✅ 얼마나 멀어요? ('얼마나' es correcto para 'cuánto/qué tan lejos')" },
          rudyTip: { ko: "한국어에서 장소 물어볼 때 '어디에'가 핵심이야! '어디에 있나요?' 이 패턴 하나만 마스터하면 서울 어디든 찾아갈 수 있어!", en: "The key particle here is 에 — it marks WHERE something is! '어디에 있나요?' is the one pattern that'll get you anywhere in Seoul.", es: "La partícula clave es 에, que marca DÓNDE está algo. '어디에 있나요?' es el patrón que te llevará a cualquier lugar en Seúl." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "지하철역이 ___에 있나요?", answer: "어디", options: ["어디", "언제", "뭐"], fullSentence: "지하철역이 어디에 있나요?", fullSentenceMeaning: { ko: "지하철역이 어디에 있나요?", en: "Where is the subway station?", es: "¿Dónde está el metro?" } },
          { type: "select", promptWithBlank: "___에 약국이 있나요?", answer: "근처", options: ["근처", "안", "위"], fullSentence: "근처에 약국이 있나요?", fullSentenceMeaning: { ko: "근처에 약국이 있나요?", en: "Is there a pharmacy nearby?", es: "¿Hay una farmacia cerca?" } },
          { type: "select", promptWithBlank: "카페가 박물관 ___에 있어요.", answer: "근처", options: ["근처", "안", "뒤"], fullSentence: "카페가 박물관 근처에 있어요.", fullSentenceMeaning: { ko: "카페가 박물관 근처에 있어요.", en: "The cafe is near the museum.", es: "El café está cerca del museo." } },
          { type: "input", promptWithBlank: "___나 멀어요?", answer: "얼마", fullSentence: "얼마나 멀어요?", fullSentenceMeaning: { ko: "얼마나 멀어요?", en: "How far is it?", es: "¿A qué distancia?" } },
          { type: "input", promptWithBlank: "걸어서 5분 ___예요.", answer: "정도", fullSentence: "걸어서 5분 정도예요.", fullSentenceMeaning: { ko: "걸어서 5분 정도예요.", en: "About 5 minutes on foot.", es: "Unos 5 minutos a pie." } },
          { type: "listening", audioText: "걸어서 5분 정도예요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["걸어서 5분 정도예요.", "얼마나 멀어요?", "지하철역이 어디에 있나요?", "근처에 약국이 있나요?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Di mana stasiun kereta bawah tanah?", speechLang: "id-ID", meaning: { ko: "지하철역이 어디에 있나요?", en: "Where is the subway station?", es: "¿Dónde está la estación de metro?" } },
        { text: "Kafenya dekat museum.", speechLang: "id-ID", meaning: { ko: "카페가 박물관 근처에 있어요.", en: "The cafe is near the museum.", es: "El café está cerca del museo." } },
        { text: "Apakah ada apotek di dekat sini?", speechLang: "id-ID", meaning: { ko: "근처에 약국이 있나요?", en: "Is there a pharmacy nearby?", es: "¿Hay una farmacia cerca?" } },
        { text: "Berapa jauh dari sini?", speechLang: "id-ID", meaning: { ko: "얼마나 멀어요?", en: "How far is it?", es: "¿A qué distancia está?" }, recallRound: true },
        { text: "Sekitar lima menit jalan kaki.", speechLang: "id-ID", meaning: { ko: "걸어서 5분 정도예요.", en: "It's about five minutes on foot.", es: "Está a unos cinco minutos a pie." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "장소 찾기: 'Di mana ___?' / 존재 확인: 'Apakah ada ___ di dekat sini?' / 거리: 'Berapa jauh?' → 'Sekitar ___ menit jalan kaki'", en: "'Di mana ___?' → location / 'Apakah ada ___ di dekat sini?' → existence nearby / 'Berapa jauh?' → distance / 'Sekitar ___ menit jalan kaki' → answer (literally 'about ___ minutes foot-walking')", es: "'Di mana ___?' → ubicación / 'Apakah ada ___ di dekat sini?' → existencia cercana / 'Berapa jauh?' → distancia / 'Sekitar ___ menit jalan kaki' → respuesta" },
          examples: { ko: "Di mana rumah sakit terdekat? (가장 가까운 병원이 어디예요?)\nApakah ada minimarket di dekat sini? (근처에 편의점 있나요?)\nSekitar lima belas menit naik bus. (버스로 15분 정도예요.)", en: "Di mana rumah sakit terdekat? (Where is the nearest hospital?)\nApakah ada minimarket di dekat sini? (Is there a convenience store nearby?)\nSekitar lima belas menit naik bus. (About fifteen minutes by bus.)", es: "Di mana rumah sakit terdekat? (¿Dónde está el hospital más cercano?)\nApakah ada minimarket di dekat sini? (¿Hay una tienda cerca?)\nSekitar lima belas menit naik bus. (Unos quince minutos en autobús.)" },
          mistakes: { ko: "❌ Di mana di stasiun?\n✅ Di mana stasiun? ('di mana' 자체가 '어디에'라서 뒤에 'di'를 또 붙이지 마세요!)\n\n❌ Sekitar lima menit dengan kaki.\n✅ Sekitar lima menit jalan kaki. ('jalan kaki'가 '걸어서'예요, 'dengan kaki'가 아니에요!)", en: "❌ Di mana di stasiun?\n✅ Di mana stasiun? ('Di mana' already means 'where at' — don't add another 'di'!)\n\n❌ Sekitar lima menit dengan kaki.\n✅ Sekitar lima menit jalan kaki. ('Jalan kaki' is the set phrase for 'on foot'!)", es: "❌ Di mana di stasiun?\n✅ Di mana stasiun? ('Di mana' ya significa 'dónde', no añadas otro 'di'.)\n\n❌ Sekitar lima menit dengan kaki.\n✅ Sekitar lima menit jalan kaki. ('Jalan kaki' es la frase para 'a pie'.)" },
          rudyTip: { ko: "낯선 도시에서 길 찾기의 핵심은 세 문장이야! 'Di mana?' (어디?), 'Apakah ada?' (있나요?), 'Berapa jauh?' (얼마나 멀어요?) — 이 세 개면 어디든 갈 수 있어!", en: "Three phrases to survive any city: 'Di mana?' (where?), 'Apakah ada?' (is there?), 'Berapa jauh?' (how far?). Master these and you'll never be stuck!", es: "Tres frases para sobrevivir en cualquier ciudad: 'Di mana?' (¿dónde?), 'Apakah ada?' (¿hay?), 'Berapa jauh?' (¿qué tan lejos?). ¡Con estas tres nunca estarás perdido!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ stasiun kereta bawah tanah?", answer: "Di mana", options: ["Di mana", "Apa", "Bagaimana"], fullSentence: "Di mana stasiun kereta bawah tanah?", fullSentenceMeaning: { ko: "지하철역이 어디에 있나요?", en: "Where is the subway station?", es: "¿Dónde está la estación de metro?" } },
          { type: "select", promptWithBlank: "Apakah ada apotek di ___ sini?", answer: "dekat", options: ["dekat", "jauh", "sana"], fullSentence: "Apakah ada apotek di dekat sini?", fullSentenceMeaning: { ko: "근처에 약국이 있나요?", en: "Is there a pharmacy nearby?", es: "¿Hay una farmacia cerca?" } },
          { type: "select", promptWithBlank: "Kafenya ___ museum.", answer: "dekat", options: ["dekat", "dalam", "atas"], fullSentence: "Kafenya dekat museum.", fullSentenceMeaning: { ko: "카페가 박물관 근처에 있어요.", en: "The cafe is near the museum.", es: "El café está cerca del museo." } },
          { type: "input", promptWithBlank: "Berapa ___ dari sini?", answer: "jauh", fullSentence: "Berapa jauh dari sini?", fullSentenceMeaning: { ko: "얼마나 멀어요?", en: "How far is it?", es: "¿A qué distancia está?" } },
          { type: "input", promptWithBlank: "Sekitar lima menit jalan ___.", answer: "kaki", fullSentence: "Sekitar lima menit jalan kaki.", fullSentenceMeaning: { ko: "걸어서 5분 정도예요.", en: "It's about five minutes on foot.", es: "Está a unos cinco minutos a pie." } },
          { type: "listening", audioText: "Sekitar lima menit jalan kaki.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Sekitar lima menit jalan kaki.", "Berapa jauh dari sini?", "Di mana stasiun kereta bawah tanah?", "Apakah ada apotek di dekat sini?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "فين مَحَطّة المِترو؟", speechLang: "ar-EG", meaning: { ko: "feen mahattet el-metro? · 지하철역이 어디에 있나요?", en: "feen mahattet el-metro? · Where is the subway station?", es: "feen mahattet el-metro? · ¿Dónde está la estación de metro?", id: "feen mahattet el-metro? · Di mana stasiun kereta bawah tanah?" } },
        { text: "القَهْوة جَنْب المَتْحَف.", speechLang: "ar-EG", meaning: { ko: "el-ahwa ganb el-mathaf · 카페가 박물관 근처에 있어요.", en: "el-ahwa ganb el-mathaf · The cafe is near the museum.", es: "el-ahwa ganb el-mathaf · El café está cerca del museo.", id: "el-ahwa ganb el-mathaf · Kafenya dekat museum." } },
        { text: "في صَيْدَلِيّة قُرَيِّب مِن هِنا؟", speechLang: "ar-EG", meaning: { ko: "fee saydaleyya orayyeb men hena? · 근처에 약국이 있나요?", en: "fee saydaleyya orayyeb men hena? · Is there a pharmacy nearby?", es: "fee saydaleyya orayyeb men hena? · ¿Hay una farmacia cerca?", id: "fee saydaleyya orayyeb men hena? · Apakah ada apotek di dekat sini?" } },
        { text: "هِيَّ بِعيدة قَدّ إيه؟", speechLang: "ar-EG", meaning: { ko: "heyya be3eeda add eh? · 얼마나 멀어요?", en: "heyya be3eeda add eh? · How far is it?", es: "heyya be3eeda add eh? · ¿A qué distancia está?", id: "heyya be3eeda add eh? · Berapa jauh dari sini?" }, recallRound: true },
        { text: "حَوالي خَمَس دَقايِق مَشْي.", speechLang: "ar-EG", meaning: { ko: "hawaali khamas da'aaye' mashy · 걸어서 5분 정도예요.", en: "hawaali khamas da'aaye' mashy · It's about five minutes on foot.", es: "hawaali khamas da'aaye' mashy · Está a unos cinco minutos a pie.", id: "hawaali khamas da'aaye' mashy · Sekitar lima menit jalan kaki." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "장소 찾기: 'فين ___؟'(feen ___?, 표준어 أين가 아니라 이집트식 'feen!') / 존재 확인: 'في ___ قُرَيِّب؟'(fee ___ orayyeb?) / 거리: 'بِعيدة قَدّ إيه؟'(be3eeda add eh?) → 'حَوالي ___ دَقايِق مَشْي'(hawaali ___ da'aaye' mashy)", en: "Location: 'فين ___؟' (feen ___?) — Egyptians say 'feen', never the textbook 'ayna' / Existence: 'في ___ قُرَيِّب؟' (fee ___ orayyeb?, literally 'is there a ___ nearby?') / Distance: 'بِعيدة قَدّ إيه؟' (be3eeda add eh?) → answer 'حَوالي ___ دَقايِق مَشْي' (hawaali ___ da'aaye' mashy, 'about ___ minutes walking')", es: "Ubicación: 'فين ___؟' (feen ___?) — los egipcios dicen 'feen', nunca el 'ayna' de libro / Existencia: 'في ___ قُرَيِّب؟' (fee ___ orayyeb?) / Distancia: 'بِعيدة قَدّ إيه؟' (be3eeda add eh?) → respuesta 'حَوالي ___ دَقايِق مَشْي' (hawaali ___ da'aaye' mashy)" },
          examples: { ko: "فين أقْرَب مُسْتَشْفى؟ (feen a'rab mostashfa? · 가장 가까운 병원이 어디예요?)\nفي سوبَر مارْكِت قُرَيِّب؟ (fee supermarket orayyeb? · 근처에 편의점 있나요?)\nحَوالي رُبْع ساعة بالأُتوبيس. (hawaali rob3 sa3a bel-otobees · 버스로 15분 정도예요.)", en: "فين أقْرَب مُسْتَشْفى؟ (feen a'rab mostashfa? · Where is the nearest hospital?)\nفي سوبَر مارْكِت قُرَيِّب؟ (fee supermarket orayyeb? · Is there a convenience store nearby?)\nحَوالي رُبْع ساعة بالأُتوبيس. (hawaali rob3 sa3a bel-otobees · About fifteen minutes by bus.)", es: "فين أقْرَب مُسْتَشْفى؟ (feen a'rab mostashfa? · ¿Dónde está el hospital más cercano?)\nفي سوبَر مارْكِت قُرَيِّب؟ (fee supermarket orayyeb? · ¿Hay una tienda cerca?)\nحَوالي رُبْع ساعة بالأُتوبيس. (hawaali rob3 sa3a bel-otobees · Unos quince minutos en autobús.)" },
          mistakes: { ko: "❌ أين محطة المترو؟ (책에 나오는 표준어 'ayna' — 이집트 사람은 이렇게 말 안 해요!)\n✅ فين مَحَطّة المِترو؟ (feen ___? — 이게 진짜 이집트식이에요!)\n\n❌ القَهْوة قَريبة مِن المَتْحَف. (표준어 'areeba men')\n✅ القَهْوة جَنْب المَتْحَف. (el-ahwa ganb el-mathaf — 이집트에선 'جَنْب/ganb'을 더 많이 써요!)", en: "❌ أين محطة المترو؟ (that's textbook MSA 'ayna' — Egyptians don't say it!)\n✅ فين مَحَطّة المِترو؟ (feen ___? — this is what's actually said!)\n\n❌ القَهْوة قَريبة مِن المَتْحَف. (MSA 'areeba men')\n✅ القَهْوة جَنْب المَتْحَف. (el-ahwa ganb el-mathaf — Egyptians prefer 'جَنْب' / ganb for 'next to/near'!)", es: "❌ أين محطة المترو؟ (es el 'ayna' de libro — los egipcios no lo dicen)\n✅ فين مَحَطّة المِترو؟ (feen ___? — ¡esto es lo que se dice de verdad!)\n\n❌ القَهْوة قَريبة مِن المَتْحَف. (MSA 'areeba men')\n✅ القَهْوة جَنْب المَتْحَف. (el-ahwa ganb el-mathaf — los egipcios prefieren 'جَنْب' / ganb)" },
          rudyTip: { ko: "낯선 도시에서 길 찾기의 핵심은 세 마디야! 'فين؟'(feen? 어디?), 'في ___؟'(fee ___? 있나요?), 'قَدّ إيه؟'(add eh? 얼마나?) — 표준어보다 훨씬 짧고, 이 세 개면 카이로 어디든 갈 수 있어!", en: "Three little words to survive any city: 'فين؟' (feen? where?), 'في ___؟' (fee ___? is there?), 'قَدّ إيه؟' (add eh? how much/far?). Way shorter than the textbook — master these and you'll never get stuck in Cairo!", es: "Tres palabritas para sobrevivir en cualquier ciudad: 'فين؟' (feen? ¿dónde?), 'في ___؟' (fee ___? ¿hay?), 'قَدّ إيه؟' (add eh? ¿cuánto/qué tan lejos?). ¡Mucho más cortas que el libro y con estas tres nunca estarás perdido en El Cairo!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ مَحَطّة المِترو؟", answer: "فين", options: ["فين", "إيه", "إزّاي"], fullSentence: "فين مَحَطّة المِترو؟", fullSentenceMeaning: { ko: "지하철역이 어디에 있나요?", en: "Where is the subway station?", es: "¿Dónde está la estación de metro?", id: "Di mana stasiun kereta bawah tanah?" } },
          { type: "select", promptWithBlank: "في صَيْدَلِيّة ___ مِن هِنا؟", answer: "قُرَيِّب", options: ["قُرَيِّب", "بِعيد", "هِنا"], fullSentence: "في صَيْدَلِيّة قُرَيِّب مِن هِنا؟", fullSentenceMeaning: { ko: "근처에 약국이 있나요?", en: "Is there a pharmacy nearby?", es: "¿Hay una farmacia cerca?", id: "Apakah ada apotek di dekat sini?" } },
          { type: "select", promptWithBlank: "القَهْوة ___ المَتْحَف.", answer: "جَنْب", options: ["جَنْب", "جوّا", "فوق"], fullSentence: "القَهْوة جَنْب المَتْحَف.", fullSentenceMeaning: { ko: "카페가 박물관 근처에 있어요.", en: "The cafe is near the museum.", es: "El café está cerca del museo.", id: "Kafenya dekat museum." } },
          { type: "input", promptWithBlank: "هِيَّ بِعيدة قَدّ ___؟", answer: "إيه", fullSentence: "هِيَّ بِعيدة قَدّ إيه؟", fullSentenceMeaning: { ko: "얼마나 멀어요?", en: "How far is it?", es: "¿A qué distancia está?", id: "Berapa jauh dari sini?" } },
          { type: "input", promptWithBlank: "حَوالي خَمَس دَقايِق ___.", answer: "مَشْي", fullSentence: "حَوالي خَمَس دَقايِق مَشْي.", fullSentenceMeaning: { ko: "걸어서 5분 정도예요.", en: "It's about five minutes on foot.", es: "Está a unos cinco minutos a pie.", id: "Sekitar lima menit jalan kaki." } },
          { type: "listening", audioText: "حَوالي خَمَس دَقايِق مَشْي.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["حَوالي خَمَس دَقايِق مَشْي.", "هِيَّ بِعيدة قَدّ إيه؟", "فين مَحَطّة المِترو؟", "في صَيْدَلِيّة قُرَيِّب مِن هِنا؟"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 20: Basic Directions ──────────────────────────────────
  day_20: {
    english: {
      step1Sentences: [
        { text: "Turn left.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "왼쪽으로 돌아요.", en: "Turn left.", es: "Gira a la izquierda." } },
        { text: "Turn right.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "오른쪽으로 돌아요.", en: "Turn right.", es: "Gira a la derecha." } },
        { text: "Go straight ahead.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "직진하세요.", en: "Go straight ahead.", es: "Sigue todo recto." } },
        { text: "It's on your left.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "왼쪽에 있어요.", en: "It's on your left.", es: "Está a tu izquierda." }, recallRound: true },
        { text: "Take the first street on the right.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "오른쪽 첫 번째 길로 가세요.", en: "Take the first street on the right.", es: "Toma la primera calle a la derecha." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "방향 전환: 'Turn left/right' / 직진: 'Go straight ahead' / 위치: 'It's on your left/right' / 길 안내: 'Take the first/second street on the left/right'", en: "'Turn left/right' → change direction / 'Go straight ahead' → continue forward / 'It's on your left/right' → describe position / 'Take the first street on the ___' → specific navigation", es: "'Turn left/right' → cambiar dirección / 'Go straight ahead' → seguir recto / 'It's on your left/right' → indicar posición / 'Take the first street on the ___' → navegación específica" },
          examples: { ko: "Turn right at the traffic light. (신호등에서 오른쪽으로 도세요.)\nGo straight ahead for two blocks. (두 블록 직진하세요.)\nThe bank is on your left. (은행은 왼쪽에 있어요.)", en: "Turn right at the traffic light. (Change direction at the signal.)\nGo straight ahead for two blocks. (Continue forward two blocks.)\nThe bank is on your left. (Describing where the bank is.)", es: "Turn right at the traffic light. (Gira a la derecha en el semáforo.)\nGo straight ahead for two blocks. (Sigue recto dos cuadras.)\nThe bank is on your left. (El banco está a tu izquierda.)" },
          mistakes: { ko: "❌ Turn to left.\n✅ Turn left. (turn 다음에 바로 left/right — to 필요 없어요!)\n\n❌ It's on your left side.\n✅ It's on your left. (side는 빼도 돼요, 더 자연스러워요)", en: "❌ Turn to left.\n✅ Turn left. (No 'to' needed — just 'Turn left/right'!)\n\n❌ Go straight on ahead.\n✅ Go straight ahead. (Don't add 'on' — it's just 'straight ahead'!)", es: "❌ Turn to left.\n✅ Turn left. (Sin 'to' — solo 'Turn left/right'.)\n\n❌ Go straight on ahead.\n✅ Go straight ahead. (No añadas 'on', solo 'straight ahead'.)" },
          rudyTip: { ko: "영어 길 안내는 심플해! Turn + 방향, Go straight, It's on your + 방향. 이 세 가지 조합이면 누구든 목적지까지 안내할 수 있어!", en: "English directions are super simple! Turn + direction, Go straight, It's on your + side. Mix and match these three and you can guide anyone anywhere!", es: "Las direcciones en inglés son simples: Turn + dirección, Go straight, It's on your + lado. Con estas tres combinaciones puedes guiar a cualquiera." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Turn ___.", answer: "left", options: ["left", "up", "down"], fullSentence: "Turn left.", fullSentenceMeaning: { ko: "왼쪽으로 돌아요.", en: "Turn left.", es: "Gira a la izquierda." } },
          { type: "select", promptWithBlank: "Go ___ ahead.", answer: "straight", options: ["straight", "right", "fast"], fullSentence: "Go straight ahead.", fullSentenceMeaning: { ko: "직진하세요.", en: "Go straight ahead.", es: "Sigue todo recto." } },
          { type: "select", promptWithBlank: "It's on your ___.", answer: "right", options: ["right", "up", "back"], fullSentence: "It's on your right.", fullSentenceMeaning: { ko: "오른쪽에 있어요.", en: "It's on your right.", es: "Está a tu derecha." } },
          { type: "input", promptWithBlank: "Turn ___.", answer: "right", fullSentence: "Turn right.", fullSentenceMeaning: { ko: "오른쪽으로 돌아요.", en: "Turn right.", es: "Gira a la derecha." } },
          { type: "input", promptWithBlank: "Take the ___ street on the right.", answer: "first", fullSentence: "Take the first street on the right.", fullSentenceMeaning: { ko: "오른쪽 첫 번째 길로 가세요.", en: "Take the first street on the right.", es: "Toma la primera calle a la derecha." } },
          { type: "listening", audioText: "Take the first street on the right.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Take the first street on the right.", "It's on your left.", "Turn right.", "Go straight ahead."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "Gira a la izquierda.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "왼쪽으로 돌아요.", en: "Turn left.", es: "Gira a la izquierda." } },
        { text: "Gira a la derecha.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "오른쪽으로 돌아요.", en: "Turn right.", es: "Gira a la derecha." } },
        { text: "Sigue todo recto.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "직진하세요.", en: "Go straight ahead.", es: "Sigue todo recto." } },
        { text: "Está a tu izquierda.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "왼쪽에 있어요.", en: "It's on your left.", es: "Está a tu izquierda." }, recallRound: true },
        { text: "Toma la primera calle a la derecha.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "오른쪽 첫 번째 길로 가세요.", en: "Take the first street on the right.", es: "Toma la primera calle a la derecha." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "방향 전환: 'Gira a la izquierda/derecha' / 직진: 'Sigue todo recto' / 위치: 'Está a tu izquierda/derecha' / 길 안내: 'Toma la primera/segunda calle a la ___'", en: "'Gira a la izquierda/derecha' → turn left/right / 'Sigue todo recto' → go straight / 'Está a tu izquierda/derecha' → it's on your left/right / 'Toma la primera calle' → take the first street", es: "'Gira a la izquierda/derecha' → girar / 'Sigue todo recto' → seguir recto / 'Está a tu izquierda/derecha' → indicar posición / 'Toma la primera calle a la ___' → navegación específica" },
          examples: { ko: "Gira a la derecha en el semáforo. (신호등에서 오른쪽으로 도세요.)\nSigue todo recto dos cuadras. (두 블록 직진하세요.)\nEl banco está a tu izquierda. (은행은 왼쪽에 있어요.)", en: "Gira a la derecha en el semáforo. (Turn right at the traffic light.)\nSigue todo recto dos cuadras. (Go straight for two blocks.)\nEl banco está a tu izquierda. (The bank is on your left.)", es: "Gira a la derecha en el semáforo. (Girar en la señal de tráfico.)\nSigue todo recto dos cuadras. (Continuar recto dos cuadras.)\nEl banco está a tu izquierda. (Indicar dónde está el banco.)" },
          mistakes: { ko: "❌ Gira la izquierda.\n✅ Gira a la izquierda. ('a la'를 꼭 넣어야 해요!)\n\n❌ Sigue todo derecho.\n✅ Sigue todo recto. ('derecho'가 아니라 'recto'가 맞아요)", en: "❌ Gira la izquierda.\n✅ Gira a la izquierda. (Don't forget 'a la' before the direction!)\n\n❌ Sigue todo derecho.\n✅ Sigue todo recto. (Use 'recto', not 'derecho' for straight!)", es: "❌ Gira la izquierda.\n✅ Gira a la izquierda. (No olvides 'a la' antes de la dirección.)\n\n❌ Sigue todo derecho.\n✅ Sigue todo recto. (Se dice 'recto', no 'derecho' para indicar recto.)" },
          rudyTip: { ko: "스페인어 방향의 핵심은 'a la'야! 'Gira a la izquierda', 'Está a tu derecha' — 이 전치사를 빼먹으면 원어민이 알아듣기 어려워!", en: "The key in Spanish directions is 'a la'! 'Gira a la izquierda', 'Está a tu derecha' — skip this little phrase and locals won't follow you!", es: "La clave de las direcciones en español es 'a la'. 'Gira a la izquierda', 'Está a tu derecha' — sin esta preposición, no suena natural." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Gira a la ___.", answer: "izquierda", options: ["izquierda", "arriba", "abajo"], fullSentence: "Gira a la izquierda.", fullSentenceMeaning: { ko: "왼쪽으로 돌아요.", en: "Turn left.", es: "Gira a la izquierda." } },
          { type: "select", promptWithBlank: "Sigue todo ___.", answer: "recto", options: ["recto", "derecho", "rápido"], fullSentence: "Sigue todo recto.", fullSentenceMeaning: { ko: "직진하세요.", en: "Go straight.", es: "Sigue todo recto." } },
          { type: "select", promptWithBlank: "Está a tu ___.", answer: "derecha", options: ["derecha", "arriba", "atrás"], fullSentence: "Está a tu derecha.", fullSentenceMeaning: { ko: "오른쪽에 있어요.", en: "It's on your right.", es: "Está a tu derecha." } },
          { type: "input", promptWithBlank: "Gira a la ___.", answer: "derecha", fullSentence: "Gira a la derecha.", fullSentenceMeaning: { ko: "오른쪽으로 돌아요.", en: "Turn right.", es: "Gira a la derecha." } },
          { type: "input", promptWithBlank: "Toma la ___ calle a la derecha.", answer: "primera", fullSentence: "Toma la primera calle a la derecha.", fullSentenceMeaning: { ko: "오른쪽 첫 번째 길로 가세요.", en: "Take the first street on the right.", es: "Toma la primera calle a la derecha." } },
          { type: "listening", audioText: "Toma la primera calle a la derecha.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Toma la primera calle a la derecha.", "Está a tu izquierda.", "Gira a la derecha.", "Sigue todo recto."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "왼쪽으로 돌아요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "왼쪽으로 돌아요.", en: "Turn left.", es: "Gira a la izquierda." } },
        { text: "오른쪽으로 돌아요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "오른쪽으로 돌아요.", en: "Turn right.", es: "Gira a la derecha." } },
        { text: "직진하세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "직진하세요.", en: "Go straight ahead.", es: "Sigue todo recto." } },
        { text: "왼쪽에 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "왼쪽에 있어요.", en: "It's on your left.", es: "Está a tu izquierda." }, recallRound: true },
        { text: "오른쪽 첫 번째 길로 가세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "오른쪽 첫 번째 길로 가세요.", en: "Take the first street on the right.", es: "Toma la primera calle a la derecha." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "방향 전환: '왼쪽/오른쪽으로 돌아요' / 직진: '직진하세요' / 위치: '왼쪽/오른쪽에 있어요' / 길 안내: '___쪽 첫 번째 길로 가세요'", en: "'왼쪽/오른쪽으로 돌아요' → turn left/right / '직진하세요' → go straight / '왼쪽/오른쪽에 있어요' → on your left/right / '___쪽 첫 번째 길로 가세요' → take the first street", es: "'왼쪽/오른쪽으로 돌아요' → girar / '직진하세요' → seguir recto / '왼쪽/오른쪽에 있어요' → posición / '___쪽 첫 번째 길로 가세요' → tomar la primera calle" },
          examples: { ko: "신호등에서 오른쪽으로 돌아요. (신호등 기준 방향 전환)\n두 블록 직진하세요. (직진 거리 안내)\n은행은 왼쪽에 있어요. (위치 설명)", en: "신호등에서 오른쪽으로 돌아요. (Turn right at the traffic light.)\n두 블록 직진하세요. (Go straight for two blocks.)\n은행은 왼쪽에 있어요. (The bank is on your left.)", es: "신호등에서 오른쪽으로 돌아요. (Gira a la derecha en el semáforo.)\n두 블록 직진하세요. (Sigue recto dos cuadras.)\n은행은 왼쪽에 있어요. (El banco está a tu izquierda.)" },
          mistakes: { ko: "❌ 왼쪽에 돌아요.\n✅ 왼쪽으로 돌아요. (방향은 '으로'를 써요, '에'가 아니에요!)\n\n❌ 오른쪽 있어요.\n✅ 오른쪽에 있어요. (위치를 나타낼 때 '에'를 꼭 붙여요)", en: "❌ 왼쪽에 돌아요.\n✅ 왼쪽으로 돌아요. (Use 으로 for direction of movement, not 에!)\n\n❌ 오른쪽 있어요.\n✅ 오른쪽에 있어요. (Don't forget 에 — it marks the location!)", es: "❌ 왼쪽에 돌아요.\n✅ 왼쪽으로 돌아요. (Usa 으로 para dirección de movimiento, no 에.)\n\n❌ 오른쪽 있어요.\n✅ 오른쪽에 있어요. (No olvides 에, marca la ubicación.)" },
          rudyTip: { ko: "으로 vs 에 — 이 두 조사가 방향의 핵심이야! 이동하는 방향이면 '으로', 있는 위치면 '에'. 이것만 기억하면 길 안내 마스터!", en: "으로 vs 에 — these two particles are the key! 으로 = direction of movement, 에 = static location. Nail these and you'll master Korean directions!", es: "으로 vs 에 — estas dos partículas son la clave. 으로 = dirección de movimiento, 에 = ubicación estática. Domínalas y serás un experto en direcciones coreanas." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___쪽으로 돌아요.", answer: "왼", options: ["왼", "위", "아래"], fullSentence: "왼쪽으로 돌아요.", fullSentenceMeaning: { ko: "왼쪽으로 돌아요.", en: "Turn left.", es: "Gira a la izquierda." } },
          { type: "select", promptWithBlank: "___하세요.", answer: "직진", options: ["직진", "오른쪽", "왼쪽"], fullSentence: "직진하세요.", fullSentenceMeaning: { ko: "직진하세요.", en: "Go straight.", es: "Sigue recto." } },
          { type: "select", promptWithBlank: "오른쪽에 ___요.", answer: "있어", options: ["있어", "없어", "가"], fullSentence: "오른쪽에 있어요.", fullSentenceMeaning: { ko: "오른쪽에 있어요.", en: "It's on your right.", es: "Está a la derecha." } },
          { type: "input", promptWithBlank: "___쪽으로 돌아요.", answer: "오른", fullSentence: "오른쪽으로 돌아요.", fullSentenceMeaning: { ko: "오른쪽으로 돌아요.", en: "Turn right.", es: "Gira a la derecha." } },
          { type: "input", promptWithBlank: "오른쪽 ___ 번째 길로 가세요.", answer: "첫", fullSentence: "오른쪽 첫 번째 길로 가세요.", fullSentenceMeaning: { ko: "오른쪽 첫 번째 길로 가세요.", en: "Take the first street on the right.", es: "Primera calle a la derecha." } },
          { type: "listening", audioText: "오른쪽 첫 번째 길로 가세요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["오른쪽 첫 번째 길로 가세요.", "왼쪽에 있어요.", "오른쪽으로 돌아요.", "직진하세요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Belok kiri.", speechLang: "id-ID", meaning: { ko: "왼쪽으로 돌아요.", en: "Turn left.", es: "Gira a la izquierda." } },
        { text: "Belok kanan.", speechLang: "id-ID", meaning: { ko: "오른쪽으로 돌아요.", en: "Turn right.", es: "Gira a la derecha." } },
        { text: "Jalan lurus terus.", speechLang: "id-ID", meaning: { ko: "직진하세요.", en: "Go straight ahead.", es: "Sigue todo recto." } },
        { text: "Ada di sebelah kiri Anda.", speechLang: "id-ID", meaning: { ko: "왼쪽에 있어요.", en: "It's on your left.", es: "Está a tu izquierda." }, recallRound: true },
        { text: "Ambil jalan pertama di sebelah kanan.", speechLang: "id-ID", meaning: { ko: "오른쪽 첫 번째 길로 가세요.", en: "Take the first street on the right.", es: "Toma la primera calle a la derecha." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "방향 전환: 'Belok kiri/kanan' / 직진: 'Jalan lurus terus' / 위치: 'Ada di sebelah kiri/kanan' / 길 안내: 'Ambil jalan pertama/kedua di sebelah ___'", en: "'Belok kiri/kanan' → turn left/right / 'Jalan lurus terus' → go straight ahead / 'Ada di sebelah kiri/kanan' → it's on your left/right / 'Ambil jalan pertama di sebelah ___' → take the first street", es: "'Belok kiri/kanan' → girar / 'Jalan lurus terus' → seguir recto / 'Ada di sebelah kiri/kanan' → posición / 'Ambil jalan pertama di sebelah ___' → navegación específica" },
          examples: { ko: "Belok kanan di lampu merah. (신호등에서 오른쪽으로 도세요.)\nJalan lurus terus dua blok. (두 블록 직진하세요.)\nBanknya ada di sebelah kiri Anda. (은행은 왼쪽에 있어요.)", en: "Belok kanan di lampu merah. (Turn right at the traffic light.)\nJalan lurus terus dua blok. (Go straight ahead for two blocks.)\nBanknya ada di sebelah kiri Anda. (The bank is on your left.)", es: "Belok kanan di lampu merah. (Gira a la derecha en el semáforo.)\nJalan lurus terus dua blok. (Sigue recto dos cuadras.)\nBanknya ada di sebelah kiri Anda. (El banco está a tu izquierda.)" },
          mistakes: { ko: "❌ Belok ke kiri.\n✅ Belok kiri. ('belok' 다음에 바로 kiri/kanan — 'ke' 필요 없어요!)\n\n❌ Ada di kiri Anda.\n✅ Ada di sebelah kiri Anda. ('sebelah'을 넣으면 '~쪽'이 더 분명해져요)", en: "❌ Belok ke kiri.\n✅ Belok kiri. (No 'ke' needed — just 'Belok kiri/kanan'!)\n\n❌ Jalan lurus saja terus.\n✅ Jalan lurus terus. (Keep it simple — 'lurus terus' is the natural phrase!)", es: "❌ Belok ke kiri.\n✅ Belok kiri. (Sin 'ke' — solo 'Belok kiri/kanan'.)\n\n❌ Ada di kiri Anda.\n✅ Ada di sebelah kiri Anda. (Con 'sebelah' suena más natural para 'al lado/lado'.)" },
          rudyTip: { ko: "인도네시아어 길 안내는 심플해! Belok + 방향, Jalan lurus terus, Ada di sebelah + 방향. 이 세 조합이면 누구든 안내할 수 있어!", en: "Indonesian directions are super simple! Belok + direction, Jalan lurus terus, Ada di sebelah + side. Mix these three and you can guide anyone anywhere!", es: "Las direcciones en indonesio son simples: Belok + dirección, Jalan lurus terus, Ada di sebelah + lado. ¡Con estas tres combinaciones puedes guiar a cualquiera!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Belok ___.", answer: "kiri", options: ["kiri", "atas", "bawah"], fullSentence: "Belok kiri.", fullSentenceMeaning: { ko: "왼쪽으로 돌아요.", en: "Turn left.", es: "Gira a la izquierda." } },
          { type: "select", promptWithBlank: "Jalan ___ terus.", answer: "lurus", options: ["lurus", "kanan", "cepat"], fullSentence: "Jalan lurus terus.", fullSentenceMeaning: { ko: "직진하세요.", en: "Go straight ahead.", es: "Sigue todo recto." } },
          { type: "select", promptWithBlank: "Ada di sebelah ___ Anda.", answer: "kanan", options: ["kanan", "atas", "belakang"], fullSentence: "Ada di sebelah kanan Anda.", fullSentenceMeaning: { ko: "오른쪽에 있어요.", en: "It's on your right.", es: "Está a tu derecha." } },
          { type: "input", promptWithBlank: "Belok ___.", answer: "kanan", fullSentence: "Belok kanan.", fullSentenceMeaning: { ko: "오른쪽으로 돌아요.", en: "Turn right.", es: "Gira a la derecha." } },
          { type: "input", promptWithBlank: "Ambil jalan ___ di sebelah kanan.", answer: "pertama", fullSentence: "Ambil jalan pertama di sebelah kanan.", fullSentenceMeaning: { ko: "오른쪽 첫 번째 길로 가세요.", en: "Take the first street on the right.", es: "Toma la primera calle a la derecha." } },
          { type: "listening", audioText: "Ambil jalan pertama di sebelah kanan.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Ambil jalan pertama di sebelah kanan.", "Ada di sebelah kiri Anda.", "Belok kanan.", "Jalan lurus terus."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "خُشّ شِمال.", speechLang: "ar-EG", meaning: { ko: "khosh shemaal · 왼쪽으로 돌아요.", en: "khosh shemaal · Turn left.", es: "khosh shemaal · Gira a la izquierda.", id: "khosh shemaal · Belok kiri." } },
        { text: "خُشّ يِمين.", speechLang: "ar-EG", meaning: { ko: "khosh yemeen · 오른쪽으로 돌아요.", en: "khosh yemeen · Turn right.", es: "khosh yemeen · Gira a la derecha.", id: "khosh yemeen · Belok kanan." } },
        { text: "امْشي عَلى طول.", speechLang: "ar-EG", meaning: { ko: "emshy 3ala tool · 직진하세요.", en: "emshy 3ala tool · Go straight ahead.", es: "emshy 3ala tool · Sigue todo recto.", id: "emshy 3ala tool · Jalan lurus terus." } },
        { text: "هِيَّ عَلى شِمالَك.", speechLang: "ar-EG", meaning: { ko: "heyya 3ala shemaalak · 왼쪽에 있어요.", en: "heyya 3ala shemaalak · It's on your left.", es: "heyya 3ala shemaalak · Está a tu izquierda.", id: "heyya 3ala shemaalak · Ada di sebelah kiri Anda." }, recallRound: true },
        { text: "خُد أوِّل شارِع عَلى اليِمين.", speechLang: "ar-EG", meaning: { ko: "khod awwel share3 3ala el-yemeen · 오른쪽 첫 번째 길로 가세요.", en: "khod awwel share3 3ala el-yemeen · Take the first street on the right.", es: "khod awwel share3 3ala el-yemeen · Toma la primera calle a la derecha.", id: "khod awwel share3 3ala el-yemeen · Ambil jalan pertama di sebelah kanan." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "방향 전환: 'خُشّ شِمال/يِمين'(khosh shemaal/yemeen, '돌다'는 이집트식 'khosh!') / 직진: 'امْشي عَلى طول'(emshy 3ala tool) / 위치: 'عَلى شِمالَك/يِمينَك'(3ala shemaalak/yemeenak) / 길 안내: 'خُد أوِّل/تاني شارِع عَلى ___'(khod awwel/taani share3 3ala ___)", en: "Turn: 'خُشّ شِمال/يِمين' (khosh shemaal/yemeen) — Egyptians say 'khosh' (lit. 'go into') for 'turn' / Straight: 'امْشي عَلى طول' (emshy 3ala tool, lit. 'walk along the length') / Position: 'عَلى شِمالَك/يِمينَك' (3ala shemaalak/yemeenak) / Directions: 'خُد أوِّل/تاني شارِع عَلى ___' (khod awwel/taani share3 3ala ___, 'take the first/second street on ___')", es: "Girar: 'خُشّ شِمال/يِمين' (khosh shemaal/yemeen) — los egipcios dicen 'khosh' para 'gira' / Recto: 'امْشي عَلى طول' (emshy 3ala tool) / Posición: 'عَلى شِمالَك/يِمينَك' (3ala shemaalak/yemeenak) / Direcciones: 'خُد أوِّل/تاني شارِع عَلى ___' (khod awwel/taani share3 3ala ___)" },
          examples: { ko: "خُشّ يِمين عِنْد الإشارة. (khosh yemeen 3and el-eshaara · 신호등에서 오른쪽으로 도세요.)\nامْشي عَلى طول مَطْرَحين. (emshy 3ala tool matrahein · 두 블록 직진하세요.)\nالبَنْك عَلى شِمالَك. (el-bank 3ala shemaalak · 은행은 왼쪽에 있어요.)", en: "خُشّ يِمين عِنْد الإشارة. (khosh yemeen 3and el-eshaara · Turn right at the traffic light.)\nامْشي عَلى طول مَطْرَحين. (emshy 3ala tool matrahein · Go straight for two blocks.)\nالبَنْك عَلى شِمالَك. (el-bank 3ala shemaalak · The bank is on your left.)", es: "خُشّ يِمين عِنْد الإشارة. (khosh yemeen 3and el-eshaara · Gira a la derecha en el semáforo.)\nامْشي عَلى طول مَطْرَحين. (emshy 3ala tool matrahein · Sigue recto dos cuadras.)\nالبَنْك عَلى شِمالَك. (el-bank 3ala shemaalak · El banco está a tu izquierda.)" },
          mistakes: { ko: "❌ لِفّ يَساراً. (책에 나오는 표준어 'leff yasaaran')\n✅ خُشّ شِمال. (khosh shemaal — 이집트에선 'khosh'랑 'shemaal'을 써요!)\n\n❌ امْشي مُسْتَقيم. (표준어 'mostaqeem')\n✅ امْشي عَلى طول. (emshy 3ala tool — '직진'은 무조건 '3ala tool'!)", en: "❌ لِفّ يَساراً. (textbook MSA 'leff yasaaran')\n✅ خُشّ شِمال. (khosh shemaal — Egyptians use 'khosh' and 'shemaal'!)\n\n❌ امْشي مُسْتَقيم. (MSA 'mostaqeem')\n✅ امْشي عَلى طول. (emshy 3ala tool — 'straight' is always '3ala tool' in Egyptian!)", es: "❌ لِفّ يَساراً. (MSA de libro 'leff yasaaran')\n✅ خُشّ شِمال. (khosh shemaal — los egipcios usan 'khosh' y 'shemaal')\n\n❌ امْشي مُسْتَقيم. (MSA 'mostaqeem')\n✅ امْشي عَلى طول. (emshy 3ala tool — 'recto' siempre es '3ala tool' en egipcio)" },
          rudyTip: { ko: "이집트 길 안내는 심플해! 'خُشّ'(khosh) + 방향, 'عَلى طول'(3ala tool, 직진), 'عَلى ___َك'(3ala ___ak, ~쪽에). 이 세 조합이면 카이로에서 누구든 안내할 수 있어. 'lif/leff'는 잊어버리고 'khosh'만 기억해!", en: "Egyptian directions are super simple! 'خُشّ' (khosh) + side, 'عَلى طول' (3ala tool = straight), 'عَلى ___َك' (3ala ___ak = on your ___). Mix these three and you can guide anyone in Cairo. Forget 'leff' — just remember 'khosh'!", es: "Las direcciones egipcias son simples: 'خُشّ' (khosh) + lado, 'عَلى طول' (3ala tool = recto), 'عَلى ___َك' (3ala ___ak = a tu ___). ¡Con estas tres puedes guiar a cualquiera en El Cairo! Olvida 'leff', solo recuerda 'khosh'." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "خُشّ ___.", answer: "شِمال", options: ["شِمال", "فوق", "تَحْت"], fullSentence: "خُشّ شِمال.", fullSentenceMeaning: { ko: "왼쪽으로 돌아요.", en: "Turn left.", es: "Gira a la izquierda.", id: "Belok kiri." } },
          { type: "select", promptWithBlank: "امْشي عَلى ___.", answer: "طول", options: ["طول", "يِمين", "بِسُرْعة"], fullSentence: "امْشي عَلى طول.", fullSentenceMeaning: { ko: "직진하세요.", en: "Go straight ahead.", es: "Sigue todo recto.", id: "Jalan lurus terus." } },
          { type: "select", promptWithBlank: "هِيَّ عَلى ___َك.", answer: "يِمين", options: ["يِمين", "فوق", "وَرا"], fullSentence: "هِيَّ عَلى يِمينَك.", fullSentenceMeaning: { ko: "오른쪽에 있어요.", en: "It's on your right.", es: "Está a tu derecha.", id: "Ada di sebelah kanan Anda." } },
          { type: "input", promptWithBlank: "خُشّ ___.", answer: "يِمين", fullSentence: "خُشّ يِمين.", fullSentenceMeaning: { ko: "오른쪽으로 돌아요.", en: "Turn right.", es: "Gira a la derecha.", id: "Belok kanan." } },
          { type: "input", promptWithBlank: "خُد ___ شارِع عَلى اليِمين.", answer: "أوِّل", fullSentence: "خُد أوِّل شارِع عَلى اليِمين.", fullSentenceMeaning: { ko: "오른쪽 첫 번째 길로 가세요.", en: "Take the first street on the right.", es: "Toma la primera calle a la derecha.", id: "Ambil jalan pertama di sebelah kanan." } },
          { type: "listening", audioText: "خُد أوِّل شارِع عَلى اليِمين.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["خُد أوِّل شارِع عَلى اليِمين.", "هِيَّ عَلى شِمالَك.", "خُشّ يِمين.", "امْشي عَلى طول."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 21: More Directions (Advanced) ────────────────────────
  day_21: {
    english: {
      step1Sentences: [
        { text: "Cross the bridge.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
        { text: "It's next to the convenience store.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "편의점 옆에 있어요.", en: "It's next to the convenience store.", es: "Está al lado de la tienda." } },
        { text: "You passed it — go back.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "지나쳤어요 — 돌아가세요.", en: "You passed it — go back.", es: "Lo pasaste — vuelve atrás." } },
        { text: "At the intersection, turn right.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "교차로에서 오른쪽으로 도세요.", en: "At the intersection, turn right.", es: "En el cruce, gira a la derecha." }, recallRound: true },
        { text: "Take exit three from the subway.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "지하철 3번 출구로 나오세요.", en: "Take exit three from the subway.", es: "Toma la salida tres del metro." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "건너기: 'Cross ___' / 옆: 'next to ___' / 되돌아가기: 'go back' / 교차로: 'At the intersection, turn ___' / 출구: 'Take exit ___ from the subway'", en: "'Cross ___' → go over / 'next to ___' → beside / 'go back' → return / 'At the intersection, turn ___' → crossroads / 'Take exit ___' → subway exits", es: "'Cross ___' → cruzar / 'next to ___' → al lado de / 'go back' → volver / 'At the intersection' → en el cruce / 'Take exit ___' → tomar la salida" },
          examples: { ko: "Cross the street at the crosswalk. (횡단보도에서 길을 건너세요.)\nThe restaurant is next to the bank. (식당은 은행 옆에 있어요.)\nTake exit five from the subway. (지하철 5번 출구로 나오세요.)", en: "Cross the street at the crosswalk. (Go over at the pedestrian crossing.)\nThe restaurant is next to the bank. (It's right beside the bank.)\nTake exit five from the subway. (Use exit number five.)", es: "Cross the street at the crosswalk. (Cruza en el paso de peatones.)\nThe restaurant is next to the bank. (El restaurante está al lado del banco.)\nTake exit five from the subway. (Toma la salida cinco del metro.)" },
          mistakes: { ko: "❌ Cross over the bridge.\n✅ Cross the bridge. (cross 자체가 '건너다'라서 over 안 써도 돼요!)\n\n❌ It's next the store.\n✅ It's next to the store. ('next to'가 한 세트예요, to를 빼면 안 돼요!)", en: "❌ Cross over the bridge.\n✅ Cross the bridge. ('Cross' already means 'go over' — no need for 'over'!)\n\n❌ It's next the store.\n✅ It's next to the store. ('Next to' is a fixed phrase — don't drop 'to'!)", es: "❌ Cross over the bridge.\n✅ Cross the bridge. ('Cross' ya significa cruzar, no necesitas 'over'.)\n\n❌ It's next the store.\n✅ It's next to the store. ('Next to' es una frase fija, no quites 'to'.)" },
          rudyTip: { ko: "고급 길 안내의 비밀은 랜드마크야! 'Cross the bridge', 'next to the bank' — 건물과 장소를 기준점으로 쓰면 훨씬 정확한 안내가 돼!", en: "The secret to advanced directions? Landmarks! 'Cross the bridge', 'next to the bank' — using buildings and places as reference points makes directions crystal clear!", es: "El secreto de las direcciones avanzadas son los puntos de referencia. 'Cross the bridge', 'next to the bank' — usar edificios como referencia hace las direcciones mucho más claras." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ the bridge.", answer: "Cross", options: ["Cross", "Turn", "Take"], fullSentence: "Cross the bridge.", fullSentenceMeaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
          { type: "select", promptWithBlank: "It's ___ to the convenience store.", answer: "next", options: ["next", "near", "close"], fullSentence: "It's next to the convenience store.", fullSentenceMeaning: { ko: "편의점 옆에 있어요.", en: "It's next to the convenience store.", es: "Está al lado de la tienda." } },
          { type: "select", promptWithBlank: "You passed it — go ___.", answer: "back", options: ["back", "front", "up"], fullSentence: "You passed it — go back.", fullSentenceMeaning: { ko: "지나쳤어요 — 돌아가세요.", en: "You passed it — go back.", es: "Lo pasaste — vuelve." } },
          { type: "input", promptWithBlank: "At the ___, turn right.", answer: "intersection", fullSentence: "At the intersection, turn right.", fullSentenceMeaning: { ko: "교차로에서 오른쪽으로.", en: "At the intersection, turn right.", es: "En el cruce, gira a la derecha." } },
          { type: "input", promptWithBlank: "Take ___ three from the subway.", answer: "exit", fullSentence: "Take exit three from the subway.", fullSentenceMeaning: { ko: "지하철 3번 출구로 나오세요.", en: "Take exit three from the subway.", es: "Toma la salida tres del metro." } },
          { type: "listening", audioText: "Take exit three from the subway.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Take exit three from the subway.", "At the intersection, turn right.", "Cross the bridge.", "It's next to the convenience store."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "Cruza el puente.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
        { text: "Está al lado de la tienda.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "편의점 옆에 있어요.", en: "It's next to the store.", es: "Está al lado de la tienda." } },
        { text: "Lo pasaste — vuelve atrás.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "지나쳤어요 — 돌아가세요.", en: "You passed it — go back.", es: "Lo pasaste — vuelve atrás." } },
        { text: "En el cruce, gira a la derecha.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "교차로에서 오른쪽으로 도세요.", en: "At the intersection, turn right.", es: "En el cruce, gira a la derecha." }, recallRound: true },
        { text: "Toma la salida tres del metro.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "지하철 3번 출구로 나오세요.", en: "Take exit three from the subway.", es: "Toma la salida tres del metro." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "건너기: 'Cruza ___' / 옆: 'al lado de ___' / 되돌아가기: 'vuelve atrás' / 교차로: 'En el cruce, gira a la ___' / 출구: 'Toma la salida ___'", en: "'Cruza ___' → cross / 'al lado de ___' → next to / 'vuelve atrás' → go back / 'En el cruce, gira a la ___' → at the intersection / 'Toma la salida ___' → take exit", es: "'Cruza ___' → cruzar / 'al lado de ___' → junto a / 'vuelve atrás' → regresar / 'En el cruce, gira a la ___' → en la intersección / 'Toma la salida ___' → tomar salida" },
          examples: { ko: "Cruza la calle en el paso de peatones. (횡단보도에서 길을 건너세요.)\nEl restaurante está al lado del banco. (식당은 은행 옆에 있어요.)\nToma la salida cinco del metro. (지하철 5번 출구로 나오세요.)", en: "Cruza la calle en el paso de peatones. (Cross the street at the crosswalk.)\nEl restaurante está al lado del banco. (The restaurant is next to the bank.)\nToma la salida cinco del metro. (Take exit five from the subway.)", es: "Cruza la calle en el paso de peatones. (Cruzar en el paso peatonal.)\nEl restaurante está al lado del banco. (Indicar que está junto al banco.)\nToma la salida cinco del metro. (Usar la salida número cinco.)" },
          mistakes: { ko: "❌ Está a lado del banco.\n✅ Está al lado del banco. ('al lado de'가 올바른 표현이에요, 'a'가 아니라 'al'!)\n\n❌ En el cruce, gira la derecha.\n✅ En el cruce, gira a la derecha. ('a la'를 잊지 마세요!)", en: "❌ Está a lado del banco.\n✅ Está al lado del banco. (It's 'al lado de', not 'a lado de'!)\n\n❌ Vuelve a atrás.\n✅ Vuelve atrás. (No extra 'a' needed — just 'vuelve atrás'!)", es: "❌ Está a lado del banco.\n✅ Está al lado del banco. (Es 'al lado de', no 'a lado de'.)\n\n❌ Vuelve a atrás.\n✅ Vuelve atrás. (No necesitas 'a' extra, solo 'vuelve atrás'.)" },
          rudyTip: { ko: "스페인어 고급 방향에서 'al lado de'는 정말 많이 쓰여! 영어의 'next to'랑 같은데, 'al'을 빼먹으면 틀려. 항상 'al lado de'로 기억해둬!", en: "'Al lado de' is the most useful advanced direction phrase in Spanish — it's like 'next to'. Just remember: always 'al', never just 'a'. This tiny detail makes you sound like a pro!", es: "'Al lado de' es la frase más útil para direcciones avanzadas. Recuerda: siempre 'al', nunca solo 'a'. Este pequeño detalle te hace sonar como un experto." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ el puente.", answer: "Cruza", options: ["Cruza", "Gira", "Toma"], fullSentence: "Cruza el puente.", fullSentenceMeaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
          { type: "select", promptWithBlank: "Está al ___ de la tienda.", answer: "lado", options: ["lado", "cerca", "frente"], fullSentence: "Está al lado de la tienda.", fullSentenceMeaning: { ko: "편의점 옆에 있어요.", en: "It's next to the store.", es: "Está al lado de la tienda." } },
          { type: "select", promptWithBlank: "Lo pasaste — vuelve ___.", answer: "atrás", options: ["atrás", "adelante", "arriba"], fullSentence: "Lo pasaste — vuelve atrás.", fullSentenceMeaning: { ko: "지나쳤어요 — 돌아가세요.", en: "You passed it — go back.", es: "Lo pasaste — vuelve atrás." } },
          { type: "input", promptWithBlank: "En el ___, gira a la derecha.", answer: "cruce", fullSentence: "En el cruce, gira a la derecha.", fullSentenceMeaning: { ko: "교차로에서 오른쪽으로.", en: "At the intersection, turn right.", es: "En el cruce, gira a la derecha." } },
          { type: "input", promptWithBlank: "Toma la ___ tres del metro.", answer: "salida", fullSentence: "Toma la salida tres del metro.", fullSentenceMeaning: { ko: "지하철 3번 출구로.", en: "Take exit three.", es: "Toma la salida tres del metro." } },
          { type: "listening", audioText: "Toma la salida tres del metro.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Toma la salida tres del metro.", "En el cruce, gira a la derecha.", "Cruza el puente.", "Está al lado de la tienda."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "다리를 건너세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
        { text: "편의점 옆에 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "편의점 옆에 있어요.", en: "It's next to the convenience store.", es: "Está al lado de la tienda." } },
        { text: "지나쳤어요 — 돌아가세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "지나쳤어요 — 돌아가세요.", en: "You passed it — go back.", es: "Lo pasaste — vuelve." } },
        { text: "교차로에서 오른쪽으로 도세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "교차로에서 오른쪽으로 도세요.", en: "At the intersection, turn right.", es: "En el cruce, gira a la derecha." }, recallRound: true },
        { text: "지하철 3번 출구로 나오세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "지하철 3번 출구로 나오세요.", en: "Take exit three from the subway.", es: "Toma la salida tres del metro." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "건너기: '___를 건너세요' / 옆: '___옆에 있어요' / 되돌아가기: '돌아가세요' / 교차로: '교차로에서 ___쪽으로 도세요' / 출구: '___번 출구로 나오세요'", en: "'___를 건너세요' → cross / '옆에 있어요' → next to / '돌아가세요' → go back / '교차로에서' → at the intersection / '___번 출구로 나오세요' → take exit number", es: "'___를 건너세요' → cruza / '옆에 있어요' → al lado / '돌아가세요' → vuelve / '교차로에서' → en el cruce / '___번 출구로 나오세요' → tomar salida" },
          examples: { ko: "횡단보도에서 길을 건너세요. (횡단보도 기준 안내)\n식당은 은행 옆에 있어요. (랜드마크 기준 위치 설명)\n지하철 5번 출구로 나오세요. (출구 안내)", en: "횡단보도에서 길을 건너세요. (Cross the street at the crosswalk.)\n식당은 은행 옆에 있어요. (The restaurant is next to the bank.)\n지하철 5번 출구로 나오세요. (Take exit 5 from the subway.)", es: "횡단보도에서 길을 건너세요. (Cruza en el paso de peatones.)\n식당은 은행 옆에 있어요. (El restaurante está al lado del banco.)\n지하철 5번 출구로 나오세요. (Toma la salida 5 del metro.)" },
          mistakes: { ko: "❌ 다리 건너세요.\n✅ 다리를 건너세요. (목적어에 '를/을' 조사를 꼭 붙여요!)\n\n❌ 편의점 옆 있어요.\n✅ 편의점 옆에 있어요. ('옆에'에서 '에'를 빼면 안 돼요!)", en: "❌ 다리 건너세요.\n✅ 다리를 건너세요. (Don't drop 를 — it marks the object you're crossing!)\n\n❌ 편의점 옆 있어요.\n✅ 편의점 옆에 있어요. (에 is needed after 옆 to mark location!)", es: "❌ 다리 건너세요.\n✅ 다리를 건너세요. (No olvides 를, marca el objeto que cruzas.)\n\n❌ 편의점 옆 있어요.\n✅ 편의점 옆에 있어요. (에 es necesario después de 옆 para indicar ubicación.)" },
          rudyTip: { ko: "한국어 고급 방향의 핵심은 조사야! '를 건너세요', '옆에 있어요', '으로 나오세요' — 조사 하나가 문장의 의미를 완전히 바꿔. 조사를 빼먹지 않는 게 자연스러운 한국어의 비결이야!", en: "Korean advanced directions are all about particles! 를 건너세요, 옆에 있어요, 으로 나오세요 — one little particle changes the whole meaning. Never skip them!", es: "Las direcciones avanzadas en coreano dependen de las partículas. 를 건너세요, 옆에 있어요, 으로 나오세요 — una partícula cambia todo el significado. Nunca las omitas." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "다리를 ___세요.", answer: "건너", options: ["건너", "돌아", "나오"], fullSentence: "다리를 건너세요.", fullSentenceMeaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
          { type: "select", promptWithBlank: "편의점 ___에 있어요.", answer: "옆", options: ["옆", "안", "위"], fullSentence: "편의점 옆에 있어요.", fullSentenceMeaning: { ko: "편의점 옆에 있어요.", en: "Next to the store.", es: "Al lado de la tienda." } },
          { type: "select", promptWithBlank: "지나쳤어요 — ___가세요.", answer: "돌아", options: ["돌아", "직진", "올라"], fullSentence: "지나쳤어요 — 돌아가세요.", fullSentenceMeaning: { ko: "지나쳤어요 — 돌아가세요.", en: "You passed it — go back.", es: "Lo pasaste — vuelve." } },
          { type: "input", promptWithBlank: "___에서 오른쪽으로 도세요.", answer: "교차로", fullSentence: "교차로에서 오른쪽으로 도세요.", fullSentenceMeaning: { ko: "교차로에서 오른쪽으로.", en: "At the intersection, turn right.", es: "En el cruce, gira." } },
          { type: "input", promptWithBlank: "지하철 3번 ___로 나오세요.", answer: "출구", fullSentence: "지하철 3번 출구로 나오세요.", fullSentenceMeaning: { ko: "지하철 3번 출구로.", en: "Take exit 3.", es: "Salida 3 del metro." } },
          { type: "listening", audioText: "지하철 3번 출구로 나오세요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["지하철 3번 출구로 나오세요.", "교차로에서 오른쪽으로 도세요.", "다리를 건너세요.", "편의점 옆에 있어요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Seberangi jembatan.", speechLang: "id-ID", meaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
        { text: "Tempatnya di sebelah minimarket.", speechLang: "id-ID", meaning: { ko: "편의점 옆에 있어요.", en: "It's next to the convenience store.", es: "Está al lado de la tienda." } },
        { text: "Anda sudah melewatinya — kembali lagi.", speechLang: "id-ID", meaning: { ko: "지나쳤어요 — 돌아가세요.", en: "You passed it — go back.", es: "Lo pasaste — vuelve atrás." } },
        { text: "Di persimpangan, belok kanan.", speechLang: "id-ID", meaning: { ko: "교차로에서 오른쪽으로 도세요.", en: "At the intersection, turn right.", es: "En el cruce, gira a la derecha." }, recallRound: true },
        { text: "Keluar dari pintu keluar tiga di stasiun.", speechLang: "id-ID", meaning: { ko: "지하철 3번 출구로 나오세요.", en: "Take exit three from the subway.", es: "Toma la salida tres del metro." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "건너기: 'Seberangi ___' / 옆: 'di sebelah ___' / 되돌아가기: 'kembali lagi' / 교차로: 'Di persimpangan, belok ___' / 출구: 'Keluar dari pintu keluar ___'", en: "'Seberangi ___' → cross / 'di sebelah ___' → next to / 'kembali lagi' → go back / 'Di persimpangan, belok ___' → at the intersection / 'Keluar dari pintu keluar ___' → take exit number", es: "'Seberangi ___' → cruzar / 'di sebelah ___' → al lado de / 'kembali lagi' → volver / 'Di persimpangan, belok ___' → en el cruce / 'Keluar dari pintu keluar ___' → tomar la salida" },
          examples: { ko: "Seberangi jalan di zebra cross. (횡단보도에서 길을 건너세요.)\nRestorannya di sebelah bank. (식당은 은행 옆에 있어요.)\nKeluar dari pintu keluar lima di stasiun. (지하철 5번 출구로 나오세요.)", en: "Seberangi jalan di zebra cross. (Cross the street at the crosswalk.)\nRestorannya di sebelah bank. (The restaurant is next to the bank.)\nKeluar dari pintu keluar lima di stasiun. (Take exit five from the subway.)", es: "Seberangi jalan di zebra cross. (Cruza en el paso de peatones.)\nRestorannya di sebelah bank. (El restaurante está al lado del banco.)\nKeluar dari pintu keluar lima di stasiun. (Toma la salida cinco del metro.)" },
          mistakes: { ko: "❌ Seberangi di jembatan.\n✅ Seberangi jembatan. ('seberangi' 자체가 '건너다'라서 'di' 안 써도 돼요!)\n\n❌ Tempatnya sebelah minimarket.\n✅ Tempatnya di sebelah minimarket. ('di sebelah'가 한 세트예요, 'di'를 빼면 안 돼요!)", en: "❌ Seberangi di jembatan.\n✅ Seberangi jembatan. ('Seberangi' already means 'cross over' — no 'di' needed!)\n\n❌ Tempatnya sebelah minimarket.\n✅ Tempatnya di sebelah minimarket. ('Di sebelah' is a fixed phrase — don't drop 'di'!)", es: "❌ Seberangi di jembatan.\n✅ Seberangi jembatan. ('Seberangi' ya significa cruzar, no necesitas 'di'.)\n\n❌ Tempatnya sebelah minimarket.\n✅ Tempatnya di sebelah minimarket. ('Di sebelah' es una frase fija, no quites 'di'.)" },
          rudyTip: { ko: "고급 길 안내의 비밀은 랜드마크야! 'Seberangi jembatan', 'di sebelah bank' — 건물을 기준점으로 쓰면 훨씬 정확한 안내가 돼!", en: "The secret to advanced directions? Landmarks! 'Seberangi jembatan', 'di sebelah bank' — using buildings as reference points makes directions crystal clear!", es: "El secreto de las direcciones avanzadas son los puntos de referencia. 'Seberangi jembatan', 'di sebelah bank' — usar edificios como referencia hace las direcciones mucho más claras." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ jembatan.", answer: "Seberangi", options: ["Seberangi", "Belok", "Ambil"], fullSentence: "Seberangi jembatan.", fullSentenceMeaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
          { type: "select", promptWithBlank: "Tempatnya di ___ minimarket.", answer: "sebelah", options: ["sebelah", "dekat", "depan"], fullSentence: "Tempatnya di sebelah minimarket.", fullSentenceMeaning: { ko: "편의점 옆에 있어요.", en: "It's next to the convenience store.", es: "Está al lado de la tienda." } },
          { type: "select", promptWithBlank: "Anda sudah melewatinya — ___ lagi.", answer: "kembali", options: ["kembali", "maju", "naik"], fullSentence: "Anda sudah melewatinya — kembali lagi.", fullSentenceMeaning: { ko: "지나쳤어요 — 돌아가세요.", en: "You passed it — go back.", es: "Lo pasaste — vuelve atrás." } },
          { type: "input", promptWithBlank: "Di ___, belok kanan.", answer: "persimpangan", fullSentence: "Di persimpangan, belok kanan.", fullSentenceMeaning: { ko: "교차로에서 오른쪽으로.", en: "At the intersection, turn right.", es: "En el cruce, gira a la derecha." } },
          { type: "input", promptWithBlank: "Keluar dari pintu ___ tiga di stasiun.", answer: "keluar", fullSentence: "Keluar dari pintu keluar tiga di stasiun.", fullSentenceMeaning: { ko: "지하철 3번 출구로 나오세요.", en: "Take exit three from the subway.", es: "Toma la salida tres del metro." } },
          { type: "listening", audioText: "Keluar dari pintu keluar tiga di stasiun.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Keluar dari pintu keluar tiga di stasiun.", "Di persimpangan, belok kanan.", "Seberangi jembatan.", "Tempatnya di sebelah minimarket."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "اعْدي الكُوبْري.", speechLang: "ar-EG", meaning: { ko: "e3dy el-kobry · 다리를 건너세요.", en: "e3dy el-kobry · Cross the bridge.", es: "e3dy el-kobry · Cruza el puente.", id: "e3dy el-kobry · Seberangi jembatan." } },
        { text: "هِيَّ جَنْب البَقّالة.", speechLang: "ar-EG", meaning: { ko: "heyya ganb el-ba''aala · 편의점 옆에 있어요.", en: "heyya ganb el-ba''aala · It's next to the convenience store.", es: "heyya ganb el-ba''aala · Está al lado de la tienda.", id: "heyya ganb el-ba''aala · Tempatnya di sebelah minimarket." } },
        { text: "إنْتَ فُتّها — ارْجَع تاني.", speechLang: "ar-EG", meaning: { ko: "enta fottaha — erga3 taani · 지나쳤어요 — 돌아가세요.", en: "enta fottaha — erga3 taani · You passed it — go back.", es: "enta fottaha — erga3 taani · Lo pasaste — vuelve atrás.", id: "enta fottaha — erga3 taani · Anda sudah melewatinya — kembali lagi." } },
        { text: "عِنْد التَّقاطُع، خُشّ يِمين.", speechLang: "ar-EG", meaning: { ko: "3and el-ta'aato3, khosh yemeen · 교차로에서 오른쪽으로 도세요.", en: "3and el-ta'aato3, khosh yemeen · At the intersection, turn right.", es: "3and el-ta'aato3, khosh yemeen · En el cruce, gira a la derecha.", id: "3and el-ta'aato3, khosh yemeen · Di persimpangan, belok kanan." }, recallRound: true },
        { text: "اطْلَع مِن مَخْرَج تَلاتة في المِترو.", speechLang: "ar-EG", meaning: { ko: "etla3 men makhrag talaata fel-metro · 지하철 3번 출구로 나오세요.", en: "etla3 men makhrag talaata fel-metro · Take exit three from the subway.", es: "etla3 men makhrag talaata fel-metro · Toma la salida tres del metro.", id: "etla3 men makhrag talaata fel-metro · Keluar dari pintu keluar tiga di stasiun." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "건너기: 'اعْدي ___'(e3dy ___, '건너다'는 이집트식 'e3dy!') / 옆: 'جَنْب ___'(ganb ___) / 되돌아가기: 'ارْجَع تاني'(erga3 taani) / 교차로: 'عِنْد التَّقاطُع، خُشّ ___'(3and el-ta'aato3, khosh ___) / 출구: 'اطْلَع مِن مَخْرَج ___'(etla3 men makhrag ___)", en: "Cross: 'اعْدي ___' (e3dy ___) — Egyptians say 'e3dy' for 'cross over' / Next to: 'جَنْب ___' (ganb ___) / Go back: 'ارْجَع تاني' (erga3 taani, lit. 'return again') / Intersection: 'عِنْد التَّقاطُع، خُشّ ___' (3and el-ta'aato3, khosh ___) / Exit: 'اطْلَع مِن مَخْرَج ___' (etla3 men makhrag ___, 'take/go out exit ___')", es: "Cruzar: 'اعْدي ___' (e3dy ___) — los egipcios dicen 'e3dy' para 'cruza' / Al lado: 'جَنْب ___' (ganb ___) / Volver: 'ارْجَع تاني' (erga3 taani) / Cruce: 'عِنْد التَّقاطُع، خُشّ ___' (3and el-ta'aato3, khosh ___) / Salida: 'اطْلَع مِن مَخْرَج ___' (etla3 men makhrag ___)" },
          examples: { ko: "اعْدي الشارِع مِن عَلى الزِّبْرة. (e3dy el-share3 men 3ala el-zebra · 횡단보도에서 길을 건너세요.)\nالمَطْعَم جَنْب البَنْك. (el-mat3am ganb el-bank · 식당은 은행 옆에 있어요.)\nاطْلَع مِن مَخْرَج خَمْسة في المِترو. (etla3 men makhrag khamsa fel-metro · 지하철 5번 출구로 나오세요.)", en: "اعْدي الشارِع مِن عَلى الزِّبْرة. (e3dy el-share3 men 3ala el-zebra · Cross the street at the crosswalk.)\nالمَطْعَم جَنْب البَنْك. (el-mat3am ganb el-bank · The restaurant is next to the bank.)\nاطْلَع مِن مَخْرَج خَمْسة في المِترو. (etla3 men makhrag khamsa fel-metro · Take exit five from the subway.)", es: "اعْدي الشارِع مِن عَلى الزِّبْرة. (e3dy el-share3 men 3ala el-zebra · Cruza en el paso de peatones.)\nالمَطْعَم جَنْب البَنْك. (el-mat3am ganb el-bank · El restaurante está al lado del banco.)\nاطْلَع مِن مَخْرَج خَمْسة في المِترو. (etla3 men makhrag khamsa fel-metro · Toma la salida cinco del metro.)" },
          mistakes: { ko: "❌ اعْبُر الكوبري. (책에 나오는 표준어 'o3bor')\n✅ اعْدي الكُوبْري. (e3dy el-kobry — 이집트에선 'e3dy'를 써요!)\n\n❌ هِيَّ بِجانِب البَقّالة. (표준어 'bejaaneb')\n✅ هِيَّ جَنْب البَقّالة. (heyya ganb el-ba''aala — '옆'은 무조건 'ganb'!)", en: "❌ اعْبُر الكوبري. (textbook MSA 'o3bor')\n✅ اعْدي الكُوبْري. (e3dy el-kobry — Egyptians use 'e3dy'!)\n\n❌ هِيَّ بِجانِب البَقّالة. (MSA 'bejaaneb')\n✅ هِيَّ جَنْب البَقّالة. (heyya ganb el-ba''aala — 'next to' is always 'ganb'!)", es: "❌ اعْبُر الكوبري. (MSA de libro 'o3bor')\n✅ اعْدي الكُوبْري. (e3dy el-kobry — los egipcios usan 'e3dy')\n\n❌ هِيَّ بِجانِب البَقّالة. (MSA 'bejaaneb')\n✅ هِيَّ جَنْب البَقّالة. (heyya ganb el-ba''aala — 'al lado' siempre es 'ganb')" },
          rudyTip: { ko: "고급 길 안내의 비밀은 랜드마크야! 'اعْدي الكُوبْري'(e3dy el-kobry, 다리 건너), 'جَنْب البَنْك'(ganb el-bank, 은행 옆) — 건물을 기준점으로 쓰면 훨씬 정확해. 카이로 사람은 'كوبري/kobry'(다리)를 진짜 많이 써!", en: "The secret to advanced directions? Landmarks! 'اعْدي الكُوبْري' (e3dy el-kobry = cross the bridge), 'جَنْب البَنْك' (ganb el-bank = next to the bank). Using buildings as reference makes everything clear — and Cairenes love 'كوبري' (kobry = bridge)!", es: "El secreto de las direcciones avanzadas son los puntos de referencia: 'اعْدي الكُوبْري' (e3dy el-kobry = cruza el puente), 'جَنْب البَنْك' (ganb el-bank = al lado del banco). ¡Los cairotas usan mucho 'كوبري' (kobry = puente)!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ الكُوبْري.", answer: "اعْدي", options: ["اعْدي", "خُشّ", "خُد"], fullSentence: "اعْدي الكُوبْري.", fullSentenceMeaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente.", id: "Seberangi jembatan." } },
          { type: "select", promptWithBlank: "هِيَّ ___ البَقّالة.", answer: "جَنْب", options: ["جَنْب", "قُرَيِّب", "وَرا"], fullSentence: "هِيَّ جَنْب البَقّالة.", fullSentenceMeaning: { ko: "편의점 옆에 있어요.", en: "It's next to the convenience store.", es: "Está al lado de la tienda.", id: "Tempatnya di sebelah minimarket." } },
          { type: "select", promptWithBlank: "إنْتَ فُتّها — ___ تاني.", answer: "ارْجَع", options: ["ارْجَع", "كَمِّل", "اطْلَع"], fullSentence: "إنْتَ فُتّها — ارْجَع تاني.", fullSentenceMeaning: { ko: "지나쳤어요 — 돌아가세요.", en: "You passed it — go back.", es: "Lo pasaste — vuelve atrás.", id: "Anda sudah melewatinya — kembali lagi." } },
          { type: "input", promptWithBlank: "عِنْد ___، خُشّ يِمين.", answer: "التَّقاطُع", fullSentence: "عِنْد التَّقاطُع، خُشّ يِمين.", fullSentenceMeaning: { ko: "교차로에서 오른쪽으로.", en: "At the intersection, turn right.", es: "En el cruce, gira a la derecha.", id: "Di persimpangan, belok kanan." } },
          { type: "input", promptWithBlank: "اطْلَع مِن ___ تَلاتة في المِترو.", answer: "مَخْرَج", fullSentence: "اطْلَع مِن مَخْرَج تَلاتة في المِترو.", fullSentenceMeaning: { ko: "지하철 3번 출구로 나오세요.", en: "Take exit three from the subway.", es: "Toma la salida tres del metro.", id: "Keluar dari pintu keluar tiga di stasiun." } },
          { type: "listening", audioText: "اطْلَع مِن مَخْرَج تَلاتة في المِترو.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["اطْلَع مِن مَخْرَج تَلاتة في المِترو.", "عِنْد التَّقاطُع، خُشّ يِمين.", "اعْدي الكُوبْري.", "هِيَّ جَنْب البَقّالة."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 22: Transportation ────────────────────────────────────
  day_22: {
    english: {
      step1Sentences: [
        { text: "Can I get a taxi, please?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "택시 불러주세요.", en: "Can I get a taxi, please?", es: "¿Me puede llamar un taxi?" } },
        { text: "To the airport, please.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "공항으로 가주세요.", en: "To the airport, please.", es: "Al aeropuerto, por favor." } },
        { text: "How much to the city center?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "시내까지 얼마예요?", en: "How much to the city center?", es: "¿Cuánto cuesta ir al centro?" } },
        { text: "One ticket to Seoul Station, please.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "서울역 표 한 장 주세요.", en: "One ticket to Seoul Station, please.", es: "Un billete para la Estación Central, por favor." }, recallRound: true },
        { text: "Does this bus go to the museum?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "이 버스 박물관에 가나요?", en: "Does this bus go to the museum?", es: "¿Este autobús va al museo?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "택시: 'Can I get a taxi?' / 목적지: 'To ___, please.' / 가격: 'How much to ___?' / 표: 'One ticket to ___, please.' / 버스 확인: 'Does this bus go to ___?'", en: "'Can I get a taxi?' → request / 'To ___, please.' → destination / 'How much to ___?' → price / 'One ticket to ___' → buy ticket / 'Does this bus go to ___?' → confirm route", es: "'Can I get a taxi?' → pedir taxi / 'To ___, please.' → destino / 'How much to ___?' → precio / 'One ticket to ___' → comprar billete / 'Does this bus go to ___?' → confirmar ruta" },
          examples: { ko: "Can I get a taxi to downtown? (시내까지 택시 불러주세요.)\nHow much to the train station? (기차역까지 얼마예요?)\nDoes this bus go to the airport? (이 버스 공항에 가나요?)", en: "Can I get a taxi to downtown? (Requesting a taxi to the center.)\nHow much to the train station? (Asking the fare before riding.)\nDoes this bus go to the airport? (Confirming the bus route.)", es: "Can I get a taxi to downtown? (¿Me puede conseguir un taxi al centro?)\nHow much to the train station? (¿Cuánto cuesta ir a la estación?)\nDoes this bus go to the airport? (¿Este autobús va al aeropuerto?)" },
          mistakes: { ko: "❌ How much is to the airport?\n✅ How much to the airport? (is 없이 바로 'How much to'가 자연스러워요!)\n\n❌ Does this bus goes to the museum?\n✅ Does this bus go to the museum? (Does 뒤에는 동사원형 go를 써요!)", en: "❌ How much is to the airport?\n✅ How much to the airport? (Drop the 'is' — it's more natural without it!)\n\n❌ Does this bus goes to the museum?\n✅ Does this bus go to the museum? (After 'Does', use base form 'go', not 'goes'!)", es: "❌ How much is to the airport?\n✅ How much to the airport? (Quita 'is', es más natural sin ella.)\n\n❌ Does this bus goes to the museum?\n✅ Does this bus go to the museum? (Después de 'Does', usa la forma base 'go', no 'goes'.)" },
          rudyTip: { ko: "교통수단 영어의 핵심은 'to'야! To the airport, to the station — 목적지 앞에 항상 'to'를 붙이면 어디든 갈 수 있어. 택시든 버스든 기차든!", en: "The magic word for transport English is 'to'! To the airport, to the station — just stick 'to' before your destination and you're good to go, whether it's a taxi, bus, or train!", es: "La palabra mágica del transporte en inglés es 'to'. To the airport, to the station — solo pon 'to' antes del destino y listo, ya sea taxi, autobús o tren." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Can I ___ a taxi, please?", answer: "get", options: ["get", "go", "take"], fullSentence: "Can I get a taxi, please?", fullSentenceMeaning: { ko: "택시 불러주세요.", en: "Can I get a taxi?", es: "¿Un taxi, por favor?" } },
          { type: "select", promptWithBlank: "___ the airport, please.", answer: "To", options: ["To", "At", "In"], fullSentence: "To the airport, please.", fullSentenceMeaning: { ko: "공항으로 가주세요.", en: "To the airport, please.", es: "Al aeropuerto, por favor." } },
          { type: "select", promptWithBlank: "Does this bus ___ to the museum?", answer: "go", options: ["go", "come", "take"], fullSentence: "Does this bus go to the museum?", fullSentenceMeaning: { ko: "이 버스 박물관에 가나요?", en: "Does this bus go to the museum?", es: "¿Va al museo este bus?" } },
          { type: "input", promptWithBlank: "How ___ to the city center?", answer: "much", fullSentence: "How much to the city center?", fullSentenceMeaning: { ko: "시내까지 얼마예요?", en: "How much to the center?", es: "¿Cuánto al centro?" } },
          { type: "input", promptWithBlank: "One ___ to Seoul Station, please.", answer: "ticket", fullSentence: "One ticket to Seoul Station, please.", fullSentenceMeaning: { ko: "서울역 표 한 장 주세요.", en: "One ticket to Seoul Station.", es: "Un billete a la Estación Central." } },
          { type: "listening", audioText: "Does this bus go to the museum?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Does this bus go to the museum?", "One ticket to Seoul Station, please.", "To the airport, please.", "How much to the city center?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¿Me puede llamar un taxi?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "택시 불러주세요.", en: "Can I get a taxi, please?", es: "¿Me puede llamar un taxi?" } },
        { text: "Al aeropuerto, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "공항으로 가주세요.", en: "To the airport, please.", es: "Al aeropuerto, por favor." } },
        { text: "¿Cuánto cuesta ir al centro?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "시내까지 얼마예요?", en: "How much to the city center?", es: "¿Cuánto cuesta ir al centro?" } },
        { text: "Un billete para la Estación Central, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "중앙역 표 한 장 주세요.", en: "One ticket to Central Station, please.", es: "Un billete para la Estación Central, por favor." }, recallRound: true },
        { text: "¿Este autobús va al museo?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "이 버스 박물관에 가나요?", en: "Does this bus go to the museum?", es: "¿Este autobús va al museo?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "택시: '¿Me puede llamar un taxi?' / 목적지: 'Al ___, por favor.' / 가격: '¿Cuánto cuesta ir a ___?' / 표: 'Un billete para ___' / 버스: '¿Este autobús va a ___?'", en: "'¿Me puede llamar un taxi?' → request taxi / 'Al ___, por favor.' → destination / '¿Cuánto cuesta ir a ___?' → price / 'Un billete para ___' → buy ticket / '¿Este autobús va a ___?' → confirm route", es: "'¿Me puede llamar un taxi?' → pedir taxi / 'Al ___, por favor.' → destino / '¿Cuánto cuesta ir a ___?' → precio / 'Un billete para ___' → billete / '¿Este autobús va a ___?' → confirmar ruta" },
          examples: { ko: "¿Me puede llamar un taxi al centro? (시내까지 택시 불러주세요.)\n¿Cuánto cuesta ir a la estación? (역까지 얼마예요?)\n¿Este autobús va al aeropuerto? (이 버스 공항에 가나요?)", en: "¿Me puede llamar un taxi al centro? (Can you call me a taxi to downtown?)\n¿Cuánto cuesta ir a la estación? (How much to the station?)\n¿Este autobús va al aeropuerto? (Does this bus go to the airport?)", es: "¿Me puede llamar un taxi al centro? (Pidiendo un taxi al centro.)\n¿Cuánto cuesta ir a la estación? (Preguntando el precio antes de ir.)\n¿Este autobús va al aeropuerto? (Confirmando la ruta del autobús.)" },
          mistakes: { ko: "❌ ¿Cuánto cuesta a ir al centro?\n✅ ¿Cuánto cuesta ir al centro? ('cuesta ir'가 맞아요, 'cuesta a ir'가 아니에요!)\n\n❌ Un billete por la estación.\n✅ Un billete para la estación. (목적지에는 'para'를 써요, 'por'가 아니에요!)", en: "❌ ¿Cuánto cuesta a ir al centro?\n✅ ¿Cuánto cuesta ir al centro? (No 'a' before 'ir' — 'cuesta ir' is correct!)\n\n❌ Un billete por la estación.\n✅ Un billete para la estación. (Use 'para' for destination, not 'por'!)", es: "❌ ¿Cuánto cuesta a ir al centro?\n✅ ¿Cuánto cuesta ir al centro? (Sin 'a' antes de 'ir' — 'cuesta ir' es correcto.)\n\n❌ Un billete por la estación.\n✅ Un billete para la estación. (Usa 'para' para destino, no 'por'.)" },
          rudyTip: { ko: "스페인어 교통의 핵심은 'para' vs 'por'야! 목적지는 항상 'para' — 'un billete para Madrid'. 'por'는 '통해서'라는 뜻이라 전혀 다른 말이 돼!", en: "The key to Spanish transport is 'para' vs 'por'! Destination = always 'para'. 'Un billete para Madrid.' Using 'por' would mean 'through' — totally different meaning!", es: "La clave del transporte en español es 'para' vs 'por'. Destino = siempre 'para'. 'Un billete para Madrid.' Usar 'por' significaría 'a través de', un sentido totalmente diferente." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Me puede ___ un taxi?", answer: "llamar", options: ["llamar", "ir", "tomar"], fullSentence: "¿Me puede llamar un taxi?", fullSentenceMeaning: { ko: "택시 불러주세요.", en: "Can I get a taxi?", es: "¿Un taxi?" } },
          { type: "select", promptWithBlank: "___ aeropuerto, por favor.", answer: "Al", options: ["Al", "En", "De"], fullSentence: "Al aeropuerto, por favor.", fullSentenceMeaning: { ko: "공항으로 가주세요.", en: "To the airport.", es: "Al aeropuerto." } },
          { type: "select", promptWithBlank: "¿Este autobús ___ al museo?", answer: "va", options: ["va", "viene", "sale"], fullSentence: "¿Este autobús va al museo?", fullSentenceMeaning: { ko: "이 버스 박물관 가나요?", en: "Does this bus go to the museum?", es: "¿Va al museo?" } },
          { type: "input", promptWithBlank: "¿Cuánto ___ ir al centro?", answer: "cuesta", fullSentence: "¿Cuánto cuesta ir al centro?", fullSentenceMeaning: { ko: "시내까지 얼마예요?", en: "How much to the center?", es: "¿Cuánto al centro?" } },
          { type: "input", promptWithBlank: "Un ___ para la Estación Central.", answer: "billete", fullSentence: "Un billete para la Estación Central.", fullSentenceMeaning: { ko: "중앙역 표 한 장.", en: "One ticket to Central Station.", es: "Un billete a la Estación." } },
          { type: "listening", audioText: "¿Este autobús va al museo?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Este autobús va al museo?", "Un billete para la Estación Central, por favor.", "Al aeropuerto, por favor.", "¿Cuánto cuesta ir al centro?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "택시 불러주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "택시 불러주세요.", en: "Can I get a taxi, please?", es: "¿Me puede llamar un taxi?" } },
        { text: "공항으로 가주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "공항으로 가주세요.", en: "To the airport, please.", es: "Al aeropuerto, por favor." } },
        { text: "시내까지 얼마예요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "시내까지 얼마예요?", en: "How much to the city center?", es: "¿Cuánto cuesta ir al centro?" } },
        { text: "서울역 표 한 장 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "서울역 표 한 장 주세요.", en: "One ticket to Seoul Station, please.", es: "Un billete a la Estación de Seúl." }, recallRound: true },
        { text: "이 버스 박물관에 가나요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "이 버스 박물관에 가나요?", en: "Does this bus go to the museum?", es: "¿Este autobús va al museo?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "택시: '택시 불러주세요' / 목적지: '___으로 가주세요' / 가격: '___까지 얼마예요?' / 표: '___ 표 한 장 주세요' / 버스 확인: '이 버스 ___에 가나요?'", en: "'택시 불러주세요' → call a taxi / '___으로 가주세요' → go to destination / '___까지 얼마예요?' → ask price / '___ 표 한 장 주세요' → buy ticket / '이 버스 ___에 가나요?' → confirm route", es: "'택시 불러주세요' → pedir taxi / '___으로 가주세요' → ir al destino / '___까지 얼마예요?' → precio / '___ 표 한 장 주세요' → comprar billete / '이 버스 ___에 가나요?' → confirmar ruta" },
          examples: { ko: "시내까지 택시 불러주세요. (택시 요청)\n부산까지 얼마예요? (가격 확인)\n이 버스 공항에 가나요? (노선 확인)", en: "시내까지 택시 불러주세요. (Please call a taxi to downtown.)\n부산까지 얼마예요? (How much to Busan?)\n이 버스 공항에 가나요? (Does this bus go to the airport?)", es: "시내까지 택시 불러주세요. (Pida un taxi al centro.)\n부산까지 얼마예요? (¿Cuánto cuesta a Busan?)\n이 버스 공항에 가나요? (¿Este autobús va al aeropuerto?)" },
          mistakes: { ko: "❌ 공항에서 가주세요.\n✅ 공항으로 가주세요. (목적지는 '으로/로'를 써요, '에서'가 아니에요!)\n\n❌ 서울역 표 한 개 주세요.\n✅ 서울역 표 한 장 주세요. (표는 '장'으로 세요, '개'가 아니에요!)", en: "❌ 공항에서 가주세요.\n✅ 공항으로 가주세요. (Use 으로 for destination, not 에서 — that means 'from'!)\n\n❌ 서울역 표 한 개 주세요.\n✅ 서울역 표 한 장 주세요. (Tickets use counter 장, not 개!)", es: "❌ 공항에서 가주세요.\n✅ 공항으로 가주세요. (Usa 으로 para destino, no 에서, que significa 'desde'.)\n\n❌ 서울역 표 한 개 주세요.\n✅ 서울역 표 한 장 주세요. (Los billetes usan el contador 장, no 개.)" },
          rudyTip: { ko: "한국어 교통의 핵심 조사는 세 개야! '으로' = 방향, '까지' = 도착점, '에' = 위치. '공항으로 가주세요', '시내까지 얼마예요', '박물관에 가나요' — 이 세 개만 알면 서울 교통 마스터!", en: "Three key particles for Korean transport! 으로 = direction, 까지 = destination, 에 = location. Master these three and you'll ride anything in Seoul like a local!", es: "Tres partículas clave para el transporte coreano: 으로 = dirección, 까지 = destino, 에 = ubicación. Domina estas tres y te moverás por Seúl como un local." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "택시 ___주세요.", answer: "불러", options: ["불러", "가", "와"], fullSentence: "택시 불러주세요.", fullSentenceMeaning: { ko: "택시 불러주세요.", en: "Get a taxi, please.", es: "Un taxi, por favor." } },
          { type: "select", promptWithBlank: "공항___로 가주세요.", answer: "으", options: ["으", "에", "을"], fullSentence: "공항으로 가주세요.", fullSentenceMeaning: { ko: "공항으로 가주세요.", en: "To the airport.", es: "Al aeropuerto." } },
          { type: "select", promptWithBlank: "이 버스 박물관에 ___요?", answer: "가나", options: ["가나", "있나", "오나"], fullSentence: "이 버스 박물관에 가나요?", fullSentenceMeaning: { ko: "이 버스 박물관 가나요?", en: "Does this bus go to the museum?", es: "¿Va al museo?" } },
          { type: "input", promptWithBlank: "시내___지 얼마예요?", answer: "까", fullSentence: "시내까지 얼마예요?", fullSentenceMeaning: { ko: "시내까지 얼마예요?", en: "How much to the center?", es: "¿Cuánto al centro?" } },
          { type: "input", promptWithBlank: "서울역 ___ 한 장 주세요.", answer: "표", fullSentence: "서울역 표 한 장 주세요.", fullSentenceMeaning: { ko: "서울역 표 한 장.", en: "One ticket to Seoul Station.", es: "Un billete a Seúl." } },
          { type: "listening", audioText: "이 버스 박물관에 가나요?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["이 버스 박물관에 가나요?", "서울역 표 한 장 주세요.", "공항으로 가주세요.", "시내까지 얼마예요?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Bisakah saya memesan taksi?", speechLang: "id-ID", meaning: { ko: "택시 불러주세요.", en: "Can I get a taxi, please?", es: "¿Me puede llamar un taxi?" } },
        { text: "Ke bandara, tolong.", speechLang: "id-ID", meaning: { ko: "공항으로 가주세요.", en: "To the airport, please.", es: "Al aeropuerto, por favor." } },
        { text: "Berapa ongkos ke pusat kota?", speechLang: "id-ID", meaning: { ko: "시내까지 얼마예요?", en: "How much to the city center?", es: "¿Cuánto cuesta ir al centro?" } },
        { text: "Satu tiket ke Stasiun Seoul, tolong.", speechLang: "id-ID", meaning: { ko: "서울역 표 한 장 주세요.", en: "One ticket to Seoul Station, please.", es: "Un billete para la Estación Central, por favor." }, recallRound: true },
        { text: "Apakah bus ini ke museum?", speechLang: "id-ID", meaning: { ko: "이 버스 박물관에 가나요?", en: "Does this bus go to the museum?", es: "¿Este autobús va al museo?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "택시: 'Bisakah saya memesan taksi?' / 목적지: 'Ke ___, tolong.' / 가격: 'Berapa ongkos ke ___?' / 표: 'Satu tiket ke ___, tolong.' / 버스 확인: 'Apakah bus ini ke ___?'", en: "'Bisakah saya memesan taksi?' → request / 'Ke ___, tolong.' → destination (literally 'to ___, please') / 'Berapa ongkos ke ___?' → fare / 'Satu tiket ke ___' → buy ticket / 'Apakah bus ini ke ___?' → confirm route", es: "'Bisakah saya memesan taksi?' → pedir taxi / 'Ke ___, tolong.' → destino / 'Berapa ongkos ke ___?' → precio / 'Satu tiket ke ___' → comprar billete / 'Apakah bus ini ke ___?' → confirmar ruta" },
          examples: { ko: "Bisakah saya memesan taksi ke pusat kota? (시내까지 택시 불러주세요.)\nBerapa ongkos ke stasiun? (역까지 얼마예요?)\nApakah bus ini ke bandara? (이 버스 공항에 가나요?)", en: "Bisakah saya memesan taksi ke pusat kota? (Can I get a taxi to downtown?)\nBerapa ongkos ke stasiun? (How much to the station?)\nApakah bus ini ke bandara? (Does this bus go to the airport?)", es: "Bisakah saya memesan taksi ke pusat kota? (¿Me puede conseguir un taxi al centro?)\nBerapa ongkos ke stasiun? (¿Cuánto cuesta ir a la estación?)\nApakah bus ini ke bandara? (¿Este autobús va al aeropuerto?)" },
          mistakes: { ko: "❌ Di bandara, tolong.\n✅ Ke bandara, tolong. (목적지는 'ke'(~로)를 써요, 'di'(~에)가 아니에요!)\n\n❌ Apakah ini bus ke museum?\n✅ Apakah bus ini ke museum? (인도네시아어는 명사가 먼저! 'bus ini' = '이 버스')", en: "❌ Di bandara, tolong.\n✅ Ke bandara, tolong. (Use 'ke' (to) for destination, not 'di' (at)!)\n\n❌ Apakah ini bus ke museum?\n✅ Apakah bus ini ke museum? (Noun comes first — 'bus ini' = 'this bus'!)", es: "❌ Di bandara, tolong.\n✅ Ke bandara, tolong. (Usa 'ke' (a/hacia) para destino, no 'di' (en).)\n\n❌ Apakah ini bus ke museum?\n✅ Apakah bus ini ke museum? (El sustantivo va primero: 'bus ini' = 'este autobús'.)" },
          rudyTip: { ko: "교통수단 인도네시아어의 핵심은 'ke'야! Ke bandara, ke stasiun — 목적지 앞에 항상 'ke'를 붙이면 어디든 갈 수 있어. 택시든 버스든 기차든!", en: "The magic word for Indonesian transport is 'ke'! Ke bandara, ke stasiun — just put 'ke' before your destination and you're good to go, whether it's a taxi, bus, or train!", es: "La palabra mágica del transporte en indonesio es 'ke'. Ke bandara, ke stasiun — solo pon 'ke' antes del destino y listo, ya sea taxi, autobús o tren." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Bisakah saya ___ taksi?", answer: "memesan", options: ["memesan", "pergi", "naik"], fullSentence: "Bisakah saya memesan taksi?", fullSentenceMeaning: { ko: "택시 불러주세요.", en: "Can I get a taxi?", es: "¿Un taxi, por favor?" } },
          { type: "select", promptWithBlank: "___ bandara, tolong.", answer: "Ke", options: ["Ke", "Di", "Dari"], fullSentence: "Ke bandara, tolong.", fullSentenceMeaning: { ko: "공항으로 가주세요.", en: "To the airport, please.", es: "Al aeropuerto, por favor." } },
          { type: "select", promptWithBlank: "Apakah bus ini ___ museum?", answer: "ke", options: ["ke", "di", "dari"], fullSentence: "Apakah bus ini ke museum?", fullSentenceMeaning: { ko: "이 버스 박물관에 가나요?", en: "Does this bus go to the museum?", es: "¿Va al museo este bus?" } },
          { type: "input", promptWithBlank: "Berapa ___ ke pusat kota?", answer: "ongkos", fullSentence: "Berapa ongkos ke pusat kota?", fullSentenceMeaning: { ko: "시내까지 얼마예요?", en: "How much to the center?", es: "¿Cuánto al centro?" } },
          { type: "input", promptWithBlank: "Satu ___ ke Stasiun Seoul, tolong.", answer: "tiket", fullSentence: "Satu tiket ke Stasiun Seoul, tolong.", fullSentenceMeaning: { ko: "서울역 표 한 장 주세요.", en: "One ticket to Seoul Station.", es: "Un billete a la Estación Central." } },
          { type: "listening", audioText: "Apakah bus ini ke museum?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Apakah bus ini ke museum?", "Satu tiket ke Stasiun Seoul, tolong.", "Ke bandara, tolong.", "Berapa ongkos ke pusat kota?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "مُمْكِن تاكْسي، لو سَمَحْت؟", speechLang: "ar-EG", meaning: { ko: "momken taxi, law samaht? · 택시 불러주세요.", en: "momken taxi, law samaht? · Can I get a taxi, please?", es: "momken taxi, law samaht? · ¿Me puede llamar un taxi?", id: "momken taxi, law samaht? · Bisakah saya memesan taksi?" } },
        { text: "عَلى المَطار، لو سَمَحْت.", speechLang: "ar-EG", meaning: { ko: "3ala el-mataar, law samaht · 공항으로 가주세요.", en: "3ala el-mataar, law samaht · To the airport, please.", es: "3ala el-mataar, law samaht · Al aeropuerto, por favor.", id: "3ala el-mataar, law samaht · Ke bandara, tolong." } },
        { text: "بِكام لِحَدّ وِسْط البَلَد؟", speechLang: "ar-EG", meaning: { ko: "bekaam le7add west el-balad? · 시내까지 얼마예요?", en: "bekaam le7add west el-balad? · How much to the city center?", es: "bekaam le7add west el-balad? · ¿Cuánto cuesta ir al centro?", id: "bekaam le7add west el-balad? · Berapa ongkos ke pusat kota?" } },
        { text: "تَذْكَرة واحْدة لِمَحَطّة سيول، لو سَمَحْت.", speechLang: "ar-EG", meaning: { ko: "tazkara wahda le-mahattet Seoul, law samaht · 서울역 표 한 장 주세요.", en: "tazkara wahda le-mahattet Seoul, law samaht · One ticket to Seoul Station, please.", es: "tazkara wahda le-mahattet Seoul, law samaht · Un billete para la Estación Central, por favor.", id: "tazkara wahda le-mahattet Seoul, law samaht · Satu tiket ke Stasiun Seoul, tolong." }, recallRound: true },
        { text: "الأُتوبيس ده بيِروح المَتْحَف؟", speechLang: "ar-EG", meaning: { ko: "el-otobees da beyrooh el-mathaf? · 이 버스 박물관에 가나요?", en: "el-otobees da beyrooh el-mathaf? · Does this bus go to the museum?", es: "el-otobees da beyrooh el-mathaf? · ¿Este autobús va al museo?", id: "el-otobees da beyrooh el-mathaf? · Apakah bus ini ke museum?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "택시: 'مُمْكِن تاكْسي؟'(momken taxi?) / 목적지: 'عَلى ___، لو سَمَحْت'(3ala ___, law samaht) / 가격: 'بِكام لِحَدّ ___؟'(bekaam le7add ___?) / 표: 'تَذْكَرة لِـ ___'(tazkara le-___) / 버스 확인: 'الأُتوبيس ده بيِروح ___؟'(el-otobees da beyrooh ___?)", en: "Taxi: 'مُمْكِن تاكْسي؟' (momken taxi?, 'can I get a taxi?') / Destination: 'عَلى ___، لو سَمَحْت' (3ala ___, law samaht, 'to ___, please') / Price: 'بِكام لِحَدّ ___؟' (bekaam le7add ___?, 'how much to ___?') / Ticket: 'تَذْكَرة لِـ ___' (tazkara le-___) / Bus: 'الأُتوبيس ده بيِروح ___؟' (el-otobees da beyrooh ___?, 'does this bus go to ___?')", es: "Taxi: 'مُمْكِن تاكْسي؟' (momken taxi?) / Destino: 'عَلى ___، لو سَمَحْت' (3ala ___, law samaht) / Precio: 'بِكام لِحَدّ ___؟' (bekaam le7add ___?) / Billete: 'تَذْكَرة لِـ ___' (tazkara le-___) / Autobús: 'الأُتوبيس ده بيِروح ___؟' (el-otobees da beyrooh ___?)" },
          examples: { ko: "مُمْكِن تاكْسي لِوِسْط البَلَد؟ (momken taxi le-west el-balad? · 시내까지 택시 불러주세요.)\nبِكام لِحَدّ المَحَطّة؟ (bekaam le7add el-mahatta? · 역까지 얼마예요?)\nالأُتوبيس ده بيِروح المَطار؟ (el-otobees da beyrooh el-mataar? · 이 버스 공항에 가나요?)", en: "مُمْكِن تاكْسي لِوِسْط البَلَد؟ (momken taxi le-west el-balad? · Can I get a taxi to downtown?)\nبِكام لِحَدّ المَحَطّة؟ (bekaam le7add el-mahatta? · How much to the station?)\nالأُتوبيس ده بيِروح المَطار؟ (el-otobees da beyrooh el-mataar? · Does this bus go to the airport?)", es: "مُمْكِن تاكْسي لِوِسْط البَلَد؟ (momken taxi le-west el-balad? · ¿Me puede conseguir un taxi al centro?)\nبِكام لِحَدّ المَحَطّة؟ (bekaam le7add el-mahatta? · ¿Cuánto cuesta ir a la estación?)\nالأُتوبيس ده بيِروح المَطار؟ (el-otobees da beyrooh el-mataar? · ¿Este autobús va al aeropuerto?)" },
          mistakes: { ko: "❌ كَم الثَّمَن إلى المطار؟ (책에 나오는 표준어 'kam el-thaman')\n✅ بِكام لِحَدّ المَطار؟ (bekaam le7add el-mataar — '얼마?'는 무조건 'bekaam'!)\n\n❌ هَل يَذْهَب هذا الباص؟ (표준어 'hal yazhab')\n✅ الأُتوبيس ده بيِروح؟ (el-otobees da beyrooh? — 이집트는 명사 먼저, 'ده/da'(이것)도 뒤에!)", en: "❌ كَم الثَّمَن إلى المطار؟ (textbook MSA 'kam el-thaman')\n✅ بِكام لِحَدّ المَطار؟ (bekaam le7add el-mataar — 'how much?' is always 'bekaam'!)\n\n❌ هَل يَذْهَب هذا الباص؟ (MSA 'hal yazhab')\n✅ الأُتوبيس ده بيِروح؟ (el-otobees da beyrooh? — Egyptian puts the noun first, and 'ده/da' = 'this' goes AFTER it!)", es: "❌ كَم الثَّمَن إلى المطار؟ (MSA de libro 'kam el-thaman')\n✅ بِكام لِحَدّ المَطار؟ (bekaam le7add el-mataar — '¿cuánto?' siempre es 'bekaam')\n\n❌ هَل يَذْهَب هذا الباص؟ (MSA 'hal yazhab')\n✅ الأُتوبيس ده بيِروح؟ (el-otobees da beyrooh? — en egipcio el sustantivo va primero y 'ده/da' = 'este' va DESPUÉS)" },
          rudyTip: { ko: "교통수단 이집트 아랍어의 핵심은 'عَلى'(3ala, ~로)랑 'بِكام'(bekaam, 얼마)야! 'عَلى المَطار'(공항으로), 'بِكام؟'(얼마예요?) — 택시든 미크로바스든 이 두 마디면 끝! 'لو سَمَحْت'(law samaht, 부탁해요)도 꼭 붙여~", en: "The magic words for Egyptian transport are 'عَلى' (3ala = to) and 'بِكام' (bekaam = how much)! 'عَلى المَطار' (to the airport), 'بِكام؟' (how much?) — works for taxis and microbuses alike. And always add 'لو سَمَحْت' (law samaht = please)!", es: "Las palabras mágicas del transporte egipcio son 'عَلى' (3ala = a) y 'بِكام' (bekaam = cuánto): 'عَلى المَطار' (al aeropuerto), 'بِكام؟' (¿cuánto?). ¡Funciona para taxis y microbuses! Y añade siempre 'لو سَمَحْت' (law samaht = por favor)." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ تاكْسي، لو سَمَحْت؟", answer: "مُمْكِن", options: ["مُمْكِن", "فين", "إيه"], fullSentence: "مُمْكِن تاكْسي، لو سَمَحْت؟", fullSentenceMeaning: { ko: "택시 불러주세요.", en: "Can I get a taxi?", es: "¿Un taxi, por favor?", id: "Bisakah saya memesan taksi?" } },
          { type: "select", promptWithBlank: "___ المَطار، لو سَمَحْت.", answer: "عَلى", options: ["عَلى", "في", "مِن"], fullSentence: "عَلى المَطار، لو سَمَحْت.", fullSentenceMeaning: { ko: "공항으로 가주세요.", en: "To the airport, please.", es: "Al aeropuerto, por favor.", id: "Ke bandara, tolong." } },
          { type: "select", promptWithBlank: "الأُتوبيس ده ___ المَتْحَف؟", answer: "بيِروح", options: ["بيِروح", "بيِيجي", "بيِقَف"], fullSentence: "الأُتوبيس ده بيِروح المَتْحَف؟", fullSentenceMeaning: { ko: "이 버스 박물관에 가나요?", en: "Does this bus go to the museum?", es: "¿Va al museo este bus?", id: "Apakah bus ini ke museum?" } },
          { type: "input", promptWithBlank: "___ لِحَدّ وِسْط البَلَد؟", answer: "بِكام", fullSentence: "بِكام لِحَدّ وِسْط البَلَد؟", fullSentenceMeaning: { ko: "시내까지 얼마예요?", en: "How much to the center?", es: "¿Cuánto al centro?", id: "Berapa ongkos ke pusat kota?" } },
          { type: "input", promptWithBlank: "___ واحْدة لِمَحَطّة سيول، لو سَمَحْت.", answer: "تَذْكَرة", fullSentence: "تَذْكَرة واحْدة لِمَحَطّة سيول، لو سَمَحْت.", fullSentenceMeaning: { ko: "서울역 표 한 장 주세요.", en: "One ticket to Seoul Station.", es: "Un billete a la Estación Central.", id: "Satu tiket ke Stasiun Seoul." } },
          { type: "listening", audioText: "الأُتوبيس ده بيِروح المَتْحَف؟", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["الأُتوبيس ده بيِروح المَتْحَف؟", "تَذْكَرة واحْدة لِمَحَطّة سيول، لو سَمَحْت.", "عَلى المَطار، لو سَمَحْت.", "بِكام لِحَدّ وِسْط البَلَد؟"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 23: Asking for Help Getting Around ─────────────────────
  day_23: {
    english: {
      step1Sentences: [
        { text: "Excuse me, I'm lost.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "실례합니다, 길을 잃었어요.", en: "Excuse me, I'm lost.", es: "Perdone, estoy perdido." } },
        { text: "Can you show me on the map?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "지도에서 보여주실 수 있나요?", en: "Can you show me on the map?", es: "¿Me puede señalar en el mapa?" } },
        { text: "I don't know this area.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "이 동네를 잘 몰라요.", en: "I don't know this area.", es: "No conozco esta zona." } },
        { text: "Which way is the train station?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "기차역이 어느 쪽인가요?", en: "Which way is the train station?", es: "¿Por dónde está la estación?" }, recallRound: true },
        { text: "Is this the right way to the museum?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "박물관 가는 길이 맞나요?", en: "Is this the right way to the museum?", es: "¿Voy bien para el museo?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "길 잃음: 'Excuse me, I'm lost.' / 지도: 'Can you show me on the map?' / 방향: 'Which way is ___?' / 확인: 'Is this the right way to ___?'", en: "'Excuse me, I'm lost.' → announce / 'Can you show me on the map?' → ask for visual help / 'Which way is ___?' → ask direction / 'Is this the right way to ___?' → confirm path", es: "'Excuse me, I'm lost.' → anunciar / 'Can you show me on the map?' → pedir ayuda visual / 'Which way is ___?' → preguntar dirección / 'Is this the right way to ___?' → confirmar camino" },
          examples: { ko: "Excuse me, I'm lost. Where is the hotel? (실례합니다, 길을 잃었어요. 호텔이 어디예요?)\nCan you show me on the map? I don't know this area. (지도에서 보여주세요. 이 동네를 몰라요.)\nIs this the right way to the park? (공원 가는 길이 맞나요?)", en: "Excuse me, I'm lost. Where is the hotel? (Starting with a polite phrase before asking.)\nCan you show me on the map? I don't know this area. (Requesting visual help when words fail.)\nIs this the right way to the park? (Double-checking before you walk further.)", es: "Excuse me, I'm lost. Where is the hotel? (Disculpe, estoy perdido. ¿Dónde está el hotel?)\nCan you show me on the map? (¿Me puede señalar en el mapa?)\nIs this the right way to the park? (¿Voy bien para el parque?)" },
          mistakes: { ko: "❌ Excuse me, I lost.\n✅ Excuse me, I'm lost. ('I'm lost'에서 'm을 빼면 '나는 잃었다'가 돼서 의미가 달라져요!)\n\n❌ Which way is to the station?\n✅ Which way is the station? (is 다음에 바로 장소가 와요, 'to' 불필요!)", en: "❌ Excuse me, I lost.\n✅ Excuse me, I'm lost. ('I lost' means you lost something — 'I'm lost' means YOU are lost!)\n\n❌ Which way is to the station?\n✅ Which way is the station? (No 'to' needed after 'Which way is'!)", es: "❌ Excuse me, I lost.\n✅ Excuse me, I'm lost. ('I lost' = perdí algo. 'I'm lost' = estoy perdido.)\n\n❌ Which way is to the station?\n✅ Which way is the station? (No necesitas 'to' después de 'Which way is'.)" },
          rudyTip: { ko: "낯선 곳에서 당황하지 마! 'Excuse me, I'm lost' 이 한 마디면 사람들이 도와줄 거야. 웃으면서 말하면 효과 두 배!", en: "Don't panic in a strange place! 'Excuse me, I'm lost' — this one sentence will get people helping you. Say it with a smile and the help doubles!", es: "No entres en pánico en un lugar extraño. 'Excuse me, I'm lost' hará que la gente te ayude. Dilo con una sonrisa y la ayuda se duplica." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Excuse me, I'm ___.", answer: "lost", options: ["lost", "late", "tired"], fullSentence: "Excuse me, I'm lost.", fullSentenceMeaning: { ko: "실례합니다, 길을 잃었어요.", en: "Excuse me, I'm lost.", es: "Perdone, estoy perdido." } },
          { type: "select", promptWithBlank: "Can you ___ me on the map?", answer: "show", options: ["show", "tell", "give"], fullSentence: "Can you show me on the map?", fullSentenceMeaning: { ko: "지도에서 보여주실 수 있나요?", en: "Can you show me on the map?", es: "¿Me puede señalar en el mapa?" } },
          { type: "select", promptWithBlank: "___ way is the train station?", answer: "Which", options: ["Which", "What", "Where"], fullSentence: "Which way is the train station?", fullSentenceMeaning: { ko: "기차역이 어느 쪽인가요?", en: "Which way is the station?", es: "¿Por dónde está la estación?" } },
          { type: "input", promptWithBlank: "I don't ___ this area.", answer: "know", fullSentence: "I don't know this area.", fullSentenceMeaning: { ko: "이 동네를 잘 몰라요.", en: "I don't know this area.", es: "No conozco esta zona." } },
          { type: "input", promptWithBlank: "Is this the ___ way to the museum?", answer: "right", fullSentence: "Is this the right way to the museum?", fullSentenceMeaning: { ko: "박물관 가는 길이 맞나요?", en: "Is this the right way?", es: "¿Voy bien para el museo?" } },
          { type: "listening", audioText: "Is this the right way to the museum?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Is this the right way to the museum?", "Which way is the train station?", "Can you show me on the map?", "Excuse me, I'm lost."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "Perdone, estoy perdido.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "실례합니다, 길을 잃었어요.", en: "Excuse me, I'm lost.", es: "Perdone, estoy perdido." } },
        { text: "¿Me puede señalar en el mapa?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "지도에서 보여주실 수 있나요?", en: "Can you show me on the map?", es: "¿Me puede señalar en el mapa?" } },
        { text: "No conozco esta zona.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "이 동네를 잘 몰라요.", en: "I don't know this area.", es: "No conozco esta zona." } },
        { text: "¿Por dónde está la estación?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "기차역이 어느 쪽인가요?", en: "Which way is the station?", es: "¿Por dónde está la estación?" }, recallRound: true },
        { text: "¿Voy bien para el museo?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "박물관 가는 길이 맞나요?", en: "Is this the right way to the museum?", es: "¿Voy bien para el museo?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "길 잃음: 'Perdone, estoy perdido/a.' / 지도: '¿Me puede señalar en el mapa?' / 방향: '¿Por dónde está ___?' / 확인: '¿Voy bien para ___?'", en: "'Perdone, estoy perdido/a.' → announce / '¿Me puede señalar en el mapa?' → ask for visual help / '¿Por dónde está ___?' → ask direction / '¿Voy bien para ___?' → confirm path", es: "'Perdone, estoy perdido/a.' → anunciar / '¿Me puede señalar en el mapa?' → pedir ayuda visual / '¿Por dónde está ___?' → dirección / '¿Voy bien para ___?' → confirmar camino" },
          examples: { ko: "Perdone, estoy perdido. ¿Dónde está el hotel? (실례합니다, 길을 잃었어요. 호텔 어디예요?)\n¿Me puede señalar en el mapa? No conozco esta zona. (지도에서 보여주세요. 이 동네를 몰라요.)\n¿Voy bien para el parque? (공원 가는 길이 맞나요?)", en: "Perdone, estoy perdido. ¿Dónde está el hotel? (Excuse me, I'm lost. Where's the hotel?)\n¿Me puede señalar en el mapa? (Can you show me on the map?)\n¿Voy bien para el parque? (Am I going the right way to the park?)", es: "Perdone, estoy perdido. ¿Dónde está el hotel? (Empezar con cortesía antes de preguntar.)\n¿Me puede señalar en el mapa? No conozco esta zona. (Pedir ayuda visual.)\n¿Voy bien para el parque? (Confirmar antes de seguir caminando.)" },
          mistakes: { ko: "❌ Estoy perdiendo.\n✅ Estoy perdido/a. ('perdiendo'는 진행형이라 '잃어가고 있다'가 돼요!)\n\n❌ ¿Voy bueno para el museo?\n✅ ¿Voy bien para el museo? ('bueno'가 아니라 부사 'bien'을 써요!)", en: "❌ Estoy perdiendo.\n✅ Estoy perdido/a. ('Perdiendo' means 'losing' — use 'perdido/a' for 'lost'!)\n\n❌ ¿Voy bueno para el museo?\n✅ ¿Voy bien para el museo? (Use adverb 'bien', not adjective 'bueno'!)", es: "❌ Estoy perdiendo.\n✅ Estoy perdido/a. ('Perdiendo' = perdiendo algo. 'Perdido/a' = estar perdido.)\n\n❌ ¿Voy bueno para el museo?\n✅ ¿Voy bien para el museo? (Usa el adverbio 'bien', no el adjetivo 'bueno'.)" },
          rudyTip: { ko: "스페인어에서 남자는 'perdido', 여자는 'perdida'를 써! 이 성별 구분이 스페인어의 매력이자 주의점이야. '¿Voy bien para ___?'는 확인의 마법 주문!", en: "In Spanish, men say 'perdido', women say 'perdida' — gender matters! And '¿Voy bien para ___?' is your magic confirmation spell. Use it before every turn!", es: "Recuerda: hombres dicen 'perdido', mujeres 'perdida'. Y '¿Voy bien para ___?' es tu frase mágica de confirmación. Úsala antes de cada giro." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Perdone, estoy ___.", answer: "perdido", options: ["perdido", "cansado", "bien"], fullSentence: "Perdone, estoy perdido.", fullSentenceMeaning: { ko: "실례합니다, 길을 잃었어요.", en: "Excuse me, I'm lost.", es: "Perdone, estoy perdido." } },
          { type: "select", promptWithBlank: "¿Me puede ___ en el mapa?", answer: "señalar", options: ["señalar", "decir", "dar"], fullSentence: "¿Me puede señalar en el mapa?", fullSentenceMeaning: { ko: "지도에서 보여주세요.", en: "Show me on the map.", es: "¿Señalar en el mapa?" } },
          { type: "select", promptWithBlank: "¿Por dónde ___ la estación?", answer: "está", options: ["está", "hay", "es"], fullSentence: "¿Por dónde está la estación?", fullSentenceMeaning: { ko: "역이 어느 쪽이에요?", en: "Which way is the station?", es: "¿Por dónde está?" } },
          { type: "input", promptWithBlank: "No ___ esta zona.", answer: "conozco", fullSentence: "No conozco esta zona.", fullSentenceMeaning: { ko: "이 동네를 잘 몰라요.", en: "I don't know this area.", es: "No conozco esta zona." } },
          { type: "input", promptWithBlank: "¿Voy ___ para el museo?", answer: "bien", fullSentence: "¿Voy bien para el museo?", fullSentenceMeaning: { ko: "박물관 가는 길 맞나요?", en: "Am I going the right way?", es: "¿Voy bien para el museo?" } },
          { type: "listening", audioText: "¿Voy bien para el museo?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Voy bien para el museo?", "¿Por dónde está la estación?", "¿Me puede señalar en el mapa?", "Perdone, estoy perdido."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "실례합니다, 길을 잃었어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "실례합니다, 길을 잃었어요.", en: "Excuse me, I'm lost.", es: "Perdone, estoy perdido." } },
        { text: "지도에서 보여주실 수 있나요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "지도에서 보여주실 수 있나요?", en: "Can you show me on the map?", es: "¿Me puede señalar en el mapa?" } },
        { text: "이 동네를 잘 몰라요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "이 동네를 잘 몰라요.", en: "I don't know this area.", es: "No conozco esta zona." } },
        { text: "기차역이 어느 쪽인가요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "기차역이 어느 쪽인가요?", en: "Which way is the train station?", es: "¿Por dónde está la estación?" }, recallRound: true },
        { text: "박물관 가는 길이 맞나요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "박물관 가는 길이 맞나요?", en: "Is this the right way to the museum?", es: "¿Voy bien para el museo?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "길 잃음: '실례합니다, 길을 잃었어요.' / 지도: '지도에서 보여주실 수 있나요?' / 방향: '___이/가 어느 쪽인가요?' / 확인: '___ 가는 길이 맞나요?'", en: "'길을 잃었어요' → I'm lost / '지도에서 보여주실 수 있나요?' → show me on the map / '어느 쪽인가요?' → which way / '가는 길이 맞나요?' → am I going the right way", es: "'길을 잃었어요' → estoy perdido / '지도에서 보여주실 수 있나요?' → señalar en el mapa / '어느 쪽인가요?' → qué dirección / '가는 길이 맞나요?' → voy bien" },
          examples: { ko: "실례합니다, 길을 잃었어요. 호텔이 어디예요? (도움 요청)\n지도에서 보여주실 수 있나요? 이 동네를 잘 몰라요. (시각적 도움 요청)\n공원 가는 길이 맞나요? (방향 확인)", en: "실례합니다, 길을 잃었어요. (Excuse me, I'm lost.)\n지도에서 보여주실 수 있나요? (Can you show me on the map?)\n공원 가는 길이 맞나요? (Is this the right way to the park?)", es: "실례합니다, 길을 잃었어요. (Perdone, estoy perdido.)\n지도에서 보여주실 수 있나요? (¿Me puede señalar en el mapa?)\n공원 가는 길이 맞나요? (¿Voy bien para el parque?)" },
          mistakes: { ko: "❌ 길이 잃었어요.\n✅ 길을 잃었어요. ('길을'에서 '을'이 목적격 조사예요, '이'가 아니에요!)\n\n❌ 박물관 가는 길 맞나요?\n✅ 박물관 가는 길이 맞나요? ('길이'에서 주격 조사 '이'를 꼭 붙여요!)", en: "❌ 길이 잃었어요.\n✅ 길을 잃었어요. (Use 을 — 길 is the OBJECT you lost, not the subject!)\n\n❌ 박물관 가는 길 맞나요?\n✅ 박물관 가는 길이 맞나요? (Add 이 after 길 — it's the subject of the question!)", es: "❌ 길이 잃었어요.\n✅ 길을 잃었어요. (Usa 을, 길 es el OBJETO que perdiste, no el sujeto.)\n\n❌ 박물관 가는 길 맞나요?\n✅ 박물관 가는 길이 맞나요? (Añade 이 después de 길, es el sujeto de la pregunta.)" },
          rudyTip: { ko: "한국어로 도움 요청할 때 '실례합니다'로 시작하면 성공률 100%! 그다음 '길을 잃었어요'만 하면 사람들이 알아서 도와줄 거야!", en: "Starting with '실례합니다' (excuse me) is the Korean politeness key! Follow it with '길을 잃었어요' and people will practically escort you to your destination!", es: "Empezar con '실례합니다' (disculpe) es la clave de cortesía coreana. Sigue con '길을 잃었어요' y la gente prácticamente te llevará a tu destino." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "길을 ___어요.", answer: "잃었", options: ["잃었", "갔", "왔"], fullSentence: "길을 잃었어요.", fullSentenceMeaning: { ko: "길을 잃었어요.", en: "I'm lost.", es: "Estoy perdido." } },
          { type: "select", promptWithBlank: "지도에서 ___주실 수 있나요?", answer: "보여", options: ["보여", "말해", "가"], fullSentence: "지도에서 보여주실 수 있나요?", fullSentenceMeaning: { ko: "지도에서 보여주세요.", en: "Show me on the map.", es: "Señale en el mapa." } },
          { type: "select", promptWithBlank: "기차역이 어느 ___인가요?", answer: "쪽", options: ["쪽", "곳", "데"], fullSentence: "기차역이 어느 쪽인가요?", fullSentenceMeaning: { ko: "기차역이 어느 쪽?", en: "Which way is the station?", es: "¿Por dónde la estación?" } },
          { type: "input", promptWithBlank: "이 동네를 잘 ___요.", answer: "몰라", fullSentence: "이 동네를 잘 몰라요.", fullSentenceMeaning: { ko: "이 동네를 잘 몰라요.", en: "I don't know this area.", es: "No conozco esta zona." } },
          { type: "input", promptWithBlank: "박물관 가는 ___이 맞나요?", answer: "길", fullSentence: "박물관 가는 길이 맞나요?", fullSentenceMeaning: { ko: "박물관 가는 길 맞나요?", en: "Right way to the museum?", es: "¿Voy bien al museo?" } },
          { type: "listening", audioText: "박물관 가는 길이 맞나요?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["박물관 가는 길이 맞나요?", "기차역이 어느 쪽인가요?", "지도에서 보여주실 수 있나요?", "실례합니다, 길을 잃었어요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Permisi, saya tersesat.", speechLang: "id-ID", meaning: { ko: "실례합니다, 길을 잃었어요.", en: "Excuse me, I'm lost.", es: "Perdone, estoy perdido." } },
        { text: "Bisakah Anda tunjukkan di peta?", speechLang: "id-ID", meaning: { ko: "지도에서 보여주실 수 있나요?", en: "Can you show me on the map?", es: "¿Me puede señalar en el mapa?" } },
        { text: "Saya tidak tahu daerah ini.", speechLang: "id-ID", meaning: { ko: "이 동네를 잘 몰라요.", en: "I don't know this area.", es: "No conozco esta zona." } },
        { text: "Ke arah mana stasiun kereta?", speechLang: "id-ID", meaning: { ko: "기차역이 어느 쪽인가요?", en: "Which way is the train station?", es: "¿Por dónde está la estación?" }, recallRound: true },
        { text: "Apakah ini jalan yang benar ke museum?", speechLang: "id-ID", meaning: { ko: "박물관 가는 길이 맞나요?", en: "Is this the right way to the museum?", es: "¿Voy bien para el museo?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "길 잃음: 'Permisi, saya tersesat.' / 지도: 'Bisakah Anda tunjukkan di peta?' / 방향: 'Ke arah mana ___?' / 확인: 'Apakah ini jalan yang benar ke ___?'", en: "'Permisi, saya tersesat.' → announce / 'Bisakah Anda tunjukkan di peta?' → ask for visual help / 'Ke arah mana ___?' → which way / 'Apakah ini jalan yang benar ke ___?' → confirm path", es: "'Permisi, saya tersesat.' → anunciar / 'Bisakah Anda tunjukkan di peta?' → pedir ayuda visual / 'Ke arah mana ___?' → qué dirección / 'Apakah ini jalan yang benar ke ___?' → confirmar camino" },
          examples: { ko: "Permisi, saya tersesat. Di mana hotelnya? (실례합니다, 길을 잃었어요. 호텔이 어디예요?)\nBisakah Anda tunjukkan di peta? Saya tidak tahu daerah ini. (지도에서 보여주세요. 이 동네를 몰라요.)\nApakah ini jalan yang benar ke taman? (공원 가는 길이 맞나요?)", en: "Permisi, saya tersesat. Di mana hotelnya? (Excuse me, I'm lost. Where is the hotel?)\nBisakah Anda tunjukkan di peta? (Can you show me on the map?)\nApakah ini jalan yang benar ke taman? (Is this the right way to the park?)", es: "Permisi, saya tersesat. Di mana hotelnya? (Disculpe, estoy perdido. ¿Dónde está el hotel?)\nBisakah Anda tunjukkan di peta? (¿Me puede señalar en el mapa?)\nApakah ini jalan yang benar ke taman? (¿Voy bien para el parque?)" },
          mistakes: { ko: "❌ Saya tersesat tidak tahu.\n✅ Saya tersesat. ('tersesat' 하나로 '길을 잃다'가 완성돼요!)\n\n❌ Ke mana arah stasiun?\n✅ Ke arah mana stasiun? ('ke arah mana'가 '어느 쪽으로'라는 올바른 어순이에요!)", en: "❌ Saya tersesat tidak tahu.\n✅ Saya tersesat. ('Tersesat' alone fully means 'I'm lost'!)\n\n❌ Ke mana arah stasiun?\n✅ Ke arah mana stasiun? ('Ke arah mana' is the correct order for 'which way to'!)", es: "❌ Saya tersesat tidak tahu.\n✅ Saya tersesat. ('Tersesat' por sí solo significa 'estoy perdido'.)\n\n❌ Ke mana arah stasiun?\n✅ Ke arah mana stasiun? ('Ke arah mana' es el orden correcto para 'hacia qué dirección'.)" },
          rudyTip: { ko: "낯선 곳에서 당황하지 마! 'Permisi, saya tersesat' 이 한 마디면 사람들이 도와줄 거야. 웃으면서 말하면 효과 두 배!", en: "Don't panic in a strange place! 'Permisi, saya tersesat' — this one sentence will get people helping you. Say it with a smile and the help doubles!", es: "No entres en pánico en un lugar extraño. 'Permisi, saya tersesat' hará que la gente te ayude. Dilo con una sonrisa y la ayuda se duplica." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Permisi, saya ___.", answer: "tersesat", options: ["tersesat", "terlambat", "lelah"], fullSentence: "Permisi, saya tersesat.", fullSentenceMeaning: { ko: "실례합니다, 길을 잃었어요.", en: "Excuse me, I'm lost.", es: "Perdone, estoy perdido." } },
          { type: "select", promptWithBlank: "Bisakah Anda ___ di peta?", answer: "tunjukkan", options: ["tunjukkan", "katakan", "berikan"], fullSentence: "Bisakah Anda tunjukkan di peta?", fullSentenceMeaning: { ko: "지도에서 보여주실 수 있나요?", en: "Can you show me on the map?", es: "¿Me puede señalar en el mapa?" } },
          { type: "select", promptWithBlank: "Ke arah ___ stasiun kereta?", answer: "mana", options: ["mana", "apa", "siapa"], fullSentence: "Ke arah mana stasiun kereta?", fullSentenceMeaning: { ko: "기차역이 어느 쪽인가요?", en: "Which way is the station?", es: "¿Por dónde está la estación?" } },
          { type: "input", promptWithBlank: "Saya tidak ___ daerah ini.", answer: "tahu", fullSentence: "Saya tidak tahu daerah ini.", fullSentenceMeaning: { ko: "이 동네를 잘 몰라요.", en: "I don't know this area.", es: "No conozco esta zona." } },
          { type: "input", promptWithBlank: "Apakah ini jalan yang ___ ke museum?", answer: "benar", fullSentence: "Apakah ini jalan yang benar ke museum?", fullSentenceMeaning: { ko: "박물관 가는 길이 맞나요?", en: "Is this the right way?", es: "¿Voy bien para el museo?" } },
          { type: "listening", audioText: "Apakah ini jalan yang benar ke museum?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Apakah ini jalan yang benar ke museum?", "Ke arah mana stasiun kereta?", "Bisakah Anda tunjukkan di peta?", "Permisi, saya tersesat."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "لو سَمَحْت، أنا تُهْت.", speechLang: "ar-EG", meaning: { ko: "law samaht, ana toht · 실례합니다, 길을 잃었어요.", en: "law samaht, ana toht · Excuse me, I'm lost.", es: "law samaht, ana toht · Perdone, estoy perdido.", id: "law samaht, ana toht · Permisi, saya tersesat." } },
        { text: "مُمْكِن تِوَرّيني عَلى الخَريطة؟", speechLang: "ar-EG", meaning: { ko: "momken tewarreeni 3ala el-khareeta? · 지도에서 보여주실 수 있나요?", en: "momken tewarreeni 3ala el-khareeta? · Can you show me on the map?", es: "momken tewarreeni 3ala el-khareeta? · ¿Me puede señalar en el mapa?", id: "momken tewarreeni 3ala el-khareeta? · Bisakah Anda tunjukkan di peta?" } },
        { text: "أنا مِش عارِف المَنْطِقة دي.", speechLang: "ar-EG", meaning: { ko: "ana mesh 3aaref el-mante'a di · 이 동네를 잘 몰라요.", en: "ana mesh 3aaref el-mante'a di · I don't know this area.", es: "ana mesh 3aaref el-mante'a di · No conozco esta zona.", id: "ana mesh 3aaref el-mante'a di · Saya tidak tahu daerah ini." } },
        { text: "مَحَطّة القَطْر مِن أَنْهي ناحْية؟", speechLang: "ar-EG", meaning: { ko: "mahattet el-'atr men anhy nah-ya? · 기차역이 어느 쪽인가요?", en: "mahattet el-'atr men anhy nah-ya? · Which way is the train station?", es: "mahattet el-'atr men anhy nah-ya? · ¿Por dónde está la estación?", id: "mahattet el-'atr men anhy nah-ya? · Ke arah mana stasiun kereta?" }, recallRound: true },
        { text: "دي الطَّريق الصَّح لِلمَتْحَف؟", speechLang: "ar-EG", meaning: { ko: "di el-taree' el-sah lel-mathaf? · 박물관 가는 길이 맞나요?", en: "di el-taree' el-sah lel-mathaf? · Is this the right way to the museum?", es: "di el-taree' el-sah lel-mathaf? · ¿Voy bien para el museo?", id: "di el-taree' el-sah lel-mathaf? · Apakah ini jalan yang benar ke museum?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "길 잃음: 'أنا تُهْت'(ana toht, '길을 잃었다'는 이집트식 'toht!') / 지도: 'مُمْكِن تِوَرّيني عَلى الخَريطة؟'(momken tewarreeni 3ala el-khareeta?) / 방향: '___ مِن أَنْهي ناحْية؟'(___ men anhy nah-ya?) / 확인: 'دي الطَّريق الصَّح لِـ ___؟'(di el-taree' el-sah le-___?)", en: "Lost: 'أنا تُهْت' (ana toht) — Egyptians say 'toht' for 'I got lost' / Map: 'مُمْكِن تِوَرّيني عَلى الخَريطة؟' (momken tewarreeni 3ala el-khareeta?) / Direction: '___ مِن أَنْهي ناحْية؟' (___ men anhy nah-ya?, 'which way is ___?') / Confirm: 'دي الطَّريق الصَّح لِـ ___؟' (di el-taree' el-sah le-___?, 'is this the right way to ___?')", es: "Perdido: 'أنا تُهْت' (ana toht) — los egipcios dicen 'toht' para 'me perdí' / Mapa: 'مُمْكِن تِوَرّيني عَلى الخَريطة؟' (momken tewarreeni 3ala el-khareeta?) / Dirección: '___ مِن أَنْهي ناحْية؟' (___ men anhy nah-ya?) / Confirmar: 'دي الطَّريق الصَّح لِـ ___؟' (di el-taree' el-sah le-___?)" },
          examples: { ko: "لو سَمَحْت، أنا تُهْت. الفُنْدُق فين؟ (law samaht, ana toht. el-fondo' feen? · 실례합니다, 길을 잃었어요. 호텔이 어디예요?)\nمُمْكِن تِوَرّيني عَلى الخَريطة؟ أنا مِش عارِف المَنْطِقة دي. (momken tewarreeni 3ala el-khareeta? ana mesh 3aaref el-mante'a di · 지도에서 보여주세요. 이 동네를 몰라요.)\nدي الطَّريق الصَّح لِلجِنينة؟ (di el-taree' el-sah lel-geneena? · 공원 가는 길이 맞나요?)", en: "لو سَمَحْت، أنا تُهْت. الفُنْدُق فين؟ (law samaht, ana toht. el-fondo' feen? · Excuse me, I'm lost. Where is the hotel?)\nمُمْكِن تِوَرّيني عَلى الخَريطة؟ (momken tewarreeni 3ala el-khareeta? · Can you show me on the map?)\nدي الطَّريق الصَّح لِلجِنينة؟ (di el-taree' el-sah lel-geneena? · Is this the right way to the park?)", es: "لو سَمَحْت، أنا تُهْت. الفُنْدُق فين؟ (law samaht, ana toht. el-fondo' feen? · Disculpe, estoy perdido. ¿Dónde está el hotel?)\nمُمْكِن تِوَرّيني عَلى الخَريطة؟ (momken tewarreeni 3ala el-khareeta? · ¿Me puede señalar en el mapa?)\nدي الطَّريق الصَّح لِلجِنينة؟ (di el-taree' el-sah lel-geneena? · ¿Voy bien para el parque?)" },
          mistakes: { ko: "❌ أنا ضائِع. (책에 나오는 표준어 'daa'e3')\n✅ أنا تُهْت. (ana toht — '길을 잃었다'는 이집트식 'toht'!)\n\n❌ أنا لا أعْرِف المنطقة. (표준어 부정 'la a3ref')\n✅ أنا مِش عارِف المَنْطِقة دي. (ana mesh 3aaref — 이집트는 'مِش عارِف/mesh 3aaref'!)", en: "❌ أنا ضائِع. (textbook MSA 'daa'e3')\n✅ أنا تُهْت. (ana toht — Egyptians say 'toht' for 'I'm lost'!)\n\n❌ أنا لا أعْرِف المنطقة. (MSA negation 'la a3ref')\n✅ أنا مِش عارِف المَنْطِقة دي. (ana mesh 3aaref — Egyptian uses 'مِش عارِف' / mesh 3aaref!)", es: "❌ أنا ضائِع. (MSA de libro 'daa'e3')\n✅ أنا تُهْت. (ana toht — los egipcios dicen 'toht' para 'estoy perdido')\n\n❌ أنا لا أعْرِف المنطقة. (negación MSA 'la a3ref')\n✅ أنا مِش عارِف المَنْطِقة دي. (ana mesh 3aaref — el egipcio usa 'مِش عارِف' / mesh 3aaref)" },
          rudyTip: { ko: "낯선 곳에서 당황하지 마! 'لو سَمَحْت، أنا تُهْت'(law samaht, ana toht) 이 한 마디면 이집트 사람들이 바로 도와줘. 이집트 사람은 정말 친절해서 웃으면서 말하면 효과 두 배!", en: "Don't panic in a strange place! 'لو سَمَحْت، أنا تُهْت' (law samaht, ana toht) — this one line gets Egyptians helping you right away. Cairenes are famously warm, so say it with a smile and the help doubles!", es: "No entres en pánico en un lugar extraño. 'لو سَمَحْت، أنا تُهْت' (law samaht, ana toht) hace que los egipcios te ayuden enseguida. ¡Los cairotas son muy cálidos, dilo con una sonrisa y la ayuda se duplica!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "لو سَمَحْت، أنا ___.", answer: "تُهْت", options: ["تُهْت", "اتْأَخَّرْت", "تَعْبان"], fullSentence: "لو سَمَحْت، أنا تُهْت.", fullSentenceMeaning: { ko: "실례합니다, 길을 잃었어요.", en: "Excuse me, I'm lost.", es: "Perdone, estoy perdido.", id: "Permisi, saya tersesat." } },
          { type: "select", promptWithBlank: "مُمْكِن ___ عَلى الخَريطة؟", answer: "تِوَرّيني", options: ["تِوَرّيني", "تِقولّي", "تِدّيني"], fullSentence: "مُمْكِن تِوَرّيني عَلى الخَريطة؟", fullSentenceMeaning: { ko: "지도에서 보여주실 수 있나요?", en: "Can you show me on the map?", es: "¿Me puede señalar en el mapa?", id: "Bisakah Anda tunjukkan di peta?" } },
          { type: "select", promptWithBlank: "مَحَطّة القَطْر مِن أَنْهي ___؟", answer: "ناحْية", options: ["ناحْية", "حاجة", "مين"], fullSentence: "مَحَطّة القَطْر مِن أَنْهي ناحْية؟", fullSentenceMeaning: { ko: "기차역이 어느 쪽인가요?", en: "Which way is the train station?", es: "¿Por dónde está la estación?", id: "Ke arah mana stasiun kereta?" } },
          { type: "input", promptWithBlank: "أنا مِش ___ المَنْطِقة دي.", answer: "عارِف", fullSentence: "أنا مِش عارِف المَنْطِقة دي.", fullSentenceMeaning: { ko: "이 동네를 잘 몰라요.", en: "I don't know this area.", es: "No conozco esta zona.", id: "Saya tidak tahu daerah ini." } },
          { type: "input", promptWithBlank: "دي الطَّريق ___ لِلمَتْحَف؟", answer: "الصَّح", fullSentence: "دي الطَّريق الصَّح لِلمَتْحَف؟", fullSentenceMeaning: { ko: "박물관 가는 길이 맞나요?", en: "Is this the right way to the museum?", es: "¿Voy bien para el museo?", id: "Apakah ini jalan yang benar ke museum?" } },
          { type: "listening", audioText: "دي الطَّريق الصَّح لِلمَتْحَف؟", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["دي الطَّريق الصَّح لِلمَتْحَف؟", "مَحَطّة القَطْر مِن أَنْهي ناحْية؟", "مُمْكِن تِوَرّيني عَلى الخَريطة؟", "لو سَمَحْت، أنا تُهْت."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 24: Unit 4 Review ─────────────────────────────────────
  day_24: {
    english: {
      step1Sentences: [
        { text: "Where is the subway? Turn left and go straight.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "지하철 어디예요? 왼쪽으로 돌아서 직진하세요.", en: "Where is the subway? Turn left and go straight.", es: "¿Dónde está el metro? Gira a la izquierda y sigue recto." } },
        { text: "Excuse me, I'm lost. Can you help me?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "실례합니다, 길을 잃었어요. 도와주시겠어요?", en: "Excuse me, I'm lost. Can you help me?", es: "Perdone, estoy perdido. ¿Me puede ayudar?" } },
        { text: "One ticket to the airport, please. How much?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "공항행 표 한 장 주세요. 얼마예요?", en: "One ticket to the airport, please. How much?", es: "Un billete al aeropuerto. ¿Cuánto?" } },
        { text: "Cross the bridge and it's on your right.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "다리를 건너면 오른쪽에 있어요.", en: "Cross the bridge and it's on your right.", es: "Cruza el puente y está a tu derecha." }, recallRound: true },
        { text: "Is there a pharmacy nearby? It's about ten minutes on foot.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "근처에 약국 있나요? 걸어서 10분 정도예요.", en: "Is there a pharmacy nearby? About ten minutes on foot.", es: "¿Hay farmacia cerca? Unos diez minutos a pie." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "장소: 'Where is ___?' / 방향: 'Turn left/right, Go straight' / 고급 방향: 'Cross ___, next to ___' / 교통: 'One ticket to ___' / 도움: 'Excuse me, I'm lost'", en: "Places: 'Where is ___?' / Directions: 'Turn, Go straight' / Advanced: 'Cross, next to' / Transport: 'One ticket to ___' / Help: 'Excuse me, I'm lost'", es: "Lugares: 'Where is ___?' / Direcciones: 'Turn, Go straight' / Avanzado: 'Cross, next to' / Transporte: 'One ticket to ___' / Ayuda: 'Excuse me, I'm lost'" },
          examples: { ko: "Where is the subway? Turn left and go straight. (지하철 어디예요? 왼쪽으로 돌아서 직진하세요.)\nOne ticket to the airport, please. How much? (공항행 표 한 장 주세요. 얼마예요?)\nExcuse me, I'm lost. Can you help me? (실례합니다, 길을 잃었어요. 도와주시겠어요?)", en: "Where is the subway? Turn left and go straight. (Combining place-finding with directions.)\nOne ticket to the airport, please. How much? (Buying a ticket and asking the price.)\nExcuse me, I'm lost. Can you help me? (Asking for help when you're lost.)", es: "Where is the subway? Turn left and go straight. (¿Dónde está el metro? Gira y sigue recto.)\nOne ticket to the airport, please. How much? (Un billete al aeropuerto. ¿Cuánto?)\nExcuse me, I'm lost. Can you help me? (Perdone, estoy perdido. ¿Me ayuda?)" },
          mistakes: { ko: "❌ Where is at the subway?\n✅ Where is the subway? (is 뒤에 at 넣지 마세요!)\n\n❌ Does this bus goes to the museum?\n✅ Does this bus go to the museum? (Does 뒤에 동사원형!)", en: "❌ Where is at the subway?\n✅ Where is the subway? (No preposition after 'Where is'!)\n\n❌ Does this bus goes to the museum?\n✅ Does this bus go to the museum? (Base form after 'Does'!)", es: "❌ Where is at the subway?\n✅ Where is the subway? (Sin preposición después de 'Where is'.)\n\n❌ Does this bus goes to the museum?\n✅ Does this bus go to the museum? (Forma base después de 'Does'.)" },
          rudyTip: { ko: "이번 주 전체를 정리하면 딱 다섯 가지야: 장소 찾기, 방향 묻기, 고급 안내, 교통수단, 도움 요청. 이 다섯 개를 조합하면 어떤 도시에서든 살아남을 수 있어!", en: "This whole week boils down to five skills: finding places, asking directions, advanced navigation, transport, and asking for help. Combine these five and you can survive any city on Earth!", es: "Toda esta semana se resume en cinco habilidades: encontrar lugares, pedir direcciones, navegación avanzada, transporte y pedir ayuda. Combina estas cinco y sobrevivirás en cualquier ciudad." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Turn left and go ___.", answer: "straight", options: ["straight", "back", "up"], fullSentence: "Turn left and go straight.", fullSentenceMeaning: { ko: "왼쪽으로 돌아서 직진.", en: "Turn left and go straight.", es: "Gira a la izquierda y sigue recto." } },
          { type: "select", promptWithBlank: "Excuse me, I'm ___.", answer: "lost", options: ["lost", "fine", "hungry"], fullSentence: "Excuse me, I'm lost.", fullSentenceMeaning: { ko: "실례합니다, 길을 잃었어요.", en: "Excuse me, I'm lost.", es: "Perdone, estoy perdido." } },
          { type: "select", promptWithBlank: "One ___ to the airport.", answer: "ticket", options: ["ticket", "taxi", "bus"], fullSentence: "One ticket to the airport.", fullSentenceMeaning: { ko: "공항행 표 한 장.", en: "One ticket to the airport.", es: "Un billete al aeropuerto." } },
          { type: "input", promptWithBlank: "___ the bridge.", answer: "Cross", fullSentence: "Cross the bridge.", fullSentenceMeaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
          { type: "input", promptWithBlank: "Is there a pharmacy ___?", answer: "nearby", fullSentence: "Is there a pharmacy nearby?", fullSentenceMeaning: { ko: "근처에 약국 있나요?", en: "Pharmacy nearby?", es: "¿Farmacia cerca?" } },
          { type: "listening", audioText: "Is there a pharmacy nearby? It's about ten minutes on foot.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Is there a pharmacy nearby? It's about ten minutes on foot.", "Cross the bridge and it's on your right.", "Excuse me, I'm lost.", "One ticket to the airport, please."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¿Dónde está el metro? Gira a la izquierda y sigue recto.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "지하철 어디예요? 왼쪽으로 돌아서 직진.", en: "Where's the subway? Turn left and go straight.", es: "¿Dónde está el metro? Gira a la izquierda y sigue recto." } },
        { text: "Perdone, estoy perdido. ¿Me puede ayudar?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "실례합니다, 길을 잃었어요. 도와주세요.", en: "Excuse me, I'm lost. Can you help?", es: "Perdone, estoy perdido. ¿Me puede ayudar?" } },
        { text: "Un billete al aeropuerto, por favor. ¿Cuánto cuesta?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "공항행 표 한 장 주세요. 얼마예요?", en: "One ticket to the airport. How much?", es: "Un billete al aeropuerto. ¿Cuánto cuesta?" } },
        { text: "Cruza el puente y está a tu derecha.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "다리를 건너면 오른쪽에 있어요.", en: "Cross the bridge, it's on your right.", es: "Cruza el puente y está a tu derecha." }, recallRound: true },
        { text: "¿Hay una farmacia cerca? Está a unos diez minutos a pie.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "근처에 약국 있나요? 걸어서 10분.", en: "Pharmacy nearby? About ten minutes on foot.", es: "¿Hay farmacia? Diez minutos a pie." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "장소: '¿Dónde está ___?' / 방향: 'Gira a la ___' / 고급: 'Cruza ___, al lado de ___' / 교통: 'Un billete para ___' / 도움: 'Perdone, estoy perdido/a'", en: "Places: '¿Dónde está?' / Directions: 'Gira a la ___' / Advanced: 'Cruza, al lado de' / Transport: 'Un billete para ___' / Help: 'Estoy perdido/a'", es: "Lugares: '¿Dónde está?' / Direcciones: 'Gira a la ___' / Avanzado: 'Cruza, al lado de' / Transporte: 'Un billete para ___' / Ayuda: 'Estoy perdido/a'" },
          examples: { ko: "¿Dónde está el metro? Gira a la izquierda y sigue recto. (지하철 어디예요? 왼쪽으로 돌아서 직진.)\nUn billete al aeropuerto, por favor. ¿Cuánto cuesta? (공항행 표 한 장. 얼마예요?)\nPerdone, estoy perdido. ¿Me puede ayudar? (실례합니다, 길을 잃었어요. 도와주세요.)", en: "¿Dónde está el metro? Gira a la izquierda y sigue recto. (Where's the subway? Turn left and go straight.)\nUn billete al aeropuerto. ¿Cuánto cuesta? (A ticket to the airport. How much?)\nPerdone, estoy perdido. ¿Me puede ayudar? (Excuse me, I'm lost. Can you help?)", es: "¿Dónde está el metro? Gira a la izquierda y sigue recto. (Combinando lugar y dirección.)\nUn billete al aeropuerto. ¿Cuánto cuesta? (Comprar billete y preguntar precio.)\nPerdone, estoy perdido. ¿Me puede ayudar? (Pedir ayuda cuando estás perdido.)" },
          mistakes: { ko: "❌ ¿Dónde es el metro?\n✅ ¿Dónde está el metro? (위치는 estar! ser가 아니에요!)\n\n❌ Gira la izquierda.\n✅ Gira a la izquierda. ('a la'를 빼먹지 마세요!)", en: "❌ ¿Dónde es el metro?\n✅ ¿Dónde está el metro? (Location = estar, not ser!)\n\n❌ Gira la izquierda.\n✅ Gira a la izquierda. (Don't forget 'a la' before the direction!)", es: "❌ ¿Dónde es el metro?\n✅ ¿Dónde está el metro? (Ubicación = estar, no ser.)\n\n❌ Gira la izquierda.\n✅ Gira a la izquierda. (No olvides 'a la' antes de la dirección.)" },
          rudyTip: { ko: "이번 주 스페인어를 정리하면: estar로 위치, 'a la'로 방향, 'para'로 목적지! 이 세 가지 규칙만 기억하면 스페인어권 어디서든 길을 찾을 수 있어!", en: "This week's Spanish recap: estar for location, 'a la' for direction, 'para' for destination! Remember these three rules and you'll navigate anywhere in the Spanish-speaking world!", es: "Resumen de esta semana: estar para ubicación, 'a la' para dirección, 'para' para destino. Recuerda estas tres reglas y navegarás por cualquier país hispanohablante." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Gira a la izquierda y sigue ___.", answer: "recto", options: ["recto", "atrás", "arriba"], fullSentence: "Gira a la izquierda y sigue recto.", fullSentenceMeaning: { ko: "왼쪽으로 돌아서 직진.", en: "Turn left and go straight.", es: "Gira y sigue recto." } },
          { type: "select", promptWithBlank: "Perdone, estoy ___.", answer: "perdido", options: ["perdido", "bien", "hambriento"], fullSentence: "Perdone, estoy perdido.", fullSentenceMeaning: { ko: "길을 잃었어요.", en: "I'm lost.", es: "Estoy perdido." } },
          { type: "select", promptWithBlank: "Un ___ al aeropuerto.", answer: "billete", options: ["billete", "taxi", "autobús"], fullSentence: "Un billete al aeropuerto.", fullSentenceMeaning: { ko: "공항행 표 한 장.", en: "A ticket to the airport.", es: "Un billete al aeropuerto." } },
          { type: "input", promptWithBlank: "___ el puente.", answer: "Cruza", fullSentence: "Cruza el puente.", fullSentenceMeaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
          { type: "input", promptWithBlank: "¿Hay una farmacia ___?", answer: "cerca", fullSentence: "¿Hay una farmacia cerca?", fullSentenceMeaning: { ko: "약국 근처에 있나요?", en: "Pharmacy nearby?", es: "¿Farmacia cerca?" } },
          { type: "listening", audioText: "¿Hay una farmacia cerca? Está a unos diez minutos a pie.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Hay una farmacia cerca? Está a unos diez minutos a pie.", "Cruza el puente y está a tu derecha.", "Perdone, estoy perdido.", "Un billete al aeropuerto, por favor."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "지하철 어디예요? 왼쪽으로 돌아서 직진하세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "지하철 어디예요? 왼쪽으로 돌아서 직진.", en: "Where's the subway? Turn left, go straight.", es: "¿Dónde está el metro? Izquierda y recto." } },
        { text: "실례합니다, 길을 잃었어요. 도와주시겠어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "실례합니다, 길을 잃었어요. 도와주세요.", en: "Excuse me, I'm lost. Can you help?", es: "Perdone, estoy perdido. ¿Me ayuda?" } },
        { text: "공항행 표 한 장 주세요. 얼마예요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "공항행 표 한 장. 얼마예요?", en: "One ticket to the airport. How much?", es: "Un billete al aeropuerto. ¿Cuánto?" } },
        { text: "다리를 건너면 오른쪽에 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "다리 건너면 오른쪽.", en: "Cross the bridge, it's on your right.", es: "Cruza el puente, a la derecha." }, recallRound: true },
        { text: "근처에 약국 있나요? 걸어서 10분 정도예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "근처에 약국? 걸어서 10분.", en: "Pharmacy nearby? Ten minutes on foot.", es: "¿Farmacia? Diez minutos a pie." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "장소: '어디에 있나요?' / 방향: '왼쪽/오른쪽으로 돌아요' / 고급: '건너세요, 옆에 있어요' / 교통: '표 한 장 주세요' / 도움: '길을 잃었어요'", en: "Places: '어디에 있나요?' / Directions: '왼쪽/오른쪽으로 돌아요' / Advanced: '건너세요, 옆에' / Transport: '표 한 장 주세요' / Help: '길을 잃었어요'", es: "Lugares: '어디에 있나요?' / Direcciones: '왼쪽/오른쪽으로 돌아요' / Avanzado: '건너세요, 옆에' / Transporte: '표 한 장 주세요' / Ayuda: '길을 잃었어요'" },
          examples: { ko: "지하철 어디예요? 왼쪽으로 돌아서 직진하세요. (장소 + 방향 조합)\n공항행 표 한 장 주세요. 얼마예요? (교통 + 가격)\n실례합니다, 길을 잃었어요. 도와주시겠어요? (도움 요청)", en: "지하철 어디예요? 왼쪽으로 돌아서 직진하세요. (Where's the subway? Turn left and go straight.)\n공항행 표 한 장 주세요. 얼마예요? (One ticket to the airport. How much?)\n실례합니다, 길을 잃었어요. (Excuse me, I'm lost.)", es: "지하철 어디예요? 왼쪽으로 돌아서 직진하세요. (¿Dónde está el metro? Izquierda y recto.)\n공항행 표 한 장 주세요. 얼마예요? (Un billete al aeropuerto. ¿Cuánto?)\n실례합니다, 길을 잃었어요. (Perdone, estoy perdido.)" },
          mistakes: { ko: "❌ 왼쪽에 돌아서 직진하세요.\n✅ 왼쪽으로 돌아서 직진하세요. (방향은 '으로', 위치는 '에'!)\n\n❌ 길이 잃었어요.\n✅ 길을 잃었어요. ('길을'이 맞아요, '길이'가 아니에요!)", en: "❌ 왼쪽에 돌아서 직진하세요.\n✅ 왼쪽으로 돌아서 직진하세요. (Direction = 으로, not 에!)\n\n❌ 길이 잃었어요.\n✅ 길을 잃었어요. (길 is the object — use 을!)", es: "❌ 왼쪽에 돌아서 직진하세요.\n✅ 왼쪽으로 돌아서 직진하세요. (Dirección = 으로, no 에.)\n\n❌ 길이 잃었어요.\n✅ 길을 잃었어요. (길 es el objeto, usa 을.)" },
          rudyTip: { ko: "이번 주 한국어의 핵심은 조사야! '에' = 위치, '으로' = 방향, '까지' = 도착점, '을/를' = 목적어. 이 네 개만 마스터하면 서울에서 길 잃을 일 없어!", en: "This week's Korean secret: particles! 에 = location, 으로 = direction, 까지 = destination, 을/를 = object. Master these four and you'll never get lost in Seoul!", es: "El secreto del coreano esta semana: partículas. 에 = ubicación, 으로 = dirección, 까지 = destino, 을/를 = objeto. Domina estas cuatro y nunca te perderás en Seúl." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "왼쪽으로 돌아서 ___하세요.", answer: "직진", options: ["직진", "돌아", "나오"], fullSentence: "왼쪽으로 돌아서 직진하세요.", fullSentenceMeaning: { ko: "왼쪽으로 돌아서 직진.", en: "Turn left, go straight.", es: "Izquierda y recto." } },
          { type: "select", promptWithBlank: "길을 ___어요.", answer: "잃었", options: ["잃었", "찾았", "갔"], fullSentence: "길을 잃었어요.", fullSentenceMeaning: { ko: "길을 잃었어요.", en: "I'm lost.", es: "Estoy perdido." } },
          { type: "select", promptWithBlank: "공항행 ___ 한 장 주세요.", answer: "표", options: ["표", "택시", "버스"], fullSentence: "공항행 표 한 장 주세요.", fullSentenceMeaning: { ko: "공항행 표 한 장.", en: "One ticket to the airport.", es: "Un billete al aeropuerto." } },
          { type: "input", promptWithBlank: "다리를 ___세요.", answer: "건너", fullSentence: "다리를 건너세요.", fullSentenceMeaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
          { type: "input", promptWithBlank: "___에 약국 있나요?", answer: "근처", fullSentence: "근처에 약국 있나요?", fullSentenceMeaning: { ko: "근처에 약국?", en: "Pharmacy nearby?", es: "¿Farmacia cerca?" } },
          { type: "listening", audioText: "근처에 약국 있나요? 걸어서 10분 정도예요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["근처에 약국 있나요? 걸어서 10분 정도예요.", "다리를 건너면 오른쪽에 있어요.", "길을 잃었어요.", "공항행 표 한 장 주세요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Di mana stasiun? Belok kiri dan jalan lurus terus.", speechLang: "id-ID", meaning: { ko: "지하철 어디예요? 왼쪽으로 돌아서 직진하세요.", en: "Where is the subway? Turn left and go straight.", es: "¿Dónde está el metro? Gira a la izquierda y sigue recto." } },
        { text: "Permisi, saya tersesat. Bisa bantu saya?", speechLang: "id-ID", meaning: { ko: "실례합니다, 길을 잃었어요. 도와주시겠어요?", en: "Excuse me, I'm lost. Can you help me?", es: "Perdone, estoy perdido. ¿Me puede ayudar?" } },
        { text: "Satu tiket ke bandara, tolong. Berapa?", speechLang: "id-ID", meaning: { ko: "공항행 표 한 장 주세요. 얼마예요?", en: "One ticket to the airport, please. How much?", es: "Un billete al aeropuerto. ¿Cuánto?" } },
        { text: "Seberangi jembatan dan ada di sebelah kanan Anda.", speechLang: "id-ID", meaning: { ko: "다리를 건너면 오른쪽에 있어요.", en: "Cross the bridge and it's on your right.", es: "Cruza el puente y está a tu derecha." }, recallRound: true },
        { text: "Apakah ada apotek di dekat sini? Sekitar sepuluh menit jalan kaki.", speechLang: "id-ID", meaning: { ko: "근처에 약국 있나요? 걸어서 10분 정도예요.", en: "Is there a pharmacy nearby? About ten minutes on foot.", es: "¿Hay farmacia cerca? Unos diez minutos a pie." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "장소: 'Di mana ___?' / 방향: 'Belok kiri/kanan, Jalan lurus terus' / 고급 방향: 'Seberangi ___, di sebelah ___' / 교통: 'Satu tiket ke ___' / 도움: 'Permisi, saya tersesat'", en: "Places: 'Di mana ___?' / Directions: 'Belok, Jalan lurus terus' / Advanced: 'Seberangi, di sebelah' / Transport: 'Satu tiket ke ___' / Help: 'Permisi, saya tersesat'", es: "Lugares: 'Di mana ___?' / Direcciones: 'Belok, Jalan lurus terus' / Avanzado: 'Seberangi, di sebelah' / Transporte: 'Satu tiket ke ___' / Ayuda: 'Permisi, saya tersesat'" },
          examples: { ko: "Di mana stasiun? Belok kiri dan jalan lurus terus. (지하철 어디예요? 왼쪽으로 돌아서 직진하세요.)\nSatu tiket ke bandara, tolong. Berapa? (공항행 표 한 장 주세요. 얼마예요?)\nPermisi, saya tersesat. Bisa bantu saya? (실례합니다, 길을 잃었어요. 도와주시겠어요?)", en: "Di mana stasiun? Belok kiri dan jalan lurus terus. (Combining place-finding with directions.)\nSatu tiket ke bandara, tolong. Berapa? (Buying a ticket and asking the price.)\nPermisi, saya tersesat. Bisa bantu saya? (Asking for help when you're lost.)", es: "Di mana stasiun? Belok kiri dan jalan lurus terus. (¿Dónde está el metro? Gira y sigue recto.)\nSatu tiket ke bandara, tolong. Berapa? (Un billete al aeropuerto. ¿Cuánto?)\nPermisi, saya tersesat. Bisa bantu saya? (Perdone, estoy perdido. ¿Me ayuda?)" },
          mistakes: { ko: "❌ Di mana di stasiun?\n✅ Di mana stasiun? ('di mana' 뒤에 'di' 또 붙이지 마세요!)\n\n❌ Belok ke kiri.\n✅ Belok kiri. ('belok' 다음에 바로 방향 — 'ke' 필요 없어요!)", en: "❌ Di mana di stasiun?\n✅ Di mana stasiun? (No extra 'di' after 'Di mana'!)\n\n❌ Belok ke kiri.\n✅ Belok kiri. (Direction right after 'belok' — no 'ke' needed!)", es: "❌ Di mana di stasiun?\n✅ Di mana stasiun? (Sin 'di' extra después de 'Di mana'.)\n\n❌ Belok ke kiri.\n✅ Belok kiri. (Dirección justo después de 'belok', sin 'ke'.)" },
          rudyTip: { ko: "이번 주 인도네시아어를 정리하면 딱 다섯 가지야: 장소 찾기(Di mana), 방향 묻기(Belok), 고급 안내(Seberangi/di sebelah), 교통수단(tiket ke), 도움 요청(tersesat). 이 다섯 개를 조합하면 어떤 도시에서든 살아남을 수 있어!", en: "This whole week boils down to five skills in Indonesian: finding places (Di mana), directions (Belok), advanced navigation (Seberangi/di sebelah), transport (tiket ke), and asking for help (tersesat). Combine these five and you can survive any city!", es: "Toda esta semana se resume en cinco habilidades en indonesio: encontrar lugares (Di mana), direcciones (Belok), navegación avanzada (Seberangi/di sebelah), transporte (tiket ke) y pedir ayuda (tersesat). ¡Combínalas y sobrevivirás en cualquier ciudad!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Belok kiri dan jalan ___ terus.", answer: "lurus", options: ["lurus", "kembali", "atas"], fullSentence: "Belok kiri dan jalan lurus terus.", fullSentenceMeaning: { ko: "왼쪽으로 돌아서 직진.", en: "Turn left and go straight.", es: "Gira a la izquierda y sigue recto." } },
          { type: "select", promptWithBlank: "Permisi, saya ___.", answer: "tersesat", options: ["tersesat", "baik", "lapar"], fullSentence: "Permisi, saya tersesat.", fullSentenceMeaning: { ko: "실례합니다, 길을 잃었어요.", en: "Excuse me, I'm lost.", es: "Perdone, estoy perdido." } },
          { type: "select", promptWithBlank: "Satu ___ ke bandara.", answer: "tiket", options: ["tiket", "taksi", "bus"], fullSentence: "Satu tiket ke bandara.", fullSentenceMeaning: { ko: "공항행 표 한 장.", en: "One ticket to the airport.", es: "Un billete al aeropuerto." } },
          { type: "input", promptWithBlank: "___ jembatan.", answer: "Seberangi", fullSentence: "Seberangi jembatan.", fullSentenceMeaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente." } },
          { type: "input", promptWithBlank: "Apakah ada apotek di ___ sini?", answer: "dekat", fullSentence: "Apakah ada apotek di dekat sini?", fullSentenceMeaning: { ko: "근처에 약국 있나요?", en: "Pharmacy nearby?", es: "¿Farmacia cerca?" } },
          { type: "listening", audioText: "Apakah ada apotek di dekat sini? Sekitar sepuluh menit jalan kaki.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Apakah ada apotek di dekat sini? Sekitar sepuluh menit jalan kaki.", "Seberangi jembatan dan ada di sebelah kanan Anda.", "Permisi, saya tersesat.", "Satu tiket ke bandara, tolong."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "فين المِترو؟ خُشّ شِمال وامْشي عَلى طول.", speechLang: "ar-EG", meaning: { ko: "feen el-metro? khosh shemaal w-emshy 3ala tool · 지하철 어디예요? 왼쪽으로 돌아서 직진하세요.", en: "feen el-metro? khosh shemaal w-emshy 3ala tool · Where is the subway? Turn left and go straight.", es: "feen el-metro? khosh shemaal w-emshy 3ala tool · ¿Dónde está el metro? Gira a la izquierda y sigue recto.", id: "feen el-metro? khosh shemaal w-emshy 3ala tool · Di mana stasiun? Belok kiri dan jalan lurus terus." } },
        { text: "لو سَمَحْت، أنا تُهْت. مُمْكِن تِساعِدني؟", speechLang: "ar-EG", meaning: { ko: "law samaht, ana toht. momken tesa3edni? · 실례합니다, 길을 잃었어요. 도와주시겠어요?", en: "law samaht, ana toht. momken tesa3edni? · Excuse me, I'm lost. Can you help me?", es: "law samaht, ana toht. momken tesa3edni? · Perdone, estoy perdido. ¿Me puede ayudar?", id: "law samaht, ana toht. momken tesa3edni? · Permisi, saya tersesat. Bisa bantu saya?" } },
        { text: "تَذْكَرة للمَطار، لو سَمَحْت. بِكام؟", speechLang: "ar-EG", meaning: { ko: "tazkara lel-mataar, law samaht. bekaam? · 공항행 표 한 장 주세요. 얼마예요?", en: "tazkara lel-mataar, law samaht. bekaam? · One ticket to the airport, please. How much?", es: "tazkara lel-mataar, law samaht. bekaam? · Un billete al aeropuerto. ¿Cuánto?", id: "tazkara lel-mataar, law samaht. bekaam? · Satu tiket ke bandara, tolong. Berapa?" } },
        { text: "اعْدي الكُوبْري وهِيَّ عَلى يِمينَك.", speechLang: "ar-EG", meaning: { ko: "e3dy el-kobry w-heyya 3ala yemeenak · 다리를 건너면 오른쪽에 있어요.", en: "e3dy el-kobry w-heyya 3ala yemeenak · Cross the bridge and it's on your right.", es: "e3dy el-kobry w-heyya 3ala yemeenak · Cruza el puente y está a tu derecha.", id: "e3dy el-kobry w-heyya 3ala yemeenak · Seberangi jembatan dan ada di sebelah kanan Anda." }, recallRound: true },
        { text: "في صَيْدَلِيّة قُرَيِّب؟ حَوالي عَشَر دَقايِق مَشْي.", speechLang: "ar-EG", meaning: { ko: "fee saydaleyya orayyeb? hawaali 3ashar da'aaye' mashy · 근처에 약국 있나요? 걸어서 10분 정도예요.", en: "fee saydaleyya orayyeb? hawaali 3ashar da'aaye' mashy · Is there a pharmacy nearby? About ten minutes on foot.", es: "fee saydaleyya orayyeb? hawaali 3ashar da'aaye' mashy · ¿Hay farmacia cerca? Unos diez minutos a pie.", id: "fee saydaleyya orayyeb? hawaali 3ashar da'aaye' mashy · Apakah ada apotek di dekat sini? Sekitar sepuluh menit jalan kaki." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "장소: 'فين ___؟'(feen ___?) / 방향: 'خُشّ شِمال/يِمين، امْشي عَلى طول'(khosh shemaal/yemeen, emshy 3ala tool) / 고급 방향: 'اعْدي ___، جَنْب ___'(e3dy ___, ganb ___) / 교통: 'تَذْكَرة لِـ ___'(tazkara le-___) / 도움: 'أنا تُهْت'(ana toht)", en: "Places: 'فين ___؟' (feen ___?) / Directions: 'خُشّ شِمال/يِمين، امْشي عَلى طول' (khosh shemaal/yemeen, emshy 3ala tool) / Advanced: 'اعْدي ___، جَنْب ___' (e3dy ___, ganb ___) / Transport: 'تَذْكَرة لِـ ___' (tazkara le-___) / Help: 'أنا تُهْت' (ana toht)", es: "Lugares: 'فين ___؟' (feen ___?) / Direcciones: 'خُشّ شِمال/يِمين، امْشي عَلى طول' (khosh shemaal/yemeen, emshy 3ala tool) / Avanzado: 'اعْدي ___، جَنْب ___' (e3dy ___, ganb ___) / Transporte: 'تَذْكَرة لِـ ___' (tazkara le-___) / Ayuda: 'أنا تُهْت' (ana toht)" },
          examples: { ko: "فين المِترو؟ خُشّ شِمال وامْشي عَلى طول. (feen el-metro? khosh shemaal w-emshy 3ala tool · 지하철 어디예요? 왼쪽으로 돌아서 직진하세요.)\nتَذْكَرة للمَطار، لو سَمَحْت. بِكام؟ (tazkara lel-mataar, law samaht. bekaam? · 공항행 표 한 장 주세요. 얼마예요?)\nلو سَمَحْت، أنا تُهْت. مُمْكِن تِساعِدني؟ (law samaht, ana toht. momken tesa3edni? · 실례합니다, 길을 잃었어요. 도와주시겠어요?)", en: "فين المِترو؟ خُشّ شِمال وامْشي عَلى طول. (feen el-metro? khosh shemaal w-emshy 3ala tool · Where is the subway? Turn left and go straight.)\nتَذْكَرة للمَطار، لو سَمَحْت. بِكام؟ (tazkara lel-mataar, law samaht. bekaam? · One ticket to the airport, please. How much?)\nلو سَمَحْت، أنا تُهْت. مُمْكِن تِساعِدني؟ (law samaht, ana toht. momken tesa3edni? · Excuse me, I'm lost. Can you help me?)", es: "فين المِترو؟ خُشّ شِمال وامْشي عَلى طول. (feen el-metro? khosh shemaal w-emshy 3ala tool · ¿Dónde está el metro? Gira a la izquierda y sigue recto.)\nتَذْكَرة للمَطار، لو سَمَحْت. بِكام؟ (tazkara lel-mataar, law samaht. bekaam? · Un billete al aeropuerto. ¿Cuánto?)\nلو سَمَحْت، أنا تُهْت. مُمْكِن تِساعِدني؟ (law samaht, ana toht. momken tesa3edni? · Perdone, estoy perdido. ¿Me puede ayudar?)" },
          mistakes: { ko: "❌ أين المترو؟ (책에 나오는 표준어 'ayna')\n✅ فين المِترو؟ (feen el-metro — 무조건 'feen'!)\n\n❌ هَل يَذْهَب هذا الباص؟ (표준어)\n✅ الأُتوبيس ده بيِروح؟ (el-otobees da beyrooh? — 이집트는 명사 먼저, 'ده/da'도 뒤에!)", en: "❌ أين المترو؟ (textbook MSA 'ayna')\n✅ فين المِترو؟ (feen el-metro — always 'feen'!)\n\n❌ هَل يَذْهَب هذا الباص؟ (MSA)\n✅ الأُتوبيس ده بيِروح؟ (el-otobees da beyrooh? — Egyptian puts the noun first, with 'ده/da' after it!)", es: "❌ أين المترو؟ (MSA de libro 'ayna')\n✅ فين المِترو؟ (feen el-metro — siempre 'feen')\n\n❌ هَل يَذْهَب هذا الباص؟ (MSA)\n✅ الأُتوبيس ده بيِروح؟ (el-otobees da beyrooh? — en egipcio el sustantivo va primero, con 'ده/da' después)" },
          rudyTip: { ko: "이번 주 이집트 아랍어를 정리하면 딱 다섯 가지야: 장소 찾기('فين؟'/feen?), 방향('خُشّ'/khosh + 'عَلى طول'/3ala tool), 고급 안내('اعْدي'/e3dy + 'جَنْب'/ganb), 교통('بِكام؟'/bekaam? + 'عَلى'/3ala), 도움('أنا تُهْت'/ana toht). 표준어 다 잊어버리고 이것만 알면 카이로에서 살아남아!", en: "This whole week of Egyptian Arabic boils down to five skills: finding places ('فين؟'/feen?), directions ('خُشّ'/khosh + 'عَلى طول'/3ala tool), advanced navigation ('اعْدي'/e3dy + 'جَنْب'/ganb), transport ('بِكام؟'/bekaam? + 'عَلى'/3ala), and asking for help ('أنا تُهْت'/ana toht). Forget the textbook — these five let you survive Cairo!", es: "Toda esta semana de árabe egipcio se resume en cinco habilidades: lugares ('فين؟'/feen?), direcciones ('خُشّ'/khosh + 'عَلى طول'/3ala tool), navegación avanzada ('اعْدي'/e3dy + 'جَنْب'/ganb), transporte ('بِكام؟'/bekaam? + 'عَلى'/3ala) y pedir ayuda ('أنا تُهْت'/ana toht). ¡Olvida el libro y con estas cinco sobrevivirás en El Cairo!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "خُشّ شِمال وامْشي عَلى ___.", answer: "طول", options: ["طول", "وَرا", "فوق"], fullSentence: "خُشّ شِمال وامْشي عَلى طول.", fullSentenceMeaning: { ko: "왼쪽으로 돌아서 직진.", en: "Turn left and go straight.", es: "Gira a la izquierda y sigue recto.", id: "Belok kiri dan jalan lurus terus." } },
          { type: "select", promptWithBlank: "لو سَمَحْت، أنا ___.", answer: "تُهْت", options: ["تُهْت", "كُوَيِّس", "جِعان"], fullSentence: "لو سَمَحْت، أنا تُهْت.", fullSentenceMeaning: { ko: "실례합니다, 길을 잃었어요.", en: "Excuse me, I'm lost.", es: "Perdone, estoy perdido.", id: "Permisi, saya tersesat." } },
          { type: "select", promptWithBlank: "___ للمَطار، لو سَمَحْت.", answer: "تَذْكَرة", options: ["تَذْكَرة", "تاكْسي", "أُتوبيس"], fullSentence: "تَذْكَرة للمَطار، لو سَمَحْت.", fullSentenceMeaning: { ko: "공항행 표 한 장.", en: "One ticket to the airport.", es: "Un billete al aeropuerto.", id: "Satu tiket ke bandara." } },
          { type: "input", promptWithBlank: "___ الكُوبْري.", answer: "اعْدي", fullSentence: "اعْدي الكُوبْري.", fullSentenceMeaning: { ko: "다리를 건너세요.", en: "Cross the bridge.", es: "Cruza el puente.", id: "Seberangi jembatan." } },
          { type: "input", promptWithBlank: "في صَيْدَلِيّة ___؟", answer: "قُرَيِّب", fullSentence: "في صَيْدَلِيّة قُرَيِّب؟", fullSentenceMeaning: { ko: "근처에 약국 있나요?", en: "Pharmacy nearby?", es: "¿Farmacia cerca?", id: "Apotek di dekat sini?" } },
          { type: "listening", audioText: "في صَيْدَلِيّة قُرَيِّب؟ حَوالي عَشَر دَقايِق مَشْي.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["في صَيْدَلِيّة قُرَيِّب؟ حَوالي عَشَر دَقايِق مَشْي.", "اعْدي الكُوبْري وهِيَّ عَلى يِمينَك.", "لو سَمَحْت، أنا تُهْت.", "تَذْكَرة للمَطار، لو سَمَحْت."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: MISSION TALK (Unit 4)
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_CONTENT_UNIT4: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  day_19: {
    english: { situation: { ko: "루디 탐정이 정보원이 남긴 암호 지시를 따라 블랙 씨의 은신처를 찾아야 합니다! 장소를 물어가며 목적지를 찾으세요.", en: "Detective Rudy must follow coded directions left by an informant to reach Mr. Black's hideout! Ask about locations to find your way.", es: "¡El detective Rudy debe seguir las instrucciones en clave dejadas por un informante para llegar al escondite del Sr. Black! Pregunta sobre lugares para encontrar el camino." }, gptPrompt: "You are a friendly local playing the role of an informant who left coded directions for Detective Rudy (the user). They must find Mr. Black's hideout by asking about locations. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: 1) they ask where a place is 2) tell them it's near/far 3) mention nearby landmarks (subway station, cafe, museum) 4) tell them walking time. If they struggle, remind them about 'I don't understand' from Unit 1. Keep very simple.", speechLang: "en-GB", suggestedAnswers: ["Where is the hideout?", "Is it far?", "Is there a subway station nearby?", "How far is it?", "It's near the museum, right?", "Thank you!"] },
    spanish: { situation: { ko: "루디 탐정이 정보원의 암호 지시를 따라 블랙 씨의 은신처를 찾아야 합니다!", en: "Detective Rudy follows coded directions to Mr. Black's hideout!", es: "¡El detective Rudy sigue las instrucciones en clave para llegar al escondite del Sr. Black!" }, gptPrompt: "You are a local informant helping Detective Rudy find Mr. Black's hideout. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: asking where places are, near/far, landmarks, walking time. Keep simple.", speechLang: "es-ES", suggestedAnswers: ["¿Dónde está el escondite?", "¿Está lejos?", "¿Hay una estación de metro cerca?", "¿A qué distancia está?", "Está cerca del museo, ¿verdad?", "¡Gracias!"] },
    korean: { situation: { ko: "탐정 루디가 정보원이 남긴 암호 지시를 따라 블랙 씨의 은신처를 찾아야 해요!", en: "Detective Rudy follows coded directions to Mr. Black's hideout!", es: "¡Detective Rudy sigue las instrucciones al escondite del Sr. Black!" }, gptPrompt: "You are a local informant helping Detective Rudy find Mr. Black's hideout. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: asking where places are, near/far, landmarks, walking time. Keep simple.", speechLang: "ko-KR", suggestedAnswers: ["은신처가 어디에 있나요?", "멀어요?", "근처에 지하철역이 있나요?", "얼마나 멀어요?", "박물관 근처 맞나요?", "감사합니다!"] },
    indonesian: { situation: { ko: "탐정 루디가 정보원이 남긴 암호 지시를 따라 블랙 씨의 은신처를 찾아야 해요!", en: "Detective Rudy follows coded directions to Mr. Black's hideout!", es: "¡Detective Rudy sigue las instrucciones al escondite del Sr. Black!" }, gptPrompt: "You are a local informant helping Detective Rudy find Mr. Black's hideout. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: asking where places are ('Di mana ___?'), near/far ('dekat/jauh'), landmarks (stasiun, kafe, museum), and walking time ('berapa menit jalan kaki'). Keep simple.", speechLang: "id-ID", suggestedAnswers: ["Di mana tempat persembunyiannya?", "Apakah jauh?", "Apakah ada stasiun di dekat sini?", "Berapa jauh dari sini?", "Dekat museum, kan?", "Terima kasih!"] },
    arabic: { situation: { ko: "탐정 루디가 정보원이 남긴 암호 지시를 따라 블랙 씨의 은신처를 찾아야 해요!", en: "Detective Rudy follows coded directions to Mr. Black's hideout!", es: "¡Detective Rudy sigue las instrucciones al escondite del Sr. Black!" }, gptPrompt: "You are a local informant helping Detective Rudy find Mr. Black's hideout. Detective/mystery framing throughout. Use simple A1 EGYPTIAN COLLOQUIAL Arabic (NOT Modern Standard Arabic — use everyday spoken Cairene: 'فين' / feen for 'where', 'جَنْب' / ganb for 'next to', 'قُرَيِّب' / orayyeb, 'بِعيد' / be3eed, never textbook forms like 'ayna'). Practice: asking where places are ('فين ___؟'), near/far ('قُرَيِّب/بِعيد'), landmarks (المِترو / metro, القَهْوة / cafe, المَتْحَف / museum), and walking time ('قَدّ إيه مَشْي؟' / add eh mashy?). Keep sentences short and write Arabic with harakat (short vowels).", speechLang: "ar-EG", suggestedAnswers: ["فين مَخْبأ بْلاك؟", "هُوَّ بِعيد؟", "في مَحَطّة مِترو قُرَيِّب؟", "هُوَّ بِعيد قَدّ إيه؟", "جَنْب المَتْحَف، صَح؟", "شُكْراً!"] },
  },

  day_20: {
    english: { situation: { ko: "루디 탐정의 서울 연락원이 블랙 씨의 아지트로 가는 길을 알려주고 있습니다. 2분 안에 이해해야 합니다!", en: "Detective Rudy's Seoul contact is giving directions to Mr. Black's lair. He has 2 minutes to understand!", es: "El contacto de Seúl del detective Rudy da las instrucciones para llegar al refugio del Sr. Black. ¡Tiene 2 minutos!" }, gptPrompt: "You are Detective Rudy's Seoul contact giving directions to Mr. Black's lair. Detective/mystery framing throughout. Simple A1 {targetLang}. Give step-by-step directions using: turn left, turn right, go straight, it's on your left/right. Ask the user to repeat directions back to you. If they get confused, simplify. Keep urgent but friendly.", speechLang: "en-GB", suggestedAnswers: ["Turn left?", "Go straight ahead.", "It's on the right?", "Turn right at the corner.", "I understand!", "Can you say that again?"] },
    spanish: { situation: { ko: "서울 연락원이 블랙 씨의 아지트로 가는 길을 알려줍니다. 빨리 이해해야 해요!", en: "Seoul contact gives directions to Mr. Black's lair. Quick!", es: "El contacto da instrucciones para el refugio del Sr. Black. ¡Rápido!" }, gptPrompt: "You are Detective Rudy's Seoul contact giving directions to Mr. Black's lair. Detective/mystery framing throughout. Simple A1 {targetLang}. Use: gira a la izquierda/derecha, sigue recto, está a tu izquierda/derecha. Ask user to repeat back. Keep urgent but friendly.", speechLang: "es-ES", suggestedAnswers: ["¿Giro a la izquierda?", "Sigo todo recto.", "¿Está a la derecha?", "Giro a la derecha en la esquina.", "¡Entiendo!", "¿Puede repetir?"] },
    korean: { situation: { ko: "탐정 루디의 서울 연락원이 블랙 씨의 아지트로 가는 길을 알려줘요. 빨리 이해해야 해요!", en: "Seoul contact gives directions to Mr. Black's lair. Hurry!", es: "Contacto de Seúl dando instrucciones al refugio del Sr. Black." }, gptPrompt: "You are Detective Rudy's Seoul contact giving directions to Mr. Black's lair. Detective/mystery framing throughout. Simple A1 {targetLang}. Use: 왼쪽/오른쪽으로 돌아요, 직진하세요, 왼쪽/오른쪽에 있어요. Ask user to repeat back. Keep urgent but friendly.", speechLang: "ko-KR", suggestedAnswers: ["왼쪽으로 돌아요?", "직진하세요.", "오른쪽에 있어요?", "모퉁이에서 오른쪽으로요?", "알겠어요!", "다시 한번 말해 주시겠어요?"] },
    indonesian: { situation: { ko: "탐정 루디의 서울 연락원이 블랙 씨의 아지트로 가는 길을 알려줘요. 빨리 이해해야 해요!", en: "Seoul contact gives directions to Mr. Black's lair. Hurry!", es: "Contacto de Seúl dando instrucciones al refugio del Sr. Black." }, gptPrompt: "You are Detective Rudy's Seoul contact giving directions to Mr. Black's lair. Detective/mystery framing throughout. Simple A1 {targetLang}. Use: 'Belok kiri/kanan', 'Jalan lurus terus', 'Ada di sebelah kiri/kanan'. Ask the user to repeat the directions back to you. Keep urgent but friendly.", speechLang: "id-ID", suggestedAnswers: ["Belok kiri?", "Jalan lurus terus.", "Ada di sebelah kanan?", "Belok kanan di pertigaan?", "Saya mengerti!", "Bisa tolong ulangi?"] },
    arabic: { situation: { ko: "탐정 루디의 서울 연락원이 블랙 씨의 아지트로 가는 길을 알려줘요. 빨리 이해해야 해요!", en: "Seoul contact gives directions to Mr. Black's lair. Hurry!", es: "Contacto de Seúl dando instrucciones al refugio del Sr. Black." }, gptPrompt: "You are Detective Rudy's Seoul contact giving directions to Mr. Black's lair. Detective/mystery framing throughout. Use simple A1 EGYPTIAN COLLOQUIAL Arabic (NOT MSA — use spoken Cairene: 'خُشّ شِمال/يِمين' / khosh shemaal/yemeen for 'turn left/right', 'امْشي عَلى طول' / emshy 3ala tool for 'go straight', 'عَلى شِمالَك/يِمينَك' / 3ala shemaalak/yemeenak, never textbook 'leff' or 'mostaqeem'). Give step-by-step directions and ask the user to repeat the directions back to you. Keep urgent but friendly, and write Arabic with harakat.", speechLang: "ar-EG", suggestedAnswers: ["أخُشّ شِمال؟", "امْشي عَلى طول.", "هِيَّ عَلى يِمينَك؟", "أخُشّ يِمين عِنْد النّاصْية؟", "فِهِمْت!", "مُمْكِن تِقول تاني؟"] },
  },

  day_21: {
    english: { situation: { ko: "루디 탐정이 명동에서 용의자를 미행하다가 길을 잃었습니다. 시간이 없어요!", en: "Detective Rudy lost a suspect in Myeongdong and got lost himself. Time is running out!", es: "El detective Rudy perdió a un sospechoso en Myeongdong y se perdió él mismo. ¡Se acaba el tiempo!" }, gptPrompt: "You are a helpful stranger in Myeongdong, Seoul. Detective Rudy (the user) is lost after chasing a suspect. Detective/mystery framing throughout. Simple A1 {targetLang}. Give complex directions: cross the bridge, next to a store, they passed it, at the intersection, take subway exit. Be patient but create mild urgency. If they say 'I don't understand', simplify.", speechLang: "en-GB", suggestedAnswers: ["I'm lost!", "Cross the bridge?", "It's next to the store?", "I passed it?", "Take exit 3?", "Thank you so much!"] },
    spanish: { situation: { ko: "루디 탐정이 명동에서 용의자를 추적하다 길을 잃었어요!", en: "Detective Rudy lost a suspect and got lost in Myeongdong!", es: "¡El detective Rudy perdió un sospechoso y se perdió en Myeongdong!" }, gptPrompt: "You are a helpful stranger in Myeongdong. Detective Rudy (the user) is lost after chasing a suspect. Detective/mystery framing throughout. Simple A1 {targetLang}. Give directions using: cruza, al lado de, lo pasaste, en el cruce, salida del metro. Be patient. If they say 'No entiendo', simplify.", speechLang: "es-ES", suggestedAnswers: ["¡Estoy perdido!", "¿Cruzo el puente?", "¿Al lado de la tienda?", "¿Lo pasé?", "¿Salida 3?", "¡Muchas gracias!"] },
    korean: { situation: { ko: "탐정 루디가 명동에서 용의자를 추적하다 길을 잃었어요. 시간이 없어요!", en: "Detective Rudy lost a suspect and got lost in Myeongdong! No time!", es: "¡Detective Rudy perdido en Myeongdong tras perder al sospechoso!" }, gptPrompt: "You are a helpful stranger in Myeongdong. Detective Rudy (the user) is lost after chasing a suspect. Detective/mystery framing throughout. Simple A1 {targetLang}. Use: 건너세요, 옆에, 지나쳤어요, 교차로에서, 출구로. Be patient. If they say '이해를 못 했어요', simplify.", speechLang: "ko-KR", suggestedAnswers: ["길을 잃었어요!", "다리를 건너요?", "편의점 옆이요?", "지나쳤어요?", "3번 출구요?", "정말 감사합니다!"] },
    indonesian: { situation: { ko: "탐정 루디가 명동에서 용의자를 추적하다 길을 잃었어요. 시간이 없어요!", en: "Detective Rudy lost a suspect and got lost in Myeongdong! No time!", es: "¡Detective Rudy perdido en Myeongdong tras perder al sospechoso!" }, gptPrompt: "You are a helpful stranger in Myeongdong. Detective Rudy (the user) is lost after chasing a suspect. Detective/mystery framing throughout. Simple A1 {targetLang}. Give directions using: 'Seberangi jembatan', 'di sebelah toko', 'Anda sudah melewatinya', 'di persimpangan', 'pintu keluar'. Be patient. If they say 'Saya tidak mengerti', simplify.", speechLang: "id-ID", suggestedAnswers: ["Saya tersesat!", "Seberangi jembatan?", "Di sebelah minimarket?", "Saya sudah melewatinya?", "Pintu keluar tiga?", "Terima kasih banyak!"] },
    arabic: { situation: { ko: "탐정 루디가 명동에서 용의자를 추적하다 길을 잃었어요. 시간이 없어요!", en: "Detective Rudy lost a suspect and got lost in Myeongdong! No time!", es: "¡Detective Rudy perdido en Myeongdong tras perder al sospechoso!" }, gptPrompt: "You are a helpful stranger in Myeongdong. Detective Rudy (the user) is lost after chasing a suspect. Detective/mystery framing throughout. Use simple A1 EGYPTIAN COLLOQUIAL Arabic (NOT MSA — use spoken Cairene: 'اعْدي الكُوبْري' / e3dy el-kobry for 'cross the bridge', 'جَنْب البَقّالة' / ganb el-ba''aala for 'next to the shop', 'إنْتَ فُتّها' / enta fottaha for 'you passed it', 'عِنْد التَّقاطُع' / 3and el-ta'aato3, 'مَخْرَج' / makhrag for 'exit', never textbook 'o3bor' or 'bejaaneb'). Be patient. If they say 'أنا مِش فاهِم' / ana mesh fahem, simplify. Write Arabic with harakat.", speechLang: "ar-EG", suggestedAnswers: ["أنا تُهْت!", "أعْدي الكُوبْري؟", "جَنْب البَقّالة؟", "أنا فُتّها؟", "مَخْرَج تَلاتة؟", "شُكْراً جَزيلاً!"] },
  },

  day_22: {
    english: { situation: { ko: "카이로 공항입니다. 루디 탐정이 용의자를 따라잡으려면 빨리 시내로 가야 합니다!", en: "Cairo Airport. Detective Rudy must get downtown fast to catch a suspect!", es: "Aeropuerto de El Cairo. ¡El detective Rudy debe llegar al centro rápido para atrapar a un sospechoso!" }, gptPrompt: "You are a taxi driver at Cairo airport. Detective Rudy (the user) needs to get downtown quickly to catch a suspect. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: 1) getting a taxi 2) saying destination 3) asking price 4) then switch to a ticket booth for bus/train tickets. Create two mini-scenarios: taxi first, then public transport. Mix in numbers from Unit 2 for prices.", speechLang: "en-GB", suggestedAnswers: ["Can I get a taxi?", "To the city center, please.", "How much?", "That's too expensive!", "One ticket, please.", "Does this bus go downtown?"] },
    spanish: { situation: { ko: "카이로 공항에서 용의자를 잡으러 빨리 시내로 가야 해요!", en: "Cairo Airport. Catch the suspect downtown, fast!", es: "Aeropuerto de El Cairo. ¡Atrapa al sospechoso en el centro, rápido!" }, gptPrompt: "You are a taxi driver at Cairo airport. Detective Rudy (the user) needs downtown quickly to catch a suspect. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: taxi, destination, price, then bus/train tickets. Mix in numbers for prices.", speechLang: "es-ES", suggestedAnswers: ["¿Un taxi, por favor?", "Al centro, por favor.", "¿Cuánto cuesta?", "¡Muy caro!", "Un billete, por favor.", "¿Este autobús va al centro?"] },
    korean: { situation: { ko: "카이로 공항! 탐정 루디가 용의자를 잡으러 빨리 시내로 가야 해요!", en: "Cairo Airport! Detective Rudy must get downtown to catch the suspect!", es: "¡Aeropuerto! ¡Detective Rudy al centro a por el sospechoso!" }, gptPrompt: "You are a taxi driver at Cairo airport. Detective Rudy (the user) needs downtown quickly to catch a suspect. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: 택시, destination, price, then 표 for bus/train. Mix numbers.", speechLang: "ko-KR", suggestedAnswers: ["택시 불러주세요.", "시내로 가주세요.", "얼마예요?", "너무 비싸요!", "표 한 장 주세요.", "이 버스 시내에 가나요?"] },
    indonesian: { situation: { ko: "카이로 공항! 탐정 루디가 용의자를 잡으러 빨리 시내로 가야 해요!", en: "Cairo Airport! Detective Rudy must get downtown to catch the suspect!", es: "¡Aeropuerto! ¡Detective Rudy al centro a por el sospechoso!" }, gptPrompt: "You are a taxi driver at Cairo airport. Detective Rudy (the user) needs downtown quickly to catch a suspect. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: getting a taksi ('Bisakah saya memesan taksi?'), destination ('Ke ___, tolong'), price ('Berapa ongkos?'), then switch to a ticket booth for 'tiket' (bus/train). Mix in numbers for prices.", speechLang: "id-ID", suggestedAnswers: ["Bisakah saya memesan taksi?", "Ke pusat kota, tolong.", "Berapa ongkosnya?", "Terlalu mahal!", "Satu tiket, tolong.", "Apakah bus ini ke pusat kota?"] },
    arabic: { situation: { ko: "카이로 공항! 탐정 루디가 용의자를 잡으러 빨리 시내로 가야 해요!", en: "Cairo Airport! Detective Rudy must get downtown to catch the suspect!", es: "¡Aeropuerto! ¡Detective Rudy al centro a por el sospechoso!" }, gptPrompt: "You are a taxi driver at Cairo airport. Detective Rudy (the user) needs downtown quickly to catch a suspect. This scene is set in Cairo, so play a genuine Cairene cabbie. Detective/mystery framing throughout. Use simple A1 EGYPTIAN COLLOQUIAL Arabic (NOT MSA — use spoken Cairene: 'مُمْكِن تاكْسي؟' / momken taxi?, 'عَلى ___، لو سَمَحْت' / 3ala ___, law samaht for the destination, 'بِكام؟' / bekaam? for the price, 'وِسْط البَلَد' / west el-balad for downtown). Then switch to a ticket booth for 'تَذْكَرة' / tazkara (bus/train). Mix in numbers for prices and write Arabic with harakat.", speechLang: "ar-EG", suggestedAnswers: ["مُمْكِن تاكْسي؟", "عَلى وِسْط البَلَد، لو سَمَحْت.", "بِكام؟", "ده غالي قَوي!", "تَذْكَرة واحْدة، لو سَمَحْت.", "الأُتوبيس ده بيِروح وِسْط البَلَد؟"] },
  },

  day_23: {
    english: { situation: { ko: "카이로에서 루디 탐정의 장비가 모두 없어졌어요. 맨몸으로 현지인에게 물어서 기차역을 찾아야 합니다!", en: "In Cairo, Detective Rudy's equipment is gone. He must ask locals directly to find the train station and escape!", es: "En El Cairo, el equipo del detective Rudy desapareció. ¡Debe preguntar a los lugareños para encontrar la estación de tren y escapar!" }, gptPrompt: "You are a friendly local in Cairo. Detective Rudy (the user) has lost all his equipment and must ask locals for help to reach the train station. Detective/mystery framing throughout. Simple A1 {targetLang}. They need to find the train station. Practice: saying they're lost, asking for map help, asking which way, confirming directions. Be very patient and encouraging. This is the hardest Mission Talk yet — the user must combine everything from Unit 4.", speechLang: "en-GB", suggestedAnswers: ["Excuse me, I'm lost.", "Can you show me on the map?", "I don't know this area.", "Which way is the station?", "Is this the right way?", "Thank you so much!"] },
    spanish: { situation: { ko: "카이로에서 탐정 루디의 장비가 없어졌어요. 도움을 요청하세요!", en: "Cairo — Detective Rudy's equipment is gone. Ask locals for help!", es: "El Cairo — El equipo del detective Rudy desapareció. ¡Pide ayuda a los lugareños!" }, gptPrompt: "You are a friendly local in Cairo. Detective Rudy (the user) has lost all equipment and must reach the train station. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: being lost, map, which way, confirming. Be patient.", speechLang: "es-ES", suggestedAnswers: ["Perdone, estoy perdido.", "¿Me puede señalar en el mapa?", "No conozco esta zona.", "¿Por dónde está la estación?", "¿Voy bien?", "¡Muchas gracias!"] },
    korean: { situation: { ko: "카이로에서 탐정 루디의 장비가 모두 없어졌어요. 현지인에게 물어서 기차역을 찾아야 해요!", en: "Cairo — Detective Rudy has no equipment! Ask locals to find the station!", es: "¡El Cairo — Sin equipo! ¡Pregunta para encontrar la estación!" }, gptPrompt: "You are a friendly local in Cairo. Detective Rudy (the user) has lost all equipment and must reach 기차역. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: 길을 잃었어요, 지도, 어느 쪽, confirming. Be patient.", speechLang: "ko-KR", suggestedAnswers: ["실례합니다, 길을 잃었어요.", "지도에서 보여주실 수 있나요?", "이 동네를 잘 몰라요.", "기차역이 어느 쪽인가요?", "이 길이 맞나요?", "정말 감사합니다!"] },
    indonesian: { situation: { ko: "카이로에서 탐정 루디의 장비가 모두 없어졌어요. 현지인에게 물어서 기차역을 찾아야 해요!", en: "Cairo — Detective Rudy has no equipment! Ask locals to find the station!", es: "¡El Cairo — Sin equipo! ¡Pregunta para encontrar la estación!" }, gptPrompt: "You are a friendly local in Cairo. Detective Rudy (the user) has lost all his equipment and must reach the train station ('stasiun kereta'). Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: saying they're lost ('Permisi, saya tersesat'), asking for map help ('Bisakah Anda tunjukkan di peta?'), asking which way ('Ke arah mana ___?'), and confirming directions ('Apakah ini jalan yang benar?'). Be very patient and encouraging. This is the hardest Mission Talk yet — the user must combine everything from Unit 4.", speechLang: "id-ID", suggestedAnswers: ["Permisi, saya tersesat.", "Bisakah Anda tunjukkan di peta?", "Saya tidak tahu daerah ini.", "Ke arah mana stasiunnya?", "Apakah ini jalan yang benar?", "Terima kasih banyak!"] },
    arabic: { situation: { ko: "카이로에서 탐정 루디의 장비가 모두 없어졌어요. 현지인에게 물어서 기차역을 찾아야 해요!", en: "Cairo — Detective Rudy has no equipment! Ask locals to find the station!", es: "¡El Cairo — Sin equipo! ¡Pregunta para encontrar la estación!" }, gptPrompt: "You are a friendly local in Cairo. Detective Rudy (the user) has lost all his equipment and must reach the train station ('مَحَطّة القَطْر' / mahattet el-'atr). Detective/mystery framing throughout. Use simple A1 EGYPTIAN COLLOQUIAL Arabic (NOT MSA — use spoken Cairene: 'أنا تُهْت' / ana toht for 'I'm lost', 'مُمْكِن تِوَرّيني عَلى الخَريطة؟' / momken tewarreeni 3ala el-khareeta? for map help, '___ مِن أَنْهي ناحْية؟' / men anhy nah-ya? for 'which way', 'دي الطَّريق الصَّح؟' / di el-taree' el-sah? for confirming, never textbook 'daa'e3' or 'ayna'). Be very patient and encouraging. This is the hardest Mission Talk yet — the user must combine everything from Unit 4. Write Arabic with harakat.", speechLang: "ar-EG", suggestedAnswers: ["لو سَمَحْت، أنا تُهْت.", "مُمْكِن تِوَرّيني عَلى الخَريطة؟", "أنا مِش عارِف المَنْطِقة دي.", "المَحَطّة مِن أَنْهي ناحْية؟", "دي الطَّريق الصَّح؟", "شُكْراً جَزيلاً!"] },
  },

  day_24: {
    english: { situation: { ko: "루디 탐정의 최종 추적! 공항에서 블랙 씨의 마지막 은신처까지 Unit 4 모든 어휘를 사용해서 이동하세요!", en: "Detective Rudy's final chase! Navigate from the airport to Mr. Black's last hideout using ALL Unit 4 vocabulary!", es: "¡La persecución final del detective Rudy! Navega del aeropuerto al último escondite del Sr. Black con TODO el vocabulario de la Unidad 4." }, gptPrompt: "You are Detective Rudy's handler coordinating the final mission to catch Mr. Black. The user must navigate from the airport to Mr. Black's last hideout. Detective/mystery framing throughout. Test ALL Unit 4 in natural A1 {targetLang}: 1) get a taxi at the airport 2) ask for directions when the taxi drops them off 3) navigate on foot using directions 4) ask locals when lost 5) find the subway and take the right exit. Create a multi-step navigation scenario. Mix in vocabulary from Units 1-3 naturally. Be urgent but encouraging.", speechLang: "en-GB", suggestedAnswers: ["Can I get a taxi?", "Where is the subway?", "Turn left?", "I'm lost!", "One ticket, please.", "Is this the right way?", "Thank you, goodbye!"] },
    spanish: { situation: { ko: "탐정 루디의 최종 추적! 공항에서 블랙 씨의 마지막 은신처까지!", en: "Detective Rudy's final chase! Airport to Mr. Black's last hideout!", es: "¡La persecución final! Del aeropuerto al último escondite del Sr. Black." }, gptPrompt: "You are Detective Rudy's handler. The final mission: navigate from the airport to Mr. Black's last hideout. Detective/mystery framing throughout. Test ALL Unit 4 in A1 {targetLang}: taxi, directions, on foot, lost, subway. Mix Units 1-3. Urgent but encouraging.", speechLang: "es-ES", suggestedAnswers: ["¿Un taxi, por favor?", "¿Dónde está el metro?", "¿Giro a la izquierda?", "¡Estoy perdido!", "Un billete, por favor.", "¿Voy bien?", "¡Gracias, adiós!"] },
    korean: { situation: { ko: "탐정 루디의 최종 추격! 공항에서 블랙 씨의 마지막 은신처까지 이동하세요!", en: "Detective Rudy's final chase! Airport to Mr. Black's last hideout!", es: "¡Persecución final! Del aeropuerto al último refugio del Sr. Black." }, gptPrompt: "You are Detective Rudy's handler. The final mission: navigate from the airport to Mr. Black's last hideout. Detective/mystery framing throughout. Test ALL Unit 4 in A1 {targetLang}: 택시, directions, on foot, lost, 지하철. Mix Units 1-3. Urgent but encouraging.", speechLang: "ko-KR", suggestedAnswers: ["택시 불러주세요.", "지하철 어디예요?", "왼쪽으로요?", "길을 잃었어요!", "표 한 장 주세요.", "이 길이 맞나요?", "감사합니다, 안녕히 계세요!"] },
    indonesian: { situation: { ko: "탐정 루디의 최종 추격! 공항에서 블랙 씨의 마지막 은신처까지 이동하세요!", en: "Detective Rudy's final chase! Airport to Mr. Black's last hideout!", es: "¡Persecución final! Del aeropuerto al último refugio del Sr. Black." }, gptPrompt: "You are Detective Rudy's handler coordinating the final mission to catch Mr. Black. The user must navigate from the airport to Mr. Black's last hideout. Detective/mystery framing throughout. Test ALL Unit 4 in natural A1 {targetLang}: 1) get a taxi at the airport ('Bisakah saya memesan taksi?') 2) ask for directions when the taxi drops them off 3) navigate on foot ('Belok kiri/kanan', 'Jalan lurus terus') 4) ask locals when lost ('Permisi, saya tersesat') 5) find the subway and take the right exit ('pintu keluar'). Create a multi-step navigation scenario. Mix in vocabulary from Units 1-3 naturally. Be urgent but encouraging.", speechLang: "id-ID", suggestedAnswers: ["Bisakah saya memesan taksi?", "Di mana stasiunnya?", "Belok kiri?", "Saya tersesat!", "Satu tiket, tolong.", "Apakah ini jalan yang benar?", "Terima kasih, sampai jumpa!"] },
    arabic: { situation: { ko: "탐정 루디의 최종 추격! 공항에서 블랙 씨의 마지막 은신처까지 이동하세요!", en: "Detective Rudy's final chase! Airport to Mr. Black's last hideout!", es: "¡Persecución final! Del aeropuerto al último refugio del Sr. Black." }, gptPrompt: "You are Detective Rudy's handler coordinating the final mission to catch Mr. Black. The user must navigate from the airport to Mr. Black's last hideout. Detective/mystery framing throughout. Test ALL Unit 4 in natural A1 EGYPTIAN COLLOQUIAL Arabic (NOT MSA — use spoken Cairene throughout): 1) get a taxi at the airport ('مُمْكِن تاكْسي؟' / momken taxi?, 'عَلى ___، لو سَمَحْت' / 3ala ___, law samaht) 2) ask for directions when the taxi drops them off ('فين ___؟' / feen ___?) 3) navigate on foot ('خُشّ شِمال/يِمين' / khosh shemaal/yemeen, 'امْشي عَلى طول' / emshy 3ala tool) 4) ask locals when lost ('أنا تُهْت' / ana toht) 5) find the subway and take the right exit ('مَخْرَج' / makhrag). Create a multi-step navigation scenario. Mix in vocabulary from Units 1-3 naturally. Be urgent but encouraging, and write Arabic with harakat.", speechLang: "ar-EG", suggestedAnswers: ["مُمْكِن تاكْسي؟", "فين المِترو؟", "أخُشّ شِمال؟", "أنا تُهْت!", "تَذْكَرة واحْدة، لو سَمَحْت.", "دي الطَّريق الصَّح؟", "شُكْراً، مَع السَّلامة!"] },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: REVIEW (Unit 4)
// ═══════════════════════════════════════════════════════════════════════════════

export const REVIEW_CONTENT_UNIT4: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  day_19: {
    english: [
      { type: "speak", sentence: "I recommend the steak. This is delicious!", speechLang: "en-GB", meaning: { ko: "스테이크를 추천해요. 맛있어요!", en: "I recommend the steak. Delicious!", es: "Recomiendo el bistec. ¡Delicioso!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Can I pay by ___?", answer: "card", options: ["card", "cash", "check"], fullSentence: "Can I pay by card?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Where is the subway station?", speechLang: "en-GB", meaning: { ko: "지하철역이 어디에 있나요?", en: "Where is the subway station?", es: "¿Dónde está el metro?" } },
      { type: "fill_blank", promptWithBlank: "Is there a pharmacy ___?", answer: "nearby", options: ["nearby", "here", "far"], fullSentence: "Is there a pharmacy nearby?", fullSentenceMeaning: { ko: "근처에 약국 있나요?", en: "Pharmacy nearby?", es: "¿Farmacia cerca?" } },
      { type: "speak", sentence: "It's about five minutes on foot.", speechLang: "en-GB", meaning: { ko: "걸어서 5분 정도예요.", en: "Five minutes on foot.", es: "Cinco minutos a pie." } },
    ],
    spanish: [
      { type: "speak", sentence: "Recomiendo el bistec. ¡Está delicioso!", speechLang: "es-ES", meaning: { ko: "스테이크 추천. 맛있어요!", en: "I recommend the steak. Delicious!", es: "Recomiendo el bistec. ¡Delicioso!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Puedo pagar con ___?", answer: "tarjeta", options: ["tarjeta", "dinero", "cuenta"], fullSentence: "¿Puedo pagar con tarjeta?", fullSentenceMeaning: { ko: "카드로 결제?", en: "Pay by card?", es: "¿Con tarjeta?" }, isYesterdayReview: true },
      { type: "speak", sentence: "¿Dónde está la estación de metro?", speechLang: "es-ES", meaning: { ko: "지하철역이 어디?", en: "Where is the subway?", es: "¿Dónde está el metro?" } },
      { type: "fill_blank", promptWithBlank: "¿Hay una farmacia ___?", answer: "cerca", options: ["cerca", "aquí", "lejos"], fullSentence: "¿Hay una farmacia cerca?", fullSentenceMeaning: { ko: "약국 근처에?", en: "Pharmacy nearby?", es: "¿Farmacia cerca?" } },
      { type: "speak", sentence: "Está a unos cinco minutos a pie.", speechLang: "es-ES", meaning: { ko: "걸어서 5분.", en: "Five minutes on foot.", es: "Cinco minutos a pie." } },
    ],
    korean: [
      { type: "speak", sentence: "스테이크를 추천해요. 정말 맛있어요!", speechLang: "ko-KR", meaning: { ko: "스테이크 추천. 맛있어요!", en: "I recommend the steak!", es: "¡Recomiendo el bistec!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "카드로 ___할 수 있어요?", answer: "결제", options: ["결제", "주문", "요리"], fullSentence: "카드로 결제할 수 있어요?", fullSentenceMeaning: { ko: "카드로 결제?", en: "Pay by card?", es: "¿Con tarjeta?" }, isYesterdayReview: true },
      { type: "speak", sentence: "지하철역이 어디에 있나요?", speechLang: "ko-KR", meaning: { ko: "지하철역이 어디?", en: "Where is the subway?", es: "¿Dónde está el metro?" } },
      { type: "fill_blank", promptWithBlank: "___에 약국이 있나요?", answer: "근처", options: ["근처", "안", "위"], fullSentence: "근처에 약국이 있나요?", fullSentenceMeaning: { ko: "근처에 약국?", en: "Pharmacy nearby?", es: "¿Farmacia cerca?" } },
      { type: "speak", sentence: "걸어서 5분 정도예요.", speechLang: "ko-KR", meaning: { ko: "걸어서 5분.", en: "Five minutes on foot.", es: "Cinco minutos a pie." } },
    ],
    indonesian: [
      { type: "speak", sentence: "Saya merekomendasikan steaknya. Ini enak sekali!", speechLang: "id-ID", meaning: { ko: "스테이크 추천. 맛있어요!", en: "I recommend the steak. Delicious!", es: "Recomiendo el bistec. ¡Delicioso!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Bisakah saya bayar dengan ___?", answer: "kartu", options: ["kartu", "tunai", "cek"], fullSentence: "Bisakah saya bayar dengan kartu?", fullSentenceMeaning: { ko: "카드로 결제?", en: "Pay by card?", es: "¿Con tarjeta?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Di mana stasiun kereta bawah tanah?", speechLang: "id-ID", meaning: { ko: "지하철역이 어디?", en: "Where is the subway?", es: "¿Dónde está el metro?" } },
      { type: "fill_blank", promptWithBlank: "Apakah ada apotek di ___ sini?", answer: "dekat", options: ["dekat", "sana", "jauh"], fullSentence: "Apakah ada apotek di dekat sini?", fullSentenceMeaning: { ko: "근처에 약국?", en: "Pharmacy nearby?", es: "¿Farmacia cerca?" } },
      { type: "speak", sentence: "Sekitar lima menit jalan kaki.", speechLang: "id-ID", meaning: { ko: "걸어서 5분.", en: "Five minutes on foot.", es: "Cinco minutos a pie." } },
    ],
    arabic: [
      { type: "speak", sentence: "بَنْصَح بالاسْتيك. ده لَذيذ قَوي!", speechLang: "ar-EG", meaning: { ko: "banṣaḥ bel-estek. da lazeez awy! · 스테이크 추천. 맛있어요!", en: "banṣaḥ bel-estek. da lazeez awy! · I recommend the steak. Delicious!", es: "banṣaḥ bel-estek. da lazeez awy! · Recomiendo el bistec. ¡Delicioso!", id: "banṣaḥ bel-estek. da lazeez awy! · Saya merekomendasikan steaknya. Enak sekali!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "مُمْكِن أدْفَع بِالـ ___؟", answer: "كارْت", options: ["كارْت", "كاش", "شيك"], fullSentence: "مُمْكِن أدْفَع بِالكارْت؟", fullSentenceMeaning: { ko: "momken adfa3 bel-kart? · 카드로 결제?", en: "momken adfa3 bel-kart? · Pay by card?", es: "momken adfa3 bel-kart? · ¿Con tarjeta?", id: "momken adfa3 bel-kart? · Bayar dengan kartu?" }, isYesterdayReview: true },
      { type: "speak", sentence: "فين مَحَطّة المِترو؟", speechLang: "ar-EG", meaning: { ko: "feen mahattet el-metro? · 지하철역이 어디?", en: "feen mahattet el-metro? · Where is the subway?", es: "feen mahattet el-metro? · ¿Dónde está el metro?", id: "feen mahattet el-metro? · Di mana stasiun kereta?" } },
      { type: "fill_blank", promptWithBlank: "في صَيْدَلِيّة ___ مِن هِنا؟", answer: "قُرَيِّب", options: ["قُرَيِّب", "بِعيد", "هِنا"], fullSentence: "في صَيْدَلِيّة قُرَيِّب مِن هِنا؟", fullSentenceMeaning: { ko: "fee saydaleyya orayyeb men hena? · 근처에 약국?", en: "fee saydaleyya orayyeb men hena? · Pharmacy nearby?", es: "fee saydaleyya orayyeb men hena? · ¿Farmacia cerca?", id: "fee saydaleyya orayyeb men hena? · Apotek dekat sini?" } },
      { type: "speak", sentence: "حَوالي خَمَس دَقايِق مَشْي.", speechLang: "ar-EG", meaning: { ko: "hawaali khamas da'aaye' mashy · 걸어서 5분.", en: "hawaali khamas da'aaye' mashy · Five minutes on foot.", es: "hawaali khamas da'aaye' mashy · Cinco minutos a pie.", id: "hawaali khamas da'aaye' mashy · Lima menit jalan kaki." } },
    ],
  },

  day_20: {
    english: [
      { type: "speak", sentence: "Where is the subway station? It's near the museum.", speechLang: "en-GB", meaning: { ko: "지하철역 어디? 박물관 근처.", en: "Where's the subway? Near the museum.", es: "¿Dónde está el metro? Cerca del museo." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "How ___ is it?", answer: "far", options: ["far", "much", "long"], fullSentence: "How far is it?", fullSentenceMeaning: { ko: "얼마나 멀어요?", en: "How far?", es: "¿A qué distancia?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Turn left and go straight ahead.", speechLang: "en-GB", meaning: { ko: "왼쪽으로 돌아서 직진.", en: "Turn left and go straight.", es: "Gira a la izquierda y sigue recto." } },
      { type: "fill_blank", promptWithBlank: "It's on your ___.", answer: "right", options: ["right", "up", "back"], fullSentence: "It's on your right.", fullSentenceMeaning: { ko: "오른쪽에 있어요.", en: "On your right.", es: "A tu derecha." } },
      { type: "speak", sentence: "Take the first street on the right.", speechLang: "en-GB", meaning: { ko: "오른쪽 첫 번째 길로.", en: "First street on the right.", es: "Primera calle a la derecha." } },
    ],
    spanish: [
      { type: "speak", sentence: "¿Dónde está la estación? Está cerca del museo.", speechLang: "es-ES", meaning: { ko: "역 어디? 박물관 근처.", en: "Where's the station? Near the museum.", es: "¿La estación? Cerca del museo." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿A qué ___ está?", answer: "distancia", options: ["distancia", "hora", "precio"], fullSentence: "¿A qué distancia está?", fullSentenceMeaning: { ko: "얼마나 멀어요?", en: "How far?", es: "¿A qué distancia?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Gira a la izquierda y sigue todo recto.", speechLang: "es-ES", meaning: { ko: "왼쪽으로 돌아서 직진.", en: "Turn left and go straight.", es: "Izquierda y recto." } },
      { type: "fill_blank", promptWithBlank: "Está a tu ___.", answer: "derecha", options: ["derecha", "arriba", "atrás"], fullSentence: "Está a tu derecha.", fullSentenceMeaning: { ko: "오른쪽에.", en: "On your right.", es: "A tu derecha." } },
      { type: "speak", sentence: "Toma la primera calle a la derecha.", speechLang: "es-ES", meaning: { ko: "오른쪽 첫 번째 길.", en: "First street right.", es: "Primera calle a la derecha." } },
    ],
    korean: [
      { type: "speak", sentence: "지하철역 어디예요? 박물관 근처에 있어요.", speechLang: "ko-KR", meaning: { ko: "지하철역? 박물관 근처.", en: "Subway? Near the museum.", es: "¿Metro? Cerca del museo." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "___나 멀어요?", answer: "얼마", options: ["얼마", "어디", "언제"], fullSentence: "얼마나 멀어요?", fullSentenceMeaning: { ko: "얼마나 멀어요?", en: "How far?", es: "¿A qué distancia?" }, isYesterdayReview: true },
      { type: "speak", sentence: "왼쪽으로 돌아서 직진하세요.", speechLang: "ko-KR", meaning: { ko: "왼쪽으로 돌아서 직진.", en: "Turn left, go straight.", es: "Izquierda y recto." } },
      { type: "fill_blank", promptWithBlank: "오른쪽에 ___요.", answer: "있어", options: ["있어", "없어", "가"], fullSentence: "오른쪽에 있어요.", fullSentenceMeaning: { ko: "오른쪽에 있어요.", en: "On the right.", es: "A la derecha." } },
      { type: "speak", sentence: "오른쪽 첫 번째 길로 가세요.", speechLang: "ko-KR", meaning: { ko: "오른쪽 첫 번째 길.", en: "First street right.", es: "Primera calle derecha." } },
    ],
    indonesian: [
      { type: "speak", sentence: "Di mana stasiunnya? Dekat museum.", speechLang: "id-ID", meaning: { ko: "지하철역? 박물관 근처.", en: "Subway? Near the museum.", es: "¿Metro? Cerca del museo." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Berapa ___ dari sini?", answer: "jauh", options: ["jauh", "lama", "harga"], fullSentence: "Berapa jauh dari sini?", fullSentenceMeaning: { ko: "얼마나 멀어요?", en: "How far?", es: "¿A qué distancia?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Belok kiri dan jalan lurus terus.", speechLang: "id-ID", meaning: { ko: "왼쪽으로 돌아서 직진.", en: "Turn left, go straight.", es: "Izquierda y recto." } },
      { type: "fill_blank", promptWithBlank: "Ada di sebelah ___ Anda.", answer: "kanan", options: ["kanan", "atas", "belakang"], fullSentence: "Ada di sebelah kanan Anda.", fullSentenceMeaning: { ko: "오른쪽에 있어요.", en: "On the right.", es: "A la derecha." } },
      { type: "speak", sentence: "Ambil jalan pertama di sebelah kanan.", speechLang: "id-ID", meaning: { ko: "오른쪽 첫 번째 길.", en: "First street right.", es: "Primera calle derecha." } },
    ],
    arabic: [
      { type: "speak", sentence: "فين المَحَطّة؟ جَنْب المَتْحَف.", speechLang: "ar-EG", meaning: { ko: "feen el-mahatta? ganb el-mathaf · 지하철역? 박물관 근처.", en: "feen el-mahatta? ganb el-mathaf · Subway? Near the museum.", es: "feen el-mahatta? ganb el-mathaf · ¿Metro? Cerca del museo.", id: "feen el-mahatta? ganb el-mathaf · Stasiun? Dekat museum." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "هِيَّ ___ قَدّ إيه؟", answer: "بِعيدة", options: ["بِعيدة", "قُرَيِّبة", "غالْية"], fullSentence: "هِيَّ بِعيدة قَدّ إيه؟", fullSentenceMeaning: { ko: "heyya be3eeda add eh? · 얼마나 멀어요?", en: "heyya be3eeda add eh? · How far?", es: "heyya be3eeda add eh? · ¿A qué distancia?", id: "heyya be3eeda add eh? · Berapa jauh?" }, isYesterdayReview: true },
      { type: "speak", sentence: "خُشّ شِمال وامْشي عَلى طول.", speechLang: "ar-EG", meaning: { ko: "khosh shemaal w-emshy 3ala tool · 왼쪽으로 돌아서 직진.", en: "khosh shemaal w-emshy 3ala tool · Turn left, go straight.", es: "khosh shemaal w-emshy 3ala tool · Izquierda y recto.", id: "khosh shemaal w-emshy 3ala tool · Belok kiri, jalan lurus." } },
      { type: "fill_blank", promptWithBlank: "هِيَّ عَلى ___َك.", answer: "يِمين", options: ["يِمين", "فوق", "وَرا"], fullSentence: "هِيَّ عَلى يِمينَك.", fullSentenceMeaning: { ko: "heyya 3ala yemeenak · 오른쪽에 있어요.", en: "heyya 3ala yemeenak · On the right.", es: "heyya 3ala yemeenak · A la derecha.", id: "heyya 3ala yemeenak · Di sebelah kanan." } },
      { type: "speak", sentence: "خُد أوِّل شارِع عَلى اليِمين.", speechLang: "ar-EG", meaning: { ko: "khod awwel share3 3ala el-yemeen · 오른쪽 첫 번째 길.", en: "khod awwel share3 3ala el-yemeen · First street right.", es: "khod awwel share3 3ala el-yemeen · Primera calle derecha.", id: "khod awwel share3 3ala el-yemeen · Jalan pertama kanan." } },
    ],
  },

  day_21: {
    english: [
      { type: "speak", sentence: "Turn left and go straight. It's on your right.", speechLang: "en-GB", meaning: { ko: "왼쪽으로 돌아서 직진. 오른쪽에.", en: "Left, straight, on your right.", es: "Izquierda, recto, a la derecha." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Turn ___.", answer: "right", options: ["right", "up", "down"], fullSentence: "Turn right.", fullSentenceMeaning: { ko: "오른쪽으로.", en: "Turn right.", es: "Gira a la derecha." }, isYesterdayReview: true },
      { type: "speak", sentence: "Cross the bridge and it's next to the store.", speechLang: "en-GB", meaning: { ko: "다리를 건너면 가게 옆에.", en: "Cross bridge, next to store.", es: "Cruza el puente, al lado de la tienda." } },
      { type: "fill_blank", promptWithBlank: "You passed it — go ___.", answer: "back", options: ["back", "right", "straight"], fullSentence: "You passed it — go back.", fullSentenceMeaning: { ko: "지나쳤어요 — 돌아가세요.", en: "Passed it, go back.", es: "Lo pasaste, vuelve." } },
      { type: "speak", sentence: "Take exit three from the subway.", speechLang: "en-GB", meaning: { ko: "지하철 3번 출구로.", en: "Take exit 3.", es: "Salida 3 del metro." } },
      { type: "speak", sentence: "Do you speak English?", speechLang: "en-GB", meaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Habla inglés?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Help! Please help me.", speechLang: "en-GB", meaning: { ko: "도와주세요! 제발 도와주세요.", en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme." }, isYesterdayReview: true },
    ],
    spanish: [
      { type: "speak", sentence: "Gira a la izquierda y sigue recto. Está a tu derecha.", speechLang: "es-ES", meaning: { ko: "왼쪽, 직진, 오른쪽에.", en: "Left, straight, on your right.", es: "Izquierda, recto, a la derecha." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Gira a la ___.", answer: "derecha", options: ["derecha", "arriba", "abajo"], fullSentence: "Gira a la derecha.", fullSentenceMeaning: { ko: "오른쪽으로.", en: "Turn right.", es: "Gira a la derecha." }, isYesterdayReview: true },
      { type: "speak", sentence: "Cruza el puente y está al lado de la tienda.", speechLang: "es-ES", meaning: { ko: "다리 건너서 가게 옆.", en: "Cross bridge, next to store.", es: "Cruza, al lado de la tienda." } },
      { type: "fill_blank", promptWithBlank: "Lo pasaste — vuelve ___.", answer: "atrás", options: ["atrás", "adelante", "arriba"], fullSentence: "Lo pasaste — vuelve atrás.", fullSentenceMeaning: { ko: "지나쳤어요 — 돌아가세요.", en: "Passed it, go back.", es: "Lo pasaste, vuelve." } },
      { type: "speak", sentence: "Toma la salida tres del metro.", speechLang: "es-ES", meaning: { ko: "지하철 3번 출구.", en: "Take exit 3.", es: "Salida 3 del metro." } },
      { type: "speak", sentence: "¿Habla inglés?", speechLang: "es-ES", meaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Habla inglés?" }, isYesterdayReview: true },
      { type: "speak", sentence: "¡Ayuda! Por favor, ayúdeme.", speechLang: "es-ES", meaning: { ko: "도와주세요! 제발 도와주세요.", en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme." }, isYesterdayReview: true },
    ],
    korean: [
      { type: "speak", sentence: "왼쪽으로 돌아서 직진. 오른쪽에 있어요.", speechLang: "ko-KR", meaning: { ko: "왼쪽, 직진, 오른쪽.", en: "Left, straight, right.", es: "Izquierda, recto, derecha." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "오른쪽으로 ___요.", answer: "돌아", options: ["돌아", "가", "와"], fullSentence: "오른쪽으로 돌아요.", fullSentenceMeaning: { ko: "오른쪽으로 돌아요.", en: "Turn right.", es: "Gira a la derecha." }, isYesterdayReview: true },
      { type: "speak", sentence: "다리를 건너면 편의점 옆에 있어요.", speechLang: "ko-KR", meaning: { ko: "다리 건너면 편의점 옆.", en: "Cross bridge, next to store.", es: "Cruza, al lado de la tienda." } },
      { type: "fill_blank", promptWithBlank: "지나쳤어요 — ___가세요.", answer: "돌아", options: ["돌아", "직진", "올라"], fullSentence: "지나쳤어요 — 돌아가세요.", fullSentenceMeaning: { ko: "지나쳤어요 — 돌아가세요.", en: "Passed it, go back.", es: "Lo pasaste, vuelve." } },
      { type: "speak", sentence: "지하철 3번 출구로 나오세요.", speechLang: "ko-KR", meaning: { ko: "3번 출구.", en: "Take exit 3.", es: "Salida 3." } },
      { type: "speak", sentence: "영어 할 줄 아세요?", speechLang: "ko-KR", meaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Habla inglés?" }, isYesterdayReview: true },
      { type: "speak", sentence: "도와주세요! 제발 도와주세요.", speechLang: "ko-KR", meaning: { ko: "도와주세요! 제발 도와주세요.", en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme." }, isYesterdayReview: true },
    ],
    indonesian: [
      { type: "speak", sentence: "Belok kiri dan jalan lurus terus. Ada di sebelah kanan.", speechLang: "id-ID", meaning: { ko: "왼쪽, 직진, 오른쪽.", en: "Left, straight, right.", es: "Izquierda, recto, derecha." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Belok ___.", answer: "kanan", options: ["kanan", "atas", "bawah"], fullSentence: "Belok kanan.", fullSentenceMeaning: { ko: "오른쪽으로.", en: "Turn right.", es: "Gira a la derecha." }, isYesterdayReview: true },
      { type: "speak", sentence: "Seberangi jembatan dan tempatnya di sebelah minimarket.", speechLang: "id-ID", meaning: { ko: "다리 건너면 가게 옆.", en: "Cross bridge, next to store.", es: "Cruza, al lado de la tienda." } },
      { type: "fill_blank", promptWithBlank: "Anda sudah melewatinya — ___ lagi.", answer: "kembali", options: ["kembali", "maju", "naik"], fullSentence: "Anda sudah melewatinya — kembali lagi.", fullSentenceMeaning: { ko: "지나쳤어요 — 돌아가세요.", en: "Passed it, go back.", es: "Lo pasaste, vuelve." } },
      { type: "speak", sentence: "Keluar dari pintu keluar tiga di stasiun.", speechLang: "id-ID", meaning: { ko: "지하철 3번 출구로.", en: "Take exit 3.", es: "Salida 3 del metro." } },
      { type: "speak", sentence: "Apakah kamu bisa bahasa Inggris?", speechLang: "id-ID", meaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Habla inglés?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Tolong! Tolong bantu saya.", speechLang: "id-ID", meaning: { ko: "도와주세요! 제발 도와주세요.", en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme." }, isYesterdayReview: true },
    ],
    arabic: [
      { type: "speak", sentence: "خُشّ شِمال وامْشي عَلى طول. هِيَّ عَلى يِمينَك.", speechLang: "ar-EG", meaning: { ko: "khosh shemaal w-emshy 3ala tool. heyya 3ala yemeenak · 왼쪽, 직진, 오른쪽.", en: "khosh shemaal w-emshy 3ala tool. heyya 3ala yemeenak · Left, straight, right.", es: "khosh shemaal w-emshy 3ala tool. heyya 3ala yemeenak · Izquierda, recto, derecha.", id: "khosh shemaal w-emshy 3ala tool. heyya 3ala yemeenak · Kiri, lurus, kanan." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "خُشّ ___.", answer: "يِمين", options: ["يِمين", "فوق", "تَحْت"], fullSentence: "خُشّ يِمين.", fullSentenceMeaning: { ko: "khosh yemeen · 오른쪽으로.", en: "khosh yemeen · Turn right.", es: "khosh yemeen · Gira a la derecha.", id: "khosh yemeen · Belok kanan." }, isYesterdayReview: true },
      { type: "speak", sentence: "اعْدي الكُوبْري وهِيَّ جَنْب البَقّالة.", speechLang: "ar-EG", meaning: { ko: "e3dy el-kobry w-heyya ganb el-ba''aala · 다리 건너면 가게 옆.", en: "e3dy el-kobry w-heyya ganb el-ba''aala · Cross bridge, next to store.", es: "e3dy el-kobry w-heyya ganb el-ba''aala · Cruza, al lado de la tienda.", id: "e3dy el-kobry w-heyya ganb el-ba''aala · Seberangi jembatan, di sebelah toko." } },
      { type: "fill_blank", promptWithBlank: "إنْتَ فُتّها — ___ تاني.", answer: "ارْجَع", options: ["ارْجَع", "كَمِّل", "اطْلَع"], fullSentence: "إنْتَ فُتّها — ارْجَع تاني.", fullSentenceMeaning: { ko: "enta fottaha — erga3 taani · 지나쳤어요 — 돌아가세요.", en: "enta fottaha — erga3 taani · Passed it, go back.", es: "enta fottaha — erga3 taani · Lo pasaste, vuelve.", id: "enta fottaha — erga3 taani · Sudah melewatinya, kembali." } },
      { type: "speak", sentence: "اطْلَع مِن مَخْرَج تَلاتة في المِترو.", speechLang: "ar-EG", meaning: { ko: "etla3 men makhrag talaata fel-metro · 지하철 3번 출구로.", en: "etla3 men makhrag talaata fel-metro · Take exit 3.", es: "etla3 men makhrag talaata fel-metro · Salida 3 del metro.", id: "etla3 men makhrag talaata fel-metro · Pintu keluar 3." } },
      { type: "speak", sentence: "إنْتَ بِتِتْكَلِّم إنْجِليزي؟", speechLang: "ar-EG", meaning: { ko: "enta betetkallem engeleezy? · 영어 할 줄 아세요?", en: "enta betetkallem engeleezy? · Do you speak English?", es: "enta betetkallem engeleezy? · ¿Habla inglés?", id: "enta betetkallem engeleezy? · Apakah Anda bisa bahasa Inggris?" }, isYesterdayReview: true },
      { type: "speak", sentence: "النَّجْدة! ساعِدني لو سَمَحْت.", speechLang: "ar-EG", meaning: { ko: "el-nagda! sa3edni law samaht · 도와주세요! 제발 도와주세요.", en: "el-nagda! sa3edni law samaht · Help! Please help me.", es: "el-nagda! sa3edni law samaht · ¡Ayuda! Por favor, ayúdeme.", id: "el-nagda! sa3edni law samaht · Tolong! Tolong bantu saya." }, isYesterdayReview: true },
    ],
  },

  day_22: {
    english: [
      { type: "speak", sentence: "Cross the bridge. It's next to the store.", speechLang: "en-GB", meaning: { ko: "다리를 건너세요. 가게 옆이에요.", en: "Cross bridge, next to store.", es: "Cruza el puente, al lado." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "At the intersection, turn ___.", answer: "right", options: ["right", "back", "up"], fullSentence: "At the intersection, turn right.", fullSentenceMeaning: { ko: "교차로에서 오른쪽으로.", en: "Turn right at intersection.", es: "En el cruce, a la derecha." }, isYesterdayReview: true },
      { type: "speak", sentence: "Can I get a taxi? To the airport, please.", speechLang: "en-GB", meaning: { ko: "택시요. 공항으로요.", en: "Taxi? To the airport.", es: "¿Taxi? Al aeropuerto." } },
      { type: "fill_blank", promptWithBlank: "How ___ to the city center?", answer: "much", options: ["much", "far", "long"], fullSentence: "How much to the city center?", fullSentenceMeaning: { ko: "시내까지 얼마?", en: "How much to the center?", es: "¿Cuánto al centro?" } },
      { type: "speak", sentence: "One ticket to Seoul Station, please.", speechLang: "en-GB", meaning: { ko: "서울역 표 한 장 주세요.", en: "One ticket to Seoul Station.", es: "Un billete a la Estación de Seúl." } },
    ],
    spanish: [
      { type: "speak", sentence: "Cruza el puente. Está al lado de la tienda.", speechLang: "es-ES", meaning: { ko: "다리 건너서 가게 옆.", en: "Cross bridge, next to store.", es: "Cruza, al lado de la tienda." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "En el cruce, gira a la ___.", answer: "derecha", options: ["derecha", "atrás", "arriba"], fullSentence: "En el cruce, gira a la derecha.", fullSentenceMeaning: { ko: "교차로에서 오른쪽.", en: "At intersection, turn right.", es: "En el cruce, derecha." }, isYesterdayReview: true },
      { type: "speak", sentence: "¿Un taxi? Al aeropuerto, por favor.", speechLang: "es-ES", meaning: { ko: "택시? 공항으로.", en: "Taxi? To the airport.", es: "¿Taxi? Al aeropuerto." } },
      { type: "fill_blank", promptWithBlank: "¿Cuánto ___ ir al centro?", answer: "cuesta", options: ["cuesta", "es", "va"], fullSentence: "¿Cuánto cuesta ir al centro?", fullSentenceMeaning: { ko: "시내까지 얼마?", en: "How much to center?", es: "¿Cuánto al centro?" } },
      { type: "speak", sentence: "Un billete para la Estación Central, por favor.", speechLang: "es-ES", meaning: { ko: "중앙역 표 한 장.", en: "One ticket to Central Station.", es: "Un billete a la Estación." } },
    ],
    korean: [
      { type: "speak", sentence: "다리를 건너세요. 편의점 옆이에요.", speechLang: "ko-KR", meaning: { ko: "다리 건너서 편의점 옆.", en: "Cross bridge, next to store.", es: "Cruza, al lado." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "교차로에서 오른쪽으로 ___요.", answer: "도세", options: ["도세", "가세", "와"], fullSentence: "교차로에서 오른쪽으로 도세요.", fullSentenceMeaning: { ko: "교차로에서 오른쪽.", en: "Turn right at intersection.", es: "En el cruce, derecha." }, isYesterdayReview: true },
      { type: "speak", sentence: "택시 불러주세요. 공항으로 가주세요.", speechLang: "ko-KR", meaning: { ko: "택시요. 공항으로.", en: "Taxi. To the airport.", es: "Taxi. Al aeropuerto." } },
      { type: "fill_blank", promptWithBlank: "시내___지 얼마예요?", answer: "까", options: ["까", "에", "로"], fullSentence: "시내까지 얼마예요?", fullSentenceMeaning: { ko: "시내까지 얼마?", en: "How much to city?", es: "¿Cuánto al centro?" } },
      { type: "speak", sentence: "서울역 표 한 장 주세요.", speechLang: "ko-KR", meaning: { ko: "서울역 표 한 장.", en: "One ticket to Seoul Station.", es: "Billete a Seúl." } },
    ],
    indonesian: [
      { type: "speak", sentence: "Seberangi jembatan. Tempatnya di sebelah minimarket.", speechLang: "id-ID", meaning: { ko: "다리 건너서 가게 옆.", en: "Cross bridge, next to store.", es: "Cruza, al lado de la tienda." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Di persimpangan, belok ___.", answer: "kanan", options: ["kanan", "atas", "belakang"], fullSentence: "Di persimpangan, belok kanan.", fullSentenceMeaning: { ko: "교차로에서 오른쪽.", en: "Turn right at intersection.", es: "En el cruce, derecha." }, isYesterdayReview: true },
      { type: "speak", sentence: "Bisakah saya memesan taksi? Ke bandara, tolong.", speechLang: "id-ID", meaning: { ko: "택시? 공항으로.", en: "Taxi? To the airport.", es: "¿Taxi? Al aeropuerto." } },
      { type: "fill_blank", promptWithBlank: "Berapa ___ ke pusat kota?", answer: "ongkos", options: ["ongkos", "jauh", "lama"], fullSentence: "Berapa ongkos ke pusat kota?", fullSentenceMeaning: { ko: "시내까지 얼마?", en: "How much to city?", es: "¿Cuánto al centro?" } },
      { type: "speak", sentence: "Satu tiket ke Stasiun Seoul, tolong.", speechLang: "id-ID", meaning: { ko: "서울역 표 한 장.", en: "One ticket to Seoul Station.", es: "Billete a Seúl." } },
    ],
    arabic: [
      { type: "speak", sentence: "اعْدي الكُوبْري. هِيَّ جَنْب البَقّالة.", speechLang: "ar-EG", meaning: { ko: "e3dy el-kobry. heyya ganb el-ba''aala · 다리 건너서 가게 옆.", en: "e3dy el-kobry. heyya ganb el-ba''aala · Cross bridge, next to store.", es: "e3dy el-kobry. heyya ganb el-ba''aala · Cruza, al lado de la tienda.", id: "e3dy el-kobry. heyya ganb el-ba''aala · Seberangi jembatan, di sebelah toko." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "عِنْد التَّقاطُع، خُشّ ___.", answer: "يِمين", options: ["يِمين", "فوق", "وَرا"], fullSentence: "عِنْد التَّقاطُع، خُشّ يِمين.", fullSentenceMeaning: { ko: "3and el-ta'aato3, khosh yemeen · 교차로에서 오른쪽.", en: "3and el-ta'aato3, khosh yemeen · Turn right at intersection.", es: "3and el-ta'aato3, khosh yemeen · En el cruce, derecha.", id: "3and el-ta'aato3, khosh yemeen · Di persimpangan, kanan." }, isYesterdayReview: true },
      { type: "speak", sentence: "مُمْكِن تاكْسي؟ عَلى المَطار، لو سَمَحْت.", speechLang: "ar-EG", meaning: { ko: "momken taxi? 3ala el-mataar, law samaht · 택시? 공항으로.", en: "momken taxi? 3ala el-mataar, law samaht · Taxi? To the airport.", es: "momken taxi? 3ala el-mataar, law samaht · ¿Taxi? Al aeropuerto.", id: "momken taxi? 3ala el-mataar, law samaht · Taksi? Ke bandara." } },
      { type: "fill_blank", promptWithBlank: "___ لِحَدّ وِسْط البَلَد؟", answer: "بِكام", options: ["بِكام", "فين", "إمْتى"], fullSentence: "بِكام لِحَدّ وِسْط البَلَد؟", fullSentenceMeaning: { ko: "bekaam le7add west el-balad? · 시내까지 얼마?", en: "bekaam le7add west el-balad? · How much to city?", es: "bekaam le7add west el-balad? · ¿Cuánto al centro?", id: "bekaam le7add west el-balad? · Berapa ke kota?" } },
      { type: "speak", sentence: "تَذْكَرة واحْدة لِمَحَطّة سيول، لو سَمَحْت.", speechLang: "ar-EG", meaning: { ko: "tazkara wahda le-mahattet Seoul, law samaht · 서울역 표 한 장.", en: "tazkara wahda le-mahattet Seoul, law samaht · One ticket to Seoul Station.", es: "tazkara wahda le-mahattet Seoul, law samaht · Billete a Seúl.", id: "tazkara wahda le-mahattet Seoul, law samaht · Satu tiket ke Stasiun Seoul." } },
    ],
  },

  day_23: {
    english: [
      { type: "speak", sentence: "Can I get a taxi? To the airport, please.", speechLang: "en-GB", meaning: { ko: "택시요. 공항으로.", en: "Taxi to the airport.", es: "Taxi al aeropuerto." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Does this bus ___ to the museum?", answer: "go", options: ["go", "come", "take"], fullSentence: "Does this bus go to the museum?", fullSentenceMeaning: { ko: "이 버스 박물관 가나요?", en: "Does this bus go to the museum?", es: "¿Va al museo este bus?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Excuse me, I'm lost. Can you show me on the map?", speechLang: "en-GB", meaning: { ko: "실례합니다, 길을 잃었어요. 지도 보여주세요.", en: "I'm lost. Show me on the map?", es: "Estoy perdido. ¿El mapa?" } },
      { type: "fill_blank", promptWithBlank: "I don't ___ this area.", answer: "know", options: ["know", "like", "see"], fullSentence: "I don't know this area.", fullSentenceMeaning: { ko: "이 동네를 잘 몰라요.", en: "I don't know this area.", es: "No conozco esta zona." } },
      { type: "speak", sentence: "Is this the right way to the museum?", speechLang: "en-GB", meaning: { ko: "박물관 가는 길 맞나요?", en: "Right way to the museum?", es: "¿Voy bien al museo?" } },
    ],
    spanish: [
      { type: "speak", sentence: "¿Un taxi? Al aeropuerto, por favor.", speechLang: "es-ES", meaning: { ko: "택시? 공항.", en: "Taxi? Airport.", es: "¿Taxi? Aeropuerto." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Este autobús ___ al museo?", answer: "va", options: ["va", "viene", "sale"], fullSentence: "¿Este autobús va al museo?", fullSentenceMeaning: { ko: "이 버스 박물관 가나요?", en: "Does this bus go?", es: "¿Va al museo?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Perdone, estoy perdido. ¿Me puede señalar en el mapa?", speechLang: "es-ES", meaning: { ko: "길을 잃었어요. 지도 보여주세요.", en: "Lost. Show me on the map?", es: "Perdido. ¿El mapa?" } },
      { type: "fill_blank", promptWithBlank: "No ___ esta zona.", answer: "conozco", options: ["conozco", "sé", "voy"], fullSentence: "No conozco esta zona.", fullSentenceMeaning: { ko: "이 동네 몰라요.", en: "Don't know this area.", es: "No conozco esta zona." } },
      { type: "speak", sentence: "¿Voy bien para el museo?", speechLang: "es-ES", meaning: { ko: "박물관 가는 길 맞나요?", en: "Right way to the museum?", es: "¿Voy bien al museo?" } },
    ],
    korean: [
      { type: "speak", sentence: "택시 불러주세요. 공항으로 가주세요.", speechLang: "ko-KR", meaning: { ko: "택시. 공항.", en: "Taxi. Airport.", es: "Taxi. Aeropuerto." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "이 버스 박물관에 ___요?", answer: "가나", options: ["가나", "있나", "오나"], fullSentence: "이 버스 박물관에 가나요?", fullSentenceMeaning: { ko: "이 버스 박물관 가나요?", en: "Does this bus go?", es: "¿Va al museo?" }, isYesterdayReview: true },
      { type: "speak", sentence: "실례합니다, 길을 잃었어요. 지도에서 보여주세요.", speechLang: "ko-KR", meaning: { ko: "길 잃었어요. 지도 보여주세요.", en: "Lost. Show me on map.", es: "Perdido. Mapa." } },
      { type: "fill_blank", promptWithBlank: "이 동네를 잘 ___요.", answer: "몰라", options: ["몰라", "알아", "좋아"], fullSentence: "이 동네를 잘 몰라요.", fullSentenceMeaning: { ko: "이 동네 몰라요.", en: "Don't know this area.", es: "No conozco." } },
      { type: "speak", sentence: "박물관 가는 길이 맞나요?", speechLang: "ko-KR", meaning: { ko: "박물관 길 맞나요?", en: "Right way?", es: "¿Voy bien?" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Bisakah saya memesan taksi? Ke bandara, tolong.", speechLang: "id-ID", meaning: { ko: "택시? 공항.", en: "Taxi? Airport.", es: "¿Taxi? Aeropuerto." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Apakah bus ini ___ museum?", answer: "ke", options: ["ke", "di", "dari"], fullSentence: "Apakah bus ini ke museum?", fullSentenceMeaning: { ko: "이 버스 박물관 가나요?", en: "Does this bus go?", es: "¿Va al museo?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Permisi, saya tersesat. Bisakah Anda tunjukkan di peta?", speechLang: "id-ID", meaning: { ko: "길을 잃었어요. 지도 보여주세요.", en: "Lost. Show me on the map?", es: "Perdido. ¿El mapa?" } },
      { type: "fill_blank", promptWithBlank: "Saya tidak ___ daerah ini.", answer: "tahu", options: ["tahu", "mau", "bisa"], fullSentence: "Saya tidak tahu daerah ini.", fullSentenceMeaning: { ko: "이 동네 몰라요.", en: "Don't know this area.", es: "No conozco esta zona." } },
      { type: "speak", sentence: "Apakah ini jalan yang benar ke museum?", speechLang: "id-ID", meaning: { ko: "박물관 길 맞나요?", en: "Right way?", es: "¿Voy bien?" } },
    ],
    arabic: [
      { type: "speak", sentence: "مُمْكِن تاكْسي؟ عَلى المَطار، لو سَمَحْت.", speechLang: "ar-EG", meaning: { ko: "momken taxi? 3ala el-mataar, law samaht · 택시? 공항.", en: "momken taxi? 3ala el-mataar, law samaht · Taxi? Airport.", es: "momken taxi? 3ala el-mataar, law samaht · ¿Taxi? Aeropuerto.", id: "momken taxi? 3ala el-mataar, law samaht · Taksi? Bandara." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "الأُتوبيس ده ___ المَتْحَف؟", answer: "بيِروح", options: ["بيِروح", "بيِيجي", "بيِقَف"], fullSentence: "الأُتوبيس ده بيِروح المَتْحَف؟", fullSentenceMeaning: { ko: "el-otobees da beyrooh el-mathaf? · 이 버스 박물관 가나요?", en: "el-otobees da beyrooh el-mathaf? · Does this bus go?", es: "el-otobees da beyrooh el-mathaf? · ¿Va al museo?", id: "el-otobees da beyrooh el-mathaf? · Apakah bus ini ke museum?" }, isYesterdayReview: true },
      { type: "speak", sentence: "لو سَمَحْت، أنا تُهْت. مُمْكِن تِوَرّيني عَلى الخَريطة؟", speechLang: "ar-EG", meaning: { ko: "law samaht, ana toht. momken tewarreeni 3ala el-khareeta? · 길 잃었어요. 지도 보여주세요.", en: "law samaht, ana toht. momken tewarreeni 3ala el-khareeta? · Lost. Show me on the map?", es: "law samaht, ana toht. momken tewarreeni 3ala el-khareeta? · Perdido. ¿El mapa?", id: "law samaht, ana toht. momken tewarreeni 3ala el-khareeta? · Tersesat. Tunjukkan di peta?" } },
      { type: "fill_blank", promptWithBlank: "أنا مِش ___ المَنْطِقة دي.", answer: "عارِف", options: ["عارِف", "عايِز", "قادِر"], fullSentence: "أنا مِش عارِف المَنْطِقة دي.", fullSentenceMeaning: { ko: "ana mesh 3aaref el-mante'a di · 이 동네 몰라요.", en: "ana mesh 3aaref el-mante'a di · Don't know this area.", es: "ana mesh 3aaref el-mante'a di · No conozco esta zona.", id: "ana mesh 3aaref el-mante'a di · Tidak tahu daerah ini." } },
      { type: "speak", sentence: "دي الطَّريق الصَّح لِلمَتْحَف؟", speechLang: "ar-EG", meaning: { ko: "di el-taree' el-sah lel-mathaf? · 박물관 길 맞나요?", en: "di el-taree' el-sah lel-mathaf? · Right way?", es: "di el-taree' el-sah lel-mathaf? · ¿Voy bien?", id: "di el-taree' el-sah lel-mathaf? · Jalan yang benar?" } },
    ],
  },

  day_24: {
    english: [
      { type: "speak", sentence: "Excuse me, I'm lost. Which way is the station?", speechLang: "en-GB", meaning: { ko: "실례합니다, 길 잃었어요. 역이 어느 쪽?", en: "Lost. Which way station?", es: "Perdido. ¿La estación?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Can you ___ me on the map?", answer: "show", options: ["show", "tell", "give"], fullSentence: "Can you show me on the map?", fullSentenceMeaning: { ko: "지도에서 보여주세요.", en: "Show me on the map?", es: "¿Señalar en el mapa?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Where is the subway? Turn left and go straight.", speechLang: "en-GB", meaning: { ko: "지하철 어디? 왼쪽으로 직진.", en: "Subway? Left, straight.", es: "¿Metro? Izquierda, recto." } },
      { type: "speak", sentence: "One ticket to the airport. How much?", speechLang: "en-GB", meaning: { ko: "공항행 표. 얼마예요?", en: "Ticket to airport. How much?", es: "Billete aeropuerto. ¿Cuánto?" } },
      { type: "speak", sentence: "Cross the bridge. It's on your right. Thank you!", speechLang: "en-GB", meaning: { ko: "다리 건너면 오른쪽. 감사합니다!", en: "Cross bridge, right. Thanks!", es: "Cruza puente, derecha. ¡Gracias!" } },
    ],
    spanish: [
      { type: "speak", sentence: "Perdone, estoy perdido. ¿Por dónde está la estación?", speechLang: "es-ES", meaning: { ko: "길 잃었어요. 역 어느 쪽?", en: "Lost. Which way station?", es: "Perdido. ¿La estación?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Me puede ___ en el mapa?", answer: "señalar", options: ["señalar", "decir", "dar"], fullSentence: "¿Me puede señalar en el mapa?", fullSentenceMeaning: { ko: "지도에서 보여주세요.", en: "Show on the map?", es: "¿Señalar en el mapa?" }, isYesterdayReview: true },
      { type: "speak", sentence: "¿Dónde está el metro? Gira a la izquierda y sigue recto.", speechLang: "es-ES", meaning: { ko: "지하철? 왼쪽으로 직진.", en: "Subway? Left, straight.", es: "¿Metro? Izquierda, recto." } },
      { type: "speak", sentence: "Un billete al aeropuerto. ¿Cuánto cuesta?", speechLang: "es-ES", meaning: { ko: "공항행 표. 얼마?", en: "Ticket to airport. How much?", es: "Billete aeropuerto. ¿Cuánto?" } },
      { type: "speak", sentence: "Cruza el puente. Está a tu derecha. ¡Gracias!", speechLang: "es-ES", meaning: { ko: "다리 건너면 오른쪽. 감사!", en: "Cross bridge, right. Thanks!", es: "Cruza, derecha. ¡Gracias!" } },
    ],
    korean: [
      { type: "speak", sentence: "실례합니다, 길 잃었어요. 역이 어느 쪽인가요?", speechLang: "ko-KR", meaning: { ko: "길 잃었어요. 역 어디?", en: "Lost. Station?", es: "Perdido. ¿Estación?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "지도에서 ___주실 수 있나요?", answer: "보여", options: ["보여", "말해", "가르쳐"], fullSentence: "지도에서 보여주실 수 있나요?", fullSentenceMeaning: { ko: "지도에서 보여주세요.", en: "Show on map?", es: "¿Señalar?" }, isYesterdayReview: true },
      { type: "speak", sentence: "지하철 어디예요? 왼쪽으로 돌아서 직진.", speechLang: "ko-KR", meaning: { ko: "지하철? 왼쪽 직진.", en: "Subway? Left, straight.", es: "¿Metro? Izquierda, recto." } },
      { type: "speak", sentence: "공항행 표 한 장. 얼마예요?", speechLang: "ko-KR", meaning: { ko: "공항 표. 얼마?", en: "Airport ticket. How much?", es: "Billete. ¿Cuánto?" } },
      { type: "speak", sentence: "다리 건너면 오른쪽에 있어요. 감사합니다!", speechLang: "ko-KR", meaning: { ko: "다리 건너면 오른쪽. 감사!", en: "Cross bridge, right. Thanks!", es: "Cruza, derecha. ¡Gracias!" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Permisi, saya tersesat. Ke arah mana stasiunnya?", speechLang: "id-ID", meaning: { ko: "길 잃었어요. 역 어디?", en: "Lost. Station?", es: "Perdido. ¿Estación?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Bisakah Anda ___ di peta?", answer: "tunjukkan", options: ["tunjukkan", "katakan", "berikan"], fullSentence: "Bisakah Anda tunjukkan di peta?", fullSentenceMeaning: { ko: "지도에서 보여주세요.", en: "Show on map?", es: "¿Señalar?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Di mana stasiun? Belok kiri dan jalan lurus terus.", speechLang: "id-ID", meaning: { ko: "지하철? 왼쪽 직진.", en: "Subway? Left, straight.", es: "¿Metro? Izquierda, recto." } },
      { type: "speak", sentence: "Satu tiket ke bandara. Berapa?", speechLang: "id-ID", meaning: { ko: "공항 표. 얼마?", en: "Airport ticket. How much?", es: "Billete. ¿Cuánto?" } },
      { type: "speak", sentence: "Seberangi jembatan dan ada di sebelah kanan. Terima kasih!", speechLang: "id-ID", meaning: { ko: "다리 건너면 오른쪽. 감사!", en: "Cross bridge, right. Thanks!", es: "Cruza, derecha. ¡Gracias!" } },
    ],
    arabic: [
      { type: "speak", sentence: "لو سَمَحْت، أنا تُهْت. المَحَطّة مِن أَنْهي ناحْية؟", speechLang: "ar-EG", meaning: { ko: "law samaht, ana toht. el-mahatta men anhy nah-ya? · 길 잃었어요. 역 어디?", en: "law samaht, ana toht. el-mahatta men anhy nah-ya? · Lost. Which way station?", es: "law samaht, ana toht. el-mahatta men anhy nah-ya? · Perdido. ¿La estación?", id: "law samaht, ana toht. el-mahatta men anhy nah-ya? · Tersesat. Ke arah mana stasiun?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "مُمْكِن ___ عَلى الخَريطة؟", answer: "تِوَرّيني", options: ["تِوَرّيني", "تِقولّي", "تِدّيني"], fullSentence: "مُمْكِن تِوَرّيني عَلى الخَريطة؟", fullSentenceMeaning: { ko: "momken tewarreeni 3ala el-khareeta? · 지도에서 보여주세요.", en: "momken tewarreeni 3ala el-khareeta? · Show on map?", es: "momken tewarreeni 3ala el-khareeta? · ¿Señalar?", id: "momken tewarreeni 3ala el-khareeta? · Tunjukkan di peta?" }, isYesterdayReview: true },
      { type: "speak", sentence: "فين المِترو؟ خُشّ شِمال وامْشي عَلى طول.", speechLang: "ar-EG", meaning: { ko: "feen el-metro? khosh shemaal w-emshy 3ala tool · 지하철? 왼쪽 직진.", en: "feen el-metro? khosh shemaal w-emshy 3ala tool · Subway? Left, straight.", es: "feen el-metro? khosh shemaal w-emshy 3ala tool · ¿Metro? Izquierda, recto.", id: "feen el-metro? khosh shemaal w-emshy 3ala tool · Stasiun? Kiri, lurus." } },
      { type: "speak", sentence: "تَذْكَرة للمَطار. بِكام؟", speechLang: "ar-EG", meaning: { ko: "tazkara lel-mataar. bekaam? · 공항 표. 얼마?", en: "tazkara lel-mataar. bekaam? · Airport ticket. How much?", es: "tazkara lel-mataar. bekaam? · Billete. ¿Cuánto?", id: "tazkara lel-mataar. bekaam? · Tiket bandara. Berapa?" } },
      { type: "speak", sentence: "اعْدي الكُوبْري وهِيَّ عَلى يِمينَك. شُكْراً!", speechLang: "ar-EG", meaning: { ko: "e3dy el-kobry w-heyya 3ala yemeenak. shokran! · 다리 건너면 오른쪽. 감사!", en: "e3dy el-kobry w-heyya 3ala yemeenak. shokran! · Cross bridge, right. Thanks!", es: "e3dy el-kobry w-heyya 3ala yemeenak. shokran! · Cruza, derecha. ¡Gracias!", id: "e3dy el-kobry w-heyya 3ala yemeenak. shokran! · Seberangi jembatan, kanan. Terima kasih!" } },
    ],
  },
};
