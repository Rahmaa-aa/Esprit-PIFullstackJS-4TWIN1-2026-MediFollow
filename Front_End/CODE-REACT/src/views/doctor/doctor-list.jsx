import React, { useState, useEffect, useMemo } from "react";
import { Col, Row, Form, InputGroup } from "react-bootstrap";
import Card from "../../components/Card";
import { Link } from "react-router-dom";
import { doctorApi } from "../../services/api";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const DEFAULT_AVATAR = generatePath("/assets/images/user/11.png");

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");

  const filteredDoctors = useMemo(() => {
    const nameLower = filterName.trim().toLowerCase();
    const specialtyLower = filterSpecialty.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchName = !nameLower || `${(d.firstName || "").toLowerCase()} ${(d.lastName || "").toLowerCase()}`.includes(nameLower);
      const matchSpecialty = !specialtyLower || (d.specialty || "").toLowerCase().includes(specialtyLower);
      return matchName && matchSpecialty;
    });
  }, [doctors, filterName, filterSpecialty]);

  const fetchDoctors = async () => {
    try {
      const data = await doctorApi.getAll();
      setDoctors(data);
      setError("");
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des médecins");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (doctor) => {
    if (!window.confirm(`Supprimer Dr. ${doctor.firstName} ${doctor.lastName} ?`)) return;
    setDeletingId(doctor._id);
    try {
      await doctorApi.delete(doctor._id);
      setDoctors((prev) => prev.filter((d) => d._id !== doctor._id));
    } catch (err) {
      if (err.status === 401) window.location.href = "/auth/lock-screen";
      else alert(err.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const getImageSrc = (doctor) => {
    if (doctor.profileImage?.startsWith("data:")) return doctor.profileImage;
    if (doctor.profileImage?.startsWith("http") || doctor.profileImage?.startsWith("/")) {
      return doctor.profileImage.startsWith("http") ? doctor.profileImage : generatePath(doctor.profileImage);
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
              <p className="mt-3 mb-0">Chargement des médecins...</p>
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
                <h4 className="card-title">Liste des médecins</h4>
              </Card.Header.Title>
              <Link to="/doctor/add-doctor" className="btn btn-primary-subtle">
                <i className="ri-user-add-fill me-1"></i>Ajouter un médecin
              </Link>
            </Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small">Filtrer par nom</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="ri-user-search-line"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Nom du médecin..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small">Filtrer par spécialité</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="ri-stethoscope-line"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Spécialité..."
                        value={filterSpecialty}
                        onChange={(e) => setFilterSpecialty(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  {(filterName || filterSpecialty) && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => { setFilterName(""); setFilterSpecialty(""); }}
                    >
                      <i className="ri-filter-off-line me-1"></i>Réinitialiser
                    </button>
                  )}
                </Col>
              </Row>
              {(filterName || filterSpecialty) && (
                <p className="text-muted small mb-0 mt-2">
                  {filteredDoctors.length} médecin{filteredDoctors.length !== 1 ? "s" : ""} trouvé{filteredDoctors.length !== 1 ? "s" : ""}
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

        {doctors.length === 0 && !error ? (
          <Col sm={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-3">Aucun médecin enregistré.</p>
                <Link to="/doctor/add-doctor" className="btn btn-primary-subtle">Ajouter le premier médecin</Link>
              </Card.Body>
            </Card>
          </Col>
        ) : doctors.length > 0 && filteredDoctors.length === 0 ? (
          <Col sm={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-3">Aucun médecin ne correspond aux filtres.</p>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => { setFilterName(""); setFilterSpecialty(""); }}
                >
                  Réinitialiser les filtres
                </button>
              </Card.Body>
            </Card>
          </Col>
        ) : null}

        {filteredDoctors.map((doctor) => (
          <Col key={doctor._id} sm={6} md={3}>
            <Card>
              <Card.Body className="text-center">
                <div className="doc-profile">
                  <img
                    className="rounded-circle img-fluid avatar-80"
                    src={getImageSrc(doctor)}
                    alt={doctor.firstName}
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                </div>
                <div className="doc-info mt-3">
                  <h4>Dr. {doctor.firstName} {doctor.lastName}</h4>
                  <p className="mb-0">{doctor.specialty || "Médecin"}</p>
                  <a href={`mailto:${doctor.email}`}>{doctor.email}</a>
                </div>
                <div className="iq-doc-description mt-2">
                  <p className="mb-0">
                    {doctor.department && `${doctor.department} • `}
                    {doctor.phone || "—"}
                  </p>
                </div>
                <div className="doc-social-info mt-3 mb-3">
                  <ul className="m-0 p-0 list-group list-group-horizontal justify-content-center">
                    {doctor.facebookUrl && (
                      <li className="list-group-item border-0 p-0">
                        <a href={doctor.facebookUrl} target="_blank" rel="noopener noreferrer"><i className="ri-facebook-fill"></i></a>
                      </li>
                    )}
                    {doctor.twitterUrl && (
                      <li className="list-group-item border-0 p-0">
                        <a href={doctor.twitterUrl} target="_blank" rel="noopener noreferrer"><i className="ri-twitter-fill"></i></a>
                      </li>
                    )}
                    {doctor.linkedinUrl && (
                      <li className="list-group-item border-0 p-0">
                        <a href={doctor.linkedinUrl} target="_blank" rel="noopener noreferrer"><i className="ri-linkedin-fill"></i></a>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <Link to={`/doctor/doctor-profile/${doctor._id}`} className="btn btn-primary-subtle btn-sm">Profil</Link>
                  <Link to={`/doctor/edit-doctor/${doctor._id}`} className="btn btn-warning-subtle btn-sm">Modifier</Link>
                  <button
                    type="button"
                    className="btn btn-danger-subtle btn-sm"
                    onClick={() => handleDelete(doctor)}
                    disabled={deletingId === doctor._id}
                  >
                    {deletingId === doctor._id ? "..." : "Supprimer"}
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default DoctorList;
