/**
 * Id Mongo depuis l’API : chaîne hex ou JSON étendu { $oid }.
 * Évite String(objectId) → "[object Object]" qui casse query / enregistrement.
 */
export function normalizeMongoId(raw) {
  if (raw == null) return "";
  if (typeof raw === "object" && raw !== null && "$oid" in raw) {
    return String(raw.$oid).trim();
  }
  const s = String(raw).trim();
  if (s === "[object Object]") return "";
  return s;
}
