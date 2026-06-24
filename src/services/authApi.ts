import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { ROUTES } from "@/constants/routes";
import { assertSupabaseConfigured, supabase } from "@/src/lib/supabase";
import type { AuthSession } from "@/src/services/authSessionService";

// Required for expo-web-browser to close the auth session on iOS
WebBrowser.maybeCompleteAuthSession();

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

type ResetPasswordPayload = {
  password: string;
};

function getAuthErrorMessage(message?: string) {
  return message || "Authentication failed. Please try again.";
}

function toAuthSession(session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>): AuthSession {
  return {
    accessToken: session.access_token,
    expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
    refreshToken: session.refresh_token,
    tokenType: session.token_type,
    user: {
      id: session.user.id,
      email: session.user.email,
      fullName:
        typeof session.user.user_metadata?.fullName === "string"
          ? session.user.user_metadata.fullName
          : typeof session.user.user_metadata?.name === "string"
            ? session.user.user_metadata.name
            : undefined,
      ...session.user.user_metadata,
    },
  };
}

export async function login(payload: LoginPayload) {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) throw new Error(getAuthErrorMessage(error.message));
  if (!data.session) throw new Error("Supabase did not return a session.");

  return toAuthSession(data.session);
}

export async function register(payload: RegisterPayload) {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    options: {
      data: {
        fullName: payload.fullName,
        name: payload.fullName,
      },
    },
    password: payload.password,
  });

  if (error) throw new Error(getAuthErrorMessage(error.message));

  return data.session ? toAuthSession(data.session) : null;
}

export async function requestPasswordReset(email: string) {
  assertSupabaseConfigured();

  const redirectTo = Linking.createURL(ROUTES.resetPassword.toString());
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw new Error(getAuthErrorMessage(error.message));
}

export async function resetPassword(payload: ResetPasswordPayload) {
  assertSupabaseConfigured();

  const { error } = await supabase.auth.updateUser({
    password: payload.password,
  });

  if (error) throw new Error(getAuthErrorMessage(error.message));
}

/**
 * Google OAuth sign-in via Supabase + expo-web-browser.
 *
 * Setup required in Supabase dashboard:
 *  1. Authentication → Providers → Google → enable + add client ID / secret.
 *  2. Add your app's deep-link URL as an allowed redirect URL:
 *     e.g.  exp://localhost:8081/--/auth-confirmed
 *           nutripaddi://auth-confirmed
 *
 * Returns an AuthSession when successful, or null when the user cancels.
 */
export async function signInWithGoogle(): Promise<AuthSession | null> {
  assertSupabaseConfigured();

  // The redirect URL must match one configured in Supabase → Auth → Redirect URLs
  const redirectTo = Linking.createURL(ROUTES.authConfirmed.toString());

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,  // we open the browser manually below
    },
  });

  if (error) throw new Error(getAuthErrorMessage(error.message));
  if (!data.url) throw new Error("Could not get Google sign-in URL.");

  // Open the Google consent screen in a controlled in-app browser
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success") {
    // User cancelled or browser was dismissed
    return null;
  }

  const callbackUrl = result.url;

  // PKCE flow: Supabase redirects with ?code=…
  try {
    const parsed = new URL(callbackUrl);
    const code   = parsed.searchParams.get("code");
    const oauthError = parsed.searchParams.get("error");

    if (oauthError) throw new Error(oauthError);

    if (code) {
      const { data: sd, error: se } = await supabase.auth.exchangeCodeForSession(code);
      if (se) throw new Error(getAuthErrorMessage(se.message));
      if (sd.session) return toAuthSession(sd.session);
    }

    // Implicit flow fallback: Supabase redirects with #access_token=…
    const hash        = parsed.hash.replace(/^#/, "");
    const hashParams  = new URLSearchParams(hash);
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken) {
      const { data: sd, error: se } = await supabase.auth.setSession({
        access_token:  accessToken,
        refresh_token: refreshToken ?? "",
      });
      if (se) throw new Error(getAuthErrorMessage(se.message));
      if (sd.session) return toAuthSession(sd.session);
    }
  } catch (parseErr) {
    throw new Error(parseErr instanceof Error ? parseErr.message : "Google sign-in failed.");
  }

  return null;
}
