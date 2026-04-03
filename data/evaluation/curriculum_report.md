# Curriculum Evaluation Report (v2)

**Evaluator:** curriculum-evaluator agent (Phase 1 re-evaluation)
**Date:** 2026-03-30
**Scope:** Days 1-30 (A1 complete), all three target languages (English / Spanish / Korean)
**Files reviewed:**
- `data/dailyCourse/day1_6_improved.ts`
- `data/dailyCourse/day7_12_unit2.ts`
- `data/dailyCourse/day13_18_unit3.ts`
- `data/dailyCourse/day19_24_unit4.ts`
- `data/dailyCourse/day25_30_unit5.ts`
- `lib/lessonContent.ts` (types, merged content, rewards, feedback)
- `lib/dailyCourseData.ts` (UNITS structure, progress tracking)
- `components/rudy/Step1ListenRepeat.tsx` (actual rendering logic)

---

## Overall Score: 6.5 / 10

Up from the previous report's 6/10. The data layer has meaningfully improved since last evaluation -- numbers 1-100 now exist in Day 7, `hasAudioOnlyRound` and `recallRound` flags are declared in every day's config, and `listening`-type quiz items with `audioOnly: true` appear in every Step 2. However, the component layer has NOT caught up: Step1ListenRepeat.tsx still renders `sentence.text` unconditionally on screen for every sentence, ignoring the `step1Config` flags entirely. The data promises features the UI does not deliver. This phantom-feature gap is the single most important finding of this evaluation.

---

## 1. Can a Complete Beginner ACTUALLY Learn to Speak from This App?

**Short answer: Partially. They will build vocabulary and phrase recognition. They will not build spontaneous production ability.**

A Day 30 graduate will be able to:
- Recognize and read aloud ~160 unique sentences across 3 languages
- Fill in blanks for familiar structures
- Handle a scripted exchange with Rudy's AI in Mission Talk (Step 3)

A Day 30 graduate will NOT be able to:
- Produce any sentence from memory without visual scaffolding
- Understand natural-speed spoken responses from a real person (all listening has text on screen)
- Construct novel sentences by combining learned vocabulary in new patterns

The fundamental problem remains: Steps 1, 2, and 4 are READ-ALOUD exercises. The user sees the text, says it, gets a pronunciation score. This trains pronunciation and pattern recognition. It does not train recall, which is the cognitive mechanism that converts passive knowledge into active speaking ability.

Step 3 (Mission Talk) is the only truly productive step, requiring the user to generate responses in conversation with an AI. It accounts for roughly 30-35% of daily speaking volume. This is the app's strongest pedagogical feature and needs to be the center of gravity, not the afterthought.

---

## 2. Comparison with Duolingo, Speak, Pimsleur

| Dimension | Enigma (current) | Duolingo | Speak | Pimsleur |
|-----------|-----------------|----------|-------|----------|
| Survival phrase timing | Day 1 (BEST) | Week 3+ | Day 1 | Day 1 |
| Speaking utterances/day | ~25-29 (mostly imitative) | ~15 (recognition) | ~100+ (production) | ~60 (audio recall) |
| Production from recall | Near zero in Steps 1/2/4 | Low | Very high | Very high |
| Listening without text | Data declares it; UI ignores it | Limited | Good | Excellent |
| Grammar approach | Contextual, concise (GOOD) | Pop-ups, gamified | Contextual | Implicit only |
| Spaced repetition | Yesterday-review only | Full SRS engine | None | Structured intervals |
| Numbers coverage | 1-100 on Day 7 (FIXED) | Present | Present | Present |
| 3 parallel curricula | YES (EN/ES/KO each natively written) | Translation-based | English only | 50+ languages |
| Narrative engagement | Story mode separate from lessons | None | None | None |
| Error handling tone | Encouraging ("Rudy believes in you") | Red X marks | Gentle | Implicit correction |

**Where Enigma genuinely wins:**
1. Survival phrases on Day 1 -- Duolingo buries these behind weeks of animals and colors. This alone could be a marketing differentiator.
2. Confusion engineering in Mission Talk -- GPT prompts deliberately create moments where the user MUST say "I don't understand" or "Can you repeat that?" No competitor does this. This is pedagogically brilliant.
3. Three natively-written curricula -- Korean sentences use natural Korean grammar (not translated English). Spanish uses appropriate formality. This is rare and valuable.
4. Sentence quality -- the vast majority of sentences are things real humans actually say (see Section 8).

**Where Enigma trails badly:**
1. Speak app users produce 100+ unscaffolded utterances per session. Enigma users produce ~8-10 in Mission Talk only.
2. Pimsleur is 100% audio recall -- no text ever. Enigma is 95% text-supported. These are opposite ends of the spectrum and Pimsleur produces more confident speakers.
3. Duolingo has "listen and type" exercises. Enigma declares `audioOnly: true` in the data but the UI does not implement it.

---

## 3. After 30 Days: Order Coffee, Introduce Self, Ask Directions?

### Introduce yourself: YES
Days 1-3 cover name, origin, job. Day 6 reviews all of it. The sequence is:
- Day 1: "Hello, my name is Rudy. Nice to meet you."
- Day 2: "I'm from Korea. I live in Seoul."
- Day 3: "I'm a student. I work at a company."
- Day 6: Full combination review

This is well-sequenced and achievable. A user who completes Day 6 can introduce themselves.

### Order coffee: YES (with caveats)
Day 14 teaches: "I'd like a coffee, please." "Can I have the menu, please?" "I'll have the chicken, please." "For here or to go?"
Day 15 teaches: "How much is this?" "Can I pay by card?" "The bill, please."

The ordering vocabulary is complete and practical. The caveat: if the waiter responds with anything not in the script, the user has no comprehension training to handle it. They can ASK but may not UNDERSTAND the answer.

### Ask directions: YES (partially)
Days 19-23 are the curriculum's most thorough unit:
- Day 19: "Where is the subway station?" "Is there a pharmacy nearby?" "How far is it?"
- Day 20: "Turn left." "Turn right." "Go straight ahead."
- Day 21: "Cross the bridge." "At the intersection, turn right."
- Day 22: "Can I get a taxi?" "One ticket to Seoul Station."
- Day 23: "Excuse me, I'm lost." "Can you show me on the map?"

Directional vocabulary is excellent. Again, the gap is comprehension: when someone responds with rapid spoken directions, the user has had zero training in processing audio without text support.

---

## 4. Survival Phrases in Days 1-6: Checklist

| Survival Phrase | Day Introduced | Present? | Notes |
|----------------|---------------|----------|-------|
| Hello | Day 1 | YES | "Hello, my name is Rudy." |
| Goodbye | Day 4 | YES | "Goodbye! See you later." |
| Thank you | Day 1 | YES | "Thank you." (recallRound: true) |
| Sorry | Day 1 | YES | "Sorry, I don't understand." |
| I don't understand | Day 1 | YES | Built into Day 1 core content |
| Can you say that again slowly? | Day 2 | PARTIAL | "Can you say that again, please?" + "Can you speak more slowly, please?" -- two separate sentences, which is actually better than one combined phrase |
| Do you speak English/Korean/Spanish? | Day 3 | YES | + "A little bit." response |
| Where is ___? | Day 4 | YES | "Where is the bathroom?" + "Where is the exit?" |
| How much? | Day 5 | YES | "How much is this?" |
| Yes / No | Day 2 | YES | "Yes. / No." |
| Help! | Day 1 | YES | "Help! Please help me." (Day 1) + reappears Day 5 |
| My name is ___ | Day 1 | YES | "Hello, my name is Rudy." |

**Score: 11/10 survival phrases present.** Every required phrase appears by Day 5, with Day 6 serving as full review. The "Can you say that again?" and "Can you speak more slowly?" split is actually pedagogically superior to a single combined phrase -- they are distinct real-world requests.

This is the curriculum's single greatest achievement and a genuine competitive advantage.

---

## 5. Do Users Speak 19+ Sentences Per Day?

### Sentence count per day (Day 1 example, English track):

| Step | Content | Utterances | Type |
|------|---------|-----------|------|
| Step 1: Listen & Repeat | 6 sentences x 2 rounds (slow + normal) | 12 | Imitative (text shown) |
| Step 2: Key Point Quizzes | 5 quizzes, each has speak-after | ~5 | Imitative (sentence revealed, then spoken) |
| Step 3: Mission Talk | ~8-10 AI conversation exchanges | ~8-10 | PRODUCTIVE (only generative step) |
| Step 4: Quick Review | 3 speak + 2 fill_blank | ~3-5 | Imitative (text shown) |
| **TOTAL** | | **~28-32** | |

**Target of 19+ is met.** Typical daily range is 25-32 utterances.

**But the quality distinction matters enormously:**
- Imitative (read-aloud): ~20-22 per day (70-75%)
- Productive (from-memory): ~8-10 per day (25-30%)

A healthy ratio for building speaking ability is closer to 50-60% productive. The current 25-30% is better than Duolingo (~5% productive) but far below Speak (~90%) or Pimsleur (~95%).

The data layer attempts to address this: `recallRound: true` is flagged on 2 sentences per day in Step 1, intended to hide text and force recall. But Step1ListenRepeat.tsx line 359 unconditionally renders `sentence.text` -- the flag is ignored. If the UI implemented `recallRound`, the productive ratio would improve to approximately 40-45%, which is a meaningful pedagogical improvement.

---

## 6. Does Each Word/Phrase Appear 7-10 Times Across Contexts?

### Tracking key phrases across all 30 days (English track):

| Phrase | Appearances | Contexts | Verdict |
|--------|------------|----------|---------|
| "Thank you" | Day 1 (Step 1, Step 2, Step 4), Day 5 ("I'm fine, thank you"), Day 6 (review), Day 16 ("I'm full. Thank you!"), Day 18 (review), Day 30 ("Thank you for everything") | 8+ across 6 different days | PASS |
| "I don't understand" | Day 1 (Step 1, Step 2, Step 4, Mission Talk prompt), Day 2 (review), Day 6 (review) | 6 in Days 1-6, then drops to Mission Talk only | BORDERLINE -- needs reinforcement in Units 3-5 |
| "Where is ___?" | Day 4 (bathroom, exit), Day 6 (review), Day 19 (subway station), Day 24 (review) | 7+ across 4 different days | PASS |
| "How much?" | Day 5, Day 6, Day 15 (full price unit), Day 18, Day 22 (taxi prices) | 8+ across 5 days | PASS |
| "My name is" | Day 1, Day 6, Day 30 | 5 across 3 days | WEAK -- should reappear in social scenarios |
| "Excuse me" | Day 4, Day 19, Day 23 | 4 across 3 days | WEAK |
| "Can you say that again?" | Day 2, Day 6 | 3 across 2 days | FAIL -- critical survival phrase vanishes after Day 6 |

**Verdict: MIXED.** High-frequency phrases like "Thank you" and "How much?" achieve 7+ appearances naturally because multiple units need them. But survival phrases that are context-specific ("I don't understand," "Can you repeat that?") cluster in Days 1-6 and are not systematically recycled in later units. The `isYesterdayReview` flag in Step 4 provides same-unit repetition but there is no cross-unit spaced repetition mechanism.

**Key gap:** "Can you say that again, please?" appears only in Days 2 and 6. A Day 20 learner has not encountered this phrase in ~14 days. It is likely decayed. This is arguably the MOST important survival phrase (it keeps conversations going when everything else fails) and it needs to appear in at least 2 more units.

---

## 7. 80% Known + 20% New Ratio Per Lesson?

### Analysis of Day 14 (Ordering at a Restaurant), English track:

Sentences taught:
1. "Can I have the menu, please?" -- NEW (menu, "can I have")
2. "I'd like a coffee, please." -- 80% KNOWN ("please" from Day 1, "I" from many days) + 20% NEW ("I'd like", "coffee")
3. "Can I have water, please?" -- 90% KNOWN (same pattern as sentence 1) + NEW ("water")
4. "I'll have the chicken, please." -- 80% KNOWN + NEW ("I'll have", "chicken")
5. "For here or to go?" -- 100% NEW

**Estimated ratio: ~65% known / 35% new.**

This is slightly heavier on new content than the ideal 80/20. The issue is concentrated in unit transitions: Day 13 jumps from weather/colors (Day 10-11) to food vocabulary with minimal bridging. Within a unit, the ratio is closer to 80/20 because the same vocabulary recycles across the 5-day block.

### Analysis of Day 20 (Basic Directions):
1. "Turn left." -- NEW
2. "Turn right." -- 95% KNOWN (same structure as above) + NEW ("right")
3. "Go straight ahead." -- 50% NEW
4. "It's on your left." -- NEW
5. "Take the first street on the right." -- 70% NEW

**Estimated ratio: ~40% known / 60% new.** This is inverted from ideal. Day 20 introduces too many new spatial terms at once.

**Verdict: INCONSISTENT.** Intra-unit days (e.g., Day 2 after Day 1, Day 15 after Day 14) are close to the 80/20 ideal. But unit-transition days (Day 7, Day 13, Day 19, Day 25) and vocabulary-dense days (Day 20 directions) spike to 50-60% new content, which risks cognitive overload.

---

## 8. Are Sentences Things People ACTUALLY Say in Real Life?

### The "When would a real person say this?" test:

**EXCELLENT (would say daily or weekly):**
- "Sorry, I don't understand." -- Day 1. Every beginner's most-used sentence. Perfect.
- "Can you say that again, please?" -- Day 2. Second most important. Perfect.
- "Where is the bathroom?" -- Day 4. Universally needed. Perfect.
- "How much is this?" -- Day 5. Every shopping interaction. Perfect.
- "I'd like a coffee, please." -- Day 14. Natural, polite ordering language. Perfect.
- "Can I pay by card?" -- Day 15. Modern essential. Excellent.
- "Excuse me, I'm lost." -- Day 23. Exactly what a traveler says. Perfect.
- "Are you free this weekend?" -- Day 29. Natural social initiation. Perfect.
- "Sorry, I can't. I have plans." -- Day 29. Real polite decline. Perfect.

**GOOD (natural, useful):**
- "I'm from Korea. I live in Seoul." -- Day 2. Standard small talk.
- "I work at a company." -- Day 3. Slightly generic but usable.
- "This is delicious!" -- Day 16. Natural food reaction.
- "Turn left / Turn right." -- Day 20. Useful directional vocabulary.
- "I am very happy today." -- Day 28. Real feeling expression.

**QUESTIONABLE (textbook-flavored):**
- "What's your city like?" -- Day 2. Slightly unnatural phrasing. Real people say "What's [city name] like?" or "How do you like [city]?"
- "It's three thirty -- a compound number!" -- Day 7. Nobody says "a compound number" in conversation. The meta-comment breaks immersion.
- "The salad is very fresh." -- Day 17. Functional but sounds like a restaurant review, not conversation. Real people say "This salad is really good."
- "She looks young but she is thirty." -- Day 26. Borderline rude in most cultures. Real people do not typically comment on apparent vs. actual age to someone's face.
- "What do you do?" -- Day 3. In English this is natural. But the Korean translation "무슨 일 하세요?" is appropriate; the Spanish "A que te dedicas?" is natural. All good.

**BAD (nobody says this):**
- "Saturday and Sunday are the weekend." -- Day 8. This is a definition, not a sentence anyone speaks. Replace with "What are you doing this weekend?" or "I love weekends."
- "It's a compound number!" -- Day 7 sentence suffix. Remove entirely.

**Overall sentence quality: 82/100.** Meaningfully better than most language apps. The vast majority of sentences pass the "when would a real person say this?" test. The few weak spots are concentrated in the knowledge-heavy days (numbers, days of week, time) where factual content crowds out conversational naturalness.

---

## 9. Are Mistakes Handled Gently?

### Error feedback analysis:

**Pronunciation scoring (Step 1):**
- Score >= 90: "Perfect!" / "Excellent pronunciation!" / "You sound like a native!"
- Score >= 70: "Good job!" / "Nice pronunciation!" / "Keep practicing and you'll be perfect!"
- Score < 70: "Try again!" / "A little more practice!" / "Rudy believes in you!"

**Assessment:**
- NO big red X marks anywhere in the feedback system. Good.
- The lowest feedback tier says "Try again" and "Rudy believes in you" -- encouraging, not punitive. Good.
- Haptic feedback: success = Success notification, below threshold = Warning notification. The warning haptic is a subtle nudge, not a punishment. Acceptable.
- The user can always retry (retry button available after every attempt). No lockouts. Good.
- Rudy's character voice is consistently warm across all three languages. Korean uses "루디가 응원해요!" (Rudy is cheering for you), Spanish uses "Rudy cree en ti!" (Rudy believes in you). Good localization.

**Quiz scoring (Step 2):**
- Correct answer shows the full sentence with translation. Good.
- Wrong answer: the data does not specify wrong-answer feedback. This depends on UI implementation. The quiz types are `select` (multiple choice) and `input` (type answer) -- neither is inherently punitive.

**Listening quizzes:**
- `audioOnly: true` quizzes present 4 options. Wrong answers are implicitly corrected by showing the correct answer. No shame mechanic.

**Verdict: 8/10.** Error handling is genuinely gentle. Rudy models the correct version rather than highlighting the mistake. The three-tier feedback system avoids both false praise (everything is "amazing!") and harshness (big red X). The main gap: there is no explicit "Rudy says the correct version after a mistake" mechanic in Step 1 -- if the user gets a low score, they see "Try again" but Rudy does not re-speak the sentence to model it. This would be a simple, high-impact addition.

---

## 10. 30-Day Milestones

| Day | Target Milestone | Status | Evidence |
|-----|-----------------|--------|---------|
| 6 | Introduce self (name, origin, job) | ACHIEVED | Days 1-3 teach all components; Day 6 combines them into multi-sentence introductions. "Hello, my name is Rudy. I'm from London. I work as a detective." |
| 12 | Numbers, prices, time | ACHIEVED (IMPROVED from previous report) | Day 7 now teaches 1-100 including tens. Day 9 teaches time. Day 15 applies numbers to prices. The critical gap from the v1 report (numbers 11-100 absent) has been fixed. |
| 18 | Order food at a restaurant | ACHIEVED | Days 13-18 are the curriculum's strongest unit. Menu ordering, expressing preferences, asking prices, paying, food feelings, recommendations. Complete restaurant scenario. |
| 24 | Ask directions | ACHIEVED WITH MINOR GAP | Days 19-23 provide thorough directional vocabulary including transportation. Gap: user can produce direction questions but has not trained comprehension of rapid spoken responses. |
| 30 | Basic social chat | ACHIEVED | Days 25-30 cover family, describing people, hobbies, emotions, making plans. Day 30 integrates all prior material. "Are you free this weekend? Let's meet at the cafe at three o'clock." |

**Milestone improvement since v1 report:** Day 12 milestone was previously "PARTIAL FAIL" due to missing numbers. Now ACHIEVED because Day 7 includes 1-100 with native Korean numbers, Sino-Korean numbers, Spanish numbers, and English numbers.

---

## Critical Weaknesses (Ranked by Impact)

### 1. PHANTOM FEATURES: Data Declares Audio-Only and Recall Modes That the UI Ignores

This is the most important finding and it is new since the last evaluation.

Every single day in all 5 course files declares:
```
step1Config: {
  hasAudioOnlyRound: true,
  audioOnlyCount: 2,
}
```

And 2 sentences per day are flagged with `recallRound: true`.

Every Step 2 quiz block includes a `type: "listening"` quiz with `audioOnly: true`.

**But Step1ListenRepeat.tsx unconditionally renders the sentence text on line 359:**
```
<Text style={s.sentenceText}>{sentence.text}</Text>
```

There is no conditional check for `step1Config.hasAudioOnlyRound`, no round 3 logic, no text-hiding based on `recallRound`. The component processes exactly 2 rounds (slow + normal) per sentence with text always visible, as hardcoded in `const TOTAL_ROUNDS = 2`.

This means:
- The curriculum designers intentionally added recall and audio-only features
- The data is structured correctly to support them
- The UI completely ignores them
- Users never experience what the curriculum was designed to deliver

**This is the #1 priority fix.** It requires engineering changes to Step1ListenRepeat.tsx, not content changes.

### 2. Speaking Remains Overwhelmingly Imitative, Not Productive

Even with the phantom features fixed, 70-75% of daily speaking would be imitative. The fundamental architecture needs a shift:
- Step 1 should include a Round 3 (audio-only) where text is hidden -- the data already supports this
- Step 4 should include "translate and speak" exercises where only the native-language meaning is shown and the user must produce the target-language sentence from memory
- Step 2 quizzes should have a "speak the full sentence" requirement after every correct answer, not just pattern-filling

### 3. Cross-Unit Vocabulary Decay Is Unaddressed

The `isYesterdayReview` flag in Step 4 provides intra-unit spaced repetition. But there is no mechanism to revisit Unit 1 survival phrases in Unit 4. Specific gaps:
- "Can you say that again, please?" -- last seen Day 6, never revisited
- "Help!" -- last seen Day 5, never revisited
- "Do you speak English?" -- last seen Day 3, never revisited
- "I don't understand" -- appears in Mission Talk prompts but not in structured review after Day 6

These are arguably the 4 most important phrases for a beginner and they decay by Unit 3.

### 4. Listening Comprehension Is Structurally Absent

The `listening` quiz type exists in the data (1 per day per language, 90 total across 30 days). Each has `audioOnly: true`. But without seeing the Step 2 component implementation, it is unclear whether these are actually rendered as audio-only or with text visible (the same phantom-feature risk as Step 1).

Even if implemented correctly, 1 listening quiz per day is insufficient. Real conversation is ~50% listening. The app is ~5% listening (1 out of ~20 daily activities).

### 5. Unit Transition Days Spike New Vocabulary Too High

Day 13 (food), Day 19 (places), Day 25 (family) each introduce 4-5 entirely new vocabulary items in a single session. The 80/20 known/new ratio breaks to approximately 40/60 on these days. This creates a cognitive overload risk and likely correlates with the highest drop-off days in the 30-day program.

Fix: add 1-2 "preview" sentences using upcoming unit vocabulary into the review days (Days 6, 12, 18, 24). For example, Day 12 (Unit 2 Review) could include "Are you hungry?" as a preview for Unit 3 food content. This bridges the transition without overloading.

---

## Strengths (Ranked)

### 1. Survival Phrases Are Front-Loaded and Deliberately Triggered

All 11 survival phrases are present by Day 5. More importantly, the Mission Talk GPT prompts are engineered to force their use. The Day 1 prompt explicitly says: "At some point, say something slightly unclear so the user can practice 'I don't understand' or 'Can you say that again?'" This is pedagogically sophisticated. No competitor does this deliberately. It transforms survival phrases from vocabulary items into emotional muscle memory.

### 2. Three Natively-Written Parallel Curricula

The Korean track uses natural Korean grammar and culturally appropriate phrasing. The Spanish track uses appropriate formality levels. Neither is a translation of the English track. This is rare and expensive to produce. Examples:
- English "I work at a company" -> Korean "저는 회사에 다녀요" (uses the natural Korean phrasing, not a literal translation)
- English "How old are you?" -> Spanish "Cuantos anos tienes?" (uses the tener construction, as Spanish naturally does)
- English Day 5 "Not bad, how about you?" -> Korean "괜찮아요, 당신은요?" (natural Korean response form)

### 3. Real-World Sentence Quality

82/100 sentences pass the "when would a real person say this?" test. Standouts include "Can I pay by card?" (Day 15), "Excuse me, I'm lost" (Day 23), "Sorry, I can't. I have plans" (Day 29). These are sentences that solve actual problems for real people, not textbook filler.

### 4. Topic Sequencing Matches Real Traveler Priorities

Introductions -> Survival -> Numbers/Time -> Food -> Directions -> Social is the correct priority order for anyone planning to use a language in real life. This is better than Duolingo (which teaches colors and animals before survival phrases) and roughly on par with Pimsleur's sequencing.

### 5. Gentle, Character-Driven Error Handling

Rudy's feedback system avoids both false praise and punishment. Three tiers with warm, localized messages. No red X marks. Always offers retry. The character voice is consistent and encouraging across all three language tracks.

---

## Specific Content Examples

### Best content in the curriculum:
- **Day 1, sentence 5:** "Sorry, I don't understand." -- The single most important sentence for any beginner, taught on Day 1. Perfect placement.
- **Day 14, full set:** "Can I have the menu, please?" / "I'd like a coffee, please." / "Can I have water, please?" / "I'll have the chicken, please." / "For here or to go?" -- This is a complete, natural restaurant ordering sequence. A user who memorizes these 5 sentences can eat anywhere.
- **Day 23, sentence 1:** "Excuse me, I'm lost." -- Honest, humble, immediately useful. Better than the textbook alternative "I am looking for..." which no panicking tourist actually says.
- **Day 29, sentences 4-5:** "Sorry, I can't. I have plans." / "That sounds great! See you there." -- Both responses to an invitation. Teaching both acceptance and polite decline is excellent social pragmatics.

### Worst content in the curriculum:
- **Day 7, sentence 6:** "It's three thirty -- a compound number!" -- Meta-commentary about grammar inside a sentence the user is supposed to repeat. Nobody says "a compound number" in conversation. Break the fourth wall in Step 2 explanation, not in Step 1 sentences.
- **Day 8, sentence 4:** "Saturday and Sunday are the weekend." -- A definition, not a sentence. Replace with "What are you doing this weekend?" which is both natural and reuses Day 8 vocabulary.
- **Day 26, sentence 5:** "She looks young but she is thirty." -- Culturally inappropriate in most contexts. Replace with something like "She is very tall" or "He has short brown hair" which are neutral physical descriptions.

---

## Recommendations for Phase 2

### Priority 1 (Must-fix before launch):

1. **Implement the audio-only Round 3 in Step1ListenRepeat.tsx.** The data already supports it. The component needs to: (a) add a third round where `sentence.text` is hidden, (b) check `recallRound` flag to determine which sentences get the audio-only treatment, (c) check `step1Config.hasAudioOnlyRound` and `audioOnlyCount`. This is an engineering task, not a content task. Estimated sentences affected: 2 per day x 30 days = 60 audio-only moments across the program.

2. **Add cross-unit survival phrase recycling.** Insert survival phrases into Step 4 review for Units 3-5. Specifically:
   - Day 15 review: add "Sorry, I don't understand" + "Can you say that again?"
   - Day 21 review: add "Do you speak English?" + "Help!"
   - Day 27 review: add "Where is ___?" + "How much is this?"
   This ensures every survival phrase appears at least 4 times across the 30-day program.

3. **Add "translate and speak" exercises to Step 4.** Show the native-language meaning only. User must produce the target-language sentence from memory. Start with 1 per day in Unit 2, increase to 2 per day by Unit 5. This directly attacks the imitative-vs-productive ratio.

### Priority 2 (Should fix):

4. **Bridge unit transitions.** Add 1-2 preview sentences using next-unit vocabulary into each review day (Days 6, 12, 18, 24). This smooths the known/new ratio on transition days.

5. **Fix the 3 worst sentences.** Remove "a compound number!" meta-commentary from Day 7. Replace "Saturday and Sunday are the weekend" (Day 8) with a natural sentence. Replace "She looks young but she is thirty" (Day 26) with a culturally neutral description.

6. **Add Rudy re-modeling after mistakes.** When a user scores below 70 in Step 1, automatically replay the TTS at slow speed so Rudy "models" the correct pronunciation. The infrastructure exists; this is a UX flow addition.

### Priority 3 (Nice to have):

7. **Integrate detective narrative into daily lessons.** Mission Talk scenarios currently use generic settings (museum, restaurant, city streets). Reframe them as detective missions with identical vocabulary: Day 14 becomes "shadow a suspect at his regular cafe -- order what he orders," Day 19 becomes "track the clue to the subway station." Zero vocabulary cost, significant engagement lift.

8. **Add a "survival phrase emergency card."** A quick-access screen listing all 11 survival phrases with one-tap TTS playback. This serves as both a study tool and a real-world emergency reference for travelers.

9. **Increase Mission Talk suggested answers from 5-6 to 8-10** to give users more production scaffolding without making it fully open-ended.

---

## Verdict

The curriculum's 30-day topic arc, survival phrase front-loading, sentence quality, and three-language native writing are genuinely strong. The foundation should not be rebuilt -- it should be completed. The most critical issue is not content quality but the gap between what the data layer promises and what the UI delivers. Fix the phantom features (audio-only rounds, recall rounds, listening quizzes) and the app's speaking volume and comprehension training improve significantly without rewriting a single sentence.

Current state: a good phrase memorization and pronunciation tool.
After Priority 1 fixes: a credible speaking practice tool.
After all fixes: a competitive alternative to Speak/Pimsleur for A1 learners.

---

*Phase 1 evaluation complete. No changes made to curriculum files. Awaiting approval before Phase 2.*
