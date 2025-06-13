import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), runtimeErrorOverlay()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      buffer: 'buffer',
    },
  },
  root: path.resolve(__dirname, "./client"),
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer'],
    exclude: ['lucide-react']
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})