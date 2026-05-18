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
const LABEL_WIDTH = 148;
const LABEL_HEIGHT = 34;

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

  const dotX = (item.x / BASE_WIDTH) * frameWidth;
  const dotY = (item.y / BASE_HEIGHT) * frameHeight;
  const labelOnLeft = dotX > frameWidth * 0.52;
  const labelX = labelOnLeft
    ? clamp(dotX - LABEL_WIDTH - 20, 14, frameWidth - LABEL_WIDTH - 14)
    : clamp(dotX + 20, 14, frameWidth - LABEL_WIDTH - 14);
  const labelY = clamp(dotY - 48, 88, frameHeight - 260);
  const lineStartX = labelOnLeft ? labelX + LABEL_WIDTH : labelX;
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
            top: lineStartY + dy / 2,
            width: lineLength,
            transform: [{ rotate: angle }],
          },
        ]}
      />
      <View style={[styles.dotWrap, { left: dotX - 9, top: dotY - 9 }]}>
        <Animated.View style={[styles.dotPulse, pulseStyle]} />
        <View style={styles.dot} />
      </View>
      <View style={[styles.label, { left: labelX, top: labelY }]}>
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
    height: 1.5,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,128,0,0.28)",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  label: {
    position: "absolute",
    width: LABEL_WIDTH,
    minHeight: LABEL_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
