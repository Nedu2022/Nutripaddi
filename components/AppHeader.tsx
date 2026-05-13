import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
};

export default function AppHeader({
  title,
  subtitle,
  showBack = false,
  rightElement,
}: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backBtn}
          >
            <ArrowLeft color={COLORS.text} size={22} />
          </Pressable>
        )}
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightElement && <View>{rightElement}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  titles: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: FONTS.extraBold,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
});
