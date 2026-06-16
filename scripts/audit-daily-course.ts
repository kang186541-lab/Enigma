// One-off audit: find progression-blocking shapes in the daily course (루디의 훈련소),
// per (day × learning-language). Mirrors the Step2KeyPoint / Step4 render guards.
//
//   STUCK conditions checked:
//   - step2 quiz type "fill_blank" or "select" WITHOUT a usable options array
//     (renderer shows no answer UI → dead-end)
//   - "select"/"fill_blank" answer NOT in options (can never be marked correct)
//   - arabic: 0 answerable step2 quizzes after skipping input(+listening)
//   - missing LESSON / MISSION / REVIEW block for a day×lang
//   - review "fill_blank" question without options
//
// Run: npx tsx scripts/audit-daily-course.ts
import { LESSON_CONTENT_IMPROVED, MISSION_CONTENT_IMPROVED, REVIEW_CONTENT_IMPROVED } from "../data/dailyCourse/day1_6_improved";
import { LESSON_CONTENT_UNIT2, MISSION_CONTENT_UNIT2, REVIEW_CONTENT_UNIT2 } from "../data/dailyCourse/day7_12_unit2";
import { LESSON_CONTENT_UNIT3, MISSION_CONTENT_UNIT3, REVIEW_CONTENT_UNIT3 } from "../data/dailyCourse/day13_18_unit3";
import { LESSON_CONTENT_UNIT4, MISSION_CONTENT_UNIT4, REVIEW_CONTENT_UNIT4 } from "../data/dailyCourse/day19_24_unit4";
import { LESSON_CONTENT_UNIT5, MISSION_CONTENT_UNIT5, REVIEW_CONTENT_UNIT5 } from "../data/dailyCourse/day25_30_unit5";

const LESSON: any = { ...LESSON_CONTENT_IMPROVED, ...LESSON_CONTENT_UNIT2, ...LESSON_CONTENT_UNIT3, ...LESSON_CONTENT_UNIT4, ...LESSON_CONTENT_UNIT5 };
const MISSION: any = { ...MISSION_CONTENT_IMPROVED, ...MISSION_CONTENT_UNIT2, ...MISSION_CONTENT_UNIT3, ...MISSION_CONTENT_UNIT4, ...MISSION_CONTENT_UNIT5 };
const REVIEW: any = { ...REVIEW_CONTENT_IMPROVED, ...REVIEW_CONTENT_UNIT2, ...REVIEW_CONTENT_UNIT3, ...REVIEW_CONTENT_UNIT4, ...REVIEW_CONTENT_UNIT5 };

const LANGS = ["english", "spanish", "korean", "indonesian", "arabic"] as const;
const norm = (s: string) => (s ?? "").trim().toLowerCase().replace(/[ً-ْٰـ]/g, ""); // strip harakat/tatweel
const dayNum = (k: string) => parseInt(k.replace(/\D/g, ""), 10) || 0;
const dayKeys = Object.keys(LESSON).sort((a, b) => dayNum(a) - dayNum(b));

let stuck = 0, warn = 0;
const log = (s: string) => console.log(s);
const STUCK = (s: string) => { log("  🛑 " + s); stuck++; };
const WARN = (s: string) => { log("  ⚠️  " + s); warn++; };

const typeHisto: Record<string, number> = {};
const langTypeHisto: Record<string, Record<string, number>> = {};

for (const k of dayKeys) {
  log(`\n=== ${k} (day ${dayNum(k)}) ===`);
  for (const lang of LANGS) {
    const L = LESSON[k]?.[lang];
    if (!L) { if (lang === "arabic") STUCK(`${lang}: LESSON block MISSING`); continue; }
    const quizzes: any[] = L.step2?.quizzes ?? [];
    let answerable = 0;
    quizzes.forEach((q, i) => {
      typeHisto[q.type] = (typeHisto[q.type] ?? 0) + 1;
      langTypeHisto[lang] = langTypeHisto[lang] ?? {};
      langTypeHisto[lang][q.type] = (langTypeHisto[lang][q.type] ?? 0) + 1;
      const hasShape = !!(q.promptWithBlank && q.answer && q.fullSentence);
      if (q.type === "listening") return;                 // guard skips (no promptWithBlank)
      if (!hasShape) { WARN(`${lang} step2#${i} type=${q.type}: missing prompt/answer/fullSentence → skipped (no practice)`); return; }
      if (q.type === "input") { if (lang === "arabic") return; answerable++; return; } // arabic skips input
      if (q.type === "select" || q.type === "fill_blank") {
        const opts: string[] = q.options ?? [];
        if (!opts.length) { STUCK(`${lang} step2#${i} type=${q.type} "${q.promptWithBlank}": NO options → no answer UI → STUCK`); return; }
        if (!opts.some((o) => norm(o) === norm(q.answer))) STUCK(`${lang} step2#${i} type=${q.type}: answer "${q.answer}" ∉ options [${opts.join(" | ")}]`);
        answerable++;
        return;
      }
      WARN(`${lang} step2#${i}: unknown type "${q.type}"`);
    });
    if (lang === "arabic" && answerable === 0 && quizzes.length > 0) STUCK(`arabic: Step2 has 0 answerable quizzes after skips (input/listening only) → empty step`);
    if (lang === "arabic" && (!Array.isArray(L.step1Sentences) || L.step1Sentences.length === 0)) STUCK(`arabic: step1Sentences empty`);

    if (lang === "arabic" && !MISSION[k]?.[lang]) STUCK(`arabic: MISSION block MISSING`);

    const R: any = REVIEW[k]?.[lang];
    if (lang === "arabic" && !R) { STUCK(`arabic: REVIEW block MISSING`); }
    else if (R) {
      const rqs: any[] = Array.isArray(R) ? R : (R.questions ?? []);
      rqs.forEach((rq, i) => {
        if (rq?.type === "fill_blank") {
          const opts: string[] = rq.options ?? [];
          if (!opts.length) STUCK(`${lang} review#${i} fill_blank: NO options → STUCK`);
          else if (!opts.some((o) => norm(o) === norm(rq.answer))) STUCK(`${lang} review#${i} fill_blank: answer "${rq.answer}" ∉ options`);
        }
      });
    }
  }
}

log(`\n──────── SUMMARY ────────`);
log(`days audited: ${dayKeys.length} (${dayKeys.join(", ")})`);
log(`step2 quiz type histogram (all langs): ${JSON.stringify(typeHisto)}`);
for (const lang of LANGS) log(`  ${lang}: ${JSON.stringify(langTypeHisto[lang] ?? {})}`);
log(`🛑 STUCK conditions: ${stuck}`);
log(`⚠️  warnings (skipped, no hard stuck): ${warn}`);
