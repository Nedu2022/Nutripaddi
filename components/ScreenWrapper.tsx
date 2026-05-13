import { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "@/constants/colors";

type ScreenWrapperProps = {
  children: ReactNode;
  scroll?: boolean;
  centered?: boolean;
  contentStyle?: ViewStyle;
  bg?: string;
};

export default function ScreenWrapper({
  children,
  scroll = false,
  centered = false,
  contentStyle,
  bg,
}: ScreenWrapperProps) {
  const content = (
    <View style={[styles.content, centered && styles.centered, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, bg ? { backgroundColor: bg } : undefined]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        {scroll ? (
          <ScrollView
            bounces={false}
            contentContainerStyle={[
              styles.scrollContent,
              centered && styles.centered,
              contentStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  centered: {
    justifyContent: "center",
  },
});
