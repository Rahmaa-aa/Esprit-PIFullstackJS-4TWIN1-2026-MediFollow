import React, { useEffect, useState } from "react";
import { Badge, Card, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { departmentApi } from "../../services/api";

const DoctorDepartmentDoctors = () => {
  const [doctorUser] = useState(() => {
    try {
      const s = localStorage.getItem("doctorUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const doctorId = doctorUser?.id || doctorUser?._id;
  const [department, setDepartment] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await departmentApi.getMyDoctorsAsDoctor();
        if (!cancelled) {
          setDepartment(data?.department || "");
          setDoctors(Array.isArray(data?.doctors) ? data.doctors : []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Impossible de charger les médecins");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  if (!doctorId) {
    return (
      <Container className="py-5">
        <p className="text-muted text-center">Connectez-vous en tant que médecin.</p>
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
          <h4 className="fw-bold mb-1">Médecins du département</h4>
          <p className="text-muted mb-0">
            {department
              ? `Collaborateurs du service : ${department}`
              : "Votre profil ne comporte pas encore de département défini (par un administrateur)."}
          </p>
        </Col>
      </Row>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : !department ? (
            <p className="text-muted text-center py-5 mb-0">
              Aucun département renseigné sur votre compte — la liste des médecins du même service ne peut pas être
              affichée.
            </p>
          ) : doctors.length === 0 ? (
            <p className="text-muted text-center py-5 mb-0">Aucun médecin enregistré pour ce département.</p>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Spécialité</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => {
                  const did = d._id || d.id;
                  const isMe = String(did) === String(doctorId);
                  return (
                    <tr key={did}>
                      <td className="fw-semibold">
                        {d.firstName} {d.lastName}
                        {isMe && (
                          <Badge bg="primary" className="ms-2" pill>
                            Vous
                          </Badge>
                        )}
                      </td>
                      <td>{d.email}</td>
                      <td>{d.specialty || "—"}</td>
                      <td className="text-end">
                        <Link to={`/doctor/doctor-profile/${did}`} className="btn btn-sm btn-outline-primary">
                          Profil
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DoctorDepartmentDoctors;
