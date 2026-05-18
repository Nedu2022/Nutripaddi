import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Database, Search, WifiOff } from "lucide-react-native";

import ScreenWrapper from "@/components/ScreenWrapper";
import AppHeader from "@/components/AppHeader";
import FoodCard from "@/components/FoodCard";
import CategoryChip from "@/components/CategoryChip";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { AFRICAN_FOODS, FOOD_CATEGORIES } from "@/data/foods";
import { NUTRITION_SOURCE } from "@/data/foodComposition";

export default function FoodDatabaseScreen() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredFoods = AFRICAN_FOODS.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || food.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ScreenWrapper scroll>
      <AppHeader
        showBack
        title="African Food Library"
        subtitle={`${AFRICAN_FOODS.length} local foods with nutrition checks`}
      />

      <View style={styles.referenceCard}>
        <View style={styles.referenceIcon}>
          <Database color={COLORS.primary} size={18} />
        </View>
        <View style={styles.referenceCopy}>
          <Text style={styles.referenceTitle}>Local food nutrition logic</Text>
          <Text style={styles.referenceText}>
            Recognised food + how much you ate maps to nutrition values. Source: {NUTRITION_SOURCE}.
          </Text>
        </View>
        <View style={styles.offlineBadge}>
          <WifiOff color={COLORS.primary} size={13} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search color={COLORS.textLight} size={20} />
        <TextInput
          placeholder="Search amala, egusi, jollof..."
          placeholderTextColor={COLORS.textLight}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
      >
        {FOOD_CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            active={activeCategory === cat}
            label={cat}
            onPress={() => setActiveCategory(cat)}
          />
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={styles.resultCount}>
        {filteredFoods.length} {filteredFoods.length === 1 ? "result" : "results"}
      </Text>

      {/* Food list */}
      {filteredFoods.length > 0 ? (
        filteredFoods.map((food) => <FoodCard key={food.id} food={food} />)
      ) : (
        <View style={styles.emptyState}>
          <Search color={COLORS.textLight} size={40} />
          <Text style={styles.emptyTitle}>We could not find this food</Text>
          <Text style={styles.emptyText}>
            Try another name or browse the local food categories.
          </Text>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  referenceCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: COLORS.softGreen,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  referenceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  referenceCopy: {
    flex: 1,
  },
  referenceTitle: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  referenceText: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
    marginTop: 3,
  },
  offlineBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.medium,
    padding: 0,
  },
  filterRow: {
    marginBottom: 16,
  },
  resultCount: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
});
