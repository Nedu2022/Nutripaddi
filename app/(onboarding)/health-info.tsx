import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import QuestionHeader from "@/components/QuestionHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";

type HealthErrors = Partial<{ age: string; height: string; weight: string; gender: string }>;

const GENDERS = ["Male", "Female"];

export default function HealthInfoScreen() {
  const { t } = useLanguage();
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<HealthErrors>({});

  const validate = () => {
    const e: HealthErrors = {};
    if (!age.trim()) e.age = "Required";
    if (!gender) e.gender = "Required";
    if (!height.trim()) e.height = "Required";
    if (!weight.trim()) e.weight = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (validate()) router.push(ROUTES.goals);
  };

  return (
    <ScreenWrapper scroll>
      <QuestionHeader eyebrow={t.setupEyebrow} step={2} subtitle={t.step1Subtitle} title={t.step1Title} totalSteps={5} />

      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.form}>
        <Text style={styles.sectionTitle}>{t.personalDetails}</Text>
        <InputField error={errors.age} keyboardType="number-pad" label={t.age} onChangeText={setAge} placeholder="e.g. 28" value={age} />

        <Text style={styles.fieldLabel}>{t.gender}</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((g) => (
            <Pressable key={g} onPress={() => { setGender(g); setErrors((p) => ({ ...p, gender: undefined })); }}
              style={[styles.genderOption, gender === g && styles.genderSelected]}>
              <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>{g}</Text>
            </Pressable>
          ))}
        </View>
        {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}

        <InputField error={errors.weight} keyboardType="numeric" label={t.weight} onChangeText={setWeight} placeholder="e.g. 60" value={weight} />
        <InputField error={errors.height} keyboardType="numeric" label={t.height} onChangeText={setHeight} placeholder="e.g. 165" value={height} />
      </Animated.View>

      <CustomButton onPress={handleContinue} title={t.continue} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  form: { marginBottom: 24 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontFamily: FONTS.bold, marginBottom: 16 },
  fieldLabel: { color: COLORS.text, fontSize: 14, fontFamily: FONTS.semiBold, marginBottom: 8 },
  genderRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  genderOption: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.inputBg,
  },
  genderSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.softGreen },
  genderText: { color: COLORS.textMuted, fontSize: 15, fontFamily: FONTS.semiBold },
  genderTextSelected: { color: COLORS.primaryDark },
  errorText: { color: COLORS.error, fontSize: 13, fontFamily: FONTS.medium, marginTop: -10, marginBottom: 14 },
});
