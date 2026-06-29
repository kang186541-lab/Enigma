# Program-Level Competitor Review - 2026-06-29

Scope: local/installed program inspection only. No web-search product claims are used in this revision.

> **Strategy framing (2026-06-29):** The strategic axis is the **B2B2C teacher/assignment wedge** (see `COMPETITOR_CROSS_REVIEW_2026-06-29.md`). The "first-use compression / onboarding" recommendations below are a **conversion-rate hypothesis that supports that spine — not a separate B2C bet.** Treat the onboarding/first-session changes as design hypotheses to instrument, not proven growth facts.

## Installed / Runnable Surfaces Checked

### Duolingo

- Windows app shortcut: `Duolingo App.lnk`
- Windows package: `D5EA27B7.Duolingo-LearnLanguagesforFree_yx6k7tf7xvsea!App`
- Prior package inspection showed it is an Edge PWA wrapper, not a native local course engine.
- First screen observed: big Duolingo character art, one green `Start` CTA, existing-account CTA, language selector row at the bottom.
- Screenshot evidence: `C:\Users\Admin\AppData\Local\Temp\duolingo_pwa_screen.png`

### Speak

- BlueStacks Android app shortcut: `스픽 - BlueStacks App Player 1.lnk`
- Package: `com.selabs.speak`
- Observed pre-account onboarding only. I did not perform account creation or credential entry.
- Flow observed:
  - Slide 1: traditional classes reduce speaking time.
  - Slide 2: Speak solves this by making the learner actually speak.
  - Slide 3: "1,000 sentences per week" promise.
  - Then account creation wall.
- Screenshot evidence:
  - `C:\Users\Admin\AppData\Local\Temp\speak_launch.png`
  - `C:\Users\Admin\AppData\Local\Temp\speak_after_win_click.png`
  - `C:\Users\Admin\AppData\Local\Temp\speak_onboarding_2.png`
  - `C:\Users\Admin\AppData\Local\Temp\speak_onboarding_3.png`

### Malhaeboca / Epop

- BlueStacks Android app shortcut: `말해보카 - BlueStacks App Player 1.lnk`
- Main package: `kr.epopsoft.word`
- Dictionary package also installed: `kr.epopsoft.sd`
- Flow observed:
  - Home has one dominant `Vocabulary Learning` card.
  - Daily goal is explicit: 20 words.
  - Streak is visible above the main card.
  - First-run tutorial points directly at the `Start` button.
  - Before learning, it asks a short personalization sequence:
    - Why are you learning English?
    - Do you prefer small daily practice or a larger batch?
    - Do you prefer careful explanation or faster progress?
- Screenshot evidence:
  - `C:\Users\Admin\AppData\Local\Temp\malhae_launch_now.png`
  - `C:\Users\Admin\AppData\Local\Temp\malhae_goal_question.png`
  - `C:\Users\Admin\AppData\Local\Temp\malhae_goal_next.png`
  - `C:\Users\Admin\AppData\Local\Temp\malhae_style_next.png`

### LinguaAI

Relevant code inspected:

- `app/onboarding.tsx:175-179` already stores native language, learning language, and learning goal selections.
- `app/onboarding.tsx:192-195` previews the first speaking mission phrase once language and goal are chosen.
- `app/onboarding.tsx:246-322` saves language/goal, tracks first speaking start, and routes unfamiliar-script learners through a first-sentence intro or basics path.
- `app/(tabs)/index.tsx:386-389` gates the home page around the daily speaking mission until the speaking goal is met.
- `app/(tabs)/index.tsx:636-732` renders the dominant daily speaking card.
- `app/(tabs)/index.tsx:735-760` hides secondary practice surfaces behind an expandable gate when the user has not completed speaking.

Local static `dist` served over Python returned HTTP 200, but Edge headless capture stayed blank/connection-reset in repeated attempts. I am not treating that as a product bug yet because the failure may be caused by the headless capture setup. It needs a normal-browser console check before filing.

## Blunt Comparison

### Duolingo: strongest at "one obvious beginning"

Duolingo's installed app is technically thin, but its first screen is not confused:

- One big friendly illustration.
- One green start button.
- Existing-account button.
- Language row visible.

LinguaAI has more learning machinery, but Duolingo wins the first 10 seconds because the learner does not need to understand the app structure.

### Speak: strongest at "one pain, one promise"

Speak does not introduce features first. It sells one pain:

> You do not get enough speaking time.

Then it sells one promise:

> Speak a lot, immediately.

LinguaAI has a similar direction now through the daily speaking card, but it still risks feeling like a feature-rich learning hub unless the first session keeps everything behind the first spoken sentence.

### Malhaeboca: strongest onboarding pattern for LinguaAI to copy

Malhaeboca is the most useful reference for LinguaAI, more than Duolingo or Speak.

It does three things very well:

1. It has one dominant home action.
2. It makes the daily target concrete (`20 words`).
3. It personalizes before the first lesson with very short questions.

LinguaAI already has the ingredients:

- Daily speaking goal.
- First sentence mission.
- Learning goal storage.
- Rudy guidance.
- SRS and story follow-up.

But Malhaeboca makes the learner feel the system is personal before the first exercise. LinguaAI should make that feeling stronger.

## What LinguaAI Already Does Better

LinguaAI is not just behind. It has real advantages:

- Better multi-surface learning engine than Duolingo's Windows shell.
- Speaking, STT/TTS, pronunciation, SRS, NPC, story, and teacher dashboard are integrated in one product.
- Trilingual/multilingual direction is materially different from Speak's Korean-to-English focus.
- Story speaking is the strongest differentiated surface. Neither Speak nor Malhaeboca gives a Layton/Ace-Attorney-style story context around speaking.

The issue is not capability. The issue is first-use compression.

## Main Gaps

### P0 - First session still needs to feel like one promise

The first session should not feel like:

> Here are the app's features.

It should feel like:

> Rudy will get one real sentence out of your mouth in 5 minutes.

Everything else should appear after that first speaking win.

The home code already moves in this direction, but this must be visually verified in the deployed app.

### P0 - Add Malhaeboca-style learning-style choice

LinguaAI asks learning goal, but Malhaeboca also asks learning style:

- careful / detailed
- fast / many examples

That is a good fit for LinguaAI because Rudy can change coaching tone:

- careful: more explanation, phoneme detail, slower progression
- fast: shorter hints, more speaking reps, fewer explanations

Suggested storage:

- `learner_profile.learningStyle = "careful" | "fast"`

Suggested use:

- Rudy coaching copy
- first-sentence intro length
- daily speaking mission density

### P1 - Make the daily target as concrete as Malhaeboca

Malhaeboca says `20 words`.

LinguaAI should say something equally concrete:

- `Today: say 5 sentences`
- `1/5 spoken`
- `Next: repeat once with Rudy`

The code already has `SPEAKING_DAILY_GOAL`, but the deployed UI must make it as obvious as Malhaeboca's daily target.

### P1 - Keep the story advantage, but do not lead with all story complexity

The story mode is LinguaAI's best moat, especially after the new visual upgrades.

But the first-time user should not be asked to understand:

- Story mode
- Rudy's Training Camp
- NPC missions
- Cards
- Writing
- Teacher dashboard

First use should be:

1. Pick language.
2. Pick reason.
3. Pick style.
4. Speak one sentence with Rudy.
5. Then show story/training/review as the path forward.

### P1 - Packaging is still weaker than Duolingo

Duolingo's Windows app is a PWA wrapper, but it has strong app identity:

- app window
- splash/icon/tile assets
- store presence
- obvious launch point

LinguaAI still needs:

- PWA manifest
- service-worker app shell
- correct web title/metadata
- 192/512/maskable icons
- Windows tile assets if desktop distribution matters

## Recommended Next Sprint

### Sprint: First-Use Compression

Goal: make LinguaAI feel as immediately focused as Speak and as personalized as Malhaeboca, without violating the trilingual/story-first product philosophy.

1. Add one `learningStyle` onboarding step:
   - careful
   - fast

2. Make the first session sequence fixed:
   - native language
   - learning language
   - goal
   - style
   - first sentence

3. Make home visually enforce one daily action:
   - one hero card only until `5/5` spoken
   - secondary surfaces collapsed
   - story/training/review shown as the next step after the speaking goal

4. Add a lightweight visual proof pass:
   - fresh user
   - logged-in user with progress
   - mobile width
   - desktop width

5. Then return to PWA packaging:
   - manifest
   - service worker
   - icons/tile matrix

## Do Not Copy

Do not copy Duolingo's full course-map strategy. LinguaAI cannot win by becoming a smaller Duolingo.

Do not copy Malhaeboca's pure vocabulary identity. LinguaAI's advantage is spoken sentence + story/NPC context, not word-volume alone.

Do not copy Speak's account wall before value if avoidable. Let the learner speak once before asking for commitment whenever possible.

## Final Verdict

The most useful competitor lesson from actual installed-app inspection is:

> Malhaeboca owns diagnostic personalization. Speak owns sharp speaking promise. Duolingo owns packaging and first-screen simplicity.

LinguaAI's best version should combine:

- Speak's one-promise clarity
- Malhaeboca's short personalization
- Duolingo's installable shell polish
- LinguaAI's own story + Rudy + multilingual speaking engine

The next product improvement should not be "more features." It should be:

> one cleaner first-use path that gets the learner to one spoken sentence, then personalizes the rest.

## LLM Cross-Review

DeepSeek and GLM were asked to adversarially review this report using only the installed-app observations above, not web claims.

### DeepSeek Review Summary

DeepSeek agreed that the main recommendation is directionally right, but said the evidence is not yet strong enough to treat it as proven.

Strongest DeepSeek critique:

- The report observes first screens and onboarding flows, but does not measure retention, conversion, or long-term learning behavior.
- "Speak's one-pain/one-promise strategy works" is a plausible design inference, not proven from the local inspection alone.
- "Malhaeboca's learning-style question improves retention" is also an inference; we only know it exists.
- "LinguaAI story mode is the strongest moat" needs direct user behavior evidence or a closer competitor feature comparison.

DeepSeek still ranked the same top product changes:

1. Lock first use around one spoken sentence.
2. Add learning-style personalization.
3. Make the daily goal numerically concrete.

### GLM Review Summary

GLM mostly agreed with the recommendation and reframed the competitor strengths:

- Malhaeboca: diagnostic personalization.
- Speak: sharp value proposition.
- Duolingo: first-screen simplicity and packaging polish.

GLM's recommended path matched the report:

1. Native language -> learning language -> goal -> style -> first spoken sentence.
2. Hide secondary features until the first spoken sentence is completed.
3. Add daily progress such as `Today: say 5 sentences`.
4. Improve PWA packaging after the first-use path is tightened.

### Cross-Review Verdict

The recommendation is good enough for a product sprint, but should be framed as a design hypothesis, not a proven growth fact.

The safest next sprint is therefore:

> Build the cleaner first-use path, instrument it, then compare first-sentence completion and next-day return.

Metrics to add before judging success:

- onboarding_started
- goal_selected
- learning_style_selected
- first_sentence_started
- first_sentence_completed
- day_1_return
- day_3_return

> **Metric-name reconciliation (2026-06-29):** the names above are aspirational. Actual taxonomy in `lib/learningEvents.ts:6` differs — `first_sentence_completed` → `first_speaking_attempt_completed`; `goal_selected` → `learning_goal_selected`; `onboarding_started` → `onboarding_first_speaking_started`; `learning_style_selected` does **not exist yet** (add to taxonomy + whitelist when learningStyle ships); `day_1_return`/`day_3_return` are server/dashboard-computed (cohort summary), not client events.

## Live Pipeline Audit (Supabase, 2026-06-29)

The completion-event chain was traced end-to-end. Evidence, not estimate:

- **Emit code present** in source (`app/rudy-lesson.tsx:181`, story/NPC/escape) AND in the **deployed bundle** (`activity_completed`, `recordRemoteEvent` found in the live `web-dist2` entry bundle).
- **Remote write requires a signed-in user** — `lib/learningMetrics.ts:39` returns early without an auth uid; RLS rejects anon. The authed-write path works: the 20 existing `first_speaking_*` rows were written by a real signed-in session (2026-06-18). Insert target is `linguaai_learning_events` (`lib/learningMetrics.ts:51`).
- **Server aggregation** (`server/routes.ts`) counts `activity_completed` by `props.activityType` for cohort members → `activityTotals`; **teacher dashboard renders it** (`app/teacher-dashboard.tsx:649`, daily/npc/story/escape).
- **Read/aggregation proven 0→1 by a REAL DB run on live Supabase** (project `atydkhvemgsrtjthxkwk`), executed and returned:
  1. seed → `{status:"seeded", test_user:"ae9ba890-…"}`
  2. aggregate (teacher-summary logic) → `{cohort_members:1, daily_completed:1, total_completed:1}`
  3. cleanup → `{events:20, members:0, activity_completed:0}` (baseline restored, no residue)
- **Verdict: the pipeline is NOT broken.** Live `activity_completed = 0` only because no signed-in user has *completed* a rudy/story/NPC/escape activity since the emit shipped, and `cohort_members = 0` (no enrollment).
- **Only remaining unproven link:** a real signed-in user completing an activity in the app UI → `activity_completed` actually fires to Supabase (live smoke test). Code/deploy/aggregation/dashboard links are all proven. Do this smoke stamp before building `learningStyle`.
