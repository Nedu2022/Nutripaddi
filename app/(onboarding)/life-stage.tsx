import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Baby, Check, HeartPulse, User } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import QuestionHeader from "@/components/QuestionHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { updateOnboardingDraft } from "@/src/services/onboardingDraft";
import type { LifeStage, PregnancyTrimester } from "@/types";

const STAGES: {
  id: LifeStage;
  Icon: typeof User;
  titleKey: "lifeStageGeneral" | "lifeStagePregnant" | "lifeStageNursing";
  descKey: "lifeStageGeneralDesc" | "lifeStagePregnantDesc" | "lifeStageNursingDesc";
}[] = [
  { id: "general", Icon: User, titleKey: "lifeStageGeneral", descKey: "lifeStageGeneralDesc" },
  { id: "pregnant", Icon: HeartPulse, titleKey: "lifeStagePregnant", descKey: "lifeStagePregnantDesc" },
  { id: "nursing", Icon: Baby, titleKey: "lifeStageNursing", descKey: "lifeStageNursingDesc" },
];

const TRIMESTERS: {
  id: PregnancyTrimester;
  key: "trimesterFirst" | "trimesterSecond" | "trimesterThird";
}[] = [
  { id: "first", key: "trimesterFirst" },
  { id: "second", key: "trimesterSecond" },
  { id: "third", key: "trimesterThird" },
];

export default function LifeStageScreen() {
  const { t } = useLanguage();
  const [stage, setStage] = useState<LifeStage | "">("");
  const [trimester, setTrimester] = useState<PregnancyTrimester | "">("");
  const [babyMonths, setBabyMonths] = useState("");
  const [error, setError] = useState("");

  const showMaternalNote = stage === "pregnant" || stage === "nursing";

  const handleContinue = () => {
    if (!stage) {
      setError(t.lifeStageRequired);
      return;
    }
    if (stage === "pregnant" && !trimester) {
      setError(t.trimesterRequired);
      return;
    }
    if (stage === "nursing" && !babyMonths.trim()) {
      setError(t.babyAgeRequired);
      return;
    }

    setError("");
    updateOnboardingDraft({
      lifeStage: stage,
      trimester: stage === "pregnant" ? (trimester || null) : null,
      babyAgeMonths: stage === "nursing" ? Number(babyMonths) : null,
    });
    router.push(ROUTES.healthInfo);
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader
        eyebrow={t.setupEyebrow}
        step={2}
        subtitle={t.lifeStageSubtitle}
        title={t.lifeStageTitle}
        totalSteps={6}
      />

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.options}>
        {STAGES.map(({ id, Icon, titleKey, descKey }) => {
          const isSelected = stage === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                setStage(id);
                setError("");
              }}
              style={[styles.stageCard, isSelected && styles.stageCardSelected]}
            >
              <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                <Icon
                  color={isSelected ? COLORS.white : COLORS.primary}
                  size={22}
                  strokeWidth={2}
                />
              </View>
              <View style={styles.stageText}>
                <Text style={[styles.stageTitle, isSelected && styles.stageTitleSelected]}>
                  {t[titleKey]}
                </Text>
                <Text style={styles.stageDesc}>{t[descKey]}</Text>
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

      {stage === "pregnant" && (
        <Animated.View entering={FadeInUp.duration(320)} style={styles.subSection}>
          <Text style={styles.subLabel}>{t.trimesterLabel}</Text>
          <View style={styles.trimesterRow}>
            {TRIMESTERS.map(({ id, key }) => {
              const isSelected = trimester === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => {
                    setTrimester(id);
                    setError("");
                  }}
                  style={[styles.trimesterChip, isSelected && styles.trimesterChipSelected]}
                >
                  <Text style={[styles.trimesterText, isSelected && styles.trimesterTextSelected]}>
                    {t[key]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      )}

      {stage === "nursing" && (
        <Animated.View entering={FadeInUp.duration(320)} style={styles.subSection}>
          <InputField
            keyboardType="number-pad"
            label={t.babyAgeLabel}
            onChangeText={(value) => {
              setBabyMonths(value.replace(/[^0-9]/g, ""));
              setError("");
            }}
            placeholder={t.babyAgePlaceholder}
            value={babyMonths}
          />
        </Animated.View>
      )}

      {showMaternalNote && (
        <View style={styles.noteCard}>
          <View style={styles.noteDot} />
          <Text style={styles.noteText}>{t.maternalNote}</Text>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <CustomButton onPress={handleContinue} title={t.continue} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  options: { gap: 12, marginBottom: 16 },
  stageCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  stageCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.softGreen },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconCircleSelected: { backgroundColor: COLORS.primary },
  stageText: { flex: 1 },
  stageTitle: { color: COLORS.text, fontSize: 16, fontFamily: FONTS.bold },
  stageTitleSelected: { color: COLORS.primaryDark },
  stageDesc: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular, marginTop: 3, lineHeight: 18 },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  subSection: { marginBottom: 16 },
  subLabel: { color: COLORS.text, fontSize: 14, fontFamily: FONTS.semiBold, marginBottom: 10 },
  trimesterRow: { flexDirection: "row", gap: 10 },
  trimesterChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
  },
  trimesterChipSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.softGreen },
  trimesterText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    textAlign: "center",
    lineHeight: 18,
  },
  trimesterTextSelected: { color: COLORS.primaryDark },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: COLORS.softYellow,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  noteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginTop: 5,
    flexShrink: 0,
  },
  noteText: { flex: 1, color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.medium, lineHeight: 18 },
  error: { color: COLORS.error, fontSize: 13, marginBottom: 14 },
});
