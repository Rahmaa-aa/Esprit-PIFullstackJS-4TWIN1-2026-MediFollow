import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Col, Row, Form, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { Link } from "react-router-dom";
import { doctorApi } from "../../services/api";
import ConfirmActionModal from "../../components/ConfirmActionModal";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const DEFAULT_AVATAR = generatePath("/assets/images/user/11.png");

const DoctorList = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");

  const filteredDoctors = useMemo(() => {
    const nameLower = filterName.trim().toLowerCase();
    const specialtyLower = filterSpecialty.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchName = !nameLower || `${(d.firstName || "").toLowerCase()} ${(d.lastName || "").toLowerCase()}`.includes(nameLower);
      const matchSpecialty = !specialtyLower || (d.specialty || "").toLowerCase().includes(specialtyLower);
      return matchName && matchSpecialty;
    });
  }, [doctors, filterName, filterSpecialty]);

  const fetchDoctors = useCallback(async () => {
    try {
      const data = await doctorApi.getAll();
      setDoctors(data);
      setError("");
    } catch (err) {
      setError(err.message || t("doctorList.loadError"));
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleDelete = async (doctor) => {
    setDeletingId(doctor._id);
    try {
      await doctorApi.delete(doctor._id);
      setDoctors((prev) => prev.filter((d) => d._id !== doctor._id));
      setDoctorToDelete(null);
    } catch (err) {
      if (err.status === 401) window.location.href = "/auth/lock-screen";
      else alert(err.message || t("doctorList.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const getImageSrc = (doctor) => {
    if (doctor.profileImage?.startsWith("data:")) return doctor.profileImage;
    if (doctor.profileImage?.startsWith("http") || doctor.profileImage?.startsWith("/")) {
      return doctor.profileImage.startsWith("http") ? doctor.profileImage : generatePath(doctor.profileImage);
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
                <span className="visually-hidden">{t("doctorList.loadingSpinner")}</span>
              </div>
              <p className="mt-3 mb-0">{t("doctorList.loadingText")}</p>
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
                <h4 className="card-title">{t("doctorList.pageTitle")}</h4>
              </Card.Header.Title>
              <Link to="/doctor/add-doctor" className="btn btn-primary-subtle">
                <i className="ri-user-add-fill me-1"></i>{t("doctorList.addDoctor")}
              </Link>
            </Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small">{t("doctorList.filterByName")}</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="ri-user-search-line"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder={t("doctorList.placeholderName")}
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small">{t("doctorList.filterBySpecialty")}</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="ri-stethoscope-line"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder={t("doctorList.placeholderSpecialty")}
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
                      <i className="ri-filter-off-line me-1"></i>{t("doctorList.resetFilters")}
                    </button>
                  )}
                </Col>
              </Row>
              {(filterName || filterSpecialty) && (
                <p className="text-muted small mb-0 mt-2">
                  {t("doctorList.foundDoctors", { count: filteredDoctors.length })}
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

        {doctors.length === 0 && !error ? (
          <Col sm={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-3">{t("doctorList.emptyNoDoctors")}</p>
                <Link to="/doctor/add-doctor" className="btn btn-primary-subtle">{t("doctorList.addFirstDoctor")}</Link>
              </Card.Body>
            </Card>
          </Col>
        ) : doctors.length > 0 && filteredDoctors.length === 0 ? (
          <Col sm={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-3">{t("doctorList.emptyNoMatch")}</p>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => { setFilterName(""); setFilterSpecialty(""); }}
                >
                  {t("doctorList.resetFiltersLong")}
                </button>
              </Card.Body>
            </Card>
          </Col>
        ) : null}

        {filteredDoctors.map((doctor) => (
          <Col key={doctor._id} sm={6} md={3}>
            <Card>
              <Card.Body className="text-center">
                <div className="doc-profile">
                  <img
                    className="rounded-circle img-fluid avatar-80"
                    src={getImageSrc(doctor)}
                    alt={t("doctorList.avatarAlt", { firstName: doctor.firstName || "", lastName: doctor.lastName || "" })}
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                </div>
                <div className="doc-info mt-3">
                  <h4>{t("doctorList.doctorPrefix")} {doctor.firstName} {doctor.lastName}</h4>
                  <p className="mb-0">{doctor.specialty || t("doctorList.defaultSpecialty")}</p>
                  <a href={`mailto:${doctor.email}`}>{doctor.email}</a>
                </div>
                <div className="iq-doc-description mt-2">
                  <p className="mb-0">
                    {doctor.department && `${doctor.department} • `}
                    {doctor.phone || "—"}
                  </p>
                </div>
                <div className="doc-social-info mt-3 mb-3">
                  <ul className="m-0 p-0 list-group list-group-horizontal justify-content-center">
                    {doctor.facebookUrl && (
                      <li className="list-group-item border-0 p-0">
                        <a href={doctor.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label={t("doctorList.socialFacebook")}><i className="ri-facebook-fill"></i></a>
                      </li>
                    )}
                    {doctor.twitterUrl && (
                      <li className="list-group-item border-0 p-0">
                        <a href={doctor.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label={t("doctorList.socialTwitter")}><i className="ri-twitter-fill"></i></a>
                      </li>
                    )}
                    {doctor.linkedinUrl && (
                      <li className="list-group-item border-0 p-0">
                        <a href={doctor.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={t("doctorList.socialLinkedIn")}><i className="ri-linkedin-fill"></i></a>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <Link to={`/doctor/doctor-profile/${doctor._id}`} className="btn btn-primary-subtle btn-sm">{t("doctorList.profile")}</Link>
                  <Link to={`/doctor/edit-doctor/${doctor._id}`} className="btn btn-warning-subtle btn-sm">{t("doctorList.edit")}</Link>
                  <button
                    type="button"
                    className="btn btn-danger-subtle btn-sm"
                    onClick={() => setDoctorToDelete(doctor)}
                    disabled={deletingId === doctor._id}
                  >
                    {deletingId === doctor._id ? t("doctorList.deleting") : t("doctorList.delete")}
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <ConfirmActionModal
        show={!!doctorToDelete}
        title={t("doctorList.modalDeleteTitle")}
        message={doctorToDelete
          ? t("doctorList.modalDeleteMessage", {
              firstName: doctorToDelete.firstName || "",
              lastName: doctorToDelete.lastName || "",
            })
          : ""}
        onCancel={() => setDoctorToDelete(null)}
        onConfirm={() => doctorToDelete && handleDelete(doctorToDelete)}
        confirmLabel={t("doctorList.confirmDelete")}
        loading={deletingId === doctorToDelete?._id}
        iconClass="ri-delete-bin-6-line"
      />
    </>
  );
};

export default DoctorList;
