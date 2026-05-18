import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
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
};

export default function QuestionHeader({
  step,
  totalSteps,
  eyebrow,
  title,
  subtitle,
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
      {/* Sleek top progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
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
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 24,
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
