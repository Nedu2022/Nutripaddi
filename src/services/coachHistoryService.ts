import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ChatMessage } from "@/types";

const KEY = "@nutriPadi_coach_history";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export async function loadCoachHistory(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    const fresh = (parsed as ChatMessage[]).filter(
      (item) =>
        item &&
        typeof item.createdAt === "number" &&
        now - item.createdAt <= MAX_AGE_MS
    );

    if (fresh.length !== parsed.length) {
      if (fresh.length) await AsyncStorage.setItem(KEY, JSON.stringify(fresh));
      else await AsyncStorage.removeItem(KEY);
    }

    return fresh;
  } catch {
    return [];
  }
}

export async function saveCoachHistory(messages: ChatMessage[]): Promise<void> {
  try {
    if (!messages.length) {
      await AsyncStorage.removeItem(KEY);
      return;
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(messages));
  } catch {
    return;
  }
}

export async function clearCoachHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    return;
  }
}
