module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin'],
  rules: {
    'max-len': ['error', { code: 120 }],
    indent: ['error', 2],
    'newline-per-chained-call': 'off',
  },
};
