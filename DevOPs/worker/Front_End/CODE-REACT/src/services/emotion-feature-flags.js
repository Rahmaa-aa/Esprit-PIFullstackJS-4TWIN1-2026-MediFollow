/**
 * Détection d’émotions pendant l’appel vidéo (TensorFlow.js + face-api.js).
 * En production, désactivée par défaut : le bundle peut mélanger tfjs 4.x et les dépendances
 * internes de face-api.js (tfjs-core 1.x), ce qui provoque des erreurs du type
 * « m is not a function » dans runKernelFunc et peut dégrader toute la session.
 *
 * Désactiver (tous environnements) : VITE_DISABLE_CALL_EMOTION=true
 * Activer en production : VITE_ENABLE_CALL_EMOTION=true
 */
const OPT_OUT =
  import.meta.env.VITE_DISABLE_CALL_EMOTION === "1" ||
  import.meta.env.VITE_DISABLE_CALL_EMOTION === "true";

const OPT_IN =
  import.meta.env.VITE_ENABLE_CALL_EMOTION === "1" ||
  import.meta.env.VITE_ENABLE_CALL_EMOTION === "true";

export function isCallEmotionFeatureEnabled() {
  if (OPT_OUT) return false;
  if (import.meta.env.PROD) return OPT_IN;
  return true;
}
