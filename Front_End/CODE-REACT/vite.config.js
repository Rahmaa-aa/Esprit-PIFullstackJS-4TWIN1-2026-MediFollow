import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const baseUrl = mode == "production" ? env.PUBLIC_URL : "/";

  return {
    base: baseUrl,
    plugins: [react()],
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