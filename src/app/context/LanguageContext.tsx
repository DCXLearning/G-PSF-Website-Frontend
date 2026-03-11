"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "kh";

interface LanguageContextType {
  language: Lang;
  toggleLanguage: () => void;

  //  helpers
  apiLang: "en" | "km";
  fontClass: string; // "font-sans" | "font-khmer"
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Lang>("en");

  const toggleLanguage = () => setLanguage((prev) => (prev === "en" ? "kh" : "en"));

  const value = useMemo<LanguageContextType>(() => {
    return {
      language,
      toggleLanguage,
      apiLang: language === "kh" ? "km" : "en",
      fontClass: language === "kh" ? "font-khmer" : "font-sans",
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};