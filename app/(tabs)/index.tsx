import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronRight,
  ClipboardList,
  Coffee,
  Droplets,
  Flame,
  ImagePlus,
  Leaf,
  MessageCircle,
  Moon,
  Plus,
  ScanLine,
  Star,
  TrendingUp,
  Utensils,
  Wheat,
  Zap,
} from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { FadeInDown } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import {
  getDailyTotalsFromMeals,
  getMealsForWeek,
  getWeeklyCaloriesFromMeals,
  type DailyTotals,
  type SavedMeal,
  type WeeklyCalories,
} from "@/src/services/mealHistoryService";
import { getProfile, type ProfileData } from "@/src/services/profileService";
import {
  readDashboardCache,
  writeDashboardCache,
} from "@/src/services/dashboardCache";

const LOGO_MARK = require("@/assets/images/logo-mark.png");

type FoodIcon = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

// ── Palette ────────────────────────────────────────────────────────────────────
//
// Vibrant nutrition-app palette — each color maps to a universal macro role:
//   green  → brand, health, protein (industry standard)
//   orange → carbs, energy, appetite (universal nutrition convention)
//   purple → fat, balance, richness (used by leading nutrition apps)
//   sky    → evening meals, hydration, depth
//
const P = {
  // Backgrounds
  bg:           "#F8FAFC",
  card:         "#FFFFFF",
  cardBorder:   "rgba(15,23,42,0.07)",
  divider:      "#E2E8F0",

  // Text
  text:         "#0F172A",
  textMid:      "#64748B",
  textLight:    "#94A3B8",

  // Green — brand, health, protein
  green:        "#16A34A",
  greenMid:     "#22C55E",
  greenDim:     "#F0FDF4",
  greenBorder:  "rgba(22,163,74,0.18)",

  // Orange — carbs, energy, appetite
  orange:       "#F97316",
  orangeDim:    "#FFF7ED",
  orangeBorder: "rgba(249,115,22,0.18)",

  // Purple — fat, balance, richness
  purple:       "#8B5CF6",
  purpleDim:    "#F5F3FF",
  purpleBorder: "rgba(139,92,246,0.18)",

  // Sky — evening meals, hydration, depth
  sky:          "#0284C7",
  skyDim:       "#E0F2FE",
  skyBorder:    "rgba(2,132,199,0.18)",

  // Hero card
  heroBg:       "#F0FDF4",
  heroBorder:   "rgba(22,163,74,0.14)",
};

// ── Static config ──────────────────────────────────────────────────────────────
const MACRO_TARGETS = { carbs: 275, protein: 90, fat: 73 };
const TODAY_INDEX   = 6;

const MEAL_TYPE_ORDER = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

const MEAL_META = {
  Breakfast: { Icon: Coffee,   color: P.orange, bg: P.orangeDim },
  Lunch:     { Icon: Utensils, color: P.green,  bg: P.greenDim  },
  Dinner:    { Icon: Moon,     color: P.sky,    bg: P.skyDim    },
  Snack:     { Icon: Zap,      color: P.purple, bg: P.purpleDim },
} as const;

const EMPTY_TOTALS: DailyTotals = { calories: 0, carbs: 0, fat: 0, protein: 0, target: 0 };

// ── Regional food data ─────────────────────────────────────────────────────────
//
// No per-food accent colors. Cards alternate green/terra — two tones, not eight.
// Icons are assigned by food character, one of each type per region.
//
type RegionalMeal = {
  id:      string;
  name:    string;
  cal:     number;
  protein: number;
  carbs:   number;
  fat:     number;
  tag:     string;
  Icon:    FoodIcon;
};

const FOODS_BY_REGION: Record<string, RegionalMeal[]> = {
  NG: [
    { id:"ng1", name:"Jollof Rice",      cal:380, protein:9,  carbs:72, fat:8,  tag:"High carbs",     Icon: Wheat    },
    { id:"ng2", name:"Egusi Soup",        cal:290, protein:18, carbs:12, fat:22, tag:"Protein rich",   Icon: Droplets },
    { id:"ng3", name:"Eba & Efo Riro",    cal:520, protein:14, carbs:90, fat:14, tag:"High energy",    Icon: Flame    },
    { id:"ng4", name:"Moi Moi",           cal:180, protein:12, carbs:24, fat:6,  tag:"Light meal",     Icon: Coffee   },
    { id:"ng5", name:"Fried Rice",        cal:440, protein:12, carbs:78, fat:11, tag:"Balanced",       Icon: Utensils },
    { id:"ng6", name:"Suya",              cal:320, protein:28, carbs:8,  fat:18, tag:"High protein",   Icon: Zap      },
    { id:"ng7", name:"Pounded Yam",       cal:330, protein:3,  carbs:80, fat:1,  tag:"Filling",        Icon: Star     },
    { id:"ng8", name:"Afang Soup",        cal:245, protein:16, carbs:8,  fat:17, tag:"Nutrient dense", Icon: Leaf     },
  ],
  GH: [
    { id:"gh1", name:"Waakye",            cal:420, protein:15, carbs:78, fat:8,  tag:"High carbs",     Icon: Wheat    },
    { id:"gh2", name:"Jollof Rice",       cal:380, protein:9,  carbs:72, fat:8,  tag:"High carbs",     Icon: Utensils },
    { id:"gh3", name:"Banku & Tilapia",   cal:480, protein:32, carbs:64, fat:10, tag:"High protein",   Icon: Droplets },
    { id:"gh4", name:"Kelewele",          cal:290, protein:3,  carbs:58, fat:6,  tag:"Street food",    Icon: Zap      },
    { id:"gh5", name:"Fufu & Light Soup", cal:540, protein:18, carbs:92, fat:12, tag:"High energy",    Icon: Flame    },
    { id:"gh6", name:"Kontomire Stew",    cal:210, protein:12, carbs:22, fat:8,  tag:"Nutrient rich",  Icon: Leaf     },
    { id:"gh7", name:"Omo Tuo",           cal:380, protein:8,  carbs:80, fat:2,  tag:"Filling",        Icon: Coffee   },
    { id:"gh8", name:"Groundnut Soup",    cal:350, protein:16, carbs:18, fat:26, tag:"Protein rich",   Icon: Star     },
  ],
  KE: [
    { id:"ke1", name:"Ugali & Sukuma",    cal:380, protein:12, carbs:72, fat:6,  tag:"Balanced",       Icon: Wheat    },
    { id:"ke2", name:"Nyama Choma",       cal:420, protein:38, carbs:2,  fat:28, tag:"High protein",   Icon: Flame    },
    { id:"ke3", name:"Pilau",             cal:460, protein:18, carbs:68, fat:14, tag:"Fragrant",       Icon: Star     },
    { id:"ke4", name:"Githeri",           cal:280, protein:14, carbs:48, fat:4,  tag:"Protein rich",   Icon: Droplets },
    { id:"ke5", name:"Mandazi",           cal:240, protein:5,  carbs:44, fat:6,  tag:"Light snack",    Icon: Coffee   },
    { id:"ke6", name:"Biryani",           cal:520, protein:22, carbs:74, fat:16, tag:"Festive",        Icon: Utensils },
    { id:"ke7", name:"Mukimo",            cal:320, protein:8,  carbs:60, fat:8,  tag:"Traditional",    Icon: Leaf     },
    { id:"ke8", name:"Maharagwe",         cal:260, protein:15, carbs:38, fat:6,  tag:"High fibre",     Icon: Zap      },
  ],
  ET: [
    { id:"et1", name:"Injera & Doro Wat", cal:520, protein:24, carbs:72, fat:16, tag:"Traditional",    Icon: Utensils },
    { id:"et2", name:"Shiro Wat",         cal:280, protein:14, carbs:38, fat:8,  tag:"Protein rich",   Icon: Droplets },
    { id:"et3", name:"Tibs",              cal:360, protein:30, carbs:8,  fat:22, tag:"High protein",   Icon: Flame    },
    { id:"et4", name:"Fit-fit",           cal:300, protein:10, carbs:52, fat:8,  tag:"Filling",        Icon: Leaf     },
    { id:"et5", name:"Gomen",             cal:180, protein:8,  carbs:22, fat:8,  tag:"Nutrient rich",  Icon: Star     },
    { id:"et6", name:"Misir Wat",         cal:260, protein:14, carbs:42, fat:6,  tag:"High fibre",     Icon: Wheat    },
    { id:"et7", name:"Ayib",              cal:160, protein:14, carbs:4,  fat:10, tag:"Light & fresh",  Icon: Coffee   },
    { id:"et8", name:"Kategna",           cal:340, protein:8,  carbs:54, fat:10, tag:"Street food",    Icon: Zap      },
  ],
  ZA: [
    { id:"za1", name:"Braai Meat",        cal:480, protein:36, carbs:4,  fat:34, tag:"High protein",   Icon: Flame    },
    { id:"za2", name:"Umngqusho",         cal:320, protein:16, carbs:52, fat:6,  tag:"Traditional",    Icon: Wheat    },
    { id:"za3", name:"Bobotie",           cal:440, protein:24, carbs:38, fat:22, tag:"Cape Malay",     Icon: Star     },
    { id:"za4", name:"Boerewors Roll",    cal:380, protein:18, carbs:36, fat:18, tag:"Street food",    Icon: Zap      },
    { id:"za5", name:"Pap & Stew",        cal:400, protein:16, carbs:66, fat:10, tag:"Filling",        Icon: Utensils },
    { id:"za6", name:"Chakalaka",         cal:140, protein:4,  carbs:24, fat:4,  tag:"Spicy",          Icon: Leaf     },
    { id:"za7", name:"Melktert",          cal:280, protein:6,  carbs:42, fat:10, tag:"Dessert",        Icon: Coffee   },
    { id:"za8", name:"Bunny Chow",        cal:580, protein:26, carbs:78, fat:18, tag:"Street food",    Icon: Droplets },
  ],
  TZ: [
    { id:"tz1", name:"Ugali & Mchuzi",    cal:400, protein:14, carbs:74, fat:8,  tag:"Balanced",       Icon: Wheat    },
    { id:"tz2", name:"Nyama na Mchuzi",   cal:380, protein:30, carbs:12, fat:22, tag:"High protein",   Icon: Flame    },
    { id:"tz3", name:"Pilau",             cal:460, protein:18, carbs:68, fat:14, tag:"Fragrant",       Icon: Star     },
    { id:"tz4", name:"Maharagwe",         cal:260, protein:15, carbs:38, fat:6,  tag:"High fibre",     Icon: Droplets },
    { id:"tz5", name:"Mandazi",           cal:240, protein:5,  carbs:44, fat:6,  tag:"Light snack",    Icon: Coffee   },
    { id:"tz6", name:"Wali wa Nazi",      cal:420, protein:8,  carbs:70, fat:16, tag:"Coconut rice",   Icon: Utensils },
    { id:"tz7", name:"Mchicha",           cal:140, protein:6,  carbs:16, fat:4,  tag:"Nutrient rich",  Icon: Leaf     },
    { id:"tz8", name:"Chipsi Mayai",      cal:480, protein:18, carbs:52, fat:24, tag:"Street food",    Icon: Zap      },
  ],
};

const COUNTRY_LABEL: Record<string, string> = {
  NG: "Nigerian", GH: "Ghanaian", KE: "Kenyan",
  ET: "Ethiopian", ZA: "South African", TZ: "Tanzanian",
};

function detectCountryCode(): string | null {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const region = new Intl.Locale(locale).region;
    return region ?? null;
  } catch {
    return null;
  }
}

const QUICK_ACTIONS = [
  { id: "scan",    Icon: ScanLine,      label: "Scan Food", color: "#FFFFFF",   bg: P.green,     route: ROUTES.scan,             primary: true  },
  { id: "log",     Icon: ClipboardList, label: "Meal Log",  color: P.green,     bg: P.greenDim,  route: ROUTES.mealLog,          primary: false },
  { id: "coach",   Icon: MessageCircle, label: "AI Coach",  color: P.purple,    bg: P.purpleDim, route: ROUTES.aiCoach,          primary: false },
  { id: "history", Icon: TrendingUp,    label: "History",   color: P.orange,    bg: P.orangeDim, route: ROUTES.nutritionHistory, primary: false },
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────
function getCurrentStreak(days: WeeklyCalories[]) {
  let count = 0;
  for (const day of days.slice().reverse()) {
    if (day.value <= 0) break;
    count += 1;
  }
  return count;
}

function buildDashboardData(profileData: ProfileData, weekMeals: SavedMeal[]) {
  const target   = profileData.dailyCalorieTarget ?? 0;
  const todayKey = new Date().toISOString().split("T")[0];
  const meals    = weekMeals.filter((m) => m.dateLogged === todayKey);
  return {
    profile:        profileData,
    todayMeals:     meals,
    dailyTotals:    getDailyTotalsFromMeals(meals, target),
    weeklyCalories: getWeeklyCaloriesFromMeals(weekMeals),
  };
}

function getPersonalizedTip(totals: DailyTotals, countryCode: string | null): string {
  const proteinSrc = countryCode === "NG" ? "Moi Moi, Egusi, or Suya" : "lean meats, beans, or eggs";
  if (totals.calories === 0) {
    return "Start your day right — scan or log your first meal to unlock your personalised nutrition snapshot.";
  }
  const proteinLeft = MACRO_TARGETS.protein - totals.protein;
  const calLeft     = (totals.target || 2100) - totals.calories;
  if (proteinLeft > 40) {
    return `You still need about ${proteinLeft}g of protein today. ${proteinSrc} are great options.`;
  }
  if (calLeft > 600) {
    return `You have ${calLeft} kcal left today. A balanced plate of grains and stew fits nicely.`;
  }
  if (calLeft < 0) {
    return "You've gone a little over today — no stress. Keep dinner light and drink plenty of water.";
  }
  return "Great balance today! Keep it up — aim for a vegetable-rich dinner tonight.";
}

// ── Calorie Ring ───────────────────────────────────────────────────────────────
const RING_SIZE   = 96;
const RING_STROKE = 9;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUM = 2 * Math.PI * RING_RADIUS;

function CalorieRing({ calories, target }: { calories: number; target: number }) {
  const pct    = target > 0 ? Math.min(calories / target, 1) : 0;
  const filled = pct * RING_CIRCUM;
  return (
    <View style={ringS.wrap}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
          stroke="#E2E8F0" strokeWidth={RING_STROKE} fill="none" />
        <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
          stroke={P.green} strokeWidth={RING_STROKE} fill="none"
          strokeDasharray={`${filled} ${RING_CIRCUM - filled}`}
          strokeLinecap="round" />
      </Svg>
      <View style={ringS.center} pointerEvents="none">
        <Text style={ringS.pct}>{Math.round(pct * 100)}%</Text>
      </View>
    </View>
  );
}

const ringS = StyleSheet.create({
  wrap:   { width: RING_SIZE, height: RING_SIZE, alignItems: "center", justifyContent: "center" },
  center: { position: "absolute", alignItems: "center" },
  pct:    { color: P.green, fontSize: 17, fontFamily: FONTS.extraBold },
});

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function DashboardTab() {
  useLanguage();
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [cachedSnapshot, setCachedSnapshot]     = useState<ReturnType<typeof buildDashboardData> | undefined>();
  const countryCode = useMemo(() => detectCountryCode(), []);

  useEffect(() => {
    readDashboardCache()
      .then((c) => { if (c) setCachedSnapshot(buildDashboardData(c.profile, c.weekMeals)); })
      .catch(() => {});
  }, []);

  const { data: dashboardData, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn:  async () => {
      const [profileData, weekMeals] = await Promise.all([getProfile(), getMealsForWeek()]);
      void writeDashboardCache({ profile: profileData, weekMeals }).catch(() => {});
      return buildDashboardData(profileData, weekMeals);
    },
    staleTime:       60_000,
    placeholderData: cachedSnapshot,
  });

  useFocusEffect(useCallback(() => { void refetch(); }, [refetch]));
  useEffect(() => { setAvatarLoadFailed(false); }, [dashboardData?.profile?.photoUri]);

  const profile        = dashboardData?.profile        ?? null;
  const dailyTotals    = dashboardData?.dailyTotals    ?? EMPTY_TOTALS;
  const todayMeals     = dashboardData?.todayMeals     ?? [];
  const weeklyCalories = dashboardData?.weeklyCalories ?? [];

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName        = (profile?.nickname || profile?.fullName)?.split(" ")[0] ?? "there";
  const avatarInitial    = firstName[0]?.toUpperCase() ?? "N";
  const profilePhotoUri  = profile?.photoUri?.trim();
  const showProfilePhoto = !!profilePhotoUri && !avatarLoadFailed;
  const streak           = getCurrentStreak(weeklyCalories);
  const tip              = getPersonalizedTip(dailyTotals, countryCode);
  const maxWeekly        = Math.max(1, ...weeklyCalories.map((d) => d.value));
  const calorieGoal      = dailyTotals.target || 2100;
  const caloriePercent   = Math.min(Math.round((dailyTotals.calories / calorieGoal) * 100), 100);
  const calorieRemaining = Math.max(calorieGoal - dailyTotals.calories, 0);
  const mealsGrouped     = MEAL_TYPE_ORDER.map((type) => ({
    type, meals: todayMeals.filter((m) => m.mealType === type),
  }));
  const loggedCount    = mealsGrouped.filter((g) => g.meals.length > 0).length;
  const todayDate      = new Date().toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" });
  const regionalMeals  = countryCode ? (FOODS_BY_REGION[countryCode] ?? null) : null;
  const regionLabel    = countryCode ? (COUNTRY_LABEL[countryCode]   ?? null) : null;

  return (
    <ScreenWrapper scroll bg={P.bg}>

      {/* ── 1. HEADER ──────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(280)} style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.greeting}>{greeting} 👋</Text>
          <Text style={s.name}>{firstName}</Text>
          <View style={s.headerMeta}>
            <Text style={s.headerDate}>{todayDate}</Text>
            {streak > 0 && (
              <>
                <View style={s.metaDot} />
                <View style={s.streakChip}>
                  <Flame color={P.orange} size={11} />
                  <Text style={s.streakText}>{streak}-day streak</Text>
                </View>
              </>
            )}
          </View>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/profile")} style={s.avatarBtn} accessibilityLabel="Profile">
          {showProfilePhoto ? (
            <Image onError={() => setAvatarLoadFailed(true)} source={{ uri: profilePhotoUri }} style={s.avatarImg} />
          ) : (
            <Text style={s.avatarInitial}>{avatarInitial}</Text>
          )}
        </Pressable>
      </Animated.View>

      {error ? (
        <View style={s.errorBar}>
          <Text style={s.errorText}>Could not refresh — showing last saved data.</Text>
        </View>
      ) : null}

      {/* ── 2. SCAN CTA ────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(60).duration(340)} style={s.heroCard}>
        <View style={s.heroTopRow}>
          <View style={s.heroChip}>
            <ScanLine color={P.green} size={11} />
            <Text style={s.heroChipText}>Food Intelligence</Text>
          </View>
          <Text style={s.heroGoalPct}>{caloriePercent}% of goal</Text>
        </View>

        <View style={s.heroBody}>
          <View style={s.heroTextCol}>
            <Text style={s.heroHeadline}>Track your meals,{"\n"}own your health</Text>
            <Text style={s.heroSub}>Snap any dish for instant calories, macros, and personalised advice.</Text>
          </View>
          <Pressable onPress={() => router.push(ROUTES.scan)} style={s.heroRingBtn} accessibilityLabel="Open food scanner">
            <View style={s.heroRingOuter}>
              <View style={s.heroRingInner}>
                <ScanLine color="#FFFFFF" size={28} strokeWidth={1.8} />
              </View>
            </View>
            <Text style={s.heroRingHint}>Tap to scan</Text>
          </Pressable>
        </View>

        <View style={s.heroActions}>
          <Pressable onPress={() => router.push(ROUTES.scan)} style={s.heroBtnPrimary}>
            <ScanLine color="#FFFFFF" size={14} />
            <Text style={s.heroBtnPrimaryText}>Scan My Meal</Text>
          </Pressable>
          <Pressable onPress={() => router.push(ROUTES.scan)} style={s.heroBtnGhost}>
            <ImagePlus color={P.green} size={14} />
            <Text style={s.heroBtnGhostText}>Upload Photo</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* ── 3. TODAY'S NUTRITION ───────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(120).duration(340)} style={s.nutritionCard}>
        <View style={s.nutritionHeader}>
          <Text style={s.cardTitle}>{"Today's nutrition"}</Text>
          <Pressable onPress={() => router.push(ROUTES.nutritionHistory)} style={s.seeAllRow}>
            <Text style={s.seeAllText}>Full report</Text>
            <ChevronRight color={P.green} size={13} />
          </Pressable>
        </View>

        <View style={s.calorieRow}>
          <CalorieRing calories={dailyTotals.calories} target={calorieGoal} />
          <View style={s.calorieInfo}>
            <Text style={s.calorieNum}>{dailyTotals.calories.toLocaleString()}</Text>
            <Text style={s.calorieLabel}>kcal consumed</Text>
            <View style={s.calorieMeta}>
              <View style={[s.calorieMetaPill, { backgroundColor: P.greenDim }]}>
                <Text style={[s.calorieMetaPillText, { color: P.green }]}>
                  {calorieGoal.toLocaleString()} goal
                </Text>
              </View>
              <View style={[s.calorieMetaPill, { backgroundColor: P.purpleDim }]}>
                <Text style={[s.calorieMetaPillText, { color: P.purple }]}>
                  {calorieRemaining.toLocaleString()} left
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={s.calProgressTrack}>
          <View style={[s.calProgressFill, { width: `${caloriePercent}%` as any }]} />
        </View>

        {/* Macro cards: terra = carbs/energy, green = protein/health, stone = fat/neutral */}
        <View style={s.macroGrid}>
          {([
            { label: "Carbs",   value: dailyTotals.carbs,   target: MACRO_TARGETS.carbs,   color: P.orange, bg: P.orangeDim },
            { label: "Protein", value: dailyTotals.protein, target: MACRO_TARGETS.protein, color: P.green,  bg: P.greenDim  },
            { label: "Fat",     value: dailyTotals.fat,     target: MACRO_TARGETS.fat,     color: P.purple, bg: P.purpleDim },
          ] as const).map(({ label, value, target, color, bg }) => {
            const pct = Math.min(Math.round((value / target) * 100), 100);
            return (
              <View key={label} style={[s.macroCard, { backgroundColor: bg }]}>
                <View style={s.macroCardBody}>
                  {/* Label + percentage pill on the same row */}
                  <View style={s.macroCardTopRow}>
                    <Text style={[s.macroCardLabel, { color }]}>{label}</Text>
                    <View style={[s.macroPctBadge, { backgroundColor: color }]}>
                      <Text style={s.macroPctText}>{pct}%</Text>
                    </View>
                  </View>
                  {/* Consumed value + /target */}
                  <View style={s.macroCardValRow}>
                    <Text style={[s.macroCardVal, { color }]}>{value}</Text>
                    <Text style={s.macroCardTarget}>/{target}g</Text>
                  </View>
                  {/* Progress bar */}
                  <View style={s.macroBarTrack}>
                    <View style={[s.macroBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* ── 4. REGIONAL MEAL GUIDE ─────────────────────────────────────────── */}
      {regionalMeals && regionLabel && (
        <>
          <Animated.View entering={FadeInDown.delay(170).duration(340)}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>{regionLabel} meal guide</Text>
              <Text style={s.sectionAction}>Tap to scan →</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(190).duration(340)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.carousel}
              contentContainerStyle={s.carouselContent}
            >
              {regionalMeals.map((meal, index) => {
                const isAlt  = index % 2 === 1;
                const ic     = isAlt ? P.orange : P.green;
                const icDim  = isAlt ? P.orangeDim : P.greenDim;
                const icCirc = isAlt
                  ? "rgba(249,115,22,0.18)"
                  : "rgba(22,163,74,0.16)";

                return (
                  <Pressable key={meal.id} onPress={() => router.push(ROUTES.scan)} style={s.foodCard}>
                    <View style={[s.foodCardHeader, { backgroundColor: icDim }]}>
                      <View style={[s.foodIconCircle, { backgroundColor: icCirc }]}>
                        <meal.Icon color={ic} size={20} strokeWidth={1.8} />
                      </View>
                    </View>
                    <View style={s.foodCardBody}>
                      <Text style={s.foodName} numberOfLines={2}>{meal.name}</Text>
                      <Text style={[s.foodCal, { color: ic }]}>{meal.cal} kcal</Text>
                      <View style={[s.foodTag, { backgroundColor: icDim }]}>
                        <Text style={[s.foodTagText, { color: ic }]}>{meal.tag}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </>
      )}

      {/* ── 5. NUTRIPADI COACH TIP ─────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(230).duration(340)} style={s.tipCard}>
        <View style={s.tipLogoWrap}>
          <Image source={LOGO_MARK} style={s.tipLogo} resizeMode="contain" />
        </View>
        <View style={s.tipBody}>
          <Text style={s.tipLabel}>Your NutriPadi coach</Text>
          <Text style={s.tipText}>{tip}</Text>
        </View>
      </Animated.View>

      {/* ── 6. TODAY'S MEALS ───────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(260).duration(340)}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>{"Today's meals"}</Text>
          <View style={s.countPill}>
            <Text style={s.countText}>{loggedCount}/{MEAL_TYPE_ORDER.length} logged</Text>
          </View>
        </View>

        <View style={s.mealsCard}>
          {mealsGrouped.map(({ type, meals }, groupIdx) => {
            const { Icon, color, bg } = MEAL_META[type];
            return (
              <View key={type}>
                {groupIdx > 0 && <View style={s.mealDivider} />}
                {meals.length > 0 ? (
                  meals.map((meal, mealIdx) => (
                    <View key={meal.id}>
                      {mealIdx > 0 && <View style={s.mealDivider} />}
                      <Pressable
                        onPress={() => router.push({ pathname: "/(tabs)/meal-details", params: { id: meal.id } })}
                        style={s.mealRow}
                      >
                        <View style={[s.mealIconWrap, { backgroundColor: bg }]}>
                          {meal.imageUri ? (
                            <Image source={{ uri: meal.imageUri }} style={s.mealPhoto} resizeMode="cover" />
                          ) : (
                            <Icon color={color} size={16} />
                          )}
                        </View>
                        <View style={s.mealInfo}>
                          <Text style={s.mealName} numberOfLines={1}>{meal.foodName}</Text>
                          <Text style={s.mealMeta}>{type} · {meal.timeLogged}</Text>
                        </View>
                        <View style={[s.kcalPill, { backgroundColor: bg }]}>
                          <Text style={[s.kcalNum, { color }]}>{meal.calories}</Text>
                          <Text style={s.kcalUnit}>kcal</Text>
                        </View>
                      </Pressable>
                    </View>
                  ))
                ) : (
                  <Pressable onPress={() => router.push(ROUTES.scan)} style={s.mealRowEmpty}>
                    <View style={[s.mealIconWrap, s.mealIconEmpty, { backgroundColor: bg }]}>
                      <Icon color={color} size={15} />
                    </View>
                    <Text style={s.mealEmptyText}>Add {type}</Text>
                    <View style={[s.addBtn, { backgroundColor: P.greenDim }]}>
                      <Plus color={P.green} size={12} />
                    </View>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* ── 7. QUICK ACTIONS ───────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(300).duration(340)}>
        <Text style={[s.sectionTitle, { marginBottom: 12 }]}>Quick actions</Text>
        <View style={s.actionsRow}>
          {QUICK_ACTIONS.map(({ id, Icon, label, color, bg, route, primary }) => (
            <Pressable key={id} onPress={() => router.push(route)} style={[s.actionCard, primary && s.actionCardPrimary]}>
              <View style={[s.actionIconWrap, { backgroundColor: primary ? "rgba(255,255,255,0.22)" : bg }]}>
                <Icon color={color} size={20} />
              </View>
              <Text style={[s.actionLabel, primary && s.actionLabelPrimary]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* ── 8. THIS WEEK ───────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(340).duration(340)}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>This week</Text>
          <Pressable onPress={() => router.push(ROUTES.nutritionHistory)} style={s.seeAllRow}>
            <Text style={s.seeAllText}>Full report</Text>
            <ChevronRight color={P.green} size={13} />
          </Pressable>
        </View>
        <View style={s.weekCard}>
          {weeklyCalories.map((day, i) => {
            const isToday = i === TODAY_INDEX;
            const barH    = Math.max(6, (day.value / maxWeekly) * 66);
            return (
              <View key={day.date} style={s.barCol}>
                {isToday && day.value > 0 && <Text style={s.barVal}>{day.value}</Text>}
                <View style={[s.barTrack, isToday && s.barTrackActive]}>
                  <View style={[
                    s.barFill, { height: barH },
                    isToday ? s.barFillActive : day.value > 0 ? s.barFillDone : null,
                  ]} />
                </View>
                <Text style={[s.barDay, isToday && s.barDayActive]}>{day.day}</Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

    </ScreenWrapper>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    marginTop: 4, marginBottom: 20,
  },
  headerLeft:  { flex: 1 },
  greeting:    { color: P.textMid,   fontSize: 13, fontFamily: FONTS.medium, marginBottom: 2 },
  name:        { color: P.text,      fontSize: 27, fontFamily: FONTS.extraBold, lineHeight: 33 },
  headerMeta:  { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  headerDate:  { color: P.textLight, fontSize: 12, fontFamily: FONTS.medium },
  metaDot:     { width: 3, height: 3, borderRadius: 999, backgroundColor: P.textLight },
  streakChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: P.orangeDim, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
  },
  streakText: { color: P.orange, fontSize: 11, fontFamily: FONTS.bold },
  avatarBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: P.greenDim,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  avatarImg:     { width: "100%", height: "100%" },
  avatarInitial: { color: P.green, fontSize: 17, fontFamily: FONTS.extraBold },

  errorBar: {
    backgroundColor: "#FEF2F2", borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 12, marginBottom: 12,
  },
  errorText: { color: "#B83C1A", fontSize: 12, fontFamily: FONTS.medium },

  // Hero / Scan CTA card
  heroCard: {
    backgroundColor: P.heroBg, borderRadius: 24, padding: 20, marginBottom: 16,
  },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  heroChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: P.greenDim, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  heroChipText: { color: P.green, fontSize: 11, fontFamily: FONTS.bold },
  heroGoalPct:  { color: P.textMid, fontSize: 12, fontFamily: FONTS.medium },
  heroBody:     { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  heroTextCol:  { flex: 1 },
  heroHeadline: { color: P.text, fontSize: 22, fontFamily: FONTS.extraBold, lineHeight: 29, marginBottom: 6 },
  heroSub:      { color: P.textMid, fontSize: 12, fontFamily: FONTS.regular, lineHeight: 18 },
  heroRingBtn:  { alignItems: "center", gap: 6 },
  heroRingOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: P.greenDim, alignItems: "center", justifyContent: "center",
  },
  heroRingInner: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: P.green, alignItems: "center", justifyContent: "center",
    shadowColor: P.green, shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  heroRingHint:     { color: P.textLight, fontSize: 10, fontFamily: FONTS.medium },
  heroActions:      { flexDirection: "row", gap: 10 },
  heroBtnPrimary: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, backgroundColor: P.green, borderRadius: 14, paddingVertical: 13,
  },
  heroBtnPrimaryText: { color: "#FFFFFF", fontSize: 13, fontFamily: FONTS.bold },
  heroBtnGhost: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, backgroundColor: P.card, borderRadius: 14, paddingVertical: 13,
  },
  heroBtnGhostText: { color: P.green, fontSize: 13, fontFamily: FONTS.bold },

  // Nutrition card
  nutritionCard: {
    backgroundColor: P.card, borderRadius: 22, padding: 18, marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  nutritionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  cardTitle:  { color: P.text,  fontSize: 16, fontFamily: FONTS.extraBold },
  seeAllRow:  { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { color: P.green, fontSize: 12, fontFamily: FONTS.semiBold },

  calorieRow:      { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 14 },
  calorieInfo:     { flex: 1 },
  calorieNum:      { color: P.text, fontSize: 36, fontFamily: FONTS.extraBold, lineHeight: 42 },
  calorieLabel:    { color: P.textMid, fontSize: 12, fontFamily: FONTS.medium, marginTop: 2 },
  calorieMeta:     { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  calorieMetaPill: {
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  calorieMetaPillText: { fontSize: 11, fontFamily: FONTS.semiBold },
  calProgressTrack: {
    height: 6, borderRadius: 999, backgroundColor: P.divider, overflow: "hidden", marginBottom: 16,
  },
  calProgressFill: { height: "100%", borderRadius: 999, backgroundColor: P.green },

  macroGrid:  { flexDirection: "row", gap: 8 },
  macroCard:  { flex: 1, borderRadius: 18 },
  macroCardBody: { padding: 12, gap: 6 },
  macroCardTopRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  macroCardLabel: {
    fontSize: 10, fontFamily: FONTS.bold, textTransform: "uppercase", letterSpacing: 0.6,
  },
  macroPctBadge: {
    borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2,
  },
  macroPctText: {
    color: "#FFFFFF", fontSize: 9, fontFamily: FONTS.extraBold,
  },
  macroCardValRow: { flexDirection: "row", alignItems: "baseline", gap: 1 },
  macroCardVal:    { fontSize: 20, fontFamily: FONTS.extraBold, lineHeight: 24 },
  macroCardTarget: { color: P.textLight, fontFamily: FONTS.medium, fontSize: 11 },
  macroBarTrack: {
    height: 5, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.1)", overflow: "hidden",
  },
  macroBarFill: { height: "100%", borderRadius: 999 },

  // Section headers
  sectionRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle:  { color: P.text,  fontSize: 17, fontFamily: FONTS.extraBold },
  sectionAction: { color: P.green, fontSize: 12, fontFamily: FONTS.semiBold },

  // Regional meal carousel
  carousel:        { marginHorizontal: -18, marginBottom: 20 },
  carouselContent: { paddingHorizontal: 18, gap: 12, paddingBottom: 4 },
  foodCard: {
    width: 132, backgroundColor: P.card, borderRadius: 18, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  foodCardHeader: { height: 72, alignItems: "center", justifyContent: "center" },
  foodIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  foodCardBody:   { padding: 10, paddingTop: 9, gap: 3 },
  foodName:       { color: P.text, fontSize: 12, fontFamily: FONTS.bold, lineHeight: 16 },
  foodCal:        { fontSize: 12, fontFamily: FONTS.extraBold },
  foodTag:        { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, marginTop: 3 },
  foodTagText:    { fontSize: 9, fontFamily: FONTS.bold },

  // NutriPadi tip
  tipCard: {
    flexDirection: "row", gap: 12, backgroundColor: P.greenDim, borderRadius: 20,
    padding: 16, marginBottom: 16,
  },
  tipLogoWrap: {
    width: 40, height: 40, borderRadius: 13, backgroundColor: P.card,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  tipLogo:  { width: 26, height: 26 },
  tipBody:  { flex: 1 },
  tipLabel: {
    color: P.green, fontSize: 10, fontFamily: FONTS.extraBold,
    textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4,
  },
  tipText: { color: P.textMid, fontSize: 13, fontFamily: FONTS.regular, lineHeight: 20 },

  // Today's meals
  countPill: {
    backgroundColor: P.greenDim, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  countText: { color: P.green, fontSize: 11, fontFamily: FONTS.bold },
  mealsCard: {
    backgroundColor: P.card, borderRadius: 20,
    overflow: "hidden", marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  mealDivider: { height: 1, backgroundColor: P.divider, marginHorizontal: 14 },
  mealRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  mealIconWrap: {
    width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  mealIconEmpty: { opacity: 0.5 },
  mealPhoto:     { width: "100%", height: "100%" },
  mealInfo:      { flex: 1 },
  mealName:      { color: P.text,      fontSize: 14, fontFamily: FONTS.bold,   marginBottom: 3 },
  mealMeta:      { color: P.textLight, fontSize: 11, fontFamily: FONTS.medium },
  kcalPill:      { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, alignItems: "center" },
  kcalNum:       { fontSize: 14, fontFamily: FONTS.extraBold },
  kcalUnit:      { color: P.textLight, fontSize: 9, fontFamily: FONTS.medium, marginTop: 1 },
  mealRowEmpty:  { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  mealEmptyText: { flex: 1, color: P.textLight, fontSize: 13, fontFamily: FONTS.medium },
  addBtn:        { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center" },

  // Quick actions
  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionCard: {
    flex: 1, backgroundColor: P.card, borderRadius: 18, paddingVertical: 14,
    alignItems: "center", gap: 8,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  actionCardPrimary: {
    backgroundColor: P.green,
    shadowColor: P.green, shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  actionIconWrap:     { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  actionLabel:        { color: P.textMid,  fontSize: 10, fontFamily: FONTS.bold, textAlign: "center" },
  actionLabelPrimary: { color: "#FFFFFF" },

  // Weekly chart
  weekCard: {
    backgroundColor: P.card, borderRadius: 20,
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 16, marginBottom: 14,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  barCol:        { flex: 1, alignItems: "center", gap: 6 },
  barVal:        { color: P.green, fontSize: 9, fontFamily: FONTS.bold },
  barTrack: {
    width: 28, height: 70, borderRadius: 8, backgroundColor: "#E2E8F0",
    justifyContent: "flex-end", overflow: "hidden",
  },
  barTrackActive: { backgroundColor: P.greenDim },
  barFill:        { width: "100%", borderRadius: 8, backgroundColor: "#CBD5E1" },
  barFillDone:    { backgroundColor: "rgba(22,163,74,0.28)" },
  barFillActive:  { backgroundColor: P.green },
  barDay:         { color: P.textLight, fontSize: 11, fontFamily: FONTS.medium },
  barDayActive:   { color: P.green,     fontSize: 11, fontFamily: FONTS.bold   },
});
