import React, { useState } from "react";
import { Modal, Form } from "react-bootstrap";

const TYPES = ["checkup", "lab", "specialist", "imaging", "physiotherapy"];
const TYPE_COLORS = { checkup: "#089bab", lab: "#6f42c1", specialist: "#fd7e14", imaging: "#dc3545", physiotherapy: "#28a745" };

const daysUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const AppointmentsCard = ({ patientId, appointments: initialAppts, onUpdate }) => {
  const [appts, setAppts] = useState(initialAppts || []);
  const [showAdd, setShowAdd] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", location: "", type: "checkup", doctorName: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const upcoming = appts
    .filter(a => a.status !== "cancelled" && new Date(a.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const displayed = showAll ? upcoming : upcoming.slice(0, 3);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, patientId }),
      });
      const newAppt = await res.json();
      setAppts(prev => [...prev, newAppt].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowAdd(false);
      setForm({ title: "", date: "", time: "", location: "", type: "checkup", doctorName: "", notes: "" });
      if (onUpdate) onUpdate();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  return (
    <>
      <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="text-primary fw-bold mb-0"><i className="ri-calendar-event-line me-2"></i>Appointments</h6>
            <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 20 }} onClick={() => setShowAdd(true)}>
              <i className="ri-add-line"></i>
            </button>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-muted small text-center mb-0 py-2">No upcoming appointments.</p>
          ) : (
            <>
              <div className="d-flex flex-column gap-2">
                {displayed.map(a => {
                  const days = daysUntil(a.date);
                  const color = TYPE_COLORS[a.type] || "#089bab";
                  return (
                    <div key={a._id} className="d-flex align-items-start gap-3 p-2 rounded-3" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
                      {/* Date block */}
                      <div className="text-center rounded-2 p-2 flex-shrink-0" style={{ backgroundColor: color, minWidth: 48 }}>
                        <div className="text-white fw-bold" style={{ fontSize: "1.1rem", lineHeight: 1 }}>
                          {new Date(a.date).getDate()}
                        </div>
                        <div className="text-white" style={{ fontSize: "0.65rem", opacity: 0.9 }}>
                          {new Date(a.date).toLocaleString('en', { month: 'short' }).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="fw-bold small text-truncate">{a.title}</div>
                        <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                          {a.time && <span className="me-2"><i className="ri-time-line me-1"></i>{a.time}</span>}
                          {a.location && <span><i className="ri-map-pin-line me-1"></i>{a.location}</span>}
                        </div>
                        {a.doctorName && <div className="text-primary" style={{ fontSize: "0.72rem" }}>Dr. {a.doctorName}</div>}
                      </div>
                      <div className="text-end flex-shrink-0">
                        <span className="badge" style={{ backgroundColor: color, fontSize: "0.65rem" }}>{a.type}</span>
                        <div className="text-muted mt-1" style={{ fontSize: "0.65rem" }}>
                          {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days}d`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {upcoming.length > 3 && (
                <button className="btn btn-sm btn-link text-primary p-0 mt-2" onClick={() => setShowAll(!showAll)}>
                  {showAll ? "Show less" : `Show all ${upcoming.length}`}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-primary fs-6"><i className="ri-calendar-event-line me-2"></i>Add Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAdd}>
            <div className="row g-2">
              <div className="col-12">
                <Form.Label className="small fw-bold">Title *</Form.Label>
                <Form.Control size="sm" required placeholder="e.g. Cardiology Follow-up" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">Date *</Form.Label>
                <Form.Control type="date" size="sm" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">Time</Form.Label>
                <Form.Control type="time" size="sm" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">Type</Form.Label>
                <Form.Select size="sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </Form.Select>
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold">Doctor Name</Form.Label>
                <Form.Control size="sm" placeholder="Doctor name" value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))} />
              </div>
              <div className="col-12">
                <Form.Label className="small fw-bold">Location</Form.Label>
                <Form.Control size="sm" placeholder="Room / Building" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="col-12">
                <Form.Label className="small fw-bold">Notes</Form.Label>
                <Form.Control as="textarea" rows={2} size="sm" placeholder="Additional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>{saving ? "Saving..." : "Add Appointment"}</button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AppointmentsCard;
