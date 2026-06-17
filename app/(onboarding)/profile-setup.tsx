import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus } from "lucide-react-native";
import { router } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import QuestionHeader from "@/components/QuestionHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { clearCoachProfileCache } from "@/src/services/coachService";
import { getDailyCalorieTarget } from "@/src/services/maternalNutrition";
import { getOnboardingDraft, resetOnboardingDraft } from "@/src/services/onboardingDraft";
import { saveProfile } from "@/src/services/profileService";
import { uploadImage } from "@/src/services/uploadService";

export default function ProfileSetupScreen() {
  const { t } = useLanguage();
  const [nickname, setNickname] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleFinish = async () => {
    if (!nickname.trim()) {
      setError("Please enter a nickname.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const uploadedPhoto = photoUri
        ? await uploadImage({ folder: "profiles", uri: photoUri })
        : null;

      const draft = getOnboardingDraft();
      await saveProfile({
        nickname: nickname.trim(),
        photoUri: uploadedPhoto?.secureUrl ?? uploadedPhoto?.url ?? null,
        language: draft.language ?? null,
        lifeStage: draft.lifeStage ?? "general",
        trimester: draft.trimester ?? null,
        babyAgeMonths: draft.babyAgeMonths ?? null,
        age: draft.age ?? null,
        gender: draft.gender ?? null,
        weight: draft.weight ?? null,
        height: draft.height ?? null,
        nutritionGoal: draft.nutritionGoal ?? null,
        eatingLifestyle: draft.eatingLifestyle?.join(", ") ?? null,
        healthAwareness: draft.healthAwareness ?? null,
        dailyCalorieTarget: getDailyCalorieTarget(draft.lifeStage, draft.trimester),
      });
      resetOnboardingDraft();
      clearCoachProfileCache();
      router.replace(ROUTES.tabs);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save your profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader
        eyebrow={t.setupEyebrow}
        step={6}
        subtitle={t.step5Subtitle}
        title={t.step5Title}
        totalSteps={6}
      />

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.formContainer}>
        <View style={styles.avatarContainer}>
          <Pressable onPress={handlePickPhoto} style={styles.avatar}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <ImagePlus color={COLORS.primary} size={36} strokeWidth={1.8} />
            )}
          </Pressable>
          <Pressable onPress={handlePickPhoto} hitSlop={10}>
            <Text style={styles.avatarAction}>
              {photoUri ? t.changePhoto ?? "Change photo" : t.addPhotoLater}
            </Text>
          </Pressable>
        </View>

        <InputField
          autoCapitalize="words"
          error={error}
          label={t.nickname}
          onChangeText={(value) => {
            setNickname(value);
            setError("");
          }}
          placeholder="e.g. Ada"
          value={nickname}
        />
      </Animated.View>

      <CustomButton loading={isSubmitting} onPress={handleFinish} title={t.finishSetup} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softOrange,
    marginBottom: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarAction: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 32,
    textAlign: "center",
  },
});
