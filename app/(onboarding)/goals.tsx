import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import {
  Baby,
  Egg,
  Flame,
  Salad,
  Scale,
  Sparkles,
  Utensils,
  Wheat,
  Zap,
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

const goals = [
  { key: "goalEatHealthier" as const, Icon: Salad },
  { key: "goalMoreProtein" as const, Icon: Egg },
  { key: "goalTrackCalories" as const, Icon: Flame },
  { key: "goalManageWeight" as const, Icon: Scale },
  { key: "goalReduceCarbs" as const, Icon: Wheat },
  { key: "goalBoostEnergy" as const, Icon: Zap },
  { key: "goalUnderstandMeals" as const, Icon: Utensils },
  { key: "goalBetterHabits" as const, Icon: Sparkles },
  { key: "goalEatForBaby" as const, Icon: Baby, descKey: "goalEatForBabyDesc" as const },
];

export default function GoalsScreen() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");

  const toggle = (key: string) => {
    setError("");
    setSelected((c) => (c.includes(key) ? c.filter((k) => k !== key) : [...c, key]));
  };

  const handleContinue = () => {
    if (selected.length === 0) { setError("Select at least one."); return; }
    setError("");
    updateOnboardingDraft({
      nutritionGoal: selected.map((key) => en[key as keyof typeof en]),
    });
    router.push(ROUTES.eatingLifestyle);
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader eyebrow={t.setupEyebrow} step={4} subtitle={t.step2Subtitle} title={t.step2Title} totalSteps={6} />

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.options}>
        {goals.map((goal) => (
          <OptionCard
            key={goal.key}
            label={t[goal.key]}
            description={goal.descKey ? t[goal.descKey] : undefined}
            icon={<goal.Icon color={COLORS.primary} size={20} />}
            multiSelect
            onPress={() => toggle(goal.key)}
            selected={selected.includes(goal.key)}
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
