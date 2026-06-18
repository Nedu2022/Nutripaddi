import { assertSupabaseConfigured, supabase } from "@/src/lib/supabase";
import type { LifeStage, PregnancyTrimester } from "@/types";

export type ProfileData = {
  id?: string;
  email?: string;
  fullName?: string;
  nickname: string;
  photoUri: string | null;
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  height?: number | null;
  nutritionGoal?: string | null;
  eatingLifestyle?: string | null;
  healthAwareness?: string | null;
  language?: string | null;
  aiTone?: string | null;
  lifeStage?: LifeStage | null;
  trimester?: PregnancyTrimester | null;
  babyAgeMonths?: number | null;
  dailyCalorieTarget?: number | null;
  location?: string | null;
};

type ProfileRow = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  nickname?: string | null;
  avatar_url?: string | null;
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  height?: number | null;
  nutrition_goal?: string | null;
  eating_lifestyle?: string | null;
  health_awareness?: string | null;
  language?: string | null;
  ai_tone?: string | null;
  life_stage?: string | null;
  trimester?: string | null;
  baby_age_months?: number | null;
  daily_calorie_target?: number | null;
  location?: string | null;
};

function emptyProfile(): ProfileData {
  return {
    nickname: "",
    photoUri: null,
  };
}

function mapProfile(row?: ProfileRow | null): ProfileData {
  if (!row) return emptyProfile();

  return {
    age: row.age,
    aiTone: row.ai_tone,
    babyAgeMonths: row.baby_age_months,
    dailyCalorieTarget: row.daily_calorie_target,
    eatingLifestyle: row.eating_lifestyle,
    email: row.email ?? undefined,
    fullName: row.full_name ?? undefined,
    gender: row.gender,
    healthAwareness: row.health_awareness,
    height: row.height,
    id: row.id,
    language: row.language,
    lifeStage: (row.life_stage as LifeStage | null) ?? null,
    location: row.location ?? null,
    nickname: row.nickname ?? "",
    nutritionGoal: row.nutrition_goal,
    photoUri: row.avatar_url ?? null,
    trimester: (row.trimester as PregnancyTrimester | null) ?? null,
    weight: row.weight,
  };
}

export async function saveProfile(data: Partial<ProfileData>) {
  assertSupabaseConfigured();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("You need to be signed in to save your profile.");
  }

  const row = {
    age: data.age,
    ai_tone: data.aiTone,
    avatar_url: data.photoUri,
    baby_age_months: data.babyAgeMonths,
    daily_calorie_target: data.dailyCalorieTarget,
    eating_lifestyle: data.eatingLifestyle,
    email: userData.user.email,
    full_name:
      data.fullName ??
      (typeof userData.user.user_metadata?.fullName === "string"
        ? userData.user.user_metadata.fullName
        : typeof userData.user.user_metadata?.name === "string"
          ? userData.user.user_metadata.name
          : undefined),
    gender: data.gender,
    health_awareness: data.healthAwareness,
    height: data.height,
    id: userData.user.id,
    language: data.language,
    life_stage: data.lifeStage,
    location: data.location,
    nickname: data.nickname,
    nutrition_goal: data.nutritionGoal,
    trimester: data.trimester,
    weight: data.weight,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").upsert(row, {
    onConflict: "id",
  });

  if (error) throw new Error(error.message);
}

export async function getProfile(): Promise<ProfileData> {
  assertSupabaseConfigured();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return emptyProfile();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .maybeSingle<ProfileRow>();

  if (error) throw new Error(error.message);

  const profile = mapProfile(data);
  return {
    ...profile,
    email: profile.email ?? userData.user.email ?? undefined,
    fullName:
      profile.fullName ??
      (typeof userData.user.user_metadata?.fullName === "string"
        ? userData.user.user_metadata.fullName
        : typeof userData.user.user_metadata?.name === "string"
          ? userData.user.user_metadata.name
          : undefined),
  };
}

export async function clearProfile() {
  assertSupabaseConfigured();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return;

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userData.user.id);

  if (error) throw new Error(error.message);
}
