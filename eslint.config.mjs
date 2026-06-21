import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const browserGlobals = {
  CustomEvent: 'readonly',
  Event: 'readonly',
  HTMLElement: 'readonly',
  MouseEvent: 'readonly',
  URL: 'readonly',
  document: 'readonly',
  window: 'readonly',
};

export default [
  {
    ignores: [
      'node_modules/**',
      'docs/**',
      'docs-src/**',
      'rollup-config.js',
      'custom-elements.json',
      'web-dev-server.config.js',
    ],
  },
  js.configs.recommended,
  tsPlugin.configs['flat/eslint-recommended'],
  ...tsPlugin.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsParser,
      globals: browserGlobals,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-prototype-builtins': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: [
      '*_test.ts',
      '**/custom_typings/*.ts',
      'packages/labs/ssr/src/test/integration/tests/**',
      'packages/labs/ssr/src/lib/util/parse5-utils.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
