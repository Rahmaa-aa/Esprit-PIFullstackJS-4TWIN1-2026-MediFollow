import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Table, Badge, Alert, Spinner } from "react-bootstrap";
import CountUp from "react-countup";
import Chart from "react-apexcharts";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { appointmentApi, departmentApi, questionnaireApi } from "../../services/api";

/** Maps API `type` slugs — align with admin-appointment-requests.jsx */
const APPOINTMENT_TYPE_I18N_KEYS = {
  checkup: "patientAppointmentRequest.typeCheckup",
  lab: "patientAppointmentRequest.typeLab",
  specialist: "patientAppointmentRequest.typeSpecialist",
  imaging: "patientAppointmentRequest.typeImaging",
  physiotherapy: "patientAppointmentRequest.typePhysiotherapy",
};

function appointmentTypeLabel(type, t) {
  if (type == null || type === "") return "—";
  const key = APPOINTMENT_TYPE_I18N_KEYS[String(type).toLowerCase()];
  return key ? t(key) : String(type);
}

function userId(u) {
  if (!u) return "";
  return String(u.id ?? u._id ?? "");
}

function patientLabel(row) {
  const p = row.patientId;
  if (p && typeof p === "object") {
    return `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.email || "—";
  }
  return "—";
}

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [adminUser] = useState(() => {
    try {
      const s = localStorage.getItem("adminUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const isAdminSession = adminUser && ["admin", "superadmin"].includes(adminUser.role);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [pending, setPending] = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [protocols, setProtocols] = useState([]);

  const dateLocale = useMemo(() => {
    const l = (i18n.language || "en").split("-")[0];
    if (l === "fr") return "fr-FR";
    if (l === "ar") return "ar-SA";
    return "en-US";
  }, [i18n.language]);

  const formatShort = useCallback(
    (iso) => {
      if (!iso) return "—";
      try {
        return new Date(iso).toLocaleString(dateLocale, { dateStyle: "short", timeStyle: "short" });
      } catch {
        return "—";
      }
    },
    [dateLocale],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sum, pend, conf, tpl, pro] = await Promise.all([
        departmentApi.summary().catch(() => []),
        appointmentApi.getPendingForAdmin().catch(() => []),
        appointmentApi.getConfirmedForAdmin().catch(() => []),
        questionnaireApi.adminListTemplates().catch(() => []),
        questionnaireApi.adminListProtocols().catch(() => []),
      ]);
      setSummaries(Array.isArray(sum) ? sum : []);
      setPending(Array.isArray(pend) ? pend : []);
      setConfirmed(Array.isArray(conf) ? conf : []);
      setTemplates(Array.isArray(tpl) ? tpl : []);
      setProtocols(Array.isArray(pro) ? pro : []);
    } catch (e) {
      setError(e.message || t("hospitalAdminDashboard.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!adminUser) {
      navigate("/auth/sign-in", { replace: true });
      return;
    }
    if (!isAdminSession) {
      navigate("/dashboard", { replace: true });
      return;
    }
    load();
  }, [adminUser, isAdminSession, navigate, load]);

  const scopedSummaries = useMemo(() => {
    const all = summaries;
    if (adminUser?.role === "superadmin") return all;
    if (adminUser?.role !== "admin") return all;
    const uid = userId(adminUser);
    const deptName = String(adminUser.department || "").trim();
    const byAssign = all.filter((s) => s.assignedAdminId && String(s.assignedAdminId) === uid);
    if (byAssign.length) return byAssign;
    if (deptName) {
      const byName = all.filter((s) => s.name === deptName);
      if (byName.length) return byName;
    }
    return all;
  }, [summaries, adminUser]);

  const aggregates = useMemo(() => {
    let patients = 0;
    let doctors = 0;
    let nurses = 0;
    scopedSummaries.forEach((s) => {
      patients += s.patientCount || 0;
      doctors += s.doctorCount || 0;
      nurses += s.nurseCount || 0;
    });
    const staff = doctors + nurses;
    return { patients, doctors, nurses, staff, departments: scopedSummaries.length };
  }, [scopedSummaries]);

  const questionnaireCount = templates.length + protocols.length;

  const barOptions = useMemo(() => {
    return {
      chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
      plotOptions: { bar: { horizontal: false, columnWidth: "42%", borderRadius: 4 } },
      dataLabels: { enabled: false },
      colors: ["#089bab", "#6c757d"],
      xaxis: {
        categories: [t("hospitalAdminDashboard.chartPatients"), t("hospitalAdminDashboard.chartStaff")],
      },
      legend: { show: false },
      yaxis: { labels: { formatter: (v) => Math.round(v) } },
    };
  }, [t]);

  const barSeries = useMemo(
    () => [{ name: t("hospitalAdminDashboard.chartSeries"), data: [aggregates.patients, aggregates.staff] }],
    [aggregates.patients, aggregates.staff, t],
  );

  const recentPending = useMemo(() => pending.slice(0, 6), [pending]);
  const upcomingConfirmed = useMemo(() => confirmed.slice(0, 6), [confirmed]);

  if (!adminUser || !isAdminSession) return null;

  return (
    <>
      {adminUser.role === "superadmin" && (
        <Alert variant="info" className="d-flex flex-wrap align-items-center justify-content-between gap-2 border-0 shadow-sm">
          <span className="mb-0">{t("hospitalAdminDashboard.superAdminHint")}</span>
          <Link to="/super-admin/dashboard" className="btn btn-sm btn-primary">
            {t("hospitalAdminDashboard.openSuperDashboard")}
          </Link>
        </Alert>
      )}

      <Row>
        <Col sm={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1">{t("hospitalAdminDashboard.pageTitle")}</h4>
              <p className="text-muted mb-0">{t("hospitalAdminDashboard.subtitle")}</p>
              {!loading && adminUser.role === "admin" && (
                <p className="text-muted small mb-0 mt-1">
                  {scopedSummaries.length < summaries.length
                    ? t("hospitalAdminDashboard.scopeFiltered", { count: scopedSummaries.length })
                    : t("hospitalAdminDashboard.scopeOverview")}
                </p>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="border-0 shadow-sm">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" role="status" aria-label={t("hospitalAdminDashboard.loading")} />
        </div>
      ) : (
        <>
          <Row>
            {[
              {
                title: t("hospitalAdminDashboard.statPatients"),
                value: aggregates.patients,
                icon: "ri-team-fill",
                color: "info",
                link: "/admin/departments",
              },
              {
                title: t("hospitalAdminDashboard.statStaff"),
                value: aggregates.staff,
                icon: "ri-user-settings-fill",
                color: "primary",
                link: "/admin/departments",
              },
              {
                title: t("hospitalAdminDashboard.statPending"),
                value: pending.length,
                icon: "ri-calendar-todo-fill",
                color: "warning",
                link: "/admin/appointment-requests",
              },
              {
                title: t("hospitalAdminDashboard.statQuestionnaires"),
                value: questionnaireCount,
                icon: "ri-file-list-3-fill",
                color: "success",
                link: "/admin/questionnaire-bank",
              },
            ].map((stat, i) => (
              <Col key={i} xl={3} md={6} className="mb-4">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted mb-1 small">{stat.title}</p>
                        <h3 className="mb-0">
                          <CountUp end={typeof stat.value === "number" ? stat.value : 0} duration={1.2} />
                        </h3>
                      </div>
                      <div className={`rounded-circle p-3 bg-${stat.color}-subtle`}>
                        <i className={`ri-2x text-${stat.color} ${stat.icon}`}></i>
                      </div>
                    </div>
                    {stat.link && (
                      <Link to={stat.link} className="btn btn-sm btn-link p-0 mt-2 text-decoration-none">
                        {t("hospitalAdminDashboard.viewDetails")} <i className="ri-arrow-right-line"></i>
                      </Link>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row>
            <Col lg={8} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0">
                  <h5 className="mb-0">{t("hospitalAdminDashboard.distributionTitle")}</h5>
                  <p className="text-muted small mb-0">{t("hospitalAdminDashboard.distributionSubtitle")}</p>
                </Card.Header>
                <Card.Body>
                  <Chart options={barOptions} series={barSeries} type="bar" height={280} />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{t("hospitalAdminDashboard.recentPendingTitle")}</h5>
                  <Link to="/admin/appointment-requests" className="btn btn-sm btn-outline-primary">
                    {t("hospitalAdminDashboard.viewAll")}
                  </Link>
                </Card.Header>
                <Card.Body className="p-0">
                  {recentPending.length === 0 ? (
                    <p className="text-muted small px-3 py-4 mb-0">{t("hospitalAdminDashboard.emptyRecentPending")}</p>
                  ) : (
                    <Table responsive className="mb-0">
                      <tbody>
                        {recentPending.map((row) => (
                          <tr key={row._id}>
                            <td className="border-0 py-3">
                              <div>
                                <strong>{patientLabel(row)}</strong>
                                <p className="mb-0 small text-muted">{row.title || "—"}</p>
                              </div>
                            </td>
                            <td className="border-0 py-3 text-end">
                              <Badge bg="secondary" className="me-1">
                                {appointmentTypeLabel(row.type, t)}
                              </Badge>
                              <div className="small text-muted mt-1">{formatShort(row.createdAt)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{t("hospitalAdminDashboard.upcomingTitle")}</h5>
                  <Link to="/admin/appointment-requests" className="btn btn-sm btn-outline-primary">
                    {t("hospitalAdminDashboard.manageAppointments")}
                  </Link>
                </Card.Header>
                <Card.Body className="p-0">
                  {upcomingConfirmed.length === 0 ? (
                    <p className="text-muted small px-3 py-4 mb-0">{t("hospitalAdminDashboard.emptyUpcoming")}</p>
                  ) : (
                    <Table responsive className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>{t("hospitalAdminDashboard.thPatient")}</th>
                          <th className="text-end">{t("hospitalAdminDashboard.thDateTime")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingConfirmed.map((row) => (
                          <tr key={row._id}>
                            <td className="py-3">
                              <span className="fw-semibold">{patientLabel(row)}</span>
                              <div className="small text-muted">{row.title || "—"}</div>
                            </td>
                            <td className="py-3 text-end small">
                              {row.date || "—"}
                              {row.time && ` · ${row.time}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0">
                  <h5 className="mb-0">{t("hospitalAdminDashboard.quickLinksTitle")}</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-2">
                    <Col xs={6}>
                      <Link to="/admin/departments" className="btn btn-outline-primary w-100 py-3">
                        <i className="ri-building-2-fill d-block mb-1"></i>
                        {t("hospitalAdminDashboard.linkDepartments")}
                      </Link>
                    </Col>
                    <Col xs={6}>
                      <Link to="/admin/appointment-requests" className="btn btn-outline-success w-100 py-3">
                        <i className="ri-calendar-check-fill d-block mb-1"></i>
                        {t("hospitalAdminDashboard.linkAppointments")}
                      </Link>
                    </Col>
                    <Col xs={6}>
                      <Link to="/admin/questionnaire-bank" className="btn btn-outline-info w-100 py-3">
                        <i className="ri-file-list-3-fill d-block mb-1"></i>
                        {t("hospitalAdminDashboard.linkQuestionnaires")}
                      </Link>
                    </Col>
                    <Col xs={6}>
                      <Link to="/admin/profile" className="btn btn-outline-secondary w-100 py-3">
                        <i className="ri-user-settings-fill d-block mb-1"></i>
                        {t("hospitalAdminDashboard.linkProfile")}
                      </Link>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default AdminDashboard;
