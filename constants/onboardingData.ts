import type { ImageSourcePropType } from "react-native";

export type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  // Set to a require(...) to use a photo; null uses the built-in vector artwork.
  image: ImageSourcePropType | null;
};

export const onboardingData: OnboardingItem[] = [
  {
    id: "welcome",
    title: "Nutrition for Two",
    description:
      "Pregnant or nursing? NutriPadi guides you through the first 1,000 days with food advice made for the African plate.",
    image: null,
  },
  {
    id: "scan",
    title: "Just Snap Your Plate",
    description:
      "Point your camera at eba, amala, rice or any local dish. No typing, no calorie counting.",
    image: null,
  },
  {
    id: "nutrition",
    title: "Spot the Hidden Hunger",
    description:
      "Instantly see iron, folate and protein — the nutrients that keep mother and baby strong.",
    image: null,
  },
  {
    id: "coach",
    title: "Your Pocket Coach",
    description:
      "Get friendly, affordable food swaps in your own language, any time of day.",
    image: null,
  },
];
