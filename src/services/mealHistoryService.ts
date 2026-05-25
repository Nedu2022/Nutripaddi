import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "nutripaddi_meal_history_v1";

export type SavedMeal = {
  id: string;
  mealName: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fibre: number;
  freshnessScore?: number;
  freshnessLabel?: string;
  portionLabel: string;
  timeLogged: string;
  dateLogged: string;
};

export async function saveMeal(
  data: Pick<
    SavedMeal,
    | "mealName"
    | "calories"
    | "carbs"
    | "protein"
    | "fat"
    | "fibre"
    | "freshnessScore"
    | "freshnessLabel"
    | "portionLabel"
  >
): Promise<SavedMeal> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const history: SavedMeal[] = raw ? (JSON.parse(raw) as SavedMeal[]) : [];

  const now = new Date();
  const entry: SavedMeal = {
    ...data,
    id: `meal_${Date.now()}`,
    timeLogged: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    dateLogged: now.toISOString().split("T")[0],
  };

  history.unshift(entry);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

export async function getSavedMeals(): Promise<SavedMeal[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as SavedMeal[]) : [];
}

export async function deleteMeal(id: string): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const history: SavedMeal[] = raw ? (JSON.parse(raw) as SavedMeal[]) : [];
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history.filter((m) => m.id !== id))
  );
}
