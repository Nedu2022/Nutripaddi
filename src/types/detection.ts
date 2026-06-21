import type { NutritionEstimate } from "./nutrition";
import type { FreshnessEstimate } from "./freshness";

export type DetectedFoodType = string;

export type FoodCorrectionOption = {
  label: string;
  type?: DetectedFoodType;
};

export type DetectedFoodItem = {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  type: DetectedFoodType;
  localPortionLabel?: string;
};

export type DetectedMealPortion = "small" | "normal" | "large";

export type ScanState =
  | "idle"
  | "scanning"
  | "detecting"
  | "good_match"
  | "low_confidence"
  | "poor_image"
  | "no_food"
  | "nutrition_ready"
  | "saved"
  | "offline";

export type DetectedMealSummary = {
  mealName: string;
  confidence: number;
  portion: DetectedMealPortion;
  localPortionLabel: string;
  detectedItems: DetectedFoodItem[];
  correctionOptions?: FoodCorrectionOption[];
  nutrition: NutritionEstimate;
  freshness: FreshnessEstimate;
  advice: string;
};

export type FoodDetectionResult = {
  imageQuality: "good" | "poor";
  summary: DetectedMealSummary | null;
  advice_source?: "mamabot" | "rules" | string | null;
  suggestions?: string[];
  user_status?: "pregnant" | "breastfeeding" | "other";
};
