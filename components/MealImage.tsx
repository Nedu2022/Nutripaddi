/**
 * MealImage — production-grade food photo component for list cards
 *
 * Features:
 *  • Animated shimmer placeholder while the image is in-flight.
 *  • Smooth 280 ms fade-in via expo-image's built-in transition.
 *  • Dedicated fallback view when the image fails (initial letter + retry).
 *  • Fixed dimensions so FlatList layout never jumps.
 *  • expo-image disk+memory cache (contentFit="cover" + cachePolicy).
 *
 * Props:
 *  • uri          — the remote image URL (thumbnailUrl from the API)
 *  • fallbackName — text used to derive the initial letter fallback
 *  • mealType     — used to colour the fallback bubble
 *  • size         — width/height of the square image area (default 48)
 *  • radius       — border-radius (default 13)
 */

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image, type ImageContentFit } from "expo-image";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { RotateCcw } from "lucide-react-native";

import type { MealType } from "@/types";
import { FONTS } from "@/constants/fonts";

// ── Per-meal-type fallback palette ─────────────────────────────────────────────
const PALETTE: Record<MealType, { bg: string; text: string }> = {
  Breakfast: { bg: "#FFF0E6", text: "#FF8C42" },
  Lunch:     { bg: "#E8F5EB", text: "#008000" },
  Dinner:    { bg: "#EEEBFF", text: "#6366F1" },
  Snack:     { bg: "#FEF3C7", text: "#F59E0B" },
};
const FALLBACK_DEFAULT = { bg: "#F3F4F6", text: "#6B7280" };

// ── Shimmer ────────────────────────────────────────────────────────────────────
function Shimmer({ size, radius }: { size: number; radius: number }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 750 }),
        withTiming(0.35, { duration: 750 }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.shimmer,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
    />
  );
}

// ── Fallback (letter + optional retry) ─────────────────────────────────────────
function Fallback({
  name,
  mealType,
  size,
  radius,
  onRetry,
}: {
  name:      string;
  mealType?: MealType;
  size:      number;
  radius:    number;
  onRetry:   () => void;
}) {
  const palette = (mealType && PALETTE[mealType]) ?? FALLBACK_DEFAULT;
  const initial = name.trim()[0]?.toUpperCase() ?? "?";

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: radius, backgroundColor: palette.bg }]}>
      <Text style={[styles.fallbackLetter, { color: palette.text, fontSize: size * 0.38 }]}>
        {initial}
      </Text>
      <Pressable
        onPress={onRetry}
        style={styles.retryBtn}
        hitSlop={8}
        accessibilityLabel="Retry loading image"
      >
        <RotateCcw color={palette.text} size={10} />
      </Pressable>
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
type Props = {
  uri?:          string;
  fallbackName:  string;
  mealType?:     MealType;
  size?:         number;
  radius?:       number;
  contentFit?:   ImageContentFit;
};

type LoadState = "idle" | "loading" | "loaded" | "error";

function MealImageInner({
  uri,
  fallbackName,
  mealType,
  size   = 48,
  radius = 13,
  contentFit = "cover",
}: Props) {
  const [state, setState]     = useState<LoadState>(uri ? "loading" : "idle");
  const [retryKey, setRetry]  = useState(0);
  const mountedRef            = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Reset when the URI changes (e.g., list re-renders with different meal)
  useEffect(() => {
    if (uri) {
      setState("loading");
    } else {
      setState("idle");
    }
  }, [uri, retryKey]);

  const handleLoad  = useCallback(() => { if (mountedRef.current) setState("loaded"); },  []);
  const handleError = useCallback(() => { if (mountedRef.current) setState("error"); }, []);
  const handleRetry = useCallback(() => {
    if (mountedRef.current) {
      setState("loading");
      setRetry((k) => k + 1);
    }
  }, []);

  // No URI → show fallback immediately
  if (!uri || state === "idle" || state === "error") {
    return (
      <Fallback
        name={fallbackName}
        mealType={mealType}
        size={size}
        radius={radius}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <View style={{ width: size, height: size, borderRadius: radius, overflow: "hidden" }}>
      {/* Shimmer sits behind the image and disappears once loaded */}
      {state === "loading" && <Shimmer size={size} radius={radius} />}

      <Image
        key={`${uri}-${retryKey}`}
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        // expo-image handles disk + memory caching automatically
        cachePolicy="memory-disk"
        // 280 ms cross-fade once the image bytes are ready
        transition={280}
        onLoad={handleLoad}
        onError={handleError}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

export const MealImage = memo(MealImageInner);

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  shimmer: {
    position:        "absolute",
    backgroundColor: "#E5E7EB",
  },
  fallback: {
    alignItems:     "center",
    justifyContent: "center",
    position:       "relative",
  },
  fallbackLetter: {
    fontFamily: FONTS.extraBold,
    lineHeight: undefined,
  },
  retryBtn: {
    position:        "absolute",
    bottom:          3,
    right:           3,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius:    999,
    padding:         3,
  },
});
