const globals = require('globals');
const pluginJs = require('@eslint/js');
const eslintPluginUnicorn = require('eslint-plugin-unicorn');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  {
    languageOptions: { globals: globals.node },
    plugins: {
      unicorn: eslintPluginUnicorn
    },
    rules: {
      'unicorn/catch-error-name': 'warn',
      'unicorn/consistent-function-scoping': 'error',
      'unicorn/custom-error-definition': 'off',
      'unicorn/error-message': 'error',
      'unicorn/escape-case': 'error',
      'unicorn/expiring-todo-comments': 'error',
      'unicorn/explicit-length-check': 'error',
      'unicorn/import-index': 'error',
      'unicorn/new-for-builtins': 'error',
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/no-array-instanceof': 'error',
      'unicorn/no-console-spaces': 'error',
      'unicorn/no-fn-reference-in-iterator': 'off',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-hex-escape': 'error',
      'unicorn/no-keyword-prefix': 'off',
      'no-nested-ternary': 'off',
      'unicorn/no-nested-ternary': 'error',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-process-exit': 'error',
      'unicorn/no-unreadable-array-destructuring': 'error',
      'unicorn/no-unsafe-regex': 'off',
      'unicorn/no-unused-properties': 'off',
      'unicorn/no-zero-fractions': 'error',
      'unicorn/number-literal-case': 'error',
      'unicorn/prefer-add-event-listener': 'error',
      'unicorn/prefer-dataset': 'error',
      'unicorn/prefer-event-key': 'error',
      'unicorn/prefer-exponentiation-operator': 'error',
      'unicorn/prefer-flat-map': 'error',
      'unicorn/prefer-node-append': 'error',
      'unicorn/prefer-node-remove': 'error',
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-reflect-apply': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/prefer-starts-ends-with': 'error',
      'unicorn/prefer-text-content': 'error',
      'unicorn/prefer-type-error': 'error',
      'unicorn/regex-shorthand': 'error',
      'unicorn/throw-new-error': 'error',
      'prefer-const': 'error'
    }
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier
];
