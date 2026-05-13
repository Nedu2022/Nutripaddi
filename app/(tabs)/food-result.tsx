import { StyleSheet, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import {
  Flame, Droplets, Wheat, ShieldCheck, Info, ChevronLeft, Plus, CheckCircle,
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MacroCard from "@/components/MacroCard";
import CustomButton from "@/components/CustomButton";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { NIGERIAN_FOODS } from "@/data/foods";
import { getLucideIcon } from "@/utils/icons";
import { useLanguage } from "@/hooks/useLanguage";

const DETECTED_FOOD = NIGERIAN_FOODS.find((f) => f.id === "8")!;

export default function FoodResultScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const FoodIcon = getLucideIcon(DETECTED_FOOD.iconName);

  return (
    <ScreenWrapper scroll contentStyle={{ paddingBottom: insets.bottom + 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={COLORS.text} size={28} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.mealResult}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Main Graphic */}
      <Animated.View entering={FadeInUp.duration(500)} style={styles.graphicCard}>
        <View style={styles.iconWrap}>
          <FoodIcon color={COLORS.primary} size={48} strokeWidth={1.5} />
        </View>
        <Text style={styles.foodName}>{DETECTED_FOOD.name}</Text>
        <Text style={styles.servingText}>{DETECTED_FOOD.servingSize}</Text>
        <View style={styles.confidenceBadge}>
          <CheckCircle color={COLORS.primary} size={14} />
          <Text style={styles.confidenceText}>98% {t.confidence}</Text>
        </View>
      </Animated.View>

      {/* Calorie Overview */}
      <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.calorieCard}>
        <Flame color={COLORS.secondary} size={24} />
        <View style={styles.calorieInfo}>
          <Text style={styles.calorieLabel}>{t.estimatedCalories}</Text>
          <Text style={styles.calorieValue}>{DETECTED_FOOD.calories} {t.kcal}</Text>
        </View>
      </Animated.View>

      {/* Origin / What it does */}
      <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <Info color={COLORS.primary} size={18} />
          <Text style={styles.sectionTitle}>About this meal</Text>
        </View>
        <Text style={styles.descriptionText}>{DETECTED_FOOD.description}</Text>
      </Animated.View>

      {/* Health Stuff */}
      <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <ShieldCheck color={COLORS.warning} size={18} />
          <Text style={styles.sectionTitle}>Health note</Text>
        </View>
        <Text style={styles.descriptionText}>{DETECTED_FOOD.healthNote}</Text>
      </Animated.View>

      {/* Macros */}
      <Animated.View entering={FadeInUp.delay(400).duration(500)}>
        <Text style={styles.subHeading}>{t.nutritionBreakdown}</Text>
        <View style={styles.macroGrid}>
          <MacroCard bgColor={COLORS.softOrange} color={COLORS.secondary} icon={<Flame color={COLORS.secondary} size={18} />} label="Carbs" unit="g" value={DETECTED_FOOD.carbs} />
          <MacroCard bgColor={COLORS.softGreen} color={COLORS.primary} icon={<Droplets color={COLORS.primary} size={18} />} label="Protein" unit="g" value={DETECTED_FOOD.protein} />
          <MacroCard bgColor={COLORS.softYellow} color={COLORS.warning} icon={<Wheat color={COLORS.warning} size={18} />} label="Fat" unit="g" value={DETECTED_FOOD.fat} />
        </View>
      </Animated.View>

      <View style={{ flex: 1, minHeight: 40 }} />

      {/* Actions */}
      <Animated.View entering={FadeInUp.delay(500).duration(500)}>
        <CustomButton icon={<Plus color={COLORS.white} size={18} />} onPress={() => router.back()} title={t.addToLog} />
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  graphicCard: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  foodName: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: FONTS.extraBold,
    textAlign: "center",
  },
  servingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginTop: 4,
    marginBottom: 12,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.softGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  confidenceText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  calorieCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.softOrange,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    gap: 16,
  },
  calorieInfo: {
    flex: 1,
  },
  calorieLabel: {
    color: COLORS.secondary,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  calorieValue: {
    color: COLORS.secondary,
    fontSize: 28,
    fontFamily: FONTS.extraBold,
  },
  infoSection: {
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  descriptionText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  subHeading: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 12,
    marginTop: 8,
  },
  macroGrid: {
    flexDirection: "row",
    gap: 10,
  },
});
