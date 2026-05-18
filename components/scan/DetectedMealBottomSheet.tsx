import { useEffect, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  CheckCircle2,
  ChevronUp,
  Pencil,
  ScanLine,
  Sparkles,
} from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PortionSelector from "@/components/scan/PortionSelector";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { getPortionLabel } from "@/src/services/foodDetectionService";
import type {
  DetectedMealPortion,
  DetectedMealSummary,
} from "@/src/types/detection";

const PORTION_ESTIMATES: Record<
  DetectedMealPortion,
  { kcal: number; carbs: number; protein: number; fat: number }
> = {
  small:  { kcal: 380, carbs: 48, protein: 14, fat: 14 },
  normal: { kcal: 580, carbs: 72, protein: 20, fat: 22 },
  large:  { kcal: 780, carbs: 98, protein: 28, fat: 30 },
};

type DetectedMealBottomSheetProps = {
  visible: boolean;
  summary: DetectedMealSummary | null;
  onAnalyze: () => void;
  onEdit: () => void;
  onPortionChange: (portion: DetectedMealPortion, localLabel: string) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function DetectedMealBottomSheet({
  visible,
  summary,
  onAnalyze,
  onEdit,
  onPortionChange,
}: DetectedMealBottomSheetProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [portion, setPortion] = useState<DetectedMealPortion>(
    summary?.portion ?? "normal"
  );
  const sheetHeight = Math.min(500, Math.max(410, height * 0.58));
  const collapsedY = sheetHeight - 126;
  const halfY = Math.max(118, sheetHeight - 318);
  const fullY = 0;
  const hiddenY = sheetHeight + insets.bottom + 24;
  const translateY = useSharedValue(hiddenY);
  const startY = useRef(halfY);
  const isLowConfidence = Boolean(summary && summary.confidence < 82);

  useEffect(() => {
    if (summary?.portion) {
      setPortion(summary.portion);
    }
  }, [summary?.portion]);

  useEffect(() => {
    translateY.value = withTiming(visible && summary ? halfY : hiddenY, {
      duration: 420,
    });
  }, [halfY, hiddenY, summary, translateY, visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 6,
        onPanResponderGrant: () => {
          startY.current = translateY.value;
        },
        onPanResponderMove: (_, gesture) => {
          translateY.value = clamp(startY.current + gesture.dy, fullY, collapsedY);
        },
        onPanResponderRelease: (_, gesture) => {
          const next = clamp(startY.current + gesture.dy, fullY, collapsedY);
          const snapPoints = [fullY, halfY, collapsedY];
          const snap = snapPoints.reduce((closest, point) =>
            Math.abs(point - next) < Math.abs(closest - next) ? point : closest
          );
          translateY.value = withTiming(snap, { duration: 220 });
        },
      }),
    [collapsedY, fullY, halfY, translateY]
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!summary) return null;

  const handlePortionChange = (value: DetectedMealPortion) => {
    const localLabel = getPortionLabel(value);
    setPortion(value);
    onPortionChange(value, localLabel);
  };

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          height: sheetHeight + insets.bottom,
          paddingBottom: insets.bottom + 16,
        },
        sheetStyle,
      ]}
    >
      <View {...panResponder.panHandlers} style={styles.dragArea}>
        <View style={styles.handle} />
        <ChevronUp color={COLORS.textLight} size={16} />
      </View>

      <View style={styles.topRow}>
        <View style={styles.titleIcon}>
          <Sparkles color={COLORS.primary} size={18} />
        </View>
        <View style={styles.titleCopy}>
          <Text style={styles.eyebrow}>
            {isLowConfidence ? "We are not fully sure" : "We found your meal"}
          </Text>
          <Text style={styles.mealName}>{summary.mealName}</Text>
        </View>
      </View>

      <View style={styles.collapsedActionRow}>
        <View style={styles.matchPill}>
          <CheckCircle2 color={COLORS.primary} size={14} />
          <Text style={styles.matchText}>
            {isLowConfidence ? "Needs review" : "Good match"} ·{" "}
            {summary.confidence}%
          </Text>
        </View>
        <Pressable onPress={onAnalyze} style={styles.smallAnalyzeButton}>
          <Text style={styles.smallAnalyzeText}>Analyze</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      {isLowConfidence ? (
        <View style={styles.lowConfidenceCard}>
          <Text style={styles.lowMessage}>
            This may be Amala, Semo, or Pounded Yam. Please choose the correct
            one.
          </Text>
          <View style={styles.choiceGrid}>
            {["Amala", "Semo", "Pounded Yam", "Eba", "Not listed"].map(
              (item) => (
                <Pressable key={item} style={styles.choiceChip}>
                  <Text style={styles.choiceText}>{item}</Text>
                </Pressable>
              )
            )}
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>Detected items</Text>
          <View style={styles.itemList}>
            {summary.detectedItems.slice(0, 4).map((item) => (
              <View key={item.id} style={styles.detectedItem}>
                <Text style={styles.itemName}>{item.label}</Text>
                <Text style={styles.itemConfidence}>{item.confidence}%</Text>
              </View>
            ))}
          </View>

          <View style={styles.portionHeader}>
            <Text style={styles.sectionLabel}>Quick amount</Text>
            <Text style={styles.localPortion}>{getPortionLabel(portion)}</Text>
          </View>
          <PortionSelector value={portion} onChange={handlePortionChange} />
          <Text style={styles.helperText}>
            This looks like {getPortionLabel(portion).toLowerCase()}. You can
            adjust it if it is not correct.
          </Text>
        </>
      )}

      {!isLowConfidence && (
        <View style={styles.estimateRow}>
          {(["kcal", "carbs", "protein", "fat"] as const).map((key) => (
            <View key={key} style={styles.estimateCell}>
              <Text style={styles.estimateValue}>
                ~{PORTION_ESTIMATES[portion][key]}
                {key === "kcal" ? "" : "g"}
              </Text>
              <Text style={styles.estimateLabel}>{key}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionRow}>
        <Pressable onPress={onAnalyze} style={styles.analyzeButton}>
          <ScanLine color={COLORS.white} size={18} />
          <Text style={styles.analyzeText}>
            {isLowConfidence ? "Continue" : "Analyze Nutrition"}
          </Text>
        </Pressable>
        <Pressable onPress={onEdit} style={styles.editButton}>
          <Pencil color={COLORS.text} size={17} />
          <Text style={styles.editText}>Not correct? Edit</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -10 },
    elevation: 16,
  },
  dragArea: {
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.border,
    marginBottom: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titleIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  titleCopy: {
    flex: 1,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.extraBold,
    marginBottom: 2,
  },
  mealName: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONTS.extraBold,
    lineHeight: 24,
  },
  collapsedActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
  },
  matchPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.softGreen,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  matchText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  smallAnalyzeButton: {
    minHeight: 36,
    borderRadius: 999,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  smallAnalyzeText: {
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
    fontSize: 14,
    fontFamily: FONTS.extraBold,
    marginBottom: 9,
  },
  itemList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  detectedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.inputBg,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  itemName: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  itemConfidence: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.extraBold,
  },
  portionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  localPortion: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.bold,
    marginBottom: 9,
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
    marginTop: 8,
  },
  estimateRow: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  estimateCell: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  estimateValue: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.extraBold,
  },
  estimateLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    textTransform: "uppercase",
  },
  actionRow: {
    gap: 10,
    marginTop: 16,
  },
  analyzeButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: COLORS.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  analyzeText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  editButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editText: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  lowConfidenceCard: {
    backgroundColor: COLORS.softYellow,
    borderRadius: 16,
    padding: 14,
  },
  lowMessage: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.medium,
    lineHeight: 20,
    marginBottom: 12,
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choiceChip: {
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  choiceText: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
});
