import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HealthcareChatbot from "../views/chatbot/healthcare-chatbot";
import "./FloatingChatbotWidget.css";

export default function FloatingChatbotWidget() {
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") setOpen(false);
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  if (location.pathname === "/health-chatbot") {
    return null;
  }

  return (
    <>
      <div
        id="floating-chatbot-panel"
        className={`floating-chatbot-panel ${open ? "is-open" : ""}`}
        role="dialog"
        aria-label={t("sidebar.healthChatbot")}
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="floating-chatbot-panel__header">
          <span className="floating-chatbot-panel__title">{t("chatbot.title")}</span>
          <button
            type="button"
            className="floating-chatbot-panel__close"
            onClick={() => setOpen(false)}
            aria-label={t("signIn.closeAria")}
          >
            <i className="ri-close-line fs-5" aria-hidden />
          </button>
        </div>
        <div className="floating-chatbot-panel__body">
          <HealthcareChatbot variant="embed" />
        </div>
      </div>

      <button
        type="button"
        className={`floating-chatbot-fab ${open ? "is-active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="floating-chatbot-panel"
        title={t("sidebar.healthChatbot")}
      >
        <i className="ri-robot-2-fill floating-chatbot-fab__icon" aria-hidden />
        <span className="visually-hidden">{t("sidebar.healthChatbot")}</span>
      </button>
    </>
  );
}
