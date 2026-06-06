/**
 * Escape-Room v1 data model + the one shipped room ("The Sealed Archive").
 *
 * A room is a NON-LINEAR board of locks. Each lock, when solved, reveals one
 * clue word. Once all clue words are gathered, an exit gate (a reused
 * BossSpellPuzzle seeded with the clue words) unlocks; the exit is itself gated
 * behind a final spoken assembly.
 *
 * Localization: `en` + `id` are authored fully (Indonesian is a primary learning
 * target); `ko`/`es` are authored best-effort. Arabic is beta but must never be
 * mislabeled with English text in `ar` fields.
 */

import type { BossSpellQuestion } from "@/components/story/puzzles/BossSpellPuzzle";
import type {
  HintTri,
  SentenceBuilderQ,
  Tri,
  WritingMissionQ,
} from "@/lib/escapeRoomPuzzleTypes";

export type { Tri, HintTri } from "@/lib/escapeRoomPuzzleTypes";

/** A clue word revealed when a lock is solved (target-language token, per learningLang). */
export interface ClueWord {
  id: string;
  word: Tri;
}

export type LockKind = "speaking" | "sentence-builder" | "writing";

/** Common fields every lock carries. */
interface BaseLock {
  id: string;
  title: Tri;
  hints: { h1: HintTri; h2: HintTri; h3?: HintTri };
  clue: ClueWord;
}

/** Speak the phrase into the mic; pronunciation-assess accepts it (or accept-unscored on outage). */
export interface SpeakingLockData extends BaseLock {
  kind: "speaking";
  instruction: Tri; // "Say this to the lock"
  phrase: Tri; // target phrase the learner speaks (learningLang-resolved)
  minScore?: number; // default undefined → attempt-over-accuracy (no score gate)
}

/** Build a sentence from word cards in the exact learning-language order. */
export interface SentenceLockData extends BaseLock {
  kind: "sentence-builder";
  question: SentenceBuilderQ;
}

/** Type the answer; checkAnswer validates against the learning-language word + variants. */
export interface WritingLockData extends BaseLock {
  kind: "writing";
  question: WritingMissionQ;
}

export type LockData = SpeakingLockData | SentenceLockData | WritingLockData;

/**
 * The exit gate. Reuses BossSpellPuzzle's assemble-from-chunks mechanic, then
 * requires the assembled sentence to be SPOKEN once before the room is escaped.
 *
 * INVARIANT (load-bearing): `bossSpell.spellChunks` MUST be all-distinct strings.
 * BossSpellPuzzle ignores taps for already-used chunk *values* (it dedupes by the
 * chunk string), so any duplicate chunk makes the exit unsolvable. The shipped
 * room is verified to satisfy this below.
 */
export interface ExitGate {
  bossSpell: BossSpellQuestion;
  requireSpoken: true;
  spokenPhrase: Tri; // = the assembled sentence, for pronunciation-assess
  instruction: Tri; // shown above the final SpeakingLock
}

export interface EscapeRoom {
  id: string;
  title: Tri;
  intro: Tri; // Rudy framing line
  locks: LockData[]; // v1: exactly 3, solvable in any order
  exit: ExitGate;
  xpOnEscape: number; // 60 = 3 × 20, parity with handlePuzzleSolved
  /** Expression-book chapter bucket the mastered clue words file under. */
  expressionChapter: string;
}

/**
 * THE SEALED ARCHIVE
 *
 * Theme: the Lexicon Society sealed an archive of stolen words. Speak, build, and
 * write to free three key words — open / key / free — then assemble + speak the
 * escape sentence to release the words back into the world.
 *
 * Clue words → exit sentence design (correctness-critical):
 *   clue1 = "open"  (Lock A, speaking)
 *   clue2 = "key"   (Lock B, sentence-builder)
 *   clue3 = "free"  (Lock C, writing)
 *   exit  = "Open the key, free every word"
 *           chunks: [Open, the, key, free, every, word]  ← ALL DISTINCT ✓
 *           wordPool: chunks + [close, lock, trap]        ← ALL DISTINCT ✓
 *   The three clue words (Open / key / free) are the load-bearing tokens of the
 *   exit spell, so escaping literally reuses what each lock taught.
 */
const SEALED_ARCHIVE: EscapeRoom = {
  id: "sealed-archive",
  title: {
    en: "The Sealed Archive",
    ko: "봉인된 기록실",
    es: "El Archivo Sellado",
    id: "Arsip Tersegel",
    ar: "الأرشيف المختوم",
  },
  intro: {
    en: "Three locks seal this room. Speak, build, and write the words to free them — then say the escape phrase aloud.",
    ko: "세 개의 자물쇠가 이 방을 봉인했어요. 말하고, 만들고, 써서 단어를 풀고 — 마지막엔 탈출 문장을 소리 내어 말하세요.",
    es: "Tres cerraduras sellan esta sala. Habla, construye y escribe las palabras para liberarlas, luego di la frase de escape en voz alta.",
    id: "Tiga gembok menyegel ruangan ini. Ucapkan, susun, dan tulis katanya untuk membukanya — lalu ucapkan kalimat pelarian dengan lantang.",
    ar: "ثلاثة أقفال قافلة الأوضة. اتكلم، ركّب، واكتب الكلمات عشان تحررها — وبعدين قول جملة الهروب بصوت عالي.",
  },
  expressionChapter: "escape-archive",
  xpOnEscape: 60,

  locks: [
    // ── LOCK A: SPEAKING (clue word #1 = "open") ──────────────────────────────
    {
      kind: "speaking",
      id: "lockA",
      title: { en: "Voice Lock", ko: "음성 자물쇠", es: "Cerradura de Voz", id: "Gembok Suara", ar: "قفل صوتي" },
      instruction: {
        en: "Say the command to the lock.",
        ko: "자물쇠에게 명령을 말하세요.",
        es: "Di la orden a la cerradura.",
        id: "Ucapkan perintah ke gembok.",
        ar: "قُل الأمر للقفل.",
      },
      phrase: { en: "Open the door", ko: "문을 열어", es: "Abre la puerta", id: "Buka pintunya", ar: "افتح الباب" },
      hints: {
        h1: {
          en: "It's a command starting with 'Open'.",
          ko: "'열다'로 시작하는 명령이에요.",
          es: "Es una orden que empieza con 'Abre'.",
          id: "Perintah yang diawali 'Buka'.",
          ar: "ده أمر بيبدأ بمعنى «افتح».",
        },
        h2: {
          en: "Open + the + door.",
          ko: "Open + the + door 구조예요.",
          es: "Abre + la + puerta.",
          id: "Buka + pintu + nya.",
          ar: "افتح + الباب.",
        },
        h3: { en: "Open the door", ko: "Open the door", es: "Abre la puerta", id: "Buka pintunya", ar: "افتح الباب" },
      },
      clue: { id: "clue1", word: { en: "open", ko: "열다", es: "abre", id: "buka", ar: "افتح" } },
    },

    // ── LOCK B: SENTENCE-BUILDER (EN/ES/ID) (clue word #2 = "key") ────────────
    // KO/AR are routed to a WRITING lock at runtime (escape-room.tsx) because
    // SentenceBuilder validates an exact per-learning-language word order, and a
    // single answerOrder can't be correct for KO ("나는 열쇠가 필요해요") order.
    {
      kind: "sentence-builder",
      id: "lockB",
      title: { en: "Word Lock", ko: "단어 자물쇠", es: "Cerradura de Palabras", id: "Gembok Kata", ar: "قفل الكلمات" },
      question: {
        instruction: {
          en: 'Build: "I need the key."',
          ko: '문장을 만드세요: "열쇠가 필요해요."',
          es: 'Construye: "Necesito la llave."',
          id: 'Susun: "Saya butuh kuncinya."',
          ar: 'ركّب الجملة: "أنا محتاج مفتاح الباب."',
        },
        // words are Tri[]; answerOrder indexes into this array (resolved per learningLang at render).
        // Index order below is correct for EN / ES / ID (SVO, article before noun).
        words: [
          { en: "I", ko: "나는", es: "Yo", id: "Saya", ar: "أنا" },
          { en: "need", ko: "필요해요", es: "necesito", id: "butuh", ar: "محتاج" },
          { en: "the", ko: "그", es: "la", id: "kunci", ar: "مفتاح" },
          { en: "key", ko: "열쇠", es: "llave", id: "itu", ar: "الباب" },
        ],
        // EN: I need the key. ES: Yo necesito la llave. ID: Saya butuh kunci itu.
        answerOrder: [0, 1, 2, 3],
      },
      hints: {
        h1: {
          en: "Start with the subject 'I'.",
          ko: "주어 '나는'으로 시작해요.",
          es: "Empieza con el sujeto 'Yo'.",
          id: "Mulai dengan subjek 'Saya'.",
          ar: "ابدأ بـ «أنا».",
        },
        h2: {
          en: "I · need · the · key",
          ko: "나는 · 열쇠가 · 필요해요",
          es: "Yo · necesito · la · llave",
          id: "Saya · butuh · kunci · itu",
          ar: "أنا · محتاج · مفتاح · الباب",
        },
      },
      clue: { id: "clue2", word: { en: "key", ko: "열쇠", es: "llave", id: "kunci", ar: "مفتاح" } },
    },

    // ── LOCK C: WRITING / TYPE (clue word #3 = "free") ────────────────────────
    {
      kind: "writing",
      id: "lockC",
      title: { en: "Rune Lock", ko: "룬 자물쇠", es: "Cerradura Rúnica", id: "Gembok Rune", ar: "قفل الرموز" },
      question: {
        // word: the prompt (displayed in UI lang); typed answer = learningLang form.
        word: { en: "free", ko: "자유롭게 하다", es: "liberar", id: "bebaskan", ar: "حرّر" },
        hint: {
          en: "Antonym of 'trap'. Set the words ___.",
          ko: "'가두다'의 반대말이에요.",
          es: "Antónimo de 'atrapar'.",
          id: "Lawan kata 'jebak'.",
          ar: "عكس معنى «احبس». حرّر الكلمات.",
        },
        // Per-language: a Korean/Arabic learner must type the TARGET form, not
        // English. (Was a flat all-language array → English "free" unlocked any
        // learner's lock, breaking the learn-the-target contract.)
        // Keys are the FULL learningLang names (WritingLock indexes by
        // learningLang, e.g. "korean" — short codes like "ko" silently miss).
        acceptableAnswers: {
          english: ["free", "liberate", "set free"],
          spanish: ["liberar", "libera"],
          indonesian: ["bebaskan", "membebaskan"],
          korean: ["자유롭게 하다", "자유", "풀다", "풀어요"],
          arabic: ["حرّر", "حَرِّر", "حرر"],
        },
      },
      hints: {
        h1: {
          en: "The word that ends the escape: set the words ___.",
          ko: "탈출을 끝내는 단어: 단어들을 ___ 하라.",
          es: "La palabra que termina el escape: libera las palabras.",
          id: "Kata yang mengakhiri pelarian: bebaskan kata-katanya.",
          ar: "حرّر الكلمات.",
        },
        h2: { en: "f _ _ e", ko: "정답: free", es: "l-i-b-e-r-a-r", id: "b-e-b-a-s-k-a-n", ar: "ح-ر-ر" },
      },
      clue: { id: "clue3", word: { en: "free", ko: "자유", es: "libre", id: "bebas", ar: "حر" } },
    },
  ],

  // ── EXIT GATE: assemble + speak the escape sentence ─────────────────────────
  exit: {
    requireSpoken: true,
    spokenPhrase: {
      en: "Use the key, free every word",
      ko: "열쇠로 모든 단어를 풀어요",
      es: "Usa la llave, libera cada palabra",
      id: "Gunakan kuncinya, bebaskan setiap kata",
      ar: "اِسْتَعْمِل المُفْتاح، حَرِّر كُل كِلْمة",
    },
    instruction: {
      en: "Now speak the escape spell aloud.",
      ko: "이제 탈출 주문을 소리 내어 말하세요.",
      es: "Ahora di el hechizo de escape en voz alta.",
      id: "Sekarang ucapkan mantra pelarian dengan lantang.",
      ar: "دلوقتي قول تعويذة الهروب بصوت عالي.",
    },
    bossSpell: {
      // CORRECTNESS-CRITICAL: every spellChunk is a DISTINCT string.
      //   Open · the · key · free · every · word  → no duplicates.
      // wordPool = the 6 chunks + 3 distinct distractors (close / lock / trap).
      spellChunks: ["Use", "the", "key", "free", "every", "word"],
      separators: ["", "", ",", "", "", ""],
      wordPool: ["Use", "the", "key", "free", "every", "word", "close", "lock", "trap"],
      instruction: {
        en: "Assemble the escape spell, then speak it.",
        ko: "탈출 주문을 맞추고, 소리 내어 말하세요.",
        es: "Arma el hechizo de escape y dilo.",
        id: "Susun mantra pelarian, lalu ucapkan.",
        ar: "ركّب تعويذة الهروب، وبعدين قولها.",
      },
      hints: {
        h1: {
          en: "Put the freed words in order to escape.",
          ko: "방금 푼 단어들을 순서대로 놓으세요.",
          es: "Ordena las palabras que liberaste.",
          id: "Susun kata-kata yang kamu bebaskan.",
          ar: "رَتِّب الكلمات اللي حررتها بالترتيب.",
        },
        h2: {
          en: "Use the key, free every word",
          ko: "열쇠로 모든 단어를 풀어요",
          es: "Usa la llave, libera cada palabra",
          id: "Gunakan kuncinya, bebaskan setiap kata",
          ar: "اِسْتَعْمِل المُفْتاح، حَرِّر كُل كِلْمة",
        },
        h3: {
          en: "Open the key, free every word",
          ko: "Open the key, free every word",
          es: "Open the key, free every word",
          id: "Open the key, free every word",
          ar: "افتح المفتاح، حرّر كل كلمة",
        },
      },
      storyReason: {
        en: "The words rush back into the world.",
        ko: "단어들이 세상으로 쏟아져 돌아와요.",
        es: "Las palabras regresan al mundo.",
        id: "Kata-kata mengalir kembali ke dunia.",
        ar: "الكلمات بترجع للعالم من جديد.",
      },
    },
  },
};

export const ESCAPE_ROOMS: Record<string, EscapeRoom> = {
  "sealed-archive": SEALED_ARCHIVE,
};

export function getEscapeRoom(id: string | undefined | null): EscapeRoom | undefined {
  if (!id) return undefined;
  return ESCAPE_ROOMS[id];
}
