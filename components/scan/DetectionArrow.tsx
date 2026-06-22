import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import type { DetectedFoodItem } from "@/src/types/detection";

type ScanBox = { left: number; top: number; width: number; height: number };
type ViewBounds = { left: number; top: number; right: number; bottom: number };

type DetectionArrowProps = {
  item: DetectedFoodItem;
  index: number;
  box: ScanBox;
  bounds: ViewBounds;
};

const LABEL_WIDTH = 128;
const LABEL_HEIGHT = 30;
const EDGE = 6;
const STACK_OFFSETS = [0, -16, 16, -32];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function DetectionArrow({ item, index, box, bounds }: DetectionArrowProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);
  const pulse = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(index * 140, withTiming(1, { duration: 320 }));
    translateY.value = withDelay(index * 140, withTiming(0, { duration: 320 }));
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    );
  }, [index, opacity, pulse, translateY]);

  const innerW = Math.max(1, box.width - EDGE * 2);
  const innerH = Math.max(1, box.height - EDGE * 2);
  const rawDotX = box.left + EDGE + clamp(item.x, 0, 1) * innerW;
  const rawDotY = box.top + EDGE + clamp(item.y, 0, 1) * innerH;
  const dotX = clamp(rawDotX, bounds.left + EDGE, bounds.right - EDGE);
  const dotY = clamp(rawDotY, bounds.top + EDGE, bounds.bottom - EDGE);

  const labelAbove = dotY > bounds.top + (bounds.bottom - bounds.top) / 2;
  const labelX = clamp(
    dotX - LABEL_WIDTH / 2,
    bounds.left + EDGE,
    bounds.right - LABEL_WIDTH - EDGE
  );
  const labelY = clamp(
    (labelAbove ? dotY - LABEL_HEIGHT - 16 : dotY + 16) + (STACK_OFFSETS[index] ?? 0),
    bounds.top + EDGE,
    bounds.bottom - LABEL_HEIGHT - EDGE
  );

  const lineStartX = labelX + LABEL_WIDTH / 2;
  const lineStartY = labelY + LABEL_HEIGHT / 2;
  const dx = dotX - lineStartX;
  const dy = dotY - lineStartY;
  const lineLength = Math.max(8, Math.sqrt(dx * dx + dy * dy));
  const angle = `${Math.atan2(dy, dx)}rad`;

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 1.3 - pulse.value,
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, entranceStyle]}>
      <View
        style={[
          styles.pointerLine,
          {
            left: lineStartX + dx / 2 - lineLength / 2,
            top: lineStartY + dy / 2 - 1,
            width: lineLength,
            transform: [{ rotate: angle }],
          },
        ]}
      />
      <View style={[styles.dotWrap, { left: dotX - 9, top: dotY - 9 }]}>
        <Animated.View style={[styles.dotPulse, pulseStyle]} />
        <View style={styles.dot} />
      </View>
      <View style={[styles.label, { left: labelX, top: labelY, width: LABEL_WIDTH }]}>
        <Text style={styles.labelText} numberOfLines={1}>
          {item.label}
        </Text>
        <Text style={styles.confidenceText}>{item.confidence}%</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pointerLine: {
    position: "absolute",
    height: 2,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  dotWrap: {
    position: "absolute",
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dotPulse: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,128,0,0.24)",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  label: {
    position: "absolute",
    minHeight: LABEL_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.82)",
    borderColor: "rgba(0,128,0,0.55)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  labelText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  confidenceText: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.extraBold,
  },
});
