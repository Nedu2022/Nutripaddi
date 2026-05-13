import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Search } from "lucide-react-native";

import ScreenWrapper from "@/components/ScreenWrapper";
import AppHeader from "@/components/AppHeader";
import FoodCard from "@/components/FoodCard";
import CategoryChip from "@/components/CategoryChip";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { NIGERIAN_FOODS, FOOD_CATEGORIES } from "@/data/foods";

export default function FoodDatabaseScreen() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredFoods = NIGERIAN_FOODS.filter((food) => {
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
        title="Food Database"
        subtitle={`${NIGERIAN_FOODS.length} Nigerian foods`}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search color={COLORS.textLight} size={20} />
        <TextInput
          placeholder="Search foods..."
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
          <Text style={styles.emptyTitle}>No foods found</Text>
          <Text style={styles.emptyText}>
            Try a different search term or category
          </Text>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
