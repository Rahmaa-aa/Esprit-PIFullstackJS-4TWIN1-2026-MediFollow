import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner, Tab, Tabs, Table } from "react-bootstrap";
import Card from "../../components/Card";
import { departmentApi, questionnaireApi } from "../../services/api";

const QUESTION_TYPES = [
  { value: "scale_10", label: "Échelle 0 à 10" },
  { value: "yes_no", label: "Oui / Non" },
  { value: "text", label: "Texte libre" },
];

function defaultQuestionRows() {
  const t = Date.now();
  return [
    { uid: `r-${t}-a`, label: "Comment évaluez-vous votre récupération aujourd’hui ?", type: "scale_10" },
    { uid: `r-${t}-b`, label: "Avez-vous une douleur importante ?", type: "yes_no" },
    { uid: `r-${t}-c`, label: "Commentaires libres", type: "text" },
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
  const [depts, setDepts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [tTitle, setTTitle] = useState("");
  const [tDept, setTDept] = useState("");
  const [tDesc, setTDesc] = useState("");
  const [tQuestionRows, setTQuestionRows] = useState(defaultQuestionRows);

  const [pName, setPName] = useState("");
  const [pDept, setPDept] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pMilestoneRows, setPMilestoneRows] = useState(defaultMilestoneRows);

  const load = async () => {
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
      if (!tDept && Array.isArray(d) && d[0]?.name) setTDept(d[0].name);
      if (!pDept && Array.isArray(d) && d[0]?.name) setPDept(d[0].name);
    } catch (e) {
      setError(e.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deptOptions = useMemo(() => depts.map((x) => x.name).filter(Boolean), [depts]);

  /** Questionnaires du même département que le protocole en cours de création (listes déroulantes). */
  const templatesForProtocolDept = useMemo(
    () => templates.filter((t) => String(t.department) === String(pDept)),
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
      setMsg("Ajoutez au moins une question avec un libellé.");
      return;
    }
    try {
      await questionnaireApi.adminCreateTemplate({
        title: tTitle,
        department: tDept,
        description: tDesc || undefined,
        questions,
      });
      setMsg("Questionnaire créé.");
      setTTitle("");
      setTDesc("");
      setTQuestionRows(defaultQuestionRows());
      await load();
    } catch (err) {
      setMsg(err.message || "Erreur");
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
      setMsg("Ajoutez au moins un jalon et choisissez un questionnaire pour chaque ligne.");
      return;
    }
    const bad = milestones.some((m) => !Number.isFinite(m.dayOffset) || m.dayOffset < 0);
    if (bad) {
      setMsg("Vérifiez les jours (J+n) : nombres positifs ou zéro.");
      return;
    }
    try {
      await questionnaireApi.adminCreateProtocol({
        name: pName,
        department: pDept,
        description: pDesc || undefined,
        milestones,
      });
      setMsg("Protocole créé.");
      setPName("");
      setPDesc("");
      setPMilestoneRows(defaultMilestoneRows());
      await load();
    } catch (err) {
      setMsg(err.message || "Erreur");
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
    if (!window.confirm("Supprimer ce questionnaire ?")) return;
    try {
      await questionnaireApi.adminDeleteTemplate(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const delProtocol = async (id) => {
    if (!window.confirm("Supprimer ce protocole ?")) return;
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
            Administration
          </div>
          <h3 className="fw-bold mb-2">Banque de questionnaires & protocoles</h3>
          <p className="text-muted mb-0" style={{ maxWidth: "40rem" }}>
            Créez des questionnaires par <strong>département</strong>, puis des <strong>protocoles</strong> (jalons J+3, J+7, …) qui référencent ces questionnaires. Les médecins assignent un protocole à la sortie du patient.
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
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Tabs defaultActiveKey="templates" className="mb-3">
          <Tab eventKey="templates" title="Questionnaires">
            <Row className="g-4 mt-1">
              <Col lg={5}>
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="bg-primary text-white py-3 fw-semibold">Nouveau questionnaire</Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleCreateTemplate}>
                      <Form.Group className="mb-2">
                        <Form.Label>Titre</Form.Label>
                        <Form.Control value={tTitle} onChange={(e) => setTTitle(e.target.value)} required placeholder="ex. Suivi post-cardiaque" />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Département</Form.Label>
                        <Form.Select value={tDept} onChange={(e) => setTDept(e.target.value)} required>
                          {deptOptions.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Description (optionnel)</Form.Label>
                        <Form.Control as="textarea" rows={2} value={tDesc} onChange={(e) => setTDesc(e.target.value)} />
                      </Form.Group>

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Label className="mb-0">Questions</Form.Label>
                        <Button type="button" variant="outline-primary" size="sm" onClick={addQuestionRow}>
                          + Ajouter une question
                        </Button>
                      </div>
                      <p className="small text-muted mb-3">
                        Définissez chaque item ci-dessous : libellé affiché au patient et type de réponse (échelle, oui/non, texte). Aucun code à saisir.
                      </p>

                      {tQuestionRows.map((row, idx) => (
                        <div key={row.uid} className="border rounded-3 p-3 mb-3 bg-light bg-opacity-50">
                          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <span className="small text-muted fw-semibold">Question {idx + 1}</span>
                            <div className="d-flex gap-1 flex-shrink-0">
                              <Button type="button" variant="light" size="sm" title="Monter" onClick={() => moveQuestionRow(row.uid, -1)}>
                                ↑
                              </Button>
                              <Button type="button" variant="light" size="sm" title="Descendre" onClick={() => moveQuestionRow(row.uid, 1)}>
                                ↓
                              </Button>
                              <Button type="button" variant="outline-danger" size="sm" onClick={() => removeQuestionRow(row.uid)}>
                                Retirer
                              </Button>
                            </div>
                          </div>
                          <Form.Group className="mb-2">
                            <Form.Label className="small">Libellé</Form.Label>
                            <Form.Control
                              value={row.label}
                              onChange={(e) => updateQuestionRow(row.uid, "label", e.target.value)}
                              placeholder="Texte de la question pour le patient"
                            />
                          </Form.Group>
                          <Form.Group className="mb-0">
                            <Form.Label className="small">Type de réponse</Form.Label>
                            <Form.Select value={row.type} onChange={(e) => updateQuestionRow(row.uid, "type", e.target.value)}>
                              {QUESTION_TYPES.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      ))}

                      <Button type="submit" variant="primary" className="mt-2">
                        Enregistrer
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={7}>
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="py-3 fw-semibold">Liste ({templates.length})</Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover size="sm" className="mb-0 align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th>Titre</th>
                            <th>Département</th>
                            <th>Id</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {templates.map((t) => (
                            <tr key={t._id}>
                              <td className="fw-medium">{t.title}</td>
                              <td>{t.department}</td>
                              <td>
                                <code className="small text-break">{t._id}</code>
                              </td>
                              <td className="text-end">
                                <Button variant="outline-danger" size="sm" onClick={() => delTemplate(t._id)}>
                                  Supprimer
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    {templates.length === 0 && <p className="text-muted small p-3 mb-0">Aucun questionnaire.</p>}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="protocols" title="Protocoles">
            <Row className="g-4 mt-1">
              <Col lg={5}>
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="bg-primary text-white py-3 fw-semibold">Nouveau protocole</Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleCreateProtocol}>
                      <Form.Group className="mb-2">
                        <Form.Label>Nom</Form.Label>
                        <Form.Control value={pName} onChange={(e) => setPName(e.target.value)} required placeholder="ex. Protocole standard cardiologie" />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Département</Form.Label>
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
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={2} value={pDesc} onChange={(e) => setPDesc(e.target.value)} />
                      </Form.Group>

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Label className="mb-0">Jalons (après la sortie)</Form.Label>
                        <Button type="button" variant="outline-primary" size="sm" onClick={addMilestoneRow}>
                          + Ajouter un jalon
                        </Button>
                      </div>
                      <p className="small text-muted mb-3">
                        Pour chaque ligne : nombre de jours après la sortie (ex. 3 pour J+3) et le questionnaire à envoyer, choisi dans la liste des questionnaires de ce département.
                      </p>

                      {templatesForProtocolDept.length === 0 && (
                        <Alert variant="light" className="border py-2 small">
                          Aucun questionnaire enregistré pour « {pDept} ». Créez d’abord des questionnaires dans l’onglet Questionnaires.
                        </Alert>
                      )}

                      {pMilestoneRows.map((row, idx) => (
                        <div key={row.uid} className="border rounded-3 p-3 mb-3 bg-light bg-opacity-50">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="small text-muted fw-semibold">Jalon {idx + 1}</span>
                            <Button type="button" variant="outline-danger" size="sm" onClick={() => removeMilestoneRow(row.uid)}>
                              Retirer
                            </Button>
                          </div>
                          <Row className="g-2">
                            <Col sm={4}>
                              <Form.Group>
                                <Form.Label className="small">Jour (J+n)</Form.Label>
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
                                <Form.Label className="small">Questionnaire</Form.Label>
                                <Form.Select
                                  value={row.questionnaireTemplateId}
                                  onChange={(e) => updateMilestoneRow(row.uid, "questionnaireTemplateId", e.target.value)}
                                >
                                  <option value="">— Choisir —</option>
                                  {templatesForProtocolDept.map((t) => (
                                    <option key={t._id} value={t._id}>
                                      {t.title}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>
                      ))}

                      <Button type="submit" variant="primary" className="mt-2" disabled={templatesForProtocolDept.length === 0}>
                        Enregistrer
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={7}>
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="py-3 fw-semibold">Liste ({protocols.length})</Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover size="sm" className="mb-0 align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th>Nom</th>
                            <th>Département</th>
                            <th>Jalons</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {protocols.map((p) => (
                            <tr key={p._id}>
                              <td className="fw-medium">{p.name}</td>
                              <td>{p.department}</td>
                              <td className="small">{(p.milestones || []).map((m) => `J+${m.dayOffset}`).join(", ") || "—"}</td>
                              <td className="text-end">
                                <Button variant="outline-danger" size="sm" onClick={() => delProtocol(p._id)}>
                                  Supprimer
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
