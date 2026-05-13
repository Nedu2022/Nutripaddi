import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ShieldAlert } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import OptionCard from "@/components/OptionCard";
import QuestionHeader from "@/components/QuestionHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";

const healthOptions = [
  { key: "healthGeneral" as const, iconName: "happy" },
  { key: "healthWeight" as const, iconName: "fitness" },
  { key: "healthDiabetes" as const, iconName: "water" },
  { key: "healthHeart" as const, iconName: "heart" },
  { key: "healthNone" as const, iconName: "checkmark-circle" },
];

export default function HealthAwarenessScreen() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!selected) { setError("Select one."); return; }
    setError("");
    router.push(ROUTES.profileSetup);
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader eyebrow={t.setupEyebrow} step={5} subtitle={t.step4Subtitle} title={t.step4Title} totalSteps={5} />

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.options}>
        {healthOptions.map((o) => (
          <OptionCard key={o.key} label={t[o.key]} iconName={o.iconName}
            onPress={() => { setSelected(o.key); setError(""); }}
            selected={selected === o.key} />
        ))}
      </Animated.View>

      <View style={styles.disclaimerCard}>
        <ShieldAlert color={COLORS.warning} size={18} />
        <Text style={styles.disclaimerText}>{t.healthDisclaimer}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <CustomButton onPress={handleContinue} title={t.continue} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  options: { gap: 10, marginBottom: 16 },
  disclaimerCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: COLORS.softYellow, borderRadius: 12, padding: 14, marginBottom: 20,
  },
  disclaimerText: { flex: 1, color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.medium, lineHeight: 18 },
  error: { color: COLORS.error, fontSize: 13, marginBottom: 14 },
});
