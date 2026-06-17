type RuntimeProcess = {
  env?: {
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_PUBLIC_SUPABASE_KEY?: string;
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    EXPO_PUBLIC_SUPABASE_URL?: string;
  };
};

declare const process: RuntimeProcess;

export const SUPABASE_URL = process.env?.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const SUPABASE_ANON_KEY =
  process.env?.EXPO_PUBLIC_SUPABASE_KEY?.trim() ||
  process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env?.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "";

export function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
