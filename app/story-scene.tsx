import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";

const lingoImg = require("@/assets/lingo.png");

const { width, height } = Dimensions.get("window");

/* ─────────────────── DATA ─────────────────── */

interface Character {
  id: string;
  emoji: string;
  name: string;
  nameKo?: string;
  personality: string;
  personalityKo?: string;
  personalityEs?: string;
  side: "left" | "right";
  avatarBg: string;
  isLingo?: boolean;
}

interface Scene {
  charId: string;
  text: string;
  textKo?: string;
  textEs?: string;
}

interface Story {
  id: string;
  title: string;
  titleKo: string;
  titleEs: string;
  gradient: readonly [string, string, string];
  bgAccent: string;
  bubbleColor: string;
  bubbleText: string;
  accentColor: string;
  progressColor: string;
  characters: Character[];
  scenes: Scene[];
}

const STORIES: Record<string, Story> = {
  london: {
    id: "london",
    title: "London Mystery",
    titleKo: "런던 미스터리",
    titleEs: "Misterio en Londres",
    gradient: ["#0D1117", "#1A1A2E", "#16213E"],
    bgAccent: "#E94560",
    bubbleColor: "#1E2A3A",
    bubbleText: "#E8F0F8",
    accentColor: "#E94560",
    progressColor: "#E94560",
    characters: [
      {
        id: "lingo",
        emoji: "🦊",
        name: "Detective Lingo",
        nameKo: "링고 탐정",
        personality: "Your sharp-witted fox detective guide",
        personalityKo: "재치있는 여우 탐정 가이드",
        personalityEs: "Tu astuto guía detective zorro",
        side: "left",
        avatarBg: "#FFE8D0",
        isLingo: true,
      },
      {
        id: "james",
        emoji: "🕵️",
        name: "Detective James",
        nameKo: "제임스 형사",
        personality: "Calm, sharp, never gives up",
        personalityKo: "침착하고 날카로운 탐정",
        personalityEs: "Calmado, perspicaz, nunca se rinde",
        side: "left",
        avatarBg: "#2A3A4A",
      },
      {
        id: "victoria",
        emoji: "👩",
        name: "Lady Victoria",
        nameKo: "빅토리아 부인",
        personality: "Elegant, worried, hiding something",
        personalityKo: "우아하지만 뭔가를 숨기고 있다",
        personalityEs: "Elegante, preocupada, esconde algo",
        side: "right",
        avatarBg: "#3A2A4A",
      },
      {
        id: "villain",
        emoji: "🦹",
        name: "Mystery Villain",
        nameKo: "수수께끼의 악당",
        personality: "???",
        personalityKo: "???",
        personalityEs: "???",
        side: "right",
        avatarBg: "#2A1A1A",
      },
    ],
    scenes: [
      {
        charId: "lingo",
        text: "Ah, a new case! I'm Detective Lingo 🦊 — your guide through foggy London. Shall we solve this mystery together?",
        textKo: "새 사건이 들어왔어요! 저는 링고 탐정이에요 🦊 — 안개 낀 런던의 가이드. 함께 이 미스터리를 풀어볼까요?",
        textEs: "¡Un nuevo caso! Soy el Detective Lingo 🦊 — tu guía por la neblinosa Londres. ¿Resolvemos este misterio juntos?",
      },
      {
        charId: "james",
        text: "*sigh* Another foggy night in London... I've been investigating this case for three long weeks.",
        textKo: "*한숨* 또 안개 낀 런던의 밤... 이 사건을 3주째 조사하고 있어.",
        textEs: "*suspiro* Otra noche de niebla en Londres... Llevo tres semanas investigando este caso.",
      },
      {
        charId: "victoria",
        text: "Detective James! Thank goodness you've come. Someone has stolen the Diamond of Kensington!",
        textKo: "제임스 형사님! 오셔서 다행이에요. 켄싱턴 다이아몬드가 도난당했어요!",
        textEs: "¡Detective James! Gracias a Dios que vino. ¡Alguien robó el Diamante de Kensington!",
      },
      {
        charId: "james",
        text: "Don't worry, Lady Victoria. Tell me — who had access to the vault last Tuesday?",
        textKo: "걱정 마세요, 빅토리아 부인. 지난 화요일에 금고에 접근한 사람이 누구였죠?",
        textEs: "No se preocupe, Lady Victoria. Dígame — ¿quién tuvo acceso a la bóveda el martes pasado?",
      },
      {
        charId: "victoria",
        text: "Only my butler, my solicitor... and a mysterious stranger who appeared at the door that evening.",
        textKo: "집사와 변호사, 그리고... 그날 저녁 문 앞에 나타난 수수께끼의 낯선 사람뿐이었어요.",
        textEs: "Solo mi mayordomo, mi abogado... y un misterioso extraño que apareció en la puerta esa tarde.",
      },
      {
        charId: "james",
        text: "A stranger? What did this person look like? Every detail matters.",
        textKo: "낯선 사람이요? 그 사람이 어떻게 생겼나요? 모든 세부 사항이 중요합니다.",
        textEs: "¿Un extraño? ¿Cómo era esa persona? Cada detalle importa.",
      },
      {
        charId: "villain",
        text: "How terribly clever of you, Detective... But can you catch someone who doesn't exist?",
        textKo: "참 영리하시군요, 형사님... 하지만 존재하지 않는 사람을 잡을 수 있을까요?",
        textEs: "Qué inteligente eres, Detective... ¿Pero puedes atrapar a alguien que no existe?",
      },
      {
        charId: "james",
        text: "I know exactly who you are. The game is over. Step into the light.",
        textKo: "당신이 누군지 정확히 알아요. 게임 끝이에요. 밝은 곳으로 나와요.",
        textEs: "Sé exactamente quién eres. El juego ha terminado. Sal a la luz.",
      },
      {
        charId: "villain",
        text: "Perhaps... but the real mystery has only just begun. *vanishes into the fog*",
        textKo: "어쩌면... 진짜 수수께끼는 이제 막 시작됐을 뿐이에요. *안개 속으로 사라진다*",
        textEs: "Quizás... pero el verdadero misterio apenas ha comenzado. *desaparece en la niebla*",
      },
    ],
  },

  madrid: {
    id: "madrid",
    title: "Madrid Romance",
    titleKo: "마드리드 로맨스",
    titleEs: "Romance en Madrid",
    gradient: ["#8B1A1A", "#C41E3A", "#FF6B35"],
    bgAccent: "#FFCD3C",
    bubbleColor: "#FFF8F0",
    bubbleText: "#2A1A0A",
    accentColor: "#C41E3A",
    progressColor: "#FF6B35",
    characters: [
      {
        id: "lingo",
        emoji: "🦊",
        name: "Lingo",
        nameKo: "링고",
        personality: "Your friendly guide to Madrid!",
        personalityKo: "마드리드 여행의 친절한 가이드!",
        personalityEs: "¡Tu amistoso guía por Madrid!",
        side: "left",
        avatarBg: "#FFF0E0",
        isLingo: true,
      },
      {
        id: "isabella",
        emoji: "💃",
        name: "Isabella",
        nameKo: "이사벨라",
        personality: "Warm, passionate, fiercely independent",
        personalityKo: "따뜻하고 열정적이며 독립적인",
        personalityEs: "Cálida, apasionada, fervientemente independiente",
        side: "right",
        avatarBg: "#FFE8D6",
      },
      {
        id: "carlos",
        emoji: "👨",
        name: "Carlos",
        nameKo: "카를로스",
        personality: "Charming, mysterious, secretly lonely",
        personalityKo: "매력적이고 신비롭지만 사실 외로운",
        personalityEs: "Encantador, misterioso, secretamente solitario",
        side: "left",
        avatarBg: "#E8D6FF",
      },
      {
        id: "abuela",
        emoji: "👵",
        name: "Abuela Rosa",
        nameKo: "아부엘라 로사 할머니",
        personality: "Wise, kind, always right about love",
        personalityKo: "지혜롭고 친절한, 사랑에 관해서는 항상 옳은",
        personalityEs: "Sabia, bondadosa, siempre tiene razón sobre el amor",
        side: "right",
        avatarBg: "#FFD6E8",
      },
    ],
    scenes: [
      {
        charId: "lingo",
        text: "¡Hola! I'm Lingo 🦊 — your guide to Madrid! Get ready for romance, passion, and the Spanish language!",
        textKo: "¡Hola! 저는 링고예요 🦊 — 마드리드 가이드! 로맨스, 열정, 그리고 스페인어를 배울 준비가 됐나요?",
        textEs: "¡Hola! ¡Soy Lingo 🦊 — tu guía en Madrid! ¡Prepárate para el romance, la pasión y el español!",
      },
      {
        charId: "isabella",
        text: "¡Bienvenido a Madrid! Welcome to my family's restaurant. I am Isabella. And you are...?",
        textKo: "¡Bienvenido a Madrid! 우리 가족 식당에 오신 걸 환영해요. 저는 이사벨라예요. 당신은...?",
        textEs: "¡Bienvenido a Madrid! Bienvenido al restaurante de mi familia. Soy Isabella. ¿Y tú eres...?",
      },
      {
        charId: "carlos",
        text: "Buenos días, señorita. They say your paella is magnífica... just like the chef who makes it.",
        textKo: "안녕하세요, 아가씨. 당신의 파에야가 magnífica(최고라고)라고 하더군요... 그걸 만드는 셰프처럼요.",
        textEs: "Buenos días, señorita. Dicen que tu paella es magnífica... igual que la chef que la prepara.",
      },
      {
        charId: "isabella",
        text: "¡Ay, qué romántico! You think smooth words will impress me, señor? I've heard them all before.",
        textKo: "¡Ay, qué romántico! 그런 말로 나를 감동시킬 수 있다고 생각해요, 선생님? 전부 들어본 말들이에요.",
        textEs: "¡Ay, qué romántico! ¿Crees que las palabras bonitas me impresionarán, señor? Las he escuchado todas.",
      },
      {
        charId: "abuela",
        text: "¡Mija! Don't be so quick to judge. A man who speaks beautifully... carries a beautiful heart.",
        textKo: "¡Mija! 너무 성급하게 판단하지 마라. 아름답게 말하는 남자는... 아름다운 마음을 가지고 있단다.",
        textEs: "¡Mija! No seas tan rápida para juzgar. Un hombre que habla bellamente... lleva un corazón hermoso.",
      },
      {
        charId: "carlos",
        text: "Por favor, Isabella. Let me take you to see the sunset at Plaza Mayor tonight. Just one evening.",
        textKo: "부탁드려요, 이사벨라. 오늘 밤 Plaza Mayor에서 일몰을 보러 가지 않을래요? 딱 하루 저녁만요.",
        textEs: "Por favor, Isabella. Déjame llevarte a ver el atardecer en la Plaza Mayor esta noche. Solo una tarde.",
      },
      {
        charId: "isabella",
        text: "*smiles* Quizás... Perhaps. But only if you can cook as well as you talk, señor.",
        textKo: "*웃으며* Quizás... 어쩌면요. 하지만 당신이 말하는 것만큼 요리도 잘한다면요, 선생님.",
        textEs: "*sonríe* Quizás... Quizás. Pero solo si cocinas tan bien como hablas, señor.",
      },
      {
        charId: "abuela",
        text: "¡Perfecto! I will teach you my secret recipe, Carlos. But first — taste my churros and tell me the truth!",
        textKo: "¡Perfecto! 내 비밀 레시피를 가르쳐 줄게, 카를로스. 하지만 먼저 - 내 추로스를 맛보고 솔직히 말해봐!",
        textEs: "¡Perfecto! Te enseñaré mi receta secreta, Carlos. ¡Pero primero — prueba mis churros y dime la verdad!",
      },
      {
        charId: "carlos",
        text: "¡Increíble, Abuela Rosa! These are the most delicious churros I've ever tasted in my life. ¡Gracias!",
        textKo: "¡Increíble, Abuela Rosa! 이건 제가 평생 먹어본 가장 맛있는 추로스예요. ¡Gracias!",
        textEs: "¡Increíble, Abuela Rosa! Estos son los churros más deliciosos que he probado en mi vida. ¡Gracias!",
      },
    ],
  },

  seoul: {
    id: "seoul",
    title: "K-Drama Seoul",
    titleKo: "K-드라마 서울",
    titleEs: "K-Drama Seúl",
    gradient: ["#050510", "#0A0A20", "#10103A"],
    bgAccent: "#FF6B9D",
    bubbleColor: "#12122A",
    bubbleText: "#E8E8FF",
    accentColor: "#FF6B9D",
    progressColor: "#7C7CFF",
    characters: [
      {
        id: "lingo",
        emoji: "🦊",
        name: "Lingo",
        nameKo: "링고",
        personality: "Your guide to the K-Drama world!",
        personalityKo: "K-드라마 세계의 가이드!",
        personalityEs: "¡Tu guía al mundo K-Drama!",
        side: "left",
        avatarBg: "#FFE8D0",
        isLingo: true,
      },
      {
        id: "junhyuk",
        emoji: "👨‍💼",
        name: "이준혁",
        nameKo: "이준혁",
        personality: "Cold outside, warm inside — powerful CEO",
        personalityKo: "겉으로는 냉정하지만 속은 따뜻한 CEO",
        personalityEs: "Frío por fuera, cálido por dentro — CEO poderoso",
        side: "right",
        avatarBg: "#1A1A3A",
      },
      {
        id: "seoyeon",
        emoji: "👩",
        name: "김서연",
        nameKo: "김서연",
        personality: "Lost her memories, pure and kind heart",
        personalityKo: "기억을 잃었지만 순수하고 착한 마음",
        personalityEs: "Perdió sus recuerdos, corazón puro y bondadoso",
        side: "left",
        avatarBg: "#2A1A3A",
      },
      {
        id: "minji",
        emoji: "👩‍⚕️",
        name: "박민지",
        nameKo: "박민지",
        personality: "Knows a secret that changes everything",
        personalityKo: "모든 것을 바꿀 비밀을 알고 있다",
        personalityEs: "Conoce un secreto que cambia todo",
        side: "left",
        avatarBg: "#1A2A1A",
      },
    ],
    scenes: [
      {
        charId: "lingo",
        text: "안녕하세요! I'm Lingo 🦊 — your guide to Seoul! Prepare for a K-Drama full of secrets, love, and emotion!",
        textKo: "안녕하세요! 저는 링고예요 🦊 — 서울 가이드! 비밀, 사랑, 감동이 넘치는 K-드라마를 시작해봐요!",
        textEs: "¡안녕하세요! ¡Soy Lingo 🦊 — tu guía en Seúl! ¡Prepárate para un K-Drama lleno de secretos, amor y emoción!",
      },
      {
        charId: "junhyuk",
        text: "...당신은 누구입니까? (Who are you?) This is a private building. Leave at once.",
        textKo: "...당신은 누구입니까? 여기는 사유지입니다. 당장 나가세요.",
        textEs: "...¿Quién eres tú? (Who are you?) Este es un edificio privado. Salga de inmediato.",
      },
      {
        charId: "seoyeon",
        text: "저는... 기억이 없어요. (I have no memories.) I only found your name written on a paper in my pocket.",
        textKo: "저는... 기억이 없어요. 주머니 안에 당신 이름이 적힌 종이만 있었어요.",
        textEs: "저는... 기억이 없어요. (No tengo recuerdos.) Solo encontré su nombre escrito en un papel en mi bolsillo.",
      },
      {
        charId: "junhyuk",
        text: "말도 안 돼요. (That's impossible.) We have never met. I don't know you.",
        textKo: "말도 안 돼요. 우리는 만난 적이 없어요. 당신을 모릅니다.",
        textEs: "말도 안 돼요. (Es imposible.) Nunca nos hemos conocido. No la conozco.",
      },
      {
        charId: "minji",
        text: "이 대표님! (CEO Lee!) I need to speak with you privately — it's about 서연 씨. It's urgent.",
        textKo: "이 대표님! 개인적으로 말씀드릴 게 있어요 — 서연 씨에 관한 일이에요. 급해요.",
        textEs: "이 대표님! (¡Director Lee!) Necesito hablar con usted en privado — es sobre 서연. Es urgente.",
      },
      {
        charId: "junhyuk",
        text: "민지야, 뭘 알고 있어? (Minji, what do you know?) Tell me everything. Right now.",
        textKo: "민지야, 뭘 알고 있어? 지금 당장 모든 걸 말해줘.",
        textEs: "민지야, 뭘 알고 있어? (Minji, ¿qué sabes?) Cuéntame todo. Ahora mismo.",
      },
      {
        charId: "minji",
        text: "서연 씨는... 사실 당신의 약혼녀였어요. (Seo-yeon was actually your fiancée.) Three years ago, there was an accident...",
        textKo: "서연 씨는... 사실 당신의 약혼녀였어요. 3년 전에 사고가 있었어요...",
        textEs: "서연 씨는... (Seo-yeon era en realidad su prometida.) Hace tres años, hubo un accidente...",
      },
      {
        charId: "junhyuk",
        text: "...서연아. *looks at her with a thousand emotions in his eyes*",
        textKo: "...서연아. *수천 가지 감정이 담긴 눈으로 그녀를 바라본다*",
        textEs: "...서연아. *La mira con mil emociones en sus ojos*",
      },
      {
        charId: "seoyeon",
        text: "당신을... 아는 것 같아요. (I feel like I know you.) Why does my heart hurt so much when I look at you?",
        textKo: "당신을... 아는 것 같아요. 왜 당신을 보면 마음이 이렇게 아프죠?",
        textEs: "당신을... 아는 것 같아요. (Siento que te conozco.) ¿Por qué me duele tanto el corazón cuando te miro?",
      },
    ],
  },
};

/* ─────────────────── COMPONENT ─────────────────── */

export default function StoryScene() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { nativeLanguage } = useLanguage();
  const lang = nativeLanguage ?? "english";

  const story = STORIES[id ?? "london"] ?? STORIES.london;
  const [sceneIdx, setSceneIdx] = useState(0);
  const [done, setDone] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const charAnim  = useRef(new Animated.Value(1)).current;

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const currentScene = story.scenes[sceneIdx];
  const character = story.characters.find((c) => c.id === currentScene?.charId) ?? story.characters[0];

  function getSceneText(scene: (typeof story.scenes)[0]) {
    if (lang === "korean" && scene.textKo) return scene.textKo;
    if (lang === "spanish" && scene.textEs) return scene.textEs;
    return scene.text;
  }

  function getCharName(char: Character) {
    if (lang === "korean" && char.nameKo) return char.nameKo;
    return char.name;
  }

  function getCharPersonality(char: Character) {
    if (lang === "korean" && char.personalityKo) return char.personalityKo;
    if (lang === "spanish" && char.personalityEs) return char.personalityEs;
    return char.personality;
  }

  function getStoryTitle() {
    if (lang === "korean") return story.titleKo;
    if (lang === "spanish") return story.titleEs;
    return story.title;
  }

  function nextLabel() {
    if (lang === "korean") return sceneIdx < story.scenes.length - 1 ? "다음 ▶" : "완료 ✓";
    if (lang === "spanish") return sceneIdx < story.scenes.length - 1 ? "Siguiente ▶" : "Fin ✓";
    return sceneIdx < story.scenes.length - 1 ? "Next ▶" : "Finish ✓";
  }

  function handleNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (sceneIdx >= story.scenes.length - 1) {
      setDone(true);
      return;
    }

    // Animate out then in
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(charAnim,  { toValue: 0.85, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setSceneIdx((i) => i + 1);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.spring(charAnim,  { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      ]).start();
    });
  }

  /* ── Completion screen ── */
  if (done) {
    return (
      <LinearGradient colors={story.gradient} style={[styles.completionBg, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Text style={styles.completionEmoji}>🎉</Text>
        <Text style={styles.completionTitle}>
          {lang === "korean" ? "이야기 완료!" : lang === "spanish" ? "¡Historia completa!" : "Story Complete!"}
        </Text>
        <Text style={[styles.completionSub, { color: story.accentColor }]}>{getStoryTitle()}</Text>
        <Text style={styles.completionDesc}>
          {lang === "korean"
            ? `${story.scenes.length}개의 장면을 모두 읽었어요!`
            : lang === "spanish"
            ? `¡Leíste las ${story.scenes.length} escenas!`
            : `You read all ${story.scenes.length} scenes!`}
        </Text>
        <View style={styles.completionBtns}>
          <Pressable
            style={[styles.completionBtn, { backgroundColor: story.accentColor }]}
            onPress={() => { setSceneIdx(0); setDone(false); }}
          >
            <Text style={styles.completionBtnText}>
              {lang === "korean" ? "다시 읽기" : lang === "spanish" ? "Releer" : "Read Again"}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.completionBtn, { backgroundColor: "rgba(255,255,255,0.15)" }]}
            onPress={() => router.back()}
          >
            <Text style={styles.completionBtnText}>
              {lang === "korean" ? "목록으로" : lang === "spanish" ? "Ver lista" : "Back to Stories"}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  const isLeft = character.side === "left";

  return (
    <View style={styles.root}>
      {/* ── Background ── */}
      <LinearGradient colors={story.gradient} style={StyleSheet.absoluteFill} />

      {/* Decorative glow behind character */}
      <View
        style={[
          styles.glow,
          isLeft ? { left: -40 } : { right: -40 },
          { backgroundColor: story.accentColor + "20" },
        ]}
      />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <Text style={styles.storyTitle}>{getStoryTitle()}</Text>
        <View style={styles.sceneCounter}>
          <Text style={[styles.sceneCountText, { color: story.accentColor }]}>
            {sceneIdx + 1} / {story.scenes.length}
          </Text>
        </View>
      </View>

      {/* ── Progress bar ── */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((sceneIdx + 1) / story.scenes.length) * 100}%` as any,
              backgroundColor: story.progressColor,
            },
          ]}
        />
      </View>

      {/* ── Character Stage ── */}
      <View style={[styles.stage, isLeft ? { alignItems: "flex-start" } : { alignItems: "flex-end" }]}>
        <Animated.View
          style={[
            styles.characterBlock,
            isLeft ? { marginLeft: 28 } : { marginRight: 28 },
            { opacity: charAnim, transform: [{ scale: charAnim }] },
          ]}
        >
          {/* Character info above avatar */}
          <View style={[styles.charInfo, isLeft ? { alignItems: "flex-start" } : { alignItems: "flex-end" }]}>
            <Text style={styles.charPersonality}>{getCharPersonality(character)}</Text>
            <Text style={styles.charName}>{getCharName(character)}</Text>
          </View>

          {/* Avatar */}
          <View style={[styles.avatarOuter, { shadowColor: story.accentColor }]}>
            <View style={[styles.avatarInner, { backgroundColor: character.avatarBg }]}>
              {character.isLingo ? (
                <Image source={lingoImg} style={styles.lingoAvatar} />
              ) : (
                <Text style={styles.avatarEmoji}>{character.emoji}</Text>
              )}
            </View>
            {/* Accent ring */}
            <View style={[styles.avatarRing, { borderColor: story.accentColor + "60" }]} />
          </View>
        </Animated.View>
      </View>

      {/* ── Dialogue Box ── */}
      <Animated.View
        style={[
          styles.dialogueBox,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }], backgroundColor: story.bubbleColor },
          { paddingBottom: bottomPad + 16 },
        ]}
      >
        {/* Speaker label */}
        <View style={styles.speakerRow}>
          <View style={[styles.speakerTag, { backgroundColor: story.accentColor }]}>
            <Text style={styles.speakerEmoji}>{character.emoji}</Text>
            <Text style={styles.speakerName}>{getCharName(character)}</Text>
          </View>
        </View>

        {/* Dialogue text */}
        <Text style={[styles.dialogueText, { color: story.bubbleText }]}>
          {getSceneText(currentScene)}
        </Text>

        {/* Dot progress indicators */}
        <View style={styles.dotsRow}>
          {story.scenes.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === sceneIdx
                  ? { backgroundColor: story.accentColor, width: 18 }
                  : i < sceneIdx
                  ? { backgroundColor: story.accentColor + "60" }
                  : { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            />
          ))}
        </View>

        {/* Next button */}
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: story.accentColor },
            pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>{nextLabel()}</Text>
          <Ionicons
            name={sceneIdx < story.scenes.length - 1 ? "play-forward" : "checkmark"}
            size={16}
            color="#FFFFFF"
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050510" },

  /* ─ Header ─ */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
    zIndex: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  storyTitle: {
    flex: 1,
    fontSize: 15, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.9)",
  },
  sceneCounter: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  sceneCountText: { fontSize: 12, fontFamily: "Inter_700Bold" },

  /* ─ Progress ─ */
  progressTrack: { height: 3, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 20 },
  progressFill: { height: "100%", borderRadius: 2 },

  /* ─ Glow ─ */
  glow: { position: "absolute", top: "20%", width: 220, height: 220, borderRadius: 110, zIndex: 0 },

  /* ─ Stage ─ */
  stage: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 10,
    zIndex: 1,
  },
  characterBlock: { alignItems: "center", gap: 12 },
  charInfo: { gap: 2 },
  charPersonality: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", maxWidth: 180, textAlign: "center" },
  charName: { fontSize: 16, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.95)" },
  avatarOuter: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },
  avatarInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEmoji: { fontSize: 68 },
  lingoAvatar: {
    width: 118,
    height: 118,
    resizeMode: "contain",
    backgroundColor: "transparent",
    ...(Platform.OS === "web" ? { mixBlendMode: "multiply" } as any : {}),
  },
  avatarRing: {
    position: "absolute",
    top: -6, left: -6,
    width: 142, height: 142,
    borderRadius: 71,
    borderWidth: 2,
  },

  /* ─ Dialogue Box ─ */
  dialogueBox: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 22,
    paddingHorizontal: 22,
    gap: 14,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  speakerRow: { flexDirection: "row" },
  speakerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  speakerEmoji: { fontSize: 14 },
  speakerName: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  dialogueText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
    minHeight: 78,
  },
  dotsRow: { flexDirection: "row", gap: 5, justifyContent: "center" },
  dot: { height: 6, width: 6, borderRadius: 3 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 2,
  },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },

  /* ─ Completion ─ */
  completionBg: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  completionEmoji: { fontSize: 64, marginBottom: 8 },
  completionTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  completionSub: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  completionDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 12 },
  completionBtns: { width: "100%", gap: 10 },
  completionBtn: { paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  completionBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
});
