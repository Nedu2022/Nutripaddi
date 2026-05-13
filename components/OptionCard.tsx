import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Ionicons from "react-native-vector-icons/Ionicons";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

type OptionCardProps = {
  label: string;
  iconName?: string;
  selected: boolean;
  onPress: () => void;
};

export default function OptionCard({ label, iconName, selected, onPress }: OptionCardProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 180 });
  }, [progress, selected]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.82 + progress.value * 0.18 }],
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
      <View style={[styles.iconBox, selected && styles.selectedIconBox]}>
        {iconName ? (
          <Ionicons name={iconName} size={22} color={selected ? COLORS.white : COLORS.primary} />
        ) : (
          <Text style={[styles.codeText, selected && styles.selectedCodeText]}>
            {label
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.label, selected && styles.selectedLabel]}>
          {label}
        </Text>
        <Text style={styles.caption}>
          {selected ? "Selected" : "Tap to choose"}
        </Text>
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
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
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
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softOrange,
  },
  selectedIconBox: {
    backgroundColor: COLORS.primary,
  },
  emoji: {
    fontSize: 22,
  },
  codeText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.extraBold,
  },
  selectedCodeText: {
    color: COLORS.white,
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
  caption: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 3,
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
