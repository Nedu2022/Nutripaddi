import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Bell, Moon, Globe, Shield, HelpCircle, Info, ChevronRight, Trash2, LogOut,
} from "lucide-react-native";

import ScreenWrapper from "@/components/ScreenWrapper";
import AppHeader from "@/components/AppHeader";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";

type SettingRowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
};

function SettingRow({ icon, label, value, toggle, toggleValue, onToggle, onPress, danger }: SettingRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && !toggle && styles.rowPressed]} disabled={toggle}>
      <View style={styles.rowLeft}>
        {icon}
        <Text style={[styles.rowLabel, danger && styles.rowDanger]}>{label}</Text>
      </View>
      {toggle ? (
        <Switch trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor={COLORS.white} value={toggleValue} onValueChange={onToggle} />
      ) : value ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : (
        <ChevronRight color={COLORS.textLight} size={18} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const langDisplay: Record<string, string> = {
    english: "English", yoruba: "Yorùbá", hausa: "Hausa", igbo: "Igbo",
  };

  return (
    <ScreenWrapper scroll>
      <AppHeader showBack title={t.settingsTitle} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.preferences}</Text>
        <View style={styles.sectionCard}>
          <SettingRow icon={<Bell color={COLORS.textMuted} size={20} />} label={t.notifications} toggle toggleValue={notifications} onToggle={setNotifications} />
          <SettingRow icon={<Moon color={COLORS.textMuted} size={20} />} label={t.darkMode} toggle toggleValue={darkMode} onToggle={setDarkMode} />
          <SettingRow icon={<Globe color={COLORS.textMuted} size={20} />} label={t.language} value={langDisplay[language]} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.support}</Text>
        <View style={styles.sectionCard}>
          <SettingRow icon={<HelpCircle color={COLORS.textMuted} size={20} />} label={t.helpCenter} />
          <SettingRow icon={<Shield color={COLORS.textMuted} size={20} />} label={t.privacyPolicy} />
          <SettingRow icon={<Info color={COLORS.textMuted} size={20} />} label={t.aboutNutriPadi} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionCard}>
          <SettingRow icon={<Info color={COLORS.textMuted} size={20} />} label={t.appVersion} value="1.0.0" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.account}</Text>
        <View style={styles.sectionCard}>
          <SettingRow icon={<LogOut color={COLORS.error} size={20} />} label={t.logout} danger onPress={() => router.replace(ROUTES.login)} />
          <SettingRow icon={<Trash2 color={COLORS.error} size={20} />} label={t.deleteAccount} danger />
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  sectionTitle: {
    color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.semiBold,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, paddingLeft: 4,
  },
  sectionCard: { backgroundColor: COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rowPressed: { backgroundColor: "rgba(0,0,0,0.02)" },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  rowLabel: { color: COLORS.text, fontSize: 15, fontFamily: FONTS.medium },
  rowDanger: { color: COLORS.error },
  rowValue: { color: COLORS.textMuted, fontSize: 14, fontFamily: FONTS.medium },
});
