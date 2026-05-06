/** Préférence « grand texte » partagée (connexion + sessions patient / médecin / infirmier). */
export const LARGE_TEXT_STORAGE_KEY = "medifollow_large_text_signin";

/** Mode dyslexie (police + espacements), toutes les sessions. */
export const DYSLEXIA_MODE_STORAGE_KEY = "medifollow_dyslexia_mode";

/** Préférence clic par clignement (suivi visage) avec navigation doigt active. */
export const EYE_TRACKING_STORAGE_KEY = "medifollow_eye_tracking_blink";

/** Seuils personnalisés après calibration (JSON { on, off }). */
export const EYE_CALIBRATION_STORAGE_KEY = "medifollow_eye_blink_calibration";

export function readEyeTrackingPref() {
  if (typeof window === "undefined") return true;
  try {
    const v = localStorage.getItem(EYE_TRACKING_STORAGE_KEY);
    if (v === null) return true;
    return v === "1";
  } catch {
    return true;
  }
}

/** @returns {{ on: number; off: number } | null} */
export function readEyeCalibration() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(EYE_CALIBRATION_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (typeof o?.on !== "number" || typeof o?.off !== "number") return null;
    if (!(o.off >= 0 && o.on <= 1 && o.on > o.off + 0.04)) return null;
    return { on: o.on, off: o.off };
  } catch {
    return null;
  }
}

export function writeEyeCalibration(thresholds) {
  try {
    localStorage.setItem(EYE_CALIBRATION_STORAGE_KEY, JSON.stringify(thresholds));
  } catch {
    /* ignore */
  }
}

/** Si l'utilisateur avait activé le suivi sans calibration (ancienne version), on réinitialise la préférence. */
export function readInitialEyeTrackingPref() {
  const pref = readEyeTrackingPref();
  const cal = readEyeCalibration();
  if (pref && !cal) {
    try {
      localStorage.setItem(EYE_TRACKING_STORAGE_KEY, "0");
    } catch {
      /* ignore */
    }
    return false;
  }
  return pref;
}
