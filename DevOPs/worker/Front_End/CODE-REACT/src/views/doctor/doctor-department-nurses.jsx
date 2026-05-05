import React, { useEffect, useState, useMemo } from "react";
import { Badge, Button, Card, Col, Container, Form, InputGroup, Row, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { departmentApi } from "../../services/api";
import PaginationBar from "../../components/PaginationBar";
import { usePagination } from "../../hooks/usePagination";

const PREDEFINED_SPECIALTIES = [
  "Pediatrics",
  "Cardiology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Dermatology",
  "Psychiatry",
  "Emergency",
  "Intensive Care",
  "Obstetrics & Gynecology",
  "Geriatrics",
  "Nephrology",
  "Pulmonology",
  "Gastroenterology",
  "General Surgery",
];

const DoctorDepartmentNurses = () => {
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
  const [nurses, setNurses] = useState([]);
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
        const data = await departmentApi.getMyNursesAsDoctor();
        if (!cancelled) {
          setDepartment(data?.department || "");
          setNurses(Array.isArray(data?.nurses) ? data.nurses : []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || t("doctorDepartmentNurses.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [doctorId]);

  const specialties = useMemo(() => {
    const set = new Set(PREDEFINED_SPECIALTIES);
    nurses.forEach((n) => { if (n.specialty) set.add(n.specialty); });
    return Array.from(set).sort();
  }, [nurses]);

  const filtered = useMemo(() => {
    return nurses.filter((n) => {
      const fullName = `${n.firstName || ""} ${n.lastName || ""}`.toLowerCase();
      const matchSearch = !search.trim() || fullName.includes(search.trim().toLowerCase());
      const matchSpecialty = specialtyFilter === "all" || (n.specialty || "") === specialtyFilter;
      return matchSearch && matchSpecialty;
    });
  }, [nurses, search, specialtyFilter]);

  const hasActiveFilters = search.trim() || specialtyFilter !== "all";

  const { page, setPage, totalPages, paginated, totalItems } = usePagination(filtered, 5);

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
          <h4 className="fw-bold mb-1">{t("doctorDepartmentNurses.pageTitle")}</h4>
          <p className="text-muted mb-0">
            {department
              ? t("doctorDepartmentNurses.subtitleWithDept", { department })
              : t("doctorDepartmentNurses.subtitleNoDept")}
          </p>
        </Col>
      </Row>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {!loading && nurses.length > 0 && (
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
                    placeholder="Nurse name..."
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
              {filtered.length === nurses.length
                ? `${nurses.length} nurse(s)`
                : `${filtered.length} of ${nurses.length} nurse(s)`}
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
            <p className="text-muted text-center py-5 mb-0">{t("doctorDepartmentNurses.emptyNoDept")}</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5">
              <i className="ri-user-search-line fs-1 text-muted d-block mb-2"></i>
              <p className="text-muted mb-0">
                {hasActiveFilters ? "No nurses match the filters." : t("doctorDepartmentNurses.emptyNoNurses")}
              </p>
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>{t("doctorDepartmentNurses.colName")}</th>
                  <th>{t("doctorDepartmentNurses.colEmail")}</th>
                  <th>{t("doctorDepartmentNurses.colSpecialty")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((n) => {
                  const nid = n._id || n.id;
                  return (
                    <tr key={nid}>
                      <td className="fw-semibold">{n.firstName} {n.lastName}</td>
                      <td className="text-muted">{n.email}</td>
                      <td>
                        {n.specialty
                          ? <Badge bg="light" text="dark" className="border">{n.specialty}</Badge>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="text-end">
                        <Link to={`/nurse/nurse-profile/${nid}`} className="btn btn-sm btn-outline-primary">
                          {t("doctorDepartmentNurses.profile")}
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
      {!loading && filtered.length > 0 && (
        <div className="px-3">
          <PaginationBar page={page} totalPages={totalPages} totalItems={totalItems} pageSize={5} onPageChange={setPage} />
        </div>
      )}
    </Container>
  );
};

export default DoctorDepartmentNurses;
