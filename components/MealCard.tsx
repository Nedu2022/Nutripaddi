import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Leaf } from "lucide-react-native";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import type { LoggedMeal } from "@/types";

type MealCardProps = {
  meal: LoggedMeal;
  onPress?: () => void;
};

const MEAL_COLORS: Record<string, { bg: string; text: string }> = {
  Breakfast: { bg: "#FFF0E6", text: "#FF8C42" },
  Lunch:     { bg: COLORS.softGreen, text: COLORS.primary },
  Dinner:    { bg: "#EEEBFF", text: "#6366F1" },
  Snack:     { bg: "#FEF3C7", text: "#F59E0B" },
};

function FoodThumbnail({ meal }: { meal: LoggedMeal }) {
  if (meal.imageUri) {
    return (
      <Image
        source={{ uri: meal.imageUri }}
        style={styles.foodImage}
        contentFit="cover"
      />
    );
  }

  const palette = MEAL_COLORS[meal.mealType] ?? MEAL_COLORS.Lunch;
  const initial = meal.foodName.trim()[0]?.toUpperCase() ?? "?";

  return (
    <View style={[styles.initialBox, { backgroundColor: palette.bg }]}>
      <Text style={[styles.initialText, { color: palette.text }]}>{initial}</Text>
    </View>
  );
}

export default function MealCard({ meal, onPress }: MealCardProps) {
  const freshnessColor =
    (meal.freshnessScore ?? 0) >= 72 ? COLORS.primary : COLORS.warning;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <FoodThumbnail meal={meal} />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{meal.foodName}</Text>
        <Text style={styles.time}>{meal.mealType} · {meal.timeLogged}</Text>
        {typeof meal.freshnessScore === "number" && (
          <View style={styles.freshnessBadge}>
            <Leaf color={freshnessColor} size={11} />
            <Text style={[styles.freshnessText, { color: freshnessColor }]}>
              {meal.freshnessScore}%
            </Text>
          </View>
        )}
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
    flexDirection:   "row",
    alignItems:      "center",
    backgroundColor: "#FFFFFF",
    borderRadius:    16,
    padding:         14,
    marginBottom:    10,
    gap:             12,
    shadowColor:     "#000",
    shadowOpacity:   0.05,
    shadowRadius:    10,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       2,
  },
  pressed: {
    opacity:   0.88,
    transform: [{ scale: 0.985 }],
  },
  foodImage: {
    width:        48,
    height:       48,
    borderRadius: 13,
  },
  initialBox: {
    width:           48,
    height:          48,
    borderRadius:    13,
    alignItems:      "center",
    justifyContent:  "center",
  },
  initialText: {
    fontSize:   20,
    fontFamily: FONTS.extraBold,
  },
  info: {
    flex: 1,
  },
  name: {
    color:      "#0A0A0A",
    fontSize:   14,
    fontFamily: FONTS.bold,
  },
  time: {
    color:      "#6B7280",
    fontSize:   12,
    fontFamily: FONTS.medium,
    marginTop:  3,
  },
  freshnessBadge: {
    alignSelf:         "flex-start",
    flexDirection:     "row",
    alignItems:        "center",
    gap:               4,
    backgroundColor:   "#F3F4F6",
    borderRadius:      999,
    paddingHorizontal: 8,
    paddingVertical:   4,
    marginTop:         6,
  },
  freshnessText: {
    fontSize:   11,
    fontFamily: FONTS.bold,
  },
  calBadge: {
    alignItems:        "center",
    backgroundColor:   "#F5F5F5",
    borderRadius:      12,
    paddingHorizontal: 12,
    paddingVertical:   8,
  },
  calText: {
    color:      "#0A0A0A",
    fontSize:   15,
    fontFamily: FONTS.extraBold,
  },
  calUnit: {
    color:      "#B0B8C4",
    fontSize:   10,
    fontFamily: FONTS.medium,
  },
});
