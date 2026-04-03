# Trilingual Content Creation Guide

**Date:** 2026-03-30
**Scope:** Story mode, quizzes, daily course — all content that the user sees

---

## Core Principle

Every piece of text in this app must exist in **3 languages**: English, Korean, Spanish.
The app has two language settings:

| Setting | Key | Purpose |
|---|---|---|
| `nativeLanguage` | `"korean" \| "english" \| "spanish"` | User's mother tongue — used for UI, hints, translations |
| `learningLanguage` | `"korean" \| "english" \| "spanish"` | Language the user is learning — used for main content, TTS, pronunciation |

**A Korean speaker learning English** sees English sentences as the primary content and Korean as hints/translations.
**An English speaker learning Korean** sees Korean sentences as the primary content and English as hints/translations.

---

## Data Structures by File

### 1. story-scene.tsx — Inline Story Data

#### Tri (Trilingual Object)
```typescript
interface Tri {
  en: string;  // English
  ko: string;  // Korean
  es: string;  // Spanish
}
```
Used in ALL quiz content: `word`, `meaning`, `answer`, `prompt`, `context`, `sentence`, `hints`, etc.

The `tri(t, lang)` helper resolves the correct string based on `learningLanguage`.

#### SeqScene (Story Narration / Dialogue)
```typescript
type SeqScene = {
  kind: "scene";
  charId: string;       // character ID (e.g., "lingo", "tom", "minho")
  text: string;         // English (default)
  textKo?: string;      // Korean translation
  textEs?: string;      // Spanish translation
  isNarration?: boolean;
};
```

**RULE:** Every `SeqScene` MUST have all 3 fields: `text`, `textKo`, `textEs`.
The app renders `text` for English learners, `textKo` for Korean learners, `textEs` for Spanish learners.

#### SeqClue (Clue Cards)
```typescript
type SeqClue = {
  kind: "clue";
  symbol: string;       // emoji
  titleEn: string;
  titleKo: string;
  titleEs: string;
  descEn: string;
  descKo: string;
  descEs: string;
};
```

**RULE:** All 6 text fields (titleEn/Ko/Es, descEn/Ko/Es) are REQUIRED.

#### SeqPuzzle (Inline Quizzes)
All puzzle question interfaces use `Tri` for every text field:

| Puzzle Type | Tri Fields |
|---|---|
| `word-match` | `word`, `meaning`, `wrong[0..2]` |
| `fill-blank` | `sentence`, `answer`, `opts[0..1]`, `hints.h1/h2/h3` |
| `dialogue-choice` | `prompt`, `context`, `answer`, `wrong[0..1]` |
| `sentence-builder` | `instruction`, `words[]` |
| `investigation` | `prompt`, `clues[]` |
| `pronunciation` | `word` |
| `writing-mission` | `word`, `hint` |
| `cipher` | `answer`, `hint`, `opts[]` (+ `encoded` has en/es only) |
| `word-puzzle` | `word`, `scrambled` |

**RULE:** Never leave any `Tri` field with only 1 or 2 languages. All 3 must be present.

#### PuzzleHints
```typescript
type HintTri = Tri & { byLearning?: Partial<Record<string, Tri>> };
```
Hints can optionally override content per `learningLanguage`. Resolution: `byLearning[learningLang]` > default Tri.

---

### 2. quizData.json — External Quiz Data

```json
{
  "id": "ch1_quiz_a",
  "chapter": "ch1",
  "type": "word_rearrange",
  "title": { "ko": "...", "en": "...", "es": "..." },
  "storyContext": { "ko": "...", "en": "...", "es": "..." },
  "content": {
    "en": { "questions": [...] },
    "es": { "questions": [...] },
    "ko": { "questions": [...] }
  }
}
```

**CRITICAL STRUCTURE:** The `content` field is keyed by **learning language**:
- `content.en` — questions for users learning English
- `content.ko` — questions for users learning Korean
- `content.es` — questions for users learning Spanish

Each language version has its OWN set of questions with sentences, scrambled words, answers, etc. written IN that language.

**RULE:** Every quiz MUST have all 3 content keys (`en`, `ko`, `es`). Each with:
- `questions[]` — the actual quiz items in that language
- Each question's `hint` — trilingual `{ ko, en, es }` (hint shown in user's native language)
- Each question's `grammarNote` — trilingual `{ ko, en, es }`

#### Example: word_rearrange quiz in all 3 languages
```json
{
  "content": {
    "en": {
      "questions": [{
        "scrambled": ["the", "stones", "protect", "language", "guardian"],
        "answer": "The guardian stones protect language",
        "hint": { "ko": "주어를 먼저 찾으세요.", "en": "Find the subject first.", "es": "Encuentra el sujeto primero." }
      }]
    },
    "es": {
      "questions": [{
        "scrambled": ["las", "piedras", "protegen", "el", "guardianas", "idioma"],
        "answer": "Las piedras guardianas protegen el idioma",
        "hint": { "ko": "형용사는 명사 뒤에.", "en": "Adjectives after nouns.", "es": "Adjetivos después del sustantivo." }
      }]
    },
    "ko": {
      "questions": [{
        "scrambled": ["수호석은", "언어를", "지킨다"],
        "answer": "수호석은 언어를 지킨다",
        "hint": { "ko": "주어 + 목적어 + 동사 순서.", "en": "Subject + Object + Verb order.", "es": "Orden: Sujeto + Objeto + Verbo." }
      }]
    }
  }
}
```

---

### 3. storyData.json — Story Scenes & NPC Data

```json
{
  "id": "ch1_scene1",
  "title": { "ko": "...", "en": "...", "es": "..." },
  "narration": { "ko": "...", "en": "...", "es": "..." },
  "dialogue": [
    {
      "speaker": "rudy",
      "text": { "ko": "...", "en": "...", "es": "..." }
    }
  ],
  "cliffhanger": { "ko": "...", "en": "...", "es": "..." }
}
```

**RULE:** Every text object in storyData.json uses `{ ko, en, es }` keys. Never omit a language.

---

### 4. Daily Course Data (day*_*.ts)

```typescript
interface LessonSentence {
  text: string;           // sentence in the learning language
  speechLang: string;     // e.g., "en-GB", "ko-KR", "es-ES"
  ttsVoice?: string;      // Azure TTS voice name
  meaning: {
    ko: string;           // Korean translation
    en: string;           // English translation
    es: string;           // Spanish translation
  };
  recallRound?: boolean;
}
```

Daily course files have 3 parallel tracks per day:
```typescript
{
  en: { step1: [...], step2: [...], step3: {...}, step4: [...] },
  es: { step1: [...], step2: [...], step3: {...}, step4: [...] },
  ko: { step1: [...], step2: [...], step3: {...}, step4: [...] }
}
```

**RULE:** Each language track (`en`, `es`, `ko`) contains sentences written IN that language, with `meaning` providing translations in all 3 languages.

---

## Checklist for Creating New Content

### Story Scenes (story-scene.tsx)
- [ ] Every `SeqScene` has `text` + `textKo` + `textEs`
- [ ] Every `SeqClue` has `titleEn/Ko/Es` + `descEn/Ko/Es`
- [ ] Every puzzle `Tri` field has `{ en, ko, es }`
- [ ] Puzzle hints have all 3 languages; use `byLearning` if hint differs per learning language
- [ ] Character names are consistent across all 3 languages
- [ ] Rudy calls the player "partner" / "파트너" / "compañero" (NOT "apprentice")

### Quizzes (quizData.json)
- [ ] `title` and `storyContext` have `{ ko, en, es }`
- [ ] `content` has all 3 keys: `en`, `es`, `ko`
- [ ] Each question's `hint` and `grammarNote` have `{ ko, en, es }`
- [ ] Quiz content difficulty matches the chapter's vocabulary range

### Story Data (storyData.json)
- [ ] All text objects use `{ ko, en, es }` keys
- [ ] Spanish text has proper accents (á, é, í, ó, ú, ñ, ü, ¿, ¡)
- [ ] Korean uses natural grammar (not translated from English)
- [ ] NPCs speak consistently in their signature style across all 3 languages

### Daily Courses (day*_*.ts)
- [ ] All 3 language tracks (`en`, `es`, `ko`) are present for every day
- [ ] Every `meaning` object has `{ ko, en, es }`
- [ ] `speechLang` matches the track (en-GB/en-US for English, ko-KR for Korean, es-ES for Spanish)
- [ ] `ttsVoice` is a valid Azure voice for the `speechLang`

---

## Common Spanish Accent Mistakes

Always verify these when writing Spanish content:

| Wrong | Correct | Context |
|---|---|---|
| avion | avión | airplane |
| telefono | teléfono | telephone |
| donde | dónde | where (interrogative) |
| anos | años | years |
| que | qué | what (interrogative) |
| como | cómo | how (interrogative) |
| esta | está | is (verb estar) |
| estacion | estación | station |
| cafe | café | coffee/cafe |
| tambien | también | also |
| mas | más | more |
| aqui | aquí | here |
| despues | después | after |
| ingles | inglés | English |
| companero | compañero | partner |
| pronunciacion | pronunciación | pronunciation |
| Seul | Seúl | Seoul |

**Note:** `esta` (this/feminine) vs `está` (is/estar) — context matters.

---

## Vocabulary Rules by Chapter (Story Mode)

| Chapter | Max Vocabulary Range | Source |
|---|---|---|
| Ch1 London | Day 1-6 only | Greetings, self-intro, survival |
| Ch2 Madrid | Day 1-18 | + numbers, food, ordering |
| Ch3 Seoul | Day 1-30 | + directions, transport, social |
| Ch4 Cairo | Day 1-48 | + negotiation, advanced phrases |
| Ch5 Babel | Day 1-60 | Full range |

**80/20 Rule:** Each quiz should be ~80% known vocabulary + ~20% guessable from context.

---

## NPC Signature Expressions (Idiom System)

Each NPC has a signature expression style that must appear in ALL 3 languages:

| NPC | Style | EN | ES | KO |
|---|---|---|---|---|
| Tom | Street slang | "Break a leg!" | "¡Mucha mierda!" | "화이팅!" |
| Don Miguel | Wisdom proverbs | "Every cloud has a silver lining" | "No hay mal que por bien no venga" | "전화위복" |
| Isabel | Passion/direct | "Go for it!" | "¡Dale!" | "해봐!" |
| Minho | Trendy/internet | "That's fire!" | "¡Está brutal!" | "JMT (존맛탱)" |
| Youngsook | Traditional | "A conversation without rice is like a map without streets" | "Una conversación sin arroz es como un mapa sin calles" | "밥 없는 대화는 지도 없는 길 같단다" |
| Mr. Black | Weaponized beginner vocab | Uses ONLY Day 1 vocabulary in all languages |

---

## File Reference

| File | Format | Language Keys |
|---|---|---|
| `app/story-scene.tsx` | TypeScript (inline STORIES) | `text/textKo/textEs` for scenes; `Tri { en, ko, es }` for puzzles |
| `data/storyData.json` | JSON | `{ ko, en, es }` for all text |
| `data/quizData.json` | JSON | `{ ko, en, es }` for meta; `content.en/es/ko` for questions |
| `data/dailyCourse/day*.ts` | TypeScript | `en/es/ko` tracks; `meaning { ko, en, es }` |
| `components/RudyGuideModal.tsx` | TypeScript | `{ korean, english, spanish }` keys |
| `context/LanguageContext.tsx` | TypeScript | `NativeLanguage = "korean" \| "english" \| "spanish"` |
