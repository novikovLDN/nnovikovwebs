"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "ru" | "en";

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: <T extends ReactNode>(ru: T, en: T) => T;
}

const I18nContext = createContext<I18nContextType>({
  lang: "ru",
  setLang: () => {},
  t: (ru) => ru,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "ru") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
    document.documentElement.lang = l;
  };

  const t = <T extends ReactNode>(ru: T, en: T): T => (lang === "ru" ? ru : en);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

/* ═══════════════════════════════════════════════════
   LANGUAGE SWITCHER COMPONENT
   ═══════════════════════════════════════════════════ */

export function LangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => setLang("ru")}
        className="text-[11px] sm:text-[12px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md transition-all duration-300"
        style={{
          background: lang === "ru" ? "rgba(0,255,106,0.12)" : "transparent",
          color: lang === "ru" ? "var(--accent)" : "var(--text-muted)",
          border: lang === "ru" ? "1px solid rgba(0,255,106,0.2)" : "1px solid transparent",
        }}
      >
        RU
      </button>
      <button
        onClick={() => setLang("en")}
        className="text-[11px] sm:text-[12px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md transition-all duration-300"
        style={{
          background: lang === "en" ? "rgba(0,255,106,0.12)" : "transparent",
          color: lang === "en" ? "var(--accent)" : "var(--text-muted)",
          border: lang === "en" ? "1px solid rgba(0,255,106,0.2)" : "1px solid transparent",
        }}
      >
        EN
      </button>
    </div>
  );
}
