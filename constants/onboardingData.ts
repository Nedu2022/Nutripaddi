import type { ImageSourcePropType } from "react-native";

export type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType | null;
};

export const onboardingData: OnboardingItem[] = [
  {
    id: "nutritionist",
    title: "Your African AI Nutritionist",
    description:
      "NutriPadi helps you understand local meals like amala, egusi, jollof rice, beans, and plantain.",
    image: require("@/assets/images/onboarding_human_1.png"),
  },
  {
    id: "scan",
    title: "Scan Your Meal",
    description:
      "Take a clear photo. The app checks the food name, how much is there, and key nutrition values.",
    image: require("@/assets/images/onboarding_human_2.png"),
  },
  {
    id: "nutrition",
    title: "See What Is Inside",
    description:
      "Get simple calories, carbs, protein, fat, and AI advice based on African food references.",
    image: require("@/assets/images/onboarding_human_3.png"),
  },
  {
    id: "guidance",
    title: "Eat Better, Keep Your Culture",
    description:
      "Choose English, Yoruba, Hausa, or Igbo preference and get guidance that respects African food habits.",
    image: require("@/assets/images/onboarding_human_1.png"),
  },
];
