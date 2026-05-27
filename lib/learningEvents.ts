import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@lingua_learning_events_v1";
const MAX_EVENTS = 200;

export type LearningEventName =
  | "first_speaking_cta_seen"
  | "first_speaking_cta_pressed"
  | "first_speaking_screen_seen"
  | "first_speaking_attempt_completed"
  | "first_speaking_next_sentence_started"
  | "review_sentence_cta_pressed"
  | "review_sentence_screen_seen"
  | "review_sentence_attempt_completed"
  | "learning_goal_selected"
  | "onboarding_first_speaking_started";

type LearningEventProps = Record<string, string | number | boolean | null | undefined>;

type LearningEvent = {
  name: LearningEventName;
  at: string;
  props: Record<string, string | number | boolean | null>;
};

const ALLOWED_PROP_KEYS: Record<LearningEventName, readonly string[]> = {
  first_speaking_cta_seen: ["surface", "nativeLanguage", "targetLanguage", "goal", "dailyGoalMet"],
  first_speaking_cta_pressed: ["surface", "nativeLanguage", "targetLanguage", "goal", "dailyGoalMet"],
  first_speaking_screen_seen: ["surface", "nativeLanguage", "targetLanguage", "goal"],
  first_speaking_attempt_completed: ["surface", "nativeLanguage", "targetLanguage", "scoreBand", "assessmentStatus", "platform", "goal", "dailySpokenCount", "dailyGoal"],
  first_speaking_next_sentence_started: ["surface", "nativeLanguage", "targetLanguage", "goal", "dailySpokenCount", "dailyGoal"],
  review_sentence_cta_pressed: ["surface", "nativeLanguage", "targetLanguage", "deckType"],
  review_sentence_screen_seen: ["surface", "nativeLanguage", "targetLanguage", "deckType"],
  review_sentence_attempt_completed: ["surface", "nativeLanguage", "targetLanguage", "scoreBand", "assessmentStatus", "platform", "deckType", "dailySpokenCount", "dailyGoal"],
  learning_goal_selected: ["surface", "nativeLanguage", "targetLanguage", "goal"],
  onboarding_first_speaking_started: ["surface", "nativeLanguage", "targetLanguage", "goal"],
};

const ALLOWED_STRING_VALUES: Record<string, readonly string[]> = {
  surface: ["home", "speak", "cards", "onboarding"],
  nativeLanguage: ["korean", "english", "spanish"],
  targetLanguage: ["korean", "english", "spanish"],
  scoreBand: ["pass", "coach", "repair"],
  assessmentStatus: ["scored", "unscored"],
  platform: ["ios", "android", "web", "windows", "macos"],
  goal: ["travel", "work", "study", "hobby", "relationship", "exam", "unknown"],
  deckType: ["srs", "beginner", "advanced"],
};

const BLOCKED_KEY_PATTERN = /(audio|base64|body|comment|email|message|name|payload|phrase|prompt|raw|recognized|text|transcript|word)/i;

function sanitizeProps(name: LearningEventName, props: LearningEventProps = {}): LearningEvent["props"] {
  const allowedKeys = new Set(ALLOWED_PROP_KEYS[name]);
  const out: LearningEvent["props"] = {};
  for (const [key, value] of Object.entries(props)) {
    if (!allowedKeys.has(key)) continue;
    if (BLOCKED_KEY_PATTERN.test(key)) continue;
    if (value === undefined) continue;
    if (typeof value === "string") {
      const allowedValues = ALLOWED_STRING_VALUES[key];
      if (!allowedValues?.includes(value)) continue;
    }
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    out[key] = value;
  }
  return out;
}

export async function trackLearningEvent(name: LearningEventName, props?: LearningEventProps): Promise<void> {
  const event: LearningEvent = {
    name,
    at: new Date().toISOString(),
    props: sanitizeProps(name, props),
  };

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const prev = raw ? JSON.parse(raw) as LearningEvent[] : [];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, event].slice(-MAX_EVENTS)));
  } catch (err) {
    if (__DEV__) console.warn("[LearningEvents] local write failed:", err);
  }

  if (__DEV__) {
    console.log("[LearningEvents]", event.name, event.props);
  }
}
