import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { medicationApi } from "../services/api";
import {
  getMissedMedicationSlotsToday,
  formatSlotClock,
  localDateStringYMD,
} from "../utils/medicationReminders";

function normalizePatientId(raw) {
  if (raw == null) return "";
  if (typeof raw === "object" && raw !== null && "$oid" in raw) return String(raw.$oid);
  return String(raw);
}

function formatLate(minutesPast) {
  if (minutesPast < 60) return `En retard de ${minutesPast} min`;
  const h = Math.floor(minutesPast / 60);
  const m = minutesPast % 60;
  return m > 0 ? `En retard de ${h} h ${m} min` : `En retard de ${h} h`;
}

const DASHBOARD_MEDS_HASH = "/dashboard-pages/patient-dashboard#patient-medications";

/**
 * Notifications patient : rappels de prise lorsque l'heure du créneau est passée et la case n'est pas cochée.
 * Style aligné sur le menu « All Notifications » (en-tête teal, badge, liste).
 */
export default function PatientMedicationNotificationsBell({
  className = "",
  toggleClassName = "nav-link d-none d-xl-block position-relative",
}) {
  const [medications, setMedications] = useState([]);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(false);

  const [patientId, setPatientId] = useState("");

  const readPatientId = useCallback(() => {
    try {
      const s = localStorage.getItem("patientUser");
      if (!s) {
        setPatientId("");
        return;
      }
      const u = JSON.parse(s);
      setPatientId(normalizePatientId(u?.id ?? u?._id));
    } catch {
      setPatientId("");
    }
  }, []);

  useEffect(() => {
    readPatientId();
    window.addEventListener("patientUserUpdated", readPatientId);
    return () => window.removeEventListener("patientUserUpdated", readPatientId);
  }, [readPatientId]);

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const meds = await medicationApi.getByPatient(patientId);
      setMedications(Array.isArray(meds) ? meds : []);
    } catch {
      setMedications([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("patient-medications-updated", onRefresh);
    const t = setInterval(load, 60_000);
    const tick = setInterval(() => setNow(new Date()), 30_000);
    const onFocus = () => {
      load();
      setNow(new Date());
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("patient-medications-updated", onRefresh);
      window.removeEventListener("focus", onFocus);
      clearInterval(t);
      clearInterval(tick);
    };
  }, [load]);

  const dateStr = localDateStringYMD();
  const missed = useMemo(
    () => getMissedMedicationSlotsToday(medications, now, dateStr, 1),
    [medications, now, dateStr]
  );
  const count = missed.length;

  return (
    <Dropdown as="li" className={`nav-item ${className}`}>
      <Dropdown.Toggle as="a" bsPrefix=" " to="#" className={`${toggleClassName} position-relative`}>
        <i className="ri-notification-4-line" />
        {count > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "0.65rem", padding: "0.2em 0.45em" }}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu drop="start" as="div" className="p-0 sub-drop dropdown-menu-end" style={{ minWidth: 320, maxWidth: 400 }}>
        <div className="m-0 card border-0 shadow-sm overflow-hidden">
          <div className="py-3 px-3 d-flex justify-content-between align-items-center bg-primary mb-0 rounded-top-3">
            <h5 className="mb-0 text-white fw-bold d-flex align-items-center gap-2 flex-wrap">
              Toutes les notifications
              <span className="badge bg-light text-dark rounded-2 px-2 py-1 small">{count}</span>
            </h5>
          </div>
          <div className="p-0 card-body" style={{ maxHeight: 380, overflowY: "auto" }}>
            {!patientId && (
              <div className="text-muted small text-center py-4 px-3">Session patient requise.</div>
            )}
            {patientId && loading && medications.length === 0 && (
              <div className="text-center text-muted small py-4">Chargement…</div>
            )}
            {patientId && !loading && count === 0 && (
              <div className="text-muted small text-center py-4 px-3">
                Aucun rappel de médicament pour l’instant. Les prises prévues apparaîtront ici si l’heure est passée
                sans validation.
              </div>
            )}
            {missed.map((row) => {
              const mid = row.med?._id || row.med?.id;
              const key = `${mid}-${row.slotIndex}`;
              const title = row.med?.name || "Médicament";
              const dosage = row.med?.dosage ? String(row.med.dosage) : "";
              const slotLabel = row.slot?.label ? `${row.slot.label} · ` : "";
              const subtitle = `${slotLabel}${dosage ? `${dosage} · ` : ""}Prévu ${formatSlotClock(row.slot)}`;
              return (
                <Link
                  key={key}
                  to={DASHBOARD_MEDS_HASH}
                  className="iq-sub-card d-block text-decoration-none border-bottom"
                >
                  <div className="d-flex align-items-start px-3 py-3">
                    <div
                      className="flex-shrink-0 rounded-3 bg-light d-flex align-items-center justify-content-center text-primary border"
                      style={{ width: 50, height: 50 }}
                    >
                      <i className="ri-capsule-line fs-4" aria-hidden />
                    </div>
                    <div className="ms-3 flex-grow-1 text-start min-w-0">
                      <h6 className="mb-0 text-dark fw-semibold text-truncate">Rappel — {title}</h6>
                      <div className="d-flex justify-content-between gap-2 align-items-start mt-1">
                        <p className="mb-0 small text-muted" style={{ lineHeight: 1.35 }}>
                          {subtitle}
                        </p>
                        <small className="flex-shrink-0 text-muted" style={{ fontSize: "0.7rem" }}>
                          {formatLate(row.minutesPast)}
                        </small>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
