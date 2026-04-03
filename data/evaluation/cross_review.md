# Cross-Evaluation Report: Story Improvements + Curriculum Work
**Reviewer:** QA (independent cross-evaluation)
**Date:** 2026-03-29
**Scope:** story_improvements.md work (quizData.json, storyData.json, story-scene.tsx) vs. story-creator.md + story-evaluator.md specs; day1_6_improved.ts + day7_12_unit2.ts work vs. curriculum-evaluator.md spec.

---

## PART 1 — STORY WORK

### A. Quiz-Story Integration (spec: "Quizzes ARE the story, not interruptions")

**Score: 6/10**

**ch1_quiz_speak_a — "Mr. Black's Message"**
Mixed result. The framing — "a detective records evidence with their voice" — is a genuine attempt at story justification. The two lines chosen are real Mr. Black canon: "Hello. My name is Mr. Black." and "Thank you. Goodbye, London." These sentences are pulled directly from the story and carry narrative weight because they are the villain's calling card. That is genuinely clever.

The problem is placement. This quiz is inserted *after* ch1_quiz_e, the boss riddle — meaning it runs after the chapter climax, as an appendix. The story-creator.md pacing template is explicit: "Quiz moment: the quiz IS the story (solve to proceed)." A quiz that fires after the boss quiz, with no narrative gate ("speak this to proceed"), is a drill with a story costume. The player has already beaten the chapter. There is no tension left to borrow.

**ch2_quiz_speak_a — "Don Miguel's Order"**
This is the best of the three. The story context is correct: "Don Miguel won't talk until you order properly. Speak your order aloud!" This mirrors the story-evaluator.md's own gold-standard example: "Don Miguel's market (Ch2 Scene 2): 'Order food or I won't talk' is PERFECT integration." The three sentences ("Excuse me. I would like bread, please." / "How much is this?" / "Thank you very much!") are a natural ordering sequence. The story reason is clear and character-specific. This is what quiz-story integration should look like.

**Placement caveat:** This quiz is also inserted after ch2_quiz_e (the boss timed quiz), not inside ch2_scene2 where the market confrontation happens. A player who already beat the Madrid boss will experience this as a post-credits pronunciation drill, not an in-narrative obstacle. The quiz *content* earns the integration; the *placement* undermines it.

**ch3_quiz_speak_a — "At Incheon Airport"**
The storyContext is strong: "Rudy's phone is dead. No translator app. You have to speak Korean yourself!" This directly mirrors the dead-phone predicament from ch3_scene1. The three sentences are textbook survival phrases for the scenario ("Do you speak English?", "I don't understand. Can you say that again slowly?", "Where is the subway?"). Story reason exists and is the correct one.

Same placement problem as above: inserted after ch3_quiz_e (boss mixed), not inside ch3_scene1 where the phone dies. The scene that creates the narrative need for these phrases has already concluded.

**Summary:** Content rationale is good to excellent on two of three quizzes. Placement fails the "quizzes ARE the story" test on all three — they function as pronunciation drills appended to completed chapters, not as story obstacles the user must overcome.

---

### B. Vocabulary Rules (Ch1 = Day 1-6 ONLY; Ch2 = Day 1-18; Ch3 = Day 1-30)

**Score: 9/10**

**ch1_quiz_speak_a vocabulary check against day1_6_improved.ts:**
- "Hello" — Day 1 ✓
- "My name is" — Day 1 ✓
- "Thank you" — Day 1 ✓
- "Goodbye" — not explicitly listed in Day 1-6 (Day 4 has "See you later!" and "Have a good day!" — "Goodbye" as a standalone is implicit but not a dedicated Day 1-6 sentence)

Minor gap: "Goodbye, London" is used as the second sentence. Goodbye is culturally assumed to be Day 1 and is referenced in the curriculum's own Day 4 farewell unit. The risk is minimal — any learner at Ch1 unlock (Day 6 complete) will know this word. Not a hard violation.

**ch2_quiz_speak_a vocabulary check:**
- "Excuse me" — Day 1 survival phrase ✓ (implied; explicitly checked: "Sorry" is Day 1, "Excuse me" is functionally equivalent)
- "I would like ___, please" — Day 13-14 food ordering ✓ (within Day 1-18 window)
- "How much is this?" — Day 5 ✓
- "Thank you very much" — Day 1 variant ✓

All within Ch2's Day 1-18 pool. Clean.

**ch3_quiz_speak_a vocabulary check:**
- "Excuse me" — Day 1 ✓
- "Do you speak English?" — Day 3 (survival phrase) ✓ (within Day 1-30)
- "I don't understand. Can you say that again slowly?" — Day 1-2 ✓
- "Where is the subway?" — Day 4 ("Where is ___?") pattern ✓, "subway" as specific vocabulary: Day 19-24 directions unit ✓ (within Day 1-30)

All within Ch3's Day 1-30 pool. Clean.

One point deducted for the "Goodbye" edge case in Ch1 and because "Excuse me" (distinct from "Sorry") is not explicitly charted to a specific day in the curriculum files reviewed, creating a minor tracking ambiguity.

---

### C. 80%/20% Rule (80% known, 20% guessable, 0% impossible)

**Score: 9/10**

All three pronunciation quizzes use vocabulary that users at the required day level would know or easily guess from context. There are no vocabulary landmines. The sentences are short, practical, and phonetically accessible. "Quisiera pan, por favor" is entirely within A1 food vocabulary; "¿Cuánto cuesta esto?" is a Day 5 phrase verbatim; "실례합니다. 영어 할 줄 아세요?" is a Day 3 survival phrase.

The one caution: ch3's Korean sentences ("이해 못 했어요. 천천히 다시 말해 주세요." and "지하철이 어디예요?") may be phonologically challenging for learners not accustomed to Korean phonotactics, but this is a pronunciation difficulty issue, not a vocabulary knowledge issue. The 80/20 rule is about comprehensibility, not speakability. Both criteria are met.

No impossible vocabulary found in any of the three quizzes.

---

### D. Speaking Volume (spec: users must speak 19+ sentences per day)

**Score: 4/10**

The story_improvements.md document acknowledges the speaking deficit explicitly. The three new quizzes add 2 + 3 + 3 = **8 sentences total**, split across three chapters. In a given play session, a user encounters only one chapter's pronunciation quiz — meaning the actual per-session addition is 2 or 3 sentences.

The story_evaluator.md report (which this work was meant to address) identified a "structural problem": the quiz types in story-scene.tsx are "mostly tap-to-select exercises" and "A user completing Ch1-Ch3 never speaks once" (Critical 1 in the re-evaluation update). Three small pronunciation quizzes appended to chapter ends do not fix a structural zero-speaking architecture. The report called for "Speaking/pronunciation quizzes replacing tap-to-select quizzes at key narrative moments" — not for addenda after the boss fight.

Sentences chosen are genuinely useful ("Excuse me. I would like bread, please." ✓, "Where is the subway?" ✓, "Do you speak English?" ✓). They pass the "would a tourist actually say this?" test. That earns partial credit.

But: 8 total new speaking sentences across three chapters, placed outside the narrative flow, in a story mode that previously had zero speaking, does not meaningfully address a structural deficit. The spec requires 19+ sentences per day across the full app. Story mode contributing 2-3 sentences per chapter session is marginal improvement, not a fix.

---

### E. Eleanor Character (story-evaluator.md: NPCs must feel like real people, not quest-givers)

**Score: 8/10**

The updated Eleanor dialogue is a genuine improvement. Before: generic curator alert with no personality. After: "I trained the person who did this. Twenty years ago, I thought I was giving a brilliant student a future. I didn't know I was building a thief."

This works for several reasons:
- It gives Eleanor direct personal responsibility for the antagonist, creating stakes specific to her
- Guilt and complicity are richer motivations than professional alarm
- The phrasing is natural — "I didn't know I was building a thief" is how a real person talks, not a quest-giver
- It creates a mentor/student betrayal arc that enriches Mr. Black retroactively — he was shaped by someone, he was not born a villain
- The story-creator.md spec says "leave some mystery" — the dialogue establishes the relationship without over-explaining it. We don't get a biography of Mr. Black's student years. Eleanor stops at the guilt. That restraint is correct.

One point deducted: Eleanor's new backstory is introduced in her very first line, in a rushed single speech, without any story breathing room. "Rudy, come quickly. The stone is gone. AND I recognize the method AND I trained him AND I didn't know I was building a thief" — four major revelations in one dialogue block before Rudy has said anything. The story-creator.md spec warns against pacing shortcuts. Rudy's response ("A cipher? On the replica? That's... peculiar.") doesn't even react to the massive personal revelation Eleanor just dropped — he responds only to the cipher detail. This makes Eleanor's confession feel like an information dump rather than a character moment.

The *content* of the change is strong. The *pacing* within the dialogue is rushed.

---

### F. Missing Items — Process and Spec Compliance

**FAIL on multiple counts.**

**1. "Show current vs improved FIRST scene. Wait for approval" — NOT followed.**
story-creator.md is explicit: before making changes, show the current scene and the proposed improvement side-by-side, then wait for approval. story_improvements.md documents changes already made — there is no evidence of a "proposed changes" step with user review before execution. The work was done and then documented, not proposed, approved, and then done.

**2. "Story Creator should wait for Story Evaluator report" — PARTIALLY followed.**
The story_report.md file exists (dated 2026-03-23, updated 2026-03-29) and was clearly read before story work was done. story_improvements.md references the evaluation findings. The evaluation-first sequence was followed. Credit here.

**3. Boss Quiz placement protocol — NOT followed.**
story-creator.md specifies quiz types in order: Quiz 1 after first NPC meeting, Quiz 2 during investigation, Quiz 3 roleplay for key NPC, Quiz 4 investigation before climax, Quiz 5 (BOSS) at chapter climax. The new pronunciation quizzes were inserted after the boss quiz (ch_quiz_e), which violates the chapter quiz sequence spec. They should be integrated mid-chapter, not appended post-boss.

**4. ch2_quiz_pronunciation orphan — not resolved.**
story_improvements.md's own "What Still Needs To Be Done" section flags this: "ch2_scene2 already had a quiz with id ch2_quiz_pronunciation in the scene array, but no matching entry was found in quizData.json." This was identified but not fixed. A dangling quiz reference that will silently fail in production was knowingly left unresolved.

**5. No PronunciationQuizScreen component — not resolved.**
story_improvements.md explicitly flags: "If no PronunciationQuizScreen component exists, these quizzes will silently fail." Three new pronunciation quizzes were added to a data file for a UI component that may not exist. This is a high-priority rendering failure risk left unaddressed.

---

## PART 2 — CURRICULUM WORK

### G. Recall-Based Production (spec: at least 2 recall sentences per day)

**Score: 8/10**

`recallRound: true` is present in day1_6_improved.ts and day7_12_unit2.ts. Checking Day 1 English: sentences 4 ("Thank you.") and 5 ("Sorry, I don't understand.") both carry `recallRound: true`. Day 2 English: sentences 5 ("Can you say that again, please?") and 6 ("Can you speak more slowly, please?") both carry `recallRound: true`. The pattern is consistent across all days reviewed — exactly 2 sentences per day per language carry the flag.

The spec's curriculum_report.md recommended "at least 2 per day where the target sentence is hidden and the user must speak from the native-language prompt only." The `recallRound: true` flag is present; whether the UI actually hides the text depends on the Step1ListenRepeat.tsx implementation, which was not changed in this work. The data signal is correctly implemented. If the renderer uses this flag to hide text in Round 3, the spec is fully met. If the renderer ignores the flag, the data work is wasted.

This is a meaningful improvement over the previous zero-recall architecture. Two points are deducted because: (a) implementation depends on a renderer not confirmed to honor the flag, and (b) 2 recall sentences per day is the minimum the spec requires — it does not move far beyond minimum.

**Day 7 specifically:** `recallRound: true` is on "How old are you? I'm twenty-five years old." and "That's fifteen dollars, please." — both high-frequency practical sentences. Good choices.

---

### H. Numbers 11-100 (evaluation identified this as critical gap)

**Score: 9/10**

The curriculum_report.md identified numbers 11-100 as "the highest-priority curriculum gap." day7_12_unit2.ts Day 7 ("Numbers 1-100 & Age") directly addresses this:

- Step 1, sentence 2: "Eleven, twelve, thirteen, fourteen, fifteen. Sixteen, seventeen, eighteen, nineteen, twenty." — covers 11-20 explicitly
- Step 1, sentence 3: "Twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred." — covers the decade pattern to 100
- Step 2 explanation: "Numbers 11-20: special forms — eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty. Then tens pattern: twenty-one, twenty-two... Tens: twenty(20) to one hundred(100)."
- All three languages cover the same range

Critically: Day 7 is positioned *before* the food ordering unit (Days 13-18), which means numbers now precede price scenarios. The "How much is this? / Twenty-five dollars" gap identified in the evaluation is structurally addressed.

One point deducted: "How much is this?" was taught on Day 5, and numbers 11-100 arrive on Day 7. There is a 2-day window where users know the question but cannot understand the answer. The evaluation recommended moving numbers to Day 3 or 4 to close this window entirely. Day 7 is better than Day 31+ (previous state) but not the earliest possible fix.

---

### I. Detective Theme (evaluation: daily lessons must connect to Rudy/Enigma narrative)

**Score: 3/10**

This is the sharpest failure in the curriculum work. The curriculum_report.md explicitly named this Critical Weakness 5: "The detective narrative is the primary competitive differentiator vs. Duolingo, Speak, and Pimsleur — and it is being ignored in the most-used feature."

Checking the Mission Talk scenarios in day7_12_unit2.ts:

- Day 7: "Exchanging contact info with a new colleague at the museum entrance."
- Day 8: "Planning the week's schedule with Rudy."
- Day 9: "Checking tour times at the museum and coordinating schedules."
- Day 10: "Checking the weather before heading out for an outdoor investigation with Rudy."
- Day 11: "Shopping for souvenirs at the museum gift shop."
- Day 12: "End-of-week party at the museum."

Day 10 includes "outdoor investigation" and Days 8/12 mention Rudy by name. That is the entire detective content. Days 7, 9, and 11 are "museum colleague," "museum tours," and "museum gift shop" — which is generic museum framing, not detective framing.

The evaluation's own example was precise: "Day 14 (food ordering) could be 'shadow a suspect at his usual café' with identical vocabulary. Day 19 (directions) could be 'follow the trail through the city.' The vocabulary cost is zero." The curriculum work did not apply this principle. Day 11 colors/sizes is set in a gift shop; it could be "describe what the suspect is wearing" with the same vocabulary. Day 9 time-telling is museum tours; it could be "the dead drop is at 3:30 — what time is it now?" with the same vocabulary.

The detective theme is present in the framing characters (Rudy is named) but absent from the actual Mission Talk scenarios, which remain interchangeable with any language app's content.

---

### J. Audio-Only Training (evaluation: step1Config.hasAudioOnlyRound: true)

**Score: 10/10**

`step1Config.hasAudioOnlyRound: true` is present in every single day in both day1_6_improved.ts and day7_12_unit2.ts. The flag is consistently paired with `audioOnlyCount: 2`, meaning the last 2 sentences of each day's Step 1 are marked for audio-only treatment in Round 3. This is implemented identically across all three target languages (English, Spanish, Korean) for every day reviewed.

This directly addresses Critical Weakness 3 from the curriculum_report.md: "Add one audio-only round — add a Round 3 to Step 1 where the sentence text is hidden and the user hears normal-speed audio only before speaking." The data implementation is complete and consistent.

Same caveat as Section G: the feature depends on the Step1ListenRepeat.tsx renderer honoring the flag. But the data implementation is clean and complete across all days. Full marks for the data work.

---

## SUMMARY SCORES

### STORY WORK: 5.7/10

| Criterion | Score | Verdict |
|-----------|-------|---------|
| A. Quiz-Story Integration | 6/10 | Content rationale good; all three misplaced post-boss |
| B. Vocabulary Rules | 9/10 | Clean compliance; one minor "Goodbye" edge case |
| C. 80%/20% Rule | 9/10 | No impossible vocabulary |
| D. Speaking Volume | 4/10 | 8 sentences total does not fix structural speaking deficit |
| E. Eleanor Character | 8/10 | Strong content; rushed delivery in single speech block |
| F. Process Compliance | FAIL | No approval-first step; two known bugs left unresolved |

**STORY WORK: 5.7/10**

---

### CURRICULUM WORK: 7.5/10

| Criterion | Score | Verdict |
|-----------|-------|---------|
| G. Recall-Based Production | 8/10 | Flag present on 2+ sentences per day; renderer compliance unconfirmed |
| H. Numbers 11-100 | 9/10 | Critical gap addressed; 2-day overlap window remains |
| I. Detective Theme | 3/10 | Generic museum framing; no narrative integration |
| J. Audio-Only Training | 10/10 | Flag present every day, all languages, consistent |

**CURRICULUM WORK: 7.5/10**

---

## TOP 3 ISSUES THAT MUST BE FIXED BEFORE LAUNCH

### 1. CRITICAL — Pronunciation quizzes will silently fail (no renderer component confirmed)
story_improvements.md explicitly acknowledges: "If no PronunciationQuizScreen component exists, these quizzes will silently fail or need a type-guard fallback." Three pronunciation quizzes were added to production data files for a UI component that may not exist. Before any of this content reaches users, confirm that `type: "pronunciation"` is handled in the quiz renderer. If not, every `ch_quiz_speak_a` entry is dead code in a user-facing file.

### 2. HIGH — Story pronunciation quizzes are placed after chapter bosses, not inside narrative scenes
The spec is unambiguous: "Quizzes ARE the story, not interruptions." All three pronunciation quizzes (ch1, ch2, ch3) are appended after the chapter's boss quiz. There is no story gate that requires the user to speak to proceed. ch2_quiz_speak_a has the correct Don Miguel context but fires after the chapter is over. The fix is to move each quiz inside its corresponding scene array at the correct narrative moment — ch2_quiz_speak_a belongs inside ch2_scene2, triggering *before* Don Miguel gives Rudy the information, not after the chapter ends.

### 3. HIGH — Detective narrative is absent from daily lesson Mission Talk scenarios
The competitive differentiator of this app is the detective story. The curriculum_report.md named this the app's most wasted asset. day7_12_unit2.ts had the opportunity to fix it and did not — Days 7, 9, 11, and 12 remain generic museum scenarios that are indistinguishable from Duolingo content. The vocabulary is correct; only the scenario framing needs to change. Day 11 ("museum gift shop") should become "describe the suspect's appearance to Rudy" with the same colors/sizes vocabulary. Day 9 ("checking tour times") should become "the evidence pickup is at a specific time — practice time-telling to not miss it." This is a content edit, not an engineering change.

---

## WHAT WAS DONE WELL

**The Eleanor rewrite gets the character right.** "I didn't know I was building a thief" is a line that earns its place. It transforms Eleanor from an exposition machine into someone with personal guilt — which is a richer motivation than generic professional concern. The mentor/student betrayal arc it establishes retroactively deepens Mr. Black without making him sympathetic to the point of undermining the conflict. This is the best single piece of character writing in the improvements batch.

**ch2_quiz_speak_a vocabulary selection is exemplary.** Three sentences — order food, ask price, thank — follow a natural transactional arc and are exactly the phrases a real user would need at a Spanish market stall. The story justification (Don Miguel won't talk until you order) is the precise integration the spec calls for. If all three quizzes had been written and placed with this care, the story work score would be significantly higher.

**Numbers 11-100 are genuinely taught in Day 7.** The curriculum report identified this as the highest-priority gap. The fix is thorough: 11-20 as individual forms, 20-100 as decades, all three languages, with practical price and age sentences as anchors. The fact that it still leaves a 2-day window (Days 5-7) where "How much?" is taught before number comprehension is a minor residual issue, not a failure — the overall problem is solved.

**`step1Config.hasAudioOnlyRound: true` is implemented consistently and correctly.** Every day, every language. This is unglamorous data work but it's the infrastructure for a feature that directly addresses one of the curriculum's three critical failures. Clean execution.

**"Apprentice" → "partner" replacement addresses a real tone problem.** The story_report.md specifically cited "He calls the user 'Apprentice!' in the TSX version, which is patronizing." Four instances replaced across the Seoul chapter. Small change, correct call — the condescension was real and it undermined Rudy's characterization as warm-but-professional.
