import { describe, it, expect, jest } from "@jest/globals";

// ---------------------------------------------------------------------------
// progressSync.ts has a TOP-LEVEL `import { supabase } from "@/lib/supabase"`
// and, at module-load time, calls supabase.auth.getSession() and
// supabase.auth.onAuthStateChange(...). lib/supabase.ts in turn imports
// react-native + @react-native-async-storage/async-storage AND throws if
// EXPO_PUBLIC_SUPABASE_* env vars are unset.
//
// The merge helpers under test are otherwise PURE. To exercise them without
// dragging in native code we mock @/lib/supabase with a stub that satisfies
// the module-load-time calls. (See report: the cleaner long-term fix is to
// extract these helpers into a dep-free lib/progressMerge.ts.)
// ---------------------------------------------------------------------------
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      getUser: () => Promise.resolve({ data: { user: null } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
      upsert: () => Promise.resolve({ error: null }),
    }),
  },
}));

// eslint-disable-next-line import/first
import {
  mergeStringArrayBlob,
  mergeWeeklyXpBlob,
  mergeNumericRecordBlob,
  mergeStringRecordBlob,
  mergeStoryProgressBlob,
  mergeStoryCluesBlob,
  mergeStoryIoRatioBlob,
  mergeExpressionBookBlob,
} from "@/lib/progressSync";

describe("mergeStringArrayBlob", () => {
  it("dedups case-insensitively, remote-first then local", () => {
    expect(mergeStringArrayBlob(["b", "c"], ["a", "b"])).toEqual(["a", "b", "c"]);
  });

  it("treats whitespace/case collisions as duplicates (keeps first-seen casing)", () => {
    // remote "No" seen first; local "no" collides and is dropped.
    expect(mergeStringArrayBlob([" no ", "yes"], ["No"])).toEqual(["No", "yes"]);
  });

  it("handles empty inputs", () => {
    expect(mergeStringArrayBlob([], [])).toEqual([]);
    expect(mergeStringArrayBlob(["x"], [])).toEqual(["x"]);
    expect(mergeStringArrayBlob([], ["y"])).toEqual(["y"]);
  });

  it("coerces non-array inputs to empty (no throw)", () => {
    expect(mergeStringArrayBlob(null, undefined)).toEqual([]);
    expect(mergeStringArrayBlob("notarray", 42)).toEqual([]);
    expect(mergeStringArrayBlob({ a: 1 }, ["ok"])).toEqual(["ok"]);
  });

  it("filters out non-string and blank items", () => {
    expect(mergeStringArrayBlob([1, "good", "  ", null] as unknown, ["x"])).toEqual([
      "x",
      "good",
    ]);
  });
});

describe("mergeWeeklyXpBlob", () => {
  it("local week newer -> local wins", () => {
    const local = { week: 5, xp: 10 };
    const remote = { week: 4, xp: 999 };
    expect(mergeWeeklyXpBlob(local, remote)).toBe(local);
  });

  it("remote week newer -> remote wins", () => {
    const local = { week: 3, xp: 999 };
    const remote = { week: 6, xp: 1 };
    expect(mergeWeeklyXpBlob(local, remote)).toBe(remote);
  });

  it("equal week -> takes max xp", () => {
    expect(mergeWeeklyXpBlob({ week: 7, xp: 40 }, { week: 7, xp: 90 })).toEqual({
      week: 7,
      xp: 90,
    });
    expect(mergeWeeklyXpBlob({ week: 7, xp: 120 }, { week: 7, xp: 90 })).toEqual({
      week: 7,
      xp: 120,
    });
  });

  it("null/non-record local -> returns remote", () => {
    const remote = { week: 2, xp: 5 };
    expect(mergeWeeklyXpBlob(null, remote)).toBe(remote);
  });

  it("null/non-record remote -> returns local", () => {
    const local = { week: 2, xp: 5 };
    expect(mergeWeeklyXpBlob(local, null)).toBe(local);
  });

  it("missing week numbers default to 0 and merge takes max xp", () => {
    expect(mergeWeeklyXpBlob({ xp: 10 }, { xp: 30 })).toEqual({ week: 0, xp: 30 });
  });
});

describe("mergeNumericRecordBlob", () => {
  it("takes the max per key", () => {
    expect(
      mergeNumericRecordBlob({ a: 5, b: 2 }, { a: 1, b: 9 }),
    ).toEqual({ a: 5, b: 9 });
  });

  it("includes keys present in only one side", () => {
    expect(
      mergeNumericRecordBlob({ a: 5, only_local: 3 }, { b: 9, only_remote: 7 }),
    ).toEqual({ a: 5, only_local: 3, b: 9, only_remote: 7 });
  });

  it("ignores non-numeric values", () => {
    expect(
      mergeNumericRecordBlob({ a: "x", b: 4 } as unknown, { a: 2, c: null } as unknown),
    ).toEqual({ a: 2, b: 4 });
  });

  it("coerces non-record inputs to empty", () => {
    expect(mergeNumericRecordBlob(null, undefined)).toEqual({});
    expect(mergeNumericRecordBlob([1, 2] as unknown, "x")).toEqual({});
  });
});

describe("mergeStringRecordBlob", () => {
  it("local wins per key", () => {
    expect(
      mergeStringRecordBlob({ mood: "happy" }, { mood: "sad", extra: "remote" }),
    ).toEqual({ mood: "happy", extra: "remote" });
  });

  it("includes remote-only and local-only keys", () => {
    expect(
      mergeStringRecordBlob({ a: "la" }, { b: "rb" }),
    ).toEqual({ a: "la", b: "rb" });
  });

  it("ignores non-string values and non-record inputs", () => {
    expect(mergeStringRecordBlob({ a: 5 } as unknown, { a: "remote" })).toEqual({
      a: "remote",
    });
    expect(mergeStringRecordBlob(null, null)).toEqual({});
  });
});

describe("mergeStoryProgressBlob", () => {
  it("dedups completed and unlocked", () => {
    const result = mergeStoryProgressBlob(
      { completed: ["paris"], unlocked: ["paris"] },
      { completed: ["paris", "rome"], unlocked: ["rome"] },
    );
    expect(result.completed).toEqual(["paris", "rome"]);
    // remote-first ordering, london is force-prepended to local side then merged.
    expect(result.unlocked).toEqual(expect.arrayContaining(["london", "rome", "paris"]));
  });

  it('always unlocks "london"', () => {
    const result = mergeStoryProgressBlob({}, {});
    expect(result.completed).toEqual([]);
    expect(result.unlocked).toContain("london");
  });

  it('keeps london unlocked even when neither side lists it', () => {
    const result = mergeStoryProgressBlob(
      { unlocked: ["paris"] },
      { unlocked: ["rome"] },
    );
    expect(result.unlocked).toContain("london");
    expect(result.unlocked).toContain("paris");
    expect(result.unlocked).toContain("rome");
  });

  it("handles non-record inputs gracefully", () => {
    const result = mergeStoryProgressBlob(null, "garbage");
    expect(result.completed).toEqual([]);
    expect(result.unlocked).toEqual(["london"]);
  });
});

describe("mergeStoryCluesBlob", () => {
  it("dedups string arrays per chapter", () => {
    const result = mergeStoryCluesBlob(
      { ch1: ["clueA", "clueB"] },
      { ch1: ["clueB", "clueC"], ch2: ["clueD"] },
    );
    expect(result.ch1).toEqual(["clueB", "clueC", "clueA"]);
    expect(result.ch2).toEqual(["clueD"]);
  });

  it("merges chapters present on only one side", () => {
    const result = mergeStoryCluesBlob({ local_ch: ["x"] }, { remote_ch: ["y"] });
    expect(result).toEqual({ local_ch: ["x"], remote_ch: ["y"] });
  });

  it("handles non-record inputs", () => {
    expect(mergeStoryCluesBlob(null, undefined)).toEqual({});
  });
});

describe("mergeStoryIoRatioBlob", () => {
  it("takes per-chapter max of inputCount / outputCount", () => {
    const result = mergeStoryIoRatioBlob(
      { chapters: { ch1: { inputCount: 5, outputCount: 2 } } },
      { chapters: { ch1: { inputCount: 3, outputCount: 8 } } },
    ) as { chapters: Record<string, { inputCount: number; outputCount: number }> };
    expect(result.chapters.ch1).toEqual({ inputCount: 5, outputCount: 8 });
  });

  it("includes chapters present on only one side", () => {
    const result = mergeStoryIoRatioBlob(
      { chapters: { local_ch: { inputCount: 1, outputCount: 1 } } },
      { chapters: { remote_ch: { inputCount: 2, outputCount: 2 } } },
    ) as { chapters: Record<string, { inputCount: number; outputCount: number }> };
    expect(result.chapters.local_ch).toEqual({ inputCount: 1, outputCount: 1 });
    expect(result.chapters.remote_ch).toEqual({ inputCount: 2, outputCount: 2 });
  });

  it("defaults missing counts to 0", () => {
    const result = mergeStoryIoRatioBlob(
      { chapters: { ch1: {} } },
      { chapters: { ch1: { inputCount: 4 } } },
    ) as { chapters: Record<string, { inputCount: number; outputCount: number }> };
    expect(result.chapters.ch1).toEqual({ inputCount: 4, outputCount: 0 });
  });

  it("handles non-record inputs (empty chapters)", () => {
    const result = mergeStoryIoRatioBlob(null, undefined) as {
      chapters: Record<string, unknown>;
    };
    expect(result.chapters).toEqual({});
  });
});

describe("mergeExpressionBookBlob", () => {
  it("dedups by phrase (case-insensitive) and merges fields", () => {
    const result = mergeExpressionBookBlob(
      {
        expressions: [
          { phrase: "Hello", meaning: "local-meaning", mastered: true, tprsStage: 3 },
        ],
      },
      {
        expressions: [
          { phrase: "hello", meaning: "remote-meaning", mastered: false, tprsStage: 5 },
        ],
      },
    ) as { expressions: Record<string, unknown>[] };

    expect(result.expressions).toHaveLength(1);
    const merged = result.expressions[0];
    // local phrase casing wins (firstNonEmpty(local, remote)).
    expect(merged.phrase).toBe("Hello");
    // local meaning wins.
    expect(merged.meaning).toBe("local-meaning");
    // mastered OR'd; tprsStage maxed.
    expect(merged.mastered).toBe(true);
    expect(merged.tprsStage).toBe(5);
  });

  it("keeps distinct phrases", () => {
    const result = mergeExpressionBookBlob(
      { expressions: [{ phrase: "uno", meaning: "one" }] },
      { expressions: [{ phrase: "dos", meaning: "two" }] },
    ) as { expressions: { phrase: string }[] };
    const phrases = result.expressions.map((e) => e.phrase).sort();
    expect(phrases).toEqual(["dos", "uno"]);
  });

  it("skips items without a valid string phrase", () => {
    const result = mergeExpressionBookBlob(
      { expressions: [{ meaning: "no phrase" }, { phrase: "  " }] },
      { expressions: [{ phrase: "valid", meaning: "ok" }] },
    ) as { expressions: { phrase: string }[] };
    expect(result.expressions).toHaveLength(1);
    expect(result.expressions[0].phrase).toBe("valid");
  });

  it("handles non-record / missing-expressions inputs", () => {
    const result = mergeExpressionBookBlob(null, undefined) as {
      expressions: unknown[];
    };
    expect(result.expressions).toEqual([]);
  });
});
