import { HOSPITAL_DEPARTMENTS } from "../constants/hospitalDepartments";
import { api, departmentApi } from "../services/api";

/**
 * Liste départements : défaut + catalogue API (créations super admin) + données existantes.
 */
export async function fetchMergedDepartmentNames() {
  try {
    const res = await departmentApi.catalog();
    const names = Array.isArray(res?.names) ? res.names : [];
    const set = new Set([...HOSPITAL_DEPARTMENTS, ...names]);
    return [...set].sort((a, b) => a.localeCompare(b, "fr"));
  } catch {
    return [...HOSPITAL_DEPARTMENTS];
  }
}

/** Conserve une valeur déjà enregistrée absente du catalogue chargé. */
export function mergeDepartmentOptionsForValue(baseList, currentValue) {
  const v = currentValue && String(currentValue).trim();
  if (!v) return baseList;
  if (baseList.includes(v)) return baseList;
  return [...baseList, v].sort((a, b) => a.localeCompare(b, "fr"));
}

/**
 * Départements issus de la base (GET /departments/catalog) sans fusion avec la liste statique,
 * en excluant ceux qui ont déjà un coordinateur de soins (un autre compte).
 * @param {{ excludeCoordinatorId?: string }} opts — en édition, exclure l’utilisateur courant pour conserver son département dans la liste.
 */
export async function fetchAvailableCoordinatorDepartments(opts = {}) {
  const excludeId =
    opts.excludeCoordinatorId != null && opts.excludeCoordinatorId !== ""
      ? String(opts.excludeCoordinatorId)
      : null;
  const [catalogRes, coordsRes] = await Promise.all([
    api.getWithAdminToken("/departments/catalog"),
    api.getWithAdminToken("/auth/care-coordinators"),
  ]);
  const raw = Array.isArray(catalogRes?.names) ? catalogRes.names : [];
  const names = [...new Set(raw.map((n) => String(n).trim()).filter(Boolean))];
  const coords = Array.isArray(coordsRes) ? coordsRes : [];
  const taken = new Set();
  for (const c of coords) {
    if (excludeId && String(c.id) === excludeId) continue;
    const d = String(c.department || c.specialty || "").trim();
    if (d) taken.add(d);
  }
  return names.filter((n) => !taken.has(n)).sort((a, b) => a.localeCompare(b, "fr"));
}

/** Uniquement les entrées department_catalog (GET /departments/catalog/names-only). */
export async function fetchCatalogDepartmentNamesOnly() {
  try {
    const res = await departmentApi.catalogNamesOnly();
    const names = Array.isArray(res?.names) ? res.names : [];
    return names;
  } catch {
    return [];
  }
}
