import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, Nav } from "react-bootstrap";
import { appointmentApi } from "../../services/api";

/** Maps API `type` slugs to existing patient form i18n keys. */
const APPOINTMENT_TYPE_I18N_KEYS = {
  checkup: "patientAppointmentRequest.typeCheckup",
  lab: "patientAppointmentRequest.typeLab",
  specialist: "patientAppointmentRequest.typeSpecialist",
  imaging: "patientAppointmentRequest.typeImaging",
  physiotherapy: "patientAppointmentRequest.typePhysiotherapy",
};

function appointmentTypeLabel(type, t) {
  if (type == null || type === "") return "—";
  const key = APPOINTMENT_TYPE_I18N_KEYS[String(type).toLowerCase()];
  return key ? t(key) : String(type);
}

const AdminAppointmentRequests = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [adminUser] = useState(() => {
    try {
      const s = localStorage.getItem("adminUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [tab, setTab] = useState("pending");
  const [list, setList] = useState([]);
  const [confirmedList, setConfirmedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingConfirmed, setLoadingConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ date: "", time: "", adminNotes: "" });
  const [saving, setSaving] = useState(false);

  const isAdmin = adminUser && ["admin", "superadmin"].includes(adminUser.role);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await appointmentApi.getPendingForAdmin();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || t("adminAppointmentRequests.loadError"));
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadConfirmed = useCallback(async () => {
    setLoadingConfirmed(true);
    setError("");
    try {
      const data = await appointmentApi.getConfirmedForAdmin();
      setConfirmedList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || t("adminAppointmentRequests.loadError"));
      setConfirmedList([]);
    } finally {
      setLoadingConfirmed(false);
    }
  }, [t]);

  useEffect(() => {
    if (!adminUser) {
      navigate("/auth/sign-in", { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }
    load();
  }, [adminUser, isAdmin, navigate, load]);

  useEffect(() => {
    if (!adminUser || !isAdmin || tab !== "confirmed") return;
    loadConfirmed();
  }, [adminUser, isAdmin, tab, loadConfirmed]);

  const openModal = (row) => {
    setModal(row);
    setForm({
      date: row.date || row.requestedDate || "",
      time: row.time || row.requestedTime || "",
      adminNotes: "",
    });
  };

  const closeModal = () => {
    if (!saving) setModal(null);
  };

  const confirmSlot = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      await appointmentApi.updateAsAdmin(modal._id, {
        status: "confirmed",
        date: form.date,
        time: form.time || "",
        adminNotes: form.adminNotes || "",
      });
      await load();
      if (tab === "confirmed") await loadConfirmed();
      setModal(null);
    } catch (e) {
      alert(e.message || t("adminAppointmentRequests.errorGeneric"));
    } finally {
      setSaving(false);
    }
  };

  const rejectRequest = async (row) => {
    const reason = window.prompt(t("adminAppointmentRequests.promptRejectReason"), "");
    if (reason === null) return;
    setSaving(true);
    try {
      await appointmentApi.updateAsAdmin(row._id, {
        status: "cancelled",
        adminNotes: reason || t("adminAppointmentRequests.rejectDefaultNote"),
      });
      await load();
    } catch (e) {
      alert(e.message || t("adminAppointmentRequests.errorGeneric"));
    } finally {
      setSaving(false);
    }
  };

  if (!adminUser || !isAdmin) return null;

  const patientLabel = (row) => {
    const p = row.patientId;
    if (p && typeof p === "object") {
      return `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.email || "—";
    }
    return "—";
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col>
          <Link to="/admin/dashboard" className="text-decoration-none small d-inline-flex align-items-center gap-1">
            <i className="ri-arrow-left-line"></i>
            {t("adminAppointmentRequests.backToAdmin")}
          </Link>
          <h4 className="text-primary fw-bold mt-2 mb-0">
            <i className="ri-calendar-check-line me-2"></i>
            {t("adminAppointmentRequests.pageTitle")}
          </h4>
          <p className="text-muted small mb-0 mt-1">
            {t("adminAppointmentRequests.pageLead")}
          </p>
        </Col>
      </Row>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" role="status" aria-label={t("adminAppointmentRequests.loading")} />
        </div>
      )}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      <Nav variant="tabs" className="mb-3 border-0">
        <Nav.Item>
          <Nav.Link
            active={tab === "pending"}
            onClick={() => setTab("pending")}
            className="cursor-pointer"
            style={{ cursor: "pointer" }}
          >
            {t("adminAppointmentRequests.tabPending")}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={tab === "confirmed"}
            onClick={() => setTab("confirmed")}
            className="cursor-pointer"
            style={{ cursor: "pointer" }}
          >
            {t("adminAppointmentRequests.tabConfirmed")}
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {tab === "pending" && !loading && !error && (
        <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <Card.Body className="p-0 p-md-2">
            {list.length === 0 ? (
              <p className="text-muted text-center py-5 mb-0">{t("adminAppointmentRequests.emptyPending")}</p>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t("adminAppointmentRequests.thPatient")}</th>
                      <th>{t("adminAppointmentRequests.thDoctor")}</th>
                      <th>{t("adminAppointmentRequests.thReason")}</th>
                      <th>{t("adminAppointmentRequests.thPatientWish")}</th>
                      <th>{t("adminAppointmentRequests.thMessage")}</th>
                      <th className="text-end">{t("adminAppointmentRequests.thActions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((row) => (
                      <tr key={row._id}>
                        <td>
                          <span className="fw-semibold">{patientLabel(row)}</span>
                        </td>
                        <td>{row.doctorName || "—"}</td>
                        <td>
                          <div className="small fw-semibold">{row.title}</div>
                          <Badge bg="secondary" className="mt-1" style={{ fontSize: "0.65rem" }}>
                            {appointmentTypeLabel(row.type, t)}
                          </Badge>
                        </td>
                        <td className="small">
                          {(row.requestedDate || row.date) && (
                            <>
                              {row.requestedDate || row.date}
                              {(row.requestedTime || row.time) && ` · ${row.requestedTime || row.time}`}
                            </>
                          )}
                        </td>
                        <td className="small text-muted" style={{ maxWidth: 200 }}>
                          {row.patientMessage || "—"}
                        </td>
                        <td className="text-end text-nowrap">
                          <Button size="sm" variant="primary" className="me-1" onClick={() => openModal(row)}>
                            {t("adminAppointmentRequests.process")}
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => rejectRequest(row)} disabled={saving}>
                            {t("adminAppointmentRequests.refuse")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {tab === "confirmed" && (
        <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <Card.Body className="p-0 p-md-2">
            {loadingConfirmed ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" role="status" aria-label={t("adminAppointmentRequests.loading")} />
              </div>
            ) : confirmedList.length === 0 ? (
              <p className="text-muted text-center py-5 mb-0">{t("adminAppointmentRequests.emptyConfirmed")}</p>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t("adminAppointmentRequests.thPatient")}</th>
                      <th>{t("adminAppointmentRequests.thDoctor")}</th>
                      <th>{t("adminAppointmentRequests.thReason")}</th>
                      <th>{t("adminAppointmentRequests.thDateTime")}</th>
                      <th>{t("adminAppointmentRequests.thLocation")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmedList.map((row) => (
                      <tr key={row._id}>
                        <td>
                          <span className="fw-semibold">{patientLabel(row)}</span>
                        </td>
                        <td>{row.doctorName || "—"}</td>
                        <td>
                          <div className="small fw-semibold">{row.title}</div>
                          <Badge bg="success" className="mt-1" style={{ fontSize: "0.65rem" }}>
                            {appointmentTypeLabel(row.type, t)}
                          </Badge>
                        </td>
                        <td className="small">
                          {row.date || "—"}
                          {row.time && ` · ${row.time}`}
                        </td>
                        <td className="small text-muted">{row.location || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <Modal show={!!modal} onHide={closeModal} centered size="lg" backdrop="static">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-primary fs-6">{t("adminAppointmentRequests.modalTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modal && (
            <>
              <p className="small text-muted mb-3">
                {t("adminAppointmentRequests.modalPatientLabel")}{" "}
                <strong>{patientLabel(modal)}</strong> — {modal.doctorName}
              </p>
              <Row className="g-2 mb-3">
                <Col md={6}>
                  <Form.Label className="small fw-bold">{t("adminAppointmentRequests.labelDate")}</Form.Label>
                  <Form.Control type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold">{t("adminAppointmentRequests.labelTime")}</Form.Label>
                  <Form.Control type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
                </Col>
              </Row>
              <Form.Group>
                <Form.Label className="small fw-bold">{t("adminAppointmentRequests.labelMessagePatient")}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder={t("adminAppointmentRequests.messagePlaceholder")}
                  value={form.adminNotes}
                  onChange={(e) => setForm((f) => ({ ...f, adminNotes: e.target.value }))}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={closeModal} disabled={saving}>
            {t("adminAppointmentRequests.cancel")}
          </Button>
          <Button variant="success" onClick={confirmSlot} disabled={saving || !form.date}>
            {saving ? (
              <>
                <Spinner size="sm" className="me-1" /> {t("adminAppointmentRequests.confirming")}
              </>
            ) : (
              t("adminAppointmentRequests.confirmAppointment")
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminAppointmentRequests;
