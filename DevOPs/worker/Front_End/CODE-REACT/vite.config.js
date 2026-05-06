import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coreJsEmpty = path.resolve(__dirname, "src/shims/core-js-empty.js");
/** Sources ES6+ du paquet : évite le bundle dist prétranspilé (helpers Babel / audit Lighthouse « Ancien JavaScript »). */
const apexchartsSrc = path.resolve(__dirname, "node_modules/apexcharts/src/apexcharts.js");
/** Fichier sous public/ : importer via alias absolu (évite l’avertissement Vite « use /hospital/... » et casse dev). */
const hospitalLandingCss = path.resolve(__dirname, "public/hospital/css/style.css");

/** Racine : @tensorflow/tfjs-core 4.22 (dépendance directe) — utilisé par @tensorflow/tfjs et backends */
const tfjsCore422Root = path.resolve(__dirname, "node_modules/@tensorflow/tfjs-core");
/** face-api.js uniquement : 1.7.0 (overrides → sous face-api.js/node_modules) */
const tfjsCore117Nested = path.resolve(
  __dirname,
  "node_modules/face-api.js/node_modules/@tensorflow/tfjs-core",
);

/**
 * face-api.js → tfjs-core 1.7 imbriqué
 * tout le reste (tfjs, backends webgl/cpu, converter) → tfjs-core 4.22 à la racine
 */
function tfjsCoreDualResolve() {
  return {
    name: "tfjs-core-dual-resolve",
    enforce: "pre",
    resolveId(id, importer) {
      if (id !== "@tensorflow/tfjs-core" && !id.startsWith("@tensorflow/tfjs-core/")) {
        return null;
      }
      const isFaceApi = importer && importer.includes("face-api.js");
      const root = isFaceApi ? tfjsCore117Nested : tfjsCore422Root;
      if (id === "@tensorflow/tfjs-core") {
        return path.join(root, isFaceApi ? "dist/tf-core.esm.js" : "dist/index.js");
      }
      const sub = id.slice("@tensorflow/tfjs-core/".length);
      let file = path.join(root, sub);
      if (!path.extname(file)) {
        if (fs.existsSync(file)) return file;
        if (fs.existsSync(`${file}.js`)) return `${file}.js`;
      }
      return file;
    },
  };
}

/**
 * Remplace le <link rel="stylesheet"> du chunk CSS d’entrée (index-*.css) par preload + onload,
 * pour éviter le blocage du rendu signalé par Lighthouse (chemin critique / LCP).
 */
/**
 * ApexCharts (sources) : `import x from './assets/apexcharts.css'` attend une chaîne (webpack).
 * Vite sert le .css sans export default → erreur. Forcer `?raw` à la résolution (y compris dans optimizeDeps).
 */
function apexchartsCssRawResolvePlugin() {
  return {
    name: "apexcharts-css-raw-resolve",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!importer) return null;
      const imp = importer.replace(/\\/g, "/");
      if (!imp.includes("/apexcharts/")) return null;
      const normSrc = source.replace(/\\/g, "/");
      const isApexCss =
        normSrc === "./assets/apexcharts.css" ||
        normSrc.endsWith("/assets/apexcharts.css") ||
        normSrc.endsWith("/apexcharts.css");
      if (!isApexCss || source.includes("?")) return null;
      const resolved = await this.resolve(source, importer, { skipSelf: true, ...options });
      if (!resolved?.id || resolved.id.includes("?")) return null;
      const rid = resolved.id.replace(/\\/g, "/");
      if (!rid.includes("/apexcharts/")) return null;
      return `${resolved.id}?raw`;
    },
  };
}

/** Même logique que `landingHeroPreloadPath` dans src (évite d’attendre le bundle JS pour démarrer le fetch LCP). */
function landingHeroPreloadHref(viteBase) {
  const base = (viteBase || "/").replace(/\/+$/, "") || "";
  const p = "assets/images/landing/chu-hero.webp".replace(/^\/+/, "");
  return `${base}/${p}`.replace(/([^:])\/+/g, "$1/");
}

/** Chemin public pour un fichier émis dans `dist/` (preload / early hints). */
function viteEmittedAssetHref(viteBase, fileName) {
  const base = (viteBase || "/").replace(/\/+$/, "") || "";
  const f = String(fileName || "").replace(/^\/+/, "");
  return `${base}/${f}`.replace(/([^:])\/+/g, "$1/");
}

/** Chemins servis par Vite en dev : même feuilles que `src/deferred-icon-fonts.js`, découvertes dès le HTML (pas après index-*.js). */
const DEV_DEFERRED_ICON_CSS_HREFS = [
  "/src/assets/vendor/remixicon/fonts/remixicon.css",
  "/src/assets/vendor/phosphor-icons/Fonts/duotone/style.css",
  "/src/assets/vendor/phosphor-icons/Fonts/fill/style.css",
];

const VIEWPORT_META_ANCHOR = '<meta name="viewport" content="width=device-width, initial-scale=1.0" />';

function deferredIconFontAsyncStyleLink(href) {
  return `<link rel="preload" as="style" href="${href}" fetchpriority="low" onload="this.onload=null;this.rel='stylesheet'">\n  <noscript><link rel="stylesheet" href="${href}"></noscript>`;
}

function injectDeferredIconFontsAfterViewport(html, block) {
  if (html.includes(VIEWPORT_META_ANCHOR)) {
    return html.replace(VIEWPORT_META_ANCHOR, `${VIEWPORT_META_ANCHOR}\n  ${block}`);
  }
  return html.replace("</head>", `  ${block}\n</head>`);
}

/**
 * CSS icônes lourdes : lien non bloquant dans le HTML pour ne pas chaîner après le bundle d’entrée (Lighthouse / chemin critique).
 * - dev : 3 feuilles `/src/...` en parallèle du module principal
 * - build : chunk `deferred-icon-fonts-*.css` (entrée Rollup dédiée) + même motif preload → stylesheet
 */
function deferredIconFontsEarlyCssPlugin(viteBase) {
  return {
    name: "deferred-icon-fonts-early-css",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        /* Dev : pas de `bundle` au transform HTML ; en build le bundle est présent. */
        if (!ctx.bundle) {
          const block = DEV_DEFERRED_ICON_CSS_HREFS.map(deferredIconFontAsyncStyleLink).join("\n  ");
          return injectDeferredIconFontsAfterViewport(html, block);
        }
        const bundle = ctx.bundle;
        if (!bundle) return html;
        let cssName = null;
        for (const key of Object.keys(bundle)) {
          if (key.includes("deferred-icon-fonts") && key.endsWith(".css")) {
            cssName = key;
            break;
          }
        }
        if (!cssName) {
          for (const item of Object.values(bundle)) {
            if (
              item &&
              item.type === "asset" &&
              item.fileName?.includes("deferred-icon-fonts") &&
              item.fileName.endsWith(".css")
            ) {
              cssName = item.fileName;
              break;
            }
          }
        }
        if (!cssName) return html;
        const href = viteEmittedAssetHref(viteBase, cssName);
        const block = deferredIconFontAsyncStyleLink(href);
        return injectDeferredIconFontsAfterViewport(html, block);
      },
    },
  };
}

function landingHeroLcpPreloadPlugin(viteBase) {
  const href = landingHeroPreloadHref(viteBase);
  return {
    name: "landing-hero-lcp-preload",
    enforce: "pre",
    transformIndexHtml(html) {
      const link = `<link rel="preload" as="image" href="${href}" fetchpriority="high" />`;
      return html.replace("<meta charset=\"UTF-8\" />", `<meta charset="UTF-8" />\n  ${link}`);
    },
  };
}

/**
 * Vite nomme le CSS d’entrée d’après la *clé* de `rollupOptions.input` (`main` → `main-*.css`,
 * sinon `index-*.css`). Cible donc les CSS importés par les chunks `isEntry` du bundle, et au
 * besoin (pas de bundle, ex. dev) un fallback regex (`main|index`).
 */
function asyncEntryCssPlugin() {
  return {
    name: "async-entry-css",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const entryCssFiles = new Set();
        const bundle = ctx?.bundle;
        if (bundle) {
          for (const item of Object.values(bundle)) {
            if (
              item &&
              item.type === "chunk" &&
              item.isEntry &&
              /* Cette feuille est déjà chargée en non-bloquant par `deferredIconFontsEarlyCssPlugin`. */
              item.name !== "deferred-icon-fonts" &&
              item.viteMetadata?.importedCss
            ) {
              for (const css of item.viteMetadata.importedCss) {
                entryCssFiles.add(css);
              }
            }
          }
        }

        return html.replace(
          /<link\s+rel="stylesheet"\s+([^>]*?)href="([^"]+\.css)"([^>]*)>/gi,
          (match, before, href, after) => {
            let isEntryCss = false;
            if (entryCssFiles.size > 0) {
              for (const css of entryCssFiles) {
                if (href.endsWith(css) || href.includes(`/${css}`)) {
                  isEntryCss = true;
                  break;
                }
              }
            } else {
              isEntryCss = /\/assets\/(?:main|index)-[^/"]+\.css$/.test(href);
            }
            if (!isEntryCss) return match;
            const cross = /crossorigin/i.test(`${before}${after}`) ? " crossorigin" : "";
            return `<link rel="preload" as="style"${cross} href="${href}" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet"${cross} href="${href}"></noscript>`;
          },
        );
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const baseUrl = mode === "production" ? env.PUBLIC_URL || "/" : "/";

  return {
    base: baseUrl,
    resolve: {
      alias: [
        {
          find: /^core-js\/(modules|es|features|stable|web)\/.+$/,
          replacement: coreJsEmpty,
        },
        { find: /^apexcharts$/, replacement: apexchartsSrc },
        { find: /^hospital-landing-styles$/, replacement: hospitalLandingCss },
      ],
    },
    /** Navigateurs récents : moins de transpilation / polyfills inutiles (audit Lighthouse « Legacy JavaScript »). */
    esbuild: {
      target: "esnext",
      legalComments: "none",
    },
    optimizeDeps: {
      /** Sinon esbuild pré-bundle `apexcharts.css` sans `?raw` → « does not provide an export named 'default' ». */
      exclude: ["apexcharts"],
      esbuildOptions: {
        target: "esnext",
      },
    },
    /** Dev : si le front appelle `/api` sur le port Vite, proxifier vers Nest (évite « Cannot GET /api/... »). */
    server: {
      watch: {
        /** Évite rechargements / états incohérents si `vite build` met à jour dist pendant `vite dev`. */
        ignored: ["**/dist/**"],
      },
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    plugins: [
      tfjsCoreDualResolve(),
      apexchartsCssRawResolvePlugin(),
      landingHeroLcpPreloadPlugin(baseUrl),
      react(),
      asyncEntryCssPlugin(),
      deferredIconFontsEarlyCssPlugin(baseUrl),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: [
            "legacy-js-api",
            "import",
            "if-function",
            "color-functions",
            "global-builtin",
          ],
        },
      },
    },
    build: {
      outDir: "dist",
      minify: true,
      target: "esnext",
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          "deferred-icon-fonts": path.resolve(__dirname, "src/deferred-icon-fonts.js"),
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
    },
  };
});
