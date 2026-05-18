import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  User, Settings, ChevronRight, Award, Heart, Shield,
  Activity, Scale, Ruler, Calendar, LogOut, Globe, Database,
  MessageSquareText, BarChart3, SlidersHorizontal, Utensils,
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";

const PROFILE_DATA = {
  nickname: "Nnedu",
  email: "nnedu@nutripaddi.com",
  goal: "Eat healthier",
  age: 24,
  weight: 60,
  height: 165,
  healthAwareness: "General wellness",
  eatingLifestyle: "Control how much I eat",
  aiTone: "Gentle",
  mealsLogged: 42,
  daysStreak: 7,
};

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
};

function MenuItem({ icon, label, value, onPress, danger }: MenuItemProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}>
      <View style={styles.menuLeft}>
        {icon}
        <Text style={[styles.menuLabel, danger && styles.menuDanger]}>{label}</Text>
      </View>
      {value ? <Text style={styles.menuValue}>{value}</Text> : <ChevronRight color={COLORS.textLight} size={18} />}
    </Pressable>
  );
}

export default function ProfileTab() {
  const { t, language } = useLanguage();

  const langDisplay: Record<string, string> = {
    english: "English", yoruba: "Yorùbá", hausa: "Hausa", igbo: "Igbo",
  };

  return (
    <ScreenWrapper scroll>
      <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
        <View style={styles.avatar}>
          <User color={COLORS.primary} size={42} strokeWidth={1.8} />
        </View>
        <Text style={styles.name}>{PROFILE_DATA.nickname}</Text>
        <Text style={styles.email}>{PROFILE_DATA.email}</Text>
      </Animated.View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.softGreen }]}>
            <Activity color={COLORS.primary} size={18} />
          </View>
          <Text style={styles.statValue}>{PROFILE_DATA.mealsLogged}</Text>
          <Text style={styles.statLabel}>{t.mealsLogged}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.softOrange }]}>
            <Award color={COLORS.secondary} size={18} />
          </View>
          <Text style={styles.statValue}>{PROFILE_DATA.daysStreak}</Text>
          <Text style={styles.statLabel}>{t.daysStreak}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t.healthInfo}</Text>
        <MenuItem icon={<Calendar color={COLORS.textMuted} size={20} />} label={t.age} value={`${PROFILE_DATA.age}`} />
        <MenuItem icon={<Scale color={COLORS.textMuted} size={20} />} label={t.weight} value={`${PROFILE_DATA.weight} kg`} />
        <MenuItem icon={<Ruler color={COLORS.textMuted} size={20} />} label={t.height} value={`${PROFILE_DATA.height} cm`} />
        <MenuItem icon={<Heart color={COLORS.textMuted} size={20} />} label={t.nutritionGoal} value={PROFILE_DATA.goal} />
        <MenuItem icon={<Utensils color={COLORS.textMuted} size={20} />} label={t.eatingLifestyle} value={PROFILE_DATA.eatingLifestyle} />
        <MenuItem icon={<Shield color={COLORS.textMuted} size={20} />} label={t.healthAwareness} value={PROFILE_DATA.healthAwareness} />
        <MenuItem icon={<Globe color={COLORS.textMuted} size={20} />} label={t.language} value={langDisplay[language]} />
        <MenuItem icon={<SlidersHorizontal color={COLORS.textMuted} size={20} />} label={t.aiAdviceTone} value={PROFILE_DATA.aiTone} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Research tools</Text>
        <MenuItem icon={<MessageSquareText color={COLORS.textMuted} size={20} />} label="Study feedback" onPress={() => router.push(ROUTES.studyFeedback)} />
        <MenuItem icon={<BarChart3 color={COLORS.textMuted} size={20} />} label="Research summary" onPress={() => router.push(ROUTES.researchSummary)} />
        <MenuItem icon={<Database color={COLORS.textMuted} size={20} />} label="Dataset contribution" onPress={() => router.push(ROUTES.datasetContribution)} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t.general}</Text>
        <MenuItem icon={<Settings color={COLORS.textMuted} size={20} />} label={t.settings} onPress={() => router.push(ROUTES.settings)} />
        <MenuItem danger icon={<LogOut color={COLORS.error} size={20} />} label={t.logout} onPress={() => router.replace(ROUTES.login)} />
      </View>

      <View style={{ height: 24 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 24, marginTop: 24 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: "center", justifyContent: "center", backgroundColor: COLORS.softGreen, marginBottom: 14,
  },
  name: { color: COLORS.text, fontSize: 24, fontFamily: FONTS.extraBold },
  email: { color: COLORS.textMuted, fontSize: 14, fontFamily: FONTS.regular, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, alignItems: "center",
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { color: COLORS.text, fontSize: 22, fontFamily: FONTS.extraBold },
  statLabel: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.medium, marginTop: 2 },
  sectionCard: {
    backgroundColor: COLORS.card, borderRadius: 18, padding: 4,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontFamily: FONTS.bold, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  menuItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  menuPressed: { backgroundColor: "rgba(0,0,0,0.02)" },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuLabel: { color: COLORS.text, fontSize: 15, fontFamily: FONTS.medium },
  menuDanger: { color: COLORS.error },
  menuValue: { color: COLORS.textMuted, fontSize: 14, fontFamily: FONTS.semiBold, maxWidth: 160, textAlign: "right" },
});
