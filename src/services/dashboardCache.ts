import AsyncStorage from "@react-native-async-storage/async-storage";

import { getSessionUser } from "@/src/lib/supabase";
import type { ProfileData } from "@/src/services/profileService";
import type { SavedMeal } from "@/src/services/mealHistoryService";

const CACHE_KEY = "nutripadi.dashboard.v1";

export type DashboardSnapshot = {
  profile: ProfileData;
  weekMeals: SavedMeal[];
};

type CacheEnvelope = DashboardSnapshot & {
  userId: string;
  savedAt: number;
};

/**
 * Returns the last cached dashboard data for the current user, or null.
 *
 * Scoped by user id so a previous account's data is never shown after a switch.
 * Reads local storage only — used for an instant first paint while fresh data
 * loads in the background (stale-while-revalidate).
 */
export async function readDashboardCache(): Promise<DashboardSnapshot | null> {
  try {
    const [user, raw] = await Promise.all([
      getSessionUser(),
      AsyncStorage.getItem(CACHE_KEY),
    ]);
    if (!user || !raw) return null;

    const envelope = JSON.parse(raw) as CacheEnvelope;
    if (envelope.userId !== user.id) return null;

    return { profile: envelope.profile, weekMeals: envelope.weekMeals };
  } catch {
    return null;
  }
}

export async function writeDashboardCache(snapshot: DashboardSnapshot): Promise<void> {
  try {
    const user = await getSessionUser();
    if (!user) return;

    const envelope: CacheEnvelope = {
      ...snapshot,
      savedAt: Date.now(),
      userId: user.id,
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(envelope));
  } catch {
    // Caching is best-effort; ignore write failures.
  }
}

export async function clearDashboardCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
