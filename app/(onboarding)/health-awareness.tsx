import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Activity,
  Ban,
  Baby,
  Droplet,
  Heart,
  HeartPulse,
  Leaf,
  Scale,
} from "lucide-react-native";
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

const NONE_KEY = "healthNone";

const healthOptions = [
  { key: "healthGeneral" as const, Icon: Heart },
  { key: "healthWeight" as const, Icon: Scale },
  { key: "healthDiabetes" as const, Icon: Droplet },
  { key: "healthHeart" as const, Icon: HeartPulse },
  { key: "healthBloodPressure" as const, Icon: Activity },
  { key: "healthAnaemia" as const, Icon: Droplet },
  { key: "healthGut" as const, Icon: Leaf },
  { key: "healthPregnancy" as const, Icon: Baby },
  { key: "healthNone" as const, Icon: Ban },
];

export default function HealthAwarenessScreen() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");

  const toggle = (key: string) => {
    setError("");
    setSelected((c) => {
      if (key === NONE_KEY) return c.includes(NONE_KEY) ? [] : [NONE_KEY];
      const next = c.includes(key) ? c.filter((k) => k !== key) : [...c, key];
      return next.filter((k) => k !== NONE_KEY);
    });
  };

  const handleContinue = () => {
    if (selected.length === 0) { setError("Select at least one, or choose “No specific concern”."); return; }
    setError("");
    updateOnboardingDraft({
      healthAwareness: selected.map((key) => en[key as keyof typeof en]),
    });
    router.push(ROUTES.profileSetup);
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader eyebrow={t.setupEyebrow} step={6} subtitle={t.step4Subtitle} title={t.step4Title} totalSteps={6} />

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.options}>
        {healthOptions.map((o) => (
          <OptionCard
            key={o.key}
            label={t[o.key]}
            icon={<o.Icon color={COLORS.primary} size={20} />}
            multiSelect
            onPress={() => toggle(o.key)}
            selected={selected.includes(o.key)}
          />
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
