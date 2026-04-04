/**
 * Métadonnées et formatage partagés entre la cloche et la page « Toutes les notifications ».
 */

export const CHAT_PATH = "/chat";
export const EMAIL_INBOX_PATH = "/email/inbox";
export const DASHBOARD_MEDS_HASH = "/dashboard-pages/patient-dashboard#patient-medications";
export const DASHBOARD_APPTS_HASH = "/dashboard-pages/patient-dashboard#patient-appointments";

/**
 * @param {string|Date} iso
 * @param {import("i18next").TFunction} t
 * @param {string} [lng] i18n language (e.g. en, fr, ar)
 */
export function formatNotifTime(iso, t, lng) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const diff = Date.now() - d.getTime();
    const shortLng = (lng || "en").split("-")[0];
    const locale = shortLng === "ar" ? "ar" : shortLng === "fr" ? "fr-FR" : "en-US";
    if (diff < 45_000) return t("notifications.time.justNow");
    if (diff < 3_600_000) return t("notifications.time.minutesAgo", { count: Math.floor(diff / 60_000) });
    if (diff < 86_400_000) return t("notifications.time.hoursAgo", { count: Math.floor(diff / 3_600_000) });
    return d.toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * @param {number} minutesPast
 * @param {import("i18next").TFunction} t
 */
export function formatNotifLate(minutesPast, t) {
  if (minutesPast < 60) return t("notifications.lateMinutes", { count: minutesPast });
  const h = Math.floor(minutesPast / 60);
  const m = minutesPast % 60;
  return m > 0 ? t("notifications.lateHoursMinutes", { count_h: h, count_m: m }) : t("notifications.lateHours", { count: h });
}

export function patientIdFromDoc(raw) {
  if (raw == null) return "";
  if (typeof raw === "object" && raw !== null && "$oid" in raw) return String(raw.$oid);
  return String(raw);
}

export function patientLink(role, patientIdRaw) {
  const pid = patientIdFromDoc(patientIdRaw);
  if (!pid) return "#";
  if (role === "doctor") return `/doctor/my-patients/${pid}`;
  if (role === "admin") return "/admin/appointment-requests";
  return `/dashboard`;
}

export function isVirtualId(id) {
  return id != null && String(id).startsWith("virt-");
}

export function isAppointmentNotifType(type) {
  return type === "appointment_new" || type === "appointment_reminder_24h";
}

export function appointmentListLink(role) {
  if (role === "admin") return "/admin/appointment-requests";
  if (role === "doctor") return "/doctor/availability-calendar";
  return "/dashboard-pages/nurse-dashboard";
}

/** Métadonnées lien + icône pour médecin / infirmier / admin. */
export function staffNotifMeta(n, role) {
  const t = n.type || "";
  const id = n._id || n.id;
  if (t === "mail_inbox") {
    const sid = n.meta?.stateId ? String(n.meta.stateId) : "";
    return {
      href: sid ? `${EMAIL_INBOX_PATH}?stateId=${encodeURIComponent(sid)}` : EMAIL_INBOX_PATH,
      icon: "ri-mail-line",
      iconWrapClass: "rounded-3 bg-primary-subtle text-primary border",
    };
  }
  if (
    t === "chat_message" ||
    t === "chat_message_sent" ||
    t === "chat_call_log" ||
    t === "chat_voice_invite"
  ) {
    const video =
      t === "chat_voice_invite" &&
      (n.meta?.isVideo === true || /vidéo|video/i.test(String(n.body || "")));
    return {
      href: CHAT_PATH,
      icon:
        t === "chat_voice_invite"
          ? video
            ? "ri-vidicon-line"
            : "ri-phone-fill"
          : t === "chat_message_sent"
            ? "ri-send-plane-2-line"
            : "ri-chat-3-line",
      iconWrapClass: "rounded-3 bg-primary-subtle text-primary border",
    };
  }
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
  if (t === "lab_analysis_anomaly") {
    return {
      href: patientLink(role, n.patientId),
      icon: "ri-test-tube-line",
      iconWrapClass: "rounded-3 bg-warning-subtle text-warning-emphasis border border-warning-subtle",
    };
  }
  return {
    href: patientLink(role, n.patientId),
    icon: "ri-alarm-warning-fill",
    iconWrapClass: "rounded-circle bg-danger-subtle text-danger",
  };
}

/**
 * @param {object} n notification
 * @param {import("i18next").TFunction} t
 */
export function staffDefaultTitle(n, t) {
  const ty = n.type || "";
  if (ty === "appointment_request") return t("notifications.staffTitle.appointmentRequest");
  if (ty === "appointment_new") return t("notifications.staffTitle.appointmentNew");
  if (ty === "appointment_reminder_24h") return t("notifications.staffTitle.appointmentReminder");
  if (
    ty === "chat_message" ||
    ty === "chat_message_sent" ||
    ty === "chat_call_log" ||
    ty === "chat_voice_invite"
  ) {
    return t("notifications.staffTitle.messaging");
  }
  if (ty === "mail_inbox") return t("notifications.staffTitle.internalMail");
  if (ty === "lab_analysis_anomaly") return t("notifications.staffTitle.labAnalysisAnomaly");
  return t("notifications.staffTitle.patientAlert");
}

/** Catégorie filtre staff : danger | rdv | demande_rdv | messagerie | autres */
export function staffNotifCategory(n) {
  const t = n.type || "";
  const id = n._id || n.id;
  if (t === "risk_alert" || t === "lab_analysis_anomaly") return "danger";
  if (t === "appointment_request") return "demande_rdv";
  if (isAppointmentNotifType(t) || isVirtualId(id)) return "rdv";
  if (
    t === "chat_message" ||
    t === "chat_message_sent" ||
    t === "chat_call_log" ||
    t === "chat_voice_invite" ||
    t === "mail_inbox"
  ) {
    return "messagerie";
  }
  return "autres";
}

/** Catégorie filtre patient : messages_appels | rdv | medicaments | autres */
export function patientApiCategory(n) {
  const id = n._id || n.id;
  const isVirt = isVirtualId(id);
  const isChat =
    n.type === "chat_message" ||
    n.type === "chat_message_sent" ||
    n.type === "chat_call_log" ||
    n.type === "chat_voice_invite" ||
    n.type === "mail_inbox";
  const isAppt =
    n.type === "appointment_reminder_24h" || n.type === "appointment_new" || isVirt;
  if (isChat) return "messages_appels";
  if (isAppt) return "rdv";
  return "autres";
}
