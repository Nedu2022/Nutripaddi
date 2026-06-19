import AsyncStorage from "@react-native-async-storage/async-storage";

import type { LifeStage, PregnancyTrimester } from "@/types";

export type OnboardingDraft = {
  language?: string | null;
  lifeStage?: LifeStage | null;
  trimester?: PregnancyTrimester | null;
  babyAgeMonths?: number | null;
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  height?: number | null;
  nutritionGoal?: string[] | null;
  eatingLifestyle?: string[] | null;
  healthAwareness?: string[] | null;
  location?: string | null;
};

const KEY = "@nutriPadi_onboarding_draft";

let draft: OnboardingDraft = {};
let hydrated = false;

export function updateOnboardingDraft(patch: Partial<OnboardingDraft>) {
  draft = { ...draft, ...patch };
  AsyncStorage.setItem(KEY, JSON.stringify(draft)).catch(() => {});
}

export function getOnboardingDraft(): OnboardingDraft {
  return draft;
}

export function resetOnboardingDraft() {
  draft = {};
  hydrated = true;
  AsyncStorage.removeItem(KEY).catch(() => {});
}

export async function hydrateOnboardingDraft(): Promise<OnboardingDraft> {
  if (hydrated) return draft;
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        draft = { ...parsed, ...draft };
      }
    }
  } catch {
    return draft;
  }
  return draft;
}
