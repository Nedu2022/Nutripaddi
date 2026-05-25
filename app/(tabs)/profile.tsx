import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Settings, ChevronRight, Award, Heart, Shield,
  Activity, Scale, Ruler, Calendar, LogOut, Globe, Database,
  MessageSquareText, BarChart3, SlidersHorizontal, Utensils,
  Target, Flame,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { clearAuthSession } from "@/src/services/authSessionService";

const D = {
  bg:         "#F5F6FA",
  card:       "#FFFFFF",
  accent:     COLORS.primary,
  accentDim:  COLORS.softGreen,
  text:       "#0A0A0A",
  muted:      "#6B7280",
  light:      "#B0B8C4",
  orange:     "#FF6B35",
  orangeDim:  "rgba(255,107,53,0.09)",
  indigo:     "#6366F1",
  indigoDim:  "rgba(99,102,241,0.09)",
  amber:      "#F59E0B",
  amberDim:   "rgba(245,158,11,0.09)",
  red:        "#EF4444",
  redDim:     "rgba(239,68,68,0.09)",
};

const PROFILE_DATA = {
  nickname:         "Nnedu",
  initials:         "NN",
  email:            "nnedu@nutripaddi.com",
  goal:             "Eat healthier",
  age:              24,
  weight:           60,
  height:           165,
  healthAwareness:  "General wellness",
  eatingLifestyle:  "Control how much I eat",
  aiTone:           "Gentle",
  mealsLogged:      42,
  daysStreak:       7,
  caloriesAvg:      1840,
};

type IconCircleProps = {
  icon: React.ReactNode;
  bg: string;
};

function IconCircle({ icon, bg }: IconCircleProps) {
  return <View style={[styles.iconCircle, { backgroundColor: bg }]}>{icon}</View>;
}

type MenuRowProps = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
};

function MenuRow({ icon, iconBg, label, value, onPress, danger, last }: MenuRowProps) {
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
        <Text style={[styles.menuLabel, danger && { color: D.red }]}>{label}</Text>
      </View>
      {value ? (
        <Text style={styles.menuValue}>{value}</Text>
      ) : (
        <ChevronRight color={D.light} size={18} />
      )}
    </Pressable>
  );
}

export default function ProfileTab() {
  const { t, language } = useLanguage();

  const handleLogout = async () => {
    await clearAuthSession();
    router.replace(ROUTES.login);
  };

  const langDisplay: Record<string, string> = {
    english: "English", yoruba: "Yorùbá", hausa: "Hausa", igbo: "Igbo",
  };

  return (
    <ScreenWrapper scroll bg={D.bg}>

      {/* ── AVATAR HEADER ────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(320)} style={styles.header}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{PROFILE_DATA.initials}</Text>
          </View>
        </View>
        <Text style={styles.name}>{PROFILE_DATA.nickname}</Text>
        <Text style={styles.email}>{PROFILE_DATA.email}</Text>
        <View style={styles.goalBadge}>
          <Target color={D.accent} size={11} />
          <Text style={styles.goalBadgeText}>{PROFILE_DATA.goal}</Text>
        </View>
      </Animated.View>

      {/* ── STATS ROW ─────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(50).duration(320)} style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: D.accentDim }]}>
          <View style={[styles.statIcon, { backgroundColor: D.card }]}>
            <Activity color={D.accent} size={16} />
          </View>
          <Text style={[styles.statNum, { color: D.accent }]}>{PROFILE_DATA.mealsLogged}</Text>
          <Text style={styles.statLabel}>{t.mealsLogged}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: D.orangeDim }]}>
          <View style={[styles.statIcon, { backgroundColor: D.card }]}>
            <Flame color={D.orange} size={16} />
          </View>
          <Text style={[styles.statNum, { color: D.orange }]}>{PROFILE_DATA.daysStreak}</Text>
          <Text style={styles.statLabel}>{t.daysStreak}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: D.indigoDim }]}>
          <View style={[styles.statIcon, { backgroundColor: D.card }]}>
            <Award color={D.indigo} size={16} />
          </View>
          <Text style={[styles.statNum, { color: D.indigo }]}>{PROFILE_DATA.caloriesAvg}</Text>
          <Text style={styles.statLabel}>Avg kcal</Text>
        </View>
      </Animated.View>

      {/* ── HEALTH INFO ───────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(100).duration(320)} style={styles.section}>
        <Text style={styles.sectionTitle}>{t.healthInfo}</Text>
        <View style={styles.sectionCard}>
          <MenuRow
            icon={<Calendar color={D.accent} size={16} />}
            iconBg={D.accentDim}
            label={t.age}
            value={`${PROFILE_DATA.age} yrs`}
          />
          <MenuRow
            icon={<Scale color={D.indigo} size={16} />}
            iconBg={D.indigoDim}
            label={t.weight}
            value={`${PROFILE_DATA.weight} kg`}
          />
          <MenuRow
            icon={<Ruler color={D.orange} size={16} />}
            iconBg={D.orangeDim}
            label={t.height}
            value={`${PROFILE_DATA.height} cm`}
          />
          <MenuRow
            icon={<Heart color="#E05D8B" size={16} />}
            iconBg="rgba(224,93,139,0.09)"
            label={t.nutritionGoal}
            value={PROFILE_DATA.goal}
          />
          <MenuRow
            icon={<Utensils color={D.amber} size={16} />}
            iconBg={D.amberDim}
            label={t.eatingLifestyle}
            value={PROFILE_DATA.eatingLifestyle}
          />
          <MenuRow
            icon={<Shield color={D.indigo} size={16} />}
            iconBg={D.indigoDim}
            label={t.healthAwareness}
            value={PROFILE_DATA.healthAwareness}
          />
          <MenuRow
            icon={<Globe color={D.accent} size={16} />}
            iconBg={D.accentDim}
            label={t.language}
            value={langDisplay[language]}
          />
          <MenuRow
            icon={<SlidersHorizontal color={D.orange} size={16} />}
            iconBg={D.orangeDim}
            label={t.aiAdviceTone}
            value={PROFILE_DATA.aiTone}
            last
          />
        </View>
      </Animated.View>

      {/* ── RESEARCH TOOLS ────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(150).duration(320)} style={styles.section}>
        <Text style={styles.sectionTitle}>Research Tools</Text>
        <View style={styles.sectionCard}>
          <MenuRow
            icon={<MessageSquareText color={D.amber} size={16} />}
            iconBg={D.amberDim}
            label="Study Feedback"
            onPress={() => router.push(ROUTES.studyFeedback)}
          />
          <MenuRow
            icon={<BarChart3 color={D.indigo} size={16} />}
            iconBg={D.indigoDim}
            label="Research Summary"
            onPress={() => router.push(ROUTES.researchSummary)}
          />
          <MenuRow
            icon={<Database color={D.accent} size={16} />}
            iconBg={D.accentDim}
            label="Dataset Contribution"
            onPress={() => router.push(ROUTES.datasetContribution)}
            last
          />
        </View>
      </Animated.View>

      {/* ── GENERAL ───────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(200).duration(320)} style={styles.section}>
        <Text style={styles.sectionTitle}>{t.general}</Text>
        <View style={styles.sectionCard}>
          <MenuRow
            icon={<Settings color={D.muted} size={16} />}
            iconBg="rgba(107,114,128,0.09)"
            label={t.settings}
            onPress={() => router.push(ROUTES.settings)}
          />
          <MenuRow
            icon={<LogOut color={D.red} size={16} />}
            iconBg={D.redDim}
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
  header: {
    alignItems:   "center",
    marginTop:    20,
    marginBottom: 24,
  },
  avatarRing: {
    width:        108,
    height:       108,
    borderRadius: 54,
    borderWidth:  3,
    borderColor:  D.accent,
    alignItems:   "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor:  D.accent,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation:    5,
  },
  avatar: {
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: D.accentDim,
    alignItems:      "center",
    justifyContent:  "center",
  },
  initials: {
    color:      D.accent,
    fontSize:   36,
    fontFamily: FONTS.extraBold,
  },
  name: {
    color:      "#0A0A0A",
    fontSize:   26,
    fontFamily: FONTS.extraBold,
  },
  email: {
    color:      D.muted,
    fontSize:   14,
    fontFamily: FONTS.medium,
    marginTop:  4,
  },
  goalBadge: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               5,
    backgroundColor:   D.accentDim,
    borderRadius:      999,
    paddingHorizontal: 12,
    paddingVertical:   6,
    marginTop:         10,
  },
  goalBadgeText: {
    color:      D.accent,
    fontSize:   12,
    fontFamily: FONTS.semiBold,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap:           10,
    marginBottom:  24,
  },
  statCard: {
    flex:           1,
    borderRadius:   20,
    padding:        14,
    alignItems:     "center",
    gap:            5,
  },
  statIcon: {
    width:           36,
    height:          36,
    borderRadius:    11,
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    2,
    shadowColor:     "#000",
    shadowOpacity:   0.06,
    shadowRadius:    6,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       2,
  },
  statNum: {
    fontSize:   20,
    fontFamily: FONTS.extraBold,
    lineHeight: 24,
  },
  statLabel: {
    color:      D.muted,
    fontSize:   10,
    fontFamily: FONTS.medium,
    textAlign:  "center",
  },

  // Sections
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color:      D.text,
    fontSize:   16,
    fontFamily: FONTS.extraBold,
    marginBottom: 10,
    marginLeft:   2,
  },
  sectionCard: {
    backgroundColor: D.card,
    borderRadius:    22,
    overflow:        "hidden",
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
    borderBottomColor: "#F5F5F5",
  },
  menuRowPressed: {
    backgroundColor: "rgba(0,0,0,0.025)",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           12,
    flex:          1,
  },
  iconCircle: {
    width:          36,
    height:         36,
    borderRadius:   11,
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },
  menuLabel: {
    color:      D.text,
    fontSize:   15,
    fontFamily: FONTS.semiBold,
    flex:       1,
  },
  menuValue: {
    color:      D.muted,
    fontSize:   13,
    fontFamily: FONTS.semiBold,
    maxWidth:   160,
    textAlign:  "right",
  },
});
