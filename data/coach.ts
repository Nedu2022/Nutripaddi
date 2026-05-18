import type { ChatMessage, QuickQuestion, MealSuggestion } from "@/types";

export const QUICK_QUESTIONS: QuickQuestion[] = [
  { id: "q1", text: "Is this meal balanced?" },
  { id: "q2", text: "How can I reduce carbs?" },
  { id: "q3", text: "What can I eat with Egusi soup?" },
  { id: "q4", text: "Is Jollof rice healthy?" },
  { id: "q5", text: "Suggest a light Nigerian dinner" },
  { id: "q6", text: "What should I eat after a heavy lunch?" },
  { id: "q7", text: "What is a good breakfast to keep a healthy weight?" },
  { id: "q8", text: "How much energy (calories) is in swallow?" },
];

/**
 * Dummy AI responses keyed by question id.
 * In production, these would come from a real AI model.
 */
export const AI_RESPONSES: Record<string, string> = {
  q1: "A balanced African meal usually has energy food, protein, and vegetables. If your plate is mostly rice, swallow, yam, or plantain, add egg, fish, beans, chicken, one piece of meat, or more vegetable soup.",
  q2: "Start with the easiest change: try small swallow, half plate of rice, or a normal plate instead of an extra plate. Then add soup, vegetables, beans, egg, fish, or chicken so the meal still satisfies you.",
  q3: "Egusi soup goes well with eba, pounded yam, amala, semo, or fufu. For a lighter option, take 1 normal wrap of swallow and enjoy more soup with vegetables, fish, or meat.",
  q4: "Jollof rice can fit into healthy eating. A normal plate is fine for many people. Balance it with grilled chicken, fish, egg, moi moi, vegetables, or salad.",
  q5: "Try pepper soup with fish, moi moi with a little pap, boiled plantain with egg sauce, beans with vegetables, or okra soup with a small swallow.",
  q6: "After a heavy lunch, keep dinner light. Try a small bowl of pepper soup, fruit, water first, or 1 wrap of moi moi. You do not need another heavy plate at night.",
  q7: "To keep a healthy weight, try 3 pieces of akara with a little pap, one boiled egg with bread, one wrap of moi moi, or beans with vegetables. The amount still matters.",
  q8: "One normal wrap of swallow like pounded yam, eba, amala, or semo gives plenty energy because most of it is carbs. If you are watching your weight, small swallow is a good start.",
  default:
    "That is a good question. My simple advice is: keep the rice, yam, plantain, or swallow amount reasonable, add vegetables, and include egg, fish, beans, moi moi, chicken, or meat. If you have a medical condition, please speak with a qualified health professional.",
};

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    text: "Hello, I am your African AI Nutritionist. Ask me about wraps of swallow, plates of rice, bowls of soup, and simple ways to balance local food.",
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
    category: "Protein-Rich African Meals",
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
      "A normal plate of rice with protein and vegetables for better balance.",
    category: "Balanced Lunch Ideas",
    iconName: "ChefHat",
  },
  {
    id: "s4",
    name: "Small Swallow with Vegetable Soup",
    description:
      "Try 1 small wrap of swallow with plenty vegetable-rich soup.",
    category: "Lighter Swallow Options",
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
    description: "Light bowl of soup with fish. Good when dinner should not be heavy.",
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
      "Low in calories, high in protein. Great for keeping a healthy weight.",
    category: "Protein-Rich African Meals",
    iconName: "Beef",
  },
  {
    id: "s10",
    name: "Beans and Plantain",
    description:
      "Classic African combo. Great protein and energy for the day.",
    category: "Student-Friendly Healthy Meals",
    iconName: "Bean",
  },
];

export const SUGGESTION_CATEGORIES = [
  "All",
  "Light Dinner Ideas",
  "Protein-Rich African Meals",
  "Lighter Swallow Options",
  "Balanced Lunch Ideas",
  "Student-Friendly Healthy Meals",
] as const;
