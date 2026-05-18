import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Globe, Check } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import QuestionHeader from "@/components/QuestionHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import type { SupportedLanguage } from "@/localization";

const LANGUAGES: { id: SupportedLanguage; name: string; subtitle: string; marker: string }[] = [
  { id: "english", name: "English", subtitle: "Continue in English", marker: "EN" },
  { id: "yoruba", name: "Yorùbá", subtitle: "Tẹsiwaju ni Yoruba", marker: "YO" },
  { id: "hausa", name: "Hausa", subtitle: "Ci gaba da Hausa", marker: "HA" },
  { id: "igbo", name: "Igbo", subtitle: "Gaa n'ihu n'asụsụ Igbo", marker: "IG" },
];

export default function LanguageSelectScreen() {
  const { language, setLanguage, t } = useLanguage();
  const [selected, setSelected] = useState<SupportedLanguage>(language);

  const handleContinue = () => {
    setLanguage(selected);
    router.push(ROUTES.healthInfo);
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader
        eyebrow={t.setupEyebrow}
        step={1}
        subtitle={t.chooseLanguageSub}
        title={t.chooseLanguage}
        totalSteps={5}
      />

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.options}>
        {LANGUAGES.map((lang) => {
          const isSelected = selected === lang.id;
          return (
            <Pressable
              key={lang.id}
              onPress={() => setSelected(lang.id)}
              style={[styles.langCard, isSelected && styles.langCardSelected]}
            >
              <View style={styles.langLeft}>
                <View style={[styles.flagCircle, isSelected && styles.flagCircleSelected]}>
                  <Text style={styles.flag}>{lang.marker}</Text>
                </View>
                <View>
                  <Text style={[styles.langName, isSelected && styles.langNameSelected]}>{lang.name}</Text>
                  <Text style={styles.langSub}>{lang.subtitle}</Text>
                </View>
              </View>
              {isSelected && (
                <View style={styles.checkCircle}>
                  <Check color={COLORS.white} size={14} strokeWidth={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </Animated.View>

      <View style={styles.infoCard}>
        <Globe color={COLORS.primary} size={18} />
        <Text style={styles.infoText}>{t.langMoreSoon}</Text>
      </View>

      <CustomButton onPress={handleContinue} title={t.continue} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  options: { gap: 12, marginBottom: 20 },
  langCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: COLORS.card, borderRadius: 16, padding: 18,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  langCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.softGreen },
  langLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  flagCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.softOrange, alignItems: "center", justifyContent: "center",
  },
  flagCircleSelected: { backgroundColor: COLORS.white },
  flag: { color: COLORS.text, fontSize: 13, fontFamily: FONTS.extraBold },
  langName: { color: COLORS.text, fontSize: 17, fontFamily: FONTS.bold },
  langNameSelected: { color: COLORS.primaryDark },
  langSub: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular, marginTop: 2 },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center",
  },
  infoCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: COLORS.softGreen, borderRadius: 12, padding: 14, marginBottom: 20,
  },
  infoText: { flex: 1, color: COLORS.primaryDark, fontSize: 13, fontFamily: FONTS.medium },
});
