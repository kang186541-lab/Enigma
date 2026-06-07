export interface GrammarTip {
  id: string;
  /** The TARGET language this tip teaches (not the UI/native language). */
  language: "ko" | "es" | "id" | "ar";
  day?: number;
  unit?: number;
  pattern: { ko: string; en: string; es: string; id: string };
  examples: Array<{ ko: string; en: string; es: string; id: string }>;
  mistakes?: Array<{ ko: string; en: string; es: string; id: string }>;
  rudyTip?: { ko: string; en: string; es: string; id: string };
}

export const GRAMMAR_TIPS: GrammarTip[] = [
  // ── Unit 1: Greetings & Self-Introduction ──
  {
    id: "g1",
    language: "ko",
    day: 1,
    unit: 1,
    pattern: {
      ko: "저는 [이름]입니다 / 저는 [이름]이에요",
      en: "I am [name] — formal vs casual",
      es: "Yo soy [nombre] / Me llamo [nombre]",
      id: "저는 [nama]입니다 / 저는 [nama]이에요 — formal vs santai",
    },
    examples: [
      { ko: "저는 민수입니다. (격식)", en: "I am Minsoo. (formal)", es: "Yo soy Minsoo. (formal)", id: "Saya Minsoo. (formal)" },
      { ko: "나는 민수야. (반말)", en: "I'm Minsoo. (casual)", es: "Soy Minsoo. (informal)", id: "Aku Minsoo. (santai)" },
    ],
    mistakes: [
      { ko: "나는 민수입니다 ✗ (반말+격식 혼용)", en: "Mixing 나 with formal ending", es: "Mezclar 나 con final formal", id: "Mencampur 나 (santai) dengan akhiran formal" },
    ],
    rudyTip: {
      ko: "처음 만나는 사람에게는 항상 '저'를 쓰세요!",
      en: "Use '저' (formal I) when meeting someone for the first time!",
      es: "Usa '저' (yo formal) al conocer a alguien por primera vez!",
      id: "Pakai '저' (saya formal) waktu kamu pertama kali ketemu seseorang!",
    },
  },
  {
    id: "g2",
    language: "ko",
    day: 2,
    unit: 1,
    pattern: {
      ko: "[명사]은/는 — 주제 조사 (Topic Marker)",
      en: "Subject particle: 은 (after consonant) / 는 (after vowel)",
      es: "Particula de tema: 은 (tras consonante) / 는 (tras vocal)",
      id: "Partikel topik: 은 (sesudah konsonan) / 는 (sesudah vokal)",
    },
    examples: [
      { ko: "저는 학생입니다. (저 ends in vowel → 는)", en: "I am a student.", es: "Yo soy estudiante.", id: "Saya seorang pelajar." },
      { ko: "이것은 책입니다. (이것 ends in consonant → 은)", en: "This is a book.", es: "Esto es un libro.", id: "Ini sebuah buku." },
    ],
    rudyTip: {
      ko: "은/는은 '~에 대해 말하자면'이라는 뜻이에요. 새 주제를 시작할 때 써요!",
      en: "Think of 은/는 as 'speaking of...' — it marks what you're talking about!",
      es: "Piensa en 은/는 como 'hablando de...' — marca el tema de la conversacion!",
      id: "Anggap 은/는 seperti 'kalau soal...' — menandai hal yang sedang kamu bicarakan!",
    },
  },
  {
    id: "g3",
    language: "ko",
    day: 3,
    unit: 1,
    pattern: {
      ko: "이/가 — 주격 조사 (Subject Marker)",
      en: "Subject particle: 이 (after consonant) / 가 (after vowel)",
      es: "Particula de sujeto: 이 (consonante) / 가 (vocal)",
      id: "Partikel subjek: 이 (sesudah konsonan) / 가 (sesudah vokal)",
    },
    examples: [
      { ko: "날씨가 좋아요. (날씨 → 가)", en: "The weather is nice.", es: "El clima esta bien.", id: "Cuacanya bagus." },
      { ko: "학생이 왔어요. (학생 → 이)", en: "A student came.", es: "Un estudiante llego.", id: "Seorang pelajar datang." },
    ],
    mistakes: [
      { ko: "날씨은 좋아요 ✗ → 날씨가 좋아요 ✓", en: "Wrong particle after vowel", es: "Particula incorrecta tras vocal", id: "Partikel yang salah sesudah vokal" },
    ],
    rudyTip: {
      ko: "은/는은 이미 아는 정보, 이/가는 새로운 정보에 써요!",
      en: "Use 은/는 for known info, 이/가 for new info!",
      es: "Usa 은/는 para info conocida, 이/가 para info nueva!",
      id: "Pakai 은/는 untuk info yang sudah diketahui, 이/가 untuk info baru!",
    },
  },
  {
    id: "g4",
    language: "ko",
    day: 4,
    unit: 1,
    pattern: {
      ko: "[동사]아/어요 — 해요체 (Polite Present Tense)",
      en: "Polite present tense: stem + 아요/어요",
      es: "Presente cortés: raíz + 아요/어요",
      id: "Kala kini sopan: akar kata + 아요/어요",
    },
    examples: [
      { ko: "가다 → 가요 (ㅏ vowel → 아요)", en: "to go → go/goes", es: "ir → voy/va", id: "pergi → pergi" },
      { ko: "먹다 → 먹어요 (ㅓ vowel → 어요)", en: "to eat → eat/eats", es: "comer → como/come", id: "makan → makan" },
      { ko: "하다 → 해요 (special)", en: "to do → do/does", es: "hacer → hago/hace", id: "melakukan → melakukan" },
    ],
    rudyTip: {
      ko: "해요체는 일상에서 가장 많이 쓰는 존댓말이에요!",
      en: "해요체 is the most common polite speech level in daily Korean!",
      es: "해요체 es el nivel de cortesia mas comun en coreano diario!",
      id: "해요체 adalah tingkat bahasa sopan yang paling sering dipakai sehari-hari!",
    },
  },
  {
    id: "g5",
    language: "ko",
    day: 5,
    unit: 1,
    pattern: {
      ko: "안 [동사] / [동사]지 않다 — 부정문",
      en: "Negation: 안 + verb OR verb stem + 지 않다",
      es: "Negacion: 안 + verbo O raíz + 지 않다",
      id: "Negasi: 안 + kata kerja ATAU akar kata + 지 않다",
    },
    examples: [
      { ko: "안 먹어요 = 먹지 않아요 (I don't eat)", en: "Both mean the same", es: "Ambas significan lo mismo", id: "Keduanya sama artinya" },
      { ko: "안 좋아요 = 좋지 않아요 (It's not good)", en: "Short form vs long form", es: "Forma corta vs larga", id: "Bentuk pendek vs bentuk panjang" },
    ],
    rudyTip: {
      ko: "일상에서는 짧은 '안' 형태를 더 자주 써요!",
      en: "In casual speech, the short 안 form is more common!",
      es: "En habla casual, la forma corta con 안 es mas comun!",
      id: "Dalam percakapan santai, bentuk pendek '안' lebih sering dipakai!",
    },
  },
  // ── Unit 2: Basic Conversations ──
  {
    id: "g6",
    language: "ko",
    day: 7,
    unit: 2,
    pattern: {
      ko: "[명사]을/를 — 목적격 조사 (Object Marker)",
      en: "Object particle: 을 (after consonant) / 를 (after vowel)",
      es: "Particula de objeto: 을 (consonante) / 를 (vocal)",
      id: "Partikel objek: 을 (sesudah konsonan) / 를 (sesudah vokal)",
    },
    examples: [
      { ko: "밥을 먹어요. (밥 → 을)", en: "I eat rice.", es: "Como arroz.", id: "Aku makan nasi." },
      { ko: "커피를 마셔요. (커피 → 를)", en: "I drink coffee.", es: "Bebo cafe.", id: "Aku minum kopi." },
    ],
    rudyTip: {
      ko: "을/를은 동작의 대상을 나타내요. '뭐를 하다'의 '뭐'에 붙여요!",
      en: "을/를 marks what the action is done to — the direct object!",
      es: "을/를 marca a que se le hace la accion — el objeto directo!",
      id: "을/를 menandai sasaran tindakan — objek langsungnya!",
    },
  },
  {
    id: "g7",
    language: "ko",
    day: 8,
    unit: 2,
    pattern: {
      ko: "에서 — 장소에서 하는 행동",
      en: "에서 = at/in (for actions happening at a location)",
      es: "에서 = en (para acciones en un lugar)",
      id: "에서 = di (untuk kegiatan yang terjadi di suatu tempat)",
    },
    examples: [
      { ko: "도서관에서 공부해요.", en: "I study at the library.", es: "Estudio en la biblioteca.", id: "Aku belajar di perpustakaan." },
      { ko: "카페에서 커피를 마셔요.", en: "I drink coffee at the cafe.", es: "Bebo cafe en la cafeteria.", id: "Aku minum kopi di kafe." },
    ],
    mistakes: [
      { ko: "도서관에 공부해요 ✗ (에는 존재, 에서는 행동)", en: "에 = existence, 에서 = action", es: "에 = existencia, 에서 = accion", id: "에 = keberadaan, 에서 = kegiatan" },
    ],
    rudyTip: {
      ko: "에는 '~에 있다'처럼 존재할 때, 에서는 무언가를 할 때 써요!",
      en: "에 for 'being at', 에서 for 'doing at'!",
      es: "에 para 'estar en', 에서 para 'hacer en'!",
      id: "Pakai 에 untuk 'berada di', dan 에서 untuk 'melakukan sesuatu di'!",
    },
  },
  {
    id: "g8",
    language: "ko",
    day: 10,
    unit: 2,
    pattern: {
      ko: "[동사]고 싶다 — '~하고 싶다' (Want to)",
      en: "Verb stem + 고 싶다 = want to [verb]",
      es: "Raíz + 고 싶다 = querer [verbo]",
      id: "Akar kata + 고 싶다 = ingin [kata kerja]",
    },
    examples: [
      { ko: "먹고 싶어요. (I want to eat)", en: "I want to eat.", es: "Quiero comer.", id: "Aku ingin makan." },
      { ko: "한국에 가고 싶어요.", en: "I want to go to Korea.", es: "Quiero ir a Corea.", id: "Aku ingin pergi ke Korea." },
    ],
    rudyTip: {
      ko: "고 싶다 + 아/어요 = 고 싶어요! 가장 흔한 소원 표현이에요!",
      en: "고 싶다 is the easiest way to express desires in Korean!",
      es: "고 싶다 es la forma mas facil de expresar deseos en coreano!",
      id: "고 싶다 adalah cara paling gampang untuk menyatakan keinginan dalam bahasa Korea!",
    },
  },
  // ── Unit 3: Common Expressions ──
  {
    id: "g9",
    language: "ko",
    day: 13,
    unit: 3,
    pattern: {
      ko: "[동사]ㄹ/을 수 있다 — 가능 표현",
      en: "Verb stem + (으)ㄹ 수 있다 = can [verb]",
      es: "Raíz + (으)ㄹ 수 있다 = poder [verbo]",
      id: "Akar kata + (으)ㄹ 수 있다 = bisa [kata kerja]",
    },
    examples: [
      { ko: "한국어를 할 수 있어요.", en: "I can speak Korean.", es: "Puedo hablar coreano.", id: "Aku bisa berbahasa Korea." },
      { ko: "읽을 수 있어요.", en: "I can read it.", es: "Puedo leerlo.", id: "Aku bisa membacanya." },
    ],
    rudyTip: {
      ko: "수 없다로 바꾸면 '못 하다'가 돼요! 할 수 없어요 = 못 해요",
      en: "Switch 있다 to 없다 for 'cannot': 할 수 없어요 = 못 해요",
      es: "Cambia 있다 por 없다 para 'no poder': 할 수 없어요 = 못 해요",
      id: "Ganti 있다 jadi 없다 untuk 'tidak bisa': 할 수 없어요 = 못 해요",
    },
  },
  {
    id: "g10",
    language: "ko",
    day: 15,
    unit: 3,
    pattern: {
      ko: "[동사]았/었어요 — 과거형 (Past Tense)",
      en: "Past tense: stem + 았/었어요",
      es: "Pasado: raíz + 았/었어요",
      id: "Kala lampau: akar kata + 았/었어요",
    },
    examples: [
      { ko: "갔어요 (가다 → 갔어요)", en: "went", es: "fui", id: "pergi (sudah)" },
      { ko: "먹었어요 (먹다 → 먹었어요)", en: "ate", es: "comí", id: "makan (sudah)" },
      { ko: "했어요 (하다 → 했어요)", en: "did", es: "hice", id: "melakukan (sudah)" },
    ],
    rudyTip: {
      ko: "과거형은 현재형에서 요 앞에 ㅆ을 넣는 거예요! 가요 → 갔어요",
      en: "Past tense inserts ㅆ before 요! 가요 → 갔어요",
      es: "El pasado inserta ㅆ antes de 요! 가요 → 갔어요",
      id: "Kala lampau menyisipkan ㅆ sebelum 요! 가요 → 갔어요",
    },
  },

  // ════════════════════════════════════════════════════════════════
  // INDONESIAN (language: "id") — starter grammar tips
  // ════════════════════════════════════════════════════════════════
  {
    id: "id1",
    language: "id",
    unit: 1,
    pattern: {
      ko: "me- / ber- 동사 접두사 — 능동/상태 동사 만들기",
      en: "me- / ber- verb prefixes — forming active vs. stative verbs",
      es: "Prefijos verbales me- / ber- — verbos activos vs. de estado",
      id: "Awalan me- / ber- — membentuk kata kerja aktif (me-) dan kata kerja keadaan/intransitif (ber-)",
    },
    examples: [
      { ko: "makan → memakan / makan → bermakan? ✗ (먹다: 목적어가 있으면 me-)", en: "tulis → menulis (to write something); kerja → bekerja (to work)", es: "tulis → menulis (escribir algo); kerja → bekerja (trabajar)", id: "tulis → menulis (menulis sesuatu); kerja → bekerja (sedang bekerja)" },
      { ko: "Saya menulis surat. = 나는 편지를 쓴다 / Dia bekerja. = 그는 일한다", en: "Saya menulis surat = I write a letter; Dia bekerja = He works", es: "Saya menulis surat = Escribo una carta; Dia bekerja = Él trabaja", id: "Saya menulis surat; Dia bekerja di kantor." },
    ],
    mistakes: [
      { ko: "Saya tulis surat 은 일상에서 통하지만, 격식 있는 글에서는 menulis 를 써요", en: "Dropping me- (Saya tulis surat) is fine casually but use menulis in formal writing", es: "Omitir me- (Saya tulis surat) vale en informal, pero usa menulis al escribir formal", id: "Menghapus me- (Saya tulis surat) lazim dalam percakapan, tetapi pakai menulis dalam tulisan resmi" },
    ],
    rudyTip: {
      ko: "규칙은 간단해요: 목적어를 받는 행동은 me-, '~한 상태/활동 중'은 ber- 예요!",
      en: "Rule of thumb: me- for actions that take an object, ber- for states or 'doing an activity'!",
      es: "Regla práctica: me- para acciones con objeto, ber- para estados o 'realizar una actividad'!",
      id: "Patokan gampang: me- untuk perbuatan yang punya objek, ber- untuk keadaan atau 'sedang beraktivitas'!",
    },
  },
  {
    id: "id2",
    language: "id",
    unit: 1,
    pattern: {
      ko: "sudah / belum — '이미 했다 / 아직 안 했다'",
      en: "sudah / belum — 'already (done)' vs. 'not yet'",
      es: "sudah / belum — 'ya' vs. 'todavía no'",
      id: "sudah / belum — menyatakan sesuatu sudah terjadi atau belum terjadi",
    },
    examples: [
      { ko: "Saya sudah makan. = 나는 이미 먹었어요", en: "Saya sudah makan = I have already eaten", es: "Saya sudah makan = Ya he comido", id: "Saya sudah makan tadi." },
      { ko: "Saya belum makan. = 나는 아직 안 먹었어요", en: "Saya belum makan = I haven't eaten yet", es: "Saya belum makan = Todavía no he comido", id: "Saya belum makan dari pagi." },
    ],
    mistakes: [
      { ko: "'아니다(tidak)'로 답하지 마세요: 'Sudah makan?' 의 부정 답은 'Belum' 이에요, 'Tidak' 이 아니에요", en: "Don't answer 'Sudah makan?' with 'tidak' — the natural negative is 'Belum' (not yet)", es: "No respondas 'Sudah makan?' con 'tidak' — lo natural es 'Belum' (todavía no)", id: "Jangan jawab 'Sudah makan?' dengan 'tidak' — jawaban alaminya 'Belum'" },
    ],
    rudyTip: {
      ko: "belum 은 '아직은 아니지만 언젠가는' 이라는 뉘앙스예요. 영원한 부정은 tidak 을 써요!",
      en: "belum implies 'not yet, but maybe later'. For a permanent 'no', use tidak!",
      es: "belum implica 'todavía no, quizás luego'. Para un 'no' permanente, usa tidak!",
      id: "belum bernuansa 'belum sekarang, mungkin nanti'. Untuk 'tidak' yang tetap, pakai tidak!",
    },
  },
  {
    id: "id3",
    language: "id",
    unit: 2,
    pattern: {
      ko: "중첩(reduplication) — 단어를 반복해 복수형 만들기",
      en: "Reduplication — repeating a noun to mark the plural",
      es: "Reduplicación — repetir el sustantivo para el plural",
      id: "Pengulangan (reduplikasi) — mengulang kata benda untuk menyatakan jamak",
    },
    examples: [
      { ko: "buku → buku-buku (책 → 책들)", en: "buku → buku-buku (book → books)", es: "buku → buku-buku (libro → libros)", id: "buku → buku-buku; anak → anak-anak" },
      { ko: "Banyak buku-buku 는 중복이에요 — banyak buku 면 충분해요", en: "Toko itu menjual buku-buku = That shop sells (many) books", es: "Toko itu menjual buku-buku = Esa tienda vende (muchos) libros", id: "Toko itu menjual buku-buku impor." },
    ],
    mistakes: [
      { ko: "이미 수량어(banyak, dua)가 있으면 중첩하지 마세요: 'dua buku' ✓, 'dua buku-buku' ✗", en: "Don't reduplicate when a number/quantifier is present: 'dua buku' ✓, not 'dua buku-buku'", es: "No redupliques con número/cuantificador: 'dua buku' ✓, no 'dua buku-buku'", id: "Jangan ulang kalau sudah ada angka/jumlah: 'dua buku' ✓, bukan 'dua buku-buku'" },
    ],
    rudyTip: {
      ko: "인도네시아어 명사는 보통 단·복수가 같아요. 복수를 강조하고 싶을 때만 반복하면 돼요!",
      en: "Indonesian nouns are usually the same in singular and plural — only reduplicate when you want to stress 'many'!",
      es: "Los sustantivos indonesios no cambian en plural — duplica solo para enfatizar 'muchos'!",
      id: "Kata benda Indonesia umumnya sama bentuknya — ulang hanya kalau ingin menekankan 'banyak'!",
    },
  },
  {
    id: "id4",
    language: "id",
    unit: 2,
    pattern: {
      ko: "yang — 관계사/연결어 ('~인 것', '~한')",
      en: "yang — the linker/relativizer ('the one that / which')",
      es: "yang — el conector relativo ('el que / que')",
      id: "yang — kata penghubung untuk menerangkan kata benda ('yang ...')",
    },
    examples: [
      { ko: "buku yang merah = 빨간 책 (lit. 책 + yang + 빨갛다)", en: "buku yang merah = the book that is red / the red book", es: "buku yang merah = el libro que es rojo / el libro rojo", id: "Saya mau buku yang merah, bukan yang biru." },
      { ko: "orang yang tinggi itu = 저 키 큰 사람", en: "orang yang tinggi itu = that person who is tall", es: "orang yang tinggi itu = esa persona que es alta", id: "Orang yang tinggi itu teman saya." },
    ],
    mistakes: [
      { ko: "짧은 형용사 하나는 yang 없이 명사 뒤에 바로 와요: 'baju baru'(새 옷) ✓, 'baju yang baru' 는 '(다른 게 아니라) 새것'을 콕 집을 때만", en: "A single adjective often needs no yang: 'baju baru' (new shirt); use 'baju yang baru' to single out 'the new one'", es: "Un solo adjetivo no suele necesitar yang: 'baju baru'; usa 'baju yang baru' para señalar 'el nuevo'", id: "Satu kata sifat sering tanpa yang: 'baju baru'; pakai 'baju yang baru' untuk menegaskan 'yang baru itu'" },
    ],
    rudyTip: {
      ko: "yang 을 '~인 그것' 이라고 생각하세요. 명사를 길게 꾸밀 때 다리를 놓아줘요!",
      en: "Think of yang as 'the one which' — it bridges a noun to a longer description!",
      es: "Piensa en yang como 'el cual' — une un sustantivo con una descripción más larga!",
      id: "Anggap yang sebagai 'yang itu' — jembatan antara kata benda dan keterangan yang lebih panjang!",
    },
  },
  {
    id: "id5",
    language: "id",
    unit: 3,
    pattern: {
      ko: "tidak vs. bukan — 두 가지 부정 (동사/형용사 vs. 명사)",
      en: "tidak vs. bukan — two negators (verbs/adjectives vs. nouns)",
      es: "tidak vs. bukan — dos negaciones (verbos/adjetivos vs. sustantivos)",
      id: "tidak vs. bukan — dua kata ingkar: tidak untuk kata kerja/sifat, bukan untuk kata benda",
    },
    examples: [
      { ko: "Saya tidak lapar. = 나는 안 배고파요 (형용사 부정 → tidak)", en: "Saya tidak lapar = I'm not hungry (negating an adjective → tidak)", es: "Saya tidak lapar = No tengo hambre (adjetivo → tidak)", id: "Saya tidak lapar sekarang." },
      { ko: "Ini bukan kopi. = 이건 커피가 아니에요 (명사 부정 → bukan)", en: "Ini bukan kopi = This is not coffee (negating a noun → bukan)", es: "Ini bukan kopi = Esto no es café (sustantivo → bukan)", id: "Ini bukan kopi, ini teh." },
    ],
    mistakes: [
      { ko: "Ini tidak kopi ✗ → Ini bukan kopi ✓ (명사 앞에는 항상 bukan)", en: "Ini tidak kopi ✗ → Ini bukan kopi ✓ (always bukan before a noun)", es: "Ini tidak kopi ✗ → Ini bukan kopi ✓ (siempre bukan ante un sustantivo)", id: "Ini tidak kopi ✗ → Ini bukan kopi ✓ (selalu bukan sebelum kata benda)" },
    ],
    rudyTip: {
      ko: "간단 규칙: 명사를 부정하면 bukan, 동사·형용사를 부정하면 tidak!",
      en: "Simple rule: bukan negates nouns, tidak negates verbs and adjectives!",
      es: "Regla simple: bukan niega sustantivos, tidak niega verbos y adjetivos!",
      id: "Aturan singkat: bukan untuk kata benda, tidak untuk kata kerja dan kata sifat!",
    },
  },
  {
    id: "id6",
    language: "id",
    unit: 3,
    pattern: {
      ko: "소유 어순 — [명사] + [소유자] (rumah saya = 나의 집)",
      en: "Possessive word order — [noun] + [owner] (rumah saya = my house)",
      es: "Orden posesivo — [sustantivo] + [poseedor] (rumah saya = mi casa)",
      id: "Urutan kepemilikan — [benda] + [pemilik] (rumah saya, mobil dia)",
    },
    examples: [
      { ko: "rumah saya = 내 집 (집 + 나) — 어순이 한국어와 반대예요", en: "rumah saya = my house (house + I); buku kamu = your book", es: "rumah saya = mi casa (casa + yo); buku kamu = tu libro", id: "Rumah saya dekat sekolah; buku kamu ada di meja." },
      { ko: "구어체 축약: rumahku(=rumah saya), bukumu(=buku kamu)", en: "Casual contractions: rumahku (my house), bukumu (your book)", es: "Contracciones informales: rumahku (mi casa), bukumu (tu libro)", id: "Bentuk santai: rumahku, bukumu, mobilnya." },
    ],
    mistakes: [
      { ko: "saya rumah ✗ (소유자를 앞에 두지 마세요) → rumah saya ✓", en: "saya rumah ✗ (don't put the owner first) → rumah saya ✓", es: "saya rumah ✗ (no pongas el poseedor primero) → rumah saya ✓", id: "saya rumah ✗ (pemilik jangan di depan) → rumah saya ✓" },
    ],
    rudyTip: {
      ko: "인도네시아어는 '소유물 먼저, 주인 나중'이에요. 한국어 '나의 집'을 뒤집어 'rumah saya'!",
      en: "Indonesian says the thing first, the owner second — flip Korean/English: 'house + my'!",
      es: "El indonesio nombra primero la cosa y luego el dueño — invierte 'mi casa' → 'casa + mi'!",
      id: "Bahasa Indonesia menyebut bendanya dulu, pemiliknya kemudian: 'rumah' + 'saya'!",
    },
  },

  // ════════════════════════════════════════════════════════════════
  // EGYPTIAN ARABIC (language: "ar") — starter grammar tips
  // Strings include Arabic script + romanization for learner support.
  // ════════════════════════════════════════════════════════════════
  {
    id: "ar1",
    language: "ar",
    unit: 1,
    pattern: {
      ko: "현재형(المضارع) — 접두사 없이 인칭으로 활용 (أَكْتُب aktub = 나는 쓴다)",
      en: "Present tense (al-muḍāriʿ) — conjugate by person, no prefix needed (أَكْتُب aktub = I write)",
      es: "Presente (al-muḍāriʿ) — se conjuga por persona, sin prefijo (أَكْتُب aktub = yo escribo)",
      id: "Kala kini (al-muḍāriʿ) — dikonjugasikan per persona, tanpa awalan (أَكْتُب aktub = saya menulis)",
    },
    examples: [
      { ko: "أَكْتُب (aktub) = 나는 쓴다 / تَكْتُب (taktub) = 너는(남) 쓴다", en: "أَكْتُب aktub = I write; تَكْتُب taktub = you (m) write", es: "أَكْتُب aktub = yo escribo; تَكْتُب taktub = tú (m) escribes", id: "أَكْتُب aktub = saya menulis; تَكْتُب taktub = kamu (lk) menulis" },
      { ko: "يَشْرَب قَهْوَة (yashrab qahwa) = 그는 커피를 마신다", en: "يَشْرَب قَهْوَة yashrab qahwa = he drinks coffee", es: "يَشْرَب قَهْوَة yashrab qahwa = él bebe café", id: "يَشْرَب قَهْوَة yashrab qahwa = dia minum kopi" },
    ],
    mistakes: [
      { ko: "이집트 구어에서는 평소 행동에 bi- 접두사(بَكْتِب)를 붙이지만, 표준어(فُصحى)에는 그런 접두사가 없어요: أَكْتُب ✓, بَكْتِب ✗", en: "Egyptian colloquial adds a bi- prefix for habitual actions (بَكْتِب), but Standard Arabic has no such prefix: أَكْتُب ✓, بَكْتِب ✗", es: "El egipcio coloquial añade un prefijo bi- para acciones habituales (بَكْتِب), pero el árabe estándar no lleva ese prefijo: أَكْتُب ✓, بَكْتِب ✗", id: "Bahasa Mesir sehari-hari menambah awalan bi- untuk kebiasaan (بَكْتِب), tetapi Arab baku tak punya awalan itu: أَكْتُب ✓, بَكْتِب ✗" },
    ],
    rudyTip: {
      ko: "표준 아랍어 현재형은 인칭 접두사(أ/تَ/يَ/نَ)만으로 충분해요 — 별도의 시제 접두사가 필요 없어요!",
      en: "Standard Arabic forms the present with just the person prefix (أ/تَ/يَ/نَ) — no extra tense prefix needed!",
      es: "El árabe estándar forma el presente solo con el prefijo de persona (أ/تَ/يَ/نَ) — sin prefijo de tiempo adicional!",
      id: "Arab baku membentuk kala kini cukup dengan awalan persona (أ/تَ/يَ/نَ) — tanpa awalan kala tambahan!",
    },
  },
  {
    id: "ar2",
    language: "ar",
    unit: 1,
    pattern: {
      ko: "부정 لا / لَمْ / لَيْسَ — 현재는 لا, 과거는 لَمْ+단축형, '~이 아니다'는 لَيْسَ",
      en: "Negation lā / lam / laysa — lā for present, lam + jussive for past, laysa for 'is not'",
      es: "Negación lā / lam / laysa — lā para el presente, lam + yusivo para el pasado, laysa para 'no es'",
      id: "Negasi lā / lam / laysa — lā untuk kala kini, lam + jusif untuk lampau, laysa untuk 'bukan/tidak'",
    },
    examples: [
      { ko: "لَمْ أَكْتُب (lam aktub) = 나는 안 썼다 (لَمْ + 동사 단축형)", en: "لَمْ أَكْتُب lam aktub = I didn't write (lam + jussive)", es: "لَمْ أَكْتُب lam aktub = no escribí (lam + yusivo)", id: "لَمْ أَكْتُب lam aktub = saya tidak menulis (lam + jusif)" },
      { ko: "لَيْسَ جَيِّدًا (laysa jayyidan) = 좋지 않다 (명사문 부정 → لَيْسَ)", en: "لَيْسَ جَيِّدًا laysa jayyidan = not good (negating a predicate → laysa)", es: "لَيْسَ جَيِّدًا laysa jayyidan = no es bueno (negar un predicado → laysa)", id: "لَيْسَ جَيِّدًا laysa jayyidan = tidak bagus (mengingkari predikat → laysa)" },
    ],
    mistakes: [
      { ko: "이집트 구어는 동사를 ma-...-sh 로 감싸고 형용사엔 mish 를 쓰지만, 표준어는 لا/لَمْ/لَيْسَ 를 써요: لَيْسَ جَيِّدًا ✓, مِش كْوَيِّس(구어) ✗", en: "Egyptian wraps verbs in ma-…-sh and uses mish for adjectives, but Standard Arabic uses lā/lam/laysa: لَيْسَ جَيِّدًا ✓, dialectal مِش كْوَيِّس ✗", es: "El egipcio envuelve verbos con ma-…-sh y usa mish para adjetivos, pero el estándar usa lā/lam/laysa: لَيْسَ جَيِّدًا ✓, el coloquial مِش كْوَيِّس ✗", id: "Bahasa Mesir mengapit kata kerja dengan ma-…-sh dan memakai mish untuk sifat, tetapi Arab baku memakai lā/lam/laysa: لَيْسَ جَيِّدًا ✓, ragam pasaran مِش كْوَيِّس ✗" },
    ],
    rudyTip: {
      ko: "표준어 부정은 짝이 정해져 있어요: 현재형엔 لا, 과거엔 لَمْ(+단축형), 명사·형용사 술어엔 لَيْسَ!",
      en: "Standard Arabic pairs each negator: lā with the present, lam (+ jussive) with the past, laysa with a noun/adjective predicate!",
      es: "El árabe estándar empareja cada negador: lā con el presente, lam (+ yusivo) con el pasado, laysa con un predicado nominal/adjetival!",
      id: "Arab baku memasangkan tiap kata ingkar: lā dengan kala kini, lam (+ jusif) dengan lampau, laysa dengan predikat benda/sifat!",
    },
  },
  {
    id: "ar3",
    language: "ar",
    unit: 2,
    pattern: {
      ko: "소유 접미사 -ī / -ka / -ki — 명사에 붙여 '나의/너의(남)/너의(여)'",
      en: "Possessive suffixes -ī / -ka / -ki — attach to a noun for my / your(m) / your(f)",
      es: "Sufijos posesivos -ī / -ka / -ki — se unen al sustantivo: mi / tu(m) / tu(f)",
      id: "Akhiran kepemilikan -ī / -ka / -ki — ditempel ke kata benda: -ku / -mu(lk) / -mu(pr)",
    },
    examples: [
      { ko: "بَيْت (bayt, 집) → بَيْتِي (baytī, 내 집), بَيْتُكَ (baytuka, 네[남] 집), بَيْتُكِ (baytuki, 네[여] 집)", en: "بَيْت bayt (house) → بَيْتِي baytī (my house), بَيْتُكَ baytuka (your-m), بَيْتُكِ baytuki (your-f)", es: "بَيْت bayt (casa) → بَيْتِي baytī (mi casa), بَيْتُكَ baytuka (tu-m), بَيْتُكِ baytuki (tu-f)", id: "بَيْت bayt (rumah) → بَيْتِي baytī (rumahku), بَيْتُكَ baytuka (rumahmu-lk), بَيْتُكِ baytuki (rumahmu-pr)" },
      { ko: "اِسْمِي أَحْمَد (ismī Aḥmad) = 내 이름은 아흐마드", en: "اِسْمِي أَحْمَد ismī Aḥmad = my name is Ahmad", es: "اِسْمِي أَحْمَد ismī Aḥmad = mi nombre es Ahmad", id: "اِسْمِي أَحْمَد ismī Aḥmad = nama saya Ahmad" },
    ],
    mistakes: [
      { ko: "별도의 단어를 쓰지 마세요: 영어 'my house'처럼 떼지 말고 한 단어 بَيْتِي(baytī)로 붙여요", en: "Don't use a separate word for 'my' — fuse it: not 'bayt [my]', just بَيْتِي baytī", es: "No uses palabra aparte para 'mi' — fusiónala: no 'bayt [mi]', sino بَيْتِي baytī", id: "Jangan pakai kata terpisah untuk 'ku' — gabungkan: bukan 'bayt [ku]', tetapi بَيْتِي baytī" },
    ],
    rudyTip: {
      ko: "남자한테는 -ka(바이투카), 여자한테는 -ki(바이투키)! 성별에 따라 끝소리가 달라지는 걸 기억하세요.",
      en: "To a man it's -ka (baytuka), to a woman -ki (baytuki) — the ending changes with the listener's gender!",
      es: "A un hombre -ka (baytuka), a una mujer -ki (baytuki) — la terminación cambia según el oyente!",
      id: "Ke laki-laki -ka (baytuka), ke perempuan -ki (baytuki) — akhirannya ikut jenis kelamin lawan bicara!",
    },
  },
  {
    id: "ar4",
    language: "ar",
    unit: 2,
    pattern: {
      ko: "여성형 어미 -a (ة) — 형용사·명사를 여성에 일치시키기",
      en: "Feminine ending -a (ة) — making adjectives/nouns agree with feminine",
      es: "Terminación femenina -a (ة) — concordancia femenina de adjetivos/sustantivos",
      id: "Akhiran perempuan -a (ة) — menyesuaikan kata sifat/benda dengan bentuk perempuan",
    },
    examples: [
      { ko: "كَبِير (kabīr, 큰-남) → كَبِيرَة (kabīra, 큰-여)", en: "كَبِير kabīr (big, m) → كَبِيرَة kabīra (big, f)", es: "كَبِير kabīr (grande, m) → كَبِيرَة kabīra (grande, f)", id: "كَبِير kabīr (besar, lk) → كَبِيرَة kabīra (besar, pr)" },
      { ko: "وَلَد كَبِير (walad kabīr) 큰 남자아이 / بِنْت كَبِيرَة (bint kabīra) 큰 여자아이", en: "وَلَد كَبِير walad kabīr = a big boy; بِنْت كَبِيرَة bint kabīra = a big girl", es: "وَلَد كَبِير walad kabīr = un niño grande; بِنْت كَبِيرَة bint kabīra = una niña grande", id: "وَلَد كَبِير walad kabīr = anak laki-laki besar; بِنْت كَبِيرَة bint kabīra = anak perempuan besar" },
    ],
    mistakes: [
      { ko: "여성 명사에 남성 형용사를 쓰지 마세요: 'bint kabīr' ✗ → 'bint kabīra' ✓", en: "Don't pair a feminine noun with a masculine adjective: 'bint kabīr' ✗ → 'bint kabīra' ✓", es: "No juntes sustantivo femenino con adjetivo masculino: 'bint kabīr' ✗ → 'bint kabīra' ✓", id: "Jangan pasangkan benda perempuan dengan sifat laki-laki: 'bint kabīr' ✗ → 'bint kabīra' ✓" },
    ],
    rudyTip: {
      ko: "대부분의 단어는 끝에 -a(ة, 타 마르부타)를 붙이면 여성형이 돼요. 형용사도 명사 성별에 맞춰요!",
      en: "Most words turn feminine by adding -a (ة, taa marbuuta) — and the adjective must match the noun's gender!",
      es: "La mayoría se hace femenina añadiendo -a (ة, taa marbuuta) — y el adjetivo concuerda con el sustantivo!",
      id: "Kebanyakan kata jadi perempuan dengan menambah -a (ة, taa marbuuta) — sifatnya pun ikut jenis kata bendanya!",
    },
  },
  {
    id: "ar5",
    language: "ar",
    unit: 3,
    pattern: {
      ko: "أُرِيد (urīd) — '원하다'; 뒤에 명사나 'أَنْ + 동사'를 붙여요",
      en: "أُرِيد urīd — 'I want'; follow it with a noun or 'an + verb'",
      es: "أُرِيد urīd — 'quiero'; sígelo de un sustantivo o de 'an + verbo'",
      id: "أُرِيد urīd — 'saya mau/ingin'; ikuti dengan kata benda atau 'an + kata kerja'",
    },
    examples: [
      { ko: "أَنَا أُرِيد مَاء (ana urīd māʾ) = 나는 물을 원해요", en: "أَنَا أُرِيد مَاء ana urīd māʾ = I want water", es: "أَنَا أُرِيد مَاء ana urīd māʾ = yo quiero agua", id: "أَنَا أُرِيد مَاء ana urīd māʾ = saya mau air" },
      { ko: "أُرِيد أَنْ أَذْهَب (urīd an adhhab) = 나는 가고 싶어요", en: "أُرِيد أَنْ أَذْهَب urīd an adhhab = I want to go", es: "أُرِيد أَنْ أَذْهَب urīd an adhhab = quiero ir", id: "أُرِيد أَنْ أَذْهَب urīd an adhhab = saya mau pergi" },
    ],
    mistakes: [
      { ko: "أُرِيد 는 정상적인 동사예요. 이집트 구어의 형용사형 عايز/عايزة(3aayez/3ayza)와 달리 성별로 구분하지 않아요: أُرِيد ✓ (남녀 공통)", en: "أُرِيد is a normal verb — unlike the Egyptian participle عايز/عايزة (3aayez/3ayza), it isn't split by gender: أُرِيد ✓ (same for m and f)", es: "أُرِيد es un verbo normal — a diferencia del participio egipcio عايز/عايزة (3aayez/3ayza), no se divide por género: أُرِيد ✓ (igual para h y m)", id: "أُرِيد adalah kata kerja biasa — beda dengan partisipel Mesir عايز/عايزة (3aayez/3ayza), ia tidak dibedakan menurut jenis kelamin: أُرِيد ✓ (sama untuk lk dan pr)" },
    ],
    rudyTip: {
      ko: "'~하고 싶다'는 أُرِيد 뒤에 أَنْ + 동사를 붙이면 돼요: أُرِيد أَنْ آكُل (urīd an ākul) = 먹고 싶어요.",
      en: "For 'want to…', put أَنْ + verb after أُرِيد: أُرِيد أَنْ آكُل urīd an ākul = I want to eat.",
      es: "Para 'querer…', pon أَنْ + verbo tras أُرِيد: أُرِيد أَنْ آكُل urīd an ākul = quiero comer.",
      id: "Untuk 'mau …', taruh أَنْ + kata kerja sesudah أُرِيد: أُرِيد أَنْ آكُل urīd an ākul = saya mau makan.",
    },
  },
  {
    id: "ar6",
    language: "ar",
    unit: 3,
    pattern: {
      ko: "지시사 هَذَا / هَذِهِ + 이다파(idafa) — '이것(남/여)' & 명사 소유 연결",
      en: "Demonstratives hādhā / hādhihi + idafa — 'this (m/f)' and noun-to-noun possession",
      es: "Demostrativos hādhā / hādhihi + idafa — 'este/esta' y posesión sustantivo-sustantivo",
      id: "Kata tunjuk hādhā / hādhihi + idafa — 'ini (lk/pr)' dan kepemilikan benda-ke-benda",
    },
    examples: [
      { ko: "هَذَا الْكِتَاب (hādhā al-kitāb) = 이 책 (남) / هَذِهِ السَّيَّارَة (hādhihi as-sayyāra) = 이 차 (여) — 지시사는 명사 앞!", en: "هَذَا الْكِتَاب hādhā al-kitāb = this book (m); هَذِهِ السَّيَّارَة hādhihi as-sayyāra = this car (f) — the demonstrative comes before the noun", es: "هَذَا الْكِتَاب hādhā al-kitāb = este libro (m); هَذِهِ السَّيَّارَة hādhihi as-sayyāra = este coche (f) — el demostrativo va antes del sustantivo", id: "هَذَا الْكِتَاب hādhā al-kitāb = buku ini (lk); هَذِهِ السَّيَّارَة hādhihi as-sayyāra = mobil ini (pr) — kata tunjuk berada sebelum kata benda" },
      { ko: "كِتَاب أَحْمَد (kitāb Aḥmad) = 아흐마드의 책 (idafa: 명사+명사, '의' 단어 없이 붙임)", en: "كِتَاب أَحْمَد kitāb Aḥmad = Ahmad's book (idafa: noun+noun, no word for 'of')", es: "كِتَاب أَحْمَد kitāb Aḥmad = el libro de Ahmad (idafa: sustantivo+sustantivo, sin palabra para 'de')", id: "كِتَاب أَحْمَد kitāb Aḥmad = buku Ahmad (idafa: benda+benda, tanpa kata 'dari')" },
    ],
    mistakes: [
      { ko: "표준어 지시사는 명사 앞에 와요(이집트 구어 'il-kitaab da'는 뒤에 옴): هَذَا الْكِتَاب ✓. idafa 의 첫 명사에는 알(الـ)을 붙이지 않아요: 'al-kitāb Aḥmad' ✗ → كِتَاب أَحْمَد ✓", en: "In Standard Arabic the demonstrative precedes the noun (Egyptian 'il-kitaab da' puts it after): هَذَا الْكِتَاب ✓. In idafa, the first noun drops 'al-': 'al-kitāb Aḥmad' ✗ → كِتَاب أَحْمَد ✓", es: "En árabe estándar el demostrativo precede al sustantivo (el egipcio 'il-kitaab da' lo pone detrás): هَذَا الْكِتَاب ✓. En idafa, el primer sustantivo pierde 'al-': 'al-kitāb Aḥmad' ✗ → كِتَاب أَحْمَد ✓", id: "Dalam Arab baku kata tunjuk mendahului kata benda (ragam Mesir 'il-kitaab da' menaruhnya di belakang): هَذَا الْكِتَاب ✓. Dalam idafa, benda pertama lepas 'al-': 'al-kitāb Aḥmad' ✗ → كِتَاب أَحْمَد ✓" },
    ],
    rudyTip: {
      ko: "표준어에서 هَذَا/هَذِهِ 는 명사 앞에 와요. idafa 는 '책(의) 아흐마드'처럼 두 명사를 그냥 이어 소유를 만들어요!",
      en: "In Standard Arabic hādhā/hādhihi come before the noun. idafa just chains two nouns ('book Ahmad') to show possession!",
      es: "En árabe estándar hādhā/hādhihi van antes del sustantivo. idafa encadena dos sustantivos ('libro Ahmad') para la posesión!",
      id: "Dalam Arab baku hādhā/hādhihi berada sebelum kata benda. idafa cukup merangkai dua benda ('buku Ahmad') untuk kepemilikan!",
    },
  },
];

/** Get grammar tips for a specific day */
export function getTipsForDay(day: number): GrammarTip[] {
  return GRAMMAR_TIPS.filter((t) => t.day === day);
}

/** Get grammar tips for a specific unit */
export function getTipsForUnit(unit: number): GrammarTip[] {
  return GRAMMAR_TIPS.filter((t) => t.unit === unit);
}

/** Get a random grammar tip */
export function getRandomTip(): GrammarTip {
  return GRAMMAR_TIPS[Math.floor(Math.random() * GRAMMAR_TIPS.length)];
}
