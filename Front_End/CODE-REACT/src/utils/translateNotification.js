/**
 * Reformate titres/corps des notifications selon la langue (les textes serveur sont souvent en français).
 */

/** @param {string} dateStr YYYY-MM-DD */
export function formatApptLineLocalized(dateStr, timeStr, lng) {
  const d = String(dateStr || "").slice(0, 10);
  const t = String(timeStr || "").trim() || "—";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return t;
  const [y, mo, da] = d.split("-").map(Number);
  const dt = new Date(y, mo - 1, da);
  const short = (lng || "en").split("-")[0];
  const locale = short === "ar" ? "ar" : short === "fr" ? "fr-FR" : "en-US";
  const ds = dt.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${ds} · ${t}`;
}

/**
 * @param {Record<string, unknown>} n notification API item
 * @param {import("i18next").TFunction} t
 * @param {import("i18next").i18n} i18n
 * @returns {{ title: string; body: string }}
 */
export function translateNotificationDisplay(n, t, i18n) {
  const type = n.type || "";
  const rawTitle = String(n.title || "");
  const rawBody = String(n.body || "");
  const lng = (i18n.language || "en").split("-")[0];
  const meta = n.meta && typeof n.meta === "object" ? n.meta : {};

  if (meta.kind === "appointment_reminder_24h" || (type === "appointment_reminder_24h" && meta.date)) {
    const line = formatApptLineLocalized(String(meta.date || ""), String(meta.time || ""), lng);
    const apptTitle = String(meta.appointmentTitle || "");
    const isPatient = meta.reminderRole === "patient";
    const title = isPatient
      ? t("notifications.content.apptReminderPatientTitle")
      : t("notifications.content.apptReminderDoctorTitle", {
          name: String(meta.patientName || n.patientName || "").trim() || t("notifications.medDefaultName"),
        });
    const body = apptTitle ? `${apptTitle} · ${line}` : line;
    return { title, body };
  }

  if (meta.kind === "appointment_new" && meta.date) {
    const line = formatApptLineLocalized(String(meta.date || ""), String(meta.time || ""), lng);
    const title = t("notifications.content.apptNewTitle", { name: String(meta.patientName || "") });
    const body = meta.appointmentTitle ? `${String(meta.appointmentTitle)} · ${line}` : line;
    return { title, body };
  }

  if (meta.kind === "appointment_request" && meta.date) {
    const line = formatApptLineLocalized(String(meta.date || ""), String(meta.time || ""), lng);
    const title = t("notifications.content.apptRequestTitle", { name: String(meta.patientName || "") });
    let body = meta.appointmentTitle ? `${String(meta.appointmentTitle)} · ${line}` : line;
    if (meta.doctorName) {
      body += ` · ${t("notifications.content.doctorLabel", { name: String(meta.doctorName) })}`;
    }
    return { title, body };
  }

  if (meta.kind === "risk_alert") {
    const title = t("notifications.content.riskTitle", {
      name: String(meta.patientName || n.patientName || "").trim() || t("notifications.medDefaultName"),
    });
    const body = t("notifications.content.riskBody", { score: meta.riskScore });
    return { title, body };
  }

  if (meta.kind === "vital_escalation") {
    const title = t("notifications.content.vitalEscalationTitle", {
      name: String(meta.patientName || n.patientName || "").trim() || t("notifications.medDefaultName"),
    });
    const body = t("notifications.content.vitalEscalationBody", { nurse: String(meta.nurseName || "") });
    return { title, body };
  }

  if (meta.kind === "mail_inbox") {
    const sender = String(meta.senderName || "").trim();
    const subjectLine = String(meta.subject || rawBody || "").trim();
    const title = t("notifications.content.mailInboxTitle", {
      sender: sender || t("notifications.fallbackTitle"),
    });
    const body = subjectLine || t("notifications.content.mailInboxBodyFallback");
    return { title, body };
  }

  if (meta.kind === "chat_voice_invite") {
    const title = meta.isVideo
      ? t("notifications.content.videoCallTitle", { name: String(meta.callerName || "") })
      : t("notifications.content.voiceCallTitle", { name: String(meta.callerName || "") });
    const body = meta.isVideo
      ? t("notifications.content.incomingVideoBody")
      : t("notifications.content.incomingVoiceBody");
    return { title, body };
  }

  // --- Regex fallbacks (anciennes notifs sans meta) ---
  let m;

  m = rawTitle.match(/^Rappel : rendez-vous à venir$/);
  if (m && type === "appointment_reminder_24h") {
    return { title: t("notifications.content.apptReminderPatientTitle"), body: rawBody };
  }

  m = rawTitle.match(/^Rappel : RDV avec (.+)$/);
  if (m && type === "appointment_reminder_24h") {
    return {
      title: t("notifications.content.apptReminderDoctorTitle", { name: m[1].trim() }),
      body: rawBody,
    };
  }

  m = rawTitle.match(/^Nouveau rendez-vous — (.+)$/);
  if (m && type === "appointment_new") {
    return { title: t("notifications.content.apptNewTitle", { name: m[1].trim() }), body: rawBody };
  }

  m = rawTitle.match(/^Nouvelle demande de RDV — (.+)$/);
  if (m && type === "appointment_request") {
    return { title: t("notifications.content.apptRequestTitle", { name: m[1].trim() }), body: rawBody };
  }

  m = rawTitle.match(/^Urgence constantes — (.+)$/);
  if (m && type === "risk_alert") {
    return {
      title: t("notifications.content.riskTitle", { name: m[1].trim() }),
      body: translateRiskBodyFallback(rawBody, t),
    };
  }

  m = rawTitle.match(/^Escalade infirmier — (.+)$/);
  if (m && type === "vital_escalation") {
    return {
      title: t("notifications.content.vitalEscalationTitle", { name: m[1].trim() }),
      body: translateVitalEscBodyFallback(rawBody, t),
    };
  }

  // Messagerie (titres FR du backend)
  const chatPatterns = [
    [/^Message — (.+)$/, "notifications.content.chatMessageTitle", "sender"],
    [/^Message vocal — (.+)$/, "notifications.content.chatVoiceTitle", "sender"],
    [/^Photo — (.+)$/, "notifications.content.chatPhotoTitle", "sender"],
    [/^Vidéo — (.+)$/, "notifications.content.chatVideoTitle", "sender"],
    [/^Document — (.+)$/, "notifications.content.chatDocTitle", "sender"],
    [/^Message envoyé à (.+)$/, "notifications.content.messageSentTo", "recipient"],
    [/^Message vocal envoyé à (.+)$/, "notifications.content.voiceSentTo", "recipient"],
    [/^Photo envoyée à (.+)$/, "notifications.content.photoSentTo", "recipient"],
    [/^Vidéo envoyée à (.+)$/, "notifications.content.videoSentTo", "recipient"],
    [/^Document envoyé à (.+)$/, "notifications.content.docSentTo", "recipient"],
    [/^Appel sans réponse — (.+)$/, "notifications.content.callNoAnswerTitle", "recipient"],
  ];
  for (const [re, key, role] of chatPatterns) {
    m = rawTitle.match(re);
    if (m) {
      const name = m[1].trim();
      const param = role === "recipient" ? { recipient: name } : { sender: name };
      return { title: t(key, param), body: translateChatBodyFallback(rawBody, t) };
    }
  }

  // Appels : "Statut — expéditeur"
  m = rawTitle.match(/^(.+) — (.+)$/);
  if (m && (type === "chat_call_log" || type === "chat_message_sent")) {
    const statusFr = m[1].trim();
    const sender = m[2].trim();
    const mapped = mapCallStatusTitle(statusFr, sender, t);
    if (mapped) return { title: mapped.title, body: translateChatBodyFallback(mapped.body || rawBody, t) };
  }

  m = rawTitle.match(/^Appel vidéo — (.+)$/);
  if (m && type === "chat_voice_invite") {
    return {
      title: t("notifications.content.videoCallTitle", { name: m[1].trim() }),
      body: t("notifications.content.incomingVideoBody"),
    };
  }
  m = rawTitle.match(/^Appel vocal — (.+)$/);
  if (m && type === "chat_voice_invite") {
    return {
      title: t("notifications.content.voiceCallTitle", { name: m[1].trim() }),
      body: t("notifications.content.incomingVoiceBody"),
    };
  }

  return { title: rawTitle, body: rawBody };
}

function translateRiskBodyFallback(body, t) {
  const m = String(body).match(/^Score (\d+)\/100/);
  if (m) return t("notifications.content.riskBody", { score: Number(m[1]) });
  return body;
}

function translateVitalEscBodyFallback(body, t) {
  const m = String(body).match(/^(.+?) sollicite votre avis pour un cas de constantes vitales critiques\.$/);
  if (m) return t("notifications.content.vitalEscalationBody", { nurse: m[1].trim() });
  return body;
}

function translateChatBodyFallback(body, t) {
  const s = String(body);
  const map = [
    ["Appel terminé", "notifications.content.callEnded"],
    ["Appel manqué", "notifications.content.callMissed"],
    ["Appel refusé", "notifications.content.callDeclined"],
    ["Appel annulé", "notifications.content.callCancelled"],
    ["Appel non décroché", "notifications.content.callNotAnswered"],
    ["Message vocal", "notifications.content.bodyVoice"],
    ["Photo", "notifications.content.bodyPhoto"],
    ["Vidéo", "notifications.content.bodyVideo"],
    ["Document", "notifications.content.bodyDoc"],
    ["Nouveau message", "notifications.content.bodyNewMessage"],
    ["Message", "notifications.content.bodyMessage"],
    ["Appel", "notifications.content.bodyCall"],
  ];
  for (const [fr, key] of map) {
    if (s === fr) return t(key);
  }
  const dur = s.match(/^Appel terminé \((\d+) s\)$/);
  if (dur) return t("notifications.content.callEndedSeconds", { sec: Number(dur[1]) });
  return body;
}

function mapCallStatusTitle(statusFr, sender, t) {
  const st = statusFr.trim();
  if (st === "Appel") return { title: t("notifications.content.callSimpleTitle", { sender }), body: t("notifications.content.bodyCall") };
  if (st === "Appel vocal") return { title: t("notifications.content.chatVoiceTitle", { sender }), body: t("notifications.content.bodyVoice") };
  const ended = st.match(/^Appel terminé \((\d+) s\)$/);
  if (ended)
    return {
      title: t("notifications.content.callEndedTitle", { sender, sec: Number(ended[1]) }),
      body: t("notifications.content.callEndedSeconds", { sec: Number(ended[1]) }),
    };
  if (st === "Appel terminé") return { title: t("notifications.content.callEndedTitleShort", { sender }), body: t("notifications.content.callEnded") };
  if (st === "Appel manqué") return { title: t("notifications.content.callMissedTitle", { sender }), body: t("notifications.content.callMissed") };
  if (st === "Appel refusé") return { title: t("notifications.content.callDeclinedTitle", { sender }), body: t("notifications.content.callDeclined") };
  if (st === "Appel annulé") return { title: t("notifications.content.callCancelledTitle", { sender }), body: t("notifications.content.callCancelled") };
  return null;
}
