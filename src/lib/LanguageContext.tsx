"use client";
import { createContext, useContext, useMemo } from "react";
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
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const t = translations[language];
  const value = useMemo(() => ({ lang: language, t, setLang: setLanguage }), [language, t, setLanguage]);
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
