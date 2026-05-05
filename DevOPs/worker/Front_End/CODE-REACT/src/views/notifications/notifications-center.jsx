import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { medicationApi, notificationApi } from "../../services/api";
import {
  formatNotifTime,
  formatNotifLate,
  staffNotifMeta,
  staffDefaultTitle,
  staffNotifCategory,
  patientApiCategory,
  CHAT_PATH,
  EMAIL_INBOX_PATH,
  DASHBOARD_APPTS_HASH,
  DASHBOARD_MEDS_HASH,
  isVirtualId,
} from "../../utils/notificationMeta";
import {
  getMissedMedicationSlotsToday,
  formatSlotClock,
  localDateStringYMD,
} from "../../utils/medicationReminders";
import { translateNotificationDisplay } from "../../utils/translateNotification";
import "./notifications-center.scss";

function normalizePatientId(raw) {
  if (raw == null) return "";
  if (typeof raw === "object" && raw !== null && "$oid" in raw) return String(raw.$oid);
  return String(raw);
}

function getSession() {
  try {
    if (localStorage.getItem("patientUser")) {
      const u = JSON.parse(localStorage.getItem("patientUser"));
      return { role: "patient", id: normalizePatientId(u?.id ?? u?._id) };
    }
    if (localStorage.getItem("doctorUser")) {
      const u = JSON.parse(localStorage.getItem("doctorUser"));
      return { role: "doctor", id: String(u?.id ?? u?._id ?? "") };
    }
    if (localStorage.getItem("nurseUser")) {
      const u = JSON.parse(localStorage.getItem("nurseUser"));
      return { role: "nurse", id: String(u?.id ?? u?._id ?? "") };
    }
    if (localStorage.getItem("adminUser")) {
      const u = JSON.parse(localStorage.getItem("adminUser"));
      return { role: "admin", id: String(u?.id ?? u?._id ?? "") };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function matchesReadFilter(n, filter) {
  if (filter === "all") return true;
  const id = n._id || n.id;
  const virt = isVirtualId(id);
  if (filter === "unread") {
    if (virt) return true;
    return n.read !== true;
  }
  if (filter === "read") {
    if (virt) return false;
    return n.read === true;
  }
  return true;
}

function ReadFilterButtons({ value, onChange }) {
  const { t } = useTranslation();
  const opts = [
    { v: "all", label: t("notifications.readAll") },
    { v: "unread", label: t("notifications.readUnread") },
    { v: "read", label: t("notifications.readRead") },
  ];
  return (
    <div className="notifications-center__btn-group btn-group" role="group" aria-label={t("notifications.filterReadAria")}>
      {opts.map(({ v, label }) => (
        <button
          key={v}
          type="button"
          className={`btn btn-sm ${value === v ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function NotificationsCenterPage() {
  const { t, i18n } = useTranslation();
  const [session] = useState(() => getSession());
  const role = session?.role;

  const [readFilter, setReadFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [apiItems, setApiItems] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [medications, setMedications] = useState([]);
  const [now, setNow] = useState(() => new Date());

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await notificationApi.getMine();
      setApiItems(Array.isArray(res.items) ? res.items : []);
      setUnreadTotal(typeof res.unread === "number" ? res.unread : 0);
    } catch (e) {
      setErr(e?.message || t("notifications.errorGeneric"));
      setApiItems([]);
      setUnreadTotal(0);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadPatient = useCallback(async () => {
    const pid = session?.id;
    if (!pid) return;
    setLoading(true);
    setErr("");
    try {
      const [meds, res] = await Promise.all([
        medicationApi.getByPatient(pid).catch(() => []),
        notificationApi.getMine(),
      ]);
      setMedications(Array.isArray(meds) ? meds : []);
      setApiItems(Array.isArray(res.items) ? res.items : []);
      setUnreadTotal(typeof res.unread === "number" ? res.unread : 0);
    } catch (e) {
      setErr(e?.message || t("notifications.errorGeneric"));
      setApiItems([]);
      setMedications([]);
      setUnreadTotal(0);
    } finally {
      setLoading(false);
    }
  }, [session?.id, t]);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    if (role === "patient") loadPatient();
    else loadStaff();
  }, [session, role, loadPatient, loadStaff]);

  useEffect(() => {
    const onNotif = () => {
      if (role === "patient") loadPatient();
      else loadStaff();
    };
    window.addEventListener("medifollow-notifications-refresh", onNotif);
    return () => window.removeEventListener("medifollow-notifications-refresh", onNotif);
  }, [role, loadPatient, loadStaff]);

  useEffect(() => {
    if (role !== "patient") return undefined;
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, [role]);

  const dateStr = localDateStringYMD();
  const missedMeds = useMemo(
    () =>
      role === "patient" && session?.id
        ? getMissedMedicationSlotsToday(medications, now, dateStr, 1)
        : [],
    [role, session?.id, medications, now, dateStr],
  );

  const filteredStaffItems = useMemo(() => {
    if (role === "patient") return [];
    return apiItems.filter((n) => {
      if (!matchesReadFilter(n, readFilter)) return false;
      if (catFilter === "all") return true;
      return staffNotifCategory(n) === catFilter;
    });
  }, [apiItems, readFilter, catFilter, role]);

  const filteredPatientRows = useMemo(() => {
    if (role !== "patient") return { api: [], med: [] };

    if (catFilter === "medicaments") {
      const apiRx = apiItems.filter((n) => {
        const isRx = n.type === "prescription_pdf" || n.meta?.kind === "prescription_pdf";
        if (!isRx) return false;
        return matchesReadFilter(n, readFilter);
      });
      const med = readFilter === "read" ? [] : missedMeds;
      return { api: apiRx, med };
    }

    const api = apiItems.filter((n) => {
      if (!matchesReadFilter(n, readFilter)) return false;
      if (catFilter === "all") return true;
      if (catFilter === "messages_appels") return patientApiCategory(n) === "messages_appels";
      if (catFilter === "rdv") return patientApiCategory(n) === "rdv";
      if (catFilter === "autres") return patientApiCategory(n) === "autres";
      return true;
    });

    const showMed = catFilter === "all" && (readFilter === "all" || readFilter === "unread");
    const med = showMed ? missedMeds : [];

    return { api, med };
  }, [apiItems, missedMeds, readFilter, catFilter, role]);

  const onMarkRead = async (id) => {
    if (!id || isVirtualId(id)) return;
    try {
      await notificationApi.markRead(id);
      if (role === "patient") await loadPatient();
      else await loadStaff();
    } catch {
      /* ignore */
    }
  };

  const onMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      if (role === "patient") await loadPatient();
      else await loadStaff();
    } catch {
      /* ignore */
    }
  };

  const onDeleteOne = async (id) => {
    if (!id || isVirtualId(id)) return;
    try {
      await notificationApi.deleteOne(id);
      if (role === "patient") await loadPatient();
      else await loadStaff();
    } catch {
      /* ignore */
    }
  };

  const onDeleteAll = async () => {
    if (!window.confirm(t("notifications.deleteAllConfirm"))) return;
    try {
      await notificationApi.deleteAll();
      if (role === "patient") await loadPatient();
      else await loadStaff();
    } catch {
      /* ignore */
    }
  };

  const staffRole = role === "admin" ? "admin" : role === "doctor" ? "doctor" : "nurse";

  const roleLabel =
    role === "patient"
      ? t("notifications.roleSpacePatient")
      : role === "doctor"
        ? t("notifications.roleSpaceDoctor")
        : role === "nurse"
          ? t("notifications.roleSpaceNurse")
          : t("notifications.roleSpaceAdmin");

  if (!session) {
    return (
      <Container fluid className="notifications-center py-4">
        <div className="notifications-center__guest">
          <i className="ri-lock-line d-block" aria-hidden />
          <h5 className="fw-semibold mb-2">{t("notifications.loginRequiredTitle")}</h5>
          <p className="text-muted small mb-0">{t("notifications.loginRequiredBody")}</p>
        </div>
      </Container>
    );
  }

  const listEmptyStaff = !loading && role !== "patient" && filteredStaffItems.length === 0;
  const listEmptyPatient =
    !loading &&
    role === "patient" &&
    filteredPatientRows.api.length === 0 &&
    filteredPatientRows.med.length === 0;

  return (
    <Container fluid className="notifications-center py-4 px-3 px-md-4">
      <div className="notifications-center__hero">
        <Row className="align-items-center g-3">
          <Col xs="auto">
            <div className="notifications-center__hero-icon" aria-hidden>
              <i className="ri-notification-3-fill" />
            </div>
          </Col>
          <Col>
            <p className="small text-white text-opacity-75 mb-1 fw-medium">{roleLabel}</p>
            <h1 className="notifications-center__title">{t("notifications.pageTitle")}</h1>
            <p className="notifications-center__subtitle">
              {role === "admin" ? t("notifications.pageSubtitleAdmin") : t("notifications.pageSubtitle")}
            </p>
          </Col>
          <Col xs={12} md="auto" className="d-flex flex-wrap align-items-center gap-2 justify-content-md-end">
            {unreadTotal > 0 && (
              <span className="notifications-center__badge-unread">{t("notifications.unreadBadge", { count: unreadTotal })}</span>
            )}
            <button type="button" className="btn btn-light btn-sm fw-semibold shadow-sm" onClick={onMarkAllRead}>
              <i className="ri-check-double-line me-1" aria-hidden />
              {t("notifications.markAllRead")}
            </button>
            <button type="button" className="btn btn-outline-light btn-sm fw-semibold shadow-sm" onClick={onDeleteAll}>
              <i className="ri-delete-bin-line me-1" aria-hidden />
              {t("notifications.deleteAll")}
            </button>
          </Col>
        </Row>
      </div>

      <div className="notifications-center__filters">
        <Row className="g-4 align-items-end">
          <Col md={6} lg={5}>
            <div className="notifications-center__filter-label">{t("notifications.filterRead")}</div>
            <ReadFilterButtons value={readFilter} onChange={setReadFilter} />
          </Col>
          <Col md={6} lg={4}>
            <div className="notifications-center__filter-label">{t("notifications.filterType")}</div>
            <div className="notifications-center__select-wrap">
              {role === "patient" ? (
                <Form.Select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  aria-label={t("notifications.filterTypeAria")}
                >
                  <option value="all">{t("notifications.catAll")}</option>
                  <option value="messages_appels">{t("notifications.catMessagesCalls")}</option>
                  <option value="rdv">{t("notifications.catAppointments")}</option>
                  <option value="medicaments">{t("notifications.catMedReminders")}</option>
                  <option value="autres">{t("notifications.catOther")}</option>
                </Form.Select>
              ) : (
                <Form.Select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  aria-label={t("notifications.filterTypeAria")}
                >
                  <option value="all">{t("notifications.catAll")}</option>
                  <option value="danger">{t("notifications.catDanger")}</option>
                  <option value="rdv">{t("notifications.catAppointments")}</option>
                  <option value="demande_rdv">{t("notifications.catApptRequests")}</option>
                  <option value="messagerie">{t("notifications.catMessaging")}</option>
                  <option value="autres">{t("notifications.catOther")}</option>
                </Form.Select>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {loading && (
        <div className="notifications-center__loading">
          <Spinner animation="border" variant="primary" role="status" className="mb-2" />
          <p className="text-muted small mb-0">{t("notifications.loadingList")}</p>
        </div>
      )}

      {err && !loading && (
        <div className="alert alert-danger rounded-3 shadow-sm" role="alert">
          {err}
        </div>
      )}

      {!loading && role !== "patient" && (
        <div className="notifications-center__list-card">
          {listEmptyStaff ? (
            <div className="notifications-center__empty">
              <i className="ri-inbox-line" aria-hidden />
              <p className="mb-0 fw-medium">{t("notifications.emptyFiltered")}</p>
              <p className="small text-muted mt-2 mb-0">{t("notifications.emptyFilteredHintStaff")}</p>
            </div>
          ) : (
            filteredStaffItems.map((n) => {
              const disp = translateNotificationDisplay(n, t, i18n);
              const id = n._id || n.id;
              const { href, icon, iconWrapClass } = staffNotifMeta(n, staffRole);
              const isRead = n.read === true;
              const virt = isVirtualId(id);
              const time = formatNotifTime(n.createdAt, t, i18n.language);
              return (
                <Link
                  key={String(id)}
                  to={href}
                  className={`notifications-center__item ${!isRead ? "notifications-center__item--unread" : ""}`}
                  onClick={() => {
                    if (!isRead && id && !virt) onMarkRead(id);
                  }}
                >
                  <div className="notifications-center__item-inner">
                    {!virt && (
                      <button
                        type="button"
                        className="notifications-center__delete-one btn btn-link p-0 text-danger flex-shrink-0"
                        aria-label={t("notifications.deleteOneAria")}
                        title={t("notifications.deleteOneAria")}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDeleteOne(id);
                        }}
                      >
                        <i className="ri-delete-bin-line fs-5" aria-hidden />
                      </button>
                    )}
                    <div className={`notifications-center__icon-box ${iconWrapClass} border`}>
                      <i className={icon} aria-hidden />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                        <h2 className="h6 mb-0 text-dark fw-semibold text-break pe-2">
                          {disp.title || staffDefaultTitle(n, t)}
                        </h2>
                        {time ? <span className="notifications-center__time-pill">{time}</span> : null}
                      </div>
                      <p className="mb-0 small text-muted text-break mt-1 lh-sm">{disp.body}</p>
                      {!isRead && !virt && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 mt-2 text-primary fw-semibold"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onMarkRead(id);
                          }}
                        >
                          {t("notifications.markAsRead")}
                        </button>
                      )}
                      {n.type === "video_meeting_invite" && n.meta?.meetingCode && (
                        <button
                          type="button"
                          className="btn btn-info btn-sm mt-2 fw-semibold text-white d-block"
                          style={{ backgroundColor: '#089bab', borderColor: '#089bab' }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`https://meet.jit.si/MediFollow${n.meta.meetingCode}#config.prejoinPageEnabled=false`, '_blank');
                            if (!isRead) onMarkRead(id);
                          }}
                        >
                          <i className="ri-vidicon-line me-1" /> Join Meeting
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {!loading && role === "patient" && (
        <div className="notifications-center__list-card">
          {listEmptyPatient ? (
            <div className="notifications-center__empty">
              <i className="ri-inbox-line" aria-hidden />
              <p className="mb-0 fw-medium">{t("notifications.emptyFiltered")}</p>
              <p className="small text-muted mt-2 mb-0">{t("notifications.emptyFilteredHintPatient")}</p>
            </div>
          ) : (
            <>
              {filteredPatientRows.api.map((n) => {
                const disp = translateNotificationDisplay(n, t, i18n);
                const id = n._id || n.id;
                const isVirt = isVirtualId(id);
                const isMail = n.type === "mail_inbox";
                const isChat =
                  n.type === "chat_message" ||
                  n.type === "chat_message_sent" ||
                  n.type === "chat_call_log" ||
                  n.type === "chat_voice_invite";
                const isAppt =
                  n.type === "appointment_reminder_24h" || n.type === "appointment_new" || isVirt;
                const isPrescriptionPdf =
                  n.type === "prescription_pdf" || n.meta?.kind === "prescription_pdf";
                const prescriptionStorageKey =
                  isPrescriptionPdf && n.meta?.storageKey ? String(n.meta.storageKey) : "";
                const mailHref =
                  isMail && n.meta?.stateId
                    ? `${EMAIL_INBOX_PATH}?stateId=${encodeURIComponent(String(n.meta.stateId))}`
                    : EMAIL_INBOX_PATH;
                const href = isPrescriptionPdf
                  ? "#"
                  : isMail
                    ? mailHref
                    : isChat
                      ? CHAT_PATH
                      : isAppt
                        ? DASHBOARD_APPTS_HASH
                        : DASHBOARD_MEDS_HASH;
                const icon = isPrescriptionPdf
                  ? "ri-file-pdf-line"
                  : isMail
                    ? "ri-mail-line"
                    : isChat
                      ? n.type === "chat_voice_invite"
                        ? n.meta?.isVideo === true || /vidéo|video/i.test(String(n.title || ""))
                          ? "ri-vidicon-line"
                          : "ri-phone-fill"
                        : n.type === "chat_message_sent"
                          ? "ri-send-plane-2-line"
                          : "ri-chat-3-line"
                      : isAppt
                        ? "ri-calendar-event-fill"
                        : "ri-information-line";
                const time = formatNotifTime(n.createdAt, t, i18n.language);
                const unread = n.read === false;

                const downloadPrescription = async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!prescriptionStorageKey) return;
                  try {
                    const blob = await medicationApi.downloadPrescriptionPdfBlob(prescriptionStorageKey);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "ordonnance-medifollow.pdf";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch {
                    /* ignore */
                  }
                };

                return (
                  <Link
                    key={String(id)}
                    to={href}
                    className={`notifications-center__item ${unread ? "notifications-center__item--unread" : ""}`}
                    onClick={(e) => {
                      if (isPrescriptionPdf) {
                        e.preventDefault();
                        downloadPrescription(e);
                      }
                      if (!n.read && id && !isVirt) onMarkRead(id);
                    }}
                  >
                    <div className="notifications-center__item-inner">
                      {!isVirt && (
                        <button
                          type="button"
                          className="notifications-center__delete-one btn btn-link p-0 text-danger flex-shrink-0"
                          aria-label={t("notifications.deleteOneAria")}
                          title={t("notifications.deleteOneAria")}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDeleteOne(id);
                          }}
                        >
                          <i className="ri-delete-bin-line fs-5" aria-hidden />
                        </button>
                      )}
                      <div
                        className={`notifications-center__icon-box border ${
                          isPrescriptionPdf || isAppt || isChat || isMail
                            ? "bg-primary-subtle text-primary"
                            : "bg-light text-primary"
                        }`}
                      >
                        <i className={`${icon} fs-5`} aria-hidden />
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                          <h2 className="h6 mb-0 text-dark fw-semibold text-break pe-2">{disp.title || t("notifications.fallbackTitle")}</h2>
                          {time ? <span className="notifications-center__time-pill">{time}</span> : null}
                        </div>
                        <p className="mb-0 small text-muted text-break mt-1 lh-sm">{disp.body}</p>
                        {isPrescriptionPdf && prescriptionStorageKey ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger-subtle mt-2"
                            onClick={downloadPrescription}
                          >
                            <i className="ri-download-2-line me-1" aria-hidden />
                            {t("notifications.downloadPrescriptionPdf")}
                          </button>
                        ) : null}
                        {!n.read && !isVirt && (
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0 mt-2 text-primary fw-semibold"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onMarkRead(id);
                            }}
                          >
                            {t("notifications.markAsRead")}
                          </button>
                        )}
                        {n.type === "video_meeting_invite" && n.meta?.meetingCode && (
                          <button
                            type="button"
                            className="btn btn-info btn-sm mt-2 fw-semibold text-white d-block"
                            style={{ backgroundColor: '#089bab', borderColor: '#089bab' }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(`https://meet.jit.si/MediFollow${n.meta.meetingCode}#config.prejoinPageEnabled=false`, '_blank');
                              if (!n.read) onMarkRead(id);
                            }}
                          >
                            <i className="ri-vidicon-line me-1" /> Join Meeting
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
              {filteredPatientRows.med.map((row) => {
                const mid = row.med?._id || row.med?.id;
                const key = `med-${mid}-${row.slotIndex}`;
                const title = row.med?.name || t("notifications.medDefaultName");
                const dosage = row.med?.dosage ? String(row.med.dosage) : "";
                const slotLabel = row.slot?.label ? `${row.slot.label} · ` : "";
                const subtitle = `${slotLabel}${dosage ? `${dosage} · ` : ""}${t("notifications.medScheduled", { time: formatSlotClock(row.slot) })}`;
                return (
                  <Link key={key} to={DASHBOARD_MEDS_HASH} className="notifications-center__item notifications-center__item--unread">
                    <div className="notifications-center__item-inner">
                      <div className="notifications-center__icon-box bg-light text-primary border">
                        <i className="ri-capsule-line fs-5" aria-hidden />
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                          <h2 className="h6 mb-0 text-dark fw-semibold text-break pe-2">{t("notifications.medReminder", { name: title })}</h2>
                          <span className="notifications-center__time-pill">{formatNotifLate(row.minutesPast, t)}</span>
                        </div>
                        <p className="mb-0 small text-muted text-break mt-1 lh-sm">{subtitle}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      )}
    </Container>
  );
}
