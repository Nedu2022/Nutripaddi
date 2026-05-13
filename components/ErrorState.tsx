import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import CustomButton from "./CustomButton";

type ErrorStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  icon,
  title,
  description,
  retryLabel = "Try Again",
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry && (
        <CustomButton
          title={retryLabel}
          onPress={onRetry}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.softRed,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontFamily: FONTS.bold,
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontFamily: FONTS.regular,
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 300,
  },
  button: {
    marginTop: 24,
    width: "auto",
    paddingHorizontal: 32,
  },
});
