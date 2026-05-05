import React, { useMemo, useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import FaceEnrollmentCard from "../../components/FaceEnrollmentCard";
import { nurseApi } from "../../services/api";

import img11 from "/assets/images/user/11.png";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

/** Face login enrollment only for the nurse viewing their own profile — not for doctors/admins viewing this page. */
function isNurseViewingOwnProfile(profileId) {
  if (!profileId) return false;
  try {
    if (localStorage.getItem("doctorUser") || localStorage.getItem("adminUser") || localStorage.getItem("patientUser")) {
      return false;
    }
    const raw = localStorage.getItem("nurseUser");
    if (!raw) return false;
    const u = JSON.parse(raw);
    const nid = u?.id ?? u?._id;
    return nid != null && String(nid) === String(profileId);
  } catch {
    return false;
  }
}

/** Edit: nurse on own profile, or admin — never for doctors (read-only). */
function canEditNurseProfile(profileId) {
  if (!profileId) return false;
  try {
    if (localStorage.getItem("doctorUser")) return false;
    if (localStorage.getItem("adminUser")) return true;
    const raw = localStorage.getItem("nurseUser");
    if (!raw) return false;
    const u = JSON.parse(raw);
    const nid = u?.id ?? u?._id;
    return nid != null && String(nid) === String(profileId);
  } catch {
    return false;
  }
}

const NurseProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [nurse, setNurse] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState("");

  const showFaceEnrollment = useMemo(() => isNurseViewingOwnProfile(id), [id]);
  const showEditButton = useMemo(() => canEditNurseProfile(id), [id]);

  useEffect(() => {
    if (!id) return;
    const fetchNurse = async () => {
      try {
        const data = await nurseApi.getById(id);
        setNurse(data);
      } catch (err) {
        setError(err.message || t("nurseProfile.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchNurse();
  }, [id]);

  const displayNurse = nurse || {};
  const profileImg = nurse?.profileImage
    ? (nurse.profileImage.startsWith("data:") ? nurse.profileImage
      : (nurse.profileImage.startsWith("http") ? nurse.profileImage : generatePath(nurse.profileImage)))
    : img11;

  if (loading) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t("nurseProfile.loading")}</span>
              </div>
              <p className="mt-3 mb-0">{t("nurseProfile.loadingProfile")}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (id && error) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <p className="text-danger mb-3">{error}</p>
              <Link to="/nurse/nurse-list" className="btn btn-primary-subtle">{t("nurseProfile.backToList")}</Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <>
      {showFaceEnrollment ? (
        <Row>
          <Col sm={12}>
            <FaceEnrollmentCard />
          </Col>
        </Row>
      ) : null}
      <Row>
        <Col lg={4}>
          <Card>
            <Card.Body className="ps-0 pe-0 pt-0">
              <div className="docter-details-block">
                <div className="doc-profile-bg bg-primary rounded-top-2" style={{ height: "150px" }}>
                </div>
                <div className="docter-profile text-center">
                  <img src={profileImg} alt={t("nurseProfile.profilePhotoAlt")} className="avatar-130 img-fluid" style={{ objectFit: "cover" }} />
                </div>
                <div className="text-center mt-3 ps-3 pe-3">
                  <h4><b>{displayNurse.firstName} {displayNurse.lastName}</b></h4>
                  <p>{displayNurse.specialty || t("nurseProfile.defaultSpecialty")}</p>
                  <p className="mb-0">{displayNurse.department || "—"}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Card.Header.Title className="mb-0">
                <h4 className="card-title mb-0">{t("nurseProfile.personalInfo")}</h4>
              </Card.Header.Title>
              {showEditButton ? (
                <Link to={`/nurse/edit-nurse/${id}`} className="btn btn-primary-subtle btn-sm">
                  {t("nurseProfile.edit")}
                </Link>
              ) : null}
            </Card.Header>
            <Card.Body>
              <div className="about-info m-0 p-0">
                <Row>
                  <Col xs={4}>{t("nurseProfile.labelFirstName")}</Col>
                  <Col xs={8}>{displayNurse.firstName || "—"}</Col>
                  <Col xs={4}>{t("nurseProfile.labelLastName")}</Col>
                  <Col xs={8}>{displayNurse.lastName || "—"}</Col>
                  <Col xs={4}>{t("nurseProfile.labelSpecialty")}</Col>
                  <Col xs={8}>{displayNurse.specialty || "—"}</Col>
                  <Col xs={4}>{t("nurseProfile.labelDepartment")}</Col>
                  <Col xs={8}>{displayNurse.department || "—"}</Col>
                  <Col xs={4}>{t("nurseProfile.labelEmail")}</Col>
                  <Col xs={8}>
                    <a href={`mailto:${displayNurse.email || ""}`}>{displayNurse.email || "—"}</a>
                  </Col>
                  <Col xs={4}>{t("nurseProfile.labelPhone")}</Col>
                  <Col xs={8}>
                    <a href={`tel:${displayNurse.phone || ""}`}>{displayNurse.phone || "—"}</a>
                  </Col>
                  <Col xs={4}>{t("nurseProfile.labelAddress")}</Col>
                  <Col xs={8}>{displayNurse.address || "—"}</Col>
                  <Col xs={4}>{t("nurseProfile.labelCity")}</Col>
                  <Col xs={8}>{displayNurse.city || "—"}</Col>
                  <Col xs={4}>{t("nurseProfile.labelCountry")}</Col>
                  <Col xs={8}>{displayNurse.country || "—"}</Col>
                  <Col xs={4}>{t("nurseProfile.labelPostalCode")}</Col>
                  <Col xs={8}>{displayNurse.pinCode || "—"}</Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default NurseProfile;
