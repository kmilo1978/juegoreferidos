import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "es" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  toggleLang: () => void;
  t: (es: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "es",
  setLang: () => {},
  toggleLang: () => {},
  t: (es: string) => es,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("es");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("juego_lang") as Language;
      if (saved === "es" || saved === "en") {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    }
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("juego_lang", l);
      document.documentElement.lang = l;
    }
  };

  const toggleLang = () => {
    setLang(lang === "es" ? "en" : "es");
  };

  const t = (es: string, en: string) => {
    return lang === "en" ? en : es;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  return useContext(LanguageContext);
}
