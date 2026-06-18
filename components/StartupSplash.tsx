import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { hasAuthSession } from "@/src/services/authSessionService";

const MIN_SPLASH_DURATION = 1850;
const EXIT_DURATION = 320;

const sleep = (duration: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, duration);
  });

export default function StartupSplash() {
  const { t } = useLanguage();
  const screenOpacity = useSharedValue(1);
  const logoScale = useSharedValue(1);
  const copyOpacity = useSharedValue(0);
  const copyY = useSharedValue(16);
  const accentScale = useSharedValue(0);

  useEffect(() => {
    let mounted = true;

    logoScale.value = withSequence(
      withTiming(1.035, { duration: 620, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) })
    );
    copyOpacity.value = withDelay(
      240,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })
    );
    copyY.value = withDelay(
      240,
      withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) })
    );
    accentScale.value = withDelay(
      760,
      withTiming(1, { duration: 440, easing: Easing.out(Easing.cubic) })
    );

    const finishStartup = async () => {
      const startedAt = Date.now();
      const sessionExists = await hasAuthSession().catch(() => false);
      const remainingTime = Math.max(0, MIN_SPLASH_DURATION - (Date.now() - startedAt));

      await sleep(remainingTime);
      if (!mounted) return;

      const nextRoute = sessionExists ? ROUTES.tabs : ROUTES.intro;
      screenOpacity.value = withTiming(0, {
        duration: EXIT_DURATION,
        easing: Easing.in(Easing.cubic),
      });
      logoScale.value = withTiming(0.97, {
        duration: EXIT_DURATION,
        easing: Easing.in(Easing.cubic),
      });
      copyY.value = withTiming(-8, {
        duration: EXIT_DURATION,
        easing: Easing.in(Easing.cubic),
      });

      await sleep(EXIT_DURATION);
      if (mounted) router.replace(nextRoute);
    };

    void finishStartup();

    return () => {
      mounted = false;
    };
  }, [accentScale, copyOpacity, copyY, logoScale, screenOpacity]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));
  const copyStyle = useAnimatedStyle(() => ({
    opacity: copyOpacity.value,
    transform: [{ translateY: copyY.value }],
  }));
  const accentStyle = useAnimatedStyle(() => ({
    opacity: accentScale.value,
    transform: [{ scaleX: accentScale.value }],
  }));

  return (
    <ScreenWrapper centered bg={COLORS.background} contentStyle={styles.screen}>
      <Animated.View style={[styles.content, screenStyle]}>
        <Animated.Image
          fadeDuration={0}
          resizeMode="contain"
          source={require("@/assets/images/logo.png")}
          style={[styles.logo, logoStyle]}
        />

        <Animated.View style={copyStyle}>
          <Text style={styles.appName}>{t.appName}</Text>
          <Text style={styles.aiSubtitle}>{t.splashSubtitle}</Text>
          <Text style={styles.tagline}>{t.slogan}</Text>
          <View style={styles.accentTrack}>
            <Animated.View style={[styles.accentLine, accentStyle]} />
          </View>
        </Animated.View>
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 220,
    height: 220,
  },
  appName: {
    color: COLORS.primary,
    fontSize: 38,
    fontFamily: FONTS.extraBold,
    marginTop: -12,
    textAlign: "center",
  },
  aiSubtitle: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginTop: 10,
    textAlign: "center",
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginTop: 10,
    textAlign: "center",
  },
  accentTrack: {
    width: 50,
    height: 4,
    alignSelf: "center",
    marginTop: 16,
    overflow: "hidden",
  },
  accentLine: {
    width: 50,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});
