"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";
import { LANG_COOKIE, translate, type Lang } from "@/lib/i18n";

type I18nValue = { lang: Lang; t: (key: string) => string; setLang: (lang: Lang) => void };
const I18nContext = createContext<I18nValue>({ lang: "en", t: (k) => translate("en", k), setLang: () => undefined });

/** Shares the chosen language with every screen. The choice is kept in a cookie for a year. */
export function I18nProvider({ lang: initial, children }: { lang: Lang; children: React.ReactNode }) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(initial);

  const setLang = useCallback(
    (next: Lang) => {
      document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      setLangState(next);
      router.refresh(); // server-drawn parts (like the header) pick up the new language
    },
    [router]
  );

  const t = useCallback((key: string) => translate(lang, key), [lang]);
  return <I18nContext.Provider value={{ lang, t, setLang }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
