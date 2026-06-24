export const COLORS = {
  // Primary palette — matches vibrant nutrition palette used across all screens
  primary:     "#16A34A",   // vibrant green (was #008000)
  secondary:   "#0F172A",
  freshOrange: "#F97316",   // vibrant orange (was #FF5F15)

  // Backgrounds
  background:  "#F8FAFC",
  card:        "#FFFFFF",
  softGreen:   "#F0FDF4",   // greenDim
  softOrange:  "#FFF7ED",   // orangeDim

  // Text
  text:        "#0F172A",
  textMuted:   "#64748B",
  textLight:   "#94A3B8",

  // Semantic
  success:     "#16A34A",
  warning:     "#F97316",
  error:       "#DC2626",

  // UI
  border:      "#E2E8F0",
  inputBg:     "#F8FAFC",
  overlay:     "rgba(0, 0, 0, 0.6)",

  // Extended
  white:        "#FFFFFF",
  primaryDark:  "#15803D",
  secondaryDark:"#0F172A",
  softYellow:   "#FFF7ED",
  softRed:      "#FEF2F2",
  softCream:    "#FFFFFF",
  charcoal:     "#1E293B",
  softGray:     "#F1F5F9",

  // Backward-compatible aliases
  primaryGreen:  "#16A34A",
  primaryOrange: "#F97316",
  darkText:      "#0F172A",
  mutedText:     "#64748B",
  darkGreen:     "#15803D",
} as const;

export type ColorName = keyof typeof COLORS;
