import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  {
    ignores: ['dist/', '.astro/', 'node_modules/', 'playwright-report/', 'test-results/'],
  },

  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  ...astro.configs['flat/recommended'],

  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.astro/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      ...tsPlugin.configs['flat/recommended']
        .filter((c) => c.rules)
        .reduce((acc, c) => ({ ...acc, ...c.rules }), {}),
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  {
    files: ['src/env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
];
