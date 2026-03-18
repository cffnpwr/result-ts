import cffnpwrConfig from "@cffnpwr/eslint-config";
import tsEslintParser from "@typescript-eslint/parser";
import gitignore from "eslint-config-flat-gitignore";
import { defineConfig } from "eslint/config";
import globals from "globals";

const files = ["**/*.{js,ts}"];

export default defineConfig([
  gitignore(),
  {
    files,
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tsEslintParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files,
    extends: cffnpwrConfig(),
  },
]);
