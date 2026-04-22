import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from "react-bootstrap";
import { healthLogApi, medicationApi, appointmentApi, questionnaireApi } from "../../services/api";
import BrainMriAnalysisPage from "../../components/brain-mri-analysis-page";
import { normalizeMongoId } from "../../utils/mongoId";
import VitalMetricTile, { hrStatus, bpStatus, o2Status, tempStatus, weightStatus } from "../../components/VitalMetricTile";
import {
  localDateStringYMD,
  isMedicationPastEndDate,
  getIntakeHistoryByDate,
  formatSlotTimeLocal,
} from "../../utils/medicationReminders";
import { broadcastDoctorHealthLogResolved, subscribeDoctorHealthLogResolved } from "../../utils/healthLogResolveBroadcast";
import { translateSymptom } from "../../utils/symptomLabels";
import { formatMedicationFrequencyDisplay } from "../../utils/medicationFrequencyLabel";
import { createAmbulanceSirenPlayer } from "../../utils/ambulanceSiren";
import "./doctor-patient-dossier.css";

const VITALS_TZ = "Africa/Tunis";

function formatDateTime(iso, localeTag) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const loc = localeTag === "ar" ? "ar-TN" : localeTag === "fr" ? "fr-FR" : "en-US";
    return new Intl.DateTimeFormat(loc, {
      timeZone: VITALS_TZ,
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "—";
  }
}

function formatDisplayDateYmd(ymd, localeTag) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(String(ymd))) return ymd;
  try {
    const loc = localeTag === "ar" ? "ar-TN" : localeTag === "fr" ? "fr-FR" : "en-US";
    return new Date(`${String(ymd).slice(0, 10)}T12:00:00`).toLocaleDateString(loc, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return ymd;
  }
}

function formatLogVitalsShort(log, t) {
  const v = log?.vitals || {};
  const parts = [];
  if (v.heartRate != null) parts.push(t("doctorPatientDossier.vitalsPartHR", { hr: v.heartRate }));
  if (v.bloodPressureSystolic != null) {
    parts.push(
      t("doctorPatientDossier.vitalsPartBP", {
        sys: v.bloodPressureSystolic,
        dia: v.bloodPressureDiastolic ?? "—",
      })
    );
  }
  if (v.oxygenSaturation != null) parts.push(t("doctorPatientDossier.vitalsPartO2", { o2: v.oxygenSaturation }));
  if (v.temperature != null && v.temperature !== "") parts.push(t("doctorPatientDossier.vitalsPartTemp", { temp: v.temperature }));
  if (v.weight != null && v.weight !== "") parts.push(t("doctorPatientDossier.vitalsPartWeight", { w: v.weight }));
  return parts.length ? parts.join(" · ") : "—";
}

function isQuestionnaireCompleted(status) {
  return String(status || "").toLowerCase() === "completed";
}

function isRiskStatus(status) {
  return !!(status && status.risk === true);
}

function buildDoctorAlerts(latestLog, v, t) {
  const out = [];
  if (!latestLog) return out;

  const score = typeof latestLog.riskScore === "number" ? latestLog.riskScore : 0;
  if (latestLog.flagged) {
    out.push({
      severity: "danger",
      text: t("doctorPatientDossier.alertGlobalRisk", { score }),
    });
  } else if (score >= 25) {
    out.push({
      severity: "warning",
      text: t("doctorPatientDossier.alertModerateRisk", { score }),
    });
  }

  if (typeof latestLog.painLevel === "number" && latestLog.painLevel >= 7) {
    out.push({
      severity: "danger",
      text: t("doctorPatientDossier.alertPainHigh", { level: latestLog.painLevel }),
    });
  } else if (typeof latestLog.painLevel === "number" && latestLog.painLevel >= 5) {
    out.push({
      severity: "warning",
      text: t("doctorPatientDossier.alertPainModerate", { level: latestLog.painLevel }),
    });
  }

  if (latestLog.mood === "poor") {
    out.push({ severity: "warning", text: t("doctorPatientDossier.alertMoodPoor") });
  } else if (latestLog.mood === "fair") {
    out.push({ severity: "warning", text: t("doctorPatientDossier.alertMoodFair") });
  }

  if (v) {
    const hr = hrStatus(v.heartRate, t);
    if (v.heartRate != null && isRiskStatus(hr)) {
      out.push({
        severity: hr.color === "#dc3545" ? "danger" : "warning",
        text: t("doctorPatientDossier.alertVitalHR", { label: hr.label }),
      });
    }
    const bp = bpStatus(v.bloodPressureSystolic, t);
    if (v.bloodPressureSystolic != null && isRiskStatus(bp)) {
      out.push({
        severity: bp.color === "#dc3545" ? "danger" : "warning",
        text: t("doctorPatientDossier.alertVitalBP", { label: bp.label }),
      });
    }
    const o2 = o2Status(v.oxygenSaturation, t);
    if (v.oxygenSaturation != null && isRiskStatus(o2)) {
      out.push({
        severity: o2.color === "#dc3545" ? "danger" : "warning",
        text: t("doctorPatientDossier.alertVitalO2", { label: o2.label }),
      });
    }
    const tp = tempStatus(v.temperature, t);
    if (v.temperature != null && v.temperature !== "" && isRiskStatus(tp)) {
      out.push({
        severity: tp.color === "#dc3545" ? "danger" : "warning",
        text: t("doctorPatientDossier.alertVitalTemp", { label: tp.label }),
      });
    }
  }

  return out;
}

function formatMoodLabel(mood, t) {
  const m = String(mood || "").toLowerCase();
  if (m === "good") return t("patientDashboard.moodGood");
  if (m === "fair") return t("patientDashboard.moodFair");
  if (m === "poor") return t("patientDashboard.moodPoor");
  return mood ? String(mood) : "—";
}

function formatQuestionnaireStatus(status, t) {
  const k = String(status || "").toLowerCase();
  if (k === "pending") return t("doctorPatientDossier.qsStatusPending");
  if (k === "completed") return t("doctorPatientDossier.qsStatusCompleted");
  if (k === "cancelled") return t("doctorPatientDossier.qsStatusCancelled");
  return status || "—";
}

function formatAppointmentStatus(status, t) {
  const k = String(status || "").toLowerCase();
  if (k === "confirmed") return t("doctorPatientDossier.apptStatusConfirmed");
  if (k === "pending") return t("doctorPatientDossier.apptStatusPending");
  if (k === "cancelled") return t("doctorPatientDossier.apptStatusCancelled");
  return status || "—";
}

/** Tuiles constantes pour une ligne d’alerte / escalade (même lecture que le relevé concerné). */
function VitalSnapshotForAlertRow({ vitals, t }) {
  const v = vitals && typeof vitals === "object" ? vitals : {};
  const hr = hrStatus(v.heartRate, t);
  const bp = bpStatus(v.bloodPressureSystolic, t);
  const o2 = o2Status(v.oxygenSaturation, t);
  const tp = tempStatus(v.temperature, t);
  const wt = weightStatus(v.weight, t);
  const hasAny = ["heartRate", "bloodPressureSystolic", "oxygenSaturation", "temperature", "weight"].some(
    (k) => v[k] != null && v[k] !== ""
  );
  if (!hasAny) {
    return (
      <div className="dossier-vital-closure-row__vitals dossier-vital-closure-row__vitals--empty" role="status">
        <i className="ri-pulse-line" aria-hidden />
        <span>{t("doctorPatientDossier.alertRowNoVitals")}</span>
      </div>
    );
  }
  return (
    <div className="dossier-vital-closure-row__vitals">
      <div className="dossier-vital-closure-row__vitals-head">
        <span className="dossier-vital-closure-row__vitals-title">{t("doctorPatientDossier.alertRowVitalsTitle")}</span>
      </div>
      <Row className="g-3 mb-0 dossier-vital-closure-row__vitals-grid">
        <Col sm={6} xl={4}>
          <VitalMetricTile
            icon="ri-heart-pulse-fill"
            accent="#dc3545"
            title={t("doctorPatientDossier.tileHeartRate")}
            value={v.heartRate}
            unit="bpm"
            status={hr}
            noDataMsg={t("doctorPatientDossier.notRecorded")}
          />
        </Col>
        <Col sm={6} xl={4}>
          <VitalMetricTile
            icon="ri-drop-fill"
            accent="#089bab"
            title={t("doctorPatientDossier.tileBloodPressure")}
            value={
              v.bloodPressureSystolic ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic ?? "—"}` : null
            }
            unit="mmHg"
            status={bp}
            noDataMsg={t("doctorPatientDossier.notRecorded")}
          />
        </Col>
        <Col sm={6} xl={4}>
          <VitalMetricTile
            icon="ri-lungs-fill"
            accent="#6f42c1"
            title={t("doctorPatientDossier.tileO2")}
            value={v.oxygenSaturation}
            unit="%"
            status={o2}
            noDataMsg={t("doctorPatientDossier.notRecorded")}
          />
        </Col>
        <Col sm={6} xl={4}>
          <VitalMetricTile
            icon="ri-temp-hot-fill"
            accent="#fd7e14"
            title={t("doctorPatientDossier.tileTemperature")}
            value={v.temperature}
            unit="°C"
            status={tp}
            noDataMsg={t("doctorPatientDossier.notRecorded")}
          />
        </Col>
        <Col sm={6} xl={4}>
          <VitalMetricTile
            icon="ri-scales-3-line"
            accent="#198754"
            title={t("doctorPatientDossier.tileWeight")}
            value={v.weight}
            unit="kg"
            status={wt}
            noDataMsg={t("doctorPatientDossier.notRecorded")}
          />
        </Col>
      </Row>
    </div>
  );
}

/** Normalise lat/lng (API JSON, anciens enregistrements, chaînes). */
function normalizeEmergencyLocation(raw) {
  if (!raw || typeof raw !== "object") return null;
  const lat = Number(raw.lat ?? raw.latitude);
  const lng = Number(raw.lng ?? raw.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/** Bandeau unique : SOS + alertes cliniques, clignotement si urgence (danger / SOS / relevé flaggé). */
function VitalsEmergencyBundle({ latestLog, doctorAlerts, t }) {
  const loc = normalizeEmergencyLocation(latestLog?.location);
  const hasSos = loc != null;
  const alerts = Array.isArray(doctorAlerts) ? doctorAlerts : [];
  const bundleVisible = hasSos || alerts.length > 0;
  const hasDanger = alerts.some((a) => a.severity === "danger");
  const isUrgent = hasSos || hasDanger || !!latestLog?.flagged;
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const sirenPlayerRef = useRef(null);
  const sirenSuppressedRef = useRef(false);

  useEffect(() => {
    if (hasSos) setSosModalOpen(true);
    else setSosModalOpen(false);
  }, [hasSos, loc?.lat, loc?.lng, latestLog?.location]);

  /** Nouveau SOS : autoriser à nouveau la sirène */
  useEffect(() => {
    if (!hasSos) sirenSuppressedRef.current = false;
  }, [hasSos]);

  useEffect(() => {
    if (!bundleVisible) return undefined;
    if (sirenSuppressedRef.current) return undefined;
    const player = createAmbulanceSirenPlayer({
      volume: isUrgent ? 0.22 : 0.12,
      wailHz: isUrgent ? 2.5 : 1.7,
    });
    sirenPlayerRef.current = player;
    player.start();
    return () => {
      player.stop();
      sirenPlayerRef.current = null;
    };
  }, [bundleVisible, isUrgent]);

  const stopSirenOnMapClick = useCallback(() => {
    sirenPlayerRef.current?.stop();
    sirenPlayerRef.current = null;
    if (hasSos) sirenSuppressedRef.current = true;
  }, [hasSos]);

  if (!bundleVisible) return null;

  const bundleClass = [
    "dossier-vitals-emergency-bundle",
    "mb-3",
    isUrgent ? "dossier-vitals-emergency-bundle--urgent" : "dossier-vitals-emergency-bundle--caution",
  ].join(" ");

  const mapUrl = hasSos ? `https://maps.google.com/?q=${encodeURIComponent(`${loc.lat},${loc.lng}`)}` : "";

  return (
    <>
      {hasSos && (
        <Modal
          show={sosModalOpen}
          onHide={() => setSosModalOpen(false)}
          fullscreen
          backdrop="static"
          className="dossier-sos-fs-modal"
          dialogClassName="dossier-sos-fs-modal__dialog m-0"
          contentClassName="dossier-sos-fs-modal__content border-0 rounded-0 shadow-none"
          backdropClassName="dossier-sos-fs-modal__backdrop"
          enforceFocus
          aria-labelledby="dossier-sos-modal-title"
        >
          <Modal.Header closeButton closeVariant="white" className="dossier-sos-fs-modal__header border-0">
            <Modal.Title id="dossier-sos-modal-title" className="d-flex align-items-center gap-2 text-white mb-0">
              <span className="dossier-sos-fs-modal__title-icon" aria-hidden>
                <i className="ri-alarm-warning-fill" />
              </span>
              {t("doctorPatientDossier.sosModalTitle")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="dossier-sos-fs-modal__body d-flex flex-column align-items-center justify-content-center text-center px-4 py-5">
            <div className="dossier-sos-fs-modal__pin-ring mb-4" aria-hidden>
              <div className="dossier-sos-fs-modal__pin-inner">
                <i className="ri-map-pin-fill" />
              </div>
            </div>
            <p className="dossier-sos-fs-modal__subtitle fw-bold mb-2">{t("doctorPatientDossier.sosLocationLabel")}</p>
            <p className="dossier-sos-fs-modal__lead text-muted mb-4 mx-auto" style={{ maxWidth: "28rem" }}>
              {t("doctorPatientDossier.sosModalLead")}
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-danger btn-lg px-5 py-3 rounded-3 shadow-lg dossier-sos-fs-modal__map-btn text-decoration-none"
              onClick={stopSirenOnMapClick}
            >
              <i className="ri-external-link-line me-2" aria-hidden />
              {t("doctorPatientDossier.viewOnMap")}
            </a>
            <Button variant="outline-dark" className="mt-4 rounded-pill px-4" onClick={() => setSosModalOpen(false)}>
              {t("doctorPatientDossier.sosModalDismiss")}
            </Button>
          </Modal.Body>
        </Modal>
      )}

      <div className={bundleClass} role="alert" aria-live="assertive">
      <div className="dossier-vitals-emergency-bundle__head">
        <span className="dossier-vitals-emergency-bundle__pulse-icon" aria-hidden>
          <i className="ri-alarm-warning-fill" />
        </span>
        <strong className="dossier-vitals-emergency-bundle__title">{t("doctorPatientDossier.emergencyBannerTitle")}</strong>
      </div>

      {hasSos && (
        <div className="dossier-vitals-emergency-bundle__sos d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2 min-w-0">
            <i className="ri-map-pin-2-fill fs-5 flex-shrink-0" aria-hidden />
            <span className="fw-semibold small mb-0">{t("doctorPatientDossier.sosLocationLabel")}</span>
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-danger flex-shrink-0"
            onClick={stopSirenOnMapClick}
          >
            <i className="ri-external-link-line me-1" aria-hidden />
            {t("doctorPatientDossier.viewOnMap")}
          </a>
        </div>
      )}

      {alerts.length > 0 && (
        <ul
          className={`dossier-vitals-emergency-bundle__list list-unstyled mb-0 ${hasSos ? "dossier-vitals-emergency-bundle__list--after-sos" : ""}`}
        >
          {alerts.map((a, i) => (
            <li
              key={i}
              className={`dossier-vitals-emergency-bundle__item dossier-vitals-emergency-bundle__item--${a.severity}`}
            >
              <i
                className={`me-2 ${a.severity === "danger" ? "ri-alarm-warning-fill" : "ri-alert-line"}`}
                aria-hidden
              />
              <span>{a.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
    </>
  );
}

function SectionCard({ icon, title, children, className = "", sectionId }) {
  return (
    <Card id={sectionId || undefined} className={`dossier-section-card mb-4 ${className}`}>
      <Card.Header className="dossier-section-card__header py-3 px-4 d-flex align-items-center gap-3">
        <div className="dossier-section-icon d-flex align-items-center justify-content-center flex-shrink-0">
          <i className={`${icon} fs-5`} aria-hidden />
        </div>
        <span className="dossier-section-card__title mb-0">{title}</span>
      </Card.Header>
      <Card.Body className="dossier-section-card__body px-4 pb-4 pt-3">{children}</Card.Body>
    </Card>
  );
}

function DossierQuickNav() {
  const { t } = useTranslation();
  const links = [
    { href: "#dossier-section-vitals", label: t("doctorPatientDossier.quickNavVitals") },
    { href: "#dossier-section-medicaments", label: t("doctorPatientDossier.quickNavTreatments") },
    { href: "#dossier-section-checkin", label: t("doctorPatientDossier.quickNavHistory") },
    { href: "#dossier-section-brain-mri", label: t("doctorPatientDossier.quickNavMri") },
    { href: "#dossier-section-protocol", label: t("doctorPatientDossier.quickNavProtocol") },
    { href: "#dossier-section-rdv", label: t("doctorPatientDossier.quickNavAppointments") },
  ];
  return (
    <nav className="dossier-quick-nav mb-4" aria-label={t("doctorPatientDossier.quickNavAria")}>
      <div className="dossier-quick-nav__scroll">
        {links.map(({ href, label }) => (
          <a key={href} href={href} className="dossier-quick-nav__link">
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/**
 * Corps du dossier patient : constantes, traitements, historiques, RDV.
 */
function isHealthLogResolved(log) {
  return String(log?.escalationStatus ?? "").toLowerCase() === "resolved";
}

export default function DoctorPatientDossierView({ patient }) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith("ar") ? "ar" : i18n.language?.startsWith("fr") ? "fr" : "en";
  const location = useLocation();
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [latestLog, setLatestLog] = useState(null);
  const [medications, setMedications] = useState([]);
  const [healthHistory, setHealthHistory] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [qsLoading, setQsLoading] = useState(false);
  const [qsErr, setQsErr] = useState("");
  const [qsSummary, setQsSummary] = useState(null);
  const [qsProtocols, setQsProtocols] = useState([]);
  const [qsTemplates, setQsTemplates] = useState([]);
  const [dischargeInput, setDischargeInput] = useState("");
  const [protocolPick, setProtocolPick] = useState("");
  const [addonPick, setAddonPick] = useState("");
  const [addonDue, setAddonDue] = useState("");
  const [qsBusy, setQsBusy] = useState(false);
  const [qsModalOpen, setQsModalOpen] = useState(false);
  const [qsModalLoading, setQsModalLoading] = useState(false);
  const [qsModalData, setQsModalData] = useState(null);
  const [qsModalError, setQsModalError] = useState("");
  const [resolveBusyId, setResolveBusyId] = useState(null);
  const [vitalResolveErr, setVitalResolveErr] = useState("");
  /** Consigne médecin par id de relevé (envoyée au patient à la clôture) */
  const [resolutionNoteById, setResolutionNoteById] = useState({});
  /** Même consigne pour « Tout clôturer » lorsque plusieurs relevés */
  const [bulkResolutionNote, setBulkResolutionNote] = useState("");

  const reloadHealthLogs = useCallback(async () => {
    const pid = patient?._id || patient?.id;
    if (!pid) return;
    const [log, hist] = await Promise.all([
      healthLogApi.getLatest(pid).catch(() => null),
      healthLogApi.getHistory(pid).catch(() => []),
    ]);
    setLatestLog(log && typeof log === "object" ? log : null);
    setHealthHistory(Array.isArray(hist) ? hist : []);
  }, [patient]);

  useEffect(() => {
    if (!patient) return;
    const pid = String(patient._id || patient.id);
    if (!pid) return;
    return subscribeDoctorHealthLogResolved((detail) => {
      if (detail.patientId && String(detail.patientId) !== pid) return;
      void reloadHealthLogs();
    });
  }, [patient, reloadHealthLogs]);

  useEffect(() => {
    if (!patient) return;
    const onVis = () => {
      if (document.visibilityState === "visible") void reloadHealthLogs();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [patient, reloadHealthLogs]);

  /** Depuis la page Urgences : ?action=appointment | medication */
  useEffect(() => {
    if (!patient || detailLoading) return;
    const q = new URLSearchParams(location.search);
    const action = q.get("action");
    if (action === "appointment") {
      document.getElementById("dossier-section-rdv")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (action === "medication") {
      document.getElementById("dossier-section-medicaments")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [patient, detailLoading, location.search, location.key]);

  useEffect(() => {
    if (!patient) return;
    const pid = patient._id || patient.id;
    if (!pid) return;
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      setDetailError("");
      try {
        const [log, hist, meds, appts] = await Promise.all([
          healthLogApi.getLatest(pid).catch(() => null),
          healthLogApi.getHistory(pid).catch(() => []),
          medicationApi.getByPatient(pid).catch(() => []),
          appointmentApi.getUpcoming(pid).catch(() => []),
        ]);
        if (cancelled) return;
        setLatestLog(log && typeof log === "object" ? log : null);
        setHealthHistory(Array.isArray(hist) ? hist : []);
        setMedications(Array.isArray(meds) ? meds : []);
        setUpcomingAppointments(Array.isArray(appts) ? appts : []);
      } catch (e) {
        if (!cancelled) setDetailError(e.message || t("doctorPatientDossier.loadDossierError"));
        if (!cancelled) {
          setLatestLog(null);
          setMedications([]);
          setHealthHistory([]);
          setUpcomingAppointments([]);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patient, location.key]);

  useEffect(() => {
    if (!patient) return;
    const pid = patient._id || patient.id;
    if (!pid) return;
    let cancelled = false;
    (async () => {
      setQsLoading(true);
      setQsErr("");
      try {
        const [sum, prot, tmpl] = await Promise.all([
          questionnaireApi.doctorPatientSummary(pid).catch(() => null),
          questionnaireApi.doctorProtocolsForPatient(pid).catch(() => []),
          questionnaireApi.doctorTemplatesForPatient(pid).catch(() => []),
        ]);
        if (cancelled) return;
        setQsSummary(sum && typeof sum === "object" ? sum : null);
        setQsProtocols(Array.isArray(prot) ? prot : []);
        setQsTemplates(Array.isArray(tmpl) ? tmpl : []);
        const dd = patient.dischargeDate ? String(patient.dischargeDate).slice(0, 10) : "";
        setDischargeInput(dd);
      } catch (e) {
        if (!cancelled) setQsErr(e.message || t("doctorPatientDossier.qsUnavailable"));
      } finally {
        if (!cancelled) setQsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patient]);

  const assignProtocol = async () => {
    const pid = patient?._id || patient?.id;
    if (!pid || !protocolPick || !dischargeInput) return;
    setQsBusy(true);
    setQsErr("");
    try {
      await questionnaireApi.doctorAssignProtocol({
        patientId: String(pid),
        protocolTemplateId: protocolPick,
        dischargeDate: dischargeInput,
      });
      const sum = await questionnaireApi.doctorPatientSummary(String(pid));
      setQsSummary(sum);
    } catch (e) {
      setQsErr(e.message || t("doctorPatientDossier.assignFailed"));
    } finally {
      setQsBusy(false);
    }
  };

  const addAddon = async () => {
    const pid = patient?._id || patient?.id;
    if (!pid || !addonPick) return;
    setQsBusy(true);
    setQsErr("");
    try {
      await questionnaireApi.doctorAddAddon({
        patientId: String(pid),
        questionnaireTemplateId: addonPick,
        ...(addonDue ? { dueDate: addonDue } : {}),
      });
      const sum = await questionnaireApi.doctorPatientSummary(String(pid));
      setQsSummary(sum);
    } catch (e) {
      setQsErr(e.message || t("doctorPatientDossier.addFailed"));
    } finally {
      setQsBusy(false);
    }
  };

  const openSubmissionAnswers = async (submissionId) => {
    const pid = patient?._id || patient?.id;
    if (!pid || !submissionId) return;
    setQsModalOpen(true);
    setQsModalLoading(true);
    setQsModalError("");
    setQsModalData(null);
    try {
      const d = await questionnaireApi.doctorGetSubmission(String(pid), submissionId);
      setQsModalData(d && typeof d === "object" ? d : null);
    } catch (e) {
      setQsModalError(e.message || t("doctorPatientDossier.loadAnswersFailed"));
    } finally {
      setQsModalLoading(false);
    }
  };

  const vSummary = latestLog?.vitals || {};
  const hr = hrStatus(vSummary.heartRate, t);
  const bp = bpStatus(vSummary.bloodPressureSystolic, t);
  const o2 = o2Status(vSummary.oxygenSaturation, t);
  const tp = tempStatus(vSummary.temperature, t);
  const wt = weightStatus(vSummary.weight, t);

  const doctorAlerts = useMemo(() => buildDoctorAlerts(latestLog, vSummary, t), [latestLog, vSummary, t]);
  const hasAnyAlert = doctorAlerts.length > 0;
  const hasVitalMeasurements =
    vSummary &&
    ["heartRate", "bloodPressureSystolic", "oxygenSaturation", "temperature", "weight"].some(
      (k) => vSummary[k] != null && vSummary[k] !== ""
    );

  const todayYmd = localDateStringYMD();

  const sortedMedications = useMemo(() => {
    const list = [...medications];
    list.sort((a, b) => {
      const aEnded = isMedicationPastEndDate(a, todayYmd);
      const bEnded = isMedicationPastEndDate(b, todayYmd);
      if (aEnded !== bEnded) return aEnded ? 1 : -1;
      const endA = String(a.endDate || "9999-12-31").slice(0, 10);
      const endB = String(b.endDate || "9999-12-31").slice(0, 10);
      return endB.localeCompare(endA);
    });
    return list;
  }, [medications, todayYmd]);

  const recentCheckIns = useMemo(() => {
    let h = [...healthHistory];
    const latestId = latestLog?._id ?? latestLog?.id;
    if (latestId) {
      const sid = String(latestId);
      h = h.filter((row) => String(row._id ?? row.id) !== sid);
    }
    h.sort(
      (a, b) =>
        new Date(b.recordedAt || b.createdAt || 0).getTime() - new Date(a.recordedAt || a.createdAt || 0).getTime()
    );
    return h.slice(0, 15);
  }, [healthHistory, latestLog]);

  const openVitalAlerts = useMemo(() => {
    const rows = [];
    const seen = new Set();
    const push = (log) => {
      if (!log?.flagged) return;
      if (isHealthLogResolved(log)) return;
      const id = String(log._id || log.id);
      if (!id || seen.has(id)) return;
      seen.add(id);
      rows.push(log);
    };
    if (latestLog) push(latestLog);
    for (const log of healthHistory || []) push(log);
    return rows;
  }, [latestLog, healthHistory]);

  const resolveVitalAlert = async (healthLogId) => {
    const pid = patient?._id || patient?.id;
    if (!pid || !healthLogId) return;
    const note = String(resolutionNoteById[healthLogId] ?? "").trim();
    if (!note) {
      setVitalResolveErr(t("doctorPatientDossier.noteBeforeResolve"));
      return;
    }
    setResolveBusyId(healthLogId);
    setVitalResolveErr("");
    try {
      await healthLogApi.doctorResolveVitalAlert(healthLogId, { resolutionNote: note });
      setResolutionNoteById((prev) => {
        const next = { ...prev };
        delete next[healthLogId];
        return next;
      });
      await reloadHealthLogs();
      broadcastDoctorHealthLogResolved(healthLogId, pid);
    } catch (e) {
      setVitalResolveErr(e.message || t("doctorPatientDossier.couldNotResolve"));
    } finally {
      setResolveBusyId(null);
    }
  };

  const resolveAllOpenVitalAlerts = async () => {
    const pid = patient?._id || patient?.id;
    if (!pid || openVitalAlerts.length === 0) return;
    const note = bulkResolutionNote.trim();
    if (!note) {
      setVitalResolveErr(t("doctorPatientDossier.noteBeforeResolveAll"));
      return;
    }
    setResolveBusyId("__all__");
    setVitalResolveErr("");
    try {
      for (const log of openVitalAlerts) {
        const id = String(log._id || log.id);
        await healthLogApi.doctorResolveVitalAlert(id, { resolutionNote: note });
      }
      setBulkResolutionNote("");
      setResolutionNoteById({});
      await reloadHealthLogs();
      const firstId = String(openVitalAlerts[0]?._id || openVitalAlerts[0]?.id || "bulk");
      broadcastDoctorHealthLogResolved(firstId, pid);
    } catch (e) {
      setVitalResolveErr(e.message || t("doctorPatientDossier.couldNotResolveAll"));
    } finally {
      setResolveBusyId(null);
    }
  };

  if (!patient) return null;

  return (
    <>
      {detailLoading && (
        <Card className="dossier-section-card border-0 mb-4">
          <Card.Body className="py-5 text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted small mb-0">{t("doctorPatientDossier.loadingDetails")}</p>
          </Card.Body>
        </Card>
      )}

      {!detailLoading && detailError && (
        <Alert variant="danger" className="rounded-4 border-0 shadow-sm">
          {detailError}
        </Alert>
      )}

      {!detailLoading && !detailError && (
        <>
          <DossierQuickNav />
          <SectionCard
            sectionId="dossier-section-vitals"
            icon="ri-heart-pulse-fill"
            title={t("doctorPatientDossier.sectionLatestVitals")}
          >
            {!latestLog ? (
              <Alert variant="light" className="border text-muted mb-0 rounded-3">
                <i className="ri-inbox-line me-2" />
                {t("doctorPatientDossier.noVitalsYet")}
              </Alert>
            ) : (
              <>
                <VitalsEmergencyBundle latestLog={latestLog} doctorAlerts={doctorAlerts} t={t} />

                {!hasAnyAlert && hasVitalMeasurements && (
                  <Alert variant="success" className="py-2 mb-3 rounded-3 border-0">
                    <i className="ri-shield-check-line me-2" />
                    {t("doctorPatientDossier.lastReadingOk")}
                  </Alert>
                )}
                {!hasAnyAlert && !hasVitalMeasurements && (
                  <Alert variant="light" className="py-2 mb-3 border rounded-3 text-muted">
                    <i className="ri-information-line me-2" />
                    {t("doctorPatientDossier.lastCheckinNoVitals")}
                  </Alert>
                )}

                {openVitalAlerts.length > 0 && (
                  <div className="dossier-vital-closure-panel mb-3" role="region" aria-label={t("doctorPatientDossier.ariaVitalAlertsPanel")}>
                    <div className="dossier-vital-closure-panel__head">
                      <div className="d-flex align-items-start gap-3">
                        <span className="dossier-vital-closure-panel__icon" aria-hidden>
                          <i className="ri-nurse-line" />
                        </span>
                        <div className="min-w-0 flex-grow-1">
                          <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                            <div className="dossier-vital-closure-panel__title">{t("doctorPatientDossier.vitalClosureTitle")}</div>
                            {openVitalAlerts.length > 1 ? (
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                className="text-nowrap dossier-vital-resolve-all-btn"
                                disabled={resolveBusyId != null || !bulkResolutionNote.trim()}
                                title={
                                  resolveBusyId != null || bulkResolutionNote.trim()
                                    ? undefined
                                    : t("doctorPatientDossier.noteBeforeResolveAll")
                                }
                                onClick={resolveAllOpenVitalAlerts}
                              >
                                {resolveBusyId === "__all__" ? (
                                  <>
                                    <Spinner animation="border" size="sm" className="me-1" />
                                    {t("doctorPatientDossier.closing")}
                                  </>
                                ) : (
                                  <>
                                    <i className="ri-stack-line me-1" />
                                    {t("doctorPatientDossier.resolveAll", { count: openVitalAlerts.length })}
                                  </>
                                )}
                              </Button>
                            ) : null}
                          </div>
                          <p className="dossier-vital-closure-panel__lead">{t("doctorPatientDossier.vitalClosureLead")}</p>
                        </div>
                      </div>
                    </div>
                    {vitalResolveErr ? <div className="dossier-vital-closure-panel__error">{vitalResolveErr}</div> : null}
                    {openVitalAlerts.length > 1 ? (
                      <div className="px-3 pb-2 dossier-vital-bulk-note">
                        <Form.Label className="small fw-semibold text-secondary mb-1">{t("doctorPatientDossier.bulkNoteLabel")}</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          className="small"
                          placeholder={t("doctorPatientDossier.bulkNotePlaceholder")}
                          value={bulkResolutionNote}
                          onChange={(e) => setBulkResolutionNote(e.target.value)}
                          disabled={resolveBusyId != null}
                        />
                      </div>
                    ) : null}
                    <div className="dossier-vital-closure-panel__list">
                      {openVitalAlerts.map((log) => {
                        const lid = String(log._id || log.id);
                        const st = log.escalationStatus;
                        const stLabel =
                          st === "escalated_to_doctor"
                            ? t("doctorPatientDossier.escalationNurseToDoctor")
                            : st === "alert_sent"
                            ? t("doctorPatientDossier.escalationAlertSent")
                            : t("doctorPatientDossier.escalationUrgent");
                        const badgeVariant =
                          st === "escalated_to_doctor" ? "warning" : st === "alert_sent" ? "danger" : "danger";
                        const badgeTextDark = st === "escalated_to_doctor";
                        const rowNote = resolutionNoteById[lid] ?? "";
                        const rowNoteOk = String(rowNote).trim().length > 0;
                        return (
                          <div key={lid} className="dossier-vital-closure-row dossier-vital-closure-row--stack">
                            <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 w-100">
                              <div className="dossier-vital-closure-row__meta">
                                <time className="dossier-vital-closure-row__date" dateTime={log.recordedAt || log.createdAt}>
                                  {formatDateTime(log.recordedAt || log.createdAt, dateLocale)}
                                </time>
                                <Badge bg={badgeVariant} text={badgeTextDark ? "dark" : undefined}>
                                  {stLabel}
                                </Badge>
                                {typeof log.riskScore === "number" ? (
                                  <span className="dossier-vital-closure-row__score">
                                    {t("doctorPatientDossier.scoreSlash", { score: log.riskScore })}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <VitalSnapshotForAlertRow vitals={log.vitals} t={t} />
                            <Form.Group className="mb-0 w-100 mt-1 dossier-vital-closure-row__instruction">
                              <Form.Label className="dossier-vital-closure-row__instruction-label">
                                {t("doctorPatientDossier.instructionRequiredLabel")}
                              </Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                className="dossier-vital-closure-row__textarea"
                                placeholder={t("doctorPatientDossier.instructionPlaceholder")}
                                value={rowNote}
                                onChange={(e) =>
                                  setResolutionNoteById((prev) => ({ ...prev, [lid]: e.target.value }))
                                }
                                disabled={resolveBusyId != null}
                              />
                            </Form.Group>
                            <div className="d-flex justify-content-end w-100">
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                className="dossier-vital-closure-row__action"
                                disabled={!rowNoteOk || resolveBusyId != null}
                                onClick={() => resolveVitalAlert(lid)}
                              >
                                {resolveBusyId === lid ? (
                                  <>
                                    <Spinner animation="border" size="sm" className="me-1" />
                                    {t("doctorPatientDossier.sending")}
                                  </>
                                ) : (
                                  <>
                                    <i className="ri-checkbox-circle-line me-1" />
                                    {t("doctorPatientDossier.markResolvedAndSend")}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-3 dossier-recorded-bar">
                  <span className="small fw-semibold text-primary">
                    <i className="ri-time-line me-1" />
                    {t("doctorPatientDossier.recordedOn")}
                  </span>
                  {(latestLog.recordedAt || latestLog.createdAt) && (
                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2">
                      {formatDateTime(latestLog.recordedAt || latestLog.createdAt, dateLocale)}
                    </span>
                  )}
                </div>

                <Row className="g-3 mb-2">
                  <Col sm={6} xl={4}>
                    <VitalMetricTile
                      icon="ri-heart-pulse-fill"
                      accent="#dc3545"
                      title={t("doctorPatientDossier.tileHeartRate")}
                      value={vSummary.heartRate}
                      unit="bpm"
                      status={hr}
                      noDataMsg={t("doctorPatientDossier.notRecorded")}
                    />
                  </Col>
                  <Col sm={6} xl={4}>
                    <VitalMetricTile
                      icon="ri-drop-fill"
                      accent="#089bab"
                      title={t("doctorPatientDossier.tileBloodPressure")}
                      value={
                        vSummary.bloodPressureSystolic
                          ? `${vSummary.bloodPressureSystolic}/${vSummary.bloodPressureDiastolic ?? "—"}`
                          : null
                      }
                      unit="mmHg"
                      status={bp}
                      noDataMsg={t("doctorPatientDossier.notRecorded")}
                    />
                  </Col>
                  <Col sm={6} xl={4}>
                    <VitalMetricTile
                      icon="ri-lungs-fill"
                      accent="#6f42c1"
                      title={t("doctorPatientDossier.tileO2")}
                      value={vSummary.oxygenSaturation}
                      unit="%"
                      status={o2}
                      noDataMsg={t("doctorPatientDossier.notRecorded")}
                    />
                  </Col>
                  <Col sm={6} xl={4}>
                    <VitalMetricTile
                      icon="ri-temp-hot-fill"
                      accent="#fd7e14"
                      title={t("doctorPatientDossier.tileTemperature")}
                      value={vSummary.temperature}
                      unit="°C"
                      status={tp}
                      noDataMsg={t("doctorPatientDossier.notRecorded")}
                    />
                  </Col>
                  <Col sm={6} xl={4}>
                    <VitalMetricTile
                      icon="ri-scales-3-line"
                      accent="#198754"
                      title={t("doctorPatientDossier.tileWeight")}
                      value={vSummary.weight}
                      unit="kg"
                      status={wt}
                      noDataMsg={t("doctorPatientDossier.notRecorded")}
                    />
                  </Col>
                </Row>

                {Array.isArray(latestLog.symptoms) && latestLog.symptoms.length > 0 && (
                  <div className="dossier-symptoms p-3 mt-2">
                    <div className="small fw-semibold text-primary mb-2">
                      <i className="ri-file-list-line me-1" />
                      {t("doctorPatientDossier.symptomsLastReading")}
                    </div>
                    <div className="small text-dark">{latestLog.symptoms.map((s) => translateSymptom(s, t)).join(", ")}</div>
                  </div>
                )}
              </>
            )}
          </SectionCard>

          <SectionCard
            sectionId="dossier-section-medicaments"
            icon="ri-medicine-bottle-line"
            title={t("doctorPatientDossier.sectionTreatments")}
          >
            {sortedMedications.length === 0 ? (
              <p className="text-muted small mb-0">
                <i className="ri-medicine-bottle-line me-1 opacity-50" />
                {t("doctorPatientDossier.noTreatments")}
              </p>
            ) : (
              <div className="dossier-table-wrap">
                <Table responsive hover className="dossier-data-table align-middle bg-white mb-0">
                  <thead>
                    <tr>
                      <th>{t("doctorPatientDossier.med")}</th>
                      <th>{t("doctorPatientDossier.dosage")}</th>
                      <th>{t("doctorPatientDossier.frequency")}</th>
                      <th>{t("doctorPatientDossier.prescribedBy")}</th>
                      <th>{t("doctorPatientDossier.period")}</th>
                      <th>{t("doctorPatientDossier.statusCol")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMedications.map((m) => {
                      const mid = m._id || m.id;
                      const endStr = m.endDate ? String(m.endDate).slice(0, 10) : "";
                      const startStr = m.startDate ? String(m.startDate).slice(0, 10) : "";
                      const ended = isMedicationPastEndDate(m, todayYmd);
                      return (
                        <tr key={mid}>
                          <td className="fw-semibold">{m.name}</td>
                          <td>{m.dosage || "—"}</td>
                          <td>{formatMedicationFrequencyDisplay(m.frequency, t)}</td>
                          <td>{m.prescribedBy || "—"}</td>
                          <td className="small text-muted">
                            {startStr ? formatDisplayDateYmd(startStr, dateLocale) : "—"}
                            {endStr ? ` → ${formatDisplayDateYmd(endStr, dateLocale)}` : ""}
                          </td>
                          <td>
                            <span className={`badge rounded-pill ${ended ? "bg-secondary" : "bg-success"}`}>
                              {ended ? t("doctorPatientDossier.statusEnded") : t("doctorPatientDossier.statusActive")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </SectionCard>

          {sortedMedications.length > 0 && (
            <SectionCard sectionId="dossier-section-intake" icon="ri-history-line" title={t("doctorPatientDossier.sectionIntakeHistory")}>
              <p className="dossier-lead text-muted mb-4">{t("doctorPatientDossier.intakeLead")}</p>
              {sortedMedications.map((m) => {
                const mid = m._id || m.id;
                const intakeByDay = getIntakeHistoryByDate(m);
                const recentDays = intakeByDay.slice(0, 5);
                return (
                  <Card key={`intake-${mid}`} className="dossier-intake-card mb-3">
                    <Card.Body className="py-3 px-3">
                      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-light">
                        <span className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary flex-shrink-0" style={{ width: 36, height: 36 }}>
                          <i className="ri-capsule-line" />
                        </span>
                        <span className="fw-semibold text-dark">{m.name}</span>
                      </div>
                      {recentDays.length === 0 ? (
                        <p className="small text-muted mb-0">{t("doctorPatientDossier.noRecentIntake")}</p>
                      ) : (
                        <ul className="list-unstyled small mb-0">
                          {recentDays.map(({ date, slots }) => (
                            <li key={date} className="mb-3">
                              <span className="fw-medium text-primary">{formatDisplayDateYmd(date, dateLocale)}</span>
                              <ul className="list-unstyled ps-2 mb-0 mt-1 text-muted">
                                {slots.map((s) => (
                                  <li key={`${date}-${s.index}`}>
                                    {s.label}
                                    {s.recordedAt ? (
                                      <span className="text-dark ms-1">— {formatSlotTimeLocal(s.recordedAt)}</span>
                                    ) : (
                                      <span className="fst-italic ms-1">{t("doctorPatientDossier.timeNotRecorded")}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
            </SectionCard>
          )}

          <SectionCard sectionId="dossier-section-checkin" icon="ri-file-list-3-line" title={t("doctorPatientDossier.sectionCheckInHistory")}>
            {recentCheckIns.length === 0 ? (
              <p className="text-muted small mb-0">{t("doctorPatientDossier.noOtherReadings")}</p>
            ) : (
              <div className="dossier-table-wrap">
                <Table responsive className="dossier-data-table align-middle bg-white mb-0">
                  <thead>
                    <tr>
                      <th>{t("doctorPatientDossier.thDateTime")}</th>
                      <th>{t("doctorPatientDossier.thVitals")}</th>
                      <th>{t("doctorPatientDossier.thScore")}</th>
                      <th>{t("doctorPatientDossier.thPain")}</th>
                      <th>{t("doctorPatientDossier.thMood")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCheckIns.map((log) => {
                      const lid = log._id || log.id;
                      const recordedAt = log.recordedAt || log.createdAt;
                      const score = typeof log.riskScore === "number" ? log.riskScore : "—";
                      return (
                        <tr key={lid}>
                          <td className="text-nowrap small">{formatDateTime(recordedAt, dateLocale)}</td>
                          <td className="small">{formatLogVitalsShort(log, t)}</td>
                          <td>
                            {log.flagged ? (
                              <span className="badge rounded-pill bg-danger">{score}</span>
                            ) : Number(score) >= 25 ? (
                              <span className="badge rounded-pill bg-warning text-dark">{score}</span>
                            ) : (
                              <span className="badge rounded-pill bg-light text-dark border">{score}</span>
                            )}
                          </td>
                          <td>{typeof log.painLevel === "number" ? `${log.painLevel}/10` : "—"}</td>
                          <td className="small">{formatMoodLabel(log.mood, t)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </SectionCard>

          <SectionCard
            sectionId="dossier-section-brain-mri"
            icon="ri-brain-line"
            title={t("doctorPatientDossier.sectionBrainMri")}
          >
            <BrainMriAnalysisPage
              variant="doctor"
              patientId={normalizeMongoId(patient?._id ?? patient?.id)}
              embedded
            />
          </SectionCard>

          <SectionCard icon="ri-draft-line" title={t("doctorPatientDossier.sectionProtocol")}>
            {qsLoading && (
              <div className="text-muted small mb-0 d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" />
                <span>{t("doctorPatientDossier.loadingQs")}</span>
              </div>
            )}
            {qsErr && (
              <Alert variant="warning" className="py-2 mb-3">
                {qsErr}
              </Alert>
            )}
            {!qsLoading && (
              <>
                <p className="dossier-lead text-muted mb-4">
                  {t("doctorPatientDossier.protocolIntro1")} {t("doctorPatientDossier.protocolIntro2")}
                </p>
                <Row className="g-3 mb-4 dossier-protocol-form">
                  <Col md={4}>
                    <label className="form-label dossier-form-label text-muted">{t("doctorPatientDossier.dischargeDateLabel")}</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dischargeInput}
                      onChange={(e) => setDischargeInput(e.target.value)}
                    />
                  </Col>
                  <Col md={5}>
                    <label className="form-label dossier-form-label text-muted">{t("doctorPatientDossier.protocolLabel")}</label>
                    <select className="form-select" value={protocolPick} onChange={(e) => setProtocolPick(e.target.value)}>
                      <option value="">{t("doctorPatientDossier.chooseOption")}</option>
                      {qsProtocols.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({(p.milestones || []).map((m) => `J+${m.dayOffset}`).join(", ")})
                        </option>
                      ))}
                    </select>
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <button type="button" className="btn btn-primary w-100 fw-semibold" disabled={qsBusy || !protocolPick || !dischargeInput} onClick={assignProtocol}>
                      {t("doctorPatientDossier.assignProtocol")}
                    </button>
                  </Col>
                </Row>
                <Row className="g-3 mb-4 pb-4 border-bottom dossier-protocol-divider">
                  <Col md={5}>
                    <label className="form-label dossier-form-label text-muted">{t("doctorPatientDossier.addonLabel")}</label>
                    <select className="form-select" value={addonPick} onChange={(e) => setAddonPick(e.target.value)}>
                      <option value="">{t("doctorPatientDossier.optionalOption")}</option>
                      {qsTemplates.map((tpl) => (
                        <option key={tpl._id} value={tpl._id}>
                          {tpl.title}
                        </option>
                      ))}
                    </select>
                  </Col>
                  <Col md={4}>
                    <label className="form-label dossier-form-label text-muted">{t("doctorPatientDossier.dueDateLabel")}</label>
                    <input type="date" className="form-control" value={addonDue} onChange={(e) => setAddonDue(e.target.value)} />
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100 fw-semibold dossier-protocol-addon-btn"
                      disabled={qsBusy || !addonPick}
                      title={!addonPick && !qsBusy ? t("doctorPatientDossier.addDisabledHint") : undefined}
                      onClick={addAddon}
                    >
                      {t("doctorPatientDossier.add")}
                    </button>
                  </Col>
                </Row>
                {qsSummary?.assignment && (
                  <div className="small">
                    <div className="fw-semibold mb-2">
                      {t("doctorPatientDossier.activeProtocolOn", { date: qsSummary.assignment.dischargeDate })}
                    </div>
                    <ul className="list-unstyled mb-0">
                      {(qsSummary.assignment.milestones || []).map((m, i) => (
                        <li key={m.submissionId || `m-${i}`} className="mb-2 d-flex flex-wrap align-items-center gap-2">
                          <span>
                            <span className="badge bg-light text-dark border me-2">J+{m.dayOffset}</span>
                            {m.questionnaireTitle || t("doctorPatientDossier.questionnaireFallback")} —{" "}
                            <span className="text-muted">{t("doctorPatientDossier.dueDateInline", { date: m.dueDate })}</span> —{" "}
                            <span>{formatQuestionnaireStatus(m.status, t)}</span>
                          </span>
                          {isQuestionnaireCompleted(m.status) && m.submissionId && (
                            <Button
                              type="button"
                              variant="outline-primary"
                              size="sm"
                              className="ms-auto"
                              onClick={() => openSubmissionAnswers(m.submissionId)}
                            >
                              {t("doctorPatientDossier.viewResponse")}
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {qsSummary?.addons?.length > 0 && (
                  <div className="small mt-3">
                    <div className="fw-semibold mb-2">{t("doctorPatientDossier.addonsTitle")}</div>
                    <ul className="list-unstyled mb-0">
                      {qsSummary.addons.map((a) => (
                        <li key={a._id} className="mb-2 d-flex flex-wrap align-items-center gap-2">
                          <span>
                            {a.questionnaireTitle} — {a.dueDate} — <span>{formatQuestionnaireStatus(a.status, t)}</span>
                          </span>
                          {isQuestionnaireCompleted(a.status) && a.submissionId && (
                            <Button
                              type="button"
                              variant="outline-primary"
                              size="sm"
                              className="ms-auto"
                              onClick={() => openSubmissionAnswers(a.submissionId)}
                            >
                              {t("doctorPatientDossier.viewResponse")}
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!qsSummary?.assignment && !qsLoading && (
                  <p className="text-muted small mb-0">{t("doctorPatientDossier.noProtocolYet")}</p>
                )}
              </>
            )}
          </SectionCard>

          <SectionCard sectionId="dossier-section-rdv" icon="ri-calendar-check-line" title={t("doctorPatientDossier.sectionUpcomingAppt")}>
            {upcomingAppointments.length === 0 ? (
              <p className="text-muted small mb-0">{t("doctorPatientDossier.noUpcomingAppt")}</p>
            ) : (
              <ul className="list-unstyled small mb-0">
                {upcomingAppointments.map((a, idx) => {
                  const aid = a._id || a.id;
                  const last = idx === upcomingAppointments.length - 1;
                  return (
                    <li key={aid} className={`dossier-rdv-item p-3${last ? "" : " mb-3"}`}>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <span className="fw-semibold">{a.title || t("doctorPatientDossier.defaultConsultation")}</span>
                        <span className="text-muted">
                          {a.date ? formatDisplayDateYmd(a.date, dateLocale) : ""}
                          {a.time ? ` · ${a.time}` : ""}
                        </span>
                        {a.status && (
                          <span className="badge rounded-pill bg-primary ms-auto">{formatAppointmentStatus(a.status, t)}</span>
                        )}
                      </div>
                      {a.location && <div className="text-muted mt-2 small">{a.location}</div>}
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <Modal show={qsModalOpen} onHide={() => setQsModalOpen(false)} size="lg" centered scrollable>
            <Modal.Header closeButton>
              <Modal.Title as="h5">{t("doctorPatientDossier.modalResponsesTitle")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {qsModalLoading && (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" size="sm" />
                </div>
              )}
              {qsModalError && (
                <Alert variant="danger" className="mb-0 py-2">
                  {qsModalError}
                </Alert>
              )}
              {!qsModalLoading && qsModalData && (
                <>
                  <p className="fw-semibold text-dark mb-1">
                    {qsModalData.questionnaireTitle || t("doctorPatientDossier.questionnaireFallback")}
                  </p>
                  {qsModalData.submittedAt && (
                    <p className="text-muted small mb-3">
                      {t("doctorPatientDossier.submittedOn", { date: formatDateTime(qsModalData.submittedAt, dateLocale) })}
                    </p>
                  )}
                  <Table bordered className="dossier-data-table mb-0 bg-white">
                    <tbody>
                      {(qsModalData.rows || []).map((r) => (
                        <tr key={r.questionId}>
                          <td className="text-muted" style={{ width: "42%" }}>
                            {r.label}
                          </td>
                          <td className="fw-medium">{r.displayValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" size="sm" onClick={() => setQsModalOpen(false)}>
                {t("doctorPatientDossier.close")}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  );
}
