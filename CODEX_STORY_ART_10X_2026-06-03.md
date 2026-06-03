# Story Art 10x Review - 2026-06-03

## Goal

Make LinguaAI story mode feel closer to a premium character mystery game while preserving its own identity as a trilingual speaking-learning app.

Important: do not copy Professor Layton or Ace Attorney. Use them only as quality references:

- Professor Layton reference value: warm mystery storybook mood, readable silhouettes, charming oddness, puzzle-world cohesion.
- Ace Attorney reference value: instantly readable character poses, strong emotional beats, memorable courtroom-style expression changes.
- LinguaAI target: warm detective fable + golden language magic + spoken-language learning.

## Agent Findings

### Agent A - Art Direction

Current intro images are strong for a learning app but read as dark AI cinematic concept art, not yet as a fully authored game world. The golden language magic motif works. The main weakness is that most chapters share the same dark-blue/gold treatment, so the world identity can feel one-note.

Score before this pass: 6.5/10 against premium game art, 8/10 against learning apps.

### Agent B - Character Design

Portrait coverage is now good, but personality is still weaker than commercial character games. Most characters are attractive half-body portraits with similar lighting. Ace Attorney-level character work needs stronger silhouettes, signature props, and at least three expression states for main characters.

Priority characters:

1. Rudy - detective guide, mascot, emotional anchor.
2. Mr. Black - villain/wound reveal, strongest dramatic beat.
3. Eleanor - mentor/intellectual mystery anchor.
4. Penny - Babel guide/final-chapter warmth.
5. Isabel - Madrid energy, easiest to make visually memorable.

### Agent C - Mobile UX

The asset quality is partly hidden by presentation. Intro start previously opened on a dark ready overlay instead of showing the first visual shot. Dialogue portraits were too small and card-like, and the speaker tag still depended on emoji even when a portrait existed. On web, emoji can degrade into square glyphs, so image-led presentation should avoid emoji in premium story scenes.

## Code Changes In This Pass

### `components/story/StoryIntroMotionComic.tsx`

- Ready state now shows the first intro shot as a cinematic backdrop instead of a mostly dark start screen.
- Intro shots now use softer cinematic gradients, a warm art glow, and a subtle panel border.
- Vignette darkness was reduced so image detail reads better on mobile.
- Final dialogue portrait is larger and less buried under black overlay.

Review focus:

- Does the start screen now feel like a story/game moment before the user taps Start?
- Are darker shots still readable on mobile?
- Does the warm glow improve identity without turning every chapter into the same gold look?

### `app/story-scene.tsx`

- Dialogue portraits are larger and framed more like character-game art.
- Dialogue/narration scenes now render over chapter-specific illustrated backgrounds, closer to a visual-novel/adventure-game staging model.
- Rudy's story character size increased to match the stronger portrait scale.
- Speaker tag avoids emoji when a real portrait/character art exists; it uses a small accent diamond instead.
- Portrait name text now has a soft gold shadow so characters feel more staged.
- Dialogue panel is slightly less rounded and more visual-novel/game-like.
- Short mobile viewports now use compact portrait sizes and a shorter dialogue scroll cap.
- Ch1 Mr. Black now uses the CCTV silhouette image instead of the prototype full portrait, preserving the early mystery.
- Puzzle/solved/completion chrome removes visible emoji/check/arrow glyph dependency where practical; Rudy badges now use the Rudy image instead of fox emoji.

New dedicated dialogue backgrounds:

```text
assets/story/dialogue_backgrounds/london_museum_hall.png
assets/story/dialogue_backgrounds/madrid_festival_plaza.png
assets/story/dialogue_backgrounds/seoul_palace_subway.png
assets/story/dialogue_backgrounds/cairo_archive_room.png
assets/story/dialogue_backgrounds/babel_tower_core.png
```

Review focus:

- Does the bigger portrait collide with long dialogue on small mobile screens?
- Do characters now feel more important than the dialogue UI?
- Is the loss of emoji in speaker tags good for premium feel and web compatibility?
- Do the new backgrounds support each chapter's actual story instead of reading as generic fantasy art?

Verification:

- 360x640 mobile browser capture: portrait, name, dialogue panel, and CTA all fit without page overflow.
- Web build asset list no longer bundles `mr_black_portrait.png`, confirming Ch1 no longer exposes the prototype full portrait in production code.

### `scripts/audit-story-assets.js`

- Adds a repeatable story-art QA command using Node built-ins only.
- Audits PNG count, dimensions, total size, average brightness, and groups assets into intro/background/portrait/character/sheet/boss/legacy.
- Optional `--contact-sheet` writes an HTML contact sheet to an output directory, defaulting to OS temp.

## 10/10 Art Rubric

A story asset is 10/10 only if all five are true:

1. Silhouette: the character/place is recognizable at thumbnail size.
2. Emotion: the image communicates a specific narrative beat, not just a nice pose.
3. Prop language: one signature object tells who this character is.
4. Mobile readability: the face/gesture/important clue is readable at 390px wide.
5. System cohesion: color, line, lighting, and framing belong to LinguaAI's detective-language-magic world.

## Image Generation Backlog

### P0 - Expression Sheets

Generate these before replacing broad chapter art:

- Rudy: neutral guide, worried detective, celebratory coach.
- Mr. Black: silhouette menace, tired reveal, fragile remorse.
- Eleanor: calm mentor, urgent warning, analytical discovery.
- Penny: warm guide, anxious final clue, brave resolve.
- Isabel: playful confidence, shocked concern, rallying energy.

Recommended file layout:

```text
assets/story/characters/_sheets/rudy_expression_sheet_v1.png
assets/story/characters/rudy/rudy_neutral_guide.png
assets/story/characters/rudy/rudy_worried_detective.png
assets/story/characters/rudy/rudy_celebratory_coach.png

assets/story/characters/_sheets/mr_black_expression_sheet_v1.png
assets/story/characters/mr_black/mr_black_silhouette_menace.png
assets/story/characters/mr_black/mr_black_tired_reveal.png
assets/story/characters/mr_black/mr_black_fragile_remorse.png

assets/story/characters/_sheets/eleanor_expression_sheet_v1.png
assets/story/characters/eleanor/eleanor_calm_mentor.png
assets/story/characters/eleanor/eleanor_urgent_warning.png
assets/story/characters/eleanor/eleanor_analytical_discovery.png

assets/story/characters/_sheets/penny_expression_sheet_v1.png
assets/story/characters/penny/penny_warm_guide.png
assets/story/characters/penny/penny_anxious_final_clue.png
assets/story/characters/penny/penny_brave_resolve.png

assets/story/characters/_sheets/isabel_expression_sheet_v1.png
assets/story/characters/isabel/isabel_playful_confidence.png
assets/story/characters/isabel/isabel_shocked_concern.png
assets/story/characters/isabel/isabel_rallying_energy.png
```

Runtime portrait files should be 1024x1536 PNG. Approval sheets should be 3072x1536 PNG with three 1024x1536 panels.

### P1 - Stronger Chapter Identity

Each chapter needs one signature color/shape beyond blue-black-gold:

- Ch1 London: fog, wet cobblestone, museum glass, telegram/phone geometry.
- Ch2 Madrid: red fabric arcs, plaza lights, festival motion, guitar curves.
- Ch3 Seoul: neon green/blue signs, subway lines, palace roof geometry.
- Ch4 Cairo: papyrus gold, coffee steam, archive shelves, hieroglyph stone.
- Ch5 Babel: vertical tower rings, five gates, multilingual glyph constellations.

## Prompt Template

Use this for future generated portraits:

```text
Original character portrait for a mobile mystery language-learning game, not based on any existing franchise. Warm detective fable style, hand-painted storybook finish, clean readable silhouette, expressive face, one signature prop, subtle golden language-magic accents, strong pose readable at phone size, 3/4 body, transparent or simple dark vignette background, no text, no logos, no UI, not photorealistic, not anime, not courtroom parody.

Character: [name]
Role: [story role]
Personality: [3 traits]
Signature prop: [prop]
Expression: [neutral / worried / celebratory / reveal / remorse]
Palette: [chapter-specific palette]
```

Use this for future intro/key art:

```text
Original vertical key art for a mobile mystery language-learning game, warm detective fable atmosphere, readable central subject, strong foreground/midground/background layering, subtle golden language-magic glyphs, chapter-specific color palette, storybook painted finish, cinematic but not photorealistic, no text, no logos, no UI, designed for 9:16 phone crop.

Chapter: [chapter]
Narrative beat: [one sentence]
Central subject: [character/place/object]
Important clue: [object or language symbol]
Palette: [chapter-specific colors]
```

## Current Verdict

After this pass, the app should move from "good learning-app story visuals" toward "more premium character story presentation." It is not 10/10 yet because the underlying character art still needs expression sheets and stronger silhouettes.

Next highest-value work: generate and wire Rudy/Mr. Black/Eleanor/Penny/Isabel expression variants, then use scene emotion to select the right portrait.

## QA Command

Run this whenever new story images are added:

```bash
npm run audit:story-assets -- --contact-sheet
```

Current audit snapshot:

- 66 PNG files.
- 139.81 MB total.
- intro: 35 files, 74.09 MB, 12.2% average brightness.
- background: 5 files, 10.68 MB, 17.2% average brightness.
- portrait: 15 files, 30.28 MB, 13.7% average brightness.
- character: 0 files.
- sheet: 0 files.
- boss: 5 files, 11.87 MB, 10.9% average brightness.
- legacy: 6 files, 12.89 MB, 13.4% average brightness.

Art direction implication: the current image set is very dark. Future generated assets should keep the mystery atmosphere but push faces, hands, props, and clue objects into a brighter readable value range for mobile.
