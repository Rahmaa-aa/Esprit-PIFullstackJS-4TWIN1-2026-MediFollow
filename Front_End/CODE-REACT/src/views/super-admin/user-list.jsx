import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Card, Button, Badge, Form, InputGroup, Spinner, Alert, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { superAdminApi, doctorApi, patientApi, nurseApi } from "../../services/api";
import { fetchMergedDepartmentNames, mergeDepartmentOptionsForValue } from "../../utils/mergedDepartmentNames";

const ROLE_COLORS = {
  admin: "danger",
  superadmin: "dark",
  doctor: "primary",
  patient: "info",
  nurse: "warning",
  auditor: "secondary",
  carecoordinator: "success",
};

/** Keys under superAdminDashboard.* for role labels */
const ROLE_I18N = {
  admin: "roleAdmin",
  superadmin: "roleSuperAdmin",
  doctor: "roleDoctor",
  patient: "rolePatient",
  nurse: "roleNurse",
  auditor: "roleAuditor",
  carecoordinator: "roleCareCoordinator",
};

const STAT_DEFS = [
  { labelKey: "statTotal", valueKey: "total", color: "#009688", icon: "ri-team-fill" },
  { labelKey: "statActive", valueKey: "active", color: "#4caf50", icon: "ri-user-follow-fill" },
  { labelKey: "statInactive", valueKey: "inactive", color: "#f44336", icon: "ri-user-unfollow-fill" },
];

const UserList = () => {
  const { t } = useTranslation();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionMsg, setActionMsg] = useState("");
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [addAdminModal, setAddAdminModal] = useState(false);
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminForm, setAddAdminForm] = useState({ email: "", password: "", name: "", department: "" });
  const [deptOptions, setDeptOptions] = useState([]);
  const [assignDeptModal, setAssignDeptModal] = useState({ show: false, user: null });
  const [assignDeptLoading, setAssignDeptLoading] = useState(false);
  const [assignDeptForm, setAssignDeptForm] = useState({ department: "" });
  const [assignDeptOptions, setAssignDeptOptions] = useState([]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [adminUsers, doctors, patients, nurses] = await Promise.all([
        superAdminApi.getAllUsers(),
        doctorApi.getAll(),
        patientApi.getAll(),
        nurseApi.getAll(),
      ]);

      const mapped = [
        ...(Array.isArray(adminUsers) ? adminUsers : []).map((u) => ({
          _id: u.id || u._id,
          name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
          email: u.email,
          role: u.role,
          isActive: u.isActive !== false,
          collection: "user",
          department: u.department || "",
        })),
        ...(Array.isArray(doctors) ? doctors : []).map((d) => ({
          _id: d._id || d.id,
          name: `${d.firstName || ""} ${d.lastName || ""}`.trim() || d.email,
          email: d.email,
          role: "doctor",
          isActive: d.isActive !== false,
          collection: "doctor",
        })),
        ...(Array.isArray(patients) ? patients : []).map((p) => ({
          _id: p._id || p.id,
          name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.email,
          email: p.email,
          role: "patient",
          isActive: p.isActive !== false,
          collection: "patient",
        })),
        ...(Array.isArray(nurses) ? nurses : []).map((n) => ({
          _id: n._id || n.id,
          name: `${n.firstName || ""} ${n.lastName || ""}`.trim() || n.email,
          email: n.email,
          role: "nurse",
          isActive: n.isActive !== false,
          collection: "nurse",
        })),
      ].filter((u) => u.role !== "superadmin");

      setAllUsers(mapped);
    } catch (err) {
      setError(t("superAdminUsers.loadError", { message: err.message || t("superAdminUsers.unknownError") }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    fetchMergedDepartmentNames().then(setDeptOptions);
  }, []);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("adminUser") || "null");
      setIsSuperAdmin(u?.role === "superadmin");
    } catch {
      setIsSuperAdmin(false);
    }
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError("");
    if (!addAdminForm.email.trim() || !addAdminForm.password) {
      setError(t("superAdminUsers.addAdminValidation"));
      return;
    }
    if (addAdminForm.password.length < 6) {
      setError(t("superAdminUsers.addAdminPasswordMin"));
      return;
    }
    setAddAdminLoading(true);
    try {
      const payload = {
        email: addAdminForm.email.trim(),
        password: addAdminForm.password,
        name: addAdminForm.name.trim() || undefined,
      };
      if (addAdminForm.department.trim()) {
        payload.department = addAdminForm.department.trim();
      }
      const created = await superAdminApi.createAdmin(payload);
      const emailAddr = addAdminForm.email.trim();
      setActionMsg(
        created?.credentialsEmailSent
          ? t("superAdminUsers.addAdminSuccessEmail", { email: emailAddr })
          : t("superAdminUsers.addAdminSuccessNoSmtp", { email: emailAddr }),
      );
      setTimeout(() => setActionMsg(""), 4000);
      setAddAdminModal(false);
      setAddAdminForm({ email: "", password: "", name: "", department: "" });
      loadUsers();
    } catch (err) {
      setError(err.message || t("superAdminUsers.addAdminError"));
    } finally {
      setAddAdminLoading(false);
    }
  };

  const handleToggle = async (user) => {
    try {
      if (user.collection === "doctor") await doctorApi.toggleActive(user._id);
      else if (user.collection === "patient") await patientApi.toggleActive(user._id);
      else if (user.collection === "nurse") await nurseApi.toggleActive(user._id);
      else await superAdminApi.toggleUserActive(user._id);

      setActionMsg(
        user.isActive
          ? t("superAdminUsers.toastDeactivated", { name: user.name })
          : t("superAdminUsers.toastActivated", { name: user.name }),
      );
      setTimeout(() => setActionMsg(""), 3000);
      loadUsers();
    } catch (err) {
      setError(t("superAdminUsers.toggleError", { message: err.message || "" }));
    }
    setConfirmModal({ show: false, user: null });
  };

  const openConfirm = (user) => {
    setConfirmModal({ show: true, user });
  };

  const openAssignDepartment = (user) => {
    fetchMergedDepartmentNames().then((base) => {
      setAssignDeptOptions(mergeDepartmentOptionsForValue(base, user.department));
      setAssignDeptForm({ department: user.department || "" });
      setAssignDeptModal({ show: true, user });
    });
  };

  const handleAssignDepartment = async (e) => {
    e.preventDefault();
    const u = assignDeptModal.user;
    if (!u?._id) return;
    setAssignDeptLoading(true);
    setError("");
    try {
      await superAdminApi.updateAdmin(u._id, { department: assignDeptForm.department.trim() });
      setActionMsg(t("superAdminUsers.assignDeptSuccess", { name: u.name }));
      setTimeout(() => setActionMsg(""), 3000);
      setAssignDeptModal({ show: false, user: null });
      loadUsers();
    } catch (err) {
      setError(err.message || t("superAdminUsers.assignDeptError"));
    } finally {
      setAssignDeptLoading(false);
    }
  };

  const displayed = allUsers.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && u.isActive) ||
      (filterStatus === "inactive" && !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: allUsers.length,
    active: allUsers.filter((u) => u.isActive).length,
    inactive: allUsers.filter((u) => !u.isActive).length,
  };

  const roleLabel = (role) => {
    const key = ROLE_I18N[role];
    return key ? t(`superAdminDashboard.${key}`) : role;
  };

  const modalBody = confirmModal.user
    ? confirmModal.user.isActive
      ? t("superAdminUsers.modalConfirmDeactivate", { name: confirmModal.user.name })
      : t("superAdminUsers.modalConfirmActivate", { name: confirmModal.user.name })
    : "";

  return (
    <>
      <Row className="align-items-center mb-4 flex-wrap">
        <Col md>
          <h4 className="fw-bold mb-1" style={{ color: "#009688" }}>
            {t("superAdminUsers.pageTitle")}
          </h4>
          <p className="text-muted mb-0">{t("superAdminUsers.subtitle")}</p>
        </Col>
        {isSuperAdmin && (
          <Col xs="auto" className="mb-4">
            <Button
              variant="primary"
              size="sm"
              className="text-nowrap"
              style={{ background: "#009688", borderColor: "#009688" }}
              onClick={() => {
                setError("");
                setAddAdminModal(true);
              }}
            >
              <i className="ri-user-add-line me-1"></i>
              {t("superAdminUsers.addAdminButton")}
            </Button>
          </Col>
        )}
      </Row>

      <Row className="mb-4">
        {STAT_DEFS.map((s) => (
          <Col md={4} key={s.labelKey}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, background: s.color + "20" }}
                >
                  <i className={s.icon} style={{ fontSize: 22, color: s.color }}></i>
                </div>
                <div>
                  <div className="fw-bold fs-4" style={{ color: s.color }}>{stats[s.valueKey]}</div>
                  <div className="text-muted small">{t(`superAdminUsers.${s.labelKey}`)}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {actionMsg && <Alert variant="success" dismissible onClose={() => setActionMsg("")}>{actionMsg}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text><i className="ri-search-line"></i></InputGroup.Text>
                <Form.Control
                  placeholder={t("superAdminUsers.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="all">{t("superAdminUsers.filterAllRoles")}</option>
                <option value="admin">{t("superAdminDashboard.roleAdmin")}</option>
                <option value="doctor">{t("superAdminDashboard.roleDoctor")}</option>
                <option value="patient">{t("superAdminDashboard.rolePatient")}</option>
                <option value="nurse">{t("superAdminDashboard.roleNurse")}</option>
                <option value="auditor">{t("superAdminDashboard.roleAuditor")}</option>
                <option value="carecoordinator">{t("superAdminDashboard.roleCareCoordinator")}</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">{t("superAdminUsers.filterAllStatuses")}</option>
                <option value="active">{t("superAdminDashboard.statusActive")}</option>
                <option value="inactive">{t("superAdminDashboard.statusInactive")}</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Button variant="outline-secondary" onClick={loadUsers} title={t("superAdminUsers.refreshTitle")}>
                <i className="ri-refresh-line"></i>
              </Button>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: "#009688" }} role="status" />
              <span className="visually-hidden">{t("superAdminUsers.loadingSpinner")}</span>
              <p className="mt-3 text-muted">{t("superAdminUsers.loadingUsers")}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    <th>{t("superAdminUsers.colNumber")}</th>
                    <th>{t("superAdminUsers.colName")}</th>
                    <th>{t("superAdminUsers.colEmail")}</th>
                    <th>{t("superAdminUsers.colRole")}</th>
                    <th>{t("superAdminUsers.colDepartment")}</th>
                    <th>{t("superAdminUsers.colStatus")}</th>
                    <th>{t("superAdminUsers.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        {t("superAdminUsers.emptyNoUsers")}
                      </td>
                    </tr>
                  ) : (
                    displayed.map((user, idx) => (
                      <tr key={`${user.collection}-${user._id}`}>
                        <td className="text-muted">{idx + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{ width: 36, height: 36, background: "#009688", fontSize: 14, flexShrink: 0 }}
                            >
                              {(user.name || "?")[0].toUpperCase()}
                            </div>
                            <span>{user.name || t("superAdminUsers.dash")}</span>
                          </div>
                        </td>
                        <td className="text-muted">{user.email}</td>
                        <td>
                          <Badge bg={ROLE_COLORS[user.role] || "secondary"}>{roleLabel(user.role)}</Badge>
                        </td>
                        <td className="text-muted small">
                          {user.role === "admin" && user.collection === "user"
                            ? user.department || t("superAdminUsers.dash")
                            : t("superAdminUsers.dash")}
                        </td>
                        <td>
                          <Badge bg={user.isActive ? "success" : "secondary"}>
                            {user.isActive ? t("superAdminDashboard.statusActive") : t("superAdminDashboard.statusInactive")}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1 align-items-center">
                            {isSuperAdmin && user.role === "admin" && user.collection === "user" && (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                className="text-nowrap"
                                onClick={() => openAssignDepartment(user)}
                                title={t("superAdminUsers.assignDeptTitle")}
                              >
                                <i className="ri-building-line me-1"></i>
                                {t("superAdminUsers.assignDept")}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={user.isActive ? "outline-danger" : "outline-success"}
                              onClick={() => openConfirm(user)}
                            >
                              <i className={user.isActive ? "ri-user-unfollow-line" : "ri-user-follow-line"}></i>
                              {" "}{user.isActive ? t("superAdminUsers.deactivate") : t("superAdminUsers.activate")}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="text-muted small mt-2">
                {t("superAdminUsers.showingCount", { shown: displayed.length, total: allUsers.length })}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={confirmModal.show} onHide={() => setConfirmModal({ show: false, user: null })}>
        <Modal.Header closeButton>
          <Modal.Title>{t("superAdminUsers.modalTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalBody}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmModal({ show: false, user: null })}>
            {t("superAdminUsers.cancel")}
          </Button>
          <Button
            variant={confirmModal.user?.isActive ? "danger" : "success"}
            onClick={() => handleToggle(confirmModal.user)}
          >
            {t("superAdminUsers.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={addAdminModal}
        onHide={() => !addAdminLoading && setAddAdminModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("superAdminUsers.addAdminModalTitle")}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateAdmin}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t("superAdminUsers.addAdminEmail")}</Form.Label>
              <Form.Control
                type="email"
                required
                autoComplete="email"
                value={addAdminForm.email}
                onChange={(e) => setAddAdminForm((f) => ({ ...f, email: e.target.value }))}
                disabled={addAdminLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t("superAdminUsers.addAdminPassword")}</Form.Label>
              <Form.Control
                type="password"
                required
                autoComplete="new-password"
                value={addAdminForm.password}
                onChange={(e) => setAddAdminForm((f) => ({ ...f, password: e.target.value }))}
                disabled={addAdminLoading}
                minLength={6}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t("superAdminUsers.addAdminNameOptional")}</Form.Label>
              <Form.Control
                type="text"
                autoComplete="name"
                value={addAdminForm.name}
                onChange={(e) => setAddAdminForm((f) => ({ ...f, name: e.target.value }))}
                disabled={addAdminLoading}
              />
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>{t("superAdminUsers.addAdminDepartmentOptional")}</Form.Label>
              <Form.Select
                value={addAdminForm.department}
                onChange={(e) => setAddAdminForm((f) => ({ ...f, department: e.target.value }))}
                disabled={addAdminLoading}
              >
                <option value="">{t("superAdminUsers.addAdminDepartmentNone")}</option>
                {deptOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" disabled={addAdminLoading} onClick={() => setAddAdminModal(false)}>
              {t("superAdminUsers.cancel")}
            </Button>
            <Button type="submit" style={{ background: "#009688", borderColor: "#009688" }} disabled={addAdminLoading}>
              {addAdminLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t("superAdminUsers.addAdminSaving")}
                </>
              ) : (
                t("superAdminUsers.addAdminSubmit")
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={assignDeptModal.show}
        onHide={() => !assignDeptLoading && setAssignDeptModal({ show: false, user: null })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("superAdminUsers.assignDeptModalTitle")}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAssignDepartment}>
          <Modal.Body>
            <p className="text-muted small mb-3">
              {assignDeptModal.user?.name} — {assignDeptModal.user?.email}
            </p>
            <Form.Group className="mb-0">
              <Form.Label>{t("superAdminUsers.assignDeptLabel")}</Form.Label>
              <Form.Select
                value={assignDeptForm.department}
                onChange={(e) => setAssignDeptForm({ department: e.target.value })}
                disabled={assignDeptLoading}
              >
                <option value="">{t("superAdminUsers.addAdminDepartmentNone")}</option>
                {assignDeptOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              type="button"
              disabled={assignDeptLoading}
              onClick={() => setAssignDeptModal({ show: false, user: null })}
            >
              {t("superAdminUsers.cancel")}
            </Button>
            <Button type="submit" style={{ background: "#009688", borderColor: "#009688" }} disabled={assignDeptLoading}>
              {assignDeptLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t("superAdminUsers.assignDeptSaving")}
                </>
              ) : (
                t("superAdminUsers.assignDeptSubmit")
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default UserList;
