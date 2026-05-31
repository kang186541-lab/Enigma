import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// jest-expo does not auto-mock AsyncStorage; wire in the official in-memory mock
// the package ships so the guide functions exercise real read/write logic.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// eslint-disable-next-line import/first
import AsyncStorage from "@react-native-async-storage/async-storage";
// eslint-disable-next-line import/first
import {
  getNextGuideIndex,
  getGuideIndex,
  advanceGuideIndex,
  migrateGuideIfStale,
  resetGuideForDrip,
  showGuideCardByMilestone,
} from "@/components/RudyGuideModal";

// Behavioral coverage for the Rudy guide daily-drip — exercises the real
// AsyncStorage read/write logic (jest-expo auto-mocks AsyncStorage in-memory),
// not just a source-string match. Guards the invariants hardened in the
// card-index / NaN / focus-foreground / lock / no-rewind rounds.

const GUIDE_KEY = "rudy_guide_index";
const GUIDE_LAST_SHOWN_KEY = "rudy_guide_last_shown";
const DECK_LENGTH = 13;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("Rudy guide daily drip", () => {
  it("starts at card 0 on a fresh install", async () => {
    expect(await getNextGuideIndex()).toBe(0);
  });

  it("advances exactly one card and throttles to once per day", async () => {
    expect(await getNextGuideIndex()).toBe(0);
    await advanceGuideIndex(0);
    expect(await AsyncStorage.getItem(GUIDE_KEY)).toBe("1");
    expect(await AsyncStorage.getItem(GUIDE_LAST_SHOWN_KEY)).toBe(todayStr());
    // same calendar day → throttled, no second card
    expect(await getNextGuideIndex()).toBeNull();
  });

  it("shows the next card on a new day", async () => {
    await AsyncStorage.setItem(GUIDE_KEY, "1");
    await AsyncStorage.setItem(GUIDE_LAST_SHOWN_KEY, "2000-01-01");
    expect(await getNextGuideIndex()).toBe(1);
  });

  it("stops permanently at the end of the deck (no wrap to 0)", async () => {
    await AsyncStorage.setItem(GUIDE_KEY, String(DECK_LENGTH));
    await AsyncStorage.setItem(GUIDE_LAST_SHOWN_KEY, "2000-01-01");
    expect(await getNextGuideIndex()).toBeNull();
  });

  it("normalizes a corrupt stored index to 0 (no NaN crash path)", async () => {
    await AsyncStorage.setItem(GUIDE_KEY, "abc");
    await AsyncStorage.setItem(GUIDE_LAST_SHOWN_KEY, "2000-01-01");
    expect(await getNextGuideIndex()).toBe(0);
  });

  it("advances by the card actually shown, not the stored index (skip-proof)", async () => {
    // Storage says 9, but the user saw card 7 (e.g. a milestone write raced in).
    await AsyncStorage.setItem(GUIDE_KEY, "9");
    await advanceGuideIndex(7);
    expect(await AsyncStorage.getItem(GUIDE_KEY)).toBe("8"); // 7+1, never 9+1
  });

  it("migrateGuideIfStale never rewinds a mid-drip index", async () => {
    await AsyncStorage.setItem(GUIDE_KEY, "10");
    await migrateGuideIfStale();
    expect(await AsyncStorage.getItem(GUIDE_KEY)).toBe("10"); // no rewind back to 8
    expect(await AsyncStorage.getItem("rudy_guide_drip_v2")).toBe("1");
  });

  it("milestone fast-forwards only forward and only past the philosophy block", async () => {
    // behind the philosophy block (idx 5) → no-op
    await AsyncStorage.setItem(GUIDE_KEY, "5");
    expect(await showGuideCardByMilestone(8)).toBeNull();
    expect(await AsyncStorage.getItem(GUIDE_KEY)).toBe("5");
    // past philosophy (idx 7) and behind target → fast-forward to 8
    await AsyncStorage.setItem(GUIDE_KEY, "7");
    expect(await showGuideCardByMilestone(8)).toBe(8);
    expect(await AsyncStorage.getItem(GUIDE_KEY)).toBe("8");
    // already at/past target → no rewind
    await AsyncStorage.setItem(GUIDE_KEY, "9");
    expect(await showGuideCardByMilestone(8)).toBeNull();
    expect(await AsyncStorage.getItem(GUIDE_KEY)).toBe("9");
  });

  it("resetGuideForDrip clears state back to card 0", async () => {
    await AsyncStorage.setItem(GUIDE_KEY, "5");
    await AsyncStorage.setItem(GUIDE_LAST_SHOWN_KEY, todayStr());
    await resetGuideForDrip();
    expect(await getNextGuideIndex()).toBe(0);
  });

  it("getGuideIndex reports the normalized drip pointer, ignoring the daily throttle", async () => {
    expect(await getGuideIndex()).toBe(0);
    await AsyncStorage.setItem(GUIDE_KEY, "8");
    expect(await getGuideIndex()).toBe(8); // unaffected by GUIDE_LAST_SHOWN_KEY
    await AsyncStorage.setItem(GUIDE_KEY, "abc");
    expect(await getGuideIndex()).toBe(0); // corrupt value normalized to 0
  });

  it("serializes concurrent advances without losing an update (withGuideLock)", async () => {
    // Two fire-and-forget advances with no explicit index must not interleave
    // their read-modify-write; 0 → 1 → 2, never 0 → 1 (a lost update).
    await Promise.all([advanceGuideIndex(), advanceGuideIndex()]);
    expect(await AsyncStorage.getItem(GUIDE_KEY)).toBe("2");
  });
});
