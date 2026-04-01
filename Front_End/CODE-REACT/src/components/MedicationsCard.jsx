import React, { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";

const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "Weekly", "As needed"];

const MedicationsCard = ({ patientId, medications: initialMeds, onUpdate }) => {
  const [meds, setMeds] = useState(initialMeds || []);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "Once daily", prescribedBy: "", startDate: "", endDate: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMeds(initialMeds || []); }, [initialMeds]);

  const toggle = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/medications/${id}/toggle-taken`, { method: "PUT" });
      const data = await res.json();
      setMeds(prev => prev.map(m => m._id === id ? { ...m, takenToday: data.takenToday } : m));
    } catch (e) { console.error(e); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/medications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, patientId }),
      });
      const newMed = await res.json();
      setMeds(prev => [{ ...newMed, takenToday: false }, ...prev]);
      setShowAdd(false);
      setForm({ name: "", dosage: "", frequency: "Once daily", prescribedBy: "", startDate: "", endDate: "", notes: "" });
      if (onUpdate) onUpdate();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const today = meds.filter(m => !m.takenToday).length;

  return (
    <>
      <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="text-primary fw-bold mb-0"><i className="ri-capsule-line me-2"></i>Medications</h6>
            <div className="d-flex align-items-center gap-2">
              {today > 0 && <span className="badge bg-warning text-dark">{today} to take</span>}
              <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 20 }} onClick={() => setShowAdd(true)}>
                <i className="ri-add-line"></i>
              </button>
            </div>
          </div>

          {meds.length === 0 ? (
            <p className="text-muted small text-center mb-0 py-2">No medications added yet.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {meds.map(m => (
                <div key={m._id} className="d-flex align-items-center justify-content-between p-2 rounded-3"
                  style={{ backgroundColor: m.takenToday ? "#f0fdf4" : "#fffbeb", border: `1px solid ${m.takenToday ? "#bbf7d0" : "#fde68a"}` }}>
                  <div>
                    <div className="fw-bold small">{m.name}</div>
                    <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                      {m.dosage && <span className="me-2">{m.dosage}</span>}
                      <span>{m.frequency}</span>
                      {m.prescribedBy && <span className="ms-2 text-primary">Dr. {m.prescribedBy}</span>}
                    </div>
                  </div>
                  <button
                    className={`btn btn-sm ${m.takenToday ? "btn-success" : "btn-outline-warning"}`}
                    style={{ borderRadius: 20, fontSize: "0.72rem", whiteSpace: "nowrap" }}
                    onClick={() => toggle(m._id)}
                  >
                    {m.takenToday ? "✓ Taken" : "Mark taken"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Medication Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-primary fs-6"><i className="ri-capsule-line me-2"></i>Add Medication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAdd}>
            <div className="row g-2">
              <div className="col-12">
                <Form.Label className="small fw-bold">Medication Name *</Form.Label>
                <Form.Control size="sm" required placeholder="e.g. Metoprolol" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">Dosage</Form.Label>
                <Form.Control size="sm" placeholder="e.g. 50mg" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">Frequency</Form.Label>
                <Form.Select size="sm" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                  {FREQUENCIES.map(fr => <option key={fr}>{fr}</option>)}
                </Form.Select>
              </div>
              <div className="col-12">
                <Form.Label className="small fw-bold">Prescribed By</Form.Label>
                <Form.Control size="sm" placeholder="Doctor name" value={form.prescribedBy} onChange={e => setForm(f => ({ ...f, prescribedBy: e.target.value }))} />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">Start Date</Form.Label>
                <Form.Control type="date" size="sm" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">End Date</Form.Label>
                <Form.Control type="date" size="sm" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
              <div className="col-12">
                <Form.Label className="small fw-bold">Notes</Form.Label>
                <Form.Control as="textarea" rows={2} size="sm" placeholder="Take with food..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>{saving ? "Saving..." : "Add Medication"}</button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MedicationsCard;
