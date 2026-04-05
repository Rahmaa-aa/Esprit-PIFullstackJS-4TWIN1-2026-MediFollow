/**
 * Synchronise la clôture d’alerte constantes (médecin) entre onglets / fenêtres.
 * BroadcastChannel ne notifie pas l’expéditeur → pas de double rechargement sur la même vue.
 * Même API : PATCH /health-logs/:id/resolve
 */

const CHANNEL = "medifollow-doctor-healthlog-resolved";

/**
 * @param {string} healthLogId
 * @param {string} [patientId] — pour que le dossier ne rafraîchisse que le bon patient
 */
export function broadcastDoctorHealthLogResolved(healthLogId, patientId) {
  const payload = {
    healthLogId: String(healthLogId),
    patientId: patientId != null ? String(patientId) : "",
  };
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage(payload);
    bc.close();
  } catch (_) {
    /* ignore */
  }
}

/**
 * @param {(detail: { healthLogId: string, patientId: string }) => void} handler
 * @returns {() => void} désinscription
 */
export function subscribeDoctorHealthLogResolved(handler) {
  let bc;
  try {
    bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (ev) => {
      const d = ev?.data;
      if (d?.healthLogId) handler(d);
    };
  } catch (_) {
    /* ignore */
  }

  return () => {
    try {
      bc?.close();
    } catch (_) {
      /* ignore */
    }
  };
}
