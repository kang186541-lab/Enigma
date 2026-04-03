# Story Architecture Document
## Enigma Language Adventure — The Language Conspiracy

**Purpose:** Maps the relationship between daily course vocabulary, story chapters, quiz content, character appearances, and emotional pacing. Story Creator uses this to ensure every quiz uses only vocabulary the user has already learned, and every chapter hits the right emotional beats.

**Last updated:** 2026-03-23

---

# SECTION 1: Vocabulary-Story Connection Map

## Daily Course Curriculum Summary

Before mapping chapters, here is what users learn and when:

| Unit | Days | Theme | Key Phrases |
|------|------|-------|-------------|
| Unit 1 | Day 1-6 | First Encounters | Hello, my name is, nice to meet you, where are you from, I'm from, thank you, sorry, I don't understand, help, where is, goodbye, see you later, how are you, how much, yes/no, can you repeat that, do you speak ___, a little bit, excuse me |
| Unit 2 | Day 7-12 | Everyday Expressions | Numbers 1-10, how old are you, phone number, days of the week, what day is it, telling time, what time is it, weather (sunny/rainy/cold/warm), colours, sizes (big/small), Unit 2 review |
| Unit 3 | Day 13-18 | Food & Ordering | I like ___, what food do you like, I love ___, I don't like, are you hungry, can I have ___, I'd like ___, how much is this, this is delicious, I recommend ___, Unit 3 review |

**NOTE: Days 19-30 are not yet written.** Chapters 4 and 5 will need to reference projected vocabulary for Units 4-5. Story Creator should use placeholder vocabulary scoped to practical travel/interaction phrases until those units are finalized.

---

## Chapter 1: The London Cipher

**Unlocked by:** Day 1-6 completion (Unit 1: First Encounters)

**Core vocabulary from those days:**
1. "Hello" / "Good morning" (Day 1)
2. "My name is ___" (Day 1)
3. "Nice to meet you" (Day 1)
4. "Thank you" (Day 1)
5. "Sorry, I don't understand" (Day 1)
6. "Where are you from?" / "I'm from ___" (Day 2)
7. "Can you say that again?" (Day 2)
8. "Do you speak ___?" / "A little bit" (Day 3)
9. "Where is ___?" / "Excuse me" (Day 4)
10. "Goodbye" / "See you later" (Day 4)

**Learning payoff scene:** Tom's testimony. Tom describes the suspicious figure using slang, and the user must decode his Cockney expressions using their new vocabulary. The moment users match "having a butcher's" to "looking" using context clues from Day 1-6 phrases, they feel clever. The quiz IS the investigation.

**Quiz vocabulary audit:**
- **Quiz A (word_rearrange):** Decoding the cipher on the Rosetta replica. Uses "Where is ___?" (Day 4), "My name is ___" (Day 1), "Help" (Day 1). The cipher's decoded message uses only Day 1-6 vocabulary.
- **Quiz B (matching):** Tom's slang testimony. Matches slang to Day 1-6 equivalents: "having a butcher's" = "looking at" (Day 2 context), "dodgy bloke" = "suspicious person" (Day 3 context), "leg it" = "goodbye/leave" (Day 4).
- **Quiz C (fill_blank):** Miss Penny's bookshop conversation. Uses "Do you speak ___?" (Day 3), "A little bit" (Day 3), "Thank you" (Day 1), "Where is ___?" (Day 4).
- **Quiz D (listening):** Eavesdropping on Penny's phone call. User listens for key Day 1-6 phrases hidden in conversation: "I don't understand" (Day 1), "Can you repeat that?" (Day 2), "Sorry" (Day 1).
- **Boss Quiz (mixed timed):** The Guardian's Riddle. Combines word_rearrange + fill_blank + matching under 90-second timer. All vocabulary from Day 1-6. The riddle's answer uses "Where is the stone?" (Day 4 + story context).

**Mr. Black presence:** Text message only. 2 lines. Day 1-6 vocabulary.
> "Good morning, detective. Thank you for the stone. Sorry about the door. — B"

---

## Chapter 2: The Madrid Disappearance

**Unlocked by:** Day 7-12 completion (Unit 1 + Unit 2: Everyday Expressions)

**Core vocabulary from those days (cumulative):**
1. All Day 1-6 vocabulary (recycled)
2. Numbers 1-10 (Day 7)
3. "How old are you?" / phone numbers (Day 7)
4. Days of the week (Day 8)
5. "What time is it?" / telling time (Day 9)
6. Weather expressions (Day 10)
7. Colours and sizes (Day 11)
8. Unit 2 review phrases (Day 12)

**Learning payoff scene:** Don Miguel's market conversation. User must navigate a real dialogue to extract information. Using "How much is ___?" (Day 5, recycled), numbers (Day 7), and "Can you say that again?" (Day 2, recycled) in a natural market conversation. When the user successfully bargains for information using these phrases, it feels like a real conversation, not a quiz.

**Quiz vocabulary audit:**
- **Quiz A (fill_blank):** Isabel's witness testimony. Uses "What time is it?" (Day 9), "What day is it?" (Day 8), numbers (Day 7). Isabel describes WHEN she saw Carlos taken: "It was [number] o'clock on [day]."
- **Quiz B (dialogue_choice):** Don Miguel roleplay conversation. Uses "How much is ___?" (Day 5), "I'd like ___" (projected — use "I want ___" from Day 5), numbers + prices (Day 7), "Thank you" (Day 1), "Can you say that again?" (Day 2).
- **Quiz C (word_match):** Retiro Park sign decoding. Uses weather words (Day 10: "sunny", "cold", "rain"), colours (Day 11: "red", "blue"), sizes (Day 11: "big", "small"). Park signs contain clues hidden in these everyday words.
- **Quiz D (sentence_builder):** Hidden room puzzle. Users arrange words into sentences using Day 7-12 structure: "The stone is [colour] and [size]" (Day 11), "Open at [time] on [day]" (Day 8-9).
- **Boss Quiz (timed rescue):** Disable language traps to save Carlos. 60-second timer. Combines fill_blank (Day 1-6 survival phrases) + word_match (Day 7-12 vocab) + number sequences (Day 7). The time pressure IS the story — Carlos is in danger.

**Mr. Black presence:** Two appearances.
1. **Retiro Park sighting** (no dialogue): Rudy spots a tall figure in a dark coat, 50 meters away, writing in a notebook. Rudy describes what he sees using Day 11 vocabulary: "Tall. Dark coat. Black notebook." The figure vanishes.
2. **Phone call** (5 lines max, Day 1-12 vocabulary only):
> "Hello, Rudy. How are you? The weather in Madrid is nice today."
> "How much is a Guardian Stone? I think... free."
> "What day is it? Ah — it doesn't matter. Every day is the same for me."
> "See you soon. Goodbye."
> "Oh — and Rudy? Nothing you know will help you there."

---

## Chapter 3: The Seoul Secret

**Unlocked by:** Day 13-18 completion (Unit 1 + Unit 2 + Unit 3: Food & Ordering)

**Core vocabulary from those days (cumulative):**
1. All Day 1-12 vocabulary (recycled)
2. "I like ___" / "I don't like ___" (Day 13)
3. "What food do you like?" (Day 13)
4. "Can I have ___?" / "I'd like ___" (Day 14)
5. "How much is this?" / prices (Day 15)
6. "This is delicious!" / taste expressions (Day 16)
7. "I recommend ___" (Day 17)
8. Unit 3 review (Day 18)

**Learning payoff scene:** Grandma Youngsook's food stall at Gwangjang Market. The user orders real Korean food using EXACTLY the phrases from Day 14-15. "Can I have tteokbokki?" "How much is this?" "This is delicious!" When the user types these phrases and Grandma Youngsook responds warmly, it's the first time the language feels ALIVE — not a quiz, but a conversation with someone who cares about you.

**Quiz vocabulary audit:**
- **Quiz A (dialogue_choice):** Meeting Sujin at Incheon Airport. Uses "Nice to meet you" (Day 1), "I'm from ___" (Day 2), "Do you speak ___?" (Day 3), "A little bit" (Day 3). Recycles Unit 1 vocabulary in a new city context.
- **Quiz B (fill_blank):** Grandma Youngsook's market ordering. Uses "Can I have ___?" (Day 14), "How much is this?" (Day 15), "This is delicious!" (Day 16), "I recommend ___" (Day 17), numbers for prices (Day 7).
- **Quiz C (word_match):** Bukchon Hanok Village door signs. Uses colour words (Day 11), direction-adjacent phrases from Day 4 ("Where is ___?"), food names (Day 13), and time expressions (Day 9). Clues to the stone hidden in everyday signage.
- **Quiz D (listening):** Minho's password puzzle. Listens to clues and extracts letters from words. Uses vocabulary from across all 18 days. Each clue references a previously learned word — the answer requires recognizing them by ear.
- **Boss Quiz (timed mixed):** Namsan Tower trial. Combines all quiz types under time pressure. fill_blank uses food ordering (Day 14-15), word_match uses weather + colours (Day 10-11), dialogue_choice uses introduction phrases (Day 1-3), listening uses numbers + time (Day 7-9). 120-second timer with multiple stages.

**Mr. Black presence:** First direct exchange. 10 lines max. Appears AFTER the Namsan boss quiz, when Rudy has just recovered the stone.
- Compliments Rudy's language progress (uses Day 13 vocabulary twisted: "I like your Korean. It's... delicious. Like tteokbokki.")
- Steals the stone. First major failure for Rudy.
- Leaves his calling card: a Jeju volcanic stone with a note in Jeju dialect.
- Does NOT explain his philosophy yet. Maximum menace, minimum exposition.

---

## Chapter 4: The Cairo Legacy

**Unlocked by:** Day 19-24 completion (projected Unit 4: Directions & Transport)

**Projected vocabulary for Unit 4 (not yet written — Story Creator should design quizzes around these practical phrases):**
1. "Turn left / Turn right"
2. "Go straight"
3. "How do I get to ___?"
4. "Is it far?" / "It's near / It's far"
5. "Take the bus / taxi / subway"
6. "How long does it take?"
7. "I'm lost" / "Can you help me?"
8. "Stop here, please"
9. Asking for directions politely
10. Plus all Day 1-18 vocabulary recycled

**Learning payoff scene:** Bargaining with Hassan at Khan el-Khalili market. This scene recycles the Day 14-15 ordering/pricing vocabulary from Ch3 but adds the negotiation layer from Unit 4's social interaction phrases. When the user haggles a price down using numbers (Day 7), "How much?" (Day 15), and new phrases like "That's too expensive" and "Can you make it cheaper?", the language skills feel genuinely useful. Hassan rewards good bargaining with information.

**Quiz vocabulary audit:**
- **Quiz A (dialogue_choice):** Navigating Cairo with Farid. Uses "How do I get to ___?" (Unit 4), "Is it far?" (Unit 4), "Turn left/right" (Unit 4), plus recycled "Where is ___?" (Day 4), "Thank you" (Day 1).
- **Quiz B (fill_blank):** Hassan's bargaining challenge. Uses "How much is this?" (Day 15), numbers (Day 7), projected negotiation phrases from Unit 4, food expressions recycled from Day 13-17 (Hassan offers tea during negotiation).
- **Quiz C (word_match):** Pyramid hieroglyph puzzle. Amira guides the user through matching ancient symbols to modern words. Uses colour (Day 11), size (Day 11), direction (Unit 4), and number vocabulary (Day 7). Ancient-to-modern bridge is both story content and vocabulary recycling.
- **Quiz D (sentence_builder):** Decoding Rosetta inscription with Amira. Uses longer sentences combining multiple units: "The [colour] stone is [direction] of the [size] room, at [time]." Forces users to synthesize vocabulary from Days 1-24.
- **Boss Quiz (timed mixed + moral choice):** Mr. Black's trap. Users must solve language puzzles while Miss Penny's allegiance is tested. The "moral choice" element: one puzzle has two solutions — one faster (but Miss Penny gets caught) and one slower (but saves her). Both paths are solvable with Day 1-24 vocabulary.

**Mr. Black presence:** Extended conversation. 30-40 lines. Screen conversation (remote). His full philosophy is revealed. This is the chapter where users briefly think "wait, is he right?"

Key dialogue beats:
1. Opens in the listener's language, switches mid-sentence (power move)
2. Tells his UN interpreter backstory
3. Makes his case: "7,000 languages = 7,000 walls"
4. Challenges Rudy directly: "You struggle with every new language. I've watched you. You know I'm right."
5. Rudy can't fully counter the argument — he needs Ch5's clarity to find the answer

---

## Chapter 5: The Last Language (Babel Tower)

**Unlocked by:** Day 25-30 completion (projected Unit 5: Emotions & Complex Sentences)

**Projected vocabulary for Unit 5 (not yet written):**
1. "I'm happy / sad / scared / angry / tired"
2. "I feel ___"
3. "I want to ___" / "I need to ___"
4. "I think that ___" / "I believe ___"
5. "Because ___" / "But ___" / "So ___"
6. Expressing agreement/disagreement
7. Asking for opinions
8. Compound sentences
9. All Day 1-24 vocabulary recycled
10. Emotional vocabulary critical for the climax

**Learning payoff scene:** The final confrontation with Mr. Black. Every NPC from every chapter contributes a phrase, a word, a piece of the puzzle. The user must use vocabulary from ALL 30 days — greeting phrases (Day 1), directions (Unit 4), emotional expressions (Unit 5), food words (Unit 3), numbers (Day 7). The moment: when the Universal Code starts activating and languages begin fading from the screen, the user must TYPE phrases in the target language from memory to "anchor" them. Every phrase they remember from the entire course keeps a language alive. This is the payoff for 30 days of learning.

**Quiz vocabulary audit:**
- **Quiz A (mixed entry):** Babel Tower Floor 1 — Language Gate. Uses Unit 1-2 vocabulary exclusively. "Who are you?" "Where are you from?" "What time is it?" Proves the user still remembers basics. Tom's voice guides them via radio.
- **Quiz B (dialogue_choice + sentence_builder):** Floor 2 — Food & Culture Gate. Uses Unit 3 vocabulary. Don Miguel and Grandma Youngsook's voices. Ordering food, discussing preferences, using proverbs. "No hay mal que por bien no venga" appears as a quiz answer.
- **Quiz C (listening + fill_blank):** Floor 3 — Navigation Gate. Uses Unit 4 vocabulary. Sujin and Minho's voices guide the user through a maze using direction phrases. "Turn left." "Go straight." "Stop!"
- **Quiz D (sentence_builder + free_response):** Floor 4 — Emotion Gate. Uses Unit 5 vocabulary. Miss Penny and Amira's voices. Users must express complex emotions: "I'm scared but I believe we can do this." "I think he's wrong because ___."
- **Boss Quiz (all types, final exam):** Floor 5 — Mr. Black's chamber. Every quiz type. Every vocabulary unit. 180-second timer with phases. Users must:
  1. Decode Mr. Black's message (word_rearrange, Day 1-6)
  2. Navigate the device room (directions, Unit 4)
  3. Bargain/negotiate with a Lexicon guard (Unit 3-4 phrases)
  4. Answer Mr. Black's philosophical challenge using emotional vocabulary (Unit 5)
  5. Anchor languages by typing remembered phrases (ALL units, from memory)

**Mr. Black presence:** Final confrontation. 50+ lines. Physical presence.

Dialogue structure:
1. Welcome speech — calm, welcoming, eerily polite (10 lines)
2. His argument — the Babel myth reframed (10 lines)
3. Rudy's counter — languages aren't walls, they're bridges (5 lines)
4. Device activation — tension peak (10 lines)
5. The fight — language puzzles while device is running (15+ lines interspersed with quizzes)
6. Defeat — he doesn't beg or rage (5 lines)
7. Final speech — "Languages will still die. They don't need me to kill them. They just need you to stop speaking them." (5 lines)

---

# SECTION 2: Language Difficulty Progression

## Sentence Complexity

| Chapter | Word Count per Quiz Sentence | Example |
|---------|------------------------------|---------|
| Ch1 | 3-5 words | "Where is the stone?" |
| Ch2 | 4-7 words | "What time did you see him?" |
| Ch3 | 5-8 words | "Can I have two of those, please?" |
| Ch4 | 6-10 words | "How do I get to the pyramid from here?" |
| Ch5 | 8-12 words | "I think he's wrong because languages connect people." |

## Quiz Type Progression

| Chapter | Primary Quiz Types | New Type Introduced |
|---------|-------------------|---------------------|
| Ch1 | word_rearrange, matching, fill_blank | listening (passive — identify keywords) |
| Ch2 | fill_blank, dialogue_choice, word_match | sentence_builder, timed element (boss) |
| Ch3 | dialogue_choice, fill_blank, listening | active listening (extract letters from words) |
| Ch4 | sentence_builder, fill_blank, word_match | moral_choice element (two solution paths) |
| Ch5 | ALL types combined | free_response (type from memory), multi-stage boss |

## Target Language in Narration

| Chapter | % Target Language in Narration | How It Appears |
|---------|-------------------------------|----------------|
| Ch1 | 0% | All narration in user's native language. Target language only in quizzes. |
| Ch2 | 5% | Occasional phrases in target language with inline translation toggle: "Rudy read the sign: 'Cerrado' — Closed." |
| Ch3 | 10% | NPC greetings and short phrases in target language. Food names untranslated. Signs require reading. |
| Ch4 | 15% | Paragraph-opening sentences in target language. Hassan's proverbs untranslated first, then explained. Short exchanges with NPCs in target language. |
| Ch5 | 20% | Mr. Black's opening lines in target language. NPC radio communications partially in target language. The "anchor" scenes require pure target language comprehension with no toggle. |

## NPC Speech Speed (Listening Quizzes)

| Chapter | Speed | Repeats Allowed |
|---------|-------|-----------------|
| Ch1 | Slow (0.8x) | Unlimited replays |
| Ch2 | Slow-medium (0.9x) | 3 replays |
| Ch3 | Medium (1.0x) | 2 replays |
| Ch4 | Medium-fast (1.1x) | 1 replay |
| Ch5 | Normal (1.0x) | 1 replay for regular quizzes, 0 for boss |

---

# SECTION 3: Mr. Black Appearance Schedule

This is the exact ruleset for when and how Mr. Black appears. Story Creator must follow these constraints to maintain his mystique.

| Chapter | Appearance Type | Max Lines | Vocabulary Limit | Rules |
|---------|----------------|-----------|-----------------|-------|
| Ch1 | Text message | 2 lines | Day 1-6 only | Users should not yet know if this is a person or an organization. Polite, taunting, uses survival phrases as dark comedy. NO philosophy. |
| Ch2a | Distant sighting | 0 lines (description only) | N/A | Rudy describes what he sees from 50 meters: tall, dark coat, notebook. Day 11 vocabulary (colours, sizes) used in description. NO dialogue. |
| Ch2b | Phone call | 5 lines | Day 1-12 only | Deceptively simple vocabulary. Weather small-talk (Day 10) becomes menacing in context. Ends with one threatening line. |
| Ch3 | Direct brief exchange | 10 lines | Day 1-18 + story vocab | Appears AFTER the boss quiz. Compliments Rudy. Steals the stone. Leaves calling card. Does NOT explain philosophy. Maximum mystery, minimum words. |
| Ch4 | Extended conversation (screen) | 30-40 lines | Unrestricted | Full philosophy revealed. UN backstory. His argument must be compelling enough that users think "he has a point." Rudy cannot fully counter it. This is the crisis chapter. |
| Ch5 | Final confrontation (in person) | 50+ lines | Unrestricted | Physically present. Activates device. Defeated. Does NOT beg, rage, or become cartoonish. Defeat speech is eloquent and haunting. He walks away — not destroyed, just wrong. |

### Escalation Pattern
```
Ch1: WHO is he?          (mystery)
Ch2: WHERE is he?        (proximity)
Ch3: WHAT can he do?     (capability — he steals the stone)
Ch4: WHY does he do it?  (philosophy — the hardest question)
Ch5: CAN he be stopped?  (climax)
```

---

# SECTION 4: NPC Appearance Tracker

This table tracks every NPC across all 5 chapters. "Primary" = major role with dialogue. "Brief" = text message, email, or short cameo. "Reunite" = returns for Ch5 finale.

| NPC | Ch1 | Ch2 | Ch3 | Ch4 | Ch5 |
|-----|-----|-----|-----|-----|-----|
| Eleanor | Primary (mentor) | Brief (worried message) | Brief (message) | Brief (admits she knew Mr. Black) | Reunite (key puzzle, "I'm proud of you") |
| Tom | Primary (witness) | Brief (Cockney text) | Brief (Cockney text) | Brief (Cockney text) | Reunite (ex-military reveal, combat help) |
| Miss Penny | Primary (suspicious ally) | Brief (suspiciously accurate email) | Absent (betrayal revealed by Minho) | Primary (seeks forgiveness, coercion revealed) | Primary (insider knowledge saves the day) |
| Isabel | Absent | Primary (witness, fire) | Absent | Absent | Reunite (pairs with Sujin) |
| Carlos | Absent | Primary (rescued, no dialogue during rescue; speaks post-rescue) | Brief (emails Sujin) | Brief (ally, analytical support) | Reunite (identifies stone positions) |
| Don Miguel | Absent | Primary (market, warmth, proverbs) | Absent (proverb echoes in Rudy's thoughts) | Absent (proverb echoes again) | Reunite (brings food, emotional depth revealed) |
| Sujin | Absent | Absent | Primary (guide, data-driven) | Brief (connects Rudy to Amira) | Reunite (cracks Universal Code frequency) |
| Minho | Absent | Absent | Primary (underground contact, discovers Penny's name) | Absent | Reunite (network coordination, Jeju dialect panic) |
| Grandma Youngsook | Absent | Absent | Primary (food stall, emotional heart) | Absent (food memories in Rudy's thoughts) | Reunite (fights by cooking and narrating in Korean) |
| Farid | Absent | Absent | Absent | Primary (guide, enthusiastic archaeologist) | Reunite (ancient site navigation) |
| Amira | Absent | Absent | Absent | Primary (Rosetta expert, analytical) | Reunite (identifies Proto-Sinaitic inscription) |
| Hassan | Absent | Absent | Absent | Primary (bargaining, comic warmth) | Reunite (talks past security, bonds with Youngsook) |

### Cross-Chapter Connection Rules

These recurring threads MUST be maintained by Story Creator:

1. **Tom's texts** — Appear in Ch2, Ch3, Ch4. Always Cockney. Always contain one piece of real intelligence buried in slang. Format: informal text message.

2. **Don Miguel's proverb** — "No hay mal que por bien no venga." Mentioned by Don Miguel in Ch2. Rudy thinks of it in Ch3 (after stone is stolen). Rudy thinks of it in Ch4 (after Mr. Black's argument). Rudy SAYS it in Ch5 (before entering Babel Tower). By Ch5, users know this phrase by heart.

3. **Miss Penny's literary quotes** — Foreshadowing in Ch1. Recontextualized in Ch3 when betrayal is revealed ("Those quotes... they were all warnings"). Her quotes become trustworthy again in Ch4-5 (she's direct now, no more hiding).

4. **Grandma Youngsook's food** — Tteokbokki ordering in Ch3. Rudy remembers the taste in Ch4 ("I miss Seoul. I miss Grandma Youngsook's tteokbokki."). Food returns in Ch5 (she cooks at Babel Tower).

5. **The notebook parallel** — Rudy's notebook (collecting disappearing words) vs. Mr. Black's notebook (cataloguing specimens). This parallel must be visible by Ch3. In Ch5, Rudy offers his notebook to Mr. Black: "These are the words you want to erase. Read them. They're beautiful."

6. **Eleanor's "Precisely"** — Used exactly 3 times:
   - Ch1: When Rudy correctly identifies the cipher type. (Approval.)
   - Ch4: In a message to Rudy about Mr. Black. (Confirmation of danger.)
   - Ch5: After Rudy defeats Mr. Black. "Precisely, Rudy. Precisely." (Pride.)

---

# SECTION 5: Emotional Arc Map

```
Ch1 London:   Curious mystery
              Tension: 6/10  |  Warmth: 4/10  |  Stakes: Personal (Rudy's failure)
              Beat: Calm -> Curiosity -> Tension -> Quiz -> Reveal -> Cliffhanger
              Emotional color: Fog, grey, intrigue
              Ends with: Mr. Black's text. "Who IS this person?"

Ch2 Madrid:   Stakes raised, first real danger
              Tension: 8/10  |  Warmth: 6/10  |  Stakes: Human (Carlos kidnapped)
              Beat: Urgency -> Investigation -> Warmth (Don Miguel) -> Chase -> Rescue -> Threat
              Emotional color: Warm sun, cold shadows
              Ends with: Mr. Black's phone call. Stone recovered but villain is CLOSE.

Ch3 Seoul:    Personal connection, bittersweet
              Tension: 7/10  |  Warmth: 8/10  |  Stakes: Emotional (trust shattered)
              Beat: Fresh start -> Cultural immersion -> Underground -> Discovery -> FAILURE
              Emotional color: Neon lights, traditional warmth
              Ends with: Stone stolen by Mr. Black. Penny's betrayal revealed.
              LOWEST POINT for Rudy. This is the chapter where he almost quits.

Ch4 Cairo:    Crisis + moral question
              Tension: 9/10  |  Warmth: 5/10  |  Stakes: Philosophical (is Mr. Black right?)
              Beat: Anger -> New allies -> Ancient wisdom -> Confrontation -> Forgiveness choice
              Emotional color: Ancient gold, desert heat
              Ends with: Mr. Black's full argument delivered. Rudy shaken but
              chooses to forgive Penny. Stone recovered. All 4 stones point to Babel.

Ch5 Babel:    Climax -> Loss -> Unity -> Victory -> Landing
              Tension: 10/10 -> 6/10 -> 8/10 -> landing
              Warmth: 3/10 -> 10/10 (when NPCs reunite)
              Stakes: Global (all languages at risk)
              Beat: Resolve -> Infiltration -> Crisis (device activates) ->
                    NPC unity -> Final puzzle -> Victory -> Mr. Black's exit -> Emotional landing
              Emotional color: Cold steel -> warm light (languages return)
              Ends with: Languages saved. Mr. Black walks away with his final speech.
              Rudy opens his notebook. Writes one word. Closes it. Smiles.
```

### The Emotional Dip-and-Rise Pattern

```
         Ch3 FAILURE            Ch5 VICTORY
              \                    /
    Ch2 STAKES \     Ch4 CRISIS  /
         \      \       |       /
  Ch1     \      \      |      /
 MYSTERY   \      v     v     /
            \    LOWEST      /
             \   POINT      /
              ------------->
```

Ch3 is the deliberate lowest point. Rudy loses the stone, loses trust in Penny, and questions his mission. This is essential — without a real low, the Ch5 high has no weight. Story Creator must resist the urge to soften Ch3's ending. Let it hurt.

---

# SECTION 6: Vocabulary Recycling Rules

These rules ensure learned phrases naturally recur across chapters:

### Mandatory Recycling

| Phrase | First Appears | Must Recur In |
|--------|--------------|---------------|
| "Hello" / greetings | Ch1 (Day 1) | Every chapter opening (meeting new NPCs) |
| "I don't understand" | Ch1 (Day 1) | Ch2 (Don Miguel speaks fast), Ch3 (Korean signs), Ch4 (Arabic proverbs), Ch5 (Universal Code static) |
| "Can you say that again?" | Ch1 (Day 2) | Ch2, Ch3 (natural conversation), Ch4 (Amira explains fast) |
| "Where is ___?" | Ch1 (Day 4) | Ch2 (finding Carlos), Ch3 (navigating Seoul), Ch4 (pyramid directions), Ch5 (finding the device) |
| "How much is ___?" | Ch2 (Day 5/15) | Ch3 (Grandma Youngsook's market), Ch4 (Hassan's stall) |
| "Thank you" | Every chapter | Every chapter — Rudy says it to every NPC who helps him |
| Numbers 1-10 | Ch2 (Day 7) | Ch3 (prices), Ch4 (puzzle codes), Ch5 (floor numbers) |
| Food ordering phrases | Ch3 (Day 14-15) | Ch4 (Hassan offers tea), Ch5 (Youngsook cooks) |

### Natural Recycling Contexts

Story Creator should look for natural moments to reuse vocabulary:
- Every new NPC meeting = Day 1 intro phrases recycled
- Every market/shop scene = Day 14-15 ordering + Day 7 numbers recycled
- Every navigation scene = Day 4 "Where is" + Unit 4 direction phrases
- Every moment of confusion = Day 1 "I don't understand" + Day 2 "Can you repeat"
- Every farewell = Day 4 "Goodbye" / "See you later"

### The "I Actually Know This" Progression

Users should have at least 2 moments per chapter where they recognize a phrase from a previous chapter and understand it without needing the translation toggle:

| Chapter | Recognition Moment |
|---------|-------------------|
| Ch1 | N/A (first chapter) |
| Ch2 | Isabel uses "Hello, nice to meet you" — user learned this on Day 1 |
| Ch3 | Grandma Youngsook says "Thank you, see you later" — user learned this on Day 1 + 4 |
| Ch4 | Hassan says "How much?" and user knows the answer before seeing options |
| Ch5 | Mr. Black uses Day 1-6 phrases as threats — user recognizes them and understands the horror |

---

*End of Story Architecture Document. Story Creator: this document defines WHAT vocabulary appears WHERE. The Character Bible defines WHO says it and HOW. Both documents must be consulted together.*
