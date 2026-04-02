import React, { useState, useMemo, useCallback } from "react";
import { Modal, Form, ProgressBar } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { healthLogApi } from "../services/api";
import { SYMPTOM_IDS, translateSymptom } from "../utils/symptomLabels";

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

/** Icônes métier (pas de visages) : stable / équilibre / attention clinique — valeurs = clés i18n patientDashboard.mood* */
const MOOD_SPECS = [
  { value: "good", icon: "ri-shield-check-line", color: "#28a745" },
  { value: "fair", icon: "ri-scales-3-line", color: "#fd7e14" },
  { value: "poor", icon: "ri-first-aid-kit-line", color: "#dc3545" },
];

/** Plages autorisées (valeurs extrêmes mais plausibles) — contrôle min/max côté client */
const VITAL_LIMITS = {
  bloodPressureSystolic: { min: 40, max: 250, unit: "mmHg" },
  bloodPressureDiastolic: { min: 20, max: 180, unit: "mmHg" },
  heartRate: { min: 25, max: 250, unit: "bpm" },
  temperature: { min: 30, max: 45, unit: "°C" },
  oxygenSaturation: { min: 0, max: 100, unit: "%" },
  weight: { min: 2, max: 400, unit: "kg" },
};

function validateVitals(vitals, t) {
  const errors = {};
  Object.entries(vitals).forEach(([key, raw]) => {
    if (raw === "" || raw === null || raw === undefined) return;
    const n = Number(raw);
    if (Number.isNaN(n)) {
      errors[key] = t("dailyCheckIn.errorInvalidNumber");
      return;
    }
    const lim = VITAL_LIMITS[key];
    if (!lim) return;
    if (n < lim.min) {
      errors[key] = t("dailyCheckIn.errorMin", { min: lim.min, unit: lim.unit });
    } else if (n > lim.max) {
      errors[key] = t("dailyCheckIn.errorMax", { max: lim.max, unit: lim.unit });
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
  const { t, i18n } = useTranslation();

  const timeLocale = useMemo(() => {
    const l = (i18n.language || "en").split("-")[0];
    if (l === "ar") return "ar";
    if (l === "fr") return "fr-FR";
    return "en-US";
  }, [i18n.language]);

  const STEPS = useMemo(
    () => [
      t("dailyCheckIn.stepVitals"),
      t("dailyCheckIn.stepSymptoms"),
      t("dailyCheckIn.stepWellbeing"),
      t("dailyCheckIn.stepReview"),
    ],
    [t],
  );

  const moodsWithLabels = useMemo(
    () =>
      MOOD_SPECS.map((m) => ({
        ...m,
        label:
          m.value === "good"
            ? t("patientDashboard.moodGood")
            : m.value === "fair"
              ? t("patientDashboard.moodFair")
              : t("patientDashboard.moodPoor"),
      })),
    [t],
  );

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
      const errs = validateVitals(form.vitals, t);
      if (Object.keys(errs).length > 0) {
        setVitalsErrors(errs);
        return;
      }
      setVitalsErrors({});
    }
    setStep((s) => s + 1);
  };

  const toggleSymptom = (id) =>
    setForm((f) => ({
      ...f,
      symptoms: f.symptoms.includes(id) ? f.symptoms.filter((x) => x !== id) : [...f.symptoms, id],
    }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const vitalErrs = validateVitals(form.vitals, t);
    if (Object.keys(vitalErrs).length > 0) {
      setVitalsErrors(vitalErrs);
      setStep(0);
      setError(t("dailyCheckIn.errorFixVitals"));
      setLoading(false);
      return;
    }
    try {
      const pid = normalizePatientId(patientId);
      if (!pid) {
        setError(t("dailyCheckIn.errorSession"));
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
      setError(e.message || t("dailyCheckIn.errorSubmit"));
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (step / (STEPS.length - 1)) * 100;

  const formatCheckInTime = useCallback(
    (log) => {
      const raw = log?.recordedAt || log?.createdAt;
      if (!raw) return "";
      return new Date(raw).toLocaleTimeString(timeLocale, { hour: "2-digit", minute: "2-digit" });
    },
    [timeLocale],
  );

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
              <i className="ri-heart-pulse-line me-2"></i>{t("dailyCheckIn.title")}
            </h6>
            <span className={`badge d-inline-flex align-items-center gap-1 ${alreadyDone || success ? "bg-success" : "bg-warning text-dark"}`}>
              {alreadyDone || success ? (
                <>
                  <i className="ri-checkbox-circle-line" aria-hidden />
                  <span>{t("dailyCheckIn.badgeDone")}</span>
                </>
              ) : (
                <>
                  <i className="ri-time-line" aria-hidden />
                  <span>{t("dailyCheckIn.badgePending")}</span>
                </>
              )}
            </span>
          </div>

          {alreadyDone || success ? (
            <div>
              <p className="text-muted small mb-2">
                {existingLog
                  ? t("dailyCheckIn.lastCheckInAt", { time: formatCheckInTime(existingLog) })
                  : t("dailyCheckIn.completedToday")}
              </p>
              {existingLog && (
                <div className="row g-2 text-center">
                  {existingLog.vitals?.heartRate && (
                    <div className="col-4">
                      <div className="bg-light rounded p-2">
                        <i className="ri-heart-line text-danger"></i>
                        <div className="fw-bold small">{existingLog.vitals.heartRate} bpm</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>{t("dailyCheckIn.heartRateShort")}</div>
                      </div>
                    </div>
                  )}
                  {existingLog.vitals?.bloodPressureSystolic && (
                    <div className="col-4">
                      <div className="bg-light rounded p-2">
                        <i className="ri-drop-line text-primary"></i>
                        <div className="fw-bold small">{existingLog.vitals.bloodPressureSystolic}/{existingLog.vitals.bloodPressureDiastolic}</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>{t("dailyCheckIn.bloodPressureShort")}</div>
                      </div>
                    </div>
                  )}
                  {existingLog.vitals?.oxygenSaturation && (
                    <div className="col-4">
                      <div className="bg-light rounded p-2">
                        <i className="ri-lungs-line text-info"></i>
                        <div className="fw-bold small">{existingLog.vitals.oxygenSaturation}%</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>{t("dailyCheckIn.oxygenShort")}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {existingLog?.flagged && (
                <div className="alert alert-danger py-2 mt-2 small mb-0">
                  <i className="ri-alert-line me-1"></i>
                  {t("dailyCheckIn.flaggedAlert")}
                </div>
              )}
              <button className="btn btn-sm btn-outline-primary mt-2 w-100" onClick={() => setShow(true)}>
                <i className="ri-add-line me-1"></i>
                {t("dailyCheckIn.addAnother")}
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-muted small mb-3">
                {t("dailyCheckIn.emptyPrompt")}
              </p>
              <button className="btn btn-primary w-100" onClick={() => setShow(true)}>
                <i className="ri-stethoscope-line me-2"></i>{t("dailyCheckIn.startCheckIn")}
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
            <i className="ri-heart-pulse-line me-2"></i>{t("dailyCheckIn.title")}
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
              <p className="text-muted small mb-3">{t("dailyCheckIn.enterVitals")}</p>
              <p className="text-muted small mb-3" style={{ fontSize: "0.8rem" }}>
                {t("dailyCheckIn.allowedRanges", {
                  sysMin: VITAL_LIMITS.bloodPressureSystolic.min,
                  sysMax: VITAL_LIMITS.bloodPressureSystolic.max,
                  diaMin: VITAL_LIMITS.bloodPressureDiastolic.min,
                  diaMax: VITAL_LIMITS.bloodPressureDiastolic.max,
                  hrMin: VITAL_LIMITS.heartRate.min,
                  hrMax: VITAL_LIMITS.heartRate.max,
                  tempMin: VITAL_LIMITS.temperature.min,
                  tempMax: VITAL_LIMITS.temperature.max,
                  o2Min: VITAL_LIMITS.oxygenSaturation.min,
                  o2Max: VITAL_LIMITS.oxygenSaturation.max,
                  wMin: VITAL_LIMITS.weight.min,
                  wMax: VITAL_LIMITS.weight.max,
                })}
              </p>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">
                    <i className="ri-drop-line text-primary me-1"></i>{t("dailyCheckIn.bpSystolic")}
                  </label>
                  <Form.Control
                    type="number"
                    min={VITAL_LIMITS.bloodPressureSystolic.min}
                    max={VITAL_LIMITS.bloodPressureSystolic.max}
                    placeholder={t("dailyCheckIn.phSystolic")}
                    value={form.vitals.bloodPressureSystolic}
                    isInvalid={!!vitalsErrors.bloodPressureSystolic}
                    onChange={(e) => handleVital("bloodPressureSystolic", e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid" className="d-block small">
                    {vitalsErrors.bloodPressureSystolic}
                  </Form.Control.Feedback>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">{t("dailyCheckIn.bpDiastolic")}</label>
                  <Form.Control
                    type="number"
                    min={VITAL_LIMITS.bloodPressureDiastolic.min}
                    max={VITAL_LIMITS.bloodPressureDiastolic.max}
                    placeholder={t("dailyCheckIn.phDiastolic")}
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
                    <i className="ri-heart-line text-danger me-1"></i>{t("dailyCheckIn.labelHeartRate")}
                  </label>
                  <Form.Control
                    type="number"
                    min={VITAL_LIMITS.heartRate.min}
                    max={VITAL_LIMITS.heartRate.max}
                    placeholder={t("dailyCheckIn.phHeartRate")}
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
                    <i className="ri-temp-hot-line text-warning me-1"></i>{t("dailyCheckIn.labelTemperature")}
                  </label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min={VITAL_LIMITS.temperature.min}
                    max={VITAL_LIMITS.temperature.max}
                    placeholder={t("dailyCheckIn.phTemp")}
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
                    <i className="ri-lungs-line text-info me-1"></i>{t("dailyCheckIn.labelOxygen")}
                  </label>
                  <Form.Control
                    type="number"
                    min={VITAL_LIMITS.oxygenSaturation.min}
                    max={VITAL_LIMITS.oxygenSaturation.max}
                    placeholder={t("dailyCheckIn.phO2")}
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
                    <i className="ri-scales-3-line text-secondary me-1"></i>{t("dailyCheckIn.labelWeight")}
                  </label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min={VITAL_LIMITS.weight.min}
                    max={VITAL_LIMITS.weight.max}
                    placeholder={t("dailyCheckIn.phWeight")}
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
              <p className="text-muted small mb-3">{t("dailyCheckIn.symptomsIntro")}</p>
              <div className="d-flex flex-wrap gap-2">
                {SYMPTOM_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`btn btn-sm d-inline-flex align-items-center gap-1 ${form.symptoms.includes(id) ? "btn-primary" : "btn-outline-secondary"}`}
                    style={{ borderRadius: 20 }}
                    onClick={() => toggleSymptom(id)}
                  >
                    {form.symptoms.includes(id) ? <i className="ri-check-line" aria-hidden /> : null}
                    {translateSymptom(id, t)}
                  </button>
                ))}
              </div>
              {form.symptoms.length === 0 && (
                <p className="text-muted small mt-3 mb-0">{t("dailyCheckIn.symptomsNone")}</p>
              )}
            </div>
          )}

          {/* Step 2: Wellbeing */}
          {step === 2 && (
            <div>
              <div className="mb-4">
                <label className="form-label fw-bold">{t("dailyCheckIn.painQuestion")} <span className="text-primary">{form.painLevel}/10</span></label>
                <Form.Range min={0} max={10} value={form.painLevel}
                  onChange={(e) => setForm((f) => ({ ...f, painLevel: Number(e.target.value) }))} />
                <div className="d-flex justify-content-between">
                  <small className="text-muted">{t("dailyCheckIn.painNone")}</small>
                  <small className="text-danger">{t("dailyCheckIn.painWorst")}</small>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">{t("dailyCheckIn.moodQuestion")}</label>
                <div className="d-flex gap-2">
                  {moodsWithLabels.map((m) => (
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
                <label className="form-label fw-bold">{t("dailyCheckIn.notesLabel")}</label>
                <Form.Control as="textarea" rows={3} placeholder={t("dailyCheckIn.notesPlaceholder")}
                  value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <p className="text-muted small mb-3">{t("dailyCheckIn.reviewIntro")}</p>
              <div className="row g-2 mb-3">
                {form.vitals.heartRate && <div className="col-6"><div className="bg-light rounded p-2 small"><b>{t("dailyCheckIn.reviewHeartRate")}</b> {form.vitals.heartRate} bpm</div></div>}
                {form.vitals.bloodPressureSystolic && <div className="col-6"><div className="bg-light rounded p-2 small"><b>{t("dailyCheckIn.reviewBP")}</b> {form.vitals.bloodPressureSystolic}/{form.vitals.bloodPressureDiastolic} mmHg</div></div>}
                {form.vitals.temperature && <div className="col-6"><div className="bg-light rounded p-2 small"><b>{t("dailyCheckIn.reviewTemp")}</b> {form.vitals.temperature} °C</div></div>}
                {form.vitals.oxygenSaturation && <div className="col-6"><div className="bg-light rounded p-2 small"><b>{t("dailyCheckIn.reviewO2")}</b> {form.vitals.oxygenSaturation}%</div></div>}
                {form.vitals.weight && <div className="col-6"><div className="bg-light rounded p-2 small"><b>{t("dailyCheckIn.reviewWeight")}</b> {form.vitals.weight} kg</div></div>}
              </div>
              {form.symptoms.length > 0 && (
                <div className="mb-2">
                  <b className="small">{t("dailyCheckIn.reviewSymptoms")}</b>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {form.symptoms.map((s) => <span key={s} className="badge bg-warning text-dark">{translateSymptom(s, t)}</span>)}
                  </div>
                </div>
              )}
              <div className="small mb-1"><b>{t("dailyCheckIn.reviewPain")}</b> {form.painLevel}/10</div>
              <div className="small mb-1"><b>{t("dailyCheckIn.reviewMood")}</b> {moodsWithLabels.find((m) => m.value === form.mood)?.label}</div>
              {form.notes && <div className="small"><b>{t("dailyCheckIn.reviewNotes")}</b> {form.notes}</div>}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0">
          <button className="btn btn-outline-secondary" onClick={() => step > 0 ? setStep(s => s - 1) : setShow(false)}>
            {step > 0 ? t("dailyCheckIn.back") : t("dailyCheckIn.cancel")}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={goNextStep}>
              {t("dailyCheckIn.next")}
            </button>
          ) : (
            <button className="btn btn-success d-inline-flex align-items-center gap-2" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                t("dailyCheckIn.submitting")
              ) : (
                <>
                  <i className="ri-send-plane-fill" aria-hidden />
                  <span>{t("dailyCheckIn.submit")}</span>
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
