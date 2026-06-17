import { assertSupabaseConfigured, supabase } from "@/src/lib/supabase";
import {
  describeMaternalStage,
  getDailyCalorieTarget,
  getMaternalFocusNutrients,
} from "@/src/services/maternalNutrition";
import { getProfile, type ProfileData } from "@/src/services/profileService";
import type { ChatMessage } from "@/types";

type CoachResponse = {
  message?: string;
  reply?: string;
};

const LANGUAGE_NAMES: Record<string, string> = {
  english: "English",
  french: "French",
  swahili: "Swahili",
  yoruba: "Yoruba",
  hausa: "Hausa",
  igbo: "Igbo",
};

// undefined = not loaded yet, null = no context available.
let cachedContext: string | null | undefined;

function buildProfileContext(profile: ProfileData): string {
  const lines: string[] = [];

  if (profile.nickname) lines.push(`- Name: ${profile.nickname}`);

  const stage = describeMaternalStage(
    profile.lifeStage,
    profile.trimester,
    profile.babyAgeMonths
  );
  if (stage) {
    lines.push(`- Life stage: ${stage}`);
    const focus = getMaternalFocusNutrients(profile.lifeStage);
    if (focus.length) lines.push(`- Priority nutrients to watch: ${focus.join(", ")}`);
  }

  const target =
    profile.dailyCalorieTarget ??
    getDailyCalorieTarget(profile.lifeStage, profile.trimester);
  if (target) lines.push(`- Daily energy target: about ${target} kcal`);

  if (profile.nutritionGoal) lines.push(`- Goal: ${profile.nutritionGoal}`);
  if (profile.eatingLifestyle) lines.push(`- Eating habits: ${profile.eatingLifestyle}`);
  if (profile.healthAwareness) lines.push(`- Health note: ${profile.healthAwareness}`);
  if (profile.age) lines.push(`- Age: ${profile.age}`);

  const lang = profile.language ? LANGUAGE_NAMES[profile.language] : undefined;
  if (lang) lines.push(`- Preferred language: ${lang} (reply in ${lang})`);

  return lines.join("\n");
}

async function getProfileContext(): Promise<string | null> {
  if (cachedContext !== undefined) return cachedContext;
  try {
    const profile = await getProfile();
    cachedContext = buildProfileContext(profile) || null;
  } catch {
    cachedContext = null;
  }
  return cachedContext;
}

/** Call after the profile changes (e.g. finishing onboarding) so the coach refetches it. */
export function clearCoachProfileCache() {
  cachedContext = undefined;
}

export async function askCoach(message: string, history: ChatMessage[]) {
  assertSupabaseConfigured();

  const profileContext = await getProfileContext();

  const { data, error } = await supabase.functions.invoke<CoachResponse>(
    "ai-coach",
    {
      body: {
        history: history.map((item) => ({
          isUser: item.isUser,
          text: item.text,
        })),
        message,
        profileContext,
      },
    }
  );

  if (error) throw new Error(error.message);

  const reply = data?.reply ?? data?.message;
  if (!reply) throw new Error("The coach endpoint did not return a reply.");

  return reply;
}
