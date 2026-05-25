import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import type { DetectedMealPortion } from "@/src/types/detection";

const G = {
  trackBg: "rgba(255, 255, 255, 0.09)",
  trackBorder: "rgba(255, 255, 255, 0.12)",
  optionBg: "rgba(255, 255, 255, 0.07)",
  activeBg: COLORS.primary,
  text: "rgba(255, 255, 255, 0.55)",
  activeText: COLORS.white,
};

type PortionSelectorProps = {
  value: DetectedMealPortion;
  onChange: (value: DetectedMealPortion) => void;
};

const OPTIONS: { value: DetectedMealPortion; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large" },
];

export default function PortionSelector({
  value,
  onChange,
}: PortionSelectorProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, isActive && styles.optionActive]}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 5,
    backgroundColor: G.trackBg,
    borderWidth: 1,
    borderColor: G.trackBorder,
    borderRadius: 14,
    padding: 4,
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 10,
  },
  optionActive: {
    backgroundColor: G.activeBg,
    shadowColor: G.activeBg,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  text: {
    color: G.text,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  textActive: {
    color: G.activeText,
  },
});
