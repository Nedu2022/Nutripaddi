import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import {
  Cookie,
  Leaf,
  Moon,
  Scale,
  Soup,
  Wheat,
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import OptionCard from "@/components/OptionCard";
import QuestionHeader from "@/components/QuestionHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { en } from "@/localization";
import { updateOnboardingDraft } from "@/src/services/onboardingDraft";

const lifestyles = [
  { key: "lifestyleSwallow" as const, Icon: Soup },
  { key: "lifestyleRice" as const, Icon: Wheat },
  { key: "lifestyleLateNight" as const, Icon: Moon },
  { key: "lifestyleSnack" as const, Icon: Cookie },
  { key: "lifestylePortion" as const, Icon: Scale },
  { key: "lifestyleHealthier" as const, Icon: Leaf },
];

export default function EatingLifestyleScreen() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");

  const toggle = (key: string) => {
    setError("");
    setSelected((c) => c.includes(key) ? c.filter((k) => k !== key) : [...c, key]);
  };

  const handleContinue = () => {
    if (selected.length === 0) { setError("Select at least one."); return; }
    setError("");
    updateOnboardingDraft({
      eatingLifestyle: selected.map((key) => en[key as keyof typeof en]),
    });
    router.push(ROUTES.healthAwareness);
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader eyebrow={t.setupEyebrow} step={5} subtitle={t.step3Subtitle} title={t.step3Title} totalSteps={6} />

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.options}>
        {lifestyles.map((l) => (
          <OptionCard
            key={l.key}
            label={t[l.key]}
            icon={<l.Icon color={COLORS.primary} size={20} />}
            multiSelect
            onPress={() => toggle(l.key)}
            selected={selected.includes(l.key)}
          />
        ))}
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <CustomButton onPress={handleContinue} title={t.continue} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  options: { gap: 10, marginBottom: 16 },
  error: { color: COLORS.error, fontSize: 13, marginBottom: 14 },
});
