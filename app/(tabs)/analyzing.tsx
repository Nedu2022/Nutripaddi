import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Check, ScanLine } from "lucide-react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";

const STEPS = [
  "Reading your food image",
  "Identifying African dishes",
  "Estimating portion",
  "Checking local nutrition values",
  "Preparing your result",
];

export default function AnalyzingScreen() {
  const rotation = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    progress.value = withTiming(100, {
      duration: 4000,
      easing: Easing.out(Easing.cubic),
    });

    const timer = setTimeout(() => {
      router.replace(ROUTES.foodResult);
    }, 4200);

    return () => clearTimeout(timer);
  }, [progress, rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <ScreenWrapper centered contentStyle={styles.container}>
      <Animated.View style={[styles.iconCircle, spinStyle]}>
        <ScanLine color={COLORS.white} size={42} strokeWidth={1.5} />
      </Animated.View>

      <Text style={styles.title}>Analyzing your meal...</Text>
      <Text style={styles.subtitle}>
        This is an estimate. You can change the food or pick the closest amount on the next screen.
      </Text>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      {/* Steps */}
      <View style={styles.steps}>
        {STEPS.map((step, i) => (
          <View key={step} style={styles.stepRow}>
            <View
              style={[styles.stepDot, i <= 3 && styles.stepDotActive]}
            >
              {i <= 3 && <Check color={COLORS.white} size={10} />}
            </View>
            <Text
              style={[styles.stepText, i <= 3 && styles.stepTextActive]}
            >
              {step}
            </Text>
          </View>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontFamily: FONTS.extraBold,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 10,
  },
  progressBg: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginTop: 28,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  steps: {
    marginTop: 24,
    gap: 12,
    width: "100%",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  stepTextActive: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
});
