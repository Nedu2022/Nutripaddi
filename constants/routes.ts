import type { Href } from "expo-router";

const route = (path: string) => path as Href;

export const ROUTES = {
  // Onboarding
  splash: route("/(onboarding)/splash"),
  intro: route("/(onboarding)/intro"),

  // Auth
  signup: route("/(auth)/signup"),
  login: route("/(auth)/login"),
  forgotPassword: route("/(auth)/forgot-password"),
  resetPassword: route("/(auth)/reset-password"),

  // AI Nutritionist Setup (after signup)
  languageSelect: route("/(onboarding)/language-select"),
  lifeStage: route("/(onboarding)/life-stage"),
  healthInfo: route("/(onboarding)/health-info"),
  goals: route("/(onboarding)/goals"),
  eatingLifestyle: route("/(onboarding)/eating-lifestyle"),
  healthAwareness: route("/(onboarding)/health-awareness"),
  profileSetup: route("/(onboarding)/profile-setup"),

  // Main tabs
  tabs: route("/(tabs)"),
  scan: route("/(tabs)/scan"),
  aiCoach: route("/(tabs)/ai-coach"),
  mealLog: route("/(tabs)/meal-log"),
  profile: route("/(tabs)/profile"),

  // Sub-screens (hidden from tab bar)
  analyzing: route("/(tabs)/analyzing"),
  foodResult: route("/(tabs)/food-result"),
  mealDetails: route("/(tabs)/meal-details"),
  nutritionHistory: route("/(tabs)/nutrition-history"),
  settings: route("/(tabs)/settings"),
  smartSuggestions: route("/(tabs)/smart-suggestions"),
  nutritionLessons: route("/(tabs)/nutrition-lessons"),
  studyFeedback: route("/(tabs)/study-feedback"),
  researchSummary: route("/(tabs)/research-summary"),
  datasetContribution: route("/(tabs)/dataset-contribution"),
} as const;
