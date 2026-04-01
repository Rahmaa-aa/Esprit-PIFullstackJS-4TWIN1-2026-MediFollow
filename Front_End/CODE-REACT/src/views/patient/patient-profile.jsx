import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import Card from "../../components/Card";
import FaceEnrollmentCard from "../../components/FaceEnrollmentCard";
import { patientApi, doctorApi, nurseApi } from "../../services/api";

import img11 from "/assets/images/user/11.png";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const PatientProfile = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);

  useEffect(() => {
    if (!id) return;
    const fetchPatient = async () => {
      try {
        const [data, dList, nList] = await Promise.all([
          patientApi.getById(id),
          doctorApi.getAll().catch(() => []),
          nurseApi.getAll().catch(() => []),
        ]);
        setPatient(data);
        setDoctors(Array.isArray(dList) ? dList : []);
        setNurses(Array.isArray(nList) ? nList : []);
      } catch (err) {
        setError(err.message || "Patient non trouvé");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const assignedDoctor = patient?.doctorId
    ? doctors.find((d) => (d._id || d.id)?.toString() === patient.doctorId?.toString())
    : null;
  const assignedNurse = patient?.nurseId
    ? nurses.find((n) => (n._id || n.id)?.toString() === patient.nurseId?.toString())
    : null;

  const displayPatient = patient || {};
  const profileImg = patient?.profileImage
    ? (patient.profileImage.startsWith("data:") ? patient.profileImage
      : (patient.profileImage.startsWith("http") ? patient.profileImage : generatePath(patient.profileImage)))
    : img11;

  if (loading) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 mb-0">Chargement du profil...</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (id && error) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <p className="text-danger mb-3">{error}</p>
              <Link to="/patient/patient-list" className="btn btn-primary-subtle">Retour à la liste</Link>
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
          <FaceEnrollmentCard />
        </Col>
      </Row>
      <Row>
        <Col lg={4}>
          <Card>
            <Card.Body className="ps-0 pe-0 pt-0">
              <div className="docter-details-block">
                <div className="doc-profile-bg bg-primary rounded-top-2" style={{ height: "150px" }}>
                </div>
                <div className="docter-profile text-center">
                  <img src={profileImg} alt="profile-img" className="avatar-130 img-fluid" style={{ objectFit: "cover" }} />
                </div>
                <div className="text-center mt-3 ps-3 pe-3">
                  <h4><b>{displayPatient.firstName} {displayPatient.lastName}</b></h4>
                  <p className="mb-0">{displayPatient.email || "—"}</p>
                </div>
                <hr />
                <ul className="doctoe-sedual d-flex align-items-center justify-content-between p-0 m-0">
                  <li className="text-center">
                    <h6 className="mb-0">Groupe sanguin</h6>
                    <span>{displayPatient.bloodType || "—"}</span>
                  </li>
                  <li className="text-center">
                    <h6 className="mb-0">Genre</h6>
                    <span>{displayPatient.gender || "—"}</span>
                  </li>
                  <li className="text-center">
                    <h6 className="mb-0">Date de naissance</h6>
                    <span>{displayPatient.dateOfBirth || "—"}</span>
                  </li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Informations personnelles</h4>
              </Card.Header.Title>
              <Link to={`/patient/edit-patient/${id}`} className="btn btn-primary-subtle btn-sm">Modifier</Link>
            </Card.Header>
            <Card.Body>
              <div className="about-info m-0 p-0">
                <Row>
                  <Col xs={4}>Prénom :</Col>
                  <Col xs={8}>{displayPatient.firstName || "—"}</Col>
                  <Col xs={4}>Nom :</Col>
                  <Col xs={8}>{displayPatient.lastName || "—"}</Col>
                  <Col xs={4}>Email :</Col>
                  <Col xs={8}>
                    <a href={`mailto:${displayPatient.email || ""}`}>{displayPatient.email || "—"}</a>
                  </Col>
                  <Col xs={4}>Téléphone :</Col>
                  <Col xs={8}>
                    <a href={`tel:${displayPatient.phone || ""}`}>{displayPatient.phone || "—"}</a>
                  </Col>
                  <Col xs={4}>Contact alternatif :</Col>
                  <Col xs={8}>{displayPatient.alternateContact || "—"}</Col>
                  <Col xs={4}>Département / service :</Col>
                  <Col xs={8}>{displayPatient.department || displayPatient.service || "—"}</Col>
                  <Col xs={4}>Adresse :</Col>
                  <Col xs={8}>{displayPatient.address || "—"}</Col>
                  <Col xs={4}>Ville :</Col>
                  <Col xs={8}>{displayPatient.city || "—"}</Col>
                  <Col xs={4}>Pays :</Col>
                  <Col xs={8}>{displayPatient.country || "—"}</Col>
                  <Col xs={4}>Code postal :</Col>
                  <Col xs={8}>{displayPatient.pinCode || "—"}</Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
          <Card className="mt-4">
            <Card.Header>
              <Card.Header.Title>
                <h4 className="card-title mb-0">Équipe soignante</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div className="border rounded-3 p-3 h-100 bg-light-subtle">
                    <div className="text-muted small text-uppercase mb-1">Médecin référent</div>
                    {assignedDoctor ? (
                      <>
                        <div className="fw-semibold">
                          Dr. {assignedDoctor.firstName} {assignedDoctor.lastName}
                        </div>
                        {assignedDoctor.specialty && <div className="small text-muted">{assignedDoctor.specialty}</div>}
                        {assignedDoctor.email && (
                          <a href={`mailto:${assignedDoctor.email}`} className="small d-inline-block mt-1">
                            {assignedDoctor.email}
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">Non assigné</span>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="border rounded-3 p-3 h-100 bg-light-subtle">
                    <div className="text-muted small text-uppercase mb-1">Infirmier(e)</div>
                    {assignedNurse ? (
                      <>
                        <div className="fw-semibold">
                          {assignedNurse.firstName} {assignedNurse.lastName}
                        </div>
                        {assignedNurse.department && <div className="small text-muted">{assignedNurse.department}</div>}
                        {assignedNurse.email && (
                          <a href={`mailto:${assignedNurse.email}`} className="small d-inline-block mt-1">
                            {assignedNurse.email}
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">Non assigné(e)</span>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PatientProfile;
