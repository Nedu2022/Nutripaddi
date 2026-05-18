import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Coffee, Sun, Moon, Cookie, ClipboardList, WifiOff,
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import SectionTitle from "@/components/SectionTitle";
import MealCard from "@/components/MealCard";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { DUMMY_MEALS, DAILY_TOTALS } from "@/data/meals";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";

const MEAL_CATEGORIES = [
  { key: "Breakfast", icon: Coffee, color: COLORS.warning, bg: COLORS.softYellow },
  { key: "Lunch", icon: Sun, color: COLORS.primary, bg: COLORS.softGreen },
  { key: "Dinner", icon: Moon, color: COLORS.secondary, bg: COLORS.softOrange },
  { key: "Snack", icon: Cookie, color: COLORS.error, bg: COLORS.softRed },
];

export default function MealLogTab() {
  const { t } = useLanguage();

  const getMealsByType = (type: string) => DUMMY_MEALS.filter((m) => m.mealType === type);
  const getTypeCalories = (type: string) => getMealsByType(type).reduce((sum, m) => sum + m.calories, 0);

  return (
    <ScreenWrapper scroll>
      <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
        <Text style={styles.title}>{t.mealLogTitle}</Text>
        <Text style={styles.subtitle}>Saved locally for offline use.</Text>
      </Animated.View>

      {/* Daily Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{DAILY_TOTALS.calories}</Text>
          <Text style={styles.summaryLabel}>{t.totalCalories}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{DUMMY_MEALS.length}</Text>
          <Text style={styles.summaryLabel}>{t.mealsLogged}</Text>
        </View>
      </View>

      <View style={styles.offlineCard}>
        <WifiOff color={COLORS.primary} size={18} />
        <Text style={styles.offlineText}>
          You can view saved meals and local food data without internet.
        </Text>
      </View>

      {/* Meal Categories */}
      <View style={styles.categoryRow}>
        {MEAL_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const cals = getTypeCalories(cat.key);
          return (
            <View key={cat.key} style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.bg }]}>
                <Icon color={cat.color} size={18} />
              </View>
              <Text style={styles.categoryName}>{cat.key}</Text>
              <Text style={styles.categoryCals}>{cals > 0 ? `${cals}` : "—"}</Text>
            </View>
          );
        })}
      </View>

      {/* Meals by Category */}
      {MEAL_CATEGORIES.map((cat) => {
        const meals = getMealsByType(cat.key);
        if (meals.length === 0) return null;
        return (
          <View key={cat.key}>
            <SectionTitle title={cat.key} />
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() => router.push(ROUTES.mealDetails)}
              />
            ))}
          </View>
        );
      })}

      <Pressable onPress={() => router.push(ROUTES.nutritionHistory)} style={styles.reportCard}>
        <View style={styles.reportIcon}>
          <ClipboardList color={COLORS.primary} size={20} />
        </View>
        <View style={styles.reportCopy}>
          <Text style={styles.reportTitle}>{t.viewWeeklyReport}</Text>
          <Text style={styles.reportText}>{t.weeklyReportText}</Text>
        </View>
      </Pressable>

      <View style={{ height: 24 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 18, marginBottom: 16 },
  title: { color: COLORS.text, fontSize: 26, fontFamily: FONTS.extraBold },
  subtitle: { color: COLORS.textMuted, fontSize: 14, fontFamily: FONTS.medium, marginTop: 4 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.secondary, borderRadius: 16, padding: 16, alignItems: "center",
  },
  summaryValue: { color: COLORS.white, fontSize: 24, fontFamily: FONTS.extraBold },
  summaryLabel: { color: COLORS.textLight, fontSize: 11, fontFamily: FONTS.medium, marginTop: 4 },
  offlineCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.softGreen,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  offlineText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.medium,
    lineHeight: 19,
  },
  categoryRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  categoryCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 10, alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border,
  },
  categoryIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  categoryName: { color: COLORS.text, fontSize: 11, fontFamily: FONTS.bold },
  categoryCals: { color: COLORS.primary, fontSize: 12, fontFamily: FONTS.bold, marginTop: 2 },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginTop: 8,
  },
  reportIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  reportCopy: {
    flex: 1,
  },
  reportTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  reportText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
    marginTop: 3,
  },
});
