import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./auditor-a11y.scss";

/** Même clé que la page de connexion pour un réglage cohérent dans toute l’app. */
export const AUDITOR_LARGE_TEXT_KEY = "medifollow_large_text_signin";

const SpeechSynthesis = typeof window !== "undefined" ? window.speechSynthesis : null;
const isTtsSupported = !!SpeechSynthesis;

const AuditorA11yContext = createContext(null);

export function useAuditorA11y() {
  const ctx = useContext(AuditorA11yContext);
  if (!ctx) {
    throw new Error("useAuditorA11y must be used within AuditorA11yProvider");
  }
  return ctx;
}

/**
 * État accessibilité (texte agrandi, TTS) partagé entre la barre d’outils et le contenu.
 */
export function AuditorA11yProvider({ variant, children }) {
  const { t, i18n } = useTranslation();
  const [largeTextEnabled, setLargeTextEnabled] = useState(
    () => typeof localStorage !== "undefined" && localStorage.getItem(AUDITOR_LARGE_TEXT_KEY) === "1"
  );
  const [isReadingPage, setIsReadingPage] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(AUDITOR_LARGE_TEXT_KEY, largeTextEnabled ? "1" : "0");
  }, [largeTextEnabled]);

  const stopPageReading = useCallback(() => {
    if (SpeechSynthesis) SpeechSynthesis.cancel();
    utteranceRef.current = null;
    setIsReadingPage(false);
  }, []);

  const readPageContent = useCallback(() => {
    if (!isTtsSupported) return;
    stopPageReading();
    const prefix = variant === "logs" ? "auditorA11y.readLogsPart" : "auditorA11y.readDashboardPart";
    const parts = [1, 2, 3, 4, 5, 6, 7].map((n) => t(`${prefix}${n}`));
    const utterance = new SpeechSynthesisUtterance(parts.join(" "));
    utterance.lang = i18n.language?.startsWith("fr")
      ? "fr-FR"
      : i18n.language?.startsWith("ar")
        ? "ar-SA"
        : "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => {
      utteranceRef.current = null;
      setIsReadingPage(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setIsReadingPage(false);
    };
    utteranceRef.current = utterance;
    setIsReadingPage(true);
    SpeechSynthesis.speak(utterance);
  }, [isTtsSupported, stopPageReading, t, i18n.language, variant]);

  const value = {
    largeTextEnabled,
    setLargeTextEnabled,
    isReadingPage,
    isTtsSupported,
    readPageContent,
    stopPageReading,
  };

  return (
    <AuditorA11yContext.Provider value={value}>
      <div className={`auditor-a11y-root ${largeTextEnabled ? "a11y-large-text" : ""}`}>
        {children}
      </div>
    </AuditorA11yContext.Provider>
  );
}
