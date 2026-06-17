import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";
import { resetPassword } from "@/src/services/authApi";
import { getErrorMessage } from "@/src/services/errorService";

type ResetErrors = Partial<{
  password: string;
  confirmPassword: string;
}>;

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ResetErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: ResetErrors = {};

    if (!password) {
      nextErrors.password = "Please enter a new password.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Both passwords need to match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;

    setFormError("");
    setIsSubmitting(true);

    try {
      await resetPassword({
        password,
      });
      router.replace(ROUTES.login);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper scroll centered>
      <View style={styles.header}>
        <Text style={styles.kicker}>Secure your account</Text>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          Choose a new password you can remember easily.
        </Text>
      </View>

      <InputField
        error={errors.password}
        label="New password"
        onChangeText={setPassword}
        placeholder="At least 6 characters"
        secureTextEntry
        value={password}
      />
      <InputField
        error={errors.confirmPassword}
        label="Confirm new password"
        onChangeText={setConfirmPassword}
        placeholder="Re-enter new password"
        secureTextEntry
        value={confirmPassword}
      />

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      <CustomButton loading={isSubmitting} onPress={handleReset} title="Reset Password" />

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
  formError: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 14,
    textAlign: "center",
  },
});
