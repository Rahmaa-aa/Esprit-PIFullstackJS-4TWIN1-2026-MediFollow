import React from "react";
import { useTranslation } from "react-i18next";
import { useA11yLargeText } from "../hooks/useA11yLargeText";

const A11yToolbar = () => {
  const { t } = useTranslation();
  const { largeText, toggle } = useA11yLargeText();

  return (
    <div className="a11y-coordinator-toolbar d-flex align-items-center gap-2 mb-3">
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
    </div>
  );
};

export default A11yToolbar;
