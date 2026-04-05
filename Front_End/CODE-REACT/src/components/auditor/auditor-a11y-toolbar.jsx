import React from "react";
import { useTranslation } from "react-i18next";
import { useAuditorA11y } from "./auditor-a11y-context";

/**
 * Barre « Accessibilité rapide » — à placer en premier dans .auditor-dash ou .auditor-logs
 * pour hériter de la même largeur que les cartes.
 */
const AuditorA11yToolbar = () => {
  const { t } = useTranslation();
  const {
    largeTextEnabled,
    setLargeTextEnabled,
    isReadingPage,
    isTtsSupported,
    readPageContent,
    stopPageReading,
  } = useAuditorA11y();

  return (
    <div className="auditor-a11y-toolbar-block mb-3">
      <div className="a11y-toolbar auditor-a11y-toolbar">
        <div className="auditor-a11y-toolbar__inner">
          <div className="a11y-toolbar-title">{t("signIn.a11yToolbarTitle")}</div>
          <div className="a11y-toolbar-actions d-flex gap-2 flex-wrap">
            <button
              type="button"
              className={`btn btn-sm a11y-btn ${largeTextEnabled ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setLargeTextEnabled((v) => !v)}
            >
              <i className="ri-font-size me-1" aria-hidden />
              {largeTextEnabled ? t("signIn.largeTextDisable") : t("signIn.largeTextEnable")}
            </button>
            {isTtsSupported && (
              <button
                type="button"
                className={`btn btn-sm a11y-btn ${isReadingPage ? "btn-danger" : "btn-outline-secondary"}`}
                onClick={isReadingPage ? stopPageReading : readPageContent}
              >
                <i
                  className={`me-1 ${isReadingPage ? "ri-volume-mute-line" : "ri-volume-up-line"}`}
                  aria-hidden
                />
                {isReadingPage ? t("signIn.stopReading") : t("signIn.readPage")}
              </button>
            )}
          </div>
        </div>
      </div>
      <span className="visually-hidden" aria-live="polite">
        {isReadingPage ? t("signIn.voiceAssistantReading") : t("signIn.voiceAssistantReady")}
      </span>
    </div>
  );
};

export default AuditorA11yToolbar;
