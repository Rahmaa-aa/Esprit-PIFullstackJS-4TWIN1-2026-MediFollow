import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { appointmentApi, healthLogApi, medicationApi } from "../../services/api";
import MedicationNameAutocomplete from "../../components/MedicationNameAutocomplete";
import DosageAutocomplete from "../../components/DosageAutocomplete";
import { broadcastDoctorHealthLogResolved, subscribeDoctorHealthLogResolved } from "../../utils/healthLogResolveBroadcast";

const FREQUENCY_KEYS = ["freqOnceDay", "freqTwiceDay", "freqThriceDay", "freqEvery8h", "freqWeekly", "freqPrn"];

const APPOINTMENT_TYPES = [
  { value: "checkup", labelKey: "apptTypeCheckup" },
  { value: "lab", labelKey: "apptTypeLab" },
  { value: "specialist", labelKey: "apptTypeSpecialist" },
  { value: "imaging", labelKey: "apptTypeImaging" },
  { value: "physiotherapy", labelKey: "apptTypePhysio" },
];

const newMedLineId = () => `med-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const VITALS_TZ = "Africa/Tunis";

function formatWhen(iso, localeTag) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const loc = localeTag === "ar" ? "ar-TN" : localeTag === "fr" ? "fr-FR" : "en-US";
    return new Intl.DateTimeFormat(loc, {
      timeZone: VITALS_TZ,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "—";
  }
}

function formatVitalsShort(v, t) {
  if (!v || typeof v !== "object") return "—";
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
  return parts.length ? parts.join(" · ") : "—";
}

const DoctorNurseEscalations = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith("ar") ? "ar" : i18n.language?.startsWith("fr") ? "fr" : "en";

  const makeDefaultRdvForm = () => ({
    title: t("doctorNurseEscalations.defaultUrgentRdvTitle"),
    type: "checkup",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    notes: "",
  });

  const makeEmptyMedLine = () => ({
    id: newMedLineId(),
    name: "",
    useCustomMedication: false,
    dosage: "",
    useCustomDosage: false,
    frequency: t("doctorNurseEscalations.freqOnceDay"),
    startDate: "",
    endDate: "",
    notes: "",
  });

  const filterTabs = useMemo(
    () => [
      { key: "all", label: t("doctorNurseEscalations.tabAll") },
      { key: "pending", label: t("doctorNurseEscalations.tabPending") },
      { key: "resolved", label: t("doctorNurseEscalations.tabResolved") },
    ],
    [t]
  );

  const [doctorUser] = useState(() => {
    try {
      const s = localStorage.getItem("doctorUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const doctorId = doctorUser?.id || doctorUser?._id;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [resolveBusyId, setResolveBusyId] = useState(null);
  const [resolveModal, setResolveModal] = useState(null);
  const [modalNote, setModalNote] = useState("");
  const [rdvModal, setRdvModal] = useState(null);
  const [rdvForm, setRdvForm] = useState(() => makeDefaultRdvForm());
  const [rdvSaving, setRdvSaving] = useState(false);
  const [rdvError, setRdvError] = useState("");
  const [medModal, setMedModal] = useState(null);
  const [medLine, setMedLine] = useState(() => makeEmptyMedLine());
  const [medSaving, setMedSaving] = useState(false);
  const [medError, setMedError] = useState("");

  const doctorDisplayName = useMemo(() => {
    if (!doctorUser) return "";
    const ln = doctorUser.lastName ? `Dr. ${doctorUser.firstName || ""} ${doctorUser.lastName}`.trim() : "";
    return ln || doctorUser.firstName || t("doctorNurseEscalations.doctorFallback");
  }, [doctorUser, t]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const raw = await healthLogApi.doctorNurseEscalations("all");
      setItems(Array.isArray(raw) ? raw : []);
    } catch (e) {
      setError(e.message || t("doctorNurseEscalations.loadError"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!doctorId) return;
    load();
  }, [doctorId, load]);

  useEffect(() => {
    if (!doctorId) return;
    return subscribeDoctorHealthLogResolved(() => {
      void load();
    });
  }, [doctorId, load]);

  const filtered = useMemo(() => {
    let result = items;
    if (filter === "pending") result = result.filter((r) => r.escalationStatus === "escalated_to_doctor");
    if (filter === "resolved") result = result.filter((r) => r.escalationStatus === "resolved");
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((r) => (r.patientName || "").toLowerCase().includes(q));
    }
    return result;
  }, [items, filter, search]);

  const counts = useMemo(() => {
    const pending = items.filter((r) => r.escalationStatus === "escalated_to_doctor").length;
    const resolved = items.filter((r) => r.escalationStatus === "resolved").length;
    return { pending, resolved, total: items.length };
  }, [items]);

  const closeResolveModal = () => {
    setResolveModal(null);
    setModalNote("");
  };

  const resolveOne = async (healthLogId, patientId, resolutionNote) => {
    const note = String(resolutionNote ?? "").trim();
    if (!note) {
      window.alert(t("doctorNurseEscalations.alertNoteRequired"));
      return;
    }
    setResolveBusyId(healthLogId);
    try {
      await healthLogApi.doctorResolveVitalAlert(healthLogId, { resolutionNote: note });
      closeResolveModal();
      await load();
      broadcastDoctorHealthLogResolved(healthLogId, patientId);
    } catch (e) {
      window.alert(e.message || t("doctorNurseEscalations.alertResolveFailed"));
    } finally {
      setResolveBusyId(null);
    }
  };

  const confirmResolveFromModal = () => {
    if (!resolveModal) return;
    void resolveOne(resolveModal.id, resolveModal.patientId, modalNote);
  };

  const closeRdvModal = () => {
    setRdvModal(null);
    setRdvForm(makeDefaultRdvForm());
    setRdvError("");
  };

  const openRdvModal = (patientId, patientName) => {
    setRdvForm(makeDefaultRdvForm());
    setRdvError("");
    setRdvModal({ patientId, patientName });
  };

  const submitUrgentRdv = async (e) => {
    e.preventDefault();
    if (!rdvModal || !doctorId) return;
    const date = String(rdvForm.date || "").trim();
    const time = String(rdvForm.time || "").trim();
    if (!date) {
      setRdvError(t("doctorNurseEscalations.rdvErrDate"));
      return;
    }
    if (!time) {
      setRdvError(t("doctorNurseEscalations.rdvErrTime"));
      return;
    }
    setRdvSaving(true);
    setRdvError("");
    try {
      await appointmentApi.create({
        patientId: rdvModal.patientId,
        doctorId: String(doctorId),
        doctorName: doctorDisplayName,
        title: String(rdvForm.title || "").trim() || t("doctorNurseEscalations.fallbackUrgentTitle"),
        type: rdvForm.type || "checkup",
        date,
        time,
        location: "",
        patientMessage: "",
        notes: String(rdvForm.notes || "").trim(),
        status: "confirmed",
      });
      closeRdvModal();
    } catch (err) {
      setRdvError(err.message || t("doctorNurseEscalations.rdvErrCreate"));
    } finally {
      setRdvSaving(false);
    }
  };

  const closeMedModal = () => {
    setMedModal(null);
    setMedLine(makeEmptyMedLine());
    setMedError("");
  };

  const openMedModal = (patientId, patientName) => {
    setMedLine(makeEmptyMedLine());
    setMedError("");
    setMedModal({ patientId, patientName });
  };

  const patchMedLine = (patch) => {
    setMedLine((prev) => ({ ...prev, ...patch }));
  };

  const submitNewMedication = async (e) => {
    e.preventDefault();
    if (!medModal) return;
    const name = String(medLine.name || "").trim();
    if (!name) {
      setMedError(t("doctorNurseEscalations.medNameRequired"));
      return;
    }
    setMedSaving(true);
    setMedError("");
    try {
      await medicationApi.create({
        patientId: medModal.patientId,
        name,
        dosage: String(medLine.dosage || "").trim(),
        frequency: medLine.frequency,
        startDate: medLine.startDate || "",
        endDate: medLine.endDate || "",
        notes: String(medLine.notes || "").trim(),
      });
      closeMedModal();
    } catch (err) {
      setMedError(err.message || t("doctorNurseEscalations.medErrSave"));
    } finally {
      setMedSaving(false);
    }
  };

  if (!doctorId) {
    return (
      <Container className="py-5">
        <p className="text-muted text-center">{t("doctorMyPatients.loginDoctor")}</p>
        <div className="text-center">
          <Link to="/auth/sign-in" className="btn btn-primary">
            {t("doctorMyPatients.signIn")}
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="pb-5">
      <Row className="mb-4 align-items-end">
        <Col md={8}>
          <h4 className="fw-bold mb-1">
            <i className="ri-alarm-warning-fill text-danger me-2" />
            {t("doctorNurseEscalations.pageTitle")}
          </h4>
          <p className="text-muted mb-0">{t("doctorNurseEscalations.pageLead")}</p>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <Button variant="outline-secondary" size="sm" onClick={load} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" className="me-1" /> : <i className="ri-refresh-line me-1" />}
            {t("doctorNurseEscalations.refresh")}
          </Button>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="py-3">
              <div className="small text-muted">{t("doctorNurseEscalations.statTotal")}</div>
              <div className="fs-4 fw-semibold text-primary">{counts.total}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100 border-start border-warning border-3 rounded">
            <Card.Body className="py-3">
              <div className="small text-muted">{t("doctorNurseEscalations.statPending")}</div>
              <div className="fs-4 fw-semibold text-warning">{counts.pending}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100 border-start border-success border-3 rounded">
            <Card.Body className="py-3">
              <div className="small text-muted">{t("doctorNurseEscalations.statResolved")}</div>
              <div className="fs-4 fw-semibold text-success">{counts.resolved}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-end mb-3">
            {/* Search by patient name */}
            <Col xs={12} md={6}>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="ri-search-line text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by patient name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-start-0 ps-0"
                />
                {search && (
                  <Button variant="outline-secondary" size="sm" onClick={() => setSearch("")}>
                    <i className="ri-close-line"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>
            {/* Status filter */}
            <Col xs={12} md={6} className="d-flex align-items-end justify-content-md-end gap-2">
              <span className="small text-muted">{t("doctorNurseEscalations.filterLabel")}</span>
              <ButtonGroup size="sm">
                {filterTabs.map((tab) => (
                  <Button
                    key={tab.key}
                    variant={filter === tab.key ? "primary" : "outline-primary"}
                    onClick={() => setFilter(tab.key)}
                  >
                    {tab.label}
                    {tab.key === "pending" && counts.pending > 0 ? (
                      <Badge bg="danger" className="ms-1">{counts.pending}</Badge>
                    ) : null}
                  </Button>
                ))}
              </ButtonGroup>
            </Col>
          </Row>

          {/* Results counter */}
          {!loading && (
            <div className="small text-muted mb-2">
              {filtered.length === items.length
                ? `${items.length} escalation(s)`
                : `${filtered.length} of ${items.length} escalation(s)`}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted text-center py-5 mb-0">
              {counts.total === 0 ? t("doctorNurseEscalations.emptyNoEscalations") : t("doctorNurseEscalations.emptyFilter")}
            </p>
          ) : (
            <div className="table-responsive">
              {/* popper fixed sur Dropdown.Menu : sinon .table-responsive masque le 3e item */}
              <Table hover className="mb-0 align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>{t("doctorNurseEscalations.thPatient")}</th>
                    <th>{t("doctorNurseEscalations.thStatus")}</th>
                    <th>{t("doctorNurseEscalations.thRecorded")}</th>
                    <th>{t("doctorNurseEscalations.thEscalation")}</th>
                    <th>{t("doctorNurseEscalations.thNurse")}</th>
                    <th>{t("doctorNurseEscalations.thScore")}</th>
                    <th>{t("doctorNurseEscalations.thVitals")}</th>
                    <th>{t("doctorNurseEscalations.thNurseNote")}</th>
                    <th className="text-nowrap">{t("doctorNurseEscalations.thActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const pending = row.escalationStatus === "escalated_to_doctor";
                    const pid = row.patientId;
                    return (
                      <tr key={row.id}>
                        <td className="fw-semibold">{row.patientName}</td>
                        <td>
                          {pending ? (
                            <Badge bg="warning" text="dark">
                              {t("doctorNurseEscalations.statusPendingBadge")}
                            </Badge>
                          ) : (
                            <Badge bg="success">{t("doctorNurseEscalations.statusResolvedBadge")}</Badge>
                          )}
                        </td>
                        <td className="text-nowrap">{formatWhen(row.recordedAt, dateLocale)}</td>
                        <td className="text-nowrap">{formatWhen(row.escalatedAt, dateLocale)}</td>
                        <td>{row.escalatedByNurseName || "—"}</td>
                        <td>
                          <span className="badge bg-light text-dark border">{row.riskScore ?? "—"}/100</span>
                        </td>
                        <td style={{ maxWidth: 220 }}>{formatVitalsShort(row.vitals, t)}</td>
                        <td style={{ maxWidth: 200 }} className="text-muted">
                          {row.escalationNote ? (
                            <span title={row.escalationNote}>{row.escalationNote.slice(0, 80)}{row.escalationNote.length > 80 ? "…" : ""}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td style={{ minWidth: 260 }}>
                          {pending ? (
                            <div className="d-flex flex-wrap align-items-center gap-1">
                              <Link
                                to={`/doctor/my-patients/${encodeURIComponent(pid)}`}
                                className="btn btn-outline-primary btn-sm"
                              >
                                {t("doctorNurseEscalations.dossier")}
                              </Link>
                              <Dropdown as={ButtonGroup}>
                                <Dropdown.Toggle
                                  variant="primary"
                                  size="sm"
                                  id={`urg-actions-${row.id}`}
                                  disabled={resolveBusyId != null}
                                  className="d-inline-flex align-items-center px-2"
                                  title={t("doctorNurseEscalations.actionsTooltip")}
                                >
                                  <i className="ri-add-line fs-6" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu
                                  align="end"
                                  popperConfig={{ strategy: "fixed" }}
                                  className="shadow-sm"
                                >
                                  <Dropdown.Item
                                    onClick={() => {
                                      setResolveModal({ id: row.id, patientId: pid });
                                      setModalNote("");
                                    }}
                                  >
                                    <i className="ri-file-text-line me-2 text-primary" />
                                    {t("doctorNurseEscalations.dropdownInstruction")}
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => openRdvModal(pid, row.patientName)}>
                                    <i className="ri-calendar-event-line me-2 text-warning" />
                                    {t("doctorNurseEscalations.dropdownUrgentRdv")}
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item onClick={() => openMedModal(pid, row.patientName)}>
                                    <i className="ri-medicine-bottle-line me-2 text-success" />
                                    {t("doctorNurseEscalations.dropdownAddMed")}
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          ) : (
                            <Link
                              to={`/doctor/my-patients/${encodeURIComponent(pid)}`}
                              className="btn btn-outline-primary btn-sm"
                            >
                              {t("doctorNurseEscalations.dossier")}
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={resolveModal != null} onHide={closeResolveModal} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{t("doctorNurseEscalations.modalInstructionTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-2">{t("doctorNurseEscalations.modalInstructionLead")}</p>
          <Form.Control
            as="textarea"
            rows={5}
            className="small"
            placeholder={t("doctorNurseEscalations.placeholderInstruction")}
            value={modalNote}
            onChange={(e) => setModalNote(e.target.value)}
            disabled={resolveBusyId != null}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={closeResolveModal} disabled={resolveBusyId != null}>
            {t("doctorNurseEscalations.cancel")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!modalNote.trim() || resolveBusyId != null}
            onClick={confirmResolveFromModal}
          >
            {resolveBusyId != null ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                {t("doctorNurseEscalations.sending")}
              </>
            ) : (
              <>
                <i className="ri-send-plane-line me-1" />
                {t("doctorNurseEscalations.sendAndClose")}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={rdvModal != null} onHide={closeRdvModal} centered backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-calendar-event-line me-2 text-warning" />
            {t("doctorNurseEscalations.modalRdvTitle")}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitUrgentRdv}>
          <Modal.Body>
            {rdvModal && (
              <p className="small text-muted mb-3">{t("doctorNurseEscalations.modalRdvPatientLead", { name: rdvModal.patientName })}</p>
            )}
            {rdvError && (
              <div className="alert alert-danger py-2 small" role="alert">
                {rdvError}
              </div>
            )}
            <Row className="g-2 mb-2">
              <Col md={12}>
                <Form.Label className="small fw-semibold">{t("doctorNurseEscalations.labelMotif")}</Form.Label>
                <Form.Control
                  size="sm"
                  value={rdvForm.title}
                  onChange={(e) => setRdvForm((f) => ({ ...f, title: e.target.value }))}
                  disabled={rdvSaving}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">{t("doctorNurseEscalations.labelType")}</Form.Label>
                <Form.Select
                  size="sm"
                  value={rdvForm.type}
                  onChange={(e) => setRdvForm((f) => ({ ...f, type: e.target.value }))}
                  disabled={rdvSaving}
                >
                  {APPOINTMENT_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(`doctorNurseEscalations.${opt.labelKey}`)}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6} className="d-none d-md-block" aria-hidden />
              <Col md={6}>
                <Form.Label className="small fw-semibold">{t("doctorNurseEscalations.labelDate")}</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  required
                  value={rdvForm.date}
                  onChange={(e) => setRdvForm((f) => ({ ...f, date: e.target.value }))}
                  disabled={rdvSaving}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">{t("doctorNurseEscalations.labelTime")}</Form.Label>
                <Form.Control
                  type="time"
                  size="sm"
                  required
                  value={rdvForm.time}
                  onChange={(e) => setRdvForm((f) => ({ ...f, time: e.target.value }))}
                  disabled={rdvSaving}
                />
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-semibold">{t("doctorNurseEscalations.labelNotesInternal")}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size="sm"
                  placeholder={t("doctorNurseEscalations.notesOptional")}
                  value={rdvForm.notes}
                  onChange={(e) => setRdvForm((f) => ({ ...f, notes: e.target.value }))}
                  disabled={rdvSaving}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" type="button" onClick={closeRdvModal} disabled={rdvSaving}>
              {t("doctorNurseEscalations.cancel")}
            </Button>
            <Button variant="warning" size="sm" type="submit" disabled={rdvSaving}>
              {rdvSaving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  {t("doctorNurseEscalations.rdvSaving")}
                </>
              ) : (
                <>
                  <i className="ri-check-line me-1" />
                  {t("doctorNurseEscalations.createRdv")}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={medModal != null} onHide={closeMedModal} centered backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-medicine-bottle-line me-2 text-success" />
            {t("doctorNurseEscalations.medModalTitle")}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitNewMedication}>
          <Modal.Body>
            {medModal && (
              <p className="small text-muted mb-3">{t("doctorNurseEscalations.medModalLead", { name: medModal.patientName })}</p>
            )}
            {medError && (
              <div className="alert alert-danger py-2 small" role="alert">
                {medError}
              </div>
            )}
            <Row className="g-2">
              <Col md={12}>
                <Form.Label className="small fw-semibold">{t("doctorNurseEscalations.labelMedName")}</Form.Label>
                <MedicationNameAutocomplete
                  id={`esc-med-name-${medLine.id}`}
                  value={medLine.name}
                  useCustom={!!medLine.useCustomMedication}
                  onChange={(patch) => patchMedLine(patch)}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">{t("doctorNurseEscalations.labelDosage")}</Form.Label>
                <DosageAutocomplete
                  id={`esc-med-dose-${medLine.id}`}
                  value={medLine.dosage}
                  useCustom={!!medLine.useCustomDosage}
                  onChange={(patch) => patchMedLine(patch)}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">{t("doctorNurseEscalations.labelFrequency")}</Form.Label>
                <Form.Select
                  size="sm"
                  value={medLine.frequency}
                  onChange={(e) => patchMedLine({ frequency: e.target.value })}
                  disabled={medSaving}
                >
                  {FREQUENCY_KEYS.map((fk) => {
                    const lab = t(`doctorNurseEscalations.${fk}`);
                    return (
                      <option key={fk} value={lab}>
                        {lab}
                      </option>
                    );
                  })}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">{t("doctorNurseEscalations.labelStartDate")}</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={medLine.startDate}
                  onChange={(e) => patchMedLine({ startDate: e.target.value })}
                  disabled={medSaving}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">{t("doctorNurseEscalations.labelEndDate")}</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={medLine.endDate}
                  onChange={(e) => patchMedLine({ endDate: e.target.value })}
                  disabled={medSaving}
                />
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-semibold">{t("doctorNurseEscalations.labelNotes")}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size="sm"
                  placeholder={t("doctorNurseEscalations.notesMealsPlaceholder")}
                  value={medLine.notes}
                  onChange={(e) => patchMedLine({ notes: e.target.value })}
                  disabled={medSaving}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" type="button" onClick={closeMedModal} disabled={medSaving}>
              {t("doctorNurseEscalations.cancel")}
            </Button>
            <Button variant="success" size="sm" type="submit" disabled={medSaving}>
              {medSaving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  {t("doctorNurseEscalations.medSaving")}
                </>
              ) : (
                <>
                  <i className="ri-check-line me-1" />
                  {t("doctorNurseEscalations.saveMedication")}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default DoctorNurseEscalations;
