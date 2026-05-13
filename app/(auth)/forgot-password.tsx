import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSendReset = () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    router.replace(ROUTES.login);
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

      <CustomButton onPress={handleSendReset} title="Send Reset Link" />

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
});
