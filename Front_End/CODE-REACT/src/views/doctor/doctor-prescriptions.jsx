import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Container, Form, InputGroup, Row, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { patientApi, medicationApi } from "../../services/api";
import MedicationNameAutocomplete from "../../components/MedicationNameAutocomplete";
import DosageAutocomplete from "../../components/DosageAutocomplete";
import { formatMedicationFrequencyDisplay } from "../../utils/medicationFrequencyLabel";
import { formatYmdForLocale } from "../../utils/localeDateDisplay";
import PaginationBar from "../../components/PaginationBar";
import { usePagination } from "../../hooks/usePagination";

/** Canonical values (English) — aligned with backend medication-slots.util.ts */
const FREQUENCY_OPTIONS = [
  { value: "once daily", key: "onceDaily" },
  { value: "twice daily", key: "twiceDaily" },
  { value: "three times daily", key: "threeTimesDaily" },
  { value: "every 8 hours", key: "every8h" },
  { value: "weekly", key: "weekly" },
  { value: "as needed", key: "asNeeded" },
];

const DEFAULT_FREQUENCY = FREQUENCY_OPTIONS[0].value;

const newLineId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const emptyMedicationLine = () => ({
  id: newLineId(),
  name: "",
  useCustomMedication: false,
  dosage: "",
  useCustomDosage: false,
  frequency: DEFAULT_FREQUENCY,
  startDate: "",
  endDate: "",
  notes: "",
});

const DoctorPrescriptions = () => {
  const { t, i18n } = useTranslation();
  const dateLocaleTag = i18n.language?.startsWith("fr") ? "fr" : i18n.language?.startsWith("ar") ? "ar" : "en";
  const [doctorUser] = useState(() => {
    try {
      const s = localStorage.getItem("doctorUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const doctorId = doctorUser?.id || doctorUser?._id;

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [searchPatient, setSearchPatient] = useState("");
  const [medications, setMedications] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  /** Plusieurs lignes de médicaments pour une seule ordonnance */
  const [lines, setLines] = useState(() => [emptyMedicationLine()]);

  useEffect(() => {
    if (!doctorId) return;
    let cancelled = false;
    (async () => {
      setLoadingPatients(true);
      setError("");
      try {
        const raw = await patientApi.getMyAssignedForDoctor();
        const list = Array.isArray(raw) ? raw : [];
        if (!cancelled) {
          setPatients(list);
          if (list.length === 1) setSelectedPatientId(String(list[0]._id || list[0].id));
        }
      } catch (e) {
        if (!cancelled) setError(e.message || t("doctorPrescriptions.loadPatientsError"));
      } finally {
        if (!cancelled) setLoadingPatients(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  useEffect(() => {
    if (!selectedPatientId) {
      setMedications([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingMeds(true);
      try {
        const meds = await medicationApi.getByPatient(selectedPatientId);
        if (!cancelled) setMedications(Array.isArray(meds) ? meds : []);
      } catch (e) {
        if (!cancelled) {
          setMedications([]);
          setError(e.message || t("doctorPrescriptions.loadMedsError"));
        }
      } finally {
        if (!cancelled) setLoadingMeds(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedPatientId]);

  useEffect(() => {
    setLines([emptyMedicationLine()]);
  }, [selectedPatientId]);

  const updateLine = (id, patch) => {
    setLines((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addMedicationRow = () => {
    setLines((prev) => [...prev, emptyMedicationLine()]);
  };

  const removeMedicationRow = (id) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.id !== id)));
  };

  const selectedPatient = useMemo(
    () => patients.find((p) => String(p._id || p.id) === String(selectedPatientId)),
    [patients, selectedPatientId],
  );

  const filteredPatients = useMemo(() => {
    if (!searchPatient.trim()) return patients;
    const q = searchPatient.trim().toLowerCase();
    return patients.filter((p) =>
      `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q)
    );
  }, [patients, searchPatient]);

  const { page: medPage, setPage: setMedPage, totalPages: medTotalPages, paginated: paginatedMeds, totalItems: medTotalItems } = usePagination(medications, 5);

  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    const toSave = lines.filter((row) => row.name?.trim());
    if (toSave.length === 0) {
      setError(t("doctorPrescriptions.errorAtLeastOneMedication"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      for (const row of toSave) {
        await medicationApi.create({
          patientId: selectedPatientId,
          name: row.name.trim(),
          dosage: row.dosage || "",
          frequency: row.frequency,
          startDate: row.startDate || "",
          endDate: row.endDate || "",
          notes: row.notes || "",
        });
      }
      const meds = await medicationApi.getByPatient(selectedPatientId);
      setMedications(Array.isArray(meds) ? meds : []);
      setLines([emptyMedicationLine()]);
    } catch (err) {
      setError(err.message || t("doctorPrescriptions.saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (!doctorId) {
    return (
      <Container className="py-5">
        <p className="text-muted text-center">{t("doctorPrescriptions.loginHint")}</p>
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
      <Row className="mb-4">
        <Col>
          <h4 className="fw-bold mb-1">{t("doctorPrescriptions.pageTitle")}</h4>
          <p className="text-muted mb-0">{t("doctorPrescriptions.pageSubtitle")}</p>
        </Col>
      </Row>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Row className="g-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <Card.Title className="h6 mb-0">
                <i className="ri-user-heart-line text-primary me-2" />
                {t("doctorPrescriptions.patientSectionTitle")}
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {loadingPatients ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              ) : patients.length === 0 ? (
                <p className="text-muted small mb-0">{t("doctorPrescriptions.noPatientsAssigned")}</p>
              ) : (
                <Form.Group>
                  <Form.Label>{t("doctorPrescriptions.selectPatientLabel")}</Form.Label>
                  <InputGroup className="mb-2">
                    <InputGroup.Text><i className="ri-search-line" /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search patient by name..."
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                    />
                    {searchPatient && (
                      <Button variant="outline-secondary" size="sm" onClick={() => setSearchPatient("")}>
                        <i className="ri-close-line" />
                      </Button>
                    )}
                  </InputGroup>
                  <Form.Select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    aria-label={t("doctorPrescriptions.selectPatientPlaceholder")}
                  >
                    <option value="">{t("doctorPrescriptions.patientPlaceholderOption")}</option>
                    {filteredPatients.map((p) => (
                      <option key={p._id || p.id} value={String(p._id || p.id)}>
                        {p.firstName} {p.lastName} — {p.email}
                      </option>
                    ))}
                  </Form.Select>
                  {searchPatient && (
                    <div className="mt-1 small text-muted">
                      {filteredPatients.length} / {patients.length} patients
                    </div>
                  )}
                </Form.Group>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <Card.Title className="h6 mb-0">
                <i className="ri-capsule-line text-primary me-2" />
                {t("doctorPrescriptions.newPrescriptionTitle")}
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {!selectedPatientId ? (
                <p className="text-muted small mb-0">{t("doctorPrescriptions.selectPatientFirst")}</p>
              ) : (
                <Form onSubmit={handleAddMedication}>
                  {lines.map((row, index) => (
                    <div
                      key={row.id}
                      className="rounded-3 border p-3 mb-3"
                      style={{ backgroundColor: index % 2 === 0 ? "#fafbfc" : "#fff" }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-bold text-primary">
                          {t("doctorPrescriptions.medicationLineLabel", { n: index + 1 })}
                        </span>
                        {lines.length > 1 && (
                          <Button
                            type="button"
                            variant="outline-danger"
                            size="sm"
                            className="py-0 px-2"
                            onClick={() => removeMedicationRow(row.id)}
                            aria-label={t("doctorPrescriptions.removeMedicationAria", { n: index + 1 })}
                          >
                            <i className="ri-delete-bin-line" />
                          </Button>
                        )}
                      </div>
                      <Row className="g-2">
                        <Col md={12}>
                          <Form.Label className="small fw-semibold">{t("doctorPrescriptions.labelMedicationName")}</Form.Label>
                          <MedicationNameAutocomplete
                            id={`med-name-${row.id}`}
                            value={row.name}
                            useCustom={!!row.useCustomMedication}
                            onChange={(patch) => updateLine(row.id, patch)}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small fw-semibold">{t("doctorPrescriptions.labelDosage")}</Form.Label>
                          <DosageAutocomplete
                            id={`med-dose-${row.id}`}
                            value={row.dosage}
                            useCustom={!!row.useCustomDosage}
                            onChange={(patch) => updateLine(row.id, patch)}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small fw-semibold">{t("doctorPrescriptions.labelFrequency")}</Form.Label>
                          <Form.Select
                            size="sm"
                            value={row.frequency}
                            onChange={(e) => updateLine(row.id, { frequency: e.target.value })}
                          >
                            {FREQUENCY_OPTIONS.map(({ value, key }) => (
                              <option key={value} value={value}>
                                {t(`doctorPrescriptions.freq.${key}`)}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small fw-semibold">{t("doctorPrescriptions.labelStartDate")}</Form.Label>
                          <Form.Control
                            type="date"
                            size="sm"
                            value={row.startDate}
                            onChange={(e) => updateLine(row.id, { startDate: e.target.value })}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small fw-semibold">{t("doctorPrescriptions.labelEndDate")}</Form.Label>
                          <Form.Control
                            type="date"
                            size="sm"
                            value={row.endDate}
                            onChange={(e) => updateLine(row.id, { endDate: e.target.value })}
                          />
                        </Col>
                        <Col md={12}>
                          <Form.Label className="small fw-semibold">{t("doctorPrescriptions.labelNotes")}</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            size="sm"
                            placeholder={t("doctorPrescriptions.notesPlaceholder")}
                            value={row.notes}
                            onChange={(e) => updateLine(row.id, { notes: e.target.value })}
                          />
                        </Col>
                      </Row>
                    </div>
                  ))}

                  <p className="text-muted small mb-2">{t("doctorPrescriptions.emptyLinesHint")}</p>
                  <Button
                    type="button"
                    variant="outline-primary"
                    size="sm"
                    className="w-100 mb-3"
                    onClick={addMedicationRow}
                    disabled={saving}
                  >
                    <i className="ri-add-line me-1" />
                    {t("doctorPrescriptions.addAnotherMedication")}
                  </Button>

                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-1 border-top">
                    <span className="text-muted small">
                      {t("doctorPrescriptions.prescribedBy", {
                        firstName: doctorUser?.firstName ?? "",
                        lastName: doctorUser?.lastName ?? "",
                      })}
                    </span>
                    <Button type="submit" size="sm" disabled={saving}>
                      {saving ? t("doctorPrescriptions.saving") : t("doctorPrescriptions.savePrescription")}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {selectedPatientId && (
        <Card className="border-0 shadow-sm mt-4">
          <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <Card.Title className="h6 mb-0">
              {t("doctorPrescriptions.activeMedicationsTitle", {
                name: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "",
              })}
            </Card.Title>
            <Link to={`/patient/patient-profile/${selectedPatientId}`} className="btn btn-sm btn-outline-primary rounded-pill">
              {t("doctorPrescriptions.viewPatientProfile")}
            </Link>
          </Card.Header>
          <Card.Body className="p-0">
            {loadingMeds ? (
              <div className="text-center py-5">
                <Spinner animation="border" size="sm" variant="primary" />
              </div>
            ) : medications.length === 0 ? (
              <p className="text-muted small text-center py-4 mb-0">{t("doctorPrescriptions.emptyMedicationsList")}</p>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">{t("doctorPrescriptions.tableMedication")}</th>
                        <th>{t("doctorPrescriptions.tableDosage")}</th>
                        <th>{t("doctorPrescriptions.tableFrequency")}</th>
                        <th>{t("doctorPrescriptions.tablePrescribedBy")}</th>
                        <th className="pe-4">{t("doctorPrescriptions.tablePeriod")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMeds.map((m) => (
                        <tr key={m._id}>
                          <td className="ps-4 fw-semibold">{m.name}</td>
                          <td className="small">{m.dosage || "—"}</td>
                          <td className="small">{formatMedicationFrequencyDisplay(m.frequency, t)}</td>
                          <td className="small text-primary">{m.prescribedBy || "—"}</td>
                          <td className="pe-4 small text-muted">
                            {m.startDate
                              ? formatYmdForLocale(String(m.startDate).slice(0, 10), dateLocaleTag)
                              : "—"}{" "}
                            →{" "}
                            {m.endDate
                              ? formatYmdForLocale(String(m.endDate).slice(0, 10), dateLocaleTag)
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <div className="px-3">
                  <PaginationBar page={medPage} totalPages={medTotalPages} totalItems={medTotalItems} pageSize={5} onPageChange={setMedPage} />
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default DoctorPrescriptions;
