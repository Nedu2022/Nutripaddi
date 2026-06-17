import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";
import { requestPasswordReset } from "@/src/services/authApi";
import { getErrorMessage } from "@/src/services/errorService";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setStatusMessage("If this email exists, a password reset link has been sent.");
    } catch (apiError) {
      setError(getErrorMessage(apiError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper scroll centered>
      <View style={styles.header}>
        <Text style={styles.kicker}>Password help</Text>
        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we will send a reset link when auth is connected.
        </Text>
      </View>

      <InputField
        error={error}
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        placeholder="you@example.com"
        value={email}
      />

      {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}
      <CustomButton loading={isSubmitting} onPress={handleSendReset} title="Send Reset Link" />

      <Pressable onPress={() => router.push(ROUTES.login)} hitSlop={10}>
        <Text style={styles.link}>Back to login</Text>
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
  },
  kicker: {
    color: COLORS.primaryGreen,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  title: {
    color: COLORS.darkText,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.mutedText,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  link: {
    color: COLORS.darkGreen,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 22,
    textAlign: "center",
  },
  statusMessage: {
    color: COLORS.primaryGreen,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 14,
    textAlign: "center",
  },
});
