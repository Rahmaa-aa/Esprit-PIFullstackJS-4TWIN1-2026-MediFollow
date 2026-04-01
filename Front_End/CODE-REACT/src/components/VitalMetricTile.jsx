import React from "react";

export const hrStatus = (hr) => {
  if (!hr) return { label: "No data", color: "#6c757d" };
  if (hr < 60) return { label: "Low — Bradycardia", color: "#dc3545" };
  if (hr <= 100) return { label: "Normal Range", color: "#28a745" };
  return { label: "Elevated — Tachycardia", color: "#fd7e14" };
};

export const bpStatus = (sys) => {
  if (!sys) return { label: "No data", color: "#6c757d" };
  if (sys < 90) return { label: "Low Blood Pressure", color: "#dc3545" };
  if (sys <= 120) return { label: "Normal", color: "#28a745" };
  if (sys <= 140) return { label: "Slightly Elevated", color: "#fd7e14" };
  return { label: "High — Monitor Closely", color: "#dc3545" };
};

export const o2Status = (o2) => {
  if (!o2) return { label: "No data", color: "#6c757d" };
  if (o2 >= 95) return { label: "Normal", color: "#28a745" };
  if (o2 >= 90) return { label: "Low — Seek Advice", color: "#fd7e14" };
  return { label: "Critical — Seek Help", color: "#dc3545" };
};

export const tempStatus = (temp) => {
  if (temp === undefined || temp === null || temp === "") return { label: "—", color: "#6c757d" };
  if (temp < 36) return { label: "Bas", color: "#dc3545" };
  if (temp > 38.5) return { label: "Fièvre", color: "#dc3545" };
  return { label: "Normale", color: "#28a745" };
};

export const weightStatus = (w) => {
  if (w === undefined || w === null || w === "") return { label: "Non mesuré", color: "#6c757d" };
  return { label: "Mesuré", color: "#28a745" };
};

/** Tuile constante — style dashboard médical */
const VitalMetricTile = ({ icon, accent, title, value, unit, status, noDataMsg }) => {
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
            {noDataMsg || "Aucune mesure pour le moment."}
          </p>
        )}
      </div>
    </div>
  );
};

export default VitalMetricTile;
