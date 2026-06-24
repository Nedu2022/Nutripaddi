/**
 * NetworkAwareButton
 *
 * Wraps any action that requires a live internet connection. When the user is
 * offline the button:
 *  1. Shows a WifiOff icon alongside the label.
 *  2. Applies a disabled visual style.
 *  3. Does NOT call the action — preventing silent failures.
 *  4. Shows an optional inline "offline" tooltip below the button for 2 s
 *     when the user tries to tap it anyway.
 *
 * Usage:
 *   <NetworkAwareButton
 *     onPress={handleScan}
 *     offlineMessage="Scanning requires an internet connection."
 *     style={styles.scanBtn}
 *   >
 *     <ScanLine color="#fff" size={18} />
 *     <Text style={styles.scanLabel}>Scan My Meal</Text>
 *   </NetworkAwareButton>
 */

import { useCallback, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { WifiOff } from "lucide-react-native";

import { useIsOffline } from "@/src/hooks/useNetworkStatus";
import { FONTS } from "@/constants/fonts";

const TOOLTIP_SHOW_MS = 2200;

type Props = Omit<PressableProps, "onPress"> & {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  offlineMessage?: string;
  disabledOpacity?: number;
};

export default function NetworkAwareButton({
  onPress,
  children,
  style,
  offlineMessage = "This action requires an internet connection.",
  disabledOpacity = 0.48,
  ...rest
}: Props) {
  const isOffline       = useIsOffline();
  const [showTip, setShowTip] = useState(false);
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Shake animation for the "nope" feedback
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-6, { duration: 55 }),
      withTiming(6,  { duration: 55 }),
      withTiming(-4, { duration: 45 }),
      withTiming(4,  { duration: 45 }),
      withSpring(0,  { damping: 14 }),
    );
  }, [shakeX]);

  const handlePress = useCallback(() => {
    if (isOffline) {
      triggerShake();
      setShowTip(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowTip(false), TOOLTIP_SHOW_MS);
      return;
    }
    onPress();
  }, [isOffline, onPress, triggerShake]);

  return (
    <View>
      <Animated.View style={[isOffline && { opacity: disabledOpacity }, shakeStyle]}>
        <Pressable
          {...rest}
          onPress={handlePress}
          style={style}
        >
          {/* Offline indicator badge in top-right corner */}
          {isOffline && (
            <View style={styles.offlineBadge} pointerEvents="none">
              <WifiOff color="#FFFFFF" size={10} />
            </View>
          )}
          {children}
        </Pressable>
      </Animated.View>

      {/* Inline tooltip — shown briefly when user taps while offline */}
      {showTip && (
        <View style={styles.tooltip}>
          <WifiOff color="#FF6B35" size={11} />
          <Text style={styles.tooltipText}>{offlineMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  offlineBadge: {
    position:        "absolute",
    top:             6,
    right:           6,
    zIndex:          2,
    backgroundColor: "#FF6B35",
    borderRadius:    999,
    width:           18,
    height:          18,
    alignItems:      "center",
    justifyContent:  "center",
  },
  tooltip: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               6,
    marginTop:         6,
    backgroundColor:   "#FEF0EB",
    borderRadius:      10,
    paddingHorizontal: 12,
    paddingVertical:   8,
    borderWidth:       1,
    borderColor:       "rgba(255,107,53,0.18)",
  },
  tooltipText: {
    color:      "#CC4A18",
    fontSize:   12,
    fontFamily: FONTS.medium,
    flex:       1,
  },
});
