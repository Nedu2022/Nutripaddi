import { StyleSheet, Text, View } from "react-native";
import {
  Flame,
  Droplets,
  Wheat,
  Clock,
  Heart,
} from "lucide-react-native";

import ScreenWrapper from "@/components/ScreenWrapper";
import AppHeader from "@/components/AppHeader";
import MacroCard from "@/components/MacroCard";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { DUMMY_MEALS } from "@/data/meals";
import { NIGERIAN_FOODS } from "@/data/foods";
import { getLucideIcon } from "@/utils/icons";

// Show details of the first logged meal
const MEAL = DUMMY_MEALS[0];
const FOOD = NIGERIAN_FOODS.find((f) => f.id === MEAL.foodId);

export default function MealDetailsScreen() {
  const Icon = getLucideIcon(MEAL.iconName);

  return (
    <ScreenWrapper scroll>
      <AppHeader showBack title="Meal Details" />

      {/* Meal Header */}
      <View style={styles.headerCard}>
        <View style={styles.mealIconWrap}>
          <Icon color={COLORS.secondary} size={32} />
        </View>
        <Text style={styles.mealName}>{MEAL.foodName}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{MEAL.mealType}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Clock color={COLORS.textMuted} size={14} />
            <Text style={styles.metaText}>{MEAL.timeLogged}</Text>
          </View>
        </View>
      </View>

      {/* Calorie Card */}
      <View style={styles.calorieCard}>
        <Flame color={COLORS.secondary} size={28} />
        <View>
          <Text style={styles.calorieValue}>
            {MEAL.calories}{" "}
            <Text style={styles.calorieUnit}>kcal</Text>
          </Text>
          <Text style={styles.calorieLabel}>Total calories</Text>
        </View>
      </View>

      {/* Macros */}
      <Text style={styles.sectionLabel}>Macro breakdown</Text>
      <View style={styles.macroGrid}>
        <MacroCard
          bgColor={COLORS.softOrange}
          color={COLORS.secondary}
          icon={<Flame color={COLORS.secondary} size={20} />}
          label="Carbs"
          unit="g"
          value={MEAL.carbs}
        />
        <MacroCard
          bgColor={COLORS.softGreen}
          color={COLORS.primary}
          icon={<Droplets color={COLORS.primary} size={20} />}
          label="Protein"
          unit="g"
          value={MEAL.protein}
        />
        <MacroCard
          bgColor={COLORS.softYellow}
          color={COLORS.warning}
          icon={<Wheat color={COLORS.warning} size={20} />}
          label="Fat"
          unit="g"
          value={MEAL.fat}
        />
      </View>

      {/* Food Info */}
      {FOOD && (
        <>
          <Text style={styles.sectionLabel}>About this food</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutDesc}>{FOOD.description}</Text>
          </View>

          <Text style={styles.sectionLabel}>Ingredients</Text>
          <View style={styles.ingredientsWrap}>
            {FOOD.ingredients.map((ingredient) => (
              <View key={ingredient} style={styles.ingredientChip}>
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>

          <View style={styles.healthCard}>
            <Heart color={COLORS.primary} size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.healthTitle}>Health note</Text>
              <Text style={styles.healthText}>{FOOD.healthNote}</Text>
            </View>
          </View>
        </>
      )}

      <View style={{ height: 24 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    marginBottom: 20,
  },
  mealIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: COLORS.softOrange,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  mealName: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: FONTS.extraBold,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.softGreen,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  calorieCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.softOrange,
    borderRadius: 18,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  calorieValue: {
    color: COLORS.text,
    fontSize: 32,
    fontFamily: FONTS.extraBold,
  },
  calorieUnit: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
  },
  calorieLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 12,
  },
  macroGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  aboutCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  aboutDesc: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  ingredientsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  ingredientChip: {
    backgroundColor: COLORS.card,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ingredientText: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  healthCard: {
    flexDirection: "row",
    backgroundColor: COLORS.softGreen,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  healthTitle: {
    color: COLORS.primary,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  healthText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
    marginTop: 4,
  },
});
