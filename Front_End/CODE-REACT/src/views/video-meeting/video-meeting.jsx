import React, { useState, useEffect, useCallback } from "react";
import { videoMeetingApi } from "../../services/api";
import "./video-meeting.css";

/* ── helpers ── */
const getUser = () => {
  for (const key of ["doctorUser", "adminUser"]) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const u = JSON.parse(raw);
        if (u) return u;
      }
    } catch { /* ignore */ }
  }
  return null;
};

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
};

const fmtTime = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const initials = (name) => {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
};

const statusClass = (s) => {
  const map = { scheduled: "vm-status-scheduled", "in-progress": "vm-status-in-progress", completed: "vm-status-completed", cancelled: "vm-status-cancelled" };
  return map[s] || "vm-status-scheduled";
};

const statusLabel = (s) => {
  const map = { scheduled: "Scheduled", "in-progress": "In Progress", completed: "Completed", cancelled: "Cancelled" };
  return map[s] || s;
};

/* ── Component ── */
const VideoMeeting = () => {
  const [user] = useState(getUser);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ title: "", date: "", time: "", duration: "30", notes: "" });
  const [invitable, setInvitable] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await videoMeetingApi.getMyMeetings();
      setMeetings(Array.isArray(data) ? data : []);
      
      // Also fetch invitable users if doctor/admin
      if (user && ["doctor", "admin", "superadmin"].includes(user.role)) {
        const users = await videoMeetingApi.getInvitableUsers();
        setInvitable(users || []);
      }
    } catch (e) {
      console.error("Failed to load meetings", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  /* ── Room Logic ── */
  const openMeeting = (code) => {
    if (!code) {
      showToast("❌ Invalid meeting code");
      return;
    }
    // Simplify room name and skip prejoin page to avoid "Failed to join" errors
    const roomName = `MediFollow${code}`;
    const url = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false`;
    window.open(url, "_blank");
    showToast("🚀 Opening video room...");
  };

  /* ── Create ── */
  const handleCreate = async () => {
    if (!form.title || !form.date || !form.time) return;
    setSaving(true);
    try {
      const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();
      const invitedUsers = invitable
        .filter(u => selectedUsers.includes(u.userId))
        .map(u => ({ userId: u.userId, name: u.name, role: u.role }));

      await videoMeetingApi.create({
        title: form.title,
        scheduledAt,
        duration: parseInt(form.duration, 10) || 30,
        notes: form.notes,
        invitedUsers,
      });
      setShowModal(false);
      setForm({ title: "", date: "", time: "", duration: "30", notes: "" });
      setSelectedUsers([]);
      showToast("✅ Meeting created successfully!");
      load();
    } catch (e) {
      showToast("❌ " + (e.message || "Failed to create"));
    } finally {
      setSaving(false);
    }
  };

  /* ── Join by code ── */
  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const meeting = await videoMeetingApi.join(joinCode.trim());
      showToast(`✅ Joined meeting: ${meeting.title}`);
      setJoinCode("");
      load();
      openMeeting(meeting.meetingCode);
    } catch (e) {
      showToast("❌ " + (e.message || "Meeting not found"));
    } finally {
      setJoining(false);
    }
  };

  const toggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  /* ── Cancel ── */
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this meeting?")) return;
    try {
      await videoMeetingApi.cancel(id);
      showToast("Meeting cancelled");
      load();
    } catch (e) {
      showToast("❌ " + (e.message || "Failed"));
    }
  };

  /* ── Copy code ── */
  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => showToast("📋 Code copied!")).catch(() => {});
  };

  /* ── Split upcoming / past ── */
  const now = new Date();
  const upcoming = meetings.filter((m) => m.status !== "cancelled" && m.status !== "completed" && new Date(m.scheduledAt) >= new Date(now.toDateString()));
  const past = meetings.filter((m) => m.status === "completed" || m.status === "cancelled" || new Date(m.scheduledAt) < new Date(now.toDateString()));

  return (
    <div className="vm-page">
      {/* Header */}
      <div className="vm-header">
        <div className="vm-header-left">
          <h2><i className="ri-vidicon-fill" style={{ marginRight: 10 }}></i>Video Meetings</h2>
          <p>Schedule and join secure video consultations</p>
        </div>
        <button className="vm-btn-new" onClick={() => setShowModal(true)}>
          <i className="ri-add-line"></i>
          New Meeting
        </button>
      </div>

      {/* Join by Code */}
      <div className="vm-join-bar">
        <i className="ri-key-2-line" style={{ fontSize: "1.3rem", color: "#089bab" }}></i>
        <input
          type="text"
          placeholder="Enter meeting code to join..."
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          maxLength={8}
        />
        <button className="vm-btn-join" onClick={handleJoin} disabled={joining || !joinCode.trim()}>
          {joining ? "Joining..." : "Join Meeting"}
        </button>
      </div>

      {/* Upcoming */}
      <div className="vm-section-title">
        <i className="ri-calendar-schedule-line"></i>
        Upcoming Meetings ({upcoming.length})
      </div>

      {loading ? (
        <div className="vm-empty"><i className="ri-loader-4-line"></i><p>Loading...</p></div>
      ) : upcoming.length === 0 ? (
        <div className="vm-empty">
          <i className="ri-vidicon-line"></i>
          <p>No upcoming meetings. Create one to get started!</p>
        </div>
      ) : (
        <div className="vm-grid">
          {upcoming.map((m) => (
            <MeetingCard key={m._id} meeting={m} user={user} onCancel={handleCancel} onCopy={copyCode} onJoin={openMeeting} />
          ))}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <div className="vm-section-title" style={{ marginTop: "1rem" }}>
            <i className="ri-history-line"></i>
            Past Meetings ({past.length})
          </div>
          <div className="vm-grid">
            {past.map((m) => (
              <MeetingCard key={m._id} meeting={m} user={user} onCancel={handleCancel} onCopy={copyCode} onJoin={openMeeting} isPast />
            ))}
          </div>
        </>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="vm-modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="vm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vm-modal-header">
              <h4><i className="ri-vidicon-line" style={{ marginRight: 8, color: "#089bab" }}></i>New Video Meeting</h4>
              <button className="vm-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="vm-modal-body">
              <div className="vm-form-group">
                <label>Meeting Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Patient Follow-up with Dr. Smith"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="vm-form-row">
                <div className="vm-form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div className="vm-form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="vm-form-group">
                <label>Duration</label>
                <select value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <div className="vm-form-group">
                <label>Notes (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Add any meeting details or agenda..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {invitable.length > 0 && (
                <div className="vm-form-group">
                  <label>Invite Participants ({selectedUsers.length} selected)</label>
                  <div className="vm-participant-selector">
                    {invitable.map((u) => (
                      <div 
                        key={u.userId} 
                        className={`vm-participant-item ${selectedUsers.includes(u.userId) ? "selected" : ""}`}
                        onClick={() => toggleUser(u.userId)}
                      >
                        <div className="vm-participant-info">
                          <span className="vm-participant-name">{u.name}</span>
                          <span className="vm-participant-role">{u.role}</span>
                        </div>
                        {selectedUsers.includes(u.userId) ? (
                          <i className="ri-checkbox-circle-fill"></i>
                        ) : (
                          <i className="ri-checkbox-blank-circle-line"></i>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="vm-modal-footer">
              <button className="vm-btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
              <button
                className="vm-btn-primary"
                onClick={handleCreate}
                disabled={saving || !form.title || !form.date || !form.time}
              >
                {saving ? "Creating..." : "Create Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="vm-toast">{toast}</div>}
    </div>
  );
};

/* ── Meeting Card sub-component ── */
const MeetingCard = ({ meeting, user, onCancel, onCopy, onJoin, isPast }) => {
  const m = meeting;
  const isOwner = user && (user.id === m.createdBy || user._id === m.createdBy);

  return (
    <div className="vm-card">
      <div className="vm-card-header">
        <h3 className="vm-card-title">{m.title}</h3>
        <span className={`vm-card-status ${statusClass(m.status)}`}>{statusLabel(m.status)}</span>
      </div>

      <div className="vm-card-meta">
        <span className="vm-card-meta-item">
          <i className="ri-calendar-line"></i>
          {fmtDate(m.scheduledAt)}
        </span>
        <span className="vm-card-meta-item">
          <i className="ri-time-line"></i>
          {fmtTime(m.scheduledAt)}
        </span>
        <span className="vm-card-meta-item">
          <i className="ri-timer-line"></i>
          {m.duration} min
        </span>
      </div>

      <div className="vm-card-code" onClick={() => onCopy(m.meetingCode)} title="Click to copy">
        <i className="ri-file-copy-line"></i>
        {m.meetingCode}
      </div>

      {m.notes && <div className="vm-card-notes">{m.notes}</div>}

      {m.participants?.length > 0 && (
        <div className="vm-card-participants">
          <div className="vm-avatar-stack">
            {m.participants.slice(0, 4).map((p, i) => (
              <div key={i} className="vm-avatar" title={p.name}>{initials(p.name)}</div>
            ))}
            {m.participants.length > 4 && (
              <div className="vm-avatar" style={{ background: "#94a3b8" }}>+{m.participants.length - 4}</div>
            )}
          </div>
          <span>{m.participants.length} participant{m.participants.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {!isPast && m.status !== "cancelled" && (
        <div className="vm-card-actions">
          <button className="vm-btn-action vm-btn-go" onClick={() => onJoin(m.meetingCode)} title="Join this meeting">
            <i className="ri-vidicon-line"></i>
            Join
          </button>
          <button className="vm-btn-action vm-btn-copy" onClick={() => onCopy(m.meetingCode)}>
            <i className="ri-file-copy-line"></i>
            Copy Code
          </button>
          {isOwner && (
            <button className="vm-btn-action vm-btn-cancel-meeting" onClick={() => onCancel(m._id)}>
              <i className="ri-close-line"></i>
              Cancel
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#94a3b8" }}>
        Organized by {m.creatorName || "—"}
      </div>
    </div>
  );
};

export default VideoMeeting;
