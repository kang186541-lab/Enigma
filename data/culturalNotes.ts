export interface CulturalNote {
  id: string;
  category: "culture" | "idiom" | "etiquette";
  icon: string;
  language: "ko" | "en" | "es";
  country?: string;
  title: { ko: string; en: string; es: string };
  content: { ko: string; en: string; es: string };
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
    },
    content: {
      ko: "미국 레스토랑에서는 15-20% 팁이 필수예요. 팁을 안 주면 매우 무례하게 여겨져요. 바리스타나 바텐더에게도 $1-2 팁을 줘요.",
      en: "In US restaurants, a 15-20% tip is expected. Not tipping is considered very rude. Baristas and bartenders also get $1-2 tips.",
      es: "En restaurantes de EE.UU., se espera 15-20% de propina. No dejar propina es muy descortés. Baristas y bartenders también reciben $1-2.",
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
    },
    content: {
      ko: "미국인들은 낯선 사람에게도 'How are you?'라고 해요. 진짜 안부가 아니라 인사예요! 'Good, thanks!'라고 짧게 답하면 돼요.",
      en: "Americans say 'How are you?' even to strangers. It's a greeting, not a real question! Just reply 'Good, thanks!' and move on.",
      es: "Los estadounidenses dicen 'How are you?' hasta a desconocidos. Es un saludo, no una pregunta real. Solo responde 'Good, thanks!'.",
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
    },
    content: {
      ko: "11월 넷째 목요일에 가족이 모여 칠면조를 먹어요. 다음 날 '블랙 프라이데이'는 미국 최대 쇼핑 행사예요!",
      en: "On the fourth Thursday of November, families gather for turkey dinner. The next day, 'Black Friday,' is America's biggest shopping event!",
      es: "El cuarto jueves de noviembre, las familias cenan pavo. Al día siguiente, 'Black Friday,' es el mayor evento de compras en EE.UU.!",
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
    },
    content: {
      ko: "미국에서는 대학 미식축구와 농구가 프로만큼 인기 있어요. 학생들은 학교 색깔 옷을 입고 경기장을 가득 채워요!",
      en: "In the US, college football and basketball are as popular as pro sports. Students wear school colors and pack huge stadiums!",
      es: "En EE.UU., el fútbol americano y baloncesto universitario son tan populares como los profesionales. Los estadios se llenan!",
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
    },
    content: {
      ko: "포틀럭은 각자 음식을 하나씩 가져오는 파티예요. 미국에서 매우 흔하고 'I'll bring a dish!'라고 말해요.",
      en: "A potluck is a party where everyone brings a dish to share. Very common in the US — just say 'I'll bring something!'",
      es: "Un potluck es una fiesta donde cada uno lleva un plato para compartir. Muy común en EE.UU. — solo di 'I'll bring something!'",
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
    },
    content: {
      ko: "'Fancy a cuppa?'는 차 한잔 할래?란 뜻이에요. 영국인은 하루 평균 4-5잔을 마시고, 우유 넣는 순서로 진지하게 논쟁해요!",
      en: "'Fancy a cuppa?' means 'Want a cup of tea?' Brits drink 4-5 cups daily and seriously debate whether milk goes in first or last!",
      es: "'Fancy a cuppa?' significa '¿Quieres un té?' Los británicos toman 4-5 tazas al día y debaten si la leche va primero o después!",
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
    },
    content: {
      ko: "영국에서 줄 안 서면 큰 실례예요! 'Queue jumping'은 영국인이 가장 싫어하는 행동 중 하나예요. 항상 차례를 기다리세요.",
      en: "Cutting in line ('queue jumping') is one of the worst social offenses in Britain. Always wait your turn — Brits take queues very seriously!",
      es: "Colarse en la fila ('queue jumping') es una de las peores ofensas sociales en Gran Bretaña. Siempre espera tu turno!",
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
    },
    content: {
      ko: "영국 펍에서는 'rounds' 시스템으로 돌아가며 음료를 사요. 자기 차례를 건너뛰면 예의에 어긋나요!",
      en: "In British pubs, friends buy 'rounds' — each person takes turns buying drinks for the group. Skipping your round is a social faux pas!",
      es: "En pubs británicos, los amigos compran 'rounds' — cada uno compra bebidas para el grupo por turnos. Saltarte tu turno es de mala educación!",
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
    },
    content: {
      ko: "영국인이 'Not bad'라고 하면 실제로 '아주 좋다'는 뜻일 수 있어요. 'Quite good'은 칭찬이고, 'Interesting'은 동의하지 않는다는 뜻일 수 있어요!",
      en: "When a Brit says 'Not bad,' they might mean 'excellent.' 'Quite good' is praise, and 'Interesting' might mean they disagree!",
      es: "Cuando un británico dice 'Not bad,' puede significar 'excelente.' 'Quite good' es un elogio, e 'Interesting' puede significar desacuerdo!",
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
    },
    content: {
      ko: "호주에서 'arvo'는 오후, 'brekkie'는 아침식사, 'barbie'는 바비큐, 'maccas'는 맥도날드예요. 모든 단어를 줄이는 게 호주 영어 특징!",
      en: "'Arvo' = afternoon, 'brekkie' = breakfast, 'barbie' = BBQ, 'Maccas' = McDonald's. Aussies shorten everything — that's just how they roll!",
      es: "'Arvo' = tarde, 'brekkie' = desayuno, 'barbie' = BBQ, 'Maccas' = McDonald's. Los australianos acortan todo — ¡así son ellos!",
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
    },
    content: {
      ko: "'Mate'는 호주에서 친구를 부르는 말이에요. 'Mateship'은 호주의 핵심 가치로, 어려울 때 서로 돕는 동료 정신을 의미해요.",
      en: "'Mate' means friend in Australia. 'Mateship' is a core Aussie value — sticking together and helping each other through tough times.",
      es: "'Mate' significa amigo en Australia. 'Mateship' es un valor central australiano — apoyarse mutuamente en los momentos difíciles.",
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
    },
    content: {
      ko: "캐나다인은 'Sorry'를 정말 자주 해요 — 누가 부딪혀도 서로 Sorry! 2009년에 'Sorry법'이 만들어져 사과가 법적 책임 인정이 아니에요!",
      en: "Canadians say 'Sorry' constantly — even if someone bumps into them! Canada's 'Apology Act' (2009) says sorry doesn't admit legal liability.",
      es: "Los canadienses dicen 'Sorry' todo el tiempo — ¡aunque alguien les empuje! La 'Ley de Disculpa' (2009) dice que disculparse no es admitir culpa.",
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
    },
    content: {
      ko: "미국: color, favorite, center, realize. 영국: colour, favourite, centre, realise. 둘 다 맞지만 섞어 쓰지 마세요!",
      en: "US: color, favorite, center, realize. UK: colour, favourite, centre, realise. Both are correct — just be consistent, don't mix them!",
      es: "EE.UU.: color, favorite, center, realize. UK: colour, favourite, centre, realise. Ambos son correctos — ¡solo sé consistente!",
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
    },
    content: {
      ko: "엘리베이터(US) vs 리프트(UK), 쓰레기(trash/US) vs rubbish(UK), 감자칩(chips/US) vs crisps(UK), 화장실(restroom/US) vs loo(UK).",
      en: "Elevator(US) vs lift(UK), trash vs rubbish, chips vs crisps, restroom vs loo, apartment vs flat, cookie vs biscuit!",
      es: "Elevator(US) vs lift(UK), trash vs rubbish, chips vs crisps, restroom vs loo, apartment vs flat, cookie vs biscuit!",
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
    },
    content: {
      ko: "'다리를 부러뜨려!'가 아니라 '행운을 빌어!'라는 뜻이에요. 특히 공연 전에 많이 써요. 직접 'Good luck'이라 하면 불운이 온다는 미신 때문이에요.",
      en: "This means 'Good luck!' especially before a performance. Saying 'good luck' directly is considered bad luck in theater — so they say this instead!",
      es: "Significa '¡Buena suerte!' especialmente antes de una actuación. Decir 'good luck' directamente trae mala suerte en el teatro.",
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
    },
    content: {
      ko: "'고양이와 개가 비처럼 내린다'? 비가 엄청 많이 온다는 뜻이에요! 한국어의 '비가 억수같이 온다'와 비슷해요.",
      en: "This classic idiom means 'it's raining very heavily.' Origin uncertain — one theory involves animals sliding off old thatched roofs!",
      es: "Este modismo clásico significa 'llueve muchísimo.' El origen es incierto — una teoría involucra animales en techos de paja!",
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
    },
    content: {
      ko: "'케이크 한 조각'이 아니라 '아주 쉬운 일'이라는 뜻이에요. 'The test was a piece of cake!'는 시험이 정말 쉬웠다는 뜻이에요.",
      en: "This means 'very easy.' 'The test was a piece of cake!' means the test was really easy. Similar to 'easy as pie' or 'a breeze.'",
      es: "Significa 'muy fácil.' 'The test was a piece of cake!' significa que el examen fue facilísimo. Similar a 'pan comido.'",
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
    },
    content: {
      ko: "스페인에서는 오후 2-5시에 가게가 문을 닫고 낮잠을 자는 전통이 있어요. 대도시에서는 줄었지만 작은 마을에서는 아직 흔해요.",
      en: "In Spain, shops traditionally close from 2-5 PM for siesta. Less common in big cities now, but still alive in small towns.",
      es: "En España, las tiendas cierran de 2 a 5 PM para la siesta. Menos común en grandes ciudades, pero aún vive en pueblos pequeños.",
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
    },
    content: {
      ko: "스페인에서는 점심을 오후 2-3시, 저녁은 밤 9-10시에 먹어요! 저녁 7시에 레스토랑에 가면 아직 문을 안 열었을 수도 있어요.",
      en: "In Spain, lunch is at 2-3 PM and dinner at 9-10 PM! If you go to a restaurant at 7 PM, it might not even be open yet.",
      es: "En España, el almuerzo es a las 2-3 PM y la cena a las 9-10 PM. Si vas a un restaurante a las 7 PM, puede que no esté abierto.",
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
    },
    content: {
      ko: "타파스는 작은 접시 음식으로 친구들과 나눠 먹어요. 스페인 일부 지역에서는 음료를 시키면 타파스가 무료로 나와요!",
      en: "Tapas are small shared dishes enjoyed with friends. In some parts of Spain, you get free tapas with every drink you order!",
      es: "Las tapas son platos pequeños que se comparten. En algunas zonas de España, te dan tapas gratis con cada bebida que pides!",
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
    },
    content: {
      ko: "'Tú'는 반말, 'usted'는 존댓말이에요. 스페인에서는 젊은 사람들끼리 거의 tú를 써요. 하지만 어르신이나 공식 상황에서는 usted를 쓰세요!",
      en: "'Tú' is informal, 'usted' is formal. In Spain, young people almost always use tú. But use usted with elders or in formal settings!",
      es: "'Tú' es informal, 'usted' es formal. En España los jóvenes casi siempre usan tú. Pero usa usted con mayores o en situaciones formales!",
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
    },
    content: {
      ko: "11월 1-2일에 돌아가신 분들을 기리는 축제예요. 슬픈 날이 아니라 즐거운 축하! 해골 분장과 마리골드 꽃 제단이 특징이에요.",
      en: "On Nov 1-2, Mexicans celebrate deceased loved ones. It's joyful, not somber! Features skull makeup, marigold altars, and favorite foods of the dead.",
      es: "El 1-2 de noviembre se honra a los seres queridos fallecidos. ¡Es alegre! Se usan calaveras, altares de cempasúchil y comida favorita.",
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
    },
    content: {
      ko: "진짜 멕시코 타코는 부드러운 옥수수 또르띠야에 고기, 양파, 고수, 살사를 올려요. 딱딱한 껍질(hard shell) 타코는 미국식이에요!",
      en: "Authentic Mexican tacos use soft corn tortillas with meat, onion, cilantro, and salsa. Hard shell tacos are an American invention!",
      es: "Los tacos auténticos usan tortilla de maíz suave con carne, cebolla, cilantro y salsa. ¡Los tacos de cáscara dura son invento gringo!",
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
    },
    content: {
      ko: "루차 리브레는 화려한 마스크를 쓴 프로레슬링이에요. 마스크를 벗기는 것은 최대 모욕! 문화 아이콘이자 국민 스포츠예요.",
      en: "Lucha libre is pro wrestling with colorful masks. Unmasking a luchador is the ultimate humiliation! It's a cultural icon and national passion.",
      es: "La lucha libre es lucha profesional con máscaras coloridas. ¡Desenmascarar a un luchador es la humillación máxima! Es un ícono cultural.",
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
    },
    content: {
      ko: "콜롬비아는 세계 3위 커피 생산국이에요. 'Tinto'는 작은 잔의 블랙커피로, 매우 저렴하고 하루에 여러 잔 마셔요.",
      en: "Colombia is the world's 3rd largest coffee producer. 'Tinto' is a small black coffee — very cheap, and people drink several cups daily.",
      es: "Colombia es el 3er productor de café del mundo. El 'tinto' es un café negro pequeño — muy barato, y la gente toma varios al día.",
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
    },
    content: {
      ko: "칼리(Cali)는 세계 살사의 수도예요! 콜롬비아에서는 파티에서 춤을 추는 것이 당연하고, 모르면 가르쳐 줄 거예요.",
      en: "Cali is the world capital of salsa! In Colombia, dancing at parties is expected — if you don't know how, they'll gladly teach you.",
      es: "¡Cali es la capital mundial de la salsa! En Colombia, bailar en fiestas es lo normal — si no sabes, con gusto te enseñan.",
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
    },
    content: {
      ko: "마테는 아르헨티나의 국민 음료예요. 한 잔을 돌려 마시며, 'Gracias'라고 하면 '더 이상 안 마실게요'라는 뜻이에요!",
      en: "Mate is Argentina's national drink, shared from one cup. Saying 'Gracias' when passed the mate means 'I'm done, no more for me!'",
      es: "El mate es la bebida nacional, se comparte de un solo recipiente. Decir 'Gracias' al recibirlo significa '¡ya no quiero más!'",
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
    },
    content: {
      ko: "아사도는 아르헨티나식 바비큐로 사교 행사예요. 일요일에 가족과 함께하고, 아사도르(굽는 사람)는 존경받는 역할이에요.",
      en: "Asado is Argentine BBQ and a social ritual. Families gather on Sundays, and the asador (grill master) holds an honored role.",
      es: "El asado es un ritual social argentino. Las familias se reúnen los domingos, y el asador tiene un rol de honor.",
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
    },
    content: {
      ko: "아르헨티나에서는 'tú'대신 'vos'를 써요. 'Tú tienes' 대신 'Vos tenés'라고 해요. 동사 활용이 달라지니 주의하세요!",
      en: "In Argentina, 'vos' replaces 'tú.' Instead of 'Tú tienes,' they say 'Vos tenés.' The verb conjugation changes — watch out!",
      es: "En Argentina, 'vos' reemplaza a 'tú.' En vez de 'Tú tienes,' dicen 'Vos tenés.' ¡La conjugación cambia — ten cuidado!",
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
    },
    content: {
      ko: "스페인에서는 '너희들'을 'vosotros'라고 하지만, 라틴 아메리카 전체에서는 'ustedes'만 써요. 교재에 따라 배우는 형태가 달라요!",
      en: "Spain uses 'vosotros' for informal 'you all,' but all of Latin America uses 'ustedes' only. Your textbook style depends on the region!",
      es: "España usa 'vosotros' para el plural informal, pero en toda Latinoamérica solo se usa 'ustedes.' ¡Depende de qué variante aprendas!",
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
    },
    content: {
      ko: "스페인에서 'z'와 'ce/ci'는 영어 'th'처럼 발음해요 (ceceo). 라틴 아메리카에서는 's'로 발음해요 (seseo). 'Gracias'가 달라요!",
      en: "In Spain, 'z' and 'ce/ci' sound like English 'th' (ceceo). In Latin America, they sound like 's' (seseo). 'Gracias' sounds different!",
      es: "En España, 'z' y 'ce/ci' suenan como 'th' inglesa (ceceo). En Latinoamérica, suenan como 's' (seseo). '¡Gracias' suena diferente!",
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
    },
    content: {
      ko: "자동차: coche(스페인), carro(멕시코), auto(아르헨). 컴퓨터: ordenador(스페인), computadora(라틴). 같은 스페인어인데 단어가 달라요!",
      en: "Car: coche(Spain), carro(Mexico), auto(Argentina). Computer: ordenador(Spain), computadora(Latin America). Same language, different words!",
      es: "Coche(España), carro(México), auto(Argentina). Ordenador(España), computadora(Latinoamérica). ¡Mismo idioma, distintas palabras!",
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
    },
    content: {
      ko: "'구름 위에 있다'는 멍하게 딴 생각하는 것을 뜻해요. 수업 중에 이러면 선생님이 '¡Baja de las nubes!' (구름에서 내려와!)라고 해요.",
      en: "'Being in the clouds' means daydreaming or zoning out. If distracted in class, a teacher might say '¡Baja de las nubes!' (Come down from the clouds!)",
      es: "Significa estar distraído o soñando despierto. Si estás distraído, el profe dirá '¡Baja de las nubes!'",
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
    },
    content: {
      ko: "'혀에 털이 없다'는 할 말을 거침없이 하는 것을 뜻해요. 영어의 'to not mince words'와 비슷해요. 직설적인 사람에게 써요.",
      en: "'Having no hairs on one's tongue' means speaking very directly. Similar to 'not mincing words.' Used for blunt, outspoken people.",
      es: "Significa hablar sin rodeos ni filtros. Se usa para personas muy directas y francas que dicen lo que piensan sin miedo.",
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
    },
    content: {
      ko: "'먹힌 빵'이라는 뜻으로, 아주 쉬운 일을 말해요. 영어의 'Piece of cake'와 같은 표현이에요! 'El examen fue pan comido.'",
      en: "Literally 'to be eaten bread,' it means 'very easy' — like 'piece of cake' in English! 'El examen fue pan comido' = The exam was a breeze.",
      es: "Significa que algo es muy fácil. '¡El examen fue pan comido!' Equivale al inglés 'piece of cake.' Se usa en situaciones informales.",
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
    },
    content: {
      ko: "한국어에는 7개 존댓말 단계가 있어요. 일상에서는 해요체(일반), 합쇼체(격식), 반말(친구) 3개만 알면 돼요. 처음 만난 사람에게 반말하면 큰 실례!",
      en: "Korean has 7 speech levels. You need 3: 해요체 (polite), 합쇼체 (formal), 반말 (casual). Using 반말 with a stranger is very rude!",
      es: "El coreano tiene 7 niveles de cortesía. Necesitas 3: 해요체 (cortés), 합쇼체 (formal), 반말 (casual). ¡Usar 반말 con desconocidos es grosero!",
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
    },
    content: {
      ko: "'빨리빨리'는 한국의 대표 문화예요. 배달 30분, 세계 최고 인터넷 속도, 카페에서 30초 만에 커피가 나와요!",
      en: "Korea's 빨리빨리 culture means everything is fast: delivery in 30 min, world's fastest internet, and coffee ready in 30 seconds!",
      es: "La cultura 빨리빨리 de Corea significa rapidez: entrega en 30 min, internet más rápido del mundo, ¡café listo en 30 segundos!",
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
    },
    content: {
      ko: "한국에서는 만나면 나이를 먼저 물어봐요. 나이에 따라 형/오빠/누나/언니 등 호칭과 말투가 달라져요. 1살 차이도 중요해요!",
      en: "In Korea, people ask your age early on. It determines titles (형/오빠/누나/언니) and speech level. Even a 1-year gap matters!",
      es: "En Corea, preguntan tu edad pronto. Determina títulos (형/오빠/누나/언니) y nivel de habla. ¡Hasta 1 año de diferencia importa!",
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
    },
    content: {
      ko: "윗사람 앞에서 술을 마실 때는 고개를 돌려서 마셔요. 두 손으로 잔을 받고, 상대 잔이 비면 채워주는 것이 예의예요.",
      en: "When drinking with elders, turn your head away while sipping. Receive glasses with both hands, and refill others' empty glasses!",
      es: "Al beber con mayores, gira la cabeza. Recibe vasos con ambas manos y rellena los vasos vacíos de los demás. ¡Es cortesía!",
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
    },
    content: {
      ko: "어른이 먼저 수저를 드신 후 식사를 시작하세요. 밥그릇을 들고 먹지 않아요. 젓가락을 밥에 꽂지 마세요 — 제사 때만 해요!",
      en: "Wait for the eldest to start eating. Don't lift your bowl (unlike Japan!). Never stick chopsticks in rice — that's for memorial rites only!",
      es: "Espera a que el mayor empiece. No levantes el tazón (¡a diferencia de Japón!). Nunca claves palillos en el arroz — ¡es para rituales!",
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
    },
    content: {
      ko: "'눈치'는 상대방의 기분이나 상황을 빠르게 파악하는 능력이에요. '눈치가 빠르다'는 센스 있다는 뜻, '눈치가 없다'는 공기를 못 읽는다는 뜻이에요.",
      en: "'눈치' is the ability to read others' moods. Good 눈치 means you're perceptive. No 눈치 means you're socially oblivious. A key Korean concept!",
      es: "'눈치' es la habilidad de percibir el ánimo de otros. Buen 눈치 = perceptivo. Sin 눈치 = despistado socialmente. ¡Concepto clave coreano!",
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
    },
    content: {
      ko: "선물을 두 손으로 주고받아요. 받은 즉시 열지 않는 것이 예의예요. 빨간색으로 이름을 쓰면 안 돼요 — 돌아가신 분 이름만 빨간색으로 써요!",
      en: "Give and receive gifts with both hands. Don't open them immediately. Never write names in red ink — it's reserved for the deceased!",
      es: "Da y recibe regalos con ambas manos. No los abras de inmediato. ¡Nunca escribas nombres en rojo — se reserva para los fallecidos!",
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
    },
    content: {
      ko: "'화이팅'은 영어 'fighting'에서 왔지만 '힘내!', '잘 할 수 있어!'라는 응원이에요. 시험 전, 운동 경기, 힘든 하루에 써요!",
      en: "'Hwaiting' comes from 'fighting' but means 'You can do it!' Used before exams, sports, or any challenge. Always with a fist pump!",
      es: "'Hwaiting' viene de 'fighting' pero significa '¡Tú puedes!' Se usa antes de exámenes, deportes o retos. ¡Siempre con el puño arriba!",
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
    },
    content: {
      ko: "찜질방은 한국식 대중목욕탕 + 사우나예요. 양머리 수건을 만들고, 식혜와 계란을 먹으며 밤새 놀 수 있어요!",
      en: "Jjimjilbang is a Korean spa/sauna. You make sheep-head towels, eat sikhye (sweet rice drink) and eggs, and can stay overnight!",
      es: "El jjimjilbang es un spa/sauna coreano. Haces toallas de oveja, comes sikhye (bebida de arroz) y huevos, ¡y puedes quedarte toda la noche!",
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
    },
    content: {
      ko: "한국어에는 고유어 숫자(하나, 둘, 셋)와 한자어 숫자(일, 이, 삼)가 있어요. 나이는 고유어, 전화번호는 한자어를 써요!",
      en: "Korean has native numbers (하나, 둘, 셋) and Sino-Korean (일, 이, 삼). Age uses native, phone numbers use Sino-Korean. You need both!",
      es: "El coreano tiene números nativos (하나, 둘, 셋) y sino-coreanos (일, 이, 삼). La edad usa nativos, los teléfonos sino-coreanos. ¡Necesitas ambos!",
    },
  },
];

/** Get today's cultural note for a specific learning language (cycles daily) */
export function getTodayNote(learningLang: "ko" | "en" | "es"): CulturalNote {
  const filtered = getNotesForLanguage(learningLang);
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return filtered[dayOfYear % filtered.length];
}

/** Get notes for a specific learning language */
export function getNotesForLanguage(lang: "ko" | "en" | "es"): CulturalNote[] {
  return CULTURAL_NOTES.filter((n) => n.language === lang);
}
