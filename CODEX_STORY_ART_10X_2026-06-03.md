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

- Rudy: neutral guide, worried detective, celebratory coach. `[DONE: worried + celebratory runtime sprites]`
- Mr. Black: silhouette menace, tired reveal, fragile remorse. `[DONE: tired reveal + fragile remorse runtime sprites]`
- Eleanor: calm mentor, urgent warning, analytical discovery. `[DONE: urgent warning + analytical discovery runtime sprites]`
- Penny: warm guide, anxious final clue, brave resolve. `[DONE: anxious final clue + brave resolve runtime sprites]`
- Isabel: playful confidence, shocked concern, rallying energy. `[DONE: playful confidence + shocked concern + rallying runtime sprites]`

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

After this pass, the app should move from "good learning-app story visuals" toward "more premium character story presentation." It is not 10/10 yet because the full cast still needs expression sheets and stronger silhouettes.

Next highest-value work: continue the expression system for Rudy/Eleanor/Isabel, then add scene emotion metadata broadly enough that major story beats always choose an authored pose.

## Post-Pass: Dialogue Stage Presentation

User reference: Ace Attorney-style dialogue where the background, character art, text box, and subtle motion feel like one authored game scene.

Implemented direction:

- Dialogue scenes now use a visual-novel stage layout instead of a small portrait-card presentation.
- Backgrounds subtly drift/zoom through `Animated.Image`, so scenes do not feel static.
- Characters slide/fade in per scene and keep a small idle float.
- Rudy uses his transparent story sprite as a true cutout on the scene.
- NPC portraits are converted into dialogue-only transparent sprites and rendered as larger standees over the background, with the old heavy border/card treatment removed.
- The dialogue panel is now a lower black translucent overlay with a compact speaker tag, closer to courtroom/adventure-game dialogue.

New scene-specific backgrounds:

```text
assets/story/dialogue_backgrounds/madrid_festival_drained.png
assets/story/dialogue_backgrounds/madrid_sealed_stage.png
assets/story/dialogue_backgrounds/cairo_hospital_record.png
assets/story/dialogue_backgrounds/babel_language_gates.png
```

New dialogue sprite cutouts:

```text
assets/story/dialogue_sprites/ch1_tom_sprite.png
assets/story/dialogue_sprites/ch1_eleanor_sprite.png
assets/story/dialogue_sprites/ch1_ellis_sprite.png
assets/story/dialogue_sprites/ch1_black_cctv_sprite.png
assets/story/dialogue_sprites/ch2_isabel_sprite.png
assets/story/dialogue_sprites/ch2_miguel_sprite.png
assets/story/dialogue_sprites/ch2_carlos_sprite.png
assets/story/dialogue_sprites/ch3_minho_sprite.png
assets/story/dialogue_sprites/ch3_youngsook_sprite.png
assets/story/dialogue_sprites/ch3_sujin_sprite.png
assets/story/dialogue_sprites/ch4_mira_sprite.png
assets/story/dialogue_sprites/ch4_amira_sprite.png
assets/story/dialogue_sprites/ch4_hassan_sprite.png
assets/story/dialogue_sprites/ch4_black_partial_sprite.png
assets/story/dialogue_sprites/ch5_penny_sprite.png
assets/story/dialogue_sprites/ch5_black_face_sprite.png
```

New authored expression sprites:

```text
assets/story/characters/penny/penny_anxious_final_clue.png
assets/story/characters/mr_black/mr_black_fragile_remorse.png
assets/story/characters/mr_black/mr_black_tired_reveal.png
assets/story/characters/rudy/rudy_worried_detective.png
assets/story/characters/rudy/rudy_celebratory_coach.png
assets/story/characters/eleanor/eleanor_urgent_warning.png
assets/story/characters/eleanor/eleanor_analytical_discovery.png
assets/story/characters/isabel/isabel_shocked_concern.png
assets/story/characters/isabel/isabel_rallying_energy.png
assets/story/characters/isabel/isabel_playful_confidence.png
assets/story/characters/penny/penny_brave_resolve.png
assets/story/characters/hassan/hassan_memory_storyteller.png
assets/story/characters/sujin/sujin_diagnostic_focus.png
assets/story/characters/mira/mira_flat_delivery.png
assets/story/characters/amira/amira_protective_archivist.png
assets/story/characters/youngsook/youngsook_warm_wisdom.png
assets/story/characters/miguel/miguel_festival_memory.png
assets/story/characters/tom/tom_gruff_guard.png
```

`SeqScene.expression` now lets a story beat choose a character sprite variant. `Character.portraitVariants` maps those authored expressions to runtime images.

Backdrops are now selected by optional `SeqScene.backdrop`; if omitted, the chapter hub background is used. This keeps broad chapter art as the default while allowing major beats to change location:

- Madrid default: color-drained plaza.
- Madrid sealed-stage investigation/boss setup: fountain, speaker, red brush clue.
- Madrid post-boss: restored plaza.
- Cairo archive default, then hospital-record/lullaby/journal scenes.
- Babel tower-core default, then language-gate chamber for final confrontation.

Visual verification:

- Local web capture confirmed Babel's language-gate scene renders Penny over the background with no checkerboard card.
- Local web capture confirmed Madrid's first character scene renders Rudy over the drained-plaza background.
- Two Babel frames captured 2.6s apart changed 435,605 pixels out of 1,024,000, confirming the background/character idle motion is active.
- Local web capture confirmed Penny's `anxious` sprite in her "I was your student" confession scene.
- Local web capture confirmed Mr. Black's `remorse` sprite in his mother/lullaby reveal scene.
- Rudy now has authored `worried` and `celebratory` sprites wired through the same expression system; Madrid's first Rudy scene uses `worried`, London reward beats and Babel's final reflection use `celebratory`.
- Local web capture confirmed Madrid 2/21 renders `rudy_worried_detective` over the drained-plaza backdrop: `C:\Users\Admin\AppData\Local\Temp\linguaai-story-stage-shots\rudy-worried-madrid.png`.
- Web bundle verification confirmed both Rudy expression assets are emitted: `rudy_worried_detective.af3781...png` and `rudy_celebratory_coach.79b8...png`.
- Eleanor now has authored `urgent` and `analytical` sprites. `urgent` remains wired to danger/warning beats; `analytical` is wired to the verbal-lock explanation, London shard interpretation, and Seoul hospital-record synthesis.
- Isabel now has authored `playful`, `shocked`, and `rallying` sprites. In the active Madrid route, `shocked` is wired to the Carlos disappearance report and sealed-stage reveal, `playful` is wired to the red-flag heartbeat beat and restored-festival goodbye, and Babel's "one voice is not a festival" callback keeps `rallying`. The legacy Madrid block still uses `shocked` for the Carlos phone account and unknown-basic-phrases line.
- Mr. Black now has authored `tired` and `remorse` sprites. Babel's first direct confrontation uses `tired` for the "did anyone ever look at you like you mattered?" reveal, while the mother/lullaby scenes keep `remorse`.
- Penny now has authored `anxious` and `brave` sprites. `anxious` remains wired to her confession that she believed the Universal Code would help; `brave` is wired to her final moral-resolution line that Mr. Black must answer, but not as a monster.
- Hassan now has an authored `storyteller` sprite. It is intentionally limited to two active-route memory beats: Cairo's Nubian/Arabic/French lullaby scene and Babel's "A lullaby is not information" callback, so the pose lands as a thematic reprise rather than a generic replacement.
- Sujin now has an authored `diagnostic_focus` sprite. It is limited to three Seoul clue-diagnosis beats: the palace-gate-as-sentence explanation, the intercepted-signal reveal, and the fragment responding to voice/meaning/structure.
- Mira now has an authored `flat_delivery` sprite. It is intentionally limited to her Cairo reappearance, where Universal Code gives her the correct words but removes the human tremble behind "thank you"; Babel's later trembling thank-you beat remains on the base sprite until it gets its own opposite emotional pose.
- Amira now has an authored `protective_archivist` sprite. It is wired to Cairo's archive-loss warning, Ellis journal reveal, and restored-fragment proof beat, so her role reads as an active guardian of records rather than a static explainer.
- Youngsook now has an authored `warm_wisdom` sprite. It is wired only to active Seoul food-as-teaching beats: the first soup welcome, the stew/sentence-order metaphor, and the final "one more bite" farewell. Story text, quiz prompts, answer data, and sequence order remain unchanged.
- Don Miguel now has an authored `festival_memory` sprite. It is wired only to active Madrid beats where he remembers the imperfect plaza, points toward the sealed stage, and defines festival as mistakes, accent, and repainted red. Story text, quiz prompts, answer data, and sequence order remain unchanged.
- Sidecar reviewer Gibbs ranked Tom as the next highest-value recurring character, because he anchors the first playable gatekeeper scene and returns for Babel's connection callback. Tom now has an authored `gruff_guard` sprite wired to the London entrance challenge, London reluctant approval / "Break a leg" beat, and Babel connection-gate callback. Story text, quiz prompts, answer data, and sequence order remain unchanged.
- Latest asset audit: 104 story PNGs, 216,520,564 bytes total, 34 character assets, warnings 0.

Remaining visual gap:

- Most dialogue sprites are still cutouts from the current portrait set, not purpose-built action poses. Rudy, Tom, Eleanor, Isabel, Mr. Black, Penny, Hassan, Sujin, Mira, Amira, Youngsook, and Don Miguel now each have authored emotional poses, but true Ace Attorney-quality integration still needs transparent expression/action sheets for the remaining recurring cast. Next likely targets: Minho and Carlos.

## QA Command

Run this whenever new story images are added:

```bash
npm run audit:story-assets -- --contact-sheet
```

Current audit snapshot:

- 97 PNG files.
- 196.63 MB total.
- intro: 35 files, 74.09 MB, 12.2% average brightness.
- background: 9 files, 19.81 MB, 15.3% average brightness.
- portrait: 15 files, 30.28 MB, 13.7% average brightness.
- character: 27 files, 47.69 MB, 26.8% average brightness.
- sheet: 0 files.
- boss: 5 files, 11.87 MB, 10.9% average brightness.
- legacy: 6 files, 12.89 MB, 13.4% average brightness.

Art direction implication: the current image set is very dark. Future generated assets should keep the mystery atmosphere but push faces, hands, props, and clue objects into a brighter readable value range for mobile.
