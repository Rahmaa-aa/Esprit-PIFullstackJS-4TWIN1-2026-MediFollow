import React from "react";
import { useTranslation } from "react-i18next";
import { AuditorA11yProvider } from "./auditor-a11y-context";

/**
 * Enveloppe pages audit (auditeur ou super admin) : provider d’état + lien d’évitement.
 * Grand texte / lecture vocale : menu Accessibilité du header.
 */
const AuditorA11yLayout = ({ variant, children }) => {
  const { t } = useTranslation();

  return (
    <AuditorA11yProvider variant={variant}>
      <a
        href="#auditor-main-content"
        className="auditor-a11y-skip visually-hidden-focusable position-fixed top-0 start-0 z-3 m-2 px-3 py-2 rounded text-white bg-primary text-decoration-none small shadow"
      >
        {t("auditorA11y.skipToMain")}
      </a>
      {children}
    </AuditorA11yProvider>
  );
};

export default AuditorA11yLayout;
export { AUDITOR_LARGE_TEXT_KEY } from "./auditor-a11y-context";
