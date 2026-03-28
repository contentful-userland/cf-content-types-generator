import oclif from 'eslint-config-oclif';

export default [
  {
    ignores: ['bin/**', 'coverage/**', 'export/**', 'lib/**', 'tmp/**'],
  },
  ...oclif,
  {
    languageOptions: {
      globals: {
        expect: true,
      },
    },
    rules: {
      '@stylistic/arrow-parens': 'off',
      '@stylistic/function-paren-newline': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/lines-between-class-members': 'off',
      '@stylistic/object-curly-spacing': 'off',
      '@stylistic/object-curly-newline': 'off',
      '@stylistic/quotes': 'off',
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/operator-linebreak': [
        'error',
        'after',
        {
          overrides: {
            ':': 'before',
            '?': 'before',
          },
        },
      ],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'arrow-body-style': 'off',
      camelcase: 'off',
      'mocha/consistent-spacing-between-blocks': 'off',
      'mocha/max-top-level-suites': 'off',
      'no-undef': 'off',
      'object-shorthand': 'off',
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-classes': 'off',
      'perfectionist/sort-interfaces': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-object-types': 'off',
      'perfectionist/sort-switch-case': 'off',
      'perfectionist/sort-union-types': 'off',
      'unicorn/import-style': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-export-from': 'off',
      'unicorn/prefer-string-raw': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/switch-case-braces': 'off',
      'unicorn/template-indent': 'off',
    },
  },
  {
    files: ['src/renderer/type/base-content-type-renderer.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
