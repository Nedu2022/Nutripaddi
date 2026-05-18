import { useMemo, useRef, useState } from "react";
import {
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
  Pencil,
  RotateCcw,
  Save,
  Sparkles,
  X,
} from "lucide-react-native";
import { PanResponder } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import type { DetectedMealPortion, DetectedMealSummary, ScanState } from "@/src/types/detection";

export type SheetSnap = "hidden" | "collapsed" | "half" | "full";

type Props = {
  summary: DetectedMealSummary | null;
  scanState: ScanState;
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
  onPortionChange: (portion: DetectedMealPortion) => void;
  onFoodCorrection: (label: string) => void;
  onSave: () => void;
  onClear: () => void;
  savedMealTime?: string;
};

const SWALLOW_OPTIONS = [
  "Pounded Yam",
  "Amala",
  "Semo",
  "Eba",
  "Fufu",
  "Not listed",
];

const PORTION_OPTIONS: { value: DetectedMealPortion; label: string }[] = [
  { value: "small",  label: "Small" },
  { value: "normal", label: "Normal" },
  { value: "large",  label: "Large" },
];

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

export default function LiveNutritionSheet({
  summary,
  scanState,
  snap,
  onSnapChange,
  onPortionChange,
  onFoodCorrection,
  onSave,
  onClear,
  savedMealTime,
}: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [correcting, setCorrecting] = useState(false);

  // snap point Y values (distance from top of screen to top of sheet)
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

  // Drive animation when snap prop changes
  const targetY = snapToY[snap];
  translateY.value = withTiming(targetY, { duration: 420 });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
        onPanResponderGrant: () => {
          startY.current = translateY.value;
        },
        onPanResponderMove: (_, g) => {
          translateY.value = clamp(startY.current + g.dy, FULL_Y, HIDDEN_Y);
        },
        onPanResponderRelease: (_, g) => {
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
    [FULL_Y, HALF_Y, COLLAPSED_Y, HIDDEN_Y]
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!summary && scanState !== "saved") return null;

  const isLowConfidence = (summary?.confidence ?? 100) < 80;
  const { nutrition } = summary ?? {};

  // ── SAVED STATE ────────────────────────────────────────────────────────────
  if (scanState === "saved") {
    return (
      <Animated.View
        style={[styles.sheet, { height: height - COLLAPSED_Y + 20, paddingBottom: insets.bottom + 16 }, sheetStyle]}
      >
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
            <RotateCcw color={COLORS.primary} size={16} />
            <Text style={styles.scanAnotherText}>Scan another meal</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  if (!summary) return null;

  const sheetH = height - FULL_Y;

  return (
    <Animated.View
      style={[
        styles.sheet,
        { height: sheetH, paddingBottom: insets.bottom + 16 },
        sheetStyle,
      ]}
    >
      {/* Drag handle */}
      <View {...panResponder.panHandlers} style={styles.dragArea}>
        <View style={styles.handle} />
        <ChevronUp color={COLORS.textLight} size={15} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Sparkles color={COLORS.primary} size={18} />
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
            <X color={COLORS.textMuted} size={16} />
          </Pressable>
        </View>

        {/* Confidence + quick save */}
        <View style={styles.confidenceRow}>
          <View
            style={[
              styles.confidencePill,
              isLowConfidence && styles.confidencePillLow,
            ]}
          >
            <CheckCircle2
              color={isLowConfidence ? "#A56000" : COLORS.primary}
              size={13}
            />
            <Text
              style={[
                styles.confidenceText,
                isLowConfidence && styles.confidenceTextLow,
              ]}
            >
              {isLowConfidence ? "Needs review" : "Good match"} ·{" "}
              {summary.confidence}%
            </Text>
          </View>
          <Pressable onPress={onSave} style={styles.quickSaveButton}>
            <Save color={COLORS.white} size={13} />
            <Text style={styles.quickSaveText}>Save meal</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* ── LOW CONFIDENCE FOOD SELECTION ───────────────────────────── */}
        {isLowConfidence && (
          <View style={styles.lowConfCard}>
            <Text style={styles.lowConfTitle}>
              Is this Amala, Semo, or Pounded Yam?
            </Text>
            <Text style={styles.lowConfSub}>Choose the correct one:</Text>
            <View style={styles.chipGrid}>
              {SWALLOW_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => {
                    onFoodCorrection(opt);
                    setCorrecting(false);
                  }}
                  style={[
                    styles.chip,
                    summary.detectedItems[0]?.label === opt && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      summary.detectedItems[0]?.label === opt &&
                        styles.chipTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ── DETECTED ITEMS ───────────────────────────────────────────── */}
        {!isLowConfidence && (
          <>
            <Text style={styles.sectionLabel}>What we see</Text>
            <View style={styles.itemRow}>
              {summary.detectedItems.slice(0, 4).map((item) => (
                <View key={item.id} style={styles.itemChip}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemConf}>{item.confidence}%</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── PORTION SELECTOR ─────────────────────────────────────────── */}
        <View style={styles.portionHeader}>
          <Text style={styles.sectionLabel}>Portion size</Text>
          <Text style={styles.portionLocalLabel}>{summary.localPortionLabel}</Text>
        </View>
        <View style={styles.portionRow}>
          {PORTION_OPTIONS.map(({ value, label }) => {
            const active = summary.portion === value;
            return (
              <Pressable
                key={value}
                onPress={() => onPortionChange(value)}
                style={[styles.portionOption, active && styles.portionOptionActive]}
              >
                <Text
                  style={[
                    styles.portionOptionText,
                    active && styles.portionOptionTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.portionHint}>
          {"Does this look correct? Change it if it doesn't."}
        </Text>

        <View style={styles.divider} />

        {/* ── NUTRITION GRID ───────────────────────────────────────────── */}
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

        {/* ── AI ADVICE ────────────────────────────────────────────────── */}
        <View style={styles.adviceCard}>
          <View style={styles.adviceIconWrap}>
            <Sparkles color={COLORS.primary} size={15} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adviceTitle}>NutriPadi says</Text>
            <Text style={styles.adviceText}>{summary.advice}</Text>
          </View>
        </View>

        {/* ── CORRECTION (FULL STATE) ──────────────────────────────────── */}
        {snap === "full" && !isLowConfidence && (
          <>
            <View style={styles.divider} />
            {correcting ? (
              <View>
                <Text style={styles.sectionLabel}>Change the food</Text>
                <View style={styles.chipGrid}>
                  {SWALLOW_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => {
                        onFoodCorrection(opt);
                        setCorrecting(false);
                      }}
                      style={styles.chip}
                    >
                      <Text style={styles.chipText}>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setCorrecting(true)}
                style={styles.editFoodRow}
              >
                <Pencil color={COLORS.textMuted} size={15} />
                <Text style={styles.editFoodText}>Not correct? Change the food</Text>
              </Pressable>
            )}
          </>
        )}

        {/* ── FIBRE (FULL STATE) ───────────────────────────────────────── */}
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

      {/* ── ACTION BUTTONS ───────────────────────────────────────────────── */}
      <View style={styles.actions}>
        <Pressable onPress={onSave} style={styles.saveButton}>
          <Save color={COLORS.white} size={18} />
          <Text style={styles.saveButtonText}>Save meal</Text>
        </Pressable>
        {snap !== "full" && (
          <Pressable
            onPress={() => {
              setCorrecting(false);
              onSnapChange("full");
            }}
            style={styles.editButton}
          >
            <Pencil color={COLORS.text} size={16} />
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
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
  },
  cellHighlight: {
    backgroundColor: COLORS.primary,
  },
  value: {
    color: COLORS.text,
    fontSize: 17,
    fontFamily: FONTS.extraBold,
  },
  valueHighlight: {
    color: COLORS.white,
  },
  unit: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    marginTop: 3,
    textTransform: "uppercase",
  },
  labelHighlight: {
    color: "rgba(255,255,255,0.75)",
  },
});

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -8 },
    elevation: 20,
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
    backgroundColor: COLORS.border,
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
    borderRadius: 12,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontFamily: FONTS.bold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  mealName: {
    color: COLORS.text,
    fontSize: 17,
    fontFamily: FONTS.extraBold,
    lineHeight: 23,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  confidencePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.softGreen,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  confidencePillLow: {
    backgroundColor: "#FFF3DC",
  },
  confidenceText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  confidenceTextLow: {
    color: "#A56000",
  },
  quickSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  quickSaveText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.extraBold,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.3,
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
    backgroundColor: COLORS.inputBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  itemConf: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.extraBold,
  },
  portionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  portionLocalLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  portionRow: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    padding: 4,
  },
  portionOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 10,
  },
  portionOptionActive: {
    backgroundColor: COLORS.primary,
  },
  portionOptionText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  portionOptionTextActive: {
    color: COLORS.white,
  },
  portionHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 8,
    lineHeight: 18,
  },
  nutritionGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  disclaimer: {
    color: COLORS.textLight,
    fontSize: 11,
    fontFamily: FONTS.medium,
    lineHeight: 16,
    marginBottom: 4,
  },
  adviceCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.softGreen,
    borderRadius: 14,
    padding: 14,
  },
  adviceIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  adviceTitle: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  adviceText: {
    color: COLORS.text,
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
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  lowConfCard: {
    backgroundColor: "#FFF3DC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  lowConfTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  lowConfSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginBottom: 12,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
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
    borderTopColor: COLORS.border,
    marginTop: 10,
  },
  fibreLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  fibreValue: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.extraBold,
  },
  sourceLabel: {
    color: COLORS.textLight,
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
    borderTopColor: COLORS.border,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  editButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  // Saved state
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
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  savedTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontFamily: FONTS.extraBold,
    marginBottom: 6,
  },
  savedMeal: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.medium,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 6,
  },
  savedTime: {
    color: COLORS.textLight,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginBottom: 20,
  },
  scanAnotherButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  scanAnotherText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
});
