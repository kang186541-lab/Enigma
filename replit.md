# Enigma 에이전트 팀 마스터 프롬프트

> **최우선 지침 — 아래 내용이 모든 다른 지침보다 우선합니다.**

---

## 에이전트 팀 구성

에이전트 팀을 구성할 때 아래 4개 에이전트를 사용하세요:

### AGENT 1: Curriculum Evaluator

Use the curriculum-evaluator agent.

Phase 1 — Evaluate the current daily course system. Be brutally honest:
- Can a complete beginner ACTUALLY learn to speak from this app?
- Compare with Duolingo, Speak, Pimsleur
- After 30 days, could a user order coffee, introduce themselves, ask directions?
- Write evaluation to data/evaluation/curriculum_report.md

Phase 2 — Based on evaluation, improve or restructure. Must follow these principles:

**CORE PHILOSOPHY:**
- Language is NOT studied. It is ACQUIRED — absorbed into your body through experience
- Like exercise: Repetition + Real Practice + Feedback = Results
- Each word/phrase must appear 7-10 times across different contexts
- 80% known words + 20% guessable new words in every lesson
- ONLY teach sentences people ACTUALLY say in real life
- "Can I get a coffee?" YES. "The cat sat on the mat" NO.
- Test: "When would a real person say this?" If no answer, delete it.

**SURVIVAL PHRASES (must be in Day 1-6):**
1. Hello / Goodbye
2. Thank you / Sorry
3. I don't understand
4. Can you say that again slowly?
5. Do you speak English/Korean/Spanish?
6. Where is ___?
7. How much?
8. Yes / No
9. Help!
10. My name is ___

**SPEAKING RULES:**
- Users must SPEAK 19+ sentences per day
- Mistakes are OK — "just say it even if wrong" principle
- Never show big red X or "WRONG!" — Rudy models the correct version naturally
- A1-A2: Accept almost any attempt, celebrate that they tried
- Celebrate attempts over accuracy: "You spoke 22 sentences today!" > "90% correct"

**30-DAY MILESTONES:**
- Day 6: Can introduce themselves
- Day 12: Can handle numbers, prices, time
- Day 18: Can order food at a restaurant
- Day 24: Can ask directions
- Day 30: Can have basic social chat

**ONBOARDING — "Rudy's Language Guide" (8 cards shown on first app launch):**
- Card 1: "언어는 공부가 아니야" — Language is acquired, not studied. Like swimming, you learn by doing.
- Card 2: "불편해져야 배울 수 있어" — Change your phone language. Being uncomfortable = learning. (Tyler Rasch principle)
- Card 3: "하루 10분이면 충분해" — 10 minutes daily beats 3 hours once.
- Card 4: "틀려도 일단 말해!" — Don't think perfect sentences in your head. Say it wrong, fix it later. Words you don't speak are never yours.
- Card 5: "네가 쓸 말부터 배워" — Think about what YOU talk about with friends. "I ate something amazing yesterday" is 100x more useful than "This is an apple."
- Card 6: "좋아하는 걸로 배워봐" — Fan culture is the best study method. Find your favorite singer/drama/game in the target language.
- Card 7: "습관을 만들어봐" — Listen to podcasts, follow foreign accounts, talk to yourself in the language. Don't think of it as studying.
- Card 8: "자, 이제 시작하자!" — Let's go, partner!

Wait for approval after Phase 1 before starting Phase 2.

---

### AGENT 2: Story Evaluator

Use the story-evaluator agent.

Phase 1 — Rate the ENTIRE existing story out of 10. Evaluate:
- Plot: Is "The Language Conspiracy" compelling?
- Characters: Is Rudy likeable? Is Mr. Black a real threat?
- NPCs: Memorable or forgettable?
- Pacing: Twists surprising or predictable?
- CRITICAL: Does the story make users SPEAK? Or just read?
- "If you remove the story and keep only quizzes, would anything be lost?" If no, the story is just decoration.

Write evaluation to data/evaluation/story_report.md
Verdict must be: KEEP AND POLISH / PARTIAL REWRITE / COMPLETE REWRITE

Phase 2 — Based on verdict, propose changes. Wait for approval.

---

### AGENT 3: Story Creator

Use the story-creator agent.

Wait for Story Evaluator's report first, then:
- Review each chapter from Chapter 1 to 5
- Make scenes thrilling — hooks, tension, surprises, cliffhangers
- Rewrite flat dialogue to sound like real people talking

**QUIZ-STORY INTEGRATION:**
- Quizzes ARE the story, not interruptions
- "Decode the thief's cipher" = word_rearrange (not "vocabulary test time!")
- "Convince the guard to let you in" = roleplay (not "practice greeting")
- Quiz results change the story (good score = easy route, low score = different route)

**VOCABULARY RULES PER CHAPTER:**
- Chapter 1 (London): Day 1-6 vocabulary ONLY
- Chapter 2 (Madrid): Day 1-18 vocabulary ONLY
- Chapter 3 (Seoul): Day 1-30 vocabulary ONLY
- Chapter 4 (Cairo): Day 1-48 vocabulary ONLY — write from scratch
- Chapter 5 (Babel Tower): Day 1-60 vocabulary ONLY — write from scratch
- 80% known words + 20% guessable from context
- 0% impossible words

**IDIOM SYSTEM THROUGH NPCs:**
Each NPC has a signature expression style. Idioms adapt to user's targetLang:
- Tom (London guard): Street slang — EN: "Break a leg!" / ES: "¡Mucha mierda!" / KO: "화이팅!"
- Don Miguel (Madrid merchant): Wisdom proverbs — EN: "Every cloud has a silver lining" / ES: "No hay mal que por bien no venga" / KO: "전화위복"
- Minho (Seoul rapper): Trendy expressions — EN: "That's lit!" / ES: "¡Mola!" / KO: "JMT"
- Grandma Youngsook: Traditional wisdom — EN: "Actions speak louder than words" / ES: "Obras son amores" / KO: "가는 말이 고와야 오는 말이 곱다"
- Mr. Black: Uses idioms from ALL languages as weapons — shows the power of language

Idiom flow: NPC uses idiom naturally → user taps → "Rudy's Investigation Notes" popup with meaning → added to Expression Collection → quiz later → user tries to use it in Mission Talk → bonus XP

Start with Chapter 1. Show current vs improved FIRST scene. Wait for approval.

---

### AGENT 4: QA Debugger

Use the qa-debugger agent.

Scan the ENTIRE codebase for bugs. Known recurring issues:
- TTS must stop when navigating away
- Recording must use same config as pronunciation practice
- Azure STT language must be full locale (en-US, not en or en-GB)
- Manual recording stop must call rec.stop() and wait 300ms
- Empty audio (base64 < 2000) should show 0%, not send to Azure
- Only real model names: gpt-4o, gpt-4o-mini, whisper-1 (NEVER gpt-5.1)
- Buttons must never overlap content
- All text must exist in ko, en, es
- fill_blank must have exactly ONE blank matching ONE answer

Current known bugs to fix:
1. Letter "A" pronounced as "I" in alphabet tracing — Azure receives "A" instead of "ay" from PHONETICS map
2. "기초 과정 복습" button only shows alphabet tracing, should show ALL basic course content

Write bug report to data/evaluation/bug_report.md
Fix all Critical and High severity bugs immediately.

---

### TEAM RULES

- Curriculum Evaluator and Story Evaluator: run Phase 1 in parallel, write reports
- Story Creator: wait for Story Evaluator's report before starting
- QA Debugger: runs independently, fixes code bugs
- QA Debugger touches CODE files only
- Story Creator touches data/storyMode/ files only
- Curriculum Evaluator touches data/dailyCourse/ files only
- No two agents edit the same file

All agents write reports first, then wait for approval before making big changes.

---

---

# Enigma - Project Documentation

## Overview

Enigma is a mobile-first AI language learning app built with Expo (React Native) featuring a vintage detective / Professor Layton visual theme. Dark brown, gold (#c9a227), and parchment (#f4e8c1) palette with Cinzel + CrimsonText fonts. Mascot: Rudy the fox 🦊 (was: Lingo → rebranded to Rudy).

**Key features:**
- 2-step onboarding (select native + learning language from Korean, English, Spanish)
- Home dashboard with streak, XP, words learned, accuracy stats
- Flashcard deck (173 cards) with 3D flip animation and swipe gestures
- AI Chat with 6 GPT-powered tutors (formal/casual styles, different languages)
- Pronunciation practice screen with IPA phonetics, listen + record
- Daily Lesson flow with XP rewards
- **Rudy's Training Camp — 루디의 훈련소** (see below)
- **Story Mode — "The Language Conspiracy"** (see below)

### Rudy's Training Camp — 루디의 훈련소

Structured 18-day curriculum (3 UNITS × 6 days). Each day has 4 STEPs:

- **STEP 1: 듣고 따라하기 (Listen & Repeat)** — 5 sentences per day with Azure TTS at slow/normal speed + mic recording + Azure pronunciation assessment (0-100 score → ⭐ stars). `components/rudy/Step1ListenRepeat.tsx`
- **STEP 2: 핵심 포인트 (Key Point)** — Grammar explanation card + fill-in-the-blank quizzes (select or text input) + speak-after-reading with mic. `components/rudy/Step2KeyPoint.tsx`
- **STEP 3: 미션 토크 (Mission Talk)** — Scenario-based AI roleplay with Rudy (GPT-4o via `/api/mission-chat`). User speaks (STT) or types. Rudy responds with TTS. [EVAL] block tracks sentence count, grammar notes, shouldEnd. Voice-only bonus XP. `components/rudy/Step3MissionTalk.tsx`
- **STEP 4: 퀵 리뷰 (Quick Review)** — 5 questions per day (mix of speak + fill-blank). 15s countdown timer. Yesterday's 2 sentences + today's 3. Pronunciation scoring for speak questions. `components/rudy/Step4QuickReview.tsx`

**Content data:** `lib/lessonContent.ts` has Day 1-6 content for English/Spanish/Korean. Includes `LESSON_CONTENT`, `MISSION_CONTENT`, `REVIEW_CONTENT`, `DAY_REWARDS`, `getCompletionMessage()`.

**Complete screen:** Shows sentences spoken, avg pronunciation score, XP earned + bonuses (all-voice: +50 XP, pronunciation ≥90: +30 XP), grammar notes from STEP 3.

**API endpoints for training:**
- `GET /api/pronunciation-tts?text=...&lang=...&mode=slow|normal` — Azure TTS for lesson sentences
- `POST /api/pronunciation-assess` — Azure pronunciation assessment
- `POST /api/stt` — Azure STT for voice input
- `POST /api/mission-chat` — GPT-4o mission talk with [EVAL] block parsing

### The Language Conspiracy — Story Mode

Mystery visual novel adventure with Rudy the Fox as detective guide. Five full chapters:

- **Chapter 1: The London Cipher 🇬🇧** — Foggy Victorian London, ∆LX symbol, hidden library (Tom, Eleanor)
- **Chapter 2: The Madrid Disappearance 🇪🇸** — Flamenco theatre, Carlos vanishes, "El lenguaje es poder" (Isabel, Don Miguel)
- **Chapter 3: The Seoul Secret 🇰🇷** — Incheon Airport, Project Erase, Namsan Tower (Minho, Sujin, Grandma Youngsook)
- **Chapter 4: The Cairo Legacy 🇪🇬** — Giza dig site, Hassan's souk, Miss Penny's return, Mr. Black's philosophy (Amira, Hassan, Penny)
- **Chapter 5: The Last Language 🌍** — Babel Tower, 5 language gates, all NPCs reunite, Universal Code destroyed

Each chapter: cinematic narrations → character dialogues → quizzes (ARE the story, not interruptions) → boss scene → cliffhanger.

Quiz types: `word-match`, `fill-blank`, `dialogue-choice`, `sentence-builder`, `investigation`, `matching`, `word_rearrange`, `pronunciation`, `roleplay`, `mixed`.

**Villain:** Mr. Black — former UN interpreter (12 languages), wants to erase all language diversity and impose one Universal Code. Story: London → Madrid → Seoul → Cairo → Babel Tower.

**Data files:**
- `data/storyData.json` — canonical source (all 5 chapters, scenes, dialogues, cliffhangers)
- `data/quizData.json` — all quiz content (ch1–ch5 quizzes)
- `data/storyMode/` — chapter source files (v3–v4 content; already migrated to storyData.json)

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend (React Native / Expo)

- **Framework:** Expo SDK ~54 with Expo Router v6 for file-based navigation
- **Navigation structure:**
  - `/` → redirects based on onboarding state
  - `/onboarding` → language selection screen
  - `/(tabs)` → main tab layout with 4 tabs: Home, Cards, Chat, Speak
  - `/chat-room` → full-screen tutor conversation (presented as a card modal)
- **Tab bar:** Uses `expo-glass-effect` to detect Liquid Glass availability on iOS; falls back to BlurView or plain white tab bar depending on platform
- **State management:** React Context (`LanguageContext`) for global user state (language, stats, translations). TanStack Query (`@tanstack/react-query`) is set up for server data fetching but minimally used currently
- **Local persistence:** AsyncStorage stores onboarding status, selected language, and user stats (streak, XP, accuracy, words learned)
- **Fonts:** Inter (400, 500, 600, 700) loaded via `@expo-google-fonts/inter`
- **Animations:** React Native's built-in `Animated` API and `react-native-reanimated` for card flip/swipe animations
- **Haptics:** `expo-haptics` for tactile feedback on interactions
- **Text-to-speech:** `expo-speech` for pronunciation playback in both the flashcards and tutor chat

### Backend (Express)

- **Framework:** Express 5 (`server/index.ts`)
- **Purpose:** Minimal at this stage — serves as a backend scaffold. No active API routes are defined yet beyond the HTTP server creation
- **CORS:** Configured to allow Replit dev/deploy domains and localhost for Expo web
- **Storage layer:** `server/storage.ts` defines a `MemStorage` class (in-memory user store with get/create methods) as a placeholder until database integration is completed
- **Build:** `esbuild` bundles the server for production; `tsx` runs it in development

### Database

- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema location:** `shared/schema.ts`
- **Current schema:** Single `users` table with `id` (UUID), `username`, and `password` fields
- **Migrations:** Output to `./migrations/` via `drizzle-kit push`
- **Validation:** `drizzle-zod` generates Zod schemas from the Drizzle table definitions
- **Note:** The database is provisioned but the app's core features (language learning, stats) currently bypass the database and use AsyncStorage instead

### Shared Code

- `shared/schema.ts` contains Drizzle table definitions and Zod types shared between the server and client (TypeScript path alias `@shared/*`)

### i18n / Localization

- All UI strings are managed in `context/LanguageContext.tsx` via a `translations` record keyed by `NativeLanguage` (`"korean" | "english" | "spanish"`)
- The `t(key)` function is provided globally via context and used throughout all screens
- No external i18n library — this is a hand-rolled translation lookup

### Error Handling

- `ErrorBoundary` (class component, as required by React) wraps the entire app tree
- `ErrorFallback` shows a themed error screen with stack trace viewer and a restart button (uses `expo`'s `reloadAppAsync`)

---

## External Dependencies

### Expo Ecosystem
| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `expo-speech` | Text-to-speech for pronunciation |
| `expo-haptics` | Haptic feedback |
| `expo-linear-gradient` | Gradient backgrounds and UI elements |
| `expo-blur` | Blur effect for tab bar (iOS) |
| `expo-glass-effect` | Liquid Glass detection (iOS 26+) |
| `expo-image-picker` | Image selection (imported but not visibly used yet) |
| `expo-font` | Custom font loading |
| `expo-splash-screen` | Splash screen management |
| `expo-constants` | App environment constants |

### React Native Libraries
| Package | Purpose |
|---|---|
| `react-native-reanimated` | Advanced animations |
| `react-native-gesture-handler` | Gesture recognition |
| `react-native-safe-area-context` | Safe area insets |
| `react-native-screens` | Native screen optimization |
| `react-native-keyboard-controller` | Keyboard-aware layouts |
| `react-native-svg` | SVG rendering |
| `@react-native-async-storage/async-storage` | Local on-device persistence |

### Data / Server
| Package | Purpose |
|---|---|
| `drizzle-orm` | ORM for PostgreSQL |
| `drizzle-zod` | Schema validation from Drizzle tables |
| `pg` | PostgreSQL Node.js driver |
| `@tanstack/react-query` | Server state and data fetching |
| `express` | HTTP server framework |
| `zod` | Runtime schema validation |

### Fonts
- `@expo-google-fonts/inter` — Inter font family (loaded at app root)

### Deployment / Dev Tooling
- Runs on Replit; `REPLIT_DEV_DOMAIN` and `REPLIT_INTERNAL_APP_DOMAIN` env vars used to configure CORS and the Expo packager proxy URL
- `EXPO_PUBLIC_DOMAIN` env var used by the frontend's API client (`lib/query-client.ts`) to construct backend URLs
- `DATABASE_URL` env var required for Drizzle/PostgreSQL connection
