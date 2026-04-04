import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Row, Col, Spinner, Alert, Table, Badge } from "react-bootstrap";
import Card from "../../components/Card";
import { appointmentApi } from "../../services/api";
import { hospitalDepartmentLabel } from "../../constants/hospitalDepartments";

const APPOINTMENT_TYPE_I18N_KEYS = {
  checkup: "patientAppointmentRequest.typeCheckup",
  lab: "patientAppointmentRequest.typeLab",
  specialist: "patientAppointmentRequest.typeSpecialist",
  imaging: "patientAppointmentRequest.typeImaging",
  physiotherapy: "patientAppointmentRequest.typePhysiotherapy",
};

function appointmentTypeLabel(type, t) {
  if (type == null || type === "") return "—";
  const key = APPOINTMENT_TYPE_I18N_KEYS[String(type).toLowerCase()];
  return key ? t(key) : String(type);
}

function statusBadgeVariant(status) {
  const s = String(status || "").toLowerCase();
  if (s === "confirmed" || s === "scheduled") return "success";
  if (s === "pending") return "warning";
  if (s === "cancelled") return "secondary";
  if (s === "completed") return "info";
  return "secondary";
}

const CareCoordinatorAppointments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [list, setList] = useState([]);
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
        const data = await appointmentApi.getCoordinatorDepartmentAppointments();
        if (!cancelled) setList(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || t("careCoordinatorAppointments.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, t]);

  const deptLabel = useMemo(() => {
    const raw = user?.department || "";
    return raw ? hospitalDepartmentLabel(raw, t) : "";
  }, [user?.department, t]);

  const patientLabel = (row) => {
    const p = row.patientId;
    if (p && typeof p === "object") {
      return `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.email || "—";
    }
    return "—";
  };

  const patientIdForLink = (row) => {
    const p = row.patientId;
    if (p && typeof p === "object" && p._id) return String(p._id);
    if (row.patientId && typeof row.patientId === "string") return row.patientId;
    return null;
  };

  if (!user) return null;

  return (
    <>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Card.Header.Title>
                <h4 className="card-title mb-0">{t("careCoordinatorAppointments.pageTitle")}</h4>
                {deptLabel ? (
                  <p className="text-muted small mb-0 mt-1">
                    <i className="ri-building-2-line me-1" aria-hidden />
                    {deptLabel}
                  </p>
                ) : null}
              </Card.Header.Title>
              <Link to="/dashboard-pages/care-coordinator-dashboard" className="btn btn-outline-secondary btn-sm">
                {t("careCoordinatorAppointments.backDashboard")}
              </Link>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" />
                  <p className="mt-2 text-muted mb-0">{t("careCoordinatorAppointments.loading")}</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : list.length === 0 ? (
                <p className="text-muted mb-0">{t("careCoordinatorAppointments.empty")}</p>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>{t("careCoordinatorAppointments.thDate")}</th>
                        <th>{t("careCoordinatorAppointments.thTime")}</th>
                        <th>{t("careCoordinatorAppointments.thPatient")}</th>
                        <th>{t("careCoordinatorAppointments.thDoctor")}</th>
                        <th>{t("careCoordinatorAppointments.thTitle")}</th>
                        <th>{t("careCoordinatorAppointments.thType")}</th>
                        <th>{t("careCoordinatorAppointments.thStatus")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((row) => {
                        const pid = patientIdForLink(row);
                        return (
                          <tr key={row._id}>
                            <td>{row.date || "—"}</td>
                            <td>{row.time || "—"}</td>
                            <td>
                              {pid ? (
                                <Link
                                  to={`/dashboard-pages/care-coordinator-patient/${encodeURIComponent(pid)}`}
                                  className="fw-medium text-decoration-none"
                                >
                                  {patientLabel(row)}
                                </Link>
                              ) : (
                                <span className="fw-medium">{patientLabel(row)}</span>
                              )}
                            </td>
                            <td>{row.doctorName || "—"}</td>
                            <td>{row.title || "—"}</td>
                            <td>{appointmentTypeLabel(row.type, t)}</td>
                            <td>
                              <Badge bg={statusBadgeVariant(row.status)}>{row.status || "—"}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CareCoordinatorAppointments;
