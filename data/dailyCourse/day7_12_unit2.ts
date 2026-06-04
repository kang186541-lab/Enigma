/**
 * NEW Day 7-12 Content (Unit 2: Everyday Expressions)
 *
 * Day 7:  Numbers & Age
 * Day 8:  Days of the Week
 * Day 9:  Telling the Time
 * Day 10: Talking About Weather
 * Day 11: Colours & Sizes
 * Day 12: Unit 2 Review
 *
 * Each day has:
 * - STEP 1: 5 sentences (Listen & Repeat)
 * - STEP 2: 4-5 quizzes (mix of select + input)
 * - STEP 3: Mission Talk GPT prompt + suggested answers
 * - STEP 4: 5 review questions (mix of speak + fill_blank, with yesterday review)
 *
 * To apply: Add these entries to LESSON_CONTENT, MISSION_CONTENT, and
 * REVIEW_CONTENT in lib/lessonContent.ts. Also add Day 7-12 to UNITS in
 * lib/dailyCourseData.ts (they already exist as topic labels).
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

export const LESSON_CONTENT_UNIT2: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 7: Numbers 1-100 & Age ────────────────────────────────
  day_7: {
    english: {
      step1Sentences: [
        { text: "I have two dogs and three cats at home.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", en: "I have two dogs and three cats at home.", es: "Tengo dos perros y tres gatos en casa." } },
        { text: "There are fifteen people in line. That's a lot!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "줄에 열다섯 명이 있어요. 정말 많다!", en: "There are fifteen people in line. That's a lot!", es: "Hay quince personas en la fila. ¡Son muchas!" } },
        { text: "Twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "20, 30, 40, 50, 60, 70, 80, 90, 100.", en: "Tens: twenty to one hundred.", es: "Decenas: veinte a cien." } },
        { text: "How old are you? I'm twenty-five years old.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "몇 살이에요? 저는 스물다섯 살이에요.", en: "How old are you? I'm twenty-five years old.", es: "¿Cuántos años tienes? Tengo veinticinco años." }, recallRound: true },
        { text: "That's fifteen dollars, please.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "15달러입니다.", en: "That's fifteen dollars, please.", es: "Son quince dólares, por favor." }, recallRound: true },
        { text: "It's three thirty.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "세 시 삼십 분이에요.", en: "It's three thirty.", es: "Son las tres y treinta." } },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: How old are you? → I'm ___ years old. / 숫자 11-19는 특별한 형태, 20부터는 규칙적(twenty-one, twenty-two...). 십 단위: twenty(20)~one hundred(100).", en: "Pattern: How old are you? → I'm ___ years old. Numbers 11-19 have special forms (eleven, twelve, thirteen...). From 20, it's regular: twenty-one, twenty-two... Tens: twenty(20) to one hundred(100).", es: "Patrón: How old are you? → I'm ___ years old. Los números 11-19 tienen formas especiales (eleven, twelve...). Desde 20, es regular: twenty-one, twenty-two... Decenas: twenty(20) a one hundred(100)." },
          examples: { ko: "How old are you? I'm twenty-five years old. (몇 살이에요? 25살이에요.)\nThat's fifteen dollars, please. (15달러입니다.)\nThere are thirty students in my class. (우리 반에 학생이 30명이에요.)", en: "How old are you? I'm twenty-five years old. (Asking and telling age.)\nThat's fifteen dollars, please. (Using numbers for prices.)\nThere are thirty students in my class. (Counting people with numbers.)", es: "How old are you? I'm twenty-five years old. (Preguntando y diciendo la edad.)\nThat's fifteen dollars, please. (Usando números para precios.)\nThere are thirty students in my class. (Contando personas.)" },
          mistakes: { ko: "❌ I'm twenty-five years.\n✅ I'm twenty-five years old. ('old'를 꼭 붙여야 해요!)\n\n❌ fiveteen\n✅ fifteen (five가 아니라 fif-로 바뀌어요!)", en: "❌ I'm twenty-five years.\n✅ I'm twenty-five years old. (Don't forget 'old' at the end!)\n\n❌ fiveteen\n✅ fifteen (It's 'fif-' not 'five-' — the spelling changes!)", es: "❌ I'm twenty-five years.\n✅ I'm twenty-five years old. (No olvides 'old' al final.)\n\n❌ fiveteen\n✅ fifteen (Es 'fif-' no 'five-' — ¡la ortografía cambia!)" },
          rudyTip: { ko: "탐정 루디의 팁: thirteen부터 nineteen까지 -teen으로 끝나니까 '틴에이저(teenager)'라고 부르는 거였어! 숫자도 단서처럼 패턴을 찾으면 쉬워져~", en: "Detective Rudy's tip: Notice how thirteen through nineteen all end in '-teen'? That's where 'teenager' comes from! Find the pattern and numbers become clues, not mysteries.", es: "Consejo del detective Rudy: ¿Notaste que de thirteen a nineteen todos terminan en '-teen'? ¡De ahí viene 'teenager'! Encuentra el patrón y los números se vuelven pistas." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "How ___ are you?", answer: "old", options: ["old", "much", "many"], fullSentence: "How old are you?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
          { type: "select", promptWithBlank: "I'm twenty-five years ___.", answer: "old", options: ["old", "age", "year"], fullSentence: "I'm twenty-five years old.", fullSentenceMeaning: { ko: "저는 스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." } },
          { type: "select", promptWithBlank: "Ten, ___, twelve, thirteen...", answer: "eleven", options: ["eleven", "ten-one", "tenteen"], fullSentence: "Ten, eleven, twelve, thirteen.", fullSentenceMeaning: { ko: "10, 11, 12, 13.", en: "Ten, eleven, twelve, thirteen.", es: "Diez, once, doce, trece." } },
          { type: "fill_blank", promptWithBlank: "That's ___ dollars please.", answer: "fifteen", options: ["fifteen", "fifty", "fourteen"], fullSentence: "That's fifteen dollars, please.", fullSentenceMeaning: { ko: "15달러입니다.", en: "Fifteen dollars.", es: "Quince dólares." } },
          { type: "input", promptWithBlank: "Twenty, thirty, forty, ___.", answer: "fifty", fullSentence: "Twenty, thirty, forty, fifty.", fullSentenceMeaning: { ko: "20, 30, 40, 50.", en: "Twenty, thirty, forty, fifty.", es: "Veinte, treinta, cuarenta, cincuenta." } },
          { type: "listening", audioText: "That's fifteen dollars, please.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["That's fifteen dollars, please.", "How old are you?", "It's three thirty.", "One hundred dollars."], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Tengo dos perros y tres gatos en casa.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", en: "I have two dogs and three cats at home.", es: "Tengo dos perros y tres gatos en casa." } },
        { text: "Hay quince personas en la fila. ¡Son muchas!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "줄에 열다섯 명이 있어요. 정말 많다!", en: "There are fifteen people in line. That's a lot!", es: "Hay quince personas en la fila. ¡Son muchas!" } },
        { text: "Veinte, treinta, cuarenta, cincuenta, sesenta, setenta, ochenta, noventa, cien.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "20, 30, 40, 50, 60, 70, 80, 90, 100.", en: "Tens: twenty to one hundred.", es: "Decenas: veinte a cien." } },
        { text: "¿Cuántos años tienes? Tengo veinticinco años.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "몇 살이에요? 저는 스물다섯 살이에요.", en: "How old are you? I'm twenty-five.", es: "¿Cuántos años tienes? Tengo veinticinco años." }, recallRound: true },
        { text: "Son quince euros, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "15유로입니다.", en: "That's fifteen euros, please.", es: "Son quince euros, por favor." }, recallRound: true },
        { text: "Son las tres y treinta.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "세 시 삼십 분이에요.", en: "It's three thirty.", es: "Son las tres y treinta." } },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: ¿Cuántos años tienes? → Tengo ___ años. / 스페인어 11-15: once~quince (특별 형태). 16-19: dieciséis~diecinueve. 십 단위: veinte(20)~cien(100).", en: "Pattern: ¿Cuántos años tienes? → Tengo ___ años. Spanish 11-15: once through quince (special forms). 16-19: dieciséis to diecinueve. Tens: veinte(20) to cien(100).", es: "Patrón: ¿Cuántos años tienes? → Tengo ___ años. 11-15: once a quince (formas especiales). 16-19: dieciséis a diecinueve. Decenas: veinte(20) a cien(100)." },
          examples: { ko: "¿Cuántos años tienes? Tengo veinticinco años. (몇 살이에요? 25살이에요.)\nSon quince euros, por favor. (15유로입니다.)\nHay treinta estudiantes en mi clase. (우리 반에 학생이 30명이에요.)", en: "¿Cuántos años tienes? Tengo veinticinco años. (Asking and telling age.)\nSon quince euros, por favor. (That's fifteen euros, please.)\nHay treinta estudiantes en mi clase. (There are thirty students in my class.)", es: "¿Cuántos años tienes? Tengo veinticinco años. (Preguntando y diciendo la edad.)\nSon quince euros, por favor. (Usando números para precios.)\nHay treinta estudiantes en mi clase. (Contando personas.)" },
          mistakes: { ko: "❌ Soy veinticinco años.\n✅ Tengo veinticinco años. (나이는 ser가 아니라 tener를 써요!)\n\n❌ Tengo veinticinco año.\n✅ Tengo veinticinco años. (복수형 años를 써야 해요!)", en: "❌ Soy veinticinco años.\n✅ Tengo veinticinco años. (Use 'tener' not 'ser' for age — you 'have' years in Spanish!)\n\n❌ Tengo veinticinco año.\n✅ Tengo veinticinco años. (Don't forget the plural 's' on años!)", es: "❌ Soy veinticinco años.\n✅ Tengo veinticinco años. (La edad usa 'tener', no 'ser' — ¡tienes años!)\n\n❌ Tengo veinticinco año.\n✅ Tengo veinticinco años. (No olvides la 's' del plural.)" },
          rudyTip: { ko: "탐정 루디의 팁: 스페인어에서는 나이를 '가지고 있다(tener)'고 표현해! 'Tengo 25 años' = '나는 25년을 가지고 있다.' 재밌지? 패턴만 기억하면 끝!", en: "Detective Rudy's tip: In Spanish you don't 'be' an age — you 'have' years! 'Tengo 25 años' literally means 'I have 25 years.' Weird but memorable, right?", es: "Consejo del detective Rudy: En español no 'eres' una edad — 'tienes' años. 'Tengo 25 años' es literal. ¡Una vez que lo entiendas, nunca lo olvidarás!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Cuántos ___ tienes?", answer: "años", options: ["años", "días", "veces"], fullSentence: "¿Cuántos años tienes?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
          { type: "select", promptWithBlank: "___ veinticinco años.", answer: "Tengo", options: ["Tengo", "Soy", "Estoy"], fullSentence: "Tengo veinticinco años.", fullSentenceMeaning: { ko: "저는 스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." } },
          { type: "select", promptWithBlank: "Diez, ___, doce, trece...", answer: "once", options: ["once", "diez-uno", "diezteen"], fullSentence: "Diez, once, doce, trece.", fullSentenceMeaning: { ko: "10, 11, 12, 13.", en: "Ten, eleven, twelve, thirteen.", es: "Diez, once, doce, trece." } },
          { type: "fill_blank", promptWithBlank: "Son ___ euros, por favor.", answer: "quince", options: ["quince", "cincuenta", "catorce"], fullSentence: "Son quince euros, por favor.", fullSentenceMeaning: { ko: "15유로입니다.", en: "Fifteen euros.", es: "Quince euros." } },
          { type: "input", promptWithBlank: "Veinte, treinta, cuarenta, ___.", answer: "cincuenta", fullSentence: "Veinte, treinta, cuarenta, cincuenta.", fullSentenceMeaning: { ko: "20, 30, 40, 50.", en: "Twenty, thirty, forty, fifty.", es: "Veinte, treinta, cuarenta, cincuenta." } },
          { type: "listening", audioText: "Son quince euros, por favor.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Son quince euros, por favor.", "¿Cuántos años tienes?", "Son las tres y treinta.", "Cien euros."], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", en: "I have two dogs and three cats at home.", es: "Tengo dos perros y tres gatos en casa." } },
        { text: "줄에 열다섯 명이 있어요. 정말 많다!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "줄에 열다섯 명이 있어요. 정말 많다!", en: "There are fifteen people in line. That's a lot!", es: "Hay quince personas en la fila. ¡Son muchas!" } },
        { text: "스물, 서른, 마흔, 쉰, 예순, 일흔, 여든, 아흔, 백.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "20, 30, 40, 50, 60, 70, 80, 90, 100.", en: "Tens: twenty to one hundred (native Korean).", es: "Decenas: veinte a cien (coreano nativo)." } },
        { text: "몇 살이에요? 저는 스물다섯 살이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "몇 살이에요? 저는 스물다섯 살이에요.", en: "How old are you? I'm twenty-five.", es: "¿Cuántos años? Tengo veinticinco." }, recallRound: true },
        { text: "십오 달러입니다.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "15달러입니다.", en: "That's fifteen dollars.", es: "Son quince dólares." }, recallRound: true },
        { text: "세 시 삼십 분이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "세 시 삼십 분이에요.", en: "It's three thirty.", es: "Son las tres y treinta." } },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: 몇 살이에요? → 저는 ___ 살이에요. / 나이: 순수 한국어 숫자(하나, 둘, 셋...). 가격/전화번호: 한자 숫자(일, 이, 삼...). 십 단위: 스물(20)~백(100).", en: "Pattern: 몇 살이에요? → 저는 ___ 살이에요. Korean has TWO number systems! Age uses native Korean (하나, 둘, 셋...). Prices/phone numbers use Sino-Korean (일, 이, 삼...). Tens: 스물(20) to 백(100).", es: "Patrón: 몇 살이에요? → 저는 ___ 살이에요. ¡El coreano tiene DOS sistemas de números! Edad: coreano nativo (하나, 둘...). Precios/teléfonos: sino-coreano (일, 이, 삼...)." },
          examples: { ko: "몇 살이에요? 저는 스물다섯 살이에요. (나이 묻고 답하기)\n십오 달러입니다. (가격 말하기 — 한자 숫자)\n전화번호는 공일공-일이삼사예요. (전화번호 — 한자 숫자)", en: "몇 살이에요? 저는 스물다섯 살이에요. (How old? I'm 25 — native numbers for age.)\n십오 달러입니다. (Fifteen dollars — Sino-Korean for prices.)\n전화번호는 공일공-일이삼사예요. (Phone number — Sino-Korean for digits.)", es: "몇 살이에요? 저는 스물다섯 살이에요. (¿Cuántos años? 25 — números nativos para edad.)\n십오 달러입니다. (Quince dólares — sino-coreano para precios.)\n전화번호는 공일공-일이삼사예요. (Número de teléfono — sino-coreano para dígitos.)" },
          mistakes: { ko: "❌ 저는 이십오 살이에요.\n✅ 저는 스물다섯 살이에요. (나이는 순수 숫자! 한자 숫자 쓰면 안 돼요)\n\n❌ 하나오 달러입니다.\n✅ 십오 달러입니다. (가격은 한자 숫자를 써요!)", en: "❌ 저는 이십오 살이에요.\n✅ 저는 스물다섯 살이에요. (Age needs native Korean numbers, not Sino-Korean!)\n\n❌ 하나오 달러입니다.\n✅ 십오 달러입니다. (Prices use Sino-Korean numbers!)", es: "❌ 저는 이십오 살이에요.\n✅ 저는 스물다섯 살이에요. (La edad necesita números nativos coreanos, no sino-coreanos.)\n\n❌ 하나오 달러입니다.\n✅ 십오 달러입니다. (Los precios usan números sino-coreanos.)" },
          rudyTip: { ko: "탐정 루디의 팁: 나이=순수 숫자, 돈=한자 숫자! 이 단서만 기억하면 숫자 미스터리는 해결이야~", en: "Detective Rudy's tip: Korean has two number systems — think of it like two separate case files! Native numbers for age, Sino-Korean for money. Crack this code and you're golden.", es: "Consejo del detective Rudy: El coreano tiene dos sistemas de números — como dos archivos de casos separados. Nativos para edad, sino-coreano para dinero. ¡Descifra este código!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "몇 ___이에요?", answer: "살", options: ["살", "개", "번"], fullSentence: "몇 살이에요?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
          { type: "select", promptWithBlank: "저는 스물다섯 ___이에요.", answer: "살", options: ["살", "년", "개"], fullSentence: "저는 스물다섯 살이에요.", fullSentenceMeaning: { ko: "저는 스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." } },
          { type: "select", promptWithBlank: "열, ___, 열둘, 열셋...", answer: "열하나", options: ["열하나", "십일", "열한개"], fullSentence: "열, 열하나, 열둘, 열셋.", fullSentenceMeaning: { ko: "10, 11, 12, 13.", en: "Ten, eleven, twelve, thirteen.", es: "Diez, once, doce, trece." } },
          { type: "fill_blank", promptWithBlank: "___ 달러입니다.", answer: "십오", options: ["십오", "오십", "십사"], fullSentence: "십오 달러입니다.", fullSentenceMeaning: { ko: "15달러입니다.", en: "Fifteen dollars.", es: "Quince dólares." } },
          { type: "input", promptWithBlank: "스물, 서른, 마흔, ___.", answer: "쉰", fullSentence: "스물, 서른, 마흔, 쉰.", fullSentenceMeaning: { ko: "20, 30, 40, 50.", en: "Twenty, thirty, forty, fifty.", es: "Veinte, treinta, cuarenta, cincuenta." } },
          { type: "listening", audioText: "십오 달러입니다.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["십오 달러입니다.", "몇 살이에요?", "세 시 삼십 분이에요.", "백 달러입니다."], correct: 0, audioOnly: true },
        ],
      },
    },
    indonesian: {
      step1Sentences: [
        { text: "Saya punya dua anjing dan tiga kucing di rumah.", speechLang: "id-ID", meaning: { ko: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", en: "I have two dogs and three cats at home.", es: "Tengo dos perros y tres gatos en casa." } },
        { text: "Ada lima belas orang di antrean. Banyak sekali!", speechLang: "id-ID", meaning: { ko: "줄에 열다섯 명이 있어요. 정말 많다!", en: "There are fifteen people in line. That's a lot!", es: "Hay quince personas en la fila. ¡Son muchas!" } },
        { text: "Dua puluh, tiga puluh, empat puluh, lima puluh, enam puluh, tujuh puluh, delapan puluh, sembilan puluh, seratus.", speechLang: "id-ID", meaning: { ko: "20, 30, 40, 50, 60, 70, 80, 90, 100.", en: "Tens: twenty to one hundred.", es: "Decenas: veinte a cien." } },
        { text: "Berapa umur Anda? Saya berumur dua puluh lima tahun.", speechLang: "id-ID", meaning: { ko: "몇 살이에요? 저는 스물다섯 살이에요.", en: "How old are you? I'm twenty-five years old.", es: "¿Cuántos años tienes? Tengo veinticinco años." }, recallRound: true },
        { text: "Ini lima belas dolar.", speechLang: "id-ID", meaning: { ko: "15달러입니다.", en: "That's fifteen dollars, please.", es: "Son quince dólares, por favor." }, recallRound: true },
        { text: "Sekarang jam setengah empat.", speechLang: "id-ID", meaning: { ko: "세 시 삼십 분이에요.", en: "It's three thirty.", es: "Son las tres y treinta." } },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Berapa umur Anda? → Saya berumur ___ tahun. / 인도네시아어 숫자는 규칙적이에요! 11-19는 'belas'(sebelas, dua belas...), 십 단위는 'puluh'(dua puluh=20), 100은 'seratus'.", en: "Pattern: Berapa umur Anda? → Saya berumur ___ tahun. Indonesian numbers are wonderfully regular! 11-19 use 'belas' (sebelas, dua belas...), tens use 'puluh' (dua puluh=20), and 100 is 'seratus'.", es: "Patrón: Berapa umur Anda? → Saya berumur ___ tahun. ¡Los números indonesios son muy regulares! 11-19 usan 'belas' (sebelas, dua belas...), las decenas usan 'puluh' (dua puluh=20), y 100 es 'seratus'." },
          examples: { ko: "Berapa umur Anda? Saya berumur dua puluh lima tahun. (몇 살이에요? 25살이에요.)\nIni lima belas dolar. (15달러입니다.)\nAda tiga puluh siswa di kelas saya. (우리 반에 학생이 30명이에요.)", en: "Berapa umur Anda? Saya berumur dua puluh lima tahun. (Asking and telling age.)\nIni lima belas dolar. (Using numbers for prices.)\nAda tiga puluh siswa di kelas saya. (Counting people with numbers.)", es: "Berapa umur Anda? Saya berumur dua puluh lima tahun. (Preguntando y diciendo la edad.)\nIni lima belas dolar. (Usando números para precios.)\nAda tiga puluh siswa di kelas saya. (Contando personas.)" },
          mistakes: { ko: "❌ Saya berumur dua puluh lima.\n✅ Saya berumur dua puluh lima tahun. ('tahun'(살/년)을 꼭 붙여야 해요!)\n\n❌ lima puluh (50) ↔ lima belas (15)\n✅ lima belas=15, lima puluh=50 (belas와 puluh를 헷갈리지 마세요!)", en: "❌ Saya berumur dua puluh lima.\n✅ Saya berumur dua puluh lima tahun. (Don't forget 'tahun' (years) at the end!)\n\n❌ Mixing lima belas (15) and lima puluh (50)\n✅ lima belas=15, lima puluh=50 (belas=teen, puluh=ty — don't swap them!)", es: "❌ Saya berumur dua puluh lima.\n✅ Saya berumur dua puluh lima tahun. (No olvides 'tahun' (años) al final.)\n\n❌ Confundir lima belas (15) y lima puluh (50)\n✅ lima belas=15, lima puluh=50 (belas=teen, puluh=ty — ¡no los cambies!)" },
          rudyTip: { ko: "탐정 루디의 팁: 인도네시아어 숫자는 레고 블록 같아! 'belas'(11-19)랑 'puluh'(십 단위)만 알면 100까지 조립 완성. 영어보다 훨씬 규칙적이야~", en: "Detective Rudy's tip: Indonesian numbers are like Lego blocks! Learn 'belas' (11-19) and 'puluh' (tens) and you can build everything up to 100. Far more regular than English!", es: "Consejo del detective Rudy: ¡Los números indonesios son como bloques de Lego! Aprende 'belas' (11-19) y 'puluh' (decenas) y puedes construir todo hasta 100. ¡Mucho más regular que el inglés!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Berapa ___ Anda?", answer: "umur", options: ["umur", "nama", "kota"], fullSentence: "Berapa umur Anda?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
          { type: "select", promptWithBlank: "Saya berumur dua puluh lima ___.", answer: "tahun", options: ["tahun", "hari", "jam"], fullSentence: "Saya berumur dua puluh lima tahun.", fullSentenceMeaning: { ko: "저는 스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." } },
          { type: "select", promptWithBlank: "Sepuluh, ___, dua belas, tiga belas...", answer: "sebelas", options: ["sebelas", "sepuluh satu", "satu belas"], fullSentence: "Sepuluh, sebelas, dua belas, tiga belas.", fullSentenceMeaning: { ko: "10, 11, 12, 13.", en: "Ten, eleven, twelve, thirteen.", es: "Diez, once, doce, trece." } },
          { type: "fill_blank", promptWithBlank: "Ini ___ dolar.", answer: "lima belas", options: ["lima belas", "lima puluh", "empat belas"], fullSentence: "Ini lima belas dolar.", fullSentenceMeaning: { ko: "15달러입니다.", en: "Fifteen dollars.", es: "Quince dólares." } },
          { type: "input", promptWithBlank: "Dua puluh, tiga puluh, empat puluh, ___ puluh.", answer: "lima", fullSentence: "Dua puluh, tiga puluh, empat puluh, lima puluh.", fullSentenceMeaning: { ko: "20, 30, 40, 50.", en: "Twenty, thirty, forty, fifty.", es: "Veinte, treinta, cuarenta, cincuenta." } },
          { type: "listening", audioText: "Ini lima belas dolar.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Ini lima belas dolar.", "Berapa umur Anda?", "Sekarang jam setengah empat.", "Ini seratus dolar."], correct: 0, audioOnly: true },
        ],
      },
    },
    arabic: {
      step1Sentences: [
        { text: "عَنْدِي كَلْبِين وْتَلَات قُطَط فِي الْبيت. (3andi kalbeen we-talat ʼoṭaṭ fil-beet.)", speechLang: "ar-EG", meaning: { ko: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", en: "I have two dogs and three cats at home.", es: "Tengo dos perros y tres gatos en casa." } },
        { text: "فِيه خَمَسْتَاشَر وَاحِد فِي الطَّابُور. دُول كْتِير! (fiih khamastaashar waaḥed fiṭ-ṭaaboor. dool kteer!)", speechLang: "ar-EG", meaning: { ko: "줄에 열다섯 명이 있어요. 정말 많다!", en: "There are fifteen people in line. That's a lot!", es: "Hay quince personas en la fila. ¡Son muchas!" } },
        { text: "عِشْرِين، تَلَاتِين، أَرْبِعِين، خَمْسِين، سِتِّين، سَبْعِين، تَمَانِين، تِسْعِين، مِيَّة. (3eshreen, talaateen, arbi3een, khamseen, setteen, sab3een, tamaaneen, tes3een, meyya.)", speechLang: "ar-EG", meaning: { ko: "20, 30, 40, 50, 60, 70, 80, 90, 100.", en: "Tens: twenty to one hundred.", es: "Decenas: veinte a cien." } },
        { text: "عَنْدَك كَام سَنَة؟ أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة. (3andak kaam sana? ana 3andi khamsa we-3eshreen sana.)", speechLang: "ar-EG", meaning: { ko: "몇 살이에요? 저는 스물다섯 살이에요.", en: "How old are you? I'm twenty-five years old.", es: "¿Cuántos años tienes? Tengo veinticinco años." }, recallRound: true },
        { text: "دَه بِخَمَسْتَاشَر دُولَار. (da be-khamastaashar dolaar.)", speechLang: "ar-EG", meaning: { ko: "15달러입니다.", en: "That's fifteen dollars, please.", es: "Son quince dólares, por favor." }, recallRound: true },
        { text: "السَّاعَة تَلَاتَة وْنُص. (es-saa3a talaata we-noṣ.)", speechLang: "ar-EG", meaning: { ko: "세 시 삼십 분이에요.", en: "It's three thirty.", es: "Son las tres y treinta." } },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: عَنْدَك كَام سَنَة؟ (3andak kaam sana?) → أَنَا عَنْدِي ___ سَنَة. / 나이는 '가지다(3andi)'로 표현해요. 11-19는 '-taashar'(khamastaashar=15), 십 단위는 '-een'(3eshreen=20), 100은 'meyya'.", en: "Pattern: 3andak kaam sana? → ana 3andi ___ sana. Egyptian uses 'to have' (3andi) for age. 11-19 end in '-taashar' (khamastaashar=15), tens end in '-een' (3eshreen=20), and 100 is 'meyya'.", es: "Patrón: 3andak kaam sana? → ana 3andi ___ sana. El egipcio usa 'tener' (3andi) para la edad. 11-19 terminan en '-taashar' (khamastaashar=15), las decenas en '-een' (3eshreen=20), y 100 es 'meyya'." },
          examples: { ko: "عَنْدَك كَام سَنَة؟ أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة. (몇 살이에요? 25살이에요.)\nدَه بِخَمَسْتَاشَر دُولَار. (15달러입니다.)\nفِيه تَلَاتِين طَالِب فِي فَصْلِي. (우리 반에 학생이 30명이에요.)", en: "3andak kaam sana? ana 3andi khamsa we-3eshreen sana. (Asking and telling age.)\nda be-khamastaashar dolaar. (Using numbers for prices.)\nfiih talaateen ṭaaleb fi faṣli. (Counting people with numbers.)", es: "3andak kaam sana? ana 3andi khamsa we-3eshreen sana. (Preguntando y diciendo la edad.)\nda be-khamastaashar dolaar. (Usando números para precios.)\nfiih talaateen ṭaaleb fi faṣli. (Contando personas.)" },
          mistakes: { ko: "❌ أَنَا خَمْسَة وْعِشْرِين سَنَة. (ana khamsa we-3eshreen sana.)\n✅ أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة. (나이는 'عَنْدِي'(3andi=가지고 있다)를 꼭 써요!)\n\n❌ خَمْسِين (khamseen=50) ↔ خَمَسْتَاشَر (khamastaashar=15)\n✅ khamastaashar=15, khamseen=50 ('-taashar'와 '-een'을 헷갈리지 마세요!)", en: "❌ ana khamsa we-3eshreen sana.\n✅ ana 3andi khamsa we-3eshreen sana. (Use '3andi' (I have) for age — don't drop it!)\n\n❌ Mixing khamastaashar (15) and khamseen (50)\n✅ khamastaashar=15, khamseen=50 ('-taashar'=teen, '-een'=ty — don't swap them!)", es: "❌ ana khamsa we-3eshreen sana.\n✅ ana 3andi khamsa we-3eshreen sana. (Usa '3andi' (tengo) para la edad — ¡no lo omitas!)\n\n❌ Confundir khamastaashar (15) y khamseen (50)\n✅ khamastaashar=15, khamseen=50 ('-taashar'=teen, '-een'=ty — ¡no los cambies!)" },
          rudyTip: { ko: "탐정 루디의 팁: 이집트 아랍어 숫자도 레고 블록이야! '-taashar'(11-19)랑 '-een'(십 단위)만 알면 100까지 조립 끝. 그리고 나이엔 항상 'عَنْدِي'(3andi=나 가지고 있어)를 붙여~", en: "Detective Rudy's tip: Egyptian numbers are like Lego blocks too! Learn '-taashar' (11-19) and '-een' (tens) and you can build up to 100. And for age, always say '3andi' (I have)!", es: "Consejo del detective Rudy: ¡Los números egipcios también son como bloques de Lego! Aprende '-taashar' (11-19) y '-een' (decenas) y construyes hasta 100. Y para la edad, siempre di '3andi' (tengo)." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "عَنْدَك كَام ___؟", answer: "سَنَة", options: ["سَنَة", "اِسْم", "بَلَد"], fullSentence: "عَنْدَك كَام سَنَة؟", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
          { type: "select", promptWithBlank: "أَنَا ___ خَمْسَة وْعِشْرِين سَنَة.", answer: "عَنْدِي", options: ["عَنْدِي", "أَنَا", "بَتَاعِي"], fullSentence: "أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة.", fullSentenceMeaning: { ko: "저는 스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." } },
          { type: "select", promptWithBlank: "عَشَرَة، ___، اِتْنَاشَر، تَلَتَاشَر...", answer: "حِدَاشَر", options: ["حِدَاشَر", "عَشَرَة وَاحِد", "وَاحِد عَشَرَة"], fullSentence: "عَشَرَة، حِدَاشَر، اِتْنَاشَر، تَلَتَاشَر.", fullSentenceMeaning: { ko: "10, 11, 12, 13.", en: "Ten, eleven, twelve, thirteen.", es: "Diez, once, doce, trece." } },
          { type: "fill_blank", promptWithBlank: "دَه بِـ ___ دُولَار.", answer: "خَمَسْتَاشَر", options: ["خَمَسْتَاشَر", "خَمْسِين", "أَرْبَعْتَاشَر"], fullSentence: "دَه بِخَمَسْتَاشَر دُولَار.", fullSentenceMeaning: { ko: "15달러입니다.", en: "Fifteen dollars.", es: "Quince dólares." } },
          { type: "input", promptWithBlank: "عِشْرِين، تَلَاتِين، أَرْبِعِين، ___.", answer: "خَمْسِين", fullSentence: "عِشْرِين، تَلَاتِين، أَرْبِعِين، خَمْسِين.", fullSentenceMeaning: { ko: "20, 30, 40, 50.", en: "Twenty, thirty, forty, fifty.", es: "Veinte, treinta, cuarenta, cincuenta." } },
          { type: "listening", audioText: "دَه بِخَمَسْتَاشَر دُولَار.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["دَه بِخَمَسْتَاشَر دُولَار.", "عَنْدَك كَام سَنَة؟", "السَّاعَة تَلَاتَة وْنُص.", "دَه بْمِيَّة دُولَار."], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 8: Days of the Week ───────────────────────────────────
  day_8: {
    english: {
      step1Sentences: [
        { text: "What day is it today?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
        { text: "Today is Monday.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "오늘은 월요일이에요.", en: "Today is Monday.", es: "Hoy es lunes." } },
        { text: "I work from Monday to Friday.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "월요일부터 금요일까지 일해요.", en: "I work from Monday to Friday.", es: "Trabajo de lunes a viernes." } },
        { text: "What are you doing this weekend?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "이번 주말에 뭐 해?", en: "What are you doing this weekend?", es: "¿Qué haces este fin de semana?" }, recallRound: true },
        { text: "See you on Wednesday!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: What day is it today? → Today is ___. / 요일 앞에 'on': 'on Monday'. 범위: 'from A to B'. 요일: Monday~Sunday.", en: "Pattern: What day is it today? → Today is ___. Use 'on' before days: 'on Monday'. Range: 'from A to B'. Days: Monday through Sunday.", es: "Patrón: What day is it today? → Today is ___. Usa 'on' antes del día: 'on Monday'. Rango: 'from A to B'. Días: Monday a Sunday." },
          examples: { ko: "What day is it today? Today is Monday. (오늘 무슨 요일? 월요일이에요.)\nI work from Monday to Friday. (월요일부터 금요일까지 일해요.)\nSee you on Wednesday! (수요일에 봐요!)", en: "What day is it today? Today is Monday. (Asking about the day.)\nI work from Monday to Friday. (Describing your work week.)\nSee you on Wednesday! (Making plans for a specific day.)", es: "What day is it today? Today is Monday. (Preguntando por el día.)\nI work from Monday to Friday. (Describiendo la semana laboral.)\nSee you on Wednesday! (Haciendo planes para un día.)" },
          mistakes: { ko: "❌ See you in Monday.\n✅ See you on Monday. (요일 앞에는 항상 'on'이에요!)\n\n❌ I work from Monday at Friday.\n✅ I work from Monday to Friday. ('from...to...' 짝으로 써요!)", en: "❌ See you in Monday.\n✅ See you on Monday. (Always use 'on' with days, not 'in'!)\n\n❌ I work from Monday at Friday.\n✅ I work from Monday to Friday. ('From' always pairs with 'to'!)", es: "❌ See you in Monday.\n✅ See you on Monday. (Siempre usa 'on' con días, no 'in'.)\n\n❌ I work from Monday at Friday.\n✅ I work from Monday to Friday. ('From' siempre va con 'to'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 요일은 항상 대문자로 시작해! Monday, Tuesday... 마치 이름처럼! 'on'이랑 짝꿍이니까 같이 외워둬~", en: "Detective Rudy's tip: Days of the week are always capitalised in English — they're proper nouns, like names! And 'on' is their best friend: 'on Monday, on Tuesday...'", es: "Consejo del detective Rudy: Los días de la semana siempre van con mayúscula en inglés — son nombres propios. Y 'on' es su mejor amigo: 'on Monday, on Tuesday...'" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "What ___ is it today?", answer: "day", options: ["day", "date", "time"], fullSentence: "What day is it today?", fullSentenceMeaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
          { type: "select", promptWithBlank: "I work ___ Monday to Friday.", answer: "from", options: ["from", "on", "at"], fullSentence: "I work from Monday to Friday.", fullSentenceMeaning: { ko: "월요일부터 금요일까지 일해요.", en: "I work from Monday to Friday.", es: "Trabajo de lunes a viernes." } },
          { type: "select", promptWithBlank: "See you ___ Wednesday!", answer: "on", options: ["on", "at", "in"], fullSentence: "See you on Wednesday!", fullSentenceMeaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" } },
          { type: "input", promptWithBlank: "Today is ___.", answer: "Monday", fullSentence: "Today is Monday.", fullSentenceMeaning: { ko: "오늘은 월요일이에요.", en: "Today is Monday.", es: "Hoy es lunes." } },
          { type: "listening", audioText: "What are you doing this weekend?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["What are you doing this weekend?", "Today is Monday.", "I work from Monday to Friday.", "See you on Wednesday!"], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "¿Qué día es hoy?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
        { text: "Hoy es lunes.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "오늘은 월요일이에요.", en: "Today is Monday.", es: "Hoy es lunes." } },
        { text: "Trabajo de lunes a viernes.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "월요일부터 금요일까지 일해요.", en: "I work from Monday to Friday.", es: "Trabajo de lunes a viernes." } },
        { text: "¿Qué haces este fin de semana?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "이번 주말에 뭐 해?", en: "What are you doing this weekend?", es: "¿Qué haces este fin de semana?" }, recallRound: true },
        { text: "¡Te veo el miércoles!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: ¿Qué día es hoy? → Hoy es ___. / 요일: lunes~domingo (소문자!). 범위: 'de A a B'. 특정 요일: 'el + 요일'.", en: "Pattern: ¿Qué día es hoy? → Hoy es ___. Days: lunes through domingo (lowercase!). Range: 'de A a B'. Specific day: 'el + day'.", es: "Patrón: ¿Qué día es hoy? → Hoy es ___. Días: lunes a domingo (¡minúscula!). Rango: 'de A a B'. Día específico: 'el + día'." },
          examples: { ko: "¿Qué día es hoy? Hoy es lunes. (오늘 무슨 요일? 월요일이에요.)\nTrabajo de lunes a viernes. (월요일부터 금요일까지 일해요.)\n¡Te veo el miércoles! (수요일에 봐요!)", en: "¿Qué día es hoy? Hoy es lunes. (What day is it? It's Monday.)\nTrabajo de lunes a viernes. (I work Monday to Friday.)\n¡Te veo el miércoles! (See you on Wednesday!)", es: "¿Qué día es hoy? Hoy es lunes. (Preguntando por el día.)\nTrabajo de lunes a viernes. (Describiendo la semana laboral.)\n¡Te veo el miércoles! (Haciendo planes para un día.)" },
          mistakes: { ko: "❌ Hoy es Lunes.\n✅ Hoy es lunes. (스페인어 요일은 소문자로 써요!)\n\n❌ Te veo en miércoles.\n✅ Te veo el miércoles. ('el'을 써요, 'en'이 아니에요!)", en: "❌ Hoy es Lunes.\n✅ Hoy es lunes. (Spanish days are lowercase — unlike English!)\n\n❌ Te veo en miércoles.\n✅ Te veo el miércoles. (Use 'el' before the day, not 'en'!)", es: "❌ Hoy es Lunes.\n✅ Hoy es lunes. (Los días van en minúscula en español.)\n\n❌ Te veo en miércoles.\n✅ Te veo el miércoles. (Usa 'el' antes del día, no 'en'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 영어 요일은 대문자, 스페인어 요일은 소문자! 이 차이점을 기억하면 실수 안 해~", en: "Detective Rudy's tip: Unlike English, Spanish days are lowercase — lunes, not Lunes! And use 'el' instead of 'on': 'el lunes' = 'on Monday'. Case closed!", es: "Consejo del detective Rudy: A diferencia del inglés, los días en español van en minúscula. Y usa 'el' en vez de 'on': 'el lunes'. ¡Caso cerrado!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Qué ___ es hoy?", answer: "día", options: ["día", "hora", "fecha"], fullSentence: "¿Qué día es hoy?", fullSentenceMeaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
          { type: "select", promptWithBlank: "Trabajo ___ lunes a viernes.", answer: "de", options: ["de", "en", "por"], fullSentence: "Trabajo de lunes a viernes.", fullSentenceMeaning: { ko: "월요일부터 금요일까지 일해요.", en: "I work from Monday to Friday.", es: "Trabajo de lunes a viernes." } },
          { type: "select", promptWithBlank: "¡Te veo ___ miércoles!", answer: "el", options: ["el", "en", "a"], fullSentence: "¡Te veo el miércoles!", fullSentenceMeaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" } },
          { type: "input", promptWithBlank: "Hoy es ___.", answer: "lunes", fullSentence: "Hoy es lunes.", fullSentenceMeaning: { ko: "오늘은 월요일이에요.", en: "Today is Monday.", es: "Hoy es lunes." } },
          { type: "listening", audioText: "¿Qué haces este fin de semana?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Qué haces este fin de semana?", "Hoy es lunes.", "Trabajo de lunes a viernes.", "¡Te veo el miércoles!"], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "오늘 무슨 요일이에요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
        { text: "오늘은 월요일이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "오늘은 월요일이에요.", en: "Today is Monday.", es: "Hoy es lunes." } },
        { text: "월요일부터 금요일까지 일해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "월요일부터 금요일까지 일해요.", en: "I work from Monday to Friday.", es: "Trabajo de lunes a viernes." } },
        { text: "이번 주말에 뭐 해?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "이번 주말에 뭐 해?", en: "What are you doing this weekend?", es: "¿Qué haces este fin de semana?" }, recallRound: true },
        { text: "수요일에 봐요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: 오늘 무슨 요일이에요? → 오늘은 ___이에요. / 요일: 월요일~일요일. 범위: '___부터 ___까지'. 특정 요일: '요일+에'.", en: "Pattern: 오늘 무슨 요일이에요? → 오늘은 ___이에요. Days: 월요일 to 일요일. Range: '___부터 ___까지'. Specific day: 'day+에'.", es: "Patrón: 오늘 무슨 요일이에요? → 오늘은 ___이에요. Días: 월요일 a 일요일. Rango: '___부터 ___까지'. Día específico: 'día+에'." },
          examples: { ko: "오늘 무슨 요일이에요? 오늘은 월요일이에요. (요일 묻고 답하기)\n월요일부터 금요일까지 일해요. (범위 표현하기)\n수요일에 봐요! (특정 요일에 약속하기)", en: "오늘 무슨 요일이에요? 오늘은 월요일이에요. (What day? It's Monday.)\n월요일부터 금요일까지 일해요. (I work Monday to Friday.)\n수요일에 봐요! (See you on Wednesday!)", es: "오늘 무슨 요일이에요? 오늘은 월요일이에요. (¿Qué día? Es lunes.)\n월요일부터 금요일까지 일해요. (Trabajo de lunes a viernes.)\n수요일에 봐요! (¡Te veo el miércoles!)" },
          mistakes: { ko: "❌ 월요일을 봐요.\n✅ 월요일에 봐요. (요일 뒤에는 '에'를 붙여요!)\n\n❌ 월요일에서 금요일에 일해요.\n✅ 월요일부터 금요일까지 일해요. ('부터...까지' 짝으로 써요!)", en: "❌ 월요일을 봐요.\n✅ 월요일에 봐요. (Use '에' after days, not '을'!)\n\n❌ 월요일에서 금요일에 일해요.\n✅ 월요일부터 금요일까지 일해요. (Use '부터...까지' for 'from...to'!)", es: "❌ 월요일을 봐요.\n✅ 월요일에 봐요. (Usa '에' después de los días, no '을'.)\n\n❌ 월요일에서 금요일에 일해요.\n✅ 월요일부터 금요일까지 일해요. (Usa '부터...까지' para 'de...a'.)" },
          rudyTip: { ko: "탐정 루디의 팁: '부터...까지'는 범위를 나타내는 짝꿍이야! 월요일부터 금요일까지, 1부터 10까지... 이 단서만 알면 범위 표현은 끝!", en: "Detective Rudy's tip: '부터...까지' is a perfect pair — like 'from...to'. Monday부터 Friday까지! Once you spot this pattern, you'll use it everywhere.", es: "Consejo del detective Rudy: '부터...까지' es un par perfecto — como 'de...a'. Monday부터 Friday까지. Una vez que veas este patrón, lo usarás en todas partes." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "오늘 무슨 ___이에요?", answer: "요일", options: ["요일", "날", "시간"], fullSentence: "오늘 무슨 요일이에요?", fullSentenceMeaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
          { type: "select", promptWithBlank: "월요일___ 금요일까지 일해요.", answer: "부터", options: ["부터", "에서", "에"], fullSentence: "월요일부터 금요일까지 일해요.", fullSentenceMeaning: { ko: "월요일부터 금요일까지 일해요.", en: "I work from Monday to Friday.", es: "Trabajo de lunes a viernes." } },
          { type: "select", promptWithBlank: "수요일___ 봐요!", answer: "에", options: ["에", "은", "이"], fullSentence: "수요일에 봐요!", fullSentenceMeaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" } },
          { type: "input", promptWithBlank: "오늘은 ___이에요.", answer: "월요일", fullSentence: "오늘은 월요일이에요.", fullSentenceMeaning: { ko: "오늘은 월요일이에요.", en: "Today is Monday.", es: "Hoy es lunes." } },
          { type: "listening", audioText: "이번 주말에 뭐 해?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["이번 주말에 뭐 해?", "오늘은 월요일이에요.", "월요일부터 금요일까지 일해요.", "수요일에 봐요!"], correct: 0, audioOnly: true },
        ],
      },
    },
    indonesian: {
      step1Sentences: [
        { text: "Hari ini hari apa?", speechLang: "id-ID", meaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
        { text: "Hari ini hari Senin.", speechLang: "id-ID", meaning: { ko: "오늘은 월요일이에요.", en: "Today is Monday.", es: "Hoy es lunes." } },
        { text: "Saya bekerja dari Senin sampai Jumat.", speechLang: "id-ID", meaning: { ko: "월요일부터 금요일까지 일해요.", en: "I work from Monday to Friday.", es: "Trabajo de lunes a viernes." } },
        { text: "Apa rencana Anda akhir pekan ini?", speechLang: "id-ID", meaning: { ko: "이번 주말에 뭐 해?", en: "What are you doing this weekend?", es: "¿Qué haces este fin de semana?" }, recallRound: true },
        { text: "Sampai jumpa hari Rabu!", speechLang: "id-ID", meaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Hari ini hari apa? → Hari ini hari ___. / 요일 앞에 항상 'hari'(날)를 붙여요: hari Senin(월요일). 범위: 'dari A sampai B'. 요일: Senin~Minggu.", en: "Pattern: Hari ini hari apa? → Hari ini hari ___. Always put 'hari' (day) before the weekday: hari Senin (Monday). Range: 'dari A sampai B'. Days: Senin to Minggu.", es: "Patrón: Hari ini hari apa? → Hari ini hari ___. Siempre pon 'hari' (día) antes del día: hari Senin (lunes). Rango: 'dari A sampai B'. Días: Senin a Minggu." },
          examples: { ko: "Hari ini hari apa? Hari ini hari Senin. (오늘 무슨 요일? 월요일이에요.)\nSaya bekerja dari Senin sampai Jumat. (월요일부터 금요일까지 일해요.)\nSampai jumpa hari Rabu! (수요일에 봐요!)", en: "Hari ini hari apa? Hari ini hari Senin. (Asking about the day.)\nSaya bekerja dari Senin sampai Jumat. (Describing your work week.)\nSampai jumpa hari Rabu! (Making plans for a specific day.)", es: "Hari ini hari apa? Hari ini hari Senin. (Preguntando por el día.)\nSaya bekerja dari Senin sampai Jumat. (Describiendo la semana laboral.)\nSampai jumpa hari Rabu! (Haciendo planes para un día.)" },
          mistakes: { ko: "❌ Hari ini Senin. (틀린 건 아니지만)\n✅ Hari ini hari Senin. (요일 앞에 'hari'를 붙이면 더 자연스러워요!)\n\n❌ dari Senin ke Jumat.\n✅ dari Senin sampai Jumat. (범위는 'sampai'를 써요, 'ke'가 아니에요!)", en: "❌ Hari ini Senin. (understandable, but...)\n✅ Hari ini hari Senin. (Put 'hari' before the day — it sounds more natural!)\n\n❌ dari Senin ke Jumat.\n✅ dari Senin sampai Jumat. (For a range, use 'sampai', not 'ke'!)", es: "❌ Hari ini Senin. (se entiende, pero...)\n✅ Hari ini hari Senin. (Pon 'hari' antes del día — ¡suena más natural!)\n\n❌ dari Senin ke Jumat.\n✅ dari Senin sampai Jumat. (Para un rango, usa 'sampai', no 'ke'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 인도네시아어 요일엔 항상 'hari'가 따라다녀! hari Senin, hari Selasa... 마치 '요일'이라는 꼬리표 같아. 이 단서만 기억하면 끝!", en: "Detective Rudy's tip: In Indonesian, 'hari' (day) follows the weekday everywhere! Hari Senin, hari Selasa... it's like a little tag. Spot this clue and you're set!", es: "Consejo del detective Rudy: ¡En indonesio, 'hari' (día) acompaña al día de la semana en todas partes! Hari Senin, hari Selasa... es como una etiqueta. ¡Detecta esta pista y listo!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Hari ini hari ___?", answer: "apa", options: ["apa", "mana", "siapa"], fullSentence: "Hari ini hari apa?", fullSentenceMeaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
          { type: "select", promptWithBlank: "Saya bekerja ___ Senin sampai Jumat.", answer: "dari", options: ["dari", "di", "ke"], fullSentence: "Saya bekerja dari Senin sampai Jumat.", fullSentenceMeaning: { ko: "월요일부터 금요일까지 일해요.", en: "I work from Monday to Friday.", es: "Trabajo de lunes a viernes." } },
          { type: "select", promptWithBlank: "Sampai ___ hari Rabu!", answer: "jumpa", options: ["jumpa", "nanti", "besok"], fullSentence: "Sampai jumpa hari Rabu!", fullSentenceMeaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" } },
          { type: "input", promptWithBlank: "Hari ini hari ___.", answer: "Senin", fullSentence: "Hari ini hari Senin.", fullSentenceMeaning: { ko: "오늘은 월요일이에요.", en: "Today is Monday.", es: "Hoy es lunes." } },
          { type: "listening", audioText: "Apa rencana Anda akhir pekan ini?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Apa rencana Anda akhir pekan ini?", "Hari ini hari Senin.", "Saya bekerja dari Senin sampai Jumat.", "Sampai jumpa hari Rabu!"], correct: 0, audioOnly: true },
        ],
      },
    },
    arabic: {
      step1Sentences: [
        { text: "النَّهَارْدَه إِيه؟ (en-naharda eeh?)", speechLang: "ar-EG", meaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
        { text: "النَّهَارْدَه الِاتْنِين. (en-naharda el-etneen.)", speechLang: "ar-EG", meaning: { ko: "오늘은 월요일이에요.", en: "Today is Monday.", es: "Hoy es lunes." } },
        { text: "أَنَا بَشْتَغَل مِن الِاتْنِين لِلْجُمْعَة. (ana bashtaghal men el-etneen lel-gom3a.)", speechLang: "ar-EG", meaning: { ko: "월요일부터 금요일까지 일해요.", en: "I work from Monday to Friday.", es: "Trabajo de lunes a viernes." } },
        { text: "هَتْعْمِل إِيه آخِر الأُسْبُوع؟ (hat3mel eeh aakher el-osboo3?)", speechLang: "ar-EG", meaning: { ko: "이번 주말에 뭐 해?", en: "What are you doing this weekend?", es: "¿Qué haces este fin de semana?" }, recallRound: true },
        { text: "أَشُوفَك يَوْم الأَرْبَع! (ashoofak yoom el-arba3!)", speechLang: "ar-EG", meaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: النَّهَارْدَه إِيه؟ (en-naharda eeh?) → النَّهَارْدَه ___. / 요일: el-etneen(월)~el-gom3a(금)~es-sabt(토)~el-ḥadd(일). 범위: 'men A le-B'. 특정 요일: 'yoom + 요일'.", en: "Pattern: en-naharda eeh? → en-naharda ___. Days: el-etneen(Mon), et-talat(Tue), el-arba3(Wed), el-khamees(Thu), el-gom3a(Fri), es-sabt(Sat), el-ḥadd(Sun). Range: 'men A le-B'. Specific day: 'yoom + day'.", es: "Patrón: en-naharda eeh? → en-naharda ___. Días: el-etneen(lun), et-talat(mar), el-arba3(mié), el-khamees(jue), el-gom3a(vie), es-sabt(sáb), el-ḥadd(dom). Rango: 'men A le-B'. Día específico: 'yoom + día'." },
          examples: { ko: "النَّهَارْدَه إِيه؟ النَّهَارْدَه الِاتْنِين. (오늘 무슨 요일? 월요일이에요.)\nأَنَا بَشْتَغَل مِن الِاتْنِين لِلْجُمْعَة. (월요일부터 금요일까지 일해요.)\nأَشُوفَك يَوْم الأَرْبَع! (수요일에 봐요!)", en: "en-naharda eeh? en-naharda el-etneen. (Asking about the day.)\nana bashtaghal men el-etneen lel-gom3a. (Describing your work week.)\nashoofak yoom el-arba3! (Making plans for a specific day.)", es: "en-naharda eeh? en-naharda el-etneen. (Preguntando por el día.)\nana bashtaghal men el-etneen lel-gom3a. (Describiendo la semana laboral.)\nashoofak yoom el-arba3! (Haciendo planes para un día.)" },
          mistakes: { ko: "❌ أَشُوفَك فِي الأَرْبَع. (ashoofak fil-arba3.)\n✅ أَشُوفَك يَوْم الأَرْبَع. (요일 앞엔 'yoom'(날)을 붙이면 자연스러워요!)\n\n❌ مِن الِاتْنِين فِي الْجُمْعَة. (men el-etneen fil-gom3a.)\n✅ مِن الِاتْنِين لِلْجُمْعَة. (범위는 'men...le-...' 짝으로 써요!)", en: "❌ ashoofak fil-arba3.\n✅ ashoofak yoom el-arba3. (Put 'yoom' (day) before the weekday — it sounds natural!)\n\n❌ men el-etneen fil-gom3a.\n✅ men el-etneen lel-gom3a. (For a range, pair 'men...le-...'!)", es: "❌ ashoofak fil-arba3.\n✅ ashoofak yoom el-arba3. (Pon 'yoom' (día) antes del día — ¡suena natural!)\n\n❌ men el-etneen fil-gom3a.\n✅ men el-etneen lel-gom3a. (Para un rango, usa el par 'men...le-...'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 이집트 요일은 진짜 쉬워! 대부분 숫자에서 왔어 — et-talat(화)=3, el-arba3(수)=4, el-khamees(목)=5! 요일 앞에 'yoom'만 붙이면 끝~", en: "Detective Rudy's tip: Egyptian weekdays are easy — most come from numbers! et-talat (Tue)=3rd, el-arba3 (Wed)=4th, el-khamees (Thu)=5th! Just add 'yoom' before the day. Case solved!", es: "Consejo del detective Rudy: ¡Los días egipcios son fáciles — la mayoría vienen de números! et-talat (mar)=3º, el-arba3 (mié)=4º, el-khamees (jue)=5º. ¡Solo añade 'yoom' antes del día!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "النَّهَارْدَه ___؟", answer: "إِيه", options: ["إِيه", "فِين", "مِين"], fullSentence: "النَّهَارْدَه إِيه؟", fullSentenceMeaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
          { type: "select", promptWithBlank: "أَنَا بَشْتَغَل ___ الِاتْنِين لِلْجُمْعَة.", answer: "مِن", options: ["مِن", "فِي", "عَلَى"], fullSentence: "أَنَا بَشْتَغَل مِن الِاتْنِين لِلْجُمْعَة.", fullSentenceMeaning: { ko: "월요일부터 금요일까지 일해요.", en: "I work from Monday to Friday.", es: "Trabajo de lunes a viernes." } },
          { type: "select", promptWithBlank: "أَشُوفَك ___ الأَرْبَع!", answer: "يَوْم", options: ["يَوْم", "فِي", "عَلَى"], fullSentence: "أَشُوفَك يَوْم الأَرْبَع!", fullSentenceMeaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" } },
          { type: "input", promptWithBlank: "النَّهَارْدَه ___.", answer: "الِاتْنِين", fullSentence: "النَّهَارْدَه الِاتْنِين.", fullSentenceMeaning: { ko: "오늘은 월요일이에요.", en: "Today is Monday.", es: "Hoy es lunes." } },
          { type: "listening", audioText: "هَتْعْمِل إِيه آخِر الأُسْبُوع؟", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["هَتْعْمِل إِيه آخِر الأُسْبُوع؟", "النَّهَارْدَه الِاتْنِين.", "أَنَا بَشْتَغَل مِن الِاتْنِين لِلْجُمْعَة.", "أَشُوفَك يَوْم الأَرْبَع!"], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 9: Telling the Time ───────────────────────────────────
  day_9: {
    english: {
      step1Sentences: [
        { text: "What time is it?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
        { text: "It's three o'clock.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." } },
        { text: "It's half past seven.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "일곱 시 반이에요.", en: "It's half past seven.", es: "Son las siete y media." } },
        { text: "The meeting is at ten in the morning.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "회의는 아침 열 시예요.", en: "The meeting is at ten in the morning.", es: "La reunión es a las diez de la mañana." }, recallRound: true },
        { text: "I wake up at seven every day.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at seven every day.", es: "Me despierto a las siete todos los días." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: What time is it? → It's ___ o'clock. / 30분: 'half past ___'. 시간 앞에 'at': 'at three'. 오전: 'in the morning', 오후: 'in the afternoon'.", en: "Pattern: What time is it? → It's ___ o'clock. Half hour: 'half past ___'. Use 'at' before times: 'at three'. AM: 'in the morning'. PM: 'in the afternoon'.", es: "Patrón: What time is it? → It's ___ o'clock. Media hora: 'half past ___'. Usa 'at' antes de horas: 'at three'. AM: 'in the morning'. PM: 'in the afternoon'." },
          examples: { ko: "What time is it? It's three o'clock. (몇 시? 세 시예요.)\nIt's half past seven. (일곱 시 반이에요.)\nThe meeting is at ten in the morning. (회의는 오전 10시예요.)", en: "What time is it? It's three o'clock. (Asking and telling the time.)\nIt's half past seven. (Saying it's 7:30.)\nThe meeting is at ten in the morning. (Specifying a morning appointment.)", es: "What time is it? It's three o'clock. (Preguntando y diciendo la hora.)\nIt's half past seven. (Son las 7:30.)\nThe meeting is at ten in the morning. (Especificando una cita por la mañana.)" },
          mistakes: { ko: "❌ It's three hour.\n✅ It's three o'clock. ('hour'가 아니라 'o'clock'이에요!)\n\n❌ The meeting is on ten.\n✅ The meeting is at ten. (시간 앞에는 'at'을 써요, 'on'이 아니에요!)", en: "❌ It's three hour.\n✅ It's three o'clock. (Use 'o'clock', not 'hour'!)\n\n❌ The meeting is on ten.\n✅ The meeting is at ten. (Use 'at' for times, not 'on'!)", es: "❌ It's three hour.\n✅ It's three o'clock. (Usa 'o'clock', no 'hour'.)\n\n❌ The meeting is on ten.\n✅ The meeting is at ten. (Usa 'at' para horas, no 'on'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 전치사가 핵심 단서야! 시간='at', 요일='on', 월='in'. at three, on Monday, in January. 이 세 가지만 기억해!", en: "Detective Rudy's tip: Prepositions are the key clue! Time = 'at', days = 'on', months = 'in'. At three, on Monday, in January. Crack this code and you'll never mix them up!", es: "Consejo del detective Rudy: Las preposiciones son la pista clave. Hora = 'at', días = 'on', meses = 'in'. At three, on Monday, in January. ¡Descifra este código!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "What ___ is it?", answer: "time", options: ["time", "day", "hour"], fullSentence: "What time is it?", fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
          { type: "select", promptWithBlank: "It's three ___.", answer: "o'clock", options: ["o'clock", "hour", "time"], fullSentence: "It's three o'clock.", fullSentenceMeaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." } },
          { type: "select", promptWithBlank: "The meeting is ___ ten.", answer: "at", options: ["at", "on", "in"], fullSentence: "The meeting is at ten.", fullSentenceMeaning: { ko: "회의는 열 시예요.", en: "The meeting is at ten.", es: "La reunión es a las diez." } },
          { type: "input", promptWithBlank: "It's ___ past seven.", answer: "half", fullSentence: "It's half past seven.", fullSentenceMeaning: { ko: "일곱 시 반이에요.", en: "It's half past seven.", es: "Son las siete y media." } },
          { type: "input", promptWithBlank: "I wake up at seven every ___.", answer: "day", fullSentence: "I wake up at seven every day.", fullSentenceMeaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at seven every day.", es: "Me despierto a las siete todos los días." } },
          { type: "listening", audioText: "The meeting is at ten in the morning.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["The meeting is at ten in the morning.", "What time is it?", "I wake up at seven.", "It's half past seven."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Thank you.", es: "Gracias.", ko: "감사합니다." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¿Qué hora es?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
        { text: "Son las tres.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." } },
        { text: "Son las siete y media.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "일곱 시 반이에요.", en: "It's half past seven.", es: "Son las siete y media." } },
        { text: "La reunión es a las diez de la mañana.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "회의는 아침 열 시예요.", en: "The meeting is at ten in the morning.", es: "La reunión es a las diez de la mañana." }, recallRound: true },
        { text: "Me despierto a las siete todos los días.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at seven every day.", es: "Me despierto a las siete todos los días." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: ¿Qué hora es? → Son las ___. (2시 이상) / Es la una. (1시만). 30분: 'y media'. 약속 시간: 'a las ___'. 오전: 'de la mañana', 오후: 'de la tarde'.", en: "Pattern: ¿Qué hora es? → Son las ___. (2+) / Es la una. (1 o'clock only). Half: 'y media'. Appointment: 'a las ___'. AM: 'de la mañana'. PM: 'de la tarde'.", es: "Patrón: ¿Qué hora es? → Son las ___. (2+) / Es la una. (solo 1). Media: 'y media'. Cita: 'a las ___'. AM: 'de la mañana'. PM: 'de la tarde'." },
          examples: { ko: "¿Qué hora es? Son las tres. (몇 시? 세 시예요.)\nSon las siete y media. (일곱 시 반이에요.)\nLa reunión es a las diez de la mañana. (회의는 오전 10시예요.)", en: "¿Qué hora es? Son las tres. (What time? It's three o'clock.)\nSon las siete y media. (It's 7:30.)\nLa reunión es a las diez de la mañana. (The meeting is at 10 AM.)", es: "¿Qué hora es? Son las tres. (Preguntando y diciendo la hora.)\nSon las siete y media. (Son las 7:30.)\nLa reunión es a las diez de la mañana. (Especificando una cita.)" },
          mistakes: { ko: "❌ Son la una.\n✅ Es la una. (1시만 'Es la una'! 나머지는 'Son las'!)\n\n❌ La reunión es en las tres.\n✅ La reunión es a las tres. ('en'이 아니라 'a las'를 써요!)", en: "❌ Son la una.\n✅ Es la una. (1 o'clock is special — 'Es la una', not 'Son'!)\n\n❌ La reunión es en las tres.\n✅ La reunión es a las tres. (Use 'a las', not 'en las'!)", es: "❌ Son la una.\n✅ Es la una. (La 1 es especial — 'Es la una', no 'Son'.)\n\n❌ La reunión es en las tres.\n✅ La reunión es a las tres. (Usa 'a las', no 'en las'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 1시만 특별 대우! 'Es la una' — 단수라서 Es를 써. 나머지는 전부 'Son las'야. 이 단서 하나면 시간 표현 완벽!", en: "Detective Rudy's tip: 1 o'clock gets VIP treatment! 'Es la una' — it's singular! Everything else? 'Son las dos, tres, cuatro...' One simple rule solves the whole case.", es: "Consejo del detective Rudy: ¡La 1 tiene trato VIP! 'Es la una' porque es singular. Todo lo demás: 'Son las dos, tres...' Una regla simple resuelve todo el caso." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Qué ___ es?", answer: "hora", options: ["hora", "día", "tiempo"], fullSentence: "¿Qué hora es?", fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
          { type: "select", promptWithBlank: "___ las tres.", answer: "Son", options: ["Son", "Es", "Están"], fullSentence: "Son las tres.", fullSentenceMeaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." } },
          { type: "select", promptWithBlank: "La reunión es ___ las diez.", answer: "a", options: ["a", "en", "de"], fullSentence: "La reunión es a las diez.", fullSentenceMeaning: { ko: "회의는 열 시예요.", en: "The meeting is at ten.", es: "La reunión es a las diez." } },
          { type: "input", promptWithBlank: "Son las siete y ___.", answer: "media", fullSentence: "Son las siete y media.", fullSentenceMeaning: { ko: "일곱 시 반이에요.", en: "It's half past seven.", es: "Son las siete y media." } },
          { type: "listening", audioText: "La reunión es a las diez de la mañana.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["La reunión es a las diez de la mañana.", "¿Qué hora es?", "Me despierto a las siete.", "Son las siete y media."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Thank you.", es: "Gracias.", ko: "감사합니다." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "지금 몇 시예요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
        { text: "세 시예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." } },
        { text: "일곱 시 반이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "일곱 시 반이에요.", en: "It's half past seven.", es: "Son las siete y media." } },
        { text: "회의는 아침 열 시예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "회의는 아침 열 시예요.", en: "The meeting is at ten in the morning.", es: "La reunión es a las diez de la mañana." }, recallRound: true },
        { text: "매일 일곱 시에 일어나요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at seven every day.", es: "Me despierto a las siete todos los días." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: 지금 몇 시예요? → ___시예요. / 30분: '___시 반이에요'. 시간 뒤에 '에': '세 시에'. 시간은 순수 숫자(한, 두, 세...), 분은 한자 숫자(십, 이십, 삼십...).", en: "Pattern: 지금 몇 시예요? → ___시예요. Half: '___시 반이에요'. Add '에' after time: '세 시에'. Hours use native numbers (한, 두, 세...), minutes use Sino-Korean (십, 이십...).", es: "Patrón: 지금 몇 시예요? → ___시예요. Media: '___시 반이에요'. Agrega '에' después. Horas: números nativos (한, 두, 세...), minutos: sino-coreano (십, 이십...)." },
          examples: { ko: "지금 몇 시예요? 세 시예요. (시간 묻고 답하기)\n일곱 시 반이에요. (7시 30분이에요.)\n회의는 아침 열 시예요. (오전 10시에 회의)", en: "지금 몇 시예요? 세 시예요. (What time? It's 3 o'clock.)\n일곱 시 반이에요. (It's 7:30.)\n회의는 아침 열 시예요. (The meeting is at 10 AM.)", es: "지금 몇 시예요? 세 시예요. (¿Qué hora? Son las 3.)\n일곱 시 반이에요. (Son las 7:30.)\n회의는 아침 열 시예요. (La reunión es a las 10 AM.)" },
          mistakes: { ko: "❌ 삼 시예요.\n✅ 세 시예요. (시간은 순수 숫자! '삼'이 아니라 '세'!)\n\n❌ 세 시 삼십 분에요.\n✅ 세 시 반이에요. (30분은 보통 '반'이라고 해요!)", en: "❌ 삼 시예요.\n✅ 세 시예요. (Hours use native Korean numbers! '세' not '삼'!)\n\n❌ 세 시 삼십 분에요.\n✅ 세 시 반이에요. (For :30, just say '반' — much more natural!)", es: "❌ 삼 시예요.\n✅ 세 시예요. (Las horas usan números nativos coreanos, '세' no '삼'.)\n\n❌ 세 시 삼십 분에요.\n✅ 세 시 반이에요. (Para :30, di '반' — ¡mucho más natural!)" },
          rudyTip: { ko: "탐정 루디의 팁: 시간에서도 두 가지 숫자가 나와! 시(hour)=순수 숫자, 분(minute)=한자 숫자. 근데 30분은 그냥 '반'이면 끝! 간단하지?", en: "Detective Rudy's tip: Korean time mixes both number systems! Hours = native (한, 두, 세), minutes = Sino-Korean. But for :30, just say '반' (half). Easy shortcut!", es: "Consejo del detective Rudy: La hora coreana mezcla ambos sistemas de números. Horas = nativo (한, 두, 세), minutos = sino-coreano. Pero para :30, solo di '반'. ¡Atajo fácil!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "지금 몇 ___예요?", answer: "시", options: ["시", "일", "번"], fullSentence: "지금 몇 시예요?", fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
          { type: "select", promptWithBlank: "___ 시예요.", answer: "세", options: ["세", "삼", "셋"], fullSentence: "세 시예요.", fullSentenceMeaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." } },
          { type: "select", promptWithBlank: "일곱 시 ___이에요.", answer: "반", options: ["반", "절", "중"], fullSentence: "일곱 시 반이에요.", fullSentenceMeaning: { ko: "일곱 시 반이에요.", en: "It's half past seven.", es: "Son las siete y media." } },
          { type: "input", promptWithBlank: "___일 일곱 시에 일어나요.", answer: "매", fullSentence: "매일 일곱 시에 일어나요.", fullSentenceMeaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at seven every day.", es: "Me despierto a las siete todos los días." } },
          { type: "listening", audioText: "회의는 아침 열 시예요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["회의는 아침 열 시예요.", "지금 몇 시예요?", "매일 일곱 시에 일어나요.", "일곱 시 반이에요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Thank you.", es: "Gracias.", ko: "감사합니다." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Sekarang jam berapa?", speechLang: "id-ID", meaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
        { text: "Sekarang jam tiga.", speechLang: "id-ID", meaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." } },
        { text: "Sekarang jam setengah delapan.", speechLang: "id-ID", meaning: { ko: "일곱 시 반이에요.", en: "It's half past seven.", es: "Son las siete y media." } },
        { text: "Rapatnya jam sepuluh pagi.", speechLang: "id-ID", meaning: { ko: "회의는 아침 열 시예요.", en: "The meeting is at ten in the morning.", es: "La reunión es a las diez de la mañana." }, recallRound: true },
        { text: "Saya bangun jam tujuh setiap hari.", speechLang: "id-ID", meaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at seven every day.", es: "Me despierto a las siete todos los días." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Sekarang jam berapa? → Sekarang jam ___. / 'jam'은 '시'를 뜻해요. 30분: 'jam setengah ___'인데 주의! 다음 시간을 써요 (jam setengah delapan = 7시 반). 시간 표현에 따로 전치사가 필요 없어요.", en: "Pattern: Sekarang jam berapa? → Sekarang jam ___. 'jam' means 'o'clock'. Half hour is tricky: 'jam setengah ___' uses the NEXT hour (jam setengah delapan = half to eight = 7:30!). No extra preposition needed for times.", es: "Patrón: Sekarang jam berapa? → Sekarang jam ___. 'jam' significa 'hora'. La media hora es complicada: 'jam setengah ___' usa la hora SIGUIENTE (jam setengah delapan = 7:30). No se necesita preposición extra para las horas." },
          examples: { ko: "Sekarang jam berapa? Sekarang jam tiga. (몇 시? 세 시예요.)\nSekarang jam setengah delapan. (7시 반이에요.)\nRapatnya jam sepuluh pagi. (회의는 오전 10시예요.)", en: "Sekarang jam berapa? Sekarang jam tiga. (Asking and telling the time.)\nSekarang jam setengah delapan. (Saying it's 7:30.)\nRapatnya jam sepuluh pagi. (Specifying a morning appointment.)", es: "Sekarang jam berapa? Sekarang jam tiga. (Preguntando y diciendo la hora.)\nSekarang jam setengah delapan. (Son las 7:30.)\nRapatnya jam sepuluh pagi. (Especificando una cita por la mañana.)" },
          mistakes: { ko: "❌ jam setengah tujuh (= 6시 반!)\n✅ jam setengah delapan (= 7시 반! '반'은 다음 시간 기준이에요)\n\n❌ Sekarang adalah jam tiga.\n✅ Sekarang jam tiga. (시간 말할 때 'adalah'는 필요 없어요!)", en: "❌ jam setengah tujuh (= 6:30, not 7:30!)\n✅ jam setengah delapan (= 7:30! 'setengah' counts toward the NEXT hour)\n\n❌ Sekarang adalah jam tiga.\n✅ Sekarang jam tiga. (No 'adalah' needed when telling time!)", es: "❌ jam setengah tujuh (= 6:30, ¡no 7:30!)\n✅ jam setengah delapan (= 7:30! 'setengah' cuenta hacia la hora SIGUIENTE)\n\n❌ Sekarang adalah jam tiga.\n✅ Sekarang jam tiga. (¡No se necesita 'adalah' para la hora!)" },
          rudyTip: { ko: "탐정 루디의 팁: 인도네시아어 '반(setengah)'은 함정이야! 'setengah delapan'은 8시 반이 아니라 7시 반! '8시로 가는 절반'이라는 뜻이거든. 이 단서 꼭 기억해~", en: "Detective Rudy's tip: Indonesian 'setengah' (half) is a trap! 'setengah delapan' isn't 8:30 — it's 7:30! It means 'halfway TO eight'. Crack this clue and you'll never be late!", es: "Consejo del detective Rudy: ¡El 'setengah' (medio) indonesio es una trampa! 'setengah delapan' no es 8:30 — ¡es 7:30! Significa 'a medio camino HACIA las ocho'. ¡Descifra esta pista y nunca llegarás tarde!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Sekarang jam ___?", answer: "berapa", options: ["berapa", "apa", "mana"], fullSentence: "Sekarang jam berapa?", fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
          { type: "select", promptWithBlank: "Sekarang ___ tiga.", answer: "jam", options: ["jam", "hari", "tahun"], fullSentence: "Sekarang jam tiga.", fullSentenceMeaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." } },
          { type: "select", promptWithBlank: "Rapatnya jam sepuluh ___.", answer: "pagi", options: ["pagi", "malam", "tahun"], fullSentence: "Rapatnya jam sepuluh pagi.", fullSentenceMeaning: { ko: "회의는 열 시예요.", en: "The meeting is at ten.", es: "La reunión es a las diez." } },
          { type: "input", promptWithBlank: "Sekarang jam ___ delapan.", answer: "setengah", fullSentence: "Sekarang jam setengah delapan.", fullSentenceMeaning: { ko: "일곱 시 반이에요.", en: "It's half past seven.", es: "Son las siete y media." } },
          { type: "input", promptWithBlank: "Saya bangun jam tujuh setiap ___.", answer: "hari", fullSentence: "Saya bangun jam tujuh setiap hari.", fullSentenceMeaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at seven every day.", es: "Me despierto a las siete todos los días." } },
          { type: "listening", audioText: "Rapatnya jam sepuluh pagi.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Rapatnya jam sepuluh pagi.", "Sekarang jam berapa?", "Saya bangun jam tujuh.", "Sekarang jam setengah delapan."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Thank you.", es: "Gracias.", ko: "감사합니다." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "السَّاعَة كَام؟ (es-saa3a kaam?)", speechLang: "ar-EG", meaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
        { text: "السَّاعَة تَلَاتَة. (es-saa3a talaata.)", speechLang: "ar-EG", meaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." } },
        { text: "السَّاعَة سَبْعَة وْنُص. (es-saa3a sab3a we-noṣ.)", speechLang: "ar-EG", meaning: { ko: "일곱 시 반이에요.", en: "It's half past seven.", es: "Son las siete y media." } },
        { text: "الِاجْتِمَاع السَّاعَة عَشَرَة الصُّبْح. (el-egtemaa3 es-saa3a 3ashara eṣ-ṣobḥ.)", speechLang: "ar-EG", meaning: { ko: "회의는 아침 열 시예요.", en: "The meeting is at ten in the morning.", es: "La reunión es a las diez de la mañana." }, recallRound: true },
        { text: "أَنَا بَصْحَى السَّاعَة سَبْعَة كُلّ يَوْم. (ana baṣ-ḥa es-saa3a sab3a koll yoom.)", speechLang: "ar-EG", meaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at seven every day.", es: "Me despierto a las siete todos los días." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: السَّاعَة كَام؟ (es-saa3a kaam?) → السَّاعَة ___. / 'es-saa3a'는 '시'. 30분: 'we-noṣ'(와 누스, 반). 약속 시간도 그냥 'es-saa3a ___'. 오전: 'eṣ-ṣobḥ', 오후: 'baad eḍ-ḍohr'.", en: "Pattern: es-saa3a kaam? → es-saa3a ___. 'es-saa3a' means 'o'clock'. Half hour: 'we-noṣ' (and a half). Appointments also just use 'es-saa3a ___'. AM: 'eṣ-ṣobḥ', PM: 'baad eḍ-ḍohr'.", es: "Patrón: es-saa3a kaam? → es-saa3a ___. 'es-saa3a' significa 'hora'. Media hora: 'we-noṣ' (y media). Las citas también usan 'es-saa3a ___'. AM: 'eṣ-ṣobḥ', PM: 'baad eḍ-ḍohr'." },
          examples: { ko: "السَّاعَة كَام؟ السَّاعَة تَلَاتَة. (몇 시? 세 시예요.)\nالسَّاعَة سَبْعَة وْنُص. (7시 반이에요.)\nالِاجْتِمَاع السَّاعَة عَشَرَة الصُّبْح. (회의는 오전 10시예요.)", en: "es-saa3a kaam? es-saa3a talaata. (Asking and telling the time.)\nes-saa3a sab3a we-noṣ. (Saying it's 7:30.)\nel-egtemaa3 es-saa3a 3ashara eṣ-ṣobḥ. (Specifying a morning appointment.)", es: "es-saa3a kaam? es-saa3a talaata. (Preguntando y diciendo la hora.)\nes-saa3a sab3a we-noṣ. (Son las 7:30.)\nel-egtemaa3 es-saa3a 3ashara eṣ-ṣobḥ. (Especificando una cita por la mañana.)" },
          mistakes: { ko: "❌ السَّاعَة سَبْعَة نُص. (es-saa3a sab3a noṣ.)\n✅ السَّاعَة سَبْعَة وْنُص. (반을 말할 땐 'we-'(와)를 꼭 붙여요!)\n\n❌ الِاجْتِمَاع عَلَى عَشَرَة. (el-egtemaa3 3ala 3ashara.)\n✅ الِاجْتِمَاع السَّاعَة عَشَرَة. (시간엔 그냥 'es-saa3a'를 써요, 전치사 필요 없어요!)", en: "❌ es-saa3a sab3a noṣ.\n✅ es-saa3a sab3a we-noṣ. (For half, always add 'we-' (and)!)\n\n❌ el-egtemaa3 3ala 3ashara.\n✅ el-egtemaa3 es-saa3a 3ashara. (Use 'es-saa3a' for time — no extra preposition needed!)", es: "❌ es-saa3a sab3a noṣ.\n✅ es-saa3a sab3a we-noṣ. (Para la media, ¡siempre añade 'we-' (y)!)\n\n❌ el-egtemaa3 3ala 3ashara.\n✅ el-egtemaa3 es-saa3a 3ashara. (Usa 'es-saa3a' para la hora — ¡sin preposición extra!)" },
          rudyTip: { ko: "탐정 루디의 팁: 이집트에서 시간은 'es-saa3a + 숫자'면 끝! 30분은 'we-noṣ'(와 누스)만 붙여. 15분은 'we-rob3'(와 룹), 45분은 'illa rob3'(일라 룹). 이 단서들이면 시계 완전 정복~", en: "Detective Rudy's tip: In Egypt, time is just 'es-saa3a + number'! For :30 add 'we-noṣ' (and a half). :15 is 'we-rob3', :45 is 'illa rob3' (minus a quarter). Crack these clues and you'll never be late!", es: "Consejo del detective Rudy: ¡En Egipto, la hora es solo 'es-saa3a + número'! Para :30 añade 'we-noṣ' (y media). :15 es 'we-rob3', :45 es 'illa rob3' (menos cuarto). ¡Descifra estas pistas!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "السَّاعَة ___؟", answer: "كَام", options: ["كَام", "إِيه", "فِين"], fullSentence: "السَّاعَة كَام؟", fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
          { type: "select", promptWithBlank: "___ تَلَاتَة.", answer: "السَّاعَة", options: ["السَّاعَة", "اليَوْم", "السَّنَة"], fullSentence: "السَّاعَة تَلَاتَة.", fullSentenceMeaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." } },
          { type: "select", promptWithBlank: "الِاجْتِمَاع السَّاعَة عَشَرَة ___.", answer: "الصُّبْح", options: ["الصُّبْح", "بِاللِّيل", "السَّنَة"], fullSentence: "الِاجْتِمَاع السَّاعَة عَشَرَة الصُّبْح.", fullSentenceMeaning: { ko: "회의는 열 시예요.", en: "The meeting is at ten.", es: "La reunión es a las diez." } },
          { type: "input", promptWithBlank: "السَّاعَة سَبْعَة وْ ___.", answer: "نُص", fullSentence: "السَّاعَة سَبْعَة وْنُص.", fullSentenceMeaning: { ko: "일곱 시 반이에요.", en: "It's half past seven.", es: "Son las siete y media." } },
          { type: "input", promptWithBlank: "أَنَا بَصْحَى السَّاعَة سَبْعَة كُلّ ___.", answer: "يَوْم", fullSentence: "أَنَا بَصْحَى السَّاعَة سَبْعَة كُلّ يَوْم.", fullSentenceMeaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at seven every day.", es: "Me despierto a las siete todos los días." } },
          { type: "listening", audioText: "الِاجْتِمَاع السَّاعَة عَشَرَة الصُّبْح.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["الِاجْتِمَاع السَّاعَة عَشَرَة الصُّبْح.", "السَّاعَة كَام؟", "أَنَا بَصْحَى السَّاعَة سَبْعَة.", "السَّاعَة سَبْعَة وْنُص."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Thank you.", es: "Gracias.", ko: "감사합니다." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 10: Talking About Weather ─────────────────────────────
  day_10: {
    english: {
      step1Sentences: [
        { text: "How's the weather today?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
        { text: "It's sunny and warm.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "맑고 따뜻해요.", en: "It's sunny and warm.", es: "Está soleado y cálido." } },
        { text: "It's raining today.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "오늘 비가 와요.", en: "It's raining today.", es: "Hoy está lloviendo." } },
        { text: "It's cold outside. Bring a jacket!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "밖이 추워요. 재킷 가져가세요!", en: "It's cold outside. Bring a jacket!", es: "Hace frío afuera. ¡Trae una chaqueta!" }, recallRound: true },
        { text: "I like hot weather.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "더운 날씨를 좋아해요.", en: "I like hot weather.", es: "Me gusta el clima caliente." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: How's the weather? → It's sunny/cloudy/cold/hot/warm. / 진행형 날씨: 'It's raining.' 'It's snowing.' 상태 날씨: 'It's + 형용사'.", en: "Pattern: How's the weather? → It's sunny/cloudy/cold/hot/warm. Ongoing weather: 'It's raining/snowing.' State weather: 'It's + adjective'.", es: "Patrón: How's the weather? → It's sunny/cloudy/cold/hot/warm. Clima en curso: 'It's raining/snowing.' Estado: 'It's + adjetivo'." },
          examples: { ko: "How's the weather today? It's sunny and warm. (오늘 날씨 어때? 맑고 따뜻해.)\nIt's raining today. (오늘 비가 와요.)\nIt's cold outside. Bring a jacket! (밖이 추워요. 재킷 가져가!)", en: "How's the weather today? It's sunny and warm. (Asking about and describing weather.)\nIt's raining today. (Describing ongoing weather.)\nIt's cold outside. Bring a jacket! (Giving weather-based advice.)", es: "How's the weather today? It's sunny and warm. (Preguntando y describiendo el clima.)\nIt's raining today. (Describiendo clima en curso.)\nIt's cold outside. Bring a jacket! (Dando consejo basado en el clima.)" },
          mistakes: { ko: "❌ It's rain today.\n✅ It's raining today. (비 올 때는 진행형 -ing를 써요!)\n\n❌ Today is sunny.\n✅ It's sunny today. (날씨는 'It's'로 시작해요, 'Today is'가 아니에요!)", en: "❌ It's rain today.\n✅ It's raining today. (Use '-ing' for active weather — it's happening now!)\n\n❌ Today is sunny.\n✅ It's sunny today. (Weather uses 'It's', not 'Today is'!)", es: "❌ It's rain today.\n✅ It's raining today. (Usa '-ing' para clima activo — ¡está pasando ahora!)\n\n❌ Today is sunny.\n✅ It's sunny today. (El clima usa 'It's', no 'Today is'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 날씨는 항상 'It's'로 시작해! It's sunny, It's cold, It's raining... 'It'이 날씨의 주인공이야~", en: "Detective Rudy's tip: Weather always starts with 'It's'! It's sunny, It's cold, It's raining... 'It' is the star of every weather report. Elementary, my friend!", es: "Consejo del detective Rudy: El clima siempre empieza con 'It's'! It's sunny, It's cold, It's raining... 'It' es la estrella de cada reporte del clima." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "How's the ___ today?", answer: "weather", options: ["weather", "day", "time"], fullSentence: "How's the weather today?", fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
          { type: "select", promptWithBlank: "It's sunny and ___.", answer: "warm", options: ["warm", "warming", "warmer"], fullSentence: "It's sunny and warm.", fullSentenceMeaning: { ko: "맑고 따뜻해요.", en: "It's sunny and warm.", es: "Está soleado y cálido." } },
          { type: "select", promptWithBlank: "It's ___ today.", answer: "raining", options: ["raining", "rain", "rained"], fullSentence: "It's raining today.", fullSentenceMeaning: { ko: "오늘 비가 와요.", en: "It's raining today.", es: "Hoy está lloviendo." } },
          { type: "input", promptWithBlank: "It's ___ outside. Bring a jacket!", answer: "cold", fullSentence: "It's cold outside. Bring a jacket!", fullSentenceMeaning: { ko: "밖이 추워요. 재킷 가져가세요!", en: "It's cold outside. Bring a jacket!", es: "Hace frío afuera. ¡Trae una chaqueta!" } },
          { type: "listening", audioText: "It's raining today.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["It's raining today.", "It's sunny and warm.", "I like hot weather.", "It's cold outside."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the bathroom?", es: "¿Dónde está el baño?", ko: "화장실이 어디에요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme.", ko: "도와주세요! 제발 도와주세요." }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¿Cómo está el clima hoy?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
        { text: "Está soleado y cálido.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "맑고 따뜻해요.", en: "It's sunny and warm.", es: "Está soleado y cálido." } },
        { text: "Hoy está lloviendo.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "오늘 비가 와요.", en: "It's raining today.", es: "Hoy está lloviendo." } },
        { text: "Hace frío afuera. ¡Trae una chaqueta!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "밖이 추워요. 재킷 가져가세요!", en: "It's cold outside. Bring a jacket!", es: "Hace frío afuera. ¡Trae una chaqueta!" }, recallRound: true },
        { text: "Me gusta el clima caliente.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "더운 날씨를 좋아해요.", en: "I like hot weather.", es: "Me gusta el clima caliente." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: ¿Cómo está el clima? → Hace calor/frío. / Está soleado/nublado. / Está lloviendo. 온도는 'Hace', 상태는 'Está'를 써요.", en: "Pattern: ¿Cómo está el clima? → Hace calor/frío (temperature). Está soleado/nublado (conditions). Está lloviendo (ongoing). Temperature = 'Hace'. Conditions = 'Está'.", es: "Patrón: ¿Cómo está el clima? → Hace calor/frío (temperatura). Está soleado/nublado (condiciones). Está lloviendo (en curso). Temperatura = 'Hace'. Condiciones = 'Está'." },
          examples: { ko: "¿Cómo está el clima hoy? Está soleado y cálido. (오늘 날씨? 맑고 따뜻해.)\nHoy está lloviendo. (오늘 비가 와요.)\nHace frío afuera. ¡Trae una chaqueta! (밖이 추워. 재킷 가져가!)", en: "¿Cómo está el clima hoy? Está soleado y cálido. (How's the weather? Sunny and warm.)\nHoy está lloviendo. (It's raining today.)\nHace frío afuera. ¡Trae una chaqueta! (It's cold outside. Bring a jacket!)", es: "¿Cómo está el clima hoy? Está soleado y cálido. (Preguntando y describiendo.)\nHoy está lloviendo. (Describiendo clima en curso.)\nHace frío afuera. ¡Trae una chaqueta! (Dando consejo.)" },
          mistakes: { ko: "❌ Es frío hoy.\n✅ Hace frío hoy. (온도는 'ser'가 아니라 'hacer'를 써요!)\n\n❌ Hace lloviendo.\n✅ Está lloviendo. (비는 'Hace'가 아니라 'Está' + 동명사!)", en: "❌ Es frío hoy.\n✅ Hace frío hoy. (Temperature uses 'hacer', not 'ser'!)\n\n❌ Hace lloviendo.\n✅ Está lloviendo. (Rain uses 'Está' + gerund, not 'Hace'!)", es: "❌ Es frío hoy.\n✅ Hace frío hoy. (La temperatura usa 'hacer', no 'ser'.)\n\n❌ Hace lloviendo.\n✅ Está lloviendo. (La lluvia usa 'Está' + gerundio, no 'Hace'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 스페인어 날씨는 두 가지 동사야! 온도(덥다/춥다)는 'Hace', 상태(비/맑다)는 'Está'. 이 단서 두 개면 날씨 표현 완벽!", en: "Detective Rudy's tip: Spanish weather uses two verbs — 'Hace' for temperature (hot/cold) and 'Está' for conditions (raining/sunny). Two clues, one solved case!", es: "Consejo del detective Rudy: El clima en español usa dos verbos — 'Hace' para temperatura (calor/frío) y 'Está' para condiciones (lloviendo/soleado). Dos pistas, un caso resuelto." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Cómo está el ___ hoy?", answer: "clima", options: ["clima", "día", "tiempo"], fullSentence: "¿Cómo está el clima hoy?", fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
          { type: "select", promptWithBlank: "Hoy está ___.", answer: "lloviendo", options: ["lloviendo", "lluvia", "llover"], fullSentence: "Hoy está lloviendo.", fullSentenceMeaning: { ko: "오늘 비가 와요.", en: "It's raining today.", es: "Hoy está lloviendo." } },
          { type: "select", promptWithBlank: "Hace ___ afuera.", answer: "frío", options: ["frío", "fría", "friar"], fullSentence: "Hace frío afuera.", fullSentenceMeaning: { ko: "밖이 추워요.", en: "It's cold outside.", es: "Hace frío afuera." } },
          { type: "input", promptWithBlank: "Me ___ el clima caliente.", answer: "gusta", fullSentence: "Me gusta el clima caliente.", fullSentenceMeaning: { ko: "더운 날씨를 좋아해요.", en: "I like hot weather.", es: "Me gusta el clima caliente." } },
          { type: "listening", audioText: "Hoy está lloviendo.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Hoy está lloviendo.", "Está soleado y cálido.", "Me gusta el clima caliente.", "Hace frío afuera."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the bathroom?", es: "¿Dónde está el baño?", ko: "화장실이 어디에요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme.", ko: "도와주세요! 제발 도와주세요." }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "오늘 날씨 어때요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
        { text: "맑고 따뜻해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "맑고 따뜻해요.", en: "It's sunny and warm.", es: "Está soleado y cálido." } },
        { text: "오늘 비가 와요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "오늘 비가 와요.", en: "It's raining today.", es: "Hoy está lloviendo." } },
        { text: "밖이 추워요. 재킷 가져가세요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "밖이 추워요. 재킷 가져가세요!", en: "It's cold outside. Bring a jacket!", es: "Hace frío afuera. ¡Trae una chaqueta!" }, recallRound: true },
        { text: "더운 날씨를 좋아해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "더운 날씨를 좋아해요.", en: "I like hot weather.", es: "Me gusta el clima caliente." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: 날씨 어때요? → 맑아요 / 흐려요 / 추워요 / 더워요 / 따뜻해요. 비: '비가 와요.' 눈: '눈이 와요.' 형용사가 변형돼요: 춥다→추워요, 덥다→더워요.", en: "Pattern: 날씨 어때요? → 맑아요/흐려요/추워요/더워요/따뜻해요. Rain: '비가 와요.' Snow: '눈이 와요.' Adjectives change form: 춥다→추워요, 덥다→더워요.", es: "Patrón: 날씨 어때요? → 맑아요/흐려요/추워요/더워요/따뜻해요. Lluvia: '비가 와요.' Nieve: '눈이 와요.' Los adjetivos cambian: 춥다→추워요, 덥다→더워요." },
          examples: { ko: "오늘 날씨 어때요? 맑고 따뜻해요. (날씨 묻고 답하기)\n오늘 비가 와요. (비 오는 날씨 표현)\n밖이 추워요. 재킷 가져가세요! (추운 날씨 + 조언)", en: "오늘 날씨 어때요? 맑고 따뜻해요. (How's the weather? Sunny and warm.)\n오늘 비가 와요. (It's raining today.)\n밖이 추워요. 재킷 가져가세요! (It's cold outside. Bring a jacket!)", es: "오늘 날씨 어때요? 맑고 따뜻해요. (¿Cómo está el clima? Soleado y cálido.)\n오늘 비가 와요. (Hoy está lloviendo.)\n밖이 추워요. 재킷 가져가세요! (Hace frío afuera. ¡Trae una chaqueta!)" },
          mistakes: { ko: "❌ 비가 해요.\n✅ 비가 와요. (비와 눈은 '오다'를 써요! '하다'가 아니에요)\n\n❌ 춥다요.\n✅ 추워요. (ㅂ 불규칙! 춥다→추워요, 덥다→더워요)", en: "❌ 비가 해요.\n✅ 비가 와요. (Rain 'comes' in Korean — use 오다, not 하다!)\n\n❌ 춥다요.\n✅ 추워요. (ㅂ irregular! 춥다→추워요, 덥다→더워요 — the ㅂ disappears!)", es: "❌ 비가 해요.\n✅ 비가 와요. (La lluvia 'viene' en coreano — usa 오다, no 하다.)\n\n❌ 춥다요.\n✅ 추워요. (¡ㅂ irregular! 춥다→추워요, 덥다→더워요 — el ㅂ desaparece.)" },
          rudyTip: { ko: "탐정 루디의 팁: 한국어 날씨의 비밀은 ㅂ 불규칙이야! 춥다→추워요, 덥다→더워요. ㅂ이 사라지고 워가 나타나! 이 패턴만 알면 날씨 마스터~", en: "Detective Rudy's tip: Korean weather adjectives have a secret — the ㅂ irregular! 춥다 becomes 추워요, 덥다 becomes 더워요. The ㅂ vanishes like a clue in the night!", es: "Consejo del detective Rudy: Los adjetivos del clima coreano tienen un secreto — ¡el irregular ㅂ! 춥다 se convierte en 추워요, 덥다 en 더워요. ¡El ㅂ desaparece como una pista!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "오늘 ___ 어때요?", answer: "날씨", options: ["날씨", "요일", "시간"], fullSentence: "오늘 날씨 어때요?", fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
          { type: "select", promptWithBlank: "오늘 비가 ___.", answer: "와요", options: ["와요", "가요", "해요"], fullSentence: "오늘 비가 와요.", fullSentenceMeaning: { ko: "오늘 비가 와요.", en: "It's raining today.", es: "Hoy está lloviendo." } },
          { type: "select", promptWithBlank: "밖이 ___요.", answer: "추워", options: ["추워", "추운", "춥게"], fullSentence: "밖이 추워요.", fullSentenceMeaning: { ko: "밖이 추워요.", en: "It's cold outside.", es: "Hace frío afuera." } },
          { type: "input", promptWithBlank: "더운 날씨를 ___해요.", answer: "좋아", fullSentence: "더운 날씨를 좋아해요.", fullSentenceMeaning: { ko: "더운 날씨를 좋아해요.", en: "I like hot weather.", es: "Me gusta el clima caliente." } },
          { type: "listening", audioText: "밖이 추워요. 재킷 가져가세요!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["밖이 추워요. 재킷 가져가세요!", "오늘 비가 와요.", "맑고 따뜻해요.", "더운 날씨를 좋아해요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the bathroom?", es: "¿Dónde está el baño?", ko: "화장실이 어디에요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme.", ko: "도와주세요! 제발 도와주세요." }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Bagaimana cuaca hari ini?", speechLang: "id-ID", meaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
        { text: "Cuacanya cerah dan hangat.", speechLang: "id-ID", meaning: { ko: "맑고 따뜻해요.", en: "It's sunny and warm.", es: "Está soleado y cálido." } },
        { text: "Hari ini hujan.", speechLang: "id-ID", meaning: { ko: "오늘 비가 와요.", en: "It's raining today.", es: "Hoy está lloviendo." } },
        { text: "Di luar dingin. Bawa jaket!", speechLang: "id-ID", meaning: { ko: "밖이 추워요. 재킷 가져가세요!", en: "It's cold outside. Bring a jacket!", es: "Hace frío afuera. ¡Trae una chaqueta!" }, recallRound: true },
        { text: "Saya suka cuaca panas.", speechLang: "id-ID", meaning: { ko: "더운 날씨를 좋아해요.", en: "I like hot weather.", es: "Me gusta el clima caliente." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Bagaimana cuaca hari ini? → Cuacanya ___. / 'cuaca'는 '날씨'. 상태: cerah(맑음), berawan(흐림), hujan(비), dingin(추움), panas(더움), hangat(따뜻함). 인도네시아어는 동사 변화가 없어서 형용사를 그대로 써요!", en: "Pattern: Bagaimana cuaca hari ini? → Cuacanya ___. 'cuaca' means 'weather'. Conditions: cerah(sunny), berawan(cloudy), hujan(rain), dingin(cold), panas(hot), hangat(warm). Indonesian has no verb conjugation — just use the adjective directly!", es: "Patrón: Bagaimana cuaca hari ini? → Cuacanya ___. 'cuaca' significa 'clima'. Condiciones: cerah(soleado), berawan(nublado), hujan(lluvia), dingin(frío), panas(caliente), hangat(cálido). ¡El indonesio no conjuga verbos — solo usa el adjetivo directamente!" },
          examples: { ko: "Bagaimana cuaca hari ini? Cuacanya cerah dan hangat. (오늘 날씨 어때? 맑고 따뜻해.)\nHari ini hujan. (오늘 비가 와요.)\nDi luar dingin. Bawa jaket! (밖이 추워요. 재킷 가져가!)", en: "Bagaimana cuaca hari ini? Cuacanya cerah dan hangat. (Asking about and describing weather.)\nHari ini hujan. (Describing ongoing weather.)\nDi luar dingin. Bawa jaket! (Giving weather-based advice.)", es: "Bagaimana cuaca hari ini? Cuacanya cerah dan hangat. (Preguntando y describiendo el clima.)\nHari ini hujan. (Describiendo clima en curso.)\nDi luar dingin. Bawa jaket! (Dando consejo basado en el clima.)" },
          mistakes: { ko: "❌ Hari ini sedang hujan adalah.\n✅ Hari ini hujan. (날씨는 단순하게! 'adalah'나 추가 동사가 필요 없어요)\n\n❌ Cuacanya panasnya.\n✅ Cuacanya panas. (형용사를 그대로 써요, 변형하지 마세요!)", en: "❌ Hari ini sedang hujan adalah.\n✅ Hari ini hujan. (Keep weather simple — no 'adalah' or extra verbs needed!)\n\n❌ Cuacanya panasnya.\n✅ Cuacanya panas. (Use the adjective as-is — don't add endings!)", es: "❌ Hari ini sedang hujan adalah.\n✅ Hari ini hujan. (¡Mantén el clima simple — sin 'adalah' ni verbos extra!)\n\n❌ Cuacanya panasnya.\n✅ Cuacanya panas. (Usa el adjetivo tal cual — ¡no agregues terminaciones!)" },
          rudyTip: { ko: "탐정 루디의 팁: 인도네시아어 날씨는 세상에서 제일 쉬워! 'hujan'(비) 한 단어면 '비가 온다'가 끝. 동사 변화도, be동사도 없어. 형용사만 툭 던지면 돼~", en: "Detective Rudy's tip: Indonesian weather might be the easiest in the world! Just 'hujan' (rain) means 'it's raining' — done. No verb changes, no 'to be'. Just drop the adjective and you're solved!", es: "Consejo del detective Rudy: ¡El clima indonesio quizás sea el más fácil del mundo! Solo 'hujan' (lluvia) significa 'está lloviendo' — listo. Sin cambios de verbo, sin 'ser'. ¡Solo suelta el adjetivo y caso resuelto!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Bagaimana ___ hari ini?", answer: "cuaca", options: ["cuaca", "hari", "jam"], fullSentence: "Bagaimana cuaca hari ini?", fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
          { type: "select", promptWithBlank: "Cuacanya cerah dan ___.", answer: "hangat", options: ["hangat", "hari", "pagi"], fullSentence: "Cuacanya cerah dan hangat.", fullSentenceMeaning: { ko: "맑고 따뜻해요.", en: "It's sunny and warm.", es: "Está soleado y cálido." } },
          { type: "select", promptWithBlank: "Hari ini ___.", answer: "hujan", options: ["hujan", "cuaca", "jam"], fullSentence: "Hari ini hujan.", fullSentenceMeaning: { ko: "오늘 비가 와요.", en: "It's raining today.", es: "Hoy está lloviendo." } },
          { type: "input", promptWithBlank: "Di luar ___. Bawa jaket!", answer: "dingin", fullSentence: "Di luar dingin. Bawa jaket!", fullSentenceMeaning: { ko: "밖이 추워요. 재킷 가져가세요!", en: "It's cold outside. Bring a jacket!", es: "Hace frío afuera. ¡Trae una chaqueta!" } },
          { type: "listening", audioText: "Hari ini hujan.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Hari ini hujan.", "Cuacanya cerah dan hangat.", "Saya suka cuaca panas.", "Di luar dingin."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the bathroom?", es: "¿Dónde está el baño?", ko: "화장실이 어디에요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme.", ko: "도와주세요! 제발 도와주세요." }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "الْجَوّ عَامِل إِيه النَّهَارْدَه؟ (el-gaww 3aamel eeh en-naharda?)", speechLang: "ar-EG", meaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
        { text: "الدُّنْيَا صَحْو وْدَافِيَة. (ed-donya ṣaḥw we-dafya.)", speechLang: "ar-EG", meaning: { ko: "맑고 따뜻해요.", en: "It's sunny and warm.", es: "Está soleado y cálido." } },
        { text: "النَّهَارْدَه بِتْمَطَّر. (en-naharda betmaṭṭar.)", speechLang: "ar-EG", meaning: { ko: "오늘 비가 와요.", en: "It's raining today.", es: "Hoy está lloviendo." } },
        { text: "الدُّنْيَا بَرْد بَرَّه. خُد جَاكِتَّة! (ed-donya bard barra. khod jaketta!)", speechLang: "ar-EG", meaning: { ko: "밖이 추워요. 재킷 가져가세요!", en: "It's cold outside. Bring a jacket!", es: "Hace frío afuera. ¡Trae una chaqueta!" }, recallRound: true },
        { text: "أَنَا بَحِبّ الْجَوّ الْحَرّ. (ana baḥebb el-gaww el-ḥarr.)", speechLang: "ar-EG", meaning: { ko: "더운 날씨를 좋아해요.", en: "I like hot weather.", es: "Me gusta el clima caliente." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: الْجَوّ عَامِل إِيه؟ (el-gaww 3aamel eeh?) → الدُّنْيَا ___. / 'ed-donya'(세상/날씨)로 시작해요. 상태: ṣaḥw(맑음), meghayyem(흐림), bard(추움), ḥarr(더움), dafya(따뜻함). 비: 'betmaṭṭar'(비 온다).", en: "Pattern: el-gaww 3aamel eeh? → ed-donya ___. Egyptians start with 'ed-donya' (the world/weather). Conditions: ṣaḥw(sunny), meghayyem(cloudy), bard(cold), ḥarr(hot), dafya(warm). Rain: 'betmaṭṭar' (it's raining).", es: "Patrón: el-gaww 3aamel eeh? → ed-donya ___. Los egipcios empiezan con 'ed-donya' (el mundo/clima). Condiciones: ṣaḥw(soleado), meghayyem(nublado), bard(frío), ḥarr(caliente), dafya(cálido). Lluvia: 'betmaṭṭar'." },
          examples: { ko: "الْجَوّ عَامِل إِيه النَّهَارْدَه؟ الدُّنْيَا صَحْو وْدَافِيَة. (오늘 날씨 어때? 맑고 따뜻해.)\nالنَّهَارْدَه بِتْمَطَّر. (오늘 비가 와요.)\nالدُّنْيَا بَرْد بَرَّه. خُد جَاكِتَّة! (밖이 추워요. 재킷 가져가!)", en: "el-gaww 3aamel eeh en-naharda? ed-donya ṣaḥw we-dafya. (Asking about and describing weather.)\nen-naharda betmaṭṭar. (Describing ongoing weather.)\ned-donya bard barra. khod jaketta! (Giving weather-based advice.)", es: "el-gaww 3aamel eeh en-naharda? ed-donya ṣaḥw we-dafya. (Preguntando y describiendo el clima.)\nen-naharda betmaṭṭar. (Describiendo clima en curso.)\ned-donya bard barra. khod jaketta! (Dando consejo basado en el clima.)" },
          mistakes: { ko: "❌ الدُّنْيَا هِيَّ بَرْد. (ed-donya heyya bard.)\n✅ الدُّنْيَا بَرْد. (날씨는 단순하게! be동사(heyya) 필요 없어요)\n\n❌ النَّهَارْدَه مَطَر. (en-naharda maṭar.)\n✅ النَّهَارْدَه بِتْمَطَّر. ('비가 온다'는 동사 'betmaṭṭar'를 써요!)", en: "❌ ed-donya heyya bard.\n✅ ed-donya bard. (Keep weather simple — no 'to be' (heyya) needed!)\n\n❌ en-naharda maṭar. (= today rain, noun)\n✅ en-naharda betmaṭṭar. (Use the verb 'betmaṭṭar' for 'it's raining'!)", es: "❌ ed-donya heyya bard.\n✅ ed-donya bard. (¡Mantén el clima simple — sin 'ser' (heyya)!)\n\n❌ en-naharda maṭar. (= hoy lluvia, sustantivo)\n✅ en-naharda betmaṭṭar. (Usa el verbo 'betmaṭṭar' para 'está lloviendo'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 이집트 날씨의 단서는 'ed-donya'(الدُّنْيَا)야! '세상이 추워, 세상이 더워'처럼 날씨를 말해. ed-donya bard, ed-donya ḥarr... 형용사만 툭 던지면 끝~", en: "Detective Rudy's tip: The clue to Egyptian weather is 'ed-donya' (the world)! Egyptians say 'the world is cold/hot.' ed-donya bard, ed-donya ḥarr... just drop the adjective and case solved!", es: "Consejo del detective Rudy: ¡La pista del clima egipcio es 'ed-donya' (el mundo)! Los egipcios dicen 'el mundo está frío/caliente.' ed-donya bard, ed-donya ḥarr... ¡solo suelta el adjetivo!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "الْجَوّ عَامِل ___ النَّهَارْدَه؟", answer: "إِيه", options: ["إِيه", "فِين", "كَام"], fullSentence: "الْجَوّ عَامِل إِيه النَّهَارْدَه؟", fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
          { type: "select", promptWithBlank: "الدُّنْيَا صَحْو وْ ___.", answer: "دَافِيَة", options: ["دَافِيَة", "النَّهَارْدَه", "الصُّبْح"], fullSentence: "الدُّنْيَا صَحْو وْدَافِيَة.", fullSentenceMeaning: { ko: "맑고 따뜻해요.", en: "It's sunny and warm.", es: "Está soleado y cálido." } },
          { type: "select", promptWithBlank: "النَّهَارْدَه ___.", answer: "بِتْمَطَّر", options: ["بِتْمَطَّر", "الْجَوّ", "السَّاعَة"], fullSentence: "النَّهَارْدَه بِتْمَطَّر.", fullSentenceMeaning: { ko: "오늘 비가 와요.", en: "It's raining today.", es: "Hoy está lloviendo." } },
          { type: "input", promptWithBlank: "الدُّنْيَا ___ بَرَّه. خُد جَاكِتَّة!", answer: "بَرْد", fullSentence: "الدُّنْيَا بَرْد بَرَّه. خُد جَاكِتَّة!", fullSentenceMeaning: { ko: "밖이 추워요. 재킷 가져가세요!", en: "It's cold outside. Bring a jacket!", es: "Hace frío afuera. ¡Trae una chaqueta!" } },
          { type: "listening", audioText: "النَّهَارْدَه بِتْمَطَّر.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["النَّهَارْدَه بِتْمَطَّر.", "الدُّنْيَا صَحْو وْدَافِيَة.", "أَنَا بَحِبّ الْجَوّ الْحَرّ.", "الدُّنْيَا بَرْد بَرَّه."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the bathroom?", es: "¿Dónde está el baño?", ko: "화장실이 어디에요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme.", ko: "도와주세요! 제발 도와주세요." }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 11: Colours & Sizes ───────────────────────────────────
  day_11: {
    english: {
      step1Sentences: [
        { text: "What colour is this?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "이건 무슨 색이에요?", en: "What colour is this?", es: "¿De qué color es esto?" } },
        { text: "It's red. I like blue.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "빨간색이에요. 저는 파란색을 좋아해요.", en: "It's red. I like blue.", es: "Es rojo. Me gusta el azul." } },
        { text: "Do you have this in a bigger size?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have this in a bigger size?", es: "¿Tiene esto en una talla más grande?" } },
        { text: "This is too small. I need a larger one.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "이건 너무 작아요. 더 큰 거 필요해요.", en: "This is too small. I need a larger one.", es: "Esto es muy pequeño. Necesito uno más grande." }, recallRound: true },
        { text: "I'll take the black one, please.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one, please.", es: "Me llevo el negro, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: What colour is this? → It's ___. / 색상: red, blue, green, black, white, yellow. 크기: small, medium, large. 비교: 'too small', 'bigger'. 쇼핑: 'I'll take the ___ one.'", en: "Pattern: What colour is this? → It's ___. Colours: red, blue, green, black, white, yellow. Sizes: small, medium, large. Comparing: 'too small', 'bigger'. Shopping: 'I'll take the ___ one.'", es: "Patrón: What colour is this? → It's ___. Colores: red, blue, green, black, white, yellow. Tallas: small, medium, large. Comparar: 'too small', 'bigger'. Compras: 'I'll take the ___ one.'" },
          examples: { ko: "What colour is this? It's red. (이건 무슨 색? 빨간색이에요.)\nDo you have this in a bigger size? (더 큰 사이즈 있어요?)\nI'll take the black one, please. (검은색 걸로 할게요.)", en: "What colour is this? It's red. (Asking about colour.)\nDo you have this in a bigger size? (Requesting a larger size.)\nI'll take the black one, please. (Making a purchase decision.)", es: "What colour is this? It's red. (Preguntando por el color.)\nDo you have this in a bigger size? (Pidiendo una talla más grande.)\nI'll take the black one, please. (Tomando una decisión de compra.)" },
          mistakes: { ko: "❌ This is too small. I need a more big one.\n✅ This is too small. I need a bigger one. ('more big'이 아니라 'bigger'!)\n\n❌ I'll take the one black.\n✅ I'll take the black one. (색상이 명사 앞에 와요!)", en: "❌ I need a more big one.\n✅ I need a bigger one. (Short adjectives use '-er', not 'more'!)\n\n❌ I'll take the one black.\n✅ I'll take the black one. (Colour goes BEFORE the noun!)", es: "❌ I need a more big one.\n✅ I need a bigger one. (Adjetivos cortos usan '-er', no 'more'.)\n\n❌ I'll take the one black.\n✅ I'll take the black one. (El color va ANTES del sustantivo.)" },
          rudyTip: { ko: "탐정 루디의 팁: 쇼핑할 때 'I'll take the ___ one'만 기억해! 빈칸에 색상이나 크기를 넣으면 돼. The blue one, the large one... 쉽지?", en: "Detective Rudy's tip: Shopping made simple — 'I'll take the ___ one!' Just fill in the colour or size. The blue one, the large one... You're already a pro shopper!", es: "Consejo del detective Rudy: Compras simplificadas — 'I'll take the ___ one!' Solo llena el color o talla. The blue one, the large one... ¡Ya eres un experto!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "What ___ is this?", answer: "colour", options: ["colour", "size", "kind"], fullSentence: "What colour is this?", fullSentenceMeaning: { ko: "이건 무슨 색이에요?", en: "What colour is this?", es: "¿De qué color es esto?" } },
          { type: "select", promptWithBlank: "This is too ___.", answer: "small", options: ["small", "smaller", "smallest"], fullSentence: "This is too small.", fullSentenceMeaning: { ko: "이건 너무 작아요.", en: "This is too small.", es: "Esto es muy pequeño." } },
          { type: "select", promptWithBlank: "Do you have this in a ___ size?", answer: "bigger", options: ["bigger", "more", "much"], fullSentence: "Do you have this in a bigger size?", fullSentenceMeaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have this in a bigger size?", es: "¿Tiene esto en una talla más grande?" } },
          { type: "input", promptWithBlank: "I'll take the ___ one, please.", answer: "black", fullSentence: "I'll take the black one, please.", fullSentenceMeaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one, please.", es: "Me llevo el negro, por favor." } },
          { type: "input", promptWithBlank: "I like ___.", answer: "blue", fullSentence: "I like blue.", fullSentenceMeaning: { ko: "파란색을 좋아해요.", en: "I like blue.", es: "Me gusta el azul." } },
          { type: "listening", audioText: "I'll take the black one, please.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["I'll take the black one, please.", "This is too small. I need a larger one.", "Do you have this in a bigger size?", "What colour is this?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?", ko: "다시 한번 말해 주시겠어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Do you speak English?", es: "¿Habla inglés?", ko: "영어 하세요?" }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¿De qué color es esto?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "이건 무슨 색이에요?", en: "What colour is this?", es: "¿De qué color es esto?" } },
        { text: "Es rojo. Me gusta el azul.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "빨간색이에요. 저는 파란색을 좋아해요.", en: "It's red. I like blue.", es: "Es rojo. Me gusta el azul." } },
        { text: "¿Tiene esto en una talla más grande?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have this in a bigger size?", es: "¿Tiene esto en una talla más grande?" } },
        { text: "Esto es muy pequeño. Necesito uno más grande.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "이건 너무 작아요. 더 큰 거 필요해요.", en: "This is too small. I need a larger one.", es: "Esto es muy pequeño. Necesito uno más grande." }, recallRound: true },
        { text: "Me llevo el negro, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one, please.", es: "Me llevo el negro, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: ¿De qué color es esto? → Es ___. / 색상: rojo, azul, verde, negro, blanco, amarillo. 크기: pequeño, mediano, grande. 쇼핑: 'Me llevo el ___, por favor.'", en: "Pattern: ¿De qué color es esto? → Es ___. Colours: rojo, azul, verde, negro, blanco, amarillo. Sizes: pequeño, mediano, grande. Shopping: 'Me llevo el ___, por favor.'", es: "Patrón: ¿De qué color es esto? → Es ___. Colores: rojo, azul, verde, negro, blanco, amarillo. Tallas: pequeño, mediano, grande. Compras: 'Me llevo el ___, por favor.'" },
          examples: { ko: "¿De qué color es esto? Es rojo. (이건 무슨 색? 빨간색이에요.)\n¿Tiene esto en una talla más grande? (더 큰 사이즈 있어요?)\nMe llevo el negro, por favor. (검은색 걸로 할게요.)", en: "¿De qué color es esto? Es rojo. (What colour? It's red.)\n¿Tiene esto en una talla más grande? (Do you have a bigger size?)\nMe llevo el negro, por favor. (I'll take the black one.)", es: "¿De qué color es esto? Es rojo. (Preguntando por el color.)\n¿Tiene esto en una talla más grande? (Pidiendo una talla más grande.)\nMe llevo el negro, por favor. (Tomando una decisión de compra.)" },
          mistakes: { ko: "❌ Es roja. (셔츠를 가리키며)\n✅ Es rojo. (색상 자체를 말할 때는 남성형! 명사 수식 시에만 성별 맞춰요)\n\n❌ Más grande talla.\n✅ Talla más grande. ('más grande'가 뒤에 와요!)", en: "❌ Es roja. (pointing at a shirt)\n✅ Es rojo. (When naming the colour itself, use masculine! Match gender only when modifying a noun.)\n\n❌ Más grande talla.\n✅ Talla más grande. ('Más grande' comes AFTER the noun!)", es: "❌ Es roja. (señalando una camisa)\n✅ Es rojo. (Al nombrar el color solo, usa masculino. Solo ajusta género al modificar un sustantivo.)\n\n❌ Más grande talla.\n✅ Talla más grande. ('Más grande' va DESPUÉS del sustantivo.)" },
          rudyTip: { ko: "탐정 루디의 팁: 쇼핑할 때 'Me llevo el ___'만 기억해! '나 이거 가져갈게'라는 뜻이야. el negro, el azul... 색깔만 넣으면 끝!", en: "Detective Rudy's tip: 'Me llevo el ___' is your secret shopping weapon! It means 'I'll take the ___.' El negro, el azul... just plug in the colour and you're done!", es: "Consejo del detective Rudy: 'Me llevo el ___' es tu arma secreta de compras. Significa 'Me lo llevo.' El negro, el azul... solo agrega el color y listo." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿De qué ___ es esto?", answer: "color", options: ["color", "talla", "tipo"], fullSentence: "¿De qué color es esto?", fullSentenceMeaning: { ko: "이건 무슨 색이에요?", en: "What colour is this?", es: "¿De qué color es esto?" } },
          { type: "select", promptWithBlank: "Esto es muy ___.", answer: "pequeño", options: ["pequeño", "poco", "menos"], fullSentence: "Esto es muy pequeño.", fullSentenceMeaning: { ko: "이건 너무 작아요.", en: "This is too small.", es: "Esto es muy pequeño." } },
          { type: "select", promptWithBlank: "¿Tiene esto en una talla más ___?", answer: "grande", options: ["grande", "mucha", "larga"], fullSentence: "¿Tiene esto en una talla más grande?", fullSentenceMeaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have this in a bigger size?", es: "¿Tiene esto en una talla más grande?" } },
          { type: "input", promptWithBlank: "Me llevo el ___, por favor.", answer: "negro", fullSentence: "Me llevo el negro, por favor.", fullSentenceMeaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one, please.", es: "Me llevo el negro, por favor." } },
          { type: "input", promptWithBlank: "Me gusta el ___.", answer: "azul", fullSentence: "Me gusta el azul.", fullSentenceMeaning: { ko: "파란색을 좋아해요.", en: "I like blue.", es: "Me gusta el azul." } },
          { type: "listening", audioText: "Me llevo el negro, por favor.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Me llevo el negro, por favor.", "Esto es muy pequeño.", "¿De qué color es esto?", "Me gusta el azul."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?", ko: "다시 한번 말해 주시겠어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Do you speak English?", es: "¿Habla inglés?", ko: "영어 하세요?" }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "이건 무슨 색이에요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "이건 무슨 색이에요?", en: "What colour is this?", es: "¿De qué color es esto?" } },
        { text: "빨간색이에요. 저는 파란색을 좋아해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "빨간색이에요. 저는 파란색을 좋아해요.", en: "It's red. I like blue.", es: "Es rojo. Me gusta el azul." } },
        { text: "이거 더 큰 사이즈 있어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have this in a bigger size?", es: "¿Tiene esto en una talla más grande?" } },
        { text: "이건 너무 작아요. 더 큰 거 필요해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "이건 너무 작아요. 더 큰 거 필요해요.", en: "This is too small. I need a larger one.", es: "Esto es muy pequeño. Necesito uno más grande." }, recallRound: true },
        { text: "검은색 걸로 할게요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one, please.", es: "Me llevo el negro, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: 이건 무슨 색이에요? → ___색이에요. / 색상: 빨간색, 파란색, 초록색, 검은색, 흰색, 노란색. 크기: 작다, 크다. 쇼핑: '___걸로 할게요.'", en: "Pattern: 이건 무슨 색이에요? → ___색이에요. Colours: 빨간색(red), 파란색(blue), 초록색(green), 검은색(black), 흰색(white), 노란색(yellow). Size: 작다/크다. Shopping: '___걸로 할게요.'", es: "Patrón: 이건 무슨 색이에요? → ___색이에요. Colores: 빨간색(rojo), 파란색(azul), 초록색(green), 검은색(negro), 흰색(blanco), 노란색(amarillo). Talla: 작다/크다. Compras: '___걸로 할게요.'" },
          examples: { ko: "이건 무슨 색이에요? 빨간색이에요. (색상 묻고 답하기)\n이거 더 큰 사이즈 있어요? (큰 사이즈 요청)\n검은색 걸로 할게요. (구매 결정하기)", en: "이건 무슨 색이에요? 빨간색이에요. (What colour? It's red.)\n이거 더 큰 사이즈 있어요? (Do you have a bigger size?)\n검은색 걸로 할게요. (I'll take the black one.)", es: "이건 무슨 색이에요? 빨간색이에요. (¿Qué color? Es rojo.)\n이거 더 큰 사이즈 있어요? (¿Tiene una talla más grande?)\n검은색 걸로 할게요. (Me llevo el negro.)" },
          mistakes: { ko: "❌ 검정 걸로 할게요.\n✅ 검은색 걸로 할게요. ('검정'이 아니라 '검은색'이 자연스러워요!)\n\n❌ 이건 너무 작다요.\n✅ 이건 너무 작아요. (작다→작아요로 변형해요!)", en: "❌ 검정 걸로 할게요.\n✅ 검은색 걸로 할게요. (Use '검은색' not '검정' — add 색 for the full colour word!)\n\n❌ 이건 너무 작다요.\n✅ 이건 너무 작아요. (작다 conjugates to 작아요, not 작다요!)", es: "❌ 검정 걸로 할게요.\n✅ 검은색 걸로 할게요. (Usa '검은색' no '검정' — agrega 색 para el color completo.)\n\n❌ 이건 너무 작다요.\n✅ 이건 너무 작아요. (작다 se conjuga como 작아요, no 작다요.)" },
          rudyTip: { ko: "탐정 루디의 팁: '___걸로 할게요'는 쇼핑 필수 표현이야! 빈칸에 색상+걸로: 파란색 걸로, 큰 걸로... 이것만 알면 어디서든 쇼핑 OK!", en: "Detective Rudy's tip: '___걸로 할게요' means 'I'll go with the ___.' Just fill in the colour or size — 파란색 걸로, 큰 걸로. Your Korean shopping superpower!", es: "Consejo del detective Rudy: '___걸로 할게요' significa 'Me llevo el ___.' Solo llena con color o talla — 파란색 걸로, 큰 걸로. ¡Tu superpoder de compras coreano!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "이건 무슨 ___이에요?", answer: "색", options: ["색", "크기", "종류"], fullSentence: "이건 무슨 색이에요?", fullSentenceMeaning: { ko: "이건 무슨 색이에요?", en: "What colour is this?", es: "¿De qué color es esto?" } },
          { type: "select", promptWithBlank: "이건 너무 ___요.", answer: "작아", options: ["작아", "작은", "작게"], fullSentence: "이건 너무 작아요.", fullSentenceMeaning: { ko: "이건 너무 작아요.", en: "This is too small.", es: "Esto es muy pequeño." } },
          { type: "select", promptWithBlank: "이거 더 ___ 사이즈 있어요?", answer: "큰", options: ["큰", "크게", "크다"], fullSentence: "이거 더 큰 사이즈 있어요?", fullSentenceMeaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have this in a bigger size?", es: "¿Tiene esto en una talla más grande?" } },
          { type: "input", promptWithBlank: "___색 걸로 할게요.", answer: "검은", fullSentence: "검은색 걸로 할게요.", fullSentenceMeaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one.", es: "Me llevo el negro." } },
          { type: "input", promptWithBlank: "저는 ___색을 좋아해요.", answer: "파란", fullSentence: "저는 파란색을 좋아해요.", fullSentenceMeaning: { ko: "저는 파란색을 좋아해요.", en: "I like blue.", es: "Me gusta el azul." } },
          { type: "listening", audioText: "검은색 걸로 할게요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["검은색 걸로 할게요.", "이건 너무 작아요.", "이건 무슨 색이에요?", "파란색을 좋아해요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?", ko: "다시 한번 말해 주시겠어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Do you speak English?", es: "¿Habla inglés?", ko: "영어 하세요?" }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Ini warna apa?", speechLang: "id-ID", meaning: { ko: "이건 무슨 색이에요?", en: "What colour is this?", es: "¿De qué color es esto?" } },
        { text: "Ini merah. Saya suka biru.", speechLang: "id-ID", meaning: { ko: "빨간색이에요. 저는 파란색을 좋아해요.", en: "It's red. I like blue.", es: "Es rojo. Me gusta el azul." } },
        { text: "Apakah ada ukuran yang lebih besar?", speechLang: "id-ID", meaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have this in a bigger size?", es: "¿Tiene esto en una talla más grande?" } },
        { text: "Ini terlalu kecil. Saya butuh yang lebih besar.", speechLang: "id-ID", meaning: { ko: "이건 너무 작아요. 더 큰 거 필요해요.", en: "This is too small. I need a larger one.", es: "Esto es muy pequeño. Necesito uno más grande." }, recallRound: true },
        { text: "Saya ambil yang hitam.", speechLang: "id-ID", meaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one, please.", es: "Me llevo el negro, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Ini warna apa? → Ini ___. / 색상: merah(빨강), biru(파랑), hijau(초록), hitam(검정), putih(흰색), kuning(노랑). 비교급: 'lebih + 형용사'(lebih besar=더 큰). 'terlalu'=너무. 쇼핑: 'Saya ambil yang ___.'", en: "Pattern: Ini warna apa? → Ini ___. Colours: merah(red), biru(blue), hijau(green), hitam(black), putih(white), kuning(yellow). Comparative: 'lebih + adjective' (lebih besar=bigger). 'terlalu'=too. Shopping: 'Saya ambil yang ___.'", es: "Patrón: Ini warna apa? → Ini ___. Colores: merah(rojo), biru(azul), hijau(verde), hitam(negro), putih(blanco), kuning(amarillo). Comparativo: 'lebih + adjetivo' (lebih besar=más grande). 'terlalu'=demasiado. Compras: 'Saya ambil yang ___.'" },
          examples: { ko: "Ini warna apa? Ini merah. (이건 무슨 색? 빨간색이에요.)\nApakah ada ukuran yang lebih besar? (더 큰 사이즈 있어요?)\nSaya ambil yang hitam. (검은색 걸로 할게요.)", en: "Ini warna apa? Ini merah. (Asking about colour.)\nApakah ada ukuran yang lebih besar? (Requesting a larger size.)\nSaya ambil yang hitam. (Making a purchase decision.)", es: "Ini warna apa? Ini merah. (Preguntando por el color.)\nApakah ada ukuran yang lebih besar? (Pidiendo una talla más grande.)\nSaya ambil yang hitam. (Tomando una decisión de compra.)" },
          mistakes: { ko: "❌ Saya butuh yang besar lebih.\n✅ Saya butuh yang lebih besar. ('lebih'가 형용사 앞에 와요! 'more big'이 아니라 lebih besar)\n\n❌ Saya ambil hitam yang.\n✅ Saya ambil yang hitam. ('yang'이 색상 앞에 와요!)", en: "❌ Saya butuh yang besar lebih.\n✅ Saya butuh yang lebih besar. ('lebih' goes BEFORE the adjective — lebih besar, not besar lebih!)\n\n❌ Saya ambil hitam yang.\n✅ Saya ambil yang hitam. ('yang' goes before the colour!)", es: "❌ Saya butuh yang besar lebih.\n✅ Saya butuh yang lebih besar. ('lebih' va ANTES del adjetivo — lebih besar, no besar lebih!)\n\n❌ Saya ambil hitam yang.\n✅ Saya ambil yang hitam. ('yang' va antes del color.)" },
          rudyTip: { ko: "탐정 루디의 팁: 쇼핑할 땐 'Saya ambil yang ___'만 기억해! '나 이거(저) 가질게'라는 뜻이야. yang hitam, yang biru... 색깔만 넣으면 끝! 비교는 'lebih'(더)면 만사 OK~", en: "Detective Rudy's tip: For shopping, just remember 'Saya ambil yang ___' — 'I'll take the ___ one.' Yang hitam, yang biru... just add a colour! And for comparing, 'lebih' (more) solves it all!", es: "Consejo del detective Rudy: Para comprar, solo recuerda 'Saya ambil yang ___' — 'Me llevo el ___.' Yang hitam, yang biru... ¡solo agrega un color! Y para comparar, '¡lebih' (más) lo resuelve todo!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Ini ___ apa?", answer: "warna", options: ["warna", "ukuran", "jenis"], fullSentence: "Ini warna apa?", fullSentenceMeaning: { ko: "이건 무슨 색이에요?", en: "What colour is this?", es: "¿De qué color es esto?" } },
          { type: "select", promptWithBlank: "Ini ___ kecil.", answer: "terlalu", options: ["terlalu", "lebih", "sangat"], fullSentence: "Ini terlalu kecil.", fullSentenceMeaning: { ko: "이건 너무 작아요.", en: "This is too small.", es: "Esto es muy pequeño." } },
          { type: "select", promptWithBlank: "Apakah ada ukuran yang ___ besar?", answer: "lebih", options: ["lebih", "terlalu", "banyak"], fullSentence: "Apakah ada ukuran yang lebih besar?", fullSentenceMeaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have this in a bigger size?", es: "¿Tiene esto en una talla más grande?" } },
          { type: "input", promptWithBlank: "Saya ambil yang ___.", answer: "hitam", fullSentence: "Saya ambil yang hitam.", fullSentenceMeaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one.", es: "Me llevo el negro." } },
          { type: "input", promptWithBlank: "Saya suka ___.", answer: "biru", fullSentence: "Saya suka biru.", fullSentenceMeaning: { ko: "파란색을 좋아해요.", en: "I like blue.", es: "Me gusta el azul." } },
          { type: "listening", audioText: "Saya ambil yang hitam.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Saya ambil yang hitam.", "Ini terlalu kecil. Saya butuh yang lebih besar.", "Apakah ada ukuran yang lebih besar?", "Ini warna apa?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?", ko: "다시 한번 말해 주시겠어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Do you speak English?", es: "¿Habla inglés?", ko: "영어 하세요?" }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "دَه لَوْنُه إِيه؟ (da lawno eeh?)", speechLang: "ar-EG", meaning: { ko: "이건 무슨 색이에요?", en: "What colour is this?", es: "¿De qué color es esto?" } },
        { text: "دَه أَحْمَر. أَنَا بَحِبّ الأَزْرَق. (da aḥmar. ana baḥebb el-azraʼ.)", speechLang: "ar-EG", meaning: { ko: "빨간색이에요. 저는 파란색을 좋아해요.", en: "It's red. I like blue.", es: "Es rojo. Me gusta el azul." } },
        { text: "فِيه مَقَاس أَكْبَر؟ (fiih maʼaas akbar?)", speechLang: "ar-EG", meaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have this in a bigger size?", es: "¿Tiene esto en una talla más grande?" } },
        { text: "دَه صُغَيَّر أَوِي. عَايِز وَاحِد أَكْبَر. (da ṣoghayyar awi. 3aayez waaḥed akbar.)", speechLang: "ar-EG", meaning: { ko: "이건 너무 작아요. 더 큰 거 필요해요.", en: "This is too small. I need a larger one.", es: "Esto es muy pequeño. Necesito uno más grande." }, recallRound: true },
        { text: "هَاخُد الأَسْوَد. (haakhod el-aswad.)", speechLang: "ar-EG", meaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one, please.", es: "Me llevo el negro, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: دَه لَوْنُه إِيه؟ (da lawno eeh?) → دَه ___. / 색상: aḥmar(빨강), azraʼ(파랑), akhḍar(초록), eswed/aswad(검정), abyaḍ(흰색), aṣfar(노랑). 비교급: 'akbar'(더 큰), 'aṣghar'(더 작은). 'awi'=너무/아주. 쇼핑: 'haakhod ___'(이거 살게요).", en: "Pattern: da lawno eeh? → da ___. Colours: aḥmar(red), azraʼ(blue), akhḍar(green), aswad(black), abyaḍ(white), aṣfar(yellow). Comparative: 'akbar'(bigger), 'aṣghar'(smaller). 'awi'=too/very. Shopping: 'haakhod ___'(I'll take ___).", es: "Patrón: da lawno eeh? → da ___. Colores: aḥmar(rojo), azraʼ(azul), akhḍar(verde), aswad(negro), abyaḍ(blanco), aṣfar(amarillo). Comparativo: 'akbar'(más grande), 'aṣghar'(más pequeño). 'awi'=demasiado/muy. Compras: 'haakhod ___'(me llevo ___)." },
          examples: { ko: "دَه لَوْنُه إِيه؟ دَه أَحْمَر. (이건 무슨 색? 빨간색이에요.)\nفِيه مَقَاس أَكْبَر؟ (더 큰 사이즈 있어요?)\nهَاخُد الأَسْوَد. (검은색 걸로 할게요.)", en: "da lawno eeh? da aḥmar. (Asking about colour.)\nfiih maʼaas akbar? (Requesting a larger size.)\nhaakhod el-aswad. (Making a purchase decision.)", es: "da lawno eeh? da aḥmar. (Preguntando por el color.)\nfiih maʼaas akbar? (Pidiendo una talla más grande.)\nhaakhod el-aswad. (Tomando una decisión de compra.)" },
          mistakes: { ko: "❌ دَه كَبِير أَكْتَر. (da kebeer aktar.)\n✅ دَه أَكْبَر. (비교급은 한 단어로 'akbar'! 'more big'처럼 두 단어로 쓰지 마세요)\n\n❌ هَاخُد لَوْن أَسْوَد دَه. (haakhod lawn aswad da.)\n✅ هَاخُد الأَسْوَد. (그냥 'el-aswad'(그 검은 거)면 충분해요!)", en: "❌ da kebeer aktar.\n✅ da akbar. (Comparative is ONE word — 'akbar'! Don't say it like 'more big'.)\n\n❌ haakhod lawn aswad da.\n✅ haakhod el-aswad. (Just 'el-aswad' (the black one) is enough!)", es: "❌ da kebeer aktar.\n✅ da akbar. (¡El comparativo es UNA palabra — 'akbar'! No lo digas como 'más grande'.)\n\n❌ haakhod lawn aswad da.\n✅ haakhod el-aswad. (¡Solo 'el-aswad' (el negro) es suficiente!)" },
          rudyTip: { ko: "탐정 루디의 팁: 이집트에서 쇼핑할 땐 'haakhod ___'(하خُد=이거 살게요)만 알면 끝! haakhod el-aswad, haakhod el-azraʼ... 색만 넣어. 비교는 'akbar'(더 큰), 'aṣghar'(더 작은) 한 단어면 OK~", en: "Detective Rudy's tip: For shopping in Egypt, just learn 'haakhod ___' (I'll take ___)! haakhod el-aswad, haakhod el-azraʼ... just add a colour. And comparing is one word: 'akbar' (bigger), 'aṣghar' (smaller)!", es: "Consejo del detective Rudy: Para comprar en Egipto, ¡solo aprende 'haakhod ___' (me llevo ___)! haakhod el-aswad, haakhod el-azraʼ... solo añade un color. Y comparar es una palabra: 'akbar' (más grande), 'aṣghar' (más pequeño)." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "دَه ___ إِيه؟", answer: "لَوْنُه", options: ["لَوْنُه", "مَقَاسُه", "نَوْعُه"], fullSentence: "دَه لَوْنُه إِيه؟", fullSentenceMeaning: { ko: "이건 무슨 색이에요?", en: "What colour is this?", es: "¿De qué color es esto?" } },
          { type: "select", promptWithBlank: "دَه صُغَيَّر ___.", answer: "أَوِي", options: ["أَوِي", "أَكْبَر", "كْتِير"], fullSentence: "دَه صُغَيَّر أَوِي.", fullSentenceMeaning: { ko: "이건 너무 작아요.", en: "This is too small.", es: "Esto es muy pequeño." } },
          { type: "select", promptWithBlank: "فِيه مَقَاس ___؟", answer: "أَكْبَر", options: ["أَكْبَر", "أَوِي", "كْتِير"], fullSentence: "فِيه مَقَاس أَكْبَر؟", fullSentenceMeaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have this in a bigger size?", es: "¿Tiene esto en una talla más grande?" } },
          { type: "input", promptWithBlank: "هَاخُد ___.", answer: "الأَسْوَد", fullSentence: "هَاخُد الأَسْوَد.", fullSentenceMeaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one.", es: "Me llevo el negro." } },
          { type: "input", promptWithBlank: "أَنَا بَحِبّ ___.", answer: "الأَزْرَق", fullSentence: "أَنَا بَحِبّ الأَزْرَق.", fullSentenceMeaning: { ko: "파란색을 좋아해요.", en: "I like blue.", es: "Me gusta el azul." } },
          { type: "listening", audioText: "هَاخُد الأَسْوَد.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["هَاخُد الأَسْوَد.", "دَه صُغَيَّر أَوِي. عَايِز وَاحِد أَكْبَر.", "فِيه مَقَاس أَكْبَر؟", "دَه لَوْنُه إِيه؟"], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 12: Unit 2 Review ─────────────────────────────────────
  day_12: {
    english: {
      step1Sentences: [
        { text: "I'm twenty-five years old. My phone number is 010-1234-5678.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "저는 스물다섯 살이에요. 전화번호는 010-1234-5678이에요.", en: "I'm twenty-five years old. My phone number is 010-1234-5678.", es: "Tengo veinticinco años. Mi número es 010-1234-5678." } },
        { text: "Today is Friday. See you on Monday!", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "오늘은 금요일이에요. 월요일에 봐요!", en: "Today is Friday. See you on Monday!", es: "Hoy es viernes. ¡Te veo el lunes!" } },
        { text: "It's half past three. The meeting is at four.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "세 시 반이에요. 회의는 네 시예요.", en: "It's half past three. The meeting is at four.", es: "Son las tres y media. La reunión es a las cuatro." } },
        { text: "It's raining today. It's cold. Bring a jacket!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "오늘 비가 와요. 추워요. 재킷 가져가세요!", en: "It's raining today. It's cold. Bring a jacket!", es: "Hoy llueve. Hace frío. ¡Trae una chaqueta!" }, recallRound: true },
        { text: "I like the blue one. Do you have a bigger size?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "파란색이 좋아요. 더 큰 사이즈 있어요?", en: "I like the blue one. Do you have a bigger size?", es: "Me gusta el azul. ¿Tiene una talla más grande?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Unit 2 총복습! 숫자(How old are you?), 요일(What day is it?), 시간(What time is it?), 날씨(How's the weather?), 색상/크기(What colour? What size?).", en: "Pattern: Unit 2 full review! Numbers (How old are you?), days (What day?), time (What time?), weather (How's the weather?), colours/sizes (What colour? What size?).", es: "Patrón: Repaso completo de Unidad 2. Números (How old are you?), días (What day?), hora (What time?), clima (How's the weather?), colores/tallas (What colour? What size?)." },
          examples: { ko: "I'm twenty-five. Today is Friday. (나이+요일 연결)\nIt's half past three. It's raining. (시간+날씨 연결)\nI like the blue one. Do you have a bigger size? (색상+크기 연결)", en: "I'm twenty-five. Today is Friday. (Connecting age + day.)\nIt's half past three. It's raining outside. (Connecting time + weather.)\nI like the blue one. Do you have a bigger size? (Connecting colour + size.)", es: "I'm twenty-five. Today is Friday. (Conectando edad + día.)\nIt's half past three. It's raining outside. (Conectando hora + clima.)\nI like the blue one. Do you have a bigger size? (Conectando color + talla.)" },
          mistakes: { ko: "❌ I'm twenty-five years. (old 빠짐)\n✅ I'm twenty-five years old.\n\n❌ See you in Monday at three hour.\n✅ See you on Monday at three o'clock. (on+요일, at+시간, o'clock!)", en: "❌ I'm twenty-five years. (missing 'old')\n✅ I'm twenty-five years old.\n\n❌ See you in Monday at three hour.\n✅ See you on Monday at three o'clock. (on + day, at + time, o'clock!)", es: "❌ I'm twenty-five years. (falta 'old')\n✅ I'm twenty-five years old.\n\n❌ See you in Monday at three hour.\n✅ See you on Monday at three o'clock. (on + día, at + hora, o'clock.)" },
          rudyTip: { ko: "탐정 루디의 팁: 이번 주 배운 것들을 연결해봐! 'See you on Monday at three!' 처럼 요일+시간을 합치면 진짜 대화가 돼! 넌 이미 많이 알고 있어~", en: "Detective Rudy's tip: Connect everything you've learned! 'See you on Monday at three!' — day + time in one sentence. You're building real conversations now. Case well done!", es: "Consejo del detective Rudy: Conecta todo lo que aprendiste. 'See you on Monday at three!' — día + hora en una oración. Ya estás construyendo conversaciones reales. ¡Buen caso!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "How ___ are you?", answer: "old", options: ["old", "much", "many"], fullSentence: "How old are you?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
          { type: "select", promptWithBlank: "What ___ is it?", answer: "time", options: ["time", "day", "hour"], fullSentence: "What time is it?", fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
          { type: "input", promptWithBlank: "How's the ___ today?", answer: "weather", fullSentence: "How's the weather today?", fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
          { type: "input", promptWithBlank: "What ___ is it today?", answer: "day", fullSentence: "What day is it today?", fullSentenceMeaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
          { type: "input", promptWithBlank: "Do you have this in a ___ size?", answer: "bigger", fullSentence: "Do you have this in a bigger size?", fullSentenceMeaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have this in a bigger size?", es: "¿Tiene esto en una talla más grande?" } },
          { type: "listening", audioText: "I like the blue one. Do you have a bigger size?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["I like the blue one. Do you have a bigger size?", "It's raining today. It's cold.", "What time is it?", "How old are you?"], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Tengo veinticinco años. Mi número es 010-1234-5678.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "저는 스물다섯 살이에요. 전화번호는 010-1234-5678이에요.", en: "I'm twenty-five. My number is 010-1234-5678.", es: "Tengo veinticinco años. Mi número es 010-1234-5678." } },
        { text: "Hoy es viernes. ¡Te veo el lunes!", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "오늘은 금요일이에요. 월요일에 봐요!", en: "Today is Friday. See you on Monday!", es: "Hoy es viernes. ¡Te veo el lunes!" } },
        { text: "Son las tres y media. La reunión es a las cuatro.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "세 시 반이에요. 회의는 네 시예요.", en: "It's half past three. The meeting is at four.", es: "Son las tres y media. La reunión es a las cuatro." } },
        { text: "Hoy está lloviendo. Hace frío. ¡Trae una chaqueta!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "오늘 비가 와요. 추워요. 재킷 가져가세요!", en: "It's raining. It's cold. Bring a jacket!", es: "Hoy está lloviendo. Hace frío. ¡Trae una chaqueta!" }, recallRound: true },
        { text: "Me gusta el azul. ¿Tiene una talla más grande?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "파란색이 좋아요. 더 큰 사이즈 있어요?", en: "I like blue. Do you have a bigger size?", es: "Me gusta el azul. ¿Tiene una talla más grande?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Unit 2 스페인어 총복습! 숫자(¿Cuántos años?), 요일(¿Qué día?), 시간(¿Qué hora es?), 날씨(¿Cómo está el clima?), 색상/크기(¿De qué color? ¿Qué talla?).", en: "Pattern: Unit 2 Spanish review! Numbers (¿Cuántos años?), days (¿Qué día?), time (¿Qué hora es?), weather (¿Cómo está el clima?), colours/sizes (¿De qué color?).", es: "Patrón: Repaso completo de Unidad 2 en español. Números (¿Cuántos años?), días (¿Qué día?), hora (¿Qué hora es?), clima (¿Cómo está el clima?), colores/tallas." },
          examples: { ko: "Tengo veinticinco años. Hoy es viernes. (나이+요일 연결)\nSon las tres y media. Está lloviendo. (시간+날씨 연결)\nMe gusta el azul. ¿Tiene una talla más grande? (색상+크기 연결)", en: "Tengo veinticinco años. Hoy es viernes. (Connecting age + day.)\nSon las tres y media. Está lloviendo. (Connecting time + weather.)\nMe gusta el azul. ¿Tiene una talla más grande? (Connecting colour + size.)", es: "Tengo veinticinco años. Hoy es viernes. (Conectando edad + día.)\nSon las tres y media. Está lloviendo. (Conectando hora + clima.)\nMe gusta el azul. ¿Tiene una talla más grande? (Conectando color + talla.)" },
          mistakes: { ko: "❌ Soy veinticinco años. (ser 대신 tener!)\n✅ Tengo veinticinco años.\n\n❌ Son la una. Es frío.\n✅ Es la una. Hace frío. (1시=Es la una, 온도=Hace!)", en: "❌ Soy veinticinco años. (Use tener, not ser for age!)\n✅ Tengo veinticinco años.\n\n❌ Son la una. Es frío.\n✅ Es la una. Hace frío. (1 o'clock = Es la una. Temperature = Hace!)", es: "❌ Soy veinticinco años. (Usa tener, no ser para la edad.)\n✅ Tengo veinticinco años.\n\n❌ Son la una. Es frío.\n✅ Es la una. Hace frío. (1 en punto = Es la una. Temperatura = Hace.)" },
          rudyTip: { ko: "탐정 루디의 팁: 스페인어 핵심 정리! 나이=Tengo, 시간=Son las(Es la una만 예외), 날씨=Hace(온도)/Está(상태). 이 세 가지 단서만 기억하면 돼!", en: "Detective Rudy's tip: Spanish cheat sheet! Age = Tengo, time = Son las (except Es la una), weather = Hace (temp) / Está (conditions). Three clues to rule them all!", es: "Consejo del detective Rudy: Resumen del español. Edad = Tengo, hora = Son las (excepto Es la una), clima = Hace (temp) / Está (condiciones). ¡Tres pistas para dominarlos!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Cuántos ___ tienes?", answer: "años", options: ["años", "días", "veces"], fullSentence: "¿Cuántos años tienes?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
          { type: "select", promptWithBlank: "¿Qué ___ es?", answer: "hora", options: ["hora", "día", "tiempo"], fullSentence: "¿Qué hora es?", fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
          { type: "input", promptWithBlank: "¿Cómo está el ___ hoy?", answer: "clima", fullSentence: "¿Cómo está el clima hoy?", fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" } },
          { type: "input", promptWithBlank: "¿Qué ___ es hoy?", answer: "día", fullSentence: "¿Qué día es hoy?", fullSentenceMeaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" } },
          { type: "input", promptWithBlank: "¿Tiene una talla más ___?", answer: "grande", fullSentence: "¿Tiene una talla más grande?", fullSentenceMeaning: { ko: "더 큰 사이즈 있어요?", en: "Do you have a bigger size?", es: "¿Tiene una talla más grande?" } },
          { type: "listening", audioText: "Me gusta el azul. ¿Tiene una talla más grande?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Me gusta el azul. ¿Tiene una talla más grande?", "Hoy está lloviendo. Hace frío.", "¿Qué hora es?", "¿Cuántos años tienes?"], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "저는 스물다섯 살이에요. 전화번호는 공일공-일이삼사-오육칠팔이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "저는 스물다섯 살이에요. 전화번호는 010-1234-5678이에요.", en: "I'm 25. My number is 010-1234-5678.", es: "Tengo 25 años. Mi número es 010-1234-5678." } },
        { text: "오늘은 금요일이에요. 월요일에 봐요!", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "오늘은 금요일이에요. 월요일에 봐요!", en: "Today is Friday. See you on Monday!", es: "Hoy es viernes. ¡Te veo el lunes!" } },
        { text: "세 시 반이에요. 회의는 네 시예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "세 시 반이에요. 회의는 네 시예요.", en: "It's 3:30. The meeting is at 4.", es: "Son las 3 y media. La reunión es a las 4." } },
        { text: "오늘 비가 와요. 추워요. 재킷 가져가세요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "오늘 비가 와요. 추워요. 재킷 가져가세요!", en: "It's raining. It's cold. Bring a jacket!", es: "Hoy llueve. Hace frío. ¡Trae una chaqueta!" }, recallRound: true },
        { text: "파란색이 좋아요. 더 큰 사이즈 있어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "파란색이 좋아요. 더 큰 사이즈 있어요?", en: "I like blue. Do you have a bigger size?", es: "Me gusta el azul. ¿Tiene una talla más grande?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Unit 2 한국어 총복습! 숫자(몇 살이에요?), 요일(무슨 요일이에요?), 시간(몇 시예요?), 날씨(날씨 어때요?), 색상/크기(무슨 색? 사이즈?).", en: "Pattern: Unit 2 Korean review! Numbers (몇 살이에요?), days (무슨 요일이에요?), time (몇 시예요?), weather (날씨 어때요?), colours/sizes (무슨 색? 사이즈?).", es: "Patrón: Repaso completo de Unidad 2 en coreano. Números (몇 살이에요?), días (무슨 요일이에요?), hora (몇 시예요?), clima (날씨 어때요?), colores/tallas." },
          examples: { ko: "저는 스물다섯 살이에요. 오늘은 금요일이에요. (나이+요일 연결)\n세 시 반이에요. 비가 와요. (시간+날씨 연결)\n파란색이 좋아요. 더 큰 사이즈 있어요? (색상+크기 연결)", en: "저는 스물다섯 살이에요. 오늘은 금요일이에요. (Connecting age + day.)\n세 시 반이에요. 비가 와요. (Connecting time + weather.)\n파란색이 좋아요. 더 큰 사이즈 있어요? (Connecting colour + size.)", es: "저는 스물다섯 살이에요. 오늘은 금요일이에요. (Conectando edad + día.)\n세 시 반이에요. 비가 와요. (Conectando hora + clima.)\n파란색이 좋아요. 더 큰 사이즈 있어요? (Conectando color + talla.)" },
          mistakes: { ko: "❌ 이십오 살이에요. (나이에 한자 숫자 씀)\n✅ 스물다섯 살이에요. (나이는 순수 숫자!)\n\n❌ 삼 시예요. 춥다요.\n✅ 세 시예요. 추워요. (시간=순수 숫자, ㅂ 불규칙!)", en: "❌ 이십오 살이에요. (Used Sino-Korean for age)\n✅ 스물다섯 살이에요. (Age needs native Korean numbers!)\n\n❌ 삼 시예요. 춥다요.\n✅ 세 시예요. 추워요. (Time = native numbers, ㅂ irregular!)", es: "❌ 이십오 살이에요. (Usó sino-coreano para edad)\n✅ 스물다섯 살이에요. (La edad necesita números nativos.)\n\n❌ 삼 시예요. 춥다요.\n✅ 세 시예요. 추워요. (Hora = números nativos, ¡ㅂ irregular!)" },
          rudyTip: { ko: "탐정 루디의 팁: 한국어 핵심 정리! 나이+시간=순수 숫자, 돈+전화=한자 숫자, 날씨는 ㅂ 불규칙(추워요, 더워요). 이 세 가지 단서면 Unit 2 완벽 클리어!", en: "Detective Rudy's tip: Korean cheat sheet! Age + time = native numbers, money + phone = Sino-Korean, weather = ㅂ irregular (추워요, 더워요). Three clues and Unit 2 is solved!", es: "Consejo del detective Rudy: Resumen del coreano. Edad + hora = números nativos, dinero + teléfono = sino-coreano, clima = ㅂ irregular (추워요, 더워요). ¡Tres pistas y Unidad 2 resuelta!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "몇 ___이에요?", answer: "살", options: ["살", "개", "번"], fullSentence: "몇 살이에요?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
          { type: "select", promptWithBlank: "지금 몇 ___예요?", answer: "시", options: ["시", "일", "번"], fullSentence: "지금 몇 시예요?", fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
          { type: "input", promptWithBlank: "오늘 ___ 어때요?", answer: "날씨", fullSentence: "오늘 날씨 어때요?", fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather?", es: "¿Cómo está el clima?" } },
          { type: "input", promptWithBlank: "오늘 무슨 ___이에요?", answer: "요일", fullSentence: "오늘 무슨 요일이에요?", fullSentenceMeaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it?", es: "¿Qué día es hoy?" } },
          { type: "input", promptWithBlank: "이거 더 ___ 사이즈 있어요?", answer: "큰", fullSentence: "이거 더 큰 사이즈 있어요?", fullSentenceMeaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have a bigger size?", es: "¿Tiene una talla más grande?" } },
          { type: "listening", audioText: "파란색이 좋아요. 더 큰 사이즈 있어요?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["파란색이 좋아요. 더 큰 사이즈 있어요?", "오늘 비가 와요. 추워요.", "지금 몇 시예요?", "몇 살이에요?"], correct: 0, audioOnly: true },
        ],
      },
    },
    indonesian: {
      step1Sentences: [
        { text: "Saya berumur dua puluh lima tahun. Nomor telepon saya 010-1234-5678.", speechLang: "id-ID", meaning: { ko: "저는 스물다섯 살이에요. 전화번호는 010-1234-5678이에요.", en: "I'm twenty-five years old. My phone number is 010-1234-5678.", es: "Tengo veinticinco años. Mi número es 010-1234-5678." } },
        { text: "Hari ini hari Jumat. Sampai jumpa hari Senin!", speechLang: "id-ID", meaning: { ko: "오늘은 금요일이에요. 월요일에 봐요!", en: "Today is Friday. See you on Monday!", es: "Hoy es viernes. ¡Te veo el lunes!" } },
        { text: "Sekarang jam setengah empat. Rapatnya jam empat.", speechLang: "id-ID", meaning: { ko: "세 시 반이에요. 회의는 네 시예요.", en: "It's half past three. The meeting is at four.", es: "Son las tres y media. La reunión es a las cuatro." } },
        { text: "Hari ini hujan. Dingin. Bawa jaket!", speechLang: "id-ID", meaning: { ko: "오늘 비가 와요. 추워요. 재킷 가져가세요!", en: "It's raining today. It's cold. Bring a jacket!", es: "Hoy llueve. Hace frío. ¡Trae una chaqueta!" }, recallRound: true },
        { text: "Saya suka yang biru. Apakah ada ukuran yang lebih besar?", speechLang: "id-ID", meaning: { ko: "파란색이 좋아요. 더 큰 사이즈 있어요?", en: "I like the blue one. Do you have a bigger size?", es: "Me gusta el azul. ¿Tiene una talla más grande?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Unit 2 인도네시아어 총복습! 숫자/나이(Berapa umur Anda?), 요일(Hari ini hari apa?), 시간(Sekarang jam berapa?), 날씨(Bagaimana cuaca?), 색상/크기(Ini warna apa? Ukuran?).", en: "Pattern: Unit 2 Indonesian review! Numbers/age (Berapa umur Anda?), days (Hari ini hari apa?), time (Sekarang jam berapa?), weather (Bagaimana cuaca?), colours/sizes (Ini warna apa? Ukuran?).", es: "Patrón: Repaso completo de Unidad 2 en indonesio. Números/edad (Berapa umur Anda?), días (Hari ini hari apa?), hora (Sekarang jam berapa?), clima (Bagaimana cuaca?), colores/tallas (Ini warna apa?)." },
          examples: { ko: "Saya berumur dua puluh lima tahun. Hari ini hari Jumat. (나이+요일 연결)\nSekarang jam setengah empat. Hari ini hujan. (시간+날씨 연결)\nSaya suka yang biru. Apakah ada ukuran yang lebih besar? (색상+크기 연결)", en: "Saya berumur dua puluh lima tahun. Hari ini hari Jumat. (Connecting age + day.)\nSekarang jam setengah empat. Hari ini hujan. (Connecting time + weather.)\nSaya suka yang biru. Apakah ada ukuran yang lebih besar? (Connecting colour + size.)", es: "Saya berumur dua puluh lima tahun. Hari ini hari Jumat. (Conectando edad + día.)\nSekarang jam setengah empat. Hari ini hujan. (Conectando hora + clima.)\nSaya suka yang biru. Apakah ada ukuran yang lebih besar? (Conectando color + talla.)" },
          mistakes: { ko: "❌ Saya berumur dua puluh lima. (tahun 빠짐)\n✅ Saya berumur dua puluh lima tahun.\n\n❌ jam setengah empat (= 3시 반!) ↔ jam empat (4시)\n✅ setengah empat=3:30, empat=4:00 ('setengah'는 다음 시간 기준!)", en: "❌ Saya berumur dua puluh lima. (missing 'tahun')\n✅ Saya berumur dua puluh lima tahun.\n\n❌ Confusing jam setengah empat (3:30!) with jam empat (4:00)\n✅ setengah empat=3:30, empat=4:00 ('setengah' counts toward the NEXT hour!)", es: "❌ Saya berumur dua puluh lima. (falta 'tahun')\n✅ Saya berumur dua puluh lima tahun.\n\n❌ Confundir jam setengah empat (¡3:30!) con jam empat (4:00)\n✅ setengah empat=3:30, empat=4:00 ('setengah' cuenta hacia la hora SIGUIENTE.)" },
          rudyTip: { ko: "탐정 루디의 팁: 인도네시아어 핵심 정리! 숫자는 belas/puluh 블록, 요일은 'hari'+요일, 시간은 'setengah'=다음 시간 절반, 날씨는 형용사만, 비교는 'lebih'. 이 단서들이면 Unit 2 완벽 클리어!", en: "Detective Rudy's tip: Indonesian cheat sheet! Numbers = belas/puluh blocks, days = 'hari' + weekday, time = 'setengah' is half to the NEXT hour, weather = just the adjective, compare = 'lebih'. These clues solve Unit 2!", es: "Consejo del detective Rudy: Resumen del indonesio. Números = bloques belas/puluh, días = 'hari' + día, hora = 'setengah' es medio hacia la SIGUIENTE hora, clima = solo el adjetivo, comparar = 'lebih'. ¡Estas pistas resuelven la Unidad 2!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Berapa ___ Anda?", answer: "umur", options: ["umur", "nama", "kota"], fullSentence: "Berapa umur Anda?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
          { type: "select", promptWithBlank: "Sekarang jam ___?", answer: "berapa", options: ["berapa", "apa", "mana"], fullSentence: "Sekarang jam berapa?", fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
          { type: "input", promptWithBlank: "Bagaimana ___ hari ini?", answer: "cuaca", fullSentence: "Bagaimana cuaca hari ini?", fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather?", es: "¿Cómo está el clima?" } },
          { type: "input", promptWithBlank: "Hari ini hari ___?", answer: "apa", fullSentence: "Hari ini hari apa?", fullSentenceMeaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it?", es: "¿Qué día es hoy?" } },
          { type: "input", promptWithBlank: "Apakah ada ukuran yang lebih ___?", answer: "besar", fullSentence: "Apakah ada ukuran yang lebih besar?", fullSentenceMeaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have a bigger size?", es: "¿Tiene una talla más grande?" } },
          { type: "listening", audioText: "Saya suka yang biru. Apakah ada ukuran yang lebih besar?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Saya suka yang biru. Apakah ada ukuran yang lebih besar?", "Hari ini hujan. Dingin.", "Sekarang jam berapa?", "Berapa umur Anda?"], correct: 0, audioOnly: true },
        ],
      },
    },
    arabic: {
      step1Sentences: [
        { text: "أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة. نِمْرِة تِلِيفُونِي ٠١٠-١٢٣٤-٥٦٧٨. (ana 3andi khamsa we-3eshreen sana. nemret telefoni ṣefr-waaḥed-ṣefr...)", speechLang: "ar-EG", meaning: { ko: "저는 스물다섯 살이에요. 전화번호는 010-1234-5678이에요.", en: "I'm twenty-five years old. My phone number is 010-1234-5678.", es: "Tengo veinticinco años. Mi número es 010-1234-5678." } },
        { text: "النَّهَارْدَه الْجُمْعَة. أَشُوفَك يَوْم الِاتْنِين! (en-naharda el-gom3a. ashoofak yoom el-etneen!)", speechLang: "ar-EG", meaning: { ko: "오늘은 금요일이에요. 월요일에 봐요!", en: "Today is Friday. See you on Monday!", es: "Hoy es viernes. ¡Te veo el lunes!" } },
        { text: "السَّاعَة تَلَاتَة وْنُص. الِاجْتِمَاع السَّاعَة أَرْبَعَة. (es-saa3a talaata we-noṣ. el-egtemaa3 es-saa3a arba3a.)", speechLang: "ar-EG", meaning: { ko: "세 시 반이에요. 회의는 네 시예요.", en: "It's half past three. The meeting is at four.", es: "Son las tres y media. La reunión es a las cuatro." } },
        { text: "النَّهَارْدَه بِتْمَطَّر. بَرْد. خُد جَاكِتَّة! (en-naharda betmaṭṭar. bard. khod jaketta!)", speechLang: "ar-EG", meaning: { ko: "오늘 비가 와요. 추워요. 재킷 가져가세요!", en: "It's raining today. It's cold. Bring a jacket!", es: "Hoy llueve. Hace frío. ¡Trae una chaqueta!" }, recallRound: true },
        { text: "أَنَا بَحِبّ الأَزْرَق. فِيه مَقَاس أَكْبَر؟ (ana baḥebb el-azraʼ. fiih maʼaas akbar?)", speechLang: "ar-EG", meaning: { ko: "파란색이 좋아요. 더 큰 사이즈 있어요?", en: "I like the blue one. Do you have a bigger size?", es: "Me gusta el azul. ¿Tiene una talla más grande?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Unit 2 이집트 아랍어 총복습! 숫자/나이(3andak kaam sana?), 요일(en-naharda eeh?), 시간(es-saa3a kaam?), 날씨(el-gaww 3aamel eeh?), 색상/크기(da lawno eeh? maʼaas?).", en: "Pattern: Unit 2 Egyptian Arabic review! Numbers/age (3andak kaam sana?), days (en-naharda eeh?), time (es-saa3a kaam?), weather (el-gaww 3aamel eeh?), colours/sizes (da lawno eeh? maʼaas?).", es: "Patrón: Repaso completo de Unidad 2 en árabe egipcio. Números/edad (3andak kaam sana?), días (en-naharda eeh?), hora (es-saa3a kaam?), clima (el-gaww 3aamel eeh?), colores/tallas (da lawno eeh?)." },
          examples: { ko: "أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة. النَّهَارْدَه الْجُمْعَة. (나이+요일 연결)\nالسَّاعَة تَلَاتَة وْنُص. النَّهَارْدَه بِتْمَطَّر. (시간+날씨 연결)\nأَنَا بَحِبّ الأَزْرَق. فِيه مَقَاس أَكْبَر؟ (색상+크기 연결)", en: "ana 3andi khamsa we-3eshreen sana. en-naharda el-gom3a. (Connecting age + day.)\nes-saa3a talaata we-noṣ. en-naharda betmaṭṭar. (Connecting time + weather.)\nana baḥebb el-azraʼ. fiih maʼaas akbar? (Connecting colour + size.)", es: "ana 3andi khamsa we-3eshreen sana. en-naharda el-gom3a. (Conectando edad + día.)\nes-saa3a talaata we-noṣ. en-naharda betmaṭṭar. (Conectando hora + clima.)\nana baḥebb el-azraʼ. fiih maʼaas akbar? (Conectando color + talla.)" },
          mistakes: { ko: "❌ أَنَا خَمْسَة وْعِشْرِين سَنَة. (3andi 빠짐)\n✅ أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة.\n\n❌ السَّاعَة سَبْعَة نُص. ↔ السَّاعَة سَبْعَة وْنُص.\n✅ 반은 'we-noṣ'(와 누스), 비교는 'akbar' 한 단어!", en: "❌ ana khamsa we-3eshreen sana. (missing 3andi)\n✅ ana 3andi khamsa we-3eshreen sana.\n\n❌ es-saa3a sab3a noṣ.\n✅ es-saa3a sab3a we-noṣ. (Half = 'we-noṣ' with 'and'; comparative = one word 'akbar'!)", es: "❌ ana khamsa we-3eshreen sana. (falta 3andi)\n✅ ana 3andi khamsa we-3eshreen sana.\n\n❌ es-saa3a sab3a noṣ.\n✅ es-saa3a sab3a we-noṣ. (Media = 'we-noṣ' con 'y'; comparativo = una palabra 'akbar'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 이집트 아랍어 핵심 정리! 숫자는 '-taashar/-een' 블록, 나이엔 'عَنْدِي'(3andi), 요일엔 'yoom', 시간은 'es-saa3a + we-noṣ', 날씨는 'ed-donya + 형용사', 비교는 'akbar'. 이 단서들이면 Unit 2 완벽 클리어!", en: "Detective Rudy's tip: Egyptian Arabic cheat sheet! Numbers = '-taashar/-een' blocks, age = '3andi', days = 'yoom', time = 'es-saa3a + we-noṣ', weather = 'ed-donya + adjective', compare = 'akbar'. These clues solve Unit 2!", es: "Consejo del detective Rudy: Resumen del árabe egipcio. Números = bloques '-taashar/-een', edad = '3andi', días = 'yoom', hora = 'es-saa3a + we-noṣ', clima = 'ed-donya + adjetivo', comparar = 'akbar'. ¡Estas pistas resuelven la Unidad 2!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "عَنْدَك كَام ___؟", answer: "سَنَة", options: ["سَنَة", "اِسْم", "بَلَد"], fullSentence: "عَنْدَك كَام سَنَة؟", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
          { type: "select", promptWithBlank: "السَّاعَة ___؟", answer: "كَام", options: ["كَام", "إِيه", "فِين"], fullSentence: "السَّاعَة كَام؟", fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" } },
          { type: "input", promptWithBlank: "الْجَوّ عَامِل ___ النَّهَارْدَه؟", answer: "إِيه", fullSentence: "الْجَوّ عَامِل إِيه النَّهَارْدَه؟", fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather?", es: "¿Cómo está el clima?" } },
          { type: "input", promptWithBlank: "النَّهَارْدَه ___؟", answer: "إِيه", fullSentence: "النَّهَارْدَه إِيه؟", fullSentenceMeaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it?", es: "¿Qué día es hoy?" } },
          { type: "input", promptWithBlank: "فِيه مَقَاس ___؟", answer: "أَكْبَر", fullSentence: "فِيه مَقَاس أَكْبَر؟", fullSentenceMeaning: { ko: "이거 더 큰 사이즈 있어요?", en: "Do you have a bigger size?", es: "¿Tiene una talla más grande?" } },
          { type: "listening", audioText: "أَنَا بَحِبّ الأَزْرَق. فِيه مَقَاس أَكْبَر؟", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["أَنَا بَحِبّ الأَزْرَق. فِيه مَقَاس أَكْبَر؟", "النَّهَارْدَه بِتْمَطَّر. بَرْد.", "السَّاعَة كَام؟", "عَنْدَك كَام سَنَة؟"], correct: 0, audioOnly: true },
        ],
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: MISSION TALK (Unit 2)
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_CONTENT_UNIT2: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  day_7: {
    english: { situation: { ko: "박물관 입구에서 새 동료의 연락처를 교환하고 있습니다. 숫자와 나이에 대해 이야기해보세요!", en: "Exchanging contact info with a new colleague at the museum entrance. Talk about numbers and age!", es: "Intercambiando información de contacto con un colega nuevo. ¡Habla de números y edad!" }, gptPrompt: "You are Rudy exchanging contact information with your partner at the museum. Simple A1 {targetLang}. Practice: 1) ask their age 2) share your age 3) exchange phone numbers (spell out each digit) 4) count items together (how many paintings, how many rooms). Keep very simple. Celebrate when they get numbers right.", speechLang: "en-GB", suggestedAnswers: ["I'm twenty-five years old.", "My phone number is ___.", "How old are you?", "One, two, three...", "There are five paintings."] },
    spanish: { situation: { ko: "박물관 입구에서 새 동료의 연락처를 교환하고 있습니다.", en: "Exchanging contact info at the museum.", es: "Intercambiando información de contacto." }, gptPrompt: "You are Rudy exchanging contact information with your partner. Simple A1 {targetLang}. Practice: 1) ask their age 2) exchange phone numbers 3) count items together. Keep very simple.", speechLang: "es-ES", suggestedAnswers: ["Tengo veinticinco años.", "Mi número de teléfono es ___.", "¿Cuántos años tienes?", "Uno, dos, tres...", "Hay cinco cuadros."] },
    korean: { situation: { ko: "박물관 입구에서 새 동료의 연락처를 교환하고 있습니다.", en: "Exchanging contact info at the museum.", es: "Intercambiando información de contacto." }, gptPrompt: "You are Rudy exchanging contact information with your partner. Simple A1 {targetLang}. Practice: 1) ask their age 2) exchange phone numbers 3) count items together. Keep very simple.", speechLang: "ko-KR", suggestedAnswers: ["저는 스물다섯 살이에요.", "제 전화번호는 ___이에요.", "몇 살이에요?", "하나, 둘, 셋...", "그림이 다섯 개 있어요."] },
    indonesian: { situation: { ko: "박물관 입구에서 새 동료의 연락처를 교환하고 있습니다.", en: "Exchanging contact info at the museum.", es: "Intercambiando información de contacto." }, gptPrompt: "You are Rudy exchanging contact information with your partner. Simple A1 {targetLang}. Practice: 1) ask their age ('Berapa umur Anda?') 2) exchange phone numbers (spell out each digit: nol, satu, dua...) 3) count items together. Keep very simple.", speechLang: "id-ID", suggestedAnswers: ["Saya berumur dua puluh lima tahun.", "Nomor telepon saya ___.", "Berapa umur Anda?", "Satu, dua, tiga...", "Ada lima lukisan."] },
    arabic: { situation: { ko: "박물관 입구에서 새 동료의 연락처를 교환하고 있습니다.", en: "Exchanging contact info at the museum.", es: "Intercambiando información de contacto." }, gptPrompt: "You are Rudy exchanging contact information with your partner. Simple A1 Egyptian Colloquial Arabic. Practice: 1) ask their age ('3andak kaam sana?') 2) exchange phone numbers (spell out each digit: ṣefr, waaḥed, etneen...) 3) count items together. Keep very simple.", speechLang: "ar-EG", suggestedAnswers: ["أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة. (ana 3andi khamsa we-3eshreen sana.)", "نِمْرِة تِلِيفُونِي ___. (nemret telefoni ___.)", "عَنْدَك كَام سَنَة؟ (3andak kaam sana?)", "وَاحِد، اِتْنِين، تَلَاتَة... (waaḥed, etneen, talaata...)", "فِيه خَمْس لُوحَات. (fiih khams looḥaat.)"] },
  },

  day_8: {
    english: { situation: { ko: "루디와 한 주의 일정을 계획하고 있습니다. 요일에 대해 이야기해보세요!", en: "Planning the week's schedule with Rudy. Talk about days of the week!", es: "Planificando la semana con Rudy. ¡Habla de los días!" }, gptPrompt: "You are Rudy planning the week with your partner at the museum. Simple A1 {targetLang}. Practice: 1) asking what day it is 2) talking about work schedule (Monday to Friday) 3) making plans for the weekend 4) setting a meeting day. Keep very simple.", speechLang: "en-GB", suggestedAnswers: ["Today is Monday.", "I work from Monday to Friday.", "What are you doing this weekend?", "See you on Wednesday!", "What day is it today?"] },
    spanish: { situation: { ko: "루디와 한 주의 일정을 계획하고 있습니다.", en: "Planning the week with Rudy.", es: "Planificando la semana con Rudy." }, gptPrompt: "You are Rudy planning the week with your partner. Simple A1 {targetLang}. Practice: days of the week, work schedule, weekend plans, setting meeting days. Keep simple.", speechLang: "es-ES", suggestedAnswers: ["Hoy es lunes.", "Trabajo de lunes a viernes.", "¿Qué haces este fin de semana?", "¡Te veo el miércoles!", "¿Qué día es hoy?"] },
    korean: { situation: { ko: "루디와 한 주의 일정을 계획하고 있습니다.", en: "Planning the week with Rudy.", es: "Planificando la semana con Rudy." }, gptPrompt: "You are Rudy planning the week with your partner. Simple A1 {targetLang}. Practice: days, schedule, weekend plans, meeting days. Keep simple.", speechLang: "ko-KR", suggestedAnswers: ["오늘은 월요일이에요.", "월요일부터 금요일까지 일해요.", "이번 주말에 뭐 해?", "수요일에 봐요!", "오늘 무슨 요일이에요?"] },
    indonesian: { situation: { ko: "루디와 한 주의 일정을 계획하고 있습니다.", en: "Planning the week with Rudy.", es: "Planificando la semana con Rudy." }, gptPrompt: "You are Rudy planning the week with your partner. Simple A1 {targetLang}. Practice: days of the week (hari Senin, Selasa...), work schedule (dari Senin sampai Jumat), weekend plans, setting meeting days. Keep simple.", speechLang: "id-ID", suggestedAnswers: ["Hari ini hari Senin.", "Saya bekerja dari Senin sampai Jumat.", "Apa rencana Anda akhir pekan ini?", "Sampai jumpa hari Rabu!", "Hari ini hari apa?"] },
    arabic: { situation: { ko: "루디와 한 주의 일정을 계획하고 있습니다.", en: "Planning the week with Rudy.", es: "Planificando la semana con Rudy." }, gptPrompt: "You are Rudy planning the week with your partner. Simple A1 Egyptian Colloquial Arabic. Practice: days of the week (el-etneen, et-talat, el-arba3...), work schedule (men el-etneen lel-gom3a), weekend plans, setting meeting days ('yoom el-arba3'). Keep simple.", speechLang: "ar-EG", suggestedAnswers: ["النَّهَارْدَه الِاتْنِين. (en-naharda el-etneen.)", "أَنَا بَشْتَغَل مِن الِاتْنِين لِلْجُمْعَة. (ana bashtaghal men el-etneen lel-gom3a.)", "هَتْعْمِل إِيه آخِر الأُسْبُوع؟ (hat3mel eeh aakher el-osboo3?)", "أَشُوفَك يَوْم الأَرْبَع! (ashoofak yoom el-arba3!)", "النَّهَارْدَه إِيه؟ (en-naharda eeh?)"] },
  },

  day_9: {
    english: { situation: { ko: "박물관에서 투어 시간을 확인하고 일정을 조율하고 있습니다. 시간 표현을 연습해보세요!", en: "Checking tour times at the museum and coordinating schedules. Practice telling time!", es: "Verificando horarios de tours. ¡Practica decir la hora!" }, gptPrompt: "You are Rudy at the museum information desk coordinating tour times with your partner. Simple A1 {targetLang}. Practice: 1) asking what time it is 2) saying tour times (at two o'clock, at half past three) 3) talking about daily routine (wake up at 7, eat lunch at 12). Keep very simple.", speechLang: "en-GB", suggestedAnswers: ["What time is it?", "It's three o'clock.", "The tour is at half past two.", "I wake up at seven.", "The museum closes at five."] },
    spanish: { situation: { ko: "박물관에서 투어 시간을 확인하고 있습니다.", en: "Checking tour times at the museum.", es: "Verificando horarios de tours en el museo." }, gptPrompt: "You are Rudy at the museum coordinating tour times. Simple A1 {targetLang}. Practice: asking time, saying tour times, daily routine. Keep simple.", speechLang: "es-ES", suggestedAnswers: ["¿Qué hora es?", "Son las tres.", "El tour es a las dos y media.", "Me despierto a las siete.", "El museo cierra a las cinco."] },
    korean: { situation: { ko: "박물관에서 투어 시간을 확인하고 있습니다.", en: "Checking tour times at the museum.", es: "Verificando horarios de tours." }, gptPrompt: "You are Rudy at the museum coordinating tour times. Simple A1 {targetLang}. Practice: asking time, tour times, daily routine. Keep simple.", speechLang: "ko-KR", suggestedAnswers: ["지금 몇 시예요?", "세 시예요.", "투어는 두 시 반이에요.", "일곱 시에 일어나요.", "박물관은 다섯 시에 닫아요."] },
    indonesian: { situation: { ko: "박물관에서 투어 시간을 확인하고 있습니다.", en: "Checking tour times at the museum.", es: "Verificando horarios de tours." }, gptPrompt: "You are Rudy at the museum coordinating tour times. Simple A1 {targetLang}. Practice: asking time ('Sekarang jam berapa?'), tour times (jam dua, jam setengah tiga), daily routine. Keep simple.", speechLang: "id-ID", suggestedAnswers: ["Sekarang jam berapa?", "Sekarang jam tiga.", "Turnya jam setengah tiga.", "Saya bangun jam tujuh.", "Museum tutup jam lima."] },
    arabic: { situation: { ko: "박물관에서 투어 시간을 확인하고 있습니다.", en: "Checking tour times at the museum.", es: "Verificando horarios de tours." }, gptPrompt: "You are Rudy at the museum coordinating tour times. Simple A1 Egyptian Colloquial Arabic. Practice: asking time ('es-saa3a kaam?'), tour times (es-saa3a etneen, es-saa3a talaata we-noṣ), daily routine. Keep simple.", speechLang: "ar-EG", suggestedAnswers: ["السَّاعَة كَام؟ (es-saa3a kaam?)", "السَّاعَة تَلَاتَة. (es-saa3a talaata.)", "الْجَوْلَة السَّاعَة اِتْنِين وْنُص. (el-gawla es-saa3a etneen we-noṣ.)", "أَنَا بَصْحَى السَّاعَة سَبْعَة. (ana baṣ-ḥa es-saa3a sab3a.)", "الْمَتْحَف بِيِقْفِل السَّاعَة خَمْسَة. (el-matḥaf beyeʼfel es-saa3a khamsa.)"] },
  },

  day_10: {
    english: { situation: { ko: "루디와 함께 야외 조사를 나가기 전에 날씨를 확인하고 있습니다!", en: "Checking the weather before heading out for an outdoor investigation with Rudy!", es: "Verificando el clima antes de salir a investigar con Rudy." }, gptPrompt: "You are Rudy planning an outdoor investigation with your partner. Simple A1 {targetLang}. Practice: 1) asking about weather 2) describing weather (sunny, rainy, cold, hot) 3) deciding what to wear or bring 4) expressing weather preferences. Keep very simple and fun.", speechLang: "en-GB", suggestedAnswers: ["How's the weather today?", "It's sunny and warm.", "It's raining! Bring an umbrella.", "It's cold outside.", "I like hot weather."] },
    spanish: { situation: { ko: "야외 조사 전에 날씨를 확인하고 있습니다.", en: "Checking weather before outdoor investigation.", es: "Verificando el clima antes de investigar." }, gptPrompt: "You are Rudy planning an outdoor investigation. Simple A1 {targetLang}. Practice: weather questions, descriptions, clothing, preferences. Keep simple and fun.", speechLang: "es-ES", suggestedAnswers: ["¿Cómo está el clima hoy?", "Está soleado y cálido.", "¡Está lloviendo! Trae un paraguas.", "Hace frío afuera.", "Me gusta el clima caliente."] },
    korean: { situation: { ko: "야외 조사 전에 날씨를 확인하고 있습니다.", en: "Checking weather before investigation.", es: "Verificando el clima." }, gptPrompt: "You are Rudy planning an outdoor investigation. Simple A1 {targetLang}. Practice: weather, clothing, preferences. Keep simple.", speechLang: "ko-KR", suggestedAnswers: ["오늘 날씨 어때요?", "맑고 따뜻해요.", "비가 와요! 우산 가져가세요.", "밖이 추워요.", "더운 날씨를 좋아해요."] },
    indonesian: { situation: { ko: "야외 조사 전에 날씨를 확인하고 있습니다.", en: "Checking weather before investigation.", es: "Verificando el clima." }, gptPrompt: "You are Rudy planning an outdoor investigation. Simple A1 {targetLang}. Practice: weather (cerah, hujan, dingin, panas), clothing, preferences. Keep simple.", speechLang: "id-ID", suggestedAnswers: ["Bagaimana cuaca hari ini?", "Cuacanya cerah dan hangat.", "Hujan! Bawa payung.", "Di luar dingin.", "Saya suka cuaca panas."] },
    arabic: { situation: { ko: "야외 조사 전에 날씨를 확인하고 있습니다.", en: "Checking weather before investigation.", es: "Verificando el clima." }, gptPrompt: "You are Rudy planning an outdoor investigation. Simple A1 Egyptian Colloquial Arabic. Practice: weather (ṣaḥw, betmaṭṭar, bard, ḥarr), clothing, preferences. Keep simple.", speechLang: "ar-EG", suggestedAnswers: ["الْجَوّ عَامِل إِيه النَّهَارْدَه؟ (el-gaww 3aamel eeh en-naharda?)", "الدُّنْيَا صَحْو وْدَافِيَة. (ed-donya ṣaḥw we-dafya.)", "بِتْمَطَّر! خُد شَمْسِيَّة. (betmaṭṭar! khod shamseyya.)", "الدُّنْيَا بَرْد بَرَّه. (ed-donya bard barra.)", "أَنَا بَحِبّ الْجَوّ الْحَرّ. (ana baḥebb el-gaww el-ḥarr.)"] },
  },

  day_11: {
    english: { situation: { ko: "박물관 기념품 가게에서 선물을 고르고 있습니다. 색상과 크기에 대해 이야기해보세요!", en: "Shopping for souvenirs at the museum gift shop. Talk about colours and sizes!", es: "Comprando recuerdos en la tienda del museo. ¡Habla de colores y tallas!" }, gptPrompt: "You are Rudy at the museum gift shop helping your partner choose souvenirs. Simple A1 {targetLang}. Practice: 1) asking about colours 2) expressing colour preferences 3) asking about sizes 4) saying 'too small/big' 5) choosing an item. Make it feel like real shopping. Keep very simple.", speechLang: "en-GB", suggestedAnswers: ["What colour is this?", "I like blue.", "Do you have a bigger size?", "This is too small.", "I'll take the black one, please.", "How much is this?"] },
    spanish: { situation: { ko: "박물관 기념품 가게에서 선물을 고르고 있습니다.", en: "Shopping at the museum gift shop.", es: "Comprando en la tienda del museo." }, gptPrompt: "You are Rudy at the gift shop helping choose souvenirs. Simple A1 {targetLang}. Practice: colours, preferences, sizes, choosing items. Make it feel like real shopping.", speechLang: "es-ES", suggestedAnswers: ["¿De qué color es esto?", "Me gusta el azul.", "¿Tiene una talla más grande?", "Esto es muy pequeño.", "Me llevo el negro, por favor.", "¿Cuánto cuesta esto?"] },
    korean: { situation: { ko: "박물관 기념품 가게에서 선물을 고르고 있습니다.", en: "Shopping at the museum gift shop.", es: "Comprando en la tienda." }, gptPrompt: "You are Rudy at the gift shop helping choose souvenirs. Simple A1 {targetLang}. Practice: colours, sizes, choosing items. Make it like real shopping.", speechLang: "ko-KR", suggestedAnswers: ["이건 무슨 색이에요?", "파란색을 좋아해요.", "더 큰 사이즈 있어요?", "이건 너무 작아요.", "검은색 걸로 할게요.", "이거 얼마예요?"] },
    indonesian: { situation: { ko: "박물관 기념품 가게에서 선물을 고르고 있습니다.", en: "Shopping at the museum gift shop.", es: "Comprando en la tienda." }, gptPrompt: "You are Rudy at the gift shop helping choose souvenirs. Simple A1 {targetLang}. Practice: colours (merah, biru, hitam), sizes (lebih besar, terlalu kecil), choosing items ('Saya ambil yang ___'). Make it like real shopping.", speechLang: "id-ID", suggestedAnswers: ["Ini warna apa?", "Saya suka biru.", "Apakah ada ukuran yang lebih besar?", "Ini terlalu kecil.", "Saya ambil yang hitam.", "Ini berapa harganya?"] },
    arabic: { situation: { ko: "박물관 기념품 가게에서 선물을 고르고 있습니다.", en: "Shopping at the museum gift shop.", es: "Comprando en la tienda." }, gptPrompt: "You are Rudy at the gift shop helping choose souvenirs. Simple A1 Egyptian Colloquial Arabic. Practice: colours (aḥmar, azraʼ, aswad), sizes (akbar, ṣoghayyar awi), choosing items ('haakhod el-___'). Make it like real shopping.", speechLang: "ar-EG", suggestedAnswers: ["دَه لَوْنُه إِيه؟ (da lawno eeh?)", "أَنَا بَحِبّ الأَزْرَق. (ana baḥebb el-azraʼ.)", "فِيه مَقَاس أَكْبَر؟ (fiih maʼaas akbar?)", "دَه صُغَيَّر أَوِي. (da ṣoghayyar awi.)", "هَاخُد الأَسْوَد. (haakhod el-aswad.)", "دَه بِكَام؟ (da bekaam?)"] },
  },

  day_12: {
    english: { situation: { ko: "박물관 주간 마무리 파티에서 이번 주에 배운 모든 표현을 사용해보세요! 숫자, 요일, 시간, 날씨, 색상까지!", en: "End-of-week party at the museum! Use ALL expressions: numbers, days, time, weather, colours!", es: "¡Fiesta de fin de semana en el museo! Usa TODO: números, días, hora, clima, colores." }, gptPrompt: "You are Rudy hosting an end-of-week gathering at the museum. Test ALL of Unit 2 in a natural A1 {targetLang} conversation. Cover: 1) numbers and age 2) days of the week and scheduling 3) telling time 4) weather talk 5) colours and sizes (at the snack/gift table). Also reinforce Unit 1 survival phrases naturally (How are you? Where is the bathroom?). Create 2-3 mini-scenarios to test everything. Be encouraging but thorough.", speechLang: "en-GB", suggestedAnswers: ["I'm twenty-five years old.", "Today is Friday!", "It's half past three.", "It's sunny and warm today.", "I like the blue one.", "How much is this?", "Where is the bathroom?"] },
    spanish: { situation: { ko: "박물관 주간 마무리 파티입니다!", en: "End-of-week party! Use everything!", es: "¡Fiesta de fin de semana! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting an end-of-week gathering. Test ALL of Unit 2 in A1 {targetLang}: numbers/age, days, time, weather, colours/sizes. Also reinforce Unit 1. Create 2-3 mini-scenarios. Be encouraging.", speechLang: "es-ES", suggestedAnswers: ["Tengo veinticinco años.", "¡Hoy es viernes!", "Son las tres y media.", "Está soleado y cálido.", "Me gusta el azul.", "¿Cuánto cuesta esto?", "¿Dónde está el baño?"] },
    korean: { situation: { ko: "박물관 주간 마무리 파티입니다! 이번 주 배운 모든 표현을 사용해보세요!", en: "End-of-week party! Use everything!", es: "¡Fiesta! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting an end-of-week gathering. Test ALL of Unit 2 in A1 {targetLang}: numbers/age, days, time, weather, colours/sizes. Also reinforce Unit 1. Create 2-3 mini-scenarios. Be encouraging.", speechLang: "ko-KR", suggestedAnswers: ["저는 스물다섯 살이에요.", "오늘은 금요일이에요!", "세 시 반이에요.", "맑고 따뜻해요.", "파란색이 좋아요.", "이거 얼마예요?", "화장실이 어디예요?"] },
    indonesian: { situation: { ko: "박물관 주간 마무리 파티입니다! 이번 주 배운 모든 표현을 사용해보세요!", en: "End-of-week party! Use everything!", es: "¡Fiesta! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting an end-of-week gathering. Test ALL of Unit 2 in A1 {targetLang}: numbers/age, days, time, weather, colours/sizes. Also reinforce Unit 1 survival phrases naturally (Apa kabar? Di mana toilet?). Create 2-3 mini-scenarios. Be encouraging.", speechLang: "id-ID", suggestedAnswers: ["Saya berumur dua puluh lima tahun.", "Hari ini hari Jumat!", "Sekarang jam setengah empat.", "Cuacanya cerah dan hangat.", "Saya suka yang biru.", "Ini berapa harganya?", "Di mana toilet?"] },
    arabic: { situation: { ko: "박물관 주간 마무리 파티입니다! 이번 주 배운 모든 표현을 사용해보세요!", en: "End-of-week party! Use everything!", es: "¡Fiesta! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting an end-of-week gathering. Test ALL of Unit 2 in A1 Egyptian Colloquial Arabic: numbers/age, days, time, weather, colours/sizes. Also reinforce Unit 1 survival phrases naturally (Ezzayyak? Feen el-ḥammaam?). Create 2-3 mini-scenarios. Be encouraging.", speechLang: "ar-EG", suggestedAnswers: ["أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة. (ana 3andi khamsa we-3eshreen sana.)", "النَّهَارْدَه الْجُمْعَة! (en-naharda el-gom3a!)", "السَّاعَة تَلَاتَة وْنُص. (es-saa3a talaata we-noṣ.)", "الدُّنْيَا صَحْو وْدَافِيَة. (ed-donya ṣaḥw we-dafya.)", "أَنَا بَحِبّ الأَزْرَق. (ana baḥebb el-azraʼ.)", "دَه بِكَام؟ (da bekaam?)", "فِين الْحَمَّام؟ (feen el-ḥammaam?)"] },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: REVIEW (Unit 2) — English only shown for brevity, pattern identical for ES/KO
// ═══════════════════════════════════════════════════════════════════════════════

export const REVIEW_CONTENT_UNIT2: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  day_7: {
    english: [
      { type: "speak", sentence: "Sorry, I don't understand. Can you say that again?", speechLang: "en-GB", meaning: { ko: "이해를 못 했어요. 다시 한번 말해주세요.", en: "Sorry, I don't understand. Can you say that again?", es: "No entiendo. ¿Puede repetir?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "How ___ is this?", answer: "much", options: ["much", "many", "old"], fullSentence: "How much is this?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta?" }, isYesterdayReview: true },
      { type: "speak", sentence: "I have two dogs and three cats at home.", speechLang: "en-GB", meaning: { ko: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", en: "I have two dogs and three cats at home.", es: "Tengo dos perros y tres gatos en casa." } },
      { type: "fill_blank", promptWithBlank: "How ___ are you?", answer: "old", options: ["old", "much", "many"], fullSentence: "How old are you?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
      { type: "speak", sentence: "I'm twenty-five years old.", speechLang: "en-GB", meaning: { ko: "저는 스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." } },
    ],
    spanish: [
      { type: "speak", sentence: "No entiendo. ¿Puede repetir eso?", speechLang: "es-ES", meaning: { ko: "이해를 못 했어요. 다시 말해주세요.", en: "I don't understand. Can you repeat?", es: "No entiendo. ¿Puede repetir eso?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Cuánto ___ esto?", answer: "cuesta", options: ["cuesta", "es", "tiene"], fullSentence: "¿Cuánto cuesta esto?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Tengo dos perros y tres gatos en casa.", speechLang: "es-ES", meaning: { ko: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", en: "I have two dogs and three cats at home.", es: "Tengo dos perros y tres gatos en casa." } },
      { type: "fill_blank", promptWithBlank: "¿Cuántos ___ tienes?", answer: "años", options: ["años", "días", "veces"], fullSentence: "¿Cuántos años tienes?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
      { type: "speak", sentence: "Tengo veinticinco años.", speechLang: "es-ES", meaning: { ko: "저는 스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." } },
    ],
    korean: [
      { type: "speak", sentence: "이해를 못 했어요. 다시 한번 말해 주시겠어요?", speechLang: "ko-KR", meaning: { ko: "이해를 못 했어요.", en: "I don't understand. Can you repeat?", es: "No entiendo. ¿Puede repetir?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "이거 ___예요?", answer: "얼마", options: ["얼마", "뭐", "어디"], fullSentence: "이거 얼마예요?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much?", es: "¿Cuánto cuesta?" }, isYesterdayReview: true },
      { type: "speak", sentence: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", speechLang: "ko-KR", meaning: { ko: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", en: "I have two dogs and three cats at home.", es: "Tengo dos perros y tres gatos en casa." } },
      { type: "fill_blank", promptWithBlank: "몇 ___이에요?", answer: "살", options: ["살", "개", "번"], fullSentence: "몇 살이에요?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
      { type: "speak", sentence: "저는 스물다섯 살이에요.", speechLang: "ko-KR", meaning: { ko: "저는 스물다섯 살이에요.", en: "I'm 25 years old.", es: "Tengo 25 años." } },
    ],
    indonesian: [
      { type: "speak", sentence: "Maaf, saya tidak mengerti. Bisa tolong ulangi?", speechLang: "id-ID", meaning: { ko: "이해를 못 했어요. 다시 한번 말해주세요.", en: "Sorry, I don't understand. Can you say that again?", es: "No entiendo. ¿Puede repetir?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Ini ___ harganya?", answer: "berapa", options: ["berapa", "apa", "mana"], fullSentence: "Ini berapa harganya?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Saya punya dua anjing dan tiga kucing di rumah.", speechLang: "id-ID", meaning: { ko: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", en: "I have two dogs and three cats at home.", es: "Tengo dos perros y tres gatos en casa." } },
      { type: "fill_blank", promptWithBlank: "Berapa ___ Anda?", answer: "umur", options: ["umur", "nama", "kota"], fullSentence: "Berapa umur Anda?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
      { type: "speak", sentence: "Saya berumur dua puluh lima tahun.", speechLang: "id-ID", meaning: { ko: "저는 스물다섯 살이에요.", en: "I'm 25 years old.", es: "Tengo 25 años." } },
    ],
    arabic: [
      { type: "speak", sentence: "مَعْلِش، أَنَا مِش فَاهِم. مُمْكِن تِقُول تَانِي؟ (ma3lesh, ana mish faahem. momken teʼool taani?)", speechLang: "ar-EG", meaning: { ko: "이해를 못 했어요. 다시 한번 말해주세요.", en: "Sorry, I don't understand. Can you say that again?", es: "No entiendo. ¿Puede repetir?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "دَه ___؟", answer: "بِكَام", options: ["بِكَام", "إِيه", "فِين"], fullSentence: "دَه بِكَام؟", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta?" }, isYesterdayReview: true },
      { type: "speak", sentence: "عَنْدِي كَلْبِين وْتَلَات قُطَط فِي الْبيت.", speechLang: "ar-EG", meaning: { ko: "집에 강아지 두 마리, 고양이 세 마리가 있어요.", en: "I have two dogs and three cats at home.", es: "Tengo dos perros y tres gatos en casa." } },
      { type: "fill_blank", promptWithBlank: "عَنْدَك كَام ___؟", answer: "سَنَة", options: ["سَنَة", "اِسْم", "بَلَد"], fullSentence: "عَنْدَك كَام سَنَة؟", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" } },
      { type: "speak", sentence: "أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة.", speechLang: "ar-EG", meaning: { ko: "저는 스물다섯 살이에요.", en: "I'm 25 years old.", es: "Tengo 25 años." } },
    ],
  },

  day_8: {
    english: [
      { type: "speak", sentence: "I'm twenty-five years old.", speechLang: "en-GB", meaning: { ko: "저는 스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "How ___ are you?", answer: "old", options: ["old", "much", "many"], fullSentence: "How old are you?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Today is Monday. See you on Friday!", speechLang: "en-GB", meaning: { ko: "오늘은 월요일이에요. 금요일에 봐요!", en: "Today is Monday. See you on Friday!", es: "Hoy es lunes. ¡Te veo el viernes!" } },
      { type: "fill_blank", promptWithBlank: "I work ___ Monday to Friday.", answer: "from", options: ["from", "on", "at"], fullSentence: "I work from Monday to Friday.", fullSentenceMeaning: { ko: "월요일부터 금요일까지 일해요.", en: "I work from Monday to Friday.", es: "Trabajo de lunes a viernes." } },
      { type: "speak", sentence: "What are you doing this weekend?", speechLang: "en-GB", meaning: { ko: "이번 주말에 뭐 해?", en: "What are you doing this weekend?", es: "¿Qué haces este fin de semana?" } },
    ],
    spanish: [
      { type: "speak", sentence: "Tengo veinticinco años.", speechLang: "es-ES", meaning: { ko: "저는 스물다섯 살이에요.", en: "I'm 25.", es: "Tengo veinticinco años." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Cuántos ___ tienes?", answer: "años", options: ["años", "días", "veces"], fullSentence: "¿Cuántos años tienes?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Hoy es lunes. ¡Te veo el viernes!", speechLang: "es-ES", meaning: { ko: "오늘은 월요일. 금요일에 봐요!", en: "Today is Monday. See you Friday!", es: "Hoy es lunes. ¡Te veo el viernes!" } },
      { type: "fill_blank", promptWithBlank: "Trabajo ___ lunes a viernes.", answer: "de", options: ["de", "en", "por"], fullSentence: "Trabajo de lunes a viernes.", fullSentenceMeaning: { ko: "월~금 일해요.", en: "I work Monday to Friday.", es: "Trabajo de lunes a viernes." } },
      { type: "speak", sentence: "¿Qué haces este fin de semana?", speechLang: "es-ES", meaning: { ko: "이번 주말에 뭐 해?", en: "What are you doing this weekend?", es: "¿Qué haces este fin de semana?" } },
    ],
    korean: [
      { type: "speak", sentence: "저는 스물다섯 살이에요.", speechLang: "ko-KR", meaning: { ko: "저는 스물다섯 살이에요.", en: "I'm 25.", es: "Tengo 25 años." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "몇 ___이에요?", answer: "살", options: ["살", "개", "번"], fullSentence: "몇 살이에요?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old?", es: "¿Cuántos años?" }, isYesterdayReview: true },
      { type: "speak", sentence: "오늘은 월요일이에요. 금요일에 봐요!", speechLang: "ko-KR", meaning: { ko: "오늘은 월요일. 금요일에 봐요!", en: "Today is Monday. See you Friday!", es: "Hoy es lunes. ¡Nos vemos el viernes!" } },
      { type: "fill_blank", promptWithBlank: "월요일___ 금요일까지 일해요.", answer: "부터", options: ["부터", "에서", "에"], fullSentence: "월요일부터 금요일까지 일해요.", fullSentenceMeaning: { ko: "월~금 일해요.", en: "I work Mon-Fri.", es: "Trabajo lunes a viernes." } },
      { type: "speak", sentence: "이번 주말에 뭐 해?", speechLang: "ko-KR", meaning: { ko: "이번 주말에 뭐 해?", en: "What are you doing this weekend?", es: "¿Qué haces este fin de semana?" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Saya berumur dua puluh lima tahun.", speechLang: "id-ID", meaning: { ko: "저는 스물다섯 살이에요.", en: "I'm 25.", es: "Tengo 25 años." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Berapa ___ Anda?", answer: "umur", options: ["umur", "nama", "kota"], fullSentence: "Berapa umur Anda?", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Hari ini hari Senin. Sampai jumpa hari Jumat!", speechLang: "id-ID", meaning: { ko: "오늘은 월요일. 금요일에 봐요!", en: "Today is Monday. See you Friday!", es: "Hoy es lunes. ¡Nos vemos el viernes!" } },
      { type: "fill_blank", promptWithBlank: "Saya bekerja ___ Senin sampai Jumat.", answer: "dari", options: ["dari", "di", "ke"], fullSentence: "Saya bekerja dari Senin sampai Jumat.", fullSentenceMeaning: { ko: "월~금 일해요.", en: "I work Mon-Fri.", es: "Trabajo lunes a viernes." } },
      { type: "speak", sentence: "Apa rencana Anda akhir pekan ini?", speechLang: "id-ID", meaning: { ko: "이번 주말에 뭐 해?", en: "What are you doing this weekend?", es: "¿Qué haces este fin de semana?" } },
    ],
    arabic: [
      { type: "speak", sentence: "أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة.", speechLang: "ar-EG", meaning: { ko: "저는 스물다섯 살이에요.", en: "I'm 25.", es: "Tengo 25 años." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "عَنْدَك كَام ___؟", answer: "سَنَة", options: ["سَنَة", "اِسْم", "بَلَد"], fullSentence: "عَنْدَك كَام سَنَة؟", fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" }, isYesterdayReview: true },
      { type: "speak", sentence: "النَّهَارْدَه الِاتْنِين. أَشُوفَك يَوْم الْجُمْعَة!", speechLang: "ar-EG", meaning: { ko: "오늘은 월요일. 금요일에 봐요!", en: "Today is Monday. See you Friday!", es: "Hoy es lunes. ¡Nos vemos el viernes!" } },
      { type: "fill_blank", promptWithBlank: "أَنَا بَشْتَغَل ___ الِاتْنِين لِلْجُمْعَة.", answer: "مِن", options: ["مِن", "فِي", "عَلَى"], fullSentence: "أَنَا بَشْتَغَل مِن الِاتْنِين لِلْجُمْعَة.", fullSentenceMeaning: { ko: "월~금 일해요.", en: "I work Mon-Fri.", es: "Trabajo lunes a viernes." } },
      { type: "speak", sentence: "هَتْعْمِل إِيه آخِر الأُسْبُوع؟", speechLang: "ar-EG", meaning: { ko: "이번 주말에 뭐 해?", en: "What are you doing this weekend?", es: "¿Qué haces este fin de semana?" } },
    ],
  },

  day_9: {
    english: [
      { type: "speak", sentence: "Today is Wednesday. See you on Friday!", speechLang: "en-GB", meaning: { ko: "오늘은 수요일. 금요일에 봐요!", en: "Today is Wednesday. See you on Friday!", es: "Hoy es miércoles. ¡Te veo el viernes!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "What ___ is it today?", answer: "day", options: ["day", "time", "date"], fullSentence: "What day is it today?", fullSentenceMeaning: { ko: "오늘 무슨 요일이에요?", en: "What day is it today?", es: "¿Qué día es hoy?" }, isYesterdayReview: true },
      { type: "speak", sentence: "What time is it? It's three o'clock.", speechLang: "en-GB", meaning: { ko: "몇 시예요? 세 시예요.", en: "What time is it? It's three o'clock.", es: "¿Qué hora es? Son las tres." } },
      { type: "fill_blank", promptWithBlank: "It's ___ past seven.", answer: "half", options: ["half", "quarter", "full"], fullSentence: "It's half past seven.", fullSentenceMeaning: { ko: "일곱 시 반이에요.", en: "It's half past seven.", es: "Son las siete y media." } },
      { type: "speak", sentence: "I wake up at seven every day.", speechLang: "en-GB", meaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at seven every day.", es: "Me despierto a las siete." } },
    ],
    spanish: [
      { type: "speak", sentence: "Hoy es miércoles. ¡Te veo el viernes!", speechLang: "es-ES", meaning: { ko: "오늘은 수요일. 금요일에 봐요!", en: "Wednesday. See you Friday!", es: "Hoy es miércoles. ¡Te veo el viernes!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Qué ___ es hoy?", answer: "día", options: ["día", "hora", "fecha"], fullSentence: "¿Qué día es hoy?", fullSentenceMeaning: { ko: "오늘 무슨 요일?", en: "What day is today?", es: "¿Qué día es hoy?" }, isYesterdayReview: true },
      { type: "speak", sentence: "¿Qué hora es? Son las tres.", speechLang: "es-ES", meaning: { ko: "몇 시예요? 세 시예요.", en: "What time? It's three.", es: "¿Qué hora es? Son las tres." } },
      { type: "fill_blank", promptWithBlank: "Son las siete y ___.", answer: "media", options: ["media", "mitad", "medio"], fullSentence: "Son las siete y media.", fullSentenceMeaning: { ko: "일곱 시 반이에요.", en: "It's 7:30.", es: "Son las siete y media." } },
      { type: "speak", sentence: "Me despierto a las siete todos los días.", speechLang: "es-ES", meaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at 7 every day.", es: "Me despierto a las siete todos los días." } },
    ],
    korean: [
      { type: "speak", sentence: "오늘은 수요일이에요. 금요일에 봐요!", speechLang: "ko-KR", meaning: { ko: "오늘은 수요일. 금요일에 봐요!", en: "Wednesday. See you Friday!", es: "Miércoles. ¡Nos vemos el viernes!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "오늘 무슨 ___이에요?", answer: "요일", options: ["요일", "날", "시간"], fullSentence: "오늘 무슨 요일이에요?", fullSentenceMeaning: { ko: "오늘 무슨 요일?", en: "What day?", es: "¿Qué día?" }, isYesterdayReview: true },
      { type: "speak", sentence: "지금 몇 시예요? 세 시예요.", speechLang: "ko-KR", meaning: { ko: "몇 시예요? 세 시예요.", en: "What time? 3 o'clock.", es: "¿Qué hora? Las tres." } },
      { type: "fill_blank", promptWithBlank: "일곱 시 ___이에요.", answer: "반", options: ["반", "절", "중"], fullSentence: "일곱 시 반이에요.", fullSentenceMeaning: { ko: "일곱 시 반이에요.", en: "It's 7:30.", es: "Son las 7 y media." } },
      { type: "speak", sentence: "매일 일곱 시에 일어나요.", speechLang: "ko-KR", meaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at 7.", es: "Me despierto a las 7." } },
    ],
    indonesian: [
      { type: "speak", sentence: "Hari ini hari Rabu. Sampai jumpa hari Jumat!", speechLang: "id-ID", meaning: { ko: "오늘은 수요일. 금요일에 봐요!", en: "Wednesday. See you Friday!", es: "Miércoles. ¡Nos vemos el viernes!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Hari ini hari ___?", answer: "apa", options: ["apa", "mana", "siapa"], fullSentence: "Hari ini hari apa?", fullSentenceMeaning: { ko: "오늘 무슨 요일?", en: "What day?", es: "¿Qué día?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Sekarang jam berapa? Sekarang jam tiga.", speechLang: "id-ID", meaning: { ko: "몇 시예요? 세 시예요.", en: "What time? 3 o'clock.", es: "¿Qué hora? Las tres." } },
      { type: "fill_blank", promptWithBlank: "Sekarang jam ___ delapan.", answer: "setengah", options: ["setengah", "lebih", "kurang"], fullSentence: "Sekarang jam setengah delapan.", fullSentenceMeaning: { ko: "일곱 시 반이에요.", en: "It's 7:30.", es: "Son las 7 y media." } },
      { type: "speak", sentence: "Saya bangun jam tujuh setiap hari.", speechLang: "id-ID", meaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at 7.", es: "Me despierto a las 7." } },
    ],
    arabic: [
      { type: "speak", sentence: "النَّهَارْدَه الأَرْبَع. أَشُوفَك يَوْم الْجُمْعَة!", speechLang: "ar-EG", meaning: { ko: "오늘은 수요일. 금요일에 봐요!", en: "Wednesday. See you Friday!", es: "Miércoles. ¡Nos vemos el viernes!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "النَّهَارْدَه ___؟", answer: "إِيه", options: ["إِيه", "فِين", "مِين"], fullSentence: "النَّهَارْدَه إِيه؟", fullSentenceMeaning: { ko: "오늘 무슨 요일?", en: "What day?", es: "¿Qué día?" }, isYesterdayReview: true },
      { type: "speak", sentence: "السَّاعَة كَام؟ السَّاعَة تَلَاتَة.", speechLang: "ar-EG", meaning: { ko: "몇 시예요? 세 시예요.", en: "What time? 3 o'clock.", es: "¿Qué hora? Las tres." } },
      { type: "fill_blank", promptWithBlank: "السَّاعَة سَبْعَة وْ ___.", answer: "نُص", options: ["نُص", "رُبْع", "تِلْت"], fullSentence: "السَّاعَة سَبْعَة وْنُص.", fullSentenceMeaning: { ko: "일곱 시 반이에요.", en: "It's 7:30.", es: "Son las 7 y media." } },
      { type: "speak", sentence: "أَنَا بَصْحَى السَّاعَة سَبْعَة كُلّ يَوْم.", speechLang: "ar-EG", meaning: { ko: "매일 일곱 시에 일어나요.", en: "I wake up at 7.", es: "Me despierto a las 7." } },
    ],
  },

  day_10: {
    english: [
      { type: "speak", sentence: "It's three o'clock. The meeting is at four.", speechLang: "en-GB", meaning: { ko: "세 시예요. 회의는 네 시예요.", en: "It's three. Meeting at four.", es: "Son las tres. Reunión a las cuatro." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "What ___ is it?", answer: "time", options: ["time", "day", "hour"], fullSentence: "What time is it?", fullSentenceMeaning: { ko: "몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" }, isYesterdayReview: true },
      { type: "speak", sentence: "It's sunny and warm today.", speechLang: "en-GB", meaning: { ko: "오늘 맑고 따뜻해요.", en: "It's sunny and warm today.", es: "Hoy está soleado y cálido." } },
      { type: "fill_blank", promptWithBlank: "It's ___ today.", answer: "raining", options: ["raining", "rain", "rained"], fullSentence: "It's raining today.", fullSentenceMeaning: { ko: "오늘 비가 와요.", en: "It's raining today.", es: "Hoy está lloviendo." } },
      { type: "speak", sentence: "It's cold outside. Bring a jacket!", speechLang: "en-GB", meaning: { ko: "밖이 추워요. 재킷 가져가세요!", en: "It's cold outside. Bring a jacket!", es: "Hace frío. ¡Trae una chaqueta!" } },
    ],
    spanish: [
      { type: "speak", sentence: "Son las tres. La reunión es a las cuatro.", speechLang: "es-ES", meaning: { ko: "세 시. 회의는 네 시.", en: "It's 3. Meeting at 4.", es: "Son las tres. La reunión es a las cuatro." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Qué ___ es?", answer: "hora", options: ["hora", "día", "tiempo"], fullSentence: "¿Qué hora es?", fullSentenceMeaning: { ko: "몇 시예요?", en: "What time?", es: "¿Qué hora es?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Hoy está soleado y cálido.", speechLang: "es-ES", meaning: { ko: "오늘 맑고 따뜻해요.", en: "Sunny and warm.", es: "Hoy está soleado y cálido." } },
      { type: "fill_blank", promptWithBlank: "Hoy está ___.", answer: "lloviendo", options: ["lloviendo", "lluvia", "llover"], fullSentence: "Hoy está lloviendo.", fullSentenceMeaning: { ko: "오늘 비가 와요.", en: "It's raining.", es: "Hoy está lloviendo." } },
      { type: "speak", sentence: "Hace frío afuera. ¡Trae una chaqueta!", speechLang: "es-ES", meaning: { ko: "밖이 추워요. 재킷!", en: "Cold outside. Bring a jacket!", es: "Hace frío afuera. ¡Trae una chaqueta!" } },
    ],
    korean: [
      { type: "speak", sentence: "세 시예요. 회의는 네 시예요.", speechLang: "ko-KR", meaning: { ko: "세 시. 회의 네 시.", en: "3 o'clock. Meeting at 4.", es: "Las 3. Reunión a las 4." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "지금 몇 ___예요?", answer: "시", options: ["시", "일", "번"], fullSentence: "지금 몇 시예요?", fullSentenceMeaning: { ko: "몇 시예요?", en: "What time?", es: "¿Qué hora?" }, isYesterdayReview: true },
      { type: "speak", sentence: "오늘 맑고 따뜻해요.", speechLang: "ko-KR", meaning: { ko: "맑고 따뜻해요.", en: "Sunny and warm.", es: "Soleado y cálido." } },
      { type: "fill_blank", promptWithBlank: "오늘 비가 ___.", answer: "와요", options: ["와요", "가요", "해요"], fullSentence: "오늘 비가 와요.", fullSentenceMeaning: { ko: "비가 와요.", en: "It's raining.", es: "Está lloviendo." } },
      { type: "speak", sentence: "밖이 추워요. 재킷 가져가세요!", speechLang: "ko-KR", meaning: { ko: "밖이 추워요. 재킷!", en: "Cold outside. Jacket!", es: "Frío afuera. ¡Chaqueta!" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Sekarang jam tiga. Rapatnya jam empat.", speechLang: "id-ID", meaning: { ko: "세 시. 회의는 네 시.", en: "It's 3. Meeting at 4.", es: "Las 3. Reunión a las 4." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Sekarang jam ___?", answer: "berapa", options: ["berapa", "apa", "mana"], fullSentence: "Sekarang jam berapa?", fullSentenceMeaning: { ko: "몇 시예요?", en: "What time?", es: "¿Qué hora?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Cuacanya cerah dan hangat hari ini.", speechLang: "id-ID", meaning: { ko: "오늘 맑고 따뜻해요.", en: "Sunny and warm.", es: "Soleado y cálido." } },
      { type: "fill_blank", promptWithBlank: "Hari ini ___.", answer: "hujan", options: ["hujan", "cuaca", "jam"], fullSentence: "Hari ini hujan.", fullSentenceMeaning: { ko: "비가 와요.", en: "It's raining.", es: "Está lloviendo." } },
      { type: "speak", sentence: "Di luar dingin. Bawa jaket!", speechLang: "id-ID", meaning: { ko: "밖이 추워요. 재킷!", en: "Cold outside. Jacket!", es: "Frío afuera. ¡Chaqueta!" } },
    ],
    arabic: [
      { type: "speak", sentence: "السَّاعَة تَلَاتَة. الِاجْتِمَاع السَّاعَة أَرْبَعَة.", speechLang: "ar-EG", meaning: { ko: "세 시. 회의는 네 시.", en: "It's 3. Meeting at 4.", es: "Las 3. Reunión a las 4." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "السَّاعَة ___؟", answer: "كَام", options: ["كَام", "إِيه", "فِين"], fullSentence: "السَّاعَة كَام؟", fullSentenceMeaning: { ko: "몇 시예요?", en: "What time?", es: "¿Qué hora?" }, isYesterdayReview: true },
      { type: "speak", sentence: "الدُّنْيَا صَحْو وْدَافِيَة النَّهَارْدَه.", speechLang: "ar-EG", meaning: { ko: "오늘 맑고 따뜻해요.", en: "Sunny and warm.", es: "Soleado y cálido." } },
      { type: "fill_blank", promptWithBlank: "النَّهَارْدَه ___.", answer: "بِتْمَطَّر", options: ["بِتْمَطَّر", "الْجَوّ", "السَّاعَة"], fullSentence: "النَّهَارْدَه بِتْمَطَّر.", fullSentenceMeaning: { ko: "비가 와요.", en: "It's raining.", es: "Está lloviendo." } },
      { type: "speak", sentence: "الدُّنْيَا بَرْد بَرَّه. خُد جَاكِتَّة!", speechLang: "ar-EG", meaning: { ko: "밖이 추워요. 재킷!", en: "Cold outside. Jacket!", es: "Frío afuera. ¡Chaqueta!" } },
    ],
  },

  day_11: {
    english: [
      { type: "speak", sentence: "It's sunny and warm. I like hot weather.", speechLang: "en-GB", meaning: { ko: "맑고 따뜻해요. 더운 날씨를 좋아해요.", en: "Sunny and warm. I like hot weather.", es: "Soleado y cálido. Me gusta el calor." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "How's the ___ today?", answer: "weather", options: ["weather", "day", "time"], fullSentence: "How's the weather today?", fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather?", es: "¿Cómo está el clima?" }, isYesterdayReview: true },
      { type: "speak", sentence: "What colour is this? I like blue.", speechLang: "en-GB", meaning: { ko: "이건 무슨 색이에요? 파란색을 좋아해요.", en: "What colour? I like blue.", es: "¿Qué color? Me gusta el azul." } },
      { type: "fill_blank", promptWithBlank: "This is too ___. I need a larger one.", answer: "small", options: ["small", "big", "much"], fullSentence: "This is too small. I need a larger one.", fullSentenceMeaning: { ko: "너무 작아요. 더 큰 거 필요해요.", en: "Too small. I need a larger one.", es: "Muy pequeño. Necesito uno más grande." } },
      { type: "speak", sentence: "I'll take the black one, please.", speechLang: "en-GB", meaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one.", es: "Me llevo el negro." } },
    ],
    spanish: [
      { type: "speak", sentence: "Está soleado. Me gusta el clima caliente.", speechLang: "es-ES", meaning: { ko: "맑아요. 더운 날씨 좋아해요.", en: "Sunny. I like hot weather.", es: "Está soleado. Me gusta el clima caliente." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Cómo está el ___ hoy?", answer: "clima", options: ["clima", "día", "tiempo"], fullSentence: "¿Cómo está el clima hoy?", fullSentenceMeaning: { ko: "날씨 어때요?", en: "How's the weather?", es: "¿Cómo está el clima?" }, isYesterdayReview: true },
      { type: "speak", sentence: "¿De qué color es esto? Me gusta el azul.", speechLang: "es-ES", meaning: { ko: "무슨 색? 파란색 좋아해요.", en: "What colour? I like blue.", es: "¿Qué color? Me gusta el azul." } },
      { type: "fill_blank", promptWithBlank: "Esto es muy ___.", answer: "pequeño", options: ["pequeño", "poco", "menos"], fullSentence: "Esto es muy pequeño.", fullSentenceMeaning: { ko: "너무 작아요.", en: "Too small.", es: "Muy pequeño." } },
      { type: "speak", sentence: "Me llevo el negro, por favor.", speechLang: "es-ES", meaning: { ko: "검은색 걸로 할게요.", en: "I'll take the black one.", es: "Me llevo el negro." } },
    ],
    korean: [
      { type: "speak", sentence: "맑고 따뜻해요. 더운 날씨 좋아해요.", speechLang: "ko-KR", meaning: { ko: "맑고 따뜻해요.", en: "Sunny and warm.", es: "Soleado y cálido." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "오늘 ___ 어때요?", answer: "날씨", options: ["날씨", "요일", "시간"], fullSentence: "오늘 날씨 어때요?", fullSentenceMeaning: { ko: "날씨 어때요?", en: "How's the weather?", es: "¿Cómo está el clima?" }, isYesterdayReview: true },
      { type: "speak", sentence: "이건 무슨 색이에요? 파란색을 좋아해요.", speechLang: "ko-KR", meaning: { ko: "무슨 색? 파란색 좋아요.", en: "What colour? I like blue.", es: "¿Qué color? Me gusta azul." } },
      { type: "fill_blank", promptWithBlank: "이건 너무 ___요.", answer: "작아", options: ["작아", "크", "많아"], fullSentence: "이건 너무 작아요.", fullSentenceMeaning: { ko: "너무 작아요.", en: "Too small.", es: "Muy pequeño." } },
      { type: "speak", sentence: "검은색 걸로 할게요.", speechLang: "ko-KR", meaning: { ko: "검은색 걸로.", en: "I'll take the black one.", es: "Me llevo el negro." } },
    ],
    indonesian: [
      { type: "speak", sentence: "Cuacanya cerah. Saya suka cuaca panas.", speechLang: "id-ID", meaning: { ko: "맑아요. 더운 날씨 좋아해요.", en: "Sunny. I like hot weather.", es: "Soleado. Me gusta el clima caliente." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Bagaimana ___ hari ini?", answer: "cuaca", options: ["cuaca", "hari", "jam"], fullSentence: "Bagaimana cuaca hari ini?", fullSentenceMeaning: { ko: "날씨 어때요?", en: "How's the weather?", es: "¿Cómo está el clima?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Ini warna apa? Saya suka biru.", speechLang: "id-ID", meaning: { ko: "무슨 색? 파란색 좋아요.", en: "What colour? I like blue.", es: "¿Qué color? Me gusta azul." } },
      { type: "fill_blank", promptWithBlank: "Ini ___ kecil.", answer: "terlalu", options: ["terlalu", "lebih", "sangat"], fullSentence: "Ini terlalu kecil.", fullSentenceMeaning: { ko: "너무 작아요.", en: "Too small.", es: "Muy pequeño." } },
      { type: "speak", sentence: "Saya ambil yang hitam.", speechLang: "id-ID", meaning: { ko: "검은색 걸로.", en: "I'll take the black one.", es: "Me llevo el negro." } },
    ],
    arabic: [
      { type: "speak", sentence: "الدُّنْيَا صَحْو. أَنَا بَحِبّ الْجَوّ الْحَرّ.", speechLang: "ar-EG", meaning: { ko: "맑아요. 더운 날씨 좋아해요.", en: "Sunny. I like hot weather.", es: "Soleado. Me gusta el clima caliente." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "الْجَوّ عَامِل ___ النَّهَارْدَه؟", answer: "إِيه", options: ["إِيه", "فِين", "كَام"], fullSentence: "الْجَوّ عَامِل إِيه النَّهَارْدَه؟", fullSentenceMeaning: { ko: "날씨 어때요?", en: "How's the weather?", es: "¿Cómo está el clima?" }, isYesterdayReview: true },
      { type: "speak", sentence: "دَه لَوْنُه إِيه؟ أَنَا بَحِبّ الأَزْرَق.", speechLang: "ar-EG", meaning: { ko: "무슨 색? 파란색 좋아요.", en: "What colour? I like blue.", es: "¿Qué color? Me gusta azul." } },
      { type: "fill_blank", promptWithBlank: "دَه ___ كِبِير.", answer: "مِش", options: ["مِش", "أَكْبَر", "أَوِي"], fullSentence: "دَه مِش كِبِير.", fullSentenceMeaning: { ko: "너무 작아요.", en: "Too small.", es: "Muy pequeño." } },
      { type: "speak", sentence: "هَاخُد الأَسْوَد.", speechLang: "ar-EG", meaning: { ko: "검은색 걸로.", en: "I'll take the black one.", es: "Me llevo el negro." } },
    ],
  },

  day_12: {
    english: [
      { type: "speak", sentence: "I'm twenty-five years old. How old are you?", speechLang: "en-GB", meaning: { ko: "저는 스물다섯 살이에요. 당신은요?", en: "I'm 25. How old are you?", es: "Tengo 25. ¿Cuántos años tienes?" } },
      { type: "speak", sentence: "Today is Friday. I work from Monday to Friday.", speechLang: "en-GB", meaning: { ko: "금요일이에요. 월~금 일해요.", en: "It's Friday. I work Mon-Fri.", es: "Es viernes. Trabajo lunes a viernes." } },
      { type: "speak", sentence: "It's half past three. The meeting is at four.", speechLang: "en-GB", meaning: { ko: "세 시 반. 회의는 네 시.", en: "It's 3:30. Meeting at 4.", es: "Son las 3:30. Reunión a las 4." } },
      { type: "speak", sentence: "It's raining today. It's cold. Bring a jacket!", speechLang: "en-GB", meaning: { ko: "비 와요. 추워요. 재킷!", en: "Raining. Cold. Bring a jacket!", es: "Llueve. Frío. ¡Chaqueta!" } },
      { type: "speak", sentence: "I like the blue one. Do you have a bigger size? How much is this?", speechLang: "en-GB", meaning: { ko: "파란색이 좋아요. 더 큰 사이즈 있어요? 얼마예요?", en: "I like blue. Bigger size? How much?", es: "Me gusta azul. ¿Talla más grande? ¿Cuánto?" } },
    ],
    spanish: [
      { type: "speak", sentence: "Tengo veinticinco años. ¿Cuántos años tienes?", speechLang: "es-ES", meaning: { ko: "스물다섯 살이에요. 당신은요?", en: "I'm 25. You?", es: "Tengo 25. ¿Cuántos años tienes?" } },
      { type: "speak", sentence: "Hoy es viernes. Trabajo de lunes a viernes.", speechLang: "es-ES", meaning: { ko: "금요일. 월~금 일해요.", en: "Friday. I work Mon-Fri.", es: "Viernes. Trabajo lunes a viernes." } },
      { type: "speak", sentence: "Son las tres y media. La reunión es a las cuatro.", speechLang: "es-ES", meaning: { ko: "세 시 반. 회의 네 시.", en: "3:30. Meeting at 4.", es: "Tres y media. Reunión a las cuatro." } },
      { type: "speak", sentence: "Hoy está lloviendo. Hace frío. ¡Trae una chaqueta!", speechLang: "es-ES", meaning: { ko: "비 와요. 추워요. 재킷!", en: "Raining. Cold. Jacket!", es: "Lloviendo. Frío. ¡Chaqueta!" } },
      { type: "speak", sentence: "Me gusta el azul. ¿Tiene una talla más grande? ¿Cuánto cuesta?", speechLang: "es-ES", meaning: { ko: "파란색 좋아요. 큰 사이즈? 얼마?", en: "Like blue. Bigger? How much?", es: "Me gusta azul. ¿Más grande? ¿Cuánto?" } },
    ],
    korean: [
      { type: "speak", sentence: "스물다섯 살이에요. 몇 살이에요?", speechLang: "ko-KR", meaning: { ko: "스물다섯 살. 당신은?", en: "I'm 25. You?", es: "Tengo 25. ¿Y tú?" } },
      { type: "speak", sentence: "오늘은 금요일이에요. 월요일부터 금요일까지 일해요.", speechLang: "ko-KR", meaning: { ko: "금요일. 월~금 일해요.", en: "Friday. Mon-Fri work.", es: "Viernes. Lunes a viernes." } },
      { type: "speak", sentence: "세 시 반이에요. 회의는 네 시예요.", speechLang: "ko-KR", meaning: { ko: "세 시 반. 회의 네 시.", en: "3:30. Meeting 4.", es: "3:30. Reunión 4." } },
      { type: "speak", sentence: "오늘 비가 와요. 추워요. 재킷 가져가세요!", speechLang: "ko-KR", meaning: { ko: "비 와요. 추워요. 재킷!", en: "Rain. Cold. Jacket!", es: "Lluvia. Frío. ¡Chaqueta!" } },
      { type: "speak", sentence: "파란색이 좋아요. 더 큰 사이즈 있어요? 이거 얼마예요?", speechLang: "ko-KR", meaning: { ko: "파란색 좋아요. 큰 사이즈? 얼마?", en: "Like blue. Bigger? How much?", es: "Azul. ¿Más grande? ¿Cuánto?" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Saya berumur dua puluh lima tahun. Berapa umur Anda?", speechLang: "id-ID", meaning: { ko: "스물다섯 살이에요. 당신은?", en: "I'm 25. You?", es: "Tengo 25. ¿Y tú?" } },
      { type: "speak", sentence: "Hari ini hari Jumat. Saya bekerja dari Senin sampai Jumat.", speechLang: "id-ID", meaning: { ko: "금요일. 월~금 일해요.", en: "Friday. Mon-Fri work.", es: "Viernes. Lunes a viernes." } },
      { type: "speak", sentence: "Sekarang jam setengah empat. Rapatnya jam empat.", speechLang: "id-ID", meaning: { ko: "세 시 반. 회의 네 시.", en: "3:30. Meeting 4.", es: "3:30. Reunión 4." } },
      { type: "speak", sentence: "Hari ini hujan. Dingin. Bawa jaket!", speechLang: "id-ID", meaning: { ko: "비 와요. 추워요. 재킷!", en: "Rain. Cold. Jacket!", es: "Lluvia. Frío. ¡Chaqueta!" } },
      { type: "speak", sentence: "Saya suka yang biru. Apakah ada ukuran yang lebih besar? Ini berapa harganya?", speechLang: "id-ID", meaning: { ko: "파란색 좋아요. 큰 사이즈? 얼마?", en: "Like blue. Bigger? How much?", es: "Azul. ¿Más grande? ¿Cuánto?" } },
    ],
    arabic: [
      { type: "speak", sentence: "أَنَا عَنْدِي خَمْسَة وْعِشْرِين سَنَة. عَنْدَك كَام سَنَة؟", speechLang: "ar-EG", meaning: { ko: "스물다섯 살이에요. 당신은?", en: "I'm 25. You?", es: "Tengo 25. ¿Y tú?" } },
      { type: "speak", sentence: "النَّهَارْدَه الْجُمْعَة. أَنَا بَشْتَغَل مِن الِاتْنِين لِلْجُمْعَة.", speechLang: "ar-EG", meaning: { ko: "금요일. 월~금 일해요.", en: "Friday. Mon-Fri work.", es: "Viernes. Lunes a viernes." } },
      { type: "speak", sentence: "السَّاعَة تَلَاتَة وْنُص. الِاجْتِمَاع السَّاعَة أَرْبَعَة.", speechLang: "ar-EG", meaning: { ko: "세 시 반. 회의 네 시.", en: "3:30. Meeting 4.", es: "3:30. Reunión 4." } },
      { type: "speak", sentence: "النَّهَارْدَه بِتْمَطَّر. بَرْد. خُد جَاكِتَّة!", speechLang: "ar-EG", meaning: { ko: "비 와요. 추워요. 재킷!", en: "Rain. Cold. Jacket!", es: "Lluvia. Frío. ¡Chaqueta!" } },
      { type: "speak", sentence: "أَنَا بَحِبّ الأَزْرَق. فِيه مَقَاس أَكْبَر؟ دَه بِكَام؟", speechLang: "ar-EG", meaning: { ko: "파란색 좋아요. 큰 사이즈? 얼마?", en: "Like blue. Bigger? How much?", es: "Azul. ¿Más grande? ¿Cuánto?" } },
    ],
  },
};
