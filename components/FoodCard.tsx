import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import {
  getLocalPortionLabel,
  getNutritionEstimate,
} from "@/data/foodComposition";
import { getLucideIcon } from "@/utils/icons";
import type { AfricanFood } from "@/types";

type FoodCardProps = {
  food: AfricanFood;
  onPress?: () => void;
};

export default function FoodCard({ food, onPress }: FoodCardProps) {
  const Icon = getLucideIcon(food.iconName);
  const estimate = getNutritionEstimate(food.id, "Medium");
  const localAmount = getLocalPortionLabel(food, "Medium");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Icon color={COLORS.secondary} size={26} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={styles.category}>{food.category}</Text>
        <Text style={styles.amount}>{localAmount}</Text>
        <View style={styles.macroRow}>
          <Text style={styles.macro}>{estimate.calories} kcal</Text>
          <View style={styles.dot} />
          <Text style={styles.macro}>C {estimate.carbs}g</Text>
          <View style={styles.dot} />
          <Text style={styles.macro}>P {estimate.protein}g</Text>
        </View>
        <Text style={styles.source} numberOfLines={1}>
          Local nutrition reference
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.softOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  category: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
  amount: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    marginTop: 5,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  macro: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  source: {
    color: COLORS.textLight,
    fontSize: 11,
    fontFamily: FONTS.medium,
    marginTop: 5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
});
