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
import { useLanguage, getDefaultLearning, NativeLanguage } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { XPToast } from "@/components/XPToast";
import { C, F } from "@/constants/theme";

const TAB_BAR_HEIGHT = 49;
const SESSION_SIZE = 8;
const WEAK_THRESHOLD = 75;

type LangTab = "korean" | "english" | "spanish";

interface Phrase {
  word: string;
  ipa: string;
  meaning: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  speechLang: string;
  tip: string;
}

const PHRASE_SETS: Record<LangTab, Phrase[]> = {
  english: [
    // ── A1 Beginner ──────────────────────────────────────────────────────────
    { word: "Hello", ipa: "/həˈloʊ/", meaning: "안녕하세요", level: "A1", speechLang: "en-US", tip: "Stress the second syllable: heh-LO." },
    { word: "Thank you", ipa: "/ˈθæŋk juː/", meaning: "감사합니다", level: "A1", speechLang: "en-US", tip: "The 'th' needs tongue between teeth." },
    { word: "Sorry", ipa: "/ˈsɒr.i/", meaning: "죄송합니다", level: "A1", speechLang: "en-US", tip: "First syllable is stressed: SOR-ee." },
    { word: "Yes", ipa: "/jɛs/", meaning: "네", level: "A1", speechLang: "en-US", tip: "Short and clear. Ends with a light 's' sound." },
    { word: "No", ipa: "/noʊ/", meaning: "아니요", level: "A1", speechLang: "en-US", tip: "The vowel glides from 'oh' to 'w'." },
    { word: "Please", ipa: "/pliːz/", meaning: "부탁드려요", level: "A1", speechLang: "en-US", tip: "Long 'ee' sound in the middle." },
    { word: "Water", ipa: "/ˈwɔː.tər/", meaning: "물", level: "A1", speechLang: "en-US", tip: "In American English: WAW-ter (flapped 't')." },
    { word: "Coffee", ipa: "/ˈkɒf.i/", meaning: "커피", level: "A1", speechLang: "en-US", tip: "Two syllables: KOF-ee." },
    { word: "Friend", ipa: "/frɛnd/", meaning: "친구", level: "A1", speechLang: "en-US", tip: "The 'd' at the end can be soft or silent." },
    { word: "Happy", ipa: "/ˈhæp.i/", meaning: "행복한", level: "A1", speechLang: "en-US", tip: "Stress on first syllable: HAP-ee." },
    { word: "Good", ipa: "/ɡʊd/", meaning: "좋은", level: "A1", speechLang: "en-US", tip: "Short 'oo' sound, not like 'food'." },
    { word: "Bad", ipa: "/bæd/", meaning: "나쁜", level: "A1", speechLang: "en-US", tip: "The 'a' is an open front vowel like 'cat'." },
    { word: "Home", ipa: "/hoʊm/", meaning: "집", level: "A1", speechLang: "en-US", tip: "The vowel glides from 'oh' to 'w'." },
    { word: "Food", ipa: "/fuːd/", meaning: "음식", level: "A1", speechLang: "en-US", tip: "Long 'oo' sound — like 'mood'." },
    { word: "Help", ipa: "/hɛlp/", meaning: "도움", level: "A1", speechLang: "en-US", tip: "Say all four sounds: H-EL-P." },
    { word: "Good morning", ipa: "/ɡʊd ˈmɔːr.nɪŋ/", meaning: "좋은 아침이에요", level: "A1", speechLang: "en-US", tip: "Link the words together smoothly." },
    { word: "How are you?", ipa: "/haʊ ɑːr juː/", meaning: "어떻게 지내세요?", level: "A1", speechLang: "en-US", tip: "Often spoken quickly: 'How-ar-yuh?'" },
    { word: "Name", ipa: "/neɪm/", meaning: "이름", level: "A1", speechLang: "en-US", tip: "The 'a' vowel glides from 'eh' to 'ee'." },
    { word: "Book", ipa: "/bʊk/", meaning: "책", level: "A1", speechLang: "en-US", tip: "Short 'oo' like 'foot', not 'boot'." },
    { word: "Time", ipa: "/taɪm/", meaning: "시간", level: "A1", speechLang: "en-US", tip: "The 'i' is a diphthong: slides from 'ah' to 'ee'." },
    { word: "Day", ipa: "/deɪ/", meaning: "날", level: "A1", speechLang: "en-US", tip: "The 'a' glides upward — like 'deh-ee'." },
    // ── A2 Elementary ────────────────────────────────────────────────────────
    { word: "Beautiful", ipa: "/ˈbjuː.tɪ.fəl/", meaning: "아름다운", level: "A2", speechLang: "en-US", tip: "Three syllables: BYOO-tih-ful." },
    { word: "Comfortable", ipa: "/ˈkʌm.fər.tə.bəl/", meaning: "편안한", level: "A2", speechLang: "en-US", tip: "Often said as 3 syllables: KUMF-ter-bul." },
    { word: "Squirrel", ipa: "/ˈskwɪr.əl/", meaning: "다람쥐", level: "A2", speechLang: "en-US", tip: "The 'r' colors the vowel before it." },
    { word: "Travel", ipa: "/ˈtræv.əl/", meaning: "여행", level: "A2", speechLang: "en-US", tip: "Open 'a' vowel in the first syllable: TRAV-ul." },
    { word: "Airport", ipa: "/ˈɛər.pɔːrt/", meaning: "공항", level: "A2", speechLang: "en-US", tip: "Two distinct syllables: AIR-port. Don't drop the 't'." },
    { word: "Hotel", ipa: "/hoʊˈtɛl/", meaning: "호텔", level: "A2", speechLang: "en-US", tip: "Stress on the second syllable: hoh-TEL." },
    { word: "Weather", ipa: "/ˈwɛð.ər/", meaning: "날씨", level: "A2", speechLang: "en-US", tip: "The 'th' here is voiced — like the 'th' in 'this'." },
    { word: "Ticket", ipa: "/ˈtɪk.ɪt/", meaning: "티켓", level: "A2", speechLang: "en-US", tip: "Two short syllables: TIK-it. The second 't' is often flapped." },
    { word: "Important", ipa: "/ɪmˈpɔːr.tənt/", meaning: "중요한", level: "A2", speechLang: "en-US", tip: "Stress on second syllable: im-POR-tant." },
    { word: "Different", ipa: "/ˈdɪf.ər.ənt/", meaning: "다른", level: "A2", speechLang: "en-US", tip: "Often pronounced as 2 syllables in fast speech: DIF-rent." },
    { word: "Family", ipa: "/ˈfæm.ɪ.li/", meaning: "가족", level: "A2", speechLang: "en-US", tip: "Three syllables: FAM-ih-lee. Open 'a' like 'cat'." },
    { word: "School", ipa: "/skuːl/", meaning: "학교", level: "A2", speechLang: "en-US", tip: "Long 'oo' sound. The 'sch' cluster blends smoothly." },
    { word: "Music", ipa: "/ˈmjuː.zɪk/", meaning: "음악", level: "A2", speechLang: "en-US", tip: "The 'u' starts with a 'y' glide: MYOO-zik." },
    { word: "Together", ipa: "/təˈɡɛð.ər/", meaning: "함께", level: "A2", speechLang: "en-US", tip: "Stress on second syllable. Voiced 'th' like 'this'." },
    { word: "Remember", ipa: "/rɪˈmɛm.bər/", meaning: "기억하다", level: "A2", speechLang: "en-US", tip: "Stress on second syllable: re-MEM-ber." },
    { word: "Interesting", ipa: "/ˈɪn.trɪ.stɪŋ/", meaning: "흥미로운", level: "A2", speechLang: "en-US", tip: "3 syllables in natural speech: IN-tre-sting." },
    { word: "Possible", ipa: "/ˈpɒs.ɪ.bəl/", meaning: "가능한", level: "A2", speechLang: "en-US", tip: "Three syllables: POS-ih-bul. Schwa on the final syllable." },
    // ── B1 Intermediate ──────────────────────────────────────────────────────
    { word: "Thoroughly", ipa: "/ˈθʌr.ə.li/", meaning: "완전히", level: "B1", speechLang: "en-US", tip: "The 'th' needs tongue between teeth, not a 'd' or 't'." },
    { word: "Rural", ipa: "/ˈrʊr.əl/", meaning: "시골의", level: "B1", speechLang: "en-US", tip: "Two 'r' sounds in a row. Relax the tongue for both." },
    { word: "Conversation", ipa: "/ˌkɒn.vəˈseɪ.ʃən/", meaning: "대화", level: "B1", speechLang: "en-US", tip: "Stress on the third syllable: con-ver-SAY-shun." },
    { word: "Experience", ipa: "/ɪkˈspɪər.i.əns/", meaning: "경험", level: "B1", speechLang: "en-US", tip: "4 syllables: ex-PEER-ee-ence. The 'sp' cluster is key." },
    { word: "Opportunity", ipa: "/ˌɒp.əˈtʃuː.nɪ.ti/", meaning: "기회", level: "B1", speechLang: "en-US", tip: "5 syllables. Stress on 'TU': op-er-TYU-ni-tee." },
    { word: "Knowledge", ipa: "/ˈnɒl.ɪdʒ/", meaning: "지식", level: "B1", speechLang: "en-US", tip: "Silent 'k'. Two syllables: NOL-ij." },
    { word: "Environment", ipa: "/ɪnˈvaɪ.rən.mənt/", meaning: "환경", level: "B1", speechLang: "en-US", tip: "Often said as 4 syllables: en-VY-ron-ment." },
    { word: "Communicate", ipa: "/kəˈmjuː.nɪ.keɪt/", meaning: "소통하다", level: "B1", speechLang: "en-US", tip: "Stress on second syllable: com-MYU-ni-kate." },
    { word: "Pronunciation", ipa: "/prəˌnʌn.siˈeɪ.ʃən/", meaning: "발음", level: "B1", speechLang: "en-US", tip: "5 syllables. Note: it's pro-NUN-ciation, not pro-NOUN-ciation." },
    { word: "Particularly", ipa: "/pəˈtɪk.jʊ.lə.li/", meaning: "특히", level: "B1", speechLang: "en-US", tip: "5 syllables. Stress on second: par-TIC-you-lar-lee." },
    { word: "Challenge", ipa: "/ˈtʃæl.ɪndʒ/", meaning: "도전", level: "B1", speechLang: "en-US", tip: "The 'ch' is like in 'church'. Two syllables: CHAL-inj." },
    // ── B2 Upper Intermediate ─────────────────────────────────────────────────
    { word: "Responsibility", ipa: "/rɪˌspɒn.sɪˈbɪl.ɪ.ti/", meaning: "책임감", level: "B2", speechLang: "en-US", tip: "6 syllables. Stress on 'BIL': re-spon-si-BIL-i-tee." },
    { word: "Achievement", ipa: "/əˈtʃiːv.mənt/", meaning: "성취", level: "B2", speechLang: "en-US", tip: "3 syllables: a-CHEEV-ment. The 'ch' is like in 'cheese'." },
    { word: "Independence", ipa: "/ˌɪn.dɪˈpɛn.dəns/", meaning: "독립", level: "B2", speechLang: "en-US", tip: "4 syllables. Stress on PEN: in-di-PEN-dence." },
    { word: "Significant", ipa: "/sɪɡˈnɪf.ɪ.kənt/", meaning: "중요한", level: "B2", speechLang: "en-US", tip: "4 syllables. Stress on NIF: sig-NIF-i-cant." },
    { word: "Sophisticated", ipa: "/səˈfɪs.tɪ.keɪ.tɪd/", meaning: "세련된", level: "B2", speechLang: "en-US", tip: "5 syllables. Stress on FIS: so-FIS-ti-kay-tid." },
    { word: "Approximately", ipa: "/əˈprɒk.sɪ.mɪt.li/", meaning: "대략", level: "B2", speechLang: "en-US", tip: "5 syllables. Stress on PROX: a-PROX-i-mit-lee." },
    { word: "Representative", ipa: "/ˌrɛp.rɪˈzɛn.tə.tɪv/", meaning: "대표자", level: "B2", speechLang: "en-US", tip: "5 syllables. Stress on ZEN: rep-ri-ZEN-ta-tiv." },
    { word: "Occasionally", ipa: "/əˈkeɪ.ʒən.ə.li/", meaning: "가끔", level: "B2", speechLang: "en-US", tip: "5 syllables. The 'si' sounds like 'zh': a-KAY-zhun-a-lee." },
    // ── C1 Advanced ───────────────────────────────────────────────────────────
    { word: "Entrepreneur", ipa: "/ˌɒn.trə.prəˈnɜːr/", meaning: "기업가", level: "C1", speechLang: "en-US", tip: "French origin. The stress is on the final syllable." },
    { word: "Consequently", ipa: "/ˈkɒn.sɪ.kwənt.li/", meaning: "결과적으로", level: "C1", speechLang: "en-US", tip: "4 syllables. Stress on CON: CON-se-kwent-lee." },
    { word: "Nevertheless", ipa: "/ˌnɛv.ə.ðəˈlɛs/", meaning: "그럼에도", level: "C1", speechLang: "en-US", tip: "4 syllables. Stress at the end: nev-er-the-LESS." },
    { word: "Unprecedented", ipa: "/ʌnˈprɛs.ɪ.dɛn.tɪd/", meaning: "전례 없는", level: "C1", speechLang: "en-US", tip: "5 syllables. Stress on PRES: un-PRES-i-den-tid." },
    { word: "Contemporary", ipa: "/kənˈtɛm.pə.rɛr.i/", meaning: "현대적인", level: "C1", speechLang: "en-US", tip: "5 syllables. Stress on TEM: con-TEM-po-rer-ee." },
    // ── C2 Mastery ────────────────────────────────────────────────────────────
    { word: "Worcestershire", ipa: "/ˈwʊs.tər.ʃɪər/", meaning: "우스터셔 (지명)", level: "C2", speechLang: "en-US", tip: "Only 3 syllables despite spelling: WOOS-ter-sheer." },
    { word: "Conscientious", ipa: "/ˌkɒn.ʃiˈɛn.ʃəs/", meaning: "양심적인", level: "C2", speechLang: "en-US", tip: "4 syllables. Stress on EN: con-shee-EN-shus." },
    { word: "Onomatopoeia", ipa: "/ˌɒn.ə.ˌmæt.əˈpiː.ə/", meaning: "의성어", level: "C2", speechLang: "en-US", tip: "6 syllables. Stress on PEE: on-o-mat-o-PEE-a." },
    { word: "Epitome", ipa: "/ɪˈpɪt.ə.mi/", meaning: "전형", level: "C2", speechLang: "en-US", tip: "4 syllables — NOT 'epi-tome'. Stress on PIT: e-PIT-o-mee." },
    { word: "Camaraderie", ipa: "/ˌkæm.əˈrɑː.də.ri/", meaning: "동료 의식", level: "C2", speechLang: "en-US", tip: "5 syllables. French origin. Stress on RAH: cam-a-RAH-de-ree." },
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
    // ── B1 Intermediate ──────────────────────────────────────────────────────
    { word: "Murciélago", ipa: "/muɾˈθje.la.ɣo/", meaning: "박쥐", level: "B1", speechLang: "es-ES", tip: "Contains all 5 vowels! The θ is a 'th' sound in Spain Spanish." },
    { word: "Desarrollar", ipa: "/de.za.ro.ˈʎaɾ/", meaning: "개발하다", level: "B1", speechLang: "es-ES", tip: "The 'll' sounds like 'y' in many dialects." },
    { word: "Conversación", ipa: "/kom.beɾ.saˈθjon/", meaning: "대화", level: "B1", speechLang: "es-ES", tip: "4 syllables. Stress on CION: con-ver-sa-THYON." },
    { word: "Experiencia", ipa: "/eks.peˈɾjen.θja/", meaning: "경험", level: "B1", speechLang: "es-ES", tip: "5 syllables. The 'rie' is a triphthong: eks-pe-RYEN-thya." },
    { word: "Oportunidad", ipa: "/o.poɾ.tu.niˈðað/", meaning: "기회", level: "B1", speechLang: "es-ES", tip: "6 syllables. Stress on DAD. Final 'd' is very soft or silent." },
    { word: "Conocimiento", ipa: "/ko.no.θiˈmjen.to/", meaning: "지식", level: "B1", speechLang: "es-ES", tip: "5 syllables. Stress on MIEN. The 'c' before 'i' = 'θ'." },
    { word: "Pronunciación", ipa: "/pɾo.nun.θjaˈθjon/", meaning: "발음", level: "B1", speechLang: "es-ES", tip: "5 syllables. Two 'θ' sounds! pro-nun-thya-THYON." },
    { word: "Desafío", ipa: "/de.saˈfi.o/", meaning: "도전", level: "B1", speechLang: "es-ES", tip: "4 syllables. Stress on FI: de-sa-FI-o. The accent keeps vowels separate." },
    // ── B2 Upper Intermediate ─────────────────────────────────────────────────
    { word: "Ferrocarril", ipa: "/fe.ro.kaˈril/", meaning: "철도", level: "B2", speechLang: "es-ES", tip: "Two rolling 'rr' sounds. Practice the trill separately first." },
    { word: "Extraordinario", ipa: "/eks.tɾa.oɾ.ðiˈna.ɾjo/", meaning: "특별한", level: "B2", speechLang: "es-ES", tip: "7 syllables! Break it down slowly before building to full speed." },
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
    // ── B2 Upper Intermediate ─────────────────────────────────────────────────
    { word: "책임감", ipa: "/tɕʰɛ.gim.kam/", meaning: "Sense of responsibility", level: "B2", speechLang: "ko-KR", tip: "3 syllables. The ㄱ+ㅇ link creates voiced stop: CHEK-im-gam." },
    { word: "독립심", ipa: "/toŋ.nip.sim/", meaning: "Independent spirit", level: "B2", speechLang: "ko-KR", tip: "3 syllables. ㄱ+ㄹ nasalizes: DONG-nip-sim." },
    { word: "중요하다", ipa: "/tɕuŋ.jo.ha.da/", meaning: "To be important", level: "B2", speechLang: "ko-KR", tip: "4 syllables. The ㅇ+ㅎ liaison: JUNG-yo-ha-da." },
    { word: "성취감", ipa: "/sʌŋ.tɕʰwi.gam/", meaning: "Sense of achievement", level: "B2", speechLang: "ko-KR", tip: "3 syllables. The ㅊ is aspirated: SUNG-chwi-gam." },
    { word: "의사소통", ipa: "/ɯi.sa.so.tʰoŋ/", meaning: "Communication", level: "B2", speechLang: "ko-KR", tip: "4 syllables. The 의 vowel: lips spread, tongue back — ɯi." },
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

async function playPronunciationTTS(text: string, lang: string, apiBase: string) {
  try {
    if (Platform.OS === "web" && _pronunciationAudio) {
      _pronunciationAudio.pause();
      _pronunciationAudio.src = "";
      _pronunciationAudio = null;
    }
    const url = new URL("/api/pronunciation-tts", apiBase);
    url.searchParams.set("text", text);
    url.searchParams.set("lang", lang);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TTS ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    if (Platform.OS === "web") {
      const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
      _pronunciationAudio = audio;
      audio.onended = () => { URL.revokeObjectURL(objectUrl); _pronunciationAudio = null; };
      audio.onerror = () => { URL.revokeObjectURL(objectUrl); _pronunciationAudio = null; };
      await audio.play();
    } else {
      const { sound } = await Audio.Sound.createAsync({ uri: objectUrl }, { shouldPlay: true });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          URL.revokeObjectURL(objectUrl);
        }
      });
    }
  } catch (err) {
    console.warn("Pronunciation TTS error:", err);
  }
}

const CEFR_ORDER: Phrase["level"][] = ["A1", "A2", "B1", "B2", "C1", "C2"];
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

  const freshFirst = (arr: Phrase[]) => {
    const notSeen = arr.filter((p) => !lastSet.has(p.word));
    const seen = arr.filter((p) => lastSet.has(p.word));
    return [...shuffle(notSeen), ...shuffle(seen)];
  };

  // Cap pronunciation level at B2 for word selection
  const userCefr: Phrase["level"] = PRON_LEVELS.includes(pronLevel) ? pronLevel : "B2";
  const userIdx = CEFR_ORDER.indexOf(userCefr);
  const reviewLevel = userIdx > 0 ? CEFR_ORDER[userIdx - 1] : null;

  const weakPool = shuffle(all.filter((p) => weakSet.has(p.word)));
  const primaryPool = freshFirst(all.filter((p) => p.level === userCefr && !weakSet.has(p.word)));
  const reviewPool = reviewLevel
    ? freshFirst(all.filter((p) => p.level === reviewLevel && !weakSet.has(p.word)))
    : [];

  const weakSlots = Math.min(weakPool.length, 2);
  const remaining = SESSION_SIZE - weakSlots;
  const reviewSlots = Math.min(reviewPool.length, Math.max(1, Math.round(remaining * 0.2)));
  const primarySlots = remaining - reviewSlots;

  const pool = [
    ...weakPool.slice(0, weakSlots),
    ...primaryPool.slice(0, primarySlots),
    ...reviewPool.slice(0, reviewSlots),
  ];

  const seenSet = new Set<string>();
  const unique: Phrase[] = [];
  for (const p of shuffle(pool)) {
    if (!seenSet.has(p.word)) { seenSet.add(p.word); unique.push(p); }
    if (unique.length >= SESSION_SIZE) break;
  }

  if (unique.length < SESSION_SIZE) {
    // Fallback: only use words at or below the current pronunciation level
    const allowedLevels = PRON_LEVELS.slice(0, PRON_LEVELS.indexOf(userCefr) + 1);
    const fallback = freshFirst(all.filter((p) =>
      allowedLevels.includes(p.level as Phrase["level"]) && !weakSet.has(p.word) && !seenSet.has(p.word)
    ));
    for (const p of fallback) {
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
  const [wordResults, setWordResults] = useState<{ word: string; score: number; errorType: string }[]>([]);
  const [sttError, setSttError] = useState("");
  const [hasListened, setHasListened] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const recordStateRef = useRef<RecordState>("idle");
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const weakKey = `speak_weak_words_${activeLang}`;
  const lastSeenKey = `speak_last_seen_${activeLang}`;

  const resetPracticeState = useCallback(() => {
    if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }
    if (mediaRecorderRef.current?.state === "recording") { mediaRecorderRef.current.stop(); }
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

  const handleRecord = () => {
    if (!phrase || recordState === "processing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Second tap while recording → stop early
    if (recordState === "listening" && mediaRecorderRef.current?.state === "recording") {
      if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }
      mediaRecorderRef.current.stop();
      return;
    }

    if (Platform.OS !== "web") {
      setSttError("발음 평가는 현재 웹 브라우저에서만 지원됩니다.");
      setRecordState("done");
      recordStateRef.current = "done";
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

          const scoreVal = data.score ?? 0;
          setScore(scoreVal);
          setAccuracyScore(data.accuracyScore ?? null);
          setFluencyScore(data.fluencyScore ?? null);
          setCompletenessScore(data.completenessScore ?? null);
          setGptFeedback(data.feedback ?? "");
          setRecognizedText(data.recognizedText ?? "");
          setWordResults(data.words ?? []);
          Animated.timing(scoreAnim, { toValue: scoreVal / 100, duration: 900, useNativeDriver: false }).start();
          if (scoreVal < WEAK_THRESHOLD) { await saveWeakWord(phrase.word); }
          else { await removeWeakWord(phrase.word); }
          const xpEarned = scoreVal >= 90 ? 30 : 15;
          setXpGain(xpEarned);
          updateStats({ xp: statsRef.current.xp + xpEarned });

          // Pronunciation level progression
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
            onPress={() => setLevelUpShow(false)}
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
            <Text style={styles.meaningText}>{phrase.meaning}</Text>
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

                  {/* Word-level chips */}
                  {wordResults.length > 0 && (
                    <View style={styles.wordChipsRow}>
                      {wordResults.map((w, i) => {
                        const chipColor = w.score >= 80 ? "#10B981" : w.score >= 55 ? "#F59E0B" : "#EF4444";
                        return (
                          <View key={i} style={[styles.wordChip, { borderColor: chipColor }]}>
                            <Text style={[styles.wordChipText, { color: chipColor }]}>{w.word}</Text>
                            <Text style={[styles.wordChipScore, { color: chipColor }]}>{w.score}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}

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
                {isRecording ? "녹음 중… 탭하여 정지" : isProcessing ? "Azure 분석 중…" : hasListened ? "탭하여 발음 녹음" : "먼저 듣기를 눌러보세요"}
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
