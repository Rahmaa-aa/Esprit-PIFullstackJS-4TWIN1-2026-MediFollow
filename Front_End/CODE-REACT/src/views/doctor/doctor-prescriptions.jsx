import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { patientApi, medicationApi } from "../../services/api";

const FREQUENCIES = [
  "1 fois par jour",
  "2 fois par jour",
  "3 fois par jour",
  "Toutes les 8 heures",
  "Hebdomadaire",
  "Si besoin",
];

const newLineId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const emptyMedicationLine = () => ({
  id: newLineId(),
  name: "",
  dosage: "",
  frequency: FREQUENCIES[0],
  startDate: "",
  endDate: "",
  notes: "",
});

const DoctorPrescriptions = () => {
  const [doctorUser, setDoctorUser] = useState(() => {
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
        if (!cancelled) setError(e.message || "Impossible de charger les patients");
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
          setError(e.message || "Erreur chargement médicaments");
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

  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    const toSave = lines.filter((row) => row.name?.trim());
    if (toSave.length === 0) {
      setError("Saisissez au moins un nom de médicament.");
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
      setError(err.message || "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  if (!doctorId) {
    return (
      <Container className="py-5">
        <p className="text-muted text-center">Connectez-vous en tant que médecin pour gérer les ordonnances.</p>
        <div className="text-center">
          <Link to="/auth/sign-in" className="btn btn-primary">
            Connexion
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="pb-5">
      <Row className="mb-4">
        <Col>
          <h4 className="fw-bold mb-1">Ordonnances médicales</h4>
          <p className="text-muted mb-0">
            Ajoutez les médicaments prescrits pour chaque patient que vous suivez. Ils apparaissent sur le tableau de bord
            du patient.
          </p>
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
                Patient
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {loadingPatients ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              ) : patients.length === 0 ? (
                <p className="text-muted small mb-0">
                  Aucun patient ne vous est assigné. Un administrateur doit vous attribuer des patients (équipe soignante).
                </p>
              ) : (
                <Form.Group>
                  <Form.Label>Sélectionner un patient</Form.Label>
                  <Form.Select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    aria-label="Patient"
                  >
                    <option value="">— Choisir —</option>
                    {patients.map((p) => (
                      <option key={p._id || p.id} value={String(p._id || p.id)}>
                        {p.firstName} {p.lastName} — {p.email}
                      </option>
                    ))}
                  </Form.Select>
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
                Nouvelle ordonnance (plusieurs médicaments)
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {!selectedPatientId ? (
                <p className="text-muted small mb-0">Choisissez d&apos;abord un patient à gauche.</p>
              ) : (
                <Form onSubmit={handleAddMedication}>
                  {lines.map((row, index) => (
                    <div
                      key={row.id}
                      className="rounded-3 border p-3 mb-3"
                      style={{ backgroundColor: index % 2 === 0 ? "#fafbfc" : "#fff" }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-bold text-primary">Médicament {index + 1}</span>
                        {lines.length > 1 && (
                          <Button
                            type="button"
                            variant="outline-danger"
                            size="sm"
                            className="py-0 px-2"
                            onClick={() => removeMedicationRow(row.id)}
                            aria-label={`Retirer le médicament ${index + 1}`}
                          >
                            <i className="ri-delete-bin-line" />
                          </Button>
                        )}
                      </div>
                      <Row className="g-2">
                        <Col md={12}>
                          <Form.Label className="small fw-semibold">Nom du médicament *</Form.Label>
                          <Form.Control
                            size="sm"
                            placeholder="ex. Metoprolol"
                            value={row.name}
                            onChange={(e) => updateLine(row.id, { name: e.target.value })}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small fw-semibold">Dosage</Form.Label>
                          <Form.Control
                            size="sm"
                            placeholder="ex. 50 mg"
                            value={row.dosage}
                            onChange={(e) => updateLine(row.id, { dosage: e.target.value })}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small fw-semibold">Fréquence</Form.Label>
                          <Form.Select
                            size="sm"
                            value={row.frequency}
                            onChange={(e) => updateLine(row.id, { frequency: e.target.value })}
                          >
                            {FREQUENCIES.map((fr) => (
                              <option key={fr} value={fr}>
                                {fr}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small fw-semibold">Date de début</Form.Label>
                          <Form.Control
                            type="date"
                            size="sm"
                            value={row.startDate}
                            onChange={(e) => updateLine(row.id, { startDate: e.target.value })}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small fw-semibold">Date de fin</Form.Label>
                          <Form.Control
                            type="date"
                            size="sm"
                            value={row.endDate}
                            onChange={(e) => updateLine(row.id, { endDate: e.target.value })}
                          />
                        </Col>
                        <Col md={12}>
                          <Form.Label className="small fw-semibold">Notes</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            size="sm"
                            placeholder="ex. À prendre pendant les repas"
                            value={row.notes}
                            onChange={(e) => updateLine(row.id, { notes: e.target.value })}
                          />
                        </Col>
                      </Row>
                    </div>
                  ))}

                  <p className="text-muted small mb-2">
                    Les lignes sans nom de médicament sont ignorées à l&apos;enregistrement.
                  </p>
                  <Button
                    type="button"
                    variant="outline-primary"
                    size="sm"
                    className="w-100 mb-3"
                    onClick={addMedicationRow}
                    disabled={saving}
                  >
                    <i className="ri-add-line me-1" />
                    Ajouter un autre médicament
                  </Button>

                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-1 border-top">
                    <span className="text-muted small">
                      Prescrit par : Dr. {doctorUser?.firstName} {doctorUser?.lastName}
                    </span>
                    <Button type="submit" size="sm" disabled={saving}>
                      {saving ? "Enregistrement…" : "Enregistrer l'ordonnance"}
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
              Médicaments actifs — {selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : ""}
            </Card.Title>
            <Link to={`/patient/patient-profile/${selectedPatientId}`} className="btn btn-sm btn-outline-primary rounded-pill">
              Voir le profil patient
            </Link>
          </Card.Header>
          <Card.Body className="p-0">
            {loadingMeds ? (
              <div className="text-center py-5">
                <Spinner animation="border" size="sm" variant="primary" />
              </div>
            ) : medications.length === 0 ? (
              <p className="text-muted small text-center py-4 mb-0">Aucun médicament pour ce patient.</p>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Médicament</th>
                      <th>Dosage</th>
                      <th>Fréquence</th>
                      <th>Prescrit par</th>
                      <th className="pe-4">Période</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((m) => (
                      <tr key={m._id}>
                        <td className="ps-4 fw-semibold">{m.name}</td>
                        <td className="small">{m.dosage || "—"}</td>
                        <td className="small">{m.frequency || "—"}</td>
                        <td className="small text-primary">{m.prescribedBy || "—"}</td>
                        <td className="pe-4 small text-muted">
                          {m.startDate || "—"} → {m.endDate || "—"}
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
    </Container>
  );
};

export default DoctorPrescriptions;
