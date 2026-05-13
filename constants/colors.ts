export const COLORS = {
  // Primary palette
  primary: "#06C167", // Uber Eats green
  secondary: "#000000", // Stark black

  // Backgrounds
  background: "#FFFFFF", // Pure white background
  card: "#FFFFFF",
  softGreen: "#E8F9F0",
  softOrange: "#F6F6F6", // Using as a soft grey instead

  // Text
  text: "#000000",
  textMuted: "#545454",
  textLight: "#A6A6A6",

  // Semantic
  success: "#06C167",
  warning: "#FFC043",
  error: "#E23636",

  // UI
  border: "#EEEEEE",
  inputBg: "#F6F6F6",
  overlay: "rgba(0, 0, 0, 0.6)",

  // Extended
  white: "#FFFFFF",
  primaryDark: "#048848",
  secondaryDark: "#000000",
  softYellow: "#FFF6E5",
  softRed: "#FCECEC",

  // Backward-compatible aliases
  primaryGreen: "#06C167",
  primaryOrange: "#FFC043",
  darkText: "#000000",
  mutedText: "#545454",
  darkGreen: "#048848",
} as const;

export type ColorName = keyof typeof COLORS;
