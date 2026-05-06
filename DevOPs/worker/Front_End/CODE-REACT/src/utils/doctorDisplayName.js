/** @typedef {{ firstName?: string; lastName?: string; email?: string; academicTitle?: string }} DoctorLike */

/** Valeur stockée côté API : uniquement `dr` ou `prof`. */
export function normalizeDoctorAcademicTitle(v) {
  return v === "prof" ? "prof" : "dr";
}

/**
 * Préfixe d’affichage (Dr. / Pr.) selon le champ `academicTitle` du médecin.
 * @param {string | undefined} academicTitle
 * @param {(key: string) => string} t — i18n `t`
 */
export function doctorTitlePrefix(academicTitle, t) {
  if (normalizeDoctorAcademicTitle(academicTitle) === "prof") return t("doctorTitle.prefixProf");
  return t("doctorTitle.prefixDr");
}

/**
 * Nom formel complet pour l’interface (ex. « Dr. Jean Dupont » ou « Pr. … »).
 * @param {DoctorLike | null | undefined} user
 * @param {(key: string) => string} t
 */
export function formatDoctorFormalName(user, t) {
  if (!user) return "";
  const prefix = doctorTitlePrefix(user.academicTitle, t);
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (name) return `${prefix} ${name}`;
  return user.email || "";
}
