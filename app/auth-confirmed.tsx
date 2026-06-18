import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import * as Linking from "expo-linking";
import { router } from "expo-router";

import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { handleAuthUrl } from "@/src/services/authDeepLinkService";
import { hasAuthSession } from "@/src/services/authSessionService";

export default function AuthConfirmedScreen() {
  useEffect(() => {
    let mounted = true;

    const finishAuth = async () => {
      const url = await Linking.getInitialURL();
      const handled = url ? await handleAuthUrl(url) : false;
      if (handled || !mounted) return;

      const signedIn = await hasAuthSession().catch(() => false);
      if (!mounted) return;

      router.replace(signedIn ? ROUTES.languageSelect : ROUTES.login);
    };

    void finishAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScreenWrapper centered contentStyle={styles.container}>
      <ActivityIndicator color={COLORS.primary} size="small" />
      <Text style={styles.title}>Confirming your account...</Text>
      <Text style={styles.subtitle}>We will continue your NutriPadi setup in a moment.</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 17,
    marginTop: 6,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 280,
    textAlign: "center",
  },
});
