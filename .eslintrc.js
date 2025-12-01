module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    // Полезные строгие правила:
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'no-console': 'off',
    'no-empty': 'warn',
    'no-extra-semi': 'warn',
    'no-multiple-empty-lines': ['warn', { max: 2 }],
    'prefer-const': 'error',

    // Backend safety
    'no-return-await': 'off',
    'no-await-in-loop': 'warn',

    // Промисы
    'no-promise-executor-return': 'off',
    'no-useless-catch': 'warn',
  }
}
