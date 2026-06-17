import { en } from "./en";
import { yo } from "./yo";
import { ha } from "./ha";
import { ig } from "./ig";
import { fr } from "./fr";
import { sw } from "./sw";

export type SupportedLanguage = "english" | "french" | "swahili" | "yoruba" | "hausa" | "igbo";

const translations: Record<SupportedLanguage, typeof en> = {
  english: en,
  french:  fr,
  swahili: sw,
  yoruba:  yo,
  hausa:   ha,
  igbo:    ig,
};

export function getTranslations(lang: SupportedLanguage = "english") {
  return translations[lang] ?? en;
}

export { en, yo, ha, ig, fr, sw };
export type { TranslationKey } from "./en";
