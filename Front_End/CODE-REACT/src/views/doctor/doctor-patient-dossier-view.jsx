import React, { useEffect, useMemo, useState } from "react";
import { Alert, Card, Col, Row, Spinner, Table } from "react-bootstrap";
import { healthLogApi, medicationApi, appointmentApi } from "../../services/api";
import VitalMetricTile, { hrStatus, bpStatus, o2Status, tempStatus, weightStatus } from "../../components/VitalMetricTile";
import {
  localDateStringYMD,
  isMedicationPastEndDate,
  getIntakeHistoryByDate,
  formatSlotTimeLocal,
} from "../../utils/medicationReminders";
import "./doctor-patient-dossier.css";

const VITALS_TZ = "Africa/Tunis";

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
    }).format(d);
  } catch {
    return "—";
  }
}

function formatDisplayDateYmd(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(String(ymd))) return ymd;
  try {
    return new Date(`${String(ymd).slice(0, 10)}T12:00:00`).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return ymd;
  }
}

function formatLogVitalsShort(log) {
  const v = log?.vitals || {};
  const parts = [];
  if (v.heartRate != null) parts.push(`FC ${v.heartRate}`);
  if (v.bloodPressureSystolic != null) {
    parts.push(`TA ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic ?? "—"}`);
  }
  if (v.oxygenSaturation != null) parts.push(`SpO₂ ${v.oxygenSaturation}%`);
  if (v.temperature != null && v.temperature !== "") parts.push(`T° ${v.temperature}`);
  if (v.weight != null && v.weight !== "") parts.push(`Poids ${v.weight} kg`);
  return parts.length ? parts.join(" · ") : "—";
}

function isRiskStatus(status) {
  if (!status) return false;
  if (status.label === "No data" || status.label === "—" || status.label === "Non mesuré") return false;
  return status.color === "#dc3545" || status.color === "#fd7e14";
}

function buildDoctorAlerts(latestLog, v) {
  const out = [];
  if (!latestLog) return out;

  const score = typeof latestLog.riskScore === "number" ? latestLog.riskScore : 0;
  if (latestLog.flagged) {
    out.push({
      severity: "danger",
      text: `Score de risque global : ${score}/100 — vigilance clinique recommandée.`,
    });
  } else if (score >= 25) {
    out.push({
      severity: "warning",
      text: `Score de risque modéré : ${score}/100.`,
    });
  }

  if (typeof latestLog.painLevel === "number" && latestLog.painLevel >= 7) {
    out.push({
      severity: "danger",
      text: `Douleur déclarée : ${latestLog.painLevel}/10.`,
    });
  } else if (typeof latestLog.painLevel === "number" && latestLog.painLevel >= 5) {
    out.push({
      severity: "warning",
      text: `Douleur modérée : ${latestLog.painLevel}/10.`,
    });
  }

  if (latestLog.mood === "poor") {
    out.push({ severity: "warning", text: "Ressenti du patient : difficile." });
  } else if (latestLog.mood === "fair") {
    out.push({ severity: "warning", text: "Ressenti du patient : modéré." });
  }

  if (v) {
    const hr = hrStatus(v.heartRate);
    if (v.heartRate != null && isRiskStatus(hr)) {
      out.push({
        severity: hr.color === "#dc3545" ? "danger" : "warning",
        text: `Fréquence cardiaque : ${hr.label}`,
      });
    }
    const bp = bpStatus(v.bloodPressureSystolic);
    if (v.bloodPressureSystolic != null && isRiskStatus(bp)) {
      out.push({
        severity: bp.color === "#dc3545" ? "danger" : "warning",
        text: `Tension (systolique) : ${bp.label}`,
      });
    }
    const o2 = o2Status(v.oxygenSaturation);
    if (v.oxygenSaturation != null && isRiskStatus(o2)) {
      out.push({
        severity: o2.color === "#dc3545" ? "danger" : "warning",
        text: `Saturation O₂ : ${o2.label}`,
      });
    }
    const tp = tempStatus(v.temperature);
    if (v.temperature != null && v.temperature !== "" && isRiskStatus(tp)) {
      out.push({
        severity: tp.color === "#dc3545" ? "danger" : "warning",
        text: `Température : ${tp.label}`,
      });
    }
  }

  return out;
}

function SectionCard({ icon, title, children, className = "" }) {
  return (
    <Card className={`dossier-section-card mb-4 ${className}`}>
      <Card.Header className="py-3 px-4 d-flex align-items-center gap-3">
        <div className="dossier-section-icon d-flex align-items-center justify-content-center flex-shrink-0">
          <i className={`${icon} fs-5`} />
        </div>
        <span className="fw-bold text-dark mb-0">{title}</span>
      </Card.Header>
      <Card.Body className="px-4 pb-4 pt-1">{children}</Card.Body>
    </Card>
  );
}

/**
 * Corps du dossier patient : constantes, traitements, historiques, RDV.
 */
export default function DoctorPatientDossierView({ patient }) {
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [latestLog, setLatestLog] = useState(null);
  const [medications, setMedications] = useState([]);
  const [healthHistory, setHealthHistory] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

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
        if (!cancelled) setDetailError(e.message || "Impossible de charger le dossier patient");
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
  }, [patient]);

  const vSummary = latestLog?.vitals || {};
  const hr = hrStatus(vSummary.heartRate);
  const bp = bpStatus(vSummary.bloodPressureSystolic);
  const o2 = o2Status(vSummary.oxygenSaturation);
  const tp = tempStatus(vSummary.temperature);
  const wt = weightStatus(vSummary.weight);

  const doctorAlerts = buildDoctorAlerts(latestLog, vSummary);
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

  if (!patient) return null;

  return (
    <>
      {detailLoading && (
        <Card className="dossier-section-card border-0 mb-4">
          <Card.Body className="py-5 text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted small mb-0">Chargement des constantes, traitements et historiques…</p>
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
          <SectionCard icon="ri-heart-pulse-fill" title="Dernières constantes vitales">
            {!latestLog ? (
              <Alert variant="light" className="border text-muted mb-0 rounded-3">
                <i className="ri-inbox-line me-2" />
                Aucun relevé de constantes pour ce patient.
              </Alert>
            ) : (
              <>
                {hasAnyAlert && (
                  <div className="mb-3">
                    {doctorAlerts.map((a, i) => (
                      <Alert
                        key={i}
                        variant={a.severity === "danger" ? "danger" : "warning"}
                        className="py-2 mb-2 rounded-3 border-0 shadow-sm"
                      >
                        <i className={`me-2 ${a.severity === "danger" ? "ri-alarm-warning-fill" : "ri-alert-line"}`} />
                        {a.text}
                      </Alert>
                    ))}
                  </div>
                )}

                {!hasAnyAlert && hasVitalMeasurements && (
                  <Alert variant="success" className="py-2 mb-3 rounded-3 border-0">
                    <i className="ri-shield-check-line me-2" />
                    Dernier relevé sans alerte automatique sur les seuils affichés.
                  </Alert>
                )}
                {!hasAnyAlert && !hasVitalMeasurements && (
                  <Alert variant="light" className="py-2 mb-3 border rounded-3 text-muted">
                    <i className="ri-information-line me-2" />
                    Dernier check-in sans mesures de constantes détaillées.
                  </Alert>
                )}

                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-3 dossier-recorded-bar">
                  <span className="small fw-semibold text-primary">
                    <i className="ri-time-line me-1" />
                    Relevé du
                  </span>
                  {(latestLog.recordedAt || latestLog.createdAt) && (
                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2">
                      {formatDateTime(latestLog.recordedAt || latestLog.createdAt)}
                    </span>
                  )}
                </div>

                <Row className="g-3 mb-2">
                  <Col sm={6} xl={4}>
                    <VitalMetricTile
                      icon="ri-heart-pulse-fill"
                      accent="#dc3545"
                      title="Fréquence cardiaque"
                      value={vSummary.heartRate}
                      unit="bpm"
                      status={hr}
                      noDataMsg="Non renseigné."
                    />
                  </Col>
                  <Col sm={6} xl={4}>
                    <VitalMetricTile
                      icon="ri-drop-fill"
                      accent="#089bab"
                      title="Tension artérielle"
                      value={
                        vSummary.bloodPressureSystolic
                          ? `${vSummary.bloodPressureSystolic}/${vSummary.bloodPressureDiastolic ?? "—"}`
                          : null
                      }
                      unit="mmHg"
                      status={bp}
                      noDataMsg="Non renseigné."
                    />
                  </Col>
                  <Col sm={6} xl={4}>
                    <VitalMetricTile
                      icon="ri-lungs-fill"
                      accent="#6f42c1"
                      title="Saturation O₂"
                      value={vSummary.oxygenSaturation}
                      unit="%"
                      status={o2}
                      noDataMsg="Non renseigné."
                    />
                  </Col>
                  <Col sm={6} xl={4}>
                    <VitalMetricTile
                      icon="ri-temp-hot-fill"
                      accent="#fd7e14"
                      title="Température"
                      value={vSummary.temperature}
                      unit="°C"
                      status={tp}
                      noDataMsg="Non renseigné."
                    />
                  </Col>
                  <Col sm={6} xl={4}>
                    <VitalMetricTile
                      icon="ri-scales-3-line"
                      accent="#198754"
                      title="Poids"
                      value={vSummary.weight}
                      unit="kg"
                      status={wt}
                      noDataMsg="Non renseigné."
                    />
                  </Col>
                </Row>

                {Array.isArray(latestLog.symptoms) && latestLog.symptoms.length > 0 && (
                  <div className="dossier-symptoms p-3 mt-2">
                    <div className="small fw-semibold text-primary mb-2">
                      <i className="ri-file-list-line me-1" />
                      Symptômes déclarés (dernier relevé)
                    </div>
                    <div className="small text-dark">{latestLog.symptoms.join(", ")}</div>
                  </div>
                )}
              </>
            )}
          </SectionCard>

          <SectionCard icon="ri-medicine-bottle-line" title="Traitements et médicaments">
            {sortedMedications.length === 0 ? (
              <p className="text-muted small mb-0">
                <i className="ri-medicine-bottle-line me-1 opacity-50" />
                Aucun traitement enregistré pour ce patient.
              </p>
            ) : (
              <div className="dossier-table-wrap">
                <Table responsive size="sm" hover className="align-middle bg-white mb-0">
                  <thead>
                    <tr>
                      <th>Médicament</th>
                      <th>Dosage</th>
                      <th>Fréquence</th>
                      <th>Prescrit par</th>
                      <th>Période</th>
                      <th>Statut</th>
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
                          <td>{m.frequency || "—"}</td>
                          <td>{m.prescribedBy || "—"}</td>
                          <td className="small text-muted">
                            {startStr ? formatDisplayDateYmd(startStr) : "—"}
                            {endStr ? ` → ${formatDisplayDateYmd(endStr)}` : ""}
                          </td>
                          <td>
                            <span className={`badge rounded-pill ${ended ? "bg-secondary" : "bg-success"}`}>
                              {ended ? "Terminé" : "En cours"}
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
            <SectionCard icon="ri-history-line" title="Historique des prises (récent)">
              <p className="text-muted small mb-4">
                Jours où le patient a indiqué une prise — jusqu’à 5 jours récents par traitement.
              </p>
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
                        <p className="small text-muted mb-0">Aucune prise enregistrée récemment.</p>
                      ) : (
                        <ul className="list-unstyled small mb-0">
                          {recentDays.map(({ date, slots }) => (
                            <li key={date} className="mb-3">
                              <span className="fw-medium text-primary">{formatDisplayDateYmd(date)}</span>
                              <ul className="list-unstyled ps-2 mb-0 mt-1 text-muted">
                                {slots.map((s) => (
                                  <li key={`${date}-${s.index}`}>
                                    {s.label}
                                    {s.recordedAt ? (
                                      <span className="text-dark ms-1">— {formatSlotTimeLocal(s.recordedAt)}</span>
                                    ) : (
                                      <span className="fst-italic ms-1">— heure non enregistrée</span>
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

          <SectionCard icon="ri-file-list-3-line" title="Historique des check-ins (30 derniers jours)">
            {recentCheckIns.length === 0 ? (
              <p className="text-muted small mb-0">Aucun autre relevé dans la période.</p>
            ) : (
              <div className="dossier-table-wrap">
                <Table responsive size="sm" className="align-middle bg-white mb-0">
                  <thead>
                    <tr>
                      <th>Date / heure</th>
                      <th>Constantes</th>
                      <th>Score</th>
                      <th>Douleur</th>
                      <th>Ressenti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCheckIns.map((log) => {
                      const lid = log._id || log.id;
                      const t = log.recordedAt || log.createdAt;
                      const score = typeof log.riskScore === "number" ? log.riskScore : "—";
                      return (
                        <tr key={lid}>
                          <td className="text-nowrap small">{formatDateTime(t)}</td>
                          <td className="small">{formatLogVitalsShort(log)}</td>
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
                          <td className="small text-capitalize">{log.mood || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </SectionCard>

          <SectionCard icon="ri-calendar-check-line" title="Prochains rendez-vous">
            {upcomingAppointments.length === 0 ? (
              <p className="text-muted small mb-0">Aucun rendez-vous à venir enregistré.</p>
            ) : (
              <ul className="list-unstyled small mb-0">
                {upcomingAppointments.map((a, idx) => {
                  const aid = a._id || a.id;
                  const last = idx === upcomingAppointments.length - 1;
                  return (
                    <li key={aid} className={`dossier-rdv-item p-3${last ? "" : " mb-3"}`}>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <span className="fw-semibold">{a.title || "Consultation"}</span>
                        <span className="text-muted">
                          {a.date ? formatDisplayDateYmd(a.date) : ""}
                          {a.time ? ` · ${a.time}` : ""}
                        </span>
                        {a.status && (
                          <span className="badge rounded-pill bg-primary ms-auto text-capitalize">{a.status}</span>
                        )}
                      </div>
                      {a.location && <div className="text-muted mt-2 small">{a.location}</div>}
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </>
      )}
    </>
  );
}
