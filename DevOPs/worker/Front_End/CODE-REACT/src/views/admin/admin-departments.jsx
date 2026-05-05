import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { departmentApi, superAdminApi } from "../../services/api";
import { useDepartmentSectionPaths } from "../../utils/departmentSectionPaths";

const ACCENT_VARIANTS = ["primary", "success", "info", "warning", "danger", "secondary"];

const TEAL = { background: "#009688", borderColor: "#009688" };

const hashIndex = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h) % ACCENT_VARIANTS.length;
};

const AdminDepartments = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { listPath } = useDepartmentSectionPaths();
  /** Super admin session (JWT role) — show catalogue actions on both /admin/departments and /super-admin/departments */
  const canManageDepartments = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("adminUser") || "null");
      return u?.role === "superadmin";
    } catch {
      return false;
    }
  }, [pathname]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [createSaving, setCreateSaving] = useState(false);
  const [createFeedback, setCreateFeedback] = useState({ type: "", message: "" });
  const [departmentAdmins, setDepartmentAdmins] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, catalogId: "", name: "" });
  const [editName, setEditName] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, catalogId: "", name: "" });
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [assignModal, setAssignModal] = useState({
    open: false,
    catalogId: "",
    departmentName: "",
    adminUserId: "",
  });
  const [assignSaving, setAssignSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  /** Which department row is running an async catalog action, and which control triggered it */
  const [deptBusy, setDeptBusy] = useState({ name: "", action: "" });
  const [actionError, setActionError] = useState("");

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await departmentApi.summary();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || t("adminDepartments.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (!canManageDepartments) return;
    let cancelled = false;
    (async () => {
      try {
        const users = await superAdminApi.getAllUsers();
        if (cancelled || !Array.isArray(users)) return;
        setDepartmentAdmins(users.filter((u) => u.role === "admin" && u.isActive !== false));
      } catch {
        if (!cancelled) setDepartmentAdmins([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canManageDepartments]);

  const resolveCatalogId = useCallback(async (d) => {
    if (d.catalogId) return d.catalogId;
    const r = await departmentApi.ensureCatalog({ name: d.name });
    return r.id;
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    const name = newDeptName.trim();
    if (!name) {
      setCreateFeedback({ type: "danger", message: t("adminDepartments.createCatalogValidation") });
      return;
    }
    setCreateSaving(true);
    setCreateFeedback({ type: "", message: "" });
    try {
      await departmentApi.createCatalog({ name });
      setNewDeptName("");
      setCreateFeedback({ type: "success", message: t("adminDepartments.createCatalogSuccess", { name }) });
      await loadSummary();
    } catch (err) {
      const msg = err?.message || "";
      if (err?.status === 409 || /existe déjà|already/i.test(msg)) {
        setCreateFeedback({ type: "danger", message: t("adminDepartments.createCatalogDuplicate") });
      } else {
        setCreateFeedback({ type: "danger", message: msg || t("adminDepartments.createCatalogError") });
      }
    } finally {
      setCreateSaving(false);
    }
  };

  const openEdit = async (d) => {
    if (!canManageDepartments) return;
    setModalError("");
    setActionError("");
    setDeptBusy({ name: d.name, action: "edit" });
    try {
      const catalogId = await resolveCatalogId(d);
      await loadSummary();
      setEditName(d.name);
      setEditModal({ open: true, catalogId, name: d.name });
    } catch (err) {
      setActionError(err?.message || t("adminDepartments.editError"));
    } finally {
      setDeptBusy({ name: "", action: "" });
    }
  };

  const openDelete = async (d) => {
    if (!canManageDepartments) return;
    setModalError("");
    setActionError("");
    setDeptBusy({ name: d.name, action: "delete" });
    try {
      const catalogId = await resolveCatalogId(d);
      await loadSummary();
      setDeleteModal({ open: true, catalogId, name: d.name });
    } catch (err) {
      setActionError(err?.message || t("adminDepartments.deleteError"));
    } finally {
      setDeptBusy({ name: "", action: "" });
    }
  };

  const openAssign = async (d) => {
    if (!canManageDepartments) return;
    setModalError("");
    setActionError("");
    setDeptBusy({ name: d.name, action: "assign" });
    try {
      const catalogId = await resolveCatalogId(d);
      await loadSummary();
      setAssignModal({
        open: true,
        catalogId,
        departmentName: d.name,
        adminUserId: d.assignedAdminId || "",
      });
    } catch (err) {
      setActionError(err?.message || t("adminDepartments.assignError"));
    } finally {
      setDeptBusy({ name: "", action: "" });
    }
  };

  const handleSaveEdit = async () => {
    const name = editName.trim();
    if (!name) {
      setModalError(t("adminDepartments.editValidation"));
      return;
    }
    setEditSaving(true);
    setModalError("");
    try {
      await departmentApi.updateCatalog(editModal.catalogId, { name });
      setEditModal({ open: false, catalogId: "", name: "" });
      await loadSummary();
    } catch (err) {
      setModalError(err?.message || t("adminDepartments.editError"));
    } finally {
      setEditSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteSaving(true);
    setModalError("");
    try {
      await departmentApi.deleteCatalog(deleteModal.catalogId);
      setDeleteModal({ open: false, catalogId: "", name: "" });
      await loadSummary();
    } catch (err) {
      setModalError(err?.message || t("adminDepartments.deleteError"));
    } finally {
      setDeleteSaving(false);
    }
  };

  const handleSaveAssign = async () => {
    setAssignSaving(true);
    setModalError("");
    try {
      const adminUserId = assignModal.adminUserId || null;
      await departmentApi.assignCatalogAdmin(assignModal.catalogId, adminUserId);
      setAssignModal({ open: false, catalogId: "", departmentName: "", adminUserId: "" });
      await loadSummary();
    } catch (err) {
      setModalError(err?.message || t("adminDepartments.assignError"));
    } finally {
      setAssignSaving(false);
    }
  };

  const superAdminLabel = (u) => {
    const n = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
    return n || u.name || u.email || u.id;
  };

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
        .admin-dept-page .dept-card-action-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          line-height: 1;
          box-shadow: none;
        }
      `}</style>

      <Container fluid className="admin-dept-page pb-5">
        {canManageDepartments && (
          <Row className="mb-4">
            <Col>
              <Card className="border-0 shadow-sm rounded-3" style={{ borderLeft: "4px solid #009688" }}>
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-2">{t("adminDepartments.createCatalogTitle")}</h5>
                  <p className="text-muted small mb-3">{t("adminDepartments.createCatalogHint")}</p>
                  {createFeedback.message && (
                    <Alert variant={createFeedback.type === "success" ? "success" : "danger"} className="py-2 mb-3">
                      {createFeedback.message}
                    </Alert>
                  )}
                  <Form onSubmit={handleCreateDepartment} className="row g-3 align-items-end">
                    <Col md={8}>
                      <Form.Label className="small text-muted mb-1">{t("adminDepartments.createCatalogLabel")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        placeholder={t("adminDepartments.createCatalogPlaceholder")}
                        disabled={createSaving}
                      />
                    </Col>
                    <Col md={4}>
                      <Button type="submit" variant="primary" className="w-100" disabled={createSaving} style={{ background: "#009688", borderColor: "#009688" }}>
                        {createSaving ? t("adminDepartments.createCatalogSaving") : t("adminDepartments.createCatalogSubmit")}
                      </Button>
                    </Col>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
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

        {actionError && (
          <Alert variant="danger" className="border-0 shadow-sm rounded-3 mb-4" dismissible onClose={() => setActionError("")}>
            {actionError}
          </Alert>
        )}

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
                        <div className="d-flex align-items-center gap-1 flex-shrink-0">
                          {canManageDepartments && (
                            <>
                              <Button
                                type="button"
                                variant="light"
                                className="dept-card-action-btn border-0 bg-white bg-opacity-80 text-secondary"
                                style={{ color: "#009688" }}
                                title={t("adminDepartments.ariaEdit")}
                                disabled={deptBusy.name === d.name}
                                onClick={() => {
                                  void openEdit(d);
                                }}
                              >
                                {deptBusy.name === d.name && deptBusy.action === "edit" ? (
                                  <Spinner animation="border" size="sm" style={{ width: "1rem", height: "1rem" }} />
                                ) : (
                                  <i className="ri-pencil-line fs-6" />
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="light"
                                className="dept-card-action-btn border-0 bg-white bg-opacity-80"
                                style={{ color: "#009688" }}
                                title={t("adminDepartments.ariaAssign")}
                                disabled={deptBusy.name === d.name}
                                onClick={() => {
                                  void openAssign(d);
                                }}
                              >
                                {deptBusy.name === d.name && deptBusy.action === "assign" ? (
                                  <Spinner animation="border" size="sm" style={{ width: "1rem", height: "1rem" }} />
                                ) : (
                                  <i className="ri-user-settings-line fs-6" />
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="light"
                                className="dept-card-action-btn border-0 bg-white bg-opacity-80 text-danger"
                                title={t("adminDepartments.ariaDelete")}
                                disabled={deptBusy.name === d.name}
                                onClick={() => {
                                  void openDelete(d);
                                }}
                              >
                                {deptBusy.name === d.name && deptBusy.action === "delete" ? (
                                  <Spinner animation="border" size="sm" style={{ width: "1rem", height: "1rem" }} />
                                ) : (
                                  <i className="ri-delete-bin-line fs-6" />
                                )}
                              </Button>
                            </>
                          )}
                          <span className={`badge bg-${accent} bg-opacity-15 text-${accent} border border-${accent} border-opacity-25 rounded-pill px-2 py-1 fw-semibold`}>
                            {d.total}
                          </span>
                        </div>
                      </div>
                      <h5 className="fw-bold mt-3 mb-0 text-break" title={d.name}>
                        {d.name}
                      </h5>
                      {canManageDepartments && d.assignedAdminLabel && (
                        <p className="text-muted small mb-0 mt-2 text-break">
                          <i className="ri-user-settings-line me-1" />
                          {d.assignedAdminLabel}
                        </p>
                      )}
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
                        to={`${listPath}/${encodeURIComponent(d.name)}`}
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

        <Modal show={editModal.open} onHide={() => !editSaving && setEditModal((m) => ({ ...m, open: false }))} centered>
          <Modal.Header closeButton>
            <Modal.Title>{t("adminDepartments.editTitle")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalError && (
              <Alert variant="danger" className="py-2 small">
                {modalError}
              </Alert>
            )}
            <Form.Label className="small text-muted">{t("adminDepartments.createCatalogLabel")}</Form.Label>
            <Form.Control
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={editSaving}
            />
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" className="rounded-pill" onClick={() => setEditModal((m) => ({ ...m, open: false }))} disabled={editSaving}>
              {t("adminDepartments.modalCancel")}
            </Button>
            <Button className="rounded-pill" style={TEAL} onClick={handleSaveEdit} disabled={editSaving}>
              {editSaving ? t("adminDepartments.createCatalogSaving") : t("adminDepartments.modalSave")}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={deleteModal.open} onHide={() => !deleteSaving && setDeleteModal((m) => ({ ...m, open: false }))} centered>
          <Modal.Header closeButton>
            <Modal.Title>{t("adminDepartments.deleteTitle")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalError && (
              <Alert variant="danger" className="py-2 small">
                {modalError}
              </Alert>
            )}
            <p className="mb-0 small text-muted">{t("adminDepartments.deleteBody", { name: deleteModal.name })}</p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" className="rounded-pill" onClick={() => setDeleteModal((m) => ({ ...m, open: false }))} disabled={deleteSaving}>
              {t("adminDepartments.modalCancel")}
            </Button>
            <Button variant="danger" className="rounded-pill" onClick={handleConfirmDelete} disabled={deleteSaving}>
              {deleteSaving ? t("adminDepartments.deleteSaving") : t("adminDepartments.deleteConfirm")}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={assignModal.open} onHide={() => !assignSaving && setAssignModal((m) => ({ ...m, open: false }))} centered>
          <Modal.Header closeButton>
            <Modal.Title>{t("adminDepartments.assignTitle")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalError && (
              <Alert variant="danger" className="py-2 small">
                {modalError}
              </Alert>
            )}
            <p className="small text-muted mb-2">{assignModal.departmentName}</p>
            <Form.Label className="small text-muted">{t("adminDepartments.assignLabel")}</Form.Label>
            <Form.Select
              value={assignModal.adminUserId}
              onChange={(e) => setAssignModal((m) => ({ ...m, adminUserId: e.target.value }))}
              disabled={assignSaving}
            >
              <option value="">{t("adminDepartments.assignNone")}</option>
              {departmentAdmins.map((u) => (
                <option key={String(u.id)} value={String(u.id)}>
                  {superAdminLabel(u)}
                </option>
              ))}
            </Form.Select>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" className="rounded-pill" onClick={() => setAssignModal((m) => ({ ...m, open: false }))} disabled={assignSaving}>
              {t("adminDepartments.modalCancel")}
            </Button>
            <Button className="rounded-pill" style={TEAL} onClick={handleSaveAssign} disabled={assignSaving}>
              {assignSaving ? t("adminDepartments.createCatalogSaving") : t("adminDepartments.modalSave")}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default AdminDepartments;
