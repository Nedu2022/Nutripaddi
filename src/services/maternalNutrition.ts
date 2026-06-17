import type { LifeStage, PregnancyTrimester } from "@/types";

/**
 * Maternal nutrition logic for NutriPadi's "First 1,000 Days" focus.
 *
 * These are intentionally simple, transparent rules (not a medical device).
 * They let the app show *tailored* output the moment a mother finishes
 * onboarding — a stage-aware calorie target and the micronutrients that
 * matter most for her, which is what makes hidden-hunger guidance concrete.
 */

const BASE_DAILY_CALORIES = 2200;

/**
 * Extra daily energy needs (kcal) by stage. Pregnancy figures follow the
 * common public-health guidance of roughly +340 kcal in the 2nd trimester
 * and +450 kcal in the 3rd; lactation is roughly +500 kcal.
 */
export function getDailyCalorieTarget(
  stage: LifeStage | null | undefined,
  trimester?: PregnancyTrimester | null
): number {
  if (stage === "pregnant") {
    if (trimester === "second") return BASE_DAILY_CALORIES + 340;
    if (trimester === "third") return BASE_DAILY_CALORIES + 450;
    return BASE_DAILY_CALORIES; // 1st trimester: no significant increase
  }

  if (stage === "nursing") {
    return BASE_DAILY_CALORIES + 500;
  }

  return BASE_DAILY_CALORIES;
}

/**
 * The micronutrients NutriPadi should watch most closely for this user.
 * Pregnant and nursing mothers are flagged for the "hidden hunger" trio
 * (iron, folic acid/folate, protein) that drives maternal and infant outcomes.
 */
export function getMaternalFocusNutrients(
  stage: LifeStage | null | undefined
): string[] {
  if (stage === "pregnant" || stage === "nursing") {
    return ["Iron", "Folic acid", "Protein"];
  }
  return [];
}

/**
 * A short, human-readable summary of the user's maternal context. Safe to
 * include in an AI prompt or to surface in the UI so guidance is personalised.
 */
export function describeMaternalStage(
  stage: LifeStage | null | undefined,
  trimester?: PregnancyTrimester | null,
  babyAgeMonths?: number | null
): string | null {
  if (stage === "pregnant") {
    const tri =
      trimester === "first"
        ? "first trimester"
        : trimester === "second"
          ? "second trimester"
          : trimester === "third"
            ? "third trimester"
            : null;
    return tri ? `Pregnant (${tri})` : "Pregnant";
  }

  if (stage === "nursing") {
    if (typeof babyAgeMonths === "number" && babyAgeMonths >= 0) {
      return `Nursing mother (baby ${babyAgeMonths} month${babyAgeMonths === 1 ? "" : "s"} old)`;
    }
    return "Nursing mother";
  }

  return null;
}
