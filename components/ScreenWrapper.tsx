import { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSegments } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const isTabRoute = segments[0] === "(tabs)";
  const tabBarPadding = Platform.OS === "web" ? 96 : Math.max(96, insets.bottom + 92);
  const regularPadding = Platform.OS === "web" ? 24 : Math.max(24, insets.bottom + 20);
  const scrollBottomPadding = isTabRoute ? tabBarPadding : regularPadding;

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
              { paddingBottom: scrollBottomPadding },
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
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  centered: {
    justifyContent: "center",
  },
});
