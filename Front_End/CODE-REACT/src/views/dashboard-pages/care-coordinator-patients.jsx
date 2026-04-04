import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Row, Col, Spinner, Alert, ProgressBar } from "react-bootstrap";
import Card from "../../components/Card";
import A11yToolbar from "../../components/A11yToolbar";
import { departmentApi } from "../../services/api";
import { hospitalDepartmentLabel } from "../../constants/hospitalDepartments";

function scoreVariant(n) {
  if (n >= 75) return "success";
  if (n >= 45) return "warning";
  return "danger";
}

const CareCoordinatorPatients = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    let u = null;
    try {
      const raw = localStorage.getItem("adminUser");
      u = raw ? JSON.parse(raw) : null;
    } catch {
      u = null;
    }
    if (!token || u?.role !== "carecoordinator") {
      navigate("/auth/sign-in", { replace: true });
      return;
    }
    setUser(u);
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await departmentApi.coordinatorMyPatients();
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e?.message || t("careCoordinatorPatients.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, t]);

  const deptLabel = useMemo(() => {
    const raw = data?.department || user?.department || "";
    return raw ? hospitalDepartmentLabel(raw, t) : "";
  }, [data?.department, user?.department, t]);

  if (!user) return null;

  return (
    <>
      <A11yToolbar />
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Card.Header.Title>
                <h4 className="card-title mb-0">{t("careCoordinatorPatients.pageTitle")}</h4>
                {deptLabel ? (
                  <p className="text-muted small mb-0 mt-1">
                    <i className="ri-building-2-line me-1" aria-hidden />
                    {deptLabel}
                  </p>
                ) : null}
              </Card.Header.Title>
              <Link to="/dashboard-pages/care-coordinator-dashboard" className="btn btn-outline-secondary btn-sm">
                {t("careCoordinatorPatients.backDashboard")}
              </Link>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" />
                  <p className="mt-2 text-muted mb-0">{t("careCoordinatorPatients.loading")}</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : !data?.patients?.length ? (
                <p className="text-muted mb-0">{t("careCoordinatorPatients.empty")}</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>{t("careCoordinatorPatients.colPatient")}</th>
                        <th style={{ minWidth: 220 }}>{t("careCoordinatorPatients.colScore")}</th>
                        <th className="text-end d-none d-md-table-cell">{t("careCoordinatorPatients.colVitals")}</th>
                        <th className="text-end d-none d-md-table-cell">{t("careCoordinatorPatients.colMeds")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.patients.map((p) => {
                        const name = `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.email;
                        const score = typeof p.complianceScore === "number" ? p.complianceScore : 0;
                        return (
                          <tr key={p.id}>
                            <td>
                              <Link
                                to={`/dashboard-pages/care-coordinator-patient/${encodeURIComponent(p.id)}`}
                                className="fw-medium text-decoration-none"
                              >
                                {name}
                              </Link>
                              {p.email ? <div className="small text-muted">{p.email}</div> : null}
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <div className="flex-grow-1" style={{ minWidth: 120 }}>
                                  <ProgressBar
                                    now={score}
                                    variant={scoreVariant(score)}
                                    label={`${score}%`}
                                    style={{ minHeight: 22 }}
                                  />
                                </div>
                                <span className="small text-muted">
                                  {t("careCoordinatorPatients.windowHint", { days: data.windowDays || 7 })}
                                </span>
                              </div>
                            </td>
                            <td className="text-end d-none d-md-table-cell small">{p.vitalsScore ?? "—"}%</td>
                            <td className="text-end d-none d-md-table-cell small">{p.medicationScore ?? "—"}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CareCoordinatorPatients;
