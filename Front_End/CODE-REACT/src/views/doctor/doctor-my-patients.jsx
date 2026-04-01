import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { patientApi } from "../../services/api";

const DoctorMyPatients = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const raw = await patientApi.getMyAssignedForDoctor();
        if (!cancelled) setPatients(Array.isArray(raw) ? raw : []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Impossible de charger les patients");
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
          <h4 className="fw-bold mb-1">Mes patients</h4>
          <p className="text-muted mb-0">Patients dont vous êtes le médecin référent.</p>
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
          ) : patients.length === 0 ? (
            <p className="text-muted text-center py-5 mb-0">Aucun patient ne vous est assigné pour le moment.</p>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Département</th>
                  <th className="text-end"></th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => {
                  const pid = p._id || p.id;
                  return (
                    <tr key={pid}>
                      <td className="fw-semibold">
                        {p.firstName} {p.lastName}
                      </td>
                      <td>{p.email}</td>
                      <td>{p.department || p.service || "—"}</td>
                      <td className="text-end text-nowrap">
                        <Button variant="outline-primary" size="sm" as={Link} to={`/doctor/my-patients/${pid}`}>
                          Voir le dossier patient
                        </Button>
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

export default DoctorMyPatients;
