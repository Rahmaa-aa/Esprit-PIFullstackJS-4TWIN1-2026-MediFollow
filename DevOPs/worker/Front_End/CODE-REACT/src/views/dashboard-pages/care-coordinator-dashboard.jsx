import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card as BsCard, Badge, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Chart from "react-apexcharts";
import Card from "../../components/Card";
import { hospitalDepartmentLabel } from "../../constants/hospitalDepartments";
import { departmentApi } from "../../services/api";

function shortDayLabel(ymd) {
  if (!ymd || typeof ymd !== "string") return "";
  const p = ymd.slice(0, 10).split("-");
  if (p.length !== 3) return ymd;
  return `${p[2]}/${p[1]}`;
}

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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setStatsLoading(true);
    setStatsError(null);
    departmentApi
      .coordinatorDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((e) => {
        if (!cancelled) setStatsError(e?.message || "error");
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

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

  const chartConfigs = useMemo(() => {
    const ch = stats?.charts;
    if (!ch) return null;
    const isRtl = i18n.dir?.() === "rtl";

    const teamBar = {
      series: [{ name: t("careCoordinatorDashboard.chartTeamSeries"), data: ch.teamCounts || [0, 0, 0] }],
      options: {
        chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
        plotOptions: { bar: { borderRadius: 6, columnWidth: "55%" } },
        colors: ["#089bab"],
        dataLabels: { enabled: true },
        xaxis: {
          categories: [
            t("careCoordinatorDashboard.chartCatPatients"),
            t("careCoordinatorDashboard.chartCatDoctors"),
            t("careCoordinatorDashboard.chartCatNurses"),
          ],
          labels: { rotate: isRtl ? 0 : -12 },
        },
        yaxis: { labels: { formatter: (val) => Math.floor(val) } },
        grid: { strokeDashArray: 4 },
        tooltip: { y: { formatter: (val) => String(val) } },
      },
    };

    const buckets = ch.followUpBuckets || [0, 0, 0, 0];
    const followDonut = {
      series: buckets,
      options: {
        chart: { type: "donut", fontFamily: "inherit" },
        labels: [
          t("careCoordinatorDashboard.chartBucket0"),
          t("careCoordinatorDashboard.chartBucket1"),
          t("careCoordinatorDashboard.chartBucket2"),
          t("careCoordinatorDashboard.chartBucket3"),
        ],
        colors: ["#dc3545", "#fd7e14", "#ffc107", "#198754"],
        legend: { position: "bottom" },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  label: t("careCoordinatorDashboard.chartPatientsTotal"),
                  formatter: (w) => {
                    const arr = w.globals?.seriesTotals ?? w.globals?.series;
                    const n = Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0;
                    return String(n);
                  },
                },
              },
            },
          },
        },
        dataLabels: { enabled: true },
      },
    };

    const dates = ch.appointmentsByDay?.dates || [];
    const counts = ch.appointmentsByDay?.counts || [];
    const appColumn = {
      series: [{ name: t("careCoordinatorDashboard.chartAppointmentsSeries"), data: counts }],
      options: {
        chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit", zoom: { enabled: false } },
        stroke: { curve: "smooth", width: 2 },
        fill: {
          type: "gradient",
          gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.08, stops: [0, 90, 100] },
        },
        colors: ["#198754"],
        dataLabels: { enabled: false },
        xaxis: {
          categories: dates.map((d) => shortDayLabel(d)),
        },
        yaxis: { min: 0, labels: { formatter: (val) => Math.floor(val) } },
        grid: { strokeDashArray: 4 },
        tooltip: { y: { formatter: (val) => String(val) } },
      },
    };

    return { teamBar, followDonut, appColumn };
  }, [stats, t, i18n]);

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
          <h5 className="mb-3">{t("careCoordinatorDashboard.statsTitle")}</h5>
        </Col>
        {statsLoading && (
          <Col sm={12} className="mb-3 d-flex align-items-center gap-2 text-muted">
            <Spinner animation="border" size="sm" />
            <span>{t("careCoordinatorDashboard.statsLoading")}</span>
          </Col>
        )}
        {statsError && !statsLoading && (
          <Col sm={12} className="mb-3">
            <BsCard className="border-0 bg-danger-subtle">
              <BsCard.Body className="small py-2">{t("careCoordinatorDashboard.statsError")}</BsCard.Body>
            </BsCard>
          </Col>
        )}
        {stats && !statsLoading && (
          <>
            <Col md={6} xl={4} className="mb-3">
              <BsCard className="border-0 shadow-sm h-100" style={{ borderInlineStart: "4px solid #0d6efd" }}>
                <BsCard.Body>
                  <div className="text-muted small mb-1">{t("careCoordinatorDashboard.statPatients")}</div>
                  <div className="fs-3 fw-semibold">{stats.patientCount ?? "—"}</div>
                </BsCard.Body>
              </BsCard>
            </Col>
            <Col md={6} xl={4} className="mb-3">
              <BsCard className="border-0 shadow-sm h-100" style={{ borderInlineStart: "4px solid #6f42c1" }}>
                <BsCard.Body>
                  <div className="text-muted small mb-1">{t("careCoordinatorDashboard.statDoctors")}</div>
                  <div className="fs-3 fw-semibold">{stats.doctorCount ?? "—"}</div>
                </BsCard.Body>
              </BsCard>
            </Col>
            <Col md={6} xl={4} className="mb-3">
              <BsCard className="border-0 shadow-sm h-100" style={{ borderInlineStart: "4px solid #fd7e14" }}>
                <BsCard.Body>
                  <div className="text-muted small mb-1">{t("careCoordinatorDashboard.statNurses")}</div>
                  <div className="fs-3 fw-semibold">{stats.nurseCount ?? "—"}</div>
                </BsCard.Body>
              </BsCard>
            </Col>
            <Col md={6} xl={4} className="mb-3">
              <BsCard className="border-0 shadow-sm h-100" style={{ borderInlineStart: "4px solid #198754" }}>
                <BsCard.Body>
                  <div className="text-muted small mb-1">{t("careCoordinatorDashboard.statAppointments7d")}</div>
                  <div className="fs-3 fw-semibold">{stats.appointmentsNext7Days ?? "—"}</div>
                  <div className="small text-muted mt-1">{t("careCoordinatorDashboard.statAppointments7dHint")}</div>
                </BsCard.Body>
              </BsCard>
            </Col>
            <Col md={6} xl={4} className="mb-3">
              <BsCard className="border-0 shadow-sm h-100" style={{ borderInlineStart: "4px solid #dc3545" }}>
                <BsCard.Body>
                  <div className="text-muted small mb-1">{t("careCoordinatorDashboard.statFollowUpAlert")}</div>
                  <div className="fs-3 fw-semibold">{stats.patientsNeedingAttention ?? "—"}</div>
                  <div className="small text-muted mt-1">
                    {t("careCoordinatorDashboard.statFollowUpHint", { days: stats.followUpWindowDays ?? 7 })}
                  </div>
                </BsCard.Body>
              </BsCard>
            </Col>
          </>
        )}
      </Row>

      {stats && !statsLoading && chartConfigs && (
        <Row className="mt-4">
          <Col sm={12} className="mb-2">
            <h5 className="mb-0">{t("careCoordinatorDashboard.chartSectionTitle")}</h5>
            <p className="text-muted small mb-3">{t("careCoordinatorDashboard.chartSectionSubtitle")}</p>
          </Col>
          <Col lg={4} className="mb-3">
            <BsCard className="border-0 shadow-sm h-100">
              <BsCard.Body>
                <h6 className="mb-3">{t("careCoordinatorDashboard.chartTeamTitle")}</h6>
                <Chart options={chartConfigs.teamBar.options} series={chartConfigs.teamBar.series} type="bar" height={280} />
              </BsCard.Body>
            </BsCard>
          </Col>
          <Col lg={4} className="mb-3">
            <BsCard className="border-0 shadow-sm h-100">
              <BsCard.Body>
                <h6 className="mb-3">{t("careCoordinatorDashboard.chartFollowUpTitle")}</h6>
                <Chart options={chartConfigs.followDonut.options} series={chartConfigs.followDonut.series} type="donut" height={300} />
              </BsCard.Body>
            </BsCard>
          </Col>
          <Col lg={4} className="mb-3">
            <BsCard className="border-0 shadow-sm h-100">
              <BsCard.Body>
                <h6 className="mb-3">{t("careCoordinatorDashboard.chartAppointmentsTitle")}</h6>
                <Chart options={chartConfigs.appColumn.options} series={chartConfigs.appColumn.series} type="area" height={280} />
              </BsCard.Body>
            </BsCard>
          </Col>
        </Row>
      )}

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
