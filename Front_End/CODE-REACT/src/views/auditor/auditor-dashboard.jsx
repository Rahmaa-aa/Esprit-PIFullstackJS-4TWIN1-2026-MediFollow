import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Table, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { auditorApi } from "../../services/api";
import "./auditor-dashboard.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CATEGORY_COLORS = {
  auth: "#635bff",
  data: "#00d4aa",
  communication: "#ffb020",
  mail: "#0070f3",
  admin: "#ff5c5c",
  system: "#8898aa",
  other: "#cbd5e1",
};

function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
}

function labelRole(t, role) {
  if (!role) return t("auditorLogs.noValue");
  return t(`auditorLogs.roleLabels.${role}`, { defaultValue: role });
}

function labelCategory(t, cat) {
  if (!cat) return t("auditorLogs.noValue");
  return t(`auditorDashboard.categoryLabels.${cat}`, { defaultValue: cat });
}

const AuditorDashboard = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const dateLocale = useMemo(() => {
    const l = (i18n.language || "en").split("-")[0];
    if (l === "fr") return "fr-FR";
    if (l === "ar") return "ar-SA";
    return "en-US";
  }, [i18n.language]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await auditorApi.getDashboard();
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e.message || t("auditorDashboard.errorGeneric"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const lineChartData = useMemo(() => {
    const series = data?.charts?.activityOverTime || [];
    return {
      labels: series.map((p) => p.date),
      datasets: [
        {
          label: t("auditorDashboard.chartActivityLabel"),
          data: series.map((p) => p.count),
          borderColor: "#635bff",
          backgroundColor: "rgba(99, 91, 255, 0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
        },
      ],
    };
  }, [data, t]);

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0a2540",
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#425466", font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(15, 23, 42, 0.06)" },
          ticks: { color: "#425466", font: { size: 11 } },
        },
      },
    }),
    []
  );

  const doughnutData = useMemo(() => {
    const dist = data?.charts?.actionsDistribution || [];
    return {
      labels: dist.map((d) => labelCategory(t, d.category)),
      datasets: [
        {
          data: dist.map((d) => d.count),
          backgroundColor: dist.map((d) => categoryColor(d.category)),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  }, [data, t]);

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: {
          position: i18n.dir() === "rtl" ? "left" : "right",
          labels: {
            boxWidth: 12,
            padding: 14,
            color: "#425466",
            font: { size: 12 },
          },
        },
        tooltip: {
          backgroundColor: "#0a2540",
          padding: 10,
          cornerRadius: 8,
        },
      },
    }),
    [i18n]
  );

  const kpis = data?.kpis || {};
  const recent = data?.recentLogs || [];

  const formatTime = (iso) => {
    if (!iso) return t("auditorLogs.noValue");
    try {
      return new Date(iso).toLocaleString(dateLocale, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return t("auditorLogs.noValue");
    }
  };

  const severityBadge = (sev, suspicious) => {
    if (suspicious) {
      return (
        <span className="auditor-badge auditor-badge--suspicious">{t("auditorDashboard.suspicious")}</span>
      );
    }
    if (sev === "critical") {
      return (
        <span className="auditor-badge auditor-badge--crit">{t("auditorDashboard.severityCritical")}</span>
      );
    }
    if (sev === "warning") {
      return (
        <span className="auditor-badge auditor-badge--warn">{t("auditorDashboard.severityWarning")}</span>
      );
    }
    return <span className="auditor-badge auditor-badge--ok">{t("auditorDashboard.severityInfo")}</span>;
  };

  if (loading) {
    return (
      <div className="auditor-dash d-flex flex-column justify-content-center align-items-center gap-3 py-5">
        <Spinner animation="border" className="text-primary" role="status" />
        <span className="text-muted">{t("auditorDashboard.loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auditor-dash">
        <p className="text-danger mb-0">{error}</p>
      </div>
    );
  }

  return (
    <div className="auditor-dash">
      <header className="auditor-dash__header d-flex flex-wrap align-items-start justify-content-between gap-3">
        <div>
          <h1 className="auditor-dash__title">{t("auditorDashboard.pageTitle")}</h1>
          <p className="auditor-dash__subtitle mb-0">{t("auditorDashboard.subtitle")}</p>
        </div>
        <Link to="/auditor/logs" className="btn btn-sm btn-outline-primary">
          {t("auditorDashboard.linkToLogs")}
        </Link>
      </header>

      <Row className="g-3 mb-4">
        <Col md={6} xl={3}>
          <div className="auditor-kpi d-flex justify-content-between align-items-start">
            <div>
              <div className="auditor-kpi__label">{t("auditorDashboard.kpiLogsToday")}</div>
              <div className="auditor-kpi__value">{kpis.logsToday ?? 0}</div>
            </div>
            <div className="auditor-kpi__icon" style={{ background: "rgba(99, 91, 255, 0.12)", color: "#635bff" }}>
              <i className="ri-file-list-3-line" />
            </div>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div className="auditor-kpi d-flex justify-content-between align-items-start">
            <div>
              <div className="auditor-kpi__label">{t("auditorDashboard.kpiActiveUsers")}</div>
              <div className="auditor-kpi__value">{kpis.activeUsers ?? 0}</div>
            </div>
            <div className="auditor-kpi__icon" style={{ background: "rgba(0, 212, 170, 0.12)", color: "#00a884" }}>
              <i className="ri-user-voice-line" />
            </div>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div className="auditor-kpi d-flex justify-content-between align-items-start">
            <div>
              <div className="auditor-kpi__label">{t("auditorDashboard.kpiTotalActions")}</div>
              <div className="auditor-kpi__value">{kpis.totalActions ?? 0}</div>
            </div>
            <div className="auditor-kpi__icon" style={{ background: "rgba(0, 112, 243, 0.1)", color: "#0070f3" }}>
              <i className="ri-pulse-line" />
            </div>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div className="auditor-kpi d-flex justify-content-between align-items-start">
            <div>
              <div className="auditor-kpi__label">{t("auditorDashboard.kpiSuspicious")}</div>
              <div className="auditor-kpi__value">{kpis.suspiciousActions ?? 0}</div>
            </div>
            <div className="auditor-kpi__icon" style={{ background: "rgba(255, 92, 92, 0.12)", color: "#e53935" }}>
              <i className="ri-shield-flash-line" />
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={7}>
          <div className="auditor-chart-card">
            <h2 className="auditor-chart-card__title">{t("auditorDashboard.chartActivityTitle")}</h2>
            <div style={{ height: 280 }}>
              {lineChartData.labels?.length ? (
                <Line data={lineChartData} options={lineOptions} />
              ) : (
                <div className="auditor-empty">{t("auditorDashboard.noChartData")}</div>
              )}
            </div>
          </div>
        </Col>
        <Col lg={5}>
          <div className="auditor-chart-card">
            <h2 className="auditor-chart-card__title">{t("auditorDashboard.chartDistributionTitle")}</h2>
            <div style={{ height: 280 }}>
              {doughnutData.labels?.length ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="auditor-empty">{t("auditorDashboard.noChartData")}</div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <div className="auditor-table-card">
        <div className="auditor-table-card__head">
          <h2 className="auditor-table-card__title">{t("auditorDashboard.recentLogsTitle")}</h2>
        </div>
        <Table responsive hover className="auditor-table mb-0">
          <thead>
            <tr>
              <th>{t("auditorDashboard.colTime")}</th>
              <th>{t("auditorDashboard.colUser")}</th>
              <th>{t("auditorDashboard.colRole")}</th>
              <th>{t("auditorDashboard.colAction")}</th>
              <th>{t("auditorDashboard.colCategory")}</th>
              <th>{t("auditorDashboard.colStatus")}</th>
              <th>{t("auditorDashboard.colSeverity")}</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={7} className="auditor-empty">
                  {t("auditorDashboard.noLogs")}
                </td>
              </tr>
            )}
            {recent.map((row) => (
              <tr key={row.id}>
                <td className="text-nowrap">{formatTime(row.createdAt)}</td>
                <td>{row.actorEmail || t("auditorLogs.noValue")}</td>
                <td>{labelRole(t, row.actorRole)}</td>
                <td>
                  <span title={row.action}>
                    {row.action?.length > 48 ? `${row.action.slice(0, 48)}…` : row.action || t("auditorLogs.noValue")}
                  </span>
                </td>
                <td>{labelCategory(t, row.category)}</td>
                <td>{row.statusCode ?? t("auditorLogs.noValue")}</td>
                <td>{severityBadge(row.severity, row.suspicious)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AuditorDashboard;
