import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  superAdminApi,
  doctorApi,
  patientApi,
  nurseApi,
  healthLogApi,
  appointmentApi,
  departmentApi,
  auditorApi,
} from "../../services/api";

const STAT_CARD_DEFS = [
  { titleKey: "statTotalUsers", statKey: "users", icon: "ri-team-fill", color: "primary", link: "/super-admin/users" },
  { titleKey: "statDoctors", statKey: "doctors", icon: "ri-stethoscope-fill", color: "success", link: "/super-admin/users" },
  { titleKey: "statPatients", statKey: "patients", icon: "ri-user-heart-fill", color: "info", link: "/super-admin/users" },
  { titleKey: "statNurses", statKey: "nurses", icon: "ri-nurse-fill", color: "warning", link: "/super-admin/users" },
  { titleKey: "statAuditors", statKey: "auditors", icon: "ri-shield-check-fill", color: "danger", link: "/super-admin/auditors" },
  { titleKey: "statCareCoordinators", statKey: "careCoordinators", icon: "ri-heart-pulse-fill", color: "secondary", link: "/super-admin/care-coordinators" },
];

const ROLE_LABEL_KEYS = {
  admin: "roleAdmin",
  superadmin: "roleSuperAdmin",
  auditor: "roleAuditor",
  carecoordinator: "roleCareCoordinator",
  doctor: "roleDoctor",
  patient: "rolePatient",
  nurse: "roleNurse",
};

const ROLE_COLORS = {
  admin: "primary", superadmin: "danger", auditor: "warning",
  carecoordinator: "info", doctor: "success", patient: "secondary", nurse: "dark",
};

const SuperAdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({ users: 0, doctors: 0, patients: 0, nurses: 0, auditors: 0, careCoordinators: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformSignals, setPlatformSignals] = useState({
    openVitals: 0,
    pendingApptCount: 0,
    suspicious: 0,
    deptCount: 0,
    topDepts: [],
    vitalsRecent: [],
    auditNotable: [],
  });
  const dateLocale = useMemo(() => {
    const l = (i18n.language || "en").split("-")[0];
    if (l === "fr") return "fr-FR";
    if (l === "ar") return "ar-SA";
    return "en-US";
  }, [i18n.language]);

  const formatTime = (iso) => {
    if (!iso) return t("superAdminDashboard.dash");
    try {
      return new Date(iso).toLocaleString(dateLocale, { dateStyle: "short", timeStyle: "short" });
    } catch {
      return t("superAdminDashboard.dash");
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          users,
          doctors,
          patients,
          nurses,
          auditors,
          coordinators,
          vitalsSummary,
          pendingAppts,
          deptList,
          auditDash,
        ] = await Promise.all([
          superAdminApi.getAllUsers(),
          doctorApi.getAll(),
          patientApi.getAll(),
          nurseApi.getAll(),
          superAdminApi.getAuditors(),
          superAdminApi.getCareCoordinators(),
          healthLogApi.platformOpenVitalsSummary().catch(() => null),
          appointmentApi.getPendingForAdmin().catch(() => []),
          departmentApi.summary().catch(() => []),
          auditorApi.getDashboard().catch(() => null),
        ]);

        setStats({
          users: users.length,
          doctors: doctors.length,
          patients: patients.length,
          nurses: nurses.length,
          auditors: auditors.length,
          careCoordinators: coordinators.length,
        });
        setRecentUsers(users.slice(0, 5));

        const sortedDepts = [...(Array.isArray(deptList) ? deptList : [])].sort(
          (a, b) => (b.total || 0) - (a.total || 0),
        );
        const recentLogs = auditDash?.recentLogs || [];
        const notable = recentLogs.filter(
          (r) => r.suspicious || r.severity === "critical" || r.severity === "warning",
        );
        const auditNotable = (notable.length ? notable : recentLogs).slice(0, 5);

        setPlatformSignals({
          openVitals: vitalsSummary?.openCount ?? 0,
          pendingApptCount: Array.isArray(pendingAppts) ? pendingAppts.length : 0,
          suspicious: auditDash?.kpis?.suspiciousActions ?? 0,
          deptCount: sortedDepts.length,
          topDepts: sortedDepts.slice(0, 5),
          vitalsRecent: vitalsSummary?.recent || [],
          auditNotable,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const roleLabel = (role) => {
    const key = ROLE_LABEL_KEYS[role];
    return key ? t(`superAdminDashboard.${key}`) : role;
  };

  return (
    <>
      <Row>
        <Col sm={12}>
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
              <h4 className="mb-1">{t("superAdminDashboard.pageTitle")}</h4>
              <p className="text-muted mb-0">{t("superAdminDashboard.subtitle")}</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Button as={Link} to="/super-admin/audit" variant="outline-primary" size="sm" className="text-nowrap">
                <i className="ri-bar-chart-box-line me-1" aria-hidden />
                {t("superAdminDashboard.openAuditCenter")}
              </Button>
              <Button as={Link} to="/super-admin/audit-logs" variant="outline-secondary" size="sm" className="text-nowrap">
                <i className="ri-file-list-3-line me-1" aria-hidden />
                {t("superAdminDashboard.openAuditLogs")}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm border-start border-4 border-primary">
            <Card.Body>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                  <h5 className="mb-1">{t("superAdminDashboard.platformOverviewTitle")}</h5>
                  <p className="text-muted small mb-0">{t("superAdminDashboard.platformOverviewSubtitle")}</p>
                </div>
              </div>
              <Row className="g-3">
                <Col sm={6} xl={3}>
                  <div className="rounded-3 p-3 h-100" style={{ background: "rgba(0, 150, 136, 0.08)" }}>
                    <div className="text-muted small">{t("superAdminDashboard.signalOpenVitals")}</div>
                    <div className="fs-3 fw-bold text-primary">
                      {loading ? "…" : <CountUp end={platformSignals.openVitals} duration={1} />}
                    </div>
                  </div>
                </Col>
                <Col sm={6} xl={3}>
                  <div className="rounded-3 p-3 h-100" style={{ background: "rgba(13, 110, 253, 0.08)" }}>
                    <div className="text-muted small">{t("superAdminDashboard.signalPendingAppointments")}</div>
                    <div className="fs-3 fw-bold text-primary">
                      {loading ? "…" : <CountUp end={platformSignals.pendingApptCount} duration={1} />}
                    </div>
                  </div>
                </Col>
                <Col sm={6} xl={3}>
                  <div className="rounded-3 p-3 h-100" style={{ background: "rgba(220, 53, 69, 0.08)" }}>
                    <div className="text-muted small">{t("superAdminDashboard.signalSuspicious30d")}</div>
                    <div className="fs-3 fw-bold text-danger">
                      {loading ? "…" : <CountUp end={platformSignals.suspicious} duration={1} />}
                    </div>
                  </div>
                </Col>
                <Col sm={6} xl={3}>
                  <div className="rounded-3 p-3 h-100" style={{ background: "rgba(108, 117, 125, 0.1)" }}>
                    <div className="text-muted small">{t("superAdminDashboard.signalDepartmentsTracked")}</div>
                    <div className="fs-3 fw-bold text-secondary">
                      {loading ? "…" : <CountUp end={platformSignals.deptCount} duration={1} />}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={6} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
              <h6 className="mb-0">{t("superAdminDashboard.topDepartmentsTitle")}</h6>
              <Link to="/super-admin/departments" className="btn btn-sm btn-link text-decoration-none p-0">
                {t("superAdminDashboard.viewList")}
              </Link>
            </Card.Header>
            <Card.Body className="pt-2">
              {loading ? (
                <div className="text-center py-4 text-muted">{t("superAdminDashboard.loadingTable")}</div>
              ) : platformSignals.topDepts.length === 0 ? (
                <p className="text-muted small mb-0">{t("superAdminDashboard.dash")}</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t("superAdminDashboard.colDepartment")}</th>
                        <th className="text-end">{t("superAdminDashboard.colPatients")}</th>
                        <th className="text-end">{t("superAdminDashboard.colStaff")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {platformSignals.topDepts.map((d) => (
                        <tr key={d.name}>
                          <td>
                            <Link
                              to={`/super-admin/departments/${encodeURIComponent(d.name)}`}
                              className="text-decoration-none"
                            >
                              {d.name}
                            </Link>
                          </td>
                          <td className="text-end">{d.patientCount ?? 0}</td>
                          <td className="text-end">{(d.doctorCount ?? 0) + (d.nurseCount ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-white border-0 pt-3 pb-0">
              <h6 className="mb-0">{t("superAdminDashboard.recentVitalsTitle")}</h6>
            </Card.Header>
            <Card.Body className="pt-2">
              {loading ? (
                <div className="text-muted small py-2">{t("superAdminDashboard.loadingTable")}</div>
              ) : platformSignals.vitalsRecent.length === 0 ? (
                <p className="text-muted small mb-0">{t("superAdminDashboard.emptyVitalsRecent")}</p>
              ) : (
                <ul className="list-unstyled mb-0 small">
                  {platformSignals.vitalsRecent.map((v) => (
                    <li key={v.id} className="d-flex justify-content-between gap-2 py-2 border-bottom border-light">
                      <span className="text-truncate">{v.patientName}</span>
                      <span className="text-muted text-nowrap">
                        {t("superAdminDashboard.riskScoreShort", { score: v.riskScore ?? "—" })} · {formatTime(v.recordedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
              <h6 className="mb-0">{t("superAdminDashboard.recentAuditTitle")}</h6>
              <Link to="/super-admin/audit-logs" className="btn btn-sm btn-link text-decoration-none p-0">
                {t("superAdminDashboard.openAuditLogs")}
              </Link>
            </Card.Header>
            <Card.Body className="pt-2">
              {loading ? (
                <div className="text-muted small py-2">{t("superAdminDashboard.loadingTable")}</div>
              ) : platformSignals.auditNotable.length === 0 ? (
                <p className="text-muted small mb-0">{t("superAdminDashboard.emptyAuditNotable")}</p>
              ) : (
                <ul className="list-unstyled mb-0 small">
                  {platformSignals.auditNotable.map((row) => (
                    <li key={row.id} className="py-2 border-bottom border-light">
                      <div className="d-flex justify-content-between gap-2">
                        <span className="text-truncate">{row.actorEmail || t("superAdminDashboard.dash")}</span>
                        <span className="text-muted text-nowrap">{formatTime(row.createdAt)}</span>
                      </div>
                      <div className="text-muted text-truncate" title={row.action}>
                        {row.action?.length > 64 ? `${row.action.slice(0, 64)}…` : row.action}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {STAT_CARD_DEFS.map((stat, i) => (
          <Col key={i} xl={4} md={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">{t(`superAdminDashboard.${stat.titleKey}`)}</p>
                    <h3 className="mb-0 fw-bold">
                      {loading ? "..." : <CountUp end={stats[stat.statKey]} duration={1.5} />}
                    </h3>
                  </div>
                  <div className={`bg-${stat.color} bg-opacity-10 rounded-circle p-3`}>
                    <i className={`${stat.icon} text-${stat.color}`} style={{ fontSize: "1.8rem" }}></i>
                  </div>
                </div>
                <div className="mt-3">
                  <Link to={stat.link} className={`btn btn-sm btn-${stat.color}-subtle`}>
                    {t("superAdminDashboard.viewList")} <i className="ri-arrow-right-line ms-1"></i>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-2">
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t("superAdminDashboard.recentUsers")}</h5>
                <Link to="/super-admin/users" className="btn btn-sm btn-primary-subtle">{t("superAdminDashboard.seeAll")}</Link>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t("superAdminDashboard.loadingTable")}</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t("superAdminDashboard.colName")}</th>
                        <th>{t("superAdminDashboard.colEmail")}</th>
                        <th>{t("superAdminDashboard.colRole")}</th>
                        <th>{t("superAdminDashboard.colStatus")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((u) => (
                        <tr key={u.id}>
                          <td>{u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || t("superAdminDashboard.dash")}</td>
                          <td className="text-muted small">{u.email}</td>
                          <td>
                            <span className={`badge bg-${ROLE_COLORS[u.role] || "secondary"} bg-opacity-10 text-${ROLE_COLORS[u.role] || "secondary"}`}>
                              {roleLabel(u.role)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${u.isActive ? "bg-success" : "bg-danger"} bg-opacity-10 ${u.isActive ? "text-success" : "text-danger"}`}>
                              {u.isActive ? t("superAdminDashboard.statusActive") : t("superAdminDashboard.statusInactive")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0">{t("superAdminDashboard.quickActions")}</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-3">
              <Link to="/super-admin/admins" className="btn btn-outline-primary">
                <i className="ri-user-star-line me-2"></i>
                {t("superAdminDashboard.addHospitalAdmin")}
              </Link>
              <Link to="/super-admin/auditors/add" className="btn btn-outline-warning">
                <i className="ri-shield-user-line me-2"></i>{t("superAdminDashboard.addAuditor")}
              </Link>
              <Link to="/super-admin/care-coordinators/add" className="btn btn-outline-info">
                <i className="ri-heart-pulse-line me-2"></i>{t("superAdminDashboard.addCareCoordinator")}
              </Link>
              <Link to="/super-admin/users" className="btn btn-outline-primary">
                <i className="ri-team-line me-2"></i>{t("superAdminDashboard.manageUsers")}
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default SuperAdminDashboard;
