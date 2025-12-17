import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    ignores: ['**/*.config.ts'],
    languageOptions: {
      parser: tsParser,
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      prettier: prettier,
    },
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'linebreak-style': ['error', 'unix'],
      eqeqeq: ['error', 'always'],
      'prettier/prettier': [
        'error',
        {
          semi: true,
          singleQuote: true,
        },
      ],
    },
  },
];
