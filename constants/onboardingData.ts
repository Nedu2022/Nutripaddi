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
    title: "Meet Your AI Nutritionist",
    description:
      "NutriPadi helps you understand Nigerian meals using smart food analysis.",
    image: require("@/assets/images/onboarding_human_1.png"),
  },
  {
    id: "scan",
    title: "Scan, Learn, Improve",
    description:
      "Take a photo of your meal and get simple nutrition insights instantly.",
    image: require("@/assets/images/onboarding_human_2.png"),
  },
  {
    id: "guidance",
    title: "Eat Better With Guidance",
    description:
      "Get friendly tips based on your meals, goals, and eating habits.",
    image: require("@/assets/images/onboarding_human_3.png"),
  },
];
