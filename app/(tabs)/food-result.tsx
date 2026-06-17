import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ScanLine } from "lucide-react-native";

import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";

export default function FoodResultScreen() {
  return (
    <ScreenWrapper centered>
      <View style={styles.iconCircle}>
        <ScanLine color={COLORS.primary} size={34} />
      </View>
      <Text style={styles.title}>No active meal result</Text>
      <Text style={styles.subtitle}>
        Scan or upload a meal image to get a result from the connected detection endpoint.
      </Text>
      <Pressable onPress={() => router.replace(ROUTES.scan)} style={styles.button}>
        <Text style={styles.buttonText}>Scan a Meal</Text>
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    alignItems: "center",
    backgroundColor: COLORS.softGreen,
    borderRadius: 24,
    height: 72,
    justifyContent: "center",
    marginBottom: 18,
    width: 72,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: FONTS.extraBold,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.medium,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    marginTop: 22,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
});
