import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Col, Row, Form, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { Link } from "react-router-dom";
import { superAdminApi } from "../../services/api";
import ConfirmActionModal from "../../components/ConfirmActionModal";
import { hospitalDepartmentLabel } from "../../constants/hospitalDepartments";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;
const DEFAULT_AVATAR = generatePath("/assets/images/user/11.png");

function departmentBadgeLabel(department, t) {
  if (!department) return t("adminList.defaultDepartmentBadge");
  return hospitalDepartmentLabel(department, t);
}

const AdminList = () => {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterName, setFilterName] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await superAdminApi.getAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || t("adminList.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const filtered = useMemo(() => {
    const q = filterName.trim().toLowerCase();
    return admins.filter((a) => {
      if (!q) return true;
      const name = `${a.firstName || ""} ${a.lastName || ""} ${a.name || ""}`.toLowerCase();
      const dept = String(a.department || "").toLowerCase();
      return name.includes(q) || a.email.toLowerCase().includes(q) || dept.includes(q);
    });
  }, [admins, filterName]);

  const handleDelete = async (admin) => {
    setDeletingId(admin.id);
    try {
      await superAdminApi.deleteAdmin(admin.id);
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      setToDelete(null);
    } catch (err) {
      alert(err.message || t("adminList.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const getImageSrc = (a) =>
    a.profileImage?.startsWith("data:") || a.profileImage?.startsWith("http") ? a.profileImage : DEFAULT_AVATAR;

  const displayName = (a) => a.name || `${a.firstName || ""} ${a.lastName || ""}`.trim() || t("superAdminUsers.dash");

  const deleteModalName = toDelete
    ? toDelete.name || `${toDelete.firstName || ""} ${toDelete.lastName || ""}`.trim() || toDelete.email
    : "";

  if (loading) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t("adminList.loadingSpinner")}</span>
              </div>
              <p className="mt-3 mb-0">{t("adminList.loadingText")}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="header-title">
                <h4 className="card-title mb-0">{t("adminList.pageTitle")}</h4>
                <p className="text-muted mb-0 small">{t("adminList.foundAdmins", { count: filtered.length })}</p>
              </div>
              <Link to="/super-admin/admins/add" className="btn btn-primary btn-sm">
                <i className="ri-add-line me-1"></i>
                {t("adminList.addAdmin")}
              </Link>
            </Card.Header>
            <Card.Body>
              {error && <div className="alert alert-danger">{error}</div>}
              <Row className="mb-3">
                <Col md={5}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="ri-search-line"></i>
                    </InputGroup.Text>
                    <Form.Control
                      placeholder={t("adminList.searchPlaceholder")}
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>
              <Row className="g-3">
                {filtered.length === 0 ? (
                  <Col sm={12}>
                    <div className="text-center text-muted py-5">{t("adminList.emptyNoResults")}</div>
                  </Col>
                ) : (
                  filtered.map((a) => (
                    <Col key={a.id} xl={3} md={4} sm={6}>
                      <Card className="border shadow-sm h-100">
                        <Card.Body className="text-center p-3">
                          <img
                            src={getImageSrc(a)}
                            alt={t("adminList.avatarAlt", { name: displayName(a) })}
                            className="rounded-circle mb-2 border"
                            style={{ width: 72, height: 72, objectFit: "cover" }}
                          />
                          <h6 className="mb-0">{displayName(a)}</h6>
                          <small className="text-muted">{a.email}</small>
                          <div className="mt-2">
                            <span className="badge bg-warning bg-opacity-10 text-warning">
                              {departmentBadgeLabel(a.department, t)}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span
                              className={`badge ${a.isActive ? "bg-success" : "bg-danger"} bg-opacity-10 ${a.isActive ? "text-success" : "text-danger"}`}
                            >
                              {a.isActive ? t("superAdminDashboard.statusActive") : t("superAdminDashboard.statusInactive")}
                            </span>
                          </div>
                          <div className="d-flex justify-content-center gap-2 mt-3">
                            <Link
                              to={`/super-admin/admins/${a.id}`}
                              className="btn btn-sm btn-primary-subtle"
                              title={t("adminList.viewTitle")}
                            >
                              <i className="ri-eye-line"></i>
                            </Link>
                            <Link
                              to={`/super-admin/admins/edit/${a.id}`}
                              className="btn btn-sm btn-info-subtle"
                              title={t("adminList.editTitle")}
                            >
                              <i className="ri-edit-line"></i>
                            </Link>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger-subtle"
                              onClick={() => setToDelete(a)}
                              title={t("adminList.deleteTitle")}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ConfirmActionModal
        show={!!toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={() => handleDelete(toDelete)}
        loading={deletingId === toDelete?.id}
        title={t("adminList.modalDeleteTitle")}
        message={toDelete ? t("adminList.modalDeleteMessage", { name: deleteModalName }) : ""}
        confirmLabel={t("adminList.confirmDelete")}
        cancelLabel={t("adminList.cancel")}
        confirmVariant="danger"
        iconClass="ri-delete-bin-6-line"
      />
    </>
  );
};

export default AdminList;
