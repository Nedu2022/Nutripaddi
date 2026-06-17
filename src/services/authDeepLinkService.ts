import { router } from "expo-router";
import * as Linking from "expo-linking";

import { supabase } from "@/src/lib/supabase";
import { ROUTES } from "@/constants/routes";

function getUrlParams(url: string) {
  const [, fragment = ""] = url.split("#");
  const query = url.includes("?") ? url.split("?")[1]?.split("#")[0] ?? "" : "";
  return new URLSearchParams(fragment || query);
}

export async function handleAuthUrl(url: string) {
  const params = getUrlParams(url);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const type = params.get("type");

  if (!accessToken || !refreshToken) return;

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (!error && type === "recovery") {
    router.replace(ROUTES.resetPassword);
  }
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
