import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import OptionCard from "@/components/OptionCard";
import QuestionHeader from "@/components/QuestionHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";

const goals = [
  { key: "goalEatHealthier" as const, iconName: "nutrition" },
  { key: "goalTrackCalories" as const, iconName: "calculator" },
  { key: "goalManageWeight" as const, iconName: "fitness" },
  { key: "goalReduceCarbs" as const, iconName: "trending-down" },
  { key: "goalUnderstandMeals" as const, iconName: "restaurant" },
  { key: "goalBetterHabits" as const, iconName: "heart" },
];

export default function GoalsScreen() {
  const { t } = useLanguage();
  const [selectedGoal, setSelectedGoal] = useState("");
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!selectedGoal) { setError("Required"); return; }
    setError("");
    router.push(ROUTES.eatingLifestyle);
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader eyebrow={t.setupEyebrow} step={3} subtitle={t.step2Subtitle} title={t.step2Title} totalSteps={5} />

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.options}>
        {goals.map((goal) => (
          <OptionCard key={goal.key} label={t[goal.key]} iconName={goal.iconName}
            onPress={() => { setSelectedGoal(goal.key); setError(""); }}
            selected={selectedGoal === goal.key} />
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
