import { Pressable, StyleSheet, Text } from "react-native";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

type CategoryChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export default function CategoryChip({ label, active, onPress }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.activeChip]}
    >
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  text: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  activeText: {
    color: COLORS.white,
  },
});
