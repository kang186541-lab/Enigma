import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@react-native-async-storage/async-storage", () =>
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import AsyncStorage from "@react-native-async-storage/async-storage";
import { trackLearningEvent } from "@/lib/learningEvents";
import { loadSpeakMissionHandoff, saveSpeakMissionHandoff } from "@/lib/speakMissionHandoff";

describe("language compatibility guards", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("preserves Indonesian review-to-Speak handoffs instead of falling back to English", async () => {
    const id = await saveSpeakMissionHandoff({
      phrase: "Tolong ulangi.",
      meaning: "Please repeat.",
      speechLang: "id-ID",
      targetLanguage: "indonesian",
      returnDeck: "srs",
    });

    const handoff = await loadSpeakMissionHandoff(id);

    expect(handoff?.phrase).toBe("Tolong ulangi.");
    expect(handoff?.speechLang).toBe("id-ID");
    expect(handoff?.targetLanguage).toBe("indonesian");
    expect(handoff?.returnDeck).toBe("srs");
  });

  it("keeps Indonesian native/target language values in local funnel events", async () => {
    await trackLearningEvent("first_speaking_cta_pressed", {
      surface: "home",
      nativeLanguage: "indonesian",
      targetLanguage: "indonesian",
      goal: "travel",
      dailyGoalMet: false,
    });

    const raw = await AsyncStorage.getItem("@lingua_learning_events_v1");
    const events = JSON.parse(raw ?? "[]") as Array<{ props: Record<string, unknown> }>;

    expect(events).toHaveLength(1);
    expect(events[0].props).toMatchObject({
      surface: "home",
      nativeLanguage: "indonesian",
      targetLanguage: "indonesian",
      goal: "travel",
      dailyGoalMet: false,
    });
  });
});
