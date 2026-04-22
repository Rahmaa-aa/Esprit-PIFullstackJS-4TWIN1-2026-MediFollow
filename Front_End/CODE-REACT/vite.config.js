import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coreJsEmpty = path.resolve(__dirname, "src/shims/core-js-empty.js");
/** Sources ES6+ du paquet : évite le bundle dist prétranspilé (helpers Babel / audit Lighthouse « Ancien JavaScript »). */
const apexchartsSrc = path.resolve(__dirname, "node_modules/apexcharts/src/apexcharts.js");

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
/** Les sources ApexCharts importent le CSS en « default string » (webpack) ; Vite : `?raw`. */
function apexchartsSourceCssPlugin() {
  const needle = "import apexCSS from './assets/apexcharts.css'";
  const replacement = "import apexCSS from './assets/apexcharts.css?raw'";
  return {
    name: "apexcharts-source-css-raw",
    enforce: "pre",
    transform(code, id) {
      const norm = id.replace(/\\/g, "/");
      if (!norm.includes("apexcharts/src/apexcharts.js")) return null;
      if (!code.includes(needle)) return null;
      return code.replace(needle, replacement);
    },
  };
}

/** Même logique que `landingHeroPreloadPath` dans src (évite d’attendre le bundle JS pour démarrer le fetch LCP). */
function landingHeroPreloadHref(viteBase) {
  const base = (viteBase || "/").replace(/\/+$/, "") || "";
  const p = "assets/images/landing/chu-hero.webp".replace(/^\/+/, "");
  return `${base}/${p}`.replace(/([^:])\/+/g, "$1/");
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

function asyncEntryCssPlugin() {
  return {
    name: "async-entry-css",
    enforce: "post",
    transformIndexHtml(html) {
      return html.replace(
        /<link\s+rel="stylesheet"\s+([^>]*?)href="([^"]*assets\/index-[^"]+\.css)"([^>]*)>/gi,
        (_, _before, href, _after) => {
          const cross = /crossorigin/i.test(`${_before}${_after}`) ? " crossorigin" : "";
          return `<link rel="preload" as="style"${cross} href="${href}" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet"${cross} href="${href}"></noscript>`;
        },
      );
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
      ],
    },
    /** Navigateurs récents : moins de transpilation / polyfills inutiles (audit Lighthouse « Legacy JavaScript »). */
    esbuild: {
      target: "esnext",
      legalComments: "none",
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
      },
    },
    /** Dev : si le front appelle `/api` sur le port Vite, proxifier vers Nest (évite « Cannot GET /api/... »). */
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    plugins: [
      tfjsCoreDualResolve(),
      apexchartsSourceCssPlugin(),
      landingHeroLcpPreloadPlugin(baseUrl),
      react(),
      asyncEntryCssPlugin(),
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
    },
    test: {
      environment: "jsdom",
      globals: true,
    },
  };
});
