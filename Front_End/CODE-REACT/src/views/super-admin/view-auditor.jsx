import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { superAdminApi } from "../../services/api";

const DEPARTMENT_I18N = {
  "Qualité": "deptQuality",
  "Conformité": "deptCompliance",
  "Audit Interne": "deptInternalAudit",
  "Gestion des risques": "deptRiskManagement",
  "Direction Médicale": "deptMedicalDirection",
  "Autre": "deptOther",
};

function departmentLabel(department, t) {
  if (!department) return "";
  const key = DEPARTMENT_I18N[department];
  return key ? t(`addAuditor.${key}`) : department;
}

const FIELD_DEFS = [
  { labelKey: "labelEmail", getValue: (a) => a.email, icon: "ri-mail-line" },
  { labelKey: "labelPhone", getValue: (a) => a.phone, icon: "ri-phone-line" },
  {
    labelKey: "labelDepartment",
    getValue: (a, t) => departmentLabel(a.department, t),
    icon: "ri-building-2-line",
  },
  { labelKey: "labelSpecialty", getValue: (a) => a.specialty, icon: "ri-stethoscope-line" },
  { labelKey: "labelAddress", getValue: (a) => a.address, icon: "ri-map-pin-line" },
  { labelKey: "labelCity", getValue: (a) => a.city, icon: "ri-building-line" },
  { labelKey: "labelCountry", getValue: (a) => a.country, icon: "ri-global-line" },
];

const ViewAuditor = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [auditor, setAuditor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuditor = async () => {
      try {
        const res = await superAdminApi.getAuditorById(id);
        setAuditor(res?.data || res);
      } catch {
        setError(t("superAdminViewAuditor.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchAuditor();
  }, [id, t]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: "#009688" }} role="status" />
        <span className="visually-hidden">{t("superAdminViewAuditor.loading")}</span>
        <p className="mt-3 text-muted mb-0">{t("superAdminViewAuditor.loading")}</p>
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!auditor) return null;

  const displayName =
    auditor.name ||
    `${auditor.firstName || ""} ${auditor.lastName || ""}`.trim() ||
    auditor.email;

  const initial = displayName?.length ? displayName[0].toUpperCase() : t("superAdminViewAuditor.avatarFallback");

  return (
    <Row className="justify-content-center">
      <Col md={8}>
        <Card className="shadow-sm border-0">
          <Card.Header
            className="d-flex align-items-center justify-content-between"
            style={{ background: "#009688", color: "#fff" }}
          >
            <h5 className="mb-0">
              <i className="ri-shield-check-fill me-2"></i>{t("superAdminViewAuditor.profileTitle")}
            </h5>
            <div className="d-flex gap-2">
              <Link to={`/super-admin/auditors/edit/${id}`} className="btn btn-sm btn-light">
                <i className="ri-edit-line me-1"></i>{t("superAdminViewAuditor.edit")}
              </Link>
              <Button variant="outline-light" size="sm" onClick={() => navigate("/super-admin/auditors")}>
                <i className="ri-arrow-left-line me-1"></i>{t("superAdminViewAuditor.back")}
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: 80, height: 80, background: "#009688", fontSize: 28, flexShrink: 0 }}
              >
                {initial}
              </div>
              <div>
                <h4 className="mb-1">{displayName}</h4>
                <Badge bg="secondary" className="me-2">{t("superAdminDashboard.roleAuditor")}</Badge>
                <Badge bg={auditor.isActive !== false ? "success" : "danger"}>
                  {auditor.isActive !== false ? t("superAdminDashboard.statusActive") : t("superAdminDashboard.statusInactive")}
                </Badge>
              </div>
            </div>

            <Row className="g-3">
              {FIELD_DEFS.map(({ labelKey, getValue, icon }) => {
                const value = getValue(auditor, t);
                return value ? (
                  <Col md={6} key={labelKey}>
                    <div className="d-flex align-items-start gap-2">
                      <i className={`${icon} mt-1`} style={{ color: "#009688", fontSize: 16 }}></i>
                      <div>
                        <div className="text-muted small">{t(`superAdminViewAuditor.${labelKey}`)}</div>
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

export default ViewAuditor;
