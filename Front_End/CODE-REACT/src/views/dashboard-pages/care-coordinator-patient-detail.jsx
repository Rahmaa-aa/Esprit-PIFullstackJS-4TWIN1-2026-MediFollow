import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Row, Col, Spinner, Alert, Table, Badge } from "react-bootstrap";
import Card from "../../components/Card";
import A11yToolbar from "../../components/A11yToolbar";
import { departmentApi } from "../../services/api";
import {
  getIntakeHistoryByDate,
  formatSlotTimeLocal,
} from "../../utils/medicationReminders";
import { formatMedicationFrequencyDisplay } from "../../utils/medicationFrequencyLabel";

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
      weekday: "short",
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
    }).format(d);
  } catch {
    return "—";
  }
}

const CareCoordinatorPatientDetail = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [user, setUser] = useState(null);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dateLocale = useMemo(() => dateLocaleFromI18n(i18n.language), [i18n.language]);
  const fmtDate = useCallback((ymd) => formatDisplayDate(ymd, dateLocale), [dateLocale]);
  const fmtDateTime = useCallback((iso) => formatDateTime(iso, dateLocale), [dateLocale]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    let u = null;
    try {
      const raw = localStorage.getItem("adminUser");
      u = raw ? JSON.parse(raw) : null;
    } catch {
      u = null;
    }
    if (!token || u?.role !== "carecoordinator") {
      navigate("/auth/sign-in", { replace: true });
      return;
    }
    setUser(u);
  }, [navigate]);

  useEffect(() => {
    if (!user || !patientId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await departmentApi.coordinatorPatientHistory(patientId);
        if (!cancelled) setPayload(res);
      } catch (e) {
        if (!cancelled) setError(e?.message || t("careCoordinatorPatientDetail.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, patientId, t]);

  const patient = payload?.patient;
  const displayName =
    patient && `${patient.firstName || ""} ${patient.lastName || ""}`.trim()
      ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim()
      : patient?.email || "—";

  const healthLogs = Array.isArray(payload?.healthLogs) ? payload.healthLogs : [];
  const medications = Array.isArray(payload?.medications) ? payload.medications : [];

  if (!user) return null;

  return (
    <>
      <A11yToolbar />
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Card.Header.Title>
                <h4 className="card-title mb-1">{t("careCoordinatorPatientDetail.pageTitle", { name: displayName })}</h4>
                {patient?.email ? <p className="text-muted small mb-3">{patient.email}</p> : null}
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
                    onClick={() =>
                      window.medifollow?.startCall?.(String(patient._id || patient.id), {
                        peerName: displayName,
                        peerRole: "patient",
                        video: true,
                      })
                    }
                  >
                    <i className="ri-vidicon-fill" />
                    {t("chat.data.videoCall", "Video Call")}
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm bg-white"
                    onClick={() =>
                      window.medifollow?.startCall?.(String(patient._id || patient.id), {
                        peerName: displayName,
                        peerRole: "patient",
                        video: false,
                      })
                    }
                  >
                    <i className="ri-phone-fill" />
                    {t("chat.data.voiceCall", "Audio Call")}
                  </Button>
                </div>
              </Card.Header.Title>
              <Link to="/dashboard-pages/care-coordinator-patients" className="btn btn-outline-secondary btn-sm align-self-start">
                {t("careCoordinatorPatientDetail.backList")}
              </Link>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" />
                  <p className="mt-2 text-muted mb-0">{t("careCoordinatorPatientDetail.loading")}</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <>
                  <h6 className="mb-3">{t("careCoordinatorPatientDetail.sectionVitals")}</h6>
                  {healthLogs.length === 0 ? (
                    <p className="text-muted small">{t("careCoordinatorPatientDetail.noVitals")}</p>
                  ) : (
                    <div className="table-responsive mb-4">
                      <Table size="sm" bordered hover className="small">
                        <thead>
                          <tr>
                            <th>{t("careCoordinatorPatientDetail.colDate")}</th>
                            <th>{t("careCoordinatorPatientDetail.colBP")}</th>
                            <th>{t("careCoordinatorPatientDetail.colHR")}</th>
                            <th>{t("careCoordinatorPatientDetail.colTemp")}</th>
                            <th>{t("careCoordinatorPatientDetail.colSpO2")}</th>
                            <th>{t("careCoordinatorPatientDetail.colWeight")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {healthLogs.map((log) => {
                            const v = log.vitals || {};
                            const day = log.date && /^\d{4}-\d{2}-\d{2}$/.test(String(log.date))
                              ? fmtDate(String(log.date).slice(0, 10))
                              : fmtDateTime(log.recordedAt || log.createdAt);
                            return (
                              <tr key={log._id}>
                                <td>{day}</td>
                                <td>
                                  {v.bloodPressureSystolic != null || v.bloodPressureDiastolic != null
                                    ? `${v.bloodPressureSystolic ?? "—"}/${v.bloodPressureDiastolic ?? "—"}`
                                    : "—"}
                                </td>
                                <td>{v.heartRate != null ? v.heartRate : "—"}</td>
                                <td>{v.temperature != null ? v.temperature : "—"}</td>
                                <td>{v.oxygenSaturation != null ? v.oxygenSaturation : "—"}</td>
                                <td>{v.weight != null ? v.weight : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  )}

                  <h6 className="mb-3">{t("careCoordinatorPatientDetail.sectionMeds")}</h6>
                  {medications.length === 0 ? (
                    <p className="text-muted small">{t("careCoordinatorPatientDetail.noMeds")}</p>
                  ) : (
                    medications.map((med) => {
                      const freqLabel = formatMedicationFrequencyDisplay(med.frequency, t);
                      const intakeByDay = getIntakeHistoryByDate(med);
                      return (
                        <Card key={med._id} className="mb-3 border shadow-sm">
                          <Card.Body>
                            <div className="d-flex flex-wrap justify-content-between gap-2 align-items-start">
                              <div>
                                <strong>{med.name}</strong>
                                {med.dosage ? <span className="text-muted ms-2">{med.dosage}</span> : null}
                                <div className="small text-muted mt-1">
                                  {freqLabel}
                                  {med.startDate ? (
                                    <span className="ms-2">
                                      {t("careCoordinatorPatientDetail.from")} {med.startDate}
                                    </span>
                                  ) : null}
                                  {med.endDate ? (
                                    <span className="ms-2">
                                      {t("careCoordinatorPatientDetail.to")} {med.endDate}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              {med.isActive === false ? <Badge bg="secondary">{t("careCoordinatorPatientDetail.inactive")}</Badge> : null}
                            </div>
                            {intakeByDay.length === 0 ? (
                              <p className="small text-muted mb-0 mt-2">{t("careCoordinatorPatientDetail.noIntakes")}</p>
                            ) : (
                              <ul className="list-unstyled small mb-0 mt-3">
                                {intakeByDay.map(({ date, slots }) => (
                                  <li key={date} className="mb-2">
                                    <div className="fw-semibold">{fmtDate(date)}</div>
                                    <ul className="list-unstyled ps-2 mb-0 text-muted">
                                      {slots.map((s) => (
                                        <li key={`${date}-${s.index}`}>
                                          {s.label}
                                          {s.recordedAt ? (
                                            <span className="text-dark ms-1">— {formatSlotTimeLocal(s.recordedAt)}</span>
                                          ) : null}
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
                    })
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CareCoordinatorPatientDetail;
