import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    exclude: [
      "node_modules/**",
      "**/vitest.config.ts",
    ],
  },
});
