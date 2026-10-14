import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Isse Vite doosri port par nahi jayega, error de dega agar 5173 busy hogi
  },
});
