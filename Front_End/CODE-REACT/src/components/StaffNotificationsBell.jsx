import React, { useCallback, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { notificationApi } from "../services/api";

function formatNotifTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const diff = Date.now() - d.getTime();
    if (diff < 45_000) return "À l'instant";
    if (diff < 3_600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
    if (diff < 86_400_000) return `Il y a ${Math.floor(diff / 3_600_000)} h`;
    return d.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function patientIdFromDoc(raw) {
  if (raw == null) return "";
  if (typeof raw === "object" && raw !== null && "$oid" in raw) return String(raw.$oid);
  return String(raw);
}

function patientLink(role, patientIdRaw) {
  const pid = patientIdFromDoc(patientIdRaw);
  if (!pid) return "#";
  if (role === "doctor") return `/doctor/my-patients/${pid}`;
  if (role === "admin") return "/admin/appointment-requests";
  return `/dashboard`;
}

function isVirtualId(id) {
  return id != null && String(id).startsWith("virt-");
}

function isAppointmentNotifType(type) {
  return type === "appointment_new" || type === "appointment_reminder_24h";
}

/** Lien agenda / calendrier selon le rôle (RDV). */
function appointmentListLink(role) {
  if (role === "admin") return "/admin/appointment-requests";
  if (role === "doctor") return "/doctor/availability-calendar";
  return "/dashboard-pages/nurse-dashboard";
}

function notifMeta(n, role) {
  const t = n.type || "";
  const id = n._id || n.id;
  if (t === "appointment_request") {
    return {
      href: "/admin/appointment-requests",
      icon: "ri-calendar-add-line",
      iconWrapClass: "rounded-3 bg-primary-subtle text-primary border",
    };
  }
  if (isAppointmentNotifType(t) || isVirtualId(id)) {
    const isReminder = t === "appointment_reminder_24h";
    return {
      href: appointmentListLink(role),
      icon: isReminder ? "ri-alarm-line" : "ri-calendar-check-line",
      iconWrapClass: "rounded-3 bg-primary-subtle text-primary border",
    };
  }
  return {
    href: patientLink(role, n.patientId),
    icon: "ri-alarm-warning-fill",
    iconWrapClass: "rounded-circle bg-danger-subtle text-danger",
  };
}

/**
 * Liste déroulante « All Notifications » (style template) pour médecin / infirmier — alertes risque patient.
 */
export default function StaffNotificationsBell({
  role,
  className = "",
  toggleClassName = "nav-link d-none d-xl-block position-relative",
}) {
  const [data, setData] = useState({ items: [], unread: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await notificationApi.getMine();
      setData({
        items: Array.isArray(res.items) ? res.items : [],
        unread: typeof res.unread === "number" ? res.unread : 0,
      });
    } catch (e) {
      setErr(e.message || "Erreur");
      setData({ items: [], unread: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const onMarkRead = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVirtualId(id)) return;
    try {
      await notificationApi.markRead(id);
      await load();
    } catch {
      /* ignore */
    }
  };

  const onMarkAll = async (e) => {
    e.preventDefault();
    try {
      await notificationApi.markAllRead();
      await load();
    } catch {
      /* ignore */
    }
  };

  const items = data.items;
  const unread = data.unread;

  return (
    <Dropdown as="li" className={`nav-item ${className}`}>
      <Dropdown.Toggle as="a" bsPrefix=" " to="#" className={`${toggleClassName} position-relative`}>
        <i className="ri-notification-4-line" />
        {unread > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "0.65rem", padding: "0.2em 0.45em" }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu drop="start" as="div" className="p-0 sub-drop dropdown-menu-end" style={{ minWidth: 320, maxWidth: 380 }}>
        <div className="m-0 card border-0 shadow-sm overflow-hidden">
          <div className="py-3 px-3 d-flex justify-content-between align-items-center bg-primary mb-0 rounded-top-3">
            <h5 className="mb-0 text-white fw-bold d-flex align-items-center gap-2 flex-wrap">
              Toutes les notifications
              <span className="badge bg-light text-dark rounded-2 px-2 py-1 small">{unread}</span>
            </h5>
            {unread > 0 && (
              <button type="button" className="btn btn-sm btn-link text-white text-decoration-none p-0 small" onClick={onMarkAll}>
                Tout lu
              </button>
            )}
          </div>
          <div className="p-0 card-body" style={{ maxHeight: 360, overflowY: "auto" }}>
            {loading && items.length === 0 && (
              <div className="text-center text-muted small py-4">Chargement…</div>
            )}
            {err && !loading && (
              <div className="text-danger small px-3 py-2">{err}</div>
            )}
            {!loading && items.length === 0 && !err && (
              <div className="text-muted small text-center py-4 px-3">Aucune alerte pour le moment.</div>
            )}
            {items.map((n) => {
              const id = n._id || n.id;
              const { href, icon, iconWrapClass } = notifMeta(n, role);
              const isRead = n.read === true;
              const virt = isVirtualId(id);
              const time = formatNotifTime(n.createdAt);
              const defaultTitle =
                n.type === "appointment_request"
                  ? "Demande de rendez-vous"
                  : n.type === "appointment_new"
                    ? "Nouveau rendez-vous"
                    : n.type === "appointment_reminder_24h"
                      ? "Rappel rendez-vous"
                      : "Alerte patient";
              return (
                <Link
                  key={String(id)}
                  to={href}
                  className={`iq-sub-card d-block text-decoration-none border-bottom ${!isRead ? "bg-primary-subtle bg-opacity-10" : ""}`}
                  onClick={() => {
                    if (!isRead && id && !virt) notificationApi.markRead(id).then(load).catch(() => {});
                  }}
                >
                  <div className="d-flex align-items-start px-3 py-3">
                    <div
                      className={`flex-shrink-0 d-flex align-items-center justify-content-center ${iconWrapClass}`}
                      style={{ width: 48, height: 48 }}
                    >
                      <i className={`${icon} fs-5`} aria-hidden />
                    </div>
                    <div className="ms-3 flex-grow-1 text-start min-w-0">
                      <h6 className="mb-0 text-dark text-truncate fw-semibold">{n.title || defaultTitle}</h6>
                      <div className="d-flex justify-content-between gap-2 align-items-start mt-1">
                        <p className="mb-0 small text-muted" style={{ lineHeight: 1.35 }}>
                          {n.body}
                        </p>
                        <small className="flex-shrink-0 text-muted" style={{ fontSize: "0.7rem" }}>
                          {time}
                        </small>
                      </div>
                      {!isRead && !virt && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 mt-1 small text-primary"
                          onClick={(e) => onMarkRead(e, id)}
                        >
                          Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
