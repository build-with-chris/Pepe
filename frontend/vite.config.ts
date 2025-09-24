import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Workaround für Porsche Cookie Banner Loader
      "@porscheofficial/cookie-consent-banner/loader":
        "@porscheofficial/cookie-consent-banner/dist/loader",
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@porscheofficial/cookie-consent-banner-react"],
    exclude: [
      // Damit esbuild den fehlerhaften Entry nicht anfasst
      "@porscheofficial/cookie-consent-banner/loader",
      // Analytics nicht vorab pre-bundlen – wird on-demand geladen
      "posthog-js",
    ],
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy deps into their own async chunks
          recharts: ["recharts"],
          radix: [
            "@radix-ui/react-tooltip",
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-toggle-group",
          ],
          supabase: ["@supabase/supabase-js"],
          ui_misc: ["sonner"],
          react: ["react", "react-dom"],
          motion: ["framer-motion"],
          embla: ["embla-carousel", "embla-carousel-autoplay"],
          i18n: ["i18next", "react-i18next"],
        },
      },
    },
    // Only a warning threshold; actual size optimised via lazy routes + vendor chunks
    chunkSizeWarningLimit: 1500,
  },
});