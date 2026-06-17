import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/src/config/supabase";

const clientUrl = SUPABASE_URL || "https://not-configured.supabase.co";
const clientKey = SUPABASE_ANON_KEY || "not-configured";
const webStorage = {
  getItem: async (key: string) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  removeItem: async (key: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
};

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    persistSession: true,
    storage: Platform.OS === "web" ? webStorage : AsyncStorage,
  },
});

export function assertSupabaseConfigured() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY.");
  }
}
