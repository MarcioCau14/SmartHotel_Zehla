import nextTs from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from "eslint/config";
import reactCompiler from "eslint-plugin-react-compiler";


const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Non-source directories
    ".agents/**",
    "BLUEPRINTS/**",
    "INTELLIGENCE/**",
    "temp_api/**",
    "tests/xtress/**",
    "automation/**",
    "packages/**",
    "prisma/seed/**",
    "prisma/seed.js",
    "scratch/**",
    "scripts/**",
    "src/lib/zmg/*.js",
  ]),
  {
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-namespace": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react/no-unescaped-entities": "warn",
      "react-compiler/react-compiler": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);

export default eslintConfig;
