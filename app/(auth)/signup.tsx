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
import { register, signInWithGoogle } from "@/src/services/authApi";
import { saveAuthSession } from "@/src/services/authSessionService";
import { getErrorMessage } from "@/src/services/errorService";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignupErrors = Partial<{
  fullName:        string;
  email:           string;
  password:        string;
  confirmPassword: string;
}>;

export default function SignupScreen() {
  const { t } = useLanguage();
  const [fullName, setFullName]             = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors]                 = useState<SignupErrors>({});
  const [formError, setFormError]           = useState("");
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validate = () => {
    const next: SignupErrors = {};
    if (!fullName.trim()) next.fullName = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!emailPattern.test(email.trim())) next.email = "Enter a valid email.";
    if (!password) next.password = "Create a password.";
    else if (password.length < 6) next.password = "At least 6 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (confirmPassword !== password) next.confirmPassword = "Passwords must match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setFormError("");
    setIsSubmitting(true);
    try {
      const session = await register({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        password,
      });
      if (session) {
        await saveAuthSession(session);
        router.push(ROUTES.languageSelect);
        return;
      }
      setFormError("Check your email to confirm your account, then continue your setup.");
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError("");
    setIsGoogleLoading(true);
    try {
      const session = await signInWithGoogle();
      if (!session) return; // user cancelled
      await saveAuthSession(session);
      // Google users go straight to onboarding — they haven't set up their profile yet
      router.push(ROUTES.languageSelect);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <ScreenWrapper scroll centered>
      <Animated.View entering={FadeInUp.duration(420)} style={styles.header}>
        <Text style={styles.kicker}>{t.signupKicker}</Text>
        <Text style={styles.title}>{t.signupTitle}</Text>
      </Animated.View>

      {/* Google sign-up — shown above the email form as the fast path */}
      <Animated.View entering={FadeInUp.delay(80).duration(420)} style={styles.oauthSection}>
        <GoogleSignInButton
          onPress={handleGoogleSignUp}
          loading={isGoogleLoading}
          label="Sign up with Google"
        />
      </Animated.View>

      {/* Divider */}
      <Animated.View entering={FadeInUp.delay(100).duration(420)} style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or sign up with email</Text>
        <View style={styles.dividerLine} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.form}>
        <InputField
          autoCapitalize="words"
          error={errors.fullName}
          label={t.fullName}
          onChangeText={setFullName}
          placeholder="Your name"
          value={fullName}
        />
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
          placeholder="At least 6 characters"
          secureTextEntry
          value={password}
        />
        <InputField
          error={errors.confirmPassword}
          label={t.confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          secureTextEntry
          value={confirmPassword}
        />
      </Animated.View>

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <CustomButton loading={isSubmitting} onPress={handleSignup} title={t.signUp} />

      <Pressable onPress={() => router.push(ROUTES.login)} hitSlop={10}>
        <Text style={styles.link}>{t.hasAccount}</Text>
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
  formError: { color: COLORS.error, fontSize: 13, fontFamily: FONTS.medium, marginBottom: 14, textAlign: "center" },
  link:      { color: COLORS.primary, fontSize: 15, fontFamily: FONTS.bold, marginTop: 22, textAlign: "center" },
});
