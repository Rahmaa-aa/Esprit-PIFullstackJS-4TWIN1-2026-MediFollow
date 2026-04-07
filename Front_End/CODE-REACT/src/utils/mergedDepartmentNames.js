import { HOSPITAL_DEPARTMENTS } from "../constants/hospitalDepartments";
import { departmentApi } from "../services/api";

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
