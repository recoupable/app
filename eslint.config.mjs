import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Flat config, replacing the legacy .eslintrc.json. Next 16 removed `next lint`
// (which was supplying the config resolution), and ESLint 10 drops .eslintrc
// support entirely, so this is the format both tools now expect.
//
// `next/core-web-vitals` + `next/typescript` are the same two rule-sets the old
// .eslintrc.json extended. The third, `plugin:storybook/recommended`, is gone:
// the repo has no .storybook/ directory and no *.stories.* files, so it was
// linting nothing.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next 16 ships the React Compiler era of
    // eslint-plugin-react-hooks, whose correctness rules did not exist in the
    // 14.x config this replaces. They currently report 48 errors across 46
    // files — not rules anyone ignored, rules that arrived today. Each one
    // needs a real effect/ref refactor and reviewing 46 of those inside a
    // tooling PR would be reckless, so they report as warnings for now and are
    // burned down separately. Nothing is silenced: they still print on every
    // run. See recoupable/chat#1929.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  globalIgnores([
    // eslint-config-next's own defaults, which must be restated when overriding.
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Service worker + Workbox runtime emitted by next-pwa at build time. All
    // gitignored (see .gitignore), so linting them only reports on artifacts.
    "public/sw.js",
    "public/sw.js.map",
    "public/workbox-*.js",
    "public/workbox-*.js.map",
  ]),
]);
