import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowLeft,
  Flashlight,
  FlashlightOff,
  ImagePlus,
  RefreshCw,
  RotateCcw,
  ScanLine,
} from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import CameraOverlay from "@/components/scan/CameraOverlay";
import LiveNutritionSheet from "@/components/scan/LiveNutritionSheet";
import { FONTS } from "@/constants/fonts";
import { useLanguage } from "@/hooks/useLanguage";
import {
  detectFoodFromImage,
} from "@/src/services/foodDetectionService";
import { saveMeal } from "@/src/services/mealHistoryService";
import { speak } from "@/src/services/speechService";
import { uploadImage } from "@/src/services/uploadService";
import type {
  DetectedFoodItem,
  DetectedMealSummary,
  FoodDetectionResult,
  ScanState,
} from "@/src/types/detection";
import type { SheetSnap } from "@/components/scan/LiveNutritionSheet";
const DETECT_TIMEOUT_MS = 5000;
class DetectTimeoutError extends Error {}
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new DetectTimeoutError("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
export default function ScanTab() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [flashOn, setFlashOn]         = useState(false);
  const [facing, setFacing]           = useState<"back" | "front">("back");
  const [isPaused, setIsPaused]       = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [scanState, setScanState]   = useState<ScanState>("idle");
  const [detections, setDetections] = useState<DetectedFoodItem[]>([]);
  const [summary, setSummary]       = useState<DetectedMealSummary | null>(null);
  const [sheetSnap, setSheetSnap]   = useState<SheetSnap>("hidden");
  const [savedTime, setSavedTime]   = useState<string | undefined>();
  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) requestPermission();
  }, [permission, requestPermission]);
  const reportNoFood = useCallback(() => {
    setDetections([]);
    setSummary(null);
    setSheetSnap("hidden");
    setScanState((prev) => (prev === "saved" ? prev : "no_food"));
    speak("No food detected");
  }, []);
  const applyDetectionResult = useCallback((result: FoodDetectionResult) => {
    if (result.imageQuality === "poor" || !result.summary) {
      reportNoFood();
      return;
    }
    setIsPaused(true);
    setScanState((prev) => {
      if (prev === "saved") return prev;
      return result.summary!.confidence >= 80 ? "good_match" : "low_confidence";
    });
    setDetections(result.summary.detectedItems);
    setSummary((prev) => {
      if (!prev) {
        setSheetSnap("half");
        return result.summary;
      }
      return {
        ...prev,
        detectedItems: result.summary!.detectedItems,
        mealName: result.summary!.mealName,
      };
    });
  }, [reportNoFood]);
  const isSaved = scanState === "saved";
  useEffect(() => {
    if (!permission?.granted || isPaused || capturedUri || isSaved) return;
    setScanState("scanning");
  }, [capturedUri, isPaused, isSaved, permission?.granted]);
  const captureImage = async () => {
    setIsCapturing(true);
    setIsPaused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let uri: string;
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.88,
        skipProcessing: true,
      });
      uri = photo?.uri ?? "camera-preview";
    } catch {
      setIsCapturing(false);
      setScanState("poor_image");
      return;
    }
    setCapturedUri(uri);
    setIsDetecting(true);
    setScanState("detecting");
    try {
      const result = await withTimeout(detectFoodFromImage(uri), DETECT_TIMEOUT_MS);
      applyDetectionResult(result);
    } catch {
      reportNoFood();
    } finally {
      setIsCapturing(false);
      setIsDetecting(false);
    }
  };
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
      try {
        const detection = await withTimeout(
          detectFoodFromImage(uri),
          DETECT_TIMEOUT_MS
        );
        applyDetectionResult(detection);
      } catch {
        reportNoFood();
      } finally {
        setIsDetecting(false);
      }
    }
  };
  const flipCamera = () => {
    if (capturedUri) return;
    setFacing((f) => (f === "back" ? "front" : "back"));
  };
  const handleFoodCorrection = (label: string) => {
    if (!summary) return;
    const updatedItems: DetectedFoodItem[] = summary.detectedItems.map((item) =>
      item.type === "swallow" ? { ...item, label, confidence: 95 } : item
    );
    setSummary({ ...summary, detectedItems: updatedItems });
    setScanState("good_match");
  };
  const handleSave = async () => {
    if (!summary) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const uploadedImage =
      capturedUri && !capturedUri.includes("preview")
        ? await uploadImage({ folder: "meals", uri: capturedUri })
        : null;
    const saved = await saveMeal({
      mealName:       summary.mealName,
      calories:       summary.nutrition.calories,
      carbs:          summary.nutrition.carbs,
      protein:        summary.nutrition.protein,
      fat:            summary.nutrition.fat,
      fibre:          summary.nutrition.fibre,
      freshnessScore: summary.freshness.score,
      freshnessLabel: summary.freshness.label,
      portionLabel:   summary.localPortionLabel,
      imageUri:       uploadedImage?.secureUrl ?? uploadedImage?.url,
      aiObservation:  summary.advice,
    });
    setSavedTime(saved.timeLogged);
    setScanState("saved");
    setSheetSnap("collapsed");
  };
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
  if (!permission?.granted) {
    return (
      <View style={styles.fallback}>
        <View style={styles.permIcon}>
          <ScanLine color="#00B85A" size={36} />
        </View>
        <Text style={styles.permTitle}>{t.cameraNeeded}</Text>
        <Text style={styles.permSub}>
          Camera access lets NutriPadi recognise your meal from a clear photo.
        </Text>
        <CustomButton onPress={requestPermission} title={t.grantPermission} />
      </View>
    );
  }
  const cameraActive    = !capturedUri || capturedUri.includes("preview");
  const showCaptureDock = (sheetSnap === "hidden" || sheetSnap === "collapsed") && scanState !== "saved";
  const hasCapture      = !!(summary || capturedUri);
  return (
    <View style={styles.container}>
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
          facing={facing}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <CameraOverlay
        detections={detections}
        isDetecting={isDetecting || isCapturing}
        isPaused={isPaused}
        scanState={scanState}
      />
      <Animated.View
        entering={FadeInDown.duration(380)}
        style={[styles.topBar, { paddingTop: insets.top + 12 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.topBtn}>
          <ArrowLeft color="rgba(255,255,255,0.92)" size={20} />
        </Pressable>
        <Text style={styles.topTitle}>Scan your meal</Text>
        <Pressable
          onPress={() => setFlashOn((f) => !f)}
          style={[styles.topBtn, flashOn && styles.topBtnFlashOn]}
        >
          {flashOn
            ? <FlashlightOff color="#FFD60A" size={20} />
            : <Flashlight    color="rgba(255,255,255,0.92)" size={20} />}
        </Pressable>
      </Animated.View>
      {(scanState === "poor_image" || scanState === "no_food") && (
        <View style={[styles.poorCard, { bottom: insets.bottom + 162 }]}>
          <View style={styles.poorIconCircle}>
            <ScanLine color="#FFBB33" size={18} />
          </View>
          <View style={styles.poorBody}>
            <Text style={styles.poorTitle}>
              {scanState === "no_food"
                ? "No food detected"
                : "Can't see the food clearly"}
            </Text>
            <Text style={styles.poorSub}>
              {scanState === "no_food"
                ? "Point the camera at a meal and try again."
                : "Try better lighting or move closer."}
            </Text>
          </View>
          <Pressable onPress={resetScan} style={styles.poorRetryBtn}>
            <RotateCcw color="#FFFFFF" size={16} />
          </Pressable>
        </View>
      )}
      {showCaptureDock && (
        <Animated.View
          entering={FadeInUp.delay(220).duration(400)}
          style={[styles.captureDock, { bottom: insets.bottom + 28 }]}
        >
          <Pressable
            onPress={hasCapture ? resetScan : pickImage}
            style={styles.sideBtn}
          >
            {hasCapture
              ? <RotateCcw color="rgba(255,255,255,0.92)" size={22} />
              : <ImagePlus  color="rgba(255,255,255,0.92)" size={22} />}
          </Pressable>
          <Pressable
            disabled={isCapturing}
            onPress={captureImage}
            style={[styles.captureRing, isCapturing && { opacity: 0.72 }]}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.captureDisc,
                  (pressed || isCapturing) && styles.captureDiscPressed,
                ]}
              />
            )}
          </Pressable>
          <Pressable
            onPress={flipCamera}
            disabled={!!capturedUri}
            style={[styles.sideBtn, capturedUri ? styles.sideBtnOff : null]}
          >
            <RefreshCw
              color={capturedUri ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.92)"}
              size={22}
            />
          </Pressable>
        </Animated.View>
      )}
      <LiveNutritionSheet
        summary={summary}
        scanState={scanState}
        snap={sheetSnap}
        onSnapChange={setSheetSnap}
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
    backgroundColor: "#000",
  },
  fallback: {
    flex:            1,
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: "#F5F6FA",
    padding:         24,
  },
  permIcon: {
    width:           92,
    height:          92,
    borderRadius:    28,
    backgroundColor: "rgba(0,184,90,0.09)",
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    20,
  },
  permTitle: {
    color:        "#0A0A0A",
    fontSize:     22,
    fontFamily:   FONTS.bold,
    marginBottom: 8,
    textAlign:    "center",
  },
  permSub: {
    color:        "#6B7280",
    fontSize:     15,
    fontFamily:   FONTS.regular,
    lineHeight:   22,
    marginBottom: 24,
    textAlign:    "center",
  },
  topBar: {
    position:       "absolute",
    left:           18,
    right:          18,
    zIndex:         20,
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
  },
  topBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: "rgba(0,0,0,0.48)",
    alignItems:      "center",
    justifyContent:  "center",
  },
  topBtnFlashOn: {
    backgroundColor: "rgba(255,214,10,0.18)",
  },
  topTitle: {
    color:            "rgba(255,255,255,0.92)",
    fontSize:         16,
    fontFamily:       FONTS.extraBold,
    textShadowColor:  "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  poorCard: {
    position:        "absolute",
    left:            22,
    right:           22,
    flexDirection:   "row",
    alignItems:      "center",
    gap:             12,
    backgroundColor: "rgba(0,0,0,0.84)",
    borderRadius:    20,
    padding:         16,
    borderWidth:     1,
    borderColor:     "rgba(255,175,0,0.22)",
    zIndex:          25,
  },
  poorIconCircle: {
    width:           42,
    height:          42,
    borderRadius:    13,
    backgroundColor: "rgba(255,187,51,0.18)",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
  },
  poorBody: { flex: 1 },
  poorTitle: {
    color:        "#FFFFFF",
    fontSize:     14,
    fontFamily:   FONTS.bold,
    marginBottom: 3,
  },
  poorSub: {
    color:      "rgba(255,255,255,0.62)",
    fontSize:   12,
    fontFamily: FONTS.medium,
    lineHeight: 17,
  },
  poorRetryBtn: {
    width:           40,
    height:          40,
    borderRadius:    12,
    backgroundColor: "#00B85A",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
    shadowColor:     "#00B85A",
    shadowOpacity:   0.4,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       4,
  },
  captureDock: {
    position:       "absolute",
    left:           0,
    right:          0,
    zIndex:         22,
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            28,
  },
  sideBtn: {
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: "rgba(0,0,0,0.44)",
    alignItems:      "center",
    justifyContent:  "center",
  },
  sideBtnOff: {
    opacity: 0.45,
  },
  captureRing: {
    width:           90,
    height:          90,
    borderRadius:    45,
    borderWidth:     4,
    borderColor:     "rgba(255,255,255,0.90)",
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: "transparent",
  },
  captureDisc: {
    width:           74,
    height:          74,
    borderRadius:    37,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  captureDiscPressed: {
    transform:       [{ scale: 0.88 }],
    backgroundColor: "rgba(255,255,255,0.65)",
  },
});