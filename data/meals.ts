import type { LoggedMeal } from "@/types";

export const DUMMY_MEALS: LoggedMeal[] = [
  {
    id: "m1",
    foodId: "8",
    foodName: "Jollof Rice",
    mealType: "Lunch",
    calories: 480,
    carbs: 72,
    protein: 14,
    fat: 16,
    timeLogged: "12:30 PM",
    iconName: "UtensilsCrossed",
    aiObservation:
      "This meal is carb-heavy. Try adding grilled chicken or fish for more protein.",
  },
  {
    id: "m2",
    foodId: "5",
    foodName: "Egusi Soup with Pounded Yam",
    mealType: "Dinner",
    calories: 680,
    carbs: 85,
    protein: 24,
    fat: 28,
    timeLogged: "7:15 PM",
    iconName: "Soup",
    aiObservation:
      "This meal is rich in energy. If your goal is weight management, consider reducing the pounded yam portion.",
  },
  {
    id: "m3",
    foodId: "16",
    foodName: "Akara & Pap",
    mealType: "Breakfast",
    calories: 340,
    carbs: 48,
    protein: 14,
    fat: 12,
    timeLogged: "8:00 AM",
    iconName: "Cookie",
    aiObservation:
      "Good breakfast combination. The beans in akara give you protein to start the day.",
  },
  {
    id: "m4",
    foodId: "15",
    foodName: "Suya",
    mealType: "Snack",
    calories: 350,
    carbs: 4,
    protein: 32,
    fat: 22,
    timeLogged: "4:30 PM",
    iconName: "Beef",
    aiObservation:
      "High protein snack. Watch the portion since suya can be high in fat.",
  },
  {
    id: "m5",
    foodId: "11",
    foodName: "Beans Porridge",
    mealType: "Lunch",
    calories: 380,
    carbs: 55,
    protein: 24,
    fat: 10,
    timeLogged: "1:00 PM",
    iconName: "Bean",
    aiObservation:
      "Great choice! Beans gives you protein and fiber. This is a balanced meal.",
  },
];

export const DAILY_TOTALS = {
  calories: 1850,
  target: 2200,
  carbs: 209,
  protein: 76,
  fat: 66,
};

export const WEEKLY_CALORIES = [
  { day: "Mon", value: 1950 },
  { day: "Tue", value: 2100 },
  { day: "Wed", value: 1800 },
  { day: "Thu", value: 2250 },
  { day: "Fri", value: 1650 },
  { day: "Sat", value: 2400 },
  { day: "Sun", value: 1850 },
];
