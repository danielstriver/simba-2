"use client";
import { createContext, useContext } from "react";
import { translations, Language, Translations } from "./i18n";
import { useStore } from "./store";

interface LangContext {
  lang: Language;
  t: Translations;
  setLang: (l: Language) => void;
}

const LanguageContext = createContext<LangContext>({
  lang: "en",
  t: translations.en,
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language, setLanguage } = useStore();
  const t = translations[language];
  return (
    <LanguageContext.Provider value={{ lang: language, t, setLang: setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
