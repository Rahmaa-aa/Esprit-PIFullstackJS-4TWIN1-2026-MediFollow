import React, { useCallback, useEffect, useState } from "react";
import { Row, Col, Form, Button, Table, Spinner, Modal, Pagination, Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { auditorApi } from "../../services/api";
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

function formatJson(obj) {
  if (obj == null) return "—";
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

const AuditorLogsPage = () => {
  const { t } = useTranslation();
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
        setError(e.message || "Error");
      } finally {
        setLoading(false);
      }
    },
    [userSearch, actorRole, actionType, resourceType, datePreset]
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
    <div className="auditor-logs">
      <h1 className="auditor-logs__title">{t("auditorLogs.pageTitle")}</h1>
      <p className="auditor-logs__subtitle">{t("auditorLogs.subtitle")}</p>

      <div className="auditor-logs__filters">
        <Row className="g-2 align-items-end">
          <Col md={6} lg={3}>
            <Form.Label className="small text-muted mb-1">{t("auditorLogs.filterUser")}</Form.Label>
            <Form.Control
              size="sm"
              type="search"
              placeholder={t("auditorLogs.filterUserPlaceholder")}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </Col>
          <Col md={6} lg={2}>
            <Form.Label className="small text-muted mb-1">{t("auditorLogs.filterRole")}</Form.Label>
            <Form.Select size="sm" value={actorRole} onChange={(e) => setActorRole(e.target.value)}>
              <option value="">{t("auditorLogs.all")}</option>
              {ROLE_OPTIONS.filter(Boolean).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6} lg={2}>
            <Form.Label className="small text-muted mb-1">{t("auditorLogs.filterActionType")}</Form.Label>
            <Form.Select size="sm" value={actionType} onChange={(e) => setActionType(e.target.value)}>
              <option value="">{t("auditorLogs.all")}</option>
              {ACTION_TYPES.filter(Boolean).map((a) => (
                <option key={a} value={a}>
                  {a === "LOGIN_FAILED" ? t("auditorLogs.loginFailed") : a}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6} lg={2}>
            <Form.Label className="small text-muted mb-1">{t("auditorLogs.filterResourceType")}</Form.Label>
            <Form.Select size="sm" value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
              <option value="">{t("auditorLogs.all")}</option>
              {RESOURCE_TYPES.filter(Boolean).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6} lg={2}>
            <Form.Label className="small text-muted mb-1">{t("auditorLogs.filterPeriod")}</Form.Label>
            <Form.Select size="sm" value={datePreset} onChange={(e) => setDatePreset(e.target.value)}>
              {DATE_PRESETS.map((p) => (
                <option key={p} value={p}>
                  {t(`auditorLogs.preset.${p}`)}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6} lg={1} className="d-grid">
            <Button variant="primary" size="sm" className="mt-3 mt-lg-0" onClick={applyFilters}>
              {t("auditorLogs.apply")}
            </Button>
          </Col>
        </Row>
      </div>

      {error && <p className="text-danger small">{error}</p>}

      <div className="auditor-logs__table-card">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" style={{ color: "#635bff" }} />
          </div>
        ) : (
          <>
            <Table responsive hover className="auditor-logs__table mb-0">
              <thead>
                <tr>
                  <th>{t("auditorLogs.colWhen")}</th>
                  <th>{t("auditorLogs.colWho")}</th>
                  <th>{t("auditorLogs.colRole")}</th>
                  <th>{t("auditorLogs.colActionType")}</th>
                  <th>{t("auditorLogs.colWhat")}</th>
                  <th>{t("auditorLogs.colResource")}</th>
                  <th>{t("auditorLogs.colIp")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      {t("auditorLogs.empty")}
                    </td>
                  </tr>
                )}
                {(data.items || []).map((row) => (
                  <tr key={row.id} className={rowClass(row.visual)}>
                    <td className="text-nowrap small">{row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}</td>
                    <td>{row.actorEmail || "—"}</td>
                    <td>{row.actorRole || "—"}</td>
                    <td>
                      <Badge
                        bg={row.visual === "danger" ? "danger" : row.visual === "warning" ? "warning" : "secondary"}
                        text={row.visual === "warning" ? "dark" : undefined}
                        className="auditor-logs__badge"
                      >
                        {row.actionType === "LOGIN_FAILED" ? t("auditorLogs.loginFailed") : row.actionType || "—"}
                      </Badge>
                    </td>
                    <td>
                      <span title={row.action}>{row.action?.length > 56 ? `${row.action.slice(0, 56)}…` : row.action}</span>
                    </td>
                    <td>
                      <span className="text-muted">{row.resourceLabel || row.resourceType || "—"}</span>
                    </td>
                    <td className="small font-monospace">{row.ipAddress || "—"}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" onClick={() => openDetail(row.id)}>
                        {t("auditorLogs.detail")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {data.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top bg-light">
                <span className="small text-muted">
                  {t("auditorLogs.paginationInfo", { total: data.total, page: data.page, pages: data.totalPages })}
                </span>
                <Pagination className="mb-0">
                  <Pagination.Prev disabled={data.page <= 1} onClick={() => handlePage(data.page - 1)} />
                  <Pagination.Item active>{data.page}</Pagination.Item>
                  <Pagination.Next disabled={data.page >= data.totalPages} onClick={() => handlePage(data.page + 1)} />
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("auditorLogs.detailTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading && (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" />
            </div>
          )}
          {!detailLoading && detail?._error && <p className="text-danger">{detail._error}</p>}
          {!detailLoading && detail && !detail._error && (
            <>
              <Row className="g-2 mb-3 small">
                <Col sm={6}>
                  <strong>{t("auditorLogs.colWho")}</strong> {detail.actorEmail || "—"}
                </Col>
                <Col sm={6}>
                  <strong>{t("auditorLogs.colIp")}</strong> {detail.ipAddress || "—"}
                </Col>
                <Col sm={12}>
                  <strong>{t("auditorLogs.colWhat")}</strong> {detail.action}
                </Col>
              </Row>
              <h6 className="mt-3">{t("auditorLogs.before")}</h6>
              <pre className="auditor-logs__json">{formatJson(detail.beforeSnapshot)}</pre>
              <h6 className="mt-3">{t("auditorLogs.after")}</h6>
              <pre className="auditor-logs__json">{formatJson(detail.afterSnapshot)}</pre>
              {detail.metadata && (
                <>
                  <h6 className="mt-3">{t("auditorLogs.metadata")}</h6>
                  <pre className="auditor-logs__json">{formatJson(detail.metadata)}</pre>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            {t("auditorLogs.close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AuditorLogsPage;
