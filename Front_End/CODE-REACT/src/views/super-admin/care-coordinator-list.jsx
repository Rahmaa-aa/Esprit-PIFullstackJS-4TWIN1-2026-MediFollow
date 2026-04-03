import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Col, Row, Form, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { Link } from "react-router-dom";
import { superAdminApi } from "../../services/api";
import ConfirmActionModal from "../../components/ConfirmActionModal";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;
const DEFAULT_AVATAR = generatePath("/assets/images/user/11.png");

/** Same canonical values as add-care-coordinator.jsx — keys under addCareCoordinator.spec* */
const SPECIALTY_I18N = {
  "Coordination des soins": "specCareCoordination",
  "Suivi post-opératoire": "specPostOp",
  "Maladies chroniques": "specChronic",
  Pédiatrie: "specPediatrics",
  Gériatrie: "specGeriatrics",
  Oncologie: "specOncology",
  Autre: "specOther",
};

function specialtyLabel(specialty, t) {
  if (!specialty) return t("careCoordinatorList.defaultSpecialtyBadge");
  const key = SPECIALTY_I18N[specialty];
  return key ? t(`addCareCoordinator.${key}`) : specialty;
}

const CareCoordinatorList = () => {
  const { t } = useTranslation();
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterName, setFilterName] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const fetchCoordinators = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await superAdminApi.getCareCoordinators();
      setCoordinators(data);
    } catch (err) {
      setError(err.message || t("careCoordinatorList.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCoordinators();
  }, [fetchCoordinators]);

  const filtered = useMemo(() => {
    const q = filterName.trim().toLowerCase();
    return coordinators.filter((c) =>
      !q || `${c.firstName || ""} ${c.lastName || ""} ${c.name || ""}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [coordinators, filterName]);

  const handleDelete = async (coord) => {
    setDeletingId(coord.id);
    try {
      await superAdminApi.deleteCareCoordinator(coord.id);
      setCoordinators((prev) => prev.filter((c) => c.id !== coord.id));
      setToDelete(null);
    } catch (err) {
      alert(err.message || t("careCoordinatorList.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const getImageSrc = (c) => (c.profileImage?.startsWith("data:") || c.profileImage?.startsWith("http")) ? c.profileImage : DEFAULT_AVATAR;

  const displayName = (c) => c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim() || t("superAdminUsers.dash");

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
                <span className="visually-hidden">{t("careCoordinatorList.loadingSpinner")}</span>
              </div>
              <p className="mt-3 mb-0">{t("careCoordinatorList.loadingText")}</p>
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
                <h4 className="card-title mb-0">{t("careCoordinatorList.pageTitle")}</h4>
                <p className="text-muted mb-0 small">
                  {t("careCoordinatorList.foundCoordinators", { count: filtered.length })}
                </p>
              </div>
              <Link to="/super-admin/care-coordinators/add" className="btn btn-primary btn-sm">
                <i className="ri-add-line me-1"></i>{t("careCoordinatorList.addCareCoordinator")}
              </Link>
            </Card.Header>
            <Card.Body>
              {error && <div className="alert alert-danger">{error}</div>}
              <Row className="mb-3">
                <Col md={5}>
                  <InputGroup>
                    <InputGroup.Text><i className="ri-search-line"></i></InputGroup.Text>
                    <Form.Control
                      placeholder={t("careCoordinatorList.searchPlaceholder")}
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>
              <Row className="g-3">
                {filtered.length === 0 ? (
                  <Col sm={12}><div className="text-center text-muted py-5">{t("careCoordinatorList.emptyNoResults")}</div></Col>
                ) : filtered.map((c) => (
                  <Col key={c.id} xl={3} md={4} sm={6}>
                    <Card className="border shadow-sm h-100">
                      <Card.Body className="text-center p-3">
                        <img
                          src={getImageSrc(c)}
                          alt={t("careCoordinatorList.avatarAlt", { name: displayName(c) })}
                          className="rounded-circle mb-2 border"
                          style={{ width: 72, height: 72, objectFit: "cover" }}
                        />
                        <h6 className="mb-0">{displayName(c)}</h6>
                        <small className="text-muted">{c.email}</small>
                        <div className="mt-2">
                          <span className="badge bg-info bg-opacity-10 text-info">
                            {specialtyLabel(c.specialty, t)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className={`badge ${c.isActive ? "bg-success" : "bg-danger"} bg-opacity-10 ${c.isActive ? "text-success" : "text-danger"}`}>
                            {c.isActive ? t("superAdminDashboard.statusActive") : t("superAdminDashboard.statusInactive")}
                          </span>
                        </div>
                        <div className="d-flex justify-content-center gap-2 mt-3">
                          <Link
                            to={`/super-admin/care-coordinators/${c.id}`}
                            className="btn btn-sm btn-primary-subtle"
                            title={t("careCoordinatorList.viewTitle")}
                          >
                            <i className="ri-eye-line"></i>
                          </Link>
                          <Link
                            to={`/super-admin/care-coordinators/edit/${c.id}`}
                            className="btn btn-sm btn-info-subtle"
                            title={t("careCoordinatorList.editTitle")}
                          >
                            <i className="ri-edit-line"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger-subtle"
                            onClick={() => setToDelete(c)}
                            title={t("careCoordinatorList.deleteTitle")}
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
        title={t("careCoordinatorList.modalDeleteTitle")}
        message={toDelete ? t("careCoordinatorList.modalDeleteMessage", { name: deleteModalName }) : ""}
        confirmLabel={t("careCoordinatorList.confirmDelete")}
        cancelLabel={t("careCoordinatorList.cancel")}
        confirmVariant="danger"
        iconClass="ri-delete-bin-6-line"
      />
    </>
  );
};

export default CareCoordinatorList;
