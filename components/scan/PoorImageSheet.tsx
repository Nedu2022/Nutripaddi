import { Pressable, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, CheckCircle2 } from "lucide-react-native";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

type PoorImageSheetProps = {
  onTryAgain: () => void;
};

const TIPS = [
  "Move closer",
  "Use better light",
  "Capture the full plate",
  "Avoid shaking the camera",
];

export default function PoorImageSheet({ onTryAgain }: PoorImageSheetProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <AlertTriangle color={COLORS.warning} size={22} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>We can’t see the meal clearly.</Text>
          <Text style={styles.subtitle}>Try again with a clearer photo.</Text>
        </View>
      </View>
      <View style={styles.tipGrid}>
        {TIPS.map((tip) => (
          <View key={tip} style={styles.tip}>
            <CheckCircle2 color={COLORS.primary} size={14} />
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
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
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
    backgroundColor: COLORS.softYellow,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontFamily: FONTS.extraBold,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginTop: 3,
  },
  tipGrid: {
    gap: 8,
    marginBottom: 16,
  },
  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipText: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  button: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
});
