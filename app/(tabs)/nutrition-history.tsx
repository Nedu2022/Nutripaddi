import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Flame,
  Droplets,
  Wheat,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import AppHeader from "@/components/AppHeader";
import MealCard from "@/components/MealCard";
import MacroCard from "@/components/MacroCard";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import {
  getDailyTotalsFromMeals,
  getMealsForWeek,
  getSavedMeals,
  getWeeklyCaloriesFromMeals,
  type DailyTotals,
  type SavedMeal,
  type WeeklyCalories,
} from "@/src/services/mealHistoryService";
import { getProfile } from "@/src/services/profileService";

const PERIODS = ["Today", "This Week", "This Month"] as const;

const EMPTY_TOTALS: DailyTotals = {
  calories: 0,
  carbs: 0,
  fat: 0,
  protein: 0,
  target: 0,
};

export default function NutritionHistoryScreen() {
  const [activePeriod, setActivePeriod] = useState<string>("Today");
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>(EMPTY_TOTALS);
  const [weeklyCalories, setWeeklyCalories] = useState<WeeklyCalories[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        const [profile, allMeals, weekMeals] = await Promise.all([
          getProfile(),
          getSavedMeals({ limit: 50 }),
          getMealsForWeek(),
        ]);
        const target = profile.dailyCalorieTarget ?? 0;
        const todayKey = new Date().toISOString().split("T")[0];
        const todayMeals = weekMeals.filter((meal) => meal.dateLogged === todayKey);
        const totals = getDailyTotalsFromMeals(todayMeals, target);
        const weekly = getWeeklyCaloriesFromMeals(weekMeals);

        if (!mounted) return;
        setMeals(allMeals);
        setDailyTotals(totals);
        setWeeklyCalories(weekly);
        setLoadError("");
      } catch (error) {
        if (!mounted) return;
        setLoadError(error instanceof Error ? error.message : "Could not load nutrition history.");
      }
    };

    void loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  const avgCalories = Math.round(
    weeklyCalories.length
      ? weeklyCalories.reduce((sum, d) => sum + d.value, 0) / weeklyCalories.length
      : 0
  );
  const maxDay = weeklyCalories.reduce(
    (max, d) => (d.value > max.value ? d : max),
    weeklyCalories[0] ?? { day: "-", value: 0, date: "" }
  );
  const minDay = weeklyCalories.reduce(
    (min, d) => (d.value < min.value ? d : min),
    weeklyCalories[0] ?? { day: "-", value: 0, date: "" }
  );
  const maxCal = Math.max(1, ...weeklyCalories.map((d) => d.value));

  return (
    <ScreenWrapper scroll>
      <AppHeader
        showBack
        title="Nutrition History"
        subtitle="Track your progress"
      />

      {loadError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : null}

      {/* Period Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodRow}
      >
        {PERIODS.map((period) => (
          <Pressable
            key={period}
            onPress={() => setActivePeriod(period)}
            style={[
              styles.periodChip,
              activePeriod === period && styles.periodChipActive,
            ]}
          >
            <Text
              style={[
                styles.periodText,
                activePeriod === period && styles.periodTextActive,
              ]}
            >
              {period}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Stats Row */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.statsRow}>
        <View style={styles.statCard}>
          <TrendingUp color={COLORS.primary} size={20} />
          <Text style={styles.statValue}>{avgCalories}</Text>
          <Text style={styles.statLabel}>avg kcal</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp color={COLORS.success} size={20} />
          <Text style={styles.statValue}>{maxDay.value}</Text>
          <Text style={styles.statLabel}>highest ({maxDay.day})</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingDown color={COLORS.warning} size={20} />
          <Text style={styles.statValue}>{minDay.value}</Text>
          <Text style={styles.statLabel}>lowest ({minDay.day})</Text>
        </View>
      </Animated.View>

      {/* Weekly Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Calendar color={COLORS.textMuted} size={16} />
          <Text style={styles.chartTitle}>Weekly calories</Text>
        </View>
        <View style={styles.chartBars}>
          {weeklyCalories.map((day) => {
            const height = (day.value / maxCal) * 110;
            return (
              <View key={day.day} style={styles.barCol}>
                <Text style={styles.barValue}>{day.value}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor:
                        day.value >= dailyTotals.target
                          ? COLORS.primary
                          : COLORS.softGreen,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{day.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Macro Summary */}
      <Text style={styles.sectionLabel}>{"Today's macros"}</Text>
      <View style={styles.macroGrid}>
        <MacroCard
          bgColor={COLORS.softOrange}
          color={COLORS.secondary}
          icon={<Flame color={COLORS.secondary} size={20} />}
          label="Carbs"
          unit="g"
          value={dailyTotals.carbs}
        />
        <MacroCard
          bgColor={COLORS.softGreen}
          color={COLORS.primary}
          icon={<Droplets color={COLORS.primary} size={20} />}
          label="Protein"
          unit="g"
          value={dailyTotals.protein}
        />
        <MacroCard
          bgColor={COLORS.softYellow}
          color={COLORS.warning}
          icon={<Wheat color={COLORS.warning} size={20} />}
          label="Fat"
          unit="g"
          value={dailyTotals.fat}
        />
      </View>

      {/* Meal History */}
      <Text style={styles.sectionLabel}>Meal history</Text>
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  periodRow: {
    marginBottom: 20,
  },
  periodChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  periodChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  periodTextActive: {
    color: COLORS.white,
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: FONTS.extraBold,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.medium,
    textAlign: "center",
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  chartTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barValue: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  bar: {
    width: "65%",
    borderRadius: 6,
    minHeight: 8,
  },
  barLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.medium,
    marginTop: 6,
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
});
