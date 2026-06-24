import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

type QuestionHeaderProps = {
  step: number;
  totalSteps: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  showBack?: boolean;
};

export default function QuestionHeader({
  step,
  totalSteps,
  eyebrow,
  title,
  subtitle,
  showBack = true,
}: QuestionHeaderProps) {
  const entrance = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    entrance.value = withTiming(1, { duration: 420 });
    progress.value = withDelay(
      100,
      withTiming(step / totalSteps, { duration: 520 })
    );
  }, [entrance, progress, step, totalSteps]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 14 }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View style={[styles.container, entranceStyle]}>
      <View style={styles.headerRow}>
        {showBack && router.canGoBack() && (
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
            <ChevronLeft color={COLORS.text} size={20} strokeWidth={2.5} />
          </Pressable>
        )}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: FONTS.extraBold,
    lineHeight: 34,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontFamily: FONTS.regular,
    lineHeight: 23,
    marginTop: 10,
  },
});
