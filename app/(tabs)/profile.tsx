import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Settings, ChevronRight, Award, Heart, Shield,
  Activity, Scale, Ruler, Calendar, LogOut, Globe, Database,
  SlidersHorizontal, Utensils,
  Target, Flame, Baby,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { clearAuthSession } from "@/src/services/authSessionService";
import {
  getMealsForWeek,
  getWeeklyCaloriesFromMeals,
  type WeeklyCalories,
} from "@/src/services/mealHistoryService";
import { readDashboardCache } from "@/src/services/dashboardCache";
import { describeMaternalStage } from "@/src/services/maternalNutrition";
import { getProfile, type ProfileData } from "@/src/services/profileService";

// ── Vibrant nutrition palette ─────────────────────────────────────────────────
const D = {
  bg:           "#F8FAFC",
  card:         "#FFFFFF",
  cardBorder:   "rgba(15,23,42,0.07)",
  border:       "#E2E8F0",
  text:         "#0F172A",
  muted:        "#64748B",
  light:        "#94A3B8",

  green:        "#16A34A",
  greenDim:     "#F0FDF4",
  greenBorder:  "rgba(22,163,74,0.18)",

  orange:       "#F97316",
  orangeDim:    "#FFF7ED",
  orangeBorder: "rgba(249,115,22,0.18)",

  purple:       "#8B5CF6",
  purpleDim:    "#F5F3FF",
  purpleBorder: "rgba(139,92,246,0.18)",

  sky:          "#0284C7",
  skyDim:       "#E0F2FE",
  skyBorder:    "rgba(2,132,199,0.18)",

  danger:       "#DC2626",
  dangerDim:    "rgba(220,38,38,0.08)",
};

type IconCircleProps = { icon: React.ReactNode; bg: string };
function IconCircle({ icon, bg }: IconCircleProps) {
  return <View style={[styles.iconCircle, { backgroundColor: bg }]}>{icon}</View>;
}

type MenuRowProps = {
  icon:     React.ReactNode;
  iconBg:   string;
  label:    string;
  value?:   string;
  onPress?: () => void;
  danger?:  boolean;
  last?:    boolean;
};

function MenuRow({ icon, iconBg, label, value, onPress, danger, last }: MenuRowProps) {
  // Compress "Item 1, Item 2, Item 3" → "Item 1  +2" so the value never wraps
  let displayValue = value;
  if (value?.includes(",")) {
    const parts = value.split(",").map((v) => v.trim()).filter(Boolean);
    displayValue = parts.length > 1 ? `${parts[0]}  +${parts.length - 1}` : parts[0];
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        !last && styles.menuRowBorder,
        pressed && styles.menuRowPressed,
      ]}
    >
      <View style={styles.menuLeft}>
        <IconCircle icon={icon} bg={iconBg} />
        <Text style={[styles.menuLabel, danger && { color: D.danger }]}>{label}</Text>
      </View>
      {displayValue ? (
        <Text style={styles.menuValue} numberOfLines={1}>{displayValue}</Text>
      ) : (
        <ChevronRight color={D.light} size={18} />
      )}
    </Pressable>
  );
}

function getCurrentStreak(days: WeeklyCalories[]) {
  let count = 0;
  for (const day of days.slice().reverse()) {
    if (day.value <= 0) break;
    count += 1;
  }
  return count;
}

type ProfileQueryData = {
  profile:        ProfileData;
  weeklyCalories: WeeklyCalories[];
  mealCount:      number;
};

export default function ProfileTab() {
  const { t, language } = useLanguage();
  const [cachedSnapshot, setCachedSnapshot] = useState<ProfileQueryData | undefined>();

  useEffect(() => {
    readDashboardCache()
      .then((c) => {
        if (!c) return;
        setCachedSnapshot({
          profile:        c.profile,
          weeklyCalories: getWeeklyCaloriesFromMeals(c.weekMeals),
          mealCount:      c.weekMeals.length,
        });
      })
      .catch(() => {});
  }, []);

  const { data: profileData, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const [p, weekMeals] = await Promise.all([getProfile(), getMealsForWeek()]);
      return {
        profile:        p,
        weeklyCalories: getWeeklyCaloriesFromMeals(weekMeals),
        mealCount:      weekMeals.length,
      };
    },
    staleTime:       120_000,
    placeholderData: cachedSnapshot,
  });

  const profile        = profileData?.profile ?? null;
  const weeklyCalories = profileData?.weeklyCalories ?? [];
  const mealCount      = profileData?.mealCount ?? 0;
  const loadError      = error ? (error instanceof Error ? error.message : "Could not load profile.") : "";

  const handleLogout = async () => {
    await clearAuthSession();
    router.replace(ROUTES.login);
  };

  const langDisplay: Record<string, string> = {
    english: "English", yoruba: "Yorùbá", hausa: "Hausa", igbo: "Igbo",
  };
  const displayName = profile?.nickname || profile?.fullName || "NutriPadi user";
  const email       = profile?.email ?? "";
  const initials    = displayName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const daysStreak  = getCurrentStreak(weeklyCalories);
  const caloriesAvg = weeklyCalories.length
    ? Math.round(weeklyCalories.reduce((sum, d) => sum + d.value, 0) / weeklyCalories.length)
    : 0;

  return (
    <ScreenWrapper scroll bg={D.bg}>

      {/* ── AVATAR HEADER ────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(320)} style={styles.header}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            {profile?.photoUri ? (
              <Image contentFit="cover" source={{ uri: profile.photoUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.initials}>{initials || "NP"}</Text>
            )}
          </View>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        {profile?.nutritionGoal ? (
          <View style={styles.goalBadge}>
            <Target color={D.green} size={11} />
            <Text style={styles.goalBadgeText}>{profile.nutritionGoal}</Text>
          </View>
        ) : null}
      </Animated.View>

      {loadError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : null}

      {/* ── STATS ROW ─────────────────────────────────────────────────────
          green = meals (health/activity)
          terra = streak (warm energy, momentum)
          stone = avg kcal (neutral metric)
      ───────────────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(50).duration(320)} style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: D.greenDim }]}>
          <View style={[styles.statIcon, { backgroundColor: D.card }]}>
            <Activity color={D.green} size={16} />
          </View>
          <Text style={[styles.statNum, { color: D.green }]}>{mealCount}</Text>
          <Text style={styles.statLabel}>{t.mealsLogged}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: D.orangeDim }]}>
          <View style={[styles.statIcon, { backgroundColor: D.card }]}>
            <Flame color={D.orange} size={16} />
          </View>
          <Text style={[styles.statNum, { color: D.orange }]}>{daysStreak}</Text>
          <Text style={styles.statLabel}>{t.daysStreak}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: D.purpleDim }]}>
          <View style={[styles.statIcon, { backgroundColor: D.card }]}>
            <Award color={D.purple} size={16} />
          </View>
          <Text style={[styles.statNum, { color: D.purple }]}>{caloriesAvg}</Text>
          <Text style={styles.statLabel}>Avg kcal</Text>
        </View>
      </Animated.View>

      {/* ── HEALTH INFO ───────────────────────────────────────────────────
          Each icon colour is assigned by meaning:
            green  → life, health, goals, food
            terra  → warmth, maternal care, aspiration
            stone  → neutral measurements, global/settings
            dusk   → depth, protection, technology
      ───────────────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(100).duration(320)} style={styles.section}>
        <Text style={styles.sectionTitle}>{t.healthInfo}</Text>
        <View style={styles.sectionCard}>
          {profile?.lifeStage && profile.lifeStage !== "general" ? (
            <MenuRow
              icon={<Baby color={D.orange} size={16} />}
              iconBg={D.orangeDim}
              label={t.lifeStageLabel}
              value={describeMaternalStage(profile.lifeStage, profile.trimester, profile.babyAgeMonths) ?? "Not set"}
            />
          ) : null}
          <MenuRow
            icon={<Calendar color={D.green} size={16} />}
            iconBg={D.greenDim}
            label={t.age}
            value={profile?.age ? `${profile.age} yrs` : "Not set"}
          />
          <MenuRow
            icon={<Scale color={D.purple} size={16} />}
            iconBg={D.purpleDim}
            label={t.weight}
            value={profile?.weight ? `${profile.weight} kg` : "Not set"}
          />
          <MenuRow
            icon={<Ruler color={D.purple} size={16} />}
            iconBg={D.purpleDim}
            label={t.height}
            value={profile?.height ? `${profile.height} cm` : "Not set"}
          />
          <MenuRow
            icon={<Heart color={D.orange} size={16} />}
            iconBg={D.orangeDim}
            label={t.nutritionGoal}
            value={profile?.nutritionGoal ?? "Not set"}
          />
          <MenuRow
            icon={<Utensils color={D.green} size={16} />}
            iconBg={D.greenDim}
            label={t.eatingLifestyle}
            value={profile?.eatingLifestyle ?? "Not set"}
          />
          <MenuRow
            icon={<Shield color={D.sky} size={16} />}
            iconBg={D.skyDim}
            label={t.healthAwareness}
            value={profile?.healthAwareness ?? "Not set"}
          />
          <MenuRow
            icon={<Globe color={D.purple} size={16} />}
            iconBg={D.purpleDim}
            label={t.language}
            value={profile?.language ? langDisplay[profile.language] ?? profile.language : langDisplay[language]}
          />
          <MenuRow
            icon={<SlidersHorizontal color={D.sky} size={16} />}
            iconBg={D.skyDim}
            label={t.aiAdviceTone}
            value={profile?.aiTone ?? "Not set"}
            last
          />
        </View>
      </Animated.View>

      {/* ── CONTRIBUTION ─────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(150).duration(320)} style={styles.section}>
        <Text style={styles.sectionTitle}>Contribution</Text>
        <View style={styles.sectionCard}>
          <MenuRow
            icon={<Database color={D.green} size={16} />}
            iconBg={D.greenDim}
            label="Dataset Contribution"
            onPress={() => router.push(ROUTES.datasetContribution)}
            last
          />
        </View>
      </Animated.View>

      {/* ── GENERAL ──────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(200).duration(320)} style={styles.section}>
        <Text style={styles.sectionTitle}>{t.general}</Text>
        <View style={styles.sectionCard}>
          <MenuRow
            icon={<Settings color={D.purple} size={16} />}
            iconBg={D.purpleDim}
            label={t.settings}
            onPress={() => router.push(ROUTES.settings)}
          />
          <MenuRow
            icon={<LogOut color={D.danger} size={16} />}
            iconBg={D.dangerDim}
            label={t.logout}
            onPress={handleLogout}
            danger
            last
          />
        </View>
      </Animated.View>

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Header
  header: { alignItems: "center", marginTop: 20, marginBottom: 24 },
  avatarRing: {
    width:           108,
    height:          108,
    borderRadius:    54,
    borderWidth:     3,
    borderColor:     D.green,
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    14,
    shadowColor:     D.green,
    shadowOpacity:   0.18,
    shadowRadius:    12,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       5,
  },
  avatar: {
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: D.greenDim,
    alignItems:      "center",
    justifyContent:  "center",
    overflow:        "hidden",
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  initials: { color: D.green, fontSize: 36, fontFamily: FONTS.extraBold },
  name:     { color: D.text,  fontSize: 26, fontFamily: FONTS.extraBold },
  email:    { color: D.muted, fontSize: 14, fontFamily: FONTS.medium, marginTop: 4 },
  errorCard: {
    backgroundColor: D.dangerDim,
    borderColor:     D.orangeBorder,
    borderRadius:    14,
    borderWidth:     1,
    marginBottom:    14,
    padding:         12,
  },
  errorText: { color: D.danger, fontSize: 12, fontFamily: FONTS.medium },
  goalBadge: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               5,
    backgroundColor:   D.greenDim,
    borderRadius:      999,
    paddingHorizontal: 12,
    paddingVertical:   6,
    marginTop:         10,
    borderWidth:       1,
    borderColor:       D.greenBorder,
  },
  goalBadgeText: { color: D.green, fontSize: 12, fontFamily: FONTS.semiBold },

  // Stats
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: {
    flex:         1,
    borderRadius: 20,
    padding:      14,
    alignItems:   "center",
    gap:          5,
  },
  statIcon: {
    width:          36,
    height:         36,
    borderRadius:   11,
    alignItems:     "center",
    justifyContent: "center",
    marginBottom:   2,
    shadowColor:    "#000",
    shadowOpacity:  0.06,
    shadowRadius:   6,
    shadowOffset:   { width: 0, height: 2 },
    elevation:      2,
  },
  statNum:   { fontSize: 20, fontFamily: FONTS.extraBold, lineHeight: 24 },
  statLabel: { color: D.muted, fontSize: 10, fontFamily: FONTS.medium, textAlign: "center" },

  // Sections
  section: { marginBottom: 18 },
  sectionTitle: {
    color:        D.text,
    fontSize:     16,
    fontFamily:   FONTS.extraBold,
    marginBottom: 10,
    marginLeft:   2,
  },
  sectionCard: {
    backgroundColor: D.card,
    borderRadius:    22,
    overflow:        "hidden",
    borderWidth:     1,
    borderColor:     D.cardBorder,
    shadowColor:     "#000",
    shadowOpacity:   0.05,
    shadowRadius:    14,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       2,
  },

  // Menu rows
  menuRow: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    paddingHorizontal: 16,
    paddingVertical:   13,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: D.border,
  },
  menuRowPressed: { backgroundColor: "rgba(0,0,0,0.025)" },
  menuLeft:       { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconCircle: {
    width:          36,
    height:         36,
    borderRadius:   11,
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },
  menuLabel: { color: D.text, fontSize: 15, fontFamily: FONTS.semiBold, flex: 1 },
  menuValue: { color: D.muted, fontSize: 13, fontFamily: FONTS.semiBold, maxWidth: 160, textAlign: "right" },
});
