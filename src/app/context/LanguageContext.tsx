"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "kh";

interface LanguageContextType {
  language: Lang;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Lang>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "kh" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
};
