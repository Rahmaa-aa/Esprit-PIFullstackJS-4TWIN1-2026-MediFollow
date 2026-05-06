import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import Card from "../../components/Card";
import { medicationApi } from "../../services/api";
import {
  localDateStringYMD,
  isMedicationPastEndDate,
  getIntakeHistoryByDate,
  formatSlotTimeLocal,
} from "../../utils/medicationReminders";
import { formatMedicationFrequencyDisplay } from "../../utils/medicationFrequencyLabel";

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

const PatientMedicationHistory = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dateLocale = useMemo(() => dateLocaleFromI18n(i18n.language), [i18n.language]);
  const fmt = useCallback((ymd) => formatDisplayDate(ymd, dateLocale), [dateLocale]);
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

  const [medications, setMedications] = useState([]);
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
        const meds = await medicationApi.getByPatient(pid);
        setMedications(Array.isArray(meds) ? meds : []);
      } catch (e) {
        console.error(e);
        setLoadError(true);
        setMedications([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pid]);

  const todayYmd = localDateStringYMD();

  /** Tous les traitements : en cours d’abord, puis terminés (fin la plus récente en premier). Toutes les dates de prise sont listées. */
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

  if (!patientUser) {
    return null;
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col>
          <Link to="/dashboard-pages/patient-dashboard" className="text-decoration-none small d-inline-flex align-items-center gap-1">
            <i className="ri-arrow-left-line"></i>
            {t("patientMedicationHistory.backToDashboard")}
          </Link>
          <h4 className="text-primary fw-bold mt-2 mb-0">
            <i className="ri-history-line me-2"></i>
            {t("patientMedicationHistory.title")}
          </h4>
          <p className="text-muted small mb-0 mt-1">{t("patientMedicationHistory.intro")}</p>
        </Col>
      </Row>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" aria-hidden="true" />
        </div>
      )}

      {!loading && loadError && (
        <Alert variant="danger">{t("patientMedicationHistory.loadError")}</Alert>
      )}

      {!loading && !loadError && sortedMedications.length === 0 && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center text-muted py-5">
            {t("patientMedicationHistory.empty")}
          </Card.Body>
        </Card>
      )}

      {!loading &&
        !loadError &&
        sortedMedications.map((m) => {
          const intakeByDay = getIntakeHistoryByDate(m);
          const endStr = m.endDate ? String(m.endDate).slice(0, 10) : "";
          const startStr = m.startDate ? String(m.startDate).slice(0, 10) : "";
          const isEnded = isMedicationPastEndDate(m, todayYmd);
          return (
            <Card key={m._id} className="border-0 shadow-sm mb-3">
              <Card.Body>
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <h6 className="fw-bold text-primary mb-1">{m.name}</h6>
                    <div className="small text-muted">
                      {m.dosage && <span className="me-2">{m.dosage}</span>}
                      <span>{formatMedicationFrequencyDisplay(m.frequency, t)}</span>
                      {m.prescribedBy && (
                        <span className="ms-2">{t("patientMedicationHistory.prescribedBy", { name: m.prescribedBy })}</span>
                      )}
                    </div>
                  </div>
                  <span className={`badge align-self-start ${isEnded ? "bg-secondary" : "bg-success"}`}>
                    {isEnded ? (
                      t("patientMedicationHistory.endedOn", {
                        date: endStr ? fmt(endStr) : t("patientMedicationHistory.dash"),
                      })
                    ) : endStr ? (
                      t("patientMedicationHistory.ongoingWithEnd", { date: fmt(endStr) })
                    ) : (
                      t("patientMedicationHistory.ongoing")
                    )}
                  </span>
                </div>
                {(startStr || endStr) && (
                  <p className="small text-muted mb-2 mb-md-3">
                    {t("patientMedicationHistory.periodPrefix")}{" "}
                    {startStr ? fmt(startStr) : t("patientMedicationHistory.dash")}
                    {endStr ? ` → ${fmt(endStr)}` : ""}
                  </p>
                )}
                {m.notes && (
                  <p className="small text-muted fst-italic mb-0">
                    {t("patientMedicationHistory.notePrefix")} {m.notes}
                  </p>
                )}

                <div className="mt-3 pt-3 border-top">
                  <h6 className="small fw-bold text-uppercase text-muted mb-2">
                    {t("patientMedicationHistory.intakeTracking")}
                  </h6>
                  {intakeByDay.length === 0 ? (
                    <p className="small text-muted mb-0">{t("patientMedicationHistory.noIntakesInPeriod")}</p>
                  ) : (
                    <ul className="list-unstyled small mb-0">
                      {intakeByDay.map(({ date, slots }) => (
                        <li key={date} className="mb-3">
                          <div className="fw-semibold mb-1">{fmt(date)}</div>
                          <ul className="list-unstyled ps-2 mb-0 text-muted">
                            {slots.map((s) => (
                              <li key={`${date}-${s.index}`}>
                                {s.label}
                                {s.recordedAt ? (
                                  <span className="text-dark ms-1">— {formatSlotTimeLocal(s.recordedAt)}</span>
                                ) : (
                                  <span className="text-muted fst-italic ms-1">
                                    {t("patientMedicationHistory.timeNotRecorded")}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card.Body>
            </Card>
          );
        })}
    </Container>
  );
};

export default PatientMedicationHistory;
