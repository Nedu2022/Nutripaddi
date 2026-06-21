export type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  image: null;
};

export const onboardingData: OnboardingItem[] = [
  {
    id: "ticket",
    title: "Meet Your Nutritionist",
    description:
      "NutriPadi helps you understand African meals using smart food analysis.",
    image: null,
  },
  {
    id: "scan",
    title: "Scan your meal. Know your food.",
    description:
      "Point your camera at jollof, eba, egusi or any local dish. NutriPadi scans local meals without making you take a photo first.",
    image: null,
  },
  {
    id: "nutrition",
    title: "Get instant nutrition info.",
    description:
      "See calories, protein, iron and fibre for your plate right away. No typing, no calorie counting.",
    image: null,
  },
  {
    id: "maternal",
    title: "Nutrition for two.",
    description:
      "Pregnant or nursing? Get gentle, affordable food guidance for the first 1,000 days, in your own language.",
    image: null,
  },
];
