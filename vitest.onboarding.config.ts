import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import path from "path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./") } },
  esbuild: { jsx: "automatic" },
  test: {
    include: ["components/Chat/__tests__/onboarding.browser.tsx"],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
  },
});
