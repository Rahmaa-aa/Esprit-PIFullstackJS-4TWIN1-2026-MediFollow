import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { departmentApi } from "../../services/api";

const ACCENT_VARIANTS = ["primary", "success", "info", "warning", "danger", "secondary"];

const hashIndex = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h) % ACCENT_VARIANTS.length;
};

const AdminDepartments = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const data = await departmentApi.summary();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || t("adminDepartments.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((d) => d.name.toLowerCase().includes(q));
  }, [items, query]);

  const totalProfiles = useMemo(() => items.reduce((s, d) => s + (d.total || 0), 0), [items]);

  return (
    <>
      <style>{`
        .admin-dept-page .dept-tile {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .admin-dept-page .dept-tile:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.75rem 1.75rem rgba(15, 23, 42, 0.09) !important;
        }
        .admin-dept-hero {
          background: linear-gradient(135deg, rgba(13, 110, 253, 0.08) 0%, rgba(13, 202, 240, 0.06) 50%, rgba(25, 135, 84, 0.05) 100%);
          border: 1px solid rgba(13, 110, 253, 0.12);
        }
      `}</style>

      <Container fluid className="admin-dept-page pb-5">
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm overflow-hidden admin-dept-hero rounded-3">
              <Card.Body className="p-4 p-lg-5">
                <Row className="align-items-center gy-3">
                  <Col lg={8}>
                    <div className="d-flex align-items-start gap-3">
                      <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 56, height: 56 }}>
                        <i className="ri-building-2-fill" style={{ fontSize: "1.75rem" }} />
                      </div>
                      <div>
                        <div className="text-uppercase text-primary fw-semibold small mb-1" style={{ letterSpacing: "0.08em" }}>{t("adminDepartments.eyebrow")}</div>
                        <h3 className="fw-bold mb-2">{t("adminDepartments.pageTitle")}</h3>
                        <p className="text-muted mb-0 mb-lg-2" style={{ maxWidth: "36rem", lineHeight: 1.6 }}>
                          {t("adminDepartments.lead")}
                        </p>
                        {!loading && items.length > 0 && (
                          <div className="d-flex flex-wrap gap-3 mt-3">
                            <span className="badge bg-white text-dark border px-3 py-2 fw-normal">
                              <i className="ri-hospital-fill text-primary me-1" />
                              {t("adminDepartments.statDepartments", { count: items.length })}
                            </span>
                            <span className="badge bg-white text-dark border px-3 py-2 fw-normal">
                              <i className="ri-team-fill text-success me-1" />
                              {t("adminDepartments.statProfiles", { count: totalProfiles })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col lg={4}>
                    <InputGroup className="shadow-sm rounded-3 overflow-hidden border bg-white">
                      <InputGroup.Text className="bg-white border-0 ps-3">
                        <i className="ri-search-line text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        className="border-0 shadow-none py-2"
                        placeholder={t("adminDepartments.searchPlaceholder")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label={t("adminDepartments.searchAriaLabel")}
                      />
                    </InputGroup>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-3 d-flex align-items-center gap-2" role="alert">
            <i className="ri-error-warning-fill fs-5" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5 rounded-3 bg-light border border-light">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted mb-0 small">{t("adminDepartments.loading")}</p>
          </div>
        ) : items.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center py-5 px-4">
              <div className="rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 72, height: 72 }}>
                <i className="ri-building-line" style={{ fontSize: "2rem" }} />
              </div>
              <h5 className="fw-semibold">{t("adminDepartments.emptyTitle")}</h5>
              <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "420px" }}>
                {t("adminDepartments.emptyHint")}
              </p>
              <Button as={Link} to="/patient/add-patient" variant="primary" className="rounded-pill px-4 me-2">
                <i className="ri-user-add-line me-1" /> {t("adminDepartments.emptyPatients")}
              </Button>
              <Button as={Link} to="/doctor/add-doctor" variant="outline-primary" className="rounded-pill px-4 me-2">
                {t("adminDepartments.emptyDoctors")}
              </Button>
              <Button as={Link} to="/nurse/add-nurse" variant="outline-secondary" className="rounded-pill px-4">
                {t("adminDepartments.emptyNurses")}
              </Button>
            </Card.Body>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center py-5">
              <p className="text-muted mb-0">{t("adminDepartments.noMatch", { query })}</p>
              <Button variant="link" className="p-0 mt-2" onClick={() => setQuery("")}>
                {t("adminDepartments.clearSearch")}
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {filtered.map((d) => {
              const accent = ACCENT_VARIANTS[hashIndex(d.name)];
              return (
                <Col key={d.name} xl={3} lg={4} md={6}>
                  <Card className={`h-100 border-0 shadow-sm rounded-3 dept-tile overflow-hidden`}>
                    <div className={`bg-${accent} bg-opacity-10 px-4 pt-4 pb-2`}>
                      <div className="d-flex align-items-start justify-content-between gap-2">
                        <div className={`rounded-2 bg-${accent} bg-opacity-25 text-${accent} d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: 44, height: 44 }}>
                          <i className="ri-hospital-fill" style={{ fontSize: "1.35rem" }} />
                        </div>
                        <span className={`badge bg-${accent} bg-opacity-15 text-${accent} border border-${accent} border-opacity-25 rounded-pill px-2 py-1 fw-semibold`}>
                          {d.total}
                        </span>
                      </div>
                      <h5 className="fw-bold mt-3 mb-0 text-break" title={d.name}>
                        {d.name}
                      </h5>
                    </div>
                    <Card.Body className="d-flex flex-column pt-3 px-4 pb-4">
                      <ul className="list-unstyled small mb-4 flex-grow-1">
                        <li className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                          <span className="text-muted">
                            <i className="ri-user-heart-line text-info me-2" />
                            {t("adminDepartments.colPatients")}
                          </span>
                          <strong className="text-dark">{d.patientCount}</strong>
                        </li>
                        <li className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                          <span className="text-muted">
                            <i className="ri-stethoscope-line text-success me-2" />
                            {t("adminDepartments.colDoctors")}
                          </span>
                          <strong className="text-dark">{d.doctorCount}</strong>
                        </li>
                        <li className="d-flex justify-content-between align-items-center py-2">
                          <span className="text-muted">
                            <i className="ri-nurse-line text-warning me-2" />
                            {t("adminDepartments.colNurses")}
                          </span>
                          <strong className="text-dark">{d.nurseCount}</strong>
                        </li>
                      </ul>
                      <Button
                        as={Link}
                        to={`/admin/departments/${encodeURIComponent(d.name)}`}
                        variant={`${accent}`}
                        className="rounded-pill w-100 fw-semibold"
                      >
                        {t("adminDepartments.openDepartment")}
                        <i className="ri-arrow-right-line ms-2" />
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </>
  );
};

export default AdminDepartments;
