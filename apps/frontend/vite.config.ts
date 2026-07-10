import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    // En Docker sobre Windows los eventos de archivo no llegan; se usa polling,
    // pero con intervalo e ignores para no castigar OneDrive/CPU.
    watch: {
      usePolling: process.env.VITE_USE_POLLING !== "false",
      interval: Number(process.env.VITE_POLLING_INTERVAL ?? 1000),
      ignored: ["**/.git/**", "**/node_modules/**", "**/dist/**", "**/coverage/**"]
    },
    // La app se sirve tras nginx en el puerto 80: el cliente HMR se conecta ahi.
    hmr: { clientPort: 80 }
  }
});