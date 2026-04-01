import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { questionnaireApi } from "../../services/api";

function QuestionForm({ item, onSubmitted }) {
  const q = item.questionnaire;
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const setVal = (qid, v) => setAnswers((a) => ({ ...a, [qid]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    for (const x of q.questions || []) {
      if (x.type === "yes_no" && answers[x.qid] === undefined) {
        setErr("Répondez à toutes les questions (oui/non).");
        return;
      }
    }
    const list = (q.questions || []).map((x) => ({
      questionId: x.qid,
      value: answers[x.qid] ?? (x.type === "yes_no" ? false : x.type === "scale_10" ? 5 : ""),
    }));
    setSaving(true);
    try {
      const body = {
        questionnaireTemplateId: q.id,
        answers: list,
      };
      if (item.kind === "addon") {
        body.addonId = item.addonId;
      } else {
        body.assignmentId = item.assignmentId;
        body.dayOffset = item.dayOffset;
      }
      await questionnaireApi.patientSubmit(body);
      onSubmitted();
    } catch (ex) {
      setErr(ex.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-primary text-white py-3">
        <div className="fw-semibold">{q.title}</div>
        <div className="small opacity-90">À compléter · échéance {item.dueDate}</div>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {(q.questions || [])
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((qu) => (
              <Form.Group key={qu.qid} className="mb-4">
                <Form.Label className="fw-medium">{qu.label}</Form.Label>
                {qu.type === "yes_no" && (
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      name={qu.qid}
                      id={`${qu.qid}-y`}
                      label="Oui"
                      checked={answers[qu.qid] === true}
                      onChange={() => setVal(qu.qid, true)}
                    />
                    <Form.Check
                      type="radio"
                      name={qu.qid}
                      id={`${qu.qid}-n`}
                      label="Non"
                      checked={answers[qu.qid] === false}
                      onChange={() => setVal(qu.qid, false)}
                    />
                  </div>
                )}
                {qu.type === "scale_10" && (
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <Form.Range
                      min={0}
                      max={10}
                      value={answers[qu.qid] ?? 5}
                      onChange={(e) => setVal(qu.qid, Number(e.target.value))}
                    />
                    <span className="badge bg-primary">{answers[qu.qid] ?? 5}/10</span>
                  </div>
                )}
                {qu.type === "text" && (
                  <Form.Control as="textarea" rows={3} value={answers[qu.qid] ?? ""} onChange={(e) => setVal(qu.qid, e.target.value)} />
                )}
              </Form.Group>
            ))}
          {err && (
            <Alert variant="danger" className="py-2">
              {err}
            </Alert>
          )}
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Envoi…" : "Envoyer"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

const PatientQuestionnairesPage = () => {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [pending, setPending] = useState({ protocol: [], addons: [] });
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      const [p, s] = await Promise.all([questionnaireApi.patientPending(), questionnaireApi.patientSchedule()]);
      setPending(p && typeof p === "object" ? p : { protocol: [], addons: [] });
      setSchedule(s);
    } catch (e) {
      setErr(e.message || "Impossible de charger");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const allPending = [...(pending.protocol || []), ...(pending.addons || [])];

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Questionnaires cliniques</h4>
          <p className="text-muted small mb-0">Évaluations planifiées après votre sortie (complémentaire au check-in quotidien).</p>
        </div>
        <Button as={Link} to="/dashboard-pages/patient-dashboard" variant="outline-primary" size="sm">
          Retour tableau de bord
        </Button>
      </div>

      {schedule?.milestones?.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <div className="fw-semibold mb-2">Planning</div>
            <ul className="small text-muted mb-0 ps-3">
              {schedule.milestones.map((m, i) => (
                <li key={i}>
                  J+{m.dayOffset} ({m.dueDate}) — {m.title || "Questionnaire"} — <span className="text-capitalize">{m.status}</span>
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      )}

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {!loading && err && <Alert variant="danger">{err}</Alert>}

      {!loading && !err && allPending.length === 0 && (
        <Alert variant="light" className="border text-muted">
          Aucun questionnaire à remplir pour le moment (les échéances J+3, J+7, etc. apparaîtront à la date prévue).
        </Alert>
      )}

      {!loading &&
        !err &&
        allPending.map((item, idx) => (
          <QuestionForm key={`${item.kind}-${item.assignmentId || ""}-${item.dayOffset}-${item.addonId || ""}-${idx}`} item={item} onSubmitted={load} />
        ))}
    </Container>
  );
};

export default PatientQuestionnairesPage;
