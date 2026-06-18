import { router } from "expo-router";
import * as Linking from "expo-linking";

import { supabase } from "@/src/lib/supabase";
import { ROUTES } from "@/constants/routes";
import { getProfile } from "@/src/services/profileService";

function getUrlParams(url: string) {
  const [, fragment = ""] = url.split("#");
  const query = url.includes("?") ? url.split("?")[1]?.split("#")[0] ?? "" : "";
  return new URLSearchParams(fragment || query);
}

async function routeAfterConfirmedAuth() {
  const profile = await getProfile().catch(() => null);
  router.replace(
    profile?.nickname?.trim()
      ? ROUTES.tabs
      : ROUTES.languageSelect
  );
}

function isRecoveryUrl(url: string, type: string | null) {
  return type === "recovery" || url.includes("/reset-password");
}

export async function handleAuthUrl(url: string) {
  const params = getUrlParams(url);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const code = params.get("code");
  const type = params.get("type");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return false;

    if (isRecoveryUrl(url, type)) {
      router.replace(ROUTES.resetPassword);
    } else {
      await routeAfterConfirmedAuth();
    }
    return true;
  }

  if (!accessToken || !refreshToken) return false;

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) return false;

  if (isRecoveryUrl(url, type)) {
    router.replace(ROUTES.resetPassword);
  } else {
    await routeAfterConfirmedAuth();
  }
  return true;
}

export function subscribeToAuthDeepLinks() {
  const subscription = Linking.addEventListener("url", ({ url }) => {
    void handleAuthUrl(url);
  });

  void Linking.getInitialURL().then((url) => {
    if (url) void handleAuthUrl(url);
  });

  return () => subscription.remove();
}
