import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const baseUrl = mode == "production" ? env.PUBLIC_URL : "/";

  return {
    base: baseUrl,
    /** Dev : si le front appelle `/api` sur le port Vite, proxifier vers Nest (évite « Cannot GET /api/... »). */
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    plugins: [tfjsCoreDualResolve(), react()],
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
    },
    test: {
      environment: "jsdom",
      globals: true,
    },
  };
});
