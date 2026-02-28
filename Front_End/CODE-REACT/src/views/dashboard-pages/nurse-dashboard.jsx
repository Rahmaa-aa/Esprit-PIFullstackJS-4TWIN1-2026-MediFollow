import React, { useState, useEffect } from "react";
import { Row, Col, Badge, ListGroup } from "react-bootstrap";
import Card from "../../components/Card";
import { nurseApi } from "../../services/api";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const NurseDashboard = () => {
  const [nurseUser, setNurseUser] = useState(() => {
    try {
      const stored = localStorage.getItem("nurseUser");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const id = nurseUser?.id || nurseUser?._id;
    if (id) {
      nurseApi.getById(id)
        .then((nurse) => setNurseUser((prev) => prev ? { ...prev, ...nurse, id: nurse._id || nurse.id } : prev))
        .catch(() => {});
    }
  }, []);

  const profileImg = nurseUser?.profileImage?.startsWith("data:")
    ? nurseUser.profileImage
    : nurseUser?.profileImage?.startsWith("http")
    ? nurseUser.profileImage
    : nurseUser?.profileImage
    ? generatePath(nurseUser.profileImage.startsWith("/") ? nurseUser.profileImage.slice(1) : nurseUser.profileImage)
    : generatePath("/assets/images/user/11.png");

  return (
    <>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Header.Title>
                <h4 className="card-title mb-0">
                  Tableau de bord Infirmier(ère) - Suivi quotidien
                </h4>
              </Card.Header.Title>
              <Badge bg="primary">Connecté</Badge>
            </Card.Header>
            <Card.Body>
              <Card className="border-0 shadow-sm">
                <Card.Body className="d-flex align-items-center">
                  <img
                    src={profileImg}
                    alt="Profil"
                    className="rounded-circle me-3"
                    style={{ width: 80, height: 80, objectFit: "cover" }}
                  />
                  <div>
                    <h5 className="mb-1">
                      {nurseUser ? `${nurseUser.firstName || ""} ${nurseUser.lastName || ""}`.trim() || nurseUser.email : "Infirmier(ère)"}
                    </h5>
                    <p className="text-muted mb-0">
                      {nurseUser?.specialty || "Infirmier(ère)"} • {nurseUser?.department || "—"}
                    </p>
                    <small className="text-muted">{nurseUser?.email}</small>
                  </div>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={4}>
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h5 className="card-title mb-0">
                  <i className="ri-calendar-check-line me-2"></i>
                  Suivi quotidien
                </h5>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <Card className="border-0 bg-primary-subtle">
                <Card.Body>
                  <h6 className="text-primary">Patients à surveiller aujourd'hui</h6>
                  <p className="mb-0 fs-4">—</p>
                  <small className="text-muted">Mise à jour en cours</small>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h5 className="card-title mb-0">
                  <i className="ri-file-edit-line me-2"></i>
                  Saisie des données
                </h5>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <Card className="border-0 bg-success-subtle">
                <Card.Body>
                  <h6 className="text-success">Fiches à compléter</h6>
                  <p className="mb-0 fs-4">—</p>
                  <small className="text-muted">Mise à jour en cours</small>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h5 className="card-title mb-0">
                  <i className="ri-alarm-warning-line me-2"></i>
                  Alertes suivies
                </h5>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <Card className="border-0 bg-warning-subtle">
                <Card.Body>
                  <h6 className="text-warning">Notifications en attente</h6>
                  <p className="mb-0 fs-4">—</p>
                  <small className="text-muted">Mise à jour en cours</small>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h5 className="card-title mb-0">
                  <i className="ri-information-line me-2"></i>
                  Rôle Infirmier(ère) - General Practitioners/Nurses
                </h5>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Suivi quotidien</strong> : Surveillance des patients en post-hospitalisation
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Saisie des données</strong> : Enregistrement des données de santé et des observations
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Suivi des alertes</strong> : Gestion et suivi des notifications et alertes patients
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default NurseDashboard;
