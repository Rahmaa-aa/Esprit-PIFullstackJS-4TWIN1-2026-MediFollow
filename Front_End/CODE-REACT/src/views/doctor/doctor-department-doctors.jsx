import React, { useEffect, useState, useMemo } from "react";
import { Badge, Button, Card, Col, Container, Form, InputGroup, Row, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { departmentApi } from "../../services/api";

const PREDEFINED_SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Emergency",
  "Gastroenterology",
  "General Surgery",
  "Geriatrics",
  "Intensive Care",
  "Nephrology",
  "Neurology",
  "Obstetrics & Gynecology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
];

const DoctorDepartmentDoctors = () => {
  const { t } = useTranslation();
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

  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

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
        if (!cancelled) setError(e.message || t("doctorDepartmentDoctors.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [doctorId]);

  const specialties = useMemo(() => {
    const set = new Set(PREDEFINED_SPECIALTIES);
    doctors.forEach((d) => { if (d.specialty) set.add(d.specialty); });
    return Array.from(set).sort();
  }, [doctors]);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const fullName = `${d.firstName || ""} ${d.lastName || ""}`.toLowerCase();
      const matchSearch = !search.trim() || fullName.includes(search.trim().toLowerCase());
      const matchSpecialty = specialtyFilter === "all" || (d.specialty || "") === specialtyFilter;
      return matchSearch && matchSpecialty;
    });
  }, [doctors, search, specialtyFilter]);

  const hasActiveFilters = search.trim() || specialtyFilter !== "all";

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
      <Row className="mb-4">
        <Col>
          <h4 className="fw-bold mb-1">{t("doctorDepartmentDoctors.pageTitle")}</h4>
          <p className="text-muted mb-0">
            {department
              ? t("doctorDepartmentDoctors.subtitleWithDept", { department })
              : t("doctorDepartmentDoctors.subtitleNoDept")}
          </p>
        </Col>
      </Row>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {!loading && doctors.length > 0 && (
        <Card className="border-0 shadow-sm mb-3">
          <Card.Body className="py-3">
            <Row className="g-2 align-items-end">
              <Col xs={12} md={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">
                  <i className="ri-search-line me-1"></i>
                  Search by name
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <i className="ri-search-line text-muted"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Doctor name..."
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

              <Col xs={12} md={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">
                  <i className="ri-stethoscope-line me-1"></i>
                  Specialty
                </Form.Label>
                <Form.Select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                >
                  <option value="all">All specialties</option>
                  {specialties.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <div className="mt-2 small text-muted">
              {filtered.length === doctors.length
                ? `${doctors.length} doctor(s)`
                : `${filtered.length} of ${doctors.length} doctor(s)`}
            </div>
          </Card.Body>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : !department ? (
            <p className="text-muted text-center py-5 mb-0">{t("doctorDepartmentDoctors.emptyNoDept")}</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5">
              <i className="ri-user-search-line fs-1 text-muted d-block mb-2"></i>
              <p className="text-muted mb-0">
                {hasActiveFilters ? "No doctors match the filters." : t("doctorDepartmentDoctors.emptyNoDoctors")}
              </p>
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>{t("doctorDepartmentDoctors.colName")}</th>
                  <th>{t("doctorDepartmentDoctors.colEmail")}</th>
                  <th>{t("doctorDepartmentDoctors.colSpecialty")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const did = d._id || d.id;
                  const isMe = String(did) === String(doctorId);
                  return (
                    <tr key={did}>
                      <td className="fw-semibold">
                        {d.firstName} {d.lastName}
                        {isMe && (
                          <Badge bg="primary" className="ms-2" pill>You</Badge>
                        )}
                      </td>
                      <td className="text-muted">{d.email}</td>
                      <td>
                        {d.specialty
                          ? <Badge bg="light" text="dark" className="border">{d.specialty}</Badge>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="text-end">
                        <Link to={`/doctor/doctor-profile/${did}`} className="btn btn-sm btn-outline-primary">
                          {t("doctorDepartmentDoctors.profile")}
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
