import React, { useEffect, useState } from "react";
import { Row, Col, Card as BsCard, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { hospitalDepartmentLabel } from "../../constants/hospitalDepartments";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const QUICK_LINKS = [
  { to: "/dashboard-pages/care-coordinator-patients", icon: "ri-team-line", color: "secondary", titleKey: "quickPatients", descKey: "quickPatientsDesc" },
  { to: "/dashboard-pages/care-coordinator-appointments", icon: "ri-calendar-check-line", color: "info", titleKey: "quickAppointments", descKey: "quickAppointmentsDesc" },
  { to: "/dashboard-pages/care-coordinator-communication", icon: "ri-message-3-line", color: "warning", titleKey: "quickCommunication", descKey: "quickCommunicationDesc" },
  { to: "/notifications", icon: "ri-notification-3-line", color: "primary", titleKey: "quickNotifications", descKey: "quickNotificationsDesc" },
  { to: "/chat", icon: "ri-chat-3-line", color: "success", titleKey: "quickChat", descKey: "quickChatDesc" },
  { to: "/email/inbox", icon: "ri-mail-line", color: "info", titleKey: "quickMail", descKey: "quickMailDesc" },
];

const CareCoordinatorDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    let u = null;
    try {
      const raw = localStorage.getItem("adminUser");
      u = raw ? JSON.parse(raw) : null;
    } catch {
      u = null;
    }
    if (!token || u?.role !== "carecoordinator") {
      navigate("/auth/sign-in", { replace: true });
      return;
    }
    setUser(u);
  }, [navigate]);

  const profileImg = user?.profileImage?.startsWith("data:")
    ? user.profileImage
    : user?.profileImage?.startsWith("http")
      ? user.profileImage
      : user?.profileImage
        ? generatePath(user.profileImage.startsWith("/") ? user.profileImage.slice(1) : user.profileImage)
        : generatePath("/assets/images/user/11.png");

  const displayName =
    user && `${user.firstName || ""} ${user.lastName || ""}`.trim() ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : user?.email || "";

  const deptRaw = user?.department || user?.specialty || "";

  if (!user) {
    return null;
  }

  return (
    <>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Card.Header.Title>
                <h4 className="card-title mb-0">{t("careCoordinatorDashboard.pageTitle")}</h4>
              </Card.Header.Title>
              <Badge bg="secondary">{t("careCoordinatorDashboard.roleBadge")}</Badge>
            </Card.Header>
            <Card.Body>
              <BsCard className="border-0 shadow-sm" style={{ borderInlineStart: "4px solid #009688" }}>
                <BsCard.Body className="d-flex flex-column flex-md-row align-items-md-center gap-3">
                  <img
                    src={profileImg}
                    alt=""
                    className="rounded-circle border"
                    style={{ width: 88, height: 88, objectFit: "cover" }}
                  />
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{displayName}</h5>
                    <p className="text-muted mb-1 small">{user.email}</p>
                    {deptRaw ? (
                      <p className="text-muted mb-0 small">
                        <i className="ri-building-2-line me-1" aria-hidden />
                        {hospitalDepartmentLabel(deptRaw, t)}
                      </p>
                    ) : null}
                  </div>
                </BsCard.Body>
              </BsCard>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col sm={12}>
          <h5 className="mb-3">{t("careCoordinatorDashboard.quickAccessTitle")}</h5>
        </Col>
        {QUICK_LINKS.map((item) => (
          <Col key={item.to} md={4} className="mb-3">
            <Link to={item.to} className="text-decoration-none text-body">
              <BsCard className="border-0 shadow-sm h-100">
                <BsCard.Body className="d-flex align-items-start gap-3">
                  <div className={`rounded-3 p-3 bg-${item.color}-subtle text-${item.color}`}>
                    <i className={`${item.icon} fs-4`} aria-hidden />
                  </div>
                  <div>
                    <h6 className="mb-1">{t(`careCoordinatorDashboard.${item.titleKey}`)}</h6>
                    <p className="text-muted small mb-0">{t(`careCoordinatorDashboard.${item.descKey}`)}</p>
                  </div>
                </BsCard.Body>
              </BsCard>
            </Link>
          </Col>
        ))}
      </Row>

      <Row className="mt-2">
        <Col sm={12}>
          <BsCard className="border-0 bg-light">
            <BsCard.Body className="small text-muted">{t("careCoordinatorDashboard.introHint")}</BsCard.Body>
          </BsCard>
        </Col>
      </Row>
    </>
  );
};

export default CareCoordinatorDashboard;
