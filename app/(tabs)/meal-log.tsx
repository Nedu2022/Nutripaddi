import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Coffee, Moon, Utensils, Zap,
  ChevronRight, TrendingUp, CalendarDays,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import MealCard from "@/components/MealCard";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import {
  getDailyTotals,
  getTodayMeals,
  type DailyTotals,
  type SavedMeal,
} from "@/src/services/mealHistoryService";
import { getProfile } from "@/src/services/profileService";

const D = {
  bg:        "#F5F6FA",
  card:      "#FFFFFF",
  border:    "#F0F0F0",
  divider:   "#F5F5F5",
  text:      "#0A0A0A",
  muted:     "#6B7280",
  light:     "#B0B8C4",
  accent:    COLORS.primary,
  accentDim: COLORS.softGreen,
};

const MEAL_CATEGORIES = [
  { key: "Breakfast", Icon: Coffee,    dot: "#FF8C42" },
  { key: "Lunch",     Icon: Utensils,  dot: D.accent  },
  { key: "Dinner",    Icon: Moon,      dot: "#6366F1" },
  { key: "Snack",     Icon: Zap,       dot: "#F59E0B" },
];

const MACROS = [
  { label: "Carbs",   key: "carbs"   as const, dot: "#FF8C42" },
  { label: "Protein", key: "protein" as const, dot: D.accent  },
  { label: "Fat",     key: "fat"     as const, dot: "#6366F1" },
];

const EMPTY_TOTALS: DailyTotals = {
  calories: 0,
  carbs: 0,
  fat: 0,
  protein: 0,
  target: 0,
};

export default function MealLogTab() {
  const { t } = useLanguage();
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>(EMPTY_TOTALS);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadMeals = async () => {
      try {
        const profile = await getProfile();
        const target = profile.dailyCalorieTarget ?? 0;
        const [todayMeals, totals] = await Promise.all([
          getTodayMeals(),
          getDailyTotals(new Date(), target),
        ]);

        if (!mounted) return;
        setMeals(todayMeals);
        setDailyTotals(totals);
        setLoadError("");
      } catch (error) {
        if (!mounted) return;
        setLoadError(error instanceof Error ? error.message : "Could not load meals.");
      }
    };

    void loadMeals();

    return () => {
      mounted = false;
    };
  }, []);

  const getMealsByType  = (type: string) => meals.filter((m) => m.mealType === type);
  const getTypeCalories = (type: string) =>
    getMealsByType(type).reduce((sum, m) => sum + m.calories, 0);

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });

  const progressPct = dailyTotals.target > 0
    ? Math.min(dailyTotals.calories / dailyTotals.target, 1)
    : 0;
  const remaining   = Math.max(dailyTotals.target - dailyTotals.calories, 0);

  return (
    <ScreenWrapper scroll bg={D.bg}>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(320)} style={styles.header}>
        <View>
          <Text style={styles.title}>Meal Log</Text>
          <Text style={styles.subtitle}>{todayDate}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{meals.length} logged</Text>
        </View>
      </Animated.View>

      {loadError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : null}

      {/* ── SUMMARY CARD ────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(50).duration(320)} style={styles.summaryCard}>
          <Text style={styles.summaryEyebrow}>{"TODAY'S INTAKE"}</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryNum}>{dailyTotals.calories.toLocaleString()}</Text>
          <Text style={styles.summaryUnit}>kcal</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct * 100}%` as any }]} />
        </View>

        <View style={styles.summaryFooter}>
          <View style={styles.summaryFooterItem}>
            <TrendingUp color={D.accent} size={12} />
            <Text style={styles.summaryFooterText}>
              {Math.round(progressPct * 100)}% of {dailyTotals.target.toLocaleString()} goal
            </Text>
          </View>
          <Text style={styles.summaryDivider}>·</Text>
          <Text style={styles.summaryFooterText}>{remaining.toLocaleString()} kcal left</Text>
        </View>
      </Animated.View>

      {/* ── MACRO STRIP ─────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(100).duration(320)} style={styles.macroStrip}>
        {MACROS.map((m, i) => (
          <View key={m.label} style={[styles.macroCell, i < MACROS.length - 1 && styles.macroCellBorder]}>
            <View style={styles.macroDotRow}>
              <View style={[styles.macroDot, { backgroundColor: m.dot }]} />
              <Text style={styles.macroCellLabel}>{m.label}</Text>
            </View>
            <Text style={styles.macroCellVal}>
              {dailyTotals[m.key]}
              <Text style={styles.macroCellG}>g</Text>
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* ── CATEGORY GRID ───────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(150).duration(320)} style={styles.catGrid}>
        {MEAL_CATEGORIES.map((cat) => {
          const cals  = getTypeCalories(cat.key);
          const count = getMealsByType(cat.key).length;
          const hasLog = count > 0;
          return (
            <View key={cat.key} style={styles.catCard}>
              <View style={[styles.catIconWrap, hasLog && styles.catIconWrapActive]}>
                <cat.Icon color={hasLog ? D.accent : D.light} size={17} />
              </View>
              <Text style={styles.catName}>{cat.key}</Text>
              <Text style={[styles.catCals, !hasLog && styles.catCalsEmpty]}>
                {hasLog ? `${cals} kcal` : "Empty"}
              </Text>
            </View>
          );
        })}
      </Animated.View>

      {/* ── MEALS BY CATEGORY ───────────────────────────────────────── */}
      {MEAL_CATEGORIES.map((cat, catIdx) => {
        const meals = getMealsByType(cat.key);
        if (meals.length === 0) return null;
        return (
          <Animated.View
            key={cat.key}
            entering={FadeInDown.delay(200 + catIdx * 40).duration(320)}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{cat.key}</Text>
              <Text style={styles.sectionCals}>{getTypeCalories(cat.key)} kcal</Text>
            </View>
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() => router.push(ROUTES.mealDetails)}
              />
            ))}
          </Animated.View>
        );
      })}

      {/* ── WEEKLY REPORT CTA ───────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(360).duration(320)}>
        <Pressable
          onPress={() => router.push(ROUTES.nutritionHistory)}
          style={styles.reportCard}
        >
          <View style={styles.reportLeft}>
            <View style={styles.reportIconWrap}>
              <CalendarDays color={D.accent} size={19} />
            </View>
            <View>
              <Text style={styles.reportTitle}>{t.viewWeeklyReport}</Text>
              <Text style={styles.reportSub}>{t.weeklyReportText}</Text>
            </View>
          </View>
          <ChevronRight color={D.light} size={18} />
        </Pressable>
      </Animated.View>

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginTop:      16,
    marginBottom:   20,
  },
  title: {
    color:      D.text,
    fontSize:   28,
    fontFamily: FONTS.extraBold,
  },
  subtitle: {
    color:      D.muted,
    fontSize:   13,
    fontFamily: FONTS.medium,
    marginTop:  3,
  },
  countBadge: {
    backgroundColor:   D.accentDim,
    borderRadius:      999,
    paddingHorizontal: 14,
    paddingVertical:   7,
  },
  countText: {
    color:      D.accent,
    fontSize:   12,
    fontFamily: FONTS.bold,
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

  // Summary card
  summaryCard: {
    backgroundColor: D.card,
    borderRadius:    22,
    padding:         20,
    marginBottom:    12,
    shadowColor:     "#000",
    shadowOpacity:   0.05,
    shadowRadius:    14,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       3,
  },
  summaryEyebrow: {
    color:         D.light,
    fontSize:      10,
    fontFamily:    FONTS.semiBold,
    letterSpacing: 1,
    marginBottom:  10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems:    "flex-end",
    gap:           6,
    marginBottom:  14,
  },
  summaryNum: {
    color:      D.text,
    fontSize:   44,
    fontFamily: FONTS.extraBold,
    lineHeight: 48,
  },
  summaryUnit: {
    color:        D.muted,
    fontSize:     14,
    fontFamily:   FONTS.semiBold,
    marginBottom: 8,
  },
  progressTrack: {
    height:          6,
    borderRadius:    999,
    backgroundColor: "#EEEEEE",
    overflow:        "hidden",
    marginBottom:    12,
  },
  progressFill: {
    height:          "100%",
    borderRadius:    999,
    backgroundColor: D.accent,
  },
  summaryFooter: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           8,
  },
  summaryFooterItem: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           4,
  },
  summaryFooterText: {
    color:      D.muted,
    fontSize:   12,
    fontFamily: FONTS.medium,
  },
  summaryDivider: {
    color:   D.light,
    fontSize: 12,
  },

  // Macro strip
  macroStrip: {
    flexDirection:   "row",
    backgroundColor: D.card,
    borderRadius:    18,
    marginBottom:    14,
    paddingVertical: 16,
    shadowColor:     "#000",
    shadowOpacity:   0.04,
    shadowRadius:    10,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       2,
  },
  macroCell: {
    flex:       1,
    alignItems: "center",
    gap:        6,
  },
  macroCellBorder: {
    borderRightWidth:  1,
    borderRightColor: D.divider,
  },
  macroDotRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           5,
  },
  macroDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  macroCellLabel: {
    color:      D.muted,
    fontSize:   11,
    fontFamily: FONTS.medium,
  },
  macroCellVal: {
    color:      D.text,
    fontSize:   20,
    fontFamily: FONTS.extraBold,
  },
  macroCellG: {
    fontSize:   12,
    fontFamily: FONTS.semiBold,
    color:      D.light,
  },

  // Category grid
  catGrid: {
    flexDirection: "row",
    gap:           10,
    marginBottom:  24,
  },
  catCard: {
    flex:            1,
    backgroundColor: D.card,
    borderRadius:    18,
    padding:         14,
    alignItems:      "center",
    gap:             5,
    shadowColor:     "#000",
    shadowOpacity:   0.04,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       2,
  },
  catIconWrap: {
    width:           36,
    height:          36,
    borderRadius:    12,
    backgroundColor: "#F3F4F6",
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    2,
  },
  catIconWrapActive: {
    backgroundColor: D.accentDim,
  },
  catName: {
    color:      D.text,
    fontSize:   10,
    fontFamily: FONTS.bold,
  },
  catCals: {
    color:      D.accent,
    fontSize:   11,
    fontFamily: FONTS.extraBold,
  },
  catCalsEmpty: {
    color:      D.light,
    fontFamily: FONTS.medium,
  },

  // Section headers
  sectionHeader: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginBottom:   10,
    marginTop:      6,
  },
  sectionTitle: {
    color:      D.text,
    fontSize:   15,
    fontFamily: FONTS.extraBold,
  },
  sectionCals: {
    color:      D.light,
    fontSize:   12,
    fontFamily: FONTS.semiBold,
  },

  // Report CTA
  reportCard: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    backgroundColor:   D.card,
    borderRadius:      20,
    padding:           16,
    marginTop:         8,
    shadowColor:       "#000",
    shadowOpacity:     0.05,
    shadowRadius:      12,
    shadowOffset:      { width: 0, height: 3 },
    elevation:         2,
  },
  reportLeft: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           14,
    flex:          1,
  },
  reportIconWrap: {
    width:           46,
    height:          46,
    borderRadius:    15,
    backgroundColor: D.accentDim,
    alignItems:      "center",
    justifyContent:  "center",
  },
  reportTitle: {
    color:      D.text,
    fontSize:   15,
    fontFamily: FONTS.bold,
  },
  reportSub: {
    color:      D.muted,
    fontSize:   12,
    fontFamily: FONTS.medium,
    marginTop:  2,
    lineHeight: 17,
  },
});
