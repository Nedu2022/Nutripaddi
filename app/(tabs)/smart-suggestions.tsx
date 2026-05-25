import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Leaf } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import AppHeader from "@/components/AppHeader";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { MEAL_SUGGESTIONS, SUGGESTION_CATEGORIES } from "@/data/coach";
import { getLucideIcon } from "@/utils/icons";

export default function SmartSuggestionsScreen() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? MEAL_SUGGESTIONS
      : MEAL_SUGGESTIONS.filter((s) => s.category === activeCategory);

  return (
    <ScreenWrapper scroll>
      <AppHeader showBack title="Smart Suggestions" subtitle="Personal meal ideas" />

      {/* Category Chips */}
      <View style={styles.chipRow}>
        {SUGGESTION_CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.chip,
              activeCategory === cat && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                activeCategory === cat && styles.chipTextActive,
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Suggestions */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.list}>
        {filtered.map((suggestion) => {
          const Icon = getLucideIcon(suggestion.iconName);
          return (
            <View key={suggestion.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <Icon color={COLORS.primary} size={22} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{suggestion.name}</Text>
                <Text style={styles.cardDesc}>{suggestion.description}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{suggestion.category}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </Animated.View>

      {/* Tip */}
      <View style={styles.tipCard}>
        <Leaf color={COLORS.primary} size={16} />
        <Text style={styles.tipText}>
          These are simple meal ideas. Pick the amount that fits your goal.
        </Text>
      </View>

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.softOrange,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  cardDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 19,
    marginTop: 3,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.softGreen,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  categoryText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontFamily: FONTS.semiBold,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.softGreen,
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
  },
  tipText: {
    flex: 1,
    color: COLORS.primaryDark,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
});
