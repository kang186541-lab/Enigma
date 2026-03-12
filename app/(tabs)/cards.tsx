import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useLanguage, NativeLanguage, getDefaultLearning } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { XPToast } from "@/components/XPToast";
import { RippleButton } from "@/components/RippleButton";

const { width } = Dimensions.get("window");

interface FlashCard {
  word: string;
  emoji: string;
  pronunciation?: string;
  meanings: Record<NativeLanguage, string>;
  example: string;
  exampleTranslation: Record<NativeLanguage, string>;
  speechLang: string;
}

const BEGINNER_CARDS_BY_LANG: Record<NativeLanguage, FlashCard[]> = {
  english: [
    {
      word: "Apple",
      emoji: "🍎",
      pronunciation: "AE-pul",
      meanings: {
        korean: "빨간색, 노란색, 또는 초록색 껍질에 흰 속을 가진 둥근 과일이에요.",
        english: "A round fruit with red, yellow, or green skin and a white interior.",
        spanish: "Una fruta redonda con piel roja, amarilla o verde e interior blanco.",
      },
      example: '"I eat an apple every morning for breakfast."',
      exampleTranslation: {
        korean: "저는 매일 아침 사과를 먹어요.",
        english: "I eat an apple every morning for breakfast.",
        spanish: "Como una manzana cada mañana en el desayuno.",
      },
      speechLang: "en-US",
    },
    {
      word: "Water",
      emoji: "💧",
      pronunciation: "WAW-ter",
      meanings: {
        korean: "모든 생명체에 필수적인 맑고 무색의 액체예요.",
        english: "A clear, colorless liquid essential for all living things.",
        spanish: "Líquido transparente e incoloro esencial para todos los seres vivos.",
      },
      example: '"Please drink eight glasses of water every day."',
      exampleTranslation: {
        korean: "매일 물 여덟 잔을 마셔주세요.",
        english: "Please drink eight glasses of water every day.",
        spanish: "Por favor, bebe ocho vasos de agua cada día.",
      },
      speechLang: "en-US",
    },
    {
      word: "Hello",
      emoji: "👋",
      pronunciation: "heh-LOW",
      meanings: {
        korean: "누군가를 만나거나 대화를 시작할 때 사용하는 인사말이에요.",
        english: "A greeting used when meeting someone or starting a conversation.",
        spanish: "Saludo usado al conocer a alguien o iniciar una conversación.",
      },
      example: '"Hello! My name is Sarah. Nice to meet you."',
      exampleTranslation: {
        korean: "안녕하세요! 제 이름은 사라예요. 만나서 반가워요.",
        english: "Hello! My name is Sarah. Nice to meet you.",
        spanish: "¡Hola! Me llamo Sarah. Mucho gusto en conocerte.",
      },
      speechLang: "en-US",
    },
    {
      word: "Thank you",
      emoji: "🙏",
      pronunciation: "THANGK yoo",
      meanings: {
        korean: "감사함을 표현하기 위해 사용하는 말이에요.",
        english: "An expression of gratitude used to show appreciation.",
        spanish: "Expresión de gratitud para mostrar apreciación.",
      },
      example: '"Thank you so much for your help today!"',
      exampleTranslation: {
        korean: "오늘 도움을 주셔서 정말 감사합니다!",
        english: "Thank you so much for your help today!",
        spanish: "¡Muchas gracias por tu ayuda de hoy!",
      },
      speechLang: "en-US",
    },
    {
      word: "House",
      emoji: "🏠",
      pronunciation: "HOWSS",
      meanings: {
        korean: "사람들이 사는 건물이에요.",
        english: "A building where people live; a home.",
        spanish: "Un edificio donde vive la gente; un hogar.",
      },
      example: '"Their house has a beautiful garden in the backyard."',
      exampleTranslation: {
        korean: "그들의 집 뒤뜰에는 아름다운 정원이 있어요.",
        english: "Their house has a beautiful garden in the backyard.",
        spanish: "Su casa tiene un bello jardín en el patio trasero.",
      },
      speechLang: "en-US",
    },
    {
      word: "Dog",
      emoji: "🐶",
      pronunciation: "DAWG",
      meanings: {
        korean: "반려동물 또는 일을 위해 기르는 가축이에요.",
        english: "A domesticated animal kept as a pet or for work.",
        spanish: "Animal doméstico criado como mascota o para trabajar.",
      },
      example: '"My dog loves to run in the park every evening."',
      exampleTranslation: {
        korean: "제 강아지는 매일 저녁 공원에서 뛰는 것을 좋아해요.",
        english: "My dog loves to run in the park every evening.",
        spanish: "Mi perro adora correr en el parque cada tarde.",
      },
      speechLang: "en-US",
    },
  ],
  korean: [
    {
      word: "안녕하세요",
      emoji: "👋",
      pronunciation: "an-nyeong-ha-se-yo",
      meanings: {
        korean: "한국어에서 가장 일반적인 공손한 인사말이에요.",
        english: "Hello / Good day — the standard polite greeting in Korean.",
        spanish: "Hola / Buenos días — el saludo cortés estándar en coreano.",
      },
      example: "안녕하세요! 저는 민준이에요.",
      exampleTranslation: {
        korean: "안녕하세요! 저는 민준이에요.",
        english: "Hello! My name is Minjun.",
        spanish: "¡Hola! Me llamo Minjun.",
      },
      speechLang: "ko-KR",
    },
    {
      word: "감사합니다",
      emoji: "🙏",
      pronunciation: "gam-sa-ham-ni-da",
      meanings: {
        korean: "정중하게 감사를 표현하는 말이에요.",
        english: "Thank you very much — a formal expression of gratitude.",
        spanish: "Muchas gracias — expresión formal de gratitud en coreano.",
      },
      example: "도와주셔서 감사합니다.",
      exampleTranslation: {
        korean: "도와주셔서 감사합니다.",
        english: "Thank you for helping me.",
        spanish: "Gracias por ayudarme.",
      },
      speechLang: "ko-KR",
    },
    {
      word: "사랑해요",
      emoji: "❤️",
      pronunciation: "sa-rang-hae-yo",
      meanings: {
        korean: "따뜻하고 공손하게 사랑을 표현하는 말이에요.",
        english: "I love you — a warm, polite way to express love.",
        spanish: "Te amo — una manera cálida y cortés de expresar amor en coreano.",
      },
      example: "엄마, 사랑해요.",
      exampleTranslation: {
        korean: "엄마, 사랑해요.",
        english: "Mom, I love you.",
        spanish: "Mamá, te quiero.",
      },
      speechLang: "ko-KR",
    },
    {
      word: "맛있어요",
      emoji: "😋",
      pronunciation: "ma-si-sseo-yo",
      meanings: {
        korean: "음식을 칭찬할 때 사용하는 표현이에요.",
        english: "It's delicious — used to compliment food.",
        spanish: "Está delicioso — se usa para elogiar la comida.",
      },
      example: "이 김치찌개 정말 맛있어요!",
      exampleTranslation: {
        korean: "이 김치찌개 정말 맛있어요!",
        english: "This kimchi stew is really delicious!",
        spanish: "¡Este estofado de kimchi está delicioso!",
      },
      speechLang: "ko-KR",
    },
    {
      word: "화이팅",
      emoji: "💪",
      pronunciation: "hwa-i-ting",
      meanings: {
        korean: "응원할 때 사용하는 한국식 격려 표현이에요.",
        english: "You can do it! — a popular Korean motivational cheer.",
        spanish: "¡Tú puedes! — expresión de aliento coreana muy popular.",
      },
      example: "시험 잘 봐! 화이팅!",
      exampleTranslation: {
        korean: "시험 잘 봐! 화이팅!",
        english: "Good luck on your test! You've got this!",
        spanish: "¡Buena suerte en tu examen! ¡Tú puedes!",
      },
      speechLang: "ko-KR",
    },
    {
      word: "괜찮아요",
      emoji: "😊",
      pronunciation: "gwaen-chan-a-yo",
      meanings: {
        korean: "상대방을 안심시키거나 괜찮다고 말할 때 사용해요.",
        english: "It's okay / I'm fine — used to reassure or accept something.",
        spanish: "Está bien / Estoy bien — para tranquilizar o aceptar algo.",
      },
      example: "걱정 마세요, 괜찮아요.",
      exampleTranslation: {
        korean: "걱정 마세요, 괜찮아요.",
        english: "Don't worry, it's okay.",
        spanish: "No te preocupes, está bien.",
      },
      speechLang: "ko-KR",
    },
  ],
  spanish: [
    {
      word: "Hola",
      emoji: "👋",
      pronunciation: "OH-lah",
      meanings: {
        korean: "스페인어에서 가장 흔한 인사말이에요.",
        english: "Hello — the universal greeting in Spanish.",
        spanish: "Hola — el saludo universal en español.",
      },
      example: "¡Hola! ¿Cómo estás?",
      exampleTranslation: {
        korean: "안녕하세요! 어떻게 지내세요?",
        english: "Hello! How are you?",
        spanish: "¡Hola! ¿Cómo estás?",
      },
      speechLang: "es-ES",
    },
    {
      word: "Gracias",
      emoji: "🙏",
      pronunciation: "GRA-syas",
      meanings: {
        korean: "스페인어로 감사를 표현하는 말이에요.",
        english: "Thank you — expressing appreciation in Spanish.",
        spanish: "Gracias — expresar agradecimiento en español.",
      },
      example: "Muchas gracias por tu ayuda.",
      exampleTranslation: {
        korean: "도와주셔서 정말 감사합니다.",
        english: "Thank you so much for your help.",
        spanish: "Muchas gracias por tu ayuda.",
      },
      speechLang: "es-ES",
    },
    {
      word: "Por favor",
      emoji: "🤝",
      pronunciation: "por fa-VOR",
      meanings: {
        korean: "정중한 부탁을 할 때 사용하는 표현이에요.",
        english: "Please — used to make polite requests.",
        spanish: "Por favor — se usa para hacer peticiones corteses.",
      },
      example: "Un café con leche, por favor.",
      exampleTranslation: {
        korean: "카페라떼 한 잔 부탁해요.",
        english: "A coffee with milk, please.",
        spanish: "Un café con leche, por favor.",
      },
      speechLang: "es-ES",
    },
    {
      word: "Te quiero",
      emoji: "❤️",
      pronunciation: "teh KYEH-ro",
      meanings: {
        korean: "친구나 가족에게 흔히 사용하는 사랑 표현이에요.",
        english: "I love you — commonly used for friends and family.",
        spanish: "Te quiero — comúnmente usado entre amigos y familia.",
      },
      example: "Te quiero mucho, mamá.",
      exampleTranslation: {
        korean: "엄마, 정말 사랑해요.",
        english: "I love you so much, mom.",
        spanish: "Te quiero mucho, mamá.",
      },
      speechLang: "es-ES",
    },
    {
      word: "Buenos días",
      emoji: "☀️",
      pronunciation: "BWEH-nos DEE-as",
      meanings: {
        korean: "활기찬 스페인어 아침 인사예요.",
        english: "Good morning — a cheerful morning greeting in Spanish.",
        spanish: "Buenos días — un alegre saludo matutino en español.",
      },
      example: "¡Buenos días! ¿Dormiste bien?",
      exampleTranslation: {
        korean: "좋은 아침이에요! 잘 잤어요?",
        english: "Good morning! Did you sleep well?",
        spanish: "¡Buenos días! ¿Dormiste bien?",
      },
      speechLang: "es-ES",
    },
    {
      word: "Delicioso",
      emoji: "😋",
      pronunciation: "de-li-SYOH-so",
      meanings: {
        korean: "음식이 정말 맛있다고 표현할 때 사용해요.",
        english: "Delicious — used to express that food tastes amazing.",
        spanish: "Delicioso — se usa para expresar que la comida está muy rica.",
      },
      example: "Esta paella está deliciosa.",
      exampleTranslation: {
        korean: "이 파에야 정말 맛있어요.",
        english: "This paella is delicious.",
        spanish: "Esta paella está deliciosa.",
      },
      speechLang: "es-ES",
    },
  ],
};

const ADVANCED_CARDS: Record<NativeLanguage, FlashCard[]> = {
  english: [
    {
      word: "Serendipity",
      emoji: "✨",
      pronunciation: "sair-en-DIP-i-tee",
      meanings: {
        korean: "우연히 일어난 즐거운 사건; 기분 좋은 놀라움이에요.",
        english: "The occurrence of happy events by chance; a pleasant surprise.",
        spanish: "La ocurrencia de eventos felices por casualidad; una grata sorpresa.",
      },
      example: '"Finding my best friend at that café was pure serendipity."',
      exampleTranslation: {
        korean: "그 카페에서 가장 친한 친구를 만난 건 순전한 세렌디피티였어요.",
        english: "Finding my best friend at that café was pure serendipity.",
        spanish: "Encontrar a mi mejor amigo en ese café fue pura serendipia.",
      },
      speechLang: "en-US",
    },
    {
      word: "Ephemeral",
      emoji: "🌿",
      pronunciation: "eh-FEM-er-ul",
      meanings: {
        korean: "아주 짧은 시간 동안만 지속되는 것; 덧없다는 뜻이에요.",
        english: "Lasting for a very short time; fleeting and transitory.",
        spanish: "Que dura muy poco tiempo; pasajero y transitorio.",
      },
      example: '"Cherry blossoms are ephemeral — they bloom for just two weeks."',
      exampleTranslation: {
        korean: "벚꽃은 덧없어요 — 단 2주 동안만 피어요.",
        english: "Cherry blossoms are ephemeral — they bloom for just two weeks.",
        spanish: "Los cerezos en flor son efímeros — florecen solo dos semanas.",
      },
      speechLang: "en-US",
    },
    {
      word: "Wanderlust",
      emoji: "🌍",
      pronunciation: "WON-der-lust",
      meanings: {
        korean: "세상을 여행하고 탐험하고 싶은 강한 욕구예요.",
        english: "A strong desire to travel and explore the world.",
        spanish: "Un fuerte deseo de viajar y explorar el mundo.",
      },
      example: '"Her wanderlust led her to visit 40 countries before turning 30."',
      exampleTranslation: {
        korean: "그녀의 방랑벽 때문에 30세가 되기 전에 40개국을 여행했어요.",
        english: "Her wanderlust led her to visit 40 countries before turning 30.",
        spanish: "Su espíritu viajero la llevó a visitar 40 países antes de los 30.",
      },
      speechLang: "en-US",
    },
  ],
  spanish: [
    {
      word: "Mariposa",
      emoji: "🦋",
      pronunciation: "mah-ree-POH-sah",
      meanings: {
        korean: "나비 — 우아하고 자유로운 사람을 시적으로 표현할 때도 사용해요.",
        english: "Butterfly — also used poetically for someone graceful and free-spirited.",
        spanish: "Mariposa — también se usa poéticamente para alguien grácil y libre.",
      },
      example: '"Eres como una mariposa — siempre libre y llena de color."',
      exampleTranslation: {
        korean: "당신은 나비 같아요 — 언제나 자유롭고 색깔이 넘쳐요.",
        english: "You are like a butterfly — always free and full of color.",
        spanish: "Eres como una mariposa — siempre libre y llena de color.",
      },
      speechLang: "es-ES",
    },
    {
      word: "Alegría",
      emoji: "😄",
      pronunciation: "ah-leh-GREE-ah",
      meanings: {
        korean: "깊고 생동감 넘치는 기쁨 — 행복을 넘어선 넘치는 활기예요.",
        english: "A deep, vibrant joy — beyond happiness, an exuberance of spirit.",
        spanish: "Una alegría profunda y vibrante — más que felicidad, exuberancia.",
      },
      example: '"La alegría de los niños llenó toda la casa de luz."',
      exampleTranslation: {
        korean: "아이들의 기쁨이 온 집 안을 빛으로 가득 채웠어요.",
        english: "The children's joy filled the whole house with light.",
        spanish: "La alegría de los niños llenó toda la casa de luz.",
      },
      speechLang: "es-ES",
    },
    {
      word: "Sobremesa",
      emoji: "☕",
      pronunciation: "so-breh-MEH-sah",
      meanings: {
        korean: "식사 후 테이블에서 이야기하며 느긋하게 보내는 시간이에요.",
        english: "The time spent lingering at the table after a meal, talking and connecting.",
        spanish: "El tiempo que se pasa en la mesa después de comer, conversando.",
      },
      example: '"La sobremesa duró tres horas — nadie quería irse."',
      exampleTranslation: {
        korean: "식후 담소가 세 시간이나 계속됐어요 — 아무도 자리를 뜨고 싶지 않았어요.",
        english: "The after-dinner conversation lasted three hours — nobody wanted to leave.",
        spanish: "La sobremesa duró tres horas — nadie quería irse.",
      },
      speechLang: "es-ES",
    },
  ],
  korean: [
    {
      word: "눈치",
      emoji: "👁",
      pronunciation: "nun-chi",
      meanings: {
        korean: "분위기를 읽는 미묘한 기술 — 말하지 않아도 감정과 사회적 신호를 감지해요.",
        english: "The subtle art of reading a room — sensing unspoken emotions and social cues.",
        spanish: "El arte sutil de leer el ambiente — percibir emociones y señales sociales.",
      },
      example: "그는 눈치가 빨라서 아무것도 말하지 않아도 다 알아.",
      exampleTranslation: {
        korean: "그는 눈치가 빨라서 아무것도 말하지 않아도 다 알아.",
        english: "He reads the room so well — he knows everything without being told.",
        spanish: "Él es tan perceptivo que lo entiende todo sin que nadie le diga nada.",
      },
      speechLang: "ko-KR",
    },
    {
      word: "정",
      emoji: "❤️",
      pronunciation: "jeong",
      meanings: {
        korean: "오랜 시간 함께한 경험을 통해 형성되는 깊은 정서적 유대감이에요.",
        english: "A deep emotional bond that forms over time through shared experiences.",
        spanish: "Un vínculo emocional profundo que se forma con el tiempo a través de experiencias.",
      },
      example: "오랫동안 함께해서 정이 많이 들었어요.",
      exampleTranslation: {
        korean: "오랫동안 함께해서 정이 많이 들었어요.",
        english: "We've been together so long that a deep bond has formed between us.",
        spanish: "Hemos estado juntos tanto tiempo que se ha formado un vínculo muy profundo.",
      },
      speechLang: "ko-KR",
    },
    {
      word: "한",
      emoji: "🌑",
      pronunciation: "han",
      meanings: {
        korean: "집단적 슬픔, 그리움, 그리고 회복력이 담긴 독특한 한국의 정서예요.",
        english: "A uniquely Korean feeling of collective sorrow, longing, and resilience.",
        spanish: "Un sentimiento únicamente coreano de tristeza colectiva, nostalgia y resiliencia.",
      },
      example: "그 노래에는 우리 민족의 한이 담겨 있다.",
      exampleTranslation: {
        korean: "그 노래에는 우리 민족의 한이 담겨 있다.",
        english: "That song carries the deep sorrow and longing of our people.",
        spanish: "Esa canción lleva el profundo dolor y nostalgia de nuestro pueblo.",
      },
      speechLang: "ko-KR",
    },
  ],
};

let _cardAudio: HTMLAudioElement | null = null;

async function speakWord(word: string, lang: string) {
  try {
    if (Platform.OS === "web") {
      if (_cardAudio) {
        _cardAudio.pause();
        _cardAudio.src = "";
        _cardAudio = null;
      }
      const url = new URL("/api/pronunciation-tts", getApiUrl());
      url.searchParams.set("text", word);
      url.searchParams.set("lang", lang);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
      _cardAudio = audio;
      audio.onended = () => { URL.revokeObjectURL(objectUrl); _cardAudio = null; };
      audio.onerror = () => { URL.revokeObjectURL(objectUrl); _cardAudio = null; };
      await audio.play();
    } else {
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        Speech.stop();
        await new Promise((r) => setTimeout(r, 80));
      }
      Speech.speak(word, { language: lang, rate: 0.85 });
    }
  } catch {}
}

type DeckType = "beginner" | "advanced";

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const { t, nativeLanguage, learningLanguage, stats, updateStats } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const nativeLang = nativeLanguage ?? "english";
  const lang: NativeLanguage = learningLanguage ?? getDefaultLearning(nativeLang as NativeLanguage);

  const [deckType, setDeckType] = useState<DeckType>("beginner");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [gotIt, setGotIt] = useState(0);
  const [again, setAgain] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [xpGain, setXpGain] = useState(0);
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const cards = deckType === "beginner" ? BEGINNER_CARDS_BY_LANG[lang] : ADVANCED_CARDS[lang];
  const card = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const switchDeck = (type: DeckType) => {
    if (type === deckType) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDeckType(type);
    resetState();
  };

  const resetState = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setGotIt(0);
    setAgain(0);
    setCompleted(false);
    Animated.parallel([
      Animated.timing(flipAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
  };

  const handleFlip = () => {
    if (completed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = isFlipped ? 0 : 1;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(flipAnim, { toValue, useNativeDriver: true, tension: 60, friction: 8 }),
    ]).start(() => {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start();
    });
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = useCallback((e: any) => {
    e.stopPropagation?.();
    if (!card) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSpeaking(true);
    speakWord(card.word, card.speechLang);
    setTimeout(() => setIsSpeaking(false), 1500);
  }, [card]);

  const advanceCard = (knew: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (knew) {
      setGotIt((g) => g + 1);
      setXpGain(10);
      updateStats({ xp: statsRef.current.xp + 10 });
    } else {
      setAgain((a) => a + 1);
    }

    Animated.timing(slideAnim, { toValue: knew ? -width : width, duration: 230, useNativeDriver: true }).start(() => {
      slideAnim.setValue(knew ? width : -width);
      flipAnim.setValue(0);
      setIsFlipped(false);
      if (currentIndex + 1 >= cards.length) {
        setCompleted(true);
        slideAnim.setValue(0);
      } else {
        setCurrentIndex((i) => i + 1);
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 10 }).start();
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#FFF0F6", "#FFF8FB"]} style={StyleSheet.absoluteFill} />
      <XPToast amount={xpGain} onDone={() => setXpGain(0)} />

      <View style={styles.header}>
        <Text style={styles.title}>{t("card_deck")}</Text>

        <View style={styles.deckSwitcher}>
          <Pressable
            style={[styles.deckTab, deckType === "beginner" && styles.deckTabActive]}
            onPress={() => switchDeck("beginner")}
          >
            {deckType === "beginner" && (
              <LinearGradient colors={["#FF6B9D", "#FF4081"]} style={StyleSheet.absoluteFill} borderRadius={14} />
            )}
            <Text style={[styles.deckTabText, deckType === "beginner" && styles.deckTabTextActive]}>
              Beginner
            </Text>
          </Pressable>
          <Pressable
            style={[styles.deckTab, deckType === "advanced" && styles.deckTabActive]}
            onPress={() => switchDeck("advanced")}
          >
            {deckType === "advanced" && (
              <LinearGradient colors={["#FF6B9D", "#FF4081"]} style={StyleSheet.absoluteFill} borderRadius={14} />
            )}
            <Text style={[styles.deckTabText, deckType === "advanced" && styles.deckTabTextActive]}>
              Advanced
            </Text>
          </Pressable>
        </View>

        {!completed && (
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{currentIndex + 1}/{cards.length}</Text>
          </View>
        )}
      </View>

      {completed ? (
        <ScrollView
          contentContainerStyle={styles.completedContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.completedEmoji}>🎉</Text>
          <Text style={styles.completedTitle}>{t("well_done")}</Text>
          <Text style={styles.completedSub}>You finished the {deckType} deck!</Text>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreCard, { backgroundColor: "#E8F5E9" }]}>
              <Text style={styles.scoreEmoji}>✅</Text>
              <Text style={[styles.scoreNum, { color: "#4CAF50" }]}>{gotIt}</Text>
              <Text style={styles.scoreLabel}>Got it!</Text>
            </View>
            <View style={[styles.scoreCard, { backgroundColor: "#FFF3E0" }]}>
              <Text style={styles.scoreEmoji}>😅</Text>
              <Text style={[styles.scoreNum, { color: "#FF9800" }]}>{again}</Text>
              <Text style={styles.scoreLabel}>Again</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
            onPress={resetState}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.resetBtnText}>{t("try_again")}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.switchBtn, pressed && { opacity: 0.85 }]}
            onPress={() => switchDeck(deckType === "beginner" ? "advanced" : "beginner")}
          >
            <Text style={styles.switchBtnText}>
              Try {deckType === "beginner" ? "Advanced" : "Beginner"} deck →
            </Text>
          </Pressable>
        </ScrollView>
      ) : (
        <>
          <View style={styles.cardArea}>
            <Animated.View
              style={[
                styles.cardWrapper,
                { transform: [{ translateX: slideAnim }, { scale: scaleAnim }] },
              ]}
            >
              <Pressable onPress={handleFlip} style={styles.cardPressable}>
                <Animated.View
                  style={[
                    styles.card,
                    styles.cardFront,
                    { transform: [{ perspective: 1200 }, { rotateY: frontRotate }], opacity: frontOpacity },
                  ]}
                >
                  <LinearGradient
                    colors={["#FF6B9D", "#FF8FB3"]}
                    style={styles.cardAccentBar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <View style={styles.cardInner}>
                    <Text style={styles.cardEmoji}>{card?.emoji}</Text>
                    <Text style={styles.cardWordFront}>{card?.word}</Text>
                    {card?.pronunciation && (
                      <Text style={styles.cardPronunciation}>/{card.pronunciation}/</Text>
                    )}
                    <Pressable
                      style={({ pressed }) => [styles.speakerBtn, pressed && { opacity: 0.75 }]}
                      onPress={handleSpeak}
                      hitSlop={12}
                    >
                      <LinearGradient
                        colors={isSpeaking ? ["#FF4081", "#FF1744"] : ["#FF6B9D", "#FF8FB3"]}
                        style={styles.speakerBtnGradient}
                      >
                        <Ionicons
                          name={isSpeaking ? "volume-high" : "volume-medium"}
                          size={18}
                          color="#FFFFFF"
                        />
                      </LinearGradient>
                    </Pressable>
                    <View style={styles.flipHint}>
                      <Ionicons name="sync" size={13} color="#C4B5BF" />
                      <Text style={styles.flipHintText}>{t("flip_card")}</Text>
                    </View>
                  </View>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.card,
                    styles.cardBack,
                    { transform: [{ perspective: 1200 }, { rotateY: backRotate }], opacity: backOpacity },
                  ]}
                >
                  <LinearGradient
                    colors={["#FF6B9D", "#E8316E"]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={styles.cardInnerBack}>
                    <Text style={styles.cardEmojiBack}>{card?.emoji}</Text>
                    <Text style={styles.cardWordBack}>{card?.word}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.cardMeaning}>{card?.meanings[nativeLang as NativeLanguage]}</Text>
                    <View style={styles.exampleBox}>
                      <Text style={styles.exampleLabel}>
                        {nativeLang === "korean" ? "예문" : nativeLang === "spanish" ? "Ejemplo" : "Example"}
                      </Text>
                      <Text style={styles.exampleText}>{card?.example}</Text>
                      {card?.exampleTranslation[nativeLang as NativeLanguage] &&
                        card.exampleTranslation[nativeLang as NativeLanguage] !== card.example && (
                        <Text style={styles.exampleTranslationText}>
                          {card.exampleTranslation[nativeLang as NativeLanguage]}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.speakerBtnBack, pressed && { opacity: 0.75 }]}
                      onPress={handleSpeak}
                      hitSlop={12}
                    >
                      <Ionicons
                        name={isSpeaking ? "volume-high" : "volume-medium"}
                        size={16}
                        color="rgba(255,255,255,0.9)"
                      />
                      <Text style={styles.speakerBtnBackText}>Listen</Text>
                    </Pressable>
                  </View>
                </Animated.View>
              </Pressable>
            </Animated.View>
          </View>

          {isFlipped ? (
            <View style={styles.actionRow}>
              <RippleButton
                style={[styles.actionBtn, styles.againBtn]}
                onPress={() => advanceCard(false)}
                rippleColor="rgba(255,152,0,0.35)"
              >
                <View style={styles.actionBtnInner}>
                  <Text style={styles.againBtnEmoji}>😅</Text>
                  <Text style={[styles.actionLabel, { color: "#FF9800" }]}>Again</Text>
                </View>
              </RippleButton>
              <RippleButton
                style={[styles.actionBtn, styles.gotItBtn]}
                onPress={() => advanceCard(true)}
                rippleColor="rgba(76,175,80,0.35)"
              >
                <View style={styles.actionBtnInner}>
                  <Text style={styles.gotItBtnEmoji}>✅</Text>
                  <Text style={[styles.actionLabel, { color: "#4CAF50" }]}>Got it!</Text>
                </View>
              </RippleButton>
            </View>
          ) : (
            <View style={styles.flipPromptRow}>
              <Pressable
                style={({ pressed }) => [styles.flipPromptBtn, pressed && { opacity: 0.8 }]}
                onPress={handleFlip}
              >
                <LinearGradient colors={["#FF6B9D", "#FF4081"]} style={styles.flipPromptGradient}>
                  <Ionicons name="sync" size={18} color="#FFFFFF" />
                  <Text style={styles.flipPromptText}>Tap to reveal meaning</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          <View style={[styles.miniStats, { paddingBottom: Math.max(insets.bottom + 16, 34) }]}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatEmoji}>✅</Text>
              <Text style={[styles.miniStatText, { color: "#4CAF50" }]}>{gotIt}</Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatEmoji}>😅</Text>
              <Text style={[styles.miniStatText, { color: "#FF9800" }]}>{again}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  deckSwitcher: {
    flexDirection: "row",
    backgroundColor: "#F5E6EF",
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  deckTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  deckTabActive: {},
  deckTabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#A08090",
  },
  deckTabTextActive: {
    color: "#FFFFFF",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#F0D6E4",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B9D",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
    minWidth: 32,
    textAlign: "right",
  },
  cardArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: "100%",
  },
  cardPressable: {
    width: "100%",
  },
  card: {
    width: "100%",
    borderRadius: 28,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
    backfaceVisibility: "hidden",
  },
  cardFront: {
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderRadius: 28,
  },
  cardAccentBar: {
    height: 6,
  },
  cardInner: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 10,
    minHeight: 300,
    justifyContent: "center",
  },
  cardInnerBack: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 10,
    minHeight: 300,
    justifyContent: "center",
  },
  cardEmoji: {
    fontSize: 52,
  },
  cardEmojiBack: {
    fontSize: 36,
  },
  cardWordFront: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  cardWordBack: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  cardPronunciation: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
    textAlign: "center",
  },
  speakerBtn: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 4,
  },
  speakerBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  speakerBtnBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginTop: 4,
  },
  speakerBtnBackText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.9)",
  },
  flipHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  flipHintText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#C4B5BF",
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 1,
    marginVertical: 2,
  },
  cardMeaning: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  exampleBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 14,
    gap: 4,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  exampleLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    lineHeight: 20,
    fontStyle: "italic",
  },
  exampleTranslationText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 17,
    marginTop: 6,
    fontStyle: "normal",
  },
  flipPromptRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  flipPromptBtn: {
    borderRadius: 20,
    overflow: "hidden",
  },
  flipPromptGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
  },
  flipPromptText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  actionBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  againBtn: {
    backgroundColor: "#FFF3E0",
    borderWidth: 2,
    borderColor: "#FFE0B2",
  },
  gotItBtn: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#C8E6C9",
  },
  againBtnEmoji: {
    fontSize: 22,
  },
  gotItBtnEmoji: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  miniStats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingTop: 14,
  },
  miniStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  miniStatEmoji: {
    fontSize: 18,
  },
  miniStatText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  miniDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#F0D6E4",
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 20,
    paddingVertical: 40,
  },
  completedEmoji: {
    fontSize: 72,
  },
  completedTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  completedSub: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
  },
  scoreRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  scoreCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  scoreEmoji: {
    fontSize: 32,
  },
  scoreNum: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  scoreLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FF6B9D",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  resetBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  switchBtn: {
    paddingVertical: 12,
  },
  switchBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#FF6B9D",
  },
});
