import type { ChatMessage, QuickQuestion, MealSuggestion } from "@/types";

export const QUICK_QUESTIONS: QuickQuestion[] = [
  { id: "q1", text: "Is this meal good for weight loss?" },
  { id: "q2", text: "How can I reduce carbs in Nigerian food?" },
  { id: "q3", text: "What can I eat with Egusi soup?" },
  { id: "q4", text: "Is Jollof rice healthy?" },
  { id: "q5", text: "Suggest a light Nigerian dinner" },
  { id: "q6", text: "What should I eat after a heavy lunch?" },
  { id: "q7", text: "What is a good breakfast for weight management?" },
  { id: "q8", text: "How many calories are in swallow?" },
];

/**
 * Dummy AI responses keyed by question id.
 * In production, these would come from a real AI model.
 */
export const AI_RESPONSES: Record<string, string> = {
  q1: "It depends on the meal! Generally, meals lower in carbs and higher in protein, like pepper soup with fish or beans with vegetables, are better for weight loss. Portion size also matters a lot.",
  q2: "Great question! You can reduce carbs by using smaller portions of swallow, eating more soup with vegetables, choosing beans over rice, or trying cauliflower-based alternatives. Portion control is the simplest first step.",
  q3: "Egusi soup goes well with any swallow like eba, pounded yam, or amala. For a lighter option, try it with boiled plantain or eat more of the soup with less swallow.",
  q4: "Jollof rice can be part of a healthy diet, but portion size matters. You can balance it with grilled chicken, boiled egg, vegetables, or salad. A medium plate is usually enough for one meal.",
  q5: "For a light Nigerian dinner, try pepper soup with fish, boiled yam with egg sauce, moi moi with pap, or a simple vegetable salad with grilled chicken. These are lower in calories and easier to digest at night.",
  q6: "After a heavy lunch, keep dinner very light. Try a bowl of pepper soup, some fresh fruits, or a small portion of moi moi. Drinking water throughout the afternoon also helps.",
  q7: "For weight management, try akara with pap (smaller portion), boiled egg with bread, oatmeal with fruits, or moi moi. These give you energy without too many calories.",
  q8: "A medium portion of swallow like pounded yam has about 350-410 calories, eba has about 360 calories, and amala has about 350 calories. Remember, most of those calories come from carbohydrates.",
  default:
    "That is a great question! As your AI Nutritionist, I recommend focusing on balanced meals with plenty of vegetables, moderate portions of carbohydrates, and good protein sources like fish, eggs, beans, or chicken. Would you like me to suggest a specific meal?",
};

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    text: "Hello! I am your AI Nutritionist. Ask me anything about Nigerian food and nutrition. I am here to help you eat smarter! 🍽️",
    isUser: false,
    timestamp: "Just now",
  },
];

export const MEAL_SUGGESTIONS: MealSuggestion[] = [
  {
    id: "s1",
    name: "Beans and Boiled Egg",
    description:
      "High protein, budget-friendly. Great for breakfast or lunch.",
    category: "Protein-Rich Nigerian Meals",
    iconName: "Egg",
  },
  {
    id: "s2",
    name: "Moi Moi with Pap",
    description: "Light, protein-rich breakfast. Easy on the stomach.",
    category: "Light Dinner Ideas",
    iconName: "Cookie",
  },
  {
    id: "s3",
    name: "Rice with Vegetables and Grilled Chicken",
    description:
      "Balanced meal with protein, carbs, and vitamins from vegetables.",
    category: "Balanced Lunch Ideas",
    iconName: "ChefHat",
  },
  {
    id: "s4",
    name: "Small Swallow with Vegetable Soup",
    description:
      "Controlled portion of swallow with plenty of vegetable-rich soup.",
    category: "Lower-Carb Swallow Alternatives",
    iconName: "Leaf",
  },
  {
    id: "s5",
    name: "Yam Porridge with Fish",
    description: "Filling, nutritious one-pot meal with good protein.",
    category: "Balanced Lunch Ideas",
    iconName: "Carrot",
  },
  {
    id: "s6",
    name: "Pepper Soup with Fish",
    description: "Very low carb, high protein. Perfect for a light dinner.",
    category: "Light Dinner Ideas",
    iconName: "Flame",
  },
  {
    id: "s7",
    name: "Boiled Plantain with Egg Sauce",
    description:
      "Simple, affordable, and balanced. Good for breakfast or dinner.",
    category: "Student-Friendly Healthy Meals",
    iconName: "Utensils",
  },
  {
    id: "s8",
    name: "Oatmeal with Fruits",
    description: "Light breakfast option with fiber and natural sugars.",
    category: "Student-Friendly Healthy Meals",
    iconName: "Apple",
  },
  {
    id: "s9",
    name: "Grilled Fish with Salad",
    description:
      "Low calorie, high protein. Great for weight management goals.",
    category: "Protein-Rich Nigerian Meals",
    iconName: "Beef",
  },
  {
    id: "s10",
    name: "Beans and Plantain",
    description:
      "Classic Nigerian combo. Great protein and energy for the day.",
    category: "Student-Friendly Healthy Meals",
    iconName: "Bean",
  },
];

export const SUGGESTION_CATEGORIES = [
  "All",
  "Light Dinner Ideas",
  "Protein-Rich Nigerian Meals",
  "Lower-Carb Swallow Alternatives",
  "Balanced Lunch Ideas",
  "Student-Friendly Healthy Meals",
] as const;
