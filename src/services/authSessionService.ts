import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_SESSION_KEY = "@nutriPadi_auth_session";

export async function saveAuthSession() {
  await AsyncStorage.setItem(AUTH_SESSION_KEY, "signed-in");
}

export async function clearAuthSession() {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
}

export async function hasAuthSession() {
  const session = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  return session === "signed-in";
}
