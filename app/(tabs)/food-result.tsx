import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Droplets,
  Flame,
  Info,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wheat,
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import MacroCard from "@/components/MacroCard";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import {
  getBalanceLabel,
  getFoodById,
  getGoalAwareAdvice,
  getLocalMealDescription,
  getLocalPortionLabel,
  getNutritionEstimate,
  getPortionOptionsForFood,
  getSimilarFoods,
  SAMPLE_RECOGNITION_RESULT,
} from "@/data/foodComposition";
import { DEFAULT_DETECTED_MEAL_SUMMARY } from "@/src/services/foodDetectionService";
import type { PortionSize } from "@/types";
import { getLucideIcon } from "@/utils/icons";
import { useLanguage } from "@/hooks/useLanguage";

export default function FoodResultScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [selectedFoodId, setSelectedFoodId] = useState(
    SAMPLE_RECOGNITION_RESULT.foodId
  );
  const [portion, setPortion] = useState<PortionSize>(
    SAMPLE_RECOGNITION_RESULT.portionSize
  );
  const [showCorrection, setShowCorrection] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedFood = getFoodById(selectedFoodId);
  const FoodIcon = getLucideIcon(selectedFood.iconName);
  const estimate = getNutritionEstimate(selectedFoodId, portion);
  const similarFoods = getSimilarFoods(SAMPLE_RECOGNITION_RESULT.similarFoodIds);
  const portionOptions = getPortionOptionsForFood(selectedFood);
  const localMealDescription = getLocalMealDescription(selectedFood, portion);
  const localPortionLabel = getLocalPortionLabel(selectedFood, portion);
  const isDefaultScanResult =
    selectedFoodId === SAMPLE_RECOGNITION_RESULT.foodId;
  const displayMealName = isDefaultScanResult
    ? DEFAULT_DETECTED_MEAL_SUMMARY.mealName
    : localMealDescription;
  const displayedEstimate =
    isDefaultScanResult && portion === "Medium"
      ? {
          ...estimate,
          calories: 680,
          carbs: 85,
          protein: 24,
          fat: 28,
          fibre: 6,
        }
      : estimate;
  const confidence =
    selectedFoodId === SAMPLE_RECOGNITION_RESULT.foodId
      ? SAMPLE_RECOGNITION_RESULT.confidence
      : 86;

  return (
    <ScreenWrapper scroll contentStyle={{ paddingBottom: insets.bottom + 20 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={COLORS.text} size={26} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.mealResult}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View entering={FadeInUp.duration(500)} style={styles.imageCard}>
        <View style={styles.imagePlaceholder}>
          <Camera color={COLORS.primary} size={28} />
          <Text style={styles.imageLabel}>Food image preview</Text>
        </View>
        <View style={styles.imageResultBadge}>
          <Sparkles color={COLORS.white} size={14} />
          <Text style={styles.imageResultText}>AI food check</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(500)} style={styles.detectedCard}>
        <View style={styles.detectedTop}>
          <View style={styles.foodIconWrap}>
            <FoodIcon color={COLORS.primary} size={34} strokeWidth={1.7} />
          </View>
          <View style={styles.detectedTextWrap}>
            <Text style={styles.detectedLabel}>We think this is</Text>
            <Text style={styles.foodName}>{displayMealName}</Text>
            <Text style={styles.amountText}>
              Pick the size that looks closest. This is only an estimate.
            </Text>
          </View>
        </View>

        <View style={styles.trustRow}>
          <View style={styles.trustPill}>
            <CheckCircle2 color={COLORS.success} size={14} />
            <Text style={styles.trustText}>{confidence}% confidence</Text>
          </View>
          <View style={styles.trustPill}>
            <ShieldCheck color={COLORS.primary} size={14} />
            <Text style={styles.trustText}>{getBalanceLabel(displayedEstimate)}</Text>
          </View>
        </View>

        <View style={styles.explanationCard}>
          <Info color={COLORS.primary} size={16} />
          <Text style={styles.explanationText}>
            {SAMPLE_RECOGNITION_RESULT.explanation}
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(140).duration(500)} style={styles.correctionCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>How much did you eat?</Text>
          <SlidersHorizontal color={COLORS.textMuted} size={18} />
        </View>
        <View style={styles.segmentRow}>
          {portionOptions.map((item) => (
            <Pressable
              key={item.value}
              onPress={() => setPortion(item.value)}
              style={[
                styles.segment,
                portion === item.value && styles.segmentActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  portion === item.value && styles.segmentTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={() => setShowCorrection((current) => !current)}
          style={styles.correctToggle}
        >
          <Search color={COLORS.primary} size={16} />
          <Text style={styles.correctToggleText}>Not correct? Change meal</Text>
          {showCorrection ? (
            <ChevronUp color={COLORS.primary} size={16} />
          ) : (
            <ChevronDown color={COLORS.primary} size={16} />
          )}
        </Pressable>

        {showCorrection && (
          <View style={styles.similarList}>
            {[selectedFood, ...similarFoods]
              .filter(
                (food, index, foods) =>
                  foods.findIndex((item) => item.id === food.id) === index
              )
              .map((food) => (
                <Pressable
                  key={food.id}
                  onPress={() => setSelectedFoodId(food.id)}
                  style={[
                    styles.foodChoice,
                    selectedFoodId === food.id && styles.foodChoiceActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.foodChoiceText,
                      selectedFoodId === food.id && styles.foodChoiceTextActive,
                    ]}
                  >
                    {food.name}
                  </Text>
                  {selectedFoodId === food.id && (
                    <CheckCircle2 color={COLORS.primary} size={16} />
                  )}
                </Pressable>
              ))}
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.calorieCard}>
        <View>
          <Text style={styles.calorieLabel}>
            Estimated energy for {localPortionLabel.toLowerCase()}
          </Text>
          <Text style={styles.calorieValue}>
            {displayedEstimate.calories} <Text style={styles.calorieUnit}>kcal</Text>
          </Text>
        </View>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>Local reference</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(260).duration(500)}>
        <Text style={styles.subHeading}>What is inside this meal</Text>
        <View style={styles.macroGrid}>
          <MacroCard
            bgColor={COLORS.softOrange}
            color={COLORS.freshOrange}
            icon={<Flame color={COLORS.freshOrange} size={18} />}
            label="Carbs"
            unit="g"
            value={displayedEstimate.carbs}
          />
          <MacroCard
            bgColor={COLORS.softGreen}
            color={COLORS.primary}
            icon={<Droplets color={COLORS.primary} size={18} />}
            label="Protein"
            unit="g"
            value={displayedEstimate.protein}
          />
          <MacroCard
            bgColor={COLORS.softYellow}
            color={COLORS.warning}
            icon={<Wheat color={COLORS.warning} size={18} />}
            label="Fat"
            unit="g"
            value={displayedEstimate.fat}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(320).duration(500)} style={styles.adviceCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.adviceTitleRow}>
            <Sparkles color={COLORS.primary} size={18} />
            <Text style={styles.cardTitle}>{t.aiNutritionistSays}</Text>
          </View>
        </View>
        <Text style={styles.adviceText}>
          {getGoalAwareAdvice(displayedEstimate, "Weight management")}
        </Text>
      </Animated.View>

      {isDefaultScanResult && (
        <View style={styles.detectedItemsCard}>
          <Text style={styles.detectedItemsTitle}>Detected food items</Text>
          <View style={styles.detectedItemsWrap}>
            {DEFAULT_DETECTED_MEAL_SUMMARY.detectedItems.map((item) => (
              <View key={item.id} style={styles.detectedItemChip}>
                <Text style={styles.detectedItemText}>{item.label}</Text>
                <Text style={styles.detectedItemConfidence}>
                  {item.confidence}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Pressable
        onPress={() => setShowBreakdown((current) => !current)}
        style={styles.breakdownButton}
      >
        <Text style={styles.breakdownButtonText}>
          {showBreakdown ? "Hide full food breakdown" : "View full food breakdown"}
        </Text>
        {showBreakdown ? (
          <ChevronUp color={COLORS.primary} size={18} />
        ) : (
          <ChevronDown color={COLORS.primary} size={18} />
        )}
      </Pressable>

      {showBreakdown && (
        <View style={styles.fullBreakdownCard}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Food energy</Text>
            <Text style={styles.breakdownValue}>{displayedEstimate.calories} kcal</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Carbs</Text>
            <Text style={styles.breakdownValue}>{displayedEstimate.carbs}g</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Protein</Text>
            <Text style={styles.breakdownValue}>{displayedEstimate.protein}g</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Fat</Text>
            <Text style={styles.breakdownValue}>{displayedEstimate.fat}g</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Fibre</Text>
            <Text style={styles.breakdownValue}>{displayedEstimate.fibre}g</Text>
          </View>
          <Text style={styles.sourceText}>
            Nutrition values are based on local African food composition references.
            Source: {displayedEstimate.source}.
          </Text>
        </View>
      )}

      <View style={styles.disclaimerCard}>
        <ShieldCheck color={COLORS.warning} size={18} />
        <Text style={styles.disclaimerText}>{t.estimateDisclaimer}</Text>
      </View>

      <View style={styles.actionStack}>
        <CustomButton
          disabled={saved}
          icon={<CheckCircle2 color={COLORS.white} size={18} />}
          onPress={() => setSaved(true)}
          title={saved ? "Saved to Meal History" : "Save to Meal History"}
        />
        <View style={styles.actionRow}>
          <CustomButton
            icon={<Search color={COLORS.text} size={17} />}
            onPress={() => setShowCorrection(true)}
          title="Change Meal"
            variant="outline"
            style={styles.halfButton}
          />
          <CustomButton
            icon={<RotateCcw color={COLORS.text} size={17} />}
            onPress={() => router.replace(ROUTES.scan)}
            title={t.scanAgain}
            variant="outline"
            style={styles.halfButton}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
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
  headerSpacer: {
    width: 44,
  },
  imageCard: {
    height: 190,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 14,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softGreen,
  },
  imageLabel: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginTop: 8,
  },
  imageResultBadge: {
    position: "absolute",
    right: 14,
    top: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  imageResultText: {
    color: COLORS.white,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  detectedCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  detectedTop: {
    flexDirection: "row",
    gap: 14,
  },
  foodIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  detectedTextWrap: {
    flex: 1,
  },
  detectedLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  foodName: {
    color: COLORS.text,
    fontSize: 23,
    fontFamily: FONTS.extraBold,
    lineHeight: 29,
  },
  amountText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginTop: 4,
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  trustPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.softGreen,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  trustText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  explanationCard: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: COLORS.softCream,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  explanationText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },
  correctionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  segmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    padding: 4,
    marginTop: 12,
    gap: 6,
  },
  segment: {
    width: "48.8%",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.bold,
    textAlign: "center",
  },
  segmentTextActive: {
    color: COLORS.white,
  },
  correctToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 4,
  },
  correctToggleText: {
    flex: 1,
    color: COLORS.primary,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  similarList: {
    gap: 8,
    marginTop: 12,
  },
  foodChoice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  foodChoiceActive: {
    backgroundColor: COLORS.softGreen,
    borderColor: COLORS.primary,
  },
  foodChoiceText: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  foodChoiceTextActive: {
    color: COLORS.primaryDark,
  },
  calorieCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.secondary,
    padding: 18,
    borderRadius: 18,
    marginBottom: 18,
    gap: 12,
  },
  calorieLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  calorieValue: {
    color: COLORS.white,
    fontSize: 32,
    fontFamily: FONTS.extraBold,
  },
  calorieUnit: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  sourceBadge: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  sourceBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  subHeading: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 12,
  },
  macroGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  adviceCard: {
    backgroundColor: COLORS.softGreen,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  adviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adviceText: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
    marginTop: 10,
  },
  detectedItemsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  detectedItemsTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 10,
  },
  detectedItemsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detectedItemChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.inputBg,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  detectedItemText: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  detectedItemConfidence: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.extraBold,
  },
  breakdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  breakdownButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  fullBreakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  breakdownLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  breakdownValue: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  sourceText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
    marginTop: 12,
  },
  disclaimerCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.softYellow,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  disclaimerText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },
  actionStack: {
    gap: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  halfButton: {
    flex: 1,
    width: undefined,
  },
});
