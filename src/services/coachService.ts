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

export type ScanUserStatus = "pregnant" | "breastfeeding" | "other";

export type ProfileScanContext = {
  profileContext: string | null;
  userStatus: ScanUserStatus;
};

const LANGUAGE_NAMES: Record<string, string> = {
  english: "English",
  french: "French",
  swahili: "Swahili",
  yoruba: "Yoruba",
  hausa: "Hausa",
  igbo: "Igbo",
};

let cachedContext: string | null | undefined;
let cachedScanContext: ProfileScanContext | undefined;

function lifeStageToScanUserStatus(
  stage: ProfileData["lifeStage"]
): ScanUserStatus {
  if (stage === "pregnant") return "pregnant";
  if (stage === "nursing") return "breastfeeding";
  return "other";
}

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
  } else {
    lines.push(
      "- Life stage: General user, NOT pregnant and NOT nursing. Do not assume they have a baby or are a mother; speak to them as an everyday person looking after their own nutrition."
    );
  }

  if (profile.location) {
    lines.push(
      `- Location: ${profile.location}. Suggest foods, markets and meals that are common and affordable in this area.`
    );
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

  lines.push(
    profile.location
      ? `- Response style: Use simple everyday words that a lay person in ${profile.location} can understand. Match the common way people talk about food in that country or area, including familiar local food names. Avoid medical grammar, textbook terms, and big nutrition words unless you explain them simply.`
      : "- Response style: Use simple everyday words that a lay person can understand. Avoid medical grammar, textbook terms, and big nutrition words unless you explain them simply."
  );

  return lines.join("\n");
}

export async function getProfileContext(): Promise<string | null> {
  const context = await getProfileScanContext();
  return context.profileContext;
}

export async function getProfileScanContext(): Promise<ProfileScanContext> {
  if (cachedScanContext) return cachedScanContext;
  try {
    const profile = await getProfile();
    cachedScanContext = {
      profileContext: buildProfileContext(profile) || null,
      userStatus: lifeStageToScanUserStatus(profile.lifeStage),
    };
    cachedContext = cachedScanContext.profileContext;
  } catch {
    cachedScanContext = { profileContext: null, userStatus: "other" };
    cachedContext = null;
  }
  return cachedScanContext;
}

export function clearCoachProfileCache() {
  cachedContext = undefined;
  cachedScanContext = undefined;
}

async function getProfileContextForRequest(timeoutMs = 450) {
  const profilePromise = getProfileContext();
  if (cachedContext !== undefined) return profilePromise;

  return Promise.race<string | null>([
    profilePromise,
    new Promise((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);
}

function cleanReply(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^\s*[*\-•]\s+/gm, "")
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
}

export async function askCoach(message: string, history: ChatMessage[]) {
  assertSupabaseConfigured();

  const profileContext = await getProfileContextForRequest();

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

  return cleanReply(reply);
}
