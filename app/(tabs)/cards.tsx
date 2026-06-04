import React, { useState, useRef, useCallback, useEffect } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  Animated,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { useLanguage, NativeLanguage, getEffectiveLearningLanguage, toNativeLearning } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { apiFetchWithAuth, getAuthHeaderRecord } from "@/lib/apiFetchWithAuth";
import { getDueCards, getDueCount, recordReview } from "@/lib/srsManager";
import { srsCardsToFlashCards } from "@/lib/srsCardAdapter";
import { trackLearningEvent } from "@/lib/learningEvents";
import { saveSpeakMissionHandoff } from "@/lib/speakMissionHandoff";
import { buildAcquisitionSession, mergeRecentFirst } from "@/lib/acquisitionSession";
import { loadCardPractice, recordCardPracticeReview, saveCardPracticeSnapshot } from "@/lib/learnerProfile";
import { localDateString } from "@/lib/progressStorage";
import { XPToast } from "@/components/XPToast";
import { RippleButton } from "@/components/RippleButton";
import { EmojiText } from "@/components/EmojiText";
import { BidiTargetText } from "@/components/BidiTargetText";
import { C, F } from "@/constants/theme";

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
  /* ── INDONESIAN (user is learning Indonesian) ──────────── */
  indonesian: [
    /* ── A1 Beginner ── */
    { word: "Halo", emoji: "👋", pronunciation: "HA-lo",
      meanings: { korean: "인도네시아어에서 가장 흔한 인사말이에요.", english: "Hello — the most common greeting in Indonesian.", spanish: "Hola — el saludo más común en indonesio.", indonesian: "Halo — sapaan yang paling umum dalam bahasa Indonesia." },
      example: "Halo, apa kabar?",
      exampleTranslation: { korean: "안녕하세요, 잘 지내세요?", english: "Hello, how are you?", spanish: "Hola, ¿cómo estás?", indonesian: "Halo, apa kabar?" }, speechLang: "id-ID" },

    { word: "Terima kasih", emoji: "🙏", pronunciation: "te-REE-ma KA-sih",
      meanings: { korean: "감사를 표현할 때 사용하는 말이에요.", english: "Thank you — used to express gratitude.", spanish: "Gracias — se usa para expresar agradecimiento.", indonesian: "Terima kasih — dipakai untuk menyatakan rasa syukur." },
      example: "Terima kasih banyak atas bantuanmu.",
      exampleTranslation: { korean: "도와주셔서 정말 감사합니다.", english: "Thank you so much for your help.", spanish: "Muchas gracias por tu ayuda.", indonesian: "Terima kasih banyak atas bantuanmu." }, speechLang: "id-ID" },

    { word: "Tolong", emoji: "🤝", pronunciation: "TO-long",
      meanings: { korean: "정중하게 부탁하거나 도움을 청할 때 쓰는 말이에요.", english: "Please / Help — used to make a polite request or ask for help.", spanish: "Por favor / Ayuda — para pedir algo con cortesía o pedir ayuda.", indonesian: "Tolong — dipakai untuk meminta sesuatu dengan sopan atau minta bantuan." },
      example: "Tolong bantu saya membawa tas ini.",
      exampleTranslation: { korean: "이 가방 드는 것 좀 도와주세요.", english: "Please help me carry this bag.", spanish: "Por favor, ayúdame a llevar esta bolsa.", indonesian: "Tolong bantu saya membawa tas ini." }, speechLang: "id-ID" },

    { word: "Maaf", emoji: "🙇", pronunciation: "MA-af",
      meanings: { korean: "사과하거나 실례를 구할 때 사용하는 말이에요.", english: "Sorry / Excuse me — used to apologize or get attention politely.", spanish: "Perdón / Disculpa — para disculparse o llamar la atención con cortesía.", indonesian: "Maaf — dipakai untuk meminta maaf atau meminta perhatian dengan sopan." },
      example: "Maaf, saya terlambat hari ini.",
      exampleTranslation: { korean: "죄송해요, 오늘 늦었어요.", english: "Sorry, I am late today.", spanish: "Perdón, hoy llego tarde.", indonesian: "Maaf, saya terlambat hari ini." }, speechLang: "id-ID" },

    { word: "Selamat pagi", emoji: "☀️", pronunciation: "se-LA-mat PA-gi",
      meanings: { korean: "활기찬 인도네시아어 아침 인사예요.", english: "Good morning — a cheerful morning greeting in Indonesian.", spanish: "Buenos días — un alegre saludo matutino en indonesio.", indonesian: "Selamat pagi — sapaan pagi yang ceria dalam bahasa Indonesia." },
      example: "Selamat pagi! Apakah kamu tidur nyenyak?",
      exampleTranslation: { korean: "좋은 아침이에요! 잘 잤어요?", english: "Good morning! Did you sleep well?", spanish: "¡Buenos días! ¿Dormiste bien?", indonesian: "Selamat pagi! Apakah kamu tidur nyenyak?" }, speechLang: "id-ID" },

    { word: "Selamat malam", emoji: "🌙", pronunciation: "se-LA-mat MA-lam",
      meanings: { korean: "저녁이나 밤에 하는 인도네시아어 인사예요.", english: "Good evening / Good night — an Indonesian greeting used at night.", spanish: "Buenas noches — un saludo indonesio que se usa por la noche.", indonesian: "Selamat malam — sapaan dalam bahasa Indonesia yang dipakai pada malam hari." },
      example: "Selamat malam, sampai jumpa besok.",
      exampleTranslation: { korean: "안녕히 주무세요, 내일 봐요.", english: "Good night, see you tomorrow.", spanish: "Buenas noches, hasta mañana.", indonesian: "Selamat malam, sampai jumpa besok." }, speechLang: "id-ID" },

    { word: "Ya", emoji: "✅", pronunciation: "YA",
      meanings: { korean: "긍정이나 동의를 나타내는 '네'라는 말이에요.", english: "Yes — used to agree or confirm something.", spanish: "Sí — para estar de acuerdo o confirmar algo.", indonesian: "Ya — dipakai untuk menyetujui atau membenarkan sesuatu." },
      example: "Ya, saya mau ikut denganmu.",
      exampleTranslation: { korean: "네, 당신과 함께 갈게요.", english: "Yes, I want to come with you.", spanish: "Sí, quiero ir contigo.", indonesian: "Ya, saya mau ikut denganmu." }, speechLang: "id-ID" },

    { word: "Tidak", emoji: "🚫", pronunciation: "TEE-dak",
      meanings: { korean: "부정이나 거절을 나타내는 '아니요'라는 말이에요.", english: "No / Not — used to refuse or negate something.", spanish: "No — para rechazar o negar algo.", indonesian: "Tidak — dipakai untuk menolak atau menyangkal sesuatu." },
      example: "Tidak, saya tidak suka kopi.",
      exampleTranslation: { korean: "아니요, 저는 커피를 좋아하지 않아요.", english: "No, I do not like coffee.", spanish: "No, no me gusta el café.", indonesian: "Tidak, saya tidak suka kopi." }, speechLang: "id-ID" },

    { word: "Air", emoji: "💧", pronunciation: "A-ir",
      meanings: { korean: "모든 생명체에 필수적인 맑은 액체예요.", english: "Water — the clear liquid essential for all life.", spanish: "Agua — el líquido transparente esencial para toda la vida.", indonesian: "Air — cairan bening yang penting bagi semua kehidupan." },
      example: "Tolong berikan saya segelas air.",
      exampleTranslation: { korean: "물 한 잔 주세요.", english: "Please give me a glass of water.", spanish: "Por favor, dame un vaso de agua.", indonesian: "Tolong berikan saya segelas air." }, speechLang: "id-ID" },

    { word: "Makan", emoji: "🍴", pronunciation: "MA-kan",
      meanings: { korean: "음식을 씹고 삼키는 행동이에요.", english: "To eat — the action of chewing and swallowing food.", spanish: "Comer — la acción de masticar e ingerir alimentos.", indonesian: "Makan — tindakan mengunyah dan menelan makanan." },
      example: "Saya suka makan nasi goreng.",
      exampleTranslation: { korean: "저는 나시고렝 먹는 것을 좋아해요.", english: "I like to eat fried rice.", spanish: "Me gusta comer arroz frito.", indonesian: "Saya suka makan nasi goreng." }, speechLang: "id-ID" },

    { word: "Minum", emoji: "🥤", pronunciation: "MEE-num",
      meanings: { korean: "액체를 마시는 행동이에요.", english: "To drink — to take a liquid into your mouth.", spanish: "Beber — llevar un líquido a la boca.", indonesian: "Minum — memasukkan cairan ke dalam mulut." },
      example: "Penting untuk minum air setiap hari.",
      exampleTranslation: { korean: "매일 물을 마시는 것은 중요해요.", english: "It is important to drink water every day.", spanish: "Es importante beber agua todos los días.", indonesian: "Penting untuk minum air setiap hari." }, speechLang: "id-ID" },

    { word: "Nasi", emoji: "🍚", pronunciation: "NA-si",
      meanings: { korean: "인도네시아 사람들의 주식인 밥이에요.", english: "Rice — the staple food of Indonesian people.", spanish: "Arroz — el alimento básico del pueblo indonesio.", indonesian: "Nasi — makanan pokok masyarakat Indonesia." },
      example: "Setiap hari kami makan nasi putih.",
      exampleTranslation: { korean: "우리는 매일 흰쌀밥을 먹어요.", english: "Every day we eat white rice.", spanish: "Cada día comemos arroz blanco.", indonesian: "Setiap hari kami makan nasi putih." }, speechLang: "id-ID" },

    { word: "Rumah", emoji: "🏠", pronunciation: "ROO-mah",
      meanings: { korean: "사람들이 사는 건물이에요.", english: "House / Home — the building where you live.", spanish: "Casa — el edificio donde vives.", indonesian: "Rumah — bangunan tempat kamu tinggal." },
      example: "Rumah saya memiliki taman yang indah.",
      exampleTranslation: { korean: "우리 집에는 아름다운 정원이 있어요.", english: "My house has a beautiful garden.", spanish: "Mi casa tiene un jardín hermoso.", indonesian: "Rumah saya memiliki taman yang indah." }, speechLang: "id-ID" },

    { word: "Sekolah", emoji: "🏫", pronunciation: "se-KO-lah",
      meanings: { korean: "학생들이 공부하는 곳이에요.", english: "School — the place where students learn and study.", spanish: "Escuela — el lugar donde los estudiantes aprenden y estudian.", indonesian: "Sekolah — tempat para siswa belajar dan menuntut ilmu." },
      example: "Anak-anak pergi ke sekolah setiap pagi.",
      exampleTranslation: { korean: "아이들은 매일 아침 학교에 가요.", english: "The children go to school every morning.", spanish: "Los niños van a la escuela cada mañana.", indonesian: "Anak-anak pergi ke sekolah setiap pagi." }, speechLang: "id-ID" },

    { word: "Keluarga", emoji: "👨‍👩‍👧‍👦", pronunciation: "ke-loo-AR-ga",
      meanings: { korean: "함께 살거나 혈연으로 이어진 사람들의 집단이에요.", english: "Family — a group of people related by blood or living together.", spanish: "Familia — grupo de personas unidas por sangre o que viven juntas.", indonesian: "Keluarga — sekelompok orang yang terikat hubungan darah atau tinggal bersama." },
      example: "Keluarga saya berkumpul setiap akhir pekan.",
      exampleTranslation: { korean: "우리 가족은 주말마다 모여요.", english: "My family gathers every weekend.", spanish: "Mi familia se reúne cada fin de semana.", indonesian: "Keluarga saya berkumpul setiap akhir pekan." }, speechLang: "id-ID" },

    { word: "Teman", emoji: "🤝", pronunciation: "te-MAN",
      meanings: { korean: "서로 좋아하고 함께 시간을 보내는 사람이에요.", english: "Friend — someone you like and enjoy spending time with.", spanish: "Amigo — alguien que te agrada y con quien disfrutas pasar tiempo.", indonesian: "Teman — seseorang yang kamu sukai dan senang menghabiskan waktu bersamanya." },
      example: "Teman saya sangat baik dan ramah.",
      exampleTranslation: { korean: "제 친구는 정말 착하고 친절해요.", english: "My friend is very kind and friendly.", spanish: "Mi amigo es muy amable y simpático.", indonesian: "Teman saya sangat baik dan ramah." }, speechLang: "id-ID" },

    { word: "Ibu", emoji: "👩", pronunciation: "EE-boo",
      meanings: { korean: "어머니를 뜻하며, 나이 든 여성을 정중히 부를 때도 써요.", english: "Mother — also a polite term for an older woman, like 'ma'am'.", spanish: "Madre — también una forma cortés de dirigirse a una mujer mayor.", indonesian: "Ibu — orang tua perempuan; juga sapaan sopan untuk perempuan yang lebih tua." },
      example: "Ibu saya memasak makanan yang lezat.",
      exampleTranslation: { korean: "우리 엄마는 맛있는 음식을 만들어요.", english: "My mother cooks delicious food.", spanish: "Mi madre cocina comida deliciosa.", indonesian: "Ibu saya memasak makanan yang lezat." }, speechLang: "id-ID" },

    { word: "Ayah", emoji: "👨", pronunciation: "A-yah",
      meanings: { korean: "아버지를 뜻하는 말이에요.", english: "Father — a male parent.", spanish: "Padre — el progenitor masculino.", indonesian: "Ayah — orang tua laki-laki." },
      example: "Ayah saya bekerja di sebuah kantor.",
      exampleTranslation: { korean: "우리 아빠는 사무실에서 일해요.", english: "My father works in an office.", spanish: "Mi padre trabaja en una oficina.", indonesian: "Ayah saya bekerja di sebuah kantor." }, speechLang: "id-ID" },

    { word: "Anjing", emoji: "🐶", pronunciation: "AN-jing",
      meanings: { korean: "사람과 함께 사는 반려동물이에요.", english: "Dog — a pet that lives with people as a companion.", spanish: "Perro — mascota que convive con las personas como compañero.", indonesian: "Anjing — hewan peliharaan yang hidup bersama manusia sebagai teman." },
      example: "Anjing itu suka bermain di taman.",
      exampleTranslation: { korean: "그 강아지는 공원에서 노는 것을 좋아해요.", english: "That dog likes to play in the park.", spanish: "Ese perro le gusta jugar en el parque.", indonesian: "Anjing itu suka bermain di taman." }, speechLang: "id-ID" },

    { word: "Kucing", emoji: "🐱", pronunciation: "KOO-ching",
      meanings: { korean: "독립적이고 우아한 반려동물이에요.", english: "Cat — an independent and graceful pet.", spanish: "Gato — mascota independiente y elegante.", indonesian: "Kucing — hewan peliharaan yang mandiri dan anggun." },
      example: "Kucing itu tidur di atas sofa.",
      exampleTranslation: { korean: "그 고양이는 소파 위에서 자요.", english: "The cat sleeps on the sofa.", spanish: "El gato duerme en el sofá.", indonesian: "Kucing itu tidur di atas sofa." }, speechLang: "id-ID" },

    { word: "Buku", emoji: "📖", pronunciation: "BOO-koo",
      meanings: { korean: "읽기 위해 묶인 페이지들로 이루어진 물건이에요.", english: "Book — pages bound together for reading.", spanish: "Libro — páginas encuadernadas para leer.", indonesian: "Buku — halaman-halaman yang dijilid untuk dibaca." },
      example: "Saya sedang membaca buku yang menarik.",
      exampleTranslation: { korean: "저는 재미있는 책을 읽고 있어요.", english: "I am reading an interesting book.", spanish: "Estoy leyendo un libro interesante.", indonesian: "Saya sedang membaca buku yang menarik." }, speechLang: "id-ID" },

    { word: "Satu", emoji: "1️⃣", pronunciation: "SA-too",
      meanings: { korean: "숫자 1을 뜻하는 말이에요.", english: "One — the number 1.", spanish: "Uno — el número 1.", indonesian: "Satu — angka 1." },
      example: "Saya hanya punya satu adik perempuan.",
      exampleTranslation: { korean: "저는 여동생이 한 명뿐이에요.", english: "I only have one younger sister.", spanish: "Solo tengo una hermana menor.", indonesian: "Saya hanya punya satu adik perempuan." }, speechLang: "id-ID" },

    { word: "Dua", emoji: "2️⃣", pronunciation: "DOO-a",
      meanings: { korean: "숫자 2를 뜻하는 말이에요.", english: "Two — the number 2.", spanish: "Dos — el número 2.", indonesian: "Dua — angka 2." },
      example: "Kami memesan dua cangkir teh.",
      exampleTranslation: { korean: "우리는 차 두 잔을 주문했어요.", english: "We ordered two cups of tea.", spanish: "Pedimos dos tazas de té.", indonesian: "Kami memesan dua cangkir teh." }, speechLang: "id-ID" },

    { word: "Tiga", emoji: "3️⃣", pronunciation: "TEE-ga",
      meanings: { korean: "숫자 3을 뜻하는 말이에요.", english: "Three — the number 3.", spanish: "Tres — el número 3.", indonesian: "Tiga — angka 3." },
      example: "Ada tiga buku di atas meja.",
      exampleTranslation: { korean: "탁자 위에 책 세 권이 있어요.", english: "There are three books on the table.", spanish: "Hay tres libros sobre la mesa.", indonesian: "Ada tiga buku di atas meja." }, speechLang: "id-ID" },

    { word: "Besar", emoji: "🐘", pronunciation: "be-SAR",
      meanings: { korean: "크기나 규모가 큰 것을 표현하는 말이에요.", english: "Big / Large — great in size or amount.", spanish: "Grande — de gran tamaño o cantidad.", indonesian: "Besar — besar dalam ukuran atau jumlah." },
      example: "Mereka tinggal di rumah yang besar.",
      exampleTranslation: { korean: "그들은 큰 집에 살아요.", english: "They live in a big house.", spanish: "Viven en una casa grande.", indonesian: "Mereka tinggal di rumah yang besar." }, speechLang: "id-ID" },

    { word: "Kecil", emoji: "🐭", pronunciation: "ke-CHIL",
      meanings: { korean: "크기나 규모가 작은 것을 표현하는 말이에요.", english: "Small / Little — not big; of little size.", spanish: "Pequeño — no grande; de poco tamaño.", indonesian: "Kecil — tidak besar; berukuran kecil." },
      example: "Dia punya apartemen kecil tapi nyaman.",
      exampleTranslation: { korean: "그녀는 작지만 아늑한 아파트에 살아요.", english: "She has a small but cozy apartment.", spanish: "Tiene un apartamento pequeño pero acogedor.", indonesian: "Dia punya apartemen kecil tapi nyaman." }, speechLang: "id-ID" },

    { word: "Bagus", emoji: "👍", pronunciation: "BA-goos",
      meanings: { korean: "좋거나 훌륭한 것을 표현하는 말이에요.", english: "Good / Nice — of high quality; pleasing.", spanish: "Bueno / Bonito — de buena calidad; agradable.", indonesian: "Bagus — berkualitas baik; menyenangkan." },
      example: "Cuaca hari ini sangat bagus.",
      exampleTranslation: { korean: "오늘 날씨가 정말 좋아요.", english: "The weather today is very nice.", spanish: "El clima de hoy es muy bueno.", indonesian: "Cuaca hari ini sangat bagus." }, speechLang: "id-ID" },

    { word: "Enak", emoji: "😋", pronunciation: "E-nak",
      meanings: { korean: "음식이 맛있다고 표현할 때 사용해요.", english: "Delicious / Tasty — used to say food tastes great.", spanish: "Delicioso / Rico — para decir que la comida sabe muy bien.", indonesian: "Enak — dipakai untuk menyatakan makanan terasa lezat." },
      example: "Masakan ibu sangat enak.",
      exampleTranslation: { korean: "엄마 요리는 정말 맛있어요.", english: "Mom's cooking is very delicious.", spanish: "La comida de mamá es muy rica.", indonesian: "Masakan ibu sangat enak." }, speechLang: "id-ID" },

    { word: "Merah", emoji: "🔴", pronunciation: "ME-rah",
      meanings: { korean: "피나 불의 색깔이에요.", english: "Red — the color of blood or fire.", spanish: "Rojo — el color de la sangre o el fuego.", indonesian: "Merah — warna darah atau api." },
      example: "Bunga mawar merah sangat indah.",
      exampleTranslation: { korean: "빨간 장미는 정말 아름다워요.", english: "Red roses are very beautiful.", spanish: "Las rosas rojas son muy hermosas.", indonesian: "Bunga mawar merah sangat indah." }, speechLang: "id-ID" },

    { word: "Biru", emoji: "🔵", pronunciation: "BEE-roo",
      meanings: { korean: "하늘이나 바다의 색깔이에요.", english: "Blue — the color of the sky or the sea.", spanish: "Azul — el color del cielo o el mar.", indonesian: "Biru — warna langit atau laut." },
      example: "Langit hari ini berwarna biru cerah.",
      exampleTranslation: { korean: "오늘 하늘은 밝은 파란색이에요.", english: "The sky today is bright blue.", spanish: "El cielo de hoy es azul brillante.", indonesian: "Langit hari ini berwarna biru cerah." }, speechLang: "id-ID" },

    { word: "Hari ini", emoji: "📅", pronunciation: "HA-ri EE-ni",
      meanings: { korean: "바로 지금의 날, 즉 오늘을 뜻해요.", english: "Today — this present day.", spanish: "Hoy — el día presente.", indonesian: "Hari ini — hari yang sedang berlangsung sekarang." },
      example: "Hari ini saya pergi ke pasar.",
      exampleTranslation: { korean: "오늘 저는 시장에 가요.", english: "Today I am going to the market.", spanish: "Hoy voy al mercado.", indonesian: "Hari ini saya pergi ke pasar." }, speechLang: "id-ID" },

    { word: "Besok", emoji: "🌅", pronunciation: "BE-sok",
      meanings: { korean: "오늘 다음 날, 즉 내일을 뜻해요.", english: "Tomorrow — the day after today.", spanish: "Mañana — el día después de hoy.", indonesian: "Besok — hari setelah hari ini." },
      example: "Besok kita akan bertemu lagi.",
      exampleTranslation: { korean: "내일 우리는 다시 만날 거예요.", english: "Tomorrow we will meet again.", spanish: "Mañana nos veremos de nuevo.", indonesian: "Besok kita akan bertemu lagi." }, speechLang: "id-ID" },

    { word: "Pergi", emoji: "🚶", pronunciation: "per-GEE",
      meanings: { korean: "어떤 장소로 이동하거나 떠나는 행동이에요.", english: "To go — to move or leave toward a place.", spanish: "Ir — desplazarse o partir hacia un lugar.", indonesian: "Pergi — berpindah atau berangkat menuju suatu tempat." },
      example: "Saya pergi ke kantor naik bus.",
      exampleTranslation: { korean: "저는 버스를 타고 사무실에 가요.", english: "I go to the office by bus.", spanish: "Voy a la oficina en autobús.", indonesian: "Saya pergi ke kantor naik bus." }, speechLang: "id-ID" },

    { word: "Tidur", emoji: "😴", pronunciation: "TEE-door",
      meanings: { korean: "몸과 마음이 자연스럽게 쉬는 수면 상태예요.", english: "To sleep — the natural rest state of body and mind.", spanish: "Dormir — el estado natural de descanso del cuerpo y la mente.", indonesian: "Tidur — keadaan istirahat alami tubuh dan pikiran." },
      example: "Saya perlu tidur lebih awal malam ini.",
      exampleTranslation: { korean: "오늘 밤에는 일찍 자야 해요.", english: "I need to sleep early tonight.", spanish: "Necesito dormir temprano esta noche.", indonesian: "Saya perlu tidur lebih awal malam ini." }, speechLang: "id-ID" },

    { word: "Cinta", emoji: "❤️", pronunciation: "CHEEN-ta",
      meanings: { korean: "누군가나 무언가에 대한 깊은 사랑의 감정이에요.", english: "Love — a deep feeling of affection for someone or something.", spanish: "Amor — un sentimiento profundo de afecto por alguien o algo.", indonesian: "Cinta — perasaan kasih sayang yang mendalam pada seseorang atau sesuatu." },
      example: "Saya sangat mencintai keluarga saya.",
      exampleTranslation: { korean: "저는 온 마음으로 가족을 사랑해요.", english: "I love my family with all my heart.", spanish: "Amo a mi familia con todo mi corazón.", indonesian: "Saya sangat mencintai keluarga saya." }, speechLang: "id-ID" },

    { word: "Senang", emoji: "😊", pronunciation: "se-NANG",
      meanings: { korean: "기쁘고 즐거운 감정 상태예요.", english: "Happy / Glad — feeling joy or pleasure.", spanish: "Feliz / Contento — sentir alegría o placer.", indonesian: "Senang — merasakan sukacita atau kesenangan." },
      example: "Saya senang bertemu denganmu.",
      exampleTranslation: { korean: "당신을 만나서 기뻐요.", english: "I am happy to meet you.", spanish: "Estoy contento de conocerte.", indonesian: "Saya senang bertemu denganmu." }, speechLang: "id-ID" },

    { word: "Sedih", emoji: "😢", pronunciation: "se-DEEH",
      meanings: { korean: "슬프거나 불행한 감정을 표현하는 말이에요.", english: "Sad — feeling unhappy or sorrowful.", spanish: "Triste — sentirse infeliz o afligido.", indonesian: "Sedih — merasa tidak bahagia atau berduka." },
      example: "Dia sedih karena kehilangan kucingnya.",
      exampleTranslation: { korean: "그녀는 고양이를 잃어버려서 슬퍼해요.", english: "She is sad because she lost her cat.", spanish: "Está triste porque perdió a su gato.", indonesian: "Dia sedih karena kehilangan kucingnya." }, speechLang: "id-ID" },

    { word: "Berapa", emoji: "💰", pronunciation: "be-RA-pa",
      meanings: { korean: "수량이나 가격을 물을 때 쓰는 '얼마'라는 말이에요.", english: "How much / How many — used to ask about quantity or price.", spanish: "Cuánto / Cuántos — para preguntar por cantidad o precio.", indonesian: "Berapa — dipakai untuk menanyakan jumlah atau harga." },
      example: "Berapa harga buah ini?",
      exampleTranslation: { korean: "이 과일은 얼마예요?", english: "How much is this fruit?", spanish: "¿Cuánto cuesta esta fruta?", indonesian: "Berapa harga buah ini?" }, speechLang: "id-ID" },

    { word: "Di mana", emoji: "📍", pronunciation: "dee MA-na",
      meanings: { korean: "장소를 물을 때 쓰는 '어디'라는 표현이에요.", english: "Where — used to ask about a location.", spanish: "Dónde — para preguntar por un lugar.", indonesian: "Di mana — dipakai untuk menanyakan suatu tempat." },
      example: "Di mana toilet yang terdekat?",
      exampleTranslation: { korean: "가장 가까운 화장실이 어디예요?", english: "Where is the nearest toilet?", spanish: "¿Dónde está el baño más cercano?", indonesian: "Di mana toilet yang terdekat?" }, speechLang: "id-ID" },

    { word: "Sampai jumpa", emoji: "👋", pronunciation: "SAM-pai JOOM-pa",
      meanings: { korean: "헤어질 때 '또 봐요'라고 하는 작별 인사예요.", english: "See you later — a friendly goodbye in Indonesian.", spanish: "Hasta luego — una despedida amistosa en indonesio.", indonesian: "Sampai jumpa — ucapan perpisahan yang ramah dalam bahasa Indonesia." },
      example: "Sampai jumpa minggu depan!",
      exampleTranslation: { korean: "다음 주에 봐요!", english: "See you next week!", spanish: "¡Hasta la próxima semana!", indonesian: "Sampai jumpa minggu depan!" }, speechLang: "id-ID" },
  ],
  /* ── ENGLISH (user is learning English) ────────────────── */
  english: [
    /* ── A1 Beginner ── */
    { word: "Apple", emoji: "🍎", pronunciation: "AE-pul",
      meanings: { korean: "빨간색, 노란색, 또는 초록색 껍질의 둥근 과일이에요.", english: "A round fruit with red, yellow, or green skin.", spanish: "Una fruta redonda con piel roja, amarilla o verde.", indonesian: "Buah bulat dengan kulit merah, kuning, atau hijau." },
      example: '"I eat an apple every morning for breakfast."',
      exampleTranslation: { korean: "저는 매일 아침 사과를 먹어요.", english: "I eat an apple every morning for breakfast.", spanish: "Como una manzana cada mañana en el desayuno.", indonesian: "Saya makan apel setiap pagi untuk sarapan." }, speechLang: "en-US" },

    { word: "Water", emoji: "💧", pronunciation: "WAW-ter",
      meanings: { korean: "모든 생명체에 필수적인 맑고 무색의 액체예요.", english: "A clear, colorless liquid essential for all living things.", spanish: "Líquido transparente esencial para todos los seres vivos.", indonesian: "Cairan bening tak berwarna yang penting bagi semua makhluk hidup." },
      example: '"Please drink eight glasses of water every day."',
      exampleTranslation: { korean: "매일 물 여덟 잔을 마셔주세요.", english: "Please drink eight glasses of water every day.", spanish: "Por favor, bebe ocho vasos de agua cada día.", indonesian: "Tolong minum delapan gelas air setiap hari." }, speechLang: "en-US" },

    { word: "Hello", emoji: "👋", pronunciation: "heh-LOW",
      meanings: { korean: "누군가를 만나거나 대화를 시작할 때 사용하는 인사말이에요.", english: "A greeting used when meeting someone or starting a conversation.", spanish: "Saludo usado al conocer a alguien o iniciar una conversación.", indonesian: "Sapaan yang dipakai saat bertemu seseorang atau memulai percakapan." },
      example: '"Hello! My name is Sarah. Nice to meet you."',
      exampleTranslation: { korean: "안녕하세요! 제 이름은 사라예요. 만나서 반가워요.", english: "Hello! My name is Sarah. Nice to meet you.", spanish: "¡Hola! Me llamo Sarah. Mucho gusto en conocerte.", indonesian: "Halo! Nama saya Sarah. Senang berkenalan denganmu." }, speechLang: "en-US" },

    { word: "Thank you", emoji: "🙏", pronunciation: "THANGK yoo",
      meanings: { korean: "감사함을 표현하기 위해 사용하는 말이에요.", english: "An expression of gratitude used to show appreciation.", spanish: "Expresión de gratitud para mostrar apreciación.", indonesian: "Ungkapan rasa terima kasih untuk menunjukkan apresiasi." },
      example: '"Thank you so much for your help today!"',
      exampleTranslation: { korean: "오늘 도움을 주셔서 정말 감사합니다!", english: "Thank you so much for your help today!", spanish: "¡Muchas gracias por tu ayuda de hoy!", indonesian: "Terima kasih banyak atas bantuanmu hari ini!" }, speechLang: "en-US" },

    { word: "House", emoji: "🏠", pronunciation: "HOWSS",
      meanings: { korean: "사람들이 사는 건물이에요.", english: "A building where people live; a home.", spanish: "Un edificio donde vive la gente; un hogar.", indonesian: "Bangunan tempat orang tinggal; sebuah rumah." },
      example: '"Their house has a beautiful garden in the backyard."',
      exampleTranslation: { korean: "그들의 집 뒤뜰에는 아름다운 정원이 있어요.", english: "Their house has a beautiful garden in the backyard.", spanish: "Su casa tiene un bello jardín en el patio trasero.", indonesian: "Rumah mereka memiliki taman yang indah di halaman belakang." }, speechLang: "en-US" },

    { word: "Dog", emoji: "🐶", pronunciation: "DAWG",
      meanings: { korean: "반려동물로 기르는 가축이에요.", english: "A domesticated animal kept as a pet or for work.", spanish: "Animal doméstico criado como mascota o para trabajar.", indonesian: "Hewan peliharaan yang dijinakkan sebagai teman atau untuk bekerja." },
      example: '"My dog loves to run in the park every evening."',
      exampleTranslation: { korean: "제 강아지는 매일 저녁 공원에서 뛰는 것을 좋아해요.", english: "My dog loves to run in the park every evening.", spanish: "Mi perro adora correr en el parque cada tarde.", indonesian: "Anjing saya suka berlari di taman setiap sore." }, speechLang: "en-US" },

    { word: "Cat", emoji: "🐱", pronunciation: "KAT",
      meanings: { korean: "독립적이고 우아한 성격으로 유명한 반려동물이에요.", english: "A small furry pet known for being independent and graceful.", spanish: "Mascota pequeña y peluda conocida por ser independiente y elegante.", indonesian: "Hewan peliharaan kecil berbulu yang dikenal mandiri dan anggun." },
      example: '"The cat is sleeping on the warm windowsill."',
      exampleTranslation: { korean: "고양이가 따뜻한 창가에서 자고 있어요.", english: "The cat is sleeping on the warm windowsill.", spanish: "El gato está durmiendo en el alféizar cálido.", indonesian: "Kucing itu sedang tidur di ambang jendela yang hangat." }, speechLang: "en-US" },

    { word: "Food", emoji: "🍽️", pronunciation: "FOOD",
      meanings: { korean: "생존과 에너지를 위해 먹는 모든 것이에요.", english: "Any substance eaten to provide energy and nourishment.", spanish: "Cualquier sustancia que se come para obtener energía y nutrición.", indonesian: "Segala sesuatu yang dimakan untuk memberi energi dan nutrisi." },
      example: '"The food at that restaurant was absolutely amazing."',
      exampleTranslation: { korean: "그 식당의 음식은 정말 대단했어요.", english: "The food at that restaurant was absolutely amazing.", spanish: "La comida en ese restaurante fue absolutamente increíble.", indonesian: "Makanan di restoran itu benar-benar luar biasa." }, speechLang: "en-US" },

    { word: "Book", emoji: "📖", pronunciation: "BUK",
      meanings: { korean: "읽기 위해 묶인 페이지로 이루어진 물건이에요.", english: "A set of written or printed pages bound together for reading.", spanish: "Conjunto de páginas escritas o impresas encuadernadas para leer.", indonesian: "Sekumpulan halaman tertulis atau tercetak yang dijilid untuk dibaca." },
      example: '"She reads a book for one hour before going to bed."',
      exampleTranslation: { korean: "그녀는 자기 전에 한 시간 동안 책을 읽어요.", english: "She reads a book for one hour before going to bed.", spanish: "Ella lee un libro durante una hora antes de acostarse.", indonesian: "Dia membaca buku selama satu jam sebelum tidur." }, speechLang: "en-US" },

    { word: "School", emoji: "🏫", pronunciation: "SKOOL",
      meanings: { korean: "학생들이 배우는 장소예요.", english: "A place where students go to learn and study.", spanish: "Un lugar donde los estudiantes van a aprender y estudiar.", indonesian: "Tempat para siswa pergi untuk belajar dan menuntut ilmu." },
      example: '"The school starts at eight o\'clock every morning."',
      exampleTranslation: { korean: "학교는 매일 아침 8시에 시작해요.", english: "The school starts at eight o'clock every morning.", spanish: "La escuela comienza a las ocho de la mañana.", indonesian: "Sekolah dimulai pukul delapan setiap pagi." }, speechLang: "en-US" },

    { word: "Family", emoji: "👨‍👩‍👧‍👦", pronunciation: "FAM-uh-lee",
      meanings: { korean: "함께 살거나 혈연관계로 이어진 사람들의 집단이에요.", english: "A group of people related by blood or living together.", spanish: "Grupo de personas unidas por sangre o que viven juntas.", indonesian: "Sekelompok orang yang terikat hubungan darah atau tinggal bersama." },
      example: '"My family gathers every Sunday for a big dinner."',
      exampleTranslation: { korean: "우리 가족은 매주 일요일에 모여 저녁 식사를 해요.", english: "My family gathers every Sunday for a big dinner.", spanish: "Mi familia se reúne cada domingo para una gran cena.", indonesian: "Keluarga saya berkumpul setiap Minggu untuk makan malam besar." }, speechLang: "en-US" },

    { word: "Friend", emoji: "🤝", pronunciation: "FREND",
      meanings: { korean: "서로 좋아하고 함께 시간을 보내는 사람이에요.", english: "A person you like and enjoy spending time with.", spanish: "Una persona que te agrada y con quien disfrutas pasar tiempo.", indonesian: "Orang yang kamu sukai dan senang menghabiskan waktu bersamanya." },
      example: '"My best friend and I have known each other for ten years."',
      exampleTranslation: { korean: "저와 제 절친한 친구는 서로 안 지 10년이 됐어요.", english: "My best friend and I have known each other for ten years.", spanish: "Mi mejor amigo y yo nos conocemos desde hace diez años.", indonesian: "Sahabat saya dan saya sudah saling kenal selama sepuluh tahun." }, speechLang: "en-US" },

    { word: "Happy", emoji: "😊", pronunciation: "HAP-ee",
      meanings: { korean: "기쁘고 만족스러운 느낌을 표현하는 말이에요.", english: "Feeling or showing pleasure, joy, or contentment.", spanish: "Sentir o mostrar placer, alegría o satisfacción.", indonesian: "Merasakan atau menunjukkan kesenangan, sukacita, atau kepuasan." },
      example: '"She was so happy when she passed her final exam."',
      exampleTranslation: { korean: "그녀는 기말시험에 합격했을 때 정말 행복했어요.", english: "She was so happy when she passed her final exam.", spanish: "Ella estaba muy feliz cuando aprobó su examen final.", indonesian: "Dia sangat bahagia ketika lulus ujian akhirnya." }, speechLang: "en-US" },

    { word: "Sad", emoji: "😢", pronunciation: "SAD",
      meanings: { korean: "슬프거나 불행한 감정을 표현하는 말이에요.", english: "Feeling unhappy or sorrowful about something.", spanish: "Sentirse infeliz o afligido por algo.", indonesian: "Merasa tidak bahagia atau sedih akan sesuatu." },
      example: '"He felt sad when his favorite team lost the game."',
      exampleTranslation: { korean: "그는 자신이 좋아하는 팀이 경기에서 졌을 때 슬펐어요.", english: "He felt sad when his favorite team lost the game.", spanish: "Se sintió triste cuando su equipo favorito perdió el partido.", indonesian: "Dia merasa sedih ketika tim favoritnya kalah dalam pertandingan." }, speechLang: "en-US" },

    { word: "Big", emoji: "🐘", pronunciation: "BIG",
      meanings: { korean: "크기나 양이 많은 것을 표현하는 말이에요.", english: "Large in size, amount, or degree.", spanish: "Grande en tamaño, cantidad o grado.", indonesian: "Besar dalam ukuran, jumlah, atau tingkatan." },
      example: '"They live in a big house with a huge garden."',
      exampleTranslation: { korean: "그들은 큰 정원이 있는 큰 집에 살아요.", english: "They live in a big house with a huge garden.", spanish: "Viven en una casa grande con un jardín enorme.", indonesian: "Mereka tinggal di rumah besar dengan taman yang luas." }, speechLang: "en-US" },

    { word: "Small", emoji: "🐭", pronunciation: "SMAWL",
      meanings: { korean: "크기나 양이 적은 것을 표현하는 말이에요.", english: "Little in size or amount; not big.", spanish: "Pequeño en tamaño o cantidad; no grande.", indonesian: "Kecil dalam ukuran atau jumlah; tidak besar." },
      example: '"She keeps a small plant on her office desk."',
      exampleTranslation: { korean: "그녀는 사무실 책상 위에 작은 식물을 키워요.", english: "She keeps a small plant on her office desk.", spanish: "Ella tiene una pequeña planta en su escritorio de oficina.", indonesian: "Dia menaruh tanaman kecil di meja kantornya." }, speechLang: "en-US" },

    { word: "Red", emoji: "🔴", pronunciation: "RED",
      meanings: { korean: "피나 불의 색깔로, 열정이나 위험을 상징하기도 해요.", english: "The color of blood or fire; often symbolizing passion or danger.", spanish: "El color de la sangre o el fuego; simboliza pasión o peligro.", indonesian: "Warna darah atau api; sering melambangkan gairah atau bahaya." },
      example: '"She wore a beautiful red dress to the party."',
      exampleTranslation: { korean: "그녀는 파티에 아름다운 빨간 드레스를 입고 갔어요.", english: "She wore a beautiful red dress to the party.", spanish: "Ella llevó un hermoso vestido rojo a la fiesta.", indonesian: "Dia mengenakan gaun merah yang indah ke pesta." }, speechLang: "en-US" },

    { word: "Blue", emoji: "🔵", pronunciation: "BLOO",
      meanings: { korean: "맑은 하늘이나 바다의 색깔이에요.", english: "The color of a clear sky or the ocean.", spanish: "El color de un cielo despejado o el océano.", indonesian: "Warna langit cerah atau lautan." },
      example: '"The sky was a perfect bright blue all day long."',
      exampleTranslation: { korean: "하늘은 하루 종일 완벽하게 밝은 파란색이었어요.", english: "The sky was a perfect bright blue all day long.", spanish: "El cielo fue de un azul brillante y perfecto todo el día.", indonesian: "Langit berwarna biru cerah yang sempurna sepanjang hari." }, speechLang: "en-US" },

    { word: "Yes", emoji: "✅", pronunciation: "YES",
      meanings: { korean: "동의하거나 긍정적으로 대답할 때 사용하는 말이에요.", english: "A word used to agree or give a positive answer.", spanish: "Palabra usada para estar de acuerdo o dar una respuesta positiva.", indonesian: "Kata yang dipakai untuk menyetujui atau memberi jawaban positif." },
      example: '"Yes, I would love to come to your birthday party!"',
      exampleTranslation: { korean: "네, 당신의 생일 파티에 꼭 가고 싶어요!", english: "Yes, I would love to come to your birthday party!", spanish: "¡Sí, me encantaría ir a tu fiesta de cumpleaños!", indonesian: "Ya, saya akan senang sekali datang ke pesta ulang tahunmu!" }, speechLang: "en-US" },

    { word: "No", emoji: "❌", pronunciation: "NOH",
      meanings: { korean: "거절하거나 부정적으로 대답할 때 사용하는 말이에요.", english: "A word used to refuse or give a negative answer.", spanish: "Palabra usada para rechazar o dar una respuesta negativa.", indonesian: "Kata yang dipakai untuk menolak atau memberi jawaban negatif." },
      example: '"No, thank you. I already had enough to eat."',
      exampleTranslation: { korean: "아니요, 괜찮아요. 저는 이미 충분히 먹었어요.", english: "No, thank you. I already had enough to eat.", spanish: "No, gracias. Ya comí suficiente.", indonesian: "Tidak, terima kasih. Saya sudah cukup makan." }, speechLang: "en-US" },

    { word: "Morning", emoji: "🌅", pronunciation: "MOR-ning",
      meanings: { korean: "하루 중 해가 뜨고 정오 이전까지의 시간이에요.", english: "The early part of the day, from sunrise until noon.", spanish: "La parte temprana del día, desde el amanecer hasta el mediodía.", indonesian: "Bagian awal hari, dari matahari terbit hingga tengah hari." },
      example: '"I love to take a walk in the morning before work."',
      exampleTranslation: { korean: "저는 출근 전 아침에 산책하는 것을 좋아해요.", english: "I love to take a walk in the morning before work.", spanish: "Me encanta dar un paseo por la mañana antes del trabajo.", indonesian: "Saya suka berjalan-jalan di pagi hari sebelum bekerja." }, speechLang: "en-US" },

    { word: "Night", emoji: "🌙", pronunciation: "NYT",
      meanings: { korean: "해가 지고 날이 어두워지는 시간이에요.", english: "The dark period of the day after sunset.", spanish: "El período oscuro del día después de la puesta de sol.", indonesian: "Periode gelap dalam sehari setelah matahari terbenam." },
      example: '"The stars shine so beautifully on a clear night."',
      exampleTranslation: { korean: "맑은 밤에는 별들이 정말 아름답게 빛나요.", english: "The stars shine so beautifully on a clear night.", spanish: "Las estrellas brillan tan hermosamente en una noche despejada.", indonesian: "Bintang-bintang bersinar begitu indah di malam yang cerah." }, speechLang: "en-US" },

    { word: "Eat", emoji: "🍴", pronunciation: "EET",
      meanings: { korean: "음식을 씹고 삼키는 행동이에요.", english: "To chew and swallow food into your body.", spanish: "Masticar e ingerir alimentos en el cuerpo.", indonesian: "Mengunyah dan menelan makanan ke dalam tubuhmu." },
      example: '"Let\'s eat dinner together at seven o\'clock tonight."',
      exampleTranslation: { korean: "오늘 저녁 7시에 함께 저녁 먹어요.", english: "Let's eat dinner together at seven o'clock tonight.", spanish: "Comamos juntos a las siete de la noche.", indonesian: "Ayo makan malam bersama pukul tujuh malam ini." }, speechLang: "en-US" },

    { word: "Drink", emoji: "🥤", pronunciation: "DRINK",
      meanings: { korean: "액체를 마시는 행동이에요.", english: "To take a liquid into your mouth and swallow it.", spanish: "Llevar un líquido a la boca y tragarlo.", indonesian: "Memasukkan cairan ke mulut dan menelannya." },
      example: '"Do you want to drink some tea with me this afternoon?"',
      exampleTranslation: { korean: "오늘 오후에 저와 차 한 잔 마실래요?", english: "Do you want to drink some tea with me this afternoon?", spanish: "¿Quieres tomar un poco de té conmigo esta tarde?", indonesian: "Apakah kamu mau minum teh denganku sore ini?" }, speechLang: "en-US" },

    { word: "Walk", emoji: "🚶", pronunciation: "WAWK",
      meanings: { korean: "발로 천천히 이동하는 행동이에요.", english: "To move on foot at a normal pace.", spanish: "Moverse a pie a un ritmo normal.", indonesian: "Bergerak dengan kaki pada kecepatan normal." },
      example: '"We walk to the coffee shop every Saturday morning."',
      exampleTranslation: { korean: "우리는 매주 토요일 아침 커피숍까지 걸어가요.", english: "We walk to the coffee shop every Saturday morning.", spanish: "Caminamos a la cafetería cada sábado por la mañana.", indonesian: "Kami berjalan kaki ke kedai kopi setiap Sabtu pagi." }, speechLang: "en-US" },

    { word: "Run", emoji: "🏃", pronunciation: "RUN",
      meanings: { korean: "빠르게 발로 이동하는 행동이에요.", english: "To move on foot at a fast speed.", spanish: "Moverse a pie a gran velocidad.", indonesian: "Bergerak dengan kaki pada kecepatan tinggi." },
      example: '"She runs five kilometers in the park every morning."',
      exampleTranslation: { korean: "그녀는 매일 아침 공원에서 5킬로미터를 달려요.", english: "She runs five kilometers in the park every morning.", spanish: "Ella corre cinco kilómetros en el parque cada mañana.", indonesian: "Dia berlari lima kilometer di taman setiap pagi." }, speechLang: "en-US" },

    { word: "Love", emoji: "❤️", pronunciation: "LUV",
      meanings: { korean: "누군가나 무언가에 대한 깊은 감정이에요.", english: "A deep feeling of affection for someone or something.", spanish: "Un sentimiento profundo de afecto hacia alguien o algo.", indonesian: "Perasaan kasih sayang yang mendalam terhadap seseorang atau sesuatu." },
      example: '"I love spending weekends with my family at the beach."',
      exampleTranslation: { korean: "저는 가족과 함께 해변에서 주말을 보내는 것을 좋아해요.", english: "I love spending weekends with my family at the beach.", spanish: "Me encanta pasar los fines de semana con mi familia en la playa.", indonesian: "Saya suka menghabiskan akhir pekan bersama keluarga di pantai." }, speechLang: "en-US" },

    { word: "Sleep", emoji: "😴", pronunciation: "SLEEP",
      meanings: { korean: "몸과 마음이 쉬는 자연스러운 상태예요.", english: "The natural resting state of the body and mind.", spanish: "El estado natural de descanso del cuerpo y la mente.", indonesian: "Keadaan istirahat alami bagi tubuh dan pikiran." },
      example: '"Doctors say you should sleep at least eight hours a night."',
      exampleTranslation: { korean: "의사들은 하루 밤에 최소 8시간 자야 한다고 말해요.", english: "Doctors say you should sleep at least eight hours a night.", spanish: "Los médicos dicen que debes dormir al menos ocho horas por noche.", indonesian: "Dokter mengatakan kamu harus tidur setidaknya delapan jam semalam." }, speechLang: "en-US" },

    { word: "Work", emoji: "💼", pronunciation: "WURK",
      meanings: { korean: "돈을 벌거나 목표를 달성하기 위해 하는 활동이에요.", english: "Activity done to earn money or achieve a goal.", spanish: "Actividad realizada para ganar dinero o lograr un objetivo.", indonesian: "Kegiatan yang dilakukan untuk mendapatkan uang atau mencapai tujuan." },
      example: '"She works hard every day to achieve her dreams."',
      exampleTranslation: { korean: "그녀는 꿈을 이루기 위해 매일 열심히 일해요.", english: "She works hard every day to achieve her dreams.", spanish: "Ella trabaja duro cada día para lograr sus sueños.", indonesian: "Dia bekerja keras setiap hari untuk mewujudkan impiannya." }, speechLang: "en-US" },

    { word: "Play", emoji: "🎮", pronunciation: "PLAY",
      meanings: { korean: "즐거움을 위해 하는 활동이에요.", english: "To engage in activity for fun or amusement.", spanish: "Participar en actividades por diversión o entretenimiento.", indonesian: "Melakukan kegiatan untuk kesenangan atau hiburan." },
      example: '"The children play in the park after school every day."',
      exampleTranslation: { korean: "아이들은 매일 방과 후 공원에서 놀아요.", english: "The children play in the park after school every day.", spanish: "Los niños juegan en el parque después de la escuela cada día.", indonesian: "Anak-anak bermain di taman setelah sekolah setiap hari." }, speechLang: "en-US" },

    /* ── A2 Intermediate ── */
    { word: "Beautiful", emoji: "🌸", pronunciation: "BYOO-tih-ful",
      meanings: { korean: "보거나 경험하기에 매우 기분 좋고 매력적인 것이에요.", english: "Very pleasing to the senses; attractive in appearance.", spanish: "Muy agradable a los sentidos; atractivo en apariencia.", indonesian: "Sangat menyenangkan bagi indra; menarik dalam penampilan." },
      example: '"What a beautiful sunset over the mountains tonight!"',
      exampleTranslation: { korean: "오늘 밤 산 위로 지는 노을이 정말 아름다워요!", english: "What a beautiful sunset over the mountains tonight!", spanish: "¡Qué hermosa puesta de sol sobre las montañas esta noche!", indonesian: "Sungguh indah matahari terbenam di atas pegunungan malam ini!" }, speechLang: "en-US" },

    { word: "Important", emoji: "⭐", pronunciation: "im-POR-tant",
      meanings: { korean: "크게 가치 있거나 의미 있는 것이에요.", english: "Having great significance or value; not to be ignored.", spanish: "Con gran significado o valor; que no se debe ignorar.", indonesian: "Memiliki makna atau nilai yang besar; tidak boleh diabaikan." },
      example: '"It is important to review your notes before the exam."',
      exampleTranslation: { korean: "시험 전에 필기를 복습하는 것이 중요해요.", english: "It is important to review your notes before the exam.", spanish: "Es importante repasar tus notas antes del examen.", indonesian: "Penting untuk meninjau catatanmu sebelum ujian." }, speechLang: "en-US" },

    { word: "Different", emoji: "🔄", pronunciation: "DIF-er-ent",
      meanings: { korean: "같지 않거나 다른 종류의 것이에요.", english: "Not the same as another; unlike others.", spanish: "No igual a otro; diferente a los demás.", indonesian: "Tidak sama dengan yang lain; berbeda dari yang lainnya." },
      example: '"Every culture has a different way of celebrating the new year."',
      exampleTranslation: { korean: "모든 문화는 새해를 축하하는 방식이 달라요.", english: "Every culture has a different way of celebrating the new year.", spanish: "Cada cultura tiene una forma diferente de celebrar el año nuevo.", indonesian: "Setiap budaya memiliki cara berbeda dalam merayakan tahun baru." }, speechLang: "en-US" },

    { word: "Difficult", emoji: "🧩", pronunciation: "DIF-ih-kult",
      meanings: { korean: "하기 어렵거나 많은 노력이 필요한 것이에요.", english: "Needing much effort or skill; not easy.", spanish: "Que requiere mucho esfuerzo o habilidad; no es fácil.", indonesian: "Membutuhkan banyak usaha atau keterampilan; tidak mudah." },
      example: '"Learning a new language is difficult but very rewarding."',
      exampleTranslation: { korean: "새로운 언어를 배우는 것은 어렵지만 매우 보람 있어요.", english: "Learning a new language is difficult but very rewarding.", spanish: "Aprender un nuevo idioma es difícil pero muy gratificante.", indonesian: "Belajar bahasa baru itu sulit tetapi sangat bermanfaat." }, speechLang: "en-US" },

    { word: "Possible", emoji: "💡", pronunciation: "POS-uh-bul",
      meanings: { korean: "일어날 수 있거나 할 수 있는 것이에요.", english: "Able to happen or be done; not impossible.", spanish: "Que puede suceder o hacerse; no imposible.", indonesian: "Dapat terjadi atau dilakukan; bukan tidak mungkin." },
      example: '"With enough practice, anything is possible in this world."',
      exampleTranslation: { korean: "충분한 연습이 있다면, 이 세상에서 어떤 것이든 가능해요.", english: "With enough practice, anything is possible in this world.", spanish: "Con suficiente práctica, todo es posible en este mundo.", indonesian: "Dengan latihan yang cukup, segala sesuatu mungkin di dunia ini." }, speechLang: "en-US" },

    { word: "Necessary", emoji: "🔑", pronunciation: "NES-uh-sair-ee",
      meanings: { korean: "꼭 있어야 하거나 반드시 해야 하는 것이에요.", english: "Required or essential; something you must have or do.", spanish: "Requerido o esencial; algo que debes tener o hacer.", indonesian: "Diperlukan atau penting; sesuatu yang harus kamu miliki atau lakukan." },
      example: '"It is necessary to bring your passport when you travel abroad."',
      exampleTranslation: { korean: "해외여행 시 여권을 지참하는 것은 필수예요.", english: "It is necessary to bring your passport when you travel abroad.", spanish: "Es necesario llevar tu pasaporte cuando viajas al extranjero.", indonesian: "Wajib membawa paspormu saat bepergian ke luar negeri." }, speechLang: "en-US" },

    { word: "Comfortable", emoji: "🛋️", pronunciation: "KUM-fer-tuh-bul",
      meanings: { korean: "편안하고 안락한 느낌을 주는 것이에요.", english: "Providing physical ease and relaxation; cozy.", spanish: "Que proporciona comodidad física y relajación; acogedor.", indonesian: "Memberikan kenyamanan fisik dan rasa rileks; nyaman." },
      example: '"This sofa is so comfortable that I fell asleep on it."',
      exampleTranslation: { korean: "이 소파는 너무 편해서 그 위에서 잠들어 버렸어요.", english: "This sofa is so comfortable that I fell asleep on it.", spanish: "Este sofá es tan cómodo que me quedé dormido en él.", indonesian: "Sofa ini begitu nyaman sampai saya tertidur di atasnya." }, speechLang: "en-US" },

    { word: "Interesting", emoji: "🔍", pronunciation: "IN-ter-es-ting",
      meanings: { korean: "관심과 호기심을 불러일으키는 것이에요.", english: "Arousing curiosity or attention; engaging.", spanish: "Que despierta curiosidad o atención; fascinante.", indonesian: "Membangkitkan rasa ingin tahu atau perhatian; menarik." },
      example: '"The documentary about space was really interesting to watch."',
      exampleTranslation: { korean: "우주에 관한 다큐멘터리는 정말 흥미롭게 시청했어요.", english: "The documentary about space was really interesting to watch.", spanish: "El documental sobre el espacio fue muy interesante de ver.", indonesian: "Dokumenter tentang luar angkasa itu sangat menarik untuk ditonton." }, speechLang: "en-US" },

    { word: "Wonderful", emoji: "🌟", pronunciation: "WUN-der-ful",
      meanings: { korean: "놀라움과 기쁨을 주는 대단한 것이에요.", english: "Inspiring delight or admiration; extremely good.", spanish: "Que inspira deleite o admiración; extraordinariamente bueno.", indonesian: "Membangkitkan kegembiraan atau kekaguman; luar biasa baik." },
      example: '"We had a wonderful time at the beach last summer."',
      exampleTranslation: { korean: "지난 여름 해변에서 정말 멋진 시간을 보냈어요.", english: "We had a wonderful time at the beach last summer.", spanish: "Tuvimos un tiempo maravilloso en la playa el verano pasado.", indonesian: "Kami bersenang-senang di pantai musim panas lalu." }, speechLang: "en-US" },

    { word: "Dangerous", emoji: "⚠️", pronunciation: "DAYN-jer-us",
      meanings: { korean: "해를 끼치거나 위험할 가능성이 있는 것이에요.", english: "Likely to cause harm or injury; unsafe.", spanish: "Con probabilidad de causar daño; peligroso.", indonesian: "Berpotensi menyebabkan bahaya atau cedera; tidak aman." },
      example: '"It is dangerous to use your phone while driving a car."',
      exampleTranslation: { korean: "운전 중 휴대폰을 사용하는 것은 위험해요.", english: "It is dangerous to use your phone while driving a car.", spanish: "Es peligroso usar el teléfono mientras conduces un coche.", indonesian: "Berbahaya menggunakan ponselmu saat mengemudikan mobil." }, speechLang: "en-US" },

    { word: "Expensive", emoji: "💎", pronunciation: "ek-SPEN-siv",
      meanings: { korean: "가격이 높거나 비용이 많이 드는 것이에요.", english: "Costing a lot of money; high in price.", spanish: "Que cuesta mucho dinero; con precio elevado.", indonesian: "Membutuhkan banyak uang; harganya tinggi." },
      example: '"That restaurant is very expensive, but the food is worth it."',
      exampleTranslation: { korean: "그 식당은 매우 비싸지만, 음식은 그 가치가 있어요.", english: "That restaurant is very expensive, but the food is worth it.", spanish: "Ese restaurante es muy caro, pero la comida vale la pena.", indonesian: "Restoran itu sangat mahal, tetapi makanannya sepadan." }, speechLang: "en-US" },

    { word: "Popular", emoji: "⭐", pronunciation: "POP-yoo-ler",
      meanings: { korean: "많은 사람들에게 좋아하거나 알려진 것이에요.", english: "Liked or admired by many people; well-known.", spanish: "Que es del gusto o admiración de muchas personas; conocido.", indonesian: "Disukai atau dikagumi banyak orang; terkenal." },
      example: '"That song became popular all around the world overnight."',
      exampleTranslation: { korean: "그 노래는 하룻밤 사이에 전 세계적으로 유명해졌어요.", english: "That song became popular all around the world overnight.", spanish: "Esa canción se hizo popular en todo el mundo de la noche a la mañana.", indonesian: "Lagu itu menjadi populer di seluruh dunia dalam semalam." }, speechLang: "en-US" },

    { word: "Surprised", emoji: "😲", pronunciation: "ser-PRYZD",
      meanings: { korean: "예상치 못한 일에 놀란 감정이에요.", english: "Feeling astonishment at something unexpected.", spanish: "Sentir asombro ante algo inesperado.", indonesian: "Merasa takjub akan sesuatu yang tak terduga." },
      example: '"She was so surprised to see all her friends at the party."',
      exampleTranslation: { korean: "그녀는 파티에서 모든 친구들을 보고 너무 놀랐어요.", english: "She was so surprised to see all her friends at the party.", spanish: "Ella estaba muy sorprendida de ver a todos sus amigos en la fiesta.", indonesian: "Dia sangat terkejut melihat semua temannya di pesta." }, speechLang: "en-US" },

    { word: "Excited", emoji: "🎉", pronunciation: "ek-SY-ted",
      meanings: { korean: "기대나 열정으로 설레는 감정이에요.", english: "Feeling very enthusiastic and eager about something.", spanish: "Sentirse muy entusiasmado y ansioso por algo.", indonesian: "Merasa sangat antusias dan bersemangat akan sesuatu." },
      example: '"The kids were so excited about the trip to Disneyland."',
      exampleTranslation: { korean: "아이들은 디즈니랜드 여행에 너무 신나했어요.", english: "The kids were so excited about the trip to Disneyland.", spanish: "Los niños estaban muy emocionados por el viaje a Disneylandia.", indonesian: "Anak-anak sangat bersemangat tentang perjalanan ke Disneyland." }, speechLang: "en-US" },

    { word: "Worried", emoji: "😟", pronunciation: "WUR-eed",
      meanings: { korean: "무언가 잘못될까봐 불안하고 걱정되는 감정이에요.", english: "Feeling anxious or troubled about something that might go wrong.", spanish: "Sentirse ansioso o preocupado por algo que podría salir mal.", indonesian: "Merasa cemas atau gelisah akan sesuatu yang mungkin tidak beres." },
      example: '"She was worried about the exam results all week long."',
      exampleTranslation: { korean: "그녀는 일주일 내내 시험 결과가 걱정됐어요.", english: "She was worried about the exam results all week long.", spanish: "Ella estuvo preocupada por los resultados del examen toda la semana.", indonesian: "Dia khawatir tentang hasil ujian sepanjang minggu." }, speechLang: "en-US" },

    { word: "Confused", emoji: "😕", pronunciation: "kun-FYOOZD",
      meanings: { korean: "이해하지 못하거나 무엇을 해야 할지 모르는 상태예요.", english: "Unable to understand or think clearly; puzzled.", spanish: "Incapaz de entender o pensar con claridad; desconcertado.", indonesian: "Tidak mampu memahami atau berpikir jernih; bingung." },
      example: '"I was confused by the instructions and asked for help."',
      exampleTranslation: { korean: "저는 설명이 이해가 안 되어서 도움을 요청했어요.", english: "I was confused by the instructions and asked for help.", spanish: "Me confundí con las instrucciones y pedí ayuda.", indonesian: "Saya bingung dengan petunjuknya dan meminta bantuan." }, speechLang: "en-US" },

    { word: "Proud", emoji: "🦁", pronunciation: "PROWD",
      meanings: { korean: "자신이나 다른 사람의 성취에 깊이 만족하는 감정이에요.", english: "Feeling deep satisfaction from achievements or qualities.", spanish: "Sentir satisfacción profunda por logros o cualidades propias o ajenas.", indonesian: "Merasakan kepuasan mendalam dari pencapaian atau kualitas." },
      example: '"Her parents were so proud when she graduated from university."',
      exampleTranslation: { korean: "그녀가 대학을 졸업했을 때 부모님은 너무 자랑스러워했어요.", english: "Her parents were so proud when she graduated from university.", spanish: "Sus padres estaban muy orgullosos cuando se graduó de la universidad.", indonesian: "Orang tuanya sangat bangga ketika dia lulus dari universitas." }, speechLang: "en-US" },

    { word: "Grateful", emoji: "🌻", pronunciation: "GRAYT-ful",
      meanings: { korean: "받은 도움이나 친절에 감사하는 마음이에요.", english: "Feeling thankful for kindness or benefits received.", spanish: "Sentirse agradecido por la amabilidad o los beneficios recibidos.", indonesian: "Merasa berterima kasih atas kebaikan atau manfaat yang diterima." },
      example: '"I am so grateful for all the support you have given me."',
      exampleTranslation: { korean: "당신이 제게 주신 모든 지원에 정말 감사해요.", english: "I am so grateful for all the support you have given me.", spanish: "Estoy muy agradecido por todo el apoyo que me has dado.", indonesian: "Saya sangat berterima kasih atas semua dukungan yang kamu berikan." }, speechLang: "en-US" },

    { word: "Patient", emoji: "🧘", pronunciation: "PAY-shent",
      meanings: { korean: "지연이나 어려움을 침착하게 견디는 능력이에요.", english: "Able to wait or endure difficulties calmly without complaining.", spanish: "Capaz de esperar o soportar dificultades con calma sin quejarse.", indonesian: "Mampu menunggu atau menghadapi kesulitan dengan tenang tanpa mengeluh." },
      example: '"You need to be patient — good things take time to grow."',
      exampleTranslation: { korean: "인내심을 가져야 해요 — 좋은 것들은 자라는 데 시간이 걸려요.", english: "You need to be patient — good things take time to grow.", spanish: "Necesitas ser paciente — las cosas buenas tardan en crecer.", indonesian: "Kamu harus sabar — hal-hal baik butuh waktu untuk tumbuh." }, speechLang: "en-US" },

    { word: "Creative", emoji: "🎨", pronunciation: "kree-AY-tiv",
      meanings: { korean: "새롭고 독창적인 아이디어를 만들어내는 능력이에요.", english: "Having the ability to produce new and original ideas or things.", spanish: "Que tiene la capacidad de producir ideas u objetos nuevos y originales.", indonesian: "Memiliki kemampuan menghasilkan ide atau hal yang baru dan orisinal." },
      example: '"She is very creative — she makes amazing art from recycled items."',
      exampleTranslation: { korean: "그녀는 매우 창의적이에요 — 재활용품으로 놀라운 예술 작품을 만들어요.", english: "She is very creative — she makes amazing art from recycled items.", spanish: "Ella es muy creativa — hace un arte increíble con objetos reciclados.", indonesian: "Dia sangat kreatif — dia membuat karya seni menakjubkan dari barang daur ulang." }, speechLang: "en-US" },
  ],

  /* ── KOREAN (user is learning Korean) ──────────────────── */
  korean: [
    /* ── A1 Beginner ── */
    { word: "안녕하세요", emoji: "👋", pronunciation: "an-nyeong-ha-se-yo",
      meanings: { korean: "한국어에서 가장 일반적인 공손한 인사말이에요.", english: "Hello / Good day — the standard polite greeting in Korean.", spanish: "Hola / Buenos días — el saludo cortés estándar en coreano.", indonesian: "Halo / Selamat siang — sapaan sopan standar dalam bahasa Korea." },
      example: "안녕하세요! 저는 민준이에요.",
      exampleTranslation: { korean: "안녕하세요! 저는 민준이에요.", english: "Hello! My name is Minjun.", spanish: "¡Hola! Me llamo Minjun.", indonesian: "Halo! Nama saya Minjun." }, speechLang: "ko-KR" },

    { word: "감사합니다", emoji: "🙏", pronunciation: "gam-sa-ham-ni-da",
      meanings: { korean: "정중하게 감사를 표현하는 말이에요.", english: "Thank you very much — a formal expression of gratitude.", spanish: "Muchas gracias — expresión formal de gratitud en coreano.", indonesian: "Terima kasih banyak — ungkapan rasa terima kasih yang formal." },
      example: "도와주셔서 감사합니다.",
      exampleTranslation: { korean: "도와주셔서 감사합니다.", english: "Thank you for helping me.", spanish: "Gracias por ayudarme.", indonesian: "Terima kasih sudah membantu saya." }, speechLang: "ko-KR" },

    { word: "사랑해요", emoji: "❤️", pronunciation: "sa-rang-hae-yo",
      meanings: { korean: "따뜻하고 공손하게 사랑을 표현하는 말이에요.", english: "I love you — a warm, polite way to express love.", spanish: "Te amo — manera cálida y cortés de expresar amor en coreano.", indonesian: "Aku mencintaimu — cara yang hangat dan sopan untuk menyatakan cinta." },
      example: "엄마, 사랑해요.",
      exampleTranslation: { korean: "엄마, 사랑해요.", english: "Mom, I love you.", spanish: "Mamá, te quiero.", indonesian: "Ibu, aku menyayangimu." }, speechLang: "ko-KR" },

    { word: "맛있어요", emoji: "😋", pronunciation: "ma-si-sseo-yo",
      meanings: { korean: "음식을 칭찬할 때 사용하는 표현이에요.", english: "It's delicious — used to compliment food.", spanish: "Está delicioso — se usa para elogiar la comida.", indonesian: "Enak sekali — dipakai untuk memuji makanan." },
      example: "이 김치찌개 정말 맛있어요!",
      exampleTranslation: { korean: "이 김치찌개 정말 맛있어요!", english: "This kimchi stew is really delicious!", spanish: "¡Este estofado de kimchi está delicioso!", indonesian: "Sup kimchi ini benar-benar enak!" }, speechLang: "ko-KR" },

    { word: "화이팅", emoji: "💪", pronunciation: "hwa-i-ting",
      meanings: { korean: "응원할 때 사용하는 한국식 격려 표현이에요.", english: "You can do it! — a popular Korean motivational cheer.", spanish: "¡Tú puedes! — expresión de aliento coreana muy popular.", indonesian: "Kamu pasti bisa! — sorakan penyemangat khas Korea yang populer." },
      example: "시험 잘 봐! 화이팅!",
      exampleTranslation: { korean: "시험 잘 봐! 화이팅!", english: "Good luck on your test! You've got this!", spanish: "¡Buena suerte en tu examen! ¡Tú puedes!", indonesian: "Semoga sukses ujianmu! Kamu pasti bisa!" }, speechLang: "ko-KR" },

    { word: "괜찮아요", emoji: "😊", pronunciation: "gwaen-chan-a-yo",
      meanings: { korean: "상대방을 안심시키거나 괜찮다고 말할 때 사용해요.", english: "It's okay / I'm fine — used to reassure or accept something.", spanish: "Está bien / Estoy bien — para tranquilizar o aceptar algo.", indonesian: "Tidak apa-apa / Saya baik-baik saja — untuk menenangkan atau menerima sesuatu." },
      example: "걱정 마세요, 괜찮아요.",
      exampleTranslation: { korean: "걱정 마세요, 괜찮아요.", english: "Don't worry, it's okay.", spanish: "No te preocupes, está bien.", indonesian: "Jangan khawatir, tidak apa-apa." }, speechLang: "ko-KR" },

    { word: "물", emoji: "💧", pronunciation: "mul",
      meanings: { korean: "모든 생명체에 필수적인 맑고 무색의 액체예요.", english: "Water — the clear liquid essential for life.", spanish: "Agua — el líquido claro esencial para la vida.", indonesian: "Air — cairan bening yang penting bagi kehidupan." },
      example: "물 한 잔 주세요.",
      exampleTranslation: { korean: "물 한 잔 주세요.", english: "Please give me a glass of water.", spanish: "Por favor, dame un vaso de agua.", indonesian: "Tolong beri saya segelas air." }, speechLang: "ko-KR" },

    { word: "집", emoji: "🏠", pronunciation: "jip",
      meanings: { korean: "사람들이 살아가는 건물이에요.", english: "House / Home — the place where you live.", spanish: "Casa / Hogar — el lugar donde vives.", indonesian: "Rumah / Tempat tinggal — tempat kamu tinggal." },
      example: "우리 집은 학교 근처에 있어요.",
      exampleTranslation: { korean: "우리 집은 학교 근처에 있어요.", english: "My house is near the school.", spanish: "Mi casa está cerca de la escuela.", indonesian: "Rumah kami ada di dekat sekolah." }, speechLang: "ko-KR" },

    { word: "강아지", emoji: "🐶", pronunciation: "gang-a-ji",
      meanings: { korean: "어린 개 또는 귀여운 개를 부를 때 사용하는 말이에요.", english: "Puppy — a young dog or a cute way to say 'dog' in Korean.", spanish: "Cachorro — perro joven o forma cariñosa de decir 'perro' en coreano.", indonesian: "Anak anjing — anjing kecil atau sebutan manis untuk 'anjing' dalam bahasa Korea." },
      example: "우리 강아지는 정말 귀여워요.",
      exampleTranslation: { korean: "우리 강아지는 정말 귀여워요.", english: "My puppy is really cute.", spanish: "Mi cachorro es muy tierno.", indonesian: "Anak anjing saya sangat lucu." }, speechLang: "ko-KR" },

    { word: "고양이", emoji: "🐱", pronunciation: "go-yang-i",
      meanings: { korean: "독립적이고 우아한 반려동물이에요.", english: "Cat — an independent and graceful pet.", spanish: "Gato — mascota independiente y elegante.", indonesian: "Kucing — hewan peliharaan yang mandiri dan anggun." },
      example: "고양이가 창문 옆에서 자고 있어요.",
      exampleTranslation: { korean: "고양이가 창문 옆에서 자고 있어요.", english: "The cat is sleeping next to the window.", spanish: "El gato está durmiendo junto a la ventana.", indonesian: "Kucing itu sedang tidur di samping jendela." }, speechLang: "ko-KR" },

    { word: "음식", emoji: "🍽️", pronunciation: "eum-sik",
      meanings: { korean: "먹기 위한 모든 것을 통틀어 이르는 말이에요.", english: "Food — anything you eat for nutrition and pleasure.", spanish: "Comida — todo lo que comes por nutrición y placer.", indonesian: "Makanan — segala yang kamu makan untuk nutrisi dan kesenangan." },
      example: "한국 음식은 정말 맛있어요.",
      exampleTranslation: { korean: "한국 음식은 정말 맛있어요.", english: "Korean food is really delicious.", spanish: "La comida coreana es realmente deliciosa.", indonesian: "Makanan Korea benar-benar enak." }, speechLang: "ko-KR" },

    { word: "책", emoji: "📖", pronunciation: "chaek",
      meanings: { korean: "읽기 위해 묶인 페이지들로 이루어진 물건이에요.", english: "Book — pages bound together for reading.", spanish: "Libro — páginas encuadernadas para leer.", indonesian: "Buku — halaman-halaman yang dijilid untuk dibaca." },
      example: "저는 매일 책을 읽어요.",
      exampleTranslation: { korean: "저는 매일 책을 읽어요.", english: "I read a book every day.", spanish: "Leo un libro todos los días.", indonesian: "Saya membaca buku setiap hari." }, speechLang: "ko-KR" },

    { word: "학교", emoji: "🏫", pronunciation: "hak-gyo",
      meanings: { korean: "학생들이 공부하는 곳이에요.", english: "School — the place where students study and learn.", spanish: "Escuela — el lugar donde los estudiantes estudian y aprenden.", indonesian: "Sekolah — tempat para siswa belajar dan menuntut ilmu." },
      example: "학교는 아침 8시에 시작해요.",
      exampleTranslation: { korean: "학교는 아침 8시에 시작해요.", english: "School starts at 8 o'clock in the morning.", spanish: "La escuela comienza a las 8 de la mañana.", indonesian: "Sekolah dimulai pukul 8 pagi." }, speechLang: "ko-KR" },

    { word: "가족", emoji: "👨‍👩‍👧‍👦", pronunciation: "ga-jok",
      meanings: { korean: "함께 살거나 혈연으로 이어진 사람들의 집단이에요.", english: "Family — a group of people related by blood or living together.", spanish: "Familia — grupo de personas unidas por sangre o que viven juntas.", indonesian: "Keluarga — sekelompok orang yang terikat hubungan darah atau tinggal bersama." },
      example: "우리 가족은 다섯 명이에요.",
      exampleTranslation: { korean: "우리 가족은 다섯 명이에요.", english: "My family has five members.", spanish: "Mi familia tiene cinco miembros.", indonesian: "Keluarga saya berjumlah lima orang." }, speechLang: "ko-KR" },

    { word: "친구", emoji: "🤝", pronunciation: "chin-gu",
      meanings: { korean: "서로 좋아하고 함께 시간을 보내는 사람이에요.", english: "Friend — a person you like and enjoy spending time with.", spanish: "Amigo — persona que te agrada y con quien disfrutas pasar tiempo.", indonesian: "Teman — orang yang kamu sukai dan senang menghabiskan waktu bersamanya." },
      example: "제 친구는 정말 재미있어요.",
      exampleTranslation: { korean: "제 친구는 정말 재미있어요.", english: "My friend is really funny.", spanish: "Mi amigo es muy divertido.", indonesian: "Teman saya sangat lucu." }, speechLang: "ko-KR" },

    { word: "행복", emoji: "😊", pronunciation: "haeng-bok",
      meanings: { korean: "기쁘고 만족스러운 감정 상태예요.", english: "Happiness — a state of feeling joyful and content.", spanish: "Felicidad — estado de sentirse alegre y contento.", indonesian: "Kebahagiaan — keadaan merasa gembira dan puas." },
      example: "행복은 작은 것들에서 와요.",
      exampleTranslation: { korean: "행복은 작은 것들에서 와요.", english: "Happiness comes from small things.", spanish: "La felicidad viene de las pequeñas cosas.", indonesian: "Kebahagiaan datang dari hal-hal kecil." }, speechLang: "ko-KR" },

    { word: "슬픔", emoji: "😢", pronunciation: "seul-peum",
      meanings: { korean: "불행하거나 슬픈 감정이에요.", english: "Sadness — the feeling of being unhappy or sorrowful.", spanish: "Tristeza — el sentimiento de ser infeliz o afligido.", indonesian: "Kesedihan — perasaan tidak bahagia atau berduka." },
      example: "슬픔을 느낄 때 음악을 들어요.",
      exampleTranslation: { korean: "슬픔을 느낄 때 음악을 들어요.", english: "When I feel sadness, I listen to music.", spanish: "Cuando siento tristeza, escucho música.", indonesian: "Saat merasa sedih, saya mendengarkan musik." }, speechLang: "ko-KR" },

    { word: "크다", emoji: "🐘", pronunciation: "keu-da",
      meanings: { korean: "크기나 규모가 큰 것을 표현하는 말이에요.", english: "To be big / large — describing something great in size.", spanish: "Ser grande — describir algo de gran tamaño.", indonesian: "Menjadi besar — menggambarkan sesuatu yang besar ukurannya." },
      example: "저 나무는 정말 크다!",
      exampleTranslation: { korean: "저 나무는 정말 크다!", english: "That tree is really big!", spanish: "¡Ese árbol es realmente grande!", indonesian: "Pohon itu benar-benar besar!" }, speechLang: "ko-KR" },

    { word: "작다", emoji: "🐭", pronunciation: "jak-da",
      meanings: { korean: "크기나 규모가 작은 것을 표현하는 말이에요.", english: "To be small / little — describing something small in size.", spanish: "Ser pequeño — describir algo de tamaño reducido.", indonesian: "Menjadi kecil — menggambarkan sesuatu yang kecil ukurannya." },
      example: "이 방은 작지만 아늑해요.",
      exampleTranslation: { korean: "이 방은 작지만 아늑해요.", english: "This room is small but cozy.", spanish: "Esta habitación es pequeña pero acogedora.", indonesian: "Kamar ini kecil tapi nyaman." }, speechLang: "ko-KR" },

    { word: "빨강", emoji: "🔴", pronunciation: "ppal-gang",
      meanings: { korean: "피나 불의 색깔이에요.", english: "Red — the color of blood or fire.", spanish: "Rojo — el color de la sangre o el fuego.", indonesian: "Merah — warna darah atau api." },
      example: "신호등이 빨강이에요. 멈춰야 해요.",
      exampleTranslation: { korean: "신호등이 빨강이에요. 멈춰야 해요.", english: "The traffic light is red. You need to stop.", spanish: "El semáforo está en rojo. Necesitas parar.", indonesian: "Lampu lalu lintasnya merah. Kamu harus berhenti." }, speechLang: "ko-KR" },

    { word: "파랑", emoji: "🔵", pronunciation: "pa-rang",
      meanings: { korean: "하늘이나 바다의 색깔이에요.", english: "Blue — the color of the sky or the sea.", spanish: "Azul — el color del cielo o el mar.", indonesian: "Biru — warna langit atau laut." },
      example: "오늘 하늘이 파랗게 맑아요.",
      exampleTranslation: { korean: "오늘 하늘이 파랗게 맑아요.", english: "The sky is a clear blue today.", spanish: "El cielo está despejado y azul hoy.", indonesian: "Hari ini langit biru cerah." }, speechLang: "ko-KR" },

    { word: "아침", emoji: "🌅", pronunciation: "a-chim",
      meanings: { korean: "하루 중 해가 뜨고 정오 이전까지의 시간이에요.", english: "Morning — the early part of the day before noon.", spanish: "Mañana — la parte temprana del día antes del mediodía.", indonesian: "Pagi — bagian awal hari sebelum tengah hari." },
      example: "저는 아침마다 커피를 마셔요.",
      exampleTranslation: { korean: "저는 아침마다 커피를 마셔요.", english: "I drink coffee every morning.", spanish: "Tomo café cada mañana.", indonesian: "Saya minum kopi setiap pagi." }, speechLang: "ko-KR" },

    { word: "밤", emoji: "🌙", pronunciation: "bam",
      meanings: { korean: "해가 지고 날이 어두워지는 시간이에요.", english: "Night — the dark period of the day after sunset.", spanish: "Noche — el período oscuro del día después del atardecer.", indonesian: "Malam — periode gelap dalam sehari setelah matahari terbenam." },
      example: "밤에 별이 참 아름다워요.",
      exampleTranslation: { korean: "밤에 별이 참 아름다워요.", english: "The stars are so beautiful at night.", spanish: "Las estrellas son tan hermosas por la noche.", indonesian: "Bintang-bintang sangat indah di malam hari." }, speechLang: "ko-KR" },

    { word: "먹다", emoji: "🍴", pronunciation: "meok-da",
      meanings: { korean: "음식을 씹고 삼키는 행동이에요.", english: "To eat — the action of chewing and swallowing food.", spanish: "Comer — la acción de masticar e ingerir alimentos.", indonesian: "Makan — tindakan mengunyah dan menelan makanan." },
      example: "같이 점심 먹을까요?",
      exampleTranslation: { korean: "같이 점심 먹을까요?", english: "Shall we eat lunch together?", spanish: "¿Comemos juntos el almuerzo?", indonesian: "Mau makan siang bersama?" }, speechLang: "ko-KR" },

    { word: "마시다", emoji: "🥤", pronunciation: "ma-si-da",
      meanings: { korean: "액체를 입으로 마시는 행동이에요.", english: "To drink — to take a liquid into your mouth.", spanish: "Beber — llevar un líquido a la boca.", indonesian: "Minum — memasukkan cairan ke dalam mulut." },
      example: "물을 많이 마시면 건강에 좋아요.",
      exampleTranslation: { korean: "물을 많이 마시면 건강에 좋아요.", english: "Drinking a lot of water is good for your health.", spanish: "Beber mucha agua es bueno para la salud.", indonesian: "Banyak minum air baik untuk kesehatanmu." }, speechLang: "ko-KR" },

    { word: "걷다", emoji: "🚶", pronunciation: "geot-da",
      meanings: { korean: "발로 천천히 이동하는 행동이에요.", english: "To walk — to move on foot at a normal pace.", spanish: "Caminar — moverse a pie a paso normal.", indonesian: "Berjalan — bergerak dengan kaki pada langkah normal." },
      example: "매일 30분 걸으면 건강에 도움이 돼요.",
      exampleTranslation: { korean: "매일 30분 걸으면 건강에 도움이 돼요.", english: "Walking 30 minutes every day helps your health.", spanish: "Caminar 30 minutos al día ayuda a tu salud.", indonesian: "Berjalan 30 menit setiap hari membantu kesehatanmu." }, speechLang: "ko-KR" },

    { word: "뛰다", emoji: "🏃", pronunciation: "ttwi-da",
      meanings: { korean: "빠르게 발로 이동하는 행동이에요.", english: "To run — to move on foot at a fast speed.", spanish: "Correr — moverse a pie a gran velocidad.", indonesian: "Berlari — bergerak dengan kaki pada kecepatan tinggi." },
      example: "버스를 놓칠 것 같아서 뛰었어요.",
      exampleTranslation: { korean: "버스를 놓칠 것 같아서 뛰었어요.", english: "I ran because I thought I'd miss the bus.", spanish: "Corrí porque pensé que perdería el autobús.", indonesian: "Saya berlari karena mengira akan ketinggalan bus." }, speechLang: "ko-KR" },

    { word: "자다", emoji: "😴", pronunciation: "ja-da",
      meanings: { korean: "몸과 마음이 쉬는 자연스러운 수면 상태예요.", english: "To sleep — to rest the body and mind naturally.", spanish: "Dormir — descansar el cuerpo y la mente de forma natural.", indonesian: "Tidur — mengistirahatkan tubuh dan pikiran secara alami." },
      example: "일찍 자면 내일 더 건강할 거예요.",
      exampleTranslation: { korean: "일찍 자면 내일 더 건강할 거예요.", english: "If you sleep early, you'll be healthier tomorrow.", spanish: "Si te duermes temprano, estarás más saludable mañana.", indonesian: "Kalau kamu tidur lebih awal, besok kamu akan lebih sehat." }, speechLang: "ko-KR" },

    /* ── A2 Intermediate ── */
    { word: "바람", emoji: "🌬️", pronunciation: "ba-ram",
      meanings: { korean: "자연에서 부는 공기의 흐름이에요. '소망'이라는 뜻도 있어요.", english: "Wind — also means 'wish' or 'hope' in a poetic context.", spanish: "Viento — también significa 'deseo' o 'esperanza' en contexto poético.", indonesian: "Angin — juga berarti 'harapan' atau 'keinginan' dalam konteks puitis." },
      example: "시원한 바람이 불어서 기분이 좋아요.",
      exampleTranslation: { korean: "시원한 바람이 불어서 기분이 좋아요.", english: "I feel good because a cool breeze is blowing.", spanish: "Me siento bien porque sopla una brisa fresca.", indonesian: "Saya merasa senang karena angin sejuk berembus." }, speechLang: "ko-KR" },

    { word: "그리움", emoji: "💭", pronunciation: "geu-ri-um",
      meanings: { korean: "멀리 있는 사람이나 곳이 몹시 보고 싶은 감정이에요.", english: "Longing — a deep ache for someone or somewhere far away.", spanish: "Añoranza — un profundo deseo de alguien o un lugar lejano.", indonesian: "Kerinduan — kepedihan mendalam akan seseorang atau suatu tempat yang jauh." },
      example: "고향에 대한 그리움이 밀려왔어요.",
      exampleTranslation: { korean: "고향에 대한 그리움이 밀려왔어요.", english: "A wave of longing for my hometown came over me.", spanish: "Me invadió la añoranza de mi ciudad natal.", indonesian: "Gelombang kerinduan akan kampung halaman menyelimuti saya." }, speechLang: "ko-KR" },

    { word: "설레다", emoji: "💓", pronunciation: "seol-le-da",
      meanings: { korean: "기대와 흥분으로 가슴이 두근거리는 감정이에요.", english: "To feel fluttery excitement — a heart-racing anticipation.", spanish: "Sentir emoción palpitante — una anticipación que acelera el corazón.", indonesian: "Merasa berdebar penuh kegembiraan — antisipasi yang membuat jantung berdegup." },
      example: "첫 여행 전날에는 항상 설레요.",
      exampleTranslation: { korean: "첫 여행 전날에는 항상 설레요.", english: "I always feel excited the night before my first trip.", spanish: "Siempre siento mariposas la noche antes de mi primer viaje.", indonesian: "Saya selalu berdebar gembira di malam sebelum perjalanan pertama saya." }, speechLang: "ko-KR" },

    { word: "뿌듯하다", emoji: "🦁", pronunciation: "ppu-deut-ha-da",
      meanings: { korean: "목표를 이뤘을 때 느끼는 따뜻한 자부심이에요.", english: "To feel a warm sense of pride after achieving something.", spanish: "Sentir una cálida sensación de orgullo tras lograr algo.", indonesian: "Merasakan kebanggaan yang hangat setelah mencapai sesuatu." },
      example: "프로젝트를 끝냈을 때 정말 뿌듯했어요.",
      exampleTranslation: { korean: "프로젝트를 끝냈을 때 정말 뿌듯했어요.", english: "I felt really proud when I finished the project.", spanish: "Me sentí muy orgulloso cuando terminé el proyecto.", indonesian: "Saya merasa sangat bangga ketika menyelesaikan proyek itu." }, speechLang: "ko-KR" },

    { word: "어색하다", emoji: "😬", pronunciation: "eo-saek-ha-da",
      meanings: { korean: "상황이 불편하거나 자연스럽지 않을 때 느끼는 감정이에요.", english: "To feel awkward — uncomfortable in a social situation.", spanish: "Sentirse incómodo — torpe en una situación social.", indonesian: "Merasa canggung — tidak nyaman dalam situasi sosial." },
      example: "처음 만난 사람과 대화할 때 좀 어색해요.",
      exampleTranslation: { korean: "처음 만난 사람과 대화할 때 좀 어색해요.", english: "It feels a bit awkward to talk with someone I just met.", spanish: "Me resulta un poco incómodo hablar con alguien que acabo de conocer.", indonesian: "Rasanya agak canggung berbincang dengan orang yang baru saya kenal." }, speechLang: "ko-KR" },

    { word: "귀찮다", emoji: "😩", pronunciation: "gwi-chan-da",
      meanings: { korean: "무언가를 하기 싫고 번거롭게 느껴지는 감정이에요.", english: "To feel too lazy or bothered to do something; irksome.", spanish: "Sentirse demasiado perezoso o fastidiado para hacer algo.", indonesian: "Merasa terlalu malas atau enggan melakukan sesuatu; merepotkan." },
      example: "오늘은 요리가 너무 귀찮아서 배달을 시켰어요.",
      exampleTranslation: { korean: "오늘은 요리가 너무 귀찮아서 배달을 시켰어요.", english: "Cooking felt like too much today, so I ordered delivery.", spanish: "Cocinar se sentía demasiado hoy, así que pedí a domicilio.", indonesian: "Memasak terasa terlalu merepotkan hari ini, jadi saya pesan antar." }, speechLang: "ko-KR" },

    { word: "답답하다", emoji: "😤", pronunciation: "dap-dap-ha-da",
      meanings: { korean: "가슴이 막힌 것처럼 답답하고 숨이 막히는 감정이에요.", english: "To feel frustrated and stifled — like something is blocking your chest.", spanish: "Sentirse frustrado y ahogado — como si algo bloqueara el pecho.", indonesian: "Merasa frustrasi dan sesak — seolah ada yang menyumbat dada." },
      example: "아무리 설명해도 이해 못 해서 정말 답답해요.",
      exampleTranslation: { korean: "아무리 설명해도 이해 못 해서 정말 답답해요.", english: "No matter how much I explain, they don't understand — so frustrating.", spanish: "No importa cuánto explico, no entienden — qué frustrante.", indonesian: "Sebanyak apa pun saya jelaskan, mereka tidak mengerti — sungguh menjengkelkan." }, speechLang: "ko-KR" },

    { word: "황당하다", emoji: "😳", pronunciation: "hwang-dang-ha-da",
      meanings: { korean: "너무 어이없거나 황당해서 말이 안 나오는 감정이에요.", english: "To be utterly dumbfounded — speechless at something absurd.", spanish: "Estar completamente desconcertado ante algo absurdo.", indonesian: "Benar-benar tercengang — tak bisa berkata-kata akan sesuatu yang absurd." },
      example: "그 소식을 듣고 너무 황당해서 말이 안 나왔어요.",
      exampleTranslation: { korean: "그 소식을 듣고 너무 황당해서 말이 안 나왔어요.", english: "I was so dumbfounded by that news that I couldn't speak.", spanish: "Me quedé tan atónito con esa noticia que no pude hablar.", indonesian: "Saya begitu tercengang mendengar kabar itu sampai tak bisa berkata-kata." }, speechLang: "ko-KR" },

    { word: "아쉽다", emoji: "😔", pronunciation: "a-swip-da",
      meanings: { korean: "결과가 기대에 못 미쳐서 아쉽고 미련이 남는 감정이에요.", english: "To feel a lingering regret — wishing things had gone differently.", spanish: "Sentir un pesar persistente — desear que las cosas hubiesen sido distintas.", indonesian: "Merasakan penyesalan yang membekas — berharap segalanya berjalan lain." },
      example: "조금만 더 연습했더라면 좋았을 텐데, 정말 아쉬워요.",
      exampleTranslation: { korean: "조금만 더 연습했더라면 좋았을 텐데, 정말 아쉬워요.", english: "I wish I had practiced a little more — it's really a shame.", spanish: "Ojalá hubiera practicado un poco más — es una verdadera lástima.", indonesian: "Andai saya berlatih sedikit lagi — sungguh sayang sekali." }, speechLang: "ko-KR" },
  ],

  /* ── SPANISH (user is learning Spanish) ─────────────────── */
  spanish: [
    /* ── A1 Beginner ── */
    { word: "Hola", emoji: "👋", pronunciation: "OH-lah",
      meanings: { korean: "스페인어에서 가장 흔한 인사말이에요.", english: "Hello — the universal greeting in Spanish.", spanish: "Hola — el saludo universal en español.", indonesian: "Halo — sapaan universal dalam bahasa Spanyol." },
      example: "¡Hola! ¿Cómo estás?",
      exampleTranslation: { korean: "안녕하세요! 어떻게 지내세요?", english: "Hello! How are you?", spanish: "¡Hola! ¿Cómo estás?", indonesian: "Halo! Apa kabar?" }, speechLang: "es-ES" },

    { word: "Gracias", emoji: "🙏", pronunciation: "GRA-syas",
      meanings: { korean: "스페인어로 감사를 표현하는 말이에요.", english: "Thank you — expressing appreciation in Spanish.", spanish: "Gracias — expresar agradecimiento en español.", indonesian: "Terima kasih — menyatakan apresiasi dalam bahasa Spanyol." },
      example: "Muchas gracias por tu ayuda.",
      exampleTranslation: { korean: "도와주셔서 정말 감사합니다.", english: "Thank you so much for your help.", spanish: "Muchas gracias por tu ayuda.", indonesian: "Terima kasih banyak atas bantuanmu." }, speechLang: "es-ES" },

    { word: "Por favor", emoji: "🤝", pronunciation: "por fa-VOR",
      meanings: { korean: "정중한 부탁을 할 때 사용하는 표현이에요.", english: "Please — used to make polite requests.", spanish: "Por favor — se usa para hacer peticiones corteses.", indonesian: "Tolong — dipakai untuk membuat permintaan yang sopan." },
      example: "Un café con leche, por favor.",
      exampleTranslation: { korean: "카페라떼 한 잔 부탁해요.", english: "A coffee with milk, please.", spanish: "Un café con leche, por favor.", indonesian: "Satu kopi susu, tolong." }, speechLang: "es-ES" },

    { word: "Te quiero", emoji: "❤️", pronunciation: "teh KYEH-ro",
      meanings: { korean: "친구나 가족에게 흔히 사용하는 사랑 표현이에요.", english: "I love you — commonly used for friends and family.", spanish: "Te quiero — comúnmente usado entre amigos y familia.", indonesian: "Aku menyayangimu — umum dipakai untuk teman dan keluarga." },
      example: "Te quiero mucho, mamá.",
      exampleTranslation: { korean: "엄마, 정말 사랑해요.", english: "I love you so much, mom.", spanish: "Te quiero mucho, mamá.", indonesian: "Aku sangat menyayangimu, Ibu." }, speechLang: "es-ES" },

    { word: "Buenos días", emoji: "☀️", pronunciation: "BWEH-nos DEE-as",
      meanings: { korean: "활기찬 스페인어 아침 인사예요.", english: "Good morning — a cheerful morning greeting in Spanish.", spanish: "Buenos días — un alegre saludo matutino en español.", indonesian: "Selamat pagi — sapaan pagi yang ceria dalam bahasa Spanyol." },
      example: "¡Buenos días! ¿Dormiste bien?",
      exampleTranslation: { korean: "좋은 아침이에요! 잘 잤어요?", english: "Good morning! Did you sleep well?", spanish: "¡Buenos días! ¿Dormiste bien?", indonesian: "Selamat pagi! Apakah kamu tidur nyenyak?" }, speechLang: "es-ES" },

    { word: "Delicioso", emoji: "😋", pronunciation: "de-li-SYOH-so",
      meanings: { korean: "음식이 정말 맛있다고 표현할 때 사용해요.", english: "Delicious — used to express that food tastes amazing.", spanish: "Delicioso — se usa para expresar que la comida está muy rica.", indonesian: "Lezat — dipakai untuk menyatakan bahwa makanan terasa luar biasa." },
      example: "Esta paella está deliciosa.",
      exampleTranslation: { korean: "이 파에야 정말 맛있어요.", english: "This paella is delicious.", spanish: "Esta paella está deliciosa.", indonesian: "Paella ini lezat." }, speechLang: "es-ES" },

    { word: "Agua", emoji: "💧", pronunciation: "AH-gwah",
      meanings: { korean: "모든 생명체에 필수적인 맑은 액체예요.", english: "Water — the clear liquid essential for all life.", spanish: "Agua — el líquido transparente esencial para toda la vida.", indonesian: "Air — cairan bening yang penting bagi semua kehidupan." },
      example: "¿Me puedes traer un vaso de agua, por favor?",
      exampleTranslation: { korean: "물 한 잔 가져다 주실 수 있어요?", english: "Can you bring me a glass of water, please?", spanish: "¿Me puedes traer un vaso de agua, por favor?", indonesian: "Bisakah kamu membawakan saya segelas air, tolong?" }, speechLang: "es-ES" },

    { word: "Casa", emoji: "🏠", pronunciation: "KAH-sah",
      meanings: { korean: "사람들이 사는 건물이에요.", english: "House / Home — the building where you live.", spanish: "Casa — el edificio donde vives.", indonesian: "Rumah / Tempat tinggal — bangunan tempat kamu tinggal." },
      example: "Mi casa tiene un jardín muy bonito.",
      exampleTranslation: { korean: "우리 집에는 아주 예쁜 정원이 있어요.", english: "My house has a very beautiful garden.", spanish: "Mi casa tiene un jardín muy bonito.", indonesian: "Rumah saya memiliki taman yang sangat indah." }, speechLang: "es-ES" },

    { word: "Perro", emoji: "🐶", pronunciation: "PEH-rro",
      meanings: { korean: "사람과 함께 사는 반려동물이에요.", english: "Dog — a pet that lives with people as a companion.", spanish: "Perro — mascota que convive con las personas como compañero.", indonesian: "Anjing — hewan peliharaan yang hidup bersama manusia sebagai teman." },
      example: "Mi perro se llama Max y es muy juguetón.",
      exampleTranslation: { korean: "우리 강아지 이름은 맥스이고 정말 장난꾸러기예요.", english: "My dog's name is Max and he's very playful.", spanish: "Mi perro se llama Max y es muy juguetón.", indonesian: "Anjing saya bernama Max dan dia sangat suka bermain." }, speechLang: "es-ES" },

    { word: "Gato", emoji: "🐱", pronunciation: "GAH-toh",
      meanings: { korean: "독립적이고 우아한 반려동물이에요.", english: "Cat — an independent and graceful pet.", spanish: "Gato — mascota independiente y elegante.", indonesian: "Kucing — hewan peliharaan yang mandiri dan anggun." },
      example: "El gato duerme en el sofá todo el día.",
      exampleTranslation: { korean: "고양이가 하루 종일 소파에서 자요.", english: "The cat sleeps on the sofa all day.", spanish: "El gato duerme en el sofá todo el día.", indonesian: "Kucing itu tidur di sofa sepanjang hari." }, speechLang: "es-ES" },

    { word: "Comida", emoji: "🍽️", pronunciation: "ko-MEE-da",
      meanings: { korean: "먹기 위한 모든 것을 통틀어 이르는 말이에요.", english: "Food — anything eaten for nutrition and pleasure.", spanish: "Comida — cualquier cosa que se come para nutrición y placer.", indonesian: "Makanan — segala yang dimakan untuk nutrisi dan kesenangan." },
      example: "La comida española es famosa en todo el mundo.",
      exampleTranslation: { korean: "스페인 음식은 전 세계적으로 유명해요.", english: "Spanish food is famous all over the world.", spanish: "La comida española es famosa en todo el mundo.", indonesian: "Makanan Spanyol terkenal di seluruh dunia." }, speechLang: "es-ES" },

    { word: "Libro", emoji: "📖", pronunciation: "LEE-bro",
      meanings: { korean: "읽기 위해 묶인 페이지들로 이루어진 물건이에요.", english: "Book — pages bound together for reading.", spanish: "Libro — páginas encuadernadas para leer.", indonesian: "Buku — halaman-halaman yang dijilid untuk dibaca." },
      example: "Estoy leyendo un libro muy interesante esta semana.",
      exampleTranslation: { korean: "이번 주에 정말 재미있는 책을 읽고 있어요.", english: "I am reading a very interesting book this week.", spanish: "Estoy leyendo un libro muy interesante esta semana.", indonesian: "Saya sedang membaca buku yang sangat menarik minggu ini." }, speechLang: "es-ES" },

    { word: "Escuela", emoji: "🏫", pronunciation: "es-KWEH-lah",
      meanings: { korean: "학생들이 공부하는 곳이에요.", english: "School — the place where students learn and study.", spanish: "Escuela — el lugar donde los estudiantes aprenden y estudian.", indonesian: "Sekolah — tempat para siswa belajar dan menuntut ilmu." },
      example: "Los niños van a la escuela de lunes a viernes.",
      exampleTranslation: { korean: "아이들은 월요일부터 금요일까지 학교에 가요.", english: "The children go to school from Monday to Friday.", spanish: "Los niños van a la escuela de lunes a viernes.", indonesian: "Anak-anak pergi ke sekolah dari Senin sampai Jumat." }, speechLang: "es-ES" },

    { word: "Familia", emoji: "👨‍👩‍👧‍👦", pronunciation: "fa-MEE-lya",
      meanings: { korean: "함께 살거나 혈연으로 이어진 사람들의 집단이에요.", english: "Family — a group of people related by blood or living together.", spanish: "Familia — grupo de personas unidas por sangre o que viven juntas.", indonesian: "Keluarga — sekelompok orang yang terikat hubungan darah atau tinggal bersama." },
      example: "La familia se reúne cada domingo para comer juntos.",
      exampleTranslation: { korean: "가족은 매주 일요일에 모여 함께 식사해요.", english: "The family gathers every Sunday to eat together.", spanish: "La familia se reúne cada domingo para comer juntos.", indonesian: "Keluarga itu berkumpul setiap Minggu untuk makan bersama." }, speechLang: "es-ES" },

    { word: "Amigo", emoji: "🤝", pronunciation: "ah-MEE-go",
      meanings: { korean: "서로 좋아하고 함께 시간을 보내는 사람이에요.", english: "Friend — someone you like and enjoy spending time with.", spanish: "Amigo — alguien que te agrada y con quien disfrutas pasar tiempo.", indonesian: "Teman — seseorang yang kamu sukai dan senang menghabiskan waktu bersamanya." },
      example: "Mi mejor amigo y yo nos conocemos desde niños.",
      exampleTranslation: { korean: "저의 가장 친한 친구와 저는 어릴 때부터 알고 지냈어요.", english: "My best friend and I have known each other since we were children.", spanish: "Mi mejor amigo y yo nos conocemos desde niños.", indonesian: "Sahabat saya dan saya sudah saling kenal sejak kecil." }, speechLang: "es-ES" },

    { word: "Feliz", emoji: "😊", pronunciation: "fe-LEES",
      meanings: { korean: "기쁘고 만족스러운 감정 상태예요.", english: "Happy — feeling joy, pleasure, or contentment.", spanish: "Feliz — sentir alegría, placer o satisfacción.", indonesian: "Bahagia — merasakan sukacita, kesenangan, atau kepuasan." },
      example: "Estoy muy feliz de verte después de tanto tiempo.",
      exampleTranslation: { korean: "오랜만에 당신을 보니 정말 기뻐요.", english: "I am so happy to see you after such a long time.", spanish: "Estoy muy feliz de verte después de tanto tiempo.", indonesian: "Saya sangat senang bertemu denganmu setelah sekian lama." }, speechLang: "es-ES" },

    { word: "Triste", emoji: "😢", pronunciation: "TREE-ste",
      meanings: { korean: "슬프거나 불행한 감정을 표현하는 말이에요.", english: "Sad — feeling unhappy or sorrowful.", spanish: "Triste — sentirse infeliz o afligido.", indonesian: "Sedih — merasa tidak bahagia atau berduka." },
      example: "Se puso triste cuando el verano llegó a su fin.",
      exampleTranslation: { korean: "여름이 끝나자 그가 슬퍼졌어요.", english: "He became sad when summer came to an end.", spanish: "Se puso triste cuando el verano llegó a su fin.", indonesian: "Dia menjadi sedih ketika musim panas berakhir." }, speechLang: "es-ES" },

    { word: "Grande", emoji: "🐘", pronunciation: "GRAN-de",
      meanings: { korean: "크기나 규모가 큰 것을 표현하는 말이에요.", english: "Big / Large — great in size, amount, or importance.", spanish: "Grande — de gran tamaño, cantidad o importancia.", indonesian: "Besar — besar dalam ukuran, jumlah, atau kepentingan." },
      example: "Viven en una casa muy grande con piscina.",
      exampleTranslation: { korean: "그들은 수영장이 있는 아주 큰 집에 살아요.", english: "They live in a very big house with a swimming pool.", spanish: "Viven en una casa muy grande con piscina.", indonesian: "Mereka tinggal di rumah yang sangat besar dengan kolam renang." }, speechLang: "es-ES" },

    { word: "Pequeño", emoji: "🐭", pronunciation: "pe-KE-nyo",
      meanings: { korean: "크기나 규모가 작은 것을 표현하는 말이에요.", english: "Small / Little — not big; of little size.", spanish: "Pequeño — no grande; de poco tamaño.", indonesian: "Kecil — tidak besar; berukuran kecil." },
      example: "Tiene un apartamento pequeño pero muy acogedor.",
      exampleTranslation: { korean: "그녀는 작지만 아늑한 아파트에 살아요.", english: "She has a small but very cozy apartment.", spanish: "Tiene un apartamento pequeño pero muy acogedor.", indonesian: "Dia punya apartemen kecil tapi sangat nyaman." }, speechLang: "es-ES" },

    { word: "Rojo", emoji: "🔴", pronunciation: "ROH-ho",
      meanings: { korean: "피나 불의 색깔이에요.", english: "Red — the color of blood or fire.", spanish: "Rojo — el color de la sangre o el fuego.", indonesian: "Merah — warna darah atau api." },
      example: "Las rosas rojas son el símbolo del amor.",
      exampleTranslation: { korean: "빨간 장미는 사랑의 상징이에요.", english: "Red roses are the symbol of love.", spanish: "Las rosas rojas son el símbolo del amor.", indonesian: "Mawar merah adalah lambang cinta." }, speechLang: "es-ES" },

    { word: "Azul", emoji: "🔵", pronunciation: "ah-SOOL",
      meanings: { korean: "하늘이나 바다의 색깔이에요.", english: "Blue — the color of the sky or the sea.", spanish: "Azul — el color del cielo o el mar.", indonesian: "Biru — warna langit atau laut." },
      example: "El mar Mediterráneo tiene un azul increíble.",
      exampleTranslation: { korean: "지중해는 믿을 수 없을 만큼 파란색이에요.", english: "The Mediterranean Sea has an incredible blue color.", spanish: "El mar Mediterráneo tiene un azul increíble.", indonesian: "Laut Mediterania memiliki warna biru yang menakjubkan." }, speechLang: "es-ES" },

    { word: "Mañana", emoji: "🌅", pronunciation: "ma-NYA-na",
      meanings: { korean: "아침 또는 내일이라는 두 가지 뜻을 가진 단어예요.", english: "Morning OR Tomorrow — it means both in Spanish!", spanish: "Mañana — significa tanto 'mañana' (por la mañana) como 'mañana' (el día siguiente).", indonesian: "Pagi ATAU Besok — dalam bahasa Spanyol kata ini berarti keduanya!" },
      example: "Nos vemos mañana por la mañana.",
      exampleTranslation: { korean: "내일 아침에 봐요.", english: "See you tomorrow morning.", spanish: "Nos vemos mañana por la mañana.", indonesian: "Sampai jumpa besok pagi." }, speechLang: "es-ES" },

    { word: "Noche", emoji: "🌙", pronunciation: "NOH-che",
      meanings: { korean: "해가 지고 날이 어두워지는 시간이에요.", english: "Night — the dark time of day after sunset.", spanish: "Noche — el tiempo oscuro del día después del atardecer.", indonesian: "Malam — waktu gelap dalam sehari setelah matahari terbenam." },
      example: "Las noches de verano en Madrid son muy animadas.",
      exampleTranslation: { korean: "마드리드의 여름밤은 매우 활기차요.", english: "Summer nights in Madrid are very lively.", spanish: "Las noches de verano en Madrid son muy animadas.", indonesian: "Malam-malam musim panas di Madrid sangat semarak." }, speechLang: "es-ES" },

    { word: "Comer", emoji: "🍴", pronunciation: "ko-MAIR",
      meanings: { korean: "음식을 씹고 삼키는 행동이에요.", english: "To eat — the action of chewing and swallowing food.", spanish: "Comer — la acción de masticar e ingerir alimentos.", indonesian: "Makan — tindakan mengunyah dan menelan makanan." },
      example: "¿Quieres comer juntos esta tarde?",
      exampleTranslation: { korean: "오늘 오후에 함께 식사할래요?", english: "Do you want to eat together this afternoon?", spanish: "¿Quieres comer juntos esta tarde?", indonesian: "Apakah kamu mau makan bersama sore ini?" }, speechLang: "es-ES" },

    { word: "Beber", emoji: "🥤", pronunciation: "be-BAIR",
      meanings: { korean: "액체를 마시는 행동이에요.", english: "To drink — to take a liquid into your mouth.", spanish: "Beber — llevar un líquido a la boca.", indonesian: "Minum — memasukkan cairan ke dalam mulut." },
      example: "Es importante beber agua durante el ejercicio.",
      exampleTranslation: { korean: "운동 중에 물을 마시는 것은 중요해요.", english: "It is important to drink water during exercise.", spanish: "Es importante beber agua durante el ejercicio.", indonesian: "Penting untuk minum air selama berolahraga." }, speechLang: "es-ES" },

    { word: "Caminar", emoji: "🚶", pronunciation: "ka-mi-NAR",
      meanings: { korean: "발로 천천히 이동하는 행동이에요.", english: "To walk — to move on foot at a normal pace.", spanish: "Caminar — moverse a pie a un ritmo normal.", indonesian: "Berjalan — bergerak dengan kaki pada langkah normal." },
      example: "Me gusta caminar por el parque al atardecer.",
      exampleTranslation: { korean: "해질 무렵 공원을 산책하는 것을 좋아해요.", english: "I like to walk through the park at sunset.", spanish: "Me gusta caminar por el parque al atardecer.", indonesian: "Saya suka berjalan-jalan di taman saat senja." }, speechLang: "es-ES" },

    { word: "Correr", emoji: "🏃", pronunciation: "ko-RAIR",
      meanings: { korean: "빠르게 발로 이동하는 행동이에요.", english: "To run — to move on foot at a fast speed.", spanish: "Correr — moverse a pie a gran velocidad.", indonesian: "Berlari — bergerak dengan kaki pada kecepatan tinggi." },
      example: "Corro cinco kilómetros cada mañana antes del trabajo.",
      exampleTranslation: { korean: "저는 출근 전 매일 아침 5킬로미터를 달려요.", english: "I run five kilometers every morning before work.", spanish: "Corro cinco kilómetros cada mañana antes del trabajo.", indonesian: "Saya berlari lima kilometer setiap pagi sebelum bekerja." }, speechLang: "es-ES" },

    { word: "Amar", emoji: "❤️", pronunciation: "ah-MAR",
      meanings: { korean: "누군가나 무언가에 대한 깊은 감정을 느끼는 것이에요.", english: "To love — to feel deep affection for someone or something.", spanish: "Amar — sentir profundo afecto por alguien o algo.", indonesian: "Mencintai — merasakan kasih sayang yang mendalam pada seseorang atau sesuatu." },
      example: "Amo a mi familia con todo mi corazón.",
      exampleTranslation: { korean: "저는 온 마음을 다해 가족을 사랑해요.", english: "I love my family with all my heart.", spanish: "Amo a mi familia con todo mi corazón.", indonesian: "Saya mencintai keluarga saya dengan sepenuh hati." }, speechLang: "es-ES" },

    { word: "Dormir", emoji: "😴", pronunciation: "dor-MEER",
      meanings: { korean: "몸과 마음이 자연스럽게 쉬는 수면 상태예요.", english: "To sleep — the natural rest state of body and mind.", spanish: "Dormir — el estado natural de descanso del cuerpo y la mente.", indonesian: "Tidur — keadaan istirahat alami tubuh dan pikiran." },
      example: "Necesito dormir ocho horas para sentirme bien.",
      exampleTranslation: { korean: "저는 건강하게 느끼려면 8시간을 자야 해요.", english: "I need to sleep eight hours to feel good.", spanish: "Necesito dormir ocho horas para sentirme bien.", indonesian: "Saya perlu tidur delapan jam agar merasa sehat." }, speechLang: "es-ES" },

    /* ── A2 Intermediate ── */
    { word: "Tranquilo", emoji: "🧘", pronunciation: "tran-KEE-lo",
      meanings: { korean: "고요하고 평화로운 상태예요.", english: "Calm / Peaceful — quiet and free from disturbance.", spanish: "Tranquilo — quieto y libre de perturbaciones.", indonesian: "Tenang / Damai — sunyi dan bebas dari gangguan." },
      example: "El campo es muy tranquilo comparado con la ciudad.",
      exampleTranslation: { korean: "시골은 도시에 비해 매우 조용해요.", english: "The countryside is very calm compared to the city.", spanish: "El campo es muy tranquilo comparado con la ciudad.", indonesian: "Pedesaan sangat tenang dibandingkan dengan kota." }, speechLang: "es-ES" },

    { word: "Hermoso", emoji: "🌸", pronunciation: "air-MOH-so",
      meanings: { korean: "보거나 경험하기에 매우 아름다운 것이에요.", english: "Beautiful / Gorgeous — visually stunning and pleasing.", spanish: "Hermoso — visualmente impresionante y agradable.", indonesian: "Indah / Cantik — memukau secara visual dan menyenangkan." },
      example: "¡Qué hermoso paisaje tiene este valle!",
      exampleTranslation: { korean: "이 계곡은 정말 아름다운 풍경을 가지고 있어요!", english: "What a beautiful landscape this valley has!", spanish: "¡Qué hermoso paisaje tiene este valle!", indonesian: "Sungguh indah pemandangan yang dimiliki lembah ini!" }, speechLang: "es-ES" },

    { word: "Importante", emoji: "⭐", pronunciation: "im-por-TAN-te",
      meanings: { korean: "크게 가치 있거나 의미 있는 것이에요.", english: "Important — having great value or significance.", spanish: "Importante — que tiene gran valor o significado.", indonesian: "Penting — memiliki nilai atau makna yang besar." },
      example: "Es importante practicar el español todos los días.",
      exampleTranslation: { korean: "매일 스페인어를 연습하는 것이 중요해요.", english: "It is important to practice Spanish every day.", spanish: "Es importante practicar el español todos los días.", indonesian: "Penting untuk berlatih bahasa Spanyol setiap hari." }, speechLang: "es-ES" },

    { word: "Diferente", emoji: "🔄", pronunciation: "di-fe-REN-te",
      meanings: { korean: "같지 않거나 다른 종류의 것이에요.", english: "Different — not the same; unlike others.", spanish: "Diferente — no igual; a diferencia de los demás.", indonesian: "Berbeda — tidak sama; tidak seperti yang lain." },
      example: "Cada país tiene una cultura completamente diferente.",
      exampleTranslation: { korean: "모든 나라는 완전히 다른 문화를 가지고 있어요.", english: "Every country has a completely different culture.", spanish: "Cada país tiene una cultura completamente diferente.", indonesian: "Setiap negara memiliki budaya yang benar-benar berbeda." }, speechLang: "es-ES" },

    { word: "Difícil", emoji: "🧩", pronunciation: "di-FEE-sil",
      meanings: { korean: "하기 어렵거나 많은 노력이 필요한 것이에요.", english: "Difficult — hard to do; requiring great effort.", spanish: "Difícil — difícil de hacer; que requiere gran esfuerzo.", indonesian: "Sulit — sukar dilakukan; membutuhkan usaha besar." },
      example: "El subjuntivo es difícil pero muy importante en español.",
      exampleTranslation: { korean: "접속법은 어렵지만 스페인어에서 매우 중요해요.", english: "The subjunctive is difficult but very important in Spanish.", spanish: "El subjuntivo es difícil pero muy importante en español.", indonesian: "Subjuntif itu sulit tetapi sangat penting dalam bahasa Spanyol." }, speechLang: "es-ES" },

    { word: "Posible", emoji: "💡", pronunciation: "po-SEE-ble",
      meanings: { korean: "일어날 수 있거나 할 수 있는 것이에요.", english: "Possible — able to happen or be done.", spanish: "Posible — que puede suceder o hacerse.", indonesian: "Mungkin — dapat terjadi atau dilakukan." },
      example: "Con dedicación, todo es posible en la vida.",
      exampleTranslation: { korean: "헌신이 있으면 삶에서 모든 것이 가능해요.", english: "With dedication, everything is possible in life.", spanish: "Con dedicación, todo es posible en la vida.", indonesian: "Dengan dedikasi, segalanya mungkin dalam hidup." }, speechLang: "es-ES" },

    { word: "Necesario", emoji: "🔑", pronunciation: "ne-se-SA-ryo",
      meanings: { korean: "꼭 있어야 하거나 반드시 해야 하는 것이에요.", english: "Necessary — required or essential; something you must have.", spanish: "Necesario — requerido o esencial; algo que debes tener.", indonesian: "Perlu — diperlukan atau penting; sesuatu yang harus kamu miliki." },
      example: "Es necesario tener paciencia para aprender un idioma.",
      exampleTranslation: { korean: "언어를 배우기 위해서는 인내심이 필요해요.", english: "It is necessary to have patience to learn a language.", spanish: "Es necesario tener paciencia para aprender un idioma.", indonesian: "Perlu memiliki kesabaran untuk belajar suatu bahasa." }, speechLang: "es-ES" },

    { word: "Cómodo", emoji: "🛋️", pronunciation: "KO-mo-do",
      meanings: { korean: "편안하고 안락한 느낌을 주는 것이에요.", english: "Comfortable — providing ease and relaxation.", spanish: "Cómodo — que proporciona comodidad y relajación.", indonesian: "Nyaman — memberikan kemudahan dan rasa rileks." },
      example: "Este sillón es tan cómodo que me quedo dormido.",
      exampleTranslation: { korean: "이 안락의자는 너무 편해서 잠들어 버려요.", english: "This armchair is so comfortable that I fall asleep.", spanish: "Este sillón es tan cómodo que me quedo dormido.", indonesian: "Kursi ini begitu nyaman sampai saya tertidur." }, speechLang: "es-ES" },

    { word: "Interesante", emoji: "🔍", pronunciation: "in-te-re-SAN-te",
      meanings: { korean: "관심과 호기심을 불러일으키는 것이에요.", english: "Interesting — arousing curiosity and attention.", spanish: "Interesante — que despierta curiosidad y atención.", indonesian: "Menarik — membangkitkan rasa ingin tahu dan perhatian." },
      example: "La historia de España es muy interesante y larga.",
      exampleTranslation: { korean: "스페인의 역사는 매우 흥미롭고 길어요.", english: "The history of Spain is very interesting and long.", spanish: "La historia de España es muy interesante y larga.", indonesian: "Sejarah Spanyol sangat menarik dan panjang." }, speechLang: "es-ES" },

    { word: "Sorprendido", emoji: "😲", pronunciation: "sor-pren-DEE-do",
      meanings: { korean: "예상치 못한 일에 놀란 감정이에요.", english: "Surprised — astonished at something unexpected.", spanish: "Sorprendido — asombrado ante algo inesperado.", indonesian: "Terkejut — takjub akan sesuatu yang tak terduga." },
      example: "Estaba sorprendida cuando le dieron el trabajo.",
      exampleTranslation: { korean: "그녀가 취직됐을 때 정말 놀랐어요.", english: "She was surprised when she got the job.", spanish: "Estaba sorprendida cuando le dieron el trabajo.", indonesian: "Dia terkejut ketika diterima bekerja." }, speechLang: "es-ES" },

    { word: "Emocionado", emoji: "🎉", pronunciation: "e-mo-syo-NA-do",
      meanings: { korean: "기대나 열정으로 설레는 감정이에요.", english: "Excited — feeling enthusiastic and eager about something.", spanish: "Emocionado — sentirse entusiasmado y ansioso por algo.", indonesian: "Bersemangat — merasa antusias dan ingin sekali akan sesuatu." },
      example: "Estoy muy emocionado por mi viaje a México.",
      exampleTranslation: { korean: "멕시코 여행이 너무 기대돼요.", english: "I am very excited about my trip to Mexico.", spanish: "Estoy muy emocionado por mi viaje a México.", indonesian: "Saya sangat bersemangat tentang perjalanan saya ke Meksiko." }, speechLang: "es-ES" },

    { word: "Preocupado", emoji: "😟", pronunciation: "pre-o-ku-PA-do",
      meanings: { korean: "무언가 잘못될까봐 불안하고 걱정되는 감정이에요.", english: "Worried — feeling anxious about something that might go wrong.", spanish: "Preocupado — sentirse ansioso por algo que podría salir mal.", indonesian: "Khawatir — merasa cemas akan sesuatu yang mungkin tidak beres." },
      example: "Está preocupado por los resultados del examen.",
      exampleTranslation: { korean: "그는 시험 결과가 걱정돼요.", english: "He is worried about the exam results.", spanish: "Está preocupado por los resultados del examen.", indonesian: "Dia khawatir tentang hasil ujian." }, speechLang: "es-ES" },

    { word: "Confundido", emoji: "😕", pronunciation: "kon-fun-DEE-do",
      meanings: { korean: "이해하지 못하거나 당황스러운 상태예요.", english: "Confused — unable to understand something clearly; puzzled.", spanish: "Confundido — incapaz de entender algo con claridad; desconcertado.", indonesian: "Bingung — tidak mampu memahami sesuatu dengan jelas; bingung." },
      example: "Estoy confundido con las reglas de los verbos.",
      exampleTranslation: { korean: "동사 규칙이 이해가 잘 안 돼요.", english: "I am confused about the verb rules.", spanish: "Estoy confundido con las reglas de los verbos.", indonesian: "Saya bingung dengan aturan kata kerja." }, speechLang: "es-ES" },

    { word: "Orgulloso", emoji: "🦁", pronunciation: "or-gu-YO-so",
      meanings: { korean: "자신이나 다른 사람의 성취에 깊이 만족하는 감정이에요.", english: "Proud — feeling deep satisfaction from achievements.", spanish: "Orgulloso — sentir satisfacción profunda por logros propios o ajenos.", indonesian: "Bangga — merasakan kepuasan mendalam dari pencapaian." },
      example: "Estoy muy orgulloso de ti por no rendirte nunca.",
      exampleTranslation: { korean: "절대 포기하지 않는 당신이 정말 자랑스러워요.", english: "I am very proud of you for never giving up.", spanish: "Estoy muy orgulloso de ti por no rendirte nunca.", indonesian: "Saya sangat bangga padamu karena tak pernah menyerah." }, speechLang: "es-ES" },
  ],
};

const ADVANCED_CARDS: Record<NativeLanguage, FlashCard[]> = {
  /* ── INDONESIAN A2 ──────────────────────────────────────── */
  indonesian: [
    { word: "Berkunjung", emoji: "🚪", pronunciation: "ber-KOON-joong",
      meanings: { korean: "다른 사람의 집이나 장소를 방문하는 것이에요.", english: "To visit — to go and spend time at someone's home or a place.", spanish: "Visitar — ir y pasar tiempo en casa de alguien o en un lugar.", indonesian: "Berkunjung — pergi dan menghabiskan waktu di rumah seseorang atau suatu tempat." },
      example: "Akhir pekan ini kami akan berkunjung ke rumah nenek.",
      exampleTranslation: { korean: "이번 주말에 우리는 할머니 댁을 방문할 거예요.", english: "This weekend we will visit grandma's house.", spanish: "Este fin de semana visitaremos la casa de la abuela.", indonesian: "Akhir pekan ini kami akan berkunjung ke rumah nenek." }, speechLang: "id-ID" },

    { word: "Membantu", emoji: "🤲", pronunciation: "mem-BAN-too",
      meanings: { korean: "다른 사람을 돕거나 거드는 것이에요.", english: "To help — to make things easier or possible for someone.", spanish: "Ayudar — hacer las cosas más fáciles o posibles para alguien.", indonesian: "Membantu — meringankan atau memungkinkan sesuatu bagi orang lain." },
      example: "Dia selalu membantu temannya yang sedang kesulitan.",
      exampleTranslation: { korean: "그는 어려움에 처한 친구를 항상 도와줘요.", english: "He always helps his friend who is struggling.", spanish: "Siempre ayuda a su amigo que está pasando dificultades.", indonesian: "Dia selalu membantu temannya yang sedang kesulitan." }, speechLang: "id-ID" },

    { word: "Sibuk", emoji: "🏃", pronunciation: "SEE-book",
      meanings: { korean: "할 일이 많아 바쁜 상태예요.", english: "Busy — having a lot to do; occupied with many tasks.", spanish: "Ocupado — con muchas cosas que hacer; lleno de tareas.", indonesian: "Sibuk — memiliki banyak hal untuk dikerjakan; penuh kegiatan." },
      example: "Saya sangat sibuk dengan pekerjaan minggu ini.",
      exampleTranslation: { korean: "저는 이번 주에 일 때문에 정말 바빠요.", english: "I am very busy with work this week.", spanish: "Estoy muy ocupado con el trabajo esta semana.", indonesian: "Saya sangat sibuk dengan pekerjaan minggu ini." }, speechLang: "id-ID" },

    { word: "Penting", emoji: "⭐", pronunciation: "PEN-ting",
      meanings: { korean: "크게 가치 있거나 의미 있는 것이에요.", english: "Important — having great value or significance.", spanish: "Importante — que tiene gran valor o significado.", indonesian: "Penting — memiliki nilai atau makna yang besar." },
      example: "Sangat penting untuk berlatih bahasa setiap hari.",
      exampleTranslation: { korean: "매일 언어를 연습하는 것이 매우 중요해요.", english: "It is very important to practice the language every day.", spanish: "Es muy importante practicar el idioma cada día.", indonesian: "Sangat penting untuk berlatih bahasa setiap hari." }, speechLang: "id-ID" },

    { word: "Pengalaman", emoji: "🧭", pronunciation: "peng-a-LA-man",
      meanings: { korean: "직접 겪으면서 얻은 지식이나 경험이에요.", english: "Experience — knowledge or skill gained from doing something.", spanish: "Experiencia — conocimiento o habilidad adquiridos al hacer algo.", indonesian: "Pengalaman — pengetahuan atau keterampilan yang diperoleh dari melakukan sesuatu." },
      example: "Perjalanan itu menjadi pengalaman yang tak terlupakan.",
      exampleTranslation: { korean: "그 여행은 잊을 수 없는 경험이 됐어요.", english: "That trip became an unforgettable experience.", spanish: "Ese viaje se convirtió en una experiencia inolvidable.", indonesian: "Perjalanan itu menjadi pengalaman yang tak terlupakan." }, speechLang: "id-ID" },

    { word: "Berbeda", emoji: "🔄", pronunciation: "ber-BE-da",
      meanings: { korean: "같지 않거나 다른 종류의 것이에요.", english: "Different — not the same; unlike others.", spanish: "Diferente — no igual; a diferencia de los demás.", indonesian: "Berbeda — tidak sama; tidak seperti yang lain." },
      example: "Setiap daerah memiliki budaya yang berbeda.",
      exampleTranslation: { korean: "모든 지역은 서로 다른 문화를 가지고 있어요.", english: "Every region has a different culture.", spanish: "Cada región tiene una cultura diferente.", indonesian: "Setiap daerah memiliki budaya yang berbeda." }, speechLang: "id-ID" },

    { word: "Mungkin", emoji: "🤔", pronunciation: "MOONG-kin",
      meanings: { korean: "확실하지 않지만 가능성이 있는 것을 뜻해요.", english: "Maybe / Possibly — expressing that something could happen.", spanish: "Quizás / Posiblemente — para expresar que algo podría suceder.", indonesian: "Mungkin — menyatakan bahwa sesuatu bisa saja terjadi." },
      example: "Mungkin besok akan turun hujan.",
      exampleTranslation: { korean: "아마 내일 비가 올 거예요.", english: "Maybe it will rain tomorrow.", spanish: "Quizás llueva mañana.", indonesian: "Mungkin besok akan turun hujan." }, speechLang: "id-ID" },

    { word: "Sebenarnya", emoji: "💡", pronunciation: "se-be-NAR-nya",
      meanings: { korean: "사실이나 진실을 강조할 때 쓰는 '사실은'이라는 말이에요.", english: "Actually / In fact — used to emphasize the truth of something.", spanish: "En realidad / De hecho — para enfatizar la verdad de algo.", indonesian: "Sebenarnya — dipakai untuk menegaskan kebenaran sesuatu." },
      example: "Sebenarnya saya tidak tahu jawabannya.",
      exampleTranslation: { korean: "사실 저는 그 답을 몰라요.", english: "Actually, I do not know the answer.", spanish: "En realidad, no sé la respuesta.", indonesian: "Sebenarnya saya tidak tahu jawabannya." }, speechLang: "id-ID" },

    { word: "Bangga", emoji: "🦁", pronunciation: "BANG-ga",
      meanings: { korean: "자신이나 다른 사람의 성취에 깊이 만족하는 감정이에요.", english: "Proud — feeling deep satisfaction from achievements.", spanish: "Orgulloso — sentir satisfacción profunda por los logros.", indonesian: "Bangga — merasakan kepuasan mendalam atas suatu pencapaian." },
      example: "Saya sangat bangga padamu karena tidak pernah menyerah.",
      exampleTranslation: { korean: "절대 포기하지 않는 당신이 정말 자랑스러워요.", english: "I am very proud of you for never giving up.", spanish: "Estoy muy orgulloso de ti por no rendirte nunca.", indonesian: "Saya sangat bangga padamu karena tidak pernah menyerah." }, speechLang: "id-ID" },

    { word: "Khawatir", emoji: "😟", pronunciation: "kha-WA-tir",
      meanings: { korean: "무언가 잘못될까봐 불안하고 걱정하는 감정이에요.", english: "Worried — feeling anxious about something that might go wrong.", spanish: "Preocupado — sentirse ansioso por algo que podría salir mal.", indonesian: "Khawatir — merasa cemas akan sesuatu yang mungkin tidak beres." },
      example: "Ibu khawatir karena anaknya belum pulang.",
      exampleTranslation: { korean: "엄마는 아이가 아직 안 돌아와서 걱정해요.", english: "The mother is worried because her child has not come home.", spanish: "La madre está preocupada porque su hijo no ha vuelto a casa.", indonesian: "Ibu khawatir karena anaknya belum pulang." }, speechLang: "id-ID" },

    { word: "Bingung", emoji: "😕", pronunciation: "BEE-ngoong",
      meanings: { korean: "이해하지 못하거나 어찌할 바를 모르는 혼란스러운 상태예요.", english: "Confused — unable to understand or decide; puzzled.", spanish: "Confundido — incapaz de entender o decidir; desconcertado.", indonesian: "Bingung — tidak mampu memahami atau menentukan; kebingungan." },
      example: "Saya bingung memilih antara dua pilihan ini.",
      exampleTranslation: { korean: "저는 이 두 가지 선택 사이에서 갈팡질팡하고 있어요.", english: "I am confused about choosing between these two options.", spanish: "Estoy confundido al elegir entre estas dos opciones.", indonesian: "Saya bingung memilih antara dua pilihan ini." }, speechLang: "id-ID" },

    { word: "Menarik", emoji: "🔍", pronunciation: "me-NA-rik",
      meanings: { korean: "관심과 호기심을 불러일으키는 것이에요.", english: "Interesting / Attractive — arousing curiosity and attention.", spanish: "Interesante / Atractivo — que despierta curiosidad y atención.", indonesian: "Menarik — membangkitkan rasa ingin tahu dan perhatian." },
      example: "Sejarah Indonesia sangat panjang dan menarik.",
      exampleTranslation: { korean: "인도네시아의 역사는 매우 길고 흥미로워요.", english: "The history of Indonesia is very long and interesting.", spanish: "La historia de Indonesia es muy larga e interesante.", indonesian: "Sejarah Indonesia sangat panjang dan menarik." }, speechLang: "id-ID" },

    { word: "Kebersamaan", emoji: "🤗", pronunciation: "ke-ber-sa-MA-an",
      meanings: { korean: "함께 어울리며 느끼는 따뜻한 유대감이에요 — 인도네시아 문화에서 소중히 여기는 가치예요.", english: "Togetherness — the warm sense of community and unity, deeply valued in Indonesian culture.", spanish: "Unión / Convivencia — el cálido sentido de comunidad, muy valorado en la cultura indonesia.", indonesian: "Kebersamaan — rasa hangat akan persatuan dan kebersatuan yang sangat dihargai dalam budaya Indonesia." },
      example: "Kebersamaan keluarga adalah hal yang paling berharga.",
      exampleTranslation: { korean: "가족과 함께하는 시간은 가장 소중한 것이에요.", english: "Family togetherness is the most precious thing.", spanish: "La unión familiar es lo más valioso.", indonesian: "Kebersamaan keluarga adalah hal yang paling berharga." }, speechLang: "id-ID" },
  ],
  /* ── ENGLISH B1+ Advanced ───────────────────────────────── */
  english: [
    { word: "Serendipity", emoji: "✨", pronunciation: "sair-en-DIP-i-tee",
      meanings: { korean: "우연히 일어난 즐거운 사건; 기분 좋은 놀라움이에요.", english: "The occurrence of happy events by chance; a pleasant surprise.", spanish: "La ocurrencia de eventos felices por casualidad; una grata sorpresa.", indonesian: "Terjadinya peristiwa bahagia secara kebetulan; kejutan yang menyenangkan." },
      example: '"Finding my best friend at that café was pure serendipity."',
      exampleTranslation: { korean: "그 카페에서 가장 친한 친구를 만난 건 순전한 세렌디피티였어요.", english: "Finding my best friend at that café was pure serendipity.", spanish: "Encontrar a mi mejor amigo en ese café fue pura serendipia.", indonesian: "Menemukan sahabat saya di kafe itu adalah keberuntungan yang murni." }, speechLang: "en-US" },

    { word: "Ephemeral", emoji: "🌿", pronunciation: "eh-FEM-er-ul",
      meanings: { korean: "아주 짧은 시간 동안만 지속되는 것; 덧없다는 뜻이에요.", english: "Lasting for a very short time; fleeting and transitory.", spanish: "Que dura muy poco tiempo; pasajero y transitorio.", indonesian: "Berlangsung dalam waktu yang sangat singkat; sekejap dan fana." },
      example: '"Cherry blossoms are ephemeral — they bloom for just two weeks."',
      exampleTranslation: { korean: "벚꽃은 덧없어요 — 단 2주 동안만 피어요.", english: "Cherry blossoms are ephemeral — they bloom for just two weeks.", spanish: "Los cerezos en flor son efímeros — florecen solo dos semanas.", indonesian: "Bunga sakura itu fana — mekar hanya selama dua minggu." }, speechLang: "en-US" },

    { word: "Wanderlust", emoji: "🌍", pronunciation: "WON-der-lust",
      meanings: { korean: "세상을 여행하고 탐험하고 싶은 강한 욕구예요.", english: "A strong desire to travel and explore the world.", spanish: "Un fuerte deseo de viajar y explorar el mundo.", indonesian: "Hasrat kuat untuk bepergian dan menjelajahi dunia." },
      example: '"Her wanderlust led her to visit 40 countries before turning 30."',
      exampleTranslation: { korean: "그녀의 방랑벽 때문에 30세가 되기 전에 40개국을 여행했어요.", english: "Her wanderlust led her to visit 40 countries before turning 30.", spanish: "Su espíritu viajero la llevó a visitar 40 países antes de los 30.", indonesian: "Hasrat menjelajahnya membawanya mengunjungi 40 negara sebelum usia 30." }, speechLang: "en-US" },

    { word: "Melancholy", emoji: "🌧️", pronunciation: "MEL-un-kol-ee",
      meanings: { korean: "이유 없이 깊고 오래 지속되는 슬픔이에요. 종종 달콤쓸쓸한 느낌을 줘요.", english: "A deep, prolonged sadness — often with a bittersweet, reflective quality.", spanish: "Una tristeza profunda y prolongada — a menudo con un matiz agridulce y reflexivo.", indonesian: "Kesedihan yang dalam dan berkepanjangan — sering bernuansa pahit-manis dan reflektif." },
      example: '"A feeling of melancholy settled over him as autumn leaves fell."',
      exampleTranslation: { korean: "가을 낙엽이 지면서 그에게 우수가 찾아왔어요.", english: "A feeling of melancholy settled over him as autumn leaves fell.", spanish: "Una sensación de melancolía se apoderó de él al caer las hojas de otoño.", indonesian: "Perasaan melankolis menyelimutinya saat daun-daun musim gugur berguguran." }, speechLang: "en-US" },

    { word: "Resilience", emoji: "🌱", pronunciation: "reh-ZIL-yens",
      meanings: { korean: "역경에서 빠르게 회복하는 능력이에요.", english: "The ability to recover quickly from difficulties; toughness.", spanish: "La capacidad de recuperarse rápidamente de las dificultades; fortaleza.", indonesian: "Kemampuan untuk pulih dengan cepat dari kesulitan; ketangguhan." },
      example: '"Her resilience after losing her job inspired everyone around her."',
      exampleTranslation: { korean: "직장을 잃은 후 그녀의 회복력은 주변 모든 사람에게 영감을 줬어요.", english: "Her resilience after losing her job inspired everyone around her.", spanish: "Su resiliencia tras perder el trabajo inspiró a todos a su alrededor.", indonesian: "Ketangguhannya setelah kehilangan pekerjaan menginspirasi semua orang di sekitarnya." }, speechLang: "en-US" },

    { word: "Ambiguous", emoji: "🔀", pronunciation: "am-BIG-yoo-us",
      meanings: { korean: "두 가지 이상의 의미로 해석될 수 있어서 불분명한 것이에요.", english: "Open to more than one interpretation; unclear or double-meaning.", spanish: "Abierto a más de una interpretación; poco claro o de doble sentido.", indonesian: "Terbuka pada lebih dari satu tafsiran; tidak jelas atau bermakna ganda." },
      example: '"The ending of the film was deliberately ambiguous and thought-provoking."',
      exampleTranslation: { korean: "영화의 결말은 의도적으로 모호하고 생각할 거리를 남겼어요.", english: "The ending of the film was deliberately ambiguous and thought-provoking.", spanish: "El final de la película era deliberadamente ambiguo e invitaba a la reflexión.", indonesian: "Akhir film itu sengaja dibuat ambigu dan menggugah pikiran." }, speechLang: "en-US" },

    { word: "Sophisticated", emoji: "🎩", pronunciation: "suh-FIS-tih-kay-ted",
      meanings: { korean: "세련되고 복잡한 취향이나 지식을 가진 것이에요.", english: "Having refined taste, knowledge, or worldly experience; elegant.", spanish: "Con gusto refinado, conocimiento o experiencia mundana; elegante.", indonesian: "Memiliki selera, pengetahuan, atau pengalaman dunia yang halus; elegan." },
      example: '"Her sophisticated taste in art made her a respected gallery curator."',
      exampleTranslation: { korean: "예술에 대한 그녀의 세련된 취향이 그녀를 존경받는 갤러리 큐레이터로 만들었어요.", english: "Her sophisticated taste in art made her a respected gallery curator.", spanish: "Su sofisticado gusto por el arte la convirtió en una respetada curadora de galería.", indonesian: "Selera seninya yang canggih menjadikannya kurator galeri yang disegani." }, speechLang: "en-US" },

    { word: "Perseverance", emoji: "🏔️", pronunciation: "pur-suh-VEER-ens",
      meanings: { korean: "어려움에도 불구하고 꾸준히 계속하는 능력이에요.", english: "Continued effort to do something despite difficulties or delay.", spanish: "Esfuerzo continuo para hacer algo a pesar de dificultades o demoras.", indonesian: "Usaha terus-menerus untuk melakukan sesuatu meski ada kesulitan atau penundaan." },
      example: '"His perseverance through years of failure finally led to success."',
      exampleTranslation: { korean: "수년간의 실패를 이겨낸 그의 끈기가 마침내 성공으로 이어졌어요.", english: "His perseverance through years of failure finally led to success.", spanish: "Su perseverancia a través de años de fracasos finalmente lo llevó al éxito.", indonesian: "Kegigihannya melewati bertahun-tahun kegagalan akhirnya membawa kesuksesan." }, speechLang: "en-US" },

    { word: "Eloquent", emoji: "🗣️", pronunciation: "EL-oh-kwent",
      meanings: { korean: "명확하고 설득력 있게 잘 표현하는 능력이에요.", english: "Fluent or persuasive in speaking or writing; well-expressed.", spanish: "Fluido o persuasivo al hablar o escribir; bien expresado.", indonesian: "Fasih atau persuasif dalam berbicara atau menulis; terungkap dengan baik." },
      example: '"Her eloquent speech moved the audience to tears of inspiration."',
      exampleTranslation: { korean: "그녀의 웅변은 청중에게 감동의 눈물을 흘리게 했어요.", english: "Her eloquent speech moved the audience to tears of inspiration.", spanish: "Su elocuente discurso hizo llorar de inspiración al público.", indonesian: "Pidatonya yang fasih menggerakkan penonton hingga meneteskan air mata haru." }, speechLang: "en-US" },

    { word: "Meticulous", emoji: "🔬", pronunciation: "meh-TIK-yoo-lus",
      meanings: { korean: "세부적인 것에 매우 주의를 기울이고 꼼꼼한 것이에요.", english: "Showing great attention to detail; very careful and precise.", spanish: "Que muestra gran atención al detalle; muy cuidadoso y preciso.", indonesian: "Menunjukkan perhatian besar pada detail; sangat teliti dan cermat." },
      example: '"She was meticulous in her research, checking every single fact twice."',
      exampleTranslation: { korean: "그녀는 모든 사실을 두 번씩 확인하면서 연구에 매우 꼼꼼했어요.", english: "She was meticulous in her research, checking every single fact twice.", spanish: "Era meticulosa en su investigación, comprobando cada dato dos veces.", indonesian: "Dia teliti dalam penelitiannya, memeriksa setiap fakta dua kali." }, speechLang: "en-US" },

    { word: "Nostalgic", emoji: "📷", pronunciation: "nos-TAL-jik",
      meanings: { korean: "지나간 행복했던 시절에 대한 그리움과 아쉬움을 느끼는 것이에요.", english: "Feeling sentimental longing for a happy period of the past.", spanish: "Sentir un añoranza sentimental por un período feliz del pasado.", indonesian: "Merasakan kerinduan sentimental akan masa bahagia di masa lalu." },
      example: '"Old photographs always make me feel nostalgic for my childhood."',
      exampleTranslation: { korean: "오래된 사진들은 언제나 어린 시절에 대한 향수를 불러일으켜요.", english: "Old photographs always make me feel nostalgic for my childhood.", spanish: "Las fotografías antiguas siempre me hacen sentir nostalgia de mi infancia.", indonesian: "Foto-foto lama selalu membuat saya nostalgia akan masa kecil saya." }, speechLang: "en-US" },

    { word: "Whimsical", emoji: "🦄", pronunciation: "WIM-zi-kul",
      meanings: { korean: "귀엽고 엉뚱한 상상력이 넘치는 것이에요.", english: "Playfully quaint or fanciful; charmingly odd and imaginative.", spanish: "Juguetona y caprichosamente pintoresco; encantadoramente extravagante.", indonesian: "Unik dan penuh khayalan yang jenaka; menawan dalam keanehannya." },
      example: '"The artist had a whimsical style — her paintings felt like waking dreams."',
      exampleTranslation: { korean: "그 예술가는 기발한 스타일을 가졌어요 — 그녀의 그림들은 꿈 같은 느낌이었어요.", english: "The artist had a whimsical style — her paintings felt like waking dreams.", spanish: "La artista tenía un estilo caprichoso — sus pinturas parecían sueños despiertos.", indonesian: "Seniman itu punya gaya yang nyentrik — lukisannya terasa seperti mimpi yang terjaga." }, speechLang: "en-US" },

    { word: "Tenacious", emoji: "🦅", pronunciation: "teh-NAY-shus",
      meanings: { korean: "목표를 향해 단단히 붙잡고 포기하지 않는 것이에요.", english: "Holding firmly to something; very determined and persistent.", spanish: "Que se aferra firmemente a algo; muy decidido y persistente.", indonesian: "Berpegang teguh pada sesuatu; sangat bertekad dan gigih." },
      example: '"She was tenacious in her pursuit of justice for the community."',
      exampleTranslation: { korean: "그녀는 지역 사회의 정의를 위해 끈질기게 노력했어요.", english: "She was tenacious in her pursuit of justice for the community.", spanish: "Era tenaz en su búsqueda de justicia para la comunidad.", indonesian: "Dia gigih dalam memperjuangkan keadilan bagi komunitasnya." }, speechLang: "en-US" },

    { word: "Benevolent", emoji: "💝", pronunciation: "beh-NEV-oh-lent",
      meanings: { korean: "다른 사람의 행복을 바라며 친절하게 베푸는 성질이에요.", english: "Well-meaning and kindly; generous and kind toward others.", spanish: "Con buenas intenciones y amable; generoso y bondadoso hacia los demás.", indonesian: "Berniat baik dan ramah; murah hati dan baik terhadap sesama." },
      example: '"The benevolent donor funded scholarships for hundreds of students."',
      exampleTranslation: { korean: "자선심 깊은 기부자가 수백 명의 학생들에게 장학금을 지원했어요.", english: "The benevolent donor funded scholarships for hundreds of students.", spanish: "El benevolente donante financió becas para cientos de estudiantes.", indonesian: "Donatur yang dermawan itu mendanai beasiswa bagi ratusan siswa." }, speechLang: "en-US" },

    { word: "Conspicuous", emoji: "👁️", pronunciation: "kun-SPIK-yoo-us",
      meanings: { korean: "눈에 띄게 두드러지거나 쉽게 알아볼 수 있는 것이에요.", english: "Clearly visible; attracting attention by being remarkable or unusual.", spanish: "Claramente visible; que llama la atención por ser notable o inusual.", indonesian: "Jelas terlihat; menarik perhatian karena menonjol atau tidak biasa." },
      example: '"Her red hat made her conspicuous in the crowd of grey suits."',
      exampleTranslation: { korean: "그녀의 빨간 모자가 회색 정장의 군중 속에서 그녀를 눈에 띄게 했어요.", english: "Her red hat made her conspicuous in the crowd of grey suits.", spanish: "Su sombrero rojo la hizo muy conspicua entre la multitud de trajes grises.", indonesian: "Topi merahnya membuatnya mencolok di tengah kerumunan setelan abu-abu." }, speechLang: "en-US" },
  ],

  /* ── SPANISH B1+ Advanced ───────────────────────────────── */
  spanish: [
    { word: "Mariposa", emoji: "🦋", pronunciation: "mah-ree-POH-sah",
      meanings: { korean: "나비 — 우아하고 자유로운 사람을 시적으로 표현할 때도 사용해요.", english: "Butterfly — also used poetically for someone graceful and free-spirited.", spanish: "Mariposa — también se usa poéticamente para alguien grácil y libre.", indonesian: "Kupu-kupu — juga dipakai secara puitis untuk orang yang anggun dan berjiwa bebas." },
      example: '"Eres como una mariposa — siempre libre y llena de color."',
      exampleTranslation: { korean: "당신은 나비 같아요 — 언제나 자유롭고 색깔이 넘쳐요.", english: "You are like a butterfly — always free and full of color.", spanish: "Eres como una mariposa — siempre libre y llena de color.", indonesian: "Kamu seperti kupu-kupu — selalu bebas dan penuh warna." }, speechLang: "es-ES" },

    { word: "Alegría", emoji: "😄", pronunciation: "ah-leh-GREE-ah",
      meanings: { korean: "깊고 생동감 넘치는 기쁨 — 행복을 넘어선 넘치는 활기예요.", english: "A deep, vibrant joy — beyond happiness, an exuberance of spirit.", spanish: "Una alegría profunda y vibrante — más que felicidad, exuberancia.", indonesian: "Sukacita yang dalam dan menggebu — lebih dari kebahagiaan, kelimpahan jiwa." },
      example: '"La alegría de los niños llenó toda la casa de luz."',
      exampleTranslation: { korean: "아이들의 기쁨이 온 집 안을 빛으로 가득 채웠어요.", english: "The children's joy filled the whole house with light.", spanish: "La alegría de los niños llenó toda la casa de luz.", indonesian: "Sukacita anak-anak memenuhi seluruh rumah dengan cahaya." }, speechLang: "es-ES" },

    { word: "Sobremesa", emoji: "☕", pronunciation: "so-breh-MEH-sah",
      meanings: { korean: "식사 후 테이블에서 이야기하며 느긋하게 보내는 시간이에요.", english: "The time spent lingering at the table after a meal, talking and connecting.", spanish: "El tiempo que se pasa en la mesa después de comer, conversando.", indonesian: "Waktu yang dihabiskan berlama-lama di meja setelah makan, mengobrol dan menjalin keakraban." },
      example: '"La sobremesa duró tres horas — nadie quería irse."',
      exampleTranslation: { korean: "식후 담소가 세 시간이나 계속됐어요 — 아무도 자리를 뜨고 싶지 않았어요.", english: "The after-dinner conversation lasted three hours — nobody wanted to leave.", spanish: "La sobremesa duró tres horas — nadie quería irse.", indonesian: "Obrolan seusai makan itu berlangsung tiga jam — tak ada yang mau beranjak." }, speechLang: "es-ES" },

    { word: "Madrugada", emoji: "🌌", pronunciation: "ma-dru-GA-da",
      meanings: { korean: "새벽 — 모두가 잠든 자정과 일출 사이의 고요한 시간이에요.", english: "The small hours — the quiet time between midnight and dawn when the world sleeps.", spanish: "La madrugada — las horas tranquilas entre la medianoche y el amanecer.", indonesian: "Dini hari — waktu sunyi antara tengah malam dan fajar saat dunia terlelap." },
      example: '"Escribió su mejor novela en la madrugada, cuando todo estaba en silencio."',
      exampleTranslation: { korean: "그는 모든 것이 고요한 새벽에 자신의 가장 좋은 소설을 썼어요.", english: "He wrote his best novel in the small hours, when everything was silent.", spanish: "Escribió su mejor novela en la madrugada, cuando todo estaba en silencio.", indonesian: "Dia menulis novel terbaiknya di dini hari, ketika segalanya sunyi." }, speechLang: "es-ES" },

    { word: "Añoranza", emoji: "💭", pronunciation: "a-nyo-RAN-sa",
      meanings: { korean: "멀리 있는 사람, 장소, 또는 과거에 대한 깊은 그리움이에요.", english: "A deep longing for someone, somewhere, or a time gone by.", spanish: "Un profundo deseo de alguien, algún lugar o un tiempo pasado.", indonesian: "Kerinduan mendalam akan seseorang, suatu tempat, atau masa yang telah berlalu." },
      example: '"La añoranza de su país natal le acompañaba cada día en el extranjero."',
      exampleTranslation: { korean: "해외에서 지내는 매일이 고국에 대한 그리움으로 가득했어요.", english: "The longing for her homeland accompanied her every day abroad.", spanish: "La añoranza de su país natal le acompañaba cada día en el extranjero.", indonesian: "Kerinduan akan tanah airnya menemaninya setiap hari di perantauan." }, speechLang: "es-ES" },

    { word: "Duende", emoji: "✨", pronunciation: "DWEN-de",
      meanings: { korean: "예술 — 특히 플라멩코 — 에서 영혼을 흔드는 신비로운 매력이에요.", english: "A mysterious power that a work of art has to deeply move the soul — especially in flamenco.", spanish: "El poder misterioso que tiene una obra de arte para conmover el alma, especialmente en el flamenco.", indonesian: "Daya magis yang dimiliki sebuah karya seni untuk menggetarkan jiwa secara mendalam — khususnya dalam flamenco." },
      example: '"Su baile tenía duende — el público quedó sin palabras."',
      exampleTranslation: { korean: "그녀의 춤에는 두엔데가 있었어요 — 관객들은 말을 잃었어요.", english: "Her dance had duende — the audience was left speechless.", spanish: "Su baile tenía duende — el público quedó sin palabras.", indonesian: "Tariannya memiliki duende — penonton tertegun tanpa kata." }, speechLang: "es-ES" },

    { word: "Querencia", emoji: "🏡", pronunciation: "ke-REN-sya",
      meanings: { korean: "마음이 이끌리는 장소 — 진정한 자신이 될 수 있는 곳이에요.", english: "A place from which one's strength is drawn; a place where you feel truly at home.", spanish: "Un lugar del que se extrae la fortaleza; donde uno se siente verdaderamente en casa.", indonesian: "Tempat yang menjadi sumber kekuatan seseorang; tempat kamu merasa benar-benar di rumah." },
      example: '"Esta pequeña librería se convirtió en mi querencia — mi refugio."',
      exampleTranslation: { korean: "이 작은 서점이 저의 케렌시아 — 저의 안식처가 됐어요.", english: "This small bookshop became my querencia — my refuge.", spanish: "Esta pequeña librería se convirtió en mi querencia — mi refugio.", indonesian: "Toko buku kecil ini menjadi querencia saya — tempat berlindung saya." }, speechLang: "es-ES" },

    { word: "Desvelado", emoji: "🌙", pronunciation: "des-be-LA-do",
      meanings: { korean: "잠을 못 이루고 깨어있는 상태예요 — 생각이나 걱정으로 잠못드는 것이에요.", english: "Unable to sleep — awake in the night, kept up by thoughts or worries.", spanish: "Sin poder dormir — despierto de noche, aguantando pensamientos o preocupaciones.", indonesian: "Tak bisa tidur — terjaga di malam hari, dipaksa terjaga oleh pikiran atau kekhawatiran." },
      example: '"Pasé toda la noche desvelado pensando en esa conversación."',
      exampleTranslation: { korean: "저는 그 대화를 생각하며 밤새 잠 못 이루며 깨어 있었어요.", english: "I spent the whole night sleepless, thinking about that conversation.", spanish: "Pasé toda la noche desvelado pensando en esa conversación.", indonesian: "Saya melewatkan sepanjang malam tanpa tidur, memikirkan percakapan itu." }, speechLang: "es-ES" },

    { word: "Entrañable", emoji: "🤗", pronunciation: "en-tra-NYA-ble",
      meanings: { korean: "가슴 깊이 사랑스럽고 포근한 따뜻한 감정이에요.", english: "Deeply endearing — something that touches the innermost part of your heart.", spanish: "Profundamente entrañable — algo que toca lo más íntimo del corazón.", indonesian: "Sangat memikat hati — sesuatu yang menyentuh relung hati terdalam." },
      example: '"Tiene una sonrisa entrañable que te hace sentir en casa al instante."',
      exampleTranslation: { korean: "그는 곧바로 집에 온 것 같은 느낌을 주는 포근한 미소를 가지고 있어요.", english: "He has an endearing smile that makes you feel at home instantly.", spanish: "Tiene una sonrisa entrañable que te hace sentir en casa al instante.", indonesian: "Dia punya senyum yang memikat yang membuatmu langsung merasa seperti di rumah." }, speechLang: "es-ES" },

    { word: "Impetuoso", emoji: "⚡", pronunciation: "im-pe-TWOH-so",
      meanings: { korean: "충동적이고 격렬하게 행동하는 성격이에요.", english: "Impetuous — acting quickly and forcefully without thinking things through.", spanish: "Que actúa con rapidez e intensidad sin pensar las cosas detenidamente.", indonesian: "Bertindak cepat dan keras tanpa memikirkannya matang-matang." },
      example: '"Su carácter impetuoso le hacía tomar decisiones sin reflexionar."',
      exampleTranslation: { korean: "그의 충동적인 성격 때문에 생각 없이 결정을 내리곤 했어요.", english: "His impetuous nature made him make decisions without reflecting.", spanish: "Su carácter impetuoso le hacía tomar decisiones sin reflexionar.", indonesian: "Sifatnya yang impulsif membuatnya mengambil keputusan tanpa berpikir." }, speechLang: "es-ES" },

    { word: "Efímero", emoji: "🌸", pronunciation: "e-FEE-me-ro",
      meanings: { korean: "매우 짧은 시간 동안만 지속되는 것이에요.", english: "Ephemeral — lasting only for a very short time; fleeting.", spanish: "Que dura solo un tiempo muy breve; pasajero y transitorio.", indonesian: "Fana — berlangsung hanya dalam waktu yang sangat singkat; sekejap." },
      example: '"La belleza de los cerezos en flor es efímera pero inolvidable."',
      exampleTranslation: { korean: "벚꽃의 아름다움은 덧없지만 잊혀지지 않아요.", english: "The beauty of cherry blossoms is ephemeral but unforgettable.", spanish: "La belleza de los cerezos en flor es efímera pero inolvidable.", indonesian: "Keindahan bunga sakura itu fana tetapi tak terlupakan." }, speechLang: "es-ES" },

    { word: "Melancólico", emoji: "🌧️", pronunciation: "me-lan-KO-li-ko",
      meanings: { korean: "달콤쌉쌀한 깊은 슬픔에 젖어있는 상태예요.", english: "Melancholic — in a state of deep, bittersweet sadness and reflection.", spanish: "En un estado de profunda tristeza agridulce y reflexión.", indonesian: "Berada dalam keadaan kesedihan pahit-manis yang dalam dan reflektif." },
      example: '"La lluvia de otoño siempre me pone un poco melancólico."',
      exampleTranslation: { korean: "가을비는 언제나 저를 약간 우울하게 만들어요.", english: "The autumn rain always makes me a little melancholic.", spanish: "La lluvia de otoño siempre me pone un poco melancólico.", indonesian: "Hujan musim gugur selalu membuat saya sedikit melankolis." }, speechLang: "es-ES" },

    { word: "Perspicaz", emoji: "🔍", pronunciation: "pers-pi-KAS",
      meanings: { korean: "예리하게 통찰력 있고 상황을 빠르게 파악하는 것이에요.", english: "Shrewd — having a ready insight into things; sharp and perceptive.", spanish: "Que tiene una visión aguda de las cosas; agudo y perceptivo.", indonesian: "Memiliki wawasan yang tajam akan banyak hal; cerdik dan jeli." },
      example: '"Su análisis perspicaz reveló el verdadero problema de inmediato."',
      exampleTranslation: { korean: "그의 예리한 분석은 즉시 진짜 문제를 드러냈어요.", english: "His shrewd analysis revealed the real problem immediately.", spanish: "Su análisis perspicaz reveló el verdadero problema de inmediato.", indonesian: "Analisisnya yang tajam langsung mengungkap masalah yang sebenarnya." }, speechLang: "es-ES" },
  ],

  /* ── KOREAN B1+ Advanced ────────────────────────────────── */
  korean: [
    { word: "눈치", emoji: "👁", pronunciation: "nun-chi",
      meanings: { korean: "분위기를 읽는 미묘한 기술 — 말하지 않아도 감정과 사회적 신호를 감지해요.", english: "The subtle art of reading a room — sensing unspoken emotions and social cues.", spanish: "El arte sutil de leer el ambiente — percibir emociones y señales sociales.", indonesian: "Seni halus membaca suasana — merasakan emosi dan isyarat sosial yang tak terucap." },
      example: "그는 눈치가 빨라서 아무것도 말하지 않아도 다 알아.",
      exampleTranslation: { korean: "그는 눈치가 빨라서 아무것도 말하지 않아도 다 알아.", english: "He reads the room so well — he knows everything without being told.", spanish: "Él es tan perceptivo que lo entiende todo sin que nadie le diga nada.", indonesian: "Dia sangat peka membaca suasana — dia tahu segalanya tanpa diberi tahu." }, speechLang: "ko-KR" },

    { word: "정", emoji: "❤️", pronunciation: "jeong",
      meanings: { korean: "오랜 시간 함께한 경험을 통해 형성되는 깊은 정서적 유대감이에요.", english: "A deep emotional bond that forms over time through shared experiences.", spanish: "Un vínculo emocional profundo que se forma con el tiempo a través de experiencias.", indonesian: "Ikatan emosional mendalam yang terbentuk seiring waktu melalui pengalaman bersama." },
      example: "오랫동안 함께해서 정이 많이 들었어요.",
      exampleTranslation: { korean: "오랫동안 함께해서 정이 많이 들었어요.", english: "We've been together so long that a deep bond has formed between us.", spanish: "Hemos estado juntos tanto tiempo que se ha formado un vínculo muy profundo.", indonesian: "Kita sudah bersama begitu lama sampai terbentuk ikatan yang dalam di antara kita." }, speechLang: "ko-KR" },

    { word: "한", emoji: "🌑", pronunciation: "han",
      meanings: { korean: "집단적 슬픔, 그리움, 그리고 회복력이 담긴 독특한 한국의 정서예요.", english: "A uniquely Korean feeling of collective sorrow, longing, and resilience.", spanish: "Un sentimiento únicamente coreano de tristeza colectiva, nostalgia y resiliencia.", indonesian: "Perasaan khas Korea berupa kesedihan, kerinduan, dan ketangguhan kolektif." },
      example: "그 노래에는 우리 민족의 한이 담겨 있다.",
      exampleTranslation: { korean: "그 노래에는 우리 민족의 한이 담겨 있다.", english: "That song carries the deep sorrow and longing of our people.", spanish: "Esa canción lleva el profundo dolor y nostalgia de nuestro pueblo.", indonesian: "Lagu itu mengandung kesedihan dan kerinduan mendalam bangsa kita." }, speechLang: "ko-KR" },

    { word: "미련", emoji: "🕊️", pronunciation: "mi-ryeon",
      meanings: { korean: "포기하지 못하고 마음속에 남아있는 아쉬운 감정이에요.", english: "A lingering attachment — the inability to let go of something or someone.", spanish: "Un apego persistente — la incapacidad de soltar algo o a alguien.", indonesian: "Keterikatan yang membekas — ketidakmampuan untuk melepaskan sesuatu atau seseorang." },
      example: "헤어졌지만 아직도 미련이 남아 있어요.",
      exampleTranslation: { korean: "헤어졌지만 아직도 미련이 남아 있어요.", english: "We broke up, but I still have a lingering attachment.", spanish: "Nos separamos, pero todavía tengo un apego persistente.", indonesian: "Kami sudah putus, tetapi saya masih menyimpan keterikatan yang membekas." }, speechLang: "ko-KR" },

    { word: "여운", emoji: "🎵", pronunciation: "yeo-un",
      meanings: { korean: "경험이나 감정이 끝난 후에도 마음속에 남는 잔향이에요.", english: "The lingering afterglow or resonance of an experience or emotion.", spanish: "La resonancia persistente de una experiencia o emoción después de que termina.", indonesian: "Gema atau resonansi yang membekas dari suatu pengalaman atau emosi." },
      example: "영화가 끝났지만 여운이 오래 남았어요.",
      exampleTranslation: { korean: "영화가 끝났지만 여운이 오래 남았어요.", english: "The film ended, but its emotional resonance stayed with me for a long time.", spanish: "La película terminó, pero su resonancia emocional me acompañó mucho tiempo.", indonesian: "Filmnya sudah berakhir, tetapi resonansi emosionalnya membekas lama dalam diri saya." }, speechLang: "ko-KR" },

    { word: "허탈", emoji: "😶", pronunciation: "heo-tal",
      meanings: { korean: "기대가 한순간에 무너졌을 때 느끼는 허무하고 공허한 감정이에요.", english: "A hollow emptiness after expectations suddenly collapse; a deflated feeling.", spanish: "Un vacío hueco después de que las expectativas se derrumban; una sensación deflactada.", indonesian: "Kehampaan yang menganga setelah harapan tiba-tiba runtuh; perasaan kempis." },
      example: "기다리던 소식이 취소됐을 때 너무 허탈했어요.",
      exampleTranslation: { korean: "기다리던 소식이 취소됐을 때 너무 허탈했어요.", english: "When the news I had been waiting for was cancelled, I felt completely deflated.", spanish: "Cuando cancelaron la noticia que esperaba, me sentí completamente vacío.", indonesian: "Ketika kabar yang saya nantikan dibatalkan, saya merasa benar-benar hampa." }, speechLang: "ko-KR" },

    { word: "애틋하다", emoji: "🫀", pronunciation: "ae-teut-ha-da",
      meanings: { korean: "슬프고 안타깝지만 동시에 따뜻한 감정이 교차하는 것이에요.", english: "A feeling that is both tender and tinged with sorrow — bittersweet affection.", spanish: "Un sentimiento que es a la vez tierno y teñido de tristeza — afecto agridulce.", indonesian: "Perasaan yang sekaligus lembut dan bernuansa kesedihan — kasih sayang yang pahit-manis." },
      example: "오래된 사진을 보면 애틋한 감정이 밀려와요.",
      exampleTranslation: { korean: "오래된 사진을 보면 애틋한 감정이 밀려와요.", english: "Looking at old photos, a bittersweet tenderness washes over me.", spanish: "Al ver fotos antiguas, me invade una ternura agridulce.", indonesian: "Saat melihat foto-foto lama, kelembutan yang pahit-manis menyelimuti saya." }, speechLang: "ko-KR" },

    { word: "서글프다", emoji: "🌧️", pronunciation: "seo-geul-peu-da",
      meanings: { korean: "쓸쓸하고 외로우며 슬픈 감정이에요. 한국 특유의 한과 비슷해요.", english: "A sad, lonely, and desolate feeling — related to the Korean concept of han.", spanish: "Una sensación triste, solitaria y desolada — relacionada con el concepto coreano de han.", indonesian: "Perasaan sedih, sepi, dan suram — berkaitan dengan konsep han dalam budaya Korea." },
      example: "빈 거리를 혼자 걷는 게 왠지 서글퍼요.",
      exampleTranslation: { korean: "빈 거리를 혼자 걷는 게 왠지 서글퍼요.", english: "Walking alone on an empty street feels strangely sorrowful.", spanish: "Caminar solo por una calle vacía se siente extrañamente melancólico.", indonesian: "Berjalan sendirian di jalanan kosong terasa anehnya menyayat hati." }, speechLang: "ko-KR" },

    { word: "홀가분하다", emoji: "🎈", pronunciation: "hol-ga-bun-ha-da",
      meanings: { korean: "무거운 짐을 내려놓은 것처럼 가볍고 자유로운 느낌이에요.", english: "Feeling light and free — like a weight has been lifted off your shoulders.", spanish: "Sentirse ligero y libre — como si se hubiera quitado un peso de encima.", indonesian: "Merasa ringan dan bebas — seperti beban telah terangkat dari pundakmu." },
      example: "시험이 끝나고 나니 정말 홀가분해요.",
      exampleTranslation: { korean: "시험이 끝나고 나니 정말 홀가분해요.", english: "Now that the exam is over, I feel so light and free.", spanish: "Ahora que terminó el examen, me siento muy ligero y libre.", indonesian: "Sekarang ujian sudah selesai, saya merasa begitu ringan dan bebas." }, speechLang: "ko-KR" },

    { word: "짠하다", emoji: "💔", pronunciation: "jjan-ha-da",
      meanings: { korean: "불쌍하고 안타까워서 가슴 한쪽이 아린 감정이에요.", english: "A pang of sympathy — feeling a heart-pinching sadness for someone.", spanish: "Un pinchazo de simpatía — sentir una tristeza que aprieta el corazón por alguien.", indonesian: "Sentuhan rasa iba — merasakan kesedihan yang mencubit hati untuk seseorang." },
      example: "혼자 밥 먹는 사람을 보면 왠지 짠해요.",
      exampleTranslation: { korean: "혼자 밥 먹는 사람을 보면 왠지 짠해요.", english: "Seeing someone eat alone gives me a pang of sympathetic sadness.", spanish: "Ver a alguien comer solo me da un pinchazo de tristeza compasiva.", indonesian: "Melihat seseorang makan sendirian membuat saya merasakan iba yang menyayat hati." }, speechLang: "ko-KR" },

    { word: "뭉클하다", emoji: "🥹", pronunciation: "mung-keul-ha-da",
      meanings: { korean: "감동적인 순간에 가슴이 뭉클하게 움직이는 따뜻한 감정이에요.", english: "To be deeply moved — feeling a warm, swelling emotion that brings you to the edge of tears.", spanish: "Estar profundamente conmovido — sentir una emoción cálida y creciente que te lleva al borde de las lágrimas.", indonesian: "Terharu mendalam — merasakan emosi hangat yang membuncah hingga di ambang air mata." },
      example: "졸업식에서 엄마의 얼굴을 보니 뭉클했어요.",
      exampleTranslation: { korean: "졸업식에서 엄마의 얼굴을 보니 뭉클했어요.", english: "Seeing my mother's face at graduation moved me deeply.", spanish: "Ver el rostro de mi madre en la graduación me conmovió profundamente.", indonesian: "Melihat wajah ibu saya saat wisuda membuat saya terharu mendalam." }, speechLang: "ko-KR" },

    { word: "간지럽다", emoji: "🪶", pronunciation: "gan-ji-reop-da",
      meanings: { korean: "피부가 간질간질하거나 부끄러울 때 느끼는 感각이에요.", english: "Ticklish / To feel tickled — also used for an embarrassingly sweet or cringe-worthy feeling.", spanish: "Cosquilloso — también usado para una sensación dulcemente embarazosa.", indonesian: "Geli — juga dipakai untuk perasaan manis yang memalukan atau bikin merinding." },
      example: "그 귀여운 말을 들으니 온몸이 간지럽네요.",
      exampleTranslation: { korean: "그 귀여운 말을 들으니 온몸이 간지럽네요.", english: "Hearing those sweet words makes my whole body feel ticklish with embarrassment.", spanish: "Escuchar esas palabras dulces hace que todo mi cuerpo sienta cosquillas de vergüenza.", indonesian: "Mendengar kata-kata manis itu membuat seluruh tubuh saya geli karena malu." }, speechLang: "ko-KR" },

    { word: "시원섭섭하다", emoji: "😌", pronunciation: "si-won-seop-seop-ha-da",
      meanings: { korean: "후련하면서도 아쉬운 감정이 동시에 드는 복합적인 감정이에요.", english: "The mixed feeling of relief and sadness at the same time — bittersweet release.", spanish: "La mezcla de alivio y tristeza al mismo tiempo — liberación agridulce.", indonesian: "Perasaan campur aduk antara lega dan sedih sekaligus — pelepasan yang pahit-manis." },
      example: "졸업이 시원섭섭해요 — 끝나서 홀가분하면서도 아쉬워요.",
      exampleTranslation: { korean: "졸업이 시원섭섭해요 — 끝나서 홀가분하면서도 아쉬워요.", english: "Graduation feels bittersweet — relieved it's over, but sad to leave.", spanish: "La graduación es agridulce — aliviado de que terminó, pero triste de irse.", indonesian: "Wisuda terasa pahit-manis — lega karena selesai, tetapi sedih untuk berpisah." }, speechLang: "ko-KR" },
  ],
};

let _cardAudio: HTMLAudioElement | null = null;
let _cardNativeSound: Audio.Sound | null = null;

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
      const res = await apiFetchWithAuth(url.toString());
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
      _cardAudio = audio;
      audio.onended = () => { URL.revokeObjectURL(objectUrl); _cardAudio = null; };
      audio.onerror = () => { URL.revokeObjectURL(objectUrl); _cardAudio = null; };
      await audio.play();
    } else {
      // Stop any previous sound
      if (_cardNativeSound) {
        await _cardNativeSound.stopAsync().catch((e) => console.warn('[Cards] stop failed:', e));
        await _cardNativeSound.unloadAsync().catch((e) => console.warn('[Cards] unload failed:', e));
        _cardNativeSound = null;
      }
      // Use Audio.Sound (expo-av) instead of expo-speech so iOS audio session
      // is properly activated in speaker/playback mode after recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      const url = new URL("/api/pronunciation-tts", getApiUrl());
      url.searchParams.set("text", word);
      url.searchParams.set("lang", lang);
      const { sound } = await Audio.Sound.createAsync(
        { uri: url.toString(), headers: await getAuthHeaderRecord() },
        { shouldPlay: true, volume: 1.0 }
      );
      _cardNativeSound = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch((e) => console.warn('[Cards] sound unload failed:', e));
          _cardNativeSound = null;
        }
      });
    }
  } catch (err) {
    console.warn("Card TTS error:", err);
  }
}

const DAILY_GOAL = 10;

function getTodayKey() {
  return `cards_daily_${localDateString()}`;
}

function pickSessionCards(allCards: FlashCard[], count: number, lastSeenWords: string[]): FlashCard[] {
  if (allCards.length === 0) return [];
  const lastSet = new Set(lastSeenWords);
  const recent = allCards.filter((c) => lastSet.has(c.word));
  const fresh = allCards.filter((c) => !lastSet.has(c.word));
  const shuffleRecent = [...recent].sort(() => Math.random() - 0.5);
  const shuffleFresh = [...fresh].sort(() => Math.random() - 0.5);
  return buildAcquisitionSession({
    known: shuffleRecent,
    guessable: shuffleFresh,
    fallback: [...shuffleRecent, ...shuffleFresh],
    count: Math.min(count, allCards.length),
    keyOf: (card) => card.word,
  });
}

const SPOKEN_SINGLE_WORDS = new Set([
  "hello",
  "hi",
  "yes",
  "no",
  "thanks",
  "thank you",
  "sorry",
  "hola",
  "si",
  "sí",
  "gracias",
  "perdon",
  "perdón",
  "안녕하세요",
  "네",
  "아니요",
  "감사합니다",
  "고마워요",
  "죄송합니다",
]);

function cleanCardUtterance(value: string): string {
  return value.trim().replace(/^["']+|["']+$/g, "").replace(/\s+/g, " ");
}

function cardSentenceForSpeaking(card: FlashCard): string | null {
  const utterance = cleanCardUtterance(card.word);
  if (!utterance) return null;
  const normalized = utterance.toLocaleLowerCase();
  const looksLikePhrase = /[\s?!.,]/.test(utterance) || SPOKEN_SINGLE_WORDS.has(normalized);
  if (!looksLikePhrase) return null;
  return utterance;
}

// "srs" deck = today's due cards from the Leitner-5 SRS engine
// (lib/srsManager). Source phrases come from rudy-lesson Day completion,
// writing-practice mistakes, and (after this commit) story-scene puzzle
// solves. Beginner/advanced are the legacy static decks — preserved as a
// fallback so the screen never goes empty when SRS has nothing due.
type DeckType = "srs" | "beginner" | "advanced";

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const { t, nativeLanguage, learningLanguage, awardXp } = useLanguage();
  // F6 fix: home SRS banner passes `deck=srs` to force this screen onto
  // the review deck even on a return visit (where the auto-switch ref has
  // already fired). Read once on mount and apply.
  const { deck: deckParam } = useLocalSearchParams<{ deck?: string }>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const nativeLang = nativeLanguage ?? "english";
  const native = nativeLang as NativeLanguage;
  // SRS flashcard decks (BEGINNER_CARDS_BY_LANG / ADVANCED_CARDS) are not yet
  // authored for Arabic, so coerce an "arabic" target to a native default here.
  const lang: NativeLanguage = toNativeLearning(native, getEffectiveLearningLanguage(native, learningLanguage));

  // Default deck depends on SRS due count: if anything is due, the SRS deck
  // becomes the user's primary entry; otherwise the legacy beginner deck is
  // used so a fresh user (no SRS data yet) still has something to do.
  const [deckType, setDeckType] = useState<DeckType>("beginner");
  const [srsDueCount, setSrsDueCount] = useState(0);
  const [sessionCards, setSessionCards] = useState<FlashCard[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [gotIt, setGotIt] = useState(0);
  const [again, setAgain] = useState(0);
  const [dailyComplete, setDailyComplete] = useState(false);
  const [extraPracticeMode, setExtraPracticeMode] = useState(false);
  const [srsQueueEmpty, setSrsQueueEmpty] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [xpGain, setXpGain] = useState(0);
  const extraPracticeModeRef = useRef(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const allCards = deckType === "beginner" ? BEGINNER_CARDS_BY_LANG[lang] : ADVANCED_CARDS[lang];
  const card = sessionCards[sessionIndex] ?? sessionCards[0];
  const speakPracticeSentence = card ? cardSentenceForSpeaking(card) : null;
  const dailyProgress = Math.min(dailyCount, DAILY_GOAL);
  const progressPct = (dailyProgress / DAILY_GOAL) * 100;

  const loadSession = useCallback(async () => {
    try {
      // SRS due count is read regardless of current deck so the toggle pill
      // ("복습 N") always shows the live number even while the user is in a
      // static deck.
      const dueCount = await getDueCount();
      setSrsDueCount(dueCount);
      setSrsQueueEmpty(false);

      const todayKey = getTodayKey();
      const todayDate = localDateString();
      const [cardPractice, raw, lastSeenRaw] = await Promise.all([
        loadCardPractice(lang),
        AsyncStorage.getItem(todayKey),
        AsyncStorage.getItem("cards_last_seen_words"),
      ]);
      const saved = raw ? JSON.parse(raw) : { count: 0 };
      const profileDay = cardPractice?.daily?.[todayDate];
      const legacyCount = saved.count ?? 0;
      const count: number = Math.max(profileDay?.count ?? 0, legacyCount);
      setDailyCount(count);
      setDailyComplete(!extraPracticeModeRef.current && count >= DAILY_GOAL);

      const legacyLastSeenRaw: string[] = lastSeenRaw ? JSON.parse(lastSeenRaw) : [];
      const validDeckWords = new Set([
        ...BEGINNER_CARDS_BY_LANG[lang].map((c) => c.word),
        ...ADVANCED_CARDS[lang].map((c) => c.word),
      ]);
      const legacyLastSeen = legacyLastSeenRaw.filter((word) => validDeckWords.has(word));
      const lastSeen = cardPractice?.lastSeenWords ?? legacyLastSeen;
      if (!cardPractice && (count > 0 || lastSeen.length > 0)) {
        saveCardPracticeSnapshot(lang, {
          date: todayDate,
          count,
          lastSeenWords: lastSeen,
        }).catch((e: unknown) => console.warn('[Cards] card practice backfill failed:', e));
      } else if (cardPractice) {
        AsyncStorage.multiSet([
          [todayKey, JSON.stringify({ count })],
          ["cards_last_seen_words", JSON.stringify(lastSeen)],
        ]).catch((e: unknown) => console.warn('[Cards] card practice legacy mirror failed:', e));
      }

      let picked: FlashCard[];
      if (deckType === "srs") {
        // SRS mode: hand the live due queue to the existing flashcard UI.
        // Cap at DAILY_GOAL so a huge backlog doesn't overwhelm the user;
        // they'll see the rest tomorrow as their box-1/2 cards keep
        // returning to due.
        const dueSrs = await getDueCards(DAILY_GOAL);
        picked = srsCardsToFlashCards(dueSrs, nativeLang as NativeLanguage, lang) as FlashCard[];
        setSrsQueueEmpty(picked.length === 0);
      } else {
        picked = pickSessionCards(allCards, DAILY_GOAL, lastSeen);
      }
      setSessionCards(picked);
      setSessionIndex(0);
      setIsFlipped(false);
      setGotIt(0);
      setAgain(0);
      flipAnim.setValue(0);
      slideAnim.setValue(0);
    } catch (e) { console.warn('[Cards] session load failed:', e); }
  }, [deckType, lang, nativeLang, allCards]);

  useFocusEffect(useCallback(() => {
    loadSession();
  }, [loadSession]));

  useEffect(() => {
    loadSession();
  }, [deckType, lang]);

  // First-mount: if SRS has cards due, default to the SRS deck. Static decks
  // remain as the fallback for fresh users (no SRS history) and for users
  // who explicitly toggle away.
  const autoSwitchedRef = useRef(false);
  useEffect(() => {
    if (autoSwitchedRef.current) return;
    if (srsDueCount > 0 && deckType === "beginner") {
      autoSwitchedRef.current = true;
      setDeckType("srs");
    }
  }, [srsDueCount, deckType]);

  // F6 fix: respect the `deck` query param on every focus, not just first
  // mount. Coming from the home SRS banner with `?deck=srs` should always
  // land on the review screen — even if the user was last on "초급".
  useFocusEffect(
    useCallback(() => {
      if (deckParam === "srs" || deckParam === "beginner" || deckParam === "advanced") {
        if (deckType !== deckParam) setDeckType(deckParam as DeckType);
      }
      // We deliberately don't depend on deckType here — that would loop.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deckParam])
  );

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const switchDeck = (type: DeckType) => {
    if (type === deckType) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSrsQueueEmpty(false);
    setDeckType(type);
  };

  const resetState = () => {
    extraPracticeModeRef.current = true;
    setExtraPracticeMode(true);
    setSessionIndex(0);
    setIsFlipped(false);
    setGotIt(0);
    setAgain(0);
    setDailyComplete(false);
    setSrsQueueEmpty(false);
    Animated.parallel([
      Animated.timing(flipAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    if (deckType === "srs") {
      setDeckType("beginner");
      return;
    }
    loadSession();
  };

  const handleFlip = () => {
    if (dailyComplete) return;
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

  const handleSpeakPractice = useCallback(async (e: any) => {
    e.stopPropagation?.();
    if (!card) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const sentence = cardSentenceForSpeaking(card);
    if (!sentence) return;
    const meaning = card.meanings[nativeLang as NativeLanguage]
      || card.word;
    void trackLearningEvent("review_sentence_cta_pressed", {
      surface: "cards",
      nativeLanguage: nativeLang,
      targetLanguage: lang,
      deckType,
    });
    let missionId: string | null = null;
    try {
      missionId = await saveSpeakMissionHandoff({
        phrase: sentence,
        meaning,
        speechLang: card.speechLang,
        targetLanguage: lang,
        returnDeck: deckType,
      });
    } catch (err) {
      console.warn("[Cards] speak mission handoff failed:", err);
      Alert.alert(
        nativeLang === "korean" ? "잠시 후 다시 시도해 주세요" : nativeLang === "spanish" ? "Inténtalo de nuevo en un momento" : nativeLang === "indonesian" ? "Coba lagi sebentar lagi" : "Please try again in a moment",
        nativeLang === "korean" ? "말하기 연습을 준비하지 못했어요." : nativeLang === "spanish" ? "No pudimos preparar la práctica oral." : nativeLang === "indonesian" ? "Kami tidak bisa menyiapkan latihan berbicara." : "We could not prepare speaking practice."
      );
      return;
    }
    if (!missionId) return;
    router.push({
      pathname: "/(tabs)/speak",
      params: {
        mission: "review-sentence",
        missionId,
        targetLang: lang,
        returnDeck: deckType,
      },
    } as any);
  }, [card, deckType, lang, nativeLang]);

  // Reentrancy guard — rapid "Got it" double-taps were doubling XP, both
  // promoting the SRS box (combined with the recordReview write-race) and
  // undercounting dailyCount because newCount = dailyCount + 1 captures a
  // stale closure value. Held until the slide-out animation finishes.
  const advancingRef = useRef(false);
  const advanceCard = async (knew: boolean) => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (knew) {
      setGotIt((g) => g + 1);
    } else {
      setAgain((a) => a + 1);
    }

    // SRS mode: route the rating through the Leitner engine so this is the
    // user's actual review. Static-deck modes ignore this — they don't
    // promote/demote anything.
    const isExtraPractice = extraPracticeModeRef.current || extraPracticeMode;
    let srsReviewAccepted = true;
    if (deckType === "srs" && card?.word) {
      try {
        const reviewed = await recordReview(card.word, knew);
        srsReviewAccepted = Boolean(reviewed);
        setSrsDueCount(await getDueCount());
      } catch (e) {
        srsReviewAccepted = false;
        console.warn('[Cards] SRS recordReview failed:', e);
      }
    }

    const currentWords = sessionCards.map((c) => c.word);
    let newCount = dailyCount;
    let countedToday = false;
    if (srsReviewAccepted) {
      try {
        const result = await recordCardPracticeReview(lang, localDateString(), card?.word ?? "", currentWords, deckType);
        newCount = result.day.count;
        countedToday = result.counted;
      } catch (e) {
        newCount = dailyCount + 1;
        countedToday = true;
        console.warn('[Cards] card practice profile save failed:', e);
      }
    }
    if (knew && countedToday && !isExtraPractice && newCount <= DAILY_GOAL) {
      setXpGain(10);
      awardXp(10);
    }
    if (!isExtraPractice) setDailyCount(newCount);
    const todayKey = getTodayKey();
    if (!isExtraPractice) {
      AsyncStorage.setItem(todayKey, JSON.stringify({ count: newCount })).catch((e) => console.warn('[Cards] daily count save failed:', e));
    }

    AsyncStorage.getItem("cards_last_seen_words")
      .then((raw) => {
        const previous: string[] = raw ? JSON.parse(raw) : [];
        const updated = mergeRecentFirst(currentWords, previous, DAILY_GOAL * 6);
        return AsyncStorage.setItem("cards_last_seen_words", JSON.stringify(updated));
      })
      .catch((e) => console.warn('[Cards] last seen save failed:', e));

    Animated.timing(slideAnim, { toValue: knew ? -width : width, duration: 230, useNativeDriver: true }).start(() => {
      slideAnim.setValue(knew ? width : -width);
      flipAnim.setValue(0);
      setIsFlipped(false);
      if (!isExtraPractice && newCount >= DAILY_GOAL) {
        setDailyComplete(true);
        slideAnim.setValue(0);
      } else if (sessionIndex + 1 >= sessionCards.length) {
        // SRS mode: when the live due queue is exhausted, don't silently
        // fall through to static beginner/advanced cards — that would
        // call recordReview() on words not in the SRS store and grant
        // XP for fake reviews. Keep daily progress as-is and show a queue-clear CTA.
        if (deckType === "srs") {
          setSrsQueueEmpty(true);
          setSessionCards([]);
          setSessionIndex(0);
          slideAnim.setValue(0);
        } else {
          const nextPicked = pickSessionCards(allCards, DAILY_GOAL, currentWords);
          setSessionCards(nextPicked);
          setSessionIndex(0);
          slideAnim.setValue(0);
        }
      } else {
        setSessionIndex((i) => i + 1);
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 10 }).start();
      }
      advancingRef.current = false;
    });
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <XPToast amount={xpGain} onDone={() => setXpGain(0)} />

      <View style={styles.header}>
        <Text style={styles.title}>{t("card_deck")}</Text>

        <View style={styles.deckSwitcher}>
          <Pressable
            style={[styles.deckTab, deckType === "srs" && styles.deckTabActive]}
            onPress={() => switchDeck("srs")}
            accessibilityRole="tab"
            accessibilityState={{ selected: deckType === "srs" }}
            accessibilityLabel={
              nativeLang === "korean" ? `복습 ${srsDueCount}` : nativeLang === "spanish" ? `Repaso ${srsDueCount}` : nativeLang === "indonesian" ? `Ulas ${srsDueCount}` : `Review ${srsDueCount}`
            }
          >
            {deckType === "srs" && (
              <LinearGradient colors={[C.gold, C.goldDark]} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
            )}
            <Text style={[styles.deckTabText, deckType === "srs" && styles.deckTabTextActive]}>
              {nativeLang === "korean" ? `복습 ${srsDueCount}` : nativeLang === "spanish" ? `Repaso ${srsDueCount}` : nativeLang === "indonesian" ? `Ulas ${srsDueCount}` : `Review ${srsDueCount}`}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.deckTab, deckType === "beginner" && styles.deckTabActive]}
            onPress={() => switchDeck("beginner")}
            accessibilityRole="tab"
            accessibilityState={{ selected: deckType === "beginner" }}
            accessibilityLabel={
              nativeLang === "korean" ? "초급" : nativeLang === "spanish" ? "Principiante" : nativeLang === "indonesian" ? "Pemula" : "Beginner"
            }
          >
            {deckType === "beginner" && (
              <LinearGradient colors={[C.gold, C.goldDark]} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
            )}
            <Text style={[styles.deckTabText, deckType === "beginner" && styles.deckTabTextActive]}>
              {nativeLang === "korean" ? "초급" : nativeLang === "spanish" ? "Principiante" : nativeLang === "indonesian" ? "Pemula" : "Beginner"}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.deckTab, deckType === "advanced" && styles.deckTabActive]}
            onPress={() => switchDeck("advanced")}
            accessibilityRole="tab"
            accessibilityState={{ selected: deckType === "advanced" }}
            accessibilityLabel={
              nativeLang === "korean" ? "고급" : nativeLang === "spanish" ? "Avanzado" : nativeLang === "indonesian" ? "Lanjutan" : "Advanced"
            }
          >
            {deckType === "advanced" && (
              <LinearGradient colors={[C.gold, C.goldDark]} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
            )}
            <Text style={[styles.deckTabText, deckType === "advanced" && styles.deckTabTextActive]}>
              {nativeLang === "korean" ? "고급" : nativeLang === "spanish" ? "Avanzado" : nativeLang === "indonesian" ? "Lanjutan" : "Advanced"}
            </Text>
          </Pressable>
        </View>

        {!dailyComplete && (
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{dailyProgress} / {DAILY_GOAL}</Text>
          </View>
        )}
      </View>

      {!dailyComplete && sessionCards.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.completedContainer}
          showsVerticalScrollIndicator={false}
        >
          <EmojiText style={styles.completedEmoji}>📭</EmojiText>
          <Text style={styles.completedTitle}>
            {srsQueueEmpty
              ? nativeLang === "korean" ? "오늘 복습 대기열을 비웠어요" : nativeLang === "spanish" ? "Repaso al día" : nativeLang === "indonesian" ? "Antrean ulasan sudah kosong" : "Review queue clear"
              : nativeLang === "korean" ? "복습할 카드가 없어요" : nativeLang === "spanish" ? "Sin tarjetas para revisar" : nativeLang === "indonesian" ? "Tidak ada kartu untuk diulas" : "No cards to review"}
          </Text>
          <Text style={styles.completedSub}>
            {srsQueueEmpty
              ? nativeLang === "korean"
                ? "오늘 예정된 복습 카드는 모두 확인했어요.\n초급 덱에서 계속 연습할 수 있어요."
                : nativeLang === "spanish"
                ? "Ya revisaste todas las tarjetas pendientes.\nPuedes seguir con el mazo principiante."
                : nativeLang === "indonesian"
                ? "Kamu sudah memeriksa semua kartu yang jatuh tempo.\nKamu bisa lanjut berlatih di dek pemula."
                : "You reviewed every due card for now.\nYou can keep practicing in the beginner deck."
              : nativeLang === "korean"
              ? "레슨이나 스토리를 진행하면\n카드가 자동으로 추가됩니다!"
              : nativeLang === "spanish"
              ? "Completa lecciones o historias\npara añadir tarjetas automáticamente!"
              : nativeLang === "indonesian"
              ? "Selesaikan pelajaran atau cerita\nuntuk menambah kartu secara otomatis!"
              : "Complete lessons or stories\nto add cards automatically!"}
          </Text>
          {/* F3 fix (UX agent review): empty SRS state had no CTA, leaving
              the user stuck inside the Cards tab with no obvious next step.
              Two routes — Rudy lesson (where SRS gets seeded) or the static
              beginner deck (so they still get value from this screen). */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
            <Pressable
              style={({ pressed }) => [
                { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, backgroundColor: C.gold },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/rudy-course" as any);
              }}
            >
              <EmojiText style={{ fontFamily: F.label, color: C.bg1, fontSize: 13 }}>
                {nativeLang === "korean" ? "🦊 오늘의 훈련 시작" : nativeLang === "spanish" ? "🦊 Comenzar entrenamiento" : nativeLang === "indonesian" ? "🦊 Mulai latihan" : "🦊 Start training"}
              </EmojiText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: C.gold },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                switchDeck("beginner");
              }}
            >
              <Text style={{ fontFamily: F.label, color: C.gold, fontSize: 13 }}>
                {nativeLang === "korean" ? "초급 덱 →" : nativeLang === "spanish" ? "Mazo principiante →" : nativeLang === "indonesian" ? "Dek pemula →" : "Beginner deck →"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : dailyComplete ? (
        <ScrollView
          contentContainerStyle={styles.completedContainer}
          showsVerticalScrollIndicator={false}
        >
          <EmojiText style={styles.completedEmoji}>🏆</EmojiText>
          <Text style={styles.completedTitle}>
            {nativeLang === "korean" ? "오늘 목표 달성!" : nativeLang === "spanish" ? "¡Meta diaria completada!" : nativeLang === "indonesian" ? "Target Harian Tercapai!" : "Daily Goal Complete!"}
          </Text>
          <Text style={styles.completedSub}>
            {nativeLang === "korean"
              ? `오늘 ${DAILY_GOAL}장의 카드를 복습했어요.\n내일 다시 와서 새 단어를 만나요!`
              : nativeLang === "spanish"
              ? `Repasaste ${DAILY_GOAL} tarjetas hoy.\n¡Vuelve mañana para nuevas palabras!`
              : nativeLang === "indonesian"
              ? `Kamu sudah mengulas ${DAILY_GOAL} kartu hari ini.\nKembali besok untuk kata-kata baru!`
              : `You've reviewed ${DAILY_GOAL} cards today.\nCome back tomorrow for new words!`}
          </Text>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreCard, { backgroundColor: "rgba(90,153,90,0.15)" }]}>
              <EmojiText style={styles.scoreEmoji}>✅</EmojiText>
              <Text style={[styles.scoreNum, { color: "#5a9" }]}>{gotIt}</Text>
              <Text style={styles.scoreLabel}>
                {nativeLang === "korean" ? "알아요!" : nativeLang === "spanish" ? "¡Lo sé!" : nativeLang === "indonesian" ? "Sudah tahu!" : "Got it!"}
              </Text>
            </View>
            <View style={styles.scoreCard}>
              <EmojiText style={styles.scoreEmoji}>😅</EmojiText>
              <Text style={styles.scoreNum}>{again}</Text>
              <Text style={styles.scoreLabel}>
                {nativeLang === "korean" ? "다시" : nativeLang === "spanish" ? "Otra vez" : nativeLang === "indonesian" ? "Lagi" : "Again"}
              </Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
            onPress={resetState}
          >
            <Ionicons name="refresh" size={18} color={C.bg1} />
            <Text style={styles.resetBtnText}>
              {nativeLang === "korean" ? "더 연습하기" : nativeLang === "spanish" ? "Practicar más" : nativeLang === "indonesian" ? "Latihan Lagi" : "Practice More"}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.switchBtn, pressed && { opacity: 0.85 }]}
            onPress={() => switchDeck(deckType === "beginner" ? "advanced" : "beginner")}
          >
            <Text style={styles.switchBtnText}>
              {nativeLang === "korean"
                ? `${deckType === "beginner" ? "고급" : "초급"} 덱 도전 →`
                : nativeLang === "spanish"
                ? `Prueba el mazo ${deckType === "beginner" ? "avanzado" : "principiante"} →`
                : nativeLang === "indonesian"
                ? `Coba dek ${deckType === "beginner" ? "lanjutan" : "pemula"} →`
                : `Try ${deckType === "beginner" ? "Advanced" : "Beginner"} deck →`}
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
              <Pressable
                onPress={handleFlip}
                style={styles.cardPressable}
                accessibilityRole="button"
                accessibilityState={{ expanded: isFlipped }}
                accessibilityLabel={
                  nativeLang === "korean"
                    ? "플래시카드, 탭하여 뒤집기"
                    : nativeLang === "spanish"
                    ? "Tarjeta, toca para girar"
                    : nativeLang === "indonesian"
                    ? "Kartu, ketuk untuk membalik"
                    : "Flashcard, tap to flip"
                }
              >
                <Animated.View
                  style={[
                    styles.card,
                    styles.cardFront,
                    { transform: [{ perspective: 1200 }, { rotateY: frontRotate }], opacity: frontOpacity },
                  ]}
                >
                  <LinearGradient
                    colors={[C.gold, C.goldDark]}
                    style={styles.cardAccentBar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <View style={styles.cardInner}>
                    <EmojiText style={styles.cardEmoji}>{card?.emoji ?? ""}</EmojiText>
                    <BidiTargetText targetLang={card?.speechLang} rtlAlign="center" style={styles.cardWordFront}>{card?.word}</BidiTargetText>
                    {card?.pronunciation && (
                      <Text style={styles.cardPronunciation}>/{card.pronunciation}/</Text>
                    )}
                    <Pressable
                      style={({ pressed }) => [styles.speakerBtn, pressed && { opacity: 0.75 }]}
                      onPress={handleSpeak}
                      hitSlop={12}
                      accessibilityRole="button"
                      accessibilityLabel={
                        nativeLang === "korean"
                          ? "발음 듣기"
                          : nativeLang === "spanish"
                          ? "Escuchar pronunciación"
                          : nativeLang === "indonesian"
                          ? "Dengar pelafalan"
                          : "Hear pronunciation"
                      }
                    >
                      <LinearGradient
                        colors={isSpeaking ? [C.goldDark, C.bg2] : [C.gold, C.goldDark]}
                        style={styles.speakerBtnGradient}
                      >
                        <Ionicons
                          name={isSpeaking ? "volume-high" : "volume-medium"}
                          size={18}
                          color={C.bg1}
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
                    colors={[C.bg2, C.bg1]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={styles.cardInnerBack}>
                    <EmojiText style={styles.cardEmojiBack}>{card?.emoji ?? ""}</EmojiText>
                    <BidiTargetText targetLang={card?.speechLang} rtlAlign="center" style={styles.cardWordBack}>{card?.word}</BidiTargetText>
                    <View style={styles.divider} />
                    <Text style={styles.cardMeaning}>{card?.meanings[nativeLang as NativeLanguage]}</Text>
                    <View style={styles.exampleBox}>
                      <Text style={styles.exampleLabel}>
                        {nativeLang === "korean" ? "예문" : nativeLang === "spanish" ? "Ejemplo" : nativeLang === "indonesian" ? "Contoh" : "Example"}
                      </Text>
                      <BidiTargetText targetLang={card?.speechLang} style={styles.exampleText}>{card?.example}</BidiTargetText>
                      {card?.exampleTranslation[nativeLang as NativeLanguage] &&
                        card.exampleTranslation[nativeLang as NativeLanguage] !== card.example && (
                        <Text style={styles.exampleTranslationText}>
                          {card.exampleTranslation[nativeLang as NativeLanguage]}
                        </Text>
                      )}
                    </View>
                  </View>
                </Animated.View>
              </Pressable>
            </Animated.View>
          </View>

          {isFlipped && (
            <View style={styles.listenActionRow}>
              <Pressable
                style={({ pressed }) => [styles.listenRowBtn, pressed && { opacity: 0.75 }]}
                onPress={handleSpeak}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={
                  nativeLang === "korean"
                    ? "발음 듣기"
                    : nativeLang === "spanish"
                    ? "Escuchar pronunciación"
                    : nativeLang === "indonesian"
                    ? "Dengar pelafalan"
                    : "Hear pronunciation"
                }
              >
                <Ionicons
                  name={isSpeaking ? "volume-high" : "volume-medium"}
                  size={16}
                  color={C.parchment}
                />
                <Text style={styles.speakerBtnBackText}>
                  {nativeLang === "korean" ? "듣기" : nativeLang === "spanish" ? "Escuchar" : nativeLang === "indonesian" ? "Dengarkan" : "Listen"}
                </Text>
              </Pressable>
              {speakPracticeSentence ? (
              <Pressable
                style={({ pressed }) => [styles.speakReviewBtn, pressed && { opacity: 0.82 }]}
                onPress={handleSpeakPractice}
                hitSlop={12}
              >
                <Ionicons name="mic" size={16} color={C.bg1} />
                <Text style={styles.speakReviewBtnText}>
                  {nativeLang === "korean" ? "문장 말하기" : nativeLang === "spanish" ? "Decir frase" : nativeLang === "indonesian" ? "Ucapkan kalimat" : "Say sentence"}
                </Text>
              </Pressable>
              ) : null}
            </View>
          )}

          {isFlipped ? (
            <View style={styles.actionRow}>
              {/* RippleButton doesn't forward a11y props, so the semantic
                  button node lives on a wrapping View. The label spells out
                  the meaning so SR users don't depend on the emoji or the
                  orange/green colour alone. */}
              <View
                accessible
                accessibilityRole="button"
                accessibilityLabel={
                  nativeLang === "korean"
                    ? "다시, 더 연습할게요"
                    : nativeLang === "spanish"
                    ? "Otra vez, necesito más práctica"
                    : nativeLang === "indonesian"
                    ? "Lagi, saya perlu lebih banyak latihan"
                    : "Again, I need more practice"
                }
                style={styles.actionBtnWrap}
              >
                <RippleButton
                  style={[styles.actionBtn, styles.againBtn]}
                  onPress={() => advanceCard(false)}
                  rippleColor="rgba(255,152,0,0.35)"
                >
                  <View style={styles.actionBtnInner}>
                    <EmojiText style={styles.againBtnEmoji}>😅</EmojiText>
                    <Text style={[styles.actionLabel, { color: C.gold }]}>
                      {nativeLang === "korean" ? "다시" : nativeLang === "spanish" ? "Otra vez" : nativeLang === "indonesian" ? "Lagi" : "Again"}
                    </Text>
                  </View>
                </RippleButton>
              </View>
              <View
                accessible
                accessibilityRole="button"
                accessibilityLabel={
                  nativeLang === "korean"
                    ? "알아요, 이 단어를 알고 있어요"
                    : nativeLang === "spanish"
                    ? "Lo sé, conozco esta palabra"
                    : nativeLang === "indonesian"
                    ? "Sudah tahu, saya tahu kata ini"
                    : "Got it, I know this word"
                }
                style={styles.actionBtnWrap}
              >
                <RippleButton
                  style={[styles.actionBtn, styles.gotItBtn]}
                  onPress={() => advanceCard(true)}
                  rippleColor="rgba(76,175,80,0.35)"
                >
                  <View style={styles.actionBtnInner}>
                    <EmojiText style={styles.gotItBtnEmoji}>✅</EmojiText>
                    <Text style={[styles.actionLabel, { color: "#5a9" }]}>
                      {nativeLang === "korean" ? "알아요!" : nativeLang === "spanish" ? "¡Lo sé!" : nativeLang === "indonesian" ? "Sudah tahu!" : "Got it!"}
                    </Text>
                  </View>
                </RippleButton>
              </View>
            </View>
          ) : (
            <View style={styles.flipPromptRow}>
              <Pressable
                style={({ pressed }) => [styles.flipPromptBtn, pressed && { opacity: 0.8 }]}
                onPress={handleFlip}
              >
                <LinearGradient colors={[C.gold, C.goldDark]} style={styles.flipPromptGradient}>
                  <Ionicons name="sync" size={18} color={C.bg1} />
                  <Text style={styles.flipPromptText}>
                    {nativeLang === "korean" ? "탭해서 뜻 보기" : nativeLang === "spanish" ? "Toca para ver el significado" : nativeLang === "indonesian" ? "Ketuk untuk lihat arti" : "Tap to reveal meaning"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          <View style={[styles.miniStats, { paddingBottom: Platform.OS === "web" ? 100 : Math.max(insets.bottom + 16, 34) }]}>
            <View style={styles.miniStat}>
              <EmojiText style={styles.miniStatEmoji}>✅</EmojiText>
              <Text style={[styles.miniStatText, { color: "#5a9" }]}>{gotIt}</Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <EmojiText style={styles.miniStatEmoji}>😅</EmojiText>
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
    backgroundColor: C.bg1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontFamily: F.header,
    color: C.gold,
    letterSpacing: 1.5,
  },
  deckSwitcher: {
    flexDirection: "row",
    backgroundColor: C.bg2,
    borderRadius: 16,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: C.border,
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
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.goldDark,
  },
  deckTabTextActive: {
    color: C.bg1,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(201,162,39,0.15)",
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: C.border,
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.gold,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
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
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 10,
    backfaceVisibility: "hidden",
  },
  cardFront: {
    backgroundColor: C.parchment,
    overflow: "hidden",
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 8,
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
    fontFamily: F.title,
    color: C.textParchment,
    textAlign: "center",
    letterSpacing: 1,
  },
  cardWordBack: {
    fontSize: 24,
    fontFamily: F.header,
    color: C.parchment,
    textAlign: "center",
  },
  cardPronunciation: {
    fontSize: 15,
    fontFamily: F.body,
    color: C.goldDark,
    textAlign: "center",
    fontStyle: "italic",
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
    backgroundColor: "rgba(201,162,39,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.4)",
    marginTop: 4,
  },
  speakerBtnBackText: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.parchment,
  },
  listenRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(201,162,39,0.15)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.35)",
  },
  listenActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  speakReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.gold,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  speakReviewBtnText: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.bg1,
  },
  flipHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  flipHintText: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDark,
    fontStyle: "italic",
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: "rgba(201,162,39,0.35)",
    borderRadius: 1,
    marginVertical: 2,
  },
  cardMeaning: {
    fontSize: 16,
    fontFamily: F.bodySemi,
    color: C.parchment,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 4,
  },
  exampleBox: {
    backgroundColor: "rgba(201,162,39,0.12)",
    borderRadius: 14,
    padding: 14,
    gap: 4,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.25)",
  },
  exampleLabel: {
    fontSize: 10,
    fontFamily: F.label,
    color: "rgba(201,162,39,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: F.body,
    color: C.parchment,
    lineHeight: 20,
    fontStyle: "italic",
  },
  exampleTranslationText: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    lineHeight: 17,
    marginTop: 6,
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
    fontSize: 15,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionBtnWrap: {
    flex: 1,
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
    backgroundColor: C.bg2,
    borderWidth: 2,
    borderColor: "rgba(201,162,39,0.3)",
  },
  gotItBtn: {
    backgroundColor: "rgba(90,153,90,0.15)",
    borderWidth: 2,
    borderColor: "rgba(90,153,90,0.35)",
  },
  againBtnEmoji: {
    fontSize: 22,
  },
  gotItBtnEmoji: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 15,
    fontFamily: F.header,
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
    fontFamily: F.bodyBold,
    color: C.gold,
  },
  miniDivider: {
    width: 1,
    height: 20,
    backgroundColor: C.border,
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 20,
    paddingVertical: 40,
    backgroundColor: C.bg1,
  },
  completedEmoji: {
    fontSize: 72,
  },
  completedTitle: {
    fontSize: 26,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 2,
  },
  completedSub: {
    fontSize: 16,
    fontFamily: F.body,
    color: C.parchmentDark,
    fontStyle: "italic",
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
    backgroundColor: C.bg2,
    borderWidth: 1,
    borderColor: C.border,
  },
  scoreEmoji: {
    fontSize: 32,
  },
  scoreNum: {
    fontSize: 32,
    fontFamily: F.title,
    color: C.gold,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: F.label,
    color: C.goldDark,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.gold,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  resetBtnText: {
    fontSize: 15,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 0.5,
  },
  switchBtn: {
    paddingVertical: 12,
  },
  switchBtnText: {
    fontSize: 14,
    fontFamily: F.bodySemi,
    color: C.gold,
    textDecorationLine: "underline",
  },
});
