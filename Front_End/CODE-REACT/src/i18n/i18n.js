import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en.json";
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";

const STORAGE_KEY = "mf_i18n_lang";

function applyDocumentDirection(lng) {
  const code = String(lng || "en").split("-")[0];
  const isRtl = code === "ar";
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", code === "fr" ? "fr" : code === "ar" ? "ar" : "en");
    document.body?.classList.toggle("i18n-rtl", isRtl);
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "fr", "ar"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: STORAGE_KEY,
    },
  })
  .then(() => {
    applyDocumentDirection(i18n.language);
  });

i18n.on("languageChanged", (lng) => {
  applyDocumentDirection(lng);
  try {
    localStorage.setItem(STORAGE_KEY, String(lng).split("-")[0]);
  } catch {
    /* ignore */
  }
});

export default i18n;
