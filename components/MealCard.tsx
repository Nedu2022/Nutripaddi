import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { getLucideIcon } from "@/utils/icons";
import type { LoggedMeal } from "@/types";

type MealCardProps = {
  meal: LoggedMeal;
  onPress?: () => void;
};

export default function MealCard({ meal, onPress }: MealCardProps) {
  const Icon = getLucideIcon(meal.iconName);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Icon color={COLORS.primary} size={22} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {meal.foodName}
        </Text>
        <Text style={styles.time}>
          {meal.mealType} • {meal.timeLogged}
        </Text>
      </View>
      <View style={styles.calBadge}>
        <Text style={styles.calText}>{meal.calories}</Text>
        <Text style={styles.calUnit}>kcal</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginTop: 4,
  },
  calBadge: {
    alignItems: "center",
    backgroundColor: COLORS.softOrange,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  calText: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.extraBold,
  },
  calUnit: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.medium,
  },
});
