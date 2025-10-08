module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'import', 'nestjs'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:nestjs/recommended',
    'prettier'
  ],
  rules: {
    'import/no-unresolved': 'off',
    'import/order': [
      'error',
      {
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always'
      }
    ]
  }
};
