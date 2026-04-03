import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner, Tab, Tabs, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { departmentApi, questionnaireApi } from "../../services/api";

function defaultQuestionRows(t) {
  const ts = Date.now();
  return [
    { uid: `r-${ts}-a`, label: t("adminQuestionnaireBank.defaultQ1"), type: "scale_10" },
    { uid: `r-${ts}-b`, label: t("adminQuestionnaireBank.defaultQ2"), type: "yes_no" },
    { uid: `r-${ts}-c`, label: t("adminQuestionnaireBank.defaultQ3"), type: "text" },
  ];
}

function defaultMilestoneRows() {
  const t = Date.now();
  return [
    { uid: `m-${t}-a`, dayOffset: 3, questionnaireTemplateId: "" },
    { uid: `m-${t}-b`, dayOffset: 7, questionnaireTemplateId: "" },
    { uid: `m-${t}-c`, dayOffset: 14, questionnaireTemplateId: "" },
    { uid: `m-${t}-d`, dayOffset: 30, questionnaireTemplateId: "" },
  ];
}

const AdminQuestionnaireBank = () => {
  const { t } = useTranslation();
  const [depts, setDepts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [tTitle, setTTitle] = useState("");
  const [tDept, setTDept] = useState("");
  const [tDesc, setTDesc] = useState("");
  const [tQuestionRows, setTQuestionRows] = useState(() => defaultQuestionRows(t));

  const [pName, setPName] = useState("");
  const [pDept, setPDept] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pMilestoneRows, setPMilestoneRows] = useState(defaultMilestoneRows);

  const questionTypeOptions = useMemo(
    () => [
      { value: "scale_10", label: t("adminQuestionnaireBank.typeScale10") },
      { value: "yes_no", label: t("adminQuestionnaireBank.typeYesNo") },
      { value: "text", label: t("adminQuestionnaireBank.typeText") },
    ],
    [t]
  );

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [d, tl, pr] = await Promise.all([
        departmentApi.summary().catch(() => []),
        questionnaireApi.adminListTemplates(),
        questionnaireApi.adminListProtocols(),
      ]);
      setDepts(Array.isArray(d) ? d : []);
      setTemplates(Array.isArray(tl) ? tl : []);
      setProtocols(Array.isArray(pr) ? pr : []);
      const firstDept = Array.isArray(d) && d[0]?.name ? d[0].name : "";
      setTDept((prev) => prev || firstDept);
      setPDept((prev) => prev || firstDept);
    } catch (e) {
      setError(e.message || t("adminQuestionnaireBank.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const deptOptions = useMemo(() => depts.map((x) => x.name).filter(Boolean), [depts]);

  /** Questionnaires du même département que le protocole en cours de création (listes déroulantes). */
  const templatesForProtocolDept = useMemo(
    () => templates.filter((tpl) => String(tpl.department) === String(pDept)),
    [templates, pDept]
  );

  const buildQuestionsPayload = () => {
    const rows = tQuestionRows.filter((r) => String(r.label || "").trim());
    if (!rows.length) return null;
    return rows.map((r, i) => ({
      qid: `q${i + 1}`,
      label: String(r.label).trim(),
      type: r.type,
      order: i,
    }));
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setMsg("");
    const questions = buildQuestionsPayload();
    if (!questions) {
      setMsg(t("adminQuestionnaireBank.msgNeedQuestion"));
      return;
    }
    try {
      await questionnaireApi.adminCreateTemplate({
        title: tTitle,
        department: tDept,
        description: tDesc || undefined,
        questions,
      });
      setMsg(t("adminQuestionnaireBank.msgCreatedTemplate"));
      setTTitle("");
      setTDesc("");
      setTQuestionRows(defaultQuestionRows(t));
      await load();
    } catch (err) {
      setMsg(err.message || t("adminQuestionnaireBank.errorGeneric"));
    }
  };

  const addQuestionRow = () => {
    setTQuestionRows((rows) => [...rows, { uid: `r-${Date.now()}`, label: "", type: "text" }]);
  };

  const removeQuestionRow = (uid) => {
    setTQuestionRows((rows) => rows.filter((r) => r.uid !== uid));
  };

  const updateQuestionRow = (uid, field, value) => {
    setTQuestionRows((rows) => rows.map((r) => (r.uid === uid ? { ...r, [field]: value } : r)));
  };

  const moveQuestionRow = (uid, dir) => {
    setTQuestionRows((rows) => {
      const i = rows.findIndex((r) => r.uid === uid);
      if (i < 0) return rows;
      const j = i + dir;
      if (j < 0 || j >= rows.length) return rows;
      const next = [...rows];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const handleCreateProtocol = async (e) => {
    e.preventDefault();
    setMsg("");
    const milestones = pMilestoneRows
      .filter((row) => String(row.questionnaireTemplateId || "").trim())
      .map((row) => ({
        dayOffset: Number(row.dayOffset),
        questionnaireTemplateId: String(row.questionnaireTemplateId).trim(),
      }));
    if (!milestones.length) {
      setMsg(t("adminQuestionnaireBank.msgNeedMilestones"));
      return;
    }
    const bad = milestones.some((m) => !Number.isFinite(m.dayOffset) || m.dayOffset < 0);
    if (bad) {
      setMsg(t("adminQuestionnaireBank.msgBadDays"));
      return;
    }
    try {
      await questionnaireApi.adminCreateProtocol({
        name: pName,
        department: pDept,
        description: pDesc || undefined,
        milestones,
      });
      setMsg(t("adminQuestionnaireBank.msgCreatedProtocol"));
      setPName("");
      setPDesc("");
      setPMilestoneRows(defaultMilestoneRows());
      await load();
    } catch (err) {
      setMsg(err.message || t("adminQuestionnaireBank.errorGeneric"));
    }
  };

  const addMilestoneRow = () => {
    setPMilestoneRows((rows) => [...rows, { uid: `m-${Date.now()}`, dayOffset: 3, questionnaireTemplateId: "" }]);
  };

  const removeMilestoneRow = (uid) => {
    setPMilestoneRows((rows) => rows.filter((r) => r.uid !== uid));
  };

  const updateMilestoneRow = (uid, field, value) => {
    setPMilestoneRows((rows) => rows.map((r) => (r.uid === uid ? { ...r, [field]: value } : r)));
  };

  const delTemplate = async (id) => {
    if (!window.confirm(t("adminQuestionnaireBank.confirmDeleteTemplate"))) return;
    try {
      await questionnaireApi.adminDeleteTemplate(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const delProtocol = async (id) => {
    if (!window.confirm(t("adminQuestionnaireBank.confirmDeleteProtocol"))) return;
    try {
      await questionnaireApi.adminDeleteProtocol(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container fluid className="pb-5">
      <Row className="mb-4">
        <Col>
          <div className="text-uppercase text-primary fw-semibold small mb-1" style={{ letterSpacing: "0.08em" }}>
            {t("adminQuestionnaireBank.eyebrow")}
          </div>
          <h3 className="fw-bold mb-2">{t("adminQuestionnaireBank.pageTitle")}</h3>
          <p className="text-muted mb-0" style={{ maxWidth: "40rem" }}>
            {t("adminQuestionnaireBank.pageLead")}
          </p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="rounded-3">
          {error}
        </Alert>
      )}
      {msg && (
        <Alert variant="success" className="rounded-3" onClose={() => setMsg("")} dismissible>
          {msg}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" role="status" aria-label={t("adminQuestionnaireBank.loading")} />
        </div>
      ) : (
        <Tabs defaultActiveKey="templates" className="mb-3">
          <Tab eventKey="templates" title={t("adminQuestionnaireBank.tabTemplates")}>
            <Row className="g-4 mt-1">
              <Col lg={5}>
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="bg-primary text-white py-3 fw-semibold">{t("adminQuestionnaireBank.cardNewTemplate")}</Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleCreateTemplate}>
                      <Form.Group className="mb-2">
                        <Form.Label>{t("adminQuestionnaireBank.fieldTitle")}</Form.Label>
                        <Form.Control value={tTitle} onChange={(e) => setTTitle(e.target.value)} required placeholder={t("adminQuestionnaireBank.placeholderTitle")} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>{t("adminQuestionnaireBank.fieldDepartment")}</Form.Label>
                        <Form.Select value={tDept} onChange={(e) => setTDept(e.target.value)} required>
                          {deptOptions.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>{t("adminQuestionnaireBank.descriptionOptional")}</Form.Label>
                        <Form.Control as="textarea" rows={2} value={tDesc} onChange={(e) => setTDesc(e.target.value)} />
                      </Form.Group>

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Label className="mb-0">{t("adminQuestionnaireBank.questionsSection")}</Form.Label>
                        <Button type="button" variant="outline-primary" size="sm" onClick={addQuestionRow}>
                          {t("adminQuestionnaireBank.addQuestion")}
                        </Button>
                      </div>
                      <p className="small text-muted mb-3">
                        {t("adminQuestionnaireBank.questionsHelp")}
                      </p>

                      {tQuestionRows.map((row, idx) => (
                        <div key={row.uid} className="border rounded-3 p-3 mb-3 bg-light bg-opacity-50">
                          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <span className="small text-muted fw-semibold">{t("adminQuestionnaireBank.questionHeading", { n: idx + 1 })}</span>
                            <div className="d-flex gap-1 flex-shrink-0">
                              <Button type="button" variant="light" size="sm" title={t("adminQuestionnaireBank.moveUp")} onClick={() => moveQuestionRow(row.uid, -1)}>
                                ↑
                              </Button>
                              <Button type="button" variant="light" size="sm" title={t("adminQuestionnaireBank.moveDown")} onClick={() => moveQuestionRow(row.uid, 1)}>
                                ↓
                              </Button>
                              <Button type="button" variant="outline-danger" size="sm" onClick={() => removeQuestionRow(row.uid)}>
                                {t("adminQuestionnaireBank.remove")}
                              </Button>
                            </div>
                          </div>
                          <Form.Group className="mb-2">
                            <Form.Label className="small">{t("adminQuestionnaireBank.labelField")}</Form.Label>
                            <Form.Control
                              value={row.label}
                              onChange={(e) => updateQuestionRow(row.uid, "label", e.target.value)}
                              placeholder={t("adminQuestionnaireBank.labelPlaceholder")}
                            />
                          </Form.Group>
                          <Form.Group className="mb-0">
                            <Form.Label className="small">{t("adminQuestionnaireBank.responseType")}</Form.Label>
                            <Form.Select value={row.type} onChange={(e) => updateQuestionRow(row.uid, "type", e.target.value)}>
                              {questionTypeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      ))}

                      <Button type="submit" variant="primary" className="mt-2">
                        {t("adminQuestionnaireBank.save")}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={7}>
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="py-3 fw-semibold">{t("adminQuestionnaireBank.listTitle", { count: templates.length })}</Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover size="sm" className="mb-0 align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th>{t("adminQuestionnaireBank.thTitle")}</th>
                            <th>{t("adminQuestionnaireBank.thDepartment")}</th>
                            <th>{t("adminQuestionnaireBank.thId")}</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {templates.map((tpl) => (
                            <tr key={tpl._id}>
                              <td className="fw-medium">{tpl.title}</td>
                              <td>{tpl.department}</td>
                              <td>
                                <code className="small text-break">{tpl._id}</code>
                              </td>
                              <td className="text-end">
                                <Button variant="outline-danger" size="sm" onClick={() => delTemplate(tpl._id)}>
                                  {t("adminQuestionnaireBank.delete")}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    {templates.length === 0 && <p className="text-muted small p-3 mb-0">{t("adminQuestionnaireBank.emptyTemplates")}</p>}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="protocols" title={t("adminQuestionnaireBank.tabProtocols")}>
            <Row className="g-4 mt-1">
              <Col lg={5}>
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="bg-primary text-white py-3 fw-semibold">{t("adminQuestionnaireBank.cardNewProtocol")}</Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleCreateProtocol}>
                      <Form.Group className="mb-2">
                        <Form.Label>{t("adminQuestionnaireBank.fieldName")}</Form.Label>
                        <Form.Control value={pName} onChange={(e) => setPName(e.target.value)} required placeholder={t("adminQuestionnaireBank.placeholderProtocolName")} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>{t("adminQuestionnaireBank.fieldDepartment")}</Form.Label>
                        <Form.Select
                          value={pDept}
                          onChange={(e) => {
                            setPDept(e.target.value);
                          }}
                          required
                        >
                          {deptOptions.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>{t("adminQuestionnaireBank.description")}</Form.Label>
                        <Form.Control as="textarea" rows={2} value={pDesc} onChange={(e) => setPDesc(e.target.value)} />
                      </Form.Group>

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Label className="mb-0">{t("adminQuestionnaireBank.milestonesSection")}</Form.Label>
                        <Button type="button" variant="outline-primary" size="sm" onClick={addMilestoneRow}>
                          {t("adminQuestionnaireBank.addMilestone")}
                        </Button>
                      </div>
                      <p className="small text-muted mb-3">
                        {t("adminQuestionnaireBank.milestonesHelp")}
                      </p>

                      {templatesForProtocolDept.length === 0 && (
                        <Alert variant="light" className="border py-2 small">
                          {t("adminQuestionnaireBank.noTemplatesForDept", { dept: pDept })}
                        </Alert>
                      )}

                      {pMilestoneRows.map((row, idx) => (
                        <div key={row.uid} className="border rounded-3 p-3 mb-3 bg-light bg-opacity-50">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="small text-muted fw-semibold">{t("adminQuestionnaireBank.milestoneHeading", { n: idx + 1 })}</span>
                            <Button type="button" variant="outline-danger" size="sm" onClick={() => removeMilestoneRow(row.uid)}>
                              {t("adminQuestionnaireBank.remove")}
                            </Button>
                          </div>
                          <Row className="g-2">
                            <Col sm={4}>
                              <Form.Group>
                                <Form.Label className="small">{t("adminQuestionnaireBank.dayLabel")}</Form.Label>
                                <Form.Control
                                  type="number"
                                  min={0}
                                  value={row.dayOffset}
                                  onChange={(e) => updateMilestoneRow(row.uid, "dayOffset", Number(e.target.value))}
                                />
                              </Form.Group>
                            </Col>
                            <Col sm={8}>
                              <Form.Group>
                                <Form.Label className="small">{t("adminQuestionnaireBank.questionnaireField")}</Form.Label>
                                <Form.Select
                                  value={row.questionnaireTemplateId}
                                  onChange={(e) => updateMilestoneRow(row.uid, "questionnaireTemplateId", e.target.value)}
                                >
                                  <option value="">{t("adminQuestionnaireBank.choosePlaceholder")}</option>
                                  {templatesForProtocolDept.map((tpl) => (
                                    <option key={tpl._id} value={tpl._id}>
                                      {tpl.title}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>
                      ))}

                      <Button type="submit" variant="primary" className="mt-2" disabled={templatesForProtocolDept.length === 0}>
                        {t("adminQuestionnaireBank.save")}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={7}>
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="py-3 fw-semibold">{t("adminQuestionnaireBank.listTitle", { count: protocols.length })}</Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover size="sm" className="mb-0 align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th>{t("adminQuestionnaireBank.thName")}</th>
                            <th>{t("adminQuestionnaireBank.thDepartment")}</th>
                            <th>{t("adminQuestionnaireBank.thMilestones")}</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {protocols.map((p) => (
                            <tr key={p._id}>
                              <td className="fw-medium">{p.name}</td>
                              <td>{p.department}</td>
                              <td className="small">
                                {(p.milestones || []).map((m) => t("adminQuestionnaireBank.milestoneDay", { n: m.dayOffset })).join(", ") || "—"}
                              </td>
                              <td className="text-end">
                                <Button variant="outline-danger" size="sm" onClick={() => delProtocol(p._id)}>
                                  {t("adminQuestionnaireBank.delete")}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      )}
    </Container>
  );
};

export default AdminQuestionnaireBank;
