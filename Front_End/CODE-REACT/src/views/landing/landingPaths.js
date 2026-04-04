export const LANDING_LANGS = [
  { code: "en", labelKey: "lang.english" },
  { code: "fr", labelKey: "lang.french" },
  { code: "ar", labelKey: "lang.arabic" },
];

export const LANDING_FLAG_WIDTH = 36;
export const LANDING_PARTNERSHIP_FLAG_WIDTH = 32;

export function generatePath(path) {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "") || "";
  const p = (path || "").replace(/^\/+/, "");
  const url = `${window.origin}${base}/${p}`;
  return url.replace(/([^:])\/\/+/g, "$1/");
}

export function landingImg(name) {
  return generatePath(`assets/images/landing/${name}`);
}
