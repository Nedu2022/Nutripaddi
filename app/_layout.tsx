import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { COLORS } from "@/constants/colors";
import { LanguageProvider } from "@/hooks/useLanguage";
import { subscribeToAuthDeepLinks } from "@/src/services/authDeepLinkService";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => subscribeToAuthDeepLinks(), []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LanguageProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      />
      <StatusBar style="dark" />
    </LanguageProvider>
  );
}
