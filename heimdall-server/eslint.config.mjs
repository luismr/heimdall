import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es6,
        ...globals.jest,
      }
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }],
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-vars": "off", // Turn off base rule since we use @typescript-eslint version
    }
  },
  {
    ignores: ["dist/", "node_modules/", "coverage/"]
  }
];
