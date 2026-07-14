// @ts-check
const { defineConfig } = require('eslint/config');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { require: 'readonly', module: 'readonly' },
    },
  }
);
