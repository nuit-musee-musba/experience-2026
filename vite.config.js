import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import path from "path";

export default defineConfig({
  // Port distinct du projet kiosque pour pouvoir faire tourner les deux
  // en parallèle.
  server: {
    port: 5180,
    strictPort: false,
  },
  plugins: [vue(), svgLoader()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/_variables.scss" as *;
          @use "@/styles/_colors.scss" as *;
          @use "@/styles/_typography.scss" as *;
          @use "@/styles/_easings.scss" as *;
          @use "@/styles/_utils.scss" as *;
        `,
      },
    },
  },
});
