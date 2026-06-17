import { assertSupabaseConfigured, supabase } from "@/src/lib/supabase";
import type {
  FeedbackQuestion,
  MealSuggestion,
  NutritionTip,
  ResearchMetric,
  QuickQuestion,
} from "@/types";

export type LearnSection = {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tipCount: number;
};

type FoodCategoryRow = {
  name: string;
  sort_order?: number | null;
};

type MealSuggestionRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_name?: string | null;
};

type NutritionTipRow = {
  id: string;
  title: string;
  content: string;
  category: string;
  icon_name?: string | null;
};

type LearnSectionRow = {
  id: string;
  title: string;
  description: string;
  icon_name?: string | null;
  tip_count?: number | null;
};

type ResearchMetricRow = {
  label: string;
  value: string;
  note: string;
  sort_order?: number | null;
};

type FeedbackQuestionRow = {
  id: string;
  text: string;
  sort_order?: number | null;
};

type FeedbackOptionRow = {
  label: string;
  sort_order?: number | null;
};

type QuickQuestionRow = {
  id: string;
  text: string;
  sort_order?: number | null;
};

export async function getFoodCategories() {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("food_categories")
    .select("name, sort_order")
    .order("sort_order", { ascending: true })
    .returns<FoodCategoryRow[]>();

  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => item.name);
}

export async function getMealSuggestions(): Promise<MealSuggestion[]> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("meal_suggestions")
    .select("id, name, description, category, icon_name")
    .order("created_at", { ascending: false })
    .returns<MealSuggestionRow[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((item) => ({
    category: item.category,
    description: item.description,
    iconName: item.icon_name ?? "Utensils",
    id: item.id,
    name: item.name,
  }));
}

export async function getNutritionTips(): Promise<NutritionTip[]> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("nutrition_tips")
    .select("id, title, content, category, icon_name")
    .order("created_at", { ascending: false })
    .returns<NutritionTipRow[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((item) => ({
    category: item.category,
    content: item.content,
    iconName: item.icon_name ?? "Leaf",
    id: item.id,
    title: item.title,
  }));
}

export async function getLearnSections(): Promise<LearnSection[]> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("learn_sections")
    .select("id, title, description, icon_name, tip_count")
    .order("created_at", { ascending: false })
    .returns<LearnSectionRow[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((item) => ({
    description: item.description,
    iconName: item.icon_name ?? "BookOpen",
    id: item.id,
    tipCount: item.tip_count ?? 0,
    title: item.title,
  }));
}

export async function getResearchMetrics(): Promise<ResearchMetric[]> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("research_metrics")
    .select("label, value, note, sort_order")
    .order("sort_order", { ascending: true })
    .returns<ResearchMetricRow[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((item) => ({
    label: item.label,
    note: item.note,
    value: item.value,
  }));
}

export async function getFeedbackQuestions(): Promise<FeedbackQuestion[]> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("feedback_questions")
    .select("id, text, sort_order")
    .order("sort_order", { ascending: true })
    .returns<FeedbackQuestionRow[]>();

  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({ id: item.id, text: item.text }));
}

export async function getFeedbackOptions(): Promise<string[]> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("feedback_options")
    .select("label, sort_order")
    .order("sort_order", { ascending: true })
    .returns<FeedbackOptionRow[]>();

  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => item.label);
}

export async function submitStudyFeedback(answers: Record<string, string>) {
  assertSupabaseConfigured();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("You need to be signed in to submit feedback.");
  }

  const { error } = await supabase.from("study_feedback_responses").insert({
    answers,
    user_id: userData.user.id,
  });

  if (error) throw new Error(error.message);
}

export async function getQuickQuestions(): Promise<QuickQuestion[]> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("quick_questions")
    .select("id, text, sort_order")
    .order("sort_order", { ascending: true })
    .returns<QuickQuestionRow[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}
