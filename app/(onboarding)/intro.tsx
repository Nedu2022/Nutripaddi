import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import CustomButton from "@/components/CustomButton";
import OnboardingSlide from "@/components/OnboardingSlide";
import ProgressDots from "@/components/ProgressDots";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { onboardingData } from "@/constants/onboardingData";
import { ROUTES } from "@/constants/routes";

export default function IntroScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = onboardingData[currentIndex];
  const isLastSlide = currentIndex === onboardingData.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      router.replace(ROUTES.signup);
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  return (
    <ScreenWrapper contentStyle={styles.container}>
      <View style={styles.skipRow}>
        <Text style={styles.brand}>NutriPadi</Text>
        <Pressable onPress={() => router.replace(ROUTES.signup)} hitSlop={10}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.slideArea}>
        <OnboardingSlide
          description={currentSlide.description}
          image={currentSlide.image}
          index={currentIndex}
          title={currentSlide.title}
        />
      </View>

      <View style={styles.footer}>
        <ProgressDots
          currentIndex={currentIndex}
          total={onboardingData.length}
        />
        <CustomButton
          onPress={handleNext}
          style={styles.button}
          title={isLastSlide ? "Get Started" : "Continue"}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
  skipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  brand: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.extraBold,
  },
  skipText: {
    color: COLORS.primary,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  slideArea: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 18,
  },
  footer: {
    gap: 22,
    paddingBottom: 12,
  },
  button: {
  },
});
