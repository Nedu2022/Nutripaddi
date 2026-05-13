import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
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

type LoginErrors = Partial<{ email: string; password: string }>;

export default function LoginScreen() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});

  const validate = () => {
    const nextErrors: LoginErrors = {};
    if (!email.trim()) nextErrors.email = "Please enter your email.";
    else if (!emailPattern.test(email.trim())) nextErrors.email = "Enter a valid email.";
    if (!password) nextErrors.password = "Please enter your password.";
    else if (password.length < 6) nextErrors.password = "At least 6 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = () => {
    if (validate()) router.replace(ROUTES.tabs);
  };

  return (
    <ScreenWrapper scroll centered>
      <Animated.View entering={FadeInUp.duration(420)} style={styles.header}>
        <Text style={styles.kicker}>{t.loginKicker}</Text>
        <Text style={styles.title}>{t.loginTitle}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.form}>
        <InputField error={errors.email} keyboardType="email-address" label={t.email} onChangeText={setEmail} placeholder="you@example.com" value={email} />
        <InputField error={errors.password} label={t.password} onChangeText={setPassword} placeholder="••••••" secureTextEntry value={password} />
        <Pressable onPress={() => router.push(ROUTES.forgotPassword)} hitSlop={10}>
          <Text style={styles.forgot}>{t.forgotPassword}</Text>
        </Pressable>
      </Animated.View>

      <CustomButton onPress={handleLogin} title={t.login} />
      <Pressable onPress={() => router.push(ROUTES.signup)} hitSlop={10}>
        <Text style={styles.link}>{t.noAccount}</Text>
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  kicker: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.bold, marginBottom: 8 },
  title: { color: COLORS.text, fontSize: 28, fontFamily: FONTS.extraBold },
  forgot: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.bold, textAlign: "right" },
  form: { marginBottom: 24 },
  link: { color: COLORS.primary, fontSize: 15, fontFamily: FONTS.bold, marginTop: 22, textAlign: "center" },
});
