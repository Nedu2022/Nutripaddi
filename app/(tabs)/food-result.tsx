import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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
  Leaf,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Wheat,
} from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

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
import { getFreshnessForFood } from "@/src/services/freshnessScoreService";
import type { FreshnessTone } from "@/src/types/freshness";
import type { PortionSize } from "@/types";
import { getLucideIcon } from "@/utils/icons";
import { useLanguage } from "@/hooks/useLanguage";

const LOGO_MARK = require("@/assets/images/logo-mark.png");

const D = {
  bg:        "#F5F6FA",
  card:      "#FFFFFF",
  text:      "#0A0A0A",
  muted:     "#6B7280",
  light:     "#B0B8C4",
  divider:   "#F2F2F2",
  accent:    COLORS.primary,
  accentDim: COLORS.softGreen,
  orange:    "#FF6B35",
  orangeDim: "rgba(255,107,53,0.09)",
  amber:     "#F59E0B",
  amberDim:  "rgba(245,158,11,0.09)",
  indigo:    "#6366F1",
  indigoDim: "rgba(99,102,241,0.09)",
  dark:      "#0E0E12",
};

const SHADOW = {
  shadowColor:   "#000",
  shadowOpacity: 0.06,
  shadowRadius:  14,
  shadowOffset:  { width: 0, height: 3 },
  elevation:     2,
};

function getFreshnessColor(tone: FreshnessTone) {
  if (tone === "good")    return D.accent;
  if (tone === "caution") return D.amber;
  return "#EF4444";
}

export default function FoodResultScreen() {
  const { t } = useLanguage();
  const [selectedFoodId, setSelectedFoodId] = useState(SAMPLE_RECOGNITION_RESULT.foodId);
  const [portion, setPortion]               = useState<PortionSize>(SAMPLE_RECOGNITION_RESULT.portionSize);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showBreakdown, setShowBreakdown]   = useState(false);
  const [saved, setSaved]                   = useState(false);

  const selectedFood       = getFoodById(selectedFoodId);
  const FoodIcon           = getLucideIcon(selectedFood.iconName);
  const estimate           = getNutritionEstimate(selectedFoodId, portion);
  const similarFoods       = getSimilarFoods(SAMPLE_RECOGNITION_RESULT.similarFoodIds);
  const portionOptions     = getPortionOptionsForFood(selectedFood);
  const localMealDesc      = getLocalMealDescription(selectedFood, portion);
  const localPortionLabel  = getLocalPortionLabel(selectedFood, portion);
  const isDefault          = selectedFoodId === SAMPLE_RECOGNITION_RESULT.foodId;
  const displayMealName    = isDefault ? DEFAULT_DETECTED_MEAL_SUMMARY.mealName : localMealDesc;
  const displayedEstimate  = isDefault && portion === "Medium"
    ? { ...estimate, calories: 680, carbs: 85, protein: 24, fat: 28, fibre: 6 }
    : estimate;
  const confidence    = isDefault ? SAMPLE_RECOGNITION_RESULT.confidence : 86;
  const freshness     = isDefault
    ? DEFAULT_DETECTED_MEAL_SUMMARY.freshness
    : getFreshnessForFood(selectedFood, confidence);
  const freshnessColor = getFreshnessColor(freshness.tone);

  return (
    <ScreenWrapper scroll bg={D.bg}>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={D.text} size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.mealResult}</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* ── IMAGE PREVIEW ───────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.duration(360)} style={styles.imageCard}>
        <View style={styles.imagePlaceholder}>
          <Camera color={D.accent} size={28} />
          <Text style={styles.imageLabel}>Food image preview</Text>
        </View>
        <View style={styles.imageResultBadge}>
          <CheckCircle2 color="#FFFFFF" size={13} />
          <Text style={styles.imageResultText}>Food check</Text>
        </View>
      </Animated.View>

      {/* ── DETECTED CARD ───────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(60).duration(360)} style={styles.card}>
        <View style={styles.detectedTop}>
          <View style={styles.foodIconWrap}>
            <FoodIcon color={D.accent} size={32} strokeWidth={1.7} />
          </View>
          <View style={styles.detectedText}>
            <Text style={styles.detectedLabel}>We think this is</Text>
            <Text style={styles.foodName}>{displayMealName}</Text>
            <Text style={styles.amountNote}>
              Pick the size that looks closest. This is only an estimate.
            </Text>
          </View>
        </View>

        <View style={styles.trustRow}>
          <View style={[styles.trustPill, { backgroundColor: D.accentDim }]}>
            <CheckCircle2 color={D.accent} size={13} />
            <Text style={[styles.trustText, { color: D.accent }]}>{confidence}% confidence</Text>
          </View>
          <View style={[styles.trustPill, { backgroundColor: D.indigoDim }]}>
            <ShieldCheck color={D.indigo} size={13} />
            <Text style={[styles.trustText, { color: D.indigo }]}>{getBalanceLabel(displayedEstimate)}</Text>
          </View>
          <View style={[styles.trustPill, { backgroundColor: freshnessColor + "18" }]}>
            <Leaf color={freshnessColor} size={13} />
            <Text style={[styles.trustText, { color: freshnessColor }]}>{freshness.score}% fresh</Text>
          </View>
        </View>

        <View style={styles.explanationRow}>
          <Info color={D.indigo} size={15} />
          <Text style={styles.explanationText}>{SAMPLE_RECOGNITION_RESULT.explanation}</Text>
        </View>
      </Animated.View>

      {/* ── PORTION CARD ────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(110).duration(360)} style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>How much did you eat?</Text>
          <SlidersHorizontal color={D.muted} size={17} />
        </View>

        <View style={styles.segmentWrap}>
          {portionOptions.map((item) => (
            <Pressable
              key={item.value}
              onPress={() => setPortion(item.value)}
              style={[styles.segment, portion === item.value && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, portion === item.value && styles.segmentTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => setShowCorrection((v) => !v)}
          style={styles.correctToggle}
        >
          <Search color={D.accent} size={15} />
          <Text style={styles.correctToggleText}>Not correct? Change meal</Text>
          {showCorrection
            ? <ChevronUp color={D.accent} size={15} />
            : <ChevronDown color={D.accent} size={15} />}
        </Pressable>

        {showCorrection && (
          <View style={styles.similarList}>
            {[selectedFood, ...similarFoods]
              .filter((food, idx, arr) => arr.findIndex((f) => f.id === food.id) === idx)
              .map((food) => (
                <Pressable
                  key={food.id}
                  onPress={() => setSelectedFoodId(food.id)}
                  style={[styles.foodChoice, selectedFoodId === food.id && styles.foodChoiceActive]}
                >
                  <Text style={[styles.foodChoiceText, selectedFoodId === food.id && styles.foodChoiceTextActive]}>
                    {food.name}
                  </Text>
                  {selectedFoodId === food.id && <CheckCircle2 color={D.accent} size={15} />}
                </Pressable>
              ))}
          </View>
        )}
      </Animated.View>

      {/* ── CALORIE HERO ────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(160).duration(360)} style={styles.calorieHero}>
        <View>
          <Text style={styles.calorieLabel}>Estimated energy for {localPortionLabel.toLowerCase()}</Text>
          <Text style={styles.calorieValue}>
            {displayedEstimate.calories}{" "}
            <Text style={styles.calorieUnit}>kcal</Text>
          </Text>
        </View>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>Local ref</Text>
        </View>
      </Animated.View>

      {/* ── FRESHNESS CARD ──────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(190).duration(360)} style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.freshTitleRow}>
            <Leaf color={freshnessColor} size={17} />
            <Text style={styles.cardTitle}>Freshness score</Text>
          </View>
          <Text style={[styles.freshScore, { color: freshnessColor }]}>{freshness.score}/100</Text>
        </View>
        <View style={styles.freshTrack}>
          <View style={[styles.freshFill, { width: `${freshness.score}%`, backgroundColor: freshnessColor }]} />
        </View>
        <Text style={styles.freshCopy}>{freshness.label}. {freshness.summary}</Text>
        <Text style={styles.freshTip}>{freshness.storageTip}</Text>
      </Animated.View>

      {/* ── MACROS ──────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(220).duration(360)}>
        <Text style={styles.sectionTitle}>What is inside this meal</Text>
        <View style={styles.macroGrid}>
          <MacroCard
            bgColor={D.orangeDim}
            color={D.orange}
            icon={<Flame color={D.orange} size={18} />}
            label="Carbs"
            unit="g"
            value={displayedEstimate.carbs}
          />
          <MacroCard
            bgColor={D.accentDim}
            color={D.accent}
            icon={<Droplets color={D.accent} size={18} />}
            label="Protein"
            unit="g"
            value={displayedEstimate.protein}
          />
          <MacroCard
            bgColor={D.amberDim}
            color={D.amber}
            icon={<Wheat color={D.amber} size={18} />}
            label="Fat"
            unit="g"
            value={displayedEstimate.fat}
          />
        </View>
      </Animated.View>

      {/* ── NUTRIPADI ADVICE ─────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(250).duration(360)} style={styles.adviceCard}>
        <View style={styles.adviceHeader}>
          <View style={styles.adviceIcon}>
            <Image resizeMode="contain" source={LOGO_MARK} style={styles.adviceLogo} />
          </View>
          <Text style={styles.adviceTitle}>NutriPadi says</Text>
        </View>
        <Text style={styles.adviceText}>
          {getGoalAwareAdvice(displayedEstimate, "Weight management")}
        </Text>
      </Animated.View>

      {/* ── DETECTED ITEMS ──────────────────────────────────────────── */}
      {isDefault && (
        <Animated.View entering={FadeInUp.delay(275).duration(360)} style={styles.card}>
          <Text style={styles.cardTitle}>Detected food items</Text>
          <View style={styles.chipWrap}>
            {DEFAULT_DETECTED_MEAL_SUMMARY.detectedItems.map((item) => (
              <View key={item.id} style={styles.detectedChip}>
                <Text style={styles.detectedChipName}>{item.label}</Text>
                <Text style={styles.detectedChipPct}>{item.confidence}%</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* ── BREAKDOWN TOGGLE ────────────────────────────────────────── */}
      <Pressable
        onPress={() => setShowBreakdown((v) => !v)}
        style={styles.breakdownToggle}
      >
        <Text style={styles.breakdownToggleText}>
          {showBreakdown ? "Hide full food breakdown" : "View full food breakdown"}
        </Text>
        {showBreakdown
          ? <ChevronUp color={D.accent} size={17} />
          : <ChevronDown color={D.accent} size={17} />}
      </Pressable>

      {showBreakdown && (
        <View style={[styles.card, { marginBottom: 12 }]}>
          {[
            ["Food energy", `${displayedEstimate.calories} kcal`],
            ["Carbs",       `${displayedEstimate.carbs}g`],
            ["Protein",     `${displayedEstimate.protein}g`],
            ["Fat",         `${displayedEstimate.fat}g`],
            ["Fibre",       `${displayedEstimate.fibre}g`],
            ["Freshness",   `${freshness.score}/100`],
          ].map(([label, value], i, arr) => (
            <View key={label} style={[styles.breakdownRow, i < arr.length - 1 && styles.breakdownRowBorder]}>
              <Text style={styles.breakdownLabel}>{label}</Text>
              <Text style={styles.breakdownValue}>{value}</Text>
            </View>
          ))}
          <Text style={styles.sourceNote}>
            Nutrition values are estimates based on local African food composition references.
            Source: {displayedEstimate.source}. {freshness.disclaimer}
          </Text>
        </View>
      )}

      {/* ── DISCLAIMER ──────────────────────────────────────────────── */}
      <View style={styles.disclaimerCard}>
        <ShieldCheck color={D.amber} size={17} />
        <Text style={styles.disclaimerText}>{t.estimateDisclaimer}</Text>
      </View>

      {/* ── ACTIONS ─────────────────────────────────────────────────── */}
      <View style={styles.actionStack}>
        <CustomButton
          disabled={saved}
          icon={<CheckCircle2 color="#FFFFFF" size={18} />}
          onPress={() => setSaved(true)}
          title={saved ? "Saved to Meal History" : "Save to Meal History"}
        />
        <View style={styles.actionRow}>
          <CustomButton
            icon={<Search color={D.text} size={17} />}
            onPress={() => setShowCorrection(true)}
            title="Change Meal"
            variant="outline"
            style={styles.halfBtn}
          />
          <CustomButton
            icon={<RotateCcw color={D.text} size={17} />}
            onPress={() => router.replace(ROUTES.scan)}
            title={t.scanAgain}
            variant="outline"
            style={styles.halfBtn}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginBottom:   18,
  },
  backBtn: {
    width:           42,
    height:          42,
    borderRadius:    14,
    backgroundColor: D.card,
    alignItems:      "center",
    justifyContent:  "center",
    ...SHADOW,
  },
  headerTitle: {
    color:      D.text,
    fontSize:   18,
    fontFamily: FONTS.bold,
  },
  headerSpacer: { width: 42 },

  // Image
  imageCard: {
    height:        190,
    borderRadius:  22,
    overflow:      "hidden",
    marginBottom:  14,
    ...SHADOW,
  },
  imagePlaceholder: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "center",
    backgroundColor: D.accentDim,
  },
  imageLabel: {
    color:      D.accent,
    fontSize:   14,
    fontFamily: FONTS.bold,
    marginTop:  8,
  },
  imageResultBadge: {
    position:          "absolute",
    right:             14,
    top:               14,
    flexDirection:     "row",
    alignItems:        "center",
    gap:               6,
    backgroundColor:   D.accent,
    borderRadius:      999,
    paddingHorizontal: 11,
    paddingVertical:   7,
  },
  imageResultText: {
    color:      "#FFFFFF",
    fontSize:   11,
    fontFamily: FONTS.bold,
  },

  // Generic shadow card
  card: {
    backgroundColor: D.card,
    borderRadius:    22,
    padding:         18,
    marginBottom:    14,
    ...SHADOW,
  },

  // Detected card
  detectedTop: {
    flexDirection: "row",
    gap:           14,
  },
  foodIconWrap: {
    width:           68,
    height:          68,
    borderRadius:    20,
    backgroundColor: D.accentDim,
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
  },
  detectedText: { flex: 1 },
  detectedLabel: {
    color:      D.muted,
    fontSize:   11,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  foodName: {
    color:      D.text,
    fontSize:   22,
    fontFamily: FONTS.extraBold,
    lineHeight: 28,
  },
  amountNote: {
    color:      D.muted,
    fontSize:   12,
    fontFamily: FONTS.medium,
    marginTop:  5,
    lineHeight: 17,
  },
  trustRow: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           7,
    marginTop:     14,
  },
  trustPill: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               5,
    borderRadius:      999,
    paddingHorizontal: 10,
    paddingVertical:   6,
  },
  trustText: {
    fontSize:   12,
    fontFamily: FONTS.bold,
  },
  explanationRow: {
    flexDirection:   "row",
    gap:             9,
    backgroundColor: D.indigoDim,
    borderRadius:    14,
    padding:         12,
    marginTop:       14,
  },
  explanationText: {
    flex:       1,
    color:      D.muted,
    fontSize:   12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },

  // Portion card
  cardHeaderRow: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginBottom:   12,
  },
  cardTitle: {
    color:      D.text,
    fontSize:   15,
    fontFamily: FONTS.bold,
  },
  segmentWrap: {
    flexDirection:   "row",
    flexWrap:        "wrap",
    backgroundColor: "#F0F0F0",
    borderRadius:    14,
    padding:         4,
    gap:             5,
  },
  segment: {
    width:           "48.5%",
    minHeight:       44,
    alignItems:      "center",
    justifyContent:  "center",
    borderRadius:    11,
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: D.accent,
    shadowColor:     D.accent,
    shadowOpacity:   0.3,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       4,
  },
  segmentText: {
    color:      D.muted,
    fontSize:   12,
    fontFamily: FONTS.bold,
    textAlign:  "center",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  correctToggle: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           8,
    marginTop:     14,
    paddingVertical: 2,
  },
  correctToggleText: {
    flex:       1,
    color:      D.accent,
    fontSize:   13,
    fontFamily: FONTS.bold,
  },
  similarList: {
    gap:       7,
    marginTop: 12,
  },
  foodChoice: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    borderRadius:      12,
    backgroundColor:   "#F5F5F5",
    paddingHorizontal: 14,
    paddingVertical:   13,
  },
  foodChoiceActive: {
    backgroundColor: D.accentDim,
  },
  foodChoiceText: {
    color:      D.text,
    fontSize:   13,
    fontFamily: FONTS.semiBold,
  },
  foodChoiceTextActive: {
    color: D.accent,
  },

  // Calorie hero
  calorieHero: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    backgroundColor:   D.dark,
    borderRadius:      22,
    padding:           20,
    marginBottom:      14,
    shadowColor:       D.dark,
    shadowOpacity:     0.25,
    shadowRadius:      18,
    shadowOffset:      { width: 0, height: 6 },
    elevation:         8,
  },
  calorieLabel: {
    color:      "rgba(255,255,255,0.45)",
    fontSize:   12,
    fontFamily: FONTS.medium,
    marginBottom: 6,
  },
  calorieValue: {
    color:      "#FFFFFF",
    fontSize:   34,
    fontFamily: FONTS.extraBold,
    letterSpacing: 0,
  },
  calorieUnit: {
    color:      "rgba(255,255,255,0.5)",
    fontSize:   16,
    fontFamily: FONTS.medium,
  },
  sourceBadge: {
    backgroundColor:   "rgba(255,255,255,0.10)",
    borderRadius:      999,
    paddingHorizontal: 12,
    paddingVertical:   7,
  },
  sourceBadgeText: {
    color:      "rgba(255,255,255,0.7)",
    fontSize:   11,
    fontFamily: FONTS.bold,
  },

  // Freshness card
  freshTitleRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           8,
  },
  freshScore: {
    fontSize:   14,
    fontFamily: FONTS.extraBold,
  },
  freshTrack: {
    height:          8,
    backgroundColor: "#EEEEEE",
    borderRadius:    999,
    overflow:        "hidden",
    marginTop:       14,
  },
  freshFill: {
    height:       "100%",
    borderRadius: 999,
  },
  freshCopy: {
    color:      D.text,
    fontSize:   13,
    fontFamily: FONTS.medium,
    lineHeight: 20,
    marginTop:  12,
  },
  freshTip: {
    color:      D.muted,
    fontSize:   12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
    marginTop:  5,
  },

  // Macros
  sectionTitle: {
    color:        D.text,
    fontSize:     17,
    fontFamily:   FONTS.extraBold,
    marginBottom: 12,
  },
  macroGrid: {
    flexDirection: "row",
    gap:           10,
    marginBottom:  14,
  },

  // Advice card
  adviceCard: {
    backgroundColor: D.accentDim,
    borderRadius:    22,
    padding:         18,
    marginBottom:    14,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           10,
    marginBottom:  10,
  },
  adviceIcon: {
    width:           36,
    height:          36,
    borderRadius:    11,
    backgroundColor: D.card,
    alignItems:      "center",
    justifyContent:  "center",
    shadowColor:     "#000",
    shadowOpacity:   0.06,
    shadowRadius:    6,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       2,
  },
  adviceLogo: {
    width: 26,
    height: 26,
  },
  adviceTitle: {
    color:         D.accent,
    fontSize:      11,
    fontFamily:    FONTS.extraBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  adviceText: {
    color:      D.muted,
    fontSize:   13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },

  // Detected chips
  chipWrap: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           8,
    marginTop:     12,
  },
  detectedChip: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               7,
    backgroundColor:   "#F0F0F0",
    borderRadius:      999,
    paddingHorizontal: 12,
    paddingVertical:   8,
  },
  detectedChipName: {
    color:      D.text,
    fontSize:   12,
    fontFamily: FONTS.bold,
  },
  detectedChipPct: {
    color:      D.accent,
    fontSize:   12,
    fontFamily: FONTS.extraBold,
  },

  // Breakdown
  breakdownToggle: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    backgroundColor:   D.card,
    borderRadius:      16,
    paddingHorizontal: 18,
    paddingVertical:   14,
    marginBottom:      12,
    ...SHADOW,
  },
  breakdownToggleText: {
    color:      D.accent,
    fontSize:   14,
    fontFamily: FONTS.bold,
  },
  breakdownRow: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  breakdownRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: D.divider,
  },
  breakdownLabel: {
    color:      D.muted,
    fontSize:   13,
    fontFamily: FONTS.medium,
  },
  breakdownValue: {
    color:      D.text,
    fontSize:   13,
    fontFamily: FONTS.bold,
  },
  sourceNote: {
    color:      D.muted,
    fontSize:   11,
    fontFamily: FONTS.medium,
    lineHeight: 17,
    marginTop:  12,
  },

  // Disclaimer
  disclaimerCard: {
    flexDirection:   "row",
    gap:             10,
    backgroundColor: D.amberDim,
    borderRadius:    16,
    padding:         14,
    marginBottom:    18,
  },
  disclaimerText: {
    flex:       1,
    color:      D.text,
    fontSize:   12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },

  // Actions
  actionStack: { gap: 10 },
  actionRow: {
    flexDirection: "row",
    gap:           10,
  },
  halfBtn: {
    flex:  1,
    width: undefined,
  },
});
