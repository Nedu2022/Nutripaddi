import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import AppHeader from "@/components/AppHeader";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import {
  getLearnSections,
  getNutritionTips,
  type LearnSection,
} from "@/src/services/contentService";
import type { NutritionTip } from "@/types";
import { getLucideIcon } from "@/utils/icons";

export default function NutritionLessonsScreen() {
  const [sections, setSections] = useState<LearnSection[]>([]);
  const [tips, setTips] = useState<NutritionTip[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadLessons = async () => {
      try {
        const [sectionItems, tipItems] = await Promise.all([
          getLearnSections(),
          getNutritionTips(),
        ]);

        if (!mounted) return;
        setSections(sectionItems);
        setTips(tipItems);
        setLoadError("");
      } catch (error) {
        if (!mounted) return;
        setLoadError(error instanceof Error ? error.message : "Could not load lessons.");
      }
    };

    void loadLessons();

    return () => {
      mounted = false;
    };
  }, []);

  const getDailyRotated = <T,>(items: T[]): T[] => {
    if (!items.length) return [];
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const offset = dayOfYear % items.length;
    return [...items.slice(offset), ...items.slice(0, offset)];
  };

  const dailySections = getDailyRotated(sections);
  const dailyTips = getDailyRotated(tips).slice(0, 4);

  return (
    <ScreenWrapper scroll>
      <AppHeader showBack title="Nutrition Lessons" subtitle="Learn practical food lessons" />

      {/* Lesson Sections */}
      <View style={styles.sections}>
        {dailySections.map((section, index) => {
          const Icon = getLucideIcon(section.iconName);
          return (
            <Animated.View key={section.id} entering={FadeInUp.delay(index * 120).duration(400)}>
              <Pressable style={styles.sectionCard}>
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
            </Animated.View>
          );
        })}
      </View>

      {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

      {/* Featured Tips */}
      <Text style={styles.featuredLabel}>Featured Tips</Text>
      {dailyTips.map((tip, index) => {
        const TipIcon = getLucideIcon(tip.iconName);
        return (
          <Animated.View key={tip.id} entering={FadeInUp.delay((index + dailySections.length) * 120).duration(400)}>
            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <TipIcon color={COLORS.primary} size={18} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.content}</Text>
              </View>
            </View>
          </Animated.View>
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
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginBottom: 12,
    textAlign: "center",
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
