import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Form, Button, Table, Spinner, Modal, Pagination, Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { auditorApi } from "../../services/api";
import AuditorA11yLayout from "../../components/auditor/auditor-a11y-layout";
import AuditorA11yToolbar from "../../components/auditor/auditor-a11y-toolbar";
import "./auditor-logs.scss";

/** Filtres alignés sur la spec (CREATE, UPDATE, DELETE, LOGIN + échecs / lecture) */
const ACTION_TYPES = ["", "CREATE", "UPDATE", "DELETE", "READ", "LOGIN", "LOGIN_FAILED", "OTHER"];
const RESOURCE_TYPES = [
  "",
  "patient",
  "doctor",
  "nurse",
  "vitals",
  "medication",
  "lab",
  "brain_mri",
  "auth",
  "appointment",
  "questionnaire",
  "chat",
  "notification",
  "mail",
  "department",
  "admin_user",
  "other",
];
const ROLE_OPTIONS = ["", "doctor", "nurse", "patient", "admin", "superadmin", "auditor", "carecoordinator"];
const DATE_PRESETS = ["today", "week", "month", "all"];

function rowClass(visual) {
  if (visual === "danger") return "auditor-logs__row--danger";
  if (visual === "warning") return "auditor-logs__row--warning";
  return "auditor-logs__row--neutral";
}

function formatJson(obj, emptyLabel) {
  if (obj == null) return emptyLabel;
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function labelAction(t, code) {
  if (!code) return t("auditorLogs.noValue");
  if (code === "LOGIN_FAILED") return t("auditorLogs.loginFailed");
  return t(`auditorLogs.actionLabels.${code}`, { defaultValue: code });
}

function labelResource(t, row) {
  const type = row.resourceType;
  const custom = row.resourceLabel;
  if (custom && type && custom !== type) return custom;
  if (type) return t(`auditorLogs.resourceLabels.${type}`, { defaultValue: type });
  if (custom) return custom;
  return t("auditorLogs.noValue");
}

function labelRole(t, role) {
  if (!role) return t("auditorLogs.noValue");
  return t(`auditorLogs.roleLabels.${role}`, { defaultValue: role });
}

const AuditorLogsPage = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = (() => {
    const l = (i18n.language || "en").split("-")[0];
    if (l === "fr") return "fr-FR";
    if (l === "ar") return "ar-SA";
    return "en-US";
  })();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1, limit: 25 });

  const [userSearch, setUserSearch] = useState("");
  const [actorRole, setActorRole] = useState("");
  const [actionType, setActionType] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [datePreset, setDatePreset] = useState("week");

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchList = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await auditorApi.getLogs({
          page: String(page),
          limit: "25",
          userSearch: userSearch.trim() || undefined,
          actorRole: actorRole || undefined,
          actionType: actionType || undefined,
          resourceType: resourceType || undefined,
          datePreset: datePreset || "week",
        });
        setData(res);
      } catch (e) {
        setError(e.message || t("auditorLogs.errorGeneric"));
      } finally {
        setLoading(false);
      }
    },
    [userSearch, actorRole, actionType, resourceType, datePreset, t]
  );

  useEffect(() => {
    fetchList(1);
  }, []);

  const applyFilters = () => fetchList(1);

  const openDetail = async (id) => {
    setShowModal(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await auditorApi.getLogById(id);
      setDetail(d);
    } catch (e) {
      setDetail({ _error: e.message });
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDetail(null);
  };

  const handlePage = (p) => {
    if (p < 1 || p > data.totalPages) return;
    fetchList(p);
  };

  return (
    <AuditorA11yLayout variant="logs">
    <div className="auditor-logs">
      <AuditorA11yToolbar />
      <div id="auditor-main-content" tabIndex={-1}>
      <header className="auditor-logs__header" aria-labelledby="auditor-logs-title">
        <Link to="/auditor/dashboard" className="auditor-logs__back">
          <i className="ri-arrow-left-line" aria-hidden />
          {t("auditorLogs.backDashboard")}
        </Link>

        <div className="auditor-logs__hero">
          <div className="auditor-logs__hero-text">
            <div className="auditor-logs__hero-icon" aria-hidden>
              <i className="ri-file-list-3-line" aria-hidden />
            </div>
            <div>
              <h1 id="auditor-logs-title" className="auditor-logs__title">{t("auditorLogs.pageTitle")}</h1>
              <p className="auditor-logs__subtitle">{t("auditorLogs.subtitle")}</p>
              <div className="auditor-logs__legend">
                <span className="auditor-logs__legend-item auditor-logs__legend-item--danger">{t("auditorLogs.legendDelete")}</span>
                <span className="auditor-logs__legend-item auditor-logs__legend-item--warning">{t("auditorLogs.legendLoginFailed")}</span>
                <span className="auditor-logs__legend-item auditor-logs__legend-item--neutral">{t("auditorLogs.legendNeutral")}</span>
              </div>
              <p className="auditor-logs__legend-desc">{t("auditorLogs.legendHint")}</p>
            </div>
          </div>
          {!loading && (
            <div className="auditor-logs__stat">
              <div className="auditor-logs__stat-value">{data.total}</div>
              <div className="auditor-logs__stat-label">{t("auditorLogs.statTotalLabel")}</div>
            </div>
          )}
        </div>
      </header>

      <div className="auditor-logs__filters" role="region" aria-labelledby="auditor-logs-filters-heading">
        <div id="auditor-logs-filters-heading" className="auditor-logs__filters-head">
          <i className="ri-filter-3-line" aria-hidden />
          {t("auditorLogs.sectionFilters")}
        </div>
        <div className="auditor-logs__filters-body">
          <Row className="g-3 align-items-end">
            <Col md={6} lg={3}>
              <Form.Label htmlFor="auditor-filter-user" className="auditor-logs__label">{t("auditorLogs.filterUser")}</Form.Label>
              <Form.Control
                id="auditor-filter-user"
                className="auditor-logs__control"
                size="sm"
                type="search"
                placeholder={t("auditorLogs.filterUserPlaceholder")}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                autoComplete="off"
              />
            </Col>
            <Col md={6} lg={2}>
              <Form.Label htmlFor="auditor-filter-role" className="auditor-logs__label">{t("auditorLogs.filterRole")}</Form.Label>
              <Form.Select
                id="auditor-filter-role"
                className="auditor-logs__control"
                size="sm"
                value={actorRole}
                onChange={(e) => setActorRole(e.target.value)}
              >
                <option value="">{t("auditorLogs.all")}</option>
                {ROLE_OPTIONS.filter(Boolean).map((r) => (
                  <option key={r} value={r}>
                    {t(`auditorLogs.roleLabels.${r}`)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6} lg={2}>
              <Form.Label htmlFor="auditor-filter-action" className="auditor-logs__label">{t("auditorLogs.filterActionType")}</Form.Label>
              <Form.Select
                id="auditor-filter-action"
                className="auditor-logs__control"
                size="sm"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
              >
                <option value="">{t("auditorLogs.all")}</option>
                {ACTION_TYPES.filter(Boolean).map((a) => (
                  <option key={a} value={a}>
                    {labelAction(t, a)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6} lg={2}>
              <Form.Label htmlFor="auditor-filter-resource" className="auditor-logs__label">{t("auditorLogs.filterResourceType")}</Form.Label>
              <Form.Select
                id="auditor-filter-resource"
                className="auditor-logs__control"
                size="sm"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
              >
                <option value="">{t("auditorLogs.all")}</option>
                {RESOURCE_TYPES.filter(Boolean).map((r) => (
                  <option key={r} value={r}>
                    {t(`auditorLogs.resourceLabels.${r}`)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6} lg={2}>
              <Form.Label htmlFor="auditor-filter-period" className="auditor-logs__label">{t("auditorLogs.filterPeriod")}</Form.Label>
              <Form.Select
                id="auditor-filter-period"
                className="auditor-logs__control"
                size="sm"
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
              >
                {DATE_PRESETS.map((p) => (
                  <option key={p} value={p}>
                    {t(`auditorLogs.preset.${p}`)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6} lg={1} className="d-grid">
              <Button type="button" size="sm" className="auditor-logs__btn-apply mt-1 mt-lg-0" onClick={applyFilters}>
                {t("auditorLogs.apply")}
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      {error && (
        <div className="auditor-logs__alert" role="alert">
          {error}
        </div>
      )}

      <div className="auditor-logs__table-card" role="region" aria-labelledby="auditor-logs-results-heading">
        {!loading && (
          <div className="auditor-logs__toolbar">
            <h2 id="auditor-logs-results-heading" className="auditor-logs__toolbar-title">{t("auditorLogs.sectionResults")}</h2>
            <span className="auditor-logs__toolbar-meta">
              {t("auditorLogs.paginationInfo", { total: data.total, page: data.page, pages: data.totalPages })}
            </span>
          </div>
        )}

        {loading ? (
          <div className="auditor-logs__loader">
            <Spinner
              animation="border"
              className="text-primary"
              role="status"
              aria-label={t("auditorLogs.loadingLogs")}
            />
            <span aria-hidden="true">{t("auditorLogs.loadingLogs")}</span>
          </div>
        ) : (
          <>
            <div className="auditor-logs__table-scroll">
              <Table responsive className="auditor-logs__table mb-0">
                <caption className="visually-hidden">{t("auditorA11y.tableCaptionLogs")}</caption>
                <thead>
                  <tr>
                    <th>{t("auditorLogs.colWhen")}</th>
                    <th>{t("auditorLogs.colWho")}</th>
                    <th>{t("auditorLogs.colRole")}</th>
                    <th>{t("auditorLogs.colActionType")}</th>
                    <th>{t("auditorLogs.colWhat")}</th>
                    <th>{t("auditorLogs.colResource")}</th>
                    <th>{t("auditorLogs.colIp")}</th>
                    <th className="text-end">{t("auditorLogs.detail")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items?.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        <div className="auditor-logs__empty">
                          <div className="auditor-logs__empty-icon" aria-hidden>
                            <i className="ri-inbox-line" aria-hidden />
                          </div>
                          <p>{t("auditorLogs.empty")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {(data.items || []).map((row) => (
                    <tr key={row.id} className={rowClass(row.visual)}>
                      <td className="auditor-logs__cell-time text-nowrap">
                        {row.createdAt ? new Date(row.createdAt).toLocaleString(dateLocale) : t("auditorLogs.noValue")}
                      </td>
                      <td>{row.actorEmail || t("auditorLogs.noValue")}</td>
                      <td>
                        <span className="auditor-logs__cell-muted">{labelRole(t, row.actorRole)}</span>
                      </td>
                      <td>
                        <Badge
                          bg={row.visual === "danger" ? "danger" : row.visual === "warning" ? "warning" : "secondary"}
                          text={row.visual === "warning" ? "dark" : undefined}
                          className="auditor-logs__badge"
                        >
                          {labelAction(t, row.actionType)}
                        </Badge>
                      </td>
                      <td className="auditor-logs__cell-action">
                        <span title={row.action}>
                          {row.action?.length > 56 ? `${row.action.slice(0, 56)}…` : row.action}
                        </span>
                      </td>
                      <td>
                        <span className="auditor-logs__cell-muted">{labelResource(t, row)}</span>
                      </td>
                      <td className="small font-monospace auditor-logs__cell-muted">{row.ipAddress || t("auditorLogs.noValue")}</td>
                      <td className="text-end">
                        <Button
                          type="button"
                          variant="outline-primary"
                          size="sm"
                          className="auditor-logs__btn-detail"
                          onClick={() => openDetail(row.id)}
                          aria-label={`${t("auditorLogs.detail")} — ${row.actorEmail || row.id}`}
                        >
                          <i className="ri-eye-line" aria-hidden />
                          {t("auditorLogs.detail")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="auditor-logs__footer">
              <span className="auditor-logs__footer-info">
                {t("auditorLogs.paginationInfo", { total: data.total, page: data.page, pages: data.totalPages })}
              </span>
              {data.totalPages > 1 ? (
                <nav aria-label={t("auditorLogs.paginationNavAria")}>
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      aria-label={t("auditorLogs.paginationPrev")}
                      disabled={data.page <= 1}
                      onClick={() => handlePage(data.page - 1)}
                    />
                    <Pagination.Item active>{data.page}</Pagination.Item>
                    <Pagination.Next
                      aria-label={t("auditorLogs.paginationNext")}
                      disabled={data.page >= data.totalPages}
                      onClick={() => handlePage(data.page + 1)}
                    />
                  </Pagination>
                </nav>
              ) : (
                <span className="auditor-logs__footer-info" style={{ opacity: 0.75 }}>
                  {t("auditorLogs.noValue")}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      </div>

      <Modal
        show={showModal}
        onHide={closeModal}
        size="lg"
        centered
        dialogClassName="auditor-logs__modal-dialog"
        contentClassName="auditor-logs__modal-content"
        aria-labelledby="auditor-log-detail-title"
      >
        <Modal.Header closeButton className="auditor-logs__modal-header">
          <Modal.Title id="auditor-log-detail-title" as="h5" className="auditor-logs__modal-title mb-0">
            {t("auditorLogs.detailTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="auditor-logs__modal-body">
          {detailLoading && (
            <div className="text-center py-4">
              <Spinner
                animation="border"
                size="sm"
                className="text-primary"
                role="status"
                aria-label={t("auditorLogs.loadingLogs")}
              />
            </div>
          )}
          {!detailLoading && detail?._error && <p className="text-danger mb-0">{detail._error}</p>}
          {!detailLoading && detail && !detail._error && (
            <>
              <dl className="auditor-logs__detail-grid">
                <div className="auditor-logs__detail-field">
                  <dt>{t("auditorLogs.colWho")}</dt>
                  <dd>{detail.actorEmail || t("auditorLogs.noValue")}</dd>
                </div>
                <div className="auditor-logs__detail-field">
                  <dt>{t("auditorLogs.colIp")}</dt>
                  <dd className="font-monospace">{detail.ipAddress || t("auditorLogs.noValue")}</dd>
                </div>
                <div className="auditor-logs__detail-field auditor-logs__detail-field--full">
                  <dt>{t("auditorLogs.colWhat")}</dt>
                  <dd>{detail.action}</dd>
                </div>
              </dl>
              <h6 className="auditor-logs__snapshot-title">{t("auditorLogs.before")}</h6>
              <pre className="auditor-logs__json">{formatJson(detail.beforeSnapshot, t("auditorLogs.noValue"))}</pre>
              <h6 className="auditor-logs__snapshot-title mt-3">{t("auditorLogs.after")}</h6>
              <pre className="auditor-logs__json">{formatJson(detail.afterSnapshot, t("auditorLogs.noValue"))}</pre>
              {detail.metadata && (
                <>
                  <h6 className="auditor-logs__snapshot-title mt-3">{t("auditorLogs.metadata")}</h6>
                  <pre className="auditor-logs__json">{formatJson(detail.metadata, t("auditorLogs.noValue"))}</pre>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="auditor-logs__modal-footer">
          <Button type="button" variant="secondary" className="auditor-logs__btn-close-modal" onClick={closeModal}>
            {t("auditorLogs.close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    </AuditorA11yLayout>
  );
};

export default AuditorLogsPage;
