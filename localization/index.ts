/**
 * Localization index — exposes a language map and helper.
 */
import { en } from "./en";
import { yo } from "./yo";
import { ha } from "./ha";
import { ig } from "./ig";

export type SupportedLanguage = "english" | "yoruba" | "hausa" | "igbo";

const translations: Record<SupportedLanguage, typeof en> = {
  english: en,
  yoruba: yo,
  hausa: ha,
  igbo: ig,
};

/**
 * Returns the translation object for the given language code.
 * Falls back to English if the language is not found.
 */
export function getTranslations(lang: SupportedLanguage = "english") {
  return translations[lang] ?? en;
}

export { en, yo, ha, ig };
export type { TranslationKey } from "./en";
