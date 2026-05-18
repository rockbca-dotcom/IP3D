import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules", ".next", "prisma", "tests/helpers"],
    },
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/helpers/env.ts"],
  },
});
