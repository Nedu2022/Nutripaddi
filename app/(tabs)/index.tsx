import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Flame, Target, ScanLine, MessageCircle, ClipboardList, BookOpen,
  Droplets, Wheat, Sparkles,
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import SectionTitle from "@/components/SectionTitle";
import MealCard from "@/components/MealCard";
import MacroCard from "@/components/MacroCard";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { DUMMY_MEALS, DAILY_TOTALS } from "@/data/meals";
import { useLanguage } from "@/hooks/useLanguage";

export default function DashboardTab() {
  const { t } = useLanguage();
  const caloriePercent = Math.round((DAILY_TOTALS.calories / DAILY_TOTALS.target) * 100);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <ScreenWrapper scroll>
      {/* Greeting */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, Betty</Text>
        <Text style={styles.title}>{t.readyToEat}</Text>
      </Animated.View>

      {/* Calorie Summary */}
      <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.cardLabel}>{t.todayCalories}</Text>
          <View style={styles.calorieRow}>
            <Text style={styles.calorieValue}>{DAILY_TOTALS.calories}</Text>
            <Text style={styles.calorieTarget}> / {DAILY_TOTALS.target} {t.kcal}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(caloriePercent, 100)}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{caloriePercent}% {t.ofDailyGoal}</Text>
        </View>
        <View style={styles.iconCircle}>
          <Target color={COLORS.secondary} size={28} />
        </View>
      </Animated.View>

      {/* Macros */}
      <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.macroGrid}>
        <MacroCard bgColor={COLORS.softOrange} color={COLORS.secondary} icon={<Flame color={COLORS.secondary} size={20} />} label="Carbs" unit="g" value={DAILY_TOTALS.carbs} />
        <MacroCard bgColor={COLORS.softGreen} color={COLORS.primary} icon={<Droplets color={COLORS.primary} size={20} />} label="Protein" unit="g" value={DAILY_TOTALS.protein} />
        <MacroCard bgColor={COLORS.softYellow} color={COLORS.warning} icon={<Wheat color={COLORS.warning} size={20} />} label="Fat" unit="g" value={DAILY_TOTALS.fat} />
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInUp.delay(300).duration(400)}>
        <SectionTitle title={t.quickActions} />
        <View style={styles.actionGrid}>
        <Pressable onPress={() => router.push(ROUTES.scan)} style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: COLORS.softGreen }]}>
            <ScanLine color={COLORS.primary} size={22} />
          </View>
          <Text style={styles.actionText}>{t.scanMeal}</Text>
        </Pressable>
        <Pressable onPress={() => router.push(ROUTES.aiCoach)} style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: COLORS.softYellow }]}>
            <MessageCircle color={COLORS.warning} size={22} />
          </View>
          <Text style={styles.actionText}>{t.askCoach}</Text>
        </Pressable>
        <Pressable onPress={() => router.push(ROUTES.mealLog)} style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: COLORS.softOrange }]}>
            <ClipboardList color={COLORS.secondary} size={22} />
          </View>
          <Text style={styles.actionText}>{t.viewMealLog}</Text>
        </Pressable>
        <Pressable onPress={() => router.push(ROUTES.foodDatabase)} style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: COLORS.softRed }]}>
            <BookOpen color={COLORS.error} size={22} />
          </View>
          <Text style={styles.actionText}>{t.browseFoods}</Text>
        </Pressable>
      </View>
      </Animated.View>

      {/* Recent Meals */}
      <Animated.View entering={FadeInUp.delay(400).duration(400)}>
        <SectionTitle actionLabel={t.seeAll} onAction={() => router.push(ROUTES.mealLog)} title={t.recentMeals} />
        {DUMMY_MEALS.slice(0, 2).map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </Animated.View>

      <View style={{ height: 24 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 18, marginBottom: 16 },
  greeting: { color: COLORS.primary, fontSize: 15, fontFamily: FONTS.bold, marginBottom: 4 },
  title: { color: COLORS.text, fontSize: 26, fontFamily: FONTS.extraBold, lineHeight: 32 },
  summaryCard: {
    borderRadius: 16, backgroundColor: COLORS.secondary, padding: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
  },
  summaryLeft: { flex: 1, marginRight: 16 },
  cardLabel: { color: COLORS.textLight, fontSize: 13, fontFamily: FONTS.semiBold },
  calorieRow: { flexDirection: "row", alignItems: "baseline", marginTop: 4 },
  calorieValue: { color: COLORS.white, fontSize: 32, fontFamily: FONTS.extraBold },
  calorieTarget: { color: COLORS.textLight, fontSize: 13, fontFamily: FONTS.medium },
  progressBarBg: { height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.15)", marginTop: 12 },
  progressBarFill: { height: 5, borderRadius: 3, backgroundColor: COLORS.primary },
  progressLabel: { color: COLORS.white, fontSize: 11, fontFamily: FONTS.medium, marginTop: 6 },
  iconCircle: {
    width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.white,
  },
  macroGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  actionCard: {
    width: "47%", alignItems: "center", backgroundColor: COLORS.card,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 8,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionText: { color: COLORS.text, fontSize: 12, fontFamily: FONTS.bold, textAlign: "center" },
});
