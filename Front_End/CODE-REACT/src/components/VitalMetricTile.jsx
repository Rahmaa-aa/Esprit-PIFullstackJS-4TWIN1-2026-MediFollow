import React from "react";
import { useTranslation } from "react-i18next";

/** English fallbacks when `t` is omitted (tests / edge cases) */
const FB = {
  noData: "No data",
  hrLow: "Low — Bradycardia",
  hrNormal: "Normal range",
  hrElevated: "Elevated — Tachycardia",
  bpLow: "Low blood pressure",
  bpNormal: "Normal",
  bpSlightElevated: "Slightly elevated",
  bpHigh: "High — monitor closely",
  o2Normal: "Normal",
  o2Low: "Low — seek advice",
  o2Critical: "Critical — seek help",
  tempDash: "—",
  tempLow: "Low",
  tempFever: "Fever",
  tempNormal: "Normal",
  weightNotMeasured: "Not measured",
  weightMeasured: "Measured",
  tileNoMeasurement: "No measurement yet.",
};

function L(t, key) {
  if (typeof t === "function") return t(`vitalStatus.${key}`);
  return FB[key] ?? key;
}

export const hrStatus = (hr, t) => {
  if (!hr) return { label: L(t, "noData"), color: "#6c757d", risk: false };
  if (hr < 60) return { label: L(t, "hrLow"), color: "#dc3545", risk: true };
  if (hr <= 100) return { label: L(t, "hrNormal"), color: "#28a745", risk: false };
  return { label: L(t, "hrElevated"), color: "#fd7e14", risk: true };
};

export const bpStatus = (sys, t) => {
  if (!sys) return { label: L(t, "noData"), color: "#6c757d", risk: false };
  if (sys < 90) return { label: L(t, "bpLow"), color: "#dc3545", risk: true };
  if (sys <= 120) return { label: L(t, "bpNormal"), color: "#28a745", risk: false };
  if (sys <= 140) return { label: L(t, "bpSlightElevated"), color: "#fd7e14", risk: true };
  return { label: L(t, "bpHigh"), color: "#dc3545", risk: true };
};

export const o2Status = (o2, t) => {
  if (!o2) return { label: L(t, "noData"), color: "#6c757d", risk: false };
  if (o2 >= 95) return { label: L(t, "o2Normal"), color: "#28a745", risk: false };
  if (o2 >= 90) return { label: L(t, "o2Low"), color: "#fd7e14", risk: true };
  return { label: L(t, "o2Critical"), color: "#dc3545", risk: true };
};

export const tempStatus = (temp, t) => {
  if (temp === undefined || temp === null || temp === "")
    return { label: L(t, "tempDash"), color: "#6c757d", risk: false };
  if (temp < 36) return { label: L(t, "tempLow"), color: "#dc3545", risk: true };
  if (temp > 38.5) return { label: L(t, "tempFever"), color: "#dc3545", risk: true };
  return { label: L(t, "tempNormal"), color: "#28a745", risk: false };
};

export const weightStatus = (w, t) => {
  if (w === undefined || w === null || w === "")
    return { label: L(t, "weightNotMeasured"), color: "#6c757d", risk: false };
  return { label: L(t, "weightMeasured"), color: "#28a745", risk: false };
};

/** Tuile constante — style dashboard médical */
const VitalMetricTile = ({ icon, accent, title, value, unit, status, noDataMsg }) => {
  const { t } = useTranslation();
  const hasValue = value !== undefined && value !== null && value !== "";
  return (
    <div
      className="h-100 position-relative overflow-hidden"
      style={{
        borderRadius: 16,
        background: "linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
        border: "1px solid rgba(148, 163, 184, 0.15)",
        borderLeft: `4px solid ${hasValue ? accent : "#cbd5e1"}`,
      }}
    >
      <div className="p-3 p-md-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 42,
              height: 42,
              background: hasValue ? `${accent}1a` : "rgba(148, 163, 184, 0.15)",
            }}
          >
            <i className={icon} style={{ color: hasValue ? accent : "#94a3b8", fontSize: "1.35rem" }} />
          </div>
        </div>
        <div className="text-uppercase text-muted fw-semibold mb-1" style={{ letterSpacing: "0.06em", fontSize: "0.65rem" }}>
          {title}
        </div>
        {hasValue ? (
          <>
            <div className="d-flex align-baseline flex-wrap gap-1 mb-2">
              <span className="fw-bold text-dark" style={{ fontSize: "1.65rem", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
                {value}
              </span>
              <span className="text-muted align-self-end pb-1" style={{ fontSize: "0.85rem" }}>
                {unit}
              </span>
            </div>
            <span
              className="d-inline-block px-2 py-1 rounded-pill fw-medium"
              style={{
                color: status.color,
                backgroundColor: `${status.color}12`,
                border: `1px solid ${status.color}40`,
                fontSize: "0.68rem",
              }}
            >
              {status.label}
            </span>
          </>
        ) : (
          <p className="text-muted small mb-0 fst-italic" style={{ fontSize: "0.78rem" }}>
            {noDataMsg || t("vitalStatus.tileNoMeasurement")}
          </p>
        )}
      </div>
    </div>
  );
};

export default VitalMetricTile;
