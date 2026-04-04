import React from "react";
import { Navigate } from "react-router-dom";

function parseAdminUser() {
  try {
    const raw = localStorage.getItem("adminUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hasValidAdminToken() {
  const t = localStorage.getItem("adminToken");
  return !!(t && t !== "undefined" && t !== "null");
}

/**
 * Espace réservé à la session admin « audit » : jeton admin + rôle auditeur ou super admin.
 * Évite l’accès direct à l’URL pour un admin hospitalier ou sans session.
 */
const AuditorSessionGuard = ({ children }) => {
  const user = parseAdminUser();
  const role = user?.role;
  const allowed = hasValidAdminToken() && (role === "auditor" || role === "superadmin");
  if (!allowed) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  return children;
};

export default AuditorSessionGuard;
