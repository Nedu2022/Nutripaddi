import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
import { saveAuthSession } from "@/src/services/authSessionService";

export default function ProfileSetupScreen() {
  const { t } = useLanguage();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleFinish = async () => {
    if (!nickname.trim()) {
      setError("Please enter a nickname.");
      return;
    }

    setError("");
    await saveAuthSession();
    router.replace(ROUTES.tabs);
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader
        eyebrow={t.setupEyebrow}
        step={5}
        subtitle={t.step5Subtitle}
        title={t.step5Title}
        totalSteps={5}
      />

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.formContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <ImagePlus color={COLORS.primary} size={36} strokeWidth={1.8} />
          </View>
          <Pressable onPress={() => undefined} hitSlop={10}>
            <Text style={styles.avatarAction}>{t.addPhotoLater}</Text>
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

      <CustomButton onPress={handleFinish} title={t.finishSetup} />
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
  },
  avatarAction: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 32,
    textAlign: "center",
  },
});
