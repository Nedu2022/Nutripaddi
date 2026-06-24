/**
 * GoogleSignInButton — branded "Continue with Google" button.
 *
 * Uses a hand-drawn Google G mark (SVG path) so there's no dependency on
 * an external icon library or image asset.
 */

import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { FONTS } from "@/constants/fonts";

// Official Google G colours
const G_PATHS = [
  { d: "M21.805 10.023H12v3.955h5.617c-.242 1.453-1.484 4.273-5.617 4.273-3.375 0-6.128-2.793-6.128-6.25s2.753-6.25 6.128-6.25c1.922 0 3.211.82 3.945 1.524l2.688-2.602C16.832 3.242 14.604 2 12 2 6.477 2 2 6.477 2 12s4.477 10 10 10c5.773 0 9.598-4.063 9.598-9.773 0-.657-.07-1.157-.156-1.563l-.637.36z", fill: "#4285F4" },
  { d: "M3.545 7.392 6.7 9.7C7.574 7.484 9.602 6 12 6c1.48 0 2.793.508 3.831 1.336l2.977-2.844C17.07 2.97 14.698 2 12 2 8.168 2 4.875 4.223 3.545 7.392z", fill: "#EA4335" },
  { d: "M12 22c2.645 0 4.867-.875 6.492-2.375l-3-2.32C14.523 18.227 13.34 18.75 12 18.75c-4.121 0-5.367-2.805-5.617-4.258L3.18 16.883C4.535 19.902 8.02 22 12 22z", fill: "#34A853" },
  { d: "M21.648 10.383c-.14-.688-.297-1.016-.297-1.016H12v3.955h5.617c-.207 1.246-.969 2.36-2.047 3.082l3 2.32c1.75-1.617 2.828-4 2.828-6.555 0-.657-.07-1.157-.156-1.563l.406.223z", fill: "#FBBC05" },
];

type Props = {
  onPress:  () => void | Promise<void>;
  loading?: boolean;
  label?:   string;
};

export default function GoogleSignInButton({
  onPress,
  loading = false,
  label   = "Continue with Google",
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && styles.disabled]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {/* Google G logo */}
      <View style={styles.logoWrap}>
        <Svg width={18} height={18} viewBox="2 2 20 20">
          {G_PATHS.map((p, i) => (
            <Path key={i} d={p.d} fill={p.fill} />
          ))}
        </Svg>
      </View>

      <Text style={styles.label}>
        {loading ? "Signing in…" : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "center",
    gap:               10,
    backgroundColor:   "#FFFFFF",
    borderRadius:      14,
    borderWidth:       1.5,
    borderColor:       "#E5E7EB",
    paddingVertical:   14,
    paddingHorizontal: 20,
    shadowColor:       "#000",
    shadowOpacity:     0.06,
    shadowRadius:      8,
    shadowOffset:      { width: 0, height: 2 },
    elevation:         2,
  },
  pressed:  { opacity: 0.82, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.55 },
  logoWrap: {
    width:           28,
    height:          28,
    borderRadius:    8,
    backgroundColor: "#F8F9FA",
    alignItems:      "center",
    justifyContent:  "center",
    borderWidth:     1,
    borderColor:     "#E5E7EB",
  },
  label: {
    color:      "#1F2937",
    fontSize:   15,
    fontFamily: FONTS.semiBold,
  },
});
