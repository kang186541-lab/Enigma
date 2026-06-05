export interface CulturalNote {
  id: string;
  category: "culture" | "idiom" | "etiquette";
  icon: string;
  language: "ko" | "en" | "es" | "ar" | "id";
  country?: string;
  title: { ko: string; en: string; es: string; id: string };
  content: { ko: string; en: string; es: string; id: string };
}

export const CULTURAL_NOTES: CulturalNote[] = [
  // ════════════════════════════════════════════
  // ENGLISH LEARNERS (language: "en") — ~15 notes
  // ════════════════════════════════════════════

  // --- USA ---
  {
    id: "cn1",
    category: "etiquette",
    icon: "💵",
    language: "en",
    country: "US",
    title: {
      ko: "미국의 팁 문화",
      en: "Tipping culture in the US",
      es: "La cultura de la propina en EE.UU.",
      id: "Budaya tip di Amerika",
    },
    content: {
      ko: "미국 레스토랑에서는 15-20% 팁이 필수예요. 팁을 안 주면 매우 무례하게 여겨져요. 바리스타나 바텐더에게도 $1-2 팁을 줘요.",
      en: "In US restaurants, a 15-20% tip is expected. Not tipping is considered very rude. Baristas and bartenders also get $1-2 tips.",
      es: "En restaurantes de EE.UU., se espera 15-20% de propina. No dejar propina es muy descortés. Baristas y bartenders también reciben $1-2.",
      id: "Di restoran Amerika, tip 15-20% itu wajib. Kalau kamu nggak kasih tip, dianggap sangat tidak sopan. Barista dan bartender juga dikasih tip $1-2.",
    },
  },
  {
    id: "cn2",
    category: "culture",
    icon: "🗣️",
    language: "en",
    country: "US",
    title: {
      ko: "미국의 스몰토크 문화",
      en: "American small talk",
      es: "El small talk estadounidense",
      id: "Basa-basi ala Amerika",
    },
    content: {
      ko: "미국인들은 낯선 사람에게도 'How are you?'라고 해요. 진짜 안부가 아니라 인사예요! 'Good, thanks!'라고 짧게 답하면 돼요.",
      en: "Americans say 'How are you?' even to strangers. It's a greeting, not a real question! Just reply 'Good, thanks!' and move on.",
      es: "Los estadounidenses dicen 'How are you?' hasta a desconocidos. Es un saludo, no una pregunta real. Solo responde 'Good, thanks!'.",
      id: "Orang Amerika bilang 'How are you?' bahkan ke orang asing. Itu cuma sapaan, bukan pertanyaan sungguhan! Cukup jawab 'Good, thanks!' lalu lanjut.",
    },
  },
  {
    id: "cn3",
    category: "culture",
    icon: "🦃",
    language: "en",
    country: "US",
    title: {
      ko: "추수감사절 (Thanksgiving)",
      en: "Thanksgiving traditions",
      es: "Tradiciones de Thanksgiving",
      id: "Tradisi Thanksgiving",
    },
    content: {
      ko: "11월 넷째 목요일에 가족이 모여 칠면조를 먹어요. 다음 날 '블랙 프라이데이'는 미국 최대 쇼핑 행사예요!",
      en: "On the fourth Thursday of November, families gather for turkey dinner. The next day, 'Black Friday,' is America's biggest shopping event!",
      es: "El cuarto jueves de noviembre, las familias cenan pavo. Al día siguiente, 'Black Friday,' es el mayor evento de compras en EE.UU.!",
      id: "Setiap Kamis keempat bulan November, keluarga berkumpul makan kalkun. Besoknya, 'Black Friday', adalah event belanja terbesar di Amerika!",
    },
  },
  {
    id: "cn4",
    category: "culture",
    icon: "🏈",
    language: "en",
    country: "US",
    title: {
      ko: "미국의 대학 스포츠 문화",
      en: "American college sports culture",
      es: "La cultura deportiva universitaria en EE.UU.",
      id: "Budaya olahraga kampus di Amerika",
    },
    content: {
      ko: "미국에서는 대학 미식축구와 농구가 프로만큼 인기 있어요. 학생들은 학교 색깔 옷을 입고 경기장을 가득 채워요!",
      en: "In the US, college football and basketball are as popular as pro sports. Students wear school colors and pack huge stadiums!",
      es: "En EE.UU., el fútbol americano y baloncesto universitario son tan populares como los profesionales. Los estadios se llenan!",
      id: "Di Amerika, football dan basket kampus sepopuler liga profesional. Mahasiswa pakai warna kampus dan memenuhi stadion sampai penuh!",
    },
  },
  {
    id: "cn5",
    category: "culture",
    icon: "🍽️",
    language: "en",
    country: "US",
    title: {
      ko: "미국의 포틀럭 파티",
      en: "Potluck dinners",
      es: "Las cenas potluck",
      id: "Pesta potluck",
    },
    content: {
      ko: "포틀럭은 각자 음식을 하나씩 가져오는 파티예요. 미국에서 매우 흔하고 'I'll bring a dish!'라고 말해요.",
      en: "A potluck is a party where everyone brings a dish to share. Very common in the US — just say 'I'll bring something!'",
      es: "Un potluck es una fiesta donde cada uno lleva un plato para compartir. Muy común en EE.UU. — solo di 'I'll bring something!'",
      id: "Potluck itu pesta di mana tiap orang bawa satu makanan buat dibagi. Umum banget di Amerika — cukup bilang 'I'll bring something!'",
    },
  },

  // --- UK ---
  {
    id: "cn6",
    category: "culture",
    icon: "☕",
    language: "en",
    country: "UK",
    title: {
      ko: "영국의 차 문화",
      en: "British tea culture",
      es: "La cultura del té británica",
      id: "Budaya teh Inggris",
    },
    content: {
      ko: "'Fancy a cuppa?'는 차 한잔 할래?란 뜻이에요. 영국인은 하루 평균 4-5잔을 마시고, 우유 넣는 순서로 진지하게 논쟁해요!",
      en: "'Fancy a cuppa?' means 'Want a cup of tea?' Brits drink 4-5 cups daily and seriously debate whether milk goes in first or last!",
      es: "'Fancy a cuppa?' significa '¿Quieres un té?' Los británicos toman 4-5 tazas al día y debaten si la leche va primero o después!",
      id: "'Fancy a cuppa?' artinya 'Mau teh?'. Orang Inggris minum 4-5 cangkir sehari dan serius berdebat soal susu dituang duluan atau belakangan!",
    },
  },
  {
    id: "cn7",
    category: "etiquette",
    icon: "🧍",
    language: "en",
    country: "UK",
    title: {
      ko: "영국의 줄서기 문화",
      en: "British queueing etiquette",
      es: "La etiqueta de hacer fila en Gran Bretaña",
      id: "Etika antre ala Inggris",
    },
    content: {
      ko: "영국에서 줄 안 서면 큰 실례예요! 'Queue jumping'은 영국인이 가장 싫어하는 행동 중 하나예요. 항상 차례를 기다리세요.",
      en: "Cutting in line ('queue jumping') is one of the worst social offenses in Britain. Always wait your turn — Brits take queues very seriously!",
      es: "Colarse en la fila ('queue jumping') es una de las peores ofensas sociales en Gran Bretaña. Siempre espera tu turno!",
      id: "Menyerobot antrean ('queue jumping') itu salah satu pelanggaran sosial terparah di Inggris. Selalu tunggu giliranmu — orang Inggris serius soal antrean!",
    },
  },
  {
    id: "cn8",
    category: "culture",
    icon: "🍺",
    language: "en",
    country: "UK",
    title: {
      ko: "영국의 펍 문화",
      en: "British pub culture",
      es: "La cultura del pub británico",
      id: "Budaya pub Inggris",
    },
    content: {
      ko: "영국 펍에서는 'rounds' 시스템으로 돌아가며 음료를 사요. 자기 차례를 건너뛰면 예의에 어긋나요!",
      en: "In British pubs, friends buy 'rounds' — each person takes turns buying drinks for the group. Skipping your round is a social faux pas!",
      es: "En pubs británicos, los amigos compran 'rounds' — cada uno compra bebidas para el grupo por turnos. Saltarte tu turno es de mala educación!",
      id: "Di pub Inggris, teman-teman beli minuman bergiliran ('rounds') — tiap orang gantian traktir satu grup. Melewatkan giliranmu itu nggak sopan!",
    },
  },
  {
    id: "cn9",
    category: "culture",
    icon: "😏",
    language: "en",
    country: "UK",
    title: {
      ko: "영국식 유머와 절제 표현",
      en: "British humor & understatement",
      es: "El humor británico y la subestimación",
      id: "Humor Inggris & gaya merendah",
    },
    content: {
      ko: "영국인이 'Not bad'라고 하면 실제로 '아주 좋다'는 뜻일 수 있어요. 'Quite good'은 칭찬이고, 'Interesting'은 동의하지 않는다는 뜻일 수 있어요!",
      en: "When a Brit says 'Not bad,' they might mean 'excellent.' 'Quite good' is praise, and 'Interesting' might mean they disagree!",
      es: "Cuando un británico dice 'Not bad,' puede significar 'excelente.' 'Quite good' es un elogio, e 'Interesting' puede significar desacuerdo!",
      id: "Kalau orang Inggris bilang 'Not bad', bisa jadi maksudnya 'luar biasa'. 'Quite good' itu pujian, dan 'Interesting' bisa berarti dia nggak setuju!",
    },
  },

  // --- Australia ---
  {
    id: "cn10",
    category: "culture",
    icon: "🇦🇺",
    language: "en",
    country: "AU",
    title: {
      ko: "호주 슬랭 (Aussie slang)",
      en: "Aussie slang",
      es: "Jerga australiana",
      id: "Slang Australia",
    },
    content: {
      ko: "호주에서 'arvo'는 오후, 'brekkie'는 아침식사, 'barbie'는 바비큐, 'maccas'는 맥도날드예요. 모든 단어를 줄이는 게 호주 영어 특징!",
      en: "'Arvo' = afternoon, 'brekkie' = breakfast, 'barbie' = BBQ, 'Maccas' = McDonald's. Aussies shorten everything — that's just how they roll!",
      es: "'Arvo' = tarde, 'brekkie' = desayuno, 'barbie' = BBQ, 'Maccas' = McDonald's. Los australianos acortan todo — ¡así son ellos!",
      id: "'Arvo' = sore, 'brekkie' = sarapan, 'barbie' = BBQ, 'Maccas' = McDonald's. Orang Australia menyingkat semuanya — emang gitu gayanya!",
    },
  },
  {
    id: "cn11",
    category: "culture",
    icon: "🤝",
    language: "en",
    country: "AU",
    title: {
      ko: "호주의 메이트십 문화",
      en: "Aussie mateship culture",
      es: "La cultura de 'mateship' australiana",
      id: "Budaya 'mateship' Australia",
    },
    content: {
      ko: "'Mate'는 호주에서 친구를 부르는 말이에요. 'Mateship'은 호주의 핵심 가치로, 어려울 때 서로 돕는 동료 정신을 의미해요.",
      en: "'Mate' means friend in Australia. 'Mateship' is a core Aussie value — sticking together and helping each other through tough times.",
      es: "'Mate' significa amigo en Australia. 'Mateship' es un valor central australiano — apoyarse mutuamente en los momentos difíciles.",
      id: "'Mate' artinya teman di Australia. 'Mateship' adalah nilai inti orang Australia — saling setia dan menolong satu sama lain di masa sulit.",
    },
  },

  // --- Canada ---
  {
    id: "cn12",
    category: "etiquette",
    icon: "🇨🇦",
    language: "en",
    country: "CA",
    title: {
      ko: "캐나다의 예의 문화",
      en: "Canadian politeness culture",
      es: "La cultura de cortesía canadiense",
      id: "Budaya sopan santun Kanada",
    },
    content: {
      ko: "캐나다인은 'Sorry'를 정말 자주 해요 — 누가 부딪혀도 서로 Sorry! 2009년에 'Sorry법'이 만들어져 사과가 법적 책임 인정이 아니에요!",
      en: "Canadians say 'Sorry' constantly — even if someone bumps into them! Canada's 'Apology Act' (2009) says sorry doesn't admit legal liability.",
      es: "Los canadienses dicen 'Sorry' todo el tiempo — ¡aunque alguien les empuje! La 'Ley de Disculpa' (2009) dice que disculparse no es admitir culpa.",
      id: "Orang Kanada terus-terusan bilang 'Sorry' — bahkan saat orang lain yang nabrak mereka! 'Apology Act' (2009) menegaskan minta maaf bukan berarti mengaku salah secara hukum.",
    },
  },

  // --- US vs UK differences ---
  {
    id: "cn13",
    category: "culture",
    icon: "🔤",
    language: "en",
    title: {
      ko: "미국 vs 영국 영어: 철자 차이",
      en: "US vs UK English: Spelling differences",
      es: "Inglés americano vs británico: diferencias ortográficas",
      id: "Inggris Amerika vs Inggris British: beda ejaan",
    },
    content: {
      ko: "미국: color, favorite, center, realize. 영국: colour, favourite, centre, realise. 둘 다 맞지만 섞어 쓰지 마세요!",
      en: "US: color, favorite, center, realize. UK: colour, favourite, centre, realise. Both are correct — just be consistent, don't mix them!",
      es: "EE.UU.: color, favorite, center, realize. UK: colour, favourite, centre, realise. Ambos son correctos — ¡solo sé consistente!",
      id: "Amerika: color, favorite, center, realize. Inggris: colour, favourite, centre, realise. Keduanya benar — yang penting konsisten, jangan dicampur!",
    },
  },
  {
    id: "cn14",
    category: "culture",
    icon: "🏠",
    language: "en",
    title: {
      ko: "미국 vs 영국 영어: 어휘 차이",
      en: "US vs UK English: Vocabulary differences",
      es: "Inglés americano vs británico: diferencias de vocabulario",
      id: "Inggris Amerika vs Inggris British: beda kosakata",
    },
    content: {
      ko: "엘리베이터(US) vs 리프트(UK), 쓰레기(trash/US) vs rubbish(UK), 감자칩(chips/US) vs crisps(UK), 화장실(restroom/US) vs loo(UK).",
      en: "Elevator(US) vs lift(UK), trash vs rubbish, chips vs crisps, restroom vs loo, apartment vs flat, cookie vs biscuit!",
      es: "Elevator(US) vs lift(UK), trash vs rubbish, chips vs crisps, restroom vs loo, apartment vs flat, cookie vs biscuit!",
      id: "Elevator(AS) vs lift(UK), trash vs rubbish, chips vs crisps, restroom vs loo, apartment vs flat, cookie vs biscuit!",
    },
  },

  // --- English idioms ---
  {
    id: "cn15",
    category: "idiom",
    icon: "🦵",
    language: "en",
    title: {
      ko: "Break a leg! (다리를 부러뜨려!?)",
      en: "Break a leg!",
      es: "Break a leg! (¡Rómpete una pierna!)",
      id: "Break a leg! (Patahkan kakimu!?)",
    },
    content: {
      ko: "'다리를 부러뜨려!'가 아니라 '행운을 빌어!'라는 뜻이에요. 특히 공연 전에 많이 써요. 직접 'Good luck'이라 하면 불운이 온다는 미신 때문이에요.",
      en: "This means 'Good luck!' especially before a performance. Saying 'good luck' directly is considered bad luck in theater — so they say this instead!",
      es: "Significa '¡Buena suerte!' especialmente antes de una actuación. Decir 'good luck' directamente trae mala suerte en el teatro.",
      id: "Ini bukan berarti 'patahkan kakimu', tapi 'Semoga sukses!', terutama sebelum pentas. Bilang 'good luck' langsung dianggap bawa sial di dunia teater, jadi mereka pakai ini!",
    },
  },
  {
    id: "cn16",
    category: "idiom",
    icon: "🌧️",
    language: "en",
    title: {
      ko: "It's raining cats and dogs",
      en: "It's raining cats and dogs",
      es: "It's raining cats and dogs",
      id: "It's raining cats and dogs",
    },
    content: {
      ko: "'고양이와 개가 비처럼 내린다'? 비가 엄청 많이 온다는 뜻이에요! 한국어의 '비가 억수같이 온다'와 비슷해요.",
      en: "This classic idiom means 'it's raining very heavily.' Origin uncertain — one theory involves animals sliding off old thatched roofs!",
      es: "Este modismo clásico significa 'llueve muchísimo.' El origen es incierto — una teoría involucra animales en techos de paja!",
      id: "Idiom klasik ini artinya 'hujannya deras banget'. Asalnya nggak pasti — salah satu teori menyebut hewan-hewan yang melorot dari atap jerami tua!",
    },
  },
  {
    id: "cn17",
    category: "idiom",
    icon: "🍰",
    language: "en",
    title: {
      ko: "Piece of cake (케이크 한 조각?)",
      en: "Piece of cake",
      es: "Piece of cake (¿Un trozo de pastel?)",
      id: "Piece of cake (Sepotong kue?)",
    },
    content: {
      ko: "'케이크 한 조각'이 아니라 '아주 쉬운 일'이라는 뜻이에요. 'The test was a piece of cake!'는 시험이 정말 쉬웠다는 뜻이에요.",
      en: "This means 'very easy.' 'The test was a piece of cake!' means the test was really easy. Similar to 'easy as pie' or 'a breeze.'",
      es: "Significa 'muy fácil.' 'The test was a piece of cake!' significa que el examen fue facilísimo. Similar a 'pan comido.'",
      id: "Ini bukan soal 'sepotong kue', tapi artinya 'gampang banget'. 'The test was a piece of cake!' artinya ujiannya gampang sekali. Mirip 'easy as pie'.",
    },
  },

  // ════════════════════════════════════════════
  // SPANISH LEARNERS (language: "es") — ~15 notes
  // ════════════════════════════════════════════

  // --- Spain ---
  {
    id: "cn18",
    category: "culture",
    icon: "😴",
    language: "es",
    country: "ES",
    title: {
      ko: "스페인의 시에스타 문화",
      en: "Spanish siesta culture",
      es: "La cultura de la siesta en España",
      id: "Budaya siesta di Spanyol",
    },
    content: {
      ko: "스페인에서는 오후 2-5시에 가게가 문을 닫고 낮잠을 자는 전통이 있어요. 대도시에서는 줄었지만 작은 마을에서는 아직 흔해요.",
      en: "In Spain, shops traditionally close from 2-5 PM for siesta. Less common in big cities now, but still alive in small towns.",
      es: "En España, las tiendas cierran de 2 a 5 PM para la siesta. Menos común en grandes ciudades, pero aún vive en pueblos pequeños.",
      id: "Di Spanyol, toko-toko biasanya tutup jam 2-5 sore buat siesta (tidur siang). Sekarang makin jarang di kota besar, tapi masih hidup di desa kecil.",
    },
  },
  {
    id: "cn19",
    category: "culture",
    icon: "🕐",
    language: "es",
    country: "ES",
    title: {
      ko: "스페인의 식사 시간",
      en: "Spanish meal times",
      es: "Los horarios de comida en España",
      id: "Jam makan di Spanyol",
    },
    content: {
      ko: "스페인에서는 점심을 오후 2-3시, 저녁은 밤 9-10시에 먹어요! 저녁 7시에 레스토랑에 가면 아직 문을 안 열었을 수도 있어요.",
      en: "In Spain, lunch is at 2-3 PM and dinner at 9-10 PM! If you go to a restaurant at 7 PM, it might not even be open yet.",
      es: "En España, el almuerzo es a las 2-3 PM y la cena a las 9-10 PM. Si vas a un restaurante a las 7 PM, puede que no esté abierto.",
      id: "Di Spanyol, makan siang jam 2-3 siang dan makan malam jam 9-10 malam! Kalau kamu ke restoran jam 7 malam, bisa jadi belum buka.",
    },
  },
  {
    id: "cn20",
    category: "culture",
    icon: "🍢",
    language: "es",
    country: "ES",
    title: {
      ko: "스페인의 타파스 문화",
      en: "Spanish tapas culture",
      es: "La cultura de las tapas",
      id: "Budaya tapas Spanyol",
    },
    content: {
      ko: "타파스는 작은 접시 음식으로 친구들과 나눠 먹어요. 스페인 일부 지역에서는 음료를 시키면 타파스가 무료로 나와요!",
      en: "Tapas are small shared dishes enjoyed with friends. In some parts of Spain, you get free tapas with every drink you order!",
      es: "Las tapas son platos pequeños que se comparten. En algunas zonas de España, te dan tapas gratis con cada bebida que pides!",
      id: "Tapas itu hidangan kecil yang dinikmati bareng teman. Di beberapa daerah Spanyol, kamu dapat tapas gratis setiap kali pesan minuman!",
    },
  },
  {
    id: "cn21",
    category: "etiquette",
    icon: "🫵",
    language: "es",
    country: "ES",
    title: {
      ko: "스페인어의 tú vs usted",
      en: "Tú vs usted in Spain",
      es: "Tú vs usted en España",
      id: "Tú vs usted di Spanyol",
    },
    content: {
      ko: "'Tú'는 반말, 'usted'는 존댓말이에요. 스페인에서는 젊은 사람들끼리 거의 tú를 써요. 하지만 어르신이나 공식 상황에서는 usted를 쓰세요!",
      en: "'Tú' is informal, 'usted' is formal. In Spain, young people almost always use tú. But use usted with elders or in formal settings!",
      es: "'Tú' es informal, 'usted' es formal. En España los jóvenes casi siempre usan tú. Pero usa usted con mayores o en situaciones formales!",
      id: "'Tú' itu santai, 'usted' itu formal. Di Spanyol, anak muda hampir selalu pakai tú. Tapi pakai usted kalau bicara dengan orang yang lebih tua atau di situasi resmi!",
    },
  },

  // --- Mexico ---
  {
    id: "cn22",
    category: "culture",
    icon: "💀",
    language: "es",
    country: "MX",
    title: {
      ko: "멕시코의 죽은 자의 날",
      en: "Mexico's Day of the Dead",
      es: "El Día de los Muertos en México",
      id: "Hari Orang Mati di Meksiko",
    },
    content: {
      ko: "11월 1-2일에 돌아가신 분들을 기리는 축제예요. 슬픈 날이 아니라 즐거운 축하! 해골 분장과 마리골드 꽃 제단이 특징이에요.",
      en: "On Nov 1-2, Mexicans celebrate deceased loved ones. It's joyful, not somber! Features skull makeup, marigold altars, and favorite foods of the dead.",
      es: "El 1-2 de noviembre se honra a los seres queridos fallecidos. ¡Es alegre! Se usan calaveras, altares de cempasúchil y comida favorita.",
      id: "Tanggal 1-2 November, orang Meksiko merayakan orang tercinta yang sudah meninggal. Bukan acara sedih, malah meriah! Ada riasan tengkorak, altar bunga marigold, dan makanan favorit almarhum.",
    },
  },
  {
    id: "cn23",
    category: "culture",
    icon: "🌮",
    language: "es",
    country: "MX",
    title: {
      ko: "멕시코의 길거리 타코",
      en: "Mexican street tacos",
      es: "Los tacos callejeros mexicanos",
      id: "Taco kaki lima Meksiko",
    },
    content: {
      ko: "진짜 멕시코 타코는 부드러운 옥수수 또르띠야에 고기, 양파, 고수, 살사를 올려요. 딱딱한 껍질(hard shell) 타코는 미국식이에요!",
      en: "Authentic Mexican tacos use soft corn tortillas with meat, onion, cilantro, and salsa. Hard shell tacos are an American invention!",
      es: "Los tacos auténticos usan tortilla de maíz suave con carne, cebolla, cilantro y salsa. ¡Los tacos de cáscara dura son invento gringo!",
      id: "Taco Meksiko asli pakai tortilla jagung lembut dengan daging, bawang, ketumbar, dan salsa. Taco kulit keras (hard shell) itu buatan Amerika!",
    },
  },
  {
    id: "cn24",
    category: "culture",
    icon: "🎭",
    language: "es",
    country: "MX",
    title: {
      ko: "멕시코의 루차 리브레",
      en: "Mexican lucha libre",
      es: "La lucha libre mexicana",
      id: "Lucha libre Meksiko",
    },
    content: {
      ko: "루차 리브레는 화려한 마스크를 쓴 프로레슬링이에요. 마스크를 벗기는 것은 최대 모욕! 문화 아이콘이자 국민 스포츠예요.",
      en: "Lucha libre is pro wrestling with colorful masks. Unmasking a luchador is the ultimate humiliation! It's a cultural icon and national passion.",
      es: "La lucha libre es lucha profesional con máscaras coloridas. ¡Desenmascarar a un luchador es la humillación máxima! Es un ícono cultural.",
      id: "Lucha libre itu gulat profesional dengan topeng warna-warni. Membuka topeng seorang luchador adalah penghinaan terbesar! Ini ikon budaya sekaligus kecintaan nasional.",
    },
  },

  // --- Colombia ---
  {
    id: "cn25",
    category: "culture",
    icon: "☕",
    language: "es",
    country: "CO",
    title: {
      ko: "콜롬비아의 커피 문화",
      en: "Colombian coffee culture",
      es: "La cultura del café colombiano",
      id: "Budaya kopi Kolombia",
    },
    content: {
      ko: "콜롬비아는 세계 3위 커피 생산국이에요. 'Tinto'는 작은 잔의 블랙커피로, 매우 저렴하고 하루에 여러 잔 마셔요.",
      en: "Colombia is the world's 3rd largest coffee producer. 'Tinto' is a small black coffee — very cheap, and people drink several cups daily.",
      es: "Colombia es el 3er productor de café del mundo. El 'tinto' es un café negro pequeño — muy barato, y la gente toma varios al día.",
      id: "Kolombia adalah produsen kopi terbesar ketiga di dunia. 'Tinto' itu kopi hitam dalam cangkir kecil — sangat murah, dan orang minum beberapa cangkir sehari.",
    },
  },
  {
    id: "cn26",
    category: "culture",
    icon: "💃",
    language: "es",
    country: "CO",
    title: {
      ko: "콜롬비아의 살사 문화",
      en: "Salsa culture in Colombia",
      es: "La cultura de la salsa en Colombia",
      id: "Budaya salsa di Kolombia",
    },
    content: {
      ko: "칼리(Cali)는 세계 살사의 수도예요! 콜롬비아에서는 파티에서 춤을 추는 것이 당연하고, 모르면 가르쳐 줄 거예요.",
      en: "Cali is the world capital of salsa! In Colombia, dancing at parties is expected — if you don't know how, they'll gladly teach you.",
      es: "¡Cali es la capital mundial de la salsa! En Colombia, bailar en fiestas es lo normal — si no sabes, con gusto te enseñan.",
      id: "Cali adalah ibu kota salsa dunia! Di Kolombia, menari di pesta itu sudah biasa — kalau kamu nggak bisa, mereka dengan senang hati mengajarimu.",
    },
  },

  // --- Argentina ---
  {
    id: "cn27",
    category: "culture",
    icon: "🧉",
    language: "es",
    country: "AR",
    title: {
      ko: "아르헨티나의 마테 문화",
      en: "Argentine mate culture",
      es: "La cultura del mate argentino",
      id: "Budaya mate Argentina",
    },
    content: {
      ko: "마테는 아르헨티나의 국민 음료예요. 한 잔을 돌려 마시며, 'Gracias'라고 하면 '더 이상 안 마실게요'라는 뜻이에요!",
      en: "Mate is Argentina's national drink, shared from one cup. Saying 'Gracias' when passed the mate means 'I'm done, no more for me!'",
      es: "El mate es la bebida nacional, se comparte de un solo recipiente. Decir 'Gracias' al recibirlo significa '¡ya no quiero más!'",
      id: "Mate adalah minuman nasional Argentina, dinikmati bergiliran dari satu cangkir. Bilang 'Gracias' saat mate disodorkan berarti 'Cukup, aku nggak mau lagi!'",
    },
  },
  {
    id: "cn28",
    category: "culture",
    icon: "🥩",
    language: "es",
    country: "AR",
    title: {
      ko: "아르헨티나의 아사도",
      en: "Argentine asado (BBQ)",
      es: "El asado argentino",
      id: "Asado Argentina (BBQ)",
    },
    content: {
      ko: "아사도는 아르헨티나식 바비큐로 사교 행사예요. 일요일에 가족과 함께하고, 아사도르(굽는 사람)는 존경받는 역할이에요.",
      en: "Asado is Argentine BBQ and a social ritual. Families gather on Sundays, and the asador (grill master) holds an honored role.",
      es: "El asado es un ritual social argentino. Las familias se reúnen los domingos, y el asador tiene un rol de honor.",
      id: "Asado itu BBQ ala Argentina sekaligus ritual sosial. Keluarga berkumpul tiap Minggu, dan asador (tukang panggang) punya peran yang dihormati.",
    },
  },
  {
    id: "cn29",
    category: "culture",
    icon: "🗣️",
    language: "es",
    country: "AR",
    title: {
      ko: "아르헨티나의 보세오 (voseo)",
      en: "Argentine voseo",
      es: "El voseo argentino",
      id: "Voseo Argentina",
    },
    content: {
      ko: "아르헨티나에서는 'tú'대신 'vos'를 써요. 'Tú tienes' 대신 'Vos tenés'라고 해요. 동사 활용이 달라지니 주의하세요!",
      en: "In Argentina, 'vos' replaces 'tú.' Instead of 'Tú tienes,' they say 'Vos tenés.' The verb conjugation changes — watch out!",
      es: "En Argentina, 'vos' reemplaza a 'tú.' En vez de 'Tú tienes,' dicen 'Vos tenés.' ¡La conjugación cambia — ten cuidado!",
      id: "Di Argentina, 'vos' menggantikan 'tú'. Alih-alih 'Tú tienes', mereka bilang 'Vos tenés'. Konjugasi kata kerjanya berubah — hati-hati ya!",
    },
  },

  // --- Spain vs Latin America ---
  {
    id: "cn30",
    category: "culture",
    icon: "🌎",
    language: "es",
    title: {
      ko: "스페인 vs 라틴 아메리카: vosotros vs ustedes",
      en: "Spain vs Latin America: vosotros vs ustedes",
      es: "España vs Latinoamérica: vosotros vs ustedes",
      id: "Spanyol vs Amerika Latin: vosotros vs ustedes",
    },
    content: {
      ko: "스페인에서는 '너희들'을 'vosotros'라고 하지만, 라틴 아메리카 전체에서는 'ustedes'만 써요. 교재에 따라 배우는 형태가 달라요!",
      en: "Spain uses 'vosotros' for informal 'you all,' but all of Latin America uses 'ustedes' only. Your textbook style depends on the region!",
      es: "España usa 'vosotros' para el plural informal, pero en toda Latinoamérica solo se usa 'ustedes.' ¡Depende de qué variante aprendas!",
      id: "Spanyol pakai 'vosotros' untuk 'kalian' yang santai, tapi seluruh Amerika Latin cuma pakai 'ustedes'. Bentuk yang kamu pelajari tergantung wilayahnya!",
    },
  },
  {
    id: "cn31",
    category: "culture",
    icon: "🗣️",
    language: "es",
    title: {
      ko: "스페인 vs 라틴 아메리카: 발음 차이",
      en: "Spain vs Latin America: Pronunciation (ceceo/seseo)",
      es: "España vs Latinoamérica: Pronunciación (ceceo/seseo)",
      id: "Spanyol vs Amerika Latin: pelafalan (ceceo/seseo)",
    },
    content: {
      ko: "스페인에서 'z'와 'ce/ci'는 영어 'th'처럼 발음해요 (ceceo). 라틴 아메리카에서는 's'로 발음해요 (seseo). 'Gracias'가 달라요!",
      en: "In Spain, 'z' and 'ce/ci' sound like English 'th' (ceceo). In Latin America, they sound like 's' (seseo). 'Gracias' sounds different!",
      es: "En España, 'z' y 'ce/ci' suenan como 'th' inglesa (ceceo). En Latinoamérica, suenan como 's' (seseo). '¡Gracias' suena diferente!",
      id: "Di Spanyol, 'z' dan 'ce/ci' dibaca seperti 'th' Inggris (ceceo). Di Amerika Latin, dibaca seperti 's' (seseo). 'Gracias' jadi terdengar beda!",
    },
  },
  {
    id: "cn32",
    category: "culture",
    icon: "🚗",
    language: "es",
    title: {
      ko: "스페인 vs 라틴 아메리카: 어휘 차이",
      en: "Spain vs Latin America: Vocabulary differences",
      es: "España vs Latinoamérica: diferencias de vocabulario",
      id: "Spanyol vs Amerika Latin: beda kosakata",
    },
    content: {
      ko: "자동차: coche(스페인), carro(멕시코), auto(아르헨). 컴퓨터: ordenador(스페인), computadora(라틴). 같은 스페인어인데 단어가 달라요!",
      en: "Car: coche(Spain), carro(Mexico), auto(Argentina). Computer: ordenador(Spain), computadora(Latin America). Same language, different words!",
      es: "Coche(España), carro(México), auto(Argentina). Ordenador(España), computadora(Latinoamérica). ¡Mismo idioma, distintas palabras!",
      id: "Mobil: coche(Spanyol), carro(Meksiko), auto(Argentina). Komputer: ordenador(Spanyol), computadora(Amerika Latin). Bahasa sama, katanya beda!",
    },
  },

  // --- Spanish idioms ---
  {
    id: "cn33",
    category: "idiom",
    icon: "☁️",
    language: "es",
    title: {
      ko: "Estar en las nubes (구름 위에 있다)",
      en: "Estar en las nubes (To be in the clouds)",
      es: "Estar en las nubes",
      id: "Estar en las nubes (Berada di atas awan)",
    },
    content: {
      ko: "'구름 위에 있다'는 멍하게 딴 생각하는 것을 뜻해요. 수업 중에 이러면 선생님이 '¡Baja de las nubes!' (구름에서 내려와!)라고 해요.",
      en: "'Being in the clouds' means daydreaming or zoning out. If distracted in class, a teacher might say '¡Baja de las nubes!' (Come down from the clouds!)",
      es: "Significa estar distraído o soñando despierto. Si estás distraído, el profe dirá '¡Baja de las nubes!'",
      id: "'Berada di atas awan' artinya melamun atau pikiran ke mana-mana. Kalau kamu nggak fokus di kelas, gurumu mungkin bilang '¡Baja de las nubes!' (Turun dari awan!)",
    },
  },
  {
    id: "cn34",
    category: "idiom",
    icon: "👅",
    language: "es",
    title: {
      ko: "No tener pelos en la lengua",
      en: "No tener pelos en la lengua (No hairs on the tongue)",
      es: "No tener pelos en la lengua",
      id: "No tener pelos en la lengua (Tak ada bulu di lidah)",
    },
    content: {
      ko: "'혀에 털이 없다'는 할 말을 거침없이 하는 것을 뜻해요. 영어의 'to not mince words'와 비슷해요. 직설적인 사람에게 써요.",
      en: "'Having no hairs on one's tongue' means speaking very directly. Similar to 'not mincing words.' Used for blunt, outspoken people.",
      es: "Significa hablar sin rodeos ni filtros. Se usa para personas muy directas y francas que dicen lo que piensan sin miedo.",
      id: "'Tak punya bulu di lidah' artinya bicara sangat blak-blakan. Mirip 'not mincing words' dalam bahasa Inggris. Dipakai untuk orang yang terus terang dan ceplas-ceplos.",
    },
  },
  {
    id: "cn35",
    category: "idiom",
    icon: "🍞",
    language: "es",
    title: {
      ko: "Ser pan comido (먹힌 빵이다?)",
      en: "Ser pan comido (To be eaten bread)",
      es: "Ser pan comido",
      id: "Ser pan comido (Jadi roti yang sudah dimakan?)",
    },
    content: {
      ko: "'먹힌 빵'이라는 뜻으로, 아주 쉬운 일을 말해요. 영어의 'Piece of cake'와 같은 표현이에요! 'El examen fue pan comido.'",
      en: "Literally 'to be eaten bread,' it means 'very easy' — like 'piece of cake' in English! 'El examen fue pan comido' = The exam was a breeze.",
      es: "Significa que algo es muy fácil. '¡El examen fue pan comido!' Equivale al inglés 'piece of cake.' Se usa en situaciones informales.",
      id: "Secara harfiah 'roti yang sudah dimakan', tapi artinya 'gampang banget' — seperti 'piece of cake' dalam bahasa Inggris! 'El examen fue pan comido' = Ujiannya gampang sekali.",
    },
  },

  // ════════════════════════════════════════════
  // KOREAN LEARNERS (language: "ko") — ~10 notes
  // ════════════════════════════════════════════
  {
    id: "cn36",
    category: "etiquette",
    icon: "🗣️",
    language: "ko",
    country: "KR",
    title: {
      ko: "한국의 존댓말 시스템",
      en: "Korean honorific speech levels (존댓말)",
      es: "Los niveles de cortesía en coreano (존댓말)",
      id: "Tingkat bahasa hormat Korea (존댓말)",
    },
    content: {
      ko: "한국어에는 7개 존댓말 단계가 있어요. 일상에서는 해요체(일반), 합쇼체(격식), 반말(친구) 3개만 알면 돼요. 처음 만난 사람에게 반말하면 큰 실례!",
      en: "Korean has 7 speech levels. You need 3: 해요체 (polite), 합쇼체 (formal), 반말 (casual). Using 반말 with a stranger is very rude!",
      es: "El coreano tiene 7 niveles de cortesía. Necesitas 3: 해요체 (cortés), 합쇼체 (formal), 반말 (casual). ¡Usar 반말 con desconocidos es grosero!",
      id: "Bahasa Korea punya 7 tingkat bicara. Kamu cukup tahu 3: 해요체 (sopan), 합쇼체 (formal), 반말 (santai). Pakai 반말 ke orang asing itu sangat tidak sopan!",
    },
  },
  {
    id: "cn37",
    category: "culture",
    icon: "⚡",
    language: "ko",
    country: "KR",
    title: {
      ko: "빨리빨리 문화",
      en: "Korea's '빨리빨리' (hurry hurry) culture",
      es: "La cultura '빨리빨리' (rápido rápido) de Corea",
      id: "Budaya '빨리빨리' (cepat cepat) Korea",
    },
    content: {
      ko: "'빨리빨리'는 한국의 대표 문화예요. 배달 30분, 세계 최고 인터넷 속도, 카페에서 30초 만에 커피가 나와요!",
      en: "Korea's 빨리빨리 culture means everything is fast: delivery in 30 min, world's fastest internet, and coffee ready in 30 seconds!",
      es: "La cultura 빨리빨리 de Corea significa rapidez: entrega en 30 min, internet más rápido del mundo, ¡café listo en 30 segundos!",
      id: "Budaya 빨리빨리 Korea berarti semuanya serba cepat: antar makanan 30 menit, internet tercepat di dunia, dan kopi siap dalam 30 detik!",
    },
  },
  {
    id: "cn38",
    category: "etiquette",
    icon: "👴",
    language: "ko",
    country: "KR",
    title: {
      ko: "한국의 나이 서열 문화",
      en: "Korean age hierarchy",
      es: "La jerarquía de edad en Corea",
      id: "Hierarki usia di Korea",
    },
    content: {
      ko: "한국에서는 만나면 나이를 먼저 물어봐요. 나이에 따라 형/오빠/누나/언니 등 호칭과 말투가 달라져요. 1살 차이도 중요해요!",
      en: "In Korea, people ask your age early on. It determines titles (형/오빠/누나/언니) and speech level. Even a 1-year gap matters!",
      es: "En Corea, preguntan tu edad pronto. Determina títulos (형/오빠/누나/언니) y nivel de habla. ¡Hasta 1 año de diferencia importa!",
      id: "Di Korea, orang menanyakan umurmu di awal perkenalan. Umur menentukan panggilan (형/오빠/누나/언니) dan gaya bicara. Beda 1 tahun pun penting!",
    },
  },
  {
    id: "cn39",
    category: "etiquette",
    icon: "🍷",
    language: "ko",
    country: "KR",
    title: {
      ko: "한국의 음주 예절",
      en: "Korean drinking etiquette",
      es: "Etiqueta al beber en Corea",
      id: "Etika minum di Korea",
    },
    content: {
      ko: "윗사람 앞에서 술을 마실 때는 고개를 돌려서 마셔요. 두 손으로 잔을 받고, 상대 잔이 비면 채워주는 것이 예의예요.",
      en: "When drinking with elders, turn your head away while sipping. Receive glasses with both hands, and refill others' empty glasses!",
      es: "Al beber con mayores, gira la cabeza. Recibe vasos con ambas manos y rellena los vasos vacíos de los demás. ¡Es cortesía!",
      id: "Saat minum bersama orang yang lebih tua, palingkan kepalamu sambil menyesap. Terima gelas dengan dua tangan, dan isi ulang gelas orang lain yang kosong — itu sopan santunnya!",
    },
  },
  {
    id: "cn40",
    category: "etiquette",
    icon: "🍚",
    language: "ko",
    country: "KR",
    title: {
      ko: "한국의 식사 예절",
      en: "Korean table manners",
      es: "Modales en la mesa coreana",
      id: "Tata krama makan Korea",
    },
    content: {
      ko: "어른이 먼저 수저를 드신 후 식사를 시작하세요. 밥그릇을 들고 먹지 않아요. 젓가락을 밥에 꽂지 마세요 — 제사 때만 해요!",
      en: "Wait for the eldest to start eating. Don't lift your bowl (unlike Japan!). Never stick chopsticks in rice — that's for memorial rites only!",
      es: "Espera a que el mayor empiece. No levantes el tazón (¡a diferencia de Japón!). Nunca claves palillos en el arroz — ¡es para rituales!",
      id: "Tunggu yang paling tua mulai makan dulu. Jangan angkat mangkuk nasimu (beda dengan Jepang!). Jangan tancapkan sumpit di nasi — itu cuma untuk ritual leluhur!",
    },
  },
  {
    id: "cn41",
    category: "culture",
    icon: "🦊",
    language: "ko",
    country: "KR",
    title: {
      ko: "눈치 (nunchi) — 분위기 읽기",
      en: "눈치 (nunchi) — reading the room",
      es: "눈치 (nunchi) — leer el ambiente",
      id: "눈치 (nunchi) — membaca suasana",
    },
    content: {
      ko: "'눈치'는 상대방의 기분이나 상황을 빠르게 파악하는 능력이에요. '눈치가 빠르다'는 센스 있다는 뜻, '눈치가 없다'는 공기를 못 읽는다는 뜻이에요.",
      en: "'눈치' is the ability to read others' moods. Good 눈치 means you're perceptive. No 눈치 means you're socially oblivious. A key Korean concept!",
      es: "'눈치' es la habilidad de percibir el ánimo de otros. Buen 눈치 = perceptivo. Sin 눈치 = despistado socialmente. ¡Concepto clave coreano!",
      id: "'눈치' adalah kemampuan membaca suasana hati orang lain dengan cepat. 'Cepat 눈치' berarti peka, 'nggak punya 눈치' berarti nggak bisa baca situasi. Konsep penting Korea!",
    },
  },
  {
    id: "cn42",
    category: "etiquette",
    icon: "🎁",
    language: "ko",
    country: "KR",
    title: {
      ko: "한국의 선물 문화",
      en: "Gift-giving in Korea",
      es: "Dar regalos en Corea",
      id: "Budaya memberi hadiah di Korea",
    },
    content: {
      ko: "선물을 두 손으로 주고받아요. 받은 즉시 열지 않는 것이 예의예요. 빨간색으로 이름을 쓰면 안 돼요 — 돌아가신 분 이름만 빨간색으로 써요!",
      en: "Give and receive gifts with both hands. Don't open them immediately. Never write names in red ink — it's reserved for the deceased!",
      es: "Da y recibe regalos con ambas manos. No los abras de inmediato. ¡Nunca escribas nombres en rojo — se reserva para los fallecidos!",
      id: "Beri dan terima hadiah dengan dua tangan. Jangan langsung dibuka — itu sopannya. Jangan tulis nama pakai tinta merah — itu khusus untuk orang yang sudah meninggal!",
    },
  },
  {
    id: "cn43",
    category: "idiom",
    icon: "💪",
    language: "ko",
    country: "KR",
    title: {
      ko: "화이팅! / 파이팅!",
      en: "화이팅! (Hwaiting!) — Korean encouragement",
      es: "화이팅! (Hwaiting!) — ánimo coreano",
      id: "화이팅! (Hwaiting!) — semangat ala Korea",
    },
    content: {
      ko: "'화이팅'은 영어 'fighting'에서 왔지만 '힘내!', '잘 할 수 있어!'라는 응원이에요. 시험 전, 운동 경기, 힘든 하루에 써요!",
      en: "'Hwaiting' comes from 'fighting' but means 'You can do it!' Used before exams, sports, or any challenge. Always with a fist pump!",
      es: "'Hwaiting' viene de 'fighting' pero significa '¡Tú puedes!' Se usa antes de exámenes, deportes o retos. ¡Siempre con el puño arriba!",
      id: "'Hwaiting' berasal dari kata 'fighting', tapi artinya 'Semangat!', 'Kamu pasti bisa!'. Dipakai sebelum ujian, pertandingan, atau hari yang berat. Selalu sambil mengepalkan tangan!",
    },
  },
  {
    id: "cn44",
    category: "culture",
    icon: "♨️",
    language: "ko",
    country: "KR",
    title: {
      ko: "한국의 찜질방 문화",
      en: "Jjimjilbang (Korean spa) culture",
      es: "La cultura del jjimjilbang (spa coreano)",
      id: "Budaya jjimjilbang (spa Korea)",
    },
    content: {
      ko: "찜질방은 한국식 대중목욕탕 + 사우나예요. 양머리 수건을 만들고, 식혜와 계란을 먹으며 밤새 놀 수 있어요!",
      en: "Jjimjilbang is a Korean spa/sauna. You make sheep-head towels, eat sikhye (sweet rice drink) and eggs, and can stay overnight!",
      es: "El jjimjilbang es un spa/sauna coreano. Haces toallas de oveja, comes sikhye (bebida de arroz) y huevos, ¡y puedes quedarte toda la noche!",
      id: "Jjimjilbang itu pemandian umum sekaligus sauna ala Korea. Kamu bikin handuk bentuk kepala domba, makan sikhye (minuman beras manis) dan telur, dan bisa nginap semalaman!",
    },
  },
  {
    id: "cn45",
    category: "culture",
    icon: "🔢",
    language: "ko",
    country: "KR",
    title: {
      ko: "한국어의 두 가지 숫자 체계",
      en: "Korean's two number systems",
      es: "Los dos sistemas numéricos del coreano",
      id: "Dua sistem angka dalam bahasa Korea",
    },
    content: {
      ko: "한국어에는 고유어 숫자(하나, 둘, 셋)와 한자어 숫자(일, 이, 삼)가 있어요. 나이는 고유어, 전화번호는 한자어를 써요!",
      en: "Korean has native numbers (하나, 둘, 셋) and Sino-Korean (일, 이, 삼). Age uses native, phone numbers use Sino-Korean. You need both!",
      es: "El coreano tiene números nativos (하나, 둘, 셋) y sino-coreanos (일, 이, 삼). La edad usa nativos, los teléfonos sino-coreanos. ¡Necesitas ambos!",
      id: "Bahasa Korea punya angka asli Korea (하나, 둘, 셋) dan angka Sino-Korea (일, 이, 삼). Umur pakai angka asli, nomor telepon pakai Sino-Korea. Kamu butuh dua-duanya!",
    },
  },

  // ════════════════════════════════════════════
  // ARABIC LEARNERS (language: "ar") — Egyptian culture, ~10 notes
  // ════════════════════════════════════════════
  {
    id: "cn46",
    category: "etiquette",
    icon: "💵",
    language: "ar",
    country: "EG",
    title: {
      ko: "박시시: 어디서나 팁 문화",
      en: "Baksheesh: tipping is everywhere",
      es: "Baksheesh: las propinas están por todas partes",
      id: "Baksheesh: tip ada di mana-mana",
    },
    content: {
      ko: "이집트에서는 작은 팁(박시시)이 일상이에요. 주차 도우미, 화장실 안내원, 짐꾼에게요. 잔돈을 챙겨두세요. 몇 파운드면 충분하고 늘 고마워해요.",
      en: "In Egypt, small tips (baksheesh) are part of daily life — for the parking helper, the restroom attendant, the porter. Keep small bills handy; a few pounds is enough and always appreciated.",
      es: "En Egipto, las pequeñas propinas (baksheesh) son parte de la vida diaria: para el del parking, el del baño, el maletero. Lleva billetes pequeños; unas libras bastan y siempre se agradecen.",
      id: "Di Mesir, tip kecil (baksheesh) adalah bagian dari keseharian — untuk tukang parkir, penjaga toilet, porter. Siapkan uang receh; beberapa pound sudah cukup dan selalu dihargai.",
    },
  },
  {
    id: "cn47",
    category: "culture",
    icon: "☕",
    language: "ar",
    country: "EG",
    title: {
      ko: "아흐와: 이집트의 사랑방",
      en: "The ahwa: Egypt's living room",
      es: "El ahwa: la sala de estar de Egipto",
      id: "Ahwa: ruang tamu Mesir",
    },
    content: {
      ko: "동네 커피하우스(아흐와)는 차(샤이), 도미노, 축구로 모이는 곳이에요. '샤이(차)'를 주문해 보세요. 보통 아주 달아요. 차를 받아들이는 건 우정을 받아들이는 거예요.",
      en: "The local coffeehouse (ahwa) is where people gather for tea (shai), dominoes, and football. Order 'shai' — often very sweet. Saying yes to tea is saying yes to friendship.",
      es: "La cafetería local (ahwa) es donde la gente se reúne para tomar té (shai), jugar al dominó y ver fútbol. Pide 'shai', suele ser muy dulce. Aceptar el té es aceptar la amistad.",
      id: "Kedai kopi lokal (ahwa) adalah tempat orang berkumpul untuk minum teh (shai), main domino, dan nonton bola. Pesan 'shai' — biasanya sangat manis. Menerima teh berarti menerima persahabatan.",
    },
  },
  {
    id: "cn48",
    category: "etiquette",
    icon: "🍽️",
    language: "ar",
    country: "EG",
    title: {
      ko: "무조건 더 먹으라고 권해요",
      en: "They will insist you eat",
      es: "Insistirán en que comas",
      id: "Mereka akan memaksamu makan",
    },
    content: {
      ko: "이집트의 환대(카람)는 유명해요. 주인은 더 먹으라고 권하고, 한 번 사양하는 건 예의일 뿐이라 또 권해요. '에트파달!'은 '드세요, 어서요'라는 뜻이에요.",
      en: "Egyptian hospitality (karam) is legendary. A host presses you to eat more, and refusing once is just politeness — they will offer again. 'Etfaddal!' means 'please, help yourself.'",
      es: "La hospitalidad egipcia (karam) es legendaria. El anfitrión insiste en que comas más, y rechazar una vez es solo cortesía: volverá a ofrecer. '¡Etfaddal!' significa 'por favor, sírvete'.",
      id: "Keramahan Mesir (karam) sangat terkenal. Tuan rumah akan mendesakmu makan lebih banyak, dan menolak sekali hanya basa-basi — mereka akan menawarkan lagi. 'Etfaddal!' berarti 'silakan, ambil sendiri'.",
    },
  },
  {
    id: "cn49",
    category: "culture",
    icon: "🕰️",
    language: "ar",
    country: "EG",
    title: {
      ko: "인샤알라, 부크라, 말레시",
      en: "Inshallah, bukra, maalesh",
      es: "Inshallah, bukra, maalesh",
      id: "Inshallah, bukra, maalesh",
    },
    content: {
      ko: "매일 듣게 될 세 단어: 인샤알라(신의 뜻이라면), 부크라(내일), 말레시(괜찮아요). 이집트에서 시간은 유연해요. 인내와 미소가 시계보다 더 통해요.",
      en: "Three words you will hear daily: inshallah (God willing), bukra (tomorrow), maalesh (never mind / it's okay). Time is flexible in Egypt — patience and a smile go further than a clock.",
      es: "Tres palabras que oirás a diario: inshallah (si Dios quiere), bukra (mañana), maalesh (no pasa nada). El tiempo es flexible en Egipto: la paciencia y una sonrisa valen más que el reloj.",
      id: "Tiga kata yang akan kamu dengar tiap hari: inshallah (jika Tuhan mengizinkan), bukra (besok), maalesh (tidak apa-apa). Waktu itu lentur di Mesir — kesabaran dan senyum lebih ampuh daripada jam.",
    },
  },
  {
    id: "cn50",
    category: "etiquette",
    icon: "🤝",
    language: "ar",
    country: "EG",
    title: {
      ko: "인사는 천천히, 충분히",
      en: "Greetings take their time",
      es: "Los saludos llevan su tiempo",
      id: "Salam butuh waktu",
    },
    content: {
      ko: "이집트 사람들은 따뜻하게 인사해요. '이자이약?'(잘 지내요?), 같은 성별끼리는 볼 키스도 해요. 일 이야기 전에 가족과 안부를 먼저 물어요. 인사를 서두르면 차갑게 느껴져요.",
      en: "Egyptians greet warmly: 'Izzayyak?' (how are you?), often with cheek kisses between the same gender. Ask about family and health before business — rushing a greeting feels cold.",
      es: "Los egipcios saludan con calidez: '¿Izzayyak?' (¿cómo estás?), a menudo con besos en la mejilla entre el mismo género. Pregunta por la familia y la salud antes de los negocios: apurar el saludo parece frío.",
      id: "Orang Mesir menyapa dengan hangat: 'Izzayyak?' (apa kabar?), sering dengan cium pipi antar sesama jenis. Tanyakan keluarga dan kesehatan sebelum urusan bisnis — menyapa terburu-buru terasa dingin.",
    },
  },
  {
    id: "cn51",
    category: "etiquette",
    icon: "🛍️",
    language: "ar",
    country: "EG",
    title: {
      ko: "흥정은 당연한 일",
      en: "Bargaining is expected",
      es: "Regatear es lo normal",
      id: "Menawar itu wajar",
    },
    content: {
      ko: "시장(수크)과 바자르에서는 흥정(파살)이 자연스럽고 친근한 일이에요. 웃으며 절반쯤 부르고 중간에서 만나요. 슈퍼마켓과 정찰제 가게는 예외예요.",
      en: "In markets (souq) and bazaars, haggling (fesaal) is normal and friendly. Smile, offer about half, and meet in the middle. Supermarkets and fixed-price shops are the exception.",
      es: "En los mercados (souq) y bazares, regatear (fesaal) es normal y amistoso. Sonríe, ofrece la mitad y encontraos a medio camino. Los supermercados y tiendas de precio fijo son la excepción.",
      id: "Di pasar (souq) dan bazar, menawar (fesaal) itu wajar dan akrab. Tersenyumlah, tawar sekitar setengah harga, lalu temukan titik tengah. Supermarket dan toko harga pas adalah pengecualian.",
    },
  },
  {
    id: "cn52",
    category: "culture",
    icon: "🥖",
    language: "ar",
    country: "EG",
    title: {
      ko: "아이시는 '생명'이라는 뜻",
      en: "Aish means 'life'",
      es: "Aish significa 'vida'",
      id: "Aish berarti 'kehidupan'",
    },
    content: {
      ko: "이집트 사람들은 빵을 '아이시'라고 불러요. '생명'과 똑같은 단어예요. 빵은 신성하게 여겨서 낭비하거나 바닥에 떨어뜨리지 않아요. 떨어지면 주워서 이마에 갖다 대요.",
      en: "Egyptians call bread 'aish' — the very same word as 'life'. Bread is treated as sacred: never waste it or drop it on the ground. If it falls, people pick it up and touch it to the forehead.",
      es: "Los egipcios llaman al pan 'aish', la misma palabra que 'vida'. El pan se trata como algo sagrado: nunca lo desperdicies ni lo tires al suelo. Si cae, la gente lo recoge y lo toca con la frente.",
      id: "Orang Mesir menyebut roti 'aish' — sama persis dengan kata 'kehidupan'. Roti dianggap suci: jangan disia-siakan atau dijatuhkan ke tanah. Kalau jatuh, orang memungutnya dan menyentuhkannya ke dahi.",
    },
  },
  {
    id: "cn53",
    category: "culture",
    icon: "🕌",
    language: "ar",
    country: "EG",
    title: {
      ko: "금요일이 거룩한 날",
      en: "Friday is the holy day",
      es: "El viernes es el día sagrado",
      id: "Jumat adalah hari suci",
    },
    content: {
      ko: "이집트의 주말은 금요일~토요일이에요. 금요일(엘곰아)은 정오 기도와 큰 가족 점심을 위한 날이라 많은 가게가 늦게 열어요. 금요 기도 시간을 고려해 일정을 짜세요.",
      en: "The Egyptian weekend is Friday–Saturday. Friday (el-Gomaa) is for midday prayer and a big family lunch; many shops open later that day. Plan errands around the Friday prayer time.",
      es: "El fin de semana egipcio es viernes y sábado. El viernes (el-Gomaa) es para la oración del mediodía y un gran almuerzo familiar; muchas tiendas abren más tarde. Planifica tus recados según la hora del rezo del viernes.",
      id: "Akhir pekan Mesir adalah Jumat–Sabtu. Jumat (el-Gomaa) untuk salat tengah hari dan makan siang keluarga besar; banyak toko buka lebih siang. Atur urusanmu seputar waktu salat Jumat.",
    },
  },
  {
    id: "cn54",
    category: "etiquette",
    icon: "✋",
    language: "ar",
    country: "EG",
    title: {
      ko: "먹고 건넬 땐 오른손으로",
      en: "Eat and give with the right hand",
      es: "Come y da con la mano derecha",
      id: "Makan dan memberi dengan tangan kanan",
    },
    content: {
      ko: "먹고, 주고, 받을 때는 오른손을 쓰세요. 왼손은 이런 일에 부정하게 여겨져요. 함께 먹는 접시에서는 가운데가 아니라 자기 쪽에서 덜어요.",
      en: "Use your right hand for eating, giving, and receiving; the left is considered unclean for these. When sharing a communal dish, take from the side nearest you, not the middle.",
      es: "Usa la mano derecha para comer, dar y recibir; la izquierda se considera impura para esto. Al compartir un plato común, toma del lado más cercano a ti, no del centro.",
      id: "Gunakan tangan kanan untuk makan, memberi, dan menerima; tangan kiri dianggap kurang pantas untuk ini. Saat berbagi piring bersama, ambil dari sisi terdekatmu, bukan dari tengah.",
    },
  },
  {
    id: "cn55",
    category: "culture",
    icon: "🧿",
    language: "ar",
    country: "EG",
    title: {
      ko: "흉안과 '마샤알라'",
      en: "The evil eye and 'ma sha Allah'",
      es: "El mal de ojo y 'ma sha Allah'",
      id: "Mata jahat dan 'ma sha Allah'",
    },
    content: {
      ko: "칭찬 뒤에는 흉안(엘아인)을 막으려고 '마샤알라'를 자주 붙여요. 파란 '캄사'(파티마의 손) 부적이 그것을 막아줘요. 아기나 새 차를 칭찬할 땐 '마샤알라'를 덧붙이세요.",
      en: "A compliment is often followed by 'ma sha Allah' to ward off the evil eye (el-ain). The blue 'khamsa' (hand of Fatima) charm guards against it. Praising a baby or a new car? Add 'ma sha Allah'.",
      es: "Un cumplido suele ir seguido de 'ma sha Allah' para alejar el mal de ojo (el-ain). El amuleto azul 'khamsa' (mano de Fátima) protege contra él. ¿Elogias a un bebé o un coche nuevo? Añade 'ma sha Allah'.",
      id: "Pujian sering diikuti 'ma sha Allah' untuk menangkal mata jahat (el-ain). Jimat biru 'khamsa' (tangan Fatimah) melindungi darinya. Memuji bayi atau mobil baru? Tambahkan 'ma sha Allah'.",
    },
  },

  // ════════════════════════════════════════════
  // INDONESIAN LEARNERS (language: "id") — Indonesian culture, ~12 notes
  // ════════════════════════════════════════════
  {
    id: "cn56",
    category: "etiquette",
    icon: "🥿",
    language: "id",
    country: "ID",
    title: {
      ko: "집에 들어갈 땐 신발을 벗어요",
      en: "Take off your shoes before entering a home",
      es: "Quítate los zapatos antes de entrar a una casa",
      id: "Lepas sepatu sebelum masuk rumah",
    },
    content: {
      ko: "인도네시아에서는 집에 들어가기 전에 항상 신발을 벗어요. 문 앞에 신발이 놓여 있으면 안에서도 벗으라는 신호예요. 깜빡하면 큰 실례예요!",
      en: "In Indonesia, you always remove your shoes before entering a home. Shoes lined up by the door are your cue to do the same. Forgetting is a real faux pas!",
      es: "En Indonesia, siempre te quitas los zapatos antes de entrar a una casa. Los zapatos junto a la puerta son la señal de hacer lo mismo. ¡Olvidarlo es una falta de respeto!",
      id: "Di Indonesia, kamu selalu melepas sepatu sebelum masuk rumah. Sepatu yang berjajar di depan pintu adalah tanda untuk ikut melepas. Lupa melakukannya itu nggak sopan!",
    },
  },
  {
    id: "cn57",
    category: "etiquette",
    icon: "✋",
    language: "id",
    country: "ID",
    title: {
      ko: "먹고 건넬 땐 오른손으로",
      en: "Eat and give with the right hand",
      es: "Come y da con la mano derecha",
      id: "Makan dan memberi dengan tangan kanan",
    },
    content: {
      ko: "음식을 먹거나 물건을 주고받을 때는 항상 오른손을 쓰세요. 왼손은 부정하게 여겨져요. 양손으로 건네면 더 정중한 표현이에요.",
      en: "Always use your right hand to eat or to give and receive things. The left hand is considered unclean. Using both hands is even more polite.",
      es: "Usa siempre la mano derecha para comer o para dar y recibir cosas. La mano izquierda se considera impura. Usar ambas manos es aún más cortés.",
      id: "Selalu gunakan tangan kanan untuk makan atau memberi dan menerima sesuatu. Tangan kiri dianggap kurang pantas. Memberi dengan dua tangan malah lebih sopan.",
    },
  },
  {
    id: "cn58",
    category: "culture",
    icon: "🕰️",
    language: "id",
    country: "ID",
    title: {
      ko: "잠 까렛: 고무줄 시간",
      en: "Jam karet: 'rubber time'",
      es: "Jam karet: la 'hora elástica'",
      id: "Jam karet",
    },
    content: {
      ko: "'잠 까렛'은 '고무 시간'이라는 뜻으로, 약속 시간이 고무줄처럼 늘어나는 느긋한 시간 관념이에요. 사교 모임이 조금 늦게 시작해도 너무 놀라지 마세요!",
      en: "'Jam karet' means 'rubber time' — a relaxed attitude where appointments stretch like elastic. Don't be surprised if social gatherings start a bit late!",
      es: "'Jam karet' significa 'hora de goma': una actitud relajada en la que las citas se estiran como un elástico. ¡No te sorprendas si las reuniones sociales empiezan algo tarde!",
      id: "'Jam karet' artinya waktu yang molor seperti karet — sikap santai di mana janji bisa mundur. Jangan kaget kalau acara santai mulai agak telat ya!",
    },
  },
  {
    id: "cn59",
    category: "etiquette",
    icon: "🙏",
    language: "id",
    country: "ID",
    title: {
      ko: "살림: 어른 손에 인사하기",
      en: "Salim: greeting elders by hand",
      es: "Salim: saludar a los mayores con la mano",
      id: "Salim (cium tangan)",
    },
    content: {
      ko: "'살림' 또는 '찌움 땅안'은 어른의 손등을 잡아 자신의 이마에 살짝 갖다 대는 인사예요. 존경을 표하는 방법으로, 특히 부모님과 어르신께 해요.",
      en: "'Salim' (or cium tangan) is taking an elder's hand and gently touching it to your forehead. It's a gesture of respect, especially toward parents and the elderly.",
      es: "'Salim' (o cium tangan) consiste en tomar la mano de un mayor y tocarla suavemente con tu frente. Es un gesto de respeto, sobre todo hacia los padres y los ancianos.",
      id: "'Salim' atau cium tangan adalah mengambil tangan orang yang lebih tua dan menempelkannya lembut ke dahimu. Ini tanda hormat, terutama kepada orang tua dan yang lebih sepuh.",
    },
  },
  {
    id: "cn60",
    category: "etiquette",
    icon: "👍",
    language: "id",
    country: "ID",
    title: {
      ko: "소빤 산뚠: 부드러운 태도",
      en: "Sopan santun: gentle manners",
      es: "Sopan santun: modales suaves",
      id: "Sopan santun",
    },
    content: {
      ko: "인도네시아에서는 부드럽게 말하고 차분한 태도가 중요해요. 무언가를 가리킬 땐 검지가 아니라 엄지를 써요. 큰 소리나 화내는 모습은 무례하게 여겨져요.",
      en: "In Indonesia, a soft voice and calm manner matter. To point at something, use your thumb, never your index finger. Raising your voice or showing anger is seen as rude.",
      es: "En Indonesia, importan la voz suave y los modales tranquilos. Para señalar algo, usa el pulgar, nunca el índice. Alzar la voz o mostrar enojo se considera grosero.",
      id: "Di Indonesia, suara yang lembut dan sikap tenang itu penting. Untuk menunjuk sesuatu, gunakan ibu jari, bukan telunjuk. Meninggikan suara atau marah dianggap tidak sopan.",
    },
  },
  {
    id: "cn61",
    category: "culture",
    icon: "🤝",
    language: "id",
    country: "ID",
    title: {
      ko: "고똥 로용: 상부상조 정신",
      en: "Gotong royong: communal help",
      es: "Gotong royong: ayuda comunitaria",
      id: "Gotong royong",
    },
    content: {
      ko: "'고똥 로용'은 마을 사람들이 함께 일을 돕는 상부상조의 정신이에요. 이사, 결혼식, 청소 등 큰일이 있으면 이웃이 자연스럽게 모여 도와요.",
      en: "'Gotong royong' is the spirit of communal mutual help. For big tasks — moving house, weddings, cleanups — neighbors naturally gather to pitch in together.",
      es: "'Gotong royong' es el espíritu de ayuda mutua comunitaria. Para tareas grandes — mudanzas, bodas, limpiezas — los vecinos se reúnen de forma natural para colaborar.",
      id: "'Gotong royong' adalah semangat saling membantu dalam komunitas. Untuk urusan besar — pindah rumah, hajatan, kerja bakti — tetangga dengan sendirinya berkumpul dan ikut membantu.",
    },
  },
  {
    id: "cn62",
    category: "etiquette",
    icon: "🛍️",
    language: "id",
    country: "ID",
    title: {
      ko: "빠사르에서 흥정하기",
      en: "Bargaining at the pasar",
      es: "Regatear en el pasar",
      id: "Tawar-menawar di pasar",
    },
    content: {
      ko: "전통 시장(빠사르)에서는 흥정(따와르-머나와르)이 당연한 일이에요. 웃으며 가격을 깎아 보세요. 다만 정찰제인 쇼핑몰과 미니마켓에서는 안 통해요!",
      en: "At traditional markets (pasar), bargaining (tawar-menawar) is expected. Smile and negotiate the price down. But it won't work at fixed-price malls and minimarkets!",
      es: "En los mercados tradicionales (pasar), regatear (tawar-menawar) es lo normal. Sonríe y negocia para bajar el precio. ¡Pero no funciona en los centros comerciales y minimarkets de precio fijo!",
      id: "Di pasar tradisional, tawar-menawar itu wajar. Tersenyumlah dan tawar harganya. Tapi ini nggak berlaku di mal dan minimarket yang harganya pas!",
    },
  },
  {
    id: "cn63",
    category: "culture",
    icon: "🍚",
    language: "id",
    country: "ID",
    title: {
      ko: "쌀은 주식이에요",
      en: "Rice is the staple",
      es: "El arroz es el alimento básico",
      id: "Nasi adalah makanan pokok",
    },
    content: {
      ko: "인도네시아에서 밥(나시)은 식사의 핵심이에요. '벌룸 마깐'(아직 안 먹었어요)은 다른 걸 먹었어도 밥을 안 먹었으면 쓸 정도로, 밥을 먹어야 진짜 식사예요!",
      en: "In Indonesia, rice (nasi) is the heart of a meal. 'Belum makan' (I haven't eaten) can mean you haven't had rice yet — even after a snack. No rice, no real meal!",
      es: "En Indonesia, el arroz (nasi) es el centro de la comida. 'Belum makan' (no he comido) puede significar que aún no has comido arroz, aunque hayas picado algo. ¡Sin arroz no hay comida de verdad!",
      id: "Di Indonesia, nasi adalah inti dari sebuah makan. 'Belum makan' bisa berarti kamu belum makan nasi — meski sudah ngemil. Tanpa nasi, belum dianggap makan sungguhan!",
    },
  },
  {
    id: "cn64",
    category: "idiom",
    icon: "😌",
    language: "id",
    country: "ID",
    title: {
      ko: "띠닥 아빠-아빠: 괜찮아요",
      en: "Tidak apa-apa: it's fine",
      es: "Tidak apa-apa: no pasa nada",
      id: "Tidak apa-apa / nggak apa-apa",
    },
    content: {
      ko: "'띠닥 아빠-아빠'(편하게는 '응각 아빠-아빠')는 '괜찮아요, 별일 아니에요'라는 뜻이에요. 사과를 받아주거나 상대를 안심시킬 때 자주 쓰는 따뜻한 표현이에요.",
      en: "'Tidak apa-apa' (casually 'nggak apa-apa') means 'it's fine, no problem.' It's a warm, reassuring phrase used to accept an apology or put someone at ease.",
      es: "'Tidak apa-apa' (de forma casual 'nggak apa-apa') significa 'no pasa nada, no hay problema'. Es una frase cálida y tranquilizadora para aceptar una disculpa o calmar a alguien.",
      id: "'Tidak apa-apa' (santainya 'nggak apa-apa') berarti 'nggak masalah, santai aja'. Ini ungkapan hangat yang menenangkan, dipakai untuk menerima permintaan maaf atau membuat orang lega.",
    },
  },
  {
    id: "cn65",
    category: "culture",
    icon: "🌙",
    language: "id",
    country: "ID",
    title: {
      ko: "르바란과 무딕 (귀향)",
      en: "Lebaran & mudik (homecoming)",
      es: "Lebaran y mudik (el regreso a casa)",
      id: "Lebaran & mudik",
    },
    content: {
      ko: "르바란(이둘 피뜨리)은 라마단이 끝난 뒤의 가장 큰 명절이에요. 수백만 명이 고향으로 돌아가는 '무딕'을 하고, 어른께 용서를 구하며 '모홍 마앞 라히르 단 바띤'이라고 말해요.",
      en: "Lebaran (Idul Fitri) is the biggest holiday, marking the end of Ramadan. Millions travel home in the 'mudik' exodus and ask elders for forgiveness: 'Mohon maaf lahir dan batin.'",
      es: "Lebaran (Idul Fitri) es la fiesta más grande, que marca el fin del Ramadán. Millones viajan a casa en el éxodo 'mudik' y piden perdón a los mayores: 'Mohon maaf lahir dan batin.'",
      id: "Lebaran (Idul Fitri) adalah hari raya terbesar, menandai akhir Ramadan. Jutaan orang pulang kampung dalam tradisi 'mudik' dan meminta maaf kepada yang lebih tua: 'Mohon maaf lahir dan batin.'",
    },
  },
  {
    id: "cn66",
    category: "etiquette",
    icon: "🧓",
    language: "id",
    country: "ID",
    title: {
      ko: "어른과 또래를 부르는 호칭",
      en: "Addressing elders and peers",
      es: "Cómo dirigirse a mayores y compañeros",
      id: "Memanggil orang yang lebih tua",
    },
    content: {
      ko: "나이 많은 남성은 '바빡', 여성은 '이부'라고 불러요. 또래나 조금 손위의 젊은 남성은 '마스', 여성은 '음박'이라고 해요. 이름만 부르지 말고 호칭을 붙이는 게 예의예요!",
      en: "Call an older man 'Bapak' (Pak) and an older woman 'Ibu' (Bu). For peers or slightly older young people, use 'Mas' (men) and 'Mbak' (women). Adding a title — not just a name — is polite!",
      es: "Llama a un hombre mayor 'Bapak' (Pak) y a una mujer mayor 'Ibu' (Bu). Para compañeros o jóvenes algo mayores, usa 'Mas' (hombres) y 'Mbak' (mujeres). ¡Añadir un título, y no solo el nombre, es cortés!",
      id: "Panggil pria yang lebih tua 'Bapak' (Pak) dan wanita yang lebih tua 'Ibu' (Bu). Untuk sebaya atau anak muda yang sedikit lebih tua, pakai 'Mas' (pria) dan 'Mbak' (wanita). Menambahkan sapaan — bukan cuma nama — itu sopan!",
    },
  },
  {
    id: "cn67",
    category: "etiquette",
    icon: "🍈",
    language: "id",
    country: "ID",
    title: {
      ko: "두리안 예절",
      en: "Durian etiquette",
      es: "Etiqueta del durián",
      id: "Etika durian",
    },
    content: {
      ko: "'과일의 왕' 두리안은 향이 아주 강해서 많은 호텔, 버스, 기차에서 반입이 금지돼 있어요. 냄새 표지판을 잘 보고, 밀폐된 공간에서는 먹지 마세요!",
      en: "Durian, the 'king of fruits,' has such a strong smell that it's banned in many hotels, buses, and trains. Watch for the no-durian signs, and don't eat it in enclosed spaces!",
      es: "El durián, el 'rey de las frutas', tiene un olor tan fuerte que está prohibido en muchos hoteles, autobuses y trenes. Fíjate en los carteles que lo prohíben y no lo comas en espacios cerrados.",
      id: "Durian, sang 'raja buah', baunya sangat kuat sampai dilarang di banyak hotel, bus, dan kereta. Perhatikan tanda larangan durian, dan jangan memakannya di ruang tertutup!",
    },
  },
];

/** Get today's cultural note for a specific learning language (cycles daily) */
export function getTodayNote(learningLang: "ko" | "en" | "es" | "ar" | "id"): CulturalNote {
  const filtered = getNotesForLanguage(learningLang);
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return filtered[dayOfYear % filtered.length];
}

/** Get notes for a specific learning language */
export function getNotesForLanguage(lang: "ko" | "en" | "es" | "ar" | "id"): CulturalNote[] {
  return CULTURAL_NOTES.filter((n) => n.language === lang);
}
