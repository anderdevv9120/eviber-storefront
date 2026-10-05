import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-plugin-prettier/recommended";

export default defineConfig([
  ...nextVitals,
  prettier,
  {
    rules: {
      "react/display-name": "off",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "prettier/prettier": ["warn", { endOfLine: "auto" }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "storybook/**",
    ".storybook/**",
    "**/*.stories.*",
  ]),
]);
