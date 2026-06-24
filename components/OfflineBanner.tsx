/**
 * OfflineBanner — global connectivity status indicator
 *
 * Behaviour:
 *  • Slides down when the app goes offline or detects a weak connection.
 *  • Swaps to a green "back online" copy when the app reconnects, then
 *    auto-hides after 3 s.
 *  • Uses `pointerEvents="none"` so it never blocks taps on content below.
 *  • Positioned absolutely at the top of the root view so it overlays every
 *    screen without affecting layout.
 */

import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Wifi, WifiOff } from "lucide-react-native";

import { useNetworkContext, type NetworkStatus } from "@/src/context/NetworkProvider";
import { FONTS } from "@/constants/fonts";

// ── Design tokens (match vibrant nutrition palette) ───────────────────────────
const T = {
  offlineBg:       "#1C1C1E",        // near-black
  offlineText:     "#FFFFFF",
  offlineIcon:     "#F97316",        // orange — caution/warning
  weakBg:          "#F97316",        // orange — degraded state
  weakText:        "#FFFFFF",
  weakIcon:        "#FFFFFF",
  reconnectBg:     "#16A34A",        // vibrant green — positive confirmation
  reconnectText:   "#FFFFFF",
  reconnectIcon:   "#FFFFFF",
};

const BANNER_HEIGHT = 44;
const RECONNECT_SHOW_MS = 3000;

// ── Message config ─────────────────────────────────────────────────────────────
interface BannerConfig {
  bg:   string;
  text: string;
  icon: "offline" | "weak" | "online";
  textColor: string;
  iconColor: string;
}

const CONFIGS: Record<"offline" | "weak" | "reconnected", BannerConfig> = {
  offline: {
    bg:        T.offlineBg,
    text:      "No internet. We'll reconnect automatically.",
    icon:      "offline",
    textColor: T.offlineText,
    iconColor: T.offlineIcon,
  },
  weak: {
    bg:        T.weakBg,
    text:      "Slow connection — data may take a moment.",
    icon:      "weak",
    textColor: T.weakText,
    iconColor: T.weakIcon,
  },
  reconnected: {
    bg:        T.reconnectBg,
    text:      "Back online. Syncing your latest data…",
    icon:      "online",
    textColor: T.reconnectText,
    iconColor: T.reconnectIcon,
  },
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function OfflineBanner() {
  const { status } = useNetworkContext();
  const insets = useSafeAreaInsets();

  // Which config the banner currently displays
  const [config, setConfig] = useState<BannerConfig>(CONFIGS.offline);

  // Whether the banner is physically rendered (controls animation target)
  const [visible, setVisible] = useState(false);

  const prevStatusRef    = useRef<NetworkStatus>("online");
  const hideTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateY = useSharedValue(-(BANNER_HEIGHT + insets.top + 8));
  const opacity    = useSharedValue(0);

  const HIDDEN_Y = -(BANNER_HEIGHT + insets.top + 8);

  // ── Status change handler ────────────────────────────────────────────────
  useEffect(() => {
    const prev    = prevStatusRef.current;
    prevStatusRef.current = status;

    // Clear any pending auto-hide
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (status === "offline") {
      setConfig(CONFIGS.offline);
      setVisible(true);
      return;
    }

    if (status === "weak") {
      setConfig(CONFIGS.weak);
      setVisible(true);
      return;
    }

    // status === "online"
    if (prev === "offline" || prev === "weak") {
      // Was degraded → show success briefly, then hide
      setConfig(CONFIGS.reconnected);
      setVisible(true);
      hideTimerRef.current = setTimeout(() => setVisible(false), RECONNECT_SHOW_MS);
      return;
    }

    // Stayed online (initial mount or no change needed)
    setVisible(false);
  }, [status]);   // eslint-disable-line react-hooks/exhaustive-deps — insets.top is stable

  // ── Drive animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 260 });
      opacity.value    = withTiming(1, { duration: 200 });
    } else {
      opacity.value    = withTiming(0, { duration: 180 });
      translateY.value = withDelay(160, withSpring(HIDDEN_Y, { damping: 22, stiffness: 260 }));
    }
  }, [visible, HIDDEN_Y, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity:   opacity.value,
  }));

  // ── Icon ─────────────────────────────────────────────────────────────────
  const IconComponent = config.icon === "offline" ? WifiOff : Wifi;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.banner,
        { paddingTop: insets.top, backgroundColor: config.bg },
        animStyle,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <IconComponent color={config.iconColor} size={13} />
        </View>
        <Text style={[styles.text, { color: config.textColor }]} numberOfLines={1}>
          {config.text}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position:  "absolute",
    top:       0,
    left:      0,
    right:     0,
    zIndex:    9999,
    elevation: 99,
    // Height expands with insets.top via paddingTop; BANNER_HEIGHT is the
    // visible content area below the status bar
    height:    undefined,
    minHeight: BANNER_HEIGHT,
  },
  row: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "center",
    gap:               8,
    height:            BANNER_HEIGHT,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width:          22,
    height:         22,
    alignItems:     "center",
    justifyContent: "center",
    borderRadius:   999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  text: {
    fontSize:   12,
    fontFamily: FONTS.semiBold,
    flexShrink: 1,
    letterSpacing: 0.1,
  },
});
