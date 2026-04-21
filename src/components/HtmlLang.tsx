"use client";
import { useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";

const LANG_MAP = { en: "en", fr: "fr", rw: "rw" } as const;

export default function HtmlLang() {
  const { lang } = useLang();
  useEffect(() => {
    document.documentElement.lang = LANG_MAP[lang] ?? "en";
  }, [lang]);
  return null;
}
