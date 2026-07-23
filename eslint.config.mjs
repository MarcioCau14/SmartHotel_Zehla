import nextCoreWebVitals from "eslint-config-next/core-web-vitals";  
import nextTypescript from "eslint-config-next/typescript";  
import reactHooks from "eslint-plugin-react-hooks";
import { dirname } from "path";  
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);  
const __dirname = dirname(__filename);

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
  },
  {  
  rules: {  
    // TypeScript rules  
    "@typescript-eslint/no-explicit-any": "warn",  
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],  
    "@typescript-eslint/no-non-null-assertion": "off",  
    "@typescript-eslint/ban-ts-comment": "off",  
    "@typescript-eslint/prefer-as-const": "off",  
    "@typescript-eslint/no-unused-disable-directive": "off",  
       
    // React rules  
    "react-hooks/exhaustive-deps": "warn",  
    "react-hooks/purity": "off",  
    "react/no-unescaped-entities": "off",  
    "react/display-name": "off",  
    "react/prop-types": "off",  
    "react-compiler/react-compiler": "off",  
    "react-hooks/set-state-in-effect": "off",  
    "react-hooks/immutability": "off",  
    "react-hooks/refs": "off",  
       
    // Next.js rules  
    "@next/next/no-img-element": "off",  
    "@next/next/no-html-link-for-pages": "off",  
       
    // General JavaScript rules  
    "prefer-const": "error",  
    "no-unused-vars": "off",  
    "no-console": "off",  
    "no-debugger": "off",  
    "no-empty": "off",  
    "no-irregular-whitespace": "off",  
    "no-case-declarations": "off",  
    "no-fallthrough": "off",  
    "no-mixed-spaces-and-tabs": "off",  
    "no-redeclare": "off",  
    "no-undef": "off",  
    "no-unreachable": "off",  
    "no-useless-escape": "off",  
  },  
}, {
  ignores: [  
    "node_modules/**",  
    ".next/**",  
    "out/**",  
    "build/**",  
    "next-env.d.ts",  
    "examples/**",  
    "skills",  
    "ddc_extracted/**",  
    "dist/**",  
    "landing_extracted/**",  
    "staging-zcc-prisma/**",  
    "staging-api-ddc/**",  
    "extract-ddc/**",  
    "tool-results/**",  
    "mini-services/**",  
    "simple-server.js",  
    "start-dev.sh",  
    "deploy.sh",  
    "quick-start.sh",  
  ],  
}];

export default eslintConfig;
