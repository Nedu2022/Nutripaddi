import type { ImageSourcePropType } from "react-native";

export type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType | null;
};

const SLIDE_IMAGES = {
  ticket: require("@/assets/images/onboarding_nutritionist.png"),
  scan: require("@/assets/images/onboarding_scan_new.png"),
  nutrition: require("@/assets/images/onboarding_nutrition_info.png"),
  maternal: require("@/assets/images/onboarding_maternal_new.png"),
} as const;

export const onboardingData: OnboardingItem[] = [
  {
    id: "ticket",
    title: "Meet Your Nutritionist",
    description:
      "NutriPadi helps you understand African meals using smart food analysis.",
    image: SLIDE_IMAGES.ticket,
  },
  {
    id: "scan",
    title: "Snap your meal. Know your food.",
    description:
      "Point your camera at jollof, eba, egusi or any local dish. NutriPadi recognises 40+ indigenous African dishes in seconds.",
    image: SLIDE_IMAGES.scan,
  },
  {
    id: "nutrition",
    title: "Get instant nutrition info.",
    description:
      "See calories, protein, iron and fibre for your plate right away. No typing, no calorie counting.",
    image: SLIDE_IMAGES.nutrition,
  },
  {
    id: "maternal",
    title: "Nutrition for two.",
    description:
      "Pregnant or nursing? Get gentle, affordable food guidance for the first 1,000 days, in your own language.",
    image: SLIDE_IMAGES.maternal,
  },
];
