import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupportedLanguage } from "@/localization";
import { getTranslations } from "@/localization";
import type { en } from "@/localization/en";

const LANG_STORAGE_KEY = "@nutriPadi_language";

type LanguageContextType = {
  language: SupportedLanguage;
  t: typeof en;
  setLanguage: (lang: SupportedLanguage) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "english",
  t: getTranslations("english"),
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<SupportedLanguage>("english");

  const setLanguage = (lang: SupportedLanguage) => {
    setLang(lang);
    AsyncStorage.setItem(LANG_STORAGE_KEY, lang).catch(() => {});
  };

  useEffect(() => {
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((saved) => {
      if (
        saved === "english" ||
        saved === "yoruba" ||
        saved === "hausa" ||
        saved === "igbo"
      ) {
        setLang(saved);
      }
    }).catch(() => {});
  }, []);

  const t = getTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
