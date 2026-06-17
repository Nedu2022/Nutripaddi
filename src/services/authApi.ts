import * as Linking from "expo-linking";

import { assertSupabaseConfigured, supabase } from "@/src/lib/supabase";
import type { AuthSession } from "@/src/services/authSessionService";

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

  const redirectTo = Linking.createURL("/(auth)/reset-password");
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
