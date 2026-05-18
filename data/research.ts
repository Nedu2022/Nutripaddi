import type { FeedbackQuestion, ResearchMetric } from "@/types";

export const STUDY_FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
  { id: "easy_use", text: "The app was easy to use." },
  { id: "understood_result", text: "I understood the food result." },
  { id: "useful_advice", text: "The nutrition advice was useful." },
  { id: "understood_meal", text: "The app helped me understand my meal better." },
  { id: "use_again", text: "I would use this app again." },
  { id: "fast_result", text: "The result appeared quickly." },
];

export const FEEDBACK_OPTIONS = [
  "Strongly agree",
  "Agree",
  "Not sure",
  "Disagree",
  "Strongly disagree",
] as const;

export const RESEARCH_METRICS: ResearchMetric[] = [
  {
    label: "Recognition Accuracy",
    value: "91%",
    note: "Validation placeholder for indigenous African food images.",
  },
  {
    label: "Average Inference Speed",
    value: "1.8 sec",
    note: "Target speed for standard mid-range smartphones.",
  },
  {
    label: "Model Size",
    value: "18 MB",
    note: "Lightweight on-device model placeholder.",
  },
  {
    label: "Offline Support",
    value: "Available",
    note: "Local inference, local food library, and saved meal history.",
  },
  {
    label: "Usefulness Rating",
    value: "4.5/5",
    note: "Technology Acceptance Model placeholder score.",
  },
  {
    label: "Ease of Use Rating",
    value: "4.6/5",
    note: "Technology Acceptance Model placeholder score.",
  },
];
