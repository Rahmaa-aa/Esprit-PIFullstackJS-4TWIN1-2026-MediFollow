/**
 * Détection de session locale (alignée sur la logique de `api.js` / connexion).
 */

function okToken(t) {
  return t && t !== "undefined" && t !== "null" ? t : null;
}

/**
 * @returns {string|null} Chemin du tableau de bord si une session valide existe, sinon null.
 */
export function getAuthenticatedHomePath() {
  try {
    const adminUserRaw = localStorage.getItem("adminUser");
    const adminTok = okToken(localStorage.getItem("adminToken"));
    if (adminUserRaw && adminTok) {
      const u = JSON.parse(adminUserRaw || "{}");
      if (u?.role === "carecoordinator") {
        return "/dashboard-pages/care-coordinator-dashboard";
      }
    }
    if (localStorage.getItem("patientUser") && okToken(localStorage.getItem("patientToken"))) {
      return "/dashboard-pages/patient-dashboard";
    }
    if (localStorage.getItem("doctorUser") && okToken(localStorage.getItem("doctorToken"))) {
      return "/dashboard";
    }
    if (localStorage.getItem("nurseUser") && okToken(localStorage.getItem("nurseToken"))) {
      return "/dashboard-pages/nurse-dashboard";
    }
    if (adminUserRaw && adminTok) {
      const u = JSON.parse(adminUserRaw || "{}");
      const role = u?.role;
      if (role === "superadmin") return "/super-admin/dashboard";
      if (role === "auditor") return "/auditor/dashboard";
      return "/admin/dashboard";
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Pages vitrine : accessibles uniquement sans session applicative. */
export function isPublicMarketingPath(pathname) {
  const p = pathname === "" ? "/" : pathname;
  if (p === "/") return true;
  return ["/about", "/features", "/contact", "/blog", "/global-news"].includes(p);
}
