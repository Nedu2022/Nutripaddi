import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

type MacroCardProps = {
  label: string;
  value: number;
  unit: string;
  color: string;
  bgColor: string;
  icon: ReactNode;
};

export default function MacroCard({
  label,
  value,
  unit,
  color,
  bgColor,
  icon,
}: MacroCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>
        {value}
        <Text style={styles.unit}>{unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  value: {
    fontSize: 22,
    fontFamily: FONTS.extraBold,
    marginTop: 4,
  },
  unit: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
});
