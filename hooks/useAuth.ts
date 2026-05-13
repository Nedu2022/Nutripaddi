import { COLORS } from "@/constants/colors";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof COLORS
) {
  return props.light ?? props.dark ?? COLORS[colorName];
}
