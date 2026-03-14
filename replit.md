# Enigma - Replit.md

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
- **STEP 3: 미션 토크 (Mission Talk)** — Scenario-based AI roleplay with Rudy (GPT-5.1 via `/api/mission-chat`). User speaks (STT) or types. Rudy responds with TTS. [EVAL] block tracks sentence count, grammar notes, shouldEnd. Voice-only bonus XP. `components/rudy/Step3MissionTalk.tsx`
- **STEP 4: 퀵 리뷰 (Quick Review)** — 5 questions per day (mix of speak + fill-blank). 15s countdown timer. Yesterday's 2 sentences + today's 3. Pronunciation scoring for speak questions. `components/rudy/Step4QuickReview.tsx`

**Content data:** `lib/lessonContent.ts` has Day 1-6 content for English/Spanish/Korean. Includes `LESSON_CONTENT`, `MISSION_CONTENT`, `REVIEW_CONTENT`, `DAY_REWARDS`, `getCompletionMessage()`.

**Complete screen:** Shows sentences spoken, avg pronunciation score, XP earned + bonuses (all-voice: +50 XP, pronunciation ≥90: +30 XP), grammar notes from STEP 3.

**API endpoints for training:**
- `GET /api/pronunciation-tts?text=...&lang=...&mode=slow|normal` — Azure TTS for lesson sentences
- `POST /api/pronunciation-assess` — Azure pronunciation assessment
- `POST /api/stt` — Azure STT for voice input
- `POST /api/mission-chat` — GPT-5.1 mission talk with [EVAL] block parsing

### The Language Conspiracy — Story Mode

Mystery visual novel adventure with Lingo the Fox as detective guide. Three full chapters:

- **Chapter 1: The London Cipher 🇬🇧** — Foggy Victorian London, ∆LX symbol, hidden library  
- **Chapter 2: The Madrid Disappearance 🇪🇸** — Flamenco theatre, Carlos vanishes, "El lenguaje es poder"  
- **Chapter 3: The Seoul Secret 🇰🇷** — Modern skyscraper, Project Erase, Lexicon Society HQ

Each chapter has a sequence of: cinematic narrations → character dialogues → puzzles → clue discoveries → chapter completion (+150 XP).

5 puzzle types: `word-match`, `fill-blank`, `dialogue-choice`, `sentence-builder`, `investigation`. Each puzzle awards +20 XP on solve. Clue reveals show ∆LX / key story artifacts with dramatic animations.

**Villain:** Mr. Black, leader of the Lexicon Society (∆LX symbol). Story progresses London → Madrid → Seoul.

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