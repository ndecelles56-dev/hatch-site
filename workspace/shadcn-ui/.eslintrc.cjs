module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  settings: {
    react: { version: 'detect' }
  },
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    // TEMP: relax while building fast
    '@typescript-eslint/no-explicit-any': 'off',
    'react-refresh/only-export-components': 'off',
    'react/prop-types': 'off',

    // Keep useful but noisy hooks rule as a warning
    'react-hooks/exhaustive-deps': 'warn'
  }
}