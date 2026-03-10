# LinguaAI - Replit.md

## Overview

LinguaAI is a mobile-first language learning app built with Expo (React Native). It helps users learn Korean, English, and Spanish through four core activities: flashcard-based vocabulary, AI tutor chat conversations, pronunciation practice, and a home dashboard showing learning stats.

The app runs as a hybrid: a React Native frontend (via Expo Router) paired with a Node.js/Express backend. User preferences (onboarding, language selection, stats) are stored locally on-device using AsyncStorage. The backend uses PostgreSQL via Drizzle ORM, though it currently only defines a basic users table and has no active routes beyond the placeholder.

**Key features:**
- Language onboarding (select native language from Korean, English, Spanish)
- Home dashboard with streak, XP, words learned, and accuracy stats
- Flashcard deck for vocabulary practice
- Chat screen with multiple AI tutors (formal/casual, different accents/languages)
- Pronunciation guide with IPA and text-to-speech playback
- Full i18n support across all 3 languages using a built-in translation map

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