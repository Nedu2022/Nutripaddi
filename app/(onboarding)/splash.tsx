import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming,
} from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { hasAuthSession } from "@/src/services/authSessionService";

export default function SplashScreen() {
  const { t } = useLanguage();
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 850, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 700 });
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));

    let mounted = true;
    const timer = setTimeout(() => {
      hasAuthSession()
        .then((sessionExists) => {
          if (!mounted) return;
          router.replace(sessionExists ? ROUTES.tabs : ROUTES.intro);
        })
        .catch(() => {
          if (mounted) router.replace(ROUTES.intro);
        });
    }, 1200);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [opacity, scale, taglineOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value, transform: [{ scale: scale.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <ScreenWrapper centered contentStyle={styles.container}>
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <Image resizeMode="contain" source={require("@/assets/images/logo.png")} style={styles.logo} />
      </Animated.View>
      <Animated.View style={logoStyle}>
        <Text style={styles.appName}>{t.appName}</Text>
      </Animated.View>
      <Animated.View style={taglineStyle}>
        <Text style={styles.aiSubtitle}>{t.splashSubtitle}</Text>
        <Text style={styles.tagline}>{t.slogan}</Text>
        <View style={styles.accentLine} />
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  logoWrap: {
    width: 140, height: 140, borderRadius: 36, alignItems: "center", justifyContent: "center",
    backgroundColor: COLORS.white, shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.14, shadowRadius: 24, elevation: 5,
  },
  logo: { width: 110, height: 110 },
  appName: { color: COLORS.primary, fontSize: 38, fontFamily: FONTS.extraBold, marginTop: 24 },
  aiSubtitle: { color: COLORS.text, fontSize: 16, fontFamily: FONTS.bold, marginTop: 10, textAlign: "center" },
  tagline: { color: COLORS.textMuted, fontSize: 16, fontFamily: FONTS.medium, marginTop: 10, textAlign: "center" },
  accentLine: { width: 50, height: 4, borderRadius: 2, backgroundColor: COLORS.secondary, alignSelf: "center", marginTop: 16 },
});
