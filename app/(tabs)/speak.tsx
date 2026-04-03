import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import { useLanguage, getDefaultLearning, NativeLanguage } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { XPToast } from "@/components/XPToast";
import { C, F } from "@/constants/theme";
import { PhonemeCoaching } from "@/components/rudy/PhonemeCoaching";

const TAB_BAR_HEIGHT = 49;
const SESSION_SIZE = 8;
const WEAK_THRESHOLD = 75;

type LangTab = "korean" | "english" | "spanish";

interface Phrase {
  word: string;
  ipa: string;
  meaning: string;
  meaningEs?: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  speechLang: string;
  tip: string;
}

const PHRASE_SETS: Record<LangTab, Phrase[]> = {
  english: [
    // ── A1 Beginner ──────────────────────────────────────────────────────────
    { word: "Apple", ipa: "/ˈæp.əl/", meaning: "사과", level: "A1", speechLang: "en-US", tip: "Two syllables: AE-pul. The 'æ' vowel is open and short." },
    { word: "Water", ipa: "/ˈwɔː.tər/", meaning: "물", level: "A1", speechLang: "en-US", tip: "In American English: WAW-ter with a flapped 't'." },
    { word: "Hello", ipa: "/həˈloʊ/", meaning: "안녕하세요", level: "A1", speechLang: "en-US", tip: "Stress the second syllable: heh-LO." },
    { word: "House", ipa: "/haʊs/", meaning: "집", level: "A1", speechLang: "en-US", tip: "The vowel slides from 'ah' to 'oo': HOWSS." },
    { word: "Dog", ipa: "/dɒɡ/", meaning: "개", level: "A1", speechLang: "en-US", tip: "Short, crisp vowel. One syllable: DAWG." },
    { word: "Cat", ipa: "/kæt/", meaning: "고양이", level: "A1", speechLang: "en-US", tip: "The 'a' is an open front vowel, like in 'bat'." },
    { word: "Food", ipa: "/fuːd/", meaning: "음식", level: "A1", speechLang: "en-US", tip: "Long 'oo' sound — rhymes with 'mood'." },
    { word: "Book", ipa: "/bʊk/", meaning: "책", level: "A1", speechLang: "en-US", tip: "Short 'oo' like 'foot', not the long 'oo' of 'boot'." },
    { word: "Family", ipa: "/ˈfæm.ɪ.li/", meaning: "가족", level: "A1", speechLang: "en-US", tip: "Three syllables: FAM-ih-lee. Open 'a' like 'cat'." },
    { word: "Friend", ipa: "/frɛnd/", meaning: "친구", level: "A1", speechLang: "en-US", tip: "The 'd' at the end can be soft or silent." },
    { word: "Happy", ipa: "/ˈhæp.i/", meaning: "행복한", level: "A1", speechLang: "en-US", tip: "Stress on first syllable: HAP-ee." },
    { word: "Sad", ipa: "/sæd/", meaning: "슬픈", level: "A1", speechLang: "en-US", tip: "Short, open vowel. Rhymes with 'bad'." },
    { word: "Big", ipa: "/bɪɡ/", meaning: "큰", level: "A1", speechLang: "en-US", tip: "Short 'i' sound. Don't stretch it." },
    { word: "Small", ipa: "/smɔːl/", meaning: "작은", level: "A1", speechLang: "en-US", tip: "The 'a' is rounded: SMAWL. Don't drop the 'l'." },
    { word: "Morning", ipa: "/ˈmɔːr.nɪŋ/", meaning: "아침", level: "A1", speechLang: "en-US", tip: "Two syllables: MOR-ning. Don't drop the final 'g'." },
    { word: "Night", ipa: "/naɪt/", meaning: "밤", level: "A1", speechLang: "en-US", tip: "The 'igh' is a diphthong: slides from 'ah' to 'ee'." },
    { word: "Eat", ipa: "/iːt/", meaning: "먹다", level: "A1", speechLang: "en-US", tip: "Long 'ee' sound. Clear 't' at the end." },
    { word: "Drink", ipa: "/drɪŋk/", meaning: "마시다", level: "A1", speechLang: "en-US", tip: "The 'dr' blend: push your lips forward slightly." },
    { word: "Walk", ipa: "/wɔːk/", meaning: "걷다", level: "A1", speechLang: "en-US", tip: "The 'l' is silent! Rhymes with 'talk'." },
    { word: "Run", ipa: "/rʌn/", meaning: "달리다", level: "A1", speechLang: "en-US", tip: "Short 'uh' vowel — like 'fun' or 'sun'." },
    { word: "Sun", ipa: "/sʌn/", meaning: "태양", level: "A1", speechLang: "en-US", tip: "Short 'uh' vowel. Rhymes with 'run'." },
    { word: "Moon", ipa: "/muːn/", meaning: "달", level: "A1", speechLang: "en-US", tip: "Long 'oo' sound — rhymes with 'soon'." },
    { word: "Rain", ipa: "/reɪn/", meaning: "비", level: "A1", speechLang: "en-US", tip: "The 'ai' is a diphthong: slides from 'eh' to 'ee'." },
    { word: "Flower", ipa: "/ˈflaʊ.ər/", meaning: "꽃", level: "A1", speechLang: "en-US", tip: "Two syllables: FLAW-er. The 'ow' slides from 'ah' to 'oo'." },
    { word: "Chair", ipa: "/tʃɛər/", meaning: "의자", level: "A1", speechLang: "en-US", tip: "One syllable: CHAIR. The 'ch' is like in 'church'." },
    { word: "Door", ipa: "/dɔːr/", meaning: "문", level: "A1", speechLang: "en-US", tip: "One long syllable: DAWR. Round your lips." },
    { word: "Phone", ipa: "/foʊn/", meaning: "전화기", level: "A1", speechLang: "en-US", tip: "The 'ph' sounds like 'f'. Rhymes with 'tone'." },
    { word: "Car", ipa: "/kɑːr/", meaning: "자동차", level: "A1", speechLang: "en-US", tip: "Open 'ah' vowel. Hold the 'r' at the end." },
    { word: "Shirt", ipa: "/ʃɜːrt/", meaning: "셔츠", level: "A1", speechLang: "en-US", tip: "The 'sh' is like in 'show'. Rhymes with 'dirt'." },
    { word: "Money", ipa: "/ˈmʌn.i/", meaning: "돈", level: "A1", speechLang: "en-US", tip: "Two syllables: MUH-nee. Short 'u' vowel." },

    { word: "Table", ipa: "/ˈteɪ.bəl/", meaning: "탁자", meaningEs: "mesa", level: "A1", speechLang: "en-US", tip: "Two syllables: TAY-bul. Long 'ay' diphthong on first." },
    { word: "Mother", ipa: "/ˈmʌð.ər/", meaning: "어머니", meaningEs: "madre", level: "A1", speechLang: "en-US", tip: "Two syllables: MUH-ther. The 'th' is voiced like in 'the'." },
    { word: "Father", ipa: "/ˈfɑː.ðər/", meaning: "아버지", meaningEs: "padre", level: "A1", speechLang: "en-US", tip: "Two syllables: FAH-ther. Open 'ah' vowel, voiced 'th'." },
    { word: "Brother", ipa: "/ˈbrʌð.ər/", meaning: "형제", meaningEs: "hermano", level: "A1", speechLang: "en-US", tip: "Two syllables: BRU-ther. Short 'uh' vowel." },
    { word: "Sister", ipa: "/ˈsɪs.tər/", meaning: "자매", meaningEs: "hermana", level: "A1", speechLang: "en-US", tip: "Two syllables: SIS-ter. Short 'i' sound." },
    { word: "Fish", ipa: "/fɪʃ/", meaning: "물고기", meaningEs: "pez", level: "A1", speechLang: "en-US", tip: "One syllable. Short 'i'. The 'sh' is like in 'show'." },
    { word: "Bird", ipa: "/bɜːrd/", meaning: "새", meaningEs: "pájaro", level: "A1", speechLang: "en-US", tip: "One syllable. The 'ir' is an R-colored vowel: BURD." },
    { word: "Milk", ipa: "/mɪlk/", meaning: "우유", meaningEs: "leche", level: "A1", speechLang: "en-US", tip: "One syllable: MILK. Don't drop the final 'k'." },
    { word: "Bread", ipa: "/brɛd/", meaning: "빵", meaningEs: "pan", level: "A1", speechLang: "en-US", tip: "One syllable. 'ea' here is short 'e', not long 'ee'." },
    { word: "Rice", ipa: "/raɪs/", meaning: "쌀", meaningEs: "arroz", level: "A1", speechLang: "en-US", tip: "One syllable. The 'ice' diphthong slides from 'ah' to 'ee'." },
    { word: "Hand", ipa: "/hænd/", meaning: "손", meaningEs: "mano", level: "A1", speechLang: "en-US", tip: "One syllable. Open 'æ' vowel — like in 'cat'." },
    { word: "Head", ipa: "/hɛd/", meaning: "머리", meaningEs: "cabeza", level: "A1", speechLang: "en-US", tip: "One syllable. Short 'e' — rhymes with 'red'." },
    { word: "Eye", ipa: "/aɪ/", meaning: "눈", meaningEs: "ojo", level: "A1", speechLang: "en-US", tip: "One syllable diphthong: slides from 'ah' to 'ee'." },
    { word: "Mouth", ipa: "/maʊθ/", meaning: "입", meaningEs: "boca", level: "A1", speechLang: "en-US", tip: "One syllable. 'outh' diphthong: 'ah' to 'oo', then unvoiced 'th'." },
    { word: "Window", ipa: "/ˈwɪn.doʊ/", meaning: "창문", meaningEs: "ventana", level: "A1", speechLang: "en-US", tip: "Two syllables: WIN-doh. Final 'ow' glides from 'oh' to 'oo'." },
    { word: "Star", ipa: "/stɑːr/", meaning: "별", meaningEs: "estrella", level: "A1", speechLang: "en-US", tip: "One syllable. Open 'ah' vowel. Hold the 'r' at the end." },
    { word: "Tree", ipa: "/triː/", meaning: "나무", meaningEs: "árbol", level: "A1", speechLang: "en-US", tip: "One syllable. Long 'ee'. The 'tr' blend is one crisp sound." },
    { word: "Red", ipa: "/rɛd/", meaning: "빨간", meaningEs: "rojo", level: "A1", speechLang: "en-US", tip: "One syllable. Short 'e' — rhymes with 'bed'." },
    { word: "Blue", ipa: "/bluː/", meaning: "파란", meaningEs: "azul", level: "A1", speechLang: "en-US", tip: "One syllable. Long 'oo' — rhymes with 'glue'." },
    { word: "Green", ipa: "/ɡriːn/", meaning: "초록", meaningEs: "verde", level: "A1", speechLang: "en-US", tip: "One syllable. Long 'ee'. Clear 'n' at the end." },
    { word: "School", ipa: "/skuːl/", meaning: "학교", meaningEs: "escuela", level: "A1", speechLang: "en-US", tip: "One syllable. Long 'oo'. 'Sch' sounds like 'sk'." },
    // ── A2 Elementary ────────────────────────────────────────────────────────
    { word: "Beautiful", ipa: "/ˈbjuː.tɪ.fəl/", meaning: "아름다운", level: "A2", speechLang: "en-US", tip: "Three syllables: BYOO-tih-ful." },
    { word: "Important", ipa: "/ɪmˈpɔːr.tənt/", meaning: "중요한", level: "A2", speechLang: "en-US", tip: "Stress on second syllable: im-POR-tant." },
    { word: "Different", ipa: "/ˈdɪf.ər.ənt/", meaning: "다른", level: "A2", speechLang: "en-US", tip: "Often 2 syllables in fast speech: DIF-rent." },
    { word: "Comfortable", ipa: "/ˈkʌm.fər.tə.bəl/", meaning: "편안한", level: "A2", speechLang: "en-US", tip: "Often said as 3 syllables: KUMF-ter-bul." },
    { word: "Interesting", ipa: "/ˈɪn.trɪ.stɪŋ/", meaning: "흥미로운", level: "A2", speechLang: "en-US", tip: "3 syllables in natural speech: IN-tre-sting." },
    { word: "Popular", ipa: "/ˈpɒp.jʊ.lər/", meaning: "인기 있는", level: "A2", speechLang: "en-US", tip: "Three syllables: POP-yoo-ler." },
    { word: "Surprised", ipa: "/sərˈpraɪzd/", meaning: "놀란", level: "A2", speechLang: "en-US", tip: "Two syllables: ser-PRYZD. Stress on second." },
    { word: "Excited", ipa: "/ɪkˈsaɪ.tɪd/", meaning: "흥분한", level: "A2", speechLang: "en-US", tip: "Three syllables: ek-SY-tid. Stress on second." },
    { word: "Worried", ipa: "/ˈwʌr.id/", meaning: "걱정하는", level: "A2", speechLang: "en-US", tip: "Two syllables: WUR-eed. Lips round on the 'w'." },
    { word: "Confused", ipa: "/kənˈfjuːzd/", meaning: "혼란스러운", level: "A2", speechLang: "en-US", tip: "Two syllables: kun-FYOOZD. Stress on second." },
    { word: "Grateful", ipa: "/ˈɡreɪt.fəl/", meaning: "감사하는", level: "A2", speechLang: "en-US", tip: "Two syllables: GRAYT-ful. The 'a' glides upward." },
    { word: "Patient", ipa: "/ˈpeɪ.ʃənt/", meaning: "인내심 있는", level: "A2", speechLang: "en-US", tip: "Two syllables: PAY-shent. The 'ti' sounds like 'sh'." },
    { word: "Creative", ipa: "/kriˈeɪ.tɪv/", meaning: "창의적인", level: "A2", speechLang: "en-US", tip: "Three syllables: kree-AY-tiv. Stress on second." },
    { word: "Dangerous", ipa: "/ˈdeɪn.dʒər.əs/", meaning: "위험한", level: "A2", speechLang: "en-US", tip: "Three syllables: DAYN-jer-us." },
    { word: "Expensive", ipa: "/ɪkˈspɛn.sɪv/", meaning: "비싼", level: "A2", speechLang: "en-US", tip: "Three syllables: ek-SPEN-siv. Stress on second." },
    { word: "Necessary", ipa: "/ˈnɛs.ə.sɛr.i/", meaning: "필요한", level: "A2", speechLang: "en-US", tip: "Four syllables: NES-eh-sair-ee." },
    { word: "Possible", ipa: "/ˈpɒs.ɪ.bəl/", meaning: "가능한", level: "A2", speechLang: "en-US", tip: "Three syllables: POS-ih-bul. Schwa on final syllable." },
    { word: "Wonderful", ipa: "/ˈwʌn.dər.fəl/", meaning: "훌륭한", level: "A2", speechLang: "en-US", tip: "Three syllables: WUN-der-ful." },
    { word: "Familiar", ipa: "/fəˈmɪl.i.ər/", meaning: "친숙한", level: "A2", speechLang: "en-US", tip: "Four syllables: fuh-MIL-ee-er. Stress on second." },

    { word: "Kitchen", ipa: "/ˈkɪtʃ.ən/", meaning: "부엌", meaningEs: "cocina", level: "A2", speechLang: "en-US", tip: "Two syllables: KIT-chen. The 'tch' sounds like 'ch' in 'church'." },
    { word: "Bathroom", ipa: "/ˈbæθ.ruːm/", meaning: "화장실", meaningEs: "baño", level: "A2", speechLang: "en-US", tip: "Two syllables: BATH-room. Unvoiced 'th' like in 'thin'." },
    { word: "Restaurant", ipa: "/ˈrɛs.tər.ɑːnt/", meaning: "식당", meaningEs: "restaurante", level: "A2", speechLang: "en-US", tip: "Three syllables: RES-ter-ahnt. Often reduced to two in speech." },
    { word: "Hospital", ipa: "/ˈhɒs.pɪ.təl/", meaning: "병원", meaningEs: "hospital", level: "A2", speechLang: "en-US", tip: "Three syllables: HOS-pi-tul. Stress on first syllable." },
    { word: "Airport", ipa: "/ˈɛər.pɔːrt/", meaning: "공항", meaningEs: "aeropuerto", level: "A2", speechLang: "en-US", tip: "Two syllables: AIR-port. Diphthong 'air' starts like 'eh'." },
    { word: "Weather", ipa: "/ˈwɛð.ər/", meaning: "날씨", meaningEs: "clima", level: "A2", speechLang: "en-US", tip: "Two syllables: WEH-ther. Voiced 'th' like in 'the'." },
    { word: "Yesterday", ipa: "/ˈjɛs.tər.deɪ/", meaning: "어제", meaningEs: "ayer", level: "A2", speechLang: "en-US", tip: "Three syllables: YES-ter-day. Stress on first." },
    { word: "Tomorrow", ipa: "/təˈmɒr.oʊ/", meaning: "내일", meaningEs: "mañana", level: "A2", speechLang: "en-US", tip: "Three syllables: tuh-MOR-oh. Stress on second." },
    { word: "Favorite", ipa: "/ˈfeɪ.vər.ɪt/", meaning: "가장 좋아하는", meaningEs: "favorito", level: "A2", speechLang: "en-US", tip: "Three syllables: FAY-ver-it. Often reduced to FAY-vrit." },
    { word: "Together", ipa: "/təˈɡɛð.ər/", meaning: "함께", meaningEs: "juntos", level: "A2", speechLang: "en-US", tip: "Three syllables: tuh-GEH-ther. Voiced 'th'. Stress on second." },
    { word: "Language", ipa: "/ˈlæŋ.ɡwɪdʒ/", meaning: "언어", meaningEs: "idioma", level: "A2", speechLang: "en-US", tip: "Two syllables: LANG-gwij. The 'ng' glides into 'gw'." },
    { word: "Mystery", ipa: "/ˈmɪs.tər.i/", meaning: "미스터리", meaningEs: "misterio", level: "A2", speechLang: "en-US", tip: "Three syllables: MIS-ter-ee. Stress on first." },
    { word: "Adventure", ipa: "/ədˈvɛn.tʃər/", meaning: "모험", meaningEs: "aventura", level: "A2", speechLang: "en-US", tip: "Three syllables: ad-VEN-cher. Stress on second." },
    { word: "Treasure", ipa: "/ˈtrɛʒ.ər/", meaning: "보물", meaningEs: "tesoro", level: "A2", speechLang: "en-US", tip: "Two syllables: TREZH-er. The 'sure' sounds like 'zher'." },
    { word: "Journey", ipa: "/ˈdʒɜːr.ni/", meaning: "여행", meaningEs: "viaje", level: "A2", speechLang: "en-US", tip: "Two syllables: JUR-nee. R-colored vowel in first syllable." },
    { word: "Discover", ipa: "/dɪˈskʌv.ər/", meaning: "발견하다", meaningEs: "descubrir", level: "A2", speechLang: "en-US", tip: "Three syllables: dis-KUV-er. Stress on second." },
    { word: "Remember", ipa: "/rɪˈmɛm.bər/", meaning: "기억하다", meaningEs: "recordar", level: "A2", speechLang: "en-US", tip: "Three syllables: ri-MEM-ber. Stress on second." },
    { word: "Understand", ipa: "/ˌʌn.dərˈstænd/", meaning: "이해하다", meaningEs: "entender", level: "A2", speechLang: "en-US", tip: "Three syllables: un-der-STAND. Stress on third." },
    { word: "Practice", ipa: "/ˈpræk.tɪs/", meaning: "연습", meaningEs: "práctica", level: "A2", speechLang: "en-US", tip: "Two syllables: PRAK-tis. Short 'a' like in 'cat'." },
    { word: "Trouble", ipa: "/ˈtrʌb.əl/", meaning: "문제", meaningEs: "problema", level: "A2", speechLang: "en-US", tip: "Two syllables: TRUB-ul. Short 'uh' vowel." },
    { word: "Between", ipa: "/bɪˈtwiːn/", meaning: "사이에", meaningEs: "entre", level: "A2", speechLang: "en-US", tip: "Two syllables: bi-TWEEN. Stress on second. Long 'ee'." },
    { word: "Already", ipa: "/ɔːlˈrɛd.i/", meaning: "이미", meaningEs: "ya", level: "A2", speechLang: "en-US", tip: "Three syllables: awl-RED-ee. Stress on second." },
    { word: "Enough", ipa: "/ɪˈnʌf/", meaning: "충분한", meaningEs: "suficiente", level: "A2", speechLang: "en-US", tip: "Two syllables: ih-NUF. The 'ough' sounds like 'uf'." },
    { word: "Foreign", ipa: "/ˈfɒr.ən/", meaning: "외국의", meaningEs: "extranjero", level: "A2", speechLang: "en-US", tip: "Two syllables: FOR-en. The 'eign' is completely silent." },
    { word: "Surprise", ipa: "/sərˈpraɪz/", meaning: "놀라움", meaningEs: "sorpresa", level: "A2", speechLang: "en-US", tip: "Two syllables: ser-PRIZE. Stress on second." },
    { word: "Imagine", ipa: "/ɪˈmædʒ.ɪn/", meaning: "상상하다", meaningEs: "imaginar", level: "A2", speechLang: "en-US", tip: "Three syllables: ih-MAJ-in. Stress on second." },
    { word: "Library", ipa: "/ˈlaɪ.brər.i/", meaning: "도서관", meaningEs: "biblioteca", level: "A2", speechLang: "en-US", tip: "Three syllables: LY-brer-ee. Often reduced to LY-bree." },
    { word: "Museum", ipa: "/mjuːˈziː.əm/", meaning: "박물관", meaningEs: "museo", level: "A2", speechLang: "en-US", tip: "Three syllables: myoo-ZEE-um. Stress on second." },
    { word: "Mountain", ipa: "/ˈmaʊn.tɪn/", meaning: "산", meaningEs: "montaña", level: "A2", speechLang: "en-US", tip: "Two syllables: MOWN-tin. The 'nt' in the middle flaps." },
    { word: "Ocean", ipa: "/ˈoʊ.ʃən/", meaning: "바다", meaningEs: "océano", level: "A2", speechLang: "en-US", tip: "Two syllables: OH-shun. The 'sh' glides from the 'c'." },
    { word: "Village", ipa: "/ˈvɪl.ɪdʒ/", meaning: "마을", meaningEs: "pueblo", level: "A2", speechLang: "en-US", tip: "Two syllables: VIL-ij. The final 'ge' sounds like 'j'." },
    // ── B1 Intermediate ──────────────────────────────────────────────────────
    { word: "Ambiguous", ipa: "/æmˈbɪɡ.ju.əs/", meaning: "모호한", level: "B1", speechLang: "en-US", tip: "Four syllables: am-BIG-yoo-us. Stress on second." },
    { word: "Sophisticated", ipa: "/səˈfɪs.tɪ.keɪ.tɪd/", meaning: "세련된", level: "B1", speechLang: "en-US", tip: "Five syllables: so-FIS-ti-kay-tid. Stress on second." },
    { word: "Perseverance", ipa: "/ˌpɜː.sɪˈvɪər.əns/", meaning: "인내", level: "B1", speechLang: "en-US", tip: "Four syllables: per-se-VEER-ance. Stress on third." },
    { word: "Eloquent", ipa: "/ˈɛl.ə.kwənt/", meaning: "웅변의", level: "B1", speechLang: "en-US", tip: "Three syllables: EL-oh-kwent. Stress on first." },
    { word: "Meticulous", ipa: "/mɪˈtɪk.jʊ.ləs/", meaning: "꼼꼼한", level: "B1", speechLang: "en-US", tip: "Four syllables: meh-TIK-yoo-lus. Stress on second." },
    { word: "Nostalgic", ipa: "/nɒˈstæl.dʒɪk/", meaning: "향수 어린", level: "B1", speechLang: "en-US", tip: "Three syllables: nos-TAL-jik. Stress on second." },
    { word: "Resilience", ipa: "/rɪˈzɪl.i.əns/", meaning: "회복력", level: "B1", speechLang: "en-US", tip: "Four syllables: re-ZIL-ee-ence. Stress on second." },
    { word: "Melancholy", ipa: "/ˈmɛl.ən.kɒl.i/", meaning: "우울한", level: "B1", speechLang: "en-US", tip: "Four syllables: MEL-en-kol-ee. Stress on first." },
    { word: "Wanderlust", ipa: "/ˈwɒn.də.lʌst/", meaning: "여행 욕구", level: "B1", speechLang: "en-US", tip: "Three syllables: WON-der-lust. German origin word." },
    { word: "Serendipity", ipa: "/ˌsɛr.ən.ˈdɪp.ɪ.ti/", meaning: "뜻밖의 행운", level: "B1", speechLang: "en-US", tip: "Five syllables: ser-en-DIP-i-tee. Stress on third." },

    { word: "Environment", ipa: "/ɪnˈvaɪ.rən.mənt/", meaning: "환경", meaningEs: "medio ambiente", level: "B1", speechLang: "en-US", tip: "Four syllables: en-VY-ron-ment. Stress on second." },
    { word: "Opportunity", ipa: "/ˌɒp.ərˈtjuː.nɪ.ti/", meaning: "기회", meaningEs: "oportunidad", level: "B1", speechLang: "en-US", tip: "Five syllables: op-er-TOO-ni-tee. Stress on third." },
    { word: "Experience", ipa: "/ɪkˈspɪr.i.əns/", meaning: "경험", meaningEs: "experiencia", level: "B1", speechLang: "en-US", tip: "Four syllables: ik-SPEER-ee-uns. Stress on second." },
    { word: "Communication", ipa: "/kəˌmjuː.nɪˈkeɪ.ʃən/", meaning: "의사소통", meaningEs: "comunicación", level: "B1", speechLang: "en-US", tip: "Five syllables: kuh-myoo-ni-KAY-shun. Stress on fourth." },
    { word: "Professional", ipa: "/prəˈfɛʃ.ən.əl/", meaning: "전문적인", meaningEs: "profesional", level: "B1", speechLang: "en-US", tip: "Four syllables: pro-FESH-un-ul. Stress on second." },
    { word: "Responsibility", ipa: "/rɪˌspɒn.sɪˈbɪl.ɪ.ti/", meaning: "책임", meaningEs: "responsabilidad", level: "B1", speechLang: "en-US", tip: "Six syllables: ri-spon-si-BIL-i-tee. Stress on fourth." },
    { word: "Technology", ipa: "/tɛkˈnɒl.ə.dʒi/", meaning: "기술", meaningEs: "tecnología", level: "B1", speechLang: "en-US", tip: "Four syllables: tek-NOL-uh-jee. Stress on second." },
    { word: "Government", ipa: "/ˈɡʌv.ərn.mənt/", meaning: "정부", meaningEs: "gobierno", level: "B1", speechLang: "en-US", tip: "Three syllables: GUV-ern-ment. Often reduced to GUV-ment." },
    { word: "Education", ipa: "/ˌɛdʒ.uˈkeɪ.ʃən/", meaning: "교육", meaningEs: "educación", level: "B1", speechLang: "en-US", tip: "Four syllables: ej-oo-KAY-shun. Stress on third." },
    { word: "Situation", ipa: "/ˌsɪtʃ.uˈeɪ.ʃən/", meaning: "상황", meaningEs: "situación", level: "B1", speechLang: "en-US", tip: "Four syllables: sich-oo-AY-shun. Stress on third." },
    { word: "Organization", ipa: "/ˌɔːr.ɡən.aɪˈzeɪ.ʃən/", meaning: "조직", meaningEs: "organización", level: "B1", speechLang: "en-US", tip: "Five syllables: or-gan-i-ZAY-shun. Stress on fourth." },
    { word: "Development", ipa: "/dɪˈvɛl.əp.mənt/", meaning: "발전", meaningEs: "desarrollo", level: "B1", speechLang: "en-US", tip: "Four syllables: di-VEL-up-ment. Stress on second." },
    { word: "Relationship", ipa: "/rɪˈleɪ.ʃən.ʃɪp/", meaning: "관계", meaningEs: "relación", level: "B1", speechLang: "en-US", tip: "Four syllables: ri-LAY-shun-ship. Stress on second." },
    { word: "Absolutely", ipa: "/ˌæb.səˈluːt.li/", meaning: "절대적으로", meaningEs: "absolutamente", level: "B1", speechLang: "en-US", tip: "Four syllables: ab-suh-LOOT-lee. Stress on third." },
    { word: "Particularly", ipa: "/pərˈtɪk.jə.lər.li/", meaning: "특히", meaningEs: "particularmente", level: "B1", speechLang: "en-US", tip: "Five syllables: per-TIK-yuh-ler-lee. Stress on second." },
    { word: "Temperature", ipa: "/ˈtɛm.pər.ə.tʃər/", meaning: "온도", meaningEs: "temperatura", level: "B1", speechLang: "en-US", tip: "Four syllables: TEM-per-uh-cher. Often reduced to TEM-pra-cher." },
    { word: "Independent", ipa: "/ˌɪn.dɪˈpɛn.dənt/", meaning: "독립적인", meaningEs: "independiente", level: "B1", speechLang: "en-US", tip: "Four syllables: in-di-PEN-dent. Stress on third." },
    { word: "Photography", ipa: "/fəˈtɒɡ.rə.fi/", meaning: "사진술", meaningEs: "fotografía", level: "B1", speechLang: "en-US", tip: "Four syllables: fuh-TOG-ruh-fee. Stress on second." },
    { word: "Architecture", ipa: "/ˈɑːr.kɪ.tɛk.tʃər/", meaning: "건축", meaningEs: "arquitectura", level: "B1", speechLang: "en-US", tip: "Four syllables: AR-ki-tek-cher. Stress on first." },
    { word: "Vocabulary", ipa: "/voʊˈkæb.jə.lɛr.i/", meaning: "어휘", meaningEs: "vocabulario", level: "B1", speechLang: "en-US", tip: "Five syllables: voh-KAB-yuh-ler-ee. Stress on second." },
    { word: "Pronunciation", ipa: "/prəˌnʌn.siˈeɪ.ʃən/", meaning: "발음", meaningEs: "pronunciación", level: "B1", speechLang: "en-US", tip: "Five syllables: pro-nun-see-AY-shun. Note: no 'ounce' inside!" },
    { word: "Literature", ipa: "/ˈlɪt.ər.ə.tʃər/", meaning: "문학", meaningEs: "literatura", level: "B1", speechLang: "en-US", tip: "Four syllables: LIT-er-uh-cher. Stress on first." },
    { word: "Ingredient", ipa: "/ɪnˈɡriː.di.ənt/", meaning: "재료", meaningEs: "ingrediente", level: "B1", speechLang: "en-US", tip: "Four syllables: in-GREE-dee-ent. Stress on second." },
    { word: "Appreciate", ipa: "/əˈpriː.ʃi.eɪt/", meaning: "감사하다", meaningEs: "apreciar", level: "B1", speechLang: "en-US", tip: "Four syllables: uh-PREE-shee-ayt. Stress on second." },
    { word: "Consequence", ipa: "/ˈkɒn.sɪ.kwəns/", meaning: "결과", meaningEs: "consecuencia", level: "B1", speechLang: "en-US", tip: "Three syllables: KON-si-kwens. Stress on first." },
    { word: "Significance", ipa: "/sɪɡˈnɪf.ɪ.kəns/", meaning: "중요성", meaningEs: "significancia", level: "B1", speechLang: "en-US", tip: "Four syllables: sig-NIF-i-kens. Stress on second." },
    { word: "Enthusiasm", ipa: "/ɪnˈθjuː.zi.æz.əm/", meaning: "열정", meaningEs: "entusiasmo", level: "B1", speechLang: "en-US", tip: "Four syllables: en-THYOO-zee-az-um. Stress on second." },
    { word: "Approximately", ipa: "/əˈprɒk.sɪ.mət.li/", meaning: "대략", meaningEs: "aproximadamente", level: "B1", speechLang: "en-US", tip: "Five syllables: uh-PROK-si-mit-lee. Stress on second." },
    { word: "Investigate", ipa: "/ɪnˈvɛs.tɪ.ɡeɪt/", meaning: "조사하다", meaningEs: "investigar", level: "B1", speechLang: "en-US", tip: "Four syllables: in-VES-ti-gayt. Stress on second." },
    // ── B2 Upper Intermediate ─────────────────────────────────────────────────
    { word: "Ephemeral", ipa: "/ɪˈfɛm.ər.əl/", meaning: "덧없는", level: "B2", speechLang: "en-US", tip: "Four syllables: eh-FEM-er-al. Stress on second." },
    { word: "Conspicuous", ipa: "/kənˈspɪk.ju.əs/", meaning: "눈에 띄는", level: "B2", speechLang: "en-US", tip: "Four syllables: kun-SPIK-yoo-us. Stress on second." },
    { word: "Whimsical", ipa: "/ˈwɪm.zɪ.kəl/", meaning: "기발한", level: "B2", speechLang: "en-US", tip: "Three syllables: WIM-zi-kul. Stress on first." },
    { word: "Tenacious", ipa: "/tɪˈneɪ.ʃəs/", meaning: "끈질긴", level: "B2", speechLang: "en-US", tip: "Three syllables: teh-NAY-shus. Stress on second." },
    { word: "Benevolent", ipa: "/bɪˈnɛv.ə.lənt/", meaning: "자비로운", level: "B2", speechLang: "en-US", tip: "Four syllables: beh-NEV-oh-lent. Stress on second." },
    { word: "Ubiquitous", ipa: "/juːˈbɪk.wɪ.təs/", meaning: "어디에나 있는", level: "B2", speechLang: "en-US", tip: "Four syllables: yoo-BIK-wi-tus. Stress on second." },
    { word: "Venerable", ipa: "/ˈvɛn.ər.ə.bəl/", meaning: "존경받는", level: "B2", speechLang: "en-US", tip: "Four syllables: VEN-er-ah-bul. Stress on first." },
    { word: "Rhetoric", ipa: "/ˈrɛt.ər.ɪk/", meaning: "수사학", level: "B2", speechLang: "en-US", tip: "Three syllables: RET-or-ik. The 'h' is silent." },
    { word: "Surreal", ipa: "/səˈriː.əl/", meaning: "초현실적인", level: "B2", speechLang: "en-US", tip: "Three syllables: suh-REE-ul. Stress on second." },
    { word: "Juxtaposition", ipa: "/ˌdʒʌk.stə.pəˈzɪʃ.ən/", meaning: "병치", level: "B2", speechLang: "en-US", tip: "Five syllables: juk-sta-poh-ZI-shun. Stress on fourth." },
    { word: "Sophisticated", ipa: "/səˈfɪs.tɪ.keɪ.tɪd/", meaning: "세련된", meaningEs: "sofisticado", level: "B2", speechLang: "en-US", tip: "Five syllables: suh-FIS-ti-kay-tid. Stress on second." },
    { word: "Comprehensive", ipa: "/ˌkɒm.prɪˈhɛn.sɪv/", meaning: "포괄적인", meaningEs: "comprensivo", level: "B2", speechLang: "en-US", tip: "Four syllables: kom-pri-HEN-siv. Stress on third." },
    { word: "Circumstances", ipa: "/ˈsɜːr.kəm.stæn.sɪz/", meaning: "상황", meaningEs: "circunstancias", level: "B2", speechLang: "en-US", tip: "Four syllables: SUR-kum-stan-siz. Stress on first." },
    { word: "Entrepreneurship", ipa: "/ˌɒn.trə.prəˈnɜːr.ʃɪp/", meaning: "기업가 정신", meaningEs: "emprendimiento", level: "B2", speechLang: "en-US", tip: "Five syllables: on-tre-pre-NUR-ship. Stress on fourth." },
    { word: "Extraordinary", ipa: "/ɪkˈstrɔːr.dɪn.ɛr.i/", meaning: "비범한", meaningEs: "extraordinario", level: "B2", speechLang: "en-US", tip: "Five syllables: ik-STROR-di-ner-ee. Stress on second." },
    { word: "Philosophical", ipa: "/ˌfɪl.əˈsɒf.ɪ.kəl/", meaning: "철학적인", meaningEs: "filosófico", level: "B2", speechLang: "en-US", tip: "Five syllables: fil-uh-SOF-i-kul. Stress on third." },
    { word: "Archaeological", ipa: "/ˌɑːr.ki.əˈlɒdʒ.ɪ.kəl/", meaning: "고고학적인", meaningEs: "arqueológico", level: "B2", speechLang: "en-US", tip: "Six syllables: ar-kee-uh-LOJ-i-kul. Stress on fourth." },
    { word: "Unprecedented", ipa: "/ʌnˈprɛs.ɪ.dɛn.tɪd/", meaning: "전례 없는", meaningEs: "sin precedentes", level: "B2", speechLang: "en-US", tip: "Five syllables: un-PRES-i-den-tid. Stress on second." },
    { word: "Simultaneously", ipa: "/ˌsaɪ.məlˈteɪ.ni.əs.li/", meaning: "동시에", meaningEs: "simultáneamente", level: "B2", speechLang: "en-US", tip: "Six syllables: sy-mul-TAY-nee-us-lee. Stress on third." },
    { word: "Characteristics", ipa: "/ˌkær.ək.təˈrɪs.tɪks/", meaning: "특성", meaningEs: "características", level: "B2", speechLang: "en-US", tip: "Five syllables: kair-ik-tuh-RIS-tiks. Stress on fourth." },
    { word: "Vulnerability", ipa: "/ˌvʌl.nər.əˈbɪl.ɪ.ti/", meaning: "취약성", meaningEs: "vulnerabilidad", level: "B2", speechLang: "en-US", tip: "Six syllables: vul-ner-uh-BIL-i-tee. Stress on fourth." },
    { word: "Consciousness", ipa: "/ˈkɒn.ʃəs.nəs/", meaning: "의식", meaningEs: "conciencia", level: "B2", speechLang: "en-US", tip: "Three syllables: KON-shus-nes. Stress on first." },
    { word: "Distinguishable", ipa: "/dɪˈstɪŋ.ɡwɪ.ʃə.bəl/", meaning: "구별 가능한", meaningEs: "distinguible", level: "B2", speechLang: "en-US", tip: "Five syllables: dis-TING-gwi-shuh-bul. Stress on second." },
    { word: "Enthusiastically", ipa: "/ɪnˌθjuː.ziˈæs.tɪ.kəl.i/", meaning: "열정적으로", meaningEs: "entusiastamente", level: "B2", speechLang: "en-US", tip: "Six syllables: en-thyoo-zee-AS-ti-klee. Stress on fourth." },
    { word: "Inconvenience", ipa: "/ˌɪn.kənˈviː.ni.əns/", meaning: "불편", meaningEs: "inconveniencia", level: "B2", speechLang: "en-US", tip: "Five syllables: in-kun-VEE-nee-uns. Stress on third." },
    { word: "Autobiography", ipa: "/ˌɔː.toʊ.baɪˈɒɡ.rə.fi/", meaning: "자서전", meaningEs: "autobiografía", level: "B2", speechLang: "en-US", tip: "Six syllables: aw-toh-by-OG-ruh-fee. Stress on fourth." },
    { word: "Collaboration", ipa: "/kəˌlæb.əˈreɪ.ʃən/", meaning: "협업", meaningEs: "colaboración", level: "B2", speechLang: "en-US", tip: "Five syllables: kuh-lab-uh-RAY-shun. Stress on fourth." },
    { word: "Determination", ipa: "/dɪˌtɜːr.mɪˈneɪ.ʃən/", meaning: "결단력", meaningEs: "determinación", level: "B2", speechLang: "en-US", tip: "Five syllables: di-tur-mi-NAY-shun. Stress on fourth." },
    { word: "Interpretation", ipa: "/ɪnˌtɜːr.prɪˈteɪ.ʃən/", meaning: "해석", meaningEs: "interpretación", level: "B2", speechLang: "en-US", tip: "Five syllables: in-tur-pri-TAY-shun. Stress on fourth." },
    { word: "Misunderstanding", ipa: "/ˌmɪs.ʌn.dərˈstæn.dɪŋ/", meaning: "오해", meaningEs: "malentendido", level: "B2", speechLang: "en-US", tip: "Five syllables: mis-un-der-STAND-ing. Stress on fourth." },
    { word: "Accomplishment", ipa: "/əˈkɒm.plɪʃ.mənt/", meaning: "성취", meaningEs: "logro", level: "B2", speechLang: "en-US", tip: "Four syllables: uh-KOM-plish-ment. Stress on second." },
    { word: "Rehabilitation", ipa: "/ˌriː.hə.bɪl.ɪˈteɪ.ʃən/", meaning: "재활", meaningEs: "rehabilitación", level: "B2", speechLang: "en-US", tip: "Six syllables: ree-huh-bil-i-TAY-shun. Stress on fifth." },
    { word: "Overwhelming", ipa: "/ˌoʊ.vərˈwɛl.mɪŋ/", meaning: "압도적인", meaningEs: "abrumador", level: "B2", speechLang: "en-US", tip: "Four syllables: oh-ver-WEL-ming. Stress on third." },
    { word: "Bureaucracy", ipa: "/bjʊˈrɒk.rə.si/", meaning: "관료제", meaningEs: "burocracia", level: "B2", speechLang: "en-US", tip: "Four syllables: byoo-ROK-ruh-see. Stress on second." },
    { word: "Mediterranean", ipa: "/ˌmɛd.ɪ.təˈreɪ.ni.ən/", meaning: "지중해의", meaningEs: "mediterráneo", level: "B2", speechLang: "en-US", tip: "Six syllables: med-i-tuh-RAY-nee-un. Stress on fourth." },
    { word: "Civilization", ipa: "/ˌsɪv.ɪ.laɪˈzeɪ.ʃən/", meaning: "문명", meaningEs: "civilización", level: "B2", speechLang: "en-US", tip: "Five syllables: siv-i-li-ZAY-shun. Stress on fourth." },
    { word: "Psychological", ipa: "/ˌsaɪ.kəˈlɒdʒ.ɪ.kəl/", meaning: "심리적인", meaningEs: "psicológico", level: "B2", speechLang: "en-US", tip: "Five syllables: sy-kuh-LOJ-i-kul. The 'p' is silent." },
    { word: "Revolutionary", ipa: "/ˌrɛv.əˈluː.ʃən.ɛr.i/", meaning: "혁명적인", meaningEs: "revolucionario", level: "B2", speechLang: "en-US", tip: "Six syllables: rev-uh-LOO-shun-air-ee. Stress on third." },
  ],
  spanish: [
    // ── A1 Beginner ──────────────────────────────────────────────────────────
    { word: "Hola", ipa: "/ˈo.la/", meaning: "안녕하세요", level: "A1", speechLang: "es-ES", tip: "The 'h' is silent in Spanish." },
    { word: "Gracias", ipa: "/ˈɡɾa.sjas/", meaning: "감사합니다", level: "A1", speechLang: "es-ES", tip: "The 'r' is a single tap (ɾ), not a rolled 'rr'." },
    { word: "Perdón", ipa: "/peɾˈðon/", meaning: "죄송합니다", level: "A1", speechLang: "es-ES", tip: "The 'd' between vowels becomes a soft 'ð' sound." },
    { word: "Sí", ipa: "/si/", meaning: "네", level: "A1", speechLang: "es-ES", tip: "Short and crisp. Accent mark just shows it's 'yes', not 'if'." },
    { word: "No", ipa: "/no/", meaning: "아니요", level: "A1", speechLang: "es-ES", tip: "Pure 'o' vowel — no glide like in English." },
    { word: "Por favor", ipa: "/poɾ faˈβoɾ/", meaning: "부탁드려요", level: "A1", speechLang: "es-ES", tip: "The 'v' sounds like a soft 'b' (β)." },
    { word: "Agua", ipa: "/ˈa.ɣwa/", meaning: "물", level: "A1", speechLang: "es-ES", tip: "The 'g' between vowels softens to 'ɣ'." },
    { word: "Café", ipa: "/kaˈfe/", meaning: "커피", level: "A1", speechLang: "es-ES", tip: "Stress on the second syllable: ka-FEH." },
    { word: "Amigo", ipa: "/aˈmi.ɣo/", meaning: "친구", level: "A1", speechLang: "es-ES", tip: "Intervocalic 'g' softens to 'ɣ'." },
    { word: "Feliz", ipa: "/feˈliθ/", meaning: "행복한", level: "A1", speechLang: "es-ES", tip: "In Spain Spanish, 'z' = 'θ' (like English 'th')." },
    { word: "Bueno", ipa: "/ˈbwe.no/", meaning: "좋은", level: "A1", speechLang: "es-ES", tip: "The 'ue' glides together: BWEH-no." },
    { word: "Malo", ipa: "/ˈma.lo/", meaning: "나쁜", level: "A1", speechLang: "es-ES", tip: "Two clean syllables: MA-lo." },
    { word: "Casa", ipa: "/ˈka.sa/", meaning: "집", level: "A1", speechLang: "es-ES", tip: "All vowels are pure and short in Spanish." },
    { word: "Comida", ipa: "/koˈmi.ða/", meaning: "음식", level: "A1", speechLang: "es-ES", tip: "The 'd' between vowels softens to 'ð'." },
    { word: "Ayuda", ipa: "/aˈju.ða/", meaning: "도움", level: "A1", speechLang: "es-ES", tip: "Three syllables: a-YU-da." },
    { word: "Buenos días", ipa: "/ˈbwe.nos ˈdi.as/", meaning: "좋은 아침이에요", level: "A1", speechLang: "es-ES", tip: "Link the words smoothly as one phrase." },
    { word: "¿Cómo estás?", ipa: "/ˈko.mo esˈtas/", meaning: "어떻게 지내세요?", level: "A1", speechLang: "es-ES", tip: "Stress on 'tás' — the accent tells you!" },
    { word: "Nombre", ipa: "/ˈnom.bɾe/", meaning: "이름", level: "A1", speechLang: "es-ES", tip: "Two syllables: NOM-bre. Tap the 'r' lightly." },
    { word: "Libro", ipa: "/ˈli.βɾo/", meaning: "책", level: "A1", speechLang: "es-ES", tip: "The 'b' between vowels softens to a gentle 'β' sound." },
    { word: "Día", ipa: "/ˈdi.a/", meaning: "날", level: "A1", speechLang: "es-ES", tip: "Two syllables: DEE-a. The accent on 'i' keeps them separate." },

    { word: "Perro", ipa: "/ˈpe.ro/", meaning: "개", meaningEs: "dog", level: "A1", speechLang: "es-ES", tip: "The 'rr' would be rolled here, but single 'r' gets a light tap: PEH-ro." },
    { word: "Gato", ipa: "/ˈɡa.to/", meaning: "고양이", meaningEs: "cat", level: "A1", speechLang: "es-ES", tip: "Two clean syllables: GA-to. Pure Spanish vowels." },
    { word: "Mesa", ipa: "/ˈme.sa/", meaning: "탁자", meaningEs: "table", level: "A1", speechLang: "es-ES", tip: "Two syllables: MEH-sa. Pure 'e', pure 'a'." },
    { word: "Silla", ipa: "/ˈsi.ʎa/", meaning: "의자", meaningEs: "chair", level: "A1", speechLang: "es-ES", tip: "The 'll' in Spain Spanish = 'ʎ' palatal: SEE-lya." },
    { word: "Familia", ipa: "/faˈmi.lja/", meaning: "가족", meaningEs: "family", level: "A1", speechLang: "es-ES", tip: "Three syllables: fa-MI-lya. Stress on second." },
    { word: "Madre", ipa: "/ˈma.ðɾe/", meaning: "어머니", meaningEs: "mother", level: "A1", speechLang: "es-ES", tip: "Two syllables: MA-dre. The 'd' softens between vowels to 'ð'." },
    { word: "Padre", ipa: "/ˈpa.ðɾe/", meaning: "아버지", meaningEs: "father", level: "A1", speechLang: "es-ES", tip: "Two syllables: PA-dre. Soft 'd' (ð) between vowels." },
    { word: "Niño", ipa: "/ˈni.ɲo/", meaning: "아이", meaningEs: "child", level: "A1", speechLang: "es-ES", tip: "Two syllables: NEE-nyo. The 'ñ' is the 'ny' sound." },
    { word: "Mujer", ipa: "/muˈxeɾ/", meaning: "여자", meaningEs: "woman", level: "A1", speechLang: "es-ES", tip: "Two syllables: mu-KHER. The 'j' is like a guttural 'h'." },
    { word: "Hombre", ipa: "/ˈom.bɾe/", meaning: "남자", meaningEs: "man", level: "A1", speechLang: "es-ES", tip: "Two syllables: OM-bre. The 'h' is silent." },
    { word: "Calle", ipa: "/ˈka.ʎe/", meaning: "거리", meaningEs: "street", level: "A1", speechLang: "es-ES", tip: "Two syllables: KA-lye. The 'll' = palatal 'ly' sound." },
    { word: "Ciudad", ipa: "/θjuˈðað/", meaning: "도시", meaningEs: "city", level: "A1", speechLang: "es-ES", tip: "Two syllables: thyoo-DAHD. Final 'd' nearly silent." },
    { word: "Noche", ipa: "/ˈno.tʃe/", meaning: "밤", meaningEs: "night", level: "A1", speechLang: "es-ES", tip: "Two syllables: NO-che. The 'ch' sounds like in 'church'." },
    { word: "Tiempo", ipa: "/ˈtjem.po/", meaning: "시간/날씨", meaningEs: "time/weather", level: "A1", speechLang: "es-ES", tip: "Two syllables: TYEM-po. The 'ie' is a diphthong." },
    { word: "Grande", ipa: "/ˈɡɾan.de/", meaning: "큰", meaningEs: "big", level: "A1", speechLang: "es-ES", tip: "Two syllables: GRAN-de. Roll the 'r' lightly." },
    { word: "Pequeño", ipa: "/peˈke.ɲo/", meaning: "작은", meaningEs: "small", level: "A1", speechLang: "es-ES", tip: "Three syllables: pe-KE-nyo. The 'ñ' = 'ny' sound." },
    { word: "Nuevo", ipa: "/ˈnwe.βo/", meaning: "새로운", meaningEs: "new", level: "A1", speechLang: "es-ES", tip: "Two syllables: NWEH-vo. The 'ue' is a diphthong." },
    { word: "Comer", ipa: "/koˈmeɾ/", meaning: "먹다", meaningEs: "to eat", level: "A1", speechLang: "es-ES", tip: "Two syllables: ko-MER. Stress on second. Tap the 'r'." },
    { word: "Beber", ipa: "/beˈβeɾ/", meaning: "마시다", meaningEs: "to drink", level: "A1", speechLang: "es-ES", tip: "Two syllables: be-VER. The 'b' softens to 'β' between vowels." },
    { word: "Dormir", ipa: "/doɾˈmiɾ/", meaning: "자다", meaningEs: "to sleep", level: "A1", speechLang: "es-ES", tip: "Two syllables: dor-MEER. Tap the first 'r', tap the final 'r'." },
    { word: "Hablar", ipa: "/aˈβlaɾ/", meaning: "말하다", meaningEs: "to speak", level: "A1", speechLang: "es-ES", tip: "Two syllables: a-BLAR. Silent 'h', 'b' softens to 'β'." },
    { word: "Escuchar", ipa: "/es.kuˈtʃaɾ/", meaning: "듣다", meaningEs: "to listen", level: "A1", speechLang: "es-ES", tip: "Three syllables: es-ku-CHAR. Stress on third." },
    { word: "Blanco", ipa: "/ˈblaŋ.ko/", meaning: "흰", meaningEs: "white", level: "A1", speechLang: "es-ES", tip: "Two syllables: BLAN-ko. 'Bl' cluster: lips first, then 'l'." },
    { word: "Negro", ipa: "/ˈne.ɣɾo/", meaning: "검은", meaningEs: "black", level: "A1", speechLang: "es-ES", tip: "Two syllables: NEH-gro. The 'g' softens to 'ɣ' between vowels." },
    { word: "Rojo", ipa: "/ˈro.xo/", meaning: "빨간", meaningEs: "red", level: "A1", speechLang: "es-ES", tip: "Two syllables: RO-kho. The 'j' sounds like a breathy 'kh'." },
    { word: "Verde", ipa: "/ˈbeɾ.ðe/", meaning: "초록", meaningEs: "green", level: "A1", speechLang: "es-ES", tip: "Two syllables: BER-de. Soft tap 'r', soft 'd' (ð)." },
    { word: "Azul", ipa: "/aˈθul/", meaning: "파란", meaningEs: "blue", level: "A1", speechLang: "es-ES", tip: "Two syllables: a-THOOL. Spain: 'z' = 'θ' like English 'th'." },
    // ── A2 Elementary ────────────────────────────────────────────────────────
    { word: "Viaje", ipa: "/ˈbja.xe/", meaning: "여행", level: "A2", speechLang: "es-ES", tip: "The 'j' sounds like a breathy 'kh'. BYAH-khe." },
    { word: "Aeropuerto", ipa: "/ˌa.e.ɾoˈpweɾ.to/", meaning: "공항", level: "A2", speechLang: "es-ES", tip: "5 syllables. Stress on PWER: a-e-ro-PWER-to." },
    { word: "Hotel", ipa: "/oˈtel/", meaning: "호텔", level: "A2", speechLang: "es-ES", tip: "Stress on second syllable: o-TEL. No 'h' sound." },
    { word: "Restaurante", ipa: "/res.tawˈɾan.te/", meaning: "식당", level: "A2", speechLang: "es-ES", tip: "4 syllables. Stress on RAN: res-tau-RAN-te." },
    { word: "Tiempo", ipa: "/ˈtjem.po/", meaning: "날씨 / 시간", level: "A2", speechLang: "es-ES", tip: "The 'ie' is a diphthong — TYEM-po." },
    { word: "Importante", ipa: "/im.poɾˈtan.te/", meaning: "중요한", level: "A2", speechLang: "es-ES", tip: "4 syllables. Stress on TAN: im-por-TAN-te." },
    { word: "Diferente", ipa: "/di.feˈɾen.te/", meaning: "다른", level: "A2", speechLang: "es-ES", tip: "4 syllables. Stress on REN: di-fe-REN-te." },
    { word: "Familia", ipa: "/faˈmi.lja/", meaning: "가족", level: "A2", speechLang: "es-ES", tip: "3 syllables. The 'lia' ends with a palatal glide: fa-MI-lya." },
    { word: "Escuela", ipa: "/esˈkwe.la/", meaning: "학교", level: "A2", speechLang: "es-ES", tip: "3 syllables. The 'ue' is a diphthong: es-KWEH-la." },
    { word: "Música", ipa: "/ˈmu.si.ka/", meaning: "음악", level: "A2", speechLang: "es-ES", tip: "3 syllables. Stress on first: MU-si-ca (rare stressed ending)." },
    { word: "Siempre", ipa: "/ˈsjem.pɾe/", meaning: "항상", level: "A2", speechLang: "es-ES", tip: "The 'ie' diphthong: SYEM-pre. Tap the 'r'." },
    { word: "Nunca", ipa: "/ˈnuŋ.ka/", meaning: "절대", level: "A2", speechLang: "es-ES", tip: "Two syllables: NUNG-ka. The 'n' nasalizes before 'k'." },

    { word: "Cocina", ipa: "/koˈθi.na/", meaning: "부엌", meaningEs: "kitchen", level: "A2", speechLang: "es-ES", tip: "Three syllables: ko-THEE-na. Spain: 'c' before 'i' = 'θ'." },
    { word: "Ventana", ipa: "/benˈta.na/", meaning: "창문", meaningEs: "window", level: "A2", speechLang: "es-ES", tip: "Three syllables: ben-TA-na. 'V' sounds like soft 'b'." },
    { word: "Edificio", ipa: "/e.ðiˈfi.θjo/", meaning: "건물", meaningEs: "building", level: "A2", speechLang: "es-ES", tip: "Four syllables: e-di-FI-thyo. Spain: 'ci' = 'θ'." },
    { word: "Mercado", ipa: "/meɾˈka.ðo/", meaning: "시장", meaningEs: "market", level: "A2", speechLang: "es-ES", tip: "Three syllables: mer-KA-do. Soft 'd' at end." },
    { word: "Iglesia", ipa: "/iˈɣle.sja/", meaning: "교회", meaningEs: "church", level: "A2", speechLang: "es-ES", tip: "Three syllables: i-GLE-sya. 'G' softens to 'ɣ'." },
    { word: "Hermoso", ipa: "/eɾˈmo.so/", meaning: "아름다운", meaningEs: "beautiful", level: "A2", speechLang: "es-ES", tip: "Three syllables: er-MO-so. Tap the 'r', silent 'h'." },
    { word: "Peligroso", ipa: "/pe.liˈɣɾo.so/", meaning: "위험한", meaningEs: "dangerous", level: "A2", speechLang: "es-ES", tip: "Four syllables: pe-li-GRO-so. 'G' softens between vowels." },
    { word: "Necesario", ipa: "/ne.θeˈsa.ɾjo/", meaning: "필요한", meaningEs: "necessary", level: "A2", speechLang: "es-ES", tip: "Four syllables: ne-the-SA-ryo. Spain: 'c' = 'θ'." },
    { word: "Misterio", ipa: "/misˈte.ɾjo/", meaning: "미스터리", meaningEs: "mystery", level: "A2", speechLang: "es-ES", tip: "Three syllables: mis-TE-ryo. Tap the 'r'." },
    { word: "Aventura", ipa: "/a.βenˈtu.ɾa/", meaning: "모험", meaningEs: "adventure", level: "A2", speechLang: "es-ES", tip: "Four syllables: a-ben-TU-ra. 'V' = soft 'β'." },
    { word: "Tesoro", ipa: "/teˈso.ɾo/", meaning: "보물", meaningEs: "treasure", level: "A2", speechLang: "es-ES", tip: "Three syllables: te-SO-ro. Tap the final 'r'." },
    { word: "Descubrir", ipa: "/des.kuˈβɾiɾ/", meaning: "발견하다", meaningEs: "to discover", level: "A2", speechLang: "es-ES", tip: "Three syllables: des-ku-BRIR. 'V' = 'β'. Tap the 'r'." },
    { word: "Recordar", ipa: "/re.koɾˈðaɾ/", meaning: "기억하다", meaningEs: "to remember", level: "A2", speechLang: "es-ES", tip: "Three syllables: re-kor-DAR. Tap the 'r' sounds." },
    { word: "Entender", ipa: "/en.tenˈdeɾ/", meaning: "이해하다", meaningEs: "to understand", level: "A2", speechLang: "es-ES", tip: "Three syllables: en-ten-DER. Soft 'd', tap final 'r'." },
    { word: "Viajar", ipa: "/bjaˈxaɾ/", meaning: "여행하다", meaningEs: "to travel", level: "A2", speechLang: "es-ES", tip: "Two syllables: bya-KHAR. 'V' = 'b', 'j' = guttural 'kh'." },
    { word: "Trabajar", ipa: "/tɾa.βaˈxaɾ/", meaning: "일하다", meaningEs: "to work", level: "A2", speechLang: "es-ES", tip: "Three syllables: tra-ba-KHAR. 'j' = guttural 'kh'." },
    { word: "Aprender", ipa: "/a.pɾenˈdeɾ/", meaning: "배우다", meaningEs: "to learn", level: "A2", speechLang: "es-ES", tip: "Three syllables: a-pren-DER. Tap the 'r', soft 'd'." },
    { word: "Conocer", ipa: "/ko.noˈθeɾ/", meaning: "알다/만나다", meaningEs: "to know/meet", level: "A2", speechLang: "es-ES", tip: "Three syllables: ko-no-THER. Spain: 'c' = 'θ' before 'e'." },
    { word: "Biblioteca", ipa: "/bi.bljoˈte.ka/", meaning: "도서관", meaningEs: "library", level: "A2", speechLang: "es-ES", tip: "Five syllables: bi-blio-TE-ka. 'Bli' cluster flows together." },
    { word: "Museo", ipa: "/muˈse.o/", meaning: "박물관", meaningEs: "museum", level: "A2", speechLang: "es-ES", tip: "Three syllables: mu-SE-o. Each vowel is its own syllable." },
    { word: "Montaña", ipa: "/monˈta.ɲa/", meaning: "산", meaningEs: "mountain", level: "A2", speechLang: "es-ES", tip: "Three syllables: mon-TA-nya. The 'ñ' = 'ny' sound." },
    { word: "Playa", ipa: "/ˈpla.ʝa/", meaning: "해변", meaningEs: "beach", level: "A2", speechLang: "es-ES", tip: "Two syllables: PLA-ya. 'Ll'/'y' = palatal 'y' sound." },
    { word: "Idioma", ipa: "/iˈðjo.ma/", meaning: "언어", meaningEs: "language", level: "A2", speechLang: "es-ES", tip: "Three syllables: i-DYO-ma. Soft 'd' (ð)." },
    { word: "Izquierda", ipa: "/iθˈkjeɾ.ða/", meaning: "왼쪽", meaningEs: "left", level: "A2", speechLang: "es-ES", tip: "Three syllables: ith-KYER-da. 'Z' = 'θ' in Spain." },
    { word: "Derecha", ipa: "/deˈɾe.tʃa/", meaning: "오른쪽", meaningEs: "right", level: "A2", speechLang: "es-ES", tip: "Three syllables: de-RE-cha. Tap the 'r', 'ch' like 'church'." },
    { word: "Todavía", ipa: "/to.ða.ˈβi.a/", meaning: "아직", meaningEs: "still/yet", level: "A2", speechLang: "es-ES", tip: "Four syllables: to-da-VI-a. Soft 'd' (ð), soft 'v' (β)." },
    { word: "Bastante", ipa: "/basˈtan.te/", meaning: "충분히", meaningEs: "enough/quite", level: "A2", speechLang: "es-ES", tip: "Three syllables: bas-TAN-te. Stress on second." },
    { word: "Siguiente", ipa: "/siˈɣjen.te/", meaning: "다음의", meaningEs: "next", level: "A2", speechLang: "es-ES", tip: "Three syllables: si-GYEN-te. 'G' softens to 'ɣ'." },
    { word: "Problema", ipa: "/pɾoˈble.ma/", meaning: "문제", meaningEs: "problem", level: "A2", speechLang: "es-ES", tip: "Three syllables: pro-BLE-ma. 'Bl' cluster flows together." },
    { word: "Costumbre", ipa: "/kosˈtum.bɾe/", meaning: "습관", meaningEs: "custom/habit", level: "A2", speechLang: "es-ES", tip: "Three syllables: kos-TUM-bre. Stress on second." },
    { word: "Sorpresa", ipa: "/soɾˈpɾe.sa/", meaning: "놀라움", meaningEs: "surprise", level: "A2", speechLang: "es-ES", tip: "Three syllables: sor-PRE-sa. Two 'r' taps in a row." },
    // ── B1 Intermediate ──────────────────────────────────────────────────────
    { word: "Murciélago", ipa: "/muɾˈθje.la.ɣo/", meaning: "박쥐", level: "B1", speechLang: "es-ES", tip: "Contains all 5 vowels! The θ is a 'th' sound in Spain Spanish." },
    { word: "Desarrollar", ipa: "/de.za.ro.ˈʎaɾ/", meaning: "개발하다", level: "B1", speechLang: "es-ES", tip: "The 'll' sounds like 'y' in many dialects." },
    { word: "Conversación", ipa: "/kom.beɾ.saˈθjon/", meaning: "대화", level: "B1", speechLang: "es-ES", tip: "4 syllables. Stress on CION: con-ver-sa-THYON." },
    { word: "Experiencia", ipa: "/eks.peˈɾjen.θja/", meaning: "경험", level: "B1", speechLang: "es-ES", tip: "5 syllables. The 'rie' is a triphthong: eks-pe-RYEN-thya." },
    { word: "Oportunidad", ipa: "/o.poɾ.tu.niˈðað/", meaning: "기회", level: "B1", speechLang: "es-ES", tip: "6 syllables. Stress on DAD. Final 'd' is very soft or silent." },
    { word: "Conocimiento", ipa: "/ko.no.θiˈmjen.to/", meaning: "지식", level: "B1", speechLang: "es-ES", tip: "5 syllables. Stress on MIEN. The 'c' before 'i' = 'θ'." },
    { word: "Pronunciación", ipa: "/pɾo.nun.θjaˈθjon/", meaning: "발음", level: "B1", speechLang: "es-ES", tip: "5 syllables. Two 'θ' sounds! pro-nun-thya-THYON." },
    { word: "Desafío", ipa: "/de.saˈfi.o/", meaning: "도전", level: "B1", speechLang: "es-ES", tip: "4 syllables. Stress on FI: de-sa-FI-o. The accent keeps vowels separate." },

    { word: "Desarrollo", ipa: "/de.saˈro.ʎo/", meaning: "발전", meaningEs: "development", level: "B1", speechLang: "es-ES", tip: "Four syllables: de-sa-RO-lyo. 'll' = palatal 'ly'." },
    { word: "Gobierno", ipa: "/ɡoˈβjeɾ.no/", meaning: "정부", meaningEs: "government", level: "B1", speechLang: "es-ES", tip: "Three syllables: go-BYER-no. Soft 'v' (β). Tap the 'r'." },
    { word: "Investigación", ipa: "/im.bes.ti.ɣaˈθjon/", meaning: "연구", meaningEs: "research", level: "B1", speechLang: "es-ES", tip: "Five syllables: im-bes-ti-ga-THYON. Spain 'c' = 'θ'." },
    { word: "Responsabilidad", ipa: "/res.pon.sa.βi.liˈðað/", meaning: "책임", meaningEs: "responsibility", level: "B1", speechLang: "es-ES", tip: "Six syllables: res-pon-sa-bi-li-DAD. Final 'd' nearly silent." },
    { word: "Comunicación", ipa: "/ko.mu.ni.kaˈθjon/", meaning: "소통", meaningEs: "communication", level: "B1", speechLang: "es-ES", tip: "Five syllables: ko-mu-ni-ka-THYON. Stress on last syllable." },
    { word: "Independiente", ipa: "/in.de.penˈðjen.te/", meaning: "독립적인", meaningEs: "independent", level: "B1", speechLang: "es-ES", tip: "Five syllables: in-de-pen-DYEN-te. Soft 'd' (ð)." },
    { word: "Particularmente", ipa: "/paɾ.ti.ku.laɾˈmen.te/", meaning: "특히", meaningEs: "particularly", level: "B1", speechLang: "es-ES", tip: "Six syllables: par-ti-ku-lar-MEN-te. Stress on fifth." },
    { word: "Aproximadamente", ipa: "/a.pɾok.si.ma.ðaˈmen.te/", meaning: "대략", meaningEs: "approximately", level: "B1", speechLang: "es-ES", tip: "Seven syllables: a-prok-si-ma-da-MEN-te." },
    { word: "Conocimiento", ipa: "/ko.no.θiˈmjen.to/", meaning: "지식", meaningEs: "knowledge", level: "B1", speechLang: "es-ES", tip: "Five syllables: ko-no-thi-MYEN-to. 'C' = 'θ' in Spain." },
    { word: "Absolutamente", ipa: "/ab.so.lu.taˈmen.te/", meaning: "절대적으로", meaningEs: "absolutely", level: "B1", speechLang: "es-ES", tip: "Six syllables: ab-so-lu-ta-MEN-te. Stress on fifth." },
    { word: "Organización", ipa: "/oɾ.ɣa.ni.θaˈθjon/", meaning: "조직", meaningEs: "organization", level: "B1", speechLang: "es-ES", tip: "Five syllables: or-ga-ni-tha-THYON. Two 'θ' sounds." },
    { word: "Circunstancia", ipa: "/θiɾ.kunsˈtan.θja/", meaning: "상황", meaningEs: "circumstance", level: "B1", speechLang: "es-ES", tip: "Four syllables: thir-kuns-TAN-thya. Two 'θ' sounds." },
    { word: "Significativo", ipa: "/siɡ.ni.fi.kaˈti.βo/", meaning: "중요한", meaningEs: "significant", level: "B1", speechLang: "es-ES", tip: "Six syllables: sig-ni-fi-ka-TI-vo. Stress on fifth." },
    { word: "Agradecimiento", ipa: "/a.ɣɾa.ðe.θiˈmjen.to/", meaning: "감사", meaningEs: "gratitude", level: "B1", speechLang: "es-ES", tip: "Six syllables: a-gra-de-thi-MYEN-to." },
    { word: "Entretenimiento", ipa: "/en.tɾe.te.niˈmjen.to/", meaning: "오락", meaningEs: "entertainment", level: "B1", speechLang: "es-ES", tip: "Six syllables: en-tre-te-ni-MYEN-to." },
    { word: "Descubrimiento", ipa: "/des.ku.βɾiˈmjen.to/", meaning: "발견", meaningEs: "discovery", level: "B1", speechLang: "es-ES", tip: "Five syllables: des-ku-bri-MYEN-to. Soft 'v' (β)." },
    { word: "Arquitectura", ipa: "/aɾ.ki.tekˈtu.ɾa/", meaning: "건축", meaningEs: "architecture", level: "B1", speechLang: "es-ES", tip: "Five syllables: ar-ki-tek-TU-ra. Tap final 'r'." },
    { word: "Colaboración", ipa: "/ko.la.βo.ɾaˈθjon/", meaning: "협업", meaningEs: "collaboration", level: "B1", speechLang: "es-ES", tip: "Five syllables: ko-la-bo-ra-THYON. Soft 'v' (β)." },
    { word: "Consecuencia", ipa: "/kon.seˈkwen.θja/", meaning: "결과", meaningEs: "consequence", level: "B1", speechLang: "es-ES", tip: "Four syllables: kon-se-KWEN-thya. 'C' = 'θ' in Spain." },
    { word: "Sostenibilidad", ipa: "/sos.te.ni.βi.liˈðað/", meaning: "지속가능성", meaningEs: "sustainability", level: "B1", speechLang: "es-ES", tip: "Six syllables: sos-te-ni-bi-li-DAD. Final 'd' nearly silent." },
    // ── B2 Upper Intermediate ─────────────────────────────────────────────────
{ word: "Consciencia", ipa: "/kons.ˈθjen.θja/", meaning: "의식", meaningEs: "consciousness", level: "B2", speechLang: "es-ES", tip: "Four syllables: kons-THYEN-thya. Two 'θ' sounds." },
    { word: "Vulnerabilidad", ipa: "/bul.ne.ɾa.βi.liˈðað/", meaning: "취약성", meaningEs: "vulnerability", level: "B2", speechLang: "es-ES", tip: "Six syllables: bul-ne-ra-bi-li-DAD. Final 'd' nearly silent." },
    { word: "Contemporáneo", ipa: "/kon.tem.poˈɾa.ne.o/", meaning: "현대적인", meaningEs: "contemporary", level: "B2", speechLang: "es-ES", tip: "Six syllables: kon-tem-po-RA-ne-o. Stress on RA." },
    { word: "Determinación", ipa: "/de.ter.mi.naˈθjon/", meaning: "결단력", meaningEs: "determination", level: "B2", speechLang: "es-ES", tip: "Five syllables: de-ter-mi-na-THYON. 'C' = 'θ' in Spain." },
    { word: "Interpretación", ipa: "/in.ter.pre.taˈθjon/", meaning: "해석", meaningEs: "interpretation", level: "B2", speechLang: "es-ES", tip: "Five syllables: in-ter-pre-ta-THYON. Stress on last." },
    { word: "Malentendido", ipa: "/ma.len.tenˈdi.ðo/", meaning: "오해", meaningEs: "misunderstanding", level: "B2", speechLang: "es-ES", tip: "Five syllables: ma-len-ten-DI-do. Soft 'd' (ð)." },
    { word: "Logro", ipa: "/ˈlo.ɣɾo/", meaning: "성취", meaningEs: "achievement", level: "B2", speechLang: "es-ES", tip: "Two syllables: LO-gro. 'G' softens to 'ɣ' between vowels." },
    { word: "Rehabilitación", ipa: "/re.a.βi.li.taˈθjon/", meaning: "재활", meaningEs: "rehabilitation", level: "B2", speechLang: "es-ES", tip: "Six syllables: re-a-bi-li-ta-THYON. Soft 'v' (β)." },
    { word: "Abrumador", ipa: "/a.βɾu.maˈðoɾ/", meaning: "압도적인", meaningEs: "overwhelming", level: "B2", speechLang: "es-ES", tip: "Four syllables: a-bru-ma-DOR. Soft 'v' (β), tap final 'r'." },
    { word: "Burocracia", ipa: "/bu.ɾoˈkɾa.θja/", meaning: "관료제", meaningEs: "bureaucracy", level: "B2", speechLang: "es-ES", tip: "Four syllables: bu-ro-KRA-thya. Spain 'c' = 'θ'." },
    { word: "Civilización", ipa: "/θi.βi.li.θaˈθjon/", meaning: "문명", meaningEs: "civilization", level: "B2", speechLang: "es-ES", tip: "Five syllables: thi-bi-li-tha-THYON. Three fricative sounds." },
    { word: "Psicológico", ipa: "/psi.koˈlo.xi.ko/", meaning: "심리적인", meaningEs: "psychological", level: "B2", speechLang: "es-ES", tip: "Five syllables: psi-ko-LO-hi-ko. In Spanish the 'p' IS pronounced!" },
    { word: "Revolucionario", ipa: "/re.βo.lu.θjoˈna.ɾjo/", meaning: "혁명적인", meaningEs: "revolutionary", level: "B2", speechLang: "es-ES", tip: "Six syllables: re-bo-lu-thyo-NA-ryo. Soft 'v' (β), 'c' = 'θ'." },
    { word: "Filosófico", ipa: "/fi.loˈso.fi.ko/", meaning: "철학적인", meaningEs: "philosophical", level: "B2", speechLang: "es-ES", tip: "Five syllables: fi-lo-SO-fi-ko. Each vowel is pure." },
    { word: "Arqueológico", ipa: "/ar.ke.oˈlo.xi.ko/", meaning: "고고학적인", meaningEs: "archaeological", level: "B2", speechLang: "es-ES", tip: "Six syllables: ar-ke-o-LO-hi-ko. 'G' = guttural 'kh'." },
    { word: "Simultáneamente", ipa: "/si.mul.ˈta.ne.a.ˈmen.te/", meaning: "동시에", meaningEs: "simultaneously", level: "B2", speechLang: "es-ES", tip: "Seven syllables: si-mul-TA-ne-a-MEN-te." },
    { word: "Características", ipa: "/ka.ɾak.teˈɾis.ti.kas/", meaning: "특성", meaningEs: "characteristics", level: "B2", speechLang: "es-ES", tip: "Six syllables: ka-rak-te-RIS-ti-kas. Stress on fourth." },
    { word: "Emprendimiento", ipa: "/em.pɾen.diˈmjen.to/", meaning: "기업가 정신", meaningEs: "entrepreneurship", level: "B2", speechLang: "es-ES", tip: "Five syllables: em-pren-di-MYEN-to. Soft 'd'." },
    { word: "Colaboración", ipa: "/ko.la.βo.ɾaˈθjon/", meaning: "협업", meaningEs: "collaboration", level: "B2", speechLang: "es-ES", tip: "Five syllables: ko-la-bo-ra-THYON. Soft 'v' (β)." },
    { word: "Autobiografía", ipa: "/aw.to.βjo.ɣɾaˈfi.a/", meaning: "자서전", meaningEs: "autobiography", level: "B2", speechLang: "es-ES", tip: "Six syllables: aw-to-byo-gra-FI-a. Soft 'v' (β), soft 'g' (ɣ)." },
    { word: "Mediterráneo", ipa: "/me.ði.teˈra.ne.o/", meaning: "지중해의", meaningEs: "Mediterranean", level: "B2", speechLang: "es-ES", tip: "Six syllables: me-di-te-RA-ne-o. Soft 'd' (ð), rolled double 'rr'." },
    { word: "Extraordinario", ipa: "/eks.tɾa.oɾ.ðiˈna.ɾjo/", meaning: "비범한", meaningEs: "extraordinary", level: "B2", speechLang: "es-ES", tip: "Seven syllables! Break it down slowly before building speed." },
    { word: "Ferrocarril", ipa: "/fe.ro.kaˈril/", meaning: "철도", level: "B2", speechLang: "es-ES", tip: "Two rolling 'rr' sounds. Practice the trill separately first." },
    { word: "Responsabilidad", ipa: "/res.pon.sa.βi.liˈðað/", meaning: "책임감", level: "B2", speechLang: "es-ES", tip: "6 syllables. Stress on DAD. The final 'd' softens almost to silence." },
    { word: "Independencia", ipa: "/in.de.penˈden.θja/", meaning: "독립", level: "B2", speechLang: "es-ES", tip: "5 syllables. Stress on DEN: in-de-pen-DEN-thya." },
    { word: "Significativo", ipa: "/siɣ.ni.fi.kaˈti.βo/", meaning: "중요한", level: "B2", speechLang: "es-ES", tip: "6 syllables. Stress on TI: sig-ni-fi-ca-TI-vo." },
    // ── C1 Advanced ───────────────────────────────────────────────────────────
    { word: "Consecuentemente", ipa: "/kon.se.kwen.teˈmen.te/", meaning: "결과적으로", level: "C1", speechLang: "es-ES", tip: "6 syllables. Stress on MEN: con-se-kwen-te-MEN-te." },
    { word: "Indiscutiblemente", ipa: "/in.dis.ku.ti.βle.ˈmen.te/", meaning: "의심할 여지 없이", level: "C1", speechLang: "es-ES", tip: "7 syllables. The 'bl' cluster flows smoothly in Spanish." },
    { word: "Contemporáneo", ipa: "/kon.tem.poˈɾa.ne.o/", meaning: "현대적인", level: "C1", speechLang: "es-ES", tip: "6 syllables. Stress on RA: con-tem-po-RA-ne-o." },
    // ── C2 Mastery ────────────────────────────────────────────────────────────
    { word: "Otorrinolaringólogo", ipa: "/o.to.ri.no.la.ɾiŋˈɡo.lo.ɣo/", meaning: "이비인후과 의사", level: "C2", speechLang: "es-ES", tip: "9 syllables! 'rr' and 'r' need careful distinction. Go slow first." },
    { word: "Esternocleidomastoideo", ipa: "/es.ter.no.klei.ðo.mas.toiˈðe.o/", meaning: "흉쇄유돌근 (근육)", level: "C2", speechLang: "es-ES", tip: "10 syllables. A famous Spanish tongue twister word. Master it slowly." },
  ],
  korean: [
    // ── A1 Beginner ──────────────────────────────────────────────────────────
    { word: "안녕하세요", ipa: "/an.njʌŋ.ha.se.jo/", meaning: "Hello (formal)", level: "A1", speechLang: "ko-KR", tip: "Rise slightly in pitch on the last syllable." },
    { word: "감사합니다", ipa: "/kam.sa.ham.ni.da/", meaning: "Thank you (formal)", level: "A1", speechLang: "ko-KR", tip: "Keep each syllable even. No stress accent like English." },
    { word: "죄송합니다", ipa: "/tɕø.soŋ.ham.ni.da/", meaning: "I'm sorry (formal)", level: "A1", speechLang: "ko-KR", tip: "The 죄 vowel is like a rounded 'e'. Lips forward." },
    { word: "네", ipa: "/ne/", meaning: "Yes", level: "A1", speechLang: "ko-KR", tip: "Short and clear. Sounds like 'neh'." },
    { word: "아니요", ipa: "/a.ni.jo/", meaning: "No", level: "A1", speechLang: "ko-KR", tip: "Three syllables: a-ni-yo. Falling tone at the end." },
    { word: "물", ipa: "/mul/", meaning: "Water", level: "A1", speechLang: "ko-KR", tip: "The ㅡ vowel (ɯ) is pronounced in the back of the mouth." },
    { word: "커피", ipa: "/kʰʌ.pʰi/", meaning: "Coffee", level: "A1", speechLang: "ko-KR", tip: "Both consonants are aspirated: kh and ph." },
    { word: "친구", ipa: "/tɕʰin.gu/", meaning: "Friend", level: "A1", speechLang: "ko-KR", tip: "The ㅈ (tɕ) is palatalized — like 'ch'." },
    { word: "행복해요", ipa: "/hɛŋ.bo.kʰɛ.jo/", meaning: "I'm happy", level: "A1", speechLang: "ko-KR", tip: "The ㄱ before ㅎ becomes aspirated: -kh-." },
    { word: "좋아요", ipa: "/tɕo.a.jo/", meaning: "Good / I like it", level: "A1", speechLang: "ko-KR", tip: "The 좋 + 아 merge: 조아요. The ㅎ is silent between vowels." },
    { word: "집", ipa: "/tɕip/", meaning: "Home / House", level: "A1", speechLang: "ko-KR", tip: "The final consonant ㅂ is unreleased at the end." },
    { word: "음식", ipa: "/ɯm.sik/", meaning: "Food", level: "A1", speechLang: "ko-KR", tip: "The ㅡ vowel is key: lips unrounded, back of mouth." },
    { word: "반갑습니다", ipa: "/pan.gap.sɯm.ni.da/", meaning: "Nice to meet you", level: "A1", speechLang: "ko-KR", tip: "The 반 is lower in pitch, 갑 rises slightly." },
    { word: "이름", ipa: "/i.ɾɯm/", meaning: "Name", level: "A1", speechLang: "ko-KR", tip: "The ㄹ between vowels is a flap — like a soft 'r'." },
    { word: "책", ipa: "/tɕʰɛk/", meaning: "Book", level: "A1", speechLang: "ko-KR", tip: "Aspirated ㅊ (ch) — push air out firmly." },
    { word: "날씨", ipa: "/nal.s͈i/", meaning: "Weather", level: "A1", speechLang: "ko-KR", tip: "The ㅆ is a tensed consonant — tense your throat slightly." },

    { word: "밥", ipa: "/pap/", meaning: "Rice/Meal", level: "A1", speechLang: "ko-KR", tip: "One syllable: BAP. The ㅂ aspirates slightly at the end." },
    { word: "사람", ipa: "/sa.ɾam/", meaning: "Person", level: "A1", speechLang: "ko-KR", tip: "Two syllables: SA-ram. The ㄹ flaps between the syllables." },
    { word: "엄마", ipa: "/ʌm.ma/", meaning: "Mom", level: "A1", speechLang: "ko-KR", tip: "Two syllables: UM-ma. Nasalized double 'm' at the junction." },
    { word: "아빠", ipa: "/a.p͈a/", meaning: "Dad", level: "A1", speechLang: "ko-KR", tip: "Two syllables: A-ppa. The ㅃ is a tensed 'pp' sound." },
    { word: "고양이", ipa: "/ko.jaŋ.i/", meaning: "Cat", level: "A1", speechLang: "ko-KR", tip: "Three syllables: ko-YANG-i. The 이 at the end is light." },
    { word: "강아지", ipa: "/kaŋ.a.dʑi/", meaning: "Puppy", level: "A1", speechLang: "ko-KR", tip: "Three syllables: KANG-a-ji. 'ㅈ' is palatalized before 'ㅣ'." },
    { word: "나무", ipa: "/na.mu/", meaning: "Tree", level: "A1", speechLang: "ko-KR", tip: "Two syllables: NA-mu. Each vowel is pure and short." },
    { word: "하늘", ipa: "/ha.nɯl/", meaning: "Sky", level: "A1", speechLang: "ko-KR", tip: "Two syllables: HA-neul. The 'ㅡ' (ɯ) vowel: back of the mouth." },
    { word: "바다", ipa: "/pa.da/", meaning: "Sea", level: "A1", speechLang: "ko-KR", tip: "Two syllables: PA-da. Clean, open vowels throughout." },
    { word: "꽃", ipa: "/k͈ot/", meaning: "Flower", level: "A1", speechLang: "ko-KR", tip: "One syllable: KKOT. The ㄲ is a tensed 'kk' sound." },
    { word: "눈", ipa: "/nun/", meaning: "Eye / Snow", level: "A1", speechLang: "ko-KR", tip: "One syllable: NOON. Context tells you if it means 'eye' or 'snow'." },
    // ── A2 Elementary ────────────────────────────────────────────────────────
    { word: "도와주세요", ipa: "/to.wa.dʑu.se.jo/", meaning: "Please help me", level: "A2", speechLang: "ko-KR", tip: "The 와 smoothly follows 도 — link them together." },
    { word: "사랑해요", ipa: "/sa.ɾaŋ.hɛ.jo/", meaning: "I love you", level: "A2", speechLang: "ko-KR", tip: "The ɾ is a flap — similar to the 'd' in 'ladder'." },
    { word: "맛있어요", ipa: "/ma.si.sʌ.jo/", meaning: "It's delicious", level: "A2", speechLang: "ko-KR", tip: "The ㅅ before a vowel becomes an 's' sound." },
    { word: "어디에 있어요?", ipa: "/ʌ.di.e i.sʌ.jo/", meaning: "Where is it?", level: "A2", speechLang: "ko-KR", tip: "The ʌ vowel is in the back of the mouth, not the front." },
    { word: "얼마예요?", ipa: "/ʌl.ma.je.jo/", meaning: "How much is it?", level: "A2", speechLang: "ko-KR", tip: "Raise pitch at the end to signal a question." },
    { word: "여행", ipa: "/jʌ.hɛŋ/", meaning: "Travel", level: "A2", speechLang: "ko-KR", tip: "The ㅇ before ㅎ links vowels: yuh-HENG." },
    { word: "공항", ipa: "/koŋ.haŋ/", meaning: "Airport", level: "A2", speechLang: "ko-KR", tip: "Two syllables, both ending in ŋ: KONG-HANG." },
    { word: "음악", ipa: "/ɯ.mak/", meaning: "Music", level: "A2", speechLang: "ko-KR", tip: "The ㄱ at the end is unreleased: uh-MAK." },
    { word: "가족", ipa: "/ka.dʑok/", meaning: "Family", level: "A2", speechLang: "ko-KR", tip: "The ㅈ between vowels softens to dʑ." },
    { word: "학교", ipa: "/hak.k͈jo/", meaning: "School", level: "A2", speechLang: "ko-KR", tip: "The ㄱ+ㄱ creates a tensed 'kk' sound: HAK-KKYO." },
    { word: "같이", ipa: "/ka.tʰi/", meaning: "Together", level: "A2", speechLang: "ko-KR", tip: "The 같 + 이 liaison: the ㅌ shifts to the next syllable: GA-thi." },
    { word: "기억하다", ipa: "/ki.ʌk.ha.da/", meaning: "To remember", level: "A2", speechLang: "ko-KR", tip: "The ㄱ+ㅎ liaison creates aspiration: ki-AK-ha-da." },

    { word: "재미있다", ipa: "/tɕɛ.mi.it.da/", meaning: "Fun/Interesting", level: "A2", speechLang: "ko-KR", tip: "Four syllables. The 있 + 다 glides together smoothly: jeh-mi-IT-da." },
    { word: "지하철", ipa: "/tɕi.ha.tɕʰʌl/", meaning: "Subway", level: "A2", speechLang: "ko-KR", tip: "Three syllables: ji-ha-CHEOL. The ㄹ at the end is lateral." },
    { word: "버스", ipa: "/pʌ.sɯ/", meaning: "Bus", level: "A2", speechLang: "ko-KR", tip: "Two syllables: BUH-seu. The final ㅡ is a back vowel." },
    { word: "시장", ipa: "/ɕi.dʑaŋ/", meaning: "Market", level: "A2", speechLang: "ko-KR", tip: "Two syllables: SHI-jang. The ㅅ palatalizes before ㅣ." },
    { word: "병원", ipa: "/pjʌŋ.wʌn/", meaning: "Hospital", level: "A2", speechLang: "ko-KR", tip: "Two syllables: BYUNG-won. The ㅂ+ㅕ blends smoothly." },
    { word: "은행", ipa: "/ɯn.hɛŋ/", meaning: "Bank", level: "A2", speechLang: "ko-KR", tip: "Two syllables: UN-heng. The ㅡ vowel is central-back." },
    { word: "편의점", ipa: "/pʰjʌ.nɯi.dʑʌm/", meaning: "Convenience store", level: "A2", speechLang: "ko-KR", tip: "Three syllables: PYUH-nui-jum. The 의 vowel: spread lips." },
    // ── B1 Intermediate ──────────────────────────────────────────────────────
    { word: "잘 부탁드립니다", ipa: "/tɕal pu.tʰak.tɯ.rim.ni.da/", meaning: "Please look after me", level: "B1", speechLang: "ko-KR", tip: "Common phrase when meeting someone new. Say it warmly." },
    { word: "대화", ipa: "/tɛ.ɦwa/", meaning: "Conversation", level: "B1", speechLang: "ko-KR", tip: "The ㅎ weakens between vowels to a breathy 'ɦ': TEH-hwa." },
    { word: "경험", ipa: "/kjʌŋ.hʌm/", meaning: "Experience", level: "B1", speechLang: "ko-KR", tip: "The ㄱ+ㅎ creates aspiration: KYUNG-hum." },
    { word: "기회", ipa: "/ki.hwe/", meaning: "Opportunity", level: "B1", speechLang: "ko-KR", tip: "The ㅎ links smoothly: ki-HWE. Practice the 'wh' glide." },
    { word: "지식", ipa: "/tɕi.sik/", meaning: "Knowledge", level: "B1", speechLang: "ko-KR", tip: "The ㅈ is palatalized before ㅣ: CHI-sik." },
    { word: "환경", ipa: "/ɦwan.gjʌŋ/", meaning: "Environment", level: "B1", speechLang: "ko-KR", tip: "The 'hw' glide at the start is a rounded labial sound: HWAN-gyung." },
    { word: "소통하다", ipa: "/so.tʰoŋ.ha.da/", meaning: "To communicate", level: "B1", speechLang: "ko-KR", tip: "4 syllables. The ㅎ in 하 links with ŋ: so-TONG-ha-da." },
    { word: "발음", ipa: "/pa.ɾɯm/", meaning: "Pronunciation", level: "B1", speechLang: "ko-KR", tip: "The ㄹ flap links 발 to 음: PA-rum." },
    { word: "도전하다", ipa: "/to.dʑʌn.ha.da/", meaning: "To challenge oneself", level: "B1", speechLang: "ko-KR", tip: "4 syllables. The ㅎ in 하 provides a breathy transition." },

    { word: "교육", ipa: "/kjo.juk/", meaning: "Education", level: "B1", speechLang: "ko-KR", tip: "Two syllables: KYO-yuk. The ㄱ+ㅇ liaison voices the stop." },
    { word: "정부", ipa: "/tɕʌŋ.bu/", meaning: "Government", level: "B1", speechLang: "ko-KR", tip: "Two syllables: JUNG-bu. The ㅈ palatalizes before ㅓ." },
    { word: "기술", ipa: "/ki.sul/", meaning: "Technology/Skill", level: "B1", speechLang: "ko-KR", tip: "Two syllables: KI-sul. The ㄹ at end is a lateral L." },
    { word: "문화", ipa: "/mun.ɦwa/", meaning: "Culture", level: "B1", speechLang: "ko-KR", tip: "Two syllables: MUN-hwa. The ㅎ weakens to a breathy 'ɦ'." },
    { word: "한글", ipa: "/han.gɯl/", meaning: "Korean alphabet", level: "B1", speechLang: "ko-KR", tip: "Two syllables: HAN-geul. The ㄹ at end is a lateral L." },
    { word: "존댓말", ipa: "/tɕon.dɛn.mal/", meaning: "Formal speech", level: "B1", speechLang: "ko-KR", tip: "Three syllables: JON-den-mal. The ㄷ nasalizes before ㅁ." },
    { word: "반말", ipa: "/pan.mal/", meaning: "Informal speech", level: "B1", speechLang: "ko-KR", tip: "Two syllables: BAN-mal. The ㄴ+ㅁ junction is nasal to nasal." },
    { word: "감사드립니다", ipa: "/kam.sa.dɯ.rim.ni.da/", meaning: "Thank you (very formal)", level: "B1", speechLang: "ko-KR", tip: "Six syllables. Humble form — say each syllable evenly." },
    { word: "실례합니다", ipa: "/sil.lje.ham.ni.da/", meaning: "Excuse me (formal)", level: "B1", speechLang: "ko-KR", tip: "Five syllables: SIL-lye-ham-ni-da. The ㄹ+ㄹ liaison creates a long L." },
    { word: "가능성", ipa: "/ka.nɯŋ.sʌŋ/", meaning: "Possibility", level: "B1", speechLang: "ko-KR", tip: "Three syllables: ka-NUNG-sung. The ㅇ+ㅅ junction flows naturally." },
    { word: "불가능하다", ipa: "/pul.ka.nɯŋ.ha.da/", meaning: "Impossible", level: "B1", speechLang: "ko-KR", tip: "Five syllables: BUL-ga-nung-ha-da. The ㄱ aspirates after ㄹ." },
    { word: "약속", ipa: "/jak.s͈ok/", meaning: "Promise/Appointment", level: "B1", speechLang: "ko-KR", tip: "Two syllables: YAK-ssok. The ㄱ+ㅅ creates a tensed 'ss'." },
    { word: "사회", ipa: "/sa.ɦwe/", meaning: "Society", level: "B1", speechLang: "ko-KR", tip: "Two syllables: SA-hwe. The ㅎ weakens between syllables." },
    { word: "역사", ipa: "/jʌk.sa/", meaning: "History", level: "B1", speechLang: "ko-KR", tip: "Two syllables: YUCK-sa. The ㄱ at end goes into ㅅ." },
    // ── B2 Upper Intermediate ─────────────────────────────────────────────────
    { word: "책임감", ipa: "/tɕʰɛ.gim.kam/", meaning: "Sense of responsibility", level: "B2", speechLang: "ko-KR", tip: "3 syllables. The ㄱ+ㅇ link creates voiced stop: CHEK-im-gam." },
    { word: "독립심", ipa: "/toŋ.nip.sim/", meaning: "Independent spirit", level: "B2", speechLang: "ko-KR", tip: "3 syllables. ㄱ+ㄹ nasalizes: DONG-nip-sim." },
    { word: "중요하다", ipa: "/tɕuŋ.jo.ha.da/", meaning: "To be important", level: "B2", speechLang: "ko-KR", tip: "4 syllables. The ㅇ+ㅎ liaison: JUNG-yo-ha-da." },
    { word: "성취감", ipa: "/sʌŋ.tɕʰwi.gam/", meaning: "Sense of achievement", level: "B2", speechLang: "ko-KR", tip: "3 syllables. The ㅊ is aspirated: SUNG-chwi-gam." },
    { word: "의사소통", ipa: "/ɯi.sa.so.tʰoŋ/", meaning: "Communication", level: "B2", speechLang: "ko-KR", tip: "4 syllables. The 의 vowel: lips spread, tongue back — ɯi." },

    { word: "세련되다", ipa: "/se.ɾjʌn.dwe.da/", meaning: "To be sophisticated/refined", level: "B2", speechLang: "ko-KR", tip: "Four syllables: SE-ryun-dwe-da. The ㄹ+ㅇ liaison flaps smoothly." },
    { word: "창의적이다", ipa: "/tɕʰaŋ.ɯi.dʑʌ.gi.da/", meaning: "To be creative", level: "B2", speechLang: "ko-KR", tip: "Five syllables: CHANG-ui-juk-i-da. The 의 vowel is subtle." },
    { word: "혁신적이다", ipa: "/hjʌk.sin.dʑʌ.gi.da/", meaning: "To be innovative", level: "B2", speechLang: "ko-KR", tip: "Five syllables: HYUK-sin-juk-i-da. ㄱ+ㅅ junction: aspirated." },
    { word: "인내심", ipa: "/in.nɛ.sim/", meaning: "Patience/Perseverance", level: "B2", speechLang: "ko-KR", tip: "Three syllables: IN-neh-sim. The ㄴ+ㄴ double nasal." },
    { word: "자아실현", ipa: "/tɕa.a.sil.hjʌn/", meaning: "Self-actualization", level: "B2", speechLang: "ko-KR", tip: "Four syllables: JA-a-sil-hyun. The ㄹ+ㅎ creates aspiration." },
    { word: "민주주의", ipa: "/min.dʑu.dʑu.ɯi/", meaning: "Democracy", level: "B2", speechLang: "ko-KR", tip: "Four syllables: MIN-ju-ju-ui. Two ㅈ sounds. Final 의 is subtle." },
    { word: "국제관계", ipa: "/kuk.tɕe.gwan.gje/", meaning: "International relations", level: "B2", speechLang: "ko-KR", tip: "Four syllables: KUK-je-gwan-gye. ㄱ+ㅈ liaison at start." },
    { word: "지속가능하다", ipa: "/tɕi.sok.ka.nɯŋ.ha.da/", meaning: "To be sustainable", level: "B2", speechLang: "ko-KR", tip: "Six syllables: ji-SOK-ga-nung-ha-da. A long compound word — pace yourself." },
    // ── C1 Advanced ───────────────────────────────────────────────────────────
    { word: "그럼에도 불구하고", ipa: "/kɯ.ɾʌ.me.do pul.gu.ha.go/", meaning: "Nevertheless", level: "C1", speechLang: "ko-KR", tip: "8 syllables. Two phrases linked: GEU-rum-e-do BOUL-gu-ha-go." },
    { word: "전례 없는", ipa: "/tɕʌl.lje ʌm.nɯn/", meaning: "Unprecedented", level: "C1", speechLang: "ko-KR", tip: "The 례+없 junction: LL liaison sounds like 녤: JULL-ye UMN-nun." },
    { word: "현대적인", ipa: "/hjʌn.dɛ.dʑʌ.gin/", meaning: "Contemporary / Modern", level: "C1", speechLang: "ko-KR", tip: "4 syllables. ㄷ+ㅈ liaison: HYUN-deh-JUK-in." },
    // ── C2 Mastery ────────────────────────────────────────────────────────────
    { word: "국제화", ipa: "/kuk.tɕe.ɦwa/", meaning: "Internationalization", level: "C2", speechLang: "ko-KR", tip: "3 syllables but with complex liaisons: KUK-je-hwa." },
    { word: "민주주의", ipa: "/min.dʑu.dʑu.ɯi/", meaning: "Democracy", level: "C2", speechLang: "ko-KR", tip: "4 syllables. Two ㅈ sounds: MIN-ju-ju-ui. The final 의 is subtle." },
  ],
};

const LANG_TABS: { key: LangTab; label: string; flag: string; color: string }[] = [
  { key: "korean", label: "Korean", flag: "🇰🇷", color: C.gold },
  { key: "english", label: "English", flag: "🇬🇧", color: "#6B9DFF" },
  { key: "spanish", label: "Spanish", flag: "🇪🇸", color: "#FF9D6B" },
];

function getScoreInfo(score: number): { label: string; color: string; emoji: string } {
  if (score >= 90) return { label: "Excellent!", color: "#10B981", emoji: "🎉" };
  if (score >= 75) return { label: "Good Job!", color: "#F59E0B", emoji: "😊" };
  return { label: "Keep Practicing", color: "#EF4444", emoji: "💪" };
}

let _pronunciationAudio: HTMLAudioElement | null = null;
let _nativePronSound: Audio.Sound | null = null;

// ── TTS preload cache ─────────────────────────────────────────
// Keyed by "text::lang". Audio is fetched in the background so
// pressing the listen button plays instantly from cache.
const _pronWebCache    = new Map<string, string>();       // objectURL
const _pronNativeCache = new Map<string, Audio.Sound>();  // expo-av Sound

async function preloadPronunciationTTS(text: string, lang: string, apiBase: string) {
  const key = `${text}::${lang}`;
  const url = new URL("/api/pronunciation-tts", apiBase);
  url.searchParams.set("text", text);
  url.searchParams.set("lang", lang);
  const urlStr = url.toString();
  if (Platform.OS === "web") {
    if (_pronWebCache.has(key)) return;
    try {
      const res = await fetch(urlStr);
      if (!res.ok) return;
      const blob = await res.blob();
      _pronWebCache.set(key, URL.createObjectURL(blob));
    } catch {}
  } else {
    if (_pronNativeCache.has(key)) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: urlStr },
        { shouldPlay: false, volume: 1.0 }
      );
      _pronNativeCache.set(key, sound);
    } catch {}
  }
}

async function playPronunciationTTS(text: string, lang: string, apiBase: string) {
  try {
    const key = `${text}::${lang}`;
    const url = new URL("/api/pronunciation-tts", apiBase);
    url.searchParams.set("text", text);
    url.searchParams.set("lang", lang);
    const urlStr = url.toString();

    if (Platform.OS === "web") {
      if (_pronunciationAudio) {
        _pronunciationAudio.pause();
        _pronunciationAudio.src = "";
        _pronunciationAudio = null;
      }
      const cachedUrl = _pronWebCache.get(key);
      if (cachedUrl) {
        // Play instantly from preloaded blob URL
        const audio = new (window as any).Audio(cachedUrl) as HTMLAudioElement;
        _pronunciationAudio = audio;
        audio.onended = () => { _pronunciationAudio = null; };
        audio.onerror = () => { _pronunciationAudio = null; };
        await audio.play();
      } else {
        // Fallback: fetch on demand
        const res = await fetch(urlStr);
        if (!res.ok) throw new Error(`TTS ${res.status}`);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        _pronWebCache.set(key, objectUrl);
        const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
        _pronunciationAudio = audio;
        audio.onended = () => { _pronunciationAudio = null; };
        audio.onerror = () => { _pronunciationAudio = null; };
        await audio.play();
      }
    } else {
      if (_nativePronSound) {
        await _nativePronSound.stopAsync().catch(() => {});
        await _nativePronSound.unloadAsync().catch(() => {});
        _nativePronSound = null;
      }
      // Ensure audio mode is set for playback (recording may have left allowsRecordingIOS: true)
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const cached = _pronNativeCache.get(key);
      if (cached) {
        // Seek to start and replay the preloaded sound
        _nativePronSound = cached;
        await cached.setPositionAsync(0);
        await cached.playAsync();
        cached.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) { _nativePronSound = null; }
        });
      } else {
        // Fallback: create on demand
        const { sound } = await Audio.Sound.createAsync({ uri: urlStr }, { shouldPlay: true, volume: 1.0 });
        _pronNativeCache.set(key, sound);
        _nativePronSound = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) { _nativePronSound = null; }
        });
      }
    }
  } catch (err) {
    console.warn("Pronunciation TTS error:", err);
  }
}

const PRON_LEVELS: Phrase["level"][] = ["A1", "A2", "B1", "B2"];
const PRON_LEVEL_THRESHOLDS = [0, 30, 60, 90]; // assessments needed to reach each level

function countToPronLevel(count: number): Phrase["level"] {
  if (count >= 90) return "B2";
  if (count >= 60) return "B1";
  if (count >= 30) return "A2";
  return "A1";
}

function pronLevelProgress(count: number): { current: Phrase["level"]; next: Phrase["level"] | null; done: number; total: number } {
  const current = countToPronLevel(count);
  const idx = PRON_LEVELS.indexOf(current);
  if (idx >= PRON_LEVELS.length - 1) return { current, next: null, done: count - 90, total: 0 };
  const baseCount = PRON_LEVEL_THRESHOLDS[idx];
  const nextCount = PRON_LEVEL_THRESHOLDS[idx + 1];
  return { current, next: PRON_LEVELS[idx + 1], done: count - baseCount, total: nextCount - baseCount };
}

function buildSession(
  lang: LangTab,
  weakWords: string[],
  lastSeenWords: string[],
  pronLevel: Phrase["level"],
  lastWord?: string
): Phrase[] {
  const all = PHRASE_SETS[lang];
  const weakSet = new Set(weakWords);
  const lastSet = new Set(lastSeenWords);
  const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  // STRICTLY filter to the exact current level only — never mix levels
  const userCefr: Phrase["level"] = PRON_LEVELS.includes(pronLevel) ? pronLevel : "B2";
  const levelWords = all.filter((p) => p.level === userCefr);

  const freshFirst = (arr: Phrase[]) => {
    const notSeen = arr.filter((p) => !lastSet.has(p.word));
    const seen = arr.filter((p) => lastSet.has(p.word));
    return [...shuffle(notSeen), ...shuffle(seen)];
  };

  // Weak words at this level come first, then fresh words at this level
  const weakAtLevel = shuffle(levelWords.filter((p) => weakSet.has(p.word)));
  const freshAtLevel = freshFirst(levelWords.filter((p) => !weakSet.has(p.word)));

  const pool = [...weakAtLevel, ...freshAtLevel];

  const seenSet = new Set<string>();
  const unique: Phrase[] = [];
  for (const p of pool) {
    if (!seenSet.has(p.word)) { seenSet.add(p.word); unique.push(p); }
    if (unique.length >= SESSION_SIZE) break;
  }

  // Fallback: if not enough words at this level, cycle through all level words shuffled
  if (unique.length < SESSION_SIZE) {
    for (const p of shuffle(levelWords)) {
      if (!seenSet.has(p.word)) { seenSet.add(p.word); unique.push(p); }
      if (unique.length >= SESSION_SIZE) break;
    }
  }

  // Anti-repetition: if the first word equals the last practiced word, rotate it to second position
  if (lastWord && unique.length > 1 && unique[0].word === lastWord) {
    const [first, ...rest] = unique;
    unique.length = 0;
    unique.push(...rest, first);
  }

  return unique;
}

type RecordState = "idle" | "listening" | "processing" | "done";

export default function SpeakScreen() {
  const insets = useSafeAreaInsets();
  const { t, nativeLanguage, learningLanguage, stats, updateStats } = useLanguage();
  const [xpGain, setXpGain] = useState(0);
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const nativeLang = (nativeLanguage ?? "english") as NativeLanguage;

  const rudyListeningMsg = nativeLang === "korean"
    ? "루디가 듣고 있어요… 🦊"
    : nativeLang === "spanish"
    ? "Rudy está escuchando… 🦊"
    : "Rudy is listening… 🦊";

  const visibleTabs = learningLanguage && learningLanguage !== nativeLang
    ? LANG_TABS.filter((tab) => tab.key === learningLanguage)
    : LANG_TABS.filter((tab) => tab.key !== nativeLang);

  const [activeLang, setActiveLang] = useState<LangTab>(() => {
    const ll = learningLanguage as LangTab | null;
    if (ll && ll !== nativeLang) return ll;
    return (visibleTabs[0]?.key ?? "english") as LangTab;
  });

  const [pronLevel, setPronLevel] = useState<Phrase["level"]>("A1");
  const [pronCount, setPronCount] = useState(0);
  const [levelUpShow, setLevelUpShow] = useState(false);
  const [levelUpNewLevel, setLevelUpNewLevel] = useState<Phrase["level"]>("A2");
  const pronLevelRef = useRef<Phrase["level"]>("A1");
  const pronCountRef = useRef(0);

  const [sessionWords, setSessionWords] = useState<Phrase[]>([]);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [weakWords, setWeakWords] = useState<string[]>([]);

  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [fluencyScore, setFluencyScore] = useState<number | null>(null);
  const [completenessScore, setCompletenessScore] = useState<number | null>(null);
  const [gptFeedback, setGptFeedback] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [wordResults, setWordResults] = useState<{ word: string; score: number; errorType: string; phonemes?: { phoneme: string; score: number }[] }[]>([]);
  const [sttError, setSttError] = useState("");
  const [hasListened, setHasListened] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const recordStateRef = useRef<RecordState>("idle");
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nativeRecordingRef = useRef<Audio.Recording | null>(null);

  const weakKey = `speak_weak_words_${activeLang}`;
  const lastSeenKey = `speak_last_seen_${activeLang}`;

  const resetPracticeState = useCallback(() => {
    if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }
    if (mediaRecorderRef.current?.state === "recording") { mediaRecorderRef.current.stop(); }
    if (nativeRecordingRef.current) {
      nativeRecordingRef.current.stopAndUnloadAsync().catch(() => {});
      nativeRecordingRef.current = null;
    }
    setRecordState("idle");
    recordStateRef.current = "idle";
    setScore(null);
    setAccuracyScore(null);
    setFluencyScore(null);
    setCompletenessScore(null);
    setGptFeedback("");
    setRecognizedText("");
    setWordResults([]);
    setSttError("");
    setHasListened(false);
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    scoreAnim.setValue(0);
  }, [pulseAnim, scoreAnim]);

  const loadSession = useCallback(async (lang: LangTab) => {
    try {
      const [weakRaw, lastRaw, countRaw, lastWordRaw] = await Promise.all([
        AsyncStorage.getItem(`speak_weak_words_${lang}`),
        AsyncStorage.getItem(`speak_last_seen_${lang}`),
        AsyncStorage.getItem(`pron_count_${lang}`),
        AsyncStorage.getItem(`pron_last_word_${lang}`),
      ]);
      const weak: string[] = weakRaw ? JSON.parse(weakRaw) : [];
      const last: string[] = lastRaw ? JSON.parse(lastRaw) : [];
      const count = countRaw ? parseInt(countRaw, 10) : 0;
      const lastWord: string | undefined = lastWordRaw ?? undefined;
      const level = countToPronLevel(count);
      setWeakWords(weak);
      setPronCount(count);
      setPronLevel(level);
      pronLevelRef.current = level;
      pronCountRef.current = count;
      const session = buildSession(lang, weak, last, level, lastWord);
      setSessionWords(session);
      setSessionIdx(0);
      setSessionComplete(false);
      resetPracticeState();
    } catch {}
  }, [resetPracticeState]);

  useFocusEffect(useCallback(() => {
    loadSession(activeLang);
  }, [activeLang]));

  useEffect(() => {
    if (learningLanguage && learningLanguage !== nativeLang) {
      setActiveLang(learningLanguage as LangTab);
    }
  }, [learningLanguage]);

  const phrase = sessionWords[sessionIdx];
  const tabInfo = LANG_TABS.find((tab) => tab.key === activeLang)!;

  // Preload TTS audio for the current phrase so the listen button plays instantly
  useEffect(() => {
    if (!phrase) return;
    preloadPronunciationTTS(phrase.word, phrase.speechLang, getApiUrl());
    // Also preload the next phrase so switching is seamless
    const next = sessionWords[sessionIdx + 1];
    if (next) preloadPronunciationTTS(next.word, next.speechLang, getApiUrl());
  }, [sessionIdx, phrase?.word, phrase?.speechLang]);

  const switchLang = (lang: LangTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveLang(lang);
    loadSession(lang);
  };

  const saveWeakWord = async (word: string) => {
    try {
      const raw = await AsyncStorage.getItem(weakKey);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(word)) {
        list.push(word);
        await AsyncStorage.setItem(weakKey, JSON.stringify(list));
        setWeakWords(list);
      }
    } catch {}
  };

  const removeWeakWord = async (word: string) => {
    try {
      const raw = await AsyncStorage.getItem(weakKey);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const updated = list.filter((w) => w !== word);
      await AsyncStorage.setItem(weakKey, JSON.stringify(updated));
      setWeakWords(updated);
    } catch {}
  };

  const handleListen = () => {
    if (!phrase) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasListened(true);
    playPronunciationTTS(phrase.word, phrase.speechLang, getApiUrl());
  };

  const startPulse = () => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.14, duration: 550, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const processScoreData = (data: any) => {
    const scoreVal = data.score ?? 0;
    setScore(scoreVal);
    setAccuracyScore(data.accuracyScore ?? null);
    setFluencyScore(data.fluencyScore ?? null);
    setCompletenessScore(data.completenessScore ?? null);
    setGptFeedback(data.feedback ?? "");
    setRecognizedText(data.recognizedText ?? "");
    setWordResults(data.words ?? []);
    Animated.timing(scoreAnim, { toValue: scoreVal / 100, duration: 900, useNativeDriver: false }).start();
    return scoreVal;
  };

  const stopNativeRecording = async () => {
    const rec = nativeRecordingRef.current;
    if (!rec) return;
    stopPulse();
    setRecordState("processing");
    recordStateRef.current = "processing";
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await rec.stopAndUnloadAsync();
      // 300ms delay — ensure file is fully flushed to disk before reading
      await new Promise((r) => setTimeout(r, 300));
      const uri = rec.getURI();
      nativeRecordingRef.current = null;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      if (!uri) throw new Error("No audio URI");
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Empty audio guard — show 0% instead of sending to Azure
      if (!base64 || base64.length < 2000) {
        setScore(0);
        setSttError("음성이 감지되지 않았어요. 다시 시도해 주세요.");
        setRecordState("done");
        recordStateRef.current = "done";
        return;
      }
      const nativeMime = Platform.OS === "ios" ? "audio/wav" : "audio/mp4";
      const apiUrl = new URL("/api/pronunciation-assess", getApiUrl()).toString();
      const apiRes = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: phrase?.word ?? "",
          lang: phrase?.speechLang ?? "en-US",
          audio: base64,
          mimeType: nativeMime,
        }),
      });
      if (!apiRes.ok) throw new Error(`HTTP ${apiRes.status}`);
      const data = await apiRes.json();
      const scoreVal = processScoreData(data);
      if (scoreVal < WEAK_THRESHOLD) { await saveWeakWord(phrase?.word ?? ""); }
      else { await removeWeakWord(phrase?.word ?? ""); }
      const xpEarned = scoreVal >= 90 ? 30 : 15;
      setXpGain(xpEarned);
      updateStats({ xp: statsRef.current.xp + xpEarned });
      const newCount = pronCountRef.current + 1;
      pronCountRef.current = newCount;
      setPronCount(newCount);
      await AsyncStorage.setItem(`pron_count_${activeLang}`, String(newCount)).catch(() => {});
      await AsyncStorage.setItem(`pron_last_word_${activeLang}`, phrase?.word ?? "").catch(() => {});
      const newLevel = countToPronLevel(newCount);
      if (newLevel !== pronLevelRef.current) {
        pronLevelRef.current = newLevel;
        setPronLevel(newLevel);
        setLevelUpNewLevel(newLevel);
        setLevelUpShow(true);
      }
    } catch {
      // Always restore audio mode so NPC/tutor sounds work after a failed recording
      Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, shouldDuckAndroid: false, playThroughEarpieceAndroid: false }).catch(() => {});
      setSttError("채점 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setRecordState("done");
      recordStateRef.current = "done";
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRecord = () => {
    if (!phrase || recordState === "processing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Second tap while recording → stop early
    if (recordState === "listening") {
      if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }
      if (Platform.OS !== "web" && nativeRecordingRef.current) {
        stopNativeRecording();
      } else if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    // Native path (iOS / Android) — use expo-av Audio.Recording
    if (Platform.OS !== "web") {
      (async () => {
        try {
          const { granted } = await Audio.requestPermissionsAsync();
          if (!granted) {
            setSttError("마이크 권한을 허용해주세요.\n(설정 → 앱 → Enigma → 마이크)");
            setRecordState("done");
            recordStateRef.current = "done";
            return;
          }
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const recording = new Audio.Recording();
          // iOS: record as 16kHz WAV (LINEARPCM) — Azure accepts directly, no ffmpeg needed
          const recOptions: Audio.RecordingOptions = Platform.OS === "ios" ? {
            android: Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
            ios: {
              extension: ".wav",
              outputFormat: Audio.IOSOutputFormat.LINEARPCM,
              audioQuality: Audio.IOSAudioQuality.HIGH,
              sampleRate: 16000,
              numberOfChannels: 1,
              bitRate: 256000,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false,
            },
            web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
          } : Audio.RecordingOptionsPresets.HIGH_QUALITY;
          await recording.prepareToRecordAsync(recOptions);
          await recording.startAsync();
          nativeRecordingRef.current = recording;
          setRecordState("listening");
          recordStateRef.current = "listening";
          setScore(null);
          setAccuracyScore(null);
          setFluencyScore(null);
          setCompletenessScore(null);
          setGptFeedback("");
          setRecognizedText("");
          setWordResults([]);
          setSttError("");
          startPulse();
          autoStopTimerRef.current = setTimeout(() => { stopNativeRecording(); }, 8000);
        } catch {
          // Restore audio mode so other sounds (NPC, tutor) can play again
          Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, shouldDuckAndroid: false, playThroughEarpieceAndroid: false }).catch(() => {});
          setSttError("마이크를 시작할 수 없습니다. 다시 시도해 주세요.");
          setRecordState("done");
          recordStateRef.current = "done";
        }
      })();
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setSttError("이 브라우저는 마이크 녹음을 지원하지 않습니다.\nChrome을 사용해 주세요.");
      setRecordState("done");
      recordStateRef.current = "done";
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const recorder = new (window as any).MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: any) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t: any) => t.stop());
        stopPulse();
        setRecordState("processing");
        recordStateRef.current = "processing";
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });

        // Reliable base64 encoding via FileReader
        const base64: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(",")[1] ?? "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        // Empty audio guard — show 0% instead of sending to Azure
        if (!base64 || base64.length < 2000) {
          setScore(0);
          setSttError("음성이 감지되지 않았어요. 다시 시도해 주세요.");
          setRecordState("done");
          recordStateRef.current = "done";
          return;
        }
        try {
          const apiUrl = new URL("/api/pronunciation-assess", getApiUrl()).toString();
          const apiRes = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              word: phrase.word,
              lang: phrase.speechLang,
              audio: base64,
              mimeType: recorder.mimeType || "audio/webm",
            }),
          });
          if (!apiRes.ok) throw new Error(`HTTP ${apiRes.status}`);
          const data = await apiRes.json();

          const scoreVal = processScoreData(data);
          if (scoreVal < WEAK_THRESHOLD) { await saveWeakWord(phrase.word); }
          else { await removeWeakWord(phrase.word); }
          const xpEarned = scoreVal >= 90 ? 30 : 15;
          setXpGain(xpEarned);
          updateStats({ xp: statsRef.current.xp + xpEarned });
          const newCount = pronCountRef.current + 1;
          pronCountRef.current = newCount;
          setPronCount(newCount);
          await AsyncStorage.setItem(`pron_count_${activeLang}`, String(newCount)).catch(() => {});
          await AsyncStorage.setItem(`pron_last_word_${activeLang}`, phrase.word).catch(() => {});
          const newLevel = countToPronLevel(newCount);
          if (newLevel !== pronLevelRef.current) {
            pronLevelRef.current = newLevel;
            setPronLevel(newLevel);
            setLevelUpNewLevel(newLevel);
            setLevelUpShow(true);
          }
        } catch {
          setSttError("채점 중 오류가 발생했습니다. 다시 시도해 주세요.");
        } finally {
          setRecordState("done");
          recordStateRef.current = "done";
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      };

      recorder.start(100); // collect chunks every 100ms
      setRecordState("listening");
      recordStateRef.current = "listening";
      setScore(null);
      setAccuracyScore(null);
      setFluencyScore(null);
      setCompletenessScore(null);
      setGptFeedback("");
      setRecognizedText("");
      setWordResults([]);
      setSttError("");
      startPulse();

      // Auto-stop after 8 seconds
      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 8000);
    }).catch(() => {
      setSttError("마이크 권한을 허용해주세요.\n(브라우저 설정 → 마이크 허용)");
      setRecordState("done");
      recordStateRef.current = "done";
    });
  };

  const goNextWord = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextIdx = sessionIdx + 1;
    if (nextIdx >= sessionWords.length) {
      const words = sessionWords.map((p) => p.word);
      await AsyncStorage.setItem(lastSeenKey, JSON.stringify(words)).catch(() => {});
      setSessionComplete(true);
    } else {
      setSessionIdx(nextIdx);
      resetPracticeState();
    }
  };

  const goPrevWord = () => {
    if (sessionIdx === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSessionIdx((i) => i - 1);
    resetPracticeState();
  };

  const isRecording = recordState === "listening";
  const isProcessing = recordState === "processing";
  const isBusy = isRecording || isProcessing;
  const scoreInfo = score !== null ? getScoreInfo(score) : null;
  const progressPct = sessionWords.length > 0 ? (sessionIdx / sessionWords.length) * 100 : 0;

  // ── Session Complete ────────────────────────────────────────────────────────
  if (sessionComplete) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <XPToast amount={xpGain} onDone={() => setXpGain(0)} />
        <View style={[styles.completeWrap, { paddingBottom: TAB_BAR_HEIGHT + bottomPad }]}>
          <Text style={styles.completeTrophy}>🏆</Text>
          <Text style={styles.completeTitle}>Pronunciation Practice{"\n"}Complete!</Text>
          <Text style={styles.completeSub}>You practiced {sessionWords.length} words this session.</Text>
          {(() => {
            const prog = pronLevelProgress(pronCount);
            return (
              <View style={styles.pronLevelRow}>
                <View style={styles.pronLevelBadge}>
                  <Text style={styles.pronLevelBadgeText}>{prog.current}</Text>
                </View>
                {prog.next ? (
                  <Text style={styles.pronLevelHint}>{prog.done}/{prog.total} practices to {prog.next}</Text>
                ) : (
                  <Text style={styles.pronLevelHint}>Max Level Reached 🏆</Text>
                )}
              </View>
            );
          })()}
          {weakWords.length > 0 && (
            <View style={styles.weakBox}>
              <View style={styles.weakBoxHeader}>
                <Ionicons name="warning-outline" size={14} color="#EF4444" />
                <Text style={styles.weakBoxTitle}>Weak Words for Review</Text>
              </View>
              {weakWords.slice(0, 5).map((w) => (
                <Text key={w} style={styles.weakWord}>• {w}</Text>
              ))}
            </View>
          )}
          <Pressable
            style={({ pressed }) => [styles.newSessionBtn, pressed && { opacity: 0.85 }]}
            onPress={() => loadSession(activeLang)}
          >
            <LinearGradient colors={[C.gold, C.goldDark]} style={StyleSheet.absoluteFill} />
            <Ionicons name="refresh" size={18} color={C.bg1} />
            <Text style={styles.newSessionBtnText}>New Session</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!phrase) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={C.gold} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Main Screen (fixed layout, no scroll) ──────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <XPToast amount={xpGain} onDone={() => setXpGain(0)} />

      <View style={[styles.screen, { paddingBottom: TAB_BAR_HEIGHT + bottomPad }]}>

        {/* ── LEVEL UP OVERLAY ─────────────────────────────────────────────── */}
        {levelUpShow && (
          <Pressable
            style={styles.levelUpOverlay}
            onPress={() => { setLevelUpShow(false); loadSession(activeLang); }}
          >
            <View style={styles.levelUpCard}>
              <Text style={styles.levelUpEmoji}>🎉</Text>
              <Text style={styles.levelUpTitle}>Level Up!</Text>
              <Text style={styles.levelUpSub}>You've reached</Text>
              <View style={styles.levelUpBadge}>
                <Text style={styles.levelUpBadgeText}>{levelUpNewLevel}</Text>
              </View>
              <Text style={styles.levelUpHint}>Harder words unlocked!</Text>
              <Text style={styles.levelUpDismiss}>Tap to continue</Text>
            </View>
          </Pressable>
        )}

        {/* ── SECTION 1: HEADER (15%) ─────────────────────────────────────── */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{t("speak_title")}</Text>
              {/* Pronunciation level row */}
              {(() => {
                const prog = pronLevelProgress(pronCount);
                return (
                  <View style={styles.pronLevelRow}>
                    <View style={styles.pronLevelBadge}>
                      <Text style={styles.pronLevelBadgeText}>{prog.current}</Text>
                    </View>
                    {prog.next ? (
                      <Text style={styles.pronLevelHint}>
                        {prog.done}/{prog.total} → {prog.next}
                      </Text>
                    ) : (
                      <Text style={styles.pronLevelHint}>Max Level 🏆</Text>
                    )}
                  </View>
                );
              })()}
            </View>

            {visibleTabs.length > 1 && (
              <View style={styles.langTabsCompact}>
                {visibleTabs.map((tab) => {
                  const active = activeLang === tab.key;
                  return (
                    <Pressable
                      key={tab.key}
                      style={({ pressed }) => [
                        styles.langTabCompact,
                        active && { backgroundColor: tab.color },
                        pressed && { opacity: 0.8 },
                      ]}
                      onPress={() => switchLang(tab.key)}
                    >
                      <Text style={styles.langTabFlag}>{tab.flag}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Session progress bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: tabInfo.color }]} />
            </View>
            <Text style={[styles.progressLabel, { color: tabInfo.color }]}>
              {sessionIdx + 1} / {sessionWords.length}
            </Text>
          </View>
        </View>

        {/* ── SECTION 2: WORD CARD (38%) ──────────────────────────────────── */}
        <View style={styles.cardSection}>
          <View style={styles.card}>
            <LinearGradient
              colors={[tabInfo.color + "28", "transparent"]}
              style={styles.cardTopAccent}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />
            <View style={styles.cardTopRow}>
              <View style={[styles.levelBadge, { backgroundColor: tabInfo.color + "20", borderColor: tabInfo.color + "50" }]}>
                <Text style={[styles.levelText, { color: tabInfo.color }]}>{phrase.level}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.listenBtn, pressed && { opacity: 0.75 }]}
                onPress={handleListen}
                testID="listen-button"
              >
                <LinearGradient colors={[tabInfo.color, tabInfo.color + "CC"]} style={StyleSheet.absoluteFill} />
                <Ionicons name="volume-high" size={14} color="#fff" />
                <Text style={styles.listenBtnText}>{t("listen")}</Text>
              </Pressable>
            </View>

            <Text style={styles.wordText}>{phrase.word}</Text>

            <View style={styles.ipaRow}>
              <Text style={styles.ipaTag}>IPA</Text>
              <Text style={styles.ipaText}>{phrase.ipa}</Text>
            </View>

            <View style={styles.cardDivider} />
            <Text style={styles.meaningText}>{(nativeLang === "spanish" && phrase.meaningEs) ? phrase.meaningEs : phrase.meaning}</Text>
          </View>
        </View>

        {/* ── SECTION 3: TIP (12%) ────────────────────────────────────────── */}
        <View style={styles.tipSection}>
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={14} color="#F59E0B" />
            <Text style={styles.tipText} numberOfLines={2}>{phrase.tip}</Text>
          </View>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {sessionWords.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < sessionIdx && styles.dotDone,
                  i === sessionIdx && [styles.dotActive, { backgroundColor: tabInfo.color }],
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── SECTION 4: RECORDING / RESULT (25%) ────────────────────────── */}
        <View style={styles.recordSection}>
          {recordState === "done" ? (
            /* Result view */
            <ScrollView
              contentContainerStyle={styles.resultScroll}
              showsVerticalScrollIndicator={false}
            >
              {score !== null && scoreInfo ? (
                <View>
                  <View style={styles.resultRow}>
                    <View style={[styles.scoreCircle, { borderColor: scoreInfo.color }]}>
                      <Text style={[styles.scoreNumber, { color: scoreInfo.color }]}>{score}</Text>
                      <Text style={styles.scoreDenom}>/100</Text>
                    </View>

                    <View style={styles.resultRight}>
                      <Text style={[styles.scoreLabel, { color: scoreInfo.color }]}>
                        {scoreInfo.emoji} {scoreInfo.label}
                      </Text>

                      <View style={styles.scoreBarTrack}>
                        <Animated.View
                          style={[styles.scoreBarFill, {
                            width: scoreAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                            backgroundColor: scoreInfo.color,
                          }]}
                        />
                      </View>

                      {recognizedText ? (
                        <Text style={styles.heardText}>"{recognizedText}"</Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Sub-scores row */}
                  {(accuracyScore !== null || fluencyScore !== null || completenessScore !== null) && (
                    <View style={styles.subScoreRow}>
                      {accuracyScore !== null && (
                        <View style={styles.subScoreBox}>
                          <Text style={[styles.subScoreNum, { color: accuracyScore >= 75 ? "#10B981" : accuracyScore >= 50 ? "#F59E0B" : "#EF4444" }]}>{accuracyScore}</Text>
                          <Text style={styles.subScoreLabel}>정확도</Text>
                        </View>
                      )}
                      {fluencyScore !== null && (
                        <View style={styles.subScoreBox}>
                          <Text style={[styles.subScoreNum, { color: fluencyScore >= 75 ? "#10B981" : fluencyScore >= 50 ? "#F59E0B" : "#EF4444" }]}>{fluencyScore}</Text>
                          <Text style={styles.subScoreLabel}>유창성</Text>
                        </View>
                      )}
                      {completenessScore !== null && (
                        <View style={styles.subScoreBox}>
                          <Text style={[styles.subScoreNum, { color: completenessScore >= 75 ? "#10B981" : completenessScore >= 50 ? "#F59E0B" : "#EF4444" }]}>{completenessScore}</Text>
                          <Text style={styles.subScoreLabel}>완성도</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Word-level breakdown + phoneme coaching */}
                  <PhonemeCoaching
                    wordScores={wordResults}
                    nativeLang={nativeLang}
                    targetLang={activeLang}
                    speechLang={phrase.speechLang}
                    onRetry={resetPracticeState}
                  />

                  {gptFeedback ? (
                    <Text style={styles.feedbackText}>{gptFeedback}</Text>
                  ) : null}
                </View>
              ) : (
                <View style={styles.errorRow}>
                  <Ionicons name="warning-outline" size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{sttError || "음성 인식 실패. 다시 시도해 주세요."}</Text>
                </View>
              )}

              {/* Retry inline */}
              <Pressable
                style={({ pressed }) => [styles.retryChip, pressed && { opacity: 0.75 }]}
                onPress={resetPracticeState}
                testID="retry-button"
              >
                <Ionicons name="refresh" size={13} color={tabInfo.color} />
                <Text style={[styles.retryChipText, { color: tabInfo.color }]}>다시 시도</Text>
              </Pressable>
            </ScrollView>
          ) : (
            /* Mic view */
            <View style={styles.micWrap}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable
                  style={({ pressed }) => [styles.micBtn, pressed && { opacity: 0.88 }]}
                  onPress={handleRecord}
                  disabled={isProcessing}
                  testID="mic-button"
                >
                  <LinearGradient
                    colors={isRecording ? ["#FF4081", "#E91E63"] : [tabInfo.color, tabInfo.color + "CC"]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
                  />
                  {isProcessing
                    ? <ActivityIndicator size="large" color="#fff" />
                    : <Ionicons name={isRecording ? "radio-button-on" : "mic"} size={40} color="#fff" />
                  }
                </Pressable>
              </Animated.View>

              <Text style={styles.micHint}>
                {isRecording ? "녹음 중… 탭하여 정지" : isProcessing ? rudyListeningMsg : hasListened ? "탭하여 발음 녹음" : "먼저 듣기를 눌러보세요"}
              </Text>
            </View>
          )}
        </View>

        {/* ── SECTION 5: NAVIGATION (10%) ─────────────────────────────────── */}
        <View style={styles.navSection}>
          <Pressable
            style={({ pressed }) => [styles.navBtn, styles.prevBtn, sessionIdx === 0 && styles.navBtnDisabled, pressed && { opacity: 0.75 }]}
            onPress={goPrevWord}
            disabled={sessionIdx === 0}
            testID="prev-button"
          >
            <Ionicons name="arrow-back" size={16} color={sessionIdx === 0 ? C.goldDark : C.gold} />
            <Text style={[styles.navBtnText, { color: sessionIdx === 0 ? C.goldDark : C.gold }]}>Prev</Text>
          </Pressable>

          <View style={styles.navProgress}>
            <Text style={styles.navProgressText}>{sessionIdx + 1} / {sessionWords.length}</Text>
          </View>

          {recordState === "done" ? (
            <Pressable
              style={({ pressed }) => [styles.navBtn, styles.nextBtnActive, { backgroundColor: tabInfo.color }, pressed && { opacity: 0.85 }]}
              onPress={goNextWord}
              testID="next-word-button"
            >
              <Text style={styles.nextBtnText}>
                {sessionIdx + 1 >= sessionWords.length ? "완료" : "다음"}
              </Text>
              <Ionicons name={sessionIdx + 1 >= sessionWords.length ? "checkmark" : "arrow-forward"} size={16} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.navBtn, styles.nextBtnInactive, pressed && { opacity: 0.75 }]}
              onPress={goNextWord}
              testID="next-button"
            >
              <Text style={[styles.navBtnText, { color: C.goldDim }]}>다음</Text>
              <Ionicons name="arrow-forward" size={16} color={C.goldDim} />
            </Pressable>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg1,
  },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },

  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 8 : 0,
  },

  // ── Header (flex 2) ──────────────────────────────────────────────────────
  headerSection: {
    flex: 2,
    justifyContent: "center",
    gap: 8,
    paddingTop: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerText: { flex: 1, gap: 1 },
  title: { fontSize: 20, fontFamily: F.header, color: C.gold, letterSpacing: 1 },
  subtitle: { fontSize: 12, fontFamily: F.body, color: C.goldDim, fontStyle: "italic" },
  langTabsCompact: { flexDirection: "row", gap: 6, marginLeft: 8 },
  langTabCompact: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
  },
  langTabFlag: { fontSize: 18 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressTrack: {
    flex: 1, height: 5, backgroundColor: "rgba(201,162,39,0.12)",
    borderRadius: 3, overflow: "hidden", borderWidth: 0.5, borderColor: C.border,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressLabel: { fontSize: 11, fontFamily: F.bodySemi, minWidth: 30, textAlign: "right" },

  // ── Word Card (flex 5) ───────────────────────────────────────────────────
  cardSection: {
    flex: 5,
    justifyContent: "center",
  },
  card: {
    backgroundColor: C.parchment,
    borderRadius: 24,
    overflow: "hidden",
    padding: 18,
    gap: 8,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.2)",
  },
  cardTopAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 16, borderWidth: 1,
  },
  levelText: { fontSize: 11, fontFamily: F.label, letterSpacing: 1 },
  listenBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, overflow: "hidden",
  },
  listenBtnText: { fontSize: 12, fontFamily: F.bodySemi, color: "#fff" },
  wordText: {
    fontSize: 38,
    fontFamily: F.title,
    color: C.textParchment,
    textAlign: "center",
    lineHeight: 46,
    letterSpacing: 1,
  },
  ipaRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  ipaTag: {
    fontSize: 10, fontFamily: F.label, color: C.goldDark,
    letterSpacing: 1, backgroundColor: "rgba(201,162,39,0.12)",
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  ipaText: { fontSize: 16, fontFamily: F.body, color: C.goldDark, fontStyle: "italic" },
  cardDivider: { height: 1, backgroundColor: "rgba(44,24,16,0.1)", marginVertical: 2 },
  meaningText: { fontSize: 16, fontFamily: F.bodySemi, color: C.textParchment, textAlign: "center" },

  // ── Tip + dots (flex 1.5) ────────────────────────────────────────────────
  tipSection: {
    flex: 1.5,
    justifyContent: "center",
    gap: 8,
  },
  tipBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    backgroundColor: "rgba(201,162,39,0.07)",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: "rgba(201,162,39,0.18)",
  },
  tipText: {
    flex: 1, fontSize: 12, fontFamily: F.body,
    color: C.textParchment, lineHeight: 17, fontStyle: "italic",
  },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.goldDark, opacity: 0.3 },
  dotDone: { opacity: 0.8 },
  dotActive: { width: 16, borderRadius: 4, opacity: 1 },

  // ── Recording / Result (flex 3) ──────────────────────────────────────────
  recordSection: {
    flex: 3,
    justifyContent: "center",
  },
  micWrap: { alignItems: "center", gap: 10 },
  micBtn: {
    width: 84, height: 84, borderRadius: 42,
    overflow: "hidden", justifyContent: "center", alignItems: "center",
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 7,
  },
  micHint: {
    fontSize: 13, fontFamily: F.body, color: C.goldDim,
    textAlign: "center", fontStyle: "italic",
  },

  resultScroll: { gap: 10, paddingBottom: 4 },
  resultRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  scoreCircle: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 4, justifyContent: "center", alignItems: "center",
    backgroundColor: C.bg2, flexShrink: 0,
  },
  scoreNumber: { fontSize: 26, fontFamily: F.title, lineHeight: 30 },
  scoreDenom: { fontSize: 10, fontFamily: F.body, color: C.goldDim },
  resultRight: { flex: 1, gap: 6 },
  scoreLabel: { fontSize: 14, fontFamily: F.bodySemi },
  scoreBarTrack: {
    height: 6, backgroundColor: "rgba(201,162,39,0.1)",
    borderRadius: 3, overflow: "hidden", borderWidth: 0.5, borderColor: C.border,
  },
  scoreBarFill: { height: "100%", borderRadius: 3 },
  heardText: { fontSize: 12, fontFamily: F.body, color: C.parchment, fontStyle: "italic" },
  feedbackText: { fontSize: 12, fontFamily: F.body, color: C.goldDim, lineHeight: 17, marginTop: 6 },
  subScoreRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 8, marginBottom: 2 },
  subScoreBox: { alignItems: "center", backgroundColor: "rgba(201,162,39,0.08)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, minWidth: 60 },
  subScoreNum: { fontSize: 18, fontFamily: F.header, letterSpacing: 0.5 },
  subScoreLabel: { fontSize: 10, fontFamily: F.label, color: C.goldDim, marginTop: 1 },
  wordChipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  wordChip: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  wordChipText: { fontSize: 12, fontFamily: F.bodySemi },
  wordChipScore: { fontSize: 11, fontFamily: F.label },
  retryChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "center", paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg2,
  },
  retryChipText: { fontSize: 12, fontFamily: F.bodySemi },
  errorRow: {
    flexDirection: "row", gap: 6, alignItems: "flex-start",
    backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(239,68,68,0.2)",
  },
  errorText: { flex: 1, fontSize: 12, fontFamily: F.body, color: "#EF4444", lineHeight: 18 },

  // ── Navigation (flex 1.5) ────────────────────────────────────────────────
  navSection: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 4,
  },
  navBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderRadius: 14,
  },
  prevBtn: {
    backgroundColor: C.bg2, borderWidth: 1.5, borderColor: C.border,
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 14, fontFamily: F.bodySemi },
  navProgress: { alignItems: "center", minWidth: 44 },
  navProgressText: { fontSize: 13, fontFamily: F.bodySemi, color: C.goldDim },
  nextBtnActive: { overflow: "hidden" },
  nextBtnInactive: { backgroundColor: C.bg2, borderWidth: 1.5, borderColor: C.border },
  nextBtnText: { fontSize: 14, fontFamily: F.bodySemi, color: "#fff" },

  // ── Completion screen ────────────────────────────────────────────────────
  completeWrap: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 28, gap: 18,
  },
  completeTrophy: { fontSize: 64, textAlign: "center" },
  completeTitle: {
    fontSize: 24, fontFamily: F.header, color: C.gold,
    textAlign: "center", letterSpacing: 1, lineHeight: 34,
  },
  completeSub: { fontSize: 14, fontFamily: F.body, color: C.goldDim, textAlign: "center", fontStyle: "italic" },
  weakBox: {
    backgroundColor: C.bg2, borderRadius: 14, padding: 14,
    width: "100%", borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", gap: 6,
  },
  weakBoxHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  weakBoxTitle: { fontSize: 12, fontFamily: F.bodySemi, color: "#EF4444" },
  weakWord: { fontSize: 14, fontFamily: F.body, color: C.parchment, paddingLeft: 4 },
  newSessionBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 14, paddingHorizontal: 36,
    borderRadius: 18, overflow: "hidden",
  },
  newSessionBtnText: { fontSize: 15, fontFamily: F.header, color: C.bg1, letterSpacing: 1 },

  // ── Pronunciation level indicator ────────────────────────────────────────
  pronLevelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  pronLevelBadge: {
    backgroundColor: "rgba(201,162,39,0.18)", borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: "rgba(201,162,39,0.4)",
  },
  pronLevelBadgeText: { fontSize: 11, fontFamily: F.header, color: C.gold, letterSpacing: 0.5 },
  pronLevelHint: { fontSize: 11, fontFamily: F.body, color: C.goldDim, fontStyle: "italic" },

  // ── Level-up overlay ────────────────────────────────────────────────────
  levelUpOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26,10,5,0.88)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  levelUpCard: {
    backgroundColor: C.bg2, borderRadius: 28,
    padding: 32, alignItems: "center", gap: 12,
    borderWidth: 1.5, borderColor: C.gold,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 24, elevation: 16,
    minWidth: 260,
  },
  levelUpEmoji: { fontSize: 48, textAlign: "center" },
  levelUpTitle: { fontSize: 28, fontFamily: F.title, color: C.gold, letterSpacing: 2 },
  levelUpSub: { fontSize: 14, fontFamily: F.body, color: C.goldDim, fontStyle: "italic" },
  levelUpBadge: {
    backgroundColor: C.gold, borderRadius: 14,
    paddingHorizontal: 22, paddingVertical: 8, marginVertical: 4,
  },
  levelUpBadgeText: { fontSize: 24, fontFamily: F.header, color: C.bg1, letterSpacing: 2 },
  levelUpHint: { fontSize: 13, fontFamily: F.bodySemi, color: C.parchment },
  levelUpDismiss: { fontSize: 11, fontFamily: F.body, color: C.goldDim, fontStyle: "italic", marginTop: 4 },
});
