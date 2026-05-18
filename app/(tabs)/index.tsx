import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  Plus,
  ScanLine,
  Sparkles,
  WifiOff,
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import SectionTitle from "@/components/SectionTitle";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { DAILY_TOTALS, DUMMY_MEALS, WEEKLY_CALORIES } from "@/data/meals";
import { useLanguage } from "@/hooks/useLanguage";

const MACRO_TARGETS = { carbs: 275, protein: 90, fat: 73 };
const TODAY_INDEX   = 6; // Sunday in WEEKLY_CALORIES

const INSIGHT =
  "You have logged meals with plenty carbohydrates today. Try adding egg, fish, beans, chicken, or one piece of meat to your next meal.";

const MEAL_TYPE_ORDER = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

export default function DashboardTab() {
  const { t } = useLanguage();

  const caloriePercent = Math.min(
    Math.round((DAILY_TOTALS.calories / DAILY_TOTALS.target) * 100),
    100
  );
  const calorieLeft        = Math.max(DAILY_TOTALS.target - DAILY_TOTALS.calories, 0);
  const maxWeekly          = Math.max(...WEEKLY_CALORIES.map((d) => d.value));

  const hour     = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month:   "short",
    day:     "numeric",
  });

  // Build today's meals in breakfast-first order
  const loggedMeals = MEAL_TYPE_ORDER.map((type) => ({
    type,
    meal: DUMMY_MEALS.find((m) => m.mealType === type) ?? null,
  }));

  return (
    <ScreenWrapper scroll>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.duration(380)} style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}, Betty</Text>
          <Text style={styles.headerDate}>{todayDate}</Text>
        </View>
        <View style={styles.offlineBadge}>
          <WifiOff color={COLORS.primary} size={12} />
          <Text style={styles.offlineText}>Offline ready</Text>
        </View>
      </Animated.View>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(60).duration(380)} style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Calories today</Text>
            <View style={styles.calorieRow}>
              <Text style={styles.calorieNum}>{DAILY_TOTALS.calories.toLocaleString()}</Text>
              <Text style={styles.calorieOf}>/{DAILY_TOTALS.target.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.remainPill}>
            <Text style={styles.remainNum}>{calorieLeft}</Text>
            <Text style={styles.remainLabel}>left</Text>
          </View>
        </View>

        {/* Progress track */}
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${caloriePercent}%` }]} />
        </View>
        <Text style={styles.trackLabel}>{caloriePercent}% of daily goal</Text>
      </Animated.View>

      {/* ── MACROS ─────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(110).duration(380)} style={styles.macroRow}>
        <MacroCell
          label="Carbs"
          value={DAILY_TOTALS.carbs}
          target={MACRO_TARGETS.carbs}
          color={COLORS.freshOrange}
        />
        <View style={styles.macroDivider} />
        <MacroCell
          label="Protein"
          value={DAILY_TOTALS.protein}
          target={MACRO_TARGETS.protein}
          color={COLORS.primary}
        />
        <View style={styles.macroDivider} />
        <MacroCell
          label="Fat"
          value={DAILY_TOTALS.fat}
          target={MACRO_TARGETS.fat}
          color="#888"
        />
      </Animated.View>

      {/* ── SCAN CTA ───────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(160).duration(380)}>
        <Pressable onPress={() => router.push(ROUTES.scan)} style={styles.scanCta}>
          <ScanLine color={COLORS.white} size={20} />
          <Text style={styles.scanCtaText}>{t.scanMeal}</Text>
        </Pressable>
      </Animated.View>

      {/* ── TODAY'S MEALS ──────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(210).duration(380)} style={styles.mealsCard}>
        <Text style={styles.mealsCardTitle}>{"Today's meals"}</Text>
        {loggedMeals.map(({ type, meal }, i) => (
          <View key={type}>
            {i > 0 && <View style={styles.mealDivider} />}
            {meal ? (
              <Pressable
                onPress={() => router.push(ROUTES.mealDetails)}
                style={styles.mealRow}
              >
                <View style={styles.mealTimeCol}>
                  <Text style={styles.mealTime}>{meal.timeLogged}</Text>
                </View>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName} numberOfLines={1}>
                    {meal.foodName}
                  </Text>
                  <Text style={styles.mealType}>{type}</Text>
                </View>
                <View style={styles.mealKcalWrap}>
                  <Text style={styles.mealKcal}>{meal.calories}</Text>
                  <Text style={styles.mealKcalUnit}>kcal</Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push(ROUTES.scan)}
                style={styles.mealRowEmpty}
              >
                <View style={styles.mealTimeCol}>
                  <Text style={styles.mealTimeEmpty}>–</Text>
                </View>
                <Text style={styles.mealEmptyLabel}>{type} not logged yet</Text>
                <View style={styles.addIcon}>
                  <Plus color={COLORS.primary} size={14} />
                </View>
              </Pressable>
            )}
          </View>
        ))}
      </Animated.View>

      {/* ── AI INSIGHT ─────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(260).duration(380)} style={styles.insight}>
        <View style={styles.insightLeft}>
          <View style={styles.insightDot} />
        </View>
        <View style={styles.insightBody}>
          <View style={styles.insightHeader}>
            <Sparkles color={COLORS.primary} size={14} />
            <Text style={styles.insightTitle}>NutriPadi says</Text>
          </View>
          <Text style={styles.insightText}>{INSIGHT}</Text>
        </View>
      </Animated.View>

      {/* ── WEEKLY ─────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(310).duration(380)}>
        <SectionTitle
          actionLabel={t.seeAll}
          onAction={() => router.push(ROUTES.nutritionHistory)}
          title="This week"
        />
        <View style={styles.weekly}>
          {WEEKLY_CALORIES.map((day, i) => {
            const isToday = i === TODAY_INDEX;
            const barH    = Math.max(16, (day.value / maxWeekly) * 68);
            return (
              <View key={day.day} style={styles.barCol}>
                {isToday && (
                  <Text style={styles.barValToday}>{day.value}</Text>
                )}
                <View style={[styles.barTrack, isToday && styles.barTrackToday]}>
                  <View
                    style={[
                      styles.barFill,
                      { height: barH },
                      isToday && styles.barFillToday,
                    ]}
                  />
                </View>
                <Text style={[styles.barDay, isToday && styles.barDayToday]}>
                  {day.day}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* ── QUICK ACTIONS ──────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(360).duration(380)}>
        <SectionTitle title={t.quickActions} />
        <View style={styles.actionGrid}>
          {[
            { icon: <MessageCircle color={COLORS.primary} size={20} />, label: t.askCoach,      route: ROUTES.aiCoach },
            { icon: <ClipboardList color={COLORS.primary} size={20} />, label: t.viewMealLog,   route: ROUTES.mealLog },
            { icon: <BookOpen      color={COLORS.primary} size={20} />, label: "Food Library",  route: ROUTES.foodDatabase },
            { icon: <CheckCircle2  color={COLORS.primary} size={20} />, label: "Feedback",      route: ROUTES.studyFeedback },
          ].map(({ icon, label, route }) => (
            <Pressable
              key={label}
              onPress={() => router.push(route)}
              style={styles.actionCard}
            >
              <View style={styles.actionIconWrap}>{icon}</View>
              <Text style={styles.actionLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <View style={{ height: 28 }} />
    </ScreenWrapper>
  );
}

function MacroCell({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  return (
    <View style={styles.macroCell}>
      <Text style={[styles.macroValue, { color }]}>{value}<Text style={styles.macroUnit}>g</Text></Text>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroTarget}>of {target}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginTop:      12,
    marginBottom:   20,
  },
  greeting: {
    color:      COLORS.text,
    fontSize:   22,
    fontFamily: FONTS.extraBold,
  },
  headerDate: {
    color:      COLORS.textMuted,
    fontSize:   13,
    fontFamily: FONTS.medium,
    marginTop:  3,
  },
  offlineBadge: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             5,
    backgroundColor: COLORS.softGreen,
    borderRadius:    999,
    paddingHorizontal: 10,
    paddingVertical:   6,
  },
  offlineText: {
    color:      COLORS.primaryDark,
    fontSize:   11,
    fontFamily: FONTS.bold,
  },

  // Hero
  hero: {
    backgroundColor: COLORS.secondary,
    borderRadius:    22,
    padding:         22,
    marginBottom:    12,
  },
  heroTop: {
    flexDirection:  "row",
    alignItems:     "flex-start",
    justifyContent: "space-between",
    marginBottom:   18,
  },
  heroLabel: {
    color:      "rgba(255,255,255,0.55)",
    fontSize:   12,
    fontFamily: FONTS.semiBold,
    marginBottom: 6,
  },
  calorieRow: {
    flexDirection: "row",
    alignItems:    "baseline",
    gap:           4,
  },
  calorieNum: {
    color:      COLORS.white,
    fontSize:   44,
    fontFamily: FONTS.extraBold,
    lineHeight: 50,
  },
  calorieOf: {
    color:      "rgba(255,255,255,0.45)",
    fontSize:   15,
    fontFamily: FONTS.medium,
  },
  remainPill: {
    alignItems:      "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius:    16,
    paddingHorizontal: 16,
    paddingVertical:   12,
    minWidth:        72,
  },
  remainNum: {
    color:      COLORS.freshOrange,
    fontSize:   22,
    fontFamily: FONTS.extraBold,
  },
  remainLabel: {
    color:      "rgba(255,255,255,0.55)",
    fontSize:   11,
    fontFamily: FONTS.semiBold,
    marginTop:  2,
  },
  track: {
    height:          10,
    borderRadius:    999,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow:        "hidden",
  },
  trackFill: {
    height:          10,
    borderRadius:    999,
    backgroundColor: COLORS.freshOrange,
  },
  trackLabel: {
    color:      "rgba(255,255,255,0.5)",
    fontSize:   11,
    fontFamily: FONTS.semiBold,
    marginTop:  8,
  },

  // Macros
  macroRow: {
    flexDirection:   "row",
    backgroundColor: COLORS.white,
    borderRadius:    18,
    borderWidth:     1,
    borderColor:     COLORS.border,
    marginBottom:    12,
    paddingVertical: 16,
  },
  macroCell: {
    flex:       1,
    alignItems: "center",
    gap:        3,
  },
  macroDivider: {
    width:           1,
    backgroundColor: COLORS.border,
    marginVertical:  6,
  },
  macroValue: {
    fontSize:   24,
    fontFamily: FONTS.extraBold,
  },
  macroUnit: {
    fontSize:   13,
    fontFamily: FONTS.bold,
  },
  macroLabel: {
    color:      COLORS.text,
    fontSize:   12,
    fontFamily: FONTS.bold,
  },
  macroTarget: {
    color:      COLORS.textLight,
    fontSize:   11,
    fontFamily: FONTS.medium,
  },

  // Scan CTA
  scanCta: {
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             9,
    backgroundColor: COLORS.primary,
    borderRadius:    16,
    paddingVertical: 16,
    marginBottom:    16,
  },
  scanCtaText: {
    color:      COLORS.white,
    fontSize:   16,
    fontFamily: FONTS.bold,
  },

  // Today's meals
  mealsCard: {
    backgroundColor: COLORS.white,
    borderRadius:    18,
    borderWidth:     1,
    borderColor:     COLORS.border,
    marginBottom:    14,
    overflow:        "hidden",
  },
  mealsCardTitle: {
    color:          COLORS.text,
    fontSize:       15,
    fontFamily:     FONTS.extraBold,
    paddingHorizontal: 16,
    paddingTop:     16,
    paddingBottom:  12,
  },
  mealDivider: {
    height:           1,
    backgroundColor:  COLORS.border,
    marginHorizontal: 16,
  },
  mealRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           12,
    paddingHorizontal: 16,
    paddingVertical:   12,
  },
  mealTimeCol: {
    width: 72,
  },
  mealTime: {
    color:      COLORS.textMuted,
    fontSize:   12,
    fontFamily: FONTS.semiBold,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    color:      COLORS.text,
    fontSize:   14,
    fontFamily: FONTS.bold,
  },
  mealType: {
    color:      COLORS.textMuted,
    fontSize:   11,
    fontFamily: FONTS.medium,
    marginTop:  2,
  },
  mealKcalWrap: {
    alignItems: "flex-end",
  },
  mealKcal: {
    color:      COLORS.text,
    fontSize:   15,
    fontFamily: FONTS.extraBold,
  },
  mealKcalUnit: {
    color:      COLORS.textMuted,
    fontSize:   10,
    fontFamily: FONTS.medium,
  },
  mealRowEmpty: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           12,
    paddingHorizontal: 16,
    paddingVertical:   12,
  },
  mealTimeEmpty: {
    color:      COLORS.textLight,
    fontSize:   14,
    fontFamily: FONTS.medium,
  },
  mealEmptyLabel: {
    flex:       1,
    color:      COLORS.textLight,
    fontSize:   13,
    fontFamily: FONTS.medium,
  },
  addIcon: {
    width:           28,
    height:          28,
    borderRadius:    8,
    backgroundColor: COLORS.softGreen,
    alignItems:      "center",
    justifyContent:  "center",
  },

  // AI Insight
  insight: {
    flexDirection:   "row",
    gap:             0,
    backgroundColor: COLORS.softGreen,
    borderRadius:    18,
    marginBottom:    20,
    overflow:        "hidden",
  },
  insightLeft: {
    width:           6,
    backgroundColor: COLORS.primary,
  },
  insightDot: {
    flex: 1,
  },
  insightBody: {
    flex:    1,
    padding: 16,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           6,
    marginBottom:  6,
  },
  insightTitle: {
    color:      COLORS.primaryDark,
    fontSize:   13,
    fontFamily: FONTS.bold,
  },
  insightText: {
    color:      COLORS.text,
    fontSize:   13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },

  // Weekly chart
  weekly: {
    flexDirection:      "row",
    alignItems:         "flex-end",
    justifyContent:     "space-between",
    backgroundColor:    COLORS.white,
    borderRadius:       16,
    borderWidth:        1,
    borderColor:        COLORS.border,
    paddingHorizontal:  14,
    paddingBottom:      12,
    paddingTop:         10,
    height:             118,
    marginBottom:       20,
  },
  barCol: {
    flex:       1,
    alignItems: "center",
    gap:        5,
    justifyContent: "flex-end",
  },
  barValToday: {
    color:      COLORS.freshOrange,
    fontSize:   9,
    fontFamily: FONTS.bold,
  },
  barTrack: {
    width:           18,
    height:          72,
    borderRadius:    999,
    backgroundColor: COLORS.softGreen,
    justifyContent:  "flex-end",
    overflow:        "hidden",
  },
  barTrackToday: {
    backgroundColor: "#FFF0E8",
  },
  barFill: {
    width:           18,
    borderRadius:    999,
    backgroundColor: COLORS.primary,
  },
  barFillToday: {
    backgroundColor: COLORS.freshOrange,
  },
  barDay: {
    color:      COLORS.textMuted,
    fontSize:   11,
    fontFamily: FONTS.semiBold,
  },
  barDayToday: {
    color:      COLORS.freshOrange,
    fontFamily: FONTS.bold,
  },

  // Quick actions
  actionGrid: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           10,
  },
  actionCard: {
    width:           "47%",
    backgroundColor: COLORS.white,
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     COLORS.border,
    gap:             10,
  },
  actionIconWrap: {
    width:           40,
    height:          40,
    borderRadius:    12,
    backgroundColor: COLORS.softGreen,
    alignItems:      "center",
    justifyContent:  "center",
  },
  actionLabel: {
    color:      COLORS.text,
    fontSize:   13,
    fontFamily: FONTS.bold,
  },
});
