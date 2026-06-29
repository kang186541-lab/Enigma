# LinguaAI Competitor Cross Review - 2026-06-29

> **Strategy framing (2026-06-29):** This document holds the strategic axis — the **B2B2C teacher/assignment wedge** (see Verdict). The "first-use compression / onboarding" changes in `PROGRAM_LEVEL_COMPETITOR_REVIEW_2026-06-29.md` are a **conversion-rate hypothesis that supports this spine, not a competing B2C bet.**

## Scope

Compared LinguaAI against Duolingo, Speak, and Malhaeboca/Epop using:

- Official public sources and live HTTP checks.
- The local LinguaAI repo/runtime surface at `web-dist2.vercel.app`.
- Installed-app state on this PC: Duolingo Windows app installed. **(Correction 2026-06-29:** Speak and Malhaeboca were *later* installed and program-inspected via BlueStacks Android — `com.selabs.speak` and `kr.epopsoft.word` (+ dictionary `kr.epopsoft.sd`). This cross-review predates that install; **`PROGRAM_LEVEL_COMPETITOR_REVIEW_2026-06-29.md` is the latest authoritative installed-app inspection.**)
- Cross-review by DeepSeek and GLM using the user's local Desktop API keys. Keys were used only for API calls and were not printed.

Limit: competitor lesson internals were not inspected behind login/paywalls. This review uses public official surfaces plus our code/runtime evidence.

## Official Source Notes

- Duolingo Max official blog: AI-backed subscription features, including GPT-backed learning features.
  Source: https://blog.duolingo.com/duolingo-max/
- Duolingo Video Call official blog: AI-powered realistic conversation practice.
  Source: https://blog.duolingo.com/video-call/
- Duolingo for Schools official site: classroom-facing product surface.
  Source: https://schools.duolingo.com/
- Speak official site: positions itself as the language learning app that gets users speaking; its web app metadata emphasizes interactive lessons where users speak out loud with speech-recognition AI.
  Source: https://www.speak.com/ and https://app.speak.com/
- Malhaeboca/Epop official site: positions around words becoming speech, with a vocabulary-first Korean-market promise.
  Source: https://epop.ai/

## LinguaAI Evidence Checked

Runtime:

- `https://web-dist2.vercel.app/` -> HTTP 200.
- `https://web-dist2.vercel.app/story` -> HTTP 200.
- `https://web-dist2.vercel.app/teacher-dashboard` -> HTTP 200.

Repo evidence:

- `package.json:17-27` has the quality gate covering web build, speaking core, language copy/UI, story intro/stage/assets, NPC visuals, story quiz/curriculum, escape-room language, web emoji safety, TypeScript, and lint.
- `lib/speakingProgress.ts:36` defines the daily speaking target as 5 sentences.
- `lib/homeSpeakingMission.ts:57-97` builds the home daily speaking mission and completion copy.
- `app/(tabs)/index.tsx:375-436` and `app/(tabs)/index.tsx:721` show home progress and the "say today's real sentences first" framing.
- `app/(tabs)/speak.tsx:2130-2159` continues the daily speaking loop inside the Speak tab.
- `components/rudy/*` and `server/routes.ts` show Azure pronunciation assessment, phoneme coaching, TTS/STT routing, mission chat, and NPC chat surfaces.
- `lib/srsManager.ts:2-12`, `lib/srsManager.ts:169-203`, and `app/(tabs)/cards.tsx:1591-1695` show the Leitner SRS queue and due-card wiring.
- `app/story-scene.tsx:7780-7805` feeds story failure expressions into SRS.
- `server/routes.ts:3385-3952` and `app/teacher-dashboard.tsx:597-630` show the teacher cohort API/dashboard with D1/D7/D30, weekly retention, weekly completion, and risk surfaces.

## Verdict

LinguaAI should not try to be "a better Duolingo" or "a better Speak" as a broad consumer app. That fight is structurally bad.

The realistic winning lane is narrower:

> A speaking-first assignment platform where learners say 5 real sentences daily, get pronunciation feedback, and teachers can prove completion/retention.

This does not throw away story mode. Story, Rudy, NPC, SRS, and escape rooms become reinforcement layers around the same spine:

> Say it today -> get scored -> weak phrase returns tomorrow -> teacher sees proof.

## Competitor Comparison

| Axis | Duolingo | Speak | Malhaeboca/Epop | LinguaAI Current | LinguaAI Best Wedge |
|---|---|---|---|---|---|
| First-session clarity | Very strong: lesson-first habit loop | Very strong: speak-first | Strong: vocabulary/review-first | Medium: many modes | Make "today's 5 spoken sentences" dominate |
| Content depth | Extremely strong | Strong for speaking scenarios | Strong for vocab/review volume | Shallow by comparison | Do not compete on breadth first |
| Speaking feedback | Improving via AI features | Core promise | Secondary | Strong: Azure + phoneme coaching | Make this visible in first 60 seconds |
| Story/game immersion | Strong habit game, Adventures | Weak to medium | Weak | Strong conceptually | Use story as motivation, not primary navigation clutter |
| SRS/review | Strong practice ecosystem | Practice loop, not SRS-first | Strong Korean-market memory loop | Now wired, but scattered | "Yesterday's weak sentence first" |
| Teacher/B2B proof | Duolingo for Schools exists | B2C-heavy | B2C-heavy | Surprisingly concrete dashboard/API | This is the least crowded lane |

## DeepSeek Cross-Review Summary

DeepSeek's harsh conclusion:

- Win lane: B2B/school market, pronunciation coaching, story-linked SRS.
- Cannot win: broad language app, pure speaking-first UX against Speak, vocabulary/grammar volume against Malhaeboca.
- Product spine should be: "Every day, say 5 sentences; tomorrow, repeat what you missed."
- Immediate fixes: simplify home, remove onboarding explanation, show pronunciation feedback instantly, make AI response latency feel safer.
- Medium work: expand story content, improve teacher dashboard recommendations, add free conversation to Rudy camp, personalize SRS intervals, create class challenges.

## GLM Cross-Review Summary

GLM independently matched the same direction:

- LinguaAI can differentiate through daily speaking missions, story/game immersion, and teacher/cohort analytics.
- It cannot catch Duolingo's content/game breadth, Speak's pure speaking speed, or Malhaeboca's vocabulary/review depth quickly.
- Home/onboarding should be dominated by one thing: today's 5 spoken sentences.
- Other modes should be secondary until the daily speaking task is complete.

## Adjudicated Priority List

### 1-week changes

1. Make the home screen visually dominated by one card: "Today's 5 sentences."
2. Move Story/Rudy/NPC/Cards into secondary actions below the daily speaking CTA.
3. After each spoken sentence, show one instant result: score band, weakest sound, retry/next.
4. After the 5th sentence, show a strong completion moment: streak, XP, "tomorrow we'll revisit weak phrases."
5. On the next day, make the first item "yesterday's weak sentence" before new content.
6. Hide empty SRS states from the main home surface. Show SRS only when due or after the daily mission.
7. Add lightweight timing telemetry for AI chat/TTS/STT latency. If response >3s, show a friendly loading line and avoid silent dead air.
8. Keep story mode visible as a reward path, not as a competing first action.

### 1-3 month changes

1. Teacher dashboard: add "action recommendation" per at-risk student, not just metrics.
2. Cohort mode: add weekly class challenge based on spoken-sentence completion and pronunciation improvement.
3. Rudy camp: add a short controlled free-talk step after fixed sentence practice.
4. SRS: personalize review intervals by repeated weak phoneme/phrase pattern, not only Leitner box.
5. Story mode: expand beyond 5 chapters only after the daily speaking loop proves retention.
6. Add a course/content authoring pipeline so daily sentences can scale without hand-editing every path.
7. Use PostHog/Supabase events to measure first utterance, 5-sentence completion, D1, D7, D30, and teacher weekly completion.

## Product Spine Recommendation

The product spine should be:

> "Say 5 real sentences every day. Rudy remembers what you missed."

Concrete flow:

1. Open app.
2. See one sentence.
3. Tap listen.
4. Speak.
5. Get score plus one concrete sound/word fix.
6. Continue until 5.
7. Weak phrases enter tomorrow's first review.
8. Story/Rudy/NPC unlock or get recommended after the core loop.

This keeps the trilingual/multilingual philosophy intact while giving the app one daily behavior.

## Most Important Design Implication

Do not delete Story, Rudy, NPC, Cards, or teacher mode. The app's philosophy is broad, multilingual, and character-driven.

But the user should not have to understand that philosophy before doing the first useful thing.

The first useful thing is:

> Hear one sentence -> say it -> get corrected.

Everything else should orbit that.

## Final Go/No-Go

Current app: promising but over-wide.

Best next version: daily speaking spine first, story/game/B2B proof as reinforcement.

Recommended next implementation sprint:

1. Home hierarchy cleanup around the daily 5-sentence card.
2. First-session/first-sentence flow audit: time to first spoken sentence should be under 30 seconds.
3. Weak-sentence next-day review path.
4. Teacher dashboard action recommendations.
