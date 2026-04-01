import React, { useState, useEffect, useMemo } from "react";
import { Col, Row, Form, InputGroup } from "react-bootstrap";
import Card from "../../components/Card";
import { Link } from "react-router-dom";
import { patientApi, doctorApi, nurseApi } from "../../services/api";
import ConfirmActionModal from "../../components/ConfirmActionModal";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const DEFAULT_AVATAR = generatePath("/assets/images/user/11.png");

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [doctorById, setDoctorById] = useState({});
  const [nurseById, setNurseById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterService, setFilterService] = useState("");

  const filteredPatients = useMemo(() => {
    const nameLower = filterName.trim().toLowerCase();
    const emailLower = filterEmail.trim().toLowerCase();
    const serviceLower = filterService.trim().toLowerCase();
    return patients.filter((p) => {
      const matchName = !nameLower || `${(p.firstName || "").toLowerCase()} ${(p.lastName || "").toLowerCase()}`.includes(nameLower);
      const matchEmail = !emailLower || (p.email || "").toLowerCase().includes(emailLower);
      const matchService = !serviceLower || (p.service || "").toLowerCase().includes(serviceLower);
      return matchName && matchEmail && matchService;
    });
  }, [patients, filterName, filterEmail, filterService]);

  const fetchPatients = async () => {
    try {
      const [data, doctors, nurses] = await Promise.all([
        patientApi.getAll(),
        doctorApi.getAll().catch(() => []),
        nurseApi.getAll().catch(() => []),
      ]);
      setPatients(data);
      const dMap = {};
      (Array.isArray(doctors) ? doctors : []).forEach((d) => {
        const id = (d._id || d.id)?.toString();
        if (id) dMap[id] = d;
      });
      const nMap = {};
      (Array.isArray(nurses) ? nurses : []).forEach((n) => {
        const id = (n._id || n.id)?.toString();
        if (id) nMap[id] = n;
      });
      setDoctorById(dMap);
      setNurseById(nMap);
      setError("");
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des patients");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (patient) => {
    setDeletingId(patient._id);
    try {
      await patientApi.delete(patient._id);
      setPatients((prev) => prev.filter((p) => p._id !== patient._id));
      setPatientToDelete(null);
    } catch (err) {
      if (err.status === 401) window.location.href = "/auth/lock-screen";
      else alert(err.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const getImageSrc = (patient) => {
    if (patient.profileImage?.startsWith("data:")) return patient.profileImage;
    if (patient.profileImage?.startsWith("http") || patient.profileImage?.startsWith("/")) {
      return patient.profileImage.startsWith("http") ? patient.profileImage : generatePath(patient.profileImage);
    }
    return DEFAULT_AVATAR;
  };

  if (loading) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 mb-0">Chargement des patients...</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="card-header-custom d-flex justify-content-between align-items-center p-4 mb-0 border-bottom-0">
              <Card.Header.Title>
                <h4 className="card-title">Liste des patients</h4>
              </Card.Header.Title>
              <Link to="/patient/add-patient" className="btn btn-primary-subtle">
                <i className="ri-user-add-fill me-1"></i>Ajouter un patient
              </Link>
            </Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small">Filtrer par nom</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="ri-user-search-line"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Nom du patient..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small">Filtrer par email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="ri-mail-line"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Email..."
                        value={filterEmail}
                        onChange={(e) => setFilterEmail(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small">Filtrer par service</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="ri-hospital-line"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Service..."
                        value={filterService}
                        onChange={(e) => setFilterService(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  {(filterName || filterEmail || filterService) && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => { setFilterName(""); setFilterEmail(""); setFilterService(""); }}
                    >
                      <i className="ri-filter-off-line me-1"></i>Réinitialiser
                    </button>
                  )}
                </Col>
              </Row>
              {(filterName || filterEmail || filterService) && (
                <p className="text-muted small mb-0 mt-2">
                  {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""} trouvé{filteredPatients.length !== 1 ? "s" : ""}
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {error && (
          <Col sm={12}>
            <div className="alert alert-warning mt-3">{error}</div>
          </Col>
        )}

        {patients.length === 0 && !error ? (
          <Col sm={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-3">Aucun patient enregistré.</p>
                <Link to="/patient/add-patient" className="btn btn-primary-subtle">Ajouter le premier patient</Link>
              </Card.Body>
            </Card>
          </Col>
        ) : patients.length > 0 && filteredPatients.length === 0 ? (
          <Col sm={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-3">Aucun patient ne correspond aux filtres.</p>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => { setFilterName(""); setFilterEmail(""); setFilterService(""); }}
                >
                  Réinitialiser les filtres
                </button>
              </Card.Body>
            </Card>
          </Col>
        ) : null}

        {filteredPatients.map((patient) => (
          <Col key={patient._id} sm={6} md={3}>
            <Card>
              <Card.Body className="text-center">
                <div className="doc-profile">
                  <img
                    className="rounded-circle img-fluid avatar-80"
                    src={getImageSrc(patient)}
                    alt={patient.firstName}
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                </div>
                <div className="doc-info mt-3">
                  <h4>{patient.firstName} {patient.lastName}</h4>
                  <p className="mb-0">{patient.department || patient.service || "—"}</p>
                  <a href={`mailto:${patient.email}`}>{patient.email}</a>
                </div>
                <div className="iq-doc-description mt-2 text-start small px-2">
                  <p className="mb-1">
                    <i className="ri-stethoscope-line text-success me-1" />
                    <span className="text-muted">Médecin : </span>
                    {(() => {
                      const id = patient.doctorId?.toString();
                      const d = id && doctorById[id];
                      return d ? `Dr. ${d.firstName} ${d.lastName}` : "—";
                    })()}
                  </p>
                  <p className="mb-0">
                    <i className="ri-nurse-line text-warning me-1" />
                    <span className="text-muted">Infirmier(e) : </span>
                    {(() => {
                      const id = patient.nurseId?.toString();
                      const n = id && nurseById[id];
                      return n ? `${n.firstName} ${n.lastName}` : "—";
                    })()}
                  </p>
                  <p className="mb-0 mt-2">
                    {patient.phone || "—"}
                  </p>
                </div>
                <div className="d-flex gap-2 justify-content-center flex-wrap mt-3">
                  <Link to={`/patient/patient-profile/${patient._id}`} className="btn btn-primary-subtle btn-sm">Profil</Link>
                  <Link to={`/patient/edit-patient/${patient._id}`} className="btn btn-warning-subtle btn-sm">Modifier</Link>
                  <button
                    type="button"
                    className="btn btn-danger-subtle btn-sm"
                    onClick={() => setPatientToDelete(patient)}
                    disabled={deletingId === patient._id}
                  >
                    {deletingId === patient._id ? "..." : "Supprimer"}
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <ConfirmActionModal
        show={!!patientToDelete}
        title="Supprimer ce patient ?"
        message={`Cette action supprimera définitivement ${patientToDelete?.firstName || ""} ${patientToDelete?.lastName || ""}.`}
        onCancel={() => setPatientToDelete(null)}
        onConfirm={() => patientToDelete && handleDelete(patientToDelete)}
        confirmLabel="Supprimer"
        loading={deletingId === patientToDelete?._id}
        iconClass="ri-delete-bin-6-line"
      />
    </>
  );
};

export default PatientList;
