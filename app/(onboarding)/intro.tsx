import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

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
      <Animated.View
        entering={FadeInDown.delay(80).duration(440)}
        style={styles.skipRow}
      >
        <View style={styles.brandContainer}>
          <Image source={require("@/assets/images/logo-mark.png")} style={styles.brandLogo} resizeMode="contain" />
          <Text style={styles.brand}>NutriPadi</Text>
        </View>
        <Pressable onPress={() => router.replace(ROUTES.signup)} hitSlop={10}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        entering={FadeIn.delay(140).duration(520)}
        style={styles.slideArea}
      >
        <OnboardingSlide
          key={currentSlide.id}
          description={currentSlide.description}
          image={currentSlide.image}
          index={currentIndex}
          title={currentSlide.title}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(220).duration(460)}
        style={styles.footer}
      >
        <ProgressDots
          currentIndex={currentIndex}
          total={onboardingData.length}
        />
        <CustomButton
          onPress={handleNext}
          style={styles.button}
          title={isLastSlide ? "Get Started" : "Continue"}
        />
      </Animated.View>
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
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandLogo: {
    width: 28,
    height: 28,
  },
  brand: {
    color: COLORS.primary,
    fontSize: 22,
    fontFamily: FONTS.extraBold,
    marginTop: 2,
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
