module.exports = {
    root: true,
    env: {},
    ignorePatterns: [ "dist", "node_modules" ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: [ "./tsconfig.json" ],
        tsconfigRootDir: __dirname,
    },
    plugins: [
        "@stylistic",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
    ],
    rules: {
        "@stylistic/member-delimiter-style": [ "error", { "multiline": { "delimiter": "semi" }, "singleline": { "delimiter": "semi" } } ],
        "@stylistic/quotes": [ "error", "double", { "avoidEscape": true } ],
        "@stylistic/semi": [ "error", "always" ],
        "@typescript-eslint/consistent-type-definitions": [ "error", "type" ],
        "@typescript-eslint/prefer-nullish-coalescing": [ "error", { "ignoreConditionalTests": true, "ignoreMixedLogicalExpressions": true } ],
        "@typescript-eslint/restrict-template-expressions": "off",
    }
}
