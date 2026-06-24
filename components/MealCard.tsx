/**
 * MealCard — individual meal row in the Meal Log FlatList
 *
 * Optimisations:
 *  • React.memo — skips re-render when meal + onPress refs are stable.
 *  • Fixed height (MEAL_CARD_HEIGHT) so FlatList.getItemLayout is accurate.
 *  • MealImage handles shimmer, fade-in, retry, and expo-image disk cache.
 */

import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Leaf } from "lucide-react-native";

import { MealImage } from "@/components/MealImage";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import type { LoggedMeal } from "@/types";

// Exported so meal-log.tsx can use in getItemLayout without duplicating numbers.
export const MEAL_CARD_HEIGHT = 76;   // card box height (padding included)
export const MEAL_CARD_MARGIN = 10;   // marginBottom
export const MEAL_CARD_TOTAL  = MEAL_CARD_HEIGHT + MEAL_CARD_MARGIN;  // 86

type Props = {
  meal:     LoggedMeal & { imageUri?: string };
  onPress?: () => void;
};

function MealCardInner({ meal, onPress }: Props) {
  const freshnessColor =
    typeof meal.freshnessScore === "number" && meal.freshnessScore >= 72
      ? COLORS.primary
      : COLORS.warning;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${meal.foodName}, ${meal.calories} calories`}
    >
      <MealImage
        uri={meal.imageUri}
        fallbackName={meal.foodName}
        mealType={meal.mealType}
        size={48}
        radius={13}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{meal.foodName}</Text>
        <Text style={styles.time}>{meal.mealType} · {meal.timeLogged}</Text>
        {typeof meal.freshnessScore === "number" && (
          <View style={styles.freshnessBadge}>
            <Leaf color={freshnessColor} size={10} />
            <Text style={[styles.freshnessText, { color: freshnessColor }]}>
              {meal.freshnessScore}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.calBadge}>
        <Text style={styles.calNum}>{meal.calories}</Text>
        <Text style={styles.calUnit}>kcal</Text>
      </View>
    </Pressable>
  );
}

export const MealCard = memo(MealCardInner);

// Default export keeps backwards-compat for any existing import that does
// `import MealCard from "@/components/MealCard"`.
export default MealCard;

const styles = StyleSheet.create({
  card: {
    flexDirection:     "row",
    alignItems:        "center",
    height:            MEAL_CARD_HEIGHT,
    backgroundColor:   "#FFFFFF",
    borderRadius:      16,
    paddingHorizontal: 14,
    marginBottom:      MEAL_CARD_MARGIN,
    gap:               12,
    shadowColor:       "#000",
    shadowOpacity:     0.05,
    shadowRadius:      10,
    shadowOffset:      { width: 0, height: 3 },
    elevation:         2,
  },
  pressed: {
    opacity:   0.88,
    transform: [{ scale: 0.985 }],
  },
  info: {
    flex: 1,
    gap:  2,
  },
  name: {
    color:      "#0A0A0A",
    fontSize:   14,
    fontFamily: FONTS.bold,
    lineHeight: 18,
  },
  time: {
    color:      "#6B7280",
    fontSize:   12,
    fontFamily: FONTS.medium,
    lineHeight: 16,
  },
  freshnessBadge: {
    alignSelf:         "flex-start",
    flexDirection:     "row",
    alignItems:        "center",
    gap:               3,
    backgroundColor:   "#F3F4F6",
    borderRadius:      999,
    paddingHorizontal: 7,
    paddingVertical:   3,
    marginTop:         2,
  },
  freshnessText: {
    fontSize:   10,
    fontFamily: FONTS.bold,
  },
  calBadge: {
    alignItems:        "center",
    backgroundColor:   "#F5F5F5",
    borderRadius:      12,
    paddingHorizontal: 12,
    paddingVertical:   8,
    flexShrink:        0,
  },
  calNum: {
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
