import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: {
      react: { version: "18.3" },
      "import/resolver": {
        node: {
          extensions: [".js", ".vue", ".ts", ".d.ts", "jsx", "tsx"],
        },
        alias: {
          extensions: [".vue", ".js", ".ts", ".scss", ".d.ts", "jsx", "tsx"],
          map: [
            ["@/components", "./src/components"],
            ["@/pages", "./src/pages"],
            ["@/router", "./src/router"],
            ["@/global", "./src/global"],
            ["@/styles", "./src/styles"],
            ["@/types", "./src/types"],
            ["@/utils", "./src/utils"],
          ],
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "no-unused-vars": "off",
      "react/prop-types": "off", // Disables the prop-types rule
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];
