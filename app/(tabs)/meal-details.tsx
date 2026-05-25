import { StyleSheet, Text, View } from "react-native";
import {
  Flame,
  Droplets,
  Wheat,
  Clock,
  Heart,
  Leaf,
  Pencil,
  ShieldCheck,
  Trash2,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import AppHeader from "@/components/AppHeader";
import CustomButton from "@/components/CustomButton";
import MacroCard from "@/components/MacroCard";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { DUMMY_MEALS } from "@/data/meals";
import { AFRICAN_FOODS } from "@/data/foods";
import {
  getLocalMealDescription,
  getNutritionEstimate,
} from "@/data/foodComposition";
import { getLucideIcon } from "@/utils/icons";

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
  dark:      "#0E0E12",
};

const SHADOW = {
  shadowColor:   "#000",
  shadowOpacity: 0.06,
  shadowRadius:  14,
  shadowOffset:  { width: 0, height: 3 },
  elevation:     2,
};

const MEAL     = DUMMY_MEALS[0];
const FOOD     = AFRICAN_FOODS.find((f) => f.id === MEAL.foodId);
const ESTIMATE = getNutritionEstimate(MEAL.foodId, MEAL.portionSize ?? "Medium");
const LOCAL_MEAL = FOOD
  ? getLocalMealDescription(FOOD, MEAL.portionSize ?? "Medium")
  : MEAL.foodName;

export default function MealDetailsScreen() {
  const Icon           = getLucideIcon(MEAL.iconName);
  const freshnessColor = (MEAL.freshnessScore ?? 0) >= 72 ? D.accent : D.amber;

  return (
    <ScreenWrapper scroll bg={D.bg}>
      <AppHeader showBack title="Meal Details" />

      {/* ── MEAL HEADER ───────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(320)} style={styles.headerCard}>
        <View style={styles.iconWrap}>
          <Icon color={D.orange} size={32} strokeWidth={1.7} />
        </View>
        <Text style={styles.mealName}>{LOCAL_MEAL}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.metaBadge, { backgroundColor: D.accentDim }]}>
            <Text style={[styles.metaText, { color: D.accent }]}>{MEAL.mealType}</Text>
          </View>
          <View style={[styles.metaBadge, { backgroundColor: "#F0F0F0" }]}>
            <Clock color={D.muted} size={13} />
            <Text style={[styles.metaText, { color: D.muted }]}>{MEAL.timeLogged}</Text>
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
            {MEAL.calories}{" "}
            <Text style={styles.calorieUnit}>kcal</Text>
          </Text>
        </View>
      </Animated.View>

      {/* ── FRESHNESS ─────────────────────────────────────────────── */}
      {typeof MEAL.freshnessScore === "number" && (
        <Animated.View
          entering={FadeInDown.delay(100).duration(320)}
          style={[styles.infoRow, { backgroundColor: freshnessColor + "15" }]}
        >
          <View style={[styles.infoIconCircle, { backgroundColor: freshnessColor + "22" }]}>
            <Leaf color={freshnessColor} size={17} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: freshnessColor }]}>
              Freshness score — {MEAL.freshnessScore}/100
            </Text>
            <Text style={styles.infoText}>
              {MEAL.freshnessLabel ?? "Freshness estimate"}. Check smell and storage time before eating.
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
            value={MEAL.carbs}
          />
          <MacroCard
            bgColor={D.accentDim}
            color={D.accent}
            icon={<Droplets color={D.accent} size={20} />}
            label="Protein"
            unit="g"
            value={MEAL.protein}
          />
          <MacroCard
            bgColor={D.amberDim}
            color={D.amber}
            icon={<Wheat color={D.amber} size={20} />}
            label="Fat"
            unit="g"
            value={MEAL.fat}
          />
        </View>
      </Animated.View>

      {/* ── FOOD INFO ─────────────────────────────────────────────── */}
      {FOOD && (
        <Animated.View entering={FadeInDown.delay(160).duration(320)}>
          <Text style={styles.sectionLabel}>About this food</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>{FOOD.description}</Text>
          </View>

          <Text style={styles.sectionLabel}>Ingredients</Text>
          <View style={styles.chipWrap}>
            {FOOD.ingredients.map((ing) => (
              <View key={ing} style={styles.chip}>
                <Text style={styles.chipText}>{ing}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.infoRow, { backgroundColor: D.accentDim }]}>
            <View style={[styles.infoIconCircle, { backgroundColor: D.card }]}>
              <Heart color={D.accent} size={17} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: D.accent }]}>Health note</Text>
              <Text style={styles.infoText}>{FOOD.healthNote}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { backgroundColor: D.amberDim }]}>
            <View style={[styles.infoIconCircle, { backgroundColor: "rgba(255,255,255,0.6)" }]}>
              <ShieldCheck color={D.amber} size={17} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sourceText}>
                Nutrition values are estimates based on local African food composition references.
                Source: {ESTIMATE.source}.
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── ACTIONS ───────────────────────────────────────────────── */}
      <View style={styles.actionRow}>
        <CustomButton
          icon={<Pencil color={D.text} size={17} />}
          onPress={() => undefined}
          title="Edit Meal"
          variant="outline"
          style={styles.halfBtn}
        />
        <CustomButton
          icon={<Trash2 color="#FFFFFF" size={17} />}
          onPress={() => undefined}
          title="Delete"
          variant="danger"
          style={styles.halfBtn}
        />
      </View>

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

  sourceText: {
    color:      D.muted,
    fontSize:   12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },

  // Actions
  actionRow: {
    flexDirection: "row",
    gap:           10,
    marginTop:     4,
  },
  halfBtn: {
    flex:  1,
    width: undefined,
  },
});
