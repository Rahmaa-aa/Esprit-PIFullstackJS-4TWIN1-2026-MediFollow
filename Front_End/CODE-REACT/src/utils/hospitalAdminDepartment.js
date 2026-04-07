import { departmentApi } from "../services/api";

/** Département effectif pour un JWT admin hospitalier (résumé API, sinon champ profil). */
export async function fetchHospitalAdminDepartmentName() {
    try {
        const rows = await departmentApi.summary();
        if (Array.isArray(rows) && rows.length && rows[0]?.name) {
            return String(rows[0].name).trim();
        }
    } catch {
        /* ignore */
    }
    try {
        const u = JSON.parse(localStorage.getItem("adminUser") || "null");
        if (u?.role === "admin" && u?.department) return String(u.department).trim();
    } catch {
        /* ignore */
    }
    return "";
}
