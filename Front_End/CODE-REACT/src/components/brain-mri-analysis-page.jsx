import React, { useCallback, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
  ProgressBar,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { brainTumorApi } from "../services/api";
import { normalizeMongoId } from "../utils/mongoId";
import "../views/doctor/doctor-brain-mri.scss";

const MAX_BYTES = 16 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp", "image/tiff", "image/gif"]);

function formatRecordDate(iso, localeTag) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const loc = localeTag === "ar" ? "ar-TN" : localeTag === "fr" ? "fr-FR" : "en-US";
    return new Intl.DateTimeFormat(loc, { dateStyle: "short", timeStyle: "short" }).format(d);
  } catch {
    return "—";
  }
}

/**
 * @param {{ variant: 'doctor' | 'patient'; patientId?: string; embedded?: boolean }} props
 */
const BrainMriAnalysisPage = ({ variant = "doctor", patientId: patientIdProp, embedded = false }) => {
  const { t, i18n } = useTranslation();
  const isPatient = variant === "patient";
  const dateLocale = i18n.language?.startsWith("ar") ? "ar" : i18n.language?.startsWith("fr") ? "fr" : "en";

  const [sessionUser] = useState(() => {
    try {
      const key = isPatient ? "patientUser" : "doctorUser";
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const userId = sessionUser?.id || sessionUser?._id;
  const normalizedSelfId = normalizeMongoId(userId) || undefined;

  /** Id patient normalisé (prop / query) — requis pour predictDoctor + historique côté médecin. */
  const normalizedPropPid = normalizeMongoId(patientIdProp) || undefined;

  /** Médecin avec dossier patient : historique filtré ; sinon historique « mes analyses ». */
  const doctorUsesPatientContext = !isPatient && !!normalizedPropPid;

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [careTeamNotified, setCareTeamNotified] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const loadHistory = useCallback(async () => {
    if (!userId) {
      setHistory([]);
      setHistoryError("");
      return;
    }
    setHistoryLoading(true);
    setHistoryError("");
    try {
      let rows;
      if (isPatient) {
        if (!normalizedSelfId) {
          setHistory([]);
          return;
        }
        rows = await brainTumorApi.listRecords(String(normalizedSelfId), 40);
      } else if (doctorUsesPatientContext) {
        rows = await brainTumorApi.listRecords(String(normalizedPropPid), 40);
      } else {
        rows = await brainTumorApi.listMyRecordsAsDoctor(40);
      }
      setHistory(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setHistory([]);
      setHistoryError(e?.message || t("doctorBrainMri.historyLoadError"));
    } finally {
      setHistoryLoading(false);
    }
  }, [userId, isPatient, normalizedSelfId, doctorUsesPatientContext, normalizedPropPid, t]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    setError("");
    setResult(null);
    setCareTeamNotified(false);
    if (!f) {
      setFile(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      return;
    }
    if (!ALLOWED.has(f.type)) {
      setError(t("doctorBrainMri.badType"));
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(t("doctorBrainMri.tooLarge"));
      return;
    }
    setFile(f);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  const onAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    setCareTeamNotified(false);
    try {
      const savePid = isPatient ? undefined : normalizedPropPid || undefined;
      const data = isPatient
        ? await brainTumorApi.predictPatient(file)
        : await brainTumorApi.predictDoctor(file, savePid);
      setResult(data);
      if (isPatient) setCareTeamNotified(true);
      void loadHistory();
    } catch (e) {
      setError(e.message || t("doctorBrainMri.error"));
    } finally {
      setLoading(false);
    }
  };

  const overlaySrc =
    result?.overlayPngBase64 != null ? `data:image/png;base64,${result.overlayPngBase64}` : null;
  const rawProb = Number(result?.probability);
  const probPct = Number.isFinite(rawProb)
    ? Math.min(100, Math.max(0, Math.round(rawProb * 1000) / 10))
    : 0;
  const isTumor = result?.prediction === 1;

  const heroNs = isPatient ? "patientBrainMri" : "doctorBrainMri";
  const showHistory = !!userId;
  const showFileColumn = !isPatient && !doctorUsesPatientContext;

  if (!userId) {
    return (
      <Container className="py-5">
        <p className="text-muted text-center">{t(`${heroNs}.loginPrompt`)}</p>
        <div className="text-center">
          <Link to="/auth/sign-in" className="btn btn-primary">
            {t(`${heroNs}.signIn`)}
          </Link>
        </div>
      </Container>
    );
  }

  const containerClass = embedded ? "py-2 px-0" : "py-4 px-lg-4";

  return (
    <div className={`doctor-brain-mri-page${embedded ? " doctor-brain-mri-page--embedded" : ""}`}>
      <Container fluid className={containerClass}>
        <Row className="justify-content-center">
          <Col xxl={10} xl={11}>
            {!embedded && (
              <div className="dbm-hero d-flex align-items-start gap-3">
                <div className="dbm-icon-wrap" aria-hidden>
                  <i className="ri-brain-line" />
                </div>
                <div className="flex-grow-1 min-w-0">
                  <h1 className="h4 mb-1 fw-semibold text-body">{t(`${heroNs}.title`)}</h1>
                  <p className="text-muted small mb-0 lh-base">{t(`${heroNs}.subtitle`)}</p>
                </div>
              </div>
            )}

            <Row className="g-4">
              <Col lg={5}>
                <Card className="dbm-card shadow-sm h-100">
                  <Card.Header>{t("doctorBrainMri.sectionImaging")}</Card.Header>
                  <Card.Body className="p-4">
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary text-uppercase">
                        {t("doctorBrainMri.chooseFile")}
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={onPick}
                        disabled={loading}
                        className="form-control-sm"
                      />
                      {file && (
                        <div className="dbm-file-meta mt-2">
                          <span className="text-body">{t("doctorBrainMri.fileSelected")}:</span> {file.name}
                        </div>
                      )}
                    </Form.Group>

                    {previewUrl ? (
                      <div className="mb-0">
                        <div className="small fw-semibold text-secondary text-uppercase mb-2">
                          {t("doctorBrainMri.previewOriginal")}
                        </div>
                        <div className="dbm-preview-box">
                          <img src={previewUrl} alt="" />
                        </div>
                      </div>
                    ) : (
                      <div className="dbm-empty-panel mb-0">
                        <i className="ri-image-add-line fs-2 text-secondary mb-2 d-block opacity-50" aria-hidden />
                        <span className="small">{t("doctorBrainMri.uploadPlaceholder")}</span>
                      </div>
                    )}

                    <div className="d-grid gap-2 mt-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="fw-semibold"
                        onClick={onAnalyze}
                        disabled={!file || loading}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" role="status" />
                            {t("doctorBrainMri.analyzing")}
                          </>
                        ) : (
                          <>
                            <i className="ri-radar-line me-2" aria-hidden />
                            {t("doctorBrainMri.analyze")}
                          </>
                        )}
                      </Button>
                    </div>

                    {error && (
                      <Alert variant="danger" className="mt-3 mb-0 small">
                        {error}
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={7}>
                <Card className="dbm-card shadow-sm h-100">
                  <Card.Header>{t("doctorBrainMri.sectionResults")}</Card.Header>
                  <Card.Body className="p-4">
                    {!result && !loading && (
                      <div className="dbm-empty-panel border-0 bg-transparent py-5">
                        <i className="ri-file-chart-line fs-1 text-secondary mb-3 d-block opacity-40" aria-hidden />
                        <p className="small mb-0 px-md-4">{t("doctorBrainMri.emptyResults")}</p>
                      </div>
                    )}

                    {loading && (
                      <div className="text-center py-5">
                        <Spinner animation="border" className="text-primary mb-3" />
                        <p className="small text-muted mb-0">{t("doctorBrainMri.analyzing")}</p>
                      </div>
                    )}

                    {result && !loading && (
                      <>
                        {careTeamNotified && (
                          <Alert variant="success" className="small py-2 mb-3">
                            <i className="ri-team-line me-2" aria-hidden />
                            {t("patientBrainMri.careTeamNotified")}
                          </Alert>
                        )}
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                          <span className="dbm-score-label mb-0">{t("doctorBrainMri.prediction")}</span>
                          <Badge
                            pill
                            bg={isTumor ? "warning" : "success"}
                            text={isTumor ? "dark" : "white"}
                            className="dbm-result-badge"
                          >
                            {isTumor ? t("doctorBrainMri.tumor") : t("doctorBrainMri.normal")}
                          </Badge>
                        </div>

                        <div className="mb-4">
                          <div className="dbm-score-label">{t("doctorBrainMri.modelConfidence")}</div>
                          <div className="d-flex align-items-center gap-3 mb-1">
                            <ProgressBar
                              now={probPct}
                              max={100}
                              variant={isTumor ? "warning" : "success"}
                              className="flex-grow-1"
                              style={{ height: "10px" }}
                              aria-valuenow={probPct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                            <span className="small fw-semibold tabular-nums text-body">{probPct}%</span>
                          </div>
                          <div className="small text-muted">{t("doctorBrainMri.probabilityCaption")}</div>
                        </div>

                        {overlaySrc && (
                          <Row className="g-3">
                            <Col md={6}>
                              <div className="small fw-semibold text-secondary text-uppercase mb-2">
                                {t("doctorBrainMri.previewOriginal")}
                              </div>
                              <div className="dbm-preview-box">
                                <img src={previewUrl} alt="" />
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="small fw-semibold text-secondary text-uppercase mb-2">
                                {t("doctorBrainMri.heatmapTitle")}
                              </div>
                              <div className="dbm-preview-box">
                                <img src={overlaySrc} alt="" />
                              </div>
                              <p className="dbm-heatmap-caption mb-0">{t("doctorBrainMri.heatmapCaption")}</p>
                            </Col>
                          </Row>
                        )}

                        <p className="dbm-footnote mb-0">{t("doctorBrainMri.clinicalNote")}</p>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {showHistory && (
              <Card className="dbm-card shadow-sm mt-4">
                <Card.Header className="small fw-semibold">
                  {t("doctorBrainMri.historyTitle")}
                  {!isPatient && (
                    <span className="d-block text-muted fw-normal mt-1" style={{ fontSize: "0.8rem" }}>
                      {doctorUsesPatientContext
                        ? t("doctorBrainMri.historySubtitlePatient")
                        : t("doctorBrainMri.historySubtitleDoctor")}
                    </span>
                  )}
                </Card.Header>
                <Card.Body className="p-3 p-md-4">
                  {historyError && (
                    <Alert variant="warning" className="py-2 small mb-3">
                      {historyError}
                    </Alert>
                  )}
                  {historyLoading ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" size="sm" />
                    </div>
                  ) : history.length === 0 && !historyError ? (
                    <p className="small text-muted mb-0">{t("doctorBrainMri.historyEmpty")}</p>
                  ) : history.length === 0 ? null : (
                    <div className="table-responsive">
                      <Table hover size="sm" className="mb-0 align-middle">
                        <thead className="text-secondary small">
                          <tr>
                            <th>{t("doctorBrainMri.historyColDate")}</th>
                            {showFileColumn && <th>{t("doctorBrainMri.historyColFile")}</th>}
                            <th>{t("doctorBrainMri.historyColResult")}</th>
                            <th>{t("doctorBrainMri.historyColScore")}</th>
                            {!doctorUsesPatientContext && !isPatient && (
                              <th>{t("doctorBrainMri.historyColPatient")}</th>
                            )}
                            <th>{t("doctorBrainMri.historyColSource")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((row) => {
                            const tum = Number(row.prediction) === 1;
                            const pct = Math.min(100, Math.max(0, Math.round(Number(row.probability) * 1000) / 10));
                            const fname = row.originalFilename ? String(row.originalFilename) : "";
                            const hasPatient = !!(row.patientId && String(row.patientId).trim());
                            return (
                              <tr key={row.id}>
                                <td className="small text-nowrap">{formatRecordDate(row.createdAt, dateLocale)}</td>
                                {showFileColumn && (
                                  <td className="small text-truncate" style={{ maxWidth: 140 }} title={fname}>
                                    {fname || "—"}
                                  </td>
                                )}
                                <td>
                                  <Badge pill bg={tum ? "warning" : "success"} text={tum ? "dark" : "white"}>
                                    {tum ? t("doctorBrainMri.tumor") : t("doctorBrainMri.normal")}
                                  </Badge>
                                </td>
                                <td className="small tabular-nums">{pct}%</td>
                                {!doctorUsesPatientContext && !isPatient && (
                                  <td className="small">
                                    {hasPatient ? t("doctorBrainMri.historyPatientLinked") : "—"}
                                  </td>
                                )}
                                <td className="small">
                                  {row.source === "patient"
                                    ? t("doctorBrainMri.historySourcePatient")
                                    : t("doctorBrainMri.historySourceDoctor")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            <Alert
              variant="light"
              className={`border mb-0 small text-secondary ${embedded ? "mt-3 py-2" : "mt-4"}`}
            >
              <i className="ri-information-line me-2 align-middle" aria-hidden />
              {t(`${heroNs}.disclaimer`)}
            </Alert>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BrainMriAnalysisPage;
