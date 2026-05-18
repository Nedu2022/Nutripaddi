import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import type { DetectedMealPortion } from "@/src/types/detection";

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
    gap: 6,
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    padding: 4,
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    paddingVertical: 10,
  },
  optionActive: {
    backgroundColor: COLORS.secondary,
  },
  text: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  textActive: {
    color: COLORS.white,
  },
});
