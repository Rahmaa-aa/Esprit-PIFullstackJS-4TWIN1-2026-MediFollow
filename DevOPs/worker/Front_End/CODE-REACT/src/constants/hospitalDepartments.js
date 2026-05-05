/** Slug stable pour les clés i18n `editPatient.departments.<slug>`. */
export function departmentSlug(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, "_")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/** Libellé localisé (même logique que le formulaire patient). */
export function hospitalDepartmentLabel(name, t) {
  if (!name) return "";
  const slug = departmentSlug(name);
  return t(`editPatient.departments.${slug}`, { defaultValue: name });
}

/** Liste des départements / services hospitaliers (création utilisateurs & filtres). */
export const HOSPITAL_DEPARTMENTS = [
  "Cardiologie",
  "Chirurgie",
  "Chirurgie orthopédique",
  "Dermatologie",
  "Endocrinologie",
  "Gastro-entérologie",
  "Gynécologie",
  "Médecine interne",
  "Neurologie",
  "Ophtalmologie",
  "ORL",
  "Pédiatrie",
  "Pneumologie",
  "Psychiatrie",
  "Radiologie",
  "Réanimation",
  "Rhumatologie",
  "Urologie",
  "Urgences",
  "Bloc opératoire",
  "Dialyse",
  "Gériatrie",
  "Oncologie",
];
