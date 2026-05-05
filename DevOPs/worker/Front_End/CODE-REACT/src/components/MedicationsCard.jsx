import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, Form, Alert, Button } from "react-bootstrap";
import { medicationApi } from "../services/api";
import { useMedicationReminders } from "../hooks/useMedicationReminders";
import {
  localDateStringYMD,
  canMarkMedicationForDate,
  getReminderSlotsForFrequency,
  isSlotTaken,
  remainingSlotsToday,
  getSlotRecordedAtIso,
  formatSlotTimeLocal,
} from "../utils/medicationReminders";
import { formatMedicationFrequencyDisplay } from "../utils/medicationFrequencyLabel";

const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "Weekly", "As needed"];

const MedicationsCard = ({ patientId, medications: initialMeds, onUpdate, allowAdd = true, showHistoryLink = true }) => {
  const { t } = useTranslation();
  const [meds, setMeds] = useState(initialMeds || []);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "Once daily",
    prescribedBy: "",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [toggleError, setToggleError] = useState("");
  const [notifHint, setNotifHint] = useState(() =>
    typeof Notification !== "undefined" ? Notification.permission : "denied",
  );

  useEffect(() => {
    setMeds(initialMeds || []);
  }, [initialMeds]);

  useMedicationReminders(meds);

  const todayStr = useCallback(() => localDateStringYMD(), []);

  const requestNotif = async () => {
    try {
      const p = await Notification.requestPermission();
      setNotifHint(p);
    } catch {
      setNotifHint("denied");
    }
  };

  const toggle = async (id, slotIndex) => {
    setToggleError("");
    const dateStr = todayStr();
    const med = meds.find((m) => m._id === id);
    if (med && !canMarkMedicationForDate(med, dateStr)) {
      setToggleError("Vous ne pouvez pas enregistrer ce médicament pour cette date.");
      return;
    }
    try {
      await medicationApi.toggleTaken(id, dateStr, slotIndex, new Date().toISOString());
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("patient-medications-updated"));
      }
      if (onUpdate) onUpdate();
    } catch (e) {
      setToggleError(e.message || "Action impossible");
      console.error(e);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newMed = await medicationApi.create({ ...form, patientId });
      setMeds((prev) => [
        { ...newMed, takenSlotKeys: newMed.takenSlotKeys || [], takenSlotTimes: newMed.takenSlotTimes || {}, takenDates: [] },
        ...prev,
      ]);
      setShowAdd(false);
      setForm({
        name: "",
        dosage: "",
        frequency: "Once daily",
        prescribedBy: "",
        startDate: "",
        endDate: "",
        notes: "",
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("patient-medications-updated"));
      }
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = meds.reduce((acc, m) => {
    const d = todayStr();
    if (!canMarkMedicationForDate(m, d)) return acc;
    return acc + remainingSlotsToday(m, d);
  }, 0);

  return (
    <>
      <div id="patient-medications" className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="text-primary fw-bold mb-0">
              <i className="ri-capsule-line me-2"></i>{t("patientCards.medications.title")}
            </h6>
            <div className="d-flex align-items-center gap-2">
              {pendingCount > 0 && (
                <span className="badge bg-warning text-dark">{t("patientCards.medications.toTake", { count: pendingCount })}</span>
              )}
              {allowAdd && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  style={{ borderRadius: 20 }}
                  onClick={() => setShowAdd(true)}
                >
                  <i className="ri-add-line"></i>
                </button>
              )}
            </div>
          </div>
          {showHistoryLink && (
            <div className="mb-3">
              <Link to="/dashboard-pages/patient-medication-history" className="small text-decoration-none">
                <i className="ri-history-line me-1"></i>
                {t("patientCards.medications.historyFinished")}
              </Link>
            </div>
          )}

          {typeof Notification !== "undefined" && notifHint !== "granted" && meds.length > 0 && (
            <Alert variant="info" className="py-2 px-3 small mb-3">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <span>Rappels selon la fréquence prescrite (navigateur ouvert).</span>
                {notifHint === "default" && (
                  <Button type="button" size="sm" variant="primary" onClick={requestNotif}>
                    Activer les notifications
                  </Button>
                )}
              </div>
            </Alert>
          )}

          {toggleError && (
            <Alert variant="danger" className="py-2 small mb-2" dismissible onClose={() => setToggleError("")}>
              {toggleError}
            </Alert>
          )}

          {meds.length === 0 ? (
            <p className="text-muted small text-center mb-0 py-2">No medications added yet.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {meds.map((m) => {
                const ds = todayStr();
                const canMark = canMarkMedicationForDate(m, ds);
                const slots = getReminderSlotsForFrequency(m.frequency);
                const allDone =
                  slots.length > 0 && slots.every((_, idx) => isSlotTaken(m, ds, idx));
                return (
                  <div
                    key={m._id}
                    className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-2 p-2 rounded-3"
                    style={{
                      backgroundColor: allDone ? "#f0fdf4" : "#fffbeb",
                      border: `1px solid ${allDone ? "#bbf7d0" : "#fde68a"}`,
                    }}
                  >
                    <div className="flex-grow-1">
                      <div className="fw-bold small">{m.name}</div>
                      <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                        {m.dosage && <span className="me-2">{m.dosage}</span>}
                        <span>{formatMedicationFrequencyDisplay(m.frequency, t)}</span>
                        {m.prescribedBy && <span className="ms-2 text-primary">Dr. {m.prescribedBy}</span>}
                        {m.startDate && (
                          <span className="ms-1 d-block text-muted">
                            Du {m.startDate}
                            {m.endDate ? ` au ${m.endDate}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="d-flex flex-wrap gap-1 justify-content-sm-end align-items-center">
                      {slots.length === 0 ? (
                        <span className="small text-muted">Si besoin — pas de créneau</span>
                      ) : (
                        slots.map((slot, idx) => {
                          const taken = isSlotTaken(m, ds, idx);
                          const label = slot.label || `Prise ${idx + 1}`;
                          const timeIso = taken ? getSlotRecordedAtIso(m, ds, idx) : null;
                          const timeStr = timeIso ? formatSlotTimeLocal(timeIso) : "";
                          return (
                            <button
                              key={`${m._id}-${idx}`}
                              type="button"
                              className={`btn btn-sm ${taken ? "btn-success" : "btn-outline-warning"}`}
                              style={{ borderRadius: 20, fontSize: "0.7rem", textAlign: "center" }}
                              disabled={!canMark}
                              title={
                                !canMark
                                  ? "Non disponible avant la date de début ou après la date de fin."
                                  : taken
                                    ? "Appuyer pour annuler"
                                    : `Marquer : ${label}`
                              }
                              onClick={() => toggle(m._id, idx)}
                            >
                              <span className="d-inline-flex align-items-center justify-content-center gap-1" style={{ whiteSpace: "nowrap" }}>
                                {taken ? <i className="ri-capsule-fill" aria-hidden /> : null}
                                {label}
                              </span>
                              {timeStr ? (
                                <span className="d-block" style={{ fontSize: "0.62rem", opacity: 0.95 }}>
                                  {timeStr}
                                </span>
                              ) : null}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal show={allowAdd && showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-primary fs-6">
            <i className="ri-capsule-line me-2"></i>Add Medication
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAdd}>
            <div className="row g-2">
              <div className="col-12">
                <Form.Label className="small fw-bold">Medication Name *</Form.Label>
                <Form.Control
                  size="sm"
                  required
                  placeholder="e.g. Metoprolol"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">Dosage</Form.Label>
                <Form.Control
                  size="sm"
                  placeholder="e.g. 50mg"
                  value={form.dosage}
                  onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))}
                />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">Frequency</Form.Label>
                <Form.Select size="sm" value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}>
                  {FREQUENCIES.map((fr) => (
                    <option key={fr}>{fr}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-12">
                <Form.Label className="small fw-bold">Prescribed By</Form.Label>
                <Form.Control
                  size="sm"
                  placeholder="Doctor name"
                  value={form.prescribedBy}
                  onChange={(e) => setForm((f) => ({ ...f, prescribedBy: e.target.value }))}
                />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">End Date</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <Form.Label className="small fw-bold">Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size="sm"
                  placeholder="Take with food..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Add Medication"}
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MedicationsCard;
