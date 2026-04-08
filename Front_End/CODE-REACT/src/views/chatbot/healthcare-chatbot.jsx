import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "./healthcare-chatbot.css";
import { chatbotApi } from "../../services/api";

/* ─────────────────────── API call ─────────────────────── */
const askGemini = async (messages, lang) => {
  try {
    const response = await chatbotApi.ask(messages, lang);
    return response.text;
  } catch (err) {
    console.error("Gemini Backend Proxy Error:", err);
    throw err;
  }
};

/* ─────────────── Simple markdown-like formatter ─────────────── */
function formatBotMessage(text) {
  if (!text) return "";
  let html = text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Bullet lists
    .replace(/^\* (.+)$/gm, "<li>$1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Numbered lists
    .replace(/^\d+\.\s(.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>")
    // Paragraphs
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
  return html;
}

/* ─────────────────────── Main Component ─────────────────────── */
const HealthcareChatbot = () => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "en").split("-")[0];
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const quickTopics = [
    { icon: "ri-heart-pulse-line", key: "topicBloodPressure" },
    { icon: "ri-capsule-line", key: "topicMedication" },
    { icon: "ri-mental-health-line", key: "topicStress" },
    { icon: "ri-restaurant-line", key: "topicNutrition" },
    { icon: "ri-run-line", key: "topicExercise" },
    { icon: "ri-zzz-line", key: "topicSleep" },
  ];

  const suggestions = [
    { icon: "ri-heart-pulse-line", key: "suggBloodPressure" },
    { icon: "ri-capsule-line", key: "suggHeadache" },
    { icon: "ri-first-aid-kit-line", key: "suggFirstAid" },
    { icon: "ri-mental-health-line", key: "suggAnxiety" },
  ];

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;

    setError("");
    const userMsg = { role: "user", text: trimmed, time: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const reply = await askGemini(
        newMessages.map((m) => ({ role: m.role, text: m.text })),
        lang
      );
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: reply, time: new Date() },
      ]);
    } catch (err) {
      setError(t("chatbot.apiError") + " " + (err.message || ""));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  const fmtTime = (d) =>
    d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="hc-chatbot-page">
      {/* Header */}
      <div className="hc-header">
        <div className="hc-header-badge">
          <i className="ri-robot-2-line"></i>
          {t("chatbot.badge")}
        </div>
        <h2>{t("chatbot.title")}</h2>
        <p>{t("chatbot.subtitle")}</p>
      </div>

      {/* Chat Container */}
      <div className="hc-chat-container">
        {/* Toolbar */}
        <div className="hc-chat-toolbar">
          <div className="hc-bot-avatar">
            <i className="ri-robot-2-line"></i>
          </div>
          <div className="hc-bot-info">
            <h5>{t("chatbot.botName")}</h5>
            <div className="hc-bot-status">
              <span className="hc-status-dot"></span>
              {t("chatbot.online")}
            </div>
          </div>
          {messages.length > 0 && (
            <button className="hc-clear-btn" onClick={clearChat}>
              <i className="ri-delete-bin-6-line" style={{ marginRight: 4 }}></i>
              {t("chatbot.clear")}
            </button>
          )}
        </div>

        {/* Quick Topics */}
        <div className="hc-quick-topics">
          {quickTopics.map((topic) => (
            <button
              key={topic.key}
              className="hc-topic-chip"
              onClick={() => sendMessage(t(`chatbot.${topic.key}`))}
              disabled={isTyping}
            >
              <i className={topic.icon}></i>
              {t(`chatbot.${topic.key}`)}
            </button>
          ))}
        </div>

        {/* Messages Area */}
        <div className="hc-messages">
          {messages.length === 0 && !isTyping ? (
            <div className="hc-welcome">
              <div className="hc-welcome-icon">
                <i className="ri-stethoscope-line"></i>
              </div>
              <h4>{t("chatbot.welcomeTitle")}</h4>
              <p>
                {t("chatbot.welcomeText")}
              </p>
              <div className="hc-suggestion-grid">
                {suggestions.map((s) => (
                  <button
                    key={s.key}
                    className="hc-suggestion-card"
                    onClick={() => sendMessage(t(`chatbot.${s.key}`))}
                    disabled={isTyping}
                  >
                    <div className="hc-suggestion-icon">
                      <i className={s.icon}></i>
                    </div>
                    <span className="hc-suggestion-text">
                      {t(`chatbot.${s.key}`)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`hc-message hc-${msg.role}`}>
                  <div className="hc-msg-avatar">
                    <i className={msg.role === "bot" ? "ri-robot-2-line" : "ri-user-3-line"}></i>
                  </div>
                  <div className="hc-msg-content">
                    <div
                      className="hc-msg-bubble"
                      dangerouslySetInnerHTML={{
                        __html:
                          msg.role === "bot"
                            ? formatBotMessage(msg.text)
                            : msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                      }}
                    />
                    <span className="hc-msg-time">{fmtTime(msg.time)}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="hc-typing">
                  <div className="hc-msg-avatar" style={{ background: "linear-gradient(135deg, #38bdf8, #818cf8)", color: "#fff", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                    <i className="ri-robot-2-line"></i>
                  </div>
                  <div className="hc-typing-dots">
                    <span className="hc-typing-dot"></span>
                    <span className="hc-typing-dot"></span>
                    <span className="hc-typing-dot"></span>
                  </div>
                </div>
              )}

              {error && (
                <div className="hc-message hc-bot">
                  <div className="hc-msg-avatar">
                    <i className="ri-robot-2-line"></i>
                  </div>
                  <div className="hc-msg-content">
                    <div className="hc-msg-bubble" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
                      <span className="hc-warning-label">
                        <i className="ri-error-warning-line"></i> {t("chatbot.errorLabel")}
                      </span>
                      <br />
                      {error}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="hc-input-area">
          <div className="hc-input-row">
            <div className="hc-input-wrapper">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("chatbot.placeholder")}
                disabled={isTyping}
              />
            </div>
            <button
              className="hc-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              title={t("chatbot.send")}
            >
              <i className="ri-send-plane-2-fill"></i>
            </button>
          </div>
          <div className="hc-disclaimer">
            <i className="ri-information-line"></i>
            {t("chatbot.disclaimer")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareChatbot;
