import * as LucideIcons from "lucide-react-native";
import type { LucideProps } from "lucide-react-native";
import type { ComponentType } from "react";

/**
 * Dynamically renders a Lucide icon by name.
 * Falls back to CircleHelp if the icon name is not found.
 */
export function getLucideIcon(
  iconName: string
): ComponentType<LucideProps> {
  const icons = LucideIcons as unknown as Record<string, ComponentType<LucideProps>>;
  return icons[iconName] || LucideIcons.CircleHelp;
}
