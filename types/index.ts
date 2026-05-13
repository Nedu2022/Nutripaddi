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

export type NigerianFood = {
  id: string;
  name: string;
  category: FoodCategory;
  description: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  servingSize: string;
  ingredients: string[];
  healthNote: string;
  iconName: string;
  bestFor?: string;
  watchOutFor?: string;
  aiTip?: string;
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
  timeLogged: string;
  iconName: string;
  aiObservation?: string;
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
  | "Understand Nigerian meals"
  | "Build better food habits";

export type EatingLifestyle =
  | "I eat swallow often"
  | "I eat rice often"
  | "I eat late at night"
  | "I snack a lot"
  | "I want portion control"
  | "I want healthier Nigerian meals";

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
