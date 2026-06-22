import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
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
import WebCameraView, { type WebCameraHandle } from "@/components/scan/WebCameraView";
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
  FoodCorrectionOption,
  FoodDetectionResult,
  ScanState,
} from "@/src/types/detection";
import type { SheetSnap } from "@/components/scan/LiveNutritionSheet";
const DETECT_TIMEOUT_MS = 12000;
const LIVE_SCAN_INTERVAL_MS = 3600;
const MIN_LIVE_SCAN_GAP_MS = 2600;
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

function readPictureSize(size: string) {
  const [width, height] = size.split("x").map((part) => Number(part));
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  return { height, size, width };
}

function chooseSharpPictureSize(sizes: string[]) {
  const parsed = sizes
    .map(readPictureSize)
    .filter((size): size is { height: number; size: string; width: number } => !!size)
    .sort((a, b) => a.width * a.height - b.width * b.height);
  return (
    parsed.find((item) => Math.max(item.width, item.height) >= 1920)?.size ??
    parsed[parsed.length - 1]?.size
  );
}

export default function ScanTab() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const nativeCameraRef = useRef<CameraView | null>(null);
  const webCameraRef = useRef<WebCameraHandle | null>(null);
  const [flashOn, setFlashOn]         = useState(false);
  const [facing, setFacing]           = useState<"back" | "front">("back");
  const [cameraReady, setCameraReady] = useState(false);
  const [pictureSize, setPictureSize] = useState<string | undefined>();
  const [isPaused, setIsPaused]       = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [sourceImageSize, setSourceImageSize] = useState<{ width: number; height: number } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [scanState, setScanState]   = useState<ScanState>("idle");
  const [detections, setDetections] = useState<DetectedFoodItem[]>([]);
  const [summary, setSummary]       = useState<DetectedMealSummary | null>(null);
  const [sheetSnap, setSheetSnap]   = useState<SheetSnap>("hidden");
  const [savedTime, setSavedTime]   = useState<string | undefined>();
  const [isSaving, setIsSaving]     = useState(false);
  const [saveError, setSaveError]   = useState<string | undefined>();
  const [scanMisses, setScanMisses] = useState(0);
  const liveScanInFlightRef = useRef(false);
  const lastLiveScanAtRef = useRef(0);
  const isSaved = scanState === "saved";
  const getCamera = useCallback(
    () => (Platform.OS === "web" ? webCameraRef.current : nativeCameraRef.current),
    []
  );

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) requestPermission();
  }, [permission, requestPermission]);
  const reportNoFood = useCallback((options?: { keepScanning?: boolean; silent?: boolean }) => {
    setDetections([]);
    setSummary(null);
    setSourceImageSize(null);
    setSheetSnap("hidden");
    setScanMisses((count) => (options?.keepScanning ? count + 1 : count));
    setScanState((prev) => {
      if (prev === "saved") return prev;
      return options?.keepScanning ? "scanning" : "no_food";
    });
    if (!options?.silent) speak("No food detected");
  }, []);
  const applyDetectionResult = useCallback((
    result: FoodDetectionResult,
    options?: { keepScanningOnMiss?: boolean; silentMiss?: boolean }
  ) => {
    if (result.imageQuality === "poor" || !result.summary) {
      reportNoFood({
        keepScanning: options?.keepScanningOnMiss,
        silent: options?.silentMiss,
      });
      return false;
    }
    setIsPaused(true);
    setScanMisses(0);
    setSaveError(undefined);
    setScanState((prev) => {
      if (prev === "saved") return prev;
      return result.summary!.confidence >= 80 ? "good_match" : "low_confidence";
    });
    setDetections(result.summary.detectedItems);
    setSummary(result.summary);
    setSheetSnap("half");
    return true;
  }, [reportNoFood]);
  const handleCameraReady = useCallback(async () => {
    setCameraReady(true);
    try {
      const sizes = await getCamera()?.getAvailablePictureSizesAsync();
      const sharpSize = chooseSharpPictureSize(sizes ?? []);
      if (sharpSize) setPictureSize(sharpSize);
    } catch {
    }
  }, [getCamera]);
  const scanCameraFrame = useCallback(async (force = false) => {
    if (
      !permission?.granted ||
      !cameraReady ||
      !getCamera() ||
      liveScanInFlightRef.current ||
      isPaused ||
      capturedUri ||
      isSaved
    ) {
      return;
    }

    const now = Date.now();
    if (!force && now - lastLiveScanAtRef.current < MIN_LIVE_SCAN_GAP_MS) return;

    liveScanInFlightRef.current = true;
    lastLiveScanAtRef.current = now;
    setIsCapturing(true);
    setIsDetecting(true);
    setScanState("detecting");

    try {
      const photo = await getCamera()?.takePictureAsync({
        exif: false,
        imageType: "jpg",
        quality: 1,
        scale: Platform.OS === "web" ? 1 : undefined,
        skipProcessing: false,
      });
      const uri = photo?.uri;
      if (!uri) {
        setScanState("scanning");
        return;
      }
      const result = await withTimeout(detectFoodFromImage(uri), DETECT_TIMEOUT_MS);
      const accepted = applyDetectionResult(result, {
        keepScanningOnMiss: true,
        silentMiss: true,
      });
      if (accepted) {
        setCapturedUri(uri);
        if (photo?.width && photo?.height) {
          setSourceImageSize({ width: photo.width, height: photo.height });
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setScanState("scanning");
    } finally {
      setIsCapturing(false);
      setIsDetecting(false);
      liveScanInFlightRef.current = false;
    }
  }, [
    applyDetectionResult,
    cameraReady,
    capturedUri,
    isPaused,
    isSaved,
    permission?.granted,
    getCamera,
  ]);
  useEffect(() => {
    if (!permission?.granted || isPaused || capturedUri || isSaved) return;
    setScanState("scanning");
  }, [capturedUri, isPaused, isSaved, permission?.granted]);
  useEffect(() => {
    if (!permission?.granted || !cameraReady || isPaused || capturedUri || isSaved) return;
    scanCameraFrame(false);
    const timer = setInterval(() => scanCameraFrame(false), LIVE_SCAN_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [
    cameraReady,
    capturedUri,
    isPaused,
    isSaved,
    permission?.granted,
    scanCameraFrame,
  ]);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const uri = asset?.uri ?? "gallery-preview";
      setCapturedUri(uri);
      setSourceImageSize(
        asset?.width && asset.height
          ? { width: asset.width, height: asset.height }
          : null
      );
      setIsPaused(true);
      setIsDetecting(true);
      setSaveError(undefined);
      setScanMisses(0);
      setScanState("detecting");
      try {
        const detection = await withTimeout(
          detectFoodFromImage(uri),
          DETECT_TIMEOUT_MS
        );
        applyDetectionResult(detection);
      } catch {
        setScanState("poor_image");
      } finally {
        setIsDetecting(false);
      }
    }
  };
  const handleScanNow = () => {
    if (isDetecting || isCapturing || !cameraActive || isPaused || isSaved) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scanCameraFrame(true);
  };
  const flipCamera = () => {
    if (capturedUri) return;
    setCameraReady(false);
    setPictureSize(undefined);
    setFacing((f) => (f === "back" ? "front" : "back"));
  };
  const handleFoodCorrection = (option: FoodCorrectionOption) => {
    if (!summary) return;
    setSaveError(undefined);
    const targetIndex = summary.detectedItems.findIndex((item) => item.confidence < 70);
    const correctionIndex = targetIndex >= 0 ? targetIndex : 0;
    const updatedItems: DetectedFoodItem[] = summary.detectedItems.map((item, index) =>
      index === correctionIndex
        ? { ...item, label: option.label, type: option.type ?? item.type, confidence: 95 }
        : item
    );
    setSummary({
      ...summary,
      detectedItems: updatedItems,
      mealName: correctionIndex === 0 ? option.label : summary.mealName,
    });
    setScanState("good_match");
  };
  const handleSave = async () => {
    if (!summary || isSaving) return;
    setIsSaving(true);
    setSaveError(undefined);
    try {
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSavedTime(saved.timeLogged);
      setScanState("saved");
      setSheetSnap("collapsed");
    } catch {
      setSaveError("Could not save this meal. Check your connection and try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };
  const resetScan = () => {
    const hadCapture = !!capturedUri;
    setCapturedUri(null);
    setSourceImageSize(null);
    if (hadCapture) {
      setCameraReady(false);
      setPictureSize(undefined);
    }
    setDetections([]);
    setSummary(null);
    setScanState("idle");
    setSheetSnap("hidden");
    setIsPaused(false);
    setIsDetecting(false);
    setIsSaving(false);
    setSaveError(undefined);
    setScanMisses(0);
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
          Camera access lets NutriPadi scan your meal from a clear live view.
        </Text>
        <CustomButton onPress={requestPermission} title={t.grantPermission} />
      </View>
    );
  }
  const cameraActive    = !capturedUri;
  const showCaptureDock = (sheetSnap === "hidden" || sheetSnap === "collapsed") && scanState !== "saved";
  const hasCapture      = !!(summary || capturedUri);
  const scanActive      = cameraActive && !isPaused && !isSaved;
  const waitingLong     = scanMisses >= 2 && scanState === "scanning";
  return (
    <View style={styles.container}>
      {!cameraActive ? (
        <Image
          contentFit="cover"
          source={{ uri: capturedUri! }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        Platform.OS === "web" ? (
          <WebCameraView
            ref={webCameraRef}
            active={scanActive}
            enableTorch={flashOn}
            facing={facing}
            onCameraReady={handleCameraReady}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <CameraView
            ref={nativeCameraRef}
            active={scanActive}
            animateShutter={false}
            autofocus="on"
            enableTorch={flashOn}
            facing={facing}
            mode="picture"
            onCameraReady={handleCameraReady}
            pictureSize={pictureSize}
            responsiveOrientationWhenOrientationLocked
            style={StyleSheet.absoluteFillObject}
          />
        )
      )}
      <CameraOverlay
        detections={detections}
        imageSize={sourceImageSize}
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
        <Text style={styles.topTitle}>Live meal scan</Text>
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
                : "Couldn't read that"}
            </Text>
            <Text style={styles.poorSub}>
              {scanState === "no_food"
                ? "Point the camera at a meal and try again."
                : "Hold steady in good light, then try again."}
            </Text>
          </View>
          <Pressable onPress={resetScan} style={styles.poorRetryBtn}>
            <RotateCcw color="#FFFFFF" size={16} />
          </Pressable>
        </View>
      )}
      {waitingLong && (
        <View style={[styles.scanHelpCard, { bottom: insets.bottom + 134 }]}>
          <Text style={styles.scanHelpTitle}>Still looking</Text>
          <Text style={styles.scanHelpText}>Move closer, fill the frame, or tap the center button.</Text>
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
            accessibilityLabel="Scan now"
            disabled={isDetecting || isCapturing || !cameraActive || isPaused}
            onPress={handleScanNow}
            style={[styles.liveScanRing, (isDetecting || isCapturing) && styles.liveScanRingActive]}
          >
            {isDetecting || isCapturing ? (
              <ActivityIndicator color="#00D26A" size="large" />
            ) : (
              <ScanLine color="rgba(255,255,255,0.94)" size={34} />
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
        isSaving={isSaving}
        saveError={saveError}
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
  scanHelpCard: {
    position:        "absolute",
    left:            24,
    right:           24,
    zIndex:          24,
    alignItems:      "center",
    backgroundColor: "rgba(0,0,0,0.68)",
    borderRadius:    16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth:     1,
    borderColor:     "rgba(255,255,255,0.12)",
  },
  scanHelpTitle: {
    color:      "#FFFFFF",
    fontSize:   13,
    fontFamily: FONTS.bold,
    marginBottom: 3,
  },
  scanHelpText: {
    color:      "rgba(255,255,255,0.70)",
    fontSize:   12,
    fontFamily: FONTS.medium,
    textAlign:  "center",
    lineHeight: 17,
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
  liveScanRing: {
    width:           90,
    height:          90,
    borderRadius:    45,
    borderWidth:     4,
    borderColor:     "rgba(255,255,255,0.90)",
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: "rgba(0,0,0,0.24)",
  },
  liveScanRingActive: {
    borderColor:     "#00D26A",
    backgroundColor: "rgba(0, 210, 106, 0.10)",
    shadowColor:     "#00D26A",
    shadowOpacity:   0.45,
    shadowRadius:    14,
    shadowOffset:    { width: 0, height: 0 },
  },
});
