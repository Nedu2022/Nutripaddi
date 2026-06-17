import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

type OptionCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export default function OptionCard({ label, selected, onPress }: OptionCardProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 180 });
  }, [progress, selected]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.82 + progress.value * 0.18 }],
  }));

  const radioInnerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
    opacity: progress.value,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        <Animated.View style={[styles.radioInner, radioInnerStyle]} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
      </View>
      <Animated.View style={[styles.check, checkStyle]}>
        <Check color={COLORS.white} size={13} strokeWidth={3} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.softGreen,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  selectedLabel: {
    color: COLORS.primaryDark,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
