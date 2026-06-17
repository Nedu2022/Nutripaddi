import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import OptionCard from "@/components/OptionCard";
import QuestionHeader from "@/components/QuestionHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { en } from "@/localization";
import { updateOnboardingDraft } from "@/src/services/onboardingDraft";

const healthOptions = [
  { key: "healthGeneral" as const },
  { key: "healthWeight" as const },
  { key: "healthDiabetes" as const },
  { key: "healthHeart" as const },
  { key: "healthNone" as const },
];

export default function HealthAwarenessScreen() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!selected) { setError("Select one."); return; }
    setError("");
    updateOnboardingDraft({ healthAwareness: en[selected as keyof typeof en] });
    router.push(ROUTES.profileSetup);
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader eyebrow={t.setupEyebrow} step={6} subtitle={t.step4Subtitle} title={t.step4Title} totalSteps={6} />

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.options}>
        {healthOptions.map((o) => (
          <OptionCard key={o.key} label={t[o.key]}
            onPress={() => { setSelected(o.key); setError(""); }}
            selected={selected === o.key} />
        ))}
      </Animated.View>

      <View style={styles.disclaimerCard}>
        <View style={styles.disclaimerDot} />
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
  disclaimerDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.warning, marginTop: 5, flexShrink: 0,
  },
  disclaimerText: { flex: 1, color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.medium, lineHeight: 18 },
  error: { color: COLORS.error, fontSize: 13, marginBottom: 14 },
});
