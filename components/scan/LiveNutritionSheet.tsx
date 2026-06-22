import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  CheckCircle2,
  ChevronUp,
  Leaf,
  MapPin,
  Pencil,
  RotateCcw,
  Save,
  ScanLine,
  X,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import type { DetectedMealSummary, FoodCorrectionOption, ScanState } from "@/src/types/detection";
import type { FreshnessTone } from "@/src/types/freshness";
const LOGO_MARK = require("@/assets/images/logo-mark.png");
const G = {
  bg: "rgba(255, 255, 255, 0.72)",
  border: "rgba(255, 255, 255, 0.72)",
  handle: "rgba(17, 24, 39, 0.20)",
  cardBg: "rgba(255, 255, 255, 0.52)",
  cardBorder: "rgba(255, 255, 255, 0.62)",
  divider: "rgba(17, 24, 39, 0.08)",
  text: "#111827",
  textMuted: "rgba(17, 24, 39, 0.66)",
  textLight: "rgba(17, 24, 39, 0.42)",
  accent: COLORS.primary,
  accentDark: COLORS.primaryDark,
  accentBg: "rgba(0, 128, 0, 0.08)",
  accentBorder: "rgba(0, 128, 0, 0.14)",
  warnBg: "rgba(255, 175, 0, 0.12)",
  warnText: "#B66A00",
  warnBorder: "rgba(255, 175, 0, 0.20)",
  pillBg: "rgba(255, 255, 255, 0.56)",
  chipBg: "rgba(255, 255, 255, 0.50)",
  actionBorder: "rgba(17, 24, 39, 0.10)",
};
export type SheetSnap = "hidden" | "collapsed" | "half" | "full";
type Props = {
  summary: DetectedMealSummary | null;
  scanState: ScanState;
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
  onFoodCorrection: (option: FoodCorrectionOption) => void;
  onSave: () => void;
  onClear: () => void;
  isSaving?: boolean;
  saveError?: string;
  savedMealTime?: string;
};
const LOW_ITEM_CONFIDENCE = 60;
function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}
function getFreshnessColor(tone: FreshnessTone) {
  if (tone === "good") return G.accent;
  if (tone === "caution") return "#FFBB33";
  return "#FF5555";
}
function getFoodOriginCopy(summary: DetectedMealSummary) {
  const swallow = summary.detectedItems.find((item) => item.type === "swallow");
  const soup = summary.detectedItems.find((item) => item.type === "soup");
  const protein = summary.detectedItems.find((item) => item.type === "protein");
  const rice = summary.detectedItems.find((item) => item.type === "rice");
  const beans = summary.detectedItems.find((item) => item.type === "beans");
  const yam = summary.detectedItems.find((item) => item.type === "yam");
  const potato = summary.detectedItems.find((item) => item.type === "potato");
  const plantain = summary.detectedItems.find((item) => item.type === "plantain");
  const cassava = summary.detectedItems.find((item) => item.type === "cassava");
  const maize = summary.detectedItems.find((item) => item.type === "maize");
  const grain = summary.detectedItems.find((item) => item.type === "grain");
  const bread = summary.detectedItems.find((item) => item.type === "bread");
  const pasta = summary.detectedItems.find((item) => item.type === "pasta");
  const vegetable = summary.detectedItems.find((item) => item.type === "vegetable");
  const fruit = summary.detectedItems.find((item) => item.type === "fruit");
  const dairy = summary.detectedItems.find((item) => item.type === "dairy");
  const snack = summary.detectedItems.find((item) => item.type === "snack");
  const drink = summary.detectedItems.find((item) => item.type === "drink");
  if (swallow && soup) {
    return {
      title: "Swallow and soup meal",
      description: `${swallow.label} is a starchy swallow served with ${soup.label}${
        protein ? ` and ${protein.label}` : ""
      }. The estimate is based on the foods visible in this scan.`,
      pattern: `Swallow + soup${protein ? " + protein" : ""}`,
    };
  }
  if (rice) {
    return {
      title: "Rice-based meal",
      description: `${rice.label} is recognised as the main staple${
        protein ? ` with ${protein.label} as protein` : ""
      }. NutriPadi maps it as a familiar cooked rice plate.`,
      pattern: `Rice${protein ? " + protein" : ""}`,
    };
  }
  if (beans) {
    return {
      title: "Legume-based meal",
      description: `${beans.label} is recognised as the base of the meal. It contributes plant protein, fibre, and slow-release carbohydrates.`,
      pattern: `Beans${protein ? " + protein" : ""}`,
    };
  }
  if (yam || potato || plantain) {
    const staple = yam ?? potato ?? plantain;
    return {
      title: "Starchy staple meal",
      description: `${staple?.label} is recognised as the main staple in this plate. The estimate is based on the visible food group and serving context.`,
      pattern: staple?.label ?? "Staple food",
    };
  }
  if (cassava || maize || grain || bread || pasta) {
    const staple = cassava ?? maize ?? grain ?? bread ?? pasta;
    return {
      title: "Staple-based meal",
      description: `${staple?.label} is recognised as the main base of the meal. NutriPadi uses the visible staple and other foods on the plate to estimate nutrition.`,
      pattern: `${staple?.label ?? "Staple"}${protein ? " + protein" : ""}`,
    };
  }
  if (vegetable || fruit || dairy || snack || drink) {
    const item = vegetable ?? fruit ?? dairy ?? snack ?? drink;
    return {
      title: "Light meal or side",
      description: `${item?.label} is recognised as the main visible item. The estimate is based on the food type and portion shown.`,
      pattern: item?.label ?? "Light food",
    };
  }
  return {
    title: "Mixed meal",
    description:
      "NutriPadi matched the visible foods against meal patterns and food groups before estimating nutrition.",
    pattern: "Mixed plate",
  };
}
export default function LiveNutritionSheet({
  summary,
  scanState,
  snap,
  onSnapChange,
  onFoodCorrection,
  onSave,
  onClear,
  isSaving = false,
  saveError,
  savedMealTime,
}: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [correcting, setCorrecting] = useState(false);
  const FULL_Y      = insets.top + 54;
  const HALF_Y      = height * 0.44;
  const COLLAPSED_Y = height - 152;
  const HIDDEN_Y    = height + 24;
  const snapToY: Record<SheetSnap, number> = {
    full:      FULL_Y,
    half:      HALF_Y,
    collapsed: COLLAPSED_Y,
    hidden:    HIDDEN_Y,
  };
  const translateY = useSharedValue(HIDDEN_Y);
  const startY = useRef(HIDDEN_Y);

  useEffect(() => {
    translateY.value = withTiming(snapToY[snap], { duration: 420 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap, FULL_Y, HALF_Y, COLLAPSED_Y, HIDDEN_Y]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 3,
        onPanResponderGrant: () => {
          startY.current = translateY.value;
        },
        onPanResponderMove: (_, g) => {
          translateY.value = clamp(startY.current + g.dy, FULL_Y, HIDDEN_Y);
        },
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dy) < 6) {
            onSnapChange(snap === "full" ? "half" : "full");
            return;
          }
          const current = clamp(startY.current + g.dy, FULL_Y, HIDDEN_Y);
          const points: [number, SheetSnap][] = [
            [FULL_Y, "full"],
            [HALF_Y, "half"],
            [COLLAPSED_Y, "collapsed"],
          ];
          const [, best] = points.reduce(
            ([bestDist, bestSnap], [y, name]) => {
              const d = Math.abs(y - current);
              return d < bestDist ? [d, name] : [bestDist, bestSnap];
            },
            [Infinity, "half" as SheetSnap]
          );
          onSnapChange(best);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [FULL_Y, HALF_Y, COLLAPSED_Y, HIDDEN_Y, snap]
  );
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  if (!summary && scanState !== "saved") return null;
  const isLowConfidence = (summary?.confidence ?? 100) < 80;
  const { nutrition } = summary ?? {};
  if (scanState === "saved") {
    return (
      <Animated.View
        style={[
          styles.sheet,
          { height: height - COLLAPSED_Y + 20, paddingBottom: insets.bottom + 16 },
          sheetStyle,
        ]}
      >
        <BlurView intensity={78} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.tintOverlay} />
        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={styles.handle} />
        </View>
        <View style={styles.savedContainer}>
          <View style={styles.savedIconWrap}>
            <CheckCircle2 color={COLORS.white} size={28} />
          </View>
          <Text style={styles.savedTitle}>Meal saved!</Text>
          <Text style={styles.savedMeal} numberOfLines={2}>
            {summary?.mealName}
          </Text>
          {savedMealTime && (
            <Text style={styles.savedTime}>Saved at {savedMealTime}</Text>
          )}
          <Pressable onPress={onClear} style={styles.scanAnotherButton}>
            <RotateCcw color={G.accent} size={16} />
            <Text style={styles.scanAnotherText}>Scan another meal</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }
  if (!summary) return null;
  const sheetH = height - FULL_Y;
  const origin = getFoodOriginCopy(summary);
  const freshnessColor = getFreshnessColor(summary.freshness.tone);
  const correctionOptions = (summary.correctionOptions ?? [])
    .filter((option) => option.label.trim())
    .filter((option, index, arr) =>
      arr.findIndex((item) => item.label.toLowerCase() === option.label.toLowerCase()) === index
    )
    .slice(0, 8);
  return (
    <Animated.View
      style={[
        styles.sheet,
        { height: sheetH, paddingBottom: insets.bottom + 16 },
        sheetStyle,
      ]}
    >
      <BlurView intensity={78} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.tintOverlay} />
      <View {...panResponder.panHandlers} style={styles.dragArea}>
        <View style={styles.handle} />
        <ChevronUp color={G.textLight} size={15} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <ScanLine color={G.accent} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>
              {isLowConfidence ? "We are not fully sure" : "We found your meal"}
            </Text>
            <Text style={styles.mealName} numberOfLines={2}>
              {summary.mealName}
            </Text>
          </View>
          <Pressable onPress={onClear} style={styles.clearButton}>
            <X color={G.textMuted} size={16} />
          </Pressable>
        </View>
        <View style={styles.confidenceRow}>
          <View
            style={[
              styles.confidencePill,
              isLowConfidence && styles.confidencePillLow,
            ]}
          >
            <CheckCircle2
              color={isLowConfidence ? G.warnText : G.accent}
              size={13}
            />
            <Text
              style={[
                styles.confidenceText,
                isLowConfidence && styles.confidenceTextLow,
              ]}
            >
              {isLowConfidence ? "Not sure" : "Good match"} ·{" "}
              {summary.confidence}%
            </Text>
          </View>
          <View style={styles.servingPill}>
            <Text style={styles.servingLabel}>Serving</Text>
            <Text style={styles.servingValue} numberOfLines={1}>
              {summary.localPortionLabel}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        {isLowConfidence && (
          <View style={styles.lowConfCard}>
            <Text style={styles.lowConfTitle}>
              What food is this?
            </Text>
            {correctionOptions.length > 0 ? (
              <>
                <Text style={styles.lowConfSub}>Choose the closest match from this scan:</Text>
                <View style={styles.chipGrid}>
                  {correctionOptions.map((option) => (
                    <Pressable
                      key={`${option.label}-${option.type ?? "food"}`}
                      onPress={() => {
                        onFoodCorrection(option);
                        setCorrecting(false);
                      }}
                      style={[
                        styles.chip,
                        summary.detectedItems[0]?.label === option.label && styles.chipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          summary.detectedItems[0]?.label === option.label &&
                            styles.chipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <View>
                <Text style={styles.lowConfSub}>
                  No close match came back from the detector. Try another scan in good light.
                </Text>
                <Pressable onPress={onClear} style={styles.retryInlineButton}>
                  <RotateCcw color={G.warnText} size={15} />
                  <Text style={styles.retryInlineText}>Scan again</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
        {!isLowConfidence && (
          <>
            <Text style={styles.sectionLabel}>What we see</Text>
            <View style={styles.itemRow}>
              {summary.detectedItems.slice(0, 4).map((item) => {
                const unsure = item.confidence < LOW_ITEM_CONFIDENCE;
                return (
                  <View
                    key={item.id}
                    style={[styles.itemChip, unsure && styles.itemChipUnsure]}
                  >
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Text
                      style={[styles.itemConf, unsure && styles.itemConfUnsure]}
                    >
                      {unsure ? "Not sure" : `${item.confidence}%`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
        <Text style={styles.sectionLabel}>Match details</Text>
        <View style={styles.originCard}>
          <View style={styles.originIntro}>
            <View style={styles.originIcon}>
              <MapPin color={G.accent} size={16} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.originTitle}>{origin.title}</Text>
              <Text style={styles.originDescription}>{origin.description}</Text>
            </View>
          </View>
          <View style={styles.originMetaRow}>
            <View style={styles.originMetaCell}>
              <Text style={styles.originMetaLabel}>Meal pattern</Text>
              <Text style={styles.originMetaValue}>{origin.pattern}</Text>
            </View>
            <View style={styles.originMetaDivider} />
            <View style={styles.originMetaCell}>
              <Text style={styles.originMetaLabel}>Detected amount</Text>
              <Text style={styles.originMetaValue} numberOfLines={1}>
                {summary.localPortionLabel}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Freshness score</Text>
        <View style={styles.freshnessCard}>
          <View style={styles.freshnessTop}>
            <View
              style={[
                styles.freshnessIcon,
                { backgroundColor: `${freshnessColor}1E` },
              ]}
            >
              <Leaf color={freshnessColor} size={17} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.freshnessTitle}>
                {summary.freshness.label}
              </Text>
              <Text style={styles.freshnessSummary}>
                {summary.freshness.summary}
              </Text>
            </View>
            <Text style={[styles.freshnessScore, { color: freshnessColor }]}>
              {summary.freshness.score}
              <Text style={styles.freshnessScoreUnit}>/100</Text>
            </Text>
          </View>
          <View style={styles.freshnessTrack}>
            <View
              style={[
                styles.freshnessFill,
                {
                  width: `${summary.freshness.score}%`,
                  backgroundColor: freshnessColor,
                },
              ]}
            />
          </View>
          {snap === "full" && (
            <>
              <View style={styles.freshnessSignalWrap}>
                {summary.freshness.signals.map((signal) => (
                  <View key={signal} style={styles.freshnessSignal}>
                    <View
                      style={[
                        styles.freshnessDot,
                        { backgroundColor: freshnessColor },
                      ]}
                    />
                    <Text style={styles.freshnessSignalText}>{signal}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.freshnessTip}>
                {summary.freshness.storageTip}
              </Text>
              <Text style={styles.freshnessDisclaimer}>
                {summary.freshness.disclaimer}
              </Text>
            </>
          )}
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Estimated nutrition</Text>
        {nutrition && (
          <View style={styles.nutritionGrid}>
            <NutriCell label="Energy" value={`${nutrition.calories}`} unit="kcal" highlight />
            <NutriCell label="Carbs"   value={`${nutrition.carbs}`}    unit="g" />
            <NutriCell label="Protein" value={`${nutrition.protein}`}  unit="g" />
            <NutriCell label="Fat"     value={`${nutrition.fat}`}      unit="g" />
          </View>
        )}
        {nutrition && (
          <Text style={styles.disclaimer}>{nutrition.disclaimer}</Text>
        )}
        <View style={styles.divider} />
        <View style={styles.adviceCard}>
          <View style={styles.adviceIconWrap}>
            <Image resizeMode="contain" source={LOGO_MARK} style={styles.adviceLogo} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adviceTitle}>NutriPadi says</Text>
            <Text style={styles.adviceText}>{summary.advice}</Text>
          </View>
        </View>
        {snap === "full" && !isLowConfidence && (
          <>
            <View style={styles.divider} />
            {correcting ? (
              <View>
                <Text style={styles.sectionLabel}>Change the food</Text>
                {correctionOptions.length > 0 ? (
                  <View style={styles.chipGrid}>
                    {correctionOptions.map((option) => (
                      <Pressable
                        key={`${option.label}-${option.type ?? "food"}`}
                        onPress={() => {
                          onFoodCorrection(option);
                          setCorrecting(false);
                        }}
                        style={styles.chip}
                      >
                        <Text style={styles.chipText}>{option.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <View>
                    <Text style={styles.lowConfSub}>
                      No close match came back from the detector. Try another scan in good light.
                    </Text>
                    <Pressable onPress={onClear} style={styles.retryInlineButton}>
                      <RotateCcw color={G.warnText} size={15} />
                      <Text style={styles.retryInlineText}>Scan again</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : (
              <Pressable
                onPress={() => setCorrecting(true)}
                style={styles.editFoodRow}
              >
                <Pencil color={G.textMuted} size={15} />
                <Text style={styles.editFoodText}>Not correct? Change the food</Text>
              </Pressable>
            )}
          </>
        )}
        {snap === "full" && nutrition && (
          <View style={styles.fibreRow}>
            <Text style={styles.fibreLabel}>Dietary fibre</Text>
            <Text style={styles.fibreValue}>{nutrition.fibre}g</Text>
          </View>
        )}
        {snap === "full" && nutrition && (
          <Text style={styles.sourceLabel}>{nutrition.sourceLabel}</Text>
        )}
      </ScrollView>
      <View style={styles.actions}>
        {saveError ? <Text style={styles.saveErrorText}>{saveError}</Text> : null}
        <Pressable
          disabled={isSaving}
          onPress={onSave}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Save color={COLORS.white} size={18} />
          )}
          <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save meal"}</Text>
        </Pressable>
        {snap !== "full" && (
          <Pressable
            onPress={() => {
              setCorrecting(false);
              onSnapChange("full");
            }}
            style={styles.editButton}
          >
            <Pencil color={G.textMuted} size={16} />
            <Text style={styles.editButtonText}>Not correct? Edit</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
function NutriCell({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <View style={[nutStyles.cell, highlight && nutStyles.cellHighlight]}>
      <Text style={[nutStyles.value, highlight && nutStyles.valueHighlight]}>
        ~{value}
        <Text style={nutStyles.unit}>{unit}</Text>
      </Text>
      <Text style={[nutStyles.label, highlight && nutStyles.labelHighlight]}>
        {label}
      </Text>
    </View>
  );
}
const nutStyles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: G.cardBg,
    borderWidth: 1,
    borderColor: G.cardBorder,
  },
  cellHighlight: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderColor: G.accentBorder,
    shadowColor: G.accent,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  value: {
    color: G.text,
    fontSize: 17,
    fontFamily: FONTS.extraBold,
  },
  valueHighlight: {
    color: G.accentDark,
  },
  unit: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  label: {
    color: G.textLight,
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    marginTop: 3,
    textTransform: "uppercase",
  },
  labelHighlight: {
    color: G.accentDark,
  },
});
const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: G.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -8 },
    elevation: 24,
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: G.bg,
  },
  dragArea: {
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: G.handle,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: G.accentBg,
    borderWidth: 1,
    borderColor: G.accentBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    color: G.accent,
    fontSize: 11,
    fontFamily: FONTS.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  mealName: {
    color: G.text,
    fontSize: 17,
    fontFamily: FONTS.extraBold,
    lineHeight: 23,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: G.pillBg,
    borderWidth: 1,
    borderColor: G.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  confidencePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: G.accentBg,
    borderWidth: 1,
    borderColor: G.accentBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  confidencePillLow: {
    backgroundColor: G.warnBg,
    borderColor: G.warnBorder,
  },
  confidenceText: {
    color: G.accent,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  confidenceTextLow: {
    color: G.warnText,
  },
  servingPill: {
    flex: 1,
    minWidth: 132,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: G.pillBg,
    borderWidth: 1,
    borderColor: G.cardBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  servingLabel: {
    color: G.textLight,
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    textTransform: "uppercase",
  },
  servingValue: {
    flexShrink: 1,
    color: G.text,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: G.divider,
    marginVertical: 14,
  },
  sectionLabel: {
    color: G.textLight,
    fontSize: 11,
    fontFamily: FONTS.extraBold,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  itemRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  itemChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: G.chipBg,
    borderWidth: 1,
    borderColor: G.cardBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemChipUnsure: {
    backgroundColor: G.warnBg,
    borderColor: G.warnBorder,
  },
  itemLabel: {
    color: G.text,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  itemConf: {
    color: G.accent,
    fontSize: 12,
    fontFamily: FONTS.extraBold,
  },
  itemConfUnsure: {
    color: G.warnText,
  },
  originCard: {
    backgroundColor: G.cardBg,
    borderWidth: 1,
    borderColor: G.cardBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 2,
  },
  originIntro: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  originIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: G.accentBg,
    borderWidth: 1,
    borderColor: G.accentBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  originTitle: {
    color: G.text,
    fontSize: 14,
    fontFamily: FONTS.extraBold,
    marginBottom: 4,
  },
  originDescription: {
    color: G.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },
  originMetaRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: G.divider,
    marginTop: 12,
    paddingTop: 12,
  },
  originMetaCell: {
    flex: 1,
    gap: 3,
  },
  originMetaDivider: {
    width: 1,
    backgroundColor: G.divider,
  },
  originMetaLabel: {
    color: G.textLight,
    fontSize: 10,
    fontFamily: FONTS.semiBold,
    textTransform: "uppercase",
  },
  originMetaValue: {
    color: G.text,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  freshnessCard: {
    backgroundColor: G.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: G.cardBorder,
    padding: 14,
  },
  freshnessTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  freshnessIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  freshnessTitle: {
    color: G.text,
    fontSize: 14,
    fontFamily: FONTS.extraBold,
    marginBottom: 3,
  },
  freshnessSummary: {
    color: G.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },
  freshnessScore: {
    minWidth: 58,
    textAlign: "right",
    fontSize: 22,
    fontFamily: FONTS.extraBold,
  },
  freshnessScoreUnit: {
    color: G.textLight,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  freshnessTrack: {
    height: 6,
    backgroundColor: "rgba(17,24,39,0.10)",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 12,
  },
  freshnessFill: {
    height: "100%",
    borderRadius: 999,
  },
  freshnessSignalWrap: {
    gap: 8,
    marginTop: 12,
  },
  freshnessSignal: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  freshnessDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  freshnessSignalText: {
    flex: 1,
    color: G.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },
  freshnessTip: {
    color: G.text,
    fontSize: 12,
    fontFamily: FONTS.bold,
    lineHeight: 18,
    marginTop: 12,
  },
  freshnessDisclaimer: {
    color: G.textLight,
    fontSize: 11,
    fontFamily: FONTS.medium,
    lineHeight: 16,
    marginTop: 8,
  },
  nutritionGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  disclaimer: {
    color: G.textLight,
    fontSize: 11,
    fontFamily: FONTS.medium,
    lineHeight: 16,
    marginBottom: 4,
  },
  adviceCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: G.accentBg,
    borderWidth: 1,
    borderColor: G.accentBorder,
    borderRadius: 14,
    padding: 14,
  },
  adviceIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  adviceLogo: {
    width: 22,
    height: 22,
  },
  adviceTitle: {
    color: G.accent,
    fontSize: 12,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  adviceText: {
    color: G.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    lineHeight: 20,
  },
  editFoodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  editFoodText: {
    color: G.textMuted,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  lowConfCard: {
    backgroundColor: G.warnBg,
    borderWidth: 1,
    borderColor: G.warnBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  lowConfTitle: {
    color: G.text,
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  lowConfSub: {
    color: G.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginBottom: 12,
  },
  retryInlineButton: {
    alignSelf: "flex-start",
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: G.warnBorder,
    backgroundColor: "rgba(255,255,255,0.42)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryInlineText: {
    color: G.warnText,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: G.chipBg,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: G.cardBorder,
  },
  chipActive: {
    backgroundColor: G.accent,
    borderColor: G.accent,
  },
  chipText: {
    color: G.text,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  fibreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: G.divider,
    marginTop: 10,
  },
  fibreLabel: {
    color: G.textMuted,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  fibreValue: {
    color: G.text,
    fontSize: 13,
    fontFamily: FONTS.extraBold,
  },
  sourceLabel: {
    color: G.textLight,
    fontSize: 11,
    fontFamily: FONTS.medium,
    marginTop: 6,
    marginBottom: 4,
    fontStyle: "italic",
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: G.divider,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: G.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: G.accent,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  saveButtonDisabled: {
    opacity: 0.72,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  saveErrorText: {
    color: "#D14343",
    fontSize: 12,
    fontFamily: FONTS.bold,
    lineHeight: 17,
    textAlign: "center",
  },
  editButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: G.actionBorder,
    backgroundColor: G.pillBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editButtonText: {
    color: G.textMuted,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  savedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  savedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: G.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: G.accent,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  savedTitle: {
    color: G.text,
    fontSize: 22,
    fontFamily: FONTS.extraBold,
    marginBottom: 6,
  },
  savedMeal: {
    color: G.textMuted,
    fontSize: 14,
    fontFamily: FONTS.medium,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 6,
  },
  savedTime: {
    color: G.textLight,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginBottom: 20,
  },
  scanAnotherButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: G.accentBorder,
    backgroundColor: G.accentBg,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  scanAnotherText: {
    color: G.accent,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
});
