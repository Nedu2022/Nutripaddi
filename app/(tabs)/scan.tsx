import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowLeft,
  Camera,
  Flashlight,
  FlashlightOff,
  ImagePlus,
  RotateCcw,
  ScanLine,
  X,
} from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import CameraOverlay from "@/components/scan/CameraOverlay";
import DetectionArrow from "@/components/scan/DetectionArrow";
import LiveNutritionSheet from "@/components/scan/LiveNutritionSheet";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import {
  detectFoodFromFrame,
  detectFoodFromImage,
  enrichSummaryWithItems,
  enrichSummaryWithPortion,
} from "@/src/services/foodDetectionService";
import { saveMeal } from "@/src/services/mealHistoryService";
import type {
  DetectedFoodItem,
  DetectedMealPortion,
  DetectedMealSummary,
  FoodDetectionResult,
  ScanState,
} from "@/src/types/detection";
import type { SheetSnap } from "@/components/scan/LiveNutritionSheet";

export default function ScanTab() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const [flashOn, setFlashOn]         = useState(false);
  const [isPaused, setIsPaused]       = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const [scanState, setScanState]     = useState<ScanState>("idle");
  const [detections, setDetections]   = useState<DetectedFoodItem[]>([]);
  const [summary, setSummary]         = useState<DetectedMealSummary | null>(null);
  const [sheetSnap, setSheetSnap]     = useState<SheetSnap>("hidden");
  const [savedTime, setSavedTime]     = useState<string | undefined>();

  // ── PERMISSION HANDLING ─────────────────────────────────────────────────
  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // ── APPLY DETECTION RESULT ───────────────────────────────────────────────
  const applyDetectionResult = useCallback((result: FoodDetectionResult) => {
    if (result.imageQuality === "poor") {
      setScanState("poor_image");
      setDetections([]);
      setSummary(null);
      setSheetSnap("hidden");
      return;
    }
    if (!result.summary) return;

    setScanState((prev) => {
      if (prev === "saved") return prev; // don't overwrite saved state
      const c = result.summary!.confidence;
      return c >= 80 ? "good_match" : "low_confidence";
    });

    setDetections(result.summary.detectedItems);
    setSummary((prev) => {
      if (!prev) {
        setSheetSnap("half");
        return result.summary;
      }
      // Keep user's portion choice; only update detections + confidence
      const updated = enrichSummaryWithItems(prev, result.summary!.detectedItems);
      return { ...updated, portion: prev.portion };
    });
  }, []);

  // ── LIVE DETECTION LOOP ──────────────────────────────────────────────────
  const isSaved = scanState === "saved";
  useEffect(() => {
    if (!permission?.granted || isPaused || capturedUri || isSaved) return;

    setScanState("scanning");
    let cancelled = false;
    let tick = 1;

    const firstDetection = setTimeout(async () => {
      setIsDetecting(true);
      setScanState("detecting");
      const result = await detectFoodFromFrame({ tick });
      if (!cancelled) {
        applyDetectionResult(result);
        setIsDetecting(false);
      }
    }, 2200);

    const liveUpdates = setInterval(async () => {
      if (cancelled) return;
      tick += 1;
      const result = await detectFoodFromFrame({ tick });
      if (!cancelled) applyDetectionResult(result);
    }, 5600);

    return () => {
      cancelled = true;
      clearTimeout(firstDetection);
      clearInterval(liveUpdates);
    };
  }, [applyDetectionResult, capturedUri, isPaused, isSaved, permission?.granted]);

  // ── CAPTURE ──────────────────────────────────────────────────────────────
  const captureImage = async () => {
    setIsCapturing(true);
    setIsPaused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.88,
        skipProcessing: true,
      });
      const uri = photo?.uri ?? "camera-preview";
      setCapturedUri(uri);
      setIsDetecting(true);
      setScanState("detecting");
      const result = await detectFoodFromImage(uri);
      applyDetectionResult(result);
    } catch {
      setScanState("poor_image");
    } finally {
      setIsCapturing(false);
      setIsDetecting(false);
    }
  };

  // ── GALLERY ──────────────────────────────────────────────────────────────
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.88,
    });
    if (!result.canceled) {
      const uri = result.assets[0]?.uri ?? "gallery-preview";
      setCapturedUri(uri);
      setIsPaused(true);
      setIsDetecting(true);
      setScanState("detecting");
      const detection = await detectFoodFromImage(uri);
      applyDetectionResult(detection);
      setIsDetecting(false);
    }
  };

  // ── PORTION CHANGE ────────────────────────────────────────────────────────
  const handlePortionChange = (portion: DetectedMealPortion) => {
    if (!summary) return;
    setSummary(enrichSummaryWithPortion(summary, portion));
  };

  // ── FOOD CORRECTION ───────────────────────────────────────────────────────
  const handleFoodCorrection = (label: string) => {
    if (!summary) return;
    const updatedItems: DetectedFoodItem[] = summary.detectedItems.map((item) =>
      item.type === "swallow" ? { ...item, label, confidence: 95 } : item
    );
    setSummary(enrichSummaryWithItems(summary, updatedItems));
    setScanState("good_match");
  };

  // ── SAVE MEAL ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!summary) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const saved = await saveMeal({
      mealName:     summary.mealName,
      calories:     summary.nutrition.calories,
      carbs:        summary.nutrition.carbs,
      protein:      summary.nutrition.protein,
      fat:          summary.nutrition.fat,
      fibre:        summary.nutrition.fibre,
      portionLabel: summary.localPortionLabel,
    });
    setSavedTime(saved.timeLogged);
    setScanState("saved");
    setSheetSnap("collapsed");
  };

  // ── RESET ─────────────────────────────────────────────────────────────────
  const resetScan = () => {
    setCapturedUri(null);
    setDetections([]);
    setSummary(null);
    setScanState("idle");
    setSheetSnap("hidden");
    setIsPaused(false);
    setIsDetecting(false);
    setSavedTime(undefined);
  };


  // ── STATUS TEXT ───────────────────────────────────────────────────────────
  const statusText: Record<ScanState, string> = {
    idle:            "Point your camera at your meal",
    scanning:        "Scanning…",
    detecting:       "We are seeing some food…",
    good_match:      "We found your meal",
    low_confidence:  "We are not fully sure — please confirm",
    poor_image:      "We cannot see the meal clearly",
    nutrition_ready: "Nutrition estimate ready",
    saved:           "Meal saved to your history",
    offline:         "Offline mode — using local food data",
  };

  // ── PERMISSION SCREEN ─────────────────────────────────────────────────────
  if (!permission?.granted) {
    return (
      <View style={styles.fallbackContainer}>
        <View style={styles.permissionIcon}>
          <ScanLine color={COLORS.primary} size={36} />
        </View>
        <Text style={styles.fallbackTitle}>{t.cameraNeeded}</Text>
        <Text style={styles.fallbackSubtitle}>
          Camera access lets NutriPadi recognise your meal from a clear photo.
        </Text>
        <CustomButton onPress={requestPermission} title={t.grantPermission} />
      </View>
    );
  }

  const cameraActive = !capturedUri || capturedUri.includes("preview");

  return (
    <View style={styles.container}>

      {/* ── CAMERA / FROZEN FRAME ──────────────────────────────────────── */}
      {!cameraActive ? (
        <Image
          contentFit="cover"
          source={{ uri: capturedUri! }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <CameraView
          ref={cameraRef}
          enableTorch={flashOn}
          facing="back"
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* ── DETECTION OVERLAY ─────────────────────────────────────────── */}
      <CameraOverlay
        detections={detections}
        isDetecting={isDetecting || isCapturing}
        isPaused={isPaused}
      />

      {/* ── DETECTION ARROWS ──────────────────────────────────────────── */}
      {detections.slice(0, 4).map((item, index) => (
        <DetectionArrow
          key={`${item.id}-${item.confidence}`}
          frameHeight={600}
          frameWidth={390}
          index={index}
          item={item}
        />
      ))}

      {/* ── TOP BAR ───────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft color={COLORS.white} size={20} />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Scan your meal</Text>
          <Text style={styles.subtitle}>Point your camera at the food</Text>
        </View>
        <Pressable
          onPress={() => router.replace(ROUTES.tabs)}
          style={styles.iconButton}
        >
          <X color={COLORS.white} size={20} />
        </Pressable>
      </View>

      {/* ── TOOL ROW (flash / pause / gallery) ────────────────────────── */}
      <Animated.View
        entering={FadeInUp.delay(160).duration(420)}
        style={[styles.toolRow, { top: insets.top + 82 }]}
      >
        <Pressable
          onPress={() => setFlashOn((f) => !f)}
          style={styles.toolButton}
        >
          {flashOn ? (
            <FlashlightOff color={COLORS.white} size={17} />
          ) : (
            <Flashlight color={COLORS.white} size={17} />
          )}
          <Text style={styles.toolText}>{flashOn ? "Flash off" : "Flash"}</Text>
        </Pressable>
        <Pressable onPress={pickImage} style={styles.toolButton}>
          <ImagePlus color={COLORS.white} size={17} />
          <Text style={styles.toolText}>Gallery</Text>
        </Pressable>
      </Animated.View>

      {/* ── SCAN STATUS PILL ──────────────────────────────────────────── */}
      {scanState !== "good_match" && scanState !== "low_confidence" && (
        <View style={[styles.statusPillBottom, { bottom: sheetSnap === "hidden" ? insets.bottom + 130 : 0 }]}>
          {scanState !== "idle" && (
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{statusText[scanState]}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── POOR IMAGE STATE ──────────────────────────────────────────── */}
      {scanState === "poor_image" && (
        <View style={[styles.poorImageCard, { bottom: insets.bottom + 120 }]}>
          <Text style={styles.poorImageTitle}>
            We cannot see the meal clearly
          </Text>
          <Text style={styles.poorImageSub}>
            Try better lighting or move the camera closer.
          </Text>
          <Pressable onPress={resetScan} style={styles.poorImageButton}>
            <RotateCcw color={COLORS.white} size={15} />
            <Text style={styles.poorImageButtonText}>Try again</Text>
          </Pressable>
        </View>
      )}

      {/* ── CAPTURE DOCK ──────────────────────────────────────────────── */}
      {scanState !== "poor_image" && scanState !== "saved" && (
        <Animated.View
          entering={FadeInDown.delay(260).duration(420)}
          style={[
            styles.captureDock,
            {
              bottom:
                sheetSnap === "half" || sheetSnap === "full"
                  ? "auto"
                  : insets.bottom + 30,
              top:
                sheetSnap === "half" || sheetSnap === "full"
                  ? insets.top + 82
                  : "auto",
            },
          ]}
        >
          {(summary || capturedUri) && (
            <Pressable onPress={resetScan} style={styles.retakeButton}>
              <RotateCcw color={COLORS.white} size={17} />
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>
          )}
          {sheetSnap === "hidden" || sheetSnap === "collapsed" ? (
            <Pressable
              disabled={isCapturing}
              onPress={captureImage}
              style={({ pressed }) => [
                styles.captureButton,
                pressed && styles.capturePressed,
                isCapturing && styles.captureDisabled,
              ]}
            >
              {isCapturing ? (
                <ScanLine color={COLORS.secondary} size={30} />
              ) : (
                <Camera color={COLORS.secondary} size={30} />
              )}
            </Pressable>
          ) : null}
        </Animated.View>
      )}

      {/* ── LIVE NUTRITION SHEET ──────────────────────────────────────── */}
      <LiveNutritionSheet
        summary={summary}
        scanState={scanState}
        snap={sheetSnap}
        onSnapChange={setSheetSnap}
        onPortionChange={handlePortionChange}
        onFoodCorrection={handleFoodCorrection}
        onSave={handleSave}
        onClear={resetScan}
        savedMealTime={savedTime}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: 24,
  },
  permissionIcon: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  fallbackTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontFamily: FONTS.bold,
    marginBottom: 8,
    textAlign: "center",
  },
  fallbackSubtitle: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontFamily: FONTS.regular,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  topBar: {
    position: "absolute",
    left: 18,
    right: 18,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.52)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    color: COLORS.white,
    fontSize: 17,
    fontFamily: FONTS.extraBold,
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
  toolRow: {
    position: "absolute",
    left: 18,
    right: 18,
    zIndex: 18,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  toolButton: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.46)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 14,
  },
  toolText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  statusPillBottom: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 18,
  },
  statusPill: {
    backgroundColor: "rgba(0,0,0,0.64)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  poorImageCard: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.80)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    zIndex: 25,
  },
  poorImageTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
    textAlign: "center",
    marginBottom: 6,
  },
  poorImageSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: FONTS.medium,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  poorImageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  poorImageButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  captureDock: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 16,
  },
  captureButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.36)",
  },
  capturePressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  captureDisabled: {
    opacity: 0.72,
  },
  retakeButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 14,
  },
  retakeText: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
});
