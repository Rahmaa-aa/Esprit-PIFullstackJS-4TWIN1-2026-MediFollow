import React, { useEffect, useState, useMemo } from "react";
import { Button, Card, Col, Container, Row, Spinner, Table, Form, Badge, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { patientApi } from "../../services/api";

const SCORE_ALL = "all";
const SCORE_GOOD = "good";
const SCORE_NORMAL = "normal";
const SCORE_CRITICAL = "critical";

function getPatientScore(p) {
  if (p.vitalScore !== undefined) return p.vitalScore;
  if (p.healthScore !== undefined) return p.healthScore;
  if (p.score !== undefined) return p.score;
  return null;
}

function scoreCategory(p) {
  const s = getPatientScore(p);
  if (s === null) return null;
  if (s >= 75) return SCORE_GOOD;
  if (s >= 40) return SCORE_NORMAL;
  return SCORE_CRITICAL;
}

function ScoreBadge({ patient, t }) {
  const cat = scoreCategory(patient);
  if (cat === null) return <span className="text-muted">—</span>;
  const map = {
    [SCORE_GOOD]: { bg: "success", label: t("doctorMyPatients.scoreGood", "Good") },
    [SCORE_NORMAL]: { bg: "warning", label: t("doctorMyPatients.scoreNormal", "Normal") },
    [SCORE_CRITICAL]: { bg: "danger", label: t("doctorMyPatients.scoreCritical", "Critical") },
  };
  const { bg, label } = map[cat];
  return <Badge bg={bg}>{label}</Badge>;
}

const DoctorMyPatients = () => {
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
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtres
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState(SCORE_ALL);

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
        if (!cancelled) setError(e.message || t("doctorMyPatients.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [doctorId]);

  // Liste unique des départements pour le filtre
  const departments = useMemo(() => {
    const set = new Set();
    patients.forEach((p) => {
      const d = p.department || p.service;
      if (d) set.add(d);
    });
    return Array.from(set).sort();
  }, [patients]);

  // Filtrage
  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
      const matchSearch = !search.trim() || fullName.includes(search.trim().toLowerCase());

      const dept = p.department || p.service || "";
      const matchDept = deptFilter === "all" || dept === deptFilter;

      const cat = scoreCategory(p);
      const matchScore =
        scoreFilter === SCORE_ALL ||
        (scoreFilter === SCORE_CRITICAL && cat === SCORE_CRITICAL) ||
        (scoreFilter === SCORE_NORMAL && cat === SCORE_NORMAL) ||
        (scoreFilter === SCORE_GOOD && cat === SCORE_GOOD);

      return matchSearch && matchDept && matchScore;
    });
  }, [patients, search, deptFilter, scoreFilter]);

  const resetFilters = () => {
    setSearch("");
    setDeptFilter("all");
    setScoreFilter(SCORE_ALL);
  };

  const hasActiveFilters = search.trim() || deptFilter !== "all" || scoreFilter !== SCORE_ALL;

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
          <h4 className="fw-bold mb-1">{t("doctorMyPatients.pageTitle")}</h4>
          <p className="text-muted mb-0">{t("doctorMyPatients.subtitle")}</p>
        </Col>
      </Row>

      {/* Search & Filter bar */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="py-3">
          <Row className="g-2 align-items-end">
            {/* Search by name */}
            <Col xs={12} md={5}>
              <Form.Label className="small fw-semibold text-muted mb-1">
                <i className="ri-search-line me-1"></i>
                {t("doctorMyPatients.searchLabel", "Search by name")}
              </Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="ri-search-line text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={t("doctorMyPatients.searchPlaceholder", "Patient name...")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-start-0 ps-0"
                />
                {search && (
                  <Button variant="outline-secondary" onClick={() => setSearch("")} size="sm">
                    <i className="ri-close-line"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>

            {/* Filter by department */}
            <Col xs={12} md={4}>
              <Form.Label className="small fw-semibold text-muted mb-1">
                <i className="ri-hospital-line me-1"></i>
                {t("doctorMyPatients.deptLabel", "Department")}
              </Form.Label>
              <Form.Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="all">{t("doctorMyPatients.deptAll", "All departments")}</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Form.Select>
            </Col>

            {/* Filter by score */}
            <Col xs={12} md={2}>
              <Form.Label className="small fw-semibold text-muted mb-1">
                <i className="ri-heart-pulse-line me-1"></i>
                {t("doctorMyPatients.scoreLabel", "Health Score")}
              </Form.Label>
              <Form.Select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
              >
                <option value={SCORE_ALL}>{t("doctorMyPatients.scoreAll", "All")}</option>
                <option value={SCORE_GOOD}>{t("doctorMyPatients.scoreGood", "Good")}</option>
                <option value={SCORE_NORMAL}>{t("doctorMyPatients.scoreNormal", "Normal")}</option>
                <option value={SCORE_CRITICAL}>{t("doctorMyPatients.scoreCritical", "Critical")}</option>
              </Form.Select>
            </Col>

            {/* Reset button */}
            <Col xs={12} md={1} className="d-flex align-items-end">
              {hasActiveFilters && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={resetFilters}
                  className="w-100"
                  title={t("doctorMyPatients.resetFilters", "Reset filters")}
                >
                  <i className="ri-refresh-line"></i>
                </Button>
              )}
            </Col>
          </Row>

          {/* Results counter */}
          {!loading && (
            <div className="mt-2 small text-muted">
              {filtered.length === patients.length
                ? t("doctorMyPatients.totalPatients", { count: patients.length }, `${patients.length} patient(s)`)
                : t("doctorMyPatients.filteredCount", { filtered: filtered.length, total: patients.length }, `${filtered.length} of ${patients.length} patient(s)`)}
            </div>
          )}
        </Card.Body>
      </Card>

      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}

      {/* Tableau patients */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5">
              <i className="ri-user-search-line fs-1 text-muted d-block mb-2"></i>
              <p className="text-muted mb-2">
                {hasActiveFilters
                  ? t("doctorMyPatients.noResults", "No patients match the filters")
                  : t("doctorMyPatients.empty")}
              </p>
              {hasActiveFilters && (
                <Button variant="outline-secondary" size="sm" onClick={resetFilters}>
                  <i className="ri-refresh-line me-1"></i>
                  {t("doctorMyPatients.resetFilters", "Reset filters")}
                </Button>
              )}
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>{t("doctorMyPatients.colName")}</th>
                  <th>{t("doctorMyPatients.colEmail")}</th>
                  <th>{t("doctorMyPatients.colDepartment")}</th>
                  <th>{t("doctorMyPatients.colScore", "Health Score")}</th>
                  <th className="text-end"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const pid = p._id || p.id;
                  return (
                    <tr key={pid}>
                      <td className="fw-semibold">
                        {p.firstName} {p.lastName}
                      </td>
                      <td className="text-muted">{p.email}</td>
                      <td>
                        {p.department || p.service
                          ? <Badge bg="light" text="dark" className="border">{p.department || p.service}</Badge>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        <ScoreBadge patient={p} t={t} />
                      </td>
                      <td className="text-end text-nowrap">
                        <Button variant="outline-primary" size="sm" as={Link} to={`/doctor/my-patients/${pid}`}>
                          {t("doctorMyPatients.viewDossier")}
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
