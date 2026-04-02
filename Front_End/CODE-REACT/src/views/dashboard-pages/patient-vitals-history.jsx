import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import Card from "../../components/Card";
import VitalMetricTile, { hrStatus, bpStatus, o2Status, tempStatus, weightStatus } from "../../components/VitalMetricTile";
import { healthLogApi } from "../../services/api";
import { translateSymptom } from "../../utils/symptomLabels";

const VITALS_TZ = "Africa/Tunis";

function formatDisplayDate(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  try {
    return new Date(`${ymd}T12:00:00`).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return ymd;
  }
}

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
      timeZone: VITALS_TZ,
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  } catch {
    return "—";
  }
}

function moodMeta(mood) {
  if (mood === "good") return { icon: "ri-shield-check-line", label: "Satisfaisant", color: "#28a745" };
  if (mood === "fair") return { icon: "ri-scales-3-line", label: "Modéré", color: "#fd7e14" };
  if (mood === "poor") return { icon: "ri-first-aid-kit-line", label: "Difficile", color: "#dc3545" };
  return { icon: null, label: "—", color: "#6c757d" };
}

function riskBadgeClass(score) {
  if (score >= 50) return "bg-danger";
  if (score >= 25) return "bg-warning text-dark";
  return "bg-success";
}

const PatientVitalsHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patientUser, setPatientUser] = useState(() => {
    try {
      const stored = localStorage.getItem("patientUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const rawId = patientUser?.id ?? patientUser?._id;
  const pid =
    rawId != null && typeof rawId === "object" && rawId !== null && "$oid" in rawId
      ? String(rawId.$oid)
      : rawId != null
        ? String(rawId)
        : undefined;

  const [history, setHistory] = useState([]);
  const [latestLog, setLatestLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientUser) {
      navigate("/auth/sign-in", { replace: true });
    }
  }, [patientUser, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!pid) return;
      setLoading(true);
      setError("");
      try {
        const [logs, latest] = await Promise.all([
          healthLogApi.getHistory(pid),
          healthLogApi.getLatest(pid).catch(() => null),
        ]);
        setHistory(Array.isArray(logs) ? logs : []);
        setLatestLog(latest && typeof latest === "object" ? latest : null);
      } catch (e) {
        console.error(e);
        setError("Impossible de charger l'historique des constantes vitales.");
        setHistory([]);
        setLatestLog(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pid]);

  /** Jours du plus récent au plus ancien ; relevés du même jour triés par heure décroissante. */
  const groupedByDay = useMemo(() => {
    const map = new Map();
    for (const log of history) {
      const ymd =
        log.date && /^\d{4}-\d{2}-\d{2}$/.test(String(log.date))
          ? String(log.date).slice(0, 10)
          : (() => {
              const t = log.recordedAt || log.createdAt;
              if (!t) return null;
              const d = new Date(t);
              if (Number.isNaN(d.getTime())) return null;
              const parts = new Intl.DateTimeFormat("en-CA", {
                timeZone: VITALS_TZ,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).formatToParts(d);
              const y = parts.find((p) => p.type === "year")?.value;
              const mo = parts.find((p) => p.type === "month")?.value;
              const da = parts.find((p) => p.type === "day")?.value;
              return y && mo && da ? `${y}-${mo}-${da}` : null;
            })();
      if (!ymd) continue;
      if (!map.has(ymd)) map.set(ymd, []);
      map.get(ymd).push(log);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const ta = new Date(a.recordedAt || a.createdAt || 0).getTime();
        const tb = new Date(b.recordedAt || b.createdAt || 0).getTime();
        return tb - ta;
      });
    }
    const days = [...map.keys()].sort((a, b) => b.localeCompare(a));
    return days.map((date) => ({ date, logs: map.get(date) }));
  }, [history]);

  /** Dernier relevé affiché en tuiles : API latest, sinon premier jour le plus récent. */
  const summaryLog = useMemo(() => {
    if (latestLog) return latestLog;
    if (!groupedByDay.length) return null;
    return groupedByDay[0].logs[0] ?? null;
  }, [latestLog, groupedByDay]);

  const vSummary = summaryLog?.vitals || {};
  const hr = hrStatus(vSummary.heartRate);
  const bp = bpStatus(vSummary.bloodPressureSystolic);
  const o2 = o2Status(vSummary.oxygenSaturation);
  const tp = tempStatus(vSummary.temperature);

  if (!patientUser) {
    return null;
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col>
          <Link to="/dashboard-pages/patient-dashboard" className="text-decoration-none small d-inline-flex align-items-center gap-1">
            <i className="ri-arrow-left-line"></i>
            Retour au tableau de bord
          </Link>
          <h4 className="text-primary fw-bold mt-2 mb-0">
            <i className="ri-heart-pulse-line me-2"></i>
            Historique des constantes vitales
          </h4>
          <p className="text-muted small mb-0 mt-1">
            Tous vos relevés sur la période disponible (plusieurs par jour) : constantes, ressenti, symptômes et score de
            risque — du plus récent au plus ancien.
          </p>
        </Col>
      </Row>

      {!loading && !error && (summaryLog || groupedByDay.length > 0) && (
        <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: 18 }}>
          <div
            className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-2"
            style={{
              background: "linear-gradient(105deg, #ecfdf5 0%, #ffffff 42%, #fff7ed 100%)",
              borderBottom: "1px solid rgba(8, 155, 171, 0.12)",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 46,
                  height: 46,
                  background: "linear-gradient(135deg, #089bab 0%, #0d9488 100%)",
                  boxShadow: "0 4px 12px rgba(8, 155, 171, 0.35)",
                }}
              >
                <i className="ri-heart-pulse-fill text-white fs-5" />
              </div>
              <div>
                <h6 className="mb-0 fw-bold text-primary">Dernier relevé</h6>
                <small className="text-muted">Synthèse des constantes du check-in le plus récent</small>
              </div>
            </div>
            {summaryLog && (summaryLog.recordedAt || summaryLog.createdAt) && (
              <span
                className="badge rounded-pill px-3 py-2 fw-normal"
                style={{
                  background: "rgba(8, 155, 171, 0.1)",
                  color: "#089bab",
                  border: "1px solid rgba(8, 155, 171, 0.25)",
                  fontSize: "0.72rem",
                }}
              >
                <i className="ri-time-line me-1" />
                {formatDateTime(summaryLog.recordedAt || summaryLog.createdAt)}
              </span>
            )}
          </div>
          <Card.Body className="p-3 p-md-4">
            <Row className="g-3">
              <Col sm={6} xl={3}>
                <VitalMetricTile
                  icon="ri-heart-pulse-fill"
                  accent="#dc3545"
                  title="Fréquence cardiaque"
                  value={vSummary.heartRate}
                  unit="bpm"
                  status={hr}
                  noDataMsg="Enregistrez vos constantes pour afficher la FC."
                />
              </Col>
              <Col sm={6} xl={3}>
                <VitalMetricTile
                  icon="ri-drop-fill"
                  accent="#089bab"
                  title="Tension artérielle"
                  value={vSummary.bloodPressureSystolic ? `${vSummary.bloodPressureSystolic}/${vSummary.bloodPressureDiastolic}` : null}
                  unit="mmHg"
                  status={bp}
                  noDataMsg="Enregistrez vos constantes pour afficher la TA."
                />
              </Col>
              <Col sm={6} xl={3}>
                <VitalMetricTile
                  icon="ri-lungs-fill"
                  accent="#6f42c1"
                  title="Saturation O₂"
                  value={vSummary.oxygenSaturation}
                  unit="%"
                  status={o2}
                  noDataMsg="Enregistrez vos constantes pour afficher SpO₂."
                />
              </Col>
              <Col sm={6} xl={3}>
                <VitalMetricTile
                  icon="ri-temp-hot-fill"
                  accent="#fd7e14"
                  title="Température"
                  value={vSummary.temperature}
                  unit="°C"
                  status={tp}
                  noDataMsg="Enregistrez vos constantes pour afficher la température."
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && groupedByDay.length === 0 && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center text-muted py-5">
            Aucun relevé enregistré pour le moment. Complétez un check-in depuis le tableau de bord.
          </Card.Body>
        </Card>
      )}

      {!loading &&
        !error &&
        groupedByDay.map(({ date, logs }) => (
          <Card key={date} className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: 18 }}>
            <div
              className="px-3 py-2 px-md-4 d-flex align-items-center gap-2"
              style={{
                background: "linear-gradient(105deg, rgba(8, 155, 171, 0.08) 0%, #ffffff 55%)",
                borderBottom: "1px solid rgba(8, 155, 171, 0.12)",
              }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white"
                style={{
                  width: 36,
                  height: 36,
                  background: "linear-gradient(135deg, #089bab 0%, #0d9488 100%)",
                  fontSize: "1rem",
                }}
              >
                <i className="ri-calendar-event-fill" />
              </div>
              <h6 className="fw-bold text-primary mb-0">{formatDisplayDate(date)}</h6>
            </div>
            <Card.Body className="p-3 p-md-4">
              {logs.map((log, idx) => {
                const v = log.vitals || {};
                const mood = moodMeta(log.mood);
                const t = log.recordedAt || log.createdAt;
                const hr = hrStatus(v.heartRate);
                const bp = bpStatus(v.bloodPressureSystolic);
                const o2 = o2Status(v.oxygenSaturation);
                const tp = tempStatus(v.temperature);
                const wt = weightStatus(v.weight);
                const pain = log.painLevel ?? 0;
                return (
                  <div
                    key={log._id || `${date}-${t}`}
                    className={`rounded-4 overflow-hidden border ${idx === logs.length - 1 ? "mb-0" : "mb-4"}`}
                    style={{
                      borderColor: "rgba(148, 163, 184, 0.22)",
                      boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
                    }}
                  >
                    <div
                      className="px-3 py-2 px-md-3 d-flex flex-wrap justify-content-between align-items-center gap-2"
                      style={{
                        background: "linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)",
                        borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 small">
                        <span
                          className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1"
                          style={{
                            background: "rgba(8, 155, 171, 0.1)",
                            color: "#089bab",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                          }}
                        >
                          <i className="ri-time-line" aria-hidden />
                          {formatDateTime(t)}
                        </span>
                      </div>
                      <div className="d-flex flex-wrap gap-1 align-items-center">
                        <span className={`badge ${riskBadgeClass(log.riskScore ?? 0)}`} style={{ fontSize: "0.72rem" }}>
                          Risque {log.riskScore ?? 0}/100
                        </span>
                        {log.flagged && (
                          <span className="badge bg-danger" style={{ fontSize: "0.72rem" }}>
                            <i className="ri-alert-line me-1" aria-hidden />
                            À surveiller
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 p-md-3 pt-3">
                      <Row className="g-3 row-cols-2 row-cols-lg-3 row-cols-xl-5">
                        <Col>
                          <VitalMetricTile
                            icon="ri-heart-pulse-fill"
                            accent="#dc3545"
                            title="Fréquence cardiaque"
                            value={v.heartRate}
                            unit="bpm"
                            status={hr}
                            noDataMsg="—"
                          />
                        </Col>
                        <Col>
                          <VitalMetricTile
                            icon="ri-drop-fill"
                            accent="#089bab"
                            title="Tension artérielle"
                            value={
                              v.bloodPressureSystolic != null || v.bloodPressureDiastolic != null
                                ? `${v.bloodPressureSystolic ?? "—"}/${v.bloodPressureDiastolic ?? "—"}`
                                : null
                            }
                            unit="mmHg"
                            status={bp}
                            noDataMsg="—"
                          />
                        </Col>
                        <Col>
                          <VitalMetricTile
                            icon="ri-lungs-fill"
                            accent="#6f42c1"
                            title="Saturation O₂"
                            value={v.oxygenSaturation}
                            unit="%"
                            status={o2}
                            noDataMsg="—"
                          />
                        </Col>
                        <Col>
                          <VitalMetricTile
                            icon="ri-temp-hot-fill"
                            accent="#fd7e14"
                            title="Température"
                            value={v.temperature}
                            unit="°C"
                            status={tp}
                            noDataMsg="—"
                          />
                        </Col>
                        <Col>
                          <VitalMetricTile
                            icon="ri-scales-3-fill"
                            accent="#64748b"
                            title="Poids"
                            value={v.weight}
                            unit="kg"
                            status={wt}
                            noDataMsg="—"
                          />
                        </Col>
                      </Row>

                      <div
                        className="mt-3 pt-3"
                        style={{ borderTop: "1px solid rgba(148, 163, 184, 0.18)" }}
                      >
                        <Row className="g-3 align-items-center">
                          <Col xs={12} md="auto">
                            <div className="d-flex flex-wrap align-items-center gap-2">
                              <span className="text-muted small text-uppercase fw-semibold" style={{ letterSpacing: "0.04em" }}>
                                Ressenti
                              </span>
                              <span className="fw-semibold d-inline-flex align-items-center gap-1" style={{ color: mood.color }}>
                                {mood.icon ? <i className={mood.icon} aria-hidden /> : null}
                                {mood.label}
                              </span>
                            </div>
                          </Col>
                          <Col xs={12} md>
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                              <span className="text-muted small text-uppercase fw-semibold" style={{ letterSpacing: "0.04em" }}>
                                Douleur
                              </span>
                              <span className="fw-bold small">{pain}/10</span>
                            </div>
                            <div className="progress" style={{ height: 8, borderRadius: 8, maxWidth: 280 }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                  width: `${(pain / 10) * 100}%`,
                                  borderRadius: 8,
                                  backgroundColor: pain >= 7 ? "#dc3545" : pain >= 4 ? "#fd7e14" : "#28a745",
                                }}
                              />
                            </div>
                          </Col>
                        </Row>

                        {Array.isArray(log.symptoms) && log.symptoms.length > 0 && (
                          <div className="mt-3">
                            <span className="text-muted small text-uppercase fw-semibold d-block mb-2" style={{ letterSpacing: "0.04em" }}>
                              {t("patientDashboard.symptoms")}
                            </span>
                            <div className="d-flex flex-wrap gap-1">
                              {log.symptoms.map((s) => (
                                <span key={s} className="badge bg-warning text-dark" style={{ fontSize: "0.7rem" }}>
                                  {translateSymptom(s, t)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {log.notes && String(log.notes).trim() && (
                          <div
                            className="mt-3 p-2 p-md-3 rounded-3 small text-muted fst-italic"
                            style={{ background: "rgba(248, 250, 252, 0.9)", border: "1px solid rgba(148, 163, 184, 0.2)" }}
                          >
                            <i className="ri-file-text-line me-1 text-primary" aria-hidden />
                            {log.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        ))}
    </Container>
  );
};

export default PatientVitalsHistory;
