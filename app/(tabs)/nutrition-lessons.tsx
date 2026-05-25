import { StyleSheet, Text, View, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import AppHeader from "@/components/AppHeader";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { LEARN_SECTIONS, NUTRITION_TIPS } from "@/data/tips";
import { getLucideIcon } from "@/utils/icons";

export default function NutritionLessonsScreen() {
  return (
    <ScreenWrapper scroll>
      <AppHeader showBack title="Nutrition Lessons" subtitle="Learn practical food lessons" />

      {/* Lesson Sections */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.sections}>
        {LEARN_SECTIONS.map((section) => {
          const Icon = getLucideIcon(section.iconName);
          return (
            <Pressable key={section.id} style={styles.sectionCard}>
              <View style={styles.sectionIcon}>
                <Icon color={COLORS.primary} size={22} />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDesc}>{section.description}</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{section.tipCount}</Text>
              </View>
            </Pressable>
          );
        })}
      </Animated.View>

      {/* Featured Tips */}
      <Text style={styles.featuredLabel}>Featured Tips</Text>
      {NUTRITION_TIPS.slice(0, 4).map((tip) => {
        const TipIcon = getLucideIcon(tip.iconName);
        return (
          <View key={tip.id} style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <TipIcon color={COLORS.primary} size={18} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.content}</Text>
            </View>
          </View>
        );
      })}

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sections: {
    gap: 10,
    marginBottom: 28,
  },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  sectionDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.softOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  featuredLabel: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONTS.extraBold,
    marginBottom: 14,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    marginBottom: 10,
  },
  tipIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  tipText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginTop: 3,
  },
});
