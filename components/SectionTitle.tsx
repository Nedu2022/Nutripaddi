import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

type SectionTitleProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function SectionTitle({ title, actionLabel, onAction }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={10} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <ChevronRight color={COLORS.primary} size={16} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  actionText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
});
