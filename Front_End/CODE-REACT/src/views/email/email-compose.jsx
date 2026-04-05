import React, { useCallback, useEffect, useState } from "react";
import { Alert, Col, Form, Row, Spinner } from "react-bootstrap";
import Card from "../../components/Card";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { mailApi } from "../../services/api";

function buildRecipientOptions(data) {
  const opts = [];
  if (!data) return opts;
  if (Array.isArray(data.peers)) {
    data.peers.forEach((p) => {
      let label =
        p.displayName ||
        [p.firstName, p.lastName].filter(Boolean).join(" ").trim() ||
        p.email ||
        "";
      if (!label) label = `${p.role} — ${p.id}`;
      else if (p.email && !label.includes(String(p.email))) {
        label = `${label} (${p.email})`;
      }
      opts.push({
        value: `${p.role}:${p.id}`,
        label,
      });
    });
  }
  const addList = (arr, role, labelFn) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((x) => {
      const id = x._id || x.id;
      if (!id) return;
      opts.push({
        value: `${role}:${id}`,
        label: labelFn(x),
      });
    });
  };
  addList(data.doctors, "doctor", (d) => `Dr. ${d.firstName || ""} ${d.lastName || ""}`.trim() || d.email);
  addList(data.nurses, "nurse", (n) => `RN ${n.firstName || ""} ${n.lastName || ""}`.trim() || n.email);
  addList(data.patients, "patient", (p) => `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.email);
  return opts;
}

function parseToPeer(raw) {
  const s = String(raw || "");
  const idx = s.indexOf(":");
  if (idx < 0) return null;
  const role = s.slice(0, idx);
  const id = s.slice(idx + 1);
  if (!role || !id || !["patient", "doctor", "nurse"].includes(role)) return null;
  return { role, id };
}

const EmailCompose = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { draftMessageId } = useParams();
  const [options, setOptions] = useState([]);
  const [toValue, setToValue] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [draftStateId, setDraftStateId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [draftSavedOk, setDraftSavedOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await mailApi.recipients();
        if (cancelled) return;
        setOptions(buildRecipientOptions(data));
      } catch (e) {
        if (!cancelled) setError(e?.message || t("emailPage.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const loadDraft = useCallback(async () => {
    if (!draftMessageId) {
      setDraftStateId("");
      setLoadingDraft(false);
      return;
    }
    setLoadingDraft(true);
    setError("");
    try {
      const d = await mailApi.getDraft(draftMessageId);
      setSubject(d.subject || "");
      setBody(d.body || "");
      setDraftStateId(d.stateId || "");
      const r0 = d.recipients && d.recipients[0];
      setToValue(r0 ? `${r0.role}:${r0.id}` : "");
    } catch (e) {
      setError(e?.message || t("emailPage.loadError"));
    } finally {
      setLoadingDraft(false);
    }
  }, [draftMessageId, t]);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const buildToPayload = () => {
    const peer = parseToPeer(toValue);
    return peer ? [peer] : [];
  };

  const handleSaveDraft = async () => {
    setError("");
    setDraftSavedOk(false);
    setOk(false);
    const to = buildToPayload();
    setSavingDraft(true);
    try {
      if (draftMessageId) {
        await mailApi.updateDraft(draftMessageId, {
          subject: subject.trim(),
          body: body.trim(),
          to,
        });
        await loadDraft();
      } else {
        const res = await mailApi.saveDraft({
          subject: subject.trim(),
          body: body.trim(),
          to,
        });
        const id = res?.id || res?.message?._id;
        if (id) {
          navigate(`/email/email-compose/${id}`, { replace: true });
        }
      }
      setDraftSavedOk(true);
    } catch (err) {
      setError(err?.message || t("emailPage.draftSaveError"));
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setOk(false);
    setDraftSavedOk(false);
    const to = buildToPayload();
    if (!to.length) {
      setError(t("emailPage.pickRecipient"));
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setError(t("emailPage.sendNeedsSubjectBody"));
      return;
    }
    setSending(true);
    try {
      if (draftMessageId) {
        await mailApi.updateDraft(draftMessageId, {
          subject: subject.trim(),
          body: body.trim(),
          to,
        });
        await mailApi.sendDraft(draftMessageId);
      } else {
        await mailApi.send({
          to,
          subject: subject.trim(),
          body: body.trim(),
        });
      }
      setOk(true);
      setTimeout(() => navigate("/email/inbox"), 800);
    } catch (err) {
      setError(err?.message || t("emailPage.sendError"));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!draftMessageId || !draftStateId) return;
    if (!window.confirm(t("emailPage.deleteDraftConfirm"))) return;
    setError("");
    try {
      await mailApi.deleteMessage(draftStateId);
      navigate("/email/inbox");
    } catch (err) {
      setError(err?.message || t("emailPage.loadError"));
    }
  };

  const busy = sending || savingDraft;

  return (
    <>
      <Row className="row-eq-height">
        <Col md={12}>
          <Row>
            <Col md={12}>
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={12} className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <h5 className="text-primary card-title mb-0">
                        <i className="ri-pencil-fill"></i>{" "}
                        {draftMessageId ? t("emailPage.composeDraftTitle") : t("emailPage.composeTitle")}
                      </h5>
                      <div className="d-flex gap-2 flex-wrap">
                        {draftMessageId && draftStateId && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleDeleteDraft}
                          >
                            {t("emailPage.deleteDraft")}
                          </button>
                        )}
                        <Link to="/email/inbox" className="btn btn-sm btn-outline-primary">
                          {t("emailPage.inbox")}
                        </Link>
                      </div>
                    </Col>
                  </Row>
                  {draftMessageId && (
                    <p className="text-muted small mb-3">{t("emailPage.composeDraftHint")}</p>
                  )}
                  {ok && <Alert variant="success">{t("emailPage.sentOk")}</Alert>}
                  {draftSavedOk && !ok && <Alert variant="info">{t("emailPage.draftSaved")}</Alert>}
                  {error && <Alert variant="danger">{error}</Alert>}
                  {loadingDraft && (
                    <div className="mb-3 text-muted small">
                      <Spinner animation="border" size="sm" className="me-2" />
                      {t("emailPage.loadingDraft")}
                    </div>
                  )}
                  <form className="email-form" onSubmit={handleSend}>
                    <Row className="form-group">
                      <Col sm={2}>
                        <label htmlFor="mail-to" className="col-form-label">
                          {t("emailPage.to")}:
                        </label>
                      </Col>
                      <Col sm={10} className="mb-3">
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : options.length === 0 ? (
                          <div className="text-muted small">{t("emailPage.noRecipients")}</div>
                        ) : (
                          <Form.Select
                            id="mail-to"
                            value={toValue}
                            onChange={(e) => setToValue(e.target.value)}
                          >
                            <option value="">{t("emailPage.pickRecipientOptional")}</option>
                            {options.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </Form.Select>
                        )}
                      </Col>
                    </Row>
                    <Row className="form-group">
                      <Col sm={2}>
                        <label htmlFor="mail-subject" className="col-form-label">
                          {t("emailPage.subject")}:
                        </label>
                      </Col>
                      <Col sm={10} className="mb-3">
                        <input
                          type="text"
                          id="mail-subject"
                          className="form-control"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder={t("emailPage.subjectPlaceholder")}
                        />
                      </Col>
                    </Row>
                    <Row className="form-group">
                      <Col sm={2}>
                        <label htmlFor="mail-body" className="col-form-label">
                          {t("emailPage.message")}:
                        </label>
                      </Col>
                      <Col sm={10} className="mb-3">
                        <textarea
                          className="form-control"
                          id="mail-body"
                          rows={8}
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder={t("emailPage.bodyPlaceholder")}
                        />
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleSaveDraft}
                          disabled={busy || loadingDraft}
                        >
                          {savingDraft ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              {t("emailPage.savingDraft")}
                            </>
                          ) : (
                            t("emailPage.saveDraft")
                          )}
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary-subtle"
                          disabled={busy || loadingDraft}
                        >
                          {sending ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              {t("emailPage.sending")}
                            </>
                          ) : (
                            t("emailPage.send")
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default EmailCompose;
