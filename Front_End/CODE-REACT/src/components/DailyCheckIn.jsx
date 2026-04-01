import React, { useState, useEffect } from "react";
import { Modal, Form, ProgressBar } from "react-bootstrap";
import { healthLogApi } from "../services/api";

// Local date string (avoids UTC midnight timezone bug)
const localDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Même logique que le dashboard : id Mongo / JSON étendu { $oid } */
function normalizePatientId(raw) {
  if (raw == null) return undefined;
  if (typeof raw === "object" && raw !== null && "$oid" in raw) return String(raw.$oid);
  return String(raw);
}

const SYMPTOMS = [
  "Fatigue", "Headache", "Dizziness", "Nausea",
  "Shortness of breath", "Chest pain", "Swelling (legs/ankles)",
  "Fever", "Loss of appetite", "Insomnia", "Palpitations",
];

/** Icônes métier (pas de visages) : stable / équilibre / attention clinique */
const MOODS = [
  { value: "good", label: "Satisfactory", icon: "ri-shield-check-line", color: "#28a745" },
  { value: "fair", label: "Moderate", icon: "ri-scales-3-line", color: "#fd7e14" },
  { value: "poor", label: "Poor", icon: "ri-first-aid-kit-line", color: "#dc3545" },
];

const STEPS = ["Vitals", "Symptoms", "Wellbeing", "Review"];

/** Plages autorisées (valeurs extrêmes mais plausibles) — contrôle min/max côté client */
const VITAL_LIMITS = {
  bloodPressureSystolic: { min: 40, max: 250, unit: "mmHg" },
  bloodPressureDiastolic: { min: 20, max: 180, unit: "mmHg" },
  heartRate: { min: 25, max: 250, unit: "bpm" },
  temperature: { min: 30, max: 45, unit: "°C" },
  oxygenSaturation: { min: 0, max: 100, unit: "%" },
  weight: { min: 2, max: 400, unit: "kg" },
};

function validateVitals(vitals) {
  const errors = {};
  Object.entries(vitals).forEach(([key, raw]) => {
    if (raw === "" || raw === null || raw === undefined) return;
    const n = Number(raw);
    if (Number.isNaN(n)) {
      errors[key] = "Saisissez un nombre valide.";
      return;
    }
    const lim = VITAL_LIMITS[key];
    if (!lim) return;
    if (n < lim.min) {
      errors[key] = `Valeur minimale : ${lim.min} ${lim.unit}.`;
    } else if (n > lim.max) {
      errors[key] = `Valeur maximale : ${lim.max} ${lim.unit}.`;
    }
  });
  return errors;
}

const defaultForm = {
  vitals: { bloodPressureSystolic: "", bloodPressureDiastolic: "", heartRate: "", temperature: "", oxygenSaturation: "", weight: "" },
  symptoms: [],
  painLevel: 0,
  mood: "good",
  notes: "",
};

const DailyCheckIn = ({ patientId, onSubmitted, existingLog }) => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [vitalsErrors, setVitalsErrors] = useState({});

  const alreadyDone = !!existingLog;

  const handleVital = (key, val) => {
    setVitalsErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
    setForm((f) => ({ ...f, vitals: { ...f.vitals, [key]: val } }));
  };

  const goNextStep = () => {
    if (step === 0) {
      const errs = validateVitals(form.vitals);
      if (Object.keys(errs).length > 0) {
        setVitalsErrors(errs);
        return;
      }
      setVitalsErrors({});
    }
    setStep((s) => s + 1);
  };

  const toggleSymptom = (s) =>
    setForm((f) => ({
      ...f,
      symptoms: f.symptoms.includes(s) ? f.symptoms.filter((x) => x !== s) : [...f.symptoms, s],
    }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const vitalErrs = validateVitals(form.vitals);
    if (Object.keys(vitalErrs).length > 0) {
      setVitalsErrors(vitalErrs);
      setStep(0);
      setError("Corrigez les constantes hors plage avant d’envoyer le formulaire.");
      setLoading(false);
      return;
    }
    try {
      const pid = normalizePatientId(patientId);
      if (!pid) {
        setError("Session invalide : identifiant patient manquant. Reconnectez-vous.");
        setLoading(false);
        return;
      }
      const cleanVitals = {};
      Object.entries(form.vitals).forEach(([k, v]) => {
        if (v !== "" && v !== null) cleanVitals[k] = Number(v);
      });
      await healthLogApi.submit({
        patientId: pid,
        localDate: localDateString(),
        recordedAt: new Date().toISOString(),
        ...form,
        vitals: cleanVitals,
      });
      setSuccess(true);
      setShow(false);
      setStep(0);
      setForm(defaultForm);
      if (onSubmitted) onSubmitted();
    } catch (e) {
      console.error('[DailyCheckIn] Submit error:', e);
      setError(e.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = ((step) / (STEPS.length - 1)) * 100;

  return (
    <>
      {/* Dashboard Card */}
      <div
        className={`card border-0 shadow-sm h-100 ${alreadyDone || success ? "border-start border-4 border-success" : "border-start border-4 border-warning"}`}
        style={{ borderRadius: 14 }}
      >
        <div className="card-body p-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="card-title text-primary mb-0 fw-bold">
              <i className="ri-heart-pulse-line me-2"></i>Daily Health Check-in
            </h6>
            <span className={`badge d-inline-flex align-items-center gap-1 ${alreadyDone || success ? "bg-success" : "bg-warning text-dark"}`}>
              {alreadyDone || success ? (
                <>
                  <i className="ri-checkbox-circle-line" aria-hidden />
                  <span>Done Today</span>
                </>
              ) : (
                <>
                  <i className="ri-time-line" aria-hidden />
                  <span>Pending</span>
                </>
              )}
            </span>
          </div>

          {alreadyDone || success ? (
            <div>
              <p className="text-muted small mb-2">
                {existingLog
                  ? `Last check-in today at ${new Date(existingLog.recordedAt || existingLog.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} — you can add more readings below.`
                  : "You've completed today's check-in."}
              </p>
              {existingLog && (
                <div className="row g-2 text-center">
                  {existingLog.vitals?.heartRate && (
                    <div className="col-4">
                      <div className="bg-light rounded p-2">
                        <i className="ri-heart-line text-danger"></i>
                        <div className="fw-bold small">{existingLog.vitals.heartRate} bpm</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>Heart Rate</div>
                      </div>
                    </div>
                  )}
                  {existingLog.vitals?.bloodPressureSystolic && (
                    <div className="col-4">
                      <div className="bg-light rounded p-2">
                        <i className="ri-drop-line text-primary"></i>
                        <div className="fw-bold small">{existingLog.vitals.bloodPressureSystolic}/{existingLog.vitals.bloodPressureDiastolic}</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>Blood Pressure</div>
                      </div>
                    </div>
                  )}
                  {existingLog.vitals?.oxygenSaturation && (
                    <div className="col-4">
                      <div className="bg-light rounded p-2">
                        <i className="ri-lungs-line text-info"></i>
                        <div className="fw-bold small">{existingLog.vitals.oxygenSaturation}%</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>O₂ Sat.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {existingLog?.flagged && (
                <div className="alert alert-danger py-2 mt-2 small mb-0">
                  <i className="ri-alert-line me-1"></i>
                  Your vitals need attention. Your care team has been notified.
                </div>
              )}
              <button className="btn btn-sm btn-outline-primary mt-2 w-100" onClick={() => setShow(true)}>
                <i className="ri-add-line me-1"></i>
                Add another check-in
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-muted small mb-3">
                Please fill in your daily health report to help your care team monitor your recovery.
              </p>
              <button className="btn btn-primary w-100" onClick={() => setShow(true)}>
                <i className="ri-stethoscope-line me-2"></i>Start Check-in
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        show={show}
        onHide={() => {
          setShow(false);
          setVitalsErrors({});
          setError("");
        }}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-primary">
            <i className="ri-heart-pulse-line me-2"></i>Daily Health Check-in
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          {/* Progress */}
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              {STEPS.map((s, i) => (
                <span key={s} className={`small fw-bold d-inline-flex align-items-center gap-1 ${i === step ? "text-primary" : i < step ? "text-success" : "text-muted"}`}>
                  {i < step ? <i className="ri-checkbox-circle-fill" aria-hidden /> : null}
                  {s}
                </span>
              ))}
            </div>
            <ProgressBar now={progressPercent} variant="primary" style={{ height: 4, borderRadius: 4 }} />
          </div>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          {/* Step 0: Vitals */}
          {step === 0 && (
            <div>
              <p className="text-muted small mb-3">Enter your vital measurements. Skip any you don&apos;t have.</p>
              <p className="text-muted small mb-3" style={{ fontSize: "0.8rem" }}>
                Plages autorisées : TA {VITAL_LIMITS.bloodPressureSystolic.min}–{VITAL_LIMITS.bloodPressureSystolic.max} /{" "}
                {VITAL_LIMITS.bloodPressureDiastolic.min}–{VITAL_LIMITS.bloodPressureDiastolic.max} mmHg · FC{" "}
                {VITAL_LIMITS.heartRate.min}–{VITAL_LIMITS.heartRate.max} bpm · T° {VITAL_LIMITS.temperature.min}–
                {VITAL_LIMITS.temperature.max} °C · SpO₂ {VITAL_LIMITS.oxygenSaturation.min}–
                {VITAL_LIMITS.oxygenSaturation.max} % · Poids {VITAL_LIMITS.weight.min}–{VITAL_LIMITS.weight.max} kg
              </p>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">
                    <i className="ri-drop-line text-primary me-1"></i>Blood Pressure — Systolic (mmHg)
                  </label>
                  <Form.Control
                    type="number"
                    min={VITAL_LIMITS.bloodPressureSystolic.min}
                    max={VITAL_LIMITS.bloodPressureSystolic.max}
                    placeholder="e.g. 120"
                    value={form.vitals.bloodPressureSystolic}
                    isInvalid={!!vitalsErrors.bloodPressureSystolic}
                    onChange={(e) => handleVital("bloodPressureSystolic", e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid" className="d-block small">
                    {vitalsErrors.bloodPressureSystolic}
                  </Form.Control.Feedback>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Diastolic (mmHg)</label>
                  <Form.Control
                    type="number"
                    min={VITAL_LIMITS.bloodPressureDiastolic.min}
                    max={VITAL_LIMITS.bloodPressureDiastolic.max}
                    placeholder="e.g. 80"
                    value={form.vitals.bloodPressureDiastolic}
                    isInvalid={!!vitalsErrors.bloodPressureDiastolic}
                    onChange={(e) => handleVital("bloodPressureDiastolic", e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid" className="d-block small">
                    {vitalsErrors.bloodPressureDiastolic}
                  </Form.Control.Feedback>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">
                    <i className="ri-heart-line text-danger me-1"></i>Heart Rate (bpm)
                  </label>
                  <Form.Control
                    type="number"
                    min={VITAL_LIMITS.heartRate.min}
                    max={VITAL_LIMITS.heartRate.max}
                    placeholder="e.g. 75"
                    value={form.vitals.heartRate}
                    isInvalid={!!vitalsErrors.heartRate}
                    onChange={(e) => handleVital("heartRate", e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid" className="d-block small">
                    {vitalsErrors.heartRate}
                  </Form.Control.Feedback>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">
                    <i className="ri-temp-hot-line text-warning me-1"></i>Temperature (°C)
                  </label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min={VITAL_LIMITS.temperature.min}
                    max={VITAL_LIMITS.temperature.max}
                    placeholder="e.g. 37.0"
                    value={form.vitals.temperature}
                    isInvalid={!!vitalsErrors.temperature}
                    onChange={(e) => handleVital("temperature", e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid" className="d-block small">
                    {vitalsErrors.temperature}
                  </Form.Control.Feedback>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">
                    <i className="ri-lungs-line text-info me-1"></i>O₂ Saturation (%)
                  </label>
                  <Form.Control
                    type="number"
                    min={VITAL_LIMITS.oxygenSaturation.min}
                    max={VITAL_LIMITS.oxygenSaturation.max}
                    placeholder="e.g. 98"
                    value={form.vitals.oxygenSaturation}
                    isInvalid={!!vitalsErrors.oxygenSaturation}
                    onChange={(e) => handleVital("oxygenSaturation", e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid" className="d-block small">
                    {vitalsErrors.oxygenSaturation}
                  </Form.Control.Feedback>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">
                    <i className="ri-scales-3-line text-secondary me-1"></i>Weight (kg)
                  </label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min={VITAL_LIMITS.weight.min}
                    max={VITAL_LIMITS.weight.max}
                    placeholder="e.g. 72.5"
                    value={form.vitals.weight}
                    isInvalid={!!vitalsErrors.weight}
                    onChange={(e) => handleVital("weight", e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid" className="d-block small">
                    {vitalsErrors.weight}
                  </Form.Control.Feedback>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Symptoms */}
          {step === 1 && (
            <div>
              <p className="text-muted small mb-3">Select any symptoms you are experiencing today.</p>
              <div className="d-flex flex-wrap gap-2">
                {SYMPTOMS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`btn btn-sm d-inline-flex align-items-center gap-1 ${form.symptoms.includes(s) ? "btn-primary" : "btn-outline-secondary"}`}
                    style={{ borderRadius: 20 }}
                    onClick={() => toggleSymptom(s)}
                  >
                    {form.symptoms.includes(s) ? <i className="ri-check-line" aria-hidden /> : null}
                    {s}
                  </button>
                ))}
              </div>
              {form.symptoms.length === 0 && (
                <p className="text-muted small mt-3 mb-0">No symptoms? Great — click Next to continue.</p>
              )}
            </div>
          )}

          {/* Step 2: Wellbeing */}
          {step === 2 && (
            <div>
              <div className="mb-4">
                <label className="form-label fw-bold">How is your pain level today? <span className="text-primary">{form.painLevel}/10</span></label>
                <Form.Range min={0} max={10} value={form.painLevel}
                  onChange={(e) => setForm((f) => ({ ...f, painLevel: Number(e.target.value) }))} />
                <div className="d-flex justify-content-between">
                  <small className="text-muted">No pain</small>
                  <small className="text-danger">Worst pain</small>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">How are you feeling overall?</label>
                <div className="d-flex gap-2">
                  {MOODS.map((m) => (
                    <button key={m.value} type="button"
                      className={`btn flex-fill d-inline-flex align-items-center justify-content-center gap-1 ${form.mood === m.value ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setForm((f) => ({ ...f, mood: m.value }))}
                    >
                      <i className={m.icon} aria-hidden />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label fw-bold">Additional notes for your care team (optional)</label>
                <Form.Control as="textarea" rows={3} placeholder="Describe anything unusual about how you feel today..."
                  value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <p className="text-muted small mb-3">Review your check-in before submitting.</p>
              <div className="row g-2 mb-3">
                {form.vitals.heartRate && <div className="col-6"><div className="bg-light rounded p-2 small"><b>Heart Rate:</b> {form.vitals.heartRate} bpm</div></div>}
                {form.vitals.bloodPressureSystolic && <div className="col-6"><div className="bg-light rounded p-2 small"><b>Blood Pressure:</b> {form.vitals.bloodPressureSystolic}/{form.vitals.bloodPressureDiastolic} mmHg</div></div>}
                {form.vitals.temperature && <div className="col-6"><div className="bg-light rounded p-2 small"><b>Temperature:</b> {form.vitals.temperature} °C</div></div>}
                {form.vitals.oxygenSaturation && <div className="col-6"><div className="bg-light rounded p-2 small"><b>O₂ Saturation:</b> {form.vitals.oxygenSaturation}%</div></div>}
                {form.vitals.weight && <div className="col-6"><div className="bg-light rounded p-2 small"><b>Weight:</b> {form.vitals.weight} kg</div></div>}
              </div>
              {form.symptoms.length > 0 && (
                <div className="mb-2">
                  <b className="small">Symptoms:</b>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {form.symptoms.map((s) => <span key={s} className="badge bg-warning text-dark">{s}</span>)}
                  </div>
                </div>
              )}
              <div className="small mb-1"><b>Pain Level:</b> {form.painLevel}/10</div>
              <div className="small mb-1"><b>Mood:</b> {MOODS.find(m => m.value === form.mood)?.label}</div>
              {form.notes && <div className="small"><b>Notes:</b> {form.notes}</div>}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0">
          <button className="btn btn-outline-secondary" onClick={() => step > 0 ? setStep(s => s - 1) : setShow(false)}>
            {step > 0 ? "← Back" : "Cancel"}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={goNextStep}>
              Next →
            </button>
          ) : (
            <button className="btn btn-success d-inline-flex align-items-center gap-2" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <i className="ri-send-plane-fill" aria-hidden />
                  <span>Submit Check-in</span>
                </>
              )}
            </button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DailyCheckIn;
