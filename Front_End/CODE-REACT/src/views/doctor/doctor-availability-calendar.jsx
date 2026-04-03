import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Col, Container, Form, Row, Button, Alert, Spinner, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { doctorAvailabilityApi, appointmentApi } from "../../services/api";

function daysInMonth(yearMonth) {
  const [y, m] = yearMonth.split("-").map(Number);
  if (!y || !m) return 31;
  return new Date(y, m, 0).getDate();
}

function monthDates(yearMonth) {
  const n = daysInMonth(yearMonth);
  const out = [];
  for (let d = 1; d <= n; d += 1) {
    const ds = String(d).padStart(2, "0");
    out.push(`${yearMonth}-${ds}`);
  }
  return out;
}

function normalizeDateKey(d) {
  if (!d || typeof d !== "string") return "";
  const part = d.trim().split("T")[0];
  const segs = part.split("-");
  if (segs.length !== 3) return part;
  return `${segs[0]}-${segs[1].padStart(2, "0")}-${segs[2].padStart(2, "0")}`;
}

function nt(t) {
  if (!t && t !== 0) return "";
  const p = String(t).trim().split(":");
  if (p.length < 2) return "";
  const h = parseInt(p[0], 10);
  const m = parseInt(p[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Regroupe des créneaux 30 min consécutifs en plages [de, à[ pour l’affichage (données anciennes). */
function timesToRanges(times) {
  if (!Array.isArray(times) || times.length === 0) return [];
  const sorted = [...new Set(times.map(nt).filter(Boolean))].sort();
  if (sorted.length === 0) return [];
  const toMin = (x) => {
    const [h, m] = x.split(":").map((n) => parseInt(n, 10));
    return h * 60 + m;
  };
  const toStr = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
  const ranges = [];
  let start = sorted[0];
  let prevMin = toMin(sorted[0]);
  for (let i = 1; i < sorted.length; i += 1) {
    const curMin = toMin(sorted[i]);
    if (curMin - prevMin !== 30) {
      ranges.push({ from: start, to: toStr(prevMin + 30) });
      start = sorted[i];
    }
    prevMin = curMin;
  }
  ranges.push({ from: start, to: toStr(prevMin + 30) });
  return ranges;
}

/** Grille calendrier : cases null = hors mois, sinon clé YYYY-MM-DD (lundi = 1ère colonne). */
function calendarCells(yearMonth) {
  const [y, m] = yearMonth.split("-").map(Number);
  if (!y || !m) return [];
  const first = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0).getDate();
  const pad = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < pad; i += 1) cells.push(null);
  for (let d = 1; d <= lastDay; d += 1) {
    cells.push(`${yearMonth}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const emptyRange = () => ({ from: "09:00", to: "12:00" });

function patientLabel(p, fallbackPatient) {
  if (p && typeof p === "object") {
    return `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.email || fallbackPatient;
  }
  return fallbackPatient;
}

/** Regroupe les RDV API par date YYYY-MM-DD pour le mois affiché. */
function groupAppointmentsByDate(rows, ds, fallbackPatient) {
  const map = {};
  ds.forEach((d) => {
    map[d] = [];
  });
  if (!Array.isArray(rows)) return map;
  rows.forEach((row) => {
    const key = normalizeDateKey(row.date);
    if (!key || map[key] === undefined) return;
    map[key].push({
      _id: row._id,
      title: row.title || "",
      time: row.time || "",
      patientLabel: patientLabel(row.patientId, fallbackPatient),
    });
  });
  return map;
}

const DoctorAvailabilityCalendar = () => {
  const { t, i18n } = useTranslation();
  const [doctorUser] = useState(() => {
    try {
      const s = localStorage.getItem("doctorUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const now = new Date();
  const defaultYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [yearMonth, setYearMonth] = useState(defaultYm);
  /** @type {Record<string, { from: string; to: string }[]>} */
  const [rangesByDate, setRangesByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [savedSummary, setSavedSummary] = useState("");
  const [modalDate, setModalDate] = useState(null);
  /** @type {Record<string, { _id: string; title: string; time: string; patientLabel: string }[]>} */
  const [appointmentsByDate, setAppointmentsByDate] = useState({});

  const dates = useMemo(() => monthDates(yearMonth), [yearMonth]);
  const cells = useMemo(() => calendarCells(yearMonth), [yearMonth]);

  const fallbackPatient = t("doctorAvailabilityCalendar.fallbackPatient");

  const modalDateFormatted = useMemo(() => {
    if (!modalDate) return "";
    const y = modalDate.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(y)) return modalDate;
    try {
      const loc = i18n.language?.startsWith("ar") ? "ar-TN" : i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";
      return new Date(`${y}T12:00:00`).toLocaleDateString(loc, {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return y.split("-").reverse().join("/");
    }
  }, [modalDate, i18n.language]);

  const localToday = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const loadMonthIntoState = useCallback((raw, ds) => {
    const slots = Array.isArray(raw?.slots) ? raw.slots : [];
    const map = {};
    ds.forEach((d) => {
      map[d] = [];
    });
    slots.forEach((s) => {
      const key = normalizeDateKey(s?.date);
      if (!key || !ds.includes(key)) return;
      if (Array.isArray(s.ranges) && s.ranges.length > 0) {
        map[key] = s.ranges
          .map((r) => ({ from: nt(r.from), to: nt(r.to) }))
          .filter((r) => r.from && r.to && r.from < r.to);
      } else if (Array.isArray(s.times) && s.times.length > 0) {
        map[key] = timesToRanges(s.times);
      }
    });
    setRangesByDate(map);
  }, []);

  useEffect(() => {
    if (!doctorUser) return;
    let cancelled = false;
    const ds = monthDates(yearMonth);
    (async () => {
      setLoading(true);
      setError("");
      setSuccess(false);
      try {
        const [raw, appts] = await Promise.all([
          doctorAvailabilityApi.getMyMonth(yearMonth),
          appointmentApi.getConfirmedForDoctorMonth(yearMonth).catch(() => []),
        ]);
        if (!cancelled) {
          loadMonthIntoState(raw, ds);
          setAppointmentsByDate(groupAppointmentsByDate(appts, ds, fallbackPatient));
        }
      } catch (e) {
        if (!cancelled) setError(e.message || t("doctorAvailabilityCalendar.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doctorUser, yearMonth, loadMonthIntoState, t, fallbackPatient]);

  const shiftMonth = (delta) => {
    const [y, m] = yearMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setYearMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const rangesForModal = modalDate ? rangesByDate[modalDate] || [] : [];

  const updateModalRange = (index, field, value) => {
    if (!modalDate) return;
    setRangesByDate((prev) => {
      const list = [...(prev[modalDate] || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [modalDate]: list };
    });
  };

  const addModalRange = () => {
    if (!modalDate) return;
    setRangesByDate((prev) => ({
      ...prev,
      [modalDate]: [...(prev[modalDate] || []), emptyRange()],
    }));
  };

  const removeModalRange = (index) => {
    if (!modalDate) return;
    setRangesByDate((prev) => {
      const list = [...(prev[modalDate] || [])].filter((_, i) => i !== index);
      return { ...prev, [modalDate]: list };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!doctorUser) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    setSavedSummary("");
    try {
      const slots = [];
      dates.forEach((d) => {
        const ranges = (rangesByDate[d] || [])
          .map((r) => ({ from: nt(r.from), to: nt(r.to) }))
          .filter((r) => r.from && r.to && r.from < r.to);
        if (ranges.length) slots.push({ date: d, ranges });
      });
      if (slots.length === 0) {
        setError(t("doctorAvailabilityCalendar.needAtLeastOneSlot"));
        setSaving(false);
        return;
      }
      await doctorAvailabilityApi.saveMyMonth(yearMonth, slots);
      setSuccess(true);
      setSavedSummary(t("doctorAvailabilityCalendar.saveSuccessSummary", { count: slots.length }));
      const ds = monthDates(yearMonth);
      const [raw, appts] = await Promise.all([
        doctorAvailabilityApi.getMyMonth(yearMonth),
        appointmentApi.getConfirmedForDoctorMonth(yearMonth).catch(() => []),
      ]);
      loadMonthIntoState(raw, ds);
      setAppointmentsByDate(groupAppointmentsByDate(appts, ds, fallbackPatient));
      setModalDate(null);
    } catch (err) {
      const msg = err.message || t("doctorAvailabilityCalendar.saveErrorGeneric");
      if (err.status === 401 || err.status === 403) {
        setError(t("doctorAvailabilityCalendar.saveErrorAuthHint", { msg }));
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const modalAppointments = modalDate ? appointmentsByDate[modalDate] || [] : [];

  if (!doctorUser) {
    return (
      <Container className="py-5">
        <p className="text-muted text-center">{t("doctorAvailabilityCalendar.loginHint")}</p>
        <div className="text-center">
          <Link to="/auth/sign-in" className="btn btn-primary">
            {t("doctorMyPatients.signIn")}
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col>
          <Link to="/dashboard" className="text-decoration-none small d-inline-flex align-items-center gap-1">
            <i className="ri-arrow-left-line"></i>
            {t("doctorAvailabilityCalendar.back")}
          </Link>
          <h4 className="text-primary fw-bold mt-2 mb-0">
            <i className="ri-calendar-2-line me-2"></i>
            {t("doctorAvailabilityCalendar.title")}
          </h4>
          <p className="text-muted small mb-0 mt-1">{t("doctorAvailabilityCalendar.intro")}</p>
        </Col>
      </Row>

      <Row>
        <Col xl={11} lg={12}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <Card.Body className="p-4">
              <Form onSubmit={handleSave}>
                <Row className="g-3 align-items-end mb-4">
                  <Col md="auto" className="d-flex gap-2">
                    <Button type="button" variant="outline-secondary" size="sm" onClick={() => shiftMonth(-1)}>
                      <i className="ri-arrow-left-s-line"></i>
                    </Button>
                    <Button type="button" variant="outline-secondary" size="sm" onClick={() => shiftMonth(1)}>
                      <i className="ri-arrow-right-s-line"></i>
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Form.Label className="small fw-bold">{t("doctorAvailabilityCalendar.monthLabel")}</Form.Label>
                    <Form.Control type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)} />
                  </Col>
                  <Col md="auto">
                    <Button type="submit" variant="primary" disabled={saving || loading}>
                      {saving ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          {t("doctorAvailabilityCalendar.saving")}
                        </>
                      ) : (
                        <>
                          <i className="ri-save-line me-2"></i>
                          {t("doctorAvailabilityCalendar.saveMonth")}
                        </>
                      )}
                    </Button>
                  </Col>
                </Row>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && (
                  <Alert variant="success">
                    {t("doctorAvailabilityCalendar.saveSuccess")} {savedSummary}
                  </Alert>
                )}

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <div className="doctor-cal-wrap">
                    <div
                      className="d-grid text-center small fw-semibold text-muted mb-2"
                      style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}
                    >
                      {WEEKDAY_KEYS.map((k) => (
                        <div key={k} className="py-2">
                          {t(`doctorAvailabilityCalendar.weekdaysShort.${k}`)}
                        </div>
                      ))}
                    </div>
                    <div
                      className="d-grid"
                      style={{
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "8px",
                      }}
                    >
                      {cells.map((dateKey, idx) => {
                        if (!dateKey) {
                          return (
                            <div
                              key={`empty-${idx}`}
                              className="rounded-3 bg-light"
                              style={{ minHeight: 96, opacity: 0.35 }}
                            />
                          );
                        }
                        const isToday = dateKey === localToday;
                        const nPlages = (rangesByDate[dateKey] || []).length;
                        const rdv = appointmentsByDate[dateKey] || [];
                        const dayNum = parseInt(dateKey.split("-")[2], 10);
                        const hasRdv = rdv.length > 0;
                        return (
                          <button
                            key={dateKey}
                            type="button"
                            className={`doctor-cal-cell border-0 rounded-3 text-start p-2 w-100 ${
                              nPlages > 0 ? "doctor-cal-cell--active" : "bg-white"
                            } ${hasRdv ? "doctor-cal-cell--rdv" : ""}`}
                            style={{
                              minHeight: 112,
                              boxShadow: "0 1px 4px rgba(15,23,42,0.08)",
                              outline: isToday ? "2px solid #089bab" : undefined,
                              cursor: "pointer",
                            }}
                            onClick={() => setModalDate(dateKey)}
                          >
                            <div className="d-flex flex-column h-100" style={{ minHeight: 96 }}>
                              <span
                                className={`fw-bold ${isToday ? "text-primary" : "text-dark"}`}
                                style={{ fontSize: "1.05rem" }}
                              >
                                {dayNum}
                              </span>
                              <div
                                className="flex-grow-1 mt-1"
                                style={{ fontSize: "0.62rem", lineHeight: 1.2, maxHeight: 44, overflow: "hidden" }}
                              >
                                {rdv.slice(0, 2).map((a) => (
                                  <div key={a._id} className="text-truncate text-dark" title={`${a.time} ${a.patientLabel}`}>
                                    <span className="text-warning me-1">●</span>
                                    {a.time} {a.patientLabel}
                                  </div>
                                ))}
                                {rdv.length > 2 && (
                                  <div className="text-muted">
                                    {t("doctorAvailabilityCalendar.moreAppointments", { count: rdv.length - 2 })}
                                  </div>
                                )}
                              </div>
                              <div className="d-flex flex-wrap gap-1 mt-auto pt-1">
                                {nPlages > 0 && (
                                  <span
                                    className="badge rounded-pill"
                                    style={{
                                      fontSize: "0.6rem",
                                      background: "linear-gradient(135deg, #089bab, #0d9488)",
                                    }}
                                  >
                                    {nPlages}{" "}
                                    {nPlages === 1
                                      ? t("doctorAvailabilityCalendar.slotLabel")
                                      : t("doctorAvailabilityCalendar.slotsLabel")}
                                  </span>
                                )}
                                {hasRdv && (
                                  <span className="badge bg-warning text-dark rounded-pill" style={{ fontSize: "0.6rem" }}>
                                    {t("doctorAvailabilityCalendar.rdvBadge", { count: rdv.length })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={!!modalDate} onHide={() => setModalDate(null)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-primary fs-6">
            <i className="ri-time-line me-2"></i>
            {t("doctorAvailabilityCalendar.modalTitle", { date: modalDateFormatted })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalAppointments.length > 0 && (
            <div className="mb-4 p-3 rounded-3 border" style={{ background: "#fffbeb", borderColor: "#fcd34d" }}>
              <div className="small fw-bold text-dark mb-2">
                <i className="ri-calendar-check-line me-1"></i>
                {t("doctorAvailabilityCalendar.confirmedAppointmentsTitle")}
              </div>
              <ul className="list-unstyled mb-0 small">
                {modalAppointments.map((a) => (
                  <li key={a._id} className="mb-2">
                    <span className="fw-semibold">{a.time || "—"}</span> — {a.patientLabel}
                    {a.title && <span className="text-muted"> — {a.title}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="small text-muted mb-3">{t("doctorAvailabilityCalendar.modalHelp")}</p>
          {rangesForModal.length === 0 ? (
            <p className="text-muted small">{t("doctorAvailabilityCalendar.noSlotsClosed")}</p>
          ) : (
            rangesForModal.map((r, i) => (
              <Row key={i} className="g-2 align-items-end mb-3">
                <Col xs={5} md={4}>
                  <Form.Label className="small fw-bold">{t("doctorAvailabilityCalendar.from")}</Form.Label>
                  <Form.Control
                    type="time"
                    step={1800}
                    value={r.from || ""}
                    onChange={(e) => updateModalRange(i, "from", e.target.value)}
                  />
                </Col>
                <Col xs={5} md={4}>
                  <Form.Label className="small fw-bold">{t("doctorAvailabilityCalendar.to")}</Form.Label>
                  <Form.Control
                    type="time"
                    step={1800}
                    value={r.to || ""}
                    onChange={(e) => updateModalRange(i, "to", e.target.value)}
                  />
                </Col>
                <Col xs="auto">
                  <Button type="button" variant="outline-danger" size="sm" onClick={() => removeModalRange(i)}>
                    <i className="ri-delete-bin-line"></i>
                  </Button>
                </Col>
              </Row>
            ))
          )}
          <Button type="button" variant="outline-primary" size="sm" onClick={addModalRange}>
            <i className="ri-add-line me-1"></i>
            {t("doctorAvailabilityCalendar.addRange")}
          </Button>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setModalDate(null)}>
            {t("doctorAvailabilityCalendar.close")}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .doctor-cal-cell--active {
          background: linear-gradient(160deg, #ecfdf5 0%, #f0fdfa 100%);
        }
        .doctor-cal-cell--rdv {
          box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.35);
        }
        .doctor-cal-cell:hover {
          filter: brightness(0.98);
        }
      `}</style>
    </Container>
  );
};

export default DoctorAvailabilityCalendar;
