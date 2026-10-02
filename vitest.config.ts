import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
