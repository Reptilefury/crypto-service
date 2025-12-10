module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
  ],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'warn',
    'no-unreachable': 'off',
  },
};
