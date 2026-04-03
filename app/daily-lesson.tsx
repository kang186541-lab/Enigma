import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage, NativeLanguage, getDefaultLearning } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { XPToast } from "@/components/XPToast";
import { C, F } from "@/constants/theme";

type LearningLang = "english" | "spanish" | "korean";

const SESSION_SIZE = 10;

interface LessonWord {
  word: string;
  pronunciation: string;
  speechLang: string;
  translations: Record<NativeLanguage, string>;
  example: string;
  exampleTranslations: Record<NativeLanguage, string>;
}

// Returns "YYYY-MM-DD" in local time
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const LESSON_WORDS: Record<LearningLang, LessonWord[]> = {
  english: [
    { word: "Hello", pronunciation: "heh-LOW", speechLang: "en-US", translations: { korean: "안녕하세요", english: "Hello", spanish: "Hola" }, example: "Hello! Nice to meet you.", exampleTranslations: { korean: "안녕하세요! 만나서 반가워요.", english: "Hello! Nice to meet you.", spanish: "¡Hola! Encantado de conocerte." } },
    { word: "Thank you", pronunciation: "THANGK yoo", speechLang: "en-US", translations: { korean: "감사합니다", english: "Thank you", spanish: "Gracias" }, example: "Thank you for your help.", exampleTranslations: { korean: "도와주셔서 감사합니다.", english: "Thank you for your help.", spanish: "Gracias por tu ayuda." } },
    { word: "Please", pronunciation: "PLEEZ", speechLang: "en-US", translations: { korean: "부탁해요", english: "Please", spanish: "Por favor" }, example: "Can I have water, please?", exampleTranslations: { korean: "물 좀 주시겠어요?", english: "Can I have water, please?", spanish: "¿Me puede dar agua, por favor?" } },
    { word: "Sorry", pronunciation: "SAW-ree", speechLang: "en-US", translations: { korean: "미안해요", english: "Sorry", spanish: "Lo siento" }, example: "Sorry, I'm late.", exampleTranslations: { korean: "미안해요, 늦었어요.", english: "Sorry, I'm late.", spanish: "Lo siento, llego tarde." } },
    { word: "Yes", pronunciation: "YES", speechLang: "en-US", translations: { korean: "네", english: "Yes", spanish: "Sí" }, example: "Yes, I understand.", exampleTranslations: { korean: "네, 이해했어요.", english: "Yes, I understand.", spanish: "Sí, entiendo." } },
    { word: "No", pronunciation: "NOH", speechLang: "en-US", translations: { korean: "아니요", english: "No", spanish: "No" }, example: "No, thank you.", exampleTranslations: { korean: "아니요, 괜찮아요.", english: "No, thank you.", spanish: "No, gracias." } },
    { word: "Goodbye", pronunciation: "good-BYE", speechLang: "en-US", translations: { korean: "안녕히 가세요", english: "Goodbye", spanish: "Adiós" }, example: "Goodbye! See you tomorrow.", exampleTranslations: { korean: "안녕히 가세요! 내일 봐요.", english: "Goodbye! See you tomorrow.", spanish: "¡Adiós! Hasta mañana." } },
    { word: "Water", pronunciation: "WAW-ter", speechLang: "en-US", translations: { korean: "물", english: "Water", spanish: "Agua" }, example: "I drink water every day.", exampleTranslations: { korean: "저는 매일 물을 마셔요.", english: "I drink water every day.", spanish: "Bebo agua todos los días." } },
    { word: "Food", pronunciation: "FOOD", speechLang: "en-US", translations: { korean: "음식", english: "Food", spanish: "Comida" }, example: "This food is delicious!", exampleTranslations: { korean: "이 음식 맛있어요!", english: "This food is delicious!", spanish: "¡Esta comida está deliciosa!" } },
    { word: "Help", pronunciation: "HELP", speechLang: "en-US", translations: { korean: "도움", english: "Help", spanish: "Ayuda" }, example: "I need help.", exampleTranslations: { korean: "도움이 필요해요.", english: "I need help.", spanish: "Necesito ayuda." } },
    { word: "Friend", pronunciation: "FREND", speechLang: "en-US", translations: { korean: "친구", english: "Friend", spanish: "Amigo" }, example: "She is my best friend.", exampleTranslations: { korean: "그녀는 나의 가장 친한 친구예요.", english: "She is my best friend.", spanish: "Ella es mi mejor amiga." } },
    { word: "Home", pronunciation: "HOHM", speechLang: "en-US", translations: { korean: "집", english: "Home", spanish: "Casa" }, example: "I want to go home.", exampleTranslations: { korean: "집에 가고 싶어요.", english: "I want to go home.", spanish: "Quiero ir a casa." } },
    { word: "Work", pronunciation: "WURK", speechLang: "en-US", translations: { korean: "일", english: "Work", spanish: "Trabajo" }, example: "I go to work every morning.", exampleTranslations: { korean: "저는 매일 아침 일하러 가요.", english: "I go to work every morning.", spanish: "Voy al trabajo cada mañana." } },
    { word: "School", pronunciation: "SKOOL", speechLang: "en-US", translations: { korean: "학교", english: "School", spanish: "Escuela" }, example: "School starts at 8 o'clock.", exampleTranslations: { korean: "학교는 8시에 시작해요.", english: "School starts at 8 o'clock.", spanish: "La escuela empieza a las 8." } },
    { word: "Book", pronunciation: "BUK", speechLang: "en-US", translations: { korean: "책", english: "Book", spanish: "Libro" }, example: "I love reading books.", exampleTranslations: { korean: "저는 책 읽는 걸 좋아해요.", english: "I love reading books.", spanish: "Me encanta leer libros." } },
    { word: "Time", pronunciation: "TYME", speechLang: "en-US", translations: { korean: "시간", english: "Time", spanish: "Tiempo" }, example: "What time is it?", exampleTranslations: { korean: "지금 몇 시예요?", english: "What time is it?", spanish: "¿Qué hora es?" } },
    { word: "Day", pronunciation: "DAY", speechLang: "en-US", translations: { korean: "날", english: "Day", spanish: "Día" }, example: "Have a nice day!", exampleTranslations: { korean: "좋은 하루 보내세요!", english: "Have a nice day!", spanish: "¡Que tengas un buen día!" } },
    { word: "Night", pronunciation: "NYTE", speechLang: "en-US", translations: { korean: "밤", english: "Night", spanish: "Noche" }, example: "Good night, sleep well.", exampleTranslations: { korean: "안녕히 주무세요.", english: "Good night, sleep well.", spanish: "Buenas noches, duerme bien." } },
    { word: "Morning", pronunciation: "MOR-ning", speechLang: "en-US", translations: { korean: "아침", english: "Morning", spanish: "Mañana" }, example: "Good morning! How are you?", exampleTranslations: { korean: "좋은 아침이에요! 어떻게 지내세요?", english: "Good morning! How are you?", spanish: "¡Buenos días! ¿Cómo estás?" } },
    { word: "Beautiful", pronunciation: "BYOO-tih-ful", speechLang: "en-US", translations: { korean: "아름다운", english: "Beautiful", spanish: "Hermoso" }, example: "What a beautiful day!", exampleTranslations: { korean: "정말 아름다운 날이에요!", english: "What a beautiful day!", spanish: "¡Qué día tan hermoso!" } },
    { word: "Happy", pronunciation: "HAP-ee", speechLang: "en-US", translations: { korean: "행복한", english: "Happy", spanish: "Feliz" }, example: "I feel very happy today.", exampleTranslations: { korean: "오늘 정말 행복해요.", english: "I feel very happy today.", spanish: "Hoy me siento muy feliz." } },
    { word: "Love", pronunciation: "LUV", speechLang: "en-US", translations: { korean: "사랑", english: "Love", spanish: "Amor" }, example: "I love learning languages.", exampleTranslations: { korean: "저는 언어 배우는 걸 사랑해요.", english: "I love learning languages.", spanish: "Amo aprender idiomas." } },
    { word: "Eat", pronunciation: "EET", speechLang: "en-US", translations: { korean: "먹다", english: "To eat", spanish: "Comer" }, example: "Let's eat together.", exampleTranslations: { korean: "같이 먹어요.", english: "Let's eat together.", spanish: "Comamos juntos." } },
    { word: "Drink", pronunciation: "DRINK", speechLang: "en-US", translations: { korean: "마시다", english: "To drink", spanish: "Beber" }, example: "Would you like to drink something?", exampleTranslations: { korean: "뭔가 마시고 싶으세요?", english: "Would you like to drink something?", spanish: "¿Te gustaría beber algo?" } },
    { word: "Travel", pronunciation: "TRAV-ul", speechLang: "en-US", translations: { korean: "여행", english: "Travel", spanish: "Viaje" }, example: "I love to travel the world.", exampleTranslations: { korean: "저는 세계 여행을 좋아해요.", english: "I love to travel the world.", spanish: "Me encanta viajar por el mundo." } },
    { word: "Weather", pronunciation: "WETH-er", speechLang: "en-US", translations: { korean: "날씨", english: "Weather", spanish: "Clima" }, example: "The weather is perfect today.", exampleTranslations: { korean: "오늘 날씨가 완벽해요.", english: "The weather is perfect today.", spanish: "El clima es perfecto hoy." } },
    { word: "Music", pronunciation: "MYOO-zik", speechLang: "en-US", translations: { korean: "음악", english: "Music", spanish: "Música" }, example: "I listen to music every day.", exampleTranslations: { korean: "저는 매일 음악을 들어요.", english: "I listen to music every day.", spanish: "Escucho música todos los días." } },
    { word: "Name", pronunciation: "NAYM", speechLang: "en-US", translations: { korean: "이름", english: "Name", spanish: "Nombre" }, example: "What is your name?", exampleTranslations: { korean: "이름이 뭐예요?", english: "What is your name?", spanish: "¿Cuál es tu nombre?" } },
    { word: "Language", pronunciation: "LANG-gwij", speechLang: "en-US", translations: { korean: "언어", english: "Language", spanish: "Idioma" }, example: "I am learning a new language.", exampleTranslations: { korean: "저는 새 언어를 배우고 있어요.", english: "I am learning a new language.", spanish: "Estoy aprendiendo un nuevo idioma." } },
    { word: "Question", pronunciation: "KWES-chun", speechLang: "en-US", translations: { korean: "질문", english: "Question", spanish: "Pregunta" }, example: "Do you have any questions?", exampleTranslations: { korean: "질문 있으세요?", english: "Do you have any questions?", spanish: "¿Tienes alguna pregunta?" } },
  ],
  spanish: [
    { word: "Hola", pronunciation: "OH-lah", speechLang: "es-ES", translations: { korean: "안녕하세요", english: "Hello", spanish: "Hola" }, example: "¡Hola! ¿Cómo estás?", exampleTranslations: { korean: "안녕하세요! 어떻게 지내세요?", english: "Hello! How are you?", spanish: "¡Hola! ¿Cómo estás?" } },
    { word: "Gracias", pronunciation: "GRA-syas", speechLang: "es-ES", translations: { korean: "감사합니다", english: "Thank you", spanish: "Gracias" }, example: "Muchas gracias por tu ayuda.", exampleTranslations: { korean: "도와주셔서 정말 감사합니다.", english: "Thank you so much for your help.", spanish: "Muchas gracias por tu ayuda." } },
    { word: "Por favor", pronunciation: "por fa-VOR", speechLang: "es-ES", translations: { korean: "부탁해요", english: "Please", spanish: "Por favor" }, example: "Un café, por favor.", exampleTranslations: { korean: "커피 한 잔 부탁해요.", english: "A coffee, please.", spanish: "Un café, por favor." } },
    { word: "Lo siento", pronunciation: "lo SYEN-to", speechLang: "es-ES", translations: { korean: "미안해요", english: "Sorry", spanish: "Lo siento" }, example: "Lo siento, llegué tarde.", exampleTranslations: { korean: "미안해요, 늦었어요.", english: "Sorry, I arrived late.", spanish: "Lo siento, llegué tarde." } },
    { word: "Sí", pronunciation: "SEE", speechLang: "es-ES", translations: { korean: "네", english: "Yes", spanish: "Sí" }, example: "Sí, entiendo.", exampleTranslations: { korean: "네, 이해했어요.", english: "Yes, I understand.", spanish: "Sí, entiendo." } },
    { word: "No", pronunciation: "NOH", speechLang: "es-ES", translations: { korean: "아니요", english: "No", spanish: "No" }, example: "No, gracias.", exampleTranslations: { korean: "아니요, 괜찮아요.", english: "No, thank you.", spanish: "No, gracias." } },
    { word: "Adiós", pronunciation: "ah-DYOS", speechLang: "es-ES", translations: { korean: "안녕히 가세요", english: "Goodbye", spanish: "Adiós" }, example: "¡Adiós! Hasta mañana.", exampleTranslations: { korean: "안녕히 가세요! 내일 봐요.", english: "Goodbye! See you tomorrow.", spanish: "¡Adiós! Hasta mañana." } },
    { word: "Agua", pronunciation: "AH-gwah", speechLang: "es-ES", translations: { korean: "물", english: "Water", spanish: "Agua" }, example: "Necesito agua, por favor.", exampleTranslations: { korean: "물 좀 주세요.", english: "I need water, please.", spanish: "Necesito agua, por favor." } },
    { word: "Comida", pronunciation: "ko-MEE-dah", speechLang: "es-ES", translations: { korean: "음식", english: "Food", spanish: "Comida" }, example: "Esta comida está deliciosa.", exampleTranslations: { korean: "이 음식 맛있어요.", english: "This food is delicious.", spanish: "Esta comida está deliciosa." } },
    { word: "Ayuda", pronunciation: "ah-YOO-dah", speechLang: "es-ES", translations: { korean: "도움", english: "Help", spanish: "Ayuda" }, example: "Necesito ayuda.", exampleTranslations: { korean: "도움이 필요해요.", english: "I need help.", spanish: "Necesito ayuda." } },
    { word: "Amigo", pronunciation: "ah-MEE-go", speechLang: "es-ES", translations: { korean: "친구", english: "Friend", spanish: "Amigo" }, example: "Él es mi mejor amigo.", exampleTranslations: { korean: "그는 나의 가장 친한 친구예요.", english: "He is my best friend.", spanish: "Él es mi mejor amigo." } },
    { word: "Casa", pronunciation: "KAH-sah", speechLang: "es-ES", translations: { korean: "집", english: "Home", spanish: "Casa" }, example: "Mi casa es muy grande.", exampleTranslations: { korean: "우리 집은 매우 커요.", english: "My house is very big.", spanish: "Mi casa es muy grande." } },
    { word: "Trabajo", pronunciation: "tra-BAH-ho", speechLang: "es-ES", translations: { korean: "일", english: "Work", spanish: "Trabajo" }, example: "Me gusta mi trabajo.", exampleTranslations: { korean: "저는 제 일이 좋아요.", english: "I like my job.", spanish: "Me gusta mi trabajo." } },
    { word: "Escuela", pronunciation: "es-KWEH-lah", speechLang: "es-ES", translations: { korean: "학교", english: "School", spanish: "Escuela" }, example: "Voy a la escuela a pie.", exampleTranslations: { korean: "저는 걸어서 학교에 가요.", english: "I walk to school.", spanish: "Voy a la escuela a pie." } },
    { word: "Libro", pronunciation: "LEE-bro", speechLang: "es-ES", translations: { korean: "책", english: "Book", spanish: "Libro" }, example: "Este libro es muy interesante.", exampleTranslations: { korean: "이 책은 매우 흥미로워요.", english: "This book is very interesting.", spanish: "Este libro es muy interesante." } },
    { word: "Tiempo", pronunciation: "TYEM-po", speechLang: "es-ES", translations: { korean: "시간 / 날씨", english: "Time / Weather", spanish: "Tiempo" }, example: "¿Qué tiempo hace hoy?", exampleTranslations: { korean: "오늘 날씨가 어때요?", english: "What's the weather like today?", spanish: "¿Qué tiempo hace hoy?" } },
    { word: "Día", pronunciation: "DEE-ah", speechLang: "es-ES", translations: { korean: "날", english: "Day", spanish: "Día" }, example: "¡Que tengas un buen día!", exampleTranslations: { korean: "좋은 하루 보내세요!", english: "Have a nice day!", spanish: "¡Que tengas un buen día!" } },
    { word: "Noche", pronunciation: "NO-che", speechLang: "es-ES", translations: { korean: "밤", english: "Night", spanish: "Noche" }, example: "Buenas noches, hasta mañana.", exampleTranslations: { korean: "안녕히 주무세요, 내일 봐요.", english: "Good night, see you tomorrow.", spanish: "Buenas noches, hasta mañana." } },
    { word: "Mañana", pronunciation: "mah-NYAH-nah", speechLang: "es-ES", translations: { korean: "내일 / 아침", english: "Tomorrow / Morning", spanish: "Mañana" }, example: "Nos vemos mañana.", exampleTranslations: { korean: "내일 봐요.", english: "See you tomorrow.", spanish: "Nos vemos mañana." } },
    { word: "Hermoso", pronunciation: "er-MO-so", speechLang: "es-ES", translations: { korean: "아름다운", english: "Beautiful", spanish: "Hermoso" }, example: "¡Qué lugar tan hermoso!", exampleTranslations: { korean: "정말 아름다운 곳이에요!", english: "What a beautiful place!", spanish: "¡Qué lugar tan hermoso!" } },
    { word: "Feliz", pronunciation: "fe-LEES", speechLang: "es-ES", translations: { korean: "행복한", english: "Happy", spanish: "Feliz" }, example: "Estoy muy feliz hoy.", exampleTranslations: { korean: "저는 오늘 정말 행복해요.", english: "I am very happy today.", spanish: "Estoy muy feliz hoy." } },
    { word: "Amor", pronunciation: "ah-MOR", speechLang: "es-ES", translations: { korean: "사랑", english: "Love", spanish: "Amor" }, example: "El amor es lo más importante.", exampleTranslations: { korean: "사랑이 가장 중요해요.", english: "Love is the most important thing.", spanish: "El amor es lo más importante." } },
    { word: "Comer", pronunciation: "ko-MER", speechLang: "es-ES", translations: { korean: "먹다", english: "To eat", spanish: "Comer" }, example: "Vamos a comer juntos.", exampleTranslations: { korean: "같이 먹어요.", english: "Let's eat together.", spanish: "Vamos a comer juntos." } },
    { word: "Beber", pronunciation: "be-BER", speechLang: "es-ES", translations: { korean: "마시다", english: "To drink", spanish: "Beber" }, example: "¿Quieres beber algo?", exampleTranslations: { korean: "뭔가 마시고 싶으세요?", english: "Would you like to drink something?", spanish: "¿Quieres beber algo?" } },
    { word: "Viaje", pronunciation: "BYAH-he", speechLang: "es-ES", translations: { korean: "여행", english: "Travel", spanish: "Viaje" }, example: "Este viaje es increíble.", exampleTranslations: { korean: "이 여행은 정말 놀라워요.", english: "This trip is incredible.", spanish: "Este viaje es increíble." } },
    { word: "Música", pronunciation: "MOO-si-kah", speechLang: "es-ES", translations: { korean: "음악", english: "Music", spanish: "Música" }, example: "Me encanta la música española.", exampleTranslations: { korean: "저는 스페인 음악이 정말 좋아요.", english: "I love Spanish music.", spanish: "Me encanta la música española." } },
    { word: "Nombre", pronunciation: "NOM-bre", speechLang: "es-ES", translations: { korean: "이름", english: "Name", spanish: "Nombre" }, example: "¿Cuál es tu nombre?", exampleTranslations: { korean: "이름이 뭐예요?", english: "What is your name?", spanish: "¿Cuál es tu nombre?" } },
    { word: "Idioma", pronunciation: "i-DYOH-mah", speechLang: "es-ES", translations: { korean: "언어", english: "Language", spanish: "Idioma" }, example: "Hablo tres idiomas.", exampleTranslations: { korean: "저는 세 가지 언어를 해요.", english: "I speak three languages.", spanish: "Hablo tres idiomas." } },
    { word: "Ciudad", pronunciation: "syoo-DAD", speechLang: "es-ES", translations: { korean: "도시", english: "City", spanish: "Ciudad" }, example: "Madrid es una ciudad hermosa.", exampleTranslations: { korean: "마드리드는 아름다운 도시예요.", english: "Madrid is a beautiful city.", spanish: "Madrid es una ciudad hermosa." } },
    { word: "Mercado", pronunciation: "mer-KAH-do", speechLang: "es-ES", translations: { korean: "시장", english: "Market", spanish: "Mercado" }, example: "Voy al mercado los sábados.", exampleTranslations: { korean: "저는 토요일마다 시장에 가요.", english: "I go to the market on Saturdays.", spanish: "Voy al mercado los sábados." } },
  ],
  korean: [
    { word: "안녕하세요", pronunciation: "an-nyeong-ha-se-yo", speechLang: "ko-KR", translations: { korean: "안녕하세요", english: "Hello", spanish: "Hola" }, example: "안녕하세요! 만나서 반가워요.", exampleTranslations: { korean: "안녕하세요! 만나서 반가워요.", english: "Hello! Nice to meet you.", spanish: "¡Hola! Encantado de conocerte." } },
    { word: "감사합니다", pronunciation: "gam-sa-ham-ni-da", speechLang: "ko-KR", translations: { korean: "감사합니다", english: "Thank you", spanish: "Gracias" }, example: "도와주셔서 감사합니다.", exampleTranslations: { korean: "도와주셔서 감사합니다.", english: "Thank you for helping me.", spanish: "Gracias por ayudarme." } },
    { word: "부탁해요", pronunciation: "bu-tak-hae-yo", speechLang: "ko-KR", translations: { korean: "부탁해요", english: "Please", spanish: "Por favor" }, example: "물 좀 주세요, 부탁해요.", exampleTranslations: { korean: "물 좀 주세요, 부탁해요.", english: "Please give me some water.", spanish: "Por favor, dame agua." } },
    { word: "미안해요", pronunciation: "mi-an-hae-yo", speechLang: "ko-KR", translations: { korean: "미안해요", english: "Sorry", spanish: "Lo siento" }, example: "늦어서 미안해요.", exampleTranslations: { korean: "늦어서 미안해요.", english: "Sorry for being late.", spanish: "Lo siento por llegar tarde." } },
    { word: "네", pronunciation: "neh", speechLang: "ko-KR", translations: { korean: "네", english: "Yes", spanish: "Sí" }, example: "네, 알겠어요.", exampleTranslations: { korean: "네, 알겠어요.", english: "Yes, I understand.", spanish: "Sí, entiendo." } },
    { word: "아니요", pronunciation: "a-ni-yo", speechLang: "ko-KR", translations: { korean: "아니요", english: "No", spanish: "No" }, example: "아니요, 괜찮아요.", exampleTranslations: { korean: "아니요, 괜찮아요.", english: "No, it's okay.", spanish: "No, está bien." } },
    { word: "안녕히 가세요", pronunciation: "an-nyeong-hi ga-se-yo", speechLang: "ko-KR", translations: { korean: "안녕히 가세요", english: "Goodbye", spanish: "Adiós" }, example: "안녕히 가세요! 내일 봐요.", exampleTranslations: { korean: "안녕히 가세요! 내일 봐요.", english: "Goodbye! See you tomorrow.", spanish: "¡Adiós! Hasta mañana." } },
    { word: "물", pronunciation: "mul", speechLang: "ko-KR", translations: { korean: "물", english: "Water", spanish: "Agua" }, example: "물 한 잔 주세요.", exampleTranslations: { korean: "물 한 잔 주세요.", english: "A glass of water, please.", spanish: "Un vaso de agua, por favor." } },
    { word: "음식", pronunciation: "eum-sik", speechLang: "ko-KR", translations: { korean: "음식", english: "Food", spanish: "Comida" }, example: "한국 음식이 맛있어요.", exampleTranslations: { korean: "한국 음식이 맛있어요.", english: "Korean food is delicious.", spanish: "La comida coreana es deliciosa." } },
    { word: "도움", pronunciation: "do-um", speechLang: "ko-KR", translations: { korean: "도움", english: "Help", spanish: "Ayuda" }, example: "도움이 필요해요.", exampleTranslations: { korean: "도움이 필요해요.", english: "I need help.", spanish: "Necesito ayuda." } },
    { word: "친구", pronunciation: "chin-gu", speechLang: "ko-KR", translations: { korean: "친구", english: "Friend", spanish: "Amigo" }, example: "그는 제 가장 친한 친구예요.", exampleTranslations: { korean: "그는 제 가장 친한 친구예요.", english: "He is my best friend.", spanish: "Él es mi mejor amigo." } },
    { word: "집", pronunciation: "jip", speechLang: "ko-KR", translations: { korean: "집", english: "Home", spanish: "Casa" }, example: "집에 가고 싶어요.", exampleTranslations: { korean: "집에 가고 싶어요.", english: "I want to go home.", spanish: "Quiero ir a casa." } },
    { word: "일", pronunciation: "il", speechLang: "ko-KR", translations: { korean: "일", english: "Work", spanish: "Trabajo" }, example: "저는 매일 열심히 일해요.", exampleTranslations: { korean: "저는 매일 열심히 일해요.", english: "I work hard every day.", spanish: "Trabajo duro todos los días." } },
    { word: "학교", pronunciation: "hak-gyo", speechLang: "ko-KR", translations: { korean: "학교", english: "School", spanish: "Escuela" }, example: "학교에서 친구를 사귀었어요.", exampleTranslations: { korean: "학교에서 친구를 사귀었어요.", english: "I made friends at school.", spanish: "Hice amigos en la escuela." } },
    { word: "책", pronunciation: "chaek", speechLang: "ko-KR", translations: { korean: "책", english: "Book", spanish: "Libro" }, example: "저는 책 읽는 걸 좋아해요.", exampleTranslations: { korean: "저는 책 읽는 걸 좋아해요.", english: "I love reading books.", spanish: "Me encanta leer libros." } },
    { word: "시간", pronunciation: "si-gan", speechLang: "ko-KR", translations: { korean: "시간", english: "Time", spanish: "Tiempo" }, example: "시간이 없어요.", exampleTranslations: { korean: "시간이 없어요.", english: "I don't have time.", spanish: "No tengo tiempo." } },
    { word: "날씨", pronunciation: "nal-ssi", speechLang: "ko-KR", translations: { korean: "날씨", english: "Weather", spanish: "Clima" }, example: "오늘 날씨가 너무 좋아요.", exampleTranslations: { korean: "오늘 날씨가 너무 좋아요.", english: "The weather is so nice today.", spanish: "El clima hoy es muy bueno." } },
    { word: "음악", pronunciation: "eu-mak", speechLang: "ko-KR", translations: { korean: "음악", english: "Music", spanish: "Música" }, example: "저는 K-pop 음악을 좋아해요.", exampleTranslations: { korean: "저는 K-pop 음악을 좋아해요.", english: "I like K-pop music.", spanish: "Me gusta la música K-pop." } },
    { word: "이름", pronunciation: "i-reum", speechLang: "ko-KR", translations: { korean: "이름", english: "Name", spanish: "Nombre" }, example: "이름이 뭐예요?", exampleTranslations: { korean: "이름이 뭐예요?", english: "What is your name?", spanish: "¿Cuál es tu nombre?" } },
    { word: "사랑", pronunciation: "sa-rang", speechLang: "ko-KR", translations: { korean: "사랑", english: "Love", spanish: "Amor" }, example: "사랑해요!", exampleTranslations: { korean: "사랑해요!", english: "I love you!", spanish: "¡Te amo!" } },
    { word: "여행", pronunciation: "yeo-haeng", speechLang: "ko-KR", translations: { korean: "여행", english: "Travel", spanish: "Viaje" }, example: "저는 여행을 정말 좋아해요.", exampleTranslations: { korean: "저는 여행을 정말 좋아해요.", english: "I really love traveling.", spanish: "Realmente me encanta viajar." } },
    { word: "맛있어요", pronunciation: "ma-si-sseo-yo", speechLang: "ko-KR", translations: { korean: "맛있어요", english: "It's delicious", spanish: "Está delicioso" }, example: "이 불고기 정말 맛있어요!", exampleTranslations: { korean: "이 불고기 정말 맛있어요!", english: "This bulgogi is really delicious!", spanish: "¡Este bulgogi está realmente delicioso!" } },
    { word: "어디", pronunciation: "eo-di", speechLang: "ko-KR", translations: { korean: "어디", english: "Where", spanish: "Dónde" }, example: "화장실이 어디예요?", exampleTranslations: { korean: "화장실이 어디예요?", english: "Where is the restroom?", spanish: "¿Dónde está el baño?" } },
    { word: "얼마", pronunciation: "eol-ma", speechLang: "ko-KR", translations: { korean: "얼마", english: "How much", spanish: "Cuánto" }, example: "이것 얼마예요?", exampleTranslations: { korean: "이것 얼마예요?", english: "How much is this?", spanish: "¿Cuánto cuesta esto?" } },
    { word: "주세요", pronunciation: "ju-se-yo", speechLang: "ko-KR", translations: { korean: "주세요", english: "Please give me", spanish: "Por favor dame" }, example: "커피 하나 주세요.", exampleTranslations: { korean: "커피 하나 주세요.", english: "One coffee, please.", spanish: "Un café, por favor." } },
    { word: "괜찮아요", pronunciation: "gwaen-cha-na-yo", speechLang: "ko-KR", translations: { korean: "괜찮아요", english: "It's okay / I'm fine", spanish: "Está bien" }, example: "괜찮아요, 걱정하지 마세요.", exampleTranslations: { korean: "괜찮아요, 걱정하지 마세요.", english: "It's okay, don't worry.", spanish: "Está bien, no te preocupes." } },
    { word: "모르겠어요", pronunciation: "mo-reu-ge-sseo-yo", speechLang: "ko-KR", translations: { korean: "모르겠어요", english: "I don't know", spanish: "No sé" }, example: "죄송해요, 모르겠어요.", exampleTranslations: { korean: "죄송해요, 모르겠어요.", english: "Sorry, I don't know.", spanish: "Lo siento, no sé." } },
    { word: "도시", pronunciation: "do-si", speechLang: "ko-KR", translations: { korean: "도시", english: "City", spanish: "Ciudad" }, example: "서울은 큰 도시예요.", exampleTranslations: { korean: "서울은 큰 도시예요.", english: "Seoul is a big city.", spanish: "Seúl es una gran ciudad." } },
    { word: "언어", pronunciation: "eon-eo", speechLang: "ko-KR", translations: { korean: "언어", english: "Language", spanish: "Idioma" }, example: "한국어는 재미있는 언어예요.", exampleTranslations: { korean: "한국어는 재미있는 언어예요.", english: "Korean is an interesting language.", spanish: "El coreano es un idioma interesante." } },
    { word: "천천히", pronunciation: "cheon-cheon-hi", speechLang: "ko-KR", translations: { korean: "천천히", english: "Slowly", spanish: "Despacio" }, example: "천천히 말해 주세요.", exampleTranslations: { korean: "천천히 말해 주세요.", english: "Please speak slowly.", spanish: "Por favor habla despacio." } },
  ],
};

let _lessonAudio: HTMLAudioElement | null = null;
let _nativeLessonSound: Audio.Sound | null = null;

async function playWordTTS(text: string, lang: string, apiBase: string) {
  try {
    const url = new URL("/api/pronunciation-tts", apiBase);
    url.searchParams.set("text", text);
    url.searchParams.set("lang", lang);
    const urlStr = url.toString();

    if (Platform.OS === "web") {
      if (_lessonAudio) {
        _lessonAudio.pause();
        _lessonAudio.src = "";
        _lessonAudio = null;
      }
      const res = await fetch(urlStr);
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
      _lessonAudio = audio;
      audio.onended = () => { URL.revokeObjectURL(objectUrl); _lessonAudio = null; };
      audio.onerror = () => { URL.revokeObjectURL(objectUrl); _lessonAudio = null; };
      await audio.play();
    } else {
      if (_nativeLessonSound) {
        await _nativeLessonSound.stopAsync().catch(() => {});
        await _nativeLessonSound.unloadAsync().catch(() => {});
        _nativeLessonSound = null;
      }
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false });
      const { sound } = await Audio.Sound.createAsync({ uri: urlStr }, { shouldPlay: true, volume: 1.0 });
      _nativeLessonSound = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          _nativeLessonSound = null;
        }
      });
    }
  } catch (err) {
    console.warn("Lesson TTS error:", err);
  }
}

// Picks SESSION_SIZE unseen words for today. Marks them seen immediately.
async function buildDailySession(lang: LearningLang): Promise<LessonWord[]> {
  const pool = LESSON_WORDS[lang];
  const dateKey = todayKey();
  const storageKey = `lesson_seen_${lang}_${dateKey}`;

  let seen: string[] = [];
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    seen = raw ? JSON.parse(raw) : [];
  } catch { seen = []; }

  const seenSet = new Set(seen);
  let available = pool.filter((w) => !seenSet.has(w.word));

  // If pool exhausted today, start fresh with words not in the current batch
  if (available.length < SESSION_SIZE) {
    seen = [];
    seenSet.clear();
    available = pool.slice();
  }

  const session = shuffle(available).slice(0, SESSION_SIZE);

  // Mark session words as seen immediately so re-opens get fresh words
  const newSeen = [...seenSet, ...session.map((w) => w.word)];
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(newSeen));
  } catch {}

  return session;
}

export default function DailyLessonScreen() {
  const insets = useSafeAreaInsets();
  const { nativeLanguage, learningLanguage, updateStats, stats } = useLanguage();
  const apiBase = getApiUrl();

  const nativeLang: NativeLanguage = nativeLanguage ?? "english";
  const learnLang: LearningLang = (learningLanguage as LearningLang) ?? getDefaultLearning(nativeLang) as LearningLang;

  const [sessionWords, setSessionWords] = useState<LessonWord[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [xpGain, setXpGain] = useState(0);
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Build the session on mount
  useEffect(() => {
    buildDailySession(learnLang).then((session) => {
      setSessionWords(session);
      setWordIndex(0);
      setLoading(false);
    });
  }, [learnLang]);

  const currentWord = sessionWords[wordIndex];
  const progress = sessionWords.length > 0 ? (wordIndex + 1) / sessionWords.length : 0;

  const animateToNext = (onDone: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      onDone();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (wordIndex < sessionWords.length - 1) {
      animateToNext(() => setWordIndex((i) => i + 1));
    } else {
      animateToNext(() => setDone(true));
      if (!xpAwarded) {
        setXpAwarded(true);
        setXpGain(50);
        updateStats({ xp: statsRef.current.xp + 50, wordsLearned: statsRef.current.wordsLearned + sessionWords.length });
      }
    }
  };

  const handleListen = async () => {
    if (isPlaying || !currentWord) return;
    setIsPlaying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playWordTTS(currentWord.word, currentWord.speechLang, apiBase);
    setIsPlaying(false);
  };

  const langLabel: Record<LearningLang, string> = {
    english: "🇬🇧 English",
    spanish: "🇪🇸 Spanish",
    korean: "🇰🇷 Korean",
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: topPad, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontFamily: F.body, color: C.goldDim, fontSize: 14 }}>수업 준비 중…</Text>
      </View>
    );
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <ScrollView contentContainerStyle={styles.doneScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.doneTitle}>완료!</Text>
            <Text style={styles.doneSubtitle}>오늘의 수업을 마쳤어요!</Text>

            <View style={styles.xpBadge}>
              <LinearGradient colors={[C.gold, C.goldDark]} style={styles.xpGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="flash" size={18} color={C.bg1} />
                <Text style={styles.xpText}>+50 XP</Text>
              </LinearGradient>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{sessionWords.length}</Text>
                <Text style={styles.statLbl}>단어 학습</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>100%</Text>
                <Text style={styles.statLbl}>완료율</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>50</Text>
                <Text style={styles.statLbl}>XP 획득</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.homeBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.replace("/(tabs)/");
              }}
            >
              <LinearGradient colors={[C.gold, C.goldDark]} style={styles.homeBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="home" size={18} color={C.bg1} />
                <Text style={styles.homeBtnText}>홈으로 돌아가기</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <XPToast amount={xpGain} onDone={() => setXpGain(0)} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={24} color={C.gold} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{langLabel[learnLang]}</Text>
          <Text style={styles.headerSub}>오늘의 단어 {wordIndex + 1} / {sessionWords.length}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      {/* Word card */}
      {currentWord && (
        <Animated.View style={[styles.cardWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.langBadge}>
                <Text style={styles.langBadgeText}>{langLabel[learnLang]}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.listenBtn, pressed && { opacity: 0.75 }, isPlaying && styles.listenBtnActive]}
                onPress={handleListen}
                disabled={isPlaying}
              >
                {isPlaying
                  ? <ActivityIndicator size="small" color={C.gold} />
                  : <Ionicons name="volume-high" size={22} color={C.gold} />}
              </Pressable>
            </View>

            <Text style={styles.wordText}>{currentWord.word}</Text>
            <Text style={styles.pronunciation}>/{currentWord.pronunciation}/</Text>

            <View style={styles.divider} />

            <View style={styles.translationRow}>
              <View style={styles.transIcon}>
                <Ionicons name="language" size={16} color={C.gold} />
              </View>
              <Text style={styles.translationText}>{currentWord.translations[nativeLang]}</Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>예문</Text>
              <Text style={styles.exampleWord}>{currentWord.example}</Text>
              <Text style={styles.exampleTrans}>{currentWord.exampleTranslations[nativeLang]}</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Next button */}
      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] }]}
          onPress={handleNext}
        >
          <LinearGradient colors={[C.gold, C.goldDark]} style={styles.nextBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.nextBtnText}>
              {wordIndex < sessionWords.length - 1 ? "다음" : "완료"}
            </Text>
            <Ionicons
              name={wordIndex < sessionWords.length - 1 ? "arrow-forward" : "checkmark"}
              size={20}
              color={C.bg1}
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bg2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: F.header,
    color: C.gold,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    marginTop: 2,
    fontStyle: "italic",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(201,162,39,0.15)",
    marginHorizontal: 24,
    borderRadius: 3,
    marginBottom: 24,
    marginTop: 12,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: C.border,
  },
  progressFill: {
    height: 6,
    backgroundColor: C.gold,
    borderRadius: 3,
  },
  cardWrap: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: C.parchment,
    borderRadius: 28,
    padding: 28,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: C.parchmentDeep,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  langBadge: {
    backgroundColor: "rgba(201,162,39,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  langBadgeText: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.gold,
  },
  listenBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(201,162,39,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  listenBtnActive: {
    backgroundColor: "rgba(201,162,39,0.25)",
  },
  wordText: {
    fontSize: 42,
    fontFamily: F.title,
    color: C.textParchment,
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 6,
  },
  pronunciation: {
    fontSize: 15,
    fontFamily: F.body,
    color: C.goldDark,
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: C.parchmentDeep,
    marginBottom: 20,
  },
  translationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  transIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(201,162,39,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  translationText: {
    fontSize: 22,
    fontFamily: F.header,
    color: C.textParchment,
    flex: 1,
  },
  exampleBox: {
    backgroundColor: "rgba(201,162,39,0.08)",
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.2)",
  },
  exampleLabel: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.goldDark,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  exampleWord: {
    fontSize: 15,
    fontFamily: F.bodySemi,
    color: C.textParchment,
    lineHeight: 22,
  },
  exampleTrans: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDark,
    lineHeight: 20,
    fontStyle: "italic",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  nextBtn: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  nextBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 0.5,
  },
  doneScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  doneCard: {
    width: "100%",
    backgroundColor: C.bg2,
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  doneEmoji: { fontSize: 64, textAlign: "center" },
  doneTitle: {
    fontSize: 32,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 2,
  },
  doneSubtitle: {
    fontSize: 16,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
    textAlign: "center",
  },
  xpBadge: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  xpGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  xpText: {
    fontSize: 20,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(201,162,39,0.08)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: C.border,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statNum: { fontSize: 22, fontFamily: F.header, color: C.gold },
  statLbl: { fontSize: 11, fontFamily: F.label, color: C.goldDim },
  statDivider: { width: 1, height: 36, backgroundColor: C.border },
  homeBtn: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  homeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  homeBtnText: {
    fontSize: 16,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 0.5,
  },
});
