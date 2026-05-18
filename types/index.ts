import type { SupportedLanguage } from "@/localization";

export type FoodCategory =
  | "Swallows"
  | "Soups"
  | "Rice Meals"
  | "Beans Meals"
  | "Yam Meals"
  | "Protein-rich Meals"
  | "Light Meals"
  | "High-carb Meals"
  | "Stews"
  | "Others";

export type PortionSize = "Small" | "Medium" | "Large" | "Extra";

export type AfricanFood = {
  id: string;
  name: string;
  category: FoodCategory;
  description: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fibre?: number;
  localAmountLabel: string;
  ingredients: string[];
  healthNote: string;
  iconName: string;
  bestFor?: string;
  watchOutFor?: string;
  aiTip?: string;
  source?: string;
};

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type LoggedMeal = {
  id: string;
  foodId: string;
  foodName: string;
  mealType: MealType;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fibre?: number;
  portionSize?: PortionSize;
  confidence?: number;
  source?: string;
  timeLogged: string;
  iconName: string;
  aiObservation?: string;
};

export type FoodCompositionRecord = {
  foodId: string;
  foodName: string;
  category: FoodCategory;
  portionSize: PortionSize;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fibre: number;
  source: string;
};

export type RecognitionResult = {
  foodId: string;
  foodName: string;
  confidence: number;
  portionSize: PortionSize;
  explanation: string;
  similarFoodIds: string[];
};

export type ResearchMetric = {
  label: string;
  value: string;
  note: string;
};

export type FeedbackQuestion = {
  id: string;
  text: string;
};

export type NutritionTip = {
  id: string;
  title: string;
  content: string;
  category: string;
  iconName: string;
};

export type NutritionGoal =
  | "Eat healthier"
  | "Track calories"
  | "Manage weight"
  | "Reduce excess carbs"
  | "Understand African meals"
  | "Build better food habits";

export type EatingLifestyle =
  | "I eat swallow often"
  | "I eat rice often"
  | "I eat late at night"
  | "I snack a lot"
  | "I want to control how much I eat"
  | "I want healthier African meals";

export type HealthAwareness =
  | "General wellness"
  | "Weight management"
  | "Diabetes awareness"
  | "Heart health awareness"
  | "No specific concern";

export type AIAdviceTone = "gentle" | "direct" | "motivational" | "simple";

export type UserProfile = {
  nickname: string;
  email: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  goal: NutritionGoal;
  eatingLifestyle: EatingLifestyle[];
  healthAwareness: HealthAwareness;
  language: SupportedLanguage;
  aiTone: AIAdviceTone;
  mealsLogged: number;
  daysStreak: number;
};

export type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
};

export type QuickQuestion = {
  id: string;
  text: string;
};

export type MealSuggestion = {
  id: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
};
