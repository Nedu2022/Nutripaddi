import { useEffect, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScanFrame from "@/components/ScanFrame";
import DetectionArrow from "@/components/scan/DetectionArrow";
import { FONTS } from "@/constants/fonts";
import type { DetectedFoodItem, ScanState } from "@/src/types/detection";
type CameraOverlayProps = {
  detections:  DetectedFoodItem[];
  imageSize?: { width: number; height: number } | null;
  isPaused:    boolean;
  isDetecting: boolean;
  scanState:   ScanState;
};
const TIPS = [
  "Scanning automatically. Hold steady",
  "Good lighting gives better results",
  "Include all food items in the frame",
  "Hold the phone steady for a moment",
  "Works best with clear, well-lit food",
];
const DETECTING_MSGS = [
  "Identifying food items…",
  "Analysing ingredients…",
  "Preparing nutrition estimate…",
  "Almost there…",
];
const STATE_TEXT: Partial<Record<ScanState, string>> = {
  scanning:       "Scanning automatically. Hold steady",
  good_match:     "Food detected",
  low_confidence: "Confirm the food below",
  poor_image:     "Couldn't see clearly. Try again",
  no_food:        "No food detected. Try again",
  saved:          "Meal saved!",
  offline:        "Working with local data",
};
export default function CameraOverlay({
  detections,
  imageSize,
  isPaused,
  isDetecting,
  scanState,
}: CameraOverlayProps) {
  const { width, height } = useWindowDimensions();
  const insets             = useSafeAreaInsets();
  const pulse    = useSharedValue(1);
  const scanLine = useSharedValue(0);
  const [tipIdx, setTipIdx]           = useState(0);
  const [detectMsgIdx, setDetectMsgIdx] = useState(0);
  useEffect(() => {
    if (isPaused || detections.length > 0) return;
    const t = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 3200);
    return () => clearInterval(t);
  }, [isPaused, detections.length]);
  useEffect(() => {
    if (!isDetecting) return;
    const t = setInterval(() => setDetectMsgIdx((i) => (i + 1) % DETECTING_MSGS.length), 1100);
    return () => clearInterval(t);
  }, [isDetecting]);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.025, { duration: 1400 }), withTiming(1, { duration: 1400 })),
      -1, true,
    );
    scanLine.value = withRepeat(
      withSequence(withTiming(1, { duration: 1900 }), withTiming(0, { duration: 1900 })),
      -1, false,
    );
  }, [pulse, scanLine]);

  const topPad = insets.top + 88;
  const botPad = insets.bottom + 158;
  const usableWidth = Math.max(240, width - 44);
  const usableHeight = Math.max(280, height - topPad - botPad);
  const frameSize = Math.max(220, Math.min(
    Math.max(width * 0.78, 300),
    usableWidth,
    usableHeight * 0.62,
    420
  ));
  const scanLineInset = Math.max(24, Math.round(frameSize * 0.1));
  const scanLineTravel = Math.max(0, frameSize - scanLineInset * 2);

  const frameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLine.value * scanLineTravel }],
    opacity:   isPaused ? 0 : 0.85,
  }), [isPaused, scanLineTravel]);
  const visibleDetections = detections
    .filter((item, i, arr) => arr.findIndex((c) => c.id === item.id) === i)
    .slice(0, 4);
  const hasResult = visibleDetections.length > 0;
  const frameColor = isDetecting
    ? "#00D26A"
    : isPaused
    ? "rgba(255,255,255,0.45)"
    : "rgba(255,255,255,0.90)";
  const guidanceText = isDetecting
    ? DETECTING_MSGS[detectMsgIdx]
    : STATE_TEXT[scanState] ?? TIPS[tipIdx];
  const sourceAspect =
    imageSize?.width && imageSize.height
      ? imageSize.width / imageSize.height
      : width / Math.max(1, height);
  const screenAspect = width / Math.max(1, height);
  // The captured/uploaded image is shown with contentFit="cover" (fills the screen),
  // so map markers onto that same covered rectangle.
  const previewBox =
    sourceAspect > screenAspect
      ? {
          height,
          left: (width - height * sourceAspect) / 2,
          top: 0,
          width: height * sourceAspect,
        }
      : {
          height: width / sourceAspect,
          left: 0,
          top: (height - width / sourceAspect) / 2,
          width,
        };
  const markerBounds = {
    bottom: Math.max(topPad + 120, height - botPad + 64),
    left: 8,
    right: width - 8,
    top: topPad - 28,
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {!hasResult && <View style={styles.vignette} />}
      <View style={[styles.frameZone, { paddingTop: topPad, paddingBottom: botPad }]}>
        {!hasResult && !isPaused && (
          <Animated.View
            style={[
              styles.frameWrap,
              { width: frameSize, height: frameSize },
              hasResult ? undefined : frameStyle,
            ]}
          >
            {!hasResult && (
              <View style={[styles.scanClip, { borderRadius: Math.max(18, frameSize * 0.06) }]}>
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      top: scanLineInset,
                      left: scanLineInset,
                      width: frameSize - scanLineInset * 2,
                    },
                    lineStyle,
                  ]}
                />
              </View>
            )}
            <ScanFrame
              color={hasResult ? "rgba(255,255,255,0.45)" : frameColor}
              glowing={isDetecting && !isPaused && !hasResult}
              size={frameSize}
            />
          </Animated.View>
        )}
        {!hasResult && !isPaused && (
          <Text
            style={[
              styles.guidanceText,
              isDetecting && styles.guidanceDetecting,
            ]}
          >
            {guidanceText}
          </Text>
        )}
      </View>
      {visibleDetections.map((item, index) => (
        <DetectionArrow
          key={`${item.id}-${item.confidence}`}
          bounds={markerBounds}
          box={previewBox}
          index={index}
          item={item}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  frameZone: {
    position:       "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems:     "center",
    justifyContent: "center",
  },
  frameWrap: {
    position: "relative",
  },
  scanClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  scanLine: {
    position:        "absolute",
    height:          2,
    borderRadius:    999,
    backgroundColor: "#00D26A",
    shadowColor:     "#00D26A",
    shadowOpacity:   0.9,
    shadowRadius:    12,
    shadowOffset:    { width: 0, height: 0 },
  },
  guidanceText: {
    color:           "rgba(255,255,255,0.88)",
    fontSize:        13,
    fontFamily:      FONTS.semiBold,
    textAlign:       "center",
    marginTop:       22,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing:   0.2,
  },
  guidanceDetecting: {
    color: "#00D26A",
  },
});
