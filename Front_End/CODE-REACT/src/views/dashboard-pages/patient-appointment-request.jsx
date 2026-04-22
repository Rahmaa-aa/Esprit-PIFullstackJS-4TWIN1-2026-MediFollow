import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { appointmentApi, patientApi, doctorApi } from "../../services/api";

function normalizePid(raw) {
  if (raw == null) return undefined;
  if (typeof raw === "object" && raw !== null && "$oid" in raw) return String(raw.$oid);
  return String(raw);
}

const PatientAppointmentRequest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const appointmentTypes = useMemo(
    () => [
      { value: "checkup", label: t("patientAppointmentRequest.typeCheckup") },
      { value: "lab", label: t("patientAppointmentRequest.typeLab") },
      { value: "specialist", label: t("patientAppointmentRequest.typeSpecialist") },
      { value: "imaging", label: t("patientAppointmentRequest.typeImaging") },
      { value: "physiotherapy", label: t("patientAppointmentRequest.typePhysiotherapy") },
    ],
    [t],
  );

  const [patientUser, setPatientUser] = useState(() => {
    try {
      const s = localStorage.getItem("patientUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const pid = normalizePid(patientUser?.id ?? patientUser?._id);
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [slotErrorCode, setSlotErrorCode] = useState("");

  const [form, setForm] = useState({
    title: "",
    type: "checkup",
    date: "",
    time: "",
    location: "",
    patientMessage: "",
    isVideoCall: false,
  });

  useEffect(() => {
    if (!patientUser) navigate("/auth/sign-in", { replace: true });
  }, [patientUser, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!pid) return;
      setLoadingDoctor(true);
      setError("");
      try {
        const team = await patientApi.getCareTeam(pid);
        const docId = team?.doctorId;
        if (docId) {
          const d = await doctorApi.getById(String(docId));
          setDoctor(d);
        } else {
          setDoctor(null);
        }
        const all = await appointmentApi.getByPatient(pid);
        setMyAppointments(Array.isArray(all) ? all : []);
      } catch (e) {
        console.error(e);
        setError(t("patientAppointmentRequest.loadError"));
      } finally {
        setLoadingDoctor(false);
      }
    };
    load();
  }, [pid]);

  const pendingList = myAppointments.filter((a) => a.status === "pending");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pid || !doctor) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    setSuggestedSlots([]);
    setSlotErrorCode("");
    try {
      const doctorName = doctor.lastName
        ? t("patientAppointmentRequest.doctorDisplay", {
            name: `${doctor.firstName || ""} ${doctor.lastName}`.trim(),
          })
        : doctor.firstName || t("patientAppointmentRequest.doctorFallback");
      await appointmentApi.create({
        patientId: pid,
        doctorId: String(doctor._id || doctor.id),
        doctorName,
        title: form.title,
        type: form.type,
        date: form.date,
        time: form.time || "",
        location: form.location || "",
        patientMessage: form.patientMessage || "",
        isVideoCall: form.isVideoCall,
        notes: "",
        status: "pending",
      });
      setSuccess(true);
      setSlotErrorCode("");
      setForm({ title: "", type: "checkup", date: "", time: "", location: "", patientMessage: "", isVideoCall: false });
      const all = await appointmentApi.getByPatient(pid);
      setMyAppointments(Array.isArray(all) ? all : []);
    } catch (err) {
      const slots = Array.isArray(err.suggestedSlots) ? err.suggestedSlots : [];
      const code = err.code || "";
      setSlotErrorCode(code);
      if (code === "SLOT_UNAVAILABLE") {
        setSuggestedSlots(slots);
        setError(err.message || t("patientAppointmentRequest.slotUnavailable"));
      } else {
        setSuggestedSlots([]);
        setError(err.message || t("patientAppointmentRequest.sendFailed"));
      }
    } finally {
      setSaving(false);
    }
  };

  if (!patientUser) return null;

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col>
          <Link to="/dashboard-pages/patient-dashboard" className="text-decoration-none small d-inline-flex align-items-center gap-1">
            <i className="ri-arrow-left-line"></i>
            {t("patientAppointmentRequest.backToDashboard")}
          </Link>
          <h4 className="text-primary fw-bold mt-2 mb-0">
            <i className="ri-calendar-schedule-line me-2"></i>
            {t("patientAppointmentRequest.title")}
          </h4>
          <p className="text-muted small mb-0 mt-1">{t("patientAppointmentRequest.intro")}</p>
        </Col>
      </Row>

      {loadingDoctor && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" aria-hidden="true" />
        </div>
      )}

      {!loadingDoctor && !doctor && (
        <Alert variant="warning">{t("patientAppointmentRequest.noDoctorWarning")}</Alert>
      )}

      {!loadingDoctor && doctor && (
        <Row className="g-4">
          <Col lg={7}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{
                      width: 52,
                      height: 52,
                      background: "linear-gradient(135deg, #089bab 0%, #0d9488 100%)",
                    }}
                  >
                    <i className="ri-stethoscope-line fs-4" />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-primary">{t("patientAppointmentRequest.referringDoctor")}</h6>
                    <span className="text-dark fw-semibold">
                      {t("patientAppointmentRequest.doctorDisplay", {
                        name: `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim(),
                      })}
                    </span>
                    {doctor.specialty && <div className="text-muted small">{doctor.specialty}</div>}
                  </div>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}
                {slotErrorCode === "SLOT_UNAVAILABLE" && suggestedSlots.length === 0 && error && (
                  <Alert variant="warning" className="mb-3">
                    {t("patientAppointmentRequest.slotUnavailableNoAlternatives")}
                  </Alert>
                )}
                {suggestedSlots.length > 0 && (
                  <Alert variant="info" className="mb-3">
                    <div className="fw-semibold mb-2">{t("patientAppointmentRequest.suggestedSlotsTitle")}</div>
                    <div className="d-flex flex-wrap gap-2">
                      {suggestedSlots.map((s, i) => (
                        <Button
                          key={`${s.date}-${s.time}-${i}`}
                          type="button"
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setForm((f) => ({ ...f, date: s.date, time: s.time }));
                            setSuggestedSlots([]);
                            setSlotErrorCode("");
                            setError("");
                          }}
                        >
                          {t("patientAppointmentRequest.slotButton", { date: s.date, time: s.time })}
                        </Button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 mt-2 small"
                      onClick={() => {
                        setSuggestedSlots([]);
                        setSlotErrorCode("");
                        setError("");
                      }}
                    >
                      {t("patientAppointmentRequest.slotsClose")}
                    </Button>
                  </Alert>
                )}
                {success && <Alert variant="success">{t("patientAppointmentRequest.successAlert")}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">{t("patientAppointmentRequest.fieldTitle")}</Form.Label>
                    <Form.Control
                      required
                      placeholder={t("patientAppointmentRequest.placeholderTitle")}
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </Form.Group>
                  <Row className="g-2 mb-3">
                    <Col md={6}>
                      <Form.Label className="small fw-bold">{t("patientAppointmentRequest.fieldType")}</Form.Label>
                      <Form.Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                        {appointmentTypes.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">{t("patientAppointmentRequest.fieldLocationOptional")}</Form.Label>
                      <Form.Control
                        placeholder={t("patientAppointmentRequest.placeholderLocation")}
                        value={form.location}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      />
                    </Col>
                  </Row>
                  <Row className="g-2 mb-3">
                    <Col md={6}>
                      <Form.Label className="small fw-bold">{t("patientAppointmentRequest.fieldDate")}</Form.Label>
                      <Form.Control
                        type="date"
                        required
                        value={form.date}
                        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">{t("patientAppointmentRequest.fieldTime")}</Form.Label>
                      <Form.Control
                        type="time"
                        required
                        value={form.time}
                        onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      />
                      <Form.Text className="text-muted">{t("patientAppointmentRequest.timeHelp")}</Form.Text>
                    </Col>
                  </Row>
                  <div className="mb-3 p-3 rounded-3" style={{ background: 'linear-gradient(135deg, #e8f4f8 0%, #f0f7ff 100%)', border: '1px solid rgba(13,110,253,0.15)' }}>
                    <Form.Check
                      type="switch"
                      id="video-call-toggle"
                      label={
                        <span className="d-flex align-items-center gap-2">
                          <i className="ri-vidicon-fill text-primary" style={{ fontSize: '1.2rem' }} />
                          <span>
                            <strong>{t('patientAppointmentRequest.videoCallLabel', 'Online Video Consultation')}</strong>
                            <br />
                            <small className="text-muted">{t('patientAppointmentRequest.videoCallHelp', 'Join via secure video call instead of in-person visit')}</small>
                          </span>
                        </span>
                      }
                      checked={form.isVideoCall}
                      onChange={(e) => setForm((f) => ({ ...f, isVideoCall: e.target.checked, location: e.target.checked ? 'Video Call' : f.location }))}
                      className="fs-5"
                    />
                  </div>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold">{t("patientAppointmentRequest.fieldMessage")}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder={t("patientAppointmentRequest.placeholderMessage")}
                      value={form.patientMessage}
                      onChange={(e) => setForm((f) => ({ ...f, patientMessage: e.target.value }))}
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" disabled={saving} className="px-4">
                    {saving ? (
                      <>
                        <Spinner size="sm" className="me-2" aria-hidden="true" />
                        {t("patientAppointmentRequest.sending")}
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-fill me-2"></i>
                        {t("patientAppointmentRequest.submitRequest")}
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <Card.Body className="p-4">
                <h6 className="fw-bold text-primary mb-3">
                  <i className="ri-time-line me-2"></i>
                  {t("patientAppointmentRequest.pendingSectionTitle")}
                </h6>
                {pendingList.length === 0 ? (
                  <p className="text-muted small mb-0">{t("patientAppointmentRequest.pendingEmpty")}</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {pendingList.map((a) => (
                      <div
                        key={a._id}
                        className="p-3 rounded-3 border"
                        style={{ background: "linear-gradient(160deg, #fff 0%, #f8fafc 100%)", borderColor: "rgba(148,163,184,0.25)" }}
                      >
                        <div className="fw-semibold small">{a.title}</div>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                          {t("patientAppointmentRequest.requestedPrefix")}{" "}
                          {a.requestedDate || a.date}
                          {a.requestedTime || a.time
                            ? ` ${t("patientAppointmentRequest.atTime", { time: a.requestedTime || a.time })}`
                            : ""}
                        </div>
                        <span className="badge bg-warning text-dark mt-2">{t("patientAppointmentRequest.badgePending")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default PatientAppointmentRequest;
