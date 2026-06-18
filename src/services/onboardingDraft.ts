import type { LifeStage, PregnancyTrimester } from "@/types";

/**
 * Lightweight, module-level store for answers collected across the onboarding
 * screens. Onboarding is a linear flow, so each screen writes its answers here
 * on "Continue" and the final profile-setup screen reads the whole draft to
 * persist it in one upsert. This fixes the previous behaviour where every
 * answer except nickname/photo was discarded.
 */
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

let draft: OnboardingDraft = {};

export function updateOnboardingDraft(patch: Partial<OnboardingDraft>) {
  draft = { ...draft, ...patch };
}

export function getOnboardingDraft(): OnboardingDraft {
  return draft;
}

export function resetOnboardingDraft() {
  draft = {};
}
