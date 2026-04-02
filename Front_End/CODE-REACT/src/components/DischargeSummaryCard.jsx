import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

/** patient = dossier admin ; doctorConsigne = dernière consigne « Envoyer et clôturer » (alerte constantes). */
const DischargeSummaryCard = ({ patient, doctorConsigne }) => {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const dateLocale = useMemo(() => {
    const l = (i18n.language || "en").split("-")[0];
    if (l === "ar") return "ar";
    if (l === "fr") return "fr-FR";
    return "en-GB";
  }, [i18n.language]);

  const admissionDate = patient?.admissionDate;
  const dischargeDate = patient?.dischargeDate;
  const diagnosis = patient?.diagnosis;
  const notes = patient?.dischargeNotes;
  const consigneText =
    doctorConsigne && typeof doctorConsigne.note === "string" ? doctorConsigne.note.trim() : "";

  const daysSinceDischarge = dischargeDate
    ? Math.floor((new Date() - new Date(dischargeDate)) / (1000 * 60 * 60 * 24))
    : null;

  const hasAnything =
    !!diagnosis ||
    !!dischargeDate ||
    !!(notes && String(notes).trim()) ||
    !!consigneText;

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-primary fw-bold mb-0"><i className="ri-file-medical-line me-2"></i>Consignes de sortie</h6>
          {daysSinceDischarge !== null && (
            <span className="badge bg-primary-subtle text-primary" style={{ fontSize: "0.7rem" }}>
              Day {daysSinceDischarge + 1} of recovery
            </span>
          )}
        </div>

        {!hasAnything ? (
          <p className="text-muted small text-center mb-0 py-2">{t("patientCards.discharge.empty")}</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {/* Consigne du médecin (clôture alerte constantes) */}
            {consigneText && (
              <div className="p-2 rounded-3" style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                <div className="text-muted mb-1" style={{ fontSize: "0.72rem" }}>
                  {t("patientCards.discharge.doctorInstruction")}
                  {doctorConsigne?.resolvedAt ? (
                    <span className="ms-1">
                      ·{" "}
                      {new Date(doctorConsigne.resolvedAt).toLocaleString(dateLocale, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  ) : null}
                </div>
                <div className="small" style={{ whiteSpace: "pre-wrap" }}>
                  {consigneText}
                </div>
              </div>
            )}
            {/* Timeline row */}
            {(admissionDate || dischargeDate) && (
              <div className="d-flex gap-2 align-items-center">
                {admissionDate && (
                  <div className="flex-fill text-center p-2 rounded-3" style={{ backgroundColor: "#fff3cd", border: "1px solid #fde68a" }}>
                    <div className="small text-muted">{t("patientCards.discharge.admitted")}</div>
                    <div className="fw-bold small">{new Date(admissionDate).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                )}
                {admissionDate && dischargeDate && (
                  <i className="ri-arrow-right-line text-muted"></i>
                )}
                {dischargeDate && (
                  <div className="flex-fill text-center p-2 rounded-3" style={{ backgroundColor: "#d1fae5", border: "1px solid #bbf7d0" }}>
                    <div className="small text-muted">Discharged</div>
                    <div className="fw-bold small">{new Date(dischargeDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                )}
              </div>
            )}

            {/* Diagnosis */}
            {diagnosis && (
              <div className="p-2 rounded-3" style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <div className="text-muted" style={{ fontSize: "0.72rem" }}>{t("patientCards.discharge.diagnosis")}</div>
                <div className="fw-bold small">{diagnosis}</div>
              </div>
            )}

            {/* Discharge notes — collapsible */}
            {notes && (
              <div className="p-2 rounded-3" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
                <div className="d-flex justify-content-between align-items-center" onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
                  <span className="text-muted" style={{ fontSize: "0.72rem" }}>{t("patientCards.discharge.dischargeInstructions")}</span>
                  <i className={`ri-arrow-${expanded ? "up" : "down"}-s-line text-muted`}></i>
                </div>
                {expanded && (
                  <div className="mt-2 small" style={{ whiteSpace: "pre-wrap" }}>{notes}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DischargeSummaryCard;
