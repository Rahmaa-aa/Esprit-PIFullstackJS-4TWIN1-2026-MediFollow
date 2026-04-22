import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Row, Col, Card, Table, Badge, ProgressBar, Alert, Button, Spinner } from "react-bootstrap";
import CountUp from "react-countup";
import Chart from "react-apexcharts";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { notificationApi, departmentApi } from "../../services/api";

function formatAgo(iso, t) {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 0) return "—";
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (m < 1) return t("adminDashboard.justNow");
  if (m < 60) return t("adminDashboard.minutesAgo", { count: m });
  if (h < 48) return t("adminDashboard.hoursAgo", { count: h });
  return t("adminDashboard.daysAgo", { count: Math.max(1, d) });
}

function statusVariant(st) {
  const s = String(st || "").toLowerCase();
  if (s === "pending") return "warning";
  if (s === "confirmed" || s === "scheduled") return "success";
  if (s === "cancelled") return "danger";
  if (s === "completed") return "info";
  return "secondary";
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [notifUnread, setNotifUnread] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  const loadStats = useCallback(async () => {
    setStatsError("");
    setLoadingStats(true);
    try {
      const data = await departmentApi.adminDashboardStats();
      setStats(data && typeof data === "object" ? data : null);
    } catch (e) {
      setStats(null);
      setStatsError(e?.message || t("adminDashboard.loadError"));
    } finally {
      setLoadingStats(false);
    }
  }, [t]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const loadNotifCount = useCallback(async () => {
    try {
      const res = await notificationApi.getMine();
      setNotifUnread(typeof res.unread === "number" ? res.unread : 0);
    } catch {
      setNotifUnread(null);
    }
  }, []);

  useEffect(() => {
    loadNotifCount();
    const id = setInterval(loadNotifCount, 60_000);
    const onRefresh = () => loadNotifCount();
    window.addEventListener("medifollow-notifications-refresh", onRefresh);
    return () => {
      clearInterval(id);
      window.removeEventListener("medifollow-notifications-refresh", onRefresh);
    };
  }, [loadNotifCount]);

  const statCards = useMemo(() => {
    if (!stats?.counts) return [];
    const c = stats.counts;
    return [
      {
        title: t("adminDashboard.statDoctors"),
        hint: t("adminDashboard.statDoctorsHint"),
        value: c.doctors,
        icon: "ri-user-3-fill",
        color: "primary",
        link: "/doctor/doctor-list",
      },
      {
        title: t("adminDashboard.statUpcoming"),
        hint: t("adminDashboard.statUpcomingHint"),
        value: c.appointmentsUpcoming,
        icon: "ri-calendar-check-fill",
        color: "success",
        link: "/calendar",
      },
      {
        title: t("adminDashboard.statPatients"),
        hint: t("adminDashboard.statPatientsHint"),
        value: c.patients,
        icon: "ri-team-fill",
        color: "info",
        link: "/patient/patient-list",
      },
      {
        title: t("adminDashboard.statPending"),
        hint: t("adminDashboard.statPendingHint"),
        value: c.appointmentsPending,
        icon: "ri-time-fill",
        color: "warning",
        link: "/admin/appointment-requests",
      },
    ];
  }, [stats, t]);

  const chartState = useMemo(() => {
    if (!stats?.chart?.series?.length) return { options: null, series: [] };
    const options = {
      chart: { height: 280, type: "area", toolbar: { show: false } },
      colors: ["#089bab", "#FC9F5B"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      xaxis: { categories: stats.chart.categories || [] },
      legend: { position: "top" },
    };
    const series = stats.chart.series.map((s) => ({
      name: t(`adminDashboard.chartSeries_${s.nameKey}`),
      data: s.data || [],
    }));
    return { options, series };
  }, [stats, t]);

  const occupationRows = useMemo(() => {
    if (!stats?.occupation?.length) return [];
    const keys = ["pendingShare", "patientCoverage", "nursingStaffShare"];
    return stats.occupation.map((row, i) => ({
      ...row,
      label: t(`adminDashboard.occ_${keys[i]}`),
    }));
  }, [stats, t]);

  const recentRows = stats?.recentActivity || [];

  return (
    <>
      <Row>
        <Col sm={12}>
          <Card className="border-primary border-2 shadow-sm mb-4">
            <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-start gap-3">
                <div className="rounded-circle bg-primary-subtle p-3 d-none d-sm-flex">
                  <i className="ri-shield-check-line ri-2x text-primary" aria-hidden />
                </div>
                <div>
                  <h5 className="mb-1">{t("adminWorkspace.alertsSupervisionTitle")}</h5>
                  <p className="text-muted mb-0 small">{t("adminWorkspace.alertsSupervisionDesc")}</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {notifUnread !== null && notifUnread > 0 && (
                  <Badge bg="danger" pill>
                    {t("adminWorkspace.notificationsUnreadBadge", { count: notifUnread })}
                  </Badge>
                )}
                <Link to="/notifications" className="btn btn-primary">
                  <i className="ri-notification-3-line me-1" aria-hidden />
                  {t("adminWorkspace.alertsSupervisionCta")}
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col sm={12}>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h4 className="mb-1">{t("adminDashboard.pageTitle")}</h4>
              <p className="text-muted mb-0">{t("adminDashboard.pageLead")}</p>
            </div>
            <Button variant="outline-secondary" size="sm" onClick={loadStats} disabled={loadingStats}>
              {loadingStats ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t("adminDashboard.loading")}
                </>
              ) : (
                <>
                  <i className="ri-refresh-line me-1" aria-hidden />
                  {t("adminDashboard.refresh")}
                </>
              )}
            </Button>
          </div>
        </Col>
      </Row>

      {statsError && (
        <Alert variant="danger" className="mb-4">
          {statsError}
        </Alert>
      )}

      {loadingStats && !stats && !statsError && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2 mb-0">{t("adminDashboard.loading")}</p>
        </div>
      )}

      {!loadingStats && !stats && statsError && (
        <Alert variant="warning">{t("adminDashboard.loadError")}</Alert>
      )}

      {statCards.length > 0 && (
        <Row>
          {statCards.map((stat, i) => (
            <Col key={i} xl={3} md={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">{stat.title}</p>
                      <p className="text-muted small mb-2" style={{ fontSize: "0.75rem" }}>
                        {stat.hint}
                      </p>
                      <h3 className="mb-0">
                        {typeof stat.value === "number" ? <CountUp end={stat.value} duration={1.2} /> : stat.value}
                      </h3>
                    </div>
                    <div className={`rounded-circle p-3 bg-${stat.color}-subtle`}>
                      <i className={`ri-2x text-${stat.color} ${stat.icon}`} />
                    </div>
                  </div>
                  {stat.link && (
                    <Link to={stat.link} className="btn btn-sm btn-link p-0 mt-2 text-decoration-none">
                      {t("adminDashboard.seeDetails")} <i className="ri-arrow-right-line" />
                    </Link>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {stats && (
        <Row>
          <Col lg={8} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">{t("adminDashboard.chartTitle")}</h5>
              </Card.Header>
              <Card.Body>
                {chartState.series.length > 0 && chartState.options ? (
                  <Chart options={chartState.options} series={chartState.series} type="area" height={280} />
                ) : (
                  <p className="text-muted small mb-0">{t("adminDashboard.chartEmpty")}</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">{t("adminDashboard.recentTitle")}</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {recentRows.length === 0 ? (
                  <p className="text-muted small px-3 py-3 mb-0">{t("adminDashboard.recentEmpty")}</p>
                ) : (
                  <Table responsive className="mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>{t("adminDashboard.recentPatient")}</th>
                        <th>{t("adminDashboard.recentTitleCol")}</th>
                        <th className="text-end">{t("adminDashboard.recentStatus")}</th>
                        <th className="text-end">{t("adminDashboard.recentTime")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRows.map((act) => (
                        <tr key={act.id}>
                          <td className="small">
                            <strong className="d-block">{act.patientLabel}</strong>
                          </td>
                          <td className="small text-muted">{act.title}</td>
                          <td className="text-end">
                            <Badge bg={statusVariant(act.status)}>
                              {t(`adminDashboard.status_${String(act.status || "").toLowerCase()}`, {
                                defaultValue: act.status || "—",
                              })}
                            </Badge>
                          </td>
                          <td className="text-end small text-muted text-nowrap">
                            {formatAgo(act.createdAt, t)}
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
      )}

      {stats && occupationRows.length > 0 && (
        <Row>
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">{t("adminDashboard.occupationTitle")}</h5>
              </Card.Header>
              <Card.Body>
                {occupationRows.map((row) => (
                  <div key={row.key} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small">{row.label}</span>
                      <span>{row.percent}%</span>
                    </div>
                    <ProgressBar
                      variant={row.key === "pendingShare" ? "warning" : row.key === "patientCoverage" ? "primary" : "success"}
                      now={Math.min(100, Math.max(0, row.percent))}
                      className="mb-0"
                      style={{ height: "8px" }}
                    />
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">{t("adminDashboard.quickTitle")}</h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-2">
                  <Col xs={6}>
                    <Link to="/doctor/doctor-list" className="btn btn-outline-primary w-100 py-3">
                      <i className="ri-user-add-fill d-block mb-1" />
                      {t("adminDashboard.quickDoctors")}
                    </Link>
                  </Col>
                  <Col xs={6}>
                    <Link to="/nurse/nurse-list" className="btn btn-outline-primary w-100 py-3">
                      <i className="ri-nurse-fill d-block mb-1" />
                      {t("adminDashboard.quickNurses")}
                    </Link>
                  </Col>
                  <Col xs={6}>
                    <Link to="/patient/patient-list" className="btn btn-outline-info w-100 py-3">
                      <i className="ri-team-fill d-block mb-1" />
                      {t("adminDashboard.quickPatients")}
                    </Link>
                  </Col>
                  <Col xs={6}>
                    <Link to="/admin/appointment-requests" className="btn btn-outline-warning w-100 py-3">
                      <i className="ri-calendar-event-fill d-block mb-1" />
                      {t("adminDashboard.quickAppointments")}
                    </Link>
                  </Col>
                  <Col xs={6}>
                    <Link to="/extra-pages/account-setting" className="btn btn-outline-secondary w-100 py-3">
                      <i className="ri-settings-3-fill d-block mb-1" />
                      {t("adminDashboard.quickSettings")}
                    </Link>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default AdminDashboard;
