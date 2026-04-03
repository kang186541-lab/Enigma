# Story Overhaul Summary
**Date:** 2026-03-29
**File modified:** `app/story-scene.tsx`

---

## Tasks Completed

### TASK 1 — CH1 (London): Speaking Quiz — Introduce Yourself to Tom
- **Inserted at:** line ~383 (after Lingo narration "Tell him who you are and what you do")
- **Type:** `pType: "writing-mission"`
- **Placement:** Between the Lingo narration about Tom and the existing `dialogue-choice` puzzle
- **Questions:** 2 — "Hello, my name is Rudy." / "Nice to meet you."
- **Narrative function:** Player voices their introduction before Tom lets them into the museum

### TASK 2 — CH2 (Madrid): Speaking Quiz — Order from Don Miguel
- **Inserted at:** line ~914 (before Don Miguel's "First, you eat. Then, we talk." line)
- **Type:** `pType: "writing-mission"`
- **Questions:** 3 — ordering bread, asking the price, thanking Don Miguel
- **Narrative function:** Don Miguel won't share intel until you order; speaking quiz gates the conversation

### TASK 3 — CH3 (Seoul): Speaking Quiz — Survive the Airport
- **Inserted at:** Seoul sequence opening, after cinematic narration, before Lingo's "안녕하세요, partner!" line
- **Added:** A new narration scene (Incheon Airport, phone dead, no translator) followed by the puzzle
- **Type:** `pType: "writing-mission"`
- **Questions:** 3 — asking if they speak English, survival phrase for confusion, asking for the subway
- **Narrative function:** Establishes the "Seoul with no phone" detail Rudy later references in Cairo; player must speak Korean to navigate the airport

### TASK 3b — CH1 (London): Eleanor/Ellis Character — Personal Connection to Mr. Black
- **Narration scene added at:** line ~476 (after first Ellis appearance at the crime scene)
  - Rudy notices Ellis's expression when the black coat is mentioned — she recognised something
- **Ellis confession scene added at:** line ~701 (after her warning about six stones, before her eyes go blank)
  - Ellis reveals she trained someone 20 years ago and gave them every technique she knew
  - EN/KO/ES all present

### TASK 4 — CH2 (Madrid): Mr. Black Threatening — Juan Narration
- **Inserted at:** line ~1068 (after the existing narration of Mr. Black disappearing into Retiro Park)
- **New scene:** Lingo narration — Isabel's voice message: "They got Juan." Juan (her brother, who saw Mr. Black at the market) now has only 3 words left.
- **Narrative function:** Raises the stakes from "chess game" to real human cost; foreshadows the device's reach

### TASK 5 — Apprentice References: Global Cleanup
- **Status:** No instances of "Apprentice", "견습생", or "Aprendiz" found in `story-scene.tsx`
- **Conclusion:** Previous agent fully replaced all instances; none remain

---

## Summary of Changes by Chapter

| Chapter | Change Type | Location | Purpose |
|---|---|---|---|
| CH1 London | `writing-mission` puzzle | After Tom intro narration | Player speaks introduction before entering museum |
| CH1 London | Narration scene (Ellis) | After first Ellis appearance | Seeds her connection to Mr. Black |
| CH1 London | Ellis dialogue scene | After 6-stones warning | Confession: she trained Mr. Black 20 years ago |
| CH2 Madrid | `writing-mission` puzzle | Before Don Miguel's "First, you eat" | Player voices food order to unlock info |
| CH2 Madrid | Narration scene (Lingo) | After Mr. Black's park "Goodbye" | Juan collapses — raises stakes, shows real menace |
| CH3 Seoul | Narration scene (airport) | Seoul sequence opener | Establishes phone-dead premise |
| CH3 Seoul | `writing-mission` puzzle | After airport narration | Player navigates airport in Korean without tools |

---

## Technical Notes
- All `writing-mission` puzzles use `{ word: { en, ko, es }, hint: { en, ko, es } }` format (matching `WritingMissionQ` type)
- All new scenes include `text`, `textKo`, `textEs` fields
- TypeScript syntax validated — no trailing commas on last object in arrays
- No large sections rewritten; all changes are targeted inserts
