import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import Card from "../../components/Card";
import VitalMetricTile, { hrStatus, bpStatus, o2Status, tempStatus, weightStatus } from "../../components/VitalMetricTile";
import { healthLogApi } from "../../services/api";
import { translateSymptom } from "../../utils/symptomLabels";

const VITALS_TZ = "Africa/Tunis";

function dateLocaleFromI18n(lang) {
  const base = String(lang || "en").split("-")[0];
  if (base === "fr") return "fr-FR";
  if (base === "ar") return "ar";
  return "en-US";
}

function formatDisplayDate(ymd, locale) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  try {
    return new Date(`${ymd}T12:00:00`).toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return ymd;
  }
}

function formatDateTime(iso, locale) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(locale, {
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

function moodMeta(mood, t) {
  if (mood === "good") return { icon: "ri-shield-check-line", label: t("patientDashboard.moodGood"), color: "#28a745" };
  if (mood === "fair") return { icon: "ri-scales-3-line", label: t("patientDashboard.moodFair"), color: "#fd7e14" };
  if (mood === "poor") return { icon: "ri-first-aid-kit-line", label: t("patientDashboard.moodPoor"), color: "#dc3545" };
  return { icon: null, label: t("patientDashboard.moodDash"), color: "#6c757d" };
}

function riskBadgeClass(score) {
  if (score >= 50) return "bg-danger";
  if (score >= 25) return "bg-warning text-dark";
  return "bg-success";
}

const PatientVitalsHistory = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dateLocale = useMemo(() => dateLocaleFromI18n(i18n.language), [i18n.language]);
  const fmtDate = useCallback((ymd) => formatDisplayDate(ymd, dateLocale), [dateLocale]);
  const fmtDateTime = useCallback((iso) => formatDateTime(iso, dateLocale), [dateLocale]);
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
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!patientUser) {
      navigate("/auth/sign-in", { replace: true });
    }
  }, [patientUser, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!pid) return;
      setLoading(true);
      setLoadError(false);
      try {
        const [logs, latest] = await Promise.all([
          healthLogApi.getHistory(pid),
          healthLogApi.getLatest(pid).catch(() => null),
        ]);
        setHistory(Array.isArray(logs) ? logs : []);
        setLatestLog(latest && typeof latest === "object" ? latest : null);
      } catch (e) {
        console.error(e);
        setLoadError(true);
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
              const timestamp = log.recordedAt || log.createdAt;
              if (!timestamp) return null;
              const d = new Date(timestamp);
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
  const hr = hrStatus(vSummary.heartRate, t);
  const bp = bpStatus(vSummary.bloodPressureSystolic, t);
  const o2 = o2Status(vSummary.oxygenSaturation, t);
  const tp = tempStatus(vSummary.temperature, t);

  if (!patientUser) {
    return null;
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col>
          <Link to="/dashboard-pages/patient-dashboard" className="text-decoration-none small d-inline-flex align-items-center gap-1">
            <i className="ri-arrow-left-line"></i>
            {t("patientVitalsHistory.backToDashboard")}
          </Link>
          <h4 className="text-primary fw-bold mt-2 mb-0">
            <i className="ri-heart-pulse-line me-2"></i>
            {t("patientVitalsHistory.title")}
          </h4>
          <p className="text-muted small mb-0 mt-1">{t("patientVitalsHistory.intro")}</p>
        </Col>
      </Row>

      {!loading && !loadError && (summaryLog || groupedByDay.length > 0) && (
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
                <h6 className="mb-0 fw-bold text-primary">{t("patientVitalsHistory.lastReadingTitle")}</h6>
                <small className="text-muted">{t("patientVitalsHistory.lastReadingSubtitle")}</small>
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
                {fmtDateTime(summaryLog.recordedAt || summaryLog.createdAt)}
              </span>
            )}
          </div>
          <Card.Body className="p-3 p-md-4">
            <Row className="g-3">
              <Col sm={6} xl={3}>
                <VitalMetricTile
                  icon="ri-heart-pulse-fill"
                  accent="#dc3545"
                  title={t("patientVitalsHistory.tileHR")}
                  value={vSummary.heartRate}
                  unit="bpm"
                  status={hr}
                  noDataMsg={t("patientVitalsHistory.noDataHr")}
                />
              </Col>
              <Col sm={6} xl={3}>
                <VitalMetricTile
                  icon="ri-drop-fill"
                  accent="#089bab"
                  title={t("patientVitalsHistory.tileBP")}
                  value={vSummary.bloodPressureSystolic ? `${vSummary.bloodPressureSystolic}/${vSummary.bloodPressureDiastolic}` : null}
                  unit="mmHg"
                  status={bp}
                  noDataMsg={t("patientVitalsHistory.noDataBp")}
                />
              </Col>
              <Col sm={6} xl={3}>
                <VitalMetricTile
                  icon="ri-lungs-fill"
                  accent="#6f42c1"
                  title={t("patientVitalsHistory.tileO2")}
                  value={vSummary.oxygenSaturation}
                  unit="%"
                  status={o2}
                  noDataMsg={t("patientVitalsHistory.noDataO2")}
                />
              </Col>
              <Col sm={6} xl={3}>
                <VitalMetricTile
                  icon="ri-temp-hot-fill"
                  accent="#fd7e14"
                  title={t("patientVitalsHistory.tileTemp")}
                  value={vSummary.temperature}
                  unit="°C"
                  status={tp}
                  noDataMsg={t("patientVitalsHistory.noDataTemp")}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" aria-hidden="true" />
        </div>
      )}

      {!loading && loadError && (
        <Alert variant="danger">{t("patientVitalsHistory.loadError")}</Alert>
      )}

      {!loading && !loadError && groupedByDay.length === 0 && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center text-muted py-5">{t("patientVitalsHistory.empty")}</Card.Body>
        </Card>
      )}

      {!loading &&
        !loadError &&
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
              <h6 className="fw-bold text-primary mb-0">{fmtDate(date)}</h6>
            </div>
            <Card.Body className="p-3 p-md-4">
              {logs.map((log, idx) => {
                const v = log.vitals || {};
                const mood = moodMeta(log.mood, t);
                const logTime = log.recordedAt || log.createdAt;
                const hr = hrStatus(v.heartRate, t);
                const bp = bpStatus(v.bloodPressureSystolic, t);
                const o2 = o2Status(v.oxygenSaturation, t);
                const tp = tempStatus(v.temperature, t);
                const wt = weightStatus(v.weight, t);
                const pain = log.painLevel ?? 0;
                return (
                  <div
                    key={log._id || `${date}-${logTime}`}
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
                          {fmtDateTime(logTime)}
                        </span>
                      </div>
                      <div className="d-flex flex-wrap gap-1 align-items-center">
                        <span className={`badge ${riskBadgeClass(log.riskScore ?? 0)}`} style={{ fontSize: "0.72rem" }}>
                          {t("patientVitalsHistory.riskScore", { score: log.riskScore ?? 0 })}
                        </span>
                        {log.flagged && (
                          <span className="badge bg-danger" style={{ fontSize: "0.72rem" }}>
                            <i className="ri-alert-line me-1" aria-hidden />
                            {t("patientVitalsHistory.watchFlag")}
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
                            title={t("patientVitalsHistory.tileHR")}
                            value={v.heartRate}
                            unit="bpm"
                            status={hr}
                            noDataMsg={t("patientVitalsHistory.dash")}
                          />
                        </Col>
                        <Col>
                          <VitalMetricTile
                            icon="ri-drop-fill"
                            accent="#089bab"
                            title={t("patientVitalsHistory.tileBP")}
                            value={
                              v.bloodPressureSystolic != null || v.bloodPressureDiastolic != null
                                ? `${v.bloodPressureSystolic ?? t("patientVitalsHistory.dash")}/${v.bloodPressureDiastolic ?? t("patientVitalsHistory.dash")}`
                                : null
                            }
                            unit="mmHg"
                            status={bp}
                            noDataMsg={t("patientVitalsHistory.dash")}
                          />
                        </Col>
                        <Col>
                          <VitalMetricTile
                            icon="ri-lungs-fill"
                            accent="#6f42c1"
                            title={t("patientVitalsHistory.tileO2")}
                            value={v.oxygenSaturation}
                            unit="%"
                            status={o2}
                            noDataMsg={t("patientVitalsHistory.dash")}
                          />
                        </Col>
                        <Col>
                          <VitalMetricTile
                            icon="ri-temp-hot-fill"
                            accent="#fd7e14"
                            title={t("patientVitalsHistory.tileTemp")}
                            value={v.temperature}
                            unit="°C"
                            status={tp}
                            noDataMsg={t("patientVitalsHistory.dash")}
                          />
                        </Col>
                        <Col>
                          <VitalMetricTile
                            icon="ri-scales-3-fill"
                            accent="#64748b"
                            title={t("patientVitalsHistory.tileWeight")}
                            value={v.weight}
                            unit="kg"
                            status={wt}
                            noDataMsg={t("patientVitalsHistory.dash")}
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
                                {t("patientVitalsHistory.feeling")}
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
                                {t("patientVitalsHistory.pain")}
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
