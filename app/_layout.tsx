import { useEffect, useRef } from "react";
import { View } from "react-native";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { COLORS } from "@/constants/colors";
import { LanguageProvider } from "@/hooks/useLanguage";
import { subscribeToAuthDeepLinks } from "@/src/services/authDeepLinkService";
import { NetworkProvider, useNetworkContext } from "@/src/context/NetworkProvider";
import OfflineBanner from "@/components/OfflineBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // React Query pauses queries when offline and resumes when online.
      // retry:2 handles transient failures without hammering the server.
      retry: 2,
    },
  },
});

void SplashScreen.preventAutoHideAsync();

// Watches for offline→online transitions and invalidates all cached queries
// so every screen refetches fresh data the moment the connection is restored.
function NetworkRefetchHandler() {
  const { status } = useNetworkContext();
  const prevRef    = useRef(status);

  useEffect(() => {
    const prev       = prevRef.current;
    prevRef.current  = status;
    if (prev !== "online" && status === "online") {
      void queryClient.invalidateQueries();
    }
  }, [status]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => subscribeToAuthDeepLinks(), []);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <NetworkProvider>
          {/*
            Root View gives OfflineBanner a reference frame for absolute
            positioning. It fills the screen and is transparent to layout.
          */}
          <View style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown:  false,
                contentStyle: { backgroundColor: COLORS.background },
              }}
            />
            <StatusBar style="dark" />
            {/*
              OfflineBanner is absolutely positioned (zIndex: 9999) and has
              pointerEvents="none" so it never intercepts taps on content below.
            */}
            <OfflineBanner />
          </View>
          {/* Invalidates all React Query caches on reconnect */}
          <NetworkRefetchHandler />
        </NetworkProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
