import { useEffect, type ReactNode } from "react";
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
  icon?: ReactNode;
  description?: string;
  multiSelect?: boolean;
};

export default function OptionCard({
  label,
  selected,
  onPress,
  icon,
  description,
  multiSelect = false,
}: OptionCardProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 180 });
  }, [progress, selected]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.7 + progress.value * 0.3 }],
  }));

  return (
    <Pressable
      accessibilityRole={multiSelect ? "checkbox" : "radio"}
      accessibilityState={{ checked: selected, selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
          {icon}
        </View>
      ) : null}

      <View style={styles.textBlock}>
        <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.indicator,
          multiSelect ? styles.square : styles.round,
          selected && styles.indicatorSelected,
        ]}
      >
        <Animated.View style={checkStyle}>
          <Check color={COLORS.white} size={13} strokeWidth={3} />
        </Animated.View>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.softGray,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconWrapSelected: {
    backgroundColor: COLORS.white,
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
  description: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 17,
    marginTop: 2,
  },
  indicator: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  round: {
    borderRadius: 12,
  },
  square: {
    borderRadius: 7,
  },
  indicatorSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});
