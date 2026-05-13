import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { ImagePlus, ScanLine } from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";

import ScanFrame from "@/components/ScanFrame";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { NIGERIAN_FOODS } from "@/data/foods";

const DETECTED_FOOD = NIGERIAN_FOODS.find((f) => f.id === "8")!;

export default function ScanTab() {
  const { t } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const scanPulse = useSharedValue(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    scanPulse.value = withRepeat(
      withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [scanPulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanPulse.value }],
  }));

  const triggerScanAnalysis = () => {
    setScanning(true);
    timerRef.current = setTimeout(() => {
      setScanning(false);
      router.push(ROUTES.analyzing);
    }, 2500);
  };

  const handleScan = () => {
    triggerScanAnalysis();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      triggerScanAnalysis();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>{t.cameraNeeded}</Text>
        <Text style={styles.fallbackSubtitle}>{t.cameraNeededText}</Text>
        <Pressable style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>{t.grantPermission}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="back">
        <View style={styles.overlay}>
          <Animated.View entering={FadeInUp.duration(400)} style={styles.topSection}>
            <Text style={styles.title}>{t.scanTitle}</Text>
            <Text style={styles.subtitle}>{t.scanSubtitle}</Text>
          </Animated.View>

          <View style={styles.frameContainer}>
            <ScanFrame />
            {scanning && (
              <View style={styles.scanActiveOverlay}>
                <Animated.View style={[styles.scanPulse, pulseStyle]}>
                  <ScanLine color={COLORS.white} size={48} strokeWidth={1.5} />
                </Animated.View>
                <Text style={styles.scanningText}>Scanning...</Text>

                {/* AR Identifying Tags */}
                <Animated.View entering={ZoomIn.delay(300).springify()} style={[styles.arLabelWrapper, { top: 40, left: 20 }]}>
                  <View style={styles.arLabelBox}>
                    <Text style={styles.arLabelText}>Carbs ({DETECTED_FOOD.ingredients[0] || 'Rice'})</Text>
                  </View>
                  <View style={styles.arLine} />
                  <View style={styles.arDot} />
                </Animated.View>

                <Animated.View entering={ZoomIn.delay(800).springify()} style={[styles.arLabelWrapper, { bottom: 50, right: 30 }]}>
                  <View style={styles.arDot} />
                  <View style={styles.arLine} />
                  <View style={styles.arLabelBox}>
                    <Text style={styles.arLabelText}>Protein ({DETECTED_FOOD.ingredients.find(i => i.toLowerCase().includes('meat') || i.toLowerCase().includes('chicken') || i.toLowerCase().includes('fish') || i.toLowerCase().includes('beef')) || 'Chicken'})</Text>
                  </View>
                </Animated.View>

                <Animated.View entering={ZoomIn.delay(1300).springify()} style={[{ position: 'absolute', top: 90, right: 10, flexDirection: 'row', alignItems: "center" }]}>
                  <View style={styles.arLabelBox}>
                    <Text style={styles.arLabelText}>Vitamins ({DETECTED_FOOD.ingredients.find(i => i.toLowerCase().includes('vegetable') || i.toLowerCase().includes('tomato') || i.toLowerCase().includes('pepper') || i.toLowerCase().includes('onion')) || 'Vegetables'})</Text>
                  </View>
                  <View style={[styles.arLine, { width: 20, height: 2 }]} />
                  <View style={styles.arDot} />
                </Animated.View>

              </View>
            )}
          </View>

          <View style={styles.bottomSection}>
            <Pressable
              style={({ pressed }) => [
                styles.scanButton,
                pressed && styles.scanButtonPressed,
                scanning && styles.scanButtonDisabled
              ]}
              onPress={handleScan}
              disabled={scanning}
            >
              <ScanLine color={COLORS.secondary} size={32} />
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [
                styles.galleryButton,
                pressed && styles.galleryButtonPressed
              ]}
              onPress={pickImage}
            >
              <ImagePlus color={COLORS.white} size={20} />
              <Text style={styles.galleryButtonText}>{t.uploadImage}</Text>
            </Pressable>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: 24,
  },
  fallbackTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 8,
  },
  fallbackSubtitle: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  grantButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  grantButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 40,
  },
  topSection: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontFamily: FONTS.extraBold,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontFamily: FONTS.medium,
    marginTop: 8,
    textAlign: "center",
  },
  frameContainer: {
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
  },
  scanActiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 122, 63, 0.4)",
    borderRadius: 24,
    maxWidth: 320,
    maxHeight: 320,
    alignSelf: "center",
  },
  scanPulse: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scanningText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginTop: 14,
  },
  bottomSection: {
    alignItems: "center",
    gap: 32,
  },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  scanButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  galleryButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  galleryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  arLabelWrapper: {
    position: "absolute",
    alignItems: "center",
  },
  arDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  arLine: {
    width: 2,
    height: 25,
    backgroundColor: COLORS.white,
    opacity: 0.8,
  },
  arLabelBox: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  arLabelText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
});
