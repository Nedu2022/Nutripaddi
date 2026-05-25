import type {
  DetectedFoodItem,
  DetectedFoodType,
} from "@/src/types/detection";
import type { FreshnessEstimate, FreshnessTone } from "@/src/types/freshness";
import type { AfricanFood, FoodCategory } from "@/types";

const FRESHNESS_DISCLAIMER =
  "Freshness is a visual estimate only. Do not eat food that smells off, has stayed warm too long, or is past its expiry date.";

const TYPE_BASE_SCORE: Record<DetectedFoodType, number> = {
  swallow: 88,
  soup: 82,
  protein: 78,
  rice: 80,
  beans: 81,
  yam: 84,
  plantain: 83,
  unknown: 70,
};

const CATEGORY_BASE_SCORE: Record<FoodCategory, number> = {
  Swallows: 88,
  Soups: 82,
  "Rice Meals": 80,
  "Beans Meals": 81,
  "Yam Meals": 84,
  "Protein-rich Meals": 78,
  "Light Meals": 86,
  "High-carb Meals": 79,
  Stews: 80,
  Others: 74,
};

const QUICK_SPOIL_TYPES: DetectedFoodType[] = [
  "soup",
  "protein",
  "rice",
  "beans",
];

const QUICK_SPOIL_CATEGORIES: FoodCategory[] = [
  "Soups",
  "Stews",
  "Rice Meals",
  "Beans Meals",
  "Protein-rich Meals",
];

function clampScore(score: number) {
  return Math.min(Math.max(Math.round(score), 35), 96);
}

function getTone(score: number): FreshnessTone {
  if (score >= 72) return "good";
  if (score >= 58) return "caution";
  return "risk";
}

function getLabel(score: number) {
  if (score >= 86) return "Very fresh";
  if (score >= 72) return "Looks fresh";
  if (score >= 58) return "Use soon";
  return "Check before eating";
}

function getSummary(score: number, hasQuickSpoilFood: boolean) {
  if (score >= 86) {
    return "The visible food looks recently prepared from the current scan.";
  }

  if (score >= 72) {
    return hasQuickSpoilFood
      ? "The food looks okay, but soups, rice, beans, and protein need careful storage."
      : "The visible food still looks fine from the current scan.";
  }

  if (score >= 58) {
    return "Eat soon and check smell, texture, and storage time before eating.";
  }

  return "This needs a closer check before eating. Trust smell, storage time, and expiry information over the score.";
}

function getConfidenceAdjustment(confidence: number) {
  if (confidence >= 90) return 4;
  if (confidence >= 80) return 0;
  if (confidence >= 70) return -10;
  return -22;
}

function getStorageTipForTypes(types: DetectedFoodType[]) {
  if (types.some((type) => QUICK_SPOIL_TYPES.includes(type))) {
    return "Eat soon. If cooked food has been at room temperature for about 2 hours, refrigerate it or reheat it properly before eating.";
  }

  if (types.some((type) => type === "swallow" || type === "yam" || type === "plantain")) {
    return "Keep covered and eat warm. Discard it if it smells sour, feels slimy, or has visible mould.";
  }

  return "Check smell, texture, storage time, and expiry information before eating.";
}

function getStorageTipForCategory(category: FoodCategory) {
  if (QUICK_SPOIL_CATEGORIES.includes(category)) {
    return "Eat soon. If cooked food has been at room temperature for about 2 hours, refrigerate it or reheat it properly before eating.";
  }

  return "Keep covered and check smell, texture, storage time, and expiry information before eating.";
}

function buildEstimate(
  score: number,
  hasQuickSpoilFood: boolean,
  signals: string[],
  storageTip: string
): FreshnessEstimate {
  const clamped = clampScore(score);

  return {
    score: clamped,
    label: getLabel(clamped),
    tone: getTone(clamped),
    summary: getSummary(clamped, hasQuickSpoilFood),
    signals,
    storageTip,
    disclaimer: FRESHNESS_DISCLAIMER,
  };
}

export function getFreshnessForDetectedMeal(
  items: DetectedFoodItem[],
  confidence: number
): FreshnessEstimate {
  if (!items.length) {
    return buildEstimate(
      58 + getConfidenceAdjustment(confidence),
      true,
      ["No clear food group was detected.", "Use smell and storage time before eating."],
      "Retake the scan in good light, then check smell, texture, and storage time before eating."
    );
  }

  const types = items.map((item) => item.type);
  const hasQuickSpoilFood = types.some((type) => QUICK_SPOIL_TYPES.includes(type));
  const averageBase =
    types.reduce((total, type) => total + TYPE_BASE_SCORE[type], 0) /
    types.length;
  const unknownPenalty = types.includes("unknown") ? 7 : 0;
  const mixedMealPenalty = items.length > 2 ? 2 : 0;
  const quickSpoilPenalty = hasQuickSpoilFood ? 3 : 0;
  const score =
    averageBase +
    getConfidenceAdjustment(confidence) -
    unknownPenalty -
    mixedMealPenalty -
    quickSpoilPenalty;

  const signals = [
    confidence >= 85
      ? "Food match is clear enough for a freshness estimate."
      : "Food match is still uncertain, so freshness confidence is lower.",
    hasQuickSpoilFood
      ? "Contains cooked food that can spoil faster if left warm."
      : "Detected food group is generally stable when covered and kept clean.",
  ];

  if (types.includes("soup")) {
    signals.push("Soup texture and colour are part of the visual check.");
  }

  if (types.includes("protein")) {
    signals.push("Protein freshness depends strongly on smell and storage time.");
  }

  return buildEstimate(
    score,
    hasQuickSpoilFood,
    signals,
    getStorageTipForTypes(types)
  );
}

export function getFreshnessForFood(
  food: AfricanFood,
  confidence = 86
): FreshnessEstimate {
  const hasQuickSpoilFood = QUICK_SPOIL_CATEGORIES.includes(food.category);
  const score =
    CATEGORY_BASE_SCORE[food.category] +
    getConfidenceAdjustment(confidence) -
    (hasQuickSpoilFood ? 3 : 0);

  const signals = [
    `${food.category} freshness baseline used for this estimate.`,
    hasQuickSpoilFood
      ? "This food category needs careful storage after cooking."
      : "This food category is usually stable when kept covered and clean.",
  ];

  return buildEstimate(
    score,
    hasQuickSpoilFood,
    signals,
    getStorageTipForCategory(food.category)
  );
}
