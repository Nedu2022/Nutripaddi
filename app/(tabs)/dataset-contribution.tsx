import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  Check,
  Database,
  ImagePlus,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";

import AppHeader from "@/components/AppHeader";
import CustomButton from "@/components/CustomButton";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { FOOD_CATEGORIES } from "@/data/foods";

export default function DatasetContributionScreen() {
  const [imageName, setImageName] = useState("");
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("Rice Meals");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = Boolean(imageName && foodName.trim() && consent);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      setSubmitted(false);
      setImageName(result.assets[0]?.fileName ?? "Food image selected");
    }
  };

  return (
    <ScreenWrapper scroll>
      <AppHeader
        showBack
        title="Improve African Food AI"
        subtitle="Optional dataset contribution"
      />

      <View style={styles.introCard}>
        <View style={styles.introIcon}>
          <Database color={COLORS.primary} size={22} />
        </View>
        <View style={styles.introCopy}>
          <Text style={styles.introTitle}>Help improve recognition</Text>
          <Text style={styles.introText}>
            Add clear African food images with the correct name. This supports
            future dataset curation and model improvement.
          </Text>
        </View>
      </View>

      <Pressable onPress={pickImage} style={styles.uploadCard}>
        <View style={styles.uploadIcon}>
          <ImagePlus color={COLORS.primary} size={28} />
        </View>
        <Text style={styles.uploadTitle}>
          {imageName || "Upload food image"}
        </Text>
        <Text style={styles.uploadText}>
          Use a clear photo that shows the full plate.
        </Text>
      </Pressable>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Food name</Text>
        <TextInput
          onChangeText={(value) => {
            setSubmitted(false);
            setFoodName(value);
          }}
          placeholder="e.g. Afang Soup"
          placeholderTextColor={COLORS.textLight}
          style={styles.input}
          value={foodName}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Food category</Text>
        <View style={styles.categoryGrid}>
          {FOOD_CATEGORIES.filter((item) => item !== "All").map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setSubmitted(false);
                setCategory(item);
              }}
              style={[
                styles.categoryChip,
                category === item && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Optional note</Text>
        <TextInput
          multiline
          onChangeText={(value) => {
            setSubmitted(false);
            setNote(value);
          }}
          placeholder="Tell us anything useful, like ingredients or local name."
          placeholderTextColor={COLORS.textLight}
          style={[styles.input, styles.noteInput]}
          value={note}
        />
      </View>

      <Pressable onPress={() => setConsent((current) => !current)} style={styles.consentCard}>
        <View style={[styles.checkbox, consent && styles.checkboxActive]}>
          {consent && <Check color={COLORS.white} size={15} strokeWidth={3} />}
        </View>
        <Text style={styles.consentText}>
          I agree that this image may be used to improve African food
          recognition.
        </Text>
      </Pressable>

      {submitted && (
        <View style={styles.successCard}>
          <Sparkles color={COLORS.success} size={18} />
          <Text style={styles.successText}>
            Contribution saved locally for this prototype.
          </Text>
        </View>
      )}

      <View style={styles.privacyCard}>
        <ShieldCheck color={COLORS.warning} size={18} />
        <Text style={styles.privacyText}>
          Prototype note: image upload is simulated locally until a secure
          research storage workflow is connected.
        </Text>
      </View>

      <CustomButton
        disabled={!canSubmit}
        onPress={() => setSubmitted(true)}
        title="Submit Contribution"
      />
      <View style={{ height: 24 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  introCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: COLORS.softGreen,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  introCopy: {
    flex: 1,
  },
  introTitle: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  introText: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.medium,
    lineHeight: 20,
    marginTop: 4,
  },
  uploadCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    marginBottom: 16,
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.bold,
    textAlign: "center",
  },
  uploadText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    textAlign: "center",
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  noteInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  consentCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  consentText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.medium,
    lineHeight: 19,
  },
  privacyCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.softYellow,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  privacyText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },
  successCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.softGreen,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  successText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.medium,
    lineHeight: 19,
  },
});
