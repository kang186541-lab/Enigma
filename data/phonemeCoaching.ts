// ── Phoneme Coaching Database ─────────────────────────────────────────────
// Keyed by target language → phoneme → native language → coaching tip.
// Tips are shown in the learner's native language.

type LangTips = Record<string, string>; // nativeLang code → tip
type PhonemeMap = Record<string, LangTips>; // phoneme → LangTips

// ── English phonemes (for learners of English) ───────────────────────────

const ENGLISH_PHONEMES: PhonemeMap = {
  // ── Consonants ─────────────────────────────────
  r: {
    ko: "혀를 말아서 입천장에 안 닿게 하세요. 한국어 'ㄹ'과 달라요!",
    es: "No toque el paladar con la lengua. Diferente a la 'r' española.",
    id: "Lengkungkan lidah tanpa menyentuh langit-langit mulut. Jangan digetarkan seperti r Indonesia!",
  },
  l: {
    ko: "혀끝을 윗니 뒤에 살짝 대세요. 'ㄹ'보다 혀가 더 앞에 위치해요.",
    es: "Toque detrás de los dientes superiores con la punta de la lengua.",
    id: "Sentuhkan ujung lidah ke belakang gigi atas. Posisi lidah lebih ke depan daripada l Indonesia.",
  },
  θ: { // "th" in "think"
    ko: "혀를 윗니와 아랫니 사이에 살짝 내밀어서 바람을 불어요.",
    es: "Coloque la lengua entre los dientes y sople aire suavemente.",
    id: "Julurkan lidah sedikit di antara gigi atas dan bawah, lalu embuskan udara tanpa menggetarkan pita suara.",
  },
  ð: { // "th" in "this"
    ko: "혀를 이 사이에 넣고 성대를 울리면서 바람을 내세요. 'think'의 th보다 울림이 있어요.",
    es: "Como la 'z' en España (za, ce, ci, zo, zu), pero con vibración.",
    id: "Letakkan lidah di antara gigi sambil menggetarkan pita suara. Berbeda dari th pada 'think' karena ada getaran.",
  },
  v: {
    ko: "윗니로 아랫입술을 살짝 물고 소리 내세요. 'ㅂ'이 아니에요!",
    es: "Muerda el labio inferior con los dientes superiores y vibre.",
    id: "Gigit ringan bibir bawah dengan gigi atas sambil menggetarkan suara. Ini bukan bunyi b!",
  },
  f: {
    ko: "윗니로 아랫입술을 살짝 물고 바람만 내세요. 'ㅍ'과 달라요!",
    es: "Similar a la 'f' española, labio inferior contra dientes superiores.",
    id: "Gigit ringan bibir bawah dengan gigi atas, lalu embuskan udara saja tanpa suara. Sama seperti f Indonesia.",
  },
  z: {
    ko: "'ㅈ'처럼 하되 혀를 더 앞으로! 'ㅅ'에 울림을 더한 소리예요.",
    es: "Como una 's' pero con vibración de las cuerdas vocales.",
    id: "Seperti bunyi s tetapi dengan getaran pita suara. Jangan diucapkan seperti j.",
  },
  w: {
    ko: "입술을 둥글게 모았다가 빠르게 벌리세요. 'ㅂ'이 아니라 입술 모양이에요!",
    es: "Redondee los labios como para decir 'u' y abra rápido.",
    id: "Bulatkan bibir seperti mengucapkan 'u', lalu buka dengan cepat. Sama seperti w Indonesia pada 'wajah'.",
  },
  ʃ: { // "sh" in "she"
    ko: "'쉬' 소리인데 입술을 둥글게 모아서 내세요. 'ㅅ'보다 부드러워요.",
    es: "Como 'sh' en inglés. Redondee los labios y sople.",
    id: "Bunyi 'sy' seperti pada 'syukur'. Bulatkan bibir sedikit dan embuskan udara.",
  },
  ʒ: { // "s" in "measure"
    ko: "'쉬' 소리에 울림을 더한 거예요. 입술 둥글게 + 성대 울림!",
    es: "Como 'sh' pero con vibración. Piense en 'y' argentina.",
    id: "Seperti bunyi 'sy' tetapi dengan getaran pita suara. Bulatkan bibir sambil bersuara.",
  },
  dʒ: { // "j" in "job"
    ko: "'ㅈ'과 비슷하지만 혀가 더 뒤로 말려요. 입술도 살짝 둥글게!",
    es: "Como la 'y' en 'yo' (rioplatense) o 'j' en inglés.",
    id: "Seperti bunyi j pada 'jam', tetapi lidah sedikit lebih ke belakang dan bibir agak dibulatkan.",
  },
  tʃ: { // "ch" in "church"
    ko: "'ㅊ'과 비슷해요! 혀끝을 입천장에 대고 터뜨리세요.",
    es: "Como 'ch' en español 'chico'. Muy similar.",
    id: "Seperti bunyi c pada 'cinta'. Tempelkan ujung lidah ke langit-langit lalu lepaskan.",
  },
  ŋ: { // "ng" in "sing"
    ko: "'ㅇ' 받침과 같아요! 코로 소리를 내세요.",
    es: "Como la 'n' antes de 'g' en 'tango'. Nasal, desde la garganta.",
    id: "Sama seperti ng pada 'bang'. Keluarkan bunyi lewat hidung dari belakang mulut.",
  },
  h: {
    ko: "'ㅎ'과 비슷해요. 가볍게 숨을 내쉬면서 소리 내세요.",
    es: "Como la 'j' suave española. Solo un soplo de aire.",
    id: "Seperti h pada 'hari'. Embuskan napas ringan saat mengucapkannya.",
  },
  p: {
    ko: "영어 p는 바람이 세게 나와요! 'ㅍ'에 가깝지만 입술을 더 세게 터뜨려요.",
    es: "Con más aspiración que la 'p' española. Suelte aire al abrir los labios.",
    id: "P bahasa Inggris keluar dengan hembusan udara kuat. Lepaskan bibir lebih kuat daripada p Indonesia.",
  },
  b: {
    ko: "'ㅂ'보다 입술을 더 강하게 다물었다 터뜨리세요. 성대가 울려요.",
    es: "Siempre explosiva, no suave como la 'b' española entre vocales.",
    id: "Katupkan bibir lebih rapat lalu lepaskan dengan getaran pita suara. Selalu jelas, tidak melemah.",
  },
  t: {
    ko: "혀끝을 윗니 뒤 잇몸에 대세요. 한국어 'ㅌ'보다 바람이 더 나와요.",
    es: "Toque los alvéolos (no los dientes). Más aspiración que la 't' española.",
    id: "Tempelkan ujung lidah ke gusi di belakang gigi atas, bukan ke gigi. Keluarkan lebih banyak udara daripada t Indonesia.",
  },
  d: {
    ko: "혀끝을 윗니 뒤 잇몸에 대고 성대를 울리세요. 받침 'd'도 꼭 발음해요!",
    es: "Siempre con la lengua en los alvéolos, no entre los dientes.",
    id: "Tempelkan ujung lidah ke gusi di belakang gigi atas sambil bersuara. Bunyi d di akhir kata tetap diucapkan!",
  },

  // ── Vowels ─────────────────────────────────────
  æ: { // "a" in "cat"
    ko: "입을 크게 벌리고 'ㅐ'보다 더 넓게! 턱을 아래로 내리세요.",
    es: "Abra más la boca que para la 'a' normal. Mandíbula bien abierta.",
    id: "Buka mulut lebar, lebih lebar daripada e pada 'enak'. Turunkan rahang. Bunyi antara a dan e.",
  },
  ɑ: { // "o" in "hot" (American)
    ko: "입을 크게 벌리고 'ㅏ'보다 목 안쪽에서 소리 내세요.",
    es: "Boca muy abierta, como si dijera 'a' desde la garganta.",
    id: "Buka mulut lebar dan keluarkan bunyi dari bagian dalam mulut, seperti 'a' yang dalam.",
  },
  ɪ: { // "i" in "bit"
    ko: "'ㅣ'보다 입을 더 벌리고 짧게! '이'와 '에' 사이 소리예요.",
    es: "Más corta y abierta que la 'i' española. Entre 'i' y 'e'.",
    id: "Lebih pendek dan terbuka daripada i Indonesia. Bunyinya di antara i dan e.",
  },
  iː: { // "ee" in "see"
    ko: "'ㅣ'와 비슷하지만 더 길게, 입을 더 옆으로 벌리세요.",
    es: "Como la 'i' española pero más larga y tensa.",
    id: "Seperti i Indonesia tetapi lebih panjang dan tegang. Tarik bibir ke samping lebih lebar.",
  },
  ʊ: { // "oo" in "book"
    ko: "'ㅜ'보다 짧고 입을 덜 둥글게! 힘을 빼고 가볍게.",
    es: "Más corta que la 'u' española. Labios menos redondeados.",
    id: "Lebih pendek daripada u Indonesia dan bibir kurang dibulatkan. Ucapkan santai dan ringan.",
  },
  uː: { // "oo" in "food"
    ko: "'ㅜ'와 비슷하지만 더 길게, 입술을 더 둥글게 모아요.",
    es: "Como la 'u' española pero más larga. Redondee bien los labios.",
    id: "Seperti u Indonesia tetapi lebih panjang. Bulatkan bibir dengan rapat.",
  },
  ɛ: { // "e" in "bed"
    ko: "'ㅔ'와 비슷해요. 입을 적당히 벌리세요.",
    es: "Como la 'e' española. Bastante similar.",
    id: "Seperti e pada 'enak'. Buka mulut secukupnya.",
  },
  ə: { // schwa - "a" in "about"
    ko: "가장 중요한 영어 모음! 힘 빼고 '어'를 아주 짧고 약하게.",
    es: "Vocal muy relajada y corta. Como una 'a' débil y sin esfuerzo.",
    id: "Vokal Inggris paling penting! Ucapkan sangat pendek dan lemah, seperti e pada 'emas' tanpa tenaga.",
  },
  ɜː: { // "ir" in "bird"
    ko: "'ㅓ'를 길게 하면서 혀를 살짝 말아요. 한국어에 없는 소리!",
    es: "Vocal larga y tensa. Tire la lengua ligeramente hacia atrás.",
    id: "Vokal panjang dan tegang. Tarik lidah sedikit ke belakang. Tidak ada padanannya di bahasa Indonesia.",
  },
  ʌ: { // "u" in "cup"
    ko: "'ㅓ'와 비슷하지만 더 짧고 입을 더 벌리세요.",
    es: "Como una 'a' corta y relajada. Boca medio abierta.",
    id: "Seperti 'a' pendek yang santai. Buka mulut setengah.",
  },
  oʊ: { // "o" in "go"
    ko: "'ㅗ'에서 시작해서 'ㅜ'로 미끄러지세요. 입술이 점점 둥글어져요.",
    es: "Empiece con 'o' y deslice hacia 'u'. No es una 'o' pura.",
    id: "Mulai dari 'o' lalu meluncur ke 'u'. Bibir makin membulat. Bukan 'o' murni.",
  },
  eɪ: { // "a" in "take"
    ko: "'ㅔ'에서 시작해서 'ㅣ'로 미끄러지세요. 이중모음이에요!",
    es: "Empiece con 'e' y deslice hacia 'i'. Es un diptongo.",
    id: "Mulai dari 'e' lalu meluncur ke 'i'. Ini diftong (dua vokal)!",
  },
  aɪ: { // "i" in "time"
    ko: "'ㅏ'에서 'ㅣ'로 미끄러지세요. '아이'를 빠르게 한 음절로!",
    es: "Como 'ai' en 'baile'. Empiece abierto y cierre.",
    id: "Meluncur dari 'a' ke 'i', seperti 'ai' pada 'pandai' dalam satu suku kata yang cepat.",
  },
  aʊ: { // "ou" in "house"
    ko: "'ㅏ'에서 'ㅜ'로 미끄러지세요. '아우'를 빠르게 한 음절로!",
    es: "Como 'au' en 'causa'. Empiece abierto, cierre redondeando labios.",
    id: "Meluncur dari 'a' ke 'u', seperti 'au' pada 'kalau'. Mulai terbuka, lalu bulatkan bibir.",
  },
  ɔɪ: { // "oy" in "boy"
    ko: "'ㅗ'에서 'ㅣ'로 미끄러지세요. '오이'를 한 음절로!",
    es: "Como 'oi' en 'hoy'. Empiece con labios redondos, termine con 'i'.",
    id: "Meluncur dari 'o' ke 'i', seperti 'oi' pada 'amboi'. Mulai dengan bibir bulat, akhiri dengan 'i'.",
  },
};

// ── Spanish phonemes (for learners of Spanish) ──────────────────────────

const SPANISH_PHONEMES: PhonemeMap = {
  rr: {
    ko: "혀끝을 윗니 뒤에 대고 떨어줘요. 'ㄹㄹ' 빠르게 반복하는 느낌!",
    en: "Place tongue tip behind upper teeth and let it vibrate rapidly. Try saying 'butter' fast.",
    id: "Letakkan ujung lidah di belakang gigi atas dan getarkan dengan cepat. Seperti rr Indonesia yang panjang dan bergetar.",
  },
  r: {
    ko: "혀끝으로 윗니 뒤를 한 번만 탁! 치세요. 한국어 'ㄹ'과 비슷해요.",
    en: "Quick single tap of tongue behind upper teeth. Like the 't' in American 'butter'.",
    id: "Ketuk ujung lidah satu kali di belakang gigi atas. Mirip r Indonesia pada 'cara'.",
  },
  x: { // "j" in "joven"
    ko: "목 안쪽에서 'ㅎ'보다 더 거칠게 내세요. 가래 뱉는 느낌!",
    en: "Like a strong 'h' from back of throat. Similar to German 'ch' in 'Bach'.",
    id: "Keluarkan bunyi kasar dari belakang tenggorokan, lebih kasar daripada h. Seperti 'kh' pada 'khusus'.",
  },
  ɲ: { // ñ
    ko: "'ㄴ'이랑 'ㅣ'를 합친 소리. '냐'의 'ㄴ' 느낌이에요.",
    en: "Like 'ny' in 'canyon'. Flatten tongue against roof of mouth.",
    id: "Seperti 'ny' pada 'nyala'. Ratakan lidah ke langit-langit mulut.",
  },
  ʎ: { // ll
    ko: "지역마다 달라요! 중남미는 '자/야', 스페인은 '야'에 가까워요.",
    en: "Varies by region: 'ya' in Spain, 'ja/sha' in Argentina. Most common: 'ya'.",
    id: "Berbeda menurut wilayah: 'ya' di Spanyol, 'ja/sya' di Argentina. Paling umum: 'ya'.",
  },
  β: { // b/v between vowels
    ko: "스페인어에서 b와 v는 같은 소리! 모음 사이에서는 입술을 살짝만 닫아요.",
    en: "B and V are the same sound in Spanish! Between vowels, barely close your lips.",
    id: "Dalam bahasa Spanyol, b dan v bunyinya sama! Di antara vokal, katupkan bibir hanya sedikit.",
  },
  ð_es: { // d between vowels
    ko: "모음 사이의 d는 영어 'th'처럼 부드럽게! 'nada' → '나다'가 아니라 '나ð아'",
    en: "Between vowels, soften 'd' to a 'th' sound. 'nada' sounds like 'na-tha'.",
    id: "Di antara vokal, lunakkan d menjadi bunyi 'th'. 'nada' terdengar seperti 'na-tha'.",
  },
  ɣ: { // g between vowels
    ko: "모음 사이의 g는 약하게! 목에서 바람만 살짝 내세요.",
    en: "Between vowels, soften 'g'. Almost like gargling very gently.",
    id: "Di antara vokal, lunakkan g. Hampir seperti berkumur sangat lembut.",
  },
  θ_es: { // c/z in Spain
    ko: "스페인: 혀를 이 사이에 넣고 바람 (θ). 중남미: 그냥 'ㅅ'!",
    en: "Spain: tongue between teeth (like English 'th'). Latin America: just 's'.",
    id: "Spanyol: lidah di antara gigi (seperti 'th' Inggris). Amerika Latin: cukup bunyi 's'.",
  },
  silent_h: {
    ko: "스페인어 h는 항상 묵음! 'hola' = '올라'이지 '홀라'가 아니에요.",
    en: "H is always silent! 'hola' = 'ola'. Never pronounce it.",
    id: "Huruf h dalam bahasa Spanyol selalu bisu! 'hola' dibaca 'ola'. Jangan diucapkan.",
  },
  silent_u: { // gue/gui
    ko: "gue/gui에서 u는 소리 안 나요! guerra = '게라', guitarra = '기타라'",
    en: "U is silent in gue/gui. 'guerra' = 'geh-rra', 'guitarra' = 'gee-tah-rra'.",
    id: "Huruf u bisu pada gue/gui. 'guerra' = 'ge-rra', 'guitarra' = 'gi-ta-rra'.",
  },
  vowels_es: {
    ko: "스페인어 모음은 항상 짧고 깨끗! 영어처럼 늘리지 마세요. 한국어 모음과 비슷해요.",
    en: "Spanish vowels are pure and short. Never glide like English vowels (no 'ay', just 'e').",
    id: "Vokal Spanyol selalu pendek dan jelas. Jangan diluncurkan seperti vokal Inggris. Mirip vokal Indonesia.",
  },
  // diphthongs / stress
  stress_es: {
    ko: "강세 위치가 중요해요! 강세 있는 음절을 더 세고 길게 발음하세요.",
    en: "Stress placement matters! Emphasize the stressed syllable clearly.",
    id: "Letak tekanan penting! Ucapkan suku kata yang ditekan lebih kuat dan jelas.",
  },
  j_es: { // "y" / "ll" sound
    ko: "'ㅈ'이 아니라 '이'를 빠르게 내는 느낌. 영어 'yes'의 y와 비슷해요.",
    en: "Like 'y' in 'yes'. Don't make it too strong like English 'j'.",
    id: "Seperti 'y' pada 'yang', bukan bunyi j. Jangan terlalu kuat seperti j Inggris.",
  },
};

// ── Korean phonemes (for learners of Korean) ─────────────────────────────

const KOREAN_PHONEMES: PhonemeMap = {
  // ── 3-way stops ─────────────────────────────
  ㄱ: {
    en: "Soft 'g/k'. Less air than English 'k', but not tense. Between 'g' and 'k'.",
    es: "Como una 'g' suave. Menos aire que la 'k' inglesa.",
    id: "Bunyi 'g/k' lembut. Lebih sedikit udara daripada k Inggris, tetapi tidak tegang. Di antara g dan k.",
  },
  ㅋ: {
    en: "Aspirated 'k' with a strong puff of air. Like English 'k' in 'key'.",
    es: "Como 'k' con mucho aire. Ponga la mano delante y sienta el aire.",
    id: "Bunyi 'k' beraspirasi dengan hembusan udara kuat. Letakkan tangan di depan mulut dan rasakan udaranya.",
  },
  ㄲ: {
    en: "Tense 'kk'. Tighten your throat, NO air puff. Like 'sk' in 'sky' without the 's'.",
    es: "Tensa la garganta, sin aire. Como 'k' después de 's' en 'sky'.",
    id: "Bunyi 'kk' tegang. Kencangkan tenggorokan, TANPA hembusan udara. Seperti 'k' pada 'sky' tanpa 's'.",
  },
  ㄷ: {
    en: "Soft 'd/t'. Less air than English 't'. Between 'd' and 't'.",
    es: "Como una 'd' suave. Menos explosiva que la 't' inglesa.",
    id: "Bunyi 'd/t' lembut. Lebih sedikit udara daripada t Inggris. Di antara d dan t.",
  },
  ㅌ: {
    en: "Aspirated 't' with strong air. Like English 't' in 'top'.",
    es: "Como 't' con mucho aire. Sienta la explosión de aire.",
    id: "Bunyi 't' beraspirasi dengan udara kuat. Rasakan hembusan udaranya.",
  },
  ㄸ: {
    en: "Tense 'tt'. Tighten your throat, NO air. Like 'st' in 'stop' without the 's'.",
    es: "Tensa la garganta. Como 't' después de 's' en 'stop'.",
    id: "Bunyi 'tt' tegang. Kencangkan tenggorokan, TANPA udara. Seperti 't' pada 'stop' tanpa 's'.",
  },
  ㅂ: {
    en: "Soft 'b/p'. Less air than English 'p'. Between 'b' and 'p'.",
    es: "Como una 'b' suave. Menos aire que la 'p' inglesa.",
    id: "Bunyi 'b/p' lembut. Lebih sedikit udara daripada p Inggris. Di antara b dan p.",
  },
  ㅍ: {
    en: "Aspirated 'p' with strong air. Like English 'p' in 'pen'.",
    es: "Como 'p' con mucho aire. Suelte una bocanada de aire.",
    id: "Bunyi 'p' beraspirasi dengan udara kuat. Lepaskan satu hembusan udara.",
  },
  ㅃ: {
    en: "Tense 'pp'. Tighten your throat, NO air. Like 'sp' in 'spy' without the 's'.",
    es: "Tensa la garganta. Como 'p' después de 's' en 'spy'.",
    id: "Bunyi 'pp' tegang. Kencangkan tenggorokan, TANPA udara. Seperti 'p' pada 'spy' tanpa 's'.",
  },
  // ── 3-way affricates ─────────────────────────
  ㅈ: {
    en: "Soft 'j'. Like 'j' in 'judge' but softer and less air.",
    es: "Como 'ch' suave. Menos aire que la 'ch' española.",
    id: "Bunyi 'j' lembut. Seperti j pada 'jam' tetapi lebih lembut dan lebih sedikit udara.",
  },
  ㅊ: {
    en: "Aspirated 'ch' with air. Like English 'ch' in 'church'.",
    es: "Como 'ch' con mucho aire. Igual que 'ch' en 'chico' pero con más fuerza.",
    id: "Bunyi 'c' beraspirasi dengan udara. Seperti c pada 'cinta' tetapi dengan hembusan lebih kuat.",
  },
  ㅉ: {
    en: "Tense 'jj'. Tighten your throat, NO air. Very tense 'j' sound.",
    es: "Tensa la garganta. 'Ch' muy tensa sin aire.",
    id: "Bunyi 'jj' tegang. Kencangkan tenggorokan, TANPA udara. Bunyi 'c' yang sangat tegang.",
  },
  // ── Vowels ─────────────────────────────────
  ㅓ: {
    en: "Open your mouth like 'uh' but rounder. NOT like English 'o'. Think 'aw' but shorter.",
    es: "Abra la boca como para 'o' pero más abierta. Entre 'o' y 'a'.",
    id: "Buka mulut seperti untuk 'o' tetapi lebih lebar. BUKAN seperti 'o' Inggris. Bunyinya di antara 'o' dan 'a'.",
  },
  ㅗ: {
    en: "Pure 'o' sound. Round your lips. Don't glide like English 'oh'.",
    es: "Como la 'o' española. Redondee los labios. Muy similar.",
    id: "Bunyi 'o' murni. Bulatkan bibir. Jangan diluncurkan seperti 'oh' Inggris. Mirip o Indonesia.",
  },
  ㅡ: {
    en: "No English equivalent! Spread lips wide like 'ee' but tongue is LOW and back. Say 'uh' with spread lips.",
    es: "No existe en español. Labios extendidos como 'i' pero lengua baja y atrás.",
    id: "Tidak ada padanannya di bahasa Indonesia! Tarik bibir ke samping seperti 'i', tetapi lidah RENDAH dan ke belakang.",
  },
  ㅢ: {
    en: "Start with ㅡ and glide to 'ee'. Two sounds combined: 'eu' + 'i'.",
    es: "Empiece con ㅡ y deslice hacia 'i'. Dos sonidos juntos.",
    id: "Mulai dari ㅡ lalu meluncur ke 'i'. Dua bunyi yang digabung: 'eu' + 'i'.",
  },
  ㅐ: {
    en: "Like 'e' in 'bed'. Modern Korean: same as ㅔ for most speakers.",
    es: "Como la 'e' española. Muy similar.",
    id: "Seperti e pada 'enak'. Dalam bahasa Korea modern, sama dengan ㅔ bagi kebanyakan penutur.",
  },
  ㅔ: {
    en: "Like 'e' in 'bed'. Almost identical to ㅐ in modern Korean.",
    es: "Como la 'e' española.",
    id: "Seperti e pada 'enak'. Hampir sama dengan ㅐ dalam bahasa Korea modern.",
  },
  // ── Special consonants ─────────────────────
  ㄹ: {
    en: "Between English 'r' and 'l'! At start/between vowels: tap like 't' in 'butter'. At end: like 'l'.",
    es: "Como la 'r' simple española (pero/caro). Al final de sílaba: como 'l'.",
    id: "Di antara 'r' dan 'l'! Di awal atau antara vokal: ketuk seperti r Indonesia pada 'cara'. Di akhir suku kata: seperti 'l'.",
  },
  // ── Final consonants (받침) ────────────────
  받침: {
    en: "Final consonants are UNRELEASED. Don't add a vowel sound after! 'bap' not 'ba-puh'.",
    es: "Las consonantes finales NO se sueltan. No añada vocal después.",
    id: "Konsonan di akhir TIDAK dilepaskan. Jangan menambahkan bunyi vokal sesudahnya! 'bap', bukan 'ba-pe'.",
  },
  // ── Double vowels ──────────────────────────
  ㅘ: {
    en: "Combine 'w' + 'a'. Start with rounded lips, open quickly.",
    es: "Como 'ua' en 'cuando'. Empiece con labios redondos.",
    id: "Gabungkan 'w' + 'a'. Mulai dengan bibir bulat, lalu buka dengan cepat.",
  },
  ㅝ: {
    en: "Combine 'w' + 'uh'. Round lips for 'w', then open to ㅓ.",
    es: "Como 'uo' pero el segundo sonido es ㅓ (entre 'o' y 'a').",
    id: "Gabungkan 'w' + ㅓ. Bulatkan bibir untuk 'w', lalu buka ke bunyi ㅓ (di antara 'o' dan 'a').",
  },
  // ── IPA symbols Azure returns for Korean ───
  ɾ: { // flap ㄹ between vowels
    en: "Quick tongue tap behind upper teeth. Like 't' in American 'butter'. Very fast and light.",
    es: "Toque rápido de lengua. Igual que la 'r' simple española en 'pero'.",
    id: "Ketukan lidah cepat di belakang gigi atas. Seperti r Indonesia pada 'cara'. Sangat cepat dan ringan.",
  },
  ŋ: { // final ㅇ nasal
    en: "Nasal 'ng' like in English 'sing'. Don't release with a 'g' sound at the end.",
    es: "Nasal como 'ng' en inglés 'sing'. No suelte con sonido 'g' al final.",
    id: "Bunyi sengau 'ng' seperti pada 'bang'. Jangan dilepaskan dengan bunyi 'g' di akhir.",
  },
  tɕ: { // ㅈ as IPA
    en: "Like 'j' in 'judge' but lighter. Tongue touches the roof of mouth briefly.",
    es: "Como 'ch' suave. La lengua toca el paladar brevemente.",
    id: "Seperti j pada 'jam' tetapi lebih ringan. Lidah menyentuh langit-langit mulut sebentar.",
  },
  tɕʰ: { // ㅊ as IPA
    en: "Like 'ch' in 'church' with a strong puff of air. Aspirated.",
    es: "Como 'ch' en 'chico' pero con mucho aire. Aspirada.",
    id: "Seperti c pada 'cinta' dengan hembusan udara kuat. Beraspirasi.",
  },
  dʑ: { // voiced ㅈ
    en: "Voiced version of 'j'. Like English 'j' in 'judge'. Vocal cords vibrate.",
    es: "Versión sonora de 'j'. Como la 'y' en 'yo' (Argentina).",
    id: "Versi bersuara dari 'j'. Seperti j pada 'jam' dengan getaran pita suara.",
  },
  ɕ: { // ㅅ before i/y
    en: "Like 'sh' but with tongue closer to teeth. Korean ㅅ before 'i' sounds.",
    es: "Como 'sh' pero con la lengua más cerca de los dientes.",
    id: "Seperti 'sy' tetapi lidah lebih dekat ke gigi. Bunyi ㅅ Korea sebelum bunyi 'i'.",
  },
  s͈: { // tense ㅆ
    en: "Tense 'ss'. Tighten your throat and hold the 's' longer. No air puff.",
    es: "Tensa la garganta y alarga la 's'. Sin aire extra.",
    id: "Bunyi 'ss' tegang. Kencangkan tenggorokan dan tahan 's' lebih lama. Tanpa hembusan udara.",
  },
  p͈: { // tense ㅃ
    en: "Tense 'pp'. Tighten throat, NO air puff. Like 'sp' in 'spy' without the 's'.",
    es: "Tensa la garganta. Como 'p' después de 's' en 'spy'.",
    id: "Bunyi 'pp' tegang. Kencangkan tenggorokan, TANPA hembusan udara. Seperti 'p' pada 'spy' tanpa 's'.",
  },
  t͈: { // tense ㄸ
    en: "Tense 'tt'. Tighten throat, NO air puff. Like 'st' in 'stop' without the 's'.",
    es: "Tensa la garganta. Como 't' después de 's' en 'stop'.",
    id: "Bunyi 'tt' tegang. Kencangkan tenggorokan, TANPA hembusan udara. Seperti 't' pada 'stop' tanpa 's'.",
  },
  k͈: { // tense ㄲ
    en: "Tense 'kk'. Tighten throat, NO air puff. Like 'sk' in 'sky' without the 's'.",
    es: "Tensa la garganta. Como 'k' después de 's' en 'sky'.",
    id: "Bunyi 'kk' tegang. Kencangkan tenggorokan, TANPA hembusan udara. Seperti 'k' pada 'sky' tanpa 's'.",
  },
  kʰ: { // ㅋ as IPA
    en: "Aspirated 'k'. Strong puff of air. Like English 'k' in 'key'.",
    es: "Como 'k' con mucho aire. Ponga la mano delante y sienta el aire.",
    id: "Bunyi 'k' beraspirasi. Hembusan udara kuat. Seperti k Inggris pada 'key'.",
  },
  tʰ: { // ㅌ as IPA
    en: "Aspirated 't'. Strong puff of air. Like English 't' in 'top'.",
    es: "Como 't' con mucho aire. Sienta la explosión.",
    id: "Bunyi 't' beraspirasi. Hembusan udara kuat. Seperti t Inggris pada 'top'.",
  },
  pʰ: { // ㅍ as IPA
    en: "Aspirated 'p'. Strong puff of air. Like English 'p' in 'pen'.",
    es: "Como 'p' con mucho aire. Suelte una bocanada de aire.",
    id: "Bunyi 'p' beraspirasi. Hembusan udara kuat. Seperti p Inggris pada 'pen'.",
  },
  j: { // glide in ㅑ, ㅕ, ㅠ etc.
    en: "Glide sound like 'y' in 'yes'. Tongue is high and front. Quick transition.",
    es: "Sonido deslizante como 'y' en 'yo'. Lengua alta y adelante. Transición rápida.",
    id: "Bunyi luncuran seperti 'y' pada 'yang'. Lidah tinggi dan di depan. Peralihan cepat.",
  },
  w: { // glide in ㅘ, ㅚ etc.
    en: "Glide sound like 'w' in 'water'. Round your lips quickly before the vowel.",
    es: "Sonido deslizante como 'w' en 'water'. Redondee los labios rápido.",
    id: "Bunyi luncuran seperti 'w' pada 'wajah'. Bulatkan bibir dengan cepat sebelum vokal.",
  },
};

// ── Master lookup ────────────────────────────────────────────────────────

const INDONESIAN_PHONEMES: PhonemeMap = {
  r: {
    ko: "인도네시아어 r은 혀끝을 가볍게 굴리는 소리예요. 너무 영어 r처럼 뒤로 당기지 마세요.",
    en: "Indonesian r is a light tongue tap or roll. Don't pull it back like English r.",
    es: "La r indonesia vibra o se toca con la punta de la lengua. No la pronuncies como la r inglesa.",
    id: "Bunyikan r dengan getaran ringan di ujung lidah, jangan ditarik ke belakang seperti r Inggris.",
  },
  ng: {
    ko: "ng는 목 뒤쪽에서 나는 콧소리예요. 한국어 받침 ㅇ처럼 코로 울려 보세요.",
    en: "Make ng from the back of the mouth, like the final sound in 'sing'.",
    es: "Haz ng desde la parte posterior de la boca, como el sonido final de 'sing'.",
    id: "Bunyikan ng dari belakang mulut, seperti bunyi akhir pada kata Inggris 'sing'.",
  },
  e: {
    ko: "e는 너무 길게 끌지 말고 짧고 또렷하게 말해 보세요.",
    en: "Keep e short and clear. Avoid stretching it into a long English-style vowel.",
    es: "Mantén la e corta y clara. No la alargues como una vocal inglesa.",
    id: "Ucapkan e dengan pendek dan jelas. Jangan terlalu dipanjangkan.",
  },
  a: {
    ko: "a는 입을 편하게 열고 한국어 '아'처럼 밝게 내면 좋아요.",
    en: "Open your mouth comfortably for a, like a clear 'ah'.",
    es: "Abre la boca de forma natural para la a, como una 'a' clara.",
    id: "Buka mulut dengan nyaman untuk bunyi a, seperti 'ah' yang jelas.",
  },
  t: {
    ko: "t는 짧고 깨끗하게 끊어 주세요. 영어처럼 숨을 세게 터뜨릴 필요는 없어요.",
    en: "Keep t short and clean. You do not need the strong English puff of air.",
    es: "Haz la t breve y limpia. No hace falta aspirarla como en inglés.",
    id: "Ucapkan t dengan pendek dan jelas. Tidak perlu hembusan udara kuat seperti bahasa Inggris.",
  },
  k: {
    ko: "k는 짧게 닫았다가 열어 주세요. 문장 끝에서는 너무 세게 터뜨리지 않아도 됩니다.",
    en: "Make k short and crisp. At the end of a word, it can be unreleased and gentle.",
    es: "Haz la k breve y clara. Al final de palabra puede ser suave, sin explosión fuerte.",
    id: "Ucapkan k dengan pendek dan jelas. Di akhir kata, bunyinya boleh lembut.",
  },
};

// ── Arabic phonemes — Modern Standard Arabic / MSA (for learners of Arabic) ──
// Keyed for Azure ar-EG Pronunciation Assessment phoneme output. Azure emits
// IPA-style symbols, so each emphatic/guttural is keyed by its IPA token AND by
// the Arabic letter as a fallback (the lookup also tries lowercase + stripped).
// Tip values carry ko/en/es/id — the same 4-key native-reader shape as
// INDONESIAN_PHONEMES (NO 5th "ar" key; Arabic is a target, not a UI language).
// Focus: the emphatics (ص ض ط ظ) and gutturals (ع ح ق خ غ) that are hardest for
// learners, plus a few common consonants/vowels a beginner needs.
const ARABIC_PHONEMES: PhonemeMap = {
  // ── Emphatic (velarized) consonants ────────────
  "sˤ": { // ص — emphatic s
    ko: "ص는 'ㅅ'을 혀 뒤쪽을 목구멍 쪽으로 당기며 묵직하게 내요. 일반 'س(s)'보다 입안이 더 넓어요.",
    en: "ص is a 'heavy' s: say s while pulling the back of the tongue toward the throat. Darker than plain س (s).",
    es: "ص es una 's' enfática: pronúnciala tirando la parte trasera de la lengua hacia la garganta. Más grave que la س normal.",
    id: "ص adalah s 'berat': ucapkan s sambil menarik pangkal lidah ke arah tenggorokan. Lebih gelap daripada س biasa.",
  },
  "dˤ": { // ض — emphatic d
    ko: "ض는 묵직한 'ㄷ'이에요. 혀를 넓게 펴고 뒤쪽을 목구멍으로 당기며 발음해요. 아랍어의 상징적인 소리예요.",
    en: "ض is a 'heavy' d. Spread the tongue and pull its back toward the throat. This is the iconic Arabic sound.",
    es: "ض es una 'd' enfática. Aplana la lengua y tira su parte trasera hacia la garganta. Es el sonido emblemático del árabe.",
    id: "ض adalah d 'berat'. Lebarkan lidah dan tarik pangkalnya ke tenggorokan. Ini bunyi khas bahasa Arab.",
  },
  "tˤ": { // ط — emphatic t
    ko: "ط는 묵직한 'ㄷ/ㅌ'이에요. 일반 'ت(t)'보다 혀를 더 넓고 무겁게, 목 안쪽 울림과 함께 내요.",
    en: "ط is a 'heavy' t. Heavier and darker than plain ت (t) — flatten the tongue and add a throaty resonance.",
    es: "ط es una 't' enfática. Más grave que la ت normal: aplana la lengua y añade resonancia desde la garganta.",
    id: "ط adalah t 'berat'. Lebih berat dan gelap daripada ت biasa — lebarkan lidah dan beri resonansi dari tenggorokan.",
  },
  "ðˤ": { // ظ — emphatic dh (MSA: emphatic counterpart of ذ)
    ko: "ظ는 묵직한(강세) 'ð(this의 th)'예요. 표준 아랍어에서는 혀를 이 사이로 내밀고 성대를 울리며 묵직하게 내는 ذ의 강세 버전이에요.",
    en: "ظ is the emphatic (heavy) voiced 'th' (as in 'this'). In MSA it's the emphatic counterpart of ذ (dh) — tongue between the teeth, voiced, pulled dark.",
    es: "ظ es la 'th' sonora enfática (como en 'this'), grave. En árabe estándar es la versión enfática de ذ (dh): lengua entre los dientes, con vibración.",
    id: "ظ adalah 'th' bersuara yang emfatik (seperti 'this'), berat. Dalam bahasa Arab standar, ini versi emfatik dari ذ (dh): lidah di antara gigi, bersuara.",
  },
  // ── Gutturals (pharyngeal / uvular / velar) ────
  "ʕ": { // ع — voiced pharyngeal
    ko: "ع는 목구멍 깊은 곳을 살짝 조이며 울리는 소리예요. 한국어에 없어요. 'ㅏ' 하면서 목을 가볍게 조여 보세요.",
    en: "ع is a voiced sound made by gently squeezing deep in the throat. No English equivalent — try saying 'ah' while tightening your throat.",
    es: "ع es un sonido sonoro hecho apretando suavemente lo profundo de la garganta. No existe en español: di 'a' apretando la garganta.",
    id: "ع adalah bunyi bersuara dari menekan lembut bagian dalam tenggorokan. Tak ada di bahasa Indonesia — ucapkan 'a' sambil menyempitkan tenggorokan.",
  },
  "ħ": { // ح — voiceless pharyngeal
    ko: "ح는 목구멍 깊은 곳에서 내쉬는 강한 'ㅎ'이에요. 'هـ(h)'보다 훨씬 거칠고 목에서 긁히는 느낌이에요.",
    en: "ح is a strong, breathy h made deep in the throat — much rougher than ه (h), like fogging a mirror from the throat.",
    es: "ح es una 'h' fuerte y áspera desde lo profundo de la garganta — mucho más ronca que la ه (h).",
    id: "ح adalah h yang kuat dan berdesah dari dalam tenggorokan — jauh lebih kasar daripada ه (h).",
  },
  "q": { // ق — voiceless uvular stop
    ko: "ق는 'ㅋ'보다 훨씬 뒤, 목젖에서 막았다 터뜨려요. 표준 아랍어에서는 또렷한 'q'로 발음해요(구어 방언처럼 ʔ로 바꾸지 않아요).",
    en: "ق is a 'k' made far back at the uvula. In Modern Standard Arabic it's pronounced as a clear uvular q (not a glottal stop).",
    es: "ق es una 'k' producida muy atrás, en la úvula. En árabe estándar se pronuncia como una q uvular clara (no como golpe glotal).",
    id: "ق adalah 'k' yang dibuat jauh di belakang, di anak tekak. Dalam bahasa Arab standar diucapkan sebagai q yang jelas (bukan hentian glotal).",
  },
  "x": { // خ — voiceless velar fricative
    ko: "خ는 목 뒤에서 거칠게 긁는 소리예요. 스페인어 'j(jota)'나 독일어 'Bach'의 'ch'와 같아요.",
    en: "خ is a rasping sound from the back of the throat, like the 'ch' in German 'Bach' or Spanish 'j'.",
    es: "خ es como la 'j' española (jota): un sonido raspado en la parte de atrás de la garganta.",
    id: "خ adalah bunyi serak dari belakang tenggorokan, seperti 'kh' pada 'khusus' atau 'ch' Jerman pada 'Bach'.",
  },
  "ɣ": { // غ — voiced velar fricative
    ko: "غ는 خ의 울림 있는 버전이에요. 프랑스어 'r'처럼 목 뒤에서 가글하듯 울려요.",
    en: "غ is the voiced version of خ — a gargling sound at the back of the throat, like a French 'r'.",
    es: "غ es la versión sonora de خ: un sonido de gárgaras al fondo de la garganta, como la 'r' francesa.",
    id: "غ adalah versi bersuara dari خ — bunyi seperti berkumur di belakang tenggorokan, mirip 'r' Prancis.",
  },
  // ── Other consonants beginners need ────────────
  "ʔ": { // ء / همزة — glottal stop
    ko: "ء(함자)는 성문 정지음이에요. '아_아'처럼 목을 순간적으로 막았다 여는 소리예요.",
    en: "ء (hamza) is a glottal stop — the catch in the middle of 'uh-oh'.",
    es: "ء (hamza) es un golpe glotal — el corte en medio de 'uh-oh'.",
    id: "ء (hamzah) adalah hentian glotal — jeda di tengah 'uh-oh'.",
  },
  "r": { // ر — alveolar tap/trill
    ko: "ر는 혀끝을 잇몸에 가볍게 한 번 튕기거나 굴려요. 스페인어 'r'와 비슷하고 영어 'r'처럼 당기지 않아요.",
    en: "ر is a tapped or rolled r — flick the tongue tip once at the ridge. Like Spanish 'r', not the pulled-back English r.",
    es: "ر es una 'r' de toque o vibrante — como la 'r' española en 'pero' o 'perro'. Muy natural para ti.",
    id: "ر adalah r yang diketuk atau digetarkan — sentil ujung lidah sekali di gusi. Mirip r Indonesia, bukan r Inggris.",
  },
  // ── Common MSA consonants beginners get wrong ──
  "θ": { // ث — voiceless 'th'
    ko: "ث는 영어 'think'의 th예요. 혀끝을 윗니와 아랫니 사이로 살짝 내밀고 바람만 내요. 'س(s)'와 헷갈리지 마세요.",
    en: "ث is the 'th' in 'think'. Put the tongue tip lightly between the teeth and push air — don't turn it into س (s).",
    es: "ث es la 'th' de 'think' (como la 'z' del español de España). Saca un poco la lengua entre los dientes y sopla; no la cambies por س (s).",
    id: "ث adalah 'th' seperti pada 'think'. Julurkan ujung lidah sedikit di antara gigi dan embuskan udara — jangan diubah menjadi س (s).",
  },
  "ʃ": { // ش — voiceless postalveolar fricative
    ko: "ش는 영어 'sh' 소리예요. 입술을 살짝 둥글게 모으고 혀를 입천장 가까이 올려 'ㅅ'보다 부드럽게 바람을 내요.",
    en: "ش is 'sh' as in 'ship'. Round the lips slightly, raise the tongue toward the palate, and let air flow softly.",
    es: "ش es 'sh' como en el inglés 'ship'. Redondea un poco los labios, sube la lengua hacia el paladar y deja salir el aire.",
    id: "ش adalah bunyi 'sy' seperti pada 'syukur'. Bulatkan bibir sedikit, naikkan lidah ke arah langit-langit, dan embuskan udara lembut.",
  },
  "dʒ": { // ج — voiced postalveolar affricate (MSA standard)
    ko: "ج는 영어 'judge'의 j예요. 혀를 입천장에 붙였다 떼며 성대를 울려요. (방언에 따라 'ㄱ'이나 'ㅈ'처럼도 나지만 표준은 j예요.)",
    en: "ج is the 'j' in 'judge' — touch the tongue to the palate and release with voice. (Dialects vary to a hard g or zh, but MSA uses j.)",
    es: "ج es la 'j' del inglés 'judge': la lengua toca el paladar y se suelta con vibración. (En dialectos suena como g o como 'y', pero el estándar es 'j'.)",
    id: "ج adalah 'j' seperti pada 'jam'. Tempelkan lidah ke langit-langit lalu lepaskan dengan bersuara. (Dialek bisa terdengar seperti g atau zh, tetapi standarnya j.)",
  },
  "f": { // ف — voiceless labiodental fricative
    ko: "ف는 윗니로 아랫입술을 살짝 물고 바람만 내요. 인도네시아어/영어 f와 같아요.",
    en: "ف is f — upper teeth touch the lower lip and push air, just like English f.",
    es: "ف es como la 'f' española: los dientes superiores tocan el labio inferior y sale el aire.",
    id: "ف adalah f — gigi atas menyentuh bibir bawah dan mengembuskan udara, sama seperti f Indonesia.",
  },
  "k": { // ك — voiceless velar stop
    ko: "ك는 일반 'ㅋ' 소리예요. 혀 뒤를 여린입천장에 붙였다 떼요. ق(더 뒤쪽 'q')와 헷갈리지 마세요.",
    en: "ك is a normal k — the back of the tongue touches the soft palate. Don't confuse it with the deeper ق (q).",
    es: "ك es una 'k' normal: el dorso de la lengua toca el velo del paladar. No la confundas con la ق (q), más profunda.",
    id: "ك adalah k biasa — pangkal lidah menyentuh langit-langit lunak. Jangan tertukar dengan ق (q) yang lebih ke belakang.",
  },
  // ── Short vowels (harakat) — contrast with the long vowels ─
  "a": { // فتحة fatḥah — short a
    ko: "짧은 모음 'a'(파트하)는 짧고 가볍게 '아'예요. 긴 'aː(ا)'처럼 끌지 말고 한 박자만 내요.",
    en: "Short 'a' (fatḥah) is a quick, light 'ah'. Keep it short — don't stretch it like long 'aa' (ا).",
    es: "La 'a' corta (fatha) es una 'a' breve y ligera. No la alargues como la 'aa' larga (ا).",
    id: "Vokal pendek 'a' (fathah) adalah 'a' yang singkat dan ringan. Jangan dipanjangkan seperti 'aa' panjang (ا).",
  },
  "i": { // كسرة kasrah — short i
    ko: "짧은 모음 'i'(카스라)는 짧은 '이'예요. 긴 'iː(ي)'와 달리 길게 빼지 말고 짧게 끊어요.",
    en: "Short 'i' (kasrah) is a brief 'ih'. Unlike long 'ee' (ي), cut it short.",
    es: "La 'i' corta (kasra) es una 'i' breve. A diferencia de la 'ii' larga (ي), córtala.",
    id: "Vokal pendek 'i' (kasrah) adalah 'i' yang singkat. Berbeda dengan 'ii' panjang (ي), ucapkan dengan pendek.",
  },
  "u": { // ضمة ḍammah — short u
    ko: "짧은 모음 'u'(담마)는 입술을 살짝 둥글게 한 짧은 '우'예요. 긴 'uː(و)'처럼 끌지 마세요.",
    en: "Short 'u' (ḍammah) is a brief, lightly rounded 'oo'. Don't hold it like long 'oo' (و).",
    es: "La 'u' corta (damma) es una 'u' breve y poco redondeada. No la sostengas como la 'uu' larga (و).",
    id: "Vokal pendek 'u' (dhammah) adalah 'u' singkat dengan bibir sedikit dibulatkan. Jangan ditahan seperti 'uu' panjang (و).",
  },
  // ── Long vs short vowels (length is meaningful) ─
  "aː": { // ا — long a (alif)
    ko: "긴 모음 'aː'는 짧은 'a'보다 두 배 길게 끌어요. 아랍어에서 길이가 뜻을 바꾸니 충분히 길게 내세요.",
    en: "Long 'aa' is held about twice as long as short 'a'. Vowel length changes meaning in Arabic, so stretch it fully.",
    es: "La 'aa' larga dura el doble que la 'a' corta. En árabe la duración cambia el significado, así que alárgala bien.",
    id: "Vokal panjang 'aa' ditahan sekitar dua kali lebih lama dari 'a' pendek. Panjang vokal mengubah makna dalam bahasa Arab.",
  },
  "iː": { // ي — long i
    ko: "긴 모음 'iː'는 'ㅣ'를 길게 빼요. 짧은 'i'와 길이로 구분되니 충분히 길게 유지하세요.",
    en: "Long 'ee' is a sustained 'ee'. It contrasts with short 'i' purely by length, so hold it.",
    es: "La 'ii' larga es una 'i' sostenida. Se distingue de la 'i' corta solo por la duración, así que mantenla.",
    id: "Vokal panjang 'ii' adalah 'i' yang ditahan. Bedanya dengan 'i' pendek hanya pada panjangnya, jadi tahan.",
  },
  "uː": { // و — long u
    ko: "긴 모음 'uː'는 입술을 둥글게 모아 'ㅜ'를 길게 빼요. 짧은 'u'와 길이로 구분돼요.",
    en: "Long 'oo' is a sustained, rounded 'oo'. It contrasts with short 'u' by length.",
    es: "La 'uu' larga es una 'u' redondeada y sostenida. Se distingue de la 'u' corta por la duración.",
    id: "Vokal panjang 'uu' adalah 'u' bulat yang ditahan. Bedanya dengan 'u' pendek pada panjangnya.",
  },
  // ── Arabic-letter keys (fallback if a consumer passes the letter) ──
  "ص": {
    ko: "ص는 묵직한 'ㅅ'이에요. 혀 뒤쪽을 목구멍으로 당기며 내요.",
    en: "ص is a 'heavy' (emphatic) s — pull the back of the tongue toward the throat.",
    es: "ص es una 's' enfática — tira la parte trasera de la lengua hacia la garganta.",
    id: "ص adalah s 'berat' (emfatik) — tarik pangkal lidah ke tenggorokan.",
  },
  "ض": {
    ko: "ض는 묵직한 'ㄷ'이에요. 혀를 넓게 펴고 뒤쪽을 당기며 내는 아랍어의 상징적 소리예요.",
    en: "ض is a 'heavy' (emphatic) d — the iconic Arabic sound. Spread the tongue and pull its back.",
    es: "ض es una 'd' enfática — el sonido emblemático del árabe. Aplana la lengua y tira atrás.",
    id: "ض adalah d 'berat' (emfatik) — bunyi khas bahasa Arab. Lebarkan lidah dan tarik pangkalnya.",
  },
  "ط": {
    ko: "ط는 묵직한 'ㅌ'이에요. 일반 'ت'보다 혀를 더 넓고 무겁게 내요.",
    en: "ط is a 'heavy' (emphatic) t — heavier and darker than plain ت.",
    es: "ط es una 't' enfática — más grave que la ت normal.",
    id: "ط adalah t 'berat' (emfatik) — lebih berat daripada ت biasa.",
  },
  "ظ": {
    ko: "ظ는 묵직한(강세) 'ð'예요. 표준 아랍어에서는 ذ(this의 th)의 강세 버전이에요.",
    en: "ظ is the emphatic voiced 'th' — in MSA, the emphatic counterpart of ذ (dh).",
    es: "ظ es la 'th' sonora enfática — en árabe estándar, la versión enfática de ذ (dh).",
    id: "ظ adalah 'th' bersuara emfatik — dalam bahasa Arab standar, versi emfatik dari ذ (dh).",
  },
  "ع": {
    ko: "ع는 목구멍 깊은 곳을 조이며 울리는 소리예요. 한국어에 없어요.",
    en: "ع is a voiced pharyngeal sound — squeeze deep in the throat. No English equivalent.",
    es: "ع es un sonido faríngeo sonoro — aprieta lo profundo de la garganta. No existe en español.",
    id: "ع adalah bunyi faring bersuara — tekan bagian dalam tenggorokan. Tak ada padanannya.",
  },
  "ح": {
    ko: "ح는 목구멍 깊은 곳에서 내쉬는 강한 'ㅎ'이에요. 'هـ'보다 훨씬 거칠어요.",
    en: "ح is a strong, breathy pharyngeal h — much rougher than ه.",
    es: "ح es una 'h' faríngea fuerte y áspera — mucho más ronca que la ه.",
    id: "ح adalah h faring yang kuat dan berdesah — jauh lebih kasar daripada ه.",
  },
  "ق": {
    ko: "ق는 목젖에서 막았다 터뜨리는 'ㅋ'이에요. 표준 아랍어에서는 또렷한 'q'로 발음해요(ʔ로 바꾸지 않아요).",
    en: "ق is a uvular k. In Modern Standard Arabic it's pronounced as a clear uvular q (not a glottal stop).",
    es: "ق es una 'k' uvular. En árabe estándar se pronuncia como una q clara (no un golpe glotal).",
    id: "ق adalah 'k' uvular. Dalam bahasa Arab standar diucapkan sebagai q yang jelas (bukan hentian glotal).",
  },
  "خ": {
    ko: "خ는 목 뒤에서 거칠게 긁는 소리예요. 스페인어 'j'나 'Bach'의 'ch'와 같아요.",
    en: "خ is a rasping velar sound, like the 'ch' in 'Bach' or Spanish 'j'.",
    es: "خ es como la 'j' española — un sonido raspado atrás.",
    id: "خ adalah bunyi serak velar, seperti 'kh' atau 'ch' Jerman pada 'Bach'.",
  },
  "غ": {
    ko: "غ는 خ의 울림 있는 버전이에요. 프랑스어 'r'처럼 가글하듯 내요.",
    en: "غ is the voiced version of خ — a gargling sound, like a French 'r'.",
    es: "غ es la versión sonora de خ — como la 'r' francesa, de gárgaras.",
    id: "غ adalah versi bersuara dari خ — seperti 'r' Prancis, bunyi berkumur.",
  },
  "ث": {
    ko: "ث는 영어 'think'의 th예요. 혀끝을 이 사이로 내밀고 바람만 내요. 'س(s)'로 바꾸지 마세요.",
    en: "ث is the 'th' in 'think' — tongue tip between the teeth, push air. Don't replace it with س (s).",
    es: "ث es la 'th' de 'think' (la 'z' de España) — lengua entre los dientes, sopla. No la cambies por س (s).",
    id: "ث adalah 'th' seperti pada 'think' — ujung lidah di antara gigi, embuskan udara. Jangan diubah menjadi س (s).",
  },
  "ش": {
    ko: "ش는 영어 'sh' 소리예요. 입술을 살짝 둥글게 하고 부드럽게 바람을 내요.",
    en: "ش is 'sh' as in 'ship' — round the lips slightly and let air flow softly.",
    es: "ش es 'sh' como en 'ship' — redondea un poco los labios y deja salir el aire.",
    id: "ش adalah bunyi 'sy' seperti pada 'syukur' — bulatkan bibir sedikit dan embuskan udara lembut.",
  },
  "ج": {
    ko: "ج는 표준 아랍어에서 영어 'judge'의 j예요. 혀를 입천장에 붙였다 떼며 성대를 울려요.",
    en: "ج is the 'j' in 'judge' in MSA — touch the tongue to the palate and release with voice.",
    es: "ج es la 'j' del inglés 'judge' en árabe estándar — la lengua toca el paladar y se suelta con vibración.",
    id: "ج adalah 'j' seperti pada 'jam' dalam bahasa Arab standar — tempelkan lidah ke langit-langit lalu lepaskan dengan bersuara.",
  },
};

const DB: Record<string, PhonemeMap> = {
  english: ENGLISH_PHONEMES,
  spanish: SPANISH_PHONEMES,
  korean: KOREAN_PHONEMES,
  indonesian: INDONESIAN_PHONEMES,
  arabic: ARABIC_PHONEMES,
};

/**
 * Get a coaching tip for a specific phoneme.
 * @param targetLang - The language being learned (english/spanish/korean/indonesian)
 * @param phoneme - The IPA phoneme string from Azure
 * @param nativeLang - The learner's native language (korean/spanish/english/indonesian)
 * @returns Coaching tip string, or null if no tip found
 */
export function getCoachingTip(
  targetLang: string,
  phoneme: string,
  nativeLang: string,
): string | null {
  const tl = targetLang.toLowerCase();
  const nl = nativeLang.toLowerCase();
  const nlCode = nl === "korean" ? "ko" : nl === "spanish" ? "es" : nl === "indonesian" || nl === "id" ? "id" : "en";
  const map = DB[tl];
  if (!map) return null;

  // Resolve the matching entry: direct, then lowercase, then length-stripped.
  const stripped = phoneme.replace(/ː/g, "");
  const entry =
    map[phoneme] ??
    map[phoneme.toLowerCase()] ??
    (stripped !== phoneme ? map[stripped] : undefined);
  if (!entry) return null;

  // Primary path: the learner's native-language tip.
  if (entry[nlCode]) return entry[nlCode];

  // Interim safety fallback: an entry exists but lacks the native-language key.
  // Return a tip the learner can still read (en, then ko) rather than null,
  // so the coaching box never silently vanishes.
  return entry.en ?? entry.ko ?? null;
}

/**
 * Get the error type label in the user's native language.
 */
export function getErrorLabel(
  errorType: string,
  nativeLang: string,
): string {
  const nl = nativeLang.toLowerCase();
  switch (errorType.toLowerCase()) {
    case "mispronunciation":
      return nl === "korean" ? "발음 오류" : nl === "spanish" ? "Error de pronunciación" : nl === "indonesian" ? "Kesalahan pelafalan" : "Mispronunciation";
    case "omission":
      return nl === "korean" ? "생략됨" : nl === "spanish" ? "Omitido" : nl === "indonesian" ? "Terlewat" : "Omitted";
    case "insertion":
      return nl === "korean" ? "추가 발음" : nl === "spanish" ? "Inserción" : nl === "indonesian" ? "Bunyi tambahan" : "Inserted extra sound";
    default:
      return nl === "korean" ? "발음 문제" : nl === "spanish" ? "Problema de pronunciación" : nl === "indonesian" ? "Masalah pelafalan" : "Pronunciation issue";
  }
}
