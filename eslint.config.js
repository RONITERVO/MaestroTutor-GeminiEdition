import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const restrictedFeatureImports = [
  "**/features/*/components/*",
  "**/features/*/hooks/*",
  "**/features/*/services/*",
  "**/features/*/utils/*",
  "../features/*/components/*",
  "../features/*/hooks/*",
  "../features/*/services/*",
  "../features/*/utils/*",
];

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.{ts,tsx}"] ,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: restrictedFeatureImports,
              message: "Import from the feature index instead of internals.",
            },
          ],
        },
      ],
    },
  },
];
