import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import promise from 'eslint-plugin-promise';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'release/**',
      '.erb/dll/**',
      'e2e/playwright-report/**',
      'e2e/test-results/**',
      'coverage/**',
      '*.css.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  promise.configs['flat/recommended'],
  // React rules only where React runs — Playwright fixtures also have a
  // function named `use`, which rules-of-hooks would misread as a hook.
  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    ...react.configs.flat.recommended,
  },
  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    ...jsxA11y.flatConfigs.recommended,
  },
  prettierRecommended, // must be last — disables conflicting rules
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json', './e2e/tsconfig.json'],
        },
        node: {},
      },
    },
    rules: {
      'import/no-extraneous-dependencies': 'off',
      // The resolver does not understand every exports-map package; tsc
      // (bundler resolution) is the authority on import validity.
      'import/no-unresolved': ['error', {ignore: ['^@modelcontextprotocol/sdk/']}],
      'import/prefer-default-export': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        {ts: 'never', tsx: 'never', js: 'never', jsx: 'never'},
      ],

      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',

      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Intentional no-op callbacks (catch-ignore, default props) are the
      // only hits — the rule is all noise here.
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none'},
      ],
      // Default-vs-named collisions in rimraf/use-sound/typescript-eslint are
      // upstream naming quirks, not bugs.
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
  {
    // Tests and e2e legitimately use loose typings for mocks and fixtures.
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.mjs', 'e2e/**', 'setupTests.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // Legacy renderer patterns flagged by react-hooks v7's new analyses;
    // scheduled for the Phase 3 component refactor, not blanket-fixable now.
    files: ['src/renderer/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      'import/extensions': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['.erb/**/*', 'postinstall.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
  }
);
