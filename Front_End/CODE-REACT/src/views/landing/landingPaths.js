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

/**
 * Carousel auth : scènes de soins (médecin / infirmier / patient), tons cliniques compatibles cyan & bleu template.
 * Unsplash (licence Unsplash) — dégradé CSS en complément dans custom-style (voile primary/secondary/dark).
 */
const AUTH_CAROUSEL_CARE_IMAGES = [
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1600&q=88",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=88",
  "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=88",
];

export function authCarouselSlides() {
  return AUTH_CAROUSEL_CARE_IMAGES.map((src, i) => ({
    src,
    objectPosition: ["center 35%", "center 40%", "center 30%"][i],
  }));
}
