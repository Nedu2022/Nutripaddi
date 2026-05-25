import type { NutritionEstimate } from "./nutrition";
import type { FreshnessEstimate } from "./freshness";

export type DetectedFoodType =
  | "swallow"
  | "soup"
  | "protein"
  | "rice"
  | "beans"
  | "yam"
  | "plantain"
  | "unknown";

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
  | "nutrition_ready"
  | "saved"
  | "offline";

export type DetectedMealSummary = {
  mealName: string;
  confidence: number;
  portion: DetectedMealPortion;
  localPortionLabel: string;
  detectedItems: DetectedFoodItem[];
  nutrition: NutritionEstimate;
  freshness: FreshnessEstimate;
  advice: string;
};

export type FoodDetectionResult = {
  imageQuality: "good" | "poor";
  summary: DetectedMealSummary | null;
  suggestions?: string[];
};
