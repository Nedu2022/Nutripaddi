import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Coffee,
  Flame,
  Leaf,
  MessageCircle,
  Moon,
  Plus,
  ScanLine,
  TrendingUp,
  Utensils,
  Zap,
} from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { FadeInDown } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import {
  getDailyTotalsFromMeals,
  getMealsForWeek,
  getWeeklyCaloriesFromMeals,
  type DailyTotals,
  type SavedMeal,
  type WeeklyCalories,
} from "@/src/services/mealHistoryService";
import { getProfile, type ProfileData } from "@/src/services/profileService";

const LOGO_MARK = require("@/assets/images/logo-mark.png");

// ── Design tokens (light premium / BitePal-inspired) ─────────────────────────
const D = {
  bg:          "#F5F6FA",
  card:        "#FFFFFF",
  cardBorder:  "#EFEFEF",
  divider:     "#F2F2F2",
  text:        "#0A0A0A",
  textMuted:   "#6B7280",
  textLight:   "#B0B8C4",
  accent:      COLORS.primary,
  accentDim:   COLORS.softGreen,
  orange:      "#FF6B35",
  orangeDim:   "rgba(255,107,53,0.10)",
  indigo:      "#6366F1",
  indigoDim:   "rgba(99,102,241,0.10)",
  amber:       "#F59E0B",
  amberDim:    "rgba(245,158,11,0.10)",
  purple:      "#C77DFF",
  purpleDim:   "rgba(199,125,255,0.14)",
};

const MACRO_TARGETS = { carbs: 275, protein: 90, fat: 73 };
const TODAY_INDEX   = 6;

const MEAL_TYPE_ORDER = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

const EMPTY_TOTALS: DailyTotals = {
  calories: 0,
  carbs: 0,
  fat: 0,
  protein: 0,
  target: 0,
};

const MEAL_META = {
  Breakfast: { Icon: Coffee,   color: D.orange,  bg: D.orangeDim  },
  Lunch:     { Icon: Utensils, color: D.accent,  bg: D.accentDim  },
  Dinner:    { Icon: Moon,     color: D.indigo,  bg: D.indigoDim  },
  Snack:     { Icon: Zap,      color: D.amber,   bg: D.amberDim   },
} as const;

const QUICK_ACTIONS = [
  { Icon: MessageCircle, label: "Ask Coach",  route: ROUTES.aiCoach,          color: D.indigo, bg: D.indigoDim },
  { Icon: ClipboardList, label: "Meal Log",   route: ROUTES.mealLog,          color: D.accent, bg: D.accentDim },
  { Icon: CheckCircle2,  label: "Feedback",   route: ROUTES.studyFeedback,    color: D.amber,  bg: D.amberDim  },
  { Icon: BookOpen,      label: "Lessons",    route: ROUTES.nutritionLessons, color: D.purple, bg: D.purpleDim },
] as const;

function getCurrentStreak(days: WeeklyCalories[]) {
  let count = 0;
  for (const day of days.slice().reverse()) {
    if (day.value <= 0) break;
    count += 1;
  }
  return count;
}

// ── Calorie Ring ────────────────────────────────────────────────────────────
const RING_SIZE    = 200;
const RING_STROKE  = 20;
const RING_RADIUS  = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUM  = 2 * Math.PI * RING_RADIUS;

function CalorieRing({ calories, target }: { calories: number; target: number }) {
  const pct       = target > 0 ? Math.min(calories / target, 1) : 0;
  const filled    = pct * RING_CIRCUM;
  const remaining = Math.max(target - calories, 0);

  return (
    <View style={ringStyles.container}>
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Track */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#EEEEEE"
          strokeWidth={RING_STROKE}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={D.accent}
          strokeWidth={RING_STROKE}
          fill="none"
          strokeDasharray={`${filled} ${RING_CIRCUM - filled}`}
          strokeLinecap="round"
        />
      </Svg>

      {/* Center text */}
      <View style={ringStyles.center} pointerEvents="none">
        <Text style={ringStyles.kcalNum}>{calories.toLocaleString()}</Text>
        <Text style={ringStyles.kcalLabel}>of {target.toLocaleString()} kcal</Text>
        <View style={ringStyles.remainRow}>
          <TrendingUp color={D.accent} size={11} />
          <Text style={ringStyles.remainText}>{remaining.toLocaleString()} left</Text>
        </View>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  container: {
    width:       RING_SIZE,
    height:      RING_SIZE,
    alignSelf:   "center",
    alignItems:  "center",
    justifyContent: "center",
  },
  center: {
    position:  "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  kcalNum: {
    color:      D.text,
    fontSize:   36,
    fontFamily: FONTS.extraBold,
    letterSpacing: 0,
    lineHeight: 40,
  },
  kcalLabel: {
    color:      D.textLight,
    fontSize:   11,
    fontFamily: FONTS.medium,
    marginTop:  3,
  },
  remainRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           4,
    marginTop:     7,
    backgroundColor: D.accentDim,
    borderRadius:  999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  remainText: {
    color:      D.accent,
    fontSize:   11,
    fontFamily: FONTS.bold,
  },
});

// ── Macro Bar ───────────────────────────────────────────────────────────────
function MacroBar({
  label,
  value,
  target,
  color,
  unit = "g",
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
}) {
  const pct = Math.min((value / target) * 100, 100);
  return (
    <View style={macroStyles.row}>
      <View style={macroStyles.meta}>
        <Text style={macroStyles.label}>{label}</Text>
        <Text style={macroStyles.value}>
          <Text style={[macroStyles.valueBold, { color }]}>{value}</Text>
          <Text style={macroStyles.unit}>/{target}{unit}</Text>
        </Text>
      </View>
      <View style={macroStyles.track}>
        <View
          style={[
            macroStyles.fill,
            { width: `${pct}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const macroStyles = StyleSheet.create({
  row: {
    marginBottom: 12,
  },
  meta: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    marginBottom:   7,
  },
  label: {
    color:      D.textMuted,
    fontSize:   12,
    fontFamily: FONTS.semiBold,
  },
  value: {
    fontSize:   12,
    fontFamily: FONTS.medium,
  },
  valueBold: {
    fontFamily: FONTS.extraBold,
    fontSize:   13,
  },
  unit: {
    color:      D.textLight,
    fontSize:   11,
  },
  track: {
    height:          7,
    borderRadius:    999,
    backgroundColor: "#EEEEEE",
    overflow:        "hidden",
  },
  fill: {
    height:       "100%",
    borderRadius: 999,
  },
});

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function DashboardTab() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>(EMPTY_TOTALS);
  const [todayMeals, setTodayMeals] = useState<SavedMeal[]>([]);
  const [weeklyCalories, setWeeklyCalories] = useState<WeeklyCalories[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const [profileData, weekMeals] = await Promise.all([
          getProfile(),
          getMealsForWeek(),
        ]);
        const target = profileData.dailyCalorieTarget ?? 0;
        const todayKey = new Date().toISOString().split("T")[0];
        const meals = weekMeals.filter((meal) => meal.dateLogged === todayKey);
        const totals = getDailyTotalsFromMeals(meals, target);
        const weekly = getWeeklyCaloriesFromMeals(weekMeals);

        if (!mounted) return;
        setProfile(profileData);
        setTodayMeals(meals);
        setDailyTotals(totals);
        setWeeklyCalories(weekly);
        setLoadError("");
      } catch (error) {
        if (!mounted) return;
        setLoadError(error instanceof Error ? error.message : "Could not load dashboard data.");
      }
    };

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const caloriePercent = dailyTotals.target > 0
    ? Math.min(Math.round((dailyTotals.calories / dailyTotals.target) * 100), 100)
    : 0;
  const maxWeekly = Math.max(1, ...weeklyCalories.map((d) => d.value));
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = profile?.nickname || profile?.fullName || "there";
  const avatarInitial = displayName.trim()[0]?.toUpperCase() ?? "N";
  const streak = getCurrentStreak(weeklyCalories);
  const insight = todayMeals[0]?.aiObservation ?? "Scan or log a meal to get a personalized NutriPadi insight.";

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month:   "short",
    day:     "numeric",
  });

  const loggedMeals = MEAL_TYPE_ORDER.map((type) => ({
    type,
    meal: todayMeals.find((m) => m.mealType === type) ?? null,
  }));

  const loggedCount = loggedMeals.filter((m) => m.meal).length;

  return (
    <ScreenWrapper scroll bg={D.bg}>

      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(320)} style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.date}>{todayDate}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.streakBadge}>
            <Flame color={D.orange} size={13} />
            <Text style={styles.streakText}>{streak}-day streak</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
        </View>
      </Animated.View>

      {loadError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : null}

      {/* ── HERO – CALORIE RING ───────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(50).duration(320)} style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>CALORIES TODAY</Text>

        <CalorieRing
          calories={dailyTotals.calories}
          target={dailyTotals.target}
        />

        <Text style={styles.heroPct}>{caloriePercent}% of daily goal</Text>
      </Animated.View>

      {/* ── MACROS ───────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(100).duration(320)} style={styles.macrosCard}>
        <Text style={styles.cardTitle}>Macros</Text>
        <MacroBar
          label="Carbs"
          value={dailyTotals.carbs}
          target={MACRO_TARGETS.carbs}
          color={D.orange}
        />
        <MacroBar
          label="Protein"
          value={dailyTotals.protein}
          target={MACRO_TARGETS.protein}
          color={D.accent}
        />
        <MacroBar
          label="Fat"
          value={dailyTotals.fat}
          target={MACRO_TARGETS.fat}
          color={D.indigo}
        />
      </Animated.View>

      {/* ── SCAN CTA ─────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(150).duration(320)}>
        <Pressable onPress={() => router.push(ROUTES.scan)} style={styles.scanCta}>
          <View style={styles.scanLeft}>
            <View style={styles.scanIconBg}>
              <ScanLine color="#FFFFFF" size={24} />
            </View>
            <View>
              <Text style={styles.scanTitle}>Scan a Meal</Text>
              <Text style={styles.scanSub}>Food detection</Text>
            </View>
          </View>
          <View style={styles.scanArrow}>
            <ChevronRight color="rgba(0,0,0,0.5)" size={18} />
          </View>
        </Pressable>
      </Animated.View>

      {/* ── TODAY'S MEALS ────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(200).duration(320)}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{"Today's meals"}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{loggedCount}/{loggedMeals.length}</Text>
          </View>
        </View>

        <View style={styles.glassCard}>
          {loggedMeals.map(({ type, meal }, i) => {
            const { Icon, color, bg } = MEAL_META[type];
            return (
              <View key={type}>
                {i > 0 && <View style={styles.divider} />}
                {meal ? (
                  <Pressable
                    onPress={() => router.push({ pathname: "/(tabs)/meal-details", params: { id: meal.id } })}
                    style={styles.mealRow}
                  >
                    <View style={[styles.mealIcon, { backgroundColor: bg }]}>
                      {meal.imageUri ? (
                        <Image
                          source={{ uri: meal.imageUri }}
                          style={styles.mealImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Icon color={color} size={16} />
                      )}
                    </View>
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealName} numberOfLines={1}>
                        {meal.foodName}
                      </Text>
                      <View style={styles.mealMeta}>
                        <Text style={styles.mealType}>{type}</Text>
                        <Text style={styles.mealDot}>·</Text>
                        <Text style={styles.mealTime}>{meal.timeLogged}</Text>
                        {typeof meal.freshnessScore === "number" && (
                          <View style={[styles.freshPill, { backgroundColor: D.accentDim }]}>
                            <Leaf color={D.accent} size={9} />
                            <Text style={styles.freshText}>{meal.freshnessScore}%</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.mealKcal}>
                      <Text style={styles.mealKcalNum}>{meal.calories}</Text>
                      <Text style={styles.mealKcalUnit}>kcal</Text>
                    </View>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => router.push(ROUTES.scan)}
                    style={styles.mealRowEmpty}
                  >
                    <View style={[styles.mealIconEmpty, { backgroundColor: bg }]}>
                      <Icon color={color} size={16} />
                    </View>
                    <Text style={styles.mealEmptyLabel}>Log {type}</Text>
                    <View style={[styles.addBtn, { backgroundColor: D.accentDim }]}>
                      <Plus color={D.accent} size={13} />
                    </View>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* ── NUTRIPADI INSIGHT ────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(250).duration(320)} style={styles.insightCard}>
        <View style={[styles.insightIcon, { backgroundColor: D.accentDim }]}>
          <Image resizeMode="contain" source={LOGO_MARK} style={styles.insightLogo} />
        </View>
        <View style={styles.insightBody}>
          <Text style={styles.insightTitle}>NutriPadi says</Text>
                      <Text style={styles.insightText}>{insight}</Text>
        </View>
      </Animated.View>

      {/* ── WEEKLY CHART ─────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(300).duration(320)}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>This week</Text>
          <Pressable
            onPress={() => router.push(ROUTES.nutritionHistory)}
            style={styles.seeAllRow}
          >
            <Text style={styles.seeAllText}>{t.seeAll}</Text>
            <ChevronRight color={D.accent} size={14} />
          </Pressable>
        </View>

        <View style={[styles.glassCard, styles.weeklyCard]}>
          {weeklyCalories.map((day, i) => {
            const isToday = i === TODAY_INDEX;
            const barH    = Math.max(8, (day.value / maxWeekly) * 72);
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
                <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                  {day.day}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* ── QUICK ACTIONS ────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(350).duration(320)}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t.quickActions}</Text>
        </View>

        <View style={styles.actionGrid}>
          {([QUICK_ACTIONS.slice(0, 2), QUICK_ACTIONS.slice(2, 4)] as const).map((row, ri) => (
            <View key={ri} style={styles.actionRow}>
              {row.map(({ Icon, label, route, color, bg }) => (
                <Pressable
                  key={label}
                  onPress={() => router.push(route)}
                  style={styles.actionCard}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: bg }]}>
                    <Icon color={color} size={20} />
                  </View>
                  <Text style={styles.actionLabel}>{label}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </Animated.View>

    </ScreenWrapper>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    marginTop:      4,
    marginBottom:   18,
  },
  greeting: {
    color:      D.textMuted,
    fontSize:   13,
    fontFamily: FONTS.medium,
    marginBottom: 2,
  },
  name: {
    color:      D.text,
    fontSize:   26,
    fontFamily: FONTS.extraBold,
    lineHeight: 32,
  },
  date: {
    color:      D.textLight,
    fontSize:   12,
    fontFamily: FONTS.medium,
    marginTop:  4,
  },
  headerRight: {
    alignItems: "flex-end",
    gap:        10,
    paddingTop: 2,
  },
  streakBadge: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               5,
    backgroundColor:   D.orangeDim,
    borderRadius:      999,
    paddingHorizontal: 10,
    paddingVertical:   5,
  },
  streakText: {
    color:      D.orange,
    fontSize:   11,
    fontFamily: FONTS.bold,
  },
  avatar: {
    width:           38,
    height:          38,
    borderRadius:    19,
    backgroundColor: D.accentDim,
    borderWidth:     1.5,
    borderColor:     D.accent,
    alignItems:      "center",
    justifyContent:  "center",
  },
  avatarText: {
    color:      D.accent,
    fontSize:   16,
    fontFamily: FONTS.extraBold,
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

  // Hero calorie ring card
  heroCard: {
    backgroundColor: D.card,
    borderRadius:    22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom:    12,
    alignItems:      "center",
    borderWidth:     1,
    borderColor:     D.cardBorder,
  },
  heroEyebrow: {
    color:         D.textLight,
    fontSize:      10,
    fontFamily:    FONTS.semiBold,
    letterSpacing: 0,
    marginBottom:  12,
  },
  heroPct: {
    color:      D.textLight,
    fontSize:   12,
    fontFamily: FONTS.semiBold,
    marginTop:  10,
  },

  // Macros cardS
  macrosCard: {
    backgroundColor: D.card,
    borderRadius:    20,
    padding:         16,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     D.cardBorder,
  },
  cardTitle: {
    color:        D.textMuted,
    fontSize:     11,
    fontFamily:   FONTS.semiBold,
    letterSpacing: 0,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  // Scan CTA
  scanCta: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    backgroundColor:   D.accent,
    borderRadius:      18,
    paddingVertical:   14,
    paddingHorizontal: 16,
    marginBottom:      16,
    shadowColor:       D.accent,
    shadowOpacity:     0.4,
    shadowRadius:      20,
    shadowOffset:      { width: 0, height: 8 },
    elevation:         10,
  },
  scanLeft: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           12,
  },
  scanIconBg: {
    width:          40,
    height:         40,
    alignItems:     "center",
    justifyContent: "center",
  },
  scanTitle: {
    color:      "white",
    fontSize:   16,
    fontFamily: FONTS.extraBold,
  },
  scanSub: {
    color:      "white",
    fontSize:   11,
    fontFamily: FONTS.medium,
    marginTop:  1,
  },
  scanArrow: {
    width:           32,
    height:          32,
    borderRadius:    11,
    backgroundColor: "white",
    alignItems:      "center",
    justifyContent:  "center",
  },

  // Section header
  sectionRow: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginBottom:   10,
  },
  sectionTitle: {
    color:      D.text,
    fontSize:   17,
    fontFamily: FONTS.extraBold,
  },
  seeAllRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           2,
  },
  seeAllText: {
    color:      D.accent,
    fontSize:   13,
    fontFamily: FONTS.semiBold,
  },
  countBadge: {
    backgroundColor:   D.accentDim,
    borderRadius:      999,
    paddingHorizontal: 10,
    paddingVertical:   4,
  },
  countText: {
    color:      D.accent,
    fontSize:   12,
    fontFamily: FONTS.bold,
  },

  // Glass card base
  glassCard: {
    backgroundColor: D.card,
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     D.cardBorder,
    overflow:        "hidden",
    marginBottom:    14,
  },
  divider: {
    height:           1,
    backgroundColor:  D.divider,
    marginHorizontal: 18,
  },

  // Meal rows
  mealRow: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               12,
    paddingHorizontal: 14,
    paddingVertical:   12,
  },
  mealIcon: {
    width:           40,
    height:          40,
    borderRadius:    13,
    alignItems:      "center",
    justifyContent:  "center",
    overflow:        "hidden",
  },
  mealImage: {
    width:  "100%",
    height: "100%",
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    color:      D.text,
    fontSize:   14,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  mealMeta: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           5,
    flexWrap:      "wrap",
  },
  mealType: {
    color:      D.textMuted,
    fontSize:   11,
    fontFamily: FONTS.semiBold,
  },
  mealDot: {
    color:   D.textLight,
    fontSize: 11,
  },
  mealTime: {
    color:      D.textLight,
    fontSize:   11,
    fontFamily: FONTS.medium,
  },
  freshPill: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               3,
    borderRadius:      999,
    paddingHorizontal: 6,
    paddingVertical:   2,
  },
  freshText: {
    color:      D.accent,
    fontSize:   10,
    fontFamily: FONTS.bold,
  },
  mealKcal: {
    alignItems: "flex-end",
  },
  mealKcalNum: {
    color:      D.text,
    fontSize:   16,
    fontFamily: FONTS.extraBold,
  },
  mealKcalUnit: {
    color:      D.textLight,
    fontSize:   10,
    fontFamily: FONTS.medium,
    marginTop:  1,
  },
  mealRowEmpty: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               12,
    paddingHorizontal: 14,
    paddingVertical:   12,
  },
  mealIconEmpty: {
    width:      40,
    height:     40,
    borderRadius: 13,
    alignItems:  "center",
    justifyContent: "center",
    opacity:     0.6,
  },
  mealEmptyLabel: {
    flex:       1,
    color:      D.textLight,
    fontSize:   13,
    fontFamily: FONTS.medium,
  },
  addBtn: {
    width:           28,
    height:          28,
    borderRadius:    9,
    alignItems:      "center",
    justifyContent:  "center",
  },

  // NutriPadi Insight
  insightCard: {
    flexDirection:   "row",
    gap:             14,
    backgroundColor: D.accentDim,
    borderRadius:    18,
    padding:         14,
    marginBottom:    14,
    borderWidth:     1,
    borderColor:     D.accentDim,
  },
  insightIcon: {
    width:           38,
    height:          38,
    borderRadius:    12,
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
  },
  insightLogo: {
    width: 28,
    height: 28,
  },
  insightBody: {
    flex: 1,
  },
  insightTitle: {
    color:         D.accent,
    fontSize:      11,
    fontFamily:    FONTS.extraBold,
    letterSpacing: 0,
    textTransform: "uppercase",
    marginBottom:  5,
  },
  insightText: {
    color:      D.textMuted,
    fontSize:   13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },

  // Weekly chart
  weeklyCard: {
    flexDirection:     "row",
    alignItems:        "flex-end",
    justifyContent:    "space-between",
    height:            152,
    paddingHorizontal: 14,
    paddingTop:        24,
    paddingBottom:     12,
    overflow:          "hidden",
  },
  barCol: {
    flex:       1,
    alignItems: "center",
    gap:        6,
    justifyContent: "flex-end",
  },
  barValToday: {
    color:      D.orange,
    fontSize:   9,
    fontFamily: FONTS.bold,
    letterSpacing: 0,
  },
  barTrack: {
    width:           15,
    height:          72,
    borderRadius:    999,
    backgroundColor: "#EEEEEE",
    justifyContent:  "flex-end",
    overflow:        "hidden",
  },
  barTrackToday: {
    backgroundColor: D.orangeDim,
  },
  barFill: {
    width:           15,
    borderRadius:    999,
    backgroundColor: D.accent,
    opacity:         0.55,
  },
  barFillToday: {
    backgroundColor: D.orange,
    opacity:         1,
  },
  barLabel: {
    color:      D.textLight,
    fontSize:   10,
    fontFamily: FONTS.semiBold,
  },
  barLabelToday: {
    color:      D.orange,
    fontFamily: FONTS.bold,
  },

  // Quick actions
  actionGrid: {
    gap: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap:           10,
  },
  actionCard: {
    flex:            1,
    minHeight:       104,
    backgroundColor: D.card,
    borderRadius:    18,
    padding:         12,
    shadowColor:     "#000",
    shadowOpacity:   0.05,
    shadowRadius:    10,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       3,
    alignItems:      "center",
    justifyContent:  "center",
  },
  actionIconBg: {
    width:           38,
    height:          38,
    borderRadius:    13,
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    10,
  },
  actionLabel: {
    color:      D.text,
    fontSize:   12,
    fontFamily: FONTS.bold,
    lineHeight: 16,
    textAlign:  "center",
  },
});
