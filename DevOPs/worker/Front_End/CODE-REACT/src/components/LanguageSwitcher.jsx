import React, { useId } from "react";
import { Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { LanguageFlag } from "./language-flag-svgs";

const LANGS = [
  { code: "en", labelKey: "lang.english" },
  { code: "fr", labelKey: "lang.french" },
  { code: "ar", labelKey: "lang.arabic" },
];

/** Sélecteur EN / FR / AR ; met à jour i18n et la direction du document (RTL pour l’arabe). */
export default function LanguageSwitcher({ toggleClassName }) {
  const { t, i18n } = useTranslation();
  const uid = useId().replace(/:/g, "");
  const toggleId = `language-drop-${uid}`;
  const current = String(i18n.language || "en").split("-")[0];
  const active = LANGS.find((l) => l.code === current) || LANGS[0];

  return (
    <Dropdown as="li" className="nav-item">
      {/* Ne pas utiliser data-bs-toggle : le menu est géré par React-Bootstrap ; pas de preventDefault sur le toggle (sinon le menu ne s’ouvre pas). */}
      <Dropdown.Toggle
        as="button"
        type="button"
        bsPrefix=" "
        className={`${toggleClassName || "nav-link d-none d-xl-block"} border-0 bg-transparent text-body`}
        id={toggleId}
        style={{ cursor: "pointer" }}
      >
        <span className="d-inline-flex align-items-center me-1" style={{ verticalAlign: "middle" }}>
          <LanguageFlag code={active.code} />
        </span>{" "}
        {t(active.labelKey)} <i className="ri-arrow-down-s-line" />
      </Dropdown.Toggle>
      <Dropdown.Menu
        as="div"
        drop="end"
        className="p-0 sub-drop dropdown-menu dropdown-menu-end"
        aria-labelledby={toggleId}
      >
        <div className="m-0 -none card">
          <div className="p-0 card-body">
            {LANGS.map(({ code, labelKey }) => (
              <Dropdown.Item
                key={code}
                as="button"
                type="button"
                className="iq-sub-card"
                onClick={() => void i18n.changeLanguage(code)}
              >
                <div className="d-flex align-items-center">
                  <LanguageFlag code={code} />
                  <div className="ms-3 flex-grow-1 text-start">
                    <p className="mb-0">{t(labelKey)}</p>
                  </div>
                </div>
              </Dropdown.Item>
            ))}
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
