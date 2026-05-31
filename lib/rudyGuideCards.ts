import type { NativeLanguage } from "@/context/LanguageContext";

export type RudyGuideCard = {
  emoji: string;
  title: Record<NativeLanguage, string>;
  body: Record<NativeLanguage, string>;
};

export const RUDY_GUIDE_CARDS: RudyGuideCard[] = [
  {
    emoji: "🏊",
    title: {
      korean: "언어는 공부가 아니야",
      english: "Language isn't studying",
      spanish: "El idioma no se estudia",
      indonesian: "Bahasa itu bukan dipelajari",
    },
    body: {
      korean: "언어는 공부하는 게 아니라 습득하는 거야.\n수영처럼, 직접 해봐야 배울 수 있어.",
      english: "Language is acquired, not studied.\nLike swimming, you learn by doing.",
      spanish: "El idioma se adquiere, no se estudia.\nComo nadar, aprendes haciéndolo.",
      indonesian: "Bahasa itu diperoleh, bukan dipelajari.\nSeperti berenang, kamu belajar sambil melakukannya.",
    },
  },
  {
    emoji: "🔥",
    title: {
      korean: "불편해져야 배울 수 있어",
      english: "Get uncomfortable to learn",
      spanish: "Incómodate para aprender",
      indonesian: "Belajarlah dengan keluar dari zona nyaman",
    },
    body: {
      korean: "휴대폰 언어를 바꿔봐.\n불편한 게 바로 배우고 있다는 증거야.",
      english: "Change your phone language.\nBeing uncomfortable = learning.",
      spanish: "Cambia el idioma de tu teléfono.\nLa incomodidad = aprendizaje.",
      indonesian: "Coba ganti bahasa di ponselmu.\nRasa tidak nyaman = tanda kamu sedang belajar.",
    },
  },
  {
    emoji: "⏰",
    title: {
      korean: "하루 10분이면 충분해",
      english: "10 minutes a day is enough",
      spanish: "10 minutos al día bastan",
      indonesian: "10 menit sehari sudah cukup",
    },
    body: {
      korean: "매일 10분이 일주일에 한 번 3시간보다 낫다.\n짧게, 자주, 꾸준히.",
      english: "10 minutes daily beats 3 hours once a week.\nShort, frequent, consistent.",
      spanish: "10 minutos diarios superan 3 horas una vez.\nCorto, frecuente, constante.",
      indonesian: "10 menit setiap hari lebih baik daripada 3 jam seminggu sekali.\nSingkat, sering, konsisten.",
    },
  },
  {
    emoji: "💬",
    title: {
      korean: "틀려도 일단 말해!",
      english: "Say it, even if it's wrong!",
      spanish: "¡Dilo, aunque esté mal!",
      indonesian: "Ucapkan saja, walaupun salah!",
    },
    body: {
      korean: "머릿속으로 완벽한 문장을 만들지 마.\n틀려도 말해, 나중에 고쳐.\n말하지 않은 단어는 절대 네 것이 안 돼.",
      english: "Don't build perfect sentences in your head.\nSay it wrong, fix it later.\nWords you don't speak are never yours.",
      spanish: "No construyas oraciones perfectas en tu mente.\nDilo mal, corrígelo después.\nLas palabras que no dices nunca serán tuyas.",
      indonesian: "Jangan menyusun kalimat sempurna di kepalamu.\nUcapkan walau salah, perbaiki nanti.\nKata yang tidak kamu ucapkan tidak akan pernah jadi milikmu.",
    },
  },
  {
    emoji: "🎯",
    title: {
      korean: "네가 쓸 말부터 배워",
      english: "Learn what YOU actually say",
      spanish: "Aprende lo que TÚ dices",
      indonesian: "Pelajari dulu kata yang KAMU pakai",
    },
    body: {
      korean: "친구들이랑 무슨 얘기하는지 생각해봐.\n\"어제 맛있는 거 먹었어\"가\n\"이것은 사과입니다\"보다 100배 유용해.",
      english: "Think about what you talk about with friends.\n\"I ate something amazing yesterday\" is\n100x more useful than \"This is an apple.\"",
      spanish: "Piensa en qué hablas con tus amigos.\n\"Ayer comí algo increíble\" es\n100 veces más útil que \"Esto es una manzana.\"",
      indonesian: "Pikirkan apa yang biasa kamu bicarakan dengan teman.\n\"Kemarin aku makan sesuatu yang enak banget\"\n100 kali lebih berguna daripada \"Ini adalah apel.\"",
    },
  },
  {
    emoji: "🎧",
    title: {
      korean: "좋아하는 걸로 배워봐",
      english: "Learn with what you love",
      spanish: "Aprende con lo que amas",
      indonesian: "Belajar lewat hal yang kamu suka",
    },
    body: {
      korean: "덕질이 최고의 공부법이야.\n좋아하는 가수, 드라마, 게임을\n배우는 언어로 즐겨봐.",
      english: "Fan culture is the best study method.\nFind your favorite singer, drama, or game\nin the target language.",
      spanish: "La cultura fan es el mejor método.\nEncuentra tu cantante, drama o juego favorito\nen el idioma que aprendes.",
      indonesian: "Jadi penggemar adalah cara belajar terbaik.\nNikmati penyanyi, drama, atau game favoritmu\ndalam bahasa yang kamu pelajari.",
    },
  },
  {
    emoji: "🔄",
    title: {
      korean: "습관을 만들어봐",
      english: "Build habits, not study sessions",
      spanish: "Crea hábitos, no sesiones de estudio",
      indonesian: "Bangun kebiasaan, bukan sesi belajar",
    },
    body: {
      korean: "팟캐스트 듣기, 외국 계정 팔로우,\n혼잣말하기. 공부한다고 생각하지 마.",
      english: "Listen to podcasts, follow foreign accounts,\ntalk to yourself in the language.\nDon't think of it as studying.",
      spanish: "Escucha podcasts, sigue cuentas extranjeras,\nhabla contigo mismo en el idioma.\nNo lo pienses como estudiar.",
      indonesian: "Dengarkan podcast, ikuti akun luar negeri,\nbicara sendiri dalam bahasa itu.\nJangan anggap ini sebagai belajar.",
    },
  },
  // ── 앱 활용 팁 ──
  {
    emoji: "🔤",
    title: {
      korean: "처음이라면 기초 과정부터",
      english: "New? Start with the Basics",
      spanish: "¿Nuevo? Empieza con lo básico",
      indonesian: "Baru mulai? Awali dari Dasar",
    },
    body: {
      korean: "알파벳과 기본 인사를 먼저 익히면\n다음 학습이 훨씬 수월해져.\n기초 과정은 딱 10분이면 끝나.",
      english: "Learn the alphabet and basic greetings first.\nEverything after becomes much easier.\nThe basic course takes just 10 minutes.",
      spanish: "Aprende el alfabeto y saludos básicos primero.\nTodo después será mucho más fácil.\nEl curso básico toma solo 10 minutos.",
      indonesian: "Pelajari dulu alfabet dan sapaan dasar.\nSemua setelahnya jadi jauh lebih mudah.\nKursus dasar cuma butuh 10 menit.",
    },
  },
  {
    emoji: "📚",
    title: {
      korean: "루디의 훈련소가 핵심이야",
      english: "Rudy's Camp is your core",
      spanish: "El Campo de Rudy es tu base",
      indonesian: "Camp Rudy adalah intinya",
    },
    body: {
      korean: "매일 듣기, 말하기, 퀴즈, 미션 대화까지.\n30일이면 자기소개부터 일상 대화까지 가능해.\n하루 한 레슨, 꾸준히 하는 게 비결이야.",
      english: "Listening, speaking, quizzes, and mission talks daily.\nIn 30 days you'll go from hello to real conversations.\nOne lesson a day — consistency is the secret.",
      spanish: "Escucha, habla, cuestionarios y misiones a diario.\nEn 30 días irás de hola a conversaciones reales.\nUna lección al día — la constancia es el secreto.",
      indonesian: "Menyimak, berbicara, kuis, dan percakapan misi setiap hari.\nDalam 30 hari kamu berkembang dari sapaan ke percakapan nyata.\nSatu pelajaran sehari — konsistensi adalah kuncinya.",
    },
  },
  {
    emoji: "🕵️",
    title: {
      korean: "훈련소 후 스토리 모드 도전",
      english: "Then try Story Mode",
      spanish: "Luego prueba el Modo Historia",
      indonesian: "Lalu coba Mode Cerita",
    },
    body: {
      korean: "훈련소에서 배운 표현이 스토리 퀴즈에 나와.\n배운 걸 탐정 모험에서 직접 써보면\n기억에 훨씬 오래 남아.",
      english: "Phrases from camp appear in story quizzes.\nUsing what you learned in a detective adventure\nmakes it stick much longer.",
      spanish: "Las frases del campo aparecen en los cuestionarios.\nUsar lo aprendido en una aventura detectivesca\nhace que se quede en tu memoria.",
      indonesian: "Ungkapan dari camp muncul di kuis cerita.\nMemakai yang kamu pelajari dalam petualangan detektif\nmembuatnya melekat jauh lebih lama.",
    },
  },
  {
    emoji: "☕",
    title: {
      korean: "NPC와 실전 연습해봐",
      english: "Practice with NPCs",
      spanish: "Practica con los NPCs",
      indonesian: "Latihan langsung dengan NPC",
    },
    body: {
      korean: "카페 주문, 호텔 체크인, 택시 타기...\n10명의 NPC와 진짜 상황에서 대화해봐.\n훈련소에서 배운 표현을 바로 써먹을 수 있어.",
      english: "Ordering coffee, hotel check-in, taking a taxi...\nChat with 10 NPCs in real scenarios.\nPut your camp phrases to immediate use.",
      spanish: "Pedir café, registro en hotel, tomar un taxi...\nHabla con 10 NPCs en escenarios reales.\nUsa las frases del campo de inmediato.",
      indonesian: "Memesan kopi, check-in hotel, naik taksi...\nNgobrol dengan 10 NPC dalam situasi nyata.\nLangsung pakai ungkapan yang kamu pelajari di camp.",
    },
  },
  {
    emoji: "🤖",
    title: {
      korean: "AI 튜터와 자유롭게 대화",
      english: "Chat freely with AI tutors",
      spanish: "Habla libremente con tutores IA",
      indonesian: "Ngobrol bebas dengan tutor AI",
    },
    body: {
      korean: "정해진 주제 없이 자유롭게 대화할 수 있어.\n틀려도 괜찮아, 튜터가 자연스럽게 교정해줘.\n말하기 자신감을 키우기에 딱이야.",
      english: "Have open conversations on any topic.\nMistakes are fine — tutors correct you naturally.\nPerfect for building speaking confidence.",
      spanish: "Conversa libremente sobre cualquier tema.\nLos errores están bien — los tutores te corrigen.\nPerfecto para ganar confianza al hablar.",
      indonesian: "Ngobrol bebas tentang topik apa pun.\nSalah itu wajar — tutor mengoreksimu dengan alami.\nPas banget untuk menumbuhkan percaya diri berbicara.",
    },
  },
  {
    emoji: "🦊",
    title: {
      korean: "자, 이제 시작하자!",
      english: "Alright, let's go!",
      spanish: "¡Bien, vamos!",
      indonesian: "Oke, ayo mulai!",
    },
    body: {
      korean: "준비됐지, 파트너?\n루디가 옆에서 도와줄게. 같이 가자!",
      english: "Ready, partner?\nRudy's right here with you. Let's do this!",
      spanish: "¿Listo, compañero?\nRudy está aquí contigo. ¡Hagámoslo!",
      indonesian: "Siap, partner?\nRudy ada di sini menemanimu. Ayo kita lakukan!",
    },
  },
];
