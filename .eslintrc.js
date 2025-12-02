module.exports = {
    env: {
        node: true,
        es2021: true
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: 12,
        sourceType: "module"
    },
    rules: {
        // Ошибки и предупреждения
        "no-unused-vars": "warn",
        "no-undef": "error",
        "no-extra-semi": "error",
        "semi": ["error", "never"],

        // Пробелы и отступы
        "indent": ["error", 2],
        "space-infix-ops": "error",
        "object-curly-spacing": ["error", "always"],
        "comma-spacing": ["error", { "before": false, "after": true }],

        // Строки
        "quotes": ["error", "single"],

        // Стрелочные функции
        "arrow-spacing": ["error", { "before": true, "after": true }],

        // Общие практики
        "no-multiple-empty-lines": ["error", { "max": 1 }],
        "padded-blocks": ["error", "never"],
        "eol-last": ["error", "always"]
    }
};
