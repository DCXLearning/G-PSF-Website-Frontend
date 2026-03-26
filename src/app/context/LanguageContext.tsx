"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "kh";

interface LanguageContextType {
  language: Lang;
  toggleLanguage: () => void;
  setLanguage: (lang: Lang) => void;
  apiLang: "en" | "km";
  fontClass: string;
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const isLang = (value: string | null): value is Lang => {
  return value === "en" || value === "kh";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Default = Khmer
  const [language, setLanguageState] = useState<Lang>("kh");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("app-language");

    if (isLang(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // first open website -> Khmer by default
      setLanguageState("kh");
      localStorage.setItem("app-language", "kh");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("app-language", language);
    document.documentElement.lang = language === "kh" ? "km" : "en";
    document.documentElement.dir = "ltr";

    document.title =
      language === "kh"
        ? "វេទិការាជរដ្ឋាភិបាល-វិស័យឯកជន"
        : "G-PSF Website";
  }, [language, mounted]);

  const setLanguage = (lang: Lang) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "en" ? "kh" : "en"));
  };

  const value = useMemo<LanguageContextType>(() => {
    return {
      language,
      toggleLanguage,
      setLanguage,
      apiLang: language === "kh" ? "km" : "en",
      fontClass: language === "kh" ? "font-khmer" : "font-sans",
      mounted,
    };
  }, [language, mounted]);

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