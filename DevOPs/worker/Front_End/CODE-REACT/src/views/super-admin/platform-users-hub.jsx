import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LINKS = [
  {
    to: "/super-admin/admins",
    icon: "ri-user-star-line",
    titleKey: "platformUsers.cardAdminTitle",
    descKey: "platformUsers.cardAdminDesc",
    color: "primary",
  },
  {
    to: "/super-admin/auditors",
    icon: "ri-shield-check-line",
    titleKey: "platformUsers.cardAuditorsTitle",
    descKey: "platformUsers.cardAuditorsDesc",
    color: "warning",
  },
  {
    to: "/super-admin/care-coordinators",
    icon: "ri-heart-pulse-line",
    titleKey: "platformUsers.cardCoordinatorsTitle",
    descKey: "platformUsers.cardCoordinatorsDesc",
    color: "info",
  },
];

const PlatformUsersHub = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-4">
        <h4 className="mb-1">{t("platformUsers.pageTitle")}</h4>
        <p className="text-muted mb-0">{t("platformUsers.subtitle")}</p>
      </div>
      <Row className="g-4">
        {LINKS.map((item) => (
          <Col key={item.to} md={6} xl={4}>
            <Card className="border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #009688" }}>
              <Card.Body className="p-4 d-flex flex-column">
                <div className={`text-${item.color} mb-3`}>
                  <i className={`${item.icon}`} style={{ fontSize: "2rem" }} />
                </div>
                <h5 className="fw-bold mb-2">{t(item.titleKey)}</h5>
                <p className="text-muted small flex-grow-1 mb-3">{t(item.descKey)}</p>
                <Link to={item.to} className={`btn btn-${item.color}-subtle rounded-pill align-self-start`}>
                  {t("platformUsers.open")} <i className="ri-arrow-right-line ms-1" />
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default PlatformUsersHub;
