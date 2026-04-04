import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// Custom plugin to inline CSS
function inlineCSS(): any {
  let cssContent = "";
  return {
    name: "inline-css",
    enforce: "post" as const,
    generateBundle(_options: any, bundle: any) {
      // Find the CSS file
      let cssFilename = "";
      for (const key in bundle) {
        if (key.endsWith(".css")) {
          cssFilename = key;
          break;
        }
      }
      if (cssFilename) {
        cssContent = bundle[cssFilename].source;
        // Don't emit the CSS file
        delete bundle[cssFilename];
      }
    },
    transformIndexHtml(html: string) {
      if (cssContent) {
        // Remove Vite injected CSS link
        let newHtml = html.replace(/<link[^>]+rel="stylesheet"[^>]*>/g, "");
        // Inject inline style
        newHtml = newHtml.replace(
          "</head>",
          `<style>${cssContent}</style>\n</head>`
        );
        return newHtml;
      }
      return html;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr(), ViteImageOptimizer(), inlineCSS()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": [
            "react",
            "react-dom",
            "react-router",
            "react-router-dom",
          ],
          "vendor-motion": ["framer-motion"],
          "vendor-swiper": ["swiper"],
        },
      },
    },
  },
});
