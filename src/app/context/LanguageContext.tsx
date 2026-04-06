"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export type Lang = "en" | "kh";

interface LanguageContextType {
  language: Lang;
  toggleLanguage: () => void;
  setLanguage: (lang: Lang) => void;
  apiLang: "en" | "km";
  fontClass: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const LANGUAGE_STORAGE_KEY = "app-language";
const LANGUAGE_COOKIE_KEY = "app-language";

export const LanguageProvider = ({
  children,
  initialLanguage = "kh",
}: {
  children: ReactNode;
  initialLanguage?: Lang;
}) => {
  const router = useRouter();
  const [language, setLanguageState] = useState<Lang>(initialLanguage);

  const syncLanguageStorage = (lang: Lang) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    document.documentElement.lang = lang === "kh" ? "km" : "en";
    document.documentElement.dir = "ltr";
    document.cookie = `${LANGUAGE_COOKIE_KEY}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  useEffect(() => {
    syncLanguageStorage(language);
  }, [language]);

  const setLanguage = (lang: Lang) => {
    if (lang === language) return;
    syncLanguageStorage(lang);
    setLanguageState(lang);
    router.refresh();
  };

  const toggleLanguage = () => {
    const nextLanguage = language === "en" ? "kh" : "en";
    syncLanguageStorage(nextLanguage);
    setLanguageState(nextLanguage);
    router.refresh();
  };

  const value: LanguageContextType = {
    language,
    toggleLanguage,
    setLanguage,
    apiLang: language === "kh" ? "km" : "en",
    fontClass: language === "kh" ? "font-khmer" : "font-sans",
  };

  return (
    <LanguageContext.Provider value={value}>
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
