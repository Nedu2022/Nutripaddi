import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import {
  Apple,
  Ban,
  Baby,
  Carrot,
  Cookie,
  Droplet,
  Droplets,
  Egg,
  Flame,
  Leaf,
  Moon,
  Scale,
  Soup,
  Utensils,
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
import {
  getOnboardingDraft,
  hydrateOnboardingDraft,
  updateOnboardingDraft,
  type OnboardingDraft,
} from "@/src/services/onboardingDraft";

type HabitKey = Extract<keyof typeof en, `lifestyle${string}`>;

type Habit = {
  key: HabitKey;
  Icon: React.ComponentType<{ color: string; size: number }>;
  show: boolean;
};

function buildHabits(draft: OnboardingDraft): Habit[] {
  const goals = (draft.nutritionGoal ?? []).map((g) => g.toLowerCase());
  const has = (token: string) => goals.some((g) => g.includes(token));
  const maternal = (draft.lifeStage ?? "general") !== "general" || has("baby");
  const wantsHealthy = has("healthier") || has("habit") || has("understand");

  const pool: Habit[] = [
    { key: "lifestyleSwallow", Icon: Soup, show: true },
    { key: "lifestyleRice", Icon: Wheat, show: true },
    { key: "lifestyleBigPortions", Icon: Utensils, show: has("weight") || has("calorie") },
    { key: "lifestyleLateNight", Icon: Moon, show: true },
    { key: "lifestyleSnack", Icon: Cookie, show: true },
    { key: "lifestyleSugaryDrinks", Icon: Droplets, show: has("carb") },
    { key: "lifestyleLowProtein", Icon: Egg, show: has("protein") },
    { key: "lifestyleSkipMeals", Icon: Ban, show: has("energy") },
    { key: "lifestyleLowWater", Icon: Droplet, show: has("energy") },
    { key: "lifestyleFastFood", Icon: Flame, show: wantsHealthy },
    { key: "lifestyleVeggies", Icon: Carrot, show: wantsHealthy },
    { key: "lifestyleCravings", Icon: Apple, show: maternal },
    { key: "lifestyleAppetite", Icon: Baby, show: maternal },
    { key: "lifestylePortion", Icon: Scale, show: true },
    { key: "lifestyleHealthier", Icon: Leaf, show: true },
  ];

  return pool.filter((habit) => habit.show);
}

export default function EatingLifestyleScreen() {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<OnboardingDraft>(getOnboardingDraft());
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    hydrateOnboardingDraft().then(() => {
      if (mounted) setDraft({ ...getOnboardingDraft() });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const habits = useMemo(() => buildHabits(draft), [draft]);

  const toggle = (key: string) => {
    setError("");
    setSelected((c) => (c.includes(key) ? c.filter((k) => k !== key) : [...c, key]));
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
        {habits.map((habit) => (
          <OptionCard
            key={habit.key}
            label={t[habit.key]}
            icon={<habit.Icon color={COLORS.primary} size={20} />}
            multiSelect
            onPress={() => toggle(habit.key)}
            selected={selected.includes(habit.key)}
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
