import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "next/link": path.resolve(
        __dirname,
        "components/Chat/__tests__/onboardingLinkFixture.tsx",
      ),
    },
  },
  esbuild: { jsx: "automatic" },
  test: {
    include: [
      "components/Chat/__tests__/onboarding.browser.tsx",
      "components/Artists/__tests__/manualProfessional.browser.tsx",
      "components/Artists/__tests__/rosterDialog.browser.tsx",
    ],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
  },
});
