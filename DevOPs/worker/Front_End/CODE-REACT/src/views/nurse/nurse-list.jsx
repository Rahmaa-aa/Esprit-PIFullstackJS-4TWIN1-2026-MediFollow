import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Col, Row, Form, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { Link } from "react-router-dom";
import { nurseApi } from "../../services/api";
import ConfirmActionModal from "../../components/ConfirmActionModal";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const DEFAULT_AVATAR = generatePath("/assets/images/user/11.png");

const NurseList = () => {
  const { t } = useTranslation();
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [nurseToDelete, setNurseToDelete] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");

  const filteredNurses = useMemo(() => {
    const nameLower = filterName.trim().toLowerCase();
    const specialtyLower = filterSpecialty.trim().toLowerCase();
    return nurses.filter((n) => {
      const matchName = !nameLower || `${(n.firstName || "").toLowerCase()} ${(n.lastName || "").toLowerCase()}`.includes(nameLower);
      const matchSpecialty = !specialtyLower || (n.specialty || "").toLowerCase().includes(specialtyLower);
      return matchName && matchSpecialty;
    });
  }, [nurses, filterName, filterSpecialty]);

  const fetchNurses = useCallback(async () => {
    try {
      const data = await nurseApi.getAll();
      setNurses(data);
      setError("");
    } catch (err) {
      setError(err.message || t("nurseList.loadError"));
      setNurses([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchNurses();
  }, [fetchNurses]);

  const handleDelete = async (nurse) => {
    setDeletingId(nurse._id);
    try {
      await nurseApi.delete(nurse._id);
      setNurses((prev) => prev.filter((n) => n._id !== nurse._id));
      setNurseToDelete(null);
    } catch (err) {
      if (err.status === 401) window.location.href = "/auth/lock-screen";
      else alert(err.message || t("nurseList.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const getImageSrc = (nurse) => {
    if (nurse.profileImage?.startsWith("data:")) return nurse.profileImage;
    if (nurse.profileImage?.startsWith("http") || nurse.profileImage?.startsWith("/")) {
      return nurse.profileImage.startsWith("http") ? nurse.profileImage : generatePath(nurse.profileImage);
    }
    return DEFAULT_AVATAR;
  };

  if (loading) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t("nurseList.loadingSpinner")}</span>
              </div>
              <p className="mt-3 mb-0">{t("nurseList.loadingText")}</p>
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
            <Card.Header className="card-header-custom d-flex justify-content-between align-items-center p-4 mb-0 border-bottom-0">
              <Card.Header.Title>
                <h4 className="card-title">{t("nurseList.pageTitle")}</h4>
              </Card.Header.Title>
              <Link to="/nurse/add-nurse" className="btn btn-primary-subtle">
                <i className="ri-user-add-fill me-1"></i>{t("nurseList.addNurse")}
              </Link>
            </Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small">{t("nurseList.filterByName")}</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="ri-user-search-line"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder={t("nurseList.placeholderName")}
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small">{t("nurseList.filterBySpecialty")}</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="ri-stethoscope-line"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder={t("nurseList.placeholderSpecialty")}
                        value={filterSpecialty}
                        onChange={(e) => setFilterSpecialty(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  {(filterName || filterSpecialty) && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => { setFilterName(""); setFilterSpecialty(""); }}
                    >
                      <i className="ri-filter-off-line me-1"></i>{t("nurseList.resetFilters")}
                    </button>
                  )}
                </Col>
              </Row>
              {(filterName || filterSpecialty) && (
                <p className="text-muted small mb-0 mt-2">
                  {t("nurseList.foundNurses", { count: filteredNurses.length })}
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {error && (
          <Col sm={12}>
            <div className="alert alert-warning mt-3">{error}</div>
          </Col>
        )}

        {nurses.length === 0 && !error ? (
          <Col sm={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-3">{t("nurseList.emptyNoNurses")}</p>
                <Link to="/nurse/add-nurse" className="btn btn-primary-subtle">{t("nurseList.addFirstNurse")}</Link>
              </Card.Body>
            </Card>
          </Col>
        ) : nurses.length > 0 && filteredNurses.length === 0 ? (
          <Col sm={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-3">{t("nurseList.emptyNoMatch")}</p>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => { setFilterName(""); setFilterSpecialty(""); }}
                >
                  {t("nurseList.resetFiltersLong")}
                </button>
              </Card.Body>
            </Card>
          </Col>
        ) : null}

        {filteredNurses.map((nurse) => (
          <Col key={nurse._id} sm={6} md={3}>
            <Card>
              <Card.Body className="text-center">
                <Link to={`/nurse/nurse-profile/${nurse._id}`} className="text-decoration-none text-body d-block">
                  <div className="doc-profile">
                    <img
                      className="rounded-circle img-fluid avatar-80"
                      src={getImageSrc(nurse)}
                      alt={t("nurseList.avatarAlt", { firstName: nurse.firstName || "", lastName: nurse.lastName || "" })}
                      style={{ width: "80px", height: "80px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="doc-info mt-3">
                    <h5 className="mb-1">{nurse.firstName} {nurse.lastName}</h5>
                    <p className="text-muted mb-0">{nurse.specialty || t("nurseList.defaultSpecialty")}{nurse.department ? ` • ${nurse.department}` : ""}</p>
                    <small className="text-muted">{nurse.email}</small>
                  </div>
                </Link>
                <div className="d-flex gap-2 justify-content-center flex-wrap mt-3">
                  <Link to={`/nurse/nurse-profile/${nurse._id}`} className="btn btn-primary-subtle btn-sm">{t("nurseList.profile")}</Link>
                  <Link to={`/nurse/edit-nurse/${nurse._id}`} className="btn btn-warning-subtle btn-sm">{t("nurseList.edit")}</Link>
                  <button
                    type="button"
                    className="btn btn-danger-subtle btn-sm"
                    onClick={() => setNurseToDelete(nurse)}
                    disabled={deletingId === nurse._id}
                  >
                    {deletingId === nurse._id ? t("nurseList.deleting") : t("nurseList.delete")}
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <ConfirmActionModal
        show={!!nurseToDelete}
        title={t("nurseList.modalDeleteTitle")}
        message={nurseToDelete
          ? t("nurseList.modalDeleteMessage", {
              firstName: nurseToDelete.firstName || "",
              lastName: nurseToDelete.lastName || "",
            })
          : ""}
        onCancel={() => setNurseToDelete(null)}
        onConfirm={() => nurseToDelete && handleDelete(nurseToDelete)}
        confirmLabel={t("nurseList.confirmDelete")}
        loading={deletingId === nurseToDelete?._id}
        iconClass="ri-delete-bin-6-line"
      />
    </>
  );
};

export default NurseList;
