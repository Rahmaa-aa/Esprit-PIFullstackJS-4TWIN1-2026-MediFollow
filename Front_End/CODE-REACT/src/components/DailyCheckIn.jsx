import React, { useState, useMemo, useCallback } from "react";
import { Modal, Form, ProgressBar } from "react-bootstrap";
import { useTranslation } from "react-i18next";
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

/** Icônes métier (pas de visages) : stable / équilibre / attention clinique — valeurs = clés i18n patientDashboard.mood* */
const MOOD_SPECS = [
  { value: "good", icon: "ri-shield-check-line", color: "#28a745" },
  { value: "fair", icon: "ri-scales-3-line", color: "#fd7e14" },
  { value: "poor", icon: "ri-first-aid-kit-line", color: "#dc3545" },
];

/** Plages autorisées (saisie) — valeurs extrêmes plausibles ; normes / seuils critiques : texte i18n + alertes ci-dessous */
const VITAL_LIMITS = {
  bloodPressureSystolic: { min: 40, max: 250, unit: "mmHg" },
  bloodPressureDiastolic: { min: 20, max: 180, unit: "mmHg" },
  heartRate: { min: 25, max: 250, unit: "bpm" },
  temperature: { min: 30, max: 45, unit: "°C" },
  oxygenSaturation: { min: 0, max: 100, unit: "%" },
  respiratoryRate: { min: 4, max: 60, unit: "/min" },
  weight: { min: 2, max: 400, unit: "kg" },
};

function parseVitalNumber(raw) {
  if (raw === "" || raw == null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function validateVitals(vitals, t) {
  const errors = {};
  Object.keys(VITAL_LIMITS).forEach((key) => {
    const raw = vitals[key];
    if (raw === "" || raw === null || raw === undefined) {
      errors[key] = t("dailyCheckIn.errorRequired");
      return;
    }
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

/** Seuils critiques (dictionnaire) — alertes informatives, ne bloquent pas la navigation */
function getVitalCriticalWarnings(vitals, t, lastRecordedWeightKg) {
  const w = [];
  const temp = parseVitalNumber(vitals.temperature);
  if (temp != null && (temp >= 38.5 || temp < 35)) w.push(t("dailyCheckIn.warnTempCritical"));

  const hr = parseVitalNumber(vitals.heartRate);
  if (hr != null && (hr < 50 || hr > 120)) w.push(t("dailyCheckIn.warnHrCritical"));

  const sys = parseVitalNumber(vitals.bloodPressureSystolic);
  const dia = parseVitalNumber(vitals.bloodPressureDiastolic);
  if (sys != null && dia != null) {
    if ((sys >= 180 && dia >= 120) || sys < 90 || dia < 60) w.push(t("dailyCheckIn.warnBpCritical"));
  } else {
    if (sys != null && (sys >= 180 || sys < 90)) w.push(t("dailyCheckIn.warnBpPartialSys"));
    if (dia != null && (dia >= 120 || dia < 60)) w.push(t("dailyCheckIn.warnBpPartialDia"));
  }

  const o2 = parseVitalNumber(vitals.oxygenSaturation);
  if (o2 != null && o2 < 90) w.push(t("dailyCheckIn.warnO2Critical"));
  else if (o2 != null && o2 < 95) w.push(t("dailyCheckIn.warnO2Low"));

  const rr = parseVitalNumber(vitals.respiratoryRate);
  if (rr != null && (rr > 30 || rr < 8)) w.push(t("dailyCheckIn.warnRrCritical"));

  const newW = parseVitalNumber(vitals.weight);
  const prevW = parseVitalNumber(lastRecordedWeightKg);
  if (newW != null && prevW != null && prevW > 0) {
    const delta = Math.abs(newW - prevW) / prevW;
    if (delta >= 0.05) w.push(t("dailyCheckIn.warnWeightRapid", { prev: prevW.toFixed(1), next: newW.toFixed(1) }));
  }

  return w;
}

const defaultSymptomStructured = () => ({
  fatigue: 0,
  chestPain: 0,
  shortBreath: 0,
  nausea: 0,
  feltFever: false,
  palpitations: false,
  cough: false,
  dizzinessConfusion: false,
});

const createDefaultForm = () => ({
  vitals: {
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    respiratoryRate: "",
    weight: "",
  },
  symptomStructured: defaultSymptomStructured(),
  painLevel: 0,
  mood: "good",
  notes: "",
});

const DailyCheckIn = ({ patientId, onSubmitted, existingLog, lastRecordedWeightKg }) => {
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
  const [form, setForm] = useState(() => createDefaultForm());
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

  const vitalCriticalWarnings = useMemo(
    () => getVitalCriticalWarnings(form.vitals, t, lastRecordedWeightKg),
    [form.vitals, t, lastRecordedWeightKg],
  );

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

      // ── SOS Geolocation: try to grab GPS if any vital is critical ──
      const isCritical =
        (cleanVitals.oxygenSaturation != null && cleanVitals.oxygenSaturation < 95) ||
        (cleanVitals.heartRate != null && (cleanVitals.heartRate > 120 || cleanVitals.heartRate < 50)) ||
        (cleanVitals.bloodPressureSystolic != null && (cleanVitals.bloodPressureSystolic >= 180 || cleanVitals.bloodPressureSystolic < 90)) ||
        (cleanVitals.temperature != null && (cleanVitals.temperature >= 38.5 || cleanVitals.temperature < 35));

      let location = undefined;
      if (isCritical && navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, enableHighAccuracy: true })
          );
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (geoErr) {
          console.warn("[DailyCheckIn] GPS unavailable:", geoErr.message);
          // Continue without location — SMS will say "Location: Not available"
        }
      }

      const ss = form.symptomStructured || {};
      const submitPayload = {
        patientId: pid,
        localDate: localDateString(),
        recordedAt: new Date().toISOString(),
        vitals: cleanVitals,
        symptomStructured: {
          fatigue: Math.min(5, Math.max(0, Number(ss.fatigue) || 0)),
          chestPain: Math.min(10, Math.max(0, Number(ss.chestPain) || 0)),
          shortBreath: Math.min(5, Math.max(0, Number(ss.shortBreath) || 0)),
          nausea: Math.min(5, Math.max(0, Number(ss.nausea) || 0)),
          feltFever: !!ss.feltFever,
          palpitations: !!ss.palpitations,
          cough: !!ss.cough,
          dizzinessConfusion: !!ss.dizzinessConfusion,
        },
        painLevel: form.painLevel,
        mood: form.mood,
        notes: form.notes,
      };
      if (location) submitPayload.location = location;

      await healthLogApi.submit(submitPayload);
      setSuccess(true);
      setShow(false);
      setStep(0);
      setForm(createDefaultForm());
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
              <p className="text-muted small mb-2" style={{ fontSize: "0.8rem" }}>
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
                  rrMin: VITAL_LIMITS.respiratoryRate.min,
                  rrMax: VITAL_LIMITS.respiratoryRate.max,
                  wMin: VITAL_LIMITS.weight.min,
                  wMax: VITAL_LIMITS.weight.max,
                })}
              </p>
              <p className="text-muted small mb-3" style={{ fontSize: "0.75rem" }}>
                {t("dailyCheckIn.dictionaryHint")}
              </p>
              {vitalCriticalWarnings.length > 0 && (
                <div className="alert alert-warning py-2 small mb-3" role="status">
                  <div className="fw-semibold mb-1">{t("dailyCheckIn.criticalAlertsTitle")}</div>
                  <ul className="mb-0 ps-3">
                    {vitalCriticalWarnings.map((msg, i) => (
                      <li key={`${i}-${msg}`}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                    <i className="ri-pulse-line text-success me-1"></i>{t("dailyCheckIn.labelRespiratory")}
                  </label>
                  <Form.Control
                    type="number"
                    min={VITAL_LIMITS.respiratoryRate.min}
                    max={VITAL_LIMITS.respiratoryRate.max}
                    placeholder={t("dailyCheckIn.phRespiratory")}
                    value={form.vitals.respiratoryRate}
                    isInvalid={!!vitalsErrors.respiratoryRate}
                    onChange={(e) => handleVital("respiratoryRate", e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid" className="d-block small">
                    {vitalsErrors.respiratoryRate}
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

          {/* Step 1: Symptoms — scores (int) + présence (bool), pas de texte libre pour l’analyse */}
          {step === 1 && (
            <div>
              <p className="text-muted small mb-3">{t("dailyCheckIn.symptomsIntroStructured")}</p>

              <div className="mb-4 pb-3 border-bottom">
                <h6 className="small text-uppercase text-muted mb-3">{t("dailyCheckIn.symptomGroupGeneral")}</h6>
                <label className="form-label small fw-bold">
                  {t("dailyCheckIn.sliderFatigue")} <span className="text-primary">{form.symptomStructured.fatigue}/5</span>
                </label>
                <Form.Range
                  min={0}
                  max={5}
                  value={form.symptomStructured.fatigue}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      symptomStructured: { ...f.symptomStructured, fatigue: Number(e.target.value) },
                    }))
                  }
                />
                <div className="d-flex justify-content-between mb-3">
                  <small className="text-muted">0</small>
                  <small className="text-muted">5</small>
                </div>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span className="small fw-bold">{t("dailyCheckIn.toggleFeltFever")}</span>
                  <Form.Check
                    type="switch"
                    id="feltFever"
                    checked={form.symptomStructured.feltFever}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        symptomStructured: { ...f.symptomStructured, feltFever: e.target.checked },
                      }))
                    }
                    label={form.symptomStructured.feltFever ? t("dailyCheckIn.boolTrue") : t("dailyCheckIn.boolFalse")}
                  />
                </div>
              </div>

              <div className="mb-4 pb-3 border-bottom">
                <h6 className="small text-uppercase text-muted mb-3">{t("dailyCheckIn.symptomGroupCardio")}</h6>
                <label className="form-label small fw-bold">
                  {t("dailyCheckIn.sliderChestPain")} <span className="text-primary">{form.symptomStructured.chestPain}/10</span>
                </label>
                <Form.Range
                  min={0}
                  max={10}
                  value={form.symptomStructured.chestPain}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      symptomStructured: { ...f.symptomStructured, chestPain: Number(e.target.value) },
                    }))
                  }
                />
                <div className="d-flex justify-content-between mb-3">
                  <small className="text-muted">0</small>
                  <small className="text-muted">10</small>
                </div>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span className="small fw-bold">{t("dailyCheckIn.togglePalpitations")}</span>
                  <Form.Check
                    type="switch"
                    id="palpitations"
                    checked={form.symptomStructured.palpitations}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        symptomStructured: { ...f.symptomStructured, palpitations: e.target.checked },
                      }))
                    }
                    label={form.symptomStructured.palpitations ? t("dailyCheckIn.boolTrue") : t("dailyCheckIn.boolFalse")}
                  />
                </div>
              </div>

              <div className="mb-4 pb-3 border-bottom">
                <h6 className="small text-uppercase text-muted mb-3">{t("dailyCheckIn.symptomGroupResp")}</h6>
                <label className="form-label small fw-bold">
                  {t("dailyCheckIn.sliderShortBreath")} <span className="text-primary">{form.symptomStructured.shortBreath}/5</span>
                </label>
                <Form.Range
                  min={0}
                  max={5}
                  value={form.symptomStructured.shortBreath}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      symptomStructured: { ...f.symptomStructured, shortBreath: Number(e.target.value) },
                    }))
                  }
                />
                <div className="d-flex justify-content-between mb-3">
                  <small className="text-muted">0</small>
                  <small className="text-muted">5</small>
                </div>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span className="small fw-bold">{t("dailyCheckIn.toggleCough")}</span>
                  <Form.Check
                    type="switch"
                    id="cough"
                    checked={form.symptomStructured.cough}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        symptomStructured: { ...f.symptomStructured, cough: e.target.checked },
                      }))
                    }
                    label={form.symptomStructured.cough ? t("dailyCheckIn.boolTrue") : t("dailyCheckIn.boolFalse")}
                  />
                </div>
              </div>

              <div className="mb-2">
                <h6 className="small text-uppercase text-muted mb-3">{t("dailyCheckIn.symptomGroupNeuro")}</h6>
                <label className="form-label small fw-bold">
                  {t("dailyCheckIn.sliderNausea")} <span className="text-primary">{form.symptomStructured.nausea}/5</span>
                </label>
                <Form.Range
                  min={0}
                  max={5}
                  value={form.symptomStructured.nausea}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      symptomStructured: { ...f.symptomStructured, nausea: Number(e.target.value) },
                    }))
                  }
                />
                <div className="d-flex justify-content-between mb-3">
                  <small className="text-muted">0</small>
                  <small className="text-muted">5</small>
                </div>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span className="small fw-bold">{t("dailyCheckIn.toggleDizziness")}</span>
                  <Form.Check
                    type="switch"
                    id="dizzinessConfusion"
                    checked={form.symptomStructured.dizzinessConfusion}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        symptomStructured: { ...f.symptomStructured, dizzinessConfusion: e.target.checked },
                      }))
                    }
                    label={form.symptomStructured.dizzinessConfusion ? t("dailyCheckIn.boolTrue") : t("dailyCheckIn.boolFalse")}
                  />
                </div>
              </div>

              <p className="text-muted small mt-3 mb-0">{t("dailyCheckIn.symptomsStructuredFooter")}</p>
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
                {form.vitals.respiratoryRate && <div className="col-6"><div className="bg-light rounded p-2 small"><b>{t("dailyCheckIn.reviewRespiratory")}</b> {form.vitals.respiratoryRate} /min</div></div>}
                {form.vitals.weight && <div className="col-6"><div className="bg-light rounded p-2 small"><b>{t("dailyCheckIn.reviewWeight")}</b> {form.vitals.weight} kg</div></div>}
              </div>
              <div className="mb-2 small">
                <b>{t("dailyCheckIn.reviewSymptomsStructured")}</b>
                <ul className="mb-0 mt-1 ps-3">
                  <li>{t("dailyCheckIn.reviewLineFatigue", { n: form.symptomStructured.fatigue })}</li>
                  <li>{t("dailyCheckIn.reviewLineFeltFever", { on: form.symptomStructured.feltFever ? t("dailyCheckIn.boolTrue") : t("dailyCheckIn.boolFalse") })}</li>
                  <li>{t("dailyCheckIn.reviewLineChestPain", { n: form.symptomStructured.chestPain })}</li>
                  <li>{t("dailyCheckIn.reviewLinePalpitations", { on: form.symptomStructured.palpitations ? t("dailyCheckIn.boolTrue") : t("dailyCheckIn.boolFalse") })}</li>
                  <li>{t("dailyCheckIn.reviewLineShortBreath", { n: form.symptomStructured.shortBreath })}</li>
                  <li>{t("dailyCheckIn.reviewLineCough", { on: form.symptomStructured.cough ? t("dailyCheckIn.boolTrue") : t("dailyCheckIn.boolFalse") })}</li>
                  <li>{t("dailyCheckIn.reviewLineNausea", { n: form.symptomStructured.nausea })}</li>
                  <li>{t("dailyCheckIn.reviewLineDizziness", { on: form.symptomStructured.dizzinessConfusion ? t("dailyCheckIn.boolTrue") : t("dailyCheckIn.boolFalse") })}</li>
                </ul>
              </div>
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
