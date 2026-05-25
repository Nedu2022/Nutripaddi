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

type DetectionArrowProps = {
  item: DetectedFoodItem;
  index: number;
  frameWidth: number;
  frameHeight: number;
};

const BASE_WIDTH = 360;
const BASE_HEIGHT = 640;
const LABEL_WIDTH = 164;
const LABEL_HEIGHT = 38;
const SIDE_PADDING = 18;
const LABEL_GAP = 18;
const TOP_SAFE_AREA = 126;
const BOTTOM_SAFE_AREA = 232;
const STACK_OFFSETS = [0, -18, 18, -36];

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

export default function DetectionArrow({
  item,
  index,
  frameWidth,
  frameHeight,
}: DetectionArrowProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  const pulse = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(index * 180, withTiming(1, { duration: 360 }));
    translateY.value = withDelay(index * 180, withTiming(0, { duration: 360 }));
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    );
  }, [index, opacity, pulse, translateY]);

  const labelWidth = Math.min(LABEL_WIDTH, frameWidth - SIDE_PADDING * 2);
  const dotX = clamp((item.x / BASE_WIDTH) * frameWidth, 28, frameWidth - 28);
  const dotY = clamp((item.y / BASE_HEIGHT) * frameHeight, 132, frameHeight - 210);
  const labelOnLeft = dotX > frameWidth / 2;
  const labelAbove = dotY > frameHeight * 0.44;
  const labelOffset = STACK_OFFSETS[index] ?? 0;
  const labelX = labelOnLeft
    ? clamp(dotX - labelWidth - LABEL_GAP, SIDE_PADDING, frameWidth - labelWidth - SIDE_PADDING)
    : clamp(dotX + LABEL_GAP, SIDE_PADDING, frameWidth - labelWidth - SIDE_PADDING);
  const preferredY = labelAbove
    ? dotY - LABEL_HEIGHT - LABEL_GAP + labelOffset
    : dotY + LABEL_GAP + labelOffset;
  const labelY = clamp(
    preferredY,
    TOP_SAFE_AREA,
    frameHeight - BOTTOM_SAFE_AREA
  );
  const lineStartX = labelOnLeft ? labelX + labelWidth - 8 : labelX + 8;
  const lineStartY = labelY + LABEL_HEIGHT / 2;
  const dx = dotX - lineStartX;
  const dy = dotY - lineStartY;
  const lineLength = Math.max(24, Math.sqrt(dx * dx + dy * dy));
  const angle = `${Math.atan2(dy, dx)}rad`;

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 1.35 - pulse.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, entranceStyle]}
    >
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
      <View style={[styles.label, { left: labelX, top: labelY, width: labelWidth }]}>
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
    width: 34,
    height: 34,
    borderRadius: 17,
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
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.78)",
    borderColor: "rgba(0,128,0,0.54)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  labelText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  confidenceText: {
    color: COLORS.primary,
    fontSize: 13,
    fontFamily: FONTS.extraBold,
  },
});
