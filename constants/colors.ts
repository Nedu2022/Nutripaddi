export const COLORS = {
  // Primary palette
  primary: "#008000",
  secondary: "#000000", // Stark black
  freshOrange: "#FF5F15",

  // Backgrounds
  background: "#FFFFFF",
  card: "#FFFFFF",
  softGreen: "#D6EED6",
  softOrange: "#F6F6F6",

  // Text
  text: "#000000",
  textMuted: "#545454",
  textLight: "#A6A6A6",

  // Semantic
  success: "#008000",
  warning: "#FF5F15",
  error: "#E23636",

  // UI
  border: "#EEEEEE",
  inputBg: "#F6F6F6",
  overlay: "rgba(0, 0, 0, 0.6)",

  // Extended
  white: "#FFFFFF",
  primaryDark: "#006400",
  secondaryDark: "#000000",
  softYellow: "#FFF0E8",
  softRed: "#FCECEC",
  softCream: "#FFFFFF",
  charcoal: "#000000",
  softGray: "#F6F6F6",

  // Backward-compatible aliases
  primaryGreen: "#008000",
  primaryOrange: "#FF5F15",
  darkText: "#000000",
  mutedText: "#545454",
  darkGreen: "#006400",
} as const;

export type ColorName = keyof typeof COLORS;
