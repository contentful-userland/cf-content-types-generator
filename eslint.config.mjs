import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['bin/**', 'coverage/**', 'export/**', 'lib/**', 'tmp/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,cjs,mjs,ts}'],
    languageOptions: {
      globals: {
        expect: true,
      },
    },
    rules: {
      semi: ['error', 'always'],
    },
  },
  {
    files: ['jest.config.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
      },
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['src/renderer/type/base-content-type-renderer.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
