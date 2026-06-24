import { assertSupabaseConfigured, getSessionUser, supabase } from "@/src/lib/supabase";
import type { LoggedMeal, MealType, PortionSize } from "@/types";

export type SavedMeal = LoggedMeal & {
  dateLogged: string;
  portionLabel: string;
};

export type DailyTotals = {
  calories: number;
  target: number;
  carbs: number;
  protein: number;
  fat: number;
};

export type WeeklyCalories = {
  day: string;
  value: number;
  date: string;
};

type MealRow = {
  id: string;
  food_id?: string | null;
  food_name?: string | null;
  meal_name?: string | null;
  meal_type?: MealType | null;
  calories?: number | null;
  carbs?: number | null;
  protein?: number | null;
  fat?: number | null;
  fibre?: number | null;
  freshness_score?: number | null;
  freshness_label?: string | null;
  portion_size?: PortionSize | null;
  portion_label?: string | null;
  confidence?: number | null;
  source?: string | null;
  icon_name?: string | null;
  image_url?: string | null;
  ai_observation?: string | null;
  logged_at?: string | null;
};

type SaveMealInput = {
  mealName: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fibre: number;
  freshnessScore?: number;
  freshnessLabel?: string;
  portionLabel: string;
  imageUri?: string;
  mealType?: MealType;
  foodId?: string;
  foodName?: string;
  iconName?: string;
  portionSize?: PortionSize;
  confidence?: number;
  source?: string;
  aiObservation?: string;
};

const ZERO_TOTALS: DailyTotals = {
  calories: 0,
  carbs: 0,
  fat: 0,
  protein: 0,
  target: 0,
};

function getDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = startOfDay(date);
  next.setDate(next.getDate() + 1);
  return next;
}

function inferMealType(date = new Date()): MealType {
  const hour = date.getHours();
  if (hour < 11) return "Breakfast";
  if (hour < 16) return "Lunch";
  if (hour < 21) return "Dinner";
  return "Snack";
}

function formatTime(iso?: string | null) {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapMeal(row: MealRow): SavedMeal {
  const loggedAt = row.logged_at ?? new Date().toISOString();
  const mealName = row.meal_name ?? row.food_name ?? "Untitled meal";

  return {
    aiObservation: row.ai_observation ?? undefined,
    calories: row.calories ?? 0,
    carbs: row.carbs ?? 0,
    confidence: row.confidence ?? undefined,
    dateLogged: getDateKey(new Date(loggedAt)),
    fat: row.fat ?? 0,
    fibre: row.fibre ?? undefined,
    foodId: row.food_id ?? "custom",
    foodName: row.food_name ?? mealName,
    freshnessLabel: row.freshness_label ?? undefined,
    freshnessScore: row.freshness_score ?? undefined,
    iconName: row.icon_name ?? "UtensilsCrossed",
    id: row.id,
    imageUri: row.image_url ?? undefined,
    mealType: row.meal_type ?? inferMealType(new Date(loggedAt)),
    portionLabel: row.portion_label ?? "",
    portionSize: row.portion_size ?? undefined,
    protein: row.protein ?? 0,
    source: row.source ?? undefined,
    timeLogged: formatTime(loggedAt),
  };
}

export async function saveMeal(data: SaveMealInput): Promise<SavedMeal> {
  assertSupabaseConfigured();

  const user = await getSessionUser();
  if (!user) {
    throw new Error("You need to be signed in to save a meal.");
  }

  const loggedAt = new Date().toISOString();
  const row = {
    ai_observation: data.aiObservation,
    calories: data.calories,
    carbs: data.carbs,
    confidence: data.confidence,
    fat: data.fat,
    fibre: data.fibre,
    food_id: data.foodId ?? "custom",
    food_name: data.foodName ?? data.mealName,
    freshness_label: data.freshnessLabel,
    freshness_score: data.freshnessScore,
    icon_name: data.iconName ?? "UtensilsCrossed",
    image_url: data.imageUri,
    logged_at: loggedAt,
    meal_name: data.mealName,
    meal_type: data.mealType ?? inferMealType(new Date(loggedAt)),
    portion_label: data.portionLabel,
    portion_size: data.portionSize,
    protein: data.protein,
    source: data.source,
    user_id: user.id,
  };

  const { data: saved, error } = await supabase
    .from("meals")
    .insert(row)
    .select("*")
    .single<MealRow>();

  if (error) throw new Error(error.message);
  return mapMeal(saved);
}

export async function getSavedMeals(options: { from?: Date; to?: Date; limit?: number } = {}): Promise<SavedMeal[]> {
  assertSupabaseConfigured();

  let query = supabase.from("meals").select("*").order("logged_at", {
    ascending: false,
  });

  if (options.from) query = query.gte("logged_at", options.from.toISOString());
  if (options.to) query = query.lt("logged_at", options.to.toISOString());
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query.returns<MealRow[]>();
  if (error) throw new Error(error.message);

  return (data ?? []).map(mapMeal);
}

export async function getMealById(id: string): Promise<SavedMeal | null> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("id", id)
    .maybeSingle<MealRow>();

  if (error) throw new Error(error.message);
  return data ? mapMeal(data) : null;
}

export async function getTodayMeals(date = new Date()) {
  return getSavedMeals({
    from: startOfDay(date),
    to: endOfDay(date),
  });
}

export function getDailyTotalsFromMeals(meals: SavedMeal[], target = 0): DailyTotals {
  return meals.reduce<DailyTotals>(
    (totals, meal) => ({
      calories: totals.calories + meal.calories,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat,
      protein: totals.protein + meal.protein,
      target,
    }),
    { ...ZERO_TOTALS, target }
  );
}

export async function getDailyTotals(date = new Date(), target = 0): Promise<DailyTotals> {
  return getDailyTotalsFromMeals(await getTodayMeals(date), target);
}

export async function getMealsForWeek(date = new Date()) {
  const end = endOfDay(date);
  const start = startOfDay(date);
  start.setDate(start.getDate() - 6);

  return getSavedMeals({ from: start, to: end });
}

export function getWeeklyCaloriesFromMeals(
  meals: SavedMeal[],
  date = new Date()
): WeeklyCalories[] {
  const start = startOfDay(date);
  start.setDate(start.getDate() - 6);

  const buckets = new Map<string, number>();

  for (let i = 0; i < 7; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    buckets.set(getDateKey(day), 0);
  }

  meals.forEach((meal) => {
    buckets.set(meal.dateLogged, (buckets.get(meal.dateLogged) ?? 0) + meal.calories);
  });

  return Array.from(buckets.entries()).map(([dateKey, value]) => {
    const day = new Date(dateKey);
    return {
      date: dateKey,
      day: day.toLocaleDateString("en-US", { weekday: "short" }),
      value,
    };
  });
}

export async function getWeeklyCalories(date = new Date()): Promise<WeeklyCalories[]> {
  return getWeeklyCaloriesFromMeals(await getMealsForWeek(date), date);
}

export async function deleteMeal(id: string): Promise<void> {
  assertSupabaseConfigured();

  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
