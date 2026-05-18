import { AFRICAN_FOODS } from "@/data/foods";
import type {
  AfricanFood,
  FoodCategory,
  FoodCompositionRecord,
  HealthAwareness,
  PortionSize,
  RecognitionResult,
} from "@/types";

export const NUTRITION_SOURCE =
  "West African Food Composition Table placeholder";

const PORTION_MULTIPLIER: Record<PortionSize, number> = {
  Small: 0.7,
  Medium: 1,
  Large: 1.35,
  Extra: 1.65,
};

export const PORTION_ORDER: PortionSize[] = [
  "Small",
  "Medium",
  "Large",
  "Extra",
];

const CATEGORY_FIBRE_ESTIMATE: Record<FoodCategory, number> = {
  Swallows: 3,
  Soups: 5,
  "Rice Meals": 4,
  "Beans Meals": 8,
  "Yam Meals": 5,
  "Protein-rich Meals": 2,
  "Light Meals": 4,
  "High-carb Meals": 3,
  Stews: 4,
  Others: 2,
};

const roundMacro = (value: number) => Math.round(value * 10) / 10;

function toCompositionRecord(
  food: AfricanFood,
  portionSize: PortionSize
): FoodCompositionRecord {
  const multiplier = PORTION_MULTIPLIER[portionSize];
  const fibre = food.fibre ?? CATEGORY_FIBRE_ESTIMATE[food.category] ?? 3;

  return {
    foodId: food.id,
    foodName: food.name,
    category: food.category,
    portionSize,
    calories: Math.round(food.calories * multiplier),
    carbs: roundMacro(food.carbs * multiplier),
    protein: roundMacro(food.protein * multiplier),
    fat: roundMacro(food.fat * multiplier),
    fibre: roundMacro(fibre * multiplier),
    source: food.source ?? NUTRITION_SOURCE,
  };
}

export const FOOD_COMPOSITION_TABLE: FoodCompositionRecord[] =
  AFRICAN_FOODS.flatMap((food) =>
    PORTION_ORDER.map((portion) => toCompositionRecord(food, portion))
  );

export const SAMPLE_RECOGNITION_RESULT: RecognitionResult = {
  foodId: "5",
  foodName: "Egusi Soup",
  confidence: 90,
  portionSize: "Medium",
  explanation:
    "The model matched the soup colour, melon-seed texture, and swallow shape with similar Egusi Soup and Pounded Yam images in the local dataset.",
  similarFoodIds: ["1", "6", "20"],
};

export function getFoodById(foodId: string) {
  return AFRICAN_FOODS.find((food) => food.id === foodId) ?? AFRICAN_FOODS[0];
}

export function getNutritionEstimate(
  foodId: string,
  portionSize: PortionSize
): FoodCompositionRecord {
  const record = FOOD_COMPOSITION_TABLE.find(
    (item) => item.foodId === foodId && item.portionSize === portionSize
  );

  if (record) return record;

  return toCompositionRecord(getFoodById(foodId), portionSize);
}

export function getSimilarFoods(foodIds: string[]) {
  return foodIds.map(getFoodById);
}

export function getLocalPortionLabel(
  food: AfricanFood,
  portionSize: PortionSize
) {
  const foodName = food.name.toLowerCase();

  if (foodName.includes("moi moi")) {
    return {
      Small: "1 wrap",
      Medium: "1 normal wrap",
      Large: "2 wraps",
      Extra: "3 wraps",
    }[portionSize];
  }

  if (foodName.includes("akara")) {
    return {
      Small: "3 pieces",
      Medium: "5 pieces",
      Large: "7 pieces",
      Extra: "Plenty akara",
    }[portionSize];
  }

  if (foodName.includes("suya")) {
    return {
      Small: "1 stick",
      Medium: "3 sticks",
      Large: "5 sticks",
      Extra: "Plenty suya",
    }[portionSize];
  }

  if (food.category === "Swallows") {
    return {
      Small: "Small wrap",
      Medium: "1 normal wrap",
      Large: "2 wraps",
      Extra: "Large wrap",
    }[portionSize];
  }

  if (food.category === "Rice Meals") {
    return {
      Small: "Half plate",
      Medium: "1 normal plate",
      Large: "Full plate",
      Extra: "Extra plate",
    }[portionSize];
  }

  if (food.category === "Soups" || food.category === "Stews") {
    return {
      Small: "Small bowl",
      Medium: "Medium bowl",
      Large: "Large bowl",
      Extra: "Plenty soup",
    }[portionSize];
  }

  if (food.category === "Protein-rich Meals") {
    return {
      Small: "Small plate",
      Medium: "Normal plate",
      Large: "Full plate",
      Extra: "Extra plate",
    }[portionSize];
  }

  return {
    Small: "Small plate",
    Medium: "Normal plate",
    Large: "Full plate",
    Extra: "Extra plate",
  }[portionSize];
}

export function getLocalMealDescription(
  food: AfricanFood,
  portionSize: PortionSize
) {
  const label = getLocalPortionLabel(food, portionSize);

  if (food.category === "Soups" || food.category === "Stews") {
    return `${label} of ${food.name}`;
  }

  return `${food.name}, ${label.toLowerCase()}`;
}

export function getPortionOptionsForFood(food: AfricanFood) {
  return PORTION_ORDER.map((value) => ({
    value,
    label: getLocalPortionLabel(food, value),
  }));
}

export function getBalanceLabel(estimate: FoodCompositionRecord) {
  if (estimate.carbs >= 75) return "Plenty carbohydrates";
  if (estimate.protein >= 22 && estimate.carbs <= 55) return "Protein-rich";
  if (estimate.fibre >= 7) return "Fibre-friendly";
  return "Fair balance";
}

export function getGoalAwareAdvice(
  estimate: FoodCompositionRecord,
  healthAwareness: HealthAwareness = "Weight management"
) {
  const balance = getBalanceLabel(estimate);
  const food = getFoodById(estimate.foodId);
  const smallerLocalSize = getLocalPortionLabel(food, "Small").toLowerCase();

  if (healthAwareness === "Diabetes awareness" && estimate.carbs >= 65) {
    return "This meal may have plenty carbohydrates. If you have diabetes or another medical condition, please speak with a qualified health professional.";
  }

  if (healthAwareness === "Weight management" && estimate.carbs >= 65) {
    return `This meal has plenty energy. If you are watching your weight, try ${smallerLocalSize} next time and add egg, fish, chicken, beans, or one piece of meat to balance it.`;
  }

  if (estimate.protein < 15) {
    return "This meal gives useful energy, but protein looks low. You can balance it with egg, fish, chicken, beans, moi moi, or one piece of meat.";
  }

  if (balance === "Protein-rich") {
    return "Nice one. This meal has good protein, so it can keep you satisfied for longer.";
  }

  return "This meal is not bad. The main thing is balance. Small changes in how much you eat can help.";
}
