"use client";

import { useEffect, useRef, useState } from "react";
import { LANGS } from "@/lib/i18n";
import { load, save } from "@/lib/browser-storage";
import { useI18n } from "./I18n";

type Size = "md" | "lg" | "xl";
type Theme = "light" | "dark";
const SIZES: { key: Size; label: string }[] = [
  { key: "md", label: "A" },
  { key: "lg", label: "A+" },
  { key: "xl", label: "A++" }
];

/** One small menu for language, text size and light/dark theme. Choices are remembered on the device. */
export default function DisplayMenu() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<Size>("md");
  const [theme, setTheme] = useState<Theme>("light");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSize(load<Size>("sm-size", "md"));
    setTheme(load<Theme>("sm-theme", "light"));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  function chooseSize(s: Size) {
    setSize(s);
    save("sm-size", s);
    document.documentElement.dataset.size = s;
  }

  function chooseTheme(th: Theme) {
    setTheme(th);
    save("sm-theme", th);
    document.documentElement.dataset.theme = th;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", th === "dark" ? "#0F2529" : "#123F46");
  }

  return (
    <div className="display-menu" ref={ref}>
      <button type="button" className="icon-button display-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={t("a11y.menu")}>
        <span aria-hidden="true">Aa</span>
      </button>
      <div className={open ? "display-pop open" : "display-pop"} role="dialog" aria-label={t("a11y.menu")}>
        <p className="display-label">{t("a11y.language")}</p>
        <div className="display-row">
          {LANGS.map((l) => (
            <button type="button" key={l.code} className={lang === l.code ? "active" : ""} aria-pressed={lang === l.code} onClick={() => setLang(l.code)} lang={l.code}>
              {l.label}
            </button>
          ))}
        </div>
        <p className="display-label">{t("a11y.textSize")}</p>
        <div className="display-row">
          {SIZES.map((s) => (
            <button type="button" key={s.key} className={size === s.key ? "active" : ""} aria-pressed={size === s.key} onClick={() => chooseSize(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
        <p className="display-label">{t("a11y.theme")}</p>
        <div className="display-row">
          <button type="button" className={theme === "light" ? "active" : ""} aria-pressed={theme === "light"} onClick={() => chooseTheme("light")}>☀ {t("a11y.light")}</button>
          <button type="button" className={theme === "dark" ? "active" : ""} aria-pressed={theme === "dark"} onClick={() => chooseTheme("dark")}>☾ {t("a11y.dark")}</button>
        </div>
      </div>
    </div>
  );
}
