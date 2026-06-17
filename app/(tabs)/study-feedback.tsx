import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CheckCircle2, MessageSquareText } from "lucide-react-native";

import AppHeader from "@/components/AppHeader";
import CustomButton from "@/components/CustomButton";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import {
  getFeedbackOptions,
  getFeedbackQuestions,
  submitStudyFeedback,
} from "@/src/services/contentService";
import type { FeedbackQuestion } from "@/types";

export default function StudyFeedbackScreen() {
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadFeedbackForm = async () => {
      try {
        const [questionItems, optionItems] = await Promise.all([
          getFeedbackQuestions(),
          getFeedbackOptions(),
        ]);

        if (!mounted) return;
        setQuestions(questionItems);
        setOptions(optionItems);
        setStatusMessage("");
      } catch (error) {
        if (!mounted) return;
        setStatusMessage(error instanceof Error ? error.message : "Could not load feedback form.");
      }
    };

    void loadFeedbackForm();

    return () => {
      mounted = false;
    };
  }, []);

  const isComplete = useMemo(
    () =>
      questions.length > 0 &&
      options.length > 0 &&
      questions.every((question) => Boolean(ratings[question.id])),
    [options.length, questions, ratings]
  );

  const handleSubmit = async () => {
    if (!isComplete) return;

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await submitStudyFeedback(ratings);
      setSubmitted(true);
      setStatusMessage("Thank you. Your feedback has been recorded.");
    } catch (error) {
      setSubmitted(false);
      setStatusMessage(error instanceof Error ? error.message : "Could not submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper scroll>
      <AppHeader
        showBack
        title="Study Feedback"
        subtitle="Help evaluate usefulness and ease of use"
      />

      <View style={styles.introCard}>
        <View style={styles.introIcon}>
          <MessageSquareText color={COLORS.primary} size={22} />
        </View>
        <View style={styles.introCopy}>
          <Text style={styles.introTitle}>Technology Acceptance Model</Text>
          <Text style={styles.introText}>
            Your response helps evaluate whether NutriPadi feels useful, clear,
            fast, and easy to use.
          </Text>
        </View>
      </View>

      {questions.map((question, index) => (
        <View key={question.id} style={styles.questionCard}>
          <Text style={styles.questionNumber}>Question {index + 1}</Text>
          <Text style={styles.questionText}>{question.text}</Text>
          <View style={styles.optionStack}>
            {options.map((option) => {
              const selected = ratings[question.id] === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setSubmitted(false);
                    setRatings((current) => ({
                      ...current,
                      [question.id]: option,
                    }));
                  }}
                  style={[
                    styles.optionRow,
                    selected && styles.optionRowSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {selected && <CheckCircle2 color={COLORS.primary} size={17} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      {submitted && (
        <View style={styles.successCard}>
          <CheckCircle2 color={COLORS.success} size={18} />
          <Text style={styles.successText}>
            {statusMessage}
          </Text>
        </View>
      )}

      {statusMessage && !submitted ? (
        <Text style={styles.statusText}>{statusMessage}</Text>
      ) : null}

      <CustomButton
        disabled={!isComplete}
        loading={isSubmitting}
        onPress={handleSubmit}
        title="Submit Feedback"
      />
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
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  questionNumber: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.bold,
    marginBottom: 6,
  },
  questionText: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.bold,
    lineHeight: 22,
    marginBottom: 12,
  },
  optionStack: {
    gap: 8,
  },
  optionRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionRowSelected: {
    backgroundColor: COLORS.softGreen,
    borderColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  optionTextSelected: {
    color: COLORS.primaryDark,
  },
  successCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.softGreen,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  successText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.medium,
    lineHeight: 19,
  },
  statusText: {
    color: COLORS.error,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginBottom: 12,
    textAlign: "center",
  },
});
