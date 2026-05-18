import type { DetectedFoodItem, DetectedMealPortion } from "@/src/types/detection";
import type { NutritionEstimate } from "@/src/types/nutrition";

// Per-normal-portion nutrition for each food type (West African composition reference)
const BASE_NUTRITION: Record<
  string,
  { calories: number; carbs: number; protein: number; fat: number; fibre: number }
> = {
  swallow:  { calories: 285, carbs: 62, protein: 4,  fat: 1,  fibre: 1 },
  soup:     { calories: 220, carbs: 11, protein: 12, fat: 17, fibre: 4 },
  protein:  { calories: 125, carbs: 0,  protein: 20, fat: 5,  fibre: 0 },
  rice:     { calories: 310, carbs: 68, protein: 6,  fat: 2,  fibre: 1 },
  beans:    { calories: 235, carbs: 40, protein: 16, fat: 2,  fibre: 8 },
  yam:      { calories: 185, carbs: 43, protein: 2,  fat: 0,  fibre: 2 },
  plantain: { calories: 165, carbs: 38, protein: 1,  fat: 0,  fibre: 3 },
  unknown:  { calories: 110, carbs: 15, protein: 5,  fat: 3,  fibre: 1 },
};

const PORTION_MULTIPLIERS: Record<DetectedMealPortion, number> = {
  small: 0.65,
  normal: 1.0,
  large: 1.45,
};

const SOURCE_LABEL = "Based on West African Food Composition reference";
const DISCLAIMER =
  "Estimated nutrition — values may vary by cooking method and exact portion size.";

export function getNutritionForMeal(
  items: DetectedFoodItem[],
  portion: DetectedMealPortion
): NutritionEstimate {
  const m = PORTION_MULTIPLIERS[portion];
  const totals = items.reduce(
    (acc, item) => {
      const base = BASE_NUTRITION[item.type] ?? BASE_NUTRITION.unknown;
      return {
        calories: acc.calories + base.calories,
        carbs:    acc.carbs    + base.carbs,
        protein:  acc.protein  + base.protein,
        fat:      acc.fat      + base.fat,
        fibre:    acc.fibre    + base.fibre,
      };
    },
    { calories: 0, carbs: 0, protein: 0, fat: 0, fibre: 0 }
  );

  return {
    calories: Math.round(totals.calories * m),
    carbs:    Math.round(totals.carbs    * m),
    protein:  Math.round(totals.protein  * m),
    fat:      Math.round(totals.fat      * m),
    fibre:    Math.round(totals.fibre    * m),
    sourceLabel: SOURCE_LABEL,
    disclaimer:  DISCLAIMER,
  };
}

export function getAdviceForMeal(
  items: DetectedFoodItem[],
  portion: DetectedMealPortion
): string {
  const types = items.map((i) => i.type);
  const hasSwallow = types.includes("swallow");
  const hasProtein = types.includes("protein");
  const hasSoup    = types.includes("soup");
  const hasRice    = types.includes("rice");
  const hasBeans   = types.includes("beans");

  if (hasBeans) {
    return "Beans is a great source of protein and fibre. This is a filling and balanced meal for your body.";
  }
  if (hasRice && hasProtein) {
    return "Rice with protein is a good combination. Try to add vegetables or salad to round it out.";
  }
  if (hasSwallow && hasSoup && hasProtein) {
    return "Good combination! Swallow with soup and protein gives you steady energy throughout the day.";
  }
  if (hasSwallow && hasSoup && !hasProtein) {
    return "This meal has plenty carbohydrates. Try adding fish, egg, beans, or chicken to increase your protein.";
  }
  if (hasSwallow && portion === "large") {
    return "This is a large portion. If you are watching your weight, consider reducing the swallow next time and adding more vegetables.";
  }
  return "Remember to drink enough water with this meal. It helps digestion and keeps you feeling full longer.";
}

export function getLocalPortionLabel(
  dominantType: string,
  portion: DetectedMealPortion
): string {
  switch (dominantType) {
    case "swallow":
      return portion === "small"
        ? "Small swallow"
        : portion === "large"
        ? "2 wraps / big swallow"
        : "1 normal wrap";
    case "rice":
      return portion === "small"
        ? "Half plate of rice"
        : portion === "large"
        ? "Full plate of rice"
        : "1 normal plate";
    case "soup":
      return portion === "small"
        ? "Small bowl of soup"
        : portion === "large"
        ? "Plenty soup"
        : "Normal bowl of soup";
    case "beans":
      return portion === "small"
        ? "Small plate"
        : portion === "large"
        ? "Full plate"
        : "Medium plate";
    case "yam":
      return portion === "small"
        ? "2 slices of yam"
        : portion === "large"
        ? "Full serving of yam"
        : "3–4 slices of yam";
    case "plantain":
      return portion === "small"
        ? "2 pieces of plantain"
        : portion === "large"
        ? "5–6 pieces of plantain"
        : "3–4 pieces of plantain";
    default:
      return portion === "small" ? "Small portion" : portion === "large" ? "Large portion" : "Normal portion";
  }
}

export function buildMealName(
  items: DetectedFoodItem[],
  portion: DetectedMealPortion
): string {
  if (!items.length) return "Mixed meal";

  const swallow  = items.find((i) => i.type === "swallow");
  const soup     = items.find((i) => i.type === "soup");
  const protein  = items.find((i) => i.type === "protein");
  const rice     = items.find((i) => i.type === "rice");
  const beans    = items.find((i) => i.type === "beans");

  const portionLabel = getLocalPortionLabel(
    swallow ? "swallow" : rice ? "rice" : beans ? "beans" : items[0].type,
    portion
  );

  if (soup && swallow) {
    const extra = protein ? ` and ${protein.label}` : "";
    return `${soup.label} with ${portionLabel} of ${swallow.label}${extra}`;
  }
  if (rice) {
    const extra = protein ? ` with ${protein.label}` : "";
    return `${rice.label}, ${portionLabel}${extra}`;
  }
  if (beans) {
    const extra = protein ? ` with ${protein.label}` : "";
    return `${beans.label}, ${portionLabel}${extra}`;
  }
  return `${items[0].label}, ${portionLabel}`;
}
