import { Pressable, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, CheckCircle2 } from "lucide-react-native";
import { BlurView } from "expo-blur";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

const G = {
  bg: "rgba(8, 8, 12, 0.72)",
  border: "rgba(255, 255, 255, 0.13)",
  cardBg: "rgba(255, 255, 255, 0.07)",
  cardBorder: "rgba(255, 255, 255, 0.10)",
  text: "#FFFFFF",
  textMuted: "rgba(255, 255, 255, 0.62)",
  accent: COLORS.primary,
  accentBg: "rgba(0, 128, 0, 0.14)",
  warnBg: "rgba(255, 175, 0, 0.14)",
  warnText: "#FFBB33",
  warnBorder: "rgba(255, 175, 0, 0.22)",
};

const TIPS = [
  "Move closer to the plate",
  "Use better lighting",
  "Capture the full meal",
  "Hold the camera steady",
];

type PoorImageSheetProps = {
  onTryAgain: () => void;
};

export default function PoorImageSheet({ onTryAgain }: PoorImageSheetProps) {
  return (
    <View style={styles.card}>
      <BlurView intensity={76} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tintOverlay} />

      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <AlertTriangle color={G.warnText} size={22} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{"Can't see the meal clearly."}</Text>
          <Text style={styles.subtitle}>Try again with a clearer photo.</Text>
        </View>
      </View>

      <View style={styles.tipGrid}>
        {TIPS.map((tip) => (
          <View key={tip} style={styles.tip}>
            <CheckCircle2 color={G.accent} size={14} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      <Pressable onPress={onTryAgain} style={styles.button}>
        <Text style={styles.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 34,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: G.border,
    overflow: "hidden",
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: G.bg,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: G.warnBg,
    borderWidth: 1,
    borderColor: G.warnBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: G.text,
    fontSize: 16,
    fontFamily: FONTS.extraBold,
  },
  subtitle: {
    color: G.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginTop: 3,
  },
  tipGrid: {
    gap: 9,
    marginBottom: 16,
    backgroundColor: G.cardBg,
    borderWidth: 1,
    borderColor: G.cardBorder,
    borderRadius: 14,
    padding: 12,
  },
  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipText: {
    color: G.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  button: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: G.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: G.accent,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
});
