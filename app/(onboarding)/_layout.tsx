import { Stack } from "expo-router";

import { COLORS } from "@/constants/colors";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        contentStyle: { backgroundColor: COLORS.background },
        headerShown: false,
      }}
    />
  );
}
