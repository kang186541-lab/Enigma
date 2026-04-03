# Quiz Difficulty Ordering Audit

Audit of all quiz/puzzle difficulty ordering across all 5 chapters of the Enigma Language Adventure story mode.

**Difficulty Scale:**
- EASY: dialogue-choice (pick from options), word-match (match word to meaning)
- MEDIUM: writing-mission (type sentences), dialogue-choice with complex context
- HARD: fill-blank (identify missing words), sentence-builder (arrange words in order), investigation (multi-step), cipher

**Rule:** Within each chapter, quizzes MUST go EASY -> MEDIUM -> HARD. Never put a hard quiz before an easy one.

---

## Chapter 1: The London Cipher

| # | pType | Description | Difficulty |
|---|-------|-------------|------------|
| 1st | dialogue-choice | Tom asks who you are; pick correct self-introduction responses (greeting, origin, job) | EASY |
| 2nd | writing-mission | Write out self-introduction sentences to Tom ("Hello, my name is Rudy." / "Nice to meet you.") | MEDIUM |
| 3rd | word-match | Match basic vocabulary to meanings (Hello, Goodbye, Where is...?, I am a...) | EASY |
| 4th | fill-blank | Fill in missing words from Mr. Black's torn note (___ detective / My ___ is Mr. Black / ___ London) | HARD |

**Current order:** EASY -> MEDIUM -> EASY -> HARD

**Verdict: WRONG**

**Problem:** The 3rd quiz (word-match, EASY) comes after the 2nd quiz (writing-mission, MEDIUM). This is a regression from MEDIUM back to EASY before going to HARD.

**Correct order:**
1. dialogue-choice (EASY) -- keep as 1st
2. word-match (EASY) -- move from 3rd to 2nd
3. writing-mission (MEDIUM) -- move from 2nd to 3rd
4. fill-blank (HARD) -- keep as 4th

---

## Chapter 2: The Madrid Disappearance

| # | pType | Description | Difficulty |
|---|-------|-------------|------------|
| 1st | sentence-builder | Arrange Carlos's scrambled cries into correct word order ("Hello I need help", "Where is the bathroom", etc.) | HARD |
| 2nd | writing-mission | Write sentences to order food from Don Miguel ("Excuse me. I would like bread, please." / "How much is this?" / "Thank you very much!") | MEDIUM |
| 3rd | dialogue-choice | Pick correct responses when ordering from Don Miguel (greeting + ordering + accepting food) | EASY |
| 4th | word-match | Match words from Mr. Black's notebook to meanings (editor, wall, goodbye) | EASY |
| 5th | investigation | Answer multi-step questions to unlock the Language Erasure Device (identify "rescue" and "erase" meanings) | HARD |

**Current order:** HARD -> MEDIUM -> EASY -> EASY -> HARD

**Verdict: WRONG**

**Problem:** The entire sequence is inverted. The chapter opens with a HARD puzzle (sentence-builder), drops to MEDIUM (writing-mission), then drops further to EASY (dialogue-choice, word-match), before going back to HARD (investigation). This is the worst ordering of all chapters.

**Correct order:**
1. dialogue-choice (EASY) -- move from 3rd to 1st
2. word-match (EASY) -- move from 4th to 2nd
3. writing-mission (MEDIUM) -- move from 2nd to 3rd
4. sentence-builder (HARD) -- move from 1st to 4th
5. investigation (HARD) -- keep as 5th

---

## Chapter 3: The Seoul Secret

| # | pType | Description | Difficulty |
|---|-------|-------------|------------|
| 1st | writing-mission | Write survival phrases at the airport ("Excuse me. Do you speak English?" / "I don't understand." / "Where is the subway?") | MEDIUM |
| 2nd | word-match | Match story vocabulary to meanings (memory, experiment, conspiracy, frequency) | EASY |
| 3rd | dialogue-choice | Pick correct responses in complex story situations (Junhyuk's password handling, stopping Project Erase) | MEDIUM |
| 4th | sentence-builder | Arrange words to form "Language is the key to freedom" (6 words) | HARD |
| 5th | investigation | Choose strongest evidence to submit to authorities to stop Project Erase | HARD |

**Current order:** MEDIUM -> EASY -> MEDIUM -> HARD -> HARD

**Verdict: WRONG**

**Problem:** The 2nd quiz (word-match, EASY) comes after the 1st quiz (writing-mission, MEDIUM). This is a regression from MEDIUM to EASY.

**Correct order:**
1. word-match (EASY) -- move from 2nd to 1st
2. writing-mission (MEDIUM) -- move from 1st to 2nd
3. dialogue-choice (MEDIUM) -- keep as 3rd
4. sentence-builder (HARD) -- keep as 4th
5. investigation (HARD) -- keep as 5th

---

## Chapter 4: The Cairo Legacy

| # | pType | Description | Difficulty |
|---|-------|-------------|------------|
| 1st | writing-mission | Write direction-asking phrases in Cairo ("Excuse me, where is the market?" / "How far is it?" / "Thank you.") | MEDIUM |
| 2nd | word-match | Match basic objects to meanings (map, key, water) to prove communication ability to Amira | EASY |
| 3rd | dialogue-choice | Navigate complex interrogation with Hassan; deduce Amira's secret about the stone's location | MEDIUM |
| 4th | fill-blank | Decode Miss Penny's encoded messages ("The stone is ___ the oldest step" / "He plans to ___ all seven stones") | HARD |
| 5th | investigation | Identify the fatal flaw in Mr. Black's logic using evidence about his mother's Welsh | HARD |

**Current order:** MEDIUM -> EASY -> MEDIUM -> HARD -> HARD

**Verdict: WRONG**

**Problem:** The 2nd quiz (word-match, EASY) comes after the 1st quiz (writing-mission, MEDIUM). This is a regression from MEDIUM to EASY. Same structural issue as Chapter 3.

**Correct order:**
1. word-match (EASY) -- move from 2nd to 1st
2. writing-mission (MEDIUM) -- move from 1st to 2nd
3. dialogue-choice (MEDIUM) -- keep as 3rd
4. fill-blank (HARD) -- keep as 4th
5. investigation (HARD) -- keep as 5th

---

## Chapter 5: The Last Language (Babel)

| # | pType | Description | Difficulty |
|---|-------|-------------|------------|
| 1st | writing-mission | Rally allies before entering the tower ("Tom, thank you for believing in us." / "Isabel, your brother would be proud." / "Together, we can stop this.") | MEDIUM |
| 2nd | dialogue-choice | Solve English and Spanish language gate riddles to ascend the tower | EASY |
| 3rd | sentence-builder | Build Korean sentence to open Floor 3 gate: "Language is the key to the world" | HARD |
| 4th | word-match | Match philosophical vocabulary (memory, mother tongue, connection) to their true meanings | EASY |
| 5th | investigation | Determine which action breaks the Universal Code activation sequence | HARD |

**Current order:** MEDIUM -> EASY -> HARD -> EASY -> HARD

**Verdict: WRONG**

**Problem:** Multiple violations. The 2nd quiz (dialogue-choice, EASY) comes after the 1st (writing-mission, MEDIUM). The 4th quiz (word-match, EASY) comes after the 3rd (sentence-builder, HARD), which is a severe regression.

**Correct order:**
1. dialogue-choice (EASY) -- move from 2nd to 1st
2. word-match (EASY) -- move from 4th to 2nd
3. writing-mission (MEDIUM) -- move from 1st to 3rd
4. sentence-builder (HARD) -- move from 3rd to 4th
5. investigation (HARD) -- keep as 5th

---

## Summary

| Chapter | Current Order | Correct? | Issues |
|---------|--------------|----------|--------|
| Ch1 London | EASY -> MEDIUM -> EASY -> HARD | WRONG | word-match (EASY) placed after writing-mission (MEDIUM) |
| Ch2 Madrid | HARD -> MEDIUM -> EASY -> EASY -> HARD | WRONG | Opens with HARD, fully inverted; worst offender |
| Ch3 Seoul | MEDIUM -> EASY -> MEDIUM -> HARD -> HARD | WRONG | word-match (EASY) placed after writing-mission (MEDIUM) |
| Ch4 Cairo | MEDIUM -> EASY -> MEDIUM -> HARD -> HARD | WRONG | word-match (EASY) placed after writing-mission (MEDIUM) |
| Ch5 Babel | MEDIUM -> EASY -> HARD -> EASY -> HARD | WRONG | Multiple regressions; EASY after HARD |

**Result: All 5 chapters have WRONG difficulty ordering.**

### Common Patterns

1. **writing-mission placed before word-match:** Chapters 1, 3, 4, and 5 all place a MEDIUM writing-mission before an EASY word-match quiz. This is the most frequent violation.

2. **Chapter 2 is the worst offender:** It opens with a HARD sentence-builder and descends to EASY before climbing back to HARD. The entire ordering is inverted.

3. **Chapter 5 has a double regression:** EASY appears after both MEDIUM and HARD quizzes.

4. **No chapter currently follows the EASY -> MEDIUM -> HARD rule.**
