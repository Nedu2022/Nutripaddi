import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import InputField from "@/components/InputField";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { login, signInWithGoogle } from "@/src/services/authApi";
import { saveAuthSession } from "@/src/services/authSessionService";
import { getErrorMessage } from "@/src/services/errorService";
import { getProfile } from "@/src/services/profileService";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginErrors = Partial<{ email: string; password: string }>;

async function navigateAfterAuth() {
  const profile = await getProfile().catch(() => null);
  router.replace(profile?.nickname?.trim() ? ROUTES.tabs : ROUTES.languageSelect);
}

export default function LoginScreen() {
  const { t } = useLanguage();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [errors, setErrors]         = useState<LoginErrors>({});
  const [formError, setFormError]   = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validate = () => {
    const next: LoginErrors = {};
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!emailPattern.test(email.trim())) next.email = "Enter a valid email.";
    if (!password) next.password = "Please enter your password.";
    else if (password.length < 6) next.password = "At least 6 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setFormError("");
    setIsSubmitting(true);
    try {
      const session = await login({ email: email.trim().toLowerCase(), password });
      await saveAuthSession(session);
      await navigateAfterAuth();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError("");
    setIsGoogleLoading(true);
    try {
      const session = await signInWithGoogle();
      if (!session) return; // user cancelled
      await saveAuthSession(session);
      await navigateAfterAuth();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <ScreenWrapper scroll centered>
      <Animated.View entering={FadeInUp.duration(420)} style={styles.header}>
        <Text style={styles.kicker}>{t.loginKicker}</Text>
        <Text style={styles.title}>{t.loginTitle}</Text>
      </Animated.View>

      {/* Google sign-in (primary OAuth option, shown above email form) */}
      <Animated.View entering={FadeInUp.delay(80).duration(420)} style={styles.oauthSection}>
        <GoogleSignInButton onPress={handleGoogleSignIn} loading={isGoogleLoading} />
      </Animated.View>

      {/* Divider */}
      <Animated.View entering={FadeInUp.delay(100).duration(420)} style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with email</Text>
        <View style={styles.dividerLine} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.form}>
        <InputField
          error={errors.email}
          keyboardType="email-address"
          label={t.email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          value={email}
        />
        <InputField
          error={errors.password}
          label={t.password}
          onChangeText={setPassword}
          placeholder="••••••"
          secureTextEntry
          value={password}
        />
        <Pressable onPress={() => router.push(ROUTES.forgotPassword)} hitSlop={10}>
          <Text style={styles.forgot}>{t.forgotPassword}</Text>
        </Pressable>
      </Animated.View>

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <CustomButton loading={isSubmitting} onPress={handleLogin} title={t.login} />

      <Pressable onPress={() => router.push(ROUTES.signup)} hitSlop={10}>
        <Text style={styles.link}>{t.noAccount}</Text>
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header:     { marginBottom: 24 },
  kicker:     { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.bold, marginBottom: 8 },
  title:      { color: COLORS.text, fontSize: 28, fontFamily: FONTS.extraBold },
  oauthSection: { marginBottom: 18 },
  dividerRow: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            12,
    marginBottom:   18,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: {
    color:      "#9CA3AF",
    fontSize:   12,
    fontFamily: FONTS.medium,
    flexShrink: 0,
  },
  form:      { marginBottom: 24 },
  forgot:    { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.bold, textAlign: "right" },
  formError: { color: COLORS.error, fontSize: 13, fontFamily: FONTS.medium, marginBottom: 14, textAlign: "center" },
  link:      { color: COLORS.primary, fontSize: 15, fontFamily: FONTS.bold, marginTop: 22, textAlign: "center" },
});
