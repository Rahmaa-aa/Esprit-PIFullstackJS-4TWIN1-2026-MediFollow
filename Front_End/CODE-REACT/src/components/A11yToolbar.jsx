import React from "react";
import { useTranslation } from "react-i18next";
import { useA11yLargeText } from "../hooks/useA11yLargeText";
import { usePageReader, isTtsSupported } from "../hooks/usePageReader";

const A11yToolbar = () => {
  const { t } = useTranslation();
  const { largeText, toggle } = useA11yLargeText();
  const { isReading, read, stop } = usePageReader();

  return (
    <div className="a11y-coordinator-toolbar d-flex align-items-center gap-2 mb-3 flex-wrap">
      <button
        type="button"
        className={`btn btn-sm a11y-btn ${largeText ? "btn-primary" : "btn-outline-primary"}`}
        onClick={toggle}
        data-eye-clickable="true"
        aria-pressed={largeText}
        title={largeText ? t("signIn.largeTextDisable", "Désactiver grand texte") : t("signIn.largeTextEnable", "Grand texte")}
      >
        <i className="ri-font-size me-1"></i>
        {largeText ? t("signIn.largeTextDisable", "Texte normal") : t("signIn.largeTextEnable", "Grand texte")}
      </button>

      {isTtsSupported && (
        <button
          type="button"
          className={`btn btn-sm a11y-btn ${isReading ? "btn-danger" : "btn-outline-secondary"}`}
          onClick={isReading ? stop : read}
          data-eye-clickable="true"
          aria-pressed={isReading}
          title={isReading ? t("signIn.stopReading", "Arrêter la lecture") : t("signIn.readPage", "Lire la page")}
        >
          <i className={`me-1 ${isReading ? "ri-volume-mute-line" : "ri-volume-up-line"}`}></i>
          {isReading ? t("signIn.stopReading", "Arrêter") : t("signIn.readPage", "Lire la page")}
        </button>
      )}

      <span className="visually-hidden" aria-live="polite">
        {isReading ? t("signIn.voiceAssistantReading", "Lecture en cours") : ""}
      </span>
    </div>
  );
};

export default A11yToolbar;
