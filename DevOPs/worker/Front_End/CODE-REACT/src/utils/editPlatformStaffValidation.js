/** Limite côté client pour photo profil (base64 ~ 33 % plus long que binaire). */
export const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Retourne des clés i18n sous editPlatformStaffValidation.<key>
 * @param {object} form — firstName, lastName, email, department?, password, confirmPassword
 * @param {{ requireDepartment?: boolean }} options
 */
export function validateEditPlatformStaffForm(form, options = {}) {
  const requireDepartment = options.requireDepartment !== false;
  const keys = [];
  if (!String(form.firstName || "").trim()) keys.push("firstNameRequired");
  if (!String(form.lastName || "").trim()) keys.push("lastNameRequired");
  const email = String(form.email || "").trim();
  if (!email) keys.push("emailRequired");
  else if (!EMAIL_RE.test(email)) keys.push("emailInvalid");
  if (requireDepartment && !String(form.department || "").trim()) keys.push("departmentRequired");
  const pw = form.password || "";
  const cpw = form.confirmPassword || "";
  if (pw || cpw) {
    if (pw !== cpw) keys.push("passwordMismatch");
    else if (pw.length > 0 && pw.length < 6) keys.push("passwordMin");
  }
  return keys;
}
