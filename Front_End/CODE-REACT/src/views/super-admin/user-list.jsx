import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Card, Button, Badge, Form, InputGroup, Spinner, Alert, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { superAdminApi, doctorApi, patientApi, nurseApi } from "../../services/api";

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
    try {
      const u = JSON.parse(localStorage.getItem("adminUser") || "null");
      setIsSuperAdmin(u?.role === "superadmin");
    } catch {
      setIsSuperAdmin(false);
    }
  }, []);

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
              as={Link}
              to="/super-admin/admins"
              variant="primary"
              size="sm"
              className="text-nowrap"
              style={{ background: "#009688", borderColor: "#009688" }}
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
                    <th>{t("superAdminUsers.colStatus")}</th>
                    <th>{t("superAdminUsers.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
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
                        <td>
                          <Badge bg={user.isActive ? "success" : "secondary"}>
                            {user.isActive ? t("superAdminDashboard.statusActive") : t("superAdminDashboard.statusInactive")}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant={user.isActive ? "outline-danger" : "outline-success"}
                            onClick={() => openConfirm(user)}
                          >
                            <i className={user.isActive ? "ri-user-unfollow-line" : "ri-user-follow-line"}></i>
                            {" "}{user.isActive ? t("superAdminUsers.deactivate") : t("superAdminUsers.activate")}
                          </Button>
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

    </>
  );
};

export default UserList;
