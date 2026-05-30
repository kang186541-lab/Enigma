export interface Achievement {
  id: string;
  name: { ko: string; en: string; es: string; id: string };
  description: { ko: string; en: string; es: string; id: string };
  icon: string;
  category: "learning" | "social" | "mastery";
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── Learning ──
  {
    id: "first_lesson",
    name: { ko: "첫 발자국", en: "First Steps", es: "Primeros Pasos", id: "Langkah Pertama" },
    description: { ko: "첫 레슨을 완료했어요!", en: "Completed your first lesson!", es: "Completaste tu primera leccion!", id: "Menyelesaikan pelajaran pertamamu!" },
    icon: "👣",
    category: "learning",
    xpReward: 10,
  },
  {
    id: "streak_7",
    name: { ko: "일주일 전사", en: "Week Warrior", es: "Guerrero Semanal", id: "Pejuang Seminggu" },
    description: { ko: "7일 연속 학습!", en: "7-day study streak!", es: "Racha de 7 dias!", id: "Beruntun belajar 7 hari!" },
    icon: "🔥",
    category: "learning",
    xpReward: 25,
  },
  {
    id: "streak_30",
    name: { ko: "한 달의 맹세", en: "Monthly Oath", es: "Juramento Mensual", id: "Sumpah Sebulan" },
    description: { ko: "30일 연속 학습!", en: "30-day study streak!", es: "Racha de 30 dias!", id: "Beruntun belajar 30 hari!" },
    icon: "⚔️",
    category: "learning",
    xpReward: 100,
  },
  {
    id: "words_50",
    name: { ko: "단어 수집가", en: "Word Collector", es: "Coleccionista", id: "Pengumpul Kata" },
    description: { ko: "50개 단어를 배웠어요!", en: "Learned 50 words!", es: "Aprendiste 50 palabras!", id: "Belajar 50 kata!" },
    icon: "📚",
    category: "learning",
    xpReward: 20,
  },
  {
    id: "words_100",
    name: { ko: "어휘의 달인", en: "Vocab Master", es: "Maestro del Vocab", id: "Master Kosakata" },
    description: { ko: "100개 단어를 배웠어요!", en: "Learned 100 words!", es: "Aprendiste 100 palabras!", id: "Belajar 100 kata!" },
    icon: "🏆",
    category: "learning",
    xpReward: 50,
  },
  {
    id: "words_300",
    name: { ko: "살아있는 사전", en: "Walking Dictionary", es: "Diccionario Viviente", id: "Kamus Berjalan" },
    description: { ko: "300개 단어를 배웠어요!", en: "Learned 300 words!", es: "Aprendiste 300 palabras!", id: "Belajar 300 kata!" },
    icon: "📖",
    category: "learning",
    xpReward: 100,
  },
  {
    id: "srs_master",
    name: { ko: "복습의 왕", en: "Review King", es: "Rey del Repaso", id: "Raja Ulasan" },
    description: { ko: "SRS 카드 50장을 마스터!", en: "Mastered 50 SRS cards!", es: "Dominaste 50 tarjetas SRS!", id: "Menguasai 50 kartu SRS!" },
    icon: "🃏",
    category: "learning",
    xpReward: 30,
  },
  {
    id: "level_3",
    name: { ko: "중급 진입", en: "Intermediate", es: "Intermedio", id: "Tingkat Menengah" },
    description: { ko: "레벨 3 달성!", en: "Reached level 3!", es: "Alcanzaste nivel 3!", id: "Mencapai level 3!" },
    icon: "⭐",
    category: "learning",
    xpReward: 30,
  },
  {
    id: "level_5",
    name: { ko: "마스터 등극", en: "Grand Master", es: "Gran Maestro", id: "Grand Master" },
    description: { ko: "최고 레벨 달성!", en: "Reached max level!", es: "Alcanzaste el nivel maximo!", id: "Mencapai level tertinggi!" },
    icon: "👑",
    category: "learning",
    xpReward: 200,
  },
  // ── Social ──
  {
    id: "first_npc",
    name: { ko: "첫 만남", en: "First Encounter", es: "Primer Encuentro", id: "Pertemuan Pertama" },
    description: { ko: "첫 NPC 미션 완료!", en: "Completed first NPC mission!", es: "Completaste la primera mision NPC!", id: "Menyelesaikan misi NPC pertama!" },
    icon: "🤝",
    category: "social",
    xpReward: 15,
  },
  {
    id: "npc_5",
    name: { ko: "인싸", en: "Social Butterfly", es: "Mariposa Social", id: "Kupu-Kupu Sosial" },
    description: { ko: "5명의 NPC와 대화!", en: "Chatted with 5 NPCs!", es: "Charlaste con 5 NPCs!", id: "Mengobrol dengan 5 NPC!" },
    icon: "🦋",
    category: "social",
    xpReward: 30,
  },
  {
    id: "npc_all",
    name: { ko: "모든 인연", en: "Everyone's Friend", es: "Amigo de Todos", id: "Teman Semua Orang" },
    description: { ko: "모든 NPC를 만났어요!", en: "Met every NPC!", es: "Conociste a todos los NPCs!", id: "Bertemu semua NPC!" },
    icon: "🌟",
    category: "social",
    xpReward: 100,
  },
  {
    id: "chat_50",
    name: { ko: "수다쟁이", en: "Chatterbox", es: "Charlatán", id: "Si Cerewet" },
    description: { ko: "채팅 50회!", en: "50 chat messages!", es: "50 mensajes de chat!", id: "50 pesan obrolan!" },
    icon: "💬",
    category: "social",
    xpReward: 20,
  },
  {
    id: "first_story",
    name: { ko: "모험의 시작", en: "Adventure Begins", es: "La Aventura Comienza", id: "Petualangan Dimulai" },
    description: { ko: "첫 스토리 챕터 완료!", en: "Completed first story chapter!", es: "Completaste el primer capitulo!", id: "Menyelesaikan bab cerita pertama!" },
    icon: "📜",
    category: "social",
    xpReward: 25,
  },
  // ── Mastery ──
  {
    id: "perfect_pron",
    name: { ko: "완벽한 발음", en: "Perfect Pronunciation", es: "Pronunciacion Perfecta", id: "Pelafalan Sempurna" },
    description: { ko: "발음 평가 90점 이상!", en: "Pronunciation score 90+!", es: "Puntuacion de pronunciacion 90+!", id: "Nilai pelafalan 90+!" },
    icon: "🎯",
    category: "mastery",
    xpReward: 30,
  },
  {
    id: "speed_demon",
    name: { ko: "스피드 데몬", en: "Speed Demon", es: "Demonio Veloz", id: "Setan Kecepatan" },
    description: { ko: "레슨 5분 이내 완료!", en: "Completed a lesson in under 5 min!", es: "Completaste una leccion en menos de 5 min!", id: "Menyelesaikan pelajaran di bawah 5 menit!" },
    icon: "⚡",
    category: "mastery",
    xpReward: 20,
  },
  {
    id: "night_owl",
    name: { ko: "올빼미", en: "Night Owl", es: "Buho Nocturno", id: "Burung Hantu Malam" },
    description: { ko: "밤 11시 이후에 학습!", en: "Studied after 11 PM!", es: "Estudiaste despues de las 11 PM!", id: "Belajar setelah jam 11 malam!" },
    icon: "🦉",
    category: "mastery",
    xpReward: 10,
  },
  {
    id: "early_bird",
    name: { ko: "아침형 인간", en: "Early Bird", es: "Madrugador", id: "Si Rajin Pagi" },
    description: { ko: "오전 6시 이전에 학습!", en: "Studied before 6 AM!", es: "Estudiaste antes de las 6 AM!", id: "Belajar sebelum jam 6 pagi!" },
    icon: "🐦",
    category: "mastery",
    xpReward: 10,
  },
  {
    id: "xp_1000",
    name: { ko: "천의 경험", en: "Thousand XP", es: "Mil XP", id: "Seribu XP" },
    description: { ko: "총 1000 XP 달성!", en: "Earned 1000 total XP!", es: "Ganaste 1000 XP en total!", id: "Mendapat total 1000 XP!" },
    icon: "💎",
    category: "mastery",
    xpReward: 50,
  },
  {
    id: "writing_first",
    name: { ko: "첫 필기", en: "First Pen Stroke", es: "Primer Trazo", id: "Goresan Pertama" },
    description: { ko: "첫 쓰기 연습 완료!", en: "Completed first writing practice!", es: "Completaste la primera practica de escritura!", id: "Menyelesaikan latihan menulis pertama!" },
    icon: "✍️",
    category: "mastery",
    xpReward: 15,
  },
];

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
