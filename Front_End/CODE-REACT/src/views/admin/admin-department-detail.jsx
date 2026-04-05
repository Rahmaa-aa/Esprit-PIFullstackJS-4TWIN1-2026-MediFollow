import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Form, Modal, Row, Spinner, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { departmentApi, patientApi } from "../../services/api";

const initials = (first, last) => {
  const a = (first || "").trim().charAt(0);
  const b = (last || "").trim().charAt(0);
  const s = (a + b).toUpperCase();
  return s || "?";
};

const AdminDepartmentDetail = () => {
  const { t, i18n } = useTranslation();
  const { departmentName } = useParams();
  const navigate = useNavigate();
  const name = departmentName ? decodeURIComponent(departmentName) : "";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [assignModal, setAssignModal] = useState(null);
  const [modalDoctorId, setModalDoctorId] = useState("");
  const [modalNurseId, setModalNurseId] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState("");

  const roleMeta = useMemo(
    () => ({
      patient: { label: t("adminDepartmentDetail.rolePatient"), icon: "ri-user-heart-fill", variant: "info" },
      doctor: { label: t("adminDepartmentDetail.roleDoctor"), icon: "ri-stethoscope-fill", variant: "success" },
      nurse: { label: t("adminDepartmentDetail.roleNurse"), icon: "ri-nurse-fill", variant: "warning" },
    }),
    [t]
  );

  const loadDepartmentUsers = async () => {
    if (!name) return;
    const res = await departmentApi.usersByDepartment(name);
    setData(res);
  };

  useEffect(() => {
    if (!name) return;
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        await loadDepartmentUsers();
      } catch (e) {
        if (!cancelled) setError(e.message || t("adminDepartmentDetail.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [name, t]);

  const rows = useMemo(() => {
    if (!data) return [];
    const sortLocale = i18n.language || "en";
    return [
      ...(data.patients || []).map((u) => ({ ...u, role: "patient" })),
      ...(data.doctors || []).map((u) => ({ ...u, role: "doctor" })),
      ...(data.nurses || []).map((u) => ({ ...u, role: "nurse" })),
    ].sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, sortLocale)
    );
  }, [data, i18n.language]);

  const filteredRows = useMemo(() => {
    if (filterRole === "all") return rows;
    return rows.filter((r) => r.role === filterRole);
  }, [rows, filterRole]);

  const counts = useMemo(() => {
    if (!data) return { p: 0, d: 0, n: 0 };
    return {
      p: (data.patients || []).length,
      d: (data.doctors || []).length,
      n: (data.nurses || []).length,
    };
  }, [data]);

  const profilePath = (u) => {
    if (u.role === "patient") return `/patient/patient-profile/${u.id}`;
    if (u.role === "doctor") return `/doctor/doctor-profile/${u.id}`;
    return `/nurse/nurse-profile/${u.id}`;
  };

  const openAssignModal = (u) => {
    setAssignError("");
    setAssignModal(u);
    setModalDoctorId(u.doctorId || "");
    setModalNurseId(u.nurseId || "");
  };

  const closeAssignModal = () => {
    if (assignSaving) return;
    setAssignModal(null);
    setAssignError("");
  };

  const handleSaveCareTeam = async (e) => {
    e.preventDefault();
    if (!assignModal?.id) return;
    setAssignError("");
    setAssignSaving(true);
    try {
      await patientApi.update(assignModal.id, {
        doctorId: modalDoctorId || "",
        nurseId: modalNurseId || "",
      });
      await loadDepartmentUsers();
      setAssignModal(null);
    } catch (err) {
      setAssignError(err.message || t("adminDepartmentDetail.assignSaveError"));
    } finally {
      setAssignSaving(false);
    }
  };

  const deptDoctors = data?.doctors || [];
  const deptNurses = data?.nurses || [];

  return (
    <>
      <style>{`
        .admin-dept-detail .stat-mini {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .admin-dept-detail .stat-mini:hover {
          transform: translateY(-2px);
        }
        .admin-dept-detail .table-users tbody tr {
          transition: background-color 0.15s ease;
        }
        .admin-dept-detail .dept-detail-hero {
          background: linear-gradient(125deg, rgba(13, 110, 253, 0.07) 0%, rgba(13, 202, 240, 0.05) 100%);
          border: 1px solid rgba(13, 110, 253, 0.1);
        }
      `}</style>

      <Container fluid className="admin-dept-detail pb-5">
        <nav aria-label={t("adminDepartmentDetail.breadcrumbNavLabel")} className="mb-3">
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item">
              <Link to="/admin/dashboard" className="text-decoration-none text-muted">
                {t("adminDepartmentDetail.breadcrumbDashboard")}
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/admin/departments" className="text-decoration-none text-muted">
                {t("adminDepartmentDetail.breadcrumbDepartments")}
              </Link>
            </li>
            <li className="breadcrumb-item active text-truncate" aria-current="page" style={{ maxWidth: "280px" }}>
              {name || "—"}
            </li>
          </ol>
        </nav>

        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm rounded-3 overflow-hidden dept-detail-hero">
              <Card.Body className="p-4 p-lg-4">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                  <div className="d-flex align-items-start gap-3 min-w-0">
                    <Button
                      as={Link}
                      to="/admin/departments"
                      variant="outline-secondary"
                      className="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center p-0"
                      style={{ width: 44, height: 44 }}
                      aria-label={t("adminDepartmentDetail.backAria")}
                    >
                      <i className="ri-arrow-left-line fs-5" />
                    </Button>
                    <div className="min-w-0">
                      <div className="text-uppercase text-primary fw-semibold small mb-1" style={{ letterSpacing: "0.08em" }}>{t("adminDepartmentDetail.eyebrow")}</div>
                      <h3 className="fw-bold mb-1 text-break">{name || t("adminDepartmentDetail.departmentFallback")}</h3>
                      <p className="text-muted mb-0 small">
                        {t("adminDepartmentDetail.lead")}
                      </p>
                    </div>
                  </div>
                  {!loading && data && (
                    <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                      <Button
                        size="sm"
                        variant={filterRole === "all" ? "primary" : "outline-primary"}
                        className="rounded-pill px-3"
                        onClick={() => setFilterRole("all")}
                      >
                        {t("adminDepartmentDetail.filterAll", { count: rows.length })}
                      </Button>
                      <Button
                        size="sm"
                        variant={filterRole === "patient" ? "info" : "outline-info"}
                        className="rounded-pill px-3"
                        onClick={() => setFilterRole("patient")}
                      >
                        {t("adminDepartmentDetail.filterPatients", { count: counts.p })}
                      </Button>
                      <Button
                        size="sm"
                        variant={filterRole === "doctor" ? "success" : "outline-success"}
                        className="rounded-pill px-3"
                        onClick={() => setFilterRole("doctor")}
                      >
                        {t("adminDepartmentDetail.filterDoctors", { count: counts.d })}
                      </Button>
                      <Button
                        size="sm"
                        variant={filterRole === "nurse" ? "warning" : "outline-warning"}
                        className="rounded-pill px-3"
                        onClick={() => setFilterRole("nurse")}
                      >
                        {t("adminDepartmentDetail.filterNurses", { count: counts.n })}
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-3 d-flex align-items-center gap-2 mb-4" role="alert">
            <i className="ri-error-warning-fill fs-5" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5 rounded-3 bg-light border border-light">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted mb-0 small">{t("adminDepartmentDetail.loadingUsers")}</p>
          </div>
        ) : (
          <>
            <Row className="g-3 mb-4">
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100 stat-mini rounded-3 overflow-hidden">
                  <Card.Body className="d-flex align-items-center gap-3 p-3">
                    <div className="rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 56, height: 56 }}>
                      <i className="ri-user-heart-fill" style={{ fontSize: "1.5rem" }} />
                    </div>
                    <div>
                      <div className="text-muted small">{t("adminDepartmentDetail.statPatients")}</div>
                      <div className="fs-4 fw-bold text-dark">{counts.p}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100 stat-mini rounded-3 overflow-hidden">
                  <Card.Body className="d-flex align-items-center gap-3 p-3">
                    <div className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 56, height: 56 }}>
                      <i className="ri-stethoscope-fill" style={{ fontSize: "1.5rem" }} />
                    </div>
                    <div>
                      <div className="text-muted small">{t("adminDepartmentDetail.statDoctors")}</div>
                      <div className="fs-4 fw-bold text-dark">{counts.d}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100 stat-mini rounded-3 overflow-hidden">
                  <Card.Body className="d-flex align-items-center gap-3 p-3">
                    <div className="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 56, height: 56 }}>
                      <i className="ri-nurse-fill" style={{ fontSize: "1.5rem" }} />
                    </div>
                    <div>
                      <div className="text-muted small">{t("adminDepartmentDetail.statNurses")}</div>
                      <div className="fs-4 fw-bold text-dark">{counts.n}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
              <Card.Header className="bg-white border-bottom py-3 px-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <Card.Header.Title className="mb-0 fw-semibold">
                    <i className="ri-team-line text-primary me-2" />
                    {t("adminDepartmentDetail.rosterTitle")}
                  </Card.Header.Title>
                  <span className="text-muted small">
                    {t("adminDepartmentDetail.tableMetaShown", { count: filteredRows.length })}
                    {filterRole !== "all" ? t("adminDepartmentDetail.tableMetaFilterActive") : ""}
                  </span>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {filteredRows.length === 0 ? (
                  <div className="text-center py-5 px-4">
                    <div className="rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 72, height: 72 }}>
                      <i className="ri-user-unfollow-line" style={{ fontSize: "2rem" }} />
                    </div>
                    <h6 className="fw-semibold">{t("adminDepartmentDetail.emptyTitle")}</h6>
                    <p className="text-muted mb-0 small">{t("adminDepartmentDetail.emptyHint")}</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table responsive hover className="mb-0 align-middle table-users">
                      <thead className="table-light">
                        <tr className="small text-muted text-uppercase" style={{ letterSpacing: "0.03em" }}>
                          <th className="ps-4 border-0">{t("adminDepartmentDetail.thUser")}</th>
                          <th className="border-0">{t("adminDepartmentDetail.thRole")}</th>
                          <th className="border-0">{t("adminDepartmentDetail.thEmail")}</th>
                          <th className="border-0">{t("adminDepartmentDetail.thStatus")}</th>
                          <th className="text-end pe-4 border-0">{t("adminDepartmentDetail.thAction")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((u) => {
                          const meta = roleMeta[u.role];
                          return (
                            <tr key={`${u.role}-${u.id}`}>
                              <td className="ps-4 py-3">
                                <div className="d-flex align-items-center gap-3">
                                  <div
                                    className={`rounded-circle bg-${meta.variant} bg-opacity-10 text-${meta.variant} d-flex align-items-center justify-content-center fw-bold flex-shrink-0`}
                                    style={{ width: 44, height: 44, fontSize: "0.85rem" }}
                                  >
                                    {initials(u.firstName, u.lastName)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="fw-semibold text-dark text-break">
                                      {u.firstName} {u.lastName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`badge bg-${meta.variant}-subtle text-${meta.variant} rounded-pill px-2 py-1 fw-normal`}>
                                  <i className={`${meta.icon} me-1 align-text-bottom`} /> {meta.label}
                                </span>
                              </td>
                              <td className="text-muted small text-break">{u.email}</td>
                              <td>
                                {u.isActive === false ? (
                                  <span className="badge bg-danger-subtle text-danger rounded-pill">{t("adminDepartmentDetail.statusInactive")}</span>
                                ) : (
                                  <span className="badge bg-success-subtle text-success rounded-pill">{t("adminDepartmentDetail.statusActive")}</span>
                                )}
                              </td>
                              <td className="text-end pe-4">
                                <div className="d-inline-flex flex-wrap gap-2 justify-content-end">
                                  {u.role === "patient" && (
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      className="rounded-pill px-3"
                                      onClick={() => openAssignModal(u)}
                                    >
                                      <i className="ri-team-line me-1" />
                                      {t("adminDepartmentDetail.assignTeam")}
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="rounded-pill px-3"
                                    onClick={() => navigate(profilePath(u))}
                                  >
                                    {t("adminDepartmentDetail.viewProfile")}
                                    <i className="ri-external-link-line ms-1" />
                                  </Button>
                                </div>
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
          </>
        )}
      </Container>

      <Modal show={!!assignModal} onHide={closeAssignModal} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{t("adminDepartmentDetail.modalTitle")}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveCareTeam}>
          <Modal.Body>
            {assignModal && (
              <>
                <p className="text-muted small mb-3">
                  {t("adminDepartmentDetail.modalPatientLabel")}{" "}
                  <strong>
                    {assignModal.firstName} {assignModal.lastName}
                  </strong>
                  <span className="d-block mt-1">{t("adminDepartmentDetail.modalDepartmentLabel")} {name}</span>
                </p>
                {assignError && <div className="alert alert-danger py-2 small mb-3">{assignError}</div>}
                <Form.Group className="mb-3">
                  <Form.Label>{t("adminDepartmentDetail.labelDoctor")}</Form.Label>
                  <Form.Select
                    value={modalDoctorId}
                    onChange={(e) => setModalDoctorId(e.target.value)}
                    aria-label={t("adminDepartmentDetail.selectDoctorAria")}
                  >
                    <option value="">{t("adminDepartmentDetail.selectNone")}</option>
                    {deptDoctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {t("adminDepartmentDetail.doctorPrefix")} {d.firstName} {d.lastName}
                        {d.specialty ? ` · ${d.specialty}` : ""}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-0">
                  <Form.Label>{t("adminDepartmentDetail.labelNurse")}</Form.Label>
                  <Form.Select
                    value={modalNurseId}
                    onChange={(e) => setModalNurseId(e.target.value)}
                    aria-label={t("adminDepartmentDetail.selectNurseAria")}
                  >
                    <option value="">{t("adminDepartmentDetail.selectNone")}</option>
                    {deptNurses.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.firstName} {n.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <p className="text-muted small mt-3 mb-0">
                  {t("adminDepartmentDetail.modalHint")}
                </p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-secondary" type="button" onClick={closeAssignModal} disabled={assignSaving}>
              {t("adminDepartmentDetail.cancel")}
            </Button>
            <Button variant="primary" type="submit" disabled={assignSaving}>
              {assignSaving ? t("adminDepartmentDetail.saving") : t("adminDepartmentDetail.save")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AdminDepartmentDetail;
