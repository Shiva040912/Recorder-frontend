import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "Recorder",
        short_name: "Recorder",
        description: "Personal daily work tracker",
        theme_color: "#07070a",
        background_color: "#07070a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
      },
    }),
  ],
});