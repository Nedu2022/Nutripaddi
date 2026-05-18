import { useEffect, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { CheckCircle2, ScanLine } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import ScanFrame from "@/components/ScanFrame";
import DetectionArrow from "@/components/scan/DetectionArrow";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import type { DetectedFoodItem } from "@/src/types/detection";

type CameraOverlayProps = {
  detections: DetectedFoodItem[];
  isPaused: boolean;
  isDetecting: boolean;
};

const TIPS = [
  "Place the full plate inside the frame",
  "Good lighting gives better results",
  "Include all food items in view",
  "Hold the phone steady for 2 seconds",
  "Works best with clear, well-lit meals",
];

export default function CameraOverlay({
  detections,
  isPaused,
  isDetecting,
}: CameraOverlayProps) {
  const { width, height } = useWindowDimensions();
  const pulse = useSharedValue(1);
  const scanLine = useSharedValue(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (isPaused || detections.length > 0) return;
    const timer = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused, detections.length]);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1100 }),
        withTiming(1, { duration: 1100 })
      ),
      -1,
      true
    );
    scanLine.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800 }),
        withTiming(0, { duration: 1800 })
      ),
      -1,
      false
    );
  }, [pulse, scanLine]);

  const frameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLine.value * 220 - 110 }],
    opacity: isPaused ? 0.25 : 0.9,
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.vignette} />
      <Animated.View style={[styles.scanFrameWrap, frameStyle]}>
        <View style={styles.frameGlow} />
        <ScanFrame />
        <Animated.View style={[styles.liveScanLine, lineStyle]} />
      </Animated.View>

      {detections.slice(0, 4).map((item, index) => (
        <DetectionArrow
          key={`${item.id}-${item.confidence}`}
          frameHeight={height}
          frameWidth={width}
          index={index}
          item={item}
        />
      ))}

      {!detections.length && !isPaused && (
        <View style={styles.tipPill}>
          <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
        </View>
      )}

      <View style={styles.statusPill}>
        {isPaused ? (
          <>
            <ScanLine color={COLORS.warning} size={14} />
            <Text style={styles.statusText}>Scanning paused</Text>
          </>
        ) : detections.length ? (
          <>
            <CheckCircle2 color={COLORS.primary} size={14} />
            <Text style={styles.statusText}>Food detected</Text>
          </>
        ) : (
          <>
            <ScanLine color={COLORS.primary} size={14} />
            <Text style={styles.statusText}>
              {isDetecting ? "Reading the plate..." : "Point at the food"}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  scanFrameWrap: {
    position: "absolute",
    top: "24%",
    left: 22,
    right: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  frameGlow: {
    position: "absolute",
    width: "82%",
    aspectRatio: 1,
    borderRadius: 28,
    backgroundColor: "rgba(0,128,0,0.14)",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  liveScanLine: {
    position: "absolute",
    width: "68%",
    height: 2,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  tipPill: {
    position: "absolute",
    top: "62%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.58)",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tipText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  statusPill: {
    position: "absolute",
    top: "18%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(0,0,0,0.64)",
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
});
