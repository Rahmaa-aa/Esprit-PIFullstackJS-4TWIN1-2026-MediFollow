import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Col, Row, Form, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { Link } from "react-router-dom";
import { superAdminApi } from "../../services/api";
import ConfirmActionModal from "../../components/ConfirmActionModal";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;
const DEFAULT_AVATAR = generatePath("/assets/images/user/11.png");

/** Same canonical values as add-auditor.jsx — keys under addAuditor.dept* */
const DEPARTMENT_I18N = {
  "Qualité": "deptQuality",
  "Conformité": "deptCompliance",
  "Audit Interne": "deptInternalAudit",
  "Gestion des risques": "deptRiskManagement",
  "Direction Médicale": "deptMedicalDirection",
  "Autre": "deptOther",
};

function departmentLabel(department, t) {
  if (!department) return t("auditorList.defaultDepartmentBadge");
  const key = DEPARTMENT_I18N[department];
  return key ? t(`addAuditor.${key}`) : department;
}

const AuditorList = () => {
  const { t } = useTranslation();
  const [auditors, setAuditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterName, setFilterName] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const fetchAuditors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await superAdminApi.getAuditors();
      setAuditors(data);
    } catch (err) {
      setError(err.message || t("auditorList.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAuditors();
  }, [fetchAuditors]);

  const filtered = useMemo(() => {
    const q = filterName.trim().toLowerCase();
    return auditors.filter((a) =>
      !q || `${a.firstName || ""} ${a.lastName || ""} ${a.name || ""}`.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
    );
  }, [auditors, filterName]);

  const handleDelete = async (auditor) => {
    setDeletingId(auditor.id);
    try {
      await superAdminApi.deleteAuditor(auditor.id);
      setAuditors((prev) => prev.filter((a) => a.id !== auditor.id));
      setToDelete(null);
    } catch (err) {
      alert(err.message || t("auditorList.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const getImageSrc = (a) => (a.profileImage?.startsWith("data:") || a.profileImage?.startsWith("http")) ? a.profileImage : DEFAULT_AVATAR;

  const displayName = (a) => a.name || `${a.firstName || ""} ${a.lastName || ""}`.trim() || t("superAdminUsers.dash");

  const deleteModalName = toDelete
    ? (toDelete.name || `${toDelete.firstName || ""} ${toDelete.lastName || ""}`.trim() || toDelete.email)
    : "";

  if (loading) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t("auditorList.loadingSpinner")}</span>
              </div>
              <p className="mt-3 mb-0">{t("auditorList.loadingText")}</p>
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
                <h4 className="card-title mb-0">{t("auditorList.pageTitle")}</h4>
                <p className="text-muted mb-0 small">
                  {t("auditorList.foundAuditors", { count: filtered.length })}
                </p>
              </div>
              <Link to="/super-admin/auditors/add" className="btn btn-primary btn-sm">
                <i className="ri-add-line me-1"></i>{t("auditorList.addAuditor")}
              </Link>
            </Card.Header>
            <Card.Body>
              {error && <div className="alert alert-danger">{error}</div>}
              <Row className="mb-3">
                <Col md={5}>
                  <InputGroup>
                    <InputGroup.Text><i className="ri-search-line"></i></InputGroup.Text>
                    <Form.Control
                      placeholder={t("auditorList.searchPlaceholder")}
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>
              <Row className="g-3">
                {filtered.length === 0 ? (
                  <Col sm={12}><div className="text-center text-muted py-5">{t("auditorList.emptyNoResults")}</div></Col>
                ) : filtered.map((a) => (
                  <Col key={a.id} xl={3} md={4} sm={6}>
                    <Card className="border shadow-sm h-100">
                      <Card.Body className="text-center p-3">
                        <img
                          src={getImageSrc(a)}
                          alt={t("auditorList.avatarAlt", { name: displayName(a) })}
                          className="rounded-circle mb-2 border"
                          style={{ width: 72, height: 72, objectFit: "cover" }}
                        />
                        <h6 className="mb-0">{displayName(a)}</h6>
                        <small className="text-muted">{a.email}</small>
                        <div className="mt-2">
                          <span className="badge bg-warning bg-opacity-10 text-warning">
                            {departmentLabel(a.department, t)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className={`badge ${a.isActive ? "bg-success" : "bg-danger"} bg-opacity-10 ${a.isActive ? "text-success" : "text-danger"}`}>
                            {a.isActive ? t("superAdminDashboard.statusActive") : t("superAdminDashboard.statusInactive")}
                          </span>
                        </div>
                        <div className="d-flex justify-content-center gap-2 mt-3">
                          <Link
                            to={`/super-admin/auditors/${a.id}`}
                            className="btn btn-sm btn-primary-subtle"
                            title={t("auditorList.viewTitle")}
                          >
                            <i className="ri-eye-line"></i>
                          </Link>
                          <Link
                            to={`/super-admin/auditors/edit/${a.id}`}
                            className="btn btn-sm btn-info-subtle"
                            title={t("auditorList.editTitle")}
                          >
                            <i className="ri-edit-line"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger-subtle"
                            onClick={() => setToDelete(a)}
                            title={t("auditorList.deleteTitle")}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
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
        title={t("auditorList.modalDeleteTitle")}
        message={toDelete ? t("auditorList.modalDeleteMessage", { name: deleteModalName }) : ""}
        confirmLabel={t("auditorList.confirmDelete")}
        cancelLabel={t("auditorList.cancel")}
        confirmVariant="danger"
        iconClass="ri-delete-bin-6-line"
      />
    </>
  );
};

export default AuditorList;
