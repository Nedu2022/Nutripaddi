import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import QuestionHeader from "@/components/QuestionHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import type { SupportedLanguage } from "@/localization";
import { updateOnboardingDraft } from "@/src/services/onboardingDraft";

const LANGUAGES: { id: SupportedLanguage; name: string; subtitle: string; region: string; marker: string }[] = [
  { id: "english",  name: "English",  subtitle: "Continue in English",          region: "Pan-African",       marker: "EN" },
  { id: "french",   name: "Français", subtitle: "Continuer en Français",        region: "Afrique Centrale",  marker: "FR" },
  { id: "swahili",  name: "Kiswahili",subtitle: "Endelea kwa Kiswahili",        region: "Afrika Mashariki",  marker: "SW" },
  { id: "yoruba",   name: "Yorùbá",   subtitle: "Tẹsiwaju ni Yoruba",          region: "Àárùn-oorùn Áfríkà",marker: "YO" },
  { id: "hausa",    name: "Hausa",    subtitle: "Ci gaba da Hausa",             region: "Yammacin Afirka",   marker: "HA" },
  { id: "igbo",     name: "Igbo",     subtitle: "Gaa n'ihu n'asụsụ Igbo",     region: "Ọdịda-anyanwụ Afịrịkà", marker: "IG" },
];

export default function LanguageSelectScreen() {
  const { language, setLanguage, t } = useLanguage();
  const [selected, setSelected] = useState<SupportedLanguage>(language);

  const handleContinue = () => {
    setLanguage(selected);
    updateOnboardingDraft({ language: selected });
    router.push(ROUTES.lifeStage);
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader
        eyebrow={t.setupEyebrow}
        step={1}
        subtitle={t.chooseLanguageSub}
        title={t.chooseLanguage}
        totalSteps={6}
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
                  <Text style={styles.langRegion}>{lang.region}</Text>
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
  langRegion: { color: COLORS.primary, fontSize: 11, fontFamily: FONTS.semiBold, marginTop: 3, opacity: 0.75 },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center",
  },
});
