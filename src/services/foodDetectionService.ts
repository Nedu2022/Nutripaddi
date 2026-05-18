import type {
  DetectedFoodItem,
  DetectedMealPortion,
  DetectedMealSummary,
  FoodDetectionResult,
} from "@/src/types/detection";
import {
  buildMealName,
  getAdviceForMeal,
  getLocalPortionLabel,
  getNutritionForMeal,
} from "@/src/services/nutritionMappingService";

type DetectionFrameInput = {
  tick?: number;
  simulatePoorImage?: boolean;
};

const LIVE_DETECTIONS: DetectedFoodItem[] = [
  { id: "swallow", label: "Pounded Yam", confidence: 91, x: 188, y: 250, type: "swallow", localPortionLabel: "1 normal wrap" },
  { id: "soup",    label: "Egusi Soup",  confidence: 88, x: 116, y: 350, type: "soup",    localPortionLabel: "1 normal bowl" },
  { id: "fish",    label: "Fish",        confidence: 79, x: 246, y: 388, type: "protein", localPortionLabel: "1 piece of fish" },
];

const SHIFTED_DETECTIONS: DetectedFoodItem[] = [
  { id: "swallow", label: "Pounded Yam", confidence: 90, x: 198, y: 258, type: "swallow", localPortionLabel: "1 normal wrap" },
  { id: "soup",    label: "Egusi Soup",  confidence: 89, x: 124, y: 356, type: "soup",    localPortionLabel: "1 normal bowl" },
  { id: "fish",    label: "Fish",        confidence: 81, x: 238, y: 398, type: "protein", localPortionLabel: "1 piece of fish" },
];

const LOW_CONFIDENCE_DETECTIONS: DetectedFoodItem[] = [
  { id: "swallow-low", label: "Amala or Semo", confidence: 64, x: 184, y: 266, type: "swallow" },
];

function averageConfidence(items: DetectedFoodItem[]) {
  if (!items.length) return 0;
  return Math.round(items.reduce((t, i) => t + i.confidence, 0) / items.length);
}

function buildSummary(
  items: DetectedFoodItem[],
  portion: DetectedMealPortion = "normal"
): DetectedMealSummary {
  const dominantType = items[0]?.type ?? "unknown";
  return {
    mealName: buildMealName(items, portion),
    confidence: averageConfidence(items),
    portion,
    localPortionLabel: getLocalPortionLabel(dominantType, portion),
    detectedItems: items,
    nutrition: getNutritionForMeal(items, portion),
    advice: getAdviceForMeal(items, portion),
  };
}

export function enrichSummaryWithPortion(
  summary: DetectedMealSummary,
  portion: DetectedMealPortion
): DetectedMealSummary {
  return {
    ...summary,
    portion,
    mealName: buildMealName(summary.detectedItems, portion),
    localPortionLabel: getLocalPortionLabel(
      summary.detectedItems[0]?.type ?? "unknown",
      portion
    ),
    nutrition: getNutritionForMeal(summary.detectedItems, portion),
    advice: getAdviceForMeal(summary.detectedItems, portion),
  };
}

export function enrichSummaryWithItems(
  summary: DetectedMealSummary,
  items: DetectedFoodItem[]
): DetectedMealSummary {
  return buildSummary(items, summary.portion);
}

export async function detectFoodFromFrame(
  frame?: DetectionFrameInput
): Promise<FoodDetectionResult> {
  if (frame?.simulatePoorImage) return { imageQuality: "poor", summary: null };
  const items =
    frame?.tick && frame.tick % 2 === 0 ? SHIFTED_DETECTIONS : LIVE_DETECTIONS;
  return { imageQuality: "good", summary: buildSummary(items) };
}

export async function detectFoodFromImage(
  imageUri: string
): Promise<FoodDetectionResult> {
  if (!imageUri) return { imageQuality: "poor", summary: null };
  return { imageQuality: "good", summary: buildSummary(LIVE_DETECTIONS) };
}

export function getLowConfidenceMealSummary(): DetectedMealSummary {
  return buildSummary(LOW_CONFIDENCE_DETECTIONS);
}

export function getPortionLabel(portion: DetectedMealPortion): string {
  return getLocalPortionLabel("swallow", portion);
}
