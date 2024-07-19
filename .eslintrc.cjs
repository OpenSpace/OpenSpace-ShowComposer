module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react',
    'react-hooks',
    'prettier',
    '@typescript-eslint',
    'react-refresh',
    'import',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'eslint-config-prettier',
  ],
  rules: {
    'react/prop-types': 0,
    'prefer-const': 0,
    '@typescript-eslint/no-unused-vars': 0,
  },
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'eslint.config.js'],
  globals: {
    Edit: 'writable',
    console: 'writable',
    _: 'writable',
    $: 'writable',
  },
};
