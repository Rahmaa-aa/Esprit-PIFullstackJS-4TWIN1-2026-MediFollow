import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { superAdminApi } from "../../services/api";
import { hospitalDepartmentLabel } from "../../constants/hospitalDepartments";

function coordinatorDepartmentDisplay(coord, t) {
  const raw = coord.department || coord.specialty;
  if (!raw) return "";
  return hospitalDepartmentLabel(raw, t);
}

const FIELD_DEFS = [
  { labelKey: "labelEmail", getValue: (a) => a.email, icon: "ri-mail-line" },
  { labelKey: "labelPhone", getValue: (a) => a.phone, icon: "ri-phone-line" },
  {
    labelKey: "labelDepartment",
    getValue: (a, t) => coordinatorDepartmentDisplay(a, t),
    icon: "ri-building-2-line",
  },
  { labelKey: "labelAddress", getValue: (a) => a.address, icon: "ri-map-pin-line" },
  { labelKey: "labelCity", getValue: (a) => a.city, icon: "ri-building-line" },
  { labelKey: "labelCountry", getValue: (a) => a.country, icon: "ri-global-line" },
];

const ViewCareCoordinator = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [coordinator, setCoordinator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCoord = async () => {
      try {
        const res = await superAdminApi.getCareCoordinatorById(id);
        setCoordinator(res?.data || res);
      } catch {
        setError(t("superAdminViewCareCoordinator.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchCoord();
  }, [id, t]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: "#009688" }} role="status" />
        <span className="visually-hidden">{t("superAdminViewCareCoordinator.loading")}</span>
        <p className="mt-3 text-muted mb-0">{t("superAdminViewCareCoordinator.loading")}</p>
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!coordinator) return null;

  const displayName =
    coordinator.name ||
    `${coordinator.firstName || ""} ${coordinator.lastName || ""}`.trim() ||
    coordinator.email;

  const initial = displayName?.length ? displayName[0].toUpperCase() : t("superAdminViewCareCoordinator.avatarFallback");
  const pic = coordinator.profileImage && String(coordinator.profileImage).trim();
  const avatarSrc =
    pic && (pic.startsWith("data:") || pic.startsWith("http") || pic.startsWith("/")) ? pic : null;

  return (
    <Row className="justify-content-center">
      <Col md={8}>
        <Card className="shadow-sm border-0">
          <Card.Header
            className="d-flex align-items-center justify-content-between"
            style={{ background: "#009688", color: "#fff" }}
          >
            <h5 className="mb-0">
              <i className="ri-heart-pulse-fill me-2"></i>{t("superAdminViewCareCoordinator.profileTitle")}
            </h5>
            <div className="d-flex gap-2">
              <Link to={`/super-admin/care-coordinators/edit/${id}`} className="btn btn-sm btn-light">
                <i className="ri-edit-line me-1"></i>{t("superAdminViewCareCoordinator.edit")}
              </Link>
              <Button variant="outline-light" size="sm" onClick={() => navigate("/super-admin/care-coordinators")}>
                <i className="ri-arrow-left-line me-1"></i>{t("superAdminViewCareCoordinator.back")}
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt=""
                  className="rounded-circle border"
                  style={{ width: 80, height: 80, objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: 80, height: 80, background: "#009688", fontSize: 28, flexShrink: 0 }}
                >
                  {initial}
                </div>
              )}
              <div>
                <h4 className="mb-1">{displayName}</h4>
                <Badge bg="secondary" className="me-2">{t("superAdminViewCareCoordinator.roleBadge")}</Badge>
                <Badge bg={coordinator.isActive !== false ? "success" : "danger"}>
                  {coordinator.isActive !== false ? t("superAdminDashboard.statusActive") : t("superAdminDashboard.statusInactive")}
                </Badge>
              </div>
            </div>

            <Row className="g-3">
              {FIELD_DEFS.map(({ labelKey, getValue, icon }) => {
                const value = getValue(coordinator, t);
                return value ? (
                  <Col md={6} key={labelKey}>
                    <div className="d-flex align-items-start gap-2">
                      <i className={`${icon} mt-1`} style={{ color: "#009688", fontSize: 16 }}></i>
                      <div>
                        <div className="text-muted small">{t(`superAdminViewCareCoordinator.${labelKey}`)}</div>
                        <div className="fw-medium">{value}</div>
                      </div>
                    </div>
                  </Col>
                ) : null;
              })}
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ViewCareCoordinator;
