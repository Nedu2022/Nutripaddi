import { supabase } from "@/src/lib/supabase";

export type AuthUser = {
  id?: string | number;
  email?: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string;
  [key: string]: unknown;
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
  user?: AuthUser;
};

export async function saveAuthSession(_session?: AuthSession | null) {
  return;
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;

  const { session } = data;
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

export async function getAccessToken() {
  const session = await getAuthSession();
  return session?.accessToken ?? null;
}

export async function clearAuthSession() {
  await supabase.auth.signOut();
}

export async function hasAuthSession() {
  const { data, error } = await supabase.auth.getSession();
  return !error && Boolean(data.session?.access_token);
}
