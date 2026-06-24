import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  Flame,
  Droplets,
  Wheat,
  Clock,
  Leaf,
  ShieldCheck,
} from "lucide-react-native";

const LOGO_MARK = require("@/assets/images/logo-mark.png");
import Animated, { FadeInDown } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import AppHeader from "@/components/AppHeader";
import MacroCard from "@/components/MacroCard";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import {
  getMealById,
  getSavedMeals,
  type SavedMeal,
} from "@/src/services/mealHistoryService";
import { getLucideIcon } from "@/utils/icons";

const D = {
  bg:         "#F8FAFC",
  card:       "#FFFFFF",
  text:       "#0F172A",
  muted:      "#64748B",
  light:      "#94A3B8",
  divider:    "#E2E8F0",
  // Green — protein / health
  accent:     "#16A34A",
  accentDim:  "#F0FDF4",
  // Orange — carbs / energy
  orange:     "#F97316",
  orangeDim:  "rgba(249,115,22,0.09)",
  // Purple — fat / balance
  purple:     "#8B5CF6",
  purpleDim:  "rgba(139,92,246,0.09)",
  // Dark calorie hero card
  dark:       "#1A1A1A",
};

const SHADOW = {
  shadowColor:   "#000",
  shadowOpacity: 0.06,
  shadowRadius:  14,
  shadowOffset:  { width: 0, height: 3 },
  elevation:     2,
};

export default function MealDetailsScreen() {
  const params = useLocalSearchParams();
  const mealId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [meal, setMeal] = useState<SavedMeal | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadMeal = async () => {
      try {
        const selected = mealId
          ? await getMealById(mealId)
          : (await getSavedMeals({ limit: 1 }))[0] ?? null;

        if (!mounted) return;
        setMeal(selected);
        setLoadError(selected ? "" : "Meal not found.");
      } catch (error) {
        if (!mounted) return;
        setLoadError(error instanceof Error ? error.message : "Could not load meal.");
      }
    };

    void loadMeal();

    return () => {
      mounted = false;
    };
  }, [mealId]);

  if (!meal) {
    return (
      <ScreenWrapper scroll bg={D.bg}>
        <AppHeader showBack title="Meal Details" />
        {loadError ? (
          <View style={styles.card}>
            <Text style={styles.infoText}>{loadError}</Text>
          </View>
        ) : null}
      </ScreenWrapper>
    );
  }

  const Icon           = getLucideIcon(meal.iconName);
  const freshnessColor = (meal.freshnessScore ?? 0) >= 72 ? D.accent : D.orange;

  return (
    <ScreenWrapper scroll bg={D.bg}>
      <AppHeader showBack title="Meal Details" />

      {/* ── MEAL HEADER ───────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(320)} style={styles.headerCard}>
        {meal.imageUri ? (
          <Image
            contentFit="cover"
            source={{ uri: meal.imageUri }}
            style={styles.mealImage}
          />
        ) : (
          <View style={styles.iconWrap}>
            <Icon color={D.orange} size={32} strokeWidth={1.7} />
          </View>
        )}
        <Text style={styles.mealName}>{meal.foodName}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.metaBadge, { backgroundColor: D.accentDim }]}>
            <Text style={[styles.metaText, { color: D.accent }]}>{meal.mealType}</Text>
          </View>
          <View style={[styles.metaBadge, { backgroundColor: "#F0F0F0" }]}>
            <Clock color={D.muted} size={13} />
            <Text style={[styles.metaText, { color: D.muted }]}>{meal.timeLogged}</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── CALORIE HERO ──────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(50).duration(320)} style={styles.calorieHero}>
        <View style={styles.calorieIconCircle}>
          <Flame color="#FFFFFF" size={20} />
        </View>
        <View>
          <Text style={styles.calorieLabel}>Total calories</Text>
          <Text style={styles.calorieValue}>
            {meal.calories}{" "}
            <Text style={styles.calorieUnit}>kcal</Text>
          </Text>
        </View>
      </Animated.View>

      {/* ── FRESHNESS ─────────────────────────────────────────────── */}
      {typeof meal.freshnessScore === "number" && (
        <Animated.View
          entering={FadeInDown.delay(100).duration(320)}
          style={[styles.infoRow, { backgroundColor: freshnessColor + "15" }]}
        >
          <View style={[styles.infoIconCircle, { backgroundColor: freshnessColor + "22" }]}>
            <Leaf color={freshnessColor} size={17} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: freshnessColor }]}>
              Freshness score - {meal.freshnessScore}/100
            </Text>
            <Text style={styles.infoText}>
              {meal.freshnessLabel ?? "Freshness estimate"}. Check smell and storage time before eating.
            </Text>
          </View>
        </Animated.View>
      )}

      {/* ── MACROS ────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(130).duration(320)}>
        <Text style={styles.sectionLabel}>Macro breakdown</Text>
        <View style={styles.macroGrid}>
          <MacroCard
            bgColor={D.orangeDim}
            color={D.orange}
            icon={<Flame color={D.orange} size={20} />}
            label="Carbs"
            unit="g"
            value={meal.carbs}
          />
          <MacroCard
            bgColor={D.accentDim}
            color={D.accent}
            icon={<Droplets color={D.accent} size={20} />}
            label="Protein"
            unit="g"
            value={meal.protein}
          />
          <MacroCard
            bgColor={D.purpleDim}
            color={D.purple}
            icon={<Wheat color={D.purple} size={20} />}
            label="Fat"
            unit="g"
            value={meal.fat}
          />
        </View>
      </Animated.View>

      {(meal.aiObservation || meal.source) && (
        <Animated.View entering={FadeInDown.delay(160).duration(320)}>
          {meal.aiObservation && (
            <View style={[styles.infoRow, { backgroundColor: D.accentDim }]}>
              <View style={[styles.infoIconCircle, { backgroundColor: D.card }]}>
                <Image resizeMode="contain" source={LOGO_MARK} style={styles.noteLogo} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: D.accent }]}>Your NutriPadi coach</Text>
                <Text style={styles.infoText}>{meal.aiObservation}</Text>
              </View>
            </View>
          )}

          {meal.source && (
            <View style={[styles.infoRow, { backgroundColor: D.purpleDim }]}>
              <View style={[styles.infoIconCircle, { backgroundColor: "rgba(255,255,255,0.6)" }]}>
                <ShieldCheck color={D.purple} size={17} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sourceText}>{meal.source}</Text>
              </View>
            </View>
          )}
        </Animated.View>
      )}

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Header card
  headerCard: {
    backgroundColor: D.card,
    borderRadius:    26,
    padding:         24,
    alignItems:      "center",
    marginBottom:    14,
    ...SHADOW,
  },
  mealImage: {
    width:           "100%",
    height:          180,
    borderRadius:    18,
    marginBottom:    16,
  },
  iconWrap: {
    width:           72,
    height:          72,
    borderRadius:    22,
    backgroundColor: D.orangeDim,
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    14,
  },
  mealName: {
    color:      D.text,
    fontSize:   24,
    fontFamily: FONTS.extraBold,
    textAlign:  "center",
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: "row",
    gap:           8,
    marginTop:     12,
  },
  metaBadge: {
    flexDirection:     "row",
    alignItems:        "center",
    borderRadius:      999,
    paddingHorizontal: 14,
    paddingVertical:   7,
    gap:               6,
  },
  metaText: {
    fontSize:   13,
    fontFamily: FONTS.semiBold,
  },

  // Calorie hero
  calorieHero: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             16,
    backgroundColor: D.dark,
    borderRadius:    22,
    padding:         20,
    marginBottom:    14,
    shadowColor:     D.dark,
    shadowOpacity:   0.22,
    shadowRadius:    16,
    shadowOffset:    { width: 0, height: 6 },
    elevation:       7,
  },
  calorieIconCircle: {
    width:           52,
    height:          52,
    borderRadius:    17,
    backgroundColor: D.orange,
    alignItems:      "center",
    justifyContent:  "center",
    shadowColor:     D.orange,
    shadowOpacity:   0.35,
    shadowRadius:    10,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       4,
  },
  calorieLabel: {
    color:      "rgba(255,255,255,0.45)",
    fontSize:   12,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  calorieValue: {
    color:      "#FFFFFF",
    fontSize:   34,
    fontFamily: FONTS.extraBold,
    letterSpacing: 0,
  },
  calorieUnit: {
    color:      "rgba(255,255,255,0.5)",
    fontSize:   17,
    fontFamily: FONTS.medium,
  },

  // Info rows (freshness, health, source)
  infoRow: {
    flexDirection: "row",
    alignItems:    "flex-start",
    gap:           12,
    borderRadius:  18,
    padding:       16,
    marginBottom:  14,
  },
  infoIconCircle: {
    width:          38,
    height:         38,
    borderRadius:   12,
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
    ...SHADOW,
  },
  infoTitle: {
    fontSize:   14,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  infoText: {
    color:      D.muted,
    fontSize:   13,
    fontFamily: FONTS.medium,
    lineHeight: 20,
  },

  // Section label
  sectionLabel: {
    color:        D.text,
    fontSize:     17,
    fontFamily:   FONTS.extraBold,
    marginBottom: 12,
    marginTop:    4,
  },

  // Macros
  macroGrid: {
    flexDirection: "row",
    gap:           10,
    marginBottom:  22,
  },

  // Card
  card: {
    backgroundColor: D.card,
    borderRadius:    18,
    padding:         16,
    marginBottom:    16,
    ...SHADOW,
  },
  aboutText: {
    color:      D.muted,
    fontSize:   14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },

  // Ingredient chips
  chipWrap: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           8,
    marginBottom:  16,
  },
  chip: {
    backgroundColor:   D.accentDim,
    borderRadius:      999,
    paddingHorizontal: 14,
    paddingVertical:   8,
  },
  chipText: {
    color:      D.accent,
    fontSize:   13,
    fontFamily: FONTS.semiBold,
  },

  noteLogo: {
    width:  22,
    height: 22,
  },
  sourceText: {
    color:      D.muted,
    fontSize:   12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },

});
