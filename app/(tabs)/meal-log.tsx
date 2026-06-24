/**
 * Meal Log Tab
 *
 * Performance notes
 * ─────────────────
 * • React Query — 30 s staleTime means repeated tab taps skip the network.
 * • FlatList replaces ScrollView + map() for proper windowing.
 * • Mixed flat array (section headers + meal rows) keeps a single FlatList
 *   with getItemLayout, avoiding nested SectionList complexity.
 * • MEAL_CARD_TOTAL / SECTION_TOTAL are fixed so getItemLayout is O(1).
 * • MealCard is memoized; renderItem is stable via useCallback.
 * • initialNumToRender=8, windowSize=5, removeClippedSubviews on Android.
 * • useFocusEffect refetches on tab focus; staleTime prevents redundant calls.
 *
 * Offline
 * ───────
 * • When offline + cached data → shows data + global OfflineBanner.
 * • When offline + no cache → shows friendly offline empty state.
 * • Retry button re-triggers the query.
 * • On reconnect, React Query's networkMode:"online" auto-resumes.
 */

import { useCallback, useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronRight,
  Coffee,
  Moon,
  ScanLine,
  TrendingUp,
  Utensils,
  WifiOff,
  Zap,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MealCard, MEAL_CARD_TOTAL } from "@/components/MealCard";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsOffline } from "@/src/hooks/useNetworkStatus";
import {
  getDailyTotalsFromMeals,
  getTodayMeals,
  type DailyTotals,
  type SavedMeal,
} from "@/src/services/mealHistoryService";
import { getProfile } from "@/src/services/profileService";

// ── Design tokens — vibrant nutrition palette ─────────────────────────────────
const D = {
  bg:         "#F8FAFC",
  card:       "#FFFFFF",
  border:     "#E2E8F0",
  divider:    "#E2E8F0",
  text:       "#0F172A",
  muted:      "#64748B",
  light:      "#94A3B8",
  accent:     "#16A34A",   // green — brand / protein
  accentDim:  "#F0FDF4",
  orange:     "#F97316",   // carbs / energy / breakfast
  orangeDim:  "#FFF7ED",
  purple:     "#8B5CF6",   // fat / snack
  purpleDim:  "#F5F3FF",
  sky:        "#0284C7",   // dinner / evening / depth
  skyDim:     "#E0F2FE",
};

// ── Constants ──────────────────────────────────────────────────────────────────
// Same tone assignments as home screen: terra=morning, green=midday, dusk=evening, stone=snack
const MEAL_CATEGORIES = [
  { key: "Breakfast" as const, Icon: Coffee,   dot: D.orange  },
  { key: "Lunch"     as const, Icon: Utensils, dot: D.accent  },
  { key: "Dinner"    as const, Icon: Moon,     dot: D.sky     },
  { key: "Snack"     as const, Icon: Zap,      dot: D.purple  },
];

const MACROS = [
  { label: "Carbs",   key: "carbs"   as const, dot: D.orange  },
  { label: "Protein", key: "protein" as const, dot: D.accent  },
  { label: "Fat",     key: "fat"     as const, dot: D.purple  },
];

const EMPTY_TOTALS: DailyTotals = { calories: 0, carbs: 0, fat: 0, protein: 0, target: 0 };

// FlatList layout constants — must match MealCard and SectionHeader styles exactly
const SECTION_HEIGHT   = 36;
const SECTION_MARGIN_V = 14;   // marginTop (6) + marginBottom (8)
const SECTION_TOTAL    = SECTION_HEIGHT + SECTION_MARGIN_V;  // 50

// ── Flat-list item types ───────────────────────────────────────────────────────
type SectionItem = { type: "section"; mealType: string; totalCals: number };
type MealItem    = { type: "meal"; meal: SavedMeal };
type FlatItem    = SectionItem | MealItem;

// ── Data fetcher ───────────────────────────────────────────────────────────────
async function fetchMealLogData() {
  const [profile, todayMeals] = await Promise.all([getProfile(), getTodayMeals()]);
  return { meals: todayMeals, target: profile.dailyCalorieTarget ?? 0 };
}

// ── Section header (defined outside component so it is never recreated) ────────
function SectionHeader({ mealType, totalCals }: { mealType: string; totalCals: number }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{mealType}</Text>
      <Text style={s.sectionCals}>{totalCals} kcal</Text>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function MealLogTab() {
  const { t }     = useLanguage();
  const isOffline = useIsOffline();
  const insets    = useSafeAreaInsets();

  const tabBarPadding = Platform.OS === "web" ? 96 : Math.max(96, insets.bottom + 92);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey:        ["meals-today"],
    queryFn:         fetchMealLogData,
    staleTime:       30_000,
    placeholderData: (prev) => prev,  // keep showing stale data while revalidating
  });

  useFocusEffect(
    useCallback(() => { void refetch(); }, [refetch])
  );

  const meals       = data?.meals  ?? [];
  const target      = data?.target ?? 0;
  const dailyTotals = useMemo(() => getDailyTotalsFromMeals(meals, target), [meals, target]);

  // ── Build flat FlatList data ─────────────────────────────────────────────
  const flatItems = useMemo<FlatItem[]>(() => {
    const result: FlatItem[] = [];
    for (const cat of MEAL_CATEGORIES) {
      const catMeals = meals.filter((m) => m.mealType === cat.key);
      if (catMeals.length === 0) continue;
      result.push({
        type:      "section",
        mealType:  cat.key,
        totalCals: catMeals.reduce((sum, m) => sum + m.calories, 0),
      });
      for (const meal of catMeals) {
        result.push({ type: "meal", meal });
      }
    }
    return result;
  }, [meals]);

  // Pre-computed offsets → O(1) getItemLayout
  const offsets = useMemo<number[]>(() => {
    const arr: number[] = [0];
    for (const item of flatItems) {
      const prev   = arr[arr.length - 1]!;
      arr.push(prev + (item.type === "section" ? SECTION_TOTAL : MEAL_CARD_TOTAL));
    }
    return arr;
  }, [flatItems]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: flatItems[index]?.type === "section" ? SECTION_TOTAL : MEAL_CARD_TOTAL,
      offset: offsets[index] ?? 0,
      index,
    }),
    [flatItems, offsets]
  );

  const keyExtractor = useCallback(
    (item: FlatItem) =>
      item.type === "section" ? `sec-${item.mealType}` : `meal-${item.meal.id}`,
    []
  );

  const renderItem = useCallback<ListRenderItem<FlatItem>>(({ item }) => {
    if (item.type === "section") {
      return <SectionHeader mealType={item.mealType} totalCals={item.totalCals} />;
    }
    return (
      <MealCard
        meal={item.meal}
        onPress={() => router.push({ pathname: "/(tabs)/meal-details", params: { id: item.meal.id } })}
      />
    );
  }, []);

  // ── Derived display values ─────────────────────────────────────────────────
  const progressPct  = dailyTotals.target > 0 ? Math.min(dailyTotals.calories / dailyTotals.target, 1) : 0;
  const remaining    = Math.max(dailyTotals.target - dailyTotals.calories, 0);
  const getMealCount = (type: string) => meals.filter((m) => m.mealType === type).length;
  const getTypeCals  = (type: string) => meals.filter((m) => m.mealType === type).reduce((x, m) => x + m.calories, 0);
  const todayDate    = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  // ── List header ────────────────────────────────────────────────────────────
  const ListHeader = useMemo(() => (
    <View>
      {/* TITLE ROW */}
      <Animated.View entering={FadeInDown.duration(320)} style={s.header}>
        <View>
          <Text style={s.title}>Meal Log</Text>
          <Text style={s.subtitle}>{todayDate}</Text>
        </View>
        <View style={s.countBadge}>
          <Text style={s.countText}>{meals.length} logged</Text>
        </View>
      </Animated.View>

      {/* OFFLINE NOTICE — only when no cached data */}
      {isOffline && meals.length === 0 && (
        <Animated.View entering={FadeInDown.delay(40).duration(280)} style={s.offlineCard}>
          <WifiOff color={D.orange} size={20} />
          <View style={s.offlineTextWrap}>
            <Text style={s.offlineTitle}>You're offline</Text>
            <Text style={s.offlineSub}>
              No cached meals available. Connect to load your log.
            </Text>
          </View>
          <Pressable onPress={() => void refetch()} style={s.retryBtn}>
            <Text style={s.retryBtnText}>Retry</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* FETCH ERROR */}
      {error && !isOffline && (
        <Animated.View entering={FadeInDown.delay(40).duration(280)} style={s.errorCard}>
          <Text style={s.errorText} numberOfLines={2}>
            {error instanceof Error ? error.message : "Could not load meals."}
          </Text>
          <Pressable onPress={() => void refetch()} style={s.retryBtnSmall}>
            <Text style={s.retryBtnSmallText}>Retry</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* SUMMARY CARD */}
      <Animated.View entering={FadeInDown.delay(50).duration(320)} style={s.summaryCard}>
        <Text style={s.summaryEyebrow}>{"TODAY'S INTAKE"}</Text>
        <View style={s.summaryRow}>
          <Text style={s.summaryNum}>{dailyTotals.calories.toLocaleString()}</Text>
          <Text style={s.summaryUnit}>kcal</Text>
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progressPct * 100}%` as any }]} />
        </View>
        <View style={s.summaryFooter}>
          <View style={s.summaryFooterItem}>
            <TrendingUp color={D.accent} size={12} />
            <Text style={s.summaryFooterText}>
              {Math.round(progressPct * 100)}% of {dailyTotals.target.toLocaleString()} goal
            </Text>
          </View>
          <Text style={s.summaryDivider}>·</Text>
          <Text style={s.summaryFooterText}>{remaining.toLocaleString()} kcal left</Text>
        </View>
      </Animated.View>

      {/* MACRO STRIP */}
      <Animated.View entering={FadeInDown.delay(100).duration(320)} style={s.macroStrip}>
        {MACROS.map((m, i) => (
          <View key={m.label} style={[s.macroCell, i < MACROS.length - 1 && s.macroCellBorder]}>
            <View style={s.macroDotRow}>
              <View style={[s.macroDot, { backgroundColor: m.dot }]} />
              <Text style={s.macroCellLabel}>{m.label}</Text>
            </View>
            <Text style={s.macroCellVal}>
              {dailyTotals[m.key]}
              <Text style={s.macroCellG}>g</Text>
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* CATEGORY GRID */}
      <Animated.View entering={FadeInDown.delay(150).duration(320)} style={s.catGrid}>
        {MEAL_CATEGORIES.map((cat) => {
          const count  = getMealCount(cat.key);
          const cals   = getTypeCals(cat.key);
          const active = count > 0;
          return (
            <View key={cat.key} style={s.catCard}>
              <View style={[s.catIconWrap, active && s.catIconWrapActive]}>
                <cat.Icon color={active ? D.accent : D.light} size={17} />
              </View>
              <Text style={s.catName}>{cat.key}</Text>
              <Text style={[s.catCals, !active && s.catCalsEmpty]}>
                {active ? `${cals} kcal` : "Empty"}
              </Text>
            </View>
          );
        })}
      </Animated.View>

      {flatItems.length > 0 && (
        <Animated.View entering={FadeInDown.delay(190).duration(320)}>
          <Text style={s.mealsSectionLabel}>Today's meals</Text>
        </Animated.View>
      )}
    </View>
  ), [dailyTotals, meals.length, progressPct, remaining, flatItems.length, isOffline, error, todayDate, refetch]);
  // eslint-disable-line react-hooks/exhaustive-deps

  // ── List footer ────────────────────────────────────────────────────────────
  const ListFooter = (
    <Animated.View entering={FadeInDown.delay(300).duration(320)}>
      <Pressable
        onPress={() => router.push(ROUTES.nutritionHistory)}
        style={s.reportCard}
      >
        <View style={s.reportLeft}>
          <View style={s.reportIconWrap}>
            <CalendarDays color={D.accent} size={19} />
          </View>
          <View>
            <Text style={s.reportTitle}>{t.viewWeeklyReport}</Text>
            <Text style={s.reportSub}>{t.weeklyReportText}</Text>
          </View>
        </View>
        <ChevronRight color={D.light} size={18} />
      </Pressable>
    </Animated.View>
  );

  // ── Empty state ────────────────────────────────────────────────────────────
  const ListEmpty = !isLoading && !isOffline ? (
    <Animated.View entering={FadeInDown.delay(200).duration(300)} style={s.emptyState}>
      <View style={s.emptyIconWrap}>
        <Utensils color={D.light} size={28} strokeWidth={1.5} />
      </View>
      <Text style={s.emptyTitle}>No meals logged yet</Text>
      <Text style={s.emptySub}>Scan or log your first meal to see it here.</Text>
      <Pressable onPress={() => router.push(ROUTES.scan)} style={s.emptyBtn}>
        <ScanLine color="#FFFFFF" size={14} />
        <Text style={s.emptyBtnText}>Scan a Meal</Text>
      </Pressable>
    </Animated.View>
  ) : null;

  // ── Skeleton (first-ever load before any data is cached) ─────────────────
  if (isLoading && !data) {
    return (
      <View style={{ flex: 1, backgroundColor: D.bg, paddingHorizontal: 18, paddingTop: 28 }}>
        <View style={{ gap: 8, marginBottom: 24 }}>
          <View style={s.skLine} />
          <View style={[s.skLine, { width: "45%", height: 14 }]} />
        </View>
        <View style={[s.skCard, { height: 108, marginBottom: 12 }]} />
        <View style={[s.skCard, { height: 58, marginBottom: 12 }]} />
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[s.skCard, { flex: 1, height: 74 }]} />
          ))}
        </View>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[s.skCard, {
              height: 74,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              gap: 12,
            }]}
          >
            <View style={[s.skCircle, { width: 42, height: 42 }]} />
            <View style={{ flex: 1, gap: 7 }}>
              <View style={[s.skLine, { width: "68%", height: 14 }]} />
              <View style={[s.skLine, { width: "38%", height: 11 }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <FlatList
      data={flatItems}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      ListEmptyComponent={ListEmpty}
      getItemLayout={getItemLayout}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={5}
      updateCellsBatchingPeriod={30}
      removeClippedSubviews={Platform.OS === "android"}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[s.listContent, { paddingBottom: tabBarPadding }]}
      style={{ flex: 1, backgroundColor: D.bg }}
    />
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  listContent: { paddingHorizontal: 18, paddingTop: 14 },

  // Header
  header: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginTop:      16,
    marginBottom:   20,
  },
  title:    { color: D.text,  fontSize: 28, fontFamily: FONTS.extraBold },
  subtitle: { color: D.muted, fontSize: 13, fontFamily: FONTS.medium, marginTop: 3 },
  countBadge: {
    backgroundColor:   D.accentDim,
    borderRadius:      999,
    paddingHorizontal: 14,
    paddingVertical:   7,
  },
  countText: { color: D.accent, fontSize: 12, fontFamily: FONTS.bold },

  // Offline card
  offlineCard: {
    flexDirection:   "row",
    alignItems:      "flex-start",
    gap:             12,
    backgroundColor: "#FFF4EE",
    borderRadius:    16,
    padding:         14,
    marginBottom:    14,
  },
  offlineTextWrap: { flex: 1 },
  offlineTitle: { color: D.orange, fontSize: 13, fontFamily: FONTS.bold, marginBottom: 3 },
  offlineSub:   { color: D.muted, fontSize: 12, fontFamily: FONTS.regular, lineHeight: 18 },
  retryBtn: {
    backgroundColor: D.orange,
    borderRadius:      10,
    paddingHorizontal: 12,
    paddingVertical:   7,
    alignSelf:         "flex-start",
  },
  retryBtnText: { color: "#FFFFFF", fontSize: 12, fontFamily: FONTS.bold },

  // Error card
  errorCard: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             10,
    backgroundColor: "#FEF2F2",
    borderRadius:    14,
    padding:         12,
    marginBottom:    12,
  },
  errorText:       { color: "#B91C1C", fontSize: 12, fontFamily: FONTS.medium, flex: 1 },
  retryBtnSmall: {
    backgroundColor:   "#B91C1C",
    borderRadius:      8,
    paddingHorizontal: 10,
    paddingVertical:   5,
  },
  retryBtnSmallText: { color: "#FFFFFF", fontSize: 11, fontFamily: FONTS.bold },

  // Summary card
  summaryCard: {
    backgroundColor: D.card,
    borderRadius:    22,
    padding:         20,
    marginBottom:    12,
    shadowColor:     "#000",
    shadowOpacity:   0.05,
    shadowRadius:    14,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       3,
  },
  summaryEyebrow: { color: D.light, fontSize: 10, fontFamily: FONTS.semiBold, letterSpacing: 1, marginBottom: 10 },
  summaryRow:     { flexDirection: "row", alignItems: "flex-end", gap: 6, marginBottom: 14 },
  summaryNum:     { color: D.text, fontSize: 44, fontFamily: FONTS.extraBold, lineHeight: 48 },
  summaryUnit:    { color: D.muted, fontSize: 14, fontFamily: FONTS.semiBold, marginBottom: 8 },
  progressTrack: {
    height: 6, borderRadius: 999, backgroundColor: "#EEEEEE", overflow: "hidden", marginBottom: 12,
  },
  progressFill:      { height: "100%", borderRadius: 999, backgroundColor: D.accent },
  summaryFooter:     { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryFooterItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  summaryFooterText: { color: D.muted, fontSize: 12, fontFamily: FONTS.medium },
  summaryDivider:    { color: D.light, fontSize: 12 },

  // Macro strip
  macroStrip: {
    flexDirection:   "row",
    backgroundColor: D.card,
    borderRadius:    18,
    marginBottom:    14,
    paddingVertical: 16,
    shadowColor:     "#000",
    shadowOpacity:   0.04,
    shadowRadius:    10,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       2,
  },
  macroCell:       { flex: 1, alignItems: "center", gap: 6 },
  macroCellBorder: { borderRightWidth: 1, borderRightColor: "#F5F5F5" },
  macroDotRow:     { flexDirection: "row", alignItems: "center", gap: 5 },
  macroDot:        { width: 6, height: 6, borderRadius: 3 },
  macroCellLabel:  { color: D.muted, fontSize: 11, fontFamily: FONTS.medium },
  macroCellVal:    { color: D.text, fontSize: 20, fontFamily: FONTS.extraBold },
  macroCellG:      { fontSize: 12, fontFamily: FONTS.semiBold, color: D.light },

  // Category grid
  catGrid: { flexDirection: "row", gap: 10, marginBottom: 24 },
  catCard: {
    flex:            1,
    backgroundColor: D.card,
    borderRadius:    18,
    padding:         14,
    alignItems:      "center",
    gap:             5,
    shadowColor:     "#000",
    shadowOpacity:   0.04,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       2,
  },
  catIconWrap:       { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  catIconWrapActive: { backgroundColor: D.accentDim },
  catName:           { color: D.text, fontSize: 10, fontFamily: FONTS.bold },
  catCals:           { color: D.accent, fontSize: 11, fontFamily: FONTS.extraBold },
  catCalsEmpty:      { color: D.light, fontFamily: FONTS.medium },

  mealsSectionLabel: { color: D.text, fontSize: 17, fontFamily: FONTS.extraBold, marginBottom: 12 },

  // Section header inside FlatList
  sectionHeader: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    height:         SECTION_HEIGHT,
    marginTop:      6,
    marginBottom:   8,
  },
  sectionTitle: { color: D.text,  fontSize: 15, fontFamily: FONTS.extraBold },
  sectionCals:  { color: D.light, fontSize: 12, fontFamily: FONTS.semiBold },

  // Empty state
  emptyState: { alignItems: "center", paddingTop: 24, paddingBottom: 16, gap: 8 },
  emptyIconWrap: {
    width:           72,
    height:          72,
    borderRadius:    24,
    backgroundColor: "#F0EDE6",
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    4,
  },
  emptyTitle: { color: D.text,  fontSize: 16, fontFamily: FONTS.extraBold },
  emptySub:   { color: D.muted, fontSize: 13, fontFamily: FONTS.regular, textAlign: "center" },
  emptyBtn: {
    marginTop:         8,
    flexDirection:     "row",
    alignItems:        "center",
    gap:               8,
    backgroundColor:   D.accent,
    borderRadius:      14,
    paddingHorizontal: 22,
    paddingVertical:   12,
  },
  emptyBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: FONTS.bold },

  // Skeleton placeholders
  skCard:   { backgroundColor: "#EBEBEB", borderRadius: 16 },
  skLine:   { backgroundColor: "#EBEBEB", borderRadius: 6, height: 20, width: "100%" },
  skCircle: { backgroundColor: "#EBEBEB", borderRadius: 999 },

  // Weekly report CTA
  reportCard: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    backgroundColor:   D.card,
    borderRadius:      20,
    padding:           16,
    marginTop:         8,
    shadowColor:       "#000",
    shadowOpacity:     0.05,
    shadowRadius:      12,
    shadowOffset:      { width: 0, height: 3 },
    elevation:         2,
  },
  reportLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  reportIconWrap: {
    width:           46,
    height:          46,
    borderRadius:    15,
    backgroundColor: D.accentDim,
    alignItems:      "center",
    justifyContent:  "center",
  },
  reportTitle: { color: D.text,  fontSize: 15, fontFamily: FONTS.bold },
  reportSub:   { color: D.muted, fontSize: 12, fontFamily: FONTS.medium, marginTop: 2, lineHeight: 17 },
});
