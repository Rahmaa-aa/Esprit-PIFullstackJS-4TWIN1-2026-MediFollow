import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Table } from "react-bootstrap";
import { labAnalysisApi } from "../../services/api";
import "./patient-lab-analysis.scss";

function normalizePid(raw) {
  if (raw == null) return undefined;
  if (typeof raw === "object" && raw !== null && "$oid" in raw) return String(raw.$oid);
  return String(raw);
}

function resultBorderClass(status) {
  if (status === "normal") return "border-success";
  if (status === "anomaly") return "border-warning";
  return "border-secondary";
}

function formatRefRange(p) {
  if (p.refMin != null && p.refMax != null) return `${p.refMin} – ${p.refMax} ${p.unit}`;
  if (p.refMax != null) return `< ${p.refMax} ${p.unit}`;
  if (p.refMin != null) return `> ${p.refMin} ${p.unit}`;
  return p.refLabel || "—";
}

function paramStatusBadge(t, status) {
  if (status === "high") {
    return (
      <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-semibold">
        {t("labAnalysis.valueHigh")}
      </span>
    );
  }
  if (status === "low") {
    return (
      <span className="badge rounded-pill bg-info-subtle text-info-emphasis border border-info-subtle fw-semibold">
        {t("labAnalysis.valueLow")}
      </span>
    );
  }
  return (
    <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle fw-semibold">
      {t("labAnalysis.valueNormal")}
    </span>
  );
}

function statusPill(t, status, { uppercase = false } = {}) {
  const label = t(`labAnalysis.statusLabel.${status}`);
  const base = "border fw-semibold";
  const u = uppercase ? " text-uppercase small" : " small";
  if (status === "normal") {
    return (
      <Badge pill className={`${base} bg-success-subtle text-success-emphasis border-success-subtle${u}`}>
        {label}
      </Badge>
    );
  }
  if (status === "anomaly") {
    return (
      <Badge pill className={`${base} bg-warning-subtle text-warning-emphasis border-warning-subtle${u}`}>
        {label}
      </Badge>
    );
  }
  return (
    <Badge pill className={`${base} bg-secondary-subtle text-secondary-emphasis border-secondary-subtle${u}`}>
      {label}
    </Badge>
  );
}

function anomalyStrengthPill(t, strength) {
  if (strength === "strong") {
    return (
      <Badge pill className="border bg-danger-subtle text-danger-emphasis border-danger-subtle fw-semibold small">
        {t(`labAnalysis.anomalyStrengthLabel.${strength}`)}
      </Badge>
    );
  }
  if (strength === "approximate") {
    return (
      <Badge pill className="border bg-warning-subtle text-warning-emphasis border-warning-subtle fw-semibold small">
        {t(`labAnalysis.anomalyStrengthLabel.${strength}`)}
      </Badge>
    );
  }
  return null;
}

/** Réutilise le même objet « résultat » que l’API analyze (données déjà présentes dans my-history). */
function historyRowToResult(row) {
  return {
    id: row.id,
    status: row.status,
    classificationConfidence: row.classificationConfidence,
    ocrConfidence: row.ocrConfidence,
    method: row.method ?? "",
    textPreview: row.textPreview ?? "",
    anomalyStrength: row.anomalyStrength ?? "none",
    matchedAnomalyHints: Array.isArray(row.matchedAnomalyHints) ? row.matchedAnomalyHints : [],
    matchedNormalHints: Array.isArray(row.matchedNormalHints) ? row.matchedNormalHints : [],
    parametersCompared: Array.isArray(row.parametersCompared) ? row.parametersCompared : [],
    conditionHints: Array.isArray(row.conditionHints) ? row.conditionHints : [],
    createdAt: row.createdAt,
  };
}

const PatientLabAnalysisPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [patientUser, setPatientUser] = useState(() => {
    try {
      const s = localStorage.getItem("patientUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const pid = normalizePid(patientUser?.id ?? patientUser?._id);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  useEffect(() => {
    if (!patientUser) navigate("/auth/sign-in", { replace: true });
  }, [patientUser, navigate]);

  const loadHistory = useCallback(async () => {
    if (!pid) return;
    try {
      const rows = await labAnalysisApi.myHistory(15);
      setHistory(Array.isArray(rows) ? rows : []);
    } catch {
      setHistory([]);
    }
  }, [pid]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    setError("");
    setResult(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(f.type)) {
      setError(t("labAnalysis.badType"));
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError(t("labAnalysis.tooLarge"));
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onAnalyze = async () => {
    if (!file || !pid) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await labAnalysisApi.analyzePhoto(file);
      setSelectedHistoryId(null);
      setResult(data);
      await loadHistory();
    } catch (err) {
      setError(err?.message || t("labAnalysis.error"));
    } finally {
      setLoading(false);
    }
  };

  const paramLabel = (p) => {
    const l = (i18n.language || "").toLowerCase();
    if (l.startsWith("fr")) return p.labelFr;
    return p.labelEn || p.labelFr;
  };

  const fmtDate = (iso) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat(i18n.language || "fr", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
    } catch {
      return String(iso);
    }
  };

  return (
    <div className="patient-lab-analysis-page">
      <Container fluid className="py-4 px-lg-4" style={{ maxWidth: 1320 }}>
        <Row className="mb-4">
          <Col>
            <Link
              to="/dashboard-pages/patient-dashboard"
              className="pla-header-back text-decoration-none small d-inline-flex align-items-center gap-1 fw-medium"
            >
              <i className="ri-arrow-left-line" />
              {t("labAnalysis.backDashboard")}
            </Link>
            <h4 className="mt-3 mb-2 fw-semibold">{t("labAnalysis.title")}</h4>
            <p className="text-muted mb-0" style={{ maxWidth: "42rem" }}>
              {t("labAnalysis.subtitle")}
            </p>
          </Col>
        </Row>

        <Card className="pla-disclaimer border-0 shadow-sm mb-4">
          <Card.Body className="py-3 px-4">
            <div className="d-flex gap-3">
              <div className="flex-shrink-0 text-primary d-none d-sm-block">
                <i className="ri-information-line fs-3 lh-1 opacity-75" aria-hidden />
              </div>
              <div className="small text-body-secondary" style={{ lineHeight: 1.55 }}>
                <p className="mb-2 mb-md-3">
                  <span className="text-body fw-medium">{t("labAnalysis.disclaimer")}</span>
                </p>
                <p className="mb-0">{t("labAnalysis.whatIsPossibleAnomaly")}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Row className="g-4 mb-2">
          <Col xl={4} lg={5}>
            <Card className="pla-upload-card border-0 shadow-sm h-100">
              <Card.Header className="bg-transparent border-bottom py-3 d-flex align-items-center gap-2 fw-semibold">
                <i className="ri-image-add-line text-primary fs-5" aria-hidden />
                {t("labAnalysis.chooseFile")}
              </Card.Header>
              <Card.Body className="pt-3">
                <Form.Group className="mb-3">
                  <Form.Control
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={onPickFile}
                    size="sm"
                    className="form-control-sm"
                  />
                </Form.Group>
                {previewUrl ? (
                  <div className="pla-upload-preview mb-3 overflow-hidden" style={{ maxHeight: 220 }}>
                    <img src={previewUrl} alt="" className="w-100" style={{ maxHeight: 220, objectFit: "contain" }} />
                  </div>
                ) : null}
                <Button variant="primary" size="sm" className="px-4" disabled={!file || loading} onClick={onAnalyze}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {t("labAnalysis.analyzing")}
                    </>
                  ) : (
                    <>
                      <i className="ri-flashlight-line me-1" aria-hidden />
                      {t("labAnalysis.analyze")}
                    </>
                  )}
                </Button>
                {error ? (
                  <Alert variant="danger" className="mt-3 mb-0 small py-2">
                    {error}
                  </Alert>
                ) : null}
              </Card.Body>
            </Card>
          </Col>

          <Col xl={8} lg={7}>
            {result ? (
              <Card
                className={`pla-result-panel border-0 shadow-sm h-100 border-start border-4 ${resultBorderClass(
                  result.status,
                )}`}
              >
                <Card.Body className="p-4">
                  {selectedHistoryId && result.id === selectedHistoryId && result.createdAt ? (
                    <div className="pla-history-banner d-flex align-items-start gap-2 small py-2 px-3 mb-3 bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                      <i className="ri-time-line flex-shrink-0 mt-0" aria-hidden />
                      <span>{t("labAnalysis.viewingHistoryEntry", { date: fmtDate(result.createdAt) })}</span>
                    </div>
                  ) : null}

                  <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    {statusPill(t, result.status, { uppercase: true })}
                    {result.status === "anomaly" && result.anomalyStrength && result.anomalyStrength !== "none"
                      ? anomalyStrengthPill(t, result.anomalyStrength)
                      : null}
                  </div>

                  <p className="mb-3 text-body" style={{ lineHeight: 1.6 }}>
                    {t(`labAnalysis.statusBody.${result.status}`)}
                  </p>
                  {result.status === "anomaly" && result.anomalyStrength && result.anomalyStrength !== "none" ? (
                    <p className="small text-muted mb-4" style={{ lineHeight: 1.55 }}>
                      {t(`labAnalysis.anomalyStrengthBody.${result.anomalyStrength}`)}
                    </p>
                  ) : null}

                  <p className="small text-muted mb-1">
                    {t("labAnalysis.confidence", { pct: result.classificationConfidence ?? "—" })}
                  </p>
                  <p className="small text-muted mb-3">
                    {t("labAnalysis.ocrConfidence", { pct: Math.round(result.ocrConfidence ?? 0) })}
                  </p>

                  {result.matchedAnomalyHints?.length > 0 || result.matchedNormalHints?.length > 0 ? (
                    <div className="mb-4">
                      {result.matchedAnomalyHints?.length > 0 ? (
                        <div className="pla-hint-block p-3 mb-3">
                          <div className="pla-section-label mb-2">{t("labAnalysis.detectedSignals")}</div>
                          <ul className="mb-0 ps-3 small" style={{ lineHeight: 1.6 }}>
                            {result.matchedAnomalyHints.map((h) => (
                              <li key={h}>
                                <span className="font-monospace text-body">{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {result.matchedNormalHints?.length > 0 ? (
                        <div className="pla-hint-block p-3">
                          <div className="pla-section-label mb-2">{t("labAnalysis.detectedSignalsNormal")}</div>
                          <ul className="mb-0 ps-3 small" style={{ lineHeight: 1.6 }}>
                            {result.matchedNormalHints.map((h) => (
                              <li key={h}>
                                <span className="font-monospace text-success-emphasis">{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : result.status === "anomaly" ? (
                    <p className="small text-muted mb-4">{t("labAnalysis.noHints")}</p>
                  ) : null}

                  {result.textPreview ? (
                    <div>
                      <div className="pla-section-label mb-2">{t("labAnalysis.previewText")}</div>
                      <pre className="pla-ocr-preview mb-0 p-3" style={{ whiteSpace: "pre-wrap", maxHeight: 180, overflow: "auto" }}>
                        {result.textPreview}
                      </pre>
                    </div>
                  ) : null}
                </Card.Body>
              </Card>
            ) : (
              <Card className="pla-placeholder-card border-0 shadow-none h-100">
                <Card.Body
                  className="p-4 d-flex flex-column align-items-center justify-content-center text-center text-muted"
                  style={{ minHeight: "12rem" }}
                >
                  <i className="ri-file-search-line fs-1 mb-3 opacity-40" aria-hidden />
                  <p className="small mb-0" style={{ maxWidth: "20rem" }}>
                    {t("labAnalysis.resultPlaceholder")}
                  </p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        {result?.parametersCompared?.length > 0 ? (
          <Card className="pla-table-card border-0 shadow-sm mt-4 mb-4">
            <Card.Header className="bg-transparent border-bottom py-3 px-4">
              <h5 className="mb-1 fw-semibold">{t("labAnalysis.referenceTableTitle")}</h5>
              <p className="small text-muted mb-0" style={{ lineHeight: 1.5 }}>
                {t("labAnalysis.intervalsDisclaimer")}
              </p>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0 pla-lab-table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">{t("labAnalysis.colParameter")}</th>
                      <th>{t("labAnalysis.colValue")}</th>
                      <th>{t("labAnalysis.colRef")}</th>
                      <th className="pe-4">{t("labAnalysis.colStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.parametersCompared.map((p, idx) => (
                      <tr
                        key={p.id != null ? String(p.id) : `p-${idx}`}
                        className={p.status === "high" ? "pla-row--high" : p.status === "low" ? "pla-row--low" : ""}
                      >
                        <td className="ps-4 fw-medium">{paramLabel(p)}</td>
                        <td>
                          <span className="fw-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {p.value}
                          </span>
                          <span className="text-muted small ms-1">{p.unit}</span>
                        </td>
                        <td className="small text-muted">{formatRefRange(p)}</td>
                        <td className="pe-4">{paramStatusBadge(t, p.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            {result.parametersCompared.some((p) => p.status !== "normal") ? (
              <Card.Footer className="bg-transparent border-top py-3 px-4">
                <h6 className="text-danger-emphasis fw-semibold small mb-2">{t("labAnalysis.elevatedTitle")}</h6>
                <ul className="small text-body-secondary mb-0 ps-3" style={{ lineHeight: 1.6 }}>
                  {result.parametersCompared
                    .filter((p) => p.status !== "normal")
                    .map((p, idx) => (
                      <li key={p.id != null ? String(p.id) : `e-${idx}`}>
                        <strong className="text-body">{paramLabel(p)}</strong>: {p.value} {p.unit}
                        {p.status === "high"
                          ? ` — ${t("labAnalysis.elevatedVsRef")}`
                          : ` — ${t("labAnalysis.lowVsRef")}`}
                      </li>
                    ))}
                </ul>
              </Card.Footer>
            ) : null}
          </Card>
        ) : null}

        {result?.conditionHints?.length > 0 ? (
          <div className="mb-4">
            <h5 className="fw-semibold mb-2 px-1">{t("labAnalysis.orientationsTitle")}</h5>
            <Alert variant="warning" className="small py-2 px-3 mb-3 border-0 bg-warning-subtle text-warning-emphasis">
              {t("labAnalysis.orientationsDisclaimer")}
            </Alert>
            <div className="d-grid gap-3">
              {result.conditionHints.map((h) => {
                const l = (i18n.language || "").toLowerCase();
                const isFr = l.startsWith("fr");
                const title = isFr ? h.labelFr : h.labelEn;
                const detail = isFr ? h.detailFr : (h.detailEn || h.detailFr);
                return (
                  <Card key={h.id} className="pla-orientation-card border-0 shadow-sm">
                    <Card.Body className="py-3 px-4">
                      <Card.Title className="h6 mb-2 fw-semibold">{title}</Card.Title>
                      <Card.Text className="small text-muted mb-0" style={{ lineHeight: 1.6 }}>
                        {detail}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : null}

        <Card className="pla-history-card border-0 shadow-sm mt-2 mb-4">
          <Card.Header className="bg-transparent border-bottom py-3 px-4">
            <h5 className="mb-1 fw-semibold">{t("labAnalysis.history")}</h5>
            <p className="text-muted small mb-0">{t("labAnalysis.historyHint")}</p>
          </Card.Header>
          <Card.Body className="p-4 pt-3">
            {!history.length ? (
              <p className="text-muted small mb-0">{t("labAnalysis.noHistory")}</p>
            ) : (
              <div className="d-grid gap-2">
                {history.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    className={`pla-history-btn text-start d-flex flex-wrap align-items-center gap-2 justify-content-between ${
                      selectedHistoryId === row.id ? "pla-history-btn--selected" : ""
                    }`}
                    onClick={() => {
                      setError("");
                      setSelectedHistoryId(row.id);
                      setResult(historyRowToResult(row));
                    }}
                  >
                    <span className="d-flex flex-wrap align-items-center gap-2">
                      {statusPill(t, row.status)}
                      <span className="small text-muted">{fmtDate(row.createdAt)}</span>
                    </span>
                    <span className="small text-muted d-flex align-items-center gap-2">
                      <span className="d-none d-md-inline">{t("labAnalysis.confidence", { pct: row.classificationConfidence ?? "—" })}</span>
                      <span className="d-md-none fw-medium">{row.classificationConfidence ?? "—"}%</span>
                      <i className="ri-arrow-right-s-line text-muted opacity-50" aria-hidden />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PatientLabAnalysisPage;
