import { useEffect, useMemo, useRef } from "react";
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
  MapPin,
  Pencil,
  ScanLine,
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
import type { DetectedMealSummary } from "@/src/types/detection";

// Glassmorphism color tokens
const G = {
  bg: "rgba(8, 8, 12, 0.72)",
  border: "rgba(255, 255, 255, 0.13)",
  handle: "rgba(255, 255, 255, 0.28)",
  cardBg: "rgba(255, 255, 255, 0.07)",
  cardBorder: "rgba(255, 255, 255, 0.10)",
  divider: "rgba(255, 255, 255, 0.09)",
  text: "#FFFFFF",
  textMuted: "rgba(255, 255, 255, 0.62)",
  textLight: "rgba(255, 255, 255, 0.38)",
  accent: COLORS.primary,
  accentDark: COLORS.primaryDark,
  accentBg: "rgba(0, 128, 0, 0.15)",
  warnBg: "rgba(255, 175, 0, 0.14)",
  warnText: "#FFBB33",
  pillBg: "rgba(255, 255, 255, 0.10)",
  chipBg: "rgba(255, 255, 255, 0.09)",
  chipActiveBg: COLORS.primary,
};

type DetectedMealBottomSheetProps = {
  visible: boolean;
  summary: DetectedMealSummary | null;
  onAnalyze: () => void;
  onEdit: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function DetectedMealBottomSheet({
  visible,
  summary,
  onAnalyze,
  onEdit,
}: DetectedMealBottomSheetProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.min(500, Math.max(410, height * 0.58));
  const collapsedY = sheetHeight - 126;
  const halfY = Math.max(118, sheetHeight - 318);
  const fullY = 0;
  const hiddenY = sheetHeight + insets.bottom + 24;
  const translateY = useSharedValue(hiddenY);
  const startY = useRef(halfY);
  const isLowConfidence = Boolean(summary && summary.confidence < 82);

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

  const swallow = summary.detectedItems.find((item) => item.type === "swallow");
  const soup = summary.detectedItems.find((item) => item.type === "soup");
  const protein = summary.detectedItems.find((item) => item.type === "protein");
  const pattern =
    swallow && soup
      ? `Swallow + soup${protein ? " + protein" : ""}`
      : summary.detectedItems[0]?.label ?? "Mixed plate";

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
      {/* Frosted glass backdrop */}
      <BlurView
        intensity={78}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      {/* Tinted overlay on top of blur */}
      <View style={styles.tintOverlay} />

      {/* Drag area */}
      <View {...panResponder.panHandlers} style={styles.dragArea}>
        <View style={styles.handle} />
        <ChevronUp color={G.textLight} size={16} />
      </View>

      {/* Header */}
      <View style={styles.topRow}>
        <View style={styles.titleIcon}>
          <ScanLine color={G.accent} size={18} />
        </View>
        <View style={styles.titleCopy}>
          <Text style={styles.eyebrow}>
            {isLowConfidence ? "We are not fully sure" : "We found your meal"}
          </Text>
          <Text style={styles.mealName}>{summary.mealName}</Text>
        </View>
      </View>

      {/* Confidence + quick action */}
      <View style={styles.collapsedActionRow}>
        <View style={[styles.matchPill, isLowConfidence && styles.matchPillWarn]}>
          <CheckCircle2
            color={isLowConfidence ? G.warnText : G.accent}
            size={14}
          />
          <Text style={[styles.matchText, isLowConfidence && styles.matchTextWarn]}>
            {isLowConfidence ? "Needs review" : "Good match"} · {summary.confidence}%
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

          <Text style={styles.sectionLabel}>Food origin</Text>
          <View style={styles.originCard}>
            <View style={styles.originIcon}>
              <MapPin color={G.accent} size={15} />
            </View>
            <View style={styles.originCopy}>
              <Text style={styles.originTitle}>Local meal pattern</Text>
              <Text style={styles.originText}>
                {pattern} recognised from the visible foods.
              </Text>
              <Text style={styles.localPortion}>
                Detected amount: {summary.localPortionLabel}
              </Text>
            </View>
          </View>
        </>
      )}

      {!isLowConfidence && (
        <View style={styles.estimateRow}>
          <View style={styles.estimateCell}>
            <Text style={styles.estimateValue}>~{summary.nutrition.calories}</Text>
            <Text style={styles.estimateLabel}>kcal</Text>
          </View>
          <View style={styles.estimateDivider} />
          <View style={styles.estimateCell}>
            <Text style={styles.estimateValue}>~{summary.nutrition.carbs}g</Text>
            <Text style={styles.estimateLabel}>carbs</Text>
          </View>
          <View style={styles.estimateDivider} />
          <View style={styles.estimateCell}>
            <Text style={styles.estimateValue}>~{summary.nutrition.protein}g</Text>
            <Text style={styles.estimateLabel}>protein</Text>
          </View>
          <View style={styles.estimateDivider} />
          <View style={styles.estimateCell}>
            <Text style={styles.estimateValue}>~{summary.nutrition.fat}g</Text>
            <Text style={styles.estimateLabel}>fat</Text>
          </View>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <Pressable onPress={onAnalyze} style={styles.analyzeButton}>
          <ScanLine color="#FFFFFF" size={18} />
          <Text style={styles.analyzeText}>
            {isLowConfidence ? "Continue" : "Analyze Nutrition"}
          </Text>
        </Pressable>
        <Pressable onPress={onEdit} style={styles.editButton}>
          <Pencil color={G.textMuted} size={17} />
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: G.border,
    overflow: "hidden",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: -12 },
    elevation: 24,
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: G.bg,
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
    backgroundColor: G.handle,
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
    backgroundColor: G.accentBg,
    borderWidth: 1,
    borderColor: "rgba(0, 128, 0, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleCopy: {
    flex: 1,
  },
  eyebrow: {
    color: G.accent,
    fontSize: 11,
    fontFamily: FONTS.extraBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  mealName: {
    color: G.text,
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
    backgroundColor: G.accentBg,
    borderWidth: 1,
    borderColor: "rgba(0, 128, 0, 0.2)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  matchPillWarn: {
    backgroundColor: G.warnBg,
    borderColor: "rgba(255, 175, 0, 0.2)",
  },
  matchText: {
    color: G.accent,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  matchTextWarn: {
    color: G.warnText,
  },
  smallAnalyzeButton: {
    minHeight: 36,
    borderRadius: 999,
    backgroundColor: G.accent,
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: G.accent,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  smallAnalyzeText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: G.divider,
    marginVertical: 14,
  },
  sectionLabel: {
    color: G.textMuted,
    fontSize: 11,
    fontFamily: FONTS.extraBold,
    marginBottom: 9,
    textTransform: "uppercase",
    letterSpacing: 0.6,
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
    backgroundColor: G.chipBg,
    borderWidth: 1,
    borderColor: G.cardBorder,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  itemName: {
    color: G.text,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  itemConfidence: {
    color: G.accent,
    fontSize: 12,
    fontFamily: FONTS.extraBold,
  },
  originCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: G.cardBg,
    borderWidth: 1,
    borderColor: G.cardBorder,
    borderRadius: 16,
    padding: 14,
  },
  originIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: G.accentBg,
    alignItems: "center",
    justifyContent: "center",
  },
  originCopy: {
    flex: 1,
  },
  originTitle: {
    color: G.text,
    fontSize: 13,
    fontFamily: FONTS.extraBold,
    marginBottom: 4,
  },
  originText: {
    color: G.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
    marginBottom: 6,
  },
  localPortion: {
    color: G.text,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  estimateRow: {
    flexDirection: "row",
    backgroundColor: G.cardBg,
    borderWidth: 1,
    borderColor: G.cardBorder,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 14,
  },
  estimateCell: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  estimateDivider: {
    width: 1,
    backgroundColor: G.divider,
  },
  estimateValue: {
    color: G.text,
    fontSize: 15,
    fontFamily: FONTS.extraBold,
  },
  estimateLabel: {
    color: G.textLight,
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
  analyzeText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  editButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: G.border,
    backgroundColor: G.pillBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editText: {
    color: G.textMuted,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  lowConfidenceCard: {
    backgroundColor: G.warnBg,
    borderWidth: 1,
    borderColor: "rgba(255, 175, 0, 0.2)",
    borderRadius: 16,
    padding: 14,
  },
  lowMessage: {
    color: G.text,
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
    backgroundColor: G.chipBg,
    borderWidth: 1,
    borderColor: G.cardBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  choiceText: {
    color: G.text,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
});
