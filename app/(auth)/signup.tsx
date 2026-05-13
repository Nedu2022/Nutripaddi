import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignupErrors = Partial<{ fullName: string; email: string; password: string; confirmPassword: string }>;

export default function SignupScreen() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<SignupErrors>({});

  const validate = () => {
    const nextErrors: SignupErrors = {};
    if (!fullName.trim()) nextErrors.fullName = "Please enter your name.";
    if (!email.trim()) nextErrors.email = "Please enter your email.";
    else if (!emailPattern.test(email.trim())) nextErrors.email = "Enter a valid email.";
    if (!password) nextErrors.password = "Create a password.";
    else if (password.length < 6) nextErrors.password = "At least 6 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords must match.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignup = () => {
    if (validate()) router.push(ROUTES.languageSelect);
  };

  return (
    <ScreenWrapper scroll centered>
      <Animated.View entering={FadeInUp.duration(420)} style={styles.header}>
        <Text style={styles.kicker}>{t.signupKicker}</Text>
        <Text style={styles.title}>{t.signupTitle}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.form}>
        <InputField autoCapitalize="words" error={errors.fullName} label={t.fullName} onChangeText={setFullName} placeholder="Your name" value={fullName} />
        <InputField error={errors.email} keyboardType="email-address" label={t.email} onChangeText={setEmail} placeholder="you@example.com" value={email} />
        <InputField error={errors.password} label={t.password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry value={password} />
        <InputField error={errors.confirmPassword} label={t.confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password" secureTextEntry value={confirmPassword} />
      </Animated.View>

      <CustomButton onPress={handleSignup} title={t.signUp} />
      <Pressable onPress={() => router.push(ROUTES.login)} hitSlop={10}>
        <Text style={styles.link}>{t.hasAccount}</Text>
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  kicker: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.bold, marginBottom: 8 },
  title: { color: COLORS.text, fontSize: 28, fontFamily: FONTS.extraBold },
  form: { marginBottom: 24 },
  link: { color: COLORS.primary, fontSize: 15, fontFamily: FONTS.bold, marginTop: 22, textAlign: "center" },
});
